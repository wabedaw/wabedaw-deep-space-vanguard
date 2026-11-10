/* ---------- language: English by default, Chinese on request ---------- */
const LANG = (() => { const h = location.hash; if (h === '#zh' || h === '#en') return h.slice(1); try { const v = localStorage.getItem('dsv-lang'); if (v === 'zh' || v === 'en') return v; } catch (e) {} return 'en'; })();
const ZH = LANG === 'zh';
const I18 = (zh, en) => ZH ? zh : en;
document.documentElement.lang = ZH ? 'zh-CN' : 'en';
if (ZH) {
  document.documentElement.classList.add('zh'); document.title = '深空先锋 · Deep Space Vanguard';
  const lk = document.createElement('link'); lk.rel = 'stylesheet'; lk.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700;900&display=swap'; document.head.appendChild(lk);
  for (const el of document.querySelectorAll('[data-zh]')) el.innerHTML = el.dataset.zh;
  for (const el of document.querySelectorAll('[data-zh-aria]')) el.setAttribute('aria-label', el.dataset.zhAria);
}
(() => {
'use strict';
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const TAU = Math.PI * 2;
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const pick = a => a[(Math.random() * a.length) | 0];
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const COARSE = matchMedia('(pointer: coarse)').matches;

const ION = '94,242,255', PLASMA = '255,79,216', FLARE = '255,179,71', WHITE = '255,255,255', WARN = '255,90,79';
const FIRE = ['255,210,140', '255,150,60', '255,95,40', '255,245,215'];
const PLAS = ['255,79,216', '200,120,255', '255,200,250', '255,140,230'];
const DUST = ['205,180,150', '170,140,110', '255,190,120'];
const SECTOR_NAMES = [I18('猎户座旋臂外缘', 'Orion Spur Rim'), I18('柯伊伯残骸带', 'Kuiper Debris Belt'), I18('赫利俄斯星云', 'Helios Nebula'), I18('引力透镜区', 'Lensing Zone'), I18('天鹰座暗流', 'Aquila Undertow'), I18('塞壬母舰空域', 'Siren Fleet Space'), I18('事件视界走廊', 'Event Horizon Corridor'), I18('仙女座前哨', 'Andromeda Outpost'), I18('银心辐射带', 'Galactic Core Flux'), I18('堡垒星域', 'Bastion Reach')];
const SECTOR_NAMES_B = [I18('虫巢外围', 'Hive Outskirts'), I18('孢子云带', 'Spore Cloud Belt'), I18('甲虫巡航线', 'Scarab Patrol Lane'), I18('翡翠尘埃', 'Emerald Dust'), I18('蜂群回廊', 'Swarm Corridor'), I18('水母栖息区', 'Medusa Shoals'), I18('棱晶荒原', 'Prism Barrens'), I18('巢网深处', 'Deep Hive Web'), I18('主宰领域', 'Overmind Domain'), I18('双环巢星', 'The Aegis Hive')];
const SECTOR_NAMES_C = [I18('霜冻前线', 'Frost Front'), I18('彗星风暴', 'Comet Storm'), I18('冰川航道', 'Glacier Lane'), I18('极光帘幕', 'Aurora Veil'), I18('冰晶碎带', 'Shard Belt'), I18('联合舰队集结地', 'Armada Muster'), I18('零度深空', 'Zero-Kelvin Deep'), I18('天顶轨道', 'Zenith Orbit'), I18('冰封星门', 'Frozen Stargate'), I18('冰晶堡垒星', 'Glacius Cryo World')];
const SECTOR_LEN = 45;

let W = 0, H = 0, DPR = 1;
const inset = { t: 0, r: 0, b: 0, l: 0 };

