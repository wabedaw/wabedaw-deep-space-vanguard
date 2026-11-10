// Text catalog for translators and proofreaders.
//
//   node tools/i18n.mjs                    -> src/lang/catalog.csv: every string, one row each:
//                                             English (the key) | 简体中文 | 繁體中文 | 日本語 | where it is used
//   node tools/i18n.mjs --import file.csv  -> copies the 繁體中文 and 日本語 columns of an edited catalog back into
//                                             src/lang/zh-Hant.json and src/lang/ja.json
//
// The game's strings are written as I18('简体中文', 'English') / I18f(...) in src/js and as English text with a
// data-zh="简体中文" attribute in src/shell/markup.html. Traditional Chinese and Japanese live in src/lang/<code>.json,
// keyed by the English text. tools/build.mjs uses extractStrings() to inject the tables and report gaps.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

export const TABLE_LANGS = ['zh-Hant', 'ja'];

// a JS string literal starting at s[i] -> [its value, index after it], or null (template literals with ${} too)
function literal(s, i) {
  const q = s[i];
  if (q !== "'" && q !== '"' && q !== '`') return null;
  for (let j = i + 1; j < s.length; j++) {
    if (s[j] === '\\') { j++; continue; }
    if (q === '`' && s[j] === '$' && s[j + 1] === '{') return null;
    if (s[j] === q) return [vm.runInNewContext(s.slice(i, j + 1)), j + 1];   // evaluates only a lone string literal
  }
  return null;
}
const skipWs = (s, i) => { while (/\s/.test(s[i] || '')) i++; return i; };
const lineOf = (s, i) => s.slice(0, i).split('\n').length;
const decode = t => t.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');

export function extractStrings(root) {
  const out = [], odd = [];
  const manifest = JSON.parse(readFileSync(join(root, 'src/manifest.json'), 'utf8'));
  for (const p of manifest.parts) {
    const s = readFileSync(join(root, 'src', p.file), 'utf8');
    for (const m of s.matchAll(/\bI18f?\(/g)) {
      const a = literal(s, skipWs(s, m.index + m[0].length));
      let ok = false;
      if (a) {
        let k = skipWs(s, a[1]);
        if (s[k] === ',') {
          const b = literal(s, skipWs(s, k + 1));
          if (b) { const e = skipWs(s, b[1]); if (s[e] === ')' || (m[0] === 'I18f(' && s[e] === ',')) { ok = true; out.push({ en: b[0], zh: a[0], where: `${p.file}:${lineOf(s, m.index)}` }); } }
        }
      }
      // the language file defines I18 and translates markup with it: not catalog entries
      if (!ok && !p.file.includes('/00-language')) odd.push(`${p.file}:${lineOf(s, m.index)}`);
    }
  }
  // markup: <tag ... data-zh="简体中文">English</tag> and aria-label="English" data-zh-aria="简体中文"
  const html = readFileSync(join(root, 'src/shell/markup.html'), 'utf8');
  for (const m of html.matchAll(/<([a-z0-9]+)\b[^>]*\sdata-zh="([^"]*)"[^>]*>/g)) {
    const tag = m[1], start = m.index + m[0].length;
    let depth = 1, i = start;
    const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'g'); re.lastIndex = start;
    let t; while (depth && (t = re.exec(html))) { depth += t[1] ? -1 : 1; i = t.index; }
    out.push({ en: html.slice(start, i).trim(), zh: decode(m[2]), where: `shell/markup.html:${lineOf(html, m.index)}` });
  }
  for (const m of html.matchAll(/aria-label="([^"]*)"[^>]*data-zh-aria="([^"]*)"/g))
    out.push({ en: decode(m[1]), zh: decode(m[2]), where: `shell/markup.html:${lineOf(html, m.index)}` });
  return { strings: out.filter(r => r.en !== ''), odd };
}

export function loadTables(root) {
  const t = {};
  for (const l of TABLE_LANGS) t[l] = JSON.parse(readFileSync(join(root, `src/lang/${l}.json`), 'utf8'));
  return t;
}

// one entry per English key; the same English with different Chinese is reported (a translation can't follow both)
export function catalog(root) {
  const { strings, odd } = extractStrings(root), tables = loadTables(root), rows = new Map(), conflicts = [];
  for (const s of strings) {
    const r = rows.get(s.en);
    if (!r) rows.set(s.en, { en: s.en, zh: s.zh, where: [s.where] });
    else { r.where.push(s.where); if (r.zh !== s.zh) conflicts.push(`${JSON.stringify(s.en)}: ${JSON.stringify(r.zh)} vs ${JSON.stringify(s.zh)} (${s.where})`); }
  }
  const missing = {}, unused = {};
  for (const l of TABLE_LANGS) {
    missing[l] = [...rows.keys()].filter(k => !(k in tables[l]));
    unused[l] = Object.keys(tables[l]).filter(k => !rows.has(k));
  }
  return { rows: [...rows.values()], tables, missing, unused, conflicts, odd };
}

const csvCell = v => /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
function parseCsv(text) {
  const rows = []; let row = [], cell = '', q = false;
  text = text.replace(/^﻿/, '');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; continue; }
    if (c === '"') q = true; else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
  const imp = process.argv.indexOf('--import');
  if (imp > 0) {
    const [head, ...body] = parseCsv(readFileSync(process.argv[imp + 1], 'utf8'));
    const col = name => head.indexOf(name);
    const tables = loadTables(ROOT);
    for (const [l, name] of [['zh-Hant', '繁體中文'], ['ja', '日本語']]) {
      let n = 0;
      for (const r of body) { const en = r[col('English')], v = r[col(name)]; if (en && v) { if (tables[l][en] !== v) n++; tables[l][en] = v; } }
      writeFileSync(join(ROOT, `src/lang/${l}.json`), JSON.stringify(tables[l], null, 2) + '\n');
      console.log(`${l}: ${n} entries changed`);
    }
  }
  const c = catalog(ROOT);
  const lines = [['English', '简体中文', '繁體中文', '日本語', 'where'].join(',')];
  for (const r of c.rows) lines.push([r.en, r.zh, c.tables['zh-Hant'][r.en] || '', c.tables.ja[r.en] || '', r.where.join(' ')].map(csvCell).join(','));
  writeFileSync(join(ROOT, 'src/lang/catalog.csv'), '﻿' + lines.join('\n') + '\n');
  console.log(`src/lang/catalog.csv: ${c.rows.length} strings`);
  for (const l of TABLE_LANGS) console.log(`${l}: ${c.missing[l].length} missing, ${c.unused[l].length} no longer used`);
  if (c.conflicts.length) console.log('same English, different Chinese (give one of them different English):\n  ' + c.conflicts.join('\n  '));
  if (c.odd.length) console.log('I18 calls the catalog cannot read (use two plain string literals, or I18f with {0}):\n  ' + c.odd.join('\n  '));
}
