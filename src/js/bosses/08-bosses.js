/* ---------- bosses ---------- */
const BOSSES = {
  siren: { name: I18('塞壬级母舰 · SIREN', 'SIREN-CLASS MOTHERSHIP'), hp: 700, score: 6000 },
  hydra: { name: I18('九头蛇级无畏舰 · HYDRA', 'HYDRA-CLASS DREADNOUGHT'), hp: 1050, score: 9000 },
  leviathan: { name: I18('利维坦级巢母 · LEVIATHAN', 'LEVIATHAN-CLASS HIVE MOTHER'), hp: 1400, score: 12000 },
  fortress: { name: I18('堡垒行星 · BASTION', 'BASTION FORTRESS WORLD'), hp: 1400, score: 20000 },
  colossus: { name: I18('巨像要塞 · COLOSSUS', 'COLOSSUS GROUND CITADEL'), hp: 2500, score: 30000 },
  thunder: { name: I18('雷鸟级攻击舰 · THUNDERBIRD', 'THUNDERBIRD-CLASS GUNSHIP'), hp: 1000, score: 7000 },
  whale: { name: I18('巨鲸级空中母舰 · SKYWHALE', 'SKYWHALE-CLASS AIR CARRIER'), hp: 1700, score: 10000 },
  tempest: { name: I18('风暴级光矛舰 · TEMPEST', 'TEMPEST-CLASS LANCE FRIGATE'), hp: 1800, score: 13000 },
  gate1: { name: I18('外闸门 · OUTER GATE', 'OUTER GATE'), hp: 900, score: 9000 },
  gate2: { name: I18('防爆闸门 · BLAST GATE', 'BLAST GATE'), hp: 1600, score: 12000 },
  gate3: { name: I18('核心闸门 · CORE GATE', 'CORE GATE'), hp: 2200, score: 15000 },
  core: { name: I18('能量核心 · NEXUS CORE', 'NEXUS ENERGY CORE'), hp: 6000, score: 40000 },
};
const BOSS_ORDER = ['siren', 'hydra', 'leviathan'];
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
const BOSS_PAT = {
  siren: [['aimed', 'spiral', 'fan', 'shells', 'aimed', 'drones'], ['laser', 'counter', 'homing', 'fan', 'shells', 'aimed'], ['twin', 'laser', 'counter', 'homing', 'rain', 'aimed', 'drones']],
  hydra: [['broadside', 'turrets', 'fan', 'raiders', 'shells'], ['laser', 'homing', 'turrets', 'waves', 'counter', 'broadside'], ['twin', 'laser', 'rain', 'homing', 'turrets', 'waves']],
  leviathan: [['flower', 'waves', 'spiral', 'homing', 'aimed'], ['wheel', 'counter', 'waves', 'shells', 'flower'], ['wheel', 'flower', 'laser', 'rain', 'homing', 'counter']],
  colossus: [['aimed', 'lance', 'fan'], ['laser', 'lance', 'counter', 'homing', 'lances', 'fan', 'rain', 'fighters'], ['twin', 'lances', 'laser', 'cascade', 'rain', 'counter', 'homing', 'wheel', 'fighters', 'lance']],
  thunder: [['aimed', 'fan', 'turrets', 'shells'], ['aimed', 'lance', 'homing', 'fan', 'turrets'], ['twin', 'lance', 'aimed', 'homing', 'fan', 'turrets']],
  whale: [['fighters', 'broadside', 'turrets', 'rain'], ['fighters', 'laser', 'homing', 'turrets', 'lance', 'broadside'], ['fighters', 'lances', 'twin', 'homing', 'turrets', 'rain', 'counter']],
  gate1: [['aimed', 'fan'], ['aimed', 'fan', 'homing', 'shells'], ['aimed', 'homing', 'fan', 'counter', 'shells']],
  gate2: [['aimed', 'lance', 'fan'], ['lance', 'homing', 'spiral', 'laser', 'fan'], ['lances', 'twin', 'homing', 'counter', 'laser', 'lance']],
  gate3: [['aimed', 'lances', 'fan', 'homing'], ['lances', 'laser', 'cascade', 'counter', 'homing', 'twin'], ['cascade', 'wheel', 'lances', 'twin', 'counter', 'homing', 'flower']],
  core: [['spiral', 'lance', 'turrets', 'flower', 'homing', 'lances'], ['wheel', 'lance', 'counter', 'lances', 'flower', 'laser', 'cascade', 'fighters'], ['wall', 'wheel', 'cascade', 'twin', 'lances', 'counter', 'wall', 'flower']],
  tempest: [['lance', 'spiral', 'aimed', 'waves'], ['lance', 'wheel', 'counter', 'lances', 'laser', 'waves'], ['cascade', 'wheel', 'twin', 'lances', 'flower', 'counter']],
  fortress: [['aimed', 'fan', 'shells'], ['laser', 'counter', 'homing', 'artillery', 'fan', 'raiders'], ['twin', 'laser', 'artillery', 'rain', 'homing', 'counter', 'wheel']],
};
const PAT_DUR = { fighters: 2.4, artillery: 3.6, aimed: 3.2, spiral: 3.6, counter: 4, fan: 3.4, shells: 3.4, rain: 3.6, homing: 3.2, drones: 2.2, raiders: 2.2, laser: 4.6, twin: 4.8, wheel: 5.6, waves: 3.6, flower: 3.8, broadside: 3.4, turrets: 3.6, shift: 1.8, lance: 2.4, lances: 2.8, cascade: 3.4, wall: 3.8 };
function bossKindFor(n) { return (themeC() ? BOSS_ORDER_C : themeB() ? BOSS_ORDER_B : BOSS_ORDER)[(n - 1) % 3]; }
function bossLabel(kind, n) { const tier = CYC_KINDS.has(kind) || /gate\d$/.test(kind) ? Math.floor((n - 1) / 3) : Math.floor((n - 1) / 9); return BOSSES[kind].name + (tier ? ' MK.' + ROMAN[tier] : ''); }
function spawnBoss() {
  if (S.sector % 10 === 0) { spawnFortress(cycOf(stageOf(S.sector))); return; }
  const n = Math.max(1, (cycOf(stageOf(S.sector)) - 1) * 3 + Math.round(levelOf(S.sector) / 3)), kind = bossKindFor(n), tier = Math.floor((n - 1) / 3);
  const def = BOSSES[kind], lvl = 1 + (n - 1) * .2 + tier * .12;
  const b = { type: 'boss', kind, n, tier, lvl, x: W / 2, t: 0, swayT: 0, hitT: 0, phase: 1, pi: 0, cur: null, hold: 0, entered: false,
    parts: [], spin: 0, side: 1, alt: false, ring: 0, ph: 0, gap: 0 };
  if (BOSS_ORDER_C.includes(kind)) cryoBossGeo(b, lvl);
  else if (BOSS_ORDER_B.includes(kind)) hiveBossGeo(b, lvl);
  else if (kind === 'siren') { b.r = clamp(W * .2, 78, 130); b.hw = b.r; b.hh = b.r * .45; }
  else if (kind === 'hydra') {
    b.hw = clamp(W * .4, 140, 280); b.hh = b.hw * .3; b.r = b.hw;
    b.parts = [{ ox: -b.hw * .6, oy: b.hh * .8, r: b.hh * .42 }, { ox: b.hw * .6, oy: b.hh * .8, r: b.hh * .42 }, { ox: 0, oy: b.hh * 1.02, r: b.hh * .36 }]
      .map(p => Object.assign(p, { hp: 70 * lvl, maxhp: 70 * lvl, hitT: 0, aim: Math.PI / 2, dead: false }));
  } else { b.r = clamp(Math.min(W, H) * .2, 96, 160); b.hw = b.r * .95; b.hh = b.r * .95; }
  b.hp = b.maxhp = def.hp * (1 + (n - 1) * .3) * (1 + (S.sector - 1) * .08);
  b.score = Math.round(def.score * (1 + tier * .5));
  b.y = -b.hh - 90;
  ships.push(b); S.boss = b;
}
function bossGuns(e) {
  if (e.kind === 'omega') return omegaGuns(e);
  if (e.kind === 'god') return godGuns(e);
  if (e.hiveB) return hiveGuns(e);
  if (e.cryoB) return cryoGuns(e);
  if (e.gate) { const w = e.hw, h = e.hh, t = e.parts.filter(p => !p.dead); return { main: [-w * .5 - e.rl, 0], side: [[-w * .6, -h * .5], [-w * .6, h * .5]], top: [[-w * .6, -h * .8], [-w * .6, h * .8]], core: [-w * .5, 0], turrets: t }; }
  if (e.kind === 'core') { const r = e.r, t = e.parts.filter(p => !p.dead); return { main: [-coreRad(e), 0], side: [[-r * .6, -r * .75], [-r * .6, r * .75]], top: [[0, -r], [0, r], [-r * .7, -r * .7], [-r * .7, r * .7]], core: [0, 0], turrets: t }; }
  if (e.sideBoss) {
    if (SIDE_MINIS_B.includes(e.kind)) return miniGunsB(e);
    if (SIDE_MINIS_C.includes(e.kind)) return miniGunsC(e);
    const w = e.hw, h = e.hh, t = e.parts.filter(p => !p.dead);
    if (e.kind === 'thunder') return { main: [-w * 1.05, 0], side: [[-w * .5, -h * .45], [-w * .4, h * .45]], top: [[w * .3, -h * .6], [w * .6, -h * .55]], core: [-w * .2, 0], turrets: t };
    if (e.kind === 'whale') return { main: [-w * .95, h * .05], side: [[-w * .45, h * .8], [w * .05, h * .82]], top: [[-w * .3, -h * .95], [w * .1, -h * .98], [w * .5, -h * .9]], core: [0, 0], turrets: t };
    return { main: [-w * .95, 0], side: [[-w * .5, -h * .4], [-w * .5, h * .4]], top: [[w * .3, -h * 1.05], [w * .3, h * 1.05]], core: [-w * .9, 0], turrets: t };
  }
  if (e.kind === 'colossus') { const w = e.hw, h = e.hh; return { main: [-w * .56, 0], side: [[-w * .14, -h * .62], [-w * .2, h * .2]], top: [[w * .25, -h * 1.1], [w * .6, -h * 1.02], [w * .95, -h * 1.38]], core: [-h * .25, 0] }; }
  if (e.kind === 'fortress') { const w = e.hw, h = e.hh; return { main: [0, h * .95], side: [[-w * .78, h * .2], [w * .78, h * .2]], top: [[-w * .62, -h * 1.15], [w * .62, -h * 1.15]], core: [0, 0] }; }
  if (e.kind === 'siren') { const R = e.r; return { main: [0, R * .44], side: [[-R * .74, R * .26], [R * .74, R * .26]], top: [[-R * .42, -R * .3], [R * .42, -R * .3]], core: [0, R * .12] }; }
  if (e.kind === 'hydra') {
    const alive = e.parts.filter(p => !p.dead);
    return { main: [0, e.hh * 1.25], side: [[-e.hw * .9, e.hh * .3], [e.hw * .9, e.hh * .3]], top: [[-e.hw * .35, -e.hh * .6], [e.hw * .35, -e.hh * .6], [0, -e.hh * .7]], core: [0, e.hh * .2], turrets: alive };
  }
  const R = e.r, nodes = [];
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + e.ring; nodes.push([Math.cos(a) * R * .8, Math.sin(a) * R * .8]); }
  const low = nodes.slice().sort((a, b) => b[1] - a[1]).slice(0, 2).sort((a, b) => a[0] - b[0]);
  return { main: [0, R * .22], side: low, top: nodes, core: [0, 0] };
}
const ab = (e, g) => g ? [e.x + g[0], e.y + g[1]] : [e.x, e.y];
function lobShell(x, y, tx, ty, sp, n = 10) {
  const a = Math.atan2(ty - y, tx - x), fuse = clamp(Math.hypot(tx - x, ty - y) / sp, .5, 3.2);
  return eFire('shell', x, y, a, sp, { fuse, n });
}
const BOSS_FN = {
  shift() {},
  lance(e, c, G, s, L) { if (c.n) return; c.n = 1; bossLance(e, 'single', L); },
  lances(e, c, G, s, L) { if (c.n) return; c.n = 1; bossLance(e, 'double', L); },
  cascade(e, c, G, s, L) { if (c.n) return; c.n = 1; bossLance(e, 'cascade', L); },
  wall(e, c, G, s, L) { if (c.n) return; c.n = 1; bossLance(e, 'wall', L); },
  fighters(e, c) { if (c.ft > 0) return; c.ft = 99; for (let k = 0; k < 3; k++) S.events.push({ t: k * .35, fn: () => { if (!e.dead && !e.dying && P.alive) spawnAir('fighter', e.x - e.hw * .05, e.y + e.hh * .8, { climb: true }); } }); },
  artillery(e, c, G, s, L) {
    if (c.ft > 0) return; c.ft = .45 / L;
    const F = e.fx, pcx = e.x, pcy = e.y + F.cy, x = rand(W * .06, W * .94), dx = x - pcx;
    if (Math.abs(dx) >= F.PR * .98) return;
    const y = pcy + Math.sqrt(F.PR * F.PR - dx * dx);
    if (y < 8) return;
    parts.push({ k: 'flash', x, y, vx: 0, vy: 0, life: .2, max: .2, r: 26, c: '255,200,140' });
    lobShell(x, y, clamp(P.x + rand(-140, 140), 20, W - 20), clamp(P.y + rand(-80, 40), 0, H), 230 * s, 8);
  },
  aimed(e, c, G, s, L) { if (c.ft > 0) return; c.ft = .14 / L; e.side = -e.side; const [x, y] = ab(e, G.side[e.side > 0 ? 1 : 0]); eShot(x, y, aimAng(x, y), 290 * s, PLASMA, 5); if (++c.n % 4 === 0) { const [mx, my] = ab(e, G.main); for (const o of [-.08, 0, .08]) eFire('needle', mx, my, aimAng(mx, my) + o, 430 * s, { silent: o !== 0 }); } },
  spiral(e, c, G, s, L) { if (c.ft > 0) return; c.ft = .085 / L; e.spin += .24; const arms = 3 + (e.phase > 1 ? 1 : 0) + (e.tier ? 1 : 0); const [x, y] = ab(e, G.core); for (let k = 0; k < arms; k++) eFire('orb', x, y, e.spin + k * TAU / arms, 165 * s, { c: FLARE, silent: k > 0 }); },
  counter(e, c, G, s, L) { if (c.ft > 0) return; c.ft = .1 / L; e.spin += .2; const [x, y] = ab(e, G.core); const arms = e.phase === 3 ? 4 : 3; for (let k = 0; k < arms; k++) { eFire('orb', x, y, e.spin + k * TAU / arms, 160 * s, { c: FLARE, silent: k > 0 }); eFire('orb', x, y, -e.spin * 1.1 + k * TAU / arms, 140 * s, { silent: true }); } },
  fan(e, c, G, s, L) { if (c.ft > 0) return; c.ft = .7 / L; e.alt = !e.alt; const n = 9 + e.phase * 2; const [x, y] = ab(e, G.main); for (let i = 0; i < n; i++) eFire('orb', x, y, (e.dir ?? Math.PI / 2) + (i - (n - 1) / 2) * .15 + (e.alt ? .075 : 0), 205 * s, { silent: i > 0 }); },
  shells(e, c, G, s, L) { if (c.ft > 0) return; c.ft = 1 / L; for (const g of G.side) { const [x, y] = ab(e, g); lobShell(x, y, P.x + rand(-90, 90), P.y + rand(-70, 20), 210 * s, 8 + e.phase * 2); } },
  rain(e, c, G, s, L) { if (c.ft > 0) return; c.ft = .42 / L; const [x, y] = ab(e, pick(G.top)); lobShell(x, y, rand(W * .08, W * .92), rand(H * .42, H * .9), 240 * s, 8); },
  homing(e, c, G, s, L) { if (c.ft > 0) return; c.ft = 1.5 / L; for (const g of G.top) { const [x, y] = ab(e, g); eFire('homing', x, y, -Math.PI / 2 + rand(-.9, .9), 150 * s, { seek: 2.2 + e.phase * .3, turn: 2 + L * .4, silent: g !== G.top[0] }); } },
  drones(e, c, G, s) { if (c.ft > 0) return; c.ft = 99; for (const g of G.side) { const [x, y] = ab(e, g); const dr = spawnShip('drone', x, y); dr.vy = 150; dr.amp = 50; } const [x, y] = ab(e, G.main); eShot(x, y, aimAng(x, y), 125 * s, FLARE, 11); },
  raiders(e, c, G) { if (c.ft > 0) return; c.ft = 99; for (const g of G.side) { const [x, y] = ab(e, g); const r = spawnShip('raider', x, y); r.ty = y + 120; } },
  laser(e, c, G, s, L) { if (c.n) return; c.n = 1; e.hold = 3.8; const g = G.main; addBeam({ owner: e, ox: g[0], oy: g[1], w: 20 + e.tier * 4 + (e.kind === 'hydra' ? 4 : 0), charge: 1.35 / Math.min(1.25, L), fire: 2.2 + e.phase * .3, mode: 'track', sweep: (.3 + .08 * e.phase) * Math.min(1.6, L), c: e.kind === 'leviathan' ? '150,255,200' : '255,70,110', dmg: 16 }); },
  twin(e, c, G, s, L) {
    if (!c.n) { c.n = 1; e.hold = 4.2; G.side.forEach((g, i) => addBeam({ owner: e, ox: g[0], oy: g[1], w: 14, charge: 1, fire: 3.2, mode: 'osc', base: (e.dir ?? Math.PI / 2) + (i ? -.26 : .26), amp: .2, f: 1.4 * Math.min(1.4, L), c: '255,90,200', dmg: 14, quiet: i > 0 })); }
    if (c.t > 1 && c.ft <= 0) { c.ft = .55 / L; const [x, y] = ab(e, G.core); eShot(x, y, aimAng(x, y), 230 * s, PLASMA, 6); }
  },
  wheel(e, c, G, s, L) {
    if (!c.n) { c.n = 1; e.hold = 5.2; const n = e.phase === 3 ? 7 : 5, o = rand(0, TAU), dir = Math.random() < .5 ? 1 : -1; for (let i = 0; i < n; i++) addBeam({ owner: e, ox: 0, oy: 0, w: 12, charge: 1.4, fire: 3.6, mode: 'spin', ang: o + i / n * TAU, spin: dir * (.26 + .05 * L), c: '150,255,200', dmg: 14, quiet: i > 0 }); }
    if (c.t > 1.5 && c.ft <= 0) { c.ft = .9 / L; const [x, y] = ab(e, G.main); eFire('wave', x, y, aimAng(x, y), 150 * s, { amp: 22, f: 7 }); }
  },
  waves(e, c, G, s, L) { if (c.ft > 0) return; c.ft = .5 / L; e.alt = !e.alt; const [x, y] = ab(e, G.main); for (let i = 0; i < 5; i++) eFire('wave', x, y, (e.dir ?? Math.PI / 2) + (i - 2) * .32, 150 * s, { amp: 30, f: 6, ph: e.alt ? Math.PI : 0, silent: i > 0 }); },
  flower(e, c, G, s, L) { if (c.ft > 0) return; c.ft = .5 / L; const n = 14 + e.phase * 2; e.spin += .13; const [x, y] = ab(e, G.core); for (let i = 0; i < n; i++) eFire('orb', x, y, e.spin + i / n * TAU, (120 + 60 * Math.abs(Math.sin(i / n * Math.PI * 3))) * s, { c: '150,255,200', silent: i > 0 }); },
  broadside(e, c, G, s, L) { if (c.ft > 0) return; c.ft = .9 / L; for (const g of G.side) { const [x, y] = ab(e, g); for (let k = -1; k <= 1; k++) eFire('shell', x, y, Math.PI / 2 + k * .35 + (g[0] < 0 ? .1 : -.1), 190 * s, { fuse: rand(1.1, 1.8), n: 8, silent: k !== 0 }); } },
  turrets(e, c, G, s, L) {
    if (c.ft > 0) return; c.ft = .5 / L;
    for (const p of G.turrets || []) { const x = e.x + p.ox + Math.cos(p.aim) * p.r, y = e.y + p.oy + Math.sin(p.aim) * p.r; for (let k = 0; k < 3; k++) S.events.push({ t: k * .07, fn: () => { if (!e.dead && !p.dead && P.alive) eFire('needle', x, y, p.aim + rand(-.05, .05), 400 * s, { silent: k > 0 }); } }); }
  },
};
function updateBoss(e, dt, canFire, spK) {
  if (e.dying) { if (e.kind === 'omega') updateOmegaDying(e, dt); else if (e.kind === 'god') updateGodDying(e, dt); else if (e.kind === 'colossus') updateColossusDying(e, dt); else if (e.gate) updateGateDying(e, dt); else if (e.kind === 'core') updateCoreDying(e, dt); else updateFortressDying(e, dt); return; }
  const fort = e.kind === 'fortress', colo = e.kind === 'colossus', shielded = fort || colo || !!e.gate;
  e.swayT += dt * (e.hold > 0 ? .15 : 1); e.hold -= dt; e.ring += dt * (e.phase === 3 ? .8 : .5); e.shieldHit = (e.shieldHit || 0) - dt;
  if (colo) updateColossus(e, dt, canFire, spK);
  else if (e.sideBoss) updateSideMini(e, dt);
  else if (e.gate) updateGate(e, dt, canFire);
  else if (e.kind === 'core') updateCore(e, dt, canFire);
  else if (e.kind === 'omega') updateOmega(e, dt, canFire, spK);
  else if (e.kind === 'god') updateGod(e, dt, canFire, spK);
  else {
    const ty = fort ? fortressGeo().ty : (W < 520 ? 56 : 0) + (e.cryoB ? inset.t + (e.kind === 'zenith' ? 40 + e.r * 1.25 : 70 + e.hh) : e.hiveB ? inset.t + 30 + (e.kind === 'scarab' ? e.hh * .9 : e.r * 1.05) : e.kind === 'leviathan' ? inset.t + 36 + e.r * 1.2 : e.kind === 'hydra' ? inset.t + 80 + e.hh * .9 : inset.t + 96 + e.r * .4);
    if (!e.entered) { e.y += (ty - e.y) * Math.min(1, dt * (fort ? .7 : 1.1)); if (Math.abs(ty - e.y) < 4) { e.entered = true; if (fort) S.toast = { txt: I18('先摧毁轨道模块，瓦解主堡护盾', 'Destroy the ring modules to drop the shield'), t: 4.2 }; } }
    e.x = fort ? W / 2 : W / 2 + Math.sin(e.swayT * .42) * Math.max(0, W / 2 - e.hw - 20) * .85;
    if (fort) updateRing(e, dt, canFire && e.entered, spK);
    else { if (e.kind === 'zenith') zenithSpin(e, dt); for (const p of e.parts) { p.x = e.x + p.ox; p.y = e.y + p.oy; } }
  }
  for (const p of e.parts) { p.hitT -= dt; if (!p.dead && !shielded) { let da = aimAng(p.x, p.y) - p.aim; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; p.aim += da * Math.min(1, dt * 4); } }
  if (!e.entered || !canFire) return;
  const f = e.hp / e.maxhp, want = e.kind === 'omega' ? e.stage : e.kind === 'god' ? (e.parts.some(p => !p.dead) ? 1 : f < .35 ? 3 : 2) : e.kind === 'core' ? (e.phase === 1 && e.shp > 0 ? 1 : f < .45 ? 3 : 2) : shielded ? (e.parts.some(p => !p.dead) ? 1 : f < .4 ? 3 : 2) : f < .33 ? 3 : f < .66 ? 2 : 1;
  if (want > e.phase) {
    e.phase = want; clearBeamsOf(e); e.hold = 0;
    e.cur = { name: 'shift', t: 0, dur: PAT_DUR.shift, ft: 0, n: 0 };
    if (shielded && want === 2) shieldDown(e);
    if (e.kind === 'core') { if (want === 2) coreShieldFx(e, e.sr); else { e.shp = e.smax * .35; coreShieldFx(e, e.r); } }
    if (!e.escort) S.toast = { txt: e.kind === 'omega' ? (want === 2 ? I18('星环防线瓦解 · 摧毁4座护盾发生塔', 'Ring defenses down · destroy the 4 shield pylons') : I18('行星护盾崩溃 · 极地大门显露 · 先摧毁4个门锁', 'Planetary shield collapsed · polar gate exposed · destroy its 4 locks')) : e.kind === 'god' ? (want === 2 ? I18('第二试炼 · 群星之心：它张开胸膛时全力攻击打断大爆炸', 'Trial II · Heart of Stars: hit the open heart to stop the Big Bang') : I18('第三试炼 · 湮灭奇点：逆着引力击碎最后的火种', 'Trial III · the Singularity: fight the pull, shatter the last spark')) : e.kind === 'core' ? (want === 2 ? I18('能量护盾击破 · 攻击核心！', 'Energy shield down · hit the core!') : I18('核心过载 · 护盾重组', 'Core overload · shield re-forming')) : e.gate ? (want === 2 ? I18('锁芯护盾瓦解 · 攻击锁芯！', 'Lock shield down · hit the lock core!') : I18('闸门过载 · 全武器开火', 'Gate overload · all weapons firing')) : e.sideBoss ? (want === 2 ? I18('护甲破损 · 武器系统升级', 'Armor breached · weapons escalating') : I18('进入狂暴模式', 'Enraged')) : fort ? (want === 2 ? I18('护盾瓦解 · 攻击主堡！', 'Shield down · hit the citadel!') : I18('主堡过载 · 全武器开火', 'Citadel overloaded · all weapons free')) : colo ? (want === 2 ? I18('护盾瓦解 · 攻击核心！', 'Shield down · hit the core!') : I18('核心过载 · 全武器开火', 'Core overloaded · all weapons free')) : want === 2 ? I18('母舰护甲破损 · 武器系统升级', 'Mothership armor breached · weapons escalating') : I18('母舰进入狂暴模式', 'Mothership enraged'), t: 2.6 };
    if (!e.escort) { sfx.alarm(); shake(10); }
    for (let i = 0; i < 5; i++) S.events.push({ t: i * .2, fn: () => { if (e.dead || e.dying) return; const bx = e.x + rand(-e.hw, e.hw) * .7; explode(bx, e.y + rand(-e.hh, e.hh) * .6, 40, FIRE); sfx.boom(40, bx, 'ship'); } });
  }
  if (!e.cur || e.cur.t >= e.cur.dur) {
    const list = BOSS_PAT[e.pat || e.kind][e.phase - 1]; let name = list[e.pi++ % list.length];
    if (e.escort && (name === 'lance' || name === 'lances' || name === 'cascade' || name === 'fighters')) name = 'aimed';
    const gap = Math.max(.2, .85 - (e.lvl - 1) * .35 - (e.phase - 1) * .15) + (shielded && e.phase === 1 ? 1.4 : 0);
    e.cur = { name, t: -gap, ft: 0, n: 0, dur: PAT_DUR[name] * (e.phase === 3 ? .9 : 1) };
  }
  const c = e.cur; c.t += dt; if (c.t < 0) return;
  c.ft -= dt;
  const L = e.lvl * (1 + (e.phase - 1) * .12), s = spK * Math.min(1.45, .9 + .1 * L);
  BOSS_FN[c.name](e, c, bossGuns(e), s, L);
}

