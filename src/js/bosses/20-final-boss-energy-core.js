/* ---------- final boss: energy core ---------- */
function spawnCore(n) {
  const c = H * .06, f = H * .94, r = clamp(Math.min(W * .13, (f - c) * .17), 56, 120), sr = r * 1.55;
  const b = { type: 'boss', kind: 'core', n, tier: n - 1, lvl: 1.7 + (n - 1) * .4, t: 0, swayT: 0, hitT: 0, phase: 1, pi: 0, cur: null, hold: 0, entered: false,
    spin: 0, side: 1, alt: false, ring: 0, ph: 0, dir: Math.PI, r, sr, hw: sr, hh: sr, shieldHit: 0, parts: [], c, f };
  if (IW && IW.theme === 2) Object.assign(b, { theme: 2, label: 'hivemind', pat: 'hivemind' });
  else if (IW && IW.theme === 3) Object.assign(b, { theme: 3, label: 'zero', pat: 'zero' });
  b.wx = S.wx + W + sr + 120; b.x = b.wx - S.wx; b.tx = W * .72; b.y = (c + f) / 2;
  b.hp = b.maxhp = BOSSES[b.label || 'core'].hp * (1 + (n - 1) * .5);
  b.smax = b.shp = [0, 2400, 2800, 2600][b.theme || 1] * (1 + (n - 1) * .5);
  b.score = Math.round(BOSSES[b.label || 'core'].score * (1 + (n - 1) * .5));
  const R = clamp(r * .26, 15, 26), k = sr + R * 1.6;
  b.parts = [['aa', 'turret', -.25, -1], ['laser', 'laser', .55, -.86], ['aa', 'turret', -.25, 1], ['laser', 'laser', .55, .86]]
    .map(([role, type, fx, fy], i) => ({ role, type, i, ox: fx * r, oy: fy * k, r0: R, r: R, depth: 1, hp: 80 * b.lvl, maxhp: 80 * b.lvl, hitT: 0, aim: Math.PI, dead: false, hidden: true, x: 0, y: 0, fireT: rand(1, 2.5), alt: 0 }));
  ships.push(b); S.boss = b;
}
function coreRad(e) { return e.shp > 0 ? e.sr : e.r; }
function updateCore(e, dt, canFire) {
  e.x = e.wx - S.wx; e.c = IW ? ceilW(e.wx) : H * .06; e.f = IW ? floorW(e.wx) : H * .94; e.y = (e.c + e.f) / 2;
  if (!e.entered) {
    if (e.x < e.tx + 60) S.scrollT = 0;
    if (S.scrollT === 0 && S.scroll < 4) { e.entered = true; S.scroll = 0; S.toast = { txt: I18('击破能量护盾，摧毁核心', 'Break the energy shield, destroy the core'), t: 3.8 }; }
  }
  e.hw = e.hh = coreRad(e);
  e.spin += dt * (e.phase === 3 ? 1.7 : e.phase === 2 ? 1.2 : .8);
  mountParts(e, dt, canFire && e.entered);
  if (Math.random() < .25 && parts.length < 1300) { const a = rand(0, TAU), rr = e.r * rand(1, 1.4); parts.push({ k: 'spark', x: e.x + Math.cos(a) * rr, y: e.y + Math.sin(a) * rr, vx: Math.cos(a) * 60, vy: Math.sin(a) * 60, life: .3, max: .3, c: pick([coreCol(e), WHITE]), w: 1.2 }); }
}
function coreCol(e) { return e.phase === 3 ? '255,80,80' : e.phase === 2 ? '255,170,90' : '120,220,255'; }
function coreShieldHit(e, dmg, x, y) {
  e.shp = Math.max(0, e.shp - dmg); e.shieldHit = .25;
  sparks(x, y, 3, ['150,240,255', WHITE], Math.PI, 2.4); sfx.hit(x, true);
}
function coreShieldFx(e, R) {
  waves.push({ x: e.x, y: e.y, r: R, max: R * 4, life: .9, maxl: .9, c: '150,240,255' });
  waves.push({ x: e.x, y: e.y, r: R * .5, max: R * 3, life: .7, maxl: .7, c: '255,255,255' });
  for (let i = 0; i < 46; i++) { const a = rand(0, TAU), sp = rand(140, 380); parts.push({ k: 'spark', x: e.x + Math.cos(a) * R, y: e.y + Math.sin(a) * R, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: rand(.4, .9), max: .9, c: pick(['150,240,255', WHITE, ION]), w: 1.6 }); }
  sfx.shieldBreak(); shake(16);
}
function coreDown(e) {
  e.dying = true; e.dyingT = 0; S.boss = null; S.kills++; e.shp = 0;
  clearBeamsOf(e); for (const p of e.parts) { clearBeamsOf(p); p.dead = true; } clearBeams();
  for (const s of ships) if (s !== e && !s.dead && s.surf) killShip(s);
  for (let i = 0; i < 26; i++) S.events.push({ t: i * .1, fn: () => { const a = rand(0, TAU), d = rand(.3, 1.6) * e.r; explode(e.x + Math.cos(a) * d, e.y + Math.sin(a) * d, rand(30, 70), i % 2 ? ['150,240,255', WHITE, ION, WHITE] : FIRE); sfx.boom(50, e.x, i % 3 ? 'ship' : 'big'); shake(8); } });
  S.events.push({ t: 2.8, fn: () => { explode(e.x, e.y, 220, ['255,255,255', '200,250,255', ION, WHITE]); explode(e.x, e.y, 150, FIRE, { debris: '110,100,120' }); sfx.boom(220, e.x, 'huge'); shake(34); S.wflash = 1; ebul.length = 0; clearBeams(); e.gone = true; addScore(e.score, e.x, e.y); dropPower(e.x - 120, e.y, 'W'); } });
  const st = stageOf(S.sector), bonus = 10000 * st;
  S.events.push({ t: 4.2, fn: () => { S.score += bonus; S.banner = { big: STAGE_CLEAR(st), sub: I18('STAGE CLEAR · +', 'BONUS +') + bonus, t: 0, dur: 4 }; sfx.sector(); } });
  S.events.push({ t: 8, fn: () => beginTransition('escape') });
}
function updateCoreDying(e, dt) {
  e.dyingT += dt; e.x = e.wx - S.wx;
  if (!e.gone) { e.spin += dt * 4; if (Math.random() < .6 && parts.length < 1300) { const a = rand(0, TAU); parts.push({ k: 'spark', x: e.x, y: e.y, vx: Math.cos(a) * rand(200, 500), vy: Math.sin(a) * rand(200, 500), life: .4, max: .4, c: pick([coreCol(e), WHITE]), w: 1.6 }); } }
  else if (e.dyingT > 6) e.dead = true;
}

