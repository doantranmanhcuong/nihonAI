import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { NotebookService } from './notebook.service';
import { ResponseFormatter } from '../../core/api-response';
import { ItemType, MasteryStatus } from './notebook.types';

import { authenticateToken, AuthenticatedRequest } from '../../middleware/auth.middleware';
export const notebookRouter = Router();
notebookRouter.use(authenticateToken);


/**
 * @route   GET /api/notebook
 * @desc    Lấy danh sách các mục trong sổ tay (có hỗ trợ filter: itemType, level, masteryStatus, search)
 */
notebookRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new Error('Unauthorized');
    const { itemType, level, masteryStatus, search, tags, page, limit } = req.query;

    const items = await NotebookService.getItems(userId, {
      itemType: itemType ? String(itemType) : undefined,
      level: level ? String(level) : undefined,
      masteryStatus: masteryStatus ? String(masteryStatus) : undefined,
      search: search ? String(search) : undefined,
      tags: tags ? String(tags) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined
    });

    res.json(ResponseFormatter.success(items, { service: 'notebook-service' }));
  } catch (error: any) {
    res.status(500).json(ResponseFormatter.error('Lỗi khi lấy danh sách sổ tay', error.message, 'notebook-service'));
  }
});

/**
 * @route   GET /api/notebook/stats
 * @desc    Lấy báo cáo thống kê tiến độ học tập và ghi nhớ SRS
 */
notebookRouter.get('/stats', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new Error('Unauthorized');
    const stats = await NotebookService.getStats(userId);
    res.json(ResponseFormatter.success(stats, { service: 'notebook-service' }));
  } catch (error: any) {
    res.status(500).json(ResponseFormatter.error('Lỗi khi lấy thống kê sổ tay', error.message, 'notebook-service'));
  }
});

/**
 * @route   POST /api/notebook
 * @desc    Tạo mới một mục vào sổ tay cá nhân
 */
notebookRouter.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new Error('Unauthorized');
    const { itemType, title, reading, meaningVi, level, structure, exampleJp, exampleVi, note, tags, masteryStatus } = req.body;

    if (!title || !meaningVi) {
      res.status(400).json(ResponseFormatter.error('Tiêu đề và ý nghĩa không được để trống.', null, 'notebook-service'));
      return;
    }

    const newItem = await NotebookService.createItem(
      {
        itemType: (itemType || 'VOCAB') as ItemType,
        title,
        reading,
        meaningVi,
        level,
        structure,
        exampleJp,
        exampleVi,
        note,
        tags,
        masteryStatus: (masteryStatus || 'LEARNING') as MasteryStatus
      },
      userId
    );

    res.status(201).json(ResponseFormatter.success(newItem, { service: 'notebook-service' }, 'Thêm mục mới thành công'));
  } catch (error: any) {
    res.status(500).json(ResponseFormatter.error('Lỗi khi tạo mục sổ tay', error.message, 'notebook-service'));
  }
});

/**
 * @route   PUT /api/notebook/:id
 * @desc    Cập nhật thông tin chi tiết một mục sổ tay
 */
notebookRouter.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) throw new Error('Unauthorized');
    const updated = await NotebookService.updateItem(id, req.body, userId);
    res.json(ResponseFormatter.success(updated, { service: 'notebook-service' }, 'Cập nhật mục thành công'));
  } catch (error: any) {
    res.status(500).json(ResponseFormatter.error('Lỗi khi cập nhật mục sổ tay', error.message, 'notebook-service'));
  }
});

/**
 * @route   PATCH /api/notebook/:id/mastery
 * @desc    Cập nhật nhanh trạng thái thành thạo SRS (LEARNING, REVIEWING, MASTERED)
 */
notebookRouter.patch('/:id/mastery', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { masteryStatus } = req.body;

    if (!masteryStatus || !['LEARNING', 'REVIEWING', 'MASTERED'].includes(masteryStatus)) {
      res.status(400).json(ResponseFormatter.error('Trạng thái ghi nhớ không hợp lệ.', null, 'notebook-service'));
      return;
    }

    const userId = req.user?.userId;
    if (!userId) throw new Error('Unauthorized');
    const updated = await NotebookService.toggleMastery(id, masteryStatus as MasteryStatus, userId);
    res.json(ResponseFormatter.success(updated, { service: 'notebook-service' }, 'Cập nhật trạng thái thành thạo thành công'));
  } catch (error: any) {
    res.status(500).json(ResponseFormatter.error('Lỗi khi cập nhật trạng thái ghi nhớ', error.message, 'notebook-service'));
  }
});

/**
 * @route   DELETE /api/notebook/:id
 * @desc    Xóa một mục khỏi sổ tay
 */

/**
 * @route   DELETE /api/notebook/by-title
 * @desc    Xóa mục khỏi sổ tay bằng title và itemType
 */
notebookRouter.delete('/by-title', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { itemType, title } = req.query;
    const userId = req.user?.userId;
    if (!userId) throw new Error('Unauthorized');
    const result = await NotebookService.deleteItemByTitle(String(itemType), String(title), userId);
    res.json(ResponseFormatter.success(result, { service: 'notebook-service' }, 'Xóa mục khỏi sổ tay thành công'));
  } catch (error: any) {
    res.status(500).json(ResponseFormatter.error('Lỗi khi xóa mục sổ tay theo title', error.message, 'notebook-service'));
  }
});
notebookRouter.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) throw new Error('Unauthorized');
    const result = await NotebookService.deleteItem(id, userId);
    res.json(ResponseFormatter.success(result, { service: 'notebook-service' }, 'Xóa mục khỏi sổ tay thành công'));
  } catch (error: any) {
    res.status(500).json(ResponseFormatter.error('Lỗi khi xóa mục sổ tay', error.message, 'notebook-service'));
  }
});


/**
 * @route   GET /api/notebook/due
 * @desc    Lấy danh sách các thẻ đến hạn ôn tập (Due Cards)
 */
notebookRouter.get('/due', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new Error('Unauthorized');
    const limit = req.query.limit ? Number(req.query.limit) : 200;
    const items = await NotebookService.getDueCards(userId, limit, req.query.itemType ? String(req.query.itemType) : undefined, req.query.level ? String(req.query.level) : undefined);
    res.json(ResponseFormatter.success(items, { service: 'notebook-service' }));
  } catch (error: any) {
    res.status(500).json(ResponseFormatter.error('Lỗi khi lấy thẻ ôn tập', error.message, 'notebook-service'));
  }
});

/**
 * @route   POST /api/notebook/:id/review
 * @desc    Đánh giá độ khó của thẻ (SRS SM-2)
 */
notebookRouter.post('/:id/review', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new Error('Unauthorized');
    const { quality } = req.body;
    if (typeof quality !== 'number' || quality < 0 || quality > 5) {
      res.status(400).json(ResponseFormatter.error('Quality phải từ 0 đến 5', null, 'notebook-service'));
      return;
    }

    const updatedItem = await NotebookService.submitReview(req.params.id, userId, quality);
    res.json(ResponseFormatter.success(updatedItem, { service: 'notebook-service' }));
  } catch (error: any) {
    res.status(500).json(ResponseFormatter.error('Lỗi khi lưu kết quả ôn tập', error.message, 'notebook-service'));
  }
});


/**
 * @route   POST /api/notebook/:id/mnemonic
 * @desc    Tạo mẹo nhớ AI (AI Mnemonic)
 */
notebookRouter.post('/:id/mnemonic', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new Error('Unauthorized');
    const updatedItem = await NotebookService.generateMnemonic(req.params.id, userId);
    res.json(ResponseFormatter.success(updatedItem, { service: 'notebook-service' }));
  } catch (error: any) {
    res.status(500).json(ResponseFormatter.error('Lỗi khi tạo AI Mnemonic', error.message, 'notebook-service'));
  }
});
