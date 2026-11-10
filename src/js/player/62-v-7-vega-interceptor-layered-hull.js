/* ---------- V-7 VEGA interceptor: layered hull, wingtip railgun pods, reactor core, energy conduits tinted by the active weapon ---------- */
// Liveries. Player 1 flies the standard silver V-7; player 2 the same airframe in bronze with a gold canopy, orange
// exhaust, amber wing stripes and longer swept tail fins, so the two ships read apart by colour and by outline.
// The energy conduits keep the active weapon's colour for both (that colour is gameplay information).
const LIVERY = [
  { tail: [[122, 134, 152], [38, 46, 60]], wing: [[170, 182, 200], [50, 59, 76]], canard: [[158, 170, 188], [58, 68, 86]],
    fus: ['#445067', '#f4f8fc', '#384356'], canopy: ['#d8fbff', '#2a84ad', '#061b29'],
    flame: ['80,170,255', '140,210,255', '40,90,255', '248,253,255', '130,210,255', '60,120,255', '225,245,255'], nozzle: '170,225,255',
    sFin: ['#adb9cb', '#384254'], sEngine: ['#7f8b9e', '#4a5568', '#1d232e'], sFus: ['#e0e7f1', '#f7fafd', '#7b879a', '#384253'], sWing: ['#b6c2d3', '#414c5e'], sFar: '#27303c',
    stripe: null, longFins: false },
  { tail: [[176, 120, 70], [58, 34, 18]], wing: [[214, 160, 102], [72, 46, 26]], canard: [[200, 146, 92], [70, 46, 28]],
    fus: ['#6a4c30', '#fff3de', '#4c3420'], canopy: ['#fff4cf', '#c98a2c', '#2a1606'],
    flame: ['255,150,60', '255,190,120', '255,90,30', '255,250,240', '255,180,90', '255,100,40', '255,236,200'], nozzle: '255,210,150',
    sFin: ['#d6a571', '#4a3220'], sEngine: ['#a07f5c', '#6a4e34', '#2a1d12'], sFus: ['#e6c79c', '#fbecd4', '#98744d', '#4a3220'], sWing: ['#dcb184', '#5b4128'], sFar: '#3c2c1e',
    stripe: '255,179,71', longFins: true },
];
const livery = () => LIVERY[P.id] || LIVERY[0];
function shipAccent() { return P.weapon === 'ult' ? ULTC : P.weapon === 'beam' ? BEAMC : ION; }
function drawThrust(x, y, len, w, rot, boost) {
  const fc = livery().flame;
  ctx.save(); ctx.translate(x, y); if (rot) ctx.rotate(rot);
  drawGlow(0, 3, w * 3.4 + boost * 6, fc[0], .7);
  let g = ctx.createLinearGradient(0, 0, 0, len * 1.2);
  g.addColorStop(0, `rgba(${fc[1]},.6)`); g.addColorStop(1, `rgba(${fc[2]},0)`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-w * 1.3, 0); ctx.quadraticCurveTo(0, len * 1.3, w * 1.3, 0); ctx.fill();
  g = ctx.createLinearGradient(0, 0, 0, len * .75);
  g.addColorStop(0, `rgba(${fc[3]},1)`); g.addColorStop(.35, `rgba(${fc[4]},.9)`); g.addColorStop(1, `rgba(${fc[5]},0)`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-w * .72, 0); ctx.quadraticCurveTo(0, len * .9, w * .72, 0); ctx.fill();
  const ph = (S.t * 7) % 1;
  for (let i = 0; i < 3; i++) drawGlow(0, (i + .4 + ph * .25) * len * .21, w * (1.15 - i * .24), fc[6], .6 - i * .16);
  ctx.restore();
}
function drawVegaTop(sx, b, boost) {
  const LV = livery(), acc = shipAccent(), pw = .5 + .5 * clamp(P.lvl / 10, 0, 1), pul = .72 + .28 * Math.sin(S.t * 6), lw = P.lw || 1, ink = 'rgba(6,10,18,.8)';
  ctx.globalCompositeOperation = 'lighter';
  const fl = 16 + boost * 20 + Math.sin(S.t * 70) * 2.5;
  for (const s of [-1, 1]) drawThrust(s * 6.5 * sx, 25.5, fl, 3.1, 0, boost);
  if (P.muzzle > 0) { for (const s of [-1, 1]) { drawGlow(s * 7 * sx, -28, 10, acc, .9); drawGlow(s * 27.5 * sx, -16, 7, acc, .75); } }
  ctx.globalCompositeOperation = 'source-over';
  ctx.scale(sx, 1); ctx.lineWidth = lw; ctx.lineJoin = 'round';
  const metal = (s, x0, y0, x1, y1, a, c) => { const lit = 1 - s * b * .35, g = ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, `rgb(${a[0] * lit | 0},${a[1] * lit | 0},${a[2] * lit | 0})`); g.addColorStop(1, `rgb(${c[0] * lit | 0},${c[1] * lit | 0},${c[2] * lit | 0})`); return g; };
  // tail stabilizers
  for (const s of [-1, 1]) {
    if (LV.longFins) { ctx.beginPath(); ctx.moveTo(s * 6, 10); ctx.lineTo(s * 19.5, 27); ctx.lineTo(s * 18, 33.5); ctx.lineTo(s * 7, 24); ctx.closePath(); }
    else { ctx.beginPath(); ctx.moveTo(s * 6, 12); ctx.lineTo(s * 15.5, 24); ctx.lineTo(s * 14, 28.5); ctx.lineTo(s * 7, 23); ctx.closePath(); }
    ctx.fillStyle = metal(s, s * 6, 12, s * 15, 28, LV.tail[0], LV.tail[1]); ctx.fill(); ctx.strokeStyle = ink; ctx.stroke();
  }
  // main wings
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(s * 7, -9); ctx.lineTo(s * 29, 9); ctx.lineTo(s * 33, 13.5); ctx.lineTo(s * 32.5, 19); ctx.lineTo(s * 21, 18.5); ctx.lineTo(s * 17, 22); ctx.lineTo(s * 8, 20); ctx.closePath();
    ctx.fillStyle = metal(s, s * 7, -9, s * 30, 20, LV.wing[0], LV.wing[1]); ctx.fill(); ctx.strokeStyle = ink; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(s * 10, 9.5); ctx.lineTo(s * 28.5, 14); ctx.lineTo(s * 32.5, 19); ctx.lineTo(s * 21, 18.5); ctx.lineTo(s * 17, 22); ctx.lineTo(s * 8, 20); ctx.closePath();
    ctx.fillStyle = 'rgba(12,18,30,.32)'; ctx.fill();
    if (LV.stripe) { ctx.fillStyle = `rgba(${LV.stripe},.9)`; ctx.beginPath(); ctx.moveTo(s * 12, .8); ctx.lineTo(s * 26.8, 12.2); ctx.lineTo(s * 25.8, 14); ctx.lineTo(s * 11, 2.8); ctx.closePath(); ctx.fill(); }
    ctx.beginPath(); ctx.moveTo(s * 11, -1.5); ctx.lineTo(s * 25.5, 10); ctx.moveTo(s * 13, 6.5); ctx.lineTo(s * 16, 21); ctx.moveTo(s * 20.5, 8.5); ctx.lineTo(s * 22, 18.3);
    ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.stroke();
    ctx.fillStyle = 'rgba(10,14,22,.55)'; for (let i = 0; i < 4; i++) ctx.fillRect(s * (12.5 + i * 3.6) - .4, 3.4 + i * 3, .8, .8);
    ctx.fillStyle = 'rgba(255,179,71,.8)'; ctx.beginPath(); ctx.moveTo(s * 25.5, 16.2); ctx.lineTo(s * 28.6, 16.4); ctx.lineTo(s * 27.8, 18.3); ctx.lineTo(s * 24.8, 18.1); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#10151e'; ctx.beginPath(); ctx.moveTo(s * 8.4, -3.2); ctx.lineTo(s * 13, .8); ctx.lineTo(s * 13, 4); ctx.lineTo(s * 8.4, 1.4); ctx.closePath(); ctx.fill();
  }
  // wingtip railgun pods
  for (const s of [-1, 1]) {
    const x = s * 27.5;
    ctx.fillStyle = '#1d232c'; ctx.fillRect(x - .9, -15.5, 1.8, 13);
    ctx.fillStyle = '#6a768a'; ctx.fillRect(x - 1.5, -16, 3, 1.5); ctx.fillRect(x - 1.3, -10, 2.6, 1);
    const g = ctx.createLinearGradient(x - 2.5, 0, x + 2.5, 0); g.addColorStop(0, '#363f4e'); g.addColorStop(.5, '#b4bfcf'); g.addColorStop(1, '#262d39');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 2.5, -3.5); ctx.lineTo(x - 1.4, -5); ctx.lineTo(x + 1.4, -5); ctx.lineTo(x + 2.5, -3.5); ctx.lineTo(x + 2.5, 13); ctx.lineTo(x, 16.5); ctx.lineTo(x - 2.5, 13); ctx.closePath(); ctx.fill(); ctx.strokeStyle = ink; ctx.stroke();
    ctx.fillStyle = '#141922'; ctx.fillRect(x - 1.6, 1.6, 3.2, 3);
  }
  // canards + nose cannons
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(s * 4.4, -21.5); ctx.lineTo(s * 12.8, -15.5); ctx.lineTo(s * 12.2, -12.3); ctx.lineTo(s * 5, -13.8); ctx.closePath();
    ctx.fillStyle = metal(s, s * 4, -21, s * 12, -12, LV.canard[0], LV.canard[1]); ctx.fill(); ctx.strokeStyle = ink; ctx.stroke();
    ctx.fillStyle = '#1b2029'; ctx.fillRect(s * 7 - .8, -27.5, 1.6, 12.5); ctx.fillStyle = '#6b778a'; ctx.fillRect(s * 7 - 1.25, -28, 2.5, 1.3);
  }
  // engine nacelles
  for (const s of [-1, 1]) {
    const x = s * 6.5, g = ctx.createLinearGradient(x - 3.8, 0, x + 3.8, 0);
    g.addColorStop(0, '#37414f'); g.addColorStop(.45, '#a1adbf'); g.addColorStop(1, '#232a35');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 3.2, 2.5); ctx.lineTo(x + 3.2, 2.5); ctx.lineTo(x + 3.9, 21.5); ctx.lineTo(x + 2.9, 25.6); ctx.lineTo(x - 2.9, 25.6); ctx.lineTo(x - 3.9, 21.5); ctx.closePath(); ctx.fill(); ctx.strokeStyle = ink; ctx.stroke();
    ctx.strokeStyle = 'rgba(10,14,22,.55)'; ctx.beginPath(); for (const y of [9, 12.5, 16, 19.5]) { ctx.moveTo(x - 3.5, y); ctx.lineTo(x + 3.5, y); } ctx.stroke();
    ctx.fillStyle = '#0c1017'; ctx.fillRect(x - 2.9, 24.2, 5.8, 1.9);
  }
  // fuselage
  ctx.beginPath(); ctx.moveTo(0, -37.5); ctx.bezierCurveTo(3, -31, 6, -20, 7, -8); ctx.lineTo(8, 6); ctx.lineTo(6.5, 18); ctx.lineTo(4, 24); ctx.lineTo(-4, 24); ctx.lineTo(-6.5, 18); ctx.lineTo(-8, 6); ctx.lineTo(-7, -8); ctx.bezierCurveTo(-6, -20, -3, -31, 0, -37.5); ctx.closePath();
  const fg = ctx.createLinearGradient(-8, 0, 8, 0); fg.addColorStop(0, LV.fus[0]); fg.addColorStop(clamp(.42 - b * .2, .15, .85), LV.fus[1]); fg.addColorStop(1, LV.fus[2]);
  ctx.fillStyle = fg; ctx.fill(); ctx.strokeStyle = ink; ctx.stroke();
  ctx.fillStyle = '#1a2029'; ctx.beginPath(); ctx.moveTo(0, -37.5); ctx.lineTo(1.7, -32); ctx.lineTo(-1.7, -32); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(28,36,50,.28)'; ctx.beginPath(); ctx.moveTo(-6.6, -4); ctx.lineTo(-2.4, -4); ctx.lineTo(-2.4, 22); ctx.lineTo(-4, 24); ctx.lineTo(-6.5, 18); ctx.lineTo(-8, 6); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(25,34,48,.42)'; ctx.beginPath();
  ctx.moveTo(-5.6, -27.5); ctx.lineTo(0, -30); ctx.lineTo(5.6, -27.5); ctx.moveTo(-7.6, 10); ctx.lineTo(7.6, 10); ctx.moveTo(-6.7, 17); ctx.lineTo(6.7, 17); ctx.moveTo(6.8, -4); ctx.lineTo(7.8, 8); ctx.stroke();
  ctx.fillStyle = '#212833'; ctx.beginPath(); ctx.moveTo(-1.8, -3); ctx.lineTo(1.8, -3); ctx.lineTo(2.4, 22); ctx.lineTo(-2.4, 22); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#141922'; for (const s of [-1, 1]) for (let i = 0; i < 3; i++) ctx.fillRect(s * 4.6 - .55, 11.6 + i * 1.9, 1.1, 1.1);
  ctx.beginPath(); ctx.arc(0, 2.2, 3.4, 0, TAU); ctx.fillStyle = '#12171f'; ctx.fill(); ctx.strokeStyle = 'rgba(160,175,195,.55)'; ctx.stroke();
  // canopy
  ctx.beginPath(); ctx.moveTo(0, -27); ctx.lineTo(3.3, -20); ctx.lineTo(3.6, -10); ctx.lineTo(0, -5.5); ctx.lineTo(-3.6, -10); ctx.lineTo(-3.3, -20); ctx.closePath();
  const cg = ctx.createLinearGradient(0, -27, 0, -5); cg.addColorStop(0, LV.canopy[0]); cg.addColorStop(.45, LV.canopy[1]); cg.addColorStop(1, LV.canopy[2]);
  ctx.fillStyle = cg; ctx.fill(); ctx.strokeStyle = '#18202b'; ctx.lineWidth = lw * 1.4; ctx.stroke(); ctx.lineWidth = lw;
  ctx.strokeStyle = 'rgba(18,28,42,.75)'; ctx.beginPath(); ctx.moveTo(-3.45, -15); ctx.lineTo(3.45, -15); ctx.moveTo(0, -27); ctx.lineTo(0, -15); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.78)'; ctx.beginPath(); ctx.moveTo(-1.1, -24.5); ctx.lineTo(-.3, -24.8); ctx.lineTo(-2.3, -17.2); ctx.lineTo(-2.9, -17.6); ctx.closePath(); ctx.fill();
  // energy: leading edges, conduits, reactor, pods, intakes
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = "round"; ctx.lineWidth = 1.3;
  for (const s of [-1, 1]) {
    ctx.strokeStyle = `rgba(${acc},${.6 * pw})`; ctx.beginPath(); ctx.moveTo(s * 8.2, -7.6); ctx.lineTo(s * 29.3, 9.9); ctx.stroke();
    ctx.strokeStyle = `rgba(${acc},${.35 * pw})`; ctx.beginPath(); ctx.moveTo(s * 2.6, 0); ctx.lineTo(s * 6.5, 6); ctx.lineTo(s * 6.5, 20); ctx.stroke();
    drawGlow(s * 27.5, 3.1, 4.2, acc, .85 * pw * pul); drawGlow(s * 27.5, 3.1, 1.4, WHITE, .9);
    drawGlow(s * 6.5, 3.4, 3.4, acc, .55 * pw);
    drawGlow(s * 6.5, 25.2, 3.8, LV.nozzle, .95);
    for (let i = 0; i < 3; i++) drawGlow(s * (10.5 + i * 2.6), 11 + i * 2.6, 1.7, acc, (.35 + .45 * (((S.t * 3 + i * .33) % 1) > .5)) * pw);
    const t = (S.t * 1.6 + (s > 0 ? .5 : 0)) % 1; drawGlow(s * (8.2 + 21.1 * t), -7.6 + 17.5 * t, 3, acc, .8 * pw);
  }
  for (let k = 0; k < 3; k++) drawGlow(0, -1.5 + ((S.t * 34 + k * 8) % 24), 2.4, acc, .85 * pw);
  drawGlow(0, 2.2, 8.5, acc, .55 * pul * pw); drawGlow(0, 2.2, 2.6, WHITE, .95);
  drawGlow(0, -34.5, 2.2, acc, .8); drawGlow(0, -16, 3.2, acc, .25 + .15 * pul);
  if (S.t % 1.1 < .1) { drawGlow(-32.8, 16.5, 8, '255,60,60', 1); drawGlow(32.8, 16.5, 8, '60,255,120', 1); }
  if ((S.t + .55) % 1.1 < .07) drawGlow(0, 26.5, 7, WHITE, .9);
  ctx.lineCap = 'butt'; ctx.lineWidth = lw;
  ctx.globalCompositeOperation = 'source-over';
}
function drawSideShip(boost) {
  ctx.rotate(clamp((P.vy || 0) / 900, -.16, .16));
  ctx.lineJoin = 'round'; ctx.lineWidth = 1;
  const LV = livery(), acc = shipAccent(), pw = .5 + .5 * clamp(P.lvl / 10, 0, 1), pul = .72 + .28 * Math.sin(S.t * 6), ink = 'rgba(6,10,18,.8)';
  ctx.globalCompositeOperation = 'lighter';
  const fl = 18 + boost * 22 + Math.sin(S.t * 70) * 3;
  drawThrust(-29.5, -2.6, fl, 3.1, Math.PI / 2, boost); drawThrust(-29, 3.2, fl * .9, 2.7, Math.PI / 2, boost);
  if (P.muzzle > 0) { drawGlow(37, -.4, 11, acc, .9); drawGlow(33, 5, 8, acc, .75); }
  ctx.globalCompositeOperation = 'source-over';
  let g;
  // far wing
  ctx.beginPath(); ctx.moveTo(6, -3); ctx.lineTo(-10, -11.5); ctx.lineTo(-19, -11.8); ctx.lineTo(-12.5, -3.5); ctx.closePath();
  ctx.fillStyle = LV.sFar; ctx.fill(); ctx.strokeStyle = ink; ctx.stroke();
  // tail fin (player 2: taller and swept further back)
  ctx.beginPath();
  if (LV.longFins) { ctx.moveTo(-10, -5); ctx.lineTo(-23, -21.5); ctx.lineTo(-31.5, -22); ctx.lineTo(-26.5, -4.6); }
  else { ctx.moveTo(-10, -5); ctx.lineTo(-21, -17.5); ctx.lineTo(-28.2, -18); ctx.lineTo(-25.8, -4.6); }
  ctx.closePath();
  g = ctx.createLinearGradient(0, -18, 0, -4); g.addColorStop(0, LV.sFin[0]); g.addColorStop(1, LV.sFin[1]);
  ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = ink; ctx.stroke();
  ctx.fillStyle = '#1b212a'; ctx.beginPath(); ctx.moveTo(-19.6, -15.4); ctx.lineTo(-27.6, -15.6); ctx.lineTo(-27.3, -13.8); ctx.lineTo(-18.2, -13.7); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.beginPath(); ctx.moveTo(-12.5, -6.5); ctx.lineTo(-21.5, -16.6); ctx.stroke();
  // engine block
  g = ctx.createLinearGradient(0, -6, 0, 8); g.addColorStop(0, LV.sEngine[0]); g.addColorStop(.5, LV.sEngine[1]); g.addColorStop(1, LV.sEngine[2]);
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-6, -5.6); ctx.lineTo(-24, -6.1); ctx.lineTo(-28.6, -3.2); ctx.lineTo(-28.6, 6.2); ctx.lineTo(-24, 7.6); ctx.lineTo(-6, 7.9); ctx.closePath(); ctx.fill(); ctx.strokeStyle = ink; ctx.stroke();
  ctx.strokeStyle = 'rgba(10,14,22,.6)'; ctx.beginPath(); for (const x of [-12, -15.5, -19, -22.5]) { ctx.moveTo(x, -5.8); ctx.lineTo(x, 7.6); } ctx.stroke();
  ctx.fillStyle = '#0e1219'; ctx.fillRect(-30.6, -5.7, 3, 6.1); ctx.fillRect(-30.2, .6, 2.9, 5.2);
  // fuselage
  ctx.beginPath(); ctx.moveTo(38, 1); ctx.bezierCurveTo(30, -2.8, 21, -5.4, 10, -5.8); ctx.lineTo(-9, -5.8); ctx.lineTo(-13, -4.2); ctx.lineTo(-13, 6.6); ctx.lineTo(-3, 7.8); ctx.lineTo(15, 6.8); ctx.bezierCurveTo(25, 5.8, 32, 3.6, 38, 1); ctx.closePath();
  g = ctx.createLinearGradient(0, -6, 0, 8); g.addColorStop(0, LV.sFus[0]); g.addColorStop(.33, LV.sFus[1]); g.addColorStop(.7, LV.sFus[2]); g.addColorStop(1, LV.sFus[3]);
  ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = ink; ctx.stroke();
  ctx.fillStyle = '#1a2029'; ctx.beginPath(); ctx.moveTo(38, 1); ctx.bezierCurveTo(36, -.3, 34, -1.1, 32.4, -1.4); ctx.lineTo(32.4, 2.9); ctx.bezierCurveTo(34.4, 2.4, 36.2, 1.8, 38, 1); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(28,36,50,.32)'; ctx.beginPath(); ctx.moveTo(1, -5.8); ctx.lineTo(-12.6, -5.8); ctx.lineTo(-12.6, -2); ctx.lineTo(1, -2.7); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(28,38,54,.4)'; ctx.beginPath(); for (const x of [26, 17, 5, -6]) { ctx.moveTo(x, x > 20 ? -3.4 : -5.4); ctx.lineTo(x - 1, x > 20 ? 5.2 : 7.2); } ctx.stroke();
  ctx.fillStyle = '#141922'; for (let i = 0; i < 4; i++) ctx.fillRect(-3.5 - i * 2.2, -1.2, 1.1, 3.4);
  ctx.fillStyle = 'rgba(255,179,71,.85)'; ctx.fillRect(27, -2.7, 2.6, 1); ctx.fillRect(23.5, -3.4, 2.6, 1);
  // canopy
  const cg = ctx.createLinearGradient(0, -12.5, 0, -4); cg.addColorStop(0, LV.canopy[0]); cg.addColorStop(.5, LV.canopy[1]); cg.addColorStop(1, LV.canopy[2]);
  ctx.fillStyle = cg; ctx.beginPath(); ctx.moveTo(25, -4.6); ctx.lineTo(17, -10.6); ctx.lineTo(8, -12.2); ctx.lineTo(1.5, -6); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#18202b'; ctx.lineWidth = 1.4; ctx.stroke(); ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(18,28,42,.75)'; ctx.beginPath(); ctx.moveTo(14, -11.2); ctx.lineTo(12.5, -5.2); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.78)'; ctx.beginPath(); ctx.moveTo(18.6, -9.2); ctx.lineTo(16.2, -10.6); ctx.lineTo(9.2, -11.3); ctx.lineTo(9.6, -10.3); ctx.closePath(); ctx.fill();
  // under-nose railgun
  ctx.fillStyle = '#3a4352'; ctx.beginPath(); ctx.moveTo(22, 3.4); ctx.lineTo(10, 3.6); ctx.lineTo(9, 7); ctx.lineTo(20, 6.6); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#232a35'; ctx.fillRect(12, 4.4, 20.5, 1.9); ctx.fillStyle = '#6b778a'; ctx.fillRect(31.5, 3.9, 2.2, 2.8); ctx.fillRect(25, 4.1, 1.2, 2.4);
  // near wing + wing pod
  ctx.beginPath(); ctx.moveTo(8, 3.2); ctx.lineTo(-12, 15.5); ctx.lineTo(-21.5, 16); ctx.lineTo(-14, 4.2); ctx.closePath();
  g = ctx.createLinearGradient(8, 3, -20, 15); g.addColorStop(0, LV.sWing[0]); g.addColorStop(1, LV.sWing[1]);
  ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = ink; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.16)'; ctx.beginPath(); ctx.moveTo(2, 6.4); ctx.lineTo(-13, 13.6); ctx.stroke();
  if (LV.stripe) { ctx.fillStyle = `rgba(${LV.stripe},.9)`; ctx.beginPath(); ctx.moveTo(4.5, 5.6); ctx.lineTo(-12.8, 16); ctx.lineTo(-15, 16); ctx.lineTo(2, 5.6); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = '#272e39'; ctx.fillRect(-20, 15.6, 13, 2.5); ctx.fillStyle = '#626e81'; ctx.fillRect(-7.2, 15.9, 3.4, 1.9);
  const bay = clamp(P.bayT || 0, 0, .4) / .4;
  ctx.fillStyle = '#1a1f28'; ctx.fillRect(-7, 6.8, 14, 2.2 + bay * 2.4);
  if (bay > 0) { ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 9.5, 11, FLARE, bay); ctx.globalCompositeOperation = 'source-over'; }
  ctx.fillStyle = '#5c6779'; ctx.fillRect(-7 - bay * 3, 6.8 + bay * 3.2, 6.5, 1.5); ctx.fillRect(.5 + bay * 3, 6.8 + bay * 3.2, 6.5, 1.5);
  // energy
  ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  ctx.strokeStyle = `rgba(${acc},${.75 * pw})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(30, 1.8); ctx.lineTo(-12, 2.6); ctx.stroke();
  ctx.strokeStyle = `rgba(${acc},${.55 * pw})`; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(7, 3.5); ctx.lineTo(-11.6, 15); ctx.stroke();
  ctx.fillStyle = `rgba(${acc},${.9 * pw})`; ctx.beginPath(); ctx.moveTo(-19.8, -15.1); ctx.lineTo(-27.2, -15.3); ctx.lineTo(-27, -14.1); ctx.lineTo(-18.6, -14); ctx.closePath(); ctx.fill();
  for (let k = 0; k < 3; k++) { const x = 28 - ((S.t * 46 + k * 14) % 40); drawGlow(x, 1.8 + (28 - x) * .019, 2.6, acc, .85 * pw); }
  drawGlow(-1, -3.6, 6.5, acc, .5 * pul * pw); drawGlow(-1, -3.6, 2, WHITE, .85);
  drawGlow(26, 5.2, 2.4, acc, .8 * pw); drawGlow(-13, 16.8, 2.6, acc, .7 * pw * pul);
  drawGlow(-29.5, -2.6, 3.4, LV.nozzle, .95); drawGlow(-29, 3.2, 3, LV.nozzle, .9);
  if (S.t % 1.1 < .1) { drawGlow(-27, -17.6, 7, '255,60,60', 1); drawGlow(-20.5, 16.4, 7, '60,255,120', 1); }
  if ((S.t + .55) % 1.1 < .07) drawGlow(-28.5, 6.5, 6, WHITE, .9);
  ctx.lineCap = 'butt'; ctx.lineWidth = 1; ctx.globalCompositeOperation = 'source-over';
}
function drawPlayer() {
  if (!P.alive) return;
  if (P.inv > 0 && S.mode === 'play' && P.inv < 1.2 && P.hitT <= 0 && ((S.t * 20) | 0) % 2 && P.inv > .4) return;
  const boost = clamp((S.side ? (P.evx || 0) : -(P.evy || 0)) / 430, 0, 1);
  ctx.save(); ctx.translate(P.x, P.y);
  let capP = 0;
  if (S.side && !P.cap) drawSideShip(boost); else {
  if (P.cap) { capP = clamp(P.cap.t / P.cap.dur, 0, 1); const h = P.cap.h, sc = 1 - .92 * Math.pow(capP, 1.25); ctx.rotate(Math.atan2(h.y - P.y, h.x - P.x) + Math.PI / 2); ctx.scale(sc * (1 - .45 * capP), sc * (1 + 1.6 * capP)); }
  const sx = 1 - Math.abs(P.bank) * .28, b = P.bank;
  drawVegaTop(sx, b, boost);
  }
  ctx.restore();
  if (P.cap) { ctx.globalCompositeOperation = 'lighter'; drawGlow(P.x, P.y, 34 * (1 - capP * .6), '255,110,60', .3 + capP * .5); ctx.globalCompositeOperation = 'source-over'; return; }
  // hit flash
  if (P.hitT > 0) { ctx.globalCompositeOperation = 'lighter'; drawGlow(P.x, P.y, 46, '255,120,90', P.hitT * 2); ctx.globalCompositeOperation = 'source-over'; }
  // shield
  if (P.shield > 1) {
    const a = .07 + (P.shield / 100) * .06 + Math.max(0, P.shieldHit) * 1.6;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(P.x, P.y, 26, P.x, P.y, 42);
    g.addColorStop(0, 'rgba(94,242,255,0)'); g.addColorStop(.75, `rgba(94,242,255,${a})`); g.addColorStop(1, 'rgba(94,242,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(P.x, P.y, 42, 0, TAU); ctx.fill();
    if (P.shieldHit > 0) {
      ctx.strokeStyle = `rgba(190,250,255,${P.shieldHit * 1.8})`; ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) { const an = i / 6 * TAU + S.t; ctx.lineTo(P.x + Math.cos(an) * 39, P.y + Math.sin(an) * 39); }
      ctx.closePath(); ctx.stroke();
    }
    ctx.restore();
  }
}

function drawShip(e) {
  if (e.surf) { if (e.x > -e.hw * 2 - 60 && e.x < W + e.hw * 2 + 60) drawSideUnit(e); return; }
  ctx.save(); ctx.translate(e.x, e.y);
  if (e.cap) {
    const p = clamp(e.cap.t / e.cap.dur, 0, 1), h = e.cap.h, s = 1 - .9 * Math.pow(p, 1.2);
    ctx.rotate(Math.atan2(h.y - e.y, h.x - e.x) - Math.PI / 2); ctx.scale(s * (1 - .4 * p), s * (1 + 1.4 * p));
  }
  const pulse = .75 + .25 * Math.sin(e.t * 6 + e.ph);
  if (e.type === 'drone') {
    ctx.rotate(Math.cos(e.t * e.wf + e.ph) * .22);
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(0, -13, 13, PLASMA, .55); drawGlow(-12, -10, 6, PLASMA, .5); drawGlow(12, -10, 6, PLASMA, .5);
    ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath(); ctx.moveTo(0, 19); ctx.quadraticCurveTo(10, 8, 18, -10); ctx.lineTo(9, -6); ctx.quadraticCurveTo(4, -15, 0, -16);
    ctx.quadraticCurveTo(-4, -15, -9, -6); ctx.lineTo(-18, -10); ctx.quadraticCurveTo(-10, 8, 0, 19); ctx.closePath();
    const g = ctx.createRadialGradient(-4, -6, 2, 0, 0, 20); g.addColorStop(0, '#6d4a90'); g.addColorStop(1, '#170c26');
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(255,79,216,.45)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-12, -6); ctx.quadraticCurveTo(-4, 4, 0, 14); ctx.quadraticCurveTo(4, 4, 12, -6); ctx.strokeStyle = 'rgba(255,79,216,.25)'; ctx.stroke();
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(0, 1, 11, e.needle ? '255,120,235' : PLASMA, pulse); drawGlow(0, 1, 3, WHITE, 1);
  } else if (e.type === 'raider') {
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(-9, -20, 12, PLASMA, .6); drawGlow(9, -20, 12, PLASMA, .6);
    ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath(); ctx.moveTo(0, -22); ctx.lineTo(13, -17); ctx.lineTo(27, 2); ctx.lineTo(21, 25); ctx.lineTo(14, 9); ctx.lineTo(6, 14); ctx.lineTo(0, 10);
    ctx.lineTo(-6, 14); ctx.lineTo(-14, 9); ctx.lineTo(-21, 25); ctx.lineTo(-27, 2); ctx.lineTo(-13, -17); ctx.closePath();
    const g = ctx.createLinearGradient(-27, -20, 27, 20); g.addColorStop(0, '#5a4672'); g.addColorStop(.5, '#2b1f3c'); g.addColorStop(1, '#120a1c');
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(255,120,230,.45)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#1a1126'; ctx.beginPath(); ctx.ellipse(0, -3, 7, 11, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(-8, -4); ctx.moveTo(20, 0); ctx.lineTo(8, -4); ctx.strokeStyle = 'rgba(255,79,216,.5)'; ctx.stroke();
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(0, -2, 13, PLASMA, pulse); drawGlow(-21, 22, 6, PLASMA, pulse); drawGlow(21, 22, 6, PLASMA, pulse); drawGlow(0, -2, 3.5, WHITE, 1);
  } else if (e.type === 'gunship') {
    ctx.globalCompositeOperation = 'lighter';
    for (const s of [-1, 1]) drawGlow(s * 18, -34, 16, FLARE, .55);
    ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath();
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + TAU / 16; ctx.lineTo(Math.cos(a) * 40, Math.sin(a) * 32); }
    ctx.closePath();
    const g = ctx.createRadialGradient(-12, -10, 4, 0, 0, 44); g.addColorStop(0, '#6b5866'); g.addColorStop(.6, '#2e2433'); g.addColorStop(1, '#130d17');
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(255,179,71,.4)'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,.45)';
    for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + TAU / 8; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 16, Math.sin(a) * 13); ctx.lineTo(Math.cos(a) * 38, Math.sin(a) * 30); ctx.stroke(); }
    ctx.save(); ctx.rotate(e.t * .8);
    ctx.strokeStyle = 'rgba(255,179,71,.35)'; ctx.setLineDash([5, 6]); ctx.beginPath(); ctx.arc(0, 0, 22, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + TAU / 8; drawGlow(Math.cos(a) * 28, Math.sin(a) * 22, 7, FLARE, pulse * .8); }
    ctx.globalCompositeOperation = 'source-over';
    ctx.save(); ctx.rotate(e.aim - Math.PI / 2);
    ctx.fillStyle = '#3a2f3d'; ctx.fillRect(-3, 6, 6, 22);
    ctx.fillStyle = '#20181f'; ctx.beginPath(); ctx.arc(0, 0, 11, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(0, 0, 10, FLARE, pulse); drawGlow(0, 0, 3, WHITE, 1);
  } else if (e.type === 'lancer') {
    const ch = e.charging ? 1 : 0;
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(-6, -24, 11, '120,235,255', .6); drawGlow(6, -24, 11, '120,235,255', .6);
    ctx.globalCompositeOperation = 'source-over';
    for (const s of [-1, 1]) { ctx.fillStyle = '#1d2a35'; ctx.beginPath(); ctx.moveTo(s * 8, -6); ctx.lineTo(s * 26, -16); ctx.lineTo(s * 22, 4); ctx.lineTo(s * 9, 8); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(120,235,255,.35)'; ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(0, -26); ctx.lineTo(10, -10); ctx.lineTo(12, 8); ctx.lineTo(5, 16); ctx.lineTo(-5, 16); ctx.lineTo(-12, 8); ctx.lineTo(-10, -10); ctx.closePath();
    const g = ctx.createLinearGradient(-12, 0, 12, 0); g.addColorStop(0, '#22323f'); g.addColorStop(.45, '#5d7a8c'); g.addColorStop(1, '#16222c');
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(120,235,255,.5)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.save(); ctx.translate(0, 8); ctx.rotate(e.aim - Math.PI / 2);
    ctx.fillStyle = '#2b3b47'; ctx.fillRect(-3, 0, 6, 20); ctx.fillStyle = 'rgba(120,235,255,.7)'; ctx.fillRect(-1, 4, 2, 15);
    ctx.restore();
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(0, -2, 10 + ch * 8, '120,235,255', pulse * (.7 + ch * .5)); drawGlow(0, -2, 3, WHITE, 1);
  } else if (HIVE_TYPES.has(e.type)) drawHive(e, pulse);
  else if (CRYO_TYPES.has(e.type)) drawCryo(e, pulse);
  else if (e.type === 'boss') {
    if (e.kind === 'fortress') drawFortress(e, pulse);
    else if (e.kind === 'scarab') drawScarab(e, pulse);
    else if (e.kind === 'medusa') drawMedusa(e, pulse);
    else if (e.kind === 'prismarch') drawPrismarch(e, pulse);
    else if (e.kind === 'omega') drawOmega(e, pulse);
    else if (e.kind === 'god') drawGod(e, pulse);
    else if (e.kind === 'glacier') drawGlacier(e, pulse);
    else if (e.kind === 'aurora') drawAuroraBoss(e, pulse);
    else if (e.kind === 'zenith') drawZenith(e, pulse);
    else if (e.kind === 'colossus') drawColossus(e, pulse);
    else if (e.kind === 'hydra') drawHydra(e, pulse);
    else if (e.kind === 'leviathan') drawLeviathan(e, pulse);
    else if (e.sideBoss) drawSideMini(e, pulse);
    else if (e.gate) (e.theme === 3 ? drawGateC : e.theme === 2 ? drawGateB : drawGate)(e, pulse);
    else if (e.kind === 'core') (e.theme === 3 ? drawZero : e.theme === 2 ? drawHiveMind : drawCore)(e, pulse);
    else drawSiren(e, pulse);
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
  if (e.hitT > 0 && e.type !== 'boss') { ctx.globalCompositeOperation = 'lighter'; drawGlow(e.x, e.y, e.r * 1.3, WHITE, e.hitT * 4); ctx.globalCompositeOperation = 'source-over'; }
  if (e.hitT > 0 && e.type === 'boss' && !e.shield && e.kind !== 'omega' && e.kind !== 'god') { ctx.globalCompositeOperation = 'lighter'; drawGlow(e.x, e.y, e.hw * .9, WHITE, e.hitT * 2); ctx.globalCompositeOperation = 'source-over'; }
  if (e.escort && !e.dead) drawMiniBar(e.x, e.y - e.hh * 1.3 - 14, Math.max(56, e.hw * 1.1), e.hp / e.maxhp, MINI_COL[e.kind]);
  if ((e.type === 'gunship' || e.type === 'lancer' || e.type === 'brood' || e.type === 'mantis' || e.type === 'prism') && e.hp < e.maxhp && !e.cap) drawMiniBar(e.x, e.y - e.r - 12, e.type === 'brood' ? 60 : 46, e.hp / e.maxhp, e.type === 'lancer' ? '120,235,255' : HIVE_TYPES.has(e.type) ? HIVE : FLARE);
}
function bossCol(e) { return e.phase === 3 ? WARN : PLASMA; }
function drawSiren(e, pulse) {
  const R = e.r, dmg = 1 - e.hp / e.maxhp, C = bossCol(e);
  ctx.globalCompositeOperation = 'lighter';
  for (const s of [-1, -.4, .4, 1]) drawGlow(s * R * .5, -R * .42, R * .28, C, .45);
  ctx.globalCompositeOperation = 'source-over';
  for (const s of [-1, 1]) {
    ctx.fillStyle = '#21162e'; ctx.beginPath(); ctx.ellipse(s * R * .74, R * .1, R * .13, R * .24, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(255,79,216,.4)'; ctx.stroke();
    ctx.fillStyle = '#2b1f3a'; ctx.fillRect(s * R * .42 - R * .06, -R * .44, R * .12, R * .16);
  }
  ctx.beginPath(); ctx.ellipse(0, 0, R, R * .42, 0, 0, TAU);
  const g = ctx.createLinearGradient(0, -R * .42, 0, R * .42);
  g.addColorStop(0, '#6d5a88'); g.addColorStop(.45, '#2c2140'); g.addColorStop(1, '#0e0818');
  ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = `rgba(${C},.5)`; ctx.lineWidth = 1.4; ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 1;
  for (let i = 1; i < 8; i++) { const x = -R + i * R / 4; const yy = R * .42 * Math.sqrt(Math.max(0, 1 - (x / R) ** 2)); ctx.beginPath(); ctx.moveTo(x, -yy); ctx.lineTo(x, yy); ctx.stroke(); }
  ctx.beginPath(); ctx.ellipse(0, 0, R * .78, R * .28, 0, 0, TAU); ctx.strokeStyle = `rgba(${C},.25)`; ctx.stroke();
  // belly cannon
  ctx.fillStyle = '#1a1024'; ctx.beginPath(); ctx.ellipse(0, R * .36, R * .14, R * .09, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = `rgba(${C},.5)`; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, -R * .08, R * .3, R * .2, 0, 0, TAU);
  const dg = ctx.createRadialGradient(-R * .08, -R * .16, 2, 0, -R * .08, R * .3);
  dg.addColorStop(0, '#a58bc0'); dg.addColorStop(1, '#2a1c3a'); ctx.fillStyle = dg; ctx.fill();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 18; i++) { const a = i / 18 * TAU + e.t * .7; const x = Math.cos(a) * R * .9, y = Math.sin(a) * R * .38; if (Math.sin(a) > -.2) drawGlow(x, y, 5, i % 3 ? C : FLARE, .7); }
  drawGlow(0, R * .12, R * (.35 + dmg * .25), C, pulse * (.7 + dmg * .5));
  drawGlow(0, R * .12, R * .08, WHITE, 1);
  for (const s of [-1, 1]) drawGlow(s * R * .74, R * .26, 10, C, pulse);
  drawGlow(0, R * .4, R * .1, C, pulse);
  if (dmg > .5 && rnd() < .3) sparks(e.x + rand(-R, R) * .7, e.y + rand(-R, R) * .3, 2, FIRE);
}
function drawHydra(e, pulse) {
  const w = e.hw, h = e.hh, dmg = 1 - e.hp / e.maxhp, C = e.phase === 3 ? WARN : FLARE;
  ctx.globalCompositeOperation = 'lighter';
  for (const x of [-.62, -.22, .22, .62]) { drawGlow(x * w, -h * .95, h * .55, C, .55); drawGlow(x * w, -h * .95, h * .2, WHITE, .5); }
  ctx.globalCompositeOperation = 'source-over';
  const hull = () => { ctx.beginPath(); const pts = [[-1, -.2], [-.84, -.72], [-.32, -.98], [.32, -.98], [.84, -.72], [1, -.2], [.88, .45], [.4, .72], [.12, .82], [0, 1.08], [-.12, .82], [-.4, .72], [-.88, .45]]; pts.forEach(([a, b], i) => i ? ctx.lineTo(a * w, b * h) : ctx.moveTo(a * w, b * h)); ctx.closePath(); };
  hull();
  const g = ctx.createLinearGradient(0, -h, 0, h);
  g.addColorStop(0, '#6c7482'); g.addColorStop(.45, '#323947'); g.addColorStop(1, '#11141b');
  ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = `rgba(${C},.5)`; ctx.lineWidth = 1.4; ctx.stroke();
  ctx.save(); hull(); ctx.clip();
  ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = 1;
  for (let i = -6; i <= 6; i++) { ctx.beginPath(); ctx.moveTo(i * w / 6, -h); ctx.lineTo(i * w / 6 * 1.05, h); ctx.stroke(); }
  for (const y of [-.45, .05, .5]) { ctx.beginPath(); ctx.moveTo(-w, y * h); ctx.lineTo(w, y * h); ctx.stroke(); }
  const sp = ctx.createLinearGradient(-w * .07, 0, w * .07, 0); sp.addColorStop(0, '#3c4352'); sp.addColorStop(.5, '#8d96a6'); sp.addColorStop(1, '#2b303b');
  ctx.fillStyle = sp; ctx.fillRect(-w * .07, -h * .9, w * .14, h * 1.8);
  ctx.restore();
  // bridge windows
  ctx.globalCompositeOperation = 'lighter';
  for (let i = -3; i <= 3; i++) drawGlow(i * w * .035, -h * .55, 3, '255,230,180', .8);
  for (const s of [-1, 1]) for (let i = 0; i < 5; i++) drawGlow(s * w * (.3 + i * .1), h * (.25 + (i % 2) * .06), 2.6, i % 2 ? C : '255,230,180', pulse * .8);
  ctx.globalCompositeOperation = 'source-over';
  // bow cannons
  for (const s of [-1, 1]) { ctx.fillStyle = '#20242d'; ctx.fillRect(s * w * .9 - 5, h * .15, 10, h * .4); ctx.globalCompositeOperation = 'lighter'; drawGlow(s * w * .9, h * .55, 8, C, pulse); ctx.globalCompositeOperation = 'source-over'; }
  // turrets
  for (const p of e.parts) {
    ctx.save(); ctx.translate(p.ox, p.oy);
    if (p.dead) {
      ctx.fillStyle = '#0b0b0e'; ctx.beginPath(); ctx.arc(0, 0, p.r * .8, 0, TAU); ctx.fill();
      ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, p.r, '255,120,40', .25 + .2 * rnd());
      if (rnd() < .25) sparks(e.x + p.ox, e.y + p.oy, 1, FIRE);
    } else {
      const tg = ctx.createRadialGradient(-p.r * .3, -p.r * .3, 1, 0, 0, p.r);
      tg.addColorStop(0, '#9aa3b2'); tg.addColorStop(1, '#2a2f3a');
      ctx.fillStyle = tg; ctx.beginPath(); ctx.arc(0, 0, p.r, 0, TAU); ctx.fill(); ctx.strokeStyle = `rgba(${C},.6)`; ctx.lineWidth = 1.4; ctx.stroke();
      ctx.save(); ctx.rotate(p.aim - Math.PI / 2); ctx.fillStyle = '#1b1f27'; ctx.fillRect(-p.r * .32, 0, p.r * .22, p.r * 1.5); ctx.fillRect(p.r * .1, 0, p.r * .22, p.r * 1.5); ctx.restore();
      ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, p.r * .5, C, pulse * .8);
      if (p.hitT > 0) drawGlow(0, 0, p.r * 1.3, WHITE, p.hitT * 5);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(-p.r, -p.r - 7, p.r * 2, 3); ctx.fillStyle = `rgb(${C})`; ctx.fillRect(-p.r, -p.r - 7, p.r * 2 * clamp(p.hp / p.maxhp, 0, 1), 3);
    }
    ctx.restore();
  }
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(0, h * 1.12, h * .3, '255,70,110', pulse);
  if (dmg > .4 && rnd() < .35) sparks(e.x + rand(-w, w) * .8, e.y + rand(-h, h) * .6, 2, FIRE);
}
function drawLeviathan(e, pulse) {
  const R = e.r, C = e.phase === 3 ? WARN : '150,255,200', C2 = e.phase === 3 ? '255,150,80' : '120,170,255';
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(0, 0, R * 1.5, C2, .35);
  ctx.globalCompositeOperation = 'source-over';
  // membrane body
  const mg = ctx.createRadialGradient(0, -R * .2, R * .1, 0, 0, R * .95);
  mg.addColorStop(0, '#2c5e5a'); mg.addColorStop(.55, '#123536'); mg.addColorStop(1, '#061416');
  ctx.fillStyle = mg; ctx.beginPath();
  for (let i = 0; i <= 48; i++) { const a = i / 48 * TAU, rr = R * (.86 + .04 * Math.sin(a * 6 + e.t * 2)); ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  ctx.closePath(); ctx.fill(); ctx.strokeStyle = `rgba(${C},.4)`; ctx.lineWidth = 1.4; ctx.stroke();
  // crystal spikes on the rotating ring
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * TAU + e.ring, big = i % 2 === 0, r0 = R * .78, r1 = R * (big ? 1.18 : 1.0), wa = big ? .12 : .08;
    ctx.beginPath(); ctx.moveTo(Math.cos(a - wa) * r0, Math.sin(a - wa) * r0); ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); ctx.lineTo(Math.cos(a + wa) * r0, Math.sin(a + wa) * r0); ctx.closePath();
    const sg = ctx.createLinearGradient(Math.cos(a) * r0, Math.sin(a) * r0, Math.cos(a) * r1, Math.sin(a) * r1);
    sg.addColorStop(0, '#1b4a48'); sg.addColorStop(1, big ? '#b9fff0' : '#5fc9b4');
    ctx.fillStyle = sg; ctx.fill();
  }
  // inner rings
  ctx.lineWidth = 2;
  for (const [rr, sp, al] of [[.66, -1, .45], [.5, 1.4, .35]]) {
    ctx.save(); ctx.rotate(e.t * .4 * sp); ctx.setLineDash([R * .12, R * .06]);
    ctx.strokeStyle = `rgba(${C},${al})`; ctx.beginPath(); ctx.arc(0, 0, R * rr, 0, TAU); ctx.stroke(); ctx.restore();
  }
  ctx.setLineDash([]);
  // eye
  const ex = clamp((P.x - e.x) / W, -.5, .5) * R * .25, ey = clamp((P.y - e.y) / H, 0, 1) * R * .18;
  const eg = ctx.createRadialGradient(ex * .5, ey * .5, 2, 0, 0, R * .4);
  eg.addColorStop(0, '#f4fff9'); eg.addColorStop(.35, `rgb(${C})`); eg.addColorStop(1, '#0a2626');
  ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(0, 0, R * .38, 0, TAU); ctx.fill();
  ctx.fillStyle = '#031010'; ctx.beginPath(); ctx.ellipse(ex, ey, R * .05, R * .2 * (.6 + .4 * pulse), 0, 0, TAU); ctx.fill();
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(0, 0, R * .55, C, .45 * pulse);
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + e.ring; drawGlow(Math.cos(a) * R * .8, Math.sin(a) * R * .8, R * .09, C, pulse); }
  if (e.hp / e.maxhp < .5 && rnd() < .3) sparks(e.x + rand(-R, R) * .7, e.y + rand(-R, R) * .7, 2, [C, '255,255,255']);
}

function drawEnemyBullets() {
  for (const b of ebul) {
    if (b.k === 'needle') {
      const s = Math.hypot(b.vx, b.vy) || 1, ux = b.vx / s, uy = b.vy / s;
      ctx.strokeStyle = `rgba(${b.c},.45)`; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(b.x - ux * 18, b.y - uy * 18); ctx.lineTo(b.x + ux * 3, b.y + uy * 3); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(b.x - ux * 14, b.y - uy * 14); ctx.lineTo(b.x + ux * 3, b.y + uy * 3); ctx.stroke();
      drawGlow(b.x, b.y, 9, b.c, .7);
    } else if (b.k === 'shell') {
      const a = Math.atan2(b.vy, b.vx), warn = b.fuse < .45;
      drawGlow(b.x, b.y, 22, warn ? WARN : FLARE, .4 + .3 * Math.sin(b.t * (warn ? 40 : 18)));
      ctx.globalCompositeOperation = 'source-over';
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(a);
      ctx.fillStyle = '#8a8f9a'; ctx.beginPath(); ctx.ellipse(0, 0, 9, 4.6, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#3b3f48'; ctx.fillRect(-9, -4.2, 5, 8.4);
      ctx.fillStyle = `rgb(${FLARE})`; ctx.fillRect(1, -4.3, 2, 8.6);
      ctx.restore();
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(b.x + Math.cos(a) * 7, b.y + Math.sin(a) * 7, 6, '255,240,200', .9);
    } else if (b.k === 'rocket' || (b.k === 'homing' && b.mis)) {
      const a = Math.atan2(b.vy, b.vx), L = b.k === 'rocket' ? 9 : 12;
      drawGlow(b.x - Math.cos(a) * L, b.y - Math.sin(a) * L, 10, '255,170,80', .9);
      ctx.globalCompositeOperation = 'source-over';
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(a);
      ctx.fillStyle = '#d9dee6'; ctx.fillRect(-L, -2, L + 2, 4); ctx.fillStyle = b.k === 'rocket' ? '#ffb347' : '#ff5a4f'; ctx.beginPath(); ctx.moveTo(2, -2); ctx.lineTo(6, 0); ctx.lineTo(2, 2); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#5a606c'; ctx.fillRect(-L, -4, 3, 8);
      ctx.restore(); ctx.globalCompositeOperation = 'lighter';
    } else if (b.k === 'bomb') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(Math.atan2(b.vy, b.vx));
      ctx.fillStyle = '#3a3f4b'; ctx.beginPath(); ctx.ellipse(0, 0, 8, 4.5, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#23262e'; ctx.fillRect(-10, -4, 3, 8);
      ctx.restore(); ctx.globalCompositeOperation = 'lighter';
      drawGlow(b.x, b.y, 6, '255,60,60', ((b.t * 8) | 0) % 2 ? 1 : .3);
    } else if (b.k === 'homing') {
      const a = Math.atan2(b.vy, b.vx), fl = .7 + .3 * Math.sin(b.t * 25);
      drawGlow(b.x, b.y, 18, b.c, .6 * fl);
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(a);
      ctx.fillStyle = `rgba(${b.c},.95)`; ctx.beginPath(); ctx.moveTo(9, 0); ctx.lineTo(0, 4.5); ctx.lineTo(-7, 0); ctx.lineTo(0, -4.5); ctx.closePath(); ctx.fill();
      ctx.restore();
      drawGlow(b.x, b.y, 4, WHITE, 1);
    } else {
      drawGlow(b.x, b.y, b.r * 3.2, b.c, .85); drawGlow(b.x, b.y, b.r * .9, WHITE, 1);
    }
  }
}
function drawBeams() {
  if (!beams.length) return;
  ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  for (const b of beams) {
    const cx = Math.cos(b.ang), cy = Math.sin(b.ang), ex = b.x + cx * 2600, ey = b.y + cy * 2600, ft = b.t - b.charge;
    const line = () => { ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(ex, ey); ctx.stroke(); };
    if (ft < 0) {
      const p = clamp(b.t / b.charge, 0, 1), fl = .5 + .5 * Math.sin(b.t * (10 + p * 34));
      ctx.setLineDash([14, 10]); ctx.lineDashOffset = -b.t * 120;
      ctx.strokeStyle = `rgba(${b.c},${.15 + .5 * p * fl})`; ctx.lineWidth = 1 + p * 1.6; line();
      ctx.setLineDash([]); ctx.lineDashOffset = 0;
      drawGlow(b.x, b.y, b.w * (.8 + 2.2 * p), b.c, .5 + .5 * p); drawGlow(b.x, b.y, b.w * .7 * p, WHITE, p);
    } else {
      const k = clamp(Math.min(ft / .08, (b.fire - ft) / .18), 0, 1), fl = .88 + .12 * Math.sin(S.t * 70 + b.w), w = b.w * k * fl;
      ctx.strokeStyle = `rgba(${b.c},.16)`; ctx.lineWidth = w * 2.8; line();
      ctx.strokeStyle = `rgba(${b.c},.6)`; ctx.lineWidth = w; line();
      ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = w * .36; line();
      drawGlow(b.x, b.y, b.w * 2.6, b.c, k); drawGlow(b.x, b.y, b.w, WHITE, k);
    }
  }
  ctx.lineCap = 'butt'; ctx.globalCompositeOperation = 'source-over';
}
function drawHoleZone(h) {
  const { x, y, r, cap, R } = h, near = S.mode === 'play' && P.alive ? S.holeNear : 0;
  ctx.save();
  const g = ctx.createRadialGradient(x, y, r * 1.3, x, y, cap);
  g.addColorStop(0, 'rgba(255,90,40,0)'); g.addColorStop(.75, `rgba(255,90,40,${.04 + near * .06})`); g.addColorStop(1, `rgba(255,120,50,${.1 + near * .12})`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, cap, 0, TAU); ctx.fill();
  ctx.setLineDash([2, 9]); ctx.lineDashOffset = h.t * 8;
  ctx.strokeStyle = `rgba(140,200,255,${.16 + near * .2})`; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.stroke();
  const fl = .5 + .5 * Math.sin(S.t * (4 + near * 10));
  ctx.setLineDash([12, 8]); ctx.lineDashOffset = -h.t * 30;
  ctx.strokeStyle = `rgba(255,150,60,${.4 + near * .45 * fl})`; ctx.lineWidth = 1.6 + near * 1.4;
  ctx.beginPath(); ctx.arc(x, y, cap, 0, TAU); ctx.stroke();
  ctx.setLineDash([]); ctx.lineDashOffset = 0;
  ctx.strokeStyle = `rgba(255,170,80,${.45 + near * .4})`; ctx.lineWidth = 1.4;
  const rr = cap + 16 - (h.t * 18) % 14;
  for (let i = 0; i < 14; i++) {
    const a = i / 14 * TAU + h.t * .2 * h.spin, cx = Math.cos(a), cy = Math.sin(a), px = -cy, py = cx;
    ctx.beginPath(); ctx.moveTo(x + cx * (rr + 5) + px * 5, y + cy * (rr + 5) + py * 5); ctx.lineTo(x + cx * (rr - 2), y + cy * (rr - 2)); ctx.lineTo(x + cx * (rr + 5) - px * 5, y + cy * (rr + 5) - py * 5); ctx.stroke();
  }
  ctx.globalCompositeOperation = 'lighter'; ctx.lineWidth = 1.2;
  for (const p of h.flow) {
    const inZ = p.rad < cap, c = inZ ? '255,170,90' : '150,205,255';
    const al = inZ ? .7 : .04 + .32 * Math.pow(1 - (p.rad - cap) / (R - cap), 1.5);
    const w = .25 + 3000 / (p.rad * p.rad), ta = p.a - h.spin * w * .14;
    ctx.strokeStyle = `rgba(${c},${al})`;
    ctx.beginPath(); ctx.moveTo(x + Math.cos(ta) * (p.rad + 6), y + Math.sin(ta) * (p.rad + 6) * .9); ctx.lineTo(x + Math.cos(p.a) * p.rad, y + Math.sin(p.a) * p.rad * .9); ctx.stroke();
  }
  ctx.restore();
}
function drawSats() {
  if (!planet || !planet.sats) return;
  for (const s of planet.sats) {
    if (s.dead || s.hidden || s.y < -20 || s.y > H + 20) continue;
    const k = s.front ? 1 : .8, tang = Math.atan2(Math.cos(s.ang) * s.b, -Math.sin(s.ang) * s.a) + planet.tilt;
    if (s.locked && s.fireT < .5) {
      const fl = .5 + .5 * Math.sin(S.t * 40);
      ctx.strokeStyle = `rgba(255,90,70,${.15 + .4 * fl * (1 - s.fireT / .5)})`; ctx.lineWidth = 1; ctx.setLineDash([6, 6]);
      ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(P.x, P.y); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.save(); ctx.translate(s.x, s.y); ctx.scale(k, k); ctx.globalAlpha = s.front ? 1 : .75;
    ctx.save(); ctx.rotate(tang);
    for (const sd of [-1, 1]) {
      ctx.fillStyle = '#1b2f5c'; ctx.fillRect(sd > 0 ? 7 : -21, -4, 14, 8);
      ctx.strokeStyle = 'rgba(140,180,255,.6)'; ctx.lineWidth = .8; ctx.strokeRect(sd > 0 ? 7 : -21, -4, 14, 8);
      ctx.beginPath(); for (let i = 1; i < 4; i++) { const xx = (sd > 0 ? 7 : -21) + i * 3.5; ctx.moveTo(xx, -4); ctx.lineTo(xx, 4); } ctx.stroke();
      ctx.fillStyle = '#9aa0aa'; ctx.fillRect(sd > 0 ? 5 : -7, -.8, 2, 1.6);
    }
    ctx.restore();
    const bg = ctx.createLinearGradient(-5, -5, 5, 5); bg.addColorStop(0, '#f1d48a'); bg.addColorStop(1, '#8a6a2a');
    ctx.fillStyle = bg; ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; ctx.lineTo(Math.cos(a) * 5.5, Math.sin(a) * 5.5); } ctx.closePath(); ctx.fill();
    ctx.save(); ctx.rotate(s.aim - Math.PI / 2); ctx.fillStyle = '#2a2d33'; ctx.fillRect(-1.5, 2, 3, 9); ctx.restore();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'lighter';
    if (s.blink % 1 < .15 || s.locked) drawGlow(0, 0, s.locked ? 10 : 7, '255,70,60', s.locked ? .9 : .8);
    if (s.hitT > 0) drawGlow(0, 0, 16, WHITE, s.hitT * 6);
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
    if (s.locked) {
      ctx.strokeStyle = 'rgba(255,90,70,.7)'; ctx.lineWidth = 1.2; const q = 14;
      for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { ctx.beginPath(); ctx.moveTo(s.x + a * q, s.y + b * (q - 5)); ctx.lineTo(s.x + a * q, s.y + b * q); ctx.lineTo(s.x + a * (q - 5), s.y + b * q); ctx.stroke(); }
    }
    if (s.hp < s.maxhp) drawMiniBar(s.x, s.y - 18, 26, s.hp / s.maxhp, '255,110,90');
  }
}
function drawMiniBar(x, y, w, f, c) {
  ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(x - w / 2, y, w, 3);
  ctx.fillStyle = `rgb(${c})`; ctx.fillRect(x - w / 2, y, w * clamp(f, 0, 1), 3);
}
function drawRock(k) {
  ctx.save(); ctx.translate(k.x, k.y); ctx.rotate(k.rot);
  ctx.drawImage(k.sprite.c, -k.sprite.s / 2, -k.sprite.s / 2, k.sprite.s, k.sprite.s);
  ctx.restore();
  if (k.iron) { ctx.globalCompositeOperation = 'lighter'; drawGlow(k.x, k.y, k.r * 1.3, IRON_VEIN[k.iron], .12 + .08 * Math.sin(S.t * 3 + k.rot * 2) + (k.hitT > 0 ? .35 : 0)); ctx.globalCompositeOperation = 'source-over'; }
  else if (k.hitT > 0) { ctx.globalCompositeOperation = 'lighter'; drawGlow(k.x, k.y, k.r * 1.1, '255,230,200', k.hitT * 3); ctx.globalCompositeOperation = 'source-over'; }
  if (!k.iron && !k.giant && k.r > 28 && k.hp < k.maxhp) drawMiniBar(k.x, k.y - k.r - 9, k.r * 1.1, k.hp / k.maxhp, '205,180,150');
  if (k.giant && k.hp < k.maxhp) drawMiniBar(k.x, k.y - k.r - 12, Math.min(110, k.r), k.hp / k.maxhp, '205,180,150');
}

/* black hole with gravitational lens */
let lensA = null, lensB = null;
function drawHole(h) {
  const { x, y, r } = h;
  const L = r * 4.6, sz = Math.ceil(L * 2 * DPR);
  if (!lensA || lensA.width < sz) { lensA = document.createElement('canvas'); lensB = document.createElement('canvas'); lensA.width = lensA.height = lensB.width = lensB.height = sz; }
  const a = lensA.getContext('2d'), b = lensB.getContext('2d');
  a.setTransform(1, 0, 0, 1, 0, 0); a.clearRect(0, 0, lensA.width, lensA.height);
  try { a.drawImage(cv, VIEW.vx + (x - L) * DPR, VIEW.vy + (y - L) * DPR, L * 2 * DPR, L * 2 * DPR, 0, 0, L * 2 * DPR, L * 2 * DPR); } catch (e) {}
  b.setTransform(1, 0, 0, 1, 0, 0); b.clearRect(0, 0, lensB.width, lensB.height);
  b.save(); b.translate(L * DPR, L * DPR); b.rotate(Math.sin(h.t * .3) * .25 + h.t * .05); b.scale(1.5, 1.5); b.drawImage(lensA, -L * DPR, -L * DPR); b.restore();
  b.globalCompositeOperation = 'destination-in';
  const m = b.createRadialGradient(L * DPR, L * DPR, r * DPR, L * DPR, L * DPR, L * DPR);
  m.addColorStop(0, 'rgba(0,0,0,1)'); m.addColorStop(.45, 'rgba(0,0,0,.85)'); m.addColorStop(1, 'rgba(0,0,0,0)');
  b.fillStyle = m; b.fillRect(0, 0, sz, sz); b.globalCompositeOperation = 'source-over';
  ctx.drawImage(lensB, 0, 0, L * 2 * DPR, L * 2 * DPR, x - L, y - L, L * 2, L * 2);

  // darkening well
  const dw = ctx.createRadialGradient(x, y, r * .9, x, y, r * 3.4);
  dw.addColorStop(0, 'rgba(0,0,0,.9)'); dw.addColorStop(.35, 'rgba(0,0,0,.45)'); dw.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = dw; ctx.beginPath(); ctx.arc(x, y, r * 3.4, 0, TAU); ctx.fill();

  const diskGlow = (front) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(h.tilt); ctx.scale(1, .26);
    ctx.beginPath(); ctx.rect(-r * 5, front ? 0 : -r * 5, r * 10, r * 5); ctx.clip();
    const g = ctx.createRadialGradient(0, 0, r * 1.4, 0, 0, r * 4.2);
    g.addColorStop(0, 'rgba(255,230,190,0)'); g.addColorStop(.06, 'rgba(255,225,180,.55)'); g.addColorStop(.3, 'rgba(255,160,80,.3)'); g.addColorStop(1, 'rgba(200,70,30,0)');
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r * 4.2, 0, TAU); ctx.fill();
    ctx.restore();
  };
  const diskParts = (front) => {
    ctx.globalCompositeOperation = 'lighter';
    const ct = Math.cos(h.tilt), st = Math.sin(h.tilt);
    for (const p of h.disk) {
      const sa = Math.sin(p.a);
      if ((sa >= 0) !== front) continue;
      const px = Math.cos(p.a) * p.rad, py = sa * p.rad * .26;
      const X = x + px * ct - py * st, Y = y + px * st + py * ct;
      const t = (p.rad - r * 1.55) / (r * 2.4);
      const col = t < .2 ? '255,245,225' : t < .55 ? '255,190,110' : '235,110,50';
      const dop = .45 + .55 * (.5 + .5 * Math.cos(p.a + .4));
      drawGlow(X, Y, p.s * 2.4, col, dop * (1 - t * .55));
    }
    ctx.globalCompositeOperation = 'source-over';
  };
  diskGlow(false); diskParts(false);
  // event horizon shadow
  const sh = ctx.createRadialGradient(x, y, r * .7, x, y, r * 1.25);
  sh.addColorStop(0, 'rgba(0,0,0,1)'); sh.addColorStop(.7, 'rgba(0,0,0,1)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sh; ctx.beginPath(); ctx.arc(x, y, r * 1.25, 0, TAU); ctx.fill();
  // lensed far side of the disk (halo over and under the shadow)
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(x, y); ctx.rotate(h.tilt);
  for (const [ry, a0, a1, al] of [[1.55, Math.PI * 1.02, Math.PI * 1.98, .55], [1.32, Math.PI * .06, Math.PI * .94, .22]]) {
    ctx.beginPath(); ctx.ellipse(0, 0, r * 1.7, r * ry, 0, a0, a1);
    ctx.strokeStyle = `rgba(255,190,110,${al * .45})`; ctx.lineWidth = r * .42; ctx.stroke();
    ctx.strokeStyle = `rgba(255,236,205,${al})`; ctx.lineWidth = r * .1; ctx.stroke();
  }
  // photon ring
  ctx.beginPath(); ctx.arc(0, 0, r * 1.06, 0, TAU); ctx.strokeStyle = 'rgba(255,240,220,.7)'; ctx.lineWidth = 1.4; ctx.stroke();
  ctx.restore();
  diskGlow(true); diskParts(true);
  ctx.globalCompositeOperation = 'source-over';
}
function drawHoleTag(h) {
  if (h.y < -h.r * 2 || h.y > H) return;
  const ax = h.x + h.r * 2.4, ay = h.y - h.r * 2.2, flip = ax + (CJK ? 175 : 200) > W - inset.r;
  const ex = flip ? h.x - h.r * 2.4 : ax;
  const tx = flip ? ex - 18 : ex + 18;
  ctx.strokeStyle = 'rgba(255,179,71,.55)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(h.x + (flip ? -1 : 1) * h.r * 1.4, h.y - h.r * 1.3); ctx.lineTo(ex, ay); ctx.lineTo(tx, ay); ctx.stroke();
  ctx.fillStyle = 'rgba(255,179,71,.95)'; ctx.font = '600 11px ' + FD;
  ctx.textAlign = flip ? 'right' : 'left'; ctx.textBaseline = 'bottom';
  ctx.fillText(I18('引力奇点 · ', 'SINGULARITY · ') + h.mass + ' M☉', tx + (flip ? -4 : 4), ay - 3);
  ctx.fillStyle = 'rgba(255,179,71,.6)'; ctx.textBaseline = 'top';
  ctx.fillText(I18('不可逃逸线 · 进入即被吞噬', 'NO-RETURN LINE · DO NOT CROSS'), tx + (flip ? -4 : 4), ay + 3);
  ctx.textAlign = 'left';
}

function drawPowers() {
  for (const u of powers) {
    const d = PU[u.type], bob = Math.sin(u.t * 4) * 3;
    ctx.save(); ctx.translate(u.x, u.y + bob);
    ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 26, d.c, .5 + .2 * Math.sin(u.t * 6)); ctx.globalCompositeOperation = 'source-over';
    ctx.rotate(u.t * 1.2);
    ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; ctx.lineTo(Math.cos(a) * 13, Math.sin(a) * 13); } ctx.closePath();
    ctx.fillStyle = 'rgba(6,12,24,.75)'; ctx.fill(); ctx.strokeStyle = `rgb(${d.c})`; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.rotate(-u.t * 1.2);
    ctx.fillStyle = `rgb(${d.c})`; ctx.font = '700 13px "Chakra Petch",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(d.ch, 0, 1);
    ctx.restore();
  }
  ctx.textAlign = 'left';
}

function drawProjectiles() {
  ctx.globalCompositeOperation = 'lighter';
  // player lasers
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(94,242,255,.28)'; ctx.lineWidth = 7; ctx.beginPath();
  for (const l of lasers) { const s = Math.hypot(l.vx, l.vy); ctx.moveTo(l.x - l.vx / s * 22, l.y - l.vy / s * 22); ctx.lineTo(l.x, l.y); }
  ctx.stroke();
  ctx.strokeStyle = 'rgba(225,255,255,.95)'; ctx.lineWidth = 2; ctx.beginPath();
  for (const l of lasers) { const s = Math.hypot(l.vx, l.vy); ctx.moveTo(l.x - l.vx / s * 18 * l.w, l.y - l.vy / s * 18 * l.w); ctx.lineTo(l.x, l.y); }
  ctx.stroke();
  for (const l of lasers) { drawGlow(l.x, l.y, 8, ION, .55); if (l.boom) drawGlow(l.x, l.y, 6, FLARE, .7); }
  // enemy bullets
  drawEnemyBullets();
  // missiles
  for (const m of missiles) {
    const a = Math.atan2(m.vy, m.vx), c = Math.cos(a), s = Math.sin(a);
    if (m.t > .2) drawGlow(m.x - c * 8, m.y - s * 8, 12, FLARE, .9);
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = '#d7dee8'; ctx.lineWidth = 3.2; ctx.beginPath(); ctx.moveTo(m.x - c * 7, m.y - s * 7); ctx.lineTo(m.x + c * 5, m.y + s * 5); ctx.stroke();
    ctx.strokeStyle = '#ff5a4f'; ctx.lineWidth = 3.2; ctx.beginPath(); ctx.moveTo(m.x + c * 3, m.y + s * 3); ctx.lineTo(m.x + c * 6, m.y + s * 6); ctx.stroke();
    ctx.globalCompositeOperation = 'lighter';
  }
  ctx.lineCap = 'butt';
  ctx.globalCompositeOperation = 'source-over';
}

function drawParticles() {
  for (const p of parts) {
    if (p.k !== 'smoke' && p.k !== 'trail' && p.k !== 'debris') continue;
    const f = p.life / p.max;
    if (p.k === 'debris') {
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = Math.min(1, f * 2);
      ctx.fillStyle = `rgb(${p.c})`; ctx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * .66); ctx.restore(); ctx.globalAlpha = 1;
    } else {
      ctx.fillStyle = p.k === 'trail' ? `rgba(190,195,210,${f * .22})` : `rgba(${p.c},${f * .5})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, TAU); ctx.fill();
    }
  }
  ctx.globalCompositeOperation = 'lighter';
  for (const p of parts) {
    const f = p.life / p.max;
    if (p.k === 'spark') {
      ctx.strokeStyle = `rgba(${p.c},${f})`; ctx.lineWidth = p.w;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * .035, p.y - p.vy * .035); ctx.stroke();
    } else if (p.k === 'ember') drawGlow(p.x, p.y, p.r * 2.4, p.c, f);
    else if (p.k === 'flash') drawGlow(p.x, p.y, p.r * (1.2 - f * .4), p.c, f * 1.1);
  }
  for (const w of waves) {
    const f = w.life / w.maxl;
    ctx.strokeStyle = `rgba(${w.c},${f * .6})`; ctx.lineWidth = 1 + f * 4;
    ctx.beginPath(); ctx.arc(w.x, w.y, w.r, 0, TAU); ctx.stroke();
  }
  ctx.globalCompositeOperation = 'source-over';
}

function drawTexts() {
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const t of texts) {
    const f = t.life / t.max;
    ctx.font = t.big ? '700 15px ' + FD : '600 12px ' + FD;
    ctx.fillStyle = `rgba(${t.c},${Math.min(1, f * 2)})`;
    ctx.fillText(t.txt, t.x, t.y);
  }
  ctx.textAlign = 'left';
}

function drawLock() {
  const k = S.lock;
  if (!k || k.dead || k.cap || k.hidden || k.dying || !P.alive || P.cap || S.mode !== 'play') return;
  const s = (k.type === 'boss' ? Math.min(k.hw, k.hh * 1.8) * .9 : k.r + 8), a = S.t * 2, c = P.mis > 0 ? FLARE : '132,148,173';
  ctx.save(); ctx.translate(k.x, k.y); ctx.rotate(a * .4);
  ctx.strokeStyle = `rgba(${c},.8)`; ctx.lineWidth = 1.3;
  for (let i = 0; i < 4; i++) {
    ctx.rotate(TAU / 4);
    ctx.beginPath(); ctx.moveTo(s, s - 7); ctx.lineTo(s, s); ctx.lineTo(s - 7, s); ctx.stroke();
  }
  ctx.restore();
}

