import React, { useState } from "react";
import { UserFinancialState, FinancialProfile } from "../types";
import { Plus, Trash2, Calendar, Target, PiggyBank, PlusCircle, ArrowRight, Sparkles, Trophy, Heart, TrendingUp, Info, AlertTriangle, CheckCircle } from "lucide-react";
import DisciplineChallenges from "./DisciplineChallenges";

interface GoalsTabProps {
  userState: UserFinancialState;
  onUpdateUserState: (updater: (prev: UserFinancialState) => UserFinancialState) => void;
}

export default function GoalsTab({ userState, onUpdateUserState }: GoalsTabProps) {
  const [subTab, setSubTab] = useState<"milestones" | "challenges">("milestones");
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  
  // New goal form fields
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [formError, setFormError] = useState("");

  // Target goal funding field
  const [fundGoalId, setFundGoalId] = useState<string | null>(null);
  const [fundAmountInput, setFundAmountInput] = useState("");

  const activeGoals = userState.financialProfile?.active_goals || [];
  const history = userState.history || [];

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetAmount.trim() || !deadline) {
      setFormError("Vui lòng điền đầy đủ các thông tin bắt buộc.");
      return;
    }

    const targetNum = parseInt(targetAmount.replace(/\D/g, ""), 10) || 0;
    const startNum = parseInt(currentAmount.replace(/\D/g, ""), 10) || 0;

    if (targetNum <= 0) {
      setFormError("Số tiền mục tiêu không hợp lệ.");
      return;
    }

    const newGoal = {
      goal_id: "goal-" + Date.now(),
      title: title.trim(),
      target_amount: targetNum,
      current_amount: startNum,
      deadline: deadline
    };

    onUpdateUserState((prev) => {
      const currentProfile = prev.financialProfile || {} as FinancialProfile;
      const currentGoals = currentProfile.active_goals || [];
      const updatedProfile = {
        ...currentProfile,
        active_goals: [...currentGoals, newGoal]
      };
      
      return {
        ...prev,
        financialProfile: updatedProfile
      };
    });

    // Reset form
    setTitle("");
    setTargetAmount("");
    setCurrentAmount("");
    setDeadline("");
    setFormError("");
    setIsAddingGoal(false);
  };

  const handleDeleteGoal = (goalId: string) => {
    if (!confirm("CEO chắc chắn muốn xóa mục tiêu tích lũy nạp năng lượng này?")) return;

    onUpdateUserState((prev) => {
      const currentProfile = prev.financialProfile || {} as FinancialProfile;
      const currentGoals = currentProfile.active_goals || [];
      const updatedGoals = currentGoals.filter((g) => g.goal_id !== goalId);
      
      return {
        ...prev,
        financialProfile: {
          ...currentProfile,
          active_goals: updatedGoals
        }
      };
    });
  };

  const handleFundGoal = (goalId: string) => {
    const fundAmount = parseInt(fundAmountInput.replace(/\D/g, ""), 10) || 0;
    if (fundAmount <= 0) {
      alert("Số tiền bồi đáp bảo toàn quỹ tích luỹ không hợp lý!");
      return;
    }

    if (fundAmount > userState.savings) {
      alert("Quỹ tích sản tiết kiệm khả dụng tạm thời không đủ cho khoản trích chuyển này!");
      return;
    }

    onUpdateUserState((prev) => {
      const currentProfile = prev.financialProfile || {} as FinancialProfile;
      const currentGoals = currentProfile.active_goals || [];
      
      const updatedGoals = currentGoals.map((g) => {
        if (g.goal_id === goalId) {
          return {
            ...g,
            current_amount: Math.min(g.target_amount, g.current_amount + fundAmount)
          };
        }
        return g;
      });

      return {
        ...prev,
        savings: Math.max(0, prev.savings - fundAmount),
        financialProfile: {
          ...currentProfile,
          active_goals: updatedGoals
        }
      };
    });

    setFundGoalId(null);
    setFundAmountInput("");
  };

  // Helper to format currency
  const formatVND = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  // Calculate days left helper
  const getDaysLeft = (deadlineStr: string) => {
    const dlDate = new Date(deadlineStr);
    const today = new Date();
    dlDate.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    const diff = dlDate.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 36500 / 365 / 100 / 24)); // precise days calculation
    const realDays = Math.ceil(diff / (1000 * 3600 * 24));
    return realDays;
  };

  // Get Encouraging motivational feedback
  const getEncouragement = (percent: number, shortage: number) => {
    if (percent >= 100) return "Đại thắng hoàn mỹ! Mục tiêu tuyệt vời của sếp đã chính thức cán đích vinh quang, HĐQT bái phục! 👑🏆";
    if (percent >= 75) return "Đồng hành bứt tốc! Sếp chỉ còn thiếu một chút thặng dư thôi là gặt hái quả ngọt rồi, tiến lên! 🎉🔥";
    if (percent >= 40) return "Tích lũy vững tin! Hơn một nửa hành trình gian khó đã ở lại phía sau, sếp đang làm rất tốt! 🐷📈";
    if (percent > 0) return "Hạt giống nảy mầm! Mỗi đồng tích lũy nhỏ dần đắp xây tòa lâu đài thắt lưng buộc bụng vững chãi! 🌱💪";
    return "Khởi đầu vĩ đại! Sách lược vạch sẵn đang đợi luồng vốn đầu tiên của sếp để kích hoạt thăng hoa! ⚡🎯";
  };

  // Analyse Decisions Connection to Goals
  const totalDecisionsCount = history.length;
  const obeyedCount = history.filter(h => h.userAction === "obeyed").length;
  const defiedCount = history.filter(h => h.userAction === "defied").length;
  
  // Total saved by obeying rejections
  const savedByObeyingRejections = history.reduce((sum, h) => {
    const isRejected = h.debateResult?.conclusion?.approved === false;
    if (isRejected && h.userAction === "obeyed") {
      return sum + h.amount;
    }
    return sum;
  }, 0);

  // Total wasted by defying rejections
  const wastedByDefyingRejections = history.reduce((sum, h) => {
    const isRejected = h.debateResult?.conclusion?.approved === false;
    if (isRejected && h.userAction === "defied") {
      return sum + h.amount;
    }
    return sum;
  }, 0);

  return (
    <div className="space-y-6 animate-fade-in" id="goals-tab">
      {/* Visual Header Banner */}
      <div className="bg-slate-900 border-4 border-black rounded-3xl p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] text-white text-center relative overflow-hidden">
        <span className="text-3xl block animate-bounce">🎯</span>
        <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight mt-2 text-emerald-400">
          Chỉ Số Hành Trình & Điểm Tích Lũy
        </h2>
        <p className="text-xs text-indigo-200 mt-1.5 max-w-sm mx-auto leading-relaxed">
          Nới rộng tầm mắt nhìn về tương lai. Rèn đắp kỷ luật cốt lõi gạt bỏ cám dỗ tiêu sản để hiện thực hóa những giấc mơ tài phiệt kiêu hãnh.
        </p>

        {/* Embedded Switcher with neo-brutalist buttons */}
        <div className="grid grid-cols-2 gap-2 mt-5 bg-black/45 p-1 rounded-2xl border border-white/10 max-w-xs mx-auto">
          <button
            onClick={() => setSubTab("milestones")}
            className={`py-2 px-3 rounded-xl font-black text-xs uppercase transition cursor-pointer flex items-center justify-center gap-1.5 ${
              subTab === "milestones" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            🎯 Cột Mốc Tích Sản
          </button>
          <button
            onClick={() => setSubTab("challenges")}
            className={`py-2 px-3 rounded-xl font-black text-xs uppercase transition cursor-pointer flex items-center justify-center gap-1.5 ${
              subTab === "challenges" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            🏆 Thử Thách Thép
          </button>
        </div>
      </div>

      {subTab === "milestones" ? (
        <div className="space-y-6">
          {/* Section Main Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base md:text-lg uppercase tracking-tight text-slate-800 flex items-center gap-2">
              <span>Cột Mốc Tài Chính Của CEO</span>
              <span className="bg-indigo-100 border border-indigo-600 text-indigo-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {activeGoals.length}
              </span>
            </h3>
            {!isAddingGoal && (
              <button
                onClick={() => setIsAddingGoal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-yellow-300 text-white hover:text-black border-2 border-black font-black text-xs uppercase rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-0.5 active:translate-y-1 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tạo Mục Tiêu Mới</span>
              </button>
            )}
          </div>

          {/* New Goal Modal/Form */}
          {isAddingGoal && (
            <form onSubmit={handleCreateGoal} className="bg-white border-4 border-black rounded-3xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
              <div className="flex items-center justify-between border-b-2 border-dashed border-black pb-3">
                <span className="text-xs font-black uppercase text-indigo-700 tracking-wider flex items-center gap-1">
                  🎯 TỔ CHỨC ĐỀ KHAI MỤC TIÊU MỚI
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingGoal(false)}
                  className="text-xs font-black text-rose-500 hover:underline cursor-pointer"
                >
                  [ ĐÓNG KHUNG TRÌNH ]
                </button>
              </div>

              {formError && <p className="text-rose-500 text-xs font-bold font-mono">⚠️ {formError}</p>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-tight text-gray-700 font-mono">1. Tên mục tiêu tích sản mong ước *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Mua laptop mới phục vụ công cụ kiếm cơm, Nâng cấp xe máy, Lập quỹ phòng thủ..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-3 bg-white border-2 border-black rounded-xl text-black font-semibold outline-none focus:bg-yellow-50/20 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-tight text-gray-700 font-mono">2. Ngày hoàn thành chỉ tiêu đề xuất *</label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3.5 py-3 bg-white border-2 border-black rounded-xl text-black font-mono outline-none text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-tight text-gray-700 font-mono">3. Định giá số tiền cần đạt (VND) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: 30.050.000đ"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-3.5 py-3 bg-white border-2 border-black rounded-xl text-black font-bold outline-none font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-tight text-gray-700 font-mono">4. Số tiền CEO đã dồn gom trước sẵn (Starting)</label>
                  <input
                    type="text"
                    placeholder="Nhập 0đ nếu chưa tích luỹ đồng nào..."
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full px-3.5 py-3 bg-white border-2 border-black rounded-xl text-black font-bold outline-none font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  className="w-full py-4 bg-indigo-650 bg-indigo-600 hover:bg-yellow-300 text-white hover:text-black border-2 border-black font-black uppercase text-xs rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 cursor-pointer transition-all"
                >
                  CHÍNH THỨC BAN BAN BAN HÀNH MỤC TIÊU 🚀
                </button>
              </div>
            </form>
          )}

          {/* Active Goals Grid */}
          {activeGoals.length === 0 ? (
            <div className="text-center py-16 bg-white border-4 border-black rounded-3xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] text-black">
              <span className="text-5xl block animate-pulse">🏝️</span>
              <h3 className="font-black text-lg uppercase mt-4">Chưa có mục tiêu hành vi tài chính</h3>
              <p className="text-xs text-gray-500 font-bold max-w-sm mx-auto mt-2 leading-relaxed">
                Đừng sống bị động gồng mình trả góp vơ hụt vơ tiêu. Hãy vạch ra mục tiêu như Quỹ khẩn cấp, Quỹ hưu trí sớm, Quỹ sắm sửa thông thái để HĐQT có cơ sở so chiếu!
              </p>
              <button
                onClick={() => setIsAddingGoal(true)}
                className="mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-yellow-300 hover:text-black text-white border-2 border-black font-black uppercase text-xs rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
              >
                TỰ TẠO MỤC TIÊU ĐẦU TIÊN 🎯
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeGoals.map((g) => {
                const percent = Math.min(100, Math.round((g.current_amount / g.target_amount) * 100)) || 0;
                const isCompleted = g.current_amount >= g.target_amount;
                const isFunding = fundGoalId === g.goal_id;
                
                // Detailed numeric progress requirements
                const shortage = Math.max(0, g.target_amount - g.current_amount);
                const daysLeft = getDaysLeft(g.deadline);

                return (
                  <div
                    key={g.goal_id}
                    className="bg-white border-4 border-black rounded-3xl p-5 md:p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between text-black relative hover:shadow-[7px_7px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    {/* Visual Stamp for Completed */}
                    {isCompleted && (
                      <div className="absolute right-6 top-6 w-16 h-16 rounded-full border-4 border-dashed border-emerald-500 flex items-center justify-center rotate-12 bg-white/90 pointer-events-none select-none z-10">
                        <span className="text-[9px] font-black font-mono text-emerald-600 text-center leading-tight uppercase tracking-wider">
                          ĐẠT CHỈ TIÊU<br />🏆🎉
                        </span>
                      </div>
                    )}

                    <div className="pb-3 border-b border-gray-150 border-dashed mb-4">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-[9px] font-black font-mono bg-indigo-50 border border-indigo-600 text-indigo-700 px-2 py-0.5 rounded uppercase">
                            MỤC TIÊU CHIẾN LƯỢC
                          </span>
                          <h4 className="font-black text-sm md:text-base leading-tight uppercase tracking-tight mt-1.5 text-slate-900">{g.title}</h4>
                        </div>
                        <span className="font-mono text-indigo-700 text-xl font-black shrink-0">
                          {percent}%
                        </span>
                      </div>

                      {/* Timeline status info as requested: date, shortage and anticipated progress days */}
                      <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-mono leading-relaxed bg-slate-50 border border-slate-250 p-2 rounded-xl">
                        <div>
                          <span className="text-gray-400 font-semibold block uppercase">Hạn định:</span>
                          <strong className="text-slate-800 block">🗓️ {new Date(g.deadline).toLocaleDateString("vi-VN")}</strong>
                        </div>
                        <div>
                          <span className="text-gray-400 font-semibold block uppercase">Thời gian còn lại:</span>
                          <strong className={`block ${daysLeft >= 0 ? "text-slate-800" : "text-rose-600"}`}>
                            ⏱️ {daysLeft >= 0 ? `${daysLeft} Ngày` : "Đóng băng (Quá hạn)"}
                          </strong>
                        </div>
                      </div>

                      {/* Progress Bar Container */}
                      <div className="w-full mt-4">
                        <div className="w-full h-4.5 bg-slate-100 border-2 border-black rounded-full overflow-hidden shadow-inner relative flex items-center justify-center">
                          <div
                            className={`h-full border-r border-black absolute left-0 top-0 transition-all duration-500 ${
                              isCompleted ? "bg-emerald-400" : "bg-gradient-to-r from-indigo-500 to-indigo-600 animate-pulse"
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                          <span className="absolute text-[9px] font-extrabold text-black font-mono pr-2">
                            {formatVND(g.current_amount)}đ / {formatVND(g.target_amount)}đ
                          </span>
                        </div>
                      </div>

                      {/* Deficit / shortage visualization with high positive impact language */}
                      <div className="mt-4 p-3 bg-indigo-50/50 rounded-2xl border border-dashed border-indigo-300">
                        <span className="text-[10px] font-black text-indigo-650 block uppercase font-mono tracking-wider">
                          📌 TIẾN ĐỘ THỰC TẾ & BÀI HỌC CỔ VŨ
                        </span>
                        
                        {/* Positive motivator based on remaining deficit */}
                        {shortage > 0 ? (
                          <div className="text-[11px] font-bold text-indigo-900 leading-relaxed mt-1">
                            Sếp chỉ còn thiếu <strong className="text-black leading-none font-black">{formatVND(shortage)}đ</strong> nữa thôi là gặt hái đại thành tựu!
                          </div>
                        ) : (
                          <div className="text-[11px] font-bold text-emerald-800 leading-relaxed mt-1">
                            Thần tích hoàn tất! Sếp tự lực vượt qua mọi lực cản tài chính xuất sắc! 🥳
                          </div>
                        )}
                        
                        <p className="text-[10px] text-slate-500 italic font-semibold leading-relaxed mt-1.5">
                          "{getEncouragement(percent, shortage)}"
                        </p>
                      </div>
                    </div>

                    {isFunding ? (
                      <div className="bg-yellow-50 border-2 border-black p-4 rounded-2xl space-y-3">
                        <span className="text-[9px] font-black uppercase text-indigo-950 block font-mono">
                          Trích bồi thặng dư đóng góp Heo đất
                        </span>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <input
                              type="text"
                              value={fundAmountInput}
                              onChange={(e) => setFundAmountInput(e.target.value)}
                              placeholder="Nhập số tiền tích lũy..."
                              className="w-full px-3 py-2 bg-white border border-black rounded-lg text-xs font-bold font-mono outline-none"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₫</span>
                          </div>
                          <button
                            onClick={() => handleFundGoal(g.goal_id)}
                            className="px-3 bg-emerald-400 hover:bg-emerald-500 border-2 border-black text-xs font-black uppercase rounded-lg text-black cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
                          >
                            ĐỐNG QUỸ
                          </button>
                        </div>
                        <div className="flex justify-between text-[10px] font-mono leading-relaxed mt-1">
                          <span className="text-slate-600 font-bold">Quỹ thặng dư sẵn có: {formatVND(userState.savings)}đ</span>
                          <button onClick={() => setFundGoalId(null)} className="text-rose-500 underline font-black cursor-pointer">Hủy</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2.5 mt-2">
                        {!isCompleted && (
                          <button
                            onClick={() => {
                              setFundGoalId(g.goal_id);
                              setFundAmountInput("");
                            }}
                            className="flex-1 py-2.5 bg-emerald-400 hover:bg-yellow-300 text-black border-2 border-black font-black text-xs uppercase rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-0.5 active:translate-y-1 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <PiggyBank className="w-4.5 h-4.5 shrink-0" />
                            <span>Góp tích lũy bồi hũ 🐖</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteGoal(g.goal_id)}
                          className="p-2.5 border-2 border-black rounded-xl hover:bg-rose-100 transition whitespace-nowrap cursor-pointer text-gray-400 hover:text-rose-600 block"
                          title="Hủy mục tiêu"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* CONNECT DECISIONS TO GOALS */}
          {/* Detailed decision connection module */}
          <div className="bg-white border-4 border-black rounded-3xl p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] text-black">
            <h4 className="font-black text-sm uppercase tracking-tight border-b-2 border-black pb-3.5 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-650 text-indigo-650 text-indigo-600" />
              <span>Chỉ đạo Quyết phán & Tác Động Tích Luỹ Mục Tiêu</span>
            </h4>

            {totalDecisionsCount === 0 ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-gray-500 font-bold leading-relaxed">
                Chưa ghi nhận tờ trình quyết định chi tiêu thực tế nào. Khi sếp gửi duyệt proposal và lựa chọn Tuân thủ (Obey) hoặc Kháng nghị (Defy) phán quyết, các tác động thặng dư nạp rút ngân quỹ sẽ trực tiếp tăng tốc hoặc kéo chậm tiến trình mục tiêu tại đây!
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Stats recap widgets */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="border border-black p-3 bg-emerald-50 rounded-2xl">
                    <span className="text-[9px] font-black text-emerald-800 uppercase font-mono tracking-wider block">GƯƠNG MẪU TUÂN THỦ (OBEY)</span>
                    <strong className="text-lg font-black text-emerald-700 font-mono mt-0.5 block">{obeyedCount} Phán quyết</strong>
                  </div>
                  <div className="border border-black p-3 bg-amber-50 rounded-2xl">
                    <span className="text-[9px] font-black text-amber-800 uppercase font-mono tracking-wider block">CỨ NGHỊCH KHÁNG LỆNH (DEFY)</span>
                    <strong className="text-lg font-black text-amber-700 font-mono mt-0.5 block">{defiedCount} Lần quẹt</strong>
                  </div>
                  <div className="border border-black p-3 bg-indigo-50 rounded-2xl">
                    <span className="text-[9px] font-black text-indigo-600 uppercase font-mono tracking-wider block">BẢO VỆ THẶNG DƯ THÀNH CÔNG</span>
                    <strong className="text-lg font-black text-indigo-700 font-mono mt-0.5 block">+{formatVND(savedByObeyingRejections)}đ</strong>
                  </div>
                </div>

                {/* Connection Narrative analysis with highly positive/supportive tone */}
                <div className="p-4 bg-yellow-50 border border-black rounded-2xl text-xs leading-relaxed font-bold space-y-3.5">
                  <div className="flex items-start gap-2.5">
                    <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-indigo-950 uppercase font-black tracking-wide block">KHẢO SÁT CHỦ QUAN TỪ THƯ KÝ HĐQT:</span>
                      
                      {savedByObeyingRejections > 0 ? (
                        <p className="text-slate-800 mt-1 leading-relaxed">
                          🎉 Việc sếp nghe theo phán quyết của HĐQT bác bỏ các khoản mua sắm ngẫu hứng vô lý đã tiết kiệm trực tiếp <strong className="text-emerald-700 font-black">{formatVND(savedByObeyingRejections)}đ</strong> trong tài khoản tích góp. Khoản bảo vệ thặng dư thần kỳ này tương đương tích lũy thêm tối đa một phần tư chặng đường, bứt tốc tất cả mục tiêu của sếp về đích sớm hơn dự kiến!
                        </p>
                      ) : (
                        <p className="text-slate-800 mt-1 leading-relaxed">
                          🐖 Sếp chưa tích lũy được tiền từ các quyết phán tuân thủ. Hãy cố gắng kiềm chế cơn khát quẹt thẻ tiêu sản bộc phát để thiết lập thặng dư bảo an đầu tiên đóng góp trực tiếp cho heo đất!
                        </p>
                      )}

                      {wastedByDefyingRejections > 0 && (
                        <div className="mt-3 p-3 bg-rose-50 border border-rose-300 rounded-xl flex items-start gap-2 text-rose-850">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-rose-950 uppercase font-black text-[10px] block">CẢNH BÁO TIÊU HAO:</span>
                            <p className="text-[10.5px] leading-relaxed text-slate-700 mt-0.5 font-semibold">
                              Việc bất chấp quẹt chi tiêu <strong className="text-rose-600 font-black">{formatVND(wastedByDefyingRejections)}đ</strong> vô tình kéo dán hành trình gặt hái mục tiêu. Mỗi lần bóp hũ heo đáp ứng tiêu sản bốc phái là bấy nhiêu lần sếp dời ngày vinh quang ra xa thêm hàng tháng trời!
                            </p>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      ) : (
        /* Challenges Sub-Component */
        <div className="animate-fade-in">
          <DisciplineChallenges userState={userState} onUpdateUserState={onUpdateUserState} />
        </div>
      )}
    </div>
  );
}
