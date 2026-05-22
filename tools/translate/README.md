# DeliGo Translation Pipeline

> **Status:** Phase 2 complete. Pipeline is fully wired; `pt` is enabled in
> `config.js`. Other European languages are stubbed and flip on in Phase 4.

## Layout

```
tools/translate/
├── .env                 # DEEPL_API_KEY (gitignored)
├── glossary.json        # Brand terms NOT to translate
├── config.js            # Languages, paths, translatable attributes
├── cache.js             # SHA-1 keyed translation memory
├── glossary.js          # maskGlossary / hasRealText helpers
├── extractor.js         # cheerio text-node + attribute walker
├── rewriter.js          # absolute paths + hreflang + <html lang>
├── providers/
│   ├── index.js         # factory
│   ├── deepl.js         # DeepL Free (`:fx`) or Pro
│   └── mymemory.js      # free dev fallback
├── translate.js         # CLI entrypoint
├── cache/               # gitignored — per-language JSON memory
└── package.json
```

## Setup

```
cd tools/translate
npm install
```

Create `.env` with:

```
DEEPL_API_KEY=...         # free-tier key ends with :fx
```

## Running

```
npm run translate -- --lang pt              # one language end-to-end
npm run translate -- --all                  # every LANGUAGES[*].enabled=true
npm run translate -- --lang pt --estimate   # dry-run: count new chars, no API
npm run translate -- --lang pt --only index.html
npm run translate -- --lang pt --limit 3    # first N pages only (debug)
npm run translate -- --lang pt --provider mymemory   # free dev fallback
```

The translator is idempotent: every translation goes through the per-language
cache, so re-runs only call DeepL for strings whose source changed.

## How it works

1. `extractor.js` walks each EN page with cheerio, collecting two job streams:
   - text nodes (skipping `<script>`, `<style>`, `<svg>`, `<code>`, `<pre>`, `<noscript>`)
   - attribute values listed in `config.TRANSLATABLE_ATTRS` (alt, title,
     aria-label, placeholder, meta description/keywords, og:title/description, …)
2. Each source string is masked with sentinels (`§§G0§§`, `§§G1§§`, …) for every
   glossary literal and regex pattern (brand names, URLs, emails, phones).
3. The masked string is looked up in `cache/<lang>.json`. On miss, it's queued
   for the provider.
4. Misses are batched (40 strings at a time for DeepL) and translated. Each
   batch result is written to the cache before the next batch starts.
5. Translations are restored with the saved sentinel map and written back into
   the cloned DOM.
6. `rewriter.js` absolutises asset paths (`images/foo.png` → `/images/foo.png`),
   sets `<html lang="<code>">`, and injects `<link rel="alternate" hreflang>`
   tags for every enabled language plus `x-default` and `en`.
7. The serialized HTML is written to `/<lang>/<filename>.html`.

## Glossary

Edit `glossary.json` to lock terms that must survive verbatim through
translation. Two arrays:

- `literal` — exact substring (case-sensitive). Order is normalised at load
  time: longer first, so "DeliGo Ride" is masked before "DeliGo".
- `patterns` — JavaScript regex strings, run before literals. Used for URLs,
  emails, phones, copyright lines, template placeholders.

## Provider notes

- **DeepL (default).** deepl-node auto-detects Free vs Pro from the API key
  suffix. Free is enough for Phase 2/3 QA on one language. Phase 4 (~6M chars
  across 22 langs) needs Pro.
- **MyMemory.** No API key, but one-at-a-time and aggressive daily caps. Useful
  for offline dev when DeepL is unreachable.

## Adding a language

1. Set `enabled: true` on the entry in `config.js`.
2. Run `npm run translate -- --lang <code> --estimate` to gauge cost.
3. Run `npm run translate -- --lang <code>` to translate.
4. Commit the generated folder.

To re-run after editing English pages: just run the command again. Unchanged
strings hit the cache and cost zero API calls.
