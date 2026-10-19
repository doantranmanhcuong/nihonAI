import { Router, Request, Response } from 'express';
import { VocabularyService } from './vocabulary.service';
import { VocabularyAiService } from './vocabulary-ai.service';
import { ResponseFormatter } from '../../core/api-response';

export const vocabularyRouter = Router();

/**
 * @route   GET /api/vocabulary
 * @route   GET /api/vocabulary/search
 * @desc    Tìm kiếm và lọc từ vựng đa chiều (Kanji, Kana, Romaji, tiếng Việt, cấp độ, bài học)
 */
const handleSearch = async (req: Request, res: Response) => {
  try {
    const { q, search, level, lesson, pos, page, limit } = req.query;
    const queryTerm = q || search;
    const result = await VocabularyService.searchVocabularies({
      query: queryTerm ? String(queryTerm) : undefined,
      level: level ? String(level) : undefined,
      lesson: lesson ? Number(lesson) : undefined,
      partOfSpeech: pos ? String(pos) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 30
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi tìm kiếm từ vựng.'
    });
  }
};

vocabularyRouter.get('/', handleSearch);
vocabularyRouter.get('/search', handleSearch);

/**
 * @route   GET /api/vocabulary/autocomplete
 * @desc    Đề xuất từ vựng tức thì khi gõ từ khóa (giúp phân biệt từ đồng âm, đồng tự khác nghĩa)
 */
vocabularyRouter.get('/autocomplete', async (req: Request, res: Response) => {
  try {
    const { q, limit } = req.query;
    if (!q || !String(q).trim()) {
      res.json({ success: true, data: [] });
      return;
    }
    const suggestions = await VocabularyService.autocomplete(
      String(q),
      limit ? Number(limit) : 8
    );
    res.json({
      success: true,
      data: suggestions
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy đề xuất từ vựng.'
    });
  }
});

/**
 * @route   GET /api/vocabulary/courses/stats
 * @desc    Lấy thống kê số lượng từ vựng thực tế theo từng giáo trình và cấp độ trong MySQL
 */
vocabularyRouter.get('/courses/stats', async (req: Request, res: Response) => {
  try {
    const stats = await VocabularyService.getCourseStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy thống kê khóa học.'
    });
  }
});

/**
 * @route   GET /api/vocabulary/curriculums
 * @desc    Lấy danh sách các bài học theo giáo trình (Minna, Tango, Mimikara) và Level
 */
vocabularyRouter.get('/curriculums', async (req: Request, res: Response) => {
  try {
    const { curriculum, level } = req.query;
    const summary = await VocabularyService.getCurriculumsSummary(
      curriculum ? String(curriculum) : 'MINNA',
      level ? String(level) : 'N5'
    );
    res.json({
      success: true,
      data: summary
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh mục giáo trình.'
    });
  }
});

/**
 * @route   GET /api/vocabulary/curriculum/:curriculum/:level/:lesson
 * @desc    Lấy toàn bộ từ vựng của bài học thuộc giáo trình kèm Hán tự bóc tách
 */
vocabularyRouter.get('/curriculum/:curriculum/:level/:lesson', async (req: Request, res: Response) => {
  try {
    const { curriculum, level, lesson } = req.params;
    const result = await VocabularyService.getLessonWords(
      curriculum,
      level,
      Number(lesson)
    );
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy từ vựng bài học.'
    });
  }
});

/**
 * @route   GET /api/vocabulary/lessons
 * @desc    Thống kê danh sách 50 bài học Minna no Nihongo
 */
vocabularyRouter.get('/lessons', async (_req: Request, res: Response) => {
  try {
    const lessons = await VocabularyService.getLessonsSummary();
    res.json({
      success: true,
      data: lessons
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy danh sách bài học.'
    });
  }
});

/**
 * @route   GET /api/vocabulary/daily
 * @desc    Gợi ý từ vựng hôm nay
 */
vocabularyRouter.get('/daily', async (_req: Request, res: Response) => {
  try {
    const daily = await VocabularyService.getDailyVocab();
    res.json({
      success: true,
      data: daily
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy từ vựng hôm nay.'
    });
  }
});

/**
 * @route   GET /api/vocabulary/detail/:id
 * @desc    Lấy chi tiết 1 từ vựng kèm Hán tự cấu thành (Cross-Module Synergy)
 */
vocabularyRouter.get('/detail/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const vocab = await VocabularyService.getVocabularyDetail(id);
    if (!vocab) {
      res.status(404).json({
        success: false,
        message: `Không tìm thấy từ vựng: ${id}`
      });
      return;
    }

    res.json({
      success: true,
      data: vocab
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi khi lấy chi tiết từ vựng.'
    });
  }
});

/**
 * @route   GET /api/vocabulary/:id/ai-insight
 * @desc    Lấy thẻ ngữ cảnh đa chiều và sắc thái AI (Lazy Cached 0-token)
 */
vocabularyRouter.get('/:id/ai-insight', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const insight = await VocabularyAiService.getOrGenerateVocabInsight(id, false);
    res.json(ResponseFormatter.success(insight, { service: 'vocabulary-ai-service', cached: insight.isCached }));
  } catch (error: any) {
    console.error(`Error in /api/vocabulary/${req.params.id}/ai-insight:`, error);
    res.status(500).json(ResponseFormatter.error('Lỗi khi phân tích AI cho từ vựng', error.message, 'vocabulary-ai-service'));
  }
});

/**
 * @route   POST /api/vocabulary/:id/ai-regenerate
 * @desc    Yêu cầu AI phân tích lại ngữ cảnh đa chiều và cụm từ đi kèm
 */
vocabularyRouter.post('/:id/ai-regenerate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const insight = await VocabularyAiService.getOrGenerateVocabInsight(id, true);
    res.json(ResponseFormatter.success(insight, { service: 'vocabulary-ai-service', cached: false }));
  } catch (error: any) {
    console.error(`Error in /api/vocabulary/${req.params.id}/ai-regenerate:`, error);
    res.status(500).json(ResponseFormatter.error('Lỗi khi làm mới AI từ vựng', error.message, 'vocabulary-ai-service'));
  }
});

/**
 * @route   POST /api/vocabulary/:id/ai-diagnose
 * @desc    Học viên đặt câu tiếng Nhật, AI Sensei chấm điểm và sửa lỗi tức thì
 */
vocabularyRouter.post('/:id/ai-diagnose', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { sentence } = req.body;
    if (!sentence || typeof sentence !== 'string') {
      res.status(400).json(ResponseFormatter.error('Vui lòng nhập câu tiếng Nhật cần chấm.', 'INVALID_SENTENCE', 'vocabulary-ai-service'));
      return;
    }
    const diagnosis = await VocabularyAiService.diagnoseSentence(id, sentence);
    res.json(ResponseFormatter.success(diagnosis, { service: 'vocabulary-ai-service', cached: false }));
  } catch (error: any) {
    console.error(`Error in /api/vocabulary/${req.params.id}/ai-diagnose:`, error);
    res.status(500).json(ResponseFormatter.error('Lỗi khi AI chấm câu', error.message, 'vocabulary-ai-service'));
  }
});

