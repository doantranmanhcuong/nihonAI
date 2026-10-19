import { NotebookService } from '../notebook/notebook.service';
import { Request, Response } from 'express';
import { ReadingService } from './reading.service';
import { ReadingQuotaService } from './reading-quota.service';
import { ResponseFormatter } from '../../core/api-response';

export class ReadingController {

  static async explainQuiz(req: any, res: any) {
    try {
      const { quizId, message } = req.body;
      if (!quizId || !message) return res.status(400).json(ResponseFormatter.error('Thi?u th�ng tin', 'Missing quizId or message'));

      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      const quiz = await prisma.readingQuiz.findUnique({ where: { id: quizId } });
      if (!quiz) return res.status(404).json(ResponseFormatter.error('Kh�ng t�m th?y', 'Quiz not found'));

      if (quiz.explanation) {
        return res.json(ResponseFormatter.success({ text: quiz.explanation }));
      }

      const { AiTutorService } = require('../ai/ai-tutor.service');
      const explanation = await AiTutorService.chat(req.user.id, message, []);

      if (explanation) {
        await prisma.readingQuiz.update({
          where: { id: quizId },
          data: { explanation }
        });
      }

      res.json(ResponseFormatter.success({ text: explanation }));
    } catch (err: any) {
      console.error('[ReadingController] explainQuiz error:', err);
      res.status(500).json(ResponseFormatter.error('L?i server', err.message));
    }
  }

  /**
   * GET /api/reading/articles
   * Lấy danh sách bài đọc từ Thư viện cộng đồng (0 Token)
   */
  static async listArticles(req: Request, res: Response) {
    const startTime = Date.now();
    try {
      const { level, topic, sourceType, search, page, limit } = req.query;

      const data = await ReadingService.listArticles({
        level: level ? String(level) : undefined,
        topic: topic ? String(topic) : undefined,
        sourceType: sourceType ? String(sourceType) : undefined,
        search: search ? String(search) : undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20
      });

      return res.json(
        ResponseFormatter.success(data, {
          service: 'reading-shadowing-service',
          latencyMs: Date.now() - startTime
        })
      );
    } catch (error: any) {
      return res.status(500).json(
        ResponseFormatter.error('Lỗi khi tải danh sách bài đọc', error?.message || error)
      );
    }
  }

  /**
   * GET /api/reading/articles/:id
   * Lấy chi tiết bài đọc (có Redis cache)
   */
  static async getArticleDetail(req: Request, res: Response) {
    const startTime = Date.now();
    try {
      const { id } = req.params;
      const article = await ReadingService.getArticleDetail(id);

      if (!article) {
        return res.status(404).json(
          ResponseFormatter.error('Không tìm thấy bài đọc với ID tương ứng.')
        );
      }

      return res.json(
        ResponseFormatter.success(article, {
          service: 'reading-shadowing-service',
          latencyMs: Date.now() - startTime
        })
      );
    } catch (error: any) {
      return res.status(500).json(
        ResponseFormatter.error('Lỗi khi tải chi tiết bài đọc', error?.message || error)
      );
    }
  }

  /**
   * GET /api/reading/quota
   * Lấy hạn mức tạo bài đọc AI của người dùng hôm nay
   */
  static async getQuota(req: Request, res: Response) {
    const startTime = Date.now();
    try {
      const userId = (req as any).user?.userId;
      const quota = await ReadingQuotaService.getQuotaStatus(userId);

      return res.json(
        ResponseFormatter.success(quota, {
          service: 'reading-shadowing-service',
          latencyMs: Date.now() - startTime
        })
      );
    } catch (error: any) {
      return res.status(500).json(
        ResponseFormatter.error('Lỗi khi kiểm tra hạn ngạch', error?.message || error)
      );
    }
  }

  /**
   * POST /api/reading/generate
   * Tạo bài đọc chuẩn JLPT Dokkai bằng AI (có trừ hạn ngạch 5 bài/ngày)
   */
  static async generateArticle(req: Request, res: Response) {
    const startTime = Date.now();
    try {
      const { level, topic, customRequirement, providedText, userId } = req.body;

      if (!level || !topic) {
        return res.status(400).json(
          ResponseFormatter.error('Thiếu thông tin: "level" (N5-N1) và "topic" là bắt buộc.')
        );
      }

      const result = await ReadingService.createAiArticle({
        userId: (req as any).user?.userId,
        level,
        topic,
        customRequirement,
        providedText
      });

      return res.status(201).json(
        ResponseFormatter.success(result, {
          service: 'reading-shadowing-service',
          latencyMs: Date.now() - startTime
        })
      );
    } catch (error: any) {
      if (error?.message?.includes('QUOTA_EXCEEDED')) {
        return res.status(429).json(
          ResponseFormatter.error('Quá hạn mức', error.message)
        );
      }

      return res.status(500).json(
        ResponseFormatter.error('Lỗi khi sinh bài đọc bằng AI', error?.message || error)
      );
    }
  }

  /**
   * POST /api/reading/articles/:id/quizzes
   * Sinh thêm câu hỏi Dokkai cho bài đọc
   */
  static async addMoreQuizzes(req: Request, res: Response) {
    const startTime = Date.now();
    try {
      const { id } = req.params;
      const count = req.body?.count ? Number(req.body.count) : 3;
      const currentQuizIds = Array.isArray(req.body?.currentQuizIds) ? req.body.currentQuizIds : [];

      const quizzes = await ReadingService.addMoreQuizzes(id, count, currentQuizIds);

      return res.json(
        ResponseFormatter.success(quizzes, {
          service: 'reading-shadowing-service',
          latencyMs: Date.now() - startTime
        })
      );
    } catch (error: any) {
      return res.status(500).json(
        ResponseFormatter.error('Lỗi khi sinh thêm câu hỏi Dokkai', error?.message || error)
      );
    }
  }

  /**
   * POST /api/reading/translate-selection
   * Dịch chính xác cụm từ bôi đen kèm phân tích ngữ pháp
   */
  static async translateSelection(req: Request, res: Response) {
    const startTime = Date.now();
    try {
      const { text, contextSentence } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json(
          ResponseFormatter.error('Thiếu tham số "text" cần dịch.')
        );
      }

      const result = await ReadingService.translateSelection(text, contextSentence);
      return res.json(
        ResponseFormatter.success(result, {
          service: 'reading-shadowing-service',
          latencyMs: Date.now() - startTime
        })
      );
    } catch (error: any) {
      return res.status(500).json(
        ResponseFormatter.error('Lỗi khi dịch cụm từ bôi đen', error?.message || error)
      );
    }
  }

  /**
   * POST /api/reading/grammar-detail
   * Giải thích chuyên sâu ngữ pháp, cấu trúc và câu trích dẫn
   */
  static async explainGrammar(req: Request, res: Response) {
    const startTime = Date.now();
    try {
      const { grammarPoint, sentence, level } = req.body;
      if (!grammarPoint || typeof grammarPoint !== 'string') {
        return res.status(400).json(
          ResponseFormatter.error('Thiếu tham số "grammarPoint".')
        );
      }

      const result = await ReadingService.explainGrammar(grammarPoint, sentence, level);
      return res.json(
        ResponseFormatter.success(result, {
          service: 'reading-shadowing-service',
          latencyMs: Date.now() - startTime
        })
      );
    } catch (error: any) {
      return res.status(500).json(
        ResponseFormatter.error('Lỗi khi giải thích cấu trúc ngữ pháp', error?.message || error)
      );
    }
  }

  /**
   * GET /api/reading/news/latest
   * Lấy danh sách tin tức báo chí tiếng Nhật mới nhất từ RSS NHK, Asahi, Mainichi, Yahoo JP
   */
  static async getLatestNews(req: Request, res: Response) {
    const startTime = Date.now();
    try {
      const { source } = req.query;
      const data = await ReadingService.getLatestNews(source ? String(source) : undefined);

      return res.json(
        ResponseFormatter.success(data, {
          service: 'reading-shadowing-service',
          latencyMs: Date.now() - startTime
        })
      );
    } catch (error: any) {
      return res.status(500).json(
        ResponseFormatter.error('Lỗi khi tải tin tức báo chí Nhật Bản', error?.message || error)
      );
    }
  }

  /**
   * POST /api/reading/news/import
   * Cào và phân tích bài báo mạng tiếng Nhật thành bài học Dokkai
   */
  static async importFromUrl(req: Request, res: Response) {
    const startTime = Date.now();
    try {
      const { url, level, userId } = req.body;
      if (!url || typeof url !== 'string') {
        return res.status(400).json(
          ResponseFormatter.error('Thiếu tham số "url" bài báo.')
        );
      }

      const article = await ReadingService.crawlAndProcessArticle({
        url,
        level: level ? String(level) : 'N3',
        userId: (req as any).user?.userId
      });

      return res.json(
        ResponseFormatter.success(article, {
          service: 'reading-shadowing-service',
          latencyMs: Date.now() - startTime
        })
      );
    } catch (error: any) {
      return res.status(500).json(
        ResponseFormatter.error(error?.message || 'Lỗi khi nhập và phân tích bài báo', error?.message || error)
      );
    }
  }

  /**
   * POST /api/reading/news/trigger-crawl
   * Kích hoạt cào báo tự động theo lịch (hoặc thủ công theo yêu cầu)
   */
  
  static async saveToNotebook(req: Request, res: Response) {
    try {
      const { itemType, title, reading, meaningVi, level, structure, articleId } = req.body;
      const userId = (req as any).user?.userId; // Fallback
      if (!title || !meaningVi) {
        return res.status(400).json(ResponseFormatter.error('Missing required fields.'));
      }
      
      const item = await NotebookService.saveToNotebook({
        userId, itemType: itemType || 'VOCAB', title, reading, meaningVi, level, structure, articleId });
      return res.json(ResponseFormatter.success(item));
    } catch (error: any) {
      return res.status(500).json(ResponseFormatter.error('Error saving to notebook', error?.message));
    }
  }

  static async triggerNewsCrawl(req: Request, res: Response) {
    const startTime = Date.now();
    try {
      const maxArticles = req.body?.maxArticles ? Number(req.body.maxArticles) : 3;
      const { ReadingCronService } = await import('./reading-cron.service');
      const result = await ReadingCronService.triggerDailyNewsCrawl(maxArticles);

      return res.json(
        ResponseFormatter.success(result, {
          service: 'reading-shadowing-service',
          latencyMs: Date.now() - startTime
        })
      );
    } catch (error: any) {
      return res.status(500).json(
        ResponseFormatter.error('Lỗi khi kích hoạt cào báo', error?.message || error)
      );
    }
  }
}
