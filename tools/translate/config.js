// Pipeline configuration. Source of truth for languages, paths, and the lists
// of attributes / element types the translator does or does not touch.
//
// Phase 2 ships only `pt` enabled. Phase 4 will flip the rest on after the
// DeepL Pro key is in place.

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const TOOL_DIR = __dirname;
export const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
export const CACHE_DIR = path.join(__dirname, 'cache');

export const SOURCE_LANG = 'en';

// `deeplCode` is what DeepL expects for the `target_lang` parameter.
// `mymemoryCode` is what MyMemory expects in the `langpair` parameter.
// `enabled` controls whether `--all` will pick this language up.
// `flag` mirrors the language-config.js flag code so the rewriter can stamp
// the correct default flag SVG on the navbar's #lang-flag element.
export const LANGUAGES = {
  // ── Phase 2 + Phase 4 (batches 4a-4c) — enabled ────────────────────────
  pt: { name: 'Português',  flag: 'pt',    deeplCode: 'pt-PT', mymemoryCode: 'pt-PT', enabled: true  },
  es: { name: 'Español',    flag: 'es',    deeplCode: 'es',    mymemoryCode: 'es-ES', enabled: true  },
  fr: { name: 'Français',   flag: 'fr',    deeplCode: 'fr',    mymemoryCode: 'fr-FR', enabled: true  },
  de: { name: 'Deutsch',    flag: 'de',    deeplCode: 'de',    mymemoryCode: 'de-DE', enabled: true  },
  nl: { name: 'Nederlands', flag: 'nl',    deeplCode: 'nl',    mymemoryCode: 'nl-NL', enabled: true  },
  it: { name: 'Italiano',   flag: 'it',    deeplCode: 'it',    mymemoryCode: 'it-IT', enabled: true  },
  sv: { name: 'Svenska',    flag: 'se',    deeplCode: 'sv',    mymemoryCode: 'sv-SE', enabled: true  },
  da: { name: 'Dansk',      flag: 'dk',    deeplCode: 'da',    mymemoryCode: 'da-DK', enabled: true  },
  fi: { name: 'Suomi',      flag: 'fi',    deeplCode: 'fi',    mymemoryCode: 'fi-FI', enabled: true  },
  no: { name: 'Norsk',      flag: 'no',    deeplCode: 'nb',    mymemoryCode: 'no-NO', enabled: true  },

  // ── Phase 4 (batch 4d) — pending DeepL Pro / next month's Free quota ──
  pl: { name: 'Polski',     flag: 'pl',    deeplCode: 'pl',    mymemoryCode: 'pl-PL', enabled: false },
  cs: { name: 'Čeština',    flag: 'cz',    deeplCode: 'cs',    mymemoryCode: 'cs-CZ', enabled: false },
  ro: { name: 'Română',     flag: 'ro',    deeplCode: 'ro',    mymemoryCode: 'ro-RO', enabled: false },
  hu: { name: 'Magyar',     flag: 'hu',    deeplCode: 'hu',    mymemoryCode: 'hu-HU', enabled: false },
  el: { name: 'Ελληνικά',   flag: 'gr',    deeplCode: 'el',    mymemoryCode: 'el-GR', enabled: false },
  bg: { name: 'Български',  flag: 'bg',    deeplCode: 'bg',    mymemoryCode: 'bg-BG', enabled: false },
  sk: { name: 'Slovenčina', flag: 'sk',    deeplCode: 'sk',    mymemoryCode: 'sk-SK', enabled: false },
  sl: { name: 'Slovenščina',flag: 'si',    deeplCode: 'sl',    mymemoryCode: 'sl-SI', enabled: false },
  et: { name: 'Eesti',      flag: 'ee',    deeplCode: 'et',    mymemoryCode: 'et-EE', enabled: false },
  lt: { name: 'Lietuvių',   flag: 'lt',    deeplCode: 'lt',    mymemoryCode: 'lt-LT', enabled: false },
  lv: { name: 'Latviešu',   flag: 'lv',    deeplCode: 'lv',    mymemoryCode: 'lv-LV', enabled: false },
  tr: { name: 'Türkçe',     flag: 'tr',    deeplCode: 'tr',    mymemoryCode: 'tr-TR', enabled: false },
  uk: { name: 'Українська', flag: 'ua',    deeplCode: 'uk',    mymemoryCode: 'uk-UA', enabled: false },
};

// Attribute selectors. Each entry is read with $(selector).attr(attr) and
// rewritten in place. Add new entries here if pages introduce new user-visible
// attributes.
export const TRANSLATABLE_ATTRS = [
  { selector: 'img[alt]', attr: 'alt' },
  { selector: '[title]', attr: 'title' },
  { selector: '[aria-label]', attr: 'aria-label' },
  { selector: '[placeholder]', attr: 'placeholder' },
  { selector: 'input[value][type="submit"]', attr: 'value' },
  { selector: 'input[value][type="button"]', attr: 'value' },
  { selector: 'meta[name="description"]', attr: 'content' },
  { selector: 'meta[name="keywords"]', attr: 'content' },
  { selector: 'meta[property="og:title"]', attr: 'content' },
  { selector: 'meta[property="og:description"]', attr: 'content' },
  { selector: 'meta[name="twitter:title"]', attr: 'content' },
  { selector: 'meta[name="twitter:description"]', attr: 'content' },
];

// Element types whose text content is never touched (code, scripts, etc).
export const SKIP_ELEMENTS = new Set([
  'script', 'style', 'noscript', 'code', 'pre', 'svg',
]);

// Path prefixes that get rewritten from relative → absolute when copying the
// page into /<lang>/.
export const ASSET_PREFIXES = ['images/', 'css/', 'js/', 'webfonts/', 'fonts/'];
