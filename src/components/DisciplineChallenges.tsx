import React, { useState } from "react";
import { Challenge, Badge, UserFinancialState } from "../types";
import {
  Award,
  Plus,
  Check,
  X,
  Lock,
  Calendar,
  Flame,
  Trash2,
  CheckCircle,
  AlertCircle,
  Coffee,
  Coins,
  Shield,
  Clock,
  Sparkles
} from "lucide-react";

// Initial static list of pre-defined challenges
export const PREDEFINED_CHALLENGES: Omit<Challenge, "status" | "currentValue">[] = [
  {
    id: "challenge-no-spend-weekend",
    name: "Cuối Tuần Không Ví (No-Spend Weekend)",
    description: "Hoàn toàn không tiêu xài bất chợt hay đặt hàng online vào Thứ Bảy & Chủ Nhật. Mọi bữa ăn tự nấu.",
    rewardPoints: 15,
    emoji: "🚫",
    type: "no_spend",
    targetValue: 2
  },
  {
    id: "challenge-coffee-blackout",
    name: "Cai Cà Phê Tiệm (Coffee Blackout)",
    description: "Từ bỏ hoàn toàn mua cà phê ngoài hàng (Highlands/Starbucks) trong 7 ngày. Hãy tự pha.",
    rewardPoints: 25,
    emoji: "☕",
    type: "limit_spending",
    targetValue: 7
  },
  {
    id: "challenge-cooking-streak",
    name: "Chiến Thần Tự Nấu (Cooking Streak)",
    description: "Nói không với đặt đồ ăn qua mạng (Grab/Shopee) trong 14 ngày dồn dập. Tự đi chợ nấu nướng.",
    rewardPoints: 40,
    emoji: "🍳",
    type: "no_spend",
    targetValue: 14
  },
  {
    id: "challenge-emergency-priming",
    name: "Heo Đất Tăng Tốc (Savings Primer)",
    description: "Cắt giảm mọi chi phí ngoài lề lẻ tẻ, đút lợn tiết kiệm 100k mỗi ngày trong vòng 10 ngày.",
    rewardPoints: 30,
    emoji: "🐖",
    type: "saving_target",
    targetValue: 10
  }
];

// Available badges and criteria description
export const BADGE_DIRECTORY: Badge[] = [
  {
    id: "badge-novice",
    name: "Bước Đầu Giác Ngộ",
    description: "CEO chính thức vượt qua thử thách tài chính đầu tiên để chứng tỏ ý chí.",
    emoji: "🎓",
    conditionDesc: "Hoàn thành 1 thử thách bất kỳ"
  },
  {
    id: "badge-no-spend",
    name: "Vua Tiết Kiệm Cuối Tuần",
    description: "Không chạm thẻ tín dụng suốt 2 ngày nghỉ. Khả năng nhẫn nại phi thường.",
    emoji: "🚫",
    conditionDesc: "Hoàn thành 'Cuối Tuần Không Ví'"
  },
  {
    id: "badge-coffee",
    name: "Kẻ Thù Của Starbucks",
    description: "Caffeine nguyên chất từ nhà tự pha. Sống sót qua 7 ngày không tốn tiền cốc 65k.",
    emoji: "☕",
    conditionDesc: "Hoàn thành 'Cai Cà Phê Tiệm'"
  },
  {
    id: "badge-cooking",
    name: "Chiến Thần Tự Nấu",
    description: "Nấu ăn 14 ngày liên tục, bách chiến bách thắng trước các voucher dụ dỗ của siêu app.",
    emoji: "🍳",
    conditionDesc: "Hoàn thành 'Chiến Thần Tự Nấu'"
  },
  {
    id: "badge-custom",
    name: "Kiến Trúc Sư Kỷ Luật",
    description: "Đề ra kế hoạch rèn dũa riêng biệt và tuyệt đối tuân thủ đến cùng.",
    emoji: "📐",
    conditionDesc: "Hoàn thành 1 thử thách Tự Tạo"
  },
  {
    id: "badge-steel-will",
    name: "Kỷ Luật Kim Cương",
    description: "Hội đồng hoàn toàn kinh ngạc và phủ phục trước tinh thần bất khuất của CEO.",
    emoji: "👑",
    conditionDesc: "Đạt Điểm Kỷ Luật tài chính tuyệt đối 100/100"
  },
  {
    id: "badge-marathoner",
    name: "Chiến Binh Bền Bỉ",
    description: "Phát triển thói quen vững chãi bằng cách vượt qua tổng 3 thử thách.",
    emoji: "🏆",
    conditionDesc: "Hoàn thành tổng 3 thử thách"
  }
];

interface DisciplineChallengesProps {
  userState: UserFinancialState;
  onUpdateUserState: (updater: (prev: UserFinancialState) => UserFinancialState) => void;
}

export default function DisciplineChallenges({ userState, onUpdateUserState }: DisciplineChallengesProps) {
  // Local state for custom challenge creation
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [customDays, setCustomDays] = useState(5);
  const [customPoints, setCustomPoints] = useState(15);
  const [customEmoji, setCustomEmoji] = useState("🏆");
  
  // Tab for active/available list
  const [filterTab, setFilterTab] = useState<"active" | "available" | "badges">("active");

  const activeChallenges = userState.challenges || [];
  const activeList = activeChallenges.filter((c) => c.status === "active");
  const completedList = activeChallenges.filter((c) => c.status === "completed" || c.status === "failed");

  // Filter out challenges that are already active or completed so they can be chosen again if reset
  const availablePredefined = PREDEFINED_CHALLENGES.filter(
    (p) => !activeList.some((al) => al.id === p.id)
  );

  // Chairman motivation speech generator
  const getChairmanSpeech = (c: Challenge | null) => {
    if (!c) {
      return "Tự kỷ luật là ranh giới giữa một CEO có tài sản tỷ đô và kẻ larping cháy tài khoản tín dụng trước ngày mùng 10. Hãy chọn lấy một mũi gươm đấu tranh tài chính!";
    }
    
    switch (c.id) {
      case "challenge-no-spend-weekend":
        return `🚫 Cuối tuần mà vung tiền mua sắm bốc đồng hay trà sữa vô thưởng vô phạt, tôi sẽ lập tức ra lệnh cho Giám Đốc Rủi Ro tịch thu quyền CEO! Hãy chi dưới 0 VND kể từ tối thứ Sáu!`;
      case "challenge-coffee-blackout":
        return `☕ CEO có biết cốc Starbuck 75k nếu tích lũy và tăng trưởng lợi tức 12%/năm sẽ biến thành xe hơi trong 30 năm không? Hãy pha cà phê gói, ngậm đắng nuốt cay vì tương lai của doanh nghiệp!`;
      case "challenge-cooking-streak":
        return `🍳 Grab và ShopeeFood đang bú cạn máu tài khoản của chúng ta! 14 ngày ăn cơm tự nấu là cơ hội vàng để khôi phục lại điểm uy tín. HĐQT đang tò mò liệu CEO có cầm nổi chảo quá 3 ngày?`;
      case "challenge-emergency-priming":
        return `🐖 Mỗi ngày đút lợn 100k là bài học nhập môn của quản lý thanh khoản tối thượng. Không có quỹ khẩn cấp, CEO chỉ là một quân cờ bất lực khi thị trường bão táp!`;
      default:
        return `📐 [THỬ THÁCH TỰ CHẾ: ${c.name}] - Quyết tâm thép do chính CEO đề bạt. Toàn bộ Hội Đồng Quản Trị đã đóng dấu thông báo khẩn cấp giám sát. Không được làm chúng tôi thất vọng! Day ${c.currentValue}/${c.targetValue}! Tiến lên!`;
    }
  };

  const currentChairmanSpeech = getChairmanSpeech(activeList[0] || null);

  // Start selected challenge
  const handleStartChallenge = (p: Omit<Challenge, "status" | "currentValue">, isCustom = false) => {
    // Check if equivalent challenge is already active
    if (activeList.some((al) => al.id === p.id)) {
      alert("Thử thách này đang được tiến hành rồi, CEO!");
      return;
    }

    const newChallenge: Challenge = {
      ...p,
      status: "active",
      currentValue: 0,
      isCustom,
      startDate: new Date().toLocaleDateString("vi-VN"),
      historyLog: [`Bắt đầu hành trình kỷ luật thép ngày ${new Date().toLocaleDateString("vi-VN")}`]
    };

    onUpdateUserState((prev) => {
      const currentChalls = prev.challenges || [];
      // Remove any previous record of this challenge to keep list clean
      const cleaned = currentChalls.filter((c) => c.id !== p.id);
      return {
        ...prev,
        challenges: [...cleaned, newChallenge]
      };
    });

    setFilterTab("active");
  };

  // Create custom challenge
  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const uniqueId = `chall-custom-${Date.now()}`;
    const newChall: Omit<Challenge, "status" | "currentValue"> = {
      id: uniqueId,
      name: customName.trim(),
      description: customDesc.trim() || `Thử thách tự kỷ luật rèn luyện dòng tiền cá nhân do CEO thiết kế.`,
      rewardPoints: customPoints,
      emoji: customEmoji,
      type: "custom",
      targetValue: customDays
    };

    handleStartChallenge(newChall, true);
    setIsCreatingCustom(false);
    setCustomName("");
    setCustomDesc("");
    setCustomDays(5);
    setCustomPoints(15);
  };

  // Day Check-in increments progress
  const handleCheckIn = (id: string) => {
    onUpdateUserState((prev) => {
      const currentChalls = prev.challenges || [];
      const updated = currentChalls.map((c) => {
        if (c.id === id && c.status === "active") {
          const nextVal = c.currentValue + 1;
          const isDone = nextVal >= c.targetValue;
          const newStatus = isDone ? "completed" : "active";
          const newLog = [
            ...(c.historyLog || []),
            `Check-in thành công Tiến độ (${nextVal}/${c.targetValue}) vào ngày ${new Date().toLocaleDateString("vi-VN")}`
          ];

          let pointsBonus = 0;
          let newlyUnlockedBadges: string[] = prev.unlockedBadgeIds || [];

          if (isDone) {
            pointsBonus = c.rewardPoints;
            newLog.push(`🏆 Chúc mừng! CEO đã xuất sắc hoàn thành cuộc thử thách! Điểm kỷ luật thưởng +${c.rewardPoints}`);
            
            // Check badges unlocks!
            const countCompleted = currentChalls.filter(ch => ch.id !== id && ch.status === "completed").length + 1;
            
            // Badge evaluation
            const badgeIdsToUnlock: string[] = [];

            // 1. first challenge completed (novice badge)
            if (!newlyUnlockedBadges.includes("badge-novice")) {
              badgeIdsToUnlock.push("badge-novice");
            }
            
            // 2. Specific challenges
            if (c.id === "challenge-no-spend-weekend" && !newlyUnlockedBadges.includes("badge-no-spend")) {
              badgeIdsToUnlock.push("badge-no-spend");
            }
            if (c.id === "challenge-coffee-blackout" && !newlyUnlockedBadges.includes("badge-coffee")) {
              badgeIdsToUnlock.push("badge-coffee");
            }
            if (c.id === "challenge-cooking-streak" && !newlyUnlockedBadges.includes("badge-cooking")) {
              badgeIdsToUnlock.push("badge-cooking");
            }
            if (c.isCustom && !newlyUnlockedBadges.includes("badge-custom")) {
              badgeIdsToUnlock.push("badge-custom");
            }
            // 3. Marathoner (3 challenges)
            if (countCompleted >= 3 && !newlyUnlockedBadges.includes("badge-marathoner")) {
              badgeIdsToUnlock.push("badge-marathoner");
            }

            // Append unique ones
            newlyUnlockedBadges = [...newlyUnlockedBadges, ...badgeIdsToUnlock];
          }

          return {
            ...c,
            currentValue: nextVal,
            status: newStatus as any,
            historyLog: newLog
          };
        }
        return c;
      });

      // Calculate score changes
      const triggeredChall = updated.find(c => c.id === id);
      const isDone = triggeredChall ? (triggeredChall.currentValue >= triggeredChall.targetValue) : false;
      const addedPoints = isDone ? (triggeredChall?.rewardPoints || 0) : 0;
      
      const newScore = Math.min(100, prev.disciplineScore + addedPoints);
      
      // Steel will check (if score reaches 100)
      let finalUnlockedBadges = [...(prev.unlockedBadgeIds || [])];
      
      // Update badges lists
      if (isDone) {
        const freshlyUnlocked = updated.filter(c => c.status === "completed");
        const countCompleted = freshlyUnlocked.length;
        
        // Novice
        if (!finalUnlockedBadges.includes("badge-novice")) finalUnlockedBadges.push("badge-novice");
        
        // Check ids
        if (id === "challenge-no-spend-weekend" && !finalUnlockedBadges.includes("badge-no-spend")) finalUnlockedBadges.push("badge-no-spend");
        if (id === "challenge-coffee-blackout" && !finalUnlockedBadges.includes("badge-coffee")) finalUnlockedBadges.push("badge-coffee");
        if (id === "challenge-cooking-streak" && !finalUnlockedBadges.includes("badge-cooking")) finalUnlockedBadges.push("badge-cooking");
        if (triggeredChall?.isCustom && !finalUnlockedBadges.includes("badge-custom")) finalUnlockedBadges.push("badge-custom");
        
        // 3 completed
        if (countCompleted >= 3 && !finalUnlockedBadges.includes("badge-marathoner")) finalUnlockedBadges.push("badge-marathoner");
      }

      if (newScore >= 100 && !finalUnlockedBadges.includes("badge-steel-will")) {
        finalUnlockedBadges.push("badge-steel-will");
      }

      return {
        ...prev,
        disciplineScore: newScore,
        challenges: updated,
        unlockedBadgeIds: Array.from(new Set(finalUnlockedBadges))
      };
    });
  };

  // Fail/Abort challenge
  const handleFailChallenge = (id: string, isForcedAbandon = false) => {
    const confirmation = isForcedAbandon 
      ? confirm("CEO chắc chắn muốn bỏ dở cuộc đua kỷ luật này? Điểm uy tín cốt lõi sẽ bị tụt dốc!")
      : true;

    if (!confirmation) return;

    onUpdateUserState((prev) => {
      const currentChalls = prev.challenges || [];
      const updated = currentChalls.map((c) => {
        if (c.id === id && c.status === "active") {
          return {
            ...c,
            status: "failed" as const,
            historyLog: [
              ...(c.historyLog || []),
              `⚠️ Thử thách đã đóng phán quyết: THẤT BẠI rèn luyện vào ngày ${new Date().toLocaleDateString("vi-VN")}.`
            ]
          };
        }
        return c;
      });

      // Abandoning causes minor deduction in discipline score to enforce weight
      const penalty = 12;
      const newScore = Math.max(0, prev.disciplineScore - penalty);

      return {
        ...prev,
        disciplineScore: newScore,
        challenges: updated
      };
    });
  };

  // Reset challenge list if they wish to start clean
  const handleClearChallenges = () => {
    if (confirm("Reset toàn bộ dữ liệu lịch sử thử thách?")) {
      onUpdateUserState((prev) => ({
        ...prev,
        challenges: [],
        unlockedBadgeIds: []
      }));
    }
  };

  return (
    <div className="bg-white border-4 border-black rounded-3xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black" id="discipline-challenges-view">
      
      {/* Title block */}
      <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-5">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-yellow-300 border-2 border-black text-black flex items-center justify-center font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-2xl">
            🏆
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-black">Hành Trình Kỷ Luật Thép</h2>
            <span className="text-xs text-gray-500 font-mono font-bold tracking-wider uppercase">Slay Financial Desires & Unlock Badges</span>
          </div>
        </div>
        {activeChallenges.length > 0 && (
          <button
            onClick={handleClearChallenges}
            className="text-[10px] font-black text-rose-600 hover:underline hover:text-rose-800 tracking-tight"
          >
            LÀM SẠCH LỊCH SỬ
          </button>
        )}
      </div>

      {/* Dynamic Chairman Motivation Speech */}
      <div className="bg-indigo-650 bg-indigo-50 border-2 border-black rounded-2xl p-4 mb-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-15">
          <Sparkles className="w-16 h-16 text-indigo-900" />
        </div>
        <span className="text-[9px] font-black uppercase bg-black text-yellow-300 px-2 py-0.5 rounded-full border border-black inline-block mb-2 shadow">
          🕴️ CHAIRMAN ĐỜI THƯỜNG CUỘC SỐNG PHÁN QUYẾT:
        </span>
        <p className="text-xs font-bold leading-relaxed text-indigo-950 italic">
          &ldquo;{currentChairmanSpeech}&rdquo;
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <button
          onClick={() => { setFilterTab("active"); setIsCreatingCustom(false); }}
          className={`py-2 text-xs font-black uppercase rounded-xl border-2 border-black tracking-tight transition cursor-pointer flex items-center justify-center gap-1.5 ${
            filterTab === "active"
              ? "bg-indigo-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              : "bg-slate-50 text-black hover:bg-yellow-300 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
          }`}
        >
          <Flame className="w-3.5 h-3.5" /> Đang Chạy ({activeList.length})
        </button>

        <button
          onClick={() => { setFilterTab("available"); setIsCreatingCustom(false); }}
          className={`py-2 text-xs font-black uppercase rounded-xl border-2 border-black tracking-tight transition cursor-pointer flex items-center justify-center gap-1.5 ${
            filterTab === "available"
              ? "bg-indigo-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              : "bg-slate-50 text-black hover:bg-yellow-300 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
          }`}
        >
          <Plus className="w-3.5 h-3.5" /> Danh sách ({availablePredefined.length + (isCreatingCustom ? 0 : 1)})
        </button>

        <button
          onClick={() => { setFilterTab("badges"); setIsCreatingCustom(false); }}
          className={`py-2 text-xs font-black uppercase rounded-xl border-2 border-black tracking-tight transition cursor-pointer flex items-center justify-center gap-1.5 ${
            filterTab === "badges"
              ? "bg-indigo-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              : "bg-slate-50 text-black hover:bg-yellow-300 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
          }`}
        >
          <Award className="w-3.5 h-3.5" /> Huy Hiệu ({(userState.unlockedBadgeIds || []).length})
        </button>
      </div>

      {/* PANEL 1: ACTIVE CHALLENGES */}
      {filterTab === "active" && (
        <div className="space-y-4">
          {activeList.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-2xl bg-slate-50">
              <span className="text-4xl">💤</span>
              <h4 className="font-extrabold text-sm uppercase mt-2.5">Không Có Thử Thách Nào Hoạt Động</h4>
              <p className="text-xs text-slate-500 font-semibold max-w-xs mx-auto mt-1 leading-normal">
                Bản thân đang thả trôi không có phanh? Hãy chọn ngay một thử thách có sẵn hoặc tự chế thử thách kỷ luật của riêng bạn!
              </p>
              <button
                onClick={() => setFilterTab("available")}
                className="mt-4 px-4 py-2 text-xs font-black uppercase bg-indigo-600 hover:bg-yellow-300 text-white hover:text-black border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
              >
                Nhận Thử Thách Ngay ⚡
              </button>
            </div>
          ) : (
            activeList.map((c) => {
              const progressPct = Math.min(100, Math.round((c.currentValue / c.targetValue) * 100));
              return (
                <div key={c.id} className="p-4 bg-white border-2 border-black rounded-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{c.emoji}</span>
                      <div>
                        <h4 className="font-black text-sm uppercase leading-tight">{c.name}</h4>
                        <span className="text-[10px] text-gray-500 font-mono font-bold">KHỞI ĐẦU: {c.startDate}</span>
                      </div>
                    </div>
                    <span className="text-xs bg-yellow-105 bg-yellow-300 text-black border border-black font-black px-2.5 py-0.5 rounded-full shadow font-mono">
                      +{c.rewardPoints} PTS
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-700 leading-relaxed mb-4">
                    {c.description}
                  </p>

                  <div className="mb-4">
                    <div className="flex justify-between items-center text-xs font-black font-mono mb-1">
                      <span>TIẾN ĐỘ THỰC HIỆN:</span>
                      <span className="text-indigo-600 font-bold">{c.currentValue} / {c.targetValue} Ngày</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-[#F0F2F5] border-2 border-black rounded-full h-4 overflow-hidden relative shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                      <div
                        className="bg-emerald-400 h-full border-r border-black transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCheckIn(c.id)}
                      className="flex-1 py-2 text-xs font-black uppercase bg-emerald-400 border-2 border-black rounded-xl hover:bg-yellow-300 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Check className="w-4 h-4" /> Điểm danh 1 Ngày
                    </button>
                    <button
                      onClick={() => handleFailChallenge(c.id, true)}
                      className="p-2 text-xs font-black bg-rose-300 border-2 border-black rounded-xl hover:bg-rose-400 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all flex items-center justify-center cursor-pointer text-black"
                      title="Bỏ cuộc / Đóng Thất bại"
                    >
                      <X className="w-4 h-4" /> Bỏ dở
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {/* Render past records of completed/failed if they exist */}
          {completedList.length > 0 && (
            <div className="mt-8 border-t-2 border-black pt-4">
              <h4 className="text-xs font-black uppercase text-gray-500 mb-3 tracking-wider">Hành trình thử thách trong quá khứ</h4>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {completedList.map((c) => (
                  <div key={c.id} className="p-3 bg-slate-50 border border-black rounded-xl flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{c.emoji}</span>
                      <div>
                        <span className="font-extrabold text-black block truncate max-w-[160px]">{c.name}</span>
                        <span className="text-[9px] font-mono font-bold text-gray-400 block uppercase">
                          {c.status === "completed" ? "Thành công 🎉" : "Bị hủy ngang ❌"}
                        </span>
                      </div>
                    </div>
                    <span className={`font-mono text-[10px] font-black px-2 py-0.5 border border-black rounded-full shadow ${
                      c.status === "completed" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}>
                      {c.status === "completed" ? `+${c.rewardPoints} PTS` : "-12 PTS"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* PANEL 2: SELECT NEW PREDEFINED OR CREATE CUSTOM */}
      {filterTab === "available" && (
        <div className="space-y-5">
          
          {/* Preset templates */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-gray-500 tracking-wider">Chọn Thử Thách Đón Sẵn (Pre-defined)</h3>
            
            {availablePredefined.length === 0 ? (
              <p className="text-xs font-bold text-gray-600 pl-1 italic">Tất cả thử thách hiện có đều đã được kích hoạt chạy!</p>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {availablePredefined.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 bg-slate-50 hover:bg-[#FDF9F4] border-2 border-black rounded-2xl flex flex-col justify-between transition-all"
                  >
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{p.emoji}</span>
                        <h4 className="font-black text-sm uppercase text-gray-900 leading-tight">{p.name}</h4>
                      </div>
                      <span className="text-xs bg-yellow-300 font-mono font-black px-2.5 py-0.5 border border-black rounded-full shadow shrink-0">
                        +{p.rewardPoints} PTS
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-700 leading-relaxed mb-4">
                      {p.description}
                    </p>

                    <div className="flex justify-between items-center mt-auto">
                      <span className="text-[10px] font-mono font-black text-gray-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" /> THỜI HẠN: {p.targetValue} NGÀY KHỔ LUYỆN
                      </span>
                      <button
                        onClick={() => handleStartChallenge(p)}
                        className="px-4 py-1.5 text-xs font-black uppercase bg-indigo-600 text-white hover:bg-yellow-300 hover:text-black border-2 border-black rounded-xl transition cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      >
                        Kích hoạt ⚡
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Toggle / Form Custom challenge builder */}
          <div className="border-t-2 border-black pt-4">
            {!isCreatingCustom ? (
              <button
                onClick={() => setIsCreatingCustom(true)}
                className="w-full py-3 text-xs font-black uppercase bg-yellow-300 hover:bg-indigo-600 hover:text-white border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Tự Thiết Kế Thử Thách Cá Nhân 📐
              </button>
            ) : (
              <form onSubmit={handleCreateCustom} className="p-4 border-2 border-black rounded-2xl bg-[#FDF9F4] space-y-3">
                <div className="flex items-center justify-between border-b border-black pb-1.5 mb-2">
                  <span className="text-[11px] font-black uppercase text-indigo-800">BẢN KHẢO SÁT KỶ LUẬT TỰ CHẾ</span>
                  <button
                    type="button"
                    onClick={() => setIsCreatingCustom(false)}
                    className="text-xs font-bold text-gray-500 hover:text-black"
                  >
                    Hủy
                  </button>
                </div>

                {/* Name */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase">Tên cuộc đấu tranh tài chính *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: 5 Ngày không ăn vặt lặt vặt"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-black rounded-lg text-xs outline-none focus:bg-yellow-50"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase">Giải trình cụ thể lý do & ranh giới</label>
                  <textarea
                    placeholder="Ví dụ: Chỉ ăn cơm mang ở nhà đi để tiết kiệm tiền trưa..."
                    value={customDesc}
                    onChange={(e) => setCustomDesc(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-white border border-black rounded-lg text-xs outline-none focus:bg-yellow-50 resize-none"
                  />
                </div>

                {/* Day selector & dynamic points calculation */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase">Số ngày rèn luyện (Days)</label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={customDays}
                      onChange={(e) => {
                        const days = Math.max(1, parseInt(e.target.value) || 1);
                        setCustomDays(days);
                        // Reward is dynamic: days * 3 (up to 50 cap)
                        setCustomPoints(Math.min(50, days * 3));
                      }}
                      className="w-full px-3 py-2 bg-white border border-black rounded-lg text-xs outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase">Điểm thưởng tối đa (Cap 50)</label>
                    <div className="w-full px-3 py-2 bg-slate-100 border border-black rounded-lg text-xs font-black text-indigo-700">
                      +{customPoints} PTS
                    </div>
                  </div>
                </div>

                {/* Emoji Selector list */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase">Biểu tượng thử thách (Emoji)</label>
                  <div className="flex gap-2">
                    {["🏆", "🚫", "☕", "🚴", "📚", "🥦", "🍎", "🛍️"].map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setCustomEmoji(em)}
                        className={`w-8 h-8 rounded-lg border border-black text-lg flex items-center justify-center bg-white cursor-pointer hover:bg-yellow-250 transition ${
                          customEmoji === em ? "bg-yellow-300 font-extrabold ring-2 ring-indigo-500" : ""
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 text-xs font-black uppercase bg-indigo-600 text-white hover:bg-yellow-300 hover:text-black border-2 border-black rounded-xl transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 cursor-pointer"
                >
                  Ban Hành Kế Hoạch 🚨
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* PANEL 3: BADGES DIRECTORY & STATUS */}
      {filterTab === "badges" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-black mb-1">
            <span>HUY HIỆU DANH DỰ ĐÃ ĐÓNG DẤU:</span>
            <span className="text-indigo-600 font-bold">{(userState.unlockedBadgeIds || []).length} / {BADGE_DIRECTORY.length} Huy Hiệu</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {BADGE_DIRECTORY.map((b) => {
              const unlockedList = userState.unlockedBadgeIds || [];
              const isUnlocked = unlockedList.includes(b.id);
              
              return (
                <div
                  key={b.id}
                  className={`p-3.5 border-2 border-black rounded-2xl flex items-start gap-3 transition-all ${
                    isUnlocked
                      ? "bg-yellow-50 shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)]"
                      : "bg-slate-50 opacity-60 pointer-events-none"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl border-2 border-black text-2xl flex items-center justify-center shrink-0 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] ${
                    isUnlocked ? "bg-yellow-300" : "bg-gray-200"
                  }`}>
                    {isUnlocked ? b.emoji : <Lock className="w-5 h-5 text-gray-400" />}
                  </div>

                  <div>
                    <h5 className={`font-black text-xs uppercase leading-tight ${isUnlocked ? "text-slate-900" : "text-gray-400"}`}>
                      {b.name}
                    </h5>
                    <p className="text-[10px] text-gray-500 font-medium leading-normal mt-0.5">
                      {isUnlocked ? b.description : `Mở khóa: ${b.conditionDesc}`}
                    </p>
                    {isUnlocked && (
                      <span className="text-[8px] font-mono font-black text-indigo-700 uppercase bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded inline-block mt-2">
                        ĐÃ UNLOCKED ✅
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
