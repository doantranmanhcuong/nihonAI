# Hướng Dẫn Triển Khai Phân Hệ Sổ Tay Cá Nhân, Ngân Hàng Câu Sai & Toàn Hệ Thống

> **Tài liệu Kỹ thuật Bàn giao & Triển khai Hệ sinh thái NihonAI**  
> *Phiên bản:* 2.5 (Cập nhật Tháng 10/2026 - Chuẩn hóa Sổ tay Cá nhân, Ngân hàng Câu sai & Báo cáo Tiến độ)  
> *Mã nguồn:* [github.com/doantranmanhcuong/nihonAI](https://github.com/doantranmanhcuong/nihonAI)

---

## 1. Tổng Quan Kiến Trúc Toàn Hệ Thống

Hệ thống **NihonAI** được xây dựng theo kiến trúc phân tầng Bounded Contexts, tách biệt rõ ràng giữa Client UI, API Gateway, các dịch vụ nghiệp vụ độc lập, bộ nhớ đệm và CSDL quan hệ:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND CLIENT (NEXT.JS 16)                    │
│  - Port 3000 | Turbopack | React 19 | Tailwind CSS | Lucide Icons      │
│  - Phân hệ Sổ tay: Flashcard SRS 3D, Audio TTS làm sạch Furigana       │
│  - Phân hệ Ngân hàng câu sai: Thu gọn Accordion, so sánh lỗi sai trực quan│
│  - Phân hệ JLPT: 60 Bộ đề mô phỏng 2020-2025, Chấm điểm chuẩn 180      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / RESTful API
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 API GATEWAY & BOUNDED CONTEXTS (EXPRESS + TS)          │
│  - Port 5000 | Dynamic Route Dispatch | Consul Health Metric Tracker  │
│  - Middleware: JWT Dual-Token, Rate-Limiting, RBAC Middleware          │
│  - Bounded Contexts:                                                   │
│    + /api/notebook    : Sổ tay cá nhân, Ngân hàng câu sai & Thuật toán SRS│
│    + /api/exam        : Kho 60 đề thi JLPT, Chấm điểm 180 & Audio Choukai │
│    + /api/vocabulary  : Giáo trình Minna, Tango, Mimikara & Thử thách đặt câu│
│    + /api/kanji       : 2.138 Hán tự, Nhận diện Canvas & Đồ thị bộ thủ │
│    + /api/reading     : Đọc hiểu Dokkai & Trình cào tin tức tự động RSS│
│    + /api/shadowing   : Luyện nghe nhại âm & Chép chính tả video YouTube│
│    + /api/auth        : Xác thực JWT, Google OAuth2 & Token Versioning │
│    + /api/admin       : Quản trị User, Kiểm tra điểm số thi & Giám sát AI│
│    + /api/ai          : Trợ giảng thông minh Gemini AI                │
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

## 2. Phân Hệ Sổ Tay Cá Nhân & Ngân Hàng Câu Sai

### 2.1. Cấu Trúc Bảng CSDL MySQL (`notebook_items`)
Bảng được định nghĩa tối ưu trong Prisma Schema hỗ trợ cả ghi chú cá nhân lẫn thuật toán lặp lại ngắt quãng (SM-2):

```prisma
model NotebookItem {
  id             String    @id @default(uuid())
  userId         String    // Ràng buộc User (Chống IDOR, Cascade Delete)
  itemType       String    @db.VarChar(20) // "VOCAB", "KANJI", "GRAMMAR", "NOTE"
  title          String    @db.VarChar(255) // Từ vựng / Hán tự / Mẫu ngữ pháp / Tiêu đề
  reading        String?   @db.VarChar(255) // Hiragana / Âm Hán Việt / Romaji
  meaningVi      String    @db.Text         // Nghĩa tiếng Việt
  level          String    @default("N3") @db.VarChar(10) // N5, N4, N3, N2, N1
  structure      String?   @db.Text         // Cấu trúc ngữ pháp (nếu là GRAMMAR)
  exampleJp      String?   @db.Text         // Câu ví dụ tiếng Nhật
  exampleVi      String?   @db.Text         // Dịch nghĩa câu ví dụ
  note           String?   @db.Text         // Ghi chú cá nhân / Phân tích bẫy thi
  tags           String?   @db.VarChar(255) // Thẻ phân loại (e.g. "Đề thi JLPT N2, Bẫy trợ từ")
  masteryStatus  String    @default("LEARNING") @db.VarChar(20) // "LEARNING", "REVIEWING", "MASTERED"
  reviewCount    Int       @default(0)      // Số lần đã luyện tập
  lastReviewedAt DateTime?                  // Thời điểm ôn tập gần nhất
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  easeFactor     Float     @default(2.5)    // Hệ số độ khó SM-2 (mặc định 2.5)
  interval       Int       @default(1)      // Khoảng cách ngày ôn tập tiếp theo
  nextReviewAt   DateTime  @default(now())  // Ngày đến hạn ôn tập kế tiếp

  user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, itemType])
  @@index([userId, masteryStatus])
  @@index([userId, level])
  @@index([createdAt])
  @@index([userId, nextReviewAt])
  @@map("notebook_items")
}
```

### 2.2. Các Tính Năng Nổi Bật của Sổ Tay Cá Nhân
1. **Quản lý 4 nhóm nội dung chuyên sâu:**
   - **Từ vựng (VOCAB):** Lưu từ, cách đọc Kana, âm Hán Việt, câu ví dụ song ngữ, phát âm âm thanh 1-chạm.
   - **Hán tự (KANJI):** Lưu chữ Hán, âm Hán Việt, Onyomi, Kunyomi, số nét và mẹo chiết tự.
   - **Ngữ pháp (GRAMMAR):** Lưu cấu trúc cú pháp, ý nghĩa, câu ví dụ văn cảnh và nút phân tích chuyên sâu qua AI.
   - **Ghi chú tự do (NOTE):** Lưu mẹo làm bài thi, lưu ý phân biệt trợ từ, quy tắc phát âm.
2. **Thuật toán Lặp lại Ngắt quãng (Spaced Repetition System - SM-2):**
   - 3 trạng thái ghi nhớ: `LEARNING` (Đang học) $\rightarrow$ `REVIEWING` (Cần ôn tập) $\rightarrow$ `MASTERED` (Đã thuộc).
   - API `/api/notebook/due`: Lấy tự động danh sách các thẻ đến hạn ôn tập dựa theo `nextReviewAt <= NOW()`.
   - API `/api/notebook/:id/review`: Nhận đánh giá chất lượng (quality: 0 đến 5) từ người học, tự động tính toán lại `easeFactor` và `interval` mới theo thuật toán SuperMemo-2.
3. **Chế độ Luyện tập Flashcard 3D Toàn màn hình:**
   - Lật thẻ 2 mặt mượt mà với hoạt họa 3D CSS.
   - Phát âm tiếng Nhật chuẩn bản xứ bằng Web Speech API (đã được khử sạch thẻ Furigana `<rt>` để không bị lặp tiếng).
   - Đánh giá nhanh 3 nút: Chưa thuộc (0) / Cần ôn (3) / Đã thuộc (5) cập nhật CSDL ngay lập tức.
4. **Bộ lọc & Tìm kiếm Thời gian thực:**
   - Lọc đa tiêu chí: Loại nội dung, Cấp độ JLPT (N5-N1), Trạng thái ghi nhớ SRS.
   - Tìm kiếm từ khóa theo cả tiếng Nhật và tiếng Việt có chỉ mục tốc độ cao.

---

## 3. Phân Hệ Ngân Hàng Câu Hỏi Làm Sai (Mistake Bank)

### 3.1. Cơ Chế Thu Gom Tự Động Từ Đề Thi
* Ngay khi thí sinh nộp bài thi JLPT, màn hình Kết quả bài thi tổng hợp toàn bộ các câu hỏi làm sai.
* Nút **"Lưu tất cả câu sai vào Sổ tay"** tự động chuyển đổi các câu trắc nghiệm sai thành các mục ghi chú trong Sổ tay với đầy đủ:
  - Tiêu đề câu hỏi, 4 phương án lựa chọn.
  - Đáp án bạn đã chọn sai và Đáp án đúng chuẩn của đề thi.
  - Bản dịch tiếng Việt và lời giải chi tiết giải thích bẫy thi từ giảng viên/AI.

### 3.2. Trải Nghiệm Giao Diện Accordion Thu Gọn (Anti-Fatigue Design)
* **Vấn đề thực tế:** Khi thí sinh làm sai 20–50 câu hỏi trong một đề thi dài, việc hiển thị toàn bộ 4 đáp án và lời giải của tất cả các câu sẽ khiến trang web bị kéo dài hàng chục ngàn pixel, gây rối mắt và mệt mỏi khi duyệt lại.
* **Giải pháp Accordion Compact:**
  - Mặc định hiển thị dạng thanh tóm tắt thu gọn gồm số thứ tự câu, phân môn, và 2 huy hiệu so sánh trực quan:
    * `✕ Bạn chọn: [Phương án đã chọn]` (Màu đỏ).
    * `🎯 Đáp án đúng: [Phương án đúng]` (Màu xanh lục).
  - Nút **"Xem chi tiết"** cho phép mở bung nội dung từng câu khi người học muốn xem bài đọc hoặc phân tích ngữ pháp.
  - Nút chuyển đổi toàn cục **"Mở rộng tất cả / Thu gọn tất cả"** linh hoạt.

---

## 4. Báo Cáo Tiến Độ & Quản Trị Hệ Thống (Admin & User Progress)

### 4.1. Trang Thông Tin Cá Nhân (UserProfileView)
* Lựa chọn Avatar linh hoạt từ bộ nhận diện Bottts.
* Cập nhật Cấp độ Mục tiêu JLPT (N5 $\rightarrow$ N1).
* Thống kê Chuỗi ngày học liên tục (Study Streak).
* Bảng thống kê số lượng thẻ SRS theo từng trạng thái (Đang học, Cần ôn, Đã thuộc).
* **Bảng Lịch sử Thi JLPT Gần đây:** Hiển thị tên đề thi, cấp độ, số điểm đạt được / 180, trạng thái Đỗ/Trượt và ngày giờ thi.

### 4.2. Cổng Quản Trị Viên (Admin Portal - `/admin`)
* **Bảo mật truy cập:** Được bảo vệ bởi Middleware `authorizeRole(['ADMIN'])`.
* **Quản lý Học viên:** Xem danh sách toàn bộ người dùng, chuyển đổi phân quyền (`USER` $\leftrightarrow$ `ADMIN`), khóa tài khoản vi phạm (`SUSPENDED`, `BANNED`).
* **Thanh tra Kết quả Thi của Học viên:**
  - Khi click vào bất kỳ học viên nào trong danh sách, quản trị viên có thể xem trực tiếp toàn bộ lịch sử thi cử của học viên đó (`/api/admin/users/:id/progress`).
  - Ghi nhận chi tiết: Tên bài thi, Cấp độ, Điểm tổng kết / 180, Đỗ hay Trượt, và Ngày giờ làm bài thi.
* **Quản trị Nội dung:** Xóa/Duyệt bài đọc Dokkai, bài nghe Shadowing, nạp câu hỏi hàng loạt qua Excel.
* **AI Console & Giám sát:** Điều chỉnh System Prompts và xem nhật ký Token sử dụng của Gemini AI.

---

## 5. Quy Trình Cài Đặt & Triển Khai

### 5.1. Khởi Chạy Môi Trường Cục Bộ
1. Mở CSDL MySQL trên XAMPP (Port 3306).
2. Khởi chạy Redis Server (Port 6379).
3. Tại thư mục `server/`:
   ```powershell
   npm install
   npx prisma generate
   npx prisma db push
   npm run dev
   ```
4. Tại thư mục `client/`:
   ```powershell
   npm install
   npm run dev
   ```

### 5.2. Bảo Mật Biến Môi Trường Khi Đẩy Lên GitHub
* Toàn bộ các API Keys (`GEMINI_*`), chuỗi kết nối CSDL (`DATABASE_URL`) và khóa bí mật (`JWT_SECRET`) bắt buộc phải đặt trong file `.env` và nằm trong danh sách loại trừ của `.gitignore`.
* Tuyệt đối không hardcode khóa API trong mã nguồn hoặc commit vào lịch sử Git.
