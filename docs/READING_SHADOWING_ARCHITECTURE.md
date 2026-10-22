# Thiết Kế Kiến Trúc & Hướng Dẫn Kỹ Thuật: Phân Hệ Đọc Hiểu & Shadowing Đa Phương Tiện

> **Dự án:** Nền tảng Học Tiếng Nhật Trực Tuyến Tích Hợp AI (NihonAI)  
> **Tác giả:** Đoàn Trần Mạnh Cường – Kỹ thuật Phần mềm K45, Trường ĐH Quy Nhơn  
> **Mã nguồn:** [github.com/doantranmanhcuong/nihonAI](https://github.com/doantranmanhcuong/nihonAI)  
> **Phiên bản tài liệu:** 2.5 (Cập nhật Tháng 10/2026 - Chuẩn hóa Dokkai & Shadowing Studio)

---

## 1. Tổng Quan 3 Tính Năng Cốt Lõi

Phân hệ được quy hoạch thành **Bounded Contexts độc lập (`reading-shadowing-service` và `shadowing-service`)**, chia thành 3 phân khu học tập chuyên sâu:

```
                               ┌────────────────────────────────────────────────────────┐
                               │   PHÂN HỆ: ĐỌC HIỂU & SHADOWING ĐA PHƯƠNG TIỆN         │
                               └───────────────────────────┬────────────────────────────┘
                                                           │
             ┌─────────────────────────────────────────────┼────────────────────────────────────────────┐
             ▼                                             ▼                                            ▼
   [1. Đọc Hiểu Dokkai Tương Tác]                [2. Tin Tức Báo Chí Song Ngữ]               [3. Shadowing & Chép Chính Tả Video]
   • Dán đoạn văn hoặc AI sinh theo yêu cầu      • Cào RSS tự động từ NHK, Mainichi, Yahoo   • Tải video YouTube & bài nghe hội thoại
   • 4 Cấp độ độ dài sát đề thi thật (N5-N1)     • Bản dịch song ngữ, âm thanh phát thanh    • Đồng bộ phụ đề timeline câu/từ (Karaoke)
   • 4 Dạng bài trắc nghiệm chuẩn JEES           • Cron Job 06:00 AM tự động chuẩn bị bài    • 2 Chế độ: Shadowing & Gõ chính tả
   • Bật/tắt Furigana & Tra cứu ngữ cảnh         • Tự động lưu CSDL (0 Token cho lượt sau)   • So khớp chuỗi Levenshtein tại Client (0 Token)
```

---

## 2. Chuẩn Hóa Độ Dài Bài Đọc Theo Cấu Trúc JLPT Dokkai Thực Tế

Hệ thống loại bỏ tình trạng sinh bài đọc tượng trưng quá ngắn hoặc quá dài gây tốn token, chuẩn hóa độ dài theo chuẩn Hiệp hội Hỗ trợ Giáo dục Quốc tế Nhật Bản (JEES):

| Cấp độ JLPT | Dạng bài thi Dokkai thực tế | Độ dài tiêu chuẩn (Ký tự Kana/Kanji) | Số từ ước tính | Số câu hỏi JLPT | Token ước tính / bài |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **N5** | Đoản văn đời sống (Email, tin nhắn, thông báo, nhật ký ngắn) | **100 - 180 ký tự** | 70 - 120 từ | **1 câu trắc nghiệm** | $\approx 250$ tokens |
| **N4** | Đoản văn chỉ dẫn (Thực đơn, chỉ đường, nội quy, mẩu chuyện ngắn) | **180 - 250 ký tự** | 120 - 180 từ | **2 câu trắc nghiệm** | $\approx 350$ tokens |
| **N3** | Đoản văn & Trung văn (Tản văn đời sống, so sánh thói quen) | **250 - 380 ký tự** | 180 - 260 từ | **2 - 3 câu trắc nghiệm** | $\approx 450$ tokens |
| **N2** | Trung văn luận thuyết (Bình luận xã hội, tâm lý học, bài báo) | **380 - 550 ký tự** | 260 - 380 từ | **3 câu trắc nghiệm** | $\approx 600$ tokens |
| **N1** | Trung văn / Trường văn (Triết học, văn hóa, phân tích phản biện) | **550 - 750 ký tự** | 380 - 520 từ | **3 - 4 câu trắc nghiệm** | $\approx 750$ tokens |

---

## 3. Bốn Dạng Câu Hỏi Đọc Hiểu Chuẩn Đề Thi JEES

Toàn bộ câu hỏi trắc nghiệm của bài đọc Dokkai được phân bổ đúng 4 dạng kinh điển của đề thi JLPT:
1. **Dạng 1 (Chỉ thị từ / Cụm từ gạch chân - 指示語・下線部):**  
   *Ví dụ:* `「【下線】...【/下線】」とあるが、どういう意味か／何を指しているか？`
2. **Dạng 2 (Lý do / Nguyên nhân - 理由・原因):**  
   *Ví dụ:* `なぜ筆者は「...」と言っているのか？その理由として最も適切なものはどれか？`
3. **Dạng 3 (Quan điểm / Ý chính của tác giả - 筆者の主張・言いたいこと):**  
   *Ví dụ:* `この文章で筆者が最も言いたいことは何か？`
4. **Dạng 4 (Nội dung phù hợp / Không phù hợp - 内容合致・不合致):**  
   *Ví dụ:* `本文の内容と合っているものはどれか？`

* **Cơ chế chống đoán mò:** 1 đáp án đúng kết hợp 3 phương án nhiễu có bẫy học thuật (sai lệch thông tin, suy diễn quá đà, nhầm lẫn chủ thể).
* **Lời giải chi tiết (`explanation`):** Giải thích bằng tiếng Việt, trích dẫn vị trí từ khóa trong bài (Keyword mapping) và phân tích nguyên nhân các đáp án còn lại bị loại trừ.

---

## 4. Quota Tạo Bài AI & Thư Viện Bài Đọc Dùng Chung (0 Token)

* **Hạn mức tài khoản:** Mỗi học viên được tạo tối đa **5 bài đọc AI / ngày** (reset vào 00:00 hàng ngày) thông qua bảng `reading_daily_quotas` và Redis `ratelimit:ai_reading`.
* **Cơ chế "Tạo 1 lần - Học ngàn lần" (Community Public Library):**
  * Tất cả các bài đọc sau khi AI phân tích đều được lưu trữ vĩnh viễn với cờ `isPublic: true`.
  * Các học viên khác khi truy cập cùng bài đọc sẽ tải dữ liệu trực tiếp từ MySQL / Redis Cache $\rightarrow$ **0 Token AI, tốc độ tải $< 30\text{ms}$**.

---

## 5. Shadowing & Chép Chính Tả Video (Dictation)

1. **Gõ chính tả (Typing Dictation):**
   * Học viên nghe audio từng câu và gõ lại bằng tiếng Nhật vào ô nhập liệu.
   * Nút con mắt ẩn/hiện câu mẫu gợi ý khi gặp câu quá khó.
   * Nút `[KIỂM TRA ĐÁP ÁN]` sử dụng thuật toán **Levenshtein Distance / Diff Match** chạy $100\%$ tại Client (Trình duyệt):
     - So khớp ký tự Kana/Kanji, chuẩn hóa khoảng trắng và dấu câu.
     - Highlight ký tự đúng (xanh lá) và ký tự sai/thiếu (đỏ).
     - Đếm số lỗi sai và số lượt phát lại âm thanh mà **hoàn toàn không tiêu tốn Token AI**.
2. **Ghép câu (Sentence Ordering):**
   * Xáo trộn các mảnh từ của câu tiếng Nhật.
   * Học viên nhấp chọn các khối từ theo đúng trật tự ngữ pháp.
   * Xử lý xác thực mảng index tại Client siêu tốc ($0\text{ms}$).

---

## 6. Kiến Trúc CSDL & Vòng Đời Dữ Liệu (Data Lifecycle Management)

### 6.1. Lược đồ Thực thể Phân Tầng ($1 - N$)
```prisma
model ReadingArticle {
  id              String             @id @default(uuid())
  title           String             @db.VarChar(255)
  sourceType      String             @default("AI_GENERATED") // AI_GENERATED, NHK_NEWS, YOUTUBE_VIDEO
  sourceUrl       String?            @db.Text
  youtubeId       String?            @db.VarChar(50)
  level           String             @default("N3")
  topic           String             @default("Đời sống")
  durationSeconds Int                @default(0)
  audioUrl        String?            @db.Text
  totalWords      Int                @default(0)
  isPublic        Boolean            @default(true)
  viewCount       Int                @default(0)
  savedCount      Int                @default(0)
  vocabSavedCount Int                @default(0)
  isEvergreen     Boolean            @default(false)
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt

  sentences       ReadingSentence[]
  vocabularies    ReadingVocabItem[]
  grammars        ReadingGrammarItem[]
  quizzes         ReadingQuiz[]

  @@index([sourceType, level])
  @@index([level, topic])
  @@map("reading_articles")
}
```

### 6.2. Thuật Toán Dọn Rác Tự Động (Garbage Collection Cron Job)
Hệ thống chạy Cron Job vào **04:00 AM mỗi ngày** để dọn dẹp các bài báo rác:
* **Tiêu chí xóa cứng (Hard Delete):** Bài báo cũ hơn 7 ngày (`createdAt < NOW - 7`) **VÀ** Lượt xem < 50 **VÀ** Không có ai lưu bài (`savedCount == 0`) **VÀ** Không ai lưu từ vựng (`vocabSavedCount == 0`) **VÀ** Không phải bài kinh điển (`isEvergreen == false`).
* **Bảo toàn CSDL (Cascade Deletion):** Khi bài báo bị xóa, toàn bộ câu (`ReadingSentence`), từ vựng (`ReadingVocabItem`), ngữ pháp (`ReadingGrammarItem`), trắc nghiệm (`ReadingQuiz`) tự động bị xóa theo nhờ `onDelete: Cascade`.
* **Bảo toàn Sổ tay (Notebook Integrity):** Các từ vựng/ngữ pháp mà học viên đã lưu vào Sổ tay cá nhân (`NotebookItem`) được lưu trữ độc lập nên không bao giờ bị mất dữ liệu.
