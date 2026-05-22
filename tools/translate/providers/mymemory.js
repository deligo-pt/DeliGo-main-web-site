// MyMemory provider. Free, no key required. One-text-at-a-time — much slower
// than DeepL — so use only as a dev fallback when the DeepL key is unavailable
// or quota is exhausted.

import { LANGUAGES } from '../config.js';

const ENDPOINT = 'https://api.mymemory.translated.net/get';

export async function translateBatch(texts, targetLang) {
  const lang = LANGUAGES[targetLang];
  if (!lang) throw new Error(`Unknown target language: ${targetLang}`);
  const pair = `en|${lang.mymemoryCode}`;
  const out = [];
  for (const text of texts) {
    const url = `${ENDPOINT}?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(pair)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`MyMemory ${res.status} ${res.statusText}`);
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    out.push(translated || text);
  }
  return out;
}

export async function usage() {
  return { note: 'MyMemory has no exposed quota endpoint.' };
}

export const name = 'mymemory';
