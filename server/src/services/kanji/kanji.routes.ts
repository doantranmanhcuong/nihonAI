import { Router, Request, Response } from 'express';
import { KanjiService } from './kanji.service';
import { KanjiAiService } from './kanji-ai.service';
import { ResponseFormatter } from '../../core/api-response';

const router = Router();

// POST /api/kanji/recognize - Nhận diện nét vẽ tay
router.post('/recognize', async (req: Request, res: Response) => {
  try {
    const { strokes } = req.body;
    if (!strokes || !Array.isArray(strokes)) {
      return res.status(400).json({ error: 'Mảng tọa độ strokes không hợp lệ' });
    }

    const candidates = await KanjiService.recognizeHandwriting(strokes);
    return res.json({ candidates });
  } catch (error) {
    console.error('Error in /api/kanji/recognize:', error);
    return res.status(500).json({ error: 'Lỗi trong quá trình nhận diện chữ viết tay' });
  }
});

// GET /api/kanji/search?q=... - Tìm kiếm thông minh từ CSDL MySQL
router.get('/search', async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || '';
    const results = await KanjiService.searchKanjis(query);
    return res.json({ results });
  } catch (error) {
    console.error('Error in /api/kanji/search:', error);
    return res.status(500).json({ error: 'Lỗi khi tìm kiếm chữ Hán' });
  }
});

// GET /api/kanji/level/:level - Lấy danh sách Kanji theo cấp độ N5 - N1 từ CSDL MySQL
router.get('/level/:level', async (req: Request, res: Response) => {
  try {
    const { level } = req.params;
    const kanjis = await KanjiService.getKanjisByLevel(level);
    return res.json({ success: true, kanjis, total: kanjis.length });
  } catch (error) {
    console.error(`Error in /api/kanji/level/${req.params.level}:`, error);
    return res.status(500).json({ error: 'Lỗi khi lấy danh sách cấp độ' });
  }
});

// GET /api/kanji/curriculums - Danh sách metadata các giáo trình Kanji tiêu chuẩn
router.get('/curriculums', async (req: Request, res: Response) => {
  try {
    const list = KanjiService.getCurriculumsMetadata();
    return res.json(ResponseFormatter.success(list, { service: 'kanji-service' }));
  } catch (error: any) {
    console.error('Error in /api/kanji/curriculums:', error);
    return res.status(500).json(ResponseFormatter.error('Lỗi khi lấy danh sách giáo trình', error.message, 'kanji-service'));
  }
});

// GET /api/kanji/curriculum/summary?curriculum=...&level=... - Tóm tắt bài học của giáo trình
router.get('/curriculum/summary', async (req: Request, res: Response) => {
  try {
    const curriculum = (req.query.curriculum as string) || 'LOOK_AND_LEARN';
    const level = (req.query.level as string) || 'N5';
    const summary = await KanjiService.getCurriculumsSummary(curriculum, level);
    return res.json(ResponseFormatter.success(summary, { service: 'kanji-service' }));
  } catch (error: any) {
    console.error('Error in /api/kanji/curriculum/summary:', error);
    return res.status(500).json(ResponseFormatter.error('Lỗi khi lấy tóm tắt bài học giáo trình', error.message, 'kanji-service'));
  }
});

// GET /api/kanji/curriculum/:curriculum/:level - Lấy danh sách Kanji theo giáo trình & bài học
router.get('/curriculum/:curriculum/:level', async (req: Request, res: Response) => {
  try {
    const { curriculum, level } = req.params;
    const lesson = req.query.lesson ? parseInt(req.query.lesson as string, 10) : undefined;
    const kanjis = await KanjiService.getCurriculumKanjis(curriculum, level, lesson);
    return res.json(ResponseFormatter.success(kanjis, { service: 'kanji-service' }));
  } catch (error: any) {
    console.error(`Error in /api/kanji/curriculum/${req.params.curriculum}/${req.params.level}:`, error);
    return res.status(500).json(ResponseFormatter.error('Lỗi khi lấy danh sách Kanji theo giáo trình', error.message, 'kanji-service'));
  }
});

// GET /api/kanji/quiz/:level - Sinh bộ câu hỏi trắc nghiệm kiểm tra Hán tự theo Level
router.get('/quiz/:level', async (req: Request, res: Response) => {
  try {
    const { level } = req.params;
    const count = req.query.count ? parseInt(req.query.count as string, 10) : 10;
    const curriculum = (req.query.curriculum as string) || undefined;
    const type = (req.query.type as string) || undefined;
    const questions = await KanjiService.generateQuiz(level, count, curriculum, type);
    return res.json(ResponseFormatter.success(questions, { service: 'kanji-service' }));
  } catch (error: any) {
    console.error(`Error in /api/kanji/quiz/${req.params.level}:`, error);
    return res.status(500).json(ResponseFormatter.error('Lỗi khi sinh bài kiểm tra Hán tự', error.message, 'kanji-service'));
  }
});

// GET /api/kanji/:character/ai-insight - Lấy câu chuyện chiết tự AI (Lazy Cached)
router.get('/:character/ai-insight', async (req: Request, res: Response) => {
  try {
    const { character } = req.params;
    const decoded = decodeURIComponent(character);
    const insight = await KanjiAiService.getOrGenerateKanjiInsight(decoded, false);
    return res.json(ResponseFormatter.success(insight, { service: 'kanji-ai-service', cached: insight.isCached }));
  } catch (error: any) {
    console.error(`Error in /api/kanji/${req.params.character}/ai-insight:`, error);
    return res.status(500).json(ResponseFormatter.error('Lỗi khi phân tích AI cho chữ Hán', error.message, 'kanji-ai-service'));
  }
});

// POST /api/kanji/:character/ai-mnemonic - Yêu cầu AI sáng tạo lại câu chuyện mẹo nhớ
router.post('/:character/ai-mnemonic', async (req: Request, res: Response) => {
  try {
    const { character } = req.params;
    const decoded = decodeURIComponent(character);
    const insight = await KanjiAiService.getOrGenerateKanjiInsight(decoded, true);
    return res.json(ResponseFormatter.success(insight, { service: 'kanji-ai-service', cached: false }));
  } catch (error: any) {
    console.error(`Error in /api/kanji/${req.params.character}/ai-mnemonic:`, error);
    return res.status(500).json(ResponseFormatter.error('Lỗi khi sinh mẹo nhớ AI', error.message, 'kanji-ai-service'));
  }
});

// GET /api/kanji/:character - Lấy chi tiết chữ Hán
router.get('/:character', async (req: Request, res: Response) => {
  try {
    const { character } = req.params;
    const decoded = decodeURIComponent(character);
    const details = await KanjiService.getKanjiDetails(decoded);

    if (!details) {
      return res.status(404).json({
        error: `Không tìm thấy chữ "${decoded}" trong cơ sở dữ liệu`,
        notFound: true,
        searchedQuery: decoded
      });
    }

    return res.json(details);
  } catch (error) {
    console.error(`Error in /api/kanji/${req.params.character}:`, error);
    return res.status(500).json({ error: 'Lỗi khi lấy thông tin chữ Hán' });
  }
});

export const kanjiRouter = router;
