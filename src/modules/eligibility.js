/**
 * Eligibility Module - SIH26091 (GramVistaar)
 * Pure deterministic rule engine evaluating applicant social category, family income,
 * state domicile, and prior default status against NSFDC, NBCFDC, and NSTFDC scheme rules.
 */

import fs from 'fs';
import path from 'path';

/**
 * Load eligibility rules configuration from JSON file
 */
export function loadEligibilityRules(filePath) {
  const resolvedPath = filePath || path.join(process.cwd(), 'data', 'eligibility_rules.json');
  const rawData = fs.readFileSync(resolvedPath, 'utf8');
  return JSON.parse(rawData);
}

/**
 * Evaluate applicant eligibility
 * @param {Object} applicant - Applicant profile
 * @param {string} applicant.category - 'SC', 'OBC', or 'ST'
 * @param {number} applicant.family_income_annual - Annual family income in INR
 * @param {string} applicant.state - Applicant state of domicile (e.g. 'Bihar')
 * @param {boolean} applicant.prior_default - Self-declared prior default status
 * @param {Object} [rulesData] - Optional injected rules object for testing
 * @returns {Object} Eligibility evaluation result
 */
export function checkEligibility(applicant, rulesData) {
  const rules = rulesData || loadEligibilityRules();
  const { category, family_income_annual, state, prior_default } = applicant;

  // 1. Check Category Match to Corporation
  let matchedCorpKey = null;
  let corpConfig = null;

  for (const [key, corp] of Object.entries(rules.corporations)) {
    if (corp.target_category.toUpperCase() === String(category).toUpperCase()) {
      matchedCorpKey = key;
      corpConfig = corp;
      break;
    }
  }

  if (!matchedCorpKey || !corpConfig) {
    return {
      status: 'fail',
      corporation: null,
      unmet_criteria: ['category'],
      explanation: `No active concessional corporation scheme found for category '${category}'. Concessional rules exist for SC (NSFDC), OBC (NBCFDC), and ST (NSTFDC).`
    };
  }

  const unmetCriteria = [];

  // 2. Check Annual Income Ceiling (₹3,00,000 / year)
  if (family_income_annual > corpConfig.income_ceiling_annual) {
    unmetCriteria.push('family_income_annual');
  }

  // 3. Check Domicile State (Must be Bihar for current active SCA)
  if (!corpConfig.state_scas[state]) {
    unmetCriteria.push('state');
  }

  // 4. Check Self-declared Prior Default
  if (prior_default === true) {
    unmetCriteria.push('prior_default');
  }

  if (unmetCriteria.length > 0) {
    let explanation = `Eligibility criteria unmet for ${corpConfig.name} (${matchedCorpKey}). `;
    if (unmetCriteria.includes('family_income_annual')) {
      explanation += `Annual family income (₹${family_income_annual.toLocaleString('en-IN')}) exceeds the ceiling of ₹${corpConfig.income_ceiling_annual.toLocaleString('en-IN')}/year. `;
    }
    if (unmetCriteria.includes('state')) {
      explanation += `State '${state}' does not have an active channelizing agency (SCA) configured for ${matchedCorpKey}. `;
    }
    if (unmetCriteria.includes('prior_default')) {
      explanation += `Applicant self-declared a prior default under a government concessional scheme. `;
    }

    return {
      status: 'fail',
      corporation: matchedCorpKey,
      corporation_name: corpConfig.name,
      unmet_criteria: unmetCriteria,
      explanation: explanation.trim()
    };
  }

  return {
    status: 'pass',
    corporation: matchedCorpKey,
    corporation_name: corpConfig.name,
    sca_name: corpConfig.state_scas[state],
    unmet_criteria: [],
    explanation: `Qualified for concessional scheme financing under ${corpConfig.name} (${matchedCorpKey}) via ${corpConfig.state_scas[state]}.`
  };
}
