> 🚀 **[CẬP NHẬT GIAI ĐOẠN 4 - BẢO VỆ API & REDIS CACHING]**
> - **Bảo vệ Endpoints (Middleware):** Các API nộp bài, gọi AI giải thích đã bị khóa chặt bởi authenticateToken.
> - **Redis Cache Layer:** API lấy danh sách đề thi được bọc bởi Redis Cache với vòng đời (TTL) 12 tiếng. Giảm tải đọc 99% cho CSDL MySQL.
> - **Lịch sử thi siêu tốc:** Bổ sung Composite Index @@index([userId, createdAt(sort: Desc)]) cho bảng Lịch sử.

# KIẾN TRÚC VÀ QUY TRÌNH XÂY DỰNG BỘ ĐỀ THI JLPT MÔ PHỎNG CHUẨN (N5 - N1)
> **Tài liệu Kỹ thuật & Sư phạm Hệ thống Luyện thi JLPT Thông minh**  
> *Phiên bản:* 2.0 (Chuẩn hóa Học thuật & Trải nghiệm Người dùng)  
> *Định vị:* Hệ thống Đề thi Mô phỏng Chuẩn cấu trúc JEES & Giáo trình Uy tín (*Shin Kanzen Master, Nihongo Sou Matome, Try!*)

---

## 1. TỔNG QUAN & ĐỊNH VỊ CHIẾN LƯỢC

### 1.1. Minh bạch hóa Định danh Đề thi (Transparency Strategy)
Để đảm bảo tính trung thực, chuẩn mực học thuật và bảo vệ uy tín của hệ thống:
* **Thay đổi định danh toàn diện:** Hệ thống loại bỏ hoàn toàn các tiêu đề gây hiểu lầm là đề thi leak/scan thật (như *"Đề thi Thật JLPT N3 - Kỳ Tháng 7/2025"*).
* **Quy chuẩn tên gọi mới:** Toàn bộ 60 đề thi trong CSDL (MySQL) đã được cập nhật sang định danh:
  $$\text{Đề thi Mô phỏng Chuẩn JLPT [Level] - Kỳ [Tháng]/[Năm] (Cấu trúc JEES \& Shin Kanzen)}$$
* **Ý nghĩa:** Định vị rõ đây là **Bộ đề thi mô phỏng chất lượng cao (High-Standard Accredited Mock Exams)** được biên soạn và chuẩn hóa dựa trên cấu trúc khung của Ban tổ chức JLPT Nhật Bản (JEES & The Japan Foundation) kết hợp các tài liệu ôn luyện hàng đầu.

---

## 2. KIẾN TRÚC TẠO SINH BỘ ĐỀ MÔ PHỎNG CHUẨN (DOKKAI & BUNPOU)

```
┌─────────────────────────────────────────────────────────────┐
│  KHO TRI THỨC HỌC THUẬT (KNOWLEDGE BASE)                     │
│  - Giáo trình: Shin Kanzen Master (Đọc hiểu, Ngữ pháp, Từ vựng)│
│  - Sách đề chính thức: JLPT Official Practice Workbooks    │
│  - Nguồn văn bản: Báo chí Asahi, Mainichi, bài luận học thuật │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  PIPELINE TẠO SINH & CHUẨN HÓA AI (GENAI GENERATOR)         │
│  - System Prompt: Giảng viên khảo thí JLPT cao cấp          │
│  - Kiểm soát độ dài chữ: Đoạn ngắn, Trung văn, Trường văn   │
│  - Kiểm soát ma trận câu hỏi: Lý do, Ý chính, Dấu gạch chân │
│  - Phân bổ đáp án ngẫu nhiên: Tránh bias đáp án 0            │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  BỘ LỌC XÁC THỰC CHẤT LƯỢNG (VALIDATION GUARDRAILS)         │
│  - Check độ dài: Tanbun ≥ 350 chữ, Choubun ≥ 900 chữ (N3-N1) │
│  - Check tính hợp lý của 3 phương án gây nhiễu (Distractors)│
│  - Check kế thừa ngữ cảnh: 100% câu hỏi con có bài đọc đầy đủ│
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
                     LƯU VÀO MYSQL (PRISMA ORM)
```

### 2.1. Quy chuẩn định lượng phần Đọc hiểu (Dokkai) từ N5 đến N1
Hệ thống loại bỏ hoàn toàn các bài đọc tượng trưng ngắn < 100 chữ; toàn bộ bài đọc mô phỏng bắt buộc tuân thủ hạn ngạch độ dài:

| Cấp độ | Dạng bài | Số câu | Độ dài chữ tối thiểu | Chủ đề văn bản |
| :---: | :--- | :---: | :---: | :--- |
| **N5** | • Đoạn văn ngắn (短文)<br>• Đoạn văn vừa (中文)<br>• Tra cứu thông tin (情報検索) | 3 bài (3 câu)<br>1 bài (1 câu)<br>1 bài (2 câu) | **80 - 150 chữ**<br>**250 chữ**<br>**250 chữ** | Cuộc sống hàng ngày, gia đình, thời gian biểu, bảng thông báo lớp học. |
| **N4** | • Đoạn văn ngắn<br>• Đoạn văn vừa<br>• Tra cứu thông tin | 4 bài (4 câu)<br>1 bài (4 câu)<br>1 bài (2 câu) | **150 - 200 chữ**<br>**450 chữ**<br>**400 chữ** | Thư từ, công việc văn phòng, thông báo di chuyển, thể thao. |
| **N3** | • Đoạn văn ngắn<br>• Đoạn văn vừa<br>• Trường văn (長文)<br>• Tra cứu thông tin | 4 bài (4 câu)<br>2 bài (6 câu)<br>1 bài (4 câu)<br>1 bài (2 câu) | **350 chữ/bài**<br>**600 chữ/bài**<br>**900 chữ/bài**<br>**600 chữ/bài** | Bình luận xã hội nhẹ, tâm lý học đời sống, thói quen sinh hoạt, tờ rơi bảo hiểm. |
| **N2** | • Đoạn văn ngắn<br>• Đoạn văn vừa<br>• So sánh tổng hợp (統合理解)<br>• Trường văn<br>• Tra cứu thông tin | 5 bài (5 câu)<br>3 bài (9 câu)<br>1 bài (2 câu)<br>1 bài (3 câu)<br>1 bài (2 câu) | **350 chữ/bài**<br>**550 chữ/bài**<br>**600 chữ/bài**<br>**900 chữ/bài**<br>**700 chữ/bài** | Khoa học kỹ thuật, triết lý kinh doanh, văn hóa doanh nghiệp, bảo vệ môi trường. |
| **N1** | • Đoạn văn ngắn<br>• Đoạn văn vừa<br>• Trường văn<br>• So sánh tổng hợp<br>• Luận giải quan điểm (論説文)<br>• Tra cứu thông tin | 4 bài (4 câu)<br>3 bài (9 câu)<br>1 bài (4 câu)<br>1 bài (3 câu)<br>1 bài (3 câu)<br>1 bài (2 câu) | **350 chữ/bài**<br>**600 chữ/bài**<br>**1.000 chữ/bài**<br>**800 chữ/bài**<br>**1.200 chữ/bài**<br>**700 chữ/bài** | Trừu tượng triết học, bản chất ngôn ngữ, kinh tế vĩ mô, mỹ học, xã hội học chuyên sâu. |

---

## 3. KIẾN TRÚC ÂM THANH ĐA GIỌNG NAM - NỮ (CHOUKAI MULTI-VOICE ENGINE)

### 3.1. Hạn chế của hệ thống cũ và Giải pháp đột phá
* **Hệ thống cũ:** Dùng Google Translate TTS đơn âm $\rightarrow$ Chỉ 1 giọng nữ máy robot, đọc liên tù tì cả lời thoại nam và nữ, không có tiếng chuông, không có khoảng dừng suy nghĩ.
* **Hệ sinh thái mới (Multi-Voice Neural Studio):**
  1. **Bộ phân vai hội thoại (Dialogue Role Parser):** Phân tích kịch bản theo nhãn nhân vật (`[NARRATOR]`, `[MALE]`, `[FEMALE]`).
  2. **Gán giọng đọc trí tuệ nhân tạo riêng biệt:**
     * `[NARRATOR]`: Giọng đọc trung tính truyền cảm (`ja-JP-NaokiNeural`) đọc phần dẫn đề và câu hỏi.
     * `[MALE]`: Giọng nam ấm áp, chuẩn ngữ điệu Tokyo (`ja-JP-KeitaNeural`).
     * `[FEMALE]`: Giọng nữ phát thanh viên tự nhiên (`ja-JP-NanamiNeural`).
  3. **Quy chuẩn âm thanh phòng thi thực thụ:**
     * **Chime Effect:** Tiếng chuông *Ding-dong* âm chuẩn phát ra trước khi đọc câu hỏi.
     * **Khoảng lặng tĩnh (Silence Gap):** Tự động chèn **10 – 15 giây im lặng** sau câu hỏi để thí sinh đọc phương án trên màn hình và suy nghĩ lựa chọn (y hệt thi thật).

```
[Kịch bản hội thoại có tag]
       │
       ├─► [NARRATOR]: "問題１。男の人と女の人が話しています..." ──► Giọng Naoki (Phát thanh viên)
       ├─► [CHIME]: Tiếng chuông thi JLPT (0.8s) ─────────────────► Audio Chime Buffer
       ├─► [FEMALE]: "田中さん、会議の資料できた？" ───────────────► Giọng Nanami (Nữ)
       ├─► [MALE]: "あ、課長。今印刷が終わったところです。" ───────► Giọng Keita (Nam)
       ├─► [QUESTION]: "男の人はこれから何をしますか。" ────────────► Giọng Naoki
       └─► [SILENCE GAP]: 12 giây im lặng ───────────────────────► Silent Buffer (Cho phép học viên làm bài)
                               │
                               ▼
               [Nối các đoạn Audio Buffer lại thành file MP3]
                               │
                               ▼
        Lưu file: `server/public/audio/choukai/{level}/{examId}_{Q}.mp3`
```

---

## 4. THIẾT KẾ LƯU TRỮ CƠ SỞ DỮ LIỆU TỐI ƯU NHẤT (STORAGE BEST PRACTICES)

### 4.1. Phân tích Kỹ thuật: Vì sao KHÔNG lưu BLOB vào MySQL?
* **Dung lượng:** 60 đề thi $\times$ 30 câu nghe = **1.800 câu nghe** $\times$ 2MB = **3.6 GB**.
* **Hiệu năng:** Lưu 3.6 GB BLOB vào MySQL sẽ:
  * Chiếm trọn bộ nhớ đệm RAM (InnoDB Buffer Pool), làm chậm các câu lệnh `SELECT`, `UPDATE` của toàn bộ người dùng khác.
  * Khiến thao tác sao lưu database (mysqldump) mất hàng giờ đồng hồ.
  * Không hỗ trợ giao thức HTTP Range Requests (tua nhanh audio).

### 4.2. Mô hình Hybrid Tối ưu Chuẩn Quốc tế

```
┌─────────────────────────────────────────────────────────────┐
│  CƠ SỞ DỮ LIỆU MYSQL (PRISMA SCHEMA)                         │
│  - Chỉ lưu Metadata: id, examId, orderNumber, subType       │
│  - audioUrl: '/audio/choukai/N3/2023_07/Q75.mp3' (string)   │
│  - audioDuration: 145 (số giây)                             │
│  - audioScript: Lời thoại có tag nam/nữ (Text)               │
│  ==> Dung lượng mỗi bản ghi: < 200 bytes                    │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Trỏ đường dẫn URL)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  STORAGE TẦNG TĨNH (STATIC / CLOUD OBJECT STORAGE)          │
│  - Thư mục tĩnh: server/public/audio/choukai/...            │
│  - Hoặc Cloud Object Storage: AWS S3 / Cloudflare R2        │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Truyền tải)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  EXPRESS / NGINX STREAMING ENGINE                           │
│  - Header: Accept-Ranges: bytes (Tua audio tức thì 0ms)     │
│  - Header: Cache-Control: max-age=31536000, immutable       │
│  ==> Học viên tải 1 lần, các lần sau nghe lại không tốn mạng│
└─────────────────────────────────────────────────────────────┘
```

---

## 5. PHÂN TÍCH TÍNH NĂNG TRA CỨU TRỰC TIẾP TRÊN ĐOẠN VĂN (eJOY-STYLE LOOKUP)

### 5.1. Ưu điểm vượt trội
1. **Dịch theo đúng ngữ cảnh thực tế (Context-Aware Translation):** Khác với từ điển từ đơn (như JMDict chỉ đưa ra danh sách nghĩa chung chung), hệ thống gửi cả câu văn xung quanh lên Google Gemini AI, giúp bản dịch sát nghĩa 100% với hàm ý của tác giả trong bài đọc.
2. **Phân tích ngữ pháp chuyên sâu:** Giải thích ngay thể biến đổi động từ (thể bị động, sai khiến, bị động sai khiến), vai trò của các trợ từ khó (`に`, `で`, `を`, `として`, `にかけて`).
3. **Tự động sinh 2 câu ví dụ tương tự:** Giúp học viên nắm bắt cách dùng từ trong các văn cảnh đời sống khác nhau.
4. **Không bị ngắt mạch tư duy (Zero Context-Switching):** Người học không cần phải copy từ sang Google Dịch hay mở tab từ điển khác, giữ trọn vẹn sự tập trung trên bài làm.

### 5.2. Nhược điểm & Hạn chế cần cải tiến
1. **Tâm lý "ỷ lại" khi thi thử:** Trong phòng thi thật, học viên hoàn toàn không có từ điển. Nếu trong chế độ thi tính giờ (Exam Mode) mà cho phép tra từ tự do, học viên sẽ không rèn luyện được kỹ năng **"đoán nghĩa từ qua ngữ cảnh" (Context Guessing Skill)**.
2. **Độ trễ phản hồi khi Cache Miss:** Khi tra một cụm từ mới chưa có trong Redis Cache, thời gian gọi Gemini AI mất khoảng **1.2 – 2.5 giây**, đôi khi tạo cảm giác phải chờ đợi.
3. **Thiếu thông tin phân cấp học thuật:** Hiện chưa gắn nhãn cấp độ JLPT cho từ được tra (ví dụ: từ này thuộc N3 hay N2) và chưa có phiên âm Furigana trên đầu chữ Hán trong popup.
4. **Chưa có tính năng 1-Click Save vào Flashcard:** Học viên tra xong hiểu nghĩa nhưng sau khi đóng popup thì từ đó trôi mất, không lưu lại được để ôn tập ngắt quãng (SRS).

### 5.3. Đề xuất Giải pháp Tối ưu hóa Toàn diện
* **Tối ưu 1 - Phân tách Chế độ làm bài:**
  * **Chế độ Thi Thật (Exam Mode):** Khóa tính năng tra từ eJOY. Bắt buộc người học tự thân vận động với áp lực thời gian như thi thật.
  * **Chế độ Luyện Tập (Practice Mode) & Màn hình Kết quả (Review Mode):** Kích hoạt toàn diện tính năng tra từ eJOY để học viên học sâu từng câu chữ.
* **Tối ưu 2 - Kiến trúc Tra cứu 2 Tầng (Hybrid Speed Engine):**
  * Tầng 1: Nếu người dùng bôi đen 1 từ đơn $\rightarrow$ Tra cứu ngay trong từ điển nội bộ (Local Dictionary Index) trả về kết quả trong **< 30ms**.
  * Tầng 2: Nếu bôi đen một cụm ngữ pháp phức tạp hoặc cả câu $\rightarrow$ Kích hoạt Gemini AI phân tích ngữ cảnh.
* **Tối ưu 3 - Nút "Lưu vào Sổ tay" (1-Click Bookmark):**
  * Thêm nút icon Bookmark/Dấu sao ngay trên Popover nổi. Khi nhấp vào, từ vựng, ngữ nghĩa và 2 câu ví dụ sẽ tự động lưu vào **Sổ tay cá nhân (Notebook / Mistake Bank)** để hệ thống nhắc nhở ôn tập ngắt quãng (SRS) sau này.
* **Tối ưu 4 - Bổ sung Furigana & Level Badge:**
  * Hiển thị kèm phiên âm Hiragana trên đầu chữ Kanji và huy hiệu cấp độ (VD: `[N3]`, `[N2]`).

---

## 6. ĐÁNH GIÁ ĐA CHIỀU: NGƯỜI THI vs. NGƯỜI RA ĐỀ

Để đảm bảo hệ thống giúp người học **tự tin thi đạt điểm cao (trên 130/180 điểm)** trong kỳ thi thật, dưới đây là đánh giá và định hướng nâng cấp theo 2 góc nhìn:

### 6.1. Dưới góc nhìn của Người thi (Test-Taker / Thí sinh)

| Yếu tố kỳ thi thật | Hiện trạng hệ thống | Điểm cần nâng cấp để học viên tự tin đạt điểm cao |
| :--- | :--- | :--- |
| **Áp lực thời gian (Time Management)** | Có đồng hồ đếm ngược tổng thời gian. | **Cần thêm cảnh báo thời gian theo phân môn (Pacing Guide):**<br>Ví dụ N3 có 140 phút, hệ thống nên gợi ý: *"Phần từ vựng - ngữ pháp nên làm trong 45 phút, còn 95 phút dành cho đọc hiểu"*. Khi quá giờ ở một phần, hệ thống hiển thị nhắc nhở nhẹ để rèn kỹ năng phân bổ thời gian. |
| **Thao tác tư duy trên bài đọc** | Hiển thị bài đọc dạng văn bản thường. | **Thêm công cụ Gạch chân (Underline/Highlighter) & Gạch bỏ phương án sai (Strikethrough):**<br>Thí sinh đi thi thật luôn dùng bút chì để gạch bỏ các phương án bẫy và gạch dưới câu then chốt. Cần cho phép click chuột phải để gạch ngang phương án loại trừ `[~~A~~]`. |
| **Chẩn đoán điểm yếu (Diagnostics)** | Đã có báo cáo phân tích theo từng Section. | **Bổ sung Biểu đồ Radar năng lực (Competency Radar Chart):**<br>Chỉ rõ học viên yếu ở dạng bài cụ thể nào (ví dụ: Yếu dạng *Tìm kiếm thông tin*, hay yếu dạng *Nghe phản xạ nhanh*), kèm gợi ý bài tập khắc phục ngay lập tức. |

### 6.2. Dưới góc nhìn của Người ra đề (Examiner / Giảng viên Sư phạm)

| Tiêu chuẩn sư phạm | Hiện trạng hệ thống | Điểm cần nâng cấp để đảm bảo tính phân hóa |
| :--- | :--- | :--- |
| **Độ phân hóa câu hỏi (Discrimination Index)** | Đã phân chia theo cấp độ N5 - N1. | **Đảm bảo tỉ lệ vàng: 30% Nhận biết – 40% Thông hiểu – 30% Vận dụng cao:**<br>Tránh tình trạng các phương án nhiễu quá dễ bị loại trừ. Các phương án sai phải là các "bẫy tư duy" kinh điển (đồng âm khác nghĩa, nhầm lẫn trợ từ, hiểu sai chủ ngữ ẩn). |
| **Độ bao phủ kiến thức (Curriculum Coverage)** | Các đề cùng level trước đây bị lặp một số câu. | **Áp dụng 6 Ngân hàng Đề độc lập (Bank 0-5):**<br>Mỗi bộ đề kiểm tra một trường từ vựng và chủ điểm ngữ pháp riêng biệt, đảm bảo khi học viên hoàn thành chuỗi đề thi thử sẽ quét sạch 100% danh mục ngữ pháp trong đề cương JLPT. |
| **Tính xác thực của bài đọc (Authenticity)** | Đã loại bỏ hoàn toàn các bài đọc cụt `Tiếp tục bài đọc trên`. | **Đảm bảo tính văn phong Nhật chuẩn mực:**<br>Các bài Trung văn và Trường văn phải mang cấu trúc nghị luận ba phần (Mở bài - Thân bài phản biện - Kết luận khẳng định quan điểm tác giả), giúp người học làm quen với văn phong hàn lâm của các tác giả Nhật Bản nổi tiếng. |

---

## 7. KẾT LUẬN & CAM KẾT HỆ THỐNG
1. **Minh bạch & Tôn trọng bản quyền:** Định danh 100% đề thi là Đề thi Mô phỏng Chuẩn cấu trúc JEES & Shin Kanzen Master, tạo niềm tin tuyệt đối cho học viên.
2. **Âm thanh & Đọc hiểu Chuẩn mực:** Loại bỏ vĩnh viễn âm thanh đơn âm đọc cụt; hướng tới âm thanh đa giọng đối thoại Nam - Nữ kèm chuông báo và khoảng lặng tĩnh chuẩn kỳ thi.
3. **Sư phạm cá nhân hóa:** Biến hệ thống từ một trang web làm trắc nghiệm đơn thuần thành một **"Huấn luyện viên Khảo thí Thông minh"**, giúp học viên hiểu rõ nguyên nhân sai, rèn luyện kỹ năng phân bổ thời gian và tự tin bứt phá điểm số trong kỳ thi thật.
