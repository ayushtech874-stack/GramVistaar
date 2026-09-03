import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { lookupLocalMetrics, loadVillageMetrics, verifyMassConservation, verifyCategorySum } from '../src/modules/localMetrics.js';

describe('Local-Metrics Module Tests (Deterministic & Rule R2 Compliant)', () => {
  it('should return Verified population, Verified households, and Derived x Assumption tag for category-specific lookup', () => {
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

    // Establishments Derived x Assumption
    assert.equal(result.establishments.tag, 'Derived × Assumption');
    assert.ok(String(result.establishments.value).includes('est. Dairy units'));
    assert.ok(String(result.establishments.value).includes('–'), 'Establishment value should be a range (e.g. 10-15)');
    assert.ok(result.establishments.source.includes('Assumed 30%'));
  });

  it('should return Derived tag when requesting total firms without category split', () => {
    const dataset = loadVillageMetrics();
    const saghari = dataset.find(v => v.village_name.toLowerCase().includes('saghari'));
    assert.ok(saghari);

    const result = lookupLocalMetrics(saghari.village_id, null, dataset);

    assert.equal(result.establishments.tag, 'Derived');
    assert.ok(String(result.establishments.value).includes('est. firms'));
    assert.ok(result.establishments.source.includes('Population- and infrastructure-weighted share'));
  });

  it('should PASS Category Sum Sanity Check for sample villages (Retail 50% + Dairy 30% + Textiles 20% = 100%)', () => {
    const dataset = loadVillageMetrics();
    const ratwara = dataset.find(v => v.village_name.toLowerCase().includes('ratwara'));
    assert.ok(ratwara);

    const sanity = verifyCategorySum(ratwara.village_id, dataset);
    assert.ok(sanity.is_valid_sum);
    assert.ok(sanity.retail_est.includes('Retail units'));
    assert.ok(sanity.dairy_est.includes('Dairy units'));
    assert.ok(sanity.textiles_est.includes('Textiles units'));
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
