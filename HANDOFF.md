# Hỏi HĐQT Tài Chính - Technical Handoff Guide

Tài liệu này cung cấp chi tiết kỹ thuật toàn diện về **Luồng Người Dùng (Frontend User Flow)** và **Kiến Trúc Động Cơ Backend (Backend Engine Architecture)** để đảm bảo quá trình bàn giao, kiểm toán mã nguồn và mở rộng hệ thống diễn ra liền mạch, an toàn và chuyên nghiệp nhất.

---

##  PART I: LUỒNG NGƯỜI DÙNG FRONTEND (FRONTEND USER FLOWS)

Màn hình Client-Side là một Single Page Application (SPA) viết bằng **React 19**, **Vite**, và **Tailwind CSS**. Ứng dụng quản trị trạng thái người dùng tập trung bằng React State hooks trong `App.tsx` và đồng bộ qua API với Backend.

```
                  ┌──────────────────────┐
                  │ 1. Onboarding Flow   │
                  └──────────┬───────────┘
                             │ (Lưu Profile lên Backend)
                             ▼
                  ┌──────────────────────┐
                  │ 2. Main Dashboard    │◀─────────────────────────┐
                  └────┬────────────┬────┘                          │
                       │            │                               │
                       │ (Nộp tờ    │ (Xem mục tiêu                 │
                       │  trình)    │  & thách thức)                │
                       ▼            ▼                               │
  ┌──────────────────────┐        ┌──────────────────────┐          │
  │ 3. New Proposal Form │        │ 5. Goals & Challenges│          │
  └──────────┬───────────┘        └──────────┬───────────┘          │
             │                               │                      │
             ▼ (Gọi API /board/debate)       ▼ (Nút góp tích lũy)   │
  ┌──────────────────────┐        ┌──────────────────────┐          │
  │ 4. Live Boardroom    ├───────▶│ Gạt bỏ bớt thặng dư  ├──────────┘
  │    (Animated Roast)  │        │ bồi hũ Heo đất       │
  └──────────────────────┘        └──────────────────────┘
```

### 1. Luồng khai báo cốt lõi (Onboarding Flow)
*   **File đảm nhận**: `src/components/OnboardingFlow.tsx`
*   **Kịch bản**: Khách hàng lần đầu mở app sẽ được chào đón bằng giao diện ký Cam kết tài chính kiêu hãnh.
    *   **Nhập dữ liệu**: CEO khai báo Thu nhập tháng, Tích lũy khả dụng (Savings), Ngân lượng đầu tư (Investments) và các chi phí cố định.
    *   **Lựa chọn Khẩu vị**: Thiết lập thang ưu tiên (1-5 sao) về Phong cách sống (Du lịch, Mua sắm, Giải trí, Tích lũy, Đầu tư, An toàn phòng vệ).
    *   **Thiết lập Tài Sản Hiện Hữu**: Khai báo xem đã có Ví trả sau (BNPL ZaloPay PayLater), Sổ tiết kiệm, Tài khoản chứng khoán, Bảo hiểm sức khỏe hay chưa.
    *   *Hành động*: Khi hoàn tất, một lệnh POST `/api/profile` được đẩy lên Database để khởi tạo trạng thái người dùng.

### 2. Bảng điều khiển trung tâm (Dashboard View)
*   **File đảm nhận**: `src/components/DashboardTab.tsx`
*   **Kịch bản**: Giao diện chính hiển thị sức khỏe tài chính hiện tại của CEO cực trực quan:
    *   Thanh cảnh báo chỉ số kỷ luật (**Discipline Score**): hiển thị dưới dạng Speedometer/Gauge với gam màu Dynamic (Đỏ -> Vàng nhạt -> Xanh lục rực rỡ).
    *   Danh sách 3 mục thống kê nhanh: Quỹ khẩn cấp bảo an, Thặng dư tiền mặt khả dụng, và Tổng tài sản đầu tư tích lũy.
    *   Visual Mockups minh họa một ứng dụng thanh toán hiện đại tích hợp chặt ZaloPay nhằm mang lại cảm giác chân thực cao độ.

### 3. Đệ trình Dự án tiêu dùng (Proposal Submission)
*   **File đảm nhận**: `src/components/NewProposalTab.tsx`, `src/components/NewProposalForm.tsx`
*   **Kịch bản**: CEO chuẩn bị quẹt thẻ tiêu dùng hoặc đầu tư mới:
    *   Nhập các nội dung: **Tên thương vụ** (ví dụ: "Sắm iPhone 16 Pro Max làm vlog kiếm tiền"), **Giá trị bằng VND**, và **Văn bản giải trình bối cảnh** (Tâm sự mục đích đệ trình của CEO gửi cho HĐQT).
    *   Hệ thống kiểm tra Cooldown. Nếu đủ điều kiện, Client kích hoạt hiệu ứng tải tấu hài (đảo ngẫu nhiên 8 tiêu đề công việc hành chính như "Đẩy hồ sơ sang tổ thư ký...", "Chairman đang đeo kính lão đọc đề xuất của sếp...", "Risk Director đang lật sổ nợ...").

### 4. Đại hội võ lâm tranh cãi nảy lửa (Live Boardroom & Roast)
*   **File đảm nhận**: `src/components/BoardRoomTab.tsx`, `src/components/BoardRoom.tsx`
*   **Kịch bản**: Show trình chiếu biểu diễn cuộc cãi vã và bỏ phiếu:
    *   Hiển thị danh sách 8 thành viên HĐQT được làm nổi bật tinh tế.
    *   Nút kích hoạt cuộc họp bắt đầu (Start Board Meeting): Từng câu hội thoại (Quotes) châm chọc của các thành viên được hiển thị dạng bong bóng chat tuần tự theo tính cách, mang tính chê trách thẳng tay nếu dính thâm hụt tài khóa.
    *   Giai đoạn bỏ phiếu (**The Vote**): Các thành viên đồng loạt giơ bảng "Approve" (Đồng thuận) hoặc "Reject" (Bác bỏ phủ quyết) kèm lý do cá nhân dở hơi.
    *   Phán quyết cuối cùng (**Verdict Board**): Xuất hiện bản đóng gói kết luận đồng thuận hay hoãn túc tắc kèm ảnh hưởng điểm kỷ luật.
    *   **Decision Action Prompt (Sau phán quyết)**: CEO phải trực tiếp chọn một trong hai hành động trước khi đóng phòng họp:
        *   **Hành động "Tuân thủ HĐQT (Obey)"**: Nhận thưởng +5 đến +10 điểm kỷ luật. Đề xuất tiêu sản bị hủy bỏ bảo toàn thặng dư hũ heo.
        *   **Hành động "Bất chấp quẹt (Defy)"**: CEO nghịch gạt bỏ ý kiến HĐQT để mua sắm bằng được. Bị trừ nghiêm trọng từ -10 đến -25 điểm kỷ luật, thâm hụt trực tiếp số dư tài khoản tiết kiệm của người dùng để phản ánh việc tiêu hao tiền tệ thực tế.

### 5. Mục tiêu và Thử thách (Goals & Discipline Challenges)
*   **File đảm nhận**: `src/components/GoalsTab.tsx`, `src/components/DisciplineChallenges.tsx`
*   **Kịch bản**: CEO chuyển động giữa hai chế độ con:
    *   **Cột mốc Tích sản (Milestones)**: Cho phép tự lập mục tiêu tương lai (laptop, cưới vợ, quỹ khẩn cấp...) kèm ngày hoàn thành đề xuất. Giao diện trực quan hóa khoảng hụt tài chính (Shortage) và cung cấp nút rảnh rỗi "Góp tích lũy bồi hũ 🐖" để rút bớt ví thặng dư nuôi heo dự phòng.
    *   **Thử thách Thép (Discipline Challenges)**: Nơi rèn luyện thói quen offline (không chi tiêu ăn vặt, giới hạn quẹt thẻ, gửi tiền heo đất). Cho phép sếp thực hiện "Check-in điểm danh nhận thưởng" để thăng bực Sức mạnh Kỷ luật hoàn mỹ.

---

## PART II: KIẾN TRÚC ENGINE BACKEND (BACKEND ENGINE ARCHITECTURE)

Backend chạy trên **Express 4** độc lập, sử dụng bộ kiểm duyệt nghiêm ngặt và tính toán phi tập trung tuyệt đối trước khi gọi Narration Layer.

```
       [Raw Request]
             │
             ▼
┌─────────────────────────┐
│ Input Sandbox & Check   │ ──> Chặn Income âm hoặc số tiền quá ảo
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ 24h Cooldown Sentinel   │ ──> Reject 3 lần liên tiếp sẽ khóa 30 phút
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  DecisionCore Engine    │ ──> Tính toán 5 bộ chỉ số điểm cứng
└────────────┬────────────┘
             │
             ├─────────────────────────────────────────┐
             ▼ (Bỏ phiếu / Tranh biện)                 ▼ (Tra cứu)
┌─────────────────────────┐              ┌─────────────────────────┐
│  Gemini Narration Layer │              │  Product Catalog Match  │
└────────────┬────────────┘              └────────────┬────────────┘
             │ (Strict JSON Output)                   │ (ZaloPay CTA & URLs)
             ▼                                        ▼
             └───────────────────┬────────────────────┘
                                 │
                                 ▼
                     [Gói phản hồi API hoản chỉnh]
```

### 1. Công nghệ tính điểm thông thái (DecisionCore Engine)
Bản chất tài chính của đề xuất được tính toán hoàn toàn bằng logic lập trình không đen tối (Deterministic Code) bên trong `DecisionCore.ts` thông qua các phép tính:

#### A. Thẩm định khả năng chi trả (Affordability Score)
Tính dựa trên tỷ lệ số tiền đề xuất so với lượng tiền nhàn rỗi đang tiết kiệm được:
$$AffordabilityScore = \max\left(0, 100 - \frac{Amount}{Savings} \times 100\right)$$
Nếu $Amount > Savings$, sếp rơi vào tình trạng thâm hụt hoàn toàn, điểm khả dụng sụt về $0$ và tự động chuyển phán quyết thành `DELAY` (Tạm hoãn do thiếu vốn gốc).

#### B. Thẩm định rào chắn Thanh khoản (Liquidity Engine)
Tính toán lượng dự toán an toàn còn lại sau khi thanh toán:
$$EmergencyFundRemaining = Savings - Amount$$
Hệ thống đối chiếu giá trị này với bộ quy tắc cấu hình `financial_rules.json`. Nếu $EmergencyFundRemaining$ thấp hơn mức tối thiểu quy định bão giông (bằng 3 tháng chi phí cố định tối thiểu nhân với hệ số điều chỉnh của ngành chi tiêu), hệ thống kích hoạt rủi ro bảo an (`EMERGENCY_FUND_AT_RISK`) và không cho phép duyệt thẳng.

#### C. Bản chất Chi Tiêu (Intent Classifier Pattern)
Phân tích văn phong và phân loại chính xác bản chất chi tiêu trước khi chuyển sang LLM bằng Regex tinh tế:
*   **Asset Accumulation** (Tích sản): Mua vàng, quỹ mở, tích kén.
*   **Human Capital Investment** (Đầu tư con người): Học tập, nâng cấp kỹ năng nghề, mua máy laptop làm ăn chuyên dụng.
*   **Risk Protection** (Bảo vệ tài chính): Săn khiên bảo hiểm sức khỏe.
*   **Consumption** (Tiêu dùng thông dốc): Xem phim, mua sắm đồ chơi không sinh lợi tức.
*   **Experience Spending** (Trải nghiệm thăng hoa): Gắn kết du lịch hành hương, hòa nhạc.

### 2. Danh mục sản phẩm thông minh (Recommendation ranking Engine)
Hệ thống ánh xạ trực tiếp các phán quyết tài chính với Catalog sản phẩm thực tế của ZaloPay để người dùng hành động lập tức sau cuộc họp phòng tranh luận (`src/productCatalog.ts`):
*   Nếu đề xuất bị **Trì hoãn (Delay/Reject)** hoặc thâm hụt nhẹ: Robot đề xuất mở sổ **Gửi Tiết Kiệm Tổ Kén ZaloPay** (Hưởng lợi nhuận kép theo ngày lên tới 5% - 6% không lo đóng băng kỳ hạn) để gom góp phần thiếu hụt trong $N$ tháng.
*   Nếu thuộc diện mua sắm cấp bách thiết thực mà ví thặng dư tạm cạn nhưng có điểm kỷ luật tốt: Khuyên dùng **Ví Trả Sau ZaloPay PayLater** (Cấp hạn mức chi tiêu mua sắm thông thái trả dần 3 kỳ miễn lãi).
*   Nếu điểm Liquidity cực kỳ cạn kiệt không có dự phòng sự cố: Hối thúc CEO mua sắm **Bảo kiểm Sức Khỏe Toàn Diện ZaloPay** để bảo toàn sinh mạng dòng tiền trước khi tậu tiêu sản đắt đỏ.

### 3. Công nghệ Narration & Prompt Versioning
*   **File đảm nhận**: `src/llmProvider.ts`
*   **Công nghệ**: Sử dụng thư viện chính dòng `@google/genai` của Google để giao tiếp trực tiếp với model `gemini-3.5-flash`.
*   **Cơ chế Strict JSON Schema**: Hệ thống truyền tải toàn bộ kết quả phân tích số liệu chuẩn của `DecisionCore` sang Gemini bằng một chỉ thị bắt buộc. Mô hình AI được thiết kế bằng khai báo lớp `Type.OBJECT` chặt chẽ, bắt buộc trả về đúng cấu trúc gồm mảng các bước tranh luận (`debateSteps`), bảng theo dõi biểu quyết (`votes`), kết luận tối ưu (`conclusion`) mà không được phép tự bịa đặt hay làm xáo trộn các chỉ số đã được thẩm định cứng ở Backend.
*   **Chiến lược Abstraction & Fallback**: Khi xảy ra sự cố API chết cớ hoặc mất mạng, lớp `FallbackProvider` sẽ tự động kích hoạt tạo ra kịch bản HĐQT khẩn cấp (hardcoded tấu hài "Đứt cáp quang biển", "HĐQT bận đi biển nghỉ dưỡng nên duyệt cứng bằng Core") để không gây nghẽn màn hình người dùng.

### 4. Hệ thống kiểm soát rủi ro truy cập (Access & Cooldown Sentinels)
*   **Proposal Cooldown System**: Khi sếp liên tục gửi tờ trình và bị HĐQT gạt phăng, hệ thống ghi nhận dấu mốc thời gian vào bộ đối đệm `cooldowns`. Nếu người dùng bị từ chối 3 lần liên tục trong vòng 24 giờ, họ sẽ bị Khóa Đệ Trình (Cooldown Active) trong thời gian 30 phút. Đại hội HĐQT sẽ ra chỉ thị sếp uống ly trà, rà soát lại ý chí kỷ luật thay vì quẹt vô định.
*   **Activity Event Log**: Bộ theo vết sự kiện hoạt động tự động lưu dấu ấn lịch sử như `REQUEST_SUBMITTED`, `REQUEST_APPROVED`, `REQUEST_REJECTED` phục vụ giám sát kỹ thuật và xây dựng hệ thống Analytics về sau nếu sản phẩm scale-up mở rộng.

---

## KẾT LUẬN & ĐỊNH HƯỚNG MỞ RỘNG (EXTENSIBILITY PLAN)

Kiến trúc này đảm bảo tính năng **đóng gói hoàn chỉnh** và cực kỳ an tâm cho bất kỳ kỹ sư nào tiếp quản dự án:
1.  **Mở rộng thêm thành viên HĐQT**: Chỉ cần định nghĩa thêm tính cách trong bảng `BOARD_MEMBERS` tại `src/types.ts` và bổ sung tấu hài cho Prompt của `GeminiProvider`.
2.  **Mở rộng Database**: Hệ thống in-memory DB hiện thời hoàn toàn có thể thay bằng các adapter chuẩn (ví dụ Firebase Firestore hoặc PostgreSQL Drizzle) chỉ bằng cách viết lại 2 endpoints API lưu trữ profile trong file `server.ts`.
3.  **Thay thế Engine AI**: Abstraction Layer của `LLMProvider` cho phép hoán đổi liên minh AI dễ dàng mà không phá hủy cấu trúc UI hay Core logic tài chính.
