/**
 * Eligibility Module - SIH26091 (GramVistaar)
 * Pure deterministic eligibility gate checking category, income ceiling, domicile, and prior-default status.
 */

import fs from 'fs';
import path from 'path';

/**
 * Load default eligibility rules from JSON file if not provided
 */
export function loadEligibilityRules(filePath) {
  const resolvedPath = filePath || path.join(process.cwd(), 'data', 'eligibility_rules.json');
  const rawData = fs.readFileSync(resolvedPath, 'utf8');
  return JSON.parse(rawData);
}

/**
 * Check user eligibility against corporation rules
 * @param {Object} input - { category, family_income_annual, state, prior_default }
 * @param {Array} [rules] - Optional array of eligibility rule objects
 * @returns {Object} Result object per schema.md
 */
export function checkEligibility(input, rules) {
  const eligibilityRules = rules || loadEligibilityRules();

  if (!input || typeof input !== 'object') {
    return {
      status: 'fail',
      unmet_criterion: 'invalid_input',
      explanation: 'Input parameters are missing or invalid.',
      can_still_see_feasibility: true
    };
  }

  const { category, family_income_annual, state, prior_default } = input;

  // 1. Category match -> Corporation
  const matchingRule = eligibilityRules.find(r => r.category_match === category);
  if (!matchingRule) {
    return {
      status: 'fail',
      unmet_criterion: 'category',
      explanation: `No matching corporation scheme found for category '${category}'.`,
      can_still_see_feasibility: true
    };
  }

  const corporation = matchingRule.corporation;

  // 2. Check prior default self-declaration
  if (prior_default === true) {
    return {
      status: 'fail',
      corporation,
      unmet_criterion: 'prior_default',
      explanation: 'Self-declared prior default under a government scheme disqualifies credit eligibility.',
      can_still_see_feasibility: true
    };
  }

  // 3. Check state / domicile requirement
  if (state && matchingRule.domicile_requirement && state !== matchingRule.domicile_requirement) {
    return {
      status: 'fail',
      corporation,
      unmet_criterion: 'domicile_requirement',
      explanation: `State domicile '${state}' does not match active SCA requirement '${matchingRule.domicile_requirement}'.`,
      can_still_see_feasibility: true
    };
  }

  // 4. Check family annual income ceiling
  if (typeof family_income_annual === 'number' && family_income_annual > matchingRule.income_ceiling) {
    return {
      status: 'fail',
      corporation,
      unmet_criterion: 'income_ceiling',
      explanation: `Declared annual family income (₹${family_income_annual.toLocaleString('en-IN')}) exceeds the ${corporation} income ceiling of ₹${matchingRule.income_ceiling.toLocaleString('en-IN')}/year.`,
      can_still_see_feasibility: true
    };
  }

  // PASS
  return {
    status: 'pass',
    corporation,
    matched_criteria: ['category', 'income', 'domicile', 'no_prior_default'],
    rule_status: matchingRule.status || 'Verified',
    source_url: matchingRule.source_url || null,
    source_verified_date: matchingRule.source_verified_date || null
  };
}
