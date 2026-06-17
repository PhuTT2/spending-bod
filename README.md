# 🕴️ Hội đồng quản trị Tài Chính

> **GreenNode Claw-a-thon 2026** — AI-powered personal finance board built on GreenNode AgentBase

[![Live Demo](https://img.shields.io/badge/Live%20Demo-AgentBase-6366f1?style=for-the-badge)](https://endpoint-8fd7a194-2b2c-411b-b4a6-097ae6836767.agentbase-runtime.aiplatform.vngcloud.vn)

---

## Vấn đề

Chi tiêu cá nhân thường bị quyết định bởi cảm xúc nhất thời — không có ai phản biện, không có bối cảnh tài chính đầy đủ, không có quy trình ra quyết định có cấu trúc. Kết quả: mua sắm ngẫu hứng, vượt ngân sách, mục tiêu tài chính bị trì hoãn vô thời hạn.

Đây là vấn đề phổ biến với **Gen Z và Millennials đi làm** — thu nhập đủ sống tốt nhưng thiếu kỷ luật tài chính và thiếu công cụ ra quyết định phù hợp.

---

## Người dùng mục tiêu

Nhân viên đi làm (22–35 tuổi) có thu nhập ổn định, muốn kiểm soát chi tiêu và đạt mục tiêu tài chính dài hạn (du lịch, mua nhà, đầu tư) nhưng hay "tự thuyết phục" mình mua những thứ không cần thiết.

---

## Cách agent giải quyết

Hội đồng quản trị Tài Chính là một **multi-persona AI agent** mô phỏng một hội đồng gồm 9 thành viên đại diện cho các chiều kích tài chính khác nhau (tiết kiệm, đầu tư, rủi ro, trải nghiệm, đòn bẩy...). Mỗi khi người dùng muốn chi tiêu một khoản tiền, họ phải "đệ trình" lên hội đồng để được phán xét.

### Luồng hoạt động

```
User điền đề xuất (tên, số tiền, loại chi tiêu)
        ↓
AI hỏi thêm bối cảnh tài chính (qua /api/chat/followup)
        ↓
User chọn thành viên Hội đồng tham gia tranh luận (mặc định: tất cả 9)
        ↓
Engine đánh giá tài chính (affordability, goal impact, risk level)
        ↓
AI narration sinh ra cuộc tranh luận giữa các thành viên được chọn
        ↓
Phán quyết: Approve / Approve with conditions / Delay / Reject
        ↓
User chọn Tuân theo hoặc Bất tuân → cập nhật điểm kỷ luật
```

### Các agent/module chạy trên GreenNode AgentBase

| Module | Vai trò | Model |
|--------|---------|-------|
| **Narration Agent** | Sinh ra lời thoại tranh luận của 9 thành viên HĐQT | `google/gemma-4-31b-it` |
| **Follow-up Agent** | Hỏi thêm bối cảnh tài chính trước khi đánh giá | `google/gemma-4-31b-it` |
| **Advice Agent** | Tư vấn tài chính tổng quát dựa trên profile | `google/gemma-4-31b-it` |
| **Evaluation Engine** | Rule-based scoring (không dùng LLM) | — |

Toàn bộ backend chạy trên **GreenNode AgentBase Runtime** (`runtime-s2-general-2x4`), frontend React được serve cùng container.

---

## Tính năng nổi bật

- **Wizard 2 bước**: điền đề xuất → AI hỏi bối cảnh → trình lên Hội đồng với context đầy đủ
- **Chọn thành viên tranh luận**: user tự chọn ai trong 9 thành viên sẽ tham gia phán xét đề xuất
- **Xem tranh luận linh hoạt**: chuyển đổi giữa "Từng người" (cinematic) và "Tất cả cùng lúc" (scrollable timeline)
- **Phương án chi tiêu thông minh**: với đề xuất du lịch hoặc giải trí, AI tự động gợi ý phân bổ ngân sách theo hạng mục (vé, khách sạn, ăn uống...) kèm link đặt trực tiếp (Traveloka, CGV, Agoda...)
- **Hồ sơ tài chính inline**: chỉnh thu nhập, số dư tiền mặt, và số dư đầu tư ngay trong sidebar — không cần đăng xuất. Cảnh báo nếu số dư chưa điền (engine dùng để tính khả năng chi trả)
- **Mẫu nhanh**: 5 template phổ biến + "Khác" để tự điền hoàn toàn

## Giá trị mang lại

| Trước | Sau |
|-------|-----|
| Quyết định chi tiêu trong vài giây theo cảm xúc | Quy trình có cấu trúc: điền → AI hỏi bối cảnh → hội đồng phán xét |
| Không biết chi tiêu ảnh hưởng tới mục tiêu thế nào | Xem ngay tác động lên emergency fund, goal progress, liquidity |
| Không có ai phản biện | 9 persona AI với quan điểm khác nhau tranh luận trước khi ra phán quyết |
| Kỷ luật tài chính không đo được | Điểm kỷ luật tăng/giảm theo từng quyết định, lưu lịch sử |

---

## Tech Stack

```
Frontend   React 18 + TypeScript + Vite + Tailwind CSS
Backend    Python FastAPI
AI         GreenNode MaaS (OpenAI-compatible API)
Runtime    GreenNode AgentBase (Docker container)
Registry   VNG Container Registry (VCR)
```

---

## Cài đặt local

```bash
# 1. Clone repo
git clone <repo-url>
cd spending-bod

# 2. Copy và điền credentials
cp .env.example .env
# Điền LLM_API_KEY và các giá trị cần thiết vào .env

# 3. Chạy backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 4. Chạy frontend (tab khác)
cd ..
npm install
npm run dev
```

---

## Deploy lên GreenNode AgentBase

```bash
# Build Docker image
docker build -t <image-tag> .

# Push lên VCR
docker push <image-tag>

# Update runtime
bash runtime.sh update <runtime-id> --image <image-tag> --flavor runtime-s2-general-2x4 --env-file .env --from-cr
```

---

## Cấu trúc project

```
spending-bod/
├── backend/
│   ├── app/
│   │   ├── engine/          # Evaluation engine (rule-based)
│   │   │   ├── profile.py   # Health score computation
│   │   │   └── products.py  # Zalopay product recommendation
│   │   ├── narration/       # AI narration providers
│   │   ├── routers/         # FastAPI routers
│   │   └── models.py        # Pydantic models
│   └── requirements.txt
├── src/
│   ├── components/          # React components
│   │   ├── NewProposalTab   # Wizard: đề xuất + AI follow-up
│   │   ├── BoardRoomTab     # Kết quả tranh luận HĐQT
│   │   ├── GoalsTab         # Quản lý mục tiêu tài chính
│   │   └── SplashScreen     # Onboarding với Zalopay integration
│   └── types.ts             # TypeScript types (mirrors backend models)
├── .env.example             # Template biến môi trường
├── Dockerfile               # Multi-stage build (Node + Python)
└── README.md
```

---

## Live Demo

🔗 **Endpoint**: `https://endpoint-8fd7a194-2b2c-411b-b4a6-097ae6836767.agentbase-runtime.aiplatform.vngcloud.vn`

Mở tab ẩn danh, truy cập link trên, tạo profile và thử đệ trình một khoản chi tiêu lên Hội đồng quản trị.
