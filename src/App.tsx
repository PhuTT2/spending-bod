import React, { useState, useEffect } from "react";
import NewProposalTab from "./components/NewProposalTab";
import BoardRoomTab from "./components/BoardRoomTab";
import OnboardingFlow from "./components/OnboardingFlow";
import SplashScreen from "./components/SplashScreen";
import GoalsTab from "./components/GoalsTab";
import HistoryTab from "./components/HistoryTab";
import { ProfileView, DebateResponse, UserAction, BOARD_MEMBERS } from "./types";
import {
  AlertOctagon,
  PlusCircle,
  Scale,
  Target,
  History,
  ExternalLink,
} from "lucide-react";

type ProposalDraft = { proposal_name: string; amount: number; context: string; intent_hint?: string; selected_members?: string[] };
type Tab = "proposals" | "boardroom" | "goals" | "history";

const LOADING_MESSAGES = [
  "Chủ tịch đang gõ búa đòi trật tự cuộc họp khẩn... 🔨",
  "Giám đốc Tích lũy đang ôm lợn đất lo sợ mất ngủ... 🐷",
  "Giám đốc Trải nghiệm đang quy đổi tiền sang vé máy bay... ✈️",
  "Thánh Ví Tiền đang khóc nức nở trong xó tối... 💸",
  "Giám đốc Rủi Ro đang tính toán kịch bản xấu nhất... 🛡️",
  "CGO đang tính lãi suất kép thâu đêm... 📈",
];

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = err?.detail?.message || err?.detail || err?.error || "Đã có lỗi xảy ra.";
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }
  return res.json();
}

export default function App() {
  const [appState, setAppState] = useState<ProfileView | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showSplash, setShowSplash] = useState(false);
  const [currentTab, setCurrentTab] = useState<Tab>("proposals");
  const [isLoading, setIsLoading] = useState(false);
  const [funnyLoadingText, setFunnyLoadingText] = useState("");
  const [activeProposal, setActiveProposal] = useState<ProposalDraft | null>(null);
  const [activeDebate, setActiveDebate] = useState<DebateResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [proposalPrefill, setProposalPrefill] = useState<Partial<ProposalDraft> | null>(null);

  useEffect(() => {
    fetchJSON<ProfileView>("/api/profile")
      .then((data) => {
        setAppState(data);
        if (!data.onboarding_completed) setShowSplash(true);
      })
      .catch((e) => setApiError(e.message))
      .finally(() => setIsInitializing(false));
  }, []);

  useEffect(() => {
    if (!isLoading) return;
    setFunnyLoadingText(LOADING_MESSAGES[0]);
    const interval = setInterval(() => {
      setFunnyLoadingText(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
    }, 3000);
    return () => clearInterval(interval);
  }, [isLoading]);

  const persist = async (next: ProfileView) => {
    const saved = await fetchJSON<ProfileView>("/api/profile", { method: "PUT", body: JSON.stringify(next) });
    setAppState(saved);
    return saved;
  };

  const handleOnboardingComplete = (profile: ProfileView["profile"]) => {
    if (!appState) return;
    persist({ ...appState, onboarding_completed: true, profile }).catch((e) => setApiError(e.message));
  };

  const handleProfileSave = (profile: ProfileView["profile"]) => {
    if (!appState) return;
    persist({ ...appState, profile }).catch((e) => setApiError(e.message));
  };

  const handleStateEdit = (updater: (prev: ProfileView) => ProfileView) => {
    if (!appState) return;
    persist(updater(appState)).catch((e) => setApiError(e.message));
  };

  const handleProposalSubmit = async (proposal: ProposalDraft) => {
    setCurrentTab("boardroom");
    setIsLoading(true);
    setApiError(null);
    setActiveProposal(proposal);
    setProposalPrefill(null);
    try {
      const result = await fetchJSON<DebateResponse>("/api/proposals/debate", {
        method: "POST",
        body: JSON.stringify(proposal),
      });
      setActiveDebate(result);
    } catch (error: any) {
      setApiError(error.message || "Không thể kết nối tới Hội đồng quản trị.");
      setActiveProposal(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatProposalSuggestion = (draft: { proposal_name: string; amount: number; context: string }) => {
    setProposalPrefill(draft);
    setCurrentTab("proposals");
  };

  const handleUserDecision = async (action: UserAction) => {
    if (!activeProposal || !activeDebate) return;
    try {
      const updated = await fetchJSON<ProfileView>("/api/proposals/resolve", {
        method: "POST",
        body: JSON.stringify({
          proposal_name: activeProposal.proposal_name,
          amount: activeProposal.amount,
          context: activeProposal.context,
          evaluation: activeDebate.evaluation,
          narration: activeDebate.narration,
          user_action: action,
        }),
      });
      setAppState(updated);
    } catch (error: any) {
      setApiError(error.message);
    } finally {
      setActiveProposal(null);
      setActiveDebate(null);
      setCurrentTab("proposals");
    }
  };

  const handleResetDebate = () => {
    setActiveProposal(null);
    setActiveDebate(null);
    setApiError(null);
    setCurrentTab("proposals");
  };

  const executeClearHistory = () => {
    if (!appState) return;
    persist({ ...appState, history: [] }).catch((e) => setApiError(e.message));
    setShowClearConfirm(false);
  };

  const executeLogout = () => {
    if (!appState) return;
    persist({ ...appState, onboarding_completed: false }).catch((e) => setApiError(e.message));
    setShowLogoutConfirm(false);
    setShowSplash(true);
  };

  if (isInitializing || !appState) {
    return (
      <div className="w-full min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center">
        <div className="animate-spin text-4xl mb-4">⚙️</div>
        <h2 className="font-black text-xl uppercase tracking-tighter">Đang kết nối Hội đồng quản trị...</h2>
      </div>
    );
  }

  if (showSplash) {
    return <SplashScreen onStart={() => setShowSplash(false)} />;
  }

  if (!appState.onboarding_completed) {
    return (
      <div className="w-full min-h-screen bg-[#F0F2F5] flex flex-col font-sans overflow-x-hidden text-black relative select-none">
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  const { profile } = appState;

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "proposals", label: "Đề xuất", icon: <PlusCircle className="w-4 h-4" /> },
    { id: "boardroom", label: `Phòng họp${activeDebate ? " 🔴" : ""}`, icon: <Scale className="w-4 h-4" /> },
    { id: "goals", label: "Mục tiêu", icon: <Target className="w-4 h-4" /> },
    { id: "history", label: "Lịch sử", icon: <History className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full min-h-screen bg-[#F0F2F5] flex flex-col font-sans overflow-x-hidden text-black relative select-none">
      <style>{`
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #F0F2F5; border-left: 2px solid #000; }
        ::-webkit-scrollbar-thumb { background: #000; border-radius: 4px; }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 25s linear infinite; display: flex; width: 200%; }
      `}</style>

      <header className="h-16 bg-white border-b-4 border-black flex items-center justify-between px-4 md:px-8 shrink-0 z-10 shadow-[0_2px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 border-2 border-black rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            🕴️
          </div>
          <h1 className="text-sm md:text-lg font-black uppercase tracking-tighter leading-none">Hội đồng quản trị Tài Chính</h1>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex flex-col items-end shrink-0">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Kỷ luật</span>
            <span className={`font-black text-sm mt-0.5 ${profile.discipline_score >= 70 ? "text-emerald-700" : profile.discipline_score >= 40 ? "text-amber-500" : "text-rose-600"}`}>
              {profile.discipline_score}%
            </span>
          </div>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-200 border-2 border-black rounded-xl font-black text-[11px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all cursor-pointer shrink-0"
          >
            🚪 <span className="hidden md:inline">ĐĂNG XUẤT</span>
          </button>
        </div>
      </header>

      <nav className="bg-white border-b-4 border-black px-4 md:px-8 py-2.5 shrink-0 z-10 shadow-[0_2px_0px_0px_rgba(0,0,0,1)] sticky top-0 overflow-x-auto whitespace-nowrap">
        <div className="max-w-7xl mx-auto flex gap-2 md:gap-4 justify-start lg:justify-center">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`px-4 py-2 rounded-xl border-2 border-black font-black uppercase text-xs tracking-tight transition cursor-pointer flex items-center gap-1.5 ${
                currentTab === tab.id
                  ? "bg-indigo-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  : "bg-slate-50 text-black hover:bg-yellow-300 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-1 flex flex-col lg:flex-row gap-6 p-4 md:p-6 pb-20 max-w-7xl w-full mx-auto">
        <div className="flex-1 min-w-0">
          {apiError && (
            <div className="mb-6 bg-red-50 border-4 border-black rounded-2xl p-4 text-black flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <AlertOctagon className="w-8 h-8 text-rose-600 shrink-0" />
              <div>
                <h5 className="font-black uppercase text-sm text-red-800">Lỗi</h5>
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
              <h3 className="text-2xl font-black uppercase text-black tracking-tight">Hội đồng quản trị đang tranh luận...</h3>
              <p className="text-md text-gray-800 font-bold max-w-md mt-4 bg-yellow-50 border border-black p-3.5 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {funnyLoadingText}
              </p>
            </div>
          ) : (
            <>
              {currentTab === "proposals" && (
                <NewProposalTab
                  onSubmit={handleProposalSubmit}
                  isLoading={isLoading}
                  prefill={proposalPrefill}
                  displayName={profile.display_name}
                  onSubmitProposal={handleChatProposalSuggestion}
                />
              )}
              {currentTab === "boardroom" && (
                <BoardRoomTab
                  proposalName={activeProposal?.proposal_name ?? null}
                  amount={activeProposal?.amount ?? null}
                  activeDebate={activeDebate}
                  displayName={profile.display_name}
                  onUserSubmitDecision={handleUserDecision}
                  onReset={handleResetDebate}
                  onNavigateToNewProposal={() => setCurrentTab("proposals")}
                />
              )}
              {currentTab === "goals" && <GoalsTab appState={appState} onEdit={handleStateEdit} />}
              {currentTab === "history" && <HistoryTab history={appState.history} onClearHistory={() => setShowClearConfirm(true)} />}
            </>
          )}
        </div>

        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
          <div className="bg-white border-4 border-black rounded-3xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black">
            <h4 className="font-black text-xs uppercase border-b-2 border-black pb-2 mb-3">🕴️ Thành viên Hội đồng quản trị</h4>
            <div className="space-y-3">
              {Object.values(BOARD_MEMBERS).map((m) => (
                <div key={m.id} className="flex flex-col gap-1 border-b border-dashed border-slate-200 pb-2 mb-2 last:border-0 last:pb-0 last:mb-0">
                  <div className="flex gap-2.5 items-start text-xs">
                    <span className="text-xl bg-slate-50 border border-black rounded p-1 shadow-sm shrink-0">{m.emoji}</span>
                    <div>
                      <strong className="text-slate-900 font-bold block">{m.name}</strong>
                      <span className="text-[10px] text-gray-400 font-mono font-bold leading-none uppercase">{m.title}</span>
                    </div>
                  </div>
                  {m.zalopay_url && (
                    <a
                      href={m.zalopay_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-9 text-[10px] font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                    >
                      Mở trong Zalopay <ExternalLink className="w-2.5 h-2.5" /> →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-16 right-4 md:right-8 z-40 md:bottom-8">
        <button
          onClick={() => { setCurrentTab("proposals"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          className="group flex items-center gap-2 bg-indigo-600 hover:bg-yellow-300 text-white hover:text-black border-4 border-black px-4 py-3 md:px-5 md:py-4 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 transition-all cursor-pointer"
        >
          <span className="text-xl md:text-2xl leading-none">⚖️</span>
          <span className="font-black uppercase tracking-tight text-xs md:text-sm whitespace-nowrap hidden group-hover:block transition-all">Đệ Trình Mới</span>
        </button>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 h-11 bg-black flex items-center overflow-hidden z-30 border-t-2 border-black shadow-inner">
        <div className="flex whitespace-nowrap animate-marquee font-mono">
          <span className="text-white text-[10px] font-black uppercase tracking-widest px-8">🕴️ PHÁN QUYẾT LÀ TỐI THƯỢNG</span>
          <span className="text-amber-300 text-[10px] font-black uppercase tracking-widest px-8">🐷 NGƯỜI GIÀU GỬI TIẾT KIỆM ĐỀU ĐẶN</span>
          <span className="text-pink-400 text-[10px] font-black uppercase tracking-widest px-8">💸 ĐỪNG QUẸT THẺ NỮA LÀM ƠN</span>
          <span className="text-rose-400 text-[10px] font-black uppercase tracking-widest px-8">🛡️ KẾ HOẠCH ĐẸP, ĐỜI KHÔNG ĐỌC POWERPOINT</span>
        </div>
      </footer>

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black p-6 rounded-3xl max-w-sm w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-black">
            <h3 className="text-md font-black uppercase tracking-tight mb-3">Đăng xuất?</h3>
            <p className="text-xs font-bold text-gray-700 leading-relaxed">Dữ liệu của bạn vẫn được giữ lại.</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 border-2 border-black rounded-xl font-bold text-xs uppercase cursor-pointer">HỦY</button>
              <button onClick={executeLogout} className="py-2.5 px-4 bg-rose-500 hover:bg-rose-600 border-2 border-black rounded-xl font-black text-xs uppercase cursor-pointer text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">ĐĂNG XUẤT</button>
            </div>
          </div>
        </div>
      )}

      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black p-6 rounded-3xl max-w-sm w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-black">
            <h3 className="text-md font-black uppercase tracking-tight mb-3">Xóa toàn bộ lịch sử?</h3>
            <p className="text-xs font-bold text-gray-700 leading-relaxed">Hành động này không thể hoàn tác.</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button onClick={() => setShowClearConfirm(false)} className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 border-2 border-black rounded-xl font-bold text-xs uppercase cursor-pointer">GIỮ LẠI</button>
              <button onClick={executeClearHistory} className="py-2.5 px-4 bg-red-600 hover:bg-red-700 border-2 border-black rounded-xl font-black text-xs uppercase cursor-pointer text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">XÓA SẠCH</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
