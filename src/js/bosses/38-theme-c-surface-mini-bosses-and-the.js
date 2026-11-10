/* ---------- theme C surface mini-bosses (Frostwing / Icebreaker / Cyclone) and the Glacier citadel ---------- */
const SIDE_MINIS_C = ['frostwing', 'icebreaker', 'cyclone'];
Object.assign(MINI_SHORT, { frostwing: I18('霜翼级', 'FROSTWING'), icebreaker: I18('破冰级', 'ICEBREAKER'), cyclone: I18('气旋级', 'CYCLONE') });
Object.assign(MINI_COL, { frostwing: '150,230,255', icebreaker: '190,220,255', cyclone: '200,170,255' });
const MINI_PARTS_C = { frostwing: [['turret', .15, -1.05], ['turret', .15, 1.05]], icebreaker: [['turret', -.1, -1.04], ['missile', .35, -1.02], ['turret', .2, 1.04]], cyclone: [['laser', .1, -1.05], ['laser', .1, 1.05], ['turret', .6, 0]] };
const GLACIER_PAL = { '#4a4f5c': '#5a7088', '#2c303a': '#34485e', '#1b1d24': '#1c2a3a', '#7d8597': '#a8c4dc', '#454b5a': '#5a7894', '#23262f': '#22344a', '#8a92a4': '#c4dcee', '#4a5160': '#6a8aa6',
  '#22252e': '#24384e', '#6d7383': '#9ab8d0', '#3a3f4c': '#4a6680', '#17191f': '#162434', '#7a8192': '#b0cce2', '#414755': '#557590', '#1a1c23': '#1a2838' };
function miniGeoC(b) {
  if (b.kind === 'frostwing') { b.hw = clamp(W * .13, 66, 125); b.hh = b.hw * .4; }
  else if (b.kind === 'icebreaker') { b.hw = clamp(W * .19, 92, 185); b.hh = b.hw * .36; }
  else { b.hw = clamp(W * .15, 76, 150); b.hh = b.hw * .5; }
}
function miniGunsC(e) {
  const w = e.hw, h = e.hh, t = e.parts.filter(p => !p.dead);
  if (e.kind === 'frostwing') return { main: [-w * 1.05, 0], side: [[-w * .3, -h * .8], [-w * .3, h * .8]], top: [[w * .3, -h * 1.2], [w * .3, h * 1.2]], core: [-w * .2, 0], turrets: t };
  if (e.kind === 'icebreaker') return { main: [-w * 1.15, 0], side: [[-w * .5, -h * .9], [-w * .5, h * .9]], top: [[-w * .2, -h * 1.1], [w * .3, -h * 1.1], [w * .7, -h]], core: [0, 0], turrets: t };
  return { main: [-w * .9, 0], side: [[-w * .3, -h * .8], [-w * .3, h * .8]], top: [[0, -h], [w * .5, -h * .8], [0, h]], core: [0, 0], turrets: t };
}
function drawFrostwing(e, w, h, C, pulse, ch) {
  thruster(w * .9, 0, h * .3, w * .7, ICE);
  for (const s of [-1, 1]) iceFacet([[-w * .2, s * h * .2], [w * .55, s * h * 1.35], [w * .85, s * h * 1.25], [w * .45, s * h * .15]], '#f2fbff', '#9ad0ee', '#2a4a68');
  ctx.fillStyle = miniGrad(h, '#f0f8ff', '#8aa8c4', '#22344a'); ctx.strokeStyle = `rgba(${C},.6)`; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(-w * 1.1, 0); ctx.lineTo(-w * .4, -h * .42); ctx.lineTo(w * .85, -h * .3); ctx.lineTo(w * .95, 0); ctx.lineTo(w * .85, h * .3); ctx.lineTo(-w * .4, h * .42); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(120,220,255,.85)'; ctx.beginPath(); ctx.ellipse(-w * .5, -h * .12, w * .2, h * .16, 0, 0, TAU); ctx.fill();
  ctx.globalCompositeOperation = 'lighter'; for (const s of [-1, 1]) drawGlow(w * .7, s * h * 1.3, 4, C, .9);
  drawGlow(-w * 1.08, 0, h * (ch ? .75 : .3), ch ? LANCEC : C, ch ? 1 : pulse);
}
function drawIcebreaker(e, w, h, C, pulse, ch) {
  for (const y of [-h * .4, h * .4]) thruster(w * 1.02, y, h * .22, w * .4, ICE);
  ctx.fillStyle = miniGrad(h, '#d6e4f0', '#6a8298', '#1c2a38'); ctx.strokeStyle = `rgba(${C},.5)`; ctx.lineWidth = 1.3;
  ctx.beginPath(); ctx.moveTo(-w * .55, -h * .8); ctx.lineTo(w * .9, -h * .7); ctx.lineTo(w, -h * .2); ctx.lineTo(w, h * .3); ctx.lineTo(w * .9, h * .75); ctx.lineTo(-w * .55, h * .85); ctx.closePath(); ctx.fill(); ctx.stroke();
  iceFacet([[-w * .55, -h * .9], [-w * 1.2, 0], [-w * .55, h * .9]], '#ffffff', '#a6d6f2', '#3a6a90');
  ctx.strokeStyle = 'rgba(40,70,100,.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); for (let k = 1; k < 4; k++) { const x = -w * .55 - k * w * .15; ctx.moveTo(x, -h * (.9 - k * .22)); ctx.lineTo(x, h * (.9 - k * .22)); } ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 1; ctx.beginPath(); for (const x of [-.2, .2, .55]) { ctx.moveTo(x * w, -h * .72); ctx.lineTo(x * w, h * .78); } ctx.stroke();
  ctx.fillStyle = '#0c141c'; ctx.fillRect(-w * .2, h * .45, w * .7, h * .3);
  ctx.globalCompositeOperation = 'lighter'; for (let x = -w * .3; x < w * .85; x += w * .14) drawGlow(x, -h * .3, 2.5, ICE, .8);
  drawGlow(-w * 1.15, 0, h * (ch ? .75 : .32), ch ? LANCEC : C, ch ? 1 : pulse);
}
function drawCyclone(e, w, h, C, pulse, ch) {
  thruster(w * .95, 0, h * .25, w * .45, ICE2);
  ctx.fillStyle = miniGrad(h, '#c8d6ea', '#5a6a8a', '#1a2234'); ctx.strokeStyle = `rgba(${C},.5)`; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.ellipse(0, 0, w * .95, h * .55, 0, 0, TAU); ctx.fill(); ctx.stroke();
  for (const s of [-1, 1]) {
    ctx.save(); ctx.translate(-w * .1, s * h * .78);
    ctx.fillStyle = '#2a3448'; ctx.beginPath(); ctx.ellipse(0, 0, w * .42, h * .3, 0, 0, TAU); ctx.fill();
    ctx.rotate(S.t * 9 * s); ctx.strokeStyle = 'rgba(220,235,255,.7)'; ctx.lineWidth = 2; for (let k = 0; k < 4; k++) { ctx.rotate(Math.PI / 2); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(w * .2, -h * .08, w * .36, 0); ctx.stroke(); }
    ctx.restore();
  }
  ctx.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 10; k++) { const q = (S.t * .9 + k / 10) % 1, a = k * 2.4 + S.t * 3; drawGlow(Math.cos(a) * w * (.3 + q * .9), Math.sin(a) * h * (.3 + q * 1.4), 3, '235,245,255', .7 * (1 - q)); }
  ctx.strokeStyle = `rgba(${C},.6)`; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(-w * .3, 0, h * .2, h * .45, 0, 0, TAU); ctx.stroke();
  drawGlow(-w * .9, 0, h * (ch ? .9 : .35), ch ? LANCEC : C, ch ? 1 : pulse); drawGlow(-w * .9, 0, h * .15, WHITE, .9);
}
function drawGlacierBack(e) {
  const w = e.hw, h = e.hh, gy = e.groundY - e.y, cx = w * 1.7, top = -h * 2.7, bw = w * 2.8;
  const g = ctx.createLinearGradient(0, top, 0, gy); g.addColorStop(0, '#e8f4fc'); g.addColorStop(.35, '#8ab0cc'); g.addColorStop(1, '#2a3e54');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(cx - bw, gy + 2); ctx.lineTo(cx - w * .9, top + h * .5); ctx.lineTo(cx - w * .3, top); ctx.lineTo(cx + w * .2, top + h * .3); ctx.lineTo(cx + w * .6, top - h * .2); ctx.lineTo(cx + bw, gy + 2); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - w * .3, top); ctx.lineTo(cx - w * .5, top + h * 1.2); ctx.moveTo(cx + w * .6, top - h * .2); ctx.lineTo(cx + w * .8, top + h * 1.4); ctx.stroke();
  ctx.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 2; k++) { const y0 = top - h * (.6 + k * .5); ctx.beginPath(); for (let x = -w; x <= w * 4; x += 20) ctx.lineTo(x, y0 + Math.sin(x * .01 + S.t * .6 + k) * h * .2); for (let x = w * 4; x >= -w; x -= 20) ctx.lineTo(x, y0 + h * .7 + Math.sin(x * .012 + S.t * .6 + k) * h * .2); ctx.closePath(); const ag = ctx.createLinearGradient(0, y0 - h * .3, 0, y0 + h); ag.addColorStop(0, 'rgba(90,255,170,0)'); ag.addColorStop(.5, `rgba(${k ? '170,120,255' : '90,255,170'},.16)`); ag.addColorStop(1, 'rgba(90,255,170,0)'); ctx.fillStyle = ag; ctx.fill(); }
  ctx.globalCompositeOperation = 'source-over';
}
function drawGlacierFront(e) {
  const w = e.hw, h = e.hh;
  ctx.fillStyle = 'rgba(235,248,255,.9)';
  for (const [y, x0, x1] of [[-h * 1.15, w * .12, w * 3], [-h * .75, -w * .12, w * 3], [h * .3, -w * .1, w * 3], [h * .38, -w * .44, -w * .15]]) {
    ctx.beginPath(); for (let x = x0 + 6; x < Math.min(x1, W - e.x + 20); x += 16 + ((x * 7) % 9)) { const L = 8 + ((x * 13) % 14); ctx.moveTo(x - 4, y); ctx.lineTo(x, y + L); ctx.lineTo(x + 4, y); } ctx.fill();
    ctx.fillRect(x0, y - 3, Math.min(x1, W - e.x + 20) - x0, 4);
  }
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 6; i++) { const x = ((S.t * 60 + i * 97) % (w * 2.5)) - w * .1, y = -h * (1.1 - (i % 3) * .5); drawGlow(x, y, 4, '235,250,255', .5 + .5 * Math.sin(S.t * 6 + i)); }
  ctx.globalCompositeOperation = 'source-over';
}

