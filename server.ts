import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { DecisionCore } from "./src/decisionCore";
import { GeminiProvider, FallbackProvider, LLMProvider } from "./src/llmProvider";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// 4. Activity Event Log
const eventLog: any[] = [];
function logEvent(userId: string, eventType: string, metadata: any) {
  eventLog.push({
    event_id: `evt_${Date.now()}_${Math.floor(Math.random()*1000)}`,
    user_id: userId,
    event_type: eventType,
    metadata,
    created_at: new Date().toISOString()
  });
}

// 11. Model Abstraction Layer
let activeLLMProvider: LLMProvider;
function getLLMProvider(): LLMProvider {
  if (!activeLLMProvider) {
    if (process.env.LLM_PROVIDER === "fallback") {
      activeLLMProvider = new FallbackProvider();
    } else {
      try {
        activeLLMProvider = new GeminiProvider();
      } catch (e) {
        console.warn("Falling back to Template Provider due to missing API Key");
        activeLLMProvider = new FallbackProvider();
      }
    }
  }
  return activeLLMProvider;
}

// 8. Financial Persona Classification
function classifyPersona(financialProfile: any) {
  if (!financialProfile || !financialProfile.lifestyle_preference) {
    return { persona: "Balanced", confidence: 0.5 };
  }
  const prefs = financialProfile.lifestyle_preference;
  if (prefs.travel >= 4) return { persona: "Explorer", confidence: 0.8 };
  if (prefs.saving >= 4) return { persona: "Builder", confidence: 0.8 };
  if (prefs.investing >= 4) return { persona: "Investor", confidence: 0.8 };
  if (prefs.shopping >= 4 || prefs.entertainment >= 4) return { persona: "Spender", confidence: 0.7 };
  return { persona: "Optimizer", confidence: 0.6 };
}

// 9. Proposal Cooldown System -> Simple memory stub
const cooldowns: Record<string, number[]> = {};

// Simple in-memory DB for replacing localStorage
let memoryDb: Record<string, any> = {};

// API Route: Profile Persistence
app.get("/api/profile", (req, res) => {
  res.json(memoryDb);
});

app.post("/api/profile", (req, res) => {
  memoryDb = { ...memoryDb, ...req.body };
  res.json({ success: true, profile: memoryDb });
});

// API Route: HĐQT Debate and Vote
app.post("/api/board/debate", async (req, res): Promise<any> => {
  try {
    const { proposalName, amount, income, savings, investments, disciplineScore, context, financialProfile } = req.body;
    const userId = financialProfile?.user_id || "anonymous";
    
    if (!proposalName || amount === undefined) {
      return res.status(400).json({ error: "Thương vụ thảo luận cần có tên và số tiền mặt!" });
    }

    logEvent(userId, "REQUEST_SUBMITTED", { proposalName, amount });

    // Cooldown logic
    const userCooldowns = cooldowns[userId] || [];
    const recentRejects = userCooldowns.filter(time => Date.now() - time < 24 * 60 * 60 * 1000).length;
    if (recentRejects >= 3) {
      return res.status(429).json({
        error: "Cooldown active", 
        message: "HĐQT đề nghị CEO tạm ngưng mua sắm và uống một ly nước rà soát lại tham vọng.",
        remaining_minutes: 30
      });
    }

    const personaClass = classifyPersona(financialProfile);

    const core = new DecisionCore();
    const coreEval = core.evaluate({
      proposalName,
      context,
      amount,
      income: income || 0,
      savings: savings || 0,
      investments: investments || 0,
      disciplineScore: disciplineScore || 80,
      financialProfile
    });

    if (coreEval.final_decision === "reject" || coreEval.final_decision === "delay") {
      logEvent(userId, "REQUEST_REJECTED", { evaluation_id: coreEval.evaluation_id });
      if (!cooldowns[userId]) cooldowns[userId] = [];
      cooldowns[userId].push(Date.now());
    } else {
      logEvent(userId, "REQUEST_APPROVED", { evaluation_id: coreEval.evaluation_id });
    }

    let llmData;
    try {
      const provider = getLLMProvider();
      llmData = await provider.generateBoardNarration(coreEval, req.body);
    } catch (llmError: any) {
      console.error("LLM Generation Failed, using fallback:", llmError);
      // 6. LLM Fallback Strategy
      const fallback = new FallbackProvider();
      llmData = await fallback.generateBoardNarration(coreEval, req.body);
    }
    
    // Attach explainability & traceability data
    coreEval.llm_metadata = llmData.metadata;

    const parsedData = {
      ...llmData.debateResult,
      explainability: coreEval.detailed_scores,
      traceability: coreEval.product_traceability,
      evaluationCore: coreEval,
      persona: personaClass,
      action_plan: coreEval.action_plan,
      goal_impacts: coreEval.goal_impacts
    } as any;

    // Fix up required UI fields that older versions expected from debate output directly
    parsedData.conclusion.disciplineImpact = coreEval.final_decision.includes("approve") ? 5 : -10;
    if (coreEval.reason_codes.includes("LOW_DISCIPLINE_WARNING")) parsedData.conclusion.disciplineImpact = -5;
    
    // Wire recommendations for frontend format
    parsedData.recommendedService = {
      name: coreEval.product_recommendations[0].product_name,
      description: coreEval.product_recommendations[0].why_this_product,
      logoEmoji: "✨",
      ctaText: coreEval.product_recommendations[0].cta_text,
      url: coreEval.product_recommendations[0].cta_url
    };
    parsedData.futureSimulation = {
      scenarioA: coreEval.future_simulation.scenario_a,
      scenarioB: coreEval.future_simulation.scenario_b,
      impactSummary: coreEval.future_simulation.impact_summary
    };

    return res.json(parsedData);
  } catch (error: any) {
    console.error("Board meeting failed:", error);
    return res.status(500).json({ error: error.message || "Failed to trigger Gemini Board Meeting" });
  }
});

// Admin Analytics Endpoint
app.get("/api/admin/logs", (req, res) => {
  res.json({ eventLog });
});

app.get("/api/admin/metrics", (req, res) => {
   res.json({
     total_proposals: eventLog.filter(e => e.event_type === "REQUEST_SUBMITTED").length,
     approved: eventLog.filter(e => e.event_type === "REQUEST_APPROVED").length,
     rejected: eventLog.filter(e => e.event_type === "REQUEST_REJECTED").length
   });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Boardroom is ready on: http://localhost:${PORT}`);
  });
}

startServer();