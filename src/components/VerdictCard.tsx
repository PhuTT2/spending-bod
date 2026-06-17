import React, { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, X } from "lucide-react";
import { DebateResponse, VerdictCardResponse } from "../types";

interface VerdictCardProps {
  proposalName: string;
  amount: number;
  debate: DebateResponse;
  displayName: string;
  onClose: () => void;
}

const DECISION_CONFIG = {
  approve: { label: "CHẤP THUẬN", emoji: "✅", bg: "from-emerald-400 to-teal-500", badge: "bg-emerald-500" },
  approve_with_conditions: { label: "CÓ ĐIỀU KIỆN", emoji: "✅", bg: "from-amber-400 to-yellow-500", badge: "bg-amber-500" },
  delay: { label: "TẠM HOÃN", emoji: "⏳", bg: "from-amber-400 to-orange-500", badge: "bg-amber-500" },
  reject: { label: "BÁC BỎ", emoji: "❌", bg: "from-rose-500 to-red-600", badge: "bg-rose-600" },
};

async function fetchVerdictImage(payload: object): Promise<string> {
  const res = await fetch("/api/verdict-card", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Không thể tạo ảnh");
  const data: VerdictCardResponse = await res.json();
  return `data:image/png;base64,${data.image_b64}`;
}

export default function VerdictCard({ proposalName, amount, debate, displayName, onClose }: VerdictCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [isLoadingBg, setIsLoadingBg] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [bgError, setBgError] = useState(false);

  const { narration, evaluation } = debate;
  const config = DECISION_CONFIG[evaluation.decision] ?? DECISION_CONFIG.reject;
  const formattedAmount = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  const approveCount = narration.votes.filter((v) => v.vote === "approve").length;
  const rejectCount = narration.votes.length - approveCount;
  const topQuote = narration.debate_steps[0]?.quote ?? narration.conclusion.summary;

  const handleGenerateBg = async () => {
    setIsLoadingBg(true);
    setBgError(false);
    try {
      const url = await fetchVerdictImage({
        proposal_name: proposalName,
        amount,
        decision: evaluation.decision,
        theme: narration.theme,
        key_quote: topQuote,
        display_name: displayName,
      });
      setBgImage(url);
    } catch {
      setBgError(true);
    } finally {
      setIsLoadingBg(false);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `hdqt-verdict-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-sm">
        <div className="flex justify-between items-center mb-3">
          <span className="text-white font-black text-sm uppercase">Phán Quyết HĐQT</span>
          <button onClick={onClose} className="text-white hover:text-yellow-300 cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* The card itself — this is what gets captured */}
        <div
          ref={cardRef}
          className="relative bg-white border-4 border-black rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          style={{ fontFamily: "system-ui, sans-serif" }}
        >
          {/* Background image or gradient header */}
          <div className={`relative h-40 bg-gradient-to-br ${config.bg} flex items-end p-4`}>
            {bgImage && (
              <img
                src={bgImage}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
            )}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 bg-black text-white px-3 py-1 rounded-full text-[9px] font-black uppercase mb-2">
                🕴️ HĐQT Tài Chính
              </div>
              <div className="flex items-center gap-2">
                <span className="text-3xl">{config.emoji}</span>
                <span className="text-white font-black text-2xl uppercase tracking-tight drop-shadow-lg">
                  {config.label}
                </span>
              </div>
            </div>
          </div>

          {/* Card body */}
          <div className="p-5 space-y-4">
            <div>
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Đề xuất</p>
              <p className="font-black text-base leading-tight mt-0.5">{proposalName}</p>
              <p className="font-mono font-black text-indigo-600 text-sm mt-0.5">{formattedAmount}</p>
            </div>

            <div className="bg-yellow-50 border-2 border-black rounded-2xl p-3.5">
              <p className="text-[9px] font-black uppercase text-slate-500 mb-1">Chủ Tịch kết luận</p>
              <p className="text-xs font-bold italic leading-relaxed">
                &ldquo;{narration.conclusion.summary}&rdquo;
              </p>
            </div>

            <div className="flex gap-3">
              <div className="flex-1 bg-emerald-50 border-2 border-black rounded-xl p-2.5 text-center">
                <p className="text-[9px] font-black uppercase text-emerald-700">Đồng ý</p>
                <p className="text-lg font-black text-emerald-600">{approveCount}</p>
              </div>
              <div className="flex-1 bg-rose-50 border-2 border-black rounded-xl p-2.5 text-center">
                <p className="text-[9px] font-black uppercase text-rose-700">Bác bỏ</p>
                <p className="text-lg font-black text-rose-600">{rejectCount}</p>
              </div>
              <div className="flex-1 bg-slate-50 border-2 border-black rounded-xl p-2.5 text-center">
                <p className="text-[9px] font-black uppercase text-slate-500">CEO</p>
                <p className="text-[11px] font-black truncate mt-0.5">{displayName}</p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t-2 border-dashed border-black pt-3">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                spending-bod.app
              </span>
              <div className={`px-2 py-0.5 ${config.badge} text-white text-[9px] font-black uppercase rounded-full`}>
                {evaluation.decision}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleGenerateBg}
            disabled={isLoadingBg || !!bgImage}
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white border-2 border-black rounded-xl font-black text-xs uppercase cursor-pointer disabled:cursor-not-allowed transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            {isLoadingBg ? "Đang tạo..." : bgImage ? "✓ Đã có ảnh AI" : "✨ Tạo ảnh AI"}
          </button>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-black hover:bg-gray-800 disabled:bg-slate-400 text-white border-2 border-black rounded-xl font-black text-xs uppercase cursor-pointer disabled:cursor-not-allowed transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <Download className="w-4 h-4" />
            {isDownloading ? "Đang lưu..." : "Tải ảnh"}
          </button>
        </div>

        {bgError && (
          <p className="text-center text-rose-300 text-xs font-bold mt-2">
            Không tạo được ảnh AI. Bạn vẫn có thể tải card này.
          </p>
        )}
      </div>
    </div>
  );
}
