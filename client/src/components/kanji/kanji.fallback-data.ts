// Bộ dữ liệu Giáo trình Hán tự chuẩn (Instant 0ms Bootstrap)
// Đảm bảo trang #kanji luôn hiển thị đầy đủ 16 bài học + Ôn tập ngay từ mili-giây đầu tiên (0ms),
// kể cả khi Server Render / TiDB đang trong trạng thái Cold Start.

export interface FallbackKanjiItem {
  character: string;
  hanViet: string;
  meaningVi: string;
  jlptLevel: string;
  curriculum: string;
  lesson: number;
  lessonTitle: string;
  strokeCount: number;
  kunyomi: string;
  onyomi: string;
  lookAndLearnTip?: string;
  mnemonic?: string;
  radicals?: { symbol: string; name: string }[];
  exampleWords?: { word: string; reading: string; hanViet: string; meaningVi: string }[];
}

type CompactKanjiTuple = [
  char: string,
  hanViet: string,
  meaningVi: string,
  strokeCount: number,
  kunyomi: string,
  onyomi: string,
  tip: string
];

const N5_LOOK_AND_LEARN_LESSONS: Array<{
  lesson: number;
  title: string;
  items: CompactKanjiTuple[];
}> = [
  {
    lesson: 1,
    title: 'Bài 1: Chữ số & Đếm cơ bản',
    items: [
      ['一', 'NHẤT', 'Số một', 1, 'ひと(つ)', 'イチ、イツ', 'Một nét gạch ngang duy nhất biểu thị số 1.'],
      ['二', 'NHỊ', 'Số hai', 2, 'ふた(つ)', 'ニ', 'Hai nét gạch ngang song song biểu thị số 2.'],
      ['三', 'TAM', 'Số ba', 3, 'みっ(つ)', 'サン', 'Ba nét gạch ngang xếp chồng biểu thị số 3.'],
      ['四', 'TỨ', 'Số bốn', 5, 'よっ(つ)、よん', 'シ', 'Khung hình vuông có 4 góc biểu thị số 4.'],
      ['五', 'NGŨ', 'Số năm', 4, 'いつ(つ)', 'ゴ', 'Bàn tay 5 ngón đan xen giữa trời và đất.'],
      ['六', 'LỤC', 'Số sáu', 4, 'むっ(つ)', 'ロク', 'Đội mũ giơ hai chân tạo thành hình số 6.'],
      ['七', 'THẤT', 'Số bảy', 2, 'なな(つ)', 'シチ', 'Số 7 viết ngược cắt ngang một nét.'],
      ['八', 'BÁT', 'Số tám', 2, 'やっ(つ)', 'ハチ', 'Hai nét xòe rộng ra như râu bát giới (số 8).'],
      ['九', 'CỬU', 'Số chín', 2, 'ここの(つ)', 'キュウ、ク', 'Người cúi gập khuỷu tay tạo hình số 9.'],
      ['十', 'THẬP', 'Số mười', 2, 'とお', 'ジュウ', 'Hai bàn tay đan chữ thập biểu thị số 10.'],
      ['百', 'BÁCH', 'Một trăm', 6, 'もも', 'ヒャク', 'Một (一) kết hợp chữ Bạch (白) tạo thành 100.'],
      ['千', 'THIÊN', 'Một nghìn', 3, 'ち', 'セン', 'Một nét phẩy trên chữ Thập (十) biểu thị 1.000.'],
      ['万', 'VẠN', 'Mười nghìn', 3, 'よろず', 'マン、バン', 'Con số lớn gấp vạn lần, hàng vạn.'],
      ['円', 'VIÊN', 'Đồng Yên, Tròn', 4, 'まる(い)', 'エン', 'Đồng tiền hình tròn của Nhật Bản (Yên).'],
      ['口', 'KHẨU', 'Cái miệng', 3, 'くち', 'コウ、ク', 'Hình dáng cái miệng đang mở rộng.'],
      ['目', 'MỤC', 'Đôi mắt', 5, 'め', 'モク', 'Hình con mắt xoay dọc có con ngươi bên trong.']
    ]
  },
  {
    lesson: 2,
    title: 'Bài 2: Thiên nhiên & Thời gian',
    items: [
      ['日', 'NHẬT', 'Mặt trời, Ngày', 4, 'ひ、か', 'ニチ、ジツ', 'Hình mặt trời tỏa sáng giữa bầu trời.'],
      ['月', 'NGUYỆT', 'Mặt trăng, Tháng', 4, 'つき', 'ゲツ、ガツ', 'Hình trăng lưỡi liềm treo trên bầu trời đêm.'],
      ['火', 'HỎA', 'Ngọn lửa', 4, 'ひ', 'カ', 'Ngọn lửa đang bùng cháy với tia lửa bắn ra hai bên.'],
      ['水', 'THỦY', 'Dòng nước', 4, 'みず', 'スイ', 'Dòng nước chảy uốn lượn với các tia nước bắn tung tóe.'],
      ['木', 'MỘC', 'Cây cối, Gỗ', 4, 'き、こ', 'モク、ボク', 'Hình cái cây có thân, cành vươn lên và rễ bám đất.'],
      ['金', 'KIM', 'Vàng, Tiền, Kim loại', 8, 'かね', 'キン、コン', 'Quặng vàng lấp lánh nằm sâu dưới lòng núi đất.'],
      ['土', 'THỔ', 'Đất đai', 3, 'つち', 'ド、ト', 'Mầm cây đâm chồi lên khỏi mặt đất.'],
      ['曜', 'DIỆU', 'Ngày trong tuần', 18, '—', 'ヨウ', 'Ánh sáng mặt trời (日) chiếu vào đôi cánh chim (羽).'],
      ['上', 'THƯỢNG', 'Ở trên, Lên', 3, 'うえ、あ(がる)', 'ジョウ', 'Điểm chỉ vị trí nằm phía trên đường ngang.'],
      ['下', 'HẠ', 'Ở dưới, Xuống', 3, 'した、さ(がる)', 'カ、ゲ', 'Điểm chỉ vị trí nằm phía dưới đường ngang.'],
      ['中', 'TRUNG', 'Ở giữa, Bên trong', 4, 'なか', 'チュウ', 'Nét sổ xuyên chính giữa khung hình chữ nhật.'],
      ['半', 'BÁN', 'Một nửa', 5, 'なか(ば)', 'ハン', 'Nét sổ bổ đôi vật thể thành hai nửa bằng nhau.']
    ]
  },
  {
    lesson: 3,
    title: 'Bài 3: Con người & Gia đình',
    items: [
      ['人', 'NHÂN', 'Con người', 2, 'ひと', 'ジン、ニン', 'Hình dáng con người đang sải bước đứng thẳng.'],
      ['子', 'TỬ', 'Đứa trẻ, Con cái', 3, 'こ', 'シ、ス', 'Em bé dang rộng hai tay đòi bế.'],
      ['女', 'NỮ', 'Phụ nữ, Con gái', 3, 'おんな、め', 'ジョ、ニョ', 'Người phụ nữ ngồi khép chân duyên dáng.'],
      ['男', 'NAM', 'Đàn ông, Con trai', 7, 'おとこ', 'ダン、ナン', 'Người bỏ sức lực (力) cày cấy ngoài đồng ruộng (田).'],
      ['父', 'PHỤ', 'Cha, Bố', 4, 'ちち', 'フ', 'Người cha cầm rìu lao động trụ cột gia đình.'],
      ['母', 'MẪU', 'Mẹ', 5, 'はは', 'ボ', 'Người mẹ ôm ấp cho con bú sữa.'],
      ['友', 'HỮU', 'Bạn bè', 4, 'とも', 'ユウ', 'Hai bàn tay nắm chặt lấy nhau kết tình bằng hữu.'],
      ['先', 'TIÊN', 'Trước, Tiên sinh', 6, 'さき', 'セン', 'Người đi bước chân (儿) phía trước mọi người.'],
      ['生', 'SINH', 'Sống, Sinh ra', 5, 'い(きる)、う(まれる)', 'セイ、ショウ', 'Mầm cây non vươn lên đầy sức sống từ mặt đất.'],
      ['学', 'HỌC', 'Học tập', 8, 'まな(ぶ)', 'ガク', 'Đứa trẻ (子) ngồi dưới mái trường học chữ.'],
      ['校', 'HIỆU', 'Trường học', 10, '—', 'コウ', 'Ngôi trường trồng nhiều cây xanh (木) nơi giao lưu (交).'],
      ['本', 'BỔN', 'Sách, Gốc rễ', 5, 'もと', 'ホン', 'Đánh dấu vào phần gốc của cái cây (木).']
    ]
  },
  {
    lesson: 4,
    title: 'Bài 4: Phong cảnh & Phương hướng',
    items: [
      ['山', 'SƠN', 'Ngọn núi', 3, 'やま', 'サン', 'Ba đỉnh núi nhấp nhô cao thấp nối tiếp nhau.'],
      ['川', 'XUYÊN', 'Dòng sông', 3, 'かわ', 'セン', 'Ba dòng nước chảy xuôi hiền hòa.'],
      ['田', 'ĐIỀN', 'Ruộng lúa', 5, 'た', 'デン', 'Cánh đồng lúa chia thành các ô bờ vùng bờ thửa.'],
      ['石', 'THẠCH', 'Hòn đá', 5, 'いし', 'セキ、シャク', 'Tảng đá nằm dưới vách núi dựng đứng.'],
      ['花', 'HOA', 'Bông hoa', 7, 'はな', 'カ', 'Thảo mộc (艹) biến hóa (化) nở thành bông hoa đẹp.'],
      ['竹', 'TRÚC', 'Cây tre, Trúc', 6, 'たけ', 'チク', 'Hai khóm tre lá rủ xuống trong gió.'],
      ['雨', 'VŨ', 'Cơn mưa', 8, 'あめ', 'ウ', 'Những hạt mưa rơi xuống từ đám mây trên bầu trời.'],
      ['空', 'KHÔNG', 'Bầu trời, Trống rỗng', 8, 'そら、あ(く)', 'クウ', 'Khoảng không bao la phía trên hang động.'],
      ['東', 'ĐÔNG', 'Phía Đông', 8, 'ひがし', 'トウ', 'Mặt trời (日) mọc lên sau tán cây (木) ở hướng Đông.'],
      ['西', 'TÂY', 'Phía Tây', 6, 'にし', 'セイ、サイ', 'Chim về tổ khi mặt trời lặn ở hướng Tây.'],
      ['南', 'NAM', 'Phía Nam', 9, 'みなみ', 'ナン', 'Phương Nam ấm áp cây cối sinh sôi.'],
      ['北', 'BẮC', 'Phía Bắc', 5, 'きた', 'ホク', 'Hai người ngồi quay lưng vào nhau vì gió lạnh phương Bắc.']
    ]
  },
  {
    lesson: 5,
    title: 'Bài 5: Cơ thể & Hành động cơ bản',
    items: [
      ['手', 'THỦ', 'Bàn tay', 4, 'て', 'シュ', 'Hình bàn tay xòe các ngón tay.'],
      ['足', 'TÚC', 'Bàn chân, Đầy đủ', 7, 'あし、た(りる)', 'ソク', 'Hình đầu gối và bàn chân đang bước đi.'],
      ['耳', 'NHĨ', 'Cái tai', 6, 'みみ', 'ジ', 'Hình vành tai người nhìn nghiêng.'],
      ['力', 'LỰC', 'Sức mạnh', 2, 'ちから', 'リョク、リキ', 'Cánh tay gồng cơ bắp cuồn cuộn.'],
      ['見', 'KIẾN', 'Nhìn, Xem', 7, 'み(る)', 'ケン', 'Đôi mắt (目) gắn trên đôi chân (儿) đi quan sát.'],
      ['行', 'HÀNH', 'Đi, Thực hiện', 6, 'い(く)、おこな(う)', 'コウ、ギョウ', 'Ngã tư đường phố nơi dòng người qua lại.'],
      ['来', 'LAI', 'Đến, Tới', 7, 'く(る)', 'ライ', 'Bông lúa chín mang mùa màng mới đang tới.'],
      ['帰', 'QUY', 'Trở về nhà', 10, 'かえ(る)', 'キ', 'Cầm chổi quét dọn chờ người thân trở về.'],
      ['食', 'THỰC', 'Ăn, Bữa ăn', 9, 'た(べる)', 'ショク', 'Mọi người quây quần dưới mái nhà thưởng thức món ngon.'],
      ['飲', 'ẨM', 'Uống', 12, 'の(む)', 'イン', 'Há miệng (欠) thưởng thức đồ ăn thức uống (食).']
    ]
  },
  {
    lesson: 6,
    title: 'Bài 6: Kích thước & Tính chất',
    items: [
      ['大', 'ĐẠI', 'To, Lớn', 3, 'おお(きい)', 'ダイ、タイ', 'Người dang rộng cả hai tay hai chân hết cỡ.'],
      ['小', 'TIỂU', 'Nhỏ, Bé', 3, 'ちい(さい)、こ', 'ショウ', 'Chia vật thể thành những mảnh vụn nhỏ bé.'],
      ['高', 'CAO', 'Cao, Đắt', 10, 'たか(い)', 'コウ', 'Tòa tháp cổ nhiều tầng vươn cao vút.'],
      ['安', 'AN', 'Rẻ, An toàn, Yên tâm', 6, 'やす(い)', 'アン', 'Người phụ nữ (女) ở dưới mái nhà (宀) thì bình an.'],
      ['新', 'TÂN', 'Mới', 13, 'あたら(しい)', 'シン', 'Dùng rìu (斤) đốn cây (木) lấy gỗ làm đồ mới.'],
      ['古', 'CỔ', 'Cũ, Cổ xưa', 5, 'ふる(い)', 'コ', 'Câu chuyện truyền qua mười (十) đời miệng (口) kể lại.'],
      ['長', 'TRƯỜNG', 'Dài, Trưởng', 8, 'なが(い)', 'チョウ', 'Người trưởng lão có mái tóc dài bay trong gió.'],
      ['多', 'ĐA', 'Nhiều', 6, 'おお(い)', 'タ', 'Nhiều đêm (夕) nối tiếp nhau tạo thành số nhiều.'],
      ['少', 'THIỂU', 'Ít, Một chút', 4, 'すく(ない)、すこ(し)', 'ショウ', 'Chia nhỏ (小) thêm một nét phẩy nên càng ít đi.'],
      ['白', 'BẠCH', 'Màu trắng', 5, 'しろ(い)', 'ハク、ビャク', 'Tia nắng đầu tiên của mặt trời (日) rực sáng màu trắng.']
    ]
  },
  {
    lesson: 7,
    title: 'Bài 7: Thời gian & Khoảng khắc',
    items: [
      ['今', 'KIM', 'Bây giờ, Hiện tại', 4, 'いま', 'コン、キン', 'Chiếc chuông đồng ngân vang báo hiệu thời khắc hiện tại.'],
      ['前', 'TIỀN', 'Phía trước, Trước đây', 9, 'まえ', 'ゼン', 'Con thuyền tiến về phía trước mặt.'],
      ['後', 'HẬU', 'Phía sau, Sau này', 9, 'あと、うし(ろ)', 'ゴ、コウ', 'Bước chân chậm rãi theo sau.'],
      ['午', 'NGỌ', 'Buổi trưa', 4, '—', 'ゴ', 'Thời điểm mặt trời đứng bóng lúc 12 giờ trưa.'],
      ['時', 'THỜI', 'Giờ, Thời gian', 10, 'とき', 'ジ', 'Theo dõi bóng mặt trời (日) tại ngôi chùa (寺) để tính giờ.'],
      ['間', 'GIAN', 'Khoảng thời gian, Không gian', 12, 'あいだ、ま', 'カン、ケン', 'Ánh mặt trời (日) lọt qua khe cửa (門).'],
      ['分', 'PHÂN', 'Phút, Chia ra, Hiểu', 4, 'わ(かる)、わ(ける)', 'フン、ブン', 'Dùng đao (刀) tách đôi (八) vật thể để phân chia rõ ràng.'],
      ['年', 'NIÊN', 'Năm, Tuổi', 6, 'とし', 'ネン', 'Chu kỳ một mùa lúa chín thu hoạch là một năm.'],
      ['毎', 'MỖI', 'Mỗi (ngày, tuần, tháng)', 6, '—', 'マイ', 'Người mẹ (母) tần tảo chăm lo mỗi ngày.'],
      ['週', 'CHU', 'Tuần lễ', 11, '—', 'シュウ', 'Vòng tuần hoàn 7 ngày lặp lại.']
    ]
  },
  {
    lesson: 8,
    title: 'Bài 8: Giao tiếp & Ngôn ngữ',
    items: [
      ['言', 'NGÔN', 'Nói, Lời nói', 7, 'い(う)、こと', 'ゲン、ゴン', 'Lời nói phát ra từ cái miệng (口) thành từng làn sóng âm.'],
      ['話', 'THOẠI', 'Nói chuyện, Câu chuyện', 13, 'はな(す)、はなし', 'ワ', 'Dùng lời nói (言) và cái lưỡi (舌) để trò chuyện.'],
      ['読', 'ĐỘC', 'Đọc sách', 14, 'よ(む)', 'ドク', 'Nhìn chữ và cất lời (言) đọc to nội dung (売).'],
      ['書', 'THƯ', 'Viết, Sách vở', 10, 'か(く)', 'ショ', 'Tay cầm bút lông viết từng nét chữ lên trang giấy.'],
      ['聞', 'VĂN', 'Nghe, Hỏi', 14, 'き(く)', 'ブン、モン', 'Áp tai (耳) vào khe cửa (門) để lắng nghe.'],
      ['語', 'NGỮ', 'Ngôn ngữ, Tiếng', 14, 'かた(る)', 'ゴ', 'Dùng lời nói (言) của năm (五) miệng (口) tạo thành ngôn ngữ.'],
      ['名', 'DANH', 'Tên gọi, Danh tiếng', 6, 'な', 'メイ、ミョウ', 'Buổi tối (夕) trời tối phải dùng miệng (口) xưng tên.'],
      ['何', 'HÀ', 'Cái gì, Mấy', 7, 'なに、なん', 'カ', 'Người (亻) gánh vật trên vai hỏi đang mang cái gì (可).']
    ]
  },
  {
    lesson: 9,
    title: 'Bài 9: Mua sắm & Đời sống',
    items: [
      ['買', 'MÃI', 'Mua sắm', 12, 'か(う)', 'バイ', 'Dùng lưới (罒) thu gom vỏ sò tiền tệ (貝) để đi mua hàng.'],
      ['売', 'MẠI', 'Bán hàng', 7, 'う(る)', 'バイ', 'Người bán hàng đứng bày sản phẩm ra chợ.'],
      ['店', 'ĐIẾM', 'Cửa hàng, Quán', 8, 'みせ', 'テン', 'Dưới mái hiên (广) chiếm một chỗ (占) mở cửa hàng.'],
      ['車', 'XA', 'Xe hơi, Xe cộ', 7, 'くるま', 'シャ', 'Hình chiếc xe kéo có trục và hai bánh xe nhìn từ trên xuống.'],
      ['駅', 'DỊCH', 'Nhà ga', 14, 'えき', 'エキ', 'Trạm dừng ngựa (馬) xưa nay trở thành nhà ga tàu điện.'],
      ['道', 'ĐẠO', 'Con đường', 12, 'みち', 'ドウ', 'Cái đầu (首) dẫn lối bước chân (辶) đi trên đường.'],
      ['社', 'XÃ', 'Công ty, Đền thần', 7, 'やしろ', 'シャ', 'Nơi thờ thần đất trở thành nơi tụ họp của công ty.'],
      ['国', 'QUỐC', 'Đất nước, Quốc gia', 8, 'くに', 'コク', 'Viên ngọc quý (玉) được bảo vệ trong biên giới bốn phương (囗).']
    ]
  },
  {
    lesson: 10,
    title: 'Bài 10: Vị trí & Hoạt động',
    items: [
      ['外', 'NGOẠI', 'Bên ngoài, Nước ngoài', 5, 'そと、ほか', 'ガイ、ゲ', 'Buổi tối (夕) ra ngoài xem bói (卜).'],
      ['右', 'HỮU', 'Bên phải', 5, 'みぎ', 'ウ、ユウ', 'Tay phải cầm thức ăn đưa vào miệng (口).'],
      ['左', 'TẢ', 'Bên trái', 5, 'ひだり', 'サ', 'Tay trái cầm thước thợ (工) hỗ trợ công việc.'],
      ['休', 'HƯU', 'Nghỉ ngơi', 6, 'やす(む)', 'キュウ', 'Con người (亻) tựa lưng vào gốc cây (木) nghỉ mát.'],
      ['立', 'LẬP', 'Đứng lên', 5, 'た(つ)', 'リツ', 'Người đứng vững vàng hai chân trên mặt đất.'],
      ['出', 'XUẤT', 'Đi ra, Đưa ra', 5, 'で(る)、だ(す)', 'シュツ', 'Mầm cây vươn cao thoát ra khỏi ngọn núi.'],
      ['入', 'NHẬP', 'Đi vào, Cho vào', 2, 'はい(る)、い(れる)', 'ニュウ', 'Dòng nước chảy chụm vào bên trong cửa.'],
      ['会', 'HỘI', 'Gặp gỡ, Cuộc họp', 6, 'あ(う)', 'カイ、エ', 'Mọi người tụ họp đông đủ dưới một mái nhà.']
    ]
  },
  {
    lesson: 11,
    title: 'Bài 11: Thời tiết & Điện năng',
    items: [
      ['天', 'THIÊN', 'Bầu trời', 4, 'あめ、あま', 'テン', 'Khoảng không vĩ đại phía trên đỉnh đầu con người (大).'],
      ['気', 'KHÍ', 'Không khí, Tinh thần', 6, '—', 'キ、ケ', 'Hơi nước bốc lên tạo thành mây và khí quyển.'],
      ['電', 'ĐIỆN', 'Tia chớp, Điện năng', 13, '—', 'デン', 'Tia chớp phóng xuống từ cơn mưa (雨) tạo ra dòng điện.'],
      ['風', 'PHONG', 'Cơn gió, Phong cách', 9, 'かぜ', 'フウ', 'Cánh buồm căng phồng khi cơn gió thổi qua.'],
      ['晴', 'TÌNH', 'Trời nắng quang đãng', 12, 'は(れる)', 'セイ', 'Mặt trời (日) tỏa sáng trên bầu trời xanh (青).'],
      ['雪', 'TUYẾT', 'Tuyết rơi', 11, 'ゆき', 'セツ', 'Mưa (雨) đông cứng lại có thể dùng tay quét (ヨ) được.'],
      ['魚', 'NGƯ', 'Con cá', 11, 'さかな、うお', 'ギョ', 'Hình con cá có đầu, thân vảy và đuôi bơi dưới nước.'],
      ['肉', 'NHỤC', 'Thịt', 6, '—', 'ニク', 'Thớ thịt được thái lát đẹp mắt.']
    ]
  },
  {
    lesson: 12,
    title: 'Bài 12: Trường lớp & Giao thông',
    items: [
      ['室', 'THẤT', 'Căn phòng', 9, 'むろ', 'シツ', 'Đi tới (至) dưới mái nhà (宀) là vào trong phòng.'],
      ['門', 'MÔN', 'Cánh cổng', 8, 'かど', 'モン', 'Hai cánh cổng lớn mở ra hai bên.'],
      ['開', 'KHAI', 'Mở ra', 12, 'あ(く)、ひら(く)', 'カイ', 'Hai tay tháo thanh chắn ngang cánh cổng (門) để mở ra.'],
      ['閉', 'BẾ', 'Đóng lại', 11, 'し(める)、と(じる)', 'ヘイ', 'Dùng thanh gỗ cài chặt cánh cổng (門) đóng kín.'],
      ['走', 'TẨU', 'Chạy', 7, 'はし(る)', 'ソウ', 'Đôi chân vung bước chạy nhanh trên mặt đất (土).'],
      ['歩', 'BỘ', 'Đi bộ', 8, 'ある(く)', 'ホ、ブ', 'Dừng lại (止) một chút (少) rồi bước tiếp từng bước.'],
      ['待', 'ĐÃI', 'Chờ đợi', 9, 'ま(つ)', 'タイ', 'Đứng bên đường (彳) trước cổng chùa (寺) chờ người.'],
      ['止', 'CHỈ', 'Dừng lại', 4, 'と(まる)', 'シ', 'Dấu bàn chân đứng yên tại chỗ.']
    ]
  },
  {
    lesson: 13,
    title: 'Bài 13: Màu sắc & Gia đình mở rộng',
    items: [
      ['赤', 'XÍCH', 'Màu đỏ', 7, 'あか(い)', 'セキ', 'Đất (土) nung trên lửa lớn rực lên màu đỏ.'],
      ['青', 'THANH', 'Màu xanh', 8, 'あお(い)', 'セイ、ショウ', 'Mầm cây non mọc lên bên giếng nước trong xanh.'],
      ['黒', 'HẮC', 'Màu đen', 11, 'くろ(い)', 'コク', 'Khói lửa (灬) bám vào cửa sổ làm đen sẫm lại.'],
      ['色', 'SẮC', 'Màu sắc', 6, 'いろ', 'ショク、シキ', 'Sắc mặt biểu lộ cảm xúc của con người.'],
      ['兄', 'HUYNH', 'Anh trai', 5, 'あに', 'ケイ、キョウ', 'Người anh lớn có cái đầu (口) cao hơn đôi chân (儿) dạy bảo em.'],
      ['弟', 'ĐỆ', 'Em trai', 7, 'おとうと', 'テイ、ダイ', 'Dây quấn quanh thân cung theo thứ tự trước sau.'],
      ['姉', 'TỶ', 'Chị gái', 8, 'あね', 'シ', 'Người phụ nữ (女) đi chợ (市) chăm lo cho các em.'],
      ['妹', 'MUỘI', 'Em gái', 8, 'いもうと', 'マイ', 'Cô gái (女) còn nhỏ chưa (未) trưởng thành hết.']
    ]
  },
  {
    lesson: 14,
    title: 'Bài 14: Nhà cửa & Cuộc sống',
    items: [
      ['家', 'GIA', 'Ngôi nhà, Gia đình', 10, 'いえ、うち', 'カ、ケ', 'Dưới mái nhà (宀) có nuôi gia súc (豕) sung túc.'],
      ['族', 'TỘC', 'Gia tộc, Dòng họ', 11, '—', 'ゾク', 'Những người cùng tụ tập dưới ngọn cờ của dòng tộc.'],
      ['住', 'TRÚ', 'Sinh sống, Cư trú', 7, 'す(む)', 'ジュウ', 'Con người (亻) làm chủ (主) ngôi nhà nơi mình ở.'],
      ['所', 'SỞ', 'Nơi chốn, Địa điểm', 8, 'ところ', 'ショ', 'Tiếng rìu (斤) đốn gỗ bên cánh cửa (戸) đánh dấu nơi ở.'],
      ['京', 'KINH', 'Kinh đô, Thủ đô', 8, '—', 'キョウ、ケイ', 'Cổng thành cao lớn nằm giữa kinh đô sầm uất.'],
      ['都', 'ĐÔ', 'Đô thị, Thủ đô', 11, 'みやこ', 'ト、ツ', 'Nơi nhiều người (者) tụ hội thành đô thị lớn.'],
      ['町', 'ĐINH', 'Khu phố, Thị trấn', 7, 'まち', 'チョウ', 'Con đường hình chữ Đinh (丁) chạy bên cánh đồng (田).'],
      ['村', 'THÔN', 'Ngôi làng, Nông thôn', 7, 'むら', 'ソン', 'Ngôi làng yên bình rợp bóng cây xanh (木).']
    ]
  },
  {
    lesson: 15,
    title: 'Bài 15: Tư duy & Học thuật',
    items: [
      ['思', 'TƯ', 'Suy nghĩ, Nhớ', 9, 'おも(う)', 'シ', 'Trái tim (心) và khối óc (田) cùng suy ngẫm.'],
      ['知', 'TRI', 'Biết, Trí tuệ', 8, 'し(る)', 'チ', 'Lời nói (口) nhanh nhạy chuẩn xác như tên bắn (矢).'],
      ['考', 'KHẢO', 'Suy xét, Nghĩ ngợi', 6, 'かんが(える)', 'コウ', 'Người già dày dặn kinh nghiệm trầm ngâm suy tính.'],
      ['教', 'GIÁO', 'Dạy học, Chỉ bảo', 11, 'おし(える)', 'キョウ', 'Thầy cầm thước (攵) tận tình dạy con trẻ hiếu thảo (孝).'],
      ['習', 'TẬP', 'Học tập, Luyện tập', 11, 'なら(う)', 'シュウ', 'Chim non vỗ cánh (羽) dưới ánh nắng trắng (白) tập bay.'],
      ['問', 'VẤN', 'Hỏi, Câu hỏi', 11, 'と(う)', 'モン', 'Đứng trước cổng (門) mở miệng (口) hỏi thăm.'],
      ['答', 'ĐÁP', 'Trả lời, Đáp án', 12, 'こた(える)', 'トウ', 'Ghi câu trả lời hợp lý (合) lên thẻ tre (竹).'],
      ['紙', 'CHỈ', 'Tờ giấy', 10, 'かみ', 'シ', 'Sợi tơ (糸) mịn màng của dòng họ (氏) chế tạo ra giấy.']
    ]
  },
  {
    lesson: 16,
    title: 'Bài 16: Văn hóa, Âm nhạc & Du lịch',
    items: [
      ['音', 'ÂM', 'Âm thanh', 9, 'おと、ね', 'オン、イン', 'Lời nói ngân vang tạo thành âm thanh giai điệu.'],
      ['楽', 'NHẠC / LẠC', 'Âm nhạc, Vui vẻ', 13, 'たの(しい)', 'ガク、ラク', 'Tiếng trống chuông treo trên giá gỗ (木) mang lại niềm vui.'],
      ['歌', 'CA', 'Bài hát, Ca hát', 14, 'うた、うた(う)', 'カ', 'Mở miệng (欠) ngân nga giai điệu du dương.'],
      ['絵', 'HỘI', 'Bức tranh', 12, 'え', 'カイ、エ', 'Kết hợp (会) các sợi chỉ màu (糸) thêu thành bức tranh.'],
      ['写', 'TẢ', 'Chụp ảnh, Sao chép', 5, 'うつ(す)', 'シャ', 'Mô phỏng lại nguyên vẹn hình ảnh sự vật.'],
      ['真', 'CHÂN', 'Chân thật, Chính giữa', 10, 'ま', 'シン', 'Đôi mắt (目) nhìn thẳng nhận diện sự thật.'],
      ['旅', 'LỮ', 'Chuyến du lịch', 10, 'たび', 'リョ', 'Đoàn người đi dưới ngọn cờ dẫn đường đi du lịch.'],
      ['海', 'HẢI', 'Biển cả', 9, 'うみ', 'カイ', 'Biển nước (氵) bao la nuôi sống muôn loài như người mẹ (毎).']
    ]
  }
];

function buildCurriculumSummaryFromLessons(
  curriculum: string,
  level: string,
  rawLessons: Array<{ lesson: number; title: string; items: CompactKanjiTuple[] }>
) {
  const baseLessons = rawLessons.map((l) => {
    const kanjis: FallbackKanjiItem[] = l.items.map(([character, hanViet, meaningVi, strokeCount, kunyomi, onyomi, tip]) => ({
      character,
      hanViet,
      meaningVi,
      jlptLevel: level,
      curriculum,
      lesson: l.lesson,
      lessonTitle: l.title,
      strokeCount,
      kunyomi,
      onyomi,
      lookAndLearnTip: tip,
      mnemonic: tip,
      radicals: [{ symbol: character, name: `Bộ ${hanViet}` }],
      exampleWords: [
        {
          word: character,
          reading: kunyomi !== '—' ? kunyomi.split('、')[0].replace(/\(.*?\)/g, '') : onyomi.split('、')[0],
          hanViet,
          meaningVi
        }
      ]
    }));

    return {
      lesson: l.lesson,
      title: l.title,
      wordCount: kanjis.length,
      kanjis
    };
  });

  const lessons: any[] = [];
  const chunks: typeof baseLessons[] = [];
  let currentChunk: typeof baseLessons = [];

  for (let i = 0; i < baseLessons.length; i++) {
    currentChunk.push(baseLessons[i]);
    if (currentChunk.length === 3) {
      chunks.push(currentChunk);
      currentChunk = [];
    }
  }
  if (currentChunk.length > 0) {
    if (chunks.length > 0 && currentChunk.length < 3) {
      chunks[chunks.length - 1].push(...currentChunk);
    } else {
      chunks.push(currentChunk);
    }
  }

  let reviewBatch = 1;
  for (const chunk of chunks) {
    let totalCount = 0;
    for (const l of chunk) {
      lessons.push(l);
      totalCount += l.wordCount;
    }
    const startL = chunk[0].lesson;
    const endL = chunk[chunk.length - 1].lesson;
    const titleLabel = startL === endL ? `Bài ${startL}` : `Bài ${startL} - ${endL}`;
    lessons.push({
      lesson: 9000 + reviewBatch,
      isReview: true,
      title: `🌟 ÔN TẬP TỔNG HỢP (${titleLabel})`,
      topic: 'Kiểm tra tổng hợp kiến thức định kỳ',
      wordCount: totalCount,
      reviewMin: startL,
      reviewMax: endL,
      kanjis: chunk.flatMap((c) => c.kanjis)
    });
    reviewBatch++;
  }

  const allKanjis = baseLessons.flatMap((l) => l.kanjis);
  lessons.push({
    lesson: 9999,
    isReview: true,
    isFinal: true,
    title: `🎓 KIỂM TRA CUỐI KHÓA (${level})`,
    kanjis: allKanjis,
    wordCount: allKanjis.length
  });

  return {
    curriculum,
    level,
    totalKanji: allKanjis.length,
    totalLessons: lessons.length,
    lessons
  };
}

export const INITIAL_LOOK_AND_LEARN_N5_SUMMARY = buildCurriculumSummaryFromLessons(
  'LOOK_AND_LEARN',
  'N5',
  N5_LOOK_AND_LEARN_LESSONS
);

export const INITIAL_ALL_FALLBACK_KANJIS: FallbackKanjiItem[] = N5_LOOK_AND_LEARN_LESSONS.flatMap((l) =>
  l.items.map(([character, hanViet, meaningVi, strokeCount, kunyomi, onyomi, tip]) => ({
    character,
    hanViet,
    meaningVi,
    jlptLevel: 'N5',
    curriculum: 'LOOK_AND_LEARN',
    lesson: l.lesson,
    lessonTitle: l.title,
    strokeCount,
    kunyomi,
    onyomi,
    lookAndLearnTip: tip,
    mnemonic: tip,
    radicals: [{ symbol: character, name: `Bộ ${hanViet}` }],
    exampleWords: [
      {
        word: character,
        reading: kunyomi !== '—' ? kunyomi.split('、')[0].replace(/\(.*?\)/g, '') : onyomi.split('、')[0],
        hanViet,
        meaningVi
      }
    ]
  }))
);

export function getFallbackKanjiCurriculumSummary(curriculum: string, level: string) {
  const cur = (curriculum || 'LOOK_AND_LEARN').toUpperCase();
  const lvl = (level || 'N5').toUpperCase();
  if (cur === 'LOOK_AND_LEARN' && lvl === 'N5') {
    return INITIAL_LOOK_AND_LEARN_N5_SUMMARY;
  }
  return buildCurriculumSummaryFromLessons(
    cur,
    lvl,
    N5_LOOK_AND_LEARN_LESSONS.map((l) => ({
      ...l,
      title: l.title.replace(/^Bài \d+/, `Bài ${l.lesson}`)
    }))
  );
}
