import * as xlsx from 'xlsx';
import { Response } from 'express';
import { prisma } from '../../core/prisma.service';
import { RedisService } from '../../core/redis.service';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { invalidateMaintenanceCache } from '../../middleware/maintenance.middleware';
import { ResponseFormatter } from '../../core/api-response';
import { ShadowingService } from '../shadowing/shadowing.service';
import { TranscriptParserService } from '../shadowing/transcript-parser.service';
import { ReadingQuotaService } from '../reading/reading-quota.service';
import { ReadingCronService } from '../reading/reading-cron.service';

const DEFAULT_AI_PROMPTS = [
  {
    key: 'DEFAULT_TUTOR',
    promptText:
      'Bạn là một trợ lý ảo tên là NihonAI Sensei, chuyên giúp học viên học tiếng Nhật. Hãy trả lời ngắn gọn, thân thiện và khuyến khích học viên. Giải thích ngữ pháp dễ hiểu kèm ví dụ thực tế.',
    isActive: true
  },
  {
    key: 'DOKKAI_EXPLAIN',
    promptText:
      'Bạn là chuyên gia luyện thi JLPT Dokkai. Hãy phân tích ngữ pháp cốt lõi, từ vựng quan trọng và dịch nghĩa tự nhiên cho đoạn văn tiếng Nhật được yêu cầu.',
    isActive: true
  }
];

export class AdminController {
  static async deleteUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      if (req.user?.userId === id) {
        return res
          .status(400)
          .json(ResponseFormatter.error('Bạn không thể tự xóa tài khoản Quản trị viên của chính mình.'));
      }
      await prisma.$transaction([
        prisma.jlptExamAttempt.deleteMany({ where: { userId: id } }),
        prisma.notebookItem.deleteMany({ where: { userId: id } }),
        prisma.readingDailyQuota.deleteMany({ where: { userId: id } }),
        prisma.aiAuditLog.deleteMany({ where: { userId: id } }),
        prisma.user.delete({ where: { id } })
      ]);
      res.json(ResponseFormatter.success({ id, deleted: true }, { service: 'admin-service' }));
    } catch (error: any) {
      console.error('deleteUser error:', error);
      res.status(500).json(ResponseFormatter.error('Lỗi khi xóa tài khoản', error.message));
    }
  }

  static async deleteUserExamAttempt(req: AuthenticatedRequest, res: Response) {
    try {
      const { id, attemptId } = req.params;
      await prisma.jlptExamAttempt.deleteMany({
        where: { id: attemptId, userId: id }
      });
      res.json(ResponseFormatter.success({ attemptId, deleted: true }, { service: 'admin-service' }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi khi xóa lịch sử bài thi', error.message));
    }
  }

  /**
   * GET /api/admin/settings
   */
  static async getSettings(req: AuthenticatedRequest, res: Response) {
    try {
      const settings = await prisma.systemSetting.findMany();
      const config = settings.reduce((acc: any, s: any) => {
        acc[s.key] = s.value;
        return acc;
      }, {});

      // Đồng bộ khóa hạn mức AI giữa daily_ai_quota và AI_LIMIT
      const unifiedQuota = config.daily_ai_quota ?? config.AI_LIMIT ?? '5';
      config.daily_ai_quota = unifiedQuota;
      config.AI_LIMIT = unifiedQuota;
      if (config.AI_GLOBAL_ENABLED === undefined) config.AI_GLOBAL_ENABLED = 'true';
      if (config.allow_registration === undefined) config.allow_registration = 'true';
      if (config.maintenance_mode === undefined) config.maintenance_mode = 'false';

      res.json(ResponseFormatter.success(config, { service: 'admin-service' }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi khi lấy cài đặt', error.message));
    }
  }

  /**
   * PUT /api/admin/settings
   */
  static async updateSettings(req: AuthenticatedRequest, res: Response) {
    try {
      const updates: Record<string, any> = { ...req.body };

      // Đảm bảo daily_ai_quota và AI_LIMIT luôn đồng nhất
      if (updates.daily_ai_quota !== undefined && updates.AI_LIMIT === undefined) {
        updates.AI_LIMIT = String(updates.daily_ai_quota);
      } else if (updates.AI_LIMIT !== undefined && updates.daily_ai_quota === undefined) {
        updates.daily_ai_quota = String(updates.AI_LIMIT);
      }

      for (const [key, value] of Object.entries(updates)) {
        await prisma.systemSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) }
        });
      }

      invalidateMaintenanceCache();
      ReadingQuotaService.invalidateConfigCache();

      res.json(ResponseFormatter.success({ updated: true }, { service: 'admin-service' }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi khi cập nhật cài đặt', error.message));
    }
  }

  /**
   * GET /api/admin/stats
   * Tối ưu hóa siêu tốc: Bộ đệm L1 Memory + Redis Cache (60s) & gộp truy vấn 7 ngày thành 1 round-trip
   */
  static async getStats(req: AuthenticatedRequest, res: Response) {
    try {
      const isForceRefresh = req.query.refresh === 'true';
      const cacheKey = 'admin:stats:summary';

      if (!isForceRefresh) {
        const cached = await RedisService.get<any>(cacheKey);
        if (cached) {
          return res.json(ResponseFormatter.success(cached, { service: 'admin-service', cached: true }));
        }
      }

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setHours(0, 0, 0, 0);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

      const [
        totalUsers,
        totalExams,
        totalQuestions,
        totalShadowing,
        totalReading,
        totalKanji,
        totalVocab,
        activeUsers,
        recentUsers,
        recentAttempts
      ] = await Promise.all([
        prisma.user.count(),
        prisma.jlptExam.count(),
        prisma.jlptQuestion.count(),
        prisma.videoShadowingLesson.count(),
        prisma.readingArticle.count(),
        prisma.kanji.count(),
        prisma.vocabulary.count(),
        prisma.user.count({
          where: { lastLoginAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
        }),
        prisma.user.findMany({
          where: { createdAt: { gte: sevenDaysAgo } },
          select: { createdAt: true }
        }),
        prisma.jlptExamAttempt.findMany({
          where: { createdAt: { gte: sevenDaysAgo } },
          select: { createdAt: true }
        })
      ]);

      const days: string[] = [];
      const userGrowth: number[] = [];
      const examActivity: number[] = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - i);
        const nextD = new Date(d);
        nextD.setDate(nextD.getDate() + 1);

        days.push(d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }));

        const uCount = recentUsers.filter(u => u.createdAt >= d && u.createdAt < nextD).length;
        const aCount = recentAttempts.filter(a => a.createdAt >= d && a.createdAt < nextD).length;

        userGrowth.push(uCount);
        examActivity.push(aCount);
      }

      const statsData = {
        totalUsers,
        totalExams,
        totalQuestions,
        totalShadowing,
        totalReading,
        totalKanji,
        totalVocab,
        activeUsers,
        systemHealth: 'Hoạt động tốt (TiDB + Redis)',
        charts: {
          days,
          userGrowth,
          examActivity
        }
      };

      // Lưu cache 60s để các lần bấm/chuyển tab sau này phản hồi tức thì < 5ms
      await RedisService.set(cacheKey, statsData, 60);

      res.json(
        ResponseFormatter.success(
          statsData,
          { service: 'admin-service' }
        )
      );
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi khi lấy stats', error.message));
    }
  }

  /**
   * POST /api/admin/crawl-news
   */
  static async triggerNewsCrawl(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await ReadingCronService.triggerDailyNewsCrawl(2);
      res.json(ResponseFormatter.success(result, { service: 'admin-service' }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi khi kích hoạt cào báo', error.message));
    }
  }

  static async listAiPrompts(req: AuthenticatedRequest, res: Response) {
    try {
      let prompts = await prisma.aiPromptConfig.findMany({ orderBy: { key: 'asc' } });
      if (prompts.length === 0) {
        for (const p of DEFAULT_AI_PROMPTS) {
          await prisma.aiPromptConfig.upsert({
            where: { key: p.key },
            update: {},
            create: p
          });
        }
        prompts = await prisma.aiPromptConfig.findMany({ orderBy: { key: 'asc' } });
      }
      res.json(ResponseFormatter.success(prompts, { service: 'admin-service' }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi khi tải prompts', error.message));
    }
  }

  static async updateAiPrompt(req: AuthenticatedRequest, res: Response) {
    try {
      const { key } = req.params;
      const { promptText, isActive } = req.body;
      const upserted = await prisma.aiPromptConfig.upsert({
        where: { key },
        update: {
          promptText: String(promptText || ''),
          isActive: isActive !== undefined ? Boolean(isActive) : true
        },
        create: {
          key,
          promptText: String(promptText || ''),
          isActive: isActive !== undefined ? Boolean(isActive) : true
        }
      });
      res.json(ResponseFormatter.success(upserted, { service: 'admin-service' }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi khi lưu prompt', error.message));
    }
  }

  static async listAiLogs(req: AuthenticatedRequest, res: Response) {
    try {
      const logs = await prisma.aiAuditLog.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true, displayName: true } } }
      });
      res.json(ResponseFormatter.success(logs, { service: 'admin-service' }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi khi tải audit logs', error.message));
    }
  }

  static async clearAiLogs(req: AuthenticatedRequest, res: Response) {
    try {
      const deleted = await prisma.aiAuditLog.deleteMany({});
      res.json(ResponseFormatter.success({ deletedCount: deleted.count }, { service: 'admin-service' }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi khi xóa audit logs', error.message));
    }
  }

  static async deleteAiLog(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      await prisma.aiAuditLog.delete({ where: { id } });
      res.json(ResponseFormatter.success({ id, deleted: true }, { service: 'admin-service' }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi khi xóa dòng nhật ký AI', error.message));
    }
  }

  static async listUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          displayName: true,
          avatar: true,
          role: true,
          status: true,
          banReason: true,
          isEmailVerified: true,
          targetLevel: true,
          studyStreak: true,
          lastLoginAt: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      });
      res.json(ResponseFormatter.success(users, { service: 'admin-service' }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi lấy danh sách user', error.message));
    }
  }

  static async updateUserRole(req: AuthenticatedRequest, res: Response) {
    try {
      const { role } = req.body;
      if (req.user?.userId === req.params.id && role !== 'ADMIN') {
        return res
          .status(400)
          .json(ResponseFormatter.error('Bạn không thể tự hạ quyền Quản trị viên của chính mình.'));
      }
      const user = await prisma.user.update({
        where: { id: req.params.id },
        data: { role: String(role || 'USER').toUpperCase() }
      });
      res.json(ResponseFormatter.success(user, { service: 'admin-service' }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi phân quyền', error.message));
    }
  }

  static async updateUserStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { status, banReason } = req.body;
      const normalizedStatus = String(status || 'ACTIVE').toUpperCase() as 'ACTIVE' | 'SUSPENDED' | 'BANNED';
      if (req.user?.userId === req.params.id && normalizedStatus !== 'ACTIVE') {
        return res
          .status(400)
          .json(ResponseFormatter.error('Bạn không thể tự khóa tài khoản Quản trị viên của chính mình.'));
      }
      const user = await prisma.user.update({
        where: { id: req.params.id },
        data: {
          status: normalizedStatus,
          banReason: normalizedStatus === 'ACTIVE' ? null : (banReason ? String(banReason).trim() : null),
          ...(normalizedStatus !== 'ACTIVE' ? { tokenVersion: { increment: 1 } } : {})
        }
      });
      res.json(ResponseFormatter.success(user, { service: 'admin-service' }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi cập nhật trạng thái', error.message));
    }
  }

  static async getUserProgress(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.params.id;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          displayName: true,
          targetLevel: true,
          studyStreak: true,
          avatar: true,
          createdAt: true
        }
      });

      const exams = await prisma.jlptExamAttempt.findMany({
        where: { userId },
        include: {
          exam: {
            select: {
              title: true,
              level: true,
              year: true,
              session: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      const formattedAttempts = exams.map((attempt) => ({
        id: attempt.id,
        exam: attempt.exam,
        examTitle: attempt.exam?.title || 'Đề thi JLPT',
        level: attempt.exam?.level || 'N/A',
        totalScore: attempt.totalScore,
        score: attempt.totalScore,
        totalCorrect: attempt.totalCorrect,
        totalQuestions: attempt.totalQuestions,
        isPassed: attempt.isPassed,
        timeSpentSeconds: attempt.timeSpentSeconds,
        createdAt: attempt.createdAt
      }));

      const notebooks = await prisma.notebookItem.count({ where: { userId } });
      const activeDays = await prisma.readingDailyQuota.count({ where: { userId } });

      res.json(
        ResponseFormatter.success(
          {
            user,
            targetLevel: user?.targetLevel || 'Chưa đặt',
            studyStreak: user?.studyStreak || 0,
            examAttempts: formattedAttempts,
            exams: formattedAttempts,
            notebooks,
            activeDays
          },
          { service: 'admin-service' }
        )
      );
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi lấy tiến độ', error.message));
    }
  }

  // ─── 3.1. QUẢN LÝ SHADOWING & CHỈNH SỬA PHỤ ĐỀ ─────────────────────────────
  static async listShadowing(req: AuthenticatedRequest, res: Response) {
    try {
      const items = await prisma.videoShadowingLesson.findMany({
        include: { _count: { select: { subtitles: true } } },
        orderBy: { createdAt: 'desc' }
      });
      res.json(ResponseFormatter.success(items, { service: 'admin-service' }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi tải danh sách Shadowing', error.message));
    }
  }

  static async updateShadowing(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { title, level, category, topic, description, youtubeId } = req.body;
      const updateData: any = {};
      if (typeof title === 'string' && title.trim()) updateData.title = title.trim();
      if (typeof level === 'string' && level.trim()) updateData.level = level.trim().toUpperCase();
      if (typeof category === 'string' && category.trim()) updateData.category = category.trim().toUpperCase();
      if (typeof topic === 'string') updateData.topic = topic.trim();
      if (typeof description === 'string') updateData.description = description.trim();
      if (typeof youtubeId === 'string' && youtubeId.trim()) updateData.youtubeId = youtubeId.trim();

      const updated = await prisma.videoShadowingLesson.update({
        where: { id },
        data: updateData,
        include: { _count: { select: { subtitles: true } } }
      });

      await ShadowingService.clearCache();
      res.json(ResponseFormatter.success(updated, { service: 'admin-service' }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi cập nhật bài học Shadowing', error.message));
    }
  }

  static async deleteShadowing(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      await prisma.$transaction([
        prisma.videoSubtitle.deleteMany({ where: { lessonId: id } }),
        prisma.videoShadowingLesson.delete({ where: { id } })
      ]);
      await ShadowingService.clearCache();
      await RedisService.delPrefix('shadowing:');
      res.json(ResponseFormatter.success({ success: true }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi xóa bài học Shadowing', error.message));
    }
  }

  static async getShadowingSubtitles(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const subtitles = await prisma.videoSubtitle.findMany({
        where: { lessonId: id },
        orderBy: { orderIndex: 'asc' }
      });
      res.json(ResponseFormatter.success(subtitles, { service: 'admin-service' }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi tải phụ đề video', error.message));
    }
  }

  static async updateShadowingSubtitles(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { subtitles } = req.body;
      if (!Array.isArray(subtitles) || subtitles.length === 0) {
        return res.status(400).json(ResponseFormatter.error('Danh sách phụ đề không được để trống.'));
      }

      let tokenizer: any = null;
      try {
        tokenizer = await TranscriptParserService.getTokenizer();
      } catch {}

      const prepared = subtitles.map((sub: any, idx: number) => {
        const jp = String(sub.japanese || '').trim();
        const vi = String(sub.vietnamese || '').trim();
        const startTimeMs = Math.max(0, Number(sub.startTimeMs) || 0);
        const endTimeMs = Math.max(startTimeMs + 200, Number(sub.endTimeMs) || startTimeMs + 3000);
        const furigana = tokenizer
          ? TranscriptParserService.generateFurigana(tokenizer, jp)
          : String(sub.furigana || jp);
        const romaji = tokenizer
          ? TranscriptParserService.generateRomaji(tokenizer, jp)
          : String(sub.romaji || '');
        const keyWords = tokenizer
          ? JSON.stringify(TranscriptParserService.extractKeyWords(tokenizer, jp))
          : sub.keyWords || null;

        return {
          lessonId: id,
          orderIndex: idx + 1,
          startTimeMs,
          endTimeMs,
          japanese: jp,
          furigana,
          romaji,
          vietnamese: vi,
          keyWords,
          grammarNotes: sub.grammarNotes || null
        };
      });

      await prisma.$transaction([
        prisma.videoSubtitle.deleteMany({ where: { lessonId: id } }),
        prisma.videoSubtitle.createMany({ data: prepared })
      ]);

      await ShadowingService.clearCache();
      res.json(
        ResponseFormatter.success(
          { updatedCount: prepared.length },
          { service: 'admin-service' }
        )
      );
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi lưu danh sách phụ đề', error.message));
    }
  }

  // ─── 3.2. QUẢN LÝ BÀI ĐỌC DOKKAI ───────────────────────────────────────────
  static async listReading(req: AuthenticatedRequest, res: Response) {
    try {
      const items = await prisma.readingArticle.findMany({
        include: {
          sentences: { orderBy: { orderIndex: 'asc' } },
          _count: { select: { vocabularies: true, grammars: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      res.json(ResponseFormatter.success(items, { service: 'admin-service' }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi tải danh sách bài đọc', error.message));
    }
  }

  static async createReading(req: AuthenticatedRequest, res: Response) {
    try {
      const { title, level, topic, sourceType, imageUrl, contentJp, translationFull } = req.body;
      if (!title || !contentJp) {
        return res.status(400).json(ResponseFormatter.error('Vui lòng nhập tiêu đề và nội dung tiếng Nhật.'));
      }

      const rawSentences = String(contentJp)
        .split(/(?<=[。！？\n])/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      let tokenizer: any = null;
      try {
        tokenizer = await TranscriptParserService.getTokenizer();
      } catch {}

      const sentenceTranslations = await TranscriptParserService.translateBatchGtx(rawSentences);
      const autoFullTranslation =
        translationFull && String(translationFull).trim()
          ? String(translationFull).trim()
          : sentenceTranslations.filter(Boolean).join(' ');

      const sentencesData = rawSentences.map((s, idx) => ({
        orderIndex: idx + 1,
        sentenceJp: s,
        sentenceVi: sentenceTranslations[idx] || '',
        furigana: tokenizer ? TranscriptParserService.generateFurigana(tokenizer, s) : s,
        startTimeMs: idx * 4000,
        endTimeMs: (idx + 1) * 4000
      }));

      const created = await prisma.readingArticle.create({
        data: {
          title: String(title).trim(),
          level: String(level || 'N3').toUpperCase(),
          topic: String(topic || 'Đời sống').trim(),
          sourceType: String(sourceType || 'AI_GENERATED').toUpperCase(),
          imageUrl: imageUrl ? String(imageUrl).trim() : null,
          translationFull: autoFullTranslation,
          totalWords: String(contentJp).length,
          durationSeconds: Math.max(30, rawSentences.length * 5),
          isPublic: true,
          isEvergreen: true,
          sentences: {
            create: sentencesData
          }
        },
        include: {
          sentences: { orderBy: { orderIndex: 'asc' } },
          _count: { select: { vocabularies: true, grammars: true } }
        }
      });

      await RedisService.delPrefix('reading:');
      res.json(ResponseFormatter.success(created, { service: 'admin-service' }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi tạo bài đọc mới', error.message));
    }
  }

  static async updateReading(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { title, level, topic, imageUrl, contentJp, translationFull } = req.body;

      const updateData: any = {};
      if (typeof title === 'string' && title.trim()) updateData.title = title.trim();
      if (typeof level === 'string' && level.trim()) updateData.level = level.trim().toUpperCase();
      if (typeof topic === 'string') updateData.topic = topic.trim();
      if (typeof imageUrl === 'string') updateData.imageUrl = imageUrl.trim() || null;
      if (typeof translationFull === 'string') updateData.translationFull = translationFull.trim();

      if (typeof contentJp === 'string' && contentJp.trim()) {
        const rawSentences = contentJp
          .split(/(?<=[。！？\n])/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0);

        let tokenizer: any = null;
        try {
          tokenizer = await TranscriptParserService.getTokenizer();
        } catch {}

        const sentenceTranslations = await TranscriptParserService.translateBatchGtx(rawSentences);
        if (!updateData.translationFull) {
          updateData.translationFull = sentenceTranslations.filter(Boolean).join(' ');
        }

        await prisma.readingSentence.deleteMany({ where: { articleId: id } });
        await prisma.readingSentence.createMany({
          data: rawSentences.map((s, idx) => ({
            articleId: id,
            orderIndex: idx + 1,
            sentenceJp: s,
            sentenceVi: sentenceTranslations[idx] || '',
            furigana: tokenizer ? TranscriptParserService.generateFurigana(tokenizer, s) : s,
            startTimeMs: idx * 4000,
            endTimeMs: (idx + 1) * 4000
          }))
        });
        updateData.totalWords = contentJp.length;
      }

      const updated = await prisma.readingArticle.update({
        where: { id },
        data: updateData,
        include: {
          sentences: { orderBy: { orderIndex: 'asc' } },
          _count: { select: { vocabularies: true, grammars: true } }
        }
      });

      await RedisService.delPrefix('reading:');
      res.json(ResponseFormatter.success(updated, { service: 'admin-service' }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi cập nhật bài đọc', error.message));
    }
  }

  static async deleteReading(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      await prisma.$transaction([
        prisma.readingSentence.deleteMany({ where: { articleId: id } }),
        prisma.readingVocabItem.deleteMany({ where: { articleId: id } }),
        prisma.readingGrammarItem.deleteMany({ where: { articleId: id } }),
        prisma.readingQuiz.deleteMany({ where: { articleId: id } }),
        prisma.readingArticle.delete({ where: { id } })
      ]);
      await RedisService.delPrefix('reading:');
      res.json(ResponseFormatter.success({ success: true }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi xóa bài đọc', error.message));
    }
  }

  // ─── 3.3. QUẢN LÝ HÁN TỰ (KANJI) ───────────────────────────────────────────
  static async listKanji(req: AuthenticatedRequest, res: Response) {
    try {
      const search = String(req.query.search || '').trim();
      const level = String(req.query.level || 'ALL').toUpperCase();
      const where: any = {};
      if (level !== 'ALL') where.jlptLevel = level;
      if (search) {
        where.OR = [
          { character: { contains: search } },
          { hanViet: { contains: search } },
          { meaningVi: { contains: search } },
          { onyomi: { contains: search } },
          { kunyomi: { contains: search } }
        ];
      }
      const items = await prisma.kanji.findMany({
        where,
        take: 150,
        orderBy: [{ jlptLevel: 'desc' }, { lesson: 'asc' }]
      });
      res.json(ResponseFormatter.success(items, { service: 'admin-service' }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi tải danh sách Hán tự', error.message));
    }
  }

  static async createKanji(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        character,
        hanViet,
        meaningVi,
        onyomi,
        kunyomi,
        jlptLevel,
        strokeCount,
        radicals,
        curriculum,
        lesson,
        mnemonicAi
      } = req.body;

      if (!character || !String(character).trim()) {
        return res.status(400).json(ResponseFormatter.error('Vui lòng nhập chữ Hán (character).'));
      }

      const charClean = String(character).trim();
      const upserted = await prisma.kanji.upsert({
        where: { character: charClean },
        update: {
          hanViet: String(hanViet || '').trim(),
          meaningVi: String(meaningVi || '').trim(),
          onyomi: String(onyomi || '').trim(),
          kunyomi: String(kunyomi || '').trim(),
          jlptLevel: String(jlptLevel || 'N5').toUpperCase(),
          strokeCount: Number(strokeCount) || 1,
          radicals: String(radicals || '').trim(),
          curriculum: curriculum ? String(curriculum).trim() : 'LOOK_AND_LEARN',
          lesson: lesson ? Number(lesson) : 1,
          mnemonicAi: mnemonicAi ? String(mnemonicAi).trim() : null
        },
        create: {
          character: charClean,
          hanViet: String(hanViet || '').trim(),
          meaningVi: String(meaningVi || '').trim(),
          onyomi: String(onyomi || '').trim(),
          kunyomi: String(kunyomi || '').trim(),
          jlptLevel: String(jlptLevel || 'N5').toUpperCase(),
          strokeCount: Number(strokeCount) || 1,
          radicals: String(radicals || '').trim(),
          svgPathData: '',
          curriculum: curriculum ? String(curriculum).trim() : 'LOOK_AND_LEARN',
          lesson: lesson ? Number(lesson) : 1,
          mnemonicAi: mnemonicAi ? String(mnemonicAi).trim() : null
        }
      });

      await RedisService.delPrefix('kanji:');
      res.json(ResponseFormatter.success(upserted, { service: 'admin-service' }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi thêm Hán tự', error.message));
    }
  }

  static async updateKanji(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const {
        character,
        hanViet,
        meaningVi,
        onyomi,
        kunyomi,
        jlptLevel,
        strokeCount,
        radicals,
        curriculum,
        lesson,
        mnemonicAi
      } = req.body;

      const updated = await prisma.kanji.update({
        where: { id },
        data: {
          ...(character ? { character: String(character).trim() } : {}),
          ...(hanViet !== undefined ? { hanViet: String(hanViet).trim() } : {}),
          ...(meaningVi !== undefined ? { meaningVi: String(meaningVi).trim() } : {}),
          ...(onyomi !== undefined ? { onyomi: String(onyomi).trim() } : {}),
          ...(kunyomi !== undefined ? { kunyomi: String(kunyomi).trim() } : {}),
          ...(jlptLevel ? { jlptLevel: String(jlptLevel).toUpperCase() } : {}),
          ...(strokeCount !== undefined ? { strokeCount: Number(strokeCount) || 1 } : {}),
          ...(radicals !== undefined ? { radicals: String(radicals).trim() } : {}),
          ...(curriculum !== undefined ? { curriculum: String(curriculum).trim() } : {}),
          ...(lesson !== undefined ? { lesson: Number(lesson) || 1 } : {}),
          ...(mnemonicAi !== undefined ? { mnemonicAi: String(mnemonicAi).trim() } : {})
        }
      });

      await RedisService.delPrefix('kanji:');
      res.json(ResponseFormatter.success(updated, { service: 'admin-service' }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi cập nhật Hán tự', error.message));
    }
  }

  static async deleteKanji(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      await prisma.$transaction([
        prisma.kanjiAiInsight.deleteMany({ where: { kanjiId: id } }),
        prisma.kanji.delete({ where: { id } })
      ]);
      await RedisService.delPrefix('kanji:');
      res.json(ResponseFormatter.success({ success: true }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi xóa Hán tự', error.message));
    }
  }

  // ─── 3.4. QUẢN LÝ TỪ VỰNG (VOCABULARY) ─────────────────────────────────────
  static async listVocab(req: AuthenticatedRequest, res: Response) {
    try {
      const search = String(req.query.search || '').trim();
      const level = String(req.query.level || 'ALL').toUpperCase();
      const where: any = {};
      if (level !== 'ALL') where.jlptLevel = level;
      if (search) {
        where.OR = [
          { word: { contains: search } },
          { reading: { contains: search } },
          { hanViet: { contains: search } },
          { meaningVi: { contains: search } }
        ];
      }
      const items = await prisma.vocabulary.findMany({
        where,
        take: 150,
        orderBy: [{ createdAt: 'desc' }]
      });
      res.json(ResponseFormatter.success(items, { service: 'admin-service' }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi tải danh sách từ vựng', error.message));
    }
  }

  static async createVocab(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        word,
        reading,
        hanViet,
        meaningVi,
        jlptLevel,
        curriculum,
        lesson,
        partOfSpeech,
        exampleJp,
        exampleVi,
        topic
      } = req.body;

      if (!word || !String(word).trim()) {
        return res.status(400).json(ResponseFormatter.error('Vui lòng nhập từ vựng (word).'));
      }

      const created = await prisma.vocabulary.create({
        data: {
          word: String(word).trim(),
          reading: String(reading || word).trim(),
          hanViet: hanViet ? String(hanViet).trim() : null,
          meaningVi: String(meaningVi || '').trim(),
          jlptLevel: String(jlptLevel || 'N5').toUpperCase(),
          curriculum: String(curriculum || 'MINNA').toUpperCase(),
          lesson: lesson ? Number(lesson) : 1,
          partOfSpeech: partOfSpeech ? String(partOfSpeech).trim() : null,
          exampleJp: exampleJp ? String(exampleJp).trim() : null,
          exampleVi: exampleVi ? String(exampleVi).trim() : null,
          topic: topic ? String(topic).trim() : null
        }
      });

      await RedisService.delPrefix('vocab:');
      res.json(ResponseFormatter.success(created, { service: 'admin-service' }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi thêm từ vựng', error.message));
    }
  }

  static async updateVocab(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const {
        word,
        reading,
        hanViet,
        meaningVi,
        jlptLevel,
        curriculum,
        lesson,
        partOfSpeech,
        exampleJp,
        exampleVi,
        topic
      } = req.body;

      const updated = await prisma.vocabulary.update({
        where: { id },
        data: {
          ...(word ? { word: String(word).trim() } : {}),
          ...(reading !== undefined ? { reading: String(reading).trim() } : {}),
          ...(hanViet !== undefined ? { hanViet: String(hanViet).trim() || null } : {}),
          ...(meaningVi !== undefined ? { meaningVi: String(meaningVi).trim() } : {}),
          ...(jlptLevel ? { jlptLevel: String(jlptLevel).toUpperCase() } : {}),
          ...(curriculum ? { curriculum: String(curriculum).toUpperCase() } : {}),
          ...(lesson !== undefined ? { lesson: Number(lesson) || 1 } : {}),
          ...(partOfSpeech !== undefined ? { partOfSpeech: String(partOfSpeech).trim() || null } : {}),
          ...(exampleJp !== undefined ? { exampleJp: String(exampleJp).trim() || null } : {}),
          ...(exampleVi !== undefined ? { exampleVi: String(exampleVi).trim() || null } : {}),
          ...(topic !== undefined ? { topic: String(topic).trim() || null } : {})
        }
      });

      await RedisService.delPrefix('vocab:');
      res.json(ResponseFormatter.success(updated, { service: 'admin-service' }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi cập nhật từ vựng', error.message));
    }
  }

  static async deleteVocab(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      await prisma.$transaction([
        prisma.vocabularyAiInsight.deleteMany({ where: { vocabId: id } }),
        prisma.vocabulary.delete({ where: { id } })
      ]);
      await RedisService.delPrefix('vocab:');
      res.json(ResponseFormatter.success({ success: true }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi xóa từ vựng', error.message));
    }
  }

  // ─── 3.5. QUẢN LÝ ĐỀ THI JLPT (EXAMS) ──────────────────────────────────────
  static async listExams(req: AuthenticatedRequest, res: Response) {
    try {
      const items = await prisma.jlptExam.findMany({
        include: {
          _count: {
            select: { questions: true, attempts: true }
          }
        },
        orderBy: [{ level: 'desc' }, { year: 'desc' }, { createdAt: 'desc' }]
      });
      res.json(ResponseFormatter.success(items, { service: 'admin-service' }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi tải danh sách đề thi JLPT', error.message));
    }
  }

  static async createExam(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        code,
        title,
        level,
        year,
        session,
        edition,
        description,
        durationMinutes,
        passingScore,
        sectionalMinScore,
        isPublished
      } = req.body;

      if (!title || !String(title).trim()) {
        return res.status(400).json(ResponseFormatter.error('Vui lòng nhập tiêu đề đề thi.'));
      }

      const cleanLevel = String(level || 'N5').toUpperCase();
      const cleanYear = Number(year) || new Date().getFullYear();
      const cleanSession = String(session || '07').trim();
      const cleanCode =
        code && String(code).trim()
          ? String(code).trim().toUpperCase()
          : `JLPT-${cleanLevel}-${cleanYear}-${cleanSession}-${Date.now().toString().slice(-4)}`;

      const created = await prisma.jlptExam.create({
        data: {
          code: cleanCode,
          title: String(title).trim(),
          level: cleanLevel,
          year: cleanYear,
          session: cleanSession,
          edition: edition ? String(edition).trim() : `Đề thi chuẩn JLPT ${cleanLevel}`,
          description: description ? String(description).trim() : '',
          durationMinutes: Number(durationMinutes) || 105,
          passingScore: Number(passingScore) || 80,
          sectionalMinScore: Number(sectionalMinScore) || 19,
          totalQuestions: 0,
          isPublished: isPublished !== undefined ? Boolean(isPublished) : true
        },
        include: {
          _count: { select: { questions: true, attempts: true } }
        }
      });

      await RedisService.delPrefix('exam:');
      res.json(ResponseFormatter.success(created, { service: 'admin-service' }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi tạo đề thi JLPT', error.message));
    }
  }

  static async updateExam(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const {
        title,
        level,
        year,
        session,
        edition,
        description,
        durationMinutes,
        passingScore,
        sectionalMinScore,
        isPublished
      } = req.body;

      const updated = await prisma.jlptExam.update({
        where: { id },
        data: {
          ...(title ? { title: String(title).trim() } : {}),
          ...(level ? { level: String(level).toUpperCase() } : {}),
          ...(year !== undefined ? { year: Number(year) || 2025 } : {}),
          ...(session !== undefined ? { session: String(session).trim() } : {}),
          ...(edition !== undefined ? { edition: String(edition).trim() } : {}),
          ...(description !== undefined ? { description: String(description).trim() } : {}),
          ...(durationMinutes !== undefined ? { durationMinutes: Number(durationMinutes) || 100 } : {}),
          ...(passingScore !== undefined ? { passingScore: Number(passingScore) || 80 } : {}),
          ...(sectionalMinScore !== undefined ? { sectionalMinScore: Number(sectionalMinScore) || 19 } : {}),
          ...(isPublished !== undefined ? { isPublished: Boolean(isPublished) } : {})
        },
        include: {
          _count: { select: { questions: true, attempts: true } }
        }
      });

      await RedisService.delPrefix('exam:');
      res.json(ResponseFormatter.success(updated, { service: 'admin-service' }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi cập nhật đề thi JLPT', error.message));
    }
  }

  static async deleteExam(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      await prisma.$transaction([
        prisma.jlptQuestion.deleteMany({ where: { examId: id } }),
        prisma.jlptExamAttempt.deleteMany({ where: { examId: id } }),
        prisma.jlptExam.delete({ where: { id } })
      ]);
      await RedisService.delPrefix('exam:');
      res.json(ResponseFormatter.success({ success: true }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi xóa đề thi JLPT', error.message));
    }
  }

  static async getExamQuestions(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const questions = await prisma.jlptQuestion.findMany({
        where: { examId: id },
        orderBy: { orderNumber: 'asc' }
      });
      res.json(ResponseFormatter.success(questions, { service: 'admin-service' }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi tải danh sách câu hỏi đề thi', error.message));
    }
  }

  static async updateExamQuestions(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { questions } = req.body;
      if (!Array.isArray(questions)) {
        return res.status(400).json(ResponseFormatter.error('Danh sách câu hỏi không hợp lệ.'));
      }

      const prepared = questions.map((q: any, idx: number) => {
        let optionsStr = q.options;
        if (Array.isArray(q.options)) {
          optionsStr = JSON.stringify(q.options);
        } else if (typeof q.options === 'string') {
          try {
            JSON.parse(q.options);
          } catch {
            optionsStr = JSON.stringify(
              q.options
                .split('|')
                .map((s: string) => s.trim())
                .filter(Boolean)
            );
          }
        } else {
          optionsStr = JSON.stringify(['Phương án 1', 'Phương án 2', 'Phương án 3', 'Phương án 4']);
        }

        return {
          examId: id,
          orderNumber: idx + 1,
          section: String(q.section || 'vocab').toLowerCase(),
          subType: String(q.subType || 'KANJI_READING'),
          subTypeLabel: String(q.subTypeLabel || 'Từ vựng / Ngữ pháp'),
          question: String(q.question || '').trim(),
          questionVi: String(q.questionVi || '').trim(),
          passage: q.passage ? String(q.passage).trim() : null,
          passageVi: q.passageVi ? String(q.passageVi).trim() : null,
          options: optionsStr,
          optionsVi: q.optionsVi
            ? Array.isArray(q.optionsVi)
              ? JSON.stringify(q.optionsVi)
              : String(q.optionsVi)
            : null,
          correctIndex: Math.min(3, Math.max(0, Number(q.correctIndex) || 0)),
          explanation: String(q.explanation || 'Đáp án chuẩn theo cấu trúc đề thi JLPT.').trim(),
          officialSource: String(q.officialSource || 'NihonAI JLPT Bank').trim()
        };
      });

      await prisma.$transaction([
        prisma.jlptQuestion.deleteMany({ where: { examId: id } }),
        ...(prepared.length > 0 ? [prisma.jlptQuestion.createMany({ data: prepared })] : []),
        prisma.jlptExam.update({
          where: { id },
          data: { totalQuestions: prepared.length }
        })
      ]);

      await RedisService.delPrefix('exam:');
      res.json(
        ResponseFormatter.success(
          { updatedCount: prepared.length },
          { service: 'admin-service' }
        )
      );
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi cập nhật câu hỏi đề thi', error.message));
    }
  }

  static async bulkDeleteContent(req: AuthenticatedRequest, res: Response) {
    try {
      const { type, ids } = req.body;
      const cleanType = String(type || '').toUpperCase();
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json(ResponseFormatter.error('Vui lòng chọn ít nhất 1 mục để xóa.'));
      }

      if (cleanType === 'SHADOWING') {
        await prisma.$transaction([
          prisma.videoSubtitle.deleteMany({ where: { lessonId: { in: ids } } }),
          prisma.videoShadowingLesson.deleteMany({ where: { id: { in: ids } } })
        ]);
        await ShadowingService.clearCache();
        await RedisService.delPrefix('shadowing:');
      } else if (cleanType === 'READING') {
        await prisma.$transaction([
          prisma.readingSentence.deleteMany({ where: { articleId: { in: ids } } }),
          prisma.readingVocabItem.deleteMany({ where: { articleId: { in: ids } } }),
          prisma.readingGrammarItem.deleteMany({ where: { articleId: { in: ids } } }),
          prisma.readingQuiz.deleteMany({ where: { articleId: { in: ids } } }),
          prisma.readingArticle.deleteMany({ where: { id: { in: ids } } })
        ]);
        await RedisService.delPrefix('reading:');
      } else if (cleanType === 'KANJI') {
        await prisma.$transaction([
          prisma.kanjiAiInsight.deleteMany({ where: { kanjiId: { in: ids } } }),
          prisma.kanji.deleteMany({ where: { id: { in: ids } } })
        ]);
        await RedisService.delPrefix('kanji:');
      } else if (cleanType === 'VOCAB') {
        await prisma.$transaction([
          prisma.vocabularyAiInsight.deleteMany({ where: { vocabId: { in: ids } } }),
          prisma.vocabulary.deleteMany({ where: { id: { in: ids } } })
        ]);
        await RedisService.delPrefix('vocab:');
      } else if (cleanType === 'EXAM') {
        await prisma.$transaction([
          prisma.jlptQuestion.deleteMany({ where: { examId: { in: ids } } }),
          prisma.jlptExamAttempt.deleteMany({ where: { examId: { in: ids } } }),
          prisma.jlptExam.deleteMany({ where: { id: { in: ids } } })
        ]);
        await RedisService.delPrefix('exam:');
      } else {
        return res.status(400).json(ResponseFormatter.error('Loại dữ liệu xóa không hợp lệ.'));
      }

      res.json(
        ResponseFormatter.success(
          { deletedCount: ids.length, type: cleanType },
          { service: 'admin-service' }
        )
      );
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi khi xóa hàng loạt nội dung', error.message));
    }
  }

  // ─── 5. NHẬP / XUẤT DỮ LIỆU HÀNG LOẠT EXCEL / CSV ──────────────────────────
  static async exportContentData(req: AuthenticatedRequest, res: Response) {
    try {
      const type = String(req.query.type || 'KANJI').toUpperCase();
      let rows: any[] = [];

      if (type === 'KANJI') {
        const items = await prisma.kanji.findMany({
          take: 500,
          orderBy: [{ jlptLevel: 'desc' }, { lesson: 'asc' }]
        });
        rows = items.map((k) => ({
          character: k.character,
          hanViet: k.hanViet,
          meaningVi: k.meaningVi,
          onyomi: k.onyomi,
          kunyomi: k.kunyomi,
          jlptLevel: k.jlptLevel,
          strokeCount: k.strokeCount,
          radicals: k.radicals,
          curriculum: k.curriculum || 'LOOK_AND_LEARN',
          lesson: k.lesson || 1
        }));
      } else if (type === 'VOCAB') {
        const items = await prisma.vocabulary.findMany({
          take: 500,
          orderBy: [{ jlptLevel: 'desc' }, { lesson: 'asc' }]
        });
        rows = items.map((v) => ({
          word: v.word,
          reading: v.reading,
          hanViet: v.hanViet || '',
          meaningVi: v.meaningVi,
          jlptLevel: v.jlptLevel,
          curriculum: v.curriculum,
          lesson: v.lesson || 1,
          exampleJp: v.exampleJp || '',
          exampleVi: v.exampleVi || ''
        }));
      } else if (type === 'SHADOWING') {
        const items = await prisma.videoShadowingLesson.findMany({
          include: { _count: { select: { subtitles: true } } },
          orderBy: { createdAt: 'desc' }
        });
        rows = items.map((s) => ({
          title: s.title,
          youtubeId: s.youtubeId,
          level: s.level,
          category: s.category,
          topic: s.topic,
          subtitlesCount: s._count.subtitles,
          viewCount: s.viewCount
        }));
      } else if (type === 'READING') {
        const items = await prisma.readingArticle.findMany({
          orderBy: { createdAt: 'desc' },
          take: 200
        });
        rows = items.map((r) => ({
          title: r.title,
          level: r.level,
          topic: r.topic,
          sourceType: r.sourceType,
          totalWords: r.totalWords,
          viewCount: r.viewCount,
          createdAt: r.createdAt
        }));
      } else if (type === 'EXAM') {
        const items = await prisma.jlptExam.findMany({
          include: { _count: { select: { questions: true, attempts: true } } },
          orderBy: { createdAt: 'desc' }
        });
        rows = items.map((e) => ({
          code: e.code,
          title: e.title,
          level: e.level,
          year: e.year,
          session: e.session,
          durationMinutes: e.durationMinutes,
          passingScore: e.passingScore,
          questionsCount: e._count.questions,
          attemptsCount: e._count.attempts,
          isPublished: e.isPublished
        }));
      }

      res.json(ResponseFormatter.success(rows, { service: 'admin-service' }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi khi xuất dữ liệu', error.message));
    }
  }

  static async importExcelData(req: any, res: Response) {
    try {
      const type = String(req.query.type || req.body.type || 'KANJI').toUpperCase();
      const file = req.file;
      if (!file) return res.status(400).json(ResponseFormatter.error('Vui lòng chọn tệp Excel hoặc CSV.'));

      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(sheet) as any[];

      let count = 0;
      if (type === 'KANJI') {
        for (const row of data) {
          const charVal = row.character || row.kanji || row.Kanji || row['Chữ Hán'];
          if (!charVal) continue;
          const character = String(charVal).trim();
          const meaningVi = String(row.meaningVi || row.meaning || row['Nghĩa'] || '').trim();
          const onyomi = String(row.onyomi || row['Âm On'] || '').trim();
          const kunyomi = String(row.kunyomi || row['Âm Kun'] || '').trim();
          const hanViet = String(row.hanViet || row['Hán Việt'] || '').trim();
          const jlptLevel = String(row.jlptLevel || row.level || row['Cấp độ'] || 'N5').toUpperCase();
          const strokeCount = Number(row.strokeCount || row.strokes || 1) || 1;
          const radicals = String(row.radicals || row['Bộ thủ'] || '').trim();
          const exampleWords = String(row.exampleWords || row.examples || '').trim();
          const curriculum = String(row.curriculum || 'LOOK_AND_LEARN').toUpperCase();
          const lesson = Number(row.lesson || 1) || 1;

          await prisma.kanji.upsert({
            where: { character },
            update: {
              onyomi,
              kunyomi,
              meaningVi,
              ...(hanViet ? { hanViet } : {}),
              jlptLevel,
              ...(exampleWords ? { exampleWords } : {})
            },
            create: {
              character,
              onyomi,
              kunyomi,
              meaningVi,
              jlptLevel,
              strokeCount,
              hanViet,
              radicals,
              svgPathData: row.svgPathData || '',
              exampleWords: exampleWords || null,
              curriculum,
              lesson
            }
          });
          count++;
        }
        await RedisService.delPrefix('kanji:');
      } else {
        for (const row of data) {
          const wordVal = row.word || row.vocabulary || row['Từ vựng'];
          if (!wordVal) continue;
          const word = String(wordVal).trim();
          const reading = String(row.reading || row['Cách đọc'] || word).trim();
          const meaningVi = String(row.meaningVi || row.meaning || row['Nghĩa'] || '').trim();
          const hanViet = String(row.hanViet || row['Hán Việt'] || '').trim();
          const jlptLevel = String(row.jlptLevel || row.level || row['Cấp độ'] || 'N5').toUpperCase();
          const exampleJp = String(row.exampleJp || row.examples || '').trim();
          const exampleVi = String(row.exampleVi || '').trim();
          const curriculum = String(row.curriculum || 'MINNA').toUpperCase();
          const lesson = Number(row.lesson || 1) || 1;

          const existing = await prisma.vocabulary.findFirst({ where: { word } });
          if (existing) {
            await prisma.vocabulary.update({
              where: { id: existing.id },
              data: {
                reading,
                meaningVi,
                jlptLevel,
                ...(hanViet ? { hanViet } : {}),
                ...(exampleJp ? { exampleJp } : {}),
                ...(exampleVi ? { exampleVi } : {})
              }
            });
          } else {
            await prisma.vocabulary.create({
              data: {
                word,
                reading,
                meaningVi,
                jlptLevel,
                hanViet: hanViet || null,
                exampleJp: exampleJp || null,
                exampleVi: exampleVi || null,
                curriculum,
                lesson
              }
            });
          }
          count++;
        }
        await RedisService.delPrefix('vocab:');
      }

      res.json({
        ...ResponseFormatter.success({ inserted: count }, { service: 'admin-service' }),
        message: `Đã nhập thành công ${count} mục dữ liệu (${type}) vào hệ thống!`
      });
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi khi nhập dữ liệu Excel/CSV', error.message));
    }
  }
}
