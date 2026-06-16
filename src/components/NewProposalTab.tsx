import React from "react";
import NewProposalForm from "./NewProposalForm";

interface NewProposalTabProps {
  onSubmit: (proposal: { proposal_name: string; amount: number; context: string; intent_hint?: string }) => void;
  isLoading: boolean;
}

export default function NewProposalTab({ onSubmit, isLoading }: NewProposalTabProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-slate-900 border-4 border-black rounded-3xl p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] text-white text-center">
        <span className="text-3xl">📝</span>
        <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight mt-2 text-yellow-300">Đề xuất chi tiêu</h2>
        <p className="text-xs text-indigo-200 mt-1">HĐQT sẽ chấm điểm và bỏ phiếu ngay khi bạn gửi.</p>
      </div>
      <NewProposalForm onSubmit={onSubmit} isLoading={isLoading} />
    </div>
  );
}
