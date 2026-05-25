// One-shot CLI that walks an existing /<lang>/ folder and applies the
// language-specific normalizer to every visible text node and translatable
// attribute. No translation API is called — this only rewrites text that is
// already in the target language.
//
// Use it to retro-fix translated output after adding new orthographic or
// brand-context rules to a normalizer, without burning translator quota.
//
//   node tools/translate/normalize-pages.js --lang pt
//   node tools/translate/normalize-pages.js --lang pt --only index.html
//   node tools/translate/normalize-pages.js --lang pt --dry-run
//
// --dry-run prints a per-file count of strings the normalizer would touch
// but does not write anything back.

import fs from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';

import { PROJECT_ROOT, LANGUAGES, TRANSLATABLE_ATTRS, SKIP_ELEMENTS } from './config.js';
import { getNormalizer } from './normalizers/index.js';

function parseArgs(argv) {
  const args = { lang: null, only: null, dryRun: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--lang') args.lang = argv[++i];
    else if (a === '--only') args.only = argv[++i];
    else if (a === '--dry-run') args.dryRun = true;
    else if (a === '--help' || a === '-h') {
      console.log(`Usage:
  node normalize-pages.js --lang <code>             apply normalizer to /<code>/*.html
  node normalize-pages.js --lang pt --only index.html
  node normalize-pages.js --lang pt --dry-run`);
      process.exit(0);
    }
  }
  return args;
}

function isInsideSkippedElement(node) {
  let p = node.parent;
  while (p) {
    if (p.type === 'tag' && SKIP_ELEMENTS.has(p.name)) return true;
    p = p.parent;
  }
  return false;
}

function normalizeDom($, normalize) {
  let textsChanged = 0;
  let attrsChanged = 0;

  $('*').contents().each((_, el) => {
    if (el.type !== 'text') return;
    if (isInsideSkippedElement(el)) return;
    const raw = el.data || '';
    if (!raw.trim()) return;
    const next = normalize(raw);
    if (next !== raw) {
      el.data = next;
      textsChanged++;
    }
  });

  for (const { selector, attr } of TRANSLATABLE_ATTRS) {
    $(selector).each((_, el) => {
      const $el = $(el);
      const value = $el.attr(attr);
      if (!value || !value.trim()) return;
      const next = normalize(value);
      if (next !== value) {
        $el.attr(attr, next);
        attrsChanged++;
      }
    });
  }

  return { textsChanged, attrsChanged };
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.lang) {
    console.error('Missing --lang');
    process.exit(1);
  }
  if (!LANGUAGES[args.lang]) {
    console.error(`Unknown language code: ${args.lang}`);
    process.exit(1);
  }

  const normalize = getNormalizer(args.lang);
  const dir = path.join(PROJECT_ROOT, args.lang);
  const entries = await fs.readdir(dir, { withFileTypes: true });
  let pages = entries
    .filter((e) => e.isFile() && e.name.endsWith('.html'))
    .map((e) => e.name)
    .sort();
  if (args.only) pages = pages.filter((p) => p === args.only);

  let totalTexts = 0;
  let totalAttrs = 0;
  for (const page of pages) {
    const filePath = path.join(dir, page);
    const html = await fs.readFile(filePath, 'utf8');
    const $ = cheerio.load(html, { decodeEntities: false });
    const { textsChanged, attrsChanged } = normalizeDom($, normalize);
    totalTexts += textsChanged;
    totalAttrs += attrsChanged;

    if (textsChanged === 0 && attrsChanged === 0) {
      console.log(`  [${args.lang}] ${page} — no changes`);
      continue;
    }

    if (args.dryRun) {
      console.log(`  [${args.lang}] ${page} — would change ${textsChanged} texts, ${attrsChanged} attrs`);
    } else {
      await fs.writeFile(filePath, $.html(), 'utf8');
      console.log(`  [${args.lang}] ${page} — changed ${textsChanged} texts, ${attrsChanged} attrs`);
    }
  }

  console.log(`\n→ ${args.lang}: ${totalTexts} text nodes, ${totalAttrs} attrs ${args.dryRun ? 'would be ' : ''}updated across ${pages.length} pages`);
}

main().catch((e) => {
  console.error('\n[fatal]', e?.stack || e?.message || e);
  process.exit(1);
});
