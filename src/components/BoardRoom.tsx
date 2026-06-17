import React, { useState, useEffect } from "react";
import { BOARD_MEMBERS, DebateResponse, MemberVote, UserAction } from "../types";
import { ArrowRight, Check, Share2, ShieldAlert, Sparkles, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import VerdictCard from "./VerdictCard";

interface BoardRoomProps {
  proposalName: string;
  amount: number;
  debate: DebateResponse;
  displayName: string;
  onUserSubmitDecision: (action: UserAction) => void;
  onReset: () => void;
}

const MEMBER_STYLE: Record<string, { bg: string; text: string }> = {
  chairman: { bg: "bg-slate-900", text: "text-white" },
  cxo: { bg: "bg-sky-400", text: "text-black" },
  cto: { bg: "bg-emerald-400", text: "text-black" },
  cgo: { bg: "bg-violet-400", text: "text-black" },
  cho: { bg: "bg-amber-400", text: "text-black" },
  cro: { bg: "bg-yellow-500", text: "text-black" },
  wallet: { bg: "bg-orange-400", text: "text-black" },
  clo: { bg: "bg-lime-400", text: "text-black" },
  luck_director: { bg: "bg-red-400", text: "text-black" },
};

const ACTION_LABELS: Record<string, { emoji: string; label: string }> = {
  save_more: { emoji: "🐷", label: "Tích lũy thêm" },
  delay_purchase: { emoji: "⏳", label: "Trì hoãn" },
  use_bnpl: { emoji: "💳", label: "Trả sau" },
  switch_cheaper_option: { emoji: "✂️", label: "Tìm phương án rẻ hơn" },
  increase_emergency_fund: { emoji: "🏦", label: "Bù quỹ khẩn cấp" },
  allocate_to_investment: { emoji: "📈", label: "Đầu tư" },
  travel_fund_contribution: { emoji: "✈️", label: "Quỹ du lịch" },
  purchase: { emoji: "🛒", label: "Mua ngay" },
};

const CATEGORY_EMOJI: Record<string, string> = {
  credit: "💳",
  saving: "🐷",
  investing: "📈",
  safety: "🛡️",
  travel: "✈️",
  entertainment: "🍿",
};

const DECISION_BANNER: Record<string, { bg: string; title: string; emoji: string }> = {
  approve: { bg: "bg-emerald-50 border-emerald-400", title: "CHẤP THUẬN", emoji: "✅" },
  approve_with_conditions: { bg: "bg-emerald-50 border-emerald-400", title: "CHẤP THUẬN CÓ ĐIỀU KIỆN", emoji: "✅" },
  delay: { bg: "bg-amber-50 border-amber-400", title: "TẠM HOÃN", emoji: "⏳" },
  reject: { bg: "bg-rose-50 border-rose-400", title: "BÁC BỎ", emoji: "❌" },
};

const IMPACT_DOT: Record<string, string> = { high: "bg-rose-500", medium: "bg-amber-500", low: "bg-emerald-500" };

export default function BoardRoom({ proposalName, amount, debate, displayName, onUserSubmitDecision, onReset }: BoardRoomProps) {
  const { narration, evaluation } = debate;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [phase, setPhase] = useState<"debate" | "voting" | "resolution">("debate");
  const [viewMode, setViewMode] = useState<"sequential" | "all">("sequential");
  const [voteReveals, setVoteReveals] = useState<Record<string, boolean>>({});
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isWhyOpen, setIsWhyOpen] = useState(false);
  const [showVerdictCard, setShowVerdictCard] = useState(false);

  const formattedAmount = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  const steps = narration.debate_steps;
  const activeStep = steps[currentStepIndex];

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) setCurrentStepIndex((p) => p + 1);
    else setPhase("voting");
  };

  useEffect(() => {
    if (phase !== "voting") return;
    let active = true;
    const reveals: Record<string, boolean> = {};
    narration.votes.forEach((v: MemberVote, index: number) => {
      setTimeout(() => {
        if (!active) return;
        reveals[v.member_id] = true;
        setVoteReveals({ ...reveals });
        if (index === narration.votes.length - 1) {
          setTimeout(() => active && setPhase("resolution"), 1000);
        }
      }, (index + 1) * 650);
    });
    return () => { active = false; };
  }, [phase, narration.votes]);

  const approveCount = narration.votes.filter((v) => v.vote === "approve").length;
  const rejectCount = narration.votes.length - approveCount;
  const banner = DECISION_BANNER[evaluation.decision];
  const categoryEmoji = CATEGORY_EMOJI[evaluation.product_recommendation.category] || "✨";

  return (
    <div className="bg-slate-50 border-4 border-black rounded-3xl p-6 md:p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-400 via-rose-500 to-indigo-600" />

      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b-4 border-black mb-8 gap-4 mt-2">
        <div className="space-y-1.5">
          <h3 className="text-xl md:text-2xl font-black text-black uppercase tracking-tight">
            <span className="text-indigo-600">{proposalName}</span>
          </h3>
          <p className="text-xs text-gray-500 font-bold">{formattedAmount}</p>
        </div>
        {phase === "debate" && (
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex border-2 border-black rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode("sequential")}
                className={`px-3 py-2 text-[11px] font-black uppercase cursor-pointer transition-all ${viewMode === "sequential" ? "bg-indigo-600 text-white" : "bg-white text-black hover:bg-slate-100"}`}
              >
                Từng người
              </button>
              <button
                onClick={() => setViewMode("all")}
                className={`px-3 py-2 text-[11px] font-black uppercase cursor-pointer transition-all border-l-2 border-black ${viewMode === "all" ? "bg-indigo-600 text-white" : "bg-white text-black hover:bg-slate-100"}`}
              >
                Tất cả
              </button>
            </div>
            <button
              onClick={() => setPhase("voting")}
              className="px-4 py-2.5 text-xs bg-slate-100 hover:bg-yellow-300 text-black border-2 border-black font-black uppercase rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Bỏ qua</span> <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className={`relative bg-white border-4 border-black rounded-3xl p-5 md:p-8 flex flex-col justify-between mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${phase === "resolution" ? "" : "min-h-[420px]"}`}>
        {phase === "debate" && activeStep && viewMode === "sequential" && (
          <div className="w-full h-full flex flex-col justify-between relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mb-6">
              {Object.values(BOARD_MEMBERS).map((member) => {
                const isActive = activeStep.member_id === member.id;
                const visual = MEMBER_STYLE[member.id] || { bg: "bg-white", text: "text-black" };
                return (
                  <motion.div
                    key={member.id}
                    animate={{ scale: isActive ? 1.05 : 0.95, y: isActive ? -5 : 0 }}
                    className={`p-3 rounded-2xl border-2 border-black text-center transition-all flex flex-col justify-between h-24 ${
                      isActive ? `${visual.bg} ${visual.text} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black` : "bg-slate-50 border-gray-300 grayscale opacity-45 scale-95"
                    }`}
                  >
                    <span className="text-xl self-end">{member.emoji}</span>
                    <h4 className="text-[11px] font-black truncate leading-tight">{member.name}</h4>
                  </motion.div>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStepIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="mt-auto p-5 md:p-6 rounded-2xl bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative"
              >
                <div className="absolute -top-4 left-6 px-3.5 py-1.5 rounded-full bg-black text-white text-xs font-black uppercase flex items-center gap-1.5 border-2 border-black">
                  <span>{BOARD_MEMBERS[activeStep.member_id]?.emoji} {BOARD_MEMBERS[activeStep.member_id]?.name || activeStep.member_name}</span>
                </div>
                <p className="text-sm md:text-base text-[#1E293B] font-extrabold italic leading-relaxed pt-3">&ldquo;{activeStep.quote}&rdquo;</p>
                <div className="flex justify-end mt-6 pt-4 border-t-2 border-dashed border-black">
                  <button onClick={handleNextStep} className="px-4.5 py-2.5 bg-indigo-600 hover:bg-yellow-300 hover:text-black text-white border-2 border-black rounded-xl font-black uppercase transition cursor-pointer flex items-center gap-1 shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)]">
                    {currentStepIndex === steps.length - 1 ? "Biểu quyết 🗳️" : "Tiếp theo"} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {phase === "debate" && viewMode === "all" && (
          <div className="w-full flex flex-col gap-4 relative z-10">
            <div className="overflow-y-auto max-h-[520px] space-y-4 pr-1">
              {steps.map((step, idx) => {
                const member = BOARD_MEMBERS[step.member_id];
                const visual = MEMBER_STYLE[step.member_id] || { bg: "bg-slate-100", text: "text-black" };
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    className="p-4 md:p-5 rounded-2xl bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative"
                  >
                    <div className="absolute -top-3.5 left-5 flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-black text-xs font-black uppercase text-white" style={{}} >
                      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-black text-xs font-black ${visual.bg} ${visual.text}`}>
                        {member?.emoji} {member?.name || step.member_name}
                      </span>
                    </div>
                    <p className="text-sm text-[#1E293B] font-extrabold italic leading-relaxed pt-3">&ldquo;{step.quote}&rdquo;</p>
                  </motion.div>
                );
              })}
            </div>
            <button
              onClick={() => setPhase("voting")}
              className="w-full py-3.5 bg-indigo-600 hover:bg-yellow-300 hover:text-black text-white border-2 border-black rounded-2xl font-black uppercase transition cursor-pointer flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            >
              Biểu quyết 🗳️ <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {phase === "voting" && (
          <div className="w-full text-center py-6 relative z-10 flex flex-col items-center justify-center min-h-[380px]">
            <span className="text-5xl animate-bounce mb-3">🗳️</span>
            <h4 className="text-xl font-black text-black uppercase tracking-tight">Đang biểu quyết...</h4>
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 w-full max-w-4xl px-4">
              {narration.votes.map((v) => {
                const revealed = voteReveals[v.member_id];
                const member = BOARD_MEMBERS[v.member_id];
                const visual = MEMBER_STYLE[v.member_id] || { bg: "bg-white", text: "text-black" };
                return (
                  <motion.div
                    key={v.member_id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`p-3 rounded-2xl border-2 border-black flex flex-col items-center justify-center text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                      revealed ? `${visual.bg} ${visual.text} font-black` : "bg-slate-50 text-gray-400 border-dashed"
                    }`}
                  >
                    <span className="text-2xl mb-1">{member?.emoji}</span>
                    <span className="text-[9px] font-mono uppercase font-black mt-2">{revealed ? (v.vote === "approve" ? "✅ ĐỒNG Ý" : "❌ BÁC BỎ") : "💤"}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {phase === "resolution" && (
          <div className="w-full flex flex-col gap-6 relative z-10">
            <div className="space-y-4">
              <div className={`p-5 rounded-3xl border-4 border-black text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${banner.bg}`}>
                <h4 className="text-xl md:text-2xl font-black uppercase tracking-tight flex items-center justify-center gap-2 text-black">
                  <span>{banner.emoji}</span>
                  <span>{banner.title}</span>
                </h4>
              </div>
              <div className="p-4 md:p-5 rounded-2xl border-4 border-black relative bg-[#FFFBEB] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="absolute -top-4 left-6 px-4 py-1.5 rounded-full bg-black font-mono text-[9px] font-black text-white uppercase flex items-center gap-1.5 border-2 border-black">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> CHỦ TỊCH KẾT LUẬN
                </div>
                <p className="text-xs md:text-sm font-black italic pt-2 leading-relaxed text-slate-800">&ldquo;{narration.conclusion.summary}&rdquo;</p>
              </div>
            </div>

            {/* Why? — explainability panel */}
            <div className="border-4 border-black rounded-3xl overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setIsWhyOpen(!isWhyOpen)}
                className="w-full flex items-center justify-between p-4 bg-indigo-50 hover:bg-indigo-100 border-b-2 border-black transition-all cursor-pointer"
              >
                <span className="font-black text-xs uppercase tracking-tight">🔍 Vì sao?</span>
                <span className="font-black text-[10px] px-2 py-1 border-2 border-black rounded-lg bg-white">{isWhyOpen ? "Thu gọn" : "Xem chi tiết"}</span>
              </button>
              <AnimatePresence>
                {isWhyOpen && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="p-4 space-y-2.5">
                      {evaluation.explainability.map((bullet, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs">
                          <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${IMPACT_DOT[bullet.impact]}`} />
                          <div>
                            <strong className="text-slate-900 font-black block">{bullet.dimension}</strong>
                            <span className="text-slate-600 font-semibold">{bullet.summary}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action plan */}
            <div className="bg-white border-4 border-black rounded-3xl p-5 md:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <h4 className="font-black text-xs uppercase pb-4 border-b-2 border-dashed border-black mb-5">📋 Việc cần làm</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {evaluation.action_plan.map((step, index) => {
                  const labels = ACTION_LABELS[step.action] || { emoji: "📋", label: step.action };
                  return (
                    <div key={index} className="flex flex-col justify-between bg-slate-50 border-2 border-black p-4 rounded-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <div>
                        <span className="font-black text-[10px] uppercase block mb-2">{labels.emoji} {labels.label}</span>
                        <p className="text-xs text-slate-800 font-extrabold leading-relaxed">{step.description}</p>
                      </div>
                      {(step.amount || step.duration_month) && (
                        <div className="mt-3 pt-2 border-t border-dashed text-[9px] text-slate-600 font-black flex flex-wrap gap-x-3">
                          {step.amount && <span>💰 {new Intl.NumberFormat("vi-VN").format(step.amount)}đ</span>}
                          {step.duration_month && <span>⏱️ {step.duration_month} tháng</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Product recommendation */}
            <div className="bg-indigo-50/70 border-4 border-black rounded-3xl p-5 md:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <h4 className="font-black text-xs uppercase pb-4 border-b-2 border-dashed border-black mb-5">💡 Gợi ý sản phẩm</h4>
              <div className="bg-white border-2 border-black p-4 rounded-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] max-w-md">
                <span className="font-black text-[9px] uppercase">{categoryEmoji} {evaluation.product_recommendation.category}</span>
                <h5 className="font-extrabold text-sm text-slate-900 mt-1">{evaluation.product_recommendation.product_name}</h5>
                <p className="text-[11px] leading-relaxed text-slate-700 mt-2">{evaluation.product_recommendation.why_this_product}</p>
                <a
                  href={evaluation.product_recommendation.cta_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-center py-2 px-4 bg-yellow-300 hover:bg-black text-black hover:text-white border-2 border-black font-black uppercase rounded-xl text-[10px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  {evaluation.product_recommendation.cta_text} <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Collapsible: votes + simulation + goal impacts */}
            <div className="border-4 border-black rounded-3xl overflow-hidden bg-white">
              <button type="button" onClick={() => setIsDetailsOpen(!isDetailsOpen)} className="w-full flex items-center justify-between p-4 bg-slate-100 hover:bg-slate-200 border-b-2 border-black cursor-pointer">
                <span className="font-black text-xs uppercase">📊 Biên bản & mô phỏng</span>
                <span className="font-black text-[10px] px-2 py-1 border-2 border-black rounded-lg bg-white">{isDetailsOpen ? "Thu gọn" : "Xem thêm"}</span>
              </button>
              <AnimatePresence>
                {isDetailsOpen && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="p-5 bg-slate-50 space-y-5">
                      <div className="grid grid-cols-2 gap-3 bg-white p-4 rounded-2xl border-2 border-black">
                        <div className="text-center">
                          <span className="text-[9px] font-mono text-emerald-700 block uppercase font-black">ĐỒNG Ý</span>
                          <span className="text-base font-black font-mono text-emerald-600">{approveCount}</span>
                        </div>
                        <div className="text-center border-l-2 border-black">
                          <span className="text-[9px] font-mono text-rose-700 block uppercase font-black">BÁC BỎ</span>
                          <span className="text-base font-black font-mono text-rose-600">{rejectCount}</span>
                        </div>
                      </div>

                      <div className="max-h-[200px] overflow-y-auto pr-2 bg-white border-2 border-black rounded-2xl p-4 space-y-3">
                        {narration.votes.map((v) => {
                          const member = BOARD_MEMBERS[v.member_id];
                          return (
                            <div key={v.member_id} className="flex items-start justify-between text-xs py-2 border-b border-dashed last:border-0 gap-4">
                              <div className="flex gap-2.5 items-start min-w-0">
                                <span className="text-xl shrink-0">{member?.emoji}</span>
                                <div>
                                  <span className="font-extrabold text-black block">{member?.name}</span>
                                  <p className="italic font-medium mt-1 text-slate-600">&ldquo;{v.reason}&rdquo;</p>
                                </div>
                              </div>
                              <span className={`font-mono uppercase font-black text-[8px] px-2.5 py-1 rounded-full border border-black shrink-0 ${v.vote === "approve" ? "bg-emerald-300" : "bg-rose-300"}`}>
                                {v.vote === "approve" ? "ĐỒNG Ý" : "BÁC BỎ"}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-rose-50/50 border-2 border-black rounded-2xl">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-mono font-black text-rose-700 uppercase bg-rose-100 px-2.5 py-0.5 rounded-full">Chi ngay</span>
                            <TrendingDown className="w-4 h-4 text-rose-600" />
                          </div>
                          <p className="text-xs font-bold text-slate-650 leading-relaxed">{evaluation.future_simulation.scenario_a}</p>
                        </div>
                        <div className="p-4 bg-emerald-50/50 border-2 border-black rounded-2xl">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-mono font-black text-emerald-700 uppercase bg-emerald-100 px-2.5 py-0.5 rounded-full">Hoãn, tích lũy</span>
                            <TrendingUp className="w-4 h-4 text-emerald-600" />
                          </div>
                          <p className="text-xs font-bold text-slate-650 leading-relaxed">{evaluation.future_simulation.scenario_b}</p>
                        </div>
                      </div>

                      {evaluation.goal_impacts.length > 0 && (
                        <div className="p-4 bg-white border-2 border-black rounded-2xl flex flex-col gap-2.5">
                          {evaluation.goal_impacts.map((g, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs border-b border-dashed pb-2 mb-2 last:border-0 last:pb-0 last:mb-0">
                              <span className="font-bold text-slate-900">{g.goal}</span>
                              <span className="font-mono text-gray-500">
                                {g.current_progress}%
                                {g.impact === "negative" && <span className="ml-2 text-rose-600 font-extrabold">→ {g.new_progress}% ⚠️</span>}
                                {g.impact === "positive" && <span className="ml-2 text-emerald-600 font-extrabold">→ {g.new_progress}% 🚀</span>}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {phase === "resolution" && (
        <div className="p-6 bg-white border-4 border-black rounded-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black mt-8">
          <h4 className="text-lg font-black text-black uppercase tracking-tight mb-4">Bạn quyết định gì?</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => onUserSubmitDecision("obeyed")}
              className="p-5 rounded-3xl border-4 border-black bg-emerald-100 hover:bg-emerald-200 text-black transition text-left cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:scale-95 flex flex-col justify-between"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-400 border-2 border-black flex items-center justify-center"><Check className="w-5 h-5" /></div>
                <span className="font-black text-[11px] uppercase">Tuân thủ</span>
              </div>
              <span className="text-[10px] bg-white text-black border-2 border-black px-3 py-1 rounded-full font-mono font-black inline-block mt-2 uppercase">+{evaluation.obey_reward} điểm kỷ luật</span>
            </button>

            <button
              onClick={() => onUserSubmitDecision("defied")}
              className="p-5 rounded-3xl border-4 border-black bg-rose-100 hover:bg-rose-200 text-black transition text-left cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:scale-95 flex flex-col justify-between"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-rose-400 border-2 border-black flex items-center justify-center"><ShieldAlert className="w-5 h-5" /></div>
                <span className="font-black text-[11px] uppercase">Bất chấp</span>
              </div>
              <span className="text-[10px] bg-white text-black border-2 border-black px-3 py-1 rounded-full font-mono font-black inline-block mt-2 uppercase">{evaluation.defy_penalty} điểm kỷ luật</span>
            </button>
          </div>

          <div className="mt-6 pt-4 border-t-2 border-dashed border-black flex items-center justify-between">
            <button
              onClick={() => setShowVerdictCard(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-yellow-300 hover:bg-yellow-400 border-2 border-black rounded-xl font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" /> Chia sẻ
            </button>
            <button onClick={onReset} className="text-gray-800 hover:text-black font-black uppercase underline flex items-center gap-1 cursor-pointer text-xs">
              <RefreshCw className="w-3.5 h-3.5" /> <span>Xem xét hồ sơ khác</span>
            </button>
          </div>
        </div>
      )}

      {showVerdictCard && (
        <VerdictCard
          proposalName={proposalName}
          amount={amount}
          debate={debate}
          displayName={displayName}
          onClose={() => setShowVerdictCard(false)}
        />
      )}
    </div>
  );
}
