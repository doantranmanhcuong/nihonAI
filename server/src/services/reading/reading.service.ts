import dns from 'dns';
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {}
import { prisma } from '../../core/prisma.service';
import crypto from 'crypto';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { RedisService } from '../../core/redis.service';
import { ReadingAiService } from './reading-ai.service';
import { ReadingQuotaService } from './reading-quota.service';
import { TtsService } from './tts.service';

export class ReadingService {
  // 1. Chống trùng lặp song song (Single-Flight Lock / Thundering Herd Prevention)
  private static crawlInFlight = new Map<string, Promise<any>>();
  private static audioInFlight = new Set<string>();

  // 2. Bộ điều tiết luồng xử lý đồng thời (Concurrency Throttling / Job Limiter)
  // Giới hạn tối đa 3 tác vụ AI/Cheerio cùng cào đồng thời để bảo vệ Rate Limit Gemini & MySQL
  private static activeCrawls = 0;
  private static readonly MAX_CONCURRENT_CRAWLS = 3;
  private static crawlQueue: Array<{
    task: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  /**
   * Đưa tác vụ cào vào hàng đợi điều tiết tải (Semaphore / Concurrency Limiter)
   */
  private static enqueueCrawl<T>(task: () => Promise<T>): Promise<T> {
    if (this.activeCrawls < this.MAX_CONCURRENT_CRAWLS) {
      this.activeCrawls++;
      return (async () => {
        try {
          return await task();
        } finally {
          this.activeCrawls--;
          this.processNextInCrawlQueue();
        }
      })();
    }

    // Nếu hàng đợi đã có hơn 20 người cùng chờ
    if (this.crawlQueue.length >= 20) {
      throw new Error('Hệ thống đang phục vụ số lượng lớn bài đọc cùng lúc. Vui lòng thử lại sau 30 giây!');
    }

    return new Promise<T>((resolve, reject) => {
      this.crawlQueue.push({ task, resolve, reject });
    });
  }

  private static processNextInCrawlQueue() {
    if (this.activeCrawls >= this.MAX_CONCURRENT_CRAWLS || this.crawlQueue.length === 0) {
      return;
    }
    const next = this.crawlQueue.shift();
    if (!next) return;

    this.activeCrawls++;
    (async () => {
      try {
        const res = await next.task();
        next.resolve(res);
      } catch (err) {
        next.reject(err);
      } finally {
        this.activeCrawls--;
        this.processNextInCrawlQueue();
      }
    })();
  }

  /**
   * Chuẩn hóa URL, loại bỏ các tham số tracking để đối chiếu trùng lặp chuẩn xác
   */
  static normalizeUrl(url: string): string {
    try {
      const u = new URL(url.trim());
      u.searchParams.delete('utm_source');
      u.searchParams.delete('utm_medium');
      u.searchParams.delete('utm_campaign');
      u.searchParams.delete('utm_term');
      u.searchParams.delete('utm_content');
      u.searchParams.delete('fbclid');
      u.searchParams.delete('ref');
      u.searchParams.delete('display');
      u.searchParams.delete('page');
      u.hash = '';
      return u.toString();
    } catch {
      return url.trim();
    }
  }

  /**
   * Dọn dẹp các bài báo cũ (> 14 ngày) và bài báo bị tường rào bản quyền NHK ONE để CSDL luôn gọn gàng
   */
  static async cleanupStaleArticles(retentionDays = 14): Promise<{ deletedCount: number }> {
    // 0. Luôn xóa ngay các bài báo bị dính thông báo hợp đồng thuê bao NHK ONE (放送法に基づき契約が必要です)
    const corruptedNhkArticles = await prisma.readingArticle.findMany({
      where: {
        sentences: {
          some: {
            sentenceJp: { contains: '放送法に基づき契約が必要です' }
          }
        }
      },
      select: { id: true }
    });

    if (corruptedNhkArticles.length > 0) {
      await prisma.readingArticle.deleteMany({
        where: { id: { in: corruptedNhkArticles.map((a) => a.id) } }
      });
      await RedisService.delPrefix('reading:list:');
      console.log(`[DB GC] Đã xóa ${corruptedNhkArticles.length} bài báo NHK lỗi tường rào thuê bao.`);
    }

    const totalPublic = await prisma.readingArticle.count({ where: { isPublic: true } });
    if (totalPublic <= 6) {
      return { deletedCount: corruptedNhkArticles.length };
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const staleArticles = await prisma.readingArticle.findMany({
      where: {
        createdAt: { lt: cutoffDate },
        viewCount: { lt: 50 },
        savedCount: 0,
        vocabSavedCount: 0,
        isEvergreen: false
      },
      select: { id: true, audioUrl: true }
    });

    if (staleArticles.length === 0) {
      return { deletedCount: corruptedNhkArticles.length };
    }

    const ids = staleArticles.map((a) => a.id);
    
    // 1. Storage Cleanup (Garbage Collection cho ổ cứng)
    const fsPath = require('path');
    const fsSync = require('fs');
    for (const article of staleArticles) {
      if (article.audioUrl && article.audioUrl.startsWith('/')) {
        try {
          const filePath = fsPath.join(process.cwd(), 'public', article.audioUrl);
          if (fsSync.existsSync(filePath)) {
            fsSync.unlinkSync(filePath);
            console.log(`[Storage GC] Deleted audio file: ${filePath}`);
          }
        } catch (e) {
          // File might not exist, ignore
        }
      }
    }

    // 2. Database Cleanup (Vì đã cấu hình onDelete: Cascade ở Schema, xóa Article sẽ tự động dọn sạch rác liên quan)
    const result = await prisma.readingArticle.deleteMany({
      where: { id: { in: ids } }
    });

    await RedisService.delPrefix('reading:list:');
    console.log(`[DB GC] Đã dọn dẹp ${result.count} bài báo cũ (> ${retentionDays} ngày).`);
    return { deletedCount: result.count + corruptedNhkArticles.length };
  }
  /**
   * Lấy danh sách bài đọc từ Thư Viện Dùng Chung (Community Public Library)
   * 0 Token tiêu tốn! Hỗ trợ lọc theo level, topic, sourceType và bộ đệm Redis.
   */
  static async listArticles(params: {
    level?: string;
    topic?: string;
    sourceType?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const cacheKey = `reading:list:${params.level || 'ALL'}:${params.topic || 'ALL'}:${params.sourceType || 'ALL'}:${params.search || ''}:${page}:${limit}`;
    const { data } = await RedisService.getOrSet(
      cacheKey,
      async () => {
        const where: any = { isPublic: true };

        if (params.level && params.level !== 'ALL') {
          where.level = params.level.toUpperCase();
        }
        if (params.topic && params.topic !== 'ALL') {
          where.topic = params.topic;
        }
        if (params.sourceType && params.sourceType !== 'ALL') {
          where.sourceType = params.sourceType;
        }
        if (params.search && params.search.trim().length > 0) {
          where.title = { contains: params.search.trim() };
        }

        const [total, rawItems] = await Promise.all([
          prisma.readingArticle.count({ where }),
          prisma.readingArticle.findMany({
            where,
            skip,
            take: Math.min(80, limit + 20),
            orderBy: [{ createdAt: 'desc' }],
            select: {
              id: true,
              title: true,
              sourceType: true,
              sourceUrl: true,
              youtubeId: true,
              level: true,
              topic: true,
              durationSeconds: true,
              audioUrl: true,
              totalWords: true,
              isPublic: true,
              createdBy: true,
              viewCount: true,
              createdAt: true,
              updatedAt: true,
              imageUrl: true,
              isEvergreen: true,
              savedCount: true,
              vocabSavedCount: true,
              _count: {
                select: {
                  sentences: true,
                  vocabularies: true,
                  grammars: true
                }
              }
            }
          })
        ]);

        // Lọc trùng lặp phòng vệ theo URL chuẩn hóa hoặc tiêu đề tiếng Nhật
        const seenKeys = new Set<string>();
        const items: typeof rawItems = [];
        for (const it of rawItems) {
          if (it.sourceUrl && it._count.sentences < 4) continue;
          const key = it.sourceUrl
            ? `url:${this.normalizeUrl(it.sourceUrl)}`
            : `title:${it.title.split('(')[0].trim().slice(0, 80)}`;
          if (seenKeys.has(key)) continue;
          seenKeys.add(key);
          items.push(it);
          if (items.length >= limit) break;
        }

        return {
          items,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit))
          }
        };
      },
      300 // Cache 5 phút
    );

    return data;
  }

  /**
   * Lấy chi tiết bài đọc (Bao gồm câu karaoke, từ vựng, ngữ pháp, trắc nghiệm)
   * Có bộ đệm Redis hot cache (< 5ms)
   */
  static async getArticleDetail(articleId: string): Promise<any> {
    const cacheKey = `reading:article:${articleId}`;

    // 1. Đọc từ Redis Cache trước
    const cached = await RedisService.get<any>(cacheKey);
    if (cached.data) {
      // Tăng view count async
      prisma.readingArticle
        .update({
          where: { id: articleId },
          data: { viewCount: { increment: 1 } }
        })
        .catch(() => {});
      return cached.data;
    }

    // 2. Đọc từ MySQL
    const article = await prisma.readingArticle.findUnique({
      where: { id: articleId },
      include: {
        sentences: {
          orderBy: { orderIndex: 'asc' }
        },
        vocabularies: true,
        grammars: true,
        quizzes: true
      }
    });

    if (!article) {
      return null;
    }

    // Tự động làm sạch các câu bị nhiễm tiêu đề sidebar rác hoặc nhà tài trợ GIGAZINE đã lưu từ trước
    const contaminatedPatterns = [
      'これまでGIGAZINEを支援してくれた',
      'メンバーのリスト',
      'ご存じの通り価格高騰',
      'サーバー運営がとても苦しい',
      '回線や台数を整理し見直せる部分',
      'やはりまだ危険水域です',
      'Live: Microsoft outage',
      'downdetector.com',
      'abc.net.au',
      '米・ロ・ウクライナ',
      'G7 外相会合',
      'COP31 首脳級会合',
      'COP31首脳級会合',
      'フィリピン外相',
      '円相場1ドル=',
      '円相場 一時1ドル＝',
      'あわせて読みたい',
      '深掘りコンテンツ',
      '新着ニュース一覧'
    ];
    if (article.sentences && article.sentences.some(s => contaminatedPatterns.some(p => s.sentenceJp.includes(p)))) {
      article.sentences = article.sentences.filter(s => !contaminatedPatterns.some(p => s.sentenceJp.includes(p)));
      const cleanCorpus = article.sentences.map(s => s.sentenceJp).join('\n');
      if (article.vocabularies) {
        const orphanVocabIds = article.vocabularies
          .filter(v => !cleanCorpus.includes(v.word) && ['支援', '価格高騰', '危険水域', '回線', '状態', '整理'].some(j => v.word.includes(j)))
          .map(v => v.id);
        if (orphanVocabIds.length > 0) {
          article.vocabularies = article.vocabularies.filter(v => !orphanVocabIds.includes(v.id));
          prisma.readingVocabItem.deleteMany({ where: { id: { in: orphanVocabIds } } }).catch(() => {});
        }
      }
      prisma.readingSentence.deleteMany({
        where: {
          articleId,
          OR: contaminatedPatterns.map(p => ({ sentenceJp: { contains: p } }))
        }
      }).catch(() => {});
    }

    // Tạo âm thanh neural MP3 chạy nền không chặn phản hồi nếu bài đọc chưa có file audio
    if (!article.audioUrl && article.sentences && article.sentences.length > 0) {
      this.ensureArticleAudioAsync(article.id, article.sentences);
    }

    // Format quiz options from JSON
    const formattedArticle = {
      ...article,
      quizzes: article.quizzes.map((q) => ({
        ...q,
        options: (() => {
          try {
            return JSON.parse(q.optionsJson);
          } catch {
            return [];
          }
        })(),
        optionsVi: (() => {
          try {
            return q.optionsViJson ? JSON.parse(q.optionsViJson) : [];
          } catch {
            return [];
          }
        })()
      }))
    };

    // Cache trong 1 giờ
    await RedisService.set(cacheKey, formattedArticle, 3600);

    // Tăng lượt xem
    await prisma.readingArticle.update({
      where: { id: articleId },
      data: { viewCount: { increment: 1 } }
    });

    return formattedArticle;
  }

  /**
   * Tạo bài đọc AI mới (có kiểm tra rate limit 5 bài/ngày)
   */
  static async createAiArticle(params: {
    userId?: string;
    level: string;
    topic: string;
    customRequirement?: string;
    providedText?: string;
  }) {
    const userId = params.userId || 'guest_user';

    // (Quota check remains for generated custom articles)
    // 1. Kiểm tra và trừ 1 lượt Quota

    const quotaResult = await ReadingQuotaService.consumeQuota(userId);
    if (!quotaResult.success) {
      throw new Error(
        `QUOTA_EXCEEDED: Bạn đã sử dụng hết 5 lượt tạo bài đọc AI hôm nay. Vui lòng luyện tập với các bài đọc có sẵn trong Thư Viện!`
      );
    }

    // 2. Gọi Gemini 3.5 Flash Lite với Single-Pass Prompt
    const generated = await ReadingAiService.generateDokkaiArticle({
      level: params.level,
      topic: params.topic,
      customRequirement: params.customRequirement,
      providedText: params.providedText
    });
    const tempId = crypto.randomUUID();
    let audioData: { audioUrl: string | null; timings: {startTimeMs: number; endTimeMs: number}[] } = { audioUrl: null, timings: [] };
    try {
      audioData = await TtsService.generateArticleAudio(tempId, generated.sentences.map(s => s.sentenceJp));
    } catch(e) { console.error('TTS Error', e); }


    const defaultTopicImages: Record<string, string> = {
      N5: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=600&q=80',
      N4: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80',
      N3: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
      N2: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=600&q=80',
      N1: 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&w=600&q=80'
    };

    // 3. Lưu vào MySQL (Chung CSDL, chuẩn 1 - N)
    const newArticle = await prisma.readingArticle.create({
      data: {
          id: tempId,
          audioUrl: audioData.audioUrl,
          durationSeconds: audioData.timings.length > 0 ? Math.ceil(audioData.timings[audioData.timings.length - 1].endTimeMs / 1000) : 0,
          title: generated.title,
        sourceType: params.providedText ? 'USER_TEXT' : 'AI_GENERATED',
        level: generated.level || params.level,
        topic: generated.topic || params.topic,
        totalWords: generated.totalWords || 200,
        imageUrl: (params as any).imageUrl || defaultTopicImages[generated.level || params.level] || 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=600&q=80',
        isPublic: true, // Chia sẻ vào kho bài đọc chung
        createdBy: userId,
        sentences: {
          createMany: {
            data: generated.sentences.map((s, idx) => ({
              orderIndex: s.orderIndex,
              sentenceJp: s.sentenceJp,
              sentenceVi: s.sentenceVi,
              furigana: s.furigana || null,
              startTimeMs: audioData.timings[idx]?.startTimeMs || 0,
              endTimeMs: audioData.timings[idx]?.endTimeMs || 2000
            }))
          }
        },
        vocabularies: {
          create: generated.vocabularies.map((v) => ({
            word: v.word || 'Chưa có từ',
            reading: v.reading || 'Chưa có cách đọc',
            hanViet: v.hanViet || null,
            meaningVi: v.meaningVi || 'Chưa có nghĩa',
            level: v.level || params.level
          }))
        },
        grammars: {
          create: generated.grammars.map((g) => ({
            grammarPoint: g.grammarPoint || 'Chưa có ngữ pháp',
            level: g.level || params.level,
            meaningVi: g.meaningVi || 'Chưa có giải thích',
            excerpt: g.excerpt || ''
          }))
        },
        quizzes: {
          create: generated.quizzes.map((q) => ({
            question: q.question,
            questionVi: (q as any).questionVi || null,
            optionsJson: JSON.stringify(q.options),
            optionsViJson: (q as any).optionsVi ? JSON.stringify((q as any).optionsVi) : null,
            correctIndex: q.correctIndex,
            explanation: q.explanation,
            questionType: q.questionType
          }))
        }
      },
      include: {
        sentences: { orderBy: { orderIndex: 'asc' } },
        vocabularies: true,
        grammars: true,
        quizzes: true
      }
    });

    await RedisService.delPrefix('reading:list:');

    return {
      article: {
        ...newArticle,
        quizzes: newArticle.quizzes.map((q) => ({
          ...q,
          options: (() => {
            try {
              return JSON.parse(q.optionsJson);
            } catch {
              return [];
            }
          })()
        }))
      },
      quota: quotaResult.status
    };
  }

  /**
   * Sinh thêm hoặc lấy thêm câu hỏi luyện tập cho bài đọc đã có
   * DB-First: Ưu tiên lấy câu hỏi chưa hiển thị trong CSDL trước khi dùng AI để sinh.
   * Khi sinh câu hỏi mới bằng AI, đảm bảo khác các câu hỏi hiện tại và LƯU LẠI vào CSDL.
   */
  static async addMoreQuizzes(articleId: string, count = 3, currentQuizIds: string[] = []) {
    const article = await prisma.readingArticle.findUnique({
      where: { id: articleId },
      include: {
        sentences: { orderBy: { orderIndex: 'asc' } },
        quizzes: true
      }
    });

    if (!article) {
      throw new Error(`Article ${articleId} not found.`);
    }

    // 1. Kiểm tra CSDL trước: Tìm các câu hỏi của bài đọc này mà CHƯA nằm trong currentQuizIds
    const availableInDb = await prisma.readingQuiz.findMany({
      where: {
        articleId,
        id: { notIn: currentQuizIds }
      }
    });

    let resultQuizzes: any[] = [];

    // Nếu trong CSDL có sẵn câu hỏi chưa hiện trên màn hình
    if (availableInDb.length > 0) {
      const takeCount = Math.min(count, availableInDb.length);
      const chosenFromDb = availableInDb.slice(0, takeCount);
      resultQuizzes = chosenFromDb.map((q) => ({
        ...q,
        options: (() => {
          try {
            return JSON.parse(q.optionsJson);
          } catch {
            return [];
          }
        })(),
        optionsVi: (() => {
          try {
            return q.optionsViJson ? JSON.parse(q.optionsViJson) : [];
          } catch {
            return [];
          }
        })()
      }));
    }

    // 2. Nếu số lượng trong CSDL chưa đủ 'count', dùng AI để sinh thêm phần còn thiếu
    const neededFromAi = count - resultQuizzes.length;
    if (neededFromAi > 0) {
      // Tập hợp tất cả câu hỏi đã có (cả cũ trong bài và trong DB) để đưa vào negative prompt
      const existingQuestionTexts = article.quizzes.map((q) => q.question);

      const generatedFromAi = await ReadingAiService.generateMoreQuizzesForArticle(
        article,
        neededFromAi,
        existingQuestionTexts
      );

      // Lưu các câu hỏi mới vào MySQL CSDL để lần sau tái sử dụng (tiết kiệm token & tức thì)
      for (const rawQ of generatedFromAi) {
        // Xáo trộn vị trí các đáp án để không cố định ở 1 chỗ
        const items = rawQ.options.map((opt, idx) => ({
          opt,
          optVi: rawQ.optionsVi?.[idx],
          isCorrect: idx === rawQ.correctIndex
        }));
        for (let i = items.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [items[i], items[j]] = [items[j], items[i]];
        }
        const shuffledCorrectIndex = Math.max(0, items.findIndex((it) => it.isCorrect));
        const shuffledOptions = items.map((it) => it.opt);
        const shuffledOptionsVi = items.some((it) => it.optVi) ? items.map((it) => it.optVi || '') : rawQ.optionsVi;

        const saved = await prisma.readingQuiz.create({
          data: {
            articleId: article.id,
            question: rawQ.question,
            questionVi: rawQ.questionVi || null,
            optionsJson: JSON.stringify(shuffledOptions),
            optionsViJson: shuffledOptionsVi ? JSON.stringify(shuffledOptionsVi) : null,
            correctIndex: shuffledCorrectIndex,
            explanation: rawQ.explanation,
            questionType: rawQ.questionType
          }
        });

        resultQuizzes.push({
          ...saved,
          options: shuffledOptions,
          optionsVi: shuffledOptionsVi || []
        });
      }

      // Xóa cache cũ để lần sau tải lại bài đọc có đầy đủ câu hỏi mới
      await RedisService.del(`reading:article:${articleId}`);
    }

    return resultQuizzes;
  }

  /**
   * Dịch chính xác cụm từ được người dùng bôi đen
   */
  static async translateSelection(text: string, contextSentence?: string) {
    return await ReadingAiService.translateSelection(text, contextSentence);
  }

  /**
   * Giải thích chuyên sâu ngữ pháp và phân tích câu trích dẫn
   */
  static async explainGrammar(grammarPoint: string, sentence?: string, level?: string) {
    return await ReadingAiService.explainGrammar(grammarPoint, sentence, level);
  }

  /**
   * Lấy danh sách tin tức báo chí tiếng Nhật mới nhất từ các nguồn RSS uy tín (NHK, Livedoor, Yahoo JP, Gigazine, Toyo Keizai)
   */
  static async fetchRawRssFeeds(source?: string) {
    const Parser = require('rss-parser');
    const parser = new Parser({
      customFields: {
        item: ['content:encoded', 'description', 'summary']
      }
    });
    const defaultSourceImages: Record<string, string> = {
      NHK_NEWS: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80',
      LIVEDOOR: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=600&q=80',
      YAHOO_JP: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=600&q=80',
      GIGAZINE: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
      TOYO_KEIZAI: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
      NIPPON_COM: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80'
    };

    const feeds = [
      { name: 'GIGAZINE', url: 'https://gigazine.net/news/rss_2.0/', defaultLevel: 'N3' },
      { name: 'TOYO_KEIZAI', url: 'https://toyokeizai.net/list/feed/rss', defaultLevel: 'N2' },
      { name: 'ITMEDIA', url: 'https://rss.itmedia.co.jp/rss/2.0/news_bursts.xml', defaultLevel: 'N2' },
      { name: 'YAHOO_JP', url: 'https://news.yahoo.co.jp/rss/topics/top-picks.xml', defaultLevel: 'N3' },
      { name: 'LIVEDOOR', url: 'https://news.livedoor.com/topics/rss/top.xml', defaultLevel: 'N3' },
      { name: 'NHK_NEWS', url: 'https://www.nhk.or.jp/rss/news/cat0.xml', defaultLevel: 'N3' },
      { name: 'NHK_NEWS', url: 'https://www.nhk.or.jp/rss/news/cat3.xml', defaultLevel: 'N3' }
    ];

    const activeFeeds = source && source !== 'ALL'
      ? feeds.filter((f) => f.name.toUpperCase() === source.toUpperCase())
      : feeds;

    const allArticles: any[] = [];
    const seenLinks = new Set<string>();

    await Promise.allSettled(
      activeFeeds.map(async (feed) => {
        try {
          const res = await axios.get(feed.url, {
            timeout: 6000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
              'Accept': 'application/rss+xml, application/xml, text/xml, */*'
            }
          });
          const parsed = await parser.parseString(res.data);

          (parsed.items || []).slice(0, 10).forEach((item: any) => {
            const rawLink = item.link?.split('?')[0] || '';
            const cleanUrl = this.normalizeUrl(rawLink);
            if (!cleanUrl || seenLinks.has(cleanUrl)) return;
            seenLinks.add(cleanUrl);

            const rawHtmlContent =
              item['content:encoded'] || item.content || item.description || item.summary || item.contentSnippet || '';
            let cleanSnippet = '';
            let rssImage = item.enclosure?.url || item.image?.url || '';
            if (rawHtmlContent) {
              try {
                const $rss = cheerio.load(String(rawHtmlContent));
                if (!rssImage) {
                  rssImage = $rss('img').first().attr('src') || '';
                }
                cleanSnippet = $rss.text().replace(/\s+/g, ' ').trim();
              } catch {
                cleanSnippet = String(rawHtmlContent).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
              }
            }

            allArticles.push({
              title: (item.title || '').trim(),
              link: cleanUrl,
              pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
              contentSnippet: cleanSnippet,
              source: feed.name,
              sourceName: feed.name,
              levelEstimate: feed.defaultLevel,
              imageUrl: rssImage || defaultSourceImages[feed.name] || defaultSourceImages.NHK_NEWS
            });
          });
        } catch (e: any) {
          console.warn(`[ReadingService] Không thể tải RSS ${feed.name} (${feed.url}):`, e?.message || e);
        }
      })
    );

    const sorted = allArticles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    // Lọc bỏ những bài đã xử lý trong CSDL (theo cả sourceUrl chuẩn hóa và tiêu đề gốc)
    const urls = sorted.map((a) => a.link).filter(Boolean);
    const titles = sorted.map((a) => a.title).filter(Boolean);
    if (urls.length === 0) return [];

    const existing = await prisma.readingArticle.findMany({
      where: {
        OR: [
          { sourceUrl: { in: urls } },
          ...(titles.length > 0 ? [{ title: { in: titles } }] : [])
        ]
      },
      select: { sourceUrl: true, title: true }
    });
    const existingUrlSet = new Set(existing.map((e) => (e.sourceUrl ? this.normalizeUrl(e.sourceUrl) : '')).filter(Boolean));
    const existingTitleSet = new Set(existing.map((e) => e.title.split('(')[0].trim().slice(0, 80)).filter(Boolean));

    return sorted.filter((a) => {
      const norm = this.normalizeUrl(a.link);
      const tNorm = (a.title || '').split('(')[0].trim().slice(0, 80);
      return !existingUrlSet.has(norm) && !existingTitleSet.has(tNorm);
    });
  }

  /**
   * Sinh âm thanh Edge-TTS (ja-JP-NanamiNeural) chạy nền không chặn request,
   * cập nhật audioUrl + mốc thời gian VTT chuẩn từng câu vào MySQL và làm mới Redis.
   */
  private static ensureArticleAudioAsync(articleId: string, sentences: Array<{ id: string; sentenceJp: string }>) {
    if (!articleId || !sentences || sentences.length === 0) return;
    if (this.audioInFlight.has(articleId)) return;
    this.audioInFlight.add(articleId);

    (async () => {
      try {
        const audioData = await TtsService.generateArticleAudio(
          articleId,
          sentences.map((s) => s.sentenceJp)
        );
        if (!audioData.audioUrl) return;

        const durationSeconds =
          audioData.timings.length > 0
            ? Math.max(10, Math.ceil(audioData.timings[audioData.timings.length - 1].endTimeMs / 1000))
            : 0;

        await prisma.readingArticle.update({
          where: { id: articleId },
          data: {
            audioUrl: audioData.audioUrl,
            ...(durationSeconds > 0 ? { durationSeconds } : {})
          }
        });

        for (let i = 0; i < sentences.length; i++) {
          const t = audioData.timings[i];
          if (!t || !sentences[i]?.id) continue;
          await prisma.readingSentence
            .update({
              where: { id: sentences[i].id },
              data: { startTimeMs: t.startTimeMs, endTimeMs: t.endTimeMs }
            })
            .catch(() => {});
        }

        await RedisService.del(`reading:article:${articleId}`);
        await RedisService.delPrefix('reading:list:');
      } catch (err: any) {
        console.warn(`[ReadingService] Background TTS failed for ${articleId}:`, err?.message || err);
      } finally {
        this.audioInFlight.delete(articleId);
      }
    })();
  }

  static async getLatestNews(source?: string) {
    return await this.fetchRawRssFeeds(source);
  }

  /**
   * Cào một bài báo từ URL bên ngoài và chuyển hóa thành bài đọc Dokkai tương tác (Zero-AI Ultra-Fast Pipeline < 1.5s)
   */
  static async crawlAndProcessArticle(params: {
    url: string;
    level?: string;
    userId?: string;
    fallbackTitle?: string;
    fallbackContent?: string;
    fallbackImage?: string;
    sourceName?: string;
  }) {
    const cleanUrl = this.normalizeUrl(params.url);
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      throw new Error('Đường link bài báo không hợp lệ. Vui lòng nhập URL bắt đầu bằng http:// hoặc https://');
    }

    // 1. Kiểm tra CSDL xem URL này đã được lưu trước đó chưa (0 Token)
    const existing = await prisma.readingArticle.findFirst({
      where: { sourceUrl: cleanUrl },
      select: { id: true }
    });

    if (existing) {
      return await this.getArticleDetail(existing.id);
    }

    // 2. Chống Thundering Herd (Single-Flight)
    if (this.crawlInFlight.has(cleanUrl)) {
      return await this.crawlInFlight.get(cleanUrl);
    }

    // 3. Hàng đợi điều tiết tải
    const crawlPromise = this.enqueueCrawl(async () => {
      const checkAgain = await prisma.readingArticle.findFirst({
        where: { sourceUrl: cleanUrl },
        select: { id: true }
      });
      if (checkAgain) {
        return await this.getArticleDetail(checkAgain.id);
      }

      return await this.executeCrawlAndProcess(cleanUrl, params.level, params.userId, {
        fallbackTitle: params.fallbackTitle,
        fallbackContent: params.fallbackContent,
        fallbackImage: params.fallbackImage,
        sourceName: params.sourceName
      });
    });

    this.crawlInFlight.set(cleanUrl, crawlPromise);

    try {
      return await crawlPromise;
    } finally {
      this.crawlInFlight.delete(cleanUrl);
    }
  }

  private static async fetchHtmlWithRetry(url: string, headers: Record<string, string>, timeoutMs = 8500): Promise<string> {
    let lastErr: any;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await axios.get(url, { timeout: timeoutMs, headers });
        return String(res.data || '');
      } catch (err: any) {
        lastErr = err;
        const msg = String(err?.message || '');
        const isTransient = msg.includes('ENOTFOUND') || msg.includes('EAI_AGAIN') || msg.includes('timeout') || msg.includes('ECONNRESET');
        if (!isTransient || attempt === 2) break;
        await new Promise((r) => setTimeout(r, 350 * (attempt + 1)));
      }
    }
    throw lastErr;
  }

  private static isValidArticleImageUrl(src: string): boolean {
    if (!src) return false;
    const lower = src.toLowerCase();
    const junkPatterns = [
      'icon', 'logo', 'avatar', 'badge', 'ad.', '/ads/', 'btn', 'button',
      'banner', 'emoji', 'count', 'spacer', 'ranking', 'placeholder',
      '/30m/', '1x1', 'pixel', 'doubleclick', 'googlesyndication', '.svg', 'jisin.gif'
    ];
    return !junkPatterns.some((p) => lower.includes(p));
  }

  private static resolveHttpUrl(raw: string | undefined, baseUrl: string): string {
    if (!raw) return '';
    let s = raw.trim();
    if (!s || s.startsWith('data:')) return '';
    if (s.startsWith('//')) s = 'https:' + s;
    else if (!s.startsWith('http')) {
      try {
        s = new URL(s, baseUrl).href;
      } catch {
        return '';
      }
    }
    return s;
  }

  private static extractDomParagraphsAndImages(
    $: any,
    pageUrl: string,
    collectedParagraphs: Array<{ text: string; imageUrl?: string }>,
    inArticleImages: string[],
    seenPara: Set<string>
  ) {
    const isGigazine = pageUrl.includes('gigazine.net');
    const isToyoKeizai = pageUrl.includes('toyokeizai.net');

    // Xóa rác chung
    $('script, style, noscript, nav, header, footer, iframe, aside, .advertisement, .ad, .sns-share, .social, button, .footer, .header, .menu, .related, .paywall, dialog').remove();
    $('[class*="ranking"], [class*="recommend"], [class*="related"], [class*="news-list"], [class*="module--list"], [class*="vmdvll"], [class*="_20zele"], [class*="_1pe8r"], [class*="sidebar"], [class*="ranking-list"], [class*="pickup"], [class*="series"]').remove();

    // Xóa rác đặc thù từng trang báo (LƯU Ý: KHÔNG xóa .preface của GIGAZINE vì .preface chính là nội dung bài báo!)
    if (isGigazine) {
      $('#donation_wrapper, #donate_large, .sponsor, .supporter, #houseads-area, #social-bar, [id*="gpt-ad"], [id*="Google_IL"], blockquote, [class*="sponsor"], [class*="donation"], [class*="membership"], [class*="support_btn"]').remove();
    } else {
      $('.preface, .sponsor, .supporter, [class*="preface"], [class*="sponsor"], [class*="donation"], [class*="membership"], [class*="support_btn"]').remove();
    }

    if (isToyoKeizai) {
      $('.article-index, .article-photo-link, .lead-heading, .page-divide, .article-related__list, .article-author, .article-author__text, .pi_content, [class*="c-g-a"]').remove();
    }

    $('h2, h3, h4, div, section').each((_: number, el: any) => {
      const t = $(el).text().trim();
      if (
        ['あわせて読みたい', '深掘りコンテンツ', 'アクセスランキング', '新着ニュース', '注目ワード', '各地のニュース', 'NHKからのお知らせ', 'おすすめ記事', '関連記事', 'ランキング', '最新ニュース'].includes(t)
      ) {
        $(el).closest('div, section, ul, ol').remove();
      }
    });

    const bodyContainers = isGigazine
      ? ['div.cntimage', 'div#article', 'div.cntbox', 'article', 'main']
      : isToyoKeizai
        ? ['.article-body', '.article-body-inner', 'article', 'main']
        : [
            'div#cmsBody',
            '.articleBody',
            '[itemprop="articleBody"]',
            '#article-body',
            '.article-body',
            '.article_body',
            'div.NewsBody',
            '.content--detail-body',
            '.main-text',
            'div.cntimage',
            'div.cntbox',
            '#article',
            'article',
            '[class*="article-content"]',
            '[class*="kiji-body"]',
            'main'
          ];

    let $container: any = null;
    for (const sel of bodyContainers) {
      const found = $(sel);
      if (found.length > 0 && found.text().trim().length >= 80) {
        $container = found.first();
        break;
      }
    }

    const targetRoot = $container || $('body');

    targetRoot.find('img').each((_: number, el: any) => {
      const s = this.resolveHttpUrl($(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-original'), pageUrl);
      if (s && this.isValidArticleImageUrl(s) && !inArticleImages.includes(s)) {
        inArticleImages.push(s);
      }
    });

    const isBoilerplate = (txt: string) =>
      txt.length < 10 ||
      txt.includes('続きを読む') ||
      txt.includes('これまでGIGAZINEを支援してくれた') ||
      txt.includes('メンバーのリスト') ||
      txt.includes('ご存じの通り価格高騰') ||
      txt.includes('サーバー運営がとても苦しい') ||
      txt.includes('回線や台数を整理し') ||
      txt.includes('危険水域です') ||
      txt.includes('GIGAZINE・Club') ||
      txt.includes('支援してくださる') ||
      txt.includes('放送法に基づき契約が必要です') ||
      txt.includes('受信契約について詳しく確認する') ||
      txt.includes('All Rights Reserved') ||
      txt.includes('無断転載を禁じます') ||
      txt.includes('シェアする') ||
      txt.includes('地図から選ぶ') ||
      txt.includes('深掘りコンテンツ') ||
      txt.includes('あわせて読みたい') ||
      txt.includes('この記事を評価する');

    // Duyệt tuần tự cả văn bản (p, h2, h3) lẫn khối ảnh minh họa (figure, .figure-center, p > img, a > img)
    targetRoot.find('p, h2, h3, figure, .figure-center, a').each((_: number, el: any) => {
      const $el = $(el);
      const tag = (el.tagName || '').toLowerCase();
      if ($el.closest('ul, ol, nav, aside, blockquote, [class*="news-list"], [class*="module--list"]').length > 0) return;

      // Bỏ qua <a> nằm trong <p> đã được duyệt (chỉ bắt <a> đứng độc lập chứa <img> minh họa của GIGAZINE)
      if (tag === 'a') {
        if ($el.closest('p, figure, h2, h3').length > 0) return;
        const imgSrc = this.resolveHttpUrl(
          $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src'),
          pageUrl
        );
        if (imgSrc && this.isValidArticleImageUrl(imgSrc) && collectedParagraphs.length > 0) {
          const prev = collectedParagraphs[collectedParagraphs.length - 1];
          if (!prev.imageUrl) prev.imageUrl = imgSrc;
        }
        return;
      }

      if (tag === 'figure' || $el.hasClass('figure-center')) {
        const figImg = this.resolveHttpUrl(
          $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src'),
          pageUrl
        );
        if (figImg && this.isValidArticleImageUrl(figImg) && collectedParagraphs.length > 0) {
          const prev = collectedParagraphs[collectedParagraphs.length - 1];
          if (!prev.imageUrl) prev.imageUrl = figImg;
        }
        return;
      }

      let rawTxt = $el.text().replace(/\s+/g, ' ').trim();
      let inlineImg = this.resolveHttpUrl(
        $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src'),
        pageUrl
      );
      if (inlineImg && !this.isValidArticleImageUrl(inlineImg)) inlineImg = '';

      if (!rawTxt) {
        if (inlineImg && collectedParagraphs.length > 0) {
          const prev = collectedParagraphs[collectedParagraphs.length - 1];
          if (!prev.imageUrl) prev.imageUrl = inlineImg;
        }
        return;
      }

      // Loại bỏ URL thô (http/https) nhưng giữ phần chữ tiếng Nhật xung quanh
      const txt = rawTxt.replace(/https?:\/\/[^\s]+/g, '').trim();
      if (isBoilerplate(txt)) return;

      const latinCount = (txt.match(/[a-zA-Z]/g) || []).length;
      const jpCount = (txt.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/g) || []).length;
      if (jpCount < 6 || (latinCount > 15 && latinCount > jpCount)) {
        return;
      }

      if (!seenPara.has(txt)) {
        seenPara.add(txt);
        collectedParagraphs.push({ text: txt, imageUrl: inlineImg || undefined });
      }
    });
  }

  /**
   * Thực hiện bóc tách bài báo bằng Cheerio nhẹ (< 2MB RAM) + Kuromoji + Từ điển CSDL + Dịch GTX + Làm giàu Ngữ pháp/Từ vựng
   */
  private static async executeCrawlAndProcess(
    cleanUrl: string,
    level?: string,
    userId?: string,
    fallbackMeta?: {
      fallbackTitle?: string;
      fallbackContent?: string;
      fallbackImage?: string;
      sourceName?: string;
    }
  ): Promise<any> {
    let extractedTitle = fallbackMeta?.fallbackTitle || '';
    let extractedBody = '';
    let canonicalCoverImage = this.resolveHttpUrl(fallbackMeta?.fallbackImage, cleanUrl);
    let metaDescription = '';
    let paywallDetected = false;
    const collectedParagraphs: Array<{ text: string; imageUrl?: string }> = [];
    const inArticleImages: string[] = [];
    const seenPara = new Set<string>();

    const httpHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'ja-JP,ja;q=0.9,en-US;q=0.8'
    };

    try {
      let primaryFetchUrl = cleanUrl;
      if (cleanUrl.includes('toyokeizai.net/articles/-/')) {
        const tkUrl = new URL(cleanUrl);
        tkUrl.searchParams.set('display', 'b');
        primaryFetchUrl = tkUrl.toString();
      }

      const rawHtml = await this.fetchHtmlWithRetry(primaryFetchUrl, httpHeaders, 8500);
      const $ = cheerio.load(rawHtml);

      if (rawHtml.includes('放送法に基づき契約が必要です') || (cleanUrl.includes('news.web.nhk') && rawHtml.includes('受信契約について'))) {
        paywallDetected = true;
      }

      const ogImg = this.resolveHttpUrl(
        $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content'),
        primaryFetchUrl
      );
      if (ogImg && this.isValidArticleImageUrl(ogImg)) {
        canonicalCoverImage = ogImg;
      }

      metaDescription =
        $('meta[property="og:description"]').attr('content')?.trim() ||
        $('meta[name="description"]').attr('content')?.trim() ||
        '';

      const pageTitle =
        $('h1').first().text().trim() ||
        $('meta[property="og:title"]').attr('content')?.trim() ||
        $('title').text().trim() ||
        '';

      if (pageTitle) {
        const cleanedPageTitle = pageTitle.replace(/\s*[\-|｜|]\s*(NHKニュース|NHK|Yahoo!?ニュース|GIGAZINE|東洋経済オンライン|ライブドアニュース|nippon\.com|ITmedia).*$/i, '').trim();
        if (cleanedPageTitle.length >= 8) {
          extractedTitle = cleanedPageTitle;
        }
      }

      // Hỗ trợ phân trang nhiều trang của Toyo Keizai (?page=2&display=b, ?page=3&display=b...)
      const extraPageUrls: string[] = [];
      if (cleanUrl.includes('toyokeizai.net/articles/-/')) {
        const pageNums = new Set<number>();
        $('a[href*="page="]').each((_: number, el: any) => {
          const href = $(el).attr('href') || '';
          const m = href.match(/[?&]page=(\d+)/);
          if (m) {
            const num = parseInt(m[1], 10);
            if (num >= 2 && num <= 4) pageNums.add(num);
          }
        });
        for (const pNum of Array.from(pageNums).sort((a, b) => a - b)) {
          const nextU = new URL(cleanUrl);
          nextU.searchParams.set('display', 'b');
          nextU.searchParams.set('page', String(pNum));
          extraPageUrls.push(nextU.toString());
        }
      }

      this.extractDomParagraphsAndImages($, primaryFetchUrl, collectedParagraphs, inArticleImages, seenPara);

      if (extraPageUrls.length > 0) {
        const extraResponses = await Promise.allSettled(
          extraPageUrls.map((u) => this.fetchHtmlWithRetry(u, httpHeaders, 7500))
        );
        for (let idx = 0; idx < extraResponses.length; idx++) {
          const r = extraResponses[idx];
          if (r.status === 'fulfilled' && r.value) {
            const $next = cheerio.load(r.value);
            this.extractDomParagraphsAndImages($next, extraPageUrls[idx], collectedParagraphs, inArticleImages, seenPara);
          }
        }
      }

      // Phân bổ ảnh minh họa vào giữa các đoạn văn nếu bài viết có ảnh nội dung chưa được gán
      const unassignedImgs = inArticleImages.filter(
        (img) => img !== canonicalCoverImage && !collectedParagraphs.some((p) => p.imageUrl === img)
      );
      if (unassignedImgs.length > 0 && collectedParagraphs.length >= 3) {
        const step = Math.max(2, Math.floor(collectedParagraphs.length / Math.min(3, unassignedImgs.length + 1)));
        unassignedImgs.slice(0, 3).forEach((img, i) => {
          const targetIdx = Math.min(collectedParagraphs.length - 1, (i + 1) * step);
          if (!collectedParagraphs[targetIdx].imageUrl) {
            collectedParagraphs[targetIdx].imageUrl = img;
          }
        });
      }

      extractedBody = collectedParagraphs.map((p) => p.text).join('\n\n');
    } catch (crawlErr: any) {
      console.warn(`[ReadingService] HTTP scrape fallback for ${cleanUrl}:`, crawlErr?.message || crawlErr);
    }

    const extractedImageUrl =
      (canonicalCoverImage && this.isValidArticleImageUrl(canonicalCoverImage) ? canonicalCoverImage : '') ||
      inArticleImages[0] ||
      '';

    // Không cho phép dùng tóm tắt ngắn khi bài báo bị khóa tường rào thuê bao NHK ONE / teaser ...続きを読む
    const fallbackText = [fallbackMeta?.fallbackContent || '', metaDescription]
      .map((s) => s.trim())
      .filter((s) => s.length >= 25 && !s.includes('放送法に基づき契約が必要です') && !s.includes('続きを読む'))
      .sort((a, b) => b.length - a.length)[0] || '';

    if ((!extractedBody || extractedBody.length < 150) && !paywallDetected) {
      if (fallbackText && fallbackText.length >= 120) {
        extractedBody = extractedBody ? `${extractedBody}\n\n${fallbackText}` : fallbackText;
      }
    }

    if (!extractedBody || extractedBody.length < 120) {
      throw new Error(
        paywallDetected
          ? 'Bài báo gốc bị giới hạn quyền truy cập thuê bao (chỉ hiển thị đoạn mở đầu ngắn).'
          : 'Không thể trích xuất đầy đủ nội dung bài viết từ liên kết này.'
      );
    }

    if (extractedBody.length > 4500) {
      extractedBody = extractedBody.slice(0, 4500);
    }

    const effectiveUserId = userId || 'guest_user';
    const targetLevel = level || 'N3';

    const { KuromojiService } = await import('./kuromoji.service');
    const { TranscriptParserService } = await import('../shadowing/transcript-parser.service');

    const rawSentencesWithImg: Array<{ jp: string; imageUrl?: string }> = [];
    if (collectedParagraphs.length > 0) {
      for (const p of collectedParagraphs) {
        const sents = p.text
          .split(/(?<=[。！？\n])/)
          .map((s: string) => s.replace(/\s+/g, ' ').trim())
          .filter((s: string) => s.length >= 8 && /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(s));

        sents.forEach((sent: string, sIdx: number) => {
          const img = sIdx === sents.length - 1 && p.imageUrl ? p.imageUrl : undefined;
          rawSentencesWithImg.push({ jp: sent, imageUrl: img });
        });
      }
    } else {
      const sents = extractedBody
        .split(/(?<=[。！？\n])/)
        .map((s: string) => s.replace(/\s+/g, ' ').trim())
        .filter((s: string) => s.length >= 8 && /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(s));
      for (const s of sents) {
        rawSentencesWithImg.push({ jp: s });
      }
    }

    const targetSentences = rawSentencesWithImg.slice(0, 40);
    const rawSentences = targetSentences.map((it) => it.jp);
    const totalJpChars = rawSentences.reduce((acc, s) => acc + s.length, 0);

    if (rawSentences.length < 3 || totalJpChars < 100) {
      throw new Error('Nội dung bài báo quá ngắn hoặc chỉ là đoạn xem trước bị giới hạn.');
    }

    const cleanTitleJp = (extractedTitle || rawSentences[0].slice(0, 60))
      .replace(/\s*[\-|｜|]\s*(NHKニュース|NHK|Yahoo!?ニュース|GIGAZINE|東洋経済オンライン|ライブドアニュース|nippon\.com|ITmedia).*$/i, '')
      .trim()
      .slice(0, 240);
    const trimmedBody = rawSentences.join('\n');

    // Chống trùng lặp ngay trước khi phân tích / ghi CSDL
    const existingPreInsert = await prisma.readingArticle.findFirst({
      where: {
        OR: [
          { sourceUrl: cleanUrl },
          { title: cleanTitleJp }
        ]
      },
      select: { id: true }
    });
    if (existingPreInsert) {
      return await this.getArticleDetail(existingPreInsert.id);
    }

    // 1. Phân tích toàn bài bằng Kuromoji (Single-Pass < 15ms) + Dịch Batch GTX miễn phí (< 300ms)
    const [globalAnalysis, gtxTranslations] = await Promise.all([
      KuromojiService.analyzeText(trimmedBody),
      TranscriptParserService.translateBatchGtx([cleanTitleJp, ...rawSentences])
    ]);

    const titleVi = (gtxTranslations[0] || '').trim();
    const sentenceTranslations = gtxTranslations.slice(1);

    // 2. Làm giàu nghĩa tiếng Việt & Hán Việt cho Từ vựng từ CSDL + GTX Batch
    const candidateVocabs = globalAnalysis.vocabularies || [];
    const candidateWords = candidateVocabs.map((v: any) => v.word).filter(Boolean);

    const dbVocabMap = new Map<string, any>();
    if (candidateWords.length > 0) {
      try {
        const [dbRecords, cachedReadingVocabs] = await Promise.all([
          prisma.vocabulary.findMany({
            where: { word: { in: candidateWords } },
            select: {
              word: true,
              reading: true,
              hanViet: true,
              meaningVi: true,
              jlptLevel: true,
              partOfSpeech: true
            }
          }),
          prisma.readingVocabItem.findMany({
            where: {
              word: { in: candidateWords },
              NOT: { meaningVi: { contains: 'Từ vựng trọng tâm' } }
            },
            select: {
              word: true,
              reading: true,
              hanViet: true,
              meaningVi: true,
              level: true
            },
            take: 40
          })
        ]);
        for (const r of dbRecords) {
          if (!dbVocabMap.has(r.word) && r.meaningVi) dbVocabMap.set(r.word, r);
        }
        for (const rv of cachedReadingVocabs) {
          if (!dbVocabMap.has(rv.word) && rv.meaningVi && !rv.meaningVi.includes('Từ vựng trọng tâm')) {
            dbVocabMap.set(rv.word, { ...rv, jlptLevel: rv.level });
          }
        }
      } catch {}
    }

    // Dịch các từ vựng chưa có trong DB bằng GTX theo từng câu đánh số chấm câu
    const missingVocabWords = candidateWords.filter((w: string) => !dbVocabMap.has(w)).slice(0, 14);
    const numberedMissingPrompts = missingVocabWords.map((w: string, idx: number) => `${idx + 1}. ${w}。`);
    const missingTranslations =
      numberedMissingPrompts.length > 0
        ? await TranscriptParserService.translateBatchGtx(numberedMissingPrompts)
        : [];
    const missingMap = new Map<string, string>();
    missingVocabWords.forEach((w: string, idx: number) => {
      const cleanedMeaning = (missingTranslations[idx] || '')
        .replace(/^\d+[\.\):：]\s*/, '')
        .replace(/[.。]+$/, '')
        .trim();
      if (cleanedMeaning && cleanedMeaning !== w && !cleanedMeaning.includes('Từ vựng trọng tâm')) {
        missingMap.set(w, cleanedMeaning);
      }
    });

    let finalVocabs: any[] = candidateVocabs.slice(0, 20).map((v: any) => {
      const dbHit = dbVocabMap.get(v.word);
      if (dbHit) {
        return {
          word: v.word,
          reading: dbHit.reading || v.reading || '',
          hanViet: dbHit.hanViet || null,
          meaningVi: dbHit.meaningVi,
          level: dbHit.jlptLevel || targetLevel
        };
      }
      const gtxMeaning = missingMap.get(v.word) || '';
      return {
        word: v.word,
        reading: v.reading || '',
        hanViet: null,
        meaningVi: gtxMeaning ? (v.pos ? `[${v.pos}] ${gtxMeaning}` : gtxMeaning) : '',
        level: targetLevel
      };
    });

    let finalGrammars: any[] = (globalAnalysis.grammars || []).slice(0, 10);

    // 2b. Làm giàu thông minh bằng Gemini (Timeout tối đa 9s, đảm bảo nghĩa theo văn cảnh chuẩn & giải thích ngữ pháp đầy đủ)
    const untranslatedCount = finalVocabs.filter((v) => !v.meaningVi).length;
    const needsAiEnrich =
      finalGrammars.length < 5 ||
      untranslatedCount >= 2 ||
      finalVocabs.filter((v) => v.meaningVi).length < 10;

    if (needsAiEnrich && process.env.GEMINI_API_KEY) {
      try {
        const aiEnriched = await Promise.race([
          ReadingAiService.extractVocabAndGrammar(trimmedBody.slice(0, 2600), targetLevel),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 9000))
        ]);

        if (aiEnriched) {
          if (Array.isArray(aiEnriched.vocabularies) && aiEnriched.vocabularies.length > 0) {
            const mergedVocabs = new Map<string, any>();
            for (const av of aiEnriched.vocabularies) {
              if (!av?.word || !av?.meaningVi || !trimmedBody.includes(av.word)) continue;
              const dbHit = dbVocabMap.get(av.word);
              mergedVocabs.set(av.word, {
                word: av.word,
                reading: av.reading || dbHit?.reading || '',
                hanViet: dbHit?.hanViet || av.hanViet || null,
                meaningVi: av.meaningVi,
                level: av.level || dbHit?.jlptLevel || targetLevel
              });
            }
            for (const kv of finalVocabs) {
              if (kv.meaningVi && !mergedVocabs.has(kv.word)) {
                mergedVocabs.set(kv.word, kv);
              }
            }
            finalVocabs = Array.from(mergedVocabs.values()).slice(0, 18);
          }

          if (Array.isArray(aiEnriched.grammars) && aiEnriched.grammars.length > 0) {
            const seenGram = new Set(finalGrammars.map((g) => g.grammarPoint || g.grammar));
            for (const ag of aiEnriched.grammars) {
              const gName = (ag?.grammar || ag?.grammarPoint || '').trim();
              if (!gName || seenGram.has(gName)) continue;
              const core = gName.replace(/[〜~・()（）]/g, '').slice(0, 4);
              const matchedSent = rawSentences.find((s) => (core ? s.includes(core) : false));
              if (!matchedSent && finalGrammars.length >= 4) continue;
              seenGram.add(gName);
              finalGrammars.push({
                grammarPoint: gName,
                meaningVi: ag.meaningVi || 'Cấu trúc ngữ pháp trong bài',
                level: ag.level || targetLevel,
                excerpt: matchedSent || ag.explanation || rawSentences[0] || ''
              });
            }
            finalGrammars = finalGrammars.slice(0, 10);
          }
        }
      } catch {
        // Bỏ qua nhẹ nhàng nếu AI hết quota hoặc timeout
      }
    }

    // Chỉ giữ các từ vựng đã có nghĩa tiếng Việt rõ ràng
    finalVocabs = finalVocabs
      .filter((v) => v.meaningVi && !v.meaningVi.includes('Từ vựng trọng tâm'))
      .slice(0, 18);

    // 3. Tạo Furigana và tính mốc thời gian Mora chuẩn xác cho từng câu (kèm gắn ảnh minh họa inline)
    const sentences: any[] = [];
    const estimatedTimings = TtsService.estimateSentenceTimings(rawSentences);
    for (let i = 0; i < targetSentences.length; i++) {
      const item = targetSentences[i];
      let furiText = await KuromojiService.addFurigana(item.jp);
      if (item.imageUrl) {
        furiText += `<!--IMG:${item.imageUrl}-->`;
      }
      const timing = estimatedTimings[i] || { startTimeMs: 0, endTimeMs: 2500 };

      sentences.push({
        orderIndex: i + 1,
        sentenceJp: item.jp,
        sentenceVi: sentenceTranslations[i] || '',
        furigana: furiText,
        startTimeMs: timing.startTimeMs,
        endTimeMs: timing.endTimeMs
      });
    }
    const accumulatedMs =
      sentences.length > 0 ? sentences[sentences.length - 1].endTimeMs : 30000;

    // 4. Tạo bản dịch toàn bài (translationFull) chia theo đoạn
    const paraBlocks: string[] = [];
    if (titleVi && titleVi !== cleanTitleJp) {
      paraBlocks.push(`【Tiêu đề】 ${titleVi}`);
    }
    for (let i = 0; i < sentences.length; i += 4) {
      const chunk = sentences
        .slice(i, i + 4)
        .map((s) => s.sentenceVi)
        .filter(Boolean)
        .join(' ');
      if (chunk) {
        paraBlocks.push(`【Đoạn ${Math.floor(i / 4) + 1}】\n${chunk}`);
      }
    }
    const translationFull = paraBlocks.join('\n\n');

    // 5. Tự động sinh bộ câu hỏi đọc hiểu JLPT Dokkai từ nội dung bài báo (0 tốn AI Quota)
    const autoQuizzes: any[] = [];
    if (sentences.length >= 1) {
      const mainSentJp = sentences[0].sentenceJp;
      const mainSentVi = sentences[0].sentenceVi || titleVi || cleanTitleJp;
      autoQuizzes.push({
        question: 'この記事の主な内容（テーマ）として最も適切なものはどれか。',
        questionVi: 'Đâu là nội dung (chủ đề) chính phù hợp nhất với bài báo này?',
        optionsJson: JSON.stringify([
          `1. ${mainSentJp.slice(0, 65)}${mainSentJp.length > 65 ? '…' : ''}`,
          '2. 伝統的な祭りの歴史と地方の観光産業の衰退について。',
          '3. 小学校における新しい外国語教育カリキュラムの廃止について。',
          '4. 江戸時代の建築様式と現代の住宅デザインの比較について。'
        ]),
        optionsViJson: JSON.stringify([
          `1. ${mainSentVi}`,
          '2. Lịch sử các lễ hội truyền thống và sự suy giảm ngành du lịch địa phương.',
          '3. Việc bãi bỏ chương trình giáo dục ngoại ngữ mới tại các trường tiểu học.',
          '4. So sánh phong cách kiến trúc thời Edo và thiết kế nhà ở hiện đại.'
        ]),
        correctIndex: 0,
        explanation: `Đoạn mở đầu của bài báo nêu rõ nội dung trọng tâm: "${mainSentJp}" (${mainSentVi}).`,
        questionType: 'MAIN_IDEA'
      });
    }

    if (sentences.length >= 2) {
      const detailIdx = Math.min(sentences.length - 1, Math.floor(sentences.length / 2));
      const detailSentJp = sentences[detailIdx].sentenceJp;
      const detailSentVi = sentences[detailIdx].sentenceVi || 'Thông tin chi tiết được nêu trong bài.';
      autoQuizzes.push({
        question: '本文で述べられている内容と合致しているものはどれか。',
        questionVi: 'Nhận định nào sau đây ĐÚNG với thông tin được nêu trong bài viết?',
        optionsJson: JSON.stringify([
          '1. この問題については、まだ一度も調査や報道が行われていない。',
          `2. ${detailSentJp.slice(0, 68)}${detailSentJp.length > 68 ? '…' : ''}`,
          '3. 関係者は全員この計画に強く反対しており、直ちに中止された。',
          '4. 海外の事例のみを紹介しており、日本国内の状況には触れていない。'
        ]),
        optionsViJson: JSON.stringify([
          '1. Về vấn đề này, vẫn chưa từng có cuộc điều tra hay đưa tin nào được thực hiện.',
          `2. ${detailSentVi}`,
          '3. Tất cả những người liên quan đều phản đối gay gắt nên kế hoạch đã bị hủy bỏ ngay lập tức.',
          '4. Bài viết chỉ giới thiệu các trường hợp ở nước ngoài mà không đề cập tới tình hình tại Nhật Bản.'
        ]),
        correctIndex: 1,
        explanation: `Thông tin khớp trực tiếp với câu số ${detailIdx + 1} trong bài: "${detailSentJp}" (${detailSentVi}).`,
        questionType: 'DETAIL_MATCH'
      });
    }

    if (finalVocabs.length >= 2) {
      const targetVocab = finalVocabs[0];
      const distractors = [
        'Tạm hoãn vô thời hạn',
        'Phản đối hoàn toàn',
        'Thay đổi theo mùa'
      ];
      autoQuizzes.push({
        question: `本文中に登場する重要語彙「${targetVocab.word}」（${targetVocab.reading || targetVocab.word}）の意味として最も適切なものはどれか。`,
        questionVi: `Từ vựng trọng tâm "${targetVocab.word}" (${targetVocab.reading || targetVocab.word}) xuất hiện trong bài báo mang ý nghĩa nào sau đây?`,
        optionsJson: JSON.stringify([
          `1. ${targetVocab.meaningVi}`,
          `2. ${distractors[0]}`,
          `3. ${distractors[1]}`,
          `4. ${distractors[2]}`
        ]),
        optionsViJson: JSON.stringify([
          `1. ${targetVocab.meaningVi}`,
          `2. ${distractors[0]}`,
          `3. ${distractors[1]}`,
          `4. ${distractors[2]}`
        ]),
        correctIndex: 0,
        explanation: `Từ vựng 【${targetVocab.word}】 (${targetVocab.reading}) trong bài có nghĩa là: ${targetVocab.meaningVi}.`,
        questionType: 'VOCAB_CONTEXT'
      });
    }

    // Xác định tên nguồn báo hiển thị rõ ràng
    let topicLabel = 'Tin tức báo chí';
    if (cleanUrl.includes('nhk.or.jp') || cleanUrl.includes('news.web.nhk') || fallbackMeta?.sourceName === 'NHK_NEWS') topicLabel = 'NHK News • Thời sự Nhật Bản';
    else if (cleanUrl.includes('nippon.com')) topicLabel = 'Nippon.com • Văn hóa & Xã hội';
    else if (cleanUrl.includes('toyokeizai.net')) topicLabel = 'Toyo Keizai • Kinh tế & Đời sống';
    else if (cleanUrl.includes('president.jp')) topicLabel = 'President JP • Công việc & Xã hội';
    else if (cleanUrl.includes('itmedia.co.jp')) topicLabel = 'ITmedia News • Công nghệ & Kinh doanh';
    else if (cleanUrl.includes('gigazine.net')) topicLabel = 'GIGAZINE • Công nghệ & Khoa học';
    else if (cleanUrl.includes('livedoor.com')) topicLabel = 'Livedoor News • Xã hội & Đời sống';
    else if (cleanUrl.includes('yahoo.co.jp')) topicLabel = 'Yahoo! News JP • Tiêu điểm';

    // Giữ nguyên tiêu đề gốc tiếng Nhật chuẩn xác (không ghép chuỗi dịch gây tràn VarChar(255) & mất chữ)
    const displayTitle = cleanTitleJp;

    const tempId = crypto.randomUUID();
    const isNhk = cleanUrl.includes('nhk') || fallbackMeta?.sourceName === 'NHK_NEWS';

    const newArticle = await prisma.readingArticle.create({
      data: {
        id: tempId,
        audioUrl: null,
        durationSeconds: Math.max(30, Math.ceil(accumulatedMs / 1000)),
        title: displayTitle,
        sourceType: isNhk ? 'NHK_NEWS' : 'EXTERNAL_NEWS',
        level: targetLevel,
        topic: topicLabel,
        totalWords: sentences.reduce((acc: number, s: any) => acc + s.sentenceJp.length, 0),
        imageUrl:
          extractedImageUrl ||
          'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80',
        translationFull: translationFull || null,
        isPublic: true,
        createdBy: effectiveUserId,
        sourceUrl: cleanUrl,
        sentences: {
          createMany: {
            data: sentences.map((s: any) => ({
              orderIndex: s.orderIndex,
              sentenceJp: s.sentenceJp,
              sentenceVi: s.sentenceVi || '',
              furigana: s.furigana || null,
              startTimeMs: s.startTimeMs || 0,
              endTimeMs: s.endTimeMs || 3000
            }))
          }
        },
        vocabularies:
          finalVocabs.length > 0
            ? {
                createMany: {
                  data: finalVocabs.map((v: any) => ({
                    word: v.word || 'Từ vựng',
                    reading: v.reading || v.word || '',
                    meaningVi: (v.meaningVi || 'Từ vựng trọng tâm trong bài').slice(0, 240),
                    level: v.level || targetLevel,
                    hanViet: v.hanViet || null
                  }))
                }
              }
            : undefined,
        grammars:
          finalGrammars.length > 0
            ? {
                createMany: {
                  data: finalGrammars.map((g: any) => ({
                    grammarPoint: (g.grammar || g.grammarPoint || 'Cấu trúc ngữ pháp').slice(0, 140),
                    meaningVi: (g.meaningVi || 'Cấu trúc ngữ pháp trong bài').slice(0, 240),
                    level: g.level || targetLevel,
                    excerpt: g.excerpt || g.explanation || ''
                  }))
                }
              }
            : undefined,
        quizzes:
          autoQuizzes.length > 0
            ? {
                createMany: {
                  data: autoQuizzes
                }
              }
            : undefined
      },
      include: {
        sentences: { orderBy: { orderIndex: 'asc' } },
        vocabularies: true,
        grammars: true,
        quizzes: true
      }
    });

    const formattedArticle = {
      ...newArticle,
      quizzes: newArticle.quizzes.map((q) => ({
        ...q,
        options: (() => {
          try {
            return JSON.parse(q.optionsJson);
          } catch {
            return [];
          }
        })(),
        optionsVi: (() => {
          try {
            return q.optionsViJson ? JSON.parse(q.optionsViJson) : [];
          } catch {
            return [];
          }
        })()
      }))
    };

    await RedisService.set(`reading:article:${newArticle.id}`, formattedArticle, 3600);
    await RedisService.delPrefix('reading:list:');
    this.ensureArticleAudioAsync(newArticle.id, newArticle.sentences);
    return formattedArticle;
  }
}
