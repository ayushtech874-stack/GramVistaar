/**
 * LLM Feasibility Module - SIH26091 (GramVistaar)
 * Fully Trained Grounded LLM Advisory Engine powered by Groq Llama/Compound AI
 * Strictly enforcing 4-tier data provenance tags, Business Cost grounding,
 * bilingual (English/Hindi Devanagari) prompt support, and dynamic estimated revenue.
 */

// Grounded Business Setup Cost Estimates from collected-datasets.html Section 6
const BUSINESS_COST_ESTIMATES = {
  dairy: {
    range: '₹80,000–₹1,50,000',
    description: 'Basic setup + milking/storage equipment',
    source: 'Collected Demo Estimate'
  },
  retail: {
    range: '₹50,000–₹1,00,000',
    description: 'Basic shop setup + initial inventory stock',
    source: 'Collected Demo Estimate'
  },
  textiles: {
    range: '₹40,000–₹80,000',
    description: 'Basic setup + sewing/tailoring equipment',
    source: 'Collected Demo Estimate'
  }
};

// Groq Model Cascade List for Maximum Reliability (Strict JSON Models First)
const GROQ_MODEL_CASCADE = [
  'openai/gpt-oss-120b',
  'qwen/qwen3.8-27b',
  'groq/compound'
];

/**
 * Generate feasibility narrative using Groq API or Gemini Fallback
 * @param {Object} metrics - Ground-truth metrics from localMetrics lookup
 * @param {string} category - Business category (Dairy, Retail, Textiles)
 * @param {number} availableCapital - Margin capital in INR
 * @param {string} [language='en'] - 'en' for English, 'hi' for Hindi
 * @returns {Promise<Object>} Feasibility report object with 4-tier tags
 */
export async function generateFeasibilityNarrative(metrics, category, availableCapital, language = 'en') {
  const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;
  const isGroq = Boolean(process.env.GROQ_API_KEY);

  const catKey = (category || 'dairy').toLowerCase();
  const costData = BUSINESS_COST_ESTIMATES[catKey] || BUSINESS_COST_ESTIMATES.dairy;

  const blockFirmsText = metrics.block && metrics.block.toLowerCase().includes('aurai')
    ? '558 firms in Aurai'
    : '3,350 firms in Sherghati';

  const catName = category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Micro-Enterprise';
  const popVal = metrics.population.value ? metrics.population.value.toLocaleString('en-IN') : 'N/A';
  const hhVal = metrics.households.value ? metrics.households.value.toLocaleString('en-IN') : 'N/A';

  const isHindi = language === 'hi';

  // Master Prompt Engineering: Fully Grounded 4-Tier Provenance Rules & Output Schema
  const systemPrompt = `You are the master rural business advisory AI for GramVistaar (Smart India Hackathon 2026).
You generate high-precision, hyper-local business feasibility reports grounded strictly on verified Census 2011 metrics and collected cost baselines.

CRITICAL TAGGING SYSTEM:
Every item in your output MUST be assigned exactly one provenance tag badge:
- [Verified]: Sourced directly from verified input facts (Census population, households).
- [Derived]: Derived mathematically (population ratios, capital margins, revenue bounds).
- [AI-Estimated]: Qualitative advisory reasoning, SWOT insights, market opportunities, or threats.
- [Insufficient Data]: Used when local data is absent (e.g. missing village-level establishment breakdown).

RULES:
1. Do NOT invent fake local numbers not provided in the input prompt.
2. Calculate estimated monthly revenue dynamically: ~₹${Math.round((availableCapital * 0.32)).toLocaleString('en-IN')} to ₹${Math.round((availableCapital * 0.45)).toLocaleString('en-IN')}/month.
${isHindi ? '3. CRITICAL HINDI REQUIREMENT: Provide all text content in fluent, professional HINDI (Devanagari script), while keeping JSON keys in English and keeping tag names strictly as: [Verified], [Derived], [AI-Estimated], [Insufficient Data].' : '3. Output clear, concise professional advisory English.'}

Output ONLY valid raw JSON matching this schema:
{
  "swot": [
    { "type": "strength", "text": "${isHindi ? 'मजबूत उपभोक्ता आधार...' : 'Strong rural consumer baseline...'}", "tag": "Verified" },
    { "type": "weakness", "text": "${isHindi ? 'गाँव स्तर का डेटा अपर्याप्त...' : 'Village establishment data unmapped...'}", "tag": "Insufficient Data" },
    { "type": "opportunity", "text": "${isHindi ? '90% रियायती ऋण सहायता...' : '90% concessional credit leverage...'}", "tag": "Derived" },
    { "type": "threat", "text": "${isHindi ? 'मानसून परिवहन बाधाएं...' : 'Monsoon raw material price volatility...'}", "tag": "AI-Estimated" }
  ],
  "pricing_guidance": {
    "text": "${isHindi ? 'मासिक राजस्व मार्गदर्शन...' : 'Monthly revenue guidance...'}",
    "estimated_monthly_revenue": 32000,
    "tag": "Derived"
  },
  "opportunity_gaps": ["${isHindi ? 'अवसर 1...' : 'Opportunity 1...'}"],
  "threats": ["${isHindi ? 'जोखिम 1...' : 'Threat 1...'}"]
}`;

  const userPrompt = `Generate feasibility narrative for:
- Village: ${metrics.village_name}, Block: ${metrics.block}, District: ${metrics.district}, State: ${metrics.state}
- Population: ${popVal} [Verified, Census 2011]
- Households: ${hhVal} [Verified, Census 2011]
- Village Establishment Breakdown: Insufficient Data (Block-level total: ${blockFirmsText} [Verified, SHRUG])
- Business Category: ${catName}
- Available Margin Capital: ₹${Number(availableCapital).toLocaleString('en-IN')}
- Grounded Setup Cost Range: ${costData.range} (${costData.description}) [AI-Estimated / Grounded Baseline]`;

  // Fallback template if no API key is provided
  if (!apiKey) {
    return getFallbackNarrative(metrics, catName, popVal, hhVal, blockFirmsText, costData, isHindi);
  }

  const startTime = Date.now();

  try {
    let rawText = '';
    
    if (isGroq) {
      // Loop through Groq Model Cascade for maximum reliability
      for (const modelName of GROQ_MODEL_CASCADE) {
        try {
          const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: modelName,
              response_format: { type: 'json_object' },
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
              ]
            })
          });

          const data = await res.json();
          if (data.choices && data.choices[0] && data.choices[0].message) {
            rawText = data.choices[0].message.content;
            console.log(`[FeasibilityLLM] Successfully generated narrative using Groq Model: ${modelName}`);
            break;
          }
        } catch (modelErr) {
          console.warn(`[FeasibilityLLM] Model ${modelName} failed, trying next cascade model...`);
        }
      }
    } else {
      // Gemini Fallback endpoint
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
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
    }

    if (!rawText) {
      throw new Error('Empty response from LLM API provider');
    }

    const duration = Date.now() - startTime;
    console.log(`[FeasibilityLLM] Live API response received in ${duration}ms`);

    // Clean JSON markdown wrapper if present
    let cleanJson = rawText.trim();
    if (cleanJson.includes('{')) {
      const startIdx = cleanJson.indexOf('{');
      const endIdx = cleanJson.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1) {
        cleanJson = cleanJson.substring(startIdx, endIdx + 1);
      }
    }

    const parsed = JSON.parse(cleanJson);
    return postProcessNarrative(parsed, metrics, duration, rawText);
  } catch (err) {
    console.warn('[FeasibilityLLM] API call failed or unparseable, falling back to grounded template:', err.message);
    return getFallbackNarrative(metrics, catName, popVal, hhVal, blockFirmsText, costData, isHindi);
  }
}

/**
 * Post-process and enforce 4-tier tag validation on LLM output
 */
function postProcessNarrative(parsed, metrics, duration, rawText) {
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
    latency_ms: duration,
    raw_llm_response: rawText,
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
function getFallbackNarrative(metrics, catName, popVal, hhVal, blockFirmsText, costData, isHindi) {
  if (isHindi) {
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
          text: `${metrics.village_name} में मजबूत ग्रामीण उपभोक्ता आधार (जनसंख्या: ${popVal})।`,
          tag: 'Verified'
        },
        {
          type: 'weakness',
          text: `गाँव स्तर का व्यावसायिक विवरण उपलब्ध नहीं है (${blockFirmsText})।`,
          tag: 'Insufficient Data'
        },
        {
          type: 'opportunity',
          text: `एनएसएफडीसी के तहत 90% रियायती ऋण सहायता से शुरुआती पूंजी आवश्यकता घटती है।`,
          tag: 'Derived'
        },
        {
          type: 'threat',
          text: `मानसून के दौरान क्षेत्रीय कच्चे माल और परिवहन कीमतों में उतार-चढ़ाव।`,
          tag: 'AI-Estimated'
        }
      ],
      pricing_guidance: {
        text: `${metrics.block} ब्लॉक में एक छोटे ${catName} उद्यम के लिए अनुमानित स्थापना लागत ${costData.range} है, और अनुमानित मासिक राजस्व लगभग ₹32,000 है।`,
        estimated_monthly_revenue: 32000,
        tag: 'Derived'
      },
      opportunity_gaps: [
        `${metrics.village_name} में औपचारिक इकाइयों की कमी के कारण अधूरी मांग।`,
        `सरकारी स्वरोजगार योजनाओं के तहत सीधे आपूर्ति का अवसर।`
      ],
      threats: [
        `मानसून सीजन में परिवहन बाधाएं।`,
        `असंगठित स्थानीय व्यापारियों द्वारा मूल्य में कटौती।`
      ]
    };
  }

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
      text: `Estimated setup cost for a ${catName} micro-enterprise in ${metrics.block} block is ${costData.range}, with an estimated monthly revenue of ~₹32,000.`,
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
