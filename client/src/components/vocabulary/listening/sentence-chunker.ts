export interface SentenceItem {
  id: string;
  originalSentence: string;
  vietnamese: string;
  chunks: string[];
}

/**
 * Thuật toán phân rã câu tiếng Nhật thành các cụm ngữ nghĩa tự nhiên (Phrasal Chunks)
 * Dựa trên cấu trúc ngữ pháp (trợ từ, dấu phẩy, liên từ) mà không cần phụ thuộc vào từ điển cố định
 */
export function segmentSentence(sentence: string, word: string): string[] {
  const clean = sentence.replace(/[。]/g, '').trim();
  if (!clean) return [word];

  // 1. Tách theo dấu phẩy nếu câu có phân tách vế
  let initialParts: string[] = [];
  if (clean.includes('、')) {
    initialParts = clean
      .split('、')
      .map((p) => p.trim())
      .filter(Boolean);
  } else {
    initialParts = [clean];
  }

  const finalChunks: string[] = [];
  const particles = ['についての', 'について', 'ために', 'ことが', 'ように', 'から', 'まで', 'は', 'が', 'を', 'に', 'で', 'と'];

  for (const part of initialParts) {
    if (part.length <= 11) {
      finalChunks.push(part);
      continue;
    }

    let splitIdx = -1;
    for (const p of particles) {
      const idx = part.indexOf(p);
      if (idx >= 2 && idx + p.length <= part.length - 2) {
        splitIdx = idx + p.length;
        break;
      }
    }

    if (splitIdx > 0) {
      const p1 = part.substring(0, splitIdx).trim();
      const p2 = part.substring(splitIdx).trim();
      if (p1.length >= 2 && p2.length >= 2) {
        finalChunks.push(p1);
        finalChunks.push(p2);
      } else {
        finalChunks.push(part);
      }
    } else {
      finalChunks.push(part);
    }
  }

  return finalChunks.length >= 2 ? finalChunks : [clean];
}
