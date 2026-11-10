/* ---------- stage 3: planet base interior (side-scrolling machinery corridor) ---------- */
let IW = null;
const BASE_NAMES = [I18('外层机库', 'Outer Hangar'), I18('装配甲板', 'Assembly Deck'), I18('外闸门', 'Outer Gate'), I18('冷却管网', 'Coolant Network'), I18('反应堆导管', 'Reactor Ducts'), I18('防爆闸门', 'Blast Gate'), I18('能量输送井', 'Power Shaft'), I18('核心导管', 'Core Conduits'), I18('核心闸门', 'Core Gate'), I18('能量核心室', 'Core Chamber')];
const GATE_COL = [null, '255,190,90', '255,120,70', '200,130,255'];
const baseScroll = () => (118 + levelOf(S.sector) * 5) * (IW ? [1, 1, 1, 1.35, 1.75][IW.theme] || 1 : 1);
Object.assign(SIDE_DEF, { tur: { hw: 20, hh: 14, hp: 12, score: 260 }, pod: { hw: 22, hh: 14, hp: 15, score: 320 }, emit: { hw: 18, hh: 13, hp: 16, score: 380 }, hatch: { hw: 32, hh: 11, hp: 30, score: 520 } });
function baseProfile(lv) {
  if (lv <= 3) return { c: .11, f: .89, v: .045 };
  if (lv <= 6) return { c: .15, f: .85, v: .07 };
  if (lv <= 9) return { c: .17, f: .83, v: .085 };
  return { c: .07, f: .93, v: 0 };
}
function initBase() {
  IW = { blocks: [], flat: null, props: [], lastObj: -1e9, bg: null, bgW: 0, bgH: 0, theme: themeOf(stageOf(S.sector)) };
  S.wx = 0; S.scroll = S.scrollT = baseScroll();
  newBlock(true);
  while (IW.blocks[IW.blocks.length - 1].end < W + 1600) newBlock(true);
}
function newBlock(init) {
  const lv = IW.theme === 4 ? 8 : levelOf(S.sector), pr = baseProfile(lv), B = IW.blocks, prev = B[B.length - 1], start = prev ? prev.end : -600;
  let c, f, w;
  if (IW.flat && start >= IW.flat.from - 1) { c = IW.flat.c; f = IW.flat.f; w = 420; }
  else if (!prev || (init && start < W * .9)) { c = pr.c; f = pr.f; w = rand(240, 360); }
  else {
    w = rand(150, 330); c = pr.c + rand(-pr.v, pr.v); f = pr.f + rand(-pr.v, pr.v);
    if (lv > 3 && Math.random() < .22) { const sh = rand(-.07, .07); c += sh; f += sh; }
    c = clamp(c, .04, .32); f = clamp(f, .68, .96);
    const mg = Math.max(.5, 270 / H); if (f - c < mg) { const m = (c + f) / 2; c = m - mg / 2; f = m + mg / 2; }
  }
  const b = { start, end: start + w, c, f, haz: Math.random() < .38, lamp: Math.random() < .65, k: (Math.random() * 1000) | 0 };
  B.push(b);
  if (!init) populateBlock(b);
}
function ensureBase() {
  const B = IW.blocks;
  while (B[B.length - 1].end < S.wx + W + 1600) newBlock(false);
  while (B.length > 3 && B[1].end < S.wx - 300) B.shift();
}
function blockIdx(wx) { const B = IW.blocks; let lo = 0, hi = B.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (B[m].start <= wx) lo = m; else hi = m - 1; } return lo; }
function ceilW(wx) { const B = IW.blocks, i = blockIdx(wx), b = B[i]; if (i > 0 && wx - b.start < 36) { const a = B[i - 1]; return (a.c + (b.c - a.c) * clamp((wx - b.start) / 36, 0, 1)) * H; } return b.c * H; }
function floorW(wx) { const B = IW.blocks, i = blockIdx(wx), b = B[i]; if (i > 0 && wx - b.start < 36) { const a = B[i - 1]; return (a.f + (b.f - a.f) * clamp((wx - b.start) / 36, 0, 1)) * H; } return b.f * H; }
const ceilAt = sx => IW ? ceilW(S.wx + sx) : -1e9;
const floorAt = sx => IW ? floorW(S.wx + sx) : H;
function baseFlatFrom(wx, chamber) {
  const B = IW.blocks, i = blockIdx(wx), b = B[i];
  if (i > 0 && wx - b.start < 80) B.length = i; else { b.end = Math.max(b.start + 40, wx); B.length = i + 1; }
  IW.flat = { from: B[B.length - 1].end, c: chamber ? .06 : .1, f: chamber ? .94 : .9 };
  for (const e of ships) if (e.att && e.wx > wx - 80) { e.dead = true; clearBeamsOf(e); }
  IW.props = IW.props.filter(p => p.wx < wx - 80);
  ensureBase();
}
function populateBlock(b) {
  if (S.boss || S.bossPending || IW.flat) return;
  const lv = IW.theme === 4 ? 9 : levelOf(S.sector), len = b.end - b.start;
  if (lv === 10) return;
  for (const s of len > 250 ? [.3, .74] : [.5]) {
    const wx = b.start + len * s;
    if (wx - IW.lastObj < 170 || Math.random() > .42 + lv * .05) continue;
    const att = Math.random() < .5 ? 'c' : 'f';
    const wts = [['tur', 3], ['pod', lv >= 2 ? 1.5 : 0], ['emit', lv >= 4 ? 1.3 : 0], ['hatch', lv >= 2 ? .55 : 0], ['crusher', lv >= 2 ? 1.3 : 0], ['vent', 1], ['arc', lv >= 4 ? 1 : 0]];
    let tot = 0; for (const w of wts) tot += w[1];
    let r = Math.random() * tot, type = 'tur';
    for (const [k, w] of wts) { r -= w; if (r <= 0) { type = k; break; } }
    IW.lastObj = wx;
    if (type === 'crusher' || type === 'vent' || type === 'arc') IW.props.push({ k: type, wx, att, t: rand(0, 3), cyc: type === 'arc' ? 3.2 : type === 'crusher' ? 2.8 : 3, hp: 26 * sideK(), maxhp: 26 * sideK(), dead: false, hitT: 0, ext: 0, x: wx - S.wx, prevPh: 0 });
    else baseUnit(type, wx, att);
  }
}
function baseUnit(type, wx, att) {
  const e = sideUnit(type, wx - S.wx, 0); e.ground = true; e.att = att; e.wx = wx; e.aim = att === 'c' ? Math.PI * .75 : Math.PI * 1.25;
  if (type === 'hatch') e.fireT = rand(1, 2);
  baseUnitPos(e); return e;
}
function baseUnitPos(e) { e.x = e.wx - S.wx; e.base = e.att === 'c' ? ceilW(e.wx) : floorW(e.wx); e.y = e.att === 'c' ? e.base + e.hh * .8 : e.base - e.hh * .8; }
function updateBaseUnit(e, dt, on, K, sp, lv) {
  switch (e.type) {
    case 'tur': {
      if (on) turnTo(e, aimAng(e.x, e.y), dt, 3);
      if (on && e.fireT <= 0) {
        const mx = e.x + Math.cos(e.aim) * e.hw * 1.1, my = e.y + Math.sin(e.aim) * e.hw * 1.1;
        if (e.alt++ % 3 === 2) eFire('shell', mx, my, e.aim, 260 * sp, { fuse: clamp(Math.hypot(P.x - mx, P.y - my) / 260, .35, 2.2), n: 8 });
        else tracer(mx, my, e.aim, 400 * sp, 3);
        e.fireT = rand(1.4, 2) / K;
      }
      break;
    }
    case 'pod': {
      if (on && e.fireT <= 0 && e.x > P.x - 40) {
        const a0 = e.att === 'c' ? Math.PI * .72 : Math.PI * 1.28;
        for (const k of [-1, 1]) eFire('homing', e.x + k * 8, e.y, a0 + k * .22, 160 * sp, { mis: true, seek: 2.2, turn: 2.2 + lv * .1, silent: k > 0 });
        e.fireT = rand(2.8, 3.6) / K;
      }
      break;
    }
    case 'emit': {
      if (on) turnTo(e, aimAng(e.x, e.y), dt, 2);
      if (on && e.fireT <= 0 && e.x > P.x + 60 && !beams.some(b => b.owner === e)) { addBeam({ owner: e, ox: 0, oy: 0, w: 10, charge: 1.15, fire: 1, mode: 'track', sweep: .3, c: '120,235,255', dmg: 14 }); e.fireT = rand(3.6, 4.6) / K; }
      break;
    }
    case 'hatch': {
      e.open = Math.max(0, (e.open || 0) - dt);
      if (on && e.fireT <= 0 && e.x > P.x + 120 && ships.length < 26) {
        e.open = 1.3;
        for (let k = 0; k < 2; k++) S.events.push({ t: .3 + k * .45, fn: () => { if (e.dead || !P.alive) return; const f = spawnAir('fighter', e.x, e.y + (e.att === 'c' ? e.hh : -e.hh)); f.climb = .8; f.vx = -150; f.vy = e.att === 'c' ? 40 : -230; } });
        e.fireT = rand(5.5, 7) / K;
      }
      break;
    }
  }
}
function updateBaseProps(dt) {
  for (const p of IW.props) {
    if (p.dead) continue;
    p.t += dt; p.hitT -= dt; p.x = p.wx - S.wx;
    if (p.x < -140) { p.dead = true; continue; }
    const ph = p.t % p.cyc, c = ceilW(p.wx), f = floorW(p.wx), gap = f - c, vis = p.x > -40 && p.x < W + 40;
    p.c = c; p.f = f;
    if (p.k === 'crusher') {
      p.warn = ph > 1.2 && ph < 1.8;
      p.ext = clamp(ph < 1.8 ? (p.warn ? .06 + .03 * Math.sin(p.t * 50) : .04) : ph < 1.95 ? (ph - 1.8) / .15 : ph < 2.3 ? 1 : 1 - (ph - 2.3) / .5, 0, 1);
      p.reach = p.ext * gap * .5;
      if (vis && p.prevPh < 1.95 && ph >= 1.95) { const y = p.att === 'c' ? c + p.reach + 24 : f - p.reach - 24; sparks(p.x, y, 8, ['255,220,180', '255,255,255', FLARE], p.att === 'c' ? Math.PI / 2 : -Math.PI / 2, 1.2); sfx.boom(24, p.x, 'missile'); shake(3); }
    } else if (p.k === 'vent') {
      p.warn = ph > 1.3 && ph < 1.8; p.on = ph >= 1.8 && ph < 2.8;
      p.len = p.on ? gap * .42 * Math.min(1, (ph - 1.8) / .15, (2.8 - ph) / .2) : 0;
      if (vis && p.prevPh < 1.8 && ph >= 1.8) sfx.whoosh(p.x);
    } else {
      p.warn = ph > 1.5 && ph < 2.1; p.on = ph >= 2.1 && ph < 3.1;
      if (vis && p.prevPh < 2.1 && ph >= 2.1) sfx.zap(p.x);
    }
    p.prevPh = ph;
  }
  IW.props = IW.props.filter(p => !p.dead);
}
function propHitsLaser(l) {
  for (const p of IW.props) {
    if (p.dead || Math.abs(l.x - p.x) > 40) continue;
    if (p.k === 'crusher') {
      const y0 = p.att === 'c' ? p.c : p.f - p.reach - 24, y1 = p.att === 'c' ? p.c + p.reach + 24 : p.f;
      if (Math.abs(l.x - p.x) < 30 && l.y > y0 && l.y < y1) { sparks(l.x, l.y, 2, ['255,220,180', '255,255,255'], Math.PI, 1.6); return true; }
    } else if (p.k === 'arc') {
      for (const y of [p.c + 14, p.f - 14]) if (Math.hypot(l.x - p.x, l.y - y) < 17) {
        p.hp -= l.dmg; p.hitT = .08; sparks(l.x, l.y, 3, ['160,220,255', WHITE], Math.PI, 2); sfx.hit(l.x, true);
        if (p.hp <= 0) arcDown(p);
        return true;
      }
    }
  }
  return false;
}
function arcDown(p) {
  p.dead = true;
  for (const y of [p.c + 14, p.f - 14]) explode(p.x, y, 34, ['160,220,255', WHITE, FLARE], { debris: '80,86,100' });
  sfx.boom(40, p.x, 'ship'); addScore(400, p.x, (p.c + p.f) / 2); S.kills++;
}
function propHitsPlayer() {
  for (const p of IW.props) {
    if (p.dead || Math.abs(P.x - p.x) > 46) continue;
    if (p.k === 'crusher') {
      const y0 = p.att === 'c' ? p.c : p.f - p.reach - 24, y1 = p.att === 'c' ? p.c + p.reach + 24 : p.f;
      if (Math.abs(P.x - p.x) < 40 && P.y > y0 - 10 && P.y < y1 + 10) { hurt(30); P.gx -= 260; P.gy += p.att === 'c' ? 320 : -320; }
    } else if (p.k === 'vent' && p.on && p.len > 4) {
      const y0 = p.att === 'c' ? p.c : p.f - p.len, y1 = p.att === 'c' ? p.c + p.len : p.f;
      if (Math.abs(P.x - p.x) < 22 && P.y > y0 - 8 && P.y < y1 + 8) hurt(14);
    } else if (p.k === 'arc' && p.on && Math.abs(P.x - p.x) < 16 && P.y > p.c && P.y < p.f) hurt(30);
  }
}
function updateBaseWorld(dt) {
  if (!IW) return;
  S.scroll += (S.scrollT * (S.trans ? 1 : S.flow || 1) - S.scroll) * Math.min(1, dt * 1.5);
  S.wx += S.scroll * dt;
  ensureBase(); updateBaseProps(dt);
  if (IW.theme === 2) hiveAmbient(dt);
  else if (IW.theme === 3) cryoAmbient(dt);
  else if (Math.random() < dt * 1.4 && parts.length < 1200) {
    const x = rand(W * .15, W), top = Math.random() < .5, y = top ? ceilAt(x) : floorAt(x);
    parts.push({ k: 'smoke', x, y, vx: -S.scroll * .25 + rand(-10, 10), vy: top ? rand(18, 46) : -rand(18, 46), life: rand(1, 1.8), max: 1.8, r: rand(6, 12), g: 14, c: '120,132,150' });
  }
}
function baseBand() {
  let t = 0, b = H;
  for (let x = W * .45; x <= W; x += 40) { t = Math.max(t, ceilAt(x)); b = Math.min(b, floorAt(x)); }
  return [t + 40, Math.max(t + 60, b - 40)];
}
function baseWave() {
  const lv = levelOf(S.sector), [minY, maxY] = baseBand(), r = Math.random();
  if (lv >= 3 && r < .25) { for (let i = 0; i < (lv >= 6 ? 2 : 1); i++) spawnAir('ace', W + 40 + i * 80, rand(minY, maxY)); }
  else {
    const n = 3 + Math.min(2, Math.floor(lv / 3)), y0 = rand(minY + 20, Math.max(minY + 21, maxY - 20));
    for (let i = 0; i < n; i++) { const m = i - (n - 1) / 2; spawnAir('fighter', W + 40 + Math.abs(m) * 38, clamp(y0 + m * 28, minY, maxY), { amp: 6 }); }
  }
}
function baseSpawnLogic(dt) {
  const lv = levelOf(S.sector);
  S.sectorT += dt * (S.flow || 1);
  if ((lv % 3 === 0 || lv === 10) && !IW.flat && S.sectorT > secLen() - 8) baseFlatFrom(S.wx + W + 40, lv === 10);
  if (!S.boss && !S.bossPending && S.sectorT >= secLen()) {
    const n = cycOf(stageOf(S.sector));
    if (lv === 10) { S.bossPending = true; S.warn = 3.4; sfx.warn(); S.warnName = bossLabel(['core', 'core', 'hivemind', 'zero'][IW.theme], n); S.events.push({ t: 2.4, fn: () => spawnCore(n) }); }
    else if (lv % 3 === 0) { const g = lv / 3; S.bossPending = true; S.warn = 3.4; sfx.warn(); S.warnName = bossLabel(['gate', 'gate', 'hgate', 'cgate'][IW.theme] + g, n); S.events.push({ t: 2.4, fn: () => spawnGate(g, n) }); }
    else nextSector();
  }
  const B = S.boss;
  if (B && (B.kind === 'core' || B.gate >= 2) && B.entered && !B.dying) { S.tShip -= dt; if (S.tShip <= 0) { if (ships.reduce((k, e) => k + (e.air ? 1 : 0), 0) < 8) baseWave(); S.tShip = rand(5, 7); } }
  if (S.boss || S.bossPending) return;
  S.tShip -= dt * (S.flow || 1);
  if (S.tShip <= 0) { baseWave(); S.tShip = rand(2.8, 4.2) / (1 + (lv - 1) * .06) * (IW.theme === 3 ? .7 : 1); }
}
function enterBase() {
  S.side = true; planet = null; GW = null;
  for (const a of [holes, rocks, ships, ebul, powers, missiles, lasers]) a.length = 0;
  clearBeams(); S.boss = null; S.bossPending = false;
  initBase(); S.tShip = 3; S.heat = 0; S.dark = 0;
  if (H > W * 1.2) S.toast = { txt: I18('提示：横屏游玩视野更开阔', 'Tip: play in landscape for a wider view'), t: 6 };
  saveStage(stageOf(S.sector));
}

