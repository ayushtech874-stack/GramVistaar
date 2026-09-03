/**
 * API Server - SIH26091 (GramVistaar)
 * Express API serving Eligibility, Financial Calculator, Local Metrics, LLM Feasibility, and Assessment Endpoints.
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';

import { checkEligibility } from './modules/eligibility.js';
import { calculateFinancialPlan } from './modules/financial.js';
import { lookupLocalMetrics, loadVillageMetrics } from './modules/localMetrics.js';
import { generateFeasibilityNarrative } from './modules/feasibilityLlm.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static frontend files if present
app.use(express.static(path.join(process.cwd(), 'public')));

/**
 * GET /api/villages
 * Returns list of pre-loaded villages for dropdown selection
 */
app.get('/api/villages', (req, res) => {
  try {
    const villages = loadVillageMetrics();
    const formatted = villages.map(v => ({
      village_id: v.village_id,
      village_name: v.village_name,
      block: v.block,
      district: v.district,
      state: v.state || 'Bihar'
    }));
    return res.json({
      district: 'Muzaffarpur & Gaya',
      villages: formatted
    });
  } catch (err) {
    return res.status(500).json({ error: true, message: 'Failed to load villages', code: 'SERVER_ERROR' });
  }
});

/**
 * POST /api/eligibility
 * Runs eligibility gate check
 */
app.post('/api/eligibility', (req, res) => {
  try {
    const result = checkEligibility(req.body);
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ error: true, message: err.message, code: 'INVALID_REQUEST' });
  }
});

/**
 * POST /api/calculate
 * Runs financial calculator (margin money, tier routing, EMI schedule)
 */
app.post('/api/calculate', (req, res) => {
  try {
    const result = calculateFinancialPlan(req.body);
    if (result.error) {
      return res.status(400).json(result);
    }
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ error: true, message: err.message, code: 'INVALID_REQUEST' });
  }
});

/**
 * POST /api/feasibility
 * Performs local metrics lookup and grounded feasibility narrative
 */
app.post('/api/feasibility', async (req, res) => {
  try {
    const { village_id, category, available_capital, language } = req.body;
    if (!village_id) {
      return res.status(400).json({ error: true, message: 'village_id is required', code: 'MISSING_PARAM' });
    }

    const metrics = lookupLocalMetrics(village_id, category);
    if (metrics.error) {
      return res.status(404).json(metrics);
    }

    const feasibilityReport = await generateFeasibilityNarrative(metrics, category, available_capital || 100000, language || 'en');
    return res.json(feasibilityReport);
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message, code: 'SERVER_ERROR' });
  }
});

/**
 * POST /api/assess
 * Convenience endpoint chaining Eligibility, Financial Calculator, and Feasibility
 */
app.post('/api/assess', async (req, res) => {
  try {
    const {
      category,
      family_income_annual,
      state,
      prior_default,
      available_capital,
      village_id,
      business_category,
      language
    } = req.body;

    // 1. Eligibility Check
    const eligibilityResult = checkEligibility({
      category: category || 'SC',
      family_income_annual: Number(family_income_annual) || 60000,
      state: state || 'Bihar',
      prior_default: Boolean(prior_default)
    });

    let financialResult = null;
    if (eligibilityResult.status === 'pass' && available_capital) {
      financialResult = calculateFinancialPlan({
        available_capital: Number(available_capital),
        corporation: eligibilityResult.corporation
      });
    }

    // 2. Feasibility Lookup & LLM Grounded Narrative
    let feasibilityResult = null;
    if (village_id) {
      const metrics = lookupLocalMetrics(village_id, business_category || category);
      if (!metrics.error) {
        feasibilityResult = await generateFeasibilityNarrative(
          metrics,
          business_category || category,
          available_capital || 100000,
          language || 'en'
        );

        // Dynamically compute Affordability Risk Flag using dynamic revenue from feasibility result
        if (financialResult && !financialResult.error && financialResult.monthly_emi) {
          const estimatedRevenue = feasibilityResult.pricing_guidance?.estimated_monthly_revenue || 32000;
          const emiRatio = financialResult.monthly_emi / estimatedRevenue;

          let flagLevel = 'Low risk';
          let riskColor = 'green';
          if (emiRatio >= 0.40) {
            flagLevel = 'High risk — reconsider loan size or capital';
            riskColor = 'red';
          } else if (emiRatio >= 0.25) {
            flagLevel = 'Moderate risk';
            riskColor = 'amber';
          }

          financialResult.affordability_flag = {
            ratio: Number(emiRatio.toFixed(2)),
            percentage: Math.round(emiRatio * 100),
            flag: flagLevel,
            risk_color: riskColor,
            explanation: `Monthly EMI (₹${financialResult.monthly_emi.toLocaleString('en-IN')}) is ~${Math.round(emiRatio * 100)}% of estimated monthly business revenue (₹${estimatedRevenue.toLocaleString('en-IN')}).`
          };
        }
      }
    }

    return res.json({
      eligibility: eligibilityResult,
      financial: financialResult,
      feasibility: feasibilityResult
    });
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message, code: 'SERVER_ERROR' });
  }
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[GramVistaar API] Running on http://localhost:${PORT}`);
  });
}

export default app;
