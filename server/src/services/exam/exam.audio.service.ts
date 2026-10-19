import https from 'https';
import fs from 'fs';
import path from 'path';
import { prisma } from '../../core/prisma.service';

const AUDIO_CACHE_DIR = path.resolve(__dirname, '../../../public/audio/choukai');

function fetchTtsChunk(text: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const url = 'https://translate.google.com/translate_tts?ie=UTF-8&q=' + encodeURIComponent(text) + '&tl=ja&client=tw-ob';
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode !== 200) return reject(new Error(`TTS failed: ${res.statusCode}`));
      const chunks: Buffer[] = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

function splitTextIntoTtsSentences(text: string): string[] {
  const rawLines = text.split(/[\n\r]+/);
  const sentences: string[] = [];
  for (const line of rawLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parts = trimmed.split(/(?<=[。！？?!])/);
    for (let part of parts) {
      part = part.trim();
      if (!part) continue;
      if (part.length > 100) {
        const subParts = part.split(/(?<=[、,])/);
        for (let sp of subParts) { sp = sp.trim(); if (sp) sentences.push(sp); }
      } else { sentences.push(part); }
    }
  }
  return sentences;
}

function getMondaiType(subTypeLabel: string): 'kadai' | 'point' | 'gaiyo' | 'sokki' | 'other' {
  if (subTypeLabel.includes('課題理解') || subTypeLabel.includes('task_listen')) return 'kadai';
  if (subTypeLabel.includes('ポイント理解') || subTypeLabel.includes('point_listen')) return 'point';
  if (subTypeLabel.includes('概要理解') || subTypeLabel.includes('overview_listen')) return 'gaiyo';
  if (subTypeLabel.includes('即時応答') || subTypeLabel.includes('quick_response')) return 'sokki';
  return 'other';
}

export class ExamAudioService {
  private static ensureCacheDir(): void {
    if (!fs.existsSync(AUDIO_CACHE_DIR)) fs.mkdirSync(AUDIO_CACHE_DIR, { recursive: true });
  }

  static buildSpeechScript(question: {
    orderNumber: number; subTypeLabel: string; question: string;
    passage?: string | null; options: string[];
  }): string {
    const mondaiType = getMondaiType(question.subTypeLabel);
    const lines: string[] = [];

    switch (mondaiType) {
      case 'kadai':
        lines.push('問題１では、まず質問を聞いてください。', 'それから話を聞いて、問題用紙の１から４の中から、最もよいものを一つ選んでください。');
        break;
      case 'point':
        lines.push('問題２では、まず質問を聞いてください。', 'そのあと問題用紙を読んでください。', 'それから話を聞いて、問題用紙の１から４の中から、最もよいものを一つ選んでください。');
        break;
      case 'gaiyo':
        lines.push('問題３では、問題用紙に何も印刷されていません。', 'この問題は、全体としてどんな内容かを聞く問題です。', '話の前に質問はありません。', 'まず話を聞いてください。それから、質問と選択肢を聞いて、１から４の中から、最もよいものを一つ選んでください。');
        break;
      case 'sokki':
        lines.push('問題４では、問題用紙に何も印刷されていません。', 'まず文を聞いてください。', 'それから、その返事を聞いて、１から３の中から、最もよいものを一つ選んでください。', '選択肢は問題用紙に印刷されていません。');
        break;
      default:
        lines.push('聴解問題。よく聞いてください。');
    }

    lines.push('では、始めます。', '');

    if (mondaiType === 'kadai' || mondaiType === 'point') {
      lines.push(question.question.replace(/[「」『』【】]/g, ' ').trim(), '');
    }

    if (question.passage) {
      // Loại bỏ các thẻ trong ngoặc và dấu ngoặc kép
      let cleaned = question.passage
        .replace(/（\s*）/g, '')
        .replace(/\【[^】]*\】/g, '')
        .replace(/[「」『』]/g, ' ')
        .trim();

      const passageLines = cleaned.split(/[\n\r]+/);
      for (let l of passageLines) {
        let t = l.trim();
        if (!t) continue;

        // Bỏ các dòng rỗng dạng: 社員「（　　）」hoặc ( )
        if (/^(社員|男|女|学生|相手)\s*[:：]?\s*[\(（\s]*[\)）]?\s*$/.test(t)) continue;
        if (/tiếp tục tình huống|câu tiếp theo/i.test(t)) continue;

        // Loại bỏ nhãn người nói ở đầu câu (ví dụ: "男：", "女：", "課長：", "店員：")
        t = t.replace(/^(男|女|男の人|女の人|男性|女性|客|店員|先生|学生|課長|部長|社員|A|B|C|甲|乙|先輩|後輩|ナレーション)[：:\s]/, '').trim();

        if (t) lines.push(t);
      }
      lines.push('');
    }

    if (mondaiType === 'gaiyo' || mondaiType === 'other') {
      lines.push(question.question.replace(/[「」『』]/g, ' ').trim(), '');
      const numWords = ['１番', '２番', '３番', '４番'];
      (question.options || []).forEach((opt, idx) => {
        lines.push(`${numWords[idx] || `${idx+1}番`}、 ${opt.replace(/[「」]/g, '').trim()}、`);
      });
    }

    

    if (mondaiType === 'sokki') {
      const numWords = ['一番', '二番', '三番', '四番'];
      question.options.slice(0, 3).forEach((opt, idx) => {
        lines.push(`${numWords[idx] || `${idx+1}番`}。 ${opt.replace(/[「」『』]/g, '').trim()}。`);
      });
    }

    return lines.join('\n').trim();
  }

  static async getOrGenerateAudio(questionId: string): Promise<Buffer | null> {
    this.ensureCacheDir();
    const filePath = path.join(AUDIO_CACHE_DIR, `${questionId}.mp3`);

    if (fs.existsSync(filePath)) {
      try {
        const buf = fs.readFileSync(filePath);
        if (buf.length > 20000) return buf;
        fs.unlinkSync(filePath);
      } catch (e) { console.warn('Cache error, regenerating:', e); }
    }

    const question = await prisma.jlptQuestion.findUnique({ where: { id: questionId } });
    if (!question || question.section !== 'listening') return null;

    let optionsList: string[] = [];
    try { optionsList = JSON.parse(question.options || '[]'); } catch { optionsList = []; }

    // Kế thừa bài nghe đầy đủ nếu câu hỏi là câu con trong bài nghe tổ hợp (Mondai 5) hoặc bị thiếu passage
    let effectivePassage = question.passage;
    const isContinuation = (p?: string | null) =>
      !p || p.trim().length < 50 || /tiếp tục|câu tiếp/i.test(p);

    if (isContinuation(effectivePassage)) {
      const prevQuestion = await prisma.jlptQuestion.findFirst({
        where: {
          examId: question.examId,
          section: 'listening',
          orderNumber: { lt: question.orderNumber },
          passage: { not: null }
        },
        orderBy: { orderNumber: 'desc' }
      });
      if (prevQuestion && prevQuestion.passage && !isContinuation(prevQuestion.passage)) {
        effectivePassage = prevQuestion.passage;
      }
    }

    const script = this.buildSpeechScript({
      orderNumber: question.orderNumber, subTypeLabel: question.subTypeLabel,
      question: question.question, passage: effectivePassage, options: optionsList
    });

    const sentences = splitTextIntoTtsSentences(script);
    const audioChunks: Buffer[] = [];

    for (const sentence of sentences) {
      if (!sentence.trim()) continue;
      try {
        const chunk = await fetchTtsChunk(sentence);
        audioChunks.push(chunk);
        await new Promise(r => setTimeout(r, 150));
      } catch (err) { console.error(`TTS chunk failed: "${sentence}"`, err); }
    }

    if (audioChunks.length === 0) return null;
    const fullBuffer = Buffer.concat(audioChunks);
    try { fs.writeFileSync(filePath, fullBuffer); } catch (e) { console.error('Cache write failed:', e); }
    return fullBuffer;
  }

  static clearAudioCache(): number {
    this.ensureCacheDir();
    const files = fs.readdirSync(AUDIO_CACHE_DIR).filter(f => f.endsWith('.mp3'));
    files.forEach(f => { try { fs.unlinkSync(path.join(AUDIO_CACHE_DIR, f)); } catch {} });
    return files.length;
  }
}
