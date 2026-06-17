// Mirrors backend/app/models.py field-for-field (snake_case, matching the
// JSON the FastAPI service actually returns). Anything not defined here is
// not part of the real API contract — don't invent fields the backend
// doesn't send.

export interface LifestylePreference {
  travel: number;
  shopping: number;
  entertainment: number;
  saving: number;
  investing: number;
  safety: number;
}

export interface BnplHolding { has: boolean; limit: number; provider: string | null; }
export interface SavingsHolding { has: boolean; balance: number; }
export interface SecuritiesHolding { has: boolean; balance: number; }
export interface LifeInsuranceHolding { has: boolean; premium: number; }
export interface NonLifeInsuranceHolding { has: boolean; name: string | null; }

export interface ProductHoldings {
  bnpl: BnplHolding;
  savings: SavingsHolding;
  securities: SecuritiesHolding;
  life_insurance: LifeInsuranceHolding;
  non_life_insurance: NonLifeInsuranceHolding;
}

export interface Goal {
  goal_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
}

export interface FinancialProfile {
  user_id: string;
  display_name: string;
  monthly_income: number;
  monthly_fixed_expenses: number | null;
  cash_balance: number;
  investments_balance: number;
  risk_tolerance: "low" | "medium" | "high";
  lifestyle_preference: LifestylePreference;
  product_holdings: ProductHoldings;
  active_goals: Goal[];
  discipline_score: number;
  created_at: string;
  updated_at: string;
}

export interface ProfileComputed {
  health_score: number;
  health_label: string;
  health_description: string;
}

export interface ProfileView extends UserState {
  computed: ProfileComputed;
}

// --- History / gamification -------------------------------------------

export type UserAction = "obeyed" | "defied";

export interface MemberVote {
  member_id: string;
  member_name: string;
  vote: "approve" | "reject";
  reason: string;
}

export interface ActionPlanStep {
  step: number;
  action: string;
  amount?: number;
  duration_month?: number;
  description: string;
}

export interface DecisionRecord {
  id: string;
  timestamp: string;
  proposal_name: string;
  amount: number;
  context: string;
  user_action: "obeyed" | "defied";
  score_change: number;
  previous_score: number;
  new_score: number;
  approved: boolean;
  summary: string;
  votes: MemberVote[];
  action_plan: ActionPlanStep[];
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  reward_points: number;
  emoji: string;
  status: "available" | "active" | "completed" | "failed";
  target_value: number;
  current_value: number;
  type: "no_spend" | "limit_spending" | "saving_target" | "custom";
  is_custom?: boolean;
  start_date?: string;
  end_date?: string;
  history_log?: string[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  conditionDesc: string;
}

export interface UserState {
  onboarding_completed: boolean;
  profile: FinancialProfile;
  history: DecisionRecord[];
  challenges: Challenge[];
  unlocked_badge_ids: string[];
}

// --- Smart tips ---------------------------------------------------------

export interface SmartTip {
  item: string;
  amount: number;
  url: string;
  note: string;
}

export interface SmartTipsResponse {
  savings_pct: number;
  savings_note: string;
  tips: SmartTip[];
}

// --- Proposal evaluation (engine output) --------------------------------

export type FinancialIntent =
  | "Consumption"
  | "Experience Spending"
  | "Human Capital Investment"
  | "Asset Accumulation"
  | "Capital Preservation"
  | "Risk Protection"
  | "Debt Financing";

export interface IntentResult {
  financial_intent: FinancialIntent;
  confidence: number;
  reasoning: string;
}

export interface ProposalInput {
  proposal_name: string;
  amount: number;
  context: string;
  intent_hint?: string;
}

export interface ReasonBullet {
  dimension: string;
  summary: string;
  impact: "low" | "medium" | "high";
}

export interface Scores {
  affordability: number;
  liquidity: number;
  debt_burden: number;
  goal_alignment: number;
  discipline_fit: number;
  overall: number;
}

export interface FinancialImpact {
  cash_gap: number;
  estimated_months_to_afford: number;
  estimated_monthly_payment: number;
  remaining_emergency_fund: number;
}

export interface GoalImpact {
  goal: string;
  current_progress: number;
  new_progress: number;
  impact: "positive" | "negative" | "neutral";
}

export interface ProductRecommendation {
  product_id: string;
  product_name: string;
  category: string;
  why_this_product: string;
  tradeoff_summary: string;
  cta_text: string;
  cta_url: string;
}

export interface FutureSimulation {
  scenario_a: string;
  scenario_b: string;
  impact_summary: string;
}

export type Decision = "approve" | "approve_with_conditions" | "delay" | "reject";

export interface EvaluationResult {
  evaluation_id: string;
  decision: Decision;
  risk_level: "low" | "medium" | "high";
  reason_codes: string[];
  financial_intent: IntentResult;
  scores: Scores;
  explainability: ReasonBullet[];
  financial_impact: FinancialImpact;
  action_plan: ActionPlanStep[];
  goal_impacts: GoalImpact[];
  product_recommendation: ProductRecommendation;
  future_simulation: FutureSimulation;
  obey_reward: number;
  defy_penalty: number;
  evaluated_at: string;
}

// --- Narration (AI plug-in output) --------------------------------------

export interface DebateStep {
  member_id: string;
  member_name: string;
  quote: string;
}

export interface BoardConclusion {
  approved: boolean;
  summary: string;
}

export interface NarrationResult {
  theme: string;
  debate_steps: DebateStep[];
  votes: MemberVote[];
  conclusion: BoardConclusion;
  provider: string;
  model: string;
  fallback_used: boolean;
}

export interface DebateResponse {
  narration: NarrationResult;
  evaluation: EvaluationResult;
}

// --- Chat / AI follow-up ---------------------------------------------------

export interface FollowupQuestion {
  question: string;
  options: string[];
}

export interface FollowupResponse {
  follow_up_questions: FollowupQuestion[];
  question_type: "spending" | "advice" | "general";
}

export interface AdviceResponse {
  answer: string;
  is_spending_related: boolean;
  suggested_proposal_name: string | null;
}

export interface VerdictCardResponse {
  image_b64: string;
}

export interface ResolveDecisionInput {
  proposal_name: string;
  amount: number;
  context: string;
  evaluation: EvaluationResult;
  narration: NarrationResult;
  user_action: "obeyed" | "defied";
}

// --- Board member presentation config (frontend-only, never sent over the wire) --

export interface BoardMember {
  id: string;
  name: string;
  title: string;
  description: string;
  philosophy: string;
  color: string;
  bgClass: string;
  borderClass: string;
  emoji: string;
  zalopay_url?: string;
}

export const BOARD_MEMBERS: Record<string, BoardMember> = {
  chairman: {
    id: "chairman",
    name: "Chủ Tịch",
    title: "Chủ tịch Hội đồng quản trị",
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
    zalopay_url: "https://zalopay.vn/dat-ve-may-bay",
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
    zalopay_url: "https://zalopay.vn/dat-ve-phim",
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
    zalopay_url: "https://zalopay.vn/dich-vu/tai-khoan-tra-sau",
  },
  luck_director: {
    id: "luck_director",
    name: "Giám Đốc May Mắn",
    title: "Chief Luck Officer (CLO²)",
    description: "Thần tài gõ cửa, luôn rủ mua vé Vietlott hoặc Keno.",
    philosophy: "Đánh đổi 10k lấy cơ hội độc đắc 100 tỷ VND.",
    color: "text-rose-400",
    bgClass: "bg-rose-950/40",
    borderClass: "border-rose-500/35",
    emoji: "🍀",
    zalopay_url: "https://zalopay.vn/cach-mua-ve-so-vietlott-online-2226",
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
    zalopay_url: "https://zalopay.vn/dich-vu/gui-tiet-kiem",
  },
  cgo: {
    id: "cgo",
    name: "Giám Đốc Tăng Trưởng",
    title: "Chief Growth Officer (CGO)",
    description: "Nhìn mọi thứ dưới góc độ cổ phiếu, ETF và lợi nhuận dài hạn.",
    philosophy: "Tiền là để đi đẻ thêm ra tiền.",
    color: "text-teal-400",
    bgClass: "bg-teal-950/40",
    borderClass: "border-teal-500/35",
    emoji: "📈",
    zalopay_url: "https://zalopay.vn/dich-vu/tai-khoan-chung-khoan",
  },
  cro: {
    id: "cro",
    name: "Giám Đốc Rủi Ro",
    title: "Chief Risk Officer (CRO)",
    description: "Thánh bi quan tối ngày đi rao giảng bảo hiểm và kịch bản đen tối.",
    philosophy: "Kế hoạch rất đẹp, nhưng đời thường không đọc kế hoạch.",
    color: "text-rose-400",
    bgClass: "bg-rose-950/40",
    borderClass: "border-rose-500/35",
    emoji: "🛡️",
    zalopay_url: "https://zalopay.vn/dich-vu/bao-hiem",
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
