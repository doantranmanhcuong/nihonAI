import { GeminiPoolService } from '../../core/ai-pool.service';
import { prisma } from '../../core/prisma.service';
import { RedisService } from '../../core/redis.service';

export interface KanjiAiInsightResult {
  id?: string;
  character: string;
  hanViet: string;
  meaningVi: string;
  mnemonicStory: string;
  radicalBreakdown: { symbol: string; meaning: string }[];
  culturalContext?: string;
  confusionWarning?: string;
  generatedByModel: string;
  isCached: boolean;
}

export class KanjiAiService {
  
  

  /**
   * Lấy hoặc sinh mới câu chuyện chiết tự thông minh cho chữ Hán (Lazy Generation + 0 Token Cache)
   */
  static async getOrGenerateKanjiInsight(character: string, forceRegenerate = false): Promise<KanjiAiInsightResult> {
    const cleanChar = character.trim();
    const cacheKey = `kanji:ai:${cleanChar}`;

    // 1. Kiểm tra Redis Cache trước (0 token, < 1ms)
    if (!forceRegenerate) {
      const redisCached = await RedisService.get<KanjiAiInsightResult>(cacheKey);
      if (redisCached.data && redisCached.data.mnemonicStory && !redisCached.data.mnemonicStory.startsWith('{')) {
        return { ...redisCached.data, isCached: true };
      }
    }

    // 2. Kiểm tra bảng mở rộng kanji_ai_insights trong MySQL (0 token, ~2ms)
    const existingDb = await prisma.kanjiAiInsight.findUnique({
      where: { character: cleanChar }
    });

    // Nếu đã có và không bị lỗi JSON dở dang thì trả về ngay
    if (existingDb && !forceRegenerate && existingDb.mnemonicStory && !existingDb.mnemonicStory.startsWith('{')) {
      let radicals: { symbol: string; meaning: string }[] = [];
      try {
        radicals = JSON.parse(existingDb.radicalBreakdown);
      } catch (e) {
        radicals = [];
      }

      const kanjiRecord = await prisma.kanji.findUnique({ where: { character: cleanChar } });

      const result: KanjiAiInsightResult = {
        id: existingDb.id,
        character: existingDb.character,
        hanViet: kanjiRecord?.hanViet || 'HÁN TỰ',
        meaningVi: kanjiRecord?.meaningVi || '',
        mnemonicStory: existingDb.mnemonicStory,
        radicalBreakdown: radicals,
        culturalContext: existingDb.culturalContext || undefined,
        confusionWarning: existingDb.confusionWarning || undefined,
        generatedByModel: existingDb.generatedByModel,
        isCached: true
      };

      // Ghi nhớ vào Redis 30 ngày
      await RedisService.set(cacheKey, result, 30 * 86400);
      return result;
    }

    // 3. Nếu chưa có hoặc cần sinh lại: Tiến hành gọi Gemini Flash Lite
    const kanji = await prisma.kanji.findUnique({
      where: { character: cleanChar }
    });

    if (!kanji) {
      throw new Error(`Không tìm thấy chữ Hán "${cleanChar}" trong cơ sở dữ liệu.`);
    }

    let parsedRadicals: any[] = [];
    try {
      parsedRadicals = JSON.parse(kanji.radicals || '[]');
    } catch (e) {
      parsedRadicals = [];
    }

    const radicalNames = parsedRadicals.map((r) => `${r.symbol} (${r.name})`).join(', ');

    const prompt = `Bạn là một Giáo sư Ngôn ngữ học tiếng Nhật và Chuyên gia Chiết tự Hán tự (Kanji).
Hãy sáng tạo một câu chuyện chiết tự (mnemonic story) thật hình tượng, hóm hỉnh, dễ nhớ nhất cho chữ Hán sau:
- Chữ Hán: ${cleanChar}
- Âm Hán Việt: ${kanji.hanViet}
- Ý nghĩa: ${kanji.meaningVi}
- Cấp độ JLPT: ${kanji.jlptLevel}
- Số nét: ${kanji.strokeCount}
- Các bộ thủ cấu thành: ${radicalNames || cleanChar}

YÊU CẦU: Trả về cấu trúc JSON hợp lệ:
{
  "mnemonicStory": "Câu chuyện ngắn 1-2 câu kết hợp các bộ thủ thành hình ảnh đời thường sống động giúp nhớ ngay mặt chữ và ý nghĩa.",
  "radicalBreakdown": [
    { "symbol": "ký hiệu bộ thủ", "meaning": "ý nghĩa tượng hình trong câu chuyện" }
  ],
  "culturalContext": "1 câu ngắn về nguồn gốc chữ hoặc văn hóa Nhật Bản liên quan (tùy chọn)",
  "confusionWarning": "1 câu ngắn mẹo phân biệt với các chữ có nét tương tự để tránh nhầm khi đi thi JLPT"
}`;

        const aiRes = await GeminiPoolService.generateContent(process.env.GEMINI_MODEL_LITE || 'gemini-flash-lite-latest', prompt, { responseMimeType: 'application/json' });
    const rawText = aiRes.response.text().trim();

    // Làm sạch định dạng JSON nếu cần
    const cleanJson = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
    let aiData: any = {};
    try {
      aiData = JSON.parse(cleanJson);
    } catch (e) {
      // Regex trích xuất nếu parse toàn phần gặp lỗi
      const match = rawText.match(/"mnemonicStory"\s*:\s*"([^"]+)"/);
      aiData = {
        mnemonicStory: match ? match[1] : `Chữ ${cleanChar} (${kanji.hanViet}) gồm các bộ thủ ${radicalNames || cleanChar}, mang nghĩa ${kanji.meaningVi}.`,
        radicalBreakdown: parsedRadicals.map((r) => ({ symbol: r.symbol, meaning: r.name })),
        confusionWarning: `Lưu ý số nét (${kanji.strokeCount} nét) để tránh nhầm lẫn khi làm bài thi.`
      };
    }

    const finalMnemonicStory = aiData.mnemonicStory || `Chữ ${cleanChar} (${kanji.hanViet}) mang nghĩa ${kanji.meaningVi}.`;

    // 4. Lưu vĩnh viễn vào bảng mở rộng kanji_ai_insights trong MySQL (Chuẩn Microservices)
    const savedInsight = await prisma.kanjiAiInsight.upsert({
      where: { character: cleanChar },
      update: {
        mnemonicStory: finalMnemonicStory,
        radicalBreakdown: JSON.stringify(aiData.radicalBreakdown || []),
        culturalContext: aiData.culturalContext || null,
        confusionWarning: aiData.confusionWarning || null,
        generatedByModel: process.env.GEMINI_MODEL_LITE || 'gemini-flash-lite-latest'
      },
      create: {
        kanjiId: kanji.id,
        character: cleanChar,
        mnemonicStory: finalMnemonicStory,
        radicalBreakdown: JSON.stringify(aiData.radicalBreakdown || []),
        culturalContext: aiData.culturalContext || null,
        confusionWarning: aiData.confusionWarning || null,
        generatedByModel: process.env.GEMINI_MODEL_LITE || 'gemini-flash-lite-latest'
      }
    });

    // Đồng bộ ngược lại trường mnemonicAi của bảng kanjis
    await prisma.kanji.update({
      where: { id: kanji.id },
      data: { mnemonicAi: finalMnemonicStory }
    }).catch(() => {});

    const result: KanjiAiInsightResult = {
      id: savedInsight.id,
      character: cleanChar,
      hanViet: kanji.hanViet,
      meaningVi: kanji.meaningVi,
      mnemonicStory: savedInsight.mnemonicStory,
      radicalBreakdown: aiData.radicalBreakdown || [],
      culturalContext: savedInsight.culturalContext || undefined,
      confusionWarning: savedInsight.confusionWarning || undefined,
      generatedByModel: process.env.GEMINI_MODEL_LITE || 'gemini-flash-lite-latest',
      isCached: false
    };

    // 5. Lưu vào Redis Cache 30 ngày
    await RedisService.set(cacheKey, result, 30 * 86400);

    return result;
  }
}
