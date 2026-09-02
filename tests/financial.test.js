import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateFinancialPlan } from '../src/modules/financial.js';

describe('Financial Calculator Module Tests (Deterministic)', () => {
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

  it('should handle tier boundary case (Project Cost exactly ₹1,40,000)', () => {
    const input = {
      available_capital: 14000,
      corporation: 'NSFDC'
    };

    const result = calculateFinancialPlan(input);

    assert.equal(result.project_cost, 140000);
    assert.equal(result.loan_eligibility, 125000); // 90% of 1.40L = 1.26L, capped at max_loan_amount 1.25L
    assert.equal(result.scheme_name, 'Micro Finance Scheme');
  });

  it('should return COST_EXCEEDS_CEILING error when project cost > ₹50,00,000', () => {
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
});
