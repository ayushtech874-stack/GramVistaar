import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/server.js';

describe('API Integration Endpoints Tests', () => {
  let server;
  let baseUrl;

  before(async () => {
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise((resolve) => {
      if (server) {
        server.close(resolve);
      } else {
        resolve();
      }
    });
  });

  it('GET /api/villages should return list of pre-loaded 202 villages', async () => {
    const res = await fetch(`${baseUrl}/api/villages`);
    const data = await res.json();

    assert.equal(res.status, 200);
    assert.equal(data.district, 'Muzaffarpur & Gaya');
    assert.ok(Array.isArray(data.villages));
    assert.equal(data.villages.length, 202);
  });

  it('POST /api/eligibility should return pass for Rekha SC persona', async () => {
    const res = await fetch(`${baseUrl}/api/eligibility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: 'SC',
        family_income_annual: 60000,
        state: 'Bihar',
        prior_default: false
      })
    });
    const data = await res.json();

    assert.equal(res.status, 200);
    assert.equal(data.status, 'pass');
    assert.equal(data.corporation, 'NSFDC');
  });

  it('POST /api/calculate should return financial plan for ₹1,00,000 capital', async () => {
    const res = await fetch(`${baseUrl}/api/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        available_capital: 100000,
        corporation: 'NSFDC'
      })
    });
    const data = await res.json();

    assert.equal(res.status, 200);
    assert.equal(data.project_cost, 1000000);
    assert.equal(data.loan_eligibility, 900000);
    assert.equal(data.interest_rate, 0.08);
  });

  it('POST /api/assess should return complete assessment with Affordability Risk Flag when eligibility passes', async () => {
    const res = await fetch(`${baseUrl}/api/assess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: 'SC',
        family_income_annual: 60000,
        state: 'Bihar',
        prior_default: false,
        available_capital: 100000,
        village_id: '229088',
        business_category: 'dairy'
      })
    });
    const data = await res.json();

    assert.equal(res.status, 200);
    assert.equal(data.eligibility.status, 'pass');
    assert.equal(data.financial.loan_eligibility, 900000);
    assert.ok(data.financial.affordability_flag);
    assert.equal(data.feasibility.village_name, 'Saghari');
  });

  it('POST /api/assess should return feasibility-only response when eligibility fails (decisions.md D4 / app-flow.md Screen 4b)', async () => {
    const res = await fetch(`${baseUrl}/api/assess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: 'SC',
        family_income_annual: 400000, // exceeds 3L ceiling
        state: 'Bihar',
        prior_default: false,
        available_capital: 100000,
        village_id: '229088',
        business_category: 'dairy'
      })
    });
    const data = await res.json();

    assert.equal(res.status, 200);
    assert.equal(data.eligibility.status, 'fail');
    assert.ok(data.eligibility.unmet_criteria.includes('family_income_annual'));
    assert.equal(data.financial, null); // Financial Card skipped
    assert.ok(data.feasibility); // Feasibility Card rendered!
    assert.equal(data.feasibility.village_name, 'Saghari');
  });
});
