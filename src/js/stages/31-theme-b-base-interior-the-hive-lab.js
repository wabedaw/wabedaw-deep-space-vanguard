/* ---------- theme B base interior: the Hive Lab (bio-organic facility) ---------- */
const BASE_NAMES_B = [I18('污染气闸', 'Contaminated Airlock'), I18('培养舱区', 'Incubation Bay'), I18('孢膜之门', 'Spore Membrane'), I18('酸液管网', 'Acid Network'), I18('孵化走廊', 'Hatchery Corridor'),
  I18('血肉闸门', 'Flesh Gate'), I18('神经通道', 'Neural Passage'), I18('巢心外壁', 'Hive Heart Wall'), I18('神经闸门', 'Neural Gate'), I18('母巢意识', 'The Hive Mind')];
const ACID = '140,255,90';
function makeHiveBg() {
  const c = document.createElement('canvas'); c.width = Math.max(1, W); c.height = Math.max(1, H); const g = c.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, '#06030a'); lg.addColorStop(.5, '#170a1e'); lg.addColorStop(1, '#06030a');
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
  const rg = g.createRadialGradient(W * .55, H * .5, 10, W * .55, H * .5, Math.max(W, H) * .7); rg.addColorStop(0, 'rgba(90,180,90,.14)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  return c;
}
function drawHiveFar() {
  const par = .18, TW = 460, off = S.wx * par;
  for (let k = Math.floor(off / TW) - 1; k * TW - off < W + TW; k++) {
    const x0 = k * TW - off, h = i => bhash(k + 71, i);
    ctx.strokeStyle = '#1c1022'; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(x0 + h(1) * TW, 0); ctx.quadraticCurveTo(x0 + h(1) * TW + 90, H * .5, x0 + h(1) * TW, H); ctx.stroke();
    const tx = x0 + h(2) * TW * .8 + 20, tw = 60 + h(3) * 50, ty = H * .16, th = H * .68;
    ctx.fillStyle = '#120a16'; ctx.fillRect(tx - 6, ty - 14, tw + 12, 16); ctx.fillRect(tx - 6, ty + th - 2, tw + 12, 16);
    const lg = ctx.createLinearGradient(tx, 0, tx + tw, 0); lg.addColorStop(0, 'rgba(40,90,50,.35)'); lg.addColorStop(.5, 'rgba(90,200,110,.22)'); lg.addColorStop(1, 'rgba(30,70,40,.35)');
    ctx.fillStyle = lg; ctx.fillRect(tx, ty, tw, th);
    ctx.fillStyle = 'rgba(10,20,12,.75)'; const cy = ty + th * (.45 + .03 * Math.sin(S.t + k));
    ctx.beginPath(); ctx.ellipse(tx + tw / 2, cy, tw * .22, th * .14, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(10,20,12,.75)'; ctx.lineWidth = 3; ctx.beginPath(); for (const s of [-1, 1]) { ctx.moveTo(tx + tw / 2 + s * tw * .15, cy + th * .08); ctx.quadraticCurveTo(tx + tw / 2 + s * tw * .3, cy + th * .2, tx + tw / 2 + s * tw * .2, cy + th * .3); } ctx.stroke();
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(tx + tw / 2, cy, tw * .6, '120,255,140', .15 + .08 * Math.sin(S.t * 1.5 + k));
    for (let i = 0; i < 4; i++) { const q = (S.t * .25 + i / 4 + h(4)) % 1; drawGlow(tx + tw * (.3 + .4 * bhash(k, i + 9)), ty + th * (1 - q), 3, '200,255,210', .5 * (1 - q)); }
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = 'rgba(160,230,180,.18)'; ctx.lineWidth = 1.5; ctx.strokeRect(tx, ty, tw, th);
  }
}
function drawHiveMid() {
  const par = .45, TW = 520, off = S.wx * par;
  for (let k = Math.floor(off / TW) - 1; k * TW - off < W + TW; k++) {
    const x0 = k * TW - off, h = i => bhash(k + 517, i);
    for (const [i, fy] of [[1, .32], [2, .68]]) {
      const y = H * (fy + (h(i) - .5) * .14), t = 9 + h(i + 3) * 8, a = 18 + h(i + 5) * 24;
      ctx.strokeStyle = '#3a1630'; ctx.lineWidth = t * 2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x0, y); ctx.bezierCurveTo(x0 + TW * .3, y - a, x0 + TW * .6, y + a, x0 + TW, y); ctx.stroke();
      ctx.strokeStyle = 'rgba(200,90,150,.25)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.globalCompositeOperation = 'lighter';
      for (let j = 0; j < 3; j++) { const q = ((S.t * .35 + j / 3 + h(i)) % 1), bx = x0 + TW * q, by = y + (-a * 3 * q * (1 - q) * (1 - 2 * q)) * 1.5; drawGlow(bx, by, 7, HIVE, .6); }
      ctx.globalCompositeOperation = 'source-over'; ctx.lineCap = 'butt';
    }
  }
}
function drawHiveShell() {
  const step = 8, n = Math.ceil(W / step) + 2, cs = [], fs = [];
  for (let i = 0; i <= n; i++) { const x = i * step - 8; cs.push(ceilAt(x)); fs.push(floorAt(x)); }
  for (const top of [true, false]) {
    const arr = top ? cs : fs, edgeY = top ? -10 : H + 10;
    ctx.beginPath(); ctx.moveTo(-8, edgeY); for (let i = 0; i <= n; i++) ctx.lineTo(i * step - 8, arr[i] + Math.sin((i * step + S.wx) * .05 + S.t * 1.5) * 1.5); ctx.lineTo(n * step - 8, edgeY); ctx.closePath();
    const gr = top ? ctx.createLinearGradient(0, 0, 0, H * .32) : ctx.createLinearGradient(0, H, 0, H * .68);
    gr.addColorStop(0, '#08030a'); gr.addColorStop(.6, '#2a1028'); gr.addColorStop(1, '#4e1e40');
    ctx.fillStyle = gr; ctx.fill();
    ctx.beginPath(); for (let i = 0; i <= n; i++) { const x = i * step - 8, y = arr[i] + Math.sin((x + S.wx) * .05 + S.t * 1.5) * 1.5; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.strokeStyle = '#c86a9a'; ctx.lineWidth = 2; ctx.stroke();
    ctx.save(); ctx.translate(0, top ? -8 : 8); ctx.globalCompositeOperation = 'lighter'; ctx.setLineDash([10, 18]); ctx.lineDashOffset = -S.t * 30; ctx.strokeStyle = `rgba(${HIVE},.35)`; ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    ctx.globalCompositeOperation = 'source-over';
  }
  for (const b of IW.blocks) {
    const x0 = b.start - S.wx, x1 = b.end - S.wx;
    if (x1 < -20 || x0 > W + 20) continue;
    const c = b.c * H, f = b.f * H, a = x0 + 40, z = x1 - 6;
    if (b.haz && z - a > 30) {
      ctx.fillStyle = '#d8ccb0';
      ctx.beginPath(); for (let x = a; x < z - 10; x += 16) { ctx.moveTo(x, c); ctx.lineTo(x + 5, c + 12 + (x * 7 % 6)); ctx.lineTo(x + 10, c); ctx.moveTo(x, f); ctx.lineTo(x + 5, f - 12 - (x * 7 % 6)); ctx.lineTo(x + 10, f); } ctx.fill();
    }
    if (z - a > 30) { ctx.strokeStyle = 'rgba(120,40,90,.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(a, c - 30); ctx.bezierCurveTo(a + (z - a) * .3, c - 60, a + (z - a) * .6, c - 10, z, c - 40); ctx.moveTo(a, f + 30); ctx.bezierCurveTo(a + (z - a) * .3, f + 60, a + (z - a) * .6, f + 10, z, f + 40); ctx.stroke(); }
    if (b.lamp && z - a > 20) {
      const lx = (a + z) / 2, pl = .5 + .5 * Math.sin(S.t * 2 + b.k);
      ctx.fillStyle = '#5a2448'; ctx.beginPath(); ctx.ellipse(lx, c - 2, 9, 6, 0, 0, TAU); ctx.ellipse(lx, f + 2, 9, 6, 0, 0, TAU); ctx.fill();
      ctx.globalCompositeOperation = 'lighter'; drawGlow(lx, c + 1, 14, HIVE, .4 + .4 * pl); drawGlow(lx, f - 1, 14, HIVE, .4 + .4 * pl); ctx.globalCompositeOperation = 'source-over';
    }
  }
}
function drawBasePropsB() {
  for (const p of IW.props) {
    if (p.dead || p.x < -80 || p.x > W + 80) continue;
    const s = p.att === 'c' ? 1 : -1, wall = p.att === 'c' ? p.c : p.f;
    if (p.k === 'crusher') {
      const head = wall + s * (p.reach + 12);
      ctx.fillStyle = '#4e1e40'; ctx.beginPath(); ctx.ellipse(p.x, wall, 40, 14, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#7a3060'; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(p.x, wall); ctx.lineTo(p.x, head); ctx.stroke();
      ctx.strokeStyle = 'rgba(200,90,150,.4)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(p.x - 4, wall); ctx.lineTo(p.x - 4, head); ctx.stroke();
      ctx.fillStyle = '#e2d6bc'; ctx.beginPath(); ctx.ellipse(p.x, head, 30, 12, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); for (let i = -2; i <= 2; i++) { ctx.moveTo(p.x + i * 11 - 5, head + s * 8); ctx.lineTo(p.x + i * 11, head + s * 24); ctx.lineTo(p.x + i * 11 + 5, head + s * 8); } ctx.fill();
      ctx.globalCompositeOperation = 'lighter'; drawGlow(p.x, head - s * 2, 8, p.warn ? WARN : '255,120,160', p.warn ? (((S.t * 14) | 0) % 2 ? 1 : .3) : .4); ctx.globalCompositeOperation = 'source-over';
    } else if (p.k === 'vent') {
      ctx.fillStyle = '#5a2448'; ctx.beginPath(); ctx.ellipse(p.x, wall, 20, 8, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#12060e'; ctx.beginPath(); ctx.ellipse(p.x, wall, 9, 4, 0, 0, TAU); ctx.fill();
      ctx.globalCompositeOperation = 'lighter';
      if (p.warn) for (let i = 0; i < 3; i++) drawGlow(p.x + rand(-8, 8), wall + s * rand(2, 10), rand(4, 8), ACID, .7);
      if (p.on && p.len > 2) {
        const L = p.len, g = ctx.createLinearGradient(0, wall, 0, wall + s * L); g.addColorStop(0, 'rgba(230,255,200,.95)'); g.addColorStop(.35, `rgba(${ACID},.75)`); g.addColorStop(1, 'rgba(60,200,40,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(p.x - 10, wall); ctx.lineTo(p.x - 18 - 4 * Math.sin(S.t * 30), wall + s * L); ctx.lineTo(p.x + 18 + 4 * Math.cos(S.t * 27), wall + s * L); ctx.lineTo(p.x + 10, wall); ctx.closePath(); ctx.fill();
        for (let i = 0; i < 4; i++) drawGlow(p.x + rand(-6, 6), wall + s * L * (.15 + i * .22), 14 - i * 2, ACID, .7);
      }
      ctx.globalCompositeOperation = 'source-over';
    } else {
      const tip1 = p.c + 24, tip2 = p.f - 24;
      for (const [y, d] of [[p.c, 1], [p.f, -1]]) {
        ctx.fillStyle = '#4e1e40'; ctx.beginPath(); ctx.ellipse(p.x, y + d * 6, 16, 10, 0, 0, TAU); ctx.fill();
        const g = ctx.createRadialGradient(p.x - 3, y + d * 18 - 3, 1, p.x, y + d * 18, 10); g.addColorStop(0, '#e0a0ff'); g.addColorStop(1, '#5a2080');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, y + d * 18, 9, 0, TAU); ctx.fill();
      }
      ctx.globalCompositeOperation = 'lighter';
      if (p.warn) { drawGlow(p.x, tip1, 12, HIVE2, .8); drawGlow(p.x, tip2, 12, HIVE2, .8); }
      if (p.on) {
        ctx.strokeStyle = 'rgba(200,120,255,.35)'; ctx.lineWidth = 9; zap(p.x, tip1, p.x, tip2, p.t * 7, 14);
        ctx.strokeStyle = 'rgba(245,225,255,.95)'; ctx.lineWidth = 2; zap(p.x, tip1, p.x, tip2, p.t * 7 + 3, 14); zap(p.x, tip1, p.x, tip2, p.t * 9 + 11, 10);
        for (let y = tip1; y < tip2; y += 40) drawGlow(p.x + rand(-6, 6), y, 16, HIVE2, .5);
      }
      if (p.hitT > 0) { drawGlow(p.x, tip1, 18, WHITE, p.hitT * 6); drawGlow(p.x, tip2, 18, WHITE, p.hitT * 6); }
      ctx.globalCompositeOperation = 'source-over';
      if (p.hp < p.maxhp) drawMiniBar(p.x, p.c + 34, 30, p.hp / p.maxhp, HIVE2);
    }
  }
}
function hiveAmbient(dt) {
  if (rnd() < dt * 2 && parts.length < 1200) { const x = rand(W * .1, W), y = ceilAt(x); parts.push({ k: 'ember', x, y: y + 4, vx: -S.scroll * .2, vy: rand(60, 120), life: rand(.8, 1.4), max: 1.4, c: ACID, r: rand(1.2, 2.2) }); }
  if (rnd() < dt * 3 && parts.length < 1200) parts.push({ k: 'ember', x: rand(0, W), y: rand(H * .2, H * .8), vx: -S.scroll * .3 + rand(-8, 8), vy: rand(-12, 12), life: rand(2, 4), max: 4, c: pick(['200,255,200', '220,170,255']), r: rand(.8, 1.6) });
}
function drawBaseWorldB() {
  if (!IW.bg || IW.bgW !== W || IW.bgH !== H) { IW.bg = makeHiveBg(); IW.bgW = W; IW.bgH = H; }
  ctx.drawImage(IW.bg, 0, 0, W, H);
  drawHiveFar(); ctx.globalAlpha = .7; drawHiveMid(); ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(8,3,10,.25)'; ctx.fillRect(0, 0, W, H);
  const B = S.boss || ships.find(e => e.kind === 'core');
  if (B && B.kind === 'core') (B.theme === 2 ? drawHiveChamber : drawCoreChamber)(B);
  drawHiveShell(); drawBasePropsB();
}

/* bio-lab unit art (skin 3) */
function drawUnitHive(e, w, h, pulse) {
  const s = e.att === 'c' ? -1 : 1;
  if (e.type === 'fighter' || e.type === 'ace') {
    ctx.rotate(clamp(-(e.vy || 0) / 600, -.4, .4));
    const big = e.type === 'ace', fl = Math.sin(e.t * 30);
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(200,255,200,${.18 + .1 * fl})`;
    ctx.beginPath(); ctx.ellipse(w * .1, -h * (1 + fl * .3), w * .5, h * .6, -.3, 0, TAU); ctx.ellipse(w * .1, h * (1 + fl * .3), w * .5, h * .6, .3, 0, TAU); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    const g = ctx.createLinearGradient(0, -h, 0, h); g.addColorStop(0, big ? '#6a3a78' : '#4a5a38'); g.addColorStop(1, '#140a14');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, w, h * .7, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = `rgba(${HIVE},.6)`; ctx.lineWidth = 1; ctx.beginPath(); for (const x of [-.3, 0, .3]) { ctx.moveTo(x * w, -h * .6); ctx.lineTo(x * w, h * .6); } ctx.stroke();
    if (big) { ctx.strokeStyle = '#d8ccb0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-w, -2); ctx.lineTo(-w * 1.3, -h * .5); ctx.moveTo(-w, 2); ctx.lineTo(-w * 1.3, h * .5); ctx.stroke(); }
    ctx.globalCompositeOperation = 'lighter'; drawGlow(-w * .7, 0, 3, big ? '255,90,120' : HIVE, 1); drawGlow(w * .9, 0, h * .9, HIVE, .6);
    return;
  }
  if (e.type === 'tur') {
    ctx.fillStyle = '#4e1e40'; ctx.beginPath(); ctx.ellipse(0, s * h * .7, w * 1.05, h * .45, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#6a2a54'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, s * h * .6); ctx.lineTo(0, -s * h * .1); ctx.stroke();
    ctx.save(); ctx.translate(0, -s * h * .25); ctx.rotate(e.aim);
    const g = ctx.createRadialGradient(-3, -3, 1, 0, 0, w * .6); g.addColorStop(0, '#8a4a7a'); g.addColorStop(1, '#2a1028');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, w * .62, w * .48, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#0c040a'; ctx.beginPath(); ctx.ellipse(w * .45, 0, w * .16, w * .22, 0, 0, TAU); ctx.fill();
    ctx.globalCompositeOperation = 'lighter'; drawGlow(w * .5, 0, w * .35, ACID, .5 + .4 * pulse); ctx.restore();
  } else if (e.type === 'pod') {
    const ready = e.fireT < .7;
    ctx.fillStyle = '#4e1e40'; ctx.beginPath(); ctx.ellipse(0, s * h * .6, w, h * .5, 0, 0, TAU); ctx.fill();
    const g = ctx.createRadialGradient(-w * .2, -s * h * .2, 1, 0, 0, w); g.addColorStop(0, '#7a5a2a'); g.addColorStop(1, '#2a1a0a');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, -s * h * .05, w * .9, h * .85, 0, 0, TAU); ctx.fill();
    ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) drawGlow(-w * .5 + i * w * .5, -s * h * .25, ready ? 7 : 4, ACID, ready ? .9 : .4);
  } else if (e.type === 'emit') {
    const ch = beams.some(b => b.owner === e);
    ctx.strokeStyle = '#6a2a54'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, s * h); ctx.quadraticCurveTo(w * .3, s * h * .3, 0, 0); ctx.stroke();
    ctx.fillStyle = '#efe6d4'; ctx.beginPath(); ctx.arc(0, 0, w * .55, 0, TAU); ctx.fill();
    ctx.fillStyle = ch ? '#ff4a6a' : '#3a8a4a'; ctx.beginPath(); ctx.arc(Math.cos(e.aim) * w * .25, Math.sin(e.aim) * w * .25, w * .28, 0, TAU); ctx.fill();
    ctx.fillStyle = '#060206'; ctx.beginPath(); ctx.arc(Math.cos(e.aim) * w * .32, Math.sin(e.aim) * w * .32, w * .12, 0, TAU); ctx.fill();
    ctx.globalCompositeOperation = 'lighter'; drawGlow(Math.cos(e.aim) * w * .4, Math.sin(e.aim) * w * .4, ch ? 16 : 6, ch ? '255,90,120' : HIVE, ch ? 1 : .5);
  } else {
    const o = clamp(e.open || 0, 0, 1);
    ctx.fillStyle = '#4e1e40'; ctx.beginPath(); ctx.ellipse(0, s * h * .3, w * 1.1, h * .7, 0, 0, TAU); ctx.fill();
    for (let i = 0; i < 4; i++) {
      const ex = (i - 1.5) * w * .48, g = ctx.createRadialGradient(ex - 2, -s * 2, 1, ex, 0, h * .9); g.addColorStop(0, '#f2e8c8'); g.addColorStop(1, '#8a7a50');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(ex, -s * h * .1, w * .22, h * (.85 + o * .2), 0, 0, TAU); ctx.fill();
    }
    ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 4; i++) drawGlow((i - 1.5) * w * .48, -s * h * .1, 6, ACID, .3 + o * .7);
  }
}

/* membrane gates (theme B) */
function drawGateB(e, pulse) {
  const w = e.hw, h = e.hh, C = e.phase === 3 ? WARN : HIVE, op = e.open;
  ctx.fillStyle = '#2a1028'; ctx.beginPath(); ctx.ellipse(w * .3, -h, w * 1.6, 26, 0, 0, Math.PI); ctx.fill(); ctx.beginPath(); ctx.ellipse(w * .3, h, w * 1.6, 26, 0, Math.PI, TAU); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.rect(-w * 2, -h + 2, w * 5, h * 2 - 4); ctx.clip();
  for (const d of [-1, 1]) {
    const y0 = d < 0 ? -h - op * h : op * h;
    const g = ctx.createLinearGradient(-w * .5, 0, w, 0); g.addColorStop(0, '#7a3060'); g.addColorStop(.4, '#4e1e40'); g.addColorStop(1, '#1a0814');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-w * .5, y0); for (let y = y0; y <= y0 + h; y += 18) ctx.lineTo(-w * .5 - 6 * Math.sin(y * .08 + S.t * 2), y); ctx.lineTo(w, y0 + h); ctx.lineTo(w, y0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(30,8,24,.6)'; ctx.lineWidth = 3; ctx.beginPath(); for (let y = y0 + 30; y < y0 + h - 10; y += 40) { ctx.moveTo(-w * .5, y); ctx.quadraticCurveTo(w * .2, y + 14, w, y); } ctx.stroke();
    ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(${HIVE},.35)`; ctx.lineWidth = 2;
    ctx.beginPath(); for (let k = 0; k < 3; k++) { const yy = y0 + h * (.2 + k * .3); ctx.moveTo(-w * .4, yy); ctx.bezierCurveTo(-w * .1, yy - 20, w * .2, yy + 20, w * .6, yy - 6); } ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#e2d6bc'; ctx.beginPath(); const sy = d < 0 ? y0 + h : y0; for (let x = -w * .5; x < w; x += 12) { ctx.moveTo(x, sy); ctx.lineTo(x + 6, sy - d * 12); ctx.lineTo(x + 12, sy); } ctx.fill();
  }
  ctx.restore();
  if (op < .05 && !e.dying) {
    const R = e.rl, cx = -w * .5, beat = 1 + .06 * Math.sin(S.t * (e.phase === 3 ? 9 : 5));
    ctx.fillStyle = '#12060e'; ctx.beginPath(); ctx.arc(cx, 0, R * 1.3, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#7a3060'; ctx.lineWidth = R * .3; ctx.beginPath(); ctx.arc(cx, 0, R * 1.12, 0, TAU); ctx.stroke();
    ctx.save(); ctx.translate(cx, 0); ctx.scale(beat, beat);
    const cg = ctx.createRadialGradient(-R * .2, -R * .25, 2, 0, 0, R * .9); cg.addColorStop(0, '#ffd6e8'); cg.addColorStop(.4, e.phase === 3 ? `rgb(${WARN})` : '#e0406a'); cg.addColorStop(1, '#3a0614');
    ctx.fillStyle = cg; ctx.beginPath(); ctx.ellipse(0, 0, R * .85, R * .75, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(80,0,20,.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-R * .5, -R * .3); ctx.quadraticCurveTo(0, R * .1, R * .4, -R * .4); ctx.moveTo(-R * .3, R * .4); ctx.quadraticCurveTo(R * .1, 0, R * .5, R * .3); ctx.stroke();
    ctx.restore();
    ctx.globalCompositeOperation = 'lighter'; drawGlow(cx, 0, R * 1.6, '255,90,130', .35 * pulse + (e.phase > 1 ? .3 : 0)); ctx.globalCompositeOperation = 'source-over';
    if (e.shield) {
      const fl = .5 + .5 * Math.sin(S.t * 3), hit = Math.max(0, e.shieldHit || 0) * 3, rr = R * 1.55;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.beginPath(); ctx.arc(cx, 0, rr, 0, TAU);
      const sg = ctx.createRadialGradient(cx, 0, rr * .5, cx, 0, rr); sg.addColorStop(0, 'rgba(140,255,120,0)'); sg.addColorStop(1, `rgba(150,255,130,${.22 + .1 * fl + hit * .3})`);
      ctx.fillStyle = sg; ctx.fill(); ctx.strokeStyle = `rgba(180,255,160,${.5 + .3 * fl + hit})`; ctx.lineWidth = 1.6; ctx.stroke(); ctx.restore();
    }
  } else if (op < .6) { ctx.globalCompositeOperation = 'lighter'; drawGlow(-w * .5, 0, e.rl * 2, '255,90,130', .6 * (1 - op)); ctx.globalCompositeOperation = 'source-over'; }
  for (const p of e.parts) if (!p.hidden || p.dead) if (!e.dying || op < .3) drawModule(e, p, pulse);
}

/* the Hive Mind (theme B energy-core boss) */
function drawHiveChamber(e) {
  const x = e.x, y = e.y, R = e.r;
  ctx.save(); ctx.globalAlpha = .9;
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + S.t * .05; ctx.strokeStyle = '#24101e'; ctx.lineWidth = R * .22; ctx.beginPath(); ctx.arc(x, y, R * 3, a, a + .32); ctx.stroke(); }
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + S.t * .12; drawGlow(x + Math.cos(a) * R * 2.6, y + Math.sin(a) * R * 2.6, 5, HIVE, .4 + .4 * Math.sin(S.t * 3 + i)); }
  ctx.restore(); ctx.globalCompositeOperation = 'source-over';
}
function drawHiveMind(e, pulse) {
  const R = e.r, top = e.c - e.y, bot = e.f - e.y, C = e.phase === 3 ? '255,80,80' : e.phase === 2 ? '255,140,200' : HIVE;
  ctx.lineCap = 'round';
  for (const d of [-1, 1]) for (let k = -1; k <= 1; k++) {
    const y0 = d < 0 ? top : bot, x0 = k * R * .5;
    ctx.strokeStyle = '#4e1e40'; ctx.lineWidth = R * (.22 - Math.abs(k) * .06);
    ctx.beginPath(); ctx.moveTo(x0 * 1.6, y0); ctx.bezierCurveTo(x0 * 2 + Math.sin(S.t + k) * R * .2, (y0 + d * R) / 2, x0, d * R * 1.4, x0 * .5, d * R * .7); ctx.stroke();
    if (!e.gone) { ctx.globalCompositeOperation = 'lighter'; const q = (S.t * .8 + k * .3 + (d > 0 ? .5 : 0)) % 1; drawGlow(x0 * 1.6 + (x0 * .5 - x0 * 1.6) * q, y0 + (d * R * .7 - y0) * q, R * .12, C, .8); ctx.globalCompositeOperation = 'source-over'; }
  }
  ctx.lineCap = 'butt';
  if (e.gone) { ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, R * 1.2, '255,120,150', .35 + .2 * rnd()); ctx.globalCompositeOperation = 'source-over'; return; }
  ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, R * 3, C, .3 + .15 * pulse); ctx.globalCompositeOperation = 'source-over';
  const beat = 1 + .04 * Math.sin(S.t * (e.phase === 3 ? 8 : 3));
  ctx.save(); ctx.scale(beat, beat);
  const g = ctx.createRadialGradient(-R * .3, -R * .35, R * .1, 0, 0, R * 1.1); g.addColorStop(0, '#ffd2ea'); g.addColorStop(.45, '#c0608e'); g.addColorStop(1, '#3a0e2a');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, R * 1.05, R * .88, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(80,10,50,.55)'; ctx.lineWidth = R * .05;
  for (let i = 0; i < 9; i++) { const yy = -R * .7 + i * R * .175, ww = R * Math.sqrt(Math.max(0, 1 - (yy / (R * .88)) ** 2)) * .95; ctx.beginPath(); ctx.moveTo(-ww, yy); for (let x = -ww; x <= ww; x += R * .12) ctx.lineTo(x, yy + Math.sin(x * .12 + i * 1.7) * R * .06); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(60,0,40,.7)'; ctx.lineWidth = R * .04; ctx.beginPath(); ctx.moveTo(0, -R * .85); ctx.lineTo(0, R * .85); ctx.stroke();
  ctx.restore();
  const eo = e.phase > 1 ? 1 : .25 + .2 * Math.sin(S.t * 2);
  ctx.fillStyle = '#f4ead8'; ctx.beginPath(); ctx.ellipse(0, R * .12, R * .32, R * .3 * eo, 0, 0, TAU); ctx.fill();
  if (eo > .2) { const ax = clamp((P.x - e.x) / W, -1, 1) * R * .12, ay = clamp((P.y - e.y) / H, -1, 1) * R * .08; ctx.fillStyle = e.phase === 3 ? '#ff3030' : '#3aaa50'; ctx.beginPath(); ctx.arc(ax, R * .12 + ay, R * .16 * Math.min(1, eo + .3), 0, TAU); ctx.fill(); ctx.fillStyle = '#050205'; ctx.beginPath(); ctx.ellipse(ax, R * .12 + ay, R * .05, R * .12 * Math.min(1, eo + .3), 0, 0, TAU); ctx.fill(); }
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + S.t * .4; drawGlow(Math.cos(a) * R * .6, Math.sin(a) * R * .5, R * .1, C, .5 + .4 * Math.sin(S.t * 4 + i)); }
  if (rnd() < .5) { ctx.strokeStyle = `rgba(${C},.8)`; ctx.lineWidth = 1.3; const a = rand(0, TAU); zap(Math.cos(a) * R * .9, Math.sin(a) * R * .8, Math.cos(a) * R * 1.5, Math.sin(a) * R * 1.4, rand(0, 99), 8); }
  ctx.globalCompositeOperation = 'source-over';
  if (e.shp > 0 && !e.dying) {
    const fl = .5 + .5 * Math.sin(S.t * 3), hit = Math.max(0, e.shieldHit || 0) * 3, rr = e.sr, k = .45 + .55 * e.shp / e.smax;
    ctx.save(); ctx.beginPath(); ctx.arc(0, 0, rr, 0, TAU); ctx.globalCompositeOperation = 'lighter';
    const sg = ctx.createRadialGradient(0, 0, rr * .55, 0, 0, rr); sg.addColorStop(0, 'rgba(140,255,120,0)'); sg.addColorStop(1, `rgba(150,255,130,${(.2 + .1 * fl) * k + hit * .3})`);
    ctx.fillStyle = sg; ctx.fill(); ctx.strokeStyle = `rgba(180,255,160,${(.5 + .3 * fl) * k + hit})`; ctx.lineWidth = 2; ctx.stroke();
    ctx.clip(); ctx.strokeStyle = `rgba(170,255,150,${(.1 + .05 * fl) * k + hit * .3})`; ctx.lineWidth = 1;
    for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + S.t * .2; ctx.beginPath(); ctx.ellipse(0, 0, rr * .98, rr * .98 * Math.abs(Math.cos(a)), a, 0, TAU); ctx.stroke(); }
    ctx.restore();
  }
  for (const p of e.parts) if (!p.hidden || p.dead) drawModule(e, p, pulse);
}

