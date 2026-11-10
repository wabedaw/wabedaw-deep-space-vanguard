// Build ASHWING (formerly Deep Space Vanguard) from src/.
//
//   node tools/build.mjs            -> dist/claude/ashwing.html  (single file, the Claude artifact)
//                                      dist/web/                 (website package: upload the folder's contents)
//
// src/manifest.json lists the script parts in load order. They are concatenated into ONE classic <script>,
// so every part shares the same top-level scope, exactly like the original single file.
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = p => readFileSync(join(ROOT, p), 'utf8');
const fail = msg => { console.error('BUILD FAILED: ' + msg); process.exit(1); };

// ---------- 1. assemble the single-file game ----------
const manifest = JSON.parse(read('src/manifest.json'));
const js = manifest.parts.map(p => read('src/' + p.file)).join('');
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
// language follows the browser on a plain website (the artifact defaults to English)
body = rep(body, "if (v === 'zh' || v === 'en') return v; } catch (e) {} return 'en'; })();",
  "if (v === 'zh' || v === 'en') return v; } catch (e) {} return /^zh/i.test(navigator.language || '') ? 'zh' : 'en'; })();");
// fonts are self-hosted on the website: drop the Google Fonts link the artifact adds at runtime
body = rep(body, "  const lk = document.createElement('link'); lk.rel = 'stylesheet'; lk.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700;900&display=swap'; document.head.appendChild(lk);\n", '');
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
for (const d of ['fonts', 'icons']) cpSync(join(ROOT, 'assets/web', d), join(OUT, d), { recursive: true, filter: s => !s.endsWith('.subset-chars.txt') });
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

// ---------- 3. Chinese font subset check ----------
// The web build ships a Noto Sans SC subset holding only the characters the game uses.
const subsetFile = join(ROOT, 'assets/web/fonts/.subset-chars.txt');
if (existsSync(subsetFile)) {
  const have = new Set(readFileSync(subsetFile, 'utf8'));
  const missing = [...new Set(game)].filter(c => c.codePointAt(0) > 0x2e7f && !have.has(c));
  if (missing.length) console.warn(`WARNING: ${missing.length} characters are not in the Chinese font subset (${missing.slice(0, 20).join('')}); run python3 tools/subset_fonts.py`);
}
console.log(`built dist/claude/ashwing.html (${game.length} chars) and dist/web/ (${html.length} chars)`);
