import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateFinancialPlan } from '../src/modules/financial.js';

describe('Financial Calculator Module Edge Case Tests (Deterministic)', () => {
  it('should match the PS worked example (Capital ₹1,00,000 -> Project Cost ₹10,00,000 -> Loan ₹9,00,000, Term Loan Scheme)', () => {
    const input = {
      available_capital: 100000,
      corporation: 'NSFDC'
    };

    const result = calculateFinancialPlan(input);

    assert.equal(result.project_cost, 1000000);
    assert.equal(result.loan_eligibility, 900000);
    assert.equal(result.scheme_name, 'Term Loan Scheme');
    assert.equal(result.interest_rate, 0.08);
    assert.equal(result.tenure_years, 7);
    assert.equal(result.moratorium_months, 6);
    assert.equal(result.interest_rate_tag.label, 'Verified');
    assert.equal(result.interest_rate_tag.source, 'NSFDC Term Loan Scheme');

    // Verification of EMI schedule length (7 years * 12 months = 84 months)
    assert.equal(result.emi_schedule.length, 84);

    // Moratorium check (Months 1 to 6)
    for (let i = 0; i < 6; i++) {
      assert.equal(result.emi_schedule[i].emi, 0);
      assert.match(result.emi_schedule[i].note, /Moratorium/);
    }

    // Repayment start (Month 7)
    assert.ok(result.emi_schedule[6].emi > 0);
    assert.ok(result.monthly_emi > 0);
  });

  it('should route to Micro Finance Scheme when project cost <= ₹1,40,000', () => {
    const input = {
      available_capital: 10000,
      corporation: 'NSFDC'
    };

    const result = calculateFinancialPlan(input);

    assert.equal(result.project_cost, 100000);
    assert.equal(result.loan_eligibility, 90000);
    assert.equal(result.scheme_name, 'Micro Finance Scheme');
    assert.equal(result.interest_rate, 0.065);
    assert.equal(result.tenure_years, 3);
    assert.equal(result.moratorium_months, 3);
    assert.equal(result.emi_schedule.length, 36);
  });

  // EDGE CASE (a): Ceiling case: project cost > ₹50,00,000 -> returns COST_EXCEEDS_CEILING
  it('Edge Case (a): should return COST_EXCEEDS_CEILING error when project cost > ₹50,00,000 (Capital ₹6,00,000)', () => {
    const input = {
      available_capital: 600000,
      corporation: 'NSFDC'
    };

    const result = calculateFinancialPlan(input);

    assert.equal(result.error, true);
    assert.equal(result.code, 'COST_EXCEEDS_CEILING');
    assert.equal(result.nearest_tier, 'Term Loan Scheme');
    assert.ok(result.what_would_change);
  });

  // EDGE CASE (b): Floor case: capital too small (e.g. ₹500) -> returns BELOW_MINIMUM, no schedule
  it('Edge Case (b): should return BELOW_MINIMUM error when capital is too small (Capital ₹500 -> Project Cost ₹5,000)', () => {
    const input = {
      available_capital: 500,
      corporation: 'NSFDC'
    };

    const result = calculateFinancialPlan(input);

    assert.equal(result.error, true);
    assert.equal(result.code, 'BELOW_MINIMUM');
    assert.equal(result.min_required_capital, 1000);
    assert.ok(result.what_would_change);
    assert.equal(result.emi_schedule, undefined);
  });

  // EDGE CASE (c): Cap-clamp case: loan eligibility hitting scheme max-loan cap before 90%
  it('Edge Case (c): should clamp loan eligibility to scheme max-loan cap (Capital ₹14,000 -> Project Cost ₹1,40,000 -> 90% is ₹1,26,000, clamped to ₹1,25,000)', () => {
    const input = {
      available_capital: 14000,
      corporation: 'NSFDC'
    };

    const result = calculateFinancialPlan(input);

    assert.equal(result.project_cost, 140000);
    assert.equal(result.raw_unclamped_eligibility, 126000);
    assert.equal(result.loan_eligibility, 125000); // Clamped to max_loan_amount
    assert.equal(result.is_cap_clamped, true);
    assert.equal(result.scheme_name, 'Micro Finance Scheme');
  });

  it('should route to Term Loan Scheme for project cost just above ₹1,40,000 (Project Cost ₹1,40,010)', () => {
    const input = {
      available_capital: 14001,
      corporation: 'NSFDC'
    };

    const result = calculateFinancialPlan(input);

    assert.equal(result.project_cost, 140010);
    assert.equal(result.scheme_name, 'Term Loan Scheme');
    assert.equal(result.interest_rate, 0.08);
    assert.equal(result.tenure_years, 7);
    assert.equal(result.moratorium_months, 6);
  });
});
