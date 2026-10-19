import * as xlsx from 'xlsx';
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { ResponseFormatter } from '../../core/api-response';

const prisma = new PrismaClient();

export class AdminController {

  static async deleteUser(req: any, res: any) {
    try {
      const { id } = req.params;
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      await prisma.user.delete({ where: { id } });
      res.json({ success: true, message: '�� x�a t�i kho?n' });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ success: false, message: 'L?i khi x�a t�i kho?n' });
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
      const [totalUsers, totalExams, totalQuestions, totalShadowing, totalReading, totalKanji, totalVocab, activeUsers] = await Promise.all([
      prisma.user.count(),
      prisma.jlptExam.count(),
      prisma.jlptQuestion.count(),
      prisma.videoShadowingLesson.count(),
      prisma.readingArticle.count(),
      prisma.kanji.count(),
      prisma.vocabulary.count(),
      prisma.user.count({ where: { lastLoginAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } })
    ]);

    const days: string[] = [];
    const userGrowth: number[] = [];
    const examActivity: number[] = [];

    const chartPromises = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0,0,0,0);
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

      res.json(ResponseFormatter.success({
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
      }, { service: 'admin-service' }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('L?i khi l?y stats', error.message));
    }
  }


  static async listAiPrompts(req: AuthenticatedRequest, res: Response) {
    try {
      const prompts = await prisma.aiPromptConfig.findMany({ orderBy: { key: 'asc' } });
      res.json(ResponseFormatter.success(prompts, { service: 'admin-service' }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('L?i khi t?i prompts', error.message));
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
      res.status(500).json(ResponseFormatter.error('L?i khi luu prompt', error.message));
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
      res.status(500).json(ResponseFormatter.error('L?i khi t?i audit logs', error.message));
    }
  }

  static async listUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const users = await prisma.user.findMany({
        select: { id: true, email: true, displayName: true, role: true, status: true, lastLoginAt: true, createdAt: true },
        orderBy: { createdAt: 'desc' }
      });
      res.json(ResponseFormatter.success(users, { service: 'admin-service' }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('L?i l?y danh s�ch user', error.message));
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
      res.status(500).json(ResponseFormatter.error('L?i ph�n quy?n', error.message));
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
      res.status(500).json(ResponseFormatter.error('L?i c?p nh?t tr?ng th�i', error.message));
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

      res.json(ResponseFormatter.success({
        user,
        targetLevel: user?.targetLevel || 'Chưa đặt',
        studyStreak: user?.studyStreak || 0,
        examAttempts: formattedAttempts,
        exams: formattedAttempts,
        notebooks,
        activeDays
      }, { service: 'admin-service' }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Lỗi lấy tiến độ', error.message));
    }
  }

  static async listShadowing(req: AuthenticatedRequest, res: Response) {
    try {
      const items = await prisma.videoShadowingLesson.findMany({ include: { _count: { select: { subtitles: true } } }, orderBy: { createdAt: 'desc' } });
      res.json(ResponseFormatter.success(items, { service: 'admin-service' }));
    } catch (error: any) { res.status(500).json(ResponseFormatter.error('L?i', error.message)); }
  }

  static async deleteShadowing(req: AuthenticatedRequest, res: Response) {
    try {
      await prisma.videoShadowingLesson.delete({ where: { id: req.params.id } });
      res.json(ResponseFormatter.success({ success: true }));
    } catch (error: any) { res.status(500).json(ResponseFormatter.error('L?i', error.message)); }
  }

  static async listReading(req: AuthenticatedRequest, res: Response) {
    try {
      const items = await prisma.readingArticle.findMany({ include: { _count: { select: { vocabularies: true } } }, orderBy: { createdAt: 'desc' } });
      res.json(ResponseFormatter.success(items, { service: 'admin-service' }));
    } catch (error: any) { res.status(500).json(ResponseFormatter.error('L?i', error.message)); }
  }

  static async deleteReading(req: AuthenticatedRequest, res: Response) {
    try {
      await prisma.readingArticle.delete({ where: { id: req.params.id } });
      res.json(ResponseFormatter.success({ success: true }));
    } catch (error: any) { res.status(500).json(ResponseFormatter.error('L?i', error.message)); }
  }

  static async importExcelData(req: any, res: Response) {
    try {
      const type = req.query.type || req.body.type;
      const file = req.file;
      if (!file) return res.status(400).json(ResponseFormatter.error('No file'));
      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(sheet) as any[];

      let count = 0;
      if (type === 'KANJI') {
        for (const row of data) {
          if (!row.character) continue;
          await prisma.kanji.upsert({
            where: { character: String(row.character) },
            update: { 
              onyomi: row.onyomi || '', 
              kunyomi: row.kunyomi || '', 
              meaningVi: row.meaningVi || '' 
            },
            create: { 
              character: String(row.character), 
              onyomi: row.onyomi || '', 
              kunyomi: row.kunyomi || '', 
              meaningVi: row.meaningVi || '', 
              jlptLevel: row.level || 'N5', 
              strokeCount: Number(row.strokeCount) || 1,
              hanViet: row.hanViet || '',
              radicals: row.radicals || '',
              svgPathData: row.svgPathData || ''
            }
          });
          count++;
        }
      } else {
        for (const row of data) {
          if (!row.word) continue;
          const existing = await prisma.vocabulary.findFirst({ where: { word: String(row.word) } });
          if (existing) {
            await prisma.vocabulary.update({
              where: { id: existing.id },
              data: { reading: row.reading || '', meaningVi: row.meaningVi || '' }
            });
          } else {
            await prisma.vocabulary.create({
              data: { 
                word: String(row.word), 
                reading: row.reading || '', 
                meaningVi: row.meaningVi || '', 
                jlptLevel: row.level || 'N5' 
              }
            });
          }
          count++;
        }
      }
      res.json(ResponseFormatter.success({ inserted: count }));
    } catch (error: any) {
      res.status(500).json(ResponseFormatter.error('Import failed', error.message));
    }
  }

}
