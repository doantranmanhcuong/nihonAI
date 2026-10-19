import { Router, Request, Response } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';
import { AiTutorService } from './ai-tutor.service';
import { ResponseFormatter } from '../../core/api-response';

export const aiRouter = Router();

aiRouter.post('/chat', authenticateToken, async (req: any, res: Response) => {
  try {
    const { message, history } = req.body;
    if (!message) return res.status(400).json(ResponseFormatter.error('Thi?u n?i dung tin nh?n'));

    const responseText = await AiTutorService.chat(req.user.id, message, history);
    res.json(ResponseFormatter.success({ text: responseText }, { service: 'ai-tutor-service' }));
  } catch (error: any) {
    res.status(500).json(ResponseFormatter.error('L?i khi chat v?i AI', error.message));
  }
});
