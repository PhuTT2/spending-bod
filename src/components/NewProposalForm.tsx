import React, { useState } from "react";
import { HelpCircle, DollarSign, Calendar, FileText, Landmark, Compass, Award, Percent, ShoppingBag, Eye, Star, ShieldCheck, PiggyBank, Briefcase } from "lucide-react";
import { motion } from "motion/react";

interface NewProposalFormProps {
  onSubmit: (proposal: {
    proposalName: string;
    amount: number;
    context: string;
    timing?: string;
    intent?: string;
  }) => void;
  isLoading: boolean;
}

interface DossierTemplate {
  icon: React.ReactNode;
  label: string;
  name: string;
  amount: number;
  context: string;
  intent: string;
  intentName: string;
}

export default function NewProposalForm({
  onSubmit,
  isLoading,
}: NewProposalFormProps) {
  const [proposalName, setProposalName] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [context, setContext] = useState("");
  const [timing, setTiming] = useState<"Ngay bây giờ" | "Tháng sau" | "Trong 3 tháng tới" | "Trong 6 tháng tới">("Ngay bây giờ");
  const [selectedIntent, setSelectedIntent] = useState<string>("Tiêu dùng");

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

  const INTENTS = [
    { id: "Tiêu dùng", label: "Tiêu dùng 🛍️", desc: "Sắm sửa, ăn chơi tiêu hao" },
    { id: "Đầu tư", label: "Đầu tư 📈", desc: "Chứng khoán, tài sản tích sinh lời" },
    { id: "Tiết kiệm", label: "Tiết kiệm 🐷", desc: "Tích lũy heo đất, thủ thế" },
    { id: "Du lịch", label: "Du lịch ✈️", desc: "Nghỉ dưỡng nạp thăng dư trải nghiệm" },
    { id: "Học tập", label: "Học tập 🎓", desc: "Phát triển năng lực bản thân" },
    { id: "Bảo vệ tài chính", label: "Bảo hiểm / Phòng thủ 🛡️", desc: "Mua bảo hiểm, an tâm" },
  ];

  const TEMPLATES: DossierTemplate[] = [
    {
      icon: <ShoppingBag className="w-4 h-4 text-rose-500" />,
      label: "Mua Điện Thoại",
      name: "Nâng cấp iPhone 16 Pro Max làm việc",
      amount: 35000050,
      context: "Điện thoại cũ chai pin 74% hay sập nguồn, cần nâng cấp để duy trì đàm thoại với đối tác VIP và thao tác app tài chính mượt mà.",
      intent: "Tiêu dùng",
      intentName: "Tiêu dùng 🛍️"
    },
    {
      icon: <Compass className="w-4 h-4 text-amber-500" />,
      label: "Du Lịch",
      name: "Chữa lành tại Nhật Bản ngắm lá đỏ",
      amount: 45000000,
      context: "Sau chuỗi ngày OT ngập mặt, sếp đăng ký tour ngắn ngắm cảnh lá phong thu Nhật Bản để tái khởi tạo ý chí chiến đấu phi thường.",
      intent: "Du lịch",
      intentName: "Du lịch trải nghiệm ✈️"
    },
    {
      icon: <Landmark className="w-4 h-4 text-emerald-500" />,
      label: "Đầu Tư",
      name: "Tích tách gom Chứng chỉ quỹ VN30 ETF",
      amount: 15000000,
      context: "Gom thặng dư chuyển vào rổ ETF VN30 đón sóng tăng trưởng trung hạn của kinh tế vĩ mô quốc gia.",
      intent: "Đầu tư",
      intentName: "Đầu tư tích tài sản 📈"
    },
    {
      icon: <Award className="w-4 h-4 text-indigo-500" />,
      label: "Học Tập",
      name: "Khóa học AI & Automation nhân 3 hiệu năng",
      amount: 9500000,
      context: "Tham gia khóa huấn luyện vận hành AI tự động hóa để tăng tốc hiệu suất công việc nâng cao doanh số.",
      intent: "Học tập",
      intentName: "Đầu tư tri thức 🎓"
    },
    {
      icon: <ShieldCheck className="w-4 h-4 text-purple-500" />,
      label: "Mua Bảo Hiểm",
      name: "Trang bị Bảo hiểm sức khỏe nội ngoại trú",
      amount: 8000000,
      context: "Mua bảo bối phòng vệ y tế đề phòng ốm đau tai ương gõ cửa, đỡ lấy dòng tiền không bị hao hụt bất ngờ.",
      intent: "Bảo vệ tài chính",
      intentName: "Bảo vệ tài chính 🛡️"
    },
    {
      icon: <Star className="w-4 h-4 text-slate-500" />,
      label: "Đề Xuất Khác ✏️",
      name: "",
      amount: 0,
      context: "",
      intent: "Tiêu dùng",
      intentName: "Khác"
    }
  ];

  const formatCurrency = (val: string) => {
    const num = parseInt(val.replace(/\D/g, ""), 10);
    if (isNaN(num)) return "";
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!proposalName.trim()) {
      newErrors.proposalName = "Vui lòng điền tên thương vụ đề xuất chi tiêu.";
    }

    const amount = parseInt(amountInput.replace(/\D/g, ""), 10) || 0;
    if (!amountInput || amount <= 0) {
      newErrors.amountInput = "Vui lòng điền giá trị tiền đề xuất hợp lệ.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    
    // Append intention & timing explanation inside context context string for LLM awareness,
    // plus we also send them as fields
    const enrichedContext = `${context.trim()}\n\n[Ý định chủ đạo: ${selectedIntent}]\n[Thời điểm thực hiện: ${timing}]`;

    onSubmit({
      proposalName: proposalName.trim(),
      amount,
      context: enrichedContext,
      timing,
      intent: selectedIntent,
    });
  };

  const applyTemplate = (index: number, template: DossierTemplate) => {
    setSelectedTemplate(index);
    if (template.name === "") {
      setProposalName("");
      setAmountInput("");
      setContext("");
      setSelectedIntent("Tiêu dùng");
    } else {
      setProposalName(template.name);
      setAmountInput(template.amount.toString());
      setContext(template.context);
      setSelectedIntent(template.intent);
    }
    setErrors({});
  };

  return (
    <div className="bg-white border-4 border-black rounded-3xl p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-black relative" id="proposal-form">
      {/* Official red stamp look for Board feeling */}
      <div className="absolute right-6 top-6 w-24 h-24 rounded-full border-4 border-dashed border-rose-500/30 flex items-center justify-center -rotate-12 pointer-events-none select-none">
        <span className="text-[10px] font-black font-mono text-rose-500/40 text-center leading-tight uppercase tracking-widest">
          TRÌNH DUYỆT<br />MẬT KHẨN⏱️
        </span>
      </div>

      {/* Header Accent */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b-4 border-black mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border-2 border-black text-white flex items-center justify-center font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            🖊️
          </div>
          <div>
            <span className="text-[10px] font-mono font-black text-indigo-600 uppercase tracking-widest block">BOARD INITIATIVE PROTOCOL</span>
            <h2 className="text-xl font-black uppercase tracking-tight text-black mt-0.5">Tờ Trình Phê Phán Phương Án Chi Tiêu</h2>
          </div>
        </div>
        <div className="text-left md:text-right">
          <span className="text-[9px] font-mono px-3 py-1 bg-yellow-105 bg-yellow-100 border border-black text-black font-extrabold uppercase rounded shadow-sm">
            TOWER ROLE: CEO CHIẾN LƯỢC
          </span>
        </div>
      </div>

      {/* Under 30 seconds template quick selection bar */}
      <div className="mb-6 bg-slate-50 border-2 border-black p-4 rounded-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
        <span className="text-[10px] font-black text-indigo-650 font-mono block mb-2 px-1 uppercase tracking-wider flex items-center gap-1.5">
          📁 30S TIẾT KIỆM FRICTION - CHỌN MẪU TỜ TRÌNH GỢI Ý:
        </span>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {TEMPLATES.map((t, index) => {
            const isSelected = selectedTemplate === index;
            return (
              <button
                key={index}
                type="button"
                onClick={() => applyTemplate(index, t)}
                disabled={isLoading}
                className={`p-2.5 rounded-xl border-2 border-black text-left cursor-pointer transition-all ${
                  isSelected
                    ? "bg-amber-100 border-black ring-2 ring-indigo-400 shadow-sm"
                    : "bg-white hover:bg-yellow-50"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  {t.icon}
                  <span className="font-extrabold text-[11px] text-black leading-tight truncate">{t.label}</span>
                </div>
                <div className="text-[8px] font-bold text-slate-500 font-mono truncate uppercase block">
                  {t.intentName}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Official documents layout */}
      <form onSubmit={handleSubmit} className="space-y-5 bg-white p-5 border-2 border-black rounded-2xl relative shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
        
        {/* Row 1: Name and amount */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label htmlFor="proposalName" className="block text-xs font-black uppercase tracking-tight text-slate-800 font-mono">
              1. Tên phương án chi tiêu đệ trình *
            </label>
            <input
              id="proposalName"
              type="text"
              placeholder="Ví dụ: Nâng đời sắm MacBook Pro, Gom thặng dư..."
              value={proposalName}
              onChange={(e) => {
                setProposalName(e.target.value);
                setSelectedTemplate(null);
                if (errors.proposalName) setErrors({ ...errors, proposalName: "" });
              }}
              disabled={isLoading}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border-2 ${errors.proposalName ? 'border-rose-500' : 'border-black'} rounded-xl text-black font-semibold text-xs outline-none focus:bg-white transition`}
            />
            {errors.proposalName && <p className="text-rose-600 text-[11px] font-bold mt-1 font-mono">⚠️ {errors.proposalName}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="amountInput" className="block text-xs font-black uppercase tracking-tight text-slate-800 font-mono flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> 2. Trị giá đề xuất (VND) *
            </label>
            <div className="relative">
              <input
                id="amountInput"
                type="text"
                placeholder="Ví dụ: 12.000.000"
                value={formatCurrency(amountInput)}
                onChange={(e) => {
                  setAmountInput(e.target.value);
                  setSelectedTemplate(null);
                  if (errors.amountInput) setErrors({ ...errors, amountInput: "" });
                }}
                disabled={isLoading}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border-2 ${errors.amountInput ? 'border-rose-500' : 'border-black'} rounded-xl text-black font-mono font-black text-xs outline-none focus:bg-white transition pr-8`}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold font-mono text-xs">₫</span>
            </div>
            {errors.amountInput && <p className="text-rose-600 text-[11px] font-bold mt-1 font-mono">⚠️ {errors.amountInput}</p>}
          </div>
        </div>

        {/* Row 2: Identify Financial Intent selection */}
        <div className="space-y-1.5">
          <label className="block text-xs font-black uppercase tracking-tight text-slate-800 font-mono">
            3. Ý định tài chính chủ đạo (Financial Intent)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {INTENTS.map((intent) => (
              <button
                key={intent.id}
                type="button"
                onClick={() => setSelectedIntent(intent.id)}
                className={`p-2 border-2 rounded-xl text-left cursor-pointer transition ${
                  selectedIntent === intent.id
                    ? "bg-indigo-600 text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    : "bg-slate-50 border-slate-300 hover:border-black text-slate-800"
                }`}
              >
                <span className="font-extrabold text-[11px] block">{intent.label}</span>
                <span className={`text-[8.5px] mt-0.5 block ${selectedIntent === intent.id ? 'text-indigo-200' : 'text-slate-500'} font-medium`}>{intent.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Row 3: Capture Scheduled Timing (Thời điểm thực hiện) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-black uppercase tracking-tight text-slate-800 font-mono">
            4. Kế hoạch thời điểm thực hiện (Timing)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { id: "Ngay bây giờ", label: "Ngay bây giờ 🚨", desc: "Hành động khẩn cấp" },
              { id: "Tháng sau", label: "Trong tháng sau ⏱️", desc: "Tích ngân sách thêm" },
              { id: "Trong 3 tháng tới", label: "Trong 3 tháng 📅", desc: "Trì hoãn ngắn hạn" },
              { id: "Trong 6 tháng tới", label: "Trong 6 tháng ⏳", desc: "Kế hoạch trung kỳ" },
            ].map((itm) => (
              <button
                key={itm.id}
                type="button"
                onClick={() => setTiming(itm.id as any)}
                className={`p-2 border-2 rounded-xl text-center text-xs font-black cursor-pointer uppercase transition ${
                  timing === itm.id
                    ? "bg-amber-300 text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    : "bg-slate-50 border-slate-300 hover:border-black"
                }`}
              >
                <div>{itm.label}</div>
                <div className="text-[8.5px] font-semibold text-slate-500 mt-0.5 lowercase tracking-tight normal-case">{itm.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Row 4: Detailed description / Context */}
        <div className="space-y-1.5">
          <label htmlFor="contextInput" className="block text-xs font-black uppercase tracking-tight text-slate-800 font-mono flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-indigo-650 text-indigo-600" /> 5. Báo cáo giải trình ngữ cảnh thuyết phục HĐQT
          </label>
          <textarea
            id="contextInput"
            placeholder="Khai báo hoàn cảnh thực tiễn vì sao sếp buộc phải xuất tiền (Ví dụ: 'Dùng laptop cũ phập phùng màn hình nhiễu, cần Mac mới làm đồ họa kiếm cơm', 'Đi du xuân gắn kết anh em trong tổ đội'...)"
            value={context}
            onChange={(e) => {
              setContext(e.target.value);
              setSelectedTemplate(null);
            }}
            disabled={isLoading}
            rows={2}
            className="w-full px-3 py-2 bg-slate-50 border-2 border-black rounded-xl text-slate-800 font-semibold outline-none focus:bg-white text-xs leading-relaxed"
          />
        </div>

        {/* Footer Document Signature for board feeling */}
        <div className="flex justify-between items-center bg-yellow-50/50 p-3 rounded-xl border border-dashed border-slate-350 text-[10px] text-slate-650 font-bold font-mono">
          <span>Hồ Sơ: CHƯA PHÊ DUYỆT</span>
          <span>✍️ Ký tên: CEO {proposalName ? proposalName.split(" ").slice(0, 2).join(" ") : "(SẾP TỔNG)"}</span>
        </div>

        {/* Submit action */}
        <button
          type="submit"
          disabled={isLoading || !proposalName.trim() || !amountInput}
          className="w-full py-4 text-base font-black uppercase tracking-wider bg-indigo-600 hover:bg-yellow-300 text-white hover:text-black border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition disabled:opacity-50 disabled:active:translate-y-0 cursor-pointer flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Đang đệ trình hồ sơ lên Đại hội đồng phán xét...</span>
            </>
          ) : (
            <span>CHÍNH THỨC TRÌNH ĐỆ HỒ SƠ LÊN HĐQT ĐÁNH GIÁ 💼 🚨</span>
          )}
        </button>
      </form>
    </div>
  );
}
