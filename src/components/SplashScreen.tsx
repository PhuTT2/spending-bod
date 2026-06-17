import React from "react";
import { Plane, Ticket, Wallet } from "lucide-react";

interface SplashScreenProps {
  onStart: () => void;
}

const FEATURES = [
  {
    icon: <Plane className="w-6 h-6" />,
    label: "Du lịch & đi lại",
    sublabel: "Đặt vé máy bay, tàu xe qua Zalopay",
    color: "bg-indigo-100 text-indigo-700",
  },
  {
    icon: <Ticket className="w-6 h-6" />,
    label: "Vé & giải trí",
    sublabel: "Mua vé xem phim, sự kiện qua Zalopay",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: <Wallet className="w-6 h-6" />,
    label: "Dịch vụ tài chính",
    sublabel: "Vay, tiết kiệm, bảo hiểm qua Zalopay",
    color: "bg-amber-100 text-amber-700",
  },
];

export default function SplashScreen({ onStart }: SplashScreenProps) {
  return (
    <div className="w-full min-h-screen bg-[#F0F2F5] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white border-4 border-black rounded-3xl p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-black relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-indigo-500 via-rose-400 to-amber-400 rounded-t-xl" />

          <div className="flex items-center gap-3 mb-6 mt-2">
            <div className="w-14 h-14 bg-indigo-600 border-4 border-black rounded-2xl flex items-center justify-center text-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              🕴️
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tighter leading-none">Hội đồng quản trị Tài Chính</h1>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Board of Directors</p>
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mb-2">
            Hội đồng quản trị tài chính{" "}
            <span className="text-indigo-600">dành riêng cho bạn</span>
          </h2>
          <p className="text-sm font-bold text-slate-600 mb-8">
            Trình mọi quyết định chi tiêu lớn cho hội đồng AI phán xét — trước khi bạn hối hận.
          </p>

          <div className="grid grid-cols-1 gap-3 mb-4">
            {FEATURES.map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-3 border-2 border-black rounded-2xl p-3.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className={`w-10 h-10 ${f.color} rounded-xl border-2 border-black flex items-center justify-center shrink-0`}>
                  {f.icon}
                </div>
                <div>
                  <span className="font-black text-sm block">{f.label}</span>
                  <span className="text-[11px] text-slate-500 font-semibold">{f.sublabel}</span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-[11px] text-slate-400 font-semibold mb-6">
            Được hỗ trợ bởi hệ sinh thái Zalopay
          </p>

          <button
            onClick={onStart}
            className="w-full py-4 bg-indigo-600 hover:bg-yellow-300 text-white hover:text-black border-4 border-black rounded-2xl font-black uppercase text-lg tracking-tight shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
          >
            Bắt đầu 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
