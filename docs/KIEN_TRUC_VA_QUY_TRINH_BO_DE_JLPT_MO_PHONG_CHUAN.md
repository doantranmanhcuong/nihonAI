# Kiến Trúc Và Quy Trình Xây Dựng Bộ Đề Thi JLPT Mô Phỏng Chuẩn (N5 - N1)

> **Tài liệu Kỹ thuật & Sư phạm Hệ thống Luyện thi JLPT Thông minh**  
> *Phiên bản:* 2.5 (Cập nhật Tháng 10/2026 - Chuẩn hóa Cấu trúc Khảo thí & Trải nghiệm Người dùng)  
> *Định vị:* Hệ thống Đề thi Mô phỏng Chuẩn cấu trúc JEES & Giáo trình Uy tín (*Shin Kanzen Master, Nihongo Sou Matome, Try!*)  
> *Mã nguồn:* [github.com/doantranmanhcuong/nihonAI](https://github.com/doantranmanhcuong/nihonAI)

---

## 1. Định Vị & Triết Lý Xây Dựng Bộ Đề

### 1.1. Minh bạch hóa Định danh Đề thi (Academic Transparency)
Để đảm bảo tính trung thực, chuẩn mực học thuật và bảo vệ uy tín nền tảng:
* **Quy chuẩn tên gọi học thuật:** 100% đề thi trong CSDL MySQL (`jlpt_exams`) được định danh nhất quán:
  $$\text{Đề thi Mô phỏng Chuẩn JLPT [Level] - Kỳ [Tháng]/[Năm] (Cấu trúc JEES \& Shin Kanzen)}$$
* **Ý nghĩa:** Định vị rõ đây là **Bộ đề thi mô phỏng chất lượng cao (High-Standard Accredited Mock Exams)** được biên soạn và chuẩn hóa dựa trên cấu trúc khung của Ban tổ chức JLPT Nhật Bản (JEES & The Japan Foundation) kết hợp các giáo trình luyện thi hàng đầu.

### 1.2. Hai Định Dạng Bài Thi Linh Hoạt (Dual-Format Testing)
Hệ thống giải quyết bài toán cân bằng giữa áp lực phòng thi thực tế và thời gian ôn luyện hàng ngày:
1. ⚡ **Chế độ Tinh gọn (Express Mode - 34 câu / 16 Mondai)**:
   * **Thời gian:** 35 – 55 phút.
   * **Đặc điểm:** Tuyển chọn chính xác 34 câu hỏi tiêu biểu đại diện cho đầy đủ 16 dạng bài (Mondai) của đề thi thật từ Từ vựng, Ngữ pháp, Đọc hiểu đến Nghe hiểu.
   * **Mục đích:** Giúp người học bận rộn vẫn có thể kiểm tra toàn diện năng lực phản xạ mỗi ngày mà không bị quá tải.
2. 🏆 **Chế độ Thi Chuẩn Toàn Diện (Full Mode - 75 đến 105 câu)**:
   * **Thời gian:** 105 – 170 phút.
   * **Đặc điểm:** Tái hiện 100% độ dài và áp lực thời gian của kỳ thi thật chuẩn JEES (N5: 75 câu; N4: 85 câu; N3: 95 câu; N2-N1: 105 câu).
   * **Mục đích:** Rèn luyện sức bền tâm lý, phân bổ thời gian và chiến thuật làm bài trước ngày thi chính thức.

---

## 2. Kiến Trúc Bộ Đề & Quy Chuẩn Định Lượng

```
┌─────────────────────────────────────────────────────────────┐
│  KHO TRI THỨC HỌC THUẬT (KNOWLEDGE BASE)                     │
│  - Đề mẫu chính thức: JLPT Official Practice Workbooks      │
│  - Giáo trình: Shin Kanzen Master, Mimikara, Nihongo Sou-Matome│
│  - Văn bản thực tế: Báo chí Asahi, Mainichi, bài luận học thuật │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  ENGINE MÔ PHỎNG & TỔ CHỨC DỮ LIỆU                          │
│  - Đầy đủ 4 phân môn: Từ vựng・Ngữ pháp・Đọc hiểu・Nghe hiểu  │
│  - Phân bổ ngẫu nhiên đáp án đúng (loại bỏ bias vị trí)     │
│  - Lưu trữ quan hệ: jlpt_exams, jlpt_questions, attempts    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  BỘ LỌC XÁC THỰC SƯ PHẠM (PEDAGOGICAL GUARDRAILS)            │
│  - Độ dài Dokkai: Tanbun ≥ 350 từ, Choubun ≥ 900 từ (N3-N1) │
│  - 3 Phương án gây nhiễu (Distractors) có tính bẫy học thuật│
│  - Kế thừa ngữ cảnh: 100% câu hỏi con có bài đọc đầy đủ     │
└─────────────────────────────────────────────────────────────┘
```

### 2.1. Quy chuẩn định lượng phần Đọc hiểu (Dokkai) từ N5 đến N1

| Cấp độ | Dạng bài | Số bài & câu hỏi | Độ dài chữ tối thiểu | Chủ đề văn bản thực tế |
| :---: | :--- | :---: | :---: | :--- |
| **N5** | • Đoạn văn ngắn (短文)<br>• Đoạn văn vừa (中文)<br>• Tra cứu thông tin (情報検索) | 3 bài (3 câu)<br>1 bài (1 câu)<br>1 bài (2 câu) | **80 - 150 chữ**<br>**250 chữ**<br>**250 chữ** | Cuộc sống hàng ngày, gia đình, thời gian biểu, bảng thông báo lớp học. |
| **N4** | • Đoạn văn ngắn<br>• Đoạn văn vừa<br>• Tra cứu thông tin | 4 bài (4 câu)<br>1 bài (4 câu)<br>1 bài (2 câu) | **150 - 200 chữ**<br>**450 chữ**<br>**400 chữ** | Thư từ, công việc văn phòng, thông báo di chuyển, thể thao. |
| **N3** | • Đoạn văn ngắn<br>• Đoạn văn vừa<br>• Trường văn (長文)<br>• Tra cứu thông tin | 4 bài (4 câu)<br>2 bài (6 câu)<br>1 bài (4 câu)<br>1 bài (2 câu) | **350 chữ/bài**<br>**600 chữ/bài**<br>**900 chữ/bài**<br>**600 chữ/bài** | Bình luận xã hội, tâm lý học đời sống, thói quen sinh hoạt, tờ rơi thông báo. |
| **N2** | • Đoạn văn ngắn<br>• Đoạn văn vừa<br>• So sánh tổng hợp (統合理解)<br>• Trường văn<br>• Tra cứu thông tin | 5 bài (5 câu)<br>3 bài (9 câu)<br>1 bài (2 câu)<br>1 bài (3 câu)<br>1 bài (2 câu) | **350 chữ/bài**<br>**550 chữ/bài**<br>**600 chữ/bài**<br>**900 chữ/bài**<br>**700 chữ/bài** | Khoa học kỹ thuật, kinh tế, văn hóa doanh nghiệp, bảo vệ môi trường. |
| **N1** | • Đoạn văn ngắn<br>• Đoạn văn vừa<br>• Trường văn<br>• So sánh tổng hợp<br>• Luận giải quan điểm (論説文)<br>• Tra cứu thông tin | 4 bài (4 câu)<br>3 bài (9 câu)<br>1 bài (4 câu)<br>1 bài (3 câu)<br>1 bài (3 câu)<br>1 bài (2 câu) | **350 chữ/bài**<br>**600 chữ/bài**<br>**1.000 chữ/bài**<br>**800 chữ/bài**<br>**1.200 chữ/bài**<br>**700 chữ/bài** | Triết học nhận thức, bản chất ngôn ngữ, kinh tế vĩ mô, mỹ học, xã hội học chuyên sâu. |

---

## 3. Kiến Trúc Âm Thanh Nghe Hiểu (Choukai Multi-Voice Audio Engine)

### 3.1. Phân Vai Hội Thoại Tự Động (Dialogue Role Parser)
Phần thi Nghe hiểu Choukai yêu cầu phân biệt rõ ràng giữa lời dẫn đề, lời thoại nam và lời thoại nữ:
* `[NARRATOR]`: Giọng đọc trung tính dẫn đề và đặt câu hỏi (`ja-JP-NaokiNeural`).
* `[MALE]`: Giọng nam ấm áp, chuẩn ngữ điệu Tokyo (`ja-JP-KeitaNeural`).
* `[FEMALE]`: Giọng nữ phát thanh viên tự nhiên (`ja-JP-NanamiNeural`).
* **Hiệu ứng phòng thi thật:**
  * **Chime Effect:** Tiếng chuông *Ding-dong* âm vang mở đầu phần thi.
  * **Khoảng lặng tĩnh (Silence Gap):** Tự động chèn **10 – 15 giây khoảng lặng** sau câu hỏi để thí sinh có thời gian tư duy và chọn đáp án trước khi qua câu tiếp theo.

### 3.2. Khắc Phục Lỗi Lặp Âm & Làm Sạch Furigana Cho Bộ Đọc TTS
* **Vấn đề đã xử lý:** Khi câu hỏi hoặc đáp án chứa thẻ HTML `<ruby>漢字<rt>かんじ</rt></ruby>`, bộ đọc Web Speech API sẽ đọc cả chữ Hán lẫn chữ Furigana nhỏ, gây ra hiện tượng phát âm lặp lại đôi (`漢字かんじ`).
* **Giải pháp kỹ thuật (`cleanJapaneseTextForSpeech`):**
  - Tách bỏ hoàn toàn nội dung nằm trong thẻ `<rt>...</rt>` và loại bỏ các thẻ `<ruby>`, `<rp>`.
  - Khử các ký tự markdown thừa, chỉ giữ lại chuỗi chữ Hán và Kana nguyên bản.
  - Ngăn chặn phát lại trùng lặp bằng cờ kiểm soát trạng thái âm thanh `isPlayingRef`.

---

## 4. Thuật Toán Chấm Điểm Chuẩn JEES 180 Điểm

### 4.1. Thang Điểm & Phân Môn
Bài thi được tính trên tổng thang điểm **180 điểm**, chia đều cho 3 hợp phần cốt lõi:
1. **Kiến thức ngôn ngữ (Từ vựng + Ngữ pháp):** Tối đa **60 điểm**.
2. **Đọc hiểu (Dokkai):** Tối đa **60 điểm**.
3. **Nghe hiểu (Choukai):** Tối đa **60 điểm**.

### 4.2. Điều Kiện Đỗ & Điểm Liệt (Sectional Passing Criteria)
Thí sinh chỉ được công nhận ĐỖ nếu thỏa mãn **đồng thời cả 2 điều kiện**:
1. **Tổng điểm đạt mức điểm chuẩn (Passing Score):**
   * **N1:** $\ge 100/180$
   * **N2:** $\ge 90/180$
   * **N3:** $\ge 95/180$
   * **N4:** $\ge 90/180$
   * **N5:** $\ge 80/180$
2. **Không bị dính Điểm Liệt (Sectional Failure):**
   * Điểm của từng phân môn bắt buộc phải $\ge 19/60$ điểm.
   * Nếu bất kỳ phân môn nào $< 19$ điểm, thí sinh bị tính là **TRƯỢT** ngay lập tức dù tổng điểm có vượt điểm chuẩn.

---

## 5. Ngân Hàng Câu Hỏi Làm Sai & Ôn Luyện SRS (Mistake Bank)

### 5.1. Thu Gom Tự Động Sau Khi Nộp Bài (Auto-Harvesting)
* Khi học viên hoàn thành bài thi và nộp bài, hệ thống tự động lọc toàn bộ các câu hỏi có đáp án sai.
* Học viên có thể bấm **"Lưu tất cả câu sai vào Sổ tay"** bằng 1 chạm hoặc chọn lưu từng câu riêng lẻ.
* Các câu sai được gắn nhãn cấp độ (N5-N1), nguồn đề thi, và khởi tạo trạng thái SRS `LEARNING`.

### 5.2. Chế Độ Xem Thu Gọn (Accordion Compact Mode) Chống Mỏi Mắt
Đối với các bài thi đầy đủ có nhiều câu làm sai, giao diện trang bị 2 chế độ hiển thị:
1. **Chế độ Thu gọn (Compact Mode):**
   * Hiển thị dạng hàng thẻ nhỏ gọn (Card Accordion).
   * Đi kèm 2 huy hiệu trực quan nổi bật:
     * `✕ Bạn chọn: [Nội dung phương án sai]` (Viền đỏ).
     * `🎯 Đáp án đúng: [Nội dung phương án đúng]` (Viền xanh lá).
   * Không chiếm không gian cuộn trang, giúp học viên quét nhanh danh sách lỗi sai trong vài giây.
2. **Chế độ Mở rộng (Expanded Mode):**
   * Nút **"Mở/Đóng tất cả"** hoặc mở chi tiết từng câu hỏi.
   * Hiển thị đầy đủ 4 phương án lựa chọn, bài đọc ngữ cảnh, bản dịch tiếng Việt song ngữ.
   * Khu vực phân tích chuyên sâu của AI: Giải thích nguyên nhân bẫy thi, phân tích ngữ pháp liên quan, và mẹo nhớ để không tái phạm.
3. **Sửa lỗi hiển thị & Font chữ:**
   * Áp dụng `renderQuestionText` kết xuất an toàn HTML/Furigana thay vì in thô chuỗi JSON escape.
   * Bỏ hiệu ứng gạch ngang (`line-through`) gây rối mắt, phân tách rõ khu vực so sánh kết quả và 4 đáp án nguyên bản.

### 5.3. Tích Hợp Lặp Lại Ngắt Quãng (Spaced Repetition System - SM-2)
* Các câu hỏi trong Ngân hàng câu sai được đưa vào chu trình ôn tập ngắt quãng:
  * Đánh giá độ khó ôn tập theo thang chất lượng (0 đến 5).
  * Tự động tính toán ngày ôn tập kế tiếp (`nextReviewAt`) và hệ số ghi nhớ (`easeFactor`, `interval`).
  * Khi đạt trạng thái `MASTERED`, câu hỏi sẽ được đánh dấu đã thành thạo và chuyển sang mục lưu trữ.

---

## 6. Đánh Giá Sư Phạm: Người Thi vs. Người Ra Đề

| Tiêu chí | Dưới góc nhìn Người thi (Test-Taker) | Dưới góc nhìn Người ra đề (Examiner) |
| :--- | :--- | :--- |
| **Phân bổ thời gian** | Đồng hồ đếm ngược, cảnh báo pacing time từng phần. | Đảm bảo tỷ lệ câu hỏi khớp với thời lượng tiêu chuẩn phòng thi. |
| **Phân tích bẫy thi** | So sánh trực quan bạn chọn vs đáp án đúng, giải thích bẫy. | Xây dựng 3 phương án nhiễu có cơ sở ngôn ngữ học thực thụ. |
| **Ôn tập điểm yếu** | Lưu tự động vào Ngân hàng câu sai, luyện tập flashcard SRS. | Phân nhóm câu hỏi theo Mondai để chẩn đoán chính xác lỗ hổng. |
| **Tính chân thực** | Âm thanh hội thoại Tokyo bản xứ, bài đọc chuẩn độ dài. | Sử dụng văn phong nghị luận học thuật từ báo chí và đề mẫu chính thức. |
