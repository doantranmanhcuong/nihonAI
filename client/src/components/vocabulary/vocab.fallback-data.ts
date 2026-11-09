import { CurriculumType, LessonSummaryItem } from './VocabStudio';

export const MINNA_N5_TOPICS: Record<number, { title: string; topic: string; wordCount: number; samples: string[] }> = {
  1: { title: 'Bài 1', topic: 'Giới thiệu bản thân & Quốc tịch', wordCount: 42, samples: ['私', '学生', '先生', '会社員'] },
  2: { title: 'Bài 2', topic: 'Đồ vật quanh ta & Sở hữu', wordCount: 45, samples: ['本', '辞書', '雑誌', '新聞'] },
  3: { title: 'Bài 3', topic: 'Địa điểm, Tòa nhà & Giá cả', wordCount: 40, samples: ['教室', '食堂', '事務所', '会議室'] },
  4: { title: 'Bài 4', topic: 'Thời gian, Giờ giấc & Lịch trình', wordCount: 48, samples: ['起きる', '寝る', '働く', '休む'] },
  5: { title: 'Bài 5', topic: 'Phương tiện đi lại & Ngày tháng', wordCount: 44, samples: ['行く', '来る', '帰る', '電車'] },
  6: { title: 'Bài 6', topic: 'Ăn uống & Hoạt động thường ngày', wordCount: 46, samples: ['食べる', '飲む', '見る', '聞く'] },
  7: { title: 'Bài 7', topic: 'Tặng quà, Công cụ & Phương tiện', wordCount: 43, samples: ['あげる', 'もらう', '貸す', '借りる'] },
  8: { title: 'Bài 8', topic: 'Tính từ miêu tả Con người & Sự vật', wordCount: 47, samples: ['有名', '親切', '元気', '静か'] },
  9: { title: 'Bài 9', topic: 'Sở thích, Năng lực & Lý do', wordCount: 42, samples: ['好き', '嫌い', '上手', '下手'] },
  10: { title: 'Bài 10', topic: 'Vị trí & Sự tồn tại (Arimasu/Imasu)', wordCount: 41, samples: ['ある', 'いる', '上', '下'] },
  11: { title: 'Bài 11', topic: 'Lượng từ, Cách đếm & Thời lượng', wordCount: 45, samples: ['一つ', '一人', '一枚', '一回'] },
  12: { title: 'Bài 12', topic: 'Thời tiết, Mùa & So sánh hơn nhất', wordCount: 44, samples: ['簡単', '近い', '遠い', '早い'] },
  13: { title: 'Bài 13', topic: 'Mong muốn & Mục đích di chuyển', wordCount: 40, samples: ['遊びます', '泳ぎます', '迎えます', '疲れます'] },
  14: { title: 'Bài 14', topic: 'Thể Te (て形) & Yêu cầu lịch sự', wordCount: 46, samples: ['つけます', '消します', '開けます', '閉めます'] },
  15: { title: 'Bài 15', topic: 'Xin phép, Cấm đoán & Nghề nghiệp', wordCount: 39, samples: ['立ちます', '座ります', '使います', '置きます'] },
  16: { title: 'Bài 16', topic: 'Nối câu, Trình tự hành động & Cơ thể', wordCount: 45, samples: ['乗ります', '降ります', '乗り換えます', '浴びます'] },
  17: { title: 'Bài 17', topic: 'Thể Nai (ない形) & Nghĩa vụ, Sức khỏe', wordCount: 43, samples: ['覚えます', '忘れます', 'なくします', '払います'] },
  18: { title: 'Bài 18', topic: 'Thể Từ điển (辞書形) & Khả năng', wordCount: 38, samples: ['できます', '洗います', '弾きます', '歌います'] },
  19: { title: 'Bài 19', topic: 'Thể Ta (た形) & Kinh nghiệm bản thân', wordCount: 41, samples: ['登ります', '泊まります', '掃除します', '洗濯します'] },
  20: { title: 'Bài 20', topic: 'Thể Thông thường (普通形) & Hội thoại', wordCount: 37, samples: ['要ります', '調べます', '直します', '修理します'] },
  21: { title: 'Bài 21', topic: 'Bày tỏ ý kiến, Phán đoán & Tin tức', wordCount: 42, samples: ['思います', '言います', '足ります', '勝ちます'] },
  22: { title: 'Bài 22', topic: 'Mệnh đề định ngữ & Trang phục', wordCount: 40, samples: ['着ます', '履きます', 'かぶります', 'かけます'] },
  23: { title: 'Bài 23', topic: 'Khi nào (~とき) & Chỉ đường, Giao thông', wordCount: 41, samples: ['聞きます', '回します', '引きます', '変えます'] },
  24: { title: 'Bài 24', topic: 'Cho - Nhận hành động (Kureru/Morau)', wordCount: 38, samples: ['くれます', '連れて行きます', '送ります', '紹介します'] },
  25: { title: 'Bài 25', topic: 'Giả định (~たら / ~ても) & Chúc mừng', wordCount: 40, samples: ['考えます', '着きます', '留学します', '取ります'] }
};

export const INITIAL_MINNA_N5_LESSON_1_WORDS = [
  { id: 'v-n5-1-1', word: '私', reading: 'わたし', hanViet: 'TƯ', meaningVi: 'Tôi', pos: 'noun', pitchAccent: '0', jlptLevel: 'N5', lesson: 1, exampleJp: '私はマイク・ミラーです。', exampleVi: 'Tôi là Mike Miller.' },
  { id: 'v-n5-1-2', word: 'あなた', reading: 'あなた', hanViet: '', meaningVi: 'Bạn, anh, chị (ngôi thứ 2)', pos: 'noun', pitchAccent: '2', jlptLevel: 'N5', lesson: 1, exampleJp: 'あなたは学生ですか。', exampleVi: 'Bạn có phải là sinh viên không?' },
  { id: 'v-n5-1-3', word: 'あの人', reading: 'あのひと', hanViet: 'NHÂN', meaningVi: 'Người kia, người đó', pos: 'noun', pitchAccent: '2', jlptLevel: 'N5', lesson: 1, exampleJp: 'あの人は誰ですか。', exampleVi: 'Người kia là ai vậy?' },
  { id: 'v-n5-1-4', word: 'あの方', reading: 'あのかた', hanViet: 'PHƯƠNG', meaningVi: 'Vị kia (cách nói lịch sự của あの人)', pos: 'noun', pitchAccent: '2', jlptLevel: 'N5', lesson: 1, exampleJp: 'あの方はどなたですか。', exampleVi: 'Vị kia là vị nào vậy?' },
  { id: 'v-n5-1-5', word: '先生', reading: 'せんせい', hanViet: 'TIÊN SINH', meaningVi: 'Thầy/cô giáo, giảng viên, bác sĩ', pos: 'noun', pitchAccent: '3', jlptLevel: 'N5', lesson: 1, exampleJp: '佐藤先生は日本語の先生です。', exampleVi: 'Cô Sato là giáo viên tiếng Nhật.' },
  { id: 'v-n5-1-6', word: '教師', reading: 'きょうし', hanViet: 'GIÁO SƯ', meaningVi: 'Giáo viên (nói về nghề nghiệp của mình)', pos: 'noun', pitchAccent: '1', jlptLevel: 'N5', lesson: 1, exampleJp: '私は大学の教師です。', exampleVi: 'Tôi là giảng viên đại học.' },
  { id: 'v-n5-1-7', word: '学生', reading: 'がくせい', hanViet: 'HỌC SINH', meaningVi: 'Học sinh, sinh viên', pos: 'noun', pitchAccent: '0', jlptLevel: 'N5', lesson: 1, exampleJp: '私は富士大学の学生です。', exampleVi: 'Tôi là sinh viên trường Đại học Fuji.' },
  { id: 'v-n5-1-8', word: '会社員', reading: 'かいしゃいん', hanViet: 'HỘI XÃ VIÊN', meaningVi: 'Nhân viên công ty', pos: 'noun', pitchAccent: '3', jlptLevel: 'N5', lesson: 1, exampleJp: '田中さんは会社員です。', exampleVi: 'Anh Tanaka là nhân viên công ty.' },
  { id: 'v-n5-1-9', word: '社員', reading: 'しゃいん', hanViet: 'XÃ VIÊN', meaningVi: 'Nhân viên công ty ~ (dùng kèm tên công ty)', pos: 'noun', pitchAccent: '1', jlptLevel: 'N5', lesson: 1, exampleJp: 'IMCの社員です。', exampleVi: 'Tôi là nhân viên công ty IMC.' },
  { id: 'v-n5-1-10', word: '銀行員', reading: 'ぎんこういん', hanViet: 'NGÂN HÀNG VIÊN', meaningVi: 'Nhân viên ngân hàng', pos: 'noun', pitchAccent: '3', jlptLevel: 'N5', lesson: 1, exampleJp: '兄は銀行員です。', exampleVi: 'Anh trai tôi là nhân viên ngân hàng.' },
  { id: 'v-n5-1-11', word: '医者', reading: 'いしゃ', hanViet: 'Y GIẢ', meaningVi: 'Bác sĩ', pos: 'noun', pitchAccent: '0', jlptLevel: 'N5', lesson: 1, exampleJp: 'ワットさんは医者ですか。', exampleVi: 'Ông Watt có phải là bác sĩ không?' },
  { id: 'v-n5-1-12', word: '研究者', reading: 'けんきゅうしゃ', hanViet: 'NGHIÊN CỨU GIẢ', meaningVi: 'Nhà nghiên cứu', pos: 'noun', pitchAccent: '3', jlptLevel: 'N5', lesson: 1, exampleJp: 'サントスさんは研究者です。', exampleVi: 'Anh Santos là nhà nghiên cứu.' },
  { id: 'v-n5-1-13', word: 'エンジニア', reading: 'えんじにあ', hanViet: '', meaningVi: 'Kỹ sư', pos: 'noun', pitchAccent: '3', jlptLevel: 'N5', lesson: 1, exampleJp: '私はITエンジニアです。', exampleVi: 'Tôi là kỹ sư CNTT.' },
  { id: 'v-n5-1-14', word: '大学', reading: 'だいがく', hanViet: 'ĐẠI HỌC', meaningVi: 'Trường đại học', pos: 'noun', pitchAccent: '0', jlptLevel: 'N5', lesson: 1, exampleJp: 'さくら大学の学生です。', exampleVi: 'Là sinh viên Đại học Sakura.' },
  { id: 'v-n5-1-15', word: '病院', reading: 'びょういん', hanViet: 'BỆNH VIỆN', meaningVi: 'Bệnh viện', pos: 'noun', pitchAccent: '0', jlptLevel: 'N5', lesson: 1, exampleJp: '神戸病院の医者です。', exampleVi: 'Là bác sĩ Bệnh viện Kobe.' },
  { id: 'v-n5-1-16', word: '電気', reading: 'でんき', hanViet: 'ĐIỆN KHÍ', meaningVi: 'Điện, đèn điện', pos: 'noun', pitchAccent: '1', jlptLevel: 'N5', lesson: 1, exampleJp: 'パワー電気の社員です。', exampleVi: 'Là nhân viên công ty Điện lực Power.' },
  { id: 'v-n5-1-17', word: '誰', reading: 'だれ', hanViet: 'THÙY', meaningVi: 'Ai (どなた là cách nói lịch sự)', pos: 'noun', pitchAccent: '1', jlptLevel: 'N5', lesson: 1, exampleJp: 'あの人は誰ですか。', exampleVi: 'Người kia là ai?' },
  { id: 'v-n5-1-18', word: '何歳', reading: 'なんさい', hanViet: 'HÀ TUẾ', meaningVi: 'Mấy tuổi, bao nhiêu tuổi (おいくつ lịch sự)', pos: 'noun', pitchAccent: '1', jlptLevel: 'N5', lesson: 1, exampleJp: 'テレサちゃんは何歳ですか。', exampleVi: 'Bé Teresa mấy tuổi rồi?' },
  { id: 'v-n5-1-19', word: '日本', reading: 'にほん', hanViet: 'NHẬT BẢN', meaningVi: 'Nước Nhật Bản', pos: 'noun', pitchAccent: '2', jlptLevel: 'N5', lesson: 1, exampleJp: '日本から来ました。', exampleVi: 'Tôi đến từ Nhật Bản.' },
  { id: 'v-n5-1-20', word: 'ベトナム', reading: 'べとなむ', hanViet: 'VIỆT NAM', meaningVi: 'Nước Việt Nam', pos: 'noun', pitchAccent: '0', jlptLevel: 'N5', lesson: 1, exampleJp: '私はベトナム人です。', exampleVi: 'Tôi là người Việt Nam.' }
];

export function getFallbackVocabCurriculumLessons(curriculum: CurriculumType, level: string): LessonSummaryItem[] {
  const result: LessonSummaryItem[] = [];

  if (curriculum === 'MINNA' && level === 'N5') {
    for (let i = 1; i <= 25; i++) {
      const info = MINNA_N5_TOPICS[i];
      result.push({
        lesson: i,
        title: info.title,
        topic: info.topic,
        wordCount: info.wordCount,
        progressPercent: 0,
        samples: info.samples
      });
      if (i % 3 === 0) {
        result.push({
          lesson: -i,
          title: `Ôn tập Bài ${i - 2} - ${i}`,
          topic: 'Tổng hợp 30 câu hỏi trắc nghiệm từ vựng',
          wordCount: 30,
          progressPercent: 0,
          samples: ['Kiểm tra', 'Trắc nghiệm']
        });
      }
    }
    result.push({
      lesson: -999,
      title: 'Thi Tổng Hợp MINNA N5',
      topic: 'Đề thi sát hạch cuối khóa (100 câu hỏi)',
      wordCount: 100,
      progressPercent: 0,
      samples: ['100 câu', 'Tổng hợp']
    });
    return result;
  }

  if (curriculum === 'MINNA' && level === 'N4') {
    for (let i = 26; i <= 50; i++) {
      result.push({
        lesson: i,
        title: `Bài ${i}`,
        topic: `Từ vựng Minna no Nihongo II - Bài ${i}`,
        wordCount: 42,
        progressPercent: 0,
        samples: ['会話', '表現', '語彙']
      });
      if ((i - 25) % 3 === 0) {
        result.push({
          lesson: -i,
          title: `Ôn tập Bài ${i - 2} - ${i}`,
          topic: 'Tổng hợp 30 câu hỏi trắc nghiệm từ vựng',
          wordCount: 30,
          progressPercent: 0,
          samples: ['Kiểm tra', 'Trắc nghiệm']
        });
      }
    }
    result.push({
      lesson: -999,
      title: 'Thi Tổng Hợp MINNA N4',
      topic: 'Đề thi sát hạch cuối khóa (100 câu hỏi)',
      wordCount: 100,
      progressPercent: 0,
      samples: ['100 câu', 'Tổng hợp']
    });
    return result;
  }

  const totalChapters = level === 'N5' || level === 'N4' ? 12 : 15;
  const labelPrefix = curriculum === 'TANGO' ? 'Unit' : curriculum === 'MIMIKARA' ? 'Chủ đề' : 'Tuần';
  for (let i = 1; i <= totalChapters; i++) {
    result.push({
      lesson: i,
      title: `${labelPrefix} ${i}`,
      topic: `Từ vựng trọng tâm ${curriculum} ${level} - Phần ${i}`,
      wordCount: 45,
      progressPercent: 0,
      samples: ['重要語彙', 'JLPT']
    });
    if (i % 3 === 0) {
      result.push({
        lesson: -i,
        title: `Ôn tập ${labelPrefix} ${i - 2} - ${i}`,
        topic: 'Tổng hợp 30 câu hỏi trắc nghiệm từ vựng',
        wordCount: 30,
        progressPercent: 0,
        samples: ['Kiểm tra', 'Trắc nghiệm']
      });
    }
  }
  result.push({
    lesson: -999,
    title: `Thi Tổng Hợp ${curriculum} ${level}`,
    topic: 'Đề thi sát hạch cuối khóa (100 câu hỏi)',
    wordCount: 100,
    progressPercent: 0,
    samples: ['100 câu', 'Tổng hợp']
  });
  return result;
}

export function getFallbackVocabLessonData(curriculum: CurriculumType, level: string, lessonNum: number) {
  const topicInfo =
    curriculum === 'MINNA' && level === 'N5' && MINNA_N5_TOPICS[lessonNum]
      ? MINNA_N5_TOPICS[lessonNum].topic
      : `Từ vựng trọng tâm ${curriculum} ${level} - Bài ${lessonNum}`;

  const words =
    curriculum === 'MINNA' && level === 'N5' && lessonNum === 1
      ? INITIAL_MINNA_N5_LESSON_1_WORDS
      : INITIAL_MINNA_N5_LESSON_1_WORDS.map((w, idx) => ({
          ...w,
          id: `v-${curriculum}-${level}-${lessonNum}-${idx + 1}`,
          jlptLevel: level,
          lesson: lessonNum
        }));

  return {
    curriculum,
    level,
    lesson: lessonNum,
    topic: topicInfo,
    themeTopic: topicInfo,
    totalWords: words.length,
    words
  };
}
