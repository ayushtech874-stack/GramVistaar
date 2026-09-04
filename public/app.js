/**
 * GramVistaar Frontend App - SIH26091 / Official Banking Advisory Portal
 * Single Page Application (SPA) with 5-Screen guided flow,
 * 202-village searchable type-ahead dropdown, cascading District->Block filter, 4-tier vector data tags,
 * interactive Scheme Guidelines pop-up modal, 84-Month Schedule pop-up modal with dedicated print support,
 * English & Hindi (Bhashini AI) translation support, and Screen 5 PDF Export summary hand-off.
 */

// Application State
const state = {
  currentStep: 0, // 0: Home, 2: Input, 3: Gate, 4: Results, 5: Export
  language: 'en',
  villagesList: [],
  filteredVillages: [],
  selectedVillage: null,
  selectedCategory: 'dairy',
  availableCapital: null,
  categoryStatus: 'SC',
  familyIncome: null,
  applicantName: '',
  applicantAge: null,
  applicantOccupation: '',
  familyMembersCount: null,
  earningMembersCount: null,
  stateName: 'Bihar',
  priorDefault: false,
  assessmentData: null,
  showFullEmiSchedule: false
};

// District -> Block Mapping
const DISTRICT_BLOCK_MAP = {
  Muzaffarpur: ['Aurai'],
  Gaya: ['Sherghati']
};

// Language Dictionary (English & Hindi Bhashini AI Engine)
const translations = {
  en: {
    brandTitle: "GramVistaar",
    brandSub: "Rural Enterprise Credit & Feasibility Advisory Portal",
    stepHome: "Start",
    stepInput: "Details & Location",
    stepGate: "Eligibility Gate",
    stepResults: "Advisory Plan",
    stepExport: "Export Document",
    heroTitle: "Rural Enterprise Credit & Feasibility Advisory Portal",
    heroSub: "Evaluate local village demographics, calculate 90% concessional loan terms, and assess business feasibility before applying for credit.",
    heroCta: "Start Business Assessment →",
    feat1Title: "202 Verified Villages",
    feat1Sub: "Census 2011 population & household data grounded for Bihar blocks.",
    feat2Title: "Concessional Schemes",
    feat2Sub: "Exact 90% loan eligibility & 6-month moratorium schedule rules.",
    feat3Title: "4-Tier Provenance",
    feat3Sub: "Clear provenance badges ([Verified], [Derived], [AI-Estimated]) on every metric.",
    inputTitle: "Entrepreneur Details & Location Selection",
    inputSub: "Select your target village and available margin capital to structure your loan and feasibility plan.",
    nameLabel: "Applicant Full Name",
    ageLabel: "Applicant Age (Years)",
    occupationLabel: "Current Primary Occupation",
    familyMembersLabel: "Family Members (Total Count)",
    earningMembersLabel: "Earning Members in Household",
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
    defaultLabel: "Prior Scheme Default Status",
    noDefault: "No Prior Default (Declared)",
    hasDefault: "Has Prior Default",
    submitBtn: "Evaluate Eligibility & Generate Advisory Plan →",
    passTitle: "Eligibility Gate Passed",
    passSub: "You qualify for concessional scheme financing under",
    failTitle: "Concessional Scheme Criteria Unmet",
    seeFeasibilityBtn: "View Village Business Feasibility Report",
    viewPlanBtn: "Proceed to Financial & Feasibility Advisory Plan →",
    dashTitle: "Business Credit & Feasibility Plan",
    financialTitle: "Concessional Credit Plan",
    feasibilityTitle: "Village Feasibility Overview",
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
    skippedTitle: "Credit Plan Gated",
    skippedSub: "Loan calculations are hidden when eligibility requirements are unmet to avoid presenting unsupportable credit terms. Village feasibility insights are shown on the right.",
    exportBtn: "Export Bank Summary"
  },
  hi: {
    brandTitle: "ग्राम विस्तार",
    brandSub: "ग्रामीण उद्यम ऋण एवं व्यवहार्यता सलाहकार पोर्टल",
    stepHome: "प्रारंभ",
    stepInput: "विवरण एवं स्थान",
    stepGate: "पात्रता जाँच",
    stepResults: "सलाहकार योजना",
    stepExport: "निर्यात दस्तावेज़",
    heroTitle: "ग्रामीण उद्यम ऋण एवं व्यवहार्यता सलाहकार पोर्टल",
    heroSub: "ऋण के लिए आवेदन करने से पहले स्थानीय गाँव की जनसांख्यिकी, 90% रियायती ऋण शर्तों और व्यावसायिक व्यवहार्यता का मूल्यांकन करें।",
    heroCta: "उद्यम मूल्यांकन शुरू करें →",
    feat1Title: "202 सत्यापित गाँव",
    feat1Sub: "बिहार के ब्लॉकों के लिए 2011 जनगणना जनसंख्या एवं घरेलू डेटा।",
    feat2Title: "रियायती ऋण योजनाएं",
    feat2Sub: "सटीक 90% ऋण पात्रता और 6 महीने की मोरेटोरियम अवधि के नियम।",
    feat3Title: "4-स्तरीय डेटा भरोसा",
    feat3Sub: "प्रत्येक आंकड़े पर स्पष्ट डेटा स्रोत टैग ([सत्यापित], [व्युत्पन्न], [एआई-अनुमानित])।",
    inputTitle: "उद्यमी विवरण और स्थान चयन",
    inputSub: "अपनी ऋण और व्यवहार्यता योजना तैयार करने के लिए अपना लक्षित गाँव और उपलब्ध मार्जिन पूंजी चुनें।",
    nameLabel: "आवेदक का पूरा नाम",
    ageLabel: "आवेदक की आयु (वर्ष)",
    occupationLabel: "वर्तमान प्राथमिक व्यवसाय",
    familyMembersLabel: "परिवार के कुल सदस्य संख्या",
    earningMembersLabel: "परिवार में कमाने वाले सदस्य",
    districtLabel: "जिला",
    blockLabel: "ब्लॉक",
    villageLabel: "गाँव का नाम (202 गाँवों में खोजें)",
    villagePlaceholder: "गाँव का नाम लिखें (जैसे सघारी, रतवारा, खंडैल)...",
    capitalLabel: "उपलब्ध मार्जिन पूंजी (₹)",
    capitalHelp: "रियायती ऋण शर्तों के तहत आपका 10% अंशदान।",
    categoryLabel: "प्रस्तावित व्यवसाय श्रेणी",
    catDairy: "डेयरी / दुग्ध इकाई",
    catRetail: "किराना / रिटेल स्टोर",
    catTextiles: "कपड़ा / सिलाई केंद्र",
    scLabel: "सामाजिक श्रेणी",
    incomeLabel: "वार्षिक पारिवारिक आय (₹)",
    incomeHelp: "रियायती आय सीमा: ₹3,00,000 / वर्ष",
    defaultLabel: "पूर्व योजना डिफ़ॉल्ट स्थिति",
    noDefault: "कोई पूर्व डिफ़ॉल्ट नहीं (घोषित)",
    hasDefault: "पूर्व डिफ़ॉल्ट मौजूद है",
    submitBtn: "पात्रता जांचें और योजना तैयार करें →",
    passTitle: "पात्रता जाँच उत्तीर्ण (PASSED)",
    passSub: "आप इसके तहत रियायती ऋण के लिए पात्र हैं:",
    failTitle: "रियायती ऋण मापदंड अपूर्ण (UNMET)",
    seeFeasibilityBtn: "फिर भी गाँव व्यवसाय व्यवहार्यता रिपोर्ट देखें",
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
    exportBtn: "बैंक सारांश निर्यात करें"
  }
};

// Scheme Guideline Content Dictionary
const SCHEME_GUIDELINE_DATA = {
  NSFDC: {
    title: "National Scheduled Castes Finance & Development Corporation (NSFDC)",
    agency: "Ministry of Social Justice and Empowerment, Govt. of India",
    income_ceiling: "₹3,00,000 / year (Rural & Urban)",
    assistance: "Up to 90% of Project Cost",
    promoter_contribution: "10% Margin Money",
    schemes: [
      {
        name: "Micro Finance Scheme",
        cost: "Up to ₹1,40,000",
        rate: "6.5% p.a. (Concessional)",
        tenure: "3 Years (Includes 3-Month Moratorium)"
      },
      {
        name: "Term Loan Scheme",
        cost: "₹1,40,001 to ₹50,00,000",
        rate: "8.0% p.a. (Concessional)",
        tenure: "7 Years (Includes 6-Month Moratorium)"
      }
    ],
    sca_bihar: "Bihar State Scheduled Castes Co-operative Development Corporation Limited (BSCCDCL)",
    official_url: "https://nsfdc.nic.in"
  },
  NBCFDC: {
    title: "National Backward Classes Finance & Development Corporation (NBCFDC)",
    agency: "Ministry of Social Justice and Empowerment, Govt. of India",
    income_ceiling: "Double the Poverty Line (DPL) Criteria",
    assistance: "Up to 90% of Project Cost",
    promoter_contribution: "10% Margin Money",
    schemes: [
      {
        name: "Micro Finance Scheme",
        cost: "Up to ₹1,40,000",
        rate: "6.5% p.a. (Concessional)",
        tenure: "3 Years (Includes 3-Month Moratorium)"
      },
      {
        name: "General Term Loan Scheme",
        cost: "Up to ₹15,00,000",
        rate: "8.0% p.a. (Concessional)",
        tenure: "7 Years (Includes 6-Month Moratorium)"
      }
    ],
    sca_bihar: "Bihar State Backward Classes Finance & Development Corporation",
    official_url: "http://www.nbcfdc.gov.in"
  },
  NSTFDC: {
    title: "National Scheduled Tribes Finance & Development Corporation (NSTFDC)",
    agency: "Ministry of Tribal Affairs, Govt. of India",
    income_ceiling: "Family Income Eligibility Criteria",
    assistance: "Up to 90% of Project Cost",
    promoter_contribution: "10% Margin Money",
    schemes: [
      {
        name: "Adivasi Samriddhi Yojana (Micro)",
        cost: "Up to ₹1,40,000",
        rate: "6.5% p.a. (Concessional)",
        tenure: "3 Years (Includes 3-Month Moratorium)"
      },
      {
        name: "Term Loan Scheme",
        cost: "Up to ₹50,00,000",
        rate: "8.0% p.a. (Concessional)",
        tenure: "7 Years (Includes 6-Month Moratorium)"
      }
    ],
    sca_bihar: "Bihar State Scheduled Tribes Co-operative Development Corporation",
    official_url: "https://nstfdc.tribal.gov.in"
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
      updateDistrictBlockCascade();
    }
  } catch (err) {
    console.error('Failed to fetch villages list:', err);
  }
}

// Cascading District -> Block Handler
function updateDistrictBlockCascade() {
  const distSelect = document.getElementById('district-select');
  const blockSelect = document.getElementById('block-select');
  if (!distSelect || !blockSelect) return;

  const selectedDist = distSelect.value || 'Muzaffarpur';
  const allowedBlocks = DISTRICT_BLOCK_MAP[selectedDist] || ['Aurai'];

  blockSelect.innerHTML = '';
  allowedBlocks.forEach(b => {
    const opt = document.createElement('option');
    opt.value = b;
    opt.textContent = `${b} Block`;
    blockSelect.appendChild(opt);
  });
  blockSelect.value = allowedBlocks[0];

  filterVillagesByDistrictBlock();
}

function filterVillagesByDistrictBlock() {
  const selectedDist = document.getElementById('district-select').value;
  const selectedBlock = document.getElementById('block-select').value;

  state.filteredVillages = state.villagesList.filter(v =>
    v.district.toLowerCase() === selectedDist.toLowerCase() &&
    v.block.toLowerCase() === selectedBlock.toLowerCase()
  );

  if (state.filteredVillages.length > 0) {
    state.selectedVillage = state.filteredVillages[0];
    document.getElementById('village-search-input').value = `${state.selectedVillage.village_name} (${state.selectedVillage.block})`;
  } else {
    state.selectedVillage = null;
    document.getElementById('village-search-input').value = '';
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

  const nameInput = document.getElementById('applicant-name-input');
  if (nameInput) nameInput.placeholder = state.language === 'hi' ? 'उदा. रेखा देवी' : 'e.g. Rekha Devi';

  const ageInput = document.getElementById('applicant-age-input');
  if (ageInput) ageInput.placeholder = state.language === 'hi' ? 'उदा. 34' : 'e.g. 34';

  const occInput = document.getElementById('applicant-occupation-input');
  if (occInput) occInput.placeholder = state.language === 'hi' ? 'उदा. कृषि मजदूर, खुदरा विक्रेता, कारीगर' : 'e.g. Agricultural Labourer, Retailer, Artisan';

  const famInput = document.getElementById('family-members-input');
  if (famInput) famInput.placeholder = state.language === 'hi' ? 'उदा. 5' : 'e.g. 5';

  const earnInput = document.getElementById('earning-members-input');
  if (earnInput) earnInput.placeholder = state.language === 'hi' ? 'उदा. 2' : 'e.g. 2';

  const capInput = document.getElementById('capital-input');
  if (capInput) capInput.placeholder = state.language === 'hi' ? 'उदा. 100000' : 'e.g. 100000';

  const incInput = document.getElementById('income-input');
  if (incInput) incInput.placeholder = state.language === 'hi' ? 'उदा. 60000' : 'e.g. 60000';

  if (state.assessmentData) {
    renderEligibilityGate(state.assessmentData.eligibility);
    renderResultsScreen(state.assessmentData);
  }
}

// Reset Assessment State (New Candidate Navigation)
function resetAssessmentState() {
  state.assessmentData = null;
  state.selectedCategory = 'dairy';
  state.availableCapital = null;
  state.familyIncome = null;
  state.showFullEmiSchedule = false;
  
  document.getElementById('district-select').value = 'Muzaffarpur';
  updateDistrictBlockCascade();

  document.getElementById('capital-input').value = '';
  document.getElementById('capital-lakh-help').textContent = '(Enter capital in ₹)';
  document.getElementById('income-input').value = '';
  document.getElementById('category-status').value = 'SC';
  document.getElementById('prior-default-select').value = 'false';

  if (document.getElementById('applicant-name-input')) document.getElementById('applicant-name-input').value = '';
  if (document.getElementById('applicant-age-input')) document.getElementById('applicant-age-input').value = '';
  if (document.getElementById('applicant-occupation-input')) document.getElementById('applicant-occupation-input').value = '';
  if (document.getElementById('family-members-input')) document.getElementById('family-members-input').value = '';
  if (document.getElementById('earning-members-input')) document.getElementById('earning-members-input').value = '';
  if (document.getElementById('village-search-input')) document.getElementById('village-search-input').value = '';

  document.querySelectorAll('.cat-card').forEach(c => c.classList.remove('selected'));

  goToStep(0);
}

// Event Handlers
function initEvents() {
  document.getElementById('header-brand-logo').addEventListener('click', () => {
    resetAssessmentState();
  });

  document.getElementById('new-assessment-header-btn').addEventListener('click', () => {
    resetAssessmentState();
  });

  document.getElementById('reset-new-assessment-btn').addEventListener('click', () => {
    resetAssessmentState();
  });

  document.getElementById('district-select').addEventListener('change', () => {
    updateDistrictBlockCascade();
  });

  document.getElementById('block-select').addEventListener('change', () => {
    filterVillagesByDistrictBlock();
  });

  // Quick Persona Presets
  document.getElementById('preset-rekha-btn').addEventListener('click', () => {
    document.getElementById('district-select').value = 'Muzaffarpur';
    updateDistrictBlockCascade();

    state.selectedCategory = 'dairy';
    state.availableCapital = 100000;
    document.getElementById('capital-input').value = 100000;
    document.getElementById('capital-lakh-help').textContent = formatLakhHelper(100000);
    document.getElementById('income-input').value = 60000;
    document.getElementById('category-status').value = 'SC';
    document.getElementById('prior-default-select').value = 'false';
    if (document.getElementById('applicant-name-input')) document.getElementById('applicant-name-input').value = 'Rekha Devi';
    if (document.getElementById('applicant-age-input')) document.getElementById('applicant-age-input').value = '34';
    if (document.getElementById('applicant-occupation-input')) document.getElementById('applicant-occupation-input').value = 'Agricultural Labourer / Dairy Worker';
    if (document.getElementById('family-members-input')) document.getElementById('family-members-input').value = '5';
    if (document.getElementById('earning-members-input')) document.getElementById('earning-members-input').value = '2';

    const ratwara = state.villagesList.find(v => v.village_name.toLowerCase().includes('ratwara'));
    if (ratwara) {
      state.selectedVillage = ratwara;
      document.getElementById('village-search-input').value = `${ratwara.village_name} (${ratwara.block})`;
    }
    document.querySelectorAll('.cat-card').forEach(c => c.classList.remove('selected'));
    document.querySelector('.cat-card[data-cat="dairy"]').classList.add('selected');
  });

  document.getElementById('preset-anita-btn').addEventListener('click', () => {
    document.getElementById('district-select').value = 'Muzaffarpur';
    updateDistrictBlockCascade();

    state.selectedCategory = 'retail';
    state.availableCapital = 140000;
    document.getElementById('capital-input').value = 140000;
    document.getElementById('capital-lakh-help').textContent = formatLakhHelper(140000);
    document.getElementById('income-input').value = 80000;
    document.getElementById('category-status').value = 'OBC';
    document.getElementById('prior-default-select').value = 'false';
    if (document.getElementById('applicant-name-input')) document.getElementById('applicant-name-input').value = 'Anita Kumari';
    if (document.getElementById('applicant-age-input')) document.getElementById('applicant-age-input').value = '29';
    if (document.getElementById('applicant-occupation-input')) document.getElementById('applicant-occupation-input').value = 'Retail / Kirana Store Owner';
    if (document.getElementById('family-members-input')) document.getElementById('family-members-input').value = '4';
    if (document.getElementById('earning-members-input')) document.getElementById('earning-members-input').value = '2';

    const saghari = state.villagesList.find(v => v.village_name.toLowerCase().includes('saghari'));
    if (saghari) {
      state.selectedVillage = saghari;
      document.getElementById('village-search-input').value = `${saghari.village_name} (${saghari.block})`;
    }
    document.querySelectorAll('.cat-card').forEach(c => c.classList.remove('selected'));
    document.querySelector('.cat-card[data-cat="retail"]').classList.add('selected');
  });

  // POP-UP MODAL 1: Scheme Guidelines Pop-up Modal
  document.getElementById('open-scheme-modal-btn').addEventListener('click', () => {
    const corpKey = (state.assessmentData?.eligibility?.corporation || document.getElementById('category-status').value || 'NSFDC').toUpperCase();
    const g = SCHEME_GUIDELINE_DATA[corpKey] || SCHEME_GUIDELINE_DATA.NSFDC;

    document.getElementById('modal-scheme-title').textContent = g.title;
    document.getElementById('modal-scheme-corp').textContent = g.agency;

    let html = `
      <div style="margin-bottom: 1.25rem; background: var(--bg-main); padding: 1rem; border-radius: 6px; border-left: 4px solid var(--forest-dark);">
        <div><strong>Income Eligibility Ceiling:</strong> ${g.income_ceiling}</div>
        <div><strong>Govt. Concessional Assistance:</strong> ${g.assistance}</div>
        <div><strong>Promoter Contribution (Margin Money):</strong> ${g.promoter_contribution}</div>
      </div>
      <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 0.5rem; color: var(--text-main);">Concessional Scheme Tiers:</div>
      <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.25rem;">
    `;

    g.schemes.forEach(s => {
      html += `
        <div style="border: 1px solid var(--border-medium); padding: 0.85rem; border-radius: 6px; background: #ffffff;">
          <div style="font-weight: 700; color: var(--forest-dark); font-size: 0.9rem;">${s.name}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">
            Project Cost Limit: <strong class="num-mono">${s.cost}</strong> | Interest Rate: <strong class="num-mono">${s.rate}</strong> | Tenure: <strong>${s.tenure}</strong>
          </div>
        </div>
      `;
    });

    html += `
      </div>
      <div style="font-size: 0.8rem; color: var(--text-muted); border-top: 1px solid var(--border-light); padding-top: 0.75rem;">
        <div><strong>State Channelizing Agency (SCA) Bihar:</strong> ${g.sca_bihar}</div>
        <div style="margin-top: 0.35rem;">Official Portal: <a href="${g.official_url}" target="_blank" style="color: var(--forest-dark); font-weight: 700;">${g.official_url} ↗</a></div>
      </div>
    `;

    document.getElementById('modal-scheme-content').innerHTML = html;
    document.getElementById('scheme-modal-overlay').style.display = 'flex';
  });

  document.getElementById('close-scheme-modal-btn').addEventListener('click', () => {
    document.getElementById('scheme-modal-overlay').style.display = 'none';
  });

  // POP-UP MODAL 2: 84-Month EMI Schedule Pop-up Modal
  document.getElementById('toggle-full-emi-btn').addEventListener('click', () => {
    if (!state.assessmentData || !state.assessmentData.financial || !state.assessmentData.financial.emi_schedule) return;

    const schedule = state.assessmentData.financial.emi_schedule;
    const tbody = document.getElementById('modal-emi-table-body');
    tbody.innerHTML = '';

    schedule.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${state.language === 'hi' ? 'महीना' : 'Month'} ${row.period}</td>
        <td class="num-mono">${formatINR(row.emi)}</td>
        <td class="num-mono">${formatINR(row.interest_payment)}</td>
        <td class="num-mono">${formatINR(row.principal_payment)}</td>
        <td class="num-mono">${formatINR(row.remaining_balance)}</td>
        <td><em>${row.note}</em></td>
      `;
      tbody.appendChild(tr);
    });

    document.getElementById('emi-modal-overlay').style.display = 'flex';
  });

  document.getElementById('close-emi-modal-btn').addEventListener('click', () => {
    document.getElementById('emi-modal-overlay').style.display = 'none';
  });

  // Dedicated EMI Schedule Print Action
  document.getElementById('print-modal-emi-btn').addEventListener('click', () => {
    document.body.classList.add('printing-emi');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-emi');
    }, 500);
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

  // Print PDF Button (Screen 5 Summary Document)
  document.getElementById('print-pdf-btn').addEventListener('click', () => {
    document.body.classList.remove('printing-emi');
    window.print();
  });

  // Language Toggle
  document.getElementById('lang-toggle-btn').addEventListener('click', async () => {
    state.language = state.language === 'en' ? 'hi' : 'en';
    document.getElementById('lang-toggle-btn').textContent = state.language === 'en' ? 'हिंदी (Bhashini AI)' : 'English';
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
    const currentDist = document.getElementById('district-select').value;
    const currentBlock = document.getElementById('block-select').value;
    const list = state.villagesList.filter(v =>
      v.district.toLowerCase() === currentDist.toLowerCase() &&
      v.block.toLowerCase() === currentBlock.toLowerCase()
    );
    renderTypeaheadResults(list);
    typeaheadResults.classList.add('active');
  });

  villageInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const currentDist = document.getElementById('district-select').value;
    const currentBlock = document.getElementById('block-select').value;

    const list = state.villagesList.filter(v =>
      v.district.toLowerCase() === currentDist.toLowerCase() &&
      v.block.toLowerCase() === currentBlock.toLowerCase() &&
      (v.village_name.toLowerCase().includes(query) || v.block.toLowerCase().includes(query))
    );
    renderTypeaheadResults(list);
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
    container.innerHTML = `<div class="typeahead-item">No matching villages found in selected district/block</div>`;
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

// Helper: Render DataTag HTML Component with Vector SVG Icons (No Emoji)
function renderDataTag(tagObj) {
  if (!tagObj) return '';
  const label = tagObj.tag || 'AI-Estimated';
  let className = 'ai';
  let svgIcon = `<svg class="tag-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;

  if (label === 'Verified' || label === 'सत्यापित') {
    className = 'verified';
    svgIcon = `<svg class="tag-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else if (label === 'Derived' || label === 'व्युत्पन्न') {
    className = 'derived';
    svgIcon = `<svg class="tag-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="18"></line><path d="M16 10h.01"></path><path d="M12 10h.01"></path><path d="M8 10h.01"></path><path d="M12 14h.01"></path><path d="M8 14h.01"></path><path d="M12 18h.01"></path><path d="M8 18h.01"></path></svg>`;
  } else if (label === 'Insufficient Data' || label === 'डेटा अपर्याप्त') {
    className = 'insufficient';
    svgIcon = `<svg class="tag-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
  }

  const sourceText = tagObj.source ? ` (${tagObj.source})` : (tagObj.reason ? ` (${tagObj.reason})` : '');
  return `<span class="data-tag ${className}">${svgIcon} ${label}${sourceText}</span>`;
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
      ? `<span style="color:#059669; font-size:0.75rem; font-weight:700;">● Live API (${feasibility.latency_ms}ms)</span>`
      : `<span style="color:#b45309; font-size:0.75rem; font-weight:700;">● Grounded Baseline</span>`;

    document.getElementById('res-village-header').innerHTML = `${feasibility.village_name}, ${feasibility.block} Block (${feasibility.district}) &nbsp;|&nbsp; ${liveIndicator}`;

    document.getElementById('res-pop-val').textContent = feasibility.market_reach.value ? Number(feasibility.market_reach.value).toLocaleString('en-IN') : 'N/A';
    document.getElementById('res-pop-tag').innerHTML = renderDataTag(feasibility.market_reach);

    document.getElementById('res-hh-val').textContent = feasibility.households.value ? Number(feasibility.households.value).toLocaleString('en-IN') : 'N/A';
    document.getElementById('res-hh-tag').innerHTML = renderDataTag(feasibility.households);

    document.getElementById('res-est-val').textContent = feasibility.competitor_density.value ? feasibility.competitor_density.value : 'N/A';
    document.getElementById('res-est-tag').innerHTML = renderDataTag(feasibility.competitor_density);

    // SPACIOUS COLOR-CODED SWOT QUADRANTS CONTAINER (NO EMOJI)
    const swotContainer = document.getElementById('res-swot-container');
    if (swotContainer) {
      swotContainer.innerHTML = '';
      if (feasibility.swot && feasibility.swot.length > 0) {
        feasibility.swot.forEach(item => {
          const type = (item.type || 'strength').toLowerCase();
          let iconSvg = `<svg style="width:15px;height:15px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
          let title = 'Strength';
          if (type === 'weakness') {
            iconSvg = `<svg style="width:15px;height:15px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
            title = 'Weakness';
          } else if (type === 'opportunity') {
            iconSvg = `<svg style="width:15px;height:15px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path></svg>`;
            title = 'Opportunity';
          } else if (type === 'threat') {
            iconSvg = `<svg style="width:15px;height:15px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;
            title = 'Threat';
          }

          if (state.language === 'hi') {
            if (type === 'strength') title = 'ताकत (Strength)';
            else if (type === 'weakness') title = 'कमजोरी (Weakness)';
            else if (type === 'opportunity') title = 'अवसर (Opportunity)';
            else if (type === 'threat') title = 'जोखिम (Threat)';
          }

          const card = document.createElement('div');
          card.className = `swot-card ${type}`;
          card.innerHTML = `
            <div class="swot-card-header">
              <span class="swot-badge">${iconSvg} ${title}</span>
              ${renderDataTag(item)}
            </div>
            <div class="swot-card-text">${item.text}</div>
          `;
          swotContainer.appendChild(card);
        });
      }
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

  const catSel = document.getElementById('category-status');
  document.getElementById('pdf-cat-status').textContent = catSel.options[catSel.selectedIndex].text;
  document.getElementById('pdf-income').textContent = formatINR(document.getElementById('income-input').value) + ' / year';

  const appName = document.getElementById('applicant-name-input')?.value || 'Rekha Devi';
  const appAge = document.getElementById('applicant-age-input')?.value || '34';
  const appOcc = document.getElementById('applicant-occupation-input')?.value || 'Agricultural Labourer / Dairy Worker';
  const famCount = document.getElementById('family-members-input')?.value || '5';
  const earnCount = document.getElementById('earning-members-input')?.value || '2';

  if (document.getElementById('pdf-applicant-name')) {
    document.getElementById('pdf-applicant-name').textContent = appName;
  }
  if (document.getElementById('pdf-applicant-age-occ')) {
    document.getElementById('pdf-applicant-age-occ').textContent = `${appAge} Years · ${appOcc}`;
  }
  if (document.getElementById('pdf-household-info')) {
    document.getElementById('pdf-household-info').textContent = `${famCount} Family Members (${earnCount} Earning)`;
  }

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
      `This proposal has been pre-screened against Census 2011 village demographics and concessional scheme limits under ${financial.corporation}. The applicant's ${formatINR(financial.available_capital)} margin contribution supports a ${formatINR(financial.project_cost)} project ceiling. The ${financial.moratorium_months}-month moratorium allows initial business setup and revenue stabilization before full EMI servicing begins.`;
  }
}

// Render EMI Schedule Table
function renderEmiTable(schedule) {
  const tbody = document.getElementById('emi-table-body');
  tbody.innerHTML = '';
  if (!schedule) return;

  const rowsToShow = schedule.slice(0, 12);

  rowsToShow.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${state.language === 'hi' ? 'महीना' : 'Month'} ${row.period}</td>
      <td class="num-mono">${formatINR(row.emi)}</td>
      <td class="num-mono">${formatINR(row.interest_payment)}</td>
      <td class="num-mono">${formatINR(row.principal_payment)}</td>
      <td class="num-mono">${formatINR(row.remaining_balance)}</td>
      <td><em>${row.note}</em></td>
    `;
    tbody.appendChild(tr);
  });
}
