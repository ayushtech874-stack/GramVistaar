/**
 * Live LLM Test & Verification Script - SIH26091 (GramVistaar)
 * Tests raw API execution, post-processing tag validation, Hindi dynamic generation,
 * boundary cases, and measures exact latency.
 */

import { generateFeasibilityNarrative } from '../src/modules/feasibilityLlm.js';
import { lookupLocalMetrics } from '../src/modules/localMetrics.js';
import { calculateFinancialPlan } from '../src/modules/financial.js';

async function runVerification() {
  console.log('====================================================');
  console.log('GRAMVISTAAR LIVE VERIFICATION TEST SUITE');
  console.log('====================================================\n');

  // 1. Local Metrics Lookup for Ratwara Bindwara Deoria
  const metrics = lookupLocalMetrics('229072', 'dairy');
  console.log('[1] Local Metrics Lookup for Ratwara Bindwara Deoria:');
  console.log(`- Population: ${metrics.population.value} (${metrics.population.tag})`);
  console.log(`- Households: ${metrics.households.value} (${metrics.households.tag})`);
  console.log(`- Establishments: ${metrics.establishments.value} (${metrics.establishments.tag})`);
  console.log(`  Reason: ${metrics.establishments.reason}\n`);

  // 2. Test English Narrative & Measure Latency
  console.log('[2] Testing English Feasibility Narrative Generation...');
  const t0 = Date.now();
  const resEn = await generateFeasibilityNarrative(metrics, 'dairy', 100000, 'en');
  const latencyEn = Date.now() - t0;

  console.log(`- Status: ${resEn.is_live_llm ? 'LIVE API' : 'Grounded Template Fallback'}`);
  console.log(`- Measured Latency: ${latencyEn} ms`);
  console.log(`- Pricing Guidance Revenue: ₹${resEn.pricing_guidance.estimated_monthly_revenue}`);
  console.log('- SWOT Items Count:', resEn.swot.length);
  console.log('\n--- RAW LLM RESPONSE PRE-TAG VALIDATION ---');
  console.log(resEn.raw_llm_response || '(Grounded Template Fallback JSON used)');
  console.log('\n--- POST-PROCESSED NARRATIVE OBJECT ---');
  console.log(JSON.stringify(resEn.swot, null, 2));

  // 3. Test Hindi Narrative Generation (Dynamic Language Switching)
  console.log('\n[3] Testing Hindi Feasibility Narrative Generation (Dynamic Language Switch)...');
  const t1 = Date.now();
  const resHi = await generateFeasibilityNarrative(metrics, 'dairy', 100000, 'hi');
  const latencyHi = Date.now() - t1;

  console.log(`- Status: ${resHi.is_live_llm ? 'LIVE API' : 'Grounded Template Fallback'}`);
  console.log(`- Measured Latency: ${latencyHi} ms`);
  console.log('\n--- HINDI SWOT OUTPUT SAMPLE ---');
  resHi.swot.forEach(item => {
    console.log(`[${item.type.toUpperCase()}] ${item.text} -> Tag: ${item.tag}`);
  });
  console.log('\n--- HINDI PRICING GUIDANCE SAMPLE ---');
  console.log(`${resHi.pricing_guidance.text} -> Tag: ${resHi.pricing_guidance.tag}`);

  // 4. Boundary Case Verification: Capital ₹14,000 vs ₹14,001
  console.log('\n[4] Boundary Case Verification (Micro Finance vs Term Loan):');

  const microPlan = calculateFinancialPlan({ available_capital: 14000, corporation: 'NSFDC' });
  console.log('\nCase A: Capital = ₹14,000');
  console.log(`- Scheme: ${microPlan.scheme_name}`);
  console.log(`- Project Cost Ceiling: ₹${microPlan.project_cost.toLocaleString('en-IN')}`);
  console.log(`- Loan Eligibility: ₹${microPlan.loan_eligibility.toLocaleString('en-IN')}`);
  console.log(`- Interest Rate: ${(microPlan.interest_rate * 100).toFixed(1)}% p.a.`);
  console.log(`- Tenure: ${microPlan.tenure_years} Years (Moratorium: ${microPlan.moratorium_months} Months)`);
  console.log(`- Monthly EMI: ₹${microPlan.monthly_emi.toLocaleString('en-IN')}`);

  const termPlan = calculateFinancialPlan({ available_capital: 14001, corporation: 'NSFDC' });
  console.log('\nCase B: Capital = ₹14,001');
  console.log(`- Scheme: ${termPlan.scheme_name}`);
  console.log(`- Project Cost Ceiling: ₹${termPlan.project_cost.toLocaleString('en-IN')}`);
  console.log(`- Loan Eligibility: ₹${termPlan.loan_eligibility.toLocaleString('en-IN')}`);
  console.log(`- Interest Rate: ${(termPlan.interest_rate * 100).toFixed(1)}% p.a.`);
  console.log(`- Tenure: ${termPlan.tenure_years} Years (Moratorium: ${termPlan.moratorium_months} Months)`);
  console.log(`- Monthly EMI: ₹${termPlan.monthly_emi.toLocaleString('en-IN')}`);

  console.log('\n====================================================');
  console.log('VERIFICATION TEST COMPLETE');
  console.log('====================================================');
}

runVerification();
