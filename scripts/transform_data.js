/**
 * Data Transformation Script - SIH26091 (GramVistaar)
 * Reads raw source Excel workbooks and outputs real 202-village village_metrics.json dataset
 * following collected-datasets.html Section 8 field mapping.
 */

import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

const RAW_DIR = path.join(process.cwd(), 'data', 'raw');
const OUTPUT_FILE = path.join(process.cwd(), 'data', 'village_metrics.json');

const SIH_EXCEL_PATH = path.join(RAW_DIR, 'sih_data_collection.xlsx');

/**
 * Helper to match object keys case-insensitively with flexible whitespace
 */
function getValueByPattern(row, regex) {
  for (const key of Object.keys(row)) {
    const cleanedKey = key.trim().replace(/\s+/g, ' ');
    if (regex.test(cleanedKey)) {
      return row[key];
    }
  }
  return undefined;
}

function transformData() {
  console.log(`[Transform] Reading ${SIH_EXCEL_PATH}...`);
  if (!fs.existsSync(SIH_EXCEL_PATH)) {
    throw new Error(`Raw workbook not found at ${SIH_EXCEL_PATH}`);
  }

  const workbook = XLSX.readFile(SIH_EXCEL_PATH);

  if (!workbook.SheetNames.includes('village_amenities')) {
    throw new Error(`Sheet 'village_amenities' not found in workbook. Found: ${workbook.SheetNames.join(', ')}`);
  }

  const sheet = workbook.Sheets['village_amenities'];
  const rawRows = XLSX.utils.sheet_to_json(sheet);

  console.log(`[Transform] Total raw rows read from 'village_amenities': ${rawRows.length}`);

  const villageMetrics = [];

  for (const row of rawRows) {
    const rawVillageId = getValueByPattern(row, /^village code$/i) || getValueByPattern(row, /^village_code$/i);
    const villageName = getValueByPattern(row, /^village name$/i) || getValueByPattern(row, /^village_name$/i);
    const block = getValueByPattern(row, /^sub district name$/i) || getValueByPattern(row, /^block$/i);
    const district = getValueByPattern(row, /^district name$/i) || getValueByPattern(row, /^district$/i);

    if (!villageName) continue;

    // Population matching
    const popRaw = getValueByPattern(row, /^total population of village$/i) || getValueByPattern(row, /^total population$/i);
    const pop = (popRaw !== undefined && popRaw !== null && popRaw !== '' && !isNaN(popRaw)) ? parseInt(popRaw, 10) : null;

    // Households matching
    const hhRaw = getValueByPattern(row, /^total households$/i) || getValueByPattern(row, /^households$/i);
    const hh = (hhRaw !== undefined && hhRaw !== null && hhRaw !== '' && !isNaN(hhRaw)) ? parseInt(hhRaw, 10) : null;

    const villageId = rawVillageId ? String(rawVillageId).trim() : `v_${villageMetrics.length + 1}`;
    const blockName = String(block || '').trim();
    const blockFirmsText = blockName.toLowerCase().includes('aurai') ? '558 firms in Aurai' : '3,350 firms in Sherghati';

    villageMetrics.push({
      village_id: villageId,
      village_name: String(villageName).trim(),
      block: blockName,
      district: String(district || '').trim(),
      state: 'Bihar',
      population: pop && pop > 0 ? pop : null,
      households: hh && hh > 0 ? hh : null,
      establishments_dairy: null,
      establishments_retail: null,
      establishments_textiles: null,
      avg_monthly_consumption: null,
      data_source_population: 'Census 2011 PCA / Village Directory',
      data_source_establishments: `No village- or category-level establishment breakdown available — block-level total (${blockFirmsText}) exists but isn't disaggregated`,
      last_verified_date: '2026-08-31'
    });
  }

  console.log(`[Transform] Successfully processed ${villageMetrics.length} villages.`);

  // Write formatted JSON
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(villageMetrics, null, 2), 'utf8');
  console.log(`[Transform] Saved dataset to ${OUTPUT_FILE}`);

  return villageMetrics;
}

transformData();
