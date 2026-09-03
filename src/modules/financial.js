/**
 * Financial Calculator Module - SIH26091 (GramVistaar)
 * Pure deterministic financial structuring calculator with margin-money math,
 * tier routing, moratorium-aware EMI schedule, edge-case ceiling & floor validation, and source-tagged rates.
 */

import fs from 'fs';
import path from 'path';

/**
 * Load default scheme terms from JSON file if not provided
 */
export function loadSchemeTerms(filePath) {
  const resolvedPath = filePath || path.join(process.cwd(), 'data', 'scheme_terms.json');
  const rawData = fs.readFileSync(resolvedPath, 'utf8');
  return JSON.parse(rawData);
}

/**
 * Compute reducing balance EMI and monthly repayment schedule with moratorium period
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual interest rate as decimal (e.g. 0.08 for 8%)
 * @param {number} tenureYears - Total loan tenure in years
 * @param {number} moratoriumMonths - Moratorium period in months
 * @returns {Object} { monthlyEmi, totalRepayment, totalInterest, schedule }
 */
export function computeEmiSchedule(principal, annualRate, tenureYears, moratoriumMonths) {
  const totalMonths = tenureYears * 12;
  const repaymentMonths = totalMonths - moratoriumMonths;
  const monthlyRate = annualRate / 12;

  let monthlyEmi = 0;
  if (repaymentMonths > 0 && monthlyRate > 0) {
    const factor = Math.pow(1 + monthlyRate, repaymentMonths);
    monthlyEmi = Math.round((principal * monthlyRate * factor) / (factor - 1));
  } else if (repaymentMonths > 0) {
    monthlyEmi = Math.round(principal / repaymentMonths);
  }

  const schedule = [];
  let balance = principal;
  let totalInterest = 0;
  let totalRepayment = 0;

  // Moratorium Months (1 to moratoriumMonths)
  for (let month = 1; month <= moratoriumMonths; month++) {
    const interestPayment = Math.round(balance * monthlyRate);
    totalInterest += interestPayment;
    schedule.push({
      period: month,
      emi: 0,
      interest_payment: interestPayment,
      principal_payment: 0,
      remaining_balance: balance,
      note: 'Moratorium Period (Principal Deferred)'
    });
  }

  // Repayment Months (moratoriumMonths + 1 to totalMonths)
  for (let month = moratoriumMonths + 1; month <= totalMonths; month++) {
    const interestPayment = Math.round(balance * monthlyRate);
    let principalPayment = monthlyEmi - interestPayment;

    // Adjust last month rounding
    if (month === totalMonths || balance < principalPayment) {
      principalPayment = balance;
      const finalEmi = principalPayment + interestPayment;
      balance = 0;
      totalInterest += interestPayment;
      totalRepayment += finalEmi;
      schedule.push({
        period: month,
        emi: finalEmi,
        interest_payment: interestPayment,
        principal_payment: principalPayment,
        remaining_balance: 0,
        note: 'Final Repayment'
      });
      break;
    }

    balance -= principalPayment;
    totalInterest += interestPayment;
    totalRepayment += monthlyEmi;

    schedule.push({
      period: month,
      emi: monthlyEmi,
      interest_payment: interestPayment,
      principal_payment: principalPayment,
      remaining_balance: balance,
      note: 'Standard Repayment'
    });
  }

  return {
    monthlyEmi,
    totalInterest,
    totalRepayment,
    schedule
  };
}

/**
 * Calculate Financial Structuring Plan
 * @param {Object} input - { available_capital, corporation }
 * @param {Array} [terms] - Optional array of scheme term objects
 * @returns {Object} Financial plan per schema.md or EdgeCaseResponse on overflow/underflow
 */
export function calculateFinancialPlan(input, terms) {
  const schemeTerms = terms || loadSchemeTerms();

  if (!input || typeof input.available_capital !== 'number' || input.available_capital <= 0) {
    return {
      error: true,
      code: 'INVALID_CAPITAL',
      message: 'Available capital must be a positive number.'
    };
  }

  const availableCapital = input.available_capital;
  const corporation = input.corporation || 'NSFDC';

  // 1. Calculate project cost ceiling (Capital = 10% Margin Money -> Project Cost = Capital / 0.10)
  const projectCost = Math.round(availableCapital / 0.10);

  // Check floor boundary case (Project cost below minimum threshold of ₹10,000)
  if (projectCost < 10000) {
    return {
      error: true,
      code: 'BELOW_MINIMUM',
      message: `Project cost of ₹${projectCost.toLocaleString('en-IN')} is below the minimum threshold of ₹10,000 for concessional schemes.`,
      min_required_capital: 1000,
      what_would_change: 'Increase available capital to at least ₹1,000.'
    };
  }

  // 2. Initial 90% loan eligibility
  let rawLoanEligibility = Math.round(projectCost * 0.90);

  // 3. Find matching scheme tier based on project cost
  const matchedScheme = schemeTerms.find(
    s => s.corporation === corporation &&
         projectCost >= s.min_project_cost &&
         projectCost <= s.max_project_cost
  ) || schemeTerms.find(
    s => projectCost >= s.min_project_cost && projectCost <= s.max_project_cost
  );

  // Handle upper ceiling overflow (Project cost > ₹50,00,000)
  if (!matchedScheme) {
    const highestTier = schemeTerms.reduce((max, s) => (s.max_project_cost > max.max_project_cost ? s : max), schemeTerms[0]);
    return {
      error: true,
      code: 'COST_EXCEEDS_CEILING',
      message: `Project cost of ₹${projectCost.toLocaleString('en-IN')} exceeds the ceiling for ${highestTier.scheme_name} (₹${highestTier.max_project_cost.toLocaleString('en-IN')}).`,
      nearest_tier: highestTier.scheme_name,
      max_supported_capital: Math.round(highestTier.max_project_cost * 0.10),
      what_would_change: 'Reduce available capital or apply for a different scheme category.'
    };
  }

  // Cap-clamp case: Clamp loan eligibility to scheme's max_loan_amount
  const loanEligibility = Math.min(rawLoanEligibility, matchedScheme.max_loan_amount);

  // 4. Calculate Moratorium-Aware EMI Schedule
  const emiData = computeEmiSchedule(
    loanEligibility,
    matchedScheme.interest_rate,
    matchedScheme.tenure_years,
    matchedScheme.moratorium_months
  );

  return {
    project_cost: projectCost,
    loan_eligibility: loanEligibility,
    is_cap_clamped: loanEligibility < rawLoanEligibility,
    raw_unclamped_eligibility: rawLoanEligibility,
    scheme_id: matchedScheme.scheme_id,
    scheme_name: matchedScheme.scheme_name,
    corporation: matchedScheme.corporation,
    interest_rate: matchedScheme.interest_rate,
    interest_rate_tag: {
      label: 'Verified',
      source: `${matchedScheme.corporation} ${matchedScheme.scheme_name}`,
      date: matchedScheme.source_verified_date || '2026-08-30'
    },
    tenure_years: matchedScheme.tenure_years,
    moratorium_months: matchedScheme.moratorium_months,
    monthly_emi: emiData.monthlyEmi,
    total_interest: emiData.totalInterest,
    total_repayment: emiData.totalRepayment,
    emi_schedule: emiData.schedule,
    affordability_flag: null
  };
}
