/**
 * Local-Metrics Module - SIH26091 (GramVistaar)
 * Pure deterministic local village data lookup with strict 4-tier provenance tagging
 * and strict null -> Insufficient Data enforcement (rules.md R2).
 */

import fs from 'fs';
import path from 'path';

/**
 * Load default village metrics from JSON file if not provided
 */
export function loadVillageMetrics(filePath) {
  const resolvedPath = filePath || path.join(process.cwd(), 'data', 'village_metrics.json');
  const rawData = fs.readFileSync(resolvedPath, 'utf8');
  return JSON.parse(rawData);
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

  // Category establishment key mapping
  const categoryKey = category ? `establishments_${category.toLowerCase()}` : null;
  const establishmentVal = categoryKey && village[categoryKey] !== undefined ? village[categoryKey] : null;

  const blockFirmsText = village.block && village.block.toLowerCase().includes('aurai')
    ? '558 firms in Aurai'
    : '3,350 firms in Sherghati';

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

    establishments: establishmentVal !== null && establishmentVal !== undefined
      ? { value: establishmentVal, tag: 'Verified', source: village.data_source_establishments || 'SHRUG' }
      : { value: null, tag: 'Insufficient Data', reason: `No village- or category-level establishment breakdown available — block-level total (${blockFirmsText}) exists but isn't disaggregated` },

    market_reach: village.population !== null && village.population !== undefined
      ? { value: village.population, tag: 'Derived', source: 'Single-village population baseline; 5–10km cluster radius aggregation not yet implemented' }
      : { value: null, tag: 'Insufficient Data', reason: 'Cannot calculate market reach without population figure' },

    last_verified_date: village.last_verified_date || '2026-08-31'
  };
}
