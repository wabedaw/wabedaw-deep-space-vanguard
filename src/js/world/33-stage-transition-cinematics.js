/* ---------- stage-transition cinematics: atmosphere entry, fortress breach, base escape ---------- */
const CINE_PAL = {
  1: { cloud: '240,244,255', cover: '228,236,248', sky: ['#0c2350', '#1e5b93', '#8cc8e0'], planet: ['#3f8a74', '#173a34', '#061210'], atm: '120,190,255', lights: '255,210,140',
    blast: ['255,255,255', '170,240,255', '110,200,255', '70,120,255'], rib: '#1c2534', ribL: '120,220,255', tun: '#04070d', fire: '255,170,90' },
  2: { cloud: '128,96,88', cover: '98,66,58', sky: ['#14060a', '#7a2418', '#ff9a4a'], planet: ['#6a3220', '#2a120c', '#100604'], atm: '255,130,60', lights: '255,120,40',
    blast: ['255,255,255', '210,255,170', '140,255,110', '255,110,190'], rib: '#3e1634', ribL: '170,255,120', tun: '#0e040b', fire: '255,120,60' },
};
const cinePal = tr => CINE_PAL[tr.th] || CINE_PAL[1];
function cineSprites(tr) { if (!tr.spr) tr.spr = makeCloudSprites(cinePal(tr).cloud); return tr.spr; }
function puffV(tr) { tr.puffs.push({ x: rand(-260, W), y: -rand(140, 320), s: rand(1.4, 3.2), i: (rnd() * 4) | 0, a: rand(.55, .95), f: rnd() < .4, vx: 0, vy: rand(900, 1500) }); }
function puffS(tr, x) { tr.puffs.push({ x: x ?? W + rand(20, 200), y: rand(-60, H * .9), s: rand(1.5, 3.4), i: (rnd() * 4) | 0, a: rand(.55, .95), f: rnd() < .5, vx: -rand(1100, 1700), vy: rand(-40, 60) }); }
function updPuffs(tr, dt) { for (const p of tr.puffs) { p.x += p.vx * dt; p.y += p.vy * dt; } tr.puffs = tr.puffs.filter(p => p.y < H + 60 && p.x > -320 * p.s - 40); }
function drawPuffs(tr, front, fade = 1) {
  if (!tr.puffs || !tr.puffs.length || fade <= 0) return;
  const spr = cineSprites(tr);
  for (const p of tr.puffs) if (p.f === front) { ctx.globalAlpha = p.a * fade; ctx.drawImage(spr[p.i], p.x, p.y, 320 * p.s, 120 * p.s); }
  ctx.globalAlpha = 1;
}
function escBlastPos(tr) { const R = Math.max(W, H) * 1.25, cy = H + R * .8 + tr.t2 * 140; return [W * .5, cy - R + 4, R, cy]; }
function updateTransition(dt) {
  const tr = S.trans;
  if (tr.kind === 'dive') return updateDive(tr, dt);
  if (tr.kind === 'ending') return updateEnding(tr, dt);
  if (tr.kind !== 'entry' && tr.kind !== 'breach' && tr.kind !== 'escape') return updateTransitionOld(dt);
  tr.t += dt; P.inv = Math.max(P.inv, 1); P.alive = true; P.fireCd -= dt; P.muzzle -= dt;
  if (!tr.puffs) tr.puffs = [];
  const pal = cinePal(tr);
  if (tr.kind === 'entry') {
    if (!tr.switched) {
      P.x += (W / 2 - P.x) * Math.min(1, dt * 2); P.y += (H * .62 - P.y) * Math.min(1, dt * 2); P.bank *= .9; P.evy = -900;
      S.heat = tr.t < 2.4 ? clamp(tr.t / 2.4, 0, 1) : Math.max(0, 1 - (tr.t - 2.4) / 1.1);
      shake(1.5 + S.heat * 6 + (tr.t > 2.6 ? 1.5 : 0)); S.speedK = Math.max(S.speedK, 1 + tr.t * .9);
      if (S.heat > .15 && parts.length < 1500) for (let i = 0; i < 4; i++) parts.push({ k: 'ember', x: P.x + rand(-26, 26) * S.heat, y: P.y - 30 - rand(0, 10), vx: rand(-60, 60), vy: rand(500, 900), life: rand(.2, .5), max: .5, c: pick(['255,230,190', '255,170,80', '255,110,50', '255,255,255']), r: rand(1.5, 3.5) });
      if (tr.t > 1.5 && (rocks.length || holes.length)) { for (const k of rocks) explode(k.x, k.y, k.r * .7, FIRE); rocks.length = 0; holes.length = 0; }
      if (tr.t > 1.9) { tr.acc = (tr.acc || 0) + dt * (10 + (tr.t - 1.9) * 26); while (tr.acc > 1) { tr.acc--; puffV(tr); } }
      updPuffs(tr, dt);
      if (tr.t >= 4) {
        tr.switched = true; S.heat = 0; S.wflash = Math.max(S.wflash, .3);
        S.sector++; S.sectorT = 0; S.bossPending = false;
        enterSurface(); P.x = W * .14; P.y = H * .12; P.evx = 0;
        tr.puffs = []; for (let i = 0; i < 26; i++) puffS(tr, rand(-200, W * 1.4));
        sfx.whoosh(W * .5);
      }
    } else {
      tr.t2 += dt;
      P.x += (W * .24 - P.x) * Math.min(1, dt * 1.6); P.y += (H * .42 - P.y) * Math.min(1, dt * 1.1); P.evx = 300 * Math.max(0, 1 - tr.t2 / 2.6);
      S.heat = Math.max(0, .45 - tr.t2 * .4); transExhaust(1, 0, ['120,200,255', '200,240,255'], 1);
      if (tr.t2 < 1.1) { tr.acc = (tr.acc || 0) + dt * 22; while (tr.acc > 1) { tr.acc--; puffS(tr); } }
      updPuffs(tr, dt);
      if (tr.t2 >= 2.6) { S.trans = null; S.heat = 0; S.banner = { big: stageTag(stageOf(S.sector)), sub: I18('外星地表 · ', 'ALIEN SURFACE · ') + sectorName(), t: 0, dur: 3.6 }; sfx.sector(); }
    }
  } else if (tr.kind === 'breach') {
    if (!tr.switched) {
      const co = ships.find(e => e.kind === 'colossus');
      tr.hx = co ? co.x : W * .75; tr.hy = co ? co.y : H * .6; tr.hr = co ? co.hh * .42 : 60;
      S.scrollT = 0; P.x += (tr.hx - P.x) * Math.min(1, dt * 1.1); P.y += (tr.hy - P.y) * Math.min(1, dt * 1.1); P.evx = 300; P.bank *= .9; S.dark = 0;
      transExhaust(1, 0, ['120,200,255', '200,240,255', '255,255,255'], 2);
      if (tr.t > 1.4) shake(2 + (tr.t - 1.4) * 5);
      if (tr.t >= 2.2) { tr.switched = true; S.sector++; S.sectorT = 0; S.bossPending = false; enterBase(); P.x = W * .1; P.y = H * .5; P.gx = P.gy = 0; S.dark = 0; S.scroll = S.scrollT * 4; }
    } else {
      tr.t2 += dt; S.dark = 0;
      P.x += (W * .22 - P.x) * Math.min(1, dt * 2); P.y += (H * .5 - P.y) * Math.min(1, dt * 2); P.evx = 400; transExhaust(1, 0, ['120,200,255', '200,240,255'], 2);
      if (tr.t2 < 1.25) shake(3);
      if (!tr.burst && tr.t2 >= 1.25) { tr.burst = true; S.wflash = Math.max(S.wflash, .6); shake(14); sfx.boom(90, W * .6, 'big'); for (let i = 0; i < 40; i++) { const a = rand(-.9, .9); parts.push({ k: 'spark', x: W * .5, y: H * .5 + rand(-H * .3, H * .3), vx: -Math.cos(a) * rand(300, 900), vy: Math.sin(a) * rand(100, 500), life: rand(.4, .9), max: .9, c: pick([pal.ribL, WHITE, pal.fire]), w: 1.6 }); } }
      if (tr.t2 >= 2.1) { S.trans = null; S.dark = 0; S.banner = { big: stageTag(stageOf(S.sector)), sub: I18('基地内部 · ', 'BASE INTERIOR · ') + sectorName(), t: 0, dur: 3.6 }; sfx.sector(); }
    }
  } else {
    if (!tr.switched) {
      S.scrollT = 460; P.x += (W * .8 - P.x) * Math.min(1, dt * 1.2); P.y += (H * .5 - P.y) * Math.min(1, dt * 1.5); P.evx = 500; P.bank *= .9;
      transExhaust(1, 0, ['120,200,255', '200,240,255', '255,255,255'], 3); shake(4);
      if (rnd() < .25 && parts.length < 1300) explode(rand(0, W * .45), rand(H * .2, H * .8), rand(20, 50), FIRE);
      S.wflash = Math.max(S.wflash, clamp((tr.t - 1.5) / .7, 0, 1));
      if (tr.t >= 2.2) {
        tr.switched = true; S.wflash = 1; leaveSurface(); S.sector++; S.sectorT = 0; S.bossPending = false; planet = null; planetTimer = 14; parts.length = 0;
        P.x = W / 2; P.y = H + 40; P.gy = -300; P.bank = 0;
        S.banner = { big: stageTag(stageOf(S.sector)), sub: I18('逃离基地 · 重返星海 · ', 'BASE ESCAPED · BACK TO THE STARS · ') + sectorName(), t: 0, dur: 3.6 }; saveStage(stageOf(S.sector));
      }
    } else {
      tr.t2 += dt; P.y += P.gy * dt; P.gy *= Math.max(0, 1 - dt * 1.2); P.evy = -600; S.speedK = Math.max(S.speedK, 2.2);
      const [bx, by] = escBlastPos(tr);
      if (tr.t2 < 2 && parts.length < 1400) for (let i = 0; i < 3; i++) parts.push({ k: 'ember', x: bx + rand(-40, 40), y: by, vx: rand(-280, 280), vy: -rand(300, 820), life: rand(.6, 1.4), max: 1.4, c: pick(pal.blast), r: rand(1.5, 3.2) });
      if (tr.t2 < 1.4) shake(5 * (1 - tr.t2 / 1.4));
      if (!tr.boom2 && tr.t2 > .35) { tr.boom2 = true; sfx.boom(220, bx, 'huge'); }
      if (tr.t2 > 3.2) { S.trans = null; sfx.sector(); }
    }
  }
}
function drawTransBack() {
  const tr = S.trans; if (!tr) return;
  const pal = cinePal(tr);
  if (tr.kind === 'entry' && !tr.switched) {
    const a = clamp((tr.t - 1.3) / 2.5, 0, 1);
    if (a > 0) { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, pal.sky[1]); g.addColorStop(.6, pal.sky[2]); g.addColorStop(1, pal.sky[1]); ctx.globalAlpha = a * .92; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
    drawPuffs(tr, false);
  } else if (tr.kind === 'entry') drawPuffs(tr, false, clamp(1 - (tr.t2 - .9) / 1.5, 0, 1));
  else if ((tr.kind === 'breach' || tr.kind === 'dive') && tr.switched) {
    const A = tr.t2 < 1.25 ? 1 : clamp(1 - (tr.t2 - 1.25) / .8, 0, 1); if (A <= 0) return;
    ctx.save(); ctx.globalAlpha = A; ctx.fillStyle = pal.tun; ctx.fillRect(0, 0, W, H);
    const vx = W * .84, vy = H * .5, organic = tr.th === 2;
    ctx.globalCompositeOperation = 'lighter'; ctx.lineWidth = 1.5;
    for (let k = 0; k < 46; k++) {
      const an = k * 2.399 + .3, q = (tr.t2 * 2.4 + k * .618) % 1, d0 = Math.pow(q, 2) * Math.hypot(W, H), d1 = d0 + 30 + q * 160;
      ctx.strokeStyle = `rgba(${pal.ribL},${.12 + q * .3})`; ctx.beginPath(); ctx.moveTo(vx + Math.cos(an) * d0, vy + Math.sin(an) * d0 * .7); ctx.lineTo(vx + Math.cos(an) * d1, vy + Math.sin(an) * d1 * .7); ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
    const rings = [];
    for (let i = 0; i < 12; i++) rings.push((tr.t2 * 1.7 + i / 12) % 1);
    rings.sort((a, b) => a - b);
    for (const z of rings) {
      const sc = Math.pow(z, 2.6) * 2.6 + .03, cx = vx + (W * .3 - vx) * Math.min(1, sc * .6), w = W * .55 * sc, h = H * .55 * sc, lw = 2 + 30 * sc, al = Math.min(1, z * 3);
      ctx.globalAlpha = A * al; ctx.strokeStyle = pal.rib; ctx.lineWidth = lw;
      ctx.beginPath(); if (organic) ctx.ellipse(cx, vy, w, h, 0, 0, TAU); else { const r = Math.min(w, h) * .35; ctx.roundRect ? ctx.roundRect(cx - w, vy - h, w * 2, h * 2, r) : ctx.rect(cx - w, vy - h, w * 2, h * 2); }
      ctx.stroke();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = `rgba(${pal.ribL},${.25 + .35 * al})`; ctx.lineWidth = Math.max(1, lw * .12); ctx.stroke();
      for (let j = 0; j < 8; j++) { const a = j / 8 * TAU + (organic ? Math.sin(z * 9) * .3 : 0); drawGlow(cx + Math.cos(a) * w, vy + Math.sin(a) * h, 3 + 10 * sc, organic ? (j % 2 ? pal.ribL : '255,120,180') : (j % 2 ? pal.ribL : '255,190,90'), .8 * al); }
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.globalAlpha = A; ctx.globalCompositeOperation = 'lighter'; drawGlow(vx, vy, 90, pal.ribL, .5); drawGlow(vx, vy, 26, WHITE, .8);
    ctx.restore(); ctx.globalCompositeOperation = 'source-over';
  } else if (tr.kind === 'escape' && tr.switched) {
    const k = tr.t2, [bx, by, R, cy] = escBlastPos(tr), sa = clamp(1 - k / 1.6, 0, 1);
    if (sa > 0) { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, pal.sky[0]); g.addColorStop(.65, pal.sky[1]); g.addColorStop(1, pal.sky[2]); ctx.globalAlpha = sa * .9; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
    if (cy - R > H + 40) return;
    ctx.globalCompositeOperation = 'lighter';
    const ag = ctx.createRadialGradient(W * .5, cy, R * .97, W * .5, cy, R * 1.08); ag.addColorStop(0, `rgba(${pal.atm},.55)`); ag.addColorStop(1, `rgba(${pal.atm},0)`);
    ctx.fillStyle = ag; ctx.beginPath(); ctx.arc(W * .5, cy, R * 1.08, 0, TAU); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    const pg = ctx.createRadialGradient(W * .5, cy - R * .92, R * .05, W * .5, cy, R); pg.addColorStop(0, pal.planet[0]); pg.addColorStop(.35, pal.planet[1]); pg.addColorStop(1, pal.planet[2]);
    ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(W * .5, cy, R, 0, TAU); ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 40; i++) { const a = -Math.PI / 2 + (bhash(i, 3) - .5) * .9, rr = R * (.985 - bhash(i, 7) * .05), x = W * .5 + Math.cos(a) * rr, y = cy + Math.sin(a) * rr; if (y < H + 10) drawGlow(x, y, 2 + bhash(i, 9) * 3, pal.lights, .5 + .3 * Math.sin(S.t * 3 + i)); }
    const ek = clamp(k / 3.2, 0, 1), fr = 40 + Math.pow(k, .65) * 240;
    drawGlow(bx, by, fr * 2.4, pal.blast[3], .55 * (1 - ek * .6));
    drawGlow(bx, by, fr * 1.2, pal.blast[2], .85 * (1 - ek * .5));
    drawGlow(bx, by, fr * .55, pal.blast[1], 1 - ek * .5);
    drawGlow(bx, by, fr * .25, pal.blast[0], 1 - ek * .6);
    const sw = 40 + k * 640; ctx.strokeStyle = `rgba(${pal.blast[1]},${.8 * (1 - ek)})`; ctx.lineWidth = 3 + k * 4; ctx.beginPath(); ctx.ellipse(bx, by + 6, sw, sw * .1, 0, Math.PI, TAU); ctx.stroke();
    const ph = Math.min(1, k / 1.6) * H * .32, pw = fr * .28;
    const plume = ctx.createLinearGradient(0, by, 0, by - ph); plume.addColorStop(0, `rgba(${pal.blast[1]},.75)`); plume.addColorStop(1, `rgba(${pal.blast[3]},.15)`);
    ctx.fillStyle = plume; ctx.beginPath(); ctx.moveTo(bx - pw, by); ctx.quadraticCurveTo(bx - pw * .4, by - ph * .5, bx - pw * .5, by - ph); ctx.lineTo(bx + pw * .5, by - ph); ctx.quadraticCurveTo(bx + pw * .4, by - ph * .5, bx + pw, by); ctx.closePath(); ctx.fill();
    drawGlow(bx, by - ph, fr * .7, pal.blast[2], .7 * (1 - ek * .5)); drawGlow(bx, by - ph, fr * .35, pal.blast[1], .8 * (1 - ek * .5));
    ctx.globalCompositeOperation = 'source-over';
  }
}
function drawCineFront() {
  const tr = S.trans; if (!tr) return;
  if (tr.kind === 'ending') { drawEnding(tr); return; }
  const pal = cinePal(tr);
  if (tr.kind === 'entry') {
    if (!tr.switched) {
      drawPuffs(tr, true);
      const k = clamp((tr.t - 3.1) / .9, 0, 1); if (k > 0) { ctx.fillStyle = `rgba(${pal.cover},${.94 * k})`; ctx.fillRect(0, 0, W, H); }
    } else {
      drawPuffs(tr, true, clamp(1 - (tr.t2 - .9) / 1.5, 0, 1));
      const k = clamp(1 - tr.t2 / 1.1, 0, 1); if (k > 0) { ctx.fillStyle = `rgba(${pal.cover},${.94 * k})`; ctx.fillRect(0, 0, W, H); }
    }
  } else if ((tr.kind === 'breach' || tr.kind === 'dive') && !tr.switched && tr.hx !== undefined) {
    const p = clamp(tr.t / 2.2, 0, 1), r0 = tr.hr || 60, r = r0 * .9 + (Math.hypot(W, H) * 1.1 - r0) * Math.pow(p, 2.6);
    if (p < .12) return;
    ctx.fillStyle = pal.tun; ctx.beginPath(); ctx.arc(tr.hx, tr.hy, r, 0, TAU); ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `rgba(${pal.fire},${.5 + .3 * Math.sin(S.t * 20)})`; ctx.lineWidth = 4 + r * .05; ctx.beginPath(); ctx.arc(tr.hx, tr.hy, r, 0, TAU); ctx.stroke();
    for (let i = 0; i < 4; i++) { const rr = r * (.25 + i * .18) * ((tr.t * 1.5 + i * .25) % 1 + .4); ctx.strokeStyle = `rgba(${pal.ribL},${.18})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(tr.hx, tr.hy, rr, 0, TAU); ctx.stroke(); }
    drawGlow(tr.hx, tr.hy, r * .3, pal.ribL, .25);
    ctx.globalCompositeOperation = 'source-over';
    drawPlayer();
  }
}

/* ===================== THEME C (stages 7-9): Frost Armada · Glacius ice world · Cryo-Quantum lab ===================== */
const themeOf = st => st === 10 ? 4 : ((cycOf(st) - 1) % 3) + 1;
const themeC = () => themeOf(stageOf(S.sector)) === 3;
const secLen = () => themeOf(stageOf(S.sector)) === 3 ? 30 : SECTOR_LEN;
const ICE = '150,230,255', ICE2 = '200,170,255';
const CRYO_TYPES = new Set(['comet', 'glint']);
Object.assign(SHIPDEF, { comet: { r: 15, hp: 5, score: 180 }, glint: { r: 18, hp: 9, score: 260 } });
const BOSS_ORDER_C = ['glacier', 'aurora', 'zenith'];
const ICEP = [ICE, '235,250,255', '120,180,255', WHITE];

function initCryoShip(e, d) {
  if (e.type === 'comet') {
    const fromL = rnd() < .5; e.x = fromL ? rand(-30, W * .35) : rand(W * .65, W + 30); e.bx = e.x;
    const tx = clamp(P.x + rand(-60, 60), 30, W - 30), ty = Math.max(P.y, H * .6), a = Math.atan2(ty - e.y, tx - e.x), sp = rand(430, 540) * Math.min(1.35, Math.sqrt(d));
    e.vx = Math.cos(a) * sp; e.vy = Math.sin(a) * sp; e.aim = a; e.warnT = .55;
  } else { e.vy = rand(150, 190); e.state = 0; e.zz = rand(1.6, 2.4); e.fireT = rand(.4, 1); }
}
function cometBurst(e) {
  const sp = Math.min(1.45, Math.sqrt(diff()));
  for (let i = 0; i < 6; i++) eFire('needle', e.x, e.y, e.aim + Math.PI + (i - 2.5) * .35, 200 * sp, { c: ICE, silent: i > 0 });
}
function updateCryo(e, dt, canFire, spK, d) {
  if (e.type === 'comet') {
    if (e.warnT > 0) { e.warnT -= dt; e.y += 30 * dt; return; }
    e.x += e.vx * dt; e.y += e.vy * dt;
    if (parts.length < 1500) parts.push({ k: 'ember', x: e.x - e.vx * .02, y: e.y - e.vy * .02, vx: -e.vx * .15 + rand(-20, 20), vy: -e.vy * .15 + rand(-20, 20), life: .35, max: .35, c: pick([ICE, '235,250,255']), r: rand(1.6, 3) });
    if (e.y > H + 50 || e.x < -80 || e.x > W + 80) e.dead = true;
    return;
  }
  e.y += e.vy * dt * (e.state ? .35 : 1); e.x = clamp(e.bx + Math.sin(e.t * e.zz * 2) * 90, 18, W - 18);
  if (e.y > H * .3 && !e.state) e.state = 1;
  e.fireT -= dt;
  if (canFire && e.fireT <= 0 && e.y > 20) { for (let i = 0; i < 3; i++) S.events.push({ t: i * .08, fn: () => { if (!e.dead && P.alive) eFire('needle', e.x, e.y + 10, aimAng(e.x, e.y), 420 * spK, { c: ICE, silent: i > 0 }); } }); e.fireT = 2.1 / Math.sqrt(d); }
  if (e.t > 9) e.vy = 260;
  if (e.y > H + 40) e.dead = true;
}
function spawnWaveC() {
  const r = rnd(), lv = levelOf(S.sector);
  if (r < .1) spawnShip('gunship', rand(W * .2, W * .8));
  else if (r < .2) spawnShip(rnd() < .5 ? 'brood' : 'lancer', rand(W * .2, W * .8));
  else if (r < .32) spawnShip(rnd() < .5 ? 'prism' : 'lancer', rand(W * .15, W * .85));
  else if (r < .44) { for (let i = 0; i < 2; i++) spawnShip(i ? 'mantis' : 'raider', rand(W * .15, W * .85), -40 - i * 60); }
  else if (r < .56) { const n = 3 + Math.min(3, lv >> 1); for (let i = 0; i < n; i++) spawnShip('urchin', rand(40, W - 40), -30 - i * 60); }
  else if (r < .72) { const n = 3 + Math.min(2, lv >> 2); for (let i = 0; i < n; i++) S.events.push({ t: i * .28, fn: () => { if (P.alive && S.mode === 'play') spawnShip('comet', 0, -30); } }); }
  else if (r < .86) { const n = 4 + Math.min(3, lv >> 1), cx = rand(W * .25, W * .75); for (let i = 0; i < n; i++) spawnShip('glint', clamp(cx + (i - (n - 1) / 2) * 40, 20, W - 20), -30 - i * 34); }
  else { const n = 6 + Math.min(4, lv >> 1), cx = rand(W * .25, W * .75); for (let i = 0; i < n; i++) { const m = i - (n - 1) / 2; spawnShip('wasp', clamp(cx + m * 32, 20, W - 20), -30 - Math.abs(m) * 26); } }
}
function drawCryo(e, pulse) {
  if (e.type === 'comet') {
    if (e.warnT > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(${ICE},${.25 + .3 * (((S.t * 16) | 0) % 2)})`; ctx.lineWidth = 1.2; ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(e.aim) * 900, Math.sin(e.aim) * 900); ctx.stroke(); ctx.setLineDash([]); }
    ctx.rotate(e.aim + Math.PI / 2);
    ctx.globalCompositeOperation = 'lighter';
    const tg = ctx.createLinearGradient(0, 0, 0, 70); tg.addColorStop(0, `rgba(${ICE},.7)`); tg.addColorStop(1, `rgba(${ICE},0)`);
    ctx.fillStyle = tg; ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(0, 74); ctx.lineTo(9, 0); ctx.closePath(); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    const g = ctx.createLinearGradient(-10, -14, 10, 10); g.addColorStop(0, '#f2fbff'); g.addColorStop(.5, '#8cc8e8'); g.addColorStop(1, '#2a5a7a');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -17); ctx.lineTo(10, -2); ctx.lineTo(6, 10); ctx.lineTo(-6, 10); ctx.lineTo(-10, -2); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, -17); ctx.lineTo(0, 10); ctx.moveTo(-10, -2); ctx.lineTo(10, -2); ctx.stroke();
    ctx.globalCompositeOperation = 'lighter'; drawGlow(0, -2, 14, ICE, .7); drawGlow(0, -4, 4, WHITE, 1);
  } else {
    ctx.rotate(Math.cos(e.t * e.zz * 2) * .35);
    ctx.globalCompositeOperation = 'lighter'; drawGlow(0, -16, 12, ICE, .5); ctx.globalCompositeOperation = 'source-over';
    for (const s of [-1, 1]) { const g = ctx.createLinearGradient(0, 0, s * 22, 0); g.addColorStop(0, '#9fd6f2'); g.addColorStop(1, '#2a4a66'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(s * 4, -8); ctx.lineTo(s * 24, -14); ctx.lineTo(s * 16, 4); ctx.lineTo(s * 5, 8); ctx.closePath(); ctx.fill(); }
    const g = ctx.createLinearGradient(-7, 0, 7, 0); g.addColorStop(0, '#2a4a66'); g.addColorStop(.5, '#e6f6ff'); g.addColorStop(1, '#2a4a66');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 18); ctx.lineTo(7, 0); ctx.lineTo(4, -14); ctx.lineTo(-4, -14); ctx.lineTo(-7, 0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(200,240,255,.7)'; ctx.lineWidth = .8; ctx.stroke();
    ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 4, 8, ICE, pulse); drawGlow(0, 4, 2.5, WHITE, 1); drawGlow(-20, -12, 3, ICE2, .8); drawGlow(20, -12, 3, ICE2, .8);
  }
  ctx.globalCompositeOperation = 'source-over';
}

