/* ---------- player weapons: spread laser & beam laser (shared level 1-10) ---------- */
const BEAMC = '190,140,255';
const SPREAD = [
  [-7, 0, 1, 1, 1], [7, 0, 1, 1, 1], [0, 0, 1.4, 1.5, 2], [-18, -.1, 1, 1, 3], [18, .1, 1, 1, 3], [-22, -.22, 1, 1, 4], [22, .22, 1, 1, 4],
  [-26, -.34, 1, 1, 5], [26, .34, 1, 1, 5], [-12, -.05, 1, 1, 6], [12, .05, 1, 1, 6], [-30, -.46, 1, 1, 7], [30, .46, 1, 1, 7],
  [-34, -.58, 1, 1, 9], [34, .58, 1, 1, 9], [-38, -.7, 1, 1, 10], [38, .7, 1, 1, 10],
];
const weaponName = () => P.weapon === 'ult' ? (P.superT > 0 ? I18('歼星炮 · ', 'STARBREAKER · ') + Math.max(0, P.superT).toFixed(1) + 's' : I18('歼星炮 · 终极武器', 'STARBREAKER · ULTIMATE')) : P.weapon === 'beam' ? I18('激光束', 'BEAM LASER') : I18('散射激光', 'SPREAD LASER');
const weaponPerk = () => P.weapon === 'ult' ? '' : P.lvl >= 8 ? (P.weapon === 'beam' ? I18(' · 辐射', ' · ARC') : I18(' · 爆裂', ' · BURST')) : '';
const beamWidth = () => 5 + P.lvl * 1.3;
const beamDps = () => 34 + P.lvl * 11;
const beamFocusMul = () => 1 + .7 * (P.focus || 0);
function switchWeapon(w) {
  if (S.mode !== 'play' || !P.alive) return;
  if (P.superT > 0) { S.toast = { txt: I18('歼星炮运转中 · 结束后自动恢复原武器', 'Starbreaker active · your weapon returns when it ends'), t: 1.4 }; return; }
  const next = w || (P.weapon === 'spread' ? 'beam' : P.weapon === 'beam' && ultAvail() ? 'ult' : 'spread');
  if (next === P.weapon || (next === 'ult' && !ultAvail())) return;
  P.weapon = next; P.bm = null; P.arcs = []; P.focus = 0; P.focusFull = false;
  S.toast = { txt: I18('武器切换 · ', 'Weapon · ') + weaponName() + (P.weapon === 'ult' ? I18(' · 飞弹键 = 湮星脉冲', ' · missile key = nova pulse') : ' MK.' + ROMAN[P.lvl - 1]), t: P.weapon === 'ult' ? 2.2 : 1.4 };
  sfx.weaponSwitch(); updateWeaponBtn();
}
function updateWeaponBtn() {
  const b = document.getElementById('weaponBtn'), m = document.getElementById('missileBtn'), nx = P.weapon === 'spread' ? 'beam' : P.weapon === 'beam' && ultAvail() ? 'ult' : 'spread';
  if (b) { b.textContent = P.superT > 0 ? I18('歼星', 'ULTRA') : { spread: I18('散射', 'SPREAD'), beam: I18('光束', 'BEAM'), ult: I18('终极', 'ULTRA') }[nx]; b.dataset.w = P.weapon; }
  if (m) { const nv = P.weapon === 'ult' && ultAvail(); m.textContent = nv ? I18('脉冲', 'NOVA') : I18('飞弹', 'MISSILE'); m.dataset.w = nv ? 'ult' : ''; }
}
function laserBoom(x, y) {
  const L = P.lvl, R = L >= 10 ? 44 : 32, dmg = L >= 10 ? 1 : .6;
  parts.push({ k: 'flash', x, y, vx: 0, vy: 0, life: .14, max: .14, r: R * 1.2, c: '255,200,120' });
  waves.push({ x, y, r: 4, max: R, life: .22, maxl: .22, c: '255,170,90' });
  if (parts.length < 1400) for (let i = 0; i < 4; i++) { const a = rand(0, TAU), sp = rand(80, 200); parts.push({ k: 'spark', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: .2, max: .2, c: pick(FIRE), w: 1.2 }); }
  sfx.boomPop(x);
  for (const e of ships) {
    if (e.dead || e.cap || e.dying) continue;
    if (e.type === 'boss') { const pt = hitPart(e, x, y, R); if (pt) damagePart(e, pt, dmg, x, y); continue; }
    if (Math.hypot(e.x - x, e.y - y) < R + (e.r || 10)) damage(e, dmg, e.x, e.y, true);
  }
  for (const k of rocks) if (!k.dead && Math.hypot(k.x - x, k.y - y) < R + k.r) damage(k, dmg, k.x, k.y, false);
}
function beamProj(g, cx, cy, fa, la, wH) {
  const rx = cx - g.ox, ry = cy - g.oy, along = rx * g.ux + ry * g.uy, lat = Math.abs(-rx * g.uy + ry * g.ux);
  if (lat > la + wH || along + fa < 0) return -1;
  const q = Math.min(lat, la) / la;
  return Math.max(0, along - fa * Math.sqrt(Math.max(0, 1 - q * q)));
}
function beamHit(h, amt, x, y) {
  if (h.k === 'ship') damage(h.e, amt, x, y, true);
  else if (h.k === 'part') damagePart(h.e, h.p, amt, x, y);
  else if (h.k === 'rock') damage(h.e, amt, x, y, false);
  else if (h.k === 'sat') damageSat(h.e, amt, x, y);
  else sparks(x, y, 3, ['255,220,180', '255,255,255'], Math.atan2(-P.bm.uy, -P.bm.ux), 1.6);
}
function updatePlayerBeam(dt) {
  const L = P.lvl, side = S.side, wH = beamWidth() / 2;
  const g = { ox: side ? P.x + 34 : P.x, oy: side ? P.y + .5 : P.y - 32, ux: side ? 1 : 0, uy: side ? 0 : -1 };
  const maxL = side ? W + 40 - g.ox : g.oy + 40;
  let best = null, bd = maxL;
  const take = (d, info) => { if (d >= 0 && d < bd) { bd = d; best = info; } };
  for (const e of ships) {
    if (e.dead || e.cap || e.dying) continue;
    if (e.type === 'boss') {
      for (const p of e.parts) if (!p.dead && !p.hidden) take(beamProj(g, p.x ?? e.x + p.ox, p.y ?? e.y + p.oy, p.r, p.r, wH), { k: 'part', e, p });
      if (e.kind === 'colossus') {
        if (!e.citadelGone && !(e.shield && side && rowPart(e, g.oy))) take(beamProj(g, e.x, e.y, e.hh * .38, e.hh * .38, wH), { k: 'ship', e });
        if (side && !rowPart(e, g.oy)) { const y = g.oy; if (y > e.y - e.hh * 1.15 && y < e.groundY) take(Math.max(0, e.x - e.hw * .1 - g.ox), { k: 'armor' }); if (y > e.y + e.hh * .38 && y < e.groundY) take(Math.max(0, e.x - e.hw * .44 - g.ox), { k: 'armor' }); }
      } else if (e.gate) { take(beamProj(g, e.x - e.hw * .5, e.y, e.rl, e.rl, wH), { k: 'ship', e }); if (side && e.open < .4 && g.oy > e.c && g.oy < e.f) take(Math.max(0, e.x - e.hw * .5 - g.ox), { k: 'armor' }); }
      else if (e.kind === 'omega') { if (e.stage === 3 && !e.shield) take(beamProj(g, e.x + e.gox, e.y + e.goy, e.gr * 1.2, e.gr * 1.2, wH), { k: 'ship', e }); }
      else if (e.kind === 'god') { const rr = e.phase === 3 ? e.hw * .38 : 0; if (!(e.shield && side && rowPart(e, g.oy))) take(rr ? beamProj(g, e.x, e.y, rr, rr, wH) : beamProj(g, e.x, e.y, side ? e.hw * .62 : e.hh * .82, side ? e.hh * .82 : e.hw * .62, wH), { k: 'ship', e }); }
      else if (e.kind === 'leviathan') take(beamProj(g, e.x, e.y, e.r * .78, e.r * .78, wH), { k: 'ship', e });
      else take(beamProj(g, e.x, e.y, side ? e.hw : e.hh, side ? e.hh : e.hw, wH), { k: 'ship', e });
      continue;
    }
    if (e.x < -20 || e.x > W + 20 || e.y < -30 || e.y > H + 20) continue;
    const fa = e.surf ? (side ? e.hw : e.hh) : e.r, la = e.surf ? (side ? e.hh : e.hw) : e.r;
    take(beamProj(g, e.x, e.y, fa, la, wH), { k: 'ship', e });
  }
  for (const k of rocks) if (!k.dead) take(beamProj(g, k.x, k.y, k.r * .9, k.r * .9, wH), { k: 'rock', e: k });
  for (const st of liveSats()) take(beamProj(g, st.x, st.y, 12, 12, wH), { k: 'sat', e: st });
  if (side && (GW || IW)) for (let d = 0; d < bd; d += 8) if (solidTopAt(g.ox + d) < g.oy || (IW && ceilAt(g.ox + d) > g.oy)) { take(d, { k: 'ground' }); break; }
  const hx = g.ox + g.ux * bd, hy = g.oy + g.uy * bd;
  const onTgt = best && best.k !== 'armor' && best.k !== 'ground';
  P.focus = onTgt ? Math.min(1, P.focus + dt / .6) : Math.max(0, P.focus - dt / .4);
  if (P.focus >= 1 && !P.focusFull) { P.focusFull = true; waves.push({ x: hx, y: hy, r: 6, max: 46 + L * 2, life: .3, maxl: .3, c: BEAMC }); parts.push({ k: 'flash', x: hx, y: hy, vx: 0, vy: 0, life: .12, max: .12, r: 40, c: '235,215,255' }); }
  else if (P.focus < .5) P.focusFull = false;
  P.bm = { ox: g.ox, oy: g.oy, ux: g.ux, uy: g.uy, len: bd, w: wH * 2, hit: best, hx, hy, f: P.focus };
  for (const b of ebul) {
    if (b.dead || !(b.k === 'homing' || b.k === 'shell' || b.k === 'rocket' || b.k === 'bomb')) continue;
    const rx = b.x - g.ox, ry = b.y - g.oy, al = rx * g.ux + ry * g.uy;
    if (al > 0 && al < bd && Math.abs(-rx * g.uy + ry * g.ux) < b.r + wH) { b.dead = true; explode(b.x, b.y, 10, FIRE); addScore(10, b.x, b.y); }
  }
  P.arcs = [];
  if (L >= 8) {
    const R = 80 + (L - 8) * 25, n = L - 6, cand = [];
    const add = (x, y, info) => { const rx = x - g.ox, ry = y - g.oy, al = clamp(rx * g.ux + ry * g.uy, 0, bd), px = g.ox + g.ux * al, py = g.oy + g.uy * al, dd = Math.hypot(x - px, y - py); if (dd < R && dd > 2) cand.push({ dd, x, y, px, py, info, seed: Math.random() * 1000 }); };
    for (const e of ships) {
      if (e.dead || e.cap || e.dying) continue;
      if (e.type === 'boss') { for (const p of e.parts) if (!p.dead && !p.hidden && !(best && best.p === p)) add(p.x ?? e.x + p.ox, p.y ?? e.y + p.oy, { k: 'part', e, p }); continue; }
      if (best && best.e === e) continue;
      if (e.x < 0 || e.x > W || e.y < 0 || e.y > H) continue;
      add(e.x, e.y, { k: 'ship', e });
    }
    for (const k of rocks) if (!k.dead && k.r > 14 && !k.iron && !(best && best.e === k)) add(k.x, k.y, { k: 'rock', e: k });
    for (const st of liveSats()) if (!(best && best.e === st)) add(st.x, st.y, { k: 'sat', e: st });
    cand.sort((a, b) => a.dd - b.dd); P.arcs = cand.slice(0, n);
  }
  P.beamTick -= dt;
  if (P.beamTick <= 0) {
    P.beamTick = .07;
    const amt = beamDps() * .07;
    if (best) beamHit(best, amt * beamFocusMul(), hx, hy);
    for (const a of P.arcs) beamHit(a.info, amt * .5, a.x, a.y);
  }
  if (best && parts.length < 1500 && Math.random() < .6) { const a = Math.atan2(-g.uy, -g.ux); parts.push({ k: 'spark', x: hx, y: hy, vx: Math.cos(a + rand(-1, 1)) * rand(120, 260), vy: Math.sin(a + rand(-1, 1)) * rand(120, 260), life: .2, max: .2, c: pick([BEAMC, '255,255,255', '220,200,255']), w: 1.4 }); }
}
function zap(x1, y1, x2, y2, seed, jit) {
  const n = 7, dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
  ctx.beginPath(); ctx.moveTo(x1, y1);
  for (let i = 1; i < n; i++) { const t = i / n, j = Math.sin(seed + i * 12.9898 + S.t * 40) * jit * Math.sin(t * Math.PI); ctx.lineTo(x1 + dx * t + nx * j, y1 + dy * t + ny * j); }
  ctx.lineTo(x2, y2); ctx.stroke();
}
function drawPlayerBeam() {
  const b = P.bm; if (!b || !P.beamOn || !P.alive || P.weapon !== 'beam') return;
  const f = b.f || 0, ex = b.ox + b.ux * b.len, ey = b.oy + b.uy * b.len, fl = .85 + .15 * Math.sin(S.t * 60), w = b.w * fl * (1 + .28 * f);
  ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  const line = (lw, col) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(b.ox, b.oy); ctx.lineTo(ex, ey); ctx.stroke(); };
  line(w * 3.2, `rgba(${BEAMC},${.13 + .1 * f})`); line(w * 1.7, `rgba(${BEAMC},.32)`); line(w, `rgba(${BEAMC},.8)`); line(Math.max(1.5, w * (.36 + .16 * f)), 'rgba(255,255,255,.95)');
  for (let d = (S.t * 900) % 64; d < b.len; d += 64) drawGlow(b.ox + b.ux * d, b.oy + b.uy * d, w * .9, BEAMC, .3);
  drawGlow(b.ox, b.oy, w * 2.2, BEAMC, .9); drawGlow(b.ox, b.oy, w * .8, WHITE, 1);
  if (b.hit) {
    drawGlow(ex, ey, (w * 2.6 + 8) * (1 + .45 * f), BEAMC, .95); drawGlow(ex, ey, w * (1 + .4 * f), WHITE, 1);
    if (f > .25) { const rr = w * 1.5 + 12 + 4 * Math.sin(S.t * 30); ctx.save(); ctx.translate(ex, ey); ctx.rotate(S.t * 7); ctx.setLineDash([7, 6]); ctx.strokeStyle = `rgba(235,215,255,${.75 * f})`; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(0, 0, rr, 0, TAU); ctx.stroke(); ctx.rotate(-S.t * 12); ctx.setLineDash([3, 9]); ctx.strokeStyle = `rgba(${BEAMC},${.6 * f})`; ctx.beginPath(); ctx.arc(0, 0, rr + 7, 0, TAU); ctx.stroke(); ctx.restore(); ctx.setLineDash([]); }
  }
  for (const a of P.arcs || []) {
    ctx.strokeStyle = 'rgba(130,170,255,.35)'; ctx.lineWidth = 5; zap(a.px, a.py, a.x, a.y, a.seed, 14);
    ctx.strokeStyle = 'rgba(220,235,255,.95)'; ctx.lineWidth = 1.6; zap(a.px, a.py, a.x, a.y, a.seed, 14);
    drawGlow(a.x, a.y, 16, '160,200,255', .9); drawGlow(a.px, a.py, 10, '200,220,255', .7);
  }
  ctx.lineCap = 'butt'; ctx.globalCompositeOperation = 'source-over';
}

