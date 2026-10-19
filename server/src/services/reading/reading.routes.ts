import { Router } from 'express';
import { ReadingController } from './reading.controller';

import { authenticateToken } from '../../middleware/auth.middleware';
export const readingRouter = Router();

// 1. Quản lý hạn ngạch Quota (5 bài AI / ngày)
readingRouter.get('/quota', authenticateToken, ReadingController.getQuota);

// 2. Thư viện bài đọc cộng đồng (0 Token)
readingRouter.get('/articles', ReadingController.listArticles);
readingRouter.get('/articles/:id', ReadingController.getArticleDetail);

// 3. AI Dokkai Generator (Tạo bài mới & sinh thêm trắc nghiệm)
readingRouter.post('/generate', authenticateToken, ReadingController.generateArticle);
readingRouter.post('/articles/:id/quizzes', authenticateToken, ReadingController.addMoreQuizzes);

// 4. Tra cứu & Phân tích thông minh (Bôi đen dịch chính xác & Chi tiết ngữ pháp)
readingRouter.post('/translate-selection', ReadingController.translateSelection);

readingRouter.post('/grammar-detail', ReadingController.explainGrammar);
readingRouter.post('/quiz-explain', authenticateToken, ReadingController.explainQuiz);
readingRouter.post('/notebook/save', authenticateToken, ReadingController.saveToNotebook);

// 5. Đọc Báo & Tin Tức Tiếng Nhật (NHK, Asahi, Mainichi, Yahoo JP & URL bên ngoài)
readingRouter.get('/news/latest', ReadingController.getLatestNews);
readingRouter.post('/news/import', ReadingController.importFromUrl);
readingRouter.post('/news/trigger-crawl', ReadingController.triggerNewsCrawl);
