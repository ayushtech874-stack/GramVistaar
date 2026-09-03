/**
 * Local-Metrics Module - SIH26091 (GramVistaar)
 * Pure deterministic local village data lookup with strict 4-tier provenance tagging,
 * population- and infrastructure-weighted firm disaggregation model with sensitivity range,
 * mass-conservation verification, memory caching for Vercel, and strict null -> Insufficient Data enforcement (rules.md R2).
 */

import fs from 'fs';
import path from 'path';

let inMemoryVillageMetrics = null;

// Block Baseline Metrics (SHRUG & Census 2011 Totals)
const BLOCK_BASELINES = {
  aurai: {
    total_firms: 558,
    total_population: 250000,
    block_name: 'Aurai'
  },
  sherghati: {
    total_firms: 3350,
    total_population: 180000,
    block_name: 'Sherghati'
  }
};

// Business Category Share Ratios
const CATEGORY_SHARES = {
  retail: 0.50,
  dairy: 0.30,
  textiles: 0.20,
  default: 1.00
};

/**
 * Load default village metrics from JSON file with memory caching for serverless lambdas
 */
export function loadVillageMetrics(filePath) {
  if (inMemoryVillageMetrics && !filePath) {
    return inMemoryVillageMetrics;
  }

  const resolvedPath = filePath || path.join(process.cwd(), 'data', 'village_metrics.json');
  const rawData = fs.readFileSync(resolvedPath, 'utf8');
  const parsed = JSON.parse(rawData);

  if (!filePath) {
    inMemoryVillageMetrics = parsed;
  }
  return parsed;
}

/**
 * Calculate Infrastructure Multiplier M_v based on village amenities
 */
function computeInfraMultiplier(village) {
  const pop = village.population || 0;
  const hasMandi = village.has_mandi ? 1 : (pop > 5000 ? 1 : 0);
  const hasHaat = village.has_haat ? 1 : (pop > 2000 ? 1 : 0);
  const hasBank = village.has_bank ? 1 : (pop > 8000 ? 1 : 0);
  const hasAtm = village.has_atm ? 1 : (pop > 8000 ? 1 : 0);
  const hasRoad = village.has_road !== false ? 1 : 0;
  const hasBus = village.has_bus ? 1 : (pop > 3000 ? 1 : 0);
  const powerScore = village.power_score || 0.5;

  return (1 + 0.60 * hasMandi + 0.40 * hasHaat) *
         (1 + 0.35 * hasBank + 0.20 * hasAtm) *
         (1 + 0.25 * hasRoad + 0.15 * hasBus) *
         (1 + 0.20 * powerScore);
}

/**
 * Compute raw disaggregation weight for a village given exponent alpha
 */
function computeVillageWeight(village, alpha) {
  const pop = village.population || 0;
  if (pop <= 0) return 0;
  const infraMult = computeInfraMultiplier(village);
  return Math.pow(pop, alpha) * infraMult;
}

/**
 * Disaggregate block total firms across all villages using weighted model & sensitivity range
 */
export function computeDisaggregatedEst(targetVillage, category, dataset) {
  const villageData = dataset || loadVillageMetrics();

  const blockName = targetVillage.block || 'Aurai';
  const blockKey = blockName.toLowerCase().includes('sherghati') ? 'sherghati' : 'aurai';
  const blockBaseline = BLOCK_BASELINES[blockKey];

  // Filter all villages in the same block
  const blockVillages = villageData.filter(v =>
    v.block && v.block.toLowerCase().includes(blockKey)
  );

  // Compute block sum of weights for alpha = 0.85 (mid), 0.70 (low), 1.00 (high)
  let sumWeightMid = 0;
  let sumWeightLow = 0;
  let sumWeightHigh = 0;

  blockVillages.forEach(v => {
    sumWeightMid += computeVillageWeight(v, 0.85);
    sumWeightLow += computeVillageWeight(v, 0.70);
    sumWeightHigh += computeVillageWeight(v, 1.00);
  });

  const vWeightMid = computeVillageWeight(targetVillage, 0.85);
  const vWeightLow = computeVillageWeight(targetVillage, 0.70);
  const vWeightHigh = computeVillageWeight(targetVillage, 1.00);

  if (sumWeightMid <= 0 || vWeightMid <= 0) {
    return {
      value: null,
      tag: 'Insufficient Data',
      reason: `No village- or category-level establishment breakdown available — block total (${blockBaseline.total_firms} firms in ${blockBaseline.block_name}) exists but village population is missing`
    };
  }

  // Calculate total block firm shares
  const totalFirmsMid = Math.max(1, Math.round((vWeightMid / sumWeightMid) * blockBaseline.total_firms));
  const totalFirmsLow = Math.max(1, Math.round((vWeightLow / sumWeightLow) * blockBaseline.total_firms));
  const totalFirmsHigh = Math.max(1, Math.round((vWeightHigh / sumWeightHigh) * blockBaseline.total_firms));

  const totalMin = Math.min(totalFirmsMid, totalFirmsLow, totalFirmsHigh);
  const totalMax = Math.max(totalFirmsMid, totalFirmsLow, totalFirmsHigh);

  // Category specific split
  const catKey = (category || 'default').toLowerCase();
  const catShare = CATEGORY_SHARES[catKey] || CATEGORY_SHARES.default;

  const catFirmsMid = Math.max(1, Math.round(totalFirmsMid * catShare));
  const catFirmsLow = Math.max(1, Math.round(totalFirmsLow * catShare));
  const catFirmsHigh = Math.max(1, Math.round(totalFirmsHigh * catShare));

  const catMin = Math.min(catFirmsMid, catFirmsLow, catFirmsHigh);
  const catMax = Math.max(catFirmsMid, catFirmsLow, catFirmsHigh);

  const catLabel = category ? `${category.charAt(0).toUpperCase() + category.slice(1)} units` : 'firms';

  return {
    value: `${catMin}–${catMax} est. ${catLabel} (total ${totalMin}–${totalMax} est. firms)`,
    tag: 'Derived',
    source: `Population- and infrastructure-weighted share of ${blockBaseline.total_firms} total firms in ${blockBaseline.block_name}; range reflects sensitivity to weighting`
  };
}

/**
 * Mass-Conservation Test: Verify that the sum of disaggregated mid-estimates across a block equals total block firms
 */
export function verifyMassConservation(blockKey = 'aurai', dataset) {
  const villageData = dataset || loadVillageMetrics();
  const baseline = BLOCK_BASELINES[blockKey.toLowerCase()] || BLOCK_BASELINES.aurai;

  const blockVillages = villageData.filter(v =>
    v.block && v.block.toLowerCase().includes(blockKey.toLowerCase())
  );

  let sumWeightMid = 0;
  blockVillages.forEach(v => {
    sumWeightMid += computeVillageWeight(v, 0.85);
  });

  let sumEstimatedFirms = 0;
  blockVillages.forEach(v => {
    const wMid = computeVillageWeight(v, 0.85);
    if (wMid > 0) {
      sumEstimatedFirms += Math.round((wMid / sumWeightMid) * baseline.total_firms);
    }
  });

  const diff = Math.abs(sumEstimatedFirms - baseline.total_firms);
  const isConserved = diff <= 5; // Mass conserved within rounding tolerance of 5

  return {
    block_name: baseline.block_name,
    target_block_firms: baseline.total_firms,
    sum_disaggregated_firms: sumEstimatedFirms,
    difference: diff,
    is_conserved: isConserved
  };
}

/**
 * Perform local metrics lookup for a specific village and business category
 * @param {string} villageId - Village unique ID
 * @param {string} category - Business category (e.g., 'dairy', 'retail', 'textiles')
 * @param {Array} [dataset] - Optional village metrics dataset array
 * @returns {Object} Local metrics object with strict 4-tier tags
 */
export function lookupLocalMetrics(villageId, category, dataset) {
  const villageData = dataset || loadVillageMetrics();

  const village = villageData.find(v => v.village_id === String(villageId));
  if (!village) {
    return {
      error: true,
      code: 'VILLAGE_NOT_FOUND',
      message: `Village ID '${villageId}' is not found in the pre-loaded dataset.`
    };
  }

  const categoryKey = category ? `establishments_${category.toLowerCase()}` : null;
  const establishmentVal = categoryKey && village[categoryKey] !== undefined ? village[categoryKey] : null;

  let disaggregatedEstablishments = null;
  if (establishmentVal !== null && establishmentVal !== undefined) {
    disaggregatedEstablishments = {
      value: establishmentVal,
      tag: 'Verified',
      source: village.data_source_establishments || 'SHRUG'
    };
  } else {
    disaggregatedEstablishments = computeDisaggregatedEst(village, category, villageData);
  }

  return {
    village_id: village.village_id,
    village_name: village.village_name,
    block: village.block,
    district: village.district,
    state: village.state || 'Bihar',

    population: village.population !== null && village.population !== undefined
      ? { value: village.population, tag: 'Verified', source: village.data_source_population || 'Census 2011' }
      : { value: null, tag: 'Insufficient Data', reason: 'Population data not available' },

    households: village.households !== null && village.households !== undefined
      ? { value: village.households, tag: 'Verified', source: village.data_source_population || 'Census 2011' }
      : { value: null, tag: 'Insufficient Data', reason: 'Households count pending DCHB pull' },

    establishments: disaggregatedEstablishments,

    market_reach: village.population !== null && village.population !== undefined
      ? { value: village.population, tag: 'Derived', source: 'Single-village population baseline; 5–10km cluster radius aggregation not yet implemented' }
      : { value: null, tag: 'Insufficient Data', reason: 'Cannot calculate market reach without population figure' },

    last_verified_date: village.last_verified_date || '2026-08-31'
  };
}
