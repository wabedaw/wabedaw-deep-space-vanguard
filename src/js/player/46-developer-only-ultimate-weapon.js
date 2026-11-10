/* ---------- developer-only ultimate weapon · STARBREAKER: piercing star column + homing star darts + nova pulse ---------- */
const ULTC = '255,214,120', ULT_DPS = 600, ULT_DART_DMG = 16, ULT_NOVA_CD = 2.4, ULT_NOVA_DMG = 260;
const ultDarts = [];
const ultAvail = () => !!(S.dev && S.dev.ult);
const ultWidth = () => clamp(Math.min(W, H) * .085, 44, 80);
const ultBody = e => e.kind === 'omega' ? [e.x + e.gox, e.y + e.goy] : e.gate ? [e.x - e.hw * .5, e.y] : [e.x, e.y];
function ultHitAt(x, y, pad, dmg) {
  for (const e of ships) {
    if (e.dead || e.dying || e.cap) continue;
    if (e.type === 'boss') { const pt = hitPart(e, x, y, pad); if (pt) { damagePart(e, pt, dmg, x, y); return true; } if (hitBoss(e, x, y, pad)) { damage(e, dmg, x, y, true); return true; } continue; }
    if (hitShip(e, x, y, pad)) { damage(e, dmg, x, y, true); return true; }
  }
  for (const st of liveSats()) if (Math.hypot(st.x - x, st.y - y) < (st.r || 14) + pad) { damageSat(st, dmg, x, y); return true; }
  for (const k of rocks) if (!k.dead && !k.iron && Math.hypot(k.x - x, k.y - y) < k.r + pad) { damage(k, dmg, x, y, false); return true; }
  return false;
}
function ultPos(t) { return t.k === 'part' ? [t.e.x + t.o.ox, t.e.y + t.o.oy] : t.k === 'body' ? ultBody(t.e) : [t.o.x, t.o.y]; }
function ultGone(t) {
  if (t.k === 'part') return t.o.dead || t.o.hidden || t.e.dead || t.e.dying;
  if (t.k === 'body') return t.e.dead || t.e.dying || t.e.shield;
  return t.o.dead || t.o.dying;
}
function ultPick(x, y) {
  let best = null, bd = 1e12;
  const on = (px, py) => px > -30 && px < W + 30 && py > -30 && py < H + 30;
  const consider = (t, px, py, w = 1) => { if (!on(px, py)) return; const d = ((px - x) ** 2 + (py - y) ** 2) * w; if (d < bd) { bd = d; best = t; } };
  for (const e of ships) {
    if (e.dead || e.dying || e.cap) continue;
    if (e.type === 'boss') {
      let any = false;
      for (const p of e.parts || []) if (!p.dead && !p.hidden) { any = true; consider({ k: 'part', e, o: p }, e.x + p.ox, e.y + p.oy, .6); }
      if (!any && !e.shield) { const [bx, by] = ultBody(e); if (hitBoss(e, bx, by, 30)) consider({ k: 'body', e }, bx, by, .6); }
      continue;
    }
    consider({ k: 'ship', o: e }, e.x, e.y);
  }
  for (const st of liveSats()) consider({ k: 'ship', o: st }, st.x, st.y);
  if (!best) for (const k of rocks) if (!k.dead && !k.iron) consider({ k: 'ship', o: k }, k.x, k.y, 1.5);
  return best;
}
function ultColumn(dt) {
  const hw = ultWidth() / 2, dmg = ULT_DPS * dt, side = S.side;
  const inBand = (x, y, r) => side ? (Math.abs(y - P.y) < hw + r && x > P.x - r && x < W + r + 20) : (Math.abs(x - P.x) < hw + r && y < P.y + r && y > -r - 20);
  for (const e of ships) {
    if (e.dead || e.dying || e.cap) continue;
    if (e.type === 'boss') {
      for (const p of e.parts || []) if (!p.dead && !p.hidden) { const px = e.x + p.ox, py = e.y + p.oy; if (inBand(px, py, p.r)) damagePart(e, p, dmg, px, py); }
      if (e.dead || e.dying) continue;
      const len = side ? W - P.x + 60 : P.y + 60;
      for (let d = 30; d < len; d += 18) { const x = side ? P.x + d : P.x, y = side ? P.y : P.y - d; if (hitBoss(e, x, y, hw)) { damage(e, dmg, x, y, true); break; } }
      continue;
    }
    if (inBand(e.x, e.y, e.r || Math.max(e.hw || 0, e.hh || 0) || 18)) damage(e, dmg, e.x, e.y, true);
  }
  for (const st of liveSats()) if (inBand(st.x, st.y, st.r || 14)) damageSat(st, dmg, st.x, st.y);
  for (const k of rocks) if (!k.dead && !k.iron && inBand(k.x, k.y, k.r)) damage(k, dmg, k.x, k.y, false);
  for (const b of ebul) if (!b.dead && inBand(b.x, b.y, b.r || 4)) { b.dead = true; if (parts.length < 1400) parts.push({ k: 'ember', x: b.x, y: b.y, vx: rand(-60, 60), vy: rand(-60, 60), life: .25, max: .25, c: ULTC, r: 2 }); }
}
function ultFire(dt, trig) {
  P.ultOn = trig && P.alive; if (!P.ultOn) return;
  P.ultTick = (P.ultTick || 0) + dt; P.ultDartT = (P.ultDartT || 0) - dt;
  if (P.ultTick >= .05) { ultColumn(P.ultTick); P.ultTick = 0; }
  if (P.ultDartT <= 0) {
    P.ultDartT = .12;
    for (const s of [-1, 1]) {
      const a = S.side ? s * rand(.7, 1.1) : -Math.PI / 2 + s * rand(.7, 1.1), sp = 820;
      ultDarts.push({ x: S.side ? P.x + 6 : P.x + s * 20, y: S.side ? P.y + s * 12 : P.y - 4, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, t: 0, tg: null, tr: [] });
    }
  }
  P.muzzle = .06;
  if ((P.ultSnd || 0) <= S.t) { sfx.laser(P.x); P.ultSnd = S.t + .09; }
}
function ultNova() {
  if ((S.ultCd || 0) > 0 || !P.alive) return false;
  S.ultCd = ULT_NOVA_CD;
  S.ultNova = { x: P.x, y: P.y, r: 24, max: Math.hypot(W, H) * 1.05, hit: new Set() };
  S.wflash = Math.max(S.wflash || 0, .35); shake(12); sfx.boom(140, P.x, 'huge'); sfx.shieldBreak();
  waves.push({ x: P.x, y: P.y, r: 30, max: 240, life: .45, maxl: .45, c: '255,255,255' });
  floatText(P.x, P.y - 52, I18('湮星脉冲', 'NOVA PULSE'), ULTC, true);
  return true;
}
function updateUlt(dt) {
  if (S.ultCd > 0) S.ultCd -= dt;
  if (P.superT > 0) { P.superT -= dt; if (P.superT <= 0) endSuper(); }
  const n = S.ultNova;
  if (n) {
    n.r += 1700 * dt;
    const r2 = n.r * n.r, inside = (x, y) => (x - n.x) ** 2 + (y - n.y) ** 2 < r2;
    for (const b of ebul) if (!b.dead && inside(b.x, b.y)) b.dead = true;
    for (const e of ships) {
      if (e.dead || e.dying || e.cap || n.hit.has(e)) continue;
      if (e.type === 'boss') {
        for (const p of e.parts || []) if (!p.dead && !p.hidden && !n.hit.has(p)) { const px = e.x + p.ox, py = e.y + p.oy; if (inside(px, py)) { n.hit.add(p); damagePart(e, p, ULT_NOVA_DMG, px, py); } }
        if (e.dead || e.dying) continue;
        const [bx, by] = ultBody(e);
        if (inside(bx, by)) { n.hit.add(e); if (hitBoss(e, bx, by, 30)) damage(e, ULT_NOVA_DMG, bx, by, true); else e.shieldHit = .3; }
        continue;
      }
      if (inside(e.x, e.y)) { n.hit.add(e); damage(e, ULT_NOVA_DMG, e.x, e.y, true); }
    }
    for (const st of liveSats()) if (!n.hit.has(st) && inside(st.x, st.y)) { n.hit.add(st); damageSat(st, ULT_NOVA_DMG, st.x, st.y); }
    for (const k of rocks) if (!k.dead && !n.hit.has(k) && inside(k.x, k.y)) { n.hit.add(k); if (k.iron) killRock(k); else damage(k, ULT_NOVA_DMG, k.x, k.y, false); }
    if (n.r > n.max) S.ultNova = null;
  }
  for (const d of ultDarts) {
    d.t += dt;
    if (!d.tg || ultGone(d.tg)) d.tg = ultPick(d.x, d.y);
    if (d.tg && d.t > .06) {
      const [tx, ty] = ultPos(d.tg); let a = Math.atan2(d.vy, d.vx), da = Math.atan2(ty - d.y, tx - d.x) - a;
      while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
      a += clamp(da, -11 * dt, 11 * dt); const sp = Math.min(1500, Math.hypot(d.vx, d.vy) + 900 * dt); d.vx = Math.cos(a) * sp; d.vy = Math.sin(a) * sp;
    }
    d.tr.push(d.x, d.y); if (d.tr.length > 12) d.tr.splice(0, 2);
    d.x += d.vx * dt; d.y += d.vy * dt;
    if (ultHitAt(d.x, d.y, 9, ULT_DART_DMG)) { d.dead = true; parts.push({ k: 'flash', x: d.x, y: d.y, vx: 0, vy: 0, life: .12, max: .12, r: 26, c: ULTC }); continue; }
    if (d.t > 1.8 || d.x < -80 || d.x > W + 80 || d.y < -80 || d.y > H + 80) d.dead = true;
  }
  for (let i = ultDarts.length - 1; i >= 0; i--) if (ultDarts[i].dead) ultDarts.splice(i, 1);
}
function drawUlt() {
  if (S.trans) return;
  ctx.globalCompositeOperation = 'lighter';
  const n = S.ultNova;
  if (n) {
    const a = clamp(1 - n.r / n.max, 0, 1);
    ctx.strokeStyle = `rgba(${ULTC},${.28 * a})`; ctx.lineWidth = 70 * a + 6; ctx.beginPath(); ctx.arc(n.x, n.y, Math.max(1, n.r - 34), 0, TAU); ctx.stroke();
    ctx.strokeStyle = `rgba(${ULTC},${.85 * a})`; ctx.lineWidth = 20 * a + 3; ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, TAU); ctx.stroke();
    ctx.strokeStyle = `rgba(255,255,255,${.95 * a})`; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 4, 0, TAU); ctx.stroke();
  }
  if (ultDarts.length) {
    ctx.lineCap = 'round';
    for (const d of ultDarts) {
      const t = d.tr; if (t.length >= 4) { ctx.strokeStyle = `rgba(${ULTC},.55)`; ctx.lineWidth = 3.2; ctx.beginPath(); ctx.moveTo(t[0], t[1]); for (let i = 2; i < t.length; i += 2) ctx.lineTo(t[i], t[i + 1]); ctx.lineTo(d.x, d.y); ctx.stroke(); }
      drawGlow(d.x, d.y, 11, ULTC, .9); drawGlow(d.x, d.y, 4, WHITE, 1);
    }
    ctx.lineCap = 'butt';
  }
  if (P.ultOn && P.alive && P.weapon === 'ult' && S.mode !== 'menu') {
    const w = ultWidth() * (.94 + .06 * Math.sin(S.t * 55)), side = S.side, len = side ? W - P.x + 40 : P.y + 40;
    ctx.save(); ctx.translate(side ? P.x + 30 : P.x, side ? P.y + 1 : P.y - 28); if (!side) ctx.rotate(-Math.PI / 2);
    const g = ctx.createLinearGradient(0, -w * 1.6, 0, w * 1.6);
    g.addColorStop(0, `rgba(${ULTC},0)`); g.addColorStop(.28, `rgba(${ULTC},.18)`); g.addColorStop(.4, `rgba(${ULTC},.75)`); g.addColorStop(.47, 'rgba(255,250,235,.95)');
    g.addColorStop(.53, 'rgba(255,250,235,.95)'); g.addColorStop(.6, `rgba(${ULTC},.75)`); g.addColorStop(.72, `rgba(${ULTC},.18)`); g.addColorStop(1, `rgba(${ULTC},0)`);
    ctx.fillStyle = g; ctx.fillRect(0, -w * 1.6, len, w * 3.2);
    ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.fillRect(0, -w * .09, len, w * .18);
    for (let d = (S.t * 1500) % 96; d < len; d += 96) {
      ctx.strokeStyle = 'rgba(255,245,220,.45)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(d, 0, w * .16, w * .62, 0, 0, TAU); ctx.stroke();
      drawGlow(d, 0, w * .7, ULTC, .35);
    }
    ctx.strokeStyle = `rgba(${ULTC},.6)`; ctx.lineWidth = 1.4; ctx.beginPath();
    for (let k = 0; k < 2; k++) { const s = k ? 1 : -1; ctx.moveTo(0, 0); for (let d = 0; d < len; d += 24) ctx.lineTo(d, s * w * .55 * Math.sin(d * .045 - S.t * 26)); }
    ctx.stroke();
    drawGlow(0, 0, w * 2, ULTC, .95); drawGlow(0, 0, w * .75, WHITE, 1);
    ctx.restore();
  }
  ctx.globalCompositeOperation = 'source-over';
}


