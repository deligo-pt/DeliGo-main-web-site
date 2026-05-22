// DeepL provider. Works for both Free (`:fx` suffix) and Pro keys — deepl-node
// inspects the suffix and picks the right endpoint automatically.

import * as deepl from 'deepl-node';

import { LANGUAGES } from '../config.js';

let client = null;

function getClient() {
  if (client) return client;
  const key = process.env.DEEPL_API_KEY;
  if (!key) {
    throw new Error('DEEPL_API_KEY missing — set it in tools/translate/.env');
  }
  client = new deepl.Translator(key);
  return client;
}

export async function translateBatch(texts, targetLang) {
  if (!texts.length) return [];
  const lang = LANGUAGES[targetLang];
  if (!lang) throw new Error(`Unknown target language: ${targetLang}`);

  const t = getClient();
  const result = await t.translateText(texts, 'en', lang.deeplCode, {
    preserveFormatting: true,
    splitSentences: 'nonewlines',
  });
  return Array.isArray(result) ? result.map((r) => r.text) : [result.text];
}

export async function usage() {
  const t = getClient();
  return await t.getUsage();
}

export const name = 'deepl';
