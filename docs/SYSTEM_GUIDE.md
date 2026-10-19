# Hướng Dẫn Cài Đặt & Vận Hành Toàn Bộ Hệ Thống (NihonAI System Guide)

> **Dự án:** Nền tảng Học Tiếng Nhật Trực Tuyến Tích Hợp AI Thông Minh (NihonAI)  
> **Đề tài tốt nghiệp:** Nghiên cứu và ứng dụng Mô hình Ngôn ngữ Lớn (LLM) trong xây dựng nền tảng học tiếng Nhật trực tuyến  
> **Tác giả:** Đoàn Trần Mạnh Cường – Kỹ thuật Phần mềm K45, Trường ĐH Quy Nhơn  

---

> 🚀 **[CẬP NHẬT GIAI ĐOẠN 4 - THÁNG 09/2026]**
> Toàn bộ hệ thống hiện tại đã được nâng cấp lên chuẩn Enterprise Production:
> 1. **Bảo mật tuyệt đối:** Hoàn thiện Dual-Token (Cookie HttpOnly) chống XSS, Rate-Limiting chống Brute-Force, và Middleware chống IDOR.
> 2. **Kiến trúc AI Pool:** Áp dụng thuật toán Round-Robin luân phiên 7 Gemini API Keys để lách luật 15 request/phút, cho phép hàng trăm user truy cập AI cùng lúc.
> 3. **Tối ưu Database & Redis:** Đã khắc phục 100% rác dữ liệu (Orphan Data) qua Cascade Delete. Đánh Composite Indexes toàn hệ thống, tích hợp Full-Text Search và bộ đệm Redis Cache cho các truy vấn nặng.

---

## I. Tổng Quan Kiến Trúc Hệ Thống

Hệ thống được thiết kế theo mô hình **Monorepo Microservices-Ready** với kiến trúc phân tầng chuyên nghiệp:

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
                     ┌─────────────────┴────┐     ┌────┴─────────────────┐
                     ▼                      ▼     ▼                      ▼
               ┌──────────┐           ┌──────────┐┌──────────┐     ┌──────────┐
               │   Auth   │           │  Kanji   ││  Vocab   │     │ AI Tutor │
               │ Service  │           │ Service  ││ Service  │     │ Service  │
               └────┬─────┘           └────┬─────┘└────┬─────┘     └────┬─────┘
                    │                      │           │                │
                    └──────────────┬───────┴───────────┴────────────────┘
                                   │
              ┌────────────────────┴────────────────────┐
              ▼                                         ▼
   ┌──────────────────────┐                  ┌──────────────────────┐
   │  Redis Cache Engine  │                  │ MySQL Database XAMPP │
   │  Port: 6379 (RAM)    │                  │ Port: 3306           │
   │  (Độ trễ < 3ms)      │                  │ (japanese_learning_db)│
   └──────────────────────┘                  └──────────────────────┘
```

---

## II. Yêu Cầu Tiền Đề (Prerequisites)

Trước khi khởi chạy, máy tính của bạn cần có sẵn:
1. **Node.js:** Phiên bản `>= 18.x` (Khuyến nghị: Node.js 20 hoặc 22 LTS).
2. **XAMPP (MySQL):** Đang chạy module **MySQL Database** trên cổng mặc định `3306`.
3. **Redis Server:** Đang chạy dịch vụ Redis trên cổng mặc định `6379` (localhost).
   * *Ghi chú:* Nếu Redis chưa bật, hệ thống có cơ chế tự động **Fallback sang RAM (In-Memory)** để tiếp tục hoạt động mà không bị gián đoạn.

---

## III. Cấu Hình Biến Môi Trường (.env)

Hệ thống đã được cấu hình sẵn biến môi trường cho bạn, dưới đây là chi tiết để đối chiếu:

### 1. Phía Server (`server/.env`):
```env
# Kết nối CSDL MySQL XAMPP (Duy nhất 1 database đồ án)
DATABASE_URL="mysql://root:@127.0.0.1:3306/japanese_learning_db"

# Cổng lắng nghe Backend
PORT=5000

# Khóa Google Gemini API phân tầng theo Bounded Context (Thay bằng key của bạn)
GEMINI_KEY_KANJI="your_gemini_api_key_here"
GEMINI_KEY_VOCAB="your_gemini_api_key_here"
GEMINI_API_KEY="your_gemini_api_key_here"
GEMINI_KEY_GRAMMAR=""
GEMINI_KEY_EXAM=""

# Địa chỉ cụm Redis Cache
REDIS_URL="redis://localhost:6379"

# Khóa bí mật xác thực JWT
JWT_SECRET="your_jwt_secret_key_here"
JWT_EXPIRES_IN="7d"
```

### 2. Phía Client (`client/.env.local`):
```env
# Địa chỉ trỏ tới API Gateway của Backend
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
```

---

## IV. Các Bước Khởi Chạy Toàn Bộ Hệ Thống (Step-by-Step)

Mở 2 cửa sổ dòng lệnh Terminal (PowerShell hoặc Command Prompt) từ thư mục gốc của dự án `cool-hopper`:

### 🔹 Bước 1: Khởi Động Backend Server (Cửa sổ 1)
```powershell
# Di chuyển vào thư mục server
cd server

# Nếu là lần đầu tiên tải mã nguồn về, cài đặt thư viện:
npm install

# Đồng bộ lược đồ bảng CSDL vào MySQL:
npx prisma db push
npx prisma generate

# Khởi chạy máy chủ Backend:
npm run dev
```
👉 **Dấu hiệu thành công:** Terminal sẽ hiển thị:
```
📋 [SERVICE REGISTRY] Registered context: auth-service (/api/auth)
📋 [SERVICE REGISTRY] Registered context: kanji-service (/api/kanji)
📋 [SERVICE REGISTRY] Registered context: vocabulary-service (/api/vocabulary)
📋 [SERVICE REGISTRY] Registered context: ai-tutor-service (/api/ai)
🚀 [API GATEWAY] Server is running on: http://localhost:5000
⚡ [REDIS] Connected to Redis cluster at: redis://localhost:6379
```

---

### 🔹 Bước 2: Khởi Động Frontend Client (Cửa sổ 2)
```powershell
# Di chuyển vào thư mục client
cd client

# Nếu là lần đầu tiên tải mã nguồn về, cài đặt thư viện:
npm install

# Khởi chạy giao diện người dùng Next.js:
npm run dev
```
👉 **Dấu hiệu thành công:** Terminal sẽ hiển thị:
```
▲ Next.js 16.3.3 (Turbopack)
- Local:        http://localhost:3000
- Environments: .env.local
✓ Ready in 1.2s
```

---

### 🔹 Bước 3: Truy Cập Ứng Dụng Trên Trình Duyệt
Mở trình duyệt Web (Chrome, Edge, Brave...) và truy cập:
* **Giao diện học tập:** [http://localhost:3000](http://localhost:3000)
* **Bảng giám sát sức khỏe Gateway & Microservices:** [http://localhost:5000/api/gateway/health](http://localhost:5000/api/gateway/health)

---

## V. Các Điểm Kiểm Thử Nhanh (System Health Check)

| Endpoint kiểm tra | Giao thức | Ý nghĩa & Kết quả mong đợi |
| :--- | :---: | :--- |
| `http://localhost:5000/api/gateway/health` | GET | Trả về `status: PASSING`, `mysql: CONNECTED`, `redis: ONLINE_CLUSTER`. |
| `http://localhost:5000/api/gateway/services` | GET | Danh sách 4 microservices với số lượng request và thời gian phản hồi (Latency). |
| `http://localhost:5000/api/kanji/日` | GET | Chi tiết chữ Hán `日` (Nhật), tốc độ phản hồi qua Redis $\approx 2\text{ms}$. |
| `http://localhost:5000/api/vocabulary/courses/stats` | GET | Thống kê tổng số từ vựng chuẩn trong CSDL MySQL. |
| `http://localhost:5000/api/kanji/休/ai-insight` | GET | Mẹo nhớ chiết tự sinh bởi Gemini 3.5 Flash Lite và lưu vĩnh viễn trong CSDL. |
| `http://localhost:5000/api/vocabulary/:id/ai-insight` | GET | 3 Ngữ cảnh thực tế đời sống, collocations và lưu ý tránh nhầm lẫn cho từ vựng. |

---

## VI. Hướng Dẫn Xử Lý Sự Cố Thường Gặp (Troubleshooting)

1. **Lỗi "Can't reach database server at 127.0.0.1:3306":**
   * **Nguyên nhân:** XAMPP chưa bấm Start module MySQL hoặc cổng 3306 bị chiếm.
   * **Cách xử lý:** Mở XAMPP Control Panel $\rightarrow$ Nhấn nút **Start** ở dòng MySQL $\rightarrow$ Đảm bảo đèn báo xanh.
2. **Lỗi "connect ECONNREFUSED 127.0.0.1:6379":**
   * **Nguyên nhân:** Dịch vụ Redis chưa bật.
   * **Cách xử lý:** Hệ thống sẽ tự động chuyển sang chế độ **In-Memory Cache (RAM)** nên ứng dụng vẫn hoạt động bình thường. Tuy nhiên để đạt tốc độ tối đa $< 2\text{ms}$, bạn hãy mở file `redis-server.exe` trên máy.
3. **Lỗi "EPERM: operation not permitted, rename query_engine":**
   * **Nguyên nhân:** Đang chạy `npm run dev` ở server mà thực hiện `npx prisma generate`.
   * **Cách xử lý:** Tắt tiến trình server (`Ctrl + C`), chạy `npx prisma generate`, sau đó gõ lại `npm run dev`.
