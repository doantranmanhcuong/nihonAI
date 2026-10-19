export interface RubyPart {
  base: string;
  rt?: string;
}

export interface TokenChunk {
  id: string;
  baseText: string;
  rtText?: string;
  rubyParts: RubyPart[];
  charStart: number;
  charEnd: number;
  charCount: number;
  startRatio: number;
  endRatio: number;
  isUnderlined?: boolean;
  keyword?: { word: string; reading?: string; meaning?: string; meaningVi?: string; pos?: string; level?: string; };
}

// Đếm số lượng phách âm (Mora) trong tiếng Nhật
export function countMoras(text: string): number {
  if (!text) return 0;
  // Âm ghép (きゃ, しゅ, ちょ...) tính là 1 mora, âm ngắt っ/ー tính là 1 mora, ký tự kana cơ bản là 1 mora
  const moras = text.match(/[ぁ-んァ-ン][ゃゅょぁぃぅぇぉゎャュョァィゥェォヮ]?|[ーっッ]/g);
  return Math.max(1, moras ? moras.length : text.length);
}

const KANJI_CHAR = '[\\u4e00-\\u9faf\\u3005\\u3400-\\u4dbf]';

// Trợ từ chỉ gắn vào CUỐI danh từ / động từ (Bunsetsu grouping) để Web Speech API không bị nhảy cóc
const ATTACHABLE_PARTICLES = [
  'などの', 'などに', 'としても', 'として',
  'からは', 'までは', 'では', 'には', 'との', 'での', 'より',
  'から', 'まで', 'だけ', 'ほど', 'ばかり', 'など',
  'は', 'が', 'を', 'に', 'へ', 'で', 'と', 'の', 'も', 'や', 'ね', 'よ'
];

// Các cụm ngữ pháp/kết thúc câu dài ưu tiên giữ nguyên
const GRAMMAR_PATTERNS = [
  'できるようになりました', 'ようになりました', 'てしまいました',
  'られている', 'られます', 'れている', 'れます', 'ています', 'ていた', 'でした',
  'ました', 'なので', 'だから', 'けれど', 'だけど', 'ので', 'から', 'けど',
  'として', 'について', 'によって', 'において', 'に対し', 'ことなく',
  'だけでなく', 'さらには', 'かつては'
];

// Phân tích câu tiếng Nhật thành các từ/cụm từ chuẩn xác và gắn Furigana trực tiếp lên từng Hán tự
export function parseSentenceTokens(
  japaneseText: string,
  furiganaHtml?: string,
  keywords: Array<{ word: string; reading?: string; meaning?: string; meaningVi?: string; pos?: string; level?: string }> = []
): TokenChunk[] {
  const cleanJapanese = (japaneseText || '').replace(/【\/?下線】/g, '');

  // Kiểm tra an toàn: Nếu câu gốc có chữ Hán mà furigana lại không có chữ Hán và không có cú pháp [..] hay <ruby>
  // (AI trả về thuần Hiragana) thì BẮT BUỘC giữ nguyên câu tiếng Nhật gốc để không làm mất chữ Hán của bài báo
  const hasKanjiInJp = new RegExp(KANJI_CHAR).test(cleanJapanese);
  const hasKanjiInFuri = new RegExp(KANJI_CHAR).test(furiganaHtml || '');
  const hasRubyMarkup = (furiganaHtml || '').includes('[') || (furiganaHtml || '').includes('<ruby>');

  let rawFuri = cleanJapanese;
  if (furiganaHtml && (hasRubyMarkup || !hasKanjiInJp || hasKanjiInFuri)) {
    rawFuri = furiganaHtml;
  }

  // 1. Chuẩn hóa định dạng 漢字[かんじ] sang <ruby>漢字<rt>かんじ</rt></ruby>
  // Hỗ trợ cả cụm nhiều chữ Hán đi kèm 1 ngoặc đọc như 東京[とうきょう] hay 1 chữ như 日[に]本[ほん]
  let normalized = rawFuri.replace(
    new RegExp(`(${KANJI_CHAR}+)\\[([ぁ-んァ-ヶー]+)\\]`, 'g'),
    '<ruby>$1<rt>$2</rt></ruby>'
  );

  // 2. Tách các phân đoạn có đánh dấu gạch chân 【下線】...【/下線】
  const segments = normalized.split(/(【下線】.*?【\/下線】)/g);
  const rawChunks: {
    baseText: string;
    rubyParts: RubyPart[];
    weight: number;
    isUnderlined?: boolean;
    keyword?: any;
  }[] = [];

  for (const seg of segments) {
    if (!seg) continue;
    const isUnderlined = seg.startsWith('【下線】') && seg.endsWith('【/下線】');
    const cleanSeg = isUnderlined ? seg.replace(/【\/?下線】/g, '') : seg;

    // Tách thành các nguyên tử:
    // - <ruby>K<rt>R</rt></ruby>
    // - Dấu câu: 、。！？「」…
    // - Chuỗi văn bản thuần (Kana / Romaji / Số)
    const atomRegex = new RegExp(
      `<ruby>([^<]+)<rt>(.*?)<\\/rt><\\/ruby>|([、。！？「」…])|([^<、。！？「」…]+)`,
      'g'
    );

    const atoms: Array<{ type: 'ruby' | 'punct' | 'text'; base: string; rt?: string }> = [];
    let m: RegExpExecArray | null;
    while ((m = atomRegex.exec(cleanSeg)) !== null) {
      if (m[1] !== undefined && m[2] !== undefined) {
        atoms.push({ type: 'ruby', base: m[1], rt: m[2] });
      } else if (m[3] !== undefined) {
        atoms.push({ type: 'punct', base: m[3] });
      } else if (m[4] !== undefined) {
        atoms.push({ type: 'text', base: m[4] });
      }
    }

    let i = 0;
    while (i < atoms.length) {
      const current = atoms[i];

      // Trường hợp 1: Dấu câu (gắn vào cụm từ trước nếu là dấu kết thúc / ngắt câu)
      if (current.type === 'punct') {
        const isClosingOrTerminal = ['。', '！', '？', '、', '」', '』', '…'].includes(current.base);
        if (isClosingOrTerminal && rawChunks.length > 0) {
          const prev = rawChunks[rawChunks.length - 1];
          prev.baseText += current.base;
          prev.rubyParts.push({ base: current.base });
          // Dấu phẩy 、 thêm nhịp nghỉ nhẹ (0.3), dấu chấm/hỏi/cảm thêm nhịp thở siêu nhẹ (0.05)
          prev.weight += (current.base === '、' ? 0.3 : 0.05);
        } else {
          rawChunks.push({
            baseText: current.base,
            rubyParts: [{ base: current.base }],
            weight: 0.1,
            isUnderlined
          });
        }
        i++;
        continue;
      }

      // Trường hợp 2: Khớp từ vựng ưu tiên (trong vocabularies của bài đọc)
      let matchedKeyword: any = null;
      let matchSpan = 0;
      for (const kw of keywords) {
        if (!kw.word) continue;
        let testStr = '';
        let count = 0;
        for (let j = i; j < atoms.length && count < 8; j++) {
          testStr += atoms[j].base;
          count++;
          if (testStr === kw.word) {
            matchedKeyword = kw;
            matchSpan = count;
            break;
          }
        }
        if (matchedKeyword) break;
      }

      if (matchedKeyword && matchSpan > 0) {
        const rubyParts: RubyPart[] = [];
        let baseText = '';
        for (let s = 0; s < matchSpan; s++) {
          const at = atoms[i + s];
          baseText += at.base;
          rubyParts.push({ base: at.base, rt: at.rt });
        }
        i += matchSpan;

        // Gắn trợ từ Bunsetsu sau từ vựng nếu có (VD: 食料品 + や)
        if (i < atoms.length && atoms[i].type === 'text') {
          for (const p of ATTACHABLE_PARTICLES) {
            if (atoms[i].base.startsWith(p)) {
              rubyParts.push({ base: p });
              baseText += p;
              atoms[i].base = atoms[i].base.slice(p.length);
              if (!atoms[i].base) i++;
              break;
            }
          }
        }

        rawChunks.push({
          baseText,
          rubyParts,
          weight: Math.max(1, countMoras(matchedKeyword.reading || baseText)),
          isUnderlined,
          keyword: matchedKeyword
        });
        continue;
      }

      // Trường hợp 3: Hán tự (ruby atom)
      if (current.type === 'ruby') {
        const rubyParts: RubyPart[] = [{ base: current.base, rt: current.rt }];
        let baseText = current.base;
        i++;

        // Gộp tất cả kanji liên tiếp của cùng 1 từ ghép (VD: 食料品, 公共料金, 住民票, 公的証明書, 多機能)
        while (i < atoms.length && atoms[i].type === 'ruby' && rubyParts.length < 6) {
          rubyParts.push({ base: atoms[i].base, rt: atoms[i].rt });
          baseText += atoms[i].base;
          i++;
        }

        // Gắn Okurigana của động từ / tính từ (VD: 暮[く]らし, 買[か]う, 支[ささ]え)
        if (i < atoms.length && atoms[i].type === 'text') {
          const nextText = atoms[i].base;
          const okuriMatch = nextText.match(/^([ぁ-ん]{1,3}?)(?=[はがをにへとでのもや、。！？「」…]|$)/);
          if (okuriMatch && okuriMatch[1] && !ATTACHABLE_PARTICLES.includes(okuriMatch[1])) {
            const okuri = okuriMatch[1];
            rubyParts.push({ base: okuri });
            baseText += okuri;
            atoms[i].base = nextText.slice(okuri.length);
            if (!atoms[i].base) i++;
          }
        }

        // Gắn trợ từ Bunsetsu (VD: 食料品 + や, 日用品 + を, 公共料金 + の, 現在 + では, 住民票 + などの)
        // Tránh nhầm lẫn động từ できる
        if (i < atoms.length && atoms[i].type === 'text') {
          const nextText = atoms[i].base;
          if (!nextText.startsWith('できる') && !nextText.startsWith('できるよう')) {
            for (const p of ATTACHABLE_PARTICLES) {
              if (nextText.startsWith(p)) {
                rubyParts.push({ base: p });
                baseText += p;
                atoms[i].base = nextText.slice(p.length);
                if (!atoms[i].base) i++;
                break;
              }
            }
          }
        }

        const rtCombined = rubyParts.map(p => p.rt || p.base).join('');
        rawChunks.push({
          baseText,
          rubyParts,
          weight: Math.max(1, countMoras(rtCombined)),
          isUnderlined
        });
        continue;
      }

      // Trường hợp 4: Chuỗi văn bản thuần (Kana / Katakana / Romaji)
      if (current.type === 'text') {
        let text = current.base;
        i++;

        while (text.length > 0) {
          // 4a. Khớp cụm ngữ pháp dài trước
          let grammarMatch: string | null = null;
          for (const g of GRAMMAR_PATTERNS) {
            if (text.startsWith(g)) {
              grammarMatch = g;
              break;
            }
          }

          if (grammarMatch) {
            rawChunks.push({
              baseText: grammarMatch,
              rubyParts: [{ base: grammarMatch }],
              weight: Math.max(1, countMoras(grammarMatch)),
              isUnderlined
            });
            text = text.slice(grammarMatch.length);
            continue;
          }

          // 4b. Từ ngoại lai / Katakana / Romaji (VD: ATM + まで -> ATMまで, コンビニエンスストア + は)
          const nonKanaMatch = text.match(/^([a-zA-Z0-9]+|[ァ-ヴー]+)/);
          if (nonKanaMatch && nonKanaMatch[1]) {
            let word = nonKanaMatch[1];
            text = text.slice(word.length);

            for (const p of ATTACHABLE_PARTICLES) {
              if (text.startsWith(p)) {
                word += p;
                text = text.slice(p.length);
                break;
              }
            }

            rawChunks.push({
              baseText: word,
              rubyParts: [{ base: word }],
              weight: Math.max(1, countMoras(word)),
              isUnderlined
            });
            continue;
          }

          // 4c. Cụm Kana thông thường: lấy 2-4 ký tự + gắn trợ từ ở đuôi nếu có
          let takeLen = Math.min(3, text.length);
          if (text.length <= 4) {
            takeLen = text.length;
          }

          let chunk = text.slice(0, takeLen);
          text = text.slice(takeLen);

          // Nếu phần còn lại bắt đầu bằng 1 trợ từ ngắn, gắn luôn vào chunk
          for (const p of ['は', 'が', 'を', 'に', 'で', 'と', 'の', 'も', 'や']) {
            if (text.startsWith(p) && text.length <= 2) {
              chunk += p;
              text = text.slice(p.length);
              break;
            }
          }

          rawChunks.push({
            baseText: chunk,
            rubyParts: [{ base: chunk }],
            weight: Math.max(1, countMoras(chunk)),
            isUnderlined
          });
        }
      }
    }
  }

  if (rawChunks.length === 0) {
    const cleanFallback = cleanJapanese;
    for (const char of cleanFallback) {
      rawChunks.push({
        baseText: char,
        rubyParts: [{ base: char }],
        weight: 1
      });
    }
  }

  let searchCursor = 0;
  const totalWeight = rawChunks.reduce((acc, c) => acc + c.weight, 0);
  let accumulatedWeight = 0;

  return rawChunks.map((c, idx) => {
    const startRatio = accumulatedWeight / Math.max(0.1, totalWeight);
    accumulatedWeight += c.weight;
    const endRatio = accumulatedWeight / Math.max(0.1, totalWeight);

    let charStart = cleanJapanese.indexOf(c.baseText, searchCursor);
    if (charStart === -1) {
      charStart = searchCursor;
    }
    const charEnd = charStart + c.baseText.length;
    searchCursor = charEnd;

    const matchedKw = c.keyword || keywords.find(
      (k) =>
        k.word === c.baseText ||
        c.baseText.includes(k.word) ||
        k.word.includes(c.baseText)
    );

    const rtText = c.rubyParts.some(p => p.rt)
      ? c.rubyParts.map(p => p.rt || p.base).join('')
      : undefined;

    return {
      id: `tok-${idx}-${c.baseText}`,
      baseText: c.baseText,
      rtText,
      rubyParts: c.rubyParts,
      charStart,
      charEnd,
      charCount: c.baseText.length,
      startRatio,
      endRatio,
      isUnderlined: c.isUnderlined,
      keyword: matchedKw
    };
  });
}
