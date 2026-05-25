// CLI entrypoint. Usage:
//   node translate.js --lang pt
//   node translate.js --all
//   node translate.js --lang pt --estimate
//   node translate.js --lang pt --provider mymemory
//   node translate.js --lang pt --only index.html
//   node translate.js --lang pt --limit 3
//
// Loads tools/translate/.env automatically.

import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';

import { PROJECT_ROOT, LANGUAGES } from './config.js';
import { loadCache, saveCache, cacheGet, cacheSet } from './cache.js';
import { maskGlossary, hasRealText } from './glossary.js';
import { parsePage } from './extractor.js';
import { rewriteAssetPaths, applyLanguageMetadata, setSwitcherDefaults } from './rewriter.js';
import { getProvider } from './providers/index.js';
import { getNormalizer } from './normalizers/index.js';

// Skip pure punctuation / pure numeric / single-letter junk.
function isTranslatable(text) {
  return /[A-Za-z]/.test(text);
}

async function listSourcePages() {
  const entries = await fs.readdir(PROJECT_ROOT, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith('.html'))
    .map((e) => e.name)
    .sort();
}

function parseArgs(argv) {
  const args = {
    lang: null,
    all: false,
    estimate: false,
    provider: 'deepl',
    limit: null,
    only: null,
    verbose: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--lang') args.lang = argv[++i];
    else if (a === '--all') args.all = true;
    else if (a === '--estimate') args.estimate = true;
    else if (a === '--provider') args.provider = argv[++i];
    else if (a === '--limit') args.limit = Number(argv[++i]);
    else if (a === '--only') args.only = argv[++i];
    else if (a === '--verbose' || a === '-v') args.verbose = true;
    else if (a === '--help' || a === '-h') { printUsage(); process.exit(0); }
  }
  return args;
}

function printUsage() {
  console.log(`Usage:
  node translate.js --lang <code>          translate one language
  node translate.js --all                  translate every LANGUAGES[*].enabled = true
  node translate.js --lang pt --estimate   count new chars without calling the API
  node translate.js --lang pt --only index.html
  node translate.js --lang pt --limit 3    first N pages only
  node translate.js --provider mymemory    use the free dev provider`);
}

async function translateForLang(lang, provider, opts) {
  const langCfg = LANGUAGES[lang];
  if (!langCfg) throw new Error(`Unknown language code: ${lang}`);

  const cache = await loadCache(lang);
  const normalize = getNormalizer(lang);
  const outDir = path.join(PROJECT_ROOT, lang);
  await fs.mkdir(outDir, { recursive: true });

  let pages = await listSourcePages();
  if (opts.only) pages = pages.filter((p) => p === opts.only);
  if (opts.limit) pages = pages.slice(0, opts.limit);

  let totalNewChars = 0;
  let totalCacheHits = 0;
  let totalCacheMisses = 0;
  const newUnique = new Set();

  for (const page of pages) {
    process.stdout.write(`  [${lang}] ${page} `);
    const srcPath = path.join(PROJECT_ROOT, page);
    const html = await fs.readFile(srcPath, 'utf8');
    const { $, jobs } = parsePage(html);

    // Pre-process every job into { masked, restore } and decide whether it
    // hits the cache, can be skipped, or needs the provider.
    const prepared = [];
    const pendingMasked = new Set();
    for (const job of jobs) {
      const text = job.getText();
      if (!isTranslatable(text)) {
        prepared.push({ job, skip: true });
        continue;
      }
      const { masked, restore } = await maskGlossary(text);
      if (!hasRealText(masked)) {
        prepared.push({ job, skip: false, masked, restore, brandOnly: true });
        continue;
      }
      const cached = cacheGet(cache, masked);
      if (cached !== undefined) {
        totalCacheHits++;
        prepared.push({ job, skip: false, masked, restore, translated: cached });
      } else {
        totalCacheMisses++;
        totalNewChars += masked.length;
        newUnique.add(masked);
        pendingMasked.add(masked);
        prepared.push({ job, skip: false, masked, restore, pending: true });
      }
    }

    if (opts.estimate) {
      process.stdout.write(`(estimate) +${pendingMasked.size} new strings, ${totalNewChars} chars cum.\n`);
      continue;
    }

    // Translate misses in chunks.
    const queue = [...pendingMasked];
    const CHUNK = 40;
    for (let i = 0; i < queue.length; i += CHUNK) {
      const slice = queue.slice(i, i + CHUNK);
      const out = await provider.translateBatch(slice, lang);
      for (let j = 0; j < slice.length; j++) {
        cacheSet(cache, slice[j], out[j]);
      }
      if (opts.verbose) {
        process.stdout.write(`\n     · translated ${Math.min(i + CHUNK, queue.length)}/${queue.length}`);
      }
    }

    // Write results back into the DOM, applying the per-language normalizer
    // as the last step so cache stays untouched but the rendered HTML always
    // reflects the latest orthographic / brand-context overrides.
    for (const entry of prepared) {
      if (entry.skip) continue;
      if (entry.brandOnly) {
        entry.job.setText(normalize(entry.restore(entry.masked)));
        continue;
      }
      const finalMasked = entry.translated ?? cacheGet(cache, entry.masked) ?? entry.masked;
      entry.job.setText(normalize(entry.restore(finalMasked)));
    }

    rewriteAssetPaths($);
    applyLanguageMetadata($, lang, page);
    setSwitcherDefaults($, lang);

    const outPath = path.join(outDir, page);
    await fs.writeFile(outPath, $.html(), 'utf8');
    process.stdout.write(`ok (${jobs.length} strings, +${pendingMasked.size} new)\n`);

    // Flush cache after every page so a crash mid-run doesn't lose work.
    await saveCache(lang, cache);
  }

  console.log(`\n→ ${lang}: ${totalCacheHits} hits / ${totalCacheMisses} misses / ${newUnique.size} unique new strings / ~${totalNewChars} chars sent`);
}

async function main() {
  const args = parseArgs(process.argv);

  let langs;
  if (args.all) {
    langs = Object.entries(LANGUAGES).filter(([, c]) => c.enabled).map(([code]) => code);
    if (!langs.length) {
      console.error('No languages have enabled:true in config.js');
      process.exit(1);
    }
  } else if (args.lang) {
    langs = [args.lang];
  } else {
    printUsage();
    process.exit(1);
  }

  const provider = getProvider(args.provider);
  console.log(`Provider: ${args.provider}`);

  for (const lang of langs) {
    console.log(`Language: ${lang} (${LANGUAGES[lang].name})`);
    await translateForLang(lang, provider, args);
  }
}

main().catch((e) => {
  console.error('\n[fatal]', e?.stack || e?.message || e);
  process.exit(1);
});
