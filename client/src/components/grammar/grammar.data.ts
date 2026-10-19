import { GrammarMasterItem, GrammarCategory, GrammarLessonFolder } from './grammar.types';
import { N5_MINNA_I } from './data/n5.minna1';
import { N4_MINNA_II } from './data/n4.minna2';
import { N3_SHINKANZEN } from './data/n3.shinkanzen';
import { N2_SHINKANZEN } from './data/n2.shinkanzen';
import { N1_SHINKANZEN } from './data/n1.shinkanzen';

export const GRAMMAR_CATEGORIES: GrammarCategory[] = [
  { id: 'all', name: 'Tất cả chủ đề' },
  { id: 'basics', name: 'Cơ bản & Nhập môn' },
  { id: 'cause', name: 'Nguyên nhân - Lý do' },
  { id: 'purpose', name: 'Mục đích & Ý định' },
  { id: 'condition', name: 'Điều kiện & Giả định' },
  { id: 'time', name: 'Thời gian & Trình tự' },
  { id: 'obligation', name: 'Bắt buộc & Cấm đoán' },
  { id: 'degree', name: 'Mức độ & So sánh' },
  { id: 'passive_causative', name: 'Bị động & Sai khiến' },
  { id: 'keigo', name: 'Kính ngữ & Lịch sự' },
  { id: 'judgment', name: 'Phán đoán & Suy luận' }
];

// =========================================================================
// 1. CÂY THƯ MỤC GIÁO TRÌNH (CURRICULUM FOLDERS)
// N5 - N4: 50 Bài Minna no Nihongo (Bài 1..25 = N5, Bài 26..50 = N4)
// N3 - N1: Shinkanzen Master & Sou Matome Chapters
// =========================================================================
export const GRAMMAR_LESSON_FOLDERS: GrammarLessonFolder[] = [
  // --- N5: Minna no Nihongo Sơ cấp I (25 Bài) ---
  {
    id: 'minna-01',
    level: 'N5',
    curriculum: 'MINNA_I',
    curriculumTitle: 'Minna no Nihongo Sơ cấp I',
    lessonNumber: 1,
    title: 'Bài 1: Giới thiệu bản thân & Trợ từ cơ bản',
    description: 'Khẳng định, phủ định, câu hỏi với Desu, trợ từ Wa, Mo, No, Ka',
    grammarIds: ['n5-01-wa-desu', 'n5-01-ja-arimasen', 'n5-01-ka', 'n5-01-mo', 'n5-01-no']
  },
  {
    id: 'minna-02',
    level: 'N5',
    curriculum: 'MINNA_I',
    curriculumTitle: 'Minna no Nihongo Sơ cấp I',
    lessonNumber: 2,
    title: 'Bài 2: Từ chỉ định đồ vật (これ / それ / あれ)',
    description: 'Chỉ định vị trí vật, đại từ sở hữu, phân biệt Kore/Sore/Are và Kono/Sono/Ano',
    grammarIds: ['n5-02-kore-sore-are', 'n5-02-kono-sono-ano', 'n5-02-dare-no']
  },
  {
    id: 'minna-03',
    level: 'N5',
    curriculum: 'MINNA_I',
    curriculumTitle: 'Minna no Nihongo Sơ cấp I',
    lessonNumber: 3,
    title: 'Bài 3: Từ chỉ nơi chốn & Phương hướng',
    description: 'Hỏi và chỉ địa điểm, phương hướng lịch sự với Kochira/Sochira/Achira',
    grammarIds: ['n5-03-koko-soko-asoko', 'n5-03-doko-dochira', 'n5-03-ikura']
  },
  {
    id: 'minna-04',
    level: 'N5',
    curriculum: 'MINNA_I',
    curriculumTitle: 'Minna no Nihongo Sơ cấp I',
    lessonNumber: 4,
    title: 'Bài 4: Thời gian, giờ giấc & Động từ ます',
    description: 'Cách nói giờ giấc, động từ các thì hiện tại/quá khứ (ます/ました/ません)',
    grammarIds: ['n5-04-masu', 'n5-04-ni-time', 'n5-04-kara-made']
  },
  {
    id: 'minna-05',
    level: 'N5',
    curriculum: 'MINNA_I',
    curriculumTitle: 'Minna no Nihongo Sơ cấp I',
    lessonNumber: 5,
    title: 'Bài 5: Đi lại & Phương tiện giao thông',
    description: 'Đi đâu bằng phương tiện gì với trợ từ He, De, To',
    grammarIds: ['n5-05-he-ikimasu', 'n5-05-doko-mo-masen', 'n5-05-de-norimono', 'n5-05-to-hito']
  },
  {
    id: 'minna-06',
    level: 'N5',
    curriculum: 'MINNA_I',
    curriculumTitle: 'Minna no Nihongo Sơ cấp I',
    lessonNumber: 6,
    title: 'Bài 6: Tân ngữ & Nơi diễn ra hành động',
    description: 'Trợ từ Wo chỉ tân ngữ, trợ từ De chỉ địa điểm hành động, rủ rê V-mashou',
    grammarIds: ['n5-06-wo-tabemasu', 'n5-06-nani-wo-shimasu', 'n5-06-de-basho', 'n5-06-masenka', 'n5-06-mashou']
  },
  {
    id: 'minna-07',
    level: 'N5',
    curriculum: 'MINNA_I',
    curriculumTitle: 'Minna no Nihongo Sơ cấp I',
    lessonNumber: 7,
    title: 'Bài 7: Công cụ & Cho nhận cơ bản',
    description: 'Làm bằng công cụ gì (で), Tặng cho ai (あげます), Nhận từ ai (もらいます)',
    grammarIds: ['n5-07-de-dougu', 'n5-07-nihongo-de-nan', 'n5-07-agemasu', 'n5-07-moraimasu', 'n5-07-mou-mada']
  },
  {
    id: 'minna-08',
    level: 'N5',
    curriculum: 'MINNA_I',
    curriculumTitle: 'Minna no Nihongo Sơ cấp I',
    lessonNumber: 8,
    title: 'Bài 8: Tính từ đuôi い & Tính từ đuôi な',
    description: 'Cách biến đổi tính từ, khẳng định, phủ định và bổ nghĩa cho danh từ',
    grammarIds: ['n5-08-i-adjective', 'n5-08-na-adjective', 'n5-08-totemo-amari', 'n5-08-dou-donna', 'n5-08-ga-soshite']
  },
  {
    id: 'minna-09',
    level: 'N5',
    curriculum: 'MINNA_I',
    curriculumTitle: 'Minna no Nihongo Sơ cấp I',
    lessonNumber: 9,
    title: 'Bài 9: Sở thích, năng lực & Sở hữu',
    description: 'Thích/ghét (好き/嫌い), giỏi/kém (上手/下手), hiểu biết (わかります)',
    grammarIds: ['n5-09-suki-kirai', 'n5-09-wakaru-aru', 'n5-09-kara', 'n5-09-doushite']
  },
  {
    id: 'minna-10',
    level: 'N5',
    curriculum: 'MINNA_I',
    curriculumTitle: 'Minna no Nihongo Sơ cấp I',
    lessonNumber: 10,
    title: 'Bài 10: Tồn tại của người & Đồ vật (います / あります)',
    description: 'Phân biệt Imasu cho sinh vật sống và Arimasu cho đồ vật/thực vật',
    grammarIds: ['n5-10-imasu-arimasu', 'n5-10-wa-doko-ni', 'n5-10-ichi-meishi', 'n5-10-ya-nado']
  },
  {
    id: 'minna-11',
    level: 'N5',
    curriculum: 'MINNA_I',
    curriculumTitle: 'Minna no Nihongo Sơ cấp I',
    lessonNumber: 11,
    title: 'Bài 11: Số lượng & Đơn vị đếm',
    description: 'Các lượng từ, đơn vị đếm người (人), con (匹), cái (枚, 台), khoảng thời gian',
    grammarIds: ['n5-11-counting', 'n5-11-frequency', 'n5-11-dake']
  },
  {
    id: 'minna-12',
    level: 'N5',
    curriculum: 'MINNA_I',
    curriculumTitle: 'Minna no Nihongo Sơ cấp I',
    lessonNumber: 12,
    title: 'Bài 12: So sánh hơn & So sánh nhất',
    description: 'So sánh giữa 2 vật (AはBより), hỏi chọn lựa (どちら), so sánh nhất (一番)',
    grammarIds: ['n5-12-past-adj', 'n5-12-hikaku-yori', 'n5-12-hikaku-dochira', 'n5-12-hikaku-ichiban']
  },
  {
    id: 'minna-13',
    level: 'N5',
    curriculum: 'MINNA_I',
    curriculumTitle: 'Minna no Nihongo Sơ cấp I',
    lessonNumber: 13,
    title: 'Bài 13: Nguyện vọng & Mục đích di chuyển',
    description: 'Muốn có vật gì (〜が欲しい), Muốn làm gì (〜たい), Đi đâu để làm gì (〜に行く)',
    grammarIds: ['n5-13-hoshii', 'n5-13-tai', 'n5-13-mokuteki-ni']
  },
  {
    id: 'minna-14',
    level: 'N5',
    curriculum: 'MINNA_I',
    curriculumTitle: 'Minna no Nihongo Sơ cấp I',
    lessonNumber: 14,
    title: 'Bài 14: Thể Te & Sai khiến nhờ vả lịch sự',
    description: 'Quy tắc chia thể Te (V-て), xin hãy làm gì (V-てください), đề nghị giúp đỡ',
    grammarIds: ['n5-14-te-form', 'n5-14-te-kudasai', 'n5-14-te-iru', 'n5-14-mashou-ka']
  },
  {
    id: 'minna-15',
    level: 'N5',
    curriculum: 'MINNA_I',
    curriculumTitle: 'Minna no Nihongo Sơ cấp I',
    lessonNumber: 15,
    title: 'Bài 15: Cho phép & Cấm đoán',
    description: 'Được phép làm gì (V-てもいいです), Cấm làm gì (V-てはいけません)',
    grammarIds: ['n5-15-te-mo-ii', 'n5-15-te-wa-ikenai', 'n5-15-te-iru-kekka']
  },
  {
    id: 'minna-16',
    level: 'N5',
    curriculum: 'MINNA_I',
    curriculumTitle: 'Minna no Nihongo Sơ cấp I',
    lessonNumber: 16,
    title: 'Bài 16: Nối câu & Trình tự thời gian',
    description: 'Nối hành động liên tiếp bằng thể Te, Sau khi làm gì thì làm gì (V-てから)',
    grammarIds: ['n5-16-te-sequence', 'n5-16-adj-te', 'n5-16-te-kara', 'n5-16-wa-ga']
  },
  {
    id: 'minna-17',
    level: 'N5',
    curriculum: 'MINNA_I',
    curriculumTitle: 'Minna no Nihongo Sơ cấp I',
    lessonNumber: 17,
    title: 'Bài 17: Thể Nai & Nghĩa vụ bắt buộc',
    description: 'Quy tắc chia thể Nai (V-ない), Xin đừng làm gì, Bắt buộc phải làm gì',
    grammarIds: ['n5-17-nai-form', 'n5-17-naide-kudasai', 'n5-17-nakereba-naranai', 'n5-17-nakutemo-ii', 'n5-17-made-ni']
  },
  {
    id: 'minna-18',
    level: 'N5',
    curriculum: 'MINNA_I',
    curriculumTitle: 'Minna no Nihongo Sơ cấp I',
    lessonNumber: 18,
    title: 'Bài 18: Thể từ điển & Năng lực khả năng',
    description: 'Quy tắc chia thể từ điển (Jishokei), Có thể làm gì (V-ることができます), Sở thích',
    grammarIds: ['n5-18-jishokei', 'n5-18-koto-ga-dekiru', 'n5-18-shumi-wa', 'n5-18-mae-ni']
  },
  {
    id: 'minna-19',
    level: 'N5',
    curriculum: 'MINNA_I',
    curriculumTitle: 'Minna no Nihongo Sơ cấp I',
    lessonNumber: 19,
    title: 'Bài 19: Thể Ta, Kinh nghiệm & Liệt kê hành động',
    description: 'Quy tắc chia thể Ta (V-た), Đã từng làm gì (V-たことがある), Lúc thì làm A lúc làm B',
    grammarIds: ['n5-19-ta-form', 'n5-19-ta-koto-ga-aru', 'n5-19-tari-tari', 'n5-19-narimasu']
  },
  {
    id: 'minna-20',
    level: 'N5',
    curriculum: 'MINNA_I',
    curriculumTitle: 'Minna no Nihongo Sơ cấp I',
    lessonNumber: 20,
    title: 'Bài 20: Thể thông thường (Thể ngắn / 普通形)',
    description: 'Chuyển đổi văn phong lịch sự (Desu/Masu) sang văn phong thân mật (Futsukei)',
    grammarIds: ['n5-20-futsukei', 'n5-20-futsukei-kaiwa']
  },
  {
    id: 'minna-21',
    level: 'N5',
    curriculum: 'MINNA_I',
    curriculumTitle: 'Minna no Nihongo Sơ cấp I',
    lessonNumber: 21,
    title: 'Bài 21: Bày tỏ ý kiến cá nhân & Trích dẫn',
    description: 'Tôi nghĩ rằng (〜と思います), Ai đó đã nói rằng (〜と言いました)',
    grammarIds: ['n5-21-to-omou', 'n5-21-to-itta', 'n5-21-deshou']
  },
  {
    id: 'minna-22',
    level: 'N5',
    curriculum: 'MINNA_I',
    curriculumTitle: 'Minna no Nihongo Sơ cấp I',
    lessonNumber: 22,
    title: 'Bài 22: Mệnh đề định ngữ bổ nghĩa cho Danh từ',
    description: 'Dùng cả một câu hoàn chỉnh thể thông thường để bổ nghĩa trực tiếp cho Danh từ',
    grammarIds: ['n5-22-meishi-shushoku', 'n5-22-meishi-shushoku-wa', 'n5-22-jikan-yakusoku']
  },
  {
    id: 'minna-23',
    level: 'N5',
    curriculum: 'MINNA_I',
    curriculumTitle: 'Minna no Nihongo Sơ cấp I',
    lessonNumber: 23,
    title: 'Bài 23: Thời điểm & Điều kiện tự nhiên với Toki/To',
    description: 'Khi làm gì (〜とき), Hễ cứ làm A thì B xảy ra theo lẽ tự nhiên (〜と)',
    grammarIds: ['n5-23-toki', 'n5-23-to-shizen']
  },
  {
    id: 'minna-24',
    level: 'N5',
    curriculum: 'MINNA_I',
    curriculumTitle: 'Minna no Nihongo Sơ cấp I',
    lessonNumber: 24,
    title: 'Bài 24: Cho nhận hành động',
    description: 'Làm gì cho ai (V-てあげます), Ai làm gì cho mình (V-てくれます / もらいます)',
    grammarIds: ['n5-24-kuremasu', 'n5-24-moraimasu', 'n5-24-agemasu']
  },
  {
    id: 'minna-25',
    level: 'N5',
    curriculum: 'MINNA_I',
    curriculumTitle: 'Minna no Nihongo Sơ cấp I',
    lessonNumber: 25,
    title: 'Bài 25: Điều kiện giả định với Tara & Dù cho Temo',
    description: 'Nếu... thì (V-たら), Cho dù... thì vẫn (V-ても), Moshi và Ikura',
    grammarIds: ['n5-25-tara', 'n5-25-temo', 'n5-25-moshi-ikura']
  },

  // --- N4: Minna no Nihongo Sơ cấp II (Bài 26..50) ---
  {
    id: 'minna-26',
    level: 'N4',
    curriculum: 'MINNA_II',
    curriculumTitle: 'Minna no Nihongo Sơ cấp II',
    lessonNumber: 26,
    title: 'Bài 26: Thể giải thích & Nhấn mạnh với Ndesu',
    description: 'Dùng 〜んです để hỏi lý do, giải thích nguyên nhân hoặc mở đầu câu chuyện',
    grammarIds: ['n4-26-ndesu', 'n4-26-ndesuga', 'n4-26-itadakemasenka', 'n4-26-tara-ii-desuka']
  },
  {
    id: 'minna-27',
    level: 'N4',
    curriculum: 'MINNA_II',
    curriculumTitle: 'Minna no Nihongo Sơ cấp II',
    lessonNumber: 27,
    title: 'Bài 27: Động từ Khả năng (可能動詞)',
    description: 'Biến đổi động từ khả năng (V-られる / V-える), Phân biệt Mieru/Kikoeru',
    grammarIds: ['n4-27-kanoukei', 'n4-27-mieru-kikoeru', 'n4-27-shika-nai']
  },
  {
    id: 'minna-28',
    level: 'N4',
    curriculum: 'MINNA_II',
    curriculumTitle: 'Minna no Nihongo Sơ cấp II',
    lessonNumber: 28,
    title: 'Bài 28: Hành động đồng thời & Thói quen',
    description: 'Vừa làm A vừa làm B (〜ながら), Thói quen thường nhật (〜ています)',
    grammarIds: ['n4-28-nagara', 'n4-28-shi-shi']
  },
  {
    id: 'minna-29',
    level: 'N4',
    curriculum: 'MINNA_II',
    curriculumTitle: 'Minna no Nihongo Sơ cấp II',
    lessonNumber: 29,
    title: 'Bài 29: Trạng thái tự động từ & Tiếc nuối',
    description: 'Trạng thái đồ vật (〜ています), Lỡ làm gì hoặc hoàn thành (〜てしまう)',
    grammarIds: ['n4-29-jidoushi-te-iru', 'n4-29-te-shimau']
  },
  {
    id: 'minna-30',
    level: 'N4',
    curriculum: 'MINNA_II',
    curriculumTitle: 'Minna no Nihongo Sơ cấp II',
    lessonNumber: 30,
    title: 'Bài 30: Trạng thái tha động từ & Chuẩn bị sẵn',
    description: 'Có chủ đích chuẩn bị (〜てあります), Làm sẵn trước việc gì (〜ておきます)',
    grammarIds: ['n4-30-te-aru', 'n4-30-te-oku', 'n4-30-mada-te-iru']
  },
  {
    id: 'minna-31',
    level: 'N4',
    curriculum: 'MINNA_II',
    curriculumTitle: 'Minna no Nihongo Sơ cấp II',
    lessonNumber: 31,
    title: 'Bài 31: Thể ý định (意向形)',
    description: 'Biến đổi thể ý định (V-よう), Dự định cá nhân (〜つもり / 〜予定)',
    grammarIds: ['n4-31-ikoukei', 'n4-31-you-to-omou', 'n4-31-tsumori', 'n4-31-yotei', 'n4-31-mada-te-imasen']
  },
  {
    id: 'minna-32',
    level: 'N4',
    curriculum: 'MINNA_II',
    curriculumTitle: 'Minna no Nihongo Sơ cấp II',
    lessonNumber: 32,
    title: 'Bài 32: Lời khuyên & Phỏng đoán',
    description: 'Nên/Không nên làm gì (〜ほうがいい), Có lẽ là (〜でしょう / 〜かもしれません)',
    grammarIds: ['n4-32-hou-ga-ii', 'n4-32-deshou', 'n4-32-kamoshiremasen']
  },
  {
    id: 'minna-33',
    level: 'N4',
    curriculum: 'MINNA_II',
    curriculumTitle: 'Minna no Nihongo Sơ cấp II',
    lessonNumber: 33,
    title: 'Bài 33: Thể Mệnh lệnh & Cấm chỉ',
    description: 'Thể mệnh lệnh (命令形), thể cấm chỉ (禁止形), biển báo giao thông',
    grammarIds: ['n4-33-meirei-kinshi', 'n4-33-to-iu-imi', 'n4-33-to-itte-imashita']
  },
  {
    id: 'minna-34',
    level: 'N4',
    curriculum: 'MINNA_II',
    curriculumTitle: 'Minna no Nihongo Sơ cấp II',
    lessonNumber: 34,
    title: 'Bài 34: Làm theo chỉ dẫn & Thứ tự',
    description: 'Làm theo đúng như thế (〜とおりに), Sau khi làm gì thì làm gì (〜あとで)',
    grammarIds: ['n4-34-toori-ni', 'n4-34-ato-de', 'n4-34-nai-de']
  },
  {
    id: 'minna-35',
    level: 'N4',
    curriculum: 'MINNA_II',
    curriculumTitle: 'Minna no Nihongo Sơ cấp II',
    lessonNumber: 35,
    title: 'Bài 35: Thể Điều kiện Ba (条件形)',
    description: 'Cách chia thể điều kiện (V-れば / A-ければ), Càng... càng... (〜ば〜ほど)',
    grammarIds: ['n4-35-ba-jouken', 'n4-35-ba-hodo', 'n4-35-n-nara']
  },
  {
    id: 'minna-36',
    level: 'N4',
    curriculum: 'MINNA_II',
    curriculumTitle: 'Minna no Nihongo Sơ cấp II',
    lessonNumber: 36,
    title: 'Bài 36: Mục đích & Thay đổi trạng thái',
    description: 'Để mà (〜ように), Trở nên có thể làm được (〜ようになる), Cố gắng làm (〜ようにする)',
    grammarIds: ['n4-36-you-ni', 'n4-36-you-ni-naru', 'n4-36-you-ni-suru']
  },
  {
    id: 'minna-37',
    level: 'N4',
    curriculum: 'MINNA_II',
    curriculumTitle: 'Minna no Nihongo Sơ cấp II',
    lessonNumber: 37,
    title: 'Bài 37: Động từ Bị động (受身動詞)',
    description: 'Biến đổi động từ bị động (V-れる/られる), Bị động phiền toái, Bị động gián tiếp',
    grammarIds: ['n4-37-ukemi', 'n4-37-ukemi-ni-yotte']
  },
  {
    id: 'minna-38',
    level: 'N4',
    curriculum: 'MINNA_II',
    curriculumTitle: 'Minna no Nihongo Sơ cấp II',
    lessonNumber: 38,
    title: 'Bài 38: Danh từ hóa động từ (V-るの / V-ることは)',
    description: 'Biến đổi động từ thành danh từ với の hoặc こと để làm chủ ngữ/tân ngữ',
    grammarIds: ['n4-38-meishika', 'n4-38-no-wo-shitte-imasuka']
  },
  {
    id: 'minna-39',
    level: 'N4',
    curriculum: 'MINNA_II',
    curriculumTitle: 'Minna no Nihongo Sơ cấp II',
    lessonNumber: 39,
    title: 'Bài 39: Nguyên nhân tự nhiên & Cảm xúc',
    description: 'Vì... nên (V-て), Nguyên nhân khách quan lịch sự (〜ので)',
    grammarIds: ['n4-39-te-reason', 'n4-39-node']
  },
  {
    id: 'minna-40',
    level: 'N4',
    curriculum: 'MINNA_II',
    curriculumTitle: 'Minna no Nihongo Sơ cấp II',
    lessonNumber: 40,
    title: 'Bài 40: Câu hỏi lồng câu hỏi',
    description: 'Có... hay không (〜かどうか), Câu hỏi có từ để hỏi lồng vào vế sau (〜か)',
    grammarIds: ['n4-40-ka-douka', 'n4-40-te-miru']
  },
  {
    id: 'minna-41',
    level: 'N4',
    curriculum: 'MINNA_II',
    curriculumTitle: 'Minna no Nihongo Sơ cấp II',
    lessonNumber: 41,
    title: 'Bài 41: Cho nhận thể trang trọng',
    description: 'Cho bề trên (さしあげます), Nhận từ bề trên (いただきます), Bề trên cho mình (くださいます)',
    grammarIds: ['n4-41-itadakimasu-kudasaimasu', 'n4-41-te-yarimasu']
  },
  {
    id: 'minna-42',
    level: 'N4',
    curriculum: 'MINNA_II',
    curriculumTitle: 'Minna no Nihongo Sơ cấp II',
    lessonNumber: 42,
    title: 'Bài 42: Mục đích hành động & Công dụng',
    description: 'Để làm gì (〜ために), Dùng vào việc gì (〜のに使います)',
    grammarIds: ['n4-42-tame-ni', 'n4-42-no-ni-tsukau']
  },
  {
    id: 'minna-43',
    level: 'N4',
    curriculum: 'MINNA_II',
    curriculumTitle: 'Minna no Nihongo Sơ cấp II',
    lessonNumber: 43,
    title: 'Bài 43: Dự đoán ngoại cảnh (〜そうです [trông có vẻ])',
    description: 'Nhìn bề ngoài đoán trạng thái (V-bỏ masu + そうです, A-bỏ i + そうです)',
    grammarIds: ['n4-43-sou-desu-looks-like', 'n4-43-te-kimasu']
  },
  {
    id: 'minna-44',
    level: 'N4',
    curriculum: 'MINNA_II',
    curriculumTitle: 'Minna no Nihongo Sơ cấp II',
    lessonNumber: 44,
    title: 'Bài 44: Quá mức & Dễ / Khó làm gì',
    description: 'Làm quá mức (〜すぎる), Dễ làm gì (〜やすい), Khó làm gì (〜にくい)',
    grammarIds: ['n4-44-sugiru', 'n4-44-yasui-nikui', 'n4-44-ku-ni-suru']
  },
  {
    id: 'minna-45',
    level: 'N4',
    curriculum: 'MINNA_II',
    curriculumTitle: 'Minna no Nihongo Sơ cấp II',
    lessonNumber: 45,
    title: 'Bài 45: Trường hợp giả định & Bất mãn nhượng bộ',
    description: 'Trong trường hợp (〜ばあいは), Thế mà / Dù vậy mà (〜のに)',
    grammarIds: ['n4-45-baai-wa', 'n4-45-noni']
  },
  {
    id: 'minna-46',
    level: 'N4',
    curriculum: 'MINNA_II',
    curriculumTitle: 'Minna no Nihongo Sơ cấp II',
    lessonNumber: 46,
    title: 'Bài 46: Các giai đoạn của hành động với Tokoro',
    description: 'Sắp làm (V-るところ), Đang làm (V-ているところ), Vừa mới làm xong (V-たところ / V-たばかり)',
    grammarIds: ['n4-46-tokoro', 'n4-46-bakari', 'n4-46-hazu-desu']
  },
  {
    id: 'minna-47',
    level: 'N4',
    curriculum: 'MINNA_II',
    curriculumTitle: 'Minna no Nihongo Sơ cấp II',
    lessonNumber: 47,
    title: 'Bài 47: Nghe nói truyền đạt (〜そうです [truyền đạt])',
    description: 'Nghe nói là (Thể thông thường + そうです), Dường như / Có vẻ như (〜ようです)',
    grammarIds: ['n4-47-sou-desu-hearsay', 'n4-47-you-desu']
  },
  {
    id: 'minna-48',
    level: 'N4',
    curriculum: 'MINNA_II',
    curriculumTitle: 'Minna no Nihongo Sơ cấp II',
    lessonNumber: 48,
    title: 'Bài 48: Động từ Sai khiến (使役動詞)',
    description: 'Bắt / Cho phép ai làm gì (V-せる/させる), Xin phép cho tôi làm gì (〜させてください)',
    grammarIds: ['n4-48-shieki', 'n4-48-sasete-kudasai']
  },
  {
    id: 'minna-49',
    level: 'N4',
    curriculum: 'MINNA_II',
    curriculumTitle: 'Minna no Nihongo Sơ cấp II',
    lessonNumber: 49,
    title: 'Bài 49: Tôn kính ngữ (尊敬語)',
    description: 'Nâng cao vị thế đối phương: Động từ đặc biệt (いらっしゃいます), お/ご〜になります',
    grammarIds: ['n4-49-sonkeigo', 'n4-49-o-kudasai']
  },
  {
    id: 'minna-50',
    level: 'N4',
    curriculum: 'MINNA_II',
    curriculumTitle: 'Minna no Nihongo Sơ cấp II',
    lessonNumber: 50,
    title: 'Bài 50: Khiêm nhường ngữ (謙譲語)',
    description: 'Hạ thấp bản thân để bày tỏ kính trọng: お/ご〜します, Động từ đặc biệt (まいります, もうします)',
    grammarIds: ['n4-50-kenjougo', 'n4-50-gozaimasu']
  },

  // --- N3: Chuyên đề 1: Thời gian & Trình tự hành động ---
  {
    id: "skz-n3-c1",
    level: "N3",
    curriculum: "SHINKANZEN_N3",
    curriculumTitle: "Shinkanzen Master N3",
    lessonNumber: 1,
    title: "Chuyên đề 1: Thời gian & Trình tự hành động",
    description: "〜たとたん, 〜最中に, 〜うちに, 〜たびに, 〜て以来, 〜てはじめて, 〜次第, 〜をはじめ, 〜において, 〜にわたって, 〜を通じて",
    grammarIds: ["n3-skz-ta-totan","n3-skz-saichuu-ni","n3-skz-uchi-ni","n3-skz-tabini","n3-skz-te-irai","n3-skz-te-hajimete","n3-skz-shidai","n3-skz-o-hajime","n3-skz-ni-oite","n3-skz-ni-watatte","n3-skz-o-tsuujite"]
  },
  // --- N3: Chuyên đề 2: Nguyên nhân, Lý do & Kết quả ---
  {
    id: "skz-n3-c2",
    level: "N3",
    curriculum: "SHINKANZEN_N3",
    curriculumTitle: "Shinkanzen Master N3",
    lessonNumber: 2,
    title: "Chuyên đề 2: Nguyên nhân, Lý do & Kết quả",
    description: "〜によって, 〜おかげで, 〜せいで, 〜せいか, 〜につき, 〜ことから, 〜ばかりに, 〜ものだから, 〜からには",
    grammarIds: ["n3-skz-ni-yotte","n3-skz-okage-de","n3-skz-sei-de","n3-skz-sei-ka","n3-skz-ni-tsuki","n3-skz-koto-kara","n3-skz-bakari-ni","n3-skz-mono-dakara","n3-skz-kara-niwa"]
  },
  // --- N3: Chuyên đề 3: Quan hệ, Đối tượng & Phạm vi ---
  {
    id: "skz-n3-c3",
    level: "N3",
    curriculum: "SHINKANZEN_N3",
    curriculumTitle: "Shinkanzen Master N3",
    lessonNumber: 3,
    title: "Chuyên đề 3: Quan hệ, Đối tượng & Phạm vi",
    description: "〜に関する, 〜について, 〜に対して, 〜にとって, 〜をめぐって, 〜に合わせて, 〜に応えて",
    grammarIds: ["n3-skz-ni-kansuru","n3-skz-ni-tsuite","n3-skz-ni-taishite","n3-skz-ni-totte","n3-skz-o-megutte","n3-skz-ni-awasete","n3-skz-ni-kotaete"]
  },
  // --- N3: Chuyên đề 4: Mục đích & Ý chí ---
  {
    id: "skz-n3-c4",
    level: "N3",
    curriculum: "SHINKANZEN_N3",
    curriculumTitle: "Shinkanzen Master N3",
    lessonNumber: 4,
    title: "Chuyên đề 4: Mục đích & Ý chí",
    description: "〜ように, 〜ために, 〜ようにする, 〜ようになる, 〜ようとする, 〜ようとしない, 〜つもりだ",
    grammarIds: ["n3-skz-you-ni","n3-skz-tame-ni","n3-skz-you-ni-suru","n3-skz-you-ni-naru","n3-skz-you-to-suru","n3-skz-you-to-shinai","n3-skz-tsumori-da"]
  },
  // --- N3: Chuyên đề 5: Bắt buộc, Đạo đức & Khuyên bảo ---
  {
    id: "skz-n3-c5",
    level: "N3",
    curriculum: "SHINKANZEN_N3",
    curriculumTitle: "Shinkanzen Master N3",
    lessonNumber: 5,
    title: "Chuyên đề 5: Bắt buộc, Đạo đức & Khuyên bảo",
    description: "〜わけにはいかない, 〜ないわけにはいかない, 〜ざるを得ない, 〜べきだ, 〜ものだ, 〜ことだ",
    grammarIds: ["n3-skz-wake-niwa-ikanai","n3-skz-nai-wake-niwa-ikanai","n3-skz-zaru-o-enai","n3-skz-beki-da","n3-skz-mono-da","n3-skz-koto-da"]
  },
  // --- N3: Chuyên đề 6: So sánh, Mức độ & Giới hạn ---
  {
    id: "skz-n3-c6",
    level: "N3",
    curriculum: "SHINKANZEN_N3",
    curriculumTitle: "Shinkanzen Master N3",
    lessonNumber: 6,
    title: "Chuyên đề 6: So sánh, Mức độ & Giới hạn",
    description: "〜わりに, 〜にしては, 〜に比べて, 〜ほど, 〜ほど〜ない, 〜くらい, 〜ばかり, 〜どころか, 〜さえ",
    grammarIds: ["n3-skz-wari-ni","n3-skz-ni-shite-wa","n3-skz-ni-kurabete","n3-skz-hodo","n3-skz-hodo-nai","n3-skz-kurai","n3-skz-bakari","n3-skz-dokoroka","n3-skz-sae"]
  },
  // --- N3: Chuyên đề 7: Nhượng bộ & Đối lập ---
  {
    id: "skz-n3-c7",
    level: "N3",
    curriculum: "SHINKANZEN_N3",
    curriculumTitle: "Shinkanzen Master N3",
    lessonNumber: 7,
    title: "Chuyên đề 7: Nhượng bộ & Đối lập",
    description: "〜にもかかわらず, 〜反面, 〜一方で, 〜くせに, 〜ものの, 〜といっても, 〜としても",
    grammarIds: ["n3-skz-ni-mo-kakawarazu","n3-skz-hanmen","n3-skz-ippou-de","n3-skz-kuse-ni","n3-skz-mono-no","n3-skz-to-ittemo","n3-skz-toshitemo"]
  },
  // --- N3: Chuyên đề 8: Cảm xúc, Tâm trạng & Xu hướng ---
  {
    id: "skz-n3-c8",
    level: "N3",
    curriculum: "SHINKANZEN_N3",
    curriculumTitle: "Shinkanzen Master N3",
    lessonNumber: 8,
    title: "Chuyên đề 8: Cảm xúc, Tâm trạng & Xu hướng",
    description: "〜てたまらない, 〜てしょうがない, 〜てならない, 〜気味, 〜っぽい, 〜がち, 〜だらけ",
    grammarIds: ["n3-skz-te-tamaranai","n3-skz-te-shouganai","n3-skz-te-naranai","n3-skz-gimi","n3-skz-ppoi","n3-skz-gachi","n3-skz-darake"]
  },
  // --- N3: Chuyên đề 9: Điều kiện & Giả định ---
  {
    id: "skz-n3-c9",
    level: "N3",
    curriculum: "SHINKANZEN_N3",
    curriculumTitle: "Shinkanzen Master N3",
    lessonNumber: 9,
    title: "Chuyên đề 9: Điều kiện & Giả định",
    description: "〜さえ〜ば, 〜たとえ〜ても, 〜としたら, 〜ないことには, 〜ば〜ほど, 〜といえば",
    grammarIds: ["n3-skz-sae-ba","n3-skz-tatoe-temo","n3-skz-to-shitara","n3-skz-nai-koto-niwa","n3-skz-ba-hodo","n3-skz-to-ieba"]
  },
  // --- N3: Chuyên đề 10: Phán đoán, Suy luận & Đánh giá ---
  {
    id: "skz-n3-c10",
    level: "N3",
    curriculum: "SHINKANZEN_N3",
    curriculumTitle: "Shinkanzen Master N3",
    lessonNumber: 10,
    title: "Chuyên đề 10: Phán đoán, Suy luận & Đánh giá",
    description: "〜に違いない, 〜はずだ, 〜わけだ, 〜わけがない, 〜恐れがある, 〜にすぎない, 〜かねない, 〜かねる",
    grammarIds: ["n3-skz-ni-chigai-nai","n3-skz-hazu-da","n3-skz-wake-da","n3-skz-wake-ga-nai","n3-skz-osore-ga-aru","n3-skz-ni-suginai","n3-skz-kane-nai","n3-skz-kane-ru"]
  },
  // --- N2: Chuyên đề 1: Bắt buộc, Đành phải & Không kìm nén ---
  {
    id: "skz-n2-c1",
    level: "N2",
    curriculum: "SHINKANZEN_N2",
    curriculumTitle: "Shinkanzen Master N2",
    lessonNumber: 1,
    title: "Chuyên đề 1: Bắt buộc, Đành phải & Không kìm nén",
    description: "〜ざるを得ない, 〜やむを得ない, 〜てたまらない, 〜てならない, 〜てしょうがない, 〜ずにはいられない, 〜を禁じ得ない",
    grammarIds: ["n2-zaruoenai","n2-yamuoenai","n2-tetamaranai","n2-tenaranai","n2-teshouganai","n2-zuniwairarenai","n2-okinjienai"]
  },
  // --- N2: Chuyên đề 2: Thời điểm, Cơ hội & Bước ngoặt ---
  {
    id: "skz-n2-c2",
    level: "N2",
    curriculum: "SHINKANZEN_N2",
    curriculumTitle: "Shinkanzen Master N2",
    lessonNumber: 2,
    title: "Chuyên đề 2: Thời điểm, Cơ hội & Bước ngoặt",
    description: "〜ついでに, 〜を契機に, 〜をきっかけに, 〜折に, 〜際, 〜最中に, 〜に先立って",
    grammarIds: ["n2-tsuideni","n2-okeikini","n2-okikkakeni","n2-orini","n2-saini","n2-saichuuni","n2-nisakidatte"]
  },
  // --- N2: Chuyên đề 3: Phạm vi, Bất kể & Không liên quan ---
  {
    id: "skz-n2-c3",
    level: "N2",
    curriculum: "SHINKANZEN_N2",
    curriculumTitle: "Shinkanzen Master N2",
    lessonNumber: 3,
    title: "Chuyên đề 3: Phạm vi, Bất kể & Không liên quan",
    description: "〜を問わず, 〜にかかわらず, 〜もかまわず, 〜はともかく, 〜はさておき, 〜に限らず, 〜のみならず",
    grammarIds: ["n2-otowazu","n2-nikakawarazu","n2-mokamawazu","n2-watomokaku","n2-wasateoki","n2-nikagirazu","n2-nominarazu"]
  },
  // --- N2: Chuyên đề 4: Quan hệ, Đối tượng & Căn cứ ---
  {
    id: "skz-n2-c4",
    level: "N2",
    curriculum: "SHINKANZEN_N2",
    curriculumTitle: "Shinkanzen Master N2",
    lessonNumber: 4,
    title: "Chuyên đề 4: Quan hệ, Đối tượng & Căn cứ",
    description: "〜をめぐって, 〜に基づいて, 〜に即して, 〜に応じて, 〜に沿って, 〜のもとで, 〜を通して, 〜にわたって",
    grammarIds: ["n2-omegutte","n2-nimotozuite","n2-nisokushite","n2-nioujite","n2-nisotte","n2-nomotode","n2-otooshite","n2-niwatatte"]
  },
  // --- N2: Chuyên đề 5: Đối lập, Nhượng bộ & Tương phản ---
  {
    id: "skz-n2-c5",
    level: "N2",
    curriculum: "SHINKANZEN_N2",
    curriculumTitle: "Shinkanzen Master N2",
    lessonNumber: 5,
    title: "Chuyên đề 5: Đối lập, Nhượng bộ & Tương phản",
    description: "〜に反して, 〜に引き換え, 〜一方で, 〜反面, 〜にもかかわらず, 〜くせに, 〜からといって",
    grammarIds: ["n2-nihanshite","n2-nihikikae","n2-ippoude","n2-hanmen","n2-nimokakawarazu","n2-kuseni","n2-karatoitte"]
  },
  // --- N2: Chuyên đề 6: Điều kiện khắc nghiệt & Giả định cực đoan ---
  {
    id: "skz-n2-c6",
    level: "N2",
    curriculum: "SHINKANZEN_N2",
    curriculumTitle: "Shinkanzen Master N2",
    lessonNumber: 6,
    title: "Chuyên đề 6: Điều kiện khắc nghiệt & Giả định cực đoan",
    description: "〜ないことには, 〜ものなら, 〜ようものなら, 〜につけ, 〜にしろ, 〜としたら, 〜としても",
    grammarIds: ["n2-naikotoniwa","n2-mononara","n2-youmononara","n2-nitsuke","n2-nishiro","n2-toshitara","n2-toshitemo"]
  },
  // --- N2: Chuyên đề 7: Phán đoán chắc chắn, Đánh giá & Giới hạn ---
  {
    id: "skz-n2-c7",
    level: "N2",
    curriculum: "SHINKANZEN_N2",
    curriculumTitle: "Shinkanzen Master N2",
    lessonNumber: 7,
    title: "Chuyên đề 7: Phán đoán chắc chắn, Đánh giá & Giới hạn",
    description: "〜に相違ない, 〜に決まっている, 〜っこない, 〜わけがない, 〜わけではない, 〜にすぎない, 〜を限りに, 〜に違いない",
    grammarIds: ["n2-nisouinai","n2-nikimatteiru","n2-kkonai","n2-wakeganai","n2-wakedewanai","n2-nisuginai","n2-okagirini","n2-nichigainai"]
  },
  // --- N2: Chuyên đề 8: Trạng thái, Xu hướng & Cảm xúc sâu sắc ---
  {
    id: "skz-n2-c8",
    level: "N2",
    curriculum: "SHINKANZEN_N2",
    curriculumTitle: "Shinkanzen Master N2",
    lessonNumber: 8,
    title: "Chuyên đề 8: Trạng thái, Xu hướng & Cảm xúc sâu sắc",
    description: "〜っぽい, 〜気味, 〜がち, 〜一方だ, 〜ばかりだ, 〜げ, 〜かのように, 〜どころではない, 〜抜く",
    grammarIds: ["n2-ppoi","n2-gimi","n2-gachi","n2-ippouda","n2-bakarida","n2-ge","n2-kanoyouni","n2-dokorodewanai","n2-nuku"]
  },
  // --- N1: Chuyên đề 1: Trình tự thời gian tức thì & Diễn tiến đỉnh cao ---
  {
    id: "skz-n1-c1",
    level: "N1",
    curriculum: "SHINKANZEN_N1",
    curriculumTitle: "Shinkanzen Master N1",
    lessonNumber: 1,
    title: "Chuyên đề 1: Trình tự thời gian tức thì & Diễn tiến đỉnh cao",
    description: "〜や否や, 〜が早いか, 〜なり, 〜そばから, 〜を皮切りに, 〜に至るまで, 〜と相まって",
    grammarIds: ["n1-yainaya","n1-gahayaika","n1-nari","n1-sobakara","n1-okawakirini","n1-niitarumade","n1-toaimatte"]
  },
  // --- N1: Chuyên đề 2: Cảm xúc cực độ & Trạng thái tột cùng ---
  {
    id: "skz-n1-c2",
    level: "N1",
    curriculum: "SHINKANZEN_N1",
    curriculumTitle: "Shinkanzen Master N1",
    lessonNumber: 2,
    title: "Chuyên đề 2: Cảm xúc cực độ & Trạng thái tột cùng",
    description: "〜極まる / 極まりない, 〜の至り, 〜てやまない, 〜に堪えない, 〜を余儀なくされる, 〜にたえない, 〜といったらありはしない, 〜に越したことはない",
    grammarIds: ["n1-kiwamaru","n1-noitari","n1-teyamanai","n1-nitaenai","n1-oyoginagusareru","n1-kanshitanitaenai","n1-toittaraariwashinai","n1-nikoshitakotonai"]
  },
  // --- N1: Chuyên đề 3: Tư cách, Trách nhiệm xã hội & Vai vế ---
  {
    id: "skz-n1-c3",
    level: "N1",
    curriculum: "SHINKANZEN_N1",
    curriculumTitle: "Shinkanzen Master N1",
    lessonNumber: 3,
    title: "Chuyên đề 3: Tư cách, Trách nhiệm xã hội & Vai vế",
    description: "〜に恥じない, 〜にあるまじき, 〜ならではの, 〜をおいてほかにない, 〜たるもの, 〜まじき",
    grammarIds: ["n1-nihajinai","n1-niarumajiki","n1-naradewano","n1-ooitehokaninai","n1-tarumono","n1-majiki"]
  },
  // --- N1: Chuyên đề 4: Giả định phi thực tế & Tình huống khắc nghiệt ---
  {
    id: "skz-n1-c4",
    level: "N1",
    curriculum: "SHINKANZEN_N1",
    curriculumTitle: "Shinkanzen Master N1",
    lessonNumber: 4,
    title: "Chuyên đề 4: Giả định phi thực tế & Tình huống khắc nghiệt",
    description: "〜とあれば, 〜ならいざ知らず, 〜なくしては, 〜といえども, 〜であれ, 〜だに, 〜たりとも",
    grammarIds: ["n1-toareba","n1-naraizashirazu","n1-nakushitewa","n1-toiedomo","n1-deare","n1-dani","n1-taritomo"]
  },
  // --- N1: Chuyên đề 5: Bắt buộc đạo đức, Đương nhiên & Tránh né ---
  {
    id: "skz-n1-c5",
    level: "N1",
    curriculum: "SHINKANZEN_N1",
    curriculumTitle: "Shinkanzen Master N1",
    lessonNumber: 5,
    title: "Chuyên đề 5: Bắt buộc đạo đức, Đương nhiên & Tránh né",
    description: "〜を踏まえて, 〜をよそに, 〜を機に, 〜をものともせずに, 〜かたわら, 〜べく, 〜べからず",
    grammarIds: ["n1-ofumaete","n1-oyosoni","n1-okini","n1-omonotomosezuni","n1-katawara","n1-beku","n1-bekarazu"]
  },
  // --- N1: Chuyên đề 6: Phủ định tuyệt đối, Nhấn mạnh & Ngữ khí trang trọng ---
  {
    id: "skz-n1-c6",
    level: "N1",
    curriculum: "SHINKANZEN_N1",
    curriculumTitle: "Shinkanzen Master N1",
    lessonNumber: 6,
    title: "Chuyên đề 6: Phủ định tuyệt đối, Nhấn mạnh & Ngữ khí trang trọng",
    description: "〜ないではすまない, 〜ずにはすまない, 〜にかこつけて, 〜んばかり, 〜ともなく, 〜まみれ, 〜ずくめ, 〜ぐるみ, 〜きらいがある, 〜始末だ",
    grammarIds: ["n1-naidewasumanai","n1-zuniwasumanai","n1-nikakotsukete","n1-nbakari","n1-tomonaku","n1-mamire","n1-zukume","n1-gurumi","n1-kiraigaaru","n1-shimatsuda"]
  }
];

// =========================================================================
// 2. NGÂN HÀNG MẪU NGỮ PHÁP TOÀN DIỆN (FULL GRAMMAR DATABASE)
// Gộp đầy đủ 50 bài Minna no Nihongo (N5 - N4) & Các chuyên đề JLPT N3 - N1
// =========================================================================
export const FULL_GRAMMAR_DATABASE: GrammarMasterItem[] = [
  ...N5_MINNA_I,
  ...N4_MINNA_II,
  ...N3_SHINKANZEN,
  ...N2_SHINKANZEN,
  ...N1_SHINKANZEN
];
