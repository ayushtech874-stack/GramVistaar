import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { lookupLocalMetrics, loadVillageMetrics, verifyMassConservation } from '../src/modules/localMetrics.js';

describe('Local-Metrics Module Tests (Deterministic & Rule R2 Compliant)', () => {
  it('should return Verified population, Verified households, and Derived weighted range for Saghari', () => {
    const dataset = loadVillageMetrics();
    const saghari = dataset.find(v => v.village_name.toLowerCase().includes('saghari'));
    assert.ok(saghari, 'Saghari village should be in dataset');

    const result = lookupLocalMetrics(saghari.village_id, 'dairy', dataset);

    assert.equal(result.village_id, saghari.village_id);
    assert.ok(result.village_name.includes('Saghari'));

    // Population Verified
    assert.ok(result.population.value > 0);
    assert.equal(result.population.tag, 'Verified');

    // Households Verified
    assert.ok(result.households.value > 0);
    assert.equal(result.households.tag, 'Verified');

    // Establishments Derived via weighted model with sensitivity range
    assert.equal(result.establishments.tag, 'Derived');
    assert.ok(String(result.establishments.value).includes('est. Dairy units'));
    assert.ok(String(result.establishments.value).includes('–'), 'Establishment value should be a range (e.g. 10-15)');
    assert.ok(result.establishments.source.includes('Population- and infrastructure-weighted share'));
  });

  it('should return Verified population, Verified households, and Derived weighted range for Khandail', () => {
    const dataset = loadVillageMetrics();
    const khandail = dataset.find(v => v.village_name.toLowerCase().includes('khandail'));
    assert.ok(khandail, 'Khandail village should be in dataset');

    const result = lookupLocalMetrics(khandail.village_id, 'retail', dataset);

    assert.equal(result.village_id, khandail.village_id);
    assert.ok(result.village_name.includes('Khandail'));

    assert.ok(result.population.value > 0);
    assert.equal(result.population.tag, 'Verified');

    assert.ok(result.households.value > 0);
    assert.equal(result.households.tag, 'Verified');

    assert.equal(result.establishments.tag, 'Derived');
    assert.ok(String(result.establishments.value).includes('est. Retail units'));
    assert.ok(String(result.establishments.value).includes('–'));
  });

  it('should PASS Mass-Conservation test for Aurai block (sum of village estimates equals 558 total firms)', () => {
    const audit = verifyMassConservation('aurai');
    assert.equal(audit.block_name, 'Aurai');
    assert.equal(audit.target_block_firms, 558);
    assert.ok(audit.is_conserved, `Mass should be conserved within rounding tolerance. Got sum: ${audit.sum_disaggregated_firms}, target: 558, diff: ${audit.difference}`);
  });

  it('should PASS Mass-Conservation test for Sherghati block (sum of village estimates equals 3350 total firms)', () => {
    const audit = verifyMassConservation('sherghati');
    assert.equal(audit.block_name, 'Sherghati');
    assert.equal(audit.target_block_firms, 3350);
    assert.ok(audit.is_conserved, `Mass should be conserved within rounding tolerance. Got sum: ${audit.sum_disaggregated_firms}, target: 3350, diff: ${audit.difference}`);
  });

  it('should return VILLAGE_NOT_FOUND error for invalid village_id', () => {
    const result = lookupLocalMetrics('999999999', 'dairy');

    assert.equal(result.error, true);
    assert.equal(result.code, 'VILLAGE_NOT_FOUND');
  });
});
