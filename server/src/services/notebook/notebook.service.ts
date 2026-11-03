import { prisma } from '../../core/prisma.service';
import { GeminiPoolService } from '../../core/ai-pool.service';
import { RedisService } from '../../core/redis.service';
import { LevelSummary, NotebookHubSummary } from './notebook.types';

export class NotebookService {
  static async getItems(userId: string | undefined, filters: any) {
    if (!userId) throw new Error('Unauthorized');
    
    const cacheKey = `notebook:v3:${userId}:items:${JSON.stringify(filters)}`;
    const { data } = await RedisService.getOrSet(
      cacheKey,
      async () => {
        const andConditions: any[] = [{ userId }];

        if (filters.level && filters.level !== 'ALL') {
          andConditions.push({ level: filters.level });
        }
        if (filters.masteryStatus && filters.masteryStatus !== 'ALL') {
          andConditions.push({ masteryStatus: filters.masteryStatus });
        }
        if (filters.tags) {
          andConditions.push({ tags: { contains: filters.tags } });
        }

        // Section handling (Đồng bộ 100% với bộ đếm getHubSummary)
        if (filters.section && filters.section !== 'all') {
          if (filters.section === 'due') {
            andConditions.push({ nextReviewAt: { lte: new Date() } });
          } else if (filters.section === 'mistakes') {
            andConditions.push({
              OR: [
                { tags: { contains: 'Câu_sai' } },
                { tags: { contains: 'Thi_thử' } }
              ]
            });
          } else if (filters.section === 'vocab') {
            andConditions.push({ itemType: 'VOCAB' });
          } else if (filters.section === 'kanji') {
            andConditions.push({ itemType: 'KANJI' });
          } else if (filters.section === 'grammar') {
            andConditions.push({ itemType: 'GRAMMAR' });
          } else if (filters.section === 'note') {
            andConditions.push({ itemType: 'NOTE' });
          }
        } else if (filters.itemType && filters.itemType !== 'ALL') {
          andConditions.push({ itemType: filters.itemType });
        }

        if (filters.search) {
          const s = String(filters.search).trim();
          andConditions.push({
            OR: [
              { title: { contains: s } },
              { meaningVi: { contains: s } },
              { reading: { contains: s } },
              { tags: { contains: s } }
            ]
          });
        }

        const where = { AND: andConditions };
        
        return await prisma.notebookItem.findMany({
          where,
          orderBy: { updatedAt: 'desc' },
          take: filters.limit ? Number(filters.limit) : 200
        });
      },
      300 // cache for 5 minutes
    );
    return data;
  }

  static async getHubSummary(userId: string | undefined): Promise<NotebookHubSummary> {
    if (!userId) throw new Error('Unauthorized');

    const cacheKey = `notebook:v3:${userId}:hub-summary`;
    const { data } = await RedisService.getOrSet(
      cacheKey,
      async () => {
        const now = new Date();
        const [items, user] = await Promise.all([
          prisma.notebookItem.findMany({
            where: { userId },
            select: {
              id: true,
              level: true,
              itemType: true,
              tags: true,
              masteryStatus: true,
              nextReviewAt: true
            }
          }),
          prisma.user.findUnique({
            where: { id: userId },
            select: { studyStreak: true, lastStudyDate: true }
          })
        ]);

        const createEmptySummary = (): LevelSummary => ({
          total: 0,
          due: 0,
          mistakes: 0,
          vocab: 0,
          kanji: 0,
          grammar: 0,
          note: 0,
          mastered: 0,
          learning: 0,
          reviewing: 0
        });

        const levels: Record<string, LevelSummary> = {
          N5: createEmptySummary(),
          N4: createEmptySummary(),
          N3: createEmptySummary(),
          N2: createEmptySummary(),
          N1: createEmptySummary()
        };

        const overall: NotebookHubSummary['overall'] = {
          total: 0,
          due: 0,
          mistakes: 0,
          vocab: 0,
          kanji: 0,
          grammar: 0,
          note: 0,
          mastered: 0,
          learning: 0,
          reviewing: 0,
          studyStreak: user?.studyStreak || 0,
          lastStudyDate: user?.lastStudyDate || null
        };

        for (const item of items) {
          const rawLvl = item.level?.toUpperCase();
          const lvl = (rawLvl && levels[rawLvl]) ? rawLvl : 'N3';
          const target = levels[lvl];
          const isMistake = Boolean(item.tags?.includes('Câu_sai') || item.tags?.includes('Thi_thử'));
          const isDue = item.nextReviewAt ? new Date(item.nextReviewAt) <= now : false;

          target.total++;
          overall.total++;

          if (isDue) {
            target.due++;
            overall.due++;
          }

          if (isMistake) {
            target.mistakes++;
            overall.mistakes++;
          }

          if (item.itemType === 'VOCAB') {
            target.vocab++;
            overall.vocab++;
          } else if (item.itemType === 'KANJI') {
            target.kanji++;
            overall.kanji++;
          } else if (item.itemType === 'GRAMMAR') {
            target.grammar++;
            overall.grammar++;
          } else if (item.itemType === 'NOTE') {
            target.note++;
            overall.note++;
          }

          if (item.masteryStatus === 'MASTERED') {
            target.mastered++;
            overall.mastered++;
          } else if (item.masteryStatus === 'REVIEWING') {
            target.reviewing++;
            overall.reviewing++;
          } else {
            target.learning++;
            overall.learning++;
          }
        }

        return {
          levels: levels as NotebookHubSummary['levels'],
          overall
        };
      },
      300 // cache for 5 minutes
    );

    return data;
  }

  static async getStats(userId: string | undefined) {
    if (!userId) throw new Error('Unauthorized');
    
    const cacheKey = `notebook:v3:${userId}:stats`;
    const { data } = await RedisService.getOrSet(
      cacheKey,
      async () => {
        const where: any = { userId };

        const [
          total,
          mastered,
          reviewing,
          learning,
          vocabCount,
          kanjiCount,
          grammarCount,
          noteCount,
          due,
          user
        ] = await Promise.all([
          prisma.notebookItem.count({ where }),
          prisma.notebookItem.count({ where: { ...where, masteryStatus: 'MASTERED' } }),
          prisma.notebookItem.count({ where: { ...where, masteryStatus: 'REVIEWING' } }),
          prisma.notebookItem.count({ where: { ...where, masteryStatus: 'LEARNING' } }),
          prisma.notebookItem.count({ where: { ...where, itemType: 'VOCAB' } }),
          prisma.notebookItem.count({ where: { ...where, itemType: 'KANJI' } }),
          prisma.notebookItem.count({ where: { ...where, itemType: 'GRAMMAR' } }),
          prisma.notebookItem.count({ where: { ...where, itemType: 'NOTE' } }),
          prisma.notebookItem.count({ where: { ...where, nextReviewAt: { lte: new Date() } } }),
          prisma.user.findUnique({ where: { id: userId }, select: { studyStreak: true, lastStudyDate: true } })
        ]);

        return {
          totalItems: total,
          masteredItems: mastered,
          reviewingItems: reviewing,
          learningItems: learning,
          vocabCount,
          kanjiCount,
          grammarCount,
          noteCount,
          dueItems: due,
          studyStreak: user?.studyStreak || 0,
          lastStudyDate: user?.lastStudyDate || null
        };
      },
      300 // cache for 5 minutes
    );
    return data;
  }

  static async createItem(data: any, userId: string | undefined) {
    if (!userId) throw new Error('Unauthorized');
    
    // Prevent duplicates based on itemType and title for the same user
    const existing = await prisma.notebookItem.findFirst({
      where: {
        userId,
        itemType: data.itemType,
        title: data.title
      }
    });

    if (existing) {
      return existing;
    }

    await RedisService.delPrefix(`notebook:v3:${userId}:`);
    return await prisma.notebookItem.create({
      data: {
        ...data,
        userId
      }
    });
  }

  static async updateItem(id: string, data: any, userId: string | undefined) {
    if (!userId) throw new Error('Unauthorized');
    const item = await prisma.notebookItem.findFirst({ where: { id, userId } });
    if (!item) throw new Error('Not found or unauthorized');

    await RedisService.delPrefix(`notebook:v3:${userId}:`);
    return await prisma.notebookItem.update({
      where: { id },
      data
    });
  }

  static async toggleMastery(id: string, masteryStatus: string, userId: string | undefined) {
    if (!userId) throw new Error('Unauthorized');
    const item = await prisma.notebookItem.findFirst({ where: { id, userId } });
    if (!item) throw new Error('Not found or unauthorized');

    await RedisService.delPrefix(`notebook:v3:${userId}:`);
    return await prisma.notebookItem.update({
      where: { id },
      data: { masteryStatus }
    });
  }

  static async deleteItemByTitle(itemType: string, title: string, userId: string | undefined) {
    if (!userId) throw new Error('Unauthorized');
    const items = await prisma.notebookItem.findMany({ 
      where: { itemType, title, userId } 
    });
    if (items.length === 0) return { success: true };

    await prisma.notebookItem.deleteMany({
      where: { itemType, title, userId }
    });
    await RedisService.delPrefix(`notebook:v3:${userId}:`);
    return { success: true };
  }

  static async deleteItem(id: string, userId: string | undefined) {
    if (!userId) throw new Error('Unauthorized');
    const item = await prisma.notebookItem.findFirst({ where: { id, userId } });
    if (!item) throw new Error('Not found or unauthorized');

    await prisma.notebookItem.delete({
      where: { id }
    });
    await RedisService.delPrefix(`notebook:v3:${userId}:`);
    return { success: true };
  }

  static async saveToNotebook(data: {
    userId: string;
    itemType: 'VOCAB' | 'KANJI' | 'GRAMMAR' | 'NOTE';
    title: string;
    reading?: string;
    meaningVi: string;
    level?: string;
    structure?: string;
    articleId?: string;
  }) {
    if (!data.userId) throw new Error('Unauthorized');
    await RedisService.delPrefix(`notebook:v3:${data.userId}:`);
    return await prisma.notebookItem.create({
      data: {
        userId: data.userId,
        itemType: data.itemType,
        title: data.title,
        reading: data.reading || null,
        meaningVi: data.meaningVi,
        level: data.level || 'N3',
        structure: data.structure || null,
      }
    });
  }

  // --- SRS SM-2 ALGORITHM METHODS ---

  static async getDueCards(userId: string | undefined, limit: number = 200, itemType?: string, level?: string) {
    if (!userId) throw new Error('Unauthorized');
    const where: any = {
      userId,
      nextReviewAt: { lte: new Date() }
    };
    if (itemType && itemType !== 'ALL') where.itemType = itemType;
    if (level && level !== 'ALL') where.level = level;

    return await prisma.notebookItem.findMany({
      where,
      orderBy: { nextReviewAt: 'asc' },
      take: limit
    });
  }

  static calculateSM2(quality: number, oldInterval: number, oldEase: number) {
    let interval = 1;
    let easeFactor = oldEase;

    if (quality < 3) {
      interval = 1;
      easeFactor = Math.max(1.3, oldEase - 0.2);
    } else {
      if (quality === 3) {
        interval = Math.max(1, Math.round(oldInterval * 1.2));
        easeFactor = Math.max(1.3, oldEase - 0.15);
      } else if (quality === 4) {
        interval = oldInterval === 1 ? 3 : Math.max(1, Math.round(oldInterval * oldEase));
      } else if (quality === 5) {
        interval = oldInterval === 1 ? 4 : Math.max(1, Math.round(oldInterval * oldEase * 1.3));
        easeFactor += 0.15;
      }
    }
    return { interval, easeFactor };
  }

  static async submitReview(id: string, userId: string | undefined, quality: number) {
    if (!userId) throw new Error('Unauthorized');
    const item = await prisma.notebookItem.findFirst({ where: { id, userId } });
    if (!item) throw new Error('Not found or unauthorized');

    const { interval, easeFactor } = this.calculateSM2(quality, item.interval, item.easeFactor);

    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + interval);

    let masteryStatus = 'LEARNING';
    if (interval >= 21) {
      masteryStatus = 'MASTERED';
    } else if (interval >= 7) {
      masteryStatus = 'REVIEWING';
    }

    const updated = await prisma.notebookItem.update({
      where: { id },
      data: {
        interval,
        easeFactor,
        nextReviewAt,
        masteryStatus,
        reviewCount: item.reviewCount + 1,
        lastReviewedAt: new Date()
      }
    });

    await RedisService.delPrefix(`notebook:v3:${userId}:`);

    // Handle User Streak logic
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      let newStreak = user.studyStreak;
      
      if (user.lastStudyDate) {
        const last = new Date(user.lastStudyDate);
        const lastStudyDay = new Date(last.getFullYear(), last.getMonth(), last.getDate());
        const diffDays = Math.floor((today.getTime() - lastStudyDay.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
      } else {
        newStreak = 1; // first time studying
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          studyStreak: newStreak,
          lastStudyDate: now
        }
      });
    }

    return updated;
  }

  // --- AI MNEMONIC GENERATION ---
  static async generateMnemonic(id: string, userId: string | undefined) {
    if (!userId) throw new Error('Unauthorized');
    const item = await prisma.notebookItem.findFirst({ where: { id, userId } });
    if (!item) throw new Error('Not found or unauthorized');

    if (!process.env.GEMINI_API_KEY && !process.env.GEMINI_KEY_VOCAB) {
      throw new Error('Thiếu API Key Gemini');
    }

    const prompt = `Hãy sáng tạo một mẹo nhớ (Mnemonic) cực kỳ dễ nhớ, hài hước hoặc liên kết hình ảnh cho từ vựng/ngữ pháp tiếng Nhật sau:
- Từ: ${item.title}
- Cách đọc: ${item.reading || 'Không rõ'}
- Nghĩa: ${item.meaningVi}
Yêu cầu: Viết ngắn gọn dưới 50 chữ, thú vị, trực diện.`;

    const result = await GeminiPoolService.generateContent(process.env.GEMINI_MODEL || 'gemini-flash-latest', prompt);
    const text = result.response.text();

    await RedisService.delPrefix(`notebook:v3:${userId}:`);
    return await prisma.notebookItem.update({
      where: { id },
      data: {
        note: (item.note ? item.note + '\n\nMẹo AI: ' : 'Mẹo AI: ') + text.trim()
      }
    });
  }

  // --- AI DEEP EXPLANATION FOR NOTEBOOK ITEM (AUTO-PERSISTED) ---
  static async analyzeItemWithAI(id: string, userId: string | undefined) {
    if (!userId) throw new Error('Unauthorized');
    const item = await prisma.notebookItem.findFirst({ where: { id, userId } });
    if (!item) throw new Error('Not found or unauthorized');

    const rawNote = item.note || '';
    const metaMatch = rawNote.match(/<!-- META: ([\s\S]*?) -->/);
    let metaData: any = {};
    if (metaMatch && metaMatch[1]) {
      try {
        metaData = JSON.parse(metaMatch[1]);
      } catch {
        metaData = {};
      }
    }

    const cleanNoteText = rawNote.replace(/<!-- META:[\s\S]*?-->/g, '').trim();
    const stripHtml = (s: string) => (s || '').replace(/<rt>.*?<\/rt>/g, '').replace(/<rp>.*?<\/rp>/g, '').replace(/<\/?[^>]+(>|$)/g, '').trim();

    const hasOptions = Array.isArray(metaData?.options) && metaData.options.length > 0;
    const isStarQuestion = (item.exampleJp || metaData?.question || item.title || '').includes('★');

    const optionsPrompt = hasOptions
      ? metaData.options
          .map((opt: string, idx: number) => {
            const optVi = Array.isArray(metaData.optionsVi) && metaData.optionsVi[idx] ? ` (${metaData.optionsVi[idx]})` : '';
            return `Phương án ${idx + 1}: ${stripHtml(opt)}${optVi}`;
          })
          .join('\n')
      : '';

    const userChoicePrompt =
      hasOptions && metaData.userAnswer !== undefined && metaData.userAnswer !== null
        ? `Học viên đã chọn nhầm: Phương án ${Number(metaData.userAnswer) + 1} (${stripHtml(metaData.options[metaData.userAnswer] || '')})`
        : '';

    const correctChoicePrompt =
      hasOptions && metaData.correctIndex !== undefined && metaData.correctIndex !== null
        ? `Đáp án đúng: Phương án ${Number(metaData.correctIndex) + 1} (${stripHtml(metaData.options[metaData.correctIndex] || '')})`
        : '';

    const prompt = hasOptions
      ? `Bạn là Giáo sư Ngôn ngữ học tiếng Nhật và Chuyên gia luyện thi JLPT. Hãy giải thích chuyên sâu, cặn kẽ và dễ hiểu câu hỏi trong Sổ tay cá nhân sau đây cho học viên Việt Nam:
- Cấp độ: ${item.level || 'N3'} (${item.itemType})
- Tiêu đề / Dạng bài: ${stripHtml(item.title)}
- Câu hỏi tiếng Nhật: ${stripHtml(item.exampleJp || metaData.question || item.title)}
- Dịch nghĩa câu: ${stripHtml(item.meaningVi)}
- Các lựa chọn:
${optionsPrompt}
- ${correctChoicePrompt}
- ${userChoicePrompt}
- Ghi chú hiện có: ${cleanNoteText}

Trả về đúng định dạng JSON sau (tiếng Việt chuẩn, trình bày rõ ràng):
{
  "completedSentence": "${isStarQuestion ? 'Thứ tự ghép đúng cả 4 vị trí dấu ★ (VD: [4] 社内は ➔ [3] ★ もとより ➔ [1] 取引先からも ➔ [2] 厚い信頼を寄せられ) kèm câu hoàn chỉnh' : 'Câu tiếng Nhật hoàn chỉnh đã lắp đáp án đúng (kèm Hiragana trong ngoặc cho từ khóa)'}",
  "grammarFormula": "Công thức ngữ pháp hoặc Từ vựng cốt lõi đóng khung ngắn gọn (VD: N + はもとより = Không những N1 mà ngay cả N2), KHÔNG chép lại cả câu dài.",
  "explanation": "Giải thích chi tiết vì sao đáp án đúng hoàn toàn khớp về mặt ngữ pháp, ngữ nghĩa và ngữ cảnh của câu.",
  "trapAnalysis": "Chỉ rõ nguyên nhân vì sao phương án học viên đã chọn lại sai (do nhầm Hán tự đồng âm, sai cấu trúc kết hợp hay sai sắc thái).",
  "optionBreakdowns": [
    "Phương án 1: [Từ/Cấu trúc] (Cách đọc Hiragana) — Nghĩa tiếng Việt & giải thích ngắn gọn",
    "Phương án 2: [Từ/Cấu trúc] (Cách đọc Hiragana) — Nghĩa tiếng Việt & giải thích ngắn gọn",
    "Phương án 3: [Từ/Cấu trúc] (Cách đọc Hiragana) — Nghĩa tiếng Việt & giải thích ngắn gọn",
    "Phương án 4: [Từ/Cấu trúc] (Cách đọc Hiragana) — Nghĩa tiếng Việt & giải thích ngắn gọn"
  ],
  "studyTips": "Mẹo nhận diện nhanh trong 5 giây ở phòng thi JLPT và 1 câu ví dụ ngắn dễ nhớ."
}`
      : `Bạn là Giáo sư Ngôn ngữ học tiếng Nhật. Hãy phân tích chuyên sâu mục kiến thức trong Sổ tay cá nhân sau đây:
- Loại: ${item.itemType} (Cấp độ ${item.level || 'N3'})
- Mục từ / Cấu trúc: ${stripHtml(item.title)}
- Cách đọc: ${item.reading || ''}
- Ý nghĩa: ${stripHtml(item.meaningVi)}
- Câu ví dụ: ${stripHtml(item.exampleJp || '')} (${stripHtml(item.exampleVi || '')})

Trả về đúng định dạng JSON sau (tiếng Việt chuẩn):
{
  "completedSentence": "Câu ví dụ chuẩn JLPT ứng dụng trực tiếp mục từ/cấu trúc này kèm cách đọc Hiragana và dịch nghĩa",
  "grammarFormula": "Công thức kết hợp (Cách chia + Mẫu câu) hoặc Từ loại + Hán tự cốt lõi",
  "explanation": "Giải thích sâu sắc thái ý nghĩa, ngữ cảnh sử dụng (văn nói/văn viết, trang trọng/thân mật).",
  "trapAnalysis": "Phân biệt với các từ/cấu trúc dễ nhầm lẫn tương tự trong đề thi JLPT.",
  "optionBreakdowns": [],
  "studyTips": "Mẹo ghi nhớ nhanh (Mnemonic) và lưu ý bẫy thường gặp trong đề thi."
}`;

    const aiRes = await GeminiPoolService.generateContent(
      process.env.GEMINI_MODEL || 'gemini-flash-latest',
      prompt,
      {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    );

    const rawText = aiRes.response.text().trim();
    const cleanJson = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
    const parsed = JSON.parse(cleanJson);

    const updatedMeta = {
      ...metaData,
      aiDetailed: {
        completedSentence: parsed.completedSentence || '',
        grammarFormula: parsed.grammarFormula || '',
        explanation: parsed.explanation || '',
        trapAnalysis: parsed.trapAnalysis || '',
        optionBreakdowns: Array.isArray(parsed.optionBreakdowns) ? parsed.optionBreakdowns : [],
        studyTips: parsed.studyTips || '',
        analyzedAt: new Date().toISOString()
      }
    };

    const newNote = `${cleanNoteText}\n<!-- META: ${JSON.stringify(updatedMeta)} -->`;
    const newStructure = parsed.grammarFormula || item.structure;

    await RedisService.delPrefix(`notebook:v3:${userId}:`);
    return await prisma.notebookItem.update({
      where: { id },
      data: {
        note: newNote,
        structure: newStructure
      }
    });
  }
}
