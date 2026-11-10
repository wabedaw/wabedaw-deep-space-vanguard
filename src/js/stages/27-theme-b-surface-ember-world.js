/* ---------- theme B surface: Ember World (volcanic planet) ---------- */
const SURFACE_NAMES_B = [I18('着陆区 · 灰烬平原', 'Landing Zone · Ash Plains'), I18('熔流峡谷', 'Magma Rift'), I18('黑曜石峰', 'Obsidian Peaks'), I18('熔岩湖岸', 'Lava Shore'), I18('炽海', 'Burning Sea'),
  I18('熔炉工业区', 'Foundry Belt'), I18('火山口群', 'Caldera Field'), I18('硫磺荒原', 'Sulphur Waste'), I18('喷发前线', 'Eruption Front'), I18('熔炉要塞', 'The Forge')];
const LV_BIOMES_B = [
  ['plains', 'forest', 'plains', 'river'], ['river', 'plains', 'river', 'forest'], ['mountains', 'forest', 'mountains', 'river'],
  ['coast', 'sea', 'coast', 'plains'], ['sea', 'coast', 'sea', 'plains'], ['base', 'plains', 'coast', 'base'],
  ['mountains', 'river', 'base', 'mountains'], ['plains', 'base', 'sea', 'mountains'], ['mountains', 'sea', 'base', 'river'],
  ['plains', 'base', 'mountains', 'base'],
];
Object.assign(SKY, {
  ember: { theme: 2, g: ['#14060a', '#3a0f14', '#7a2418', '#d2561e', '#ffb05a'], far: '#4a1f1c', mid: '#2a1212', fog: '255,120,60', cloud: '120,70,60', stars: .15, sun: null, ring: '0,0,0', ringA: 0, shade: .06, red: [.76, .66] },
  ash: { theme: 2, g: ['#0d0a0c', '#26191a', '#4a2c26', '#8a4a30', '#c07a4a'], far: '#3a2624', mid: '#21161a', fog: '200,130,90', cloud: '90,70,66', stars: .05, sun: null, ring: '0,0,0', ringA: 0, shade: .14, red: [.25, .7] },
  eclipse: { theme: 2, g: ['#050306', '#160a10', '#3a1018', '#7a1e18', '#d0502a'], far: '#2e1416', mid: '#180a0c', fog: '255,90,50', cloud: '80,40,40', stars: .6, sun: null, ring: '0,0,0', ringA: 0, shade: .2, red: [.52, .3], ecl: true },
  inferno: { theme: 2, g: ['#030102', '#12060a', '#2e0a0c', '#5a1408', '#a8320e'], far: '#24100e', mid: '#120706', fog: '255,80,30', cloud: '70,30,26', stars: .4, sun: null, ring: '0,0,0', ringA: 0, shade: .26, red: [.82, .7] },
});
const BIOME_PAL_B = {
  plains: { top: '#3d3336', rim: '#ff8a4a', deep: '#130c0e' }, forest: { top: '#33292c', rim: '#ff6a3a', deep: '#110a0c' },
  river: { top: '#3d3336', rim: '#ff8a4a', deep: '#130c0e' }, mountains: { top: '#4a3c3a', rim: '#ffb070', deep: '#150d0c' },
  coast: { top: '#5a4436', rim: '#ffc27a', deep: '#1c120e' }, sea: { top: '#2a1410', rim: '#ff7a3a', deep: '#120806' },
  base: { top: '#4b4f57', rim: '#ffb35a', deep: '#16181f' }, plateau: { top: '#48444a', rim: '#ffa860', deep: '#141216' },
};
const surfTheme = () => GW && GW.theme === 2;
function skyExtrasB(g, P0) {
  const [rx, ry] = P0.red, x = W * rx, y = H * ry, r = Math.min(W, H) * (P0.ecl ? .09 : .2);
  if (P0.ecl) {
    const cg = g.createRadialGradient(x, y, r * .9, x, y, r * 3); cg.addColorStop(0, 'rgba(255,230,180,.9)'); cg.addColorStop(.12, 'rgba(255,140,60,.55)'); cg.addColorStop(1, 'rgba(255,60,20,0)');
    g.fillStyle = cg; g.beginPath(); g.arc(x, y, r * 3, 0, TAU); g.fill();
    g.fillStyle = '#060304'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(255,240,210,.9)'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, r * 1.01, 0, TAU); g.stroke();
  } else {
    const gl = g.createRadialGradient(x, y, r * .6, x, y, r * 3.2); gl.addColorStop(0, 'rgba(255,120,60,.55)'); gl.addColorStop(.4, 'rgba(255,80,40,.18)'); gl.addColorStop(1, 'rgba(255,60,30,0)');
    g.fillStyle = gl; g.fillRect(0, 0, W, H);
    const dg = g.createRadialGradient(x - r * .3, y - r * .3, r * .1, x, y, r); dg.addColorStop(0, '#ffd28a'); dg.addColorStop(.5, '#ff7a32'); dg.addColorStop(1, '#b8281a');
    g.fillStyle = dg; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
    g.save(); g.beginPath(); g.arc(x, y, r, 0, TAU); g.clip();
    for (let i = 0; i < 14; i++) { g.fillStyle = `rgba(120,20,10,${rand(.15, .35)})`; g.beginPath(); g.ellipse(x + rand(-r, r), y + rand(-r, r), rand(.05, .18) * r, rand(.03, .08) * r, rand(0, 3), 0, TAU); g.fill(); }
    g.restore();
  }
  const mx = W * (rx > .5 ? .2 : .78), my = H * .17, mr = Math.min(W, H) * .07;
  drawMoon(g, mx, my, mr, '150,130,125', [rx, ry, '255,120,60']);
  g.strokeStyle = 'rgba(20,8,8,.85)'; g.lineWidth = 1.6; g.beginPath();
  for (let k = 0; k < 4; k++) { let cx = mx + rand(-.3, .3) * mr, cy = my + rand(-.3, .3) * mr; g.moveTo(cx, cy); for (let s = 0; s < 4; s++) { cx += rand(-.35, .35) * mr; cy += rand(-.35, .35) * mr; g.lineTo(cx, cy); } }
  g.stroke();
  for (let i = 0; i < 26; i++) {
    const a = rand(-.6, .6) + (rx > .5 ? 0 : Math.PI), d = mr * rand(1.3, 3.2), px = mx + Math.cos(a) * d, py = my + Math.sin(a) * d * .45, s = rand(1.5, mr * .14);
    g.fillStyle = `rgba(${rand(90, 140) | 0},${rand(70, 100) | 0},${rand(70, 95) | 0},.85)`; g.beginPath(); g.moveTo(px - s, py); g.lineTo(px, py - s * .7); g.lineTo(px + s * .8, py + s * .2); g.lineTo(px - s * .2, py + s * .6); g.closePath(); g.fill();
  }
  for (let i = 0; i < 5; i++) { const yy = H * rand(.2, .55), hh = H * rand(.02, .05); const bg = g.createLinearGradient(0, yy - hh, 0, yy + hh); bg.addColorStop(0, 'rgba(30,14,14,0)'); bg.addColorStop(.5, `rgba(30,14,14,${rand(.15, .3)})`); bg.addColorStop(1, 'rgba(30,14,14,0)'); g.fillStyle = bg; g.fillRect(0, yy - hh, W, hh * 2); }
}
function drawVolcanoesB() {
  const par = .1, TW = 900, off = S.wx * par, P0 = SKY[GW.skyKey];
  for (let k = Math.floor(off / TW) - 1; k * TW - off < W + TW; k++) {
    const h = i => bhash(k + 333, i), cx = k * TW - off + TW * (.3 + h(1) * .4), base = H * .68, ht = H * (.18 + h(2) * .1), bw = ht * (1.6 + h(3) * .6);
    ctx.fillStyle = P0.far; ctx.beginPath(); ctx.moveTo(cx - bw, base); ctx.lineTo(cx - bw * .14, base - ht); ctx.lineTo(cx + bw * .14, base - ht); ctx.lineTo(cx + bw, base); ctx.closePath(); ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = 'rgba(255,110,40,.35)'; ctx.lineWidth = 2;
    for (let s = -1; s <= 1; s += 2) { ctx.beginPath(); ctx.moveTo(cx + s * bw * .05, base - ht); ctx.quadraticCurveTo(cx + s * bw * .3, base - ht * .55, cx + s * bw * (.4 + h(4) * .2), base - ht * .1); ctx.stroke(); }
    drawGlow(cx, base - ht, bw * .25, '255,120,40', .55 + .25 * Math.sin(S.t * 2 + k));
    ctx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 9; i++) {
      const q = (S.t * .07 + i / 9 + h(5)) % 1, px = cx + Math.sin(q * 5 + k) * bw * .12 + q * bw * .35, py = base - ht - q * H * .4, rr = bw * (.08 + q * .25);
      ctx.fillStyle = `rgba(${40 + (1 - q) * 40 | 0},${24 + (1 - q) * 14 | 0},${22},${.55 * (1 - q)})`; ctx.beginPath(); ctx.arc(px, py, rr, 0, TAU); ctx.fill();
    }
  }
}
function lavaCrust(x0, x1, wy) {
  for (let x = x0 - ((S.wx * .9) % 70); x < x1; x += 70) {
    const k = Math.floor((x + S.wx * .9) / 70), w = 22 + (k * 37 % 30);
    ctx.fillStyle = 'rgba(40,12,8,.65)'; ctx.beginPath(); ctx.ellipse(x, wy + 6 + (k * 13 % 10), w, 4, 0, 0, TAU); ctx.fill();
  }
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 4; i++) { const bx = x0 + ((S.t * 37 + i * 211) % Math.max(1, x1 - x0)), ph = (S.t * 1.7 + i) % 1; drawGlow(bx, wy + 2 - ph * 6, 6 + ph * 6, '255,220,120', (1 - ph) * .7); }
  ctx.globalCompositeOperation = 'source-over';
}
function drawPlantB(d, x) {
  const y = d.y, s = d.s, sw = Math.sin(S.t * 1.1 + d.ph) * .04;
  ctx.save(); ctx.translate(x, y + 2); ctx.rotate(sw);
  if (d.k === 'embertree') {
    const h = 64 * s;
    ctx.strokeStyle = '#140c0c'; ctx.lineWidth = 6 * s; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-6 * s, -h * .5, 4 * s, -h); ctx.stroke();
    ctx.lineWidth = 2.5 * s; ctx.beginPath(); ctx.moveTo(2 * s, -h * .6); ctx.quadraticCurveTo(16 * s, -h * .7, 22 * s, -h * .95); ctx.moveTo(0, -h * .45); ctx.quadraticCurveTo(-14 * s, -h * .55, -20 * s, -h * .8); ctx.stroke(); ctx.lineCap = 'butt';
    ctx.globalCompositeOperation = 'lighter';
    for (const [px, py] of [[4, -h], [22, -h * .95], [-20, -h * .8], [12, -h * 1.05], [-6, -h * .95]]) { drawGlow(px * (px === 4 ? 1 : s), py, 9 * s, d.hue, .55 + .3 * Math.sin(S.t * 2 + d.ph + px)); drawGlow(px * (px === 4 ? 1 : s), py, 2.5 * s, '255,240,200', .9); }
  } else if (d.k === 'fungus') {
    const h = 52 * s;
    ctx.fillStyle = '#2a1e2a'; ctx.fillRect(-3 * s, -h, 6 * s, h);
    for (const [yy, rr] of [[-h, 18], [-h * .62, 13], [-h * .32, 9]]) {
      const g = ctx.createLinearGradient(0, yy - rr * s * .5, 0, yy); g.addColorStop(0, '#6ad8e8'); g.addColorStop(1, '#1a4a58');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, yy, rr * s, rr * .42 * s, 0, Math.PI, TAU); ctx.fill();
      ctx.globalCompositeOperation = 'lighter'; drawGlow(0, yy - 2, rr * s * .9, '120,230,255', .35 + .2 * Math.sin(S.t * 2.4 + d.ph + yy)); ctx.globalCompositeOperation = 'source-over';
    }
  } else if (d.k === 'spire') {
    for (let k = -2; k <= 2; k++) {
      const h = (40 - Math.abs(k) * 9) * s * (k === 0 ? 1.35 : 1), a = k * .2;
      ctx.save(); ctx.rotate(a);
      const g = ctx.createLinearGradient(-5 * s, 0, 5 * s, 0); g.addColorStop(0, '#0c080c'); g.addColorStop(.5, '#3a2a3a'); g.addColorStop(1, '#0c080c');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-5 * s, 0); ctx.lineTo(-2 * s, -h); ctx.lineTo(2 * s, -h * .96); ctx.lineTo(5 * s, 0); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,140,80,.45)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -h * .9); ctx.stroke();
      ctx.restore();
    }
    ctx.globalCompositeOperation = 'lighter'; drawGlow(0, -6 * s, 16 * s, '255,110,50', .35);
  } else {
    ctx.fillStyle = '#2a1e1c'; ctx.beginPath(); ctx.moveTo(-14 * s, 0); ctx.lineTo(-5 * s, -10 * s); ctx.lineTo(5 * s, -10 * s); ctx.lineTo(14 * s, 0); ctx.closePath(); ctx.fill();
    ctx.globalCompositeOperation = 'lighter'; drawGlow(0, -10 * s, 10 * s, '255,150,60', .6 + .3 * Math.sin(S.t * 3 + d.ph));
    ctx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 4; i++) { const q = (S.t * .5 + i / 4 + d.ph) % 1; ctx.fillStyle = `rgba(160,140,130,${.35 * (1 - q)})`; ctx.beginPath(); ctx.arc(Math.sin(q * 6 + i) * 6 * s, -10 * s - q * 60 * s, (5 + q * 14) * s, 0, TAU); ctx.fill(); }
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
}
function drawCrawler(f, x, gy) {
  const s = f.s, walk = f.vx ? f.ph : 0;
  ctx.save(); ctx.translate(x, gy);
  ctx.strokeStyle = '#140a0a'; ctx.lineWidth = 2.6 * s; ctx.lineCap = 'round';
  for (let k = 0; k < 4; k++) { const lx = (k < 2 ? -10 : 8) * s, sw = Math.sin(walk + k * 1.7) * 4 * s; ctx.beginPath(); ctx.moveTo(lx, -6 * s); ctx.lineTo(lx + sw - 3 * s, 0); ctx.stroke(); }
  ctx.lineWidth = 4 * s; ctx.beginPath(); ctx.moveTo(14 * s, -7 * s); ctx.quadraticCurveTo(26 * s, -6 * s + Math.sin(walk) * 2, 34 * s, -2 * s); ctx.stroke(); ctx.lineCap = 'butt';
  ctx.fillStyle = '#241414'; ctx.beginPath(); ctx.ellipse(0, -8 * s, 17 * s, 6 * s, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#2e1a18'; ctx.beginPath(); ctx.ellipse(-19 * s, -9 * s, 7 * s, 4.5 * s, -.15, 0, TAU); ctx.fill();
  ctx.globalCompositeOperation = 'lighter';
  for (let k = -2; k <= 2; k++) drawGlow(k * 6 * s, -11 * s, 2.6 * s, '255,140,50', .65 + .3 * Math.sin(S.t * 3 + k + f.ph));
  drawGlow(-23 * s, -10 * s, 2 * s, '255,230,120', .9);
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
}
function drawAshRay(f) {
  const s = f.s, fl = Math.sin(f.ph * 2) * .5;
  ctx.save(); ctx.translate(f.x, f.y + Math.sin(f.ph) * 8);
  ctx.fillStyle = 'rgba(40,24,26,.85)';
  ctx.beginPath(); ctx.moveTo(-18 * s, 0); ctx.quadraticCurveTo(0, -(22 + fl * 16) * s, 16 * s, -2 * s); ctx.quadraticCurveTo(0, (22 + fl * 16) * s, -18 * s, 0); ctx.fill();
  ctx.strokeStyle = 'rgba(40,24,26,.8)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(16 * s, 0); ctx.quadraticCurveTo(34 * s, Math.sin(f.ph * 1.5) * 6, 50 * s, 0); ctx.stroke();
  ctx.globalCompositeOperation = 'lighter'; drawGlow(-2 * s, -(18 + fl * 12) * s, 4 * s, '255,140,60', .7); drawGlow(-2 * s, (18 + fl * 12) * s, 4 * s, '255,140,60', .7); drawGlow(-14 * s, 0, 3 * s, '255,220,120', .8);
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
}

