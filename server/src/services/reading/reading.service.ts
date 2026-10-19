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
   * Dọn dẹp các bài báo cũ để CSDL luôn gọn gàng, không bị phình to
   * Tiêu chí: Bài cào tin tức tự động (EXTERNAL_NEWS), đã qua 60 ngày, và có số lượt xem <= 1
   */
  static async cleanupStaleArticles(retentionDays = 7): Promise<{ deletedCount: number }> {
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
      return { deletedCount: 0 };
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

    console.log(`[DB GC] Đã dọn dẹp ${result.count} bài báo rác (>7 ngày, không ai lưu).`);
    return { deletedCount: result.count };
  }
  /**
   * Lấy danh sách bài đọc từ Thư Viện Dùng Chung (Community Public Library)
   * 0 Token tiêu tốn! Hỗ trợ lọc theo level, topic, sourceType.
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
        orderBy: [{ viewCount: 'desc' }, { createdAt: 'desc' }],
        include: {
          _count: {
            select: {
              sentences: true,
              vocabularies: true,
              grammars: true,
              quizzes: true
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
  }

  /**
   * Lấy chi tiết bài đọc (Bao gồm câu karaoke, từ vựng, ngữ pháp, trắc nghiệm)
   * Có bộ đệm Redis hot cache (< 5ms)
   */
  static async getArticleDetail(articleId: string) {
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
   * Lấy danh sách tin tức báo chí tiếng Nhật mới nhất từ các nguồn RSS (NHK, Asahi, Mainichi, Yahoo JP)
   * Có bộ đệm Redis cache 30 phút.
   */
  
  static async fetchRawRssFeeds(source?: string) {
    const Parser = require('rss-parser');
    const parser = new Parser();
    const defaultSourceImages: Record<string, string> = {
      NHK: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80',
      LIVEDOOR: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
      YAHOO: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80'
    };
    
    const feeds = [
        { name: 'NHK_NEWS', url: 'https://www3.nhk.or.jp/rss/news/cat0.xml', defaultLevel: 'N3' },
        { name: 'LIVEDOOR', url: 'https://news.livedoor.com/topics/rss/top.xml', defaultLevel: 'N2' },
        { name: 'GIGAZINE', url: 'https://gigazine.net/news/rss_2.0/', defaultLevel: 'N2' },
        { name: 'YOMIURI', url: 'https://assets.yomiuri.co.jp/rss/science.xml', defaultLevel: 'N2' }
      ];

    const activeFeeds = source && source !== 'ALL'
      ? feeds.filter(f => f.name.toUpperCase() === source.toUpperCase())
      : feeds;

    const allArticles: any[] = [];

    await Promise.allSettled(
      activeFeeds.map(async (feed) => {
        try {
          const axios = require('axios');
          const res = await axios.get(feed.url, { timeout: 8000 });
          const parsed = await parser.parseString(res.data);

          parsed.items.slice(0, 15).forEach((item: any) => {
            const cleanUrl = item.link?.split('?')[0] || '';
            allArticles.push({
              title: item.title,
              link: cleanUrl,
              pubDate: item.pubDate,
              contentSnippet: item.contentSnippet || item.content || '',
              sourceName: feed.name,
              levelEstimate: feed.defaultLevel,
              imageUrl: item.enclosure?.url || item.image?.url || defaultSourceImages[feed.name]
            });
          });
        } catch (e) {}
      })
    );

    const sorted = allArticles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    
    // Lc b_ nh_ng bAi `A x lA
    const urls = sorted.map(a => a.link);
    const existing = await prisma.readingArticle.findMany({
      where: { sourceUrl: { in: urls } },
      select: { sourceUrl: true }
    });
    const existingSet = new Set(existing.map(e => e.sourceUrl));
    
    return sorted.filter(a => !existingSet.has(a.link));
  }

  static async getLatestNews(source?: string) {
    // Trả về trực tiếp live RSS feeds thay vì chỉ lấy từ DB
    return await this.fetchRawRssFeeds(source);
  }

  /**
   * Cào một bài báo từ URL bên ngoài và chuyển hóa thành bài đọc Dokkai tương tác
   * Hỗ trợ:
   * 1. DB-First: Trả về ngay lập tức nếu đã có trong CSDL (0 Token)
   * 2. Single-Flight Lock: Chống Thundering Herd khi nhiều người bấm cùng 1 bài lúc cao điểm
   * 3. Concurrency Limiter: Điều tiết tối đa 3 tác vụ AI cào song song, còn lại xếp hàng đợi FIFO
   */
  static async crawlAndProcessArticle(params: {
    url: string;
    level?: string;
    userId?: string;
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

    // 2. Chống Thundering Herd: Nếu đang có người khác cào cùng URL này, gộp Promise (Single-Flight)
    if (this.crawlInFlight.has(cleanUrl)) {
      return await this.crawlInFlight.get(cleanUrl);
    }

    // 3. Đưa vào hàng đợi điều tiết tải (Semaphore / Concurrency Limiter: Tối đa 3 tác vụ cào đồng thời)
    const crawlPromise = this.enqueueCrawl(async () => {
      // Double check DB phòng trường hợp vừa được lưu bởi request trước đó trong hàng đợi
      const checkAgain = await prisma.readingArticle.findFirst({
        where: { sourceUrl: cleanUrl },
        select: { id: true }
      });
      if (checkAgain) {
        return await this.getArticleDetail(checkAgain.id);
      }

      return await this.executeCrawlAndProcess(cleanUrl, params.level, params.userId);
    });

    this.crawlInFlight.set(cleanUrl, crawlPromise);

    try {
      return await crawlPromise;
    } finally {
      this.crawlInFlight.delete(cleanUrl);
    }
  }

  /**
   * Thực hiện bóc tách bài báo và gọi AI phân tích Dokkai (chạy trong worker queue)
   */
  private static async executeCrawlAndProcess(cleanUrl: string, level?: string, userId?: string) {
    // 2. Cào nội dung bài báo từ URL bên ngoài
    let extractedTitle = '';
      let extractedBody = '';
      let extractedImageUrl = '';
  
      try {
        const res = await axios.get(cleanUrl, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8'
          }
        });
        
        // Import dom & readability dng require vA l< runtime trAsh li types
        const { JSDOM } = require('jsdom');
        const { Readability } = require('@mozilla/readability');

        const dom = new JSDOM(res.data, { url: cleanUrl });
        const reader = new Readability(dom.window.document);
        const articleResult = reader.parse();

        const $ = cheerio.load(res.data);
  
        // TrAch xut nh bAa
        extractedImageUrl =
          $('meta[property="og:image"]').attr('content') ||
          $('meta[name="twitter:image"]').attr('content') ||
          $('article img, .main-text img, .article-body img, #main-content img').first().attr('src') ||
          $('img').first().attr('src') ||
          '';
  
        if (extractedImageUrl && !extractedImageUrl.startsWith('http')) {
          try {
            extractedImageUrl = new URL(extractedImageUrl, cleanUrl).href;
          } catch {}
        }
        
        if (articleResult && articleResult.textContent && articleResult.textContent.length > 50) {
            extractedTitle = articleResult.title || $('h1').first().text().trim() || 'BAi bAo ting Nht';
            // Clean title
            extractedTitle = extractedTitle.replace(/[\-?"|].*$/, '').trim();
            extractedBody = articleResult.textContent.replace(/\n\s*\n/g, '\n\n').trim();
        } else {
            // Fallback cheerio
            extractedTitle = $('h1').first().text().trim() || $('title').text().trim() || 'BAi bAo ting Nht';
            extractedTitle = extractedTitle.replace(/[\-?"|].*$/, '').trim();
            
            $('script, style, noscript, nav, header, footer, iframe, aside, .advertisement, .ad, .sns-share, .social, button, .footer, .header, .menu').remove();
            
            const allParagraphs = $('p, div.text, div.article_body, div.NewsBody, div.paragraph')
              .map((_, p) => $(p).text().trim())
              .get()
              .filter(t => t.length > 15 && /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(t));
            extractedBody = allParagraphs.join('\n\n');
        }
      } catch (crawlErr: any) {
        throw new Error(`Khong the truy cap duong link bai bao: ${crawlErr?.message || 'Loi ket noi'}`);
      }
  
      if (!extractedBody || extractedBody.length < 50) {
        throw new Error('Khong the trich xuat noi dung bai viet tu lien ket nay.');
      }
      if (extractedBody.length > 25000) { extractedBody = extractedBody.slice(0, 25000); }

    // 3. Sử dụng Kuromoji (Local) để gắn Furigana tự động (Zero-AI Cost)
    const effectiveUserId = userId || 'guest_user';
    const targetLevel = level || 'N3';

    const { KuromojiService } = await import('./kuromoji.service');
      const rawSentences = extractedBody.split(/(?<=[。！？\\n])/).map((s: any) => s.trim()).filter((s: any) => s.length > 0);
      
      const globalAnalysis = await KuromojiService.analyzeText(extractedBody);

      const sentences = [];
      for (let i = 0; i < rawSentences.length; i++) {
        const raw = rawSentences[i];
        const sentenceAnalysis = await KuromojiService.analyzeText(raw);
        sentences.push({
          orderIndex: i + 1,
          sentenceJp: raw,
          sentenceVi: "", 
          furigana: sentenceAnalysis.furiganaText,
          grammarFocus: null
        });
      }

      
        let finalVocabs = globalAnalysis.vocabularies;
        let finalGrammars = globalAnalysis.grammars;
        try {
            const { ReadingAiService } = await import('./reading-ai.service');
            const aiData = await ReadingAiService.extractVocabAndGrammar(extractedBody, targetLevel);
            if (aiData.vocabularies && aiData.vocabularies.length > 0) {
                finalVocabs = aiData.vocabularies;
            }
            if (aiData.grammars && aiData.grammars.length > 0) {
                finalGrammars = aiData.grammars;
            }
        } catch(e) {
            console.error("AI extraction failed during crawl, fallback to Kuromoji", e);
        }

        const generated: any = {
          title: extractedTitle || 'Bài báo',
          sentences: sentences,
          vocabularies: finalVocabs,
          grammars: finalGrammars,
          quizzes: []
        };
      
      const tempId = crypto.randomUUID();
      
      // TTS
      let audioData: any = { audioUrl: null, timings: [] };
      try {
         audioData = await TtsService.generateArticleAudio(tempId, generated.sentences.map((s: any) => s.sentenceJp));
      } catch(e) { console.error('TTS Error', e); }

      // Prisma create
      const newArticle = await prisma.readingArticle.create({
        data: {
          id: tempId,
          audioUrl: audioData.audioUrl,
          durationSeconds: audioData.timings.length > 0 ? Math.ceil(audioData.timings[audioData.timings.length - 1].endTimeMs / 1000) : 0,
          title: generated.title,
          sourceType: cleanUrl.includes('nhk') ? 'NHK_NEWS' : 'EXTERNAL_NEWS',
          level: targetLevel,
          topic: 'Tin tức báo chí',
          totalWords: generated.sentences.reduce((acc: number, s: any) => acc + s.sentenceJp.length, 0),
          imageUrl: extractedImageUrl || 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
          isPublic: true,
          createdBy: effectiveUserId,
          sourceUrl: cleanUrl,
          sentences: {
            createMany: {
              data: generated.sentences.map((s: any, idx: number) => ({
                orderIndex: s.orderIndex,
                sentenceJp: s.sentenceJp,
                sentenceVi: s.sentenceVi,
                furigana: s.furigana || null,
                startTimeMs: audioData.timings[idx]?.startTimeMs || 0,
                endTimeMs: audioData.timings[idx]?.endTimeMs || 2000
              }))
            }
          },
          vocabularies: generated.vocabularies && generated.vocabularies.length > 0 ? {
            createMany: {
              data: generated.vocabularies.map((v: any) => ({
                word: v.word, reading: v.reading, meaningVi: v.meaningVi, level: v.level, hanViet: null
              }))
            }
          } : undefined,
          grammars: generated.grammars && generated.grammars.length > 0 ? {
            createMany: {
              data: generated.grammars.map((g: any) => ({
                grammarPoint: g.grammar, meaningVi: g.meaningVi, level: g.level, excerpt: g.explanation || ''
              }))
            }
          } : undefined
        }
      });
      return await this.getArticleDetail(newArticle.id);
  }
}
