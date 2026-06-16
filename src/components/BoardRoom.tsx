import React, { useState, useEffect } from "react";
import { BOARD_MEMBERS, BoardMember, DebateResult, DebateStep, MemberVote } from "../types";
import { ArrowRight, Check, X, ShieldAlert, AlertTriangle, Sparkles, RefreshCw, TrendingDown, TrendingUp, Clock, Landmark, ShieldCheck, HeartPulse } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BoardRoomProps {
  proposalName: string;
  amount: number;
  debateResult: DebateResult;
  onUserSubmitDecision: (action: "obeyed" | "defied") => void;
  onReset: () => void;
}

export default function BoardRoom({
  proposalName,
  amount,
  debateResult,
  onUserSubmitDecision,
  onReset,
}: BoardRoomProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [phase, setPhase] = useState<"debate" | "voting" | "resolution">("debate");
  const [voteReveals, setVoteReveals] = useState<Record<string, boolean>>({});
  const [votedList, setVotedList] = useState<MemberVote[]>([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const formattedAmount = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  const steps = debateResult.debateSteps;
  const activeDebateStep = steps[currentStepIndex];

  // Auto-play / Advance through debate
  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setPhase("voting");
    }
  };

  const handleSkipDebate = () => {
    setPhase("voting");
  };

  // Vote reveal phase
  useEffect(() => {
    if (phase === "voting") {
      let isSubscribed = true;
      const originalVotes = debateResult.votes;

      // Reveal votes one by one
      const tempReveals: Record<string, boolean> = {};
      originalVotes.forEach((v, index) => {
        setTimeout(() => {
          if (!isSubscribed) return;
          tempReveals[v.memberId] = true;
          setVoteReveals({ ...tempReveals });
          setVotedList((prev) => {
            if (prev.some((p) => p.memberId === v.memberId)) return prev;
            return [...prev, v];
          });

          if (index === originalVotes.length - 1) {
            setTimeout(() => {
              if (isSubscribed) setPhase("resolution");
            }, 1200);
          }
        }, (index + 1) * 750);
      });

      return () => {
        isSubscribed = false;
      };
    }
  }, [phase, debateResult.votes]);

  const approveCount = debateResult.votes.filter((v) => v.vote === "approve").length;
  const rejectCount = debateResult.votes.filter((v) => v.vote === "reject").length;
  const abstainCount = debateResult.votes.filter((v) => v.vote === "abstain").length;

  const memberStyleMap: Record<string, { bg: string, text: string, accent: string }> = {
    chairman: { bg: "bg-slate-900", text: "text-white", accent: "border-slate-955" },
    cxo: { bg: "bg-sky-400", text: "text-black", accent: "border-sky-650" },
    cto: { bg: "bg-emerald-400", text: "text-black", accent: "border-emerald-655" },
    cgo: { bg: "bg-violet-400", text: "text-black", accent: "border-violet-655" },
    cho: { bg: "bg-amber-400", text: "text-black", accent: "border-amber-655" },
    cro: { bg: "bg-yellow-500", text: "text-black", accent: "border-yellow-655" },
    future_you: { bg: "bg-rose-300", text: "text-black", accent: "border-rose-555" },
    wallet: { bg: "bg-orange-400", text: "text-black", accent: "border-orange-655" },
    clo: { bg: "bg-lime-400", text: "text-black", accent: "border-lime-655" },
    luck_director: { bg: "bg-red-400", text: "text-black", accent: "border-red-655" },
  };

  return (
    <div className="bg-slate-50 border-4 border-black rounded-3xl p-6 md:p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden" id="boardroom-view">
      {/* Top Banner Accent */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-400 via-rose-500 to-indigo-600" />

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b-4 border-black mb-8 gap-4 mt-2">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-3 py-1 bg-yellow-300 text-black font-black border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wider">
              🏛️ EMERGENCY BOARD MEETING
            </span>
            {debateResult.evaluationCore?.financial_intent && (
              <span className="text-[10px] font-mono px-3 py-1 bg-indigo-50 border border-indigo-250 text-indigo-700 font-extrabold rounded-lg uppercase">
                {debateResult.evaluationCore.financial_intent.financial_intent}
              </span>
            )}
          </div>
          <h3 className="text-xl md:text-2xl font-black text-black uppercase tracking-tight">
            Thẩm Định: <span className="text-indigo-600 underline font-black">{proposalName}</span>
          </h3>
          <p className="text-xs text-gray-500 font-bold">
            Chủ trì: <span className="text-slate-900 font-mono font-black">{debateResult.theme}</span> | Trị giá: <span className="text-rose-600 font-black font-mono">{formattedAmount}</span>
          </p>
        </div>

        {phase === "debate" && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSkipDebate}
              className="px-4 py-2.5 text-xs bg-white hover:bg-gray-100 text-black border-2 border-black font-black uppercase rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all cursor-pointer"
            >
              Bỏ Qua Tranh Luận
            </button>
            <button
              onClick={handleNextStep}
              className="px-5 py-2.5 text-xs bg-indigo-600 hover:bg-yellow-300 text-white hover:text-black border-2 border-black font-black uppercase rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Tiếp Tục Cuộc Họp</span> <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 3D virtual boardroom table container */}
      <div className={`relative bg-white border-4 border-black rounded-3xl p-5 md:p-8 flex flex-col justify-between mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${phase === "resolution" ? "" : "min-h-[460px] overflow-hidden"}`}>
        {/* Table background layout decoration */}
        {phase !== "resolution" && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[72%] h-[38%] rounded-full bg-slate-50 border-4 border-black flex items-center justify-center opacity-60 pointer-events-none shadow-inner">
            <div className="w-[90%] h-[80%] rounded-full border-2 border-slate-300 border-dashed" />
          </div>
        )}

        {phase === "debate" && activeDebateStep && (
          <div className="w-full h-full flex flex-col justify-between relative z-10">
            {/* Seated Board Members Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mb-6">
              {Object.values(BOARD_MEMBERS).map((member) => {
                const isActive = activeDebateStep.memberId === member.id;
                const visual = memberStyleMap[member.id] || { bg: "bg-white", text: "text-black", accent: "border-black" };
                return (
                  <motion.div
                    key={member.id}
                    animate={{ scale: isActive ? 1.05 : 0.95, y: isActive ? -5 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`p-3 rounded-2xl border-2 border-black text-center transition-all duration-300 flex flex-col justify-between h-28 ${
                      isActive
                        ? `${visual.bg} ${visual.text} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-20 font-black`
                        : "bg-slate-50 border-gray-300 grayscale opacity-45 scale-95 z-0"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="px-1.5 py-0.5 bg-white border border-black rounded text-[8px] font-black uppercase text-black font-mono leading-none">
                        {member.id}
                      </span>
                      <span className="text-xl">{member.emoji}</span>
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black truncate leading-tight">
                        {member.name}
                      </h4>
                      <span className="text-[8px] opacity-85 block truncate font-mono uppercase font-bold mt-0.5">
                        {member.title.split("(")[0]}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* active speech bundle */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStepIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="mt-auto p-5 md:p-6 rounded-2xl bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative"
              >
                <div className="absolute -top-4 left-6 px-3.5 py-1.5 rounded-full bg-black text-white text-xs font-black font-mono uppercase flex items-center gap-1.5 border-2 border-black shadow">
                  <span className="animate-ping rounded-full w-2 h-2 bg-emerald-400 block shrink-0" />
                  <span>{BOARD_MEMBERS[activeDebateStep.memberId]?.emoji} {BOARD_MEMBERS[activeDebateStep.memberId]?.name || activeDebateStep.memberName} ĐANG PHÁT BIỂU</span>
                </div>
                <p className="text-sm md:text-base text-[#1E293B] font-extrabold italic leading-relaxed pt-3">
                  &ldquo;{activeDebateStep.quote}&rdquo;
                </p>

                {/* Progress counter */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t-2 border-black text-[10px] text-slate-500 font-mono font-black border-dashed">
                  <span>BIÊN BẢN TRANH BIỆN - BƯỚC {currentStepIndex + 1}/{steps.length}</span>
                  <button
                    onClick={handleNextStep}
                    className="px-4.5 py-2.5 bg-indigo-600 hover:bg-yellow-300 hover:text-black hover:scale-105 active:scale-95 text-white border-2 border-black rounded-xl font-black font-sans uppercase transition cursor-pointer flex items-center gap-1 shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)]"
                  >
                    {currentStepIndex === steps.length - 1 ? "Tiến Hành Biểu Quyết 🗳️" : "Ý Kiến Tiếp Theo"} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {phase === "voting" && (
          <div className="w-full text-center py-6 relative z-10 flex flex-col items-center justify-center min-h-[400px]">
            <span className="text-5xl animate-bounce mb-3">🗳️</span>
            <h4 className="text-xl md:text-2xl font-black text-black font-sans uppercase tracking-tight">HĐQT Đang Biểu Quyết Độc Lập...</h4>
            <p className="text-xs text-gray-500 font-bold mt-2 max-w-sm mx-auto leading-relaxed">
              Hội đồng đang thẩm thấu lập luận dòng tiền, cân đo thặng dư thâm hụt tài khoa để chính thức bỏ phiếu.
            </p>

            {/* Voting progressive cards */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 w-full max-w-4xl px-4">
              {debateResult.votes.map((v) => {
                const revealed = voteReveals[v.memberId];
                const member = BOARD_MEMBERS[v.memberId];
                const visual = memberStyleMap[v.memberId] || { bg: "bg-white", text: "text-black" };
                return (
                  <motion.div
                    key={v.memberId}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`p-3 rounded-2xl border-2 border-black flex flex-col items-center justify-center text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                      revealed
                        ? `${visual.bg} ${visual.text} font-black`
                        : "bg-slate-50 text-gray-400 border-dashed border-slate-350"
                    }`}
                  >
                    <span className="text-2xl mb-1">{member?.emoji}</span>
                    <span className="text-[11px] font-black uppercase truncate max-w-full block leading-none">{member?.name?.split(" ")[1] || member?.name}</span>
                    <span className="text-[9px] font-mono uppercase block font-black mt-2 bg-white/80 px-2 py-0.5 rounded border border-black/10">
                      {revealed
                        ? v.vote === "approve"
                          ? "✅ ĐỒNG Ý"
                          : v.vote === "reject"
                          ? "❌ BÁC BỎ"
                          : "⏳ HOÃN"
                        : "💤 CHỜ..."}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {phase === "resolution" && (
          <div className="w-full h-full relative z-10 flex flex-col justify-between">
            {(() => {
              const decisionType: "approve" | "delay" | "reject" = 
                debateResult.evaluationCore?.final_decision === "delay" 
                  ? "delay" 
                  : (debateResult.evaluationCore?.final_decision?.includes("approve") || debateResult.conclusion.approved)
                    ? "approve"
                    : "reject";

              const decisionConfig = {
                approve: {
                  bgColor: "bg-emerald-50/90 border-emerald-400 text-emerald-950 shadow-emerald-200",
                  bannerBgColor: "bg-emerald-400 text-black",
                  title: "CHẤP THUẬN CHI TIÊU (APPROVED)",
                  emoji: "✅",
                  sub: "Hội Đồng Quản Trị đánh giá đề xuất khả thi, đáp ứng kỷ luật và thặng dư tối thiểu cho phép."
                },
                delay: {
                  bgColor: "bg-amber-50/90 border-amber-400 text-yellow-950 shadow-amber-200",
                  bannerBgColor: "bg-amber-400 text-black",
                  title: "HOÃN CHI TIÊU TẠM THỜI (DELAYED)",
                  emoji: "⏳",
                  sub: "Cần tích góp gia cố dòng tiền và hũ dự phòng khẩn cấp dồi dào hơn trước khi quyết định mua sách."
                },
                reject: {
                  bgColor: "bg-rose-50/90 border-rose-400 text-rose-955 shadow-rose-200",
                  bannerBgColor: "bg-rose-400 text-black",
                  title: "BÁC BỎ ĐỀ XUẤT CHI TIÊU (REJECTED)",
                  emoji: "❌",
                  sub: "Nguy cơ đứt gãy kỷ luật cao; các nguồn tiền dự phòng chưa thể hấp thụ mục tiêu mua sắm này."
                }
              }[decisionType];

              // Recommended Action Plan Customizer (max 3 items)
              let planSteps: Array<{ step: number; action: string; description: string; amount?: number; duration_month?: number }> = 
                debateResult.action_plan && debateResult.action_plan.length > 0
                  ? debateResult.action_plan.map(p => ({
                      step: p.step,
                      action: p.action,
                      description: p.description || "",
                      amount: p.amount,
                      duration_month: p.duration_month
                    }))
                  : [];

              if (planSteps.length === 0) {
                if (decisionType === "approve") {
                  planSteps = [
                    {
                      step: 1,
                      action: "purchase",
                      description: "Xúc tiến mua sắm khôn ngoan bám sát thặng dư cho phép."
                    },
                    {
                      step: 2,
                      action: "save",
                      description: "Cập nhật dữ liệu sử dụng ví của bạn nhằm kiểm soát hàng rào thâm hụt."
                    },
                    {
                      step: 3,
                      action: "save_more",
                      description: "Trích tích lũy tối thiểu 15-20% thu nhập dồi dào hàng tháng để bồi tài sản ròng."
                    }
                  ];
                } else if (decisionType === "delay") {
                  planSteps = [
                    {
                      step: 1,
                      action: "delay_purchase",
                      description: "Tạm thời gác lại mong muốn mua sắm này trong 30 đến 60 ngày tới."
                    },
                    {
                      step: 2,
                      action: "save_more",
                      amount: Math.round(amount / 4),
                      duration_month: 2,
                      description: `Tích lũy bổ sung thêm ${new Intl.NumberFormat("vi-VN").format(Math.round(amount / 3))}đ mỗi tháng và cất trữ.`
                    },
                    {
                      step: 3,
                      action: "switch_cheaper_option",
                      description: "Xem xét hạ bớt ngân quỹ, săn kẹo ưu đãi hoặc đổi dòng sản phẩm phân khúc tối ưu."
                    }
                  ];
                } else {
                  planSteps = [
                    {
                      step: 1,
                      action: "delay_purchase",
                      description: "Khóa chặt hoàn toàn thèm muốn tốn tiền ở thời điểm này để trị viêm màng túi."
                    },
                    {
                      step: 2,
                      action: "increase_emergency_fund",
                      description: "Chuyển hướng quỹ chuẩn bị sắm đắp thẳng vào Tài Khoản Tích Lũy bảo hộ an toàn."
                    },
                    {
                      step: 3,
                      action: "save_more",
                      description: "Rèn luyện thể chế sinh hoạt (No-Spend) để tăng gia khả năng đề kháng ham muốn nhất thời."
                    }
                  ];
                }
              }

              planSteps = planSteps.slice(0, 3);

              const getActionDetails = (action: string) => {
                const map: Record<string, { emoji: string; label: string; color: string }> = {
                  save_more: { emoji: "🐷", label: "Tích trữ thêm", color: "bg-emerald-50 border-emerald-200 text-emerald-800" },
                  delay_purchase: { emoji: "⏳", label: "Gác ước muốn", color: "bg-amber-50 border-amber-200 text-amber-800" },
                  use_bnpl: { emoji: "💳", label: "Gia hạn chi", color: "bg-indigo-50 border-indigo-200 text-indigo-800" },
                  switch_cheaper_option: { emoji: "✂️", label: "Tối ưu giá", color: "bg-sky-50 border-sky-200 text-sky-800" },
                  buy_insurance: { emoji: "🛡️", label: "Ngăn rủi ro", color: "bg-rose-50 border-rose-200 text-rose-850" },
                  increase_emergency_fund: { emoji: "🏦", label: "Quỹ khẩn cấp", color: "bg-teal-50 border-teal-200 text-teal-850" },
                  allocate_to_investment: { emoji: "📈", label: "Đầu tư khôn", color: "bg-purple-50 border-purple-200 text-purple-850" },
                  travel_fund_contribution: { emoji: "✈️", label: "Quỹ trải nghiệm", color: "bg-cyan-50 border-cyan-200 text-cyan-850" },
                  save: { emoji: "🐷", label: "Bỏ hũ heo", color: "bg-emerald-50 border-emerald-200 text-emerald-800" },
                  purchase: { emoji: "🛒", label: "Xuất ngân sắm", color: "bg-orange-50 border-orange-200 text-orange-850" }
                };
                return map[action.toLowerCase()] || { emoji: "📋", label: action, color: "bg-slate-50 border-slate-205 text-slate-700" };
              };

              interface ProductDisplay {
                product_id: string;
                product_name: string;
                category: string;
                why_this_product: string;
                tradeoff_summary: string;
                cta_text: string;
                cta_url: string;
                emoji: string;
                colorClass: string;
              }

              const parseProductEmojiAndColor = (productId: string, category: string) => {
                const id = productId.toLowerCase();
                const cat = category.toLowerCase();
                if (id.includes("bnpl") || cat.includes("credit") || cat.includes("tra_sau") || id.includes("zalo_pay_tra_sau")) {
                  return { emoji: "💳", colorClass: "bg-indigo-50 border-indigo-200 text-indigo-700" };
                }
                if (id.includes("saving") || cat.includes("saving") || cat.includes("tiet_kiem") || id.includes("gui_tiet_kiem")) {
                  return { emoji: "🐷", colorClass: "bg-emerald-50 border-emerald-200 text-emerald-700" };
                }
                if (id.includes("stock") || cat.includes("investing") || cat.includes("investment") || id.includes("chung_khoan")) {
                  return { emoji: "📈", colorClass: "bg-teal-50 border-teal-200 text-teal-700" };
                }
                if (id.includes("insurance") || cat.includes("safety") || cat.includes("insurance") || id.includes("bao_hiem")) {
                  return { emoji: "🛡️", colorClass: "bg-rose-50 border-rose-200 text-rose-705" };
                }
                return { emoji: "✨", colorClass: "bg-purple-50 border-purple-200 text-purple-705" };
              };

              let productsToRender: ProductDisplay[] = [];

              if (debateResult.evaluationCore?.product_recommendations && debateResult.evaluationCore.product_recommendations.length > 0) {
                productsToRender = debateResult.evaluationCore.product_recommendations.slice(0, 3).map(p => {
                  const visual = parseProductEmojiAndColor(p.product_id, p.category);
                  return {
                    product_id: p.product_id,
                    product_name: p.product_name,
                    category: p.category,
                    why_this_product: p.why_this_product,
                    tradeoff_summary: p.tradeoff_summary,
                    cta_text: p.cta_text || "Chi Tiết Ngay",
                    cta_url: p.cta_url || "https://zalopay.vn",
                    emoji: visual.emoji,
                    colorClass: visual.colorClass
                  };
                });
              } else if (debateResult.recommendedService) {
                const visual = parseProductEmojiAndColor(debateResult.recommendedService.name, "saving");
                productsToRender = [{
                  product_id: "rec_fallback",
                  product_name: debateResult.recommendedService.name,
                  category: "Đề xuất",
                  why_this_product: debateResult.recommendedService.description,
                  tradeoff_summary: "Giải pháp chất lượng hỗ trợ bạn thực nghiệm chuyển đổi chi dùng hiệu quả.",
                  cta_text: debateResult.recommendedService.ctaText || "Khám Phá Widget",
                  cta_url: debateResult.recommendedService.url || "https://zalopay.vn",
                  emoji: debateResult.recommendedService.logoEmoji || visual.emoji,
                  colorClass: visual.colorClass
                }];
              }

              if (productsToRender.length === 0) {
                if (decisionType === "reject" || decisionType === "delay") {
                  productsToRender = [
                    {
                      product_id: "savings_account",
                      product_name: "Tài Khoản Tích Lũy ZaloPay",
                      category: "Tích Sản Hiệu Quả",
                      why_this_product: "Dòng tiền trì sắm cần được gửi trực tiếp sang quỹ tích lũy sinh lời ròng dồi dào hàng ngày.",
                      tradeoff_summary: "Lợi ích: Tránh hao hụt lạm ví hụt tiền khẩn cấp, rút dùng linh hoạt bất cứ khi nào cần thiết.",
                      cta_text: "Gửi tích luỹ sinh lời ròng",
                      cta_url: "https://zalopay.vn/dich-vu/tai-khoan-tich-luy",
                      emoji: "🐷",
                      colorClass: "bg-emerald-50 border-emerald-200 text-emerald-700"
                    }
                  ];
                } else {
                  productsToRender = [
                    {
                      product_id: "bnpl",
                      product_name: "Tài Khoản Trả Sau ZaloPay",
                      category: "Đòn Bẩy Tiêu Dùng",
                      why_this_product: "Hỗ trợ chia nhỏ chu kỳ hoàn tiền khi bạn quyết định mua sắm đề xuất đã được duyệt.",
                      tradeoff_summary: "Lợi ích: Tránh sụt rút quỹ khẩn cấp một cục cùng lúc, chi trả thong thả hoàn toàn miễn lãi lên tới 37 ngày.",
                      cta_text: "Đăng ký an tâm sắm",
                      cta_url: "https://zalopay.vn/dich-vu/tai-khoan-tra-sau",
                      emoji: "💳",
                      colorClass: "bg-indigo-50 border-indigo-200 text-indigo-700"
                    }
                  ];
                }
              }

              return (
                <div className="w-full flex flex-col gap-6">
                  {/* Part 1: Verdict Banner and Speech */}
                  <div className="space-y-4">
                    <div className={`p-5 rounded-3xl border-4 border-black text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${decisionConfig.bgColor}`}>
                      <span className="text-[10px] font-black font-mono uppercase tracking-widest text-slate-500 block mb-1">
                        🏛️ NGHỊ QUYẾT CHÍNH THỨC TỪ BAN GIÁM ĐỐC
                      </span>
                      <h4 className="text-xl md:text-2xl font-black uppercase tracking-tight flex items-center justify-center gap-2 mt-0.5 text-black">
                        <span>{decisionConfig.emoji}</span>
                        <span>{decisionConfig.title}</span>
                      </h4>
                      <p className="text-xs text-slate-800 font-bold mt-2 max-w-xl mx-auto leading-relaxed">
                        {decisionConfig.sub}
                      </p>
                    </div>

                    {/* Speech bubble */}
                    <div className="p-4 md:p-5 rounded-2xl border-4 border-black relative bg-[#FFFBEB] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <div className="absolute -top-4 left-6 px-4 py-1.5 rounded-full bg-black font-mono text-[9px] font-black text-white uppercase flex items-center gap-1.5 shadow border-2 border-black">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> PHÁN QUYẾT TỐI CAO TỪ CHỦ TỊCH
                      </div>
                      <p className="text-slate-850 text-xs md:text-sm font-black italic pt-2 pl-1 leading-relaxed text-slate-800">
                        &ldquo;{debateResult.conclusion.summary}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Part 2: Action Plan (Max 3 actions) */}
                  <div className="bg-white border-4 border-black rounded-3xl p-5 md:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center gap-2 pb-4 border-b-2 border-dashed border-black mb-5">
                      <span className="text-2xl">📋</span>
                      <div>
                        <h4 className="font-sans text-xs md:text-sm text-black font-black uppercase leading-tight">
                          recommended action plan (giải pháp đề xuất)
                        </h4>
                        <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                          Hành động cụ thể được hội đồng tính toán và sắp đặt sẵn sàng cho hành vi tiếp theo của CEO
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {planSteps.map((step, index) => {
                        const actDetails = getActionDetails(step.action);
                        return (
                          <div key={index} className="flex flex-col justify-between bg-slate-50 border-2 border-black p-4 rounded-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3.5px_3.5px_0px_0px_rgba(0,0,0,1)] transition-all">
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <span className="w-6 h-6 shrink-0 bg-slate-900 border border-black text-white flex items-center justify-center font-black text-xs rounded-lg shadow">
                                  {step.step || index + 1}
                                </span>
                                <span className={`font-black text-[9px] uppercase px-2 py-0.5 rounded border ${actDetails.color} font-mono`}>
                                  {actDetails.emoji} {actDetails.label}
                                </span>
                              </div>
                              <p className="text-xs text-slate-850 font-extrabold leading-relaxed text-slate-800">
                                {step.description}
                              </p>
                            </div>
                            {(step.amount || step.duration_month) && (
                              <div className="mt-3.5 pt-2 border-t border-dashed border-slate-305 font-mono text-[9px] text-[#3D5A80] font-black flex flex-wrap gap-x-3 gap-y-1">
                                {step.amount && <span>💰 Khoản: {new Intl.NumberFormat("vi-VN").format(step.amount)}đ</span>}
                                {step.duration_month && <span>⏱️ Thời gian: {step.duration_month} tháng</span>}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Part 3: Recommended Financial Products (Max 3 products) */}
                  <div className="bg-indigo-50/70 border-4 border-black rounded-3xl p-5 md:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center gap-2 pb-4 border-b-2 border-dashed border-black mb-5">
                      <span className="text-2xl">💡</span>
                      <div>
                        <h4 className="font-sans text-xs md:text-sm text-black font-black uppercase leading-tight">
                          recommended financial products (sản phẩm hỗ trợ tốt nhất)
                        </h4>
                        <p className="text-[10px] text-indigo-700 font-bold mt-0.5">
                          Thực thi kế hoạch an toàn bằng các giải pháp thanh toán/tiết kiệm tích hợp dồi dào của ZaloPay
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {productsToRender.map((p, index) => (
                        <div key={p.product_id || index} className="flex flex-col justify-between bg-white border-2 border-black p-4 rounded-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4.5px_4.5px_0px_0px_rgba(0,0,0,1)] transition-all">
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className={`font-black text-[9px] uppercase px-2 py-0.5 rounded border ${p.colorClass} font-mono`}>
                                {p.emoji} {p.category}
                              </span>
                              <span className="text-[9px] text-slate-400 font-mono font-black uppercase">
                                TOP #{index + 1}
                              </span>
                            </div>
                            <h5 className="font-extrabold text-xs md:text-sm text-slate-900 leading-tight">
                              {p.product_name}
                            </h5>
                            
                            <div className="mt-3.5 space-y-2">
                              <div className="text-[10.5px] leading-relaxed text-slate-705">
                                <span className="font-black text-indigo-650 block text-[9px] uppercase tracking-wide">Tại sao phù hợp:</span>
                                {p.why_this_product}
                              </div>
                              <div className="text-[10.5px] leading-relaxed text-slate-755 p-2 rounded-lg bg-slate-50 border border-slate-200">
                                <span className="font-black text-emerald-650 block text-[9px] uppercase tracking-wide mb-0.5">Lợi ích đạt được:</span>
                                {p.tradeoff_summary}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100">
                            <a
                              href={p.cta_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              referrerPolicy="no-referrer"
                              className="w-full text-center py-2 bg-yellow-300 hover:bg-black text-black hover:text-white border-2 border-black font-black uppercase rounded-xl text-[10px] tracking-tight shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all inline-flex items-center justify-center gap-1 cursor-pointer font-bold"
                            >
                              <span>{p.cta_text}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Part 4: Technical and Voting Log details (collapsible) */}
                  <div className="border-4 border-black rounded-3xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white animate-fade-in">
                    <button
                      type="button"
                      onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                      className="w-full flex items-center justify-between p-4 bg-slate-100 hover:bg-slate-200 border-b-2 border-black transition-all cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📊</span>
                        <span className="font-sans text-xs md:text-sm font-black text-black uppercase tracking-tight">
                          XEM CHỈ SỐ KỸ THUẬT & BIÊN BẢN HỌP HĐQT CHI TIẾT
                        </span>
                      </div>
                      <span className="font-black text-xs px-2.5 py-1.5 border-2 border-black rounded-xl bg-white text-black font-mono shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-50 transition">
                        {isDetailsOpen ? "🛠️ THU GỌN" : "🔍 MỞ RỘNG"}
                      </span>
                    </button>

                    <AnimatePresence>
                      {isDetailsOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="border-t border-black p-5 bg-slate-50 space-y-6"
                        >
                          {/* Vote counts details */}
                          <div className="space-y-2">
                            <h5 className="font-black text-[10px] uppercase font-mono text-slate-500 tracking-wider">Tỷ lệ phiếu từ giám đốc bộ ngành</h5>
                            <div className="grid grid-cols-3 gap-3 bg-white p-4 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                              <div className="text-center">
                                <span className="text-[9px] font-mono text-emerald-700 block uppercase font-black">THÔNG QUA (APPROVE)</span>
                                <span className="text-base font-black font-mono text-emerald-600">{approveCount} phiếu</span>
                              </div>
                              <div className="text-center border-x-2 border-black">
                                <span className="text-[9px] font-mono text-rose-700 block uppercase font-black">BÁC BỎ (REJECT)</span>
                                <span className="text-base font-black font-mono text-rose-600">{rejectCount} phiếu</span>
                              </div>
                              <div className="text-center">
                                <span className="text-[9px] font-mono text-slate-700 block uppercase font-black">HOÃN LẠI (DELAY)</span>
                                <span className="text-base font-black font-mono text-slate-600">{abstainCount} phiếu</span>
                              </div>
                            </div>
                          </div>

                          {/* Seated member rationales */}
                          <div className="space-y-2">
                            <h5 className="font-black text-[10px] uppercase font-mono text-slate-500 tracking-wider">Lập luận kỹ thuật từng giám đốc</h5>
                            <div className="max-h-[220px] overflow-y-auto pr-2 bg-white border-2 border-black rounded-2xl p-4 space-y-3 shadow-inner scrollbar-thin">
                              {debateResult.votes.map((v) => {
                                const member = BOARD_MEMBERS[v.memberId];
                                return (
                                  <div key={v.memberId} className="flex items-start justify-between text-xs py-2 border-b border-dashed border-slate-205 last:border-0 pl-1 gap-4">
                                    <div className="flex gap-2.5 items-start min-w-0">
                                      <span className="text-xl shrink-0 mt-0.5 leading-none">{member?.emoji}</span>
                                      <div className="leading-normal min-w-0">
                                        <span className="font-extrabold text-black block">{member?.name} ({member?.title.split("(")[0]})</span>
                                        <p className="italic font-medium mt-1 leading-relaxed text-slate-600">&ldquo;{v.reason}&rdquo;</p>
                                      </div>
                                    </div>
                                    <span
                                      className={`font-mono uppercase font-black text-[8px] px-2.5 py-1 rounded-full border border-black shrink-0 tracking-wide ${
                                        v.vote === "approve"
                                          ? "bg-emerald-300 text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                                          : v.vote === "reject"
                                          ? "bg-rose-300 text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                                          : "bg-amber-300 text-slate-800 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                                      }`}
                                    >
                                      {v.vote === "approve" ? "ĐỒNG Ý" : v.vote === "reject" ? "BÁC BỎ" : "HOÃN LẠI"}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Parallel Simulations */}
                          {debateResult.futureSimulation && (
                            <div className="space-y-2">
                              <h5 className="font-black text-[10px] uppercase font-mono text-slate-500 tracking-wider">Mô phỏng tương lai song song</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-rose-50/50 border-2 border-black rounded-2xl flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-[9px] font-mono font-black text-rose-700 uppercase bg-rose-100 border border-rose-200 px-2.5 py-0.5 rounded-full inline-block">MUA LUÔN HÔM NAY</span>
                                      <TrendingDown className="w-4 h-4 text-rose-600" />
                                    </div>
                                    <p className="text-xs font-bold text-slate-650 leading-relaxed">
                                      {debateResult.futureSimulation.scenarioA}
                                    </p>
                                  </div>
                                </div>

                                <div className="p-4 bg-emerald-50/50 border-2 border-black rounded-2xl flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-[9px] font-mono font-black text-emerald-700 uppercase bg-emerald-100 border border-emerald-250 px-2.5 py-0.5 rounded-full inline-block">HOÃN CHI, TÍCH LUỸ</span>
                                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <p className="text-xs font-bold text-slate-650 leading-relaxed">
                                      {debateResult.futureSimulation.scenarioB}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="p-3 bg-white border-2 border-black rounded-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
                                <span className="text-base shrink-0">🔮</span>
                                <p className="text-xs font-bold text-gray-800 leading-normal">
                                  <span className="font-black text-indigo-700 uppercase tracking-wider block text-[10px] mb-0.5">BIÊN ĐỘ GIA TĂNG GIÁ TRỊ:</span>
                                  {debateResult.futureSimulation.impactSummary}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Goal Impacts */}
                          {debateResult.goal_impacts && debateResult.goal_impacts.length > 0 && (
                            <div className="space-y-2">
                              <h5 className="font-black text-[10px] uppercase font-mono text-slate-500 tracking-wider">Tác động tỷ lệ tiến độ mục tiêu cá nhân</h5>
                              <div className="p-4 bg-white border-2 border-black rounded-2xl flex flex-col gap-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                {debateResult.goal_impacts.map((g, idx) => (
                                  <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between text-xs border-b border-dashed border-gray-200 pb-2 mb-2 last:border-0 last:pb-0 last:mb-0">
                                    <span className="font-bold text-slate-900">{g.goal}</span>
                                    <div className="flex items-center gap-2 mt-1 md:mt-0 font-mono">
                                      <span className="text-gray-500 font-bold">Tiến độ hiện tại: {g.current_progress}%</span>
                                      {g.impact === "negative" && (
                                        <>
                                          <ArrowRight className="w-3 h-3 text-gray-400" />
                                          <span className="text-rose-600 font-extrabold">{g.new_progress}%</span>
                                          <span className="ml-1 text-[9px] bg-rose-100 text-rose-850 border border-rose-200 px-1.5 py-0.5 rounded font-black font-mono">GIẢM TỐC ⚠️</span>
                                        </>
                                      )}
                                      {g.impact === "positive" && (
                                        <>
                                          <ArrowRight className="w-3 h-3 text-gray-400" />
                                          <span className="text-emerald-600 font-extrabold">{g.new_progress}%</span>
                                          <span className="ml-1 text-[9px] bg-emerald-100 text-emerald-250 border border-emerald-250 px-1.5 py-0.5 rounded font-black font-mono">ĐẨY NHANH 🚀</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* User Decision Response Phase */}
      {phase === "resolution" && (
        <div className="p-6 bg-white border-4 border-black rounded-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black mt-8">
          <h4 className="text-lg font-black text-black uppercase tracking-tight mb-2">Quyết định cuối cùng của CEO:</h4>
          <p className="text-xs text-gray-500 font-bold mb-6">
            Lựa chọn của bạn sẽ thay đổi <span className="font-extrabold text-indigo-650 underline">Điểm Kỷ Luật tài chính</span> thực tế. Hãy thật trung thực!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Follow option */}
            <button
              onClick={() => onUserSubmitDecision("obeyed")}
              className="p-5 rounded-3xl border-4 border-black bg-emerald-100 hover:bg-emerald-200 text-black transition text-left cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:scale-95 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-400 border-2 border-black text-black flex items-center justify-center font-black">
                    <Check className="w-5 h-5" />
                  </div>
                  <span className="font-black text-[11px] uppercase font-mono tracking-wider">Tuân thủ phán quyết</span>
                </div>
                <p className="text-xs text-slate-800 font-semibold mb-4 leading-relaxed">
                  {debateResult.conclusion.approved
                    ? "Tôi sẽ tiến hành mua sắm có kế hoạch tối ưu đúng như HĐQT phê duyệt."
                    : "Tôi quyết định dẹp bỏ nguyện vọng chi tiêu tạm thời và dồn tiền tích lũy."}
                </p>
              </div>
              <span className="text-[10px] bg-white text-black border-2 border-black px-3 py-1 rounded-full font-mono font-black inline-block mt-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase">
                Tích lũy +{Math.max(1, Math.round(Math.abs(debateResult.conclusion.disciplineImpact / 2)))} Điểm Kỷ Luật
              </span>
            </button>

            {/* Defy option */}
            <button
              onClick={() => onUserSubmitDecision("defied")}
              className="p-5 rounded-3xl border-4 border-black bg-rose-100 hover:bg-rose-200 text-black transition text-left cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:scale-95 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-400 border-2 border-black text-black flex items-center justify-center font-black">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <span className="font-black text-[11px] uppercase font-mono tracking-wider">Bất chấp, Chi tiêu luôn!</span>
                </div>
                <p className="text-xs text-slate-800 font-semibold mb-4 leading-relaxed">
                  {debateResult.conclusion.approved
                    ? "Tôi quyết định KHÔNG mua sắm mặc dù đã được duyệt để tối ưu ngân sách."
                    : "Mặc kệ lời khuyên từ HĐQT, tôi vẫn quất khoản này bằng được vì quá thích."}
                </p>
              </div>
              <span className="text-[10px] bg-white text-black border-2 border-black px-3 py-1 rounded-full font-mono font-black inline-block mt-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase">
                Biến động: {debateResult.conclusion.disciplineImpact > 0 ? "+" : ""}{debateResult.conclusion.disciplineImpact} Điểm Kỷ Luật
              </span>
            </button>
          </div>

          <div className="mt-6 pt-4 border-t-2 border-black flex justify-between items-center text-xs border-dashed">
            <span className="text-gray-500 font-bold uppercase font-mono">CEO Veto Right</span>
            <button
              onClick={onReset}
              className="text-gray-800 hover:text-black font-black uppercase underline flex items-center gap-1 cursor-pointer font-sans"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Hủy Bỏ & Xem Xét Hồ Sơ Khác</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
