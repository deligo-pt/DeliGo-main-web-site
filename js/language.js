// DeliGo — language switcher (modal flag-grid edition)
//
// Depends on js/language-config.js, which sets window.DELIGO_LANGS and
// window.DELIGO_LANG_REGIONS *before* this script loads.
//
// On chip click → open a centered modal with all 28 languages laid out as a
// responsive flag-tile grid grouped by region. Live search filter. Disabled
// languages render as muted "Soon" tiles. Selecting an enabled language sets
// localStorage['siteLang'] and redirects via URL-prefix swap.

(function () {
  'use strict';

  // ── Registry ─────────────────────────────────────────────────────────────
  var LANGS = (window.DELIGO_LANGS || []).filter(function (l) { return l && l.code; });
  var REGION_ORDER = window.DELIGO_LANG_REGIONS || [];
  var BY_CODE = {};
  LANGS.forEach(function (l) { BY_CODE[l.code] = l; });

  var DEFAULT_LANG = 'en';
  var STORAGE_KEY = 'siteLang';
  var BANNER_DISMISS_KEY = 'siteLangBannerDismissed';

  // UI strings the picker itself needs in the current language. Falls back
  // to English when a language is missing. Use {native} as the placeholder
  // for the preferred language name inside the suggestion banner.
  var I18N = {
    en: { title: 'Choose your language', search: 'Search languages…',  empty: 'No match',         suggest: 'View this site in {native}?',           accept: 'Switch',   dismiss: 'Dismiss', close: 'Close' },
    pt: { title: 'Escolha o seu idioma', search: 'Pesquisar idiomas…', empty: 'Sem resultados',   suggest: 'Ver este site em {native}?',            accept: 'Mudar',    dismiss: 'Dispensar', close: 'Fechar' },
    es: { title: 'Elige tu idioma',      search: 'Buscar idiomas…',    empty: 'Sin coincidencias',suggest: '¿Ver este sitio en {native}?',          accept: 'Cambiar',  dismiss: 'Descartar', close: 'Cerrar' },
    fr: { title: 'Choisissez votre langue', search: 'Rechercher des langues…', empty: 'Aucun résultat', suggest: 'Voir ce site en {native} ?',     accept: 'Changer',  dismiss: 'Ignorer', close: 'Fermer' },
    de: { title: 'Sprache auswählen',    search: 'Sprachen suchen…',   empty: 'Keine Treffer',    suggest: 'Diese Seite auf {native} anzeigen?',    accept: 'Wechseln', dismiss: 'Schließen', close: 'Schließen' },
    nl: { title: 'Kies je taal',         search: 'Talen zoeken…',      empty: 'Geen resultaten',  suggest: 'Deze site in {native} bekijken?',       accept: 'Wisselen', dismiss: 'Sluiten', close: 'Sluiten' },
    it: { title: 'Scegli la tua lingua', search: 'Cerca lingue…',      empty: 'Nessun risultato', suggest: 'Visualizza questo sito in {native}?',   accept: 'Cambia',   dismiss: 'Chiudi', close: 'Chiudi' },
    sv: { title: 'Välj språk',           search: 'Sök språk…',         empty: 'Inga träffar',     suggest: 'Visa denna webbplats på {native}?',     accept: 'Byt',      dismiss: 'Stäng', close: 'Stäng' },
    da: { title: 'Vælg dit sprog',       search: 'Søg sprog…',         empty: 'Ingen match',      suggest: 'Vis dette websted på {native}?',        accept: 'Skift',    dismiss: 'Luk', close: 'Luk' },
    fi: { title: 'Valitse kielesi',      search: 'Etsi kieliä…',       empty: 'Ei osumia',        suggest: 'Näytä tämä sivusto kielellä {native}?', accept: 'Vaihda',   dismiss: 'Sulje', close: 'Sulje' },
    no: { title: 'Velg språk',           search: 'Søk språk…',         empty: 'Ingen treff',      suggest: 'Vis dette nettstedet på {native}?',     accept: 'Bytt',     dismiss: 'Lukk', close: 'Lukk' }
  };

  function t(code, key) {
    var bundle = I18N[code] || I18N[DEFAULT_LANG];
    return (bundle && bundle[key]) || I18N[DEFAULT_LANG][key];
  }

  // ── Storage helpers ──────────────────────────────────────────────────────
  function safeGet(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function safeSet(key, value) { try { localStorage.setItem(key, value); } catch (e) {} }

  // ── URL helpers ──────────────────────────────────────────────────────────
  function detectLangFromUrl() {
    var segs = window.location.pathname.split('/').filter(Boolean);
    if (segs.length && BY_CODE[segs[0]] && segs[0] !== 'en') return segs[0];
    return 'en';
  }

  function stripLangPrefix(pathname) {
    var segs = pathname.split('/').filter(Boolean);
    if (segs.length && BY_CODE[segs[0]] && segs[0] !== 'en') segs.shift();
    return '/' + segs.join('/');
  }

  function buildLangUrl(targetCode) {
    var base = stripLangPrefix(window.location.pathname);
    if (targetCode === 'en') return base + window.location.search + window.location.hash;
    if (base === '/' || base === '') base = '/index.html';
    return '/' + targetCode + base + window.location.search + window.location.hash;
  }

  function flagSrc(flagCode) {
    var isInLangFolder = /^\/[a-z]{2}(-[a-z]{2})?\//i.test(window.location.pathname);
    return (isInLangFolder ? '/' : '') + 'images/flags/' + flagCode + '.svg';
  }

  // ── Trigger (navbar chip) ────────────────────────────────────────────────
  function renderTrigger(currentCode) {
    var lang = BY_CODE[currentCode] || BY_CODE[DEFAULT_LANG];
    if (!lang) return;
    var flag = document.getElementById('lang-flag');
    var label = document.getElementById('lang-label');
    if (flag) { flag.src = flagSrc(lang.flag); flag.alt = lang.label; }
    if (label) label.textContent = lang.code.toUpperCase();
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]);
    });
  }

  function groupByRegion(list) {
    var map = {};
    list.forEach(function (l) {
      var r = l.region || 'Other';
      (map[r] = map[r] || []).push(l);
    });
    var ordered = [];
    REGION_ORDER.forEach(function (r) { if (map[r]) { ordered.push([r, map[r]]); delete map[r]; } });
    Object.keys(map).sort().forEach(function (r) { ordered.push([r, map[r]]); });
    return ordered;
  }

  // ── Modal ────────────────────────────────────────────────────────────────
  var modalEl = null, modalSearchEl = null, modalListEl = null;
  var currentCode = 'en';

  function ensureModal() {
    if (modalEl) return modalEl;
    modalEl = document.createElement('div');
    modalEl.className = 'lang-modal-backdrop';
    modalEl.setAttribute('hidden', '');
    modalEl.innerHTML =
      '<div class="lang-modal" role="dialog" aria-modal="true" aria-labelledby="lang-modal-title">'
    +   '<div class="lang-modal-header">'
    +     '<h2 id="lang-modal-title" class="lang-modal-title">' + escapeHtml(t(currentCode, 'title')) + '</h2>'
    +     '<button type="button" class="lang-modal-close" aria-label="' + escapeHtml(t(currentCode, 'close')) + '">'
    +       '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" aria-hidden="true">'
    +         '<path d="M6 6 L18 18 M18 6 L6 18"/>'
    +       '</svg>'
    +     '</button>'
    +   '</div>'
    +   '<div class="lang-modal-search-wrap">'
    +     '<input type="search" class="lang-modal-search" placeholder="' + escapeHtml(t(currentCode, 'search')) + '" aria-label="' + escapeHtml(t(currentCode, 'search')) + '" autocomplete="off" />'
    +   '</div>'
    +   '<div class="lang-modal-list"></div>'
    + '</div>';
    document.body.appendChild(modalEl);
    modalSearchEl = modalEl.querySelector('.lang-modal-search');
    modalListEl = modalEl.querySelector('.lang-modal-list');

    modalEl.querySelector('.lang-modal-close').addEventListener('click', closeModal);
    modalEl.addEventListener('click', function (e) { if (e.target === modalEl) closeModal(); });
    modalSearchEl.addEventListener('input', function () { renderTiles(modalSearchEl.value); });
    modalListEl.addEventListener('click', function (e) {
      var tile = e.target.closest && e.target.closest('.lang-modal-tile');
      if (!tile || tile.disabled) return;
      var code = tile.getAttribute('data-lang');
      var cfg = code && BY_CODE[code];
      if (!cfg || !cfg.enabled) return;
      safeSet(STORAGE_KEY, code);
      if (code === currentCode) { closeModal(); return; }
      window.location.href = buildLangUrl(code);
    });
    return modalEl;
  }

  function openModal() {
    ensureModal();
    modalSearchEl.value = '';
    renderTiles('');
    modalEl.removeAttribute('hidden');
    document.body.classList.add('lang-modal-open');
    var trigger = document.getElementById('current-language');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    setTimeout(function () { modalSearchEl.focus(); }, 60);
  }

  function closeModal() {
    if (!modalEl) return;
    modalEl.setAttribute('hidden', '');
    document.body.classList.remove('lang-modal-open');
    var trigger = document.getElementById('current-language');
    if (trigger) { trigger.setAttribute('aria-expanded', 'false'); trigger.focus(); }
  }

  function isModalOpen() {
    return modalEl && !modalEl.hasAttribute('hidden');
  }

  function renderTiles(query) {
    var q = (query || '').trim().toLowerCase();
    var filtered = LANGS;
    if (q) {
      filtered = LANGS.filter(function (l) {
        return l.label.toLowerCase().indexOf(q) !== -1
            || l.native.toLowerCase().indexOf(q) !== -1
            || l.code.toLowerCase().indexOf(q) !== -1;
      });
    }
    if (!filtered.length) {
      modalListEl.innerHTML = '<div class="lang-modal-empty">' + escapeHtml(t(currentCode, 'empty')) + '</div>';
      return;
    }
    var html = '';
    groupByRegion(filtered).forEach(function (entry) {
      var region = entry[0], langs = entry[1];
      html += '<div class="lang-modal-region">' + escapeHtml(region) + '</div>';
      html += '<div class="lang-modal-grid">';
      langs.forEach(function (l) {
        var cls = ['lang-modal-tile'];
        if (l.code === currentCode) cls.push('is-active');
        if (!l.enabled) cls.push('is-disabled');
        html += '<button type="button" class="' + cls.join(' ') + '"'
              + ' data-lang="' + escapeHtml(l.code) + '"'
              + (l.enabled ? '' : ' disabled aria-disabled="true"')
              + '>';
        html +=   '<img class="lang-modal-tile-flag" src="' + flagSrc(l.flag) + '" alt="" />';
        html +=   '<span class="lang-modal-tile-native">' + escapeHtml(l.native) + '</span>';
        html +=   '<span class="lang-modal-tile-meta">' + escapeHtml(l.label) + '</span>';
        if (l.code === currentCode) {
          html += '<span class="lang-modal-tile-check" aria-hidden="true">'
                +   '<svg viewBox="0 0 24 24" width="11" height="11" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">'
                +     '<polyline points="5 13 10 18 19 7"/>'
                +   '</svg>'
                + '</span>';
        } else if (!l.enabled) {
          html += '<span class="lang-modal-tile-badge">Soon</span>';
        }
        html += '</button>';
      });
      html += '</div>';
    });
    modalListEl.innerHTML = html;
  }

  // ── Suggestion banner (first-visit auto-detect) ─────────────────────────
  function detectPreferredLang() {
    var candidates = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''])
      .map(function (s) { return (s || '').toLowerCase().split('-')[0]; });
    for (var i = 0; i < candidates.length; i++) {
      var c = candidates[i];
      if (c && BY_CODE[c] && BY_CODE[c].enabled) return c;
    }
    return null;
  }

  function maybeShowSuggestionBanner(curr) {
    if (safeGet(STORAGE_KEY)) return;
    if (safeGet(BANNER_DISMISS_KEY) === '1') return;
    var pref = detectPreferredLang();
    if (!pref || pref === curr) return;
    var preferred = BY_CODE[pref];
    if (!preferred) return;

    var banner = document.createElement('div');
    banner.className = 'lang-suggest';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Language suggestion');
    var suggestText = t(curr, 'suggest').replace('{native}', '<strong>' + escapeHtml(preferred.native) + '</strong>');
    banner.innerHTML =
        '<img class="lang-suggest-flag" src="' + flagSrc(preferred.flag) + '" alt="" width="24" height="16" />'
      + '<span class="lang-suggest-text">' + suggestText + '</span>'
      + '<button type="button" class="lang-suggest-accept">' + escapeHtml(t(curr, 'accept')) + '</button>'
      + '<button type="button" class="lang-suggest-dismiss" aria-label="' + escapeHtml(t(curr, 'dismiss')) + '">×</button>';
    document.body.appendChild(banner);

    banner.querySelector('.lang-suggest-accept').addEventListener('click', function () {
      safeSet(STORAGE_KEY, pref);
      safeSet(BANNER_DISMISS_KEY, '1');
      window.location.href = buildLangUrl(pref);
    });
    banner.querySelector('.lang-suggest-dismiss').addEventListener('click', function () {
      safeSet(BANNER_DISMISS_KEY, '1');
      banner.parentNode && banner.parentNode.removeChild(banner);
    });
  }

  // ── Wire up ──────────────────────────────────────────────────────────────
  function init() {
    if (!LANGS.length) return;
    var trigger = document.getElementById('current-language');
    if (!trigger) return;

    currentCode = detectLangFromUrl();
    renderTrigger(currentCode);

    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      isModalOpen() ? closeModal() : openModal();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isModalOpen()) closeModal();
    });

    if (currentCode === 'en') {
      setTimeout(function () { maybeShowSuggestionBanner(currentCode); }, 800);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
