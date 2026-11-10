/* ---------- OMEGA, the First Light (final boss) ---------- */
function spawnGod() {
  S.sector = levelOf(S.sector) < 3 ? (stageOf(S.sector) - 1) * 10 + 3 : S.sector; S.banner = { big: stageTag(stageOf(S.sector)), sub: sectorName(), t: 0, dur: 3.4 };
  const hw = clamp(Math.min(W * .14, H * .19), 64, 170), hh = hw * 1.9;
  const b = { type: 'boss', kind: 'god', n: 1, tier: 3, lvl: 2.8, t: 0, swayT: 0, hitT: 0, phase: 1, pi: 0, cur: null, hold: 0, entered: false,
    spin: 0, side: 1, alt: false, ring: 0, ph: 0, dir: Math.PI, shield: true, shieldHit: 0, hw, hh, r: hw, bbT: 9, gravT: 0 };
  b.tx = W - hw * 1.95 - 12 - inset.r; b.wx = S.wx + W + hw * 2.6; b.x = b.wx - S.wx; b.y = H * .5;
  const R = clamp(hw * .2, 15, 28), wings = [['lance', -1, -.62], ['spiral', -1, -.08], ['homing', -1, .44], ['laser', 1, -.62], ['summon', 1, -.08], ['gravity', 1, .44]];
  b.parts = wings.map(([role, sd, fy], i) => ({ role, type: 'wing', sd, fy, i, ox: 0, oy: 0, r0: R, r: R, depth: 1, hp: 240 * b.lvl, maxhp: 240 * b.lvl, hitT: 0, aim: Math.PI, dead: false, hidden: false, x: 0, y: 0, fireT: rand(1.5, 3.5) + i * .4, idle: 0, alt: 0 }));
  b.hp = b.maxhp = BOSSES.god.hp; b.score = BOSSES.god.score;
  ships.push(b); S.boss = b;
}
function godWingPos(e, p) { const fl = Math.sin(e.t * 1.3 + p.i) * .05; return [p.sd * e.hw * (1.5 + .3 * (1 - Math.abs(p.fy))), (p.fy + fl) * e.hh]; }
function godGuns(e) {
  const w = e.hw, h = e.hh, t = e.parts.filter(p => !p.dead);
  return { main: [-w * .3, -h * .1], side: [[-w * 1.3, -h * .3], [-w * 1.3, h * .3]], top: [[-w * .8, -h * .9], [0, -h], [w * .8, -h * .9]], core: [0, -h * .05], turrets: t };
}
function updateGod(e, dt, canFire, spK) {
  e.x = e.wx - S.wx;
  if (!e.entered) {
    if (e.x < e.tx + 60) S.scrollT = 0;
    if (S.scrollT === 0 && S.scroll < 4) { e.entered = true; S.scroll = 0; S.toast = { txt: I18('第一试炼 · 六翼审判：击碎六片光翼（未击碎的光翼会恢复）', 'Trial I · the Six Wings: shatter every wing (damaged wings regenerate)'), t: 5 }; }
  } else e.wx += (S.wx + e.tx - e.wx) * Math.min(1, dt * 2);
  e.y = (e.c0 = IW ? (ceilW(e.wx) + floorW(e.wx)) / 2 : H * .5) + Math.sin(e.t * .45) * H * .035;
  e.spin += dt * (e.phase === 3 ? 2.4 : 1);
  const live = canFire && e.entered, L = e.lvl, s = spK * Math.min(1.45, .95 + .1 * L);
  for (const p of e.parts) {
    const [ox, oy] = godWingPos(e, p); p.ox = ox; p.oy = oy; p.x = e.x + ox; p.y = e.y + oy;
    if (p.dead) continue;
    p.idle = p.hitT > 0 ? 0 : p.idle + dt;
    if (p.idle > 3 && p.hp < p.maxhp) p.hp = Math.min(p.maxhp, p.hp + p.maxhp * .035 * dt);
    let da = aimAng(p.x, p.y) - p.aim; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; p.aim += da * Math.min(1, dt * 4);
    if (!live) continue;
    p.fireT -= dt; if (p.fireT > 0) continue;
    switch (p.role) {
      case 'lance': bossLance(e, Math.random() < .5 ? 'double' : 'single', L); p.fireT = 6 / L; break;
      case 'spiral': { const o = rand(0, TAU); for (let i = 0; i < 16; i++) eFire('orb', p.x, p.y, o + i / 16 * TAU, 170 * s, { c: GODC, silent: i > 0 }); p.fireT = 2.6 / L; break; }
      case 'homing': for (let k = 0; k < 3; k++) eFire('homing', p.x, p.y, Math.PI + (k - 1) * .6, 160 * s, { seek: 2.6, turn: 2.4, c: GODC, silent: k > 0 }); p.fireT = 3.4 / L; break;
      case 'laser': addBeam({ owner: p, ox: 0, oy: 0, w: 14, charge: 1.2, fire: 1.4, mode: 'track', sweep: .24 * spK, c: '255,230,170', dmg: 16 }); p.fireT = 5 / L; break;
      case 'summon': if (ships.length < 24) for (let k = 0; k < 3; k++) S.events.push({ t: k * .3, fn: () => { if (!p.dead && P.alive) spawnAir('fighter', p.x, p.y + (k - 1) * 20); } }); p.fireT = 6.5 / L; break;
      case 'gravity': e.gravT = 1.8; e.gravX = p.x; e.gravY = p.y; p.fireT = 7 / L; sfx.whoosh(p.x); break;
    }
  }
  if (e.gravT > 0) {
    e.gravT -= dt; const dx = e.gravX - P.x, dy = e.gravY - P.y, d = Math.hypot(dx, dy) || 1;
    if (P.alive && !P.cap) { P.gx += dx / d * 300 * dt; P.gy += dy / d * 300 * dt; }
    if (Math.random() < .6 && parts.length < 1300) { const a = rand(0, TAU), rr = rand(60, 160); parts.push({ k: 'spark', x: e.gravX + Math.cos(a) * rr, y: e.gravY + Math.sin(a) * rr, vx: -Math.cos(a) * 200, vy: -Math.sin(a) * 200, life: .5, max: .5, c: GODC, w: 1.2 }); }
  }
  if (e.phase >= 2 && !e.haloGone) {
    e.haloGone = true; e.shield = false; shieldDown(e);
    for (let i = 0; i < 60; i++) { const a = rand(0, TAU), sp = rand(150, 500); parts.push({ k: 'spark', x: e.x + Math.cos(a) * e.hw * .9, y: e.y - e.hh * .85 + Math.sin(a) * e.hw * .4, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: rand(.5, 1.2), max: 1.2, c: pick([GODC, WHITE]), w: 1.8 }); }
  }
  if (e.phase === 2 && e.entered && !e.dying) {
    if (!e.bb) {
      e.bbT -= dt;
      if (e.bbT <= 0 && canFire) {
        const R = clamp(Math.min(W, H) * .11, 54, 92), [t0, b0] = baseBand();
        e.bb = { t: 0, dur: 5, need: e.maxhp * .055, acc: 0, sx: rand(W * .12, W * .42), sy: rand(t0 + R * .5, Math.max(t0 + R * .5 + 1, b0 - R * .5)), R };
        clearBeamsOf(e); for (const p of e.parts) clearBeamsOf(p); clearLances();
        e.cur = { name: 'shift', t: 0, dur: 5.6, ft: 0, n: 0 };
        S.toast = { txt: I18('大爆炸蓄能！攻击胸口打断它，或者躲进光球', 'BIG BANG charging! Hit the heart to interrupt — or hide in the light sphere'), t: 3.4 }; sfx.alarm(); shake(6);
      }
    } else {
      const bb = e.bb; bb.t += dt; shake(1 + bb.t * .8);
      if (bb.acc >= bb.need) {
        e.bb = null; e.bbT = 12; e.hp -= e.maxhp * .04; S.wflash = Math.max(S.wflash, .45); shake(18);
        explode(e.x, e.y - e.hh * .05, 90, ['255,255,255', GODC, '255,200,120', WHITE]); sfx.boom(120, e.x, 'big');
        floatText(e.x, e.y - e.hh * .5, I18('打断！', 'INTERRUPTED!'), FLARE, true); e.cur = { name: 'shift', t: 0, dur: 1.6, ft: 0, n: 0 };
        if (e.hp <= 0) killShip(e);
      } else if (bb.t >= bb.dur) {
        e.bb = null; e.bbT = 12; S.wflash = 1; shake(30); sfx.boom(220, e.x, 'huge'); ebul.length = 0;
        const safe = Math.hypot(P.x - bb.sx, P.y - bb.sy) < bb.R;
        if (!safe && P.alive && P.inv <= 0) { P.shield = 0; hurt(70); floatText(P.x, P.y - 40, I18('大爆炸！', 'BIG BANG!'), WARN, true); }
        else floatText(bb.sx, bb.sy - bb.R - 14, I18('安全', 'SAFE'), '170,255,200', true);
      }
    }
  }
  if (e.phase === 3 && e.entered && !e.dying && P.alive && !P.cap) {
    const dx = e.x - P.x, dy = e.y - P.y, d = Math.hypot(dx, dy) || 1;
    P.gx += dx / d * 230 * dt; P.gy += dy / d * 230 * dt;
    if (d < e.hw * .55 && P.inv <= 0) hurt(30);
  }
}
function godDown(e) {
  e.dying = true; e.dyingT = 0; S.boss = null; S.kills++; e.bb = null;
  clearBeamsOf(e); for (const p of e.parts) { clearBeamsOf(p); p.dead = true; } clearBeams(); clearLances(); ebul.length = 0;
  for (const s2 of ships) if (s2 !== e && !s2.dead) killShip(s2);
  for (let i = 0; i < 30; i++) S.events.push({ t: i * .1, fn: () => { const a = rand(0, TAU), d = rand(.2, 1.4) * e.hw; explode(e.x + Math.cos(a) * d, e.y + Math.sin(a) * d * 1.6, rand(30, 70), i % 2 ? ['255,255,255', GODC, '255,200,120', WHITE] : FIRE); sfx.boom(50, e.x, i % 3 ? 'ship' : 'big'); shake(8); } });
  S.events.push({ t: 3.2, fn: () => { e.gone = true; S.wflash = 1; shake(40); sfx.boom(260, e.x, 'huge'); explode(e.x, e.y, 260, ['255,255,255', '255,250,230', GODC, WHITE]); addScore(e.score, e.x, e.y); } });
  S.events.push({ t: 5, fn: () => beginTransition('ending') });
}
function updateGodDying(e, dt) { e.dyingT += dt; e.x = e.wx - S.wx; if (e.gone && e.dyingT > 8) e.dead = true; }
function drawGodChamber(e) {
  const g = ctx.createRadialGradient(e.x, e.y, 10, e.x, e.y, Math.max(W, H)); g.addColorStop(0, e.phase === 3 ? '#1a0a1e' : '#2a1e10'); g.addColorStop(.4, '#0c0814'); g.addColorStop(1, '#030206');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 140; i++) { const a = bhash(i, 1) * TAU + S.t * .02 * (1 + bhash(i, 2)), d = (bhash(i, 3) * Math.max(W, H) + S.t * 20 * (e.phase === 3 ? -3 : 1)) % Math.max(W, H); drawGlow(e.x + Math.cos(a) * d, e.y + Math.sin(a) * d * .8, 1.2 + bhash(i, 4) * 1.6, i % 5 ? '255,245,230' : GODC, .5 + .4 * Math.sin(S.t * 2 + i)); }
  if (!e.gone) for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + S.t * .05; const lg = ctx.createLinearGradient(e.x, e.y, e.x + Math.cos(a) * W, e.y + Math.sin(a) * W); lg.addColorStop(0, `rgba(${GODC},.1)`); lg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(e.x + Math.cos(a - .04) * W * 1.5, e.y + Math.sin(a - .04) * W * 1.5); ctx.lineTo(e.x + Math.cos(a + .04) * W * 1.5, e.y + Math.sin(a + .04) * W * 1.5); ctx.closePath(); ctx.fill(); }
  ctx.globalCompositeOperation = 'source-over';
}
function drawGod(e, pulse) {
  const w = e.hw, h = e.hh, C = e.phase === 3 ? '200,150,255' : GODC;
  if (e.gone) { ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, w * 3 * Math.max(0, 1 - (e.dyingT - 3.2) / 3), '255,250,230', .9); ctx.globalCompositeOperation = 'source-over'; return; }
  if (e.phase === 3 && !e.dying) {
    ctx.save(); ctx.scale(1, .45); ctx.rotate(S.t * .6);
    for (let k = 0; k < 3; k++) { ctx.strokeStyle = `rgba(${k === 1 ? '255,200,140' : '200,150,255'},${.5 - k * .12})`; ctx.lineWidth = w * (.18 - k * .04); ctx.beginPath(); ctx.arc(0, 0, w * (1.1 + k * .35), 0, TAU); ctx.stroke(); }
    ctx.restore();
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(0, 0, w * .62, 0, TAU); ctx.fill();
    ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(255,240,220,.8)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, 0, w * .64, 0, TAU); ctx.stroke();
    drawGlow(0, 0, w * .4, '255,250,235', .7 + .3 * Math.sin(S.t * 8)); drawGlow(0, 0, w * .14, WHITE, 1);
    ctx.globalCompositeOperation = 'source-over'; return;
  }
  ctx.globalCompositeOperation = 'lighter'; drawGlow(0, -h * .1, w * 3.2, C, .22 + .1 * pulse); ctx.globalCompositeOperation = 'source-over';
  for (const p of e.parts) {
    const sx = p.sd * w * .35, sy = -h * .45, [tx, ty] = [p.ox, p.oy];
    if (p.dead) { ctx.strokeStyle = 'rgba(120,100,80,.6)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + (tx - sx) * .25, sy + (ty - sy) * .25); ctx.stroke(); continue; }
    const k = p.hp / p.maxhp, mx = (sx + tx) / 2 + p.sd * w * .1, my = Math.min(sy, ty) - h * .22;
    ctx.globalCompositeOperation = 'lighter';
    for (let f = 0; f < 5; f++) { const o = (f - 2) * h * .045; ctx.strokeStyle = `rgba(${C},${(.18 + .12 * k) * (1 - Math.abs(f - 2) * .2)})`; ctx.lineWidth = 10 - Math.abs(f - 2) * 2.5; ctx.beginPath(); ctx.moveTo(sx, sy + o * .3); ctx.quadraticCurveTo(mx, my + o, tx, ty + o * .6); ctx.stroke(); }
    ctx.strokeStyle = `rgba(255,255,255,${.5 + .4 * k})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(mx, my, tx, ty); ctx.stroke();
    drawGlow(tx, ty, p.r * (1.3 + (p.hitT > 0 ? .8 : 0)), C, .7 + .3 * k); drawGlow(tx, ty, p.r * .45, WHITE, 1);
    ctx.globalCompositeOperation = 'source-over';
    if (p.hp < p.maxhp) drawMiniBar(e.x + tx, e.y + ty - p.r * 1.8, 38, k, GODC);
  }
  if (!e.haloGone) {
    ctx.save(); ctx.translate(0, -h * .86); ctx.rotate(S.t * .4);
    ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(${GODC},.75)`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, w * .62, 0, TAU); ctx.stroke();
    ctx.setLineDash([4, 9]); ctx.lineWidth = 6; ctx.strokeStyle = `rgba(${GODC},.45)`; ctx.beginPath(); ctx.arc(0, 0, w * .74, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    if (e.shield) { const hit = Math.max(0, e.shieldHit || 0) * 3; drawGlow(0, 0, w * .9, GODC, .25 + hit); }
    ctx.restore(); ctx.globalCompositeOperation = 'source-over';
  }
  ctx.save();
  ctx.beginPath(); ctx.moveTo(0, -h * .98); ctx.bezierCurveTo(w * .42, -h * .98, w * .46, -h * .62, w * .3, -h * .5); ctx.bezierCurveTo(w * .62, -h * .36, w * .66, h * .2, w * .78, h * .95); ctx.lineTo(-w * .78, h * .95); ctx.bezierCurveTo(-w * .66, h * .2, -w * .62, -h * .36, -w * .3, -h * .5); ctx.bezierCurveTo(-w * .46, -h * .62, -w * .42, -h * .98, 0, -h * .98); ctx.closePath();
  const bg = ctx.createLinearGradient(0, -h, 0, h); bg.addColorStop(0, '#1a1030'); bg.addColorStop(.5, '#0c0820'); bg.addColorStop(1, '#04030a');
  ctx.fillStyle = bg; ctx.fill();
  ctx.save(); ctx.clip();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 70; i++) { const x = (bhash(i, 5) - .5) * w * 1.6, y = (bhash(i, 6) - .5) * h * 2 + Math.sin(S.t * .3 + i) * 3; drawGlow(x, y, 1 + bhash(i, 7) * 1.8, i % 6 ? '255,250,240' : '200,170,255', .6 + .4 * Math.sin(S.t * 3 + i)); }
  const ng = ctx.createRadialGradient(-w * .1, h * .1, 2, 0, h * .1, w * .9); ng.addColorStop(0, 'rgba(180,120,255,.3)'); ng.addColorStop(1, 'rgba(180,120,255,0)'); ctx.fillStyle = ng; ctx.fillRect(-w, -h, w * 2, h * 2);
  ctx.restore();
  ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(${C},.85)`; ctx.lineWidth = 2.2; ctx.stroke();
  ctx.restore();
  ctx.globalCompositeOperation = 'lighter';
  const eo = e.phase >= 2 ? 1 : .3 + .2 * Math.sin(S.t * 1.5);
  ctx.fillStyle = `rgba(255,250,235,${.9})`; ctx.beginPath(); ctx.ellipse(0, -h * .78, w * .09, w * .13 * eo, 0, 0, TAU); ctx.fill();
  drawGlow(0, -h * .78, w * .3, C, .6 + .3 * eo);
  const bb = e.bb, hx = 0, hy = -h * .1;
  if (bb) {
    const q = bb.t / bb.dur, op = Math.min(1, q * 3);
    drawGlow(hx, hy, w * (.5 + q * 1.6), '255,250,230', .5 + .5 * q);
    ctx.fillStyle = `rgba(255,255,255,${.6 + .4 * Math.sin(S.t * 20)})`; ctx.beginPath(); ctx.ellipse(hx, hy, w * .14 * op + 2, h * .16 * op + 2, 0, 0, TAU); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(hx, hy, w * .5, 0, TAU); ctx.stroke();
    ctx.strokeStyle = '#ffd890'; ctx.beginPath(); ctx.arc(hx, hy, w * .5, -Math.PI / 2, -Math.PI / 2 + TAU * Math.min(1, bb.acc / bb.need)); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,90,80,.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(hx, hy, w * .6, -Math.PI / 2, -Math.PI / 2 + TAU * (1 - q)); ctx.stroke();
  } else { drawGlow(hx, hy, w * .35, C, .5 + .3 * pulse); drawGlow(hx, hy, w * .1, WHITE, .9); }
  ctx.globalCompositeOperation = 'source-over';
}
function drawGodFront() {
  const e = S.boss; if (!e || e.kind !== 'god' || !e.bb) return;
  const bb = e.bb, q = bb.t / bb.dur, fl = .5 + .5 * Math.sin(S.t * 10);
  ctx.fillStyle = `rgba(255,240,220,${.05 + q * .14})`; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(bb.sx, bb.sy, bb.R * .2, bb.sx, bb.sy, bb.R); g.addColorStop(0, 'rgba(170,255,210,.08)'); g.addColorStop(1, `rgba(170,255,210,${.35 + .2 * fl})`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(bb.sx, bb.sy, bb.R, 0, TAU); ctx.fill();
  ctx.strokeStyle = `rgba(200,255,230,${.7 + .3 * fl})`; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(bb.sx, bb.sy, bb.R, 0, TAU); ctx.stroke();
  ctx.globalCompositeOperation = 'source-over';
  ctx.font = `700 12px ${FD}`; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(220,255,235,.95)'; ctx.fillText(I18('安全区', 'SAFE ZONE'), bb.sx, bb.sy - bb.R - 8); ctx.textAlign = 'left';
}

