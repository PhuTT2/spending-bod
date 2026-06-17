import React, { useState } from "react";
import { FinancialProfile } from "../types";
import { ArrowRight, Wallet } from "lucide-react";

interface OnboardingFlowProps {
  onComplete: (profile: FinancialProfile) => void;
}

const GOAL_OPTIONS = [
  { label: "Tiết kiệm dự phòng 🛡️", risk: "low" as const, targetMonths: 6 },
  { label: "Mua nhà / xe 🏠", risk: "medium" as const, targetMonths: 60 },
  { label: "Đi du lịch ✈️", risk: "medium" as const, targetMonths: 12 },
  { label: "Đầu tư dài hạn 📈", risk: "high" as const, targetMonths: 36 },
  { label: "Tự do tài chính 💎", risk: "high" as const, targetMonths: 120 },
];

const formatCurrency = (val: string) => {
  const num = parseInt(val.replace(/\D/g, ""), 10);
  return isNaN(num) ? "" : new Intl.NumberFormat("vi-VN").format(num);
};

const addMonths = (months: number): string => {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
};

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [displayName, setDisplayName] = useState("");
  const [income, setIncome] = useState("18000000");
  const [selectedGoal, setSelectedGoal] = useState<(typeof GOAL_OPTIONS)[number] | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const inc = Math.max(0, parseInt(income.replace(/\D/g, ""), 10) || 0);

  const handleFinish = () => {
    const errs: Record<string, string> = {};
    if (!displayName.trim()) errs.name = "Hội đồng quản trị cần biết tên bạn.";
    if (inc <= 0) errs.income = "Nhập thu nhập hàng tháng.";
    if (Object.keys(errs).length) return setErrors(errs);

    const activeGoals: FinancialProfile["active_goals"] = selectedGoal
      ? [
          {
            goal_id: `goal-${Date.now()}`,
            title: selectedGoal.label,
            target_amount: inc * selectedGoal.targetMonths,
            current_amount: 0,
            deadline: addMonths(selectedGoal.targetMonths),
          },
        ]
      : [];

    onComplete({
      user_id: displayName.trim().toLowerCase().replace(/\s+/g, "-"),
      display_name: displayName.trim(),
      monthly_income: inc,
      monthly_fixed_expenses: null,
      cash_balance: 0,
      investments_balance: 0,
      risk_tolerance: selectedGoal?.risk ?? "medium",
      lifestyle_preference: { travel: 3, shopping: 3, entertainment: 3, saving: 3, investing: 3, safety: 3 },
      product_holdings: {
        bnpl: { has: false, limit: 0, provider: null },
        savings: { has: false, balance: 0 },
        securities: { has: false, balance: 0 },
        life_insurance: { has: false, premium: 0 },
        non_life_insurance: { has: false, name: null },
      },
      active_goals: activeGoals,
      discipline_score: 80,
      created_at: "",
      updated_at: "",
    });
  };

  return (
    <div className="w-full max-w-md mx-auto my-8 px-4">
      <div className="bg-white border-4 border-black rounded-3xl p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-black relative">
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-teal-400 via-indigo-600 to-rose-400 rounded-t-xl" />

        <div className="mb-6 mt-2">
          <div className="w-12 h-12 bg-indigo-600 border-2 border-black rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            🕴️
          </div>
          <h1 className="text-xl font-black uppercase tracking-tight">Chào mừng đến Hội đồng quản trị</h1>
          <p className="text-sm font-bold text-slate-600 mt-1">Để bắt đầu, cho chúng tôi biết một chút về bạn.</p>
        </div>

        <div className="space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase">Bạn muốn được gọi là gì? *</label>
            <input
              type="text"
              placeholder="Ví dụ: Thiện, CEO Tuấn..."
              value={displayName}
              onChange={(e) => { setDisplayName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border-2 ${errors.name ? "border-rose-500" : "border-black"} rounded-xl font-bold text-sm outline-none`}
            />
            {errors.name && <p className="text-rose-600 text-[11px] font-bold">⚠️ {errors.name}</p>}
          </div>

          {/* Income */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-600" /> Thu nhập mỗi tháng *
            </label>
            <div className="relative">
              <input
                type="text"
                value={formatCurrency(income)}
                onChange={(e) => { setIncome(e.target.value); setErrors((p) => ({ ...p, income: "" })); }}
                className={`w-full px-4 py-2.5 bg-slate-50 border-2 ${errors.income ? "border-rose-500" : "border-black"} rounded-xl font-mono text-base font-black outline-none pr-10`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₫</span>
            </div>
            {errors.income && <p className="text-rose-600 text-xs font-bold">⚠️ {errors.income}</p>}
          </div>

          {/* Goal */}
          <div className="space-y-2">
            <span className="text-xs font-black uppercase block">Mục tiêu tài chính chính của bạn</span>
            <div className="grid grid-cols-1 gap-2">
              {GOAL_OPTIONS.map((g) => (
                <button
                  key={g.label}
                  type="button"
                  onClick={() => setSelectedGoal(selectedGoal?.label === g.label ? null : g)}
                  className={`py-2.5 px-4 border-2 border-black rounded-xl font-bold text-xs text-left cursor-pointer transition-all ${
                    selectedGoal?.label === g.label
                      ? "bg-indigo-600 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                      : "bg-slate-50 hover:bg-yellow-50"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleFinish}
            className="w-full mt-2 py-3.5 bg-indigo-600 hover:bg-yellow-300 hover:text-black text-white border-2 border-black rounded-2xl font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Vào Hội đồng quản trị</span> <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
