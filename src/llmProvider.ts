import { GoogleGenAI, Type } from "@google/genai";
import { EvaluationResult, DebateResult } from "./types";

export interface LLMProvider {
  generateBoardNarration(rulesResult: EvaluationResult, inputParams: any): Promise<{ debateResult: DebateResult; metadata: any }>;
}

export class GeminiProvider implements LLMProvider {
  private client: GoogleGenAI;
  private readonly PROMPT_VERSION = "v4.0"; // 5. Prompt Versioning System

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY");
    }
    this.client = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });
  }

  public async generateBoardNarration(rulesResult: EvaluationResult, inputParams: any): Promise<{ debateResult: DebateResult; metadata: any }> {
    const { proposalName, amount, income, savings, financialProfile } = inputParams;

    const formattedAmount = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
    const userPersonality = financialProfile?.financial_personality || "CEO chưa rõ căn cốt";
    
    // Convert rules core output into LLM prompt
    const systemPrompt = `Bạn là một hội đồng tuyển chọn tài chính tối cao (Board of Directors) quản lý dòng tiền của cuộc đời người dùng (CEO).
Công việc của bạn là bám sát quyết định của Rule Engine để thuật lại một diễn biến cuộc họp tranh cãi nảy lửa và đưa ra biểu quyết.

Quyết định tài chính thực tế từ Rule Engine:
- Đề xuất mua sắm/đầu tư: "${proposalName}"
- Số tiền trị giá: ${formattedAmount}
- Quyết định phán quyết chung: ${rulesResult.final_decision.toUpperCase()}
- Bản chất tài chính (Intent): ${rulesResult.financial_intent?.financial_intent} (${rulesResult.financial_intent?.intent_reasoning})
- Rủi ro hệ thống tính: ${rulesResult.risk_level.toUpperCase()}
- Trạng thái profile CEO: Tính cách "${userPersonality}".
- Lý do kỹ thuật: ${rulesResult.reason_codes.join(", ")}
- Tác động tới mục tiêu: ${JSON.stringify(rulesResult.goal_impacts)}
- Điểm kỷ luật phạt/thưởng nếu nghịch bộ máy: ${rulesResult.final_decision.includes("approve") ? 5 : -10} điểm.

Hãy sử dụng tiếng Việt tự nhiên, đậm chất GenZ, châm chọc sắc sảo nhưng rất thiết thực, giáo huấn thâm độc hài hước (tương tự cú xanh Duolingo).
Chú ý 1: Nếu có Tác động tới mục tiêu (goal_impacts) bị suy giảm (negative), thành viên HĐQT phải lôi cái mục tiêu đó ra để đe dọa (Ví dụ: "Nếu mua iPhone hôm nay, mục tiêu đi Nhật Bản sẽ lùi lại 4 tháng!").
Chú ý 2: Thành viên hội đồng tham gia tranh luận phụ thuộc vào Bản chất tài chính (Intent):
- Nếu là Consumption (tiêu sản), CFO và Risk Director phải lên án gay gắt sự lãng phí.
- Nếu là Experience Spending (Trải nghiệm), Experience Director sẽ cổ vũ tận hưởng cuộc sống (hoặc Travel Director nếu có).
- Nếu là Asset Accumulation (Tích lũy tài sản) hoặc Capital Preservation, Growth Director sẽ đánh giá cao.
- Nếu là Risk Protection (Bảo hiểm), Risk Director sẽ rất hài lòng.
- Nếu là Human Capital Investment (Đầu tư não bộ), Experience Director và CFO có thể đồng thuận nới lỏng ngân sách.
Hãy dựa vào Intent này để lựa chọn ra 3-4 thành viên phù hợp nhất cãi nhau.

Duy trì 8 thành viên cốt cán có cá tính dở hơi: chairman, cxo, cho, clo, luck_director, cto, cgo, cro, wallet.
1. Soạn 4-5 lượt Tranh luận nảy lửa.
2. Ghi nhận phiếu bầu của TOÀN BỘ 8 thành viên (nếu approve thì >= 5 approve, nếu deny: >= 5 deny).
BẤT KỲ AI CŨNG CHỈ ĐƯỢC VOTE trường "vote" là "approve" hoặc "reject". TUYỆT ĐỐI KHÔNG DÙNG "abstain", "phân vân" hay từ nào khác.
3. Soạn phán quyết kết luận sau cùng lạnh lùng.

Định dạng JSON trả về phải khớp tuyệt đối 100% với Schema quy định.`;

    const response = await this.client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
        // ... omitted full schema map for brevity, relying on AI's generated JSON response matching DebateResult
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            theme: { type: Type.STRING },
            debateSteps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { memberId: { type: Type.STRING }, memberName: { type: Type.STRING }, quote: { type: Type.STRING } },
                required: ["memberId", "memberName", "quote"]
              }
            },
            votes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { memberId: { type: Type.STRING }, memberName: { type: Type.STRING }, vote: { type: Type.STRING, description: "MUST BE EXACTLY 'approve' or 'reject'. ABSOLUTELY NO OTHER VALUES." }, reason: { type: Type.STRING } },
                required: ["memberId", "memberName", "vote", "reason"]
              }
            },
            conclusion: {
              type: Type.OBJECT,
              properties: {
                approved: { type: Type.BOOLEAN },
                summary: { type: Type.STRING },
                disciplineImpact: { type: Type.INTEGER }
              },
              required: ["approved", "summary", "disciplineImpact"]
            }
          },
          required: ["theme", "debateSteps", "votes", "conclusion"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    
    return {
      debateResult: {
        theme: parsedData.theme,
        debateSteps: parsedData.debateSteps,
        votes: parsedData.votes,
        conclusion: parsedData.conclusion,
      },
      metadata: {
        prompt_version: this.PROMPT_VERSION,
        llm_provider: "gemini",
        llm_model: "gemini-3.5-flash",
        fallback_used: false
      }
    };
  }
}

export class FallbackProvider implements LLMProvider {
  public async generateBoardNarration(rulesResult: EvaluationResult, inputParams: any): Promise<{ debateResult: DebateResult; metadata: any }> {
    const isApproved = rulesResult.final_decision === "approve" || rulesResult.final_decision === "approve_with_conditions";
    
    return {
      debateResult: {
        theme: "Hệ Thống Phán Xét Khẩn Cấp (Do đứt cáp hoặc kẹt mạng)",
        debateSteps: [
          { memberId: "cto", memberName: "CTO", quote: "Máy quét tài chính ghi nhận dữ liệu đã được xử lý bằng ngõ tắt." },
          { memberId: "chairman", memberName: "Chủ Tịch HĐQT", quote: "Hội đồng AI đang đi du lịch, phán quyết này được ban hành trực tiếp từ hệ thống Core. Không thương lượng!" },
        ],
        votes: [
          { memberId: "cto", memberName: "CTO", vote: isApproved ? "approve" : "reject", reason: "Tuân thủ thuật toán." },
          { memberId: "chairman", memberName: "Chủ Tịch HĐQT", vote: isApproved ? "approve" : "reject", reason: "Phê duyệt nhanh vì bận họp." }
        ],
        conclusion: {
          approved: isApproved,
          summary: isApproved ? "Core engine đã duyệt tự động. Chi tiêu cẩn thận, bọn ta sẽ dò lại sau!" : "Core engine cấm cửa. Bác bỏ vì vượt quá giới hạn an toàn tài chính.",
          disciplineImpact: isApproved ? 5 : -10
        }
      },
      metadata: {
        prompt_version: "v0.0_fallback",
        llm_provider: "fallback_sys",
        llm_model: "hardcoded_fallback",
        fallback_used: true
      }
    };
  }
}
