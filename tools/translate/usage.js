// One-shot: print DeepL quota usage. Doesn't consume quota itself.
import 'dotenv/config';
import * as deepl from './providers/deepl.js';

const u = await deepl.usage();
console.log(JSON.stringify(u, (k, v) => typeof v === 'bigint' ? Number(v) : v, 2));
