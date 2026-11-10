/* ---------- the Trench (side phase) ---------- */
function trenchWave() {
  const [minY, maxY] = baseBand(), r = Math.random(), n = 4 + ((Math.random() * 3) | 0), y0 = rand(minY + 20, Math.max(minY + 21, maxY - 20));
  if (r < .3) for (let i = 0; i < 2; i++) spawnAir('ace', W + 40 + i * 70, rand(minY, maxY));
  else for (let i = 0; i < n; i++) { const m = i - (n - 1) / 2; spawnAir('fighter', W + 40 + Math.abs(m) * 34, clamp(y0 + m * 26, minY, maxY), { amp: 6 }); }
}
function aceChase() {
  const [minY, maxY] = baseBand();
  for (let i = 0; i < 3; i++) { const a = spawnAir('ace', -40 - i * 70, clamp(P.y + (i - 1) * 50, minY, maxY)); a.tx = W * rand(.58, .8); }
  if (!S.aceTip) { S.aceTip = true; S.toast = { txt: I18('精英王牌机小队从后方追击！', 'Elite ace squadron closing from behind!'), t: 3 }; }
  sfx.alarm();
}
function finalLogic(dt) {
  const lv = levelOf(S.sector); S.sectorT += dt * (S.flow || 1);
  if (lv === 1) {
    if (S.boss || S.bossPending) return;
    S.tShip -= dt * (S.flow || 1); if (S.tShip <= 0 && S.sectorT < 24) { if (ships.length < 30) (Math.random() < .5 ? spawnWaveC : spawnWaveB)(); S.tShip = rand(1, 1.6); }
    S.tRock -= dt; if (S.tRock <= 0) { spawnRock(); S.tRock = rand(1, 2); }
    if (S.sectorT >= 26) { S.bossPending = true; S.warn = 3.4; sfx.warn(); S.warnName = BOSSES.omega.name; S.events.push({ t: 3, fn: spawnOmega }); }
  } else {
    if (!IW) return;
    if (!IW.flat && S.sectorT > 34) baseFlatFrom(S.wx + W + 40, true);
    if (S.boss || S.bossPending) return;
    if (S.sectorT >= 42) { S.bossPending = true; S.warn = 3.6; sfx.warn(); S.warnName = BOSSES.god.name; S.events.push({ t: 2.6, fn: spawnGod }); return; }
    S.tShip -= dt * (S.flow || 1); if (S.tShip <= 0) { if (ships.reduce((k, e) => k + (e.air ? 1 : 0), 0) < 12) trenchWave(); S.tShip = rand(1.5, 2.3); }
    S.tAce = (S.tAce ?? 7) - dt; if (S.tAce <= 0 && S.sectorT < 32) { aceChase(); S.tAce = rand(8, 11); }
  }
}
function drawTrenchFar() {
  const par = .3, TW = 300, off = S.wx * par;
  for (let k = Math.floor(off / TW) - 1; k * TW - off < W + TW; k++) {
    const x0 = k * TW - off, h = i => bhash(k + 4441, i);
    ctx.fillStyle = '#121318'; ctx.fillRect(x0 + 4, 0, TW - 8, H);
    for (let j = 0; j < 7; j++) { const y = H * (.12 + j * .12), w = 30 + h(j) * 120; ctx.fillStyle = j % 2 ? '#1a1c22' : '#16171c'; ctx.fillRect(x0 + h(j + 9) * (TW - w), y, w, H * .07); }
    ctx.globalCompositeOperation = 'lighter';
    for (let j = 0; j < 5; j++) { const y = H * (.15 + j * .17); drawGlow(x0 + TW * (.2 + .6 * h(j + 20)), y, 3, j % 2 ? '255,90,70' : '255,190,140', .5 + .4 * Math.sin(S.t * 4 + k + j)); }
    ctx.globalCompositeOperation = 'source-over';
  }
}
function drawTrenchShell() {
  const step = 8, n = Math.ceil(W / step) + 2, cs = [], fs = [];
  for (let i = 0; i <= n; i++) { const x = i * step - 8; cs.push(ceilAt(x)); fs.push(floorAt(x)); }
  for (const top of [true, false]) {
    const arr = top ? cs : fs, edgeY = top ? -10 : H + 10;
    ctx.beginPath(); ctx.moveTo(-8, edgeY); for (let i = 0; i <= n; i++) ctx.lineTo(i * step - 8, arr[i]); ctx.lineTo(n * step - 8, edgeY); ctx.closePath();
    const gr = top ? ctx.createLinearGradient(0, 0, 0, H * .3) : ctx.createLinearGradient(0, H, 0, H * .7);
    gr.addColorStop(0, '#0a0b0e'); gr.addColorStop(.6, '#2a2c34'); gr.addColorStop(1, '#4a4e58'); ctx.fillStyle = gr; ctx.fill();
    ctx.beginPath(); for (let i = 0; i <= n; i++) { const x = i * step - 8; i ? ctx.lineTo(x, arr[i]) : ctx.moveTo(x, arr[i]); } ctx.strokeStyle = '#9a9ea8'; ctx.lineWidth = 2; ctx.stroke();
  }
  for (const b of IW.blocks) {
    const x0 = b.start - S.wx, x1 = b.end - S.wx; if (x1 < -20 || x0 > W + 20) continue;
    const c = b.c * H, f = b.f * H;
    ctx.fillStyle = '#20222a'; for (let x = x0 + 10; x < x1 - 20; x += 46) { ctx.fillRect(x, c - 40, 34, 26); ctx.fillRect(x, f + 14, 34, 26); }
    ctx.globalCompositeOperation = 'lighter'; for (let x = x0 + 20; x < x1 - 10; x += 60) { const on = ((S.t * 3 + x * .01) | 0) % 2; drawGlow(x, c + 3, 6, on ? '255,80,60' : '255,170,120', .8); drawGlow(x, f - 3, 6, on ? '255,170,120' : '255,80,60', .8); } ctx.globalCompositeOperation = 'source-over';
  }
}
function drawBaseWorldD() {
  ctx.fillStyle = '#07070a'; ctx.fillRect(0, 0, W, H);
  const B = S.boss || ships.find(e => e.kind === 'god');
  if (B && B.kind === 'god') { drawGodChamber(B); drawTrenchShell(); drawBaseProps(); return; }
  drawTrenchFar(); ctx.fillStyle = 'rgba(5,4,6,.3)'; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 26; i++) { const y = (i * 97.3) % H, x = W - ((S.t * 1300 + i * 211) % (W + 300)); ctx.strokeStyle = 'rgba(255,200,180,.08)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 140, y); ctx.stroke(); } ctx.globalCompositeOperation = 'source-over';
  drawTrenchShell(); drawBaseProps();
}

