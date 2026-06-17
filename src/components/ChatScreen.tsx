import React, { useRef, useState } from "react";
import { ArrowRight, Send, Sparkles } from "lucide-react";
import { AdviceResponse, FollowupQuestion, FollowupResponse } from "../types";

interface ChatScreenProps {
  displayName: string;
  onSubmitProposal: (proposal: { proposal_name: string; amount: number; context: string }) => void;
  initialPrompt?: string;
}

type ChatPhase = "idle" | "loading-followup" | "followup" | "loading-advice" | "advice";

interface Answer {
  questionIndex: number;
  value: string;
}

const EXAMPLE_PROMPTS = [
  "Tôi nên đầu tư gì với 10 triệu đồng hiện tại?",
  "Làm sao để tôi tiết kiệm hiệu quả hơn mỗi tháng?",
  "Tôi có nên mua bảo hiểm nhân thọ không?",
  "Kế hoạch tài chính nào phù hợp với mục tiêu của tôi?",
];

async function fetchJSON<T>(path: string, body: object): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || "Lỗi kết nối");
  }
  return res.json();
}

export default function ChatScreen({ displayName, onSubmitProposal, initialPrompt }: ChatScreenProps) {
  const [input, setInput] = useState(initialPrompt ?? "");
  const [phase, setPhase] = useState<ChatPhase>("idle");
  const [originalQuestion, setOriginalQuestion] = useState("");
  const [followupData, setFollowupData] = useState<FollowupResponse | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [adviceResult, setAdviceResult] = useState<AdviceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmitQuestion = async (q: string) => {
    const question = q.trim();
    if (!question) return;
    setOriginalQuestion(question);
    setInput("");
    setAnswers([]);
    setAdviceResult(null);
    setError(null);
    setPhase("loading-followup");
    try {
      const data = await fetchJSON<FollowupResponse>("/api/chat/followup", {
        question,
        display_name: displayName,
      });
      setFollowupData(data);
      setPhase("followup");
    } catch (e: any) {
      setError(e.message);
      setPhase("idle");
    }
  };

  const setAnswer = (questionIndex: number, value: string) => {
    setAnswers((prev) => {
      const existing = prev.findIndex((a) => a.questionIndex === questionIndex);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = { questionIndex, value };
        return next;
      }
      return [...prev, { questionIndex, value }];
    });
  };

  const getAnswer = (questionIndex: number) =>
    answers.find((a) => a.questionIndex === questionIndex)?.value ?? "";

  const handleGetAdvice = async () => {
    setPhase("loading-advice");
    setError(null);
    const answerTexts = followupData?.follow_up_questions.map((q, i) => {
      const ans = getAnswer(i);
      return ans ? `${q.question}: ${ans}` : "";
    }).filter(Boolean) ?? [];
    try {
      const data = await fetchJSON<AdviceResponse>("/api/chat/advice", {
        original_question: originalQuestion,
        answers: answerTexts,
        display_name: displayName,
      });
      setAdviceResult(data);
      setPhase("advice");
    } catch (e: any) {
      setError(e.message);
      setPhase("followup");
    }
  };

  const handleReset = () => {
    setPhase("idle");
    setOriginalQuestion("");
    setFollowupData(null);
    setAnswers([]);
    setAdviceResult(null);
    setError(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSendToBoard = () => {
    if (!adviceResult?.suggested_proposal_name) return;
    onSubmitProposal({
      proposal_name: adviceResult.suggested_proposal_name,
      amount: 0,
      context: `${originalQuestion}. ${answers.map((a) => a.value).join(". ")}`,
    });
  };

  return (
    <div className="bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      <div className="bg-indigo-600 p-5 border-b-4 border-black">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-300" />
          <h2 className="font-black text-white uppercase tracking-tight text-sm">Tư vấn AI</h2>
        </div>
        <p className="text-indigo-200 text-xs font-bold mt-1">Hỏi bất kỳ câu hỏi tài chính nào</p>
      </div>

      <div className="p-5 md:p-6 space-y-5">
        {error && (
          <div className="bg-rose-50 border-2 border-rose-500 rounded-xl p-3 text-xs font-bold text-rose-700">
            ⚠️ {error}
          </div>
        )}

        {phase === "idle" && (
          <>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Gợi ý câu hỏi</p>
              <div className="flex flex-col gap-2">
                {EXAMPLE_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => handleSubmitQuestion(p)}
                    className="px-4 py-2.5 bg-slate-50 hover:bg-yellow-100 border-2 border-black rounded-xl text-xs font-bold transition-all cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] text-left"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitQuestion(input);
                  }
                }}
                placeholder="Hỏi về tài chính của bạn..."
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-black rounded-2xl font-bold text-sm outline-none resize-none pr-14"
              />
              <button
                onClick={() => handleSubmitQuestion(input)}
                disabled={!input.trim()}
                className="absolute right-3 bottom-3 w-9 h-9 bg-indigo-600 hover:bg-yellow-300 disabled:bg-slate-200 text-white hover:text-black disabled:text-slate-400 border-2 border-black rounded-xl flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {phase === "loading-followup" && (
          <div className="flex flex-col items-center py-10 gap-3">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-black uppercase text-slate-500">AI đang phân tích câu hỏi...</p>
          </div>
        )}

        {(phase === "followup" || phase === "loading-advice") && followupData && (
          <div className="space-y-5">
            <div className="bg-slate-50 border-2 border-black rounded-2xl p-4">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Câu hỏi của bạn</p>
              <p className="text-sm font-black">{originalQuestion}</p>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                Cho Hội đồng quản trị biết thêm
              </p>
              {followupData.follow_up_questions.map((fq: FollowupQuestion, i: number) => (
                <div key={i} className="space-y-2">
                  <p className="text-sm font-black">{fq.question}</p>
                  {fq.options.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {fq.options.map((opt) => (
                        <button
                          key={opt}
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

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleReset}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border-2 border-black rounded-xl font-bold text-xs uppercase cursor-pointer"
              >
                Hỏi lại
              </button>
              <button
                onClick={handleGetAdvice}
                disabled={phase === "loading-advice"}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-indigo-600 hover:bg-yellow-300 disabled:bg-slate-200 text-white hover:text-black disabled:text-slate-400 border-2 border-black rounded-xl font-black text-xs uppercase transition-all cursor-pointer disabled:cursor-not-allowed shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                {phase === "loading-advice" ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Đang phân tích...
                  </>
                ) : (
                  <>Xem tư vấn <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>
        )}

        {phase === "advice" && adviceResult && (
          <div className="space-y-4">
            <div className="bg-slate-50 border-2 border-black rounded-2xl p-4">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Câu hỏi</p>
              <p className="text-xs font-bold text-slate-600">{originalQuestion}</p>
            </div>

            <div className="bg-yellow-50 border-4 border-black rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative">
              <div className="absolute -top-3.5 left-5 px-3 py-1 bg-black text-white text-[9px] font-black uppercase rounded-full border-2 border-black flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-yellow-300" /> Tư vấn AI
              </div>
              <p className="text-sm font-bold leading-relaxed pt-1">{adviceResult.answer}</p>
            </div>

            {adviceResult.is_spending_related && adviceResult.suggested_proposal_name && (
              <button
                onClick={handleSendToBoard}
                className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white border-2 border-black rounded-2xl font-black uppercase text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                ⚖️ Đệ trình "{adviceResult.suggested_proposal_name}" lên Hội đồng quản trị
              </button>
            )}

            <button
              onClick={handleReset}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 border-2 border-black rounded-xl font-bold text-xs uppercase cursor-pointer"
            >
              Hỏi câu khác
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
