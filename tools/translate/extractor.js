// HTML text extraction. Parses a page with cheerio and returns a flat list of
// "jobs" — opaque getter/setter pairs that abstract away whether the source
// string lives in a text node or an attribute. The CLI mutates the jobs in
// place, then asks cheerio to serialize the resulting DOM back to HTML.

import * as cheerio from 'cheerio';

import { TRANSLATABLE_ATTRS, SKIP_ELEMENTS } from './config.js';

function isInsideSkippedElement(node) {
  let p = node.parent;
  while (p) {
    if (p.type === 'tag' && SKIP_ELEMENTS.has(p.name)) return true;
    p = p.parent;
  }
  return false;
}

export function parsePage(html) {
  const $ = cheerio.load(html, { decodeEntities: false });
  const jobs = [];

  // Text nodes.
  $('*').contents().each((_, el) => {
    if (el.type !== 'text') return;
    if (isInsideSkippedElement(el)) return;
    const raw = el.data || '';
    if (!raw.trim()) return;

    const leading = (raw.match(/^\s+/) || [''])[0];
    const trailing = (raw.match(/\s+$/) || [''])[0];
    const core = raw.slice(leading.length, raw.length - trailing.length);
    if (!core) return;

    jobs.push({
      kind: 'text',
      getText: () => core,
      setText: (newText) => { el.data = leading + newText + trailing; },
    });
  });

  // Attribute values.
  for (const { selector, attr } of TRANSLATABLE_ATTRS) {
    $(selector).each((_, el) => {
      const $el = $(el);
      const value = $el.attr(attr);
      if (!value || !value.trim()) return;
      jobs.push({
        kind: 'attr',
        getText: () => value,
        setText: (newText) => { $el.attr(attr, newText); },
      });
    });
  }

  return { $, jobs };
}
