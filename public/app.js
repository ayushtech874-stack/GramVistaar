/**
 * GramVistaar Frontend App - SIH26091 / Official Banking Advisory Portal
 * Single Page Application (SPA) with 5-Screen guided flow,
 * 202-village searchable type-ahead dropdown, 4-tier data tags,
 * English & Hindi translation support, and Screen 5 PDF Export summary hand-off.
 */

// Application State
const state = {
  currentStep: 0, // 0: Home, 2: Input, 3: Gate, 4: Results, 5: Export
  language: 'en',
  villagesList: [],
  filteredVillages: [],
  selectedVillage: null,
  selectedCategory: 'dairy',
  availableCapital: 100000,
  categoryStatus: 'SC',
  familyIncome: 60000,
  stateName: 'Bihar',
  priorDefault: false,
  assessmentData: null
};

// Language Dictionary (English & Hindi)
const translations = {
  en: {
    brandTitle: "GramVistaar",
    brandSub: "Rural Enterprise Credit & Feasibility Advisory Portal",
    stepHome: "Home",
    stepInput: "Details & Location",
    stepGate: "Eligibility Gate",
    stepResults: "Advisory Plan",
    stepExport: "Export Summary",
    heroTitle: "Structured Credit Planning & Village Feasibility for Rural Entrepreneurs",
    heroSub: "Evaluate enterprise feasibility against Census 2011 village metrics and calculate moratorium-aware scheme credit limits before applying.",
    heroCta: "Start Business Assessment →",
    feat1Title: "202 Verified Villages",
    feat1Sub: "Census 2011 population & household data",
    feat2Title: "Concessional Schemes",
    feat2Sub: "Exact NSFDC term loan & micro finance rates",
    feat3Title: "4-Tier Data Trust",
    feat3Sub: "Clear provenance badges on every figure",
    inputTitle: "Entrepreneur Details & Location Selection",
    districtLabel: "District",
    blockLabel: "Block",
    villageLabel: "Village Name (Search over 202 Villages)",
    villagePlaceholder: "Type village name (e.g., Saghari, Ratwara, Khandail)...",
    capitalLabel: "Available Margin Capital (₹)",
    capitalHelp: "Represents your 10% borrower contribution under concessional credit terms.",
    categoryLabel: "Proposed Business Category",
    catDairy: "Dairy / Milk Unit",
    catRetail: "Retail / Kirana",
    catTextiles: "Textiles / Tailoring",
    scLabel: "Social Category",
    incomeLabel: "Annual Family Income (₹)",
    incomeHelp: "Concessional ceiling: ₹3,00,000 / year",
    defaultLabel: "Prior Government Scheme Default Status",
    noDefault: "No Prior Default (Declared)",
    hasDefault: "Has Prior Default",
    submitBtn: "Evaluate Eligibility & Generate Advisory Plan →",
    passTitle: "Eligibility Gate Passed",
    passSub: "You qualify for concessional scheme financing under",
    failTitle: "Concessional Scheme Criteria Unmet",
    seeFeasibilityBtn: "View Village Business Feasibility Report Anyway →",
    viewPlanBtn: "Proceed to Financial & Feasibility Advisory Plan →",
    dashTitle: "Business Credit & Feasibility Plan",
    financialTitle: "CONCESSIONAL CREDIT PLAN",
    feasibilityTitle: "VILLAGE FEASIBILITY SNAPSHOT",
    projectCostLabel: "Project Cost Ceiling",
    loanEligibleLabel: "Loan Eligibility (90%)",
    matchedSchemeLabel: "Matched Scheme",
    interestLabel: "Concessional Interest Rate",
    tenureLabel: "Tenure & Moratorium",
    affordabilityTitle: "EMI Affordability Risk Flag",
    viewEmiBtn: "84-Month Repayment EMI Schedule Preview",
    thPeriod: "Month",
    thEmi: "EMI (₹)",
    thInterest: "Interest (₹)",
    thPrincipal: "Principal (₹)",
    thBalance: "Balance (₹)",
    thNote: "Note",
    popLabel: "Village Population",
    hhLabel: "Households",
    estLabel: "Nearby Establishment Density",
    reachLabel: "Pricing & Monthly Revenue Guidance",
    swotHeader: "SWOT & Business Opportunity Analysis",
    skippedTitle: "CREDIT PLAN GATED",
    skippedSub: "Loan calculations are hidden when eligibility requirements are unmet to avoid presenting unsupportable credit terms. Village feasibility insights are shown on the right.",
    exportBtn: "📄 Export Bank Summary →"
  },
  hi: {
    brandTitle: "ग्राम विस्तार",
    brandSub: "ग्रामीण उद्यम ऋण एवं व्यवहार्यता सलाहकार पोर्टल",
    stepHome: "मुख्य पृष्ठ",
    stepInput: "विवरण एवं स्थान",
    stepGate: "पात्रता जाँच",
    stepResults: "सलाहकार योजना",
    stepExport: "निर्यात सारांश",
    heroTitle: "ग्रामीण उद्यमियों के लिए संरचित ऋण योजना एवं गाँव व्यवहार्यता",
    heroSub: "आवेदन करने से पहले 2011 जनगणना गाँव डेटा के विरुद्ध व्यवहार्यता जांचें और रियायती ऋण सीमा की गणना करें।",
    heroCta: "उद्यम मूल्यांकन शुरू करें →",
    feat1Title: "202 सत्यापित गाँव",
    feat1Sub: "2011 जनगणना जनसंख्या और घरेलू डेटा",
    feat2Title: "रियायती ऋण योजनाएं",
    feat2Sub: "सटीक एनएसएफडीसी टर्म लोन और माइक्रो फाइनेंस दरें",
    feat3Title: "4-स्तरीय डेटा भरोसा",
    feat3Sub: "हर आंकड़े पर स्पष्ट डेटा स्रोत टैग",
    inputTitle: "उद्यमी विवरण और स्थान चयन",
    districtLabel: "जिला",
    blockLabel: "ब्लॉक",
    villageLabel: "गाँव का नाम (202 गाँवों में खोजें)",
    villagePlaceholder: "गाँव का नाम लिखें (जैसे सघारी, रतवारा, खंडैल)...",
    capitalLabel: "उपलब्ध पूंजी (₹)",
    capitalHelp: "रियायती ऋण शर्तों के तहत आपका 10% अंशदान।",
    categoryLabel: "प्रस्तावित व्यवसाय श्रेणी",
    catDairy: "डेयरी / दुग्ध इकाई",
    catRetail: "किराना / रिटेल स्टोर",
    catTextiles: "कपड़ा / सिलाई केंद्र",
    scLabel: "सामाजिक श्रेणी",
    incomeLabel: "वार्षिक पारिवारिक आय (₹)",
    incomeHelp: "रियायती आय सीमा: ₹3,00,000 / वर्ष",
    defaultLabel: "पूर्व सरकारी योजना डिफ़ॉल्ट स्थिति",
    noDefault: "कोई पूर्व डिफ़ॉल्ट नहीं (घोषित)",
    hasDefault: "पूर्व डिफ़ॉल्ट मौजूद है",
    submitBtn: "पात्रता जांचें और योजना तैयार करें →",
    passTitle: "पात्रता जाँच उत्तीर्ण (PASSED)",
    passSub: "आप इसके तहत रियायती ऋण के लिए पात्र हैं:",
    failTitle: "रियायती ऋण मापदंड अपूर्ण (UNMET)",
    seeFeasibilityBtn: "फिर भी गाँव व्यवसाय व्यवहार्यता रिपोर्ट देखें →",
    viewPlanBtn: "वित्तीय और व्यवहार्यता सलाहकार योजना देखें →",
    dashTitle: "व्यवसाय ऋण एवं व्यवहार्यता योजना",
    financialTitle: "आपकी रियायती ऋण योजना",
    feasibilityTitle: "गाँव व्यवहार्यता स्नैपशॉट",
    projectCostLabel: "परियोजना लागत सीमा",
    loanEligibleLabel: "ऋण पात्रता (90%)",
    matchedSchemeLabel: "योजना का नाम",
    interestLabel: "रियायती ब्याज दर",
    tenureLabel: "अवधि और मोरेटोरियम",
    affordabilityTitle: "ईएमआई वहन क्षमता जोखिम संकेतक",
    viewEmiBtn: "84-महीने का ईएमआई भुगतान शेड्यूल",
    thPeriod: "महीना",
    thEmi: "ईएमआई (₹)",
    thInterest: "ब्याज (₹)",
    thPrincipal: "मूलधन (₹)",
    thBalance: "शेष राशि (₹)",
    thNote: "विवरण",
    popLabel: "गाँव की जनसंख्या",
    hhLabel: "कुल घर (Households)",
    estLabel: "आस-पास व्यावसायिक घनत्व",
    reachLabel: "मूल्य निर्धारण एवं मासिक राजस्व मार्गदर्शन",
    swotHeader: "स्वाट एवं व्यवसाय अवसर विश्लेषण",
    skippedTitle: "ऋण योजना रोकी गई",
    skippedSub: "पात्रता मापदंड अपूर्ण होने पर अमान्य आंकड़ों से बचने के लिए ऋण गणना छिपाई गई है। गाँव की व्यवहार्यता दाईं ओर दिखाई गई है।",
    exportBtn: "📄 बैंक सारांश निर्यात करें →"
  }
};

// Dynamic Scheme Name Translator
function getLocalizedSchemeName(schemeName, lang) {
  if (lang === 'hi') {
    return schemeName.replace('Term Loan Scheme', 'टर्म लोन योजना').replace('Micro Finance Scheme', 'माइक्रो फाइनेंस योजना');
  }
  return schemeName;
}

// Helper: Format Currency
function formatINR(val) {
  if (val === null || val === undefined || isNaN(val)) return 'N/A';
  return '₹' + Number(val).toLocaleString('en-IN');
}

function formatLakhHelper(val) {
  if (!val || isNaN(val)) return '';
  const lakhs = (val / 100000).toFixed(2);
  return `(${lakhs} Lakhs / लाख)`;
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initEvents();
  fetchVillages();
  renderLanguageText();
});

// Fetch Villages List
async function fetchVillages() {
  try {
    const res = await fetch('/api/villages');
    const data = await res.json();
    if (data && data.villages) {
      state.villagesList = data.villages;
      state.filteredVillages = data.villages;
      if (data.villages.length > 0) {
        state.selectedVillage = data.villages[0];
      }
    }
  } catch (err) {
    console.error('Failed to fetch villages list:', err);
  }
}

// Render Language Text
function renderLanguageText() {
  const t = translations[state.language];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) {
      el.textContent = t[key];
    }
  });
  const searchInput = document.getElementById('village-search-input');
  if (searchInput) {
    searchInput.placeholder = t.villagePlaceholder;
  }

  if (state.assessmentData) {
    renderEligibilityGate(state.assessmentData.eligibility);
    renderResultsScreen(state.assessmentData);
  }
}

// Reset Assessment State (New Candidate Navigation)
function resetAssessmentState() {
  state.assessmentData = null;
  state.selectedCategory = 'dairy';
  state.availableCapital = 100000;
  
  document.getElementById('capital-input').value = 100000;
  document.getElementById('capital-lakh-help').textContent = formatLakhHelper(100000);
  document.getElementById('income-input').value = 60000;
  document.getElementById('category-status').value = 'SC';
  document.getElementById('prior-default-select').value = 'false';

  if (state.villagesList.length > 0) {
    state.selectedVillage = state.villagesList[0];
    document.getElementById('village-search-input').value = '';
  }

  document.querySelectorAll('.cat-card').forEach(c => c.classList.remove('selected'));
  document.querySelector('.cat-card[data-cat="dairy"]').classList.add('selected');

  goToStep(0);
}

// Event Handlers
function initEvents() {
  // Brand Header Click -> Reset to Home
  document.getElementById('header-brand-logo').addEventListener('click', () => {
    resetAssessmentState();
  });

  // Header "New Assessment" button
  document.getElementById('new-assessment-header-btn').addEventListener('click', () => {
    resetAssessmentState();
  });

  // Dashboard "New Assessment" button
  document.getElementById('reset-new-assessment-btn').addEventListener('click', () => {
    resetAssessmentState();
  });

  // Export Summary Button (Screen 4 -> Screen 5)
  document.getElementById('go-to-export-btn').addEventListener('click', () => {
    renderExportDocument();
    goToStep(5);
  });

  // Back to Results Button (Screen 5 -> Screen 4)
  document.getElementById('back-to-results-btn').addEventListener('click', () => {
    goToStep(4);
  });

  // Print PDF Button
  document.getElementById('print-pdf-btn').addEventListener('click', () => {
    window.print();
  });

  // Language Toggle
  document.getElementById('lang-toggle-btn').addEventListener('click', async () => {
    state.language = state.language === 'en' ? 'hi' : 'en';
    document.getElementById('lang-toggle-btn').textContent = state.language === 'en' ? 'हिंदी' : 'English';
    renderLanguageText();

    if (state.assessmentData && state.selectedVillage) {
      await runAssessment();
    }
  });

  // Hero Start Button -> Go to Step 2
  document.getElementById('hero-start-btn').addEventListener('click', () => goToStep(2));

  // Category Selector Cards
  document.querySelectorAll('.cat-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.cat-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.selectedCategory = card.getAttribute('data-cat');
    });
  });

  // Capital Input Helper
  const capitalInput = document.getElementById('capital-input');
  const capitalHelpText = document.getElementById('capital-lakh-help');
  capitalInput.addEventListener('input', (e) => {
    const val = Number(e.target.value);
    state.availableCapital = val;
    capitalHelpText.textContent = formatLakhHelper(val);
  });

  // Searchable Village Dropdown Type-Ahead
  const villageInput = document.getElementById('village-search-input');
  const typeaheadResults = document.getElementById('typeahead-results');

  villageInput.addEventListener('focus', () => {
    renderTypeaheadResults(state.villagesList);
    typeaheadResults.classList.add('active');
  });

  villageInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    state.filteredVillages = state.villagesList.filter(v =>
      v.village_name.toLowerCase().includes(query) ||
      v.block.toLowerCase().includes(query) ||
      v.district.toLowerCase().includes(query)
    );
    renderTypeaheadResults(state.filteredVillages);
    typeaheadResults.classList.add('active');
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.typeahead-wrapper')) {
      typeaheadResults.classList.remove('active');
    }
  });

  // Form Submission -> API Call
  document.getElementById('assessment-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await runAssessment();
  });

  // Gate CTAs
  document.getElementById('gate-continue-btn').addEventListener('click', () => goToStep(4));
  document.getElementById('gate-feasibility-only-btn').addEventListener('click', () => goToStep(4));
}

// Render Typeahead Results
function renderTypeaheadResults(list) {
  const container = document.getElementById('typeahead-results');
  container.innerHTML = '';
  if (list.length === 0) {
    container.innerHTML = `<div class="typeahead-item">No matching villages found</div>`;
    return;
  }

  list.slice(0, 30).forEach(v => {
    const div = document.createElement('div');
    div.className = 'typeahead-item';
    div.innerHTML = `<strong>${v.village_name}</strong> <span class="item-sub">${v.block} Block, ${v.district} District</span>`;
    div.addEventListener('click', () => {
      state.selectedVillage = v;
      document.getElementById('village-search-input').value = `${v.village_name} (${v.block})`;
      container.classList.remove('active');
    });
    container.appendChild(div);
  });
}

// Switch Navigation Step
function goToStep(step) {
  state.currentStep = step;

  document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
  const targetView = document.getElementById(`view-step-${step}`);
  if (targetView) targetView.classList.add('active');

  document.querySelectorAll('.step-item').forEach(item => {
    const s = Number(item.getAttribute('data-step'));
    if (s <= step) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Run Full Assessment via API
async function runAssessment() {
  if (!state.selectedVillage) {
    alert('Please select a village from the dropdown search list.');
    return;
  }

  const payload = {
    category: document.getElementById('category-status').value,
    family_income_annual: Number(document.getElementById('income-input').value) || 60000,
    state: 'Bihar',
    prior_default: document.getElementById('prior-default-select').value === 'true',
    available_capital: Number(document.getElementById('capital-input').value) || 100000,
    village_id: state.selectedVillage.village_id,
    business_category: state.selectedCategory,
    language: state.language
  };

  try {
    const res = await fetch('/api/assess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    state.assessmentData = data;

    renderEligibilityGate(data.eligibility);
    renderResultsScreen(data);

    if (state.currentStep < 3) {
      goToStep(3);
    }
  } catch (err) {
    console.error('Failed to run assessment:', err);
    alert('An error occurred while evaluating assessment. Please check API server.');
  }
}

// Render Eligibility Gate
function renderEligibilityGate(eligibility) {
  const passBox = document.getElementById('gate-pass-banner');
  const failBox = document.getElementById('gate-fail-banner');

  if (eligibility.status === 'pass') {
    passBox.style.display = 'flex';
    failBox.style.display = 'none';
    document.getElementById('gate-corp-name').textContent = eligibility.corporation;
  } else {
    passBox.style.display = 'none';
    failBox.style.display = 'flex';
    document.getElementById('gate-fail-reason').textContent = eligibility.explanation || 'Eligibility requirements not met.';
  }
}

// Helper: Render DataTag HTML Component
function renderDataTag(tagObj) {
  if (!tagObj) return '';
  const label = tagObj.tag || 'AI-Estimated';
  let className = 'ai';
  let icon = '✨';

  if (label === 'Verified') {
    className = 'verified';
    icon = '✓';
  } else if (label === 'Derived') {
    className = 'derived';
    icon = '🧮';
  } else if (label === 'Insufficient Data') {
    className = 'insufficient';
    icon = '⚠️';
  }

  const sourceText = tagObj.source ? ` (${tagObj.source})` : (tagObj.reason ? ` (${tagObj.reason})` : '');
  return `<span class="data-tag ${className}">${icon} ${label}${sourceText}</span>`;
}

// Render Results Dashboard
function renderResultsScreen(data) {
  const financialCard = document.getElementById('financial-card-container');
  const financialSkippedCard = document.getElementById('financial-skipped-card');

  const { eligibility, financial, feasibility } = data;

  if (eligibility.status === 'pass' && financial && !financial.error) {
    financialCard.style.display = 'block';
    financialSkippedCard.style.display = 'none';

    document.getElementById('res-project-cost').textContent = formatINR(financial.project_cost);
    document.getElementById('res-project-cost-tag').innerHTML = renderDataTag({ tag: 'Derived', source: 'Capital / 0.10' });

    document.getElementById('res-loan-eligibility').textContent = formatINR(financial.loan_eligibility);
    document.getElementById('res-loan-eligibility-tag').innerHTML = renderDataTag({ tag: 'Derived', source: '90% of Project Cost' });

    const schemeNameDisplay = getLocalizedSchemeName(`${financial.corporation} ${financial.scheme_name}`, state.language);
    document.getElementById('res-scheme-name').textContent = schemeNameDisplay;
    document.getElementById('res-scheme-tag').innerHTML = renderDataTag(financial.interest_rate_tag);

    document.getElementById('res-interest-rate').textContent = `${(financial.interest_rate * 100).toFixed(1)}% p.a.`;
    document.getElementById('res-interest-tag').innerHTML = renderDataTag(financial.interest_rate_tag);

    document.getElementById('res-tenure').textContent = `${financial.tenure_years} ${state.language === 'hi' ? 'वर्ष' : 'Years'} (${financial.moratorium_months}-${state.language === 'hi' ? 'महीने मोरेटोरियम' : 'Month Moratorium'})`;
    document.getElementById('res-tenure-tag').innerHTML = renderDataTag({ tag: 'Verified', source: financial.corporation });

    const affBox = document.getElementById('affordability-gauge-box');
    if (financial.affordability_flag) {
      affBox.style.display = 'block';
      const flag = financial.affordability_flag;
      document.getElementById('aff-flag-text').textContent = `${flag.flag} (${flag.percentage}% of estimated monthly revenue)`;
      document.getElementById('aff-explanation').textContent = flag.explanation;

      const fill = document.getElementById('aff-bar-fill');
      fill.style.width = `${Math.min(flag.percentage, 100)}%`;
      fill.className = `affordability-bar-fill ${flag.risk_color}`;
    } else {
      affBox.style.display = 'none';
    }

    renderEmiTable(financial.emi_schedule);
  } else {
    financialCard.style.display = 'none';
    financialSkippedCard.style.display = 'block';
    document.getElementById('skipped-reason-text').textContent = eligibility.explanation || 'Scheme eligibility criteria not met.';
  }

  if (feasibility) {
    const liveIndicator = feasibility.is_live_llm
      ? `<span style="color:#15803d; font-size:0.75rem; font-weight:700;">● Live API (${feasibility.latency_ms}ms)</span>`
      : `<span style="color:#c59b27; font-size:0.75rem; font-weight:700;">● Grounded Template</span>`;

    document.getElementById('res-village-header').innerHTML = `${feasibility.village_name}, ${feasibility.block} Block (${feasibility.district}) &nbsp;|&nbsp; ${liveIndicator}`;

    document.getElementById('res-pop-val').textContent = feasibility.market_reach.value ? Number(feasibility.market_reach.value).toLocaleString('en-IN') : 'N/A';
    document.getElementById('res-pop-tag').innerHTML = renderDataTag(feasibility.market_reach);

    document.getElementById('res-hh-val').textContent = feasibility.households.value ? Number(feasibility.households.value).toLocaleString('en-IN') : 'N/A';
    document.getElementById('res-hh-tag').innerHTML = renderDataTag(feasibility.households);

    document.getElementById('res-est-val').textContent = feasibility.competitor_density.value ? feasibility.competitor_density.value : 'N/A';
    document.getElementById('res-est-tag').innerHTML = renderDataTag(feasibility.competitor_density);

    const swotContainer = document.getElementById('res-swot-list');
    swotContainer.innerHTML = '';
    if (feasibility.swot) {
      feasibility.swot.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${item.type.toUpperCase()}:</strong> ${item.text} ${renderDataTag(item)}`;
        swotContainer.appendChild(li);
      });
    }

    if (feasibility.pricing_guidance) {
      document.getElementById('res-pricing-text').innerHTML = `${feasibility.pricing_guidance.text} ${renderDataTag(feasibility.pricing_guidance)}`;
    }
  }
}

// Render Screen 5 Printable PDF Document
function renderExportDocument() {
  if (!state.assessmentData) return;

  const { eligibility, financial, feasibility } = state.assessmentData;
  const today = new Date().toISOString().split('T')[0];
  const refCode = 'GV-2026-' + Math.floor(1000 + Math.random() * 9000);

  document.getElementById('pdf-date').textContent = today;
  document.getElementById('pdf-ref-code').textContent = refCode;

  // Applicant
  const catSel = document.getElementById('category-status');
  document.getElementById('pdf-cat-status').textContent = catSel.options[catSel.selectedIndex].text;
  document.getElementById('pdf-income').textContent = formatINR(document.getElementById('income-input').value) + ' / year';

  if (feasibility) {
    document.getElementById('pdf-village-name').textContent = feasibility.village_name;
    document.getElementById('pdf-block-dist').textContent = `${feasibility.block} Block, ${feasibility.district} District (${feasibility.state})`;
    document.getElementById('pdf-pop').textContent = feasibility.market_reach.value ? Number(feasibility.market_reach.value).toLocaleString('en-IN') : 'N/A';
    document.getElementById('pdf-hh').textContent = feasibility.households.value ? Number(feasibility.households.value).toLocaleString('en-IN') : 'N/A';
    document.getElementById('pdf-est-rev').textContent = formatINR(feasibility.pricing_guidance?.estimated_monthly_revenue || 32000) + ' / month';
  }

  if (financial && !financial.error) {
    document.getElementById('pdf-project-cost').textContent = formatINR(financial.project_cost);
    document.getElementById('pdf-loan-elig').textContent = formatINR(financial.loan_eligibility);
    document.getElementById('pdf-corp').textContent = `${financial.corporation} ${financial.scheme_name}`;
    document.getElementById('pdf-rate').textContent = `${(financial.interest_rate * 100).toFixed(1)}% p.a.`;
    document.getElementById('pdf-tenure').textContent = `${financial.tenure_years} Years (${financial.moratorium_months}-Month Moratorium)`;
    document.getElementById('pdf-emi').textContent = formatINR(financial.monthly_emi) + ' / month';

    document.getElementById('pdf-why-scheme-text').textContent = 
      `This proposal has been pre-screened against Census 2011 village demographics and concessional credit terms under ${financial.corporation}. The applicant's ${formatINR(financial.available_capital)} margin contribution supports a ${formatINR(financial.project_cost)} project ceiling. The ${financial.moratorium_months}-month moratorium allows initial business setup and revenue stabilization before full EMI servicing begins.`;
  }
}

// Render EMI Schedule Table
function renderEmiTable(schedule) {
  const tbody = document.getElementById('emi-table-body');
  tbody.innerHTML = '';
  if (!schedule) return;

  schedule.slice(0, 12).forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${state.language === 'hi' ? 'महीना' : 'Month'} ${row.period}</td>
      <td>${formatINR(row.emi)}</td>
      <td>${formatINR(row.interest_payment)}</td>
      <td>${formatINR(row.principal_payment)}</td>
      <td>${formatINR(row.remaining_balance)}</td>
      <td><em>${row.note}</em></td>
    `;
    tbody.appendChild(tr);
  });
}
