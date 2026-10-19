> 🚀 **[CẬP NHẬT GIAI ĐOẠN 4 - VÁ LỖI ORPHAN DATA & BẢO MẬT ĐẦU CUỐI]**
> - **Vá lỗi Data Leak (Orphan Data):** Bảng ReadingDailyQuota đã được thiết lập Khóa ngoại cứng với bảng User. Chạy onDelete: Cascade dọn sạch sẽ hạn mức ngay khi User xóa tài khoản.
> - **Bảo mật Router:** Phủ Middleware authenticateToken lên toàn bộ các API lấy Quota, sinh bài tập AI.
> - **AI Pooling System:** Tích hợp 7 Keys Gemini luân phiên, chịu tải sinh bài đọc cực mạnh mà không bị chặn Rate Limit.



## KIẾN TRÚC QUẢN LÝ DỮ LIỆU & VÒNG ĐỜI (DATA LIFECYCLE MANAGEMENT)
Vì hệ thống Đọc Báo (Dokkai) liên tục cào dữ liệu từ NHK/Yahoo và sinh ra các file Âm thanh chất lượng cao (Azure Neural TTS), nếu không có cơ chế Garbage Collection (Dọn rác), CSDL và Ổ cứng lưu trữ sẽ nhanh chóng cạn kiệt.

### 1. Cấu trúc CSDL Đánh Giá Giá Trị Bài Báo (Value Metrics)
Bảng `ReadingArticle` được bổ sung các Counter để đo lường độ phổ biến và giá trị giữ lại của bài báo:
- `viewCount`: Số lượt xem bài.
- `savedCount`: Số người dùng đã bấm Yêu Thích bài báo này.
- `vocabSavedCount`: Số lượng từ vựng/ngữ pháp được người học bóc tách và lưu vào Sổ Tay.
- `isEvergreen`: Đánh dấu cờ (Flag) cho các bài báo kinh điển không bao giờ xóa.

### 2. Thuật toán Dọn Rác Tự Động (Garbage Collection Cron Job)
Hệ thống chạy Cron Job vào 04:00 Sáng mỗi ngày để dọn dẹp các bài báo rác:
- **Tiêu chí xóa cứng (Hard Delete):** Bài báo cũ hơn 7 ngày (`createdAt < NOW - 7`) **VÀ** Lượt xem < 50 **VÀ** Không có ai lưu bài (`savedCount == 0`) **VÀ** Không ai lưu từ vựng (`vocabSavedCount == 0`) **VÀ** Không phải bài kinh điển (`isEvergreen == false`).
- **Bảo toàn CSDL (Cascade Deletion):** Nhờ cơ chế `onDelete: Cascade` trong Schema, khi xóa `ReadingArticle`, toàn bộ rác liên quan như Câu (Sentence), Từ vựng (Vocab), Ngữ pháp (Grammar), Câu hỏi (Quiz) sẽ tự động bị xóa sạch khỏi CSDL.
- **Dọn Ổ Cứng (Storage Cleanup):** Trước khi xóa CSDL, Backend sẽ dùng lệnh `fs.unlinkSync()` để truy tìm và xóa vĩnh viễn file MP3 Audio tương ứng trong thư mục `public/reading-audio/`.

### 3. Nguyên tắc Bảo Toàn Sổ Tay (Notebook Integrity)
- Điểm mấu chốt là Sổ Tay (`NotebookItem`) được lưu trữ **độc lập** với bảng Bài Báo.
- Khi người dùng lưu một từ vựng, hệ thống sẽ copy luôn **Câu Ví Dụ Context** vào bảng Sổ Tay, và cộng +1 vào `vocabSavedCount` của Bài báo.
- Nhờ vậy, bài báo này sẽ miễn nhiễm với thuật toán xóa rác. Nếu vì lý do bất khả kháng bài báo bị xóa đi, thẻ nhớ Flashcard của người dùng vẫn hoạt động 100% nhờ data đã được cô lập.


## PHASE 2: TÍNH NĂNG ĐỌC BÁO NÂNG CAO (COMPLETED)
1. **Lưu Sổ tay (Notebook Integration)**
   - Người dùng bôi đen văn bản để tra cứu (Contextual AI).
   - Có thể lưu từ vựng hoặc điểm ngữ pháp vào Sổ tay cá nhân (NotebookItem) cho SRS.
   - Tích hợp trực tiếp trên DokkaiSidebar và QuickLookupPopover.
2. **Contextual Explain (API)**
   - API `/api/reading/translate-selection` dịch chính xác theo ngữ cảnh của câu chứa nó.
3. **Heatmap & Smart Furigana**
   - Phân tích bôi màu JLPT Level (Heatmap) và bộ lọc Furigana.

# Thiết Kế Kiến Trúc & Hướng Dẫn Kỹ Thuật: Phân Hệ "Đọc Hiểu & Shadowing Đa Phương Tiện"

> **Dự án:** Nền tảng Học Tiếng Nhật Trực Tuyến Ứng Dụng AI (NihonAI)  
> **Tác giả:** Đoàn Trần Mạnh Cường – Kỹ thuật Phần mềm K45, Trường ĐH Quy Nhơn  
> **Mục tiêu:** Xây dựng phân hệ Luyện Đọc hiểu & Shadowing đa phương tiện (Văn bản $\le 1000$ từ, Báo song ngữ NHK và Video YouTube $\le 30$ phút) đạt chuẩn Kỹ thuật phần mềm xuất sắc.

---

## PHẦN 1: Tổng Quan 3 Tính Năng Cốt Lõi (Theo 7 Ảnh Giao Diện)

Phân hệ được quy hoạch thành một **Bounded Context độc lập: `reading-shadowing-service`**, chia thành 3 phân khu học tập chuyên sâu:

```
                               ┌────────────────────────────────────────────────────────┐
                               │   PHÂN HỆ: ĐỌC HIỂU & SHADOWING ĐA PHƯƠNG TIỆN         │
                               └───────────────────────────┬────────────────────────────┘
                                                           │
             ┌─────────────────────────────────────────────┼────────────────────────────────────────────┐
             ▼                                             ▼                                            ▼
   [1. Đọc Hiểu & Shadowing Văn Bản]             [2. Đọc Báo Song Ngữ NHK]                   [3. Shadowing & Chép Chính Tả Video]
   • Người dùng dán đoạn văn <= 1000 từ          • Tin tức thời sự Nhật Bản chuẩn            • Dán link YouTube bất kỳ (<= 30 phút)
   • AI tự sinh bài đọc theo yêu cầu (Chủ        • Audio giọng chuẩn phát thanh viên NHK     • Tách timeline từng câu kèm bản dịch
     đề, Cấp độ N5-N1, Độ dài mong muốn)         • Bóc tách Từ vựng & Ngữ pháp trong bài     • 2 Chế độ: Bắt chước phát âm (Shadowing)
   • Đồng bộ Karaoke audio câu & từ sáng         • Bài tập đọc hiểu JLPT đi kèm                & Nghe - Viết chính tả (Dictation)
   • Kiểm tra đọc hiểu 3 câu trắc nghiệm
```

---

## PHẦN 2: Giải Đáp Về Quản Lý API Key & Chiến Lược Gọi AI Tối Ưu Hạn Ngạch

### 1. Có cần tạo API Key riêng cho cả 3 tính năng không?
> [!IMPORTANT]
> **ĐỀ XUẤT TỐI ƯU:** Bạn **KHÔNG CẦN tạo 3 key riêng cho 3 tính năng này**, mà **CHỈ CẦN 1 KEY DUY NHẤT** cho toàn bộ phân hệ: `GEMINI_KEY_SHADOWING`!

* **Lý do kỹ thuật:**
  1. **Tính năng 1 (Văn bản) & Tính năng 2 (Báo chí):** Bản chất xử lý Backend là **dùng chung $100\%$ cùng 1 Service**: `ReadingAnalysisEngine`. Cả hai đều nhận văn bản tiếng Nhật và cùng thực hiện bóc tách: *Từ vựng + Ngữ pháp + Trắc nghiệm + Dịch song ngữ*.
  2. **Tính năng 3 (Video YouTube):**
     * Với video YouTube, phụ đề tiếng Nhật gốc được trích xuất trực tiếp qua YouTube Transcript API $\rightarrow$ **Tiêu tốn $0\text{ token}$ AI**!
     * AI chỉ được gọi khi video đó là video mới toanh chưa có phụ đề tiếng Việt để dịch câu và lọc 5 từ vựng/ngữ pháp nổi bật.
  3. **Quy hoạch tổng thể toàn hệ thống:**
     * Project 1: `GEMINI_KEY_KANJI` (Hán tự & Chiết tự) $\rightarrow 15\text{ RPM} / 1.500\text{ RPD}$.
     * Project 2: `GEMINI_KEY_VOCAB` (Từ vựng & Đặt câu) $\rightarrow 15\text{ RPM} / 1.500\text{ RPD}$.
     * Project 3: `GEMINI_KEY_SHADOWING` (Đọc hiểu & Video) $\rightarrow 15\text{ RPM} / 1.500\text{ RPD}$.
     $\rightarrow$ Tổng cộng: **$45\text{ RPM}$ và $4.500\text{ requests/ngày}$**, cực kỳ an toàn, cách ly tải hoàn hảo!

---

### 2. Chuẩn Hóa Độ Dài Bài Đọc Theo Cấu Trúc JLPT Dokkai Thực Tế
Thay vì cho phép tạo/dán văn bản tự do tới 1000 từ gây tốn token và không sát đề thi, hệ thống chuẩn hóa độ dài theo cấu trúc đề thi chính thức của Hiệp hội Hỗ trợ Giáo dục Quốc tế Nhật Bản (JEES):

| Cấp độ JLPT | Dạng bài thi Dokkai thực tế | Độ dài tiêu chuẩn (Ký tự Kana/Kanji) | Số từ ước tính | Số câu hỏi JLPT | Token ước tính / bài |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **N5** | Đoản văn đời sống (Email, tin nhắn, thông báo, nhật ký ngắn) | **100 - 180 ký tự** | 70 - 120 từ | **1 câu trắc nghiệm** | $\approx 250$ tokens |
| **N4** | Đoản văn chỉ dẫn (Thực đơn, chỉ đường, nội quy, mẩu chuyện ngắn) | **180 - 250 ký tự** | 120 - 180 từ | **2 câu trắc nghiệm** | $\approx 350$ tokens |
| **N3** | Đoản văn & Trung văn (Tản văn đời sống, so sánh thói quen, giải thích văn hóa) | **250 - 380 ký tự** | 180 - 260 từ | **2 - 3 câu trắc nghiệm** | $\approx 450$ tokens |
| **N2** | Trung văn luận thuyết (Bình luận xã hội, tâm lý học, công sở, bài báo ngắn) | **380 - 550 ký tự** | 260 - 380 từ | **3 câu trắc nghiệm** | $\approx 600$ tokens |
| **N1** | Trung văn / Trường văn (Triết học, chuyên luận văn hóa, phân tích phản biện) | **550 - 750 ký tự** | 380 - 520 từ | **3 - 4 câu trắc nghiệm** | $\approx 750$ tokens |

> [!TIP]
> **Hiệu quả tối ưu:** Tiết kiệm hơn **$65\%$ lượng token** so với bài 1000 từ, thời gian sinh văn bản bằng `gemini-3.5-flash-lite` giảm xuống chỉ còn **$1.2\text{s} - 2.5\text{s}$**, phản hồi mượt mà không lo timeout.

---

### 3. Soạn Câu Hỏi Đọc Hiểu Chuẩn Đề Thi Thật (4 Dạng Dokkai Chuẩn JEES)
Câu hỏi trắc nghiệm không sinh vu vơ mà tuân thủ đúng 4 dạng bài kinh điển của kỳ thi JLPT:
1. **Dạng 1 (Chỉ thị từ / Cụm từ gạch chân - 指示語・下線部):**  
   *Ví dụ:* `「【下線】...【/下線】」とあるが、どういう意味か／何を指しているか？`
2. **Dạng 2 (Lý do / Nguyên nhân - 理由・原因):**  
   *Ví dụ:* `なぜ筆者は「...」と言っているのか？その理由として最も適切なものはどれか？`
3. **Dạng 3 (Quan điểm / Ý chính của tác giả - 筆者の主張・言いたいこと):**  
   *Ví dụ:* `この文章で筆者が最も言いたいことは何か？`
4. **Dạng 4 (Nội dung phù hợp / Không phù hợp - 内容合致・不合致):**  
   *Ví dụ:* `本文の内容と合っているものはどれか？ (hoặc 合っていないものはどれか？)`

* **4 lựa chọn có tính gây nhiễu chuẩn đề thi thật:** 1 đáp án đúng + 3 bẫy kinh điển (sai lệch thông tin trong bài, thông tin bài không nhắc tới, hoặc kết luận suy diễn quá đà).
* **Trường `explanation`:** Giải thích chi tiết bằng tiếng Việt, trích dẫn câu chứa từ khóa trong bài (Keyword mapping) và giải thích vì sao 3 đáp án còn lại là bẫy.

---

### 4. Cơ Chế Quota Nghiêm Ngặt 5 Bài/Ngày & Cảnh Báo Trực Quan
* **Hạn mức:** Mỗi tài khoản người dùng được tạo tối đa **5 bài đọc AI / ngày** (reset vào 00:00 hàng ngày).
* **Kỹ thuật thực hiện:**
  * Khóa Redis: `ratelimit:ai_reading:{userId}:{YYYYMMDD}` với TTL 86.400s (24h), tăng nguyên tử `INCR`.
  * Fallback (khi không bật Redis): Đếm bản ghi trong bảng `reading_articles` theo `createdBy = userId` và `createdAt >= startOfDay`.
* **Giao diện người dùng:**
  * Thanh đo tiến trình Quota: `✨ Hạn mức tạo AI hôm nay: 2/5 bài (Còn lại 3 lượt)`.
  * Khi chạm mốc 5 bài: Nút `[Tạo bài đọc AI]` chuyển màu xám và vô hiệu hóa (Disabled). Hiển thị banner hướng dẫn: *"Bạn đã sử dụng hết 5 lượt tạo bài đọc AI hôm nay. Hãy tiếp tục luyện tập không giới hạn với hàng trăm bài đọc sẵn có trong Thư viện bài mẫu (Hoàn toàn miễn phí)!"*.

---

### 5. Tối Ưu CSDL: "Community Shared Public Library" (Kho Bài Đọc Dùng Chung - 0 Token)
* **Nguyên lý "Tạo 1 lần, Học ngàn lần":**
  * Mọi bài đọc do AI tạo (hoặc bài đọc admin nạp sẵn) đều được lưu vào CSDL với cờ `isPublic: true`.
  * Giao diện có 2 tab rõ ràng:
    * **Tab 1: Thư viện bài đọc JLPT (0 Token):** Kho bài mẫu phân loại theo Level N5-N1 và Chủ đề. Người học vào chọn học ngay $\rightarrow$ **Truy vấn từ MySQL / Redis cache, tiêu tốn $0\text{ token}$ AI, tốc độ tải $< 30\text{ms}$!**
    * **Tab 2: AI Studio (Tự tạo bài mới):** Chỉ dành cho khi muốn tạo chủ đề riêng biệt $\rightarrow$ Mới tiêu tốn 1 lượt trong hạn ngạch 5 bài/ngày. Sau khi sinh xong, bài đó lại tự động bổ sung vào Thư viện chung cho cộng đồng học!
* **Gợi ý chống trùng lặp (Duplicate Warning):**
  * Nếu người dùng nhập chủ đề đã có nhiều bài trong thư viện (ví dụ: N3 chủ đề "Văn hóa Trà đạo"), hệ thống sẽ gợi ý: *"Thư viện đã có 3 bài đọc N3 về chủ đề này. Bạn có muốn học ngay để tiết kiệm lượt tạo hôm nay?"*.

---

### 6. Tối Ưu Tính Năng Chép Chính Tả (Dictation) & Ghép Câu ($0\text{ Token}$ AI)
Dựa trên 2 ảnh chụp thực tế màn hình Chép chính tả:
* **Chế độ [Gõ chính tả] (Typing Dictation):**
  * Hộp nhập liệu text, nút con mắt ẩn/hiện câu mẫu gợi ý (`お前もうんこやからな。`).
  * Nút `[KIỂM TRA ĐÁP ÁN]`:
    * Thuật toán so khớp chuỗi **Levenshtein Distance / Diff Match** chạy $100\%$ tại Client (Trình duyệt).
    * Chuẩn hóa Unicode, Full-width / Half-width Kana, so khớp Kana/Kanji.
    * Đổi màu trực quan: Ký tự đúng (Xanh lá), Ký tự sai/thiếu (Đỏ).
    * Tự động tính: `Lỗi sai: X`, `Lượt phát lại: Y`.
    * **Tiêu tốn $0\text{ token}$ AI, thời gian phản hồi $0\text{ms}$!**
* **Chế độ [Ghép câu] (Sentence Scramble):**
  * Xáo trộn các từ vựng trong câu gốc. Người học bấm chọn các block từ theo thứ tự.
  * Kiểm tra mảng index trên Client $\rightarrow$ **$0\text{ token}$ AI**.

---

## PHẦN 3: Kiến Trúc CSDL Chống Phình To & Tránh Lạm Dụng Redis

Bài toán lớn: Một bài đọc 1000 từ hoặc video 30 phút có hàng chục câu, hàng trăm từ vựng. Nếu thiết kế sai:
* Ném tất cả JSON to đùng vào Redis $\rightarrow$ Tràn RAM Redis (`OOM - Out of Memory`), hệ thống bị crash!
* Ném tất cả vào 1 cột Text duy nhất trong MySQL $\rightarrow$ Row size vượt quá 64KB, bảng bị khóa nặng nề.

### 1. Kiến Trúc CSDL Chuẩn Hóa Phân Tầng (Normalized Relational Schema)
Toàn bộ vẫn nằm trong **1 CSDL duy nhất `japanese_learning_db` trên MySQL XAMPP**, nhưng phân thành các bảng quan hệ 1 - Nhiều ($1 - N$) có khóa ngoại rõ ràng:

```prisma
// 1. Bảng bài đọc / Video (Metadata nhẹ)
model ReadingArticle {
  id              String             @id @default(uuid())
  title           String             @db.VarChar(255)
  sourceType      String             @default("USER_TEXT") // USER_TEXT, AI_GENERATED, NHK_NEWS, YOUTUBE_VIDEO
  sourceUrl       String?            @db.Text             // Link bài báo hoặc link YouTube
  youtubeId       String?            @db.VarChar(50)      // e.g. "dQw4w9WgXcQ"
  level           String             @default("N3")       // N5, N4, N3, N2, N1
  durationSeconds Int                @default(0)          // Thời lượng audio/video (giây)
  audioUrl        String?            @db.Text             // URL file audio mp3 (nếu có)
  totalWords      Int                @default(0)
  createdAt       DateTime           @default(now())

  sentences       ReadingSentence[]
  vocabularies    ReadingVocabItem[]
  grammars        ReadingGrammarItem[]
  quizzes         ReadingQuiz[]

  @@index([sourceType, level])
  @@map("reading_articles")
}

// 2. Bảng từng câu đồng bộ Timeline (Phục vụ Karaoke Highlight & Shadowing)
model ReadingSentence {
  id              String         @id @default(uuid())
  articleId       String
  orderIndex      Int            // Thứ tự câu: 1, 2, 3...
  sentenceJp      String         @db.Text
  sentenceVi      String         @db.Text
  furigana        String?        @db.Text
  startTimeMs     Int            @default(0)          // Thời điểm bắt đầu câu (mili giây)
  endTimeMs       Int            @default(0)          // Thời điểm kết thúc câu (mili giây)
  article         ReadingArticle @relation(fields: [articleId], references: [id], onDelete: Cascade)

  @@index([articleId, orderIndex])
  @@map("reading_sentences")
}

// 3. Bảng từ vựng trọng điểm bóc tách từ bài
model ReadingVocabItem {
  id              String         @id @default(uuid())
  articleId       String
  word            String         @db.VarChar(100)
  reading         String         @db.VarChar(100)
  hanViet         String?        @db.VarChar(100)
  meaningVi       String         @db.VarChar(255)
  level           String?        @db.VarChar(10)
  article         ReadingArticle @relation(fields: [articleId], references: [id], onDelete: Cascade)

  @@index([articleId])
  @@map("reading_vocab_items")
}

// 4. Bảng mẫu ngữ pháp có trong bài
model ReadingGrammarItem {
  id              String         @id @default(uuid())
  articleId       String
  grammarPoint    String         @db.VarChar(150)
  level           String?        @db.VarChar(10)
  meaningVi       String         @db.VarChar(255)
  excerpt         String         @db.Text
  article         ReadingArticle @relation(fields: [articleId], references: [id], onDelete: Cascade)

  @@index([articleId])
  @@map("reading_grammar_items")
}

// 5. Bảng câu hỏi trắc nghiệm đọc hiểu JLPT
model ReadingQuiz {
  id              String         @id @default(uuid())
  articleId       String
  question        String         @db.Text
  optionsJson     String         @db.Text             // Mảng 4 lựa chọn (JSON string)
  correctIndex    Int            @default(0)          // Đáp án đúng (0, 1, 2, 3)
  explanation     String?        @db.Text
  article         ReadingArticle @relation(fields: [articleId], references: [id], onDelete: Cascade)

  @@index([articleId])
  @@map("reading_quizzes")
}
```

---

### 2. Chiến Lược Dùng Redis Thông Minh (Không Lạm Dụng RAM)
* **Quy tắc 1 (Tiered Storage - Phân Tầng Bộ Nhớ):**
  * **MySQL:** Lưu trữ vĩnh viễn $100\%$ toàn bộ bài viết, các câu phụ đề, bài tập trắc nghiệm.
  * **Redis:** **CHỈ LƯU các bài viết HOT** (Ví dụ: 10 bài báo NHK mới nhất trong ngày, 5 video bài học mặc định). TTL đặt ngắn gọn: **24 giờ**.
* **Quy tắc 2 (Không Cache Dữ Liệu Tạm Của Cá Nhân):**
  * Với bài viết do người dùng tự dán hoặc video người dùng tự nhập: Chỉ lưu vào MySQL.
  * Khi người dùng mở học, truy vấn MySQL qua chỉ mục B-Tree `articleId` chỉ mất **$2 - 4\text{ms}$** $\rightarrow$ Không cần tốn bộ nhớ RAM của Redis cho dữ liệu mà người khác không bao giờ xem!
* **Quy tắc 3 (Nén Dữ Liệu Trước Khi Cache):**
  * Chỉ cache bản ghi tổng hợp rút gọn (Metadata), không cache video streaming vào Redis.

---

## PHẦN 4: Giải Pháp Đồng Bộ Karaoke Chữ Sáng Theo Âm Thanh (Audio-Text Sync)

Làm sao để khi âm thanh đọc đến đâu, câu và từ sáng đến đó như trong **Ảnh 2** và **Ảnh 3**?

### 1. Đối với Văn bản & Bài báo (Text Dokkai):
* Sử dụng **Web Speech API (SpeechSynthesisUtterance)** có sẵn $100\%$ trên mọi trình duyệt:
  * Sự kiện `utterance.onboundary`: Trả về chính xác chỉ số ký tự (`charIndex`) của từ đang được phát âm $\rightarrow$ Giao diện Client đổi màu chữ ngay tức khắc ($0\text{ms}$ độ trễ, không cần tải file mp3 nặng hàng chục MB)!
  * Tích hợp chế độ `Lặp câu`: Khi kết thúc câu hiện tại, gọi lại `speechSynthesis.speak()` cho câu đó nếu nút Lặp đang bật.

### 2. Đối với Video YouTube (Shadowing Video $\le 30$ phút):
* Sử dụng **YouTube IFrame Player API (`window.YT.Player`)**:
  * Đọc thời gian phát hiện tại `player.getCurrentTime()`.
  * Khớp với mảng timeline câu: `sentences.find(s => currentTime >= s.startTimeMs/1000 && currentTime <= s.endTimeMs/1000)`.
  * Câu nào khớp thời gian thì tự động cuộn (Auto-scroll) danh sách phụ đề bên phải và sáng lên như trong **Ảnh 3**!

---

## PHẦN 5: Lộ Trình Triển Khai (Action Plan)

1. **Bước 1 (CSDL):** Bổ sung các Model `ReadingArticle`, `ReadingSentence`, `ReadingVocabItem`, `ReadingGrammarItem`, `ReadingQuiz` vào `server/prisma/schema.prisma` $\rightarrow$ Chạy `npx prisma db push`.
2. **Bước 2 (Backend Service & AI):**
   * Xây dựng `server/src/services/reading/reading-ai.service.ts` với mô hình Single-Pass Prompt bằng `gemini-3.5-flash-lite`.
   * Tạo route xử lý dán bài, sinh bài theo yêu cầu, bóc tách báo chí và video YouTube.
3. **Bước 3 (Frontend UI - 2 Cột Chuyên Nghiệp):**
   * Xây dựng Component `ReadingStudio.tsx` với giao diện 2 cột chuẩn xác theo 7 ảnh bạn gửi.
   * Cột trái: Trình phát Audio / Video + Bài đọc Karaoke + Trắc nghiệm Đọc hiểu.
   * Cột phải: Từ vựng trọng điểm + Mẫu ngữ pháp trong bài (Click mở liên kết Hán tự / Từ vựng).
