// Translation-memory cache. One JSON file per language, keyed by SHA-1 of the
// masked source text. Lets re-runs skip everything that hasn't changed since
// the last run.

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

import { CACHE_DIR } from './config.js';

function keyFor(text) {
  return crypto.createHash('sha1').update(text).digest('hex');
}

export async function loadCache(lang) {
  const file = path.join(CACHE_DIR, `${lang}.json`);
  try {
    const raw = await fs.readFile(file, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    if (e.code === 'ENOENT') return {};
    throw e;
  }
}

export async function saveCache(lang, cache) {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  const file = path.join(CACHE_DIR, `${lang}.json`);
  await fs.writeFile(file, JSON.stringify(cache, null, 2), 'utf8');
}

export function cacheGet(cache, text) {
  return cache[keyFor(text)];
}

export function cacheSet(cache, text, translation) {
  cache[keyFor(text)] = translation;
}
