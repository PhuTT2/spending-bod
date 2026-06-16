import React, { useState } from "react";
import { FinancialProfile, ProfileComputed } from "../types";
import { User, Save } from "lucide-react";

interface UserProfileCardProps {
  profile: FinancialProfile;
  computed: ProfileComputed;
  onSave: (profile: FinancialProfile) => void;
}

export default function UserProfileCard({ profile, computed, onSave }: UserProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const [displayName, setDisplayName] = useState(profile.display_name);
  const [income, setIncome] = useState(profile.monthly_income.toString());
  const [cashBalance, setCashBalance] = useState(profile.cash_balance.toString());
  const [investments, setInvestments] = useState(profile.investments_balance.toString());

  const [hasBnpl, setHasBnpl] = useState(profile.product_holdings.bnpl.has);
  const [limitBnpl, setLimitBnpl] = useState(profile.product_holdings.bnpl.limit.toString());
  const [hasSavings, setHasSavings] = useState(profile.product_holdings.savings.has);
  const [balanceSavings, setBalanceSavings] = useState(profile.product_holdings.savings.balance.toString());
  const [hasSecurities, setHasSecurities] = useState(profile.product_holdings.securities.has);
  const [hasLifeIns, setHasLifeIns] = useState(profile.product_holdings.life_insurance.has);

  const [prefs, setPrefs] = useState(profile.lifestyle_preference);

  const handleSaveClick = () => {
    onSave({
      ...profile,
      display_name: displayName.trim() || "Sếp Tổng",
      monthly_income: Math.max(0, parseFloat(income) || 0),
      cash_balance: Math.max(0, parseFloat(cashBalance) || 0),
      investments_balance: Math.max(0, parseFloat(investments) || 0),
      lifestyle_preference: prefs,
      product_holdings: {
        ...profile.product_holdings,
        bnpl: { has: hasBnpl, limit: hasBnpl ? parseFloat(limitBnpl) || 0 : 0, provider: hasBnpl ? "ZaloPay PayLater" : null },
        savings: { has: hasSavings, balance: hasSavings ? parseFloat(balanceSavings) || 0 : 0 },
        securities: { has: hasSecurities, balance: profile.product_holdings.securities.balance },
        life_insurance: { has: hasLifeIns, premium: profile.product_holdings.life_insurance.premium },
      },
    });
    setIsEditing(false);
  };

  const prefRows: { label: string; key: keyof typeof prefs }[] = [
    { label: "✈️ Du lịch", key: "travel" },
    { label: "🛍️ Mua sắm", key: "shopping" },
    { label: "🍿 Giải trí", key: "entertainment" },
    { label: "🐷 Tiết kiệm", key: "saving" },
    { label: "📈 Đầu tư", key: "investing" },
    { label: "🛡️ An toàn", key: "safety" },
  ];

  return (
    <div className="bg-white rounded-3xl border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black">
      <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-4">
        <h3 className="font-black uppercase text-sm flex items-center gap-2"><User className="w-4.5 h-4.5 text-indigo-600" /> Hồ sơ</h3>
        <button onClick={() => setIsEditing(!isEditing)} className="text-xs bg-slate-100 hover:bg-yellow-300 border-2 border-black font-black uppercase px-2.5 py-1 rounded-xl cursor-pointer">
          {isEditing ? "Hủy" : "Sửa"}
        </button>
      </div>

      {!isEditing ? (
        <div className="space-y-3.5">
          <div className="flex justify-between items-center bg-indigo-50 border-2 border-black p-3 rounded-2xl">
            <div>
              <span className="text-[10px] font-black tracking-widest text-indigo-700 block uppercase">Nhân cách</span>
              <strong className="text-sm font-black text-slate-800 uppercase block mt-1">{computed.personality_label}</strong>
            </div>
            <span className="text-3xl">👤</span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Tên</span>
            <span className="font-bold text-sm text-black">{profile.display_name}</span>
          </div>

          <div className="pt-2 border-t border-gray-100 space-y-2">
            <span className="text-[10px] font-black text-indigo-600 block uppercase">Sản phẩm đang dùng</span>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
              <div className={`p-2 rounded-xl border border-black flex items-center justify-between ${profile.product_holdings.bnpl.has ? "bg-emerald-50" : "bg-gray-50 text-gray-400 opacity-60"}`}>
                <span>BNPL</span><span>{profile.product_holdings.bnpl.has ? "✔️" : "❌"}</span>
              </div>
              <div className={`p-2 rounded-xl border border-black flex items-center justify-between ${profile.product_holdings.savings.has ? "bg-emerald-50" : "bg-gray-50 text-gray-400 opacity-60"}`}>
                <span>Tiết kiệm</span><span>{profile.product_holdings.savings.has ? "✔️" : "❌"}</span>
              </div>
              <div className={`p-2 rounded-xl border border-black flex items-center justify-between ${profile.product_holdings.securities.has ? "bg-emerald-50" : "bg-gray-50 text-gray-400 opacity-60"}`}>
                <span>Chứng khoán</span><span>{profile.product_holdings.securities.has ? "✔️" : "❌"}</span>
              </div>
              <div className={`p-2 rounded-xl border border-black flex items-center justify-between ${(profile.product_holdings.life_insurance.has || profile.product_holdings.non_life_insurance.has) ? "bg-emerald-50" : "bg-gray-50 text-gray-400 opacity-60"}`}>
                <span>Bảo hiểm</span><span>{(profile.product_holdings.life_insurance.has || profile.product_holdings.non_life_insurance.has) ? "✔️" : "❌"}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 space-y-1.5">
            <span className="text-[10px] font-black text-indigo-600 block uppercase">Gu sống</span>
            <div className="space-y-1 text-xs font-bold text-gray-700">
              {prefRows.map((row) => (
                <div key={row.key} className="flex justify-between">
                  <span>{row.label}</span>
                  <span>{"⭐".repeat(profile.lifestyle_preference[row.key])}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-gray-600 block">Tên</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full px-3 py-1.5 bg-slate-50 border-2 border-black rounded-xl text-xs font-black" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-gray-600 block">Thu nhập/tháng</label>
            <input type="number" value={income} onChange={(e) => setIncome(e.target.value)} className="w-full px-3 py-1.5 bg-slate-50 border-2 border-black rounded-xl font-mono text-xs font-black" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-gray-600 block">Tiết kiệm hiện có</label>
            <input type="number" value={cashBalance} onChange={(e) => setCashBalance(e.target.value)} className="w-full px-3 py-1.5 bg-slate-50 border-2 border-black rounded-xl font-mono text-xs font-black" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-gray-600 block">Đang đầu tư</label>
            <input type="number" value={investments} onChange={(e) => setInvestments(e.target.value)} className="w-full px-3 py-1.5 bg-slate-50 border-2 border-black rounded-xl font-mono text-xs font-black" />
          </div>

          <div className="space-y-3 pt-2 border-t-2 border-black">
            <span className="text-[10px] font-black text-indigo-700 block uppercase">Sản phẩm</span>
            <label className="flex items-center gap-2 font-black text-xs cursor-pointer">
              <input type="checkbox" checked={hasBnpl} onChange={(e) => setHasBnpl(e.target.checked)} /> <span>Ví trả sau 💳</span>
            </label>
            {hasBnpl && <input type="number" value={limitBnpl} onChange={(e) => setLimitBnpl(e.target.value)} className="w-full px-3 py-1 bg-white border-2 border-black rounded-xl text-xs font-mono ml-5" />}
            <label className="flex items-center gap-2 font-black text-xs cursor-pointer">
              <input type="checkbox" checked={hasSavings} onChange={(e) => setHasSavings(e.target.checked)} /> <span>Tiết kiệm tích lũy 🐷</span>
            </label>
            {hasSavings && <input type="number" value={balanceSavings} onChange={(e) => setBalanceSavings(e.target.value)} className="w-full px-3 py-1 bg-white border-2 border-black rounded-xl text-xs font-mono ml-5" />}
            <label className="flex items-center gap-2 font-black text-xs cursor-pointer">
              <input type="checkbox" checked={hasSecurities} onChange={(e) => setHasSecurities(e.target.checked)} /> <span>Chứng khoán 📈</span>
            </label>
            <label className="flex items-center gap-2 font-black text-xs cursor-pointer">
              <input type="checkbox" checked={hasLifeIns} onChange={(e) => setHasLifeIns(e.target.checked)} /> <span>Bảo hiểm nhân thọ 🛡️</span>
            </label>
          </div>

          <div className="space-y-3 pt-2 border-t-2 border-black">
            <span className="text-[10px] font-black text-indigo-700 block uppercase">Gu sống (1-5)</span>
            {prefRows.map((row) => (
              <div key={row.key} className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-bold uppercase text-gray-500">
                  <span>{row.label}</span><span>{prefs[row.key]}/5</span>
                </div>
                <input type="range" min="1" max="5" value={prefs[row.key]} onChange={(e) => setPrefs({ ...prefs, [row.key]: parseInt(e.target.value) })} className="accent-indigo-600 h-1" />
              </div>
            ))}
          </div>

          <button onClick={handleSaveClick} className="w-full mt-4 py-3 bg-emerald-600 hover:bg-yellow-300 text-white hover:text-black border-2 border-black rounded-xl font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer">
            <Save className="w-4 h-4" /> <span>Lưu</span>
          </button>
        </div>
      )}
    </div>
  );
}
