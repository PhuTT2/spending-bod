import React from "react";
import { UserFinancialState, BOARD_MEMBERS } from "../types";
import { 
  TrendingUp, 
  Award, 
  Wallet as WalletIcon, 
  ArrowRight, 
  PlusCircle, 
  Info,
  Compass,
  CheckCircle2,
  LineChart
} from "lucide-react";

interface DashboardTabProps {
  userState: UserFinancialState;
  onNavigateToNewProposal: () => void;
  onNavigateToGoals: () => void;
}

export default function DashboardTab({
  userState,
  onNavigateToNewProposal,
  onNavigateToGoals,
}: DashboardTabProps) {
  // Helper to render score description & level
  const getDisciplineLevel = (score: number) => {
    if (score >= 90) return { label: "Kỷ Luật Thép 👑", css: "text-emerald-700 bg-emerald-100 border-emerald-300", roast: "HĐQT cúi đầu thán phục." };
    if (score >= 70) return { label: "Tương Đối Uy Tín 👍", css: "text-blue-700 bg-blue-100 border-blue-300", roast: "Chưa bị gõ búa nhiều lắm." };
    if (score >= 40) return { label: "Nuông Chiều Bản Thân 🍩", css: "text-amber-700 bg-amber-100 border-amber-300", roast: "Chuẩn bị thắt lưng buộc bụng." };
    return { label: "TOXIC LEVEL 💔", css: "text-rose-600 bg-rose-100 border-rose-300", roast: "Hán tử phá hoại tài chính quốc gia!" };
  };

  const levelInfo = getDisciplineLevel(userState.disciplineScore);

  // Calculate health score and stats
  const totalCount = userState.history.length;
  const obedienceCount = userState.history.filter((h) => h.userAction === "obeyed").length;
  const complianceRate = totalCount > 0 ? Math.round((obedienceCount / totalCount) * 100) : 100;

  const savingsRatio = userState.savings / (userState.income || 1);
  const savingsSub = Math.min(45, (savingsRatio / 3) * 45);
  const disciplineSub = userState.disciplineScore * 0.4;
  const complianceSub = complianceRate * 0.15;
  const holdingsBonus = (userState.financialProfile?.product_holdings?.securities?.has ? 3 : 0) + 
                        (userState.financialProfile?.product_holdings?.savings?.has ? 2 : 0);
  const healthScore = Math.min(100, Math.round(savingsSub + disciplineSub + complianceSub + holdingsBonus));

  let healthLabel = "An Toàn Bền Vững 🛡️";
  let healthDesc = "Tỷ lệ tích lũy tốt, các hoạt động bám sát kế hoạch.";
  let healthCss = "text-emerald-700 bg-emerald-50 border-emerald-400";
  
  if (healthScore >= 85) {
    healthLabel = "Thịnh Vượng Tối Ưu 👑";
    healthDesc = "Sức mạnh tài chính tuyệt hảo! HĐQT đứng dậy cúi đầu tự hào.";
    healthCss = "text-indigo-700 bg-indigo-50 border-indigo-400";
  } else if (healthScore < 70 && healthScore >= 50) {
    healthLabel = "Rủi Ro Nhẹ (Cảnh Báo) ⚠️";
    healthDesc = "Dòng tiền có dấu hiệu hụt hơi. Đề xuất thắt chặt chi tiêu ngẫu hứng.";
    healthCss = "text-amber-700 bg-amber-50 border-amber-300";
  } else if (healthScore < 50) {
    healthLabel = "Khủng Hoảng Báo Động 🚨";
    healthDesc = "Ví tiền trống trải, HĐQT phát hoảng. Cần cấp cứu ngân sách ngay!";
    healthCss = "text-rose-700 bg-rose-50 border-rose-300";
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. FINANCIAL HEALTH OVERVIEW */}
      <div className="bg-white border-4 border-black rounded-3xl p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-black relative overflow-hidden" id="financial-overview-card">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 via-indigo-500 to-pink-500" />
        
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 pb-6 border-b-2 border-dashed border-slate-300">
          <div>
            <span className="text-[10px] font-mono font-black text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full inline-block uppercase tracking-widest">
              📊 Tổng Quan Sức Khỏe Tài Chính
            </span>
            <h2 className="text-2xl md:text-3xl font-black uppercase text-black tracking-tighter mt-2">
              Báo Cáo Sức Khỏe Tài Bản
            </h2>
            <p className="text-xs text-gray-500 font-bold mt-1">
              Hệ thống phán đoán chuẩn xác tình trạng ngân quỹ trong 3 giây.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs font-black font-mono text-gray-500 uppercase">Tâm lý HĐQT:</span>
            <span className="text-xs font-extrabold bg-indigo-50 border-2 border-black px-2.5 py-1 rounded-xl shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
              {userState.disciplineScore >= 80 ? "🥰 Cực Kỳ Tự Hào" : userState.disciplineScore >= 45 ? "🧐 Đang Quan Sát" : "😡 Rất Phẫn Nộ"}
            </span>
          </div>
        </div>

        {/* Big Score Gauges */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Health Score Circular Indicator */}
          <div className="bg-slate-50 border-2 border-black rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center bg-white rounded-full border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="40" className="stroke-slate-100 fill-none" strokeWidth="8" />
                <circle 
                  cx="48" 
                  cy="48" 
                  r="40" 
                  className={`fill-none transition-all duration-1000 ${
                    healthScore >= 85 ? "stroke-indigo-600" : healthScore >= 70 ? "stroke-emerald-500" : healthScore >= 50 ? "stroke-amber-500" : "stroke-rose-500"
                  }`} 
                  strokeWidth="8" 
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - healthScore / 100)}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black font-mono">{healthScore}</span>
                <span className="text-[9px] font-black text-gray-400 tracking-wider">H-SCORE</span>
              </div>
            </div>

            <div className="text-center sm:text-left space-y-1.5 flex-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono block">Chỉ số sức khỏe tài chính</span>
              <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-full border shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)] inline-block ${healthCss}`}>
                {healthLabel}
              </span>
              <p className="text-xs font-bold text-slate-650 leading-relaxed pt-1.5 text-slate-700">
                {healthDesc}
              </p>
            </div>
          </div>

          {/* Discipline Score Bar Indicator */}
          <div className="bg-slate-50 border-2 border-black rounded-2xl p-5 flex flex-col justify-between shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Điểm số kỷ luật thép</span>
                <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded border border-black ${levelInfo.css}`}>
                  {levelInfo.label}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black font-mono leading-none">{userState.disciplineScore}%</span>
                <span className="text-[9px] font-black text-slate-500 font-mono">ĐIỂM KỶ LUẬT CEO</span>
              </div>
              <p className="text-xs font-bold text-slate-800 italic mt-2.5 bg-yellow-50 px-3 py-1.5 border border-dashed border-yellow-300 rounded-xl leading-relaxed">
                HĐQT: &ldquo;{levelInfo.roast}&rdquo;
              </p>
            </div>

            <div className="w-full mt-4">
              <div className="w-full h-3 bg-slate-200 border-2 border-black rounded-full overflow-hidden shadow-inner">
                <div 
                  className={`h-full transition-all duration-700 ${
                    userState.disciplineScore >= 70 ? "bg-emerald-400" : userState.disciplineScore >= 40 ? "bg-amber-400" : "bg-rose-400"
                  }`} 
                  style={{ width: `${userState.disciplineScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Core Wallet Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 bg-emerald-50 border-2 border-black rounded-2xl flex items-center justify-between shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-mono">Thu nhập đều đặn</span>
              <span className="font-black text-lg text-emerald-700 font-mono">
                +{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(userState.income)}
              </span>
            </div>
            <span className="text-2xl">💰</span>
          </div>

          <div className="p-4 bg-rose-50 border-2 border-black rounded-2xl flex items-center justify-between shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-mono">Quỹ dự trữ hiện hữu</span>
              <span className="font-black text-lg text-rose-600 font-mono">
                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(userState.savings)}
              </span>
            </div>
            <span className="text-2xl">🏦</span>
          </div>

          <div className="p-4 bg-teal-50 border-2 border-black rounded-2xl flex items-center justify-between shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-mono">Sổ tích sản / Chứng khoán</span>
              <span className="font-black text-lg text-teal-700 font-mono">
                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(userState.investments ?? 0)}
              </span>
            </div>
            <span className="text-2xl">📈</span>
          </div>
        </div>
      </div>

      {/* 2. PRIMARY CALL-TO-ACTION (CTA) - MUST BE MOST PROMINENT */}
      <div className="relative overflow-hidden bg-indigo-600 border-4 border-black rounded-3xl p-6 md:p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,15)] text-white">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <TrendingUp className="w-48 h-48" />
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="text-center md:text-left space-y-2">
            <span className="text-[10px] font-mono font-black text-yellow-300 tracking-widest uppercase bg-black/35 px-3 py-1 rounded-full inline-block border border-yellow-300/20">
              ⚡ Action Required (Hành Động Khẩn Cấp)
            </span>
            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
              Khai Hoả Trình Chu Kỳ Chi Tiêu Mới
            </h3>
            <p className="text-sm font-semibold text-indigo-100 max-w-xl">
              Bạn sắp có một khoản tiêu sắm lớn hay trải nghiệm chữa lành? Đệ trình tóm tắt ngữ cảnh lên HĐQT để nhận biểu quyết ranh ma, thấu tính thặng dư trước khi quyết định quẹt thẻ.
            </p>
          </div>
          
          <button
            onClick={onNavigateToNewProposal}
            className="w-full md:w-auto px-8 py-5.5 bg-yellow-305 bg-yellow-300 hover:bg-white text-black font-black uppercase text-sm md:text-base rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-5 h-5 shrink-0" />
            <span>Đệ trình đề xuất mới 📝</span>
          </button>
        </div>
      </div>

      {/* 3. GOAL PROGRESS PREVIEW */}
      <div className="bg-white border-4 border-black rounded-3xl p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-black">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-black mb-6 gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <div>
              <h3 className="font-black text-lg uppercase tracking-tight">Tiến Độ Mục Tiêu Lớn Nhất</h3>
              <p className="text-[10px] text-gray-505 text-gray-500 font-bold block">Xây dựng tương lai vững chắc thay vì chỉ chi ly giữ ví.</p>
            </div>
          </div>
          <button
            onClick={onNavigateToGoals}
            className="text-xs font-black text-indigo-600 hover:underline inline-flex items-center gap-1 cursor-pointer font-sans"
          >
            <span>Quản lý mục tiêu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {userState.financialProfile?.active_goals && userState.financialProfile.active_goals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {userState.financialProfile.active_goals.slice(0, 2).map((g, idx) => {
              const percent = Math.min(100, Math.round((g.current_amount / g.target_amount) * 100)) || 0;
              return (
                <div key={idx} className="p-4 bg-slate-50 border-2 border-black rounded-2xl flex flex-col justify-between shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <div>
                    <div className="flex justify-between items-start gap-1 pb-2 border-b border-dashed border-slate-205 mb-3">
                      <span className="font-extrabold text-sm text-black truncate pr-4">{g.title}</span>
                      <span className="font-mono text-indigo-700 text-sm font-black shrink-0">{percent}%</span>
                    </div>
                    
                    <div className="w-full h-3 bg-white border-2 border-black rounded-full overflow-hidden shadow-inner">
                      <div className="h-full bg-emerald-400 border-r border-black" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] font-mono font-bold text-gray-500 mt-4 pt-1 border-t border-slate-100">
                    <span>Đã lưu: {new Intl.NumberFormat("vi-VN").format(g.current_amount)}đ</span>
                    <span>Đích: {new Intl.NumberFormat("vi-VN").format(g.target_amount)}đ</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-slate-50 border-2 border-dashed border-gray-300 rounded-2xl">
            <span className="text-3xl">📭</span>
            <h4 className="font-bold text-xs uppercase text-gray-500 mt-2">Chưa thiết lập mục tiêu nào!</h4>
            <p className="text-[10px] text-gray-400 mt-1 max-w-xs mx-auto leading-normal">
              Bắt đầu lập các cột mốc tài chính quý như sắm điện thoại, tích quỹ dự phòng khẩn cấp tại tab Mục tiêu lớn.
            </p>
            <button
              onClick={onNavigateToGoals}
              className="mt-3 px-4 py-1.5 bg-indigo-600 text-white font-black text-[10px] uppercase border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-300 hover:text-black cursor-pointer"
            >
              Tạo mục tiêu đầu tiên 🎯
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
