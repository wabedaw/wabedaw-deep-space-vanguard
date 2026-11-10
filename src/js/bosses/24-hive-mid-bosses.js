/* ---------- hive mid-bosses (levels 3 / 6 / 9 of stage 4) ---------- */
function hiveBossGeo(b, lvl) {
  const mk = (ox, oy, R, type) => ({ ox, oy, r: R, r0: R, type, depth: 1, hp: 70 * lvl, maxhp: 70 * lvl, hitT: 0, aim: Math.PI / 2, dead: false, x: 0, y: 0 });
  b.hiveB = true;
  if (b.kind === 'scarab') {
    b.hw = clamp(W * .25, 100, 175); b.hh = b.hw * .6; b.r = b.hw;
    const R = clamp(b.hh * .22, 14, 24);
    b.parts = [mk(-b.hw * .5, -b.hh * .15, R, 'turret'), mk(b.hw * .5, -b.hh * .15, R, 'turret'), mk(-b.hw * .28, b.hh * .45, R, 'turret'), mk(b.hw * .28, b.hh * .45, R, 'turret')];
  } else if (b.kind === 'medusa') {
    b.r = clamp(Math.min(W, H) * .17, 80, 140); b.hw = b.r; b.hh = b.r * .75;
    const R = clamp(b.r * .16, 14, 22);
    b.parts = [mk(-b.r * .62, b.r * 1.12, R, 'missile'), mk(0, b.r * 1.32, R, 'missile'), mk(b.r * .62, b.r * 1.12, R, 'missile')];
  } else {
    b.r = clamp(Math.min(W, H) * .16, 76, 130); b.hw = b.r * .85; b.hh = b.r * 1.05;
    const R = clamp(b.r * .2, 14, 24);
    b.parts = [mk(-b.r * 1.08, b.r * .12, R, 'laser'), mk(b.r * 1.08, b.r * .12, R, 'laser')];
  }
}
function hiveGuns(e) {
  const w = e.hw, h = e.hh, r = e.r, t = e.parts.filter(p => !p.dead);
  if (e.kind === 'scarab') return { main: [0, h * .95], side: [[-w * .7, h * .4], [w * .7, h * .4]], top: [[-w * .4, -h * .5], [w * .4, -h * .5], [0, -h * .7]], core: [0, h * .2], turrets: t };
  if (e.kind === 'medusa') return { main: [0, r * .62], side: [[-r * .7, r * .42], [r * .7, r * .42]], top: [[-r * .5, -r * .3], [r * .5, -r * .3], [0, -r * .55]], core: [0, 0], turrets: t };
  return { main: [0, h * .9], side: [[-r * 1.08, r * .12], [r * 1.08, r * .12]], top: [[0, -h * .9], [-r * .6, -r * .4], [r * .6, -r * .4]], core: [0, 0], turrets: t };
}
function drawScarab(e, pulse) {
  const w = e.hw, h = e.hh, C = e.phase === 3 ? WARN : HIVE, op = e.phase === 3 ? .16 + .04 * Math.sin(S.t * 4) : e.phase === 2 ? .06 : 0;
  ctx.strokeStyle = '#2a3326'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
    const y = -h * .3 + k * h * .38, sw = Math.sin(S.t * 3 + k * 2 + (s > 0 ? 1 : 0)) * .15;
    ctx.beginPath(); ctx.moveTo(s * w * .6, y); ctx.lineTo(s * w * (.95 + sw * .3), y - h * .2); ctx.lineTo(s * w * (1.08 + sw * .2), y + h * .25); ctx.stroke();
  }
  ctx.lineCap = 'butt';
  ctx.fillStyle = '#18200f'; ctx.beginPath(); ctx.ellipse(0, h * .82, w * .28, h * .26, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#b8d08a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-w * .12, h * .98); ctx.quadraticCurveTo(-w * .22, h * 1.25, -w * .05, h * 1.3); ctx.moveTo(w * .12, h * .98); ctx.quadraticCurveTo(w * .22, h * 1.25, w * .05, h * 1.3); ctx.stroke();
  ctx.globalCompositeOperation = 'lighter'; drawGlow(0, h * .1, w * .5, C, op * 4 + .1); ctx.globalCompositeOperation = 'source-over';
  for (const s of [-1, 1]) {
    ctx.save(); ctx.translate(s * w * .02, -h * .7); ctx.rotate(s * op);
    const g = ctx.createLinearGradient(-w * .6, -h, w * .6, h); g.addColorStop(0, '#2f6f5e'); g.addColorStop(.35, '#7a5ab8'); g.addColorStop(.6, '#1d4a40'); g.addColorStop(1, '#0d1a16');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(s * w * .7, -h * .05, s * w * .82, h * .9, s * w * .1, h * 1.45); ctx.lineTo(0, h * 1.45); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(200,255,220,.35)'; ctx.lineWidth = 1.3; ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1; ctx.beginPath(); for (let k = 1; k < 4; k++) { ctx.moveTo(s * w * .08 * k, h * .1); ctx.quadraticCurveTo(s * w * .25 * k * .6, h * .7, s * w * .06 * k, h * 1.3); } ctx.stroke();
    ctx.globalCompositeOperation = 'lighter'; for (let k = 0; k < 3; k++) drawGlow(s * w * (.22 + k * .1), h * (.3 + k * .3), 4, C, .5 + .4 * Math.sin(S.t * 3 + k)); ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
  }
  ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.beginPath(); ctx.ellipse(-w * .25, -h * .3, w * .12, h * .35, -.3, 0, TAU); ctx.fill();
  ctx.globalCompositeOperation = 'lighter'; drawGlow(-w * .08, h * .85, 4, C, 1); drawGlow(w * .08, h * .85, 4, C, 1); ctx.globalCompositeOperation = 'source-over';
  for (const p of e.parts) drawModule(e, p, pulse);
}
function drawMedusa(e, pulse) {
  const r = e.r, C = e.phase === 3 ? WARN : HIVE2;
  ctx.lineCap = 'round';
  for (let k = 0; k < 9; k++) {
    const x0 = (k - 4) * r * .2, main = k === 1 || k === 4 || k === 7, p = main ? e.parts[k === 1 ? 0 : k === 4 ? 1 : 2] : null;
    const ex = p ? p.ox : x0 * 1.1 + Math.sin(S.t * 1.6 + k) * r * .2, ey = p ? p.oy : r * (1.1 + (k % 3) * .2);
    ctx.strokeStyle = main ? 'rgba(190,120,230,.8)' : 'rgba(170,110,220,.45)'; ctx.lineWidth = main ? 5 : 2.5;
    ctx.beginPath(); ctx.moveTo(x0, r * .35); ctx.bezierCurveTo(x0 + Math.sin(S.t * 2 + k) * r * .25, r * .7, ex - Math.sin(S.t * 2.3 + k) * r * .2, ey - r * .3, ex, ey); ctx.stroke();
  }
  ctx.lineCap = 'butt';
  ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, r * 1.5, C, .25 + .1 * pulse); ctx.globalCompositeOperation = 'source-over';
  ctx.beginPath(); ctx.moveTo(-r, r * .3); ctx.bezierCurveTo(-r * 1.05, -r * .9, r * 1.05, -r * .9, r, r * .3);
  for (let k = 8; k >= 0; k--) { const x = -r + (k / 8) * r * 2; ctx.quadraticCurveTo(x + r * .12, r * (.48 + .06 * Math.sin(S.t * 3 + k)), x, r * .3); }
  ctx.closePath();
  const g = ctx.createRadialGradient(0, -r * .3, r * .1, 0, 0, r * 1.1); g.addColorStop(0, 'rgba(240,190,255,.92)'); g.addColorStop(.45, 'rgba(150,80,200,.82)'); g.addColorStop(1, 'rgba(40,14,70,.9)');
  ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(255,220,255,.5)'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 1; for (let k = -3; k <= 3; k++) { ctx.beginPath(); ctx.moveTo(k * r * .12, -r * .55 + Math.abs(k) * r * .08); ctx.quadraticCurveTo(k * r * .26, 0, k * r * .3, r * .32); ctx.stroke(); }
  ctx.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 4; k++) drawGlow(Math.cos(S.t + k * 1.6) * r * .3, -r * .15 + Math.sin(S.t * 1.3 + k) * r * .15, r * .18, k % 2 ? HIVE : C, .7);
  drawGlow(0, -r * .1, r * .25, WHITE, .5 + .3 * pulse);
  ctx.globalCompositeOperation = 'source-over';
  for (const p of e.parts) drawModule(e, p, pulse);
}
function drawPrismarch(e, pulse) {
  const r = e.r, C = e.phase === 3 ? WARN : '170,255,220', ch = lances.some(l => l.owner === e && l.t < l.charge);
  ctx.save(); ctx.rotate(S.t * .4); ctx.strokeStyle = `rgba(${C},.35)`; ctx.lineWidth = 2; ctx.setLineDash([r * .2, r * .14]); ctx.beginPath(); ctx.arc(0, 0, r * 1.25, 0, TAU); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
  ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, r * 2, C, ch ? .55 : .22); ctx.globalCompositeOperation = 'source-over';
  const shard = (x, y, w, h, a, light) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    const g = ctx.createLinearGradient(-w, 0, w, 0); g.addColorStop(0, light ? '#9fe8d0' : '#4c9c8a'); g.addColorStop(.5, '#e8fff8'); g.addColorStop(1, light ? '#6ac8b0' : '#2a6658');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -h); ctx.lineTo(w, -h * .55); ctx.lineTo(w * .8, h * .7); ctx.lineTo(0, h); ctx.lineTo(-w * .8, h * .7); ctx.lineTo(-w, -h * .55); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1; ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, -h); ctx.lineTo(0, h); ctx.stroke();
    ctx.restore();
  };
  for (const [x, y, s, a] of [[-r * .55, r * .2, .5, -.35], [r * .55, r * .2, .5, .35], [-r * .3, -r * .45, .42, -.15], [r * .3, -r * .45, .42, .15]]) shard(x, y, r * .22 * s * 2, r * .55 * s * 2, a, false);
  shard(0, 0, r * .36, r * 1.0, 0, true);
  ctx.globalCompositeOperation = 'lighter'; drawGlow(0, r * .05, r * (ch ? .7 : .35), WHITE, ch ? 1 : .7); drawGlow(0, r * .9, r * .3, C, ch ? 1 : .4 * pulse);
  ctx.globalCompositeOperation = 'source-over';
  for (const p of e.parts) drawModule(e, p, pulse);
}

