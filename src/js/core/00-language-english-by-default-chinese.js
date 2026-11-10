/* ---------- language: English by default; Simplified Chinese, Traditional Chinese and Japanese on request ---------- */
// Every visible string is written in the code as I18(Simplified Chinese, English); markup carries the English inside
// the element and the Simplified Chinese in data-zh. Traditional Chinese and Japanese come from src/lang/<code>.json,
// keyed by the English text: tools/i18n.mjs extracts the catalog for translators, tools/build.mjs injects the tables
// as LANG_TABLES. A missing entry falls back to Simplified Chinese (Traditional) or English (Japanese).
// Choice: #hash (shareable links: #en #zh #zh-Hans #zh-Hant #ja) > the player's choice > Steam's language > default
const LANGS = ['en', 'zh-Hans', 'zh-Hant', 'ja'];
const LANG_NAMES = { en: 'English', 'zh-Hans': '简体中文', 'zh-Hant': '繁體中文', ja: '日本語' };
const DEFAULT_LANG = () => 'en';   // the artifact opens in English; the web build follows the browser (tools/build.mjs)
const LANG = (() => {
  const fix = v => v === 'zh' ? 'zh-Hans' : v, ok = v => LANGS.includes(v);
  const h = fix(decodeURIComponent(location.hash.slice(1)));
  return ok(h) ? h : ok(SAVE.get('lang')) ? SAVE.get('lang') : ok(PLATFORM.hostLang()) ? PLATFORM.hostLang() : DEFAULT_LANG();
})();
const ZH = LANG === 'zh-Hans';   // the code's own strings are Simplified Chinese
const CJK = LANG !== 'en';       // Chinese or Japanese: CJK fonts, line breaks between any two characters
const LT = (typeof LANG_TABLES === 'object' && LANG_TABLES[LANG]) || null;
const I18 = (zh, en) => ZH ? zh : LT ? (LT[en] ?? (LANG === 'zh-Hant' ? zh : en)) : en;
const I18f = (zh, en, ...a) => I18(zh, en).replace(/\{(\d)\}/g, (_, i) => a[i]);   // placeholders {0} {1}… take the extra arguments
const CJK_FONT = { 'zh-Hant': 'Noto Sans TC', ja: 'Noto Sans JP' }[LANG] || 'Noto Sans SC';
document.documentElement.lang = LANG;
if (CJK) {
  document.documentElement.classList.add('zh');   // CJK layout rules in style.css; :lang() there picks the font
  document.title = I18('烬翼：弑光', 'ASHWING: Slay the First Light');
  const lk = document.createElement('link'); lk.rel = 'stylesheet'; lk.href = 'https://fonts.googleapis.com/css2?family=' + CJK_FONT.replace(/ /g, '+') + ':wght@400;500;700;900&display=swap'; document.head.appendChild(lk);
  for (const el of document.querySelectorAll('[data-zh]')) el.innerHTML = I18(el.dataset.zh, el.innerHTML.trim());
  for (const el of document.querySelectorAll('[data-zh-aria]')) el.setAttribute('aria-label', I18(el.dataset.zhAria, el.getAttribute('aria-label')));
}
(() => {
'use strict';
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const TAU = Math.PI * 2;
/* Randomness has two streams. The simulation (spawns, enemy AI, bullet patterns, drops) draws from a seeded
   generator, so the same seed and the same inputs replay the same run: weekly challenges, replays and bug repro
   depend on it. Drawing, particles, sound and the menu draw from Math.random, so frame rate, sound or the
   reduced-motion setting can never change what happens in the game. render() switches to the fx stream. */
const RNG = (() => {
  let s = (Math.random() * 4294967296) >>> 0, fx = false;
  const sim = () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  return { seed(v) { s = v >>> 0; }, get state() { return s; }, get fx() { return fx; }, set fx(v) { fx = !!v; }, next() { return fx ? Math.random() : sim(); } };
})();
const SEED_URL = (() => { const m = location.search.match(/[?&]seed=(\d+)/); return m ? (+m[1]) >>> 0 : null; })();
const rnd = () => RNG.next();
const rand = (a, b) => a + rnd() * (b - a);
const frand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const pick = a => a[(rnd() * a.length) | 0];
const fpick = a => a[(Math.random() * a.length) | 0];
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const COARSE = matchMedia('(pointer: coarse)').matches;

const ION = '94,242,255', PLASMA = '255,79,216', FLARE = '255,179,71', WHITE = '255,255,255', WARN = '255,90,79';
const FIRE = ['255,210,140', '255,150,60', '255,95,40', '255,245,215'];
const PLAS = ['255,79,216', '200,120,255', '255,200,250', '255,140,230'];
const DUST = ['205,180,150', '170,140,110', '255,190,120'];
const SECTOR_NAMES = [I18('猎户座旋臂外缘', 'Orion Spur Rim'), I18('柯伊伯残骸带', 'Kuiper Debris Belt'), I18('赫利俄斯星云', 'Helios Nebula'), I18('引力透镜区', 'Lensing Zone'), I18('天鹰座暗流', 'Aquila Undertow'), I18('塞壬母舰空域', 'Siren Fleet Space'), I18('事件视界走廊', 'Event Horizon Corridor'), I18('仙女座前哨', 'Andromeda Outpost'), I18('银心辐射带', 'Galactic Core Flux'), I18('堡垒星域', 'Bastion Reach')];
const SECTOR_NAMES_B = [I18('虫巢外围', 'Hive Outskirts'), I18('孢子云带', 'Spore Cloud Belt'), I18('甲虫巡航线', 'Scarab Patrol Lane'), I18('翡翠尘埃', 'Emerald Dust'), I18('蜂群回廊', 'Swarm Corridor'), I18('水母栖息区', 'Medusa Shoals'), I18('棱晶荒原', 'Prism Barrens'), I18('巢网深处', 'Deep Hive Web'), I18('主宰领域', 'Overmind Domain'), I18('双环巢星', 'The Aegis Hive')];
const SECTOR_NAMES_C = [I18('霜冻前线', 'Frost Front'), I18('彗星风暴', 'Comet Storm'), I18('冰川航道', 'Glacier Lane'), I18('极光帘幕', 'Aurora Veil'), I18('冰晶碎带', 'Shard Belt'), I18('联合舰队集结地', 'Armada Muster'), I18('零度深空', 'Zero-Kelvin Deep'), I18('天顶轨道', 'Zenith Orbit'), I18('冰封星门', 'Frozen Stargate'), I18('冰晶堡垒星', 'Glacius Cryo World')];
const SECTOR_LEN = BAL.world.sectorSeconds;

let W = 0, H = 0, DPR = 1;
const VIEW = { s: 1, cw: 1, ch: 1, dpr: 1, ox: 0, oy: 0, vx: 0, vy: 0 };   // field -> window mapping, set by resize()
const inset = { t: 0, r: 0, b: 0, l: 0 };

