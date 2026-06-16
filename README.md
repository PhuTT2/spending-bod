# Hỏi HĐQT Tài Chính

Trình mọi khoản chi lớn cho một "hội đồng quản trị" AI duyệt trước khi bạn quẹt thẻ.

## Kiến trúc

```
[React + Vite]  ──fetch /api──▶  [FastAPI]
   src/                            backend/app/
                                     engine/      ← rule engine, zero AI dependency
                                     narration/    ← optional AI plug-in (Gemini + fallback)
                                     routers/      ← HTTP layer
```

- **Functional-first**: every score and decision comes from `backend/app/engine/` — pure
  Python, no network calls, fully testable without any AI provider configured.
- **Model-agnostic**: `backend/app/narration/` wraps the AI layer behind one interface
  (`NarrationProvider`). It only narrates an already-finished decision; it never computes one.
  Missing/invalid API key → automatic deterministic fallback, never a crash.
- **Thresholds live in config, not code**: `config/financial_rules.json`.

See [backend/app/models.py](backend/app/models.py) for the full API contract — it's the
single source of truth both the frontend and any future automated agent (e.g. a GreenNode
AgentBase agent calling `POST /api/proposals/evaluate` directly) consume.

## Chạy local

### 1. Backend (Python 3.11+)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
```

### 2. Frontend

```bash
npm install
```

### 3. Dev (hai process, một lệnh)

```bash
npm run dev
```

Vite chạy ở `:3000` và proxy `/api/*` sang FastAPI ở `:8000`. Truy cập `http://localhost:3000`.

(`npm run dev` chạy đồng thời `vite` và `npm run dev:api` qua `concurrently` — đảm bảo venv ở
`backend/.venv` đã activate, hoặc `uvicorn` đã có sẵn trên PATH, trước khi gọi lệnh này.)

### 4. Production

```bash
npm run build      # build frontend -> dist/
npm run start       # FastAPI phục vụ cả /api và dist/ trên cùng port :3000
```

## API chính

| Method | Path | Mô tả |
|---|---|---|
| GET/PUT | `/api/profile` | Đọc/ghi toàn bộ trạng thái (profile, history, challenges) |
| POST | `/api/profile/preview` | Tính trước personality/health score, không lưu |
| POST | `/api/proposals/evaluate` | Chấm điểm thuần túy, không qua AI — endpoint cho agent |
| POST | `/api/proposals/debate` | Chấm điểm + tường thuật phiên họp HĐQT (AI tùy chọn) |
| POST | `/api/proposals/resolve` | Áp dụng lựa chọn tuân thủ/bất chấp của người dùng |

## Cấu hình

Tạo `.env` ở root (xem `.env.example`). `GEMINI_API_KEY` là tùy chọn — không có thì hệ thống
tự dùng tường thuật mặc định, không lỗi.
