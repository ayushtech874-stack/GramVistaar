/**
 * LLM Feasibility Module - SIH26091 (GramVistaar)
 * Grounded 1-shot LLM call (Gemini 2.5 Flash / Groq Llama 3.3 70B fallback)
 * strictly enforcing 4-tier data provenance tags and extracting dynamic estimated monthly revenue.
 */

/**
 * Generate feasibility narrative using Gemini API or Groq Fallback
 * @param {Object} metrics - Ground-truth metrics from localMetrics lookup
 * @param {string} category - Business category (Dairy, Retail, Textiles)
 * @param {number} availableCapital - Margin capital in INR
 * @returns {Promise<Object>} Feasibility report object with 4-tier tags
 */
export async function generateFeasibilityNarrative(metrics, category, availableCapital) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY;
  const isGemini = Boolean(process.env.GEMINI_API_KEY);

  const blockFirmsText = metrics.block && metrics.block.toLowerCase().includes('aurai')
    ? '558 firms in Aurai'
    : '3,350 firms in Sherghati';

  const catName = category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Micro-Enterprise';
  const popVal = metrics.population.value ? metrics.population.value.toLocaleString('en-IN') : 'N/A';
  const hhVal = metrics.households.value ? metrics.households.value.toLocaleString('en-IN') : 'N/A';

  // Construct strict 1-shot prompt grounded on real ground-truth numbers
  const systemPrompt = `You are a professional rural business advisory AI for Smart India Hackathon.
You generate structured business feasibility reports grounded ONLY on verified local metrics.

STRICT TAGGING RULES:
1. Every sentence or claim MUST end with exactly one tag badge: [Verified], [Derived], [AI-Estimated], or [Insufficient Data].
2. [Verified]: Used ONLY for facts given directly in input (e.g., Census population, households).
3. [Derived]: Used ONLY for mathematical deductions (e.g., population ratios, capital margin).
4. [AI-Estimated]: Used for qualitative business reasoning, SWOT, or threats.
5. [Insufficient Data]: Used for missing local data (e.g., village-level establishment counts).
6. Never invent a fake local number not given to you.

Output JSON format strictly:
{
  "swot": [
    { "type": "strength", "text": "...", "tag": "AI-Estimated" },
    { "type": "weakness", "text": "...", "tag": "AI-Estimated" },
    { "type": "opportunity", "text": "...", "tag": "Derived" },
    { "type": "threat", "text": "...", "tag": "AI-Estimated" }
  ],
  "pricing_guidance": {
    "text": "...",
    "estimated_monthly_revenue": 32000,
    "tag": "Derived"
  },
  "opportunity_gaps": ["...", "..."],
  "threats": ["...", "..."]
}`;

  const userPrompt = `Generate feasibility narrative for:
- Village: ${metrics.village_name}, Block: ${metrics.block}, District: ${metrics.district}, State: ${metrics.state}
- Population: ${popVal} [Verified, Census 2011]
- Households: ${hhVal} [Verified, Census 2011]
- Village Establishment Breakdown: Insufficient Data (Block-level total: ${blockFirmsText} [Verified, SHRUG])
- Business Category: ${catName}
- Available Margin Capital: ₹${Number(availableCapital).toLocaleString('en-IN')}`;

  // Fallback template if no API key is provided
  if (!apiKey) {
    return getFallbackNarrative(metrics, catName, popVal, hhVal, blockFirmsText);
  }

  try {
    let rawText = '';
    if (isGemini) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });
      const data = await res.json();
      rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else {
      // Groq OpenAI-compatible fallback
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ]
        })
      });
      const data = await res.json();
      rawText = data.choices?.[0]?.message?.content || '';
    }

    const parsed = JSON.parse(rawText);
    return postProcessNarrative(parsed, metrics);
  } catch (err) {
    console.warn('[FeasibilityLLM] API call failed or unparseable, falling back to grounded template:', err.message);
    return getFallbackNarrative(metrics, catName, popVal, hhVal, blockFirmsText);
  }
}

/**
 * Post-process and enforce 4-tier tag validation on LLM output
 */
function postProcessNarrative(parsed, metrics) {
  const validTags = ['Verified', 'Derived', 'AI-Estimated', 'Insufficient Data'];

  const swot = (parsed.swot || []).map(item => ({
    type: item.type || 'insight',
    text: item.text || '',
    tag: validTags.includes(item.tag) ? item.tag : 'AI-Estimated'
  }));

  const pricingText = parsed.pricing_guidance?.text || '';
  const revenue = Number(parsed.pricing_guidance?.estimated_monthly_revenue) || 32000;
  const pricingTag = validTags.includes(parsed.pricing_guidance?.tag) ? parsed.pricing_guidance.tag : 'Derived';

  return {
    village_name: metrics.village_name,
    block: metrics.block,
    district: metrics.district,
    state: metrics.state,
    market_reach: metrics.market_reach,
    households: metrics.households,
    competitor_density: metrics.establishments,
    is_live_llm: true,
    swot,
    pricing_guidance: {
      text: pricingText,
      estimated_monthly_revenue: revenue,
      tag: pricingTag
    },
    opportunity_gaps: parsed.opportunity_gaps || [],
    threats: parsed.threats || []
  };
}

/**
 * Grounded fallback template when LLM API key is absent
 */
function getFallbackNarrative(metrics, catName, popVal, hhVal, blockFirmsText) {
  return {
    village_name: metrics.village_name,
    block: metrics.block,
    district: metrics.district,
    state: metrics.state,
    market_reach: metrics.market_reach,
    households: metrics.households,
    competitor_density: metrics.establishments,
    is_live_llm: false,
    swot: [
      {
        type: 'strength',
        text: `Strong rural consumer baseline in ${metrics.village_name} (Population: ${popVal}).`,
        tag: 'Verified'
      },
      {
        type: 'weakness',
        text: `No village-level establishment breakdown available (${blockFirmsText}).`,
        tag: 'Insufficient Data'
      },
      {
        type: 'opportunity',
        text: `90% concessional financing under NSFDC reduces initial capital requirement.`,
        tag: 'Derived'
      },
      {
        type: 'threat',
        text: `Regional raw material and transport price fluctuations during monsoon.`,
        tag: 'AI-Estimated'
      }
    ],
    pricing_guidance: {
      text: `Estimated monthly revenue for a small-scale ${catName} micro-enterprise in ${metrics.block} block is ~₹32,000 based on regional demand.`,
      estimated_monthly_revenue: 32000,
      tag: 'Derived'
    },
    opportunity_gaps: [
      `Under-served demand in ${metrics.village_name} due to lack of formalized units.`,
      `Direct supply linkage under government self-employment schemes.`
    ],
    threats: [
      `Monsoon season transport bottlenecks.`,
      `Unorganized local trader price undercutting.`
    ]
  };
}
