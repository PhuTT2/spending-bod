import React, { useState } from "react";
import { DecisionRecord, BOARD_MEMBERS } from "../types";
import { Clock, Search, ChevronDown, ChevronUp } from "lucide-react";

interface HistoryTabProps {
  history: DecisionRecord[];
  onClearHistory: () => void;
}

const ACTION_LABELS: Record<string, string> = {
  save_more: "Tích lũy thêm 🐷",
  delay_purchase: "Trì hoãn ⏱️",
  use_bnpl: "Trả sau 💳",
  switch_cheaper_option: "Phương án rẻ hơn 🏷️",
  increase_emergency_fund: "Bù quỹ khẩn cấp 🚨",
  allocate_to_investment: "Đầu tư thêm 📈",
  travel_fund_contribution: "Quỹ du lịch ✈️",
  purchase: "Mua ngay 🛒",
};

export default function HistoryTab({ history, onClearHistory }: HistoryTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const totalCount = history.length;
  const obedienceCount = history.filter((h) => h.user_action === "obeyed").length;

  const filtered = history.filter((h) => h.proposal_name.toLowerCase().includes(searchTerm.toLowerCase()));
  const formatVND = (n: number) => new Intl.NumberFormat("vi-VN").format(n);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-slate-900 border-4 border-black rounded-3xl p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] text-white text-center">
        <span className="text-3xl block">📖</span>
        <h2 className="text-xl font-black uppercase tracking-tight mt-2 text-indigo-400">Lịch sử quyết định</h2>
      </div>

      {totalCount > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-black">
          <div className="p-4 bg-white border-2 border-black rounded-2xl text-center">
            <span className="text-xs font-black uppercase text-gray-500 block">Tổng số</span>
            <span className="text-2xl font-black font-mono mt-1 text-slate-800">{totalCount}</span>
          </div>
          <div className="p-4 bg-emerald-50 border-2 border-black rounded-2xl text-center">
            <span className="text-xs font-black uppercase text-emerald-800 block">Tuân thủ</span>
            <span className="text-2xl font-black font-mono text-emerald-700 mt-1">{obedienceCount}</span>
          </div>
          <div className="p-4 bg-rose-50 border-2 border-black rounded-2xl text-center">
            <span className="text-xs font-black uppercase text-rose-800 block">Bất chấp</span>
            <span className="text-2xl font-black font-mono text-rose-600 mt-1">{totalCount - obedienceCount}</span>
          </div>
        </div>
      )}

      <div className="bg-white border-4 border-black rounded-3xl p-5 md:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black">
        <div className="flex items-center justify-between gap-4 pb-4 border-b-2 border-black mb-6">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm đề xuất..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8.5 pr-3 py-1.5 w-full bg-slate-50 border-2 border-black rounded-xl text-xs font-semibold outline-none focus:bg-white"
            />
          </div>
          {totalCount > 0 && (
            <button onClick={onClearHistory} className="px-3 py-2 text-xs font-black text-rose-600 hover:text-white bg-white hover:bg-rose-500 border-2 border-black rounded-xl transition cursor-pointer shrink-0">
              Xóa hết
            </button>
          )}
        </div>

        {totalCount === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl block">📚</span>
            <h4 className="font-black text-sm uppercase mt-4">Chưa có lịch sử nào</h4>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-10 font-bold">Không khớp từ khóa.</p>
        ) : (
          <div className="relative pl-6 border-l-4 border-dashed border-indigo-200 space-y-6">
            {filtered.map((h) => {
              const isExpanded = expandedId === h.id;
              const isObeyed = h.user_action === "obeyed";
              return (
                <div key={h.id} className="relative">
                  <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-black ${isObeyed ? "bg-emerald-500" : "bg-rose-500"}`} />
                  <div className="bg-white border-2 border-black rounded-2xl overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <div onClick={() => setExpandedId(isExpanded ? null : h.id)} className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50">
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-mono text-gray-400 font-bold flex items-center gap-1">
                          <Clock className="w-3" /> {new Date(h.timestamp).toLocaleDateString("vi-VN")}
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-900 truncate mt-0.5">
                          {h.proposal_name} — <span className="font-mono font-black text-indigo-700">{formatVND(h.amount)}đ</span>
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-xs font-mono font-black ${h.score_change >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                          {h.score_change >= 0 ? `+${h.score_change}` : h.score_change}
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t-2 border-dashed border-black p-5 space-y-4">
                        <div className="border-2 border-black rounded-2xl p-4 bg-white">
                          <div className="flex gap-2.5 items-start">
                            <span className="text-2xl">{h.approved ? "✅" : "❌"}</span>
                            <p className="text-[11px] font-bold text-slate-600 leading-relaxed">{h.summary}</p>
                          </div>
                        </div>

                        {h.votes.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {h.votes.slice(0, 4).map((v) => {
                              const member = BOARD_MEMBERS[v.member_id];
                              return (
                                <div key={v.member_id} className="bg-slate-50 border border-slate-300 p-3 rounded-xl text-[11px]">
                                  <span className="font-extrabold text-slate-800 flex items-center gap-1">{member?.emoji} {member?.name || v.member_id}</span>
                                  <p className="text-slate-550 italic font-medium mt-1">&ldquo;{v.reason}&rdquo;</p>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {h.action_plan.length > 0 && (
                          <div className="bg-amber-50 border-2 border-dashed border-black rounded-2xl p-4">
                            <span className="text-[9px] font-black uppercase block mb-2">💡 Việc nên làm</span>
                            {h.action_plan.map((step, idx) => (
                              <div key={idx} className="flex gap-2 items-start text-xs font-bold mb-1.5">
                                <span className="text-indigo-600 bg-white border border-black rounded-full w-4 h-4 flex items-center justify-center text-[10px] shrink-0">{idx + 1}</span>
                                <span>{ACTION_LABELS[step.action] || step.action} — {step.description}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
