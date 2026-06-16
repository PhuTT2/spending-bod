import React, { useEffect, useState } from "react";
import { FinancialProfile, ProfileComputed } from "../types";
import { ArrowRight, Wallet, Briefcase, Target, Activity } from "lucide-react";

interface OnboardingFlowProps {
  onComplete: (profile: FinancialProfile) => void;
}

async function fetchPreview(draft: Partial<FinancialProfile>): Promise<ProfileComputed | null> {
  try {
    const res = await fetch("/api/profile/preview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [displayName, setDisplayName] = useState("");
  const [income, setIncome] = useState("18000000");
  const [savingsAmt, setSavingsAmt] = useState("40000000");
  const [investmentsAmt, setInvestmentsAmt] = useState("10000000");
  const [riskTolerance, setRiskTolerance] = useState<"low" | "medium" | "high">("medium");

  const [hasBnpl, setHasBnpl] = useState(false);
  const [limitBnpl, setLimitBnpl] = useState("5000000");
  const [hasSavings, setHasSavings] = useState(false);
  const [balanceSavings, setBalanceSavings] = useState("15000000");
  const [hasSecurities, setHasSecurities] = useState(false);
  const [hasLifeIns, setHasLifeIns] = useState(false);

  const [travelPref, setTravelPref] = useState(3);
  const [shoppingPref, setShoppingPref] = useState(3);
  const [entertainmentPref, setEntertainmentPref] = useState(3);
  const [savingPref, setSavingPref] = useState(3);
  const [investingPref, setInvestingPref] = useState(3);
  const [safetyPref, setSafetyPref] = useState(3);

  const [goalTitle, setGoalTitle] = useState("Quỹ Dự Phòng Khẩn Cấp 🛡️");
  const [goalTargetAmt, setGoalTargetAmt] = useState("50000000");
  const [goalCurrentAmt, setGoalCurrentAmt] = useState("10000000");
  const [goalDeadline, setGoalDeadline] = useState("2026-12-31");

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [preview, setPreview] = useState<ProfileComputed | null>(null);

  const formatCurrency = (val: string) => {
    const num = parseInt(val.replace(/\D/g, ""), 10);
    return isNaN(num) ? "" : new Intl.NumberFormat("vi-VN").format(num);
  };

  const inc = Math.max(0, parseFloat(income.replace(/\D/g, "")) || 0);
  const sav = Math.max(0, parseFloat(savingsAmt.replace(/\D/g, "")) || 0);
  const inv = Math.max(0, parseFloat(investmentsAmt.replace(/\D/g, "")) || 0);

  const buildDraftProfile = (): FinancialProfile => ({
    user_id: displayName.trim() || "ceo",
    display_name: displayName.trim() || "Sếp Tổng",
    monthly_income: inc,
    monthly_fixed_expenses: null,
    cash_balance: sav,
    investments_balance: inv,
    risk_tolerance: riskTolerance,
    lifestyle_preference: { travel: travelPref, shopping: shoppingPref, entertainment: entertainmentPref, saving: savingPref, investing: investingPref, safety: safetyPref },
    product_holdings: {
      bnpl: { has: hasBnpl, limit: hasBnpl ? parseFloat(limitBnpl) || 0 : 0, provider: hasBnpl ? "ZaloPay PayLater" : null },
      savings: { has: hasSavings, balance: hasSavings ? parseFloat(balanceSavings) || 0 : 0 },
      securities: { has: hasSecurities, balance: 0 },
      life_insurance: { has: hasLifeIns, premium: 0 },
      non_life_insurance: { has: false, name: null },
    },
    active_goals: [],
    discipline_score: 80,
    created_at: "",
    updated_at: "",
  });

  useEffect(() => {
    if (step !== 4) return;
    fetchPreview(buildDraftProfile()).then(setPreview);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const handleNextStep = () => {
    const newErrors: { [key: string]: string } = {};
    if (step === 1) {
      if (!displayName.trim()) newErrors.displayName = "Cho HĐQT biết tên gọi của bạn.";
      if (inc <= 0) newErrors.income = "Nhập thu nhập hàng tháng.";
      if (Object.keys(newErrors).length > 0) return setErrors(newErrors);
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      if (!goalTitle.trim()) newErrors.goalTitle = "Đặt tên cho mục tiêu này.";
      const targetNum = parseInt(goalTargetAmt.replace(/\D/g, ""), 10);
      if (isNaN(targetNum) || targetNum <= 0) newErrors.goalTargetAmt = "Nhập số tiền mục tiêu hợp lệ.";
      if (!goalDeadline) newErrors.goalDeadline = "Chọn thời hạn.";
      if (Object.keys(newErrors).length > 0) return setErrors(newErrors);
      setStep(4);
    }
    setErrors({});
  };

  const handleFinish = () => {
    const profile = buildDraftProfile();
    profile.active_goals = [
      {
        goal_id: "goal-" + Date.now(),
        title: goalTitle.trim(),
        target_amount: Math.max(1, parseFloat(goalTargetAmt.replace(/\D/g, "")) || 0),
        current_amount: Math.max(0, parseFloat(goalCurrentAmt.replace(/\D/g, "")) || 0),
        deadline: goalDeadline,
      },
    ];
    onComplete(profile);
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-8 px-4">
      <div className="bg-white border-4 border-black rounded-3xl p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-black relative">
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-teal-400 via-indigo-600 to-rose-400 rounded-t-xl" />

        <div className="mb-6 mt-2">
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight">HĐQT Tài Chính</h1>
          <p className="text-sm font-bold text-slate-700 mt-1">
            Trình mọi khoản chi lớn cho một "hội đồng" AI duyệt trước khi bạn quẹt thẻ.
          </p>
        </div>

        <div className="flex gap-1.5 font-mono text-xs font-black mb-6">
          {[1, 2, 3, 4].map((s) => (
            <span key={s} className={`w-6 h-6 flex items-center justify-center rounded-full border border-black ${step >= s ? "bg-indigo-600 text-white" : "bg-gray-100"}`}>{s}</span>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="displayName" className="text-xs font-black uppercase">Tên gọi của bạn *</label>
              <input
                id="displayName"
                type="text"
                placeholder="Ví dụ: Thiện"
                value={displayName}
                onChange={(e) => { setDisplayName(e.target.value); if (errors.displayName) setErrors({ ...errors, displayName: "" }); }}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border-2 ${errors.displayName ? "border-rose-500" : "border-black"} rounded-xl font-bold text-black outline-none text-sm`}
              />
              {errors.displayName && <p className="text-rose-600 text-[11px] font-bold">⚠️ {errors.displayName}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="income" className="text-xs font-black uppercase flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-emerald-600" /> Thu nhập mỗi tháng *
              </label>
              <div className="relative">
                <input
                  id="income"
                  type="text"
                  value={formatCurrency(income)}
                  onChange={(e) => { setIncome(e.target.value); if (errors.income) setErrors({ ...errors, income: "" }); }}
                  className={`w-full px-4 py-2.5 bg-slate-50 border-2 ${errors.income ? "border-rose-500" : "border-black"} rounded-xl font-mono text-base font-black outline-none pr-10`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₫</span>
              </div>
              {errors.income && <p className="text-rose-600 text-xs font-bold">⚠️ {errors.income}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-indigo-600" /> Tiền tiết kiệm</label>
                <div className="relative">
                  <input type="text" value={formatCurrency(savingsAmt)} onChange={(e) => setSavingsAmt(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border-2 border-black rounded-xl font-mono text-sm font-black outline-none pr-8" />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₫</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase">📈 Tiền đang đầu tư</label>
                <div className="relative">
                  <input type="text" value={formatCurrency(investmentsAmt)} onChange={(e) => setInvestmentsAmt(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border-2 border-black rounded-xl font-mono text-sm font-black outline-none pr-8" />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₫</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black uppercase block">Khẩu vị rủi ro</span>
              <div className="grid grid-cols-3 gap-2">
                {[{ key: "low", label: "Thấp 🛡️" }, { key: "medium", label: "Vừa ⚖️" }, { key: "high", label: "Cao ⚡" }].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setRiskTolerance(item.key as any)}
                    className={`py-2 px-3 border-2 border-black rounded-xl font-black text-xs uppercase cursor-pointer transition-all ${riskTolerance === item.key ? "bg-indigo-600 text-white" : "bg-slate-50 hover:bg-yellow-50"}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleNextStep} className="w-full mt-6 py-3.5 bg-indigo-600 hover:bg-yellow-300 hover:text-black text-white border-2 border-black rounded-2xl font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer flex items-center justify-center gap-2">
              <span>Tiếp theo</span> <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h3 className="font-black text-sm uppercase text-indigo-900">Sản phẩm đang dùng & gu sống</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="border-2 border-black p-3.5 rounded-2xl bg-slate-50">
                <label className="flex items-center gap-2.5 font-extrabold text-xs uppercase cursor-pointer">
                  <input type="checkbox" checked={hasBnpl} onChange={(e) => setHasBnpl(e.target.checked)} className="w-4 h-4 cursor-pointer" />
                  <span>Ví trả sau 💳</span>
                </label>
                {hasBnpl && (
                  <input type="number" value={limitBnpl} onChange={(e) => setLimitBnpl(e.target.value)} className="mt-2 px-2 py-1 bg-white border border-black rounded-lg font-mono text-xs font-black w-36" />
                )}
              </div>
              <div className="border-2 border-black p-3.5 rounded-2xl bg-slate-50">
                <label className="flex items-center gap-2.5 font-extrabold text-xs uppercase cursor-pointer">
                  <input type="checkbox" checked={hasSavings} onChange={(e) => setHasSavings(e.target.checked)} className="w-4 h-4 cursor-pointer" />
                  <span>Tài khoản tích lũy 🐷</span>
                </label>
                {hasSavings && (
                  <input type="number" value={balanceSavings} onChange={(e) => setBalanceSavings(e.target.value)} className="mt-2 px-2 py-1 bg-white border border-black rounded-lg font-mono text-xs font-black w-36" />
                )}
              </div>
              <div className="border-2 border-black p-3.5 rounded-2xl bg-slate-50">
                <label className="flex items-center gap-2.5 font-extrabold text-xs uppercase cursor-pointer">
                  <input type="checkbox" checked={hasSecurities} onChange={(e) => setHasSecurities(e.target.checked)} className="w-4 h-4 cursor-pointer" />
                  <span>Chứng khoán 📈</span>
                </label>
              </div>
              <div className="border-2 border-black p-3.5 rounded-2xl bg-slate-50">
                <label className="flex items-center gap-2.5 font-extrabold text-xs uppercase cursor-pointer">
                  <input type="checkbox" checked={hasLifeIns} onChange={(e) => setHasLifeIns(e.target.checked)} className="w-4 h-4 cursor-pointer" />
                  <span>Bảo hiểm nhân thọ 🛡️</span>
                </label>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-3.5">
              {[
                { label: "✈️ Du lịch", value: travelPref, set: setTravelPref },
                { label: "🛍️ Mua sắm", value: shoppingPref, set: setShoppingPref },
                { label: "🍿 Giải trí", value: entertainmentPref, set: setEntertainmentPref },
                { label: "🐷 Tiết kiệm", value: savingPref, set: setSavingPref },
                { label: "📈 Đầu tư", value: investingPref, set: setInvestingPref },
                { label: "🛡️ An toàn", value: safetyPref, set: setSafetyPref },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between items-center text-[11px] font-black uppercase text-slate-800">
                    <span>{item.label}</span>
                    <span className="font-mono text-indigo-600">{item.value}/5</span>
                  </div>
                  <input type="range" min="1" max="5" value={item.value} onChange={(e) => item.set(parseInt(e.target.value))} className="w-full accent-indigo-600 cursor-pointer h-1.5" />
                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-between mt-6 pt-4 border-t border-gray-200">
              <button onClick={() => setStep(1)} className="px-5 py-2.5 text-xs bg-white text-black border-2 border-black rounded-xl font-bold uppercase hover:bg-slate-50 cursor-pointer">Quay lại</button>
              <button onClick={handleNextStep} className="px-6 py-2.5 text-xs bg-indigo-600 text-white border-2 border-black rounded-xl font-black uppercase hover:bg-yellow-300 hover:text-black cursor-pointer flex items-center gap-1">
                <span>Tiếp theo</span> <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h3 className="font-black text-sm uppercase text-indigo-900 flex items-center gap-2"><Target className="w-5 h-5" /> Mục tiêu đầu tiên</h3>
            <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border-2 border-black">
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase text-gray-700">Tên mục tiêu *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Mua laptop, Quỹ khẩn cấp..."
                  value={goalTitle}
                  onChange={(e) => { setGoalTitle(e.target.value); if (errors.goalTitle) setErrors({ ...errors, goalTitle: "" }); }}
                  className={`w-full px-3.5 py-2.5 bg-white border-2 ${errors.goalTitle ? "border-rose-500" : "border-black"} rounded-xl font-bold outline-none text-xs`}
                />
                {errors.goalTitle && <p className="text-rose-600 text-[11px] font-bold">⚠️ {errors.goalTitle}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase text-gray-700">Số tiền mục tiêu *</label>
                  <div className="relative">
                    <input type="text" value={formatCurrency(goalTargetAmt)} onChange={(e) => { setGoalTargetAmt(e.target.value); if (errors.goalTargetAmt) setErrors({ ...errors, goalTargetAmt: "" }); }} className={`w-full px-3.5 py-2.5 bg-white border-2 ${errors.goalTargetAmt ? "border-rose-500" : "border-black"} rounded-xl font-mono text-xs font-black outline-none pr-8`} />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₫</span>
                  </div>
                  {errors.goalTargetAmt && <p className="text-rose-600 text-[11px] font-bold">⚠️ {errors.goalTargetAmt}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase text-gray-700">Đã có sẵn</label>
                  <div className="relative">
                    <input type="text" value={formatCurrency(goalCurrentAmt)} onChange={(e) => setGoalCurrentAmt(e.target.value)} className="w-full px-3.5 py-2.5 bg-white border-2 border-black rounded-xl font-mono text-xs font-black outline-none pr-8" />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₫</span>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase text-gray-700">Thời hạn *</label>
                <input type="date" value={goalDeadline} onChange={(e) => { setGoalDeadline(e.target.value); if (errors.goalDeadline) setErrors({ ...errors, goalDeadline: "" }); }} className={`w-full px-3.5 py-2.5 bg-white border-2 ${errors.goalDeadline ? "border-rose-500" : "border-black"} rounded-xl font-mono text-xs font-black outline-none`} />
                {errors.goalDeadline && <p className="text-rose-600 text-[11px] font-bold">⚠️ {errors.goalDeadline}</p>}
              </div>
            </div>
            <div className="flex gap-3 justify-between mt-6 pt-4 border-t border-gray-200">
              <button onClick={() => setStep(2)} className="px-5 py-2.5 text-xs bg-white text-black border-2 border-black rounded-xl font-bold uppercase hover:bg-slate-50 cursor-pointer">Quay lại</button>
              <button onClick={handleNextStep} className="px-6 py-2.5 text-xs bg-indigo-600 text-white border-2 border-black rounded-xl font-black uppercase hover:bg-yellow-300 hover:text-black cursor-pointer flex items-center gap-1">
                <span>Xem kết quả</span> <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <h3 className="font-black text-sm uppercase text-indigo-900 flex items-center gap-2"><Activity className="w-5 h-5 animate-pulse" /> Hồ sơ khởi điểm của bạn</h3>

            {!preview ? (
              <p className="text-xs font-bold text-gray-500">Đang tính toán...</p>
            ) : (
              <>
                <div className="border-2 border-black bg-yellow-50 rounded-2xl p-4 text-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <span className="text-[10px] font-black text-indigo-600 tracking-widest block uppercase">Nhân cách tài chính</span>
                  <strong className="text-base font-black text-black uppercase block mt-1">🏆 {preview.personality_label}</strong>
                </div>
                <div className="border-2 border-black rounded-2xl p-4 bg-indigo-50/50 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Sức khỏe tài chính</span>
                  <strong className="text-2xl font-black font-mono mt-1 block">{preview.health_score} / 100</strong>
                  <p className="text-[11px] text-slate-600 font-semibold mt-1">{preview.health_label} — {preview.health_description}</p>
                </div>
              </>
            )}

            <div className="flex gap-3 justify-between mt-8 pt-4 border-t border-gray-200">
              <button onClick={() => setStep(3)} className="px-5 py-3 text-xs bg-white text-black border-2 border-black rounded-xl font-bold uppercase hover:bg-slate-50 cursor-pointer">Quay lại</button>
              <button onClick={handleFinish} className="px-8 py-3.5 bg-emerald-600 hover:bg-yellow-300 hover:text-black text-white border-2 border-black rounded-xl font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer">
                Bắt đầu 🚀
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
