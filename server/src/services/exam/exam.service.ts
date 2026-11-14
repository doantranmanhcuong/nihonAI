import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiPoolService } from '../../core/ai-pool.service';
import { prisma } from '../../core/prisma.service';
import { RedisService } from '../../core/redis.service';
import {
  JLPTExam,
  JLPTLevel,
  ExamSubmissionPayload,
  ExamEvaluationResult,
  SectionScoreResult,
  ExamSectionType,
  ExamQuestionItem,
  ExamDiagnosticReport,
  ExamDiagnosticRequest,
  DiagnosticLessonLearned
} from './exam.types';

export const EXPRESS_DURATIONS: Record<string, number> = {
  N1: 55,
  N2: 50,
  N3: 45,
  N4: 40,
  N5: 35
};

export const FULL_DURATIONS: Record<string, number> = {
  N1: 170,
  N2: 155,
  N3: 140,
  N4: 115,
  N5: 105
};

/**
 * Lựa chọn đúng 34 câu hỏi tiêu biểu đại diện cho cả 4 phân môn và 16 Mondai
 * (Vocab: 10, Grammar: 8, Reading: 8, Listening: 8)
 */
export function pickExpressQuestions(questions: any[]): any[] {
  if (!questions || questions.length <= 34) return questions;

  const vocab = questions.filter((q) => q.section === 'vocab');
  const grammar = questions.filter((q) => q.section === 'grammar');
  const reading = questions.filter((q) => q.section === 'reading');
  const listening = questions.filter((q) => q.section === 'listening');

  const sample = (arr: any[], count: number) => {
    if (arr.length <= count) return arr;
    const step = arr.length / count;
    const res: any[] = [];
    for (let i = 0; i < count; i++) {
      const idx = Math.min(Math.floor(i * step), arr.length - 1);
      res.push(arr[idx]);
    }
    return res;
  };

  const selectedReading = sample(reading, Math.min(8, reading.length));
  const selectedListening = sample(listening, Math.min(8, listening.length));
  const remainingSlots = 34 - selectedReading.length - selectedListening.length;
  const vocabCount = Math.ceil(remainingSlots * 0.55);
  const grammarCount = remainingSlots - vocabCount;

  const selectedVocab = sample(vocab, vocabCount);
  const selectedGrammar = sample(grammar, grammarCount);

  const combined = [...selectedVocab, ...selectedGrammar, ...selectedReading, ...selectedListening];
  return combined.slice(0, 34).map((q, idx) => ({ ...q, orderNumber: idx + 1 }));
}

function stripRubyHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/<rt>.*?<\/rt>/g, '')
    .replace(/<rp>.*?<\/rp>/g, '')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/\*\*/g, '')
    .trim();
}

export function cleanBoldQuestionText(qText: string): string {
  if (!qText) return '';
  return qText.replace(/\*\*(.*?)\*\*/g, (_, p1) => {
    const pure = p1
      .replace(/<rt>[\s\S]*?<\/rt>/gi, '')
      .replace(/<rp>[\s\S]*?<\/rp>/gi, '')
      .replace(/<\/?(?:ruby|rp)>/gi, '')
      .trim();
    return `**${pure}**`;
  });
}

export function deduplicateRuntimeOptions(opts: string[], correctIdx: number): string[] {
  if (!Array.isArray(opts) || opts.length === 0) return opts;
  const seen = new Set<string>();
  const res: string[] = [...opts];
  for (let i = 0; i < res.length; i++) {
    const val = res[i];
    if (seen.has(val)) {
      const clean = val.replace(/<rt>[\s\S]*?<\/rt>/gi, '').replace(/<\/?ruby>/gi, '').trim();
      let replacement = clean;
      if (clean.endsWith('ます')) replacement = clean.slice(0, -2) + 'ました';
      else if (clean.endsWith('だ')) replacement = clean.slice(0, -1) + 'た';
      else if (clean.endsWith('い')) replacement = clean.slice(0, -1) + 'く';
      else if (clean.length >= 3) replacement = clean.slice(0, -2) + clean[clean.length - 1] + clean[clean.length - 2];
      else replacement = clean + 'い';
      if (seen.has(replacement)) replacement = clean + '・';
      res[i] = replacement;
    }
    seen.add(res[i]);
  }
  return res;
}

function extractKeyGrammar(q: any): string {
  const opts: string[] = Array.isArray(q.options) ? q.options : [];
  const optsVi: string[] = Array.isArray(q.optionsVi) ? q.optionsVi : [];
  const correctOpt = stripRubyHtml(opts[q.correctIndex] || '');
  const correctVi = optsVi[q.correctIndex] || '';
  const quotedMatches = (q.explanation || '').match(/「([^」]+)」/g);
  const patternStr = quotedMatches && quotedMatches.length > 0 ? quotedMatches.join(' • ') : (correctOpt ? `「${correctOpt}」` : '');

  const optionContrast = opts
    .map((o, idx) => {
      const cleanO = stripRubyHtml(o);
      const vi = optsVi[idx] ? ` (${optsVi[idx]})` : '';
      return `${idx + 1}. ${cleanO}${vi}`;
    })
    .filter(Boolean)
    .join(' | ');

  if (q.section === 'vocab') {
    const boldMatch = (q.question || '').match(/\*\*(.*?)\*\*/);
    const targetWord = boldMatch ? stripRubyHtml(boldMatch[1]) : correctOpt;
    return [
      `Từ khóa trọng tâm: ${targetWord || 'Từ vựng JLPT'}${correctVi ? ` — Nghĩa: ${correctVi}` : ''}.`,
      optionContrast ? `Đối chiếu 4 phương án: ${optionContrast}` : ''
    ].filter(Boolean).join('\n');
  }
  if (q.section === 'grammar') {
    const isStarQuestion = (q.question || '').includes('★');
    if (isStarQuestion) {
      return [
        `Cấu trúc cốt lõi (Mondai 5 - Ghép câu ★): ${patternStr || `Đáp án tại ★ là 「${correctOpt}」`}${correctVi ? ` (${correctVi})` : ''}.`,
        optionContrast ? `Các mảnh ghép: ${optionContrast}` : ''
      ].filter(Boolean).join('\n');
    }
    return [
      `Mẫu ngữ pháp trọng tâm: ${patternStr || `「${correctOpt}」`}${correctVi ? ` — ${correctVi}` : ''}.`,
      optionContrast ? `Phân biệt các phương án: ${optionContrast}` : ''
    ].filter(Boolean).join('\n');
  }
  if (q.section === 'reading') {
    const quoteInExp = (q.explanation || '').match(/「([^」]+)」/);
    const evidenceText = quoteInExp ? `Dẫn chứng mấu chốt: 「${quoteInExp[1]}」. ` : '';
    return `${evidenceText}Kỹ năng Đọc hiểu (${q.subTypeLabel || 'Dokkai'}): Đáp án đúng là Phương án [${ (q.correctIndex ?? 0) + 1 }] 「${correctOpt}」${correctVi ? ` (${correctVi})` : ''}. Đối chiếu trực tiếp với câu chứa từ khóa trong bài đọc.`;
  }
  if (q.section === 'listening') {
    const quoteInExp = (q.explanation || '').match(/「([^」]+)」/);
    const evidenceText = quoteInExp ? `Đoạn thoại then chốt: 「${quoteInExp[1]}」. ` : '';
    return `${evidenceText}Kỹ năng Nghe hiểu (${q.subTypeLabel || 'Choukai'}): Đáp án đúng là Phương án [${ (q.correctIndex ?? 0) + 1 }] 「${correctOpt}」${correctVi ? ` (${correctVi})` : ''}. Lắng nghe kỹ câu hỏi và từ phát tín hiệu chốt kết luận.`;
  }
  return patternStr ? `Điểm kiến thức cốt lõi: ${patternStr}` : 'Điểm kiến thức cốt lõi chuẩn kỳ thi JLPT.';
}

function extractStudyTip(q: any): string {
  const isStarQuestion = (q.question || '').includes('★');
  if (q.section === 'vocab') {
    if ((q.subTypeLabel || '').toLowerCase().includes('cách đọc') || (q.subType || '').includes('reading')) {
      return 'Kiểm tra kỹ trường âm (おう/う), âm ngắt (っ) và âm đục (゛) của từng chữ Hán để tránh bẫy phát âm gần giống.';
    }
    if ((q.subTypeLabel || '').toLowerCase().includes('đồng nghĩa') || (q.subType || '').includes('paraphrase')) {
      return 'Thay thế trực tiếp từng phương án vào câu gốc để kiểm tra độ tương thích về cả nghĩa lẫn từ loại (Danh từ / Động từ / Phó từ).';
    }
    return 'Xác định từ loại cần điền và cụm từ đi kèm (Collocation - 連語) đứng ngay trước/sau chỗ trống.';
  }
  if (q.section === 'grammar') {
    if (isStarQuestion) {
      return 'Mẹo giải bài ★ (Mondai 5): (1) Tìm mảnh ghép nối tiếp ngay sau trợ từ trước ngoặc, (2) Tìm mảnh ghép nối trực tiếp vào vị trí kết thúc ngoặc, (3) Ghép cụm cố định ở giữa.';
    }
    return 'Quan sát kỹ dạng chia (Thể Rư / Thể Ta / Thể Te / Danh từ + の) ngay trước chỗ trống và sắc thái vế câu phía sau.';
  }
  if (q.section === 'reading') {
    return 'Đọc câu hỏi trước để xác định từ khóa (キーワード) cần tìm, đối chiếu câu dẫn chứng trong đoạn văn và loại bỏ các phương án chứa từ mang tính tuyệt đối hóa (như 一切, のみ, 必ず).';
  }
  if (q.section === 'listening') {
    return 'Tận dụng thời gian chuẩn bị đọc lướt 4 lựa chọn, lắng nghe kỹ nửa sau đoạn thoại và bắt các từ phát tín hiệu kết luận (như 実は, でも, ポイントは, 〜方がいい).';
  }
  return 'Đọc kỹ yêu cầu đề bài và loại trừ các phương án gây nhiễu.';
}

export class ExamService {
  private static genAI: GoogleGenerativeAI | null = null;

  private static getGeminiClient(): GoogleGenerativeAI | null {
    if (!this.genAI) {
      const apiKey = process.env.GEMINI_KEY_EXAM || process.env.GEMINI_API_KEY || '';
      if (apiKey) {
        this.genAI = new GoogleGenerativeAI(apiKey);
      }
    }
    return this.genAI;
  }

  /**
   * Lấy danh sách các đề thi JLPT chuẩn hóa từ cơ sở dữ liệu MySQL
   */
  static async getExamList(
    level?: string,
    year?: string,
    session?: string
  ): Promise<Omit<JLPTExam, 'questions'>[]> {
    const cacheKey = `exam:list:${level || 'ALL'}:${year || 'ALL'}:${session || 'ALL'}`;
    const { data } = await RedisService.getOrSet(
      cacheKey,
      async () => {
        const whereClause: any = { isPublished: true };

        if (level && level !== 'ALL') {
          whereClause.level = level.toUpperCase();
        }

        if (year && year !== 'ALL') {
          const yearNum = parseInt(year, 10);
          if (!isNaN(yearNum)) {
            whereClause.year = yearNum;
          }
        }

        if (session && session !== 'ALL') {
          const s = session.toUpperCase();
          if (s === 'JULY' || s === 'VOL1') {
            whereClause.session = { in: ['JULY', 'VOL1'] };
          } else if (s === 'DECEMBER' || s === 'VOL2') {
            whereClause.session = { in: ['DECEMBER', 'VOL2'] };
          } else {
            whereClause.session = s;
          }
        }

        const exams = await prisma.jlptExam.findMany({
          where: whereClause,
          orderBy: [
            { year: 'desc' },
            { session: 'asc' },
            { level: 'asc' }
          ]
        });

        return exams.map((exam) => ({
          id: exam.id,
          code: exam.code,
          title: exam.title,
          level: exam.level as JLPTLevel,
          year: exam.year,
          session: exam.session,
          edition: exam.edition,
          description: exam.description || '',
          durationMinutes: exam.durationMinutes,
          expressDurationMinutes: EXPRESS_DURATIONS[exam.level] || 50,
          fullDurationMinutes: FULL_DURATIONS[exam.level] || exam.durationMinutes,
          expressTotalQuestions: 34,
          fullTotalQuestions: exam.totalQuestions,
          totalQuestions: exam.totalQuestions,
          passingScore: exam.passingScore,
          sectionalMinScore: exam.sectionalMinScore,
          sections: [
            { section: 'vocab' as ExamSectionType, title: 'Kiến thức chữ Hán & Từ vựng (文字・語彙)', totalQuestions: Math.max(1, Math.round(exam.totalQuestions * 0.3)), maxScore: 60 },
            { section: 'grammar' as ExamSectionType, title: 'Cấu trúc Ngữ pháp (文法)', totalQuestions: Math.max(1, Math.round(exam.totalQuestions * 0.25)), maxScore: 60 },
            { section: 'reading' as ExamSectionType, title: 'Đọc hiểu nội dung (読解)', totalQuestions: Math.max(1, Math.round(exam.totalQuestions * 0.25)), maxScore: 60 },
            { section: 'listening' as ExamSectionType, title: 'Nghe hiểu tiếng Nhật (聴解)', totalQuestions: Math.max(1, Math.round(exam.totalQuestions * 0.2)), maxScore: 60 }
          ]
        }));
      },
      1800
    );

    return data;
  }

  /**
   * Lấy chi tiết đề thi để bắt đầu làm bài
   * @param examId Mã UUID hoặc Code đề thi
   * @param hideAnswers Ẩn đáp án đúng và lời giải khi đang làm bài để tránh gian lận
   * @param sectionFilter Bộ lọc chuyên đề (vocab, grammar, reading, listening) nếu chỉ muốn luyện riêng 1 phần
   * @param format Phương án thi: 'express' (Thi tinh gọn 34 câu, giảm thời gian) hoặc 'full' (Thi thật toàn bộ, thời gian chuẩn)
   */
  static async getExamDetail(
    examId: string,
    hideAnswers = true,
    sectionFilter?: string,
    format: 'express' | 'full' = 'express'
  ): Promise<JLPTExam> {
    const { data: exam } = await RedisService.getOrSet(
      `exam:raw:${examId}`,
      async () => {
        let found = await prisma.jlptExam.findUnique({
          where: { id: examId },
          include: {
            questions: {
              orderBy: { orderNumber: 'asc' }
            }
          }
        });

        if (!found) {
          found = await prisma.jlptExam.findUnique({
            where: { code: examId },
            include: {
              questions: {
                orderBy: { orderNumber: 'asc' }
              }
            }
          });
        }
        return found;
      },
      1800
    );

    if (!exam) {
      throw new Error(`Không tìm thấy đề thi với mã ID hoặc Code: ${examId}`);
    }

    let questionsToUse = exam.questions;
    if (sectionFilter && sectionFilter !== 'ALL') {
      const normFilter = sectionFilter.toLowerCase();
      const filtered = exam.questions.filter((q) => {
        const sec = q.section.toLowerCase();
        if (normFilter === 'grammar_reading') {
          return sec === 'grammar' || sec === 'reading';
        }
        return sec === normFilter;
      });
      if (filtered.length > 0) {
        questionsToUse = filtered;
      }
    }

    // Nếu chọn Phương án 1 (Thi Tinh Gọn) và có hơn 34 câu, chọn lọc 34 câu đại diện đủ 16 Mondai
    if (format === 'express' && questionsToUse.length > 34) {
      questionsToUse = pickExpressQuestions(questionsToUse);
    }

    const chosenDuration = format === 'express'
      ? (EXPRESS_DURATIONS[exam.level] || 50)
      : (FULL_DURATIONS[exam.level] || exam.durationMinutes);

    let vocabCount = 0;
    let grammarCount = 0;
    let readingCount = 0;
    let listeningCount = 0;

    const formattedQuestions: ExamQuestionItem[] = questionsToUse.map((q) => {
      let optionsList: string[] = [];
      let optionsViList: string[] = [];
      try {
        optionsList = JSON.parse(q.options || '[]');
      } catch {
        optionsList = [];
      }
      try {
        optionsViList = q.optionsVi ? JSON.parse(q.optionsVi) : [];
      } catch {
        optionsViList = [];
      }

      if (q.section === 'vocab') vocabCount++;
      else if (q.section === 'grammar') grammarCount++;
      else if (q.section === 'reading') readingCount++;
      else if (q.section === 'listening') listeningCount++;

      const cleanQ = cleanBoldQuestionText(q.question);
      const safeOpts = deduplicateRuntimeOptions(optionsList, q.correctIndex);

      return {
        id: q.id,
        orderNumber: q.orderNumber,
        level: exam.level as JLPTLevel,
        section: q.section as ExamSectionType,
        subType: q.subType,
        subTypeLabel: q.subTypeLabel,
        question: cleanQ,
        questionVi: q.questionVi,
        passage: q.passage || undefined,
        passageVi: q.passageVi || undefined,
        audioUrl: q.audioUrl || (q.section === 'listening' ? `/api/exam/audio/${q.id}` : undefined),
        imageUrl: q.imageUrl || undefined,
        options: safeOpts,
        optionsVi: optionsViList,
        correctIndex: hideAnswers ? -1 : q.correctIndex,
        explanation: hideAnswers ? '' : q.explanation,
        officialSource: q.officialSource
      };
    });

    const activeSections: { section: ExamSectionType; title: string; totalQuestions: number; maxScore: number }[] = [];
    if (vocabCount > 0) {
      activeSections.push({ section: 'vocab', title: 'Kiến thức chữ Hán & Từ vựng (文字・語彙)', totalQuestions: vocabCount, maxScore: 60 });
    }
    if (grammarCount > 0) {
      activeSections.push({ section: 'grammar', title: 'Cấu trúc Ngữ pháp (文法)', totalQuestions: grammarCount, maxScore: 60 });
    }
    if (readingCount > 0) {
      activeSections.push({ section: 'reading', title: 'Đọc hiểu nội dung (読解)', totalQuestions: readingCount, maxScore: 60 });
    }
    if (listeningCount > 0) {
      activeSections.push({ section: 'listening', title: 'Nghe hiểu tiếng Nhật (聴解)', totalQuestions: listeningCount, maxScore: 60 });
    }

    return {
      id: exam.id,
      code: exam.code,
      title: exam.title,
      level: exam.level as JLPTLevel,
      year: exam.year,
      session: exam.session,
      edition: exam.edition,
      description: exam.description || '',
      durationMinutes: chosenDuration,
      expressDurationMinutes: EXPRESS_DURATIONS[exam.level] || 50,
      fullDurationMinutes: FULL_DURATIONS[exam.level] || exam.durationMinutes,
      expressTotalQuestions: 34,
      fullTotalQuestions: exam.questions.length,
      format,
      totalQuestions: formattedQuestions.length,
      passingScore: exam.passingScore,
      sectionalMinScore: exam.sectionalMinScore,
      sections: activeSections.length > 0 ? activeSections : [
        { section: 'vocab', title: 'Kiến thức chữ Hán & Từ vựng (文字・語彙)', totalQuestions: vocabCount, maxScore: 60 },
        { section: 'grammar', title: 'Cấu trúc Ngữ pháp (文法)', totalQuestions: grammarCount, maxScore: 60 },
        { section: 'reading', title: 'Đọc hiểu nội dung (読解)', totalQuestions: readingCount, maxScore: 60 },
        { section: 'listening', title: 'Nghe hiểu tiếng Nhật (聴解)', totalQuestions: listeningCount, maxScore: 60 }
      ],
      questions: formattedQuestions
    };
  }

  /**
   * Chấm điểm bài thi tự động theo chuẩn thang điểm 180 của JLPT và lưu vào CSDL
   */
  static async submitExam(payload: ExamSubmissionPayload, userId?: string): Promise<ExamEvaluationResult> {
    let exam = await prisma.jlptExam.findUnique({
      where: { id: payload.examId },
      include: {
        questions: {
          orderBy: { orderNumber: 'asc' }
        }
      }
    });

    if (!exam) {
      exam = await prisma.jlptExam.findUnique({
        where: { code: payload.examId },
        include: {
          questions: {
            orderBy: { orderNumber: 'asc' }
          }
        }
      });
    }

    if (!exam) {
      throw new Error(`Không tìm thấy đề thi với mã ID: ${payload.examId}`);
    }

    const userAnswers = payload.userAnswers || {};
    let totalCorrect = 0;

    let targetQuestions = exam.questions;
    if (payload.questionIds && payload.questionIds.length > 0) {
      const qIdSet = new Set(payload.questionIds);
      targetQuestions = exam.questions.filter((q) => qIdSet.has(q.id));
    } else if (payload.format === 'express' && exam.questions.length > 34) {
      targetQuestions = pickExpressQuestions(exam.questions);
    }

    const sectionGroups: {
      [key in ExamSectionType]: {
        title: string;
        correctCount: number;
        totalQuestions: number;
      };
    } = {
      vocab: { title: 'Kiến thức chữ Hán & Từ vựng (文字・語彙)', correctCount: 0, totalQuestions: 0 },
      grammar: { title: 'Cấu trúc Ngữ pháp (文法)', correctCount: 0, totalQuestions: 0 },
      reading: { title: 'Đọc hiểu nội dung (読解)', correctCount: 0, totalQuestions: 0 },
      listening: { title: 'Nghe hiểu tiếng Nhật (聴解)', correctCount: 0, totalQuestions: 0 }
    };

    const questionResults = targetQuestions.map((q) => {
      let optionsList: string[] = [];
      let optionsViList: string[] = [];
      try {
        optionsList = JSON.parse(q.options || '[]');
      } catch {
        optionsList = [];
      }
      try {
        optionsViList = q.optionsVi ? JSON.parse(q.optionsVi) : [];
      } catch {
        optionsViList = [];
      }

      const userAnswer = userAnswers[q.id] !== undefined ? userAnswers[q.id] : null;
      const isCorrect = userAnswer === q.correctIndex;

      if (isCorrect) {
        totalCorrect++;
        if (sectionGroups[q.section as ExamSectionType]) {
          sectionGroups[q.section as ExamSectionType].correctCount++;
        }
      }

      if (sectionGroups[q.section as ExamSectionType]) {
        sectionGroups[q.section as ExamSectionType].totalQuestions++;
      }

      return {
        questionId: q.id,
        orderNumber: q.orderNumber,
        section: q.section as ExamSectionType,
        subType: q.subType,
        subTypeLabel: q.subTypeLabel,
        question: q.question,
        questionVi: q.questionVi,
        passage: q.passage || undefined,
        passageVi: q.passageVi || undefined,
        audioUrl: q.audioUrl || (q.section === 'listening' ? `/api/exam/audio/${q.id}` : undefined),
        imageUrl: q.imageUrl || undefined,
        options: optionsList,
        optionsVi: optionsViList,
        userAnswer,
        correctAnswer: q.correctIndex,
        isCorrect,
        explanation: q.explanation,
        keyGrammarOrVocab: extractKeyGrammar({ ...q, options: optionsList, optionsVi: optionsViList }),
        studyTips: extractStudyTip({ ...q, options: optionsList, optionsVi: optionsViList }),
        officialSource: q.officialSource
      };
    });

    let totalScore = 0;
    let hasSectionalFailure = false;
    const sectionScoreMap: Record<string, number> = {};

    const hasListening = sectionGroups.listening.totalQuestions > 0;
    const hasReading = sectionGroups.reading.totalQuestions > 0;
    const knowledgeTotal = sectionGroups.vocab.totalQuestions + sectionGroups.grammar.totalQuestions;
    const knowledgeCorrect = sectionGroups.vocab.correctCount + sectionGroups.grammar.correctCount;
    const knowledgeScore = knowledgeTotal > 0 ? Math.round((knowledgeCorrect / knowledgeTotal) * 60) : 0;
    const readingScore = sectionGroups.reading.totalQuestions > 0
      ? Math.round((sectionGroups.reading.correctCount / sectionGroups.reading.totalQuestions) * 60)
      : 0;
    const listeningScore = sectionGroups.listening.totalQuestions > 0
      ? Math.round((sectionGroups.listening.correctCount / sectionGroups.listening.totalQuestions) * 60)
      : 0;

    if (hasListening) {
      totalScore = knowledgeScore + readingScore + listeningScore;
      if (knowledgeTotal > 0 && knowledgeScore < exam.sectionalMinScore) hasSectionalFailure = true;
      if (hasReading && readingScore < exam.sectionalMinScore) hasSectionalFailure = true;
      if (hasListening && listeningScore < exam.sectionalMinScore) hasSectionalFailure = true;
    } else {
      totalScore = knowledgeScore + readingScore;
      if (knowledgeTotal > 0 && knowledgeScore < exam.sectionalMinScore) hasSectionalFailure = true;
      if (hasReading && readingScore < exam.sectionalMinScore) hasSectionalFailure = true;
    }

    const activeSections = (['vocab', 'grammar', 'reading', 'listening'] as ExamSectionType[])
      .filter((secKey) => sectionGroups[secKey].totalQuestions > 0);

    const sectionResults: SectionScoreResult[] = activeSections.map((secKey) => {
      const group = sectionGroups[secKey];
      let sectionScore = 0;
      let isFailed = false;

      if (secKey === 'vocab') {
        sectionScore = group.totalQuestions > 0 ? Math.round((group.correctCount / group.totalQuestions) * (sectionGroups.grammar.totalQuestions > 0 ? 30 : 60)) : 0;
        isFailed = knowledgeScore < exam.sectionalMinScore;
      } else if (secKey === 'grammar') {
        sectionScore = group.totalQuestions > 0 ? Math.round((group.correctCount / group.totalQuestions) * (sectionGroups.vocab.totalQuestions > 0 ? 30 : 60)) : 0;
        isFailed = knowledgeScore < exam.sectionalMinScore;
      } else if (secKey === 'reading') {
        sectionScore = readingScore;
        isFailed = readingScore < exam.sectionalMinScore;
      } else if (secKey === 'listening') {
        sectionScore = listeningScore;
        isFailed = listeningScore < exam.sectionalMinScore;
      }

      sectionScoreMap[secKey] = sectionScore;

      return {
        section: secKey,
        title: group.title,
        correctCount: group.correctCount,
        totalQuestions: group.totalQuestions,
        score: sectionScore,
        isFailedSection: isFailed
      };
    });

    const maxPossibleScore =
      ((knowledgeTotal > 0 ? 60 : 0) +
        (hasReading ? 60 : 0) +
        (hasListening ? 60 : 0)) || 180;
    const effectivePassingScore = maxPossibleScore < 180
      ? Math.round((exam.passingScore / 180) * maxPossibleScore)
      : exam.passingScore;
    const isPassed = totalScore >= effectivePassingScore && !hasSectionalFailure;

    let summaryMessage = '';
    if (isPassed) {
      summaryMessage = `Chúc mừng bạn đã XUẤT SẮC ĐẠT (合格 - PASSED) kỳ thi JLPT ${exam.level} với ${totalScore}/${maxPossibleScore} điểm!`;
    } else if (hasSectionalFailure) {
      summaryMessage = `Rất tiếc! Mặc dù tổng điểm của bạn đạt ${totalScore}/${maxPossibleScore}, nhưng bạn bị ĐIỂM LIỆT (< ${exam.sectionalMinScore}/60) ở một phần thi theo quy chuẩn JLPT.`;
    } else {
      summaryMessage = `Rất tiếc! Bạn chưa đạt điểm chuẩn tối thiểu (${totalScore}/${effectivePassingScore} điểm). Hãy tiếp tục ôn luyện cùng NihonAI nhé!`;
    }

    // Lưu kết quả làm bài vào cơ sở dữ liệu `jlpt_exam_attempts`
    try {
      await prisma.jlptExamAttempt.create({
        data: {
          examId: exam.id,
          userId: userId || null,
          totalScore,
          totalCorrect,
          totalQuestions: targetQuestions.length,
          isPassed,
          hasSectionalFailure,
          timeSpentSeconds: payload.timeSpentSeconds || 0,
          userAnswers: JSON.stringify(userAnswers),
          sectionScores: JSON.stringify(sectionScoreMap)
        }
      });
    } catch (saveErr) {
      console.warn('Lỗi ghi lại lịch sử làm bài thi (jlptExamAttempt):', saveErr);
    }

    return {
      examId: exam.id,
      examTitle: exam.title,
      level: exam.level as JLPTLevel,
      timeSpentSeconds: payload.timeSpentSeconds || 0,
      totalQuestions: targetQuestions.length,
      totalCorrect,
      totalScore,
      passingScore: exam.passingScore,
      isPassed,
      hasSectionalFailure,
      summaryMessage,
      sectionResults,
      questionResults
    };
  }

  /**
   * Sử dụng Trí tuệ nhân tạo (Gemini AI) phân tích chuyên sâu câu hỏi thi
   */
  static async explainQuestionWithAI(
    questionId: string,
    userAnswer: number | null
  ): Promise<{
    explanation: string;
    keyGrammarOrVocab: string;
    studyTips: string;
    completedSentence?: string;
    trapAnalysis?: string;
    optionBreakdowns?: string[];
    grammarFormula?: string;
    source: 'GEMINI_AI' | 'BUILTIN_EXPLANATION';
  }> {
    const targetQuestion = await prisma.jlptQuestion.findUnique({
      where: { id: questionId },
      include: { exam: true }
    });

    if (!targetQuestion) {
      throw new Error(`Không tìm thấy câu hỏi với mã ID: ${questionId}`);
    }

    let optionsList: string[] = [];
    let optionsViList: string[] = [];
    try {
      optionsList = JSON.parse(targetQuestion.options || '[]');
    } catch {
      optionsList = [];
    }
    try {
      optionsViList = targetQuestion.optionsVi ? JSON.parse(targetQuestion.optionsVi) : [];
    } catch {
      optionsViList = [];
    }

    const isStarQuestion = (targetQuestion.question || '').includes('★');

    try {
      const optionsFormatted = optionsList
        .map((opt: string, idx: number) => `Phương án ${idx + 1}: ${stripRubyHtml(opt)} (${optionsViList[idx] || ''})`)
        .join('\n');

      const userChoiceStr =
        userAnswer !== null && userAnswer !== undefined
          ? `Học viên đã chọn sai: Phương án ${userAnswer + 1} (${stripRubyHtml(optionsList[userAnswer] || '')})`
          : 'Học viên chưa chọn đáp án.';

      const prompt = `Bạn là một Giáo sư Ngôn ngữ học tiếng Nhật và Giám khảo chấm thi JLPT giàu kinh nghiệm.
Hãy phân tích cặn kẽ câu hỏi thi thử JLPT sau đây để hướng dẫn học viên Việt Nam dễ hiểu, nhớ lâu:

Cấp độ: ${targetQuestion.exam.level}
Dạng bài: ${targetQuestion.subTypeLabel}${isStarQuestion ? ' (Dạng bài ghép câu dấu sao ★ Mondai 5 - cần chỉ rõ thứ tự 4 mảnh ghép)' : ''}
Đề bài: ${stripRubyHtml(targetQuestion.question)}
Dịch nghĩa đề bài: ${targetQuestion.questionVi}
${targetQuestion.passage ? `Đoạn văn đọc hiểu:\n${stripRubyHtml(targetQuestion.passage)}\n` : ''}
Các lựa chọn:
${optionsFormatted}

Đáp án đúng: Phương án ${targetQuestion.correctIndex + 1} (${stripRubyHtml(optionsList[targetQuestion.correctIndex] || '')})
${userChoiceStr}
Giải thích gốc tham khảo: ${targetQuestion.explanation || ''}

Yêu cầu trả về JSON theo đúng schema sau (bằng tiếng Việt chuẩn, rõ ràng, súc tích):
{
  "completedSentence": "${isStarQuestion ? 'Ghi rõ thứ tự ghép đúng cả 4 vị trí (VD: Thứ tự đúng: [4] 社内は ➔ [3] ★ もとより ➔ [1] 取引先からも ➔ [2] 厚い信頼を寄せられ) kèm câu tiếng Nhật hoàn chỉnh đã ghép' : 'Câu tiếng Nhật hoàn chỉnh sau khi điền đáp án đúng (kèm cách đọc Hiragana trong ngoặc cho từ khóa chính)'}",
  "explanation": "Giải thích chi tiết tại sao đáp án đúng lại chính xác về mặt ngữ nghĩa, ngữ cảnh và cấu trúc kết hợp.",
  "trapAnalysis": "Phân tích trực diện tại sao phương án học viên chọn (hoặc các phương án nhiễu còn lại) lại sai (bẫy đồng âm Hán tự, sai trợ từ, sai thể kết hợp hay lệch sắc thái).",
  "optionBreakdowns": [
    "Phân tích Phương án 1: [Từ/Cấu trúc] (Cách đọc) — Nghĩa tiếng Việt & lý do đúng/sai ngắn gọn",
    "Phân tích Phương án 2: [Từ/Cấu trúc] (Cách đọc) — Nghĩa tiếng Việt & lý do đúng/sai ngắn gọn",
    "Phân tích Phương án 3: [Từ/Cấu trúc] (Cách đọc) — Nghĩa tiếng Việt & lý do đúng/sai ngắn gọn",
    "Phân tích Phương án 4: [Từ/Cấu trúc] (Cách đọc) — Nghĩa tiếng Việt & lý do đúng/sai ngắn gọn"
  ],
  "grammarFormula": "Công thức ngữ pháp hoặc Từ vựng cốt lõi đóng khung ngắn gọn (VD: N + はもとより / はもちろん = Không những N1 mà ngay cả N2), tuyệt đối KHÔNG chép lại nguyên câu đề bài có chỗ trống.",
  "keyGrammarOrVocab": "Tổng hợp điểm ngữ pháp / từ vựng cốt lõi và 1 câu ví dụ ngắn mở rộng kèm dịch nghĩa.",
  "studyTips": "Mẹo nhận diện nhanh trong 5 giây ở phòng thi thật JLPT cho câu hỏi này."
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

      return {
        explanation: parsed.explanation || targetQuestion.explanation,
        keyGrammarOrVocab: parsed.keyGrammarOrVocab || extractKeyGrammar({ ...targetQuestion, options: optionsList, optionsVi: optionsViList }),
        studyTips: parsed.studyTips || extractStudyTip(targetQuestion),
        completedSentence: parsed.completedSentence || '',
        trapAnalysis: parsed.trapAnalysis || '',
        optionBreakdowns: Array.isArray(parsed.optionBreakdowns) ? parsed.optionBreakdowns : optionsViList,
        grammarFormula: parsed.grammarFormula || '',
        source: 'GEMINI_AI'
      };
    } catch (err) {
      console.warn('Gemini AI explanation fallback to builtin:', err);
      const qObj = { ...targetQuestion, options: optionsList, optionsVi: optionsViList };
      return {
        explanation: targetQuestion.explanation,
        keyGrammarOrVocab: extractKeyGrammar(qObj),
        studyTips: extractStudyTip(qObj),
        optionBreakdowns: optionsList.map((opt, idx) => `${idx + 1}. ${stripRubyHtml(opt)}${optionsViList[idx] ? ` — ${optionsViList[idx]}` : ''}`),
        source: 'BUILTIN_EXPLANATION'
      };
    }
  }

  /**
   * Tạo báo cáo chẩn đoán toàn diện bài thi và rút kinh nghiệm sâu sắc bằng Gemini 3.5 Flash
   */
  static async generateExamDiagnosticReport(
    payload: ExamDiagnosticRequest
  ): Promise<ExamDiagnosticReport> {
    const gemini = this.getGeminiClient();
    const fallbackReport: ExamDiagnosticReport = {
      overallVerdict: payload.isPassed
        ? `Chúc mừng bạn! Bạn đã đạt ${payload.totalScore}/180 điểm (chuẩn đỗ: ${payload.passingScore}đ) ở cấp độ JLPT ${payload.level}. Phong độ làm bài của bạn tương đối ổn định.`
        : `Bạn đạt ${payload.totalScore}/180 điểm ở cấp độ JLPT ${payload.level} (chuẩn đỗ: ${payload.passingScore}đ). ${
            payload.hasSectionalFailure
              ? 'Lưu ý: Bạn bị vướng điểm liệt ở ít nhất 1 phân môn (<19/60đ).'
              : 'Bạn cần cải thiện thêm một số kỹ năng để vượt ngưỡng đỗ an toàn.'
          }`,
      passingProbability: payload.isPassed
        ? Math.min(95, Math.round((payload.totalScore / 180) * 100))
        : Math.max(20, Math.round((payload.totalScore / 180) * 85)),
      scoreAssessment: {
        totalScore: payload.totalScore,
        passingScore: payload.passingScore,
        statusText: payload.isPassed ? 'Đạt chuẩn điểm đỗ kỳ thi JLPT' : 'Chưa đạt chuẩn điểm đỗ kỳ thi JLPT',
        sectionalRisk: payload.hasSectionalFailure
          ? 'Cảnh báo nguy cơ điểm liệt: Cần tập trung cân đối thời gian giữa các phần thi.'
          : 'Không có phân môn nào bị điểm liệt. Điểm số phân bổ đồng đều.'
      },
      strengthAreas: (payload.sectionResults && payload.sectionResults.length > 0)
        ? payload.sectionResults
            .filter((s) => (s.score / (s.totalQuestions > 0 ? 60 : 1)) >= 0.6 || s.score >= 35)
            .map((s) => `${s.title}: Đạt ${s.score}/60 điểm (${s.correctCount}/${s.totalQuestions} câu đúng)`)
        : [`Nỗ lực hoàn thành bài thi: Đạt ${payload.totalCorrect}/${payload.totalQuestions} câu đúng (${Math.round((payload.totalCorrect / Math.max(1, payload.totalQuestions)) * 100)}%)`],
      criticalWeaknesses: (payload.sectionResults && payload.sectionResults.length > 0)
        ? payload.sectionResults
            .filter((s) => s.score < 30 || s.isFailedSection)
            .map((s) => `${s.title}: Chỉ đạt ${s.score}/60 điểm, cần củng cố kiến thức nền tảng`)
        : (payload.incorrectQuestions.length > 0
            ? [`Cần ôn luyện lại ${payload.incorrectQuestions.length} câu làm sai trong lượt thi vừa qua.`]
            : []),
      lessonsLearned: payload.incorrectQuestions.slice(0, 20).map((q) => ({
        orderNumber: q.orderNumber,
        questionId: q.questionId,
        subTypeLabel: q.subTypeLabel,
        questionSnippet: q.question.length > 80 ? q.question.slice(0, 80) + '...' : q.question,
        userAnswerText: q.userAnswerText || 'Chưa trả lời',
        correctAnswerText: q.correctAnswerText,
        trapNote: q.explanation || 'Chú ý phân tích kỹ cấu trúc câu và các phương án gây nhiễu gần nghĩa.',
        coreTakeaway: 'Đối chiếu kỹ từ khóa và mẫu câu trước khi chọn đáp án.'
      })),
      actionPlan7Days: [
        {
          dayRange: 'Ngày 1 - 2',
          focusArea: 'Khắc phục triệt để câu sai',
          action: 'Lưu toàn bộ câu làm sai vào Sổ tay, mở Flashcard SRS ôn tập 2 lần/ngày.'
        },
        {
          dayRange: 'Ngày 3 - 5',
          focusArea: 'Củng cố phân môn yếu nhất',
          action: 'Luyện tập chuyên sâu các dạng bài có tỷ lệ sai cao trong đề thi vừa làm.'
        },
        {
          dayRange: 'Ngày 6 - 7',
          focusArea: 'Thi thử bấm giờ phản xạ',
          action: 'Làm lại đề thi ở chế độ bấm giờ để cải thiện tốc độ và tâm lý phòng thi.'
        }
      ],
      encouragement:
        'Thành công trong kỳ thi JLPT không đến từ việc không bao giờ sai, mà đến từ việc bạn rút ra bài học gì sau mỗi câu làm sai. Hãy kiên trì ôn tập, kết quả tốt đẹp sẽ đến!',
      generatedAt: new Date().toISOString(),
      model: 'system-fallback'
    };

    try {
      const incorrectFormatted = payload.incorrectQuestions
        .slice(0, 25)
        .map((q) => {
          return `[Câu ${q.orderNumber} - ${q.subTypeLabel}]
Đề bài: ${q.question} (${q.questionVi})
Học viên đã chọn: ${q.userAnswerText || 'Bỏ trống'}
Đáp án đúng: ${q.correctAnswerText}
Giải thích có sẵn: ${q.explanation || 'N/A'}`;
        })
        .join('\n\n');

      const sectionScoresFormatted = (payload.sectionResults && payload.sectionResults.length > 0)
        ? payload.sectionResults
            .map(
              (s) =>
                `- ${s.title}: ${s.score}/60 điểm (${s.correctCount}/${s.totalQuestions} câu đúng)${
                  s.isFailedSection ? ' [ĐIỂM LIỆT < 19đ]' : ''
                }`
            )
            .join('\n')
        : `- Tổng quan điểm số: ${payload.totalScore}/180 (${payload.totalCorrect}/${payload.totalQuestions} câu đúng)`;

      const prompt = `Bạn là Hội đồng Giám khảo chuyên gia JLPT và Chuyên gia Sư phạm tiếng Nhật hàng đầu.
Nhiệm vụ của bạn là phân tích sâu sắc, chính xác, sư phạm và dễ hiểu bài thi thử JLPT cấp độ ${payload.level} của một học viên Việt Nam để giúp họ rút kinh nghiệm trực tiếp.

TỔNG QUAN KẾT QUẢ:
- Đề thi: ${payload.examTitle} (JLPT ${payload.level})
- Tổng điểm: ${payload.totalScore} / 180 điểm (Điểm đỗ yêu cầu: ${payload.passingScore} điểm)
- Trạng thái: ${payload.isPassed ? 'ĐÃ ĐỖ (PASSED)' : 'CHƯA ĐẠT (FAILED)'}
- Nguy cơ điểm liệt (<19/60đ): ${payload.hasSectionalFailure ? 'CÓ (Dính điểm liệt)' : 'KHÔNG'}
- Tổng số câu đúng: ${payload.totalCorrect} / ${payload.totalQuestions} câu
- Thời gian làm bài: ${Math.round(payload.timeSpentSeconds / 60)} phút

CHI TIẾT ĐIỂM CÁC PHÂN MÔN (Thang 60):
${sectionScoresFormatted}

DANH SÁCH CÁC CÂU LÀM SAI CỦA HỌC VIÊN CẦN PHÂN TÍCH RÚT KINH NGHIỆM:
${incorrectFormatted || 'Học viên không sai câu nào (làm đúng 100%).'}

YÊU CẦU:
1. Đánh giá tổng quan năng lực và ước tính xác suất đỗ thật (0 - 100%).
2. Nhận xét từng điểm mạnh và lỗ hổng kiến thức chính.
3. RÚT KINH NGHIỆM CHI TIẾT CHO CÁC CÂU LÀM SAI (lessonsLearned):
   - Chỉ rõ bẫy đề thi hoặc lý do học viên dễ nhầm (trapNote).
   - Đúc kết 1 bài học cốt lõi ngắn gọn, dễ nhớ (coreTakeaway).
4. Lộ trình ôn tập 7 ngày thực tế, súc tích (actionPlan7Days).
5. Lời động viên ấm áp, truyền cảm hứng từ Giám khảo AI (encouragement).

Hãy trả về DUY NHẤT một JSON hợp lệ theo đúng cấu trúc sau (toàn bộ nội dung bằng tiếng Việt chuẩn):
{
  "overallVerdict": "Nhận xét tổng quan trình độ, phân tích thái độ và phong độ làm bài...",
  "passingProbability": 75,
  "scoreAssessment": {
    "totalScore": ${payload.totalScore},
    "passingScore": ${payload.passingScore},
    "statusText": "${payload.isPassed ? 'Đạt chuẩn đỗ JLPT' : 'Chưa đạt chuẩn đỗ JLPT'}",
    "sectionalRisk": "Nhận xét nguy cơ điểm liệt hoặc mức độ đồng đều giữa các phân môn..."
  },
  "strengthAreas": [
    "Điểm mạnh 1...",
    "Điểm mạnh 2..."
  ],
  "criticalWeaknesses": [
    "Lỗ hổng 1...",
    "Lỗ hổng 2..."
  ],
  "lessonsLearned": [
    {
      "orderNumber": 1,
      "subTypeLabel": "Dạng bài",
      "questionSnippet": "Trích đoạn ngắn câu hỏi...",
      "userAnswerText": "Đáp án học viên chọn",
      "correctAnswerText": "Đáp án đúng",
      "trapNote": "Bẫy học viên đã gặp phải...",
      "coreTakeaway": "Quy tắc/mẹo cần nhớ để không sai lại..."
    }
  ],
  "actionPlan7Days": [
    {
      "dayRange": "Ngày 1 - 2",
      "focusArea": "Trọng tâm ôn tập...",
      "action": "Hành động cụ thể..."
    }
  ],
  "encouragement": "Lời động viên chân thành từ Giám khảo AI..."
}`;

      const aiRes = await GeminiPoolService.generateContent(
        process.env.GEMINI_MODEL || 'gemini-flash-latest',
        prompt,
        {
          responseMimeType: 'application/json',
          temperature: 0.3
        }
      );
      const rawText = aiRes.response.text().trim();
      const cleanJson = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim();
      let parsed: any;
      try {
        parsed = JSON.parse(cleanJson);
      } catch (parseErr) {
        const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw parseErr;
        }
      }

      return {
        overallVerdict: parsed.overallVerdict || fallbackReport.overallVerdict,
        passingProbability:
          typeof parsed.passingProbability === 'number'
            ? parsed.passingProbability
            : fallbackReport.passingProbability,
        scoreAssessment: {
          totalScore: payload.totalScore,
          passingScore: payload.passingScore,
          statusText: parsed.scoreAssessment?.statusText || fallbackReport.scoreAssessment.statusText,
          sectionalRisk:
            parsed.scoreAssessment?.sectionalRisk || fallbackReport.scoreAssessment.sectionalRisk
        },
        strengthAreas:
          Array.isArray(parsed.strengthAreas) && parsed.strengthAreas.length > 0
            ? parsed.strengthAreas
            : fallbackReport.strengthAreas,
        criticalWeaknesses:
          Array.isArray(parsed.criticalWeaknesses) && parsed.criticalWeaknesses.length > 0
            ? parsed.criticalWeaknesses
            : fallbackReport.criticalWeaknesses,
        lessonsLearned:
          Array.isArray(parsed.lessonsLearned) && parsed.lessonsLearned.length > 0
            ? parsed.lessonsLearned.map((l: any, i: number) => ({
                orderNumber: l.orderNumber || payload.incorrectQuestions[i]?.orderNumber || i + 1,
                questionId: payload.incorrectQuestions[i]?.questionId,
                subTypeLabel: l.subTypeLabel || payload.incorrectQuestions[i]?.subTypeLabel || '',
                questionSnippet: l.questionSnippet || payload.incorrectQuestions[i]?.question || '',
                userAnswerText: l.userAnswerText || payload.incorrectQuestions[i]?.userAnswerText || '',
                correctAnswerText:
                  l.correctAnswerText || payload.incorrectQuestions[i]?.correctAnswerText || '',
                trapNote: l.trapNote || 'Lưu ý bẫy tương tự trong phòng thi.',
                coreTakeaway: l.coreTakeaway || 'Ôn kỹ từ vựng và ngữ pháp trọng tâm.'
              }))
            : fallbackReport.lessonsLearned,
        actionPlan7Days:
          Array.isArray(parsed.actionPlan7Days) && parsed.actionPlan7Days.length > 0
            ? parsed.actionPlan7Days
            : fallbackReport.actionPlan7Days,
        encouragement: parsed.encouragement || fallbackReport.encouragement,
        generatedAt: new Date().toISOString(),
        model: process.env.GEMINI_MODEL || 'gemini-flash-latest'
      };
    } catch (err) {
      console.warn('Gemini AI Diagnostic fallback to algorithmic report:', err);
      return fallbackReport;
    }
  }
}
