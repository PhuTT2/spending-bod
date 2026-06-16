import React, { useState } from "react";
import { UserFinancialState, FinancialProfile } from "../types";
import { User, ShieldCheck, Heart, Edit3, Save, CheckCircle, HelpCircle } from "lucide-react";

interface UserProfileCardProps {
  userState: UserFinancialState;
  onSave: (updatedState: {
    income: number;
    savings: number;
    investments: number;
    financialProfile: FinancialProfile;
  }) => void;
}

export default function UserProfileCard({ userState, onSave }: UserProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  // Profile metadata
  const [username, setUsername] = useState(userState.financialProfile?.username || "CEO");
  const [income, setIncome] = useState(userState.income.toString());
  const [savingsAmt, setSavingsAmt] = useState(userState.savings.toString());
  const [investmentsAmt, setInvestmentsAmt] = useState((userState.investments ?? 0).toString());

  // Product Holdings
  const [hasBnpl, setHasBnpl] = useState(userState.financialProfile?.product_holdings?.bnpl.has ?? false);
  const [limitBnpl, setLimitBnpl] = useState((userState.financialProfile?.product_holdings?.bnpl.limit ?? 5000000).toString());

  const [hasSavings, setHasSavings] = useState(userState.financialProfile?.product_holdings?.savings.has ?? false);
  const [balanceSavings, setBalanceSavings] = useState((userState.financialProfile?.product_holdings?.savings.balance ?? 15000000).toString());

  const [hasSecurities, setHasSecurities] = useState(userState.financialProfile?.product_holdings?.securities.has ?? false);
  const [balanceSecurities, setBalanceSecurities] = useState((userState.financialProfile?.product_holdings?.securities.balance ?? 12000000).toString());

  const [hasLifeIns, setHasLifeIns] = useState(userState.financialProfile?.product_holdings?.life_insurance.has ?? false);
  const [premiumLifeIns, setPremiumLifeIns] = useState((userState.financialProfile?.product_holdings?.life_insurance.premium ?? 8000000).toString());

  const [hasNonLifeIns, setHasNonLifeIns] = useState(userState.financialProfile?.product_holdings?.non_life_insurance.has ?? false);
  const [nameNonLifeIns, setNameNonLifeIns] = useState(userState.financialProfile?.product_holdings?.non_life_insurance.name || "Bảo hiểm Sức Khỏe ZaloPay");

  // Lifestyle Preferences
  const [travelPref, setTravelPref] = useState(userState.financialProfile?.lifestyle_preference?.travel ?? 3);
  const [shoppingPref, setShoppingPref] = useState(userState.financialProfile?.lifestyle_preference?.shopping ?? 3);
  const [entertainmentPref, setEntertainmentPref] = useState(userState.financialProfile?.lifestyle_preference?.entertainment ?? 3);
  const [savingPref, setSavingPref] = useState(userState.financialProfile?.lifestyle_preference?.saving ?? 3);
  const [investingPref, setInvestingPref] = useState(userState.financialProfile?.lifestyle_preference?.investing ?? 3);
  const [safetyPref, setSafetyPref] = useState(userState.financialProfile?.lifestyle_preference?.safety ?? 3);

  const getPersonalityLabel = () => {
    const prefs = [
      { name: "Chiến Thần Xê Dịch ✈️", score: travelPref },
      { name: "Hán Tử Mua Sắm 🛍️", score: shoppingPref },
      { name: "Đại Sứ Hưởng Thụ Giải Trí 🍿", score: entertainmentPref },
      { name: "Sứ Giả Tích Lũy Thép 🐷", score: savingPref },
      { name: "Cá Mập Đu Đỉnh Đầu Tư 📈", score: investingPref },
      { name: "Thánh An Toàn Phòng Thủ 🛡️", score: safetyPref }
    ];
    
    let best = prefs[0];
    for (const p of prefs) {
      if (p.score > best.score) {
        best = p;
      }
    }
    
    if (best.score === 3 && travelPref === 3 && shoppingPref === 3 && entertainmentPref === 3 && savingPref === 3 && investingPref === 3 && safetyPref === 3) {
      return "CEO Cân Bằng Trí Tuệ 🧠";
    }
    
    return best.name;
  };

  const handleSaveClick = () => {
    const inc = Math.max(0, parseFloat(income) || 0);
    const sav = Math.max(0, parseFloat(savingsAmt) || 0);
    const inv = Math.max(0, parseFloat(investmentsAmt) || 0);

    const lifestyle_preference = {
      travel: travelPref,
      shopping: shoppingPref,
      entertainment: entertainmentPref,
      saving: savingPref,
      investing: investingPref,
      safety: safetyPref
    };

    const financialProfile: FinancialProfile = {
      profile_id: userState.financialProfile?.profile_id || "prof_v1_xyz",
      user_id: username.trim() || "CEO",
      version: (userState.financialProfile?.version || 1) + 1,
      username: username.trim() || "CEO",
      monthly_income: inc,
      monthly_fixed_expenses: inc * 0.3,
      cash_balance: sav + inv,
      emergency_fund: sav,
      risk_tolerance: userState.financialProfile?.risk_tolerance || "medium",
      lifestyle_preference,
      financial_personality: getPersonalityLabel(),
      product_holdings: {
        bnpl: { has: hasBnpl, limit: hasBnpl ? (parseFloat(limitBnpl) || 0) : 0, provider: hasBnpl ? "ZaloPay PayLater" : null },
        savings: { has: hasSavings, balance: hasSavings ? (parseFloat(balanceSavings) || 0) : 0 },
        securities: { has: hasSecurities, balance: hasSecurities ? (parseFloat(balanceSecurities) || 0) : 0 },
        life_insurance: { has: hasLifeIns, premium: hasLifeIns ? (parseFloat(premiumLifeIns) || 0) : 0 },
        non_life_insurance: { has: hasNonLifeIns, name: hasNonLifeIns ? nameNonLifeIns : null }
      },
      active_goals: userState.financialProfile?.active_goals || [],
      discipline_score: userState.disciplineScore,
      created_at: userState.financialProfile?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onSave({
      income: inc,
      savings: sav,
      investments: inv,
      financialProfile,
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-3xl border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black" id="user-profile-card">
      <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-4">
        <h3 className="font-black uppercase text-sm flex items-center gap-2">
          <User className="w-4.5 h-4.5 text-indigo-600 animate-pulse" /> 📁 HỒ SƠ TÀI CHÍNH CEO
        </h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs bg-slate-100 hover:bg-yellow-300 border-2 border-black font-black uppercase px-2.5 py-1 rounded-xl shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
        >
          {isEditing ? "HỦY" : "CHỈNH SỬA"}
        </button>
      </div>

      {!isEditing ? (
        <div className="space-y-3.5">
          {/* Default view */}
          <div className="flex justify-between items-center bg-indigo-50 border-2 border-black p-3 rounded-2xl">
            <div>
              <span className="text-[10px] font-black tracking-widest text-indigo-700 block uppercase leading-none">NHÂN CÁCH</span>
              <strong className="text-sm font-black text-slate-800 uppercase block mt-1">
                {userState.financialProfile?.financial_personality || "CEO ĐÚNG ĐẮN"}
              </strong>
            </div>
            <span className="text-3xl">👤</span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">CEO DANH XƯNG</span>
            <span className="font-bold text-sm text-black">{userState.financialProfile?.username || "Chưa thiết lập"}</span>
          </div>

          {/* Holdings summary list */}
          <div className="pt-2 border-t border-gray-100 space-y-2">
            <span className="text-[10px] font-black text-indigo-600 block uppercase tracking-wider">SẢN PHẨM ZALOPAY ĐANG SỞ HỮU</span>
            
            <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
              <div className={`p-2 rounded-xl border border-black flex items-center justify-between ${userState.financialProfile?.product_holdings?.bnpl.has ? "bg-emerald-50 text-emerald-990" : "bg-gray-50 text-gray-400 opacity-60"}`}>
                <span>HẠN MỨC BNPL CRÉDIT</span>
                <span>{userState.financialProfile?.product_holdings?.bnpl.has ? "✔️" : "❌"}</span>
              </div>
              <div className={`p-2 rounded-xl border border-black flex items-center justify-between ${userState.financialProfile?.product_holdings?.savings.has ? "bg-emerald-50 text-emerald-990" : "bg-gray-50 text-gray-400 opacity-60"}`}>
                <span>TIẾT KIỆM TÍCH LŨY</span>
                <span>{userState.financialProfile?.product_holdings?.savings.has ? "✔️" : "❌"}</span>
              </div>
              <div className={`p-2 rounded-xl border border-black flex items-center justify-between ${userState.financialProfile?.product_holdings?.securities.has ? "bg-emerald-50 text-emerald-990" : "bg-gray-50 text-gray-400 opacity-60"}`}>
                <span>ĐẦU TƯ CHỨNG KHOÁN</span>
                <span>{userState.financialProfile?.product_holdings?.securities.has ? "✔️" : "❌"}</span>
              </div>
              <div className={`p-2 rounded-xl border border-black flex items-center justify-between ${(userState.financialProfile?.product_holdings?.life_insurance.has || userState.financialProfile?.product_holdings?.non_life_insurance.has) ? "bg-emerald-50 text-emerald-990" : "bg-gray-50 text-gray-400 opacity-60"}`}>
                <span>BẢO HIỂM AN TÂM</span>
                <span>{(userState.financialProfile?.product_holdings?.life_insurance.has || userState.financialProfile?.product_holdings?.non_life_insurance.has) ? "✔️" : "❌"}</span>
              </div>
            </div>
          </div>

          {/* Preferences display */}
          <div className="pt-2 border-t border-gray-100 space-y-1.5">
            <span className="text-[10px] font-black text-indigo-600 block uppercase tracking-wider">Mức độ ưu tiên lối sống</span>
            <div className="space-y-1 text-xs font-bold text-gray-700">
              <div className="flex justify-between">
                <span>✈️ Du lịch (Travel)</span>
                <span>{"⭐".repeat(userState.financialProfile?.lifestyle_preference.travel || 3)}</span>
              </div>
              <div className="flex justify-between">
                <span>🛍️ Mua sắm (Shopping)</span>
                <span>{"⭐".repeat(userState.financialProfile?.lifestyle_preference.shopping || 3)}</span>
              </div>
              <div className="flex justify-between">
                <span>🍿 Giải trí (Entertainment)</span>
                <span>{"⭐".repeat(userState.financialProfile?.lifestyle_preference.entertainment || 3)}</span>
              </div>
              <div className="flex justify-between">
                <span>🐷 Tiết kiệm (Saving)</span>
                <span>{"⭐".repeat(userState.financialProfile?.lifestyle_preference.saving || 3)}</span>
              </div>
              <div className="flex justify-between">
                <span>📈 Đầu tư (Investing)</span>
                <span>{"⭐".repeat(userState.financialProfile?.lifestyle_preference.investing || 3)}</span>
              </div>
              <div className="flex justify-between">
                <span>🛡️ An tâm (Safety)</span>
                <span>{"⭐".repeat(userState.financialProfile?.lifestyle_preference.safety || 3)}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          {/* Editorial / Editing view */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-gray-600 block">Tên hiển thị (username)</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border-2 border-black rounded-xl text-xs font-black"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-gray-600 block">Thu nhập mỗi tháng (Income)</label>
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border-2 border-black rounded-xl font-mono text-xs font-black"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-gray-600 block">Tiết kiệm hiện hữu (Savings)</label>
            <input
              type="number"
              value={savingsAmt}
              onChange={(e) => setSavingsAmt(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border-2 border-black rounded-xl font-mono text-xs font-black"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-gray-600 block">Chứng khoán đã mua (Investments)</label>
            <input
              type="number"
              value={investmentsAmt}
              onChange={(e) => setInvestmentsAmt(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border-2 border-black rounded-xl font-mono text-xs font-black"
            />
          </div>

          <div className="space-y-3.5 pt-2 border-t border-gray-105 border-t-2 border-black">
            <span className="text-[10px] font-black text-indigo-700 block uppercase">Điều chỉnh Sản phẩm ZaloPay</span>
            
            <label className="flex items-center gap-2 font-black text-xs cursor-pointer">
              <input type="checkbox" checked={hasBnpl} onChange={(e) => setHasBnpl(e.target.checked)} className="cursor-pointer" />
              <span>Ví Trả Sau (BNPL) 💳</span>
            </label>
            {hasBnpl && (
              <input type="number" value={limitBnpl} onChange={(e) => setLimitBnpl(e.target.value)} className="w-full px-3 py-1 bg-white border-2 border-black rounded-xl text-xs font-mono ml-5" />
            )}

            <label className="flex items-center gap-2 font-black text-xs cursor-pointer">
              <input type="checkbox" checked={hasSavings} onChange={(e) => setHasSavings(e.target.checked)} className="cursor-pointer" />
              <span>Gửi Tiết Kiệm Tích Lũy 🐷</span>
            </label>
            {hasSavings && (
              <input type="number" value={balanceSavings} onChange={(e) => setBalanceSavings(e.target.value)} className="w-full px-3 py-1 bg-white border-2 border-black rounded-xl text-xs font-mono ml-5" />
            )}

            <label className="flex items-center gap-2 font-black text-xs cursor-pointer">
              <input type="checkbox" checked={hasSecurities} onChange={(e) => setHasSecurities(e.target.checked)} className="cursor-pointer" />
              <span>Tích Sản Chứng Khoán 📈</span>
            </label>
            {hasSecurities && (
              <input type="number" value={balanceSecurities} onChange={(e) => setBalanceSecurities(e.target.value)} className="w-full px-3 py-1 bg-white border-2 border-black rounded-xl text-xs font-mono ml-5" />
            )}

            <label className="flex items-center gap-2 font-black text-xs cursor-pointer">
              <input type="checkbox" checked={hasLifeIns} onChange={(e) => setHasLifeIns(e.target.checked)} className="cursor-pointer" />
              <span>Bảo hiểm nhân thọ 🛡️</span>
            </label>
            {hasLifeIns && (
              <input type="number" value={premiumLifeIns} onChange={(e) => setPremiumLifeIns(e.target.value)} className="w-full px-3 py-1 bg-white border-2 border-black rounded-xl text-xs font-mono ml-5" />
            )}

            <label className="flex items-center gap-2 font-black text-xs cursor-pointer">
              <input type="checkbox" checked={hasNonLifeIns} onChange={(e) => setHasNonLifeIns(e.target.checked)} className="cursor-pointer" />
              <span>Bảo hiểm phi nhân thọ 🏥</span>
            </label>
            {hasNonLifeIns && (
              <input type="text" value={nameNonLifeIns} onChange={(e) => setNameNonLifeIns(e.target.value)} className="w-full px-3 py-1 bg-white border-2 border-black rounded-xl text-xs font-sans font-bold ml-5" />
            )}
          </div>

          <div className="space-y-3 pt-2 border-t-2 border-black">
            <span className="text-[10px] font-black text-indigo-700 block uppercase">Điều chỉnh ưu tiên lối sống (1 - 5)</span>
            
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px] font-bold uppercase text-gray-500">
                <span>✈️ Xê dịch (Travel)</span>
                <span>{travelPref}/5</span>
              </div>
              <input type="range" min="1" max="5" value={travelPref} onChange={(e) => setTravelPref(parseInt(e.target.value))} className="accent-indigo-600 h-1" />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px] font-bold uppercase text-gray-500">
                <span>🛍️ Mua sắm (Shopping)</span>
                <span>{shoppingPref}/5</span>
              </div>
              <input type="range" min="1" max="5" value={shoppingPref} onChange={(e) => setShoppingPref(parseInt(e.target.value))} className="accent-indigo-600 h-1" />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px] font-bold uppercase text-gray-500">
                <span>🍿 Ăn chơi (Entertainment)</span>
                <span>{entertainmentPref}/5</span>
              </div>
              <input type="range" min="1" max="5" value={entertainmentPref} onChange={(e) => setEntertainmentPref(parseInt(e.target.value))} className="accent-indigo-600 h-1" />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px] font-bold uppercase text-gray-500">
                <span>🐷 Tiết kiệm (Saving)</span>
                <span>{savingPref}/5</span>
              </div>
              <input type="range" min="1" max="5" value={savingPref} onChange={(e) => setSavingPref(parseInt(e.target.value))} className="accent-indigo-600 h-1" />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px] font-bold uppercase text-gray-500">
                <span>📈 Đầu tư (Investing)</span>
                <span>{investingPref}/5</span>
              </div>
              <input type="range" min="1" max="5" value={investingPref} onChange={(e) => setInvestingPref(parseInt(e.target.value))} className="accent-indigo-600 h-1" />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px] font-bold uppercase text-gray-500">
                <span>🛡️ Phòng thủ (Safety)</span>
                <span>{safetyPref}/5</span>
              </div>
              <input type="range" min="1" max="5" value={safetyPref} onChange={(e) => setSafetyPref(parseInt(e.target.value))} className="accent-indigo-600 h-1" />
            </div>
          </div>

          <button
            onClick={handleSaveClick}
            className="w-full mt-4 py-3 bg-emerald-600 hover:bg-yellow-300 text-white hover:text-black border-2 border-black rounded-xl font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" /> <span>LƯU CẬP NHẬT THỦ CÔNG</span>
          </button>
        </div>
      )}
    </div>
  );
}
