import fs from "fs";
import path from "path";
import { FinancialProfile, EvaluationResult, ReasonEvidence, ScoreCategoryResult, ProductRecommendationTrace, GoalImpact, ActionPlanStep, IntentOutput, FinancialIntent } from "./types";
import { mapProductRecommendations } from "./productCatalog";

export interface DecisionCoreInput {
  proposalName: string;
  context?: string;
  amount: number;
  income: number;
  savings: number;
  investments: number;
  disciplineScore: number;
  financialProfile?: FinancialProfile;
  priority?: "low" | "medium" | "high" | "critical";
  necessity_level?: "want" | "need" | "essential";
}

function detectCategory(proposalName: string): "travel" | "shopping" | "entertainment" | "saving" | "investing" | "safety" {
  const norm = proposalName.toLowerCase();
  if (/(du lịch|dulich|travel|vé máy bay|bay|khách sạn|resort|homestay|đi chơi|tour|đi thái|đi phú quốc|phượt)/.test(norm)) return "travel";
  if (/(phim|rạp|cgv|lotte|cinema|vé nhạc|concert|vé phim|ăn uống|buffet|nhà hàng|uống|trà sữa|nhậu|bia|karaoke|party)/.test(norm)) return "entertainment";
  if (/(vàng|chứng khoán|cổ phiếu|coin|crypto|invest|đầu tư|quỹ mở|đất|bất động sản|ổ số|vietlott)/.test(norm)) return "investing";
  if (/(bảo hiểm|bh|sức khỏe|tai nạn|bhnt|cro|y tế|phòng vệ)/.test(norm)) return "safety";
  if (/(tiết kiệm|heo đất|két|tích lũy|gửi ngân hàng)/.test(norm)) return "saving";
  return "shopping";
}

export class DecisionCore {
  private detectFinancialIntent(proposalName: string, category: string, context: string): IntentOutput {
    const text = `${proposalName} ${context} ${category}`.toLowerCase();
    
    let intent: FinancialIntent = "Consumption";
    let reasoning = "Phân tích từ khoá cho thấy đây là chi tiêu tiêu sản thông thường.";
    
    if (text.match(/chứng chỉ|khóa học|học tiếng|máy tính|phục vụ công việc|ai|kỹ năng/)) {
      intent = "Human Capital Investment";
      reasoning = "Khoản đầu tư vào bản thân, công cụ làm việc hoặc kỹ năng mới giúp tăng thu nhập tương lai.";
    } else if (text.match(/etf|cổ phiếu|quỹ|tiết kiệm|vàng|chứng khoán|đầu tư/)) {
      intent = "Asset Accumulation";
      reasoning = "Khoản chi nhằm mục đích tích lũy tài sản và sinh lời dài hạn.";
    } else if (text.match(/bảo hiểm|bảo vệ|phòng ngừa|sức khỏe/)) {
      intent = "Risk Protection";
      reasoning = "Đề xuất mang tính phòng vệ, quản lý rủi ro và bảo vệ sức khỏe/tài chính.";
    } else if (text.match(/tiết kiệm|dự phòng|gửi tiền/)) {
      intent = "Capital Preservation";
      reasoning = "Tập trung vào việc bảo toàn vốn và xây dựng quỹ dự phòng.";
    } else if (text.match(/du lịch|concert|trải nghiệm|nhật bản|chơi|vé|xem phim/)) {
      intent = "Experience Spending";
      reasoning = "Khoản chi tập trung vào trải nghiệm, kỷ niệm và gắn kết tinh thần.";
    } else if (text.match(/trả góp|vay|mượn|thẻ tín dụng|bnpl/)) {
      intent = "Debt Financing";
      reasoning = "Có dấu hiệu sử dụng đòn bẩy tài chính hoặc đi vay để tiêu dùng.";
    }

    return {
      financial_intent: intent,
      intent_confidence: 0.85,
      intent_reasoning: reasoning
    };
  }

  private getRules() {
    try {
      const configPath = path.resolve(process.cwd(), "config/financial_rules.json");
      const data = fs.readFileSync(configPath, "utf-8");
      return JSON.parse(data);
    } catch(e) {
      // Fallback defaults
      return {
        "emergency_fund_months": 3,
        "ideal_emergency_fund_months": 6,
        "debt_warning_ratio": 0.35,
        "debt_reject_ratio": 0.50,
        "minimum_discipline_score_bnpl": 40,
        "minimum_income_bnpl": 3000000,
        "high_sanity_check_multiplier": 20
      };
    }
  }

  public evaluate(input: DecisionCoreInput): EvaluationResult {
    const rules = this.getRules();
    const { proposalName, context, amount, income, savings, disciplineScore, financialProfile } = input;
    const category = detectCategory(proposalName);
    
    // Detect Intent
    const intentResult = this.detectFinancialIntent(proposalName, category, context || "");

    // 7. Input Validation Layer
    if (income < 0 || income > 10000000000 || amount <= 0 || !proposalName) {
      return this.buildRejectedSanityCheck(input, category, "Invalid Input: Check your numbers and proposal name.");
    }

    // 8. Sanity Check Engine
    const isInsane = amount > (income * rules.high_sanity_check_multiplier) || (amount > savings && amount > income * 2);
    if (isInsane) {
       return this.buildRejectedSanityCheck(input, category, "Sanity Check Failed: Amount is unreasonably high relative to income/savings.");
    }

    // Initialize Explainability tracking
    const affordabilityEvidence: ReasonEvidence[] = [];
    const liquidityEvidence: ReasonEvidence[] = [];
    const debtEvidence: ReasonEvidence[] = [];
    const goalEvidence: ReasonEvidence[] = [];
    const disciplineEvidence: ReasonEvidence[] = [];

    // 2. Emergency Fund Logic
    const intent = intentResult.financial_intent;
    const isConsumption = intent === "Consumption";
    const isInvestment = intent === "Asset Accumulation" || intent === "Human Capital Investment" || intent === "Capital Preservation";

    const monthlyExpenses = financialProfile?.monthly_fixed_expenses || (income * 0.4);
    const eFundMultiplier = isConsumption ? 1.5 : (isInvestment ? 0.7 : 1);
    const minimumEmergencyFund = monthlyExpenses * rules.emergency_fund_months * eFundMultiplier;
    const recommendedEmergencyFund = monthlyExpenses * rules.ideal_emergency_fund_months * eFundMultiplier;
    let emergencyFundRemaining = savings - amount;
    
    liquidityEvidence.push({
      reason_code: "EMERGENCY_FUND_CHECK",
      current_value: emergencyFundRemaining,
      recommended_value: minimumEmergencyFund,
      impact_level: emergencyFundRemaining < minimumEmergencyFund ? "high" : "low",
      description: `Emergency fund after this purchase will be ${emergencyFundRemaining.toLocaleString()}. Recommended minimum: ${minimumEmergencyFund.toLocaleString()}.`
    });

    // 3. Debt Capacity Logic
    const dtiRatio = (monthlyExpenses) / (income || 1); // Simplification, would include debt
    const debtRiskLevel = dtiRatio > rules.debt_reject_ratio ? "high" : dtiRatio > rules.debt_warning_ratio ? "medium" : "low";
    debtEvidence.push({
      reason_code: "DEBT_TO_INCOME_CHECK",
      current_value: dtiRatio,
      recommended_value: rules.debt_warning_ratio,
      impact_level: debtRiskLevel,
      description: `Debt-to-Income ratio is ${Math.round(dtiRatio*100)}%. Thresholds: Warning at ${rules.debt_warning_ratio*100}%, Reject at ${rules.debt_reject_ratio*100}%.`
    });

    // 1. Product Eligibility Engine (BNPL)
    const isBnplEligible = income > rules.minimum_income_bnpl && dtiRatio < rules.debt_reject_ratio && disciplineScore >= rules.minimum_discipline_score_bnpl && category !== "investing";
    
    const productTraceability: ProductRecommendationTrace[] = [];
    productTraceability.push({
      product: "BNPL",
      fit_score: isBnplEligible ? 85 : 30,
      eligible: isBnplEligible,
      reasons: isBnplEligible ? ["adequate_income", "healthy_debt_ratio", "sufficient_discipline"] : ["income_too_low_or_debt_high_or_low_discipline"]
    });

    // 4. Competing Goals Logic && 5. Goal Priority Engine
    let goalAlignmentScore = 50;
    if (category === "travel" && financialProfile?.lifestyle_preference?.travel! >= 4) goalAlignmentScore += 30;
    if (category === "safety" && financialProfile?.lifestyle_preference?.safety! >= 4) goalAlignmentScore += 40;
    if (category === "investing" && financialProfile?.lifestyle_preference?.investing! >= 4) goalAlignmentScore += 40;

    // Apply intent modifier
    if (isInvestment || intent === "Risk Protection") {
      goalAlignmentScore = Math.min(100, goalAlignmentScore + 20);
    } else if (isConsumption) {
      goalAlignmentScore = Math.max(0, goalAlignmentScore - 20);
    }

    goalEvidence.push({
      reason_code: "LIFESTYLE_ALIGNMENT",
      impact_level: goalAlignmentScore >= 80 ? "low" : "medium",
      description: `Aligned with user persona category ${category}. Score: ${goalAlignmentScore}.`
    });

    // Discipline Tracking
    disciplineEvidence.push({
      reason_code: "CURRENT_DISCIPLINE_REVIEW",
      current_value: disciplineScore,
      impact_level: disciplineScore < 50 ? "high" : "low",
      description: `User's historical discipline score is ${disciplineScore}.`
    });

    // Decision Logic
    let decision: "approve" | "approve_with_conditions" | "delay" | "reject" = "approve";
    const reasonCodes: string[] = [];
    let riskLevel: "low" | "medium" | "high" = "low";
    let disciplineImpact = 10;
    
    const affordabilityScoreRaw = Math.max(0, 100 - (amount / (savings || 1)) * 100);

    if (amount > savings) {
      riskLevel = "high";
      decision = "delay";
      reasonCodes.push("GAP_EXISTS_NEED_SAVING");
      disciplineImpact = -15;
      affordabilityEvidence.push({ reason_code: "CASH_SHORTAGE", impact_level: "high", description: "Request amount exceeds current savings." });
    } else if (emergencyFundRemaining < minimumEmergencyFund && category !== "safety" && category !== "saving") {
      riskLevel = "medium";
      decision = "delay";
      reasonCodes.push("EMERGENCY_FUND_AT_RISK");
      disciplineImpact = -10;
    } else if (amount > (savings * 0.4)) {
      riskLevel = "medium";
      if (isBnplEligible) {
        decision = "approve_with_conditions";
        reasonCodes.push("USABLE_WITH_BNPL");
        disciplineImpact = -5;
      } else {
        decision = "delay";
        reasonCodes.push("HIGH_PORTION_OF_SAVINGS");
        disciplineImpact = -10;
      }
      affordabilityEvidence.push({ reason_code: "HIGH_IMPACT_TO_SAVINGS", impact_level: "medium", description: `Amount is ${(amount/savings * 100).toFixed(1)}% of savings.` });
    } else {
       decision = "approve";
       riskLevel = "low";
       reasonCodes.push("AFFORDABLE");
       disciplineImpact = 5;
       affordabilityEvidence.push({ reason_code: "EASILY_AFFORDABLE", impact_level: "low", description: "Amount is well within safe savings limits." });
    }

    if (disciplineScore <= 40 && category === "shopping" && decision === "approve") {
      decision = "approve_with_conditions";
      reasonCodes.push("LOW_DISCIPLINE_WARNING");
      disciplineImpact = -5;
    }

    // 6. Recommendation Ranking Engine & Product Catalog Mapping
    const mappedProduct = mapProductRecommendations(decision, category, isInsane, isBnplEligible, intent);
    const topRecommendedProduct = {
      product_id: mappedProduct.product_id,
      product_name: mappedProduct.product_name,
      category: mappedProduct.category,
      why_this_product: mappedProduct.why_this_product || "Phù hợp với tình hình tài chính của bạn.",
      tradeoff_summary: mappedProduct.tradeoff_summary || "Rủi ro thấp.",
      cta_text: mappedProduct.cta_text || "Khám phá ngay",
      cta_url: mappedProduct.cta_url || "https://zalopay.vn"
    };

    // Action Plan Generator
    const actionPlan = this.generateActionPlan(decision, amount, savings, category, isBnplEligible);

    // Goal Progress Tracker
    const goalImpacts = this.evaluateGoalImpact(input, decision, intentResult);

    // 9. Future Simulation Engine
    const futureSimulation = this.generateSimulation(category, amount, decision);

    return {
      evaluation_id: `eval_${Date.now()}`,
      request_id: `req_${Date.now()}`,
      snapshot_id: `snap_${Date.now()}`,
      scores: {
        affordability: affordabilityScoreRaw,
        liquidity: 100, // simplification
        debt_burden: 100 - (dtiRatio * 100),
        goal_alignment: goalAlignmentScore,
        discipline_fit: disciplineScore,
        overall_score: 80,
      },
      detailed_scores: {
        affordability: { score: affordabilityScoreRaw, reason_codes: affordabilityEvidence },
        liquidity: { score: emergencyFundRemaining >= recommendedEmergencyFund ? 100 : 50, reason_codes: liquidityEvidence },
        debt_burden: { score: Math.max(0, 100 - (dtiRatio * 100)), reason_codes: debtEvidence },
        goal_alignment: { score: goalAlignmentScore, reason_codes: goalEvidence },
        discipline_fit: { score: disciplineScore, reason_codes: disciplineEvidence }
      },
      product_traceability: productTraceability,
      final_decision: decision,
      risk_level: riskLevel,
      reason_codes: reasonCodes,
      financial_intent: intentResult,
      financial_impact: {
        cash_gap: Math.max(0, amount - savings),
        estimated_months_to_afford: Math.ceil(Math.max(0, amount - savings) / ((income * 0.2) || 1)),
        estimated_monthly_payment: decision === "approve_with_conditions" && isBnplEligible ? amount / 3 : 0,
        remaining_emergency_fund: Math.max(0, emergencyFundRemaining),
      },
      action_plan: actionPlan,
      goal_impacts: goalImpacts,
      recommended_actions: [],
      product_recommendations: [topRecommendedProduct],
      future_simulation: futureSimulation,
      board_summary: {
        chairman: "Decision locked by core logic",
        treasury_cfo: "Funds monitored",
        experience_director: "Noted",
        growth_director: "Noted",
        risk_director: "Noted",
      },
      evaluated_at: new Date().toISOString()
    };
  }

  private buildRejectedSanityCheck(input: DecisionCoreInput, category: string, reason: string): EvaluationResult {
    const { amount, income, savings, disciplineScore } = input;
    
    const mappedProduct = mapProductRecommendations("reject", category, true, false);
    const topRecommendedProduct = {
      product_id: mappedProduct.product_id,
      product_name: mappedProduct.product_name,
      category: mappedProduct.category,
      why_this_product: mappedProduct.why_this_product || "",
      tradeoff_summary: mappedProduct.tradeoff_summary || "",
      cta_text: mappedProduct.cta_text || "",
      cta_url: mappedProduct.cta_url || ""
    };

    const actionPlan = this.generateActionPlan("reject", amount, savings, category, false);
    
    return {
      evaluation_id: `eval_${Date.now()}`,
      request_id: `req_${Date.now()}`,
      snapshot_id: `snap_${Date.now()}`,
      scores: {
        affordability: 0,
        liquidity: 0,
        debt_burden: 0,
        goal_alignment: 0,
        discipline_fit: 0,
        overall_score: 0,
      },
      final_decision: "reject",
      risk_level: "high",
      reason_codes: ["SANITY_CHECK_FAILED", reason],
      financial_impact: {
        cash_gap: amount,
        estimated_months_to_afford: 999,
        estimated_monthly_payment: 0,
        remaining_emergency_fund: 0,
      },
      action_plan: actionPlan,
      goal_impacts: [],
      recommended_actions: [],
      product_recommendations: [topRecommendedProduct],
      future_simulation: this.generateSimulation(category, amount, "reject"),
      board_summary: {
        chairman: "",
        treasury_cfo: "",
        experience_director: "",
        growth_director: "",
        risk_director: "",
      },
      evaluated_at: new Date().toISOString()
    };
  }

  private generateActionPlan(
    decision: string,
    amount: number,
    savings: number,
    category: string,
    isBnplEligible: boolean
  ): ActionPlanStep[] {
    const plans: ActionPlanStep[] = [];
    if (decision === "approve") {
      plans.push({ step: 1, action: "purchase", amount: amount, description: "Tiến hành thanh toán ngay bằng khoản tiền mặt hiện có." });
      if (savings > amount * 2) {
        plans.push({ step: 2, action: "allocate_to_investment", description: "Số dư còn lại rất tốt, cân nhắc trích một phần sang quỹ đầu tư dài hạn." });
      }
    } else if (decision === "approve_with_conditions" && isBnplEligible) {
      plans.push({ step: 1, action: "use_bnpl", amount: amount, duration_month: 3, description: "Thanh toán bằng ví trả sau, chia làm 3 kỳ." });
      plans.push({ step: 2, action: "save_more", amount: amount / 3, description: "Thiết lập tiết kiệm tự động để thanh toán đúng nợ hàng tháng." });
    } else if (decision === "delay") {
      if (category === "travel") {
        plans.push({ step: 1, action: "travel_fund_contribution", amount: Math.ceil(amount / 3), duration_month: 3, description: "Gửi tiết kiệm mục tiêu du lịch mỗi tháng để đi chơi nhẹ đầu." });
      } else {
        plans.push({ step: 1, action: "delay_purchase", description: "Trì hoãn quyết định này, chờ đến khi tài chính ổn định hơn." });
      }
      plans.push({ step: 2, action: "save_more", amount: Math.ceil(amount / 3), duration_month: 3, description: "Nỗ lực tăng thêm tiết kiệm hàng tháng." });
      if (category === "shopping" || category === "entertainment") {
        plans.push({ step: 3, action: "switch_cheaper_option", description: "Tìm kiếm các lựa chọn rẻ hơn hoặc sử dụng voucher giảm giá để tốn ít tiền hơn." });
      }
    } else if (decision === "reject") {
      plans.push({ step: 1, action: "increase_emergency_fund", description: "Tập trung xây dựng quỹ dự phòng bị thâm hụt trước tiên." });
      plans.push({ step: 2, action: "save_more", amount: Math.ceil(amount * 0.1), duration_month: 6, description: "Nếu vẫn muốn mua, phải tích lũy dài hơi bằng tiết kiệm nhỏ giọt mỗi ngày." });
    }
    return plans;
  }

  private evaluateGoalImpact(input: DecisionCoreInput, decision: string, intentResult: IntentOutput): GoalImpact[] {
    const { amount, financialProfile } = input;
    const impacts: GoalImpact[] = [];
    if (!financialProfile || !financialProfile.active_goals) return impacts;

    for (const goal of financialProfile.active_goals) {
      const currentProgressStr = (goal.current_amount / goal.target_amount) * 100;
      const currentProgress = isNaN(currentProgressStr) ? 0 : Math.min(100, currentProgressStr);
      let newProgress = currentProgress;
      let impact: "neutral" | "positive" | "negative" = "neutral";
      
      // Intent based goal conflict scaling
      let conflictMultiplier = 1;
      if (intentResult.financial_intent === "Consumption") conflictMultiplier = 1.2;
      else if (intentResult.financial_intent === "Asset Accumulation" || intentResult.financial_intent === "Capital Preservation") conflictMultiplier = 0.5;

      if (decision === "approve" || decision === "approve_with_conditions") {
        const remainingSavings = input.savings - (amount * conflictMultiplier);
        if (remainingSavings < goal.current_amount) {
           const newAmount = Math.max(0, remainingSavings);
           const progressStr = (newAmount / goal.target_amount) * 100;
           newProgress = isNaN(progressStr) ? 0 : Math.min(100, progressStr);
           impact = "negative";
        }
      }
      impacts.push({
        goal: goal.title,
        current_progress: Math.round(currentProgress),
        new_progress: Math.round(newProgress),
        impact: impact
      });
    }
    return impacts;
  }

  private generateSimulation(category: string, amount: number, decision: string) {
    let scenarioA = "";
    let scenarioB = "";
    let impactSummary = "";

    if (category === "travel") {
      scenarioA = `Nếu đi du lịch ngay: Thâm hụt \${amount.toLocaleString("vi-VN")} VND. 3 tháng dốc túi khô héo.`;
      scenarioB = `Hoãn lại tích lũy tiết kiệm: Tích góp đủ số tiền bằng sinh lời sau 3 tháng.`;
      impactSummary = `Trì hoãn thông thái giúp bạn chơi nhẹ đầu thực sự.`;
    } else if (category === "shopping" || category === "entertainment") {
      scenarioA = `Mua sắm/giải trí ngay làm dòng tiền mất tính cơ động.`;
      scenarioB = `Gửi tiết kiệm lãi kép số tiền này, 3 năm nảy nở đủ x2 món đó.`;
      impactSummary = `Binh pháp giữ dòng tiền khỏe mạnh suốt năm dài.`;
    } else if (category === "investing") {
      scenarioA = `Thành rổ cổ phiếu tiềm năng, nhân đôi tích sản dài hạn.`;
      scenarioB = `Lạm phát ăn mòn 5% mỗi năm nếu để tiền yên.`;
      impactSummary = `Chi phí cơ hội của việc rụt rè tốn kém vô cùng.`;
    } else {
      scenarioA = `Để hở tấm sườn tài chính, bán tháo tài sản khi có biến.`;
      scenarioB = `Săn Khiên an toàn từ chi phí cực nhỏ.`;
      impactSummary = `Sinh tồn tối cao của người giàu là quản trị biên độ an toàn trước bão giông.`;
    }

    return {
      scenario_a: scenarioA,
      scenario_b: scenarioB,
      impact_summary: impactSummary
    };
  }
}
