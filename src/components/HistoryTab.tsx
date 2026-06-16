import React, { useState } from "react";
import { DecisionRecord, BOARD_MEMBERS } from "../types";
import { 
  Clock, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  XCircle, 
  FileText, 
  TrendingUp, 
  User, 
  Calendar,
  AlertTriangle,
  Award,
  BookOpen,
  HelpCircle,
  ThumbsUp,
  Flame,
  ArrowRight
} from "lucide-react";

interface HistoryTabProps {
  history: DecisionRecord[];
  onClearHistory: () => void;
}

export default function HistoryTab({ history, onClearHistory }: HistoryTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter history Chronologically (by default they are descending - newest first)
  const totalCount = history.length;
  const obedienceCount = history.filter((h) => h.userAction === "obeyed").length;
  const defianceCount = history.filter((h) => h.userAction === "defied").length;
  const obedienceRate = totalCount > 0 ? Math.round((obedienceCount / totalCount) * 100) : 100;

  const filteredHistory = history.filter((h) => 
    h.proposalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (h.context && h.context.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatVND = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  const getActionLabel = (act: string) => {
    switch (act) {
      case "save_more": return "Tích lũy tối đa 🐷";
      case "delay_purchase": return "Trì hoãn mua sắm ⏱️";
      case "use_bnpl": return "Mua trước trả sau 💳";
      case "switch_cheaper_option": return "Phương án thay thế rẻ hơn 🏷️";
      case "buy_insurance": return "Bảo hiểm phòng vệ 🛡️";
      case "increase_emergency_fund": return "Quỹ khống phòng thủ 🚨";
      case "allocate_to_investment": return "Điều chuyển đầu tư 📈";
      case "travel_fund_contribution": return "Gây quỹ trải nghiệm ✈️";
      case "save": return "Cắt giảm tự vệ 💸";
      case "purchase": return "Thẩm định kĩ lưỡng 🛒";
      default: return "Cải thiện dòng tiền 🧠";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="history-tab">
      
      {/* Visual Header */}
      <div className="bg-slate-900 border-4 border-black rounded-3xl p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] text-white text-center">
        <span className="text-3xl block">📖</span>
        <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight mt-2 text-indigo-400">
          Nhật ký Hành Trình Tài Chính
        </h2>
        <p className="text-xs text-indigo-200 mt-1.5 max-w-sm mx-auto leading-relaxed">
          Nơi lưu giữ lịch sử phán quyết và các bài học tích luỹ vĩ trị của sếp. Không có dữ liệu kĩ thuật khô khan, chỉ đắm chìm trong các cuộc biểu quyết, bài học xương máu và sự cải biến kỷ luật của CEO.
        </p>
      </div>

      {totalCount > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-black">
          <div className="p-4 bg-white border-2 border-black rounded-2xl shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)] text-center flex flex-col justify-center">
            <span className="text-xs font-black uppercase text-gray-500 font-mono tracking-wider block">TỜ TRÌNH ĐÃ PHÊ BIỂU</span>
            <span className="text-2xl font-black font-mono mt-1 text-slate-800">{totalCount} Trình</span>
          </div>

          <div className="p-4 bg-emerald-50 border-2 border-black rounded-2xl shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)] text-center flex flex-col justify-center">
            <span className="text-xs font-black uppercase text-emerald-800 font-mono tracking-wider block">CHỌN NGHE LỜI (OBEYED)</span>
            <span className="text-2xl font-black font-mono text-emerald-700 mt-1">{obedienceCount} Lần</span>
            <span className="text-[10px] font-bold text-emerald-600 block mt-0.5">Giữ vững phong phẩm: {obedienceRate}%</span>
          </div>

          <div className="p-4 bg-rose-50 border-2 border-black rounded-2xl shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)] text-center flex flex-col justify-center">
            <span className="text-xs font-black uppercase text-rose-800 font-mono tracking-wider block">CHỌN PHẢN CHIÊU (DEFIED)</span>
            <span className="text-2xl font-black font-mono text-rose-600 mt-1">{defianceCount} Lần</span>
            <span className="text-[10px] font-bold text-rose-500 block mt-0.5">Dám chấp nhận bốc đồng</span>
          </div>
        </div>
      )}

      {/* Main control panel */}
      <div className="bg-white border-4 border-black rounded-3xl p-5 md:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b-2 border-black mb-6">
          <h3 className="font-black text-base uppercase tracking-tight text-slate-900 flex items-center gap-2">
            <span>BIÊN NIÊN SỬ QUYẾT ĐỊNH CỦA BẠN</span>
          </h3>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm đề xuất đã duyệt..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8.5 pr-3 py-1.5 w-full bg-slate-50 border-2 border-black rounded-xl text-xs font-semibold outline-none focus:bg-white"
              />
            </div>

            {totalCount > 0 && (
              <button
                onClick={onClearHistory}
                className="px-3 py-2 text-xs font-black text-rose-600 hover:text-white bg-white hover:bg-rose-500 border-2 border-black rounded-xl transition cursor-pointer shrink-0 shadow-sm"
              >
                XÓA SẠCH
              </button>
            )}
          </div>
        </div>

        {totalCount === 0 ? (
          <div className="text-center py-16 max-w-sm mx-auto">
            <span className="text-5xl block animate-bounce">📚</span>
            <h4 className="font-black text-sm uppercase mt-4">Tàng thư kỷ lục đang chờ sếp</h4>
            <p className="text-xs text-gray-500 font-bold mt-1.5 leading-relaxed">
              Ngay khi sếp trình duyệt phương án và lựa chọn tuân thủ hay bất chấp phán biểu, một hồ sơ lịch sử giàu bài học thực tế sẽ được bảo mật khắc tên vĩnh cửu tại đây!
            </p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-10 font-bold">Không khớp từ khóa trong sổ sách mục lục! ✏️</p>
        ) : (
          
          /* Visual Chronological Timeline vertical layout */
          <div className="relative pl-6 md:pl-8 border-l-4 border-dashed border-indigo-200 space-y-8 mt-4">
            
            {filteredHistory.map((h, hIdx) => {
              const isExpanded = expandedId === h.id;
              const formattedAmt = formatVND(h.amount);
              const verdictIsApprove = h.debateResult.conclusion.approved;
              
              // Define text visual details
              const isObeyed = h.userAction === "obeyed";
              const userChoiceLabel = isObeyed ? "🙏 CEO ĐÃ TUÂN THỦ" : "🖕 CEO ĐÃ BẤT CHẤP QUẸT";
              const userChoiceCss = isObeyed 
                ? "bg-emerald-50 text-emerald-800 border-emerald-500" 
                : "bg-rose-50 text-rose-800 border-rose-500";
              const timelineBadgeColor = isObeyed ? "bg-emerald-500" : "bg-rose-500";

              return (
                <div key={h.id} className="relative group">
                  
                  {/* Absolute positioning vertical node ball */}
                  <div className={`absolute -left-[31px] md:-left-[39px] top-1 w-4 h-4 rounded-full border-2 border-black ${timelineBadgeColor} shadow-sm group-hover:scale-125 transition-transform`} />
                  
                  {/* Detailed individual record block */}
                  <div className="bg-white border-2 border-black rounded-2xl overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all">
                    
                    {/* Collapsed top view bar */}
                    <div 
                      onClick={() => toggleExpand(h.id)}
                      className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 select-none"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono text-gray-400 font-bold flex items-center gap-1">
                            <Clock className="w-3" /> {new Date(h.timestamp).toLocaleDateString("vi-VN")} {new Date(h.timestamp).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded border ${userChoiceCss}`}>
                            {userChoiceLabel}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-sm md:text-base text-slate-900 truncate uppercase tracking-tight mt-0.5">
                          {h.proposalName} — <span className="font-mono font-black text-indigo-700">{formattedAmt}đ</span>
                        </h4>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-3.5 border-t md:border-t-0 border-dashed border-gray-100 pt-2.5 md:pt-0 shrink-0">
                        <div className="text-left md:text-right">
                          <span className="text-[8px] text-gray-400 font-extrabold uppercase block leading-none font-mono">ĐIỂM KỶ LUẬT BIẾN ĐỘNG</span>
                          <span className={`text-xs font-mono font-black mt-1 block ${h.scoreChange >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                            {h.scoreChange >= 0 ? `+${h.scoreChange}` : h.scoreChange} ĐIỂM
                          </span>
                        </div>
                        <div className="p-1 bg-slate-50 border border-black rounded-lg">
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-800" /> : <ChevronDown className="w-4 h-4 text-slate-800" />}
                        </div>
                      </div>
                    </div>

                    {/* Fully Expanded detailed Meeting Room Minutes */}
                    {isExpanded && (
                      <div className="border-t-2 border-dashed border-black p-5 bg-yellow-50/10 space-y-4 md:p-6">
                        
                        {/* Original Situation / Context */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-350 space-y-1">
                          <span className="text-[9px] font-black uppercase text-indigo-600 font-mono tracking-wider">
                            📝 BỐI CẢNH & NGUYỄN VỌNG BAN ĐẦU CỦA CEO
                          </span>
                          <p className="text-xs font-bold text-slate-700 leading-relaxed italic">
                            " {h.context || "Không ghi chép giải trình văn bản đi kèm cuộc họp."} "
                          </p>
                        </div>

                        {/* Visual Verdict results card */}
                        <div className="border-2 border-black rounded-2xl p-4 bg-white shadow-sm space-y-1.5 relative">
                          <span className="text-[9.5px] font-black text-indigo-650 font-mono tracking-widest block uppercase">
                            📜 KẾT LUẬN TRANH BIỆN & PHÁN QUYẾT TỪ CHỦ TỊCH
                          </span>
                          <div className="flex gap-2.5 items-start mt-2">
                            <span className="text-2xl">{verdictIsApprove ? "✅" : "❌"}</span>
                            <div>
                              <strong className="text-xs text-black uppercase block font-black leading-none">
                                {verdictIsApprove ? "ĐỒNG Ý THÔNG QUA (APPROVED)" : "TẠM HOÃN / HỦY BỎ (REJECTED/DELAYED)"}
                              </strong>
                              <p className="text-[11px] font-bold text-slate-600 mt-1 leading-relaxed">
                                {h.debateResult.conclusion.summary}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Votes highlights in timeline */}
                        <div className="space-y-2">
                          <span className="text-[9px] font-black uppercase text-gray-400 font-mono tracking-wider">
                            💬 PHÁT BIỂU CỦA CÁC THÀNH VIÊN ĐIỂN HÌNH
                          </span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {h.debateResult.votes.slice(0, 4).map((v) => {
                              const member = BOARD_MEMBERS[v.memberId];
                              const memberIsApprove = v.vote === "approve";
                              return (
                                <div key={v.memberId} className="bg-slate-50 border border-slate-300 p-3 rounded-xl text-[11px] space-y-1 shadow-sm">
                                  <div className="flex justify-between items-center pb-1 border-b border-dashed border-slate-200">
                                    <span className="font-extrabold text-slate-800 uppercase flex items-center gap-1">
                                      <span>{member?.emoji || "🕴️"}</span> {member?.name || v.memberId}
                                    </span>
                                    <span className={`text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                      memberIsApprove ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                                    }`}>
                                      {v.vote === "approve" ? "Bỏ Phiếu Thuận" : "Bỏ Phiếu Chống"}
                                    </span>
                                  </div>
                                  <p className="text-slate-550 italic font-medium leading-relaxed">
                                    "{v.reason}"
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Valuable Lesson Learned (Action Plan steps) as required by user */}
                        {h.debateResult.action_plan && h.debateResult.action_plan.length > 0 && (
                          <div className="bg-amber-50 border-2 border-dashed border-black rounded-2xl p-4 mt-2">
                            <span className="text-[9px] font-black uppercase text-indigo-950 font-mono tracking-wider block mb-2">
                              💡 BÀI HỌC VÀ ĐỀ XUẤT CẢI THIỆN XƯƠNG MÁU (ACTION PLAN)
                            </span>
                            <div className="space-y-2">
                              {h.debateResult.action_plan.map((step, sIdx) => (
                                <div key={sIdx} className="flex gap-2 items-start text-xs text-slate-900 font-bold">
                                  <span className="text-indigo-600 bg-white border border-black rounded-full w-4 h-4 flex items-center justify-center text-[10px] shrink-0 font-black">
                                    {sIdx + 1}
                                  </span>
                                  <div>
                                    <strong className="block text-slate-900 font-black">{getActionLabel(step.action)}</strong>
                                    <p className="text-[11px] text-gray-600 font-semibold mt-0.5 leading-relaxed">
                                      {step.description}
                                    </p>
                                    {step.amount && (
                                      <span className="inline-block mt-1 bg-white border border-black px-2 py-0.5 rounded font-mono text-[9px] text-emerald-800 font-bold">
                                        Trị giá: {formatVND(step.amount)}đ
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* End of expanded details */}
                      </div>
                    )}

                  </div>
                </div>
              );
            })}

          </div>
        )}
      </div>

    </div>
  );
}
