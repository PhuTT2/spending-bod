import React, { useState } from "react";
import { ProfileView, Goal } from "../types";
import { Plus, Trash2, PiggyBank, Sparkles, AlertTriangle } from "lucide-react";
import DisciplineChallenges from "./DisciplineChallenges";

interface GoalsTabProps {
  appState: ProfileView;
  onEdit: (updater: (prev: ProfileView) => ProfileView) => void;
}

const formatVND = (n: number) => new Intl.NumberFormat("vi-VN").format(n);

const getDaysLeft = (deadlineStr: string) => {
  const dl = new Date(deadlineStr);
  const today = new Date();
  dl.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.ceil((dl.getTime() - today.getTime()) / (1000 * 3600 * 24));
};

export default function GoalsTab({ appState, onEdit }: GoalsTabProps) {
  const [subTab, setSubTab] = useState<"milestones" | "challenges">("milestones");
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [formError, setFormError] = useState("");
  const [fundGoalId, setFundGoalId] = useState<string | null>(null);
  const [fundAmountInput, setFundAmountInput] = useState("");

  const activeGoals = appState.profile.active_goals;
  const history = appState.history;

  const updateGoals = (goals: Goal[]) => onEdit((prev) => ({ ...prev, profile: { ...prev.profile, active_goals: goals } }));

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetAmount.trim() || !deadline) {
      setFormError("Điền đầy đủ thông tin bắt buộc.");
      return;
    }
    const targetNum = parseInt(targetAmount.replace(/\D/g, ""), 10) || 0;
    if (targetNum <= 0) {
      setFormError("Số tiền mục tiêu không hợp lệ.");
      return;
    }
    const newGoal: Goal = {
      goal_id: "goal-" + Date.now(),
      title: title.trim(),
      target_amount: targetNum,
      current_amount: Math.max(0, parseInt(currentAmount.replace(/\D/g, ""), 10) || 0),
      deadline,
    };
    updateGoals([...activeGoals, newGoal]);
    setTitle(""); setTargetAmount(""); setCurrentAmount(""); setDeadline(""); setFormError(""); setIsAddingGoal(false);
  };

  const handleDeleteGoal = (goalId: string) => {
    if (!confirm("Xóa mục tiêu này?")) return;
    updateGoals(activeGoals.filter((g) => g.goal_id !== goalId));
  };

  const handleFundGoal = (goalId: string) => {
    const fundAmount = parseInt(fundAmountInput.replace(/\D/g, ""), 10) || 0;
    if (fundAmount <= 0) return alert("Số tiền không hợp lệ.");
    if (fundAmount > appState.profile.cash_balance) return alert("Không đủ tiết kiệm khả dụng.");

    updateGoals(activeGoals.map((g) => (g.goal_id === goalId ? { ...g, current_amount: Math.min(g.target_amount, g.current_amount + fundAmount) } : g)));
    onEdit((prev) => ({ ...prev, profile: { ...prev.profile, cash_balance: prev.profile.cash_balance - fundAmount } }));
    setFundGoalId(null);
    setFundAmountInput("");
  };

  const obeyedCount = history.filter((h) => h.user_action === "obeyed").length;
  const defiedCount = history.filter((h) => h.user_action === "defied").length;
  const savedByObeying = history.reduce((sum, h) => (h.approved === false && h.user_action === "obeyed" ? sum + h.amount : sum), 0);
  const wastedByDefying = history.reduce((sum, h) => (h.approved === false && h.user_action === "defied" ? sum + h.amount : sum), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-slate-900 border-4 border-black rounded-3xl p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] text-white text-center">
        <span className="text-3xl block">🎯</span>
        <h2 className="text-xl font-black uppercase tracking-tight mt-2 text-emerald-400">Mục tiêu & Thử thách</h2>
        <div className="grid grid-cols-2 gap-2 mt-5 bg-black/45 p-1 rounded-2xl max-w-xs mx-auto">
          <button onClick={() => setSubTab("milestones")} className={`py-2 px-3 rounded-xl font-black text-xs uppercase transition cursor-pointer ${subTab === "milestones" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"}`}>🎯 Mục tiêu</button>
          <button onClick={() => setSubTab("challenges")} className={`py-2 px-3 rounded-xl font-black text-xs uppercase transition cursor-pointer ${subTab === "challenges" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"}`}>🏆 Thử thách</button>
        </div>
      </div>

      {subTab === "milestones" ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base uppercase text-slate-800">Mục tiêu của bạn ({activeGoals.length})</h3>
            {!isAddingGoal && (
              <button onClick={() => setIsAddingGoal(true)} className="px-4 py-2 bg-indigo-600 hover:bg-yellow-300 text-white hover:text-black border-2 border-black font-black text-xs uppercase rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer flex items-center gap-1.5">
                <Plus className="w-4 h-4" /><span>Tạo mới</span>
              </button>
            )}
          </div>

          {isAddingGoal && (
            <form onSubmit={handleCreateGoal} className="bg-white border-4 border-black rounded-3xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
              <div className="flex items-center justify-between border-b-2 border-dashed border-black pb-3">
                <span className="text-xs font-black uppercase text-indigo-700">Mục tiêu mới</span>
                <button type="button" onClick={() => setIsAddingGoal(false)} className="text-xs font-black text-rose-500 hover:underline cursor-pointer">Đóng</button>
              </div>
              {formError && <p className="text-rose-500 text-xs font-bold">⚠️ {formError}</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase text-gray-700">Tên mục tiêu *</label>
                  <input type="text" required placeholder="Ví dụ: Mua laptop" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3.5 py-3 bg-white border-2 border-black rounded-xl font-semibold outline-none text-xs" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase text-gray-700">Thời hạn *</label>
                  <input type="date" required value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full px-3.5 py-3 bg-white border-2 border-black rounded-xl font-mono outline-none text-xs" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase text-gray-700">Số tiền mục tiêu *</label>
                  <input type="text" required placeholder="30.000.000" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} className="w-full px-3.5 py-3 bg-white border-2 border-black rounded-xl font-mono text-xs font-bold outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase text-gray-700">Đã có sẵn</label>
                  <input type="text" placeholder="0" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} className="w-full px-3.5 py-3 bg-white border-2 border-black rounded-xl font-mono text-xs font-bold outline-none" />
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-yellow-300 text-white hover:text-black border-2 border-black font-black uppercase text-xs rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 cursor-pointer transition-all">Tạo mục tiêu 🚀</button>
            </form>
          )}

          {activeGoals.length === 0 ? (
            <div className="text-center py-16 bg-white border-4 border-black rounded-3xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] text-black">
              <span className="text-5xl block">🏝️</span>
              <h3 className="font-black text-lg uppercase mt-4">Chưa có mục tiêu nào</h3>
              <button onClick={() => setIsAddingGoal(true)} className="mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-yellow-300 hover:text-black text-white border-2 border-black font-black uppercase text-xs rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer">Tạo mục tiêu đầu tiên 🎯</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeGoals.map((g) => {
                const percent = Math.min(100, Math.round((g.current_amount / g.target_amount) * 100)) || 0;
                const isCompleted = g.current_amount >= g.target_amount;
                const isFunding = fundGoalId === g.goal_id;
                const daysLeft = getDaysLeft(g.deadline);

                return (
                  <div key={g.goal_id} className="bg-white border-4 border-black rounded-3xl p-5 md:p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between text-black relative">
                    {isCompleted && (
                      <div className="absolute right-6 top-6 w-16 h-16 rounded-full border-4 border-dashed border-emerald-500 flex items-center justify-center rotate-12 bg-white/90 z-10">
                        <span className="text-[9px] font-black text-emerald-600 text-center leading-tight uppercase">ĐẠT<br />🏆</span>
                      </div>
                    )}
                    <div className="pb-3 border-b border-gray-150 border-dashed mb-4">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-black text-sm leading-tight uppercase text-slate-900">{g.title}</h4>
                        <span className="font-mono text-indigo-700 text-xl font-black shrink-0">{percent}%</span>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-mono bg-slate-50 p-2 rounded-xl">
                        <div><span className="text-gray-400 block uppercase">Hạn:</span><strong className="text-slate-800">{new Date(g.deadline).toLocaleDateString("vi-VN")}</strong></div>
                        <div><span className="text-gray-400 block uppercase">Còn lại:</span><strong className={daysLeft >= 0 ? "text-slate-800" : "text-rose-600"}>{daysLeft >= 0 ? `${daysLeft} ngày` : "Quá hạn"}</strong></div>
                      </div>
                      <div className="w-full mt-4">
                        <div className="w-full h-4.5 bg-slate-100 border-2 border-black rounded-full overflow-hidden relative flex items-center justify-center">
                          <div className={`h-full absolute left-0 top-0 ${isCompleted ? "bg-emerald-400" : "bg-indigo-500"}`} style={{ width: `${percent}%` }} />
                          <span className="absolute text-[9px] font-extrabold text-black font-mono">{formatVND(g.current_amount)}đ / {formatVND(g.target_amount)}đ</span>
                        </div>
                      </div>
                    </div>

                    {isFunding ? (
                      <div className="bg-yellow-50 border-2 border-black p-4 rounded-2xl space-y-3">
                        <div className="flex gap-2">
                          <input type="text" value={fundAmountInput} onChange={(e) => setFundAmountInput(e.target.value)} placeholder="Số tiền" className="flex-1 px-3 py-2 bg-white border border-black rounded-lg text-xs font-bold font-mono outline-none" />
                          <button onClick={() => handleFundGoal(g.goal_id)} className="px-3 bg-emerald-400 hover:bg-emerald-500 border-2 border-black text-xs font-black uppercase rounded-lg cursor-pointer">Góp</button>
                        </div>
                        <button onClick={() => setFundGoalId(null)} className="text-rose-500 underline font-black text-[10px] cursor-pointer">Hủy</button>
                      </div>
                    ) : (
                      <div className="flex gap-2.5 mt-2">
                        {!isCompleted && (
                          <button onClick={() => { setFundGoalId(g.goal_id); setFundAmountInput(""); }} className="flex-1 py-2.5 bg-emerald-400 hover:bg-yellow-300 text-black border-2 border-black font-black text-xs uppercase rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer flex items-center justify-center gap-1.5">
                            <PiggyBank className="w-4.5 h-4.5" /><span>Góp tiền</span>
                          </button>
                        )}
                        <button onClick={() => handleDeleteGoal(g.goal_id)} className="p-2.5 border-2 border-black rounded-xl hover:bg-rose-100 cursor-pointer text-gray-400 hover:text-rose-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="bg-white border-4 border-black rounded-3xl p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] text-black">
            <h4 className="font-black text-sm uppercase border-b-2 border-black pb-3.5 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" /><span>Tác động từ quyết định</span>
            </h4>
            {history.length === 0 ? (
              <p className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-gray-500 font-bold">Chưa có dữ liệu — đệ trình đề xuất đầu tiên để xem tác động.</p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="border border-black p-3 bg-emerald-50 rounded-2xl"><span className="text-[9px] font-black text-emerald-800 uppercase block">Tuân thủ</span><strong className="text-lg font-black text-emerald-700 font-mono block">{obeyedCount}</strong></div>
                  <div className="border border-black p-3 bg-amber-50 rounded-2xl"><span className="text-[9px] font-black text-amber-800 uppercase block">Bất chấp</span><strong className="text-lg font-black text-amber-700 font-mono block">{defiedCount}</strong></div>
                  <div className="border border-black p-3 bg-indigo-50 rounded-2xl"><span className="text-[9px] font-black text-indigo-600 uppercase block">Tiết kiệm được</span><strong className="text-lg font-black text-indigo-700 font-mono block">+{formatVND(savedByObeying)}đ</strong></div>
                </div>
                {wastedByDefying > 0 && (
                  <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed text-slate-700 font-semibold">Bạn đã chi <strong className="text-rose-600 font-black">{formatVND(wastedByDefying)}đ</strong> bất chấp HĐQT bác bỏ — điều này làm chậm tiến độ mục tiêu.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <DisciplineChallenges appState={appState} onEdit={onEdit} />
      )}
    </div>
  );
}
