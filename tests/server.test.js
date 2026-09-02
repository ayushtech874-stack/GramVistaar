process.env.NODE_ENV = 'test';

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/server.js';

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
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

describe('API Integration Endpoints Tests', () => {
  it('GET /api/villages should return list of pre-loaded villages', async () => {
    const res = await fetch(`${baseUrl}/api/villages`);
    const data = await res.json();

    assert.equal(res.status, 200);
    assert.equal(data.district, 'Muzaffarpur & Gaya');
    assert.ok(Array.isArray(data.villages));
    assert.equal(data.villages.length, 2);
    assert.equal(data.villages[0].village_name, 'Saghari Rampur');
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
    assert.equal(data.scheme_name, 'Term Loan Scheme');
    assert.equal(data.interest_rate, 0.08);
  });

  it('POST /api/assess should return complete assessment with Affordability Risk Flag', async () => {
    const res = await fetch(`${baseUrl}/api/assess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: 'SC',
        family_income_annual: 60000,
        state: 'Bihar',
        prior_default: false,
        available_capital: 100000,
        village_id: '123456',
        business_category: 'dairy'
      })
    });
    const data = await res.json();

    assert.equal(res.status, 200);
    assert.equal(data.eligibility.status, 'pass');
    assert.equal(data.financial.loan_eligibility, 900000);
    assert.ok(data.financial.affordability_flag);
    assert.equal(data.feasibility.village_name, 'Saghari Rampur');
  });
});
