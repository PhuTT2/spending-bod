import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf-8');

const startMarker = 'function detectCategory(';
const endMarker = '// API Route: HĐQT Debate and Vote';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `function evaluateProposalRules(input: any) {
  const core = new DecisionCore();
  const res = core.evaluate(input);
  return {
    decision: res.final_decision,
    riskLevel: res.risk_level === 'high' ? 'High' : res.risk_level === 'medium' ? 'Medium' : 'Low',
    disciplineImpact: res.reason_codes.includes('LOW_DISCIPLINE_WARNING') ? -5 : (res.final_decision === 'approve' ? 5 : -10),
    recommendedService: {
      name: res.product_recommendations[0].product_name,
      description: res.product_recommendations[0].why_this_product,
      logoEmoji: '✨',
      ctaText: res.product_recommendations[0].cta_text,
      url: res.product_recommendations[0].cta_url
    },
    futureSimulation: {
      scenarioA: res.future_simulation.scenario_a,
      scenarioB: res.future_simulation.scenario_b,
      impactSummary: res.future_simulation.impact_summary
    }
  };
}

`;
  
  content = content.slice(0, startIndex) + replacement + content.slice(endIndex);
  fs.writeFileSync('server.ts', content);
  console.log('Successfully replaced logic in server.ts');
} else {
  console.error('Could not find markers');
}
