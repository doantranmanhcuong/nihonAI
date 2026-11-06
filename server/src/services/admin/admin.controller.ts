import * as xlsx from 'xlsx';
import { Response } from 'express';
import { prisma } from '../../core/prisma.service';
import { RedisService } from '../../core/redis.service';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { ResponseFormatter } from '../../core/api-response';
import { ShadowingService } from '../shadowing/shadowing.service';
import { TranscriptParserService } from '../shadowing/transcript-parser.service';

export class AdminController {
  static async deleteUser(req: any, res: any) {
    try {
      const { id } = req.params;
      await prisma.user.delete({ where: { id } });
      res.json({ success: true, message: 'Đã xóa tài khoản thành công' });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Lỗi khi xóa tài khoản' });
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
      const updates = req.body;
      for (const [key, value] of Object.entries(updates)) {
        await prisma.systemSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) }
        });
      }
      res.json(ResponseFormatter.success({ updated: true }, { service: 'admin-service' }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi khi cập nhật cài đặt', error.message));
    }
  }

  /**
   * GET /api/admin/stats
   */
  static async getStats(req: AuthenticatedRequest, res: Response) {
    try {
      const [
        totalUsers,
        totalExams,
        totalQuestions,
        totalShadowing,
        totalReading,
        totalKanji,
        totalVocab,
        activeUsers
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
        })
      ]);

      const days: string[] = [];
      const userGrowth: number[] = [];
      const examActivity: number[] = [];

      const chartPromises = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - i);
        const nextD = new Date(d);
        nextD.setDate(nextD.getDate() + 1);

        days.push(d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }));

        chartPromises.push(
          prisma.user.count({ where: { createdAt: { gte: d, lt: nextD } } }),
          prisma.jlptExamAttempt.count({ where: { createdAt: { gte: d, lt: nextD } } })
        );
      }

      const chartResults = await Promise.all(chartPromises);
      for (let i = 0; i < 7; i++) {
        userGrowth.push(chartResults[i * 2]);
        examActivity.push(chartResults[i * 2 + 1]);
      }

      res.json(
        ResponseFormatter.success(
          {
            totalUsers,
            totalExams,
            totalQuestions,
            totalShadowing,
            totalReading,
            totalKanji,
            totalVocab,
            activeUsers,
            charts: {
              days,
              userGrowth,
              examActivity
            }
          },
          { service: 'admin-service' }
        )
      );
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi khi lấy stats', error.message));
    }
  }

  static async listAiPrompts(req: AuthenticatedRequest, res: Response) {
    try {
      const prompts = await prisma.aiPromptConfig.findMany({ orderBy: { key: 'asc' } });
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
        update: { promptText, isActive },
        create: { key, promptText, isActive }
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

  static async listUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          displayName: true,
          role: true,
          status: true,
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
      const user = await prisma.user.update({
        where: { id: req.params.id },
        data: { role }
      });
      res.json(ResponseFormatter.success(user, { service: 'admin-service' }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi phân quyền', error.message));
    }
  }

  static async updateUserStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { status } = req.body;
      const user = await prisma.user.update({
        where: { id: req.params.id },
        data: { status }
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

  // ─── 3.1. QUẢN LÝ SHADOWING ────────────────────────────────────────────────
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
      await prisma.videoShadowingLesson.delete({ where: { id: req.params.id } });
      await ShadowingService.clearCache();
      res.json(ResponseFormatter.success({ success: true }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi xóa bài học Shadowing', error.message));
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

      const sentencesData = rawSentences.map((s, idx) => ({
        orderIndex: idx + 1,
        sentenceJp: s,
        sentenceVi: idx === 0 && translationFull ? String(translationFull) : '',
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
          translationFull: translationFull ? String(translationFull).trim() : '',
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

        await prisma.readingSentence.deleteMany({ where: { articleId: id } });
        await prisma.readingSentence.createMany({
          data: rawSentences.map((s, idx) => ({
            articleId: id,
            orderIndex: idx + 1,
            sentenceJp: s,
            sentenceVi: '',
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
      await prisma.readingArticle.delete({ where: { id: req.params.id } });
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
      await prisma.kanji.delete({ where: { id: req.params.id } });
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
      await prisma.vocabulary.delete({ where: { id: req.params.id } });
      await RedisService.delPrefix('vocab:');
      res.json(ResponseFormatter.success({ success: true }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi xóa từ vựng', error.message));
    }
  }

  // ─── 5. NHẬP DỮ LIỆU HÀNG LOẠT EXCEL / CSV ─────────────────────────────────
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
