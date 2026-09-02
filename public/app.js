/**
 * GramVistaar Frontend App - SIH26091
 * Single Page Application (SPA) with 5-Screen guided flow,
 * 202-village searchable type-ahead dropdown, 4-tier data tags,
 * and eligibility gate / assessment rendering.
 */

// Application State
const state = {
  currentStep: 0, // 0: Home, 1: Lang, 2: Input, 3: Gate, 4: Results, 5: Share
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

// Language Dictionary
const translations = {
  en: {
    brandTitle: "GramVistaar",
    brandSub: "MoSJE · SIH26091 · Hyper-Local Advisory",
    heroEyebrow: "Smart India Hackathon 2026",
    heroTitle: "Check if your business idea works here, and how much you can borrow — before you apply.",
    heroSub: "Zero anecdote business selection. Real village data, exact NSFDC credit limits, and moratorium-aware EMI structuring.",
    heroCta: "Start My Assessment →",
    heroTrust: "Uses official Census 2011, government scheme terms, and district data — every figure labeled by source.",
    inputTitle: "Enter Your Details & Location",
    districtLabel: "District",
    blockLabel: "Block",
    villageLabel: "Village (Search over 202 villages)",
    villagePlaceholder: "Type village name (e.g. Saghari, Ratwara, Khandail)...",
    capitalLabel: "Available Margin Capital (₹)",
    capitalHelp: "Your 10% contribution",
    categoryLabel: "Business Category",
    scLabel: "Category / Community",
    incomeLabel: "Annual Family Income (₹)",
    incomeHelp: "NSFDC ceiling: ₹3,00,000/year",
    defaultLabel: "Prior Default under Govt Scheme?",
    noDefault: "No Default",
    hasDefault: "Yes, Has Default",
    submitBtn: "Check My Eligibility & Feasibility →",
    passTitle: "Eligibility Gate PASSED",
    passSub: "You qualify for concessional credit under NSFDC.",
    failTitle: "Eligibility Gate UNMET",
    seeFeasibilityBtn: "See Local Business Feasibility Report Anyway →",
    viewPlanBtn: "View Financial & Local Feasibility Plan →",
    financialTitle: "YOUR FINANCIAL PLAN",
    feasibilityTitle: "YOUR LOCAL BUSINESS SNAPSHOT",
    projectCostLabel: "Project Cost Ceiling",
    loanEligibleLabel: "Loan Eligibility (90%)",
    matchedSchemeLabel: "Matched Scheme",
    interestLabel: "Interest Rate",
    tenureLabel: "Tenure & Moratorium",
    affordabilityTitle: "EMI Affordability Risk Flag",
    viewEmiBtn: "View 84-Month EMI Schedule",
    popLabel: "Village Population",
    hhLabel: "Households",
    estLabel: "Nearby Establishment Density",
    reachLabel: "Market Reach Estimate",
    exportBtn: "Download Bank-Ready Summary (PDF) →"
  },
  hi: {
    brandTitle: "ग्राम विस्तार",
    brandSub: "सामाजिक न्याय और अधिकारिता मंत्रालय · एसआईएच 26091",
    heroEyebrow: "स्मार्ट इंडिया हैकाथॉन 2026",
    heroTitle: "आवेदन करने से पहले जानें कि क्या आपका व्यवसाय गाँव में चलेगा और कितना ऋण मिलेगा।",
    heroSub: "वास्तविक जनगणना डेटा, सटीक एनएसएफडीसी ऋण सीमा और ईएमआई संरचना।",
    heroCta: "अपना मूल्यांकन शुरू करें →",
    heroTrust: "आधिकारिक 2011 जनगणना और सरकारी योजना नियमों पर आधारित — हर डेटा स्रोत के साथ।",
    inputTitle: "अपना विवरण और स्थान दर्ज करें",
    districtLabel: "जिला",
    blockLabel: "ब्लॉक",
    villageLabel: "गाँव (202 गाँवों में खोजें)",
    villagePlaceholder: "गाँव का नाम लिखें (जैसे सघारी, रतवारा, खंडैल)...",
    capitalLabel: "उपलब्ध पूंजी (₹)",
    capitalHelp: "आपका 10% अंशदान",
    categoryLabel: "व्यवसाय श्रेणी",
    scLabel: "सामाजिक श्रेणी",
    incomeLabel: "वार्षिक पारिवारिक आय (₹)",
    incomeHelp: "एनएसएफडीसी सीमा: ₹3,00,000/वर्ष",
    defaultLabel: "क्या पहले कोई डिफ़ॉल्ट हुआ है?",
    noDefault: "कोई डिफ़ॉल्ट नहीं",
    hasDefault: "हाँ, डिफ़ॉल्ट हुआ है",
    submitBtn: "मेरी पात्रता और व्यवहार्यता जांचें →",
    passTitle: "पात्रता जाँच उत्तीर्ण (PASSED)",
    passSub: "आप एनएसएफडीसी के तहत रियायती ऋण के लिए पात्र हैं।",
    failTitle: "पात्रता मापदंड अपूर्ण (UNMET)",
    seeFeasibilityBtn: "फिर भी स्थानीय व्यवसाय व्यवहार्यता रिपोर्ट देखें →",
    viewPlanBtn: "वित्तीय और स्थानीय व्यवहार्यता योजना देखें →",
    financialTitle: "आपकी वित्तीय योजना",
    feasibilityTitle: "आपका स्थानीय व्यवसाय स्नैपशॉट",
    projectCostLabel: "परियोजना लागत सीमा",
    loanEligibleLabel: "ऋण पात्रता (90%)",
    matchedSchemeLabel: "योजना का नाम",
    interestLabel: "ब्याज दर",
    tenureLabel: "अवधि और मोरेटोरियम",
    affordabilityTitle: "ईएमआई वहन क्षमता जोखिम संकेतक",
    viewEmiBtn: "84-महीने का ईएमआई शेड्यूल देखें",
    popLabel: "गाँव की जनसंख्या",
    hhLabel: "कुल घर (Households)",
    estLabel: "आस-पास व्यावसायिक घनत्व",
    reachLabel: "बाजार पहुँच अनुमान",
    exportBtn: "बैंक-रेडी सारांश (पीडीएफ) डाउनलोड करें →"
  }
};

// Helper: Format Numbers in Lakhs / Indian Currency
function formatINR(val) {
  if (val === null || val === undefined || isNaN(val)) return 'N/A';
  return '₹' + Number(val).toLocaleString('en-IN');
}

function formatLakhHelper(val) {
  if (!val || isNaN(val)) return '';
  const lakhs = (val / 100000).toFixed(2);
  return `(${lakhs} Lakhs)`;
}

// DOM Elements Initialization
document.addEventListener('DOMContentLoaded', () => {
  initEvents();
  fetchVillages();
  renderLanguageText();
});

// Fetch Villages API
async function fetchVillages() {
  try {
    const res = await fetch('/api/villages');
    const data = await res.json();
    if (data && data.villages) {
      state.villagesList = data.villages;
      state.filteredVillages = data.villages;
      // Pre-select first village as default
      if (data.villages.length > 0) {
        state.selectedVillage = data.villages[0];
      }
    }
  } catch (err) {
    console.error('Failed to fetch villages list:', err);
  }
}

// Render UI Language Strings
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
}

// Event Listeners
function initEvents() {
  // Language Toggle
  document.getElementById('lang-toggle-btn').addEventListener('click', () => {
    state.language = state.language === 'en' ? 'hi' : 'en';
    document.getElementById('lang-toggle-btn').textContent = state.language === 'en' ? 'हिंदी' : 'English';
    renderLanguageText();
  });

  // Start Assessment Buttons
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

  // Screen 3 Gate CTAs
  document.getElementById('gate-continue-btn').addEventListener('click', () => goToStep(4));
  document.getElementById('gate-feasibility-only-btn').addEventListener('click', () => goToStep(4));
}

// Render Typeahead Results Box
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

  // Toggle active views
  document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
  const targetView = document.getElementById(`view-step-${step}`);
  if (targetView) targetView.classList.add('active');

  // Update Stepper Bar
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
    business_category: state.selectedCategory
  };

  try {
    const res = await fetch('/api/assess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    state.assessmentData = data;

    // Render Gate & Results
    renderEligibilityGate(data.eligibility);
    renderResultsScreen(data);

    // Go to Gate View (Step 3)
    goToStep(3);
  } catch (err) {
    console.error('Failed to run assessment:', err);
    alert('An error occurred while evaluating assessment. Please check API server.');
  }
}

// Render Screen 3 Eligibility Gate
function renderEligibilityGate(eligibility) {
  const passBox = document.getElementById('gate-pass-banner');
  const failBox = document.getElementById('gate-fail-banner');

  if (eligibility.status === 'pass') {
    passBox.style.display = 'block';
    failBox.style.display = 'none';
    document.getElementById('gate-corp-name').textContent = eligibility.corporation;
  } else {
    passBox.style.display = 'none';
    failBox.style.display = 'block';
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

// Render Screen 4 / 4b Results Dashboard
function renderResultsScreen(data) {
  const financialCard = document.getElementById('financial-card-container');
  const financialSkippedCard = document.getElementById('financial-skipped-card');
  const feasibilityCard = document.getElementById('feasibility-card-container');

  const { eligibility, financial, feasibility } = data;

  // 1. Render Financial Card or Skipped Explanation Card
  if (eligibility.status === 'pass' && financial && !financial.error) {
    financialCard.style.display = 'block';
    financialSkippedCard.style.display = 'none';

    document.getElementById('res-project-cost').textContent = formatINR(financial.project_cost);
    document.getElementById('res-loan-eligibility').textContent = formatINR(financial.loan_eligibility);
    document.getElementById('res-scheme-name').textContent = `${financial.corporation} ${financial.scheme_name}`;
    document.getElementById('res-interest-rate').textContent = `${(financial.interest_rate * 100).toFixed(1)}% p.a.`;
    document.getElementById('res-interest-tag').innerHTML = renderDataTag(financial.interest_rate_tag);
    document.getElementById('res-tenure').textContent = `${financial.tenure_years} Years (${financial.moratorium_months}-Month Moratorium)`;

    // Affordability Flag
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

    // EMI Schedule Table
    renderEmiTable(financial.emi_schedule);
  } else {
    financialCard.style.display = 'none';
    financialSkippedCard.style.display = 'block';
    document.getElementById('skipped-reason-text').textContent = eligibility.explanation || 'Scheme eligibility criteria not met.';
  }

  // 2. Render Feasibility Card
  if (feasibility) {
    document.getElementById('res-village-header').textContent = `${feasibility.village_name}, ${feasibility.block} Block (${feasibility.district})`;
    
    document.getElementById('res-pop-val').textContent = feasibility.market_reach.value ? Number(feasibility.market_reach.value).toLocaleString('en-IN') : 'N/A';
    document.getElementById('res-pop-tag').innerHTML = renderDataTag(feasibility.market_reach);

    document.getElementById('res-hh-val').textContent = feasibility.households.value ? Number(feasibility.households.value).toLocaleString('en-IN') : 'N/A';
    document.getElementById('res-hh-tag').innerHTML = renderDataTag(feasibility.households);

    document.getElementById('res-est-val').textContent = feasibility.competitor_density.value ? feasibility.competitor_density.value : 'N/A';
    document.getElementById('res-est-tag').innerHTML = renderDataTag(feasibility.competitor_density);

    // SWOT list
    const swotContainer = document.getElementById('res-swot-list');
    swotContainer.innerHTML = '';
    if (feasibility.swot) {
      feasibility.swot.forEach(item => {
        const li = document.createElement('li');
        li.style.marginBottom = '0.6rem';
        li.innerHTML = `<strong>${item.type.toUpperCase()}:</strong> ${item.text} ${renderDataTag(item)}`;
        swotContainer.appendChild(li);
      });
    }

    // Pricing Guidance
    if (feasibility.pricing_guidance) {
      document.getElementById('res-pricing-text').innerHTML = `${feasibility.pricing_guidance.text} ${renderDataTag(feasibility.pricing_guidance)}`;
    }
  }
}

// Render EMI Schedule Table
function renderEmiTable(schedule) {
  const tbody = document.getElementById('emi-table-body');
  tbody.innerHTML = '';
  if (!schedule) return;

  // Show sample 12 periods to avoid DOM overload
  schedule.slice(0, 12).forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>Month ${row.period}</td>
      <td>${formatINR(row.emi)}</td>
      <td>${formatINR(row.interest_payment)}</td>
      <td>${formatINR(row.principal_payment)}</td>
      <td>${formatINR(row.remaining_balance)}</td>
      <td><em>${row.note}</em></td>
    `;
    tbody.appendChild(tr);
  });
}
