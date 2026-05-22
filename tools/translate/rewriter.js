// Post-translation DOM rewrites that aren't about the text itself:
// - Asset paths get absolutised (images/foo.png → /images/foo.png) so they
//   resolve correctly when the page lives in /<lang>/.
// - <html lang> reflects the target language.
// - hreflang alternates are injected for every enabled language plus x-default.

import { ASSET_PREFIXES, LANGUAGES } from './config.js';

export function rewriteAssetPaths($) {
  $('[src]').each((_, el) => {
    const $el = $(el);
    $el.attr('src', toAbsolute($el.attr('src')));
  });
  $('[href]').each((_, el) => {
    const $el = $(el);
    $el.attr('href', toAbsolute($el.attr('href')));
  });
  $('[data-src]').each((_, el) => {
    const $el = $(el);
    $el.attr('data-src', toAbsolute($el.attr('data-src')));
  });
  $('[data-bg]').each((_, el) => {
    const $el = $(el);
    $el.attr('data-bg', toAbsolute($el.attr('data-bg')));
  });
  $('meta[property="og:image"]').each((_, el) => {
    const $el = $(el);
    $el.attr('content', toAbsolute($el.attr('content')));
  });
  // Inline style="...url('images/foo.jpg')..." — common for hero backgrounds.
  $('[style]').each((_, el) => {
    const $el = $(el);
    const rewritten = rewriteUrlsInStyle($el.attr('style'));
    if (rewritten !== undefined) $el.attr('style', rewritten);
  });
}

// Matches url(...) with any quoting (or none) and rewrites the inner path
// through toAbsolute. Returns the new style string, or undefined if unchanged.
function rewriteUrlsInStyle(style) {
  if (!style || style.indexOf('url(') === -1) return undefined;
  let changed = false;
  const out = style.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (_, quote, inner) => {
    const next = toAbsolute(inner.trim());
    if (next !== inner) changed = true;
    return `url(${quote}${next}${quote})`;
  });
  return changed ? out : undefined;
}

function toAbsolute(v) {
  if (!v) return v;
  if (/^(https?:)?\/\//i.test(v)) return v;
  if (v.startsWith('/')) return v;
  if (v.startsWith('#')) return v;
  if (v.startsWith('mailto:') || v.startsWith('tel:')) return v;
  if (v.startsWith('javascript:')) return v;
  if (v.startsWith('data:')) return v;
  for (const prefix of ASSET_PREFIXES) {
    if (v.startsWith(prefix)) return '/' + v;
  }
  return v;
}

export function applyLanguageMetadata($, lang, pageName) {
  $('html').attr('lang', lang);

  $('link[rel="alternate"][hreflang]').remove();

  const head = $('head');
  head.append(`\n  <link rel="alternate" hreflang="x-default" href="/${pageName}">`);
  head.append(`\n  <link rel="alternate" hreflang="en" href="/${pageName}">`);
  for (const [code, cfg] of Object.entries(LANGUAGES)) {
    if (!cfg.enabled) continue;
    head.append(`\n  <link rel="alternate" hreflang="${code}" href="/${code}/${pageName}">`);
  }
}

// Stamp the navbar switcher's default flag image and trigger label so the
// page boots with the correct language indicator without JS having to swap it.
export function setSwitcherDefaults($, lang) {
  const cfg = LANGUAGES[lang];
  if (!cfg) return;
  const flag = $('#lang-flag');
  if (flag.length) {
    flag.attr('src', `/images/flags/${cfg.flag}.svg`);
    flag.attr('alt', cfg.name);
  }
  const label = $('#lang-label');
  if (label.length) label.text(lang.toUpperCase());
}
