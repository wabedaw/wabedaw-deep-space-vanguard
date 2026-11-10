/* ---------- frost mid-bosses: Glacier dreadnought / Aurora carrier / Zenith ring ---------- */
function cryoBossGeo(b, lvl) {
  const mk = (ox, oy, R, type) => ({ ox, oy, r: R, r0: R, type, depth: 1, hp: 70 * lvl, maxhp: 70 * lvl, hitT: 0, aim: Math.PI / 2, dead: false, x: 0, y: 0 });
  b.cryoB = true;
  if (b.kind === 'glacier') {
    b.hw = clamp(W * .3, 120, 210); b.hh = b.hw * .42; b.r = b.hw; const R = clamp(b.hh * .26, 14, 24);
    b.parts = [mk(-b.hw * .62, -b.hh * .1, R, 'turret'), mk(b.hw * .62, -b.hh * .1, R, 'turret'), mk(-b.hw * .3, b.hh * .6, R, 'turret'), mk(b.hw * .3, b.hh * .6, R, 'turret'), mk(0, -b.hh * .55, R, 'missile')];
  } else if (b.kind === 'aurora') {
    b.hw = clamp(W * .34, 130, 230); b.hh = b.hw * .3; b.r = b.hw; const R = clamp(b.hh * .3, 14, 22);
    b.parts = [mk(-b.hw * .86, b.hh * .15, R, 'laser'), mk(b.hw * .86, b.hh * .15, R, 'laser'), mk(0, b.hh * .75, R, 'missile')];
  } else {
    b.r = clamp(Math.min(W, H) * .17, 80, 140); b.hw = b.r; b.hh = b.r; const R = clamp(b.r * .16, 14, 22);
    b.spin2 = 0; b.parts = [];
    for (let i = 0; i < 6; i++) { const p = mk(0, 0, R, i % 2 ? 'laser' : 'turret'); p.ang = i / 6 * TAU; b.parts.push(p); }
    zenithSpin(b, 0);
  }
}
function zenithSpin(e, dt) { e.spin2 = (e.spin2 || 0) + dt * (e.phase === 3 ? .7 : .4); for (const p of e.parts) { const a = p.ang + e.spin2; p.ox = Math.cos(a) * e.r * 1.05; p.oy = Math.sin(a) * e.r * 1.05; } }
function cryoGuns(e) {
  const w = e.hw, h = e.hh, r = e.r, t = e.parts.filter(p => !p.dead);
  if (e.kind === 'glacier') return { main: [0, h * .95], side: [[-w * .55, h * .7], [w * .55, h * .7]], top: [[-w * .4, -h * .8], [w * .4, -h * .8], [0, -h * .9]], core: [0, h * .15], turrets: t };
  if (e.kind === 'aurora') return { main: [0, h * .9], side: [[-w * .86, h * .15], [w * .86, h * .15]], top: [[-w * .5, -h * .6], [w * .5, -h * .6], [0, -h * .8]], core: [0, 0], turrets: t };
  const sd = t.slice(0, 2).map(p => [p.ox, p.oy]); while (sd.length < 2) sd.push(sd.length ? [r, 0] : [-r, 0]);
  return { main: [0, r * .3], side: sd, top: [[-r * .7, -r * .7], [r * .7, -r * .7], [0, -r]], core: [0, 0], turrets: t };
}
function iceFacet(pts, a, b, c, edge = 'rgba(235,250,255,.55)') {
  const g = ctx.createLinearGradient(pts[0][0], pts[0][1], pts[2][0], pts[2][1]); g.addColorStop(0, a); g.addColorStop(.5, b); g.addColorStop(1, c);
  ctx.fillStyle = g; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = edge; ctx.lineWidth = 1; ctx.stroke();
}
function drawGlacier(e, pulse) {
  const w = e.hw, h = e.hh, C = e.phase === 3 ? WARN : ICE;
  ctx.globalCompositeOperation = 'lighter'; for (const x of [-w * .4, 0, w * .4]) drawGlow(x, -h * 1.05, h * .45, ICE, .55); ctx.globalCompositeOperation = 'source-over';
  const P0 = [[-w, -h * .2], [-w * .7, -h], [w * .7, -h], [w, -h * .2], [w * .55, h * .9], [-w * .55, h * .9]];
  for (let i = 0; i < P0.length; i++) { const a = P0[i], b = P0[(i + 1) % P0.length]; iceFacet([[0, h * .1], a, b], i % 2 ? '#dff4ff' : '#a6d4ee', i % 2 ? '#7ab0d0' : '#5a90b4', '#1c3a54'); }
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { const x = s * w * (.3 + k * .18); ctx.fillStyle = k % 2 ? '#cfeeff' : '#9ccbe6'; ctx.beginPath(); ctx.moveTo(x - 7, h * (.75 - k * .12)); ctx.lineTo(x, h * (1.25 - k * .1)); ctx.lineTo(x + 7, h * (.75 - k * .12)); ctx.closePath(); ctx.fill(); }
  ctx.save(); ctx.translate(0, h * .15); ctx.rotate(S.t * .6);
  iceFacet([[0, -h * .42], [h * .3, 0], [0, h * .42]], '#ffffff', `rgb(${C})`, '#3a7aa8'); iceFacet([[0, -h * .42], [-h * .3, 0], [0, h * .42]], '#e8f8ff', '#7ac8f0', '#1c4a70');
  ctx.restore();
  ctx.globalCompositeOperation = 'lighter'; drawGlow(0, h * .15, h * .8, C, .35 + .25 * pulse); drawGlow(0, h * .15, h * .2, WHITE, .9);
  if (rnd() < .4 && parts.length < 1300) parts.push({ k: 'ember', x: e.x + rand(-w, w) * .8, y: e.y + rand(-h, h), vx: rand(-20, 20), vy: rand(20, 60), life: .8, max: .8, c: '235,250,255', r: 1.4 });
  ctx.globalCompositeOperation = 'source-over';
  for (const p of e.parts) drawModule(e, p, pulse);
}
function drawAuroraBoss(e, pulse) {
  const w = e.hw, h = e.hh, C = e.phase === 3 ? WARN : '120,255,200';
  ctx.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 3; k++) {
    const x0 = (k - 1) * w * .55, col = k === 1 ? ICE2 : '120,255,190';
    ctx.beginPath(); ctx.moveTo(x0 - w * .25, -h * .2);
    for (let y = 0; y <= 1; y += .1) ctx.lineTo(x0 - w * .25 + Math.sin(S.t * 2 + y * 5 + k) * w * .08, -h * .2 - y * h * 3.2);
    for (let y = 1; y >= 0; y -= .1) ctx.lineTo(x0 + w * .25 + Math.sin(S.t * 2 + y * 5 + k + 1) * w * .08, -h * .2 - y * h * 3.2);
    const g = ctx.createLinearGradient(0, -h * .2, 0, -h * 3.4); g.addColorStop(0, `rgba(${col},.45)`); g.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = g; ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
  const g = ctx.createLinearGradient(0, -h, 0, h); g.addColorStop(0, '#2a4060'); g.addColorStop(.5, '#14243a'); g.addColorStop(1, '#070e1a');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, h * 1.1); ctx.quadraticCurveTo(w * .4, h * .3, w, h * .25); ctx.lineTo(w * .88, -h * .25); ctx.quadraticCurveTo(w * .4, -h * .1, w * .2, -h * .9); ctx.lineTo(0, -h * .6); ctx.lineTo(-w * .2, -h * .9); ctx.quadraticCurveTo(-w * .4, -h * .1, -w * .88, -h * .25); ctx.lineTo(-w, h * .25); ctx.quadraticCurveTo(-w * .4, h * .3, 0, h * 1.1); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = `rgba(${C},.6)`; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = `rgba(${C},.5)`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-w * .95, h * .2); ctx.quadraticCurveTo(0, h * .6, w * .95, h * .2); ctx.stroke();
  for (let i = -4; i <= 4; i++) drawGlow(i * w * .2, h * (.3 + .25 * (1 - Math.abs(i) / 4)), 3, i % 2 ? ICE2 : C, .8);
  drawGlow(0, h * .2, h * .9, C, .3 + .2 * pulse); drawGlow(0, h * .35, h * .25, WHITE, .8);
  ctx.globalCompositeOperation = 'source-over';
  for (const p of e.parts) drawModule(e, p, pulse);
}
function drawZenith(e, pulse) {
  const r = e.r, C = e.phase === 3 ? WARN : ICE, ch = lances.some(l => l.owner === e && l.t < l.charge);
  ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, r * 2, C, ch ? .5 : .22); ctx.globalCompositeOperation = 'source-over';
  ctx.save(); ctx.rotate(e.spin2 || 0);
  ctx.strokeStyle = '#1e3448'; ctx.lineWidth = r * .22; ctx.beginPath(); ctx.arc(0, 0, r * 1.05, 0, TAU); ctx.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; ctx.save(); ctx.rotate(a); iceFacet([[r * .93, -r * .1], [r * 1.18, -r * .06], [r * 1.18, r * .06], [r * .93, r * .1]], '#e8f8ff', '#8cc4e4', '#2a5070'); ctx.restore(); }
  ctx.strokeStyle = 'rgba(160,220,250,.5)'; ctx.lineWidth = 3; for (let i = 0; i < 3; i++) { const a = i / 3 * TAU; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * .3, Math.sin(a) * r * .3); ctx.lineTo(Math.cos(a) * r * .92, Math.sin(a) * r * .92); ctx.stroke(); }
  ctx.restore();
  ctx.save(); ctx.rotate(-S.t * .8);
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; ctx.save(); ctx.rotate(a); iceFacet([[0, 0], [r * .12, -r * .34], [0, -r * .42], [-r * .12, -r * .34]], '#ffffff', '#a8dcf8', '#3a6a90'); ctx.restore(); }
  ctx.restore();
  ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, r * (ch ? .6 : .35), WHITE, ch ? 1 : .8); drawGlow(0, 0, r * .9, C, .35 * pulse);
  ctx.globalCompositeOperation = 'source-over';
  for (const p of e.parts) drawModule(e, p, pulse);
}

