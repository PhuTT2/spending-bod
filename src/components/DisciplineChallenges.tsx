import React, { useState } from "react";
import { Challenge, Badge, ProfileView } from "../types";
import { Award, Plus, Check, X, Lock, Flame, Clock, Sparkles } from "lucide-react";

export const PREDEFINED_CHALLENGES: Omit<Challenge, "status" | "current_value">[] = [
  { id: "challenge-no-spend-weekend", name: "Cuối Tuần Không Ví", description: "Không tiêu xài bốc đồng vào Thứ Bảy & Chủ Nhật.", reward_points: 15, emoji: "🚫", type: "no_spend", target_value: 2 },
  { id: "challenge-coffee-blackout", name: "Cai Cà Phê Tiệm", description: "Từ bỏ mua cà phê ngoài hàng trong 7 ngày.", reward_points: 25, emoji: "☕", type: "limit_spending", target_value: 7 },
  { id: "challenge-cooking-streak", name: "Chiến Thần Tự Nấu", description: "Không đặt đồ ăn qua mạng trong 14 ngày.", reward_points: 40, emoji: "🍳", type: "no_spend", target_value: 14 },
  { id: "challenge-emergency-priming", name: "Heo Đất Tăng Tốc", description: "Đút lợn tiết kiệm 100k mỗi ngày trong 10 ngày.", reward_points: 30, emoji: "🐖", type: "saving_target", target_value: 10 },
];

export const BADGE_DIRECTORY: Badge[] = [
  { id: "badge-novice", name: "Bước Đầu Giác Ngộ", description: "Hoàn thành thử thách đầu tiên.", emoji: "🎓", conditionDesc: "Hoàn thành 1 thử thách bất kỳ" },
  { id: "badge-no-spend", name: "Vua Tiết Kiệm Cuối Tuần", description: "Không chạm thẻ tín dụng suốt 2 ngày nghỉ.", emoji: "🚫", conditionDesc: "Hoàn thành 'Cuối Tuần Không Ví'" },
  { id: "badge-coffee", name: "Kẻ Thù Của Starbucks", description: "Sống sót qua 7 ngày không mua cà phê.", emoji: "☕", conditionDesc: "Hoàn thành 'Cai Cà Phê Tiệm'" },
  { id: "badge-cooking", name: "Chiến Thần Tự Nấu", description: "Nấu ăn 14 ngày liên tục.", emoji: "🍳", conditionDesc: "Hoàn thành 'Chiến Thần Tự Nấu'" },
  { id: "badge-custom", name: "Kiến Trúc Sư Kỷ Luật", description: "Tự đề ra và hoàn thành kế hoạch riêng.", emoji: "📐", conditionDesc: "Hoàn thành 1 thử thách tự tạo" },
  { id: "badge-steel-will", name: "Kỷ Luật Kim Cương", description: "Đạt điểm kỷ luật tuyệt đối.", emoji: "👑", conditionDesc: "Đạt điểm kỷ luật 100/100" },
  { id: "badge-marathoner", name: "Chiến Binh Bền Bỉ", description: "Vượt qua tổng 3 thử thách.", emoji: "🏆", conditionDesc: "Hoàn thành tổng 3 thử thách" },
];

interface DisciplineChallengesProps {
  appState: ProfileView;
  onEdit: (updater: (prev: ProfileView) => ProfileView) => void;
}

export default function DisciplineChallenges({ appState, onEdit }: DisciplineChallengesProps) {
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [customDays, setCustomDays] = useState(5);
  const [customPoints, setCustomPoints] = useState(15);
  const [customEmoji, setCustomEmoji] = useState("🏆");
  const [filterTab, setFilterTab] = useState<"active" | "available" | "badges">("active");

  const allChallenges = appState.challenges;
  const activeList = allChallenges.filter((c) => c.status === "active");
  const completedList = allChallenges.filter((c) => c.status === "completed" || c.status === "failed");
  const unlockedBadges = appState.unlocked_badge_ids;
  const availablePredefined = PREDEFINED_CHALLENGES.filter((p) => !activeList.some((al) => al.id === p.id));

  const handleStartChallenge = (p: Omit<Challenge, "status" | "current_value">, isCustom = false) => {
    if (activeList.some((al) => al.id === p.id)) {
      alert("Thử thách này đang được tiến hành rồi!");
      return;
    }
    const newChallenge: Challenge = { ...p, status: "active", current_value: 0, is_custom: isCustom, start_date: new Date().toLocaleDateString("vi-VN"), history_log: [] };
    onEdit((prev) => ({ ...prev, challenges: [...prev.challenges.filter((c) => c.id !== p.id), newChallenge] }));
    setFilterTab("active");
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    handleStartChallenge(
      { id: `chall-custom-${Date.now()}`, name: customName.trim(), description: customDesc.trim() || "Thử thách tự kỷ luật do bạn thiết kế.", reward_points: customPoints, emoji: customEmoji, type: "custom", target_value: customDays },
      true
    );
    setIsCreatingCustom(false);
    setCustomName(""); setCustomDesc(""); setCustomDays(5); setCustomPoints(15);
  };

  const handleCheckIn = (id: string) => {
    onEdit((prev) => {
      let addedPoints = 0;
      let triggeredIsCustom = false;
      const updated = prev.challenges.map((c) => {
        if (c.id === id && c.status === "active") {
          const nextVal = c.current_value + 1;
          const isDone = nextVal >= c.target_value;
          if (isDone) { addedPoints = c.reward_points; triggeredIsCustom = !!c.is_custom; }
          return { ...c, current_value: nextVal, status: (isDone ? "completed" : "active") as Challenge["status"] };
        }
        return c;
      });

      let badges = [...prev.unlocked_badge_ids];
      if (addedPoints > 0) {
        const completedCount = updated.filter((c) => c.status === "completed").length;
        const toUnlock = ["badge-novice"];
        if (id === "challenge-no-spend-weekend") toUnlock.push("badge-no-spend");
        if (id === "challenge-coffee-blackout") toUnlock.push("badge-coffee");
        if (id === "challenge-cooking-streak") toUnlock.push("badge-cooking");
        if (triggeredIsCustom) toUnlock.push("badge-custom");
        if (completedCount >= 3) toUnlock.push("badge-marathoner");
        badges = Array.from(new Set([...badges, ...toUnlock]));
      }

      const newScore = Math.min(100, prev.profile.discipline_score + addedPoints);
      if (newScore >= 100 && !badges.includes("badge-steel-will")) badges.push("badge-steel-will");

      return { ...prev, challenges: updated, unlocked_badge_ids: badges, profile: { ...prev.profile, discipline_score: newScore } };
    });
  };

  const handleFailChallenge = (id: string) => {
    if (!confirm("Bỏ dở thử thách này? Điểm kỷ luật sẽ bị trừ.")) return;
    onEdit((prev) => ({
      ...prev,
      challenges: prev.challenges.map((c) => (c.id === id && c.status === "active" ? { ...c, status: "failed" as const } : c)),
      profile: { ...prev.profile, discipline_score: Math.max(0, prev.profile.discipline_score - 12) },
    }));
  };

  return (
    <div className="bg-white border-4 border-black rounded-3xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black">
      <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-5">
        <h2 className="text-xl font-black uppercase tracking-tight text-black flex items-center gap-2"><span>🏆</span> Thử thách kỷ luật</h2>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6">
        <button onClick={() => { setFilterTab("active"); setIsCreatingCustom(false); }} className={`py-2 text-xs font-black uppercase rounded-xl border-2 border-black cursor-pointer flex items-center justify-center gap-1.5 ${filterTab === "active" ? "bg-indigo-600 text-white" : "bg-slate-50 hover:bg-yellow-300"}`}>
          <Flame className="w-3.5 h-3.5" /> Đang chạy ({activeList.length})
        </button>
        <button onClick={() => { setFilterTab("available"); setIsCreatingCustom(false); }} className={`py-2 text-xs font-black uppercase rounded-xl border-2 border-black cursor-pointer flex items-center justify-center gap-1.5 ${filterTab === "available" ? "bg-indigo-600 text-white" : "bg-slate-50 hover:bg-yellow-300"}`}>
          <Plus className="w-3.5 h-3.5" /> Danh sách
        </button>
        <button onClick={() => { setFilterTab("badges"); setIsCreatingCustom(false); }} className={`py-2 text-xs font-black uppercase rounded-xl border-2 border-black cursor-pointer flex items-center justify-center gap-1.5 ${filterTab === "badges" ? "bg-indigo-600 text-white" : "bg-slate-50 hover:bg-yellow-300"}`}>
          <Award className="w-3.5 h-3.5" /> Huy hiệu ({unlockedBadges.length})
        </button>
      </div>

      {filterTab === "active" && (
        <div className="space-y-4">
          {activeList.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-2xl bg-slate-50">
              <span className="text-4xl">💤</span>
              <h4 className="font-extrabold text-sm uppercase mt-2.5">Chưa có thử thách nào</h4>
              <button onClick={() => setFilterTab("available")} className="mt-4 px-4 py-2 text-xs font-black uppercase bg-indigo-600 hover:bg-yellow-300 text-white hover:text-black border-2 border-black rounded-xl cursor-pointer">Nhận thử thách</button>
            </div>
          ) : (
            activeList.map((c) => {
              const progressPct = Math.min(100, Math.round((c.current_value / c.target_value) * 100));
              return (
                <div key={c.id} className="p-4 bg-white border-2 border-black rounded-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex items-center gap-2"><span className="text-2xl">{c.emoji}</span><h4 className="font-black text-sm uppercase leading-tight">{c.name}</h4></div>
                    <span className="text-xs bg-yellow-300 text-black border border-black font-black px-2.5 py-0.5 rounded-full font-mono">+{c.reward_points} PTS</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700 leading-relaxed mb-4">{c.description}</p>
                  <div className="mb-4">
                    <div className="flex justify-between items-center text-xs font-black font-mono mb-1"><span>TIẾN ĐỘ</span><span className="text-indigo-600">{c.current_value}/{c.target_value}</span></div>
                    <div className="w-full bg-[#F0F2F5] border-2 border-black rounded-full h-4 overflow-hidden"><div className="bg-emerald-400 h-full" style={{ width: `${progressPct}%` }} /></div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleCheckIn(c.id)} className="flex-1 py-2 text-xs font-black uppercase bg-emerald-400 border-2 border-black rounded-xl hover:bg-yellow-300 cursor-pointer flex items-center justify-center gap-1"><Check className="w-4 h-4" /> Điểm danh</button>
                    <button onClick={() => handleFailChallenge(c.id)} className="p-2 text-xs font-black bg-rose-300 border-2 border-black rounded-xl hover:bg-rose-400 cursor-pointer"><X className="w-4 h-4" /></button>
                  </div>
                </div>
              );
            })
          )}

          {completedList.length > 0 && (
            <div className="mt-8 border-t-2 border-black pt-4">
              <h4 className="text-xs font-black uppercase text-gray-500 mb-3">Lịch sử</h4>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {completedList.map((c) => (
                  <div key={c.id} className="p-3 bg-slate-50 border border-black rounded-xl flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2"><span className="text-lg">{c.emoji}</span><span className="font-extrabold text-black">{c.name}</span></div>
                    <span className={`font-mono text-[10px] font-black px-2 py-0.5 border border-black rounded-full ${c.status === "completed" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                      {c.status === "completed" ? `+${c.reward_points} PTS` : "-12 PTS"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {filterTab === "available" && (
        <div className="space-y-5">
          <div className="space-y-3">
            {availablePredefined.length === 0 ? (
              <p className="text-xs font-bold text-gray-600">Tất cả thử thách đã được kích hoạt.</p>
            ) : (
              availablePredefined.map((p) => (
                <div key={p.id} className="p-4 bg-slate-50 border-2 border-black rounded-2xl flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex items-center gap-2"><span className="text-2xl">{p.emoji}</span><h4 className="font-black text-sm uppercase text-gray-900">{p.name}</h4></div>
                    <span className="text-xs bg-yellow-300 font-mono font-black px-2.5 py-0.5 border border-black rounded-full">+{p.reward_points} PTS</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700 leading-relaxed mb-4">{p.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono font-black text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {p.target_value} ngày</span>
                    <button onClick={() => handleStartChallenge(p)} className="px-4 py-1.5 text-xs font-black uppercase bg-indigo-600 text-white hover:bg-yellow-300 hover:text-black border-2 border-black rounded-xl cursor-pointer">Kích hoạt</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t-2 border-black pt-4">
            {!isCreatingCustom ? (
              <button onClick={() => setIsCreatingCustom(true)} className="w-full py-3 text-xs font-black uppercase bg-yellow-300 hover:bg-indigo-600 hover:text-white border-2 border-black rounded-xl cursor-pointer flex items-center justify-center gap-1">
                <Plus className="w-4 h-4" /> Tự thiết kế thử thách
              </button>
            ) : (
              <form onSubmit={handleCreateCustom} className="p-4 border-2 border-black rounded-2xl bg-[#FDF9F4] space-y-3">
                <div className="flex items-center justify-between border-b border-black pb-1.5 mb-2">
                  <span className="text-[11px] font-black uppercase text-indigo-800">Thử thách tự chế</span>
                  <button type="button" onClick={() => setIsCreatingCustom(false)} className="text-xs font-bold text-gray-500 hover:text-black">Hủy</button>
                </div>
                <input type="text" required placeholder="Tên thử thách" value={customName} onChange={(e) => setCustomName(e.target.value)} className="w-full px-3 py-2 bg-white border border-black rounded-lg text-xs outline-none" />
                <textarea placeholder="Mô tả (tùy chọn)" value={customDesc} onChange={(e) => setCustomDesc(e.target.value)} rows={2} className="w-full px-3 py-2 bg-white border border-black rounded-lg text-xs outline-none resize-none" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase">Số ngày</label>
                    <input type="number" min={1} max={30} value={customDays} onChange={(e) => { const d = Math.max(1, parseInt(e.target.value) || 1); setCustomDays(d); setCustomPoints(Math.min(50, d * 3)); }} className="w-full px-3 py-2 bg-white border border-black rounded-lg text-xs outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase">Điểm thưởng</label>
                    <div className="w-full px-3 py-2 bg-slate-100 border border-black rounded-lg text-xs font-black text-indigo-700">+{customPoints} PTS</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {["🏆", "🚫", "☕", "🚴", "📚", "🥦"].map((em) => (
                    <button key={em} type="button" onClick={() => setCustomEmoji(em)} className={`w-8 h-8 rounded-lg border border-black text-lg flex items-center justify-center bg-white cursor-pointer ${customEmoji === em ? "bg-yellow-300 ring-2 ring-indigo-500" : ""}`}>{em}</button>
                  ))}
                </div>
                <button type="submit" className="w-full py-2.5 text-xs font-black uppercase bg-indigo-600 text-white hover:bg-yellow-300 hover:text-black border-2 border-black rounded-xl cursor-pointer">Bắt đầu</button>
              </form>
            )}
          </div>
        </div>
      )}

      {filterTab === "badges" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {BADGE_DIRECTORY.map((b) => {
            const isUnlocked = unlockedBadges.includes(b.id);
            return (
              <div key={b.id} className={`p-3.5 border-2 border-black rounded-2xl flex items-start gap-3 ${isUnlocked ? "bg-yellow-50" : "bg-slate-50 opacity-60"}`}>
                <div className={`w-12 h-12 rounded-xl border-2 border-black text-2xl flex items-center justify-center shrink-0 ${isUnlocked ? "bg-yellow-300" : "bg-gray-200"}`}>
                  {isUnlocked ? b.emoji : <Lock className="w-5 h-5 text-gray-400" />}
                </div>
                <div>
                  <h5 className={`font-black text-xs uppercase leading-tight ${isUnlocked ? "text-slate-900" : "text-gray-400"}`}>{b.name}</h5>
                  <p className="text-[10px] text-gray-500 font-medium mt-0.5">{isUnlocked ? b.description : `Mở khóa: ${b.conditionDesc}`}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
