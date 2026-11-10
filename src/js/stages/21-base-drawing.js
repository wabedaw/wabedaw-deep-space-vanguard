/* ---------- base drawing ---------- */
function bhash(k, i) { const s = Math.sin(k * 127.1 + i * 311.7 + 17.3) * 43758.5453; return s - Math.floor(s); }
function makeBaseBg() {
  const c = document.createElement('canvas'); c.width = Math.max(1, W); c.height = Math.max(1, H); const g = c.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, '#04060b'); lg.addColorStop(.5, '#0a1220'); lg.addColorStop(1, '#04060b');
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  const rg = g.createRadialGradient(W * .6, H * .5, 10, W * .6, H * .5, Math.max(W, H) * .7); rg.addColorStop(0, 'rgba(60,140,180,.16)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  return c;
}
function drawGear(x, y, R, a, col, teeth) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  ctx.fillStyle = col; ctx.beginPath();
  for (let i = 0; i < teeth * 2; i++) { const r = i % 2 ? R : R * .86, a0 = i / (teeth * 2) * TAU, a1 = (i + 1) / (teeth * 2) * TAU; ctx.lineTo(Math.cos(a0) * r, Math.sin(a0) * r); ctx.lineTo(Math.cos(a1) * r, Math.sin(a1) * r); }
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.arc(0, 0, R * .62, 0, TAU); ctx.fill();
  ctx.strokeStyle = col; ctx.lineWidth = R * .1; ctx.beginPath(); for (let i = 0; i < 5; i++) { const b = i / 5 * TAU; ctx.moveTo(0, 0); ctx.lineTo(Math.cos(b) * R * .62, Math.sin(b) * R * .62); } ctx.stroke();
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, R * .16, 0, TAU); ctx.fill();
  ctx.restore();
}
function drawBaseFar() {
  const par = .18, TW = 420, off = S.wx * par;
  for (let k = Math.floor(off / TW) - 1; k * TW - off < W + TW; k++) {
    const x0 = k * TW - off, h = i => bhash(k, i);
    const cx = x0 + h(1) * TW * .7, cw = 50 + h(2) * 70;
    ctx.fillStyle = '#0b111b'; ctx.fillRect(cx, 0, cw, H); ctx.fillStyle = '#131c2b'; ctx.fillRect(cx, 0, 3, H); ctx.fillRect(cx + cw - 3, 0, 3, H);
    ctx.globalCompositeOperation = 'lighter';
    for (const fy of [.24, .5, .76]) { const a = .12 + .1 * Math.sin(S.t * 1.4 + k + fy * 9); ctx.fillStyle = h(3) > .5 ? `rgba(90,220,255,${a})` : `rgba(255,170,80,${a})`; ctx.fillRect(cx + 4, H * fy - 3, cw - 8, 6); }
    ctx.globalCompositeOperation = 'source-over';
    drawGear(x0 + h(4) * TW, H * (.22 + h(5) * .56), 46 + h(6) * 80, S.t * (h(7) > .5 ? .25 : -.25) * 60 / (46 + h(6) * 80), '#0f1724', 14 + ((h(8) * 10) | 0));
    const gy = H * (.3 + h(9) * .4);
    ctx.strokeStyle = '#111a28'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, gy); ctx.lineTo(x0 + TW, gy); ctx.moveTo(x0, gy + 22); ctx.lineTo(x0 + TW, gy + 22);
    for (let x = x0; x < x0 + TW; x += 22) { ctx.moveTo(x, gy); ctx.lineTo(x + 11, gy + 22); ctx.lineTo(x + 22, gy); } ctx.stroke();
  }
}
function drawBaseMid() {
  const par = .45, TW = 520, off = S.wx * par;
  for (let k = Math.floor(off / TW) - 1; k * TW - off < W + TW; k++) {
    const x0 = k * TW - off, h = i => bhash(k + 911, i);
    const bx = x0 + h(1) * TW;
    ctx.fillStyle = '#151d2b'; ctx.fillRect(bx - 13, 0, 26, H); ctx.fillStyle = '#1f2a3c'; ctx.fillRect(bx - 13, 0, 5, H); ctx.fillRect(bx + 8, 0, 5, H);
    ctx.fillStyle = '#2b3a52'; for (let y = 20 + h(2) * 30; y < H; y += 46) { ctx.beginPath(); ctx.arc(bx - 10, y, 1.6, 0, TAU); ctx.arc(bx + 10, y, 1.6, 0, TAU); ctx.fill(); }
    for (const [i, fy] of [[3, .3], [4, .66]]) {
      const y = H * (fy + (h(i) - .5) * .16), t = 12 + h(i + 5) * 10;
      const g = ctx.createLinearGradient(0, y - t, 0, y + t); g.addColorStop(0, '#2a3548'); g.addColorStop(.45, '#1a2232'); g.addColorStop(1, '#0c111b');
      ctx.fillStyle = g; ctx.fillRect(x0, y - t, TW, t * 2);
      ctx.fillStyle = '#26324a'; for (let x = x0 + (h(i + 2) * 90); x < x0 + TW; x += 90) ctx.fillRect(x, y - t - 3, 10, t * 2 + 6);
      ctx.globalCompositeOperation = 'lighter';
      const c = h(i + 7) > .5 ? '90,220,255' : '255,160,80';
      ctx.fillStyle = `rgba(${c},.18)`; ctx.fillRect(x0, y - 1, TW, 2);
      for (let j = 0; j < 3; j++) { const px = x0 + ((S.t * 140 + j * TW / 3 + h(i) * 300) % TW); drawGlow(px, y, 7, c, .7); }
      ctx.globalCompositeOperation = 'source-over';
    }
  }
}
function hazStripes(x0, x1, y, h) {
  if (x1 - x0 < 10) return;
  ctx.save(); ctx.beginPath(); ctx.rect(x0, y, x1 - x0, h); ctx.clip();
  ctx.fillStyle = '#2a2414'; ctx.fillRect(x0, y, x1 - x0, h);
  ctx.fillStyle = 'rgba(240,190,60,.78)'; ctx.beginPath();
  for (let x = x0 - h * 2; x < x1 + h; x += h * 2) { ctx.moveTo(x, y + h); ctx.lineTo(x + h, y); ctx.lineTo(x + h * 2, y); ctx.lineTo(x + h, y + h); }
  ctx.fill(); ctx.restore();
}
function drawBaseShell() {
  const step = 8, n = Math.ceil(W / step) + 2, cs = [], fs = [];
  for (let i = 0; i <= n; i++) { const x = i * step - 8; cs.push(ceilAt(x)); fs.push(floorAt(x)); }
  for (const top of [true, false]) {
    const arr = top ? cs : fs, edgeY = top ? -10 : H + 10;
    ctx.beginPath(); ctx.moveTo(-8, edgeY);
    for (let i = 0; i <= n; i++) ctx.lineTo(i * step - 8, arr[i]);
    ctx.lineTo(n * step - 8, edgeY); ctx.closePath();
    const gr = top ? ctx.createLinearGradient(0, 0, 0, H * .32) : ctx.createLinearGradient(0, H, 0, H * .68);
    gr.addColorStop(0, '#05080d'); gr.addColorStop(.65, '#192131'); gr.addColorStop(1, '#2c374b');
    ctx.fillStyle = gr; ctx.fill();
    ctx.beginPath(); for (let i = 0; i <= n; i++) { const x = i * step - 8; i ? ctx.lineTo(x, arr[i]) : ctx.moveTo(x, arr[i]); }
    ctx.strokeStyle = '#93a3bc'; ctx.lineWidth = 2; ctx.stroke();
    ctx.save(); ctx.translate(0, top ? -10 : 10); ctx.strokeStyle = 'rgba(64,78,102,.95)'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
  }
  for (const b of IW.blocks) {
    const x0 = b.start - S.wx, x1 = b.end - S.wx;
    if (x1 < -20 || x0 > W + 20) continue;
    const c = b.c * H, f = b.f * H, a = x0 + 40, z = x1 - 6;
    ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(a - 4, c - 2); ctx.lineTo(a - 4, c - 70); ctx.moveTo(a - 4, f + 2); ctx.lineTo(a - 4, f + 70); ctx.stroke();
    if (z - a > 30) {
      ctx.strokeStyle = 'rgba(130,150,180,.13)'; ctx.lineWidth = 1; ctx.strokeRect(a + 8, c - 52, z - a - 16, 26); ctx.strokeRect(a + 8, f + 26, z - a - 16, 26);
      ctx.fillStyle = 'rgba(150,170,200,.25)'; for (let x = a + 8; x < z - 8; x += 26) { ctx.fillRect(x, c - 18, 2, 2); ctx.fillRect(x, f + 16, 2, 2); }
      if (b.haz) { hazStripes(a, z, c - 13, 7); hazStripes(a, z, f + 6, 7); }
    }
    if (b.lamp && z - a > 20) {
      const lx = (a + z) / 2, on = ((S.t * 1.6 + b.k) | 0) % 3, col = on ? '255,180,80' : '255,70,60';
      ctx.fillStyle = '#0d1118'; ctx.fillRect(lx - 7, c - 4, 14, 4); ctx.fillRect(lx - 7, f, 14, 4);
      ctx.globalCompositeOperation = 'lighter'; drawGlow(lx, c + 1, 12, col, .75); drawGlow(lx, f - 1, 12, col, .75); ctx.globalCompositeOperation = 'source-over';
    }
  }
}
function drawBaseProps() {
  for (const p of IW.props) {
    if (p.dead || p.x < -80 || p.x > W + 80) continue;
    const s = p.att === 'c' ? 1 : -1, wall = p.att === 'c' ? p.c : p.f;
    if (p.k === 'crusher') {
      const head = wall + s * (p.reach + 12);
      ctx.fillStyle = '#1b212c'; ctx.fillRect(p.x - 38, s > 0 ? wall - 6 : wall - 12, 76, 18);
      ctx.fillStyle = metalGrad(-10, 10, '#8a94a6', '#4a5262', '#262a33');
      ctx.save(); ctx.translate(p.x, 0); ctx.fillRect(-9, Math.min(wall, head), 18, Math.abs(head - wall)); ctx.restore();
      ctx.fillStyle = '#5c6476'; ctx.fillRect(p.x - 30, head - 12, 60, 24);
      hazStripes(p.x - 30, p.x + 30, s > 0 ? head + 4 : head - 12, 8);
      ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 1.2; ctx.strokeRect(p.x - 30, head - 12, 60, 24);
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(p.x - 22, head - s * 4, 6, p.warn ? WARN : '255,180,80', p.warn ? (((S.t * 14) | 0) % 2 ? 1 : .3) : .45);
      drawGlow(p.x + 22, head - s * 4, 6, p.warn ? WARN : '255,180,80', p.warn ? (((S.t * 14) | 0) % 2 ? 1 : .3) : .45);
      ctx.globalCompositeOperation = 'source-over';
    } else if (p.k === 'vent') {
      ctx.fillStyle = '#12161e'; ctx.fillRect(p.x - 18, s > 0 ? wall : wall - 8, 36, 8);
      ctx.fillStyle = '#2c3442'; for (let i = -2; i <= 2; i++) ctx.fillRect(p.x + i * 7 - 1.5, s > 0 ? wall + 1 : wall - 7, 3, 6);
      ctx.globalCompositeOperation = 'lighter';
      if (p.warn) drawGlow(p.x, wall + s * 4, 16 + 6 * rnd(), '255,140,60', .6);
      if (p.on && p.len > 2) {
        const L = p.len, g = ctx.createLinearGradient(0, wall, 0, wall + s * L); g.addColorStop(0, 'rgba(255,240,200,.95)'); g.addColorStop(.35, 'rgba(255,150,60,.75)'); g.addColorStop(1, 'rgba(255,60,30,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(p.x - 12, wall); ctx.lineTo(p.x - 20 - 4 * Math.sin(S.t * 30), wall + s * L); ctx.lineTo(p.x + 20 + 4 * Math.cos(S.t * 27), wall + s * L); ctx.lineTo(p.x + 12, wall); ctx.closePath(); ctx.fill();
        for (let i = 0; i < 4; i++) drawGlow(p.x + rand(-6, 6), wall + s * L * (.15 + i * .22), 14 - i * 2, '255,170,80', .7);
      }
      ctx.globalCompositeOperation = 'source-over';
    } else {
      const yT = p.c, yB = p.f;
      for (const [y, d] of [[yT, 1], [yB, -1]]) {
        ctx.fillStyle = metalGrad(-14, 14, '#7e8696', '#3e4554', '#1a1d25'); ctx.fillRect(p.x - 12, d > 0 ? y : y - 20, 24, 20);
        ctx.fillStyle = '#c08a40'; for (let i = 0; i < 3; i++) ctx.fillRect(p.x - 13, (d > 0 ? y : y - 20) + 4 + i * 5, 26, 2);
        ctx.fillStyle = '#2a2f3a'; ctx.beginPath(); ctx.arc(p.x, y + d * 22, 6, 0, TAU); ctx.fill();
      }
      ctx.globalCompositeOperation = 'lighter';
      const tip1 = yT + 24, tip2 = yB - 24;
      if (p.warn) { drawGlow(p.x, tip1, 10 + 6 * rnd(), '160,210,255', .8); drawGlow(p.x, tip2, 10 + 6 * rnd(), '160,210,255', .8); if (rnd() < .5) { ctx.strokeStyle = 'rgba(190,225,255,.6)'; ctx.lineWidth = 1; zap(p.x, tip1, p.x + rand(-10, 10), tip1 + 26, rand(0, 99), 6); } }
      if (p.on) {
        ctx.strokeStyle = 'rgba(120,180,255,.35)'; ctx.lineWidth = 9; zap(p.x, tip1, p.x, tip2, p.t * 7, 14);
        ctx.strokeStyle = 'rgba(230,245,255,.95)'; ctx.lineWidth = 2; zap(p.x, tip1, p.x, tip2, p.t * 7 + 3, 14); zap(p.x, tip1, p.x, tip2, p.t * 9 + 11, 10);
        for (let y = tip1; y < tip2; y += 40) drawGlow(p.x + rand(-6, 6), y, 16, '140,200,255', .5);
      }
      if (p.hitT > 0) { drawGlow(p.x, tip1, 18, WHITE, p.hitT * 6); drawGlow(p.x, tip2, 18, WHITE, p.hitT * 6); }
      ctx.globalCompositeOperation = 'source-over';
      if (p.hp < p.maxhp) drawMiniBar(p.x, yT + 34, 30, p.hp / p.maxhp, '160,210,255');
    }
  }
}
function drawBaseWorld() {
  if (IW.theme === 2) { drawBaseWorldB(); return; }
  if (IW.theme === 3) { drawBaseWorldC(); return; }
  if (IW.theme === 4) { drawBaseWorldD(); return; }
  if (!IW.bg || IW.bgW !== W || IW.bgH !== H) { IW.bg = makeBaseBg(); IW.bgW = W; IW.bgH = H; }
  ctx.drawImage(IW.bg, 0, 0, W, H);
  drawBaseFar(); ctx.globalAlpha = .62; drawBaseMid(); ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(5,9,16,.28)'; ctx.fillRect(0, 0, W, H);
  const B = S.boss || ships.find(e => e.kind === 'core');
  if (B && B.kind === 'core') drawCoreChamber(B);
  drawBaseShell(); drawBaseProps();
}
function drawBaseFront() {
  const B = S.boss;
  if (B && (B.gate || B.kind === 'core') && !B.dying) {
    const a = .07 + .05 * Math.sin(S.t * 4);
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, `rgba(255,40,30,${a})`); g.addColorStop(.25, 'rgba(255,40,30,0)'); g.addColorStop(.75, 'rgba(255,40,30,0)'); g.addColorStop(1, `rgba(255,40,30,${a})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
}
function drawGate(e, pulse) {
  const w = e.hw, h = e.hh, C = e.phase === 3 ? WARN : GATE_COL[e.gate], op = e.open;
  ctx.fillStyle = '#141922'; ctx.fillRect(-w * 1.1, -h - 6, w * 2.9, 34); ctx.fillRect(-w * 1.1, h - 28, w * 2.9, 34);
  hazStripes(-w * 1.1, w * 1.8, -h + 18, 8); hazStripes(-w * 1.1, w * 1.8, h - 26, 8);
  ctx.save(); ctx.beginPath(); ctx.rect(-w * 2, -h + 2, w * 5, h * 2 - 4); ctx.clip();
  for (const d of [-1, 1]) {
    const y0 = d < 0 ? -h - op * h : op * h, hh = h;
    const g = ctx.createLinearGradient(-w * .5, 0, w, 0); g.addColorStop(0, '#6d7586'); g.addColorStop(.35, '#4a5262'); g.addColorStop(1, '#1d222b');
    ctx.fillStyle = g; ctx.fillRect(-w * .5, y0, w * 1.5, hh);
    ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let y = y0 + 26; y < y0 + hh - 10; y += 34) { ctx.moveTo(-w * .5, y); ctx.lineTo(w, y); }
    ctx.moveTo(w * .1, y0); ctx.lineTo(w * .1, y0 + hh); ctx.stroke();
    ctx.fillStyle = 'rgba(160,175,200,.35)'; for (let y = y0 + 12; y < y0 + hh; y += 34) for (const x of [-.38, .5]) { ctx.beginPath(); ctx.arc(x * w, y, 2, 0, TAU); ctx.fill(); }
    for (let i = 0; i < e.gate; i++) { ctx.fillStyle = '#3b4252'; ctx.fillRect(-w * .62, y0 + hh * (.18 + i * .22), w * .2, hh * .14); }
    hazStripes(-w * .5, w, d < 0 ? y0 + hh - 12 : y0, 12);
  }
  ctx.restore();
  if (op < .05 && !e.dying) {
    const R = e.rl, cx = -w * .5;
    ctx.fillStyle = '#12151c'; ctx.beginPath(); ctx.arc(cx, 0, R * 1.3, 0, TAU); ctx.fill();
    ctx.strokeStyle = metalGrad(-R, R, '#a8b0c2', '#555c6c', '#2a2d35'); ctx.lineWidth = R * .26; ctx.beginPath(); ctx.arc(cx, 0, R * 1.1, 0, TAU); ctx.stroke();
    ctx.save(); ctx.translate(cx, 0); ctx.rotate(S.t * (e.phase === 3 ? 2.4 : 1)); ctx.strokeStyle = `rgba(${C},.8)`; ctx.lineWidth = 2; ctx.setLineDash([R * .5, R * .3]); ctx.beginPath(); ctx.arc(0, 0, R * .95, 0, TAU); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    const cg = ctx.createRadialGradient(cx - R * .2, -R * .2, 2, cx, 0, R * .85); cg.addColorStop(0, '#fff6e8'); cg.addColorStop(.4, `rgb(${C})`); cg.addColorStop(1, '#200a06');
    ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cx, 0, R * .8, 0, TAU); ctx.fill();
    ctx.globalCompositeOperation = 'lighter'; drawGlow(cx, 0, R * 1.6, C, .4 * pulse + (e.phase > 1 ? .35 : 0)); drawGlow(cx, 0, R * .3, WHITE, 1); ctx.globalCompositeOperation = 'source-over';
    if (e.shield) {
      const fl = .5 + .5 * Math.sin(S.t * 3), hit = Math.max(0, e.shieldHit || 0) * 3, rr = R * 1.55;
      ctx.save(); ctx.beginPath(); ctx.arc(cx, 0, rr, 0, TAU); ctx.globalCompositeOperation = 'lighter';
      const sg = ctx.createRadialGradient(cx, 0, rr * .5, cx, 0, rr); sg.addColorStop(0, 'rgba(120,220,255,0)'); sg.addColorStop(1, `rgba(140,230,255,${.22 + .1 * fl + hit * .3})`);
      ctx.fillStyle = sg; ctx.fill(); ctx.strokeStyle = `rgba(160,240,255,${.5 + .3 * fl + hit})`; ctx.lineWidth = 1.6; ctx.stroke(); ctx.restore();
    }
  } else if (op < .6) { ctx.globalCompositeOperation = 'lighter'; drawGlow(-w * .5, 0, e.rl * 2, '255,140,60', .6 * (1 - op)); ctx.globalCompositeOperation = 'source-over'; }
  ctx.globalCompositeOperation = 'lighter';
  for (const d of [-1, 1]) for (let i = 0; i < 4; i++) drawGlow(w * .8, d * (h - 40 - i * 18) - d * op * h, 3, e.shield ? WARN : '120,255,160', ((S.t * 3 + i) | 0) % 2 ? 1 : .35);
  ctx.globalCompositeOperation = 'source-over';
  for (const p of e.parts) if (!p.hidden || p.dead) if (!e.dying || op < .3) drawModule(e, p, pulse);
}
function drawCoreChamber(e) {
  const x = e.x, y = e.y, R = e.r;
  ctx.save(); ctx.globalAlpha = .9;
  ctx.strokeStyle = '#121a28'; ctx.lineWidth = R * .5; ctx.beginPath(); ctx.arc(x, y, R * 3, 0, TAU); ctx.stroke();
  ctx.strokeStyle = '#18233a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, R * 3.3, 0, TAU); ctx.arc(x, y, R * 2.7, 0, TAU); ctx.stroke();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + S.t * .15; drawGlow(x + Math.cos(a) * R * 3, y + Math.sin(a) * R * 3, 4, coreCol(e), .5 + .5 * Math.sin(S.t * 4 + i)); }
  ctx.restore(); ctx.globalCompositeOperation = 'source-over';
}
function drawCore(e, pulse) {
  const R = e.r, C = coreCol(e), top = e.c - e.y, bot = e.f - e.y;
  for (const d of [-1, 1]) {
    const y0 = d < 0 ? top : R * .8, y1 = d < 0 ? -R * .8 : bot;
    const g = ctx.createLinearGradient(-R * .28, 0, R * .28, 0); g.addColorStop(0, '#20283a'); g.addColorStop(.4, '#56607a'); g.addColorStop(1, '#141a26');
    ctx.fillStyle = g; ctx.fillRect(-R * .28, y0, R * .56, y1 - y0);
    ctx.fillStyle = '#2c3548'; for (let yy = y0 + 20; yy < y1; yy += 46) ctx.fillRect(-R * .36, yy, R * .72, 8);
    if (!e.gone) { ctx.globalCompositeOperation = 'lighter'; const L = Math.abs(y1 - y0); for (let j = 0; j < 4; j++) { const t = ((S.t * .9 + j / 4) % 1), yy = d < 0 ? y0 + L * t : y1 - L * t; drawGlow(0, yy, R * .22, C, .8); } ctx.globalCompositeOperation = 'source-over'; }
  }
  if (e.gone) { ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, R * 1.2, '255,120,40', .35 + .2 * rnd()); ctx.globalCompositeOperation = 'source-over'; return; }
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(0, 0, R * 3, C, .35 + .15 * pulse);
  for (let k = 0; k < 3; k++) {
    const a = e.spin * (1 + k * .4) + k * 2.1, sq = Math.abs(Math.cos(a));
    ctx.strokeStyle = `rgba(${C},${.35 + .25 * sq})`; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(0, 0, R * (1.22 + k * .1), R * (1.22 + k * .1) * Math.max(.08, sq), k * 1.05 + e.spin * .2, 0, TAU); ctx.stroke();
  }
  ctx.globalCompositeOperation = 'source-over';
  const cg = ctx.createRadialGradient(-R * .25, -R * .25, 2, 0, 0, R);
  cg.addColorStop(0, '#ffffff'); cg.addColorStop(.25, '#fff4e0'); cg.addColorStop(.55, `rgb(${C})`); cg.addColorStop(1, '#0a1420');
  ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill();
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1.4;
  for (let i = 0; i < 3; i++) { const a = e.spin * 2 + i * 2.1; ctx.beginPath(); ctx.arc(0, 0, R * (.45 + i * .15), a, a + 1.6); ctx.stroke(); }
  drawGlow(0, 0, R * .55, WHITE, .9);
  if (rnd() < .5) { ctx.strokeStyle = `rgba(${C},.8)`; ctx.lineWidth = 1.3; const a = rand(0, TAU); zap(Math.cos(a) * R * .9, Math.sin(a) * R * .9, Math.cos(a) * R * 1.6, Math.sin(a) * R * 1.6, rand(0, 99), 8); }
  ctx.globalCompositeOperation = 'source-over';
  if (e.shp > 0 && !e.dying) {
    const fl = .5 + .5 * Math.sin(S.t * 3), hit = Math.max(0, e.shieldHit || 0) * 3, rr = e.sr, k = .45 + .55 * e.shp / e.smax;
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, rr, 0, TAU); ctx.globalCompositeOperation = 'lighter';
    const sg = ctx.createRadialGradient(0, 0, rr * .55, 0, 0, rr); sg.addColorStop(0, 'rgba(120,220,255,0)'); sg.addColorStop(1, `rgba(140,230,255,${(.2 + .1 * fl) * k + hit * .3})`);
    ctx.fillStyle = sg; ctx.fill(); ctx.strokeStyle = `rgba(160,240,255,${(.5 + .3 * fl) * k + hit})`; ctx.lineWidth = 2; ctx.stroke();
    ctx.clip(); ctx.strokeStyle = `rgba(150,235,255,${(.1 + .05 * fl) * k + hit * .3})`; ctx.lineWidth = 1;
    const hs = 13, hx = hs * 1.5, hy = hs * Math.sqrt(3);
    for (let ix = -Math.ceil(rr / hx) - 1; ix <= Math.ceil(rr / hx) + 1; ix++) for (let iy = -Math.ceil(rr / hy) - 1; iy <= Math.ceil(rr / hy) + 1; iy++) {
      const cx = ix * hx, cy = iy * hy + (ix % 2 ? hy / 2 : 0); ctx.beginPath(); for (let q = 0; q < 6; q++) { const a = q / 6 * TAU; ctx.lineTo(cx + Math.cos(a) * hs * .92, cy + Math.sin(a) * hs * .92); } ctx.closePath(); ctx.stroke();
    }
    ctx.restore();
  }
  for (const p of e.parts) if (!p.hidden || p.dead) drawModule(e, p, pulse);
}

