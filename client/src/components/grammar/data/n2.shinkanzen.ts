import { GrammarMasterItem } from '../grammar.types';

// =========================================================================
// JLPT N2 COMPLETE GRAMMAR DATABASE (60 ITEMS)
// =========================================================================

export const N2_SHINKANZEN_MASTER_GRAMMAR: GrammarMasterItem[] = [
  {
    "id": "n2-zaruoenai",
    "lessonId": "skz-n2-c1",
    "lessonTitle": "Chương 1: Bắt buộc, Đành phải & Không kìm nén",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜ざるを得ない",
    "reading": "〜ざるをえない",
    "romaji": "zaru o enai",
    "level": "N2",
    "category": "Bắt buộc & Tâm lý",
    "meaningVi": "Đành phải, buộc lòng phải, không thể không...",
    "structure": "V-nai (bỏ ない) + ざるを得ない (Riêng する -> せざるを得ない)",
    "formality": "Trang trọng",
    "nuance": "Diễn tả việc dù bản thân không hề muốn làm, nhưng vì tình thế, hoàn cảnh hoặc lý do khách quan ép buộc nên đành phải làm.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "Động từ thể ない bỏ ない + ざるを得ない (V-nai - ない + ざるを得ない)",
        "example": "Động từ thể ない bỏ ない + ざるを得ない (V-nai - ない + ざるを得ない)"
      },
      {
        "partOfSpeech": "Thể thông thường",
        "rule": "Đặc biệt: する -> せざるを得ない (Không dùng しざるを得ない)",
        "example": "Đặc biệt: する -> せざるを得ない (Không dùng しざるを得ない)"
      },
      {
        "partOfSpeech": "Thể thông thường",
        "rule": "くる -> こざるを得ない",
        "example": "くる -> こざるを得ない"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-zaruoenai-1",
        "japanese": "証拠がこれだけ揃っている以上、事実を認めざるを得ない。",
        "reading": "しょうこ[証拠]がこれだけそろ[揃]っているいじょう[以上]、じじつ[事実]をみと[認]めざるをえない[得ない]。",
        "vietnamese": "Một khi bằng chứng đã đầy đủ thế này, tôi đành phải thừa nhận sự thật.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-zaruoenai-2",
        "japanese": "台風の接近に伴い、旅行の計画を中止せざるを得なくなった。",
        "reading": "たいふう[台風]のせっきん[接近]にともな[伴]い、りょこう[旅行]のけいかく[計画]をちゅうし[中止]せざるをえ[得]なくなった。",
        "vietnamese": "Do bão đang áp sát, chúng tôi buộc lòng phải hủy bỏ kế hoạch chuyến du lịch.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "これほど多くの人が反対しているなら、方針を（　）ざるを得ない。",
      "questionVi": "Đành phải, buộc lòng phải, không thể không...",
      "options": [
        "変える",
        "変え",
        "変わる",
        "変えた"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 1,
      "explanation": "Động từ thể ない bỏ ない: 変えない -> 変え + ざるを得ない."
    }
  },
  {
    "id": "n2-yamuoenai",
    "lessonId": "skz-n2-c1",
    "lessonTitle": "Chương 1: Bắt buộc, Đành phải & Không kìm nén",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜やむを得ない",
    "reading": "〜やむをえない",
    "romaji": "yamu o enai",
    "level": "N2",
    "category": "Bắt buộc & Tâm lý",
    "meaningVi": "Không còn cách nào khác, bất đắc dĩ, đành chịu",
    "structure": "やむを得ず + V / V/N + のは + やむを得ない",
    "formality": "Trang trọng",
    "nuance": "Diễn đạt tình huống bất khả kháng, không còn phương kế cứu vãn nên đành chấp nhận kết quả tiêu cực. Thường dùng trong thông báo, văn bản chính thức.",
    "formationRules": [
      {
        "partOfSpeech": "Thể thông thường",
        "rule": "Đứng trước danh từ: やむを得ない + N",
        "example": "Đứng trước danh từ: やむを得ない + N"
      },
      {
        "partOfSpeech": "Thể thông thường",
        "rule": "Dùng như phó từ: やむを得ず + Cụm vị ngữ",
        "example": "Dùng như phó từ: やむを得ず + Cụm vị ngữ"
      },
      {
        "partOfSpeech": "Thể thông thường",
        "rule": "Đứng cuối câu: 〜のはやむを得ない",
        "example": "Đứng cuối câu: 〜のはやむを得ない"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-yamuoenai-1",
        "japanese": "急病のため、やむを得ず会議を欠席いたしました。",
        "reading": "きゅうびょう[急病]のため、やむをえず[得ず]かいぎ[会議]をけっせき[欠席]いたしました。",
        "vietnamese": "Vì bị ốm đột xuất, tôi bất đắc dĩ phải vắng mặt trong cuộc họp.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-yamuoenai-2",
        "japanese": "悪天候による電車の遅延はやむを得ないことだ。",
        "reading": "あくてんこう[悪天候]によるでんしゃ[電車]のちえん[遅延]はやむをえない[得ない]ことだ。",
        "vietnamese": "Tàu chậm chuyến do thời tiết xấu là điều không thể tránh khỏi.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "家庭の事情で（　）会社を辞めることになった。",
      "questionVi": "Không còn cách nào khác, bất đắc dĩ, đành chịu",
      "options": [
        "やむを得ず",
        "やむを得ないで",
        "やむを得なくて",
        "やむを得ずには"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "やむを得ず đóng vai trò phó từ chỉ lý do bất đắc dĩ, bổ nghĩa cho động từ 辞める."
    }
  },
  {
    "id": "n2-tetamaranai",
    "lessonId": "skz-n2-c1",
    "lessonTitle": "Chương 1: Bắt buộc, Đành phải & Không kìm nén",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜てたまらない",
    "reading": "〜てたまらない",
    "romaji": "te tamaranai",
    "level": "N2",
    "category": "Cảm xúc & Tâm lý",
    "meaningVi": "Rất, vô cùng, không chịu nổi (về cảm giác thân thể hoặc cảm xúc)",
    "structure": "V-te / A-i (くて) / A-na (で) + たまらない",
    "formality": "Thông thường",
    "nuance": "Bày tỏ cảm giác cơ thể (đói, khát, ngứa, đau) hoặc mong muốn chủ quan mãnh liệt tới mức bản thân không thể chịu đựng nổi.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "Động từ: V-te + たまらない / V-tai -> たくてたまらない",
        "example": "Động từ: V-te + たまらない / V-tai -> たくてたまらない"
      },
      {
        "partOfSpeech": "Tính từ đuôi い",
        "rule": "Tính từ đuôi い: bỏ い + くてたまらない",
        "example": "Tính từ đuôi い: bỏ い + くてたまらない"
      },
      {
        "partOfSpeech": "Tính từ đuôi な",
        "rule": "Tính từ đuôi な: bỏ な + でたまらない",
        "example": "Tính từ đuôi な: bỏ な + でたまらない"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-tetamaranai-1",
        "japanese": "暑くてたまらないので、エアコンをつけてもいいですか。",
        "reading": "あつ[暑]くてたまらないので、エアコンをつけてもいいですか。",
        "vietnamese": "Nóng quá không chịu nổi, tôi bật điều hòa được không?",
        "highlightWords": []
      },
      {
        "id": "ex-n2-tetamaranai-2",
        "japanese": "家族に会いたくてたまらない。",
        "reading": "かぞく[家族]にあ[会]いたくてたまらない。",
        "vietnamese": "Tôi nhớ và muốn gặp gia đình vô cùng.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "蚊に刺されたところが（　）たまらない。",
      "questionVi": "Rất, vô cùng, không chịu nổi (về cảm giác thân thể hoặc cảm xúc)",
      "options": [
        "かゆい",
        "かゆくて",
        "かゆく",
        "かゆいので"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 1,
      "explanation": "Tính từ đuôi い: かゆい -> かゆくてたまらない."
    }
  },
  {
    "id": "n2-tenaranai",
    "lessonId": "skz-n2-c1",
    "lessonTitle": "Chương 1: Bắt buộc, Đành phải & Không kìm nén",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜てならない",
    "reading": "〜てならない",
    "romaji": "te naranai",
    "level": "N2",
    "category": "Cảm xúc & Tâm lý",
    "meaningVi": "Hết sức, không kìm được, cảm thấy... vô cùng",
    "structure": "V-te / A-i (くて) / A-na (で) + ならない",
    "formality": "Trang trọng",
    "nuance": "Khác với たまらない (thiên về cảm giác cơ quan sinh lý), てならない dùng cho cảm xúc nội tâm, nỗi lo âu, linh cảm tự nhiên ùa đến từ tận đáy lòng mà không kìm nén được.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "Động tự phát (思われる, 気になる...): V-te + ならない",
        "example": "Động tự phát (思われる, 気になる...): V-te + ならない"
      },
      {
        "partOfSpeech": "Thể thông thường",
        "rule": "Tính từ cảm xúc (心配, 残念, 不安): で + ならない",
        "example": "Tính từ cảm xúc (心配, 残念, 不安): で + ならない"
      },
      {
        "partOfSpeech": "Thể thông thường",
        "rule": "Tính từ い: くて + ならない",
        "example": "Tính từ い: くて + ならない"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-tenaranai-1",
        "japanese": "合格できるかどうか、不安でならない。",
        "reading": "ごうかく[合格]できるかどうか、ふあん[不安]でならない。",
        "vietnamese": "Liệu có đỗ được không, tôi lo lắng không yên.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-tenaranai-2",
        "japanese": "親友が遠くへ引っ越してしまうのが、残念でならない。",
        "reading": "しんゆう[親友]がとお[遠]くへひっこ[引越]してしまうのが、ざんねん[残念]でならない。",
        "vietnamese": "Bạn thân chuyển đi xa làm tôi tiếc nuối vô cùng.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "一人暮らしを始めた息子の健康が（　）ならない。",
      "questionVi": "Hết sức, không kìm được, cảm thấy... vô cùng",
      "options": [
        "心配",
        "心配で",
        "心配な",
        "心配に"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 1,
      "explanation": "Tính từ đuôi な: 心配 + でならない."
    }
  },
  {
    "id": "n2-teshouganai",
    "lessonId": "skz-n2-c1",
    "lessonTitle": "Chương 1: Bắt buộc, Đành phải & Không kìm nén",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜てしょうがない / てしかたがない",
    "reading": "〜てしょうがない / てしかたがない",
    "romaji": "te shouganai / te shikata ga nai",
    "level": "N2",
    "category": "Cảm xúc & Tâm lý",
    "meaningVi": "Không biết làm sao, không thể chịu nổi, vô cùng...",
    "structure": "V-te / A-i (くて) / A-na (で) + しょうがない / しかたがない",
    "formality": "Thông thường",
    "nuance": "Dùng trong khẩu ngữ hằng ngày để diễn tả mức độ cao của cảm giác, cảm xúc hoặc sự việc làm bản thân bối rối, không kiểm soát nổi.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-te + しょうがない / しかたがない",
        "example": "V-te + しょうがない / しかたがない"
      },
      {
        "partOfSpeech": "Tính từ đuôi い",
        "rule": "A-i bỏ い + くてしょうがない",
        "example": "A-i bỏ い + くてしょうがない"
      },
      {
        "partOfSpeech": "Tính từ đuôi な",
        "rule": "A-na + でしょうがない",
        "example": "A-na + でしょうがない"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-teshouganai-1",
        "japanese": "昨夜あまり寝ていないので、眠くてしょうがない。",
        "reading": "ゆうべ[昨夜]あまりね[寝]ていないので、ねむ[眠]くてしょうがない。",
        "vietnamese": "Đêm qua không ngủ được mấy nên bây giờ tôi buồn ngủ không chịu được.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-teshouganai-2",
        "japanese": "弟のいたずらには腹が立ってしかたがない。",
        "reading": "おとうと[弟]のいたずらにははら[腹]がた[立]ってしかたがない。",
        "vietnamese": "Tôi tức giận vô cùng với trò nghịch ngợm của đứa em trai.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "試験の結果が気になって（　）。",
      "questionVi": "Không biết làm sao, không thể chịu nổi, vô cùng...",
      "options": [
        "しょうがない",
        "しょうがないで",
        "しょうがなくて",
        "しょうがないと"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "V-te + しょうがない: 気になってしょうがない (lo lắng bồn chồn khôn nguôi)."
    }
  },
  {
    "id": "n2-zuniwairarenai",
    "lessonId": "skz-n2-c1",
    "lessonTitle": "Chương 1: Bắt buộc, Đành phải & Không kìm nén",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜ずにはいられない / ないではいられない",
    "reading": "〜ずにはいられない / ないではいられない",
    "romaji": "zu ni wa irarenai / nai de wa irarenai",
    "level": "N2",
    "category": "Bắt buộc & Tâm lý",
    "meaningVi": "Không thể không làm, không thể nhịn được, không kìm được mà phải...",
    "structure": "V-nai (bỏ ない) + ずにはいられない (Riêng する -> せずにはいられない)",
    "formality": "Trang trọng",
    "nuance": "Bản thân không thể kiềm chế được hành động hay cảm xúc tự nhiên bộc phát dù có ý muốn kiềm lại.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-nai bỏ ない + ずにはいられない",
        "example": "V-nai bỏ ない + ずにはいられない"
      },
      {
        "partOfSpeech": "Thể thông thường",
        "rule": "Đặc biệt: する -> せずにはいられない",
        "example": "Đặc biệt: する -> せずにはいられない"
      },
      {
        "partOfSpeech": "Động từ",
        "rule": "Văn nói tương đương: V-nai + ではいられない",
        "example": "Văn nói tương đương: V-nai + ではいられない"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-zuniwairarenai-1",
        "japanese": "彼の面白い冗談を聞くと、笑わずにはいられない。",
        "reading": "かれ[彼]のおもしろ[面白]いじょうだん[冗談]をき[聞]くと、わら[笑]わずにはいられない。",
        "vietnamese": "Cứ nghe chuyện cười hóm hỉnh của anh ấy là không thể nhịn cười nổi.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-zuniwairarenai-2",
        "japanese": "困っている人を見ると、助けずにはいられない性格だ。",
        "reading": "こま[困]っているひと[人]をみ[見]ると、たす[助]けずにはいられないせいかく[性格]だ。",
        "vietnamese": "Tôi có tính cách là cứ thấy ai gặp khó khăn là không kìm lòng được mà phải giúp đỡ.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "あの感動的な映画を見たら、誰でも涙を（　）にはいられないだろう。",
      "questionVi": "Không thể không làm, không thể nhịn được, không kìm được mà phải...",
      "options": [
        "流さず",
        "流さない",
        "流して",
        "流す"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "流す -> 流さない -> 流さず + にはいられない."
    }
  },
  {
    "id": "n2-okinjienai",
    "lessonId": "skz-n2-c1",
    "lessonTitle": "Chương 1: Bắt buộc, Đành phải & Không kìm nén",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜を禁じ得ない",
    "reading": "〜をきんじえない",
    "romaji": "o kinjienai",
    "level": "N2",
    "category": "Cảm xúc & Tâm lý",
    "meaningVi": "Không kìm nén được (nỗi buồn, sự phẫn nộ, lòng thương cảm...)",
    "structure": "N + を禁じ得ない",
    "formality": "Trang trọng",
    "nuance": "Văn phong trang trọng, mang tính văn học hoặc phát biểu nghiêm túc. Đi kèm các danh từ chỉ cảm xúc mạnh mẽ như 怒り (tức giận), 涙 (nước mắt), 同情 (đồng cảm), 驚き (ngạc nhiên).",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "Danh từ chỉ cảm xúc + を禁じ得ない",
        "example": "Danh từ chỉ cảm xúc + を禁じ得ない"
      },
      {
        "partOfSpeech": "Thể thông thường",
        "rule": "Không đi với động từ hay tính từ",
        "example": "Không đi với động từ hay tính từ"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-okinjienai-1",
        "japanese": "無責任な政府の対応に、強い怒りを禁じ得ない。",
        "reading": "むせきにん[無責任]なせいふ[政府]のたいおう[対応]に、つよ[強]いいか[怒]りをきん[禁]じえない[得ない]。",
        "vietnamese": "Trước cách xử lý vô trách nhiệm của chính phủ, tôi không thể kìm nén được sự phẫn nộ cùng cực.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-okinjienai-2",
        "japanese": "被災地の悲惨な光景に、涙を禁じ得なかった。",
        "reading": "ひさいち[被災地]のひさん[悲惨]なこうけい[光景]に、なみだ[涙]をきん[禁]じえ[得]なかった。",
        "vietnamese": "Trước cảnh tượng đau lòng ở vùng thiên tai, tôi đã không kìm được nước mắt.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "その悲しい知らせを聞いて、誰もが同情（　）。",
      "questionVi": "Không kìm nén được (nỗi buồn, sự phẫn nộ, lòng thương cảm...)",
      "options": [
        "を禁じ得なかった",
        "に禁じ得なかった",
        "で禁じ得なかった",
        "と禁じ得なかった"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Cấu trúc: N + を禁じ得ない / を禁じ得なかった."
    }
  },
  {
    "id": "n2-tsuideni",
    "lessonId": "skz-n2-c2",
    "lessonTitle": "Chương 2: Thời điểm, Cơ hội & Bước ngoặt",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜ついでに",
    "reading": "〜ついでに",
    "romaji": "tsuide ni",
    "level": "N2",
    "category": "Thời gian & Cơ hội",
    "meaningVi": "Nhân tiện, tiện thể làm việc này thì làm việc kia",
    "structure": "V-ru / V-ta / N + の + ついでに",
    "formality": "Thông thường",
    "nuance": "Hành động chính là vế trước, và nhân tiện cơ hội đó thực hiện thêm hành động phụ ở vế sau để đỡ mất công.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V thể từ điển (V-ru) + ついでに",
        "example": "V thể từ điển (V-ru) + ついでに"
      },
      {
        "partOfSpeech": "Động từ",
        "rule": "V thể quá khứ (V-ta) + ついでに",
        "example": "V thể quá khứ (V-ta) + ついでに"
      },
      {
        "partOfSpeech": "Danh từ",
        "rule": "Danh từ + の + ついでに",
        "example": "Danh từ + の + ついでに"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-tsuideni-1",
        "japanese": "散歩のついでに、郵便局で切手を買ってきた。",
        "reading": "さんぽ[散歩]のついでに、ゆうびんきょく[郵便局]できって[切手]をか[買]ってきた。",
        "vietnamese": "Tiện thể đi dạo, tôi đã ghé bưu điện mua tem.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-tsuideni-2",
        "japanese": "出張で大阪へ行くついでに、昔の友達に会う予定だ。",
        "reading": "しゅっちょう[出張]でおおさか[大阪]へい[行]くついでに、むかし[昔]のともだち[友達]にあ[会]うよてい[予定]だ。",
        "vietnamese": "Nhân tiện đi công tác Osaka, tôi dự định sẽ gặp người bạn cũ.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "コンビニへ行く（　）、ゴミを出してきてくれない？",
      "questionVi": "Nhân tiện, tiện thể làm việc này thì làm việc kia",
      "options": [
        "ついでに",
        "契機に",
        "最中に",
        "際に"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Đi cửa hàng tiện lợi và tiện thể mang rác đi vứt dùng ついでに."
    }
  },
  {
    "id": "n2-okeikini",
    "lessonId": "skz-n2-c2",
    "lessonTitle": "Chương 2: Thời điểm, Cơ hội & Bước ngoặt",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜を契機に / を契機として",
    "reading": "〜をけいきに / をけいきとして",
    "romaji": "o keiki ni / o keiki to shite",
    "level": "N2",
    "category": "Thời gian & Cơ hội",
    "meaningVi": "Nhân cơ hội, lấy làm bước ngoặt để...",
    "structure": "N + を契機に / を契機として",
    "formality": "Trang trọng",
    "nuance": "Dùng trong văn viết hoặc tình huống trang trọng, diễn tả sự kiện mang tính lịch sử, bước chuyển biến lớn theo hướng phát triển hoặc tích cực.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "Danh từ + を契機に",
        "example": "Danh từ + を契機に"
      },
      {
        "partOfSpeech": "Danh từ",
        "rule": "Danh từ + を契機として / を契機とする + N",
        "example": "Danh từ + を契機として / を契機とする + N"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-okeikini-1",
        "japanese": "オリンピックの開催を契機に、街のインフラ整備が一気に進んだ。",
        "reading": "オリンピックのかいさい[開催]をけいき[契機]に、まち[街]のインフラせいび[整備]がいっき[一気]にすす[進]んだ。",
        "vietnamese": "Nhân cơ hội tổ chức Olympic, việc hoàn thiện cơ sở hạ tầng đô thị đã tiến triển nhanh chóng.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-okeikini-2",
        "japanese": "定年退職を契機として、本格的に絵画を学び始めた。",
        "reading": "ていねんたいしょく[定年退職]をけいき[契機]として、ほんかくてき[本格的]にかいが[絵画]をまな[学]びはじ[始]めた。",
        "vietnamese": "Lấy việc nghỉ hưu làm bước ngoặt, ông ấy bắt đầu học vẽ một cách bài bản.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "新製品の発売を（　）、海外市場への進出を本格化させた。",
      "questionVi": "Nhân cơ hội, lấy làm bước ngoặt để...",
      "options": [
        "契機に",
        "最中に",
        "ついでに",
        "折に"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Lấy sự kiện lớn làm bước ngoặt phát triển: N + を契機に."
    }
  },
  {
    "id": "n2-okikkakeni",
    "lessonId": "skz-n2-c2",
    "lessonTitle": "Chương 2: Thời điểm, Cơ hội & Bước ngoặt",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜をきっかけに / をきっかけとして",
    "reading": "〜をきっかけに / をきっかけとして",
    "romaji": "o kikkake ni / o kikkake to shite",
    "level": "N2",
    "category": "Thời gian & Cơ hội",
    "meaningVi": "Từ duyên cớ, bắt nguồn từ, nhân dịp...",
    "structure": "N + をきっかけに / V-ta + ことをきっかけに",
    "formality": "Thông thường",
    "nuance": "Diễn tả nguyên cớ ban đầu khởi xướng một chuỗi thay đổi hoặc hành động mới (mang tính đời thường hơn を契機に).",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "Danh từ + をきっかけに(して)",
        "example": "Danh từ + をきっかけに(して)"
      },
      {
        "partOfSpeech": "Động từ",
        "rule": "V-ta + ことをきっかけに",
        "example": "V-ta + ことをきっかけに"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-okikkakeni-1",
        "japanese": "日本のアニメを見たのをきっかけに、日本語の勉強を始めました。",
        "reading": "にほん[日本]のアニメをみ[見]たのをきっかけに、にほんご[日本語]のべんきょう[勉強]をはじ[始]めました。",
        "vietnamese": "Bắt nguồn từ việc xem anime Nhật Bản, tôi đã bắt đầu học tiếng Nhật.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-okikkakeni-2",
        "japanese": "入院をきっかけとして、健康的な生活習慣を心がけるようになった。",
        "reading": "にゅういん[入院]をきっかけとして、けんこうてき[健康的]なせいかつしゅうかん[生活習慣]をこころが[心掛]けるようになった。",
        "vietnamese": "Nhân dịp phải nhập viện, tôi đã bắt đầu chú ý đến thói quen sống lành mạnh.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "友人に誘われた（　）きっかけに、ボランティア活動に参加した。",
      "questionVi": "Từ duyên cớ, bắt nguồn từ, nhân dịp...",
      "options": [
        "のを",
        "のに",
        "ので",
        "のをで"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Động từ hóa thành danh từ: V-ta + の/こと + をきっかけに."
    }
  },
  {
    "id": "n2-orini",
    "lessonId": "skz-n2-c2",
    "lessonTitle": "Chương 2: Thời điểm, Cơ hội & Bước ngoặt",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜折に / 折の",
    "reading": "〜おりに / おりの",
    "romaji": "ori ni / ori no",
    "level": "N2",
    "category": "Thời gian & Cơ hội",
    "meaningVi": "Nhân dịp, đúng vào lúc... (trang trọng)",
    "structure": "V-ru / V-ta / N + の + 折に",
    "formality": "Trang trọng",
    "nuance": "Tương tự とき nhưng trang trọng, lịch sự hơn nhiều, thường xuất hiện trong thư từ kinh doanh hoặc giao tiếp chào hỏi trang nhã.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-ru / V-ta + 折(に)",
        "example": "V-ru / V-ta + 折(に)"
      },
      {
        "partOfSpeech": "Danh từ",
        "rule": "Danh từ + の + 折(に)",
        "example": "Danh từ + の + 折(に)"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-orini-1",
        "japanese": "近くにお越しの折には、ぜひ我が家にもお立ち寄りください。",
        "reading": "ちか[近]くにおこ[越]しのおり[折]には、ぜひわがや[我が家]にもおた[立]ちよ[寄]りください。",
        "vietnamese": "Khi có dịp ghé qua gần đây, xin mời anh/chị nhất định ghé chơi nhà chúng tôi.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-orini-2",
        "japanese": "先月お目にかかりました折には、大変お世話になりました。",
        "reading": "せんげつ[先月]おめにかかりましたおり[折]には、たいへん[大変]おせわ[世話]になりました。",
        "vietnamese": "Nhân dịp được gặp gỡ quý vị vào tháng trước, tôi đã được giúp đỡ rất nhiều.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "来月東京へ出張する（　）、ご挨拶に伺います。",
      "questionVi": "Nhân dịp, đúng vào lúc... (trang trọng)",
      "options": [
        "折に",
        "最中に",
        "ばかりに",
        "どころに"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Lời chào lịch sự khi có dịp công tác: 出張する折に."
    }
  },
  {
    "id": "n2-saini",
    "lessonId": "skz-n2-c2",
    "lessonTitle": "Chương 2: Thời điểm, Cơ hội & Bước ngoặt",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜際 / 際に / 際は",
    "reading": "〜さい / さいに / さいは",
    "romaji": "sai / sai ni / sai wa",
    "level": "N2",
    "category": "Thời gian & Cơ hội",
    "meaningVi": "Khi, lúc, trong trường hợp... (lịch sự)",
    "structure": "V-ru / V-ta / N + の + 際(に)",
    "formality": "Trang trọng",
    "nuance": "Trang trọng hơn とき, thường dùng trong các thông báo chỉ dẫn, hướng dẫn an toàn hoặc tài liệu chính thức.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V thể từ điển (V-ru) + 際(に)",
        "example": "V thể từ điển (V-ru) + 際(に)"
      },
      {
        "partOfSpeech": "Động từ",
        "rule": "V thể quá khứ (V-ta) + 際(に)",
        "example": "V thể quá khứ (V-ta) + 際(に)"
      },
      {
        "partOfSpeech": "Danh từ",
        "rule": "N + の + 際(に)",
        "example": "N + の + 際(に)"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-saini-1",
        "japanese": "非常の際は、エレベーターを使わずに階段をご利用ください。",
        "reading": "ひじょう[非常]のさい[際]は、エレベーターをつか[使]わずにかいだん[階段]をごりよう[利用]ください。",
        "vietnamese": "Trong trường hợp khẩn cấp, vui lòng không sử dụng thang máy mà hãy dùng thang bộ.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-saini-2",
        "japanese": "お申し込みの際には、本人確認書類が必要となります。",
        "reading": "おもう[申]しこ[込]みのさい[際]には、ほんにんかくにんしょるい[本人確認書類]がひつよう[必要]となります。",
        "vietnamese": "Khi đăng ký, quý khách cần chuẩn bị giấy tờ tùy thân.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "パスポートを更新する（　）、写真が2枚必要です。",
      "questionVi": "Khi, lúc, trong trường hợp... (lịch sự)",
      "options": [
        "際に",
        "最中に",
        "契機に",
        "うちに"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Trong hướng dẫn thủ tục: 更新する際に."
    }
  },
  {
    "id": "n2-saichuuni",
    "lessonId": "skz-n2-c2",
    "lessonTitle": "Chương 2: Thời điểm, Cơ hội & Bước ngoặt",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜最中に / 最中だ",
    "reading": "〜さいちゅうに / さいちゅうだ",
    "romaji": "saichuu ni / saichuu da",
    "level": "N2",
    "category": "Thời gian & Cơ hội",
    "meaningVi": "Đúng vào lúc đang... (thì có sự việc bất ngờ chen ngang)",
    "structure": "V-te iru + 最中に / N + の + 最中に",
    "formality": "Thông thường",
    "nuance": "Nhấn mạnh thời điểm hành động đang diễn ra cao trào nhất thì bất ngờ bị một biến cố bên ngoài làm gián đoạn.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "Động từ thể V-te iru + 最中に",
        "example": "Động từ thể V-te iru + 最中に"
      },
      {
        "partOfSpeech": "Danh từ",
        "rule": "Danh từ hành động + の + 最中に",
        "example": "Danh từ hành động + の + 最中に"
      },
      {
        "partOfSpeech": "Thể thông thường",
        "rule": "Đứng cuối câu: 〜最中だ",
        "example": "Đứng cuối câu: 〜最中だ"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-saichuuni-1",
        "japanese": "大事な会議の最中に、突然携帯電話が鳴り響いた。",
        "reading": "だいじ[大事]なかいぎ[会議]のさいちゅう[最中]に、とつぜん[突然]けいたいでんわ[携帯電話]がな[鳴]りひび[響]いた。",
        "vietnamese": "Đúng lúc cuộc họp quan trọng đang diễn ra, đột nhiên chuông điện thoại reo vang.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-saichuuni-2",
        "japanese": "食事をしている最中に、激しい地震が起きた。",
        "reading": "しょくじ[食事]をしているさいちゅう[最中]に、はげ[激]しいじしん[地震]がお[起]きた。",
        "vietnamese": "Đúng lúc cả nhà đang dùng bữa thì xảy ra động đất dữ dội.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "スピーチをしている（　）、停電になってマイクが切れた。",
      "questionVi": "Đúng vào lúc đang... (thì có sự việc bất ngờ chen ngang)",
      "options": [
        "最中に",
        "ついでに",
        "折に",
        "契機に"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Sự cố mất điện bất ngờ xảy ra đúng lúc đang phát biểu: 最中に."
    }
  },
  {
    "id": "n2-nisakidatte",
    "lessonId": "skz-n2-c2",
    "lessonTitle": "Chương 2: Thời điểm, Cơ hội & Bước ngoặt",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜に先立って / に先立ち",
    "reading": "〜にさきだって / にさきだち",
    "romaji": "ni sakidatte / ni sakidachi",
    "level": "N2",
    "category": "Thời gian & Cơ hội",
    "meaningVi": "Trước khi, chuẩn bị trước khi... (tiến hành sự kiện quan trọng)",
    "structure": "V-ru / N + に先立って",
    "formality": "Trang trọng",
    "nuance": "Chỉ các hoạt động chuẩn bị, khai mạc hoặc tiến hành trước khi một sự kiện trọng đại, dự án lớn chính thức bắt đầu.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V thể từ điển (V-ru) + に先立って",
        "example": "V thể từ điển (V-ru) + に先立って"
      },
      {
        "partOfSpeech": "Danh từ",
        "rule": "Danh từ + に先立って / に先立つ + N",
        "example": "Danh từ + に先立って / に先立つ + N"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-nisakidatte-1",
        "japanese": "映画の一般公開に先立って、特別試写会が行われた。",
        "reading": "えいが[映画]のいっぱんこうかい[一般公開]にさきだ[先立]って、とくべつししゃかい[特別試写会]がおこな[行]われた。",
        "vietnamese": "Trước khi bộ phim công chiếu rộng rãi, buổi chiếu thử đặc biệt đã được tổ chức.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-nisakidatte-2",
        "japanese": "新商品の開発に先立ち、綿密な市場調査を実施した。",
        "reading": "しんしょうひん[新商品]のかいはつ[開発]にさきだ[先立]ち、めんみつ[綿密]なしじょうちょうさ[市場調査]をじっし[実施]した。",
        "vietnamese": "Trước khi phát triển sản phẩm mới, chúng tôi đã tiến hành khảo sát thị trường tỉ mỉ.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "総会の開始（　）、資料の配布を行います。",
      "questionVi": "Trước khi, chuẩn bị trước khi... (tiến hành sự kiện quan trọng)",
      "options": [
        "に先立って",
        "についでに",
        "の最中に",
        "に契機として"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Trước khi bắt đầu cuộc họp: N + に先立って."
    }
  },
  {
    "id": "n2-otowazu",
    "lessonId": "skz-n2-c3",
    "lessonTitle": "Chương 3: Phạm vi, Bất kể & Không liên quan",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜を問わず",
    "reading": "〜をとわず",
    "romaji": "o towazu",
    "level": "N2",
    "category": "Phạm vi & Giới hạn",
    "meaningVi": "Bất kể, không phân biệt, không màng tới...",
    "structure": "N + を問わず",
    "formality": "Trang trọng",
    "nuance": "Thường đi với các cặp đối lập hoặc danh từ có phạm vi rộng (tuổi tác, giới tính, quốc tịch, ngày đêm, kinh nghiệm). Nghĩa là mọi đối tượng đều như nhau.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "Danh từ đối lập (昼夜, 男女, 内外) + を問わず",
        "example": "Danh từ đối lập (昼夜, 男女, 内外) + を問わず"
      },
      {
        "partOfSpeech": "Danh từ",
        "rule": "Danh từ phạm vi (年齢, 国籍, 経験) + を問わず",
        "example": "Danh từ phạm vi (年齢, 国籍, 経験) + を問わず"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-otowazu-1",
        "japanese": "このスポーツクラブは、年齢や性別を問わず誰でも参加できます。",
        "reading": "このスポーツクラブは、ねんれい[年齢]やせいべつ[性別]をと[問]わずだれ[誰]でもさんか[参加]できます。",
        "vietnamese": "Câu lạc bộ thể thao này bất kể tuổi tác hay giới tính, ai cũng có thể tham gia.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-otowazu-2",
        "japanese": "経験の有無を問わず、意欲のある方を募集しています。",
        "reading": "けいけん[経験]のうむ[有無]をと[問]わず、いよく[意欲]のあるかた[方]をぼしゅう[募集]しています。",
        "vietnamese": "Bất kể có kinh nghiệm hay chưa, chúng tôi đang tuyển dụng những người có nhiệt huyết.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "国籍を（　）、世界中から留学生を受け入れている。",
      "questionVi": "Bất kể, không phân biệt, không màng tới...",
      "options": [
        "問わず",
        "問うて",
        "問いながら",
        "問わないで"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Cấu trúc bất kể quốc tịch: 国籍を問わず."
    }
  },
  {
    "id": "n2-nikakawarazu",
    "lessonId": "skz-n2-c3",
    "lessonTitle": "Chương 3: Phạm vi, Bất kể & Không liên quan",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜にかかわらず / にかかわりなく",
    "reading": "〜にかかわらず / にかかわりなく",
    "romaji": "ni kakawarazu / ni kakawarinaku",
    "level": "N2",
    "category": "Phạm vi & Giới hạn",
    "meaningVi": "Bất chấp, không phụ thuộc vào, dù thế nào đi nữa...",
    "structure": "N / V-ru + V-nai + にかかわらず",
    "formality": "Thông thường",
    "nuance": "Chỉ việc vế sau diễn ra mà hoàn toàn không bị ảnh hưởng hay chi phối bởi điều kiện hoặc tình huống ở vế trước.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "Danh từ đối lập (天候, 理由, 成否) + にかかわらず",
        "example": "Danh từ đối lập (天候, 理由, 成否) + にかかわらず"
      },
      {
        "partOfSpeech": "Động từ",
        "rule": "V-ru + V-nai + にかかわらず (cặp khẳng định - phủ định)",
        "example": "V-ru + V-nai + にかかわらず (cặp khẳng định - phủ định)"
      },
      {
        "partOfSpeech": "Thể thông thường",
        "rule": "Tính từ い + くない + にかかわらず",
        "example": "Tính từ い + くない + にかかわらず"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-nikakawarazu-1",
        "japanese": "天候にかかわらず、明日のマラソン大会は決行します。",
        "reading": "てんこう[天候]にかかわらず、あす[明日]のマラソンたいかい[大会]はけっこう[決行]します。",
        "vietnamese": "Bất chấp thời tiết ra sao, giải chạy marathon ngày mai vẫn diễn ra.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-nikakawarazu-2",
        "japanese": "参加するしないにかかわらず、出欠の連絡をお願いします。",
        "reading": "さんか[参加]するしないにかかわらず、しゅっけつ[出欠]のれんらく[連絡]をおねが[願]いします。",
        "vietnamese": "Dù có tham gia hay không, xin vui lòng thông báo việc có mặt.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "理由の（　）、無断欠勤は認められません。",
      "questionVi": "Bất chấp, không phụ thuộc vào, dù thế nào đi nữa...",
      "options": [
        "いかんにかかわらず",
        "にかかわらず",
        "をもとに",
        "を問わずして"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 1,
      "explanation": "理由にかかわらず: bất kể lý do là gì."
    }
  },
  {
    "id": "n2-mokamawazu",
    "lessonId": "skz-n2-c3",
    "lessonTitle": "Chương 3: Phạm vi, Bất kể & Không liên quan",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜もかまわず",
    "reading": "〜もかまわず",
    "romaji": "mo kamawazu",
    "level": "N2",
    "category": "Phạm vi & Giới hạn",
    "meaningVi": "Chẳng màng đến, không bận tâm, bất chấp...",
    "structure": "N / V-ru + の + もかまわず",
    "formality": "Trang trọng",
    "nuance": "Thường mang sắc thái phê phán người khác làm một việc gì đó mà không màng đến ánh mắt xung quanh, sự bất tiện của người khác, hoặc tình cảnh của mình.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "Danh từ + もかまわず",
        "example": "Danh từ + もかまわず"
      },
      {
        "partOfSpeech": "Động từ",
        "rule": "Động từ V thể thông thường + の + もかまわず",
        "example": "Động từ V thể thông thường + の + もかまわず"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-mokamawazu-1",
        "japanese": "彼女は人目もかまわず、声を上げて泣き崩れた。",
        "reading": "かのじょ[彼女]はひとめ[人目]もかまわず、こえ[声]をあ[上]げてな[泣]きくず[崩]れた。",
        "vietnamese": "Cô ấy chẳng màng đến ánh mắt mọi người xung quanh, òa lên khóc nức nở.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-mokamawazu-2",
        "japanese": "泥で服が汚れるのもかまわず、子供たちは夢中で遊んでいる。",
        "reading": "どろ[泥]でふく[服]がよご[汚]れるのもかまわず、こども[子供]たちはむちゅう[夢中]であそ[遊]んでいる。",
        "vietnamese": "Mặc cho quần áo lấm lem bùn đất, lũ trẻ vẫn say sưa nô đùa.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "電車の中で周りの迷惑（　）、大声で電話している人がいる。",
      "questionVi": "Chẳng màng đến, không bận tâm, bất chấp...",
      "options": [
        "もかまわず",
        "を問わず",
        "にかかわらず",
        "はともかく"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Chẳng màng đến sự phiền hà người khác: 迷惑もかまわず."
    }
  },
  {
    "id": "n2-watomokaku",
    "lessonId": "skz-n2-c3",
    "lessonTitle": "Chương 3: Phạm vi, Bất kể & Không liên quan",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜はともかく / はともかくとして",
    "reading": "〜はともかく / はともかくとして",
    "romaji": "wa tomokaku / wa tomokaku to shite",
    "level": "N2",
    "category": "Phạm vi & Giới hạn",
    "meaningVi": "Tạm thời chưa bàn tới, gác lại chuyện... mà ưu tiên...",
    "structure": "N + はともかく(として)",
    "formality": "Thông thường",
    "nuance": "Đưa yếu tố A sang một bên (chưa cần bàn hay quan tâm ngay), mà muốn nhấn mạnh vào yếu tố B quan trọng hơn ở vế sau.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "Danh từ + はともかく(として)",
        "example": "Danh từ + はともかく(として)"
      },
      {
        "partOfSpeech": "Thể thông thường",
        "rule": "Từ để hỏi (dạng nghi vấn) + かどうかはともかく",
        "example": "Từ để hỏi (dạng nghi vấn) + かどうかはともかく"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-watomokaku-1",
        "japanese": "値段はともかくとして、このデザインはとても気に入った。",
        "reading": "ねだん[値段]はともかくとして、このデザインはとてもき[気]にいった[入]。",
        "vietnamese": "Chưa bàn tới giá cả, tôi cực kỳ ưng ý kiểu thiết kế này.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-watomokaku-2",
        "japanese": "味はともかく、ボリュームだけは満点のお店だ。",
        "reading": "あじ[味]はともかく、ボリュームだけはまんてん[満点]のおみせ[店]だ。",
        "vietnamese": "Chưa nói đến hương vị, quán này riêng khoản đầy đặn thì điểm tuyệt đối.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "勝てるかどうか（　）、全力を尽くして戦おう。",
      "questionVi": "Tạm thời chưa bàn tới, gác lại chuyện... mà ưu tiên...",
      "options": [
        "はともかく",
        "を問わず",
        "にかかわらず",
        "もかまわず"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Thắng thua tính sau, trước hết cố gắng hết sức: 勝てるかどうかはともかく."
    }
  },
  {
    "id": "n2-wasateoki",
    "lessonId": "skz-n2-c3",
    "lessonTitle": "Chương 3: Phạm vi, Bất kể & Không liên quan",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜はさておき",
    "reading": "〜はさておき",
    "romaji": "wa sateoki",
    "level": "N2",
    "category": "Phạm vi & Giới hạn",
    "meaningVi": "Tạm gác chuyện... sang một bên, hãy nói về...",
    "structure": "N + はさておき",
    "formality": "Thông thường",
    "nuance": "Dùng để chuyển hướng đề tài cuộc nói chuyện, gác lại chuyện phụ, chuyện đùa để đi thẳng vào trọng tâm cốt lõi.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "Danh từ + はさておき",
        "example": "Danh từ + はさておき"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-wasateoki-1",
        "japanese": "冗談はさておき、本題に入りましょう。",
        "reading": "じょうだん[冗談]はさておき、ほんだい[本題]にはい[入]りましょう。",
        "vietnamese": "Đùa thế đủ rồi gác lại một bên, chúng ta vào chủ đề chính nhé.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-wasateoki-2",
        "japanese": "難しい理論はさておき、まずは実際にやってみることが大切だ。",
        "reading": "むずか[難]しいりろん[理論]はさておき、まずはじっさい[実際]にやってみることがたいせつ[大切]だ。",
        "vietnamese": "Lý thuyết phức tạp gác sang một bên đã, điều quan trọng nhất trước hết là thử thực hành.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "雑談（　）、今日の議題について話し合いましょう。",
      "questionVi": "Tạm gác chuyện... sang một bên, hãy nói về...",
      "options": [
        "はさておき",
        "を問わず",
        "もかまわず",
        "につれて"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Tạm dừng nói chuyện phiếm để bàn công việc: 雑談はさておき."
    }
  },
  {
    "id": "n2-nikagirazu",
    "lessonId": "skz-n2-c3",
    "lessonTitle": "Chương 3: Phạm vi, Bất kể & Không liên quan",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜に限らず",
    "reading": "〜にかぎらず",
    "romaji": "ni kagirazu",
    "level": "N2",
    "category": "Phạm vi & Giới hạn",
    "meaningVi": "Không chỉ riêng... mà còn cả...",
    "structure": "N + に限らず",
    "formality": "Thông thường",
    "nuance": "Mở rộng phạm vi từ đối tượng tiêu biểu A sang toàn thể một nhóm đối tượng rộng hơn B.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "Danh từ + に限らず",
        "example": "Danh từ + に限らず"
      },
      {
        "partOfSpeech": "Thể thông thường",
        "rule": "Vế sau thường có も, 全体, 誰でも...",
        "example": "Vế sau thường có も, 全体, 誰でも..."
      }
    ],
    "examples": [
      {
        "id": "ex-n2-nikagirazu-1",
        "japanese": "アニメは子供に限らず、大人にも広く親しまれている。",
        "reading": "アニメはこども[子供]にかぎ[限]らず、おとな[大人]にもひろ[広]くした[親]しまれている。",
        "vietnamese": "Anime không chỉ dành riêng cho trẻ em mà còn được cả người lớn yêu thích rộng rãi.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-nikagirazu-2",
        "japanese": "最近は男性に限らず、女性も筋トレに励む人が増えている。",
        "reading": "さいきん[最近]はだんせい[男性]にかぎ[限]らず、じょせい[女性]もきんトレにはげ[励]むひと[人]がふ[増]えている。",
        "vietnamese": "Gần đây không riêng gì nam giới, phụ nữ tập thể hình cũng ngày càng nhiều.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "この花は春（　）、一年中咲き続ける。",
      "questionVi": "Không chỉ riêng... mà còn cả...",
      "options": [
        "に限らず",
        "を問わず",
        "もかまわず",
        "はさておき"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Không chỉ mùa xuân mà quanh năm: 春に限らず."
    }
  },
  {
    "id": "n2-nominarazu",
    "lessonId": "skz-n2-c3",
    "lessonTitle": "Chương 3: Phạm vi, Bất kể & Không liên quan",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜のみならず",
    "reading": "〜のみならず",
    "romaji": "nomi narazu",
    "level": "N2",
    "category": "Phạm vi & Giới hạn",
    "meaningVi": "Không chỉ... mà còn... (trang trọng)",
    "structure": "N / Thể thông thường + のみならず",
    "formality": "Trang trọng",
    "nuance": "Dạng văn viết trang trọng tương đương với だけでなく. Vế sau thường có も.",
    "formationRules": [
      {
        "partOfSpeech": "Tính từ đuôi い",
        "rule": "N / V / A-i ở thể thông thường + のみならず",
        "example": "N / V / A-i ở thể thông thường + のみならず"
      },
      {
        "partOfSpeech": "Tính từ đuôi な",
        "rule": "A-na: である / だ + のみならず (hoặc tính từ đuôi な + のみならず)",
        "example": "A-na: である / だ + のみならず (hoặc tính từ đuôi な + のみならず)"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-nominarazu-1",
        "japanese": "環境問題は一国のみならず、地球全体で取り組むべき課題だ。",
        "reading": "かんきょうもんだい[環境問題]はいっこく[一国]のみならず、ちきゅうぜんたい[地球全体]でとりく[取]むべきかだい[課題]だ。",
        "vietnamese": "Vấn đề môi trường không chỉ riêng một quốc gia mà là thách thức toàn cầu cần giải quyết.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-nominarazu-2",
        "japanese": "この携帯電話はデザインが優れているのみならず、機能も充実している。",
        "reading": "このけいたいでんわ[携帯電話]はデザインがすぐ[優]れているのみならず、きのう[機能]もじゅうじつ[充実]している。",
        "vietnamese": "Chiếc điện thoại này không chỉ thiết kế đẹp mắt mà tính năng cũng rất phong phú.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "彼は英語（　）、フランス語や中国語も流暢に話せる。",
      "questionVi": "Không chỉ... mà còn... (trang trọng)",
      "options": [
        "のみならず",
        "を契機に",
        "につれて",
        "はさておき"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Không chỉ tiếng Anh mà cả tiếng Pháp, tiếng Trung: 英語のみならず."
    }
  },
  {
    "id": "n2-omegutte",
    "lessonId": "skz-n2-c4",
    "lessonTitle": "Chương 4: Quan hệ, Đối tượng & Căn cứ",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜をめぐって / をめぐる",
    "reading": "〜をめぐって / をめぐる",
    "romaji": "o megutte / o meguru",
    "level": "N2",
    "category": "Quan hệ & Căn cứ",
    "meaningVi": "Xoay quanh (tranh cãi, bàn luận, tranh chấp...)",
    "structure": "N + をめぐって / をめぐる + N",
    "formality": "Trang trọng",
    "nuance": "Chỉ một chủ đề, đối tượng hoặc vấn đề khiến nhiều người có ý kiến trái chiều, cạnh tranh hoặc xảy ra tranh luận sôi nổi.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "Danh từ + をめぐって (vị ngữ là tranh luận, đối đầu...)",
        "example": "Danh từ + をめぐって (vị ngữ là tranh luận, đối đầu...)"
      },
      {
        "partOfSpeech": "Danh từ",
        "rule": "Danh từ + をめぐる + Danh từ",
        "example": "Danh từ + をめぐる + Danh từ"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-omegutte-1",
        "japanese": "遺産の配分をめぐって、兄弟の間で激しい争いが起こった。",
        "reading": "いさん[遺産]のはいぶん[配分]をめぐって、きょうだい[兄弟]のあいだ[間]ではげ[激]しいあらそ[争]いがお[起]こった。",
        "vietnamese": "Xoay quanh việc phân chia di sản, giữa các anh em đã nổ ra cuộc tranh chấp kịch liệt.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-omegutte-2",
        "japanese": "新空港の建設をめぐる議論は、依然として平行線をたどっている。",
        "reading": "しんくうこう[新空港]のけんせつ[建設]をめぐるぎろん[議論]は、いぜん[依然]としてへいこうせん[平行線]をたどっている。",
        "vietnamese": "Các cuộc thảo luận xoay quanh việc xây dựng sân bay mới vẫn chưa tìm được tiếng nói chung.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "消費税の増税（　）、国会で激しい議論が交わされた。",
      "questionVi": "Xoay quanh (tranh cãi, bàn luận, tranh chấp...)",
      "options": [
        "をめぐって",
        "に基づいて",
        "に沿って",
        "に先立って"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Tranh luận xoay quanh việc tăng thuế tiêu dùng: 増税をめぐって."
    }
  },
  {
    "id": "n2-nimotozuite",
    "lessonId": "skz-n2-c4",
    "lessonTitle": "Chương 4: Quan hệ, Đối tượng & Căn cứ",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜に基づいて / に基づく",
    "reading": "〜にもとづいて / にもとづく",
    "romaji": "ni motozuite / ni motozuku",
    "level": "N2",
    "category": "Quan hệ & Căn cứ",
    "meaningVi": "Dựa trên, căn cứ vào (dữ liệu, sự thật, quy định, kế hoạch)",
    "structure": "N + に基づいて / に基づく + N",
    "formality": "Trang trọng",
    "nuance": "Chỉ hành động được triển khai dựa trên cơ sở nền tảng vững chắc, có thật, có tính pháp lý hoặc tính khoa học.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "Danh từ + に基づいて",
        "example": "Danh từ + に基づいて"
      },
      {
        "partOfSpeech": "Danh từ",
        "rule": "Danh từ + に基づく / に基づいた + N",
        "example": "Danh từ + に基づく / に基づいた + N"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-nimotozuite-1",
        "japanese": "この小説は、実際の事件に基づいて書かれたフィクションです。",
        "reading": "このしょうせつ[小説]は、じっさい[実際]のじけん[事件]にもとづ[基]いてか[書]かれたフィクションです。",
        "vietnamese": "Cuốn tiểu thuyết này là tác phẩm hư cấu được viết dựa trên một sự kiện có thật ngoài đời.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-nimotozuite-2",
        "japanese": "調査データに基づく客観的な分析が求められている。",
        "reading": "ちょうさ[調査]データにもとづ[基]くきゃっかんてき[客観的]なぶんせき[分析]がもと[求]められている。",
        "vietnamese": "Người ta đòi hỏi một sự phân tích khách quan dựa trên số liệu điều tra.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "法律（　）、厳正な処分を行います。",
      "questionVi": "Dựa trên, căn cứ vào (dữ liệu, sự thật, quy định, kế hoạch)",
      "options": [
        "に基づいて",
        "をめぐって",
        "を通して",
        "にわたって"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Căn cứ vào luật pháp để xử lý: 法律に基づいて."
    }
  },
  {
    "id": "n2-nisokushite",
    "lessonId": "skz-n2-c4",
    "lessonTitle": "Chương 4: Quan hệ, Đối tượng & Căn cứ",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜に即して / に即した",
    "reading": "〜にそくして / にそくした",
    "romaji": "ni sokushite / ni sokushita",
    "level": "N2",
    "category": "Quan hệ & Căn cứ",
    "meaningVi": "Tuân theo, bám sát, phù hợp với (thực tế, quy chuẩn, hoàn cảnh)",
    "structure": "N + に即して / に即した + N",
    "formality": "Trang trọng",
    "nuance": "Diễn tả việc bám sát tình hình thực tế, không lý thuyết suông, phù hợp đúng với quy tắc hay thời thế.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "Danh từ (事実, 現実, 時代, 規則) + に即して",
        "example": "Danh từ (事実, 現実, 時代, 規則) + に即して"
      },
      {
        "partOfSpeech": "Danh từ",
        "rule": "N + に即した + N",
        "example": "N + に即した + N"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-nisokushite-1",
        "japanese": "時代の変化に即した新しい教育カリキュラムを導入する。",
        "reading": "じだい[時代]のへんか[変化]にそく[即]したあたら[新]しいきょういく[教育]カリキュラムをどうにゅう[導入]する。",
        "vietnamese": "Đưa vào áp dụng khung chương trình giáo dục mới phù hợp với sự thay đổi của thời đại.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-nisokushite-2",
        "japanese": "現状に即して物事を判断しなければならない。",
        "reading": "げんじょう[現状]にそく[即]してものごと[物事]をはんだん[判断]しなければならない。",
        "vietnamese": "Phải phán đoán mọi sự việc dựa sát vào hiện trạng thực tế.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "事実（　）正確な報道を心がけてください。",
      "questionVi": "Tuân theo, bám sát, phù hợp với (thực tế, quy chuẩn, hoàn cảnh)",
      "options": [
        "に即して",
        "をめぐって",
        "に先立って",
        "を通して"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Bám sát sự thật: 事実に即して."
    }
  },
  {
    "id": "n2-nioujite",
    "lessonId": "skz-n2-c4",
    "lessonTitle": "Chương 4: Quan hệ, Đối tượng & Căn cứ",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜に応じて / に応じた",
    "reading": "〜におうじて / におうちた",
    "romaji": "ni oujite / ni oujita",
    "level": "N2",
    "category": "Quan hệ & Căn cứ",
    "meaningVi": "Tùy theo, tương ứng với, thích ứng với...",
    "structure": "N + に応じて / に応じた + N",
    "formality": "Thông thường",
    "nuance": "Vế sau thay đổi linh hoạt sao cho tương thích với năng lực, nhu cầu, ngân sách hoặc tình huống của vế trước.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "Danh từ + に応じて",
        "example": "Danh từ + に応じて"
      },
      {
        "partOfSpeech": "Danh từ",
        "rule": "Danh từ + に応じた + Danh từ",
        "example": "Danh từ + に応じた + Danh từ"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-nioujite-1",
        "japanese": "お客様のご予算に応じて、最適なプランをご提案いたします。",
        "reading": "おきゃくさま[お客様]のごよさん[予算]におう[応]じて、さいてき[最適]なプランをごていあん[提案]いたします。",
        "vietnamese": "Tùy theo ngân sách của quý khách, chúng tôi sẽ đề xuất gói phù hợp nhất.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-nioujite-2",
        "japanese": "子供の年齢に応じた絵本を選ぶことが大切です。",
        "reading": "こども[子供]のねんれい[年齢]におう[応]じたえほん[絵本]をえら[選]ぶことがたいせつ[大切]です。",
        "vietnamese": "Việc chọn sách tranh phù hợp với lứa tuổi của trẻ là rất quan trọng.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "能力や経験（　）、給与を決定します。",
      "questionVi": "Tùy theo, tương ứng với, thích ứng với...",
      "options": [
        "に応じて",
        "をめぐって",
        "に先立って",
        "に基づいて"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Tùy theo năng lực và kinh nghiệm mà mức lương thay đổi: に応じて."
    }
  },
  {
    "id": "n2-nisotte",
    "lessonId": "skz-n2-c4",
    "lessonTitle": "Chương 4: Quan hệ, Đối tượng & Căn cứ",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜に沿って / に沿った",
    "reading": "〜にそって / にそった",
    "romaji": "ni sotte / ni sotta",
    "level": "N2",
    "category": "Quan hệ & Căn cứ",
    "meaningVi": "Men theo (đường sá, bờ sông) / Tuân theo, bám sát (chủ trương, kế hoạch, kỳ vọng)",
    "structure": "N + に沿って / に沿った + N",
    "formality": "Thông thường",
    "nuance": "Dùng theo cả nghĩa đen (đi dọc theo con đường, bờ biển) và nghĩa bóng (thực hiện chuẩn theo kế hoạch, hướng dẫn đã vạch sẵn).",
    "formationRules": [
      {
        "partOfSpeech": "Thể thông thường",
        "rule": "Địa điểm dài hẹp (川, 通り, 線路) + に沿って",
        "example": "Địa điểm dài hẹp (川, 通り, 線路) + に沿って"
      },
      {
        "partOfSpeech": "Thể thông thường",
        "rule": "Quy chuẩn, lộ trình (計画, 方針, マニュアル) + に沿って",
        "example": "Quy chuẩn, lộ trình (計画, 方針, マニュアル) + に沿って"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-nisotte-1",
        "japanese": "マニュアルに沿って作業を進めれば、ミスを防ぐことができます。",
        "reading": "マニュアルにそ[沿]ってさぎょう[作業]をすす[進]めれば、ミスをふせ[防]ぐことができます。",
        "vietnamese": "Nếu tiến hành công việc tuân theo sách hướng dẫn, bạn có thể ngăn ngừa sai sót.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-nisotte-2",
        "japanese": "川に沿って桜並木が何キロも続いている。",
        "reading": "かわ[川]にそ[沿]ってさくらなみき[桜並木]がなんキロもつづ[続]いている。",
        "vietnamese": "Dọc theo con sông, hàng cây hoa anh đào trải dài hàng cây số.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "政府の基本方針（　）、新しい施策が実施された。",
      "questionVi": "Men theo (đường sá, bờ sông) / Tuân theo, bám sát (chủ trương, kế hoạch, kỳ vọng)",
      "options": [
        "に沿って",
        "をめぐって",
        "に先立ち",
        "を問わず"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Thực hiện theo đúng phương châm cơ bản: 基本方針に沿って."
    }
  },
  {
    "id": "n2-nomotode",
    "lessonId": "skz-n2-c4",
    "lessonTitle": "Chương 4: Quan hệ, Đối tượng & Căn cứ",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜のもとで / のもとに",
    "reading": "〜のもとで / のもとに",
    "romaji": "no moto de / no moto ni",
    "level": "N2",
    "category": "Quan hệ & Căn cứ",
    "meaningVi": "Dưới sự (chỉ đạo, hướng dẫn, tình yêu thương) / Trong điều kiện...",
    "structure": "N + のもとで / のもとに",
    "formality": "Trang trọng",
    "nuance": "Dưới sự bảo trợ, quản lý hoặc ảnh hưởng trực tiếp của ai đó hoặc một nguyên tắc lớn.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "Danh từ chỉ người/ảnh hưởng (指導, 監督, 両親の愛) + のもとで (hành động)",
        "example": "Danh từ chỉ người/ảnh hưởng (指導, 監督, 両親の愛) + のもとで (hành động)"
      },
      {
        "partOfSpeech": "Danh từ",
        "rule": "Danh từ trừu tượng (法の支配, 合意) + のもとに (trạng thái duy trì)",
        "example": "Danh từ trừu tượng (法の支配, 合意) + のもとに (trạng thái duy trì)"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-nomotode-1",
        "japanese": "名監督の熱心な指導のもとで、チームは見事に優勝を果たした。",
        "reading": "めいかんとく[名監督]のねっしん[熱心]なしどう[指導]のもとで、チームはみごと[見事]にゆうしょう[優勝]をは[果]たした。",
        "vietnamese": "Dưới sự chỉ đạo tận tâm của vị huấn luyện viên lừng danh, cả đội đã xuất sắc giành ngôi vô địch.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-nomotode-2",
        "japanese": "子供たちは豊かな自然のもとで、のびのびと育っている。",
        "reading": "こども[子供]たちはゆた[豊]かなしぜん[自然]のもとで、のびのびとそだ[育]っている。",
        "vietnamese": "Lũ trẻ đang lớn lên một cách hồn nhiên, khỏe khoắn dưới bóng mát của thiên nhiên trù phú.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "厳しい訓練（　）、宇宙飛行士たちは精神力を鍛えた。",
      "questionVi": "Dưới sự (chỉ đạo, hướng dẫn, tình yêu thương) / Trong điều kiện...",
      "options": [
        "のもとで",
        "をめぐって",
        "に沿って",
        "を契機に"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Dưới sự rèn luyện khắc nghiệt: 厳しい訓練のもとで."
    }
  },
  {
    "id": "n2-otooshite",
    "lessonId": "skz-n2-c4",
    "lessonTitle": "Chương 4: Quan hệ, Đối tượng & Căn cứ",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜を通して / を通じて",
    "reading": "〜をとおして / をつうじて",
    "romaji": "o tooshite / o tsuujite",
    "level": "N2",
    "category": "Quan hệ & Căn cứ",
    "meaningVi": "Thông qua (trung gian, phương tiện) / Suốt cả (thời kỳ, năm tháng)",
    "structure": "N + を通して / を通じて",
    "formality": "Thông thường",
    "nuance": "Có 2 nghĩa chính: 1) Dùng A làm kênh trung gian để đạt được B; 2) Trải dài liên tục suốt toàn bộ một khoảng thời gian.",
    "formationRules": [
      {
        "partOfSpeech": "Thể thông thường",
        "rule": "Người, phương tiện trung gian + を通して / を通じて",
        "example": "Người, phương tiện trung gian + を通して / を通じて"
      },
      {
        "partOfSpeech": "Thể thông thường",
        "rule": "Thời gian (一年, 四季, 生涯) + を通して / を通じて",
        "example": "Thời gian (一年, 四季, 生涯) + を通して / を通じて"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-otooshite-1",
        "japanese": "共通の趣味を通じて、多くの友人と知り合うことができた。",
        "reading": "きょうつう[共通]のしゅみ[趣味]をつう[通]じて、おお[多]くのゆうじん[友人]とし[知]りあ[合]うことができた。",
        "vietnamese": "Thông qua sở thích chung, tôi đã làm quen được với rất nhiều bạn bè.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-otooshite-2",
        "japanese": "この島は一年を通して温暖な気候に恵まれている。",
        "reading": "このしま[島]はいちねん[一年]をとお[通]して、おんだん[温暖]なきこう[気候]にめぐま[恵]れている。",
        "vietnamese": "Hòn đảo này suốt bốn mùa quanh năm đều được hưởng khí hậu ấm áp.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "知人（　）、現地の詳しい情報を手に入れた。",
      "questionVi": "Thông qua (trung gian, phương tiện) / Suốt cả (thời kỳ, năm tháng)",
      "options": [
        "を通して",
        "をめぐって",
        "に基づいて",
        "に沿って"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Qua người quen làm trung gian: 知人を通して."
    }
  },
  {
    "id": "n2-niwatatte",
    "lessonId": "skz-n2-c4",
    "lessonTitle": "Chương 4: Quan hệ, Đối tượng & Căn cứ",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜にわたって / にわたる",
    "reading": "〜にわたって / にわたる",
    "romaji": "ni watatte / ni wataru",
    "level": "N2",
    "category": "Quan hệ & Căn cứ",
    "meaningVi": "Trải suốt, trải khắp (khoảng thời gian dài hoặc không gian rộng)",
    "structure": "N (thời gian, địa điểm, phạm vi) + にわたって / にわたる + N",
    "formality": "Thông thường",
    "nuance": "Nhấn mạnh quy mô lớn, phạm vi trải rộng hoặc thời gian kéo dài liên miên hơn bình thường.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "Danh từ chỉ lượng thời gian, số lần, khu vực + にわたって",
        "example": "Danh từ chỉ lượng thời gian, số lần, khu vực + にわたって"
      },
      {
        "partOfSpeech": "Danh từ",
        "rule": "N + にわたる + N",
        "example": "N + にわたる + N"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-niwatatte-1",
        "japanese": "台風の影響で、広範囲にわたって停電が発生した。",
        "reading": "たいふう[台風]のえいきょう[影響]で、こうはんい[広範囲]にわたってていでん[停電]がはっせい[発生]した。",
        "vietnamese": "Do ảnh hưởng của bão, sự cố mất điện đã xảy ra trên diện rộng.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-niwatatte-2",
        "japanese": "3日間にわたる議論の末、ようやく合意に達した。",
        "reading": "みっかかん[3日間]にわたるぎろん[議論]のすえ[末]、ようやくごうい[合意]にたっ[達]した。",
        "vietnamese": "Sau cuộc thảo luận kéo dài suốt 3 ngày, cuối cùng hai bên cũng đạt được thỏa thuận.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "10年（　）研究が、ようやく実を結んだ。",
      "questionVi": "Trải suốt, trải khắp (khoảng thời gian dài hoặc không gian rộng)",
      "options": [
        "にわたる",
        "にそった",
        "をめぐる",
        "にもとづく"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Bổ nghĩa cho danh từ 研究 với thời gian dài 10 năm: 10年にわたる研究."
    }
  },
  {
    "id": "n2-nihanshite",
    "lessonId": "skz-n2-c5",
    "lessonTitle": "Chương 5: Đối lập, Nhượng bộ & Tương phản",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜に反して / に反する",
    "reading": "〜にはんして / にはんする",
    "romaji": "ni hanshite / ni hansuru",
    "level": "N2",
    "category": "Đối lập & Tương phản",
    "meaningVi": "Trái ngược với (dự đoán, mong đợi) / Trái với (quy định, pháp luật)",
    "structure": "N + に反して / に反する + N",
    "formality": "Trang trọng",
    "nuance": "Diễn đạt kết quả thực tế đi ngược lại hoàn toàn với dự tính, hy vọng ban đầu, hoặc hành động vi phạm quy chuẩn đạo đức, quy tắc pháp luật.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "Danh từ (予想, 期待, 意図) + に反して",
        "example": "Danh từ (予想, 期待, 意図) + に反して"
      },
      {
        "partOfSpeech": "Danh từ",
        "rule": "Danh từ (規則, 法律, 倫理) + に反して / に反する + N",
        "example": "Danh từ (規則, 法律, 倫理) + に反して / に反する + N"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-nihanshite-1",
        "japanese": "専門家の予想に反して、株価は急激に上昇した。",
        "reading": "せんもんか[専門家]のよそう[予想]にはん[反]して、かぶか[株価]はきゅうげき[急激]にじょうしょう[上昇]した。",
        "vietnamese": "Trái ngược với dự đoán của các chuyên gia, giá cổ phiếu đã tăng vọt.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-nihanshite-2",
        "japanese": "校則に反する行為は厳しく罰せられます。",
        "reading": "こうそく[校則]にはん[反]するこうい[行為]はきび[厳]しくばっ[罰]せられます。",
        "vietnamese": "Hành vi đi ngược lại nội quy nhà trường sẽ bị xử phạt nghiêm khắc.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "親の期待（　）、彼は進学せずに音楽の道を選んだ。",
      "questionVi": "Trái ngược với (dự đoán, mong đợi) / Trái với (quy định, pháp luật)",
      "options": [
        "に反して",
        "に基づいて",
        "に即して",
        "を通して"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Trái với kỳ vọng của cha mẹ: 期待に反して."
    }
  },
  {
    "id": "n2-nihikikae",
    "lessonId": "skz-n2-c5",
    "lessonTitle": "Chương 5: Đối lập, Nhượng bộ & Tương phản",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜に引き換え",
    "reading": "〜にひきかえ",
    "romaji": "ni hikikae",
    "level": "N2",
    "category": "Đối lập & Tương phản",
    "meaningVi": "Trái ngược hẳn với..., so với... thì lại...",
    "structure": "N / Thể thông thường + の + に引き換え",
    "formality": "Trang trọng",
    "nuance": "Đặt hai sự vật, hai con người hoặc hai tình huống vào thế đối chiếu tương phản hoàn toàn, thường mang ý cảm thán, khen chê rõ rệt.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "Danh từ + に引き換え",
        "example": "Danh từ + に引き換え"
      },
      {
        "partOfSpeech": "Tính từ đuôi な",
        "rule": "V / A thể thông thường + のに引き換え (A-na: なのに引き換え)",
        "example": "V / A thể thông thường + のに引き換え (A-na: なのに引き換え)"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-nihikikae-1",
        "japanese": "兄が無口で真面目なのに引き換え、弟は社交的でおしゃべりだ。",
        "reading": "あに[兄]がむくち[無口]でまじめ[真面目]なのにひ[引]きか[換]え、おとうと[弟]はしゃこうてき[社交的]でおしゃべりだ。",
        "vietnamese": "Trái ngược hẳn với người anh ít nói nghiêm túc, cậu em trai lại cởi mở và hay nói.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-nihikikae-2",
        "japanese": "去年の猛暑に引き換え、今年の夏は過ごしやすい涼しさだ。",
        "reading": "きょねん[去年]のもうしょ[猛暑]にひ[引]きか[換]え、ことし[今年]のなつ[夏]はす[過]ごしやすいすず[涼]しさだ。",
        "vietnamese": "Trái ngược hẳn với cái nóng nung nấu năm ngoái, mùa hè năm nay mát mẻ rất dễ chịu.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "前作の大ヒット（　）、今回の映画は興行的に苦戦している。",
      "questionVi": "Trái ngược hẳn với..., so với... thì lại...",
      "options": [
        "に引き換え",
        "に先立ち",
        "に基づいて",
        "に沿って"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Trái ngược hoàn toàn với thành công vang dội của phần trước: 大ヒットに引き換え."
    }
  },
  {
    "id": "n2-ippoude",
    "lessonId": "skz-n2-c5",
    "lessonTitle": "Chương 5: Đối lập, Nhượng bộ & Tương phản",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜一方で",
    "reading": "〜いっぽうで",
    "romaji": "ippou de",
    "level": "N2",
    "category": "Đối lập & Tương phản",
    "meaningVi": "Một mặt thì... nhưng mặt khác lại...",
    "structure": "Thể thông thường + 一方で (A-na: な / である; N: である)",
    "formality": "Thông thường",
    "nuance": "Nêu ra hai khía cạnh cùng tồn tại song song, thường là hai mặt đối lập (tích cực vs tiêu cực, được vs mất) của một vấn đề.",
    "formationRules": [
      {
        "partOfSpeech": "Tính từ đuôi い",
        "rule": "V / A-i / A-na / N thể thông thường + 一方で",
        "example": "V / A-i / A-na / N thể thông thường + 一方で"
      },
      {
        "partOfSpeech": "Tính từ đuôi な",
        "rule": "A-na: な hoặc である + 一方で",
        "example": "A-na: な hoặc である + 一方で"
      },
      {
        "partOfSpeech": "Thể thông thường",
        "rule": "N: である + 一方で",
        "example": "N: である + 一方で"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-ippoude-1",
        "japanese": "都市部で人口が集中する一方で、地方の過疎化が進んでいる。",
        "reading": "としぶ[都市部]でじんこう[人口]がしゅうちゅう[集中]するいっぽう[一方]で、ちほう[地方]のかそか[過疎化]がすす[進]んでいる。",
        "vietnamese": "Trong khi dân số tập trung ở các đô thị thì mặt khác, tình trạng suy giảm dân số ở nông thôn ngày càng trầm trọng.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-ippoude-2",
        "japanese": "彼女は厳しい指導をする一方で、生徒の悩みを親身に聞いてくれる。",
        "reading": "かのじょ[彼女]はきび[厳]しいしどう[指導]をするいっぽう[一方]で、せいと[生徒]のなや[悩]みをしんみ[親身]にき[聞]いてくれる。",
        "vietnamese": "Một mặt cô ấy hướng dẫn rất nghiêm khắc, nhưng mặt khác cô lại luôn ân cần lắng nghe tâm sự của học sinh.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "便利になる（　）、人間関係が希薄になっていく。",
      "questionVi": "Một mặt thì... nhưng mặt khác lại...",
      "options": [
        "一方で",
        "反して",
        "契機に",
        "最中に"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Một mặt thì tiện lợi, mặt khác quan hệ lại mờ nhạt: 一方で."
    }
  },
  {
    "id": "n2-hanmen",
    "lessonId": "skz-n2-c5",
    "lessonTitle": "Chương 5: Đối lập, Nhượng bộ & Tương phản",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜反面",
    "reading": "〜はんめん",
    "romaji": "hanmen",
    "level": "N2",
    "category": "Đối lập & Tương phản",
    "meaningVi": "Ngược lại, mặt trái lại là...",
    "structure": "Thể thông thường + 反面 (A-na: な / である; N: である)",
    "formality": "Thông thường",
    "nuance": "Chỉ hai mặt đối lập cùng tồn tại bên trong một bản chất sự vật (con dao hai lưỡi: có lợi thế nhưng đi kèm bất lợi).",
    "formationRules": [
      {
        "partOfSpeech": "Tính từ đuôi い",
        "rule": "V / A-i thể từ điển + 反面",
        "example": "V / A-i thể từ điển + 反面"
      },
      {
        "partOfSpeech": "Tính từ đuôi な",
        "rule": "A-na + な / である + 反面",
        "example": "A-na + な / である + 反面"
      },
      {
        "partOfSpeech": "Danh từ",
        "rule": "N + である + 反面",
        "example": "N + である + 反面"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-hanmen-1",
        "japanese": "ネット通販は便利な反面、実物を確認できないというデメリットがある。",
        "reading": "ネットつうはん[通販]はべんり[便利]なはんめん[反面]、じつぶつ[実物]をかくにん[確認]できないというデメリットがある。",
        "vietnamese": "Mua sắm trực tuyến tuy tiện lợi nhưng ngược lại, nó có nhược điểm là không kiểm tra được hiện vật.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-hanmen-2",
        "japanese": "彼は一人で何でもこなせる反面、他人に頼るのが苦手だ。",
        "reading": "かれ[彼]はひとり[一人]でなん[何]でもこなせるはんめん[反面]、たにん[他人]にたよ[頼]るのがにがて[苦手]だ。",
        "vietnamese": "Anh ấy một mình quán xuyến được mọi việc nhưng ngược lại, anh ấy rất dở trong việc nhờ vả người khác.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "薬は病気を治す（　）、副作用を伴うこともある。",
      "questionVi": "Ngược lại, mặt trái lại là...",
      "options": [
        "反面",
        "に反して",
        "に引き換え",
        "ながら"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Thuốc chữa được bệnh nhưng mặt trái là có tác dụng phụ: 反面."
    }
  },
  {
    "id": "n2-nimokakawarazu",
    "lessonId": "skz-n2-c5",
    "lessonTitle": "Chương 5: Đối lập, Nhượng bộ & Tương phản",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜にもかかわらず",
    "reading": "〜にもかかわらず",
    "romaji": "ni mo kakawarazu",
    "level": "N2",
    "category": "Đối lập & Tương phản",
    "meaningVi": "Mặc dù... nhưng (bất ngờ, ngoài dự kiến)",
    "structure": "Thể thông thường / N / A-na + である + にもかかわらず",
    "formality": "Trang trọng",
    "nuance": "Diễn đạt việc kết quả thực tế hoàn toàn trái ngược với lẽ đương nhiên phải xảy ra từ tiền đề phía trước, thường thể hiện sự kinh ngạc, bất bình hoặc khâm phục.",
    "formationRules": [
      {
        "partOfSpeech": "Tính từ đuôi い",
        "rule": "V / A-i thể thông thường + にもかかわらず",
        "example": "V / A-i thể thông thường + にもかかわらず"
      },
      {
        "partOfSpeech": "Tính từ đuôi な",
        "rule": "N / A-na + (である) + にもかかわらず",
        "example": "N / A-na + (である) + にもかかわらず"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-nimokakawarazu-1",
        "japanese": "大雨にもかかわらず、多くの観客がスタジアムに集まった。",
        "reading": "おおあめ[大雨]にもかかわらず、おお[多]くのかんきゃく[観客]がスタジアムにあつま[集]まった。",
        "vietnamese": "Mặc cho trời mưa to, rất đông khán giả vẫn đổ về sân vận động.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-nimokakawarazu-2",
        "japanese": "何度も注意したにもかかわらず、彼は同じ間違いを繰り返した。",
        "reading": "なんど[何度]もちゅうい[注意]したにもかかわらず、かれ[彼]はおな[同]じまちが[間違]いをくりかえ[繰返]した。",
        "vietnamese": "Mặc dù đã nhắc nhở bao nhiêu lần, anh ta vẫn lặp lại lỗi cũ.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "彼は高熱がある（　）、無理をして出社した。",
      "questionVi": "Mặc dù... nhưng (bất ngờ, ngoài dự kiến)",
      "options": [
        "にもかかわらず",
        "に引き換え",
        "反面",
        "に限らず"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Mặc dù bị sốt cao nhưng vẫn cố đi làm: にもかかわらず."
    }
  },
  {
    "id": "n2-kuseni",
    "lessonId": "skz-n2-c5",
    "lessonTitle": "Chương 5: Đối lập, Nhượng bộ & Tương phản",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜くせに",
    "reading": "〜くせに",
    "romaji": "kuse ni",
    "level": "N2",
    "category": "Đối lập & Tương phản",
    "meaningVi": "Thế mà, vậy mà... (mang hàm ý trách móc, mỉa mai, khinh khi)",
    "structure": "Thể thông thường + くせに (A-na: な; N: の)",
    "formality": "Thông thường",
    "nuance": "Giống のに nhưng mang cảm xúc tiêu cực rõ rệt, chỉ trích hành vi mâu thuẫn của đối phương. Hai vế câu bắt buộc phải cùng một chủ ngữ.",
    "formationRules": [
      {
        "partOfSpeech": "Tính từ đuôi い",
        "rule": "V / A-i thể thông thường + くせに",
        "example": "V / A-i thể thông thường + くせに"
      },
      {
        "partOfSpeech": "Tính từ đuôi な",
        "rule": "A-na + な + くせに",
        "example": "A-na + な + くせに"
      },
      {
        "partOfSpeech": "Danh từ",
        "rule": "N + の + くせに",
        "example": "N + の + くせに"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-kuseni-1",
        "japanese": "自分では何もしないくせに、人の文句ばかり言う。",
        "reading": "じぶん[自分]ではなに[何]もしないくせに、ひと[人]のもんく[文句]ばかりい[言]う。",
        "vietnamese": "Bản thân thì chẳng làm cái gì, thế mà suốt ngày chỉ biết cằn nhằn người khác.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-kuseni-2",
        "japanese": "お金がないと言っているくせに、高い服ばかり買っている。",
        "reading": "おかね[金]がないとい[言]っているくせに、たか[高]いふく[服]ばかりか[買]っている。",
        "vietnamese": "Miệng thì bảo không có tiền, thế mà toàn sắm quần áo đắt tiền.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "子供（　）、大人のような口をきく。",
      "questionVi": "Thế mà, vậy mà... (mang hàm ý trách móc, mỉa mai, khinh khi)",
      "options": [
        "のくせに",
        "くせに",
        "なくせに",
        "であるくせに"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Danh từ + の + くせに: 子供のくせに (chỉ là con nít thế mà...)."
    }
  },
  {
    "id": "n2-karatoitte",
    "lessonId": "skz-n2-c5",
    "lessonTitle": "Chương 5: Đối lập, Nhượng bộ & Tương phản",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜からといって",
    "reading": "〜からといって",
    "romaji": "kara to itte",
    "level": "N2",
    "category": "Đối lập & Tương phản",
    "meaningVi": "Chỉ vì... mà (không hẳn là / không được phép...)",
    "structure": "Thể thông thường + からといって + vế sau phủ định",
    "formality": "Thông thường",
    "nuance": "Bác bỏ quan điểm cho rằng vế trước là lý do duy nhất hay chính đáng để dẫn tới kết luận ở vế sau. Vế sau thường đi kèm わけではない, とは限らない, べきではない.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "V / A / N thể thông thường + からといって",
        "example": "V / A / N thể thông thường + からといって"
      },
      {
        "partOfSpeech": "Thể thông thường",
        "rule": "Vế sau thường là dạng phủ định một phần",
        "example": "Vế sau thường là dạng phủ định một phần"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-karatoitte-1",
        "japanese": "日本に長く住んでいるからといって、日本語がペラペラになるとは限らない。",
        "reading": "にほん[日本]になが[長]くす[住]んでいるからといって、にほんご[日本語]がペラペラになるとはかぎ[限]らない。",
        "vietnamese": "Chỉ vì sống lâu ở Nhật không có nghĩa là tiếng Nhật sẽ tự động trôi chảy.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-karatoitte-2",
        "japanese": "忙しいからといって、朝食を抜くのは健康によくない。",
        "reading": "いそが[忙]しいからといって、ちょうしょく[朝食]をぬ[抜]くのはけんこう[健康]によくない。",
        "vietnamese": "Dẫu có bận rộn đi chăng nữa, việc bỏ bữa sáng cũng không hề tốt cho sức khỏe.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "お金持ちだからといって、必ずしも幸せだ（　）。",
      "questionVi": "Chỉ vì... mà (không hẳn là / không được phép...)",
      "options": [
        "とは限らない",
        "に決まっている",
        "にすぎない",
        "反面だ"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "からといって thường đi đôi với とは限らない (chưa chắc đã...)."
    }
  },
  {
    "id": "n2-naikotoniwa",
    "lessonId": "skz-n2-c6",
    "lessonTitle": "Chương 6: Điều kiện khắc nghiệt & Giả định cực đoan",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜ないことには",
    "reading": "〜ないことには",
    "romaji": "nai koto ni wa",
    "level": "N2",
    "category": "Điều kiện & Giả định",
    "meaningVi": "Nếu không... thì không thể...",
    "structure": "V-nai / A-i (くない) / A-na (でない) + ことには",
    "formality": "Thông thường",
    "nuance": "Điều kiện cần thiết tiên quyết. Nếu vế A không hoàn thành thì vế B chắc chắn không thể tiến hành hay đạt được.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "Động từ thể ない + ことには",
        "example": "Động từ thể ない + ことには"
      },
      {
        "partOfSpeech": "Thể thông thường",
        "rule": "Vế sau hầu như luôn mang dạng phủ định (できない, 分からない...)",
        "example": "Vế sau hầu như luôn mang dạng phủ định (できない, 分からない...)"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-naikotoniwa-1",
        "japanese": "実際に会って話してみないことには、信用できる人物かわからない。",
        "reading": "じっさい[実際]にあ[会]ってはな[話]してみないことには、しんよう[信用]できるじんぶつ[人物]かわからない。",
        "vietnamese": "Nếu chưa gặp trực tiếp để trò chuyện thì không thể biết được đó có phải người đáng tin hay không.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-naikotoniwa-2",
        "japanese": "予算が決まらないことには、計画を進めようがない。",
        "reading": "よさん[予算]がき[決]まらないことには、けいかく[計画]をすす[進]めようがない。",
        "vietnamese": "Nếu ngân sách chưa được phê duyệt thì chẳng có cách nào xúc tiến kế hoạch.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "本人の意見を（　）ことには、判断を下せない。",
      "questionVi": "Nếu không... thì không thể...",
      "options": [
        "聞かない",
        "聞いた",
        "聞く",
        "聞けば"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Cấu trúc: V-nai + ことには -> 聞かないことには."
    }
  },
  {
    "id": "n2-mononara",
    "lessonId": "skz-n2-c6",
    "lessonTitle": "Chương 6: Điều kiện khắc nghiệt & Giả định cực đoan",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜ものなら",
    "reading": "〜ものなら",
    "romaji": "mono nara",
    "level": "N2",
    "category": "Điều kiện & Giả định",
    "meaningVi": "Nếu có thể... (thì muốn làm) / Nếu lỡ làm... (thì hậu quả nguy hiểm)",
    "structure": "V-khả năng + ものなら (ước muốn) / V-ru + ものなら (hậu quả tiêu cực)",
    "formality": "Thông thường",
    "nuance": "1) Đi với thể khả năng: ước muốn làm một việc gần như bất khả thi trong hiện thực; 2) Đi với V thường: cảnh báo hậu quả nghiêm trọng nếu lỡ làm điều sai trái.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-kanou + ものなら: ước muốn khó thành (戻れるものなら)",
        "example": "V-kanou + ものなら: ước muốn khó thành (戻れるものなら)"
      },
      {
        "partOfSpeech": "Động từ",
        "rule": "V-ru / V-you + ものなら: cảnh báo rủi ro cao",
        "example": "V-ru / V-you + ものなら: cảnh báo rủi ro cao"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-mononara-1",
        "japanese": "やり直せるものなら、人生をもう一度最初からやり直したい。",
        "reading": "やりなお[直]せるものなら、じんせい[人生]をもういちど[一度]さいしょ[最初]からやりなお[直]したい。",
        "vietnamese": "Nếu có thể làm lại được, tôi muốn làm lại cuộc đời mình từ điểm xuất phát một lần nữa.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-mononara-2",
        "japanese": "授業中に居眠りでもしようものなら、先生に怒鳴られる。",
        "reading": "じゅぎょうちゅう[授業中]にいねむ[居眠]りでもしようものなら、せんせい[先生]にどな[怒鳴]られる。",
        "vietnamese": "Nếu mà lỡ ngủ gật trong giờ học thì sẽ bị thầy quát mắng ngay.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "昔の自分に手紙を（　）ものなら、送りたい。",
      "questionVi": "Nếu có thể... (thì muốn làm) / Nếu lỡ làm... (thì hậu quả nguy hiểm)",
      "options": [
        "送れる",
        "送る",
        "送った",
        "送れば"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Ước muốn điều bất khả thi: V thể khả năng (送れる) + ものなら."
    }
  },
  {
    "id": "n2-youmononara",
    "lessonId": "skz-n2-c6",
    "lessonTitle": "Chương 6: Điều kiện khắc nghiệt & Giả định cực đoan",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜ようものなら",
    "reading": "〜ようものなら",
    "romaji": "you mono nara",
    "level": "N2",
    "category": "Điều kiện & Giả định",
    "meaningVi": "Nếu mà lỡ..., giả sử mà... (thì sẽ xảy ra chuyện tồi tệ)",
    "structure": "V-you (thể ý chí) + ものなら",
    "formality": "Thông thường",
    "nuance": "Nhấn mạnh giả định tình huống tiêu cực. 'Chỉ cần hơi chệch hướng hay lỡ xảy ra việc ấy thì hậu quả sẽ vô cùng tai hại'.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "Động từ thể ý chí (V-you) + ものなら",
        "example": "Động từ thể ý chí (V-you) + ものなら"
      },
      {
        "partOfSpeech": "Thể thông thường",
        "rule": "Vế sau luôn là tình huống nghiêm trọng, bị mắng hoặc thảm họa",
        "example": "Vế sau luôn là tình huống nghiêm trọng, bị mắng hoặc thảm họa"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-youmononara-1",
        "japanese": "締め切りに遅れようものなら、信用を完全に失ってしまう。",
        "reading": "しめき[締切]りにおく[遅]れようものなら、しんよう[信用]をかんぜん[完全]にうしな[失]ってしまう。",
        "vietnamese": "Nếu mà lỡ nộp muộn hạn chót thì sẽ đánh mất hoàn toàn uy tín.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-youmononara-2",
        "japanese": "秘密を漏らそうものなら、ただでは済まないぞ。",
        "reading": "ひみつ[秘密]をも[漏]らそうものなら、ただではす[済]まないぞ。",
        "vietnamese": "Nếu mà dám để lộ bí mật ra ngoài thì không yên với tôi đâu đấy!",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "社長の意見に反対（　）ものなら、クビになりかねない。",
      "questionVi": "Nếu mà lỡ..., giả sử mà... (thì sẽ xảy ra chuyện tồi tệ)",
      "options": [
        "しよう",
        "する",
        "した",
        "すれば"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "V-you + ものなら: 反対しようものなら."
    }
  },
  {
    "id": "n2-nitsuke",
    "lessonId": "skz-n2-c6",
    "lessonTitle": "Chương 6: Điều kiện khắc nghiệt & Giả định cực đoan",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜につけ / につけても",
    "reading": "〜につけ / につけても",
    "romaji": "ni tsuke / ni tsukete mo",
    "level": "N2",
    "category": "Điều kiện & Giả định",
    "meaningVi": "Hễ mỗi lần... là lại... / Cho dù... hay...",
    "structure": "V-ru / N + につけ",
    "formality": "Trang trọng",
    "nuance": "1) Cứ mỗi lần nhìn/nghe/chứng kiến sự việc đó thì một cảm xúc quen thuộc lại tự nhiên ùa về; 2) Dạng AにつけBにつけ: cho dù là trong cảnh A hay cảnh B.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V thể từ điển (V-ru) + につけ (見るにつけ, 聞くにつけ)",
        "example": "V thể từ điển (V-ru) + につけ (見るにつけ, 聞くにつけ)"
      },
      {
        "partOfSpeech": "Thể thông thường",
        "rule": "AにつけBにつけ: cặp đối lập (良いにつけ悪いにつけ)",
        "example": "AにつけBにつけ: cặp đối lập (良いにつけ悪いにつけ)"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-nitsuke-1",
        "japanese": "故郷の風景を見るにつけ、母の優しい笑顔を思い出す。",
        "reading": "こきょう[故郷]のふうけい[風景]をみ[見]るにつけ、はは[母]のやさ[優]しいえがお[笑顔]をおも[思]いだ[出]す。",
        "vietnamese": "Hễ mỗi lần ngắm nhìn phong cảnh quê nhà, tôi lại nhớ đến nụ cười hiền hậu của mẹ.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-nitsuke-2",
        "japanese": "嬉しいにつけ悲しいにつけ、彼女はいつも日記をつけている。",
        "reading": "うれ[嬉]しいにつけかな[悲]しいにつけ、かのじょ[彼女]はいつもにっき[日記]をつけている。",
        "vietnamese": "Dù vui hay buồn, cô ấy đều đều đặn ghi nhật ký.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "この曲を（　）につけ、学生時代の青春を思い返す。",
      "questionVi": "Hễ mỗi lần... là lại... / Cho dù... hay...",
      "options": [
        "聴く",
        "聴いた",
        "聴いて",
        "聴こう"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Động từ thể từ điển: 聴くにつけ (mỗi lần nghe lại nhớ...)."
    }
  },
  {
    "id": "n2-nishiro",
    "lessonId": "skz-n2-c6",
    "lessonTitle": "Chương 6: Điều kiện khắc nghiệt & Giả định cực đoan",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜にしろ / にせよ",
    "reading": "〜にしろ / にせよ",
    "romaji": "ni shiro / ni seyo",
    "level": "N2",
    "category": "Điều kiện & Giả định",
    "meaningVi": "Cho dù là... hay là... / Dẫu có thế nào chăng nữa",
    "structure": "Thể thông thường / N + にしろ(〜にしろ) / にせよ(〜にせよ)",
    "formality": "Trang trọng",
    "nuance": "Đưa ra các ví dụ hoặc giả định để khẳng định: dù rơi vào trường hợp nào đi nữa thì phán đoán hay nghĩa vụ ở vế sau vẫn giữ nguyên.",
    "formationRules": [
      {
        "partOfSpeech": "Thể thông thường",
        "rule": "Thể thông thường (hoặc N) + にしろ / にせよ",
        "example": "Thể thông thường (hoặc N) + にしろ / にせよ"
      },
      {
        "partOfSpeech": "Thể thông thường",
        "rule": "AにしろBにしろ: dù là A hay B",
        "example": "AにしろBにしろ: dù là A hay B"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-nishiro-1",
        "japanese": "行くにしろ行かないにしろ、前日までに返事をしてください。",
        "reading": "い[行]くにしろい[行]かないにしろ、ぜんじつ[前日]までにへんじ[返事]をしてください。",
        "vietnamese": "Dù có đi hay không đi thì xin hãy trả lời trước ngày diễn ra.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-nishiro-2",
        "japanese": "どんな理由があるにせよ、嘘をつくのは良くない。",
        "reading": "どんなりゆう[理由]があるにせよ、うそ[嘘]をつくのはよ[良]くない。",
        "vietnamese": "Dẫu cho có bất kỳ lý do gì chăng nữa, việc nói dối cũng không phải điều tốt.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "賛成（　）反対にしろ、自分の意見を明確に述べるべきだ。",
      "questionVi": "Cho dù là... hay là... / Dẫu có thế nào chăng nữa",
      "options": [
        "にしろ",
        "にして",
        "にせよと",
        "について"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Cặp song hành: 賛成にしろ反対にしろ."
    }
  },
  {
    "id": "n2-toshitara",
    "lessonId": "skz-n2-c6",
    "lessonTitle": "Chương 6: Điều kiện khắc nghiệt & Giả định cực đoan",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜としたら / とすれば",
    "reading": "〜としたら / とすれば",
    "romaji": "to shitara / to sureba",
    "level": "N2",
    "category": "Điều kiện & Giả định",
    "meaningVi": "Giả sử như là..., nếu đúng là...",
    "structure": "Thể thông thường + としたら / とすれば",
    "formality": "Thông thường",
    "nuance": "Đặt ra một giả định có căn cứ hoặc tưởng tượng một kịch bản giả định để từ đó đưa ra suy đoán hay giải pháp tiếp theo.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "V / A / N thể thông thường + としたら / とすれば",
        "example": "V / A / N thể thông thường + としたら / とすれば"
      },
      {
        "partOfSpeech": "Tính từ đuôi な",
        "rule": "N / A-na có thể kết hợp trực tiếp hoặc dùng だ",
        "example": "N / A-na có thể kết hợp trực tiếp hoặc dùng だ"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-toshitara-1",
        "japanese": "もし生まれ変わることができるとしたら、鳥になって空を飛びたい。",
        "reading": "もしうま[生]れかわ[変]ることができるとしたら、とり[鳥]になってそら[空]をと[飛]びたい。",
        "vietnamese": "Giả sử nếu có thể được tái sinh, tôi muốn trở thành một chú chim bay lượn trên bầu trời.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-toshitara-2",
        "japanese": "その噂が本当だとすれば、大変な事態になる。",
        "reading": "そのうわさ[噂]がほんとう[本当]だとすれば、たいへん[大変]なじたい[事態]になる。",
        "vietnamese": "Nếu đúng tin đồn đó là sự thật thì tình hình sẽ trở nên vô cùng nghiêm trọng.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "宝くじで3億円当たった（　）、何に使いますか。",
      "questionVi": "Giả sử như là..., nếu đúng là...",
      "options": [
        "としたら",
        "につけ",
        "にしろ",
        "ものなら"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Giả định tưởng tượng trúng số: 当たったとしたら."
    }
  },
  {
    "id": "n2-toshitemo",
    "lessonId": "skz-n2-c6",
    "lessonTitle": "Chương 6: Điều kiện khắc nghiệt & Giả định cực đoan",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜としても",
    "reading": "〜としても",
    "romaji": "to shitemo",
    "level": "N2",
    "category": "Điều kiện & Giả định",
    "meaningVi": "Dẫu cho là... đi chăng nữa thì...",
    "structure": "Thể thông thường + としても",
    "formality": "Thông thường",
    "nuance": "Thừa nhận khả năng hoặc giả định xảy ra việc ở vế A, nhưng khẳng định điều đó không làm thay đổi bản chất hay phán đoán ở vế B.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "V / A / N thể thông thường + としても",
        "example": "V / A / N thể thông thường + としても"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-toshitemo-1",
        "japanese": "たとえ失敗したとしても、挑戦したこと自体に意味がある。",
        "reading": "たとえしっぱい[失敗]したとしても、ちょうせん[挑戦]したことじたい[自体]にいみ[意味]がある。",
        "vietnamese": "Dẫu cho có thất bại đi chăng nữa, bản thân việc đã dám dấn thân thử thách cũng đã mang ý nghĩa rồi.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-toshitemo-2",
        "japanese": "今すぐ出発したとしても、終電には間に合わないだろう。",
        "reading": "いま[今]すぐしゅっぱつ[出発]したとしても、しゅうでん[終電]にはま[間]にあ[合]わないだろう。",
        "vietnamese": "Dẫu cho có khởi hành ngay bây giờ chăng nữa thì chắc cũng không kịp chuyến tàu cuối.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "仮に謝ってきた（　）、許すつもりはない。",
      "questionVi": "Dẫu cho là... đi chăng nữa thì...",
      "options": [
        "としても",
        "としたら",
        "につけ",
        "ものなら"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Dù cho người đó có xin lỗi đi chăng nữa: 謝ってきたとしても."
    }
  },
  {
    "id": "n2-nisouinai",
    "lessonId": "skz-n2-c7",
    "lessonTitle": "Chương 7: Phán đoán chắc chắn, Đánh giá & Giới hạn",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜に相違ない",
    "reading": "〜にそういない",
    "romaji": "ni souinai",
    "level": "N2",
    "category": "Phán đoán & Đánh giá",
    "meaningVi": "Chắc chắn là, không thể sai vào đâu được",
    "structure": "Thể thông thường / N / A-na (bỏ だ) + に相違ない",
    "formality": "Trang trọng",
    "nuance": "Sự khẳng định đanh thép, chắc chắn dựa trên bằng chứng, suy luận xác đáng. Trang trọng hơn に違いない.",
    "formationRules": [
      {
        "partOfSpeech": "Tính từ đuôi い",
        "rule": "V / A-i thể thông thường + に相違ない",
        "example": "V / A-i thể thông thường + に相違ない"
      },
      {
        "partOfSpeech": "Tính từ đuôi な",
        "rule": "N / A-na gắn trực tiếp (hoặc である) + に相違ない",
        "example": "N / A-na gắn trực tiếp (hoặc である) + に相違ない"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-nisouinai-1",
        "japanese": "目撃者の証言からして、犯人はあの男に相違ない。",
        "reading": "もくげきしゃ[目撃者]のしょうげん[証言]からして、はんにん[犯人]はあのをとこ[男]にそうい[相違]ない。",
        "vietnamese": "Căn cứ theo lời khai của nhân chứng, thủ phạm chắc chắn chính là gã đàn ông đó.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-nisouinai-2",
        "japanese": "これだけの努力を重ねたのだから、彼は成功するに相違ない。",
        "reading": "これだけのどりょく[努力]をかさ[重]ねたのだから、かれ[彼]はせいこう[成功]するにそうい[相違]ない。",
        "vietnamese": "Đã nỗ lực đến nhường này thì anh ấy chắc chắn sẽ thành công thôi.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "現場に残された指紋から、彼が侵入者に（　）。",
      "questionVi": "Chắc chắn là, không thể sai vào đâu được",
      "options": [
        "相違ない",
        "決まっている",
        "っこない",
        "わけがない"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Căn cứ dấu vân tay để khẳng định trang trọng: 侵入者に相違ない."
    }
  },
  {
    "id": "n2-nikimatteiru",
    "lessonId": "skz-n2-c7",
    "lessonTitle": "Chương 7: Phán đoán chắc chắn, Đánh giá & Giới hạn",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜に決まっている",
    "reading": "〜にきまっている",
    "romaji": "ni kimatte iru",
    "level": "N2",
    "category": "Phán đoán & Đánh giá",
    "meaningVi": "Chắc chắn là, nhất định là (phán đoán chủ quan)",
    "structure": "Thể thông thường / N / A-na (bỏ だ) + に決まっている",
    "formality": "Thông thường",
    "nuance": "Thể hiện sự tin tưởng tuyệt đối của người nói theo trực giác hoặc lý lẽ thông thường, mang màu sắc chủ quan, quả quyết.",
    "formationRules": [
      {
        "partOfSpeech": "Tính từ đuôi い",
        "rule": "V / A-i thể thông thường + に決まっている",
        "example": "V / A-i thể thông thường + に決まっている"
      },
      {
        "partOfSpeech": "Tính từ đuôi な",
        "rule": "N / A-na (bỏ だ) + に決まっている",
        "example": "N / A-na (bỏ だ) + に決まっている"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-nikimatteiru-1",
        "japanese": "そんな甘い儲け話は、詐欺に決まっている。",
        "reading": "そんなあま[甘]いもう[儲]けばなし[話]は、さぎ[詐欺]にき[決]まっている。",
        "vietnamese": "Kèo kiếm tiền dễ dàng như thế chắc chắn là lừa đảo rồi.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-nikimatteiru-2",
        "japanese": "練習もしないで試合に勝てるわけがない、負けるに決まっている。",
        "reading": "れんしゅう[練習]もしないでしあい[試合]にか[勝]てるわけがない、ま[負]けるにき[決]まっている。",
        "vietnamese": "Không chịu luyện tập thì làm sao thắng trận được, chắc chắn sẽ thua thôi.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "あんなに一生懸命勉強したんだから、合格する（　）。",
      "questionVi": "Chắc chắn là, nhất định là (phán đoán chủ quan)",
      "options": [
        "に決まっている",
        "っこない",
        "にすぎない",
        "どころではない"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Quả quyết tin tưởng sẽ đỗ: 合格するに決まっている."
    }
  },
  {
    "id": "n2-kkonai",
    "lessonId": "skz-n2-c7",
    "lessonTitle": "Chương 7: Phán đoán chắc chắn, Đánh giá & Giới hạn",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜っこない",
    "reading": "〜っこない",
    "romaji": "kkonai",
    "level": "N2",
    "category": "Phán đoán & Đánh giá",
    "meaningVi": "Tuyệt đối không thể nào, làm sao mà... được",
    "structure": "V-masu (bỏ ます) + っこない",
    "formality": "Thông thường",
    "nuance": "Khẩu ngữ nhấn mạnh sự phủ định tuyệt đối đối với khả năng xảy ra của một sự việc. Tương đương với 絶対に〜できるわけがない.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "Động từ thể ます bỏ ます + っこない",
        "example": "Động từ thể ます bỏ ます + っこない"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-kkonai-1",
        "japanese": "こんなに分厚い本を、たった一日で全部読めっこないよ。",
        "reading": "こんなにぶあつ[分厚]いほん[本]を、たったいちにち[一日]でぜんぶ[全部]よ[読]めっこないよ。",
        "vietnamese": "Cuốn sách dày cộm thế này làm sao mà đọc hết sạch trong vòng một ngày được!",
        "highlightWords": []
      },
      {
        "id": "ex-n2-kkonai-2",
        "japanese": "走ったって、今からじゃ電車に間に合いっこない。",
        "reading": "はし[走]ったって、いま[今]からじゃでんしゃ[電車]にま[間]にあ[合]いっこない。",
        "vietnamese": "Dù có chạy thục mạng đi nữa thì từ giờ đến đó làm sao mà kịp tàu được!",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "こんな難しい問題、小学生に（　）っこない。",
      "questionVi": "Tuyệt đối không thể nào, làm sao mà... được",
      "options": [
        "解け",
        "解く",
        "解いて",
        "解けた"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "V-masu bỏ ます: 解けます -> 解け + っこない."
    }
  },
  {
    "id": "n2-wakeganai",
    "lessonId": "skz-n2-c7",
    "lessonTitle": "Chương 7: Phán đoán chắc chắn, Đánh giá & Giới hạn",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜わけがない",
    "reading": "〜わけがない",
    "romaji": "wake ga nai",
    "level": "N2",
    "category": "Phán đoán & Đánh giá",
    "meaningVi": "Tuyệt đối không có lý nào, làm sao mà... được",
    "structure": "Thể thông thường + わけがない (A-na: な; N: の)",
    "formality": "Thông thường",
    "nuance": "Bác bỏ kịch liệt khả năng xảy ra của sự việc dựa trên lý lẽ, logic rõ ràng. Tương tự はずがない.",
    "formationRules": [
      {
        "partOfSpeech": "Tính từ đuôi い",
        "rule": "V / A-i thể thông thường + わけがない",
        "example": "V / A-i thể thông thường + わけがない"
      },
      {
        "partOfSpeech": "Tính từ đuôi な",
        "rule": "A-na + な + わけがない",
        "example": "A-na + な + わけがない"
      },
      {
        "partOfSpeech": "Danh từ",
        "rule": "N + の + わけがない",
        "example": "N + の + わけがない"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-wakeganai-1",
        "japanese": "誠実な彼が、仲間を裏切るわけがない。",
        "reading": "せいじつ[誠実]なかれ[彼]が、なかま[仲間]をうらぎ[裏切]るわけがない。",
        "vietnamese": "Một người chân thành như anh ấy làm sao có lý nào phản bội đồng đội được.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-wakeganai-2",
        "japanese": "こんなに簡単な計算、間違えるわけがありません。",
        "reading": "こんなにかんたん[簡単]なけいさん[計算]、まちが[間違]えるわけがありません。",
        "vietnamese": "Phép tính đơn giản nhường này, tuyệt đối không lý nào tôi lại tính sai được.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "彼がそんな重大な秘密を（　）わけがない。",
      "questionVi": "Tuyệt đối không có lý nào, làm sao mà... được",
      "options": [
        "知っている",
        "知って",
        "知れば",
        "知ろう"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Thể thông thường + わけがない: 知っているわけがない."
    }
  },
  {
    "id": "n2-wakedewanai",
    "lessonId": "skz-n2-c7",
    "lessonTitle": "Chương 7: Phán đoán chắc chắn, Đánh giá & Giới hạn",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜わけではない",
    "reading": "〜わけではない",
    "romaji": "wake dewa nai",
    "level": "N2",
    "category": "Phán đoán & Đánh giá",
    "meaningVi": "Không hẳn là, không có nghĩa là...",
    "structure": "Thể thông thường + わけではない (A-na: な; N: の/である)",
    "formality": "Thông thường",
    "nuance": "Phủ định một phần nhận định hay định kiến của đối phương. Tránh lối nói tuyệt đối hóa.",
    "formationRules": [
      {
        "partOfSpeech": "Tính từ đuôi い",
        "rule": "V / A-i thể thông thường + わけではない",
        "example": "V / A-i thể thông thường + わけではない"
      },
      {
        "partOfSpeech": "Tính từ đuôi な",
        "rule": "A-na + な + わけではない",
        "example": "A-na + な + わけではない"
      },
      {
        "partOfSpeech": "Danh từ",
        "rule": "N + である / の + わけではない",
        "example": "N + である / の + わけではない"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-wakedewanai-1",
        "japanese": "辛い食べ物が嫌いなわけではないが、あまり得意ではない。",
        "reading": "から[辛]い た[食]べもの[物]がきら[嫌]いなわけではないが、あまりとくい[得意]ではない。",
        "vietnamese": "Không hẳn là tôi ghét đồ ăn cay, chỉ là không ăn được nhiều thôi.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-wakedewanai-2",
        "japanese": "お金があれば幸せになれるというわけではない。",
        "reading": "おかね[金]があればしあわ[幸]せになれるというわけではない。",
        "vietnamese": "Không phải cứ có nhiều tiền là đương nhiên sẽ hạnh phúc.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "料理がまったく（　）わけではないが、普段は外食が多い。",
      "questionVi": "Không hẳn là, không có nghĩa là...",
      "options": [
        "できない",
        "できる",
        "できて",
        "できず"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Không hẳn là hoàn toàn không biết nấu: できないわけではない."
    }
  },
  {
    "id": "n2-nisuginai",
    "lessonId": "skz-n2-c7",
    "lessonTitle": "Chương 7: Phán đoán chắc chắn, Đánh giá & Giới hạn",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜にすぎない",
    "reading": "〜にすぎない",
    "romaji": "ni suginai",
    "level": "N2",
    "category": "Phán đoán & Đánh giá",
    "meaningVi": "Chỉ là... không hơn không kém, chẳng qua chỉ là...",
    "structure": "Thể thông thường / N + にすぎない",
    "formality": "Thông thường",
    "nuance": "Hạ thấp mức độ, đánh giá sự việc là bình thường, không có gì to tát, chỉ dừng lại ở phạm vi nhỏ hẹp.",
    "formationRules": [
      {
        "partOfSpeech": "Tính từ đuôi い",
        "rule": "V / A-i thể thông thường + にすぎない",
        "example": "V / A-i thể thông thường + にすぎない"
      },
      {
        "partOfSpeech": "Tính từ đuôi な",
        "rule": "N / A-na (bỏ だ) + にすぎない",
        "example": "N / A-na (bỏ だ) + にすぎない"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-nisuginai-1",
        "japanese": "彼は単なる一社員にすぎず、経営方針を決定する権限はない。",
        "reading": "かれ[彼]はたんなる[単]なるいっしゃいん[一社員]にすぎず、けいえいほうしん[経営方針]をけってい[決定]するけんげん[権限]はない。",
        "vietnamese": "Anh ấy chẳng qua cũng chỉ là một nhân viên bình thường, không có quyền quyết định đường lối kinh doanh.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-nisuginai-2",
        "japanese": "私の意見は一つの提案にすぎません。最終決定は皆様にお任せします。",
        "reading": "わたし[私]のいけん[意見]はいと[一]つのていあん[提案]にすぎません。さいしゅうけってい[最終決定]はみなさま[皆様]におまか[任]せします。",
        "vietnamese": "Ý kiến của tôi cũng chỉ là một đề xuất khiêm tốn thôi. Quyết định cuối cùng xin giao cho quý vị.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "今回の成功は、運が良かった（　）。",
      "questionVi": "Chỉ là... không hơn không kém, chẳng qua chỉ là...",
      "options": [
        "にすぎない",
        "に相違ない",
        "っこない",
        "に決まっている"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Chẳng qua chỉ là do may mắn thôi: 運が良かったにすぎない."
    }
  },
  {
    "id": "n2-okagirini",
    "lessonId": "skz-n2-c7",
    "lessonTitle": "Chương 7: Phán đoán chắc chắn, Đánh giá & Giới hạn",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜を限りに / かぎり",
    "reading": "〜をかぎりに / かぎり",
    "romaji": "o kagiri ni / kagiri",
    "level": "N2",
    "category": "Phán đoán & Đánh giá",
    "meaningVi": "Kể từ mốc này chấm dứt / Hết mức (tiếng thét, sức lực)",
    "structure": "N (thời gian) + を限りに / 声・力 + を限りに",
    "formality": "Trang trọng",
    "nuance": "1) Lấy thời điểm hiện tại làm giới hạn cuối cùng, sau đó sẽ ngừng hoàn toàn; 2) Dùng với 声, 力 để chỉ việc gào hết cỡ, dốc hết toàn lực.",
    "formationRules": [
      {
        "partOfSpeech": "Thể thông thường",
        "rule": "Mốc thời gian (今日, 今月, 今回) + を限りに",
        "example": "Mốc thời gian (今日, 今月, 今回) + を限りに"
      },
      {
        "partOfSpeech": "Thể thông thường",
        "rule": "声・力 + を限りに",
        "example": "声・力 + を限りに"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-okagirini-1",
        "japanese": "本日を限りに、長年勤めた会社を退職することになりました。",
        "reading": "ほんじつ[本日]をかぎ[限]りに、ながねん[長年]つと[勤]めたかいしゃ[会社]をたいしょく[退職]することになりました。",
        "vietnamese": "Hết ngày hôm nay, tôi sẽ chính thức thôi việc tại công ty gắn bó suốt bao năm qua.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-okagirini-2",
        "japanese": "助けを求めて、声を限りに叫び続けた。",
        "reading": "たす[助]けをもと[求]めて、こえ[声]をかぎ[限]りにさけ[叫]びつづ[続]けた。",
        "vietnamese": "Để cầu cứu, anh ấy đã gào thét hết sức bình sinh.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "今月末（　）、このサービスを終了させていただきます。",
      "questionVi": "Kể từ mốc này chấm dứt / Hết mức (tiếng thét, sức lực)",
      "options": [
        "を限りに",
        "を通して",
        "に先立って",
        "をめぐって"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Chấm dứt dịch vụ lấy mốc cuối tháng: 今月末を限りに."
    }
  },
  {
    "id": "n2-nichigainai",
    "lessonId": "skz-n2-c7",
    "lessonTitle": "Chương 7: Phán đoán chắc chắn, Đánh giá & Giới hạn",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜に違いない",
    "reading": "〜にちがいない",
    "romaji": "ni chigainai",
    "level": "N2",
    "category": "Phán đoán & Đánh giá",
    "meaningVi": "Chắc chắn là, không thể khác được",
    "structure": "Thể thông thường / N / A-na (bỏ だ) + に違いない",
    "formality": "Thông thường",
    "nuance": "Phán đoán có căn cứ xác thực, người nói tin tưởng chắc chắn tới 90-100% vào nhận định của mình.",
    "formationRules": [
      {
        "partOfSpeech": "Tính từ đuôi い",
        "rule": "V / A-i thể thông thường + に違いない",
        "example": "V / A-i thể thông thường + に違いない"
      },
      {
        "partOfSpeech": "Tính từ đuôi な",
        "rule": "N / A-na (bỏ だ) + に違いない",
        "example": "N / A-na (bỏ だ) + に違いない"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-nichigainai-1",
        "japanese": "明かりがついているから、彼はまだオフィスにいるに違いない。",
        "reading": "あか[明]かりがついているから、かれ[彼]はまだオフィスにいるにちが[違]いない。",
        "vietnamese": "Đèn vẫn còn sáng nên chắc chắn anh ấy vẫn còn đang ở trong văn phòng.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-nichigainai-2",
        "japanese": "彼があれほど喜んでいるのなら、試験に合格したに違いない。",
        "reading": "かれ[彼]があれほどよろこ[喜]んでいるのなら、しけん[試験]にごうかく[合格]したにちが[違]いない。",
        "vietnamese": "Nếu anh ấy vui mừng đến thế kia thì chắc chắn là đã đỗ kỳ thi rồi.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "これだけの荷物を一人で運ぶのは大変（　）。",
      "questionVi": "Chắc chắn là, không thể khác được",
      "options": [
        "に違いない",
        "っこない",
        "にすぎない",
        "どころではない"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Chắc chắn là vất vả lắm: 大変に違いない."
    }
  },
  {
    "id": "n2-ppoi",
    "lessonId": "skz-n2-c8",
    "lessonTitle": "Chương 8: Trạng thái, Xu hướng & Cảm xúc sâu sắc",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜っぽい",
    "reading": "〜っぽい",
    "romaji": "ppoi",
    "level": "N2",
    "category": "Trạng thái & Tính chất",
    "meaningVi": "Có vẻ, hơi có tính chất, hay... (mang hàm ý tiêu cực nhẹ)",
    "structure": "N / V-masu (bỏ ます) / A-i (bỏ い) + っぽい",
    "formality": "Thông thường",
    "nuance": "Diễn tả tính chất, màu sắc hay hành vi có thiên hướng giống thứ gì đó, hoặc một thói quen tiêu cực (hay cáu gắt, hay quên, trẻ con...).",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "Danh từ + っぽい (子供っぽい, 男っぽい, 油っぽい)",
        "example": "Danh từ + っぽい (子供っぽい, 男っぽい, 油っぽい)"
      },
      {
        "partOfSpeech": "Động từ",
        "rule": "V-masu bỏ ます + っぽい (怒りっぽい, 忘れっぽい)",
        "example": "V-masu bỏ ます + っぽい (怒りっぽい, 忘れっぽい)"
      },
      {
        "partOfSpeech": "Tính từ đuôi い",
        "rule": "A-i bỏ い + っぽい (白っぽい, 安っぽい)",
        "example": "A-i bỏ い + っぽい (白っぽい, 安っぽい)"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-ppoi-1",
        "japanese": "彼はもう20歳なのに、話し方がとても子供っぽい。",
        "reading": "かれ[彼]はもう20さい[歳]なのに、はな[話]しがた[方]がとてもこども[子供]っぽい。",
        "vietnamese": "Cậu ấy đã 20 tuổi rồi mà cách ăn nói cứ như trẻ con vậy.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-ppoi-2",
        "japanese": "年を取ってから、だんだん忘れっぽくなってきた。",
        "reading": "とし[年]をと[取]ってから、だんだんわす[忘]れっぽくなってきた。",
        "vietnamese": "Từ ngày có tuổi, tôi bắt đầu trở nên đãng trí, hay quên dần.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "この料理は（　）ぽくて、あまりたくさん食べられない。",
      "questionVi": "Có vẻ, hơi có tính chất, hay... (mang hàm ý tiêu cực nhẹ)",
      "options": [
        "油",
        "油だ",
        "油な",
        "油の"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Danh từ ghép trực tiếp: 油っぽい (ngấy dầu mỡ)."
    }
  },
  {
    "id": "n2-gimi",
    "lessonId": "skz-n2-c8",
    "lessonTitle": "Chương 8: Trạng thái, Xu hướng & Cảm xúc sâu sắc",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜気味",
    "reading": "〜ぎみ",
    "romaji": "gimi",
    "level": "N2",
    "category": "Trạng thái & Tính chất",
    "meaningVi": "Có cảm giác hơi, có triệu chứng hơi... (tiêu cực)",
    "structure": "N / V-masu (bỏ ます) + 気味",
    "formality": "Thông thường",
    "nuance": "Chỉ trạng thái cơ thể hoặc tinh thần chớm xuất hiện dấu hiệu tiêu cực nhẹ (hơi sốt, hơi mệt, hơi căng thẳng).",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "Danh từ: 風邪気味 (hơi cảm), 緊張気味 (hơi căng thẳng), 疲れ気味 (hơi mệt)",
        "example": "Danh từ: 風邪気味 (hơi cảm), 緊張気味 (hơi căng thẳng), 疲れ気味 (hơi mệt)"
      },
      {
        "partOfSpeech": "Động từ",
        "rule": "V-masu bỏ ます: 太り気味 (hơi béo ra), 遅れ気味 (hơi trễ tiến độ)",
        "example": "V-masu bỏ ます: 太り気味 (hơi béo ra), 遅れ気味 (hơi trễ tiến độ)"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-gimi-1",
        "japanese": "今日は少し風邪気味なので、早く帰って休みます。",
        "reading": "きょう[今日]はすこ[少]しかぜぎみ[風邪気味]なので、はや[早]くかえ[帰]ってやす[休]みます。",
        "vietnamese": "Hôm nay tôi thấy hơi có triệu chứng cảm cúm nên sẽ về sớm nghỉ ngơi.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-gimi-2",
        "japanese": "最近運動不足で、少し太り気味になってきた。",
        "reading": "さいきん[最近]うんどうぶそく[運動不足]で、すこ[少]しふと[太]りぎみ[気味]になってきた。",
        "vietnamese": "Dạo này lười vận động nên tôi thấy mình hơi có xu hướng béo ra.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "連日の残業で、社員たちに（　）気味の表情が見られる。",
      "questionVi": "Có cảm giác hơi, có triệu chứng hơi... (tiêu cực)",
      "options": [
        "疲れ",
        "疲れる",
        "疲れた",
        "疲れて"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "V-masu bỏ ます: 疲れます -> 疲れ気味 (hơi mệt mỏi)."
    }
  },
  {
    "id": "n2-gachi",
    "lessonId": "skz-n2-c8",
    "lessonTitle": "Chương 8: Trạng thái, Xu hướng & Cảm xúc sâu sắc",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜がち",
    "reading": "〜がち",
    "romaji": "gachi",
    "level": "N2",
    "category": "Trạng thái & Tính chất",
    "meaningVi": "Thường hay, có xu hướng dễ bị... (tiêu cực)",
    "structure": "N / V-masu (bỏ ます) + がち",
    "formality": "Thông thường",
    "nuance": "Chỉ tần suất xảy ra nhiều lần hoặc một thói quen xấu dễ tái diễn mà người nói muốn lưu ý, phòng ngừa.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "Danh từ: 留守がち (hay vắng nhà), 病気がち (hay ốm yếu)",
        "example": "Danh từ: 留守がち (hay vắng nhà), 病気がち (hay ốm yếu)"
      },
      {
        "partOfSpeech": "Động từ",
        "rule": "V-masu bỏ ます: 忘れがち (hay quên), 遠慮しがち (dễ e ngại), 怠けがち (hay lười)",
        "example": "V-masu bỏ ます: 忘れがち (hay quên), 遠慮しがち (dễ e ngại), 怠けがち (hay lười)"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-gachi-1",
        "japanese": "一人暮らしを始めると、どうしても野菜が不足しがちになる。",
        "reading": "ひとりぐ[一人暮]らしをはじ[始]めると、どうしてもやさい[野菜]がふそく[不足]しがちになる。",
        "vietnamese": "Cứ hễ bắt đầu sống một mình là kiểu gì cũng rất hay bị thiếu rau xanh.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-gachi-2",
        "japanese": "彼は子供のころ、病気がちで学校を休みがちだった。",
        "reading": "かれ[彼]はこども[子供]のころ、びょうき[病気]がちでがっこう[学校]をやす[休]みがちだった。",
        "vietnamese": "Hồi bé cậu ấy hay đau ốm và thường xuyên phải nghỉ học.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "忙しいと、つい睡眠時間を削り（　）になる。",
      "questionVi": "Thường hay, có xu hướng dễ bị... (tiêu cực)",
      "options": [
        "がち",
        "気味",
        "っぽい",
        "一方"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Hay có xu hướng cắt bớt giấc ngủ: 削りがち."
    }
  },
  {
    "id": "n2-ippouda",
    "lessonId": "skz-n2-c8",
    "lessonTitle": "Chương 8: Trạng thái, Xu hướng & Cảm xúc sâu sắc",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜一方だ",
    "reading": "〜いっぽうだ",
    "romaji": "ippou da",
    "level": "N2",
    "category": "Trạng thái & Tính chất",
    "meaningVi": "Ngày càng..., cứ tiếp tục theo một chiều hướng...",
    "structure": "V-ru (động từ biến đổi) + 一方だ",
    "formality": "Thông thường",
    "nuance": "Chỉ sự thay đổi liên tục theo một xu hướng đơn chiều không ngừng (thường là chiều hướng xấu, hoặc tăng giảm liên tục).",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "Động từ biểu thị sự biến đổi (増える, 減る, 悪化する, 上がる...) + 一方だ",
        "example": "Động từ biểu thị sự biến đổi (増える, 減る, 悪化する, 上がる...) + 一方だ"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-ippouda-1",
        "japanese": "少子高齢化が進み、医療費の負担は増える一方だ。",
        "reading": "しょうしこうれいか[少子高齢化]がすす[進]み、いりょうひ[医療費]のふたん[負担]はふ[増]えるいっぽう[一方]だ。",
        "vietnamese": "Tình trạng già hóa dân số gia tăng khiến gánh nặng chi phí y tế cứ ngày một tăng cao.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-ippouda-2",
        "japanese": "景気が悪化して、失業率は悪化する一方だ。",
        "reading": "けいき[景気]があっか[悪化]して、しつぎょうりつ[失業率]はあっか[悪化]するいっぽう[一方]だ。",
        "vietnamese": "Kinh tế sa sút làm tỷ lệ thất nghiệp cứ ngày một tồi tệ hơn.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "物価は（　）一方で、生活は苦しくなるばかりだ。",
      "questionVi": "Ngày càng..., cứ tiếp tục theo một chiều hướng...",
      "options": [
        "上がる",
        "上がった",
        "上がって",
        "上がろう"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Động từ biến đổi thể từ điển: 上がる一方だ."
    }
  },
  {
    "id": "n2-bakarida",
    "lessonId": "skz-n2-c8",
    "lessonTitle": "Chương 8: Trạng thái, Xu hướng & Cảm xúc sâu sắc",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜ばかりだ",
    "reading": "〜ばかりだ",
    "romaji": "bakari da",
    "level": "N2",
    "category": "Trạng thái & Tính chất",
    "meaningVi": "Cứ ngày càng... (theo hướng xấu) / Mọi thứ đã sẵn sàng chỉ chờ...",
    "structure": "V-ru + ばかりだ",
    "formality": "Thông thường",
    "nuance": "1) Diễn tả biến chuyển cứ tiếp tục theo chiều hướng tiêu cực; 2) Đi với động từ chuẩn bị nghĩa là mọi khâu đã xong, chỉ còn chờ tiến hành.",
    "formationRules": [
      {
        "partOfSpeech": "Thể thông thường",
        "rule": "V biến đổi + ばかりだ: ngày càng tệ đi (悪くなるばかりだ)",
        "example": "V biến đổi + ばかりだ: ngày càng tệ đi (悪くなるばかりだ)"
      },
      {
        "partOfSpeech": "Thể thông thường",
        "rule": "V chuẩn bị + ばかりだ: chỉ còn chờ làm (出発するばかりだ)",
        "example": "V chuẩn bị + ばかりだ: chỉ còn chờ làm (出発するばかりだ)"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-bakarida-1",
        "japanese": "一度崩れた信頼関係は、悪化するばかりだ。",
        "reading": "いちど[一度]くず[崩]れたしんらいかんけい[信頼関係]は、あっか[悪化]するばかりだ。",
        "vietnamese": "Mối quan hệ tin tưởng một khi đã sứt mẻ thì cứ ngày càng xấu đi mà thôi.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-bakarida-2",
        "japanese": "料理も並び、あとはお客様の到着を待つばかりだ。",
        "reading": "りょうり[料理]もなら[並]び、あとはおきゃくさま[お客様]のとうちゃく[到着]をま[待]つばかりだ。",
        "vietnamese": "Món ăn đã bày biện xong xuôi, giờ chỉ còn chờ khách đến nữa thôi.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "事故の後、彼の体調は悪くなる（　）。",
      "questionVi": "Cứ ngày càng... (theo hướng xấu) / Mọi thứ đã sẵn sàng chỉ chờ...",
      "options": [
        "ばかりだ",
        "気味だ",
        "っぽい",
        "ながらだ"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Cứ ngày một xấu đi: 悪くなるばかりだ."
    }
  },
  {
    "id": "n2-ge",
    "lessonId": "skz-n2-c8",
    "lessonTitle": "Chương 8: Trạng thái, Xu hướng & Cảm xúc sâu sắc",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜げ",
    "reading": "〜げ",
    "romaji": "ge",
    "level": "N2",
    "category": "Trạng thái & Tính chất",
    "meaningVi": "Có vẻ, mang vẻ (tâm trạng lộ rõ ra bề ngoài)",
    "structure": "A-i (bỏ い) / A-na (bỏ な) + げ / げな + N / げに + V",
    "formality": "Trang trọng",
    "nuance": "Tương tự そう nhưng mang tính văn học, biểu cảm hơn, dùng quan sát vẻ mặt, cử chỉ thể hiện cảm xúc nội tâm của người khác (tự tin, cô đơn, buồn bã...).",
    "formationRules": [
      {
        "partOfSpeech": "Tính từ đuôi い",
        "rule": "A-i bỏ い + げ (悲しげ, 寂しげ, 懐かしげ, 誇らしげ)",
        "example": "A-i bỏ い + げ (悲しげ, 寂しげ, 懐かしげ, 誇らしげ)"
      },
      {
        "partOfSpeech": "Tính từ đuôi な",
        "rule": "A-na bỏ な + げ (得意げ, 不安げ)",
        "example": "A-na bỏ な + げ (得意げ, 不安げ)"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-ge-1",
        "japanese": "彼女は何か言いたげな表情でこちらを見つめていた。",
        "reading": "かのじょ[彼女]はなに[何]かい[言]いたげなひょうじょう[表情]でこちらをみ[見]つめていた。",
        "vietnamese": "Cô ấy chăm chú nhìn về phía tôi với nét mặt có vẻ như muốn nói điều gì đó.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-ge-2",
        "japanese": "少年は満点を取ったテストを、誇らしげに見せてくれた。",
        "reading": "しょうねん[少年]はまんてん[満点]をと[取]ったテストを、ほこ[誇]らしげにみ[見]せてくれた。",
        "vietnamese": "Cậu bé khoe bài kiểm tra đạt điểm tuyệt đối với vẻ đầy tự hào.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "老人は遠くを見つめながら、（　）げに微笑んだ。",
      "questionVi": "Có vẻ, mang vẻ (tâm trạng lộ rõ ra bề ngoài)",
      "options": [
        "寂し",
        "寂しい",
        "寂しく",
        "寂しさ"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Tính từ đuôi い bỏ い: 寂しい -> 寂し + げに."
    }
  },
  {
    "id": "n2-kanoyouni",
    "lessonId": "skz-n2-c8",
    "lessonTitle": "Chương 8: Trạng thái, Xu hướng & Cảm xúc sâu sắc",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜かのように",
    "reading": "〜かのよう",
    "romaji": "ka no you ni",
    "level": "N2",
    "category": "Trạng thái & Tính chất",
    "meaningVi": "Cứ như thể là..., dường như là...",
    "structure": "Thể thông thường / N + である + かのように",
    "formality": "Trang trọng",
    "nuance": "So sánh ví von một sự việc thực chất không phải như vậy, nhưng hành vi thái độ lại diễn ra hệt như là thật.",
    "formationRules": [
      {
        "partOfSpeech": "Thể thông thường",
        "rule": "Thể thông thường + かのように / かのような + N",
        "example": "Thể thông thường + かのように / かのような + N"
      },
      {
        "partOfSpeech": "Tính từ đuôi な",
        "rule": "N / A-na: である + かのように",
        "example": "N / A-na: である + かのように"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-kanoyouni-1",
        "japanese": "彼はまるで自分がすべてを知っているかのように熱弁を振るった。",
        "reading": "かれ[彼]はまるでじぶん[自分]がすべてをし[知]っているかのようにねつべん[熱弁]をふる[振]った。",
        "vietnamese": "Anh ta hùng hồn diễn thuyết cứ như thể bản thân biết hết tất cả mọi chuyện trên đời.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-kanoyouni-2",
        "japanese": "初対面なのに、昔からの親友であるかのように親しく接してくれた。",
        "reading": "しょたいめん[初対面]なのに、むかし[昔]からのしんゆう[親友]であるかのようにした[親]しくせっ[接]してくれた。",
        "vietnamese": "Dù mới gặp lần đầu nhưng anh ấy đối xử với tôi thân thiết cứ như bạn tri kỷ từ thuở nào.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "何事も起きなかった（　）、彼は平然とした顔をしていた。",
      "questionVi": "Cứ như thể là..., dường như là...",
      "options": [
        "かのように",
        "ばかりに",
        "どころか",
        "につれて"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Cứ như thể không có chuyện gì xảy ra: かのように."
    }
  },
  {
    "id": "n2-dokorodewanai",
    "lessonId": "skz-n2-c8",
    "lessonTitle": "Chương 8: Trạng thái, Xu hướng & Cảm xúc sâu sắc",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜どころではない",
    "reading": "〜どころではない",
    "romaji": "dokoro dewa nai",
    "level": "N2",
    "category": "Trạng thái & Tính chất",
    "meaningVi": "Không phải là lúc... / Đâu thể nào... (hoàn cảnh ngặt nghèo)",
    "structure": "N / V-ru / V-te iru + どころではない",
    "formality": "Thông thường",
    "nuance": "Vì hoàn cảnh quá bận rộn, áp lực, nguy cấp hoặc túng thiếu nên hoàn toàn không có tâm trí, thời gian hay điều kiện để làm việc đó.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "Danh từ + どころではない",
        "example": "Danh từ + どころではない"
      },
      {
        "partOfSpeech": "Động từ",
        "rule": "V thể từ điển (V-ru) + どころではない",
        "example": "V thể từ điển (V-ru) + どころではない"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-dokorodewanai-1",
        "japanese": "締め切りが明日なので、映画を見に行くどころではない。",
        "reading": "しめき[締切]りがあす[明日]なので、えいが[映画]をみ[見]にい[行]くどころではない。",
        "vietnamese": "Hạn chót là ngày mai rồi, giờ đâu phải lúc đi xem phim!",
        "highlightWords": []
      },
      {
        "id": "ex-n2-dokorodewanai-2",
        "japanese": "風邪で高熱が出て、食事どころではなかった。",
        "reading": "かぜ[風邪]でこうねつ[高熱]がで[出]て、しょくじ[食事]どころではなかった。",
        "vietnamese": "Bị cảm sốt cao li bì, đến ăn uống tôi còn chẳng thiết tha nổi.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "台風で屋根が吹き飛んで、旅行（　）じゃないよ！",
      "questionVi": "Không phải là lúc... / Đâu thể nào... (hoàn cảnh ngặt nghèo)",
      "options": [
        "どころ",
        "ばかり",
        "ながら",
        "一方"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Bão thổi bay cả nóc nhà thì đâu phải lúc du lịch: 旅行どころじゃない."
    }
  },
  {
    "id": "n2-nuku",
    "lessonId": "skz-n2-c8",
    "lessonTitle": "Chương 8: Trạng thái, Xu hướng & Cảm xúc sâu sắc",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜抜く",
    "reading": "〜ぬく",
    "romaji": "nuku",
    "level": "N2",
    "category": "Trạng thái & Tính chất",
    "meaningVi": "Làm đến cùng, chịu đựng vượt qua đến cùng",
    "structure": "V-masu (bỏ ます) + 抜く",
    "formality": "Thông thường",
    "nuance": "Chỉ sự nỗ lực kiên trì, vượt qua muôn vàn gian lao khó nhọc để hoàn thành trọn vẹn hành động tới đích cuối cùng.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-masu bỏ ます + 抜く (走り抜く, 考え抜く, 耐え抜く, 守り抜く)",
        "example": "V-masu bỏ ます + 抜く (走り抜く, 考え抜く, 耐え抜く, 守り抜く)"
      }
    ],
    "examples": [
      {
        "id": "ex-n2-nuku-1",
        "japanese": "途中で何度も諦めそうになったが、フルマラソンを最後まで走り抜いた。",
        "reading": "とちゅう[途中]でなんど[何度]もあきら[諦]めそうになったが、フルマラソンをさいご[最後]まではし[走]りぬ[抜]いた。",
        "vietnamese": "Dọc đường đã bao lần suýt bỏ cuộc, nhưng cuối cùng tôi đã kiên trì chạy hết cự ly marathon trọn vẹn.",
        "highlightWords": []
      },
      {
        "id": "ex-n2-nuku-2",
        "japanese": "悩み抜いた末に出した結論だから、後悔はしていない。",
        "reading": "なや[悩]みぬ[抜]いたすえ[末]にだ[出]したけつろん[結論]だから、こうかい[後悔]はしていない。",
        "vietnamese": "Đây là kết luận được đưa ra sau khi đã suy nghĩ trăn trở đến tận cùng, nên tôi không hề hối tiếc.",
        "highlightWords": []
      }
    ],
    "quickQuiz": {
      "question": "どんな困難にも耐え（　）、ついに夢を実現させた。",
      "questionVi": "Làm đến cùng, chịu đựng vượt qua đến cùng",
      "options": [
        "抜いて",
        "抜かなくて",
        "抜くように",
        "抜くだけで"
      ],
      "optionsVi": [
        "Lựa chọn 1",
        "Lựa chọn 2",
        "Lựa chọn 3",
        "Lựa chọn 4"
      ],
      "correctIndex": 0,
      "explanation": "Kiên cường chịu đựng đến cùng: 耐え抜いて."
    }
  }
];

export const N2_SHINKANZEN = N2_SHINKANZEN_MASTER_GRAMMAR;
