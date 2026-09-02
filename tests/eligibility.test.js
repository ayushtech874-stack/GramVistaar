import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { checkEligibility } from '../src/modules/eligibility.js';

describe('Eligibility Module Tests (Deterministic)', () => {
  it('should PASS for valid Rekha SC persona (NSFDC, income <= ₹3,00,000, Bihar, no prior default)', () => {
    const applicant = {
      category: 'SC',
      family_income_annual: 60000,
      state: 'Bihar',
      prior_default: false
    };

    const result = checkEligibility(applicant);

    assert.equal(result.status, 'pass');
    assert.equal(result.corporation, 'NSFDC');
    assert.equal(result.sca_name, 'Bihar State Scheduled Castes Co-operative Development Corporation Limited (BSCCDCL)');
    assert.deepEqual(result.unmet_criteria, []);
  });

  it('should FAIL when annual family income exceeds the ceiling of ₹3,00,000', () => {
    const applicant = {
      category: 'SC',
      family_income_annual: 350000,
      state: 'Bihar',
      prior_default: false
    };

    const result = checkEligibility(applicant);

    assert.equal(result.status, 'fail');
    assert.equal(result.corporation, 'NSFDC');
    assert.ok(result.unmet_criteria.includes('family_income_annual'));
  });

  it('should FAIL when user self-declares a prior default under a government scheme', () => {
    const applicant = {
      category: 'SC',
      family_income_annual: 60000,
      state: 'Bihar',
      prior_default: true
    };

    const result = checkEligibility(applicant);

    assert.equal(result.status, 'fail');
    assert.ok(result.unmet_criteria.includes('prior_default'));
  });

  it('should FAIL when state domicile does not match the active SCA requirement', () => {
    const applicant = {
      category: 'SC',
      family_income_annual: 60000,
      state: 'Uttar Pradesh',
      prior_default: false
    };

    const result = checkEligibility(applicant);

    assert.equal(result.status, 'fail');
    assert.ok(result.unmet_criteria.includes('state'));
  });

  it('should PASS for valid NBCFDC (OBC) and NSTFDC (ST) applicants', () => {
    const obcApplicant = {
      category: 'OBC',
      family_income_annual: 80000,
      state: 'Bihar',
      prior_default: false
    };
    const obcResult = checkEligibility(obcApplicant);
    assert.equal(obcResult.status, 'pass');
    assert.equal(obcResult.corporation, 'NBCFDC');

    const stApplicant = {
      category: 'ST',
      family_income_annual: 70000,
      state: 'Bihar',
      prior_default: false
    };
    const stResult = checkEligibility(stApplicant);
    assert.equal(stResult.status, 'pass');
    assert.equal(stResult.corporation, 'NSTFDC');
  });
});
