import { GrammarMasterItem } from '../grammar.types';

export const N3_SHINKANZEN: GrammarMasterItem[] = [
  {
    "id": "n3-skz-ta-totan",
    "lessonId": "skz-n3-c1",
    "lessonTitle": "Chuyên đề 1: Thời gian & Trình tự hành động",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜たとたん（に）",
    "reading": "たとたんに",
    "romaji": "ta totan ni",
    "level": "N3",
    "category": "time",
    "meaningVi": "Vừa mới... thì ngay lập tức (Bất ngờ, ngoài dự kiến)",
    "structure": "V-た + とたん（に）",
    "formality": "Trang trọng",
    "nuance": "Hành động vế sau xảy ra gần như ngay tức khắc sau vế trước. Vế sau luôn là sự việc bất ngờ ngoài dự kiến.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-た + とたん（に）",
        "example": "立ち上がった とたん、目まいがした"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-totan-1",
        "japanese": "窓を開けたとたん、冷たい風が吹き込んできた。",
        "reading": "まどをあけたとたん、つめたいかぜがふきこんできた。",
        "vietnamese": "Vừa mới mở cửa sổ ra thì ngay lập tức một luồng gió lạnh thổi ùa vào."
      }
    ],
    "quickQuiz": {
      "question": "疲れてベッドに（　）とたん、眠ってしまった。",
      "questionVi": "Vừa mới ngả lưng xuống giường là tôi đã ngủ thiếp đi ngay.",
      "options": [
        "入った",
        "入る",
        "入って",
        "入ろう"
      ],
      "optionsVi": [
        "Thể Ta (chuẩn)",
        "Thể từ điển",
        "Thể Te",
        "Thể ý định"
      ],
      "correctIndex": 0,
      "explanation": "V-た + とたん: ベッドに入ったとたん."
    }
  },
  {
    "id": "n3-skz-saichuu-ni",
    "lessonId": "skz-n3-c1",
    "lessonTitle": "Chuyên đề 1: Thời gian & Trình tự hành động",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜最中に / 〜最中だ",
    "reading": "さいちゅうに / さいちゅうだ",
    "romaji": "saichuu ni / saichuu da",
    "level": "N3",
    "category": "time",
    "meaningVi": "Đúng lúc đang cao điểm làm gì thì có việc bất ngờ xen vào",
    "structure": "V-ている / N の + 最中に",
    "formality": "Trang trọng",
    "nuance": "Nhấn mạnh một hành động đang ở thời điểm tập trung cao trào nhất thì bất ngờ bị một sự cố bên ngoài chen ngang.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-ている + 最中に",
        "example": "食事している 最中に 電話が鳴った"
      },
      {
        "partOfSpeech": "Danh từ",
        "rule": "N + の + 最中に",
        "example": "会議の 最中に"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-saichuu-1",
        "japanese": "試験の最中に、お腹が痛くなってしまった。",
        "reading": "しけんのさいちゅうに、おなかがいたくなってしまった。",
        "vietnamese": "Đúng lúc đang trong giờ thi căng thẳng thì tôi lại bị đau bụng."
      }
    ],
    "quickQuiz": {
      "question": "スピーチの（　）マイクの電源が切れた。",
      "questionVi": "Đúng lúc đang phát biểu thì micro bị mất nguồn.",
      "options": [
        "最中に",
        "うちに",
        "たびに",
        "ついでに"
      ],
      "optionsVi": [
        "Đúng lúc cao điểm",
        "Trong lúc",
        "Mỗi lần",
        "Tiện thể"
      ],
      "correctIndex": 0,
      "explanation": "Sự việc chen ngang lúc cao điểm: スピーチの最中に."
    }
  },
  {
    "id": "n3-skz-uchi-ni",
    "lessonId": "skz-n3-c1",
    "lessonTitle": "Chuyên đề 1: Thời gian & Trình tự hành động",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜うちに",
    "reading": "うちに",
    "romaji": "uchi ni",
    "level": "N3",
    "category": "time",
    "meaningVi": "1. Nhân lúc còn... (tranh thủ làm trước khi đổi trạng thái) / 2. Trong lúc đang... thì tự nhiên biến đổi",
    "structure": "V-る / V-ている / V-ない / A-い / Na-な / N-の + うちに",
    "formality": "Lịch sự",
    "nuance": "Tận dụng khoảng thời gian điều kiện còn thuận lợi để thực hiện hành động trước khi quá muộn.",
    "formationRules": [
      {
        "partOfSpeech": "Tính từ đuôi い",
        "rule": "A-い + うちに",
        "example": "熱い うちに 食べてください"
      },
      {
        "partOfSpeech": "Động từ",
        "rule": "V-ない + うちに",
        "example": "忘れない うちに メモする"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-uchi-1",
        "japanese": "日本にいるうちに、一度富士山に登ってみたい。",
        "reading": "にほんにいるうちに、いちどふじさんにのぼってみたい。",
        "vietnamese": "Nhân lúc còn đang ở Nhật Bản, tôi muốn thử một lần leo núi Phú Sĩ."
      }
    ],
    "quickQuiz": {
      "question": "スープが（　）うちに召し上がってください。",
      "questionVi": "Hãy dùng canh nhân lúc còn nóng nhé.",
      "options": [
        "温かい",
        "温かかった",
        "温かく",
        "温かくて"
      ],
      "optionsVi": [
        "Nguyên thể đuôi -i",
        "Quá khứ",
        "Thể liên từ",
        "Thể Te"
      ],
      "correctIndex": 0,
      "explanation": "Tính từ đuôi -i giữ nguyên: 温かいうちに."
    }
  },
  {
    "id": "n3-skz-tabini",
    "lessonId": "skz-n3-c1",
    "lessonTitle": "Chuyên đề 1: Thời gian & Trình tự hành động",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜たびに",
    "reading": "たびに",
    "romaji": "tabi ni",
    "level": "N3",
    "category": "time",
    "meaningVi": "Cứ mỗi lần... là lại... (lặp đi lặp lại cùng kết quả)",
    "structure": "V-る / N の + たびに",
    "formality": "Lịch sự",
    "nuance": "Mỗi lần có sự việc A diễn ra thì sự việc B luôn luôn xuất hiện theo sau như một thói quen hoặc cảm xúc cố định.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-る + たびに",
        "example": "旅行する たびに お土産を買う"
      },
      {
        "partOfSpeech": "Danh từ",
        "rule": "N + の + たびに",
        "example": "誕生日の たびに"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-tabini-1",
        "japanese": "この写真を見るたびに、故郷の家族を思い出します。",
        "reading": "このしゃしんをみるたびに、ふるさとのかぞくをおもいだします。",
        "vietnamese": "Cứ mỗi lần nhìn bức ảnh này là tôi lại nhớ đến gia đình ở quê hương."
      }
    ],
    "quickQuiz": {
      "question": "父は出張の（　）おいしいお菓子を買ってきてくれる。",
      "questionVi": "Cứ mỗi lần đi công tác là bố lại mua bánh ngon về cho tôi.",
      "options": [
        "たびに",
        "ついでに",
        "うちに",
        "最中に"
      ],
      "optionsVi": [
        "Mỗi lần (lặp lại)",
        "Tiện thể",
        "Trong lúc",
        "Đúng lúc cao điểm"
      ],
      "correctIndex": 0,
      "explanation": "Lặp lại theo chu kỳ: 出張のたびに."
    }
  },
  {
    "id": "n3-skz-te-irai",
    "lessonId": "skz-n3-c1",
    "lessonTitle": "Chuyên đề 1: Thời gian & Trình tự hành động",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜て以来",
    "reading": "ていらい",
    "romaji": "te irai",
    "level": "N3",
    "category": "time",
    "meaningVi": "Kể từ sau khi... thì suốt từ đó đến nay liên tục giữ nguyên trạng thái",
    "structure": "V-て + 以来",
    "formality": "Trang trọng",
    "nuance": "Mốc thời gian bắt đầu từ quá khứ, và trạng thái vế sau kéo dài liên tục không đổi cho tới thời điểm hiện tại.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-て + 以来",
        "example": "日本へ 来て 以来"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-te-irai-1",
        "japanese": "大学を卒業して以来、彼とは一度も会っていない。",
        "reading": "だいがくをそつぎょうしていらい、かれとはいちどもあっていない。",
        "vietnamese": "Kể từ sau khi tốt nghiệp đại học đến nay, tôi chưa từng gặp lại anh ấy."
      }
    ],
    "quickQuiz": {
      "question": "日本に（　）以来、毎日納豆を食べている。",
      "questionVi": "Kể từ khi đến Nhật đến nay, ngày nào tôi cũng ăn natto.",
      "options": [
        "来て",
        "来る",
        "来たら",
        "来ると"
      ],
      "optionsVi": [
        "Thể Te",
        "Thể từ điển",
        "Thể Tara",
        "Thể Ru to"
      ],
      "correctIndex": 0,
      "explanation": "V-て + 以来: 来て以来."
    }
  },
  {
    "id": "n3-skz-te-hajimete",
    "lessonId": "skz-n3-c1",
    "lessonTitle": "Chuyên đề 1: Thời gian & Trình tự hành động",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜てはじめて",
    "reading": "てはじめて",
    "romaji": "te hajimete",
    "level": "N3",
    "category": "time",
    "meaningVi": "Chỉ sau khi... thì mới nhận ra / mới hiểu được",
    "structure": "V-て + はじめて",
    "formality": "Lịch sự",
    "nuance": "Chỉ sau khi A xảy ra rồi người nói mới bừng tỉnh hoặc ngộ ra một bài học quan trọng.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-て + はじめて",
        "example": "病気になって はじめて 健康のありがたさが分かった"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-hajimete-1",
        "japanese": "親になってはじめて、親の苦労が分かった。",
        "reading": "おやになってはじめて、おやのくろうがわかった。",
        "vietnamese": "Chỉ sau khi làm cha mẹ rồi tôi mới thấu hiểu được nỗi vất vả của cha mẹ."
      }
    ],
    "quickQuiz": {
      "question": "外国へ（　）はじめて、自分の国の良さに気づいた。",
      "questionVi": "Chỉ sau khi đi nước ngoài tôi mới nhận ra nét đẹp của nước mình.",
      "options": [
        "行って",
        "行く",
        "行けば",
        "行ったら"
      ],
      "optionsVi": [
        "Thể Te",
        "Thể từ điển",
        "Thể Ba",
        "Thể Tara"
      ],
      "correctIndex": 0,
      "explanation": "V-て + はじめて: 行ってはじめて."
    }
  },
  {
    "id": "n3-skz-shidai",
    "lessonId": "skz-n3-c1",
    "lessonTitle": "Chuyên đề 1: Thời gian & Trình tự hành động",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜次第",
    "reading": "しだい",
    "romaji": "shidai",
    "level": "N3",
    "category": "time",
    "meaningVi": "Ngay sau khi... thì sẽ lập tức làm bước tiếp theo",
    "structure": "V-thân bỏ ます + 次第",
    "formality": "Trang trọng",
    "nuance": "Dùng rất phổ biến trong công sở, thư từ thương mại. Vế sau luôn thể hiện hành động có ý chí của người nói.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-masu (bỏ ます) + 次第",
        "example": "準備ができ 次第 連絡します"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-shidai-1",
        "japanese": "詳しい日程が決まり次第、メールでお知らせいたします。",
        "reading": "くわしいにっていがきまりしだい、めーるでおしらせいたします。",
        "vietnamese": "Ngay sau khi lịch trình chi tiết được quyết định, tôi sẽ thông báo qua email cho quý khách."
      }
    ],
    "quickQuiz": {
      "question": "会場に（　）次第、お電話をいただけますでしょうか。",
      "questionVi": "Ngay sau khi đến hội trường, anh gọi điện cho tôi nhé?",
      "options": [
        "着き",
        "着く",
        "着いて",
        "着いた"
      ],
      "optionsVi": [
        "Thân bỏ masu",
        "Thể từ điển",
        "Thể Te",
        "Thể Ta"
      ],
      "correctIndex": 0,
      "explanation": "V(bỏ ます) + 次第: 着き次第."
    }
  },
  {
    "id": "n3-skz-o-hajime",
    "lessonId": "skz-n3-c1",
    "lessonTitle": "Chuyên đề 1: Thời gian & Trình tự hành động",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜をはじめ / 〜をはじめとする",
    "reading": "をはじめ / をはじめとする",
    "romaji": "o hajime / o hajime to suru",
    "level": "N3",
    "category": "basics",
    "meaningVi": "Trước hết phải kể đến... / Tiêu biểu nhất là...",
    "structure": "N + をはじめ（として） / N + をはじめとする + N",
    "formality": "Trang trọng",
    "nuance": "Đưa ra một ví dụ tiêu biểu, nổi bật nhất trong một tập thể.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "N + をはじめ",
        "example": "東京をはじめとする大都市"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-hajime-1",
        "japanese": "日本には富士山をはじめ、美しい自然がたくさんある。",
        "reading": "にほんにはふじさんをはじめ、うつくしいしぜんがたくさんある。",
        "vietnamese": "Ở Nhật Bản, trước hết phải kể đến núi Phú Sĩ, có rất nhiều cảnh sắc thiên nhiên tuyệt đẹp."
      }
    ],
    "quickQuiz": {
      "question": "校長先生（　）先生方のご指導に感謝いたします。",
      "questionVi": "Chúng em xin cảm ơn sự chỉ bảo của các thầy cô, trước hết là thầy hiệu trưởng.",
      "options": [
        "をはじめ",
        "にわたって",
        "を通じて",
        "によって"
      ],
      "optionsVi": [
        "Trước hết là",
        "Suốt phạm vi",
        "Thông qua",
        "Bởi vì"
      ],
      "correctIndex": 0,
      "explanation": "Nêu đại diện tiêu biểu: 校長先生をはじめ."
    }
  },
  {
    "id": "n3-skz-ni-oite",
    "lessonId": "skz-n3-c1",
    "lessonTitle": "Chuyên đề 1: Thời gian & Trình tự hành động",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜において / 〜における",
    "reading": "において / における",
    "romaji": "ni oite / ni okeru",
    "level": "N3",
    "category": "basics",
    "meaningVi": "Ở / Tại / Trong lĩnh vực / Vào thời điểm (Trang trọng của trợ từ で)",
    "structure": "N + において / N + における + N",
    "formality": "Trang trọng",
    "nuance": "Dùng trong văn viết, báo chí, diễn văn hội thảo để chỉ địa điểm tổ chức, thời kỳ lịch sử hoặc phạm vi lĩnh vực.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "N + において",
        "example": "大会議室において 行われる"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-oite-1",
        "japanese": "現代社会におけるインターネットの役割は極めて大きい。",
        "reading": "げんだいしゃかいにおけるいんたーねっとのやくわりはきわめておおきい。",
        "vietnamese": "Vai trò của mạng internet trong xã hội hiện đại là vô cùng to lớn."
      }
    ],
    "quickQuiz": {
      "question": "式典は第一ホール（　）執り行われます。",
      "questionVi": "Buổi lễ sẽ được cử hành tại Hội trường số 1.",
      "options": [
        "において",
        "にとって",
        "に対して",
        "によって"
      ],
      "optionsVi": [
        "Tại/Ở",
        "Đối với",
        "Hướng về",
        "Bởi phương tiện"
      ],
      "correctIndex": 0,
      "explanation": "Địa điểm tổ chức trang trọng: 第一ホールにおいて."
    }
  },
  {
    "id": "n3-skz-ni-watatte",
    "lessonId": "skz-n3-c1",
    "lessonTitle": "Chuyên đề 1: Thời gian & Trình tự hành động",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜にわたって / 〜にわたる",
    "reading": "にわたって / にわたる",
    "romaji": "ni watatte / ni wataru",
    "level": "N3",
    "category": "time",
    "meaningVi": "Suốt / Trên toàn bộ diện tích (Quy mô thời gian & không gian lớn)",
    "structure": "N + にわたって / N + にわたる + N",
    "formality": "Trang trọng",
    "nuance": "Nhấn mạnh khoảng thời gian dài hoặc phạm vi không gian rộng lớn được bao quát liên tục.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ (thời gian/không gian)",
        "rule": "N + にわたって",
        "example": "3日間にわたる 会議"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-watatte-1",
        "japanese": "台風の影響で、関東全域にわたって停電が発生した。",
        "reading": "たいふうのえいきょうで、かんとうぜんいきにわたってていでんがはっせいした。",
        "vietnamese": "Do ảnh hưởng của bão, sự cố mất điện đã xảy ra trên toàn bộ khu vực Kanto."
      }
    ],
    "quickQuiz": {
      "question": "会議は５時間（　）行われた。",
      "questionVi": "Cuộc họp đã diễn ra kéo dài suốt 5 tiếng.",
      "options": [
        "にわたって",
        "において",
        "によって",
        "につれて"
      ],
      "optionsVi": [
        "Kéo dài suốt",
        "Tại",
        "Do",
        "Cùng với"
      ],
      "correctIndex": 0,
      "explanation": "Khoảng thời gian quy mô lớn: ５時間にわたって."
    }
  },
  {
    "id": "n3-skz-o-tsuujite",
    "lessonId": "skz-n3-c1",
    "lessonTitle": "Chuyên đề 1: Thời gian & Trình tự hành động",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜を通じて / 〜を通して",
    "reading": "をつうじて / をとおして",
    "romaji": "o tsuujite / o tooshite",
    "level": "N3",
    "category": "time",
    "meaningVi": "1. Suốt trong cả khoảng thời gian / 2. Thông qua phương tiện trung gian",
    "structure": "N + を通じて / を通して",
    "formality": "Trang trọng",
    "nuance": "Nghĩa 1: Trải dài suốt cả năm. Nghĩa 2: Thông qua bạn bè, người quen để biết thông tin.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "N + を通じて",
        "example": "友人を通じて 知り合った"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-tsuujite-1",
        "japanese": "この地域は四季を通じて観光客が訪れる。",
        "reading": "このちいきはしきをつうじてかんこうきゃくがおとずれる。",
        "vietnamese": "Khu vực này quanh năm suốt cả bốn mùa đều có khách du lịch ghé thăm."
      }
    ],
    "quickQuiz": {
      "question": "ボランティア活動（　）、多くの貴重な経験ができた。",
      "questionVi": "Thông qua các hoạt động tình nguyện, tôi đã tích lũy được nhiều kinh nghiệm quý.",
      "options": [
        "を通して",
        "にわたって",
        "をはじめ",
        "にとって"
      ],
      "optionsVi": [
        "Thông qua",
        "Suốt phạm vi",
        "Trước hết là",
        "Đối với"
      ],
      "correctIndex": 0,
      "explanation": "Phương tiện trung gian gián tiếp: ボランティア活動を通して."
    }
  },
  {
    "id": "n3-skz-ni-yotte",
    "lessonId": "skz-n3-c2",
    "lessonTitle": "Chuyên đề 2: Nguyên nhân, Lý do & Kết quả",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜によって / 〜による",
    "reading": "によって / による",
    "romaji": "ni yotte / ni yoru",
    "level": "N3",
    "category": "cause",
    "meaningVi": "1. Do / Vì nguyên nhân... / 2. Bằng phương pháp... / 3. Tùy thuộc vào...",
    "structure": "N + によって / N + による + N",
    "formality": "Trang trọng",
    "nuance": "Chỉ nguyên nhân dẫn tới kết quả khách quan (bão, động đất, tai nạn).",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "N + によって",
        "example": "地震によって 被害が出た"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-yotte-1",
        "japanese": "大雨によって、電车的ダイヤが大幅に乱れました。",
        "reading": "おおあめによって、でんしゃのだいやがおおはばにみだれました。",
        "vietnamese": "Do mưa lớn nên lịch trình các chuyến tàu đã bị xáo trộn nghiêm trọng."
      }
    ],
    "quickQuiz": {
      "question": "人（　）考え方は様々だ。",
      "questionVi": "Tùy thuộc vào mỗi người mà suy nghĩ sẽ khác nhau.",
      "options": [
        "によって",
        "に対して",
        "について",
        "において"
      ],
      "optionsVi": [
        "Tùy thuộc vào",
        "Đối với",
        "Về",
        "Ở tại"
      ],
      "correctIndex": 0,
      "explanation": "Biểu thị sự khác nhau tùy từng cá nhân: 人によって."
    }
  },
  {
    "id": "n3-skz-okage-de",
    "lessonId": "skz-n3-c2",
    "lessonTitle": "Chuyên đề 2: Nguyên nhân, Lý do & Kết quả",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜おかげで / 〜おかげだ",
    "reading": "おかげで / おかげだ",
    "romaji": "okage de / okage da",
    "level": "N3",
    "category": "cause",
    "meaningVi": "Nhờ có... mà có được kết quả tốt đẹp (Biết ơn)",
    "structure": "V-thông thường / A-い / Na-な / N-の + おかげで",
    "formality": "Lịch sự",
    "nuance": "Bày tỏ lòng biết ơn đối với sự hỗ trợ của người khác hoặc yếu tố may mắn.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ/Tính từ/Danh từ",
        "rule": "Dạng bổ nghĩa danh từ + おかげで",
        "example": "先生の指導の おかげで"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-okage-1",
        "japanese": "先生が熱心に教えてくださったおかげで、JLPTに合格できました。",
        "reading": "せんせいがねっしんにおしえてくださったおかげで、じぇいえるぴーてぃーにごうかくできました。",
        "vietnamese": "Nhờ thầy giáo nhiệt tình chỉ dạy mà em đã thi đỗ kỳ thi JLPT."
      }
    ],
    "quickQuiz": {
      "question": "薬を（　）おかげで、熱が下がりました。",
      "questionVi": "Nhờ uống thuốc mà cơn sốt của tôi đã hạ.",
      "options": [
        "飲んだ",
        "飲む",
        "飲んで",
        "飲まない"
      ],
      "optionsVi": [
        "Đã uống (quá khứ)",
        "Thể từ điển",
        "Thể Te",
        "Phủ định"
      ],
      "correctIndex": 0,
      "explanation": "Kết quả tốt đã đạt được trong thực tế: 飲んだおかげで."
    }
  },
  {
    "id": "n3-skz-sei-de",
    "lessonId": "skz-n3-c2",
    "lessonTitle": "Chuyên đề 2: Nguyên nhân, Lý do & Kết quả",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜せいで / 〜せいだ",
    "reading": "せいで / せいだ",
    "romaji": "sei de / sei da",
    "level": "N3",
    "category": "cause",
    "meaningVi": "Do / Tại vì... dẫn đến kết quả xấu (Trách móc, đổ lỗi)",
    "structure": "V-thông thường / A-い / Na-な / N-の + せいで",
    "formality": "Lịch sự",
    "nuance": "Quy kết nguyên nhân dẫn tới thất bại, sai sót hay điều không mong muốn.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "N + の + せいで",
        "example": "事故の せいで 遅刻した"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-sei-1",
        "japanese": "寝坊したせいで、大事な会議に遅れてしまった。",
        "reading": "ねぼうしたせいで、だいじなかいぎにおくれてしまった。",
        "vietnamese": "Tại vì ngủ quên mà tôi đã bị muộn cuộc họp quan trọng."
      }
    ],
    "quickQuiz": {
      "question": "バスが遅れた（　）、飛行機に乗り遅れた。",
      "questionVi": "Tại xe buýt đến muộn mà tôi bị lỡ chuyến bay.",
      "options": [
        "せいで",
        "おかげで",
        "ために",
        "ように"
      ],
      "optionsVi": [
        "Tại vì (kết quả xấu)",
        "Nhờ có",
        "Để",
        "Để sao cho"
      ],
      "correctIndex": 0,
      "explanation": "Kết quả tồi tệ ngoài ý muốn: 遅れたせいで."
    }
  },
  {
    "id": "n3-skz-sei-ka",
    "lessonId": "skz-n3-c2",
    "lessonTitle": "Chuyên đề 2: Nguyên nhân, Lý do & Kết quả",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜せいか",
    "reading": "せいか",
    "romaji": "sei ka",
    "level": "N3",
    "category": "cause",
    "meaningVi": "Không biết có phải do... hay không mà (Dự đoán nguyên nhân không chắc chắn)",
    "structure": "V-thông thường / A-い / Na-な / N-の + せいか",
    "formality": "Lịch sự",
    "nuance": "Người nói phỏng đoán một nguyên nhân có thể là thủ phạm nhưng chưa dám khẳng định 100%.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "N + の + せいか",
        "example": "風邪の せいか 頭が痛い"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-seika-1",
        "japanese": "昨晩コーヒーを飲みすぎたせいか、あまり眠れなかった。",
        "reading": "さくばんこーひーをのみすぎたせいか、あまりねむれなかった。",
        "vietnamese": "Không biết có phải do tối qua uống quá nhiều cà phê hay không mà tôi khó ngủ."
      }
    ],
    "quickQuiz": {
      "question": "歳の（　）、最近疲れやすくなった。",
      "questionVi": "Có lẽ tại tuổi tác hay sao mà dạo gần đây tôi rất dễ bị mệt.",
      "options": [
        "せいか",
        "おかげで",
        "せいで",
        "ために"
      ],
      "optionsVi": [
        "Có lẽ do (không chắc)",
        "Nhờ có",
        "Tại vì (chắc chắn)",
        "Vì mục đích"
      ],
      "correctIndex": 0,
      "explanation": "Phỏng đoán nguyên nhân không đoan chắc: 歳のせいか."
    }
  },
  {
    "id": "n3-skz-ni-tsuki",
    "lessonId": "skz-n3-c2",
    "lessonTitle": "Chuyên đề 2: Nguyên nhân, Lý do & Kết quả",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜につき",
    "reading": "につき",
    "romaji": "ni tsuki",
    "level": "N3",
    "category": "cause",
    "meaningVi": "Vì lý do... (Văn phong thông báo trang trọng, niêm yết công khai)",
    "structure": "N + につき",
    "formality": "Trang trọng",
    "nuance": "Chuyên dùng trong các bảng thông báo, văn bản công cộng (vì đang sửa chữa, vì ngày nghỉ lễ).",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "N + につき",
        "example": "工事中につき 立ち入り禁止"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-nitsuki-1",
        "japanese": "本日休業につき、またのご来店をお待ちしております。",
        "reading": "ほんじつきゅうぎょうにつき、またのごらいてんをおまちしております。",
        "vietnamese": "Hôm nay quán nghỉ, xin kính mời quý khách quay lại vào dịp khác."
      }
    ],
    "quickQuiz": {
      "question": "店内改装中（　）、しばらく休業いたします。",
      "questionVi": "Vì cửa hàng đang sửa chữa nên chúng tôi xin tạm nghỉ.",
      "options": [
        "につき",
        "によって",
        "おかげで",
        "にとって"
      ],
      "optionsVi": [
        "Vì (thông báo)",
        "Do phương tiện",
        "Nhờ có",
        "Đối với"
      ],
      "correctIndex": 0,
      "explanation": "Thông báo niêm yết: 改装中につき."
    }
  },
  {
    "id": "n3-skz-koto-kara",
    "lessonId": "skz-n3-c2",
    "lessonTitle": "Chuyên đề 2: Nguyên nhân, Lý do & Kết quả",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜ことから",
    "reading": "ことから",
    "romaji": "koto kara",
    "level": "N3",
    "category": "cause",
    "meaningVi": "Chính vì sự việc... mà phán đoán / được đặt tên là / trở thành nguồn gốc",
    "structure": "V-thông thường / A-い / Na-な / N-である + ことから",
    "formality": "Trang trọng",
    "nuance": "Nêu căn cứ, nguồn gốc dẫn đến một tên gọi, danh hiệu hoặc một kết luận phán đoán khách quan.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ/Tính từ",
        "rule": "Thể thông thường + ことから",
        "example": "富士山に似ていることから"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-kotokara-1",
        "japanese": "道が濡れていることから、昨夜雨が降ったことが分かる。",
        "reading": "みちがぬれていることから、さくやあめがふったことがわかる。",
        "vietnamese": "Từ việc mặt đường bị ướt, có thể hiểu là đêm qua trời đã mưa."
      }
    ],
    "quickQuiz": {
      "question": "桜の花がきれいな（　）、この公園は「さくら公園」と呼ばれている。",
      "questionVi": "Từ việc hoa anh đào rất đẹp mà công viên này được gọi là Công viên Sakura.",
      "options": [
        "ことから",
        "ことだから",
        "ことに",
        "ことか"
      ],
      "optionsVi": [
        "Từ việc căn cứ",
        "Vì bản tính",
        "Thật là",
        "Biết bao"
      ],
      "correctIndex": 0,
      "explanation": "Nguồn gốc đặt tên căn cứ từ đặc điểm: きれいなことから."
    }
  },
  {
    "id": "n3-skz-bakari-ni",
    "lessonId": "skz-n3-c2",
    "lessonTitle": "Chuyên đề 2: Nguyên nhân, Lý do & Kết quả",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜ばかりに",
    "reading": "ばかりに",
    "romaji": "bakari ni",
    "level": "N3",
    "category": "cause",
    "meaningVi": "Chỉ vì... mà chuốc lấy hậu quả tồi tệ không đáng có (Tiếc nuối sâu sắc)",
    "structure": "V-thông thường / A-い / Na-な / N-である + ばかりに",
    "formality": "Lịch sự",
    "nuance": "Nhấn mạnh một sai lầm nhỏ hay một nguyên nhân tưởng chừng đơn giản nhưng kéo theo hậu quả cay đắng.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-thông thường + ばかりに",
        "example": "お金がない ばかりに"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-bakarini-1",
        "japanese": "パスポートを忘れたばかりに、飛行機に乗れなかった。",
        "reading": "ぱすぽーとをわすれたばかりに、ひこうきにのれなかった。",
        "vietnamese": "Chỉ vì để quên hộ chiếu mà tôi đã không thể lên máy bay."
      }
    ],
    "quickQuiz": {
      "question": "うそをついた（　）、親友の信頼を失ってしまった。",
      "questionVi": "Chỉ vì trót nói dối mà tôi đã đánh mất lòng tin của bạn thân.",
      "options": [
        "ばかりに",
        "おかげで",
        "せいで",
        "ために"
      ],
      "optionsVi": [
        "Chỉ vì... cay đắng",
        "Nhờ có",
        "Tại vì",
        "Để"
      ],
      "correctIndex": 0,
      "explanation": "Ân hận tiếc nuối vì sai sót gây hậu quả: うそをついたばかりに."
    }
  },
  {
    "id": "n3-skz-mono-dakara",
    "lessonId": "skz-n3-c2",
    "lessonTitle": "Chuyên đề 2: Nguyên nhân, Lý do & Kết quả",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜ものだから / 〜もので",
    "reading": "ものだから / もので",
    "romaji": "mono dakara / mono de",
    "level": "N3",
    "category": "cause",
    "meaningVi": "Bởi vì... (Biện bạch, phân trần lý do bất khả kháng trong đời sống)",
    "structure": "V-thông thường / A-い / Na-な / N-な + ものだから",
    "formality": "Thông thường",
    "nuance": "Dùng để giải thích cho đối phương hiểu tình cảnh của mình khi xin lỗi hoặc giải thích lý do.",
    "formationRules": [
      {
        "partOfSpeech": "Tính từ/Động từ",
        "rule": "Thể thông thường + ものだから",
        "example": "道路が混んでいた ものだから"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-monodakara-1",
        "japanese": "事故で電車が止まってしまったものだから、遅刻してしまいました。",
        "reading": "じこででんしゃがとまってしまったものだから、ちこくしてしまいました。",
        "vietnamese": "Vì do sự cố tàu bị dừng chạy nên em đã bị muộn học ạ."
      }
    ],
    "quickQuiz": {
      "question": "あまりにもおいしかった（　）、全部食べてしまいました。",
      "questionVi": "Bởi vì ngon quá nên tôi lỡ ăn sạch hết mất rồi.",
      "options": [
        "ものだから",
        "ことだから",
        "わけだから",
        "ところだから"
      ],
      "optionsVi": [
        "Bởi vì phân trần",
        "Bởi vì tính cách",
        "Thảo nào",
        "Vừa mới"
      ],
      "correctIndex": 0,
      "explanation": "Phân trần lý do cho hành động: おいしかったものだから."
    }
  },
  {
    "id": "n3-skz-kara-niwa",
    "lessonId": "skz-n3-c2",
    "lessonTitle": "Chuyên đề 2: Nguyên nhân, Lý do & Kết quả",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜からには",
    "reading": "からには",
    "romaji": "kara ni wa",
    "level": "N3",
    "category": "obligation",
    "meaningVi": "Một khi đã... thì đương nhiên phải quyết tâm làm tới cùng",
    "structure": "V-thông thường / N-である + からには",
    "formality": "Trang trọng",
    "nuance": "Vế sau luôn thể hiện quyết tâm, nghĩa vụ, mệnh lệnh hoặc phán đoán mạnh mẽ.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-thông thường + からには",
        "example": "約束した からには"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-karaniwa-1",
        "japanese": "留学を決めたからには、最後まで諦めずに頑張りたい。",
        "reading": "りゅうがくをきめたからには、さいごまであきらめずにはんばりたい。",
        "vietnamese": "Một khi đã quyết định đi du học thì tôi muốn nỗ lực tới cùng."
      }
    ],
    "quickQuiz": {
      "question": "引き受けた（　）、責任を持ってやり遂げてください。",
      "questionVi": "Một khi đã nhận lời thì anh hãy có trách nhiệm làm cho xong nhé.",
      "options": [
        "からには",
        "ばかりに",
        "せいか",
        "ために"
      ],
      "optionsVi": [
        "Một khi đã",
        "Chỉ vì",
        "Có lẽ do",
        "Để"
      ],
      "correctIndex": 0,
      "explanation": "Trách nhiệm đương nhiên: 引き受けたからには."
    }
  },
  {
    "id": "n3-skz-ni-kansuru",
    "lessonId": "skz-n3-c3",
    "lessonTitle": "Chuyên đề 3: Quan hệ, Đối tượng & Phạm vi",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜に関して / 〜に関する",
    "reading": "にかんして / にかんする",
    "romaji": "ni kanshite / ni kansuru",
    "level": "N3",
    "category": "basics",
    "meaningVi": "Liên quan đến / Về vấn đề... (Trang trọng hơn について)",
    "structure": "N + に関して / N + に関する + N",
    "formality": "Trang trọng",
    "nuance": "Dùng trong ngữ cảnh học thuật, hội nghị hoặc tài liệu văn bản để chỉ một phạm vi chủ đề rộng lớn.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "N + に関して",
        "example": "環境問題に 関して"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-kansuru-1",
        "japanese": "今回の事件に関して、詳しい調査が行われています。",
        "reading": "こんかいのじけんにかんして、くわしいちょうさがおこなわれています。",
        "vietnamese": "Liên quan đến vụ việc lần này, cuộc điều tra chi tiết đang được tiến hành."
      }
    ],
    "quickQuiz": {
      "question": "日本の経済（　）論文を書く予定です。",
      "questionVi": "Tôi dự định viết luận văn liên quan đến kinh tế Nhật Bản.",
      "options": [
        "に関する",
        "に対して",
        "によって",
        "にとって"
      ],
      "optionsVi": [
        "Liên quan đến (+ N)",
        "Đối với",
        "Bởi vì",
        "Đối với góc nhìn"
      ],
      "correctIndex": 0,
      "explanation": "Bổ nghĩa danh từ: 日本の経済に関する論文."
    }
  },
  {
    "id": "n3-skz-ni-tsuite",
    "lessonId": "skz-n3-c3",
    "lessonTitle": "Chuyên đề 3: Quan hệ, Đối tượng & Phạm vi",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜について / 〜についての",
    "reading": "について / についての",
    "romaji": "ni tsuite / ni tsuite no",
    "level": "N3",
    "category": "basics",
    "meaningVi": "Về nội dung / Về chủ đề...",
    "structure": "N + について / N + についての + N",
    "formality": "Lịch sự",
    "nuance": "Chỉ đối tượng trực tiếp mà người nói đang suy nghĩ, nói, viết hoặc nghiên cứu.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "N + について",
        "example": "将来の夢に ついて 話す"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-tsuite-1",
        "japanese": "日本の文化についてもっと知りたいです。",
        "reading": "にほんのぶんかについてもっとしりたいです。",
        "vietnamese": "Tôi muốn biết nhiều hơn về văn hóa Nhật Bản."
      }
    ],
    "quickQuiz": {
      "question": "この問題（　）、どう思われますか。",
      "questionVi": "Về vấn đề này, anh nghĩ như thế nào?",
      "options": [
        "について",
        "に対して",
        "にとって",
        "において"
      ],
      "optionsVi": [
        "Về chủ đề",
        "Hướng tới",
        "Đối với lập trường",
        "Tại nơi chốn"
      ],
      "correctIndex": 0,
      "explanation": "Ý kiến về chủ đề: この問題について."
    }
  },
  {
    "id": "n3-skz-ni-taishite",
    "lessonId": "skz-n3-c3",
    "lessonTitle": "Chuyên đề 3: Quan hệ, Đối tượng & Phạm vi",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜に対して / 〜に対する",
    "reading": "にたいして / にたいする",
    "romaji": "ni taishite / ni taisuru",
    "level": "N3",
    "category": "basics",
    "meaningVi": "1. Đối với đối tượng (thái độ) / 2. Trái ngược hoàn toàn với...",
    "structure": "N + に対して / N + に対する + N",
    "formality": "Trang trọng",
    "nuance": "Nghĩa 1: Thái độ hướng về người khác. Nghĩa 2: So sánh tương phản giữa hai đối tượng đối lập.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "N + に対して",
        "example": "お客様に 対して 丁寧に接する"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-taishite-1",
        "japanese": "兄はおとなしいのに対して、弟はとても活発だ。",
        "reading": "あにはおとなしいのにたいして、おとうとはとてもかっぱつだ。",
        "vietnamese": "Trái ngược với người anh hiền lành, người em lại rất hoạt bát."
      }
    ],
    "quickQuiz": {
      "question": "目上の人（　）失礼な言葉遣いをしてはいけません。",
      "questionVi": "Đối với người bề trên thì không được ăn nói thất lễ.",
      "options": [
        "に対して",
        "について",
        "にとって",
        "によって"
      ],
      "optionsVi": [
        "Đối với (thái độ)",
        "Về",
        "Đối với góc nhìn",
        "Bởi vì"
      ],
      "correctIndex": 0,
      "explanation": "Thái độ đối xử hướng về đối tượng: 目上の人に対して."
    }
  },
  {
    "id": "n3-skz-ni-totte",
    "lessonId": "skz-n3-c3",
    "lessonTitle": "Chuyên đề 3: Quan hệ, Đối tượng & Phạm vi",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜にとって / 〜にとっての",
    "reading": "にとって / にとっての",
    "romaji": "ni totte / ni totte no",
    "level": "N3",
    "category": "basics",
    "meaningVi": "Đối với (Đứng trên góc nhìn, lập trường hoặc đánh giá của ai đó)",
    "structure": "N(người/tổ chức) + にとって",
    "formality": "Lịch sự",
    "nuance": "Đưa ra nhận định, đánh giá mang tính chủ quan từ vị thế của một đối tượng.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ (chỉ người)",
        "rule": "N + にとって",
        "example": "私に とって 一番大切なもの"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-totte-1",
        "japanese": "現代人にとって、スマートフォンは欠かせない必需品だ。",
        "reading": "げんだいじんにとって、すまーとふぉんはかかせないひつじゅひんだ。",
        "vietnamese": "Đối với con người hiện đại, điện thoại thông minh là vật dụng thiết yếu."
      }
    ],
    "quickQuiz": {
      "question": "留学生（　）、漢字を覚えるのは大変なことだ。",
      "questionVi": "Đối với du học sinh, việc nhớ chữ Hán là một điều rất vất vả.",
      "options": [
        "にとって",
        "に対して",
        "について",
        "によって"
      ],
      "optionsVi": [
        "Đối với góc nhìn",
        "Hướng tới đối phương",
        "Về",
        "Bởi phương tiện"
      ],
      "correctIndex": 0,
      "explanation": "Lập trường của du học sinh: 留学生にとって."
    }
  },
  {
    "id": "n3-skz-o-megutte",
    "lessonId": "skz-n3-c3",
    "lessonTitle": "Chuyên đề 3: Quan hệ, Đối tượng & Phạm vi",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜をめぐって / 〜をめぐる",
    "reading": "をめぐって / をめぐる",
    "romaji": "o megutte / o meguru",
    "level": "N3",
    "category": "basics",
    "meaningVi": "Xoay quanh (tranh chấp, bàn tán, đối lập ý kiến về một vấn đề)",
    "structure": "N + をめぐって / N + をめぐる + N",
    "formality": "Trang trọng",
    "nuance": "Chủ ngữ là nhiều người tranh cãi, thảo luận hoặc giành giật một vấn đề trọng tâm.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "N + をめぐって",
        "example": "遺産を めぐって 争う"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-megutte-1",
        "japanese": "親の遺産をめぐって、兄弟の間で激しい争いが起こった。",
        "reading": "おやのいさんをめぐって、きょうだいのあいだではげしいあらそいがおこった。",
        "vietnamese": "Xoay quanh tài sản thừa kế của cha mẹ, giữa các anh em đã xảy ra tranh chấp."
      }
    ],
    "quickQuiz": {
      "question": "消費税の引き上げ（　）、国会で議論が続いている。",
      "questionVi": "Xoay quanh việc tăng thuế tiêu dùng, các cuộc tranh luận vẫn đang tiếp diễn.",
      "options": [
        "をめぐって",
        "にとって",
        "に対して",
        "によって"
      ],
      "optionsVi": [
        "Xoay quanh tranh cãi",
        "Đối với",
        "Hướng tới",
        "Do nguyên nhân"
      ],
      "correctIndex": 0,
      "explanation": "Trọng tâm cuộc tranh luận: 消費税の引き上げをめぐって."
    }
  },
  {
    "id": "n3-skz-ni-awasete",
    "lessonId": "skz-n3-c3",
    "lessonTitle": "Chuyên đề 3: Quan hệ, Đối tượng & Phạm vi",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜にあわせて / 〜にあった",
    "reading": "にあわせて / にあった",
    "romaji": "ni awasete / ni atta",
    "level": "N3",
    "category": "degree",
    "meaningVi": "Phù hợp với / Nhịp nhàng theo / Tương ứng với...",
    "structure": "N + にあわせて",
    "formality": "Lịch sự",
    "nuance": "Hành động được điều chỉnh cho tương thích, vừa vặn với hoàn cảnh.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "N + にあわせて",
        "example": "レベルに あわせて 教える"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-awasete-1",
        "japanese": "生徒のレベルにあわせて、教材を変えています。",
        "reading": "せいとのれべるにあわせて、きょうざいをかえています。",
        "vietnamese": "Phù hợp với trình độ của học sinh, chúng tôi thay đổi giáo trình."
      }
    ],
    "quickQuiz": {
      "question": "気温の変化（　）服を選びましょう。",
      "questionVi": "Hãy chọn trang phục phù hợp với sự thay đổi của nhiệt độ nhé.",
      "options": [
        "にあわせて",
        "について",
        "に対して",
        "によって"
      ],
      "optionsVi": [
        "Phù hợp với",
        "Về",
        "Hướng tới",
        "Do nguyên nhân"
      ],
      "correctIndex": 0,
      "explanation": "Tương ứng hoàn cảnh: 気温の変化にあわせて."
    }
  },
  {
    "id": "n3-skz-ni-kotaete",
    "lessonId": "skz-n3-c3",
    "lessonTitle": "Chuyên đề 3: Quan hệ, Đối tượng & Phạm vi",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜にこたえて / 〜にこたえる",
    "reading": "にこたえて / にこたえる",
    "romaji": "ni kotaete / ni kotaeru",
    "level": "N3",
    "category": "basics",
    "meaningVi": "Đáp lại (kỳ vọng, lòng tin, yêu cầu, tiếng cổ vũ của người khác)",
    "structure": "N(kỳ vọng) + にこたえて",
    "formality": "Trang trọng",
    "nuance": "Thường đi với 期待 (kỳ vọng), 要望 (nguyện vọng), 声援 (cổ vũ). Hành động để không phụ lòng mong đợi.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "N + にこたえて",
        "example": "ファンの期待に こたえる"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-kotaete-1",
        "japanese": "ファンの声援にこたえて、選手たちは全力でプレーした。",
        "reading": "ふぁんのせいえんにこたえて、せんしゅたちはぜんりょくでぷれーした。",
        "vietnamese": "Đáp lại sự cổ vũ của người hâm mộ, các cầu thủ đã thi đấu hết mình."
      }
    ],
    "quickQuiz": {
      "question": "親の期待（　）、試験で一番を取った。",
      "questionVi": "Đáp lại kỳ vọng của cha mẹ, em đã giành vị trí thủ khoa.",
      "options": [
        "にこたえて",
        "にたいして",
        "にとって",
        "について"
      ],
      "optionsVi": [
        "Đáp lại kỳ vọng",
        "Hướng tới",
        "Đối với",
        "Về"
      ],
      "correctIndex": 0,
      "explanation": "Đáp lại mong đợi: 親の期待にこたえて."
    }
  },
  {
    "id": "n3-skz-you-ni",
    "lessonId": "skz-n3-c4",
    "lessonTitle": "Chuyên đề 4: Mục đích & Ý chí",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜ように / 〜ないように",
    "reading": "ように / ないように",
    "romaji": "you ni / nai you ni",
    "level": "N3",
    "category": "purpose",
    "meaningVi": "Để / Để sao cho... (Động từ vế trước là thể khả năng / tự động từ / không ý chí)",
    "structure": "V-khả năng / V-tự / V-ない + ように",
    "formality": "Lịch sự",
    "nuance": "Biểu thị mục đích đạt tới một trạng thái nào đó. Trái với ために vốn đi với động từ ý chí của cùng một chủ ngữ.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-khả năng / V-không ý chí + ように",
        "example": "聞こえる ように 大きな声で話す"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-youni-1",
        "japanese": "風邪を引かないように、温かくして寝てください。",
        "reading": "かぜをひかないように、あたたかくしてねてください。",
        "vietnamese": "Để không bị cảm cúm, hãy giữ ấm rồi đi ngủ nhé."
      }
    ],
    "quickQuiz": {
      "question": "後ろの人にもよく（　）ように、大きく書いてください。",
      "questionVi": "Để người ngồi phía sau cũng nhìn thấy rõ, xin hãy viết chữ to lên.",
      "options": [
        "見える",
        "見る",
        "見よう",
        "見られる"
      ],
      "optionsVi": [
        "Nhìn thấy (khả năng tự động từ)",
        "Xem (ý chí)",
        "Định xem",
        "Bị xem"
      ],
      "correctIndex": 0,
      "explanation": "Đi với ように là động từ khả năng/tự động từ: 見えるように."
    }
  },
  {
    "id": "n3-skz-tame-ni",
    "lessonId": "skz-n3-c4",
    "lessonTitle": "Chuyên đề 4: Mục đích & Ý chí",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜ために / 〜ための",
    "reading": "ために / ための",
    "romaji": "tame ni / tame no",
    "level": "N3",
    "category": "purpose",
    "meaningVi": "Để / Nhằm mục đích... (Động từ ý chí có chủ đích rõ ràng)",
    "structure": "V-る / N の + ために",
    "formality": "Lịch sự",
    "nuance": "Chủ ngữ cố tình thực hiện hành động vế sau để đạt mục đích vế trước (mua nhà, du học, tiết kiệm tiền).",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-る + ために",
        "example": "家を買う ために 貯金する"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-tameni-1",
        "japanese": "日本へ留学するために、一生懸命日本語を勉強しています。",
        "reading": "にほんへりゅうがくするために、いっしょうけんめいにほんごをべんきょうしています。",
        "vietnamese": "Để đi du học Nhật Bản, tôi đang nỗ lực hết mình học tiếng Nhật."
      }
    ],
    "quickQuiz": {
      "question": "健康の（　）、毎朝走っています。",
      "questionVi": "Vì sức khỏe, mỗi sáng tôi đều chạy bộ.",
      "options": [
        "ために",
        "ように",
        "せいで",
        "おかげで"
      ],
      "optionsVi": [
        "Vì mục đích (+ N)",
        "Để",
        "Tại vì",
        "Nhờ có"
      ],
      "correctIndex": 0,
      "explanation": "N + の + ために: 健康のために."
    }
  },
  {
    "id": "n3-skz-you-ni-suru",
    "lessonId": "skz-n3-c4",
    "lessonTitle": "Chuyên đề 4: Mục đích & Ý chí",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜ようにする",
    "reading": "ようにする",
    "romaji": "you ni suru",
    "level": "N3",
    "category": "purpose",
    "meaningVi": "Cố gắng làm / Rèn luyện thói quen làm gì đều đặn",
    "structure": "V-る / V-ない + ようにする",
    "formality": "Lịch sự",
    "nuance": "Biểu thị nỗ lực tạo lập thói quen sinh hoạt tốt (ăn rau, dậy sớm, không thức khuya).",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-る / V-ない + ようにする",
        "example": "毎日野菜を食べる ようにする"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-younisuru-1",
        "japanese": "毎晩11時前には寝るようにしています。",
        "reading": "まいばんじゅういちじまえにはねるようにしています。",
        "vietnamese": "Tôi luôn cố gắng đi ngủ trước 11 giờ mỗi tối."
      }
    ],
    "quickQuiz": {
      "question": "油っこいものはあまり（　）ようにしている。",
      "questionVi": "Tôi đang cố gắng hạn chế không ăn đồ dầu mỡ.",
      "options": [
        "食べない",
        "食べる",
        "食べた",
        "食べよう"
      ],
      "optionsVi": [
        "Không ăn (V-nai)",
        "Ăn",
        "Đã ăn",
        "Thể ý định"
      ],
      "correctIndex": 0,
      "explanation": "Cố gắng không làm việc gì: 食べないようにしている."
    }
  },
  {
    "id": "n3-skz-you-ni-naru",
    "lessonId": "skz-n3-c4",
    "lessonTitle": "Chuyên đề 4: Mục đích & Ý chí",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜ようになる",
    "reading": "ようになる",
    "romaji": "you ni naru",
    "level": "N3",
    "category": "purpose",
    "meaningVi": "Đã có thể làm được... (Biến đổi năng lực/thói quen từ không sang có)",
    "structure": "V-る / V-khả năng + ようになる",
    "formality": "Lịch sự",
    "nuance": "Quá trình chuyển biến năng lực hoặc thói quen theo thời gian (trước đây không nói được, giờ đã nói trôi chảy).",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-khả năng + ようになる",
        "example": "日本語が話せる ようになった"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-youninaru-1",
        "japanese": "練習を重ねて、少しずつ泳げるようになりました。",
        "reading": "れんしゅうをかさねて、すこしずつおよげるようになりました。",
        "vietnamese": "Sau nhiều lần luyện tập, từng chút một tôi đã có thể bơi được."
      }
    ],
    "quickQuiz": {
      "question": "眼鏡をかければ、黒板の字がよく（　）ようになりました。",
      "questionVi": "Nếu đeo kính vào thì tôi đã nhìn rõ được chữ trên bảng.",
      "options": [
        "見える",
        "見せる",
        "見る",
        "見よう"
      ],
      "optionsVi": [
        "Nhìn thấy (khả năng)",
        "Cho xem",
        "Xem",
        "Thể ý định"
      ],
      "correctIndex": 0,
      "explanation": "Biến đổi khả năng nhìn thấy: 見えるようになった."
    }
  },
  {
    "id": "n3-skz-you-to-suru",
    "lessonId": "skz-n3-c4",
    "lessonTitle": "Chuyên đề 4: Mục đích & Ý chí",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜ようとする",
    "reading": "ようとする",
    "romaji": "you to suru",
    "level": "N3",
    "category": "purpose",
    "meaningVi": "Đang định làm gì / Vừa toan làm gì thì... / Cố gắng nỗ lực làm gì",
    "structure": "V-ý định (よう) + とする",
    "formality": "Lịch sự",
    "nuance": "Hành động chuẩn bị diễn ra ngay trước mắt trong tích tắc thì có biến cố khác chen ngang.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-ý định + とする",
        "example": "出かけ ようとした ときに 雨が降った"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-youtosuru-1",
        "japanese": "家を出ようとしたときに、電話がかかってきた。",
        "reading": "いえをでようとしたときに、でんわがかかってきた。",
        "vietnamese": "Đúng lúc tôi đang định bước ra khỏi nhà thì điện thoại reo."
      }
    ],
    "quickQuiz": {
      "question": "電車に乗（　）としたら、ドアが閉まってしまった。",
      "questionVi": "Vừa toan bước lên tàu thì cửa đã đóng sập lại.",
      "options": [
        "ろう",
        "る",
        "った",
        "り"
      ],
      "optionsVi": [
        "Ý định (norou)",
        "Thể từ điển",
        "Quá khứ",
        "Thân masu"
      ],
      "correctIndex": 0,
      "explanation": "V-ý định + とする: 乗ろうとしたら."
    }
  },
  {
    "id": "n3-skz-you-to-shinai",
    "lessonId": "skz-n3-c4",
    "lessonTitle": "Chuyên đề 4: Mục đích & Ý chí",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜ようとしない",
    "reading": "ようとしない",
    "romaji": "you to shinai",
    "level": "N3",
    "category": "purpose",
    "meaningVi": "Hoàn toàn không có ý định làm gì / Ngoan cố từ chối làm",
    "structure": "V-ý định (よう) + としない",
    "formality": "Lịch sự",
    "nuance": "Dùng để miêu tả người thứ ba ngoan cố, không chịu nỗ lực hoặc lười biếng, bướng bỉnh.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-ý định + としない",
        "example": "薬を飲もう としない"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-youtoshinai-1",
        "japanese": "息子は注意されても、自分の非を認めようとしない。",
        "reading": "むすこはちゅういされても、じぶんのひをみとめようとしない。",
        "vietnamese": "Con trai tôi dù bị nhắc nhở nhưng tuyệt đối không chịu nhận lỗi của mình."
      }
    ],
    "quickQuiz": {
      "question": "彼はいくら頼んでも、手伝（　）としない。",
      "questionVi": "Dù có nhờ thế nào thì anh ấy cũng dứt khoát không chịu giúp đỡ.",
      "options": [
        "おう",
        "う",
        "った",
        "い"
      ],
      "optionsVi": [
        "Ý định (tetsudaou)",
        "Thể từ điển",
        "Quá khứ",
        "Thân masu"
      ],
      "correctIndex": 0,
      "explanation": "Thể ý định + としない: 手伝おうとしない."
    }
  },
  {
    "id": "n3-skz-tsumori-da",
    "lessonId": "skz-n3-c4",
    "lessonTitle": "Chuyên đề 4: Mục đích & Ý chí",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜たつもり / 〜ているつもり",
    "reading": "たつもり / ているつもり",
    "romaji": "ta tsumori / te iru tsumori",
    "level": "N3",
    "category": "judgment",
    "meaningVi": "Cứ ngỡ là / Tưởng là đã... (Thực tế sự thật lại hoàn toàn khác)",
    "structure": "V-た / V-ている / A-い / Na-な / N-の + つもり",
    "formality": "Lịch sự",
    "nuance": "Chủ quan người nói đinh ninh là bản thân đã làm tốt hoặc đúng, nhưng thực tế bên ngoài lại phủ nhận điều đó.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-た + つもり",
        "example": "鍵をかけた つもりだった"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-tsumorida-1",
        "japanese": "冗談のつもりで言ったのに、彼を怒らせてしまった。",
        "reading": "じょうだんのつもりでいったのに、かれをおこらせてしまった。",
        "vietnamese": "Tôi cứ ngỡ nói đùa cho vui thế mà lại làm anh ấy giận mất rồi."
      }
    ],
    "quickQuiz": {
      "question": "自分では若（　）つもりだが、体力が落ちてきた。",
      "questionVi": "Tự bản thân cứ ngỡ mình còn trẻ nhưng thể lực đã giảm sút.",
      "options": [
        "い",
        "く",
        "かった",
        "くて"
      ],
      "optionsVi": [
        "Nguyên thể i (wakai)",
        "Liên từ",
        "Quá khứ",
        "Thể Te"
      ],
      "correctIndex": 0,
      "explanation": "Tính từ đuôi -i bổ nghĩa cho tsumori: 若いつもり."
    }
  },
  {
    "id": "n3-skz-wake-niwa-ikanai",
    "lessonId": "skz-n3-c5",
    "lessonTitle": "Chuyên đề 5: Bắt buộc, Đạo đức & Khuyên bảo",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜わけにはいかない",
    "reading": "わけにはいかない",
    "romaji": "wake ni wa ikanai",
    "level": "N3",
    "category": "obligation",
    "meaningVi": "Không thể làm vì đạo đức, lương tâm, nguyên tắc xã hội",
    "structure": "V-る + わけにはいかない",
    "formality": "Lịch sự",
    "nuance": "Bản thân có khả năng làm được về mặt thể chất nhưng vì chuẩn mực đạo đức, trách nhiệm xã hội hoặc lương tâm không cho phép làm.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-る + わけにはいかない",
        "example": "休む わけにはいかない"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-wakeikanai-1",
        "japanese": "大事な試験があるので、風邪を引いたからといって休むわけにはいかない。",
        "reading": "だいじなしけんがあるので、かぜをひいたからといってやすむわけにはいかない。",
        "vietnamese": "Vì có kỳ thi quan trọng nên dù bị cảm cúm tôi cũng không thể nghỉ được."
      }
    ],
    "quickQuiz": {
      "question": "車を運転するので、お酒を（　）わけにはいかない。",
      "questionVi": "Vì tôi phải lái xe nên không thể uống rượu được.",
      "options": [
        "飲む",
        "飲んだ",
        "飲まない",
        "飲め"
      ],
      "optionsVi": [
        "Thể từ điển (Nomu)",
        "Quá khứ",
        "Phủ định",
        "Mệnh lệnh"
      ],
      "correctIndex": 0,
      "explanation": "V-る + わけにはいかない: 飲むわけにはいかない."
    }
  },
  {
    "id": "n3-skz-nai-wake-niwa-ikanai",
    "lessonId": "skz-n3-c5",
    "lessonTitle": "Chuyên đề 5: Bắt buộc, Đạo đức & Khuyên bảo",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜ないわけにはいかない",
    "reading": "ないわけにはいかない",
    "romaji": "nai wake ni wa ikanai",
    "level": "N3",
    "category": "obligation",
    "meaningVi": "Không thể không làm / Buộc phải làm vì bổn phận trách nhiệm",
    "structure": "V-ない + わけにはいかない",
    "formality": "Lịch sự",
    "nuance": "Phủ định của phủ định = bắt buộc phải làm vì áp lực tình thế hoặc luân thường đạo lý.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-ない + わけにはいかない",
        "example": "行かない わけにはいかない"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-naiwake-1",
        "japanese": "親友の結婚式だから、どんなに忙しくても出席しないわけにはいかない。",
        "reading": "しんゆうのけっこんしきだから、どんなにいそがしくてもしゅっせきしないわけにはいかない。",
        "vietnamese": "Vì là đám cưới của bạn thân nên dù bận đến mấy tôi cũng không thể không đến dự."
      }
    ],
    "quickQuiz": {
      "question": "お世話になった先輩の頼みだから、（　）わけにはいかない。",
      "questionVi": "Vì là nhờ vả của tiền bối đã giúp đỡ mình nên tôi không thể từ chối.",
      "options": [
        "断らない",
        "断る",
        "断った",
        "断ろう"
      ],
      "optionsVi": [
        "Phủ định (Kotowaranai)",
        "Khẳng định",
        "Quá khứ",
        "Ý định"
      ],
      "correctIndex": 0,
      "explanation": "V-ない + わけにはいかない: 断らないわけにはいかない."
    }
  },
  {
    "id": "n3-skz-zaru-o-enai",
    "lessonId": "skz-n3-c5",
    "lessonTitle": "Chuyên đề 5: Bắt buộc, Đạo đức & Khuyên bảo",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜ざるを得ない",
    "reading": "ざるをえない",
    "romaji": "zaru o enai",
    "level": "N3",
    "category": "obligation",
    "meaningVi": "Đành phải làm / Không còn lựa chọn nào khác ngoài việc...",
    "structure": "V-ない(bỏ ない) + ざるを得ない (する -> せざるを得ない)",
    "formality": "Trang trọng",
    "nuance": "Bản thân người nói thực lòng không muốn làm nhưng do hoàn cảnh ép buộc nên đành phải cắn răng chấp nhận.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-nai (bỏ ない) + ざるを得ない",
        "example": "諦め ざるを得ない"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-zaru-1",
        "japanese": "台風で電車が止まってしまったので、歩いて帰らざるを得ない。",
        "reading": "たいふうででんしゃがとまってしまったので、あるいてかえらざるをえない。",
        "vietnamese": "Do bão làm tàu dừng chạy nên tôi đành phải đi bộ về nhà."
      }
    ],
    "quickQuiz": {
      "question": "証拠が揃っているので、犯行を（　）ざるを得ない。",
      "questionVi": "Vì chứng cứ đã đầy đủ nên nghi phạm đành phải thừa nhận hành vi phạm tội.",
      "options": [
        "認め",
        "認める",
        "認めた",
        "認めない"
      ],
      "optionsVi": [
        "Thân phủ định bỏ nai (Mitome)",
        "Thể từ điển",
        "Quá khứ",
        "Phủ định có nai"
      ],
      "correctIndex": 0,
      "explanation": "Công thức: 認め(ない) + ざるを得ない."
    }
  },
  {
    "id": "n3-skz-beki-da",
    "lessonId": "skz-n3-c5",
    "lessonTitle": "Chuyên đề 5: Bắt buộc, Đạo đức & Khuyên bảo",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜べきだ / 〜べきではない",
    "reading": "べきだ / べきではない",
    "romaji": "beki da / beki dewa nai",
    "level": "N3",
    "category": "obligation",
    "meaningVi": "Nên / Không nên làm theo luân thường đạo lý và lương tâm",
    "structure": "V-る + べきだ (する -> すべきだ / するべきだ)",
    "formality": "Trang trọng",
    "nuance": "Đưa ra lời khuyên hoặc quan điểm mang tính đạo đức phổ quát, không dùng cho các quy định pháp luật ép buộc cứng nhắc.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-る + べきだ",
        "example": "約束は守る べきだ"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-beki-1",
        "japanese": "若いうちに、できるだけ多くの本を読むべきだ。",
        "reading": "わかいうちに、できるだけおおくのほんをよむべきだ。",
        "vietnamese": "Nhân lúc còn trẻ, ta nên đọc càng nhiều sách càng tốt."
      }
    ],
    "quickQuiz": {
      "question": "借りたお金は期日までに（　）べきだ。",
      "questionVi": "Tiền đã mượn thì nên trả đúng kỳ hạn.",
      "options": [
        "返す",
        "返した",
        "返して",
        "返そう"
      ],
      "optionsVi": [
        "Thể từ điển (Kaesu)",
        "Quá khứ",
        "Thể Te",
        "Thể ý định"
      ],
      "correctIndex": 0,
      "explanation": "V-る + べきだ: 返すべきだ."
    }
  },
  {
    "id": "n3-skz-mono-da",
    "lessonId": "skz-n3-c5",
    "lessonTitle": "Chuyên đề 5: Bắt buộc, Đạo đức & Khuyên bảo",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜ものだ / 〜ものではない",
    "reading": "ものだ / ものではない",
    "romaji": "mono da / mono dewa nai",
    "level": "N3",
    "category": "obligation",
    "meaningVi": "Là thứ đương nhiên nên / Không ai lại đi làm chuyện vô lý đó",
    "structure": "V-る / V-ない + ものだ",
    "formality": "Lịch sự",
    "nuance": "Nêu lên chân lý, quy luật xã hội hay thường thức tự nhiên mà mọi người đều ngầm hiểu và thừa nhận.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-る + ものだ",
        "example": "人の悪口は 言うものではない"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-monoda-1",
        "japanese": "目上の人には敬語を使うものだ。",
        "reading": "めうえのひとにはけいごをつかうものだ。",
        "vietnamese": "Với người bề trên thì đương nhiên phải dùng kính ngữ."
      }
    ],
    "quickQuiz": {
      "question": "他人の秘密を簡単に（　）ものではない。",
      "questionVi": "Không ai lại đi tiết lộ bí mật của người khác một cách dễ dàng.",
      "options": [
        "話す",
        "話した",
        "話して",
        "話そう"
      ],
      "optionsVi": [
        "Thể từ điển (Hanasu)",
        "Quá khứ",
        "Thể Te",
        "Thể ý định"
      ],
      "correctIndex": 0,
      "explanation": "V-る + ものではない: 話すものではない."
    }
  },
  {
    "id": "n3-skz-koto-da",
    "lessonId": "skz-n3-c5",
    "lessonTitle": "Chuyên đề 5: Bắt buộc, Đạo đức & Khuyên bảo",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜ことだ",
    "reading": "ことだ",
    "romaji": "koto da",
    "level": "N3",
    "category": "obligation",
    "meaningVi": "Cách tốt nhất là nên... (Lời khuyên chân thành từ kinh nghiệm)",
    "structure": "V-る / V-ない + ことだ",
    "formality": "Lịch sự",
    "nuance": "Dùng khi người có kinh nghiệm khuyên bảo trực tiếp người khác phương pháp tối ưu để đạt kết quả tốt.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-る / V-ない + ことだ",
        "example": "毎日練習する ことだ"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-kotoda-1",
        "japanese": "日本語が上手になりたければ、恥ずかしがらずに話すことだ。",
        "reading": "にほんごがじょうずになりたければ、はずかしがらずにはなすことだ。",
        "vietnamese": "Nếu muốn giỏi tiếng Nhật thì cách tốt nhất là không được ngại ngùng mà hãy nói thật nhiều."
      }
    ],
    "quickQuiz": {
      "question": "健康でいたければ、無理を（　）ことだ。",
      "questionVi": "Nếu muốn giữ gìn sức khỏe thì cách tốt nhất là đừng làm việc quá sức.",
      "options": [
        "しない",
        "する",
        "した",
        "しよう"
      ],
      "optionsVi": [
        "Không làm (Shinai)",
        "Làm",
        "Đã làm",
        "Ý định"
      ],
      "correctIndex": 0,
      "explanation": "Khuyên không nên làm quá sức: 無理をしないことだ."
    }
  },
  {
    "id": "n3-skz-wari-ni",
    "lessonId": "skz-n3-c6",
    "lessonTitle": "Chuyên đề 6: So sánh, Mức độ & Giới hạn",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜わりに（は）",
    "reading": "わりには",
    "romaji": "wari ni (wa)",
    "level": "N3",
    "category": "degree",
    "meaningVi": "So với... thì tương đối / Không tương xứng với tỷ lệ chuẩn",
    "structure": "V-thông thường / A-い / Na-な / N-の + わりに",
    "formality": "Lịch sự",
    "nuance": "Biểu thị sự bất tương xứng giữa nguyên nhân và kết quả (so với giá tiền thì ngon bất ngờ, so với tuổi tác thì trẻ trung).",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "N + の + わりに",
        "example": "値段の わりに 美味しい"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-warini-1",
        "japanese": "このレストランは値段のわりに、料理がとても美味しい。",
        "reading": "このれすとらんはねだんのわりに、りょうりがとてもおいしい。",
        "vietnamese": "Nhà hàng này so với mức giá thì đồ ăn tương đối là ngon."
      }
    ],
    "quickQuiz": {
      "question": "彼はたくさん食べる（　）、全然太らない。",
      "questionVi": "Anh ấy ăn nhiều thế mà so ra lại chẳng hề tăng cân.",
      "options": [
        "わりに",
        "にしては",
        "反面",
        "ために"
      ],
      "optionsVi": [
        "So với tỷ lệ (wari ni)",
        "Tuy là",
        "Mặt khác",
        "Vì"
      ],
      "correctIndex": 0,
      "explanation": "Bất tương xứng giữa lượng ăn và cân nặng: 食べるわりに."
    }
  },
  {
    "id": "n3-skz-ni-shite-wa",
    "lessonId": "skz-n3-c6",
    "lessonTitle": "Chuyên đề 6: So sánh, Mức độ & Giới hạn",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜にしては",
    "reading": "にしては",
    "romaji": "ni shite wa",
    "level": "N3",
    "category": "degree",
    "meaningVi": "Tuy là... thế mà lại... (Khác xa so với tiêu chuẩn thông thường của đối tượng)",
    "structure": "V-thông thường / A-い / Na / N + にしては",
    "formality": "Lịch sự",
    "nuance": "Đi với đối tượng cụ thể (người mới học 1 tháng, đứa trẻ 5 tuổi) để khen ngợi hoặc ngạc nhiên vì vượt xa tiêu chuẩn thông thường.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "N + にしては",
        "example": "日本語を勉強して1ヶ月 にしては 上手だ"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-nishitewa-1",
        "japanese": "彼は日本に来てまだ3ヶ月にしては、日本語がとても流暢だ。",
        "reading": "かれはにほんにきてまださんかげつにしては、にほんごがとてもりゅうちょうだ。",
        "vietnamese": "Tuy anh ấy mới sang Nhật được 3 tháng thế mà tiếng Nhật lại nói rất lưu loát."
      }
    ],
    "quickQuiz": {
      "question": "この絵は子供が描いた（　）、とても上手だ。",
      "questionVi": "Bức tranh này tuy là trẻ con vẽ nhưng lại rất khéo.",
      "options": [
        "にしては",
        "わりに",
        "反面",
        "によって"
      ],
      "optionsVi": [
        "Tuy là (vượt chuẩn đối tượng)",
        "So với tỷ lệ",
        "Mặt khác",
        "Bởi vì"
      ],
      "correctIndex": 0,
      "explanation": "Vượt xa tiêu chuẩn trẻ con: 子供が描いたにしては."
    }
  },
  {
    "id": "n3-skz-ni-kurabete",
    "lessonId": "skz-n3-c6",
    "lessonTitle": "Chuyên đề 6: So sánh, Mức độ & Giới hạn",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜に比べて",
    "reading": "にくらべて",
    "romaji": "ni kurabete",
    "level": "N3",
    "category": "degree",
    "meaningVi": "So với A thì B...",
    "structure": "N + に比べて",
    "formality": "Lịch sự",
    "nuance": "Đặt hai sự vật hoặc hai mốc thời gian lên bàn cân để đối chiếu mức độ hơn kém rõ rệt.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "N + に比べて",
        "example": "去年に 比べて 暖かい"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-kurabete-1",
        "japanese": "今年は去年に比べて、雨の日が非常に多い。",
        "reading": "ことしはきょねんにくらべて、あめのひがひじょうにおおい。",
        "vietnamese": "Năm nay so với năm ngoái thì số ngày mưa nhiều hơn hẳn."
      }
    ],
    "quickQuiz": {
      "question": "兄（　）、弟は運動が得意だ。",
      "questionVi": "So với anh trai thì người em lại chơi thể thao rất cừ.",
      "options": [
        "に比べて",
        "に対して",
        "にとって",
        "について"
      ],
      "optionsVi": [
        "So với (đối chiếu)",
        "Đối với thái độ",
        "Góc nhìn",
        "Về"
      ],
      "correctIndex": 0,
      "explanation": "Đối chiếu hai đối tượng: 兄に比べて."
    }
  },
  {
    "id": "n3-skz-hodo",
    "lessonId": "skz-n3-c6",
    "lessonTitle": "Chuyên đề 6: So sánh, Mức độ & Giới hạn",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜ほど",
    "reading": "ほど",
    "romaji": "hodo",
    "level": "N3",
    "category": "degree",
    "meaningVi": "Đến mức mà... / Càng... càng...",
    "structure": "V-る / A-い / Na-な / N + ほど",
    "formality": "Lịch sự",
    "nuance": "1. Cường điệu hóa mức độ (mệt đến mức không nhấc nổi chân). 2. Đi kèm thể điều kiện để diễn tả mức độ tăng tiến tỷ lệ thuận.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-る + ほど",
        "example": "泣きたい ほど 嬉しい"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-hodo-1",
        "japanese": "涙が出るほど嬉しかったです。",
        "reading": "なみだがでるほどうれしかったです。",
        "vietnamese": "Tôi vui mừng đến mức rơi cả nước mắt."
      }
    ],
    "quickQuiz": {
      "question": "死ぬ（　）忙しい毎日を送っています。",
      "questionVi": "Tôi đang trải qua chuỗi ngày bận đến mức muốn chết đi được.",
      "options": [
        "ほど",
        "くらい",
        "ばかり",
        "さえ"
      ],
      "optionsVi": [
        "Đến mức mà (cường điệu)",
        "Khoảng",
        "Toàn là",
        "Ngay cả"
      ],
      "correctIndex": 0,
      "explanation": "Cường điệu mức độ: 死ぬほど."
    }
  },
  {
    "id": "n3-skz-hodo-nai",
    "lessonId": "skz-n3-c6",
    "lessonTitle": "Chuyên đề 6: So sánh, Mức độ & Giới hạn",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜ほど〜ない",
    "reading": "ほど〜ない",
    "romaji": "hodo ~ nai",
    "level": "N3",
    "category": "degree",
    "meaningVi": "Không có gì bằng... / Không ai bằng...",
    "structure": "N + ほど + [Tính từ / Động từ thể Phủ định]",
    "formality": "Lịch sự",
    "nuance": "Khẳng định danh từ N là đứng vị trí số một, không có bất kỳ thứ gì có thể sánh kịp.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "N + ほど〜ない",
        "example": "健康 ほど 大切なものはない"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-hodonai-1",
        "japanese": "健康ほど大切なものはありません。",
        "reading": "けんこうほどたいせつなものはありません。",
        "vietnamese": "Không có thứ gì quan trọng bằng sức khỏe."
      }
    ],
    "quickQuiz": {
      "question": "母の料理（　）おいしいものはない。",
      "questionVi": "Không có món nào ngon bằng cơm mẹ nấu.",
      "options": [
        "ほど",
        "ばかり",
        "さえ",
        "から"
      ],
      "optionsVi": [
        "Bằng (so sánh nhất phủ định)",
        "Toàn là",
        "Ngay cả",
        "Từ"
      ],
      "correctIndex": 0,
      "explanation": "So sánh nhất dạng phủ định: 母の料理ほど."
    }
  },
  {
    "id": "n3-skz-kurai",
    "lessonId": "skz-n3-c6",
    "lessonTitle": "Chuyên đề 6: So sánh, Mức độ & Giới hạn",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜くらい / 〜ぐらい",
    "reading": "くらい / ぐらい",
    "romaji": "kurai / gurai",
    "level": "N3",
    "category": "degree",
    "meaningVi": "Đến mức độ... / Cỡ như là...",
    "structure": "V-thông thường / A-い / Na-な / N + くらい",
    "formality": "Lịch sự",
    "nuance": "Đưa ra một mức độ tối thiểu hoặc mức độ ước chừng để so sánh ví von nhẹ nhàng hơn ほど.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "N + くらい",
        "example": "簡単な挨拶 くらい はできる"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-kurai-1",
        "japanese": "簡単な日本語の挨拶くらいは話せるようになりたい。",
        "reading": "かんたんなにほんごのあいさつくらいははなせるようになりたい。",
        "vietnamese": "Tôi muốn chí ít cũng có thể nói được cỡ những câu chào hỏi tiếng Nhật đơn giản."
      }
    ],
    "quickQuiz": {
      "question": "自分のお茶（　）自分でいれなさい。",
      "questionVi": "Chí ít cỡ như nước trà của mình thì hãy tự đi mà pha lấy.",
      "options": [
        "ぐらい",
        "ほど",
        "ばかり",
        "から"
      ],
      "optionsVi": [
        "Cỡ như tối thiểu",
        "Đến mức",
        "Toàn là",
        "Từ"
      ],
      "correctIndex": 0,
      "explanation": "Mức độ tối thiểu giản đơn: 自分のお茶ぐらい."
    }
  },
  {
    "id": "n3-skz-bakari",
    "lessonId": "skz-n3-c6",
    "lessonTitle": "Chuyên đề 6: So sánh, Mức độ & Giới hạn",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜ばかり / 〜ばかりいる",
    "reading": "ばかり / ばかりいる",
    "romaji": "bakari / bakari iru",
    "level": "N3",
    "category": "degree",
    "meaningVi": "Toàn là... / Suốt ngày chỉ toàn làm gì (Ý phê phán, chê trách)",
    "structure": "V-て + ばかりいる / N + ばかり",
    "formality": "Thông thường",
    "nuance": "Diễn tả hành động hoặc sự vật diễn ra với tần suất quá nhiều khiến người nói cảm thấy chướng mắt, phê phán.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-て + ばかりいる",
        "example": "遊んで ばかりいる"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-bakari-1",
        "japanese": "弟は勉強しないで、毎日ゲームばかりしている。",
        "reading": "おとうとはべんきょうしないで、まいにちげーむばかりしている。",
        "vietnamese": "Em trai tôi không chịu học bài mà ngày nào cũng chỉ toàn chơi game."
      }
    ],
    "quickQuiz": {
      "question": "文句（　）言っていないで、手を動かしてください。",
      "questionVi": "Đừng có chỉ toàn cằn nhằn nữa, hãy bắt tay vào làm việc đi.",
      "options": [
        "ばかり",
        "ほど",
        "さえ",
        "くらい"
      ],
      "optionsVi": [
        "Toàn là (phê phán)",
        "Đến mức",
        "Ngay cả",
        "Khoảng"
      ],
      "correctIndex": 0,
      "explanation": "N + ばかり: 文句ばかり."
    }
  },
  {
    "id": "n3-skz-dokoroka",
    "lessonId": "skz-n3-c6",
    "lessonTitle": "Chuyên đề 6: So sánh, Mức độ & Giới hạn",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜どころか",
    "reading": "どころか",
    "romaji": "dokoro ka",
    "level": "N3",
    "category": "degree",
    "meaningVi": "Đâu chỉ có thế, trái lại còn... (Khác xa so với kỳ vọng)",
    "structure": "V-thông thường / Na / N + どころか",
    "formality": "Lịch sự",
    "nuance": "Bác bỏ vế trước và khẳng định một thực tế trái ngược hoàn toàn, thường ở mức độ tệ hơn nhiều.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "N + どころか",
        "example": "貯金 どころか 借金がある"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-dokoroka-1",
        "japanese": "風邪は治るどころか、ますます悪化してしまった。",
        "reading": "かぜはなおるどころか、ますますあっかしてしまった。",
        "vietnamese": "Bệnh cảm chẳng những không khỏi mà trái lại ngày càng trở nặng hơn."
      }
    ],
    "quickQuiz": {
      "question": "漢字（　）、ひらがなもまだ読めません。",
      "questionVi": "Nói chi đến chữ Hán, ngay cả chữ Hiragana tôi còn chưa đọc được.",
      "options": [
        "どころか",
        "ばかりか",
        "にしては",
        "わりに"
      ],
      "optionsVi": [
        "Nói chi đến (bác bỏ)",
        "Không chỉ",
        "Tuy là",
        "So với"
      ],
      "correctIndex": 0,
      "explanation": "Bác bỏ vế cao để nêu vế thấp tệ hơn: 漢字どころか."
    }
  },
  {
    "id": "n3-skz-sae",
    "lessonId": "skz-n3-c6",
    "lessonTitle": "Chuyên đề 6: So sánh, Mức độ & Giới hạn",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜さえ",
    "reading": "さえ",
    "romaji": "sae",
    "level": "N3",
    "category": "degree",
    "meaningVi": "Ngay cả... / Đến cả... (Trang trọng và nhấn mạnh hơn も)",
    "structure": "N (＋trợ từ) + さえ",
    "formality": "Lịch sự",
    "nuance": "Đưa ra một ví dụ cực đoan, tối thiểu nhất để ám chỉ rằng những trường hợp khác thì đương nhiên là như vậy.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "N + さえ",
        "example": "子供で さえ 知っている"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-sae-1",
        "japanese": "忙しすぎて、昼ご飯を食べる時間さえなかった。",
        "reading": "いそがしすぎて、ひるごはんをたべるじかんさえなかった。",
        "vietnamese": "Tôi bận đến mức ngay cả thời gian ăn cơm trưa cũng chẳng có."
      }
    ],
    "quickQuiz": {
      "question": "専門家で（　）解けない難しい問題だ。",
      "questionVi": "Đây là bài toán hóc búa mà ngay cả chuyên gia cũng không giải nổi.",
      "options": [
        "さえ",
        "ほど",
        "ばかり",
        "くらい"
      ],
      "optionsVi": [
        "Ngay cả (ví dụ cực đoan)",
        "Đến mức",
        "Toàn là",
        "Khoảng"
      ],
      "correctIndex": 0,
      "explanation": "Ví dụ cực đoan: 専門家でさえ."
    }
  },
  {
    "id": "n3-skz-ni-mo-kakawarazu",
    "lessonId": "skz-n3-c7",
    "lessonTitle": "Chuyên đề 7: Nhượng bộ & Đối lập",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜にもかかわらず",
    "reading": "にもかかわらず",
    "romaji": "ni mo kakawarazu",
    "level": "N3",
    "category": "condition",
    "meaningVi": "Mặc dù... thế nhưng sự thật lại hoàn toàn trái ngược (Ngạc nhiên)",
    "structure": "V-thông thường / A-い / Na-である / N-である + にもかかわらず",
    "formality": "Trang trọng",
    "nuance": "Nhấn mạnh sự đối lập gay gắt giữa sự việc vế 1 và kết quả vế 2 vượt ra ngoài dự đoán thông thường.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "N + にもかかわらず",
        "example": "雨 にもかかわらず 大勢の人が集まった"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-kakawarazu-1",
        "japanese": "悪天候にもかかわらず、多くのファンが応援に駆けつけた。",
        "reading": "あくてんこうにもかかわらず、おおくのふぁんがおうえんにかけつけた。",
        "vietnamese": "Mặc dù thời tiết xấu thế nhưng rất đông người hâm mộ vẫn đổ xô đến cổ vũ."
      }
    ],
    "quickQuiz": {
      "question": "忙しい（　）、わざわざ手伝いに来てくれた。",
      "questionVi": "Mặc dù bận rộn nhưng anh ấy vẫn cất công đến giúp đỡ tôi.",
      "options": [
        "にもかかわらず",
        "につれて",
        "によって",
        "をはじめ"
      ],
      "optionsVi": [
        "Mặc dù (bất chấp)",
        "Cùng với",
        "Bởi vì",
        "Trước hết là"
      ],
      "correctIndex": 0,
      "explanation": "Đối lập tương phản: 忙しいにもかかわらず."
    }
  },
  {
    "id": "n3-skz-hanmen",
    "lessonId": "skz-n3-c7",
    "lessonTitle": "Chuyên đề 7: Nhượng bộ & Đối lập",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜反面",
    "reading": "はんめん",
    "romaji": "hanmen",
    "level": "N3",
    "category": "condition",
    "meaningVi": "Mặt khác / Ngược lại thì... (Hai mặt đối lập của cùng một vấn đề)",
    "structure": "V-thông thường / A-い / Na-な / N-である + 反面",
    "formality": "Trang trọng",
    "nuance": "Chỉ ra tính chất hai mặt luôn song hành (tiện lợi nhưng tốn kém, tự do nhưng cô đơn).",
    "formationRules": [
      {
        "partOfSpeech": "Tính từ",
        "rule": "A-い / Na-な + 反面",
        "example": "便利な 反面、危険もある"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-hanmen-1",
        "japanese": "一人暮らしは自由な反面、寂しさを感じることもある。",
        "reading": "ひとりぐらしはじゆうなはんめん、さびしさをかんじることもある。",
        "vietnamese": "Sống một mình thì tự do thật, nhưng mặt khác đôi khi cũng cảm thấy cô đơn."
      }
    ],
    "quickQuiz": {
      "question": "都会の生活は便利な（　）、生活費が高い。",
      "questionVi": "Cuộc sống thành thị tiện lợi nhưng mặt khác chi phí sinh hoạt lại đắt đỏ.",
      "options": [
        "反面",
        "わりに",
        "せいで",
        "ために"
      ],
      "optionsVi": [
        "Mặt khác (hai mặt đối lập)",
        "So với",
        "Tại vì",
        "Để"
      ],
      "correctIndex": 0,
      "explanation": "Hai mặt song hành: 便利な反面."
    }
  },
  {
    "id": "n3-skz-ippou-de",
    "lessonId": "skz-n3-c7",
    "lessonTitle": "Chuyên đề 7: Nhượng bộ & Đối lập",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜一方で / 〜一方だ",
    "reading": "いっぽうで / いっぽうだ",
    "romaji": "ippou de / ippou da",
    "level": "N3",
    "category": "condition",
    "meaningVi": "Một mặt thì... mặt khác thì... / Ngày càng có chiều hướng...",
    "structure": "V-thông thường / A-い / Na-な / N-である + 一方で",
    "formality": "Trang trọng",
    "nuance": "So sánh hai khía cạnh đối chiếu cùng tồn tại hoặc miêu tả sự biến đổi theo một chiều hướng liên tục.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-thông thường + 一方で",
        "example": "仕事を頑張る 一方で 趣味も楽しむ"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-ippou-1",
        "japanese": "彼は本業に励む一方で、週末はボランティア活動を行っている。",
        "reading": "かれはほんぎょうにはげむいっぽうで、しゅうまつはぼらんてぃあかつどうをおこなっている。",
        "vietnamese": "Một mặt anh ấy chăm chỉ với công việc chính, mặt khác cuối tuần lại tích cực tham gia hoạt động tình nguyện."
      }
    ],
    "quickQuiz": {
      "question": "物価が上がる（　）、給料は上がらない。",
      "questionVi": "Một mặt giá cả tăng vọt, mặt khác tiền lương lại không hề tăng.",
      "options": [
        "一方で",
        "反面",
        "わりに",
        "せいか"
      ],
      "optionsVi": [
        "Một mặt thì (đối chiếu song song)",
        "Mặt khác",
        "So với",
        "Có lẽ do"
      ],
      "correctIndex": 0,
      "explanation": "Đối chiếu hai vế song song: 物価が上がる一方で."
    }
  },
  {
    "id": "n3-skz-kuse-ni",
    "lessonId": "skz-n3-c7",
    "lessonTitle": "Chuyên đề 7: Nhượng bộ & Đối lập",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜くせに",
    "reading": "くせに",
    "romaji": "kuse ni",
    "level": "N3",
    "category": "condition",
    "meaningVi": "Thế mà / Vậy mà... (Khinh miệt, trách móc người khác)",
    "structure": "V-thông thường / A-い / Na-な / N-の + くせに",
    "formality": "Thông thường",
    "nuance": "Vế trước và vế sau mâu thuẫn, mang sắc thái bực bội, coi thường đối phương. Không dùng cho chính bản thân mình.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "N + の + くせに",
        "example": "子供の くせに 生意気だ"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-kuseni-1",
        "japanese": "彼は何も知らないくせに、知っているような顔をしている。",
        "reading": "かれはなにもしらないくせに、しっているようなかおをしている。",
        "vietnamese": "Hắn ta chẳng biết cái gì thế mà cứ làm như tinh tướng biết hết."
      }
    ],
    "quickQuiz": {
      "question": "自分では何もしない（　）、文句ばかり言う。",
      "questionVi": "Bản thân chẳng làm gì thế mà cứ toàn cằn nhằn trách móc.",
      "options": [
        "くせに",
        "わりに",
        "反面",
        "ものの"
      ],
      "optionsVi": [
        "Thế mà (trách móc)",
        "So với",
        "Mặt khác",
        "Dù vậy"
      ],
      "correctIndex": 0,
      "explanation": "Trách móc người khác: 何もしないくせに."
    }
  },
  {
    "id": "n3-skz-mono-no",
    "lessonId": "skz-n3-c7",
    "lessonTitle": "Chuyên đề 7: Nhượng bộ & Đối lập",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜ものの",
    "reading": "ものの",
    "romaji": "mono no",
    "level": "N3",
    "category": "condition",
    "meaningVi": "Mặc dù sự thật là đã... nhưng thực tế lại không như kỳ vọng",
    "structure": "V-thông thường / A-い / Na-な / N-である + ものの",
    "formality": "Trang trọng",
    "nuance": "Công nhận vế trước là sự thật hiển nhiên, nhưng vế sau lại là một thực tế chưa trọn vẹn hoặc có vấn đề phát sinh.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-thông thường + ものの",
        "example": "買った ものの 使っていない"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-monono-1",
        "japanese": "車の免許を取ったものの、運転するのが怖くて乗っていない。",
        "reading": "くるまのめんきょをとったものの、うんてんするのがこわくてのっていない。",
        "vietnamese": "Mặc dù đã lấy được bằng lái xe nhưng vì sợ nên tôi vẫn chưa dám lái."
      }
    ],
    "quickQuiz": {
      "question": "春とはいう（　）、まだ寒い日が続いています。",
      "questionVi": "Dù nói là mùa xuân rồi đấy nhưng những ngày giá lạnh vẫn đang tiếp diễn.",
      "options": [
        "ものの",
        "くせに",
        "わりに",
        "ために"
      ],
      "optionsVi": [
        "Dù vậy (thực tế chưa trọn vẹn)",
        "Thế mà",
        "So với",
        "Vì"
      ],
      "correctIndex": 0,
      "explanation": "Thành ngữ: 春とはいうものの."
    }
  },
  {
    "id": "n3-skz-to-ittemo",
    "lessonId": "skz-n3-c7",
    "lessonTitle": "Chuyên đề 7: Nhượng bộ & Đối lập",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜といっても",
    "reading": "といっても",
    "romaji": "to ittemo",
    "level": "N3",
    "category": "condition",
    "meaningVi": "Dù nói là... nhưng thực tế cũng chỉ ở mức độ nhỏ thôi",
    "structure": "Thể thông thường / N + といっても",
    "formality": "Lịch sự",
    "nuance": "Vế sau đính chính lại để đối phương không hiểu lầm hoặc không kỳ vọng quá cao so với thực tế.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ/Danh từ",
        "rule": "Từ + といっても",
        "example": "料理ができる といっても 卵焼きくらいだ"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-toittemo-1",
        "japanese": "料理ができるといっても、簡単なインスタント食品を作るくらいです。",
        "reading": "りょうりができるといっても、かんたんないんすたんとしょくひんをつくるくらいです。",
        "vietnamese": "Dù nói là biết nấu ăn đấy nhưng thực ra cũng chỉ nấu được mấy món mì ăn liền đơn giản thôi."
      }
    ],
    "quickQuiz": {
      "question": "旅行へ行った（　）、近くの温泉に一泊しただけです。",
      "questionVi": "Dù nói là đi du lịch nhưng chỉ là đi tắm suối nước nóng gần nhà 1 đêm thôi.",
      "options": [
        "といっても",
        "からには",
        "せいで",
        "わりに"
      ],
      "optionsVi": [
        "Dù nói là (đính chính)",
        "Một khi đã",
        "Tại vì",
        "So với"
      ],
      "correctIndex": 0,
      "explanation": "Đính chính mức độ: 行ったといっても."
    }
  },
  {
    "id": "n3-skz-toshitemo",
    "lessonId": "skz-n3-c7",
    "lessonTitle": "Chuyên đề 7: Nhượng bộ & Đối lập",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜としても",
    "reading": "としても",
    "romaji": "to shitemo",
    "level": "N3",
    "category": "condition",
    "meaningVi": "Cho dù giả sử có là... đi chăng nữa thì kết quả vẫn không đổi",
    "structure": "Thể thông thường + としても",
    "formality": "Lịch sự",
    "nuance": "Giả định một tình huống xấu nhất hoặc một khả năng xảy ra, nhưng vế sau khẳng định điều đó không ảnh hưởng tới quyết định.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "Thể thông thường + としても",
        "example": "失敗した としても 悔いはない"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-toshitemo-1",
        "japanese": "たとえ給料が高かったとしても、あんなブラック企業では働きたくない。",
        "reading": "たとえきゅうりょうがたかかったとしても、あんなぶらっくきぎょうでははたらきたくない。",
        "vietnamese": "Cho dù lương có cao đi chăng nữa thì tôi cũng không muốn làm việc ở công ty bóc lột như vậy."
      }
    ],
    "quickQuiz": {
      "question": "どんなに急いだ（　）、終電には間に合わないだろう。",
      "questionVi": "Dù có vội thế nào đi nữa thì chắc cũng không kịp chuyến tàu cuối đâu.",
      "options": [
        "としても",
        "とすれば",
        "としたら",
        "とすると"
      ],
      "optionsVi": [
        "Cho dù giả sử (nhượng bộ)",
        "Nếu giả định",
        "Nếu là",
        "Nếu vậy"
      ],
      "correctIndex": 0,
      "explanation": "Giả định nhượng bộ: 急いだとしても."
    }
  },
  {
    "id": "n3-skz-te-tamaranai",
    "lessonId": "skz-n3-c8",
    "lessonTitle": "Chuyên đề 8: Cảm xúc, Tâm trạng & Xu hướng",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜てたまらない",
    "reading": "てたまらない",
    "romaji": "te tamaranai",
    "level": "N3",
    "category": "degree",
    "meaningVi": "Rất / Không chịu nổi... (Cảm xúc cơ thể & khao khát mãnh liệt)",
    "structure": "V-て / A-くて / Na-で + たまらない",
    "formality": "Lịch sự",
    "nuance": "Diễn tả cảm giác thể xác hoặc tâm lý dâng trào tới mức không kìm nén nổi (ngứa, khát nước, lo lắng, muốn gặp người yêu).",
    "formationRules": [
      {
        "partOfSpeech": "Tính từ đuôi い",
        "rule": "A-くて + たまらない",
        "example": "喉が渇いて たまらない"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-tamaranai-1",
        "japanese": "家族に会いたくてたまらない。",
        "reading": "かぞくにあいたくてたまらない。",
        "vietnamese": "Tôi nhớ gia đình đến mức không chịu nổi."
      }
    ],
    "quickQuiz": {
      "question": "虫に刺されて、痒（　）たまらない。",
      "questionVi": "Bị côn trùng đốt nên ngứa không chịu nổi.",
      "options": [
        "くて",
        "い",
        "く",
        "かった"
      ],
      "optionsVi": [
        "Thể Te (Kayukute)",
        "Nguyên thể",
        "Liên từ",
        "Quá khứ"
      ],
      "correctIndex": 0,
      "explanation": "A-くて + たまらない: 痒くてたまらない."
    }
  },
  {
    "id": "n3-skz-te-shouganai",
    "lessonId": "skz-n3-c8",
    "lessonTitle": "Chuyên đề 8: Cảm xúc, Tâm trạng & Xu hướng",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜てしょうがない / 〜てしかたがない",
    "reading": "てしょうがない / てしかたがない",
    "romaji": "te shouganai / te shikata ga nai",
    "level": "N3",
    "category": "degree",
    "meaningVi": "Vô cùng... / Không biết phải làm sao vì cảm xúc quá lớn",
    "structure": "V-て / A-くて / Na-で + しょうがない",
    "formality": "Thông thường",
    "nuance": "Một trạng thái tâm lý tự nhiên nảy sinh mà ý thức con người không thể tự mình ngăn chặn hay kiểm soát được.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-て + しょうがない",
        "example": "心配で しょうがない"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-shouganai-1",
        "japanese": "昨日の夜夜更かししたせいで、眠くてしょうがない。",
        "reading": "きのうのよるよふかししたせいで、ねむくてしょうがない。",
        "vietnamese": "Tại vì tối qua thức khuya nên giờ tôi buồn ngủ không chịu được."
      }
    ],
    "quickQuiz": {
      "question": "試験の結果が気になって（　）。",
      "questionVi": "Tôi cứ thấp thỏm lo nghĩ về kết quả thi không yên.",
      "options": [
        "しょうがない",
        "たまらない",
        "いられない",
        "ならない"
      ],
      "optionsVi": [
        "Không yên (Shouganai)",
        "Không chịu nổi",
        "Không thể ở",
        "Không trở thành"
      ],
      "correctIndex": 0,
      "explanation": "Tâm trạng bồn chồn: 気になってしょうがない."
    }
  },
  {
    "id": "n3-skz-te-naranai",
    "lessonId": "skz-n3-c8",
    "lessonTitle": "Chuyên đề 8: Cảm xúc, Tâm trạng & Xu hướng",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜てならない",
    "reading": "てならない",
    "romaji": "te naranai",
    "level": "N3",
    "category": "degree",
    "meaningVi": "Hết sức / Trào dâng cảm xúc tự nhiên trong tâm can",
    "structure": "V-て / A-くて / Na-で + ならない",
    "formality": "Trang trọng",
    "nuance": "Dùng cho những cảm xúc nội tâm sâu lắng (tiếc nuối, lo âu, cảm giác linh tính chẳng lành). Văn phong trang trọng hơn しょうがない.",
    "formationRules": [
      {
        "partOfSpeech": "Tính từ",
        "rule": "Na-で + ならない",
        "example": "残念で ならない"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-naranai-1",
        "japanese": "親友が遠くへ引っ越してしまうのが、寂しくてならない。",
        "reading": "しんゆうがとおくへひっこしてしまうのが、さびしくてならない。",
        "vietnamese": "Bạn thân sắp chuyển nhà đi xa khiến trong lòng tôi dâng lên nỗi buồn khôn xiết."
      }
    ],
    "quickQuiz": {
      "question": "彼が事故に遭ったのではないかと、心配で（　）。",
      "questionVi": "Tôi cứ lo lắng không nguôi rằng liệu có phải anh ấy gặp tai nạn rồi không.",
      "options": [
        "ならない",
        "たまらない",
        "いけない",
        "すまない"
      ],
      "optionsVi": [
        "Trang trọng trong lòng (Naranai)",
        "Cơ thể",
        "Không được",
        "Không xong"
      ],
      "correctIndex": 0,
      "explanation": "Nỗi lo sâu thẳm: 心配でならない."
    }
  },
  {
    "id": "n3-skz-gimi",
    "lessonId": "skz-n3-c8",
    "lessonTitle": "Chuyên đề 8: Cảm xúc, Tâm trạng & Xu hướng",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜気味（ぎみ）",
    "reading": "ぎみ",
    "romaji": "gimi",
    "level": "N3",
    "category": "degree",
    "meaningVi": "Có vẻ / Hơi có triệu chứng... (Tình trạng tiêu cực nhẹ)",
    "structure": "V-thân bỏ ます / N + 気味",
    "formality": "Lịch sự",
    "nuance": "Biểu thị trạng thái hơi hơi nghiêng về hướng xấu tại thời điểm hiện tại (hơi sốt, hơi mệt, hơi căng thẳng).",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "N + 気味",
        "example": "風邪 気味"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-gimi-1",
        "japanese": "少し風邪気味なので、今夜は早く寝ることにします。",
        "reading": "すこしかぜぎみなので、こんやははやくねることにします。",
        "vietnamese": "Tôi thấy hơi có triệu chứng cảm cúm nên tối nay sẽ đi ngủ sớm."
      }
    ],
    "quickQuiz": {
      "question": "最近残業続きで、（　）気味だ。",
      "questionVi": "Dạo gần đây tăng ca liên tục nên tôi hơi có vẻ mệt mỏi.",
      "options": [
        "疲れ",
        "疲れる",
        "疲れた",
        "疲れて"
      ],
      "optionsVi": [
        "Thân bỏ masu (Tsukare)",
        "Thể từ điển",
        "Quá khứ",
        "Thể Te"
      ],
      "correctIndex": 0,
      "explanation": "V(bỏ ます) + 気味: 疲れ気味."
    }
  },
  {
    "id": "n3-skz-ppoi",
    "lessonId": "skz-n3-c8",
    "lessonTitle": "Chuyên đề 8: Cảm xúc, Tâm trạng & Xu hướng",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜っぽい",
    "reading": "っぽい",
    "romaji": "ppoi",
    "level": "N3",
    "category": "degree",
    "meaningVi": "Hay / Dễ / Trông có vẻ... (Tính chất hoặc tính cách dễ biến đổi)",
    "structure": "V-thân bỏ ます / A-い(bỏ い) / N + っぽい",
    "formality": "Thông thường",
    "nuance": "1. Tính cách hay nổi nóng (怒りっぽい), hay quên (忘れっぽい). 2. Trông như trẻ con (子供っぽい), trông như màu trắng (白っぽい).",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-masu (bỏ ます) + っぽい",
        "example": "忘れ っぽい"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-ppoi-1",
        "japanese": "彼は怒りっぽい性格だから、言葉に気をつけたほうがいい。",
        "reading": "かれはおこりっぽいせいかくだから、ことばにきをつけたほうがいい。",
        "vietnamese": "Anh ta tính hay nổi nóng nên bạn cẩn thận lời ăn tiếng nói thì hơn."
      }
    ],
    "quickQuiz": {
      "question": "この服はデザインが子供（　）て、私には似合わない。",
      "questionVi": "Bộ quần áo này thiết kế trông con nít quá nên không hợp với tôi.",
      "options": [
        "っぽく",
        "らしく",
        "そうに",
        "みたい"
      ],
      "optionsVi": [
        "Ppoi (tính chất)",
        "Rashiku",
        "Souni",
        "Mitai"
      ],
      "correctIndex": 0,
      "explanation": "Đặc điểm tính chất: 子供っぽくて."
    }
  },
  {
    "id": "n3-skz-gachi",
    "lessonId": "skz-n3-c8",
    "lessonTitle": "Chuyên đề 8: Cảm xúc, Tâm trạng & Xu hướng",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜がち",
    "reading": "がち",
    "romaji": "gachi",
    "level": "N3",
    "category": "degree",
    "meaningVi": "Thường hay / Dễ bị... (Xu hướng xấu lặp lại theo thói quen)",
    "structure": "V-thân bỏ ます / N + がち",
    "formality": "Lịch sự",
    "nuance": "Biểu thị tần suất dễ bị rơi vào trạng thái tiêu cực ngoài ý muốn (hay nghỉ ốm, hay quên, hay muộn giờ).",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-masu (bỏ ます) + がち",
        "example": "遅刻し がちだ"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-gachi-1",
        "japanese": "一人暮らしを始めると、栄養が偏りがちになる。",
        "reading": "ひとりぐらしをはじめると、えいようがかたよりがちになる。",
        "vietnamese": "Khi bắt đầu sống tự lập thì dinh dưỡng thường hay bị mất cân bằng."
      }
    ],
    "quickQuiz": {
      "question": "冬は運動不足に（　）なので気をつけましょう。",
      "questionVi": "Vào mùa đông thường hay bị thiếu vận động nên hãy chú ý nhé.",
      "options": [
        "なりがち",
        "なる気味",
        "なるっぽい",
        "なるほど"
      ],
      "optionsVi": [
        "Dễ bị (Nari-gachi)",
        "Gimi",
        "Ppoi",
        "Hodo"
      ],
      "correctIndex": 0,
      "explanation": "Xu hướng hay xảy ra: なりがち."
    }
  },
  {
    "id": "n3-skz-darake",
    "lessonId": "skz-n3-c8",
    "lessonTitle": "Chuyên đề 8: Cảm xúc, Tâm trạng & Xu hướng",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜だらけ",
    "reading": "だらけ",
    "romaji": "darake",
    "level": "N3",
    "category": "degree",
    "meaningVi": "Toàn là... (Phủ kín bề mặt toàn thứ tiêu cực, bẩn thỉu)",
    "structure": "N + だらけ",
    "formality": "Thông thường",
    "nuance": "Chuyên đi với những danh từ chỉ vật dơ bẩn hoặc tiêu cực (bùn đất, rác rưởi, nợ nần, lỗi sai ngớ ngẩn).",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "N + だらけ",
        "example": "間違い だらけの テスト"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-darake-1",
        "japanese": "彼の部屋はゴミだらけで、足の踏み場もない。",
        "reading": "かれのへやはごみだらけで、あしのふみばもない。",
        "vietnamese": "Phòng của cậu ta toàn là rác rưởi, đến chỗ đặt chân cũng không có."
      }
    ],
    "quickQuiz": {
      "question": "泥（　）になってサッカーボールを追いかけた。",
      "questionVi": "Người dính đầy bùn đất nhưng vẫn mải miết đuổi theo quả bóng.",
      "options": [
        "だらけ",
        "ばかり",
        "さえ",
        "ほど"
      ],
      "optionsVi": [
        "Bao phủ bề mặt tiêu cực",
        "Toàn là hành động",
        "Ngay cả",
        "Đến mức"
      ],
      "correctIndex": 0,
      "explanation": "Bùn đất phủ kín: 泥だらけ."
    }
  },
  {
    "id": "n3-skz-sae-ba",
    "lessonId": "skz-n3-c9",
    "lessonTitle": "Chuyên đề 9: Điều kiện & Giả định",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜さえ〜ば",
    "reading": "さえ〜ば",
    "romaji": "sae ~ ba",
    "level": "N3",
    "category": "condition",
    "meaningVi": "Chỉ cần... là đủ (Điều kiện duy nhất cốt lõi)",
    "structure": "N + さえ + V-ば / A-ければ / Na-なら",
    "formality": "Lịch sự",
    "nuance": "Chỉ cần đáp ứng được một điều kiện tối thiểu tiên quyết đó thì mọi thứ khác đều sẽ được giải quyết ổn thỏa.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "N + さえ + V-ば",
        "example": "薬を飲み さえすれば 治る"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-saeba-1",
        "japanese": "体さえ健康なら、どんな困難も乗り越えられる。",
        "reading": "からださえけんこうなら、どんなこんなんものりこえられる。",
        "vietnamese": "Chỉ cần cơ thể khỏe mạnh thì khó khăn nào tôi cũng có thể vượt qua."
      }
    ],
    "quickQuiz": {
      "question": "パスポート（　）あれば、入国できます。",
      "questionVi": "Chỉ cần có hộ chiếu là bạn có thể nhập cảnh.",
      "options": [
        "さえ",
        "ほど",
        "ばかり",
        "だけ"
      ],
      "optionsVi": [
        "Chỉ cần (sae ... ba)",
        "Đến mức",
        "Toàn là",
        "Chỉ"
      ],
      "correctIndex": 0,
      "explanation": "Công thức: パスポートさえあれば."
    }
  },
  {
    "id": "n3-skz-tatoe-temo",
    "lessonId": "skz-n3-c9",
    "lessonTitle": "Chuyên đề 9: Điều kiện & Giả định",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "たとえ〜ても",
    "reading": "たとえ〜ても",
    "romaji": "tatoe ~ temo",
    "level": "N3",
    "category": "condition",
    "meaningVi": "Cho dù... đi chăng nữa thì vẫn quyết giữ lập trường",
    "structure": "たとえ + V-ても / A-くても / Na-でも / N-でも",
    "formality": "Lịch sự",
    "nuance": "Đưa ra tình huống giả định khó khăn hay trắc trở nhất, nhưng vế sau khẳng định quyết tâm không hề lung lay.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "たとえ + V-ても",
        "example": "たとえ 反対されても"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-tatoetemo-1",
        "japanese": "たとえ両親に反対されても、私は自分の夢を追いかけます。",
        "reading": "たとえりょうしんにはんたいされても、わたしはじぶんのゆめをおいかけます。",
        "vietnamese": "Cho dù có bị bố mẹ phản đối đi nữa, tôi vẫn quyết tâm theo đuổi ước mơ của mình."
      }
    ],
    "quickQuiz": {
      "question": "（　）失敗しても、諦めずにやり直します。",
      "questionVi": "Cho dù có thất bại, tôi cũng không bỏ cuộc mà làm lại từ đầu.",
      "options": [
        "たとえ",
        "もし",
        "いくら",
        "どうしても"
      ],
      "optionsVi": [
        "Tatoe (đi với temo)",
        "Moshi (đi với tara)",
        "Ikura",
        "Dù thế nào"
      ],
      "correctIndex": 0,
      "explanation": "Đi cặp với 〜ても là たとえ."
    }
  },
  {
    "id": "n3-skz-to-shitara",
    "lessonId": "skz-n3-c9",
    "lessonTitle": "Chuyên đề 9: Điều kiện & Giả định",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜としたら / 〜とすれば",
    "reading": "としたら / とすれば",
    "romaji": "to shitara / to sureba",
    "level": "N3",
    "category": "condition",
    "meaningVi": "Nếu giả sử... (Đưa ra giả thiết tưởng tượng)",
    "structure": "Thể thông thường + としたら",
    "formality": "Lịch sự",
    "nuance": "Đặt ra một giả định không có thật ở hiện tại hoặc một khả năng trong tương lai để bàn luận về phản ứng tiếp theo.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "Thể thông thường + としたら",
        "example": "生まれ変われる としたら"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-toshitara-1",
        "japanese": "もし生まれ変われるとしたら、鳥になりたいです。",
        "reading": "もしうまれかわれるとしたら、とりになりたいです。",
        "vietnamese": "Nếu giả sử được sinh ra một lần nữa, tôi muốn trở thành một chú chim tự do."
      }
    ],
    "quickQuiz": {
      "question": "明日地球が滅亡する（　）、今日何をしますか。",
      "questionVi": "Nếu giả sử ngày mai trái đất diệt vong thì hôm nay bạn sẽ làm gì?",
      "options": [
        "としたら",
        "としても",
        "とたん",
        "うちに"
      ],
      "optionsVi": [
        "Nếu giả sử (To shitara)",
        "Cho dù giả sử",
        "Vừa mới",
        "Trong lúc"
      ],
      "correctIndex": 0,
      "explanation": "Đưa ra giả thiết: 滅亡するとしたら."
    }
  },
  {
    "id": "n3-skz-nai-koto-niwa",
    "lessonId": "skz-n3-c9",
    "lessonTitle": "Chuyên đề 9: Điều kiện & Giả định",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜ないことには",
    "reading": "ないことには",
    "romaji": "nai koto ni wa",
    "level": "N3",
    "category": "condition",
    "meaningVi": "Nếu không có điều kiện đó thì tuyệt đối không thể bắt đầu",
    "structure": "V-ない + ことには",
    "formality": "Lịch sự",
    "nuance": "Vế sau luôn luôn là câu phủ định biểu thị sự bất khả thi nếu như vế trước chưa được thỏa mãn.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-ない + ことには",
        "example": "実物を見ない ことには 判断できない"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-naikotoniwa-1",
        "japanese": "実際に本人に会ってみないことには、採用するかどうか決められない。",
        "reading": "じっさいにほんにんにあってみないことには、さいようするかどうかきめられない。",
        "vietnamese": "Nếu chưa gặp trực tiếp ứng viên thì chưa thể quyết định có tuyển dụng hay không."
      }
    ],
    "quickQuiz": {
      "question": "やってみ（　）ことには、できるかどうか分からない。",
      "questionVi": "Nếu không làm thử thì chẳng thể biết được là có làm nổi hay không.",
      "options": [
        "ない",
        "る",
        "た",
        "よう"
      ],
      "optionsVi": [
        "Nai (chuẩn)",
        "Ru",
        "Ta",
        "You"
      ],
      "correctIndex": 0,
      "explanation": "V-ない + ことには: やってみないことには."
    }
  },
  {
    "id": "n3-skz-ba-hodo",
    "lessonId": "skz-n3-c9",
    "lessonTitle": "Chuyên đề 9: Điều kiện & Giả định",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜ば〜ほど",
    "reading": "ば〜ほど",
    "romaji": "ba ~ hodo",
    "level": "N3",
    "category": "degree",
    "meaningVi": "Càng... thì càng... (Tỷ lệ thuận tăng tiến)",
    "structure": "V-ば V-るほど / A-ければ A-いほど / Na-なら Na-なほど",
    "formality": "Lịch sự",
    "nuance": "Biểu thị sự biến đổi song hành: một bên tăng lên thì bên kia cũng tăng tiến tương ứng theo.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-ば + V-るほど",
        "example": "練習すれば するほど 上達する"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-bahodo-1",
        "japanese": "日本語は勉強すればするほど、面白くなってくる。",
        "reading": "にほんごはべんきょうすればするほど、おもしろくなってくる。",
        "vietnamese": "Tiếng Nhật càng học nhiều thì lại càng thấy thú vị."
      }
    ],
    "quickQuiz": {
      "question": "安（　）安いほど、助かります。",
      "questionVi": "Giá càng rẻ thì tôi càng đỡ tốn kém.",
      "options": [
        "ければ",
        "くて",
        "く",
        "い"
      ],
      "optionsVi": [
        "Kereba (chuẩn điều kiện)",
        "Kute",
        "Ku",
        "I"
      ],
      "correctIndex": 0,
      "explanation": "Tính từ đuôi -i: 安ければ安いほど."
    }
  },
  {
    "id": "n3-skz-to-ieba",
    "lessonId": "skz-n3-c9",
    "lessonTitle": "Chuyên đề 9: Điều kiện & Giả định",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜といえば",
    "reading": "といえば",
    "romaji": "to ieba",
    "level": "N3",
    "category": "basics",
    "meaningVi": "Nhắc đến... thì nghĩ ngay đến... / Nói về việc đó thì...",
    "structure": "N / Thể thông thường + といえば",
    "formality": "Lịch sự",
    "nuance": "Lấy một chủ đề vừa được nhắc tới trong hội thoại làm mồi để liên tưởng và phát triển câu chuyện.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "N + といえば",
        "example": "日本の春 といえば 桜だ"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-toieba-1",
        "japanese": "日本の春といえば、やはり満開の桜でしょう。",
        "reading": "にほんのはるといえば、やはりまんかいのさくらでしょう。",
        "vietnamese": "Nhắc đến mùa xuân nước Nhật thì chuẩn nhất chính là hoa anh đào nở rộ."
      }
    ],
    "quickQuiz": {
      "question": "ベトナム料理（　）、フォーが最も有名です。",
      "questionVi": "Nhắc đến ẩm thực Việt Nam thì món Phở là nổi tiếng nhất.",
      "options": [
        "といえば",
        "にとって",
        "に対して",
        "によって"
      ],
      "optionsVi": [
        "Nhắc đến thì (liên tưởng)",
        "Đối với",
        "Hướng tới",
        "Bởi vì"
      ],
      "correctIndex": 0,
      "explanation": "Gợi nhắc đặc trưng: ベトナム料理といえば."
    }
  },
  {
    "id": "n3-skz-ni-chigai-nai",
    "lessonId": "skz-n3-c10",
    "lessonTitle": "Chuyên đề 10: Phán đoán, Suy luận & Đánh giá",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜に違いない",
    "reading": "にちがいない",
    "romaji": "ni chigai nai",
    "level": "N3",
    "category": "judgment",
    "meaningVi": "Chắc chắn là... (Khẳng định với niềm tin vững chắc)",
    "structure": "Thể thông thường / Na / N + に違いない",
    "formality": "Lịch sự",
    "nuance": "Người nói dựa vào trực giác hoặc bằng chứng trước mắt để đưa ra phán đoán gần như chắc chắn 99%.",
    "formationRules": [
      {
        "partOfSpeech": "Tính từ/Động từ",
        "rule": "Từ + に違いない",
        "example": "犯人は彼 に違いない"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-chigainai-1",
        "japanese": "あれだけ猛練習したのだから、彼らは絶対に合格するに違いない。",
        "reading": "あれだけもうれんしゅうしたのだから、かれらはぜったいにごうかくするにちがいない。",
        "vietnamese": "Vì đã tập luyện hăng say đến thế nên chắc chắn bọn họ sẽ thi đỗ."
      }
    ],
    "quickQuiz": {
      "question": "部屋の電気がついているから、家にいる（　）。",
      "questionVi": "Vì đèn phòng đang bật nên chắc chắn anh ấy đang ở nhà.",
      "options": [
        "に違いない",
        "はずがない",
        "わけがない",
        "にすぎない"
      ],
      "optionsVi": [
        "Chắc chắn là",
        "Làm sao mà",
        "Lẽ nào",
        "Chỉ là"
      ],
      "correctIndex": 0,
      "explanation": "Phán đoán chắc chắn: 家にいるに違いない."
    }
  },
  {
    "id": "n3-skz-hazu-da",
    "lessonId": "skz-n3-c10",
    "lessonTitle": "Chuyên đề 10: Phán đoán, Suy luận & Đánh giá",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜はずだ / 〜はずがない",
    "reading": "はずだ / はずがない",
    "romaji": "hazu da / hazu ga nai",
    "level": "N3",
    "category": "judgment",
    "meaningVi": "Chắc chắn là... / Làm sao mà có chuyện đó được (Theo logic)",
    "structure": "V-thông thường / A-い / Na-な / N-の + はずだ",
    "formality": "Lịch sự",
    "nuance": "Dựa trên tính toán, quy luật hoặc lịch trình khách quan để kết luận điều đó đương nhiên phải xảy ra.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-thông thường + はずだ",
        "example": "荷物は明日届く はずだ"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-hazuda-1",
        "japanese": "真面目な彼が、そんな嘘をつくはずがありません。",
        "reading": "まじめなかれが、そんなうそをつくはずがありません。",
        "vietnamese": "Một người nghiêm túc như anh ấy làm sao mà có chuyện lại đi nói dối như thế."
      }
    ],
    "quickQuiz": {
      "question": "昨日送った手紙だから、今日届く（　）だ。",
      "questionVi": "Vì là lá thư đã gửi hôm qua nên chắc chắn hôm nay sẽ đến nơi.",
      "options": [
        "はず",
        "わけ",
        "こと",
        "もの"
      ],
      "optionsVi": [
        "Hazu (suy luận logic)",
        "Wake",
        "Koto",
        "Mono"
      ],
      "correctIndex": 0,
      "explanation": "Suy luận dựa trên lịch trình gửi thư: 届くはずだ."
    }
  },
  {
    "id": "n3-skz-wake-da",
    "lessonId": "skz-n3-c10",
    "lessonTitle": "Chuyên đề 10: Phán đoán, Suy luận & Đánh giá",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜わけだ",
    "reading": "わけだ",
    "romaji": "wake da",
    "level": "N3",
    "category": "judgment",
    "meaningVi": "Thảo nào / Hóa ra là vậy / Đương nhiên kết quả là như thế",
    "structure": "V-thông thường / A-い / Na-な / N-な + わけだ",
    "formality": "Lịch sự",
    "nuance": "Dùng khi người nói phát hiện ra một nguyên nhân và thốt lên vỡ lẽ ra lý do vì sao sự việc lại diễn ra như vậy.",
    "formationRules": [
      {
        "partOfSpeech": "Tính từ",
        "rule": "A-い + わけだ",
        "example": "気温が38度もある。暑い わけだ"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-wakeda-1",
        "japanese": "エアコンが壊れていたのか。部屋が暑いわけだ。",
        "reading": "えあこんがこわれていたのか。へやがあついわけだ。",
        "vietnamese": "Hóa ra máy lạnh bị hỏng à. Thảo nào phòng nóng thế."
      }
    ],
    "quickQuiz": {
      "question": "日本に10年も住んでいるのか。日本語が上手な（　）だ。",
      "questionVi": "Cậu sống ở Nhật 10 năm rồi cơ à. Thảo nào tiếng Nhật giỏi thế.",
      "options": [
        "わけ",
        "はず",
        "こと",
        "もの"
      ],
      "optionsVi": [
        "Wake (thảo nào vỡ lẽ)",
        "Hazu",
        "Koto",
        "Mono"
      ],
      "correctIndex": 0,
      "explanation": "Vỡ lẽ ra lý do: 上手なわけだ."
    }
  },
  {
    "id": "n3-skz-wake-ga-nai",
    "lessonId": "skz-n3-c10",
    "lessonTitle": "Chuyên đề 10: Phán đoán, Suy luận & Đánh giá",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜わけがない",
    "reading": "わけがない",
    "romaji": "wake ga nai",
    "level": "N3",
    "category": "judgment",
    "meaningVi": "Lẽ nào / Tuyệt đối không đời nào có chuyện đó",
    "structure": "V-thông thường / A-い / Na-な / N-の + わけがない",
    "formality": "Lịch sự",
    "nuance": "Bác bỏ một cách quyết liệt, khẳng định về mặt lý lẽ rằng sự việc đó là hoàn toàn vô lý và bất khả thi.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-thông thường + わけがない",
        "example": "勝てる わけがない"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-wakeganai-1",
        "japanese": "あんな強いチームに、素人の私たちが勝てるわけがありません。",
        "reading": "あんなつよいちーむに、しろうとのわたしたちがかてるわけがありません。",
        "vietnamese": "Đối đầu với đội bóng mạnh thế kia, những kẻ nghiệp dư như chúng tôi tuyệt đối không đời nào thắng nổi."
      }
    ],
    "quickQuiz": {
      "question": "彼が一人で全部食べた（　）がない。",
      "questionVi": "Lẽ nào anh ấy lại ăn hết sạch một mình được.",
      "options": [
        "わけ",
        "はず",
        "こと",
        "もの"
      ],
      "optionsVi": [
        "Wake (lẽ nào)",
        "Hazu",
        "Koto",
        "Mono"
      ],
      "correctIndex": 0,
      "explanation": "Bác bỏ tuyệt đối: 食べたわけがない."
    }
  },
  {
    "id": "n3-skz-osore-ga-aru",
    "lessonId": "skz-n3-c10",
    "lessonTitle": "Chuyên đề 10: Phán đoán, Suy luận & Đánh giá",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜おそれがある",
    "reading": "おそれがある",
    "romaji": "osore ga aru",
    "level": "N3",
    "category": "judgment",
    "meaningVi": "E rằng / Có nguy cơ sẽ xảy ra sự việc xấu (Báo đài dự báo)",
    "structure": "V-る / N の + おそれがある",
    "formality": "Trang trọng",
    "nuance": "Chuyên dùng trong dự báo thời tiết, tin tức thời sự cảnh báo nguy cơ thiên tai, dịch bệnh, sụp đổ thị trường.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-る + おそれがある",
        "example": "噴火する おそれがある"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-osore-1",
        "japanese": "この台風は今夜、東海地方に上陸するおそれがあります。",
        "reading": "このたいふうはこんや、とうかいちほうにじょうりくするおそれがあります。",
        "vietnamese": "Cơn bão này e rằng có nguy cơ sẽ đổ bộ vào khu vực Tokai đêm nay."
      }
    ],
    "quickQuiz": {
      "question": "大雨で川が氾濫する（　）がある。",
      "questionVi": "Do mưa lớn nên e rằng có nguy cơ nước sông sẽ tràn bờ.",
      "options": [
        "おそれ",
        "心配",
        "危険",
        "不安"
      ],
      "optionsVi": [
        "Osore (nguy cơ)",
        "Shinpai",
        "Kiken",
        "Fuan"
      ],
      "correctIndex": 0,
      "explanation": "Tin tức dự báo nguy cơ xấu: 氾濫するおそれがある."
    }
  },
  {
    "id": "n3-skz-ni-suginai",
    "lessonId": "skz-n3-c10",
    "lessonTitle": "Chuyên đề 10: Phán đoán, Suy luận & Đánh giá",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜にすぎない",
    "reading": "にすぎない",
    "romaji": "ni suginai",
    "level": "N3",
    "category": "degree",
    "meaningVi": "Chẳng qua chỉ là... không hơn không kém (Hạ thấp mức độ)",
    "structure": "V-thông thường / N + にすぎない",
    "formality": "Trang trọng",
    "nuance": "Đánh giá sự vật chỉ dừng lại ở mức bình thường, không có gì to tát hay ghê gớm đáng để ca ngợi.",
    "formationRules": [
      {
        "partOfSpeech": "Danh từ",
        "rule": "N + にすぎない",
        "example": "単なる噂 にすぎない"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-suginai-1",
        "japanese": "それは単なる私の個人的な意見にすぎません。",
        "reading": "それはたんなるわたしのこじんてきないけんによぎません。",
        "vietnamese": "Đó chẳng qua chỉ là ý kiến cá nhân của riêng tôi mà thôi."
      }
    ],
    "quickQuiz": {
      "question": "彼はまだ見習い（　）、責任のある仕事は任せられない。",
      "questionVi": "Cậu ấy chẳng qua chỉ là thực tập sinh nên chưa thể giao việc trọng trách được.",
      "options": [
        "にすぎず",
        "に違いない",
        "にとって",
        "に対して"
      ],
      "optionsVi": [
        "Chẳng qua chỉ là (Ni sugizu)",
        "Chắc chắn",
        "Đối với",
        "Hướng tới"
      ],
      "correctIndex": 0,
      "explanation": "Hạ thấp mức độ: 見習いにすぎず."
    }
  },
  {
    "id": "n3-skz-kane-nai",
    "lessonId": "skz-n3-c10",
    "lessonTitle": "Chuyên đề 10: Phán đoán, Suy luận & Đánh giá",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜かねない",
    "reading": "かねない",
    "romaji": "kane nai",
    "level": "N3",
    "category": "judgment",
    "meaningVi": "Có nguy cơ dẫn tới kết quả tồi tệ (Từ nguyên nhân xấu hiện tại)",
    "structure": "V-thân bỏ ます + かねない",
    "formality": "Lịch sự",
    "nuance": "Cảnh báo nếu cứ tiếp diễn tình trạng này thì hoàn toàn có thể gây ra tai nạn, mất uy tín hay đổ vỡ.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-masu (bỏ ます) + かねない",
        "example": "大事故を 起こしかねない"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-kanenai-1",
        "japanese": "そんなスピードを出して運転したら、大事故を起こしかねないよ。",
        "reading": "そんなすぴーどをだしてうんてんしたら、だいじこをおこしかねないよ。",
        "vietnamese": "Lái xe phóng nhanh cỡ đó thì có ngày gây tai nạn thảm khốc đấy."
      }
    ],
    "quickQuiz": {
      "question": "このまま放置すれば、事態はさらに悪化し（　）。",
      "questionVi": "Nếu cứ mặc kệ thế này thì tình hình hoàn toàn có thể sẽ còn xấu hơn nữa.",
      "options": [
        "かねない",
        "かねる",
        "おそれ",
        "すぎる"
      ],
      "optionsVi": [
        "Có nguy cơ xấu (kanenai)",
        "Khó làm",
        "Osore",
        "Quá"
      ],
      "correctIndex": 0,
      "explanation": "V(bỏ ます) + かねない: 悪化しかねない."
    }
  },
  {
    "id": "n3-skz-kane-ru",
    "lessonId": "skz-n3-c10",
    "lessonTitle": "Chuyên đề 10: Phán đoán, Suy luận & Đánh giá",
    "curriculum": "SHINKANZEN",
    "grammarPoint": "〜かねる",
    "reading": "かねる",
    "romaji": "kane ru",
    "level": "N3",
    "category": "judgment",
    "meaningVi": "Khó lòng có thể làm được (Từ chối khéo léo, lịch sự)",
    "structure": "V-thân bỏ ます + かねる",
    "formality": "Trang trọng",
    "nuance": "Dùng trong dịch vụ khách hàng hoặc công sở để từ chối khéo các yêu cầu bất hợp lý hoặc vượt quá thẩm quyền.",
    "formationRules": [
      {
        "partOfSpeech": "Động từ",
        "rule": "V-masu (bỏ ます) + かねる",
        "example": "ご要望には 応じかねます"
      }
    ],
    "examples": [
      {
        "id": "ex-n3-kaneru-1",
        "japanese": "申し訳ございませんが、お客様の個人情報は開示いたしかねます。",
        "reading": "もうしわけございませんが、おきゃくさまのこじんじょうほうはかいじいたしかねます。",
        "vietnamese": "Vô cùng xin lỗi quý khách, thông tin cá nhân của khách hàng chúng tôi khó lòng có thể tiết lộ được ạ."
      }
    ],
    "quickQuiz": {
      "question": "そのご提案には賛成いた（　）ます。",
      "questionVi": "Đề xuất đó của anh thì tôi khó lòng có thể tán thành được.",
      "options": [
        "しかね",
        "かねない",
        "すぎて",
        "ずにはいられ"
      ],
      "optionsVi": [
        "Khó lòng làm (Shikane)",
        "Kanenai",
        "Quá",
        "Không kìm được"
      ],
      "correctIndex": 0,
      "explanation": "Từ chối lịch sự: 賛成いたしかねます."
    }
  }
];
