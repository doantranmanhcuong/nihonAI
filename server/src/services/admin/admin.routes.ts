import multer from 'multer';
import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../../middleware/auth.middleware';
import { AdminController } from './admin.controller';

export const adminRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Toàn bộ Admin Routes đều yêu cầu Token và Role = ADMIN
adminRouter.use(authenticateToken);
adminRouter.use(authorizeRole(['ADMIN']));

// 1. Thống kê & Tác vụ hệ thống
adminRouter.get('/stats', AdminController.getStats);
adminRouter.post('/crawl-news', AdminController.triggerNewsCrawl);

// 2. Quản lý Users
adminRouter.get('/users', AdminController.listUsers);
adminRouter.patch('/users/:id/role', AdminController.updateUserRole);
adminRouter.put('/users/:id/status', AdminController.updateUserStatus);
adminRouter.get('/users/:id/progress', AdminController.getUserProgress);
adminRouter.delete('/users/:id/attempts/:attemptId', AdminController.deleteUserExamAttempt);
adminRouter.delete('/users/:id', AdminController.deleteUser);

// 3. Quản lý Content: Shadowing, Reading, Kanji, Vocabulary, JLPT Exams
adminRouter.post('/content/bulk-delete', AdminController.bulkDeleteContent);

adminRouter.get('/content/shadowing', AdminController.listShadowing);
adminRouter.put('/content/shadowing/:id', AdminController.updateShadowing);
adminRouter.delete('/content/shadowing/:id', AdminController.deleteShadowing);
adminRouter.get('/content/shadowing/:id/subtitles', AdminController.getShadowingSubtitles);
adminRouter.put('/content/shadowing/:id/subtitles', AdminController.updateShadowingSubtitles);

adminRouter.get('/content/reading', AdminController.listReading);
adminRouter.post('/content/reading', AdminController.createReading);
adminRouter.put('/content/reading/:id', AdminController.updateReading);
adminRouter.delete('/content/reading/:id', AdminController.deleteReading);

adminRouter.get('/content/kanji', AdminController.listKanji);
adminRouter.post('/content/kanji', AdminController.createKanji);
adminRouter.put('/content/kanji/:id', AdminController.updateKanji);
adminRouter.delete('/content/kanji/:id', AdminController.deleteKanji);

adminRouter.get('/content/vocab', AdminController.listVocab);
adminRouter.post('/content/vocab', AdminController.createVocab);
adminRouter.put('/content/vocab/:id', AdminController.updateVocab);
adminRouter.delete('/content/vocab/:id', AdminController.deleteVocab);

adminRouter.get('/content/exams', AdminController.listExams);
adminRouter.post('/content/exams', AdminController.createExam);
adminRouter.put('/content/exams/:id', AdminController.updateExam);
adminRouter.delete('/content/exams/:id', AdminController.deleteExam);
adminRouter.get('/content/exams/:id/questions', AdminController.getExamQuestions);
adminRouter.put('/content/exams/:id/questions', AdminController.updateExamQuestions);

// 4. Quản lý Settings
adminRouter.get('/settings', AdminController.getSettings);
adminRouter.put('/settings', AdminController.updateSettings);

// 5. Import / Export
adminRouter.post('/content/import', upload.single('file'), AdminController.importExcelData);
adminRouter.get('/content/export', AdminController.exportContentData);

// 6. AI Console
adminRouter.get('/ai/prompts', AdminController.listAiPrompts);
adminRouter.put('/ai/prompts/:key', AdminController.updateAiPrompt);
adminRouter.get('/ai/logs', AdminController.listAiLogs);
adminRouter.delete('/ai/logs/:id', AdminController.deleteAiLog);
adminRouter.delete('/ai/logs', AdminController.clearAiLogs);
