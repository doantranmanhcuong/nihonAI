import axios from 'axios';
import { prisma } from '../../core/prisma.service';
import { ConstituentKanji } from './vocabulary.types';

function isJapaneseKanji(char: string): boolean {
  if (!char || char.trim().length === 0) return false;
  const code = char.charCodeAt(0);
  return (code >= 0x4e00 && code <= 0x9faf) || (code >= 0x3400 && code <= 0x4dbf);
}

export class DictionaryApiService {
  /**
   * Gọi Open Dictionary API (Jisho.org) để tra cứu từ điển mở rộng (>180.000 từ vựng)
   * Tự động phân tích Hán Việt từ CSDL MySQL và bóc tách chữ Hán cấu thành
   */
  static async searchExternalJisho(query: string): Promise<any[]> {
    try {
      const url = `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(query.trim())}`;
      const response = await axios.get(url, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      if (!response.data || !Array.isArray(response.data.data)) {
        return [];
      }

      const results: any[] = [];
      const rawList = response.data.data.slice(0, 10); // Lấy tối đa 10 kết quả phù hợp nhất

      // TỐI ƯU SQL: Thu thập toàn bộ Hán tự trong 10 từ kết quả để truy vấn 1 lần duy nhất
      const allExtKanjiChars = new Set<string>();
      for (const item of rawList) {
        const jp = item.japanese?.[0] || {};
        const word = jp.word || jp.reading || '';
        for (const char of word) {
          if (isJapaneseKanji(char)) allExtKanjiChars.add(char);
        }
      }

      const dbKanjis = await prisma.kanji.findMany({
        where: { character: { in: Array.from(allExtKanjiChars) } }
      });
      const kanjiMap = new Map(dbKanjis.map((k) => [k.character, k]));

      for (const item of rawList) {
        const jp = item.japanese?.[0] || {};
        const word = jp.word || jp.reading;
        const reading = jp.reading || word;

        if (!word) continue;

        // Bóc tách chữ Hán và tra cứu âm Hán Việt tương ứng từ kanjiMap O(1)
        const constituentKanjis: ConstituentKanji[] = [];
        const hanVietParts: string[] = [];

        for (const char of word) {
          if (isJapaneseKanji(char)) {
            const dbKanji = kanjiMap.get(char);
            if (dbKanji) {
              constituentKanjis.push({
                character: dbKanji.character,
                hanViet: dbKanji.hanViet,
                meaningVi: dbKanji.meaningVi,
                strokeCount: dbKanji.strokeCount,
                jlptLevel: dbKanji.jlptLevel
              });
              hanVietParts.push(dbKanji.hanViet);
            }
          }
        }

        const hanViet = hanVietParts.length > 0 ? hanVietParts.join(' ') : null;

        // Trích xuất cấp độ JLPT từ tags của Jisho (vd: "jlpt-n3" -> "N3")
        let jlptLevel = 'N3';
        if (Array.isArray(item.jlpt) && item.jlpt.length > 0) {
          const matched = item.jlpt[0].match(/n([1-5])/i);
          if (matched) {
            jlptLevel = `N${matched[1]}`;
          }
        }

        // Định dạng nghĩa
        const senses = item.senses || [];
        const engDefs = senses
          .slice(0, 3)
          .map((s: any) => s.english_definitions?.join(', '))
          .filter(Boolean);
        const meaningText = engDefs.join('; ') || 'Từ vựng tiếng Nhật mở rộng';

        const pos = senses[0]?.parts_of_speech?.slice(0, 2).join(', ') || 'Từ vựng';

        const formattedWord = {
          id: `ext-${item.slug || word}-${Math.random().toString(36).substring(2, 7)}`,
          word,
          reading,
          romaji: null,
          hanViet,
          meaningVi: meaningText,
          jlptLevel,
          curriculum: 'EXTERNAL',
          lesson: null,
          topic: 'Từ điển mở rộng Jisho API',
          partOfSpeech: pos,
          pitchAccent: null,
          exampleJp: null,
          exampleVi: null,
          constituentKanjis,
          isExternal: true
        };

        results.push(formattedWord);

        // Cache-Aside Pattern: Tự động lưu ngầm vào MySQL để lần sau truy vấn siêu tốc 0ms
        this.cacheWordAsync(formattedWord);
      }

      return results;
    } catch (error: any) {
      console.warn('Lưu ý: Không thể kết nối Jisho API hoặc quá thời gian chờ (timeout):', error?.message);
      return [];
    }
  }

  /**
   * Lưu đệm (Cache-aside) từ vựng tra được từ API vào MySQL
   */
  private static async cacheWordAsync(item: any) {
    try {
      const exists = await prisma.vocabulary.findFirst({
        where: { word: item.word, reading: item.reading }
      });

      if (!exists) {
        await prisma.vocabulary.create({
          data: {
            word: item.word,
            reading: item.reading,
            hanViet: item.hanViet,
            meaningVi: item.meaningVi,
            jlptLevel: item.jlptLevel,
            curriculum: 'EXTERNAL',
            topic: 'Từ điển mở rộng',
            partOfSpeech: item.partOfSpeech
          }
        });
      }
    } catch (e) {
      // Bỏ qua lỗi cache để không ảnh hưởng luồng chính
    }
  }
}
