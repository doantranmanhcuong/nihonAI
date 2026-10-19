import multer from 'multer';
import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../../middleware/auth.middleware';
import { AdminController } from './admin.controller';

export const adminRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });


// Toàn bộ Admin Routes đều yêu cầu Token và Role = ADMIN
adminRouter.use(authenticateToken);
adminRouter.use(authorizeRole(['ADMIN']));

// 1. Thống kê
adminRouter.get('/stats', AdminController.getStats);

// 2. Quản lý Users
adminRouter.get('/users', AdminController.listUsers);
adminRouter.patch('/users/:id/role', AdminController.updateUserRole);
adminRouter.put('/users/:id/status', AdminController.updateUserStatus);
adminRouter.get('/users/:id/progress', AdminController.getUserProgress);
adminRouter.delete('/users/:id', AdminController.deleteUser);

// 3. Quản lý Content
adminRouter.get('/content/shadowing', AdminController.listShadowing);
adminRouter.delete('/content/shadowing/:id', AdminController.deleteShadowing);

adminRouter.get('/content/reading', AdminController.listReading);
adminRouter.delete('/content/reading/:id', AdminController.deleteReading);

// 4. Quản lý Settings
adminRouter.get('/settings', AdminController.getSettings);
adminRouter.put('/settings', AdminController.updateSettings);

// 5. Import/Export
adminRouter.post('/content/import', upload.single('file'), AdminController.importExcelData);

// 6. AI Console
adminRouter.get('/ai/prompts', AdminController.listAiPrompts);
adminRouter.put('/ai/prompts/:key', AdminController.updateAiPrompt);
adminRouter.get('/ai/logs', AdminController.listAiLogs);
