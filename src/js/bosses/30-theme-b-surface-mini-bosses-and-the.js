/* ---------- theme B surface mini-bosses (Phoenix / Anvil / Wyrm) and the Forge fortress ---------- */
const SIDE_MINIS_B = ['phoenix', 'anvil', 'wyrm'];
Object.assign(MINI_SHORT, { phoenix: I18('火凤级', 'PHOENIX'), anvil: I18('铁砧级', 'ANVIL'), wyrm: I18('熔岩巨蛇', 'WYRM') });
Object.assign(MINI_COL, { phoenix: '255,170,70', anvil: '255,110,60', wyrm: '255,80,40' });
const MINI_PARTS_B = { phoenix: [['turret', .2, -1.05], ['turret', .2, 1.05]], anvil: [['missile', -.3, -1.02], ['turret', .25, -1.04], ['rocket', -.05, 1.02]], wyrm: [['laser', -.25, 0], ['turret', .3, 0], ['turret', .8, 0]] };
const FORGE_PAL = { '#4a4f5c': '#3a2f2c', '#2c303a': '#241c1a', '#1b1d24': '#140f0e', '#7d8597': '#5d4a42', '#454b5a': '#3a2e2a', '#23262f': '#1a1312', '#8a92a4': '#6b564c', '#4a5160': '#41332d',
  '#22252e': '#1b1412', '#6d7383': '#4f403a', '#3a3f4c': '#2e2420', '#17191f': '#120d0c', '#7a8192': '#5c4a42', '#414755': '#382b26', '#1a1c23': '#140e0d' };
function miniGeoB(b) {
  if (b.kind === 'phoenix') { b.hw = clamp(W * .13, 66, 125); b.hh = b.hw * .42; }
  else if (b.kind === 'anvil') { b.hw = clamp(W * .18, 88, 175); b.hh = b.hw * .4; }
  else { b.hw = clamp(W * .17, 84, 160); b.hh = b.hw * .3; }
}
const wyrmY = (e, x) => Math.sin(e.t * 2.6 - x / e.hw * 3) * e.hh * .75 * clamp((x + e.hw) / (2 * e.hw), .15, 1);
function miniGunsB(e) {
  const w = e.hw, h = e.hh, t = e.parts.filter(p => !p.dead);
  if (e.kind === 'phoenix') return { main: [-w * 1.02, 0], side: [[-w * .3, -h * .9], [-w * .3, h * .7]], top: [[w * .4, -h * 1.3], [w * .55, h * 1.1]], core: [-w * .2, 0], turrets: t };
  if (e.kind === 'anvil') return { main: [-w * .98, 0], side: [[-w * .6, h * .85], [w * .1, h * .9]], top: [[-w * .5, -h * 1.05], [w * .2, -h * 1.1], [w * .6, -h * .9]], core: [0, 0], turrets: t };
  return { main: [-w * 1.02, wyrmY(e, -w)], side: [[-w * .5, wyrmY(e, -w * .5) - h * .5], [-w * .5, wyrmY(e, -w * .5) + h * .5]], top: [[w * .2, wyrmY(e, w * .2) - h], [w * .6, wyrmY(e, w * .6) - h]], core: [-w * .8, 0], turrets: t };
}
function drawPhoenix(e, w, h, C, pulse, ch) {
  const fl = Math.sin(S.t * 3.2) * .25;
  thruster(w * .85, 0, h * .35, w * .9, '255,150,60');
  ctx.save(); ctx.translate(-w * .05, h * .1); ctx.rotate(-fl * .4);
  ctx.fillStyle = '#3a1810'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(w * .35, h * 1.1, w * .9, h * 1.35); ctx.lineTo(w * .65, h * .35); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.fillStyle = miniGrad(h, '#c06030', '#6a2814', '#2a0e08'); ctx.strokeStyle = `rgba(${C},.55)`; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(-w, 0); ctx.quadraticCurveTo(-w * .6, -h * .5, -w * .1, -h * .45); ctx.lineTo(w * .7, -h * .2); ctx.lineTo(w * .9, 0); ctx.lineTo(w * .7, h * .25); ctx.quadraticCurveTo(-w * .5, h * .5, -w, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.save(); ctx.translate(-w * .1, -h * .3); ctx.rotate(fl);
  const wg = ctx.createLinearGradient(0, 0, w * .8, -h * 1.7); wg.addColorStop(0, '#8a3016'); wg.addColorStop(.6, '#e07a2a'); wg.addColorStop(1, '#ffd070');
  ctx.fillStyle = wg; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(w * .1, -h * 1.4, w * .75, -h * 1.75); ctx.quadraticCurveTo(w * .6, -h * 1.05, w * .95, -h * .9); ctx.quadraticCurveTo(w * .55, -h * .55, w * .7, -h * .15); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(80,20,8,.5)'; ctx.beginPath(); for (let k = 1; k < 4; k++) { ctx.moveTo(w * .1 * k, -h * .1 * k); ctx.lineTo(w * (.35 + .15 * k), -h * (.6 + .3 * k)); } ctx.stroke();
  ctx.globalCompositeOperation = 'lighter'; drawGlow(w * .75, -h * 1.75, h * .5, '255,200,90', .8); drawGlow(w * .95, -h * .9, h * .35, '255,160,60', .6);
  ctx.restore(); ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#2a0e08'; ctx.beginPath(); ctx.moveTo(-w * 1.12, -h * .02); ctx.lineTo(-w * .82, -h * .2); ctx.lineTo(-w * .82, h * .14); ctx.closePath(); ctx.fill();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 4; i++) drawGlow(w * (.95 + i * .12), Math.sin(S.t * 9 + i) * h * .15, h * (.4 - i * .06), '255,140,40', .6);
  drawGlow(-w * .7, -h * .15, 3, '255,240,170', 1);
  drawGlow(-w * 1.1, 0, h * (ch ? .7 : .3), ch ? LANCEC : C, ch ? 1 : pulse);
}
function drawAnvil(e, w, h, C, pulse, ch) {
  for (const y of [-h * .45, h * .45]) thruster(w * 1.02, y, h * .22, w * .4, '255,130,50');
  ctx.fillStyle = miniGrad(h, '#6a5a54', '#3a2e2a', '#161010'); ctx.strokeStyle = `rgba(${C},.45)`; ctx.lineWidth = 1.3;
  ctx.beginPath(); ctx.moveTo(-w * .4, -h * .7); ctx.lineTo(w * .85, -h * .6); ctx.lineTo(w, -h * .2); ctx.lineTo(w, h * .3); ctx.lineTo(w * .85, h * .65); ctx.lineTo(-w * .4, h * .75); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = miniGrad(h, '#8a7a72', '#4a3c38', '#1c1414');
  ctx.beginPath(); ctx.moveTo(-w * 1.05, -h * .55); ctx.lineTo(-w * .55, -h * 1.05); ctx.lineTo(-w * .32, -h * 1.0); ctx.lineTo(-w * .32, h * 1.0); ctx.lineTo(-w * .55, h * 1.05); ctx.lineTo(-w * 1.05, h * .55); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 1; ctx.beginPath(); for (const x of [-.75, -.5]) { ctx.moveTo(x * w, -h * .85); ctx.lineTo(x * w, h * .85); } for (const x of [.1, .45, .75]) { ctx.moveTo(x * w, -h * .62); ctx.lineTo(x * w, h * .68); } ctx.stroke();
  ctx.fillStyle = '#100a0a'; ctx.fillRect(-w * .25, h * .45, w * .7, h * .3);
  ctx.globalCompositeOperation = 'lighter';
  for (let x = -w * .2; x < w * .8; x += w * .16) { drawGlow(x, -h * .25, 3, '255,150,60', .8); drawGlow(x, h * .6, 4, '255,110,40', .5 + .4 * Math.sin(S.t * 4 + x)); }
  for (let k = 0; k < 3; k++) drawGlow(-w * .7 + k * w * .12, -h * .78, 4, '255,90,40', .5 + .5 * Math.sin(S.t * 5 + k));
  drawGlow(-w * 1.02, 0, h * (ch ? .75 : .32), ch ? LANCEC : C, ch ? 1 : pulse);
}
function drawWyrm(e, w, h, C, pulse, ch) {
  const segs = [];
  for (let i = 0; i <= 12; i++) { const x = w * 1.15 - i * (w * 2.15 / 12); segs.push([x, wyrmY(e, x), 1 - i / 18]); }
  thruster(segs[0][0] + h * .2, segs[0][1], h * .3, w * .35, '255,90,40');
  for (let i = 0; i < segs.length - 1; i++) {
    const [x, y, s] = segs[i], r = h * (.55 + (1 - s) * .55);
    ctx.fillStyle = miniGrad(r, '#5a3a32', '#2e1a16', '#120807'); ctx.beginPath(); ctx.ellipse(x, y, r * 1.05, r, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.fillStyle = '#3a2420'; ctx.beginPath(); ctx.moveTo(x - r * .4, y - r * .8); ctx.lineTo(x, y - r * 1.45); ctx.lineTo(x + r * .4, y - r * .8); ctx.closePath(); ctx.fill();
    ctx.globalCompositeOperation = 'lighter'; drawGlow(x, y + r * .2, r * .45, '255,110,40', .35 + .25 * Math.sin(S.t * 4 + i)); ctx.globalCompositeOperation = 'source-over';
  }
  const [hx, hy] = segs[segs.length - 1], R = h * 1.15;
  ctx.fillStyle = miniGrad(R, '#6a4038', '#34201a', '#140a08');
  ctx.beginPath(); ctx.moveTo(hx + R * .6, hy - R * .8); ctx.lineTo(hx - R * .9, hy - R * .45); ctx.lineTo(hx - R * 1.5, hy - R * .05); ctx.lineTo(hx - R * .7, hy + (ch ? R * .6 : R * .25)); ctx.lineTo(hx + R * .7, hy + R * .7); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = `rgba(${C},.6)`; ctx.lineWidth = 1.4; ctx.stroke();
  ctx.fillStyle = '#2a1410'; ctx.beginPath(); ctx.moveTo(hx + R * .2, hy - R * .75); ctx.lineTo(hx + R * .9, hy - R * 1.5); ctx.lineTo(hx + R * .55, hy - R * .7); ctx.closePath(); ctx.fill();
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(hx - R * .45, hy - R * .3, R * .18, '255,230,120', 1);
  drawGlow(hx - R * 1.3, hy + R * .1, R * (ch ? .8 : .35), ch ? LANCEC : C, ch ? 1 : pulse);
}
function drawForgeBack(e) {
  const w = e.hw, h = e.hh, gy = e.groundY - e.y, cx = w * 1.65, top = -h * 2.55, bw = w * 2.6;
  const g = ctx.createLinearGradient(0, top, 0, gy); g.addColorStop(0, '#3a2420'); g.addColorStop(.5, '#22140f'); g.addColorStop(1, '#0e0806');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(cx - bw, gy + 2); ctx.lineTo(cx - w * .32, top); ctx.lineTo(cx + w * .32, top); ctx.lineTo(cx + bw, gy + 2); ctx.closePath(); ctx.fill();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  for (const [dx, k] of [[-.25, 0], [.05, 1], [.3, 2]]) {
    ctx.strokeStyle = `rgba(255,${120 + k * 20},40,${.55 + .2 * Math.sin(S.t * 2 + k)})`; ctx.lineWidth = 4 - k;
    ctx.beginPath(); ctx.moveTo(cx + dx * w, top + 4); ctx.quadraticCurveTo(cx + dx * w * 2.6, top + h * .9, cx + dx * w * 4.2, top + h * 2.1); ctx.stroke();
  }
  ctx.lineCap = 'butt';
  drawGlow(cx, top, w * .7, '255,120,40', .75 + .2 * Math.sin(S.t * 3)); drawGlow(cx, top - h * .2, w * .35, '255,220,140', .6);
  ctx.globalCompositeOperation = 'source-over';
  for (let i = 0; i < 8; i++) {
    const q = (S.t * .09 + i / 8) % 1, px = cx + Math.sin(q * 6 + i) * w * .2 + q * w * .6, py = top - q * H * .5, rr = w * (.12 + q * .35);
    ctx.fillStyle = `rgba(${40 + (1 - q) * 50 | 0},${22 + (1 - q) * 14 | 0},20,${.6 * (1 - q)})`; ctx.beginPath(); ctx.arc(px, py, rr, 0, TAU); ctx.fill();
  }
}
function drawForgeLava(e) {
  const w = e.hw, h = e.hh, gy = e.groundY - e.y;
  ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  for (const x of [.42, .86, 1.18]) {
    const xx = x * w; if (e.x + xx > W + 10) continue;
    const g = ctx.createLinearGradient(0, -h * .75, 0, gy); g.addColorStop(0, 'rgba(255,200,90,.85)'); g.addColorStop(1, 'rgba(255,70,20,.5)');
    ctx.strokeStyle = g; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(xx, -h * .75); ctx.lineTo(xx + Math.sin(x * 9) * 4, gy); ctx.stroke();
    ctx.setLineDash([6, 16]); ctx.lineDashOffset = -S.t * 90; ctx.strokeStyle = 'rgba(255,240,180,.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xx, -h * .75); ctx.lineTo(xx + Math.sin(x * 9) * 4, gy); ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0;
    drawGlow(xx, gy - 4, w * .18, '255,120,40', .6);
  }
  ctx.lineCap = 'butt'; ctx.globalCompositeOperation = 'source-over';
}

