/* ---------- gates (levels 3 / 6 / 9) ---------- */
const GATE_DEF = [null,
  [['aa', 'turret', -.72], ['laser', 'laser', -.4], ['silo', 'missile', .4], ['aa', 'turret', .72]],
  [['aa', 'turret', -.82], ['silo', 'missile', -.6], ['laser', 'laser', -.36], ['laser', 'laser', .36], ['silo', 'missile', .6], ['aa', 'turret', .82]],
  [['aa', 'turret', -.88], ['silo', 'missile', -.69], ['laser', 'laser', -.5], ['rocket', 'rocket', -.31], ['rocket', 'rocket', .31], ['laser', 'laser', .5], ['silo', 'missile', .69], ['hangar', 'hangar', .88]],
];
function spawnGate(g, n) {
  const kind = 'gate' + g, lvl = 1.3 + (g - 1) * .25 + (n - 1) * .4, hw = clamp(W * .06, 40, 80);
  const b = { type: 'boss', kind, gate: g, n, tier: n - 1, lvl, t: 0, swayT: 0, hitT: 0, phase: 1, pi: 0, cur: null, hold: 0, entered: false,
    spin: 0, side: 1, alt: false, ring: 0, ph: 0, shield: true, shieldHit: 0, dir: Math.PI, hw, open: 0, parts: [] };
  b.wx = S.wx + W + hw * 2 + 80; b.tx = W * .8;
  if (IW && IW.theme === 2) Object.assign(b, { theme: 2, label: 'hgate' + g, pat: 'hgate' + g });
  else if (IW && IW.theme === 3) Object.assign(b, { theme: 3, label: 'cgate' + g, pat: 'cgate' + g });
  gateGeo(b);
  b.rl = clamp(b.hh * .2, 24, 54); b.r = b.rl;
  const R = clamp(b.hh * .085, 14, 24);
  b.parts = GATE_DEF[g].map(([role, type, fy], i) => ({ role, type, i, ox: -hw * .5 - R * .55, oy: fy * b.hh, r0: R, r: R, depth: 1, hp: 90 * lvl, maxhp: 90 * lvl, hitT: 0, aim: Math.PI, dead: false, hidden: true, x: 0, y: 0, fireT: rand(.8, 2.4), alt: 0 }));
  b.hp = b.maxhp = BOSSES[b.label || kind].hp * (1 + (n - 1) * .5);
  b.score = Math.round(BOSSES[b.label || kind].score * (1 + (n - 1) * .5));
  ships.push(b); S.boss = b;
}
function gateGeo(e) { e.x = e.wx - S.wx; e.c = IW ? ceilW(e.wx) : H * .1; e.f = IW ? floorW(e.wx) : H * .9; e.hh = (e.f - e.c) / 2; e.y = e.c + e.hh; }
function gateArmor(e, x, y) {
  if (e.open > .4) return false;
  if (x < e.x - e.hw * .5 || x > e.x + e.hw * 1.5 || y < e.c || y > e.f) return false;
  return Math.hypot(x - (e.x - e.hw * .5), y - e.y) > e.rl;
}
function mountParts(e, dt, live) {
  const L = e.lvl, s = Math.min(1.45, .95 + .08 * L);
  for (const p of e.parts) {
    p.x = e.x + p.ox; p.y = e.y + p.oy; p.hidden = p.x > W - 8 || p.x < -p.r;
    if (p.dead || p.hidden) continue;
    let da = aimAng(p.x, p.y) - p.aim; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; p.aim += da * Math.min(1, dt * 4);
    if (!live) continue;
    p.fireT -= dt; if (p.fireT > 0) continue;
    if (p.role === 'aa') {
      if (p.alt++ % 3 === 2) eFire('shell', p.x, p.y, p.aim, 300 * s, { fuse: clamp(Math.hypot(P.x - p.x, P.y - p.y) / 300, .35, 2.4), n: 10 });
      else tracer(p.x + Math.cos(p.aim) * p.r, p.y + Math.sin(p.aim) * p.r, p.aim, 430 * s, 5);
      p.fireT = 1.35 / L;
    } else if (p.role === 'silo') {
      const up = p.oy < 0 ? 1 : -1;
      for (let k = 0; k < 3; k++) eFire('homing', p.x - p.r, p.y + (k - 1) * 8, Math.PI + up * (.35 + k * .2), 170 * s, { mis: true, seek: 3, turn: 1.8 + L * .2, silent: k > 0 });
      p.fireT = 3.6 / L;
    } else if (p.role === 'rocket') {
      for (let k = 0; k < 5; k++) S.events.push({ t: k * .1, fn: () => { if (!p.dead && P.alive) eFire('rocket', p.x - p.r, p.y, aimAng(p.x, p.y) + rand(-.1, .1), 160 * s, { acc: 430, max: 560 * s, silent: k > 0 }); } });
      p.fireT = 3.4 / L;
    } else if (p.role === 'laser') {
      addBeam({ owner: p, ox: 0, oy: 0, w: 13, charge: 1.2, fire: 1.3, mode: 'track', sweep: .26, c: '255,120,90', dmg: 15 });
      p.fireT = 5.2 / L;
    } else if (p.role === 'hangar') {
      if (ships.length < 22) for (let k = 0; k < 2; k++) S.events.push({ t: k * .5, fn: () => { if (!p.dead && P.alive) spawnAir('fighter', p.x - p.r, p.y); } });
      p.fireT = 5 / L;
    }
  }
}
function updateGate(e, dt, canFire) {
  gateGeo(e);
  if (!e.entered) {
    if (e.x < e.tx + 90) S.scrollT = 0;
    if (S.scrollT === 0 && S.scroll < 4) { e.entered = true; S.scroll = 0; S.toast = { txt: I18('摧毁闸门防御设施，击破锁芯', 'Destroy the gate defenses, then break the lock core'), t: 3.6 }; }
  }
  mountParts(e, dt, canFire && e.entered);
}
function gateDown(e) {
  e.dying = true; e.dyingT = 0; e.shield = false; S.boss = null; S.kills++;
  clearBeamsOf(e); for (const p of e.parts) { clearBeamsOf(p); p.dead = true; }
  const lx = e.x - e.hw * .5;
  for (let i = 0; i < 12; i++) S.events.push({ t: i * .1, fn: () => { const bx = e.x + rand(-1, 1) * e.hw, by = e.y + rand(-.9, .9) * e.hh; explode(bx, by, rand(26, 50), i % 3 ? FIRE : PLAS, { debris: '80,76,80' }); sfx.boom(40, bx, 'ship'); } });
  S.events.push({ t: 1.2, fn: () => {
    explode(lx, e.y, 120, FIRE, { debris: '110,100,110' }); explode(lx, e.y, 80, ['255,255,255', '255,220,160', ION, WHITE]);
    sfx.boom(160, lx, 'huge'); shake(22); S.wflash = .5; ebul.length = 0; clearBeams(); addScore(e.score, lx, e.y);
    dropPower(lx - 60, e.y - 30, 'W'); dropPower(lx - 60, e.y + 30, 'H'); if (e.gate >= 2) dropPower(lx - 100, e.y, 'M');
    floatText(lx, e.y - 60, I18('闸门突破', 'GATE BREACHED'), FLARE, true);
  } });
  S.events.push({ t: 2.2, fn: () => { if (IW) { IW.flat = null; S.scrollT = baseScroll(); } } });
  S.events.push({ t: 2.8, fn: nextSector });
}
function updateGateDying(e, dt) {
  e.dyingT += dt; gateGeo(e);
  if (e.dyingT > 1.2) e.open = Math.min(1, e.open + dt * .9);
  if (Math.random() < .3 && parts.length < 1300) parts.push({ k: 'smoke', x: e.x + rand(-.5, 1.2) * e.hw, y: e.y + rand(-1, 1) * e.hh * .8, vx: -S.scroll * .4, vy: -rand(20, 50), life: rand(1.2, 2), max: 2, r: rand(8, 18), g: 16, c: '40,36,40' });
  if (e.x < -e.hw * 4) e.dead = true;
}

