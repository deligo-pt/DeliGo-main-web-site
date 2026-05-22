// DeliGo language registry. Source of truth for which languages the switcher
// renders and which two-letter code maps to which flag and folder.
//
// `enabled: true` means: a translated /<code>/ folder exists in production and
// the switcher should show it. Flip to true as new languages are rolled out in
// Phase 4 (Tier 1) and Phase 5 (Tier 2).
//
// `flag` is the ISO 3166-1 alpha-2 country code as found in /images/flags/<flag>.svg.
//
// `region` is used by the picker UI to group entries under a header. Keep the
// strings stable — language.js groups by exact-string match.

window.DELIGO_LANGS = [
  // ─── Western Europe ────────────────────────────────────────────────
  { code: 'en', label: 'English',     native: 'English',         flag: 'gb',    region: 'Western Europe',  enabled: true  },
  { code: 'fr', label: 'French',      native: 'Français',        flag: 'fr',    region: 'Western Europe',  enabled: true  },
  { code: 'de', label: 'German',      native: 'Deutsch',         flag: 'de',    region: 'Western Europe',  enabled: true  },
  { code: 'nl', label: 'Dutch',       native: 'Nederlands',      flag: 'nl',    region: 'Western Europe',  enabled: true  },
  { code: 'ga', label: 'Irish',       native: 'Gaeilge',         flag: 'ie',    region: 'Western Europe',  enabled: false },

  // ─── Southern Europe ───────────────────────────────────────────────
  { code: 'pt', label: 'Portuguese',  native: 'Português',       flag: 'pt',    region: 'Southern Europe', enabled: true  },
  { code: 'es', label: 'Spanish',     native: 'Español',         flag: 'es',    region: 'Southern Europe', enabled: true  },
  { code: 'it', label: 'Italian',     native: 'Italiano',        flag: 'it',    region: 'Southern Europe', enabled: true  },
  { code: 'ca', label: 'Catalan',     native: 'Català',          flag: 'es-ct', region: 'Southern Europe', enabled: false },
  { code: 'el', label: 'Greek',       native: 'Ελληνικά',        flag: 'gr',    region: 'Southern Europe', enabled: false },
  { code: 'tr', label: 'Turkish',     native: 'Türkçe',          flag: 'tr',    region: 'Southern Europe', enabled: false },

  // ─── Northern Europe ───────────────────────────────────────────────
  { code: 'sv', label: 'Swedish',     native: 'Svenska',         flag: 'se',    region: 'Northern Europe', enabled: true  },
  { code: 'da', label: 'Danish',      native: 'Dansk',           flag: 'dk',    region: 'Northern Europe', enabled: true  },
  { code: 'no', label: 'Norwegian',   native: 'Norsk',           flag: 'no',    region: 'Northern Europe', enabled: true  },
  { code: 'fi', label: 'Finnish',     native: 'Suomi',           flag: 'fi',    region: 'Northern Europe', enabled: true  },
  { code: 'et', label: 'Estonian',    native: 'Eesti',           flag: 'ee',    region: 'Northern Europe', enabled: false },
  { code: 'lv', label: 'Latvian',     native: 'Latviešu',        flag: 'lv',    region: 'Northern Europe', enabled: false },
  { code: 'lt', label: 'Lithuanian',  native: 'Lietuvių',        flag: 'lt',    region: 'Northern Europe', enabled: false },

  // ─── Central Europe ────────────────────────────────────────────────
  { code: 'pl', label: 'Polish',      native: 'Polski',          flag: 'pl',    region: 'Central Europe',  enabled: false },
  { code: 'cs', label: 'Czech',       native: 'Čeština',         flag: 'cz',    region: 'Central Europe',  enabled: false },
  { code: 'sk', label: 'Slovak',      native: 'Slovenčina',      flag: 'sk',    region: 'Central Europe',  enabled: false },
  { code: 'hu', label: 'Hungarian',   native: 'Magyar',          flag: 'hu',    region: 'Central Europe',  enabled: false },
  { code: 'sl', label: 'Slovenian',   native: 'Slovenščina',     flag: 'si',    region: 'Central Europe',  enabled: false },

  // ─── Eastern Europe ────────────────────────────────────────────────
  { code: 'ro', label: 'Romanian',    native: 'Română',          flag: 'ro',    region: 'Eastern Europe',  enabled: false },
  { code: 'bg', label: 'Bulgarian',   native: 'Български',       flag: 'bg',    region: 'Eastern Europe',  enabled: false },
  { code: 'uk', label: 'Ukrainian',   native: 'Українська',      flag: 'ua',    region: 'Eastern Europe',  enabled: false },
  { code: 'hr', label: 'Croatian',    native: 'Hrvatski',        flag: 'hr',    region: 'Eastern Europe',  enabled: false },
  { code: 'sr', label: 'Serbian',     native: 'Srpski',          flag: 'rs',    region: 'Eastern Europe',  enabled: false },
];

// Region rendering order. Anything not in this list goes to the end alphabetically.
window.DELIGO_LANG_REGIONS = [
  'Western Europe',
  'Southern Europe',
  'Northern Europe',
  'Central Europe',
  'Eastern Europe',
];
