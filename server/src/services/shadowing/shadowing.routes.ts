import { Router } from 'express';
import { ShadowingController } from './shadowing.controller';

export const shadowingRouter = Router();

// GET /api/shadowing/lessons - Lấy danh sách video bài học
shadowingRouter.get('/lessons', ShadowingController.listLessons);

// GET /api/shadowing/lessons/:id - Lấy chi tiết bài học kèm phụ đề
shadowingRouter.get('/lessons/:id', ShadowingController.getLessonDetail);

// POST /api/shadowing/lessons - Tạo bài học video mới
shadowingRouter.post('/lessons', ShadowingController.createLesson);

// POST /api/shadowing/process-youtube - Xử lý thông minh link YouTube tiếng Nhật
shadowingRouter.post('/process-youtube', ShadowingController.processYouTube);

// POST /api/shadowing/explain-word - Tra cứu từ vựng tức thì phong cách Corodomo
shadowingRouter.post('/explain-word', ShadowingController.explainWord);

