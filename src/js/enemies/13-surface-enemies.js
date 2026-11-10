/* ---------- surface enemies ---------- */
const SIDE_DEF = {
  aa: { hw: 22, hh: 16, hp: 10, score: 220 }, sam: { hw: 26, hh: 17, hp: 12, score: 280 }, mlrs: { hw: 30, hh: 17, hp: 14, score: 320 },
  bunker: { hw: 46, hh: 30, hp: 45, score: 800 }, base: { hw: 120, hh: 44, hp: 100, score: 1600 },
  carrier: { hw: 175, hh: 34, hp: 170, score: 2600 }, seabase: { hw: 70, hh: 40, hp: 80, score: 1300 },
  fighter: { hw: 22, hh: 9, hp: 4, score: 150 }, ace: { hw: 28, hh: 11, hp: 10, score: 340 }, bomber: { hw: 86, hh: 24, hp: 70, score: 1400 },
};
function sideUnit(type, x, y) {
  const d = SIDE_DEF[type], sc = unitScale(), K = sideK();
  const e = { type, surf: true, x, y, hw: d.hw * sc, hh: d.hh * sc, hp: d.hp * K, score: d.score, t: 0, hitT: 0, fireT: rand(.7, 1.6), alt: 0, aim: Math.PI * 1.25, ph: rand(0, TAU), vx: 0, vy: 0 };
  e.r = Math.max(e.hw, e.hh) * .8; e.maxhp = e.hp;
  e.skin = (GW ? [0, 0, 2, 4][GW.theme] : IW ? [0, 0, 3, 5][IW.theme] : 0) || 0;
  ships.push(e);
  return e;
}
function maybeUnit(c) {
  const mini = S.boss ? !!S.boss.sideBoss : S.bossPending && levelOf(S.sector) !== 10;
  if (((S.boss || S.bossPending) && !mini) || GW.force || c.wx < GW.nextUnit || c.wx < 900) return;
  const lv = levelOf(S.sector), sg = GW.seg, sc = unitScale();
  let type = null, wx = c.wx;
  if (sg.b === 'sea') {
    const hw = SIDE_DEF.carrier.hw * sc;
    if (c.w && lv >= 4 && c.wx - GW.lastCarrier > 1700 && c.wx > sg.start + 450 && c.wx + hw * 2 < sg.end - 450 && Math.random() < .6) { type = 'carrier'; wx = c.wx + hw; GW.lastCarrier = wx; }
    else if (c.w && lv >= 5 && c.wx > sg.start + 300 && c.wx + 220 < sg.end - 300 && Math.random() < .45) { type = 'seabase'; wx = c.wx + 80; }
  } else if (!c.w) {
    if (sg.b === 'base' && lv >= 6 && c.wx - GW.lastBase > 1500 && c.wx > sg.start + 450 && c.wx + 300 < sg.end) { type = 'base'; GW.lastBase = c.wx; }
    else {
      const wts = [['aa', 3 + (sg.b === 'mountains' ? 1.5 : 0)], ['sam', lv >= 2 ? 2 : 0], ['mlrs', lv >= 3 && sg.b !== 'mountains' ? 2 : 0], ['bunker', lv >= 4 ? 1 + lv * .1 : 0]];
      let tot = wts.reduce((a, w) => a + w[1], 0), r = Math.random() * tot;
      for (const [k, w] of wts) { r -= w; if (r <= 0) { type = k; break; } }
    }
  }
  GW.nextUnit = c.wx + rand(380, 660) / (1 + (lv - 1) * .08) * (mini ? 1.6 : 1);
  if (!type) return;
  const hw = SIDE_DEF[type].hw * sc;
  if (type !== 'carrier' && type !== 'seabase') {
    wx = c.wx - hw - 4;
    let gmin = H; for (let x = wx - hw; x <= wx + hw; x += STEPW) { if (wetAt(x)) return; gmin = Math.min(gmin, groundAt(x)); }
    const e = sideUnit(type, wx - S.wx, gmin); e.ground = true; e.wx = wx; e.base = gmin + 3;
    if (type === 'sam') e.loaded = 2;
  } else {
    const e = sideUnit(type, wx - S.wx, waterY()); e.ground = true; e.sea = true; e.wx = wx; e.base = waterY(); e.vx = type === 'carrier' ? -14 : 0;
  }
}
function spawnAir(type, x, y, o = {}) {
  const e = sideUnit(type, x, y), sp = sideSp();
  e.air = true; e.by = y;
  if (type === 'fighter') { e.vx = -rand(250, 330) * sp; e.amp = o.amp ?? rand(8, 34); e.wf = rand(1.4, 2.8); e.hunt = Math.random() < .5; }
  if (type === 'ace') { e.state = 0; e.tx = W * rand(.62, .8); e.vx = -300; }
  if (type === 'bomber') { e.vx = -48 * sp; e.bombT = 0; }
  if (o.climb) { e.climb = 1.2; e.vx = -150; e.vy = -230; }
  return e;
}
function sideWave() {
  const lv = levelOf(S.sector), r = Math.random(), minY = inset.t + 70, maxY = Math.max(minY + 80, Math.min(H * .62, minTopAhead() - 70));
  if (lv >= 2 && r < .22) { const n = lv >= 5 ? 2 : 1; for (let i = 0; i < n; i++) spawnAir('ace', W + 40 + i * 80, rand(minY, maxY)); }
  else if (r < .6) {
    const n = 3 + Math.min(2, Math.floor(lv / 3)), y0 = rand(minY + 40, Math.max(minY + 41, maxY - 40));
    for (let i = 0; i < n; i++) { const m = i - (n - 1) / 2; spawnAir('fighter', W + 40 + Math.abs(m) * 38, clamp(y0 + m * 30, minY, maxY), { amp: 6 }); }
  } else {
    const n = 3 + Math.floor(lv / 4);
    for (let i = 0; i < n; i++) spawnAir('fighter', W + 40 + i * 70, rand(minY, maxY));
  }
}
function sideSpawnLogic(dt) {
  const lv = levelOf(S.sector);
  S.sectorT += dt * (S.flow || 1);
  if (lv === 10 && !GW.force && S.sectorT > secLen() - 9) forcePlateauFrom(S.wx + W + 40);
  if (!S.boss && !S.bossPending && S.sectorT >= secLen()) {
    if (lv === 10) { S.bossPending = true; S.warn = 3.4; sfx.warn(); const n = cycOf(stageOf(S.sector)); S.warnName = bossLabel(['colossus', 'colossus', 'forge', 'frostcit'][GW.theme] || 'colossus', n); S.events.push({ t: 2.4, fn: () => spawnColossus(n) }); }
    else if (lv % 3 === 0) { S.bossPending = true; S.warn = 3.4; sfx.warn(); const kind = ([0, SIDE_MINIS, SIDE_MINIS_B, SIDE_MINIS_C][GW.theme] || SIDE_MINIS)[lv / 3 - 1]; S.warnName = bossLabel(kind, cycOf(stageOf(S.sector))); S.events.push({ t: 2.4, fn: () => spawnSideMini(kind) }); }
    else nextSector();
  }
  const B = S.boss;
  if (B && B.kind === 'colossus' && B.entered && !B.dying) { S.tShip -= dt; if (S.tShip <= 0) { if (ships.reduce((n, e) => n + (e.air ? 1 : 0), 0) < 10) sideWave(); S.tShip = rand(3.6, 5.2); } }
  if (S.boss || S.bossPending) return;
  S.tLance -= dt;
  if (S.tLance <= 0) { if (!lances.length && S.sectorT > 3 && S.sectorT < secLen() - 2) { flightLance(lv); S.tLance = rand(.85, 1.2) * Math.max(5.5, 13.5 - lv * .85); } else S.tLance = 1; }
  S.tShip -= dt * (S.flow || 1);
  if (S.tShip <= 0) { sideWave(); S.tShip = rand(2.6, 4) / (1 + (lv - 1) * .06) * (GW.theme === 3 ? .7 : 1); }
  if (lv >= 3) { S.tBomber -= dt * (S.flow || 1); if (S.tBomber <= 0) { const sc = unitScale(); spawnAir('bomber', W + 100 * sc, rand(inset.t + 80, H * .3)); S.tBomber = rand(16, 24) / (1 + (lv - 3) * .1); } }
}
const upAim = (x, y) => clamp(aimAng(x, y), -Math.PI + .1, -.1);
function turnTo(e, want, dt, rate = 4) { let da = want - e.aim; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; e.aim += da * Math.min(1, dt * rate); }
function tracer(x, y, a, sp, n = 4, gap = .07, spread = .05) {
  for (let i = 0; i < n; i++) S.events.push({ t: i * gap, fn: () => { if (P.alive) eFire('orb', x, y, a + rand(-spread, spread), sp, { c: FLARE, r: 3, dmg: 8, silent: i > 0 }); } });
}
function updateSideUnit(e, dt) {
  e.t += dt; e.hitT -= dt;
  const live = S.mode === 'play' && P.alive && !P.cap && !S.trans, K = sideK(), sp = sideSp(), lv = levelOf(S.sector);
  if (e.att) { baseUnitPos(e); if (e.x < -e.hw * 2 - 80) { e.dead = true; return; } }
  else if (e.ground) {
    e.wx += e.vx * dt; e.x = e.wx - S.wx;
    e.y = e.base - e.hh * (e.sea ? .5 : .85) + (e.sea ? Math.sin(e.t * 1.2 + e.ph) * 2 : 0);
    if (e.x < -e.hw * 2 - 80) { e.dead = true; return; }
  }
  const on = live && e.x > 14 && e.x < W - 14;
  e.fireT -= dt;
  if (e.att) { updateBaseUnit(e, dt, on, K, sp, lv); return; }
  if (e.skin === 2 && e.type === 'sam') updateRail(e, dt, on, K, sp);
  else if (e.skin === 2 && e.type === 'bunker') updateWalker(e, dt, on, K, sp, lv);
  else if (e.skin === 2 && e.type === 'mlrs') updateMortar(e, dt, on, K, sp);
  else if (e.skin === 4 && e.type === 'bunker') updateWalker(e, dt, on, K, sp, lv);
  else switch (e.type) {
    case 'fighter': {
      if (e.climb > 0) { e.climb -= dt; e.vy += 240 * dt; if (e.climb <= 0) { e.by = e.y; e.vy = 0; e.vx = -rand(250, 320) * sp; } e.x += e.vx * dt; e.y += e.vy * dt; }
      else { if (e.hunt) e.by += clamp(P.y - e.by, -32 * dt, 32 * dt); const oy = e.y; e.x += e.vx * dt; e.y = e.by + Math.sin(e.t * e.wf + e.ph) * e.amp; e.vy = (e.y - oy) / Math.max(dt, .001); }
      if (on && e.fireT <= 0 && e.x > P.x + 60) { let a = aimAng(e.x, e.y); if (a < 0) a += TAU; a = clamp(a, Math.PI * .78, Math.PI * 1.22); for (const o of [-.05, .05]) eFire('needle', e.x - e.hw, e.y, a + o, 400 * sp, { silent: o > 0 }); e.fireT = rand(1.4, 2.2) / K; }
      if (e.x < -70 || e.y < -80) e.dead = true;
      break;
    }
    case 'ace': {
      if (e.state === 0) { e.x += (e.tx - e.x) * Math.min(1, dt * 1.6); if (Math.abs(e.tx - e.x) < 8) { e.state = 1; e.t = 0; } }
      else if (e.state === 1) {
        const oy = e.y; e.y += clamp(P.y - e.y, -150 * dt, 150 * dt) + Math.sin(e.t * 3) * 30 * dt; e.vy = (e.y - oy) / Math.max(dt, .001);
        if (on && e.fireT <= 0) {
          if (e.alt++ % 3 === 2) for (const o of [-1, 1]) eFire('homing', e.x, e.y + o * 6, Math.PI + o * .6, 170 * sp, { mis: true, seek: 2, turn: 2.4, silent: o > 0 });
          else for (let i = 0; i < 3; i++) S.events.push({ t: i * .08, fn: () => { if (!e.dead && P.alive) eFire('needle', e.x - e.hw, e.y, aimAng(e.x, e.y), 430 * sp, { silent: i > 0 }); } });
          e.fireT = 1.3 / K;
        }
        if (e.t > 7) { e.state = 2; e.vx = -120; }
      } else { e.vx -= 520 * dt; e.x += e.vx * dt; e.y -= 40 * dt; if (e.x < -80) e.dead = true; }
      break;
    }
    case 'bomber': {
      e.x += e.vx * dt; e.y += Math.sin(e.t * .8) * 6 * dt; turnTo(e, aimAng(e.x, e.y + e.hh), dt, 3);
      if (on && e.fireT <= 0) {
        if (e.alt++ % 2) eFire('shell', e.x - e.hw * .2, e.y - e.hh * .8, aimAng(e.x, e.y), 280 * sp, { fuse: clamp(Math.hypot(P.x - e.x, P.y - e.y) / 280, .4, 2.4), n: 8 });
        else tracer(e.x + e.hw * .1, e.y + e.hh, aimAng(e.x, e.y + e.hh), 380 * sp, 5);
        e.fireT = 1.5 / K;
      }
      e.bombT -= dt;
      if (on && e.bombT <= 0 && Math.abs(P.x - e.x) < 170 && P.y > e.y) { eFire('bomb', e.x + rand(-20, 20), e.y + e.hh, Math.PI / 2, 50); e.bombT = .55; }
      if (e.x < -e.hw - 60) e.dead = true;
      break;
    }
    case 'aa': {
      const px = e.x, py = e.y - e.hh * .4; turnTo(e, upAim(px, py), dt);
      if (on && e.fireT <= 0) {
        if (e.alt++ % 3 === 2) eFire('shell', px + Math.cos(e.aim) * 16, py + Math.sin(e.aim) * 16, e.aim, 300 * sp, { fuse: clamp(Math.hypot(P.x - px, P.y - py) / 300, .35, 2.2), n: 8 });
        else tracer(px + Math.cos(e.aim) * 16, py + Math.sin(e.aim) * 16, e.aim, 420 * sp, 4);
        e.fireT = rand(1.4, 1.9) / K;
      }
      break;
    }
    case 'sam': {
      turnTo(e, -Math.PI * .72, dt, 2);
      if (on && e.fireT <= 0) {
        if (e.loaded > 0) { eFire('homing', e.x - 4, e.y - e.hh * .6, -Math.PI / 2 - .55, 180 * sp, { mis: true, seek: 3.2, turn: 1.5 + lv * .1 }); e.loaded--; e.fireT = .55; }
        else { e.loaded = 2; e.fireT = 4 / K; }
      }
      break;
    }
    case 'mlrs': {
      e.wx -= 10 * dt; turnTo(e, clamp(upAim(e.x, e.y), -Math.PI * .92, -Math.PI * .55), dt, 2.5);
      if (on && e.fireT <= 0) {
        const n = 4 + Math.min(3, lv >> 1);
        for (let i = 0; i < n; i++) S.events.push({ t: i * .11, fn: () => { if (!e.dead && P.alive) eFire('rocket', e.x + Math.cos(e.aim) * 14, e.y - e.hh * .5 + Math.sin(e.aim) * 14, e.aim + rand(-.07, .07), 150 * sp, { acc: 420, max: 540 * sp, silent: i > 0 }); } });
        e.fireT = 4.2 / K;
      }
      break;
    }
    case 'bunker': {
      const px = e.x - e.hw * .2, py = e.y - e.hh * .3; turnTo(e, upAim(px, py), dt, 2.5);
      if (on && e.fireT <= 0) {
        const m = e.alt++ % (lv >= 6 ? 3 : 2), tx = px + Math.cos(e.aim) * 30, ty = py + Math.sin(e.aim) * 30;
        if (m === 0) for (const o of [-.14, 0, .14]) eFire('orb', tx, ty, e.aim + o, 240 * sp, { r: 7, silent: o !== 0 });
        else if (m === 1) lobShell(tx, ty, P.x, P.y, 260 * sp, 10);
        else addBeam({ owner: e, ox: tx - e.x, oy: ty - e.y, w: 10, charge: 1.1, fire: .9, mode: 'track', sweep: .2, c: '255,140,90', dmg: 14 });
        e.fireT = 2.4 / K;
      }
      break;
    }
    case 'base': {
      e.spin = (e.spin || 0) + dt * 1.6;
      if (on && e.fireT <= 0) { tracer(e.x + e.hw * .55, e.y - e.hh * .9, upAim(e.x + e.hw * .55, e.y - e.hh * .9), 400 * sp, 4); e.fireT = 2 / K; }
      e.launchT = (e.launchT ?? 1.5) - dt;
      if (on && e.launchT <= 0 && ships.length < 18) { spawnAir('fighter', e.x - e.hw * .35, e.y + e.hh * .3, { climb: true }); e.launchT = 6 / K; }
      break;
    }
    case 'carrier': {
      if (on && e.fireT <= 0) {
        const gx = e.x + (e.alt % 2 ? -.35 : .15) * e.hw, gy = e.y - e.hh * .75;
        if (e.alt++ % 3 === 2) eFire('shell', gx, gy, upAim(gx, gy), 300 * sp, { fuse: clamp(Math.hypot(P.x - gx, P.y - gy) / 300, .35, 2.2), n: 8 });
        else tracer(gx, gy, upAim(gx, gy), 410 * sp, 4);
        e.fireT = 1.7 / K;
      }
      e.launchT = (e.launchT ?? 1) - dt;
      if (on && e.launchT <= 0 && ships.length < 18) { spawnAir('fighter', e.x - e.hw * .8, e.y - e.hh * .7, { climb: true }); e.launchT = 5.2 / K; }
      e.samT = (e.samT ?? 3) - dt;
      if (on && e.samT <= 0) { for (const o of [0, .3]) eFire('homing', e.x + e.hw * .78, e.y - e.hh * .8, -Math.PI / 2 - .4 - o, 180 * sp, { mis: true, seek: 3, turn: 1.6, silent: o > 0 }); e.samT = 6 / K; }
      break;
    }
    case 'seabase': {
      if (on && e.fireT <= 0) {
        if (e.alt++ % 2) for (const o of [0, .35]) eFire('homing', e.x + e.hw * .3, e.y - e.hh, -Math.PI / 2 - .3 - o, 180 * sp, { mis: true, seek: 3, turn: 1.6, silent: o > 0 });
        else eFire('shell', e.x - e.hw * .3, e.y - e.hh, upAim(e.x, e.y - e.hh), 300 * sp, { fuse: clamp(Math.hypot(P.x - e.x, P.y - e.y) / 300, .35, 2.2), n: 8 });
        e.fireT = 2.3 / K;
      }
      break;
    }
  }
  if (IW && e.air && !e.dead) { const lo = ceilAt(e.x) + e.hh + 6, hi = floorAt(e.x) - e.hh - 6; if (hi > lo) { if (e.y < lo) { e.y = lo; if (e.by !== undefined) e.by = Math.max(e.by, lo); } else if (e.y > hi) { e.y = hi; if (e.by !== undefined) e.by = Math.min(e.by, hi); } } }
}
function sideKill(e) {
  const big = e.hw > 60, sz = Math.min(150, Math.max(e.hw, e.hh) * (big ? 1 : 1.2));
  explode(e.x, e.y, sz, FIRE, { debris: e.air ? '80,70,90' : '70,62,58', smoke: '42,38,40' });
  sfx.boom(sz, e.x, big ? 'big' : 'ship');
  if (big) for (let i = 0; i < 4; i++) S.events.push({ t: .15 + i * .14, fn: () => { const bx = e.x + rand(-e.hw, e.hw) * .8; explode(bx, e.y + rand(-e.hh, e.hh) * .6, rand(26, 46), FIRE); sfx.boom(36, bx, 'ship'); } });
  if (e.sea) splash(e.x, 30);
  addScore(e.score, e.x, e.y);
  const ch = { carrier: 2, base: 2, bunker: .6, seabase: .7, bomber: .8, ace: .3, hatch: .5, pod: .14, emit: .18 }[e.type] ?? .06;
  if (ch >= 2) { dropPower(e.x - 20, e.y); dropPower(e.x + 20, e.y); } else if (Math.random() < ch) dropPower(e.x, e.y);
  if (e.ground && !e.sea && GW) GW.wrecks.push({ wx: e.wx, y: e.base, w: e.hw, t: 0 });
}

