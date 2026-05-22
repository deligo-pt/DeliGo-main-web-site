// Provider factory. Every provider exports an async `translateBatch(texts,
// lang)` that returns a same-length array of translated strings.

import * as deepl from './deepl.js';
import * as mymemory from './mymemory.js';

export function getProvider(name) {
  switch ((name || 'deepl').toLowerCase()) {
    case 'deepl': return deepl;
    case 'mymemory': return mymemory;
    default: throw new Error(`Unknown provider: ${name}`);
  }
}
