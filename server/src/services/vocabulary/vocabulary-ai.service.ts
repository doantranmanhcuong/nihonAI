import { GeminiPoolService } from '../../core/ai-pool.service';
import { prisma } from '../../core/prisma.service';
import { RedisService } from '../../core/redis.service';

export interface VocabScenario {
  tag: string;
  contextVi: string;
  sentenceJp: string;
  sentenceVi: string;
  furigana?: string;
}

export interface VocabCollocation {
  phraseJp: string;
  meaningVi: string;
}

export interface VocabAiInsightResult {
  id?: string;
  vocabId: string;
  word: string;
  reading: string;
  meaningVi: string;
  scenarios: VocabScenario[];
  collocations: VocabCollocation[];
  mistakeWarning?: string;
  nuanceNote?: string;
  generatedByModel: string;
  isCached: boolean;
}

export interface SentenceDiagnosisResult {
  score: number;
  isCorrect: boolean;
  particleFeedback: string;
  naturalCorrection: string;
  explanationVi: string;
}

export class VocabularyAiService {
  
  

  /**
   * Lấy hoặc sinh mới thẻ phân tích ngữ cảnh đa chiều cho từ vựng (Lazy Generation + 0 Token Cache)
   */
  static async getOrGenerateVocabInsight(vocabId: string, forceRegenerate = false): Promise<VocabAiInsightResult> {
    const cleanId = vocabId.trim();
    const cacheKey = `vocab:ai:${cleanId}`;

    // 1. Kiểm tra Redis Cache trước (0 token, < 1ms)
    if (!forceRegenerate) {
      const redisCached = await RedisService.get<VocabAiInsightResult>(cacheKey);
      if (redisCached.data && Array.isArray(redisCached.data.scenarios) && redisCached.data.scenarios.length > 0) {
        return { ...redisCached.data, isCached: true };
      }
    }

    // 2. Kiểm tra bảng mở rộng vocabulary_ai_insights trong MySQL (0 token, ~2ms)
    const existingDb = await prisma.vocabularyAiInsight.findUnique({
      where: { vocabId: cleanId }
    });

    if (existingDb && !forceRegenerate) {
      let scenarios: VocabScenario[] = [];
      let collocations: VocabCollocation[] = [];
      try {
        scenarios = JSON.parse(existingDb.scenariosJson || '[]');
      } catch (e) {
        scenarios = [];
      }
      try {
        collocations = JSON.parse(existingDb.collocationsJson || '[]');
      } catch (e) {
        collocations = [];
      }

      const vocabRecord = await prisma.vocabulary.findUnique({ where: { id: cleanId } });

      if (scenarios.length > 0) {
        const result: VocabAiInsightResult = {
          id: existingDb.id,
          vocabId: cleanId,
          word: vocabRecord?.word || '',
          reading: vocabRecord?.reading || '',
          meaningVi: vocabRecord?.meaningVi || '',
          scenarios,
          collocations,
          mistakeWarning: existingDb.mistakeWarning || undefined,
          nuanceNote: existingDb.nuanceNote || undefined,
          generatedByModel: existingDb.generatedByModel,
          isCached: true
        };

        // Ghi nhớ vào Redis 30 ngày
        await RedisService.set(cacheKey, result, 30 * 86400);
        return result;
      }
    }

    // 3. Nếu chưa có hoặc cần sinh lại: Gọi Gemini Flash Lite với Key chuyên biệt VOCAB
    const vocab = await prisma.vocabulary.findUnique({
      where: { id: cleanId }
    });

    if (!vocab) {
      throw new Error(`Không tìm thấy từ vựng ID "${cleanId}" trong cơ sở dữ liệu.`);
    }

    const prompt = `Bạn là một Giáo sư Ngôn ngữ học tiếng Nhật và Chuyên gia Giảng dạy Từ vựng (Vocabulary Sensei).
Hãy phân tích ngữ cảnh sử dụng thực tế và sắc thái của từ vựng tiếng Nhật sau:
- Từ vựng: ${vocab.word}
- Cách đọc (Hiragana/Katakana): ${vocab.reading}
- Âm Hán Việt: ${vocab.hanViet || 'Không có'}
- Ý nghĩa: ${vocab.meaningVi}
- Cấp độ JLPT: ${vocab.jlptLevel}
- Từ loại: ${vocab.partOfSpeech || 'Chưa phân loại'}

YÊU CẦU: Trả về DUY NHẤT một JSON hợp lệ (không chứa markdown), có cấu trúc chính xác:
{
  "scenarios": [
    {
      "tag": "Đời sống hàng ngày",
      "contextVi": "Tình huống giao tiếp bạn bè/gia đình đời thường",
      "sentenceJp": "Câu ví dụ tiếng Nhật tự nhiên ngắn gọn có chứa từ này",
      "sentenceVi": "Dịch nghĩa câu tiếng Việt chuẩn xác"
    },
    {
      "tag": "Công sở & Lịch sự",
      "contextVi": "Tình huống trường học, công ty hoặc giao tiếp trang trọng",
      "sentenceJp": "Câu ví dụ tiếng Nhật lịch sự/kính ngữ phù hợp",
      "sentenceVi": "Dịch nghĩa tiếng Việt"
    },
    {
      "tag": "Cụm từ / Quán ngữ",
      "contextVi": "Thành ngữ hoặc mẫu câu cố định người Nhật hay dùng",
      "sentenceJp": "Câu hoặc cụm từ tự nhiên",
      "sentenceVi": "Dịch nghĩa tiếng Việt"
    }
  ],
  "collocations": [
    { "phraseJp": "Cụm từ tiếng Nhật hay đi cùng từ này", "meaningVi": "Nghĩa tiếng Việt của cụm từ" },
    { "phraseJp": "Cụm từ 2", "meaningVi": "Nghĩa tiếng Việt" }
  ],
  "mistakeWarning": "1 câu ngắn chỉ ra lỗi sai phổ biến người Việt hay mắc phải (trợ từ sai, nhầm sắc thái)",
  "nuanceNote": "1-2 câu ngắn giải thích sắc thái phân biệt từ này với các từ đồng nghĩa gần giống (nếu có)"
}`;

        const aiRes = await GeminiPoolService.generateContent(process.env.GEMINI_MODEL_LITE || 'gemini-flash-lite-latest', prompt, { responseMimeType: 'application/json' });
    const rawText = aiRes.response.text().trim();

    // Làm sạch định dạng JSON
    const cleanJson = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
    let aiData: any = {};
    try {
      aiData = JSON.parse(cleanJson);
    } catch (e) {
      console.error('Lỗi phân tích JSON từ Gemini Vocab:', e);
      aiData = {
        scenarios: [
          {
            tag: 'Đời sống',
            contextVi: 'Sử dụng thường nhật',
            sentenceJp: vocab.exampleJp || `${vocab.word}を使います。`,
            sentenceVi: vocab.exampleVi || `Tôi sử dụng ${vocab.meaningVi}.`
          }
        ],
        collocations: [],
        mistakeWarning: 'Chú ý chọn đúng trợ từ đi kèm với từ này.'
      };
    }

    const scenariosList: VocabScenario[] = Array.isArray(aiData.scenarios) ? aiData.scenarios : [];
    const collocationsList: VocabCollocation[] = Array.isArray(aiData.collocations) ? aiData.collocations : [];

    // 4. Lưu vĩnh viễn vào bảng mở rộng vocabulary_ai_insights trong MySQL
    const savedInsight = await prisma.vocabularyAiInsight.upsert({
      where: { vocabId: cleanId },
      update: {
        scenariosJson: JSON.stringify(scenariosList),
        collocationsJson: JSON.stringify(collocationsList),
        mistakeWarning: aiData.mistakeWarning || null,
        nuanceNote: aiData.nuanceNote || null,
        generatedByModel: process.env.GEMINI_MODEL_LITE || 'gemini-flash-lite-latest'
      },
      create: {
        vocabId: cleanId,
        scenariosJson: JSON.stringify(scenariosList),
        collocationsJson: JSON.stringify(collocationsList),
        mistakeWarning: aiData.mistakeWarning || null,
        nuanceNote: aiData.nuanceNote || null,
        generatedByModel: process.env.GEMINI_MODEL_LITE || 'gemini-flash-lite-latest'
      }
    });

    const result: VocabAiInsightResult = {
      id: savedInsight.id,
      vocabId: cleanId,
      word: vocab.word,
      reading: vocab.reading,
      meaningVi: vocab.meaningVi,
      scenarios: scenariosList,
      collocations: collocationsList,
      mistakeWarning: savedInsight.mistakeWarning || undefined,
      nuanceNote: savedInsight.nuanceNote || undefined,
      generatedByModel: process.env.GEMINI_MODEL_LITE || 'gemini-flash-lite-latest',
      isCached: false
    };

    // 5. Lưu vào Redis Cache 30 ngày
    await RedisService.set(cacheKey, result, 30 * 86400);

    return result;
  }

  /**
   * AI Sensei Chấm Chữa Câu Do Học Viên Tự Đặt (Active Recall & Formative Feedback)
   */
  static async diagnoseSentence(vocabId: string, userSentence: string): Promise<SentenceDiagnosisResult> {
    const cleanSentence = userSentence.trim();
    if (!cleanSentence || cleanSentence.length < 2) {
      throw new Error('Câu tiếng Nhật nhập vào quá ngắn.');
    }

    const vocab = await prisma.vocabulary.findUnique({
      where: { id: vocabId }
    });

    if (!vocab) {
      throw new Error(`Không tìm thấy từ vựng ID "${vocabId}".`);
    }

    const prompt = `Bạn là một Giáo sư Ngôn ngữ học tiếng Nhật đang chấm bài tập đặt câu của học viên.
Học viên đang học từ vựng:
- Từ vựng mục tiêu: ${vocab.word} (${vocab.reading})
- Ý nghĩa: ${vocab.meaningVi}
- Cấp độ JLPT: ${vocab.jlptLevel}

Câu của học viên tự đặt:
"${cleanSentence}"

Hãy đánh giá và phản hồi ngắn gọn theo định dạng JSON:
{
  "score": Điểm số từ 0 đến 100 (Ví dụ: 85, 95, 60),
  "isCorrect": true (nếu câu đúng ngữ pháp và tự nhiên) hoặc false (nếu sai trợ từ, thể hoặc ngữ pháp),
  "particleFeedback": "Nhận xét cụ thể về trợ từ (は, が, を, に, で, と...) trong câu của học viên",
  "naturalCorrection": "Câu tiếng Nhật được chỉnh sửa lại chuẩn người bản xứ (nếu câu học viên đã hoàn hảo thì giữ nguyên)",
  "explanationVi": "1-2 câu giải thích chi tiết bằng tiếng Việt: khen điểm tốt, chỉ rõ vì sao sửa và lời khuyên để nhớ lâu"
}`;

        const aiRes = await GeminiPoolService.generateContent(process.env.GEMINI_MODEL_LITE || 'gemini-flash-lite-latest', prompt, { responseMimeType: 'application/json' });
    const rawText = aiRes.response.text().trim();
    const cleanJson = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();

    try {
      const parsed: SentenceDiagnosisResult = JSON.parse(cleanJson);
      return {
        score: typeof parsed.score === 'number' ? parsed.score : 80,
        isCorrect: Boolean(parsed.isCorrect),
        particleFeedback: parsed.particleFeedback || 'Trợ từ sử dụng hợp lý.',
        naturalCorrection: parsed.naturalCorrection || cleanSentence,
        explanationVi: parsed.explanationVi || 'Câu tiếng Nhật của bạn rất tốt.'
      };
    } catch (err) {
      return {
        score: 75,
        isCorrect: true,
        particleFeedback: 'Cần chú ý trợ từ đi liền với động từ.',
        naturalCorrection: cleanSentence,
        explanationVi: 'Câu văn truyền đạt được ý nghĩa, hãy tiếp tục phát huy!'
      };
    }
  }
}
