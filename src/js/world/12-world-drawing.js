/* ---------- world drawing ---------- */
function drawSideWorld() {
  const P0 = SKY[GW.skyKey];
  if (GW.skyOld && GW.skyFade > 0) { ctx.drawImage(GW.skyOld, 0, 0, W, H); ctx.globalAlpha = 1 - GW.skyFade; ctx.drawImage(GW.sky, 0, 0, W, H); ctx.globalAlpha = 1; }
  else ctx.drawImage(GW.sky, 0, 0, W, H);
  if (SKY[GW.skyKey].aur) drawAuroraSky();
  ctx.globalCompositeOperation = 'lighter';
  for (const d of GW.dots) drawGlow(d.x, d.y, 4, '255,255,255', .35 + .4 * (Math.sin(d.ph * 5) > .7 ? 1 : 0));
  ctx.globalCompositeOperation = 'source-over';
  if (GW.boltT > 0) drawBolt();
  for (const c of GW.clouds) if (c.par < .15) ctx.drawImage(GW.cloudSpr[c.i], c.x, c.y, 320 * c.s, 120 * c.s);
  layerFill(.08, H * .66, H * .22, .0011, 3.1, true, P0.far, `rgba(${P0.fog},.55)`);
  if (GW.theme === 2) drawVolcanoesB(); else if (GW.theme === 3) drawGlaciersC();
  for (const f of GW.flyers) (GW.theme === 2 ? drawAshRay : GW.theme === 3 ? drawSnowbird : drawFlyer)(f);
  layerFill(.22, H * .76, H * .13, .0024, 7.7, false, P0.mid, `rgba(${P0.fog},.25)`);
  for (const c of GW.clouds) if (c.par >= .15) ctx.drawImage(GW.cloudSpr[c.i], c.x, c.y, 320 * c.s, 120 * c.s);
  drawTerrain(P0);
  for (const s of GW.serp) (GW.theme === 2 ? drawSerpentLava : drawSerpent)(s);
  drawWater();
  for (const w of GW.wrecks) drawWreck(w);
  for (const d of GW.decor) { const x = d.wx - S.wx; if (x > -80 && x < W + 80) (GW.theme === 2 ? drawPlantB : GW.theme === 3 ? drawPlantC : drawPlant)(d, x); }
  for (const f of GW.fauna) { const x = f.wx - S.wx; if (x > -60 && x < W + 60) (f.k === 'crawler' ? drawCrawler : f.k === 'mammoth' ? drawMammoth : drawGrazer)(f, x, groundAt(f.wx)); }
  if (P0.shade > 0) { ctx.fillStyle = `rgba(${GW.theme === 2 ? '24,6,4' : GW.theme === 3 ? '6,14,30' : '8,10,40'},${P0.shade})`; ctx.fillRect(0, H * .3, W, H * .7); }
}
function drawSideFront() {
  ctx.lineCap = 'round';
  for (const w of GW.wind) { ctx.strokeStyle = `rgba(230,240,255,${w.a})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(w.x, w.y); ctx.lineTo(w.x + w.l, w.y); ctx.stroke(); }
  if (GW.rain.length && GW.theme === 3) { ctx.fillStyle = 'rgba(240,248,255,.85)'; for (const r of GW.rain) { const z = r.e ? 3 : 1.8; ctx.fillRect(r.x, r.y, z, z); } if (levelOf(S.sector) >= 7) { ctx.fillStyle = 'rgba(225,235,245,.14)'; ctx.fillRect(0, 0, W, H); } }
  else if (GW.rain.length && GW.theme === 2) { for (const r of GW.rain) { if (r.e) { ctx.globalCompositeOperation = 'lighter'; drawGlow(r.x, r.y, 2.4, '255,150,60', .85); ctx.globalCompositeOperation = 'source-over'; } else { ctx.fillStyle = 'rgba(190,170,165,.45)'; ctx.fillRect(r.x, r.y, 2.2, 2.2); } } }
  else if (GW.rain.length) { ctx.strokeStyle = 'rgba(180,200,255,.35)'; ctx.lineWidth = 1; ctx.beginPath(); for (const r of GW.rain) { ctx.moveTo(r.x, r.y); ctx.lineTo(r.x + 9, r.y - 22); } ctx.stroke(); }
  ctx.lineCap = 'butt';
}
function drawBolt() {
  let x = GW.boltX, y = 0; ctx.strokeStyle = `rgba(220,230,255,${GW.boltT * 3.5})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y);
  while (y < H * .7) { x += rand(-30, 30); y += rand(20, 50); ctx.lineTo(x, y); }
  ctx.stroke();
}
function layerFill(par, base, amp, f, off, ridged, col, fog) {
  ctx.beginPath(); ctx.moveTo(-4, H);
  for (let x = -8; x <= W + 8; x += 8) {
    const wx = S.wx * par + x; let n = swFbm(wx * f + off, 4);
    if (ridged) n = Math.pow(1 - Math.abs(n * 2 - 1), 1.6); else n += swNoise(wx * .06) * .08;
    ctx.lineTo(x, base - n * amp);
  }
  ctx.lineTo(W + 8, H); ctx.closePath();
  ctx.fillStyle = col; ctx.fill();
  const gr = ctx.createLinearGradient(0, base - amp, 0, base); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, fog);
  ctx.fillStyle = gr; ctx.fill();
}
function drawTerrain(P0) {
  const cols = GW.cols, i0 = colIndex(S.wx - 12), i1 = colIndex(S.wx + W + 12);
  let i = i0;
  while (i <= i1) {
    const b = cols[i].b; let j = i, mg = cols[i].g;
    while (j + 1 <= i1 && cols[j + 1].b === b) { j++; mg = Math.min(mg, cols[j].g); }
    const e = Math.min(j + 1, i1), pal = ([0, BIOME_PAL, BIOME_PAL_B, BIOME_PAL_C][GW.theme] || BIOME_PAL)[b];
    const path = (off = 0) => { ctx.beginPath(); ctx.moveTo(cols[i].wx - S.wx, cols[i].g + off); for (let k = i + 1; k <= e; k++) ctx.lineTo(cols[k].wx - S.wx, cols[k].g + off); };
    path(); ctx.lineTo(cols[e].wx - S.wx, H + 4); ctx.lineTo(cols[i].wx - S.wx, H + 4); ctx.closePath();
    const g0 = b === 'mountains' ? mg : H * .74, gr = ctx.createLinearGradient(0, g0, 0, g0 + H * .32); gr.addColorStop(0, pal.top); gr.addColorStop(.25, pal.deep); gr.addColorStop(1, '#0a0910');
    ctx.fillStyle = gr; ctx.fill();
    ctx.lineJoin = 'round';
    path(9); ctx.strokeStyle = pal.top; ctx.lineWidth = 18; ctx.stroke();
    path(34); ctx.strokeStyle = 'rgba(0,0,0,.16)'; ctx.lineWidth = 3; ctx.stroke();
    path(70); ctx.strokeStyle = 'rgba(0,0,0,.12)'; ctx.lineWidth = 2; ctx.stroke();
    path(1); ctx.strokeStyle = pal.rim; ctx.lineWidth = 2; ctx.stroke();
    if (b === 'mountains' && GW.theme === 2) {
      ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(255,110,40,${.45 + .2 * Math.sin(S.t * 2)})`; ctx.lineWidth = 3; ctx.beginPath(); let on = false;
      for (let k = i; k <= e; k++) { const c = cols[k], x = c.wx - S.wx; if (c.g < H * .64) { const yy = c.g + 14 + Math.sin(c.wx * .05) * 6; on ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); on = true; } else on = false; }
      ctx.stroke(); ctx.globalCompositeOperation = 'source-over';
    } else if (b === 'mountains') {
      ctx.strokeStyle = 'rgba(240,245,255,.85)'; ctx.lineWidth = 7; ctx.beginPath(); let on = false;
      for (let k = i; k <= e; k++) { const c = cols[k], x = c.wx - S.wx; if (c.g < H * .55) { on ? ctx.lineTo(x, c.g + 3) : ctx.moveTo(x, c.g + 3); on = true; } else on = false; }
      ctx.stroke();
    }
    if (b === 'base' || b === 'plateau') {
      ctx.fillStyle = 'rgba(255,200,80,.5)';
      for (let k = i; k <= e; k += 8) { const c = cols[k]; if ((c.wx / 48 | 0) % 2) ctx.fillRect(c.wx - S.wx, c.g + 4, STEPW * 4, 3); }
    }
    i = j + 1;
  }
}
function drawWater() {
  const cols = GW.cols, i0 = colIndex(S.wx - 12), i1 = colIndex(S.wx + W + 12), wy = waterY();
  let i = i0;
  while (i <= i1) {
    if (!cols[i].w) { i++; continue; }
    let j = i; while (j + 1 <= i1 && cols[j + 1].w) j++;
    const x0 = cols[i].wx - S.wx - 3, x1 = cols[j].wx - S.wx + 3;
    ctx.beginPath(); ctx.moveTo(x0, H + 4);
    for (let x = x0; x <= x1; x += 8) ctx.lineTo(x, wy + Math.sin((x + S.wx) * .045 + S.t * 2.2) * 2);
    ctx.lineTo(x1, wy); ctx.lineTo(x1, H + 4); ctx.closePath();
    const lava = GW.theme === 2, ice = GW.theme === 3, gr = ctx.createLinearGradient(0, wy, 0, H); gr.addColorStop(0, lava ? 'rgba(255,120,40,.9)' : ice ? 'rgba(150,205,235,.82)' : 'rgba(60,170,190,.62)'); gr.addColorStop(1, lava ? 'rgba(80,10,4,.96)' : ice ? 'rgba(10,30,56,.95)' : 'rgba(8,28,60,.92)');
    ctx.fillStyle = gr; ctx.fill();
    ctx.strokeStyle = lava ? 'rgba(255,220,140,.85)' : 'rgba(200,245,255,.7)'; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let x = x0; x <= x1; x += 8) { const y = wy + Math.sin((x + S.wx) * .045 + S.t * 2.2) * 2; x === x0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    ctx.stroke();
    ctx.globalCompositeOperation = 'lighter';
    for (let x = x0 + ((S.wx * .3) % 37); x < x1; x += 37) drawGlow(x, wy + 6 + ((x * 7) % 18), 5, lava ? '255,200,100' : '200,240,255', .25 + .2 * Math.sin(S.t * 3 + x));
    ctx.globalCompositeOperation = 'source-over';
    if (lava) lavaCrust(x0, x1, wy); else if (ice) drawFloesC(x0, x1, wy);
    i = j + 1;
  }
}
function drawPlant(d, x) {
  const y = d.y, s = d.s, sw = Math.sin(S.t * 1.4 + d.ph) * .06;
  ctx.save(); ctx.translate(x, y + 2); ctx.rotate(sw);
  if (d.k === 'tree') {
    const h = 70 * s;
    ctx.strokeStyle = '#3a2b45'; ctx.lineWidth = 5 * s; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(8 * s, -h * .5, -4 * s, -h); ctx.stroke();
    for (const [ox, oy, rx, a] of [[-18, -h - 4, 30, .9], [14, -h + 4, 26, .85], [-2, -h - 14, 24, 1]]) {
      ctx.fillStyle = `rgba(${a > .95 ? '160,90,190' : '120,70,160'},${a})`; ctx.beginPath(); ctx.ellipse(ox * s, oy, rx * s, rx * .38 * s, 0, Math.PI, TAU); ctx.fill();
    }
    ctx.globalCompositeOperation = 'lighter';
    for (let k = -2; k <= 2; k++) drawGlow(k * 9 * s, -h - 8 + Math.abs(k) * 3, 4 * s, d.hue, .6);
  } else if (d.k === 'bulb') {
    const h = 44 * s;
    ctx.strokeStyle = '#2f5a52'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-6 * s, -h * .6, 2 * s, -h); ctx.stroke();
    ctx.fillStyle = '#2f6a5c'; ctx.beginPath(); ctx.ellipse(-6 * s, -h * .35, 8 * s, 3 * s, -.5, 0, TAU); ctx.fill();
    ctx.globalCompositeOperation = 'lighter'; drawGlow(2 * s, -h, 14 * s, d.hue, .55 + .25 * Math.sin(S.t * 2 + d.ph)); drawGlow(2 * s, -h, 4 * s, '255,255,255', .9);
  } else if (d.k === 'frond') {
    ctx.strokeStyle = '#4fae8c'; ctx.lineWidth = 2.4;
    for (let k = -3; k <= 3; k++) { const a = k * .32, l = (30 - Math.abs(k) * 4) * s; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(Math.sin(a) * l * .4, -l * .8, Math.sin(a) * l, -l * Math.cos(a) * .9); ctx.stroke(); }
  } else if (d.k === 'crystal') {
    for (let k = -2; k <= 2; k++) {
      const h = (34 - Math.abs(k) * 8) * s * (1 + (k === 0 ? .4 : 0)), a = k * .22;
      ctx.save(); ctx.rotate(a);
      const gr = ctx.createLinearGradient(0, 0, 0, -h); gr.addColorStop(0, 'rgba(110,80,170,.95)'); gr.addColorStop(1, 'rgba(220,200,255,.95)');
      ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(-4 * s, 0); ctx.lineTo(-3 * s, -h * .8); ctx.lineTo(0, -h); ctx.lineTo(3 * s, -h * .8); ctx.lineTo(4 * s, 0); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    ctx.globalCompositeOperation = 'lighter'; drawGlow(0, -20 * s, 18 * s, '190,160,255', .35);
  } else {
    for (let k = -2; k <= 2; k++) {
      const h = (22 + ((k * 7 + 9) % 5) * 5) * s;
      ctx.fillStyle = k % 2 ? '#d0663f' : '#e98a54'; ctx.fillRect(k * 5 * s - 2 * s, -h, 4 * s, h);
      ctx.globalCompositeOperation = 'lighter'; drawGlow(k * 5 * s, -h, 4 * s, '255,170,110', .7); ctx.globalCompositeOperation = 'source-over';
    }
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
}
function drawGrazer(f, x, gy) {
  const s = f.s * 1.1, walk = f.vx ? f.ph : 0;
  ctx.save(); ctx.translate(x, gy);
  ctx.strokeStyle = '#2a1f35'; ctx.lineWidth = 3 * s; ctx.lineCap = 'round';
  for (let k = 0; k < 4; k++) { const lx = (k < 2 ? -10 : 9) * s + (k % 2) * 3 * s, sw = Math.sin(walk + k * 1.6) * 5 * s; ctx.beginPath(); ctx.moveTo(lx, -16 * s); ctx.lineTo(lx + sw, 0); ctx.stroke(); }
  ctx.fillStyle = '#3d2c4d'; ctx.beginPath(); ctx.ellipse(0, -20 * s, 17 * s, 8 * s, 0, 0, TAU); ctx.fill();
  ctx.lineWidth = 4.5 * s; ctx.strokeStyle = '#3d2c4d'; ctx.beginPath(); ctx.moveTo(-12 * s, -22 * s); ctx.quadraticCurveTo(-22 * s, -36 * s, -24 * s, -48 * s + Math.sin(walk * .5) * 2); ctx.stroke();
  ctx.fillStyle = '#4a375c'; ctx.beginPath(); ctx.ellipse(-27 * s, -49 * s + Math.sin(walk * .5) * 2, 6 * s, 3.2 * s, -.3, 0, TAU); ctx.fill();
  ctx.lineWidth = 2 * s; ctx.beginPath(); ctx.moveTo(16 * s, -20 * s); ctx.quadraticCurveTo(26 * s, -18 * s, 28 * s, -10 * s); ctx.stroke();
  ctx.globalCompositeOperation = 'lighter';
  for (let k = -1; k <= 1; k++) drawGlow(k * 7 * s, -27 * s, 3 * s, '120,240,220', .7);
  drawGlow(-29 * s, -50 * s, 2.5 * s, '255,230,140', .9);
  ctx.globalCompositeOperation = 'source-over'; ctx.lineCap = 'butt';
  ctx.restore();
}
function drawFlyer(f) {
  const s = f.s, fl = Math.sin(f.ph * 2) * .45;
  ctx.save(); ctx.translate(f.x, f.y + Math.sin(f.ph) * 8); ctx.globalAlpha = .75;
  ctx.fillStyle = 'rgba(150,120,210,.55)';
  for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(-10 * s, 0); ctx.quadraticCurveTo(0, sd * (26 + fl * 20) * s, 14 * s, sd * 4 * s); ctx.lineTo(10 * s, 0); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = 'rgba(200,170,255,.8)'; ctx.beginPath(); ctx.ellipse(0, 0, 16 * s, 4 * s, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(200,170,255,.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(16 * s, 0); ctx.quadraticCurveTo(34 * s, Math.sin(f.ph * 1.5) * 6, 46 * s, 0); ctx.stroke();
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'lighter'; drawGlow(-4 * s, 0, 10 * s, '170,140,255', .5); ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
}
function drawSerpent(sp) {
  const q = clamp(sp.t / sp.dur, 0, 1), x0 = sp.wx - S.wx, wy = waterY();
  ctx.strokeStyle = '#1d4a52'; ctx.lineCap = 'round';
  const pts = [];
  for (let k = 0; k <= 14; k++) {
    const u = q * 1.35 - k / 14 * .35; if (u < 0 || u > 1) continue;
    pts.push([x0 + u * sp.len, wy - Math.sin(u * Math.PI) * sp.h, k]);
  }
  for (let k = 1; k < pts.length; k++) { ctx.lineWidth = (13 - pts[k][2] * .6) * sp.s; ctx.beginPath(); ctx.moveTo(pts[k - 1][0], pts[k - 1][1]); ctx.lineTo(pts[k][0], pts[k][1]); ctx.stroke(); }
  if (pts.length) { const [hx, hy] = pts[0]; ctx.fillStyle = '#26606a'; ctx.beginPath(); ctx.ellipse(hx, hy, 11 * sp.s, 7 * sp.s, -Math.cos(q * Math.PI) * .9, 0, TAU); ctx.fill(); ctx.globalCompositeOperation = 'lighter'; drawGlow(hx + 3, hy - 2, 4, '255,240,150', .9); ctx.globalCompositeOperation = 'source-over'; }
  ctx.lineCap = 'butt';
}
function drawWreck(w) {
  const x = w.wx - S.wx; if (x < -w.w * 2 || x > W + w.w * 2) return;
  ctx.fillStyle = '#16131a';
  ctx.beginPath(); ctx.moveTo(x - w.w, w.y); for (let k = 0; k <= 6; k++) ctx.lineTo(x - w.w + k * w.w / 3, w.y - (k % 2 ? 10 : 4) * (w.w / 30)); ctx.lineTo(x + w.w, w.y); ctx.closePath(); ctx.fill();
  ctx.globalCompositeOperation = 'lighter'; drawGlow(x, w.y - 4, w.w * .6, '255,120,40', .25 + .15 * Math.sin(w.t * 6)); ctx.globalCompositeOperation = 'source-over';
}

