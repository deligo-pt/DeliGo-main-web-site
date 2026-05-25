// Per-language post-translation normalizers. A normalizer is a function
// `text -> text` that runs after the provider returns and after glossary
// sentinels are restored. Use it to fix systematic provider quirks that
// would otherwise need re-translation — orthographic normalization, brand
// term overrides, dialect cleanup, etc.

import normalizePt from './pt.js';

const NORMALIZERS = {
  pt: normalizePt,
};

// Returns the normalizer for `lang`, or a no-op pass-through if none exists.
export function getNormalizer(lang) {
  return NORMALIZERS[lang] || ((text) => text);
}
