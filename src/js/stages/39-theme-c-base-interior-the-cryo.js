/* ---------- theme C base interior: the Cryo-Quantum Lab ---------- */
const BASE_NAMES_C = [I18('冷冻机库', 'Cryo Hangar'), I18('量子装配线', 'Quantum Assembly'), I18('晶格之门', 'Lattice Gate'), I18('液氮管网', 'Nitrogen Network'), I18('冷凝反应堆', 'Condenser Reactor'),
  I18('棱镜闸门', 'Prism Gate'), I18('零点导管', 'Zero-Point Conduit'), I18('核心冷井', 'Core Cold Well'), I18('奇点闸门', 'Singularity Gate'), I18('绝对零度', 'Absolute Zero')];
function makeCryoBg() {
  const c = document.createElement('canvas'); c.width = Math.max(1, W); c.height = Math.max(1, H); const g = c.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, '#03070e'); lg.addColorStop(.5, '#0a1a2a'); lg.addColorStop(1, '#03070e');
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  const rg = g.createRadialGradient(W * .6, H * .5, 10, W * .6, H * .5, Math.max(W, H) * .7); rg.addColorStop(0, 'rgba(120,200,255,.16)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  return c;
}
function drawCryoFar() {
  const par = .18, TW = 440, off = S.wx * par;
  for (let k = Math.floor(off / TW) - 1; k * TW - off < W + TW; k++) {
    const x0 = k * TW - off, h = i => bhash(k + 1301, i), cx = x0 + h(1) * TW * .7, cw = 46 + h(2) * 40;
    ctx.fillStyle = '#0c1826'; ctx.fillRect(cx, 0, cw, H);
    const g = ctx.createLinearGradient(cx, 0, cx + cw, 0); g.addColorStop(0, 'rgba(160,220,255,.05)'); g.addColorStop(.5, 'rgba(200,240,255,.14)'); g.addColorStop(1, 'rgba(160,220,255,.05)');
    ctx.fillStyle = g; ctx.fillRect(cx + 4, H * .18, cw - 8, H * .64);
    ctx.strokeStyle = 'rgba(180,230,255,.2)'; ctx.lineWidth = 1; ctx.strokeRect(cx + 4, H * .18, cw - 8, H * .64);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5; i++) { const q = (S.t * .15 + i / 5 + h(3)) % 1; drawGlow(cx + cw * (.3 + .4 * bhash(k, i + 5)), H * (.82 - q * .64), 2.5, '220,245,255', .6 * Math.sin(q * Math.PI)); }
    ctx.globalCompositeOperation = 'source-over';
    const lx = x0 + h(4) * TW, ly = H * (.25 + h(5) * .5), R = 40 + h(6) * 50;
    ctx.save(); ctx.translate(lx, ly); ctx.rotate(S.t * .1 * (h(7) > .5 ? 1 : -1)); ctx.strokeStyle = 'rgba(140,200,255,.16)'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU, b = (i + 2) / 6 * TAU; ctx.beginPath(); ctx.moveTo(Math.cos(a) * R, Math.sin(a) * R); ctx.lineTo(Math.cos(b) * R, Math.sin(b) * R); ctx.stroke(); }
    ctx.restore();
  }
}
function drawCryoMid() {
  const par = .45, TW = 520, off = S.wx * par;
  for (let k = Math.floor(off / TW) - 1; k * TW - off < W + TW; k++) {
    const x0 = k * TW - off, h = i => bhash(k + 2203, i);
    for (const [i, fy] of [[3, .3], [4, .68]]) {
      const y = H * (fy + (h(i) - .5) * .14), t = 10 + h(i + 5) * 8;
      const g = ctx.createLinearGradient(0, y - t, 0, y + t); g.addColorStop(0, '#4a6a84'); g.addColorStop(.4, '#22384c'); g.addColorStop(1, '#0c1824');
      ctx.fillStyle = g; ctx.fillRect(x0, y - t, TW, t * 2);
      ctx.fillStyle = 'rgba(235,248,255,.55)'; ctx.fillRect(x0, y - t - 2, TW, 3);
      for (let x = x0 + h(i + 2) * 80; x < x0 + TW; x += 80) { ctx.fillStyle = '#5a7a94'; ctx.fillRect(x, y - t - 4, 9, t * 2 + 8); ctx.fillStyle = 'rgba(240,250,255,.8)'; ctx.fillRect(x - 1, y - t - 6, 11, 3); }
      ctx.globalCompositeOperation = 'lighter';
      for (let j = 0; j < 3; j++) { const px = x0 + ((S.t * 110 + j * TW / 3 + h(i) * 300) % TW); drawGlow(px, y, 7, ICE, .6); }
      ctx.globalCompositeOperation = 'source-over';
    }
  }
}
function drawCryoShell() {
  const step = 8, n = Math.ceil(W / step) + 2, cs = [], fs = [];
  for (let i = 0; i <= n; i++) { const x = i * step - 8; cs.push(ceilAt(x)); fs.push(floorAt(x)); }
  for (const top of [true, false]) {
    const arr = top ? cs : fs, edgeY = top ? -10 : H + 10;
    ctx.beginPath(); ctx.moveTo(-8, edgeY); for (let i = 0; i <= n; i++) ctx.lineTo(i * step - 8, arr[i]); ctx.lineTo(n * step - 8, edgeY); ctx.closePath();
    const gr = top ? ctx.createLinearGradient(0, 0, 0, H * .32) : ctx.createLinearGradient(0, H, 0, H * .68);
    gr.addColorStop(0, '#060c14'); gr.addColorStop(.6, '#20344a'); gr.addColorStop(1, '#4e6a86');
    ctx.fillStyle = gr; ctx.fill();
    ctx.beginPath(); for (let i = 0; i <= n; i++) { const x = i * step - 8; i ? ctx.lineTo(x, arr[i]) : ctx.moveTo(x, arr[i]); }
    ctx.strokeStyle = '#eaf6ff'; ctx.lineWidth = 3; ctx.stroke();
    ctx.save(); ctx.translate(0, top ? -9 : 9); ctx.strokeStyle = 'rgba(120,190,240,.5)'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
  }
  for (const b of IW.blocks) {
    const x0 = b.start - S.wx, x1 = b.end - S.wx;
    if (x1 < -20 || x0 > W + 20) continue;
    const c = b.c * H, f = b.f * H, a = x0 + 30, z = x1 - 6;
    if (z - a > 20) {
      ctx.fillStyle = 'rgba(235,248,255,.85)'; ctx.beginPath();
      for (let x = a; x < z - 6; x += 14 + ((x * 7) % 10)) { const L = 6 + ((x * 13 + b.k) % 22) * (b.haz ? 1.3 : .8); ctx.moveTo(x - 3, c); ctx.lineTo(x, c + L); ctx.lineTo(x + 3, c); }
      ctx.fill();
      ctx.fillStyle = 'rgba(235,248,255,.8)'; ctx.beginPath(); ctx.moveTo(a, f + 1); for (let x = a; x <= z; x += 12) ctx.lineTo(x, f - 2 - Math.max(0, Math.sin((x - a) / (z - a) * Math.PI)) * (b.haz ? 9 : 5)); ctx.lineTo(z, f + 1); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(140,200,240,.18)'; ctx.lineWidth = 1; ctx.strokeRect(a + 8, c - 50, z - a - 16, 24); ctx.strokeRect(a + 8, f + 26, z - a - 16, 24);
    }
    if (b.lamp && z - a > 20) { const lx = (a + z) / 2; ctx.globalCompositeOperation = 'lighter'; drawGlow(lx, c + 2, 13, ICE, .6 + .2 * Math.sin(S.t * 2 + b.k)); drawGlow(lx, f - 2, 13, ICE, .6 + .2 * Math.sin(S.t * 2 + b.k)); ctx.globalCompositeOperation = 'source-over'; }
  }
}
function drawBasePropsC() {
  for (const p of IW.props) {
    if (p.dead || p.x < -80 || p.x > W + 80) continue;
    const s = p.att === 'c' ? 1 : -1, wall = p.att === 'c' ? p.c : p.f;
    if (p.k === 'crusher') {
      const head = wall + s * (p.reach + 12);
      ctx.fillStyle = '#1c2a3a'; ctx.fillRect(p.x - 36, s > 0 ? wall - 6 : wall - 12, 72, 18);
      ctx.fillStyle = metalGrad(-10, 10, '#e6f2fa', '#7a94ac', '#2a3a4c'); ctx.fillRect(p.x - 9, Math.min(wall, head), 18, Math.abs(head - wall));
      iceFacet([[p.x - 32, head - s * 12], [p.x + 32, head - s * 12], [p.x + 24, head + s * 14], [p.x - 24, head + s * 14]], '#ffffff', '#a8d8f4', '#3a6a90');
      ctx.fillStyle = 'rgba(235,248,255,.9)'; ctx.beginPath(); for (let i = -2; i <= 2; i++) { ctx.moveTo(p.x + i * 11 - 4, head + s * 14); ctx.lineTo(p.x + i * 11, head + s * 26); ctx.lineTo(p.x + i * 11 + 4, head + s * 14); } ctx.fill();
      ctx.globalCompositeOperation = 'lighter'; drawGlow(p.x, head, 10, p.warn ? WARN : ICE, p.warn ? (((S.t * 14) | 0) % 2 ? 1 : .3) : .45); ctx.globalCompositeOperation = 'source-over';
    } else if (p.k === 'vent') {
      ctx.fillStyle = '#1a2836'; ctx.fillRect(p.x - 18, s > 0 ? wall : wall - 8, 36, 8);
      ctx.fillStyle = '#9ac8e6'; for (let i = -2; i <= 2; i++) ctx.fillRect(p.x + i * 7 - 1.5, s > 0 ? wall + 1 : wall - 7, 3, 6);
      ctx.globalCompositeOperation = 'lighter';
      if (p.warn) for (let i = 0; i < 3; i++) drawGlow(p.x + rand(-8, 8), wall + s * rand(2, 12), rand(5, 9), '220,245,255', .6);
      if (p.on && p.len > 2) {
        const L = p.len, g = ctx.createLinearGradient(0, wall, 0, wall + s * L); g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(.4, 'rgba(170,230,255,.7)'); g.addColorStop(1, 'rgba(120,190,255,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(p.x - 12, wall); ctx.lineTo(p.x - 24 - 5 * Math.sin(S.t * 30), wall + s * L); ctx.lineTo(p.x + 24 + 5 * Math.cos(S.t * 27), wall + s * L); ctx.lineTo(p.x + 12, wall); ctx.closePath(); ctx.fill();
        for (let i = 0; i < 4; i++) drawGlow(p.x + rand(-8, 8), wall + s * L * (.15 + i * .22), 14 - i * 2, '220,245,255', .65);
      }
      ctx.globalCompositeOperation = 'source-over';
    } else {
      const tip1 = p.c + 24, tip2 = p.f - 24;
      for (const [y, d] of [[p.c, 1], [p.f, -1]]) { ctx.fillStyle = metalGrad(-14, 14, '#dfeaf4', '#6a8298', '#1e2a38'); ctx.fillRect(p.x - 12, d > 0 ? y : y - 20, 24, 20); ctx.save(); ctx.translate(p.x, y + d * 20); iceFacet([[0, -8], [8, 0], [0, 8], [-8, 0]], '#ffffff', '#c8a8ff', '#4a3a8a'); ctx.restore(); }
      ctx.globalCompositeOperation = 'lighter';
      if (p.warn) { drawGlow(p.x, tip1, 12, ICE2, .8); drawGlow(p.x, tip2, 12, ICE2, .8); }
      if (p.on) {
        ctx.strokeStyle = 'rgba(190,150,255,.35)'; ctx.lineWidth = 9; zap(p.x, tip1, p.x, tip2, p.t * 7, 14);
        ctx.strokeStyle = 'rgba(245,235,255,.95)'; ctx.lineWidth = 2; zap(p.x, tip1, p.x, tip2, p.t * 7 + 3, 14); zap(p.x, tip1, p.x, tip2, p.t * 9 + 11, 10);
        for (let y = tip1; y < tip2; y += 40) drawGlow(p.x + rand(-6, 6), y, 16, ICE2, .5);
      }
      if (p.hitT > 0) { drawGlow(p.x, tip1, 18, WHITE, p.hitT * 6); drawGlow(p.x, tip2, 18, WHITE, p.hitT * 6); }
      ctx.globalCompositeOperation = 'source-over';
      if (p.hp < p.maxhp) drawMiniBar(p.x, p.c + 34, 30, p.hp / p.maxhp, ICE2);
    }
  }
}
function cryoAmbient(dt) {
  if (Math.random() < dt * 5 && parts.length < 1200) { const x = rand(W * .05, W), y = ceilAt(x); parts.push({ k: 'ember', x, y: y + 4, vx: -S.scroll * .3 + rand(-15, 15), vy: rand(30, 70), life: rand(1.4, 2.4), max: 2.4, c: '235,248,255', r: rand(1, 2) }); }
  if (Math.random() < dt * 2 && parts.length < 1200) parts.push({ k: 'ember', x: rand(0, W), y: rand(H * .2, H * .8), vx: -S.scroll * .4, vy: rand(-8, 8), life: rand(1.5, 3), max: 3, c: pick(['200,240,255', '210,190,255']), r: rand(.8, 1.4) });
}
function drawBaseWorldC() {
  if (!IW.bg || IW.bgW !== W || IW.bgH !== H) { IW.bg = makeCryoBg(); IW.bgW = W; IW.bgH = H; }
  ctx.drawImage(IW.bg, 0, 0, W, H);
  drawCryoFar(); ctx.globalAlpha = .7; drawCryoMid(); ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(3,8,14,.22)'; ctx.fillRect(0, 0, W, H);
  const B = S.boss || ships.find(e => e.kind === 'core');
  if (B && B.kind === 'core') drawZeroChamber(B);
  drawCryoShell(); drawBasePropsC();
}

/* lattice gates (theme C) */
function drawGateC(e, pulse) {
  const w = e.hw, h = e.hh, C = e.phase === 3 ? WARN : ICE, op = e.open;
  ctx.fillStyle = '#16222e'; ctx.fillRect(-w * 1.1, -h - 6, w * 2.9, 34); ctx.fillRect(-w * 1.1, h - 28, w * 2.9, 34);
  ctx.fillStyle = 'rgba(235,248,255,.8)'; ctx.fillRect(-w * 1.1, -h + 26, w * 2.9, 3); ctx.fillRect(-w * 1.1, h - 30, w * 2.9, 3);
  ctx.save(); ctx.beginPath(); ctx.rect(-w * 2, -h + 2, w * 5, h * 2 - 4); ctx.clip();
  for (const d of [-1, 1]) {
    const y0 = d < 0 ? -h - op * h : op * h, hs = Math.max(14, w * .32);
    ctx.fillStyle = '#122030'; ctx.fillRect(-w * .5, y0, w * 1.5, h);
    for (let ix = 0; ix * hs * 1.5 < w * 1.6; ix++) for (let iy = -1; iy * hs * 1.7 < h + hs; iy++) {
      const cx = -w * .5 + ix * hs * 1.5 + hs * .6, cy = y0 + iy * hs * 1.7 + (ix % 2 ? hs * .85 : 0);
      ctx.save(); ctx.translate(cx, cy); iceFacet([[0, -hs * .82], [hs * .7, -hs * .4], [hs * .7, hs * .4], [0, hs * .82], [-hs * .7, hs * .4], [-hs * .7, -hs * .4]], (ix + iy) % 2 ? '#e8f6ff' : '#bfe0f6', '#6a9ec4', '#1c3450', 'rgba(150,220,255,.6)'); ctx.restore();
    }
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(${C},${.15 + .1 * Math.sin(S.t * 3)})`; ctx.fillRect(-w * .5, d < 0 ? y0 + h - 6 : y0, w * 1.5, 6); ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();
  if (op < .05 && !e.dying) {
    const R = e.rl, cx = -w * .5;
    ctx.fillStyle = '#0a121c'; ctx.beginPath(); ctx.arc(cx, 0, R * 1.3, 0, TAU); ctx.fill();
    ctx.save(); ctx.translate(cx, 0); ctx.rotate(S.t * (e.phase === 3 ? 2.2 : .9));
    for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); iceFacet([[0, 0], [R * .45, -R * .3], [R * .95, 0], [R * .45, R * .3]], '#ffffff', e.phase > 1 ? '#ffb0a0' : '#a8dcf8', '#2a4a70'); }
    ctx.restore();
    ctx.globalCompositeOperation = 'lighter'; drawGlow(cx, 0, R * 1.6, C, .35 * pulse + (e.phase > 1 ? .3 : 0)); drawGlow(cx, 0, R * .3, WHITE, 1); ctx.globalCompositeOperation = 'source-over';
    if (e.shield) {
      const fl = .5 + .5 * Math.sin(S.t * 3), hit = Math.max(0, e.shieldHit || 0) * 3, rr = R * 1.55;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.beginPath(); ctx.arc(cx, 0, rr, 0, TAU);
      const sg = ctx.createRadialGradient(cx, 0, rr * .5, cx, 0, rr); sg.addColorStop(0, 'rgba(160,230,255,0)'); sg.addColorStop(1, `rgba(180,235,255,${.22 + .1 * fl + hit * .3})`);
      ctx.fillStyle = sg; ctx.fill(); ctx.strokeStyle = `rgba(220,245,255,${.5 + .3 * fl + hit})`; ctx.lineWidth = 1.6; ctx.stroke(); ctx.restore();
    }
  } else if (op < .6) { ctx.globalCompositeOperation = 'lighter'; drawGlow(-w * .5, 0, e.rl * 2, ICE, .6 * (1 - op)); ctx.globalCompositeOperation = 'source-over'; }
  for (const p of e.parts) if (!p.hidden || p.dead) if (!e.dying || op < .3) drawModule(e, p, pulse);
}

/* Absolute Zero (theme C core boss): a rotating crystal in a frost lattice */
function drawZeroChamber(e) {
  const x = e.x, y = e.y, R = e.r;
  ctx.save(); ctx.globalAlpha = .85; ctx.translate(x, y);
  for (let k = 0; k < 2; k++) { ctx.save(); ctx.rotate(S.t * (k ? -.06 : .04)); ctx.strokeStyle = k ? 'rgba(120,180,230,.25)' : 'rgba(160,220,255,.3)'; ctx.lineWidth = 2; const RR = R * (2.6 + k * .6); ctx.beginPath(); for (let i = 0; i <= 6; i++) { const a = i / 6 * TAU; ctx.lineTo(Math.cos(a) * RR, Math.sin(a) * RR); } ctx.stroke(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; ctx.beginPath(); ctx.moveTo(Math.cos(a) * RR, Math.sin(a) * RR); ctx.lineTo(Math.cos(a) * RR * .55, Math.sin(a) * RR * .55); ctx.stroke(); } ctx.restore(); }
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + S.t * .1; drawGlow(Math.cos(a) * R * 2.6, Math.sin(a) * R * 2.6, 4, coreCol(e) === '120,220,255' ? ICE : coreCol(e), .5 + .5 * Math.sin(S.t * 4 + i)); }
  ctx.restore(); ctx.globalCompositeOperation = 'source-over';
}
function drawZero(e, pulse) {
  const R = e.r, C = e.phase === 3 ? '255,90,120' : e.phase === 2 ? ICE2 : ICE, top = e.c - e.y, bot = e.f - e.y;
  for (const d of [-1, 1]) {
    const y0 = d < 0 ? top : R * .8, y1 = d < 0 ? -R * .8 : bot;
    const g = ctx.createLinearGradient(-R * .26, 0, R * .26, 0); g.addColorStop(0, '#1a2a3c'); g.addColorStop(.45, '#8ab0cc'); g.addColorStop(1, '#14202e');
    ctx.fillStyle = g; ctx.fillRect(-R * .26, y0, R * .52, y1 - y0);
    ctx.fillStyle = 'rgba(235,248,255,.8)'; for (let yy = y0 + 18; yy < y1; yy += 42) ctx.fillRect(-R * .34, yy, R * .68, 5);
    if (!e.gone) { ctx.globalCompositeOperation = 'lighter'; const L = Math.abs(y1 - y0); for (let j = 0; j < 4; j++) { const t = ((S.t * .9 + j / 4) % 1), yy = d < 0 ? y0 + L * t : y1 - L * t; drawGlow(0, yy, R * .2, C, .8); } ctx.globalCompositeOperation = 'source-over'; }
  }
  if (e.gone) { ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, R * 1.2, ICE, .35 + .2 * Math.random()); ctx.globalCompositeOperation = 'source-over'; return; }
  ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, R * 3, C, .3 + .15 * pulse);
  for (let k = 0; k < 6; k++) { ctx.save(); ctx.rotate(k / 6 * TAU + e.spin * .3); ctx.strokeStyle = `rgba(${C},.35)`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(R * 1.1, 0); ctx.lineTo(R * 1.6, 0); ctx.moveTo(R * 1.35, 0); ctx.lineTo(R * 1.5, -R * .12); ctx.moveTo(R * 1.35, 0); ctx.lineTo(R * 1.5, R * .12); ctx.stroke(); ctx.restore(); }
  ctx.globalCompositeOperation = 'source-over';
  const n = 8, sp = e.spin;
  const V = []; for (let i = 0; i < n; i++) { const a = i / n * TAU + sp * .5; V.push([Math.cos(a) * R, Math.sin(a) * R * .92]); }
  for (let i = 0; i < n; i++) { const a = V[i], b = V[(i + 1) % n], lit = (Math.cos(i / n * TAU + sp * .5 - .8) + 1) / 2; iceFacet([[Math.cos(sp) * R * .15, Math.sin(sp * .7) * R * .15], a, b], lit > .6 ? '#ffffff' : '#c8e8fa', `rgba(${Math.round(90 + 120 * lit)},${Math.round(170 + 70 * lit)},255,1)`, '#1a3a60', 'rgba(240,250,255,.7)'); }
  ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, R * .6, C, .8); drawGlow(0, 0, R * .22, WHITE, 1);
  if (Math.random() < .5) { ctx.strokeStyle = `rgba(${C},.8)`; ctx.lineWidth = 1.3; const a = rand(0, TAU); zap(Math.cos(a) * R * .9, Math.sin(a) * R * .9, Math.cos(a) * R * 1.6, Math.sin(a) * R * 1.6, rand(0, 99), 8); }
  ctx.globalCompositeOperation = 'source-over';
  if (e.shp > 0 && !e.dying) {
    const fl = .5 + .5 * Math.sin(S.t * 3), hit = Math.max(0, e.shieldHit || 0) * 3, rr = e.sr, k = .45 + .55 * e.shp / e.smax;
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, rr, 0, TAU); ctx.globalCompositeOperation = 'lighter';
    const sg = ctx.createRadialGradient(0, 0, rr * .55, 0, 0, rr); sg.addColorStop(0, 'rgba(200,240,255,0)'); sg.addColorStop(1, `rgba(210,245,255,${(.22 + .1 * fl) * k + hit * .3})`);
    ctx.fillStyle = sg; ctx.fill(); ctx.strokeStyle = `rgba(235,250,255,${(.55 + .3 * fl) * k + hit})`; ctx.lineWidth = 2; ctx.stroke();
    ctx.clip(); ctx.strokeStyle = `rgba(220,245,255,${(.14 + .06 * fl) * k + hit * .3})`; ctx.lineWidth = 1.2;
    const cracks = Math.floor((1 - e.shp / e.smax) * 14); for (let i = 0; i < 8 + cracks; i++) { const a = bhash(i, 21) * TAU; ctx.beginPath(); ctx.moveTo(Math.cos(a) * rr * .5, Math.sin(a) * rr * .5); ctx.lineTo(Math.cos(a + .2) * rr, Math.sin(a + .2) * rr); ctx.stroke(); }
    ctx.restore();
  }
  for (const p of e.parts) if (!p.hidden || p.dead) drawModule(e, p, pulse);
}

