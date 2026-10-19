import { GrammarMasterItem } from '../grammar.types';

export const N5_MINNA_I: GrammarMasterItem[] = [
  // =========================================================================
  // BÀI 1: GIỚI THIỆU BẢN THÂN & TRỢ TỪ CƠ BẢN
  // =========================================================================
  {
    id: 'n5-01-wa-desu',
    lessonId: 'minna-01',
    lessonNumber: 1,
    lessonTitle: 'Bài 1: Giới thiệu bản thân & Trợ từ cơ bản',
    curriculum: 'MINNA',
    grammarPoint: 'N1 は N2 です',
    reading: 'は〜です',
    romaji: 'wa desu',
    level: 'N5',
    category: 'basics',
    meaningVi: 'N1 là N2 (Câu khẳng định danh từ)',
    structure: 'N1 は N2 です',
    formality: 'Lịch sự',
    nuance: 'Mẫu câu cơ bản nhất trong tiếng Nhật. Trợ từ「は」(đọc là wa) đánh dấu N1 là chủ đề của câu,「です」biểu thị sự lịch sự và khẳng định.',
    formationRules: [
      { partOfSpeech: 'Danh từ', rule: 'N1 は N2 です', example: '私 は ベトナム人 です' }
    ],
    examples: [
      {
        id: 'ex-n5-01-1',
        japanese: '私はナムです。',
        reading: 'わたしはなむです。',
        vietnamese: 'Tôi là Nam.'
      },
      {
        id: 'ex-n5-01-2',
        japanese: 'マイク・ミラーさんはアメリカ人です。',
        reading: 'まいく・みらーさんはあめりかじんです。',
        vietnamese: 'Anh Mike Miller là người Mỹ.'
      }
    ],
    cautionNotes: ['Trợ từ は viết là chữ ha trong bảng chữ cái Hiragana nhưng bắt buộc phải phát âm là wa.'],
    quickQuiz: {
      question: '私（　）学生です。',
      questionVi: 'Tôi là học sinh.',
      options: ['は', 'が', 'を', 'に'],
      optionsVi: ['Trợ từ chủ đề', 'Trợ từ chủ ngữ', 'Trợ từ tân ngữ', 'Trợ từ thời gian'],
      correctIndex: 0,
      explanation: 'Đánh dấu chủ đề "Tôi" dùng trợ từ「は」.'
    }
  },
  {
    id: 'n5-01-ja-arimasen',
    lessonId: 'minna-01',
    lessonNumber: 1,
    lessonTitle: 'Bài 1: Giới thiệu bản thân & Trợ từ cơ bản',
    curriculum: 'MINNA',
    grammarPoint: 'N1 は N2 じゃありません',
    reading: 'じゃありません / ではありません',
    romaji: 'ja arimasen',
    level: 'N5',
    category: 'basics',
    meaningVi: 'N1 không phải là N2 (Câu phủ định danh từ)',
    structure: 'N1 は N2 じゃありません / ではありません',
    formality: 'Lịch sự',
    nuance: 'Dạng phủ định lịch sự của「です」. Trong giao tiếp nói hàng ngày thường dùng「じゃありません」, trong văn viết hoặc phát biểu trang trọng dùng「ではありません」.',
    formationRules: [
      { partOfSpeech: 'Danh từ', rule: 'N + じゃありません / ではありません', example: '先生 → 先生じゃありません' }
    ],
    examples: [
      {
        id: 'ex-n5-01-ja-1',
        japanese: 'サントスさんは学生じゃありません。',
        reading: 'さんとすさんはがくせいじゃありません。',
        vietnamese: 'Anh Santos không phải là học sinh.'
      }
    ],
    quickQuiz: {
      question: '山田さんは医者（　）。会社員です。',
      questionVi: 'Anh Yamada không phải là bác sĩ. Anh ấy là nhân viên công ty.',
      options: ['じゃありません', 'でした', 'です', 'あります'],
      optionsVi: ['Không phải là', 'Đã là', 'Là', 'Có đồ vật'],
      correctIndex: 0,
      explanation: 'Phủ định "không phải là bác sĩ" dùng「じゃありません」.'
    }
  },
  {
    id: 'n5-01-ka',
    lessonId: 'minna-01',
    lessonNumber: 1,
    lessonTitle: 'Bài 1: Giới thiệu bản thân & Trợ từ cơ bản',
    curriculum: 'MINNA',
    grammarPoint: 'N1 は N2 ですか',
    reading: 'ですか',
    romaji: 'desu ka',
    level: 'N5',
    category: 'basics',
    meaningVi: 'N1 có phải là N2 không? (Câu hỏi nghi vấn)',
    structure: 'N1 は N2 ですか (Trả lời: はい、N2 です / いいえ、N2 じゃありません)',
    formality: 'Lịch sự',
    nuance: 'Trợ từ nghi vấn「か」đặt ở cuối câu để tạo thành câu hỏi. Trong tiếng Nhật không dùng dấu chấm hỏi (?) mà thường chỉ dùng dấu chấm tròn (。), tuy nhiên trong sách hiện đại có thể dùng dấu hỏi.',
    formationRules: [
      { partOfSpeech: 'Danh từ', rule: 'Câu khẳng định + か', example: 'ミラーさんは 会社員ですか' }
    ],
    examples: [
      {
        id: 'ex-n5-01-ka-1',
        japanese: 'あなたは学生ですか。……はい、学生です。',
        reading: 'あなたはがくせいですか。はい、がくせいです。',
        vietnamese: 'Bạn có phải là học sinh không? ……Vâng, tôi là học sinh.'
      }
    ],
    quickQuiz: {
      question: 'あの人は木村さん（　）。……いいえ、違います。',
      questionVi: 'Người kia có phải là chị Kimura không? ……Không, không phải.',
      options: ['ですか', 'ですね', 'ですよ', 'でした'],
      optionsVi: ['Có phải không?', 'Nhỉ?', 'Đấy nhé!', 'Đã là'],
      correctIndex: 0,
      explanation: 'Hỏi xác nhận người kia có phải chị Kimura không dùng「ですか」.'
    }
  },
  {
    id: 'n5-01-mo',
    lessonId: 'minna-01',
    lessonNumber: 1,
    lessonTitle: 'Bài 1: Giới thiệu bản thân & Trợ từ cơ bản',
    curriculum: 'MINNA',
    grammarPoint: 'N も',
    reading: 'も',
    romaji: 'mo',
    level: 'N5',
    category: 'basics',
    meaningVi: 'N cũng... (Trợ từ đồng nhất)',
    structure: 'N1 は 〜 です。N2 も 〜 です。',
    formality: 'Lịch sự',
    nuance: 'Trợ từ「も」thay thế cho「は」khi danh từ N2 có cùng thuộc tính, hành động hoặc tính chất với danh từ N1 trước đó.',
    formationRules: [
      { partOfSpeech: 'Danh từ', rule: 'Danh từ + も', example: '私も ベトナム人です' }
    ],
    examples: [
      {
        id: 'ex-n5-01-mo-1',
        japanese: 'ミラーさんは会社員です。グプタさんも会社員です。',
        reading: 'みらーさんはかいしゃいんです。ぐぷたさんもかいしゃいんです。',
        vietnamese: 'Anh Miller là nhân viên công ty. Anh Gupta cũng là nhân viên công ty.'
      }
    ],
    quickQuiz: {
      question: '田中さんは日本人です。佐藤さん（　）日本人です。',
      questionVi: 'Anh Tanaka là người Nhật. Anh Sato cũng là người Nhật.',
      options: ['も', 'は', 'が', 'を'],
      optionsVi: ['Cũng (mo)', 'Chủ đề (wa)', 'Chủ ngữ (ga)', 'Tân ngữ (o)'],
      correctIndex: 0,
      explanation: 'Đồng nhất tính chất "cũng là người Nhật" dùng trợ từ「も」.'
    }
  },
  {
    id: 'n5-01-no',
    lessonId: 'minna-01',
    lessonNumber: 1,
    lessonTitle: 'Bài 1: Giới thiệu bản thân & Trợ từ cơ bản',
    curriculum: 'MINNA',
    grammarPoint: 'N1 の N2',
    reading: 'の',
    romaji: 'no',
    level: 'N5',
    category: 'basics',
    meaningVi: 'N2 của N1 / N2 thuộc về tổ chức N1 (Sở hữu & Thuộc tính)',
    structure: 'N1 の N2',
    formality: 'Lịch sự',
    nuance: 'Trợ từ「の」nối hai danh từ với nhau, trong đó N1 bổ nghĩa làm rõ cho N2 (sở hữu cá nhân, trực thuộc tổ chức/công ty/trường học).',
    formationRules: [
      { partOfSpeech: 'Danh từ', rule: 'N1 + の + N2', example: 'IMCの 社員 (nhân viên của công ty IMC)' }
    ],
    examples: [
      {
        id: 'ex-n5-01-no-1',
        japanese: 'ミラーさんはIMCの社員です。',
        reading: 'みらーさんはあいえむしーのしゃいんです。',
        vietnamese: 'Anh Miller là nhân viên của công ty IMC.'
      }
    ],
    quickQuiz: {
      question: 'これは私（　）本です。',
      questionVi: 'Đây là cuốn sách của tôi.',
      options: ['の', 'は', 'も', 'と'],
      optionsVi: ['Sở hữu (no)', 'Chủ đề', 'Cũng', 'Và'],
      correctIndex: 0,
      explanation: 'Chỉ quan hệ sở hữu sách của tôi: 私の本.'
    }
  },

  // =========================================================================
  // BÀI 2: TỪ CHỈ ĐỊNH ĐỒ VẬT (これ / それ / あれ)
  // =========================================================================
  {
    id: 'n5-02-kore-sore-are',
    lessonId: 'minna-02',
    lessonNumber: 2,
    lessonTitle: 'Bài 2: Từ chỉ định đồ vật (これ / それ / あれ)',
    curriculum: 'MINNA',
    grammarPoint: 'これ / それ / あれ は N です',
    reading: 'これ / それ / あれ は〜です',
    romaji: 'kore / sore / are wa N desu',
    level: 'N5',
    category: 'basics',
    meaningVi: 'Cái này / Cái đó / Cái kia là N',
    structure: 'これ / それ / あれ は N です',
    formality: 'Lịch sự',
    nuance: 'これ (gần người nói), それ (gần người nghe), あれ (xa cả hai người). Đứng độc lập như một đại từ chủ ngữ, không đi kèm danh từ ngay phía sau.',
    formationRules: [
      { partOfSpeech: 'Danh từ', rule: 'これ / それ / あれ + は + N です', example: 'これ は 本 です' }
    ],
    examples: [
      {
        id: 'ex-n5-02-1',
        japanese: 'これは日本語の教科書です。',
        reading: 'これはにほんごのきょうかしょです。',
        vietnamese: 'Đây là sách giáo khoa tiếng Nhật.'
      }
    ],
    quickQuiz: {
      question: '（　）は私の辞書です。（đang cầm trên tay）',
      questionVi: 'Đây là cuốn từ điển của tôi. (đang cầm trên tay)',
      options: ['これ', 'それ', 'あれ', 'この'],
      optionsVi: ['Cái này (gần mình)', 'Cái đó (gần bạn)', 'Cái kia (xa cả hai)', 'Cái này (cần danh từ đi kèm)'],
      correctIndex: 0,
      explanation: 'Đồ vật ở gần người nói và đứng độc lập làm chủ ngữ nên dùng「これ」.'
    }
  },
  {
    id: 'n5-02-kono-sono-ano',
    lessonId: 'minna-02',
    lessonNumber: 2,
    lessonTitle: 'Bài 2: Từ chỉ định đồ vật (これ / それ / あれ)',
    curriculum: 'MINNA',
    grammarPoint: 'この / その / あの + N は ...',
    reading: 'この / その / あの N は',
    romaji: 'kono / sono / ano N wa',
    level: 'N5',
    category: 'basics',
    meaningVi: 'Cái N này / cái N đó / cái N kia thì...',
    structure: 'この / その / あの + N は [Vị ngữ]',
    formality: 'Lịch sự',
    nuance: 'Chỉ thị từ bổ nghĩa trực tiếp cho danh từ đi liền sau nó. Chỉ rõ chính xác đồ vật hoặc con người cụ thể.',
    formationRules: [
      { partOfSpeech: 'Danh từ', rule: 'この / その / あの + Danh từ', example: 'この傘、その車、あの人' }
    ],
    examples: [
      {
        id: 'ex-n5-02-kono-1',
        japanese: 'この傘は田中さんのですか。',
        reading: 'このかさはたなかさんのですか。',
        vietnamese: 'Chiếc ô này có phải của anh Tanaka không?'
      }
    ],
    quickQuiz: {
      question: '（　）人はどなたですか。',
      questionVi: 'Vị kia là ai vậy ạ?',
      options: ['あの', 'あれ', 'あそこ', 'それ'],
      optionsVi: ['Vị kia (+ danh từ)', 'Cái kia (độc lập)', 'Chỗ kia (nơi chốn)', 'Cái đó'],
      correctIndex: 0,
      explanation: 'Bổ nghĩa trực tiếp cho danh từ 人 (hito) ở vị trí xa cả hai người dùng「あの」.'
    }
  },
  {
    id: 'n5-02-dare-no',
    lessonId: 'minna-02',
    lessonNumber: 2,
    lessonTitle: 'Bài 2: Từ chỉ định đồ vật (これ / それ / あれ)',
    curriculum: 'MINNA',
    grammarPoint: 'だれの N ですか',
    reading: 'だれの〜ですか',
    romaji: 'dare no N desu ka',
    level: 'N5',
    category: 'basics',
    meaningVi: 'Là N của ai thế? (Hỏi quyền sở hữu)',
    structure: 'これ / それ / あれ は だれの N ですか',
    formality: 'Lịch sự',
    nuance: 'Dùng nghi vấn từ「だれ」(ai) kết hợp trợ từ sở hữu「の」để tìm chủ nhân của một món đồ.',
    formationRules: [
      { partOfSpeech: 'Danh từ', rule: 'だれの + Danh từ + ですか', example: 'だれの かばんですか' }
    ],
    examples: [
      {
        id: 'ex-n5-02-dn-1',
        japanese: 'あれは誰のかばんですか。……佐藤さんのです。',
        reading: 'あれはだれのかばんですか。さとうさんのです。',
        vietnamese: 'Kia là chiếc cặp của ai thế? ……Là của chị Sato.'
      }
    ],
    quickQuiz: {
      question: 'この鍵は（　）のですか。……私のです。',
      questionVi: 'Chìa khóa này là của ai vậy? ……Là của tôi.',
      options: ['だれ', 'なん', 'どこ', 'どれ'],
      optionsVi: ['Ai (dare)', 'Cái gì', 'Ở đâu', 'Cái nào'],
      correctIndex: 0,
      explanation: 'Hỏi người sở hữu dùng「だれ」: だれの.'
    }
  },

  // =========================================================================
  // BÀI 3: TỪ CHỈ NƠI CHỐN & PHƯƠNG HƯỚNG
  // =========================================================================
  {
    id: 'n5-03-koko-soko-asoko',
    lessonId: 'minna-03',
    lessonNumber: 3,
    lessonTitle: 'Bài 3: Từ chỉ nơi chốn & Phương hướng',
    curriculum: 'MINNA',
    grammarPoint: 'ここ / そこ / あそこ は N(địa điểm) です',
    reading: 'ここ / そこ / あそこ',
    romaji: 'koko / soko / asoko',
    level: 'N5',
    category: 'basics',
    meaningVi: 'Chỗ này / Chỗ đó / Chỗ kia là...',
    structure: 'ここ / そこ / あそこ は N(địa điểm) です',
    formality: 'Lịch sự',
    nuance: 'ここ (nơi người nói đứng), そこ (nơi người nghe đứng), あそこ (nơi xa cả hai). Dạng lịch sự tương ứng là こちら / そちら / あちら.',
    formationRules: [
      { partOfSpeech: 'Danh từ', rule: 'Chỉ định nơi chốn + は + Địa điểm + です', example: 'ここ は 教室 です' }
    ],
    examples: [
      {
        id: 'ex-n5-03-1',
        japanese: 'ここは事務所です。',
        reading: 'ここはじむしょです。',
        vietnamese: 'Đây là văn phòng làm việc.'
      }
    ],
    quickQuiz: {
      question: '受付は（　）ですか。……あちらでございます。',
      questionVi: 'Quầy tiếp tân ở đâu ạ? ……Ở đằng kia ạ.',
      options: ['どちら', 'どれ', 'だれ', 'なん'],
      optionsVi: ['Ở đâu (lịch sự)', 'Cái nào', 'Ai', 'Cái gì'],
      correctIndex: 0,
      explanation: 'Hỏi nơi chốn một cách lịch sự dùng「どちら」đối ứng với câu trả lời「あちら」.'
    }
  },
  {
    id: 'n5-03-doko-dochira',
    lessonId: 'minna-03',
    lessonNumber: 3,
    lessonTitle: 'Bài 3: Từ chỉ nơi chốn & Phương hướng',
    curriculum: 'MINNA',
    grammarPoint: 'N は どこ / どちら ですか',
    reading: 'どこ / どちら ですか',
    romaji: 'doko / dochira desu ka',
    level: 'N5',
    category: 'basics',
    meaningVi: 'N ở đâu? / Quê bạn ở đâu? / Công ty của bạn là công ty nào?',
    structure: 'N は どこ / どちら ですか',
    formality: 'Lịch sự',
    nuance: 'どこ dùng hỏi nơi chốn thân mật/thông thường; どちら dùng hỏi nơi chốn lịch sự, và dùng để hỏi quốc gia, quê quán hoặc tên cơ quan làm việc.',
    formationRules: [
      { partOfSpeech: 'Danh từ', rule: 'Danh từ + は + どこ / どちら ですか', example: 'お手洗いは どこですか' }
    ],
    examples: [
      {
        id: 'ex-n5-03-dd-1',
        japanese: '国はどちらですか。……ベトナムです。',
        reading: 'くにはどちらですか。べとなむです。',
        vietnamese: 'Đất nước của bạn ở đâu (bạn là người nước nào)? ……Là Việt Nam.'
      }
    ],
    quickQuiz: {
      question: '会社は（　）ですか。……パワー電気です。',
      questionVi: 'Công ty của bạn là công ty nào? ……Là công ty điện lực Power.',
      options: ['どちら', 'だれ', 'なん', 'いつ'],
      optionsVi: ['Đâu/công ty nào (lịch sự)', 'Ai', 'Cái gì', 'Khi nào'],
      correctIndex: 0,
      explanation: 'Hỏi tên công ty/cơ quan công tác lịch sự dùng「どちら」.'
    }
  },
  {
    id: 'n5-03-ikura',
    lessonId: 'minna-03',
    lessonNumber: 3,
    lessonTitle: 'Bài 3: Từ chỉ nơi chốn & Phương hướng',
    curriculum: 'MINNA',
    grammarPoint: 'N は いくらですか',
    reading: 'いくらですか',
    romaji: 'ikura desu ka',
    level: 'N5',
    category: 'basics',
    meaningVi: 'Món N giá bao nhiêu tiền?',
    structure: 'N は いくらですか',
    formality: 'Lịch sự',
    nuance: 'Dùng để hỏi giá tiền của sản phẩm, dịch vụ khi mua sắm.',
    formationRules: [
      { partOfSpeech: 'Danh từ', rule: 'Tên món hàng + は + いくらですか', example: 'このワインは いくらですか' }
    ],
    examples: [
      {
        id: 'ex-n5-03-ik-1',
        japanese: 'この時計はいくらですか。……１万８千円です。',
        reading: 'このとけいはいくらですか。いちはちせんえんです。',
        vietnamese: 'Chiếc đồng hồ này giá bao nhiêu? ……Là 18.000 yên.'
      }
    ],
    quickQuiz: {
      question: 'そのりんごは（　）ですか。……ひとつ１５０円です。',
      questionVi: 'Quả táo đó giá bao nhiêu tiền? ……Một quả 150 yên.',
      options: ['いくら', 'いくつ', 'なん', 'どこ'],
      optionsVi: ['Bao nhiêu tiền', 'Bao nhiêu cái', 'Cái gì', 'Ở đâu'],
      correctIndex: 0,
      explanation: 'Hỏi giá tiền dùng「いくら」.'
    }
  },

  // =========================================================================
  // BÀI 4: THỜI GIAN, GIỜ GIẤC & ĐỘNG TỪ ます
  // =========================================================================
  {
    id: 'n5-04-masu',
    lessonId: 'minna-04',
    lessonNumber: 4,
    lessonTitle: 'Bài 4: Thời gian, giờ giấc & Động từ ます',
    curriculum: 'MINNA',
    grammarPoint: 'V-ます / V-ません / V-ました / V-ませんでした',
    reading: 'ます / ません / ました / ませんでした',
    romaji: 'masu / masen / mashita / masen deshita',
    level: 'N5',
    category: 'basics',
    meaningVi: 'Hiện tại khẳng định / Phủ định / Quá khứ khẳng định / Quá khứ phủ định của động từ',
    structure: 'V(thân động từ) + ます / ません / ました / ませんでした',
    formality: 'Lịch sự',
    nuance: 'Hệ thống thì căn bản của động từ tiếng Nhật thể lịch sự (丁寧語). V-ます cũng được dùng để biểu thị thói quen hoặc hành động sẽ xảy ra trong tương lai.',
    formationRules: [
      { partOfSpeech: 'Động từ', rule: 'V-thân + ます (hiện tại/tương lai)', example: '起きます (thức dậy)' },
      { partOfSpeech: 'Động từ', rule: 'V-thân + ました (quá khứ)', example: '起きました (đã thức dậy)' }
    ],
    examples: [
      {
        id: 'ex-n5-04-1',
        japanese: '毎朝６時に起きます。',
        reading: 'まいあさろくじにおきます。',
        vietnamese: 'Mỗi sáng tôi thức dậy lúc 6 giờ.'
      }
    ],
    quickQuiz: {
      question: 'きのうの晩、１１時に（　）。',
      questionVi: 'Tối hôm qua tôi đã ngủ lúc 11 giờ.',
      options: ['寝ました', '寝ます', '寝ません', '寝る'],
      optionsVi: ['Đã ngủ (quá khứ)', 'Ngủ (hiện tại)', 'Không ngủ', 'Thể từ điển'],
      correctIndex: 0,
      explanation: 'Có mốc thời gian quá khứ「きのうの晩」(tối hôm qua) nên động từ chia quá khứ「寝ました」.'
    }
  },
  {
    id: 'n5-04-ni-time',
    lessonId: 'minna-04',
    lessonNumber: 4,
    lessonTitle: 'Bài 4: Thời gian, giờ giấc & Động từ ます',
    curriculum: 'MINNA',
    grammarPoint: 'N(thời gian cụ thể) に V',
    reading: 'に',
    romaji: 'ni (jikan)',
    level: 'N5',
    category: 'time',
    meaningVi: 'Làm gì vào lúc mấy giờ, ngày mấy, tháng mấy',
    structure: 'Thời gian có con số cụ thể + に + Động từ',
    formality: 'Lịch sự',
    nuance: 'Trợ từ「に」đứng sau các mốc thời gian có con số cụ thể (6 giờ, ngày 5, năm 2026). Không thêm に sau các từ thời gian mang tính tương đối như 今日, 明日, 毎日, 今朝.',
    formationRules: [
      { partOfSpeech: 'Danh từ', rule: 'Thời gian có số + に', example: '7時に 起きます' }
    ],
    examples: [
      {
        id: 'ex-n5-04-nt-1',
        japanese: '日曜日、友達と映画を見に行きます。（Chủ nhật không bắt buộc に）',
        reading: 'にちようび、ともだちとえいがをみにいきます。',
        vietnamese: 'Chủ nhật tôi đi xem phim với bạn.'
      },
      {
        id: 'ex-n5-04-nt-2',
        japanese: '毎朝７時半に朝ご飯を食べます。',
        reading: 'まいあさしちじはんにおあさごはんをたべます。',
        vietnamese: 'Mỗi sáng tôi ăn cơm lúc 7 giờ rưỡi.'
      }
    ],
    quickQuiz: {
      question: '明日の朝、８時（　）学校へ行きます。',
      questionVi: 'Sáng mai tôi đi học vào lúc 8 giờ.',
      options: ['に', 'で', 'を', 'へ'],
      optionsVi: ['Vào lúc (có số)', 'Bằng/ở', 'Tân ngữ', 'Hướng tới'],
      correctIndex: 0,
      explanation: 'Mốc thời gian có con số 8時 đi với trợ từ「に」.'
    }
  },
  {
    id: 'n5-04-kara-made',
    lessonId: 'minna-04',
    lessonNumber: 4,
    lessonTitle: 'Bài 4: Thời gian, giờ giấc & Động từ ます',
    curriculum: 'MINNA',
    grammarPoint: 'N1 から N2 まで',
    reading: 'から〜まで',
    romaji: 'kara made',
    level: 'N5',
    category: 'time',
    meaningVi: 'Từ N1 đến N2 (thời gian hoặc địa điểm)',
    structure: 'N1(thời gian/nơi chốn) から N2(thời gian/nơi chốn) まで',
    formality: 'Lịch sự',
    nuance: 'Chỉ điểm bắt đầu (から) và điểm kết thúc (まで) của một khoảng thời gian làm việc, học tập hoặc khoảng cách địa lý.',
    formationRules: [
      { partOfSpeech: 'Danh từ', rule: 'Thời gian/Địa điểm + から + Thời gian/Địa điểm + まで', example: '9時 から 5時 まで' }
    ],
    examples: [
      {
        id: 'ex-n5-04-km-1',
        japanese: '銀行は午前９時から午後３時までです。',
        reading: 'ぎんこうはごぜんくじからごごさんじまでです。',
        vietnamese: 'Ngân hàng mở cửa từ 9 giờ sáng đến 3 giờ chiều.'
      }
    ],
    quickQuiz: {
      question: '昼休みは１２時（　）１時までです。',
      questionVi: 'Giờ nghỉ trưa là từ 12 giờ đến 1 giờ.',
      options: ['から', 'まで', 'に', 'へ'],
      optionsVi: ['Từ', 'Đến', 'Vào lúc', 'Hướng tới'],
      correctIndex: 0,
      explanation: 'Chỉ điểm bắt đầu của khoảng thời gian:「から」.'
    }
  },

  // =========================================================================
  // BÀI 5: ĐI LẠI & PHƯƠNG TIỆN GIAO THÔNG
  // =========================================================================
  {
    id: 'n5-05-he-ikimasu',
    lessonId: 'minna-05',
    lessonNumber: 5,
    lessonTitle: 'Bài 5: Đi lại & Phương tiện giao thông',
    curriculum: 'MINNA',
    grammarPoint: 'N(địa điểm) へ 行きます / 来ます / 帰ります',
    reading: 'へいきます / きます / かえります',
    romaji: 'e ikimasu / kimasu / kaerimasu',
    level: 'N5',
    category: 'basics',
    meaningVi: 'Đi / Đến / Về đâu đó (Phương hướng di chuyển)',
    structure: 'N(địa điểm) へ 行きます / 来ます / 帰ります',
    formality: 'Lịch sự',
    nuance: 'Trợ từ「へ」(viết chữ he nhưng phát âm là e) biểu thị hướng di chuyển tới địa điểm đích.',
    formationRules: [
      { partOfSpeech: 'Danh từ', rule: 'Địa điểm + へ + Động từ di chuyển', example: '日本 へ 行きます' }
    ],
    examples: [
      {
        id: 'ex-n5-05-1',
        japanese: '来週日本へ行きます。',
        reading: 'らいしゅうにほんへいきます。',
        vietnamese: 'Tuần sau tôi sẽ đi Nhật Bản.'
      }
    ],
    quickQuiz: {
      question: '明日京都（　）行きます。',
      questionVi: 'Ngày mai tôi sẽ đi Kyoto.',
      options: ['へ', 'を', 'で', 'から'],
      optionsVi: ['Hướng đến (へ)', 'Tân ngữ (を)', 'Phương tiện (で)', 'Từ đâu (から)'],
      correctIndex: 0,
      explanation: 'Đi tới một địa điểm đích dùng trợ từ「へ」(hoặc に).'
    }
  },
  {
    id: 'n5-05-doko-mo-masen',
    lessonId: 'minna-05',
    lessonNumber: 5,
    lessonTitle: 'Bài 5: Đi lại & Phương tiện giao thông',
    curriculum: 'MINNA',
    grammarPoint: 'どこ（へ）も 行きません / 行きませんでした',
    reading: 'どこもいきません',
    romaji: 'doko mo ikimasen',
    level: 'N5',
    category: 'basics',
    meaningVi: 'Không đi bất cứ đâu cả (Phủ định hoàn toàn)',
    structure: 'Từ để hỏi + も + Động từ phủ định',
    formality: 'Lịch sự',
    nuance: 'Trợ từ「も」kết hợp với từ nghi vấn và động từ phủ định để phủ định tuyệt đối toàn bộ đối tượng/nơi chốn.',
    formationRules: [
      { partOfSpeech: 'Danh từ', rule: 'どこ（へ）も + 行きません', example: '日曜日は どこへも 行きませんでした' }
    ],
    examples: [
      {
        id: 'ex-n5-05-dm-1',
        japanese: '昨日はどこへも行きませんでした。家で寝ていました。',
        reading: 'きのうはどこへもいきませんでした。いえでねていました。',
        vietnamese: 'Hôm qua tôi chẳng đi đâu cả. Tôi ngủ ở nhà.'
      }
    ],
    quickQuiz: {
      question: '週末はどこ（　）行きませんでした。',
      questionVi: 'Cuối tuần tôi không đi đâu cả.',
      options: ['へも', 'へは', 'へが', 'へで'],
      optionsVi: ['Phủ định hoàn toàn (he mo)', 'He wa', 'He ga', 'He de'],
      correctIndex: 0,
      explanation: 'Phủ định hoàn toàn nơi chốn: どこへも行きませんでした.'
    }
  },
  {
    id: 'n5-05-de-norimono',
    lessonId: 'minna-05',
    lessonNumber: 5,
    lessonTitle: 'Bài 5: Đi lại & Phương tiện giao thông',
    curriculum: 'MINNA',
    grammarPoint: 'N(phương tiện) で 行きます',
    reading: 'でいきます',
    romaji: 'de ikimasu',
    level: 'N5',
    category: 'basics',
    meaningVi: 'Đi bằng phương tiện N',
    structure: 'N(phương tiện) で 行きます / 来ます / 帰ります',
    formality: 'Lịch sự',
    nuance: 'Trợ từ「で」chỉ phương tiện, công cụ dùng để di chuyển. Riêng đi bộ dùng cụm từ「歩いて行きます」không có trợ từ で.',
    formationRules: [
      { partOfSpeech: 'Danh từ', rule: 'Phương tiện giao thông + で', example: '電車 で、バス で' }
    ],
    examples: [
      {
        id: 'ex-n5-05-de-1',
        japanese: '毎日地下鉄で会社へ行きます。',
        reading: 'まいにちちかてつでかいしゃへいきます。',
        vietnamese: 'Hàng ngày tôi đi làm bằng tàu điện ngầm.'
      }
    ],
    cautionNotes: ['Đi bộ là 歩いて (aruite), không được nói 歩きで hay 歩いてで.'],
    quickQuiz: {
      question: '駅まで（　）で行きましたか。……タクシーです。',
      questionVi: 'Bạn đã đến ga bằng gì vậy? ……Bằng taxi.',
      options: ['何', 'どこ', 'だれ', 'いつ'],
      optionsVi: ['Cái gì (Nan de - bằng gì)', 'Ở đâu', 'Ai', 'Khi nào'],
      correctIndex: 0,
      explanation: 'Hỏi đi bằng phương tiện gì dùng「何で行きましたか」(Nan de).'
    }
  },
  {
    id: 'n5-05-to-hito',
    lessonId: 'minna-05',
    lessonNumber: 5,
    lessonTitle: 'Bài 5: Đi lại & Phương tiện giao thông',
    curriculum: 'MINNA',
    grammarPoint: 'N(người/động vật) と V',
    reading: 'と',
    romaji: 'to (issho ni)',
    level: 'N5',
    category: 'basics',
    meaningVi: 'Làm gì cùng với ai (Người cùng thực hiện)',
    structure: 'N(người) と (いっしょに) V-ます (Đi một mình: ひとりで V-ます)',
    formality: 'Lịch sự',
    nuance: 'Trợ từ「と」chỉ người cùng tham gia thực hiện hành động. Nếu làm một mình dùng「ひとりで」không có trợ từ と.',
    formationRules: [
      { partOfSpeech: 'Danh từ', rule: 'Người đi cùng + と', example: '家族 と 日本へ 来ました' }
    ],
    examples: [
      {
        id: 'ex-n5-05-th-1',
        japanese: '友達と新宿へ買い物に行きました。',
        reading: 'ともだちとしんじゅくへかいものにいきました。',
        vietnamese: 'Tôi đã cùng bạn đi mua sắm ở Shinjuku.'
      }
    ],
    quickQuiz: {
      question: '誰（　）日本へ来ましたか。……一人で来ました。',
      questionVi: 'Bạn đã đến Nhật Bản cùng ai? ……Tôi đến một mình.',
      options: ['と', 'に', 'で', 'を'],
      optionsVi: ['Cùng với ai (to)', 'Cho ai', 'Bằng gì', 'Tân ngữ'],
      correctIndex: 0,
      explanation: 'Cùng với ai dùng trợ từ「と」: 誰と.'
    }
  },

  // =========================================================================
  // BÀI 6: Tân ngữ & Nơi diễn ra hành động
  // =========================================================================
  {
    "id": "n5-06-wo-tabemasu",
    "lessonId": "minna-06",
    "lessonNumber": 6,
    "lessonTitle": "Bài 6: Tân ngữ & Nơi diễn ra hành động",
    "curriculum": "MINNA",
    "grammarPoint": "N を V-ます (Tha động từ)",
    "reading": "を",
    "romaji": "o / wo",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Làm hành động V tác động lên tân ngữ N",
    "structure": "N(tân ngữ) を V(tha động từ)-ます",
    "formality": "Lịch sự",
    "nuance": "Trợ từ「を」(phát âm là o) biểu thị đối tượng trực tiếp chịu tác động của tha động từ (như ăn cơm, uống nước, xem phim, đọc sách).",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "N + を + Tha động từ",
        "example": "ご飯 を 食べます (Ăn cơm)"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-06-1",
        "japanese": "毎朝パンを食べます。牛乳を飲みます。",
        "reading": "まいあさぱんをたべます。ぎゅうにゅうをのみます。",
        "vietnamese": "Mỗi sáng tôi ăn bánh mì và uống sữa."
      },
      {
        "id": "ex-n5-06-2",
        "japanese": "昨日の晩テレビを見ました。",
        "reading": "きのうのばんてれびをみました。",
        "vietnamese": "Tối hôm qua tôi đã xem tivi."
      }
    ],
    "cautionNotes": [
      "Trợ từ を viết bằng kana を nhưng luôn phát âm là \"o\", không phát âm là \"wo\"."
    ],
    "quickQuiz": {
      "question": "毎晩日本語のニュース（　）見ます。",
      "questionVi": "Mỗi tối tôi xem tin tức tiếng Nhật.",
      "options": [
        "を",
        "に",
        "で",
        "へ"
      ],
      "optionsVi": [
        "Tân ngữ trực tiếp (o)",
        "Thời gian/hướng",
        "Nơi chốn",
        "Phương hướng"
      ],
      "correctIndex": 0,
      "explanation": "Tin tức là đối tượng trực tiếp của hành động \"xem\" nên dùng trợ từ「を」."
    }
  },
  {
    "id": "n5-06-nani-wo-shimasu",
    "lessonId": "minna-06",
    "lessonNumber": 6,
    "lessonTitle": "Bài 6: Tân ngữ & Nơi diễn ra hành động",
    "curriculum": "MINNA",
    "grammarPoint": "何 を しますか",
    "reading": "なにをしますか",
    "romaji": "nani o shimasu ka",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Bạn làm cái gì vậy? (Hỏi nội dung hành động)",
    "structure": "何 を V-ますか / 何 を しますか",
    "formality": "Lịch sự",
    "nuance": "Dùng「なに」kết hợp trợ từ を để hỏi người khác làm việc gì, ăn gì, uống gì, mua gì.",
    "formationRules": [
      {
        "partOfSpeech": "Nghi vấn từ",
        "rule": "なに + を + Động từ + か",
        "example": "何を買いましたか"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-06-n-1",
        "japanese": "月曜日何をしますか。……京都へ行きます。",
        "reading": "げつようびなにをしますか。きょうとへいきます。",
        "vietnamese": "Thứ hai bạn làm gì? ……Tôi đi Kyoto."
      }
    ],
    "quickQuiz": {
      "question": "日曜日（　）をしましたか。……サッカーをしました。",
      "questionVi": "Chủ nhật bạn đã làm gì thế? ……Tôi đã đá bóng.",
      "options": [
        "なに",
        "どこ",
        "だれ",
        "いつ"
      ],
      "optionsVi": [
        "Cái gì (nani)",
        "Ở đâu",
        "Ai",
        "Khi nào"
      ],
      "correctIndex": 0,
      "explanation": "Hỏi làm cái gì dùng「なに」: 何をしましたか."
    }
  },
  {
    "id": "n5-06-de-basho",
    "lessonId": "minna-06",
    "lessonNumber": 6,
    "lessonTitle": "Bài 6: Tân ngữ & Nơi diễn ra hành động",
    "curriculum": "MINNA",
    "grammarPoint": "N(địa điểm) で V-ます",
    "reading": "で",
    "romaji": "de (action place)",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Làm hành động V tại địa điểm N",
    "structure": "N(địa điểm) で V-ます",
    "formality": "Lịch sự",
    "nuance": "Trợ từ「で」chỉ nơi chốn mà hành động diễn ra. Phân biệt với「に」chỉ nơi tồn tại của sự vật/con người.",
    "formationRules": [
      {
        "partOfSpeech": "Địa điểm",
        "rule": "Địa điểm + で + Động từ hành động",
        "example": "図書館で 勉強します"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-06-d-1",
        "japanese": "図書館で本を読みます。",
        "reading": "としょかんでほんをよみます。",
        "vietnamese": "Tôi đọc sách ở thư viện."
      }
    ],
    "cautionNotes": [
      "Hành động diễn ra dùng で (図書館で勉強する). Tồn tại tĩnh dùng に (図書館に本がある)."
    ],
    "quickQuiz": {
      "question": "駅の売店（　）雑誌を買いました。",
      "questionVi": "Tôi đã mua tạp chí ở quầy bán báo của nhà ga.",
      "options": [
        "で",
        "に",
        "へ",
        "を"
      ],
      "optionsVi": [
        "Nơi diễn ra hành động (de)",
        "Nơi tồn tại",
        "Hướng đi",
        "Tân ngữ"
      ],
      "correctIndex": 0,
      "explanation": "Hành động mua tạp chí diễn ra tại quầy bán báo nên dùng「で」."
    }
  },
  {
    "id": "n5-06-masenka",
    "lessonId": "minna-06",
    "lessonNumber": 6,
    "lessonTitle": "Bài 6: Tân ngữ & Nơi diễn ra hành động",
    "curriculum": "MINNA",
    "grammarPoint": "V-ませんか (Rủ rê, mời mọc lịch sự)",
    "reading": "ませんか",
    "romaji": "masen ka",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Bạn có cùng làm... với tôi không? (Mời mọc lịch sự)",
    "structure": "V(bỏ ます) + ませんか",
    "formality": "Lịch sự",
    "nuance": "Cách rủ rê tinh tế, tôn trọng ý kiến người nghe. Dùng phủ định nghi vấn để người nghe dễ dàng từ chối nếu không tiện tham gia.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-thân + ませんか",
        "example": "行きませんか、食べませんか"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-06-m-1",
        "japanese": "いっしょに昼ご飯を食べませんか。……ええ、食べましょう。",
        "reading": "いっしょにひるごはんをたべませんか。ええ、たべましょう。",
        "vietnamese": "Cùng đi ăn trưa với tôi nhé? ……Vâng, cùng đi ăn nào."
      }
    ],
    "quickQuiz": {
      "question": "ちょっとお茶を飲み（　）。……いいですね。",
      "questionVi": "Cùng uống chút trà không? ……Hay đấy nhỉ.",
      "options": [
        "ませんか",
        "ました",
        "ますか",
        "ましょう"
      ],
      "optionsVi": [
        "Rủ rê lịch sự (masen ka)",
        "Đã làm",
        "Hỏi thông thường",
        "Kêu gọi"
      ],
      "correctIndex": 0,
      "explanation": "Rủ rê đối phương cùng uống trà dùng「〜ませんか」."
    }
  },
  {
    "id": "n5-06-mashou",
    "lessonId": "minna-06",
    "lessonNumber": 6,
    "lessonTitle": "Bài 6: Tân ngữ & Nơi diễn ra hành động",
    "curriculum": "MINNA",
    "grammarPoint": "V-ましょう (Kêu gọi cùng làm)",
    "reading": "ましょう",
    "romaji": "mashou",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Chúng ta cùng làm... nào! / Để tôi làm nhé",
    "structure": "V(bỏ ます) + ましょう",
    "formality": "Lịch sự",
    "nuance": "Dùng khi người nói chủ động đề xuất cả hai cùng hành động, hoặc để hưởng ứng lời mời「〜ませんか」.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-thân + ましょう",
        "example": "行きましょう、始めましょう"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-06-ms-1",
        "japanese": "１２時ですね。そろそろ昼休みにしましょう。",
        "reading": "じゅうにじですね。そろそろひるやすみにしましょう。",
        "vietnamese": "12 giờ rồi nhỉ. Chúng ta nghỉ trưa thôi nào."
      }
    ],
    "quickQuiz": {
      "question": "時間がありますから、少し（　）。",
      "questionVi": "Vì còn thời gian nên chúng ta hãy nghỉ một lát nào.",
      "options": [
        "休みましょう",
        "休みません",
        "休む",
        "休んで"
      ],
      "optionsVi": [
        "Hãy cùng nghỉ nào",
        "Không nghỉ",
        "Nghỉ (thể từ điển)",
        "Hãy nghỉ (thể Te)"
      ],
      "correctIndex": 0,
      "explanation": "Đề xuất cùng làm dùng「〜ましょう」: 休みましょう."
    }
  },

  // =========================================================================
  // BÀI 7: Công cụ & Cho nhận cơ bản
  // =========================================================================
  {
    "id": "n5-07-de-dougu",
    "lessonId": "minna-07",
    "lessonNumber": 7,
    "lessonTitle": "Bài 7: Công cụ & Cho nhận cơ bản",
    "curriculum": "MINNA",
    "grammarPoint": "N(công cụ/phương tiện/ngôn ngữ) で V-ます",
    "reading": "で",
    "romaji": "de (instrument / means)",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Làm V bằng công cụ N / bằng ngôn ngữ N",
    "structure": "N(công cụ / ngôn ngữ) で V-ます",
    "formality": "Lịch sự",
    "nuance": "Trợ từ「で」biểu thị phương tiện, công cụ hoặc ngôn ngữ được sử dụng để thực hiện một hành động.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "Công cụ/ngôn ngữ + で",
        "example": "はし で 食べます、日本語 で 書きます"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-07-d-1",
        "japanese": "はしでご飯を食べます。スプーンとフォークは使いません。",
        "reading": "はしでごはんをたべます。すぷーんとふぉーくはつかいません。",
        "vietnamese": "Tôi ăn cơm bằng đũa. Tôi không dùng thìa và dĩa."
      },
      {
        "id": "ex-n5-07-d-2",
        "japanese": "日本語でレポートを書きました。",
        "reading": "にほんごでれぽーとをかきました。",
        "vietnamese": "Tôi đã viết bài báo cáo bằng tiếng Nhật."
      }
    ],
    "quickQuiz": {
      "question": "ハサミ（　）紙を切ります。",
      "questionVi": "Tôi cắt giấy bằng kéo.",
      "options": [
        "で",
        "を",
        "に",
        "と"
      ],
      "optionsVi": [
        "Bằng công cụ (de)",
        "Tân ngữ",
        "Hướng đến",
        "Cùng với"
      ],
      "correctIndex": 0,
      "explanation": "Kéo là công cụ thực hiện việc cắt nên dùng trợ từ「で」."
    }
  },
  {
    "id": "n5-07-nihongo-de-nan",
    "lessonId": "minna-07",
    "lessonNumber": 7,
    "lessonTitle": "Bài 7: Công cụ & Cho nhận cơ bản",
    "curriculum": "MINNA",
    "grammarPoint": "「Từ/Câu」は 〜語で 何ですか",
    "reading": "は〜ごでなんですか",
    "romaji": "wa ~go de nan desu ka",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Từ/câu này trong tiếng... nói là gì?",
    "structure": "Từ/Câu は [Ngôn ngữ]語で 何ですか",
    "formality": "Lịch sự",
    "nuance": "Dùng khi muốn hỏi cách phát âm, cách dịch một từ hoặc một câu sang ngôn ngữ đích.",
    "formationRules": [
      {
        "partOfSpeech": "Cụm từ",
        "rule": "「X」は [Ngôn ngữ]で 何ですか",
        "example": "「Thank you」は 日本語で 何ですか"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-07-n-1",
        "japanese": "「ありがとう」は英語で何ですか。……「Thank you」です。",
        "reading": "「ありがとう」はえいごでなんですか。「Thank you」です。",
        "vietnamese": "「Arigatou」trong tiếng Anh là gì? ……Là 「Thank you」."
      }
    ],
    "quickQuiz": {
      "question": "「Xin chào」は日本語（　）何ですか。……「こんにちは」です。",
      "questionVi": "「Xin chào」trong tiếng Nhật là gì? ……Là「Konnichiwa」.",
      "options": [
        "で",
        "を",
        "に",
        "は"
      ],
      "optionsVi": [
        "Bằng ngôn ngữ (de)",
        "Tân ngữ",
        "Cho",
        "Chủ đề"
      ],
      "correctIndex": 0,
      "explanation": "Hỏi bằng ngôn ngữ gì dùng trợ từ「で」."
    }
  },
  {
    "id": "n5-07-agemasu",
    "lessonId": "minna-07",
    "lessonNumber": 7,
    "lessonTitle": "Bài 7: Công cụ & Cho nhận cơ bản",
    "curriculum": "MINNA",
    "grammarPoint": "N(người nhận) に N(vật) を あげます / 貸します / 教えます",
    "reading": "にあげます",
    "romaji": "ni agemasu",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Tặng / cho / cho mượn / dạy cái gì cho ai",
    "structure": "Người nói は Người nhận に Vật を あげます / かします / おしえます",
    "formality": "Lịch sự",
    "nuance": "Hành động chuyển giao từ người nói sang người khác. Người nhận hành động luôn đi với trợ từ「に」.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "Người nhận + に + Vật + を + あげます",
        "example": "田中さんに プレゼントを あげました"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-07-a-1",
        "japanese": "私は山田さんに花をあげました。",
        "reading": "わたしはやまださんにはなをあげました。",
        "vietnamese": "Tôi đã tặng hoa cho chị Yamada."
      }
    ],
    "cautionNotes": [
      "Không dùng あげます khi người nhận là chính mình (Tôi). Trường hợp đó phải dùng くださいます hoặc くれます."
    ],
    "quickQuiz": {
      "question": "木村さん（　）本を貸しました。",
      "questionVi": "Tôi đã cho chị Kimura mượn sách.",
      "options": [
        "に",
        "で",
        "から",
        "を"
      ],
      "optionsVi": [
        "Người nhận (ni)",
        "Bằng gì",
        "Từ ai",
        "Tân ngữ"
      ],
      "correctIndex": 0,
      "explanation": "Cho ai mượn gì thì đối tượng nhận đi với trợ từ「に」."
    }
  },
  {
    "id": "n5-07-moraimasu",
    "lessonId": "minna-07",
    "lessonNumber": 7,
    "lessonTitle": "Bài 7: Công cụ & Cho nhận cơ bản",
    "curriculum": "MINNA",
    "grammarPoint": "N(người cho) に / から N(vật) を もらいます / 借ります / 習います",
    "reading": "にもらいます / からもらいます",
    "romaji": "ni / kara moraimasu",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Nhận / mượn / học cái gì từ ai",
    "structure": "Người nhận は Người cho に/から Vật を もらいます / かります / ならいます",
    "formality": "Lịch sự",
    "nuance": "Hành động tiếp nhận từ đối phương. Người cho hoặc nguồn cung cấp đi với「に」hoặc「から」. Nếu đối tượng là tổ chức, công ty, trường học thì bắt buộc dùng「から」.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "Người cho + に/から + Vật + を + もらいます",
        "example": "母 に/から お小遣いを もらいました"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-07-m-1",
        "japanese": "誕生日に母から時計をもらいました。",
        "reading": "たんじょうびにはだからとけいをもらいました。",
        "vietnamese": "Vào ngày sinh nhật, tôi đã nhận được chiếc đồng hồ từ mẹ."
      }
    ],
    "quickQuiz": {
      "question": "銀行（　）お金を借りました。",
      "questionVi": "Tôi đã vay tiền từ ngân hàng.",
      "options": [
        "から",
        "に",
        "で",
        "と"
      ],
      "optionsVi": [
        "Từ tổ chức (bắt buộc dùng kara)",
        "Ni (thường cho người)",
        "Nơi chốn",
        "Cùng với"
      ],
      "correctIndex": 0,
      "explanation": "Nguồn tiếp nhận là tổ chức/cơ quan (ngân hàng, trường học, công ty) bắt buộc dùng「から」."
    }
  },
  {
    "id": "n5-07-mou-mada",
    "lessonId": "minna-07",
    "lessonNumber": 7,
    "lessonTitle": "Bài 7: Công cụ & Cho nhận cơ bản",
    "curriculum": "MINNA",
    "grammarPoint": "もう V-ました / まだ V-ていません",
    "reading": "もう〜ました / まだ〜ていません",
    "romaji": "mou ~mashita / mada ~te imasen",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Đã làm... rồi / Vẫn chưa làm...",
    "structure": "もう V-ましたか (Trả lời: はい、もう V-ました / いいえ、まだです / まだ V-ていません)",
    "formality": "Lịch sự",
    "nuance": "Hỏi xem một hành động dự kiến đã hoàn tất chưa. Chú ý: Trả lời phủ định không dùng「V-ませんでした」(nghĩa là không làm trong quá khứ) mà dùng「まだです」hoặc「まだ V-ていません」.",
    "formationRules": [
      {
        "partOfSpeech": "Phó từ",
        "rule": "もう + V-ました (Đã làm xong)",
        "example": "もう 食べました"
      },
      {
        "partOfSpeech": "Phó từ",
        "rule": "いいえ、まだです (Vẫn chưa)",
        "example": "いいえ、まだです"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-07-mm-1",
        "japanese": "もう荷物を送りましたか。……いいえ、まだです。これから送ります。",
        "reading": "もうにもつをおくりましたか。いいえ、まだです。これからおくります。",
        "vietnamese": "Bạn đã gửi hành lý chưa? ……Chưa, vẫn chưa gửi. Bây giờ tôi sẽ gửi."
      }
    ],
    "cautionNotes": [
      "Không trả lời「いいえ、送りませんでした」vì mang nghĩa trong quá khứ bạn đã không gửi."
    ],
    "quickQuiz": {
      "question": "もう昼ご飯を食べましたか。……（　）。",
      "questionVi": "Bạn đã ăn trưa chưa? ……Chưa, tôi vẫn chưa ăn.",
      "options": [
        "いいえ、まだです",
        "いいえ、食べませんでした",
        "はい、まだです",
        "はい、食べません"
      ],
      "optionsVi": [
        "Chưa, vẫn chưa (chuẩn xác)",
        "Sai thì quá khứ",
        "Mâu thuẫn",
        "Sai phủ định"
      ],
      "correctIndex": 0,
      "explanation": "Trả lời chưa hoàn tất công việc dùng「いいえ、まだです」."
    }
  },

  // =========================================================================
  // BÀI 8: Tính từ đuôi い & Tính từ đuôi な
  // =========================================================================
  {
    "id": "n5-08-i-adjective",
    "lessonId": "minna-08",
    "lessonNumber": 8,
    "lessonTitle": "Bài 8: Tính từ đuôi い & Tính từ đuôi な",
    "curriculum": "MINNA",
    "grammarPoint": "Tính từ đuôi い (A-い / A-くない)",
    "reading": "いけいようし",
    "romaji": "i-keiyoushi",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Tính từ đuôi い: Khẳng định (~いです) và Phủ định (~くないです)",
    "structure": "A-いです (Khẳng định) / A-くないです (Phủ định) / A-い + N (Bổ nghĩa danh từ)",
    "formality": "Lịch sự",
    "nuance": "Tính từ tận cùng bằng nguyên âm「い」. Khi phủ định, bỏ「い」thay bằng「くない」. Riêng「いい」(tốt) biến thành「よくない」.",
    "formationRules": [
      {
        "partOfSpeech": "Tính từ い",
        "rule": "Bỏ [い] + くないです",
        "example": "高い → 高くないです (Không đắt)"
      },
      {
        "partOfSpeech": "Bổ nghĩa",
        "rule": "A-い + Danh từ",
        "example": "高い 山 (Núi cao)"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-08-i-1",
        "japanese": "富士山は高い山です。とても美しいです。",
        "reading": "ふじさんはたかいやまです。とてもうつくしいです。",
        "vietnamese": "Núi Phú Sĩ là ngọn núi cao. Nó rất đẹp."
      },
      {
        "id": "ex-n5-08-i-2",
        "japanese": "この辞書はあまりよくないです。",
        "reading": "このじしょはあまりよくないです。",
        "vietnamese": "Cuốn từ điển này không tốt lắm."
      }
    ],
    "cautionNotes": [
      "いい (tốt) phủ định là よくない, không được nói いからない hay いくない."
    ],
    "quickQuiz": {
      "question": "今日の東京は（　）。全然寒くないです。",
      "questionVi": "Hôm nay Tokyo ấm áp. Hoàn toàn không lạnh chút nào.",
      "options": [
        "暖かいです",
        "寒いです",
        "高くないです",
        "暑いです"
      ],
      "optionsVi": [
        "Ấm áp (atatakai desu)",
        "Lạnh",
        "Không đắt",
        "Nóng"
      ],
      "correctIndex": 0,
      "explanation": "Vế sau là \"không lạnh chút nào\" nên trước đó là \"hôm nay ấm áp\" (暖かいです)."
    }
  },
  {
    "id": "n5-08-na-adjective",
    "lessonId": "minna-08",
    "lessonNumber": 8,
    "lessonTitle": "Bài 8: Tính từ đuôi い & Tính từ đuôi な",
    "curriculum": "MINNA",
    "grammarPoint": "Tính từ đuôi な (Na-な / Na-じゃありません)",
    "reading": "なけいようし",
    "romaji": "na-keiyoushi",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Tính từ đuôi な: Khẳng định (~です), Phủ định (~じゃありません), Bổ nghĩa danh từ (~な N)",
    "structure": "Na です (Khẳng định) / Na じゃありません (Phủ định) / Na な + N (Bổ nghĩa)",
    "formality": "Lịch sự",
    "nuance": "Khi đứng cuối câu thì không có「な」. Chỉ xuất hiện chữ「な」khi đứng ngay trước bổ nghĩa cho một danh từ. Biến đổi giống như danh từ.",
    "formationRules": [
      {
        "partOfSpeech": "Tính từ な",
        "rule": "Na + じゃありません",
        "example": "静か → 静かじゃありません"
      },
      {
        "partOfSpeech": "Bổ nghĩa",
        "rule": "Na + な + Danh từ",
        "example": "親切 な 人 (Người tốt bụng)"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-08-na-1",
        "japanese": "ハノイは賑やかな町です。でも、静かじゃありません。",
        "reading": "はのいはにぎやかなまちです。でも、しずかじゃありません。",
        "vietnamese": "Hà Nội là một thành phố náo nhiệt. Nhưng không yên tĩnh."
      }
    ],
    "cautionNotes": [
      "きらい (ghét) và きれい (đẹp/sạch) tận cùng là い nhưng thực chất là tính từ đuôi な (きれいな花, きれいじゃありません)."
    ],
    "quickQuiz": {
      "question": "京都はとても（　）町です。",
      "questionVi": "Kyoto là một thành phố rất yên tĩnh.",
      "options": [
        "静かな",
        "静か",
        "静かです",
        "静かで"
      ],
      "optionsVi": [
        "Na + na + N (chính xác)",
        "Thiếu na",
        "Dư desu",
        "Thể Te"
      ],
      "correctIndex": 0,
      "explanation": "Tính từ đuôi な bổ nghĩa cho danh từ 町 (machi) cần thêm「な」: 静かな町."
    }
  },
  {
    "id": "n5-08-totemo-amari",
    "lessonId": "minna-08",
    "lessonNumber": 8,
    "lessonTitle": "Bài 8: Tính từ đuôi い & Tính từ đuôi な",
    "curriculum": "MINNA",
    "grammarPoint": "とても / あまり (Phó từ mức độ)",
    "reading": "とても / あまり",
    "romaji": "totemo / amari",
    "level": "N5",
    "category": "degree",
    "meaningVi": "Rất... (khẳng định) / Không... lắm (phủ định)",
    "structure": "とても + Tính từ khẳng định / あまり + Tính từ phủ định (〜くない / 〜じゃありません)",
    "formality": "Lịch sự",
    "nuance": "とても nhấn mạnh mức độ cao trong câu khẳng định. あまり luôn đi kèm với tính từ ở dạng phủ định biểu thị ý khiêm tốn hoặc giảm nhẹ mức độ.",
    "formationRules": [
      {
        "partOfSpeech": "Phó từ",
        "rule": "とても + Khẳng định",
        "example": "とても おいしいです"
      },
      {
        "partOfSpeech": "Phó từ",
        "rule": "あまり + Phủ định",
        "example": "あまり おいしくないです"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-08-ta-1",
        "japanese": "日本の食べ物はとてもおいしいですが、あまり安くないです。",
        "reading": "にほんのたべものはとてもおいしいですが、あまりやすくないです。",
        "vietnamese": "Món ăn Nhật Bản rất ngon nhưng không rẻ lắm."
      }
    ],
    "quickQuiz": {
      "question": "この部屋はあまり（　）。",
      "questionVi": "Căn phòng này không rộng lắm.",
      "options": [
        "広くないです",
        "広いです",
        "広かった",
        "広い"
      ],
      "optionsVi": [
        "Không rộng (phủ định với amari)",
        "Rộng (khẳng định)",
        "Đã rộng",
        "Thể ngắn"
      ],
      "correctIndex": 0,
      "explanation": "Phó từ「あまり」bắt buộc đi với dạng phủ định: あまり広くないです."
    }
  },
  {
    "id": "n5-08-dou-donna",
    "lessonId": "minna-08",
    "lessonNumber": 8,
    "lessonTitle": "Bài 8: Tính từ đuôi い & Tính từ đuôi な",
    "curriculum": "MINNA",
    "grammarPoint": "N は どうですか / どんな N ですか",
    "reading": "どうですか / どんな〜ですか",
    "romaji": "dou desu ka / donna N desu ka",
    "level": "N5",
    "category": "basics",
    "meaningVi": "N thì như thế nào? / N là người/vật như thế nào?",
    "structure": "N は どうですか / どんな N ですか",
    "formality": "Lịch sự",
    "nuance": "どうですか hỏi về cảm tưởng, ấn tượng hiện tại. どんな N ですか hỏi về bản chất, đặc tính cụ thể của đối tượng trong một chủng loại.",
    "formationRules": [
      {
        "partOfSpeech": "Nghi vấn từ",
        "rule": "Chủ đề + は + どうですか",
        "example": "日本の生活はどうですか"
      },
      {
        "partOfSpeech": "Nghi vấn từ",
        "rule": "どんな + Danh từ + ですか",
        "example": "どんな 人ですか"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-08-dd-1",
        "japanese": "日本の生活はどうですか。……忙しいですが、おもしろいです。",
        "reading": "にほんのせいかつはどうですか。いそがしいですが、おもしろいです。",
        "vietnamese": "Cuộc sống ở Nhật Bản thế nào? ……Bận rộn nhưng rất thú vị."
      }
    ],
    "quickQuiz": {
      "question": "奈良は（　）町ですか。……静かで古い町です。",
      "questionVi": "Nara là thành phố như thế nào? ……Là một thành phố yên tĩnh và cổ kính.",
      "options": [
        "どんな",
        "どう",
        "どこ",
        "どれ"
      ],
      "optionsVi": [
        "Như thế nào (bổ nghĩa danh từ)",
        "Thế nào",
        "Ở đâu",
        "Cái nào"
      ],
      "correctIndex": 0,
      "explanation": "Hỏi về đặc điểm đi liền trước danh từ 町 (machi) dùng「どんな」."
    }
  },
  {
    "id": "n5-08-ga-soshite",
    "lessonId": "minna-08",
    "lessonNumber": 8,
    "lessonTitle": "Bài 8: Tính từ đuôi い & Tính từ đuôi な",
    "curriculum": "MINNA",
    "grammarPoint": "S1 が、S2 / S1。そして S2",
    "reading": "が / そして",
    "romaji": "ga / soshite",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Mệnh đề 1, nhưng mà Mệnh đề 2 / Mệnh đề 1. Và Mệnh đề 2",
    "structure": "S1 が、S2 (Ngược nghĩa) / S1。そして、S2 (Thuận nghĩa/bổ sung)",
    "formality": "Lịch sự",
    "nuance": "が đặt ở cuối vế 1 để nối hai vế tương phản hoặc mở đầu chuyển ý. そして đứng đầu câu sau để bổ sung thêm tính chất tích cực hoặc cùng chiều.",
    "formationRules": [
      {
        "partOfSpeech": "Liên từ",
        "rule": "S1 が、S2",
        "example": "日本の物はいいですが、高いです"
      },
      {
        "partOfSpeech": "Liên từ",
        "rule": "S1。そして S2",
        "example": "きれいです。そして親切です"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-08-gs-1",
        "japanese": "先生はとても親切です。そして面白いです。",
        "reading": "せんせいはとてもしんせつです。そしておもしろいです。",
        "vietnamese": "Thầy giáo rất tốt bụng. Và thầy cũng rất thú vị."
      }
    ],
    "quickQuiz": {
      "question": "このレストランは安いです（　）、あまりおいしくないです。",
      "questionVi": "Nhà hàng này rẻ, nhưng mà không ngon lắm.",
      "options": [
        "が",
        "そして",
        "から",
        "ので"
      ],
      "optionsVi": [
        "Nhưng mà (ngược nghĩa)",
        "Và",
        "Vì",
        "Vì"
      ],
      "correctIndex": 0,
      "explanation": "Rẻ nhưng không ngon là hai vế tương phản đối lập nên dùng liên từ「が」."
    }
  },

  // =========================================================================
  // BÀI 9: Sở thích, năng lực & Sở hữu
  // =========================================================================
  {
    "id": "n5-09-suki-kirai",
    "lessonId": "minna-09",
    "lessonNumber": 9,
    "lessonTitle": "Bài 9: Sở thích, năng lực & Sở hữu",
    "curriculum": "MINNA",
    "grammarPoint": "N が 好きです / 嫌いです / 上手です / 下手です",
    "reading": "がすきです / じょうずです",
    "romaji": "ga suki / kirai / jouzu / heta desu",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Thích / Ghét / Giỏi / Kém cái gì đó N",
    "structure": "Chủ ngữ は N が 好きです / 嫌いです / 上手です / 下手です",
    "formality": "Lịch sự",
    "nuance": "Đối tượng được thích, ghét, giỏi, dở luôn được đánh dấu bằng trợ từ「が」chứ không dùng「を」.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "N + が + 好き / 嫌い / 上手 / 下手 です",
        "example": "歌 が 好きです"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-09-sk-1",
        "japanese": "私はスポーツが好きです。特にサッカーが好きです。",
        "reading": "わたしはすぽーつがすきです。とくにさっかーがすきです。",
        "vietnamese": "Tôi thích thể thao. Đặc biệt là bóng đá."
      }
    ],
    "cautionNotes": [
      "Không dùng 上手です để tự khen bản thân mình. Tự nhận kém dùng 下手です hoặc まだまだです."
    ],
    "quickQuiz": {
      "question": "ミラーさんは日本語（　）とても上手です。",
      "questionVi": "Anh Miller rất giỏi tiếng Nhật.",
      "options": [
        "が",
        "を",
        "に",
        "で"
      ],
      "optionsVi": [
        "Trợ từ năng lực (ga)",
        "Tân ngữ (sai)",
        "Hướng đến",
        "Bằng"
      ],
      "correctIndex": 0,
      "explanation": "Năng lực giỏi/kém luôn đi với trợ từ「が」: 日本語が上手."
    }
  },
  {
    "id": "n5-09-wakaru-aru",
    "lessonId": "minna-09",
    "lessonNumber": 9,
    "lessonTitle": "Bài 9: Sở thích, năng lực & Sở hữu",
    "curriculum": "MINNA",
    "grammarPoint": "N が わかります / あります",
    "reading": "がわかります / があります",
    "romaji": "ga wakarimasu / arimasu",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Hiểu cái gì N / Có cái gì N (sở hữu)",
    "structure": "N が わかります / あります",
    "formality": "Lịch sự",
    "nuance": "わかります (hiểu biết) và あります (sở hữu đồ vật trừu tượng hoặc tài sản) là động từ chỉ trạng thái, tân ngữ đi với trợ từ「が」thay vì「を」.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "N + が + わかります / あります",
        "example": "英語 が わかります、お金 が あります"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-09-wa-1",
        "japanese": "英語が少しわかりますが、フランス語は全然わかりません。",
        "reading": "えいごがすこしわかりますが、ふらんすごはぜんぜんわかりません。",
        "vietnamese": "Tôi hiểu một chút tiếng Anh, nhưng tiếng Pháp thì hoàn toàn không biết."
      }
    ],
    "quickQuiz": {
      "question": "時間が（　）から、タクシーで行きましょう。",
      "questionVi": "Vì không có thời gian nên chúng ta hãy đi taxi nào.",
      "options": [
        "ない",
        "ある",
        "だ",
        "いる"
      ],
      "optionsVi": [
        "Không có (nai - arimasen)",
        "Có",
        "Là",
        "Tồn tại người"
      ],
      "correctIndex": 0,
      "explanation": "Không có thời gian (時間がない / ありません)."
    }
  },
  {
    "id": "n5-09-kara",
    "lessonId": "minna-09",
    "lessonNumber": 9,
    "lessonTitle": "Bài 9: Sở thích, năng lực & Sở hữu",
    "curriculum": "MINNA",
    "grammarPoint": "S1 から、S2 (Nguyên nhân - Kết quả)",
    "reading": "から",
    "romaji": "kara (reason)",
    "level": "N5",
    "category": "cause",
    "meaningVi": "Bởi vì S1 nên S2 (Nêu lý do, nguyên nhân)",
    "structure": "Mệnh đề 1 (Lý do) + から、 Mệnh đề 2 (Kết quả)",
    "formality": "Lịch sự",
    "nuance": "Diễn đạt lý do chủ quan của người nói. Vế sau S2 có thể là câu mệnh lệnh, rủ rê, đề xuất hoặc nhận định cá nhân.",
    "formationRules": [
      {
        "partOfSpeech": "Mệnh đề",
        "rule": "Câu + から",
        "example": "用事があります から、早く帰ります"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-09-kr-1",
        "japanese": "今日は妻の誕生日ですから、早く帰ります。",
        "reading": "きょうはつまのたんじょうびですから、はやくかえります。",
        "vietnamese": "Hôm nay là sinh nhật của vợ tôi nên tôi về sớm."
      }
    ],
    "quickQuiz": {
      "question": "お金がありません（　）、旅行に行きません。",
      "questionVi": "Bởi vì không có tiền nên tôi không đi du lịch.",
      "options": [
        "から",
        "まで",
        "でも",
        "より"
      ],
      "optionsVi": [
        "Bởi vì (kara)",
        "Đến khi",
        "Nhưng",
        "Hơn"
      ],
      "correctIndex": 0,
      "explanation": "Chỉ nguyên nhân kết quả dùng「から」: お金がありませんから."
    }
  },
  {
    "id": "n5-09-doushite",
    "lessonId": "minna-09",
    "lessonNumber": 9,
    "lessonTitle": "Bài 9: Sở thích, năng lực & Sở hữu",
    "curriculum": "MINNA",
    "grammarPoint": "どうして 〜 か (Tại sao...?)",
    "reading": "どうしてですか",
    "romaji": "doushite desu ka",
    "level": "N5",
    "category": "cause",
    "meaningVi": "Tại sao lại như vậy? (Câu trả lời kết thúc bằng 〜から)",
    "structure": "どうして V-ますか / どうしてですか。…… [Lý do] からです。",
    "formality": "Lịch sự",
    "nuance": "Dùng để hỏi nguyên nhân, lý do. Câu trả lời kết thúc bằng「〜からです」(bởi vì...) để giải thích rõ ràng.",
    "formationRules": [
      {
        "partOfSpeech": "Nghi vấn từ",
        "rule": "どうして + Câu hỏi + か",
        "example": "どうして 昨日 来ませんでしたか"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-09-ds-1",
        "japanese": "どうして朝ご飯を食べませんでしたか。……時間がなかったからです。",
        "reading": "どうしてあさごはんをたべませんでしたか。じかんがなかったからです。",
        "vietnamese": "Tại sao bạn không ăn sáng? ……Bởi vì tôi không có thời gian."
      }
    ],
    "quickQuiz": {
      "question": "（　）会社を休みましたか。……熱がありましたから。",
      "questionVi": "Tại sao bạn nghỉ làm? ……Vì tôi bị sốt.",
      "options": [
        "どうして",
        "いつ",
        "どこ",
        "だれ"
      ],
      "optionsVi": [
        "Tại sao (doushite)",
        "Khi nào",
        "Ở đâu",
        "Ai"
      ],
      "correctIndex": 0,
      "explanation": "Câu trả lời có「から」(vì) chứng tỏ câu hỏi hỏi nguyên nhân「どうして」."
    }
  },

  // =========================================================================
  // BÀI 10: Tồn tại của người & Đồ vật (います / あります)
  // =========================================================================
  {
    "id": "n5-10-imasu-arimasu",
    "lessonId": "minna-10",
    "lessonNumber": 10,
    "lessonTitle": "Bài 10: Tồn tại của người & Đồ vật (います / あります)",
    "curriculum": "MINNA",
    "grammarPoint": "N(địa điểm) に N(vật/người) が あります / います",
    "reading": "にあります / にいます",
    "romaji": "ni arimasu / imasu",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Ở địa điểm N có đồ vật (あります) / có người hoặc động vật (います)",
    "structure": "N(địa điểm) に N(vật) が あります / N(địa điểm) に N(người/động vật) が います",
    "formality": "Lịch sự",
    "nuance": "Trợ từ「に」chỉ vị trí tồn tại. Dùng「あります」cho đồ vật, cây cối, sự việc tĩnh; dùng「います」cho sinh vật cử động được (người, động vật, cá).",
    "formationRules": [
      {
        "partOfSpeech": "Địa điểm",
        "rule": "Địa điểm + に + Vật + が あります",
        "example": "部屋に 机があります"
      },
      {
        "partOfSpeech": "Địa điểm",
        "rule": "Địa điểm + に + Người/động vật + が います",
        "example": "庭に 犬がいます"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-10-ia-1",
        "japanese": "机の上にパソコンと本があります。",
        "reading": "つくえのうえにぱそこんとほんがあります。",
        "vietnamese": "Trên bàn có máy tính và sách."
      },
      {
        "id": "ex-n5-10-ia-2",
        "japanese": "あそこに佐藤さんがいます。",
        "reading": "あそこにさとうさんがいます。",
        "vietnamese": "Ở đằng kia có chị Sato."
      }
    ],
    "cautionNotes": [
      "Không dùng います cho đồ vật vô tri; không dùng あります cho người hay động vật."
    ],
    "quickQuiz": {
      "question": "公園に子供（　）たくさんいます。",
      "questionVi": "Ở công viên có rất nhiều trẻ em.",
      "options": [
        "が",
        "を",
        "に",
        "で"
      ],
      "optionsVi": [
        "Đối tượng tồn tại (ga)",
        "Tân ngữ",
        "Thời gian",
        "Nơi chốn"
      ],
      "correctIndex": 0,
      "explanation": "Đối tượng tồn tại đi với động từ「います」phải dùng trợ từ「が」."
    }
  },
  {
    "id": "n5-10-wa-doko-ni",
    "lessonId": "minna-10",
    "lessonNumber": 10,
    "lessonTitle": "Bài 10: Tồn tại của người & Đồ vật (います / あります)",
    "curriculum": "MINNA",
    "grammarPoint": "N(vật/người) は N(địa điểm) に あります / います",
    "reading": "は〜にあります / います",
    "romaji": "wa ~ ni arimasu / imasu",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Vật N / Người N thì ở địa điểm...",
    "structure": "N(vật/người) は N(địa điểm) に あります / います",
    "formality": "Lịch sự",
    "nuance": "Khi chủ đề câu nói là người hoặc đồ vật đã biết trước, ta đưa vật/người lên đầu câu làm chủ ngữ đi với「は」, và vị trí tồn tại đi với「に」.",
    "formationRules": [
      {
        "partOfSpeech": "Chủ đề",
        "rule": "Vật/Người + は + Nơi chốn + に あります/います",
        "example": "ミラーさんは 事務所に います"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-10-wd-1",
        "japanese": "東京ディズニーランドは千葉県にあります。",
        "reading": "とうきょうでぃずにーらんどはちばけんにあります。",
        "vietnamese": "Tokyo Disneyland ở tỉnh Chiba."
      }
    ],
    "quickQuiz": {
      "question": "私の鍵はどこ（　）ありますか。……カバンの中にあります。",
      "questionVi": "Chìa khóa của tôi ở đâu vậy? ……Ở trong cặp.",
      "options": [
        "に",
        "で",
        "を",
        "へ"
      ],
      "optionsVi": [
        "Vị trí tồn tại (ni)",
        "Nơi hành động",
        "Tân ngữ",
        "Phương hướng"
      ],
      "correctIndex": 0,
      "explanation": "Hỏi nơi tồn tại của đồ vật dùng「どこにありますか」."
    }
  },
  {
    "id": "n5-10-ichi-meishi",
    "lessonId": "minna-10",
    "lessonNumber": 10,
    "lessonTitle": "Bài 10: Tồn tại của người & Đồ vật (います / あります)",
    "curriculum": "MINNA",
    "grammarPoint": "N1 の N2(vị trí) [上 / 下 / 前 / 後ろ / 中 / 隣 / 近く]",
    "reading": "の うえ / した / まえ / うしろ / なか / となり",
    "romaji": "no ue / shita / mae / ushiro / naka / tonari",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Ở trên / dưới / trước / sau / trong / bên cạnh / gần N1",
    "structure": "N1 の [上 / 下 / 前 / 後ろ / 中 / 外 / 隣 / 近く / 間]",
    "formality": "Lịch sự",
    "nuance": "Từ chỉ phương vị trong tiếng Nhật được coi là danh từ, do đó liên kết với vật mốc N1 bằng trợ từ「の」.",
    "formationRules": [
      {
        "partOfSpeech": "Vị trí",
        "rule": "Vật mốc + の + Từ chỉ vị trí",
        "example": "机の上、箱の中、駅の隣"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-10-im-1",
        "japanese": "猫はベッドの下にいます。",
        "reading": "ねこはべっどのしたにいます。",
        "vietnamese": "Con mèo đang ở dưới gầm giường."
      }
    ],
    "quickQuiz": {
      "question": "銀行は郵便局の（　）にあります。",
      "questionVi": "Ngân hàng ở bên cạnh bưu điện.",
      "options": [
        "隣",
        "上",
        "中",
        "前"
      ],
      "optionsVi": [
        "Bên cạnh (tonari)",
        "Trên",
        "Trong",
        "Trước"
      ],
      "correctIndex": 0,
      "explanation": "Bên cạnh dùng danh từ vị trí「隣」(となり)."
    }
  },
  {
    "id": "n5-10-ya-nado",
    "lessonId": "minna-10",
    "lessonNumber": 10,
    "lessonTitle": "Bài 10: Tồn tại của người & Đồ vật (います / あります)",
    "curriculum": "MINNA",
    "grammarPoint": "N1 や N2 (など)",
    "reading": "や〜など",
    "romaji": "ya ~ nado",
    "level": "N5",
    "category": "basics",
    "meaningVi": "N1 và N2... (liệt kê tiêu biểu, không đầy đủ)",
    "structure": "N1 や N2 (など) が あります / います",
    "formality": "Lịch sự",
    "nuance": "Khác với「と」(liệt kê toàn bộ chính xác 100%),「や」chỉ đưa ra một vài đại diện tiêu biểu trong tập hợp. Cuối danh sách có thể thêm「など」(vân vân).",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "N1 + や + N2 + (など)",
        "example": "本 や ペン (など)"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-10-yn-1",
        "japanese": "箱の中に写真や手紙などがあります。",
        "reading": "はこのなかにしゃしんやてがみなどがあります。",
        "vietnamese": "Trong hộp có những thứ như hình ảnh, thư từ vân vân."
      }
    ],
    "quickQuiz": {
      "question": "机の上にノート（　）ペンなどがあります。",
      "questionVi": "Trên bàn có những thứ như vở, bút vân vân.",
      "options": [
        "や",
        "と",
        "も",
        "が"
      ],
      "optionsVi": [
        "Liệt kê tiêu biểu (ya)",
        "Liệt kê toàn bộ (to)",
        "Cũng",
        "Chủ ngữ"
      ],
      "correctIndex": 0,
      "explanation": "Có「など」(vân vân) ở sau chứng tỏ là liệt kê tiêu biểu, dùng trợ từ「や」."
    }
  },

  // =========================================================================
  // BÀI 11: Số lượng & Đơn vị đếm
  // =========================================================================
  {
    "id": "n5-11-counting",
    "lessonId": "minna-11",
    "lessonNumber": 11,
    "lessonTitle": "Bài 11: Số lượng & Đơn vị đếm",
    "curriculum": "MINNA",
    "grammarPoint": "Lượng từ & Vị trí lượng từ trong câu (N を [Lượng từ] V)",
    "reading": "りょうし",
    "romaji": "ryoushi (counting)",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Đếm số lượng đồ vật, người và vị trí của lượng từ",
    "structure": "N を + Lượng từ + Động từ (Ví dụ: りんごを ３つ 買いました)",
    "formality": "Lịch sự",
    "nuance": "Trong câu tiếng Nhật, lượng từ thường đặt ngay trước động từ và sau trợ từ (chứ không đứng trước danh từ như tiếng Việt).",
    "formationRules": [
      {
        "partOfSpeech": "Lượng từ",
        "rule": "Danh từ + を + Số đếm + Động từ",
        "example": "みかん を ４つ 食べました"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-11-c-1",
        "japanese": "スーパーでりんごを３つ買いました。",
        "reading": "すーぱーでりんごをみっつかいました。",
        "vietnamese": "Tôi đã mua 3 quả táo ở siêu thị."
      },
      {
        "id": "ex-n5-11-c-2",
        "japanese": "教室に学生が何人いますか。……５人います。",
        "reading": "きょうしつにがくせいがなんにんいますか。ごにんいます。",
        "vietnamese": "Trong phòng học có mấy học sinh? ……Có 5 người."
      }
    ],
    "cautionNotes": [
      "Lượng từ đứng TRƯỚC động từ: りんごを 2個 食べました (KHÔNG nói 2個のりんごを食べました trong khẩu ngữ Minna)."
    ],
    "quickQuiz": {
      "question": "切手を（　）買いました。",
      "questionVi": "Tôi đã mua 5 con tem.",
      "options": [
        "５枚",
        "５本",
        "５台",
        "５つ"
      ],
      "optionsVi": [
        "5 con tem (mai - đếm vật mỏng phẳng)",
        "Đếm vật dài",
        "Đếm xe cộ/máy móc",
        "Đếm chung"
      ],
      "correctIndex": 0,
      "explanation": "Tem thư là vật mỏng dẹt nên dùng đơn vị đếm「枚」(まい)."
    }
  },
  {
    "id": "n5-11-frequency",
    "lessonId": "minna-11",
    "lessonNumber": 11,
    "lessonTitle": "Bài 11: Số lượng & Đơn vị đếm",
    "curriculum": "MINNA",
    "grammarPoint": "Khoảng thời gian に 〜回 V (Tần suất)",
    "reading": "〜にかい",
    "romaji": "ni ~kai (frequency)",
    "level": "N5",
    "category": "time",
    "meaningVi": "Làm V mấy lần trong một khoảng thời gian",
    "structure": "Khoảng thời gian に + Số lần(〜かい / 〜ど) + V-ます",
    "formality": "Lịch sự",
    "nuance": "Trợ từ「に」ở đây đánh dấu đơn vị khoảng thời gian chuẩn để tính tần suất thực hiện hành động.",
    "formationRules": [
      {
        "partOfSpeech": "Thời gian",
        "rule": "Thời gian + に + [Số lần] + Động từ",
        "example": "１週間に ２回 運動します"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-11-f-1",
        "japanese": "１か月に２回映画を見に行きます。",
        "reading": "いっかげつにかくかいえいがをみにいきます。",
        "vietnamese": "Mỗi tháng tôi đi xem phim 2 lần."
      }
    ],
    "quickQuiz": {
      "question": "１日（　）３回薬を飲みます。",
      "questionVi": "Tôi uống thuốc một ngày 3 lần.",
      "options": [
        "に",
        "で",
        "を",
        "へ"
      ],
      "optionsVi": [
        "Trợ từ chu kỳ thời gian (ni)",
        "Bằng",
        "Tân ngữ",
        "Hướng"
      ],
      "correctIndex": 0,
      "explanation": "Chỉ tần suất trong một khoảng thời gian dùng trợ từ「に」."
    }
  },
  {
    "id": "n5-11-dake",
    "lessonId": "minna-11",
    "lessonNumber": 11,
    "lessonTitle": "Bài 11: Số lượng & Đơn vị đếm",
    "curriculum": "MINNA",
    "grammarPoint": "Lượng từ / N + だけ",
    "reading": "だけ",
    "romaji": "dake",
    "level": "N5",
    "category": "degree",
    "meaningVi": "Chỉ có...",
    "structure": "Lượng từ / Danh từ + だけ (Ví dụ: １つだけ、日曜日だけ)",
    "formality": "Lịch sự",
    "nuance": "Biểu thị sự giới hạn duy nhất, không có gì khác ngoài đối tượng đó.",
    "formationRules": [
      {
        "partOfSpeech": "Hạn định",
        "rule": "Danh từ/Số lượng + だけ",
        "example": "私だけ、１回だけ"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-11-d-1",
        "japanese": "休みは日曜日だけです。土曜日は働きます。",
        "reading": "やすみはにちようびだけです。どようびははたらきます。",
        "vietnamese": "Ngày nghỉ chỉ có mỗi Chủ Nhật. Thứ Bảy tôi vẫn làm việc."
      }
    ],
    "quickQuiz": {
      "question": "クラスにベトナム人の学生は私（　）です。",
      "questionVi": "Trong lớp học sinh người Việt chỉ có mỗi mình tôi.",
      "options": [
        "だけ",
        "しか",
        "でも",
        "ほど"
      ],
      "optionsVi": [
        "Chỉ (dake + khẳng định)",
        "Chỉ (shika + phủ định)",
        "Cũng",
        "Bằng"
      ],
      "correctIndex": 0,
      "explanation": "Câu kết thúc bằng khẳng định「です」nên dùng「だけ」."
    }
  },

  // =========================================================================
  // BÀI 12: So sánh hơn & So sánh nhất
  // =========================================================================
  {
    "id": "n5-12-past-adj",
    "lessonId": "minna-12",
    "lessonNumber": 12,
    "lessonTitle": "Bài 12: So sánh hơn & So sánh nhất",
    "curriculum": "MINNA",
    "grammarPoint": "Quá khứ của Tính từ & Danh từ",
    "reading": "かこけい",
    "romaji": "kakokei (past form)",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Các thì quá khứ của Tính từ đuôi い, Tính từ đuôi な và Danh từ",
    "structure": "A-い: 〜かったです / 〜くありませんでした | Na/N: 〜でした / 〜じゃありませんでした",
    "formality": "Lịch sự",
    "nuance": "Biến đổi trạng thái trong quá khứ. Lưu ý「いい」(tốt) quá khứ là「よかったです」, phủ định quá khứ là「よくありませんでした」.",
    "formationRules": [
      {
        "partOfSpeech": "Tính từ い",
        "rule": "Bỏ [い] + かったです",
        "example": "寒かった です"
      },
      {
        "partOfSpeech": "Tính từ な / N",
        "rule": "Từ + でした",
        "example": "静か でした、雨 でした"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-12-p-1",
        "japanese": "昨日は天気がよかったです。あまり寒くありませんでした。",
        "reading": "きのうはてんきがよかったです。あまりさむくありませんでした。",
        "vietnamese": "Hôm qua thời tiết rất đẹp. Không lạnh lắm."
      }
    ],
    "quickQuiz": {
      "question": "お祭りはどうでしたか。……とても（　）。",
      "questionVi": "Lễ hội như thế nào? ……Đã rất náo nhiệt.",
      "options": [
        "賑やかでした",
        "賑やかです",
        "賑やかかった",
        "賑やかの"
      ],
      "optionsVi": [
        "Quá khứ tính từ な (chính xác)",
        "Hiện tại",
        "Sai chia",
        "Sai trợ từ"
      ],
      "correctIndex": 0,
      "explanation": "Hỏi「どうでしたか」(quá khứ), tính từ đuôi な chia quá khứ là「賑やかでした」."
    }
  },
  {
    "id": "n5-12-hikaku-yori",
    "lessonId": "minna-12",
    "lessonNumber": 12,
    "lessonTitle": "Bài 12: So sánh hơn & So sánh nhất",
    "curriculum": "MINNA",
    "grammarPoint": "N1 は N2 より A です",
    "reading": "は〜より〜です",
    "romaji": "wa ~ yori ~ desu",
    "level": "N5",
    "category": "degree",
    "meaningVi": "N1 thì A hơn N2 (So sánh hơn)",
    "structure": "N1 は N2 より [Tính từ] です",
    "formality": "Lịch sự",
    "nuance": "Trợ từ「より」(so với) đặt sau đối tượng được dùng làm mốc so sánh. N1 có mức độ tính chất cao hơn N2.",
    "formationRules": [
      {
        "partOfSpeech": "So sánh",
        "rule": "N1 は N2 より + Tính từ",
        "example": "車 は 自転車 より 速い です"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-12-y-1",
        "japanese": "北海道は東京よりずっと広いです。",
        "reading": "ほっかいどうはとうきょうよりずっとひろいです。",
        "vietnamese": "Hokkaido rộng hơn Tokyo rất nhiều."
      }
    ],
    "quickQuiz": {
      "question": "日本はベトナム（　）寒いです。",
      "questionVi": "Nhật Bản lạnh hơn Việt Nam.",
      "options": [
        "より",
        "ほど",
        "から",
        "まで"
      ],
      "optionsVi": [
        "Hơn/so với (yori)",
        "Bằng",
        "Từ",
        "Đến"
      ],
      "correctIndex": 0,
      "explanation": "So với Việt Nam dùng trợ từ so sánh「より」."
    }
  },
  {
    "id": "n5-12-hikaku-dochira",
    "lessonId": "minna-12",
    "lessonNumber": 12,
    "lessonTitle": "Bài 12: So sánh hơn & So sánh nhất",
    "curriculum": "MINNA",
    "grammarPoint": "N1 と N2 と どちらが A ですか",
    "reading": "と〜と どちらが〜ですか",
    "romaji": "to ~ to dochira ga ~ desu ka",
    "level": "N5",
    "category": "degree",
    "meaningVi": "Giữa N1 và N2 thì cái nào A hơn?",
    "structure": "N1 と N2 と どちらが A ですか (Trả lời: N1 のほうが A です / どちらも A です)",
    "formality": "Lịch sự",
    "nuance": "Dùng khi so sánh giữa hai đối tượng. Câu trả lời lựa chọn 1 bên dùng cụm「〜のほうが」(phía bên...) đi kèm tính từ.",
    "formationRules": [
      {
        "partOfSpeech": "So sánh",
        "rule": "N1 と N2 と どちらが A ですか",
        "example": "肉と魚とどちらが好きですか"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-12-d-1",
        "japanese": "サッカーと野球とどちらが面白いですか。……サッカーのほうが面白いです。",
        "reading": "さっかーとやきゅうとどちらがおもしろいですか。さっかーのほうがおもしろいです。",
        "vietnamese": "Giữa bóng đá và bóng chày môn nào thú vị hơn? ……Bóng đá thú vị hơn."
      }
    ],
    "quickQuiz": {
      "question": "日本料理と中華料理と（　）が好きですか。",
      "questionVi": "Món Nhật và món Trung Hoa bạn thích món nào hơn?",
      "options": [
        "どちら",
        "どれ",
        "どこ",
        "だれ"
      ],
      "optionsVi": [
        "Cái nào trong 2 đối tượng (dochira)",
        "Trong 3 đối tượng trở lên",
        "Ở đâu",
        "Ai"
      ],
      "correctIndex": 0,
      "explanation": "Lựa chọn giữa 2 đối tượng dùng từ nghi vấn「どちら」."
    }
  },
  {
    "id": "n5-12-hikaku-ichiban",
    "lessonId": "minna-12",
    "lessonNumber": 12,
    "lessonTitle": "Bài 12: So sánh hơn & So sánh nhất",
    "curriculum": "MINNA",
    "grammarPoint": "[Phạm vi] で [何/どこ/だれ/いつ] が いちばん A ですか",
    "reading": "で いちばん〜ですか",
    "romaji": "de ichiban ~ desu ka",
    "level": "N5",
    "category": "degree",
    "meaningVi": "Trong phạm vi... thì cái gì / ở đâu / ai / khi nào là A nhất?",
    "structure": "N(nhóm/phạm vi) で Từ nghi vấn が いちばん A ですか (Trả lời: N が いちばん A です)",
    "formality": "Lịch sự",
    "nuance": "Trợ từ「で」chỉ phạm vi lựa chọn (từ 3 đối tượng trở lên).「いちばん」mang nghĩa số một, nhất.",
    "formationRules": [
      {
        "partOfSpeech": "So sánh nhất",
        "rule": "Phạm vi + で + いちばん + Tính từ",
        "example": "世界で いちばん 高い山"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-12-i-1",
        "japanese": "１年でいつがいちばん寒いですか。……２月がいちばん寒いです。",
        "reading": "いちねんでいつがいちばんさむいですか。にがつがいちばんさむいです。",
        "vietnamese": "Trong một năm thì khi nào lạnh nhất? ……Tháng hai là lạnh nhất."
      }
    ],
    "quickQuiz": {
      "question": "スポーツの中で何（　）いちばん好きですか。",
      "questionVi": "Trong các môn thể thao bạn thích môn nào nhất?",
      "options": [
        "が",
        "を",
        "は",
        "で"
      ],
      "optionsVi": [
        "Chủ thể được chọn (ga)",
        "Tân ngữ",
        "Chủ đề",
        "Phạm vi"
      ],
      "correctIndex": 0,
      "explanation": "Sau từ nghi vấn「何」(cái gì) trong câu so sánh nhất luôn đi với trợ từ「が」."
    }
  },

  // =========================================================================
  // BÀI 13: Nguyện vọng & Mục đích di chuyển
  // =========================================================================
  {
    "id": "n5-13-hoshii",
    "lessonId": "minna-13",
    "lessonNumber": 13,
    "lessonTitle": "Bài 13: Nguyện vọng & Mục đích di chuyển",
    "curriculum": "MINNA",
    "grammarPoint": "N が ほしいです",
    "reading": "がほしいです",
    "romaji": "ga hoshii desu",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Tôi muốn có cái gì đó N (Nguyện vọng sở hữu danh từ)",
    "structure": "N が ほしいです (Phủ định: ほしくないです)",
    "formality": "Lịch sự",
    "nuance": "Biểu thị mong muốn sở hữu một vật cụ thể của người nói. Đối tượng mong muốn đi với trợ từ「が」. Không dùng để hỏi nguyện vọng của bề trên.",
    "formationRules": [
      {
        "partOfSpeech": "Tính từ い",
        "rule": "Danh từ + が + ほしいです",
        "example": "新しい車 が ほしいです"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-13-h-1",
        "japanese": "今何がいちばんほしいですか。……広い家がほしいです。",
        "reading": "いまなにがいちばんほしいですか。ひろいいえがほしいです。",
        "vietnamese": "Bây giờ bạn muốn có thứ gì nhất? ……Tôi muốn có một ngôi nhà rộng."
      }
    ],
    "quickQuiz": {
      "question": "誕生日にお金（　）ほしいです。",
      "questionVi": "Vào ngày sinh nhật tôi muốn có tiền.",
      "options": [
        "が",
        "を",
        "に",
        "で"
      ],
      "optionsVi": [
        "Đối tượng muốn có (ga)",
        "Tân ngữ",
        "Cho",
        "Bằng"
      ],
      "correctIndex": 0,
      "explanation": "Sau danh từ mong muốn đi với「ほしい」phải dùng trợ từ「が」."
    }
  },
  {
    "id": "n5-13-tai",
    "lessonId": "minna-13",
    "lessonNumber": 13,
    "lessonTitle": "Bài 13: Nguyện vọng & Mục đích di chuyển",
    "curriculum": "MINNA",
    "grammarPoint": "V-たいです / V-たくないです",
    "reading": "たいです",
    "romaji": "tai desu",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Tôi muốn làm... / Tôi không muốn làm... (Hành động)",
    "structure": "V(bỏ ます) + たいです (Phủ định: たくないです / Quá khứ: たかったです)",
    "formality": "Lịch sự",
    "nuance": "Bày tỏ mong muốn thực hiện hành động của bản thân. Tân ngữ「を」có thể đổi thành「が」khi đi kèm V-たい.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-thân + たいです",
        "example": "行きます → 行きたいです"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-13-t-1",
        "japanese": "日本へ旅行に行きたいです。桜を見たいです。",
        "reading": "にほんへりょこうにいきたいです。さくらをみたいです。",
        "vietnamese": "Tôi muốn đi du lịch Nhật Bản. Tôi muốn ngắm hoa anh đào."
      }
    ],
    "quickQuiz": {
      "question": "疲れたから、何も（　）。",
      "questionVi": "Vì mệt rồi nên tôi không muốn ăn gì cả.",
      "options": [
        "食べたくないです",
        "食べたいです",
        "食べます",
        "食べたかったです"
      ],
      "optionsVi": [
        "Không muốn ăn (phủ định)",
        "Muốn ăn",
        "Ăn",
        "Đã muốn ăn"
      ],
      "correctIndex": 0,
      "explanation": "Có cụm phủ định hoàn toàn「何も」(gì cả) nên chọn「食べたくないです」."
    }
  },
  {
    "id": "n5-13-mokuteki-ni",
    "lessonId": "minna-13",
    "lessonNumber": 13,
    "lessonTitle": "Bài 13: Nguyện vọng & Mục đích di chuyển",
    "curriculum": "MINNA",
    "grammarPoint": "N(địa điểm) へ [V-bỏ ます / N] に 行きます / 来ます / 帰ります",
    "reading": "にいきます / にきます",
    "romaji": "ni ikimasu / kimasu",
    "level": "N5",
    "category": "purpose",
    "meaningVi": "Đi / Đến / Về đâu để làm mục đích gì",
    "structure": "N(địa điểm) へ [V(bỏ ます) / Danh từ hành động] に 行きます / 来ます / 帰ります",
    "formality": "Lịch sự",
    "nuance": "Trợ từ「に」ở đây biểu thị mục đích của hành động di chuyển.",
    "formationRules": [
      {
        "partOfSpeech": "Mục đích",
        "rule": "V-thân + に + 行きます",
        "example": "買いに行きます (đi mua)"
      },
      {
        "partOfSpeech": "Mục đích",
        "rule": "Danh từ hành động + に + 行きます",
        "example": "買い物に行きます (đi mua sắm)"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-13-m-1",
        "japanese": "デパートへ服を買いに行きます。",
        "reading": "でぱーとへふくをかいにいきます。",
        "vietnamese": "Tôi đi đến trung tâm thương mại để mua quần áo."
      }
    ],
    "quickQuiz": {
      "question": "郵便局へ切手を買い（　）行きました。",
      "questionVi": "Tôi đã đến bưu điện để mua tem.",
      "options": [
        "に",
        "で",
        "を",
        "へ"
      ],
      "optionsVi": [
        "Mục đích di chuyển (ni)",
        "Nơi chốn",
        "Tân ngữ",
        "Hướng"
      ],
      "correctIndex": 0,
      "explanation": "Đi đâu để làm gì thì mục đích đi với trợ từ「に」: 買いに行きました."
    }
  },

  // =========================================================================
  // BÀI 14: Thể Te & Sai khiến nhờ vả lịch sự
  // =========================================================================
  {
    "id": "n5-14-te-form",
    "lessonId": "minna-14",
    "lessonNumber": 14,
    "lessonTitle": "Bài 14: Thể Te & Sai khiến nhờ vả lịch sự",
    "curriculum": "MINNA",
    "grammarPoint": "Cách chia Động từ thể て (V-て)",
    "reading": "てけい",
    "romaji": "te-kei (Te form)",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Quy tắc chia động từ thể Te (Nhóm 1, Nhóm 2, Nhóm 3)",
    "structure": "Nhóm 1: い・ち・り→って / み・び・に→んで / き→いて / ぎ→いで / し→して | Nhóm 2: bỏ ます+て | Nhóm 3: して / 来て(きて)",
    "formality": "Thông dụng",
    "nuance": "Thể Te là thể biến đổi quan trọng bậc nhất trong tiếng Nhật, làm nền tảng cho hàng chục mẫu câu ngữ pháp nâng cao.",
    "formationRules": [
      {
        "partOfSpeech": "Nhóm 1",
        "rule": "買い(う)→買って, 読み(む)→読んで, 行き(く)→行って",
        "example": "書いて、飲んで、話して"
      },
      {
        "partOfSpeech": "Nhóm 2",
        "rule": "Bỏ ます + て",
        "example": "食べて、見て、起きて"
      },
      {
        "partOfSpeech": "Nhóm 3",
        "rule": "します→して, 来ます(きます)→来て(きて)",
        "example": "散歩して、持って来て"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-14-f-1",
        "japanese": "本を読んで、音楽を聴きます。",
        "reading": "ほんをよんで、おんがくをききます。",
        "vietnamese": "Tôi đọc sách rồi nghe nhạc."
      }
    ],
    "cautionNotes": [
      "Lưu ý ngoại lệ nhóm 1: 行きます (ikimasu) chia là 行って (itte), KHÔNG phải iite."
    ],
    "quickQuiz": {
      "question": "「待ちます」のて形は何ですか。",
      "questionVi": "Thể Te của động từ「待ちます」(chờ đợi) là gì?",
      "options": [
        "待って",
        "待いて",
        "待んで",
        "待して"
      ],
      "optionsVi": [
        "待って (chi-ri-i biến thành って)",
        "Sai",
        "Sai",
        "Sai"
      ],
      "correctIndex": 0,
      "explanation": "Động từ tận cùng là ち (chi) thuộc nhóm 1 biến thành âm ngắt って: 待って."
    }
  },
  {
    "id": "n5-14-te-kudasai",
    "lessonId": "minna-14",
    "lessonNumber": 14,
    "lessonTitle": "Bài 14: Thể Te & Sai khiến nhờ vả lịch sự",
    "curriculum": "MINNA",
    "grammarPoint": "V-てください (Xin hãy làm gì)",
    "reading": "てください",
    "romaji": "te kudasai",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Xin vui lòng hãy làm gì đó (Nhờ vả, yêu cầu lịch sự)",
    "structure": "V-て + ください",
    "formality": "Lịch sự",
    "nuance": "Dùng để sai khiến, chỉ dẫn hoặc nhờ vả người nghe làm điều gì đó một cách nhã nhặn. Không dùng với người có vị thế cao hơn mà nên dùng dạng kính ngữ.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-て + ください",
        "example": "ちょっと 待ってください"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-14-tk-1",
        "japanese": "すみませんが、ここに名前と住所を書いてください。",
        "reading": "すみませんが、ここになまえとじゅうしょをかいてください。",
        "vietnamese": "Xin lỗi, xin vui lòng viết tên và địa chỉ vào đây."
      }
    ],
    "quickQuiz": {
      "question": "エアコンを（　）ください。部屋が暑いです。",
      "questionVi": "Xin hãy bật điều hòa lên. Phòng nóng quá.",
      "options": [
        "つけて",
        "つけます",
        "つける",
        "つけない"
      ],
      "optionsVi": [
        "V-te kudasai (chuẩn xác)",
        "Thể Masu",
        "Thể từ điển",
        "Thể Nai"
      ],
      "correctIndex": 0,
      "explanation": "Yêu cầu lịch sự: V-てください: つけてください."
    }
  },
  {
    "id": "n5-14-te-iru",
    "lessonId": "minna-14",
    "lessonNumber": 14,
    "lessonTitle": "Bài 14: Thể Te & Sai khiến nhờ vả lịch sự",
    "curriculum": "MINNA",
    "grammarPoint": "V-ています (Hành động đang diễn ra)",
    "reading": "ています",
    "romaji": "te imasu (continuous)",
    "level": "N5",
    "category": "time",
    "meaningVi": "Đang làm gì đó ngay tại thời điểm nói",
    "structure": "V-て + います",
    "formality": "Lịch sự",
    "nuance": "Biểu thị hành động tiếp diễn tại thời điểm nói (tương đương thì Present Continuous trong tiếng Anh).",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-て + います",
        "example": "今 レポートを 書いています"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-14-ti-1",
        "japanese": "ミラーさんは今ロビーで電話をかけています。",
        "reading": "みらーさんはいまろびーででんわをかけています。",
        "vietnamese": "Anh Miller hiện đang gọi điện thoại ở sảnh."
      }
    ],
    "quickQuiz": {
      "question": "太郎君はどこですか。……庭で犬と（　）。",
      "questionVi": "Bé Taro đâu rồi? ……Bé đang chơi với chó ngoài sân.",
      "options": [
        "遊んでいます",
        "遊びます",
        "遊んだ",
        "遊ぶ"
      ],
      "optionsVi": [
        "Đang chơi (V-te imasu)",
        "Sẽ chơi",
        "Đã chơi",
        "Thể từ điển"
      ],
      "correctIndex": 0,
      "explanation": "Hành động đang xảy ra tại thời điểm nói chia「〜ています」: 遊んでいます."
    }
  },
  {
    "id": "n5-14-mashou-ka",
    "lessonId": "minna-14",
    "lessonNumber": 14,
    "lessonTitle": "Bài 14: Thể Te & Sai khiến nhờ vả lịch sự",
    "curriculum": "MINNA",
    "grammarPoint": "V-ましょうか (Đề nghị giúp đỡ)",
    "reading": "ましょうか",
    "romaji": "mashou ka",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Để tôi làm giúp bạn nhé? (Đề xuất giúp đỡ)",
    "structure": "V(bỏ ます) + ましょうか",
    "formality": "Lịch sự",
    "nuance": "Người nói nhận thấy đối phương đang gặp khó khăn và chủ động đưa ra lời đề nghị giúp đỡ.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-thân + ましょうか",
        "example": "荷物を 持ちましょうか"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-14-mk-1",
        "japanese": "荷物が重そうですね。持ちましょうか。……ありがとうございます。",
        "reading": "にもつがおもそうですね。もちましょうか。ありがとうございます。",
        "vietnamese": "Hành lý có vẻ nặng nhỉ. Để tôi xách hộ nhé? ……Cảm ơn bạn nhiều."
      }
    ],
    "quickQuiz": {
      "question": "窓を（　）ましょうか。……ええ、お願いします。",
      "questionVi": "Để tôi mở cửa sổ giúp nhé? ……Vâng, nhờ bạn nhé.",
      "options": [
        "開け",
        "開けて",
        "開く",
        "開けます"
      ],
      "optionsVi": [
        "V-thân bỏ masu (chuẩn xác)",
        "Thể Te",
        "Tự động từ",
        "Còn giữ masu"
      ],
      "correctIndex": 0,
      "explanation": "Cấu trúc V-thân + ましょうか: 開けましょうか."
    }
  },

  // =========================================================================
  // BÀI 15: Cho phép & Cấm đoán
  // =========================================================================
  {
    "id": "n5-15-te-mo-ii",
    "lessonId": "minna-15",
    "lessonNumber": 15,
    "lessonTitle": "Bài 15: Cho phép & Cấm đoán",
    "curriculum": "MINNA",
    "grammarPoint": "V-てもいいです (Được phép làm gì)",
    "reading": "てもいいです",
    "romaji": "te mo ii desu",
    "level": "N5",
    "category": "obligation",
    "meaningVi": "Làm việc gì đó cũng được / Có thể làm... (Xin phép)",
    "structure": "V-て + もいいですか (Xin phép) / V-て + もいいです (Cho phép)",
    "formality": "Lịch sự",
    "nuance": "Dùng khi muốn xin phép làm một việc gì đó hoặc người có thẩm quyền cấp phép.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-て + もいいです",
        "example": "ここで 写真を 撮ってもいいです"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-15-tmi-1",
        "japanese": "ここで写真を撮ってもいいですか。……ええ、いいですよ。",
        "reading": "ここでしゃしんをとってもいいですか。ええ、いいですよ。",
        "vietnamese": "Tôi chụp ảnh ở đây có được không? ……Vâng, được chứ ạ."
      }
    ],
    "quickQuiz": {
      "question": "この傘を（　）もいいですか。……どうぞ。",
      "questionVi": "Tôi dùng chiếc ô này có được không? ……Xin mời.",
      "options": [
        "使って",
        "使う",
        "使います",
        "使わない"
      ],
      "optionsVi": [
        "V-te (chuẩn cấu trúc te mo ii)",
        "Thể từ điển",
        "Thể Masu",
        "Thể Nai"
      ],
      "correctIndex": 0,
      "explanation": "Cấu trúc xin phép: V-てもいいですか: 使ってもいいですか."
    }
  },
  {
    "id": "n5-15-te-wa-ikenai",
    "lessonId": "minna-15",
    "lessonNumber": 15,
    "lessonTitle": "Bài 15: Cho phép & Cấm đoán",
    "curriculum": "MINNA",
    "grammarPoint": "V-てはいけません (Cấm làm gì)",
    "reading": "てはいけません",
    "romaji": "te wa ikemasen",
    "level": "N5",
    "category": "obligation",
    "meaningVi": "Không được làm... / Cấm làm...",
    "structure": "V-て + はいけません",
    "formality": "Lịch sự",
    "nuance": "Biểu thị sự cấm đoán dựa trên quy tắc, nội quy chung hoặc pháp luật.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-て + はいけません",
        "example": "ここに 車を 止めてはいけません"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-15-twi-1",
        "japanese": "美術館の中でタバコを吸ってはいけません。",
        "reading": "びじゅつかんのなかでたばこをすってはいけません。",
        "vietnamese": "Cấm hút thuốc bên trong bảo tàng mỹ thuật."
      }
    ],
    "quickQuiz": {
      "question": "ここに車を（　）はいけません。駐車禁止です。",
      "questionVi": "Không được đỗ xe ở đây. Cấm đỗ xe.",
      "options": [
        "止めて",
        "止める",
        "止めます",
        "止めた"
      ],
      "optionsVi": [
        "V-te (chuẩn cấu trúc te wa ikemasen)",
        "Thể từ điển",
        "Thể Masu",
        "Thể Ta"
      ],
      "correctIndex": 0,
      "explanation": "Cấm đoán theo nội quy: V-てはいけません: 止めてはいけません."
    }
  },
  {
    "id": "n5-15-te-iru-kekka",
    "lessonId": "minna-15",
    "lessonNumber": 15,
    "lessonTitle": "Bài 15: Cho phép & Cấm đoán",
    "curriculum": "MINNA",
    "grammarPoint": "V-ています (Trạng thái kết quả, hôn nhân, chỗ ở, nghề nghiệp)",
    "reading": "ています",
    "romaji": "te imasu (state / habit)",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Đang duy trì trạng thái: kết hôn (結婚しています), sinh sống (住んでいます), biết (知っています)",
    "structure": "V-て + います",
    "formality": "Lịch sự",
    "nuance": "Hành động xảy ra trong quá khứ và kết quả của nó vẫn đang tiếp diễn đến hiện tại.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "Động từ chỉ trạng thái + ています",
        "example": "結婚しています、住んでいます、持っています"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-15-tik-1",
        "japanese": "私はハノイに住んでいます。IMCで働いています。",
        "reading": "わたしははのいにすんでいます。あいえむしーではたらいています。",
        "vietnamese": "Tôi đang sống ở Hà Nội. Tôi làm việc ở công ty IMC."
      }
    ],
    "cautionNotes": [
      "Hỏi「知っていますか」(Bạn có biết không?), nếu KHÔNG biết thì trả lời「いいえ、知りません」(KHÔNG nói 知っていません)."
    ],
    "quickQuiz": {
      "question": "佐藤さんの電話番号を知っていますか。……いいえ、（　）。",
      "questionVi": "Bạn có biết số điện thoại chị Sato không? ……Không, tôi không biết.",
      "options": [
        "知りません",
        "知っていません",
        "知りませんでした",
        "知らないでした"
      ],
      "optionsVi": [
        "Không biết (bắt buộc dùng shirimasen)",
        "Sai ngữ pháp",
        "Đã không biết",
        "Sai cấu trúc"
      ],
      "correctIndex": 0,
      "explanation": "Phủ định của 知っています bắt buộc là「知りません」."
    }
  },

  // =========================================================================
  // BÀI 16: Nối câu & Trình tự thời gian
  // =========================================================================
  {
    "id": "n5-16-te-sequence",
    "lessonId": "minna-16",
    "lessonNumber": 16,
    "lessonTitle": "Bài 16: Nối câu & Trình tự thời gian",
    "curriculum": "MINNA",
    "grammarPoint": "V1-て、V2-て、... V-ます (Chuỗi hành động liên tiếp)",
    "reading": "て〜て",
    "romaji": "te ~ te (sequence)",
    "level": "N5",
    "category": "time",
    "meaningVi": "Làm V1, rồi làm V2, sau đó làm V3 (Theo thứ tự thời gian)",
    "structure": "V1-て、V2-て、... V[cuối câu chia thì thích hợp]",
    "formality": "Lịch sự",
    "nuance": "Dùng thể Te để kết nối hai hay nhiều hành động diễn ra nối tiếp nhau theo trình tự thời gian. Thì của cả câu được quyết định bởi động từ cuối cùng.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V1-て + V2-て + V3",
        "example": "起きて、顔を洗って、朝ご飯を食べます"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-16-ts-1",
        "japanese": "朝ジョギングをして、シャワーを浴びて、会社へ行きます。",
        "reading": "あさじょぎんぐをして、しゃわーをあびて、かいしゃへいきます。",
        "vietnamese": "Buổi sáng tôi chạy bộ, tắm vòi sen rồi đi đến công ty."
      }
    ],
    "quickQuiz": {
      "question": "昨日は銀座へ（　）、映画を見て、お茶を飲みました。",
      "questionVi": "Hôm qua tôi đã đến Ginza, xem phim rồi uống trà.",
      "options": [
        "行って",
        "行きます",
        "行った",
        "行かないで"
      ],
      "optionsVi": [
        "V-te nối chuỗi (itte)",
        "Thể Masu",
        "Thể Ta",
        "Phủ định"
      ],
      "correctIndex": 0,
      "explanation": "Nối chuỗi hành động theo trình tự thời gian dùng thể Te: 銀座へ行って."
    }
  },
  {
    "id": "n5-16-adj-te",
    "lessonId": "minna-16",
    "lessonNumber": 16,
    "lessonTitle": "Bài 16: Nối câu & Trình tự thời gian",
    "curriculum": "MINNA",
    "grammarPoint": "A-くて / Na-で / N-で (Nối tính từ & danh từ)",
    "reading": "くて / で",
    "romaji": "kute / de (adj connection)",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Vừa... lại vừa... / Vừa là... và là...",
    "structure": "A-い: Bỏ [い] + くて | Na / N: + で (Ví dụ: 安くて おいしい / 親切で きれい)",
    "formality": "Lịch sự",
    "nuance": "Dùng để liên kết các đặc tính, thuộc tính cùng tích cực hoặc cùng tiêu cực của một sự vật/con người.",
    "formationRules": [
      {
        "partOfSpeech": "Tính từ い",
        "rule": "Bỏ [い] + くて",
        "example": "安くて おいしい"
      },
      {
        "partOfSpeech": "Tính từ な",
        "rule": "Na + で",
        "example": "静かで きれい"
      },
      {
        "partOfSpeech": "Danh từ",
        "rule": "N + で",
        "example": "ベトナム人で 学生です"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-16-at-1",
        "japanese": "サントスさんは親切で、とても面白い人です。",
        "reading": "さんとすさんはしんせつで、とてもおもしろいひとです。",
        "vietnamese": "Anh Santos tốt bụng và là một người rất thú vị."
      }
    ],
    "quickQuiz": {
      "question": "この部屋は（　）、明るいです。",
      "questionVi": "Căn phòng này rộng và sáng sủa.",
      "options": [
        "広くて",
        "広い",
        "広いで",
        "広くては"
      ],
      "optionsVi": [
        "A-くて (chuẩn nối tính từ い)",
        "Chưa nối",
        "Sai thể",
        "Dư wa"
      ],
      "correctIndex": 0,
      "explanation": "Tính từ đuôi い「広い」khi nối vế biến thành「広くて」."
    }
  },
  {
    "id": "n5-16-te-kara",
    "lessonId": "minna-16",
    "lessonNumber": 16,
    "lessonTitle": "Bài 16: Nối câu & Trình tự thời gian",
    "curriculum": "MINNA",
    "grammarPoint": "V1-てから、V2 (Sau khi làm V1 thì làm V2)",
    "reading": "てから",
    "romaji": "te kara",
    "level": "N5",
    "category": "time",
    "meaningVi": "Sau khi làm xong hành động 1 thì mới làm hành động 2",
    "structure": "V1-て + から、V2",
    "formality": "Lịch sự",
    "nuance": "Nhấn mạnh hành động V1 phải được hoàn tất xong xuôi thì hành động V2 mới bắt đầu hoặc diễn ra tiếp theo.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V1-て + から",
        "example": "手を 洗ってから、ご飯を食べます"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-16-tk-1",
        "japanese": "仕事が終わってから、泳ぎに行きます。",
        "reading": "しごとがおわってから、およぎにいきます。",
        "vietnamese": "Sau khi công việc kết thúc, tôi sẽ đi bơi."
      }
    ],
    "quickQuiz": {
      "question": "お金を（　）から、ボタンを押してください。",
      "questionVi": "Sau khi cho tiền vào thì xin vui lòng hãy bấm nút.",
      "options": [
        "入れて",
        "入れる",
        "入れます",
        "入れた"
      ],
      "optionsVi": [
        "V-te kara (chuẩn xác)",
        "Thể từ điển",
        "Thể Masu",
        "Thể Ta"
      ],
      "correctIndex": 0,
      "explanation": "Cấu trúc sau khi làm gì: V-てから: 入れてから."
    }
  },
  {
    "id": "n5-16-wa-ga",
    "lessonId": "minna-16",
    "lessonNumber": 16,
    "lessonTitle": "Bài 16: Nối câu & Trình tự thời gian",
    "curriculum": "MINNA",
    "grammarPoint": "N1 は N2 が A です (Miêu tả đặc điểm / bộ phận)",
    "reading": "は〜が〜です",
    "romaji": "wa ~ ga ~ desu",
    "level": "N5",
    "category": "basics",
    "meaningVi": "N1 thì có bộ phận / thuộc tính N2 như thế nào",
    "structure": "N1(chủ thể) は N2(bộ phận/thuộc tính) が [Tính từ] です",
    "formality": "Lịch sự",
    "nuance": "Mẫu câu kinh điển dùng để miêu tả ngoại hình, tính cách hoặc đặc trưng của một đối tượng. Chủ thể lớn đi với「は」, bộ phận trực tiếp đi với「が」.",
    "formationRules": [
      {
        "partOfSpeech": "Đặc điểm",
        "rule": "N1 は N2 が Tính từ",
        "example": "象は 鼻が 長い (Voi mũi dài)"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-16-wg-1",
        "japanese": "マリアさんは髪が長くて、目が大きいです。",
        "reading": "まりあさんはかみがながくて、めがおおきいです。",
        "vietnamese": "Bạn Maria tóc dài và mắt to."
      }
    ],
    "quickQuiz": {
      "question": "象は鼻（　）長いです。",
      "questionVi": "Con voi thì mũi dài.",
      "options": [
        "が",
        "は",
        "を",
        "に"
      ],
      "optionsVi": [
        "Trợ từ bộ phận (ga)",
        "Chủ đề lớn",
        "Tân ngữ",
        "Thời gian"
      ],
      "correctIndex": 0,
      "explanation": "Miêu tả đặc điểm bộ phận trong cấu trúc N1 は N2 が: 鼻が長いです."
    }
  },

  // =========================================================================
  // BÀI 17: Thể Nai & Nghĩa vụ bắt buộc
  // =========================================================================
  {
    "id": "n5-17-nai-form",
    "lessonId": "minna-17",
    "lessonNumber": 17,
    "lessonTitle": "Bài 17: Thể Nai & Nghĩa vụ bắt buộc",
    "curriculum": "MINNA",
    "grammarPoint": "Cách chia Động từ thể ない (V-ない)",
    "reading": "ないけい",
    "romaji": "nai-kei (Nai form)",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Quy tắc chia động từ thể phủ định ngắn (Nai)",
    "structure": "Nhóm 1: Hàng [i] chuyển sang hàng [a] + ない (chú ý: い→わ) | Nhóm 2: Bỏ ます + ない | Nhóm 3: します→しない, 来ます→来ない(こない)",
    "formality": "Thông dụng",
    "nuance": "Dạng phủ định thể thường của động từ, là nền tảng tạo các mẫu câu bắt buộc, cấm đoán và khuyên nhủ.",
    "formationRules": [
      {
        "partOfSpeech": "Nhóm 1",
        "rule": "Hàng [i] → Hàng [a] + ない",
        "example": "書きます→書かない、読みます→読まない、会います→会わない"
      },
      {
        "partOfSpeech": "Nhóm 2",
        "rule": "Bỏ ます + ない",
        "example": "食べます→食べない、見ます→見ない"
      },
      {
        "partOfSpeech": "Nhóm 3",
        "rule": "Đặc biệt",
        "example": "しない、来ない(こない)"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-17-nf-1",
        "japanese": "お酒を飲まないで、お茶を飲みます。",
        "reading": "おさけをのまないで、おちゃをのみます。",
        "vietnamese": "Tôi không uống rượu mà uống trà."
      }
    ],
    "cautionNotes": [
      "Động từ あります (có) phủ định thể ngắn là ない (KHÔNG có あらない)."
    ],
    "quickQuiz": {
      "question": "「吸います」のない形は何ですか。",
      "questionVi": "Thể Nai của động từ「吸います」(hút thuốc) là gì?",
      "options": [
        "吸わない",
        "吸あない",
        "吸いない",
        "吸かない"
      ],
      "optionsVi": [
        "吸わない (âm い chuyển thành わ)",
        "Sai",
        "Sai",
        "Sai"
      ],
      "correctIndex": 0,
      "explanation": "Động từ nhóm 1 có đuôi âm [i] đứng trước masu chuyển thành hàng [a] đặc biệt là [wa]: 吸わない (suwanai)."
    }
  },
  {
    "id": "n5-17-naide-kudasai",
    "lessonId": "minna-17",
    "lessonNumber": 17,
    "lessonTitle": "Bài 17: Thể Nai & Nghĩa vụ bắt buộc",
    "curriculum": "MINNA",
    "grammarPoint": "V-ないでください (Xin đừng làm gì)",
    "reading": "ないでください",
    "romaji": "naide kudasai",
    "level": "N5",
    "category": "obligation",
    "meaningVi": "Xin vui lòng đừng làm việc gì đó",
    "structure": "V-ない + でください",
    "formality": "Lịch sự",
    "nuance": "Yêu cầu người nghe không thực hiện một hành động nào đó một cách lịch sự, nhã nhặn.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-ない + でください",
        "example": "ここで 写真を 撮らないでください"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-17-ndk-1",
        "japanese": "危ないですから、そこに入らないでください。",
        "reading": "あぶないですから、そこにはいらないでください。",
        "vietnamese": "Vì nguy hiểm nên xin đừng đi vào đó."
      }
    ],
    "quickQuiz": {
      "question": "パスポートを（　）でください。大切です。",
      "questionVi": "Xin đừng làm mất hộ chiếu. Rất quan trọng đấy.",
      "options": [
        "なくさない",
        "なくして",
        "なくす",
        "なくした"
      ],
      "optionsVi": [
        "V-nai de kudasai (chuẩn xác)",
        "Thể Te",
        "Thể từ điển",
        "Thể Ta"
      ],
      "correctIndex": 0,
      "explanation": "Cấu trúc xin đừng làm gì: V-ないでください: なくさないでください."
    }
  },
  {
    "id": "n5-17-nakereba-naranai",
    "lessonId": "minna-17",
    "lessonNumber": 17,
    "lessonTitle": "Bài 17: Thể Nai & Nghĩa vụ bắt buộc",
    "curriculum": "MINNA",
    "grammarPoint": "V-なければなりません (Phải làm gì - Nghĩa vụ)",
    "reading": "なければなりません",
    "romaji": "nakereba narimasen",
    "level": "N5",
    "category": "obligation",
    "meaningVi": "Bắt buộc phải làm gì (Nghĩa vụ, trách nhiệm)",
    "structure": "V(bỏ い của ない) + ければなりません",
    "formality": "Lịch sự",
    "nuance": "Biểu thị hành động bắt buộc phải làm theo quy định, đạo đức hoặc trách nhiệm xã hội, không thể không làm.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-ない (bỏ い) + ければなりません",
        "example": "飲まない → 飲まなければなりません"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-17-nn-1",
        "japanese": "熱がありますから、病院へ行かなければなりません。",
        "reading": "ねつがありますから、びょういんへいかなければなりません。",
        "vietnamese": "Vì bị sốt nên tôi phải đi đến bệnh viện."
      }
    ],
    "quickQuiz": {
      "question": "毎晩宿題を（　）ばなりません。",
      "questionVi": "Mỗi tối tôi phải làm bài tập về nhà.",
      "options": [
        "しなけれ",
        "しない",
        "して",
        "する"
      ],
      "optionsVi": [
        "しなけれ (cấu trúc nakereba)",
        "Chưa bỏ i",
        "Thể Te",
        "Thể từ điển"
      ],
      "correctIndex": 0,
      "explanation": "Phải làm: します → しない → しなければなりません."
    }
  },
  {
    "id": "n5-17-nakutemo-ii",
    "lessonId": "minna-17",
    "lessonNumber": 17,
    "lessonTitle": "Bài 17: Thể Nai & Nghĩa vụ bắt buộc",
    "curriculum": "MINNA",
    "grammarPoint": "V-なくてもいいです (Không cần phải làm gì)",
    "reading": "なくてもいいです",
    "romaji": "nakutemo ii desu",
    "level": "N5",
    "category": "obligation",
    "meaningVi": "Không làm cũng được / Không cần thiết phải làm",
    "structure": "V(bỏ い của ない) + くてもいいです",
    "formality": "Lịch sự",
    "nuance": "Biểu thị sự không bắt buộc, người nghe không cần phải làm việc đó nếu không muốn.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-ない (bỏ い) + くてもいいです",
        "example": "来ない → 来なくてもいいです"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-17-nmi-1",
        "japanese": "明日は日曜日ですから、早く起きなくてもいいです。",
        "reading": "あしたはにちようびですから、はやくおきなくてもいいです。",
        "vietnamese": "Ngày mai là Chủ Nhật nên tôi không cần phải dậy sớm."
      }
    ],
    "quickQuiz": {
      "question": "靴を（　）てもいいですか。……はい、脱がなくてもいいですよ。",
      "questionVi": "Tôi không cởi giày có được không? ……Vâng, không cần cởi cũng được ạ.",
      "options": [
        "脱が なく",
        "脱ぎ",
        "脱ぐ",
        "脱いだ"
      ],
      "optionsVi": [
        "脱が なく (nakutemo ii desu)",
        "Masu",
        "Jisho",
        "Ta"
      ],
      "correctIndex": 0,
      "explanation": "Cấu trúc V-なくてもいい: 脱ぐ → 脱がない → 脱がなくてもいい."
    }
  },
  {
    "id": "n5-17-made-ni",
    "lessonId": "minna-17",
    "lessonNumber": 17,
    "lessonTitle": "Bài 17: Thể Nai & Nghĩa vụ bắt buộc",
    "curriculum": "MINNA",
    "grammarPoint": "N(thời gian) までに V (Hạn chót)",
    "reading": "までに",
    "romaji": "made ni (deadline)",
    "level": "N5",
    "category": "time",
    "meaningVi": "Muộn nhất trước thời điểm... phải hoàn thành V (Hạn chót)",
    "structure": "Thời gian / Ngày tháng + までに + V",
    "formality": "Lịch sự",
    "nuance": "Khác với「まで」(chỉ hành động liên tục kéo dài tới mốc),「までに」chỉ hạn chót mà hành động phải xảy ra xong trước mốc thời gian đó.",
    "formationRules": [
      {
        "partOfSpeech": "Hạn chót",
        "rule": "Mốc thời gian + までに",
        "example": "金曜日までに レポートを出します"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-17-mn-1",
        "japanese": "５時までにレポートを出さなければなりません。",
        "reading": "ごじまでにれぽーとをださなければなりません。",
        "vietnamese": "Trước 5 giờ tôi phải nộp báo cáo."
      }
    ],
    "cautionNotes": [
      "まで = hành động diễn ra liên tục tới mốc (5時まで働く). までに = hành động kết thúc trước mốc (5時までに帰る)."
    ],
    "quickQuiz": {
      "question": "来週の月曜日（　）本を返してください。",
      "questionVi": "Xin hãy trả sách trước thứ Hai tuần sau.",
      "options": [
        "までに",
        "まで",
        "から",
        "に"
      ],
      "optionsVi": [
        "Hạn chót (made ni)",
        "Kéo dài liên tục (made)",
        "Từ",
        "Thời điểm"
      ],
      "correctIndex": 0,
      "explanation": "Hành động nộp/trả mang tính hạn chót trước một ngày ấn định dùng「までに」."
    }
  },

  // =========================================================================
  // BÀI 18: Thể từ điển & Năng lực khả năng
  // =========================================================================
  {
    "id": "n5-18-jishokei",
    "lessonId": "minna-18",
    "lessonNumber": 18,
    "lessonTitle": "Bài 18: Thể từ điển & Năng lực khả năng",
    "curriculum": "MINNA",
    "grammarPoint": "Cách chia Động từ thể từ điển (辞書形 - Jishokei)",
    "reading": "じしょけい",
    "romaji": "jishokei (Dictionary form)",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Quy tắc chia động từ thể từ điển (thể nguyên mẫu)",
    "structure": "Nhóm 1: Hàng [i] chuyển sang hàng [u] | Nhóm 2: Bỏ ます + る | Nhóm 3: します→する, 来ます→来る(くる)",
    "formality": "Thông dụng",
    "nuance": "Đây là thể cơ bản nhất của động từ tiếng Nhật, là dạng xuất hiện trong từ điển tra cứu và là dạng khẳng định thể thông thường.",
    "formationRules": [
      {
        "partOfSpeech": "Nhóm 1",
        "rule": "Hàng [i] → Hàng [u]",
        "example": "書きます→書く、行きます→行く、読みます→読む"
      },
      {
        "partOfSpeech": "Nhóm 2",
        "rule": "Bỏ ます + る",
        "example": "食べます→食べる、見ます→見る"
      },
      {
        "partOfSpeech": "Nhóm 3",
        "rule": "Đặc biệt",
        "example": "する、来る(くる)"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-18-jk-1",
        "japanese": "毎日日本語を勉強する。",
        "reading": "まいにちにほんごをべんきょうする。",
        "vietnamese": "Hàng ngày tôi học tiếng Nhật."
      }
    ],
    "quickQuiz": {
      "question": "「泳ぎます」の辞書形は何ですか。",
      "questionVi": "Thể từ điển của động từ「泳ぎます」(bơi) là gì?",
      "options": [
        "泳ぐ",
        "泳げる",
        "泳がる",
        "泳ぎる"
      ],
      "optionsVi": [
        "泳ぐ (hàng i chuyển thành hàng u: ぎ → ぐ)",
        "Thể khả năng",
        "Sai",
        "Sai"
      ],
      "correctIndex": 0,
      "explanation": "Động từ nhóm 1 tận cùng là ぎ chuyển sang hàng u tương ứng là ぐ: 泳ぐ."
    }
  },
  {
    "id": "n5-18-koto-ga-dekiru",
    "lessonId": "minna-18",
    "lessonNumber": 18,
    "lessonTitle": "Bài 18: Thể từ điển & Năng lực khả năng",
    "curriculum": "MINNA",
    "grammarPoint": "V-る / N が できます (Khả năng & Năng lực)",
    "reading": "ことができます / ができます",
    "romaji": "koto ga dekiru",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Có thể làm việc gì / Biết làm...",
    "structure": "V(thể từ điển) + ことができます / Danh từ + ができます",
    "formality": "Lịch sự",
    "nuance": "Dùng「こと」để danh từ hóa động từ, biểu thị năng lực cá nhân có thể làm được việc gì đó hoặc điều kiện môi trường cho phép làm.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-る + ことができます",
        "example": "日本語を 話す ことができます"
      },
      {
        "partOfSpeech": "Danh từ",
        "rule": "N + が できます",
        "example": "運転 が できます (Biết lái xe)"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-18-kgd-1",
        "japanese": "私はピアノを弾くことができます。",
        "reading": "わたしはぴあのをひくことができます。",
        "vietnamese": "Tôi có thể chơi đàn piano."
      }
    ],
    "quickQuiz": {
      "question": "この病院でクレジットカードを使うこと（　）できますか。",
      "questionVi": "Ở bệnh viện này có thể dùng thẻ tín dụng được không?",
      "options": [
        "が",
        "を",
        "に",
        "は"
      ],
      "optionsVi": [
        "Trợ từ khả năng (ga)",
        "Tân ngữ",
        "Cho",
        "Chủ đề"
      ],
      "correctIndex": 0,
      "explanation": "Cấu trúc năng lực khả năng: V-ることができます."
    }
  },
  {
    "id": "n5-18-shumi-wa",
    "lessonId": "minna-18",
    "lessonNumber": 18,
    "lessonTitle": "Bài 18: Thể từ điển & Năng lực khả năng",
    "curriculum": "MINNA",
    "grammarPoint": "趣味は [V-る こと / N] です (Sở thích)",
    "reading": "しゅみは〜ことです",
    "romaji": "shumi wa ~ koto desu",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Sở thích của tôi là việc...",
    "structure": "私の趣味は [V(thể từ điển) こと / Danh từ] です",
    "formality": "Lịch sự",
    "nuance": "Để diễn tả sở thích là một hành động, ta bắt buộc phải thêm「こと」vào sau thể từ điển để biến nó thành cụm danh từ tương thích với「です」.",
    "formationRules": [
      {
        "partOfSpeech": "Sở thích",
        "rule": "趣味は + V-る + ことです",
        "example": "趣味は 映画を見ることです"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-18-sw-1",
        "japanese": "私の趣味は外国の切手を集めることです。",
        "reading": "わたしのしゅみはがいこくのきってをあつめることです。",
        "vietnamese": "Sở thích của tôi là sưu tầm tem thư nước ngoài."
      }
    ],
    "quickQuiz": {
      "question": "趣味は音楽を（　）ことです。",
      "questionVi": "Sở thích của tôi là nghe nhạc.",
      "options": [
        "聴く",
        "聴きます",
        "聴いて",
        "聴いた"
      ],
      "optionsVi": [
        "V-thể từ điển (chuẩn xác)",
        "Thể Masu",
        "Thể Te",
        "Thể Ta"
      ],
      "correctIndex": 0,
      "explanation": "Trước「こと」bắt buộc là động từ thể từ điển (Jishokei): 聴くこと."
    }
  },
  {
    "id": "n5-18-mae-ni",
    "lessonId": "minna-18",
    "lessonNumber": 18,
    "lessonTitle": "Bài 18: Thể từ điển & Năng lực khả năng",
    "curriculum": "MINNA",
    "grammarPoint": "[V1-る / Nの / Thời gian] まえに、V2 (Trước khi làm gì)",
    "reading": "まえに",
    "romaji": "mae ni (before)",
    "level": "N5",
    "category": "time",
    "meaningVi": "Trước khi làm V1 / Trước sự kiện N thì làm V2",
    "structure": "V1(thể từ điển) / N の / Khoảng thời gian + まえに、V2",
    "formality": "Lịch sự",
    "nuance": "Bất kể hành động đã diễn ra trong quá khứ hay chưa, động từ đi trước「まえに」luôn luôn ở thể từ điển (V-る).",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-る + まえに",
        "example": "寝る まえに 本を読みます"
      },
      {
        "partOfSpeech": "Danh từ",
        "rule": "N + の + まえに",
        "example": "食事 の まえに 手を洗います"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-18-mn-1",
        "japanese": "日本へ来るまえに、日本語を少し勉強しました。",
        "reading": "にほんへくるまえに、にほんごをすこしべんきょうしました。",
        "vietnamese": "Trước khi đến Nhật, tôi đã học một chút tiếng Nhật."
      }
    ],
    "cautionNotes": [
      "Dù câu ở thì quá khứ (ました), động từ trước まえに VẪN là thể từ điển (来るまえに, KHÔNG được nói 来たまえに)."
    ],
    "quickQuiz": {
      "question": "ご飯を（　）まえに、手を洗います。",
      "questionVi": "Trước khi ăn cơm tôi rửa tay.",
      "options": [
        "食べる",
        "食べた",
        "食べます",
        "食べて"
      ],
      "optionsVi": [
        "V-る (thể từ điển luôn đi trước mae ni)",
        "Thể Ta (sai lầm phổ biến)",
        "Thể Masu",
        "Thể Te"
      ],
      "correctIndex": 0,
      "explanation": "Quy tắc vàng: Trước「まえに」luôn chia thể từ điển V-る: 食べるまえに."
    }
  },

  // =========================================================================
  // BÀI 19: Thể Ta, Kinh nghiệm & Liệt kê hành động
  // =========================================================================
  {
    "id": "n5-19-ta-form",
    "lessonId": "minna-19",
    "lessonNumber": 19,
    "lessonTitle": "Bài 19: Thể Ta, Kinh nghiệm & Liệt kê hành động",
    "curriculum": "MINNA",
    "grammarPoint": "Cách chia Động từ thể た (V-た - Quá khứ ngắn)",
    "reading": "たけい",
    "romaji": "ta-kei (Ta form)",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Quy tắc chia thể Ta (quá khứ ngắn) của động từ",
    "structure": "Quy tắc tương tự thể Te: thay て/で bằng た/だ (Ví dụ: 書いて→書いた、飲んで→飲んだ、食べて→食べた)",
    "formality": "Thông dụng",
    "nuance": "Cách chia thể Ta hoàn toàn tương ứng 1:1 với thể Te, chỉ cần thay đuôi「て」thành「た」và đuôi「で」thành「だ」.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-て → V-た / V-で → V-だ",
        "example": "行った、読んだ、食べた、した、来た"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-19-tf-1",
        "japanese": "きのう友達と映画を見た。",
        "reading": "きのうともだちとえいがをみた。",
        "vietnamese": "Hôm qua tôi đã xem phim với bạn."
      }
    ],
    "quickQuiz": {
      "question": "「飲みます」のた形は何ですか。",
      "questionVi": "Thể Ta của động từ「飲みます」(uống) là gì?",
      "options": [
        "飲んだ",
        "飲った",
        "飲いた",
        "飲した"
      ],
      "optionsVi": [
        "飲んだ (nhóm 1 tận cùng み thành んだ)",
        "Sai",
        "Sai",
        "Sai"
      ],
      "correctIndex": 0,
      "explanation": "Thể Te là 飲んで thì thể Ta tương ứng là「飲んだ」."
    }
  },
  {
    "id": "n5-19-ta-koto-ga-aru",
    "lessonId": "minna-19",
    "lessonNumber": 19,
    "lessonTitle": "Bài 19: Thể Ta, Kinh nghiệm & Liệt kê hành động",
    "curriculum": "MINNA",
    "grammarPoint": "V-た ことがあります (Đã từng trải nghiệm)",
    "reading": "たことがあります",
    "romaji": "ta koto ga aru",
    "level": "N5",
    "category": "time",
    "meaningVi": "Đã từng làm việc gì đó trong đời (Kinh nghiệm cá nhân)",
    "structure": "V-た + ことがあります (Phủ định: 一度もありません / ありません)",
    "formality": "Lịch sự",
    "nuance": "Dùng để diễn tả trải nghiệm trong quá khứ mà người nói từng có ít nhất một lần. Khác với quá khứ thông thường (〜ました) chỉ một hành động đã diễn ra.",
    "formationRules": [
      {
        "partOfSpeech": "Kinh nghiệm",
        "rule": "V-た + ことがあります",
        "example": "富士山に 登ったことがあります"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-19-tka-1",
        "japanese": "日本料理を食べたことがありますか。……はい、一度あります。",
        "reading": "にほんりょうりをたべたことがありますか。はい、いちどあります。",
        "vietnamese": "Bạn đã từng ăn món ăn Nhật Bản bao giờ chưa? ……Vâng, tôi từng ăn một lần."
      }
    ],
    "quickQuiz": {
      "question": "歌舞伎を（　）ことがありますか。……いいえ、一度もありません。",
      "questionVi": "Bạn đã từng xem kịch Kabuki bao giờ chưa? ……Chưa, chưa từng một lần nào.",
      "options": [
        "見た",
        "見る",
        "見ます",
        "見て"
      ],
      "optionsVi": [
        "V-ta (chuẩn cấu trúc kinh nghiệm)",
        "Thể từ điển",
        "Thể Masu",
        "Thể Te"
      ],
      "correctIndex": 0,
      "explanation": "Cấu trúc kinh nghiệm từng trải: V-たことがあります: 見たことがあります."
    }
  },
  {
    "id": "n5-19-tari-tari",
    "lessonId": "minna-19",
    "lessonNumber": 19,
    "lessonTitle": "Bài 19: Thể Ta, Kinh nghiệm & Liệt kê hành động",
    "curriculum": "MINNA",
    "grammarPoint": "V1-たり、V2-たり します (Liệt kê hành động tiêu biểu)",
    "reading": "たり〜たりします",
    "romaji": "tari ~ tari shimasu",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Lúc thì làm việc A, lúc thì làm việc B... (trong số nhiều việc)",
    "structure": "V1-たり、V2-たり します / しました",
    "formality": "Lịch sự",
    "nuance": "Khác với thể Te「V1-て、V2-て」bắt buộc theo trình tự thời gian, cấu trúc「〜たり〜たり」chỉ chọn ra 2-3 hành động tiêu biểu bất kỳ không phân biệt trước sau.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-た + り",
        "example": "買い物したり、映画を見たりします"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-19-tt-1",
        "japanese": "休みの日は部屋を掃除したり、洗濯したりします。",
        "reading": "やすみのひはへやをそうじしたり、せんたくしたりします。",
        "vietnamese": "Vào ngày nghỉ, tôi lúc thì dọn dẹp phòng, lúc thì giặt giũ quần áo."
      }
    ],
    "quickQuiz": {
      "question": "日曜日、本を（　）り、散歩をしたりしました。",
      "questionVi": "Chủ Nhật tôi lúc thì đọc sách, lúc thì đi dạo.",
      "options": [
        "読んだ",
        "読む",
        "読み",
        "読んで"
      ],
      "optionsVi": [
        "V-ta (thể Ta + ri = 読んだり)",
        "Thể từ điển",
        "Thể Masu",
        "Thể Te"
      ],
      "correctIndex": 0,
      "explanation": "Cấu trúc V-たり: Động từ chia thể Ta rồi thêm り: 読んだり."
    }
  },
  {
    "id": "n5-19-narimasu",
    "lessonId": "minna-19",
    "lessonNumber": 19,
    "lessonTitle": "Bài 19: Thể Ta, Kinh nghiệm & Liệt kê hành động",
    "curriculum": "MINNA",
    "grammarPoint": "[A-く / Na-に / N-に] なります (Biến đổi trạng thái)",
    "reading": "くなります / になります",
    "romaji": "ku narimasu / ni narimasu",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Trở nên / Trở thành... (Thay đổi trạng thái)",
    "structure": "A-い: Bỏ [い] + くなります | Na / N: + になります",
    "formality": "Lịch sự",
    "nuance": "Biểu thị sự biến đổi từ một trạng thái này sang một trạng thái khác theo thời gian.",
    "formationRules": [
      {
        "partOfSpeech": "Tính từ い",
        "rule": "Bỏ [い] + くなります",
        "example": "寒くなります (trở nên lạnh)"
      },
      {
        "partOfSpeech": "Tính từ な / N",
        "rule": "Từ + になります",
        "example": "元気になります、先生になります"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-19-nm-1",
        "japanese": "春になりました。だんだん暖かくなります。",
        "reading": "はるになりました。だんだんあたたかくなります。",
        "vietnamese": "Đã sang mùa xuân rồi. Trời dần dần trở nên ấm áp."
      }
    ],
    "quickQuiz": {
      "question": "将来医者（　）なりたいです。",
      "questionVi": "Trong tương lai tôi muốn trở thành bác sĩ.",
      "options": [
        "に",
        "を",
        "が",
        "で"
      ],
      "optionsVi": [
        "Danh từ + に なります (chuẩn xác)",
        "Tân ngữ",
        "Chủ ngữ",
        "Bằng"
      ],
      "correctIndex": 0,
      "explanation": "Danh từ kết hợp với なります dùng trợ từ「に」: 医者になります."
    }
  },

  // =========================================================================
  // BÀI 20: Thể thông thường (Thể ngắn / 普通形)
  // =========================================================================
  {
    "id": "n5-20-futsukei",
    "lessonId": "minna-20",
    "lessonNumber": 20,
    "lessonTitle": "Bài 20: Thể thông thường (Thể ngắn / 普通形)",
    "curriculum": "MINNA",
    "grammarPoint": "Tổng quan Thể thông thường (普通形 - Futsukei)",
    "reading": "ふつうけい",
    "romaji": "futsukei (Plain form)",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Hệ thống thể thông thường đối ứng với thể lịch sự (丁寧形)",
    "structure": "Động từ: V-る / V-ない / V-た / V-なかった | Tính từ い: A-い / A-くない / A-かった / A-くなかった | Tính từ な/Danh từ: だ / ではない / だった / ではなかった",
    "formality": "Thông thường",
    "nuance": "Dùng khi trò chuyện với bạn bè thân thiết, người dưới hoặc trong gia đình. Đây cũng là thành phần cốt lõi để tạo nên các mệnh đề phụ trong tiếng Nhật.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "書く、書かない、書いた、書かなかった",
        "example": "書く"
      },
      {
        "partOfSpeech": "Tính từ い",
        "rule": "高い、高くない、高かった、高くなかった",
        "example": "高い"
      },
      {
        "partOfSpeech": "Na / N",
        "rule": "暇だ、暇じゃない、暇だった、暇じゃなかった",
        "example": "暇だ"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-20-f-1",
        "japanese": "明日東京へ行く？……うん、行くよ。",
        "reading": "あしたとうきょうへいく？……うん、いくよ。",
        "vietnamese": "Ngày mai bạn đi Tokyo không? ……Ừ, có đi chứ."
      }
    ],
    "quickQuiz": {
      "question": "「食べませんでした」の普通形は何ですか。",
      "questionVi": "Thể thông thường của「食べませんでした」(đã không ăn) là gì?",
      "options": [
        "食べなかった",
        "食べない",
        "食べた",
        "食べなかったです"
      ],
      "optionsVi": [
        "Quá khứ phủ định thể ngắn (chuẩn xác)",
        "Hiện tại phủ định",
        "Quá khứ khẳng định",
        "Vẫn còn desu"
      ],
      "correctIndex": 0,
      "explanation": "Phủ định quá khứ thể thông thường: 食べない → 食べなかった."
    }
  },
  {
    "id": "n5-20-futsukei-kaiwa",
    "lessonId": "minna-20",
    "lessonNumber": 20,
    "lessonTitle": "Bài 20: Thể thông thường (Thể ngắn / 普通形)",
    "curriculum": "MINNA",
    "grammarPoint": "Hội thoại thể thông thường trong giao tiếp hàng ngày",
    "reading": "かいわのふつうけい",
    "romaji": "kaiwa no futsukei",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Quy tắc đàm thoại thể ngắn: Bỏ か khi hỏi, lược bỏ trợ từ, dùng うん/ううん",
    "structure": "Câu hỏi: Lên giọng cuối câu (bỏ か). Trả lời: うん (có) / ううん (không). Tính từ な/N lược bỏ だ ở cuối câu hỏi.",
    "formality": "Thân mật",
    "nuance": "Trong hội thoại tự nhiên của người Nhật, trợ từ は, を, が thường được lược bỏ nếu ngữ cảnh đã rõ ràng.",
    "formationRules": [
      {
        "partOfSpeech": "Câu hỏi",
        "rule": "Bỏ か, lên giọng",
        "example": "ご飯食べる？ (Có ăn cơm không?)"
      },
      {
        "partOfSpeech": "Đồng ý / Từ chối",
        "rule": "うん (Ừ) / ううん (Không)",
        "example": "うん、食べる"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-20-k-1",
        "japanese": "今時間ある？……ううん、ない。今から出かける。",
        "reading": "いまじかんある？……ううん、ない。いまからでかける。",
        "vietnamese": "Bây giờ có rảnh không? ……Không, không rảnh. Bây giờ tớ phải đi ra ngoài."
      }
    ],
    "quickQuiz": {
      "question": "ビール飲む？……ううん、（　）。",
      "questionVi": "Uống bia không? ……Không, mình không uống.",
      "options": [
        "飲まない",
        "飲む",
        "飲んだ",
        "飲みません"
      ],
      "optionsVi": [
        "Thể ngắn phủ định phù hợp với ううん",
        "Khẳng định",
        "Quá khứ",
        "Thể lịch sự"
      ],
      "correctIndex": 0,
      "explanation": "Trả lời「ううん」(không) trong thể ngắn thân mật đi với「飲まない」."
    }
  },

  // =========================================================================
  // BÀI 21: Bày tỏ ý kiến cá nhân & Trích dẫn
  // =========================================================================
  {
    "id": "n5-21-to-omou",
    "lessonId": "minna-21",
    "lessonNumber": 21,
    "lessonTitle": "Bài 21: Bày tỏ ý kiến cá nhân & Trích dẫn",
    "curriculum": "MINNA",
    "grammarPoint": "Thể thông thường + と思います (Tôi nghĩ rằng...)",
    "reading": "とおもいます",
    "romaji": "to omoimasu",
    "level": "N5",
    "category": "judgment",
    "meaningVi": "Tôi nghĩ rằng... / Theo tôi thì... (Bày tỏ ý kiến, phỏng đoán)",
    "structure": "Thể thông thường (Futsukei) + と思います",
    "formality": "Lịch sự",
    "nuance": "Dùng để bày tỏ quan điểm cá nhân hoặc phỏng đoán một sự việc chưa chắc chắn 100%. Đứng trước trợ từ「と」bắt buộc phải là thể thông thường.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-thông thường + と思います",
        "example": "明日は 雨が 降る と思います"
      },
      {
        "partOfSpeech": "Tính từ い",
        "rule": "A-い + と思います",
        "example": "日本は 物価が 高い と思います"
      },
      {
        "partOfSpeech": "Na / N",
        "rule": "Na/N + だ + と思います",
        "example": "ミラーさんは 親切 だ と思います"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-21-to-1",
        "japanese": "明日はいい天気になると思います。",
        "reading": "あしたはいいてんきになるとおもいます。",
        "vietnamese": "Tôi nghĩ rằng ngày mai thời tiết sẽ trở nên đẹp trời."
      }
    ],
    "cautionNotes": [
      "Với tính từ đuôi な và danh từ, phải có だ trước と思います (きれいだ と思います, 休みだ と思います)."
    ],
    "quickQuiz": {
      "question": "日本についてどう思いますか。……交通が便利（　）思います。",
      "questionVi": "Bạn nghĩ thế nào về Nhật Bản? ……Tôi nghĩ giao thông tiện lợi.",
      "options": [
        "だと",
        "と",
        "なと",
        "でと"
      ],
      "optionsVi": [
        "Tính từ な kết hợp だ と (chuẩn xác)",
        "Thiếu だ",
        "Sai",
        "Sai"
      ],
      "correctIndex": 0,
      "explanation": "Tính từ đuôi な「便利」ở thể thông thường trước と思います phải là「便利だ」: 便利だと思います."
    }
  },
  {
    "id": "n5-21-to-itta",
    "lessonId": "minna-21",
    "lessonNumber": 21,
    "lessonTitle": "Bài 21: Bày tỏ ý kiến cá nhân & Trích dẫn",
    "curriculum": "MINNA",
    "grammarPoint": "「Câu」/ Thể thông thường + と言いました (Trích dẫn lời nói)",
    "reading": "といいました",
    "romaji": "to iimashita",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Nói rằng... (Trích dẫn trực tiếp hoặc gián tiếp)",
    "structure": "Trích dẫn trực tiếp: 「Nguyên văn」と言いました | Trích dẫn gián tiếp: Thể thông thường + と言いました",
    "formality": "Lịch sự",
    "nuance": "Truyền đạt lại lời người khác đã nói. Nếu dùng ngoặc kép「」thì giữ nguyên thể lịch sự của người nói, nếu là gián tiếp thì phải chuyển về thể thông thường.",
    "formationRules": [
      {
        "partOfSpeech": "Trực tiếp",
        "rule": "「...」と言いました",
        "example": "田中さんは「疲れました」と言いました"
      },
      {
        "partOfSpeech": "Gián tiếp",
        "rule": "Thể thông thường + と言いました",
        "example": "田中さんは 疲れた と言いました"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-21-ti-1",
        "japanese": "ミラーさんは来週東京へ出張すると言いました。",
        "reading": "みらーさんはらいしゅうとうきょうへしゅっちょうするといいました。",
        "vietnamese": "Anh Miller nói rằng tuần sau anh ấy sẽ đi công tác Tokyo."
      }
    ],
    "quickQuiz": {
      "question": "山田さんは明日（　）と言いました。",
      "questionVi": "Anh Yamada nói rằng ngày mai anh ấy sẽ không đến.",
      "options": [
        "来ない",
        "来ません",
        "来ないだ",
        "来ないで"
      ],
      "optionsVi": [
        "Thể thông thường phủ định của 来ます (chuẩn xác)",
        "Thể lịch sự (cần dấu ngoặc)",
        "Sai ngữ pháp",
        "Thể Te"
      ],
      "correctIndex": 0,
      "explanation": "Trích dẫn gián tiếp dùng thể thông thường: 来ます → 来ない: 来ないと言いました."
    }
  },
  {
    "id": "n5-21-deshou",
    "lessonId": "minna-21",
    "lessonNumber": 21,
    "lessonTitle": "Bài 21: Bày tỏ ý kiến cá nhân & Trích dẫn",
    "curriculum": "MINNA",
    "grammarPoint": "Thể thông thường + でしょう？ (Có đúng không? - Kỳ vọng đồng thuận)",
    "reading": "でしょう",
    "romaji": "deshou (rising intonation)",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Có phải không? / ... đúng không nào? (Lên giọng ở cuối)",
    "structure": "Thể thông thường + でしょう？ (Chú ý: Tính từ な / Danh từ bỏ だ)",
    "formality": "Lịch sự",
    "nuance": "Người nói tin tưởng rằng người nghe cũng đồng ý kiến với mình và nói với ngữ điệu lên giọng để tìm kiếm sự xác nhận, đồng cảm.",
    "formationRules": [
      {
        "partOfSpeech": "Thông thường",
        "rule": "V-thể thường / A-い / Na bỏ だ / N bỏ だ + でしょう",
        "example": "北海道は 寒かったでしょう"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-21-ds-1",
        "japanese": "明日はパーティーに行くでしょう？……ええ、行きますよ。",
        "reading": "あしたはぱーてぃーにいくでしょう？……ええ、いきますよ。",
        "vietnamese": "Ngày mai bạn đi dự tiệc đúng không nào? ……Vâng, tớ có đi chứ."
      }
    ],
    "quickQuiz": {
      "question": "昨日の試験は（　）でしょう？……ええ、難しかったです。",
      "questionVi": "Kỳ thi hôm qua khó đúng không nào? ……Vâng, khó lắm.",
      "options": [
        "難しかった",
        "難しい",
        "難しかったです",
        "難しいでした"
      ],
      "optionsVi": [
        "Quá khứ thể ngắn (chuẩn xác)",
        "Hiện tại",
        "Dư desu",
        "Sai ngữ pháp"
      ],
      "correctIndex": 0,
      "explanation": "Hành động xảy ra hôm qua (昨日の試験), tính từ đuôi い ở dạng quá khứ thể ngắn: 難しかったでしょう."
    }
  },

  // =========================================================================
  // BÀI 22: Mệnh đề định ngữ bổ nghĩa cho Danh từ
  // =========================================================================
  {
    "id": "n5-22-meishi-shushoku",
    "lessonId": "minna-22",
    "lessonNumber": 22,
    "lessonTitle": "Bài 22: Mệnh đề định ngữ bổ nghĩa cho Danh từ",
    "curriculum": "MINNA",
    "grammarPoint": "Mệnh đề định ngữ (Thể thông thường + Danh từ)",
    "reading": "めいししゅうしょく",
    "romaji": "meishi shuushoku (relative clause)",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Người mà... / Cái mà... (Dùng cả một câu để bổ nghĩa cho danh từ)",
    "structure": "[Mệnh đề bổ nghĩa chia thể thông thường (Futsukei)] + Danh từ",
    "formality": "Lịch sự / Thông dụng",
    "nuance": "Trong tiếng Nhật, mệnh đề bổ nghĩa luôn luôn đứng TRƯỚC danh từ (ngược hoàn toàn với tiếng Việt). Chủ ngữ trong mệnh đề bổ nghĩa đi với trợ từ「が」.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-thông thường + Danh từ",
        "example": "私が昨日 買った 本 (Quyển sách mà hôm qua tôi mua)"
      },
      {
        "partOfSpeech": "Na / N",
        "rule": "Na + な + N / N + の + N",
        "example": "親切な人、IMCの社員"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-22-ms-1",
        "japanese": "これは私が昨日撮った写真です。",
        "reading": "これはわたしがきのうとったしゃしんです。",
        "vietnamese": "Đây là bức ảnh mà hôm qua tôi đã chụp."
      }
    ],
    "cautionNotes": [
      "Chủ ngữ trong mệnh đề định ngữ bắt buộc dùng が (私が作った料理, KHÔNG dùng 私は)."
    ],
    "quickQuiz": {
      "question": "あそこで新聞を（　）人は山田さんです。",
      "questionVi": "Người đang đọc báo ở đằng kia là anh Yamada.",
      "options": [
        "読んでいる",
        "読みます",
        "読んで",
        "読んだでした"
      ],
      "optionsVi": [
        "V-te iru thể ngắn bổ nghĩa cho 人 (chuẩn xác)",
        "Thể Masu",
        "Thể Te",
        "Sai ngữ pháp"
      ],
      "correctIndex": 0,
      "explanation": "Mệnh đề bổ nghĩa cho danh từ「人」(người) phải chia thể thông thường: 読んでいる人."
    }
  },
  {
    "id": "n5-22-meishi-shushoku-wa",
    "lessonId": "minna-22",
    "lessonNumber": 22,
    "lessonTitle": "Bài 22: Mệnh đề định ngữ bổ nghĩa cho Danh từ",
    "curriculum": "MINNA",
    "grammarPoint": "[Mệnh đề + N] は ... です",
    "reading": "めいししゅうしょくのぶん",
    "romaji": "[Clause + N] wa ... desu",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Cái [mà...] thì... (Mệnh đề định ngữ làm chủ ngữ chính của câu)",
    "structure": "[Mệnh đề định ngữ + N] は [Vị ngữ] です",
    "formality": "Lịch sự",
    "nuance": "Khi danh từ được bổ nghĩa làm chủ ngữ của câu lớn, toàn bộ cụm danh từ đó đi với trợ từ「は」.",
    "formationRules": [
      {
        "partOfSpeech": "Cấu trúc câu",
        "rule": "[Mệnh đề + N] は + Vị ngữ",
        "example": "私が生まれた町は 小さい町です"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-22-mw-1",
        "japanese": "母が作った料理はとてもおいしいです。",
        "reading": "ははがつくりょうりはとてもおいしいです。",
        "vietnamese": "Món ăn do mẹ tôi nấu rất là ngon."
      }
    ],
    "quickQuiz": {
      "question": "ミラーさんが（　）会社はどこですか。",
      "questionVi": "Công ty mà anh Miller đang làm việc là ở đâu vậy?",
      "options": [
        "働いている",
        "働きます",
        "働いて",
        "働くでした"
      ],
      "optionsVi": [
        "V-te iru thể thông thường bổ nghĩa 会社",
        "Thể Masu",
        "Thể Te",
        "Sai"
      ],
      "correctIndex": 0,
      "explanation": "Bổ nghĩa cho danh từ「会社」(công ty) dùng thể ngắn: 働いている会社."
    }
  },
  {
    "id": "n5-22-jikan-yakusoku",
    "lessonId": "minna-22",
    "lessonNumber": 22,
    "lessonTitle": "Bài 22: Mệnh đề định ngữ bổ nghĩa cho Danh từ",
    "curriculum": "MINNA",
    "grammarPoint": "[V-る / V-ない] 時間 / 約束 / 用事",
    "reading": "じかん / やくそく / ようじ",
    "romaji": "jikan / yakusoku / youji",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Thời gian làm gì / Cuộc hẹn làm gì / Việc bận làm gì",
    "structure": "V(thể từ điển / thể Nai) + 時間 / 約束 / 用事 が あります / ありません",
    "formality": "Lịch sự",
    "nuance": "Động từ thể từ điển đi liền trước các danh từ 時間 (thời gian), 約束 (hẹn), 用事 (việc bận) để diễn giải nội dung của cuộc hẹn hay công việc đó.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ hóa",
        "rule": "V-る + 時間/約束/用事",
        "example": "本を読む時間、友達と会う約束"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-22-jy-1",
        "japanese": "朝ご飯を食べる時間がありませんでしたから、お腹が空きました。",
        "reading": "あさごはんをたべるじかんがありませんでしたから、おなかがすきました。",
        "vietnamese": "Vì tôi không có thời gian ăn sáng nên bụng đói meo rồi."
      }
    ],
    "quickQuiz": {
      "question": "今晩友達とご飯を（　）約束があります。",
      "questionVi": "Tối nay tôi có hẹn đi ăn cơm với bạn.",
      "options": [
        "食べる",
        "食べた",
        "食べます",
        "食べて"
      ],
      "optionsVi": [
        "V-る (thể từ điển bổ nghĩa cho 約束)",
        "Thể Ta",
        "Thể Masu",
        "Thể Te"
      ],
      "correctIndex": 0,
      "explanation": "Trước danh từ 約束 (hẹn) dùng thể từ điển V-る: 食べる約束."
    }
  },

  // =========================================================================
  // BÀI 23: Thời điểm & Điều kiện tự nhiên với Toki/To
  // =========================================================================
  {
    "id": "n5-23-toki",
    "lessonId": "minna-23",
    "lessonNumber": 23,
    "lessonTitle": "Bài 23: Thời điểm & Điều kiện tự nhiên với Toki/To",
    "curriculum": "MINNA",
    "grammarPoint": "[V-る / V-た / V-ない / A-い / Na-な / Nの] とき、...",
    "reading": "とき",
    "romaji": "toki (when)",
    "level": "N5",
    "category": "time",
    "meaningVi": "Khi... / Vào lúc...",
    "structure": "V-る / V-た / V-ない / A-い + とき | Na + な + とき | N + の + とき",
    "formality": "Lịch sự",
    "nuance": "Chỉ thời điểm xảy ra sự việc. Phân biệt V-るとき (hành động chưa xong, lúc chuẩn bị làm) và V-たとき (hành động đã hoàn tất xong rồi).",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-る とき (trước khi) / V-た とき (sau khi)",
        "example": "出かけるとき、着いたとき"
      },
      {
        "partOfSpeech": "Na / N",
        "rule": "Na な とき / N の とき",
        "example": "暇なとき、子供のとき"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-23-tk-1",
        "japanese": "時間があるとき、映画を見たり音楽を聴いたりします。",
        "reading": "じかんがあるとき、えいがをみたりおんがくをきいたりします。",
        "vietnamese": "Khi có thời gian rảnh, tôi lúc thì xem phim, lúc thì nghe nhạc."
      },
      {
        "id": "ex-n5-23-tk-2",
        "japanese": "子供のとき、よく川で泳ぎました。",
        "reading": "こどものとき、よくかわでおよぎました。",
        "vietnamese": "Hồi còn nhỏ, tôi thường hay bơi ở sông."
      }
    ],
    "cautionNotes": [
      "Danh từ kết hợp với とき phải có の: 子供のとき (KHÔNG nói 子供とき)."
    ],
    "quickQuiz": {
      "question": "暇（　）とき、何をしますか。……本を読みます。",
      "questionVi": "Khi rảnh rỗi bạn làm gì? ……Tôi đọc sách.",
      "options": [
        "な",
        "の",
        "だ",
        "に"
      ],
      "optionsVi": [
        "Tính từ な nối với とき dùng な (chuẩn xác)",
        "Dành cho danh từ",
        "Sai",
        "Sai"
      ],
      "correctIndex": 0,
      "explanation": "Tính từ đuôi な「暇」(rảnh rỗi) kết hợp với とき phải có「な」: 暇なとき."
    }
  },
  {
    "id": "n5-23-to-shizen",
    "lessonId": "minna-23",
    "lessonNumber": 23,
    "lessonTitle": "Bài 23: Thời điểm & Điều kiện tự nhiên với Toki/To",
    "curriculum": "MINNA",
    "grammarPoint": "V-る と、... (Hệ quả tất yếu, tự nhiên)",
    "reading": "と",
    "romaji": "to (natural condition)",
    "level": "N5",
    "category": "condition",
    "meaningVi": "Hễ cứ làm... thì ắt sẽ... (Hệ quả tất yếu của máy móc/tự nhiên)",
    "structure": "V(thể từ điển) と、Mệnh đề kết quả tất yếu",
    "formality": "Lịch sự",
    "nuance": "Hễ vế 1 xảy ra thì vế 2 tự động diễn ra như một quy luật khách quan, tự nhiên hoặc cơ chế vận hành máy móc. Vế sau KHÔNG được dùng ý chí, rủ rê hay mệnh lệnh.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-る + と",
        "example": "このボタンを押すと、切符が出ます"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-23-ts-1",
        "japanese": "この交差点を右へ曲がると、左に郵便局があります。",
        "reading": "このこうさてんをみぎへまがると、ひだりにゆうびんきょくがあります。",
        "vietnamese": "Hễ rẽ phải ở ngã tư này thì sẽ thấy bưu điện ở bên tay trái."
      }
    ],
    "quickQuiz": {
      "question": "このつまみを右へ回す（　）、音が大きくなります。",
      "questionVi": "Hễ vặn núm xoay này về bên phải thì âm thanh sẽ to lên.",
      "options": [
        "と",
        "から",
        "ので",
        "なら"
      ],
      "optionsVi": [
        "Hệ quả tất yếu của cơ chế máy (to)",
        "Vì",
        "Vì",
        "Nếu"
      ],
      "correctIndex": 0,
      "explanation": "Cơ chế vận hành máy móc tất yếu xảy ra dùng liên từ「と」: 回すと."
    }
  },

  // =========================================================================
  // BÀI 24: Cho nhận hành động
  // =========================================================================
  {
    "id": "n5-24-kuremasu",
    "lessonId": "minna-24",
    "lessonNumber": 24,
    "lessonTitle": "Bài 24: Cho nhận hành động",
    "curriculum": "MINNA",
    "grammarPoint": "N(người) が (私に) V-てくれます",
    "reading": "てくれます",
    "romaji": "te kuremasu",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Ai đó làm việc gì tốt đẹp cho tôi / người thân tôi",
    "structure": "Người làm が (Người nhận [tôi] に) V-てくれます",
    "formality": "Lịch sự",
    "nuance": "Chủ ngữ là người khác làm hành động có lợi cho người nói (Tôi). Người nói cảm nhận sâu sắc sự quan tâm và lòng biết ơn.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "Người khác が 私に + V-てくれます",
        "example": "山田さんが 車で送ってくれました"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-24-km-1",
        "japanese": "佐藤さんが私に傘を貸してくれました。",
        "reading": "さとうさんがわたしにかさをかしてくれました。",
        "vietnamese": "Chị Sato đã cho tôi mượn ô."
      }
    ],
    "cautionNotes": [
      "Người nhận luôn là 私 (tôi) hoặc người trong gia đình tôi. KHÔNG dùng くれます khi chủ ngữ là chính tôi."
    ],
    "quickQuiz": {
      "question": "誕生日に友達がプレゼントを（　）ました。",
      "questionVi": "Vào ngày sinh nhật bạn tôi đã tặng quà cho tôi.",
      "options": [
        "くれ",
        "あげ",
        "もらい",
        "やり"
      ],
      "optionsVi": [
        "Người khác tặng cho tôi (kuremashita)",
        "Tôi tặng người khác",
        "Tôi nhận (chủ ngữ sai)",
        "Cho bề dưới"
      ],
      "correctIndex": 0,
      "explanation": "Chủ ngữ là bạn bè (友達が) làm điều tốt cho tôi thì dùng「くれました」."
    }
  },
  {
    "id": "n5-24-moraimasu",
    "lessonId": "minna-24",
    "lessonNumber": 24,
    "lessonTitle": "Bài 24: Cho nhận hành động",
    "curriculum": "MINNA",
    "grammarPoint": "私は N(người) に V-てもらいます",
    "reading": "てもらいます",
    "romaji": "te moraimasu",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Tôi được ai đó làm gì giúp cho (Tiếp nhận sự giúp đỡ)",
    "structure": "Tôi は Người giúp に V-てもらいます",
    "formality": "Lịch sự",
    "nuance": "Chủ ngữ là Tôi (hoặc người nhà tôi), chủ động tiếp nhận ân huệ hoặc nhờ cậy ai đó làm giúp một việc.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "私は + Người giúp + に + V-てもらいます",
        "example": "先生に 日本語を 直してもらいました"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-24-mm-1",
        "japanese": "私は鈴木さんに駅まで送ってもらいました。",
        "reading": "わたしはすずきさんにえきまでおくってもらいました。",
        "vietnamese": "Tôi đã được anh Suzuki chở đến tận nhà ga."
      }
    ],
    "quickQuiz": {
      "question": "私は先生（　）日本語の発音を直してもらいました。",
      "questionVi": "Tôi đã được thầy giáo sửa giúp phát âm tiếng Nhật.",
      "options": [
        "に",
        "を",
        "で",
        "へ"
      ],
      "optionsVi": [
        "Người thực hiện giúp đỡ (ni)",
        "Tân ngữ",
        "Bằng",
        "Hướng"
      ],
      "correctIndex": 0,
      "explanation": "Trong cấu trúc「〜てもらいます」, người làm giúp đỡ đi với trợ từ「に」."
    }
  },
  {
    "id": "n5-24-agemasu",
    "lessonId": "minna-24",
    "lessonNumber": 24,
    "lessonTitle": "Bài 24: Cho nhận hành động",
    "curriculum": "MINNA",
    "grammarPoint": "私は N(người) に V-てあげます",
    "reading": "てあげます",
    "romaji": "te agemasu",
    "level": "N5",
    "category": "basics",
    "meaningVi": "Tôi làm việc gì đó giúp cho ai",
    "structure": "Tôi は Đối phương に V-てあげます",
    "formality": "Lịch sự",
    "nuance": "Người nói làm một hành động có lợi cho người khác. Trong giao tiếp trực tiếp với người lớn tuổi/người lạ thì nên hạn chế dùng vì dễ gây cảm giác ban ơn, kể công.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "Tôi は + Người nhận + に + V-てあげます",
        "example": "妹に 宿題を 教えてあげました"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-24-am-1",
        "japanese": "私は山田さんの荷物を持ってあげました。",
        "reading": "わたしはやまださんのにもつをもったげました。",
        "vietnamese": "Tôi đã xách hành lý giúp cho chị Yamada."
      }
    ],
    "quickQuiz": {
      "question": "弟に自転車を修理して（　）ました。",
      "questionVi": "Tôi đã sửa xe đạp giúp cho em trai.",
      "options": [
        "あげ",
        "くれ",
        "もらい",
        "いただき"
      ],
      "optionsVi": [
        "Tôi làm giúp người khác (agemashita)",
        "Người khác làm cho tôi",
        "Tôi nhận",
        "Kính ngữ nhận"
      ],
      "correctIndex": 0,
      "explanation": "Chủ ngữ (Tôi) làm việc tốt giúp em trai dùng「〜てあげました」."
    }
  },

  // =========================================================================
  // BÀI 25: Điều kiện giả định với Tara & Dù cho Temo
  // =========================================================================
  {
    "id": "n5-25-tara",
    "lessonId": "minna-25",
    "lessonNumber": 25,
    "lessonTitle": "Bài 25: Điều kiện giả định với Tara & Dù cho Temo",
    "curriculum": "MINNA",
    "grammarPoint": "V-たら / A-かったら / Na-だったら / N-だったら (Nếu / Sau khi...)",
    "reading": "たら",
    "romaji": "tara (if / when)",
    "level": "N5",
    "category": "condition",
    "meaningVi": "Nếu... thì... / Sau khi... thì sẽ...",
    "structure": "V-たら / A-かったら / Na-だったら / N-だったら、Mệnh đề 2",
    "formality": "Lịch sự",
    "nuance": "Điều kiện thông dụng nhất trong giao tiếp tiếng Nhật. Có 2 sắc thái: (1) Giả định không có thực hoặc tương lai; (2) Sau khi hành động 1 diễn ra chắc chắn thì hành động 2 mới tiếp tục.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-た + ら",
        "example": "雨が 降ったら、行きません"
      },
      {
        "partOfSpeech": "Tính từ い",
        "rule": "A-かった + ら",
        "example": "安かったら、買います"
      },
      {
        "partOfSpeech": "Na / N",
        "rule": "Từ + だったら",
        "example": "暇だったら、遊びに来てください"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-25-tr-1",
        "japanese": "お金がたくさんあったら、世界中を旅行したいです。",
        "reading": "おかねがたくさんあったら、せかいじゅうをりょこうしたいです。",
        "vietnamese": "Nếu có nhiều tiền, tôi muốn đi du lịch vòng quanh thế giới."
      },
      {
        "id": "ex-n5-25-tr-2",
        "japanese": "駅に着いたら、電話をかけてください。",
        "reading": "えきについたら、でんわをかけてください。",
        "vietnamese": "Sau khi đến ga thì hãy gọi điện thoại cho tôi nhé."
      }
    ],
    "quickQuiz": {
      "question": "仕事が（　）たら、一緒に飲みに行きましょう。",
      "questionVi": "Sau khi xong việc thì chúng ta cùng đi uống nhé.",
      "options": [
        "終わっ",
        "終わる",
        "終わり",
        "終わった"
      ],
      "optionsVi": [
        "V-た + ら = 終わったら (chuẩn xác)",
        "Thể từ điển",
        "Thể Masu",
        "Dư ta"
      ],
      "correctIndex": 0,
      "explanation": "Cấu trúc Tara: Động từ chia thể Ta rồi gắn ら: 終わった + ら = 終わったら."
    }
  },
  {
    "id": "n5-25-temo",
    "lessonId": "minna-25",
    "lessonNumber": 25,
    "lessonTitle": "Bài 25: Điều kiện giả định với Tara & Dù cho Temo",
    "curriculum": "MINNA",
    "grammarPoint": "V-ても / A-くても / Na-でも / N-でも (Dù... thì vẫn...)",
    "reading": "ても / でも",
    "romaji": "te mo / demo (even if)",
    "level": "N5",
    "category": "condition",
    "meaningVi": "Cho dù... thì vẫn... (Điều kiện nhượng bộ ngược logic)",
    "structure": "V-て / A-くて / Na-で / N-で + も、Mệnh đề 2",
    "formality": "Lịch sự",
    "nuance": "Biểu thị sự nhượng bộ trái ngược với suy nghĩ thông thường. Dù điều kiện ở vế 1 có xảy ra thì vế 2 vẫn diễn ra không thay đổi.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-て + も",
        "example": "雨が 降っても、サッカーをします"
      },
      {
        "partOfSpeech": "Tính từ い",
        "rule": "A-く + ても",
        "example": "高くても、買います"
      },
      {
        "partOfSpeech": "Na / N",
        "rule": "Từ + でも",
        "example": "日曜日でも、働きます"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-25-tm-1",
        "japanese": "雨が降っても、出かけなければなりません。",
        "reading": "あめがふっても、でかけなければなりません。",
        "vietnamese": "Cho dù trời có mưa thì tôi vẫn phải đi ra ngoài."
      }
    ],
    "quickQuiz": {
      "question": "どんなに（　）ても、最後まで諦めません。",
      "questionVi": "Dù có vất vả thế nào đi nữa, tôi cũng không bỏ cuộc cho đến cùng.",
      "options": [
        "大変で",
        "大変",
        "大変な",
        "大変だっ"
      ],
      "optionsVi": [
        "Na + で + も = 大変でも (chuẩn xác)",
        "Thiếu で",
        "Sai thể",
        "Quá khứ"
      ],
      "correctIndex": 0,
      "explanation": "Tính từ đuôi な「大変」khi kết hợp với thể nhượng bộ chuyển thành「大変でも」."
    }
  },
  {
    "id": "n5-25-moshi-ikura",
    "lessonId": "minna-25",
    "lessonNumber": 25,
    "lessonTitle": "Bài 25: Điều kiện giả định với Tara & Dù cho Temo",
    "curriculum": "MINNA",
    "grammarPoint": "もし 〜 たら / いくら 〜 ても (Phó từ nhấn mạnh)",
    "reading": "もし〜たら / いくら〜ても",
    "romaji": "moshi ~ tara / ikura ~ temo",
    "level": "N5",
    "category": "condition",
    "meaningVi": "Giả sử nếu như... / Cho dù có... bao nhiêu đi chăng nữa",
    "structure": "もし + [V-たら / Điều kiện] / いくら + [V-ても / Tính từ-ても]",
    "formality": "Lịch sự",
    "nuance": "もし nhấn mạnh giả thiết giả định ngay từ đầu câu. いくら nhấn mạnh mức độ tột cùng trong câu điều kiện nhượng bộ.",
    "formationRules": [
      {
        "partOfSpeech": "Phó từ",
        "rule": "もし + ...たら",
        "example": "もし １億円あったら"
      },
      {
        "partOfSpeech": "Phó từ",
        "rule": "いくら + ...ても",
        "example": "いくら 考えても わかりません"
      }
    ],
    "examples": [
      {
        "id": "ex-n5-25-mi-1",
        "japanese": "いくら考えても、答えがわかりません。",
        "reading": "いくらかんがえても、こたえがわかりません。",
        "vietnamese": "Cho dù có suy nghĩ bao nhiêu đi nữa, tôi vẫn không hiểu được đáp án."
      }
    ],
    "quickQuiz": {
      "question": "（　）１億円あったら、何をしたいですか。",
      "questionVi": "Nếu giả sử có 100 triệu yên thì bạn muốn làm gì?",
      "options": [
        "もし",
        "いくら",
        "とても",
        "ぜひ"
      ],
      "optionsVi": [
        "Moshi (nhấn mạnh giả thiết điều kiện nếu)",
        "Ikura (đi với temo)",
        "Rất",
        "Nhất định"
      ],
      "correctIndex": 0,
      "explanation": "Đi trước câu điều kiện「〜たら」để nhấn mạnh giả thiết dùng phó từ「もし」."
    }
  },

];
