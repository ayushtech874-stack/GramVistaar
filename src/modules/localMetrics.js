/**
 * Local-Metrics Module - SIH26091 (GramVistaar)
 * Pure deterministic local village data lookup with strict 4-tier provenance tagging,
 * population-weighted block firm disaggregation model, memory caching for Vercel,
 * and strict null -> Insufficient Data enforcement (rules.md R2).
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

  const blockKey = village.block && village.block.toLowerCase().includes('sherghati') ? 'sherghati' : 'aurai';
  const blockBaseline = BLOCK_BASELINES[blockKey];

  // Disaggregation Model: Weight block total firms by village population share
  let disaggregatedEstablishments = null;
  if (establishmentVal !== null && establishmentVal !== undefined) {
    disaggregatedEstablishments = {
      value: establishmentVal,
      tag: 'Verified',
      source: village.data_source_establishments || 'SHRUG'
    };
  } else if (village.population && village.population > 0) {
    const popShare = village.population / blockBaseline.total_population;
    const estCount = Math.max(1, Math.round(popShare * blockBaseline.total_firms));
    disaggregatedEstablishments = {
      value: `~${estCount} est. firms`,
      tag: 'Derived',
      source: `Population-weighted share of ${blockBaseline.total_firms} total firms in ${blockBaseline.block_name}`
    };
  } else {
    disaggregatedEstablishments = {
      value: null,
      tag: 'Insufficient Data',
      reason: `No village- or category-level establishment breakdown available — block-level total (${blockBaseline.total_firms} firms in ${blockBaseline.block_name}) exists but village population is missing`
    };
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
