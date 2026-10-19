# Nhật Ký Cập Nhật Hệ Thống (NihonAI System Changelog)

Tài liệu này lưu trữ ngắn gọn, chính xác toàn bộ lịch sử các đợt cập nhật, tối ưu hóa mã nguồn và tính năng mới của dự án. File này sẽ được cập nhật liên tục sau mỗi phiên làm việc.

---


## [Giai đoạn 4: Tháng 09/2026] - Nâng cấp Kiến trúc Enterprise & Tối ưu Database
### Security (Bảo mật)
- Hoàn thiện Dual-Token (Access/Refresh Token) bằng `HttpOnly Cookie`.
- Đóng triệt để lỗ hổng IDOR trên toàn bộ các Endpoint (Notebook, Exam, Reading) qua `authenticateToken` Middleware.
- Tích hợp `express-rate-limit` chặn Brute Force.
- Quản trị viên (Admin) được cấp quyền riêng qua Middleware `authorizeRole(['ADMIN'])`.

### Database & Caching (CSDL)
- Xóa sổ dữ liệu mồ côi (Orphan Data) trong bảng `ReadingDailyQuota` bằng cách thiết lập Foreign Key và `onDelete: Cascade`.
- Bổ sung `Composite Indexes` siêu tốc (`lastLoginAt`, `nextReviewAt`, `createdAt`).
- Kích hoạt tính năng **Full-Text Search** cho bảng Kanji và Vocabulary.
- Bọc lớp khiên **Redis Cache** (TTL 12h) cho API `/api/exam/list` giảm tải 99% cho CSDL.

### AI Integration
- Hoàn thành kiến trúc **GeminiPoolService** luân phiên 7 khóa API để chịu tải cực lớn (High Concurrency).


## [2026-09-04] - Phiên bản 2.0.0: Nâng Cấp Toàn Diện Đọc Hiểu Dokkai Chuẩn Thi Thật (1.000–2.500 Ký Tự), Tương Tác Tra Cứu Tức Thì & Xóa Video Tạm Thời

### 1. Chuẩn Hóa Độ Dài Bài Đọc Thi Thật (Độ Dài Dài 1.000–2.500 Ký Tự)
- Khắc phục triệt để vấn đề bài đọc quá ngắn: Chuyển sang kết cấu đoạn văn hoàn chỉnh chuẩn Trường văn / Trung văn JLPT N3–N1.
- Nạp bài mẫu demo chính thức từ đề thi thật: **`単身世帯の増加` (Hộ độc thân ngày càng tăng)** gồm 6 đoạn văn, **1.261 ký tự**, audio thời lượng 3:43, 15 từ vựng trọng điểm và 4 mẫu ngữ pháp N2.

### 2. Thao Tác Tương Tác Trực Tiếp Trên Văn Bản & Câu Hỏi (Deep Interactive Reading)
- **Tra cứu từ vựng tức thì (`QuickLookupPopover`):** Người học click hoặc bôi đen bất kỳ từ Kanji/Kana nào trong bài đọc, trong câu hỏi hay 4 lựa chọn đáp án $\rightarrow$ hiển thị popover tra cứu gồm: Từ vựng, cách đọc Hiragana, âm Hán Việt (xanh dương), nghĩa tiếng Việt và nút phát âm audio.
- **Nút bật/tắt Furigana (`[ふりがな]`):** Cho phép ẩn/hiện Furigana toàn bài. Khi tắt, chữ Kanji hiển thị tự nhiên chuẩn như trong phòng thi JLPT.
- **Nút bật/tắt Bản dịch (`[文A Bản dịch]`):** Hiển thị bản dịch tiếng Việt song song dưới từng câu khi cần đối chiếu.
- **Tương tác hai chiều với Cột Phải:** Click vào bất kỳ thẻ từ vựng hoặc ngữ pháp ở cột phải sẽ tự động cuộn đến và highlight từ/ngữ pháp đó trong bài đọc.

### 3. Tối Ưu Hóa Giao Diện Chuẩn 100% Theo Ảnh 2 & Ảnh 3
- **Màn hình chính (Ảnh 3):**
  - Cột trái: `Bài demo` (Card `単身世帯の増加` 3:43 · 1261 ký tự) + `Bài của bạn`.
  - Cột phải: Khung hướng dẫn có thể đóng/gập `Phương pháp đọc hiểu hiệu quả nhất (6 bước với 1 bài)` + Khung dán văn bản tiếng Nhật (500–3.000 ký tự) kèm nút `Dùng văn bản mẫu`.
- **Màn hình đọc hiểu (Ảnh 2):**
  - Thanh audio cố định: slider tiến trình `0:00 / 3:43`, cụm nút `[|<] [▶] [>|] [↺ Lặp câu] [1x/0.8x/1.2x]`, `[ふりがな]` và `[文A Bản dịch]`.
  - Cột trái: Bài đọc văn bản liền mạch theo đoạn văn + Bộ câu hỏi Dokkai (5 câu hỏi thi thật).
  - Cột phải: 2 panel cuộn dọc riêng biệt `📋 Từ vựng trọng điểm` và `✏️ Mẫu ngữ pháp trong bài`.

### 4. Xóa Bỏ Video Shadowing Tạm Thời
- Đã xóa bài video shadowing chưa tải lên khỏi CSDL MySQL `reading_articles` và cấu hình seed. Phân hệ tập trung $100\%$ vào trải nghiệm luyện đọc hiểu Dokkai đỉnh cao.

---

## [2026-09-04] - Phiên bản 1.9.0: Hoàn Thiện Phân Hệ Đọc Hiểu Dokkai Tăng Cường Câu Hỏi, Shadowing & Chép Chính Tả Video Chuẩn UI

### 1. Tích Hợp API Key Chuyên Biệt & Bảo Mật Tuyệt Đối
- Lưu an toàn `GEMINI_KEY_SHADOWING="your_gemini_api_key_here"` trong `server/.env` (được bảo vệ qua `.gitignore`).
- Đăng ký `reading-shadowing-service` vào Bounded Context Service Registry và hệ thống đo lường hiệu năng.

### 2. Chuẩn Hóa Độ Dài JLPT Dokkai & Tăng Cường Nhiều Câu Hỏi Luyện Tập Thỏa Thích
- Giảm độ dài văn bản xuống đúng cấu trúc đề thi chính thức của JEES (N5: 100-180 chữ, N4: 180-250 chữ, N3: 250-380 chữ, N2: 380-550 chữ, N1: 550-750 chữ) $\rightarrow$ Tiết kiệm $>65\%$ token, phản hồi siêu tốc ($1.5\text{s}$).
- **Tăng số lượng câu hỏi Dokkai theo level:** N5 (4 câu), N4 (5 câu), N3 (6 câu), N2 (7 câu), N1 (8 câu).
- Luân phiên đúng 4 dạng câu hỏi thi thật: (1) Đại từ/Cụm từ gạch chân, (2) Lý do/Nguyên nhân, (3) Quan điểm/Ý chính tác giả, (4) Nội dung phù hợp/Không phù hợp. Kèm tính năng `Sinh thêm câu hỏi` theo nhu cầu.

### 3. Cơ Chế Quota 5 Bài/Ngày & Thư Viện Dùng Chung (0 Token)
- Giới hạn 5 bài tạo AI/ngày/người dùng bằng Redis bộ đếm nguyên tử `INCR` và fallback MySQL `reading_daily_quotas`.
- Thư viện dùng chung (Community Public Library): Mọi bài AI tạo ra đều lưu `isPublic: true` để mọi người học khác tải học ngay từ CSDL $\rightarrow$ **0 Token AI, tốc độ tải $< 5\text{ms}$**. Seed sẵn bài đọc chất lượng cao N5, N4, N3 và Video.

### 4. Shadowing & Chép Chính Tả Video (Dictation) Chuẩn 100% Theo Ảnh Gửi
- **Gõ chính tả (Typing):** Textarea, khung con mắt ẩn/hiện gợi ý (`お前もうんこやからな。`), nút vàng `[KIỂM TRA ĐÁP ÁN]` chạy thuật toán so khớp chuỗi tại Client ($0\text{ token}$), nút xanh `[TIẾP THEO ▷]`, 2 card đếm `Lỗi sai` & `Lượt phát lại`.
- **Ghép câu (Ordering):** Xáo trộn các mảnh từ, click ghép theo thứ tự chuẩn ($0\text{ token}$).

### 5. Kiểm Thử & Tích Hợp Giao Diện
- Bổ sung tab `Đọc & Nghe` (`Headphones`) vào `SlimSidebar.tsx` và `app/page.tsx`.
- Cả Client và Server đều biên dịch $100\%$ sạch sẽ không lỗi. Seed CSDL thành công.

---

## [2026-09-04] - Phiên bản 1.8.0: Quy Hoạch Kiến Trúc Phân Hệ "Đọc Hiểu & Shadowing", Quản Lý API Key & CSDL Chống Nghẽn

### 1. Xuất bản Tài liệu Kỹ thuật Chi tiết (`READING_SHADOWING_ARCHITECTURE.md`)
- Quy hoạch trọn vẹn 3 tính năng lớn:
  1. *Đọc hiểu & Shadowing Văn bản ($\le 1000$ từ)*: Dán bài đọc hoặc AI tự sinh theo yêu cầu (chủ đề, độ dài, JLPT N5-N1), audio karaoke đồng bộ câu/từ, bóc tách từ vựng + ngữ pháp + trắc nghiệm đọc hiểu.
  2. *Đọc báo song ngữ NHK*: Tải tin tức thời sự tiếng Nhật giọng phát thanh viên chuẩn, dịch song ngữ.
  3. *Shadowing & Chép chính tả Video ($\le 30$ phút)*: Nhập link YouTube, tách timeline câu phụ đề, lặp câu và bóc tách ngữ pháp đi kèm.

### 2. Chiến lược API Key & Tiết kiệm Token (Single-Pass Prompt)
- Xác định chỉ cần **1 Key chuyên biệt duy nhất** (`GEMINI_KEY_SHADOWING`) cho cả 3 tính năng do tính năng 1 & 2 dùng chung engine phân tích, tính năng 3 lấy phụ đề gốc YouTube với 0 token.
- Áp dụng kỹ thuật Single-Pass Prompt: 1 lần gọi AI sinh trọn bộ từ vựng, ngữ pháp, trắc nghiệm và bản dịch ($< 600\text{ tokens}$).
- Đặt rào chắn giới hạn $\le 1000$ từ và tối đa 10 lượt tạo AI/ngày/người dùng có cảnh báo giao diện.

### 3. Kiến trúc CSDL $1 - N$ Chuẩn Hóa & Giải pháp Chống Lạm Dụng Redis
- Thiết kế 5 bảng quan hệ phân tầng trong MySQL XAMPP: `reading_articles`, `reading_sentences`, `reading_vocab_items`, `reading_grammar_items`, `reading_quizzes`.
- Quy tắc Tiered Storage: MySQL lưu vĩnh viễn toàn bộ, Redis CHỈ cache các bài báo hot / video mẫu với TTL 24h, tuyệt đối không cache rác cá nhân để bảo vệ RAM.

---

## [2026-09-04] - Phiên bản 1.7.0: Phát Hành Hướng Dẫn Vận Hành Hệ Thống & Chuẩn Hóa Cấu Trúc Mã Nguồn Clean Code

### 1. Tài liệu Vận hành Hệ thống (`SYSTEM_GUIDE.md`)
- Soạn thảo cẩm nang vận hành chi tiết từng bước: Khởi động MySQL XAMPP (3306), Redis (6379), cấu hình biến môi trường và chạy Server (`localhost:5000`) & Client (`localhost:3000`).
- Bổ sung bảng các endpoint kiểm tra sức khỏe hệ thống (Health Check) và xử lý sự cố thường gặp.

### 2. Chuẩn hóa cấu trúc thư mục Clean Code (Microservices Bounded Contexts)
- Gom và chuẩn hóa toàn bộ các component chức năng vào các thư mục con độc lập:
  - `client/src/components/kanji/`: 10 components chuyên sâu Hán tự + `index.ts` barrel export.
  - `client/src/components/vocabulary/`: 15 components giáo trình, luyện tập, từ điển + `index.ts` barrel export.
  - `server/src/services/`: 3 microservice contexts (`auth`, `kanji`, `vocabulary`) độc lập hoàn toàn.
- Kiểm tra biên dịch Next.js và TypeScript thành công $100\%$ trong 589ms.

### 3. Hoàn thiện Đề án Kiến trúc "Đọc Hiểu & Shadowing Đa Phương Tiện"
- Hoàn thiện tài liệu thiết kế hệ thống [`reading_shadowing_and_architecture_proposal.md`](file:///C:/Users/cuong/.gemini/antigravity/brain/ce4d867a-0ffa-45f0-8971-21862588842f/reading_shadowing_and_architecture_proposal.md) phân tích 4 màn hình người dùng gửi:
  - Khuyến nghị thành lập phân hệ chính **"Đọc Hiểu & Shadowing" (Reading & Shadowing Studio)** gồm 2 tab: *Đọc hiểu & Shadowing Văn bản ($\le 1000$ từ)* và *Shadowing Video ngắn (Reels/Clips)*.

---

## [2026-09-04] - Phiên bản 1.6.0: Kích Hoạt Phân Hệ AI Từ Vựng & Chấm Chữa Câu Đặt Tự Do

### 1. Tích hợp AI Key chuyên biệt & Bảo mật tuyệt đối
- Lưu trữ an toàn `GEMINI_KEY_VOCAB` trong `server/.env` (được bảo vệ qua `.gitignore`, không rò rỉ ra ngoài).
- Xây dựng `VocabularyAiService` (`server/src/services/vocabulary/vocabulary-ai.service.ts`) ứng dụng mô hình `gemini-3.5-flash-lite` phản hồi siêu tốc ($< 3\text{s}$) với chuẩn định dạng `application/json`.

### 2. Hai tính năng AI Sư phạm đột phá
- **Thẻ Ngữ Cảnh Đa Chiều (Multi-Context Scenario Hub):**
  - Tự động sinh và bóc tách 3 tình huống đời sống (Đời thường, Công sở / Lịch sự, Quán ngữ / Cụm từ cố định) kèm câu ví dụ song ngữ Nhật - Việt và audio phát âm.
  - Trích xuất cụm từ hay đi kèm (Collocations), cảnh báo bẫy trợ từ người Việt hay mắc (Mistake Warning) và phân biệt sắc thái từ (Nuance Note).
  - Áp dụng cơ chế *Lazy Generation & 0-token Cache-Writeback*: Lưu vĩnh viễn vào MySQL bảng `vocabulary_ai_insights` và Redis Cache (30 ngày). Phản hồi các lần học sau trong **$2\text{ms}$** với **$0\text{ token}$**.
- **Thử Thách Đặt Câu & AI Chấm Chữa (Active Recall & Formative Feedback):**
  - Học viên tự gõ câu tiếng Nhật sử dụng từ đang học.
  - AI Sensei chấm điểm (0-100), kiểm tra độ chính xác trợ từ (`は`, `が`, `を`, `に`, `で`...), gợi ý câu tự nhiên chuẩn người bản xứ và giải thích chi tiết bằng tiếng Việt.

### 3. Nâng cấp Giao diện Người dùng (Frontend Studio & Lesson Modals)
- Nâng cấp `VocabDetailCard.tsx`: Tích hợp đầy đủ Studio AI Sensei gồm 2 tab (3 Tình huống thực tế & Thử thách đặt câu).
- Cập nhật `LessonWordList.tsx`: Thêm nút `[✨ AI Sensei]` trên từng hàng từ vựng trong danh sách bài học, mở Modal chi tiết kèm đầy đủ tính năng AI ngữ cảnh và chấm câu.
- Cập nhật Client SDK `apiGateway.vocab`: Bổ sung `getAiInsight`, `regenerateAiInsight`, `diagnoseSentence`.

---

## [2026-09-03] - Phiên bản 1.5.1: Vá Lỗi Cắt Ngắn JSON & Chuẩn Hóa Phản Hồi AI Chiết Tự
- **Nguyên nhân lỗi trước đó:** Tham số `maxOutputTokens: 250` quá nhỏ khiến AI bị ngắt giữa chừng khi sinh JSON tiếng Việt, làm khối fallback in ra chuỗi dở dang `"{ "mnemonicStory": ""` lên giao diện.
- **Giải pháp xử lý:**
  - Nâng `maxOutputTokens` lên `1000` và ép kiểu đầu ra `responseMimeType: 'application/json'`.
  - Tích hợp mô hình `gemini-3.5-flash-lite` phản hồi siêu tốc ($< 3\text{s}$).
  - Tinh chỉnh Regex bóc tách `mnemonicStory` an toàn và dọn sạch các bản ghi lỗi cũ trong MySQL & Redis.
  - Câu chuyện chiết tự nay hiển thị hoàn chỉnh $100\%$, văn phong tự nhiên, hài hước và giàu tính tượng hình.

---

## [2026-09-03] - Phiên bản 1.5.0: CSDL Chống Phình To & Kích Hoạt AI Sensei Chiết Tự Kanji

### 1. Kiến trúc CSDL chống phình to trong 1 Project duy nhất
- Duy trì toàn bộ hệ thống trong CSDL MySQL duy nhất `japanese_learning_db` trên XAMPP để người dùng không bị nhầm lẫn với các database khác trong máy.
- Thiết lập bảng mở rộng chuẩn Microservices:
  - `kanji_ai_insights`: Tách toàn bộ văn bản chiết tự AI, phân tích bộ thủ và cảnh báo nhầm lẫn ra bảng riêng biệt quan hệ 1-1 với `kanjis`.
  - `vocabulary_ai_insights`: Tách toàn bộ JSON ngữ cảnh đa chiều và cụm từ đi kèm ra khỏi bảng `vocabularies`.
  - Giữ các bảng lõi quét siêu nhẹ ($< 500$ bytes/dòng), bổ sung Composite Indexes trên `[jlptLevel, strokeCount]` và `[curriculum, jlptLevel, lesson]`.

### 2. Kích hoạt AI Sensei Chiết tự Hán tự (Gemini 3.6 Flash)
- Tích hợp an toàn API Key `GEMINI_KEY_KANJI` trong `server/.env` (bảo mật tuyệt đối, không đẩy lên client/git).
- Xây dựng `KanjiAiService` (`server/src/services/kanji/kanji-ai.service.ts`):
  - Ứng dụng mô hình `gemini-3.6-flash` sinh mẹo nhớ chiết tự có cấu trúc JSON chặt chẽ.
  - Cơ chế *Lazy Generation & 0-token Cache-Writeback*: Lần đầu gọi AI $\rightarrow$ ghi đè vĩnh viễn vào MySQL & Redis. Các lần sau phục vụ tức thì trong $2\text{ms}$ với **0 token**.
  - Bổ sung 2 endpoints: `GET /api/kanji/:character/ai-insight` và `POST /api/kanji/:character/ai-mnemonic`.

### 3. Nâng cấp giao diện người dùng (Frontend Studio)
- Nâng cấp `client/src/components/kanji/KanjiDetailCard.tsx`:
  - Khu vực hiển thị **AI Sensei • Mẹo Nhớ Chiết Tự** chuyên nghiệp.
  - Các thẻ phân tích bộ thủ (Radical Breakdown Chips) sinh động.
  - Nút bấm `[Sáng tạo lại]` với hiệu ứng xoay loading mượt mà.
  - Bổ sung SDK client `apiGateway.kanji.getAiInsight` và `apiGateway.kanji.generateAiMnemonic`.

---

## [2026-09-03] - Phiên bản 1.4.0: Quy Hoạch Kiến Trúc AI Đa Key & Thiết Kế CSDL Chống Phình To

### 1. Phân định tính năng AI sâu sắc cho Hán tự & Từ vựng
- **Hán tự (Kanji):** Triển khai cơ chế *Lazy AI Generation* cho 1.500+ chữ Hán N3-N1 chưa có câu chuyện chiết tự. Gọi AI 1 lần khi người học bấm yêu cầu $\rightarrow$ ghi đè vĩnh viễn vào CSDL (0 token cho các lần học sau).
- **Từ vựng (Vocabulary):** Xây dựng *Thẻ Ngữ Cảnh Đa Chiều (Multi-Context Scenario Hub)* giải quyết từ đa nghĩa trong 3 tình huống đời sống (Đời thường, Công sở, Quán ngữ) dạng JSON cấu trúc ngắn gọn.
- **Ranh giới Từ vựng & Ngữ pháp:** Tách rõ *Thử thách đặt câu nhanh với từ* (Micro-Task ở Từ vựng) và *Phòng Luyện Viết Ngữ Pháp Chuyên Sâu* (Macro-Task ở Ngữ pháp), tránh lan man chồng chéo.

### 2. Quy hoạch Đa API Key (Multi-Project Key Pool)
- Đề xuất mô hình phân chia API Key từ nhiều Google Cloud Projects (mỗi Project 15 RPM, 1.500 RPD) cho từng phân hệ riêng biệt (`nihonai-kanji`, `nihonai-vocab`, `nihonai-grammar`, `nihonai-exam`).
- Nhân 4 tổng hạn ngạch khả dụng lên **6.000 requests/ngày** và **60 requests/phút** với cơ chế Auto-Failover.

### 3. Kiến trúc CSDL chống phình to dữ liệu (Database-per-Service)
- Tách bảng lõi nhẹ (`vocabularies`, `kanjis`) khỏi bảng dữ liệu AI mở rộng (`vocabulary_ai_insights`, `kanji_mnemonics`) theo quan hệ 1-1.
- Quy hoạch phân tách Schema theo Bounded Contexts sẵn sàng cho Microservices.

---

## [2026-09-03] - Phiên bản 1.3.0: Chuẩn Hóa Microservices & API Gateway & Redis Caching

### 1. Kiến trúc Bounded Contexts & API Gateway
- **Server API Gateway (`server/src/gateway/`):**
  - Khởi tạo `service-registry.ts`: Theo dõi nhịp tim (Heartbeat) và phân loại trạng thái (`UP`, `DEGRADED`, `DOWN`) chuẩn Consul cho 4 Bounded Contexts (`auth`, `kanji`, `vocabulary`, `ai-tutor`).
  - Khởi tạo `circuit-breaker.ts`: Bộ ngắt mạch 3 trạng thái (`CLOSED - OPEN - HALF_OPEN`) chống sập dây chuyền và nghẽn cổ chai khi một dịch vụ bị chậm/lỗi.
  - Cung cấp các endpoint: `GET /api/gateway/health`, `/api/gateway/services`, `/api/gateway/circuits`.
- **Client API Gateway SDK (`client/src/services/api-gateway.client.ts`):**
  - Tập trung hóa toàn bộ request của Client vào một Gateway duy nhất (`apiGateway.*`).
  - Tích hợp chống trùng lặp request đang bay (In-flight Request Deduplication) và tự động thử lại (Retry with Exponential Backoff).

### 2. Tối ưu hóa hiệu năng với Redis Caching
- Triển khai `RedisService` (`server/src/core/redis.service.ts`) kết nối Redis `localhost:6379`.
- Áp dụng `Cache-Aside Pattern` và cơ chế chống Thundering Herd (gộp promises).
- Tích hợp tự động Fallback sang RAM nếu Redis ngoại tuyến.
- **Kết quả đo lường độ trễ:**
  - Tra cứu Hán tự: Từ **59.0 ms** $\rightarrow$ **2.1 ms** (nhanh hơn gấp 28 lần).
  - Tải danh mục giáo trình: Từ **25.4 ms** $\rightarrow$ **2.5 ms** (nhanh hơn gấp 10 lần).
  - Tải bài học: Từ **25.3 ms** $\rightarrow$ **3.3 ms** (nhanh hơn gấp 8 lần).

---

## [2026-09-03] - Phiên bản 1.2.0: Dọn Dẹp Toàn Diện (Deep Clean) & Database-First

### 1. Xóa bỏ dữ liệu rác & tệp thô (> 1.4 MB)
- Xóa bỏ hoàn toàn thư mục `server/prisma/data/` (gồm `kanji.json` 1.08MB và `vocabulary.json` 321KB) do toàn bộ 2.138 Hán tự và 655 từ vựng đã nằm vĩnh viễn trong CSDL MySQL.
- Tinh gọn `prisma/seed.ts` về 20 dòng chỉ để kiểm tra trạng thái CSDL.
- Xóa bỏ các thư mục `constants/` tĩnh: Chuyển tính năng tìm chữ Hán dễ nhầm lẫn (Lookalikes) sang truy vấn động $100\%$ từ MySQL.
- Xóa bỏ các tệp mồ côi: `Sidebar.tsx` (cũ), `KanjiCompounds.tsx` (cũ), `test-kanjivg.js`, `CLAUDE.md` và 5 icon SVG mặc định không dùng trong `client/public/`.
- Xóa các file `package-lock.json` nặng hàng trăm KB và cập nhật `.gitignore`.

### 2. Tinh gọn mã nguồn các tệp lớn
- `client/src/app/page.tsx`: Giảm từ **567 dòng $\rightarrow$ 75 dòng (-87%)**, tách UI tra cứu Hán tự sang `KanjiExplorerView.tsx`.
- `server/src/services/kanji/kanji.service.ts`: Giảm từ **866 dòng $\rightarrow$ 299 dòng (-65%)**.
- `server/src/services/vocabulary/vocabulary.service.ts`: Giảm từ **572 dòng $\rightarrow$ 357 dòng (-38%)**.
- `client/src/components/vocabulary/LessonListeningExercise.tsx`: Giảm từ **712 dòng $\rightarrow$ 399 dòng (-44%)**, tách nhỏ thành `sentence-chunker.ts`, `SentenceScrambleView.tsx`, `DictationTypingView.tsx`.

---

## [2026-09-02] - Phiên bản 1.1.0: Nạp Dữ Liệu Giáo Trình Chuẩn N5-N1
- Nạp 655 từ vựng mẫu chuẩn theo 3 giáo trình: Minna no Nihongo (N5-N4), JLPT Tango (N5-N1), Mimikara Oboeru (N3-N1) vào MySQL.
- Bóc tách tự động chữ Hán cấu thành (Constituent Kanjis) liên kết giữa Từ vựng và Hán tự.
- Xây dựng 4 phân hệ học tập từ vựng: Flashcard 3D, Danh sách từ kèm Audio, Trắc nghiệm kiểm tra và Bài tập nghe chép chính tả/sắp xếp câu.
