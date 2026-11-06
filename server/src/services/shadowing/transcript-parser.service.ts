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
   * Dịch hàng loạt (Batch Translation) từ tiếng Nhật sang tiếng Việt qua Google Translate GTX (Miễn phí 100%, 0 tốn quota AI)
   */
  static async translateBatchGtx(sentences: string[]): Promise<string[]> {
    if (!sentences || sentences.length === 0) return [];
    const results: string[] = new Array(sentences.length).fill('');
    const CHUNK_SIZE = 25;

    for (let i = 0; i < sentences.length; i += CHUNK_SIZE) {
      const chunk = sentences.slice(i, i + CHUNK_SIZE);
      const joined = chunk.map((s) => s.replace(/\r?\n/g, ' ').trim()).join('\n');
      try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=vi&dt=t&q=${encodeURIComponent(joined)}`;
        const res = await fetch(url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
          },
          signal: AbortSignal.timeout(6000)
        });
        if (res.ok) {
          const data: any = await res.json();
          if (Array.isArray(data) && Array.isArray(data[0])) {
            const fullTranslated = data[0].map((part: any) => (part && part[0] ? String(part[0]) : '')).join('');
            const lines = fullTranslated.split('\n');
            for (let j = 0; j < chunk.length; j++) {
              results[i + j] = (lines[j] || '').trim();
            }
          }
        }
      } catch (err) {
        console.warn('[GTX-Batch] Translation warning:', (err as any)?.message);
      }
    }

    return results;
  }

  /**
   * Xử lý toàn bộ transcript: Tốc độ cực cao (< 300ms kèm dịch nghĩa tiếng Việt miễn phí qua GTX)
   */
  static async enrichTranscript(
    raw: RawTranscriptSnippet[]
  ): Promise<EnrichedSubtitleItem[]> {
    const tokenizer = await this.getTokenizer();
    const merged = this.mergeRawSegments(raw, tokenizer);
    const vietnameseTranslations = await this.translateBatchGtx(merged.map((s) => s.text));

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
        vietnamese: vietnameseTranslations[idx] || '',
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
   * Trích xuất phụ đề YouTube gốc bằng thuần Node.js (Innertube ANDROID/IOS + JSON3/XML)
   */
  static async fetchYouTubeTranscript(
    youtubeId: string
  ): Promise<{ isGenerated: boolean; snippets: RawTranscriptSnippet[]; videoDetails?: { title?: string; shortDescription?: string; lengthSeconds?: number; author?: string } }> {
    let cookieHeader = '';
    let apiKey = '';
    let videoDetails: { title?: string; shortDescription?: string; lengthSeconds?: number; author?: string } | undefined;

    // 1. Lấy INNERTUBE_API_KEY và Session Cookies từ trang Watch của YouTube
    try {
      const watchRes = await fetch(`https://www.youtube.com/watch?v=${youtubeId}`, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          'Accept-Language': 'ja-JP,ja;q=0.9,en-US;q=0.8'
        },
        signal: AbortSignal.timeout(8000)
      });
      const setCookies = (watchRes.headers as any).getSetCookie
        ? (watchRes.headers as any).getSetCookie()
        : [];
      cookieHeader = setCookies.map((c: string) => c.split(';')[0]).join('; ');
      const html = await watchRes.text();
      const keyMatch = html.match(/"INNERTUBE_API_KEY":\s*"([a-zA-Z0-9_-]+)"/);
      if (keyMatch && keyMatch[1]) {
        apiKey = keyMatch[1];
      }
    } catch (err) {
      console.warn('[YouTubeTranscript] Watch HTML fetch warning:', (err as any)?.message);
    }

    // 2. Gọi Innertube Player API (ANDROID -> IOS) để lấy captionTracks không dính exp=xpe
    const clients = [
      { clientName: 'ANDROID', clientVersion: '20.10.38' },
      { clientName: 'IOS', clientVersion: '20.10.4' }
    ];

    let captionTracks: any[] = [];
    for (const client of clients) {
      try {
        const playerUrl = apiKey
          ? `https://www.youtube.com/youtubei/v1/player?key=${apiKey}&prettyPrint=false`
          : 'https://www.youtube.com/youtubei/v1/player?prettyPrint=false';
        const playerRes = await fetch(playerUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(cookieHeader ? { Cookie: cookieHeader } : {})
          },
          body: JSON.stringify({
            context: { client },
            videoId: youtubeId
          }),
          signal: AbortSignal.timeout(8000)
        });
        const playerData: any = await playerRes.json();
        if (playerData?.videoDetails && !videoDetails) {
          videoDetails = {
            title: playerData.videoDetails.title,
            shortDescription: playerData.videoDetails.shortDescription,
            lengthSeconds: Number(playerData.videoDetails.lengthSeconds) || undefined,
            author: playerData.videoDetails.author
          };
        }
        const tracks = playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
        if (Array.isArray(tracks) && tracks.length > 0) {
          captionTracks = tracks;
          break;
        }
      } catch {}
    }

    if (captionTracks.length > 0) {
      // Ưu tiên phụ đề tiếng Nhật thủ công (chuẩn 100% thời gian âm thanh) trước phụ đề tự động (ASR)
      const manualJa = captionTracks.find(
        (t: any) => t.languageCode?.startsWith('ja') && t.kind !== 'asr'
      );
      const asrJa = captionTracks.find(
        (t: any) => t.languageCode?.startsWith('ja') && t.kind === 'asr'
      );
      const translatableTrack = captionTracks.find((t: any) => t.isTranslatable && t.baseUrl);
      const selected = manualJa || asrJa || translatableTrack;

      if (selected && selected.baseUrl) {
        const isGenerated = selected.kind === 'asr';
        let cleanBaseUrl = String(selected.baseUrl).replace('&fmt=srv3', '');
        if (!selected.languageCode?.startsWith('ja')) {
          cleanBaseUrl += '&tlang=ja';
        }

        // 2a. Thử định dạng JSON3 để lấy mốc mili-giây chính xác của từng câu/từ
        try {
          const json3Url = cleanBaseUrl.includes('fmt=')
            ? cleanBaseUrl.replace(/fmt=[^&]+/, 'fmt=json3')
            : `${cleanBaseUrl}&fmt=json3`;
          const jRes = await fetch(json3Url, {
            headers: { ...(cookieHeader ? { Cookie: cookieHeader } : {}) },
            signal: AbortSignal.timeout(8000)
          });
          if (jRes.ok) {
            const jData: any = await jRes.json();
            if (jData && Array.isArray(jData.events)) {
              const rawEvents: Array<{ startMs: number; durationMs: number; text: string }> = [];
              for (const ev of jData.events) {
                if (!ev.segs || typeof ev.tStartMs !== 'number') continue;
                const text = ev.segs
                  .map((s: any) => s.utf8 || '')
                  .join('')
                  .replace(/\n+/g, ' ')
                  .replace(/\s+/g, ' ')
                  .trim();
                if (!text || /^(\[.*?\]|（.*?）|\(.*?\)|♪+)$/.test(text)) continue;
                rawEvents.push({
                  startMs: ev.tStartMs,
                  durationMs: ev.dDurationMs || 2500,
                  text
                });
              }

              const snippets: RawTranscriptSnippet[] = rawEvents.map((ev, i) => {
                const nextStart = rawEvents[i + 1]?.startMs;
                const rawEnd = ev.startMs + ev.durationMs;
                const endMs = nextStart ? Math.min(rawEnd, nextStart) : rawEnd;
                return {
                  startMs: ev.startMs,
                  endMs: Math.max(ev.startMs + 200, endMs),
                  text: ev.text
                };
              });

              if (snippets.length > 0) {
                return { isGenerated, snippets, videoDetails };
              }
            }
          }
        } catch {}

        // 2b. Fallback sang định dạng XML chuẩn của timedtext
        try {
          const xmlRes = await fetch(cleanBaseUrl, {
            headers: { ...(cookieHeader ? { Cookie: cookieHeader } : {}) },
            signal: AbortSignal.timeout(8000)
          });
          if (xmlRes.ok) {
            const xml = await xmlRes.text();
            const regex = /<text start="([\d.]+)"(?:\s+dur="([\d.]+)")?[^>]*>([\s\S]*?)<\/text>/g;
            const rawXml: Array<{ startMs: number; durationMs: number; text: string }> = [];
            let m: RegExpExecArray | null;
            while ((m = regex.exec(xml)) !== null) {
              const startMs = Math.round(parseFloat(m[1]) * 1000);
              const durMs = Math.round(parseFloat(m[2] || '2.5') * 1000);
              const text = m[3]
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/<[^>]+>/g, '')
                .replace(/\n+/g, ' ')
                .trim();
              if (!text || /^(\[.*?\]|（.*?）|\(.*?\)|♪+)$/.test(text)) continue;
              rawXml.push({ startMs, durationMs: durMs, text });
            }
            const snippets: RawTranscriptSnippet[] = rawXml.map((ev, i) => {
              const nextStart = rawXml[i + 1]?.startMs;
              const rawEnd = ev.startMs + ev.durationMs;
              const endMs = nextStart ? Math.min(rawEnd, nextStart) : rawEnd;
              return {
                startMs: ev.startMs,
                endMs: Math.max(ev.startMs + 200, endMs),
                text: ev.text
              };
            });
            if (snippets.length > 0) {
              return { isGenerated, snippets, videoDetails };
            }
          }
        } catch {}
      }
    }

    // 3. Fallback qua cụm Invidious Public Caption Mirrors (Vượt hoàn toàn giới hạn 429 IP của Render, 0 tốn AI)
    const invidiousMirrors = [
      'https://inv.nadeko.net',
      'https://yewtu.be',
      'https://invidious.nerdvpn.de'
    ];
    for (const host of invidiousMirrors) {
      try {
        const capRes = await fetch(`${host}/api/v1/captions/${youtubeId}`, {
          signal: AbortSignal.timeout(5000)
        });
        if (!capRes.ok) continue;
        const capData: any = await capRes.json();
        const captions: any[] = capData?.captions || [];
        const jaCap = captions.find(
          (c: any) =>
            c.language_code?.startsWith('ja') ||
            c.label?.toLowerCase().includes('japanese') ||
            c.label?.includes('日本語')
        );
        if (jaCap && jaCap.url) {
          const vttUrl = jaCap.url.startsWith('http') ? jaCap.url : `${host}${jaCap.url}`;
          const vttRes = await fetch(vttUrl, { signal: AbortSignal.timeout(5000) });
          if (vttRes.ok) {
            const vttText = await vttRes.text();
            const snippets = this.parseSrtOrVtt(vttText);
            if (snippets.length > 0) {
              return {
                isGenerated: Boolean(jaCap.label?.toLowerCase().includes('auto')),
                snippets,
                videoDetails
              };
            }
          }
        }
      } catch {}
    }

    return { isGenerated: false, snippets: [], videoDetails };
  }
}
