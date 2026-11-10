// Build ASHWING (formerly Deep Space Vanguard) from src/.
//
//   node tools/build.mjs            -> dist/claude/ashwing.html  (single file, the Claude artifact)
//                                      dist/web/                 (website package: upload the folder's contents)
//                                      platform/steam/app/       (the game inside the Steam desktop app; see platform/steam/README.md)
//
// src/manifest.json lists the script parts in load order. They are concatenated into ONE classic <script>,
// so every part shares the same top-level scope, exactly like the original single file.
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import vm from 'node:vm';
import { catalog, TABLE_LANGS } from './i18n.mjs';
import { loadData } from './data.mjs';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = p => readFileSync(join(ROOT, p), 'utf8');
const fail = msg => { console.error('BUILD FAILED: ' + msg); process.exit(1); };

// ---------- 1. assemble the single-file game ----------
const manifest = JSON.parse(read('src/manifest.json'));
// Traditional Chinese and Japanese tables (src/lang/*.json), keyed by the English text, go in front of the game code.
// Only keys the game still uses are kept; gaps are reported (they fall back to Simplified Chinese / English).
const cat = catalog(ROOT), used = new Set(cat.rows.map(r => r.en)), tables = {};
for (const l of TABLE_LANGS) {
  tables[l] = Object.fromEntries(Object.entries(cat.tables[l]).filter(([k]) => used.has(k)));
  if (cat.missing[l].length) console.warn(`WARNING: ${cat.missing[l].length} strings have no ${l} translation yet (e.g. ${JSON.stringify(cat.missing[l][0])}); see node tools/i18n.mjs`);
}
if (cat.conflicts.length) fail('the same English text has two different Chinese texts, so one translation can\'t serve both: ' + cat.conflicts[0]);
const langTables = '/* ---------- language tables (generated from src/lang/*.json by tools/build.mjs) ---------- */\n' +
  'const LANG_TABLES = ' + JSON.stringify(tables).replace(/</g, '\\u003c') + ';\n';
// game data tables (src/data/*.json, checked by tools/data.mjs)
const gameData = loadData(ROOT);
if (gameData.errors.length) fail('data tables:\n  ' + gameData.errors.join('\n  '));
const dataTables = '/* ---------- game data (generated from src/data/*.json by tools/build.mjs) ---------- */\n' +
  'const DATA = ' + JSON.stringify(gameData.data).replace(/</g, '\\u003c') + ';\nconst BAL = DATA.balance;\n';
const js = langTables + dataTables + manifest.parts.map(p => read('src/' + p.file)).join('');
// Every part shares one scope, so two files declaring the same name is a SyntaxError that stops the whole game.
// Compile the script here (without running it) to catch that, and any other syntax error, at build time.
try { new vm.Script(js, { filename: 'game.js' }); } catch (e) {
  const m = (e.stack || '').match(/game\.js:(\d+)/), n = m ? +m[1] : 0;
  let at = '', acc = 0;
  acc = langTables.split('\n').length - 1 + dataTables.split('\n').length - 1;
  for (const p of manifest.parts) { const len = read('src/' + p.file).split('\n').length - 1; if (n && n <= acc + len) { at = ` at src/${p.file}:${n - acc}`; break; } acc += len; }
  fail(e.message + at);
}
const game = read('src/shell/head.html') + '<style>' + read('src/style.css') + '</style>' + read('src/shell/markup.html') +
  '<script>\n' + js + '</script>' + read('src/shell/tail.html');
mkdirSync(join(ROOT, 'dist/claude'), { recursive: true });
writeFileSync(join(ROOT, 'dist/claude/ashwing.html'), game);

// ---------- 2. website package ----------
const rep = (text, from, to) => {
  const n = text.split(from).length - 1;
  if (n !== 1) fail(`web build anchor found ${n} times: ${from.slice(0, 100)}`);
  return text.replace(from, () => to);
};
const iStyle = game.indexOf('<style>'), iStyleEnd = game.indexOf('</style>\n') + '</style>\n'.length;
const style = game.slice(iStyle, iStyleEnd);
let body = game.slice(iStyleEnd);
// language follows the browser on a plain website and on Steam before the Steam client language (the artifact defaults to English)
body = rep(body, "const DEFAULT_LANG = () => 'en';",
  "const DEFAULT_LANG = () => { const n = (navigator.language || '').toLowerCase(), c = /^zh-(tw|hk|mo)|^zh-hant/.test(n) ? 'zh-Hant' : /^zh/.test(n) ? 'zh-Hans' : /^ja/.test(n) ? 'ja' : 'en'; return LANGS.includes(c) ? c : c === 'zh-Hant' && LANGS.includes('zh-Hans') ? 'zh-Hans' : 'en'; };");
// fonts are self-hosted on the website: drop the Google Fonts link the artifact adds at runtime
body = rep(body, "  const lk = document.createElement('link'); lk.rel = 'stylesheet'; lk.href = 'https://fonts.googleapis.com/css2?family=' + CJK_FONT.replace(/ /g, '+') + ':wght@400;500;700;900&display=swap'; document.head.appendChild(lk);\n", '');
// no shared Claude database on a plain website: the leaderboard shows this device's runs
body = rep(body, "I18('排行榜需要在 Claude 中打开并登录才能使用 · 下面是这台设备上的成绩', 'The leaderboard needs this page opened in Claude while signed in · showing this device’s runs')",
  "I18('本机排行 · 显示这台设备上的最好成绩', 'Local ranking · the best runs on this device')");
const external = (body.match(/https:\/\/[^\s'"<>)]+/g) || []).filter(u => u !== 'https://…');
if (external.length) fail('external URL left in the web build: ' + external.slice(0, 5).join(', '));

const meta = JSON.parse(read('assets/web/meta.json'));
const head = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${meta.title}</title>
<meta name="description" content="${meta.descZh} ${meta.descEn}">
<meta name="theme-color" content="#03050b">
<meta name="color-scheme" content="dark">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="${meta.shortName}">
<meta property="og:type" content="website">
<meta property="og:title" content="${meta.ogTitle}">
<meta property="og:description" content="${meta.descZh}">
<meta property="og:image" content="og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" sizes="32x32" href="icons/favicon-32.png">
<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<link rel="manifest" href="manifest.webmanifest">
<link rel="stylesheet" href="fonts/fonts.css">
<style>html,body{margin:0;padding:0}</style>
`;
const html = head + style + '</head>\n<body>\n' + body.trimEnd() + '\n</body>\n</html>\n';
const OUT = join(ROOT, 'dist/web');
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
for (const d of ['fonts', 'icons']) cpSync(join(ROOT, 'assets/web', d), join(OUT, d), { recursive: true, filter: s => !/\.subset-chars/.test(s) });
cpSync(join(ROOT, 'assets/web/og-image.jpg'), join(OUT, 'og-image.jpg'));
writeFileSync(join(OUT, 'index.html'), html);
writeFileSync(join(OUT, 'manifest.webmanifest'), JSON.stringify({
  name: meta.manifestName, short_name: meta.shortName, description: meta.descZh,
  start_url: './', scope: './', display: 'fullscreen', orientation: 'any',
  background_color: '#03050b', theme_color: '#03050b', lang: 'zh-CN',
  icons: [{ src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }]
}, null, 2));

// ---------- 3. CJK font subset check ----------
// The web and Steam builds ship Noto Sans SC / TC / JP subsets holding only the characters each language shows
// (tools/subset_fonts.py). New text with new characters needs a re-subset.
const cjkChars = t => [...new Set(t)].filter(c => c.codePointAt(0) > 0x2e7f);
const tableText = l => Object.values(tables[l]).join('');
const codeText = game.replace(langTables, '').replace(dataTables, '');   // the tables are checked per language below
const needs = { sc: cjkChars(codeText), tc: cjkChars(codeText + tableText('zh-Hant')), jp: cjkChars(tableText('ja') + 'English简体中文繁體中文日本語') };
for (const [k, chars] of Object.entries(needs)) {
  const f = join(ROOT, `assets/web/fonts/.subset-chars-${k}.txt`);
  const have = new Set(existsSync(f) ? readFileSync(f, 'utf8') : '');
  const missing = chars.filter(c => !have.has(c));
  if (missing.length) console.warn(`WARNING: ${missing.length} characters are not in the Noto Sans ${k.toUpperCase()} subset (${missing.slice(0, 20).join('')}); run python3 tools/subset_fonts.py`);
}

// ---------- 4. Steam desktop app ----------
// platform/steam/ is the Electron project (its own package.json and node_modules); the game goes into its app/
// folder: the website build with a content security policy and without the browser-only PWA bits.
const STEAM = join(ROOT, 'platform/steam/app');
rmSync(STEAM, { recursive: true, force: true });
mkdirSync(STEAM, { recursive: true });
for (const d of ['fonts', 'icons']) cpSync(join(OUT, d), join(STEAM, d), { recursive: true });
const CSP = `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; media-src 'self' data: blob:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'">\n`;
let steamHtml = rep(html, '<meta charset="utf-8">\n', '<meta charset="utf-8">\n' + CSP);
steamHtml = rep(steamHtml, '<link rel="manifest" href="manifest.webmanifest">\n', '');
writeFileSync(join(STEAM, 'index.html'), steamHtml);

console.log(`built dist/claude/ashwing.html (${game.length} chars), dist/web/ (${html.length} chars) and platform/steam/app/`);
