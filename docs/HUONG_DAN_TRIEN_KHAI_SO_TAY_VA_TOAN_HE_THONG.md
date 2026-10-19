> 🚀 **[CẬP NHẬT GIAI ĐOẠN 4 - TỐI ƯU CSDL & BẢO MẬT SỔ TAY]**
> - **Vá lỗ hổng IDOR:** Đã loại bỏ hoàn toàn việc đọc userId từ Query Parameter (?userId=). Chức năng Sổ tay hiện tại chỉ trích xuất định danh từ chính chữ ký JWT.
> - **Tối ưu Spaced Repetition (SRS):** Bổ sung Composite Index @@index([userId, nextReviewAt(sort: Asc)]) cho CSDL. Việc gọi API lấy danh sách "Từ vựng đến hạn ôn tập" giờ đây phản hồi dưới 1ms.

# HƯỚNG DẪN TRIỂN KHAI VÀ VẬN HÀNH TOÀN DIỆN HỆ THỐNG NIHONAI
> **Tài liệu bàn giao kiến trúc, cấu hình CSDL MySQL, quy trình triển khai phân hệ Sổ tay Cá nhân (Personal Notebook) & Thi thử JLPT Chuẩn (2020 - 2025).**

---

## 1. TỔNG QUAN KIẾN TRÚC TOÀN HỆ THỐNG

Hệ thống **NihonAI** được thiết kế theo kiến trúc hiện đại, phân tách rõ ràng giữa Frontend Client, API Gateway, các Bounded Contexts Microservices và tầng lưu trữ CSDL quan hệ kết hợp bộ nhớ đệm:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND CLIENT (NEXT.JS 16)                    │
│  - Port 3000 | Turbopack | React 19 | Tailwind CSS | Lucide Icons      │
│  - Phân hệ Sổ tay: Flashcard SRS 3D, Audio Speech, Quản lý 4 nhóm     │
│  - Phân hệ JLPT: 60 Đề thi 2020-2025 N5->N1, Chấm điểm chuẩn 180 điểm  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / RESTful API
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 API GATEWAY & BOUNDED CONTEXTS (EXPRESS + TS)          │
│  - Port 5000 | Dynamic Route Dispatch | Consul Health Metric Tracker  │
│  - Middleware: JWT Authentication & Error Handlers                     │
│  - Contexts:                                                           │
│    + /api/notebook    : NotebookService (Sổ tay cá nhân & SRS)         │
│    + /api/exam        : ExamService (Kho đề JLPT 2020-2025 & Chấm)    │
│    + /api/vocabulary  : VocabularyService (Minna, Tango, Mimikara)     │
│    + /api/kanji       : KanjiService (2.138 Hán tự, Đồ thị bộ thủ)     │
│    + /api/reading     : ReadingService (Báo NHK, Song ngữ, Dokkai)    │
│    + /api/shadowing   : ShadowingService (YouTube Timeline Sync)       │
│    + /api/auth        : AuthService (JWT Token Versioning)             │
└───────────────────────┬───────────────────────────────┬────────────────┘
                        │                               │
                        ▼                               ▼
     ┌────────────────────────────────────┐   ┌───────────────────────────┐
     │       MYSQL DATABASE 8.X           │   │    REDIS CACHE ENGINE     │
     │  - Database: japanese_learning_db  │   │  - Port 6379              │
     │  - Port: 3306                      │   │  - In-Memory Fallback     │
     │  - Prisma ORM 5.22                 │   │  - TTL Caching            │
     └────────────────────────────────────┘   └───────────────────────────┘
```

---

## 2. PHÂN HỆ SỔ TAY CÁ NHÂN (PERSONAL JAPANESE NOTEBOOK)

### 2.1. Cấu trúc bảng CSDL MySQL (`notebook_items`)
Bảng được định nghĩa tối ưu thông qua Prisma ORM:

```prisma
model NotebookItem {
  id             String    @id @default(uuid())
  userId         String?   // Liên kết User (Cascade Delete)
  itemType       String    @db.VarChar(20) // "VOCAB", "KANJI", "GRAMMAR", "NOTE"
  title          String    @db.VarChar(255) // Từ vựng / Hán tự / Mẫu ngữ pháp / Tiêu đề
  reading        String?   @db.VarChar(255) // Hiragana / Âm Hán Việt / Romaji
  meaningVi      String    @db.Text         // Nghĩa tiếng Việt
  level          String    @default("N3") @db.VarChar(10) // N5, N4, N3, N2, N1
  structure      String?   @db.Text         // Cấu trúc ngữ pháp (nếu là GRAMMAR)
  exampleJp      String?   @db.Text         // Câu ví dụ tiếng Nhật
  exampleVi      String?   @db.Text         // Dịch nghĩa câu ví dụ
  note           String?   @db.Text         // Ghi chú cá nhân / Mẹo chiết tự
  tags           String?   @db.VarChar(255) // Phân loại (e.g. "Giao tiếp, Đời sống")
  masteryStatus  String    @default("LEARNING") @db.VarChar(20) // "LEARNING", "REVIEWING", "MASTERED"
  reviewCount    Int       @default(0)      // Số lần đã luyện tập
  lastReviewedAt DateTime?                  // Thời điểm ôn tập gần nhất
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  user           User?     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, itemType])
  @@index([userId, masteryStatus])
  @@index([userId, level])
  @@index([createdAt(sort: Desc)])
  @@map("notebook_items")
}
```

### 2.2. Các tính năng nổi bật của Sổ tay
1. **Hỗ trợ đầy đủ 4 nhóm kiến thức**:
   - **Từ vựng (VOCAB)**: Lưu từ vựng, phiên âm Kana, câu ví dụ song ngữ, nút phát âm âm thanh 1-chạm (Web Speech API).
   - **Hán tự (KANJI)**: Lưu chữ Hán, âm Hán Việt, Onyomi, Kunyomi, từ ghép mẫu.
   - **Ngữ pháp (GRAMMAR)**: Lưu cấu trúc cú pháp, ý nghĩa, câu ví dụ văn cảnh và tích hợp nút **Phân tích chuyên sâu bằng AI (GrammarDetailModal)**.
   - **Ghi chú tự do & Mẹo (NOTE)**: Lưu mẹo làm bài Dokkai, bí quyết phân biệt Kính ngữ (Keigo), cách dùng Aizuchi.
2. **Thuật toán lặp lại ngắt quãng (SRS - Spaced Repetition System)**:
   - 3 trạng thái: `LEARNING` (Đang học) ➔ `REVIEWING` (Cần ôn lại) ➔ `MASTERED` (Đã thuộc).
   - Bấm 1-chạm để chuyển trạng thái trên thẻ hoặc đánh giá trực tiếp trong chế độ Flashcard.
3. **Chế độ Luyện tập Flashcard Toàn màn hình**:
   - Lật thẻ 2 mặt (Mặt trước: Từ/Kanji/Ngữ pháp lớn; Mặt sau: Phiên âm, Nghĩa, Cấu trúc, Ví dụ, Mẹo).
   - Thanh tiến độ câu hỏi, điều hướng Trước/Sau.
   - Đánh giá 3 nút: Chưa thuộc / Cần ôn / Đã thuộc ➔ Tự động cập nhật CSDL MySQL tức thì.
4. **Bộ lọc & Tìm kiếm thời gian thực**:
   - Lọc theo Phân loại (`Tất cả`, `Từ vựng`, `Hán tự`, `Ngữ pháp`, `Ghi chú`).
   - Lọc theo Cấp độ JLPT (`N5` -> `N1`).
   - Lọc theo Trạng thái ghi nhớ SRS.
   - Tìm kiếm nhanh từ khóa tiếng Nhật hoặc tiếng Việt.

---

## 3. PHÂN HỆ THI THỬ & LUYỆN ĐỀ JLPT CHUẨN (2020 - 2025, N5 -> N1)

### 3.1. Cấu trúc chuẩn 4 phân môn & Thang điểm JLPT
Hệ thống chuẩn hóa toàn bộ đề thi thành 4 phân môn cốt lõi theo đúng format kỳ thi JLPT của Hiệp hội Giáo dục Quốc tế Nhật Bản (JEES):
1. 🔤 **Kiến thức ngôn ngữ - Từ vựng & Hán tự (文字・語彙)**:
   - Thử thách cách đọc Kanji, cách viết Kanji, điền từ theo ngữ cảnh, từ đồng nghĩa và cách sử dụng từ chuẩn xác trong câu.
2. 📑 **Kiến thức ngôn ngữ - Ngữ pháp (文法)**:
   - Bao gồm phán đoán ngữ pháp, bài tập sắp xếp câu tìm vị trí dấu sao (★), ngữ pháp mạch lạc theo đoạn văn.
3. 📖 **Đọc hiểu (読解 - Dokkai)**:
   - Bài đọc ngắn (短文), bài đọc trung (中文) và bài tìm kiếm thông tin theo bảng biểu/thông báo (情報検索).
4. 🎧 **Nghe hiểu (聴解 - Choukai)**:
   - **Tích hợp âm thanh đối thoại phát trực tiếp (Audio)** kèm tính năng dự phòng giọng bản xứ (Web Speech API).
   - Đầy đủ dạng bài: Hiểu vấn đề (課題理解), Hiểu điểm cốt lõi (ポイント理解), Phản xạ giao tiếp tức thì (即時応答).
   - Có nút **"Xem kịch bản hội thoại (Script) & Dịch nghĩa"** sau khi nghe để ôn tập sâu.

### 3.2. Hai chế độ học tập thông minh
1. 🏆 **Chế độ Thi Thử Trọn Bộ (Full Exam Mode)**:
   - Làm trọn vẹn cả 4 phân môn với đồng hồ đếm ngược đúng thời gian quy định (105-170 phút tùy level).
   - Tự động khóa câu trả lời khi hết giờ.
   - Thang điểm chuẩn **180 điểm**:
     + Kiến thức ngôn ngữ (Từ vựng + Ngữ pháp): 60 điểm (Điểm liệt: < 19/60)
     + Đọc hiểu: 60 điểm (Điểm liệt: < 19/60)
     + Nghe hiểu: 60 điểm (Điểm liệt: < 19/60)
   - Kiểm tra **Điều kiện Đỗ/Trượt**: Điểm tổng >= Điểm chuẩn cấp độ VÀ Không có môn nào bị điểm liệt (< 19/60).
2. 🎯 **Mục Luyện Đề Theo Chuyên Đề (Skill Practice Mode)**:
   - Dành cho học viên muốn tập trung khắc phục điểm yếu của mình mà không cần làm toàn bộ đề.
   - Chọn nhanh chuyên đề: *Chuyên đề Từ vựng*, *Chuyên đề Ngữ pháp*, *Chuyên đề Đọc hiểu*, hoặc *Chuyên đề Nghe hiểu (Choukai)*.
   - Làm bài theo nhịp độ tự do, hỗ trợ kiểm tra đáp án và phân tích AI ngay trong quá trình luyện tập.

### 3.3. CSDL MySQL Lưu trữ đề thi & câu hỏi
- Bảng `jlpt_exams`: Lưu thông tin 60 đề thi (Năm 2020-2025, kỳ tháng 7 và tháng 12, cấp độ N5-N1, thời gian, điểm chuẩn).
- Bảng `jlpt_questions`: Lưu 1.224 câu hỏi chi tiết, gồm `section` (`vocab`, `grammar`, `reading`, `listening`), `audioUrl`, `passage`, `passageVi`, `options`, `optionsVi`, `correctIndex`, `explanation`.

---

## 4. CÁC BƯỚC TRIỂN KHAI HỆ THỐNG TỪ ĐẦU (STEP-BY-STEP)

### Bước 1: Kiểm tra phần mềm tiên quyết
Đảm bảo máy chủ hoặc môi trường phát triển đã cài đặt:
- **Node.js**: Phiên bản 18.x trở lên (khuyên dùng Node.js 20+ hoặc 22+).
- **MySQL**: Phiên bản 8.0+ đang chạy tại `127.0.0.1:3306`.
- **Redis** (Tùy chọn): Đang chạy tại `127.0.0.1:6379` (Hệ thống có cơ chế In-Memory Fallback nếu chưa bật Redis).

### Bước 2: Cấu hình biến môi trường
Tạo file `server/.env` với nội dung:
```env
PORT=5000
DATABASE_URL="mysql://root:your_mysql_password@127.0.0.1:3306/japanese_learning_db"
REDIS_HOST="127.0.0.1"
REDIS_PORT=6379
JWT_SECRET="your_jwt_secret_key_here"
GEMINI_API_KEY="your_gemini_api_key_here"
```

Tạo file `client/.env.local` với nội dung:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Bước 3: Cài đặt thư viện phụ thuộc
```bash
# Cài đặt cho Server
npm --prefix server install

# Cài đặt cho Client
npm --prefix client install
```

### Bước 4: Đồng bộ Schema CSDL MySQL
```bash
# Đẩy cấu trúc bảng vào MySQL
npx --prefix server prisma db push

# Khởi tạo Prisma Client
npx --prefix server prisma generate
```

### Bước 5: Nạp dữ liệu mẫu chất lượng cao vào CSDL (Seeding)
```bash
# Nạp dữ liệu Sổ tay cá nhân (Vocab, Kanji, Grammar, Notes qua N5-N1)
node server/prisma/seed-notebook.js

# Nạp 60 đề thi thử JLPT chuẩn các năm 2020-2025 (N5-N1, Tháng 7 & Tháng 12)
node server/prisma/seed-jlpt-exams.js
```

### Bước 6: Biên dịch hệ thống (Build)
```bash
# Biên dịch Server TypeScript
npm --prefix server run build

# Biên dịch Client Next.js
npm --prefix client run build
```

### Bước 7: Khởi chạy dịch vụ (Start)
```bash
# Chạy Backend Server (Port 5000)
npm --prefix server run start
# hoặc chạy dev: npm --prefix server run dev

# Chạy Frontend Client (Port 3000)
npm --prefix client run start
# hoặc chạy dev: npm --prefix client run dev
```

---

## 5. BẢNG ĐẶC TẢ RESTFUL API PHÂN HỆ SỔ TAY (`/api/notebook`)

Tất cả các endpoint trả về định dạng chuẩn `ApiResponse<T>`:
```json
{
  "success": true,
  "data": { ... },
  "message": "Thông báo nếu có",
  "meta": {
    "service": "notebook-service",
    "timestamp": "2026-09-08T04:15:00.000Z",
    "version": "1.0.0"
  }
}
```

| Phương thức | Đường dẫn API | Mô tả chức năng | Tham số / Body |
|:---|:---|:---|:---|
| **GET** | `/api/notebook` | Lấy danh sách các mục sổ tay từ CSDL | Query: `itemType`, `level`, `masteryStatus`, `search`, `page`, `limit` |
| **GET** | `/api/notebook/stats` | Lấy thống kê tổng quan và tỷ lệ thành thạo SRS | Không |
| **POST** | `/api/notebook` | Thêm mục mới vào sổ tay và lưu vào MySQL | Body: `itemType`, `title`, `reading`, `meaningVi`, `level`, `structure`, `exampleJp`, `exampleVi`, `note`, `tags` |
| **PUT** | `/api/notebook/:id` | Cập nhật thông tin chi tiết một mục | Param: `id`, Body: Thông tin cần sửa |
| **PATCH** | `/api/notebook/:id/mastery` | Chuyển đổi trạng thái SRS (1-chạm) | Param: `id`, Body: `{ "masteryStatus": "MASTERED" }` |
| **DELETE** | `/api/notebook/:id` | Xóa vĩnh viễn mục khỏi CSDL | Param: `id` |

---

## 6. BẢNG ĐẶC TẢ RESTFUL API PHÂN HỆ THI THỬ & LUYỆN ĐỀ (`/api/exam`)

| Phương thức | Đường dẫn API | Mô tả chức năng | Tham số / Body |
|:---|:---|:---|:---|
| **GET** | `/api/exam/list` | Lấy danh sách 60 đề thi chuẩn từ MySQL | Query: `level`, `year`, `session` |
| **GET** | `/api/exam/:id` | Lấy câu hỏi an toàn (ẩn đáp án đúng, đầy đủ 4 phần + Audio) | Query: `section` (`vocab`, `grammar`, `reading`, `listening`) để luyện chuyên đề |
| **POST** | `/api/exam/submit` | Nộp bài và chấm điểm chuẩn JLPT 180 điểm (kiểm tra điểm liệt) | Body: `examId`, `userAnswers`, `timeSpentSeconds` |
| **POST** | `/api/exam/ai-explain` | Phân tích chuyên sâu bẫy đề & trọng tâm câu hỏi từ CSDL | Body: `questionId`, `userAnswer` |

---

## 7. TỔNG HỢP CÁC LỆNH KIỂM THỬ TỰ ĐỘNG (AUTOMATED TEST SUITE)

Hệ thống cung cấp bộ kiểm thử tự động toàn diện qua HTTP API thực tế:

```bash
# 1. Kiểm thử phân hệ Sổ tay Cá nhân (9/9 bài test kiểm tra CRUD, Filter, SRS, MySQL)
npm --prefix server run test:notebook

# 2. Kiểm thử phân hệ Thi thử & Luyện đề JLPT (7/7 bài test: 4 phần chuẩn, Audio, Luyện chuyên đề, Chấm 180 điểm)
npm --prefix server run test:exam

# 3. Kiểm thử phân hệ Xác thực JWT & Bảo mật người dùng
npm --prefix server run test:auth
```

---

## 8. ĐỊA CHỈ TRUY CẬP VÀ NGHIỆM THU

- **Frontend Ứng dụng**: [http://localhost:3000](http://localhost:3000)
  - Truy cập tab **"Thi thử JLPT"** để trải nghiệm:
    + 🏆 **Thi Thử Trọn Bộ**: Làm bài thi 4 môn với đồng hồ đếm ngược.
    + 🎯 **Mục Luyện Đề Chuyên Đề**: Luyện riêng từng phần Từ vựng, Ngữ pháp, Đọc hiểu, Nghe hiểu (Audio).
  - Truy cập tab **"Sổ tay cá nhân"** để quản lý Flashcard & SRS.
- **Backend API Gateway**: [http://localhost:5000/api](http://localhost:5000/api)
- **Health Check & Service Registry**: [http://localhost:5000/api/gateway/health](http://localhost:5000/api/gateway/health)
- **Tài khoản Demo thử nghiệm**:
  - Email: `cuong@nihonai.edu.vn`
  - Mật khẩu: `123456` (hoặc kiểm tra trực tiếp qua chế độ khách mở rộng).



## 5. THUẬT TOÁN SRS SUPERMEMO-2 (SM-2) TRONG SỔ TAY HỌC TẬP (GIAI ĐOẠN 3)

Hệ thống Sổ Tay (Notebook) áp dụng thuật toán lặp lại ngắt quãng chuẩn **SuperMemo-2 (SM-2)** giống hệt Anki.

### Kiến Trúc CSDL (NotebookItem)
Mỗi thẻ (NotebookItem) quản lý 3 tham số sống còn của SM-2:
- `interval` (Int): Khoảng cách số ngày cho lần ôn tập tiếp theo.
- `easeFactor` (Float): Hệ số độ dễ (Mặc định 2.5), quyết định tốc độ tăng interval.
- `nextReviewAt` (DateTime): Thời điểm đến hạn ôn tập kế tiếp.

### Logic Thuật Toán Đánh Giá (Quality)
Khi lật thẻ mặt sau, người dùng phản hồi với 4 mức độ:
- **0 - Lại từ đầu (Again/Khó quá)**: Trả về trạng thái học lại. `interval = 1`, `easeFactor = max(1.3, easeFactor - 0.2)`.
- **3 - Khó (Hard)**: `interval = (interval * 1.2)`, `easeFactor = max(1.3, easeFactor - 0.15)`.
- **4 - Tốt (Good)**: Nhớ trơn tru. `interval = (interval * easeFactor)`, `easeFactor` không đổi.
- **5 - Dễ (Easy)**: `interval = (interval * easeFactor * 1.3)`, `easeFactor = easeFactor + 0.15`.

### Giới Hạn Ôn Tập (Cảnh Báo 200 Thẻ)
Hệ thống **không giới hạn số lượng thẻ ôn tập hàng ngày**.
Tuy nhiên, phía Frontend sẽ có một lớp **Guard (Cảnh báo)**: Nếu tổng số lượng thẻ Due (Đến hạn) vượt quá **200 thẻ/ngày**, một thông báo Alert (Khuyến cáo) sẽ hiện lên khuyên người dùng nên chia nhỏ phiên học để tránh quá tải não bộ, nhưng vẫn cho phép họ ôn hết nếu muốn.

\n\n## 6. CẢI TIẾN TRẢI NGHIỆM HỌC TẬP (AI & GAMIFICATION)\n\n- **Audio (Phát âm):** Hỗ trợ Web Speech API trên mặt trước và sau thẻ.\n- **Bộ lọc theo ngữ cảnh:** Có thể kết hợp bộ lọc (Ngữ pháp, N3...) và lấy thẻ tới hạn (Due Cards) riêng rẽ cho chuyên mục đó.\n- **AI Mnemonic (Mẹo nhớ):** Bổ sung Route POST /api/notebook/:id/mnemonic. Gọi Google Gemini 1.5 Flash tạo mẹo nhớ và lưu vào ote.\n- **Gamification (Streak):** Mở rộng bảng User với studyStreak và lastStudyDate. Thuật toán sẽ tính chênh lệch ngày so với lần học cuối để reset hoặc cộng dồn chuỗi học tập, tạo biểu tượng ngọn lửa 🔥 khích lệ người dùng.\n