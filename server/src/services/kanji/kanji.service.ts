import axios from 'axios';
import { prisma } from '../../core/prisma.service';
import { KanjiDetail, MinaVocabulary, LookalikeKanji, KanjiQuizQuestion } from './kanji.types';
import { RedisService } from '../../core/redis.service';

export * from './kanji.types';

function isJapaneseKanji(char: string): boolean {
  if (!char || char.trim().length !== 1) return false;
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

export class KanjiService {
  /**
   * Nhận diện nét vẽ tay qua Google Input Tools API
   */
  static async recognizeHandwriting(strokes: number[][][]): Promise<string[]> {
    try {
      if (!strokes || strokes.length === 0) return [];

      const payload = {
        app_version: 0.4,
        api_level: '533.0.0',
        device: '5.0 (Windows NT 10.0; Win64; x64)',
        input_type: '0',
        options: 'enable_pre_space',
        requests: [
          {
            writing_guide: { writing_area_width: 300, writing_area_height: 300 },
            pre_context: '',
            max_num_results: 10,
            max_completions: 0,
            language: 'ja_t_i0_handwrit',
            ink: strokes
          }
        ]
      };

      const response = await axios.post(
        'https://inputtools.google.com/request?itc=ja-t-i0-handwrit&app=demopage',
        payload,
        { headers: { 'Content-Type': 'application/json' }, timeout: 4000 }
      );

      if (response.data && response.data[0] === 'SUCCESS') {
        const results = response.data[1][0][1];
        return (results || []).filter((c: string) => isJapaneseKanji(c));
      }
      return [];
    } catch (error) {
      console.error('Error calling Google Input Tools API:', error);
      return ['木', '土', '火', '水'];
    }
  }

  /**
   * Tự động tải vector nét vẽ SVG và bộ thủ cấu thành từ KanjiVG nếu chưa có trong CSDL
   */
  static async fetchKanjiVGData(character: string): Promise<{ strokes: string[]; radicals: { symbol: string; name: string }[] }> {
    if (!isJapaneseKanji(character)) return { strokes: [], radicals: [] };
    try {
      const hex = character.charCodeAt(0).toString(16).padStart(5, '0');
      const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`;
      const res = await axios.get(url, { timeout: 3000 });

      const strokeRegex = /d="([^"]+)"/g;
      const strokes: string[] = [];
      let sMatch;
      while ((sMatch = strokeRegex.exec(res.data)) !== null) {
        if (sMatch[1].startsWith('M') || sMatch[1].startsWith('m')) {
          strokes.push(sMatch[1]);
        }
      }

      const elemRegex = /kvg:element="([^"]+)"/g;
      const constituentChars: string[] = [];
      let eMatch;
      while ((eMatch = elemRegex.exec(res.data)) !== null) {
        const elem = eMatch[1];
        if (elem !== character && !constituentChars.includes(elem) && elem.length === 1) {
          constituentChars.push(elem);
        }
      }

      const radicals: { symbol: string; name: string }[] = constituentChars.slice(0, 2).map((sym) => ({
        symbol: sym,
        name: `Bộ ${sym}`
      }));

      if (radicals.length === 0) {
        radicals.push({ symbol: character, name: `Bộ ${character} (Đơn lập)` });
      }

      return { strokes, radicals };
    } catch (e) {
      return { strokes: [], radicals: [] };
    }
  }

  /**
   * Tìm kiếm Hán tự qua Redis Cache + CSDL MySQL (Hơn 2.138 chữ Hán)
   */
  static async searchKanjis(query: string): Promise<KanjiDetail[]> {
    if (!query || !query.trim()) {
      const all = await this.getAllKanjisFromDb();
      return all.slice(0, 50);
    }

    const qNorm = normalizeStr(query);
    const cacheKey = `kanji:search:${qNorm}`;

    const { data } = await RedisService.getOrSet(
      cacheKey,
      async () => {
        const all = await this.getAllKanjisFromDb();
        const qRaw = query.trim().toLowerCase();

        return all.filter((k) => {
          if (k.character === qRaw || k.character.includes(qRaw)) return true;
          if (normalizeStr(k.hanViet).includes(qNorm)) return true;
          if (normalizeStr(k.meaningVi).includes(qNorm)) return true;
          if (k.kunyomi.toLowerCase().includes(qRaw) || k.onyomi.toLowerCase().includes(qRaw)) return true;
          return false;
        }).slice(0, 40);
      },
      3600 // Cache 1 giờ
    );

    return data;
  }

  /**
   * Lấy chi tiết 1 chữ Hán với Redis Cache (< 1ms) + MySQL
   */
  static async getKanjiDetails(character: string): Promise<KanjiDetail | null> {
    const cleanChar = character.trim();
    if (!isJapaneseKanji(cleanChar)) {
      return null;
    }

    const cacheKey = `kanji:detail:${cleanChar}`;
    const { data } = await RedisService.getOrSet(
      cacheKey,
      async () => this.computeKanjiDetails(cleanChar),
      86400 // Cache 24 giờ
    );

    return data;
  }

  private static async computeKanjiDetails(cleanChar: string): Promise<KanjiDetail | null> {
    let dbKanji = await prisma.kanji.findUnique({ where: { character: cleanChar } });

    // Nếu chưa có trong DB, nạp động từ KanjiVG vào MySQL
    if (!dbKanji) {
      const { strokes, radicals } = await this.fetchKanjiVGData(cleanChar);
      if (strokes.length > 0) {
        try {
          dbKanji = await prisma.kanji.create({
            data: {
              character: cleanChar,
              hanViet: 'HÁN TỰ',
              strokeCount: strokes.length,
              jlptLevel: 'N3',
              onyomi: '—',
              kunyomi: '—',
              meaningVi: `Chữ Hán ${cleanChar}`,
              radicals: JSON.stringify(radicals),
              svgPathData: JSON.stringify(strokes),
              mnemonicAi: `Chữ ${cleanChar} gồm ${strokes.length} nét vẽ theo chuẩn KanjiVG.`
            }
          });
        } catch (err) {}
      }
    }

    if (!dbKanji) return null;

    // 1. Phân giải Bộ thủ
    let radicals: { symbol: string; name: string }[] = [];
    try {
      radicals = JSON.parse(dbKanji.radicals || '[]');
    } catch (e) {
      radicals = [];
    }

    if (radicals.length === 0) {
      const fetched = await this.fetchKanjiVGData(cleanChar);
      radicals = fetched.radicals;
    }

    // 2. Phân giải Nét vẽ
    let svgStrokes: string[] = [];
    try {
      svgStrokes = JSON.parse(dbKanji.svgPathData || '[]');
    } catch (e) {
      svgStrokes = [];
    }

    if (svgStrokes.length === 0) {
      const fetched = await this.fetchKanjiVGData(cleanChar);
      svgStrokes = fetched.strokes;
      if (svgStrokes.length > 0) {
        await prisma.kanji.update({
          where: { character: cleanChar },
          data: { svgPathData: JSON.stringify(svgStrokes) }
        }).catch(() => {});
      }
    }

    // 3. TRUY VẤN TỪ VỰNG CHỨA CHỮ HÁN TRỰC TIẾP TỪ BẢNG VOCABULARY TRONG MYSQL
    const relatedVocabs = await prisma.vocabulary.findMany({
      where: { word: { contains: cleanChar } },
      take: 10,
      orderBy: [{ jlptLevel: 'asc' }, { lesson: 'asc' }]
    });

    // Phân tích exampleWords lưu trong CSDL
    let parsedExamples: any[] = [];
    try {
      parsedExamples = JSON.parse(dbKanji.exampleWords || '[]');
    } catch (e) {
      parsedExamples = [];
    }

    // Kết hợp từ vựng liên quan (từ bảng Vocabulary và exampleWords)
    const combinedMap = new Map<string, any>();

    // 1. Nạp từ vựng chất lượng cao từ bảng Vocabulary (có câu ví dụ tiếng Nhật và tiếng Việt)
    for (const v of relatedVocabs) {
      combinedMap.set(v.word, {
        word: v.word,
        reading: v.reading,
        pitchAccent: v.pitchAccent || `[${v.reading}]`,
        hanViet: v.hanViet || dbKanji.hanViet,
        meaningVi: v.meaningVi,
        meaning: v.meaningVi,
        source: `${v.curriculum} Bài ${v.lesson || ''}`.trim(),
        exampleJp: v.exampleJp || undefined,
        exampleVi: v.exampleVi || undefined
      });
    }

    // 2. Bổ sung từ parsedExamples nếu chưa có
    for (const ex of parsedExamples) {
      if (ex.word && !combinedMap.has(ex.word)) {
        combinedMap.set(ex.word, {
          word: ex.word,
          reading: ex.reading,
          pitchAccent: ex.pitchAccent || `[${ex.reading}]`,
          hanViet: ex.hanViet || dbKanji.hanViet,
          meaningVi: ex.meaningVi || ex.meaning || dbKanji.meaningVi,
          meaning: ex.meaningVi || ex.meaning || dbKanji.meaningVi,
          source: dbKanji.curriculum || dbKanji.jlptLevel,
          exampleJp: ex.exampleJp || undefined,
          exampleVi: ex.exampleVi || undefined
        });
      }
    }

    // 3. Nếu vẫn chưa có từ vựng nào, tạo ví dụ mẫu mặc định
    if (combinedMap.size === 0) {
      const defaultReading = dbKanji.onyomi !== '—' ? dbKanji.onyomi.split(',')[0].trim() : dbKanji.kunyomi.split(',')[0].trim();
      combinedMap.set(cleanChar, {
        word: cleanChar,
        reading: defaultReading,
        pitchAccent: `[${defaultReading}]`,
        hanViet: dbKanji.hanViet,
        meaningVi: dbKanji.meaningVi,
        meaning: dbKanji.meaningVi,
        source: `${dbKanji.jlptLevel}`
      });
    }

    const finalVocabList = Array.from(combinedMap.values()).slice(0, 8);
    const minaVocabularies: MinaVocabulary[] = finalVocabList;

    // 4. TRUY VẤN CHỮ TƯƠNG ĐỒNG TRỰC TIẾP TỪ MYSQL (DATABASE-DRIVEN)
    const similarCandidates = await prisma.kanji.findMany({
      where: {
        character: { not: cleanChar },
        strokeCount: { in: [dbKanji.strokeCount - 1, dbKanji.strokeCount, dbKanji.strokeCount + 1] }
      },
      take: 3,
      select: {
        character: true,
        hanViet: true,
        meaningVi: true,
        strokeCount: true
      }
    });

    const lookalikes: LookalikeKanji[] = similarCandidates.map((cand) => ({
      character: cand.character,
      hanViet: cand.hanViet,
      meaningVi: cand.meaningVi,
      radicalDiff: `Cùng nhóm nét vẽ (${cleanChar}: ${dbKanji!.strokeCount} nét vs ${cand.character}: ${cand.strokeCount} nét)`,
      mnemonicTip: `So sánh ${cleanChar} (${dbKanji!.hanViet}) và ${cand.character} (${cand.hanViet}) để tránh nhầm lẫn khi làm bài thi.`
    }));

    // Trích xuất tiêu đề bài học sạch sẽ không bị lẫn JSON
    let cleanLessonTitle = dbKanji.lessonTitle || undefined;
    let cleanLesson = dbKanji.lesson || undefined;
    if (cleanLessonTitle && cleanLessonTitle.startsWith('{')) {
      try {
        const parsed = JSON.parse(cleanLessonTitle);
        const curKey = dbKanji.curriculum ? dbKanji.curriculum.split(',')[0].trim().toUpperCase() : '';
        if (curKey && parsed[curKey]) {
          cleanLesson = parsed[curKey].lesson || cleanLesson;
          cleanLessonTitle = parsed[curKey].title || `Bài ${cleanLesson}`;
        } else {
          const firstVal = Object.values(parsed)[0] as any;
          if (firstVal) {
            cleanLesson = firstVal.lesson || cleanLesson;
            cleanLessonTitle = firstVal.title || `Bài ${cleanLesson}`;
          }
        }
      } catch (e) {}
    }

    return {
      character: dbKanji.character,
      hanViet: dbKanji.hanViet,
      meaningVi: dbKanji.meaningVi,
      jlptLevel: dbKanji.jlptLevel,
      levelTag: dbKanji.levelTag || dbKanji.jlptLevel,
      curriculum: dbKanji.curriculum || undefined,
      lesson: cleanLesson,
      lessonTitle: cleanLessonTitle,
      strokeCount: dbKanji.strokeCount,
      kunyomi: dbKanji.kunyomi,
      onyomi: dbKanji.onyomi,
      radicals,
      mnemonic: dbKanji.lookAndLearnTip || dbKanji.mnemonicAi || `Chữ ${dbKanji.character} (${dbKanji.hanViet}) mang ý nghĩa: ${dbKanji.meaningVi}.`,
      lookAndLearnTip: dbKanji.lookAndLearnTip || undefined,
      phoneticRule: dbKanji.phoneticRule || undefined,
      exampleWords: finalVocabList,
      svgStrokes: svgStrokes.length > 0 ? svgStrokes : this.generateApproximatedStrokes(dbKanji.strokeCount),
      minaVocabularies,
      compoundsTree: {
        onyomiCompounds: minaVocabularies.map((v) => ({
          word: v.word,
          reading: v.reading,
          meaning: v.meaning,
          jlpt: dbKanji?.jlptLevel,
          pitchAccent: v.pitchAccent
        })),
        kunyomiCompounds: []
      },
      lookalikes
    };
  }

  /**
   * Lấy danh sách Kanji theo cấp độ với Redis Caching (< 1ms)
   */
  static async getKanjisByLevel(level: string): Promise<KanjiDetail[]> {
    const cleanLevel = (level || 'all').toLowerCase();
    const cacheKey = `kanji:level:${cleanLevel}`;

    const { data } = await RedisService.getOrSet(
      cacheKey,
      async () => {
        const all = await this.getAllKanjisFromDb();
        if (!level || level === 'all' || level === 'Tất cả') return all;
        return all.filter((k) => k.jlptLevel.toUpperCase() === level.toUpperCase());
      },
      86400 // Cache 24 giờ
    );

    return data;
  }

  /**
   * Lấy danh mục metadata các giáo trình Kanji tiêu chuẩn
   */
  static getCurriculumsMetadata() {
    return [
      {
        id: 'LOOK_AND_LEARN',
        name: 'Kanji Look and Learn (N5 - N4)',
        description: '512 chữ Hán kèm câu chuyện liên tưởng và mẹo nhớ trực quan dễ hiểu',
        levels: ['N5', 'N4'],
        icon: 'sparkles',
        tag: 'Hình ảnh & Mẹo nhớ'
      },
      {
        id: 'BASIC_KANJI',
        name: 'Basic Kanji Book (N5 - N4)',
        description: 'Giáo trình kinh điển bài bản của các trường Nhật ngữ, bám sát bài học thực tế',
        levels: ['N5', 'N4'],
        icon: 'book-open',
        tag: 'Kinh điển Nhật ngữ'
      },
      {
        id: 'SOUMATOME_N3',
        name: 'Nihongo Soumatome N3',
        description: 'Phân nhóm Kanji theo ngữ cảnh đời sống 6 tuần chuẩn thi JLPT N3',
        levels: ['N3'],
        icon: 'academic-cap',
        tag: 'Soumatome N3'
      },
      {
        id: 'SOUMATOME_N2',
        name: 'Nihongo Soumatome N2',
        description: 'Chữ Hán chủ đề xã hội, kinh tế, tuyển dụng theo 8 tuần chuẩn thi JLPT N2',
        levels: ['N2'],
        icon: 'academic-cap',
        tag: 'Soumatome N2'
      },
      {
        id: '500_MON_N2',
        name: '500 Câu Hỏi Kanji N2 (500 Mon)',
        description: 'Luyện đề cấp tốc, bẫy trọng âm On/Kun và các chữ Hán tương đồng dễ nhầm lẫn N2',
        levels: ['N2'],
        icon: 'fire',
        tag: '500 Mon N2'
      },
      {
        id: '500_MON_N1',
        name: '500 Câu Hỏi Hán Tự N1 (500 Mon)',
        description: 'Kho Hán tự cao cấp, thuật ngữ chính trị, kinh tế vĩ mô và bẫy đề thi N1',
        levels: ['N1'],
        icon: 'fire',
        tag: '500 Mon N1'
      }
    ];
  }

  /**
   * Helper trích xuất bài học và tiêu đề theo đúng giáo trình được chọn
   */
  private static extractCurriculumLesson(dbKanji: { lesson?: number | null; lessonTitle?: string | null }, curUpper: string): { lesson: number; title: string } {
    if (dbKanji.lessonTitle && dbKanji.lessonTitle.startsWith('{')) {
      try {
        const parsed = JSON.parse(dbKanji.lessonTitle);
        if (parsed[curUpper]) {
          return {
            lesson: parsed[curUpper].lesson || 1,
            title: parsed[curUpper].title || `Bài ${parsed[curUpper].lesson || 1}`
          };
        }
        // Nếu không có curUpper chính xác, lấy key đầu tiên
        const firstKey = Object.keys(parsed)[0];
        if (firstKey && parsed[firstKey]) {
          return {
            lesson: parsed[firstKey].lesson || 1,
            title: parsed[firstKey].title || `Bài ${parsed[firstKey].lesson || 1}`
          };
        }
      } catch (e) {}
    }
    return {
      lesson: dbKanji.lesson || 1,
      title: dbKanji.lessonTitle || `Bài ${dbKanji.lesson || 1}`
    };
  }

  /**
   * Lấy tóm tắt lộ trình bài học theo Giáo trình & Cấp độ
   */
  static async getCurriculumsSummary(curriculum: string, level: string) {
    const curUpper = curriculum.toUpperCase();
    const lvlUpper = level.toUpperCase();
    const cacheKey = `kanji:curriculums:${curUpper}:${lvlUpper}`;

    const { data } = await RedisService.getOrSet(
      cacheKey,
      async () => {
        const kanjis = await prisma.kanji.findMany({
          where: {
            curriculum: { contains: curUpper },
            jlptLevel: lvlUpper
          },
          select: {
            id: true,
            character: true,
            hanViet: true,
            meaningVi: true,
            lesson: true,
            lessonTitle: true
          },
          orderBy: [{ lesson: 'asc' }, { character: 'asc' }]
        });

        // Nhóm theo lesson của giáo trình hiện tại
        const lessonMap = new Map<number, { lesson: number; title: string; kanjis: any[] }>();
        for (const k of kanjis) {
          const { lesson: lNum, title: lTitle } = this.extractCurriculumLesson(k, curUpper);
          if (!lessonMap.has(lNum)) {
            lessonMap.set(lNum, {
              lesson: lNum,
              title: lTitle,
              kanjis: []
            });
          }
          lessonMap.get(lNum)!.kanjis.push({
            id: k.id,
            character: k.character,
            hanViet: k.hanViet,
            meaningVi: k.meaningVi,
            lesson: lNum,
            lessonTitle: lTitle
          });
        }

        const baseLessons = Array.from(lessonMap.values())
            .sort((a, b) => a.lesson - b.lesson)
            .map((l) => ({
              lesson: l.lesson,
              title: l.title,
              kanjis: l.kanjis,
              wordCount: l.kanjis.length
            }));
            
        if (baseLessons.length === 0) return { curriculum: curUpper, level: lvlUpper, totalLessons: 0, lessons: [] };
            
          const lessons = [];
const chunks = [];
let currentChunk = [];
for (let i = 0; i < baseLessons.length; i++) {
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
             kanjis: [],
             wordCount: baseLessons.reduce((acc, l) => acc + l.wordCount, 0)
          });

        return {
          curriculum: curUpper,
          level: lvlUpper,
          totalKanji: kanjis.length,
          totalLessons: lessons.length,
          lessons
        };
      },
      86400
    );

    return data;
  }

  /**
   * Lấy danh sách Kanji thuộc bài học của giáo trình
   */
  static async getCurriculumKanjis(curriculum: string, level: string, lesson?: number): Promise<KanjiDetail[]> {
    const curUpper = curriculum.toUpperCase();
    const lvlUpper = level.toUpperCase();
    const cacheKey = `kanji:curriculum-list:${curUpper}:${lvlUpper}:${lesson || 'all'}`;

    const { data } = await RedisService.getOrSet(
      cacheKey,
      async () => {
        const dbList = await prisma.kanji.findMany({
          where: {
            curriculum: { contains: curUpper },
            jlptLevel: lvlUpper
          },
          orderBy: [{ lesson: 'asc' }, { character: 'asc' }]
        });

        let reviewFilter = null;
          if (lesson && lesson > 9000) {
              if (lesson === 9999) {
                reviewFilter = { min: 1, max: 9999 };
              } else {
                 const summary = await this.getCurriculumsSummary(curriculum, level);
                 const reviewNode: any = summary.lessons.find((l: any) => l.lesson === lesson);
                 if (reviewNode && reviewNode.reviewMin && reviewNode.reviewMax) {
                     reviewFilter = { min: reviewNode.reviewMin, max: reviewNode.reviewMax };
                 } else {
                     const batch = lesson - 9000;
                     reviewFilter = { min: (batch - 1) * 3 + 1, max: batch * 3 };
                 }
              }
            }

          const result: KanjiDetail[] = [];
          for (const dbKanji of dbList) {
            const curInfo = this.extractCurriculumLesson(dbKanji, curUpper);
            if (lesson) {
              if (reviewFilter) {
                 if (curInfo.lesson < reviewFilter.min || curInfo.lesson > reviewFilter.max) continue;
              } else {
                 if (curInfo.lesson !== lesson) continue;
              }
            }
          const formatted = this.formatKanjiDetail(dbKanji, curUpper);
          formatted.lesson = curInfo.lesson;
          formatted.lessonTitle = curInfo.title;
          result.push(formatted);
        }

        return result.sort((a, b) => (a.lesson || 1) - (b.lesson || 1));
      },
      86400
    );

    return data;
  }

  /**
   * Sinh bộ câu hỏi trắc nghiệm kiểm tra Hán tự theo Level và Giáo trình (chuẩn đề thi JLPT)
   * Hỗ trợ các dạng: trắc nghiệm xuôi (kanji_to_reading), trắc nghiệm ngược (meaning_to_kanji), đúng/sai (true_false), nối từ ghép (matching), và hỗn hợp (ALL)
   */
  static async generateQuiz(
    level: string = 'N5',
    count: number = 10,
    curriculum?: string,
    questionType: string = 'ALL'
  ): Promise<KanjiQuizQuestion[]> {
    const lvlUpper = (level || 'ALL').toUpperCase();
    const curUpper = curriculum && curriculum !== 'ALL' ? curriculum.toUpperCase() : null;

    const whereClause: any = {};
    if (lvlUpper !== 'ALL') {
      whereClause.jlptLevel = lvlUpper;
    }
    if (curUpper) {
      // Hỗ trợ cả ID cụ thể (vd SOUMATOME_N3, 500_MON_N1) lẫn ID tổng quát
      const baseCur = curUpper.replace(/_N[1-5]$/, '');
      whereClause.curriculum = { contains: baseCur };
    }

    let kanjis = await prisma.kanji.findMany({
      where: whereClause
    });

    if (kanjis.length === 0) return [];

    const allKanjis = await prisma.kanji.findMany({
      where: lvlUpper !== 'ALL' ? { jlptLevel: lvlUpper } : undefined,
      select: { character: true, hanViet: true, meaningVi: true, onyomi: true, kunyomi: true }
    });

    // Thuật toán xáo trộn Fisher-Yates chuẩn xác (đảm bảo hoàn toàn ngẫu nhiên mỗi lần tạo đề)
    const pool = [...kanjis];
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      
      const selected = [];
      for (let i = 0; i < count; i++) {
        selected.push(pool[i % pool.length]);
      }

    const questions: KanjiQuizQuestion[] = [];
    const mode = (questionType || 'ALL').toLowerCase();

    for (let i = 0; i < selected.length; i++) {
      const k = selected[i];
      let chosenType = mode;

      if (mode === 'all') {
        // Phân bổ cân bằng giữa các dạng
        const types = ['kanji_to_reading', 'meaning_to_kanji', 'true_false', 'matching'];
        chosenType = types[i % types.length];
      }

      let q: KanjiQuizQuestion;

      if (chosenType === 'true_false') {
        // ================= DẠNG 1: ĐÚNG / SAI =================
        const isTrue = Math.random() > 0.5;
        if (isTrue) {
          q = {
            id: `quiz-tf-${i + 1}`,
            type: 'true_false',
            prompt: `Chữ Hán 【${k.character}】 có âm Hán Việt là "${k.hanViet}" và mang ý nghĩa "${k.meaningVi}". Điều này Đúng hay Sai?`,
            kanji: k.character,
            options: ['Đúng', 'Sai'],
            correctAnswer: 'Đúng',
            explanation: `Chính xác! Chữ 【${k.character}】 có âm Hán Việt là ${k.hanViet}, ý nghĩa: "${k.meaningVi}". Onyomi: [${k.onyomi}], Kunyomi: [${k.kunyomi}].`,
            hanViet: k.hanViet,
            level: k.jlptLevel
          };
        } else {
          const other = allKanjis.find((o) => o.character !== k.character && o.hanViet !== k.hanViet) || allKanjis[0];
          q = {
            id: `quiz-tf-${i + 1}`,
            type: 'true_false',
            prompt: `Chữ Hán 【${k.character}】 có âm Hán Việt là "${other.hanViet}" và mang ý nghĩa "${other.meaningVi}". Điều này Đúng hay Sai?`,
            kanji: k.character,
            options: ['Đúng', 'Sai'],
            correctAnswer: 'Sai',
            explanation: `Sai! Chữ 【${k.character}】 thực chất có âm Hán Việt là ${k.hanViet} ("${k.meaningVi}"). Còn "${other.hanViet}" là thông tin của chữ 【${other.character}】.`,
            hanViet: k.hanViet,
            level: k.jlptLevel
          };
        }
      } else if (chosenType === 'matching') {
        // ================= DẠNG 2: NỐI TỪ GHÉP / GHÉP CẶP =================
        const pairKanjis = [k];
        for (const candidate of pool) {
          if (pairKanjis.length >= 4) break;
          if (!pairKanjis.some((p) => p.character === candidate.character)) {
            pairKanjis.push(candidate);
          }
        }
        while (pairKanjis.length < 4 && allKanjis.length >= 4) {
          const rand = allKanjis[Math.floor(Math.random() * allKanjis.length)];
          if (!pairKanjis.some((p) => p.character === rand.character)) {
            pairKanjis.push(rand as any);
          }
        }

        const matchingPairs = pairKanjis.map((item, pIdx) => ({
          id: `pair-${pIdx + 1}`,
          kanji: item.character,
          matchText: `${item.hanViet} (${item.meaningVi})`,
          hanViet: item.hanViet,
          meaningVi: item.meaningVi
        }));

        q = {
          id: `quiz-match-${i + 1}`,
          type: 'matching',
          prompt: 'Nối các chữ Hán ở cột bên trái với âm Hán Việt & ý nghĩa tương ứng ở cột bên phải:',
          kanji: k.character,
          options: [],
          correctAnswer: 'Hoàn thành',
          explanation: `Các cặp ghép chuẩn xác: ${matchingPairs.map((p) => `【${p.kanji}】 ➔ ${p.matchText}`).join(' | ')}.`,
          hanViet: k.hanViet,
          level: k.jlptLevel,
          matchingPairs
        };
      } else if (chosenType === 'meaning_to_kanji') {
        // ================= DẠNG 3: TRẮC NGHIỆM NGƯỢC (Nghĩa/Hán Việt ➔ Kanji) =================
        const correctAnswer = k.character;
        const wrongPool = allKanjis.filter((o) => o.character !== correctAnswer).map((o) => o.character);
        const wrongShuffled = [...wrongPool].sort(() => 0.5 - Math.random()).slice(0, 3);
        const options = [...wrongShuffled, correctAnswer].sort(() => 0.5 - Math.random());

        q = {
          id: `quiz-rev-${i + 1}`,
          type: 'meaning_to_kanji',
          prompt: `Chữ Hán nào dưới đây mang âm Hán Việt [${k.hanViet}] và ý nghĩa "${k.meaningVi}"?`,
          kanji: k.character,
          options,
          correctAnswer,
          explanation: `[${k.hanViet}] ("${k.meaningVi}") tương ứng với chữ 【${k.character}】. ${k.lookAndLearnTip || k.mnemonicAi || ''}`,
          hanViet: k.hanViet,
          level: k.jlptLevel
        };
      } else {
        // ================= DẠNG 4: TRẮC NGHIỆM XUÔI (Kanji ➔ Nghĩa / Cách đọc) =================
        const isReadingQuestion = Math.random() > 0.5 && k.onyomi !== '—';
        if (isReadingQuestion) {
          const reading = k.kunyomi !== '—' ? k.kunyomi.split(',')[0].trim() : k.onyomi.split(',')[0].trim();
          const correctAnswer = reading;
          const wrongPool = allKanjis
            .map((o) => (o.kunyomi !== '—' ? o.kunyomi.split(',')[0].trim() : o.onyomi.split(',')[0].trim()))
            .filter((r) => r && r !== '—' && r !== correctAnswer);
          const wrongShuffled = [...wrongPool].sort(() => 0.5 - Math.random()).slice(0, 3);
          const options = [...wrongShuffled, correctAnswer].sort(() => 0.5 - Math.random());

          q = {
            id: `quiz-fwd-${i + 1}`,
            type: 'kanji_to_reading',
            prompt: `Cách đọc đúng của chữ Hán 【${k.character}】 (${k.hanViet}) là gì?`,
            kanji: k.character,
            options,
            correctAnswer,
            explanation: `Chữ 【${k.character}】 (${k.hanViet}): Onyomi là [${k.onyomi}], Kunyomi là [${k.kunyomi}]. Nghĩa: ${k.meaningVi}.`,
            hanViet: k.hanViet,
            level: k.jlptLevel
          };
        } else {
          const correctAnswer = `${k.hanViet} (${k.meaningVi})`;
          const wrongPool = allKanjis
            .filter((o) => o.character !== k.character && o.hanViet !== k.hanViet)
            .map((o) => `${o.hanViet} (${o.meaningVi})`);
          const wrongShuffled = [...wrongPool].sort(() => 0.5 - Math.random()).slice(0, 3);
          const options = [...wrongShuffled, correctAnswer].sort(() => 0.5 - Math.random());

          q = {
            id: `quiz-fwd-${i + 1}`,
            type: 'kanji_to_reading',
            prompt: `Chữ Hán 【${k.character}】 có âm Hán Việt và ý nghĩa là gì?`,
            kanji: k.character,
            options,
            correctAnswer,
            explanation: `Chữ 【${k.character}】 có âm Hán Việt là ${k.hanViet}, mang ý nghĩa: "${k.meaningVi}". ${k.lookAndLearnTip || ''}`,
            hanViet: k.hanViet,
            level: k.jlptLevel
          };
        }
      }

      questions.push(q);
    }

    return questions;
  }

  private static formatKanjiDetail(dbKanji: any, curUpper?: string): KanjiDetail {
    // Deduplicate hanViet and meaningVi to fix bad DB records
    if (dbKanji.meaningVi) {
        const parts = dbKanji.meaningVi.split(',').map((p: string) => p.trim()).filter(Boolean);
        dbKanji.meaningVi = Array.from(new Set(parts)).join(', ');
    }
    if (dbKanji.hanViet) {
        const parts = dbKanji.hanViet.split(' ').map((p: string) => p.trim()).filter(Boolean);
        dbKanji.hanViet = Array.from(new Set(parts)).join(' ');
    }
    const curLessonInfo = curUpper
      ? this.extractCurriculumLesson(dbKanji, curUpper)
      : this.extractCurriculumLesson(dbKanji, 'DEFAULT');

    let radicals: { symbol: string; name: string }[] = [];
    try {
      radicals = JSON.parse(dbKanji.radicals || '[]');
    } catch (e) {
      radicals = [{ symbol: dbKanji.character, name: 'Bộ thủ chính' }];
    }

    let svgStrokes: string[] = [];
    try {
      svgStrokes = JSON.parse(dbKanji.svgPathData || '[]');
    } catch (e) {
      svgStrokes = this.generateApproximatedStrokes(dbKanji.strokeCount);
    }

    let parsedExamples: any[] = [];
    try {
      parsedExamples = JSON.parse(dbKanji.exampleWords || '[]');
    } catch (e) {
      parsedExamples = [];
    }

    const minaVocabularies: MinaVocabulary[] = parsedExamples.map((ex: any) => ({
      word: ex.word,
      reading: ex.reading,
      pitchAccent: ex.pitchAccent || `[${ex.reading}]`,
      hanViet: ex.hanViet,
      meaning: ex.meaningVi,
      source: dbKanji.curriculum || dbKanji.jlptLevel
    }));

    return {
      character: dbKanji.character,
      hanViet: dbKanji.hanViet,
      meaningVi: dbKanji.meaningVi,
      jlptLevel: dbKanji.jlptLevel,
      levelTag: dbKanji.levelTag || dbKanji.jlptLevel,
      curriculum: dbKanji.curriculum || undefined,
      lesson: curLessonInfo.lesson,
      lessonTitle: curLessonInfo.title,
      strokeCount: dbKanji.strokeCount,
      kunyomi: dbKanji.kunyomi,
      onyomi: dbKanji.onyomi,
      radicals,
      mnemonic: dbKanji.lookAndLearnTip || dbKanji.mnemonicAi || '',
      lookAndLearnTip: dbKanji.lookAndLearnTip || undefined,
      phoneticRule: dbKanji.phoneticRule || undefined,
      exampleWords: parsedExamples,
      svgStrokes: svgStrokes.length > 0 ? svgStrokes : this.generateApproximatedStrokes(dbKanji.strokeCount),
      minaVocabularies,
      compoundsTree: {
        onyomiCompounds: minaVocabularies.map((v) => ({
          word: v.word,
          reading: v.reading,
          meaning: v.meaning,
          jlpt: dbKanji.jlptLevel,
          pitchAccent: v.pitchAccent
        })),
        kunyomiCompounds: []
      },
      lookalikes: []
    };
  }

  private static async getAllKanjisFromDb(): Promise<KanjiDetail[]> {
    const cacheKey = 'kanji:v2:all:db';
    const { data } = await RedisService.getOrSet(
      cacheKey,
      async () => {
        const dbList = await prisma.kanji.findMany({
          orderBy: [{ jlptLevel: 'asc' }, { strokeCount: 'asc' }]
        });

        return dbList.map((dbKanji) => this.formatKanjiDetail(dbKanji));
      },
      86400 // Cache 24 giờ
    );

    return data;
  }

  private static generateApproximatedStrokes(count: number): string[] {
    const strokes: string[] = [];
    for (let i = 0; i < count; i++) {
      const y = 20 + (60 / (count + 1)) * (i + 1);
      strokes.push(`M 20,${y} L 80,${y}`);
    }
    return strokes;
  }
}

