import React, { useState } from "react";
import { UserFinancialState, FinancialProfile } from "../types";
import { Shield, Check, ArrowRight, User, Key, Wallet, Briefcase, Eye, EyeOff, Activity, Target, Award, Sparkles, TrendingUp } from "lucide-react";

interface OnboardingFlowProps {
  onComplete: (data: {
    income: number;
    savings: number;
    investments: number;
    financialProfile: FinancialProfile;
  }) => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  
  // State 1: Account info & General Baseline Finances
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [income, setIncome] = useState("18000000");
  const [savingsAmt, setSavingsAmt] = useState("40000000");
  const [investmentsAmt, setInvestmentsAmt] = useState("10000000");
  const [riskTolerance, setRiskTolerance] = useState<"low" | "medium" | "high">("medium");

  // State 2: Product Holdings & Lifestyle Rating (1 to 5)
  const [hasBnpl, setHasBnpl] = useState(false);
  const [limitBnpl, setLimitBnpl] = useState("5000000");

  const [hasSavings, setHasSavings] = useState(false);
  const [balanceSavings, setBalanceSavings] = useState("15000000");

  const [hasSecurities, setHasSecurities] = useState(false);
  const [balanceSecurities, setBalanceSecurities] = useState("12000000");

  const [hasLifeIns, setHasLifeIns] = useState(false);
  const [premiumLifeIns, setPremiumLifeIns] = useState("8000000");

  const [hasNonLifeIns, setHasNonLifeIns] = useState(false);
  const [nameNonLifeIns, setNameNonLifeIns] = useState("Bảo hiểm Sức Khỏe Toàn Diện ZaloPay");

  const [travelPref, setTravelPref] = useState(3);
  const [shoppingPref, setShoppingPref] = useState(3);
  const [entertainmentPref, setEntertainmentPref] = useState(3);
  const [savingPref, setSavingPref] = useState(3);
  const [investingPref, setInvestingPref] = useState(3);
  const [safetyPref, setSafetyPref] = useState(3);

  // State 3: First Financial Goal (Mandatory in onboarding)
  const [goalTitle, setGoalTitle] = useState("Quỹ Dự Phòng Khẩn Cấp 🛡️");
  const [goalTargetAmt, setGoalTargetAmt] = useState("50000000");
  const [goalCurrentAmt, setGoalCurrentAmt] = useState("10000000");
  const [goalDeadline, setGoalDeadline] = useState("2026-12-31");

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const formatCurrency = (val: string) => {
    const num = parseInt(val.replace(/\D/g, ""), 10);
    if (isNaN(num)) return "";
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  // Compute Personality descriptive label based on dominant trait & risk
  const getPersonalityLabel = () => {
    const prefs = [
      { name: "Chiến Thần Xê Dịch ✈️", score: travelPref },
      { name: "Hán Tử Săn Deal Mua Sắm 🛍️", score: shoppingPref },
      { name: "Sứ Giả Giải Trí Hưởng Thụ 🍿", score: entertainmentPref },
      { name: "Thủ Quỹ Tích Lũy Thép 🐷", score: savingPref },
      { name: "Cá Mập Đu Đỉnh Đầu Tư 📈", score: investingPref },
      { name: "Thánh Phòng Thủ Rủi Ro 🛡️", score: safetyPref }
    ];
    
    let best = prefs[0];
    for (const p of prefs) {
      if (p.score > best.score) {
        best = p;
      }
    }
    
    if (best.score === 3 && travelPref === 3 && shoppingPref === 3 && entertainmentPref === 3 && savingPref === 3 && investingPref === 3 && safetyPref === 3) {
      if (riskTolerance === "high") return "Nhà Đầu Cơ Mạo Hiểm ⚡";
      if (riskTolerance === "low") return "CEO Phòng Thủ Cẩn Trọng 🏰";
      return "Sếp Tổng Cân Bằng Trí Tuệ 🧠";
    }
    
    return best.name;
  };

  // Establish values dynamically based on input for step 4
  const inc = Math.max(0, parseFloat(income.replace(/\D/g, "")) || 0);
  const sav = Math.max(0, parseFloat(savingsAmt.replace(/\D/g, "")) || 0);
  const inv = Math.max(0, parseFloat(investmentsAmt.replace(/\D/g, "")) || 0);

  // Compute Initial Baseline Stats
  // Financial Health Score: computed from cash surplus vs income, holdings & insurance presence
  const calculatedHealthScore = Math.min(
    100,
    Math.max(
      35,
      Math.round(
        (sav / Math.max(1, inc)) * 12 +
        (inv > 0 ? 10 : 0) +
        (hasLifeIns || hasNonLifeIns ? 15 : 0) +
        (hasSavings ? 10 : 0) +
        (riskTolerance === "medium" ? 5 : 0) +
        45
      )
    )
  );

  // Discipline Score: based on saving, safety preference and absence of excessive BNPL
  const calculatedDisciplineScore = Math.min(
    100,
    Math.max(
      40,
      Math.round(
        savingPref * 8 +
        safetyPref * 6 -
        (hasBnpl && parseFloat(limitBnpl) > 10000000 ? 10 : 0) +
        (shoppingPref > 4 ? -8 : 0) +
        40
      )
    )
  );

  const handleNextStep = () => {
    const newErrors: { [key: string]: string } = {};
    if (step === 1) {
      if (!username.trim() || username.trim().length < 3) {
        newErrors.username = "Tên tài khoản tối thiểu phải có 3 ký tự!";
      }
      if (!password || password.length < 4) {
        newErrors.password = "Mật khẩu ít nhất là 4 ký tự!";
      }
      const incVal = parseInt(income.replace(/\D/g, ""), 10);
      if (isNaN(incVal) || incVal <= 0) {
        newErrors.income = "Vui lòng nhập thu nhập hàng tháng hợp lệ!";
      }
      const savVal = parseInt(savingsAmt.replace(/\D/g, ""), 10);
      if (isNaN(savVal) || savVal < 0) {
        newErrors.savingsAmt = "Vui lòng nhập khoản tiết kiệm hợp lệ!";
      }
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      setErrors({});
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      if (!goalTitle.trim()) {
        newErrors.goalTitle = "Sếp cần chỉ rõ tên cột mốc mục tiêu dự tính!";
      }
      const targetNum = parseInt(goalTargetAmt.replace(/\D/g, ""), 10);
      if (isNaN(targetNum) || targetNum <= 0) {
        newErrors.goalTargetAmt = "Vui lòng nhập trị giá mục tiêu hợp lệ!";
      }
      if (!goalDeadline) {
        newErrors.goalDeadline = "Vui lòng chỉ định thời hạn của mục tiêu!";
      }
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      setErrors({});
      setStep(4);
    }
  };

  const handleFinish = () => {
    const firstGoal = {
      goal_id: "goal-" + Date.now(),
      title: goalTitle.trim(),
      target_amount: Math.max(1, parseFloat(goalTargetAmt.replace(/\D/g, "")) || 0),
      current_amount: Math.max(0, parseFloat(goalCurrentAmt.replace(/\D/g, "")) || 0),
      deadline: goalDeadline
    };

    const lifestyle_preference = {
      travel: travelPref,
      shopping: shoppingPref,
      entertainment: entertainmentPref,
      saving: savingPref,
      investing: investingPref,
      safety: safetyPref
    };

    const financialProfile: FinancialProfile = {
      profile_id: "prof_v1_" + Date.now(),
      user_id: username.trim(),
      version: 1,
      username: username.trim(),
      monthly_income: inc,
      monthly_fixed_expenses: inc * 0.35,
      cash_balance: sav + inv,
      emergency_fund: sav,
      risk_tolerance: riskTolerance,
      lifestyle_preference,
      financial_personality: getPersonalityLabel(),
      product_holdings: {
        bnpl: { has: hasBnpl, limit: hasBnpl ? (parseFloat(limitBnpl) || 0) : 0, provider: hasBnpl ? "ZaloPay PayLater" : null },
        savings: { has: hasSavings, balance: hasSavings ? (parseFloat(balanceSavings) || 0) : 0 },
        securities: { has: hasSecurities, balance: hasSecurities ? (parseFloat(balanceSecurities) || 0) : 0 },
        life_insurance: { has: hasLifeIns, premium: hasLifeIns ? (parseFloat(premiumLifeIns) || 0) : 0 },
        non_life_insurance: { has: hasNonLifeIns, name: hasNonLifeIns ? nameNonLifeIns : null }
      },
      active_goals: [firstGoal],
      discipline_score: calculatedDisciplineScore,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onComplete({
      income: inc,
      savings: sav,
      investments: inv,
      financialProfile,
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-8 px-4" id="onboarding-flow">
      {/* Container Card */}
      <div className="bg-white border-4 border-black rounded-3xl p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-black relative">
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-teal-400 via-indigo-600 to-rose-400 rounded-t-xl" />
        
        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-6 mt-2 border-b-2 border-black pb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight">HĐQT TÀI CHÍNH ONBOARDING</h1>
            <p className="text-[10px] md:text-xs font-mono font-bold uppercase tracking-wider text-gray-500 mt-1">
              {step === 1 ? "BƯỚC 1: KHỞI TẠO ACCOUNT & DÒNG TIỀN CỐT LÕI" :
               step === 2 ? "BƯỚC 2: SẢN PHẨM SỬ DỤNG & LỐI SỐNG" :
               step === 3 ? "BƯỚC 3: THIẾT LẬP MỤC TIÊU ĐẦU TIÊN (FIRST GOAL)" :
               "BƯỚC 4: THIẾT LẬP BASELINE & NHẬN PHÁN QUYẾT"}
            </p>
          </div>
          <div className="flex gap-1.5 font-mono text-xs font-black">
            <span className={`w-6 h-6 flex items-center justify-center rounded-full border border-black ${step >= 1 ? "bg-indigo-650 bg-indigo-650 bg-indigo-600 text-white" : "bg-gray-100"}`}>1</span>
            <span className={`w-6 h-6 flex items-center justify-center rounded-full border border-black ${step >= 2 ? "bg-indigo-650 bg-indigo-600 text-white" : "bg-gray-100"}`}>2</span>
            <span className={`w-6 h-6 flex items-center justify-center rounded-full border border-black ${step >= 3 ? "bg-indigo-650 bg-indigo-600 text-white" : "bg-gray-100"}`}>3</span>
            <span className={`w-6 h-6 flex items-center justify-center rounded-full border border-black ${step >= 4 ? "bg-indigo-650 bg-indigo-600 text-white" : "bg-gray-100"}`}>4</span>
          </div>
        </div>

        {/* Step 1: Create Account & Core Cash flow */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="p-4 bg-yellow-50 border-2 border-black rounded-2xl text-xs leading-relaxed font-bold flex items-start gap-2.5">
              <Shield className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="uppercase text-indigo-900 block font-black">CHÀO MỪNG CEO MỚI GIA NHẬP ROOM CHỈ HUY</span>
                <p className="text-slate-800 mt-0.5">
                  Hãy khai báo nhanh thông tin định danh và năng lực dòng tiền căn bản của sếp. Sân chơi này hoàn toàn bảo mật cục bộ để hỗ trợ phản biện quyết định!
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="username" className="text-xs font-black uppercase flex items-center gap-1.5">
                    <User className="w-4 h-4 text-indigo-600" /> Tên đăng nhập của sếp (Username) *
                  </label>
                  <input
                    id="username"
                    type="text"
                    placeholder="Ví dụ: thuantran, hoainguyen..."
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (errors.username) setErrors({ ...errors, username: "" });
                    }}
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border-2 ${errors.username ? 'border-rose-500' : 'border-black'} rounded-xl font-bold text-black focus:bg-yellow-50 outline-none transition text-sm`}
                  />
                  {errors.username && <p className="text-rose-600 text-[11px] font-bold">⚠️ {errors.username}</p>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-xs font-black uppercase flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-rose-500" /> Mật khẩu bảo an (Password) *
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Tối thiểu 4 ký tự..."
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors({ ...errors, password: "" });
                      }}
                      className={`w-full px-3.5 py-2.5 bg-slate-50 border-2 ${errors.password ? 'border-rose-500' : 'border-black'} rounded-xl font-bold text-black focus:bg-yellow-50 outline-none transition pr-10 text-sm`}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-rose-600 text-[11px] font-bold">⚠️ {errors.password}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="income" className="text-xs font-black uppercase flex items-center gap-1.5 text-black">
                  <Wallet className="w-4 h-4 text-emerald-600" /> 1. LƯƠNG / THU NHẬP RÒNG HÀNG THÁNG *
                </label>
                <div className="relative">
                  <input
                    id="income"
                    type="text"
                    value={formatCurrency(income)}
                    onChange={(e) => {
                      setIncome(e.target.value);
                      if (errors.income) setErrors({ ...errors, income: "" });
                    }}
                    className={`w-full px-4 py-2.5 bg-slate-50 border-2 ${errors.income ? 'border-rose-500' : 'border-black'} rounded-xl font-mono text-base font-black focus:bg-yellow-50 outline-none pr-10`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold font-mono">₫</span>
                </div>
                {errors.income && <p className="text-rose-600 text-xs font-bold">⚠️ {errors.income}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="savingsAmt" className="text-xs font-black uppercase flex items-center gap-1.5 text-slate-700">
                    <Briefcase className="w-4 h-4 text-indigo-650 text-indigo-600" /> 2. TIỀN TIẾT KIỆM KHẢ DỤNG *
                  </label>
                  <div className="relative">
                    <input
                      id="savingsAmt"
                      type="text"
                      value={formatCurrency(savingsAmt)}
                      onChange={(e) => {
                        setSavingsAmt(e.target.value);
                        if (errors.savingsAmt) setErrors({ ...errors, savingsAmt: "" });
                      }}
                      className={`w-full px-4 py-2.5 bg-slate-50 border-2 ${errors.savingsAmt ? 'border-rose-500' : 'border-black'} rounded-xl font-mono text-sm font-black focus:bg-yellow-50 outline-none pr-8`}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold font-mono">₫</span>
                  </div>
                  {errors.savingsAmt && <p className="text-rose-600 text-xs font-bold font-mono">⚠️ {errors.savingsAmt}</p>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="investmentsAmt" className="text-xs font-black uppercase flex items-center gap-1.5 text-slate-700">
                    📈 3. TIỀN ĐANG ĐẦU TƯ
                  </label>
                  <div className="relative">
                    <input
                      id="investmentsAmt"
                      type="text"
                      value={formatCurrency(investmentsAmt)}
                      onChange={(e) => setInvestmentsAmt(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border-2 border-black rounded-xl font-mono text-sm font-black focus:bg-yellow-50 outline-none pr-8"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold font-mono">₫</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <span className="text-xs font-black uppercase block text-slate-700 leading-none">⚡ 4. KHẨU VỊ RỦI RO ĐẦU TƯ:</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "low", label: "THẤP (Bảo thủ) 🛡️" },
                    { key: "medium", label: "TRUNG BÌNH (Cân bằng) ⚖️" },
                    { key: "high", label: "CAO (Mạo hiểm) ⚡" }
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setRiskTolerance(item.key as any)}
                      className={`py-2 px-3 border-2 border-black rounded-xl font-black text-xs uppercase cursor-pointer transition-all ${
                        riskTolerance === item.key
                          ? "bg-indigo-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                          : "bg-slate-50 hover:bg-yellow-50 hover:text-black"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
            
            <button
              onClick={handleNextStep}
              className="w-full mt-6 py-3.5 bg-indigo-600 hover:bg-yellow-300 hover:text-black text-white border-2 border-black rounded-2xl font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Sản Phẩm Tài Chính & Lối Sống</span> <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Product Holdings & Lifestyle preference rating */}
        {step === 2 && (
          <div className="space-y-5">
            <h3 className="font-black text-base uppercase leading-tight text-indigo-900">SẢN PHẨM TÀI CHÍNH & XẾP HẠNG CHI TIÊU</h3>
            <p className="text-xs text-gray-600 font-bold leading-relaxed">
              Tích chọn những sản phẩm sếp đang tận dụng và chấm thang điểm lối sống (1: Nghèo nàn tẻ nhạt, 5: Ưu tiên sùng bái tuyệt đối) để HĐQT có cơ sở phản biện wittily.
            </p>

            <div className="space-y-4 pt-2">
              <span className="text-[10px] font-black uppercase text-gray-400 font-mono tracking-widest block">SẴN CÓ TRÊN ZALOPAY / ĐỊA PHƯƠNG</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                
                {/* Product 1: BNPL */}
                <div className="border-2 border-black p-3.5 rounded-2xl bg-slate-50">
                  <label className="flex items-center gap-2.5 font-extrabold text-xs uppercase cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasBnpl}
                      onChange={(e) => setHasBnpl(e.target.checked)}
                      className="w-4 h-4 text-indigo-650 cursor-pointer text-indigo-600 border-black rounded"
                    />
                    <span>Ví Trả Sau (BNPL) 💳</span>
                  </label>
                  {hasBnpl && (
                    <div className="mt-2 pl-6 space-y-1">
                      <span className="text-[9px] font-black text-indigo-600 block uppercase">Hạn mức (VND):</span>
                      <input
                        type="number"
                        value={limitBnpl}
                        onChange={(e) => setLimitBnpl(e.target.value)}
                        className="px-2 py-1 bg-white border border-black rounded-lg font-mono text-xs font-black w-36"
                      />
                    </div>
                  )}
                </div>

                {/* Product 2: GỬI TIẾT KIỆM */}
                <div className="border-2 border-black p-3.5 rounded-2xl bg-slate-50">
                  <label className="flex items-center gap-2.5 font-extrabold text-xs uppercase cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasSavings}
                      onChange={(e) => setHasSavings(e.target.checked)}
                      className="w-4 h-4 text-indigo-650 cursor-pointer text-indigo-600 border-black rounded"
                    />
                    <span>Tài Khoản Tích Luỹ 🐷</span>
                  </label>
                  {hasSavings && (
                    <div className="mt-2 pl-6 space-y-1">
                      <span className="text-[9px] font-black text-indigo-600 block uppercase">TIỀN GỬI SẴN:</span>
                      <input
                        type="number"
                        value={balanceSavings}
                        onChange={(e) => setBalanceSavings(e.target.value)}
                        className="px-2 py-1 bg-white border border-black rounded-lg font-mono text-xs font-black w-36"
                      />
                    </div>
                  )}
                </div>

                {/* Product 3: CHỨNG KHOÁN */}
                <div className="border-2 border-black p-3.5 rounded-2xl bg-slate-50">
                  <label className="flex items-center gap-2.5 font-extrabold text-xs uppercase cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasSecurities}
                      onChange={(e) => setHasSecurities(e.target.checked)}
                      className="w-4 h-4 text-indigo-650 cursor-pointer text-indigo-600 border-black rounded"
                    />
                    <span>chứng khoán / cổ phiếu 📈</span>
                  </label>
                </div>

                {/* Product 4: BẢO HIỂM NHÂN THỌ */}
                <div className="border-2 border-black p-3.5 rounded-2xl bg-slate-50">
                  <label className="flex items-center gap-2.5 font-extrabold text-xs uppercase cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasLifeIns}
                      onChange={(e) => setHasLifeIns(e.target.checked)}
                      className="w-4 h-4 text-indigo-650 cursor-pointer text-indigo-600 border-black rounded"
                    />
                    <span>bảo hiểm nhân thọ 🛡️</span>
                  </label>
                </div>
              </div>

              {/* Sliders in Onboarding Step 2 */}
              <div className="border-t border-gray-200 pt-4 space-y-3.5">
                <span className="text-[10px] font-black uppercase text-gray-400 font-mono tracking-widest block">BẢNG TIÊU CHÍ ƯU TIÊN LỐI SỐNG LÀNH MẠNH</span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-3.5">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[11px] font-black uppercase text-slate-800">
                      <span>✈️ DU LỊCH & TRẢI NGHIỆM</span>
                      <span className="font-mono text-indigo-600">{travelPref}/5</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={travelPref}
                      onChange={(e) => setTravelPref(parseInt(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[11px] font-black uppercase text-slate-800">
                      <span>🛍️ SẮM CÔNG NGHỆ, DEAL DECOR</span>
                      <span className="font-mono text-indigo-600">{shoppingPref}/5</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={shoppingPref}
                      onChange={(e) => setShoppingPref(parseInt(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[11px] font-black uppercase text-slate-800">
                      <span>🍿 PHIM ẢNH & ĂN CHƠI PHỐ XÁ</span>
                      <span className="font-mono text-indigo-600">{entertainmentPref}/5</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={entertainmentPref}
                      onChange={(e) => setEntertainmentPref(parseInt(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[11px] font-black uppercase text-slate-800">
                      <span>🐷 GỬI GẮP TIẾT KIỆM HEO ĐẤT</span>
                      <span className="font-mono text-indigo-600">{savingPref}/5</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={savingPref}
                      onChange={(e) => setSavingPref(parseInt(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                    />
                  </div>
                </div>
              </div>

            </div>

            <div className="flex gap-3 justify-between mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-2.5 text-xs bg-white text-black border-2 border-black rounded-xl font-bold uppercase hover:bg-slate-50 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                QUAY LẠI
              </button>
              <button
                onClick={handleNextStep}
                className="px-6 py-2.5 text-xs bg-indigo-600 text-white border-2 border-black rounded-xl font-black uppercase hover:bg-yellow-300 hover:text-black cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1"
              >
                <span>MỤC TIÊU CỦA BẠN</span> <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: First Financial Goal (Mandatory requirement) */}
        {step === 3 && (
          <div className="space-y-5">
            <h3 className="font-black text-base uppercase leading-tight text-indigo-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-650" /> 3. KHAI BÁO MỤC TIÊU TÀI CHÍNH QUAN TRỌNG
            </h3>
            <p className="text-xs text-gray-600 font-bold leading-relaxed">
              Yêu cầu tối thiểu khai báo <strong className="text-indigo-600 font-black">ít nhất 1 mục tiêu lớn</strong> để làm mốc neo so chiếu tất cả các tờ trình chi tiêu và đề xuất dịch vụ tài chính khôn ngoan của HĐQT sau này!
            </p>

            <div className="space-y-4 pt-2 bg-slate-50 p-5 rounded-2xl border-2 border-black">
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-tight text-gray-700 font-mono">
                  1. Tên mục tiêu tài chính vĩ đại *
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Lập Quỹ Khẩn Cấp, Mua Laptop làm nghề, Gom tiền cưới vợ..."
                  value={goalTitle}
                  onChange={(e) => {
                    setGoalTitle(e.target.value);
                    if (errors.goalTitle) setErrors({ ...errors, goalTitle: "" });
                  }}
                  className={`w-full px-3.5 py-2.5 bg-white border-2 ${errors.goalTitle ? 'border-rose-500' : 'border-black'} rounded-xl font-bold text-black focus:bg-yellow-50 outline-none hover:border-black transition text-xs`}
                />
                {errors.goalTitle && <p className="text-rose-600 text-[11px] font-bold font-mono">⚠️ {errors.goalTitle}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase tracking-tight text-gray-700 font-mono">
                    2. Số tiền mặt cần gặt hái (VND) *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formatCurrency(goalTargetAmt)}
                      onChange={(e) => {
                        setGoalTargetAmt(e.target.value);
                        if (errors.goalTargetAmt) setErrors({ ...errors, goalTargetAmt: "" });
                      }}
                      className={`w-full px-3.5 py-2.5 bg-white border-2 ${errors.goalTargetAmt ? 'border-rose-500' : 'border-black'} rounded-xl font-mono text-xs font-black focus:bg-yellow-50 outline-none pr-8`}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold font-mono">₫</span>
                  </div>
                  {errors.goalTargetAmt && <p className="text-rose-600 text-[11px] font-bold font-mono">⚠️ {errors.goalTargetAmt}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-black uppercase tracking-tight text-gray-700 font-mono">
                    3. Số tiền sẵn sàng rót sẵn ngay (Starting)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formatCurrency(goalCurrentAmt)}
                      onChange={(e) => setGoalCurrentAmt(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border-2 border-black rounded-xl font-mono text-xs font-black focus:bg-yellow-50 outline-none pr-8"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold font-mono">₫</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 col-span-2">
                <label className="block text-xs font-black uppercase tracking-tight text-gray-700 font-mono">
                  4. Thời hạn hoàn thành mong muốn (Deadline) *
                </label>
                <input
                  type="date"
                  value={goalDeadline}
                  onChange={(e) => {
                    setGoalDeadline(e.target.value);
                    if (errors.goalDeadline) setErrors({ ...errors, goalDeadline: "" });
                  }}
                  className={`w-full px-3.5 py-2.5 bg-white border-2 ${errors.goalDeadline ? 'border-rose-500' : 'border-black'} rounded-xl font-mono text-xs font-black focus:bg-yellow-50 outline-none`}
                />
                {errors.goalDeadline && <p className="text-rose-600 text-[11px] font-bold font-mono">⚠️ {errors.goalDeadline}</p>}
              </div>
            </div>

            <div className="flex gap-3 justify-between mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-2.5 text-xs bg-white text-black border-2 border-black rounded-xl font-bold uppercase hover:bg-slate-50 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                QUAY LẠI
              </button>
              <button
                onClick={handleNextStep}
                className="px-6 py-2.5 text-xs bg-indigo-600 text-white border-2 border-black rounded-xl font-black uppercase hover:bg-yellow-300 hover:text-black cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1"
              >
                <span>XEM BASELINE BÁO CÁO</span> <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Establish Initial Baseline of scores and Persona */}
        {step === 4 && (
          <div className="space-y-5">
            <h3 className="font-black text-base uppercase leading-tight text-indigo-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600 animate-pulse" /> BÁO CÁO BASELINE & PHÁN QUYẾT HỘI ĐỒNG
            </h3>
            <p className="text-xs text-slate-600 font-bold">
              Phòng tham mưu đã tóm lược hồ sơ phân tích ban đầu. Kết quả đo lường và điểm kỷ luật tối cao của sếp được thiết lập như sau:
            </p>

            {/* Baseline Overview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="border-2 border-black rounded-2xl p-4 bg-indigo-50/50 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase font-mono text-indigo-600 tracking-wider">CHỈ SỐ SỨC KHỎE TÀI CHÍNH</span>
                  <strong className="text-2xl font-black font-mono mt-1 block hover:scale-105 duration-200">{calculatedHealthScore} / 100</strong>
                </div>
                <p className="text-[10px] text-slate-500 font-semibold leading-relaxed mt-2.5">
                  Tính toán dựa trên cơ sở thặng dư tiết kiệm hiện có chia tỷ trọng thu nhập ròng và mức trang bị bảo vệ rủi ro của sếp.
                </p>
              </div>

              <div className="border-2 border-black rounded-2xl p-4 bg-emerald-50/50 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase font-mono text-emerald-800 tracking-wider">ĐIỂM KỶ LUẬT THÉP (BASELINE)</span>
                  <strong className="text-2xl font-black font-mono mt-1 block text-emerald-700 hover:scale-105 duration-200">{calculatedDisciplineScore} / 100</strong>
                </div>
                <p className="text-[10px] text-slate-500 font-semibold leading-relaxed mt-2.5">
                  Điểm gốc để sếp cộng bồi khi tuân thủ, hoặc trừ nợ răn đe khi nổi loạn kháng lệnh tự ý tiêu pha bốc đồng bất tín.
                </p>
              </div>

            </div>

            {/* Persona card */}
            <div className="border-2 border-black bg-yellow-50 rounded-2xl p-4.5 text-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-[10px] font-black text-indigo-600 font-mono tracking-widest leading-none block uppercase">NHÂN CÁCH TÀI CHÍNH SƠ BỘ</span>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-xl">🏆</span>
                <strong className="text-base font-black text-black uppercase">{getPersonalityLabel()}</strong>
              </div>
              <p className="text-[11px] text-slate-600 font-medium px-4 mt-1.5 leading-relaxed">
                Được tổng hợp từ khẩu vị chấp nhận rủi ro và bản kê ưu tiên hoạt động sinh hoạt sếp đã chấm.
              </p>
            </div>

            {/* Micro details feedback */}
            <div className="p-3.5 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl text-[11px] leading-relaxed font-bold space-y-1">
              <p className="text-indigo-900">• Mục tiêu tài chính đầu tiên: <strong className="text-black uppercase">"{goalTitle}"</strong> với lộ trình tích quỹ <strong className="text-indigo-600">{formatCurrency(goalTargetAmt)}đ</strong> trước ngày {new Date(goalDeadline).toLocaleDateString("vi-VN")}.</p>
              <p className="text-slate-800">• Hội Đồng Quản Trị đã chính thức sẵn sàng tại vị để rà soát toàn bộ đề xuất của sếp.</p>
            </div>

            <div className="flex gap-3 justify-between mt-8 pt-4 border-t border-gray-200">
              <button
                onClick={() => setStep(3)}
                className="px-5 py-3 text-xs bg-white text-black border-2 border-black rounded-xl font-bold uppercase hover:bg-slate-50 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                QUAY LẠI
              </button>
              <button
                onClick={handleFinish}
                className="px-8 py-3.5 bg-emerald-600 hover:bg-yellow-300 hover:text-black text-white border-2 border-black rounded-xl font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer flex items-center gap-2 animate-bounce"
              >
                <span>CHÍNH THỨC NHẬM CHỨC CEO 💼 👑</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
