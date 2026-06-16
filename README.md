# Hỏi HĐQT Tài Chính (Virtual Board of Directors - FinRoast)

> Dự án chuyển hóa thói quen quản lý tài chính cá nhân thành trò chơi quản trị doanh nghiệp kịch tính. HĐQT bao gồm các thành viên với tính cách cá biệt sẵn sàng tranh luận, bỏ phiếu, và roast sên sế dở khóc dở cười về mỗi đề xuất chi tiêu của bạn.

---

## 🚀 Tổng quan dự án

Hệ thống được thiết kế theo trường phái **Functional-First** (Đặt quy tắc tài chính cứng lên hàng đầu) và **Model-Agnostic** (Không phụ thuộc cứng vào bất kỳ mô hình AI nào). 

Mọi lý thuyết, phép tính, điểm số và biểu quyết thô được quyết định 100% bằng thuật toán TypeScript chính xác, trong khi mô hình ngôn ngữ lớn (Gemini 3.5 Flash) đóng vai trò **Presentation Layer** dịch các điểm số khô khan thành kịch bản đối thoại sống động, hóm hỉnh và sâu sắc.

---

## 🛠️ Kiến Trúc Hệ Thống (Architecture Overview)

Dự án sử dụng mô hình full-stack tích hợp giữa **Vite (React + TS) ở Frontend** và **Express ở Backend** với kiến trúc phân lớp toàn diện:

```
[Onboarding] ──> [Thiết lập Tài Sản & Persona]
                          │
                          ▼ (Lưu snapshot cơ sở)
[Nhập Đề Xuất] ─> [Rule Engine - DecisionCore] ──> [Deterministic JSON]
                          │                                │
                          ▼ (Gemini Presentation Layer)    ▼ (Tracing)
                       [Dịch Boardroom Roast]       [ZaloPay Products & CTA]
```

### Các modules cốt lõi trong hệ thống:
1. **DecisionCore Rules Engine** (`src/decisionCore.ts`): Trực tiếp tính toán khả năng chi trả (Affordability), thanh khoản (Liquidity), nợ (Debt Burden), mục tiêu dài hạn (Goal Alignment) và kỷ luật (Discipline Fit).
2. **Product Catalog & Ranking Engine** (`src/productCatalog.ts`): Ánh xạ đề xuất của người dùng tới các sản phẩm tài chính thực tế phù hợp (như Tài Khoản Tích Lũy ZaloPay, Ví Trả Sau BNPL ZaloPay, Bảo hiểm Sức khỏe).
3. **Model Narration Layer** (`src/llmProvider.ts`): Tận dụng Gemini API để làm sống động kết quả, hóa thân thành 8 thành viên HĐQT cãi nhau như tấu hài.
4. **Input Cooldown & Sanity Checks** (`server.ts`): Ngăn chặn spam đề xuất vô nghĩa và khóa cooldown tạm thời khi sếp liên tục bị bác bỏ đề xuất nhằm giữ gìn kỷ luật dòng tiền.

---

## 📂 Danh mục tài liệu kỹ thuật chi tiết

Đọc thêm các bản mô tả chuyên môn phục vụ quá trình bàn giao (handoff):
*   📄 **[TECHNICAL HANDOFF GUIDE (HANDOFF.md)](./HANDOFF.md)**: Chi tiết luồng người dùng ở frontend (User Flows) và kiến trúc chi tiết từng Engine ở backend.
*   📐 **[SYSTEM ARCHITECTURE (ARCHITECTURE.md)](./ARCHITECTURE.md)**: Triết lý kiến trúc, phân rã các lớp và chiến lược Abstraction của LLM.
*   📊 **[DATABASE SCHEMA SPECS (SCHEMA_SPEC.md)](./SCHEMA_SPEC.md)**: Cấu trúc JSON Schema, trạng thái baseline, Snapshots đóng băng và kết quả thẩm định.

---

## 💻 Cài đặt & Khởi chạy nhanh (Quick Start)

### 1. Cài đặt các biến môi trường
Tạo file `.env` ở root dự án và khai báo khóa API của bạn:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Khởi chạy chế độ phát triển (Development)
```bash
# Cài đặt thư viện liên quan
npm install

# Chạy server lập trình phát triển (bao gồm Vite middleware)
npm run dev
```
Truy cập ứng dụng tại địa chỉ: `http://localhost:3000`

### 3. Đóng gói & Khởi chạy phân phối sản xuất (Production Build)
```bash
# Biên dịch Frontend tĩnh và đóng gói Backend sang file đơn bằng Esbuild
npm run build

# Khởi chạy ứng dụng Standalone chính thức
npm run start
```

---

## 🎨 Trải nghiệm người dùng cốt lõi (User Journey)

1.  **Bước 1: Onboarding thông thái**: Ký bản cam kết tài phiệt, khai báo thu nhập, tích lũy hiện có và thiết lập tính cách (Người thám hiểm, Người tích lũy, Nhà đầu tư...).
2.  **Bước 2: Giai đoạn nộp Tờ Trình**: Đệ trình dự án tiêu dùng (ví dụ: "Mua xe Honda SH", "Trứng rán cần mỡ mua sắm đồ hiệu") cùng bối cảnh tâm sự.
3.  **Bước 3: Đại hội võ lâm Boardroom**: Đọc trực tiếp cuộc họp HĐQT tấu hài sâu cay nhắm thẳng vào ví tiền, xem bảng điểm kỷ luật biến động và phán quyết tối hậu.
4.  **Bước 4: Trầm trồ với Mô Phỏng Tương Lai**: So sánh 2 kịch bản "Bất chấp quẹt" vs "Kiên nhẫn tích sản", nhận gợi ý giải pháp tài chính ZaloPay tối hảo.
5.  **Bước 5: Thách thức Thép**: Rèn luyện kỷ luật offline thông qua các Quest có phần thưởng tăng Discipline Score để tối thắng tài khóa.
