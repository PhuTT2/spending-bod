# HĐQT Tài Chính - Technical Schema Specification
This document defines the structured request evaluation layer, comprising schemas for persistent user configurations, submitted proposals, historical snapshots, and deterministic evaluation results.

---

## 1. Data Flow Architecture

The evaluation layer decouples business logic, financial formula validation, and narration rendering into three distinct steps:

```
[Onboarding/UI Updates] ──> [Financial Profile]
                                    │
                                    ▼ (Snapshotting)
[User Proposal Submit]  ──> [Profile Snapshot] ────┐
                                                   ├─> [Rule & Scoring Engine] ──> [Evaluation Result] ──> [Gemini Bard Narration]
[Financial Request]     ───────────────────────────┘
```

---

## 2. JSON Schema Specifications

### A. Configuration & Baseline (`financial_profile`)
*File scope/Key: `financial_profile`*
This schema persists the user's permanent baseline financial status, preferences, historical score tracking, and current configured products.

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "FinancialProfile",
  "type": "object",
  "required": [
    "profile_id",
    "user_id",
    "version",
    "monthly_income",
    "monthly_fixed_expenses",
    "cash_balance",
    "emergency_fund",
    "risk_tolerance",
    "lifestyle_preference",
    "product_holdings",
    "discipline_score",
    "created_at",
    "updated_at"
  ],
  "properties": {
    "profile_id": { "type": "string", "format": "uuid" },
    "user_id": { "type": "string" },
    "version": { "type": "integer", "minimum": 1 },
    "monthly_income": { "type": "number", "minimum": 0 },
    "monthly_fixed_expenses": { "type": "number", "minimum": 0 },
    "cash_balance": { "type": "number", "minimum": 0 },
    "emergency_fund": { "type": "number", "minimum": 0 },
    "risk_tolerance": { 
      "type": "string", 
      "enum": ["low", "medium", "high"] 
    },
    "lifestyle_preference": {
      "type": "object",
      "required": ["travel", "shopping", "entertainment", "saving", "investing", "safety"],
      "properties": {
        "travel": { "type": "integer", "minimum": 1, "maximum": 5 },
        "shopping": { "type": "integer", "minimum": 1, "maximum": 5 },
        "entertainment": { "type": "integer", "minimum": 1, "maximum": 5 },
        "saving": { "type": "integer", "minimum": 1, "maximum": 5 },
        "investing": { "type": "integer", "minimum": 1, "maximum": 5 },
        "safety": { "type": "integer", "minimum": 1, "maximum": 5 }
      }
    },
    "financial_personality": { "type": "string" },
    "product_holdings": {
      "type": "object",
      "required": ["bnpl", "savings", "securities", "life_insurance", "non_life_insurance"],
      "properties": {
        "bnpl": {
          "type": "object",
          "required": ["has", "limit", "provider"],
          "properties": {
            "has": { "type": "boolean" },
            "limit": { "type": "number", "minimum": 0 },
            "provider": { "type": ["string", "null"] }
          }
        },
        "savings": {
          "type": "object",
          "required": ["has", "balance"],
          "properties": {
            "has": { "type": "boolean" },
            "balance": { "type": "number", "minimum": 0 }
          }
        },
        "securities": {
          "type": "object",
          "required": ["has", "balance"],
          "properties": {
            "has": { "type": "boolean" },
            "balance": { "type": "number", "minimum": 0 }
          }
        },
        "life_insurance": {
          "type": "object",
          "required": ["has", "premium"],
          "properties": {
            "has": { "type": "boolean" },
            "premium": { "type": "number", "minimum": 0 }
          }
        },
        "non_life_insurance": {
          "type": "object",
          "required": ["has", "name"],
          "properties": {
            "has": { "type": "boolean" },
            "name": { "type": ["string", "null"] }
          }
        }
      }
    },
    "active_goals": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["goal_id", "title", "target_amount", "current_amount", "deadline"],
        "properties": {
          "goal_id": { "type": "string" },
          "title": { "type": "string" },
          "target_amount": { "type": "number" },
          "current_amount": { "type": "number" },
          "deadline": { "type": "string", "format": "date" }
        }
      }
    },
    "discipline_score": { "type": "integer", "minimum": 0, "maximum": 100 },
    "created_at": { "type": "string", "format": "date-time" },
    "updated_at": { "type": "string", "format": "date-time" }
  }
}
```

---

### B. Business Input (`financial_request`)
*File scope/Key: `financial_request`*
Represents each standalone action, expenditure proposal, or purchase deal submitted by the user.

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "FinancialRequest",
  "type": "object",
  "required": [
    "request_id",
    "user_id",
    "request_type",
    "title",
    "target_amount",
    "priority",
    "necessity_level",
    "payment_preference",
    "profile_snapshot_id",
    "timestamp"
  ],
  "properties": {
    "request_id": { "type": "string", "format": "uuid" },
    "user_id": { "type": "string" },
    "request_type": {
      "type": "string",
      "enum": ["purchase", "travel", "insurance", "investment", "debt_repayment", "subscription"]
    },
    "title": { "type": "string" },
    "description": { "type": "string" },
    "target_amount": { "type": "number", "minimum": 0 },
    "deadline": { "type": "string", "format": "date" },
    "priority": { 
      "type": "string", 
      "enum": ["low", "medium", "high", "critical"] 
    },
    "necessity_level": {
      "type": "string",
      "enum": ["want", "need", "essential"]
    },
    "payment_preference": {
      "type": "string",
      "enum": ["cash", "bnpl", "installment", "saving_redeem"]
    },
    "request_context": { "type": "string" },
    "profile_snapshot_id": { "type": "string", "format": "uuid" },
    "timestamp": { "type": "string", "format": "date-time" }
  }
}
```

---

### C. Audit Freeze Layer (`profile_snapshot`)
*File scope/Key: `profile_snapshot`*
Persists a total, read-only freeze frame of the financial baseline at the exact microsecond the evaluation occurs.

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ProfileSnapshot",
  "type": "object",
  "required": [
    "snapshot_id",
    "user_id",
    "profile_version_id",
    "snapshot_payload",
    "created_at"
  ],
  "properties": {
    "snapshot_id": { "type": "string", "format": "uuid" },
    "user_id": { "type": "string" },
    "profile_version_id": { "type": "integer" },
    "snapshot_payload": { "type": "object" },
    "created_at": { "type": "string", "format": "date-time" }
  }
}
```

---

### D. Output & Recommendation Core (`evaluation_result`)
*File scope/Key: `evaluation_result`*
Stores numerical indices computed by our deterministic rules, risk profiling parameters, recommended actions, and structured commentary triggers.

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "EvaluationResult",
  "type": "object",
  "required": [
    "evaluation_id",
    "request_id",
    "snapshot_id",
    "scores",
    "final_decision",
    "risk_level",
    "reason_codes",
    "financial_impact",
    "recommended_actions",
    "product_recommendations",
    "future_simulation",
    "board_summary",
    "evaluated_at"
  ],
  "properties": {
    "evaluation_id": { "type": "string", "format": "uuid" },
    "request_id": { "type": "string", "format": "uuid" },
    "snapshot_id": { "type": "string", "format": "uuid" },
    "scores": {
      "type": "object",
      "required": ["affordability", "liquidity", "debt_burden", "goal_alignment", "discipline_fit", "overall_score"],
      "properties": {
        "affordability": { "type": "integer", "minimum": 0, "maximum": 100 },
        "liquidity": { "type": "integer", "minimum": 0, "maximum": 100 },
        "debt_burden": { "type": "integer", "minimum": 0, "maximum": 100 },
        "goal_alignment": { "type": "integer", "minimum": 0, "maximum": 100 },
        "discipline_fit": { "type": "integer", "minimum": 0, "maximum": 100 },
        "overall_score": { "type": "integer", "minimum": 0, "maximum": 100 }
      }
    },
    "detailed_scores": {
      "type": "object",
      "description": "Decision Explainability Layer tracking reasons & evidences for each dimension"
    },
    "action_plan": {
      "type": "array",
      "description": "Action Plan Generator outputs for the user to follow up on the decision"
    },
    "goal_impacts": {
      "type": "array",
      "description": "Identified impacts over active user goals"
    },
    "llm_metadata": {
      "type": "object",
      "description": "LLM Metadata and Prompt Versioning tracking"
    },
    "final_decision": {
      "type": "string",
      "enum": ["approve", "approve_with_conditions", "delay", "reject"]
    },
    "risk_level": {
      "type": "string",
      "enum": ["low", "medium", "high"]
    },
    "reason_codes": {
      "type": "array",
      "items": { "type": "string" }
    },
    "financial_impact": {
      "type": "object",
      "required": ["cash_gap", "estimated_months_to_afford", "estimated_monthly_payment", "remaining_emergency_fund"],
      "properties": {
        "cash_gap": { "type": "number", "minimum": 0 },
        "estimated_months_to_afford": { "type": "integer", "minimum": 0 },
        "estimated_monthly_payment": { "type": "number", "minimum": 0 },
        "remaining_emergency_fund": { "type": "number", "minimum": 0 }
      }
    },
    "recommended_actions": {
      "type": "array",
      "items": { "type": "string" }
    },
    "product_recommendations": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["product_id", "product_name", "category", "why_this_product", "tradeoff_summary", "cta_text", "cta_url"],
        "properties": {
          "product_id": { "type": "string" },
          "product_name": { "type": "string" },
          "category": { "type": "string" },
          "why_this_product": { "type": "string" },
          "tradeoff_summary": { "type": "string" },
          "cta_text": { "type": "string" },
          "cta_url": { "type": "string" }
        }
      }
    },
    "future_simulation": {
      "type": "object",
      "required": ["scenario_a", "scenario_b", "impact_summary"],
      "properties": {
        "scenario_a": { "type": "string" },
        "cta_text_a": { "type": "string" },
        "cta_url_a": { "type": "string" },
        "scenario_b": { "type": "string" },
        "cta_text_b": { "type": "string" },
        "cta_url_b": { "type": "string" },
        "impact_summary": { "type": "string" }
      }
    },
    "board_summary": {
      "type": "object",
      "required": ["chairman", "treasury_cfo", "experience_director", "growth_director", "risk_director"],
      "properties": {
        "chairman": { "type": "string" },
        "treasury_cfo": { "type": "string" },
        "experience_director": { "type": "string" },
        "growth_director": { "type": "string" },
        "risk_director": { "type": "string" },
        "future_you": { "type": "string" },
        "money_voice": { "type": "string" }
      }
    },
    "evaluated_at": { "type": "string", "format": "date-time" }
  }
}
```

---

## 3. Reference Payload Samples

### Sample: `financial_profile`
```json
{
  "profile_id": "1fa85f64-5717-4562-b3fc-2c963f66afa6",
  "user_id": "usr_9921",
  "version": 4,
  "monthly_income": 25000000,
  "monthly_fixed_expenses": 8000000,
  "cash_balance": 50000000,
  "emergency_fund": 30000000,
  "risk_tolerance": "medium",
  "lifestyle_preference": {
    "travel": 4,
    "shopping": 2,
    "entertainment": 3,
    "saving": 5,
    "investing": 3,
    "safety": 4
  },
  "financial_personality": "Sứ Giả Tích Lũy Thép 🐷",
  "product_holdings": {
    "bnpl": { "has": true, "limit": 10000000, "provider": "ZaloPay PayLater" },
    "savings": { "has": true, "balance": 45000000 },
    "securities": { "has": false, "balance": 0 },
    "life_insurance": { "has": true, "premium": 12000000 },
    "non_life_insurance": { "has": true, "name": "Bảo hiểm Sức Khỏe Toàn Diện ZaloPay" }
  },
  "active_goals": [
    {
      "goal_id": "g_001",
      "title": "Mua Macbook Pro M4",
      "target_amount": 45000000,
      "current_amount": 15000000,
      "deadline": "2026-12-31"
    }
  ],
  "discipline_score": 88,
  "created_at": "2026-01-15T08:30:00Z",
  "updated_at": "2026-06-15T15:00:00Z"
}
```

### Sample: `financial_request`
```json
{
  "request_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "user_id": "usr_9921",
  "request_type": "purchase",
  "title": "Nâng cấp iPhone 17 Pro Max",
  "description": "Muốn tậu điện thoại quay vlog công việc tiện lợi.",
  "target_amount": 32000000,
  "deadline": "2026-07-01",
  "priority": "medium",
  "necessity_level": "want",
  "payment_preference": "bnpl",
  "request_context": "Dòng iPhone mới ra mắt có nhiều tính năng AI đỉnh, thèm quá nhưng chưa đủ sẵn quỹ.",
  "profile_snapshot_id": "c83fe8a1-b847-49f3-8b7c-d38a16db32bf",
  "timestamp": "2026-06-15T10:00:00Z"
}
```

### Sample: `profile_snapshot`
```json
{
  "snapshot_id": "c83fe8a1-b847-49f3-8b7c-d38a16db32bf",
  "user_id": "usr_9921",
  "profile_version_id": 4,
  "snapshot_payload": {
    "profile_id": "1fa85f64-5717-4562-b3fc-2c963f66afa6",
    "version": 4,
    "monthly_income": 25000000,
    "monthly_fixed_expenses": 8000000,
    "cash_balance": 50000000,
    "emergency_fund": 30000000,
    "risk_tolerance": "medium",
    "discipline_score": 88,
    "product_holdings": {
      "bnpl": { "has": true, "limit": 10000000, "provider": "ZaloPay PayLater" },
      "savings": { "has": true, "balance": 45000000 }
    }
  },
  "created_at": "2026-06-15T10:00:01Z"
}
```

### Sample: `evaluation_result`
```json
{
  "evaluation_id": "67ccb18f-a9db-48ee-bd56-11b0e35fa848",
  "request_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "snapshot_id": "c83fe8a1-b847-49f3-8b7c-d38a16db32bf",
  "scores": {
    "affordability": 60,
    "liquidity": 40,
    "debt_burden": 75,
    "goal_alignment": 30,
    "discipline_fit": 55,
    "overall_score": 52
  },
  "detailed_scores": {
    "affordability": {
      "score": 60,
      "reason_codes": [
        {
          "reason_code": "HIGH_IMPACT_TO_SAVINGS",
          "impact_level": "high",
          "description": "Thâm hụt tiền 15tr."
        }
      ]
    }
  },
  "action_plan": [
    {
      "step": 1,
      "action": "delay_purchase",
      "description": "Trì hoãn quyết định này, chờ đến khi tài chính ổn định hơn."
    }
  ],
  "goal_impacts": [
    {
      "goal": "Mua Macbook Pro M4",
      "current_progress": 33,
      "new_progress": 0,
      "impact": "negative"
    }
  ],
  "llm_metadata": {
    "prompt_version": "v4.0",
    "llm_provider": "gemini",
    "llm_model": "gemini-3.5-flash",
    "fallback_used": false
  },
  "final_decision": "delay",
  "risk_level": "medium",
  "reason_codes": [
    "HIGH_PORTION_OF_SAVINGS",
    "GAP_EXISTS_NEED_SAVING",
    "LOW_CONGRUENCY_WITH_PASSIVE_GOAL"
  ],
  "financial_impact": {
    "cash_gap": 15000000,
    "estimated_months_to_afford": 3,
    "estimated_monthly_payment": 2666667,
    "remaining_emergency_fund": 18000000
  },
  "recommended_actions": [
    "Trì hoãn mua sắm ngay lúc này để bảo toàn dòng tiền khẩn cấp.",
    "Bật tính năng Gửi Tiết Kiệm Tích Lũy tự động trên ZaloPay để gom đủ phần thiếu hụt trong 3 tháng."
  ],
  "product_recommendations": [
    {
      "product_id": "prod_savings_tich_luy",
      "product_name": "Gửi Tiết Kiệm Tổ Kén ZaloPay",
      "category": "saving",
      "why_this_product": "Tận dụng cơ hội sinh lợi nhuận kép theo ngày với tiền nhàn rỗi, giúp kỷ luật tích luỹ vững.",
      "tradeoff_summary": "Thanh khoản cao nhưng lãi suất sẽ giảm nhẹ nếu sếp tất toán non trước ngày đáo hạn.",
      "cta_text": "Mở Sổ Tiết Kiệm Tích Luỹ",
      "cta_url": "https://zalopay.vn/dich-vu/gui-tiet-kiem"
    }
  ],
  "future_simulation": {
    "scenario_a": "Sếp hốt máy mới liền lập tức thâm hụt tới 32 củ khiến quỹ dự phòng khẩn cấp tụt dốc thảm thương, cả tháng sau chỉ còn gặm mì tôm qua bữa.",
    "cta_text_a": "Vấp ngã mua ngay",
    "cta_url_a": "https://zalopay.vn/dich-vu/tai-khoan-tra-sau",
    "scenario_b": "Chờ đợi thông thái và tích luỹ 3 tháng túc tắc qua ví ZaloPay: Nhận về lãi kép rủng rỉnh và tậu máy sang chảnh không vướng nợ nần ai.",
    "cta_text_b": "Tích luỹ an nhàn",
    "cta_url_b": "https://zalopay.vn/dich-vu/gui-tiet-kiem",
    "impact_summary": "Sự kiên nhẫn thắt lưng thong bả giúp bạn giữ mình trong trạng thái hừng hực tự do tài chính!"
  },
  "board_summary": {
    "chairman": "Kính thưa hội đồng, thương vụ iPhone 17 này quá kịch tính cho một cái ví mỏng. Tôi biểu quyết hoãn đại hội!",
    "treasury_cfo": "CEO bốc đồng quá rồi. Tổng cộng ngân lượng quỹ khẩn cấp không thể để hụt đáy chỉ vì một thiết bị giải trí.",
    "experience_director": "Đồng ý trì hoãn, nhưng hãy hứa là 3 tháng sau gom đủ tiền chúng ta sẽ đi múc nhé!",
    "growth_director": "Thay vì đập ngay vào hàng tiêu sản mất giá trị nhanh, sướng miệng sướng mắt thì 32 củ này mua cổ phiếu cơ hội X2 sau 2 năm.",
    "risk_director": "Nếu xe hỏng hay ốm đau bất chợt lúc này là sếp khóc ròng rã! Shield bảo hiểm ZaloPay cần mua trước khi sắm điện thoại mới."
  },
  "evaluated_at": "2026-06-15T10:05:00Z"
}
```

---

## 4. Versioning Strategy

To guarantee schema evolution safety and maintain complete compatibility as user profiles and recommendations grow over time:

1. **Incremental Schema Versions**: Every modification to properties or required lists in `financial_profile` triggers a major version bump in the `version` column integer.
2. **Audit Trails via Snapshots**: By decoupling evaluation logic through raw snapshots (`snapshot_payload`), changes in profiles do not cascade or mutate previous request histories. Old evaluations still accurately point to the exact properties of version `N` frozen in time.
3. **Database Polymorphism**: Non-relational persistence (such as Firestore collections with specific JSON documents) is optimal for easy mapping of sub-objects like dynamic goals and customizable insurance entities.

---

## 5. Scoring Engine Alignment Map

The rule/scoring calculation uses physical coefficients taken directly from the payload snapshots:

| Dimension | Calculation Target | High Score Criteria (>= 80) | Action Mapping logic |
| :--- | :--- | :--- | :--- |
| **Affordability** | `(Savings Balance / Target Amount)` | Cash balance completely covers purchase without breaking emergency thresholds. | If low, suggest **Gửi Tiết Kiệm ZaloPay** or **BNPL PayLater**. |
| **Debt Burden** | `(Estimated Monthly Payment / Monthly Income)` | Total loan/BNPL payables are under `15%` of the baseline monthly income. | If high load, strictly trigger **Reject** or **Delay** decisions. |
| **Liquidity** | `((Cash - Target) / Emergency Fund Limit)` | Emergency pool is safely untouched at `>= 3` months of fixed monthly expenses. | If zero protection, trigger mandatory **cro** (Risk Director) recommendation. |
| **Goal Alignment**| Congruency between purchase category and top `lifestyle_preference` stars. | User prioritized `travel` (rating 4-5) and proposal is travel-related. | If rating is low, Chairman chides user for spending on non-priority hobbies. |
| **Discipline Fit** | Weighted score combining progress trends on challenges and current status. | `discipline_score` is high, and prior obedience count dominates histories. | Low discipline disables outright approval for pure entertainment spendings. |
