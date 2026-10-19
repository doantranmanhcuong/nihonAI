import { GeminiPoolService } from '../../core/ai-pool.service';
import { prisma } from '../../core/prisma.service';
import { RedisService } from '../../core/redis.service';

export interface GeneratedSentence {
  orderIndex: number;
  paragraphIndex?: number;
  sentenceJp: string;
  sentenceVi: string;
  furigana?: string;
}

export interface GeneratedVocab {
  word: string;
  reading: string;
  hanViet?: string;
  meaningVi: string;
  level: string;
}

export interface GeneratedGrammar {
  grammarPoint: string;
  level: string;
  meaningVi: string;
  excerpt: string;
}

export interface GeneratedQuiz {
  question: string;
  questionVi?: string;
  options: string[];
  optionsVi?: string[];
  correctIndex: number;
  explanation: string;
  questionType: 'UNDERLINE' | 'REASON' | 'MAIN_IDEA' | 'DETAIL_MATCH';
}

export interface GeneratedDokkaiArticle {
  title: string;
  level: string;
  topic: string;
  summaryVi: string;
  totalWords: number;
  sentences: GeneratedSentence[];
  vocabularies: GeneratedVocab[];
  grammars: GeneratedGrammar[];
  quizzes: GeneratedQuiz[];
}

export class ReadingAiService {
  
  

  /**
   * Tính số câu hỏi Dokkai tiêu chuẩn theo cấp độ (N5: 3-4, N4: 4-5, N3: 5-6, N2: 6-8, N1: 7-10)
   */
  private static getTargetQuizCount(level: string): number {
    switch (level.toUpperCase()) {
      case 'N5':
        return 4;
      case 'N4':
        return 5;
      case 'N3':
        return 6;
      case 'N2':
        return 7;
      case 'N1':
        return 8;
      default:
        return 5;
    }
  }

  /**
   * Tính độ dài ký tự chuẩn đề thi thật JLPT Dokkai (Có kết cấu đoạn văn hoàn chỉnh từ 700 - 3000 ký tự)
   */
  private static getTargetLengthDescription(level: string): string {
    switch (level.toUpperCase()) {
      case 'N5':
        return '700 đến 900 ký tự tiếng Nhật (Chia 3 đoạn văn mạch lạc: cuộc sống sinh hoạt, du học, giao tiếp thực tế chuẩn N5)';
      case 'N4':
        return '800 đến 1.200 ký tự tiếng Nhật (Chia 3-4 đoạn văn: văn hóa cộng đồng, quy tắc đời sống, bài báo thường nhật chuẩn N4)';
      case 'N3':
        return '1.000 đến 1.600 ký tự tiếng Nhật (Chia 4-5 đoạn văn chuẩn Trung văn đề thi thật JLPT N3, bài báo thực tế trên truyền thông)';
      case 'N2':
        return '1.300 đến 2.000 ký tự tiếng Nhật (Chia 5-6 đoạn văn chuẩn Trường văn thi thật JLPT N2, xã luận đời sống & kinh tế từ báo chí Nhật)';
      case 'N1':
        return '1.600 đến 3.000 ký tự tiếng Nhật (Chia 6-8 đoạn văn chuyên luận học thuật sâu sắc chuẩn Trường văn thi thật JLPT N1 từ báo Asahi/Nikkei)';
      default:
        return '800 đến 2.000 ký tự tiếng Nhật (Chia 4-6 đoạn văn)';
    }
  }

  /**
   * Sinh toàn bộ bài đọc JLPT Dokkai trong 1 lượt gọi duy nhất (Single-Pass Execution)
   */
  static async generateDokkaiArticle(params: {
    level: string;
    topic: string;
    customRequirement?: string;
    providedText?: string;
  }): Promise<GeneratedDokkaiArticle> {
    const targetQuizCount = this.getTargetQuizCount(params.level);
    const lengthDesc = this.getTargetLengthDescription(params.level);

    const isCustomText = Boolean(params.providedText && params.providedText.trim().length > 0);
    // Split providedText into sentences
    const originalSentences = isCustomText ? params.providedText!.split(/(?<=[。！？\n])/).map(s => s.trim()).filter(s => s.length > 0) : [];

    const prompt = `
Bạn là Giảng viên Chuyên gia biên soạn đề thi Năng lực Nhật ngữ JLPT (Dokkai Master).
Hãy phân tích hoặc sáng tác một bài đọc hiểu chuẩn đề thi thật JLPT cấp độ ${params.level}.

${
  isCustomText
    ? `HỌC VIÊN ĐÃ CUNG CẤP CÁC CÂU SAU ĐÂY:
  """
  ${originalSentences.map((s, idx) => `[Câu ${idx + 1}] ${s}`).join('\n')}
  """
  CRITICAL INSTRUCTION TO AVOID COPYRIGHT/RECITATION BLOCK: DO NOT return the exact verbatim text in any field except with Furigana brackets. You MUST strictly preserve the original meaning and structure, but to avoid copyright blocks, ONLY output the text with Furigana brackets. Tuyệt đối không cắt xén hay bịa đặt, giữ nguyên bản gốc 100%. hãy phân tích từng câu, dịch nghĩa toàn văn, bóc tách từ vựng mới theo cấp độ ${params.level}, lọc ngữ pháp và biên soạn ${targetQuizCount} câu hỏi đọc hiểu JLPT.`
    : `YÊU CẦU NỘI DUNG BÀI ĐỌC:
- Cấp độ JLPT: ${params.level}
- Chủ đề: ${params.topic}
${params.customRequirement ? `- Yêu cầu bổ sung của người học: "${params.customRequirement}"` : ''}
- Độ dài tiêu chuẩn bắt buộc: ${lengthDesc}.
- Bài viết phải mang tính tự nhiên chuẩn Nhật ngữ (đoạn văn có kết cấu mở đoạn, thân đoạn, kết luận rõ ràng, dùng từ nối phù hợp cấp độ).`
}

QUY TẮC BIÊN SOẠN CÂU HỎI TRẮC NGHIỆM DOKKAI (RẤT QUAN TRỌNG):
- NGÔN NGỮ: Trường "question" và "options" PHẢI LÀ 100% TIẾNG NHẬT, tuyệt đối không được chứa bất kỳ từ tiếng Việt nào! (Tiếng Việt chỉ được đặt trong "questionVi" và "optionsVi").
- Số lượng câu hỏi: Soạn ĐÚNG ${targetQuizCount} câu hỏi trắc nghiệm chất lượng cao bám sát bài đọc để người học luyện tập thỏa thích!
- Phải luân phiên đúng 4 dạng câu hỏi kinh điển của đề thi thật JLPT:
  1. Dạng UNDERLINE: Hỏi ý nghĩa hoặc ám chỉ của cụm từ có đánh dấu 【下線】...【/下線】 trong bài đọc.
  2. Dạng REASON: Hỏi tại sao tác giả hoặc nhân vật lại phát biểu / hành động như vậy (なぜ、どうして).
  3. Dạng MAIN_IDEA: Hỏi ý chính / quan điểm cốt lõi mà tác giả muốn truyền đạt nhất (筆者が最も言いたいこと).
  4. Dạng DETAIL_MATCH: Hỏi thông tin nào phù hợp nhất (合致) hoặc không phù hợp (合致しない) với nội dung bài.
- Mỗi câu hỏi gồm 4 lựa chọn (1 đáp án đúng + 3 phương án bẫy gây nhiễu đúng kỹ thuật ra đề thi JLPT).
- Trường "explanation": Viết bằng TIẾNG VIỆT, giải thích chi tiết tại sao đáp án đó đúng, trích dẫn câu có từ khóa trong bài (Keyword Mapping) và chỉ ra bẫy của 3 đáp án còn lại.
- BẮT BUỘC cung cấp "questionVi" (dịch câu hỏi sang tiếng Việt) và "optionsVi" (mảng 4 câu dịch của 4 lựa chọn sang tiếng Việt).
- BẮT BUỘC cung cấp trường "furigana" cho MỌI câu theo chuẩn: 漢字[かんじ] (ví dụ: 私[わたし]は日[に]本[ほん]の文[ぶん]化[か]を...). TUYỆT ĐỐI KHÔNG ĐƯỢC đổi câu thành toàn bộ Hiragana thuần túy (không được viết "わたしはにほんのぶんかを"), phải giữ nguyên vẹn 100% chữ Hán trong câu gốc và chỉ gắn ngoặc [cách đọc] ngay sau từng chữ Hán.

YÊU CẦU TRẢ VỀ JSON TUÂN THỦ STRICT SCHEMA DƯỚI ĐÂY:
{
  "title": "Tiêu đề bài đọc tiếng Nhật",
  "level": "N1/N2/N3/N4/N5 (Phân tích cấp độ JLPT THỰC TẾ của từ/ngữ pháp này)",
  "topic": "${params.topic}",
  "summaryVi": "Tóm tắt đại ý bài đọc trong 1-2 câu tiếng Việt",
  "totalWords": 1200,
  "sentences": [
    {
      "orderIndex": 1,
        "paragraphIndex": 1,
        "sentenceVi": "Bản dịch câu sang tiếng Việt tự nhiên, chính xác",
      "furigana": "Cách đọc furigana định dạng giữ nguyên chữ Hán: 私[わたし]は日[に]本[ほん]の文[ぶん]化[か]を..."
    }
  ],
  "vocabularies": [
    {
      "word": "変化",
      "reading": "へんか",
      "hanViet": "BIẾN HÓA",
      "meaningVi": "sự biến đổi, thay đổi",
      "level": "N1/N2/N3/N4/N5 (Phân tích cấp độ JLPT THỰC TẾ của từ/ngữ pháp này)"
    }
  ],
  "noteVocab": "Hãy bóc tách từ 10 đến 15 từ vựng trọng điểm quan trọng nhất trong bài",
  "grammars": [
    {
      "grammarPoint": "〜によって",
      "level": "N1/N2/N3/N4/N5 (Phân tích cấp độ JLPT THỰC TẾ của từ/ngữ pháp này)",
      "meaningVi": "Tùy thuộc vào / Do",
      "excerpt": "Trích đoạn câu trong bài chứa mẫu ngữ pháp này"
    }
  ],
  "noteGrammar": "Hãy bóc tách từ 4 đến 6 mẫu ngữ pháp tiêu biểu xuất hiện trong bài",
  "quizzes": [
    {
      "question": "Câu hỏi bằng tiếng Nhật (Ví dụ: 「【下線】...【/下線】」とあるが、なぜか？)",
      "questionVi": "Bản dịch câu hỏi sang tiếng Việt",
      "options": [
        "1. Lựa chọn 1",
        "2. Lựa chọn 2",
        "3. Lựa chọn 3",
        "4. Lựa chọn 4"
      ],
      "optionsVi": [
        "1. Bản dịch lựa chọn 1",
        "2. Bản dịch lựa chọn 2",
        "3. Bản dịch lựa chọn 3",
        "4. Bản dịch lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Giải thích chi tiết bằng tiếng Việt...",
      "questionType": "REASON"
    }
  ]
}
`;

    const parsed: GeneratedDokkaiArticle = await this.executeWithModelFallback(prompt, 0.3);
    return parsed;
  }

  /**
   * Sinh thêm câu hỏi Dokkai cho một bài đọc đã có sẵn trong CSDL
   * Đảm bảo KHÔNG TRÙNG LẶP với các câu hỏi hiện tại và có đầy đủ bản dịch tiếng Việt
   */
  static async generateMoreQuizzesForArticle(
    articleOrId: string | { id: string; level: string; sentences: Array<{ sentenceJp: string }> },
    additionalCount: number = 3,
    existingQuestionTexts: string[] = []
  ): Promise<GeneratedQuiz[]> {
    let article: { id: string; level: string; sentences: Array<{ sentenceJp: string }> } | null = null;

    if (typeof articleOrId === 'string') {
      article = await prisma.readingArticle.findUnique({
        where: { id: articleOrId },
        include: { sentences: { orderBy: { orderIndex: 'asc' } }, quizzes: true }
      });
      if (!article) {
        throw new Error(`Article ${articleOrId} not found.`);
      }
      if (existingQuestionTexts.length === 0 && (article as any).quizzes) {
        existingQuestionTexts = (article as any).quizzes.map((q: any) => q.question);
      }
    } else {
      article = articleOrId;
    }

    const fullArticleText = article.sentences.map((s) => s.sentenceJp).join(' ');
    const existingList =
      existingQuestionTexts.length > 0
        ? existingQuestionTexts.map((q) => `- ${q}`).join('\n')
        : 'Chưa có câu hỏi nào';

    const prompt = `
Bạn là Giảng viên biên soạn đề thi JLPT Dokkai (${article.level}).
Dưới đây là văn bản bài đọc:
"""
${fullArticleText}
"""

CÁC CÂU HỎI ĐÃ CÓ SẴN (TUYỆT ĐỐI KHÔNG LẶP LẠI Ý HOẶC TRÙNG LẶP NỘI DUNG VỚI CÁC CÂU NÀY):
${existingList}

HÃY SOẠN THÊM ${additionalCount} CÂU HỎI TRẮC NGHIỆM ĐỌC HIỂU HOÀN TOÀN MỚI, KHAI THÁC CÁC GÓC ĐỘ KHÁC NHAU CỦA BÀI ĐỌC (Ví dụ: chi tiết cụ thể, ý chính đoạn văn, mục đích tác giả, suy luận logic, từ chỉ định これ/それ/あれ).
Mỗi câu hỏi BẮT BUỘC có cả tiếng Nhật và bản dịch tiếng Việt chuẩn xác cho đề bài và cả 4 phương án!

QUAN TRỌNG VỀ ĐÁP ÁN: Vị trí đáp án đúng "correctIndex" (0, 1, 2 hoặc 3) PHẢI ĐƯỢC XÁO TRỘN NGẪU NHIÊN. Tuyệt đối KHÔNG cố định đáp án đúng luôn ở vị trí 0 (câu 1) mà phải rải đều ngẫu nhiên ra các vị trí 0, 1, 2, 3.

Trả về JSON mảng quizzes:
[
  {
    "question": "Câu hỏi bằng tiếng Nhật (Ví dụ: 「...」とあるが、なぜか？)...",
    "questionVi": "Bản dịch câu hỏi sang tiếng Việt...",
    "options": ["Lựa chọn 1 tiếng Nhật...", "Lựa chọn 2...", "Lựa chọn 3...", "Lựa chọn 4..."],
    "optionsVi": ["Dịch lựa chọn 1...", "Dịch lựa chọn 2...", "Dịch lựa chọn 3...", "Dịch lựa chọn 4..."],
    "correctIndex": 2,
    "explanation": "Giải thích chi tiết tại sao đúng và tại sao các câu khác sai bằng tiếng Việt...",
    "questionType": "DETAIL_MATCH"
  }
]
`;

    const parsed: GeneratedQuiz[] = await this.executeWithModelFallback(prompt, 0.4);
    return Array.isArray(parsed) ? parsed : [];
  }

  /**
   * Dịch chính xác cụm từ được bôi đen và phân tích trợ từ/cấu trúc
   */
  /**
   * Dịch chính xác cụm từ hoặc câu được bôi đen (eJOY style)
   * - Nếu là từ vựng: Chữ Hán có Furigana, Ý nghĩa, 1 câu ví dụ đơn
   * - Nếu là cả câu: Dịch cả câu, Phân tích mẫu ngữ pháp tương ứng, 1 câu ví dụ
   * - Tuyệt đối không hiển thị cấp độ từ (N1-N5)
   */
  static async translateSelection(text: string, contextSentence?: string) {
    const cleanText = text.trim();
    if (!cleanText) return { translation: '', explanation: '' };

    const cacheKey = `reading:trans_sel_v2:${Buffer.from(cleanText + (contextSentence || '')).toString('base64').slice(0, 48)}`;
    const cached = await RedisService.get<any>(cacheKey);
    if (cached.data) {
      return cached.data as {vocabularies: any[], grammars: any[]};
    }

    const isSentence = cleanText.length > 25 || /[。！？!?\n]/.test(cleanText) || (cleanText.includes('は') && (cleanText.includes('です') || cleanText.includes('ます') || cleanText.includes('だ')));

    const prompt = `
Bạn là chuyên gia dịch thuật và sư phạm tiếng Nhật JLPT.
Người học bôi đen đoạn tiếng Nhật sau để tra cứu:
"""
${cleanText}
"""
${contextSentence ? `Trong ngữ cảnh câu sau:\n"""\n${contextSentence}\n"""` : ''}

YÊU CẦU NGHIÊM NGẶT:
1. TUYỆT ĐỐI KHÔNG hiển thị cấp độ JLPT (như N1, N2, N3, N4, N5).
2. BẮT BUỘC PHẢI CÓ FURIGANA cho các chữ Hán (Kanji) theo định dạng chuẩn: 漢字（かんじ）.

PHÂN BIỆT RÕ 2 TRƯỜNG HỢP:

${isSentence ? `
[TRƯỜNG HỢP: CẢ CÂU VĂN HOẶC MỆNH ĐỀ DÀI]
Trả về JSON định dạng:
{
  "type": "sentence",
  "translation": "Bản dịch nghĩa tiếng Việt chuẩn xác, mạch lạc và tự nhiên của cả câu",
  "grammarPoint": "Tên mẫu ngữ pháp nổi bật hoặc cấu trúc then chốt được dùng trong câu này",
  "grammarStructure": "Cấu trúc công thức kết hợp của mẫu ngữ pháp đó (ví dụ: V-る + に伴い / N + に沿って)",
  "grammarMeaning": "Ý nghĩa và cách dùng của mẫu ngữ pháp này trong câu",
  "example": {
    "jp": "1 câu ví dụ minh họa cách dùng mẫu ngữ pháp này (có kèm Furigana cho chữ Hán)",
    "vi": "Dịch nghĩa tiếng Việt của câu ví dụ"
  }
}
` : `
[TRƯỜNG HỢP: TỪ VỰNG HOẶC CỤM TỪ NGẮN]
Trả về JSON định dạng:
{
  "type": "word",
  "kanjiWithFurigana": "Từ/cụm từ có đầy đủ cách đọc Furigana trong ngoặc đơn, ví dụ: 把握（はあく） hoặc 矛盾（むじゅん）",
  "meaningVi": "Ý nghĩa tiếng Việt súc tích, chuẩn xác của từ trong ngữ cảnh này",
  "explanation": "Giải thích ngắn về từ loại, sắc thái cách dùng",
  "example": {
    "jp": "1 câu ví dụ đơn giản tiếng Nhật có chứa từ này (có kèm Furigana cho chữ Hán)",
    "vi": "Dịch nghĩa tiếng Việt của câu ví dụ"
  }
}
`}
`;

    try {
      const parsed = await this.executeWithModelFallback(prompt, 0.2);
      // Tương thích ngược: map các trường cũ để giao diện luôn hiển thị mượt mà
      const standardized = {
        type: parsed.type || (isSentence ? 'sentence' : 'word'),
        kanjiWithFurigana: parsed.kanjiWithFurigana || cleanText,
        translation: parsed.meaningVi || parsed.translation || cleanText,
        explanation: parsed.explanation || parsed.grammarMeaning || '',
        grammarPoint: parsed.grammarPoint || null,
        grammarStructure: parsed.grammarStructure || null,
        grammarMeaning: parsed.grammarMeaning || null,
        example: parsed.example || (parsed.examples && parsed.examples[0]) || null,
        examples: parsed.examples || (parsed.example ? [parsed.example] : [])
      };

      await RedisService.set(cacheKey, standardized, 86400);
      return standardized;
    } catch (err: any) {
      console.error('Error in translateSelection:', err);
      return {
        type: isSentence ? 'sentence' : 'word',
        kanjiWithFurigana: cleanText,
        translation: cleanText,
        explanation: 'Không thể kết nối AI phân tích vào lúc này.',
        example: null,
        examples: []
      };
    }
  }

  /**
   * Giải thích chuyên sâu cấu trúc ngữ pháp và cách dùng trong câu trích dẫn
   */
  static async explainGrammar(grammarPoint: string, sentence?: string, level?: string) {
    const cleanPoint = grammarPoint.trim();
    const cacheKey = `reading:grammar_exp:${Buffer.from(cleanPoint + (level || '')).toString('base64').slice(0, 48)}`;
    const cached = await RedisService.get<any>(cacheKey);
    if (cached.data) {
      return cached.data;
    }

    const prompt = `
Bạn là Giảng viên luyện thi JLPT cao cấp.
Hãy giải thích CHI TIẾT và CHUẨN XÁC mẫu ngữ pháp tiếng Nhật sau:
- Mẫu ngữ pháp: "${cleanPoint}"
- Cấp độ JLPT: ${level || 'N/A'}
${sentence ? `- Đoạn câu được dùng trong bài đọc: "${sentence}"` : ''}

Yêu cầu giải thích:
1. Ý nghĩa tiếng Việt chính xác và sắc thái biểu cảm.
2. Cấu trúc kết hợp (Công thức ngữ pháp rõ ràng: Động từ chia thể nào, danh từ, tính từ + gì...).
3. Cách sử dụng, phân biệt với ngữ pháp tương đương và lỗi người học hay mắc phải.
4. Phân tích cách ngữ pháp này được áp dụng trực tiếp trong đoạn câu trích dẫn của bài đọc.
5. Cho 2-3 câu ví dụ kinh điển (tiếng Nhật có Furigana hoặc romaji + dịch tiếng Việt).

Trả về JSON:
{
  "grammarPoint": "${cleanPoint}",
  "level": "${level || ''}",
  "meaningVi": "Ý nghĩa tiếng Việt...",
  "structure": "Công thức kết hợp...",
  "explanation": "Giải thích chi tiết sắc thái và cách dùng...",
  "excerptAnalysis": "Phân tích cụ thể cách dùng trong câu trích dẫn...",
  "examples": [
    {
      "japanese": "Ví dụ tiếng Nhật...",
      "reading": "Cách đọc furigana...",
      "vietnamese": "Dịch nghĩa..."
    }
  ]
}
`;

    try {
      const parsed = await this.executeWithModelFallback(prompt, 0.3);
      await RedisService.set(cacheKey, parsed, 604800);
      return parsed;
    } catch (err: any) {
      console.error('Error in explainGrammar:', err);
      return {
        grammarPoint: cleanPoint,
        level: level || '',
        meaningVi: 'Đang cập nhật giải thích ngữ pháp.',
        structure: '',
        explanation: 'Không thể kết nối AI phân tích ngữ pháp vào lúc này.',
        excerptAnalysis: '',
        examples: []
      };
    }
  }

  /**
   * Bộ điều phối gọi Gemini AI có fallback model tự động để tránh lỗi 503 / 404
   */
    /**
   * Trích xuất Từ vựng và Ngữ pháp nổi bật từ văn bản bằng AI (Tốc độ cao)
   */
  static async extractVocabAndGrammar(text: string, level?: string): Promise<{vocabularies: any[], grammars: any[]}> {
    const cleanText = text.trim();
    if (!cleanText) return { vocabularies: [], grammars: [] };

    const cacheKey = `reading:extract_vg:${Buffer.from(cleanText.slice(0, 100) + (level||'')).toString('base64').slice(0, 48)}`;
    const { RedisService } = await import('../../core/redis.service');
    const cached = await RedisService.get<any>(cacheKey);
    if (cached.data) {
      return cached.data;
    }

    const prompt = `Bạn là chuyên gia phân tích ngữ liệu tiếng Nhật JLPT.
Đọc văn bản sau và trích xuất TOÀN BỘ từ vựng trọng điểm (không giới hạn số lượng, thường 15-30 từ) (Danh từ, Động từ, Tính từ) quan trọng nhất và TOÀN BỘ mẫu ngữ pháp quan trọng (không giới hạn, thường 5-15 mẫu).
Ưu tiên các từ vựng và ngữ pháp tương đương trình độ ${level || 'N3'}.

VĂN BẢN:
"""
${cleanText}
"""

YÊU CẦU TRẢ VỀ JSON DUY NHẤT:
{
  "vocabularies": [
    {
      "word": "từ gốc (Kanji)",
      "reading": "hiragana",
      "meaningVi": "[Từ loại] Nghĩa tiếng Việt chuẩn xác và giải thích ngắn gọn",
      "pos": "Danh từ / Động từ / Tính từ",
      "level": "N3"
    }
  ],
  "grammars": [
    {
      "grammar": "mẫu ngữ pháp gốc",
      "meaningVi": "Nghĩa tiếng Việt",
      "explanation": "Giải thích CHI TIẾT cấu trúc, sắc thái, và cách dùng trong văn cảnh, như một cuốn từ điển",
      "level": "N3"
    }
  ]
}`;

    try {
      const parsed = await this.executeWithModelFallback(prompt, 0.1);
      const res = {
        vocabularies: Array.isArray(parsed.vocabularies) ? parsed.vocabularies : [],
        grammars: Array.isArray(parsed.grammars) ? parsed.grammars : []
      };
      await RedisService.set(cacheKey, res, 86400 * 7); // Cache 7 days
      return res;
    } catch (err: any) {
      console.error('Error in extractVocabAndGrammar:', err);
      return { vocabularies: [], grammars: [] };
    }
  }

  private static async executeWithModelFallback(prompt: string, temperature = 0.2): Promise<any> {
    const result = await GeminiPoolService.generateContent(
      process.env.GEMINI_MODEL || 'gemini-flash-latest',
      prompt,
      { responseMimeType: 'application/json', temperature }
    );
    const text = result.response.text().trim();
    const cleanJson = text.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
    const parsedResult = JSON.parse(cleanJson);
    if (parsedResult && parsedResult.sentences) {
      parsedResult.sentences.forEach((s: any) => {
        if (!s.sentenceJp && s.furigana) {
          s.sentenceJp = s.furigana.replace(/\[.*?\]/g, '');
        }
      });
    }
    return parsedResult;
  }
}
