# Bàn giao phiên làm việc — Refactor functional-first FastAPI

> File này dành cho session Claude Code tiếp theo đọc để tiếp tục công việc
> mà không cần dò lại từ đầu. Có thể xóa file này sau khi đã đọc/hấp thụ.

## Tình trạng hiện tại

- **Repo**: `C:\Users\LAP15663\spending-bod\spending-bod` — git local, **không có remote** (chưa push lên đâu).
- **Branch đang làm**: `refactor/functional-first-fastapi` (KHÔNG phải `master`). `master` vẫn còn ở baseline cũ (commit `02fe96c`).
- **5 commit đã có trên branch** (theo thứ tự):
  1. `02fe96c` — baseline checkpoint trước khi refactor (trạng thái gốc của user, để rollback nếu cần)
  2. `3d148e9` — backend: thay Express/decisionCore.ts bằng FastAPI Python (`backend/`)
  3. `0d0a6aa` — fix bug ProfileView thiếu field + frontend types.ts
  4. `c42c626` — rewrite toàn bộ frontend components theo contract mới
  5. `b99fde0` — thêm Dockerfile/.dockerignore/docker-compose.yml (**chưa test được**, xem phần Docker dưới)

## Việc đã yêu cầu & đã làm xong

User yêu cầu refactor toàn bộ project (frontend + backend) theo hướng functional-first:
- Backend: dọn logic engine, tách AI ra làm plug-in (không phụ thuộc), expose FastAPI clean, xóa dead code, đảm bảo mọi thứ frontend gọi đều có route thật.
- Frontend: bỏ text giải thích dài, UI/UX hiện đại tối giản, onboarding nói rõ app làm gì trong 1 câu, xóa component không gọi backend thật.
- Audit kết nối FE↔BE, xóa endpoint không ai gọi, đảm bảo app chạy end-to-end không lỗi.

**Đã hoàn thành toàn bộ** (xem chi tiết trong message log của session trước, hoặc đọc commit messages — viết rất kỹ). Tóm tắt:

### Backend (`backend/app/`)
- `engine/` — rule engine thuần Python, **không import AI gì cả**, gọi trực tiếp được (kể cả từ agent ngoài qua `POST /api/proposals/evaluate`).
  - `scoring.py` — orchestrator chính (`evaluate()`), port từ `decisionCore.ts` cũ + sửa vài bug thật (liquidity score không khớp explainability, overall_score hardcode 80, investments_balance bị thu thập nhưng không dùng, debt burden không tính BNPL hiện có, cooldown không bao giờ hết hạn).
  - `categories.py` — phân loại category + intent (ưu tiên `intent_hint` do user chọn ở form, không còn bị regex đè).
  - `products.py` — catalog sản phẩm ZaloPay + matching.
  - `profile.py` — personality label / health score / discipline score khởi điểm (trước đây bị duplicate ở 3 file frontend khác nhau, giờ chỉ tính 1 nơi).
  - `decisions.py` — áp dụng lựa chọn tuân thủ/bất chấp của user (trước đây nằm trong React event handler).
- `narration/` — AI plug-in (Gemini + fallback xác định), engine không biết package này tồn tại.
- `routers/` — `profile.py` (`GET/PUT /api/profile`, `POST /api/profile/preview`), `proposals.py` (`evaluate`/`debate`/`resolve`).
- `store.py` — in-memory state (chưa có DB thật, đúng scope MVP ban đầu).
- `models.py` — **nguồn sự thật duy nhất** cho toàn bộ contract API (Pydantic). Đọc file này trước khi sửa bất cứ gì.
- Config: `config/financial_rules.json` (ở root repo, không phải trong `backend/`) — chứa mọi ngưỡng/hằng số, đã mở rộng thêm `score_weights`, `health_score_weights`, `cooldown`, `investment_liquidity_haircut`, `bnpl_installment_months`, `default_fixed_expense_ratio`.

### Frontend (`src/`)
- `types.ts` — mirror 1:1 `backend/app/models.py` (snake_case, khớp JSON thật từ FastAPI).
- `App.tsx` — state trung tâm là `ProfileView` (1 object), không còn tính điểm kỷ luật ở client (gọi `POST /api/proposals/resolve`).
- `OnboardingFlow.tsx` — câu hero 1 dòng, bỏ field password (giả/không dùng), sửa 2 slider (investing/safety) trước đây tồn tại trong state nhưng KHÔNG render ra UI, gọi `POST /api/profile/preview` để hiện điểm trước khi confirm.
- `BoardRoom.tsx` — có thêm panel "🔍 Vì sao?" (explainability — trước đây backend tính nhưng FE bỏ hoàn toàn).
- `DashboardTab.tsx` / `UserProfileCard.tsx` — không còn tự tính personality/health score, chỉ hiển thị field `computed` từ backend.
- Các file khác (`NewProposalForm`, `HistoryTab`, `GoalsTab`, `DisciplineChallenges`, `BoardRoomTab`, `NewProposalTab`) đã update theo field name mới (snake_case).

### Đã xóa (dead code xác nhận)
`server.ts`, `replace.ts`, `src/decisionCore.ts`, `src/productCatalog.ts`, `src/llmProvider.ts`, endpoint `/api/admin/logs` + `/api/admin/metrics` (không ai gọi), `classifyPersona()` (tính ra nhưng không hiển thị đâu), types `FinancialRequest`/`ProfileSnapshot` (chưa từng implement thật), field "Timing" trong NewProposalForm (chỉ cosmetic, BE không dùng), docs cũ `ARCHITECTURE.md`/`HANDOFF.md`/`SCHEMA_SPEC.md` (mô tả hệ thống TS cũ, gây hiểu sai — đã gộp vào `README.md` mới).

## Đã verify (không chỉ review code suông)

- `tsc --noEmit` sạch, `npm run build` sạch.
- Engine Python chạy độc lập đúng logic (test case affordable/over-budget/insane/intent_hint).
- End-to-end qua đúng topology thật: Vite:3000 proxy → FastAPI:8000 (dev), và FastAPI:3000 serve cả 2 (prod) — đi hết luồng onboarding → debate (fallback narration vì không có GEMINI_API_KEY) → resolve → reload vẫn giữ history.
- Cooldown 30 phút hoạt động đúng (test bắn 3 lần reject liên tiếp → bị khóa 429).

## Việc CHƯA xong / đang chờ quyết định

### 1. Docker — file đã viết, CHƯA build/test được
`Dockerfile`, `.dockerignore`, `docker-compose.yml` đã có ở root, multi-stage (Node build frontend → Python/FastAPI serve cả API + dist/ trên port 3000). **Chưa verify được vì Docker Desktop trên máy này không khởi động được engine** — thiếu WSL2 (cần quyền admin + reboot máy, claude không tự làm được vì sẽ làm gián đoạn máy user).

Đã hỏi user 2 lựa chọn, **user dismiss câu hỏi (chưa trả lời)**:
- (a) User tự mở PowerShell Admin chạy `wsl --install` (hoặc 2 lệnh DISM trong câu hỏi cũ) rồi reboot, báo lại để Claude build+test image.
- (b) Bỏ qua Docker, chỉ dùng native (đã chạy tốt rồi).

→ **Session tiếp theo nên hỏi lại user xem đã chạy WSL2 + reboot chưa**, nếu rồi thì chạy:
```bash
cd "C:\Users\LAP15663\spending-bod\spending-bod"
docker compose up --build
# rồi curl http://localhost:3000/ và http://localhost:3000/api/health để verify
```
Nếu daemon vẫn không lên được, kiểm tra `docker ps` trước, đừng giả định nó chạy.

### 2. npm audit — 2 lỗ hổng dev-only chưa fix
- `esbuild`/`vite` (high) — fix cần nâng `vite` lên v8 (breaking change), **chưa làm** vì rủi ro vỡ build giữa lúc refactor.
- `concurrently`/`shell-quote` (critical, nhưng chỉ ảnh hưởng dev script local) — `npm audit fix` không tự fix được trong nhánh hiện tại.
→ Cả 2 đều chỉ ảnh hưởng tooling dev, không nằm trong bundle production hay backend. Để lại, có thể xử lý riêng khi rảnh.

### 3. Chưa merge vào `master`
Toàn bộ nằm trên branch `refactor/functional-first-fastapi`. User chưa yêu cầu merge — đừng tự merge/push khi chưa hỏi.

## Cách chạy lại môi trường dev (process nền của session cũ đã chết khi session đóng)

Máy này **trước đây không có Python/Node**, session trước đã cài:
- Python 3.12.10 tại `C:\Users\LAP15663\AppData\Local\Programs\Python\Python312\python.exe`
- Node.js LTS (v24.16.0) tại `C:\Program Files\nodejs\`

⚠️ **PATH trong Bash tool bị stale** (không thấy 2 cái trên trừ khi export thủ công mỗi lần mở shell mới):
```bash
export PATH="/c/Program Files/nodejs:/c/Users/LAP15663/spending-bod/spending-bod/backend/.venv/Scripts:$PATH"
```
PowerShell tool có vẻ đọc PATH tươi hơn (đã thấy `node`/`npm` không cần export lại trong vài lần test), nhưng để chắc cứ export.

Venv Python đã có sẵn ở `backend/.venv` (đã `pip install -r backend/requirements.txt` rồi, không cần cài lại trừ khi đổi máy).

Khởi động dev (2 process):
```bash
cd backend && ./.venv/Scripts/python.exe -m uvicorn app.main:app --port 8000 &
cd .. && npx vite --port 3000 &
```
Mở `http://localhost:3000`.

Build production thử (không cần Docker):
```bash
npm run build
cd backend && NODE_ENV=production ./.venv/Scripts/python.exe -m uvicorn app.main:app --port 3000 --app-dir .
```

## Lưu ý quan trọng khác

- `.env` **không tồn tại** ở máy này (gitignored, chưa ai tạo) → `GEMINI_API_KEY` trống → narration luôn dùng `FallbackProvider` (canned, không lỗi). Nếu user đưa key thật, tạo `.env` theo mẫu `.env.example`.
- Mọi magic number trùng lặp cũ (tỷ lệ chi phí cố định, trọng số sức khỏe...) giờ chỉ còn 1 nơi: `config/financial_rules.json`. Đừng hardcode số mới vào code Python/TS nữa — thêm vào file rules.
- `backend/app/models.py` là **hợp đồng API duy nhất** — sửa field gì cũng sửa ở đây trước, rồi đồng bộ `src/types.ts` (snake_case, đặt tên giống y).
