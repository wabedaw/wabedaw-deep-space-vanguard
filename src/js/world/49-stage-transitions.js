/* ---------- stage transitions ---------- */
function beginTransition(kind) {
  if (S.mode !== 'play' || !P.alive) return;
  S.trans = { kind, t: 0, t2: 0, switched: false, th: themeOf(stageOf(kind === 'escape' ? S.sector : S.sector + 1)) };
  clearBeams(); ebul.length = 0; S.toast = null; P.vx = P.vy = P.gx = P.gy = 0; drag = null; ultDarts.length = 0; S.ultNova = null;
  sfx.entry(kind === 'entry' ? 4 : 2.2);
}
function transExhaust(dirX, dirY, col, n = 3) {
  if (parts.length > 1500) return;
  for (let i = 0; i < n; i++) parts.push({ k: 'ember', x: P.x - dirX * 26 + rand(-4, 4), y: P.y - dirY * 26 + rand(-4, 4), vx: -dirX * rand(300, 520) + rand(-40, 40), vy: -dirY * rand(300, 520) + rand(-40, 40), life: rand(.2, .45), max: .45, c: pick(col), r: rand(1.6, 3) });
}
function updateTransitionOld(dt) {
  const tr = S.trans; tr.t += dt; P.inv = Math.max(P.inv, 1); P.alive = true;
  P.fireCd -= dt; P.muzzle -= dt;
  if (tr.kind === 'entry') {
    if (!tr.switched) {
      P.x += (W / 2 - P.x) * Math.min(1, dt * 2); P.y += (H * .62 - P.y) * Math.min(1, dt * 2); P.bank *= .9; P.evy = -900;
      S.heat = clamp(tr.t / 2.4, 0, 1); shake(1.5 + S.heat * 6);
      if (parts.length < 1500) for (let i = 0; i < 4; i++) parts.push({ k: 'ember', x: P.x + rand(-26, 26) * S.heat, y: P.y - 30 - rand(0, 10), vx: rand(-60, 60), vy: rand(500, 900), life: rand(.2, .5), max: .5, c: pick(['255,230,190', '255,170,80', '255,110,50', '255,255,255']), r: rand(1.5, 3.5) });
      if (tr.t >= 2.4) {
        tr.switched = true; S.wflash = 1; S.heat = 0;
        S.sector++; S.sectorT = 0; S.bossPending = false;
        enterSurface(); P.x = W * .14; P.y = H * .16; P.evx = 0;
      }
    } else {
      tr.t2 += dt;
      P.x += (W * .24 - P.x) * Math.min(1, dt * 2.2); P.y += (H * .4 - P.y) * Math.min(1, dt * 2.2); P.evx = 300 * (1 - tr.t2 / 2);
      S.heat = Math.max(0, .7 - tr.t2 * .45); if (S.heat > 0) transExhaust(1, 0, ['255,190,120', '255,140,70', '255,240,200'], 2); else transExhaust(1, 0, ['120,200,255', '200,240,255'], 1);
      if (tr.t2 >= 2) { S.trans = null; S.heat = 0; S.banner = { big: stageTag(stageOf(S.sector)), sub: I18('外星地表 · ', 'ALIEN SURFACE · ') + sectorName(), t: 0, dur: 3.6 }; sfx.sector(); }
    }
  } else if (tr.kind === 'breach') {
    if (!tr.switched) {
      const co = ships.find(e => e.kind === 'colossus'), tx = co ? co.x : W * .75, ty = co ? co.y : H * .6;
      S.scrollT = 0; P.x += (tx - P.x) * Math.min(1, dt * 1.1); P.y += (ty - P.y) * Math.min(1, dt * 1.1); P.evx = 300; P.bank *= .9;
      S.dark = clamp(tr.t / 2.2, 0, 1); transExhaust(1, 0, ['120,200,255', '200,240,255', '255,255,255'], 2);
      if (tr.t >= 2.2) { tr.switched = true; S.sector++; S.sectorT = 0; S.bossPending = false; enterBase(); P.x = W * .08; P.y = H * .5; P.gx = P.gy = 0; S.dark = 1; }
    } else {
      tr.t2 += dt; S.dark = Math.max(0, 1 - tr.t2 / 1.4); P.x += (W * .22 - P.x) * Math.min(1, dt * 2); P.y += (H * .5 - P.y) * Math.min(1, dt * 2); transExhaust(1, 0, ['120,200,255', '200,240,255'], 1);
      if (tr.t2 >= 1.6) { S.trans = null; S.dark = 0; S.banner = { big: stageTag(stageOf(S.sector)), sub: I18('基地内部 · ', 'BASE INTERIOR · ') + sectorName(), t: 0, dur: 3.6 }; sfx.sector(); }
    }
  } else if (tr.kind === 'escape') {
    if (!tr.switched) {
      S.scrollT = 460; P.x += (W * .8 - P.x) * Math.min(1, dt * 1.2); P.y += (H * .5 - P.y) * Math.min(1, dt * 1.5); P.evx = 500; P.bank *= .9;
      transExhaust(1, 0, ['120,200,255', '200,240,255', '255,255,255'], 3); shake(4);
      if (rnd() < .25 && parts.length < 1300) explode(rand(0, W * .45), rand(H * .2, H * .8), rand(20, 50), FIRE);
      S.wflash = Math.max(S.wflash, clamp((tr.t - 1.5) / .7, 0, 1));
      if (tr.t >= 2.2) {
        tr.switched = true; S.wflash = 1; leaveSurface(); S.sector++; S.sectorT = 0; S.bossPending = false;
        P.x = W / 2; P.y = H + 40; P.gy = -280; P.bank = 0;
        S.banner = { big: stageTag(stageOf(S.sector)), sub: I18('逃离基地 · 重返星海 · ', 'BASE ESCAPED · BACK TO THE STARS · ') + sectorName(), t: 0, dur: 3.6 }; saveStage(stageOf(S.sector));
      }
    } else { tr.t2 += dt; P.y += P.gy * dt; P.gy *= Math.max(0, 1 - dt * 1.4); if (tr.t2 > 1.3) { S.trans = null; sfx.sector(); } }
  } else {
    if (!tr.switched) {
      S.scrollT = 320; P.x += (W * .62 - P.x) * Math.min(1, dt * 1.2); P.y += (-90 - P.y) * Math.min(1, dt * .9); P.evx = 400; P.bank = -.4;
      S.dark = clamp(tr.t / 2.2, 0, 1); transExhaust(1, -.4, ['120,200,255', '200,240,255', '255,255,255'], 2);
      if (tr.t >= 2.2) {
        tr.switched = true; S.wflash = 1; S.dark = 0;
        leaveSurface(); S.sector++; S.sectorT = 0; S.bossPending = false;
        P.x = W / 2; P.y = H + 40; P.gy = -280; P.bank = 0;
        S.banner = { big: stageTag(stageOf(S.sector)), sub: I18('重返星海 · ', 'BACK TO THE STARS · ') + sectorName(), t: 0, dur: 3.6 }; saveStage(stageOf(S.sector));
      }
    } else { tr.t2 += dt; P.y += P.gy * dt; P.gy *= Math.max(0, 1 - dt * 1.4); if (tr.t2 > 1.3) { S.trans = null; sfx.sector(); } }
  }
}
function enterSurface() {
  S.side = true; planet = null; IW = null;
  for (const a of [holes, rocks, ships, ebul, powers, missiles, lasers]) a.length = 0;
  clearBeams(); S.boss = null; S.bossPending = false;
  initTerrain(); S.tShip = 2.2; S.tBomber = 12; S.heat = 0; S.dark = 0; S.tLance = 9; S.lanceTip = false;
  if (H > W * 1.2) S.toast = { txt: I18('提示：横屏游玩视野更开阔', 'Tip: play in landscape for a wider view'), t: 6 };
  saveStage(stageOf(S.sector));
}
function regenTerrain() {
  const key = GW.skyKey; GW.cols = []; GW.decor = []; GW.fauna = []; GW.head = Math.floor((S.wx - 60) / STEPW) * STEPW; GW.seg = null;
  GW.seg = { b: GW.force || ([0, LV_BIOMES, LV_BIOMES_B, LV_BIOMES_C][GW.theme] || LV_BIOMES)[levelOf(S.sector) - 1][0], start: GW.head - 999, end: GW.head + 1500, fromY: H * .8, rc: -1e9, rw: 1 };
  while (GW.head < S.wx + W + 1500) genCol();
  setSky(key, true);
  for (const e of ships) if (e.ground) e.base = e.sea ? waterY() : groundAt(e.wx) + 3;
  for (const e of ships) if (e.kind === 'colossus') { e.groundY = H * .82; e.base = e.groundY; e.y = e.groundY - e.hh; }
}
function leaveSurface() {
  S.side = false; GW = null; IW = null;
  for (const a of [ships, ebul, powers, missiles, lasers, holes, rocks]) a.length = 0;
  clearBeams(); S.boss = null; S.tShip = 2; S.tRock = 1; S.tHole = 26; S.tGiant = 16;
}
function saveStage(st) { if (S.dev) return; stageReached(st); if (st > (SAVE.get('stage') | 0)) SAVE.set('stage', st); }
function bestStage() { return Math.max(1, SAVE.get('stage') | 0); }
function startAtStage(st) {
  S.sector = (st - 1) * 10 + 1; S.sectorT = 0;
  for (const p of PLAYERS) { p.lvl = [1, 5, 7, 8, 8, 9, 9, 10, 10][Math.min(st, 9) - 1]; p.mis = p.misMax; }
  if (isSurfaceStage(st)) { enterSurface(); P.x = -30; P.y = H * .4; P.gx = 320; P.gy = 0; }
  else if (isBaseStage(st)) { enterBase(); P.x = -30; P.y = H * .5; P.gx = 320; P.gy = 0; }
  formFollowers();
  S.banner = { big: stageTag(st), sub: (isSurfaceStage(st) ? I18('外星地表 · ', 'ALIEN SURFACE · ') : isBaseStage(st) ? I18('基地内部 · ', 'BASE INTERIOR · ') : '') + sectorName(), t: 0, dur: 3.4 };
}
function drawTransFx() {
  if (S.heat > 0 && !S.side) {
    const k = S.heat;
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, `rgba(255,120,40,${.35 * k})`); g.addColorStop(.6, `rgba(255,80,30,${.1 * k})`); g.addColorStop(1, 'rgba(255,60,20,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(P.x, P.y - 34, 70 * k + 20, '255,150,60', .8 * k); drawGlow(P.x, P.y - 30, 30 * k + 8, '255,240,200', .9 * k);
    ctx.strokeStyle = `rgba(255,200,140,${.35 * k})`; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let i = 0; i < 26; i++) { const x = (i * 97 + S.t * 40) % W, y = (S.t * 1600 + i * 233) % (H + 200) - 100; ctx.moveTo(x, y); ctx.lineTo(x, y + 60 + 80 * k); }
    ctx.stroke(); ctx.globalCompositeOperation = 'source-over';
  } else if (S.heat > 0 && S.side) {
    ctx.globalCompositeOperation = 'lighter'; drawGlow(P.x + 30, P.y, 50 * S.heat + 10, '255,150,60', .8 * S.heat); ctx.globalCompositeOperation = 'source-over';
  }
  if (S.dark > 0) { ctx.fillStyle = `rgba(2,3,10,${S.dark * .85})`; ctx.fillRect(0, 0, W, H); }
  drawCineFront();
}

function updateShip(e, dt) {
  if (e.surf) { updateSideUnit(e, dt); return; }
  e.t += dt; e.hitT -= dt;
  if (e.cap) {
    const p = spiralStep(e, e.cap, dt);
    if (p >= 1) { e.dead = true; e.fcount = 1; S.kills++; const h = e.cap.h; addScore(Math.round(e.score * .5), h.x, h.y - h.r * 2); floatText(h.x, h.y - h.r * 2 - 18, I18('被吞噬', 'CONSUMED'), FLARE, true); parts.push({ k: 'flash', x: h.x, y: h.y, vx: 0, vy: 0, life: .3, max: .3, r: h.r * 4, c: '255,220,180' }); sfx.boom(18, h.x, 'missile'); }
    return;
  }
  if (e.type !== 'boss') for (const h of holes) {
    const dx = h.x - e.x, dy = h.y - e.y, d = Math.hypot(dx, dy) || 1;
    if (d < h.cap * (e.type === 'gunship' ? .8 : 1)) { e.cap = { h, t: 0, dur: e.type === 'gunship' ? 2 : 1.5, ang: Math.atan2(e.y - h.y, e.x - h.x), rad0: d }; clearBeamsOf(e); return; }
    if (d < h.R) {
      const k = Math.pow(clamp((h.R - d) / (h.R - h.cap), 0, 1), 2) * (e.type === 'gunship' ? .7 : 1), pull = HOLE_PULL * .85 * k * dt;
      const mx = dx / d * pull - dy / d * pull * .3 * h.spin, my = dy / d * pull + dx / d * pull * .3 * h.spin;
      e.x += mx; e.y += my; e.bx += mx; if (e.ty !== undefined) e.ty += my;
    }
  }
  const d = diff(), spK = Math.min(1.45, Math.sqrt(d));
  const canFire = S.mode === 'play' && P.alive && !P.cap;
  if (e.type === 'drone') {
    e.y += e.vy * dt;
    e.x = clamp(e.bx + Math.sin(e.t * e.wf + e.ph) * e.amp, 20, W - 20);
    e.fireT -= dt;
    if (canFire && e.fireT <= 0 && e.y > 30 && e.y < H * .62) {
      if (e.needle) eFire('needle', e.x, e.y + 12, aimAng(e.x, e.y), 360 * spK); else eShot(e.x, e.y + 12, aimAng(e.x, e.y), 230 * spK);
      e.fireT = rand(1.9, 3) / Math.sqrt(d);
    }
    if (e.y > H + 40) e.dead = true;
  } else if (e.type === 'raider') {
    if (e.state === 0) { e.y += (e.ty - e.y) * Math.min(1, dt * 2.2); if (Math.abs(e.ty - e.y) < 6) e.state = 1; }
    else if (e.state === 1) {
      e.x += e.vx * dt; e.y += 12 * dt;
      if (e.x < 34 || e.x > W - 34) { e.vx *= -1; e.x = clamp(e.x, 34, W - 34); }
      e.fireT -= dt;
      if (canFire && e.fireT <= 0) {
        const a = aimAng(e.x, e.y), m = e.alt % (S.sector >= 2 ? 3 : 2);
        if (m === 0) for (const o of [-.2, 0, .2]) eShot(e.x, e.y + 16, a + o, 210 * spK);
        else if (m === 1) for (let i = 0; i < 3; i++) S.events.push({ t: i * .09, fn: () => { if (!e.dead && P.alive) eFire('needle', e.x, e.y + 16, aimAng(e.x, e.y), 380 * spK, { silent: i > 0 }); } });
        else for (const o of [-.25, .25]) eFire('wave', e.x, e.y + 16, a + o, 170 * spK, { amp: 22, f: 7 });
        e.alt++; e.fireT = 1.7 / Math.sqrt(d);
      }
      if (e.t > 11) e.state = 2;
    } else { e.y += 220 * dt; if (e.y > H + 50) e.dead = true; }
  } else if (e.type === 'gunship') {
    let da = aimAng(e.x, e.y) - e.aim; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
    e.aim += da * Math.min(1, dt * 3);
    if (e.state === 0) { e.y += (e.ty - e.y) * Math.min(1, dt * 1.2); if (Math.abs(e.ty - e.y) < 5) e.state = 1; }
    else if (e.state === 1) {
      e.x = clamp(e.x + Math.sin(e.t * .7) * 40 * dt, 50, W - 50);
      e.fireT -= dt;
      if (canFire && e.fireT <= 0) {
        const m = e.alt % 3;
        if (m === 0) { const n = 12; const o = rand(0, TAU); for (let i = 0; i < n; i++) eShot(e.x, e.y, o + i / n * TAU, 150 * spK, FLARE, 6); }
        else if (m === 1) for (const o of [-70, 70]) lobShell(e.x + Math.cos(e.aim) * 30, e.y + Math.sin(e.aim) * 30, P.x + o, P.y - 20, 200 * spK, 8);
        else if (S.sector >= 2) for (const s of [-1, 1]) eFire('homing', e.x + s * 26, e.y, -Math.PI / 2 + s * .7, 140 * spK, { seek: 2.4, silent: s > 0 });
        else for (let i = 0; i < 3; i++) S.events.push({ t: i * .12, fn: () => { if (!e.dead && P.alive) eShot(e.x + Math.cos(e.aim) * 30, e.y + Math.sin(e.aim) * 30, e.aim, 290 * spK, FLARE, 5); } });
        e.alt++; e.fireT = 2.3 / Math.sqrt(d);
      }
      if (e.t > 19) e.state = 2;
    } else { e.y += 90 * dt; if (e.y > H + 70) e.dead = true; }
  } else if (e.type === 'lancer') {
    const mine = beams.find(b => b.owner === e);
    if (e.state === 0) { e.y += (e.ty - e.y) * Math.min(1, dt * 1.8); if (Math.abs(e.ty - e.y) < 5) { e.state = 1; e.fireT = .6; } }
    else if (e.state === 1) {
      if (!mine) { e.x += (e.tx - e.x) * Math.min(1, dt * 1.5); e.fireT -= dt; }
      if (canFire && !mine && e.fireT <= 0) {
        if (e.shots >= 3) e.state = 2;
        else { addBeam({ owner: e, ox: 0, oy: 16, w: 9, charge: 1.05, fire: .75, mode: 'track', sweep: .22 * spK, c: '120,235,255', dmg: 12 }); e.shots++; e.fireT = 1.3; e.tx = clamp(P.x + rand(-170, 170), 40, W - 40); }
      }
    } else { e.y -= 160 * dt; if (e.y < -70) e.dead = true; }
    e.aim = mine ? mine.ang : e.aim + (Math.PI / 2 - e.aim) * Math.min(1, dt * 3);
    e.charging = !!(mine && !mine.firing);
  } else if (HIVE_TYPES.has(e.type)) updateHive(e, dt, canFire, spK, d);
  else if (CRYO_TYPES.has(e.type)) updateCryo(e, dt, canFire, spK, d);
  else if (e.type === 'boss') updateBoss(e, dt, canFire, spK);
}

function spawnHole(x, y, vy) {
  const r = clamp(Math.min(W, H) * .045, 20, 30);
  const narrow = W < 520;
  const h = { x: x ?? rand(W * .28, W * .72), y: y ?? -r * 5, vy: vy ?? 24, r, R: r * (narrow ? 10.4 : 12.8), cap: r * (narrow ? 3.36 : 4), spin: 1, G: 2.4e6 * (r / 28) ** 2, t: 0,
    tilt: rand(-.28, .28), mass: (rand(3.2, 9.8)).toFixed(1), disk: [], flow: [] };
  for (let i = 0; i < 70; i++) h.flow.push({ a: rand(0, TAU), rad: rand(h.cap * .9, h.R) });
  for (let i = 0; i < 300; i++) {
    const rad = r * (1.55 + Math.pow(rnd(), 1.6) * 2.4);
    h.disk.push({ a: rand(0, TAU), rad, w: 2.6 * Math.pow(r * 1.55 / rad, 1.5), s: rand(.8, 2.2) });
  }
  holes.push(h);
  return h;
}
const PU = {
  W: { c: ION, label: I18('武器升级', 'Weapon upgrade'), ch: 'W' },
  S: { c: '130,175,255', label: I18('护盾充能', 'Shield recharged'), ch: 'S' },
  M: { c: FLARE, label: I18f('飞弹 +{0}', 'Missiles +{0}', BAL.pickups.missiles), ch: 'M' },
  H: { c: '120,255,175', label: I18f('舰体修复 +{0}', 'Hull repaired +{0}', BAL.pickups.hullRepair), ch: '+' },
};
function dropPower(x, y, type) {
  if (!type) {
    const r = rnd();
    const c = BAL.pickups;
    type = r < (P.lvl < 10 ? c.weaponChance : c.weaponChanceAtMax) ? 'W' : r < c.missileBelow ? 'M' : r < c.shieldBelow ? 'S' : 'H';
  }
  powers.push({ x, y, type, t: 0, vy: 70 });
}

