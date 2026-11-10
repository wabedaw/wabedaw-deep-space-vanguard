/* ---------- surface mini-bosses (levels 3 / 6 / 9) and Colossus escorts ---------- */
const SIDE_MINIS = ['thunder', 'whale', 'tempest'];
const MINI_SHORT = { thunder: I18('雷鸟级', 'THUNDERBIRD'), whale: I18('巨鲸级', 'SKYWHALE'), tempest: I18('风暴级', 'TEMPEST') };
const MINI_COL = { thunder: '120,220,255', whale: '255,190,110', tempest: '255,90,150' };
function spawnSideMini(kind, o = {}) {
  const n = cycOf(stageOf(S.sector)), idx = Math.max(SIDE_MINIS.indexOf(kind), SIDE_MINIS_B.indexOf(kind), SIDE_MINIS_C.indexOf(kind)), def = BOSSES[kind], esc = !!o.escort;
  const lvl = 1.2 + idx * .15 + (n - 1) * .3 + (esc ? .1 : 0);
  const b = { type: 'boss', kind, n, tier: n - 1, lvl, t: 0, swayT: rand(0, 6), hitT: 0, phase: 1, pi: 0, cur: null, hold: 0, entered: false,
    parts: [], spin: 0, side: 1, alt: false, ring: 0, ph: rand(0, TAU), gap: 0, dir: Math.PI, sideBoss: true, escort: esc, tilt: 0 };
  if (SIDE_MINIS_C.includes(kind)) miniGeoC(b);
  else if (SIDE_MINIS_B.includes(kind)) miniGeoB(b);
  else if (kind === 'thunder') { b.hw = clamp(W * .12, 62, 118); b.hh = b.hw * .36; }
  else if (kind === 'whale') { b.hw = clamp(W * .19, 92, 190); b.hh = b.hw * .34; }
  else { b.hw = clamp(W * .15, 76, 150); b.hh = b.hw * .4; }
  b.r = b.hw;
  const R = Math.max(11, b.hh * (kind === 'whale' ? .5 : .55)), php = 60 * lvl * (esc ? .7 : 1);
  const pdef = MINI_PARTS_B[kind] || MINI_PARTS_C[kind] || (kind === 'thunder' ? [['turret', .05, -.95], ['turret', -.15, .95]] : kind === 'whale' ? [['turret', -.42, -1], ['turret', .3, -1.02], ['turret', -.1, 1.02]] : [['laser', .3, -1.05], ['laser', .3, 1.05]]);
  b.parts = pdef.map(([type, ox, oy], i) => ({ type, i, ox: ox * b.hw, oy: oy * b.hh, r0: R, r: R, depth: 1, hp: php, maxhp: php, hitT: 0, aim: Math.PI, dead: false, hidden: false, x: 0, y: 0 }));
  b.hp = b.maxhp = def.hp * (1 + (n - 1) * .6) * (esc ? .6 : 1);
  b.score = Math.round(def.score * (1 + (n - 1) * .5) * (esc ? .5 : 1));
  const [top, bot] = miniBand(b);
  b.x = W + b.hw + 50; b.y = (top + bot) / 2;
  ships.push(b); if (!esc) S.boss = b;
  return b;
}
function miniBand(e) {
  const top = inset.t + 64 + e.hh;
  let bot = Math.min(H * .7, (GW ? minTopAhead() : H) - e.hh - 24);
  const B = S.boss;
  if (e.escort && B && B.kind === 'colossus') bot = Math.min(bot, B.y - B.hh * 1.25 - e.hh);
  return [top, Math.max(top, bot)];
}
function updateSideMini(e, dt) {
  const [top, bot] = miniBand(e), oy = e.y;
  const tx = e.escort ? W * (.52 + .1 * Math.sin(e.swayT * .23 + e.ph)) : W - e.hw - Math.max(36, W * .05) - inset.r + Math.sin(e.swayT * .31) * W * .035;
  let ty;
  if (e.lanceT > 0) { e.lanceT -= dt; ty = e.lanceY; }
  else if (e.kind === 'thunder' || e.kind === 'phoenix' || e.kind === 'frostwing') ty = clamp(P.y, top, bot) * .55 + ((top + bot) / 2 + Math.sin(e.swayT * .7 + e.ph) * (bot - top) * .45) * .45;
  else ty = (top + bot) / 2 + Math.sin(e.swayT * (e.kind === 'whale' || e.kind === 'anvil' || e.kind === 'icebreaker' ? .35 : .55) + e.ph) * (bot - top) * .45;
  ty = e.lanceT > 0 ? clamp(ty, inset.t + 40 + e.hh * .5, Math.max(inset.t + 40 + e.hh * .5, (GW ? solidTopAt(clamp(e.x, 0, W)) : H) - e.hh * .7)) : clamp(ty, top, bot);
  if (!e.entered) {
    const k = Math.min(1, dt * 1.3); e.x += (tx - e.x) * k; e.y += (ty - e.y) * k;
    if (Math.abs(tx - e.x) < 10) e.entered = true;
  } else {
    const k = Math.min(1, dt * (e.lanceT > 0 ? 2.6 : e.kind === 'thunder' || e.kind === 'phoenix' || e.kind === 'frostwing' ? 1.6 : e.kind === 'tempest' || e.kind === 'wyrm' || e.kind === 'cyclone' ? 1.2 : .8));
    e.x += (tx - e.x) * k; e.y += (ty - e.y) * k;
  }
  const vy = (e.y - oy) / Math.max(dt, .001);
  e.tilt += (clamp(-vy / 900, -.1, .1) - e.tilt) * Math.min(1, dt * 5);
  if (e.kind === 'wyrm') { e.tilt = 0; for (const p of e.parts) p.oy = wyrmY(e, p.ox); }
  for (const p of e.parts) { p.x = e.x + p.ox; p.y = e.y + p.oy; }
}
function spawnEscort(kind) {
  spawnSideMini(kind, { escort: true });
  S.toast = { txt: I18('护卫舰回援 · ', 'Escort inbound · ') + MINI_SHORT[kind], t: 2.6 }; sfx.alarm();
}
function escortDown(e) {
  clearBeamsOf(e);
  for (let i = 0; i < 6; i++) S.events.push({ t: i * .12, fn: () => { const bx = e.x + rand(-e.hw, e.hw) * .7; explode(bx, e.y + rand(-e.hh, e.hh) * .6, rand(26, 44), i % 2 ? PLAS : FIRE); sfx.boom(40, bx, 'ship'); } });
  S.events.push({ t: .75, fn: () => { explode(e.x, e.y, 90, FIRE, { debris: '90,80,110' }); sfx.boom(120, e.x, 'big'); shake(14); addScore(e.score, e.x, e.y); dropPower(e.x, e.y, pick(['W', 'H', 'M', 'S'])); } });
  floatText(e.x, e.y - e.hh - 24, I18('护卫舰击毁', 'ESCORT DOWN'), FLARE, true);
}
function miniGrad(h, a = '#9aa3b6', b = '#4a5262', c = '#1a1d25') { const g = ctx.createLinearGradient(0, -h, 0, h); g.addColorStop(0, a); g.addColorStop(.5, b); g.addColorStop(1, c); return g; }
function thruster(x, y, r, len, c) {
  ctx.globalCompositeOperation = 'lighter';
  const fl = .8 + .2 * Math.sin(S.t * 50 + x + y), L = len * fl;
  const g = ctx.createLinearGradient(x, 0, x + L, 0); g.addColorStop(0, `rgba(${c},.9)`); g.addColorStop(1, `rgba(${c},0)`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + L, y); ctx.lineTo(x, y + r); ctx.closePath(); ctx.fill();
  drawGlow(x, y, r * 2.2, c, .8); drawGlow(x, y, r * .8, WHITE, .9);
  ctx.globalCompositeOperation = 'source-over';
}
function drawSideMini(e, pulse) {
  const w = e.hw, h = e.hh, C = e.phase === 3 ? WARN : MINI_COL[e.kind];
  const ch = lances.some(l => l.owner === e && l.t < l.charge) || beams.some(b => b.owner === e && b.t < b.charge);
  ctx.save(); ctx.rotate(e.tilt || 0);
  ctx.lineJoin = 'round';
  if (e.kind === 'frostwing') drawFrostwing(e, w, h, C, pulse, ch);
  else if (e.kind === 'icebreaker') drawIcebreaker(e, w, h, C, pulse, ch);
  else if (e.kind === 'cyclone') drawCyclone(e, w, h, C, pulse, ch);
  else if (e.kind === 'phoenix') drawPhoenix(e, w, h, C, pulse, ch);
  else if (e.kind === 'anvil') drawAnvil(e, w, h, C, pulse, ch);
  else if (e.kind === 'wyrm') drawWyrm(e, w, h, C, pulse, ch);
  else if (e.kind === 'thunder') drawThunder(w, h, C, pulse, ch);
  else if (e.kind === 'whale') drawWhale(w, h, C, pulse, ch);
  else drawTempest(e, w, h, C, pulse, ch);
  ctx.restore(); ctx.globalCompositeOperation = 'source-over';
  for (const p of e.parts) drawModule(e, p, pulse);
}
function drawThunder(w, h, C, pulse, ch) {
  thruster(w * .98, -h * .12, h * .2, w * .55, '255,170,90'); thruster(w * .92, h * .24, h * .14, w * .38, '255,170,90');
  ctx.fillStyle = '#1e222b'; ctx.beginPath(); ctx.moveTo(-w * .1, -h * .2); ctx.lineTo(w * .45, -h * .3); ctx.lineTo(w * .72, -h * 1.0); ctx.lineTo(w * .4, -h * .96); ctx.closePath(); ctx.fill();
  ctx.fillStyle = miniGrad(h * .6); ctx.strokeStyle = `rgba(${C},.5)`; ctx.lineWidth = 1.3;
  ctx.beginPath(); ctx.moveTo(-w, h * .05); ctx.lineTo(-w * .62, -h * .38); ctx.lineTo(-w * .1, -h * .55); ctx.lineTo(w * .62, -h * .5); ctx.lineTo(w, -h * .3); ctx.lineTo(w, h * .32); ctx.lineTo(w * .55, h * .5); ctx.lineTo(-w * .5, h * .42); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = miniGrad(h, '#7d8597', '#3a404d', '#1b1d24'); ctx.beginPath(); ctx.moveTo(w * .4, -h * .5); ctx.lineTo(w * .78, -h * 1.15); ctx.lineTo(w * .96, -h * 1.1); ctx.lineTo(w * .9, -h * .42); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = miniGrad(h, '#8a92a4', '#454b5a', '#1d2028'); ctx.beginPath(); ctx.moveTo(-w * .2, h * .2); ctx.lineTo(w * .45, h * .18); ctx.lineTo(w * .8, h * 1.0); ctx.lineTo(w * .44, h * 1.02); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1; ctx.beginPath(); for (const x of [-.35, .05, .4, .75]) { ctx.moveTo(x * w, -h * .45); ctx.lineTo(x * w, h * .4); } ctx.stroke();
  ctx.strokeStyle = `rgba(${C},.8)`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-w * .55, h * .06); ctx.lineTo(w * .86, h * .02); ctx.stroke();
  const cg = ctx.createLinearGradient(-w * .7, -h * .55, -w * .3, -h * .15); cg.addColorStop(0, '#e2f8ff'); cg.addColorStop(.5, `rgb(${MINI_COL.thunder})`); cg.addColorStop(1, '#0b2a3a');
  ctx.fillStyle = cg; ctx.beginPath(); ctx.moveTo(-w * .68, -h * .3); ctx.quadraticCurveTo(-w * .5, -h * .64, -w * .2, -h * .53); ctx.lineTo(-w * .3, -h * .25); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2a2e38'; ctx.fillRect(-w * 1.1, -h * .08, w * .38, h * .16);
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(-w * 1.1, 0, h * (ch ? .75 : .32), ch ? LANCEC : C, ch ? 1 : pulse);
  drawGlow(w * .93, -h * 1.12, 3, '255,60,60', ((S.t * 2) | 0) % 2 ? 1 : .2); drawGlow(-w * .1, h * .44, 2.5, C, .8);
}
function drawWhale(w, h, C, pulse, ch) {
  for (const y of [-h * .45, h * .4]) thruster(w * 1.02, y, h * .17, w * .32, '120,200,255');
  ctx.fillStyle = miniGrad(h, '#6d7383', '#3a3f4c', '#17191f'); ctx.strokeStyle = `rgba(${C},.45)`; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(w * .55, -h * .7); ctx.lineTo(w * .82, -h * 1.45); ctx.lineTo(w * 1.0, -h * 1.4); ctx.lineTo(w * .95, -h * .6); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(w * .6, h * .65); ctx.lineTo(w * .85, h * 1.25); ctx.lineTo(w * 1.0, h * 1.2); ctx.lineTo(w * .95, h * .55); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = miniGrad(h, '#9aa2b4', '#4d5464', '#1c1f27');
  ctx.beginPath(); ctx.moveTo(-w, h * .05); ctx.bezierCurveTo(-w, -h * .85, -w * .5, -h, -w * .1, -h); ctx.lineTo(w * .7, -h * .85); ctx.quadraticCurveTo(w * 1.02, -h * .55, w * 1.02, 0); ctx.quadraticCurveTo(w * 1.02, h * .6, w * .7, h * .8); ctx.lineTo(-w * .45, h * .85); ctx.bezierCurveTo(-w * .85, h * .8, -w, h * .45, -w, h * .05); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 1; ctx.beginPath(); for (let x = -.7; x < .95; x += .16) { ctx.moveTo(x * w, -h * .92); ctx.lineTo(x * w, h * .8); } ctx.stroke();
  ctx.strokeStyle = `rgba(${C},.6)`; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-w * .9, h * .3); ctx.lineTo(w * .95, h * .3); ctx.stroke();
  ctx.fillStyle = miniGrad(h, '#8a92a4', '#4a5160', '#22252e'); ctx.fillRect(-w * .78, -h * 1.22, w * .22, h * .32);
  ctx.fillStyle = '#0e1015'; ctx.fillRect(-w * .55, h * .48, w * .72, h * .32);
  ctx.globalCompositeOperation = 'lighter';
  for (let r = 0; r < 2; r++) for (let x = -w * .75; x < w * .8; x += w * .07) drawGlow(x, -h * (.5 - r * .3), 1.8, (((x / 9) | 0) + r) % 5 ? '255,220,160' : C, .75);
  for (let i = 0; i < 6; i++) drawGlow(-w * .5 + i * w * .12, h * .64, 4, (((S.t * 4) | 0) + i) % 3 ? '255,170,90' : WHITE, .9);
  for (let i = 0; i < 4; i++) drawGlow(-w * .75 + i * w * .055, -h * 1.08, 1.8, '160,230,255', .9);
  drawGlow(-w * .93, h * .05, h * (ch ? .6 : .26), ch ? LANCEC : C, ch ? 1 : pulse);
}
function drawTempest(e, w, h, C, pulse, ch) {
  thruster(w * 1.0, 0, h * .3, w * .55, '190,140,255');
  ctx.fillStyle = miniGrad(h, '#6d7383', '#3a3f4c', '#17191f'); ctx.strokeStyle = `rgba(${C},.5)`; ctx.lineWidth = 1.2;
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(w * .05, s * h * .4); ctx.lineTo(w * .26, s * h * 1.02); ctx.lineTo(w * .62, s * h * 1.06); ctx.lineTo(w * .72, s * h * .4); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  ctx.fillStyle = miniGrad(h * .7, '#a0a8ba', '#4a5160', '#1a1c23');
  ctx.beginPath(); ctx.moveTo(-w * .7, 0); ctx.lineTo(-w * .35, -h * .38); ctx.lineTo(w * .55, -h * .55); ctx.lineTo(w, -h * .32); ctx.lineTo(w, h * .32); ctx.lineTo(w * .55, h * .55); ctx.lineTo(-w * .35, h * .38); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = miniGrad(h * .4, '#8a92a4', '#3a404d', '#16181e');
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(-w * .4, s * h * .16); ctx.lineTo(-w * 1.12, s * h * .1); ctx.lineTo(-w * 1.05, s * h * .27); ctx.lineTo(-w * .38, s * h * .37); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1; ctx.beginPath(); for (const x of [-.2, .35, .7]) { ctx.moveTo(x * w, -h * .48); ctx.lineTo(x * w, h * .48); } ctx.stroke();
  ctx.strokeStyle = `rgba(${C},.75)`; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-w * .3, 0); ctx.lineTo(w * .92, 0); ctx.stroke();
  ctx.globalCompositeOperation = 'lighter';
  for (const [x, k] of [[-.12, 0], [.2, 1]]) { ctx.strokeStyle = `rgba(${C},${.45 + .35 * Math.sin(S.t * 5 + k * 2)})`; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.ellipse(x * w, 0, h * .14, h * .62, 0, 0, TAU); ctx.stroke(); }
  ctx.strokeStyle = `rgba(255,205,230,${ch ? .95 : .45})`; ctx.lineWidth = 1.4; zap(-w * .98, -h * .15, -w * .98, h * .15, e.ph, 5);
  drawGlow(-w * .9, 0, h * (ch ? .95 : .36), ch ? LANCEC : C, ch ? 1 : pulse); drawGlow(-w * .9, 0, h * .15, WHITE, .9);
}

