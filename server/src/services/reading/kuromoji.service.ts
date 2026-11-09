import * as kuromoji from 'kuromoji';
import { TranscriptParserService } from '../shadowing/transcript-parser.service';

export interface CuratedGrammarPattern {
  pattern: string;
  regex: RegExp;
  level: string;
  meaningVi: string;
  structure: string;
  explanation: string;
}

export const CURATED_JLPT_GRAMMAR_PATTERNS: CuratedGrammarPattern[] = [
  {
    pattern: '〜によって・〜による',
    regex: /(によって|により|による|によれば)/,
    level: 'N3',
    meaningVi: 'Do / Bằng cách / Tùy thuộc vào / Theo nguồn tin',
    structure: 'Danh từ + によって / による + Danh từ',
    explanation: 'Diễn tả nguyên nhân, phương tiện cách thức, sự khác biệt tùy theo đối tượng, hoặc dẫn nguồn thông tin (theo thống kê/báo cáo).'
  },
  {
    pattern: '〜について・〜につき',
    regex: /(について|についての|に関して|に関する)/,
    level: 'N3',
    meaningVi: 'Về / Liên quan đến vấn đề...',
    structure: 'Danh từ + について / に関して',
    explanation: 'Dùng khi nêu chủ đề, đối tượng đang được bàn luận, nghiên cứu, điều tra hoặc thông báo trong bài báo.'
  },
  {
    pattern: '〜として(は)',
    regex: /(として|としては|としても|としての)/,
    level: 'N3',
    meaningVi: 'Với tư cách là / Coi như là / Dưới góc độ là',
    structure: 'Danh từ + として',
    explanation: 'Xác định tư cách, vai trò, vị trí, danh nghĩa hoặc phân loại của một chủ thể trong xã hội.'
  },
  {
    pattern: '〜に対して・〜に対する',
    regex: /(に対して|に対し|に対する)/,
    level: 'N3',
    meaningVi: 'Đối với / Hướng tới / Ngược lại với',
    structure: 'Danh từ + に対して / に対する + Danh từ',
    explanation: 'Diễn tả thái độ, hành động hướng tới một đối tượng, hoặc đặt hai sự việc đối lập nhau để so sánh.'
  },
  {
    pattern: '〜ため(に)',
    regex: /(ためだ|ためです|ために|ための|ため、)/,
    level: 'N3',
    meaningVi: 'Vì / Do (nguyên nhân) hoặc Để (mục đích)',
    structure: 'Động từ / Tính từ / Danh từ + の + ため(に)',
    explanation: 'Trong văn viết và báo chí, cấu trúc này thường dùng để giải thích nguyên nhân dẫn đến kết quả hoặc mục đích của hành động.'
  },
  {
    pattern: '〜ようになる・〜ようになる',
    regex: /(ようになる|ようになった|ようになっている|ようになると|ようになります)/,
    level: 'N4',
    meaningVi: 'Trở nên / Bắt đầu có thể / Dần hình thành trạng thái mới',
    structure: 'Động từ (V-る / V-ない) + ようになる',
    explanation: 'Diễn tả sự biến đổi về trạng thái, thói quen hoặc khả năng theo thời gian (từ chỗ không thể/không làm sang có thể/thường làm).'
  },
  {
    pattern: '〜ことができる',
    regex: /(ことができる|ことができます|ことができ、|することが可能)/,
    level: 'N4',
    meaningVi: 'Có thể làm được việc gì đó',
    structure: 'Động từ thể từ điển (V-る) + ことができる',
    explanation: 'Biểu thị năng lực, khả năng hoặc điều kiện cho phép thực hiện một hành động.'
  },
  {
    pattern: '〜に伴って・〜に伴い',
    regex: /(に伴って|に伴い|に伴う|につれて|にしたがって)/,
    level: 'N2',
    meaningVi: 'Cùng với / Kéo theo sự biến đổi của...',
    structure: 'Danh từ / V-る + に伴って (につれて)',
    explanation: 'Diễn tả hai sự thay đổi diễn ra song hành: khi A thay đổi hoặc phát triển thì B cũng biến đổi kéo theo.'
  },
  {
    pattern: '〜を通じて・〜を通して',
    regex: /(を通じて|を通して|を通じた|を通した)/,
    level: 'N2',
    meaningVi: 'Thông qua / Xuyên suốt (thời gian, phương tiện)',
    structure: 'Danh từ + を通じて / を通して',
    explanation: 'Chỉ phương tiện trung gian giúp đạt được kết quả, hoặc chỉ trạng thái kéo dài suốt một khoảng thời gian (quanh năm).'
  },
  {
    pattern: '〜だけでなく・〜ばかりでなく',
    regex: /(だけでなく|ばかりでなく|のみならず)/,
    level: 'N3',
    meaningVi: 'Không chỉ... mà còn...',
    structure: 'Danh từ / Động từ / Tính từ + だけでなく (のみならず)',
    explanation: 'Nhấn mạnh phạm vi mở rộng: không chỉ dừng lại ở A mà còn bao gồm cả B.'
  },
  {
    pattern: '〜おそれがある・〜かねない',
    regex: /(おそれがある|恐れがある|かねない|かねません)/,
    level: 'N2',
    meaningVi: 'Có nguy cơ / E rằng sẽ xảy ra hậu quả xấu',
    structure: 'Động từ V-る / Danh từ + の + おそれがある (V-ます + かねない)',
    explanation: 'Thường xuất hiện trong bản tin thời tiết, y tế, kinh tế để cảnh báo về một rủi ro hoặc khả năng tiêu cực có thể xảy ra.'
  },
  {
    pattern: '〜をめぐって・〜をめぐる',
    regex: /(をめぐって|をめぐり|をめぐる)/,
    level: 'N2',
    meaningVi: 'Xoay quanh vấn đề / Tranh luận xung quanh...',
    structure: 'Danh từ + をめぐって / をめぐる + Danh từ',
    explanation: 'Dùng khi có nhiều ý kiến, cuộc thảo luận hoặc tranh chấp xoay quanh một sự kiện, chính sách hoặc vấn đề xã hội.'
  },
  {
    pattern: '〜において・〜における',
    regex: /(において|においても|における)/,
    level: 'N2',
    meaningVi: 'Tại / Trong (lĩnh vực, thời điểm, hoàn cảnh)',
    structure: 'Danh từ + において / における + Danh từ',
    explanation: 'Dạng trang trọng của trợ từ で/に, dùng phổ biến trong báo chí và văn bản hành chính để chỉ phạm vi, lĩnh vực hoặc bối cảnh.'
  },
  {
    pattern: '〜とみられる・〜とみられている',
    regex: /(とみられる|と見られる|とみられている|と見られている|とみられています)/,
    level: 'N2',
    meaningVi: 'Được cho là / Được nhận định là',
    structure: 'Mệnh đề thông thường + とみられる',
    explanation: 'Cấu trúc đặc trưng của báo chí Nhật Bản (NHK, Asahi...) dùng để nêu nhận định, phán đoán khách quan dựa trên thông tin thu thập được.'
  },
  {
    pattern: '〜方針（ほうしん）・〜見通し（みとおし）',
    regex: /(方針を固め|方針を示し|見通しとなっ|見通しだ|見込みだ|見込みです)/,
    level: 'N2',
    meaningVi: 'Dự kiến / Theo phương hướng / Triển vọng sẽ...',
    structure: 'Động từ V-る + 方針だ / 見通しだ / 見込みだ',
    explanation: 'Thuật ngữ báo chí chỉ kế hoạch, chủ trương sắp thực hiện của chính phủ/tổ chức hoặc dự báo diễn biến sắp tới.'
  }
];

export class KuromojiService {
  /**
   * Tái sử dụng chung 1 instance Kuromoji Tokenizer với TranscriptParserService
   * Tiết kiệm ~45MB RAM trên Render Free Tier
   */
  static async getTokenizer(): Promise<kuromoji.Tokenizer<kuromoji.IpadicFeatures>> {
    return await TranscriptParserService.getTokenizer();
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

  static formatPosVi(pos: string): string {
    if (pos === '名詞') return 'Danh từ';
    if (pos === '動詞') return 'Động từ';
    if (pos === '形容詞') return 'Tính từ';
    if (pos === '副詞') return 'Phó từ';
    return 'Từ vựng';
  }

  static async analyzeText(text: string): Promise<{ furiganaText: string; vocabularies: any[]; grammars: any[] }> {
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

          let tail = '';
          while (
            surface.length > 0 &&
            reading.length > 0 &&
            !this.isKanji(surface[surface.length - 1]) &&
            surface[surface.length - 1] === reading[reading.length - 1]
          ) {
            tail = surface[surface.length - 1] + tail;
            surface = surface.slice(0, -1);
            reading = reading.slice(0, -1);
          }

          let head = '';
          while (
            surface.length > 0 &&
            reading.length > 0 &&
            !this.isKanji(surface[0]) &&
            surface[0] === reading[0]
          ) {
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

        // --- 2. Trích xuất Vocabulary ứng viên (Ưu tiên từ có chữ Hán >= 2 ký tự) ---
        const pos = token.pos;
        const base = token.basic_form && token.basic_form !== '*' ? token.basic_form : token.surface_form;
        if (!base || base.length < 2 || !this.hasKanji(base)) continue;

        if (pos === '名詞' || pos === '動詞' || pos === '形容詞') {
          if (
            token.pos_detail_1 !== '数' &&
            token.pos_detail_1 !== '非自立' &&
            token.pos_detail_1 !== '接尾' &&
            token.pos_detail_1 !== '代名詞'
          ) {
            if (!vocabMap.has(base)) {
              const readingHira = token.reading ? this.katakanaToHiragana(token.reading) : '';
              vocabMap.set(base, {
                word: base,
                reading: readingHira,
                meaning: '',
                meaningVi: '',
                pos: this.formatPosVi(pos),
                level: 'N3',
                examples: []
              });
            }
          }
        }
      }

      // --- 3. Nhận diện Ngữ pháp JLPT thực tế có trong văn bản ---
      const rawSentences = text
        .split(/(?<=[。！？\n])/)
        .map((s) => s.trim())
        .filter(Boolean);

      for (const pat of CURATED_JLPT_GRAMMAR_PATTERNS) {
        if (grammarMap.size >= 6) break;
        const matchedSentence = rawSentences.find((s) => pat.regex.test(s));
        if (matchedSentence || pat.regex.test(text)) {
          grammarMap.set(pat.pattern, {
            grammar: pat.pattern,
            grammarPoint: pat.pattern,
            meaning: pat.meaningVi,
            meaningVi: pat.meaningVi,
            structure: pat.structure,
            level: pat.level,
            explanation: pat.explanation,
            excerpt: matchedSentence || '',
            examples: []
          });
        }
      }

      return {
        furiganaText,
        vocabularies: Array.from(vocabMap.values()).slice(0, 15),
        grammars: Array.from(grammarMap.values()).slice(0, 6)
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
