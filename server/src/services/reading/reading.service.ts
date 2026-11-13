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

        const [total, items] = await Promise.all([
          prisma.readingArticle.count({ where }),
          prisma.readingArticle.findMany({
            where,
            skip,
            take: limit,
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

        return {
          items,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
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
      prisma.readingSentence.deleteMany({
        where: {
          articleId,
          OR: contaminatedPatterns.map(p => ({ sentenceJp: { contains: p } }))
        }
      }).catch(() => {});
    }

    // Nếu bài báo nguồn tin tức (GIGAZINE / NHK) bị thiếu nội dung (ít hơn 7 câu) hoặc dính rác, tự động tái bóc tách mới hoàn toàn
    if (
      article.sourceUrl &&
      article.sourceUrl.startsWith('http') &&
      (article.sentences.length < 7 || (article.grammars && article.grammars.length <= 1))
    ) {
      try {
        const fresh: any = await this.executeCrawlAndProcess(article.sourceUrl, article.level, article.createdBy || undefined, {
          fallbackTitle: article.title,
          sourceName: article.sourceType
        });
        if (fresh && fresh.sentences && fresh.sentences.length > article.sentences.length) {
          // Xóa bản cũ bị lỗi cắt xén và cập nhật bản mới
          await prisma.readingArticle.delete({ where: { id: articleId } }).catch(() => {});
          return fresh;
        }
      } catch (recrawlErr) {
        console.warn('[ReadingService] Auto re-crawl fallback:', recrawlErr);
      }
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
      { name: 'NHK_NEWS', url: 'https://www.nhk.or.jp/rss/news/cat0.xml', defaultLevel: 'N3' },
      { name: 'NHK_NEWS', url: 'https://www.nhk.or.jp/rss/news/cat1.xml', defaultLevel: 'N3' },
      { name: 'NHK_NEWS', url: 'https://www.nhk.or.jp/rss/news/cat3.xml', defaultLevel: 'N3' },
      { name: 'NHK_NEWS', url: 'https://www.nhk.or.jp/rss/news/cat5.xml', defaultLevel: 'N2' },
      { name: 'GIGAZINE', url: 'https://gigazine.net/news/rss_2.0/', defaultLevel: 'N3' },
      { name: 'LIVEDOOR', url: 'https://news.livedoor.com/topics/rss/dom.xml', defaultLevel: 'N3' },
      { name: 'LIVEDOOR', url: 'https://news.livedoor.com/topics/rss/eco.xml', defaultLevel: 'N2' },
      { name: 'TOYO_KEIZAI', url: 'https://toyokeizai.net/list/feed/rss', defaultLevel: 'N2' },
      { name: 'YAHOO_JP', url: 'https://news.yahoo.co.jp/rss/topics/top-picks.xml', defaultLevel: 'N3' }
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

    // Lọc bỏ những bài đã xử lý trong CSDL (theo cả sourceUrl và title)
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
    const existingUrlSet = new Set(existing.map((e) => e.sourceUrl).filter(Boolean));
    const existingTitleSet = new Set(existing.map((e) => e.title).filter(Boolean));

    return sorted.filter((a) => !existingUrlSet.has(a.link) && !existingTitleSet.has(a.title));
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

  /**
   * Thực hiện bóc tách bài báo bằng Cheerio nhẹ (< 2MB RAM) + Kuromoji + Từ điển CSDL + Dịch GTX tốc độ cao (< 1.5s, 0 tốn quota Gemini)
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
    let extractedImageUrl = fallbackMeta?.fallbackImage || '';
    let metaDescription = '';
    const collectedParagraphs: Array<{ text: string; imageUrl?: string }> = [];

    try {
      const res = await axios.get(cleanUrl, {
        timeout: 7500,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'ja-JP,ja;q=0.9,en-US;q=0.8'
        }
      });

      const $ = cheerio.load(res.data);

      extractedImageUrl =
        $('meta[property="og:image"]').attr('content') ||
        $('meta[name="twitter:image"]').attr('content') ||
        $('article img, .main-text img, .article-body img, #main-content img').first().attr('src') ||
        extractedImageUrl ||
        '';

      if (extractedImageUrl && !extractedImageUrl.startsWith('http')) {
        try {
          extractedImageUrl = new URL(extractedImageUrl, cleanUrl).href;
        } catch {}
      }

      metaDescription =
        $('meta[property="og:description"]').attr('content')?.trim() ||
        $('meta[name="description"]').attr('content')?.trim() ||
        '';

      const pageTitle =
        $('meta[property="og:title"]').attr('content')?.trim() ||
        $('h1').first().text().trim() ||
        $('title').text().trim() ||
        '';

      if (!extractedTitle && pageTitle) {
        extractedTitle = pageTitle.replace(/\s*[\-|｜|]\s*(NHK|Yahoo|GIGAZINE|東洋経済|ライブドア|nippon).*$/i, '').trim();
      }

      // Loại bỏ triệt để rác DOM, sidebar, các danh sách tin liên quan, tin hot, khuyến nghị trước khi lấy đoạn văn
      $('script, style, noscript, nav, header, footer, iframe, aside, .advertisement, .ad, .sns-share, .social, button, .footer, .header, .menu, .related, .paywall, dialog').remove();
      $('[class*="ranking"], [class*="recommend"], [class*="related"], [class*="news-list"], [class*="module--list"], [class*="vmdvll"], [class*="_20zele"], [class*="_1pe8r"], [class*="sidebar"], [class*="ranking-list"], [class*="pickup"], [class*="series"]').remove();

      // Loại bỏ các khối có tiêu đề danh sách tin bài khác
      $('h2, h3, h4, div, section').each((_, el) => {
        const t = $(el).text().trim();
        if (
          ['あわせて読みたい', '深掘りコンテンツ', 'アクセスランキング', '新着ニュース', '注目ワード', '各地のニュース', 'NHKからのお知らせ', 'おすすめ記事', '関連記事', 'ランキング', '最新ニュース'].includes(t)
        ) {
          $(el).closest('div, section, ul, ol').remove();
        }
      });

      // Trích xuất ảnh tốt nhất: ưu tiên ảnh trong nội dung bài viết, sau đó og:image
      const inArticleImg = $('article img, .main-text img, .article-body img, #main-content img, [class*="article"] img, [class*="content"] img')
        .filter((_: number, el: any) => {
          const s = $(el).attr('src') || $(el).attr('data-src') || '';
          return Boolean(s && !s.includes('icon') && !s.includes('logo') && !s.includes('avatar') && !s.includes('badge'));
        })
        .first()
        .attr('src');

      if (inArticleImg) {
        extractedImageUrl = inArticleImg;
      }

      // Nhận diện vùng nội dung chính của bài báo
      const bodyContainers = [
        'div.cntbox',        // GIGAZINE main article content
        '.cntbox',           // GIGAZINE
        '#article',
        '#article-body',
        '.article-body',
        '.article_body',
        'div.NewsBody',      // NHK News
        '.content--detail-body',
        '.main-text',
        'article',
        '[class*="content--detail"]',
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

      // Xóa triệt để các khối rác GIGAZINE, nhà tài trợ, quảng cáo, hỗ trợ server
      $('.preface, .sponsor, .supporter, [class*="preface"], [class*="sponsor"], [class*="donation"], [class*="membership"], [class*="support_btn"]').remove();
      $container?.find('.preface, .sponsor, .supporter, [class*="preface"], [class*="sponsor"]').remove();

      $('p, div, a, span').each((_, el) => {
        const t = $(el).text().trim();
        if (
          t.includes('これまでGIGAZINEを支援してくれた') ||
          t.includes('メンバーのリスト') ||
          t.includes('ご存じの通り価格高騰') ||
          t.includes('サーバー運営がとても苦しい') ||
          t.includes('危険水域です') ||
          t.includes('GIGAZINE・Club') ||
          t.includes('寄付') ||
          t.includes('支援してくださる') ||
          t.includes('放送法に基づき契約が必要です') ||
          t.includes('受信契約について詳しく確認する')
        ) {
          $(el).remove();
        }
      });

      const seenPara = new Set<string>();
      const targetRoot = $container || $('body');

      // Thu thập các ảnh minh họa hợp lệ trong bài viết
      const inArticleImages: string[] = [];
      targetRoot.find('img').each((_: number, el: any) => {
        let s = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-original') || '';
        if (!s) return;
        if (s.startsWith('//')) s = 'https:' + s;
        else if (!s.startsWith('http')) {
          try { s = new URL(s, cleanUrl).href; } catch { return; }
        }
        const isJunk = s.includes('icon') || s.includes('logo') || s.includes('avatar') || s.includes('badge') || s.includes('ad') || s.includes('btn') || s.includes('button') || s.includes('banner') || s.includes('emoji') || s.includes('count') || s.includes('spacer') || s.includes('ranking');
        if (!isJunk && !inArticleImages.includes(s)) {
          inArticleImages.push(s);
        }
      });

      if (!extractedImageUrl && inArticleImages.length > 0) {
        extractedImageUrl = inArticleImages[0];
      }

      targetRoot.find('p, h2, h3').each((_: number, el: any) => {
        const $el = $(el);
        if ($el.closest('ul, ol, nav, aside, [class*="news-list"], [class*="module--list"]').length > 0) return;

        let rawTxt = $el.text().replace(/\s+/g, ' ').trim();
        if (!rawTxt) return;

        // Loại bỏ URL thô (http:// hoặc https://)
        let txt = rawTxt.replace(/https?:\/\/[^\s]+/g, '').trim();

        // Kiểm tra xem đoạn văn có ảnh minh họa ngay bên trong hoặc ngay cạnh không
        let inlineImg = $el.find('img').attr('src') || $el.next('div, figure, p').find('img').attr('src') || '';
        if (inlineImg && inlineImg.startsWith('//')) inlineImg = 'https:' + inlineImg;
        else if (inlineImg && !inlineImg.startsWith('http')) {
          try { inlineImg = new URL(inlineImg, cleanUrl).href; } catch { inlineImg = ''; }
        }
        if (inlineImg && (inlineImg.includes('icon') || inlineImg.includes('logo') || inlineImg.includes('avatar') || inlineImg.includes('badge') || inlineImg.includes('ad'))) {
          inlineImg = '';
        }

        // Lọc bỏ các trích dẫn link nguồn tiếng Anh / Latin
        const latinCount = (txt.match(/[a-zA-Z]/g) || []).length;
        const jpCount = (txt.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/g) || []).length;
        if (jpCount < 6 || (latinCount > 15 && latinCount > jpCount)) {
          return;
        }

        if (
          txt.length >= 12 &&
          !txt.includes('放送法に基づき契約が必要です') &&
          !txt.includes('受信契約について詳しく確認する') &&
          !txt.includes('All Rights Reserved') &&
          !txt.includes('無断転載を禁じます') &&
          !txt.includes('シェアする') &&
          !txt.includes('地図から選ぶ') &&
          !txt.includes('深掘りコンテンツ') &&
          !txt.includes('あわせて読みたい') &&
          !seenPara.has(txt)
        ) {
          seenPara.add(txt);
          collectedParagraphs.push({ text: txt, imageUrl: inlineImg || undefined });
        }
      });

      // Nếu trong bài có ảnh nhưng chưa gán được cho đoạn nào, gán ảnh vào giữa bài viết (khoảng đoạn thứ 2 hoặc 3)
      if (inArticleImages.length > 0 && collectedParagraphs.length >= 3) {
        const hasAssignedImg = collectedParagraphs.some((p) => p.imageUrl);
        if (!hasAssignedImg) {
          const midIdx = Math.min(2, Math.floor(collectedParagraphs.length / 2));
          collectedParagraphs[midIdx].imageUrl = inArticleImages[0];
        }
      }

      extractedBody = collectedParagraphs.map((p) => p.text).join('\n\n');
    } catch (crawlErr: any) {
      console.warn(`[ReadingService] HTTP scrape fallback for ${cleanUrl}:`, crawlErr?.message || crawlErr);
    }

    // Kết hợp hoặc fallback sang nội dung RSS / Meta Description nếu trang đích khóa cào trực tiếp (như NHK ONE / Livedoor summary)
    const fallbackText = [fallbackMeta?.fallbackContent || '', metaDescription]
      .map((s) => s.trim())
      .filter((s) => s.length >= 25 && !s.includes('放送法に基づき契約が必要です'))
      .sort((a, b) => b.length - a.length)[0] || '';

    if (!extractedBody || extractedBody.length < 150) {
      if (fallbackText && fallbackText.length >= 40) {
        extractedBody = extractedBody ? `${extractedBody}\n\n${fallbackText}` : fallbackText;
      }
    } else if (fallbackText && !extractedBody.includes(fallbackText.slice(0, 20)) && extractedBody.length < 250) {
      extractedBody = `${fallbackText}\n\n${extractedBody}`;
    }

    if (!extractedBody || extractedBody.length < 40) {
      throw new Error('Không thể trích xuất nội dung bài viết từ liên kết này.');
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

    if (rawSentences.length === 0) {
      throw new Error('Không tìm thấy câu tiếng Nhật hợp lệ trong bài viết.');
    }

    const cleanTitleJp = (extractedTitle || rawSentences[0].slice(0, 38)).replace(/[\-|｜].*$/, '').trim();
    const trimmedBody = rawSentences.join('\n');

    // 1. Phân tích toàn bài bằng Kuromoji (Single-Pass < 15ms) + Dịch Batch GTX miễn phí (< 300ms)
    const [globalAnalysis, gtxTranslations] = await Promise.all([
      KuromojiService.analyzeText(trimmedBody),
      TranscriptParserService.translateBatchGtx([cleanTitleJp, ...rawSentences])
    ]);

    const titleVi = (gtxTranslations[0] || '').trim();
    const sentenceTranslations = gtxTranslations.slice(1);

    // 2. Làm giàu nghĩa tiếng Việt & Hán Việt cho Từ vựng từ CSDL + GTX Batch (0 tốn AI Quota)
    const candidateVocabs = globalAnalysis.vocabularies || [];
    const candidateWords = candidateVocabs.map((v: any) => v.word).filter(Boolean);

    const dbVocabMap = new Map<string, any>();
    if (candidateWords.length > 0) {
      try {
        const dbRecords = await prisma.vocabulary.findMany({
          where: { word: { in: candidateWords } },
          select: {
            word: true,
            reading: true,
            hanViet: true,
            meaningVi: true,
            jlptLevel: true,
            partOfSpeech: true
          }
        });
        for (const r of dbRecords) {
          if (!dbVocabMap.has(r.word)) dbVocabMap.set(r.word, r);
        }
      } catch {}
    }

    // Dịch các từ vựng chưa có trong DB bằng 1 lần gọi GTX duy nhất
    const missingVocabWords = candidateWords.filter((w: string) => !dbVocabMap.has(w));
    const missingTranslations =
      missingVocabWords.length > 0 ? await TranscriptParserService.translateBatchGtx(missingVocabWords) : [];
    const missingMap = new Map<string, string>();
    missingVocabWords.forEach((w: string, idx: number) => {
      if (missingTranslations[idx]) missingMap.set(w, missingTranslations[idx]);
    });

    const finalVocabs = candidateVocabs.slice(0, 18).map((v: any) => {
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
      const gtxMeaning = missingMap.get(v.word) || 'Từ vựng trọng tâm trong bài';
      return {
        word: v.word,
        reading: v.reading || '',
        hanViet: null,
        meaningVi: v.pos ? `[${v.pos}] ${gtxMeaning}` : gtxMeaning,
        level: targetLevel
      };
    });

    const finalGrammars = (globalAnalysis.grammars || []).slice(0, 10);

    // 3. Tạo Furigana và tính mốc thời gian Mora cho từng câu (kèm gắn ảnh minh họa inline)
    const sentences: any[] = [];
    let accumulatedMs = 0;
    for (let i = 0; i < targetSentences.length; i++) {
      const item = targetSentences[i];
      let furiText = await KuromojiService.addFurigana(item.jp);
      if (item.imageUrl) {
        furiText += `<!--IMG:${item.imageUrl}-->`;
      }
      const estDurationMs = Math.max(2500, Math.round(item.jp.length * 210));
      const startTimeMs = accumulatedMs;
      const endTimeMs = accumulatedMs + estDurationMs;
      accumulatedMs = endTimeMs;

      sentences.push({
        orderIndex: i + 1,
        sentenceJp: item.jp,
        sentenceVi: sentenceTranslations[i] || '',
        furigana: furiText,
        startTimeMs,
        endTimeMs
      });
    }

    // 4. Tạo bản dịch toàn bài (translationFull) chia theo đoạn
    const paraBlocks: string[] = [];
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
    if (cleanUrl.includes('nhk.or.jp') || fallbackMeta?.sourceName === 'NHK_NEWS') topicLabel = 'NHK News • Thời sự Nhật Bản';
    else if (cleanUrl.includes('nippon.com')) topicLabel = 'Nippon.com • Văn hóa & Xã hội';
    else if (cleanUrl.includes('toyokeizai.net')) topicLabel = 'Toyo Keizai • Kinh tế & Đời sống';
    else if (cleanUrl.includes('president.jp')) topicLabel = 'President JP • Công việc & Xã hội';
    else if (cleanUrl.includes('gigazine.net')) topicLabel = 'GIGAZINE • Công nghệ & Khoa học';
    else if (cleanUrl.includes('livedoor.com')) topicLabel = 'Livedoor News • Xã hội & Đời sống';
    else if (cleanUrl.includes('yahoo.co.jp')) topicLabel = 'Yahoo! News JP • Tiêu điểm';

    const displayTitle =
      titleVi && !cleanTitleJp.includes('(') && titleVi !== cleanTitleJp
        ? `${cleanTitleJp} (${titleVi})`
        : cleanTitleJp;

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
                    meaningVi: v.meaningVi || 'Từ vựng trọng tâm trong bài',
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
                    grammarPoint: g.grammar || g.grammarPoint || 'Cấu trúc ngữ pháp',
                    meaningVi: g.meaningVi || 'Cấu trúc ngữ pháp trong bài',
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
      }
    });

    await RedisService.delPrefix('reading:list:');
    return await this.getArticleDetail(newArticle.id);
  }
}
