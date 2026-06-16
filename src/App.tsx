import React, { useState, useEffect } from "react";
import NewProposalForm from "./components/NewProposalForm";
import BoardRoom from "./components/BoardRoom";
import DisciplineChallenges from "./components/DisciplineChallenges";
import OnboardingFlow from "./components/OnboardingFlow";
import UserProfileCard from "./components/UserProfileCard";
import DashboardTab from "./components/DashboardTab";
import NewProposalTab from "./components/NewProposalTab";
import BoardRoomTab from "./components/BoardRoomTab";
import GoalsTab from "./components/GoalsTab";
import HistoryTab from "./components/HistoryTab";
import { UserFinancialState, DebateResult, DecisionRecord, BOARD_MEMBERS, FinancialProfile } from "./types";
import {
  TrendingUp,
  Award,
  Wallet as WalletIcon,
  Skull,
  UserCheck,
  RotateCcw,
  BookOpen,
  DollarSign,
  AlertOctagon,
  ChevronRight,
  Sparkles,
  Info,
  LayoutDashboard,
  PlusCircle,
  Scale,
  Target,
  History
} from "lucide-react";

// Pre-populated history to onboard the user immediately and gamify the experience
const DEFAULT_HISTORY: DecisionRecord[] = [
  {
    id: "hist-1",
    timestamp: new Date(Date.now() - 24 * 3600 * 1000).toLocaleString("vi-VN"),
    proposalName: "Trả góp kính Apple Vision Pro để code cho phiêu",
    amount: 95000000,
    income: 25000000,
    savings: 12000000,
    context: "Muốn trải nghiệm không gian làm việc 3D tối tân phục vụ sự nghiệp.",
    debateResult: {
      theme: "Bắt trend quá đà",
      debateSteps: [],
      votes: [
        { memberId: "cto", memberName: "Giám Đốc Tích Lũy", vote: "reject", reason: "Mua xong cái kính này thì ngủ gầm cầu cũng bằng 3D chân thực!" },
        { memberId: "cro", memberName: "Giám Đốc Rủi Ro", vote: "reject", reason: "Tiền tích lũy không đủ mua nửa cái kính, sụp đổ tài chính diện rộng." },
        { memberId: "wallet", memberName: "Cổ Đông Ví Tiền", vote: "reject", reason: "Tao từ chối thanh toán khoản nợ thế kỷ này!" },
        { memberId: "cxo", memberName: "Giám Đốc Trải Nghiệm", vote: "approve", reason: "Trải nghiệm kính này tương đương 5 vế máy bay đi Thái Lan khứ hồi." }
      ],
      conclusion: {
        approved: false,
        summary: "Đề xuất bị bác bỏ toàn tập. Một hành vi larping công nghệ vô nghĩa.",
        disciplineImpact: -25
      }
    },
    userAction: "defied",
    scoreChange: -25,
    previousScore: 100,
    newScore: 75
  },
  {
    id: "hist-2",
    timestamp: new Date(Date.now() - 12 * 3600 * 1000).toLocaleString("vi-VN"),
    proposalName: "Đăng ký khóa học Đầu tư cổ phiếu tăng trưởng",
    amount: 3500000,
    income: 25000000,
    savings: 15400000,
    context: "Để học cách nhân đôi tài khoản từ từ, không chơi đỏ đen.",
    debateResult: {
      theme: "Đầu tư trí tuệ",
      debateSteps: [],
      votes: [
        { memberId: "cgo", memberName: "Giám Đốc Tăng Trưởng", vote: "approve", reason: "Khoản đầu tư tốt nhất chính là vào bộ não của CEO!" },
        { memberId: "cto", memberName: "Giám Đốc Tích Lũy", vote: "approve", reason: "Nên học để ngừng ôm mấy con coin cỏ vô định." },
        { memberId: "cho", memberName: "Giám Đốc Giải Trí", vote: "abstain", reason: "Không vui lắm nhưng thôi cũng có ích cho tương lai." }
      ],
      conclusion: {
        approved: true,
        summary: "HĐQT đánh giá cao ý chí học hỏi của CEO. Thông qua ngay.",
        disciplineImpact: 10
      }
    },
    userAction: "obeyed",
    scoreChange: 10,
    previousScore: 75,
    newScore: 85
  }
];

export default function App() {
  const [userState, setUserState] = useState<UserFinancialState | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentTab, setCurrentTab] = useState<"dashboard" | "new-proposal" | "boardroom" | "goals" | "history">("dashboard");
  const [isLoading, setIsLoading] = useState(false);
  const [funnyLoadingText, setFunnyLoadingText] = useState("");
  const [activeProposal, setActiveProposal] = useState<{
    proposalName: string;
    amount: number;
    context: string;
  } | null>(null);
  const [activeDebate, setActiveDebate] = useState<DebateResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedMemberInfo, setSelectedMemberInfo] = useState<string>("chairman");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<DecisionRecord | null>(null);

  // Load from API instead of localStorage
  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data && Object.keys(data).length > 0) {
          if (!data.challenges) data.challenges = [];
          if (!data.unlockedBadgeIds) data.unlockedBadgeIds = [];
          setUserState(data);
        } else {
          setUserState({
            income: 25000000,
            savings: 65000000,
            investments: 15000000,
            disciplineScore: 85,
            history: DEFAULT_HISTORY,
            challenges: [],
            unlockedBadgeIds: [],
            onboardingCompleted: false,
            financialProfile: {
              active_goals: [
                {
                  goal_id: "g1",
                  title: "Mua iPhone 16 Pro Max",
                  target_amount: 35000000,
                  current_amount: 15000000,
                  deadline: "2026-12-30"
                },
                {
                  goal_id: "g2",
                  title: "Quỹ Emergency Fund (Trú Ẩn)",
                  target_amount: 100000000,
                  current_amount: 65000000,
                  deadline: "2027-06-30"
                }
              ]
            } as unknown as FinancialProfile
          });
        }
      })
      .catch((e) => {
        console.error("Failed to load profile", e);
        setUserState({
          income: 25000000,
          savings: 65000000,
          investments: 15000000,
          disciplineScore: 85,
          history: DEFAULT_HISTORY,
          challenges: [],
          unlockedBadgeIds: [],
          onboardingCompleted: false
        });
      })
      .finally(() => setIsInitializing(false));
  }, []);

  // Save changes to API
  useEffect(() => {
    if (userState && !isInitializing) {
      fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userState)
      }).catch(console.error);
    }
  }, [userState, isInitializing]);

  // Loading fun messages
  useEffect(() => {
    if (isLoading) {
      const messages = [
        "Chủ tịch đang gõ búa đòi trật tự cuộc họp khẩn... 🔨",
        "Giám đốc Tích lũy đang ôm lợn đất lo sợ mất ngủ... 🐷",
        "Giám đốc Trải nghiệm đang quy đổi số tiền sang số cốc trà sữa và chuyến bay... ✈️",
        "Giám đốc May Mắn đang ngắm nghía giải Jackpot 100 tỷ VND... 🍀",
        "Thánh Ví Tiền đang khóc nức nở trong xó tối... 💸",
        "Giám đốc Rủi Ro đang tính toán ngày thất nghiệp của bạn... 🛡️",
        "CGO đang tính lãi suất kép nếu tích lũy thâu đêm... 📈",
        "Chairman đang ký kháp biểu quyết bằng mực đỏ chót... 🕴️"
      ];
      setFunnyLoadingText(messages[0]);
      const interval = setInterval(() => {
        const next = messages[Math.floor(Math.random() * messages.length)];
        setFunnyLoadingText(next);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const handleOnboardingComplete = (data: {
    income: number;
    savings: number;
    investments: number;
    financialProfile: any;
  }) => {
    setUserState((prev) => ({
      ...prev,
      income: data.income,
      savings: data.savings,
      investments: data.investments,
      financialProfile: data.financialProfile,
      onboardingCompleted: true
    }));
  };

  const handleProfileSave = (updated: {
    income: number;
    savings: number;
    investments: number;
    financialProfile: any;
  }) => {
    setUserState((prev) => ({
      ...prev,
      income: updated.income,
      savings: updated.savings,
      investments: updated.investments,
      financialProfile: updated.financialProfile
    }));
  };

  // Form submit -> fetch debate from Express + Gemini
  const handleProposalSubmit = async (proposal: {
    proposalName: string;
    amount: number;
    context: string;
  }) => {
    setCurrentTab("boardroom");
    setIsLoading(true);
    setApiError(null);
    setActiveProposal(proposal);

    const payload = {
      proposalName: proposal.proposalName,
      amount: proposal.amount,
      income: userState!.income, // use current registered state values
      savings: userState!.savings,
      investments: userState!.investments || 0,
      disciplineScore: userState!.disciplineScore,
      context: proposal.context,
      financialProfile: userState!.financialProfile
    };

    try {
      const res = await fetch("/api/board/debate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gặp lỗi khi đệ trình lên Hội Đồng Quản Trị.");
      }

      const debateResultData: DebateResult = await res.json();
      setActiveDebate(debateResultData);
    } catch (error: any) {
      console.error(error);
      setApiError(error.message || "Không thể kết nối đến máy chủ HĐQT. Vui lòng kiểm tra API key.");
      setActiveProposal(null);
    } finally {
      setIsLoading(false);
    }
  };

  // User decides to obey or defy the joint board vote
  const handleUserDecision = (action: "obeyed" | "defied") => {
    if (!activeProposal || !activeDebate) return;

    let previousScore = userState!.disciplineScore;
    let scoreChange = 0;
    let newScore = previousScore;

    // Calculate score change based on decision alignment
    const isApproved = activeDebate.conclusion.approved;
    const impact = activeDebate.conclusion.disciplineImpact;

    if (action === "obeyed") {
      // Obeying is always rewarded, especially when saying no to spending (rejected) or yes to smart investments
      scoreChange = isApproved ? 8 : 15;
    } else {
      // Defying can be high-cost
      if (!isApproved) {
        // Board rejected but player still bought it => massive deduction
        scoreChange = impact || -20;
      } else {
        // Board approved (e.g. self-investment) but player chose NOT to do it => minor deduction
        scoreChange = -5;
      }
    }

    // Apply strict bounds to score [0 - 100]
    newScore = Math.max(0, Math.min(100, previousScore + scoreChange));

    // Update real savings or income based on purchase if they actually spent/bought
    let updatedSavings = userState!.savings;
    // If board approved and they obeyed, or board rejected but they defied, they are spending the money
    const spentMoney = (isApproved && action === "obeyed") || (!isApproved && action === "defied");
    if (spentMoney) {
      updatedSavings = Math.max(0, updatedSavings - activeProposal.amount);
    }

    const newRecord: DecisionRecord = {
      id: "hist-" + Date.now(),
      timestamp: new Date().toLocaleString("vi-VN"),
      proposalName: activeProposal.proposalName,
      amount: activeProposal.amount,
      income: userState!.income,
      savings: userState!.savings,
      context: activeProposal.context,
      debateResult: activeDebate,
      userAction: action,
      scoreChange,
      previousScore,
      newScore
    };

    setUserState((prev) => ({
      ...prev!,
      savings: updatedSavings,
      disciplineScore: newScore,
      history: [newRecord, ...prev!.history]
    }));

    // Clear active card to allow next proposal
    setActiveProposal(null);
    setActiveDebate(null);
    setCurrentTab("dashboard");
  };

  const handleResetDebate = () => {
    setActiveProposal(null);
    setActiveDebate(null);
    setApiError(null);
    setCurrentTab("new-proposal");
  };

  const handleClearHistory = () => {
    setShowClearConfirm(true);
  };

  const executeClearHistory = () => {
    setUserState({
      income: 25000000,
      savings: 65000000,
      investments: 15000000,
      disciplineScore: 85,
      history: [],
      challenges: [],
      unlockedBadgeIds: [],
      onboardingCompleted: true
    });
    setShowClearConfirm(false);
  };

  if (isInitializing || !userState) {
    return (
      <div className="w-full min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center">
        <div className="animate-spin text-4xl mb-4">⚙️</div>
        <h2 className="font-black text-xl uppercase tracking-tighter">Đang kết nối HĐQT...</h2>
      </div>
    );
  }

  // Helper to render score description & level
  const getDisciplineLevel = (score: number) => {
    if (score >= 90) return { label: "Kỷ Luật Thép 👑", css: "text-emerald-600 bg-emerald-100", roast: "HĐQT cúi đầu thán phục." };
    if (score >= 70) return { label: "Tương Đối Uy Tín 👍", css: "text-blue-600 bg-blue-100", roast: "Chưa bị gõ búa nhiều lắm." };
    if (score >= 40) return { label: "Nuông Chiều Bản Thân 🍩", css: "text-amber-600 bg-amber-100", roast: "Chuẩn bị thắt lưng buộc bụng." };
    return { label: "TOXIC LEVEL 💔", css: "text-rose-500 bg-rose-100", roast: "Hán tử phá hoại tài chính quốc gia!" };
  };

  const levelInfo = getDisciplineLevel(userState.disciplineScore);

  if (!userState.onboardingCompleted) {
    return (
      <div className="w-full min-h-screen bg-[#F0F2F5] flex flex-col font-sans overflow-x-hidden text-black relative select-none">
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F0F2F5] flex flex-col font-sans overflow-x-hidden text-black relative select-none">
      <style>{`
        /* Neo-brutalist custom styled scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #F0F2F5;
          border-left: 2px solid #000;
        }
        ::-webkit-scrollbar-thumb {
          background: #000;
          border-radius: 4px;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
          display: flex;
          width: 200%;
        }
      `}</style>

      {/* Top Bar: Meeting Status */}
      <header className="h-16 bg-white border-b-4 border-black flex items-center justify-between px-4 md:px-8 shrink-0 z-10 shadow-[0_2px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 border-2 border-black rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            🕴️
          </div>
          <div>
            <h1 className="text-sm md:text-lg font-black uppercase tracking-tighter leading-none">Hội Đồng Quản Trị Tài Chính</h1>
            <span className="text-[10px] uppercase font-mono tracking-widest text-gray-500 font-bold block pt-0.5">Your Life Financial Board v1.2</span>
          </div>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          {/* User info */}
          <div className="flex flex-col items-end shrink-0 bg-slate-50 border-2 border-black px-2.5 py-1 rounded-xl text-right max-w-[150px]">
            <span className="text-[8px] font-black text-indigo-700 uppercase tracking-widest leading-none">CEO ĐANG ĐĂNG NHẬP</span>
            <span className="font-black text-xs text-slate-800 tracking-tight block truncate w-full mt-0.5">
              👤 {userState.financialProfile?.username || "Sếp Tổng"}
            </span>
          </div>

          <div className="flex flex-col items-end shrink-0">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Kỷ luật (Discipline)</span>
            <span className={`font-black text-xs md:text-sm mt-0.5 ${userState.disciplineScore >= 70 ? "text-emerald-700" : userState.disciplineScore >= 40 ? "text-amber-500" : "text-rose-600"}`}>
              {userState.disciplineScore}%
            </span>
          </div>
          
          <div className="hidden sm:block h-10 w-[2px] bg-gray-200 border-l border-black"></div>
          
          <button
            onClick={() => {
              setShowLogoutConfirm(true);
            }}
            className="px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-200 border-2 border-black rounded-xl font-black text-[11px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1 shrink-0"
            title="Đăng xuất"
          >
            🚪 <span className="hidden md:inline">ĐĂNG XUẤT</span>
          </button>
        </div>
      </header>

      {/* 5-Tab Navigation Bar */}
      <nav className="bg-white border-b-4 border-black px-4 md:px-8 py-2.5 shrink-0 z-10 shadow-[0_2px_0px_0px_rgba(0,0,0,1)] sticky top-0 overflow-x-auto whitespace-nowrap">
        <div className="max-w-7xl mx-auto flex gap-2 md:gap-4 justify-start lg:justify-center">
          <button
            onClick={() => setCurrentTab("dashboard")}
            className={`px-4 py-2 rounded-xl border-2 border-black font-black uppercase text-xs tracking-tight transition cursor-pointer flex items-center gap-1.5 ${
              currentTab === "dashboard"
                ? "bg-indigo-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                : "bg-slate-50 text-black hover:bg-yellow-300 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Chỉ Huy (Dashboard)</span>
          </button>

          <button
            onClick={() => setCurrentTab("new-proposal")}
            className={`px-4 py-2 rounded-xl border-2 border-black font-black uppercase text-xs tracking-tight transition cursor-pointer flex items-center gap-1.5 ${
              currentTab === "new-proposal"
                ? "bg-indigo-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                : "bg-slate-50 text-black hover:bg-yellow-300 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Đề xuất mới</span>
          </button>

          <button
            onClick={() => setCurrentTab("boardroom")}
            className={`px-4 py-2 rounded-xl border-2 border-black font-black uppercase text-xs tracking-tight transition cursor-pointer flex items-center gap-1.5 ${
              currentTab === "boardroom"
                ? "bg-indigo-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                : "bg-slate-50 text-black hover:bg-yellow-300 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Phòng họp HĐQT {activeDebate ? "🔴" : ""}</span>
          </button>

          <button
            onClick={() => setCurrentTab("goals")}
            className={`px-4 py-2 rounded-xl border-2 border-black font-black uppercase text-xs tracking-tight transition cursor-pointer flex items-center gap-1.5 ${
              currentTab === "goals"
                ? "bg-indigo-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                : "bg-slate-50 text-black hover:bg-yellow-300 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Mục tiêu & Thử thách</span>
          </button>

          <button
            onClick={() => setCurrentTab("history")}
            className={`px-4 py-2 rounded-xl border-2 border-black font-black uppercase text-xs tracking-tight transition cursor-pointer flex items-center gap-1.5 ${
              currentTab === "history"
                ? "bg-indigo-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                : "bg-slate-50 text-black hover:bg-yellow-300 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Tàng thư phán quyết</span>
          </button>
        </div>
      </nav>

      {/* Main Workspace Grid */}
      <main className="flex-1 flex flex-col lg:flex-row gap-6 p-4 md:p-6 pb-20 max-w-7xl w-full mx-auto">
        {/* Main interactive Tab view space */}
        <div className="flex-1 min-w-0">
          {/* API Errors */}
          {apiError && (
            <div className="mb-6 bg-red-50 border-4 border-black rounded-2xl p-4 text-black flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <AlertOctagon className="w-8 h-8 text-rose-600 shrink-0" />
              <div>
                <h5 className="font-black uppercase text-sm text-red-800">Không thể chất vấn thành viên</h5>
                <p className="text-xs font-semibold">{apiError}</p>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="bg-white border-4 border-black rounded-3xl p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center text-center min-h-[460px] relative overflow-hidden">
              <div className="absolute inset-0 bg-yellow-50 opacity-40 pointer-events-none" />
              <div className="w-24 h-24 bg-indigo-600 border-4 border-black text-white rounded-full flex items-center justify-center font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-4xl animate-spin mb-6">
                ⚖️
              </div>
              <h3 className="text-2xl font-black uppercase text-black tracking-tight">Hội đồng đang kịch liệt tranh cãi...</h3>
              <p className="text-md text-gray-800 font-bold max-w-md mt-4 animate-pulse bg-yellow-101 border border-black p-3.5 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {funnyLoadingText}
              </p>
              <div className="mt-8 flex gap-2">
                <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce delay-100 border border-black"></div>
                <div className="w-3 h-3 bg-rose-500 rounded-full animate-bounce delay-200 border border-black"></div>
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce delay-300 border border-black"></div>
                <div className="w-3 h-3 bg-amber-400 rounded-full animate-bounce delay-400 border border-black"></div>
              </div>
            </div>
          ) : (
            <>
              {currentTab === "dashboard" && (
                <DashboardTab
                  userState={userState}
                  onNavigateToNewProposal={() => setCurrentTab("new-proposal")}
                  onNavigateToGoals={() => setCurrentTab("goals")}
                />
              )}

              {currentTab === "new-proposal" && (
                <NewProposalTab
                  onSubmit={handleProposalSubmit}
                  isLoading={isLoading}
                />
              )}

              {currentTab === "boardroom" && (
                <BoardRoomTab
                  proposalName={activeProposal ? activeProposal.proposalName : null}
                  amount={activeProposal ? activeProposal.amount : null}
                  activeDebate={activeDebate}
                  onUserSubmitDecision={handleUserDecision}
                  onReset={handleResetDebate}
                  onNavigateToNewProposal={() => setCurrentTab("new-proposal")}
                />
              )}

              {currentTab === "goals" && (
                <GoalsTab
                  userState={userState}
                  onUpdateUserState={setUserState}
                />
              )}

              {currentTab === "history" && (
                <HistoryTab
                  history={userState.history}
                  onClearHistory={handleClearHistory}
                />
              )}
            </>
          )}
        </div>

        {/* Sidebar: Profile card + Board directory info */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
          <UserProfileCard userState={userState} onSave={handleProfileSave} />

          {/* Quick board roster handbook (Visual style addition) */}
          <div className="bg-white border-4 border-black rounded-3xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black">
            <h4 className="font-black text-xs uppercase border-b-2 border-black pb-2 mb-3">🕴️ DANH SÁCH THÀNH VIÊN HĐQT</h4>
            <div className="space-y-3">
              {Object.entries(BOARD_MEMBERS).map(([id, val]) => (
                <div key={id} className="flex gap-2.5 items-start text-xs border-b border-dashed border-slate-150 pb-2 mb-2 last:border-0 last:pb-0 last:mb-0">
                  <span className="text-xl bg-slate-50 border border-black rounded p-1 shadow-sm shrink-0">{val.emoji}</span>
                  <div>
                    <strong className="text-slate-900 font-bold block">{val.name}</strong>
                    <span className="text-[10px] text-gray-400 font-mono font-bold leading-none uppercase">{val.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button (Mobile & Desktop) */}
      {userState.onboardingCompleted && (
        <div className="fixed bottom-16 right-4 md:right-8 z-40 md:bottom-8">
          <button
            onClick={() => {
              setCurrentTab("new-proposal");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="group flex items-center gap-2 bg-indigo-600 hover:bg-yellow-300 text-white hover:text-black border-4 border-black px-4 py-3 md:px-5 md:py-4 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1 cursor-pointer"
          >
            <span className="text-xl md:text-2xl leading-none">⚖️</span>
            <span className="font-black uppercase tracking-tight text-xs md:text-sm whitespace-nowrap hidden group-hover:block transition-all">Đệ Trình Mới</span>
          </button>
        </div>
      )}

      {/* Footer Rotating Ticker */}
      <footer className="fixed bottom-0 left-0 right-0 h-11 bg-black flex items-center overflow-hidden z-30 border-t-2 border-black shadow-inner">
        <div className="flex whitespace-nowrap animate-marquee font-mono">
          <span className="text-white text-[10px] font-black uppercase tracking-widest px-8">🕴️ CHỦ TỊCH: PHÁN QUYẾT LÀ TỐI THƯỢNG, MIỄN CUỘC TRANSACTION NGU NGỐC</span>
          <span className="text-amber-300 text-[10px] font-black uppercase tracking-widest px-8">🍿 GIÁM ĐỐC GIẢI TRÍ: KHÔNG PHẢI MỌI PHÚT CHỮA LÀNH ĐỀU LÀ CHI SÁT</span>
          <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest px-8">🐷 GIÁM ĐỐC TÍCH LŨY: NGƯỜI GIÀU KHÔNG CHẠY NHANH - HỌ GỬI TIẾT KIỆM ĐỀU ĐẶN</span>
          <span className="text-pink-400 text-[10px] font-black uppercase tracking-widest px-8">💸 CỔ ĐÔNG VÍ TIỀN: TAO SẮP XỈU RỒI, ĐỪNG QUẸT THẺ TÍN DỤNG NỮA LÀM ƠN</span>
          <span className="text-rose-400 text-[10px] font-black uppercase tracking-widest px-8">🛡️ GIÁM ĐỐC RỦI RO: KẾ HOẠCH ĐẸP LẮM NHƯNG CUỘC ĐỜI KHÔNG ĐỌC POWERPOINT CỦA BẠN</span>
          <span className="text-violet-400 text-[10px] font-black uppercase tracking-widest px-8">📈 CGO: 20 TRIỆU HÔM NAY LÀ IPHONE - 20 TRIỆU ĐẦU TƯ LÀ CƠ HỘI X5 SAU CHỤC NĂM</span>
          <span className="text-lime-300 text-[10px] font-black uppercase tracking-widest px-8">🍀 GIÁM ĐỐC MAY MẮN: LÀM CẢ ĐỜI KHÔNG BẰNG MỘT LẦN VẬN ĐỎ, ĐẬP 10K VIETLOTT RỒI ĐỜI LÊN HƯƠNG</span>
        </div>
      </footer>

      {/* Custom Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black p-6 rounded-3xl max-w-sm w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-black">
            <div className="flex items-center gap-2 mb-3 border-b-2 border-black pb-2">
              <span className="text-2xl">🚪</span>
              <h3 className="text-md font-black uppercase tracking-tight">XÁC NHẬN ĐĂNG XUẤT</h3>
            </div>
            <p className="text-xs font-bold text-gray-700 leading-relaxed font-sans">
              Sếp có muốn tạm biệt Hội Đồng Quản Trị tuần này? Trạng thái tài chính và các phán quyết của sếp vẫn được HĐQT giữ lại bảo mật trên thiết bị này.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 border-2 border-black rounded-xl font-bold text-xs uppercase cursor-pointer text-center text-black font-sans"
              >
                HỦY
              </button>
              <button
                onClick={() => {
                  setUserState((prev: any) => ({ ...prev, onboardingCompleted: false }));
                  setShowLogoutConfirm(false);
                }}
                className="py-2.5 px-4 bg-rose-500 hover:bg-rose-600 border-2 border-black rounded-xl font-black text-xs uppercase cursor-pointer text-center text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-sans"
              >
                ĐĂNG XUẤT 🚪
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Clear History Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black p-6 rounded-3xl max-w-sm w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-black">
            <div className="flex items-center gap-2 mb-3 border-b-2 border-black pb-2">
              <span className="text-2xl">🚨</span>
              <h3 className="text-md font-black uppercase tracking-tight">DỌN SẠCH BIÊN BẢN HỌP</h3>
            </div>
            <p className="text-xs font-bold text-gray-700 leading-relaxed font-sans">
              Hành động này sẽ xóa sạch sành sanh toàn bộ lịch sử tranh luận tích lũy... Sếp chắc chắn chứ?
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 border-2 border-black rounded-xl font-bold text-xs uppercase cursor-pointer text-center text-black font-sans"
              >
                GIỮ LẠI
              </button>
              <button
                onClick={executeClearHistory}
                className="py-2.5 px-4 bg-red-600 hover:bg-red-700 border-2 border-black rounded-xl font-black text-xs uppercase cursor-pointer text-center text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-sans"
              >
                XÓA SẠCH 💥
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Detail Modal */}
      {selectedHistoryItem && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border-4 border-black p-6 rounded-3xl max-w-xl w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-black my-8 relative">
            <button
              onClick={() => setSelectedHistoryItem(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black cursor-pointer bg-gray-100 rounded-full p-1"
            >
              ❌
            </button>
            <div className="flex items-center gap-2 mb-4 border-b-2 border-black pb-3 pr-8">
              <span className="text-3xl">🗂️</span>
              <div>
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-indigo-600">CHI TIẾT MỘT PHÁN QUYẾT BẤT HỦ</span>
                <h3 className="font-black text-lg uppercase leading-tight mt-0.5">{selectedHistoryItem.proposalName}</h3>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <div className="px-3 py-1.5 bg-yellow-300 border-2 border-black rounded-lg text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase">
                  💵 Trị giá: {(selectedHistoryItem.amount / 1000000).toFixed(1)} TRIỆU
                </div>
                <div className={`px-3 py-1.5 border-2 border-black rounded-lg text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex gap-1 uppercase ${selectedHistoryItem.debateResult.conclusion.approved ? 'bg-emerald-300' : 'bg-rose-300'}`}>
                  <span>{selectedHistoryItem.debateResult.conclusion.approved ? '✅ HĐQT THÔNG QUA' : '❌ HĐQT BÁC BỎ'}</span>
                </div>
                <div className={`px-3 py-1.5 border-2 border-black rounded-lg text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase ${selectedHistoryItem.userAction === 'obeyed' ? 'bg-indigo-300' : 'bg-orange-300'}`}>
                  {selectedHistoryItem.userAction === 'obeyed' ? '🙏 CEO ĐÃ NGOAN NGOÃN' : '🖕 CEO PHẢN NGHỊCH'}
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-2 border-black rounded-xl">
                <span className="text-[10px] uppercase font-black tracking-wider text-gray-500 block">TÓM TẮT TỪ HĐQT:</span>
                <p className="text-sm font-bold italic mt-1 leading-relaxed text-slate-800">
                  "{selectedHistoryItem.debateResult.conclusion.summary}"
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-white border-2 border-dashed border-gray-400 rounded-xl">
                <span className="text-xs uppercase font-black text-gray-600">ĐIỂM KỶ LUẬT THAY ĐỔI:</span>
                <span className={`font-black font-mono text-xl ${selectedHistoryItem.scoreChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {selectedHistoryItem.scoreChange >= 0 ? '+' : ''}{selectedHistoryItem.scoreChange} ĐIỂM
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setSelectedHistoryItem(null)}
                className="w-full py-3.5 bg-indigo-600 hover:bg-yellow-300 text-white hover:text-black border-2 border-black rounded-xl font-black text-sm uppercase cursor-pointer transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                ĐÓNG HỒ SƠ 📂
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
