import React from "react";
import { FinancialProfile, ProfileComputed } from "../types";
import { TrendingUp, ArrowRight, PlusCircle } from "lucide-react";

interface DashboardTabProps {
  profile: FinancialProfile;
  computed: ProfileComputed;
  onNavigateToNewProposal: () => void;
  onNavigateToGoals: () => void;
}

const vnd = (n: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

export default function DashboardTab({ profile, computed, onNavigateToNewProposal, onNavigateToGoals }: DashboardTabProps) {
  const disciplineLabel =
    profile.discipline_score >= 90 ? "Kỷ Luật Thép 👑" :
    profile.discipline_score >= 70 ? "Uy Tín 👍" :
    profile.discipline_score >= 40 ? "Nuông Chiều 🍩" : "Cần Cải Thiện 💔";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white border-4 border-black rounded-3xl p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-black relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 via-indigo-500 to-pink-500" />

        <h2 className="text-2xl font-black uppercase text-black tracking-tighter">Tổng quan</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-slate-50 border-2 border-black rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center bg-white rounded-full border-4 border-black">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="40" className="stroke-slate-100 fill-none" strokeWidth="8" />
                <circle
                  cx="48" cy="48" r="40"
                  className={`fill-none transition-all duration-1000 ${computed.health_score >= 85 ? "stroke-indigo-600" : computed.health_score >= 70 ? "stroke-emerald-500" : computed.health_score >= 50 ? "stroke-amber-500" : "stroke-rose-500"}`}
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - computed.health_score / 100)}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black font-mono">{computed.health_score}</span>
              </div>
            </div>
            <div className="text-center sm:text-left space-y-1.5 flex-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Sức khỏe tài chính</span>
              <span className="text-xs font-black uppercase px-2.5 py-1 rounded-full border bg-indigo-50 inline-block">{computed.health_label}</span>
              <p className="text-xs font-bold text-slate-700 leading-relaxed pt-1.5">{computed.health_description}</p>
            </div>
          </div>

          <div className="bg-slate-50 border-2 border-black rounded-2xl p-5 flex flex-col justify-between shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Điểm kỷ luật</span>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded border border-black">{disciplineLabel}</span>
              </div>
              <span className="text-3xl font-black font-mono leading-none">{profile.discipline_score}%</span>
            </div>
            <div className="w-full h-3 bg-slate-200 border-2 border-black rounded-full overflow-hidden mt-4">
              <div className={`h-full ${profile.discipline_score >= 70 ? "bg-emerald-400" : profile.discipline_score >= 40 ? "bg-amber-400" : "bg-rose-400"}`} style={{ width: `${profile.discipline_score}%` }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 bg-emerald-50 border-2 border-black rounded-2xl flex items-center justify-between">
            <div><span className="text-[9px] font-black text-slate-400 uppercase block">Thu nhập/tháng</span><span className="font-black text-lg text-emerald-700 font-mono">+{vnd(profile.monthly_income)}</span></div>
            <span className="text-2xl">💰</span>
          </div>
          <div className="p-4 bg-rose-50 border-2 border-black rounded-2xl flex items-center justify-between">
            <div><span className="text-[9px] font-black text-slate-400 uppercase block">Tiết kiệm</span><span className="font-black text-lg text-rose-600 font-mono">{vnd(profile.cash_balance)}</span></div>
            <span className="text-2xl">🏦</span>
          </div>
          <div className="p-4 bg-teal-50 border-2 border-black rounded-2xl flex items-center justify-between">
            <div><span className="text-[9px] font-black text-slate-400 uppercase block">Đầu tư</span><span className="font-black text-lg text-teal-700 font-mono">{vnd(profile.investments_balance)}</span></div>
            <span className="text-2xl">📈</span>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden bg-indigo-600 border-4 border-black rounded-3xl p-6 md:p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,15)] text-white">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none"><TrendingUp className="w-48 h-48" /></div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Có khoản chi mới?</h3>
            <p className="text-sm font-semibold text-indigo-100 max-w-xl mt-1">Trình lên HĐQT để được chấm điểm trước khi quẹt thẻ.</p>
          </div>
          <button onClick={onNavigateToNewProposal} className="w-full md:w-auto px-8 py-5 bg-yellow-300 hover:bg-white text-black font-black uppercase text-sm rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 transition-all cursor-pointer flex items-center justify-center gap-2">
            <PlusCircle className="w-5 h-5" /><span>Đề xuất mới</span>
          </button>
        </div>
      </div>

      <div className="bg-white border-4 border-black rounded-3xl p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-black">
        <div className="flex items-center justify-between pb-4 border-b-2 border-black mb-6">
          <h3 className="font-black text-lg uppercase tracking-tight">🎯 Mục tiêu</h3>
          <button onClick={onNavigateToGoals} className="text-xs font-black text-indigo-600 hover:underline inline-flex items-center gap-1 cursor-pointer">
            <span>Quản lý</span><ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {profile.active_goals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {profile.active_goals.slice(0, 2).map((g, idx) => {
              const percent = Math.min(100, Math.round((g.current_amount / g.target_amount) * 100)) || 0;
              return (
                <div key={idx} className="p-4 bg-slate-50 border-2 border-black rounded-2xl">
                  <div className="flex justify-between items-start gap-1 pb-2 border-b border-dashed mb-3">
                    <span className="font-extrabold text-sm text-black truncate pr-4">{g.title}</span>
                    <span className="font-mono text-indigo-700 text-sm font-black shrink-0">{percent}%</span>
                  </div>
                  <div className="w-full h-3 bg-white border-2 border-black rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-slate-50 border-2 border-dashed border-gray-300 rounded-2xl">
            <span className="text-3xl">📭</span>
            <h4 className="font-bold text-xs uppercase text-gray-500 mt-2">Chưa có mục tiêu nào</h4>
            <button onClick={onNavigateToGoals} className="mt-3 px-4 py-1.5 bg-indigo-600 text-white font-black text-[10px] uppercase border-2 border-black rounded-lg cursor-pointer">Tạo mục tiêu</button>
          </div>
        )}
      </div>
    </div>
  );
}
