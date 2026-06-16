# Kiến trúc hệ thống (Architecture) - Functional-First, Model-Agnostic

## 1. Mục tiêu cốt lõi
Hệ thống thiết kế theo hướng Functional-First (đặt logic nghiệp vụ lên hàng đầu) và Model-Agnostic (không phụ thuộc vào một LLM cụ thể).
Hệ thống xử lý 3 luồng chính độc lập với LLM:
1. Lưu trữ trạng thái tài chính hiện tại của người dùng.
2. Nhận và chuẩn hóa các yêu cầu tài chính mới (proposal).
3. Đối chiếu yêu cầu với tình trạng hiện tại để xuất ra điểm số, phán quyết (verdict) và khuyến nghị.

**Vai trò của LLM:** LLM (như Gemini) chỉ đóng vai trò Presentation/Narration Layer. Nhận JSON kết quả từ Scoring Engine và dịch thành ngôn ngữ hội thoại (Board Meeting) mà không được phép quyết định logic số liệu.

## 2. Các Layer Cốt Lõi (Core Back-end Layers)
Hệ thống đã được module hóa với các layer chuyên trách:
1. **Decision Explainability Layer**: Đảm bảo mọi phán quyết từ Board đề xuất đều giải thích được bằng điểm số (Affordability, Liquidity, Debt, v.v.), có bằng chứng, current value và recommended value rõ ràng, không là "black-box" do LLM sinh ra.
2. **Recommendation Traceability Layer & Catalog Engine**: Chứa Product Catalog. Mọi recommendation đều map trúng đích một sản phẩm cụ thể (Ví dụ: ZaloPay BNPL, Gửi Tiết Kiệm Tích Lũy) cùng với Fit Score và lý do tại sao sản phẩm đó hợp lệ.
3. **Action Plan Generator**: Lên kế hoạch từng bước cụ thể (save, purchase, allocate, delay) để người dùng hành động ngay lập tức thay vì chỉ ra quyết định suông.
4. **Goal Progress Tracker**: Tracking các quyết định sẽ impact mục tiêu dài hạn (new progress & percentage impact: thâm hụt hay tích cực).
5. **Rule Configuration System**: Cơ chế tách biệt các file cấu hình ngưỡng rủi ro, ví dụ `financial_rules.json` (tỷ lệ nợ, mức dti, v.v.) không bị hardcode trong source code.
6. **Activity Event Log & Analytics Layer**: System log tracker theo từng timeline sự kiện như `PROFILE_CREATED`, `REQUEST_SUBMITTED`, `REQUEST_APPROVED/REJECTED`. Từ đó thống kê Analytics/Observability phục vụ Metric Dashboards.
7. **Input Validation & Cooldown System**: Khóa chặn input rác, giới hạn số lần nộp proposal trong ngày (Ví dụ: reject 3 lần sẽ bị khóa 30 phút).
8. **Financial Persona Classification Layer**: Map base archetype của người dùng (Explorer, Builder, Investor, Optimizer) để personalize output.

## 3. Lớp thiết kế Model-Agnostic & Abstraction
Để tránh phụ thuộc cứng vào bất kỳ LLM nào, hệ thống chia làm các Interface rõ ràng:
*   **`DecisionCore`:** Lớp thuần TypeScript/Backend chứa toàn bộ Rule Engine & Scoring. Đảm nhiệm logic tài chính.
*   **`LLMProvider`:** Giao diện Trừu Tượng (Abstraction) định nghĩa contract chung `generateBoardNarration()`. Cung cấp khả năng chuyển đổi nhà model qua config (v.d Claude, Contest Model). Hệ thống implement sẵn `GeminiProvider`.
*   **LLM Fallback Strategy**: Cung cấp `FallbackProvider` có chức năng hard-code fallback để không sập Board Meeting khi LLM API chết cớ hay đứt cáp (trả về Hardcoded System Narration).
*   **Prompt Versioning System**: Metadata lưu vết prompt sử dụng nào sinh ra cuộc trò chuyện trong lịch sử (để debug vì sao output sinh ra bị biến dị).

## 4. Luồng dữ liệu chuẩn (Standard Data Flow)
1. **Onboarding / UI Config:** Lưu `financial_profile` (income, cash, savings, goals). Phân loại Persona user.
2. **Submit Request:** User đẩy request proposal -> Check Cooldown -> Input Validation chặn rác. Log `REQUEST_SUBMITTED`.
3. **Decision Rule Engine:** `DecisionCore` chạy bộ Rule Config (đọc JSON params), validate mục tiêu, chi phí, risk, nợ -> Xuất ra `evaluation_result` bao gồm full Reason Evidence, Tracing Recommendations, Action Plan, & Impacts.
4. **Narration Layer:** Gửi Evaluation Result dạng strict sang `LLMProvider` -> Dịch ra ngôn ngữ Board Meeting (Roast).
5. **Analytics Logging:** Lưu Event Log `REQUEST_APPROVED` hay `REQUEST_REJECTED` cho Dashboards.

## 5. Dữ liệu và Cơ sở hạ tầng (Infrastructure)
*   **Nguồn sự thật khởi thủy (Source of Truth):** PostgreSQL trên nền tảng GreenNode vDB. Phù hợp với quản lý state phức tạp.
*   **Bộ đệm và Trì hoãn (Cache/Session/Cooldowns):** Redis trên GreenNode MDS để nhớ memory spam/cooldowns.

## 5. Mô hình Dữ liệu tối thiểu (Minimal Data Model)
Bao gồm 6 bảng (hoặc core collections) trọng tâm và 3 bảng mở rộng (Versioning):
1.  `users`: Thông tin định danh định dạng cơ bản.
2.  `financial_profiles`: Trạng thái baseline tài chính.
3.  `product_holdings`: Thông tin danh mục tài sản chi tiết (Savings, BNPL, Insurance).
4.  `financial_requests`: Các yêu cầu/thương vụ đã đệ trình.
5.  `profile_snapshots`: Bản lưu trữ tĩnh của profiles ứng với thời điểm đề xuất.
6.  `evaluation_results`: Kết quả tính toán của DecisionCore.

*Mở rộng (Versioning & Audit Track):*
*   `profile_versions`: Lưu vết thay đổi user profile.
*   `prompt_versions`: Phiên bản quản lý thay đổi nội dung prompt cho BoardNarrator.
*   `activity_events`: Lưu dấu vết hành vi hệ thống phục vụ log và explainability.
