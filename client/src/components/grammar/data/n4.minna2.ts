import { GrammarMasterItem } from '../grammar.types';

export const N4_MINNA_II: GrammarMasterItem[] = [
  // =========================================================================
  // BÀI 26: THỂ GIẢI THÍCH & NHẤN MẠNH VỚI NDESU
  // =========================================================================
  {
    id: 'n4-26-ndesu',
    lessonId: 'minna-26',
    lessonNumber: 26,
    lessonTitle: 'Bài 26: Thể giải thích & Nhấn mạnh với Ndesu',
    curriculum: 'MINNA',
    grammarPoint: '〜んです / 〜のです',
    reading: 'んです',
    romaji: 'ndesu',
    level: 'N4',
    category: 'cause',
    meaningVi: 'Giải thích nguyên nhân, lý do / Nhấn mạnh ý muốn nói',
    structure: 'Thể thông thường (Na/N + な) + んです',
    formality: 'Lịch sự',
    nuance: 'Dùng trong hội thoại nói hàng ngày để giải thích nguyên nhân, lý do cho sự việc đang xảy ra trước mắt, hoặc bày tỏ sự tò mò muốn biết thêm thông tin.',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'V (thông thường) + んです', example: '行く → 行くんです' },
      { partOfSpeech: 'Tính từ đuôi い', rule: 'A-い + んです', example: '痛い → 痛いんです' },
      { partOfSpeech: 'Tính từ đuôi な', rule: 'A-な + なんです', example: '暇 → 暇なんです' },
      { partOfSpeech: 'Danh từ', rule: 'N + なんです', example: '病気 → 病気なんです' }
    ],
    examples: [
      {
        id: 'ex-n4-26-1',
        japanese: 'どうして遅れたんですか。……バスが来なかったんです。',
        reading: 'どうしておくれたんですか。ばすがこなかったんです。',
        vietnamese: 'Tại sao bạn lại đến muộn vậy? ……Vì xe buýt không đến.'
      }
    ],
    cautionNotes: ['Lưu ý với Danh từ và Tính từ đuôi な phải thêm「な」trước んです (ví dụ: 暇なんです, không được nói 暇んです).'],
    quickQuiz: {
      question: '頭が（　）んです。少し休んでもいいですか。',
      questionVi: 'Tôi bị đau đầu. Tôi có thể nghỉ ngơi một chút được không?',
      options: ['痛い', '痛く', '痛かった', '痛くて'],
      optionsVi: ['Đau (thể thông thường)', 'Dạng chia ku', 'Quá khứ', 'Thể Te'],
      correctIndex: 0,
      explanation: 'Tính từ đuôi い đi trực tiếp với んです: 痛いんです.'
    }
  },
  {
    id: 'n4-26-ndesuga',
    lessonId: 'minna-26',
    lessonNumber: 26,
    lessonTitle: 'Bài 26: Thể giải thích & Nhấn mạnh với Ndesu',
    curriculum: 'MINNA',
    grammarPoint: '〜んですが、〜',
    reading: 'んですが',
    romaji: 'ndesu ga',
    level: 'N4',
    category: 'basics',
    meaningVi: 'Tôi muốn làm cái này nhưng mà... (Mở đầu câu nhờ vả, xin lời khuyên)',
    structure: '[Thể thông thường + んですが]、[Lời nhờ vả / Câu hỏi]',
    formality: 'Lịch sự',
    nuance: 'Dùng làm tiền đề mở đầu câu chuyện, nêu lên hoàn cảnh thực tế trước khi đưa ra lời yêu cầu, nhờ vả hoặc hỏi xin lời khuyên để tạo cảm giác lịch thiệp, không đột ngột.',
    formationRules: [
      { partOfSpeech: 'Thể thông thường', rule: 'Thể thông thường (Na/N + な) + んですが', example: '日本語を勉強したいんですが' }
    ],
    examples: [
      {
        id: 'ex-n4-26-2',
        japanese: '生け花を習いたいんですが、いい先生を紹介していただけませんか。',
        reading: 'いけばなをならいたいんですが、いいせんせいをしょうかいしていただけませんか。',
        vietnamese: 'Tôi muốn học cắm hoa ikebana, bạn có thể giới thiệu cho tôi một giáo viên tốt được không?'
      }
    ],
    quickQuiz: {
      question: '市役所へ行きたい（　）が、どのバスに乗ればいいですか。',
      questionVi: 'Tôi muốn đến tòa thị chính, tôi nên đi xe buýt nào thì được ạ?',
      options: ['んです', 'のです', 'です', 'ます'],
      optionsVi: ['Mở đầu nhờ vả (ndesu)', 'Văn viết', 'Khẳng định', 'Động từ'],
      correctIndex: 0,
      explanation: 'Mở đầu câu hỏi xin đường / lời khuyên dùng「〜んですが」.'
    }
  },
  {
    id: 'n4-26-itadakemasenka',
    lessonId: 'minna-26',
    lessonNumber: 26,
    lessonTitle: 'Bài 26: Thể giải thích & Nhấn mạnh với Ndesu',
    curriculum: 'MINNA',
    grammarPoint: 'V-ていただけませんか',
    reading: 'ていただけませんか',
    romaji: 'te itadakemasen ka',
    level: 'N4',
    category: 'keigo',
    meaningVi: 'Làm ơn... giúp tôi có được không ạ? (Nhờ vả lịch sự mức độ cao)',
    structure: 'V-て + いただけませんか',
    formality: 'Trang trọng',
    nuance: 'Mức độ lịch sự cao hơn nhiều so với V-てください và V-てもらえませんか. Thường dùng khi nhờ người lạ, cấp trên hoặc đối tác làm việc gì cho mình.',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'V-て + いただけませんか', example: '教えていただけませんか' }
    ],
    examples: [
      {
        id: 'ex-n4-26-3',
        japanese: 'コピー機の使い方が分からないので、教えていただけませんか。',
        reading: 'こぴーきのつかいかたがわからないので、おしえていただけませんか。',
        vietnamese: 'Tôi không biết cách dùng máy photocopy, bạn làm ơn chỉ giúp tôi được không ạ?'
      }
    ],
    quickQuiz: {
      question: 'すみませんが、もう一度（　）いただけませんか。',
      questionVi: 'Xin lỗi, bạn có thể nói lại một lần nữa được không ạ?',
      options: ['言って', '言う', '言った', '言わない'],
      optionsVi: ['Nói (thể Te)', 'Thể từ điển', 'Thể Ta', 'Thể Nai'],
      correctIndex: 0,
      explanation: 'Công thức V-て + いただけませんか: 言ってくださいませんか.'
    }
  },
  {
    id: 'n4-26-tara-ii-desuka',
    lessonId: 'minna-26',
    lessonNumber: 26,
    lessonTitle: 'Bài 26: Thể giải thích & Nhấn mạnh với Ndesu',
    curriculum: 'MINNA',
    grammarPoint: '[Từ để hỏi] V-たらいいですか',
    reading: 'たらいいですか',
    romaji: 'tara ii desu ka',
    level: 'N4',
    category: 'basics',
    meaningVi: 'Tôi nên làm gì / làm thế nào thì tốt ạ? (Hỏi xin lời khuyên, chỉ dẫn)',
    structure: '[Từ để hỏi (どこ, いつ, どう...)] + V-たらいいですか',
    formality: 'Lịch sự',
    nuance: 'Người nói gặp một vấn đề khó xử hoặc chưa biết cách xử lý và muốn người nghe chỉ cho cách giải quyết tối ưu nhất.',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'V-た + らいいですか', example: 'どうすればいいですか / どこで買ったらいいですか' }
    ],
    examples: [
      {
        id: 'ex-n4-26-4',
        japanese: 'パスポートを落としたんですが、どうしたらいいですか。',
        reading: 'ぱすぽーとをおとしたんですが、どうしたらいいですか。',
        vietnamese: 'Tôi bị rơi mất hộ chiếu rồi, tôi nên làm thế nào bây giờ ạ?'
      }
    ],
    quickQuiz: {
      question: '日本のお土産を買いたいんですが、どこで（　）らいいですか。',
      questionVi: 'Tôi muốn mua quà lưu niệm Nhật Bản, tôi nên mua ở đâu thì tốt ạ?',
      options: ['買ったら', '買うなら', '買えば', '買い'],
      optionsVi: ['Mua (tara)', 'Mua (nara)', 'Mua (ba)', 'Thân từ'],
      correctIndex: 0,
      explanation: 'Cấu trúc xin lời khuyên: どこで買ったらいいですか.'
    }
  },

  // =========================================================================
  // BÀI 27: ĐỘNG TỪ KHẢ NĂNG (可能動詞)
  // =========================================================================
  {
    id: 'n4-27-kanoukei',
    lessonId: 'minna-27',
    lessonNumber: 27,
    lessonTitle: 'Bài 27: Động từ Khả năng (可能動詞)',
    curriculum: 'MINNA',
    grammarPoint: 'Động từ Khả năng (可能形)',
    reading: 'かのうけい',
    romaji: 'kanoukei',
    level: 'N4',
    category: 'basics',
    meaningVi: 'Có thể làm gì (Biểu thị năng lực hoặc điều kiện hoàn cảnh)',
    structure: 'N が [V-khả năng] (Nhóm 1: u → e; Nhóm 2: ru → rareru; Nhóm 3: dekiru, korareru)',
    formality: 'Lịch sự',
    nuance: 'Chuyển đổi tân ngữ từ を sang trợ từ が. Biểu thị người nói có khả năng thực hiện hành động hoặc hoàn cảnh cho phép hành động diễn ra.',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'Nhóm 1: 書く → 書ける (kaku -> kakeru)', example: '書く → 書ける' },
      { partOfSpeech: 'Động từ', rule: 'Nhóm 2: 食べる → 食べられる', example: '食べる → 食べられる' },
      { partOfSpeech: 'Động từ', rule: 'Nhóm 3: する → できる、来る → こられる', example: 'する → できる' }
    ],
    examples: [
      {
        id: 'ex-n4-27-1',
        japanese: '私は漢字が少し読めます。',
        reading: 'わたしはかんじがすこしよめます。',
        vietnamese: 'Tôi có thể đọc được một chút chữ Hán.'
      }
    ],
    quickQuiz: {
      question: '刺身が（　）ますか。……はい、大好きです。',
      questionVi: 'Bạn có ăn được sashimi không? ……Vâng, tôi rất thích.',
      options: ['食べられ', '食べ', '食べる', '食べて'],
      optionsVi: ['Ăn được (khả năng nhóm 2)', 'Ăn (thường)', 'Thể từ điển', 'Thể Te'],
      correctIndex: 0,
      explanation: 'Động từ 食べる nhóm 2 chia thể khả năng là 食べられる: 食べられます.'
    }
  },
  {
    id: 'n4-27-mieru-kikoeru',
    lessonId: 'minna-27',
    lessonNumber: 27,
    lessonTitle: 'Bài 27: Động từ Khả năng (可能動詞)',
    curriculum: 'MINNA',
    grammarPoint: '〜が見えます / 〜が聞こえます',
    reading: 'がみえます / がきこえます',
    romaji: 'ga miemasu / ga kikoemasu',
    level: 'N4',
    category: 'basics',
    meaningVi: 'Nhìn thấy / Nghe thấy (Khả năng tự nhiên đập vào mắt/tai)',
    structure: 'N が 見えます / 聞こえます',
    formality: 'Lịch sự',
    nuance: 'Phân biệt: 見える/聞こえる là âm thanh/hình ảnh tự nhiên lọt vào mắt/tai không cần cố gắng. Còn 見られる/聞ける là có điều kiện/cơ hội để xem/nghe có chủ ý (ví dụ: xem phim ở rạp).',
    formationRules: [
      { partOfSpeech: 'Danh từ', rule: 'N + が + 見えます / 聞こえます', example: '窓から 海が 見えます' }
    ],
    examples: [
      {
        id: 'ex-n4-27-2',
        japanese: 'ここから富士山がよく見えます。',
        reading: 'ここからふじさんがよくみえます。',
        vietnamese: 'Từ đây có thể nhìn thấy rõ núi Phú Sĩ.'
      },
      {
        id: 'ex-n4-27-3',
        japanese: '隣の部屋からピアノの音が聞こえます。',
        reading: 'となりのへやからぴあののおとがきこえます。',
        vietnamese: 'Từ phòng bên cạnh tôi nghe thấy tiếng đàn piano.'
      }
    ],
    quickQuiz: {
      question: '天気がいいので、遠くの島が（　）。',
      questionVi: 'Vì thời tiết đẹp nên có thể nhìn thấy hòn đảo ở đằng xa.',
      options: ['見えます', '見られます', '見ます', '見せます'],
      optionsVi: ['Nhìn thấy tự nhiên', 'Có điều kiện để xem', 'Nhìn có ý chí', 'Cho xem'],
      correctIndex: 0,
      explanation: 'Hình ảnh tự nhiên đập vào tầm mắt: 見えます.'
    }
  },
  {
    id: 'n4-27-shika-nai',
    lessonId: 'minna-27',
    lessonNumber: 27,
    lessonTitle: 'Bài 27: Động từ Khả năng (可能動詞)',
    curriculum: 'MINNA',
    grammarPoint: 'N しか 〜 ません',
    reading: 'しか〜ません',
    romaji: 'shika ~ masen',
    level: 'N4',
    category: 'basics',
    meaningVi: 'Chỉ... (không có gì khác ngoài N, sắc thái tiếc nuối, ít ỏi)',
    structure: 'N + しか + V-phủ định (ません / ない)',
    formality: 'Lịch sự',
    nuance: 'Khác với だけ (đi với khẳng định, trung tính), しか bắt buộc phải đi với động từ thể phủ định và mang sắc thái người nói cảm thấy số lượng đó là quá ít, không đủ.',
    formationRules: [
      { partOfSpeech: 'Danh từ', rule: 'N / Lượng từ + しか + V-phủ định', example: '100円 しか ありません' }
    ],
    examples: [
      {
        id: 'ex-n4-27-4',
        japanese: '財布の中に千円しかありません。',
        reading: 'さいふのなかにせんえんしかありません。',
        vietnamese: 'Trong ví tôi chỉ còn có đúng một nghìn yên (ít ỏi).'
      }
    ],
    quickQuiz: {
      question: 'ひらがな（　）書けません。漢字はまだです。',
      questionVi: 'Tôi chỉ viết được chữ Hiragana thôi. Chữ Hán thì vẫn chưa.',
      options: ['しか', 'だけ', 'でも', 'ほど'],
      optionsVi: ['Chỉ (đi với phủ định)', 'Chỉ (đi với khẳng định)', 'Dù là', 'Bằng'],
      correctIndex: 0,
      explanation: 'Vế sau là phủ định 書けません nên bắt buộc dùng「しか」.'
    }
  },

  // =========================================================================
  // BÀI 28: HÀNH ĐỘNG ĐỒNG THỜI & THÓI QUEN
  // =========================================================================
  {
    id: 'n4-28-nagara',
    lessonId: 'minna-28',
    lessonNumber: 28,
    lessonTitle: 'Bài 28: Hành động đồng thời & Thói quen',
    curriculum: 'MINNA',
    grammarPoint: 'V1(bỏ ます) ながら V2',
    reading: 'ながら',
    romaji: 'nagara',
    level: 'N4',
    category: 'time',
    meaningVi: 'Vừa làm V1 vừa làm V2 (Hành động V2 là chính)',
    structure: 'V1(bỏ ます) + ながら、V2',
    formality: 'Lịch sự',
    nuance: 'Cùng một chủ ngữ thực hiện 2 hành động đồng thời trong cùng một khoảng thời gian. Hành động V2 ở vế sau luôn là hành động chính trọng tâm.',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'V1(thân ます) + ながら', example: '音楽を 聞きながら 勉強します' }
    ],
    examples: [
      {
        id: 'ex-n4-28-1',
        japanese: '音楽を聞きながら、勉強します。',
        reading: 'おんがくをききながら、べんきょうします。',
        vietnamese: 'Tôi vừa nghe nhạc vừa học bài.'
      }
    ],
    quickQuiz: {
      question: 'お茶を（　）ながら、話しましょう。',
      questionVi: 'Chúng ta vừa uống trà vừa nói chuyện nhé.',
      options: ['飲み', '飲む', '飲んで', '飲んだ'],
      optionsVi: ['Uống (bỏ masu)', 'Thể từ điển', 'Thể Te', 'Thể Ta'],
      correctIndex: 0,
      explanation: 'V-ながら đi với thân động từ bỏ ます: 飲みながら.'
    }
  },
  {
    id: 'n4-28-shi-shi',
    lessonId: 'minna-28',
    lessonNumber: 28,
    lessonTitle: 'Bài 28: Hành động đồng thời & Thói quen',
    curriculum: 'MINNA',
    grammarPoint: '〜し、〜し、〜',
    reading: 'し、〜し',
    romaji: 'shi, ~ shi',
    level: 'N4',
    category: 'cause',
    meaningVi: 'Vừa... lại vừa... / Không những... mà còn... (Liệt kê nhiều lý do)',
    structure: 'Thể thông thường (Na/N + だ) + し、Thể thông thường + し、(nguyên nhân/kết luận)',
    formality: 'Lịch sự',
    nuance: 'Dùng để liệt kê từ hai lý do trở lên cùng bổ nghĩa cho một đánh giá hoặc kết luận ở vế sau. Tạo cảm giác còn nhiều nguyên nhân khác nữa.',
    formationRules: [
      { partOfSpeech: 'Thể thông thường', rule: 'Thể thông thường + し', example: '料理も おいしいし、値段も 安いです' },
      { partOfSpeech: 'Tính từ đuôi な', rule: 'Na + だ + し', example: '親切だし' }
    ],
    examples: [
      {
        id: 'ex-n4-28-2',
        japanese: 'この店は料理も美味しいし、値段も安いし、いつも混んでいます。',
        reading: 'このみせはりょうりもおいしいし、ねだんもやすいし、いつもこんでいます。',
        vietnamese: 'Quán này món ăn vừa ngon, giá lại vừa rẻ, nên lúc nào cũng đông khách.'
      }
    ],
    quickQuiz: {
      question: '田中先生は熱心（　）し、教え方も上手です。',
      questionVi: 'Thầy Tanaka vừa nhiệt tình, cách dạy lại vừa hay.',
      options: ['だ', 'な', 'に', 'で'],
      optionsVi: ['Động từ đuôi Na đi với だし', 'Đi với な', 'Đi với に', 'Đi với で'],
      correctIndex: 0,
      explanation: 'Tính từ đuôi な đi với し cần giữ「だ」: 熱心だし.'
    }
  },

  // =========================================================================
  // BÀI 29: TRẠNG THÁI TỰ ĐỘNG TỪ & TIẾC NUỐI
  // =========================================================================
  {
    id: 'n4-29-jidoushi-te-iru',
    lessonId: 'minna-29',
    lessonNumber: 29,
    lessonTitle: 'Bài 29: Trạng thái tự động từ & Tiếc nuối',
    curriculum: 'MINNA',
    grammarPoint: 'N が V-ています (Tự động từ chỉ trạng thái)',
    reading: 'が〜ています',
    romaji: 'ga V-te imasu (jidoushi)',
    level: 'N4',
    category: 'basics',
    meaningVi: 'Vật N đang ở trạng thái... (kết quả của hành động tự nhiên trước đó)',
    structure: 'N が [Tự động từ]-ています',
    formality: 'Lịch sự',
    nuance: 'Miêu tả trạng thái hiện hữu ngay trước mắt của sự vật do tự nó diễn ra hoặc không rõ ai tác động (ví dụ: cửa đang mở, đèn đang sáng, túi bị rách).',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'Tự động từ thể Te + います', example: 'ドアが 開いています (Cửa đang mở)' }
    ],
    examples: [
      {
        id: 'ex-n4-29-1',
        japanese: '窓が割れていますから、危ないですよ。',
        reading: 'まどがわれていますから、あぶないですよ。',
        vietnamese: 'Cửa sổ đang bị vỡ đấy, nguy hiểm lắm.'
      }
    ],
    quickQuiz: {
      question: '電気が（　）ています。誰かいるのかな。',
      questionVi: 'Điện đang bật sáng. Có ai ở trong đó không nhỉ?',
      options: ['つい', 'つけ', 'けし', 'きえ'],
      optionsVi: ['Bật sáng tự động (tsuite iru)', 'Tha động từ bật', 'Tắt tha động', 'Tắt tự động'],
      correctIndex: 0,
      explanation: 'Tự động từ bật điện là つく (chia Te là ついて): 電気がついています.'
    }
  },
  {
    id: 'n4-29-te-shimau',
    lessonId: 'minna-29',
    lessonNumber: 29,
    lessonTitle: 'Bài 29: Trạng thái tự động từ & Tiếc nuối',
    curriculum: 'MINNA',
    grammarPoint: '〜てしまう',
    reading: 'てしまう',
    romaji: 'te shimau',
    level: 'N4',
    category: 'judgment',
    meaningVi: '1. Lỡ làm gì (Nuối tiếc) / 2. Làm xong trọn vẹn',
    structure: 'V-て + しまう / しまいました',
    formality: 'Thân mật',
    nuance: 'Diễn tả sự nuối tiếc, ân hận vì một sự việc ngoài ý muốn đã xảy ra, hoặc nhấn mạnh hành động đã được hoàn thành triệt để.',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'V-て + しまう', example: '忘れる → 忘れてしまう' }
    ],
    examples: [
      {
        id: 'ex-n4-29-2',
        japanese: '大切なパスポートを失くしてしまいました。',
        reading: 'たいせつなぱすぽーとをなくしてしまいました。',
        vietnamese: 'Tôi lỡ làm mất cuốn hộ chiếu quan trọng rồi.'
      }
    ],
    quickQuiz: {
      question: '電車の中にかばんを（　）しまいました。',
      questionVi: 'Tôi lỡ để quên chiếc cặp trong tàu điện mất rồi.',
      options: ['忘れて', '忘れる', '忘れた', '忘れない'],
      optionsVi: ['Quên (thể Te)', 'Thể từ điển', 'Thể Ta', 'Thể Nai'],
      correctIndex: 0,
      explanation: 'Lỡ làm gì: V-て + しまいました: 忘れてしまいました.'
    }
  },

  // =========================================================================
  // BÀI 30: TRẠNG THÁI THA ĐỘNG TỪ & CHUẨN BỊ SẴN
  // =========================================================================
  {
    id: 'n4-30-te-aru',
    lessonId: 'minna-30',
    lessonNumber: 30,
    lessonTitle: 'Bài 30: Trạng thái tha động từ & Chuẩn bị sẵn',
    curriculum: 'MINNA',
    grammarPoint: 'N が V-てあります',
    reading: 'てあります',
    romaji: 'te arimasu',
    level: 'N4',
    category: 'basics',
    meaningVi: 'Vật N đang ở trạng thái được làm sẵn có chủ đích',
    structure: 'N が [Tha động từ]-てあります',
    formality: 'Lịch sự',
    nuance: 'Khác với V-ています của tự động từ (chỉ trạng thái tự nhiên), V-てあります đi với tha động từ để nhấn mạnh kết quả của hành động do ai đó cố ý chuẩn bị từ trước.',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'Tha động từ thể Te + あります', example: '壁に カレンダーが 掛けてあります' }
    ],
    examples: [
      {
        id: 'ex-n4-30-1',
        japanese: '壁に地図が貼ってあります。',
        reading: 'かべにちずがはってあります。',
        vietnamese: 'Trên tường có dán sẵn một tấm bản đồ.'
      }
    ],
    quickQuiz: {
      question: '机の上にメモが（　）あります。',
      questionVi: 'Trên bàn có để sẵn tờ giấy ghi chú.',
      options: ['置いて', '置く', '置いた', '置かない'],
      optionsVi: ['Để (thể Te)', 'Thể từ điển', 'Thể Ta', 'Thể Nai'],
      correctIndex: 0,
      explanation: 'Tha động từ thể Te kết hợp あります: 置いてあります.'
    }
  },
  {
    id: 'n4-30-te-oku',
    lessonId: 'minna-30',
    lessonNumber: 30,
    lessonTitle: 'Bài 30: Trạng thái tha động từ & Chuẩn bị sẵn',
    curriculum: 'MINNA',
    grammarPoint: 'V-ておきます',
    reading: 'ておきます',
    romaji: 'te okimasu',
    level: 'N4',
    category: 'purpose',
    meaningVi: 'Làm sẵn việc gì trước (để chuẩn bị cho tương lai)',
    structure: 'V-て + おきます / おいてください',
    formality: 'Lịch sự',
    nuance: 'Làm sẵn một việc cần thiết trước thời hạn hoặc chuẩn bị cho lần sử dụng tiếp theo. Trong văn nói thân mật rút gọn thành とく (ví dụ: 買っとく).',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'V-て + おきます', example: '切符を 買っておきます' }
    ],
    examples: [
      {
        id: 'ex-n4-30-2',
        japanese: '旅行の前に切符を予約しておきます。',
        reading: 'りょこうのまえにきっぷをよやくしておきます。',
        vietnamese: 'Trước chuyến đi tôi đặt vé sẵn.'
      }
    ],
    quickQuiz: {
      question: 'パーティーの前に部屋を掃除（　）おきましょう。',
      questionVi: 'Trước bữa tiệc, chúng ta hãy dọn dẹp sẵn phòng nhé.',
      options: ['して', 'する', 'した', 'しない'],
      optionsVi: ['Làm (thể Te)', 'Thể từ điển', 'Thể Ta', 'Thể Nai'],
      correctIndex: 0,
      explanation: 'Làm sẵn việc gì: 掃除しておきます.'
    }
  },
  {
    id: 'n4-30-mada-te-iru',
    lessonId: 'minna-30',
    lessonNumber: 30,
    lessonTitle: 'Bài 30: Trạng thái tha động từ & Chuẩn bị sẵn',
    curriculum: 'MINNA',
    grammarPoint: 'まだ 〜 ています / てあります',
    reading: 'まだ〜ています',
    romaji: 'mada ~ te imasu',
    level: 'N4',
    category: 'basics',
    meaningVi: 'Vẫn còn đang... (Trạng thái vẫn duy trì tiếp diễn)',
    structure: 'まだ + V-ています / てあります',
    formality: 'Lịch sự',
    nuance: 'Biểu thị một hành động hoặc trạng thái vẫn còn tiếp tục diễn ra, chưa kết thúc.',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'まだ + V-ています', example: 'まだ 雨が 降っています' }
    ],
    examples: [
      {
        id: 'ex-n4-30-3',
        japanese: 'まだ仕事をやっていますから、先に帰ってください。',
        reading: 'まだしごとをやっていますから、さきにかえってください。',
        vietnamese: 'Tôi vẫn còn đang làm việc dở, bạn cứ về trước đi nhé.'
      }
    ],
    quickQuiz: {
      question: '外は（　）雨が降っています。',
      questionVi: 'Bên ngoài trời vẫn còn đang mưa.',
      options: ['まだ', 'もう', 'ずっと', 'いつも'],
      optionsVi: ['Vẫn còn', 'Đã', 'Suốt', 'Lúc nào cũng'],
      correctIndex: 0,
      explanation: 'Trạng thái tiếp diễn: まだ雨が降っています.'
    }
  },

  // =========================================================================
  // BÀI 31: THỂ Ý ĐỊNH (意向形)
  // =========================================================================
  {
    id: 'n4-31-ikoukei',
    lessonId: 'minna-31',
    lessonNumber: 31,
    lessonTitle: 'Bài 31: Thể ý định (意向形)',
    curriculum: 'MINNA',
    grammarPoint: 'Thể ý định (意向形: V-よう)',
    reading: 'いこうけい',
    romaji: 'ikoukei',
    level: 'N4',
    category: 'purpose',
    meaningVi: 'Cùng làm... nhé! / Nào, làm thôi! (Thể thông thường của V-ましょう)',
    structure: 'V-ý định (Nhóm 1: u → ou; Nhóm 2: ru → you; Nhóm 3: shiyou, koyou)',
    formality: 'Thân mật',
    nuance: 'Dùng trong hội thoại thân mật giữa bạn bè, người thân để rủ rê cùng làm gì hoặc độc thoại tự nhủ với bản thân (ví dụ: cố lên nào!).',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'Nhóm 1: 行く → 行こう (ikou)', example: '行こう、飲もう' },
      { partOfSpeech: 'Động từ', rule: 'Nhóm 2: 食べる → 食べよう (tabeyou)', example: '食べよう、見よう' },
      { partOfSpeech: 'Động từ', rule: 'Nhóm 3: する → しよう、来る → 来よう (koyou)', example: 'しよう' }
    ],
    examples: [
      {
        id: 'ex-n4-31-1',
        japanese: 'ちょっと休もう。疲れたね。',
        reading: 'ちょっとやすもう。つかれたね。',
        vietnamese: 'Nghỉ một lát đi. Mệt rồi nhỉ.'
      }
    ],
    quickQuiz: {
      question: '明日映画を（　）よ。うん、見よう！',
      questionVi: 'Mai cùng đi xem phim đi. Ừ, cùng xem nhé!',
      options: ['見よう', '見る', '見た', '見ない'],
      optionsVi: ['Cùng xem (ý định)', 'Thể từ điển', 'Thể Ta', 'Thể Nai'],
      correctIndex: 0,
      explanation: 'Rủ rê thân mật dùng thể ý định: 見よう.'
    }
  },
  {
    id: 'n4-31-you-to-omou',
    lessonId: 'minna-31',
    lessonNumber: 31,
    lessonTitle: 'Bài 31: Thể ý định (意向形)',
    curriculum: 'MINNA',
    grammarPoint: 'V-ようと思っています',
    reading: 'ようとおもっています',
    romaji: 'you to omotte imasu',
    level: 'N4',
    category: 'purpose',
    meaningVi: 'Đang có ý định làm gì...',
    structure: 'V-ý định + と思っています',
    formality: 'Lịch sự',
    nuance: 'Thể hiện ý định đã nảy sinh từ trước và người nói vẫn đang nuôi dưỡng ý định đó tới hiện tại.',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'V-ý định + と思っています', example: '国へ 帰ろうと思っています' }
    ],
    examples: [
      {
        id: 'ex-n4-31-2',
        japanese: '週末は海へ行こうと思っています。',
        reading: 'しゅうまつはうみへいこうとおもっています。',
        vietnamese: 'Cuối tuần tôi đang định đi biển.'
      }
    ],
    quickQuiz: {
      question: '将来自分の会社を（　）と思っています。',
      questionVi: 'Trong tương lai tôi đang định thành lập công ty riêng.',
      options: ['作ろう', '作る', '作った', '作り'],
      optionsVi: ['Ý định (tsukurou)', 'Thể từ điển', 'Thể Ta', 'Thân từ'],
      correctIndex: 0,
      explanation: 'Thể ý định của 作る nhóm 1 là 作ろう.'
    }
  },
  {
    id: 'n4-31-tsumori',
    lessonId: 'minna-31',
    lessonNumber: 31,
    lessonTitle: 'Bài 31: Thể ý định (意向形)',
    curriculum: 'MINNA',
    grammarPoint: 'V-る / V-ない つもりです',
    reading: 'つもりです',
    romaji: 'tsumori desu',
    level: 'N4',
    category: 'purpose',
    meaningVi: 'Dự định làm / không làm gì (Ý chí quyết tâm cá nhân)',
    structure: 'V-る / V-ない + つもりです',
    formality: 'Lịch sự',
    nuance: 'Biểu thị quyết tâm chắc chắn của bản thân, mức độ cam kết thực hiện cao hơn V-ようと思っています.',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'V-る + つもりです (quyết định làm)', example: '来年 結婚する つもりです' },
      { partOfSpeech: 'Động từ', rule: 'V-ない + つもりです (quyết không làm)', example: 'タバコを 吸わない つもりです' }
    ],
    examples: [
      {
        id: 'ex-n4-31-3',
        japanese: '今日からお酒を飲まないつもりです。',
        reading: 'きょうからおさけをのまないつもりです。',
        vietnamese: 'Kể từ hôm nay tôi quyết tâm sẽ không uống rượu nữa.'
      }
    ],
    quickQuiz: {
      question: '夏休みに国へ（　）つもりです。',
      questionVi: 'Tôi dự định sẽ về nước vào kỳ nghỉ hè.',
      options: ['帰る', '帰ろう', '帰った', '帰ります'],
      optionsVi: ['Về (thể từ điển)', 'Thể ý định', 'Thể Ta', 'Thể Masu'],
      correctIndex: 0,
      explanation: 'Cấu trúc V-る つもりです: 帰るつもりです.'
    }
  },
  {
    id: 'n4-31-yotei',
    lessonId: 'minna-31',
    lessonNumber: 31,
    lessonTitle: 'Bài 31: Thể ý định (意向形)',
    curriculum: 'MINNA',
    grammarPoint: 'V-る / N の 予定です',
    reading: 'よていです',
    romaji: 'yotei desu',
    level: 'N4',
    category: 'purpose',
    meaningVi: 'Theo kế hoạch, lịch trình đã định là...',
    structure: 'V-る / N の + 予定です',
    formality: 'Lịch sự',
    nuance: 'Khác với つもり (ý chí chủ quan cá nhân), 予定 (yotei) là kế hoạch, lịch trình khách quan đã được ấn định trong cơ quan, trường học, lịch bay.',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'V-る + 予定です', example: '出張する 予定です' },
      { partOfSpeech: 'Danh từ', rule: 'N + の + 予定です', example: '出張の 予定です' }
    ],
    examples: [
      {
        id: 'ex-n4-31-4',
        japanese: '飛行機は午後３時に到着する予定です。',
        reading: 'ひこうきはごごさんじにとうちゃくするよていです。',
        vietnamese: 'Máy bay dự kiến sẽ hạ cánh vào lúc 3 giờ chiều.'
      }
    ],
    quickQuiz: {
      question: '来週は東京へ出張（　）予定です。',
      questionVi: 'Tuần sau tôi có lịch trình đi công tác ở Tokyo.',
      options: ['の', 'な', 'だ', 'に'],
      optionsVi: ['Trợ từ の đi với Danh từ', 'Đi với な', 'Đi với だ', 'Đi với に'],
      correctIndex: 0,
      explanation: 'Danh từ 出張 kết hợp với 予定 cần trợ từ の: 出張の予定です.'
    }
  },
  {
    id: 'n4-31-mada-te-imasen',
    lessonId: 'minna-31',
    lessonNumber: 31,
    lessonTitle: 'Bài 31: Thể ý định (意向形)',
    curriculum: 'MINNA',
    grammarPoint: 'まだ V-ていません',
    reading: 'まだ〜ていません',
    romaji: 'mada ~ te imasen',
    level: 'N4',
    category: 'basics',
    meaningVi: 'Vẫn chưa làm V...',
    structure: 'まだ + V-ていません',
    formality: 'Lịch sự',
    nuance: 'Diễn tả một hành động dự kiến cần làm nhưng tới thời điểm hiện tại vẫn chưa hoàn thành xong.',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'まだ + V-ていません', example: 'まだ 食べていません (Vẫn chưa ăn)' }
    ],
    examples: [
      {
        id: 'ex-n4-31-5',
        japanese: 'レポートはもう書きましたか。……いいえ、まだ書いていません。',
        reading: 'れぽーとはもうかきましたか。いいえ、まだかいていません。',
        vietnamese: 'Bạn đã viết báo cáo chưa? ……Chưa, tôi vẫn chưa viết xong.'
      }
    ],
    quickQuiz: {
      question: '昼ご飯は（　）食べていません。',
      questionVi: 'Tôi vẫn chưa ăn cơm trưa.',
      options: ['まだ', 'もう', 'ずっと', 'いつも'],
      optionsVi: ['Vẫn chưa', 'Đã', 'Suốt', 'Lúc nào cũng'],
      correctIndex: 0,
      explanation: 'Vẫn chưa làm gì: まだ食べていません.'
    }
  },

  // =========================================================================
  // BÀI 32: LỜI KHUYÊN & PHỎNG ĐOÁN
  // =========================================================================
  {
    id: 'n4-32-hou-ga-ii',
    lessonId: 'minna-32',
    lessonNumber: 32,
    lessonTitle: 'Bài 32: Lời khuyên & Phỏng đoán',
    curriculum: 'MINNA',
    grammarPoint: 'V-た / V-ない ほうがいいです',
    reading: 'ほうがいいです',
    romaji: 'hou ga ii desu',
    level: 'N4',
    category: 'obligation',
    meaningVi: 'Nên / Không nên làm gì (Lời khuyên trực tiếp)',
    structure: 'V-た ほうがいいです (Nên) / V-ない ほうがいいです (Không nên)',
    formality: 'Lịch sự',
    nuance: 'Đưa ra lời khuyên chân thành và mang tính khẳng định cao đối với người nghe. Chú ý vế khẳng định dùng thể Ta (V-た ほうがいい).',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'Khuyên nên: V-た ほうがいい', example: '病院へ 行った ほうがいいです' },
      { partOfSpeech: 'Động từ', rule: 'Khuyên không nên: V-ない ほうがいい', example: '無理を しない ほうがいいです' }
    ],
    examples: [
      {
        id: 'ex-n4-32-1',
        japanese: '熱があるなら、早く寝たほうがいいですよ。',
        reading: 'ねつがあるなら、はやくねたほうがいいですよ。',
        vietnamese: 'Nếu bạn bị sốt thì nên đi ngủ sớm đi nhé.'
      }
    ],
    quickQuiz: {
      question: '風邪を引いたときは、無理を（　）ほうがいいです。',
      questionVi: 'Khi bị cảm lạnh thì không nên làm việc quá sức.',
      options: ['しない', 'する', 'した', 'して'],
      optionsVi: ['Không làm (V-nai)', 'Làm', 'Đã làm', 'Thể Te'],
      correctIndex: 0,
      explanation: 'Khuyên không nên làm gì: V-ない ほうがいいです.'
    }
  },
  {
    id: 'n4-32-deshou',
    lessonId: 'minna-32',
    lessonNumber: 32,
    lessonTitle: 'Bài 32: Lời khuyên & Phỏng đoán',
    curriculum: 'MINNA',
    grammarPoint: '〜でしょう',
    reading: 'でしょう',
    romaji: 'deshou',
    level: 'N4',
    category: 'judgment',
    meaningVi: 'Có lẽ là... (Phỏng đoán có độ tin cậy khá cao, 70-80%)',
    structure: 'Thể thông thường (Na/N không だ) + でしょう',
    formality: 'Lịch sự',
    nuance: 'Thường dùng trong dự báo thời tiết hoặc phỏng đoán tình huống tương lai dựa trên căn cứ khoa học, kinh nghiệm.',
    formationRules: [
      { partOfSpeech: 'Thể thông thường', rule: 'Thể thông thường + でしょう', example: '明日は 雨が 降るでしょう' }
    ],
    examples: [
      {
        id: 'ex-n4-32-2',
        japanese: '明日は全国的に晴れるでしょう。',
        reading: 'あしたはぜんこくてきにはれるでしょう。',
        vietnamese: 'Dự báo ngày mai trên toàn quốc trời sẽ nắng.'
      }
    ],
    quickQuiz: {
      question: '明日の午後から雨が（　）でしょう。',
      questionVi: 'Từ chiều mai có lẽ trời sẽ mưa.',
      options: ['降る', '降って', '降った', '降り'],
      optionsVi: ['Mưa (thể từ điển)', 'Thể Te', 'Thể Ta', 'Thân từ'],
      correctIndex: 0,
      explanation: 'Thể thông thường đi trước でしょう: 降るでしょう.'
    }
  },
  {
    id: 'n4-32-kamoshiremasen',
    lessonId: 'minna-32',
    lessonNumber: 32,
    lessonTitle: 'Bài 32: Lời khuyên & Phỏng đoán',
    curriculum: 'MINNA',
    grammarPoint: '〜かもしれません',
    reading: 'かもしれません',
    romaji: 'kamoshiremasen',
    level: 'N4',
    category: 'judgment',
    meaningVi: 'Có thể là... Chưa biết chừng... (Phỏng đoán xác suất 50%)',
    structure: 'Thể thông thường (Na/N không だ) + かもしれません',
    formality: 'Lịch sự',
    nuance: 'Biểu thị khả năng sự việc có thể xảy ra nhưng người nói không dám chắc chắn. Thường đi kèm phó từ もしかしたら.',
    formationRules: [
      { partOfSpeech: 'Thể thông thường', rule: 'Thể thông thường (Na/N không だ) + かもしれません', example: '病気 かもしれません' }
    ],
    examples: [
      {
        id: 'ex-n4-32-3',
        japanese: '約束の時間に遅れるかもしれません。',
        reading: 'やくそくのじかんにおくれるかもしれません。',
        vietnamese: 'Có thể tôi sẽ bị muộn giờ hẹn.'
      }
    ],
    quickQuiz: {
      question: '彼は今日、忙しくて来られない（　）。',
      questionVi: 'Hôm nay anh ấy bận nên chưa biết chừng không đến được.',
      options: ['かもしれません', 'はずです', 'ようです', 'そうです'],
      optionsVi: ['Chưa biết chừng (50%)', 'Chắc chắn', 'Hình như', 'Nghe nói'],
      correctIndex: 0,
      explanation: 'Phỏng đoán không chắc chắn: かもしれません.'
    }
  },

  // =========================================================================
  // BÀI 33: THỂ MỆNH LỆNH & CẤM CHỈ
  // =========================================================================
  {
    id: 'n4-33-meirei-kinshi',
    lessonId: 'minna-33',
    lessonNumber: 33,
    lessonTitle: 'Bài 33: Thể Mệnh lệnh & Cấm chỉ',
    curriculum: 'MINNA',
    grammarPoint: 'Thể Mệnh lệnh (命令形) & Cấm chỉ (禁止形)',
    reading: 'めいれいけい・きんしけい',
    romaji: 'meireikei / kinshikei',
    level: 'N4',
    category: 'obligation',
    meaningVi: 'Làm đi! / Cấm làm! (Mệnh lệnh dứt khoát hoặc biển báo)',
    structure: 'Mệnh lệnh: V-e (Nhóm 1) / V-ro (Nhóm 2) / Cấm chỉ: V-る + な',
    formality: 'Thân mật',
    nuance: 'Mang giọng điệu chỉ huy dứt khoát của cấp trên đối với cấp dưới trong quân đội, công trường, hoặc cổ vũ thể thao, biển báo an toàn công cộng.',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'Mệnh lệnh: 走れ (hashire), 止めろ (tomero)', example: '急げ (nhanh lên!)' },
      { partOfSpeech: 'Động từ', rule: 'Cấm chỉ: V-る + な', example: '入るな (cấm vào!)' }
    ],
    examples: [
      {
        id: 'ex-n4-33-1',
        japanese: 'あそこに「止まれ」と書いてあります。',
        reading: 'あそこに「とまれ」とかいてあります。',
        vietnamese: 'Ở đằng kia có ghi chữ「Dừng lại」.'
      }
    ],
    quickQuiz: {
      question: 'ここは危険だから、（　）な！',
      questionVi: 'Chỗ này nguy hiểm lắm, cấm vào!',
      options: ['入る', '入れ', '入った', '入り'],
      optionsVi: ['Thể từ điển (hairu na)', 'Thể mệnh lệnh', 'Thể Ta', 'Thân từ'],
      correctIndex: 0,
      explanation: 'Thể cấm chỉ là Động từ thể từ điển + な: 入るな.'
    }
  },
  {
    id: 'n4-33-to-iu-imi',
    lessonId: 'minna-33',
    lessonNumber: 33,
    lessonTitle: 'Bài 33: Thể Mệnh lệnh & Cấm chỉ',
    curriculum: 'MINNA',
    grammarPoint: 'X は Y という意味です',
    reading: 'という意味です',
    romaji: 'to iu imi desu',
    level: 'N4',
    category: 'basics',
    meaningVi: 'Ký hiệu/Từ X có nghĩa là Y',
    structure: 'X は [Ý nghĩa Y] という意味です',
    formality: 'Lịch sự',
    nuance: 'Dùng để giải thích ý nghĩa của một từ ngữ mới, biển báo giao thông hoặc ký hiệu công cộng.',
    formationRules: [
      { partOfSpeech: 'Danh từ', rule: 'Ký hiệu + は + Giải thích + という意味です', example: '「立入禁止」は 入るな という意味です' }
    ],
    examples: [
      {
        id: 'ex-n4-33-2',
        japanese: 'このマークは「タバコを吸ってはいけない」という意味です。',
        reading: 'このまーくは「たばこをすってはいけない」といういみです。',
        vietnamese: 'Ký hiệu này có nghĩa là「Không được hút thuốc」.'
      }
    ],
    quickQuiz: {
      question: '「使用中」は今（　）という意味です。',
      questionVi: 'Ký hiệu "Đang sử dụng" có nghĩa là hiện tại đang dùng.',
      options: ['使っている', '使う', '使った', '使わない'],
      optionsVi: ['Đang dùng (te-iru)', 'Dùng', 'Đã dùng', 'Không dùng'],
      correctIndex: 0,
      explanation: 'Đang diễn ra: 使っているという意味です.'
    }
  },
  {
    id: 'n4-33-to-itte-imashita',
    lessonId: 'minna-33',
    lessonNumber: 33,
    lessonTitle: 'Bài 33: Thể Mệnh lệnh & Cấm chỉ',
    curriculum: 'MINNA',
    grammarPoint: '〜と言っていました / 〜と伝えていただけませんか',
    reading: 'といっていました',
    romaji: 'to itte imashita',
    level: 'N4',
    category: 'basics',
    meaningVi: 'Ai đó đã nhắn rằng... / Nhờ bạn truyền đạt lời nhắn giúp tôi',
    structure: 'Người は [Câu / Thể thông thường] と言っていました',
    formality: 'Lịch sự',
    nuance: 'Dùng để truyền đạt lại lời nhắn của người thứ ba cho người nghe biết.',
    formationRules: [
      { partOfSpeech: 'Thể thông thường', rule: 'Câu thể thông thường + と言っていました', example: '田中さんは 明日休む と言っていました' }
    ],
    examples: [
      {
        id: 'ex-n4-33-3',
        japanese: '部長は「午後から会議に出席する」と言っていました。',
        reading: 'ぶちょうは「ごごからかいぎにしゅっせきする」といっていました。',
        vietnamese: 'Trưởng phòng đã dặn là「Từ chiều sẽ tham dự cuộc họp」.'
      }
    ],
    quickQuiz: {
      question: '山田さんは会議に少し（　）と言っていました。',
      questionVi: 'Anh Yamada đã nói là sẽ đến muộn cuộc họp một chút.',
      options: ['遅れる', '遅れて', '遅れ', '遅れよう'],
      optionsVi: ['Muộn (thể thông thường)', 'Thể Te', 'Thân từ', 'Ý định'],
      correctIndex: 0,
      explanation: 'Trích dẫn gián tiếp: 遅れると言っていました.'
    }
  },

  // =========================================================================
  // BÀI 34: LÀM THEO CHỈ DẪN & THỨ TỰ
  // =========================================================================
  {
    id: 'n4-34-toori-ni',
    lessonId: 'minna-34',
    lessonNumber: 34,
    lessonTitle: 'Bài 34: Làm theo chỉ dẫn & Thứ tự',
    curriculum: 'MINNA',
    grammarPoint: 'V1-た / N の とおりに、V2',
    reading: 'とおりに',
    romaji: 'toori ni',
    level: 'N4',
    category: 'basics',
    meaningVi: 'Làm theo đúng như V1 / đúng theo N',
    structure: 'V1-る / V1-た / N の + とおりに、V2',
    formality: 'Lịch sự',
    nuance: 'Thực hiện hành động V2 sao cho hoàn toàn trùng khớp với chỉ dẫn, mẫu mã hoặc kinh nghiệm V1 trước đó.',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'V-た + とおりに', example: '私が 言ったとおりに 書いてください' },
      { partOfSpeech: 'Danh từ', rule: 'N + の + とおりに', example: '説明書の とおりに 組み立てます' }
    ],
    examples: [
      {
        id: 'ex-n4-34-1',
        japanese: '私が言ったとおりに、メモを取ってください。',
        reading: 'わたしがいったとおりに、めもをとってください。',
        vietnamese: 'Xin hãy ghi chép lại theo đúng những gì tôi đã nói.'
      }
    ],
    quickQuiz: {
      question: '先生が教えた（　）発音してください。',
      questionVi: 'Hãy phát âm theo đúng như thầy giáo đã dạy.',
      options: ['とおりに', 'ために', 'ように', 'までに'],
      optionsVi: ['Đúng theo như', 'Để vì', 'Để mà', 'Cho tới'],
      correctIndex: 0,
      explanation: 'Làm theo chỉ dẫn: 教えたとおりに.'
    }
  },
  {
    id: 'n4-34-ato-de',
    lessonId: 'minna-34',
    lessonNumber: 34,
    lessonTitle: 'Bài 34: Làm theo chỉ dẫn & Thứ tự',
    curriculum: 'MINNA',
    grammarPoint: 'V1-た / N の あとで、V2',
    reading: 'あとで',
    romaji: 'ato de',
    level: 'N4',
    category: 'time',
    meaningVi: 'Sau khi làm V1 / sau thời điểm N thì làm V2',
    structure: 'V1-た / N の + あとで、V2',
    formality: 'Lịch sự',
    nuance: 'Biểu thị quan hệ trước sau về thời gian giữa 2 hành động.',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'V-た + あとで', example: 'ご飯を 食べた あとで 薬を飲みます' },
      { partOfSpeech: 'Danh từ', rule: 'N + の + あとで', example: '仕事の あとで 飲みに行きます' }
    ],
    examples: [
      {
        id: 'ex-n4-34-2',
        japanese: '新しい靴を買ったあとで、古い靴を捨てました。',
        reading: 'あたらしいくつをかったあとで、ふるいくつをすてました。',
        vietnamese: 'Sau khi mua đôi giày mới, tôi đã vứt đôi giày cũ đi.'
      }
    ],
    quickQuiz: {
      question: '映画を（　）あとで、カフェへ行きましょう。',
      questionVi: 'Sau khi xem phim xong, chúng mình cùng vào quán cà phê nhé.',
      options: ['見た', '見る', '見て', '見ない'],
      optionsVi: ['Đã xem (thể Ta)', 'Thể từ điển', 'Thể Te', 'Thể Nai'],
      correctIndex: 0,
      explanation: 'Sau khi làm gì: V-たあとで: 見たあとで.'
    }
  },
  {
    id: 'n4-34-nai-de',
    lessonId: 'minna-34',
    lessonNumber: 34,
    lessonTitle: 'Bài 34: Làm theo chỉ dẫn & Thứ tự',
    curriculum: 'MINNA',
    grammarPoint: 'V1-ないで V2',
    reading: 'ないで',
    romaji: 'nai de',
    level: 'N4',
    category: 'basics',
    meaningVi: 'Làm V2 mà không làm V1 (Trong trạng thái không có V1)',
    structure: 'V1-ないで、V2',
    formality: 'Lịch sự',
    nuance: 'Thực hiện hành động V2 mà bỏ qua hành động V1 vốn thường được làm cùng (ví dụ: uống cà phê không cho đường).',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'V-ない + で', example: '砂糖を 入れないで 飲みます' }
    ],
    examples: [
      {
        id: 'ex-n4-34-3',
        japanese: '朝ご飯を食べないで、会社へ行きました。',
        reading: 'あさごはんをたべないで、かいしゃへいきました。',
        vietnamese: 'Tôi đã đi làm mà không ăn sáng.'
      }
    ],
    quickQuiz: {
      question: '傘を（　）で出かけたら、雨に降られた。',
      questionVi: 'Đi ra ngoài mà không mang theo ô nên tôi đã bị dính mưa.',
      options: ['持たない', '持たず', '持たなく', '持たないで'],
      optionsVi: ['Không mang (nai)', 'Zu ni', 'Naku', 'Nai de'],
      correctIndex: 0,
      explanation: 'Công thức V-ないで: 持たないで.'
    }
  },

  // =========================================================================
  // BÀI 35: THỂ ĐIỀU KIỆN BA (条件形)
  // =========================================================================
  {
    id: 'n4-35-ba-jouken',
    lessonId: 'minna-35',
    lessonNumber: 35,
    lessonTitle: 'Bài 35: Thể Điều kiện Ba (条件形)',
    curriculum: 'MINNA',
    grammarPoint: 'Thể Điều kiện (〜ば)',
    reading: 'ば・じょうけんけい',
    romaji: 'ba / joukenkei',
    level: 'N4',
    category: 'condition',
    meaningVi: 'Nếu... thì... (Điều kiện tất yếu, giải pháp)',
    structure: 'V-えば / A-ければ / Na-なら / N-なら',
    formality: 'Lịch sự',
    nuance: 'Tập trung vào điều kiện tiền đề cần thiết để vế sau đạt được kết quả. Khác với たら, thể ば mang tính logic nhân quả chặt chẽ hơn.',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'Nhóm 1: u → eba (安ければ)', example: '行けば、飲めば' },
      { partOfSpeech: 'Động từ', rule: 'Nhóm 2: ru → reba (食べれば)', example: '見れば' }
    ],
    examples: [
      {
        id: 'ex-n4-35-1',
        japanese: '春になれば、桜が咲きます。',
        reading: 'はるになれば、さくらがさきます。',
        vietnamese: 'Hễ mùa xuân đến thì hoa anh đào sẽ nở.'
      }
    ],
    quickQuiz: {
      question: '安（　）、このパソコンを買いたいです。',
      questionVi: 'Nếu rẻ, tôi muốn mua chiếc máy tính này.',
      options: ['ければ', 'いなら', 'かったら', 'くて'],
      optionsVi: ['Thể ba (安ければ)', 'Đi với na', 'Thể tara', 'Thể te'],
      correctIndex: 0,
      explanation: 'Tính từ đuôi い chia thể điều kiện ば: 安い → 安ければ.'
    }
  },
  {
    id: 'n4-35-ba-hodo',
    lessonId: 'minna-35',
    lessonNumber: 35,
    lessonTitle: 'Bài 35: Thể Điều kiện Ba (条件形)',
    curriculum: 'MINNA',
    grammarPoint: 'V-ば V-るほど / A-ければ A-いほど',
    reading: 'ば〜ほど',
    romaji: 'ba ~ hodo',
    level: 'N4',
    category: 'degree',
    meaningVi: 'Càng... thì càng... (Tương quan mức độ tăng dần)',
    structure: 'V-ば + V-るほど / A-ければ + A-いほど',
    formality: 'Lịch sự',
    nuance: 'Khi mức độ của vế trước tăng lên thì mức độ của vế sau cũng tỉ lệ thuận tăng theo.',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'V-ば + V-るほど', example: '練習すれば するほど 上手になる' }
    ],
    examples: [
      {
        id: 'ex-n4-35-2',
        japanese: '日本語は勉強すればするほど、おもしろくなります。',
        reading: 'にほんごはべんきょうすればするほど、おもしろくなります。',
        vietnamese: 'Tiếng Nhật càng học thì càng thấy thú vị.'
      }
    ],
    quickQuiz: {
      question: '荷物は少なければ少ない（　）楽です。',
      questionVi: 'Hành lý càng ít thì càng nhẹ nhàng thoải mái.',
      options: ['ほど', 'ばかり', 'くらい', 'など'],
      optionsVi: ['Càng... càng (hodo)', 'Toàn là', 'Khoảng chừng', 'Vân vân'],
      correctIndex: 0,
      explanation: 'Cấu trúc càng... càng: 少なければ少ないほど.'
    }
  },
  {
    id: 'n4-35-n-nara',
    lessonId: 'minna-35',
    lessonNumber: 35,
    lessonTitle: 'Bài 35: Thể Điều kiện Ba (条件形)',
    curriculum: 'MINNA',
    grammarPoint: 'N なら、〜',
    reading: 'なら',
    romaji: 'nara',
    level: 'N4',
    category: 'condition',
    meaningVi: 'Nếu là N thì... (Đưa ra gợi ý về phạm trù N đối phương vừa nhắc tới)',
    structure: 'N + なら、〜',
    formality: 'Lịch sự',
    nuance: 'Tiếp nhận chủ đề từ đối phương để đưa ra lời khuyên hoặc phương án giới hạn phù hợp nhất.',
    formationRules: [
      { partOfSpeech: 'Danh từ', rule: 'N + なら', example: '日本料理 なら すしが いいです' }
    ],
    examples: [
      {
        id: 'ex-n4-35-3',
        japanese: '温泉なら、草津温泉がおすすめですよ。',
        reading: 'おんせんなら、くさつおんせんがおすすめですよ。',
        vietnamese: 'Nếu là tắm suối nước nóng thì suối Kusatsu là gợi ý tuyệt vời đấy.'
      }
    ],
    quickQuiz: {
      question: 'カメラを安く買う（　）、秋葉原がいいですよ。',
      questionVi: 'Nếu muốn mua máy ảnh giá rẻ thì Akihabara là tốt nhất đấy.',
      options: ['なら', 'たら', 'れば', 'と'],
      optionsVi: ['Gợi ý chủ đề (nara)', 'Nếu làm xong', 'Điều kiện tự nhiên', 'Hiển nhiên'],
      correctIndex: 0,
      explanation: 'Đưa ra lời khuyên cho chủ đề đối phương hỏi: なら.'
    }
  },

  // =========================================================================
  // BÀI 36: MỤC ĐÍCH & THAY ĐỔI TRẠNG THÁI
  // =========================================================================
  {
    id: 'n4-36-you-ni',
    lessonId: 'minna-36',
    lessonNumber: 36,
    lessonTitle: 'Bài 36: Mục đích & Thay đổi trạng thái',
    curriculum: 'MINNA',
    grammarPoint: 'V1-る / V1-ない ように、V2',
    reading: 'ように',
    romaji: 'you ni',
    level: 'N4',
    category: 'purpose',
    meaningVi: 'Để mà... (Mục đích trạng thái hoặc không chủ ý)',
    structure: 'V(khả năng/tự động từ/thể nai) + ように、V2',
    formality: 'Lịch sự',
    nuance: 'Khác với ために (mục đích có ý chí cao), ように đi với động từ không có ý chí (khả năng, hiểu, quên) nhằm diễn tả mong muốn trạng thái đó xảy ra.',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'V-khả năng / V-ない + ように', example: '忘れない ように メモします' }
    ],
    examples: [
      {
        id: 'ex-n4-36-1',
        japanese: '忘れないように、ノートにメモしておきます。',
        reading: 'わすれないように、のーとにめもしておきます。',
        vietnamese: 'Để không quên, tôi ghi chú sẵn vào sổ tay.'
      }
    ],
    quickQuiz: {
      question: '後ろの人にもよく（　）ように、大きく書きました。',
      questionVi: 'Tôi viết chữ to để người ngồi phía sau cũng có thể nhìn thấy rõ.',
      options: ['見える', '見る', '見せて', '見られる'],
      optionsVi: ['Nhìn thấy tự nhiên', 'Nhìn có ý chí', 'Cho xem', 'Được nhìn'],
      correctIndex: 0,
      explanation: 'Mục đích khả năng tự nhiên dùng 見える: よく見えるように.'
    }
  },
  {
    id: 'n4-36-you-ni-naru',
    lessonId: 'minna-36',
    lessonNumber: 36,
    lessonTitle: 'Bài 36: Mục đích & Thay đổi trạng thái',
    curriculum: 'MINNA',
    grammarPoint: 'V-る ようになります',
    reading: 'ようになる',
    romaji: 'you ni naru',
    level: 'N4',
    category: 'basics',
    meaningVi: 'Đã trở nên có thể làm được... (Biến đổi năng lực theo thời gian)',
    structure: 'V-khả năng / V-thể từ điển + ようになります',
    formality: 'Lịch sự',
    nuance: 'Diễn tả sự thay đổi từ trạng thái "trước đây không làm được" sang "hiện tại đã có thể làm được".',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'V-khả năng + ようになる', example: '漢字が 読めるようになった' }
    ],
    examples: [
      {
        id: 'ex-n4-36-2',
        japanese: '毎日練習して、自転車に乗れるようになりました。',
        reading: 'まいにちれんしゅうして、じてんしゃにのれるようになりました。',
        vietnamese: 'Nhờ luyện tập mỗi ngày mà tôi đã biết đi xe đạp.'
      }
    ],
    quickQuiz: {
      question: '日本に来てから、納豆が（　）ようになりました。',
      questionVi: 'Từ khi sang Nhật, tôi đã có thể ăn được món natto.',
      options: ['食べられる', '食べる', '食べて', '食べた'],
      optionsVi: ['Ăn được (khả năng)', 'Thể từ điển', 'Thể Te', 'Thể Ta'],
      correctIndex: 0,
      explanation: 'Biến đổi năng lực: 食べられるようになりました.'
    }
  },
  {
    id: 'n4-36-you-ni-suru',
    lessonId: 'minna-36',
    lessonNumber: 36,
    lessonTitle: 'Bài 36: Mục đích & Thay đổi trạng thái',
    curriculum: 'MINNA',
    grammarPoint: 'V-る / V-ない ようにします',
    reading: 'ようにする',
    romaji: 'you ni suru',
    level: 'N4',
    category: 'purpose',
    meaningVi: 'Cố gắng làm / không làm gì (Tạo thói quen nỗ lực)',
    structure: 'V-る / V-ない + ようにします / ようにしてください',
    formality: 'Lịch sự',
    nuance: 'Biểu thị sự nỗ lực thường xuyên, liên tục của người nói nhằm hình thành một thói quen tốt.',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'V-る / V-ない + ようにする', example: '野菜を 食べるようにしている' }
    ],
    examples: [
      {
        id: 'ex-n4-36-3',
        japanese: '健康のために、毎日歩くようにしています。',
        reading: 'けんこうのために、まいにちあるくようにしています。',
        vietnamese: 'Vì sức khỏe, tôi luôn cố gắng đi bộ mỗi ngày.'
      }
    ],
    quickQuiz: {
      question: '甘いものをあまり（　）ようにしています。',
      questionVi: 'Tôi luôn cố gắng không ăn nhiều đồ ngọt.',
      options: ['食べない', '食べる', '食べた', '食べず'],
      optionsVi: ['Không ăn (thể Nai)', 'Ăn', 'Đã ăn', 'Dạng Zu'],
      correctIndex: 0,
      explanation: 'Cố gắng không làm gì: 食べないようにしています.'
    }
  },

  // =========================================================================
  // BÀI 37: ĐỘNG TỪ BỊ ĐỘNG (受身動詞)
  // =========================================================================
  {
    id: 'n4-37-ukemi',
    lessonId: 'minna-37',
    lessonNumber: 37,
    lessonTitle: 'Bài 37: Động từ Bị động (受身動詞)',
    curriculum: 'MINNA',
    grammarPoint: 'Động từ Bị động (受身動詞: V-れる / V-られる)',
    reading: 'うけみどうし',
    romaji: 'ukemi doushi',
    level: 'N4',
    category: 'passive_causative',
    meaningVi: 'Bị / Được làm gì bởi ai đó (Bị động trực tiếp & gián tiếp)',
    structure: 'N1 は N2 に [V-bị động] / N1 は N2 に N3 を [V-bị động]',
    formality: 'Lịch sự',
    nuance: 'Diễn tả việc chủ ngữ tiếp nhận hành động từ người khác. Thường dùng bị động phiền toái khi cảm thấy bực bội hoặc phiền phức.',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'Nhóm 1: u → are (叱る → 叱られる)', example: '叱る → 叱られる' },
      { partOfSpeech: 'Động từ', rule: 'Nhóm 2: ru → rare (褒める → 褒められる)', example: '褒める → 褒められる' },
      { partOfSpeech: 'Động từ', rule: 'Nhóm 3: する → される, 来る → こられる', example: 'する → される' }
    ],
    examples: [
      {
        id: 'ex-n4-37-1',
        japanese: 'テストで満点を取って、先生に褒められました。',
        reading: 'てすとでまんてんをとって、せんせいにほめられました。',
        vietnamese: 'Tôi đạt điểm tối đa nên được thầy giáo khen.'
      }
    ],
    quickQuiz: {
      question: '満員電車で誰かに足を（　）れました。',
      questionVi: 'Trên tàu đông người tôi bị ai đó giẫm vào chân.',
      options: ['踏ま', '踏み', '踏む', '踏んで'],
      optionsVi: ['Giẫm (nhóm 1 chia bị động: u -> a)', 'Nhóm 1 i', 'Thể từ điển', 'Thể Te'],
      correctIndex: 0,
      explanation: 'Động từ 踏む (ふむ) nhóm 1 chia bị động thành 踏まれる: 足を踏まれました.'
    }
  },
  {
    id: 'n4-37-ukemi-ni-yotte',
    lessonId: 'minna-37',
    lessonNumber: 37,
    lessonTitle: 'Bài 37: Động từ Bị động (受身動詞)',
    curriculum: 'MINNA',
    grammarPoint: 'N(vật) は N(người phát minh/xây dựng) によって V-られます',
    reading: 'によって〜られる',
    romaji: 'ni yotte ~ rareru',
    level: 'N4',
    category: 'passive_causative',
    meaningVi: 'Tác phẩm / Đồ vật được phát minh, xây dựng bởi ai đó',
    structure: 'N(vật) は N(tác giả/nhà phát minh) によって [V-bị động]',
    formality: 'Trang trọng',
    nuance: 'Dùng khi nói về các phát minh, công trình kiến trúc, tác phẩm văn học nổi tiếng thế giới.',
    formationRules: [
      { partOfSpeech: 'Danh từ', rule: 'Tác giả + によって + Động từ bị động', example: '電話は ベルによって 発明されました' }
    ],
    examples: [
      {
        id: 'ex-n4-37-2',
        japanese: 'この小説は有名な作家によって書かれました。',
        reading: 'このしょうせつはゆうめいなさっかによってかかれました。',
        vietnamese: 'Cuốn tiểu thuyết này được viết bởi một nhà văn nổi tiếng.'
      }
    ],
    quickQuiz: {
      question: '飛行機はライト兄弟（　）発明されました。',
      questionVi: 'Máy bay được phát minh bởi anh em nhà Wright.',
      options: ['によって', 'について', 'にとって', 'により'],
      optionsVi: ['Bởi ai phát minh (ni yotte)', 'Về chủ đề', 'Đối với lập trường', 'Nguyên nhân'],
      correctIndex: 0,
      explanation: 'Phát minh bởi ai trong câu bị động dùng「によって」.'
    }
  },

  // =========================================================================
  // BÀI 38: DANH TỪ HÓA ĐỘNG TỪ (V-るの / V-ることは)
  // =========================================================================
  {
    id: 'n4-38-meishika',
    lessonId: 'minna-38',
    lessonNumber: 38,
    lessonTitle: 'Bài 38: Danh từ hóa động từ (V-るの / V-ることは)',
    curriculum: 'MINNA',
    grammarPoint: 'V-る のは A です / のが好きです',
    reading: 'るのは〜です',
    romaji: 'ru no wa ~ desu',
    level: 'N4',
    category: 'basics',
    meaningVi: 'Việc làm V thì... (Danh từ hóa hành động bằng の)',
    structure: 'V-る + のは A です / のを 忘れました',
    formality: 'Lịch sự',
    nuance: 'Dùng「の」để biến đổi một động từ thành một cụm danh từ tương đương để làm chủ ngữ hoặc tân ngữ trong câu.',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'V-thể từ điển + の', example: '日本語を 話すのは 難しいです' }
    ],
    examples: [
      {
        id: 'ex-n4-38-1',
        japanese: '一人で暮らすのは寂しいです。',
        reading: 'ひとりでくらすのはさびしいです。',
        vietnamese: 'Sống một mình thì cảm thấy rất cô đơn.'
      }
    ],
    quickQuiz: {
      question: '鍵をかける（　）を忘れました。',
      questionVi: 'Tôi quên mất việc khóa cửa rồi.',
      options: ['の', 'こと', 'もの', 'とき'],
      optionsVi: ['Trợ từ danh từ hóa の', 'Từ việc こと', 'Đồ vật', 'Lúc'],
      correctIndex: 0,
      explanation: 'Quên một hành động cụ thể vừa mới xảy ra dùng「〜のを忘れました」.'
    }
  },
  {
    id: 'n4-38-no-wo-shitte-imasuka',
    lessonId: 'minna-38',
    lessonNumber: 38,
    lessonTitle: 'Bài 38: Danh từ hóa động từ (V-るの / V-ることは)',
    curriculum: 'MINNA',
    grammarPoint: 'V-る のを知っていますか',
    reading: 'のをしっていますか',
    romaji: 'no o shitte imasu ka',
    level: 'N4',
    category: 'basics',
    meaningVi: 'Bạn có biết chuyện... không?',
    structure: '[Thể thông thường] + のを知っていますか',
    formality: 'Lịch sự',
    nuance: 'Hỏi xem đối phương có nắm bắt được một sự kiện hoặc thông tin cụ thể vừa mới diễn ra hay không.',
    formationRules: [
      { partOfSpeech: 'Thể thông thường', rule: 'Thể thông thường + のを知っていますか', example: '田中さんが 結婚したのを知っていますか' }
    ],
    examples: [
      {
        id: 'ex-n4-38-2',
        japanese: '木村さんに赤ちゃんが生まれたのを知っていますか。',
        reading: 'きむらさんにあかちゃんがうまれたのをしっていますか。',
        vietnamese: 'Bạn có biết chuyện chị Kimura vừa sinh em bé không?'
      }
    ],
    quickQuiz: {
      question: '彼が会社を辞めた（　）を知っていますか。',
      questionVi: 'Bạn có biết chuyện anh ấy đã nghỉ việc ở công ty không?',
      options: ['の', 'こと', 'もの', 'とき'],
      optionsVi: ['Trợ từ danh từ hóa の', 'Việc', 'Đồ vật', 'Thời gian'],
      correctIndex: 0,
      explanation: 'Biết tin tức sự việc cụ thể: のを知っていますか.'
    }
  },

  // =========================================================================
  // BÀI 39: NGUYÊN NHÂN TỰ NHIÊN & CẢM XÚC
  // =========================================================================
  {
    id: 'n4-39-te-reason',
    lessonId: 'minna-39',
    lessonNumber: 39,
    lessonTitle: 'Bài 39: Nguyên nhân tự nhiên & Cảm xúc',
    curriculum: 'MINNA',
    grammarPoint: 'V-て / A-くて / Na-で (Chỉ nguyên nhân)',
    reading: 'て・くて・で',
    romaji: 'te / kute / de (riyuu)',
    level: 'N4',
    category: 'cause',
    meaningVi: 'Vì... nên... (Nguyên nhân dẫn tới cảm xúc, hiện tượng tự nhiên)',
    structure: 'V-て / A-くて / Na-で、[Vế sau: cảm xúc, trạng thái không ý chí]',
    formality: 'Lịch sự',
    nuance: 'Vế sau của câu nguyên nhân thể Te tuyệt đối không được mang ý chí, mệnh lệnh, rủ rê hay ý định của con người.',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'V-て、[cảm xúc]', example: '家族に 会えなくて 寂しい' }
    ],
    examples: [
      {
        id: 'ex-n4-39-1',
        japanese: 'ニュースを聞いて、びっくりしました。',
        reading: 'にゅーすをきいて、びっくりしました。',
        vietnamese: 'Nghe tin tức xong tôi đã giật mình sửng sốt.'
      }
    ],
    quickQuiz: {
      question: '事故が（　）、電車が止まりました。',
      questionVi: 'Vì có tai nạn nên tàu điện đã phải dừng lại.',
      options: ['あって', 'あり', 'あった', 'ある'],
      optionsVi: ['Xảy ra (thể Te)', 'Thân từ', 'Thể Ta', 'Thể từ điển'],
      correctIndex: 0,
      explanation: 'Nguyên nhân dẫn tới sự cố khách quan: 事故があって.'
    }
  },
  {
    id: 'n4-39-node',
    lessonId: 'minna-39',
    lessonNumber: 39,
    lessonTitle: 'Bài 39: Nguyên nhân tự nhiên & Cảm xúc',
    curriculum: 'MINNA',
    grammarPoint: '〜ので',
    reading: 'ので',
    romaji: 'node',
    level: 'N4',
    category: 'cause',
    meaningVi: 'Bởi vì... nên... (Lý do khách quan, lịch sự)',
    structure: 'Thể thông thường (Na/N + な) + ので',
    formality: 'Lịch sự',
    nuance: 'Nêu lý do mang tính khách quan, tự nhiên, tạo cảm giác lịch sự và nhẹ nhàng hơn「から」. Rất hay dùng khi xin phép hoặc xin lỗi.',
    formationRules: [
      { partOfSpeech: 'Thể thông thường', rule: 'Động từ/Tính từ thể ngắn + ので', example: '雨が 降ったので' },
      { partOfSpeech: 'Danh từ', rule: 'N + な + ので', example: '用事な ので (Vì có việc bận)' }
    ],
    examples: [
      {
        id: 'ex-n4-39-2',
        japanese: '用事があるので、お先に失礼します。',
        reading: 'ようじがあるので、おさきにしつれいします。',
        vietnamese: 'Vì tôi có chút việc bận nên xin phép về trước ạ.'
      }
    ],
    quickQuiz: {
      question: '気分が（　）ので、早退してもいいですか。',
      questionVi: 'Vì cảm thấy không khỏe nên em xin phép về sớm được không ạ?',
      options: ['悪い', '悪く', '悪くて', '悪かった'],
      optionsVi: ['Xấu/mệt (thể ngắn)', 'Dạng chia ku', 'Thể Te', 'Quá khứ'],
      correctIndex: 0,
      explanation: 'Tính từ đuôi い đi trực tiếp với ので: 気分が悪いので.'
    }
  },

  // =========================================================================
  // BÀI 40: CÂU HỎI LỒNG CÂU HỎI
  // =========================================================================
  {
    id: 'n4-40-ka-douka',
    lessonId: 'minna-40',
    lessonNumber: 40,
    lessonTitle: 'Bài 40: Câu hỏi lồng câu hỏi',
    curriculum: 'MINNA',
    grammarPoint: '〜かどうか / [Từ để hỏi] 〜か',
    reading: 'かどうか',
    romaji: 'ka douka',
    level: 'N4',
    category: 'basics',
    meaningVi: 'Có... hay không / [Ai, ở đâu...] làm gì thì...',
    structure: 'Thể thông thường (Na/N không だ) + かどうか、〜',
    formality: 'Lịch sự',
    nuance: 'Lồng một câu nghi vấn vào giữa câu chính để làm mệnh đề tân ngữ cho các động từ như 調べる (tìm hiểu), 分かる (hiểu), 聞く (hỏi).',
    formationRules: [
      { partOfSpeech: 'Thể thông thường', rule: 'Câu thể thông thường + かどうか', example: '間に合うかどうか 分かりません' }
    ],
    examples: [
      {
        id: 'ex-n4-40-1',
        japanese: 'その話が本当かどうか、確かめてみます。',
        reading: 'そのはなしがほんとうかどうか、たしかめてみます。',
        vietnamese: 'Tôi sẽ xác nhận xem câu chuyện đó có thật hay không.'
      }
    ],
    quickQuiz: {
      question: '明日時間がある（　）、教えてください。',
      questionVi: 'Hãy nói cho tôi biết bạn ngày mai có thời gian hay không nhé.',
      options: ['かどうか', 'のに', 'ので', 'ように'],
      optionsVi: ['Có hay không', 'Mặc dù', 'Bởi vì', 'Để mà'],
      correctIndex: 0,
      explanation: 'Câu hỏi có hay không lồng vào câu chính dùng「かどうか」.'
    }
  },
  {
    id: 'n4-40-te-miru',
    lessonId: 'minna-40',
    lessonNumber: 40,
    lessonTitle: 'Bài 40: Câu hỏi lồng câu hỏi',
    curriculum: 'MINNA',
    grammarPoint: 'V-てみます',
    reading: 'てみます',
    romaji: 'te mimasu',
    level: 'N4',
    category: 'basics',
    meaningVi: 'Làm thử việc gì xem sao (Thử nghiệm trải nghiệm mới)',
    structure: 'V-て + みます / みてください',
    formality: 'Lịch sự',
    nuance: 'Thực hiện một hành động nào đó để xem kết quả ra sao, thường dùng khi thử quần áo, nếm đồ ăn, hoặc thử sức với việc mới.',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'V-て + みます', example: '着てみます (mặc thử)' }
    ],
    examples: [
      {
        id: 'ex-n4-40-2',
        japanese: 'このセーターを着てみてもいいですか。',
        reading: 'このせーたーをきてみてもいいですか。',
        vietnamese: 'Tôi có thể mặc thử chiếc áo len này được không ạ?'
      }
    ],
    quickQuiz: {
      question: '日本の納豆を一度（　）みたいです。',
      questionVi: 'Tôi muốn ăn thử món natto của Nhật Bản một lần xem sao.',
      options: ['食べて', '食べる', '食べた', '食べ'],
      optionsVi: ['Ăn (thể Te)', 'Thể từ điển', 'Thể Ta', 'Thân từ'],
      correctIndex: 0,
      explanation: 'Ăn thử xem sao: 食べてみたいです.'
    }
  },

  // =========================================================================
  // BÀI 41: CHO NHẬN THỂ TRANG TRỌNG
  // =========================================================================
  {
    id: 'n4-41-itadakimasu-kudasaimasu',
    lessonId: 'minna-41',
    lessonNumber: 41,
    lessonTitle: 'Bài 41: Cho nhận thể trang trọng',
    curriculum: 'MINNA',
    grammarPoint: 'V-ていただきます / V-てくださいます',
    reading: 'ていただきます / てくださいます',
    romaji: 'te itadakimasu / te kudasaimasu',
    level: 'N4',
    category: 'keigo',
    meaningVi: 'Được bề trên làm gì cho (kính cẩn)',
    structure: 'Tôi は Bề trên に V-ていただきます / Bề trên は Tôi に V-てくださいます',
    formality: 'Trang trọng',
    nuance: 'Mẫu câu tôn kính và khiêm nhường đối với hành động cho nhận từ người có vị thế cao hơn (giáo viên, cấp trên, khách hàng).',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'V-て + いただきます (Tôi nhận được)', example: '先生に 直していただきました' }
    ],
    examples: [
      {
        id: 'ex-n4-41-1',
        japanese: '社長に本を貸していただきました。',
        reading: 'しゃちょうにほんをかしていただきました。',
        vietnamese: 'Tôi đã được giám đốc cho mượn cuốn sách.'
      }
    ],
    quickQuiz: {
      question: '部長が空港まで（　）くださいました。',
      questionVi: 'Trưởng phòng đã đưa tôi ra tận sân bay.',
      options: ['送って', '送る', '送った', '送ります'],
      optionsVi: ['Đưa tiễn (thể Te)', 'Thể từ điển', 'Thể Ta', 'Thể Masu'],
      correctIndex: 0,
      explanation: 'Bề trên làm giúp mình dùng V-てくださいます: 送ってくださいました.'
    }
  },
  {
    id: 'n4-41-te-yarimasu',
    lessonId: 'minna-41',
    lessonNumber: 41,
    lessonTitle: 'Bài 41: Cho nhận thể trang trọng',
    curriculum: 'MINNA',
    grammarPoint: '〜に やります / V-てやります',
    reading: 'やります / てやります',
    romaji: 'yarimasu / te yarimasu',
    level: 'N4',
    category: 'basics',
    meaningVi: 'Làm gì cho đối tượng nhỏ tuổi hơn, con cái, động vật, cây cỏ',
    structure: 'N(con vật/cây cối/con cái) に [V-てやります]',
    formality: 'Thân mật',
    nuance: 'Dùng thay cho あげます khi đối tượng nhận là cấp dưới thân mật trong gia đình, thú cưng hoặc cây cối (ví dụ: tưới nước cho hoa, cho chó ăn).',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'V-て + やります', example: '犬に 餌を やります' }
    ],
    examples: [
      {
        id: 'ex-n4-41-2',
        japanese: '毎朝花に水をやっています。',
        reading: 'まいあさはなにみずをやっています。',
        vietnamese: 'Mỗi sáng tôi đều tưới nước cho hoa.'
      }
    ],
    quickQuiz: {
      question: '弟におもちゃを（　）ました。',
      questionVi: 'Tôi đã cho em trai đồ chơi.',
      options: ['やり', 'いただき', 'ください', 'さしあげ'],
      optionsVi: ['Cho em nhỏ (yari)', 'Nhận từ bề trên', 'Bề trên cho', 'Kính dâng bề trên'],
      correctIndex: 0,
      explanation: 'Cho em nhỏ hoặc động vật: やりました.'
    }
  },

  // =========================================================================
  // BÀI 42: MỤC ĐÍCH HÀNH ĐỘNG & CÔNG DỤNG
  // =========================================================================
  {
    id: 'n4-42-tame-ni',
    lessonId: 'minna-42',
    lessonNumber: 42,
    lessonTitle: 'Bài 42: Mục đích hành động & Công dụng',
    curriculum: 'MINNA',
    grammarPoint: 'V-る / N の ために',
    reading: 'ために',
    romaji: 'tame ni',
    level: 'N4',
    category: 'purpose',
    meaningVi: 'Để làm gì / Vì lợi ích của ai đó (Mục đích có ý chí cao)',
    structure: 'V-る / N の + ために、〜',
    formality: 'Lịch sự',
    nuance: 'Khác với ように, chủ ngữ ở 2 vế của ために bắt buộc phải đồng nhất và động từ ở vế trước là động từ có ý chí mạnh mẽ (mua nhà, du học).',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'V-る (có ý chí) + ために', example: '家を 買うために 貯金します' },
      { partOfSpeech: 'Danh từ', rule: 'N + の + ために', example: '家族の ために (vì gia đình)' }
    ],
    examples: [
      {
        id: 'ex-n4-42-1',
        japanese: '日本へ留学するために、日本語を一生懸命勉強しています。',
        reading: 'にほんへりゅうがくするために、にほんごをいっしょうけんめいべんきょうしています。',
        vietnamese: 'Để đi du học Nhật Bản, tôi đang chăm chỉ học tiếng Nhật.'
      }
    ],
    quickQuiz: {
      question: '健康の（　）、毎日ジョギングをしています。',
      questionVi: 'Vì sức khỏe, tôi chạy bộ mỗi ngày.',
      options: ['ために', 'ように', 'せいで', 'おかげで'],
      optionsVi: ['Vì mục đích (Danh từ + のために)', 'Để mà', 'Tại vì tiêu cực', 'Nhờ vào'],
      correctIndex: 0,
      explanation: 'Mục đích tốt đẹp cho danh từ: 健康のために.'
    }
  },
  {
    id: 'n4-42-no-ni-tsukau',
    lessonId: 'minna-42',
    lessonNumber: 42,
    lessonTitle: 'Bài 42: Mục đích hành động & Công dụng',
    curriculum: 'MINNA',
    grammarPoint: 'V-る のに 使います / 便利です / かかります',
    reading: 'のに〜つかいます',
    romaji: 'no ni tsukaimasu',
    level: 'N4',
    category: 'basics',
    meaningVi: 'Dùng vào việc gì / Tiện lợi cho việc gì / Mất bao nhiêu để làm gì',
    structure: 'V-る + のに + [使います / 便利です / 時間・お金がかかります]',
    formality: 'Lịch sự',
    nuance: 'Dùng danh từ hóa「のに」để chỉ mục đích đánh giá tính năng, công dụng hoặc chi phí tiêu tốn cho việc đó.',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'V-る + のに + 使います', example: '紙を 切るのに 使います' }
    ],
    examples: [
      {
        id: 'ex-n4-42-2',
        japanese: 'このハサミは花を切るのに使います。',
        reading: 'このはさみははなをきるのにつかいます。',
        vietnamese: 'Chiếc kéo này dùng để cắt hoa.'
      }
    ],
    quickQuiz: {
      question: 'この辞書は漢字を調べる（　）とても便利です。',
      questionVi: 'Cuốn từ điển này rất tiện lợi để tra cứu chữ Hán.',
      options: ['のに', 'ので', 'ため', 'よう'],
      optionsVi: ['Cho mục đích sử dụng (no ni)', 'Bởi vì', 'Để vì', 'Để mà'],
      correctIndex: 0,
      explanation: 'Tiện lợi cho việc gì: 調べるのに便利です.'
    }
  },

  // =========================================================================
  // BÀI 43: DỰ ĐOÁN NGOẠI CẢNH (〜そうです [TRÔNG CÓ VẺ])
  // =========================================================================
  {
    id: 'n4-43-sou-desu-looks-like',
    lessonId: 'minna-43',
    lessonNumber: 43,
    lessonTitle: 'Bài 43: Dự đoán ngoại cảnh (〜そうです [trông có vẻ])',
    curriculum: 'MINNA',
    grammarPoint: '〜そうです (Trông có vẻ...)',
    reading: 'そうです',
    romaji: 'sou desu (yousu)',
    level: 'N4',
    category: 'judgment',
    meaningVi: 'Trông có vẻ... / Sắp sửa... (Phán đoán trực quan qua mắt nhìn)',
    structure: 'V(bỏ ます) / A-い(bỏ い) / Na(bỏ だ) + そうです',
    formality: 'Lịch sự',
    nuance: 'Dự đoán trạng thái trực quan ngay trước mắt mà chưa kiểm chứng thực tế. Không dùng cho những tính từ hiển nhiên như きれい, 赤い.',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'V(bỏ ます) + そうです (sắp sửa)', example: '雨が 降りそうです' },
      { partOfSpeech: 'Tính từ đuôi い', rule: 'A-い (bỏ い) + そうです', example: 'おいしそうです' }
    ],
    examples: [
      {
        id: 'ex-n4-43-1',
        japanese: '今にも雨が降りそうです。傘を持っていきましょう。',
        reading: 'いまにもあめがふりそうです。かさをもっていきましょう。',
        vietnamese: 'Trời trông như sắp mưa đến nơi rồi. Chúng ta hãy mang ô theo nhé.'
      }
    ],
    cautionNotes: ['Tính từ いい (tốt) biến thành よさそうです (yosasou desu).'],
    quickQuiz: {
      question: 'このケーキはとても（　）そうです。',
      questionVi: 'Chiếc bánh kem này trông có vẻ rất ngon.',
      options: ['おいし', 'おいしい', 'おいしくて', 'おいしかった'],
      optionsVi: ['Bỏ い (おいしそうです)', 'Giữ nguyên い', 'Thể Te', 'Thể Ta'],
      correctIndex: 0,
      explanation: 'Tính từ đuôi い bỏ い trước そうです: おいしそうです.'
    }
  },
  {
    id: 'n4-43-te-kimasu',
    lessonId: 'minna-43',
    lessonNumber: 43,
    lessonTitle: 'Bài 43: Dự đoán ngoại cảnh (〜そうです [trông có vẻ])',
    curriculum: 'MINNA',
    grammarPoint: 'V-て来ます (Đi làm gì rồi quay lại)',
    reading: 'てきます',
    romaji: 'te kimasu',
    level: 'N4',
    category: 'basics',
    meaningVi: 'Đi làm việc gì đó rồi sẽ quay trở lại đây ngay',
    structure: 'V-て + 来ます (Chỗ đi: 〜へ 行って来ます)',
    formality: 'Lịch sự',
    nuance: 'Rời vị trí hiện tại đi làm một việc ngắn rồi cam kết sẽ quay lại điểm ban đầu (ví dụ: đi mua thuốc lá, đi vệ sinh).',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'V-て + 来ます', example: 'ちょっと コンビニへ 行って来ます' }
    ],
    examples: [
      {
        id: 'ex-n4-43-2',
        japanese: 'ちょっと電話をかけてきます。',
        reading: 'ちょっとでんわをかけてきます。',
        vietnamese: 'Tôi đi gọi điện thoại một lát rồi quay lại ngay nhé.'
      }
    ],
    quickQuiz: {
      question: 'タバコを（　）きますから、ここで待っていてください。',
      questionVi: 'Tôi đi mua thuốc lá rồi quay lại ngay nên bạn cứ đợi ở đây nhé.',
      options: ['買って', '買う', '買いた', '買い'],
      optionsVi: ['Mua (thể Te)', 'Thể từ điển', 'Thể Ta', 'Thân từ'],
      correctIndex: 0,
      explanation: 'Đi mua rồi quay lại: 買ってきます.'
    }
  },

  // =========================================================================
  // BÀI 44: QUÁ MỨC & DỄ / KHÓ LÀM GÌ
  // =========================================================================
  {
    id: 'n4-44-sugiru',
    lessonId: 'minna-44',
    lessonNumber: 44,
    lessonTitle: 'Bài 44: Quá mức & Dễ / Khó làm gì',
    curriculum: 'MINNA',
    grammarPoint: '〜すぎます (Quá mức)',
    reading: 'すぎます',
    romaji: 'sugimasu',
    level: 'N4',
    category: 'degree',
    meaningVi: 'Làm gì quá mức / Tính chất quá đà (vượt ngưỡng kiểm soát)',
    structure: 'V(bỏ ます) / A-い(bỏ い) / Na(bỏ だ) + すぎます',
    formality: 'Lịch sự',
    nuance: 'Diễn tả trạng thái vượt quá mức độ thông thường, gây ra hậu quả tiêu cực hoặc khó chịu.',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'V(thân ます) + すぎます', example: '食べすぎました' },
      { partOfSpeech: 'Tính từ đuôi い', rule: 'A-い(bỏ い) + すぎます', example: '高すぎます' }
    ],
    examples: [
      {
        id: 'ex-n4-44-1',
        japanese: '昨日はお酒を飲みすぎました。',
        reading: 'きのうはおさけをのみすぎました。',
        vietnamese: 'Hôm qua tôi đã uống quá nhiều rượu.'
      }
    ],
    quickQuiz: {
      question: 'この料理は辛（　）て、食べられません。',
      questionVi: 'Món này cay quá mức nên tôi không ăn được.',
      options: ['すぎ', 'そう', 'そうに', 'たい'],
      optionsVi: ['Quá mức (sugite)', 'Trông có vẻ', 'Một cách', 'Muốn'],
      correctIndex: 0,
      explanation: 'Cay quá mức: 辛すぎます.'
    }
  },
  {
    id: 'n4-44-yasui-nikui',
    lessonId: 'minna-44',
    lessonNumber: 44,
    lessonTitle: 'Bài 44: Quá mức & Dễ / Khó làm gì',
    curriculum: 'MINNA',
    grammarPoint: 'V(bỏ ます) + やすいです / にくいです',
    reading: 'やすい / にくい',
    romaji: 'yasui / nikui',
    level: 'N4',
    category: 'basics',
    meaningVi: 'Dễ làm gì (やすい) / Khó làm gì (にくい)',
    structure: 'V(thân ます) + やすい / にくい (biến đổi như tính từ đuôi い)',
    formality: 'Lịch sự',
    nuance: 'Đánh giá tính chất của đồ vật hoặc hoàn cảnh khiến hành động đó dễ thực hiện hoặc gây trở ngại khó thực hiện.',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'V(bỏ ます) + やすい / にくい', example: '飲みやすい、使いにくい' }
    ],
    examples: [
      {
        id: 'ex-n4-44-2',
        japanese: 'この薬は苦くて、飲みにくいです。',
        reading: 'このくすりはにがくて、のみにくいです。',
        vietnamese: 'Thuốc này đắng nên khó uống quá.'
      }
    ],
    quickQuiz: {
      question: 'このペンはとても書き（　）です。',
      questionVi: 'Cây bút này rất dễ viết.',
      options: ['やすい', 'すぎ', 'そう', 'たい'],
      optionsVi: ['Dễ làm gì (yasui)', 'Quá mức', 'Trông có vẻ', 'Muốn'],
      correctIndex: 0,
      explanation: 'Dễ làm một hành động: V-やすい → 書きやすいです.'
    }
  },
  {
    id: 'n4-44-ku-ni-suru',
    lessonId: 'minna-44',
    lessonNumber: 44,
    lessonTitle: 'Bài 44: Quá mức & Dễ / Khó làm gì',
    curriculum: 'MINNA',
    grammarPoint: 'A-く / Na-に / N に します',
    reading: 'にします / くします',
    romaji: 'ku shimasu / ni shimasu',
    level: 'N4',
    category: 'basics',
    meaningVi: 'Làm cho trở nên... / Chọn cái gì',
    structure: 'A-い(bỏ い) + くします / Na-に します / N に します',
    formality: 'Lịch sự',
    nuance: 'Người nói chủ động tác động để biến đổi thuộc tính của sự vật (làm cho ngắn đi, làm cho sạch sẽ, chỉnh âm thanh to lên).',
    formationRules: [
      { partOfSpeech: 'Tính từ đuôi い', rule: 'A-く + します', example: '音を 大きくします (vặn to tiếng)' },
      { partOfSpeech: 'Tính từ đuôi な', rule: 'Na + に + します', example: '部屋を きれいにします (dọn sạch)' }
    ],
    examples: [
      {
        id: 'ex-n4-44-3',
        japanese: '髪を短くしました。',
        reading: 'かみをみじかくしました。',
        vietnamese: 'Tôi đã cắt tóc ngắn đi rồi.'
      }
    ],
    quickQuiz: {
      question: '部屋をきれいに（　）ください。',
      questionVi: 'Hãy dọn dẹp phòng sạch sẽ nhé.',
      options: ['して', 'なって', 'あり', 'い'],
      optionsVi: ['Làm cho (shite kudasai)', 'Tự trở nên', 'Có', 'Ở'],
      correctIndex: 0,
      explanation: 'Chủ động làm cho sạch: きれいにしてください.'
    }
  },

  // =========================================================================
  // BÀI 45: TRƯỜNG HỢP GIẢ ĐỊNH & BẤT MÃN NHƯỢNG BỘ
  // =========================================================================
  {
    id: 'n4-45-baai-wa',
    lessonId: 'minna-45',
    lessonNumber: 45,
    lessonTitle: 'Bài 45: Trường hợp giả định & Bất mãn nhượng bộ',
    curriculum: 'MINNA',
    grammarPoint: '〜場合は (Trong trường hợp...)',
    reading: 'ばあいは',
    romaji: 'baai wa',
    level: 'N4',
    category: 'condition',
    meaningVi: 'Trong trường hợp... / Khi xảy ra tình huống...',
    structure: 'Thể thông thường (Na-な / N-の) + 場合は',
    formality: 'Trang trọng',
    nuance: 'Dùng trong thông báo hướng dẫn, nội quy hoặc tình huống khẩn cấp giả định (hỏa hoạn, mất thẻ, muộn giờ).',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'V (thông thường) + 場合は', example: '遅れる 場合は' },
      { partOfSpeech: 'Danh từ', rule: 'N + の + 場合は', example: '火事の 場合は' }
    ],
    examples: [
      {
        id: 'ex-n4-45-1',
        japanese: '火事や地震の場合は、エレベーターを使わないでください。',
        reading: 'かじやじしんのばあいは、えれべーたーをつかわないでください。',
        vietnamese: 'Trong trường hợp có hỏa hoạn hoặc động đất, xin vui lòng không sử dụng thang máy.'
      }
    ],
    quickQuiz: {
      question: '領収書が必要（　）場合は、お申し付けください。',
      questionVi: 'Trong trường hợp cần hóa đơn, quý khách vui lòng thông báo cho chúng tôi.',
      options: ['な', 'の', 'だ', 'に'],
      optionsVi: ['Đi với tính từ đuôi Na', 'Đi với Danh từ', 'Động từ kết thúc', 'Đi với trợ từ'],
      correctIndex: 0,
      explanation: 'Tính từ đuôi な 必要 đi với 場合は cần giữ「な」: 必要な場合.'
    }
  },
  {
    id: 'n4-45-noni',
    lessonId: 'minna-45',
    lessonNumber: 45,
    lessonTitle: 'Bài 45: Trường hợp giả định & Bất mãn nhượng bộ',
    curriculum: 'MINNA',
    grammarPoint: '〜のに',
    reading: 'のに',
    romaji: 'noni',
    level: 'N4',
    category: 'condition',
    meaningVi: 'Thế mà / Dù vậy mà... (Biểu thị sự thất vọng, bất mãn, trái ngược kỳ vọng)',
    structure: 'Thể thông thường (Na/N + な) + のに',
    formality: 'Thân mật',
    nuance: 'Biểu lộ sự bất ngờ, thất vọng hoặc trách móc khi kết quả thực tế đi ngược hoàn toàn với dự đoán thông thường.',
    formationRules: [
      { partOfSpeech: 'Thể thông thường', rule: 'V-thể ngắn + のに', example: '約束した のに 来なかった' },
      { partOfSpeech: 'Danh từ', rule: 'N + な + のに', example: '日曜日な のに 働きます' }
    ],
    examples: [
      {
        id: 'ex-n4-45-2',
        japanese: '一生懸命勉強したのに、試験に不合格でした。',
        reading: 'いっしょうけんめいべんきょうしたのに、しけんにふごうかくなりました。',
        vietnamese: 'Dù đã học bài hết sức chăm chỉ thế mà tôi vẫn thi trượt.'
      }
    ],
    quickQuiz: {
      question: '薬を飲んだ（　）、頭痛が治りません。',
      questionVi: 'Đã uống thuốc rồi thế mà cơn đau đầu vẫn không khỏi.',
      options: ['のに', 'ので', 'から', 'なら'],
      optionsVi: ['Thế mà (bất mãn)', 'Bởi vì', 'Vì', 'Nếu'],
      correctIndex: 0,
      explanation: 'Trái ngược với kỳ vọng mong đợi dùng「のに」.'
    }
  },

  // =========================================================================
  // BÀI 46: CÁC GIAI ĐOẠN CỦA HÀNH ĐỘNG VỚI TOKORO
  // =========================================================================
  {
    id: 'n4-46-tokoro',
    lessonId: 'minna-46',
    lessonNumber: 46,
    lessonTitle: 'Bài 46: Các giai đoạn của hành động với Tokoro',
    curriculum: 'MINNA',
    grammarPoint: 'V-るところ / V-ているところ / V-たところ',
    reading: 'ところ',
    romaji: 'tokoro',
    level: 'N4',
    category: 'time',
    meaningVi: 'Sắp làm / Đang làm / Vừa mới làm xong (Thời điểm hành động)',
    structure: 'V-る (sắp) / V-ている (đang dở) / V-た (vừa dứt) + ところです',
    formality: 'Lịch sự',
    nuance: 'Xác định chính xác thời điểm của hành động ngay tại thời điểm nói. Đi kèm phó từ: これから (sắp), 今 (đang), たった今 (vừa dứt tức thì).',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'V-る + ところ (chuẩn bị)', example: 'これから 出かける ところです' },
      { partOfSpeech: 'Động từ', rule: 'V-た + ところ (vừa mới)', example: 'たった今 食べた ところです' }
    ],
    examples: [
      {
        id: 'ex-n4-46-1',
        japanese: '今、ご飯を食べているところですから、後で電話します。',
        reading: 'いま、ごはんをたべているところですから、あとででんわします。',
        vietnamese: 'Bây giờ tôi đang ăn cơm dở nên lát nữa sẽ gọi lại sau nhé.'
      }
    ],
    quickQuiz: {
      question: 'たった今帰って（　）ところです。',
      questionVi: 'Tôi vừa mới về tới nhà tức thì xong.',
      options: ['きた', 'くる', 'きている', 'こない'],
      optionsVi: ['Đã đến (thể Ta)', 'Thể từ điển', 'Thể Teiru', 'Thể Nai'],
      correctIndex: 0,
      explanation: 'Vừa mới hoàn thành tức thì đi với V-たところ: 帰ってきたところです.'
    }
  },
  {
    id: 'n4-46-bakari',
    lessonId: 'minna-46',
    lessonNumber: 46,
    lessonTitle: 'Bài 46: Các giai đoạn của hành động với Tokoro',
    curriculum: 'MINNA',
    grammarPoint: 'V-たばかりです',
    reading: 'たばかりです',
    romaji: 'ta bakari desu',
    level: 'N4',
    category: 'time',
    meaningVi: 'Vừa mới làm gì... (Thời gian tâm lý cảm nhận chủ quan)',
    structure: 'V-た + ばかりです',
    formality: 'Lịch sự',
    nuance: 'Khác với V-たところ (vừa xong vài giây/phút trước), V-たばかり thể hiện cảm nhận chủ quan của người nói rằng thời gian trôi qua chưa lâu, dù thực tế có thể đã xảy ra hàng tuần hoặc hàng tháng (ví dụ: vừa mới vào công ty tháng trước).',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'V-た + ばかりです', example: '先月 日本に来た ばかりです' }
    ],
    examples: [
      {
        id: 'ex-n4-46-2',
        japanese: 'このパソコンは先週買ったばかりなのに、もう壊れてしまった。',
        reading: 'このぱそこんはせんしゅうかったばかりなのに、もうこわれてしまった。',
        vietnamese: 'Chiếc máy tính này tuần trước vừa mới mua thế mà đã hỏng mất rồi.'
      }
    ],
    quickQuiz: {
      question: '日本へ来た（　）なので、まだ地理がよく分かりません。',
      questionVi: 'Vì tôi vừa mới sang Nhật nên vẫn chưa nắm rõ đường xá.',
      options: ['ばかり', 'ところ', 'とおり', 'はず'],
      optionsVi: ['Vừa mới (cảm nhận chủ quan)', 'Vừa dứt tức thì', 'Đúng theo', 'Chắc chắn'],
      correctIndex: 0,
      explanation: 'Cảm nhận thời gian trôi qua chưa lâu: 来たばかり.'
    }
  },
  {
    id: 'n4-46-hazu-desu',
    lessonId: 'minna-46',
    lessonNumber: 46,
    lessonTitle: 'Bài 46: Các giai đoạn của hành động với Tokoro',
    curriculum: 'MINNA',
    grammarPoint: '〜はずです',
    reading: 'はずです',
    romaji: 'hazu desu',
    level: 'N4',
    category: 'judgment',
    meaningVi: 'Chắc chắn là... (Phán đoán dựa trên cơ sở lý lẽ logic vững chắc)',
    structure: 'Thể thông thường (Na-な / N-の) + はずです',
    formality: 'Lịch sự',
    nuance: 'Dựa trên quy luật, lịch trình hoặc căn cứ logic xác thực để khẳng định điều gì đó đương nhiên phải xảy ra.',
    formationRules: [
      { partOfSpeech: 'Thể thông thường', rule: 'Thể thông thường + はずです', example: '今日は 日曜日だから 休みのはずです' }
    ],
    examples: [
      {
        id: 'ex-n4-46-3',
        japanese: '彼は日本に１０年も住んでいたから、日本語が上手なはずです。',
        reading: 'かれはにほんにじゅうねんもすんでいたから、にほんごがじょうずなはずです。',
        vietnamese: 'Anh ấy đã sống ở Nhật Bản suốt 10 năm nên tiếng Nhật chắc chắn là phải giỏi rồi.'
      }
    ],
    quickQuiz: {
      question: '荷物は昨日発送したから、明日届く（　）です。',
      questionVi: 'Vì hàng đã gửi đi từ hôm qua nên ngày mai chắc chắn sẽ tới nơi.',
      options: ['はず', 'わけ', 'つもり', 'とおり'],
      optionsVi: ['Chắc chắn theo logic (hazu)', 'Đạo lý', 'Dự định', 'Theo như'],
      correctIndex: 0,
      explanation: 'Căn cứ thời gian logic: 届くはずです.'
    }
  },

  // =========================================================================
  // BÀI 47: NGHE NÓI TRUYỀN ĐẠT (〜そうです [TRUYỀN ĐẠT])
  // =========================================================================
  {
    id: 'n4-47-sou-desu-hearsay',
    lessonId: 'minna-47',
    lessonNumber: 47,
    lessonTitle: 'Bài 47: Nghe nói truyền đạt (〜そうです [truyền đạt])',
    curriculum: 'MINNA',
    grammarPoint: '〜そうです (Nghe nói là...)',
    reading: 'そうです',
    romaji: 'sou desu (denbun)',
    level: 'N4',
    category: 'judgment',
    meaningVi: 'Nghe nói là... (Truyền đạt lại thông tin nghe được từ người khác/báo chí)',
    structure: 'Thể thông thường (Na/N + だ) + そうです',
    formality: 'Lịch sự',
    nuance: 'Khác với そうです ở bài 43 (phỏng đoán bằng mắt nhìn), mẫu câu này truyền đạt lại 100% nguyên văn thông tin nghe từ nguồn khác, vế trước giữ nguyên thể thông thường (kể cả だ).',
    formationRules: [
      { partOfSpeech: 'Thể thông thường', rule: 'Thể thông thường + そうです', example: '明日は 雨が 降るそうです' },
      { partOfSpeech: 'Danh từ', rule: 'N + だ + そうです', example: '彼は 独身だそうです' }
    ],
    examples: [
      {
        id: 'ex-n4-47-1',
        japanese: '天気予報によると、明日は暖かくなるそうです。',
        reading: 'てんきよほうによると、あしたはあたたかくなるそうです。',
        vietnamese: 'Theo dự báo thời tiết thì nghe nói ngày mai trời sẽ trở nên ấm áp.'
      }
    ],
    cautionNotes: ['Phân biệt: 雨が降りそうです (Trông trời sắp mưa - bài 43) và 雨が降るそうです (Nghe nói trời sẽ mưa - bài 47).'],
    quickQuiz: {
      question: 'ニュースによると、東京で大きな地震が（　）そうです。',
      questionVi: 'Theo tin tức thì nghe nói vừa có trận động đất lớn ở Tokyo.',
      options: ['あった', 'あり', 'あ', 'あって'],
      optionsVi: ['Đã có (thể thông thường)', 'Thân từ', 'Rút gọn', 'Thể Te'],
      correctIndex: 0,
      explanation: 'Nghe nói truyền đạt đi cùng câu thể thông thường: 地震があったそうです.'
    }
  },
  {
    id: 'n4-47-you-desu',
    lessonId: 'minna-47',
    lessonNumber: 47,
    lessonTitle: 'Bài 47: Nghe nói truyền đạt (〜そうです [truyền đạt])',
    curriculum: 'MINNA',
    grammarPoint: '〜ようです (Hình như là...)',
    reading: 'ようです',
    romaji: 'you desu',
    level: 'N4',
    category: 'judgment',
    meaningVi: 'Dường như / Có vẻ như là... (Suy đoán dựa trên chứng cứ cảm giác)',
    structure: 'Thể thông thường (Na-な / N-の) + ようです',
    formality: 'Lịch sự',
    nuance: 'Người nói tự mình nhìn, nghe, ngửi hoặc cảm nhận thấy các dấu hiệu khách quan xung quanh để đưa ra suy đoán (ví dụ: thấy người ta cầm ô ướt sũng đoán là ngoài trời đang mưa).',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'V (thông thường) + ようです', example: '雨が 降っている ようです' },
      { partOfSpeech: 'Danh từ', rule: 'N + の + ようです', example: '風邪の ようです' }
    ],
    examples: [
      {
        id: 'ex-n4-47-2',
        japanese: '外で人の声がします。誰か来たようです。',
        reading: 'そとでひとのこえがします。だれかきたようです。',
        vietnamese: 'Có tiếng người nói bên ngoài. Hình như có ai đó vừa đến.'
      }
    ],
    quickQuiz: {
      question: '道が濡れているから、昨夜雨が（　）ようです。',
      questionVi: 'Mặt đường đang ướt sũng nên hình như đêm qua trời đã mưa.',
      options: ['降った', '降る', '降って', '降り'],
      optionsVi: ['Đã mưa (thể Ta)', 'Thể từ điển', 'Thể Te', 'Thân từ'],
      correctIndex: 0,
      explanation: 'Suy đoán sự việc đã xảy ra trong quá khứ: 降ったようです.'
    }
  },

  // =========================================================================
  // BÀI 48: ĐỘNG TỪ SAI KHIẾN (使役動詞)
  // =========================================================================
  {
    id: 'n4-48-shieki',
    lessonId: 'minna-48',
    lessonNumber: 48,
    lessonTitle: 'Bài 48: Động từ Sai khiến (使役動詞)',
    curriculum: 'MINNA',
    grammarPoint: 'Động từ Sai khiến (使役形: 〜せる / 〜させる)',
    reading: 'しえきけい',
    romaji: 'shiekikei',
    level: 'N4',
    category: 'passive_causative',
    meaningVi: 'Bắt ai làm / Cho phép ai làm gì',
    structure: 'N1(người ra lệnh) は N2(người thực hiện) に/を [V-sai khiến]',
    formality: 'Lịch sự',
    nuance: 'Cấp trên ra lệnh hoặc cha mẹ cho phép/bắt con cái làm gì.',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'Nhóm 1: u → aseru (行かせる)', example: '行く → 行かせる' },
      { partOfSpeech: 'Động từ', rule: 'Nhóm 2: ru → saseru (食べさせる)', example: '食べる → 食べさせる' },
      { partOfSpeech: 'Động từ', rule: 'Nhóm 3: させる、来させる (こさせる)', example: 'する → させる' }
    ],
    examples: [
      {
        id: 'ex-n4-48-1',
        japanese: '先生は学生に作文を書かせました。',
        reading: 'せんせいはがくせいにさくぶんをかかせました。',
        vietnamese: 'Thầy giáo đã bắt học sinh viết bài văn.'
      }
    ],
    quickQuiz: {
      question: '母は子供に野菜を（　）せました。',
      questionVi: 'Người mẹ đã bắt con ăn rau.',
      options: ['食べさ', '食べ', '食べた', '食べる'],
      optionsVi: ['Sai khiến nhóm 2 (tabesaseru)', 'Ăn', 'Đã ăn', 'Thể từ điển'],
      correctIndex: 0,
      explanation: 'Động từ nhóm 2 chia sai khiến là 食べさせる: 食べさせました.'
    }
  },
  {
    id: 'n4-48-sasete-kudasai',
    lessonId: 'minna-48',
    lessonNumber: 48,
    lessonTitle: 'Bài 48: Động từ Sai khiến (使役動詞)',
    curriculum: 'MINNA',
    grammarPoint: 'V-させていただけませんか / させてください',
    reading: 'させていただけませんか',
    romaji: 'sasete itadakemasen ka',
    level: 'N4',
    category: 'keigo',
    meaningVi: 'Xin phép cho tôi được làm gì... (Xin phép cấp trên)',
    structure: 'V-sai khiến thể Te + いただけませんか / ください',
    formality: 'Trang trọng',
    nuance: 'Khi người nói muốn xin phép người có chức vụ cao hơn cho bản thân mình được thực hiện một hành động mang tính cá nhân (về sớm, nghỉ phép, phát biểu ý kiến).',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'V-sai khiến (thể Te) + いただけませんか', example: '休ませていただけませんか' }
    ],
    examples: [
      {
        id: 'ex-n4-48-2',
        japanese: '頭が痛いので、今日は早く帰らせていただけませんか。',
        reading: 'あたまがいたいので、きょうははやくかえらせていただけませんか。',
        vietnamese: 'Vì em bị đau đầu, hôm nay xin phép cho em được về sớm có được không ạ?'
      }
    ],
    quickQuiz: {
      question: '私の意見を（　）てください。',
      questionVi: 'Xin hãy cho phép tôi được nói ý kiến của mình.',
      options: ['言わせ', '言って', '言われ', '言い'],
      optionsVi: ['Sai khiến cho phép (iwasete)', 'Thể Te', 'Bị động', 'Thân từ'],
      correctIndex: 0,
      explanation: 'Xin phép cho tôi làm gì: 言わせてください.'
    }
  },

  // =========================================================================
  // BÀI 49: TÔN KÍNH NGỮ (尊敬語)
  // =========================================================================
  {
    id: 'n4-49-sonkeigo',
    lessonId: 'minna-49',
    lessonNumber: 49,
    lessonTitle: 'Bài 49: Tôn kính ngữ (尊敬語)',
    curriculum: 'MINNA',
    grammarPoint: 'Tôn kính ngữ (尊敬語 - Sonkeigo)',
    reading: 'そんけいご',
    romaji: 'sonkeigo',
    level: 'N4',
    category: 'keigo',
    meaningVi: 'Kính trọng hành vi của đối phương, khách hàng, cấp trên',
    structure: '1. Động từ đặc biệt / 2. お V(bỏ ます) になります / 3. V-bị động',
    formality: 'Trang trọng',
    nuance: 'Nâng cao vị thế của người đối thoại hoặc nhân vật được nhắc tới để bày tỏ lòng kính trọng. Tuyệt đối không dùng cho hành vi của chính bản thân mình.',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'Đặc biệt: 行く/来る/いる → いらっしゃる', example: 'いらっしゃる' },
      { partOfSpeech: 'Động từ', rule: 'Đặc biệt: 言う → おっしゃる、食べる → 召し上がる', example: '召し上がる' },
      { partOfSpeech: 'Động từ', rule: 'Quy tắc: お + V(bỏ ます) + になります', example: 'お読みになります' }
    ],
    examples: [
      {
        id: 'ex-n4-49-1',
        japanese: '社長は何時にいらっしゃいますか。',
        reading: 'しゃちょうはなんじにいらっしゃいますか。',
        vietnamese: 'Mấy giờ thì ngài giám đốc sẽ đến ạ?'
      }
    ],
    quickQuiz: {
      question: '先生、この本をもう（　）になりましたか。',
      questionVi: 'Thưa thầy, thầy đã đọc cuốn sách này chưa ạ?',
      options: ['お読み', '読み', '読まれ', '読んで'],
      optionsVi: ['Tôn kính ngữ (o-yomi ni narimashita)', 'Thường', 'Bị động', 'Thể Te'],
      correctIndex: 0,
      explanation: 'Công thức tôn kính ngữ: お + V(thân ます) + になります: お読みになりました.'
    }
  },
  {
    id: 'n4-49-o-kudasai',
    lessonId: 'minna-49',
    lessonNumber: 49,
    lessonTitle: 'Bài 49: Tôn kính ngữ (尊敬語)',
    curriculum: 'MINNA',
    grammarPoint: 'お V(bỏ ます) ください / ご N ください',
    reading: 'お〜ください',
    romaji: 'o ~ kudasai',
    level: 'N4',
    category: 'keigo',
    meaningVi: 'Kính mời quý khách / quý thầy làm gì... (Yêu cầu lịch sự trang trọng)',
    structure: 'お + V(thân ます) + ください / ご + N + ください',
    formality: 'Trang trọng',
    nuance: 'Dùng trong thông báo khách sạn, nhà hàng, cửa hàng dịch vụ khi hướng dẫn khách hàng.',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'お + V(thân ます) + ください', example: 'お入りください (Mời vào)' },
      { partOfSpeech: 'Danh từ', rule: 'ご + Danh từ Hán tự + ください', example: 'ご注意ください (Xin chú ý)' }
    ],
    examples: [
      {
        id: 'ex-n4-49-2',
        japanese: '少々お待ちください。',
        reading: 'しょうしょうおまちください。',
        vietnamese: 'Xin quý khách vui lòng đợi trong giây lát ạ.'
      }
    ],
    quickQuiz: {
      question: 'こちらに名前を（　）書きください。',
      questionVi: 'Xin quý khách vui lòng ký tên vào đây ạ.',
      options: ['お', 'ご', 'み', 'に'],
      optionsVi: ['Tiền tố thuần Nhật お', 'Tiền tố Hán tự ご', 'Tiền tố', 'Trợ từ'],
      correctIndex: 0,
      explanation: 'Động từ 書く là từ thuần Nhật nên dùng tiền tố お: お書きください.'
    }
  },

  // =========================================================================
  // BÀI 50: KHIÊM NHƯỜNG NGỮ (謙譲語)
  // =========================================================================
  {
    id: 'n4-50-kenjougo',
    lessonId: 'minna-50',
    lessonNumber: 50,
    lessonTitle: 'Bài 50: Khiêm nhường ngữ (謙譲語)',
    curriculum: 'MINNA',
    grammarPoint: 'Khiêm nhường ngữ (謙譲語 - Kenjougo)',
    reading: 'けんじょうご',
    romaji: 'kenjougo',
    level: 'N4',
    category: 'keigo',
    meaningVi: 'Hạ thấp hành vi bản thân để tôn vinh đối phương',
    structure: '1. Động từ đặc biệt / 2. お V(bỏ ます) します / 3. ご N します',
    formality: 'Trang trọng',
    nuance: 'Người nói hạ mình xuống khi thực hiện hành động liên quan tới đối phương, đối tác hoặc khách hàng nhằm thể hiện sự lịch sự và khiêm tốn tối đa.',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'Đặc biệt: 行く/来る → 参る (まいる)、いる → おる', example: '参ります' },
      { partOfSpeech: 'Động từ', rule: 'Đặc biệt: 言う → 申す (もうす)、する → いたす', example: '申します' },
      { partOfSpeech: 'Động từ', rule: 'Quy tắc: お + V(bỏ ます) + します', example: 'お持ちします (Tôi xin phép cầm giúp)' }
    ],
    examples: [
      {
        id: 'ex-n4-50-1',
        japanese: '重そうですね。私が荷物をお持ちしましょうか。',
        reading: 'おもそうですね。わたしがにもつをおもちしましょうか。',
        vietnamese: 'Trông nặng quá nhỉ. Để tôi cầm giúp hành lý cho bạn nhé.'
      },
      {
        id: 'ex-n4-50-2',
        japanese: '明日１０時に参ります。',
        reading: 'あしたじゅうじにまいります。',
        vietnamese: 'Ngày mai lúc 10 giờ tôi sẽ đến ạ.'
      }
    ],
    quickQuiz: {
      question: '初めまして。ナムと（　）。よろしくお願いいたします。',
      questionVi: 'Rất vui được gặp bạn. Tôi tên là Nam. Rất mong được giúp đỡ.',
      options: ['申します', 'おっしゃいます', '参ります', 'いたします'],
      optionsVi: ['Tên là (khiêm nhường của 言う)', 'Tôn kính của 言う', 'Đi/Đến', 'Làm'],
      correctIndex: 0,
      explanation: 'Xưng tên bản thân khiêm tốn dùng「申します」(moushimasu).'
    }
  },
  {
    id: 'n4-50-gozaimasu',
    lessonId: 'minna-50',
    lessonNumber: 50,
    lessonTitle: 'Bài 50: Khiêm nhường ngữ (謙譲語)',
    curriculum: 'MINNA',
    grammarPoint: 'ございます / 〜でございます',
    reading: 'ございます',
    romaji: 'gozaimasu / de gozaimasu',
    level: 'N4',
    category: 'keigo',
    meaningVi: 'Là... / Có... (Văn phong lịch sự trang trọng cao nhất thay cho あります và です)',
    structure: 'あります → ございます / です → でございます',
    formality: 'Trang trọng',
    nuance: 'Dùng trong môi trường công sở, tiếp đón khách hàng thương mại hoặc phát thanh viên đài truyền hình.',
    formationRules: [
      { partOfSpeech: 'Danh từ', rule: 'Danh từ + でございます', example: '電話番号は〜でございます' }
    ],
    examples: [
      {
        id: 'ex-n4-50-3',
        japanese: 'はい、ABC商事でございます。',
        reading: 'はい、えーびーしーしょうじでございます。',
        vietnamese: 'Vâng, công ty thương mại ABC xin nghe ạ.'
      }
    ],
    quickQuiz: {
      question: 'お手洗いはあちらに（　）。',
      questionVi: 'Nhà vệ sinh ở đằng kia ạ.',
      options: ['ございます', 'あります', 'いらっしゃいます', '申します'],
      optionsVi: ['Lịch sự trang trọng (gozaimasu)', 'Bình thường', 'Tôn kính ngữ người', 'Khiêm nhường nói'],
      correctIndex: 0,
      explanation: 'Nói trang trọng với khách: あちらにございます.'
    }
  }
];
