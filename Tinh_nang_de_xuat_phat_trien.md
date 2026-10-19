# 🚀 Đề Xuất Phát Triển Tính Năng Tương Lai (NihonAI)

Tài liệu này phác thảo thiết kế và quy trình triển khai cho các tính năng chiến lược nhằm nâng cấp hệ thống NihonAI trong giai đoạn tiếp theo. Trọng tâm chuyển dịch từ "Học cá nhân" sang "Học tập cộng đồng" và "Tự động hóa Dữ liệu".

---

## 1. Tính Năng Cộng Đồng (Community Gamification)

Mục tiêu: Tăng tỷ lệ giữ chân người dùng (Retention Rate) bằng cơ chế cạnh tranh và thi đua. Thay vì học một mình, người học sẽ có động lực để quay lại mỗi ngày.

### 1.1. Bảng Xếp Hạng Thi Đua (Leaderboard)
- **Mô tả:** Phân loại người dùng theo các giải đấu (Ví dụ: Giải Đồng, Bạc, Vàng). Hàng tuần, người dùng cày điểm `study_points` từ việc làm bài tập và thẻ ghi nhớ. Cuối tuần, Top 10 người đứng đầu sẽ được thăng hạng, 10 người chót bảng bị rớt hạng.
- **Triển khai Kỹ thuật:**
  - **Cơ sở dữ liệu:** Thêm trường `league_level` vào bảng `User` hiện tại.
  - **Bộ đệm truy xuất siêu tốc:** Không dùng MySQL `ORDER BY` vì sẽ gây nghẽn cổ chai khi số lượng người dùng tăng. Thay vào đó, sử dụng cấu trúc dữ liệu **Sorted Sets (`ZADD`, `ZREVRANGE`) của Redis**. Redis cho phép cập nhật và lấy danh sách Top 50 người dẫn đầu chỉ trong vòng dưới `1ms`.
  - **Tự động hóa (Cron Job):** Viết một `Node-cron` chạy vào lúc 00:00 thứ Hai hàng tuần để tổng kết giải thưởng, phát Huy hiệu (Badges) và reset điểm tuần của toàn bộ người dùng về 0.

### 1.2. Đấu Trường Trắc Nghiệm Trực Tuyến (PvP Arena)
- **Mô tả:** Hai người dùng trực tuyến có thể ghép cặp ngẫu nhiên (Matchmaking) để thi đấu 1-vs-1. Cả hai sẽ giải quyết chung một bộ 10 câu hỏi ngẫu nhiên cùng cấp độ (ví dụ N3). Ai trả lời đúng và nhanh hơn sẽ giành chiến thắng, nhận được điểm xếp hạng (Elo). Màn hình hiển thị thanh tiến độ của đối thủ theo thời gian thực để tạo sự kịch tính.
- **Triển khai Kỹ thuật:**
  - **Kết nối Real-time:** Tái sử dụng thư viện **Socket.io** (hiện đang dùng cho Voice Chat) để tạo cơ chế "Phòng thi" (Rooms).
  - **Luồng sự kiện:** Khi người dùng A trả lời xong một câu, Frontend lập tức bắn sự kiện `socket.emit('answer_submitted')`. Backend xử lý chấm điểm và phát sóng ngược lại `socket.to(room).emit('opponent_progress')` để giao diện người B cập nhật thanh máu của người A.
  - **Cập nhật dữ liệu:** Kết thúc trận đấu, hệ thống tổng hợp điểm và gọi Prisma cập nhật dữ liệu vào bảng `User`.

---

## 2. Đường Ống Tự Động Thu Thập & Làm Giàu Dữ Liệu (Data Pipeline)

Mục tiêu: Tránh việc phải nhập liệu thủ công tốn thời gian. Xây dựng một quy trình khép kín để tự động gom nhặt hàng chục ngàn câu hỏi thi thử JLPT từ N5 đến N1 trên Internet, làm sạch chúng bằng AI và đổ vào hệ thống.

### Bước 1: Khai thác dữ liệu (Web Scraping)
- **Công cụ:** Sử dụng **Puppeteer** (hoặc Playwright) chạy ngầm trên Node.js.
- **Quy trình:** Viết các đoạn mã tự động truy cập vào các trang cung cấp đề thi mẫu tiếng Nhật miễn phí (như *japanesetest4you, jlpt-sensei*), tự động lật trang và trích xuất cấu trúc HTML để lấy ra các đoạn văn bản thô chứa: Câu hỏi, 4 Đáp án, Đáp án đúng.

### Bước 2: Chuẩn hóa bằng Trí tuệ nhân tạo (AI Parsing)
- **Vấn đề:** Dữ liệu cào về thường rất lộn xộn (lỗi font, chứa quảng cáo, sai định dạng).
- **Giải pháp:** Đưa toàn bộ khối văn bản thô vào **Google Gemini AI**.
- **Prompt mẫu:** *"Hãy đọc khối văn bản thô này, trích xuất ra câu hỏi trắc nghiệm tiếng Nhật. Trả về đúng định dạng JSON tuân thủ Prisma Schema sau: `{ content: string, options: [{text, is_correct}] }`."* AI sẽ làm sạch và định dạng lại dữ liệu hoàn hảo.

### Bước 3: Làm giàu dữ liệu tự động (Auto-Enrichment)
- **Mô tả:** Thay vì đợi người dùng làm bài thi xong mới gọi AI để sinh lời giải thích (gây tốn thời gian chờ đợi và tiêu hao API limit), chúng ta sẽ bắt AI sinh lời giải sẵn ngay từ khâu nạp dữ liệu.
- **Giải pháp:** Trong quá trình chuẩn hóa ở Bước 2, yêu cầu Gemini điền luôn giá trị vào trường `explanation` (Lời giải chi tiết giải thích tại sao đáp án A đúng, B sai) và dịch câu hỏi sang tiếng Việt.

### Bước 4: Nạp vào Cơ sở dữ liệu (Database Seeding)
- Gom toàn bộ các Object JSON đã được làm sạch và giải thích cặn kẽ thành các tệp tin lớn.
- Sử dụng lệnh `prisma.question.createMany()` để đẩy hàng loạt hàng chục ngàn câu hỏi này vào CSDL MySQL (TiDB/Aiven).
- **Kiến trúc hệ thống:** Cần tách rời bộ mã Scraping này ra khỏi Web Server chính (ví dụ đặt tại thư mục `server/tools/scrapers/`) để chạy độc lập (Offline Script), tránh việc chiếm dụng bộ nhớ (RAM) của người dùng đang học trên Web. Mọi dữ liệu sau khi nạp xong sẽ lập tức xuất hiện tự động trên hệ thống tạo đề thi (Quiz Generator) của NihonAI.
