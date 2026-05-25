// Post-translation normalizer for European Portuguese (pt-PT).
//
// DeepL with target_lang=pt-PT still produces output that mixes:
//   1. Pre-1990 and post-1990 orthographic standards (Acordo Ortográfico).
//   2. Context-bad word choices for brand sub-product names ("Cookies" →
//      "Biscoitos", "Rider" → "Cavaleiro", "Cab" → "Cabina", "Rides" →
//      "Passeios"). The wrong sense leaks in because the source HTML uses
//      these as standalone nav/footer links with no surrounding context.
//   3. Occasional Brazilian-Portuguese constructions ("fazendo entregas"
//      gerund where pt-PT prefers "a fazer entregas").
//
// This module is applied after the translator returns and after glossary
// sentinels are restored, so it sees the final user-visible text.

// Replacements are applied in order. Each entry is { find, replace, kind }:
//   kind: 'literal'      → exact (case-sensitive) substring replace
//   kind: 'caseAware'    → case-insensitive match with case preservation of
//                          the leading character (so "Actualiza" → "Atualiza"
//                          and "actualiza" → "atualiza")
//
// Order matters: longer prefixes first prevent a shorter rule from chewing
// into a word that a longer rule should own (e.g. "actualiz" runs before
// the bare "actual").
const REPLACEMENTS = [
  // ── Pre-1990 → current post-1990 PT-PT orthography ────────────────────
  // Each pre-AO spelling drops a silent consonant (c/p) before t/c.
  { find: 'electrónic',  replace: 'eletrónic',  kind: 'caseAware' }, // electrónico/a/os/as
  { find: 'actualiz',    replace: 'atualiz',    kind: 'caseAware' }, // actualizar, actualização, actualizado
  { find: 'actualmente', replace: 'atualmente', kind: 'caseAware' },
  { find: 'actualidade', replace: 'atualidade', kind: 'caseAware' },
  { find: 'actuais',     replace: 'atuais',     kind: 'caseAware' },
  { find: 'actual',      replace: 'atual',      kind: 'caseAware' }, // bare adjective — must come after the above
  { find: 'objectiv',    replace: 'objetiv',    kind: 'caseAware' }, // objectivo/a/os/as
  { find: 'exactament',  replace: 'exatament',  kind: 'caseAware' }, // exactamente
  { find: 'exact',       replace: 'exat',       kind: 'caseAware' }, // exacto/a/os/as
  { find: 'óptim',       replace: 'ótim',       kind: 'caseAware' }, // óptimo/a/os/as
  { find: 'optimiz',     replace: 'otimiz',     kind: 'caseAware' }, // optimizar, optimização, optimizado
  { find: 'adopção',     replace: 'adoção',     kind: 'caseAware' },
  { find: 'adopt',       replace: 'adot',       kind: 'caseAware' }, // adoptar, adoptado/a
  { find: 'directament', replace: 'diretament', kind: 'caseAware' }, // directamente, indirectamente
  { find: 'direcção',    replace: 'direção',    kind: 'caseAware' },
  { find: 'direct',      replace: 'diret',      kind: 'caseAware' }, // directo/a, director (also catches "indirect")
  { find: 'correctament',replace: 'corretament',kind: 'caseAware' },
  { find: 'colectiv',    replace: 'coletiv',    kind: 'caseAware' },
  { find: 'reflect',     replace: 'reflet',     kind: 'caseAware' },
  { find: 'perspectiv',  replace: 'perspetiv',  kind: 'caseAware' },
  // cç → ç (silent c, dropped post-AO 1990). "secção" intentionally NOT
  // listed: in PT-PT it remains "secção" since the c is pronounced.
  { find: 'acções',      replace: 'ações',      kind: 'caseAware' },
  { find: 'acção',       replace: 'ação',       kind: 'caseAware' },
  { find: 'protecções',  replace: 'proteções',  kind: 'caseAware' }, // also catches multiprotecções
  { find: 'protecção',   replace: 'proteção',   kind: 'caseAware' }, // also catches multiprotecção
  { find: 'projecções',  replace: 'projeções',  kind: 'caseAware' },
  { find: 'projecção',   replace: 'projeção',   kind: 'caseAware' },
  { find: 'transacções', replace: 'transações', kind: 'caseAware' },
  { find: 'transacção',  replace: 'transação',  kind: 'caseAware' },
  { find: 'inspecções',  replace: 'inspeções',  kind: 'caseAware' },
  { find: 'inspecção',   replace: 'inspeção',   kind: 'caseAware' },
  { find: 'inspeccion',  replace: 'inspecion',  kind: 'caseAware' }, // inspeccionar, inspeccionado/a/s

  // ── Context-aware brand sub-product fixes ─────────────────────────────
  // These specific noun forms only show up because DeepL re-translated the
  // bare English brand words ("Cookies", "Rider", "Cab", "Rides") with the
  // wrong sense. The pt-PT site has no legitimate horseback-knight or
  // cockpit-cabin context, so a global swap is safe.
  { find: 'Biscoitos',   replace: 'Cookies',    kind: 'literal' },  // legal cookies link
  { find: 'biscoitos',   replace: 'cookies',    kind: 'literal' },
  { find: 'Cavaleiros',  replace: 'Estafetas',  kind: 'literal' },  // delivery riders, not knights
  { find: 'Cavaleiro',   replace: 'Estafeta',   kind: 'literal' },
  { find: 'cavaleiros',  replace: 'estafetas',  kind: 'literal' },
  { find: 'cavaleiro',   replace: 'estafeta',   kind: 'literal' },
  { find: 'Cabinas',     replace: 'Táxis',      kind: 'literal' },  // taxi cabs, not cabin compartments
  { find: 'Cabina',      replace: 'Táxi',       kind: 'literal' },
  { find: 'cabinas',     replace: 'táxis',      kind: 'literal' },
  { find: 'cabina',      replace: 'táxi',       kind: 'literal' },

  // "Passeios" is DeepL's default for the "Rides" product. Capitalized
  // instances are always headings/links referring to the product. The bare
  // lowercase form is ambiguous (it can also mean "sidewalks"), so we only
  // touch lowercase mentions when they sit next to other product names —
  // "passeios, comida", "passeios e comida", "Plus: passeios", etc. The
  // remaining sidewalks-sense usage stays untouched.
  { find: 'Passeios',                 replace: 'Viagens',                  kind: 'literal' },
  { find: 'passeios, comida',         replace: 'viagens, comida',          kind: 'literal' },
  { find: 'passeios e comida',        replace: 'viagens e comida',         kind: 'literal' },
  { find: 'passeios e regalias',      replace: 'viagens e regalias',       kind: 'literal' },
  { find: 'próximos passeios',        replace: 'próximas viagens',         kind: 'literal' }, // masculine→feminine
  { find: 'em passeios, ',            replace: 'em viagens, ',             kind: 'literal' },
  { find: 'para passeios,',           replace: 'para viagens,',            kind: 'literal' },
  { find: 'Plus: passeios',           replace: 'Plus: viagens',            kind: 'literal' },

  // ── Brazilian → European Portuguese ───────────────────────────────────
  // "fazendo entregas" (BR gerund) → "a fazer entregas" (PT estar+a+infinitive)
  { find: 'fazendo entregas', replace: 'a fazer entregas', kind: 'literal' },
];

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function preserveLeadingCase(match, replacement) {
  if (!match || !replacement) return replacement;
  const first = match[0];
  // Only flip case of the replacement's first char if both sides have an
  // alphabetic leading char and the case actually differs.
  if (first.toUpperCase() === first && first.toLowerCase() !== first) {
    return replacement[0].toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

function applyCaseAware(text, find, replace) {
  const re = new RegExp(escapeRegExp(find), 'gi');
  return text.replace(re, (match) => preserveLeadingCase(match, replace));
}

function applyLiteral(text, find, replace) {
  // Plain split/join is faster than a regex and avoids escaping pitfalls.
  if (text.indexOf(find) === -1) return text;
  return text.split(find).join(replace);
}

export function normalize(text) {
  if (typeof text !== 'string' || !text) return text;
  let out = text;
  for (const rule of REPLACEMENTS) {
    if (rule.kind === 'caseAware') out = applyCaseAware(out, rule.find, rule.replace);
    else out = applyLiteral(out, rule.find, rule.replace);
  }
  return out;
}

export default normalize;
