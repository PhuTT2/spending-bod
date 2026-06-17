import React from "react";
import BoardRoom from "./BoardRoom";
import { DebateResponse, UserAction } from "../types";
import { AlertCircle } from "lucide-react";

interface BoardRoomTabProps {
  proposalName: string | null;
  amount: number | null;
  activeDebate: DebateResponse | null;
  displayName: string;
  onUserSubmitDecision: (action: UserAction) => void;
  onReset: () => void;
  onNavigateToNewProposal: () => void;
}

export default function BoardRoomTab({ proposalName, amount, activeDebate, displayName, onUserSubmitDecision, onReset, onNavigateToNewProposal }: BoardRoomTabProps) {
  if (activeDebate && proposalName && amount !== null) {
    return (
      <div className="animate-fade-in">
        <BoardRoom proposalName={proposalName} amount={amount} debate={activeDebate} displayName={displayName} onUserSubmitDecision={onUserSubmitDecision} onReset={onReset} />
      </div>
    );
  }

  return (
    <div className="bg-white border-4 border-black rounded-3xl p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center text-black flex flex-col items-center justify-center min-h-[350px]">
      <div className="w-16 h-16 bg-amber-100 border-2 border-black rounded-full text-amber-500 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h3 className="font-black text-lg uppercase">Chưa có phiên họp nào</h3>
      <button
        onClick={onNavigateToNewProposal}
        className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-yellow-300 text-white hover:text-black border-2 border-black font-black uppercase text-xs rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all cursor-pointer"
      >
        📝 Đệ trình đề xuất
      </button>
    </div>
  );
}
