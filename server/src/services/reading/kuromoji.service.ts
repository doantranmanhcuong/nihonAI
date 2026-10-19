import * as kuromoji from 'kuromoji';
import * as path from 'path';

export class KuromojiService {
  private static tokenizer: kuromoji.Tokenizer<kuromoji.IpadicFeatures> | null = null;
  private static initPromise: Promise<void> | null = null;

  static async getTokenizer(): Promise<kuromoji.Tokenizer<kuromoji.IpadicFeatures>> {
    if (this.tokenizer) {
      return this.tokenizer;
    }

    if (!this.initPromise) {
      this.initPromise = new Promise((resolve, reject) => {
        const dictPath = path.join(process.cwd(), 'node_modules', 'kuromoji', 'dict');
        kuromoji.builder({ dicPath: dictPath }).build((err, tokenizer) => {
          if (err) {
            console.error('Kuromoji build error', err);
            reject(err);
          } else {
            this.tokenizer = tokenizer;
            resolve();
          }
        });
      });
    }

    await this.initPromise;
    return this.tokenizer!;
  }

  static isKanji(ch: string): boolean {
    return (ch >= '\u4e00' && ch <= '\u9faf') || (ch >= '\u3400' && ch <= '\u4dbf');
  }

  static hasKanji(str: string): boolean {
    for (let i = 0; i < str.length; i++) {
      if (this.isKanji(str[i])) return true;
    }
    return false;
  }

  static katakanaToHiragana(kata: string): string {
    return kata.replace(/[\u30A1-\u30F6]/g, function (match) {
      const chr = match.charCodeAt(0) - 0x60;
      return String.fromCharCode(chr);
    });
  }

  static async analyzeText(text: string): Promise<{ furiganaText: string, vocabularies: any[], grammars: any[] }> {
    try {
      const tokenizer = await this.getTokenizer();
      const tokens = tokenizer.tokenize(text);
      let furiganaText = '';
      
      const vocabMap = new Map<string, any>();
      const grammarMap = new Map<string, any>();

      for (const token of tokens) {
        // --- 1. Tạo Furigana ---
        if (this.hasKanji(token.surface_form) && token.reading) {
          const readingHiragana = this.katakanaToHiragana(token.reading);
          let surface = token.surface_form;
          let reading = readingHiragana;
          
          let tail = "";
          while(surface.length > 0 && reading.length > 0 && !this.isKanji(surface[surface.length - 1]) && surface[surface.length - 1] === reading[reading.length - 1]) {
              tail = surface[surface.length - 1] + tail;
              surface = surface.slice(0, -1);
              reading = reading.slice(0, -1);
          }
          
          let head = "";
          while(surface.length > 0 && reading.length > 0 && !this.isKanji(surface[0]) && surface[0] === reading[0]) {
              head += surface[0];
              surface = surface.slice(1);
              reading = reading.slice(1);
          }

          if (surface.length > 0 && reading.length > 0) {
             furiganaText += `${head}<ruby>${surface}<rt>${reading}</rt></ruby>${tail}`;
          } else {
             furiganaText += token.surface_form;
          }
        } else {
          furiganaText += token.surface_form;
        }
        
        // --- 2. Trích xuất Vocabulary & Grammar ---
        const pos = token.pos;           // Danh từ, Động từ, Trợ từ...
        const base = token.basic_form;    // Thể từ điển
        
        // Bỏ qua các từ không có basic_form hợp lệ
        if (!base || base === '*') continue;
        
        // Vocabulary: Danh từ, Động từ, Tính từ
        if (pos === '名詞' || pos === '動詞' || pos === '形容詞') {
          // Bỏ qua các danh từ quá chung chung hoặc số đếm
          if (token.pos_detail_1 !== '数' && token.pos_detail_1 !== '非自立' && token.pos_detail_1 !== '接尾') {
            if (!vocabMap.has(base)) {
              vocabMap.set(base, {
                word: base,
                reading: token.reading ? this.katakanaToHiragana(token.reading) : '',
                meaning: `[${pos}] Ý nghĩa của ${base}`, // Dùng default vì không gọi AI
                meaningVi: `[${pos}] Nghĩa của ${base}`,
                pos: pos,
                level: 'N3',
                examples: []
              });
            }
          }
        }
        // Grammar: Trợ từ, Trợ động từ, Liên từ
        else if (pos === '助詞' || pos === '助動詞' || pos === '接続詞') {
           if (!grammarMap.has(base)) {
              grammarMap.set(base, {
                grammar: base,
                meaning: `[${pos}] Ngữ pháp ${base}`,
                meaningVi: `[${pos}] ${base}`,
                level: 'N3',
                explanation: `Cấu trúc / Trợ từ ${base}`,
                examples: []
              });
           }
        }
      }
      
      return {
        furiganaText,
        vocabularies: Array.from(vocabMap.values()).slice(0, 10), // Giới hạn 10 từ vựng
        grammars: Array.from(grammarMap.values()).slice(0, 5)     // Giới hạn 5 ngữ pháp
      };
    } catch (e) {
      console.error('Error in KuromojiService.analyzeText:', e);
      return { furiganaText: text, vocabularies: [], grammars: [] };
    }
  }

  static async addFurigana(text: string): Promise<string> {
    const res = await this.analyzeText(text);
    return res.furiganaText;
  }
}
