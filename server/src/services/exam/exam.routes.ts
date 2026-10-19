import { Router, Request, Response } from 'express';
import { ExamService } from './exam.service';
import { prisma } from '../../core/prisma.service';
import { RedisService } from '../../core/redis.service';
import { ExamAudioService } from './exam.audio.service';
import { ResponseFormatter } from '../../core/api-response';
import { authenticateToken, optionalAuthenticateToken, AuthenticatedRequest } from '../../middleware/auth.middleware';

export const examRouter = Router();

/**
 * @route   GET /api/exam/list
 * @desc    Lấy danh sách đề thi JLPT chuẩn (lọc theo level: N5 -> N1, năm, kỳ thi)
 */
examRouter.get('/list', async (req: Request, res: Response) => {
  try {
    const level = req.query.level as string | undefined;
    const year = req.query.year as string | undefined;
    const session = req.query.session as string | undefined;
    
    // Caching Layer (Phase 4)
    const cacheKey = `exams:list:${level || 'all'}:${year || 'all'}:${session || 'all'}`;
    const cached = await RedisService.get(cacheKey);
    
    if (cached.data) {
      return res.json(ResponseFormatter.success(cached.data, { service: 'exam-service', cached: true }));
    }

    const exams = await ExamService.getExamList(level, year, session);
    
    // Lưu vào Redis (TTL 12 tiếng)
    await RedisService.set(cacheKey, exams, 12 * 60 * 60);
    
    res.json(ResponseFormatter.success(exams, { service: 'exam-service', cached: false }));
  } catch (error: any) {
    res.status(500).json(ResponseFormatter.error('Lỗi lấy danh sách đề thi', error.message));
  }
});

/**
 * @route   GET /api/exam/:id
 * @desc    Lấy chi tiết bài thi để bắt đầu làm bài
 */
examRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const examId = req.params.id;
    const reveal = req.query.reveal === 'true';
    const section = req.query.section as string | undefined;
    const format = (req.query.format as 'express' | 'full') || 'express';
    const exam = await ExamService.getExamDetail(examId, !reveal, section, format);
    res.json(ResponseFormatter.success(exam, { service: 'exam-service' }));
  } catch (error: any) {
    res.status(404).json(ResponseFormatter.error('Không tìm thấy đề thi', error.message));
  }
});

/**
 * @route   POST /api/exam/submit
 * @desc    Chấm điểm bài thi tự động theo chuẩn thang điểm 180 của JLPT
 */
examRouter.post('/submit', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { examId, userAnswers, timeSpentSeconds, format, questionIds } = req.body;
    if (!examId) {
      res.status(400).json(ResponseFormatter.error('Thiếu mã đề thi (examId).'));
      return;
    }

    const userId = req.user?.userId || undefined;
    const result = await ExamService.submitExam(
      {
        examId,
        userAnswers: userAnswers || {},
        timeSpentSeconds: Number(timeSpentSeconds) || 0,
        format: format as 'express' | 'full' | undefined,
        questionIds: Array.isArray(questionIds) ? questionIds : undefined
      },
      userId
    );

    res.json(ResponseFormatter.success(result, { service: 'exam-service' }));
  } catch (error: any) {
    res.status(400).json(ResponseFormatter.error('Lỗi chấm điểm bài thi', error.message));
  }
});

/**
 * @route   POST /api/exam/ai-explain
 * @desc    Hỏi đáp chuyên sâu với Gemini AI về câu hỏi làm sai trong đề thi
 */
examRouter.post('/ai-explain', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { questionId, userAnswer } = req.body;
    if (!questionId) {
      res.status(400).json(ResponseFormatter.error('Thiếu mã câu hỏi (questionId).'));
      return;
    }

    const explanation = await ExamService.explainQuestionWithAI(questionId, userAnswer);
    res.json(ResponseFormatter.success(explanation, { service: 'exam-service' }));
  } catch (error: any) {
    res.status(500).json(ResponseFormatter.error('Lỗi phân tích AI', error.message));
  }
});

/**
 * @route   POST /api/exam/ai-diagnostic
 * @desc    Tạo báo cáo chẩn đoán toàn diện bài thi và rút kinh nghiệm bằng Gemini
 */
examRouter.post('/ai-diagnostic', optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payload = req.body;
    if (!payload || !payload.examId) {
      res.status(400).json(ResponseFormatter.error('Thiếu thông tin kết quả bài thi.'));
      return;
    }

    const report = await ExamService.generateExamDiagnosticReport(payload);
    res.json(ResponseFormatter.success(report, { service: 'exam-service' }));
  } catch (error: any) {
    res.status(500).json(ResponseFormatter.error('Lỗi tạo báo cáo chẩn đoán AI', error.message));
  }
});

/**
 * @route   GET /api/exam/audio/:id
 * @desc    Phát file âm thanh bài nghe Choukai tiếng Nhật chuẩn theo từng câu hỏi
 */
examRouter.get('/audio/:id', async (req: Request, res: Response) => {
    try {
      const questionId = req.params.id;
      
      const question = await prisma.jlptQuestion.findUnique({ where: { id: questionId } });
      if (question?.audioUrl && question.audioUrl.startsWith('http')) {
        res.redirect(question.audioUrl);
        return;
      }

      const audioBuf = await ExamAudioService.getOrGenerateAudio(questionId);

    if (!audioBuf) {
      res.status(404).send('Không tìm thấy âm thanh cho câu hỏi này');
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuf.length,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=31536000, immutable'
    });
    res.end(audioBuf);
  } catch (error: any) {
    console.error('Error serving exam audio:', error);
    res.status(500).send('Lỗi phát âm thanh bài nghe');
  }
});


