import React from "react";
import NewProposalForm from "./NewProposalForm";

interface NewProposalTabProps {
  onSubmit: (proposal: {
    proposalName: string;
    amount: number;
    context: string;
    timing?: string;
    intent?: string;
  }) => void;
  isLoading: boolean;
}

export default function NewProposalTab({
  onSubmit,
  isLoading,
}: NewProposalTabProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-slate-900 border-4 border-black rounded-3xl p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] text-white text-center">
        <span className="text-3xl">📝</span>
        <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight mt-2 text-yellow-300">
          Tôi Nuốn Làm Gì?
        </h2>
        <p className="text-xs text-indigo-200 mt-1 max-w-sm mx-auto leading-relaxed">
          Khai báo thương vụ dự định chi dùng. Hội đồng sẽ xem xét cơ sở thặng dư, tính lãi suất kép, và biểu quyết xem thương vụ của bạn có đáng tin cậy.
        </p>
      </div>

      <NewProposalForm onSubmit={onSubmit} isLoading={isLoading} />
    </div>
  );
}
