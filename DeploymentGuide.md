# 🚀 Hướng Dẫn Triển Khai (Deploy) NihonAI Lên Đám Mây (Miễn Phí 100%)

Chào bạn, để chuẩn bị cho việc Deploy, tôi đã tự động chèn thêm mã cấu hình CORS (Mở khóa tên miền) vào file `server/src/index.ts` để Backend chấp nhận truy cập từ Frontend trên Vercel sau này. Bạn không cần sửa code nữa.

Hãy làm tuần tự theo 5 bước sau đây:

---

## Bước 1: Đẩy Mã Nguồn (Code) Lên GitHub
1. Mã nguồn dự án đã được đẩy lên GitHub tại: [https://github.com/doantranmanhcuong/nihonAI](https://github.com/doantranmanhcuong/nihonAI).
2. Khi cần cập nhật code mới nhất từ máy tính:
   ```bash
   cd D:\cool-hopper
   git add .
   git commit -m "Update system features"
   git push origin main
   ```

---

## Bước 2: Tạo Cơ Sở Dữ Liệu MySQL (TiDB Serverless)
1. Truy cập [TiDB Serverless](https://pingcap.com/tidb-serverless/) và đăng nhập bằng Google.
2. Bấm **Create Cluster** (Chọn Region gần Việt Nam nhất như Singapore hoặc Tokyo).
3. Sau khi tạo xong, bấm vào nút **Connect**. 
4. Chọn loại kết nối là **Prisma**, copy đoạn chuỗi kết nối (`DATABASE_URL`).
5. **Đẩy cấu trúc bảng lên TiDB:**
   - Mở Terminal ở máy tính của bạn, tại thư mục `server/`.
   - Sửa file `server/.env` cục bộ, thay `DATABASE_URL` bằng chuỗi vừa nhận được.
   - Chạy lệnh: `npx prisma db push`. Lệnh này sẽ tạo tất cả các bảng (User, Vocabulary, Kanji...) lên đám mây TiDB.

---

## Bước 3: Tạo Bộ Đệm Redis (Upstash)
1. Truy cập [Upstash.com](https://upstash.com) và đăng nhập bằng Google.
2. Bấm **Create Database** (Chọn loại Redis, Region: Singapore).
3. Sau khi tạo xong, cuộn xuống phần "Connection", copy đoạn `REDIS_URL` (bắt đầu bằng `rediss://...`). Bạn sẽ dùng nó ở Bước 4.

---

## Bước 4: Triển Khai Backend (Koyeb)
Koyeb cho phép máy chủ chạy 24/7 không bị "ngủ" như Render, rất tốt cho API Gateway và Cron Job của bạn.
1. Truy cập [Koyeb.com](https://www.koyeb.com) và đăng nhập bằng GitHub.
2. Bấm **Create Service** -> Chọn nguồn là **GitHub** -> Chọn Repo của bạn.
3. Ở phần cấu hình (Builder):
   - **Build command:** `cd server && npm install && npx prisma generate && npm run build`
   - **Run command:** `cd server && npm run start`
4. Ở phần **Environment Variables**, hãy khai báo TẤT CẢ các biến từ file `.env` cục bộ của bạn lên đây:
   - `DATABASE_URL` = [Link TiDB ở Bước 2]
   - `REDIS_URL` = [Link Upstash ở Bước 3]
   - `GEMINI_API_KEY` = [Key chính của bạn]
   - `GEMINI_KEY_KANJI`, `GEMINI_KEY_VOCAB`, `GEMINI_KEY_SHADOWING`, `GEMINI_KEY_GRAMMAR`, `GEMINI_KEY_EXAM`, `GEMINI_KEY_BACKUP_1`, `GEMINI_KEY_BACKUP_2` = [Các API Key trong cụm Pool xoay vòng]
   - `GEMINI_MODEL` = `gemini-flash-latest` (Model chính, tự động cập nhật phiên bản mới nhất từ Google)
   - `GEMINI_MODEL_FALLBACKS` = `gemini-3.6-flash,gemini-3.1-flash-lite,gemini-3.5-flash-lite,gemini-3-flash-preview` (Chuỗi dự phòng tự phục hồi đa tầng)
   - `GEMINI_MODEL_LITE` = `gemini-flash-lite-latest` (Dành cho tra cứu Kanji & Từ vựng siêu tiết kiệm)
   - `JWT_SECRET` = `[Chuỗi khóa bí mật JWT ngẫu nhiên của bạn]`
5. Bấm **Deploy**. 
6. Chờ khoảng 3-5 phút, Koyeb sẽ cấp cho bạn một đường link Backend (Ví dụ: `https://nihonai-api.koyeb.app`). Hãy copy link này!

---

### 🛡️ Cơ chế Dự phòng & Tự phục hồi AI (High Availability Fallback):
Hệ thống sử dụng cơ chế bảo vệ 2 tầng qua `GeminiPoolService`:
1. **Xoay vòng Key (Key Rotation):** Khi một Key bị chạm giới hạn quota (429) hoặc tạm thời quá tải, hệ thống tự động đổi sang Key khác trong pool 8 key.
2. **Chuỗi dự phòng Model (Model Fallback Chain):** Khi một Model bị Google khai tử (404 deprecated), gặp lỗi đột biến lưu lượng (503 Service Unavailable), hoặc cạn hạn mức, hệ thống tự động chuyển sang model kế nhiệm: `gemini-flash-latest` -> `gemini-3.6-flash` -> `gemini-3.1-flash-lite` -> `gemini-3.5-flash-lite` -> `gemini-3-flash-preview` mà không làm gián đoạn người dùng.

---

## Bước 5: Triển Khai Frontend (Vercel)
1. Truy cập [Vercel.com](https://vercel.com) và đăng nhập bằng GitHub.
2. Bấm **Add New Project** -> Chọn Repo NihonAI của bạn.
3. Trong phần **Framework Preset**, chọn `Next.js`.
4. Trong phần **Root Directory**, bấm Edit và chọn thư mục `client`.
5. Trong phần **Environment Variables**, thêm biến sau:
   - `NEXT_PUBLIC_API_URL` = `[LINK_KOYEB_Ở_BƯỚC_4]/api` (Nhớ thêm chữ `/api` ở cuối).
6. Bấm **Deploy**.
7. Khi hoàn tất, Vercel sẽ cấp cho bạn đường link Frontend (Ví dụ: `https://nihonai.vercel.app`).

### 🔧 Bước cuối cùng: Khớp nối bảo mật CORS
1. Quay lại trang quản lý máy chủ Koyeb (Backend) của bạn ở Bước 4.
2. Vào phần Cấu hình -> Environment Variables.
3. Thêm một biến mới: `FRONTEND_URL` = `https://nihonai.vercel.app` (Đường link Vercel ở Bước 5).
4. Khởi động lại (Restart) dịch vụ Koyeb.

🎉 **HOÀN TẤT!** Ứng dụng của bạn hiện đã được đưa lên mạng toàn cầu, chạy tốc độ cao 24/7 và hoàn toàn miễn phí.
