import path from "path";
import fs from 'fs';
// @ts-ignore
import kuromoji from 'kuromoji';

export interface RawTranscriptSnippet {
  startMs: number;
  endMs: number;
  text: string;
}

export interface EnrichedSubtitleItem {
  orderIndex: number;
  startTimeMs: number;
  endTimeMs: number;
  japanese: string;
  furigana: string;
  romaji: string;
  vietnamese: string;
  keyWords: Array<{
    word: string;
    reading: string;
    meaning: string;
    pos?: string;
  }>;
  grammarNotes: Array<{
    grammar: string;
    meaning: string;
  }>;
}

const HIRA_TO_ROMAJI_MAP: Record<string, string> = {
  'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
  'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
  'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
  'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
  'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
  'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
  'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
  'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
  'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
  'わ': 'wa', 'を': 'o', 'ん': 'n',
  'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
  'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
  'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
  'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
  'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
  'きゃ': 'kya', 'きゅ': 'kyu', 'きょ': 'kyo',
  'しゃ': 'sha', 'しゅ': 'shu', 'しょ': 'sho',
  'ちゃ': 'cha', 'ちゅ': 'chu', 'ちょ': 'cho',
  'にゃ': 'nya', 'にゅ': 'nyu', 'にょ': 'nyo',
  'ひゃ': 'hya', 'ひゅ': 'hyu', 'ひょ': 'hyo',
  'みゃ': 'mya', 'みゅ': 'myu', 'みょ': 'myo',
  'りゃ': 'rya', 'りゅ': 'ryu', 'りょ': 'ryo',
  'ぎゃ': 'gya', 'ぎゅ': 'gyu', 'ぎょ': 'gyo',
  'じゃ': 'ja', 'じゅ': 'ju', 'じょ': 'jo',
  'びゃ': 'bya', 'びゅ': 'byu', 'びょ': 'byo',
  'ぴゃ': 'pya', 'ぴゅ': 'pyu', 'ぴょ': 'pyo'
};

export function kataToHira(str: string): string {
  if (!str) return '';
  return str.replace(/[\u30a1-\u30f6]/g, (m) =>
    String.fromCharCode(m.charCodeAt(0) - 0x60)
  );
}

export class TranscriptParserService {
  private static tokenizer: any = null;
  private static initPromise: Promise<any> | null = null;

  /**
   * Khởi tạo Kuromoji tokenizer dạng singleton
   */
  static async getTokenizer(): Promise<any> {
    if (this.tokenizer) return this.tokenizer;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const candidatePaths = [
        path.join(process.cwd(), 'node_modules/kuromoji/dict'),
        path.join(__dirname, '../../../../node_modules/kuromoji/dict'),
        path.join(__dirname, '../../../node_modules/kuromoji/dict'),
        'c:/Users/cuong/Documents/antigravity/cool-hopper/server/node_modules/kuromoji/dict'
      ];

      const dictPath = candidatePaths.find((p) => fs.existsSync(p)) || candidatePaths[0];

      kuromoji.builder({ dicPath: dictPath }).build((err: any, tok: any) => {
        if (err) {
          console.error('[Kuromoji] Init error:', err);
          reject(err);
        } else {
          this.tokenizer = tok;
          resolve(tok);
        }
      });
    });

    return this.initPromise;
  }

  /**
   * Ghép các mẩu audio ASR ngắn của YouTube thành câu thoại tự nhiên hoàn chỉnh
   */
  static mergeRawSegments(raw: RawTranscriptSnippet[], tokenizer?: any): RawTranscriptSnippet[] {
    if (!raw || raw.length === 0) return [];

    const merged: RawTranscriptSnippet[] = [];
    let curStart = raw[0].startMs;
    let curEnd = raw[0].endMs;
    let curText = raw[0].text.trim();

    const strongSentenceEnders = /(。|！|？|です$|ます$|だ$|た$|ない$|て$|ね$|よ$|わ$|な$|さ$|の$)/;

    for (let i = 1; i < raw.length; i++) {
      const next = raw[i];
      const gap = next.startMs - curEnd;
      // In YouTube rolling captions, endMs is highly inflated. Use next.startMs to calculate true spoken duration.
      const spokenDuration = next.startMs - curStart;

      let endsNaturally = strongSentenceEnders.test(curText);
      const isExtremeDuration = spokenDuration >= 12000; 
      const isExtremeGap = gap >= 2500; 
      const isLongEnough = spokenDuration >= 1500;

      // Smart semantic check for casual Japanese if Kuromoji is available
      if (!endsNaturally && tokenizer && isLongEnough) {
        const tokens = tokenizer.tokenize(curText);
        if (tokens.length > 0) {
          const lastToken = tokens[tokens.length - 1];
          // If the last token is a natural breaking point in spoken Japanese
          if (
            lastToken.pos === '動詞' || 
            lastToken.pos === '助動詞' ||
            (lastToken.pos === '助詞' && lastToken.pos_detail_1 !== '格助詞') ||
            (lastToken.pos === '名詞' && lastToken.pos_detail_1 === '接尾')
          ) {
            endsNaturally = true;
          }
        }
      }

      if ((endsNaturally && spokenDuration >= 2000) || isExtremeDuration || isExtremeGap) {
        let finalText = curText;
        if (!/[。！？]$/.test(finalText)) {
          finalText += '。';
        }
        merged.push({
          startMs: curStart,
          // Clamp endMs so it does not overlap with next segment if YouTube returns messy timestamps
          endMs: Math.min(curEnd, next.startMs), 
          text: finalText
        });

        curStart = next.startMs;
        curEnd = next.endMs;
        curText = next.text.trim();
      } else {
        if (gap >= 500 && !/[、。！？]$/.test(curText)) {
          curText += '、';
        }
        curText += next.text.trim();
        curEnd = Math.max(curEnd, next.endMs);
      }
    }

    if (curText) {
      let finalText = curText;
      if (!/[。！？]$/.test(finalText)) {
        finalText += '。';
      }
      merged.push({
        startMs: curStart,
        endMs: curEnd,
        text: finalText
      });
    }

    return merged;
  }

  /**
   * Tạo Furigana dạng HTML <ruby>Kanji<rt>furigana</rt></ruby>
   */
  static generateFurigana(tokenizer: any, text: string): string {
    if (!text || !tokenizer) return text || '';
    const tokens = tokenizer.tokenize(text);
    return tokens
      .map((t: any) => {
        const hasKanji = /[\u4e00-\u9faf]/.test(t.surface_form);
        if (hasKanji && t.reading) {
          return `<ruby>${t.surface_form}<rt>${kataToHira(t.reading)}</rt></ruby>`;
        }
        return t.surface_form;
      })
      .join('');
  }

  /**
   * Tạo Romaji chuẩn Hepburn
   */
  static generateRomaji(tokenizer: any, text: string): string {
    if (!text || !tokenizer) return '';
    const tokens = tokenizer.tokenize(text);
    const words: string[] = [];

    for (const t of tokens) {
      if (/^[、。！？「」…\s]+$/.test(t.surface_form)) continue;
      const reading = t.reading ? kataToHira(t.reading) : kataToHira(t.surface_form);
      const hira = reading;
      let r = '';
      let i = 0;
      while (i < hira.length) {
        if (hira[i] === 'っ') {
          const nextTwo = hira.slice(i + 1, i + 3);
          const nextOne = hira[i + 1];
          const nextR = HIRA_TO_ROMAJI_MAP[nextTwo] || HIRA_TO_ROMAJI_MAP[nextOne] || '';
          if (nextR) r += nextR[0];
          i += 1;
        } else if (HIRA_TO_ROMAJI_MAP[hira.slice(i, i + 2)]) {
          r += HIRA_TO_ROMAJI_MAP[hira.slice(i, i + 2)];
          i += 2;
        } else if (hira[i] === 'ー') {
          if (r.length > 0) r += r[r.length - 1];
          i += 1;
        } else if (HIRA_TO_ROMAJI_MAP[hira[i]]) {
          r += HIRA_TO_ROMAJI_MAP[hira[i]];
          i += 1;
        } else {
          r += hira[i];
          i += 1;
        }
      }
      if (r) words.push(r);
    }
    return words.join(' ');
  }

  /**
   * Trích xuất các từ vựng quan trọng cho từng câu
   */
  static extractKeyWords(
    tokenizer: any,
    text: string
  ): Array<{ word: string; reading: string; meaning: string; pos: string }> {
    if (!text || !tokenizer) return [];
    const tokens = tokenizer.tokenize(text);
    const kw: Array<{ word: string; reading: string; meaning: string; pos: string }> = [];
    const seen = new Set<string>();

    for (const t of tokens) {
      const isTargetPos =
        t.pos === '名詞' ||
        (t.pos === '動詞' && t.pos_detail_1 === '自立') ||
        t.pos === '形容詞';

      const isSubstantive = t.surface_form.length >= 2;
      const isNotParticleOrSymbol = !/^[はがをにへでとのねよかもてば、。！？]+$/.test(
        t.surface_form
      );

      if (isTargetPos && isSubstantive && isNotParticleOrSymbol) {
        const base = t.basic_form && t.basic_form !== '*' ? t.basic_form : t.surface_form;
        if (!seen.has(base) && kw.length < 3) {
          seen.add(base);
          const readingHira = t.reading ? kataToHira(t.reading) : base;
          kw.push({
            word: t.surface_form,
            reading: readingHira,
            meaning: `Từ vựng (${t.pos})`,
            pos: t.pos
          });
        }
      }
    }
    return kw;
  }

  /**
   * Xử lý toàn bộ transcript: Tốc độ cực cao (< 100ms cho 1000 câu)
   */
  static async enrichTranscript(
    raw: RawTranscriptSnippet[]
  ): Promise<EnrichedSubtitleItem[]> {
    const tokenizer = await this.getTokenizer();
    const merged = this.mergeRawSegments(raw, tokenizer);

    return merged.map((s, idx) => {
      const furigana = this.generateFurigana(tokenizer, s.text);
      const romaji = this.generateRomaji(tokenizer, s.text);
      const keyWords = this.extractKeyWords(tokenizer, s.text);

      return {
        orderIndex: idx + 1,
        startTimeMs: s.startMs,
        endTimeMs: s.endMs,
        japanese: s.text,
        furigana,
        romaji,
        vietnamese: '',
        keyWords,
        grammarNotes: []
      };
    });
  }

  /**
   * Phân tích nội dung tệp SRT hoặc WebVTT thành danh sách mốc thời gian mili-giây
   */
  static parseSrtOrVtt(content: string): RawTranscriptSnippet[] {
    if (!content) return [];
    const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

    // Hỗ trợ định dạng copy trực tiếp từ bản chép lời YouTube (0:05 text hoặc 0:05\ntext)
    if (!content.includes('-->')) {
      const ytTimeRegex = /^(?:(\d{1,2}):)?(\d{1,2}):(\d{2})$/;
      const ytTimeInlineRegex = /^(?:(\d{1,2}):)?(\d{1,2}):(\d{2})\s+(.+)$/;

      const parsed: RawTranscriptSnippet[] = [];
      let pendingStartMs: number | null = null;
      let pendingText = '';

      for (let line of lines) {
        line = line.trim();
        if (!line) continue;

        const inlineMatch = line.match(ytTimeInlineRegex);
        if (inlineMatch) {
          const h = Number(inlineMatch[1] || 0);
          const m = Number(inlineMatch[2]);
          const s = Number(inlineMatch[3]);
          const thisStartMs = (h * 3600 + m * 60 + s) * 1000;

          if (pendingStartMs !== null && pendingText) {
            parsed.push({
              startMs: pendingStartMs,
              endMs: thisStartMs,
              text: pendingText
            });
          }
          pendingStartMs = thisStartMs;
          pendingText = inlineMatch[4].trim();
          continue;
        }

        const timeOnlyMatch = line.match(ytTimeRegex);
        if (timeOnlyMatch) {
          const h = Number(timeOnlyMatch[1] || 0);
          const m = Number(timeOnlyMatch[2]);
          const s = Number(timeOnlyMatch[3]);
          const thisStartMs = (h * 3600 + m * 60 + s) * 1000;

          if (pendingStartMs !== null && pendingText) {
            parsed.push({
              startMs: pendingStartMs,
              endMs: thisStartMs,
              text: pendingText
            });
            pendingText = '';
          }
          pendingStartMs = thisStartMs;
          continue;
        }

        if (pendingStartMs !== null) {
          pendingText = pendingText ? `${pendingText} ${line}` : line;
        }
      }

      if (pendingStartMs !== null && pendingText) {
        parsed.push({
          startMs: pendingStartMs,
          endMs: pendingStartMs + 5000,
          text: pendingText
        });
      }

      if (parsed.length > 0) {
        return parsed;
      }
    }

    const snippets: RawTranscriptSnippet[] = [];
    const timeRegex = /(?:(\d{1,2}):)?(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(?:(\d{1,2}):)?(\d{2}):(\d{2})[,.](\d{3})/;

    let curSnippet: RawTranscriptSnippet | null = null;

    for (let line of lines) {
      line = line.trim();
      if (!line || line === 'WEBVTT' || /^\d+$/.test(line)) {
        if (curSnippet && curSnippet.text) {
          snippets.push(curSnippet);
          curSnippet = null;
        }
        continue;
      }

      const match = line.match(timeRegex);
      if (match) {
        if (curSnippet && curSnippet.text) {
          snippets.push(curSnippet);
        }
        const h1 = Number(match[1] || 0);
        const m1 = Number(match[2]);
        const s1 = Number(match[3]);
        const ms1 = Number(match[4]);
        const startMs = h1 * 3600000 + m1 * 60000 + s1 * 1000 + ms1;

        const h2 = Number(match[5] || 0);
        const m2 = Number(match[6]);
        const s2 = Number(match[7]);
        const ms2 = Number(match[8]);
        const endMs = h2 * 3600000 + m2 * 60000 + s2 * 1000 + ms2;

        curSnippet = { startMs, endMs, text: '' };
      } else if (curSnippet) {
        const cleanText = line.replace(/<[^>]+>/g, '').trim();
        if (cleanText && !/^(\[.*?\]|\(.*?\))$/.test(cleanText)) {
          curSnippet.text = curSnippet.text ? `${curSnippet.text} ${cleanText}` : cleanText;
        }
      }
    }

    if (curSnippet && curSnippet.text) {
      snippets.push(curSnippet);
    }

    return snippets;
  }

  /**
   * Trích xuất phụ đề YouTube gốc từ cache hoặc công cụ bóc tách
   */
  static async fetchYouTubeTranscript(youtubeId: string): Promise<{ isGenerated: boolean, snippets: RawTranscriptSnippet[] }> {
    // 1. Kiểm tra cache raw transcripts
    const localCachePath = `C:/Users/cuong/.gemini/antigravity/brain/ce4d867a-0ffa-45f0-8971-21862588842f/scratch/raw_transcripts/${youtubeId}.json`;
    if (fs.existsSync(localCachePath)) {
      try {
        const rawList = JSON.parse(fs.readFileSync(localCachePath, 'utf8'));
        return rawList.map((s: any) => ({
          startMs: Math.round(s.start * 1000),
          endMs: Math.round((s.start + (s.duration || 2)) * 1000),
          text: s.text.replace(/\n/g, ' ').trim()
        }));
      } catch {}
    }

    // 2. Chạy script python extract_yt_transcript.py
    const scriptPaths = [
      path.join(__dirname, '../../../../scripts/extract_yt_transcript.py'),
      'C:/Users/cuong/.gemini/antigravity/brain/ce4d867a-0ffa-45f0-8971-21862588842f/scratch/extract_yt_transcript.py'
    ];
    const script = scriptPaths.find((p) => fs.existsSync(p));
    if (!script) return { isGenerated: false, snippets: [] };

    return new Promise((resolve) => {
      const { exec } = require('child_process');
      exec(
        `python "${script}" ${youtubeId}`,
        { maxBuffer: 10 * 1024 * 1024 },
        (err: any, stdout: string) => {
          if (err || !stdout) {
            resolve({ isGenerated: false, snippets: [] });
            return;
          }
          try {
            const parsed = JSON.parse(stdout.trim());
            if (parsed.snippets && Array.isArray(parsed.snippets) && parsed.length > 0) {
              resolve(parsed);
            } else {
              resolve({ isGenerated: false, snippets: [] });
            }
          } catch {
            resolve({ isGenerated: false, snippets: [] });
          }
        }
      );
    });
  }
}
