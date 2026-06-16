import { ProductCatalogItem, FinancialIntent } from "./types";

export const PRODUCT_CATALOG: ProductCatalogItem[] = [
  {
    product_id: "bnpl",
    product_name: "Tài Khoản Trả Sau ZaloPay",
    category: "credit",
    tags: ["bnpl", "shopping", "leverage"],
    priority_weight: 90,
    why_this_product: "Hạn mức linh hoạt, chia nhỏ thanh toán.",
    tradeoff_summary: "Không áp lực tài chính ngay lập tức, nhưng cần kỷ luật trả nợ đúng hạn.",
    cta_text: "Đăng Ký Tài Khoản Trả Sau",
    cta_url: "https://zalopay.vn/dich-vu/tai-khoan-tra-sau"
  },
  {
    product_id: "savings_account",
    product_name: "Gửi Tiết Kiệm Tích Lũy ZaloPay",
    category: "saving",
    tags: ["saving", "emergency", "goal_based"],
    priority_weight: 85,
    why_this_product: "Xây dựng quỹ dự phòng và sinh lời đều đặn mỗi ngày.",
    tradeoff_summary: "Lợi nhuận ổn định, rủi ro cực thấp.",
    cta_text: "Mở Sổ Tiết Kiệm",
    cta_url: "https://zalopay.vn/dich-vu/gui-tiet-kiem"
  },
  {
    product_id: "travel_saving",
    product_name: "Sổ Tiết Kiệm Du Lịch",
    category: "saving",
    tags: ["travel", "saving", "goal_based"],
    priority_weight: 95,
    why_this_product: "Tích cóp dần cho chuyến đi xa mà không cần vay mượn.",
    tradeoff_summary: "Chờ đợi một chút nhưng đi chơi không lo nghĩ nợ nần.",
    cta_text: "Lập Kế Hoạch Tiết Kiệm",
    cta_url: "https://zalopay.vn/dich-vu/gui-tiet-kiem"
  },
  {
    product_id: "stock_account",
    product_name: "Tài Khoản Chứng Khoán ZaloPay",
    category: "investing",
    tags: ["investing", "wealth_building"],
    priority_weight: 80,
    why_this_product: "Dành tiền nhàn rỗi đầu tư nhỏ giọt thay vì mạo hiểm số vốn lớn.",
    tradeoff_summary: "Sinh lời cao hơn tiết kiệm nhưng có biến động thị trường.",
    cta_text: "Mở Tài Khoản Đầu Tư",
    cta_url: "https://zalopay.vn/dich-vu/tai-khoan-chung-khoan"
  },
  {
    product_id: "insurance",
    product_name: "Bảo Hiểm Sức Khỏe ZaloPay",
    category: "safety",
    tags: ["insurance", "safety", "health"],
    priority_weight: 100,
    why_this_product: "Gia cường khiên phòng vệ sức khoẻ, lá chắn trước biến cố.",
    tradeoff_summary: "Chi phí nhỏ, An tâm tuyệt đối.",
    cta_text: "Xem Các Loại Bảo Hiểm",
    cta_url: "https://zalopay.vn/dich-vu/bao-hiem"
  },
  {
    product_id: "flight_ticket",
    product_name: "Đặt Vé Máy Bay ZaloPay",
    category: "travel",
    tags: ["travel", "booking", "flight"],
    priority_weight: 85,
    why_this_product: "Đi du lịch thỏa chí tang bồng, đặt vé khứ hồi siêu nhanh.",
    tradeoff_summary: "Bay ngay, nhẹ gánh với voucher và chiết khấu.",
    cta_text: "Săn Vé Du Lịch",
    cta_url: "https://zalopay.vn/dat-ve-may-bay"
  },
  {
    product_id: "movie_ticket",
    product_name: "Đặt Vé Xem Phim ZaloPay",
    category: "entertainment",
    tags: ["entertainment", "movie", "booking"],
    priority_weight: 80,
    why_this_product: "Giải trí thả ga với chiết khấu hời từ các hệ thống rạp.",
    tradeoff_summary: "Giải tỏa stress tốn ít chi phí.",
    cta_text: "Mua Vé Xem Phim",
    cta_url: "https://zalopay.vn/dat-ve-phim"
  },
  {
    product_id: "vietlott",
    product_name: "Keno / Vietlott ZaloPay",
    category: "entertainment",
    tags: ["entertainment", "luck", "lottery"],
    priority_weight: 10,
    why_this_product: "Chi tiêu vượt quá giới hạn lý trí. Đổi vận may 10k hợp lý hơn.",
    tradeoff_summary: "Bỏ 10k lấy cơ hội độc đắc 100 tỷ.",
    cta_text: "Săn Vé Vietlott",
    cta_url: "https://zalopay.vn/cach-mua-ve-so-vietlott-online-2226"
  }
];

export function mapProductRecommendations(
  decision: string,
  category: string,
  isInsane: boolean,
  isBnplEligible: boolean,
  intent?: FinancialIntent
): ProductCatalogItem {
  if (isInsane) {
    return PRODUCT_CATALOG.find(p => p.product_id === "vietlott")!;
  }

  // Intent-based mappings first
  if (intent === "Experience Spending") {
    return decision.includes("approve") ? PRODUCT_CATALOG.find(p => p.product_id === "flight_ticket")! : PRODUCT_CATALOG.find(p => p.product_id === "travel_saving")!;
  }
  if (intent === "Asset Accumulation") {
    return PRODUCT_CATALOG.find(p => p.product_id === "stock_account")!;
  }
  if (intent === "Capital Preservation") {
    return PRODUCT_CATALOG.find(p => p.product_id === "savings_account")!;
  }
  if (intent === "Risk Protection") {
    return PRODUCT_CATALOG.find(p => p.product_id === "insurance")!;
  }
  if (intent === "Consumption" || intent === "Human Capital Investment" || intent === "Debt Financing") {
     if (decision === "approve_with_conditions" && isBnplEligible) {
       return PRODUCT_CATALOG.find(p => p.product_id === "bnpl")!;
     }
  }

  if (decision === "approve" || decision === "approve_with_conditions") {
    if (decision === "approve_with_conditions" && isBnplEligible) {
      return PRODUCT_CATALOG.find(p => p.product_id === "bnpl")!;
    }
    if (category === "travel") return PRODUCT_CATALOG.find(p => p.product_id === "flight_ticket")!;
    if (category === "entertainment") return PRODUCT_CATALOG.find(p => p.product_id === "movie_ticket")!;
    if (category === "investing") return PRODUCT_CATALOG.find(p => p.product_id === "stock_account")!;
    if (category === "safety") return PRODUCT_CATALOG.find(p => p.product_id === "insurance")!;
  }

  // Delay / Reject fallbacks
  if (category === "travel") return PRODUCT_CATALOG.find(p => p.product_id === "travel_saving")!;
  if (category === "investing") return PRODUCT_CATALOG.find(p => p.product_id === "stock_account")!;
  if (category === "safety") return PRODUCT_CATALOG.find(p => p.product_id === "insurance")!;

  return PRODUCT_CATALOG.find(p => p.product_id === "savings_account")!;
}
