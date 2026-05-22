// Brand-term protection. Loads glossary.json and exposes a `maskGlossary`
// helper that replaces protected substrings with opaque sentinel tokens before
// translation, plus a `restore` closure to put them back afterwards.
//
// Token format `§§G<n>§§` is intentionally weird so neither the translator nor
// the surrounding copy can ever introduce a token-shaped substring of its own.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let glossaryCache = null;

async function loadGlossary() {
  if (glossaryCache) return glossaryCache;
  const raw = await fs.readFile(path.join(__dirname, 'glossary.json'), 'utf8');
  const parsed = JSON.parse(raw);
  // Longer literals first so 'DeliGo Ride' is masked before 'DeliGo'.
  const literals = [...(parsed.literal || [])].sort((a, b) => b.length - a.length);
  const patterns = (parsed.patterns || []).map((p) => new RegExp(p, 'g'));
  glossaryCache = { literals, patterns };
  return glossaryCache;
}

export async function maskGlossary(text) {
  const { literals, patterns } = await loadGlossary();
  const restoreMap = [];

  let masked = text;

  for (const pattern of patterns) {
    masked = masked.replace(pattern, (m) => {
      const token = `§§G${restoreMap.length}§§`;
      restoreMap.push(m);
      return token;
    });
  }

  for (const literal of literals) {
    if (!literal) continue;
    let idx;
    while ((idx = masked.indexOf(literal)) !== -1) {
      const token = `§§G${restoreMap.length}§§`;
      restoreMap.push(literal);
      masked = masked.slice(0, idx) + token + masked.slice(idx + literal.length);
    }
  }

  function restore(s) {
    if (typeof s !== 'string') return s;
    return s.replace(/§§G(\d+)§§/g, (_, n) => {
      const v = restoreMap[Number(n)];
      return v === undefined ? '' : v;
    });
  }

  return { masked, restore };
}

// True if the masked string still contains real translatable content (a letter
// that isn't part of a sentinel). If false, sending it to the provider is a
// waste — restore returns the original verbatim.
export function hasRealText(masked) {
  const stripped = masked.replace(/§§G\d+§§/g, '');
  return /[A-Za-z]/.test(stripped);
}
