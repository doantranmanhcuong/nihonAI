import { Request, Response } from 'express';
import { ShadowingService } from './shadowing.service';
import { ResponseFormatter } from '../../core/api-response';

export class ShadowingController {
  static async syncOffset(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { offsetMs } = req.body;
      
      if (typeof offsetMs !== "number") {
        return res.status(400).json({ success: false, message: "offsetMs is required and must be a number" });
      }

      const result = await ShadowingService.syncSubtitlesOffset(id, offsetMs);
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[ShadowingController] syncOffset Error:", error.message);
      res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
  }

  /**
   * GET /api/shadowing/lessons
   * Lấy danh sách video bài học theo bộ lọc
   */
  static async listLessons(req: Request, res: Response) {
    const startTime = Date.now();
    try {
      const { level, category, channelTitle, search, page, limit } = req.query;

      const data = await ShadowingService.listLessons({
        level: level ? String(level) : undefined,
        category: category ? String(category) : undefined,
        channelTitle: channelTitle ? String(channelTitle) : undefined,
        search: search ? String(search) : undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20
      });

      return res.json(
        ResponseFormatter.success(data, {
          service: 'shadowing-service',
          latencyMs: Date.now() - startTime
        })
      );
    } catch (error: any) {
      return res.status(500).json(
        ResponseFormatter.error('Lỗi khi tải danh sách bài học video', error?.message || error)
      );
    }
  }

  /**
   * GET /api/shadowing/lessons/:id
   * Lấy chi tiết bài học kèm phụ đề mili-giây
   */
  static async getLessonDetail(req: Request, res: Response) {
    const startTime = Date.now();
    try {
      const { id } = req.params;
      const lesson = await ShadowingService.getLessonDetail(id);

      if (!lesson) {
        return res.status(404).json(
          ResponseFormatter.error('Không tìm thấy bài học video với ID tương ứng.')
        );
      }

      return res.json(
        ResponseFormatter.success(lesson, {
          service: 'shadowing-service',
          latencyMs: Date.now() - startTime
        })
      );
    } catch (error: any) {
      return res.status(500).json(
        ResponseFormatter.error('Lỗi khi tải chi tiết bài học video', error?.message || error)
      );
    }
  }

  /**
   * POST /api/shadowing/lessons
   * Tạo bài học video mới kèm phụ đề
   */
  static async createLesson(req: Request, res: Response) {
    const startTime = Date.now();
    try {
      const { title, youtubeId, level, topic, category, durationSeconds, description, subtitles } = req.body;

      if (!title || !youtubeId) {
        return res.status(400).json(
          ResponseFormatter.error('Thiếu thông tin bắt buộc: "title" và "youtubeId".')
        );
      }

      const lesson = await ShadowingService.createLesson({
        title,
        youtubeId,
        level,
        topic,
        category,
        durationSeconds,
        description,
        subtitles: subtitles || []
      });

      return res.status(201).json(
        ResponseFormatter.success(lesson, {
          service: 'shadowing-service',
          latencyMs: Date.now() - startTime
        })
      );
    } catch (error: any) {
      return res.status(500).json(
        ResponseFormatter.error('Lỗi khi khởi tạo bài học video', error?.message || error)
      );
    }
  }

  /**
   * POST /api/shadowing/process-youtube
   * Xử lý thông minh khi người dùng dán link YouTube tiếng Nhật:
   * - Lấy metadata (oEmbed)
   * - Phân tích AI bóc tách câu thoại & phụ đề mili-giây
   * - Lưu CSDL MySQL quan hệ 1-N & Cache Redis
   */
  static async processYouTube(req: Request, res: Response) {
    const startTime = Date.now();
    try {
      const { url, level, category, rawTranscript, srtContent, autoSync, forceRefresh } = req.body;

      if (!url || typeof url !== 'string' || !url.trim()) {
        return res.status(400).json(
          ResponseFormatter.error('Vui lòng cung cấp đường dẫn video YouTube hợp lệ.')
        );
      }

      const lesson = await ShadowingService.processYouTubeUrl({
        url: url.trim(),
        level: level ? String(level) : 'N3',
        category: category ? String(category) : 'Văn Hóa & Đời Sống',
        rawTranscript,
        srtContent,
        autoSync: autoSync !== undefined ? autoSync : true,
        forceRefresh
      });

      return res.json(
        ResponseFormatter.success(lesson, {
          service: 'shadowing-service',
          latencyMs: Date.now() - startTime
        })
      );
    } catch (error: any) {
      return res.status(500).json(
        ResponseFormatter.error(error?.message || 'Lỗi khi xử lý link YouTube tiếng Nhật.', error)
      );
    }
  }

  /**
   * POST /api/shadowing/explain-word
   * Tra cứu từ vựng tức thì phong cách Corodomo (On-demand)
   */
  static async explainWord(req: Request, res: Response) {
    const startTime = Date.now();
    try {
      const { word, context } = req.body;
      if (!word) {
        return res.status(400).json(ResponseFormatter.error('Thiếu từ cần tra cứu.'));
      }
      const data = await ShadowingService.explainWord(word, context);
      return res.json(
        ResponseFormatter.success(data, {
          service: 'shadowing-service',
          latencyMs: Date.now() - startTime
        })
      );
    } catch (error: any) {
      return res.status(500).json(
        ResponseFormatter.error('Lỗi khi tra cứu từ vựng', error?.message || error)
      );
    }
  }
}

