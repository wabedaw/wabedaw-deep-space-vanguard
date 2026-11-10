/* ---------- theme C surface: Glacius (ice world) ---------- */
const SURFACE_NAMES_C = [I18('着陆区 · 霜原', 'Landing Zone · Frost Plains'), I18('冰川河谷', 'Glacier Valley'), I18('水晶冰峰', 'Crystal Peaks'), I18('浮冰海岸', 'Floe Coast'), I18('冰封之海', 'Frozen Sea'),
  I18('极光峡湾', 'Aurora Fjord'), I18('冰原前哨', 'Tundra Outpost'), I18('暴风雪带', 'Blizzard Belt'), I18('冰封舰港', 'Icebound Harbor'), I18('冰川要塞', 'Glacier Citadel')];
const LV_BIOMES_C = [
  ['plains', 'forest', 'river', 'plains'], ['river', 'forest', 'mountains', 'river'], ['mountains', 'forest', 'mountains', 'plains'],
  ['coast', 'sea', 'coast', 'plains'], ['sea', 'coast', 'sea', 'forest'], ['mountains', 'coast', 'sea', 'base'],
  ['plains', 'base', 'forest', 'mountains'], ['mountains', 'plains', 'base', 'river'], ['sea', 'base', 'coast', 'base'],
  ['plains', 'base', 'mountains', 'base'],
];
Object.assign(SKY, {
  polar: { theme: 3, g: ['#0b2a4a', '#2a6a9a', '#7ab6d8', '#cfe8f2', '#f4fbff'], far: '#9ab8cc', mid: '#6a8aa4', fog: '230,245,255', cloud: '255,255,255', stars: .05, sun: [.8, .3, '255,255,240'], ring: '0,0,0', ringA: 0, shade: 0, halo: true },
  aurora: { theme: 3, g: ['#020611', '#061a2e', '#0b2c44', '#164a5e', '#2a6a78'], far: '#24405a', mid: '#132a3c', fog: '120,220,220', cloud: '160,200,220', stars: 1, sun: null, ring: '0,0,0', ringA: 0, shade: .22, aur: true },
  blizzard: { theme: 3, g: ['#2a3442', '#4a5868', '#7a8a9a', '#a8b6c2', '#d0dae2'], far: '#8090a0', mid: '#5a6878', fog: '220,230,240', cloud: '230,236,244', stars: 0, sun: null, ring: '0,0,0', ringA: 0, shade: .08, bliz: true },
  frostdusk: { theme: 3, g: ['#060818', '#14183a', '#2a2a5a', '#5a4a7a', '#a07a9a'], far: '#40406a', mid: '#24244a', fog: '180,170,230', cloud: '200,190,240', stars: .7, sun: null, ring: '0,0,0', ringA: 0, shade: .18, aur: true },
});
const BIOME_PAL_C = {
  plains: { top: '#dfeaf2', rim: '#ffffff', deep: '#3a5068' }, forest: { top: '#c8dce8', rim: '#f2fbff', deep: '#2e4458' },
  river: { top: '#dfeaf2', rim: '#ffffff', deep: '#3a5068' }, mountains: { top: '#b8cde0', rim: '#ffffff', deep: '#2a3a52' },
  coast: { top: '#a8c4d8', rim: '#e8f6ff', deep: '#24384c' }, sea: { top: '#7aa6c4', rim: '#cfeaff', deep: '#1a2a3c' },
  base: { top: '#5a6878', rim: '#bfe0ff', deep: '#16202c' }, plateau: { top: '#6a7888', rim: '#cfe8ff', deep: '#18222e' },
};
function skyExtrasC(g, P0) {
  const gx = W * .2, gy = H * .2, gr = Math.min(W, H) * .16;
  g.save(); g.translate(gx, gy); g.rotate(-.35);
  for (let k = 0; k < 6; k++) { g.strokeStyle = `rgba(200,220,240,${[.18, .3, .12, .26, .1, .2][k] * (P0.bliz ? .4 : 1)})`; g.lineWidth = gr * .05; g.beginPath(); g.ellipse(0, 0, gr * (1.5 + k * .1), gr * (.32 + k * .02), 0, Math.PI, TAU); g.stroke(); }
  g.restore();
  const pg = g.createRadialGradient(gx - gr * .3, gy - gr * .3, gr * .1, gx, gy, gr); pg.addColorStop(0, '#e8f2fa'); pg.addColorStop(.6, '#8aa8c4'); pg.addColorStop(1, '#2a3a54');
  g.globalAlpha = P0.bliz ? .35 : 1; g.fillStyle = pg; g.beginPath(); g.arc(gx, gy, gr, 0, TAU); g.fill();
  g.save(); g.beginPath(); g.arc(gx, gy, gr, 0, TAU); g.clip(); for (let i = -4; i <= 4; i++) { g.fillStyle = `rgba(${i % 2 ? '160,190,215' : '230,240,250'},.25)`; g.fillRect(gx - gr, gy + i * gr * .2, gr * 2, gr * .1); } g.restore();
  g.save(); g.translate(gx, gy); g.rotate(-.35);
  for (let k = 0; k < 6; k++) { g.strokeStyle = `rgba(220,235,250,${[.18, .3, .12, .26, .1, .2][k] * (P0.bliz ? .4 : 1)})`; g.lineWidth = gr * .05; g.beginPath(); g.ellipse(0, 0, gr * (1.5 + k * .1), gr * (.32 + k * .02), 0, 0, Math.PI); g.stroke(); }
  g.restore(); g.globalAlpha = 1;
  if (P0.halo) {
    const [sx, sy, col] = P0.sun, x = W * sx, y = H * sy, r = Math.min(W, H) * .045;
    const hg = g.createRadialGradient(x, y, r * 5.4, x, y, r * 6.4); hg.addColorStop(0, 'rgba(255,255,255,0)'); hg.addColorStop(.5, 'rgba(255,250,240,.1)'); hg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = hg; g.beginPath(); g.arc(x, y, r * 6.4, 0, TAU); g.fill();
    for (const s of [-1, 1]) { const dg = g.createRadialGradient(x + s * r * 6, y, 0, x + s * r * 6, y, r * 1.6); dg.addColorStop(0, 'rgba(255,240,220,.75)'); dg.addColorStop(1, 'rgba(255,240,220,0)'); g.fillStyle = dg; g.fillRect(x + s * r * 6 - r * 2, y - r * 2, r * 4, r * 4); }
  }
  if (!P0.bliz) drawMoon(g, W * .82, H * .12, Math.min(W, H) * .04, '220,230,245', P0.sun);
}
function drawAuroraSky() {
  ctx.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 3; k++) {
    const base = H * (.12 + k * .07), col = k === 1 ? '170,120,255' : '90,255,170';
    ctx.beginPath();
    for (let x = -20; x <= W + 20; x += 20) ctx.lineTo(x, base + Math.sin(x * .006 + S.t * .4 + k * 2) * H * .05 + Math.sin(x * .017 - S.t * .7) * H * .015);
    for (let x = W + 20; x >= -20; x -= 20) ctx.lineTo(x, base + H * (.16 + .05 * Math.sin(x * .01 + k)) + Math.sin(x * .006 + S.t * .4 + k * 2) * H * .05);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, base - H * .05, 0, base + H * .22); g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(.35, `rgba(${col},${.16 + .06 * Math.sin(S.t + k)})`); g.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = g; ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
}
function drawGlaciersC() {
  const par = .1, TW = 760, off = S.wx * par, P0 = SKY[GW.skyKey];
  for (let k = Math.floor(off / TW) - 1; k * TW - off < W + TW; k++) {
    const h = i => bhash(k + 777, i), x0 = k * TW - off, base = H * .7;
    ctx.fillStyle = P0.far; ctx.beginPath(); ctx.moveTo(x0, base);
    const n = 7; for (let i = 0; i <= n; i++) { const x = x0 + i / n * TW, y = base - H * (.08 + h(i) * .2) * Math.sin(i / n * Math.PI); ctx.lineTo(x, y); }
    ctx.lineTo(x0 + TW, base); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(235,248,255,.35)'; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 1; i < n; i++) { const x = x0 + i / n * TW, y = base - H * (.08 + h(i) * .2) * Math.sin(i / n * Math.PI); ctx.moveTo(x, y); ctx.lineTo(x + (h(i + 9) - .5) * 40, y + H * .08); }
    ctx.stroke();
  }
}
function drawFloesC(x0, x1, wy) {
  for (let x = x0 - ((S.wx * .9) % 90); x < x1; x += 90) {
    const k = Math.floor((x + S.wx * .9) / 90), w = 24 + (k * 37 % 34), y = wy + 3 + (k * 13 % 8);
    ctx.fillStyle = 'rgba(235,246,255,.9)'; ctx.beginPath(); ctx.moveTo(x - w, y); ctx.lineTo(x - w * .7, y - 4); ctx.lineTo(x + w * .8, y - 3); ctx.lineTo(x + w, y + 1); ctx.lineTo(x + w * .6, y + 4); ctx.lineTo(x - w * .8, y + 4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(120,170,210,.5)'; ctx.fillRect(x - w * .8, y + 3, w * 1.4, 2);
  }
}
function drawPlantC(d, x) {
  const y = d.y, s = d.s, sw = Math.sin(S.t * 1.2 + d.ph) * .03;
  ctx.save(); ctx.translate(x, y + 2); ctx.rotate(sw);
  if (d.k === 'pine') {
    const h = 70 * s; ctx.fillStyle = '#2a2420'; ctx.fillRect(-2.5 * s, -h * .2, 5 * s, h * .2);
    for (let i = 0; i < 4; i++) { const yy = -h * (.15 + i * .2), ww = (22 - i * 4.5) * s; ctx.fillStyle = '#1e3a3a'; ctx.beginPath(); ctx.moveTo(-ww, yy); ctx.lineTo(0, yy - h * .28); ctx.lineTo(ww, yy); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#eef6fc'; ctx.beginPath(); ctx.moveTo(-ww * .7, yy - h * .07); ctx.lineTo(0, yy - h * .28); ctx.lineTo(ww * .7, yy - h * .07); ctx.quadraticCurveTo(0, yy - h * .12, -ww * .7, yy - h * .07); ctx.fill(); }
  } else if (d.k === 'icecrystal') {
    for (let k = -2; k <= 2; k++) {
      const h = (36 - Math.abs(k) * 8) * s * (k === 0 ? 1.4 : 1); ctx.save(); ctx.rotate(k * .24);
      const g = ctx.createLinearGradient(-4 * s, 0, 4 * s, 0); g.addColorStop(0, 'rgba(120,190,240,.9)'); g.addColorStop(.5, 'rgba(240,252,255,.95)'); g.addColorStop(1, 'rgba(90,150,210,.9)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-4 * s, 0); ctx.lineTo(-3 * s, -h * .82); ctx.lineTo(0, -h); ctx.lineTo(3 * s, -h * .82); ctx.lineTo(4 * s, 0); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    ctx.globalCompositeOperation = 'lighter'; drawGlow(0, -18 * s, 18 * s, ICE, .3 + .15 * Math.sin(S.t * 2 + d.ph));
  } else if (d.k === 'frostbloom') {
    const h = 30 * s; ctx.strokeStyle = '#3a6a7a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(5 * s, -h * .5, 0, -h); ctx.stroke();
    for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + S.t * .3; ctx.fillStyle = 'rgba(170,235,255,.85)'; ctx.beginPath(); ctx.ellipse(Math.cos(a) * 6 * s, -h + Math.sin(a) * 6 * s, 5 * s, 2.4 * s, a, 0, TAU); ctx.fill(); }
    ctx.globalCompositeOperation = 'lighter'; drawGlow(0, -h, 14 * s, ICE, .55 + .25 * Math.sin(S.t * 2.6 + d.ph)); drawGlow(0, -h, 3.5 * s, WHITE, 1);
  } else {
    ctx.fillStyle = '#3a4656'; ctx.beginPath(); ctx.moveTo(-18 * s, 0); ctx.lineTo(-12 * s, -14 * s); ctx.lineTo(4 * s, -20 * s); ctx.lineTo(16 * s, -8 * s); ctx.lineTo(20 * s, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f0f8ff'; ctx.beginPath(); ctx.moveTo(-14 * s, -11 * s); ctx.lineTo(-12 * s, -14 * s); ctx.lineTo(4 * s, -20 * s); ctx.lineTo(16 * s, -8 * s); ctx.quadraticCurveTo(2 * s, -12 * s, -14 * s, -11 * s); ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
}
function drawMammoth(f, x, gy) {
  const s = f.s * 1.15, walk = f.vx ? f.ph : 0;
  ctx.save(); ctx.translate(x, gy);
  ctx.fillStyle = '#4a3a32';
  for (let k = 0; k < 4; k++) { const lx = (k < 2 ? -12 : 10) * s + (k % 2) * 4 * s, sw = Math.sin(walk + k * 1.6) * 3 * s; ctx.fillRect(lx + sw - 3 * s, -14 * s, 6 * s, 14 * s); }
  const g = ctx.createLinearGradient(0, -40 * s, 0, -8 * s); g.addColorStop(0, '#7a6050'); g.addColorStop(1, '#3a2a24');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, -24 * s, 22 * s, 14 * s, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-22 * s, -26 * s + Math.sin(walk * .5), 10 * s, 10 * s, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(240,248,255,.85)'; ctx.beginPath(); ctx.ellipse(0, -35 * s, 18 * s, 4 * s, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#efe6d2'; ctx.lineWidth = 2.4 * s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-28 * s, -20 * s); ctx.quadraticCurveTo(-40 * s, -12 * s, -36 * s, -24 * s); ctx.stroke();
  ctx.strokeStyle = '#4a3a32'; ctx.lineWidth = 4 * s; ctx.beginPath(); ctx.moveTo(-30 * s, -22 * s); ctx.quadraticCurveTo(-34 * s, -6 * s, -30 * s + Math.sin(walk) * 2, -2 * s); ctx.stroke(); ctx.lineCap = 'butt';
  ctx.globalCompositeOperation = 'lighter'; drawGlow(-25 * s, -29 * s, 2.2 * s, '160,230,255', .9); ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
}
function drawSnowbird(f) {
  const s = f.s, fl = Math.sin(f.ph * 2.2) * .55;
  ctx.save(); ctx.translate(f.x, f.y + Math.sin(f.ph) * 6); ctx.globalAlpha = .85;
  ctx.strokeStyle = 'rgba(240,248,255,.9)'; ctx.lineWidth = 2 * s; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-16 * s, -fl * 14 * s); ctx.quadraticCurveTo(-7 * s, -4 * s, 0, 0); ctx.quadraticCurveTo(7 * s, -4 * s, 16 * s, -fl * 14 * s); ctx.stroke();
  ctx.fillStyle = '#f2f8ff'; ctx.beginPath(); ctx.ellipse(0, 1, 5 * s, 2.4 * s, 0, 0, TAU); ctx.fill();
  ctx.globalAlpha = 1; ctx.lineCap = 'butt'; ctx.restore();
}

