import { prisma } from '../../core/prisma.service';
import { DictionaryApiService } from './dictionary-api.service';
import { ConstituentKanji, VocabularyDetailResult, SearchVocabParams, getDefaultCurriculumTitle } from './vocabulary.types';
import { RedisService } from '../../core/redis.service';

export * from './vocabulary.types';

function isJapaneseKanji(char: string): boolean {
  if (!char || char.trim().length === 0) return false;
  const code = char.charCodeAt(0);
  return (code >= 0x4e00 && code <= 0x9faf) || (code >= 0x3400 && code <= 0x4dbf);
}

function normalizeStr(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();
}

export class VocabularyService {
  /**
   * Đề xuất từ vựng tức thì khi gõ từ khóa (giúp phân biệt từ đồng âm, đồng tự khác nghĩa)
   */
  static async autocomplete(query: string, limit = 8) {
    if (!query || !query.trim()) return [];
    const q = query.trim();
    const qNorm = normalizeStr(q);

    const cacheKey = `vocab:auto:${qNorm}:${limit}`;
    const { data } = await RedisService.getOrSet(
      cacheKey,
      () => prisma.vocabulary.findMany({
        where: {
          OR: [
            { word: { startsWith: q } },
            { reading: { startsWith: q } },
            { romaji: { startsWith: q.toLowerCase() } },
            { hanViet: { startsWith: qNorm.toUpperCase() } },
            { meaningVi: { contains: qNorm } }
          ]
        },
        take: limit,
        select: {
          id: true,
          word: true,
          reading: true,
          hanViet: true,
          meaningVi: true,
          jlptLevel: true,
          curriculum: true,
          pitchAccent: true
        }
      }),
      1800 // 30 phút
    );

    return data;
  }

  /**
   * Thống kê số lượng từ vựng theo khóa học và cấp độ (Redis Cached < 1ms)
   */
  static async getCourseStats(): Promise<Record<string, number>> {
    const cacheKey = 'vocab:stats:all';
    const { data } = await RedisService.getOrSet(
      cacheKey,
      async () => {
        try {
          const groups = await prisma.vocabulary.groupBy({
            by: ['curriculum', 'jlptLevel'],
            _count: { id: true }
          });

          const stats: Record<string, number> = {};
          for (const g of groups) {
            stats[`${g.curriculum}_${g.jlptLevel}`] = g._count.id;
          }
          return stats;
        } catch (dbErr) {
          console.warn('[VocabularyService] DB stats fallback:', dbErr);
          return {
            'MINNA_N5': 1000,
            'MINNA_N4': 1000,
            'TANGO_N5': 1000,
            'TANGO_N4': 1500,
            'TANGO_N3': 2000,
            'TANGO_N2': 2500,
            'TANGO_N1': 3000
          };
        }
      },
      3600 // 1 giờ
    );

    return data;
  }

  static async getCourseLevelStats(): Promise<Record<string, number>> {
    return this.getCourseStats();
  }

  /**
   * Lấy lộ trình các bài học của khóa học từ MySQL + Redis Cache (< 1ms)
   */
  static async getCurriculumsSummary(curriculum: string, level: string) {
    const curUpper = curriculum.toUpperCase();
    const lvlUpper = level.toUpperCase();
    const cacheKey = `vocab:curr:v2:${curUpper}:${lvlUpper}`;

    const { data } = await RedisService.getOrSet(
      cacheKey,
      async () => {
        try {
          const lessonGroups = await prisma.vocabulary.groupBy({
            by: ['lesson', 'lessonTitle', 'topic'],
            where: {
              curriculum: curUpper,
              jlptLevel: lvlUpper,
              lesson: { not: null }
            },
            _count: { id: true },
            orderBy: { lesson: 'asc' }
          });

          // DEDUPLICATE BY LESSON (Fix for messy DB)
          const mergedLessons: Record<number, any> = {};
          for (const g of lessonGroups) {
            const lnum = g.lesson as number;
            if (!mergedLessons[lnum]) {
              mergedLessons[lnum] = {
                lesson: lnum,
                title: g.lessonTitle || getDefaultCurriculumTitle(curUpper, lnum),
                topic: g.topic || 'Từ vựng trọng tâm',
                wordCount: 0
              };
            }
            mergedLessons[lnum].wordCount += g._count.id;
            // Prefer topics that are not generic
            if (g.topic && !g.topic.includes('Từ vựng trọng tâm') && mergedLessons[lnum].topic.includes('Từ vựng trọng tâm')) {
              mergedLessons[lnum].topic = g.topic;
              mergedLessons[lnum].title = g.lessonTitle || mergedLessons[lnum].title;
            }
          }
          const baseLessons = Object.values(mergedLessons).sort((a: any, b: any) => a.lesson - b.lesson);
          if (baseLessons.length === 0) return { curriculum: curUpper, level: lvlUpper, totalLessons: 0, themes: [], lessons: [] };
          const lessons = [];
const chunks = [];
let currentChunk = [];
for (let i = 0; i < baseLessons.length; i++) {
const prevLesson = i > 0 ? baseLessons[i - 1] : null;
if (curUpper === 'TANGO') {
  // Fix Tango chapter numbers: force the chapter number to match the actual lesson number
  baseLessons[i].title = baseLessons[i].title.replace(/Chương \d+(\.\d+)?/, `Chương ${baseLessons[i].lesson}`);
} else if (prevLesson && baseLessons[i].title === prevLesson.title) {
  baseLessons[i].title = baseLessons[i].title + ' (Phần 2)';
}
  currentChunk.push(baseLessons[i]);
  if (currentChunk.length === 3) {
    chunks.push(currentChunk);
    currentChunk = [];
  }
}
if (currentChunk.length > 0) {
  if (chunks.length > 0 && currentChunk.length < 3) {
    chunks[chunks.length - 1].push(...currentChunk);
  } else {
    chunks.push(currentChunk);
  }
}
let reviewBatch = 1;
for (const chunk of chunks) {
  let totalCount = 0;
  for (const l of chunk) {
    lessons.push(l);
    totalCount += l.wordCount;
  }
  const startL = chunk[0].lesson;
  const endL = chunk[chunk.length - 1].lesson;
  const titleLabel = startL === endL ? 'Bài ' + startL : 'Bài ' + startL + ' - ' + endL;
  lessons.push({
    lesson: 9000 + reviewBatch,
    isReview: true,
    title: '🌟 ÔN TẬP TỔNG HỢP (' + titleLabel + ')',
    topic: 'Kiểm tra tổng hợp kiến thức định kỳ',
    wordCount: totalCount,
    reviewMin: startL,
    reviewMax: endL
  });
  reviewBatch++;
}
lessons.push({


               lesson: 9999,
             isReview: true,
             isFinal: true,
             title: '🎓 KIỂM TRA CUỐI KHÓA (' + lvlUpper + ')',
             topic: 'Bài kiểm tra đánh giá toàn diện',
             wordCount: baseLessons.reduce((acc, l) => acc + l.wordCount, 0)
          });

          let themes = [];
          if (curUpper === 'MINNA' && lvlUpper === 'N5') {
            themes = [
              {
                id: 'theme-1',
                title: 'Giai đoạn 1: Chào hỏi & Giao tiếp căn bản (Bài 1 - 10)',
                themeTitle: 'Giai đoạn 1: Chào hỏi & Giao tiếp căn bản (Bài 1 - 10)',
                totalLessons: lessons.filter((l: any) => l.lesson >= 1 && l.lesson <= 10).length,
                lessons: lessons.filter((l: any) => l.lesson >= 1 && l.lesson <= 10)
              },
              {
                id: 'theme-2',
                title: 'Giai đoạn 2: Động từ, Đi lại & Thời gian (Bài 11 - 20)',
                themeTitle: 'Giai đoạn 2: Động từ, Đi lại & Thời gian (Bài 11 - 20)',
                totalLessons: lessons.filter((l: any) => l.lesson >= 11 && l.lesson <= 20).length,
                lessons: lessons.filter((l: any) => l.lesson >= 11 && l.lesson <= 20)
              },
              {
                id: 'theme-3',
                title: 'Giai đoạn 3: Thể thông thường, Nguyện vọng & Điều kiện (Bài 21 - 25)',
                themeTitle: 'Giai đoạn 3: Thể thông thường, Nguyện vọng & Điều kiện (Bài 21 - 25)',
                totalLessons: lessons.filter((l: any) => l.lesson >= 21 && l.lesson <= 25).length,
                lessons: lessons.filter((l: any) => l.lesson >= 21 && l.lesson <= 25)
              }
            ].filter(t => t.lessons.length > 0);
          } else if (curUpper === 'MINNA' && lvlUpper === 'N4') {
            themes = [
              {
                id: 'theme-1',
                title: 'Giai đoạn 1: Khả năng, Trạng thái & Ý định (Bài 26 - 35)',
                themeTitle: 'Giai đoạn 1: Khả năng, Trạng thái & Ý định (Bài 26 - 35)',
                totalLessons: lessons.filter((l: any) => l.lesson >= 26 && l.lesson <= 35).length,
                lessons: lessons.filter((l: any) => l.lesson >= 26 && l.lesson <= 35)
              },
              {
                id: 'theme-2',
                title: 'Giai đoạn 2: Điều kiện, Bị động & Sai khiến (Bài 36 - 45)',
                themeTitle: 'Giai đoạn 2: Điều kiện, Bị động & Sai khiến (Bài 36 - 45)',
                totalLessons: lessons.filter((l: any) => l.lesson >= 36 && l.lesson <= 45).length,
                lessons: lessons.filter((l: any) => l.lesson >= 36 && l.lesson <= 45)
              },
              {
                id: 'theme-3',
                title: 'Giai đoạn 3: Phỏng đoán & Kính ngữ - Khiêm nhường (Bài 46 - 50)',
                themeTitle: 'Giai đoạn 3: Phỏng đoán & Kính ngữ - Khiêm nhường (Bài 46 - 50)',
                totalLessons: lessons.filter((l: any) => l.lesson >= 46 && l.lesson <= 50).length,
                lessons: lessons.filter((l: any) => l.lesson >= 46 && l.lesson <= 50)
              }
            ].filter(t => t.lessons.length > 0);
          } else {
            themes = [
              {
                id: 'theme-1',
                title: `Lộ trình ${curUpper} - ${lvlUpper}`,
                themeTitle: `Lộ trình ${curUpper} - ${lvlUpper}`,
                totalLessons: lessons.length,
                lessons
              }
            ];
          }

          return {
            curriculum: curUpper,
            level: lvlUpper,
            totalLessons: lessons.length,
            themes,
            lessons
          };
        } catch (dbErr) {
          console.warn('[VocabularyService] DB curriculums fallback:', dbErr);
          const defaultLessons = Array.from({ length: 25 }, (_, i) => ({
            lesson: i + 1,
            title: getDefaultCurriculumTitle(curUpper, i + 1),
            topic: 'Từ vựng bài ' + (i + 1),
            wordCount: 40
          }));
          return {
            curriculum: curUpper,
            level: lvlUpper,
            totalLessons: 25,
            themes: [
              {
                id: 'theme-1',
                title: `Lộ trình ${curUpper} - ${lvlUpper}`,
                themeTitle: `Lộ trình ${curUpper} - ${lvlUpper}`,
                totalLessons: defaultLessons.length,
                lessons: defaultLessons
              }
            ],
            lessons: defaultLessons
          };
        }
      },
      86400 // 24 giờ
    );

    return data;
  }

  static async getCurriculums(curriculum: string, level: string) {
    return this.getCurriculumsSummary(curriculum, level);
  }

  /**
   * Lấy danh sách từ vựng của 1 bài học kèm Hán tự cấu thành từ MySQL + Redis Cache (< 1ms)
   */
  static async getLessonWords(curriculum: string, level: string, lesson: number) {
    const curUpper = curriculum.toUpperCase();
    const lvlUpper = level.toUpperCase();
    const cacheKey = `vocab:words:v2:${curUpper}:${lvlUpper}:${lesson}`;

    const { data } = await RedisService.getOrSet(
      cacheKey,
      async () => {
        let whereClause: any = {
          curriculum: curUpper,
          jlptLevel: lvlUpper
        };
        
        let lessonTitle = '';
        let themeTopic = '';

        if (lesson > 9000) {
             if (lesson === 9999) {
               lessonTitle = `🎓 KIỂM TRA CUỐI KHÓA (${lvlUpper})`;
               themeTopic = 'Bài kiểm tra đánh giá toàn diện';
             } else {
               const summary = await this.getCurriculumsSummary(curriculum, level);
               const reviewNode: any = summary.lessons.find((l: any) => l.lesson === lesson);
               if (reviewNode && reviewNode.reviewMin && reviewNode.reviewMax) {
                   whereClause.lesson = { gte: reviewNode.reviewMin, lte: reviewNode.reviewMax };
                   lessonTitle = reviewNode.title;
                   themeTopic = reviewNode.topic;
               } else {
                   const batch = lesson - 9000;
                   const startCh = (batch - 1) * 3 + 1;
                   const endCh = batch * 3;
                   whereClause.lesson = { gte: startCh, lte: endCh };
                   lessonTitle = `🌟 ÔN TẬP TỔNG HỢP (Bài ${startCh} - ${endCh})`;
                   themeTopic = 'Kiểm tra tổng hợp kiến thức định kỳ';
               }
             }
        } else {
           whereClause.lesson = Number(lesson);
        }

        const words = await prisma.vocabulary.findMany({
          where: whereClause,
          orderBy: { word: 'asc' }
        });

        const enrichedWords = await Promise.all(
          words.map(async (w) => {
            const constituentKanjis = await this.extractConstituentKanjis(w.word);
            return {
              ...w,
              constituentKanjis
            };
          })
        );

        const firstWord = words[0];
        if (lesson <= 9000) {
          lessonTitle = firstWord?.lessonTitle || getDefaultCurriculumTitle(curUpper, Number(lesson));
          themeTopic = firstWord?.topic || 'Từ vựng trọng tâm';
        }

        return {
          words: enrichedWords,
          lessonTitle,
          themeTopic,
          totalWords: enrichedWords.length
        };
      },
      86400 // 24 giờ
    );

    return data;
  }

  static async getCurriculumWords(curriculum: string, level: string, lesson: number) {
    return this.getLessonWords(curriculum, level, lesson);
  }

  /**
   * Danh sách bài học tổng quan
   */
  static async getLessonsSummary() {
    return this.getCurriculumsSummary('MINNA', 'N5');
  }

  /**
   * Từ vựng ngẫu nhiên hôm nay
   */
  static async getDailyVocab() {
    const cacheKey = 'vocab:daily:v2:today';
    const { data } = await RedisService.getOrSet(
      cacheKey,
      async () => {
        const count = await prisma.vocabulary.count();
        const skip = Math.max(0, Math.floor(Math.random() * Math.max(1, count - 5)));
        return prisma.vocabulary.findMany({
          skip,
          take: 5
        });
      },
      86400
    );
    return data;
  }

  /**
   * Tìm kiếm từ vựng nâng cao
   */
  static async searchVocabularies(params: SearchVocabParams) {
    const { query, level, lesson, partOfSpeech, page = 1, limit = 20 } = params;
    const cacheKey = `vocab:search:v2:${JSON.stringify(params)}`;
    const { data } = await RedisService.getOrSet(cacheKey, async () => {
      const skip = (page - 1) * limit;
      const where: any = {};
      if (query && query.trim()) {
        const q = query.trim();
        const qNorm = normalizeStr(q);
        where.OR = [
          { word: { contains: q } },
          { reading: { contains: q } },
          { romaji: { contains: q.toLowerCase() } },
          { hanViet: { contains: qNorm.toUpperCase() } },
          { meaningVi: { contains: qNorm } }
        ];
      }
      if (level) { where.jlptLevel = level.toUpperCase(); }
      if (lesson) { where.lesson = Number(lesson); }
      if (partOfSpeech) { where.partOfSpeech = partOfSpeech; }

      const [total, items] = await Promise.all([
        prisma.vocabulary.count({ where }),
        prisma.vocabulary.findMany({
          where,
          skip,
          take: limit,
          orderBy: [{ jlptLevel: "asc" }, { lesson: "asc" }]
        })
      ]);
      const enrichedItems = await Promise.all(
        items.map(async (item) => {
          const constituentKanjis = await this.extractConstituentKanjis(item.word);
          return { ...item, constituentKanjis };
        })
      );
      return { items: enrichedItems, total };
    }, 600);
    return data;
  }

  static async search(params: SearchVocabParams) {
    return this.searchVocabularies(params);
  }

  /**
   * Lấy chi tiết từ vựng theo ID kèm Hán tự cấu thành (Redis Cached)
   */
  static async getVocabularyDetail(id: string): Promise<VocabularyDetailResult | null> {
    const cacheKey = `vocab:detail:${id}`;
    const { data } = await RedisService.getOrSet(
      cacheKey,
      async () => {
        const vocab = await prisma.vocabulary.findUnique({ where: { id } });
        if (!vocab) return null;

        const constituentKanjis = await this.extractConstituentKanjis(vocab.word);

        return {
          ...vocab,
          constituentKanjis
        };
      },
      86400
    );

    return data;
  }

  static async getWordDetail(id: string): Promise<VocabularyDetailResult | null> {
    return this.getVocabularyDetail(id);
  }

  /**
   * Tra cứu từ vựng trực tiếp qua Jisho API nếu CSDL chưa có
   */
  static async lookupExternal(word: string): Promise<any[]> {
    const cleanWord = word.trim();
    if (!cleanWord) return [];

    const cacheKey = `vocab:external:${cleanWord}`;
    const { data } = await RedisService.getOrSet(
      cacheKey,
      () => DictionaryApiService.searchExternalJisho(cleanWord),
      86400
    );

    return data;
  }

  /**
   * Tự động trích xuất các chữ Hán cấu thành từ vựng và tra cứu nhanh nghĩa Hán Việt
   */
  private static async extractConstituentKanjis(word: string): Promise<ConstituentKanji[]> {
    const kanjiChars: string[] = [];
    for (const ch of word) {
      if (isJapaneseKanji(ch) && !kanjiChars.includes(ch)) {
        kanjiChars.push(ch);
      }
    }

    if (kanjiChars.length === 0) return [];

    const kanjiRecords = await prisma.kanji.findMany({
      where: { character: { in: kanjiChars } },
      select: {
        character: true,
        hanViet: true,
        meaningVi: true,
        strokeCount: true,
        jlptLevel: true
      }
    });

    const recordMap = new Map(kanjiRecords.map((k) => [k.character, k]));

    return kanjiChars.map((ch) => {
      const record = recordMap.get(ch);
      if (record) {
        return {
          character: record.character,
          hanViet: record.hanViet,
          meaningVi: record.meaningVi,
          strokeCount: record.strokeCount,
          jlptLevel: record.jlptLevel
        };
      }
      return {
        character: ch,
        hanViet: 'HÁN TỰ',
        meaningVi: 'Chữ Hán cấu thành',
        strokeCount: 5,
        jlptLevel: 'N3'
      };
    });
  }
}

