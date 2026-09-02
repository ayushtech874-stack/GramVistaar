import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { checkEligibility } from '../src/modules/eligibility.js';

describe('Eligibility Module Tests (Deterministic)', () => {
  it('should PASS for valid Rekha SC persona (NSFDC, income <= ₹3,00,000, Bihar, no prior default)', () => {
    const input = {
      category: 'SC',
      family_income_annual: 60000,
      state: 'Bihar',
      prior_default: false
    };

    const result = checkEligibility(input);

    assert.equal(result.status, 'pass');
    assert.equal(result.corporation, 'NSFDC');
    assert.deepEqual(result.matched_criteria, ['category', 'income', 'domicile', 'no_prior_default']);
    assert.equal(result.rule_status, 'Verified');
  });

  it('should FAIL when annual family income exceeds the ceiling of ₹3,00,000', () => {
    const input = {
      category: 'SC',
      family_income_annual: 350000,
      state: 'Bihar',
      prior_default: false
    };

    const result = checkEligibility(input);

    assert.equal(result.status, 'fail');
    assert.equal(result.corporation, 'NSFDC');
    assert.equal(result.unmet_criterion, 'income_ceiling');
    assert.equal(result.can_still_see_feasibility, true);
    assert.match(result.explanation, /exceeds the NSFDC income ceiling/);
  });

  it('should FAIL when user self-declares a prior default under a government scheme', () => {
    const input = {
      category: 'SC',
      family_income_annual: 60000,
      state: 'Bihar',
      prior_default: true
    };

    const result = checkEligibility(input);

    assert.equal(result.status, 'fail');
    assert.equal(result.corporation, 'NSFDC');
    assert.equal(result.unmet_criterion, 'prior_default');
    assert.equal(result.can_still_see_feasibility, true);
  });

  it('should FAIL when state domicile does not match the active SCA requirement', () => {
    const input = {
      category: 'SC',
      family_income_annual: 60000,
      state: 'Maharashtra',
      prior_default: false
    };

    const result = checkEligibility(input);

    assert.equal(result.status, 'fail');
    assert.equal(result.corporation, 'NSFDC');
    assert.equal(result.unmet_criterion, 'domicile_requirement');
  });

  it('should correctly handle NBCFDC & NSTFDC placeholder status rules', () => {
    const inputOBC = {
      category: 'OBC',
      family_income_annual: 100000,
      state: 'Bihar',
      prior_default: false
    };

    const resultOBC = checkEligibility(inputOBC);
    assert.equal(resultOBC.status, 'pass');
    assert.equal(resultOBC.corporation, 'NBCFDC');
    assert.equal(resultOBC.rule_status, 'Unverified_Placeholder');

    const inputST = {
      category: 'ST',
      family_income_annual: 100000,
      state: 'Bihar',
      prior_default: false
    };

    const resultST = checkEligibility(inputST);
    assert.equal(resultST.status, 'pass');
    assert.equal(resultST.corporation, 'NSTFDC');
    assert.equal(resultST.rule_status, 'Unverified_Placeholder');
  });
});
