import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { lookupLocalMetrics } from '../src/modules/localMetrics.js';

describe('Local-Metrics Module Tests (Deterministic & Rule R2 Compliant)', () => {
  it('should return Verified population and Verified households for Saghari', () => {
    const result = lookupLocalMetrics('229088', 'dairy');

    assert.equal(result.village_name, 'Saghari');
    assert.equal(result.block, 'Aurai');

    // Population Verified
    assert.equal(result.population.value, 3026);
    assert.equal(result.population.tag, 'Verified');

    // Households Verified (Real extracted value: 585)
    assert.equal(result.households.value, 585);
    assert.equal(result.households.tag, 'Verified');

    // Establishments null -> Insufficient Data (rules.md R2 enforced)
    assert.equal(result.establishments.value, null);
    assert.equal(result.establishments.tag, 'Insufficient Data');

    // Market reach Derived from population
    assert.equal(result.market_reach.value, 3026);
    assert.equal(result.market_reach.tag, 'Derived');
  });

  it('should return Verified population and Verified households for Khandail', () => {
    const result = lookupLocalMetrics('256296', 'retail');

    assert.equal(result.village_name, 'Khandail');
    assert.equal(result.block, 'Sherghati');

    assert.equal(result.population.value, 3040);
    assert.equal(result.population.tag, 'Verified');

    assert.equal(result.households.value, 484);
    assert.equal(result.households.tag, 'Verified');

    assert.equal(result.establishments.value, null);
    assert.equal(result.establishments.tag, 'Insufficient Data');
  });

  it('should return VILLAGE_NOT_FOUND error for invalid village_id', () => {
    const result = lookupLocalMetrics('999999', 'dairy');

    assert.equal(result.error, true);
    assert.equal(result.code, 'VILLAGE_NOT_FOUND');
  });
});
