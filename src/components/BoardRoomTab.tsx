import React from "react";
import BoardRoom from "./BoardRoom";
import { DebateResult } from "../types";
import { Scale, AlertCircle } from "lucide-react";

interface BoardRoomTabProps {
  proposalName: string | null;
  amount: number | null;
  activeDebate: DebateResult | null;
  onUserSubmitDecision: (action: "obeyed" | "defied") => void;
  onReset: () => void;
  onNavigateToNewProposal: () => void;
}

export default function BoardRoomTab({
  proposalName,
  amount,
  activeDebate,
  onUserSubmitDecision,
  onReset,
  onNavigateToNewProposal,
}: BoardRoomTabProps) {
  if (activeDebate && proposalName && amount !== null && amount !== undefined) {
    return (
      <div className="animate-fade-in">
        <BoardRoom
          proposalName={proposalName}
          amount={amount}
          debateResult={activeDebate}
          onUserSubmitDecision={onUserSubmitDecision}
          onReset={onReset}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-slate-900 border-4 border-black rounded-3xl p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] text-white text-center">
        <span className="text-3xl">⚖️</span>
        <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight mt-2 text-indigo-400">
          HĐQT Quyết Định Gì?
        </h2>
        <p className="text-xs text-indigo-200 mt-1 max-w-sm mx-auto leading-relaxed">
          Nơi hiển thị chi tiết các cuộc tranh cãi sôi nổi, kết quả bỏ phiếu trung thực và nghị quyết phán quyết từ ban giám đốc.
        </p>
      </div>

      <div className="bg-white border-4 border-black rounded-3xl p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center text-black flex flex-col items-center justify-center min-h-[350px]">
        <div className="w-16 h-16 bg-amber-100 border-2 border-black rounded-full text-amber-500 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="font-black text-lg uppercase">Phòng Họp Hiện Đang Trống</h3>
        <p className="text-xs text-gray-500 font-bold max-w-sm mt-2 leading-relaxed">
          Chưa có thương vụ nào được đệ trình lên Hội đồng thẩm định ngay lúc này. Hãy soạn thảo một tờ trình chi dùng mới để lập tức triệu tập cuộc thảo luận khẩn cấp!
        </p>
        <button
          onClick={onNavigateToNewProposal}
          className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-yellow-300 text-white hover:text-black border-2 border-black font-black uppercase text-xs rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all cursor-pointer"
        >
          📝 Đệ trình đề xuất mới
        </button>
      </div>
    </div>
  );
}
