export interface BoardMember {
  id: string;
  name: string;
  title: string;
  description: string;
  philosophy: string;
  color: string; // Tailwind class color accent
  bgClass: string; // Tailwind background color accent
  borderClass: string; // Tailwind border accent
  emoji: string;
}

export interface DebateStep {
  memberId: string;
  memberName: string;
  quote: string;
}

export interface MemberVote {
  memberId: string;
  memberName: string;
  vote: "approve" | "reject" | "abstain";
  reason: string;
}

export interface BoardConclusion {
  approved: boolean;
  summary: string;
  disciplineImpact: number;
}

export interface RecommendedService {
  name: string;
  description: string;
  logoEmoji: string;
  ctaText: string;
  url: string;
}

export interface FutureSimulation {
  scenarioA: string; // Proceed immediately impact
  ctaTextA?: string;
  ctaUrlA?: string;
  scenarioB: string; // Wait / save / optimize impact
  ctaTextB?: string;
  ctaUrlB?: string;
  impactSummary: string; // aha-moment takeaway
}

export interface DebateResult {
  theme: string;
  debateSteps: DebateStep[];
  votes: MemberVote[];
  conclusion: BoardConclusion;
  recommendedService?: RecommendedService;
  futureSimulation?: FutureSimulation;
  action_plan?: ActionPlanStep[];
  goal_impacts?: GoalImpact[];
  evaluationCore?: EvaluationResult;
}

export interface DecisionRecord {
  id: string;
  timestamp: string;
  proposalName: string;
  amount: number;
  income: number;
  savings: number;
  context: string;
  debateResult: DebateResult;
  userAction: "obeyed" | "defied"; // obeyed = follow the board, defied = fight the board
  scoreChange: number; // change in discipline score
  previousScore: number;
  newScore: number;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  rewardPoints: number;
  emoji: string;
  status: "available" | "active" | "completed" | "failed";
  targetValue: number; // e.g. days or target amount
  currentValue: number; // current value
  type: "no_spend" | "limit_spending" | "saving_target" | "custom";
  isCustom?: boolean;
  startDate?: string;
  endDate?: string;
  historyLog?: string[]; // records of check-ins
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  unlockedAt?: string; // undefined if locked
  conditionDesc: string;
}

export type FinancialIntent = 
  | "Consumption" 
  | "Experience Spending" 
  | "Human Capital Investment" 
  | "Asset Accumulation" 
  | "Capital Preservation" 
  | "Risk Protection" 
  | "Debt Financing"
  | "Unknown";

export interface IntentOutput {
  financial_intent: FinancialIntent;
  intent_confidence: number;
  intent_reasoning: string;
}

export interface FinancialProfile {
  profile_id: string;
  user_id: string;
  version: number;
  monthly_income: number;
  monthly_fixed_expenses: number;
  cash_balance: number;
  emergency_fund: number;
  risk_tolerance: "low" | "medium" | "high";
  lifestyle_preference: {
    travel: number;
    shopping: number;
    entertainment: number;
    saving: number;
    investing: number;
    safety: number;
  };
  financial_personality: string;
  product_holdings: {
    bnpl: { has: boolean; limit: number; provider: string | null };
    savings: { has: boolean; balance: number };
    securities: { has: boolean; balance: number };
    life_insurance: { has: boolean; premium: number };
    non_life_insurance: { has: boolean; name: string | null };
  };
  active_goals: Array<{
    goal_id: string;
    title: string;
    target_amount: number;
    current_amount: number;
    deadline: string;
  }>;
  discipline_score: number;
  created_at: string;
  updated_at: string;
  
  // Backward compatibility aliases for UI while migrating
  username?: string;
}

export interface FinancialRequest {
  request_id: string;
  user_id: string;
  request_type: "purchase" | "travel" | "insurance" | "investment" | "debt_repayment" | "subscription";
  title: string;
  description: string;
  target_amount: number;
  deadline: string;
  priority: "low" | "medium" | "high" | "critical";
  necessity_level: "want" | "need" | "essential";
  payment_preference: "cash" | "bnpl" | "installment" | "saving_redeem";
  request_context: string;
  financial_intent?: IntentOutput;
  profile_snapshot_id: string;
  timestamp: string;
}

export interface ProfileSnapshot {
  snapshot_id: string;
  user_id: string;
  profile_version_id: number;
  snapshot_payload: Partial<FinancialProfile>;
  created_at: string;
}

export interface ReasonEvidence {
  reason_code: string;
  current_value?: number;
  recommended_value?: number;
  impact_level: "high" | "medium" | "low";
  description: string;
}

export interface ScoreCategoryResult {
  score: number;
  reason_codes: ReasonEvidence[];
}

export interface ProductRecommendationTrace {
  product: string;
  fit_score: number;
  eligible: boolean;
  reasons: string[];
}

export interface DebugMetadata {
  prompt_version: string;
  llm_provider: string;
  llm_model: string;
  fallback_used: boolean;
}

export interface ProductCatalogItem {
  product_id: string;
  product_name: string;
  category: string;
  tags: string[];
  eligibility_rules?: Record<string, any>;
  priority_weight: number;
  why_this_product?: string;
  tradeoff_summary?: string;
  cta_text?: string;
  cta_url?: string;
}

export interface ActionPlanStep {
  step: number;
  action: "save_more" | "delay_purchase" | "use_bnpl" | "switch_cheaper_option" | "buy_insurance" | "increase_emergency_fund" | "allocate_to_investment" | "travel_fund_contribution" | "save" | "purchase";
  amount?: number;
  duration_month?: number;
  description?: string;
}

export interface GoalImpact {
  goal: string;
  current_progress: number;
  new_progress: number;
  impact: "positive" | "negative" | "neutral";
}

export interface EvaluationResult {
  evaluation_id: string;
  request_id: string;
  snapshot_id: string;
  scores: {
    affordability: number;
    liquidity: number;
    debt_burden: number;
    goal_alignment: number;
    discipline_fit: number;
    overall_score: number;
  };
  detailed_scores?: {
    affordability: ScoreCategoryResult;
    liquidity: ScoreCategoryResult;
    debt_burden: ScoreCategoryResult;
    goal_alignment: ScoreCategoryResult;
    discipline_fit: ScoreCategoryResult;
  };
  product_traceability?: ProductRecommendationTrace[];
  llm_metadata?: DebugMetadata;
  final_decision: "approve" | "approve_with_conditions" | "delay" | "reject";
  risk_level: "low" | "medium" | "high";
  reason_codes: string[];
  financial_intent?: IntentOutput;
  financial_impact: {
    cash_gap: number;
    estimated_months_to_afford: number;
    estimated_monthly_payment: number;
    remaining_emergency_fund: number;
  };
  recommended_actions: string[];
  action_plan?: ActionPlanStep[];
  goal_impacts?: GoalImpact[];
  product_recommendations: Array<{
    product_id: string;
    product_name: string;
    category: string;
    why_this_product: string;
    tradeoff_summary: string;
    cta_text: string;
    cta_url: string;
  }>;
  future_simulation: {
    scenario_a: string;
    cta_text_a?: string;
    cta_url_a?: string;
    scenario_b: string;
    cta_text_b?: string;
    cta_url_b?: string;
    impact_summary: string;
  };
  board_summary: {
    chairman: string;
    treasury_cfo: string;
    experience_director: string;
    growth_director: string;
    risk_director: string;
    future_you?: string;
    money_voice?: string;
  };
  evaluated_at: string;
}

// User Financial State representing the local UI proxy structure
export interface UserFinancialState {
  income: number;
  savings: number;
  investments?: number;
  disciplineScore: number;
  history: DecisionRecord[];
  challenges?: Challenge[];
  unlockedBadgeIds?: string[];
  
  onboardingCompleted?: boolean;
  financialProfile?: FinancialProfile;
}

export const BOARD_MEMBERS: Record<string, BoardMember> = {
  chairman: {
    id: "chairman",
    name: "Chủ Tịch",
    title: "Chủ tịch HĐQT",
    description: "Điều phối cuộc họp, tổng hợp ý kiến, lạnh lùng đầy uy nghiêm.",
    philosophy: "Đưa ra phán quyết tối cao, không cảm xúc.",
    color: "text-slate-200",
    bgClass: "bg-slate-900",
    borderClass: "border-slate-700",
    emoji: "🕴️",
  },
  cxo: {
    id: "cxo",
    name: "Giám Đốc Trải Nghiệm",
    title: "Chief Experience Officer (CXO)",
    description: "Đại diện du lịch, nghỉ dưỡng và những chiếc vé máy bay muôn nơi.",
    philosophy: "Tiền sinh ra để tạo ký ức tuyệt đẹp.",
    color: "text-emerald-400",
    bgClass: "bg-emerald-950/40",
    borderClass: "border-emerald-500/35",
    emoji: "✈️",
  },
  cho: {
    id: "cho",
    name: "Giám Đốc Giải Trí",
    title: "Chief Happiness Officer (CHO)",
    description: "Nhân vật dễ tính chuyên mảng phim ảnh, ẩm thực và mua sắm xả stress.",
    philosophy: "Không phải mọi khoản chi đều là lãng phí.",
    color: "text-amber-400",
    bgClass: "bg-amber-950/40",
    borderClass: "border-amber-500/35",
    emoji: "🍿",
  },
  clo: {
    id: "clo",
    name: "Giám Đốc Đòn Bẩy",
    title: "Chief Leverage Officer (CLO)",
    description: "Đội ngũ mua trước trả sau (BNPL), gạ gẫm trả góp 'chia nhỏ nỗi thương đau'.",
    philosophy: "Đòn bẩy là nghệ thuật, ai sợ nấy nghèo.",
    color: "text-indigo-400",
    bgClass: "bg-indigo-950/40",
    borderClass: "border-indigo-500/35",
    emoji: "💳",
  },
  luck_director: {
    id: "luck_director",
    name: "Giám Đốc May Mắn",
    title: "Chief Luck Officer (CLO²)",
    description: "Thần tài gõ cửa, luôn rủ mua vé Vietlott hoặc Keno, khuyên CEO thử vận may thay vì cày cuốc.",
    philosophy: "Đánh đổi 10k lấy cơ hội độc đắc 100 tỷ VND. Đây mới là đòn bẩy tài chính tối thượng!",
    color: "text-rose-400",
    bgClass: "bg-rose-950/40",
    borderClass: "border-rose-500/35",
    emoji: "🍀",
  },
  cto: {
    id: "cto",
    name: "Giám Đốc Tích Lũy",
    title: "Chief Treasury Officer (CTO)",
    description: "Thành viên bảo thủ sùng bái quỹ khẩn cấp và lãi suất kép gửi tiết kiệm.",
    philosophy: "Người giàu không chạy nhanh, họ đi đều.",
    color: "text-yellow-500",
    bgClass: "bg-yellow-950/40",
    borderClass: "border-yellow-500/35",
    emoji: "🐷",
  },
  cgo: {
    id: "cgo",
    name: "Giám Đốc Tăng Trưởng",
    title: "Chief Growth Officer (CGO)",
    description: "Nhìn mọi thứ dưới góc độ cổ phiếu, ETF và lợi nhuận dài hạn (Opportunity Cost).",
    philosophy: "Tiền là để đi đẻ thêm ra tiền.",
    color: "text-teal-400",
    bgClass: "bg-teal-950/40",
    borderClass: "border-teal-500/35",
    emoji: "📈",
  },
  cro: {
    id: "cro",
    name: "Giám Đốc Rủi Ro",
    title: "Chief Risk Officer (CRO)",
    description: "Thánh bi quan tối ngày đi rao giảng bảo hiểm và kịch bản đen tối thất nghiệp.",
    philosophy: "Kế hoạch rất đẹp, nhưng đời thường không đọc kế hoạch.",
    color: "text-rose-400",
    bgClass: "bg-rose-950/40",
    borderClass: "border-rose-500/35",
    emoji: "🛡️",
  },
  wallet: {
    id: "wallet",
    name: "Cổ Đông Ví Tiền",
    title: "Hầu Bao Của Bạn (Wallet)",
    description: "Đại diện thực tế tàn khốc của dòng tiền, chỉ hét toáng lên khi quá giới hạn.",
    philosophy: "Các người vẽ cho hay, còn tao chết tiền túi trước đây!",
    color: "text-pink-400",
    bgClass: "bg-pink-950/40",
    borderClass: "border-pink-500/35",
    emoji: "💸",
  },
};
