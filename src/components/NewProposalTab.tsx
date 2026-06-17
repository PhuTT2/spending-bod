import React, { useState } from "react";
import NewProposalForm from "./NewProposalForm";
import { FollowupResponse, FollowupQuestion } from "../types";
import { ArrowRight, Sparkles } from "lucide-react";

type Phase = "form" | "ai-loading" | "ai-questions";

interface Answer {
  questionIndex: number;
  value: string;
}

interface ProposalDraft {
  proposal_name: string;
  amount: number;
  context: string;
  intent_hint?: string;
}

interface NewProposalTabProps {
  onSubmit: (proposal: ProposalDraft) => void;
  isLoading: boolean;
  prefill?: Partial<ProposalDraft> | null;
  displayName: string;
  onSubmitProposal: (proposal: { proposal_name: string; amount: number; context: string }) => void;
}

export default function NewProposalTab({ onSubmit, isLoading, prefill, displayName }: NewProposalTabProps) {
  const [phase, setPhase] = useState<Phase>("form");
  const [draft, setDraft] = useState<ProposalDraft | null>(null);
  const [followupData, setFollowupData] = useState<FollowupResponse | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleFormSubmit = async (proposal: ProposalDraft) => {
    setDraft(proposal);
    setAnswers([]);
    setAiError(null);
    setPhase("ai-loading");

    const question = `Tôi muốn ${proposal.proposal_name} với số tiền ${new Intl.NumberFormat("vi-VN").format(proposal.amount)} VND${proposal.context ? ". " + proposal.context : ""}`;

    try {
      const res = await fetch("/api/chat/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, display_name: displayName }),
      });
      if (!res.ok) throw new Error("Lỗi kết nối AI");
      const data: FollowupResponse = await res.json();
      setFollowupData(data);
      setPhase("ai-questions");
    } catch (e: any) {
      setAiError(e.message || "Không thể kết nối AI");
      setPhase("form");
    }
  };

  const setAnswer = (qi: number, value: string) => {
    setAnswers((prev) => {
      const idx = prev.findIndex((a) => a.questionIndex === qi);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { questionIndex: qi, value };
        return next;
      }
      return [...prev, { questionIndex: qi, value }];
    });
  };

  const getAnswer = (qi: number) => answers.find((a) => a.questionIndex === qi)?.value ?? "";

  const handleSubmitToBoard = () => {
    if (!draft || !followupData) return;
    const aiContext = followupData.follow_up_questions
      .map((q, i) => { const a = getAnswer(i); return a ? `${q.question}: ${a}` : ""; })
      .filter(Boolean)
      .join(". ");
    const fullContext = [draft.context, aiContext].filter(Boolean).join(". ");
    onSubmit({ ...draft, context: fullContext });
  };

  const handleSkipAi = () => {
    if (!draft) return;
    onSubmit(draft);
  };

  return (
    <div className="space-y-6">
      {/* Phase 1: form */}
      {phase === "form" && (
        <>
          <div className="bg-slate-900 border-4 border-black rounded-3xl p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] text-white text-center">
            <span className="text-3xl">📝</span>
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight mt-2 text-yellow-300">Đề xuất chi tiêu</h2>
            <p className="text-xs text-indigo-200 mt-1">AI sẽ hỏi thêm về tình hình tài chính trước khi trình lên Hội đồng quản trị.</p>
          </div>

          {aiError && (
            <div className="bg-rose-50 border-2 border-rose-500 rounded-xl p-3 text-xs font-bold text-rose-700">⚠️ {aiError}</div>
          )}

          <NewProposalForm
            onSubmit={handleFormSubmit}
            isLoading={isLoading}
            prefill={prefill}
            submitLabel="Tư vấn AI trước khi trình →"
          />
        </>
      )}

      {/* Phase 2: AI loading */}
      {phase === "ai-loading" && (
        <div className="bg-white border-4 border-black rounded-3xl p-10 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center text-center gap-4 min-h-[300px] justify-center">
          <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="font-black uppercase text-sm text-slate-600 tracking-widest">AI đang phân tích đề xuất...</p>
          {draft && (
            <p className="text-xs font-bold text-slate-400">{draft.proposal_name} — {new Intl.NumberFormat("vi-VN").format(draft.amount)} ₫</p>
          )}
        </div>
      )}

      {/* Phase 3: AI questions */}
      {phase === "ai-questions" && followupData && draft && (
        <div className="space-y-5">
          {/* Proposal summary bar */}
          <div className="bg-slate-900 border-4 border-black rounded-2xl p-5 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Đề xuất của bạn</p>
            <p className="font-black text-lg text-yellow-300 leading-tight">{draft.proposal_name}</p>
            <p className="font-mono font-black text-emerald-400 text-sm mt-0.5">{new Intl.NumberFormat("vi-VN").format(draft.amount)} ₫</p>
          </div>

          {/* AI follow-up panel */}
          <div className="bg-white border-4 border-black rounded-3xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b-2 border-black">
              <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
              <div>
                <h3 className="font-black uppercase text-sm text-indigo-600 leading-none">Tư vấn AI</h3>
                <p className="text-[10px] text-slate-500 font-bold mt-0.5">Trả lời để Hội đồng quản trị có đủ bối cảnh khi phán xét</p>
              </div>
            </div>

            <div className="space-y-6">
              {followupData.follow_up_questions.map((fq: FollowupQuestion, i: number) => (
                <div key={i} className="space-y-2">
                  <p className="text-sm font-black">{fq.question}</p>
                  {fq.options.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {fq.options.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setAnswer(i, opt)}
                          className={`px-3 py-1.5 border-2 border-black rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            getAnswer(i) === opt
                              ? "bg-indigo-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                              : "bg-slate-50 hover:bg-yellow-100"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={getAnswer(i)}
                      onChange={(e) => setAnswer(i, e.target.value)}
                      placeholder="Nhập câu trả lời..."
                      className="w-full px-3 py-2 bg-slate-50 border-2 border-black rounded-xl font-bold text-sm outline-none"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t-2 border-dashed border-slate-200">
              <button
                type="button"
                onClick={() => { setPhase("form"); setFollowupData(null); setAnswers([]); }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border-2 border-black rounded-xl font-bold text-xs uppercase cursor-pointer shrink-0"
              >
                ← Sửa
              </button>
              <button
                type="button"
                onClick={handleSkipAi}
                disabled={isLoading}
                className="px-4 py-2.5 bg-slate-50 hover:bg-yellow-50 border-2 border-black rounded-xl font-bold text-xs uppercase cursor-pointer shrink-0 disabled:opacity-50"
              >
                Bỏ qua
              </button>
              <button
                type="button"
                onClick={handleSubmitToBoard}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-yellow-300 disabled:bg-slate-200 text-white hover:text-black disabled:text-slate-400 border-2 border-black rounded-2xl font-black text-sm uppercase transition-all cursor-pointer disabled:cursor-not-allowed shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
              >
                ⚖️ Trình lên Hội đồng quản trị <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
