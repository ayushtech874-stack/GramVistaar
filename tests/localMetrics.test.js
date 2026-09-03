import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { lookupLocalMetrics, loadVillageMetrics } from '../src/modules/localMetrics.js';

describe('Local-Metrics Module Tests (Deterministic & Rule R2 Compliant)', () => {
  it('should return Verified population, Verified households, and Derived population-weighted establishment estimate for Saghari', () => {
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

    // Establishments Derived via population weighting
    assert.equal(result.establishments.tag, 'Derived');
    assert.ok(String(result.establishments.value).includes('est. firms'));
  });

  it('should return Verified population, Verified households, and Derived establishment estimate for Khandail', () => {
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
    assert.ok(String(result.establishments.value).includes('est. firms'));
  });

  it('should return VILLAGE_NOT_FOUND error for invalid village_id', () => {
    const result = lookupLocalMetrics('999999999', 'dairy');

    assert.equal(result.error, true);
    assert.equal(result.code, 'VILLAGE_NOT_FOUND');
  });
});
