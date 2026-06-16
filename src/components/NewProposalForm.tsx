import React, { useState } from "react";
import { DollarSign, FileText, ShoppingBag, Compass, Landmark, Award, ShieldCheck, Star } from "lucide-react";

interface NewProposalFormProps {
  onSubmit: (proposal: { proposal_name: string; amount: number; context: string; intent_hint?: string }) => void;
  isLoading: boolean;
}

interface Template {
  icon: React.ReactNode;
  label: string;
  name: string;
  amount: number;
  context: string;
  intent: string;
}

const INTENTS = [
  { id: "Tiêu dùng", label: "Tiêu dùng 🛍️" },
  { id: "Đầu tư", label: "Đầu tư 📈" },
  { id: "Tiết kiệm", label: "Tiết kiệm 🐷" },
  { id: "Du lịch", label: "Du lịch ✈️" },
  { id: "Học tập", label: "Học tập 🎓" },
  { id: "Bảo vệ tài chính", label: "Bảo hiểm 🛡️" },
];

const TEMPLATES: Template[] = [
  { icon: <ShoppingBag className="w-4 h-4 text-rose-500" />, label: "Mua điện thoại", name: "Nâng cấp iPhone 16 Pro Max", amount: 35000000, context: "Máy cũ chai pin, cần đổi để làm việc.", intent: "Tiêu dùng" },
  { icon: <Compass className="w-4 h-4 text-amber-500" />, label: "Du lịch", name: "Đi Nhật mùa lá đỏ", amount: 45000000, context: "Đi chữa lành sau chuỗi ngày OT.", intent: "Du lịch" },
  { icon: <Landmark className="w-4 h-4 text-emerald-500" />, label: "Đầu tư", name: "Mua chứng chỉ quỹ VN30", amount: 15000000, context: "Đón sóng tăng trưởng trung hạn.", intent: "Đầu tư" },
  { icon: <Award className="w-4 h-4 text-indigo-500" />, label: "Học tập", name: "Khóa học AI & Automation", amount: 9500000, context: "Tăng tốc hiệu suất công việc.", intent: "Học tập" },
  { icon: <ShieldCheck className="w-4 h-4 text-purple-500" />, label: "Bảo hiểm", name: "Bảo hiểm sức khỏe", amount: 8000000, context: "Phòng ngừa rủi ro bất ngờ.", intent: "Bảo vệ tài chính" },
  { icon: <Star className="w-4 h-4 text-slate-500" />, label: "Khác", name: "", amount: 0, context: "", intent: "Tiêu dùng" },
];

export default function NewProposalForm({ onSubmit, isLoading }: NewProposalFormProps) {
  const [proposalName, setProposalName] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [context, setContext] = useState("");
  const [selectedIntent, setSelectedIntent] = useState<string>("Tiêu dùng");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

  const formatCurrency = (val: string) => {
    const num = parseInt(val.replace(/\D/g, ""), 10);
    return isNaN(num) ? "" : new Intl.NumberFormat("vi-VN").format(num);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};
    if (!proposalName.trim()) newErrors.proposalName = "Nhập tên thương vụ.";
    const amount = parseInt(amountInput.replace(/\D/g, ""), 10) || 0;
    if (!amountInput || amount <= 0) newErrors.amountInput = "Nhập số tiền hợp lệ.";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    onSubmit({ proposal_name: proposalName.trim(), amount, context: context.trim(), intent_hint: selectedIntent });
  };

  const applyTemplate = (index: number, t: Template) => {
    setSelectedTemplate(index);
    setProposalName(t.name);
    setAmountInput(t.amount ? t.amount.toString() : "");
    setContext(t.context);
    setSelectedIntent(t.intent);
    setErrors({});
  };

  return (
    <div className="bg-white border-4 border-black rounded-3xl p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-black">
      <div className="mb-6 bg-slate-50 border-2 border-black p-4 rounded-2xl">
        <span className="text-[10px] font-black text-indigo-600 font-mono block mb-2 uppercase tracking-wider">Mẫu nhanh</span>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {TEMPLATES.map((t, index) => (
            <button
              key={index}
              type="button"
              onClick={() => applyTemplate(index, t)}
              disabled={isLoading}
              className={`p-2.5 rounded-xl border-2 border-black text-left cursor-pointer transition-all ${
                selectedTemplate === index ? "bg-amber-100 ring-2 ring-indigo-400" : "bg-white hover:bg-yellow-50"
              }`}
            >
              <div className="flex items-center gap-1.5">
                {t.icon}
                <span className="font-extrabold text-[11px] text-black leading-tight">{t.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label htmlFor="proposalName" className="block text-xs font-black uppercase text-slate-800">Tên thương vụ *</label>
            <input
              id="proposalName"
              type="text"
              placeholder="Ví dụ: Mua MacBook Pro"
              value={proposalName}
              onChange={(e) => { setProposalName(e.target.value); setSelectedTemplate(null); }}
              disabled={isLoading}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border-2 ${errors.proposalName ? "border-rose-500" : "border-black"} rounded-xl text-black font-semibold text-xs outline-none focus:bg-white`}
            />
            {errors.proposalName && <p className="text-rose-600 text-[11px] font-bold">⚠️ {errors.proposalName}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="amountInput" className="block text-xs font-black uppercase text-slate-800 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Số tiền (VND) *
            </label>
            <div className="relative">
              <input
                id="amountInput"
                type="text"
                placeholder="12.000.000"
                value={formatCurrency(amountInput)}
                onChange={(e) => { setAmountInput(e.target.value); setSelectedTemplate(null); }}
                disabled={isLoading}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border-2 ${errors.amountInput ? "border-rose-500" : "border-black"} rounded-xl font-mono font-black text-xs outline-none focus:bg-white pr-8`}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xs">₫</span>
            </div>
            {errors.amountInput && <p className="text-rose-600 text-[11px] font-bold">⚠️ {errors.amountInput}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-black uppercase text-slate-800">Ý định chính</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {INTENTS.map((intent) => (
              <button
                key={intent.id}
                type="button"
                onClick={() => setSelectedIntent(intent.id)}
                className={`p-2 border-2 rounded-xl text-left cursor-pointer transition ${
                  selectedIntent === intent.id ? "bg-indigo-600 text-white border-black" : "bg-slate-50 border-slate-300 hover:border-black text-slate-800"
                }`}
              >
                <span className="font-extrabold text-[11px] block">{intent.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="contextInput" className="block text-xs font-black uppercase text-slate-800 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-indigo-600" /> Bối cảnh (không bắt buộc)
          </label>
          <textarea
            id="contextInput"
            placeholder="Vì sao bạn cần chi khoản này?"
            value={context}
            onChange={(e) => { setContext(e.target.value); setSelectedTemplate(null); }}
            disabled={isLoading}
            rows={2}
            className="w-full px-3 py-2 bg-slate-50 border-2 border-black rounded-xl text-slate-800 font-semibold outline-none focus:bg-white text-xs leading-relaxed"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !proposalName.trim() || !amountInput}
          className="w-full py-4 text-base font-black uppercase tracking-wider bg-indigo-600 hover:bg-yellow-300 text-white hover:text-black border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? "Đang gửi..." : "Gửi lên HĐQT"}
        </button>
      </form>
    </div>
  );
}
