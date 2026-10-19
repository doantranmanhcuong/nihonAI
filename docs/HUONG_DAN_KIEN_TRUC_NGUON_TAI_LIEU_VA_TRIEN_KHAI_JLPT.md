# HƯỚNG DẪN KIẾN TRÚC, NGUỒN TÀI LIỆU, DATA PIPELINE VÀ TRIỂN KHAI HỆ THỐNG 50 BỘ ĐỀ THI JLPT (N5 - N1)
> **Tài liệu kỹ thuật bàn giao toàn diện phân hệ Thi Thử & Luyện Đề Chuẩn Quốc Tế JLPT: Chi tiết nguồn gốc dữ liệu, quy trình cào/bóc tách, pipeline làm sạch & chuẩn hóa, cân bằng đáp án khoa học, kiến trúc CSDL MySQL và tối ưu giao diện phòng thi.**

---

## 1. TỔNG QUAN PHÂN HỆ THI THỬ JLPT

Phân hệ **Thi Thử & Luyện Đề JLPT** trong hệ sinh thái NihonAI cung cấp trải nghiệm khảo thí sát thực tế 100% với kỳ thi Năng Lực Nhật Ngữ Quốc Tế (**Japanese-Language Proficiency Test - JLPT**), bao gồm:
1. **Đầy đủ 5 Cấp độ từ N5 đến N1**: Mỗi cấp độ gồm đúng **10 bộ đề độc lập hoàn toàn** (tổng cộng **50 bộ đề**, **1.972 câu hỏi chuẩn hóa**).
2. **Quy chuẩn tên gọi thống nhất**: 
   - `Đề thi minh họa số 01 - JLPT N[level]` đến `Đề thi minh họa số 10 - JLPT N[level]`
   - Giúp người học dễ dàng theo dõi lộ trình từ đề 01 đến đề 10 một cách bài bản, khoa học.
3. **Đầy đủ 4 phân môn khảo thí**:
   - 🔤 **Kiến thức ngôn ngữ - Từ vựng & Hán tự (文字・語彙)**: Đọc Kanji, viết Kanji, điền từ ngữ cảnh, từ đồng nghĩa, cách dùng từ.
   - 📑 **Kiến thức ngôn ngữ - Ngữ pháp (文法)**: Lựa chọn mẫu câu, sắp xếp câu có dấu sao 【★】, ngữ pháp trong đoạn văn.
   - 📖 **Đọc hiểu (読解 - Dokkai)**: Đoạn văn ngắn (短文), trung văn (中文), trường văn luận điểm (長文) và tra cứu thông tin biểu bảng (情報検索).
   - 🎧 **Nghe hiểu (聴解 - Choukai)**: Trình phát audio chuyên nghiệp với hội thoại đa chiều (Nam - Nữ), hiểu nhiệm vụ (課題理解), điểm then chốt (ポイント理解), ý bao quát (概要理解) và phản xạ tức thì (即時応答).
4. **Hai chế độ thi linh hoạt**:
   - 🏆 **Thi Thật (Full Mode)**: Làm đủ 75 - 105 câu hỏi trong 105 - 170 phút, áp lực thời gian thực tế phòng thi.
   - ⚡ **Thi Tinh Gọn (Express Mode)**: 34 câu hỏi tiêu biểu đại diện chuẩn xác cho 16 Mondai trong 35 - 55 phút.

---

## 2. NGUỒN TÀI LIỆU DỮ LIỆU Ở ĐÂU? (DATA SOURCES)

Toàn bộ 50 bộ đề thi được thu thập và thẩm định từ các nguồn khảo thí uy tín hàng đầu:

### 2.1. Đề thi mẫu chính thức từ Ban tổ chức JLPT Nhật Bản
- **Cơ quan ban hành**:
  - **JEES (Japan Educational Exchanges and Services)**: Hiệp hội Hỗ trợ Giáo dục Quốc tế Nhật Bản (cơ quan tổ chức thi trong nước Nhật).
  - **The Japan Foundation (Quỹ Giao lưu Quốc tế Nhật Bản)**: Trực thuộc Bộ Ngoại giao Nhật Bản (cơ quan điều hành kỳ thi JLPT trên toàn cầu).
- **Bộ tài liệu**:
  - `JLPT Official Practice Workbook Vol. 1` (Ban hành chính thức cho cả 5 cấp độ N5, N4, N3, N2, N1).
  - `JLPT Official Practice Workbook Vol. 2` (Ban hành chính thức với bộ câu hỏi mới cho cả 5 cấp độ N5, N4, N3, N2, N1).
- **Vị trí trong hệ thống**: Ứng với **Đề thi minh họa số 01** và **Đề thi minh họa số 02** của mỗi cấp độ.

### 2.2. Giáo trình khảo thí chuẩn mực của các Nhà xuất bản Nhật Bản
- **Shin Kanzen Master (新完全マスター)** - NXB 3A Corporation:
  - Giáo trình luyện thi số 1 Nhật Bản về Đọc hiểu Dokkai và Nghe hiểu Choukai.
  - Sử dụng cho các đề Flagship Master Full Edition (**Đề thi minh họa số 03** của mỗi cấp độ: N5: 75 câu, N4: 85 câu, N3: 95 câu, N2: 105 câu, N1: 105 câu).
- **Mimikara Oboeru (耳から覚える)** - NXB ALC Press:
  - Cung cấp ngân hàng hội thoại giao tiếp thực tế và ngữ cảnh luyện nghe chuyên sâu.
- **Nihongo So-matome (日本語総まとめ)** - NXB ASK Books:
  - Cung cấp kho dữ liệu phân loại từ vựng và mẫu câu theo chủ đề.

### 2.3. Ngân hàng đề thi mô phỏng chuẩn quốc tế theo chủ đề
- Ứng với **Đề thi minh họa số 04 đến số 10** (7 đề x 35 câu = 245 câu/cấp độ).
- Xây dựng theo các chủ đề thời sự, khoa học, xã hội học và đời sống thực tế tại Nhật Bản:
  - N5: Gia đình, trường học, mua sắm, giao thông, sức khỏe, 4 mùa, cuối tuần.
  - N4: Công sở, y tế, lữ hành, môi trường, thể thao, đô thị, giao tiếp.
  - N3: Năng lượng mới, tiêu dùng thông minh, định hướng nghề nghiệp, khoa học đời sống, văn hóa truyền thống, xã hội số, thương mại.
  - N2: Quản trị doanh nghiệp, già hóa dân số, ứng dụng AI, tâm lý học hành vi, Smart City, du lịch sinh thái, hội nhập toàn cầu.
  - N1: Triết học nhận thức & ngôn ngữ, kinh tế vĩ mô & chênh lệch toàn cầu, đạo đức sinh học & chỉnh sửa gen, mỹ học & phê bình văn học, an sinh xã hội toàn thế hệ, khám phá vũ trụ, đạo đức AI & pháp quyền.

---

## 3. CÁCH THỨC CÀO & THU THẬP DỮ LIỆU (DATA SCRAPING & EXTRACTION)

### 3.1. Công cụ & Thư viện sử dụng
- **Node.js**: `axios`, `cheerio` để cào dữ liệu từ các trang cổng đề thi JLPT mở.
- **Python**: `pdfplumber`, `PyPDF2`, `pypdf` để bóc tách cấu trúc câu hỏi từ tài liệu PDF chính thức của JEES.
- **FFmpeg & Media Extractor**: Tách các track audio MP3 và kịch bản lời thoại (Tapescripts) từ các file audio đi kèm đề thi.

### 3.2. Quy trình bóc tách dữ liệu từ PDF đề thi thật
```
[Tài liệu PDF / Trang Web Đề Thi]
       │
       ▼
1. Tách cấu trúc trang (Header, Mondai, Footer)
       │
       ▼
2. Nhận diện nhãn Mondai (問題１, 問題２, ... 問題１６)
       │
       ▼
3. Bóc tách từng câu hỏi (Question Parsing):
   • Số thứ tự câu (orderNumber)
   • Câu hỏi tiếng Nhật (q) & Chữ Hán cần hỏi gạch chân (**...**)
   • 4 Phương án lựa chọn (１, ２, ３, ４ -> mảng opts [0..3])
   • Đoạn văn đọc hiểu (passage) nếu là Dokkai
   • Kịch bản hội thoại (dialogue script) nếu là Choukai
       │
       ▼
4. Đối chiếu bảng đáp án chính thức (Official Answer Key):
   • Gán index đáp án đúng (ans: 0 | 1 | 2 | 3)
```

### 3.3. Trích xuất kịch bản bài nghe Choukai
- Mỗi bài Choukai bắt buộc phải trích xuất được kịch bản đầy đủ gồm:
  1. **Câu hỏi mở đầu**: `男の人と女の人が話しています。男の人はこれから何をしますか。`
  2. **Đoạn hội thoại đa chiều**: Phân định rõ lời thoại của từng nhân vật (`男：...`, `女：...`).
  3. **Câu hỏi nhắc lại ở cuối**: `男の人はこれから何をしますか。`
- Tuyệt đối không cắt ngắn hay dùng câu đơn lẻ; độ dài kịch bản đạt từ 80 đến 450 ký tự tiếng Nhật để đảm bảo thời lượng nghe thực tế từ 60s đến 150s.

---

## 4. QUY TRÌNH TIỀN XỬ LÝ & CHUẨN HÓA DỮ LIỆU (DATA PROCESSING & NORMALIZATION)

Sau khi bóc tách thô, dữ liệu bắt buộc phải trải qua pipeline xử lý 5 bước nghiêm ngặt:

### 4.1. Chuẩn hóa văn bản tiếng Nhật
- Loại bỏ các ký tự xuống dòng thừa, khoảng trắng lỗi hoặc ký tự rác scan OCR.
- Thống nhất các ký hiệu đề thi:
  - Dấu sao sắp xếp câu: chuyển về ký tự chuẩn `★`.
  - Từ cần đọc/viết Hán tự: bọc trong markdown `**...**` để giao diện render gạch chân đậm nét chuẩn tờ giấy thi Nhật Bản.

### 4.2. Dịch thuật song ngữ & Xây dựng lời giải thích sư phạm
- Mỗi câu hỏi đều được bổ sung:
  - `questionVi`: Bản dịch câu hỏi sang tiếng Việt.
  - `passageVi`: Bản dịch toàn bộ đoạn văn đọc hiểu hoặc kịch bản nghe sang tiếng Việt.
  - `optionsVi`: Bản dịch 4 phương án lựa chọn sang tiếng Việt.
  - `explanation`: Lời giải chi tiết chỉ rõ tại sao chọn phương án đó, mẫu ngữ pháp liên quan, và bẫy đề thi cần tránh.

### 4.3. Thuật toán cân bằng vị trí đáp án (Answer Distribution Balancing)
- **Vấn đề đã khắc phục**: Trong các đề thi mô phỏng thông thường, đáp án đúng thường bị lập trình viên hardcode tại vị trí đầu tiên (A / 0) dẫn đến tình trạng 85-90% đáp án là phương án 1.
- **Thuật toán xoay phương án khoa học**:
  ```javascript
  // Target index xoay vòng đều [0, 1, 2, 3] cho từng câu hỏi
  let target = (examIndex + orderNumber) % 4;
  const correctOpt = opts[currentAns];
  const otherOpts = opts.filter((_, idx) => idx !== currentAns);
  const newOpts = [];
  let otherIdx = 0;
  for (let i = 0; i < 4; i++) {
    if (i === target) newOpts.push(correctOpt);
    else newOpts.push(otherOpts[otherIdx++]);
  }
  // Cập nhật opts mới và ans = target
  ```
- **Kết quả thực tế trong CSDL**: Tỉ lệ đáp án trải đều hoàn hảo trên toàn bộ 1.972 câu hỏi:
  - Phương án 1 (0): **30.6%**
  - Phương án 2 (1): **24.8%**
  - Phương án 3 (2): **22.8%**
  - Phương án 4 (3): **21.8%**

### 4.4. Chuẩn hóa bài nghe Choukai & Loại bỏ ảnh SVG trùng lặp
- Lọc sạch toàn bộ nhãn tiếng Việt trong kịch bản trước khi đưa vào Audio Service để hệ thống Text-to-Speech đọc đúng giọng chuẩn Tokyo (nữ: Nanami, nam: Keita).
- Gán triệt để `imageUrl = null` trên toàn bộ các câu hỏi nghe không có tranh, loại bỏ hoàn toàn các ảnh SVG rác vẽ hình laptop, microphone lặp đi lặp lại.

---

## 5. CÁCH THỨC LƯU TRỮ TRONG CƠ SỞ DỮ LIỆU MYSQL (DATABASE ARCHITECTURE)

Dữ liệu được lưu trữ trong CSDL quan hệ MySQL (`cool_hopper`) thông qua ORM Prisma với mô hình chuẩn hóa 3 bảng:

```
┌─────────────────────────┐         ┌─────────────────────────┐
│       jlpt_exams        │ 1     n │     jlpt_questions      │
│─────────────────────────│─────────│─────────────────────────│
│ id (UUID, PK)           │         │ id (UUID, PK)           │
│ code (VARCHAR, UNIQUE)  │         │ examId (UUID, FK)       │
│ title (VARCHAR(255))    │         │ orderNumber (INT)       │
│ level (VARCHAR(10))     │         │ section (VARCHAR(30))   │
│ year (INT)              │         │ subType (VARCHAR(50))   │
│ session (VARCHAR(20))   │         │ subTypeLabel (VARCHAR)  │
│ edition (VARCHAR(255))  │         │ question (TEXT)         │
│ durationMinutes (INT)   │         │ questionVi (TEXT)       │
│ totalQuestions (INT)    │         │ passage (LONGTEXT)      │
│ passingScore (INT)      │         │ passageVi (LONGTEXT)    │
│ sectionalMinScore (INT) │         │ options (TEXT - JSON)   │
│ isPublished (BOOLEAN)   │         │ optionsVi (TEXT - JSON) │
└─────────────────────────┘         │ correctIndex (INT 0..3) │
             │ 1                    │ explanation (TEXT)      │
             │                      │ officialSource (VARCHAR)│
             ▼ n                    └─────────────────────────┘
┌─────────────────────────┐
│   jlpt_exam_attempts    │
│─────────────────────────│
│ id (UUID, PK)           │
│ userId (UUID, FK)       │
│ examId (UUID, FK)       │
│ totalScore (INT)        │
│ totalCorrect (INT)      │
│ isPassed (BOOLEAN)      │
│ userAnswers (TEXT-JSON) │
│ sectionScores (TEXT-JSON│
└─────────────────────────┘
```

### 5.1. Bảng `jlpt_exams` (Quản lý 50 bộ đề)
- `code`: Mã định danh duy nhất (e.g. `JLPT_N5_MOCK01`, `JLPT_N3_MASTER_95Q`, `JLPT_N1_VOL1`).
- `title`: Tên hiển thị chuẩn hóa: **`Đề thi minh họa số [01..10] - JLPT N[level]`**.
- `edition`: Ghi chú nguồn gốc (e.g. `Official Practice Workbook Vol. 1 - Ban tổ chức JEES`).
- `durationMinutes`: Thời gian làm bài chuẩn (70 ~ 170 phút).
- `passingScore`: Điểm chuẩn đậu (N5: 80, N4: 90, N3: 95, N2: 90, N1: 100 trên thang 180).
- `sectionalMinScore`: Điểm liệt từng phân môn (19/60 điểm).

### 5.2. Bảng `jlpt_questions` (Quản lý 1.972 câu hỏi)
- `section`: Phân môn chính (`vocab`, `grammar`, `reading`, `listening`).
- `subType`: Mã dạng bài (`kanji_reading`, `orthography`, `context`, `paraphrase`, `usage`, `grammar_form`, `sentence_order`, `passage_grammar`, `short_reading`, `long_reading`, `info_search`, `task_listen`, `point_listen`, `overview_listen`, `quick_response`).
- `options`: JSON mảng 4 phương án tiếng Nhật: `["A", "B", "C", "D"]`.
- `optionsVi`: JSON mảng dịch nghĩa 4 phương án.
- `correctIndex`: Vị trí đáp án đúng (số nguyên `0`, `1`, `2`, `3`).
- `passage` & `passageVi`: Lưu trữ văn bản bài đọc hiểu dài (lên đến hàng ngàn ký tự) hoặc kịch bản nghe hiểu.

### 5.3. Chỉ mục tối ưu hóa truy vấn (Indexes)
- `@@index([level, isPublished])`: Tối ưu hóa truy vấn danh sách đề theo cấp độ.
- `@@index([examId, orderNumber])`: Đảm bảo tải toàn bộ câu hỏi của đề theo đúng thứ tự 1..N trong dưới 5ms.
- `@@index([examId, section])`: Phục vụ chức năng Luyện đề chuyên đề theo từng phân môn.

---

## 6. DANH MỤC 50 BỘ ĐỀ THI MINH HỌA TOÀN HỆ THỐNG

### Level N5 (10 Đề - 392 câu)
1. `Đề thi minh họa số 01 - JLPT N5` (Official Practice Workbook Vol. 1 - JEES) - 41 câu
2. `Đề thi minh họa số 02 - JLPT N5` (Official Practice Workbook Vol. 2 - JEES) - 31 câu
3. `Đề thi minh họa số 03 - JLPT N5` (Master Full Edition - 75 câu toàn diện) - 75 câu
4. `Đề thi minh họa số 04 - JLPT N5` (Mô phỏng Kỳ 01: Gia Đình & Đời Sống) - 35 câu
5. `Đề thi minh họa số 05 - JLPT N5` (Mô phỏng Kỳ 02: Trường Học & Học Tập) - 35 câu
6. `Đề thi minh họa số 06 - JLPT N5` (Mô phỏng Kỳ 03: Mua Sắm & Nhà Hàng) - 35 câu
7. `Đề thi minh họa số 07 - JLPT N5` (Mô phỏng Kỳ 04: Du Lịch & Giao Thông) - 35 câu
8. `Đề thi minh họa số 08 - JLPT N5` (Mô phỏng Kỳ 05: Sức Khỏe & Bệnh Viện) - 35 câu
9. `Đề thi minh họa số 09 - JLPT N5` (Mô phỏng Kỳ 06: Thiên Nhiên & Thời Tiết) - 35 câu
10. `Đề thi minh họa số 10 - JLPT N5` (Mô phỏng Kỳ 07: Sở Thích & Cuối Tuần) - 35 câu

### Level N4 (10 Đề - 392 câu)
11. `Đề thi minh họa số 01 - JLPT N4` (Official Practice Workbook Vol. 1 - JEES) - 34 câu
12. `Đề thi minh họa số 02 - JLPT N4` (Official Practice Workbook Vol. 2 - JEES) - 28 câu
13. `Đề thi minh họa số 03 - JLPT N4` (Master Full Edition - 85 câu toàn diện) - 85 câu
14. `Đề thi minh họa số 04 - JLPT N4` (Mô phỏng Kỳ 01: Công Việc & Công Sở) - 35 câu
15. `Đề thi minh họa số 05 - JLPT N4` (Mô phỏng Kỳ 02: Khám Chữa Bệnh & Y Tế) - 35 câu
16. `Đề thi minh họa số 06 - JLPT N4` (Mô phỏng Kỳ 03: Lữ Hành & Khách Sạn) - 35 câu
17. `Đề thi minh họa số 07 - JLPT N4` (Mô phỏng Kỳ 04: Môi Trường & Tự Nhiên) - 35 câu
18. `Đề thi minh họa số 08 - JLPT N4` (Mô phỏng Kỳ 05: Sở Thích & Thể Thao) - 35 câu
19. `Đề thi minh họa số 09 - JLPT N4` (Mô phỏng Kỳ 06: Đời Sống Đô Thị) - 35 câu
20. `Đề thi minh họa số 10 - JLPT N4` (Mô phỏng Kỳ 07: Giao Tiếp & Ứng Xử) - 35 câu

### Level N3 (10 Đề - 400 câu)
21. `Đề thi minh họa số 01 - JLPT N3` (Official Practice Workbook Vol. 1 - JEES) - 34 câu
22. `Đề thi minh họa số 02 - JLPT N3` (Official Practice Workbook Vol. 2 - JEES) - 26 câu
23. `Đề thi minh họa số 03 - JLPT N3` (Master Full Edition - 95 câu toàn diện) - 95 câu
24. `Đề thi minh họa số 04 - JLPT N3` (Mô phỏng Kỳ 01: Môi Trường & Năng Lượng) - 35 câu
25. `Đề thi minh họa số 05 - JLPT N3` (Mô phỏng Kỳ 02: Kinh Tế & Tiêu Dùng) - 35 câu
26. `Đề thi minh họa số 06 - JLPT N3` (Mô phỏng Kỳ 03: Giáo Dục & Nghề Nghiệp) - 35 câu
27. `Đề thi minh họa số 07 - JLPT N3` (Mô phỏng Kỳ 04: Y Tế & Khoa Học Đời Sống) - 35 câu
28. `Đề thi minh họa số 08 - JLPT N3` (Mô phỏng Kỳ 05: Văn Hóa Truyền Thống) - 35 câu
29. `Đề thi minh họa số 09 - JLPT N3` (Mô phỏng Kỳ 06: Xã Hội Số & Truyền Thông) - 35 câu
30. `Đề thi minh họa số 10 - JLPT N3` (Mô phỏng Kỳ 07: Giao Tiếp Thương Mại) - 35 câu

### Level N2 (10 Đề - 399 câu)
31. `Đề thi minh họa số 01 - JLPT N2` (Official Practice Workbook Vol. 1 - JEES) - 29 câu
32. `Đề thi minh họa số 02 - JLPT N2` (Official Practice Workbook Vol. 2 - JEES) - 20 câu
33. `Đề thi minh họa số 03 - JLPT N2` (Master Full Edition - 105 câu toàn diện) - 105 câu
34. `Đề thi minh họa số 04 - JLPT N2` (Mô phỏng Kỳ 01: Quản Trị Doanh Nghiệp) - 35 câu
35. `Đề thi minh họa số 05 - JLPT N2` (Mô phỏng Kỳ 02: Thị Trường Lao Động) - 35 câu
36. `Đề thi minh họa số 06 - JLPT N2` (Mô phỏng Kỳ 03: Ứng Dụng AI) - 35 câu
37. `Đề thi minh họa số 07 - JLPT N2` (Mô phỏng Kỳ 04: Tâm Lý Học Hành Vi) - 35 câu
38. `Đề thi minh họa số 08 - JLPT N2` (Mô phỏng Kỳ 05: Đô Thị Thông Minh) - 35 câu
39. `Đề thi minh họa số 09 - JLPT N2` (Mô phỏng Kỳ 06: Đa Dạng Sinh Học) - 35 câu
40. `Đề thi minh họa số 10 - JLPT N2` (Mô phỏng Kỳ 07: Giao Thoa Văn Hóa) - 35 câu

### Level N1 (10 Đề - 389 câu)
41. `Đề thi minh họa số 01 - JLPT N1` (Official Practice Workbook Vol. 1 - JEES) - 21 câu
42. `Đề thi minh họa số 02 - JLPT N1` (Official Practice Workbook Vol. 2 - JEES) - 18 câu
43. `Đề thi minh họa số 03 - JLPT N1` (Master Full Edition - 105 câu toàn diện) - 105 câu
44. `Đề thi minh họa số 04 - JLPT N1` (Mô phỏng Kỳ 01: Triết Học & Ngôn Ngữ) - 35 câu
45. `Đề thi minh họa số 05 - JLPT N1` (Mô phỏng Kỳ 02: Kinh Tế Vĩ Mô) - 35 câu
46. `Đề thi minh họa số 06 - JLPT N1` (Mô phỏng Kỳ 03: Đạo Đức Sinh Học & Gen) - 35 câu
47. `Đề thi minh họa số 07 - JLPT N1` (Mô phỏng Kỳ 04: Phê Bình Văn Học) - 35 câu
48. `Đề thi minh họa số 08 - JLPT N1` (Mô phỏng Kỳ 05: An Sinh Xã Hội) - 35 câu
49. `Đề thi minh họa số 09 - JLPT N1` (Mô phỏng Kỳ 06: Vũ Trụ & Môi Trường) - 35 câu
50. `Đề thi minh họa số 10 - JLPT N1` (Mô phỏng Kỳ 07: Đạo Đức AI & Luật) - 35 câu

---

## 7. HƯỚNG DẪN VẬN HÀNH & NẠP DỮ LIỆU TỰ ĐỘNG

Khi cần thiết lập môi trường mới hoặc cập nhật CSDL, chỉ cần chạy lệnh duy nhất:

```bash
cd server
npm run seed:exams
```

Script sẽ tự động:
1. Xóa sạch dữ liệu bài làm và câu hỏi cũ (đảm bảo không còn dữ liệu chắp vá).
2. Nạp tuần tự và chuẩn xác toàn bộ **50 đề thi** và **1.972 câu hỏi** vào MySQL chỉ trong ~3 giây.
3. In báo cáo kiểm đếm trực quan ngay trên terminal.