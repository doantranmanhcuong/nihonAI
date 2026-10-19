import { Router, Request, Response } from 'express';
import { AuthService } from './auth.service';
import { authenticateToken, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { authRateLimiter } from '../../middleware/rate-limit.middleware';

export const authRouter = Router();

import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

authRouter.patch('/me/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { displayName, targetLevel, avatar } = req.body;
    if (!req.user?.userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    
    const dataToUpdate: any = {};
    if (typeof displayName === 'string') dataToUpdate.displayName = displayName.trim();
    if (typeof targetLevel === 'string') {
      const lvl = targetLevel.toUpperCase();
      if (['N5', 'N4', 'N3', 'N2', 'N1'].includes(lvl)) {
        dataToUpdate.targetLevel = lvl;
      }
    }
    if (typeof avatar === 'string') dataToUpdate.avatar = avatar.trim();

    const updated = await prisma.user.update({
      where: { id: req.user.userId },
      data: dataToUpdate
    });

    res.json({
      success: true,
      message: 'Cập nhật hồ sơ thành công',
      data: {
        id: updated.id,
        email: updated.email,
        displayName: updated.displayName || updated.email.split('@')[0],
        targetLevel: updated.targetLevel,
        avatar: updated.avatar,
        role: updated.role,
        studyStreak: updated.studyStreak,
        lastStudyDate: updated.lastStudyDate,
        createdAt: updated.createdAt
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

authRouter.get('/me/summary', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        targetLevel: true,
        avatar: true,
        role: true,
        status: true,
        isEmailVerified: true,
        studyStreak: true,
        lastStudyDate: true,
        lastLoginAt: true,
        createdAt: true,
      }
    });

    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });

    const [
      totalNotebook,
      vocabCount,
      kanjiCount,
      grammarCount,
      noteCount,
      masteredCount,
      reviewingCount,
      learningCount,
      totalExams,
      passedExams,
      examMaxScore,
      recentAttempts
    ] = await Promise.all([
      prisma.notebookItem.count({ where: { userId } }),
      prisma.notebookItem.count({ where: { userId, itemType: 'VOCAB' } }),
      prisma.notebookItem.count({ where: { userId, itemType: 'KANJI' } }),
      prisma.notebookItem.count({ where: { userId, itemType: 'GRAMMAR' } }),
      prisma.notebookItem.count({ where: { userId, itemType: 'NOTE' } }),
      prisma.notebookItem.count({ where: { userId, masteryStatus: 'MASTERED' } }),
      prisma.notebookItem.count({ where: { userId, masteryStatus: 'REVIEWING' } }),
      prisma.notebookItem.count({ where: { userId, masteryStatus: 'LEARNING' } }),
      prisma.jlptExamAttempt.count({ where: { userId } }),
      prisma.jlptExamAttempt.count({ where: { userId, isPassed: true } }),
      prisma.jlptExamAttempt.aggregate({
        where: { userId },
        _max: { totalScore: true }
      }),
      prisma.jlptExamAttempt.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          exam: {
            select: { title: true, level: true, year: true, session: true }
          }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        user,
        notebook: {
          total: totalNotebook,
          vocabCount,
          kanjiCount,
          grammarCount,
          noteCount,
          masteredCount,
          reviewingCount,
          learningCount,
        },
        exams: {
          totalAttempts: totalExams,
          passedAttempts: passedExams,
          highestScore: examMaxScore._max.totalScore || 0,
          recentAttempts: recentAttempts.map(a => ({
            id: a.id,
            examTitle: a.exam.title,
            level: a.exam.level,
            year: a.exam.year,
            session: a.exam.session,
            totalScore: a.totalScore,
            totalCorrect: a.totalCorrect,
            totalQuestions: a.totalQuestions,
            isPassed: a.isPassed,
            createdAt: a.createdAt
          }))
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

authRouter.patch('/me/password', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!req.user?.userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user || !user.passwordHash) return res.status(400).json({ success: false, message: 'Người dùng không hợp lệ' });
    
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng' });
    
    if (newPassword.length < 6) return res.status(400).json({ success: false, message: 'Mật khẩu mới phải dài ít nhất 6 ký tự' });
    
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { passwordHash }
    });
    res.json({ success: true, message: 'Đổi mật khẩu thành công' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});


const setCookies = (res: Response, refreshToken: string) => {
  res.cookie('nihonai_refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

const clearCookies = (res: Response) => {
  res.clearCookie('nihonai_refresh_token');
};

authRouter.post('/register', authRateLimiter, async (req: Request, res: Response) => {
  try {
    const result = await AuthService.register(req.body);
    setCookies(res, result.refreshToken);
    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để nhận mã OTP.',
      data: { user: result.user, token: result.accessToken, debugCode: result.debugCode }
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

authRouter.post('/verify-email', authRateLimiter, async (req: Request, res: Response) => {
  try {
    const user = await AuthService.verifyEmail(req.body);
    res.status(200).json({
      success: true,
      message: 'Xác thực email thành công.',
      data: { user }
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

authRouter.post('/resend-verify', authRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) throw new Error('Email là bắt buộc.');
    const result = await AuthService.resendVerifyEmail(email);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

authRouter.post('/login', authRateLimiter, async (req: Request, res: Response) => {
  try {
    const result = await AuthService.login(req.body);
    setCookies(res, result.refreshToken);
    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: { user: result.user, token: result.accessToken }
    });
  } catch (error: any) {
    res.status(401).json({ success: false, message: error.message });
  }
});

authRouter.post('/google', authRateLimiter, async (req: Request, res: Response) => {
  try {
    const result = await AuthService.loginWithGoogle(req.body);
    setCookies(res, result.refreshToken);
    res.status(200).json({
      success: true,
      message: 'Đăng nhập Google thành công',
      data: { user: result.user, token: result.accessToken }
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

authRouter.post('/demo', authRateLimiter, async (req: Request, res: Response) => {
  try {
    const result = await AuthService.loginDemo();
    setCookies(res, result.refreshToken);
    res.status(200).json({
      success: true,
      message: 'Đăng nhập Demo thành công',
      data: { user: result.user, token: result.accessToken }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

authRouter.post('/refresh', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.nihonai_refresh_token;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Không tìm thấy refresh token' });
    }
    const result = await AuthService.refreshSession(refreshToken);
    setCookies(res, result.refreshToken);
    res.status(200).json({
      success: true,
      data: { user: result.user, token: result.accessToken }
    });
  } catch (error: any) {
    clearCookies(res);
    res.status(403).json({ success: false, message: error.message });
  }
});

authRouter.post('/logout', (req: Request, res: Response) => {
  clearCookies(res);
  res.status(200).json({ success: true, message: 'Đăng xuất thành công' });
});

authRouter.post('/revoke-all', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new Error('Unauthorized');
    
    await AuthService.revokeAllSessions(userId);
    clearCookies(res);
    res.status(200).json({
      success: true,
      message: 'Đã thu hồi tất cả phiên đăng nhập. Vui lòng đăng nhập lại.'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

authRouter.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const tokenVersion = req.user?.tokenVersion;
    if (!userId) throw new Error('Unauthorized');

    const user = await AuthService.getMe(userId, tokenVersion);
    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    res.status(401).json({ success: false, message: error.message });
  }
});

authRouter.put('/me/level', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { targetLevel } = req.body;
    if (!userId) throw new Error('Unauthorized');

    const user = await AuthService.updateTargetLevel(userId, targetLevel);
    res.status(200).json({ success: true, message: 'Cập nhật mục tiêu thành công', data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

authRouter.post('/forgot-password', authRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) throw new Error('Email là bắt buộc.');
    
    const result = await AuthService.forgotPassword(email);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

authRouter.post('/reset-password', authRateLimiter, async (req: Request, res: Response) => {
  try {
    const result = await AuthService.resetPassword(req.body);
    setCookies(res, result.refreshToken);
    res.status(200).json({
      success: true,
      message: 'Đổi mật khẩu thành công. Đã tự động đăng nhập.',
      data: { user: result.user, token: result.accessToken }
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});
