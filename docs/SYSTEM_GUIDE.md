# Hướng Dẫn Cài Đặt & Vận Hành Toàn Bộ Hệ Thống (NihonAI System Guide)

> **Dự án:** Nền tảng Học Tiếng Nhật Trực Tuyến Tích Hợp AI Thông Minh (NihonAI)  
> **Đề tài tốt nghiệp:** Nghiên cứu và ứng dụng Mô hình Ngôn ngữ Lớn (LLM) trong xây dựng nền tảng học tiếng Nhật trực tuyến  
> **Tác giả:** Đoàn Trần Mạnh Cường – Kỹ thuật Phần mềm K45, Trường ĐH Quy Nhơn  
> **Mã nguồn:** [github.com/doantranmanhcuong/nihonAI](https://github.com/doantranmanhcuong/nihonAI)  
> **Phiên bản hệ thống:** 2.5.0 (Cập nhật Tháng 10/2026)

---

## I. Tổng Quan Kiến Trúc Hệ Thống

Hệ thống **NihonAI** được thiết kế theo mô hình **Monorepo Microservices-Ready** với kiến trúc phân tầng Bounded Contexts hoàn chỉnh:

```
                               ┌────────────────────────────────┐
                               │     FRONTEND (Next.js 16)      │
                               │  Port: 3000 (Turbopack + React)│
                               └───────────────┬────────────────┘
                                               │ (Unified API Gateway Client)
                                               ▼
                               ┌────────────────────────────────┐
                               │   BACKEND API GATEWAY (Node.js)│
                               │  Port: 5000 (Express + Consul) │
                               └───────┬───────────────┬────────┘
                                       │               │
     ┌──────────────┬──────────────┬───┴──────────┬────┴─────────┬──────────────┬──────────────┐
     ▼              ▼              ▼              ▼              ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│   Auth   │  │  Kanji   │  │  Vocab   │  │ Reading  │  │Shadowing │  │   Exam   │  │ Notebook │
│ Service  │  │ Service  │  │ Service  │  │ Service  │  │ Service  │  │ Service  │  │ & Mistake│
└────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │             │             │             │             │             │
     └─────────────┴─────────────┼─────────────┴─────────────┴─────────────┴─────────────┘
                                 │
                   ┌─────────────┴─────────────┐
                   ▼                           ▼
        ┌──────────────────────┐    ┌──────────────────────┐
        │  Redis Cache Engine  │    │ MySQL Database XAMPP │
        │  Port: 6379 (RAM)    │    │ Port: 3306           │
        │  (Độ trễ < 3ms)      │    │ (japanese_learning_db│
        └──────────────────────┘    └──────────────────────┘
                   ▲                           ▲
                   └─────────────┬─────────────┘
                                 │
                   ┌─────────────┴─────────────┐
                   │    Gemini AI Multi-Pool   │
                   │  Round-Robin 8 Keys/Models│
                   └───────────────────────────┘
```

### Các phân hệ Bounded Context chính:
1. **Auth Service (`/api/auth`)**: Dual-Token (Access Token trong RAM + Refresh Token trong HttpOnly Cookie), Google OAuth2, xác minh Email OTP, Token Versioning thu hồi phiên tức thì, RBAC (`USER`, `ADMIN`).
2. **Kanji Service (`/api/kanji`)**: 2.138 Hán tự Thường dụng (Jouyou Kanji), nhận diện vẽ tay Canvas real-time, hoạt họa nét bút SVG (KanjiVG), đồ thị 214 bộ thủ, âm Hán Việt, 10 quy tắc chuyển âm Onyomi, và AI chiết tự Mnemonic.
3. **Vocabulary Service (`/api/vocabulary`)**: 3 bộ giáo trình chuẩn (Minna no Nihongo, JLPT Tango, Mimikara Oboeru), Flashcard 3D, thử thách đặt câu Active Recall có AI chấm chữa, hub 3 tình huống thực tế, bẫy trợ từ & collocations.
4. **Reading Service (`/api/reading`)**: Đọc hiểu Dokkai (500–2.500 ký tự), trình cào tin tức tự động RSS (NHK, Asahi, Mainichi, Yahoo JP) với Cron Job 06:00 AM, bóc tách từ vựng - ngữ pháp - trắc nghiệm, audio phát âm và tra cứu nhanh ngữ cảnh.
5. **Shadowing Service (`/api/shadowing`)**: Luyện nghe nhại âm và chép chính tả qua video YouTube & bài nghe, đồng bộ phụ đề theo timeline câu/từ, luyện gõ chính tả (Dictation) và ghép câu (Sentence Ordering).
6. **Exam Service (`/api/exam`)**: 60 bộ đề thi mô phỏng chuẩn JLPT (2020–2025, N5–N1), 2 chế độ thi (Express 34 câu / 16 Mondai & Full 105 câu), engine âm thanh đối thoại Tokyo bản xứ, thang điểm chuẩn JEES 180 và điều kiện điểm liệt (< 19/60).
7. **Notebook & Mistake Bank Service (`/api/notebook`)**: Sổ tay cá nhân 4 nhóm (Vocab, Kanji, Grammar, Notes), Ngân hàng câu sai (Mistake Bank) tự động gom các câu làm sai từ đề thi, thuật toán lặp lại ngắt quãng SM-2 (SRS), chế độ xem thu gọn (Compact Accordion) & xem chi tiết.
8. **Admin Service (`/api/admin`)**: Quản trị người dùng (phân quyền Role, khóa/mở tài khoản, xem lịch sử thi điểm số chi tiết), quản trị nội dung (bài đọc, bài shadowing, import Excel), cấu hình Prompt AI, nhật ký Audit Log và chế độ bảo trì hệ thống.
9. **AI Tutor Service (`/api/ai`)**: Trợ giảng thông minh đàm thoại, giải thích ngữ pháp, dịch thuật ngữ cảnh và phân tích lỗi sai bài thi.

---

## II. Yêu Cầu Môi Trường (Prerequisites)

Trước khi khởi chạy, máy tính của bạn cần có sẵn:
1. **Hệ điều hành:** Windows 10/11, macOS, hoặc Linux.
2. **Node.js:** Phiên bản `>= 18.x` (Khuyến nghị: Node.js 20 LTS hoặc 22 LTS).
3. **MySQL (XAMPP hoặc Standalone):** Đang chạy trên cổng `3306` (Database: `japanese_learning_db`).
4. **Redis Server:** Đang chạy trên cổng mặc định `6379`.
   * *Ghi chú:* Nếu Redis chưa bật, hệ thống có cơ chế tự động **Fallback sang In-Memory Cache (RAM)** để tiếp tục hoạt động mà không bị sập.

---

## III. Cấu Hình Biến Môi Trường (.env)

### 1. Phía Server (`server/.env`):
```env
# Kết nối CSDL MySQL (Duy nhất 1 database đồ án)
DATABASE_URL="mysql://root:@127.0.0.1:3306/japanese_learning_db"

# Cổng lắng nghe Backend
PORT=5000

# Khóa Google Gemini API phân tầng theo Bounded Context (Thay bằng key của bạn)
GEMINI_KEY_KANJI="your_gemini_api_key_here"
GEMINI_KEY_VOCAB="your_gemini_api_key_here"
GEMINI_KEY_SHADOWING="your_gemini_api_key_here"
GEMINI_KEY_GRAMMAR="your_gemini_api_key_here"
GEMINI_KEY_EXAM="your_gemini_api_key_here"
GEMINI_API_KEY="your_gemini_api_key_here"

# Model Gemini cấu hình tự động dự phòng
GEMINI_MODEL="gemini-flash-latest"
GEMINI_MODEL_FALLBACKS="gemini-3.6-flash,gemini-3.1-flash-lite,gemini-3.5-flash-lite,gemini-3-flash-preview"
GEMINI_MODEL_LITE="gemini-flash-lite-latest"

# Địa chỉ cụm Redis Cache
REDIS_URL="redis://localhost:6379"

# Khóa bí mật xác thực JWT
JWT_SECRET="your_jwt_secret_key_here"
JWT_EXPIRES_IN="7d"

# Cấu hình CORS Frontend URL (nếu chạy Production)
FRONTEND_URL="http://localhost:3000"
```

### 2. Phía Client (`client/.env.local`):
```env
# Địa chỉ trỏ tới API Gateway của Backend
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
```

---

## IV. Các Bước Khởi Chạy Hệ Thống (Step-by-Step)

Mở 2 cửa sổ dòng lệnh Terminal từ thư mục gốc của dự án `D:\cool-hopper`:

### 🔹 Bước 1: Khởi Động Backend Server (Terminal 1)
```powershell
# Di chuyển vào thư mục server
cd D:\cool-hopper\server

# Cài đặt thư viện (nếu là lần đầu):
npm install

# Đồng bộ lược đồ bảng CSDL và sinh mã Prisma Client:
npx prisma generate
npx prisma db push

# Khởi chạy máy chủ Backend:
npm run dev
```

👉 **Dấu hiệu thành công:** Terminal hiển thị:
```
📋 [SERVICE REGISTRY] Registered context: auth-service (/api/auth)
📋 [SERVICE REGISTRY] Registered context: kanji-service (/api/kanji)
📋 [SERVICE REGISTRY] Registered context: vocabulary-service (/api/vocabulary)
📋 [SERVICE REGISTRY] Registered context: reading-shadowing-service (/api/reading)
📋 [SERVICE REGISTRY] Registered context: shadowing-service (/api/shadowing)
📋 [SERVICE REGISTRY] Registered context: exam-service (/api/exam)
📋 [SERVICE REGISTRY] Registered context: notebook-service (/api/notebook)
📋 [SERVICE REGISTRY] Registered context: admin-service (/api/admin)
📋 [SERVICE REGISTRY] Registered context: ai-tutor-service (/api/ai)
🚀 [API GATEWAY] Server is running on: http://localhost:5000
📡 [SERVICE REGISTRY & HEALTH] Check at: http://localhost:5000/api/gateway/health
⚡ [REDIS ENGINE] Cache status: CONNECTED
```

---

### 🔹 Bước 2: Khởi Động Frontend Client (Terminal 2)
```powershell
# Di chuyển vào thư mục client
cd D:\cool-hopper\client

# Cài đặt thư viện (nếu là lần đầu):
npm install

# Khởi chạy giao diện người dùng Next.js:
npm run dev
```

👉 **Dấu hiệu thành công:** Terminal hiển thị:
```
▲ Next.js 16.3.3 (Turbopack)
- Local:        http://localhost:3000
- Environments: .env.local
✓ Ready in 1.2s
```

---

### 🔹 Bước 3: Truy Cập & Trải Nghiệm Ứng Dụng
Mở trình duyệt Web (Chrome, Edge, Brave...) và truy cập:
* **Giao diện học tập NihonAI:** [http://localhost:3000](http://localhost:3000)
* **Bảng kiểm tra sức khỏe Gateway:** [http://localhost:5000/api/gateway/health](http://localhost:5000/api/gateway/health)
* **Danh mục API Catalog:** [http://localhost:5000/api](http://localhost:5000/api)

---

## V. Danh Mục API Endpoints & Health Check

| Endpoint | Giao thức | Phân hệ | Chức năng chính |
| :--- | :---: | :--- | :--- |
| `/api/gateway/health` | GET | Gateway | Kiểm tra nhịp tim Consul, kết nối MySQL và trạng thái Redis. |
| `/api/gateway/services` | GET | Gateway | Danh sách các service, số lượng request và độ trễ latency. |
| `/api/auth/login` | POST | Auth | Đăng nhập tài khoản mật khẩu, trả về JWT và đặt HttpOnly Cookie. |
| `/api/auth/google` | POST | Auth | Đăng nhập qua Google OAuth2 với Account Linking tự động. |
| `/api/auth/me` | GET | Auth | Lấy thông tin tài khoản hiện tại, vai trò, cấp độ mục tiêu N5-N1. |
| `/api/kanji/:character` | GET | Kanji | Chi tiết chữ Hán (Hán Việt, Onyomi, Kunyomi, nét vẽ, bộ thủ). |
| `/api/kanji/recognize` | POST | Kanji | Nhận diện chữ Hán viết tay qua tọa độ Canvas nét vẽ. |
| `/api/vocabulary/courses/stats` | GET | Vocab | Thống kê số lượng từ vựng theo giáo trình Minna, Tango, Mimikara. |
| `/api/vocabulary/:id/ai-insight` | GET | Vocab | Sinh 3 ngữ cảnh đời sống, collocations và bẫy lỗi thường gặp. |
| `/api/reading/articles` | GET | Reading | Danh sách bài đọc Dokkai, bài báo NHK mới cào và phân cấp N5-N1. |
| `/api/reading/feed` | GET | Reading | Danh sách tin tức thời sự tiếng Nhật mới nhất từ RSS Feeds. |
| `/api/shadowing/lessons` | GET | Shadowing | Danh sách bài học video YouTube, phụ đề timeline câu/từ. |
| `/api/exam/list` | GET | Exam | Danh sách 60 bộ đề thi mô phỏng chuẩn JLPT (cache Redis 12h). |
| `/api/exam/:id` | GET | Exam | Chi tiết bài thi theo định dạng Express (34 câu) hoặc Full (105 câu). |
| `/api/exam/submit` | POST | Exam | Chấm điểm tự động thang 180 điểm JLPT và kiểm tra điểm liệt. |
| `/api/exam/audio/:id` | GET | Exam | Stream audio hội thoại bài nghe Choukai giọng bản xứ Tokyo. |
| `/api/notebook` | GET | Notebook | Danh sách mục trong Sổ tay cá nhân & Ngân hàng câu hỏi sai. |
| `/api/notebook/due` | GET | Notebook | Danh sách thẻ đến hạn ôn tập theo thuật toán lặp ngắt quãng SM-2. |
| `/api/notebook/:id/review` | POST | Notebook | Cập nhật đánh giá ôn tập SRS (chất lượng 0-5 sao). |
| `/api/admin/users` | GET | Admin | Quản lý danh sách người dùng, trạng thái và đổi phân quyền Role. |
| `/api/admin/users/:id/progress` | GET | Admin | Tra cứu chi tiết tiến độ học tập và lịch sử điểm số thi của học viên. |
| `/api/ai/chat` | POST | AI Tutor | Trò chuyện trực tiếp với Trợ giảng AI về kiến thức tiếng Nhật. |

---

## VI. Hướng Dẫn Xử Lý Sự Cố (Troubleshooting)

1. **Lỗi `Can't reach database server at 127.0.0.1:3306`:**
   * **Nguyên nhân:** XAMPP chưa khởi động module MySQL hoặc cổng 3306 bị phần mềm khác chiếm dụng.
   * **Cách xử lý:** Mở XAMPP Control Panel $\rightarrow$ Nhấn nút **Start** ở dòng MySQL $\rightarrow$ Đảm bảo đèn trạng thái xanh lá.
2. **Lỗi `connect ECONNREFUSED 127.0.0.1:6379`:**
   * **Nguyên nhân:** Dịch vụ Redis Server chưa được bật.
   * **Cách xử lý:** Hệ thống có bộ đệm In-Memory RAM Fallback tự động nên ứng dụng vẫn hoạt động bình thường. Để đạt tốc độ cache $< 2\text{ms}$, hãy khởi chạy `redis-server.exe`.
3. **Lỗi âm thanh Choukai hoặc phát âm bị lặp lại:**
   * **Nguyên nhân:** Chuỗi ký tự tiếng Nhật có thẻ `<ruby>` `<rt>` làm Web Speech API đọc cả chữ Hán lẫn chữ Furigana nhỏ.
   * **Cách xử lý:** Hệ thống đã tích hợp hàm chuẩn hóa `cleanJapaneseTextForSpeech` loại bỏ thẻ `<rt>` và các ký tự bẫy trước khi chuyển qua bộ đọc âm thanh.
4. **Lỗi `EPERM: operation not permitted, rename query_engine`:**
   * **Nguyên nhân:** Chạy `npx prisma generate` trong khi tiến trình server đang hoạt động.
   * **Cách xử lý:** Dừng server (`Ctrl + C`), chạy `npx prisma generate`, sau đó chạy lại `npm run dev`.
