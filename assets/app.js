/**
 * UK Property Grant Finder  -  app.js
 * No framework, no build step. Vanilla ES2020.
 */

'use strict';

/* ============================================================
   STATE
   ============================================================ */
const state = {
  // Wizard answers
  country: null,
  postcode: '',
  propertyType: null,
  tenure: null,
  epcRating: null,
  works: [],          // multi-select
  tenantCirc: [],     // multi-select, optional
  // UI
  currentStep: 1,
  totalSteps: 6,
  // Data
  grants: [],
  // Browse filters
  browseSearch: '',
  browseAudience: '',
  browseCountry: '',
  browseCategory: '',
  browsePropertyType: '',
  browseWorks: '',
};

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  loadGrants().then(() => {
    initWizard();
    initBrowse();
    initTabs();
    initModal();
    restoreFiltersFromURL();
  });

  // Auto-resize for iframe embedding
  function postHeight() {
    window.parent.postMessage({ type: 'gf-resize', height: document.body.scrollHeight }, '*');
  }
  setInterval(postHeight, 600);
});

/* ============================================================
   DATA LOADING
   ============================================================ */
async function loadGrants() {
  try {
    const res = await fetch('data/grants.json');
    if (!res.ok) throw new Error('Failed to load grants.json');
    state.grants = await res.json();
  } catch (err) {
    console.error('Grant Finder: could not load grants.json', err);
    state.grants = [];
  }
}

/* ============================================================
   TABS
   ============================================================ */
function initTabs() {
  const tabs = document.querySelectorAll('[data-tab]');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => {
        t.classList.toggle('active', t.dataset.tab === target);
        t.setAttribute('aria-selected', t.dataset.tab === target ? 'true' : 'false');
      });
      document.querySelectorAll('.gf-panel').forEach(panel => {
        panel.classList.toggle('active', panel.id === target + '-panel');
      });
      // Update URL
      const url = new URL(window.location);
      url.searchParams.set('view', target);
      history.replaceState(null, '', url);
    });
  });

  // Restore tab from URL
  const url = new URL(window.location);
  const view = url.searchParams.get('view');
  if (view) {
    const tab = document.querySelector(`[data-tab="${view}"]`);
    if (tab) tab.click();
  }
}

/* ============================================================
   WIZARD
   ============================================================ */
function initWizard() {
  // Option click handlers (single-select)
  document.querySelectorAll('.gf-option:not(.multi)').forEach(opt => {
    opt.addEventListener('click', () => {
      const key = opt.dataset.key;
      const val = opt.dataset.val;
      // Deselect others in same group
      document.querySelectorAll(`.gf-option[data-key="${key}"]:not(.multi)`).forEach(o => {
        o.classList.remove('selected');
        o.setAttribute('aria-pressed', 'false');
      });
      opt.classList.add('selected');
      opt.setAttribute('aria-pressed', 'true');
      state[key] = val;
      updateNextButton();
    });
    opt.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        opt.click();
      }
    });
  });

  // Multi-select option click handlers
  document.querySelectorAll('.gf-option.multi').forEach(opt => {
    opt.addEventListener('click', () => {
      const key = opt.dataset.key;
      const val = opt.dataset.val;
      const stateArr = state[key];
      opt.classList.toggle('selected');
      const isSelected = opt.classList.contains('selected');
      opt.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
      if (isSelected) {
        if (!stateArr.includes(val)) stateArr.push(val);
      } else {
        const idx = stateArr.indexOf(val);
        if (idx > -1) stateArr.splice(idx, 1);
      }
      updateNextButton();
    });
    opt.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        opt.click();
      }
    });
  });

  // Postcode input
  const postcodeInput = document.getElementById('gf-postcode');
  if (postcodeInput) {
    postcodeInput.addEventListener('input', () => {
      state.postcode = postcodeInput.value.trim().toUpperCase();
    });
  }

  // Next buttons
  document.querySelectorAll('[data-next-step]').forEach(btn => {
    btn.addEventListener('click', () => {
      const nextStep = parseInt(btn.dataset.nextStep, 10);
      goToStep(nextStep);
    });
  });

  // Back buttons
  document.querySelectorAll('[data-prev-step]').forEach(btn => {
    btn.addEventListener('click', () => {
      const prevStep = parseInt(btn.dataset.prevStep, 10);
      goToStep(prevStep);
    });
  });

  // Submit button
  const submitBtn = document.getElementById('gf-wizard-submit');
  if (submitBtn) {
    submitBtn.addEventListener('click', runWizard);
  }

  // Reset buttons
  document.querySelectorAll('.gf-reset-btn').forEach(btn => {
    btn.addEventListener('click', resetWizard);
  });

  updateProgress();
}

function goToStep(n) {
  document.querySelectorAll('.gf-step').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(`gf-step-${n}`);
  if (target) {
    target.classList.add('active');
    state.currentStep = n;
    updateProgress();
    // Scroll to top of wizard
    target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  updateNextButton();
}

function updateProgress() {
  const fill = document.getElementById('gf-progress-fill');
  const label = document.getElementById('gf-step-label');
  const pct = document.getElementById('gf-step-pct');
  if (!fill) return;
  const pctVal = Math.round((state.currentStep / state.totalSteps) * 100);
  fill.style.width = pctVal + '%';
  if (label) label.textContent = `Step ${state.currentStep} of ${state.totalSteps}`;
  if (pct) pct.textContent = pctVal + '%';
  fill.setAttribute('aria-valuenow', pctVal);
}

function updateNextButton() {
  const step = state.currentStep;
  const nextBtn = document.querySelector(`#gf-step-${step} [data-next-step], #gf-step-${step} #gf-wizard-submit`);
  if (!nextBtn) return;

  let canProceed = false;
  switch (step) {
    case 1: canProceed = !!state.country; break;
    case 2: canProceed = !!state.propertyType; break;
    case 3: canProceed = !!state.tenure; break;
    case 4: canProceed = !!state.epcRating; break;
    case 5: canProceed = state.works.length > 0; break;
    case 6: canProceed = true; break; // optional step
    default: canProceed = true;
  }
  nextBtn.disabled = !canProceed;
}

function resetWizard() {
  state.country = null;
  state.postcode = '';
  state.propertyType = null;
  state.tenure = null;
  state.epcRating = null;
  state.works = [];
  state.tenantCirc = [];
  state.currentStep = 1;

  // Clear UI selections
  document.querySelectorAll('.gf-option').forEach(o => {
    o.classList.remove('selected');
    o.setAttribute('aria-pressed', 'false');
  });
  const postcodeInput = document.getElementById('gf-postcode');
  if (postcodeInput) postcodeInput.value = '';

  // Hide results
  const resultsSection = document.getElementById('gf-wizard-results');
  if (resultsSection) resultsSection.classList.add('gf-hidden');

  // Show wizard
  const wizardSection = document.getElementById('gf-wizard-form');
  if (wizardSection) wizardSection.classList.remove('gf-hidden');
  const progressSection = document.getElementById('gf-progress-wrap');
  if (progressSection) progressSection.classList.remove('gf-hidden');

  goToStep(1);
}

/* ============================================================
   MATCHING LOGIC
   ============================================================ */
function scoreGrant(grant) {
  let score = 0;

  // --- Hard filters ---
  // Country
  if (state.country && !grant.countries.includes(state.country)) return null;

  // Property type
  if (state.propertyType && grant.propertyTypes.length > 0) {
    if (!grant.propertyTypes.includes(state.propertyType)) return null;
  }

  // Tenure
  if (state.tenure && grant.tenures.length > 0) {
    if (!grant.tenures.includes(state.tenure)) return null;
  }

  // --- Soft boosts ---
  // Works overlap
  if (state.works.length > 0 && grant.worksCovered.length > 0) {
    const overlap = state.works.filter(w => grant.worksCovered.includes(w));
    score += overlap.length * 10;
  }

  // EPC band
  if (state.epcRating && state.epcRating !== 'unknown' && grant.epcBands.length > 0) {
    if (grant.epcBands.includes(state.epcRating)) score += 8;
  }

  // Tenant criteria
  if (state.tenantCirc.length > 0 && grant.tenantCriteria.length > 0) {
    const overlap = state.tenantCirc.filter(c => grant.tenantCriteria.includes(c));
    score += overlap.length * 5;
  }

  // Baseline score so all passing schemes appear
  score += 1;

  return score;
}

function runWizard() {
  const results = [];

  state.grants.forEach(grant => {
    const score = scoreGrant(grant);
    if (score !== null) {
      results.push({ grant, score });
    }
  });

  // Sort: score desc, then maxFunding desc
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const fa = a.grant.maxFunding || 0;
    const fb = b.grant.maxFunding || 0;
    return fb - fa;
  });

  renderWizardResults(results.map(r => r.grant));
}

function renderWizardResults(grants) {
  // Hide wizard form
  const wizardForm = document.getElementById('gf-wizard-form');
  if (wizardForm) wizardForm.classList.add('gf-hidden');
  const progressWrap = document.getElementById('gf-progress-wrap');
  if (progressWrap) progressWrap.classList.add('gf-hidden');

  // Show results section
  const resultsSection = document.getElementById('gf-wizard-results');
  if (!resultsSection) return;
  resultsSection.classList.remove('gf-hidden');

  const countEl = document.getElementById('gf-results-count');
  if (countEl) countEl.textContent = grants.length;

  const listEl = document.getElementById('gf-results-list');
  if (!listEl) return;

  if (grants.length === 0) {
    listEl.innerHTML = renderNoResults();
    return;
  }

  listEl.innerHTML = grants.map(g => renderSchemeCard(g, 'wizard')).join('');
  attachCardHandlers(listEl);
}

/* ============================================================
   BROWSE MODE
   ============================================================ */
function initBrowse() {
  const searchInput = document.getElementById('gf-browse-search');
  const audienceSelect = document.getElementById('gf-filter-audience');
  const countrySelect = document.getElementById('gf-filter-country');
  const categorySelect = document.getElementById('gf-filter-category');
  const propertySelect = document.getElementById('gf-filter-property');
  const worksSelect = document.getElementById('gf-filter-works');
  const clearBtn = document.getElementById('gf-filter-clear');

  function onFilterChange() {
    state.browseSearch = searchInput ? searchInput.value.toLowerCase() : '';
    state.browseAudience = audienceSelect ? audienceSelect.value : '';
    state.browseCountry = countrySelect ? countrySelect.value : '';
    state.browseCategory = categorySelect ? categorySelect.value : '';
    state.browsePropertyType = propertySelect ? propertySelect.value : '';
    state.browseWorks = worksSelect ? worksSelect.value : '';
    persistFiltersToURL();
    renderBrowse();
  }

  [searchInput, audienceSelect, countrySelect, categorySelect, propertySelect, worksSelect].forEach(el => {
    if (el) el.addEventListener('input', onFilterChange);
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (audienceSelect) audienceSelect.value = '';
      if (countrySelect) countrySelect.value = '';
      if (categorySelect) categorySelect.value = '';
      if (propertySelect) propertySelect.value = '';
      if (worksSelect) worksSelect.value = '';
      onFilterChange();
    });
  }

  renderBrowse();
}

function persistFiltersToURL() {
  const url = new URL(window.location);
  const params = url.searchParams;

  const setOrDelete = (key, val) => {
    if (val) params.set(key, val);
    else params.delete(key);
  };

  setOrDelete('q', state.browseSearch);
  setOrDelete('audience', state.browseAudience);
  setOrDelete('country', state.browseCountry);
  setOrDelete('category', state.browseCategory);
  setOrDelete('proptype', state.browsePropertyType);
  setOrDelete('works', state.browseWorks);

  history.replaceState(null, '', url);
}

function restoreFiltersFromURL() {
  const params = new URLSearchParams(window.location.search);

  const q = params.get('q') || '';
  const audience = params.get('audience') || '';
  const country = params.get('country') || '';
  const category = params.get('category') || '';
  const proptype = params.get('proptype') || '';
  const works = params.get('works') || '';

  if (q || audience || country || category || proptype || works) {
    // Switch to browse tab
    const browseTab = document.querySelector('[data-tab="browse"]');
    if (browseTab) browseTab.click();
  }

  const searchInput = document.getElementById('gf-browse-search');
  const audienceSelect = document.getElementById('gf-filter-audience');
  const countrySelect = document.getElementById('gf-filter-country');
  const categorySelect = document.getElementById('gf-filter-category');
  const propertySelect = document.getElementById('gf-filter-property');
  const worksSelect = document.getElementById('gf-filter-works');

  if (searchInput && q) searchInput.value = q;
  if (audienceSelect && audience) audienceSelect.value = audience;
  if (countrySelect && country) countrySelect.value = country;
  if (categorySelect && category) categorySelect.value = category;
  if (propertySelect && proptype) propertySelect.value = proptype;
  if (worksSelect && works) worksSelect.value = works;

  state.browseSearch = q.toLowerCase();
  state.browseAudience = audience;
  state.browseCountry = country;
  state.browseCategory = category;
  state.browsePropertyType = proptype;
  state.browseWorks = works;

  if (q || audience || country || category || proptype || works) renderBrowse();
}

// Derive audience tags from tenures and tenantCriteria
function getAudiences(grant) {
  const audiences = new Set();
  const landlordTenures = ['private-landlord', 'ltd-company'];
  const orgTenures = ['housing-association', 'registered-provider', 'charity'];
  (grant.tenures || []).forEach(t => {
    if (landlordTenures.includes(t)) audiences.add('landlord');
    if (orgTenures.includes(t)) audiences.add('organisation');
  });
  // Grants with tenant criteria or adaptation category target households
  if ((grant.tenantCriteria && grant.tenantCriteria.length > 0) || grant.category === 'adaptation') {
    audiences.add('household');
  }
  return [...audiences];
}

function filterGrants() {
  return state.grants.filter(g => {
    if (state.browseAudience) {
      const audiences = getAudiences(g);
      if (!audiences.includes(state.browseAudience)) return false;
    }
    if (state.browseCountry && !g.countries.includes(state.browseCountry)) return false;
    if (state.browseCategory && g.category !== state.browseCategory) return false;
    if (state.browsePropertyType && !g.propertyTypes.includes(state.browsePropertyType)) return false;
    if (state.browseWorks && !g.worksCovered.includes(state.browseWorks)) return false;
    if (state.browseSearch) {
      const haystack = (g.name + ' ' + g.provider + ' ' + g.shortDescription).toLowerCase();
      if (!haystack.includes(state.browseSearch)) return false;
    }
    return true;
  });
}

function renderBrowse() {
  const filtered = filterGrants();
  const countEl = document.getElementById('gf-browse-count');
  if (countEl) {
    countEl.innerHTML = `Showing <strong>${filtered.length}</strong> of <strong>${state.grants.length}</strong> schemes`;
  }

  const listEl = document.getElementById('gf-browse-list');
  if (!listEl) return;

  if (filtered.length === 0) {
    listEl.innerHTML = renderNoResults();
    return;
  }

  listEl.innerHTML = filtered.map(g => renderSchemeCard(g, 'browse')).join('');
  attachCardHandlers(listEl);
}

/* ============================================================
   SCHEME CARD RENDERER
   ============================================================ */
const CATEGORY_ICONS = {
  'retrofit':          '',
  'adaptation':        '',
  'empty-homes':       '',
  'heritage':          '',
  'affordable-housing':'',
  'supported-housing': '',
};

const CATEGORY_LABELS = {
  'retrofit':          'Retrofit / Energy',
  'adaptation':        'Disability Adaptation',
  'empty-homes':       'Empty Homes',
  'heritage':          'Heritage',
  'affordable-housing':'Affordable Housing',
  'supported-housing': 'Supported Housing',
};

function renderSchemeCard(grant, context) {
  const icon = CATEGORY_ICONS[grant.category] || '📋';
  const catLabel = CATEGORY_LABELS[grant.category] || grant.category;
  const catClass = 'cat-' + grant.category;
  const fundingText = grant.maxFunding ? `Up to £${grant.maxFunding.toLocaleString('en-GB')}` : 'See scheme page';
  const countriesText = grant.countries.map(c => capitalise(c)).join(', ');
  const deadlineText = grant.deadline ? `Deadline: ${formatDate(grant.deadline)}` : null;

  return `
    <article class="gf-scheme-card" data-grant-id="${esc(grant.id)}" data-context="${context}">
      <div class="gf-scheme-card-header" tabindex="0" role="button"
           aria-expanded="false"
           aria-label="View details for ${esc(grant.name)}">
        <div class="gf-scheme-icon ${catClass}">${icon}</div>
        <div class="gf-scheme-meta">
          <div class="gf-scheme-name">${esc(grant.name)}</div>
          <div class="gf-scheme-provider">${esc(grant.provider)}</div>
          <div class="gf-scheme-desc">${esc(grant.shortDescription)}</div>
          <div class="gf-scheme-tags">
            ${grant.countries.map(c => `<span class="gf-tag gf-tag-country">${capitalise(c)}</span>`).join('')}
            <span class="gf-tag gf-tag-category">${catLabel}</span>
            ${deadlineText ? `<span class="gf-tag gf-tag-deadline">${deadlineText}</span>` : ''}
            ${grant.verify ? `<span class="gf-tag gf-tag-verify">Verify figures</span>` : ''}
          </div>
        </div>
        <div class="gf-funding-pill">${fundingText}</div>
        <span class="gf-chevron" aria-hidden="true">▾</span>
      </div>
      <div class="gf-scheme-body" hidden>
        <p class="gf-scheme-body-desc">${esc(grant.shortDescription)}</p>
        <div class="gf-body-section">
          <h4>Eligibility summary (from official source)</h4>
          <ul>${grant.eligibilitySummary.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
        </div>
        <div class="gf-body-section">
          <h4>How to apply (signpost only  -  verify with provider)</h4>
          <ol>${grant.howToApply.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
        </div>
        ${grant.fundingNotes ? `<div class="gf-body-section"><h4>Funding notes</h4><p>${esc(grant.fundingNotes)}</p></div>` : ''}
        <div class="gf-cta-row">
          <a href="${esc(grant.officialUrl)}" target="_blank" rel="noopener noreferrer"
             class="gf-btn gf-btn-primary">
            View official scheme page ↗
          </a>
          ${grant.verify ? `<span class="gf-verify-notice">⚠ Some details could not be confirmed  -  verify on the official page</span>` : ''}
        </div>
      </div>
      <div class="gf-scheme-footer">
        <span class="gf-source-badge">Source: <a href="${esc(grant.officialUrl)}" target="_blank" rel="noopener noreferrer">${esc(grant.provider)}</a></span>
        <span class="gf-verified-badge">Last verified: ${esc(grant.lastVerified)}</span>
      </div>
    </article>
  `;
}

function renderNoResults() {
  return `
    <div class="gf-no-results">
      <div class="gf-no-results-icon">🔍</div>
      <h3>No matching schemes found</h3>
      <p>No schemes matched your current criteria. Try adjusting your selections, or browse all schemes using the Browse tab.</p>
      <div class="gf-no-results-links">
        <a href="https://www.gov.uk/improve-energy-efficiency" target="_blank" rel="noopener noreferrer"
           class="gf-btn gf-btn-outline">
          GOV.UK energy efficiency ↗
        </a>
        <a href="https://www.gov.uk/find-local-council" target="_blank" rel="noopener noreferrer"
           class="gf-btn gf-btn-ghost">
          Find your local council ↗
        </a>
      </div>
    </div>
  `;
}

/* ============================================================
   CARD EXPAND/COLLAPSE
   ============================================================ */
function attachCardHandlers(container) {
  container.querySelectorAll('.gf-scheme-card-header').forEach(header => {
    header.addEventListener('click', () => toggleCard(header));
    header.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleCard(header);
      }
    });
  });
}

function toggleCard(header) {
  const card = header.closest('.gf-scheme-card');
  const body = card.querySelector('.gf-scheme-body');
  const isOpen = card.classList.contains('open');
  card.classList.toggle('open');
  header.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
  if (body) {
    if (isOpen) {
      body.hidden = true;
    } else {
      body.hidden = false;
    }
  }
}

/* ============================================================
   MODAL (scheme detail)
   ============================================================ */
function initModal() {
  const overlay = document.getElementById('gf-modal-overlay');
  if (!overlay) return;

  const closeBtn = document.getElementById('gf-modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
}

function openModal(grantId) {
  const grant = state.grants.find(g => g.id === grantId);
  if (!grant) return;

  const overlay = document.getElementById('gf-modal-overlay');
  if (!overlay) return;

  const fundingText = grant.maxFunding
    ? `Up to £${grant.maxFunding.toLocaleString('en-GB')}`
    : 'See scheme page';

  document.getElementById('gf-modal-title').textContent = grant.name;
  document.getElementById('gf-modal-provider').textContent = grant.provider;
  document.getElementById('gf-modal-body-content').innerHTML = `
    <div class="gf-modal-meta-row">
      ${grant.countries.map(c => `<span class="gf-tag gf-tag-country">${capitalise(c)}</span>`).join('')}
      <span class="gf-tag gf-tag-category">${CATEGORY_LABELS[grant.category] || grant.category}</span>
      ${grant.deadline ? `<span class="gf-tag gf-tag-deadline">Deadline: ${formatDate(grant.deadline)}</span>` : ''}
      ${grant.verify ? `<span class="gf-tag gf-tag-verify">Verify figures</span>` : ''}
    </div>

    <div class="gf-modal-url-box">
      <p>Official source</p>
      <a href="${esc(grant.officialUrl)}" target="_blank" rel="noopener noreferrer">${esc(grant.officialUrl)}</a>
    </div>

    <div class="gf-modal-section">
      <h4>About this scheme</h4>
      <p>${esc(grant.shortDescription)}</p>
      ${grant.fundingNotes ? `<p>${esc(grant.fundingNotes)}</p>` : ''}
    </div>

    <div class="gf-modal-section">
      <h4>Eligibility summary (from official source)</h4>
      <ul>${grant.eligibilitySummary.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
    </div>

    <div class="gf-modal-section">
      <h4>How to apply (signpost only  -  verify with the provider)</h4>
      <ol>${grant.howToApply.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
    </div>

    ${grant.verify ? `<div class="gf-verify-notice" style="margin-bottom:16px">⚠ Some details in this entry could not be confirmed from the official source. Always verify on the official scheme page before acting.</div>` : ''}
  `;

  document.getElementById('gf-modal-official-link').href = grant.officialUrl;
  document.getElementById('gf-modal-funding').textContent = fundingText;
  document.getElementById('gf-modal-last-verified').textContent = `Last verified: ${grant.lastVerified}`;

  overlay.classList.add('open');
  overlay.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';

  // Focus the close button
  setTimeout(() => {
    const closeBtn = document.getElementById('gf-modal-close');
    if (closeBtn) closeBtn.focus();
  }, 50);
}

function closeModal() {
  const overlay = document.getElementById('gf-modal-overlay');
  if (overlay) {
    overlay.classList.remove('open');
    overlay.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }
}

/* ============================================================
   HELPERS
   ============================================================ */
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function capitalise(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short' });
  } catch {
    return dateStr;
  }
}
