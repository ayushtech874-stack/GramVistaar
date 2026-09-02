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
    const rawVillageId = row['Village Code'] || row['village_code'] || row['Village_Code'];
    const villageName = row['Village Name'] || row['village_name'];
    const block = row['Sub District Name'] || row['sub_district_name'] || row['Block'];
    const district = row['District Name'] || row['district_name'] || row['District'];

    if (!villageName) continue;

    const popRaw = row['Total Population of Village'] ?? row['total_population'] ?? row['Population'];
    const pop = (popRaw !== undefined && popRaw !== null && popRaw !== '' && !isNaN(popRaw)) ? parseInt(popRaw, 10) : null;

    const hhRaw = row['Total   Households'] ?? row['Total Households'] ?? row['total_households'] ?? row['Households'];
    const hh = (hhRaw !== undefined && hhRaw !== null && hhRaw !== '' && !isNaN(hhRaw)) ? parseInt(hhRaw, 10) : null;

    const villageId = rawVillageId ? String(rawVillageId).trim() : `v_${villageMetrics.length + 1}`;

    villageMetrics.push({
      village_id: villageId,
      village_name: String(villageName).trim(),
      block: String(block || '').trim(),
      district: String(district || '').trim(),
      state: 'Bihar',
      population: pop && pop > 0 ? pop : null,
      households: hh && hh > 0 ? hh : null,
      establishments_dairy: null,
      establishments_retail: null,
      establishments_textiles: null,
      avg_monthly_consumption: null,
      data_source_population: 'Census 2011 PCA / Village Directory',
      data_source_establishments: 'SHRUG Economic Census (Block level: Total Firms)',
      last_verified_date: '2026-08-31'
    });
  }

  console.log(`[Transform] Successfully processed ${villageMetrics.length} villages.`);

  // Write formatted JSON
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(villageMetrics, null, 2), 'utf8');
  console.log(`[Transform] Saved dataset to ${OUTPUT_FILE}`);

  // Summary breakdown
  const auraiCount = villageMetrics.filter(v => v.block.toLowerCase().includes('aurai')).length;
  const sherghatiCount = villageMetrics.filter(v => v.block.toLowerCase().includes('sherghati')).length;

  console.log(`\n--- TRANSFORMATION SUMMARY ---`);
  console.log(`Total Villages Extracted: ${villageMetrics.length}`);
  console.log(`- Aurai Block Villages: ${auraiCount}`);
  console.log(`- Sherghati Block Villages: ${sherghatiCount}`);

  // Print 3 sample records per user request
  // 1. One large village
  const largeVillage = [...villageMetrics].sort((a, b) => (b.population || 0) - (a.population || 0))[0];
  // 2. One small village (with population > 0)
  const smallVillage = [...villageMetrics].filter(v => v.population > 0).sort((a, b) => (a.population || 0) - (b.population || 0))[0];
  // 3. One Sherghati village
  const sherghatiVillage = villageMetrics.find(v => v.block.toLowerCase().includes('sherghati'));

  console.log(`\n--- SAMPLE RECORD 1 (Large Village: ${largeVillage.village_name}) ---`);
  console.log(JSON.stringify(largeVillage, null, 2));

  console.log(`\n--- SAMPLE RECORD 2 (Small Village: ${smallVillage.village_name}) ---`);
  console.log(JSON.stringify(smallVillage, null, 2));

  console.log(`\n--- SAMPLE RECORD 3 (Sherghati Block Village: ${sherghatiVillage ? sherghatiVillage.village_name : 'N/A'}) ---`);
  console.log(JSON.stringify(sherghatiVillage, null, 2));

  return villageMetrics;
}

transformData();
