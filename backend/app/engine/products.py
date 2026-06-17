"""Zalopay product catalog + recommendation mapping.

Ported 1:1 from productCatalog.ts, with one simplification: the old code
always returned a 1-item array and the frontend only ever read index 0, so
this now just returns the single best match instead of a list nobody iterates.
"""
from __future__ import annotations

from ..models import ProductRecommendation

_CATALOG: dict[str, ProductRecommendation] = {
    p["product_id"]: ProductRecommendation(**p)
    for p in [
        {
            "product_id": "bnpl",
            "product_name": "Tài Khoản Trả Sau Zalopay",
            "category": "credit",
            "why_this_product": "Hạn mức linh hoạt, chia nhỏ thanh toán.",
            "tradeoff_summary": "Không áp lực tài chính ngay lập tức, nhưng cần kỷ luật trả nợ đúng hạn.",
            "cta_text": "Đăng Ký Tài Khoản Trả Sau",
            "cta_url": "https://zalopay.vn/dich-vu/tai-khoan-tra-sau",
        },
        {
            "product_id": "savings_account",
            "product_name": "Gửi Tiết Kiệm Tích Lũy Zalopay",
            "category": "saving",
            "why_this_product": "Xây dựng quỹ dự phòng và sinh lời đều đặn mỗi ngày.",
            "tradeoff_summary": "Lợi nhuận ổn định, rủi ro cực thấp.",
            "cta_text": "Mở Sổ Tiết Kiệm",
            "cta_url": "https://zalopay.vn/dich-vu/gui-tiet-kiem",
        },
        {
            "product_id": "travel_saving",
            "product_name": "Sổ Tiết Kiệm Du Lịch",
            "category": "saving",
            "why_this_product": "Tích cóp dần cho chuyến đi xa mà không cần vay mượn.",
            "tradeoff_summary": "Chờ đợi một chút nhưng đi chơi không lo nghĩ nợ nần.",
            "cta_text": "Lập Kế Hoạch Tiết Kiệm",
            "cta_url": "https://zalopay.vn/dich-vu/gui-tiet-kiem",
        },
        {
            "product_id": "stock_account",
            "product_name": "Tài Khoản Chứng Khoán Zalopay",
            "category": "investing",
            "why_this_product": "Dành tiền nhàn rỗi đầu tư nhỏ giọt thay vì mạo hiểm số vốn lớn.",
            "tradeoff_summary": "Sinh lời cao hơn tiết kiệm nhưng có biến động thị trường.",
            "cta_text": "Mở Tài Khoản Đầu Tư",
            "cta_url": "https://zalopay.vn/dich-vu/tai-khoan-chung-khoan",
        },
        {
            "product_id": "insurance",
            "product_name": "Bảo Hiểm Sức Khỏe Zalopay",
            "category": "safety",
            "why_this_product": "Gia cường khiên phòng vệ sức khoẻ, lá chắn trước biến cố.",
            "tradeoff_summary": "Chi phí nhỏ, an tâm tuyệt đối.",
            "cta_text": "Xem Các Loại Bảo Hiểm",
            "cta_url": "https://zalopay.vn/dich-vu/bao-hiem",
        },
        {
            "product_id": "flight_ticket",
            "product_name": "Đặt Vé Máy Bay Zalopay",
            "category": "travel",
            "why_this_product": "Đi du lịch thỏa chí tang bồng, đặt vé khứ hồi siêu nhanh.",
            "tradeoff_summary": "Bay ngay, nhẹ gánh với voucher và chiết khấu.",
            "cta_text": "Săn Vé Du Lịch",
            "cta_url": "https://zalopay.vn/dat-ve-may-bay",
        },
        {
            "product_id": "movie_ticket",
            "product_name": "Đặt Vé Xem Phim Zalopay",
            "category": "entertainment",
            "why_this_product": "Giải trí thả ga với chiết khấu hời từ các hệ thống rạp.",
            "tradeoff_summary": "Giải tỏa stress tốn ít chi phí.",
            "cta_text": "Mua Vé Xem Phim",
            "cta_url": "https://zalopay.vn/dat-ve-phim",
        },
        {
            "product_id": "vietlott",
            "product_name": "Keno / Vietlott Zalopay",
            "category": "entertainment",
            "why_this_product": "Chi tiêu vượt quá giới hạn lý trí — đổi vận may 10k hợp lý hơn.",
            "tradeoff_summary": "Bỏ 10k lấy cơ hội độc đắc 100 tỷ.",
            "cta_text": "Săn Vé Vietlott",
            "cta_url": "https://zalopay.vn/cach-mua-ve-so-vietlott-online-2226",
        },
    ]
}


def map_product(decision: str, category: str, is_insane: bool, is_bnpl_eligible: bool, intent: str) -> ProductRecommendation:
    if is_insane:
        return _CATALOG["vietlott"]

    if intent == "Experience Spending":
        return _CATALOG["flight_ticket"] if decision.startswith("approve") else _CATALOG["travel_saving"]
    if intent == "Asset Accumulation":
        return _CATALOG["stock_account"]
    if intent == "Capital Preservation":
        return _CATALOG["savings_account"]
    if intent == "Risk Protection":
        return _CATALOG["insurance"]
    if intent in ("Consumption", "Human Capital Investment", "Debt Financing"):
        if decision == "approve_with_conditions" and is_bnpl_eligible:
            return _CATALOG["bnpl"]

    if decision in ("approve", "approve_with_conditions"):
        if decision == "approve_with_conditions" and is_bnpl_eligible:
            return _CATALOG["bnpl"]
        if category == "travel":
            return _CATALOG["flight_ticket"]
        if category == "entertainment":
            return _CATALOG["movie_ticket"]
        if category == "investing":
            return _CATALOG["stock_account"]
        if category == "safety":
            return _CATALOG["insurance"]

    if category == "travel":
        return _CATALOG["travel_saving"]
    if category == "investing":
        return _CATALOG["stock_account"]
    if category == "safety":
        return _CATALOG["insurance"]
    return _CATALOG["savings_account"]
