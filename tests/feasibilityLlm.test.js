import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateFeasibilityNarrative } from '../src/modules/feasibilityLlm.js';

describe('LLM Feasibility Module Tests (Phase 8)', () => {
  it('should generate grounded narrative structure with 4-tier tags for Ratwara', async () => {
    const mockMetrics = {
      village_id: '229072',
      village_name: 'Ratwara Bindwara Deoria',
      block: 'Aurai',
      district: 'Muzaffarpur',
      state: 'Bihar',
      population: { value: 22386, tag: 'Verified', source: 'Census 2011' },
      households: { value: 4633, tag: 'Verified', source: 'Census 2011' },
      establishments: { value: null, tag: 'Insufficient Data', reason: 'No village-level breakdown' },
      market_reach: { value: 22386, tag: 'Derived', source: 'Single-village baseline' }
    };

    const result = await generateFeasibilityNarrative(mockMetrics, 'dairy', 100000);

    assert.equal(result.village_name, 'Ratwara Bindwara Deoria');
    assert.equal(result.block, 'Aurai');
    assert.ok(Array.isArray(result.swot));
    assert.ok(result.swot.length >= 4);

    // Verify every SWOT item carries a valid 4-tier tag
    const validTags = ['Verified', 'Derived', 'AI-Estimated', 'Insufficient Data'];
    result.swot.forEach(item => {
      assert.ok(validTags.includes(item.tag), `Invalid tag: ${item.tag}`);
    });

    // Pricing guidance contains revenue
    assert.ok(result.pricing_guidance);
    assert.ok(typeof result.pricing_guidance.estimated_monthly_revenue === 'number');
    assert.ok(validTags.includes(result.pricing_guidance.tag));
  });
});
