/* ---------- render ---------- */
function render() { RNG.fx = true; try { renderFrame(); } finally { RNG.fx = false; } }
function renderFrame() {
  ctx.setTransform(DPR, 0, 0, DPR, VIEW.vx, VIEW.vy);
  const sx = S.shake ? rand(-S.shake, S.shake) : 0, sy = S.shake ? rand(-S.shake, S.shake) : 0;
  ctx.save(); ctx.translate(sx, sy);
  ctx.fillStyle = '#03050b'; ctx.fillRect(-20, -20, W + 40, H + 40);
  if (IW) drawBaseWorld();
  else if (S.side && GW) drawSideWorld();
  else {
    drawBackground();
    for (const h of holes) drawHole(h);
    for (const h of holes) drawHoleZone(h);
    drawForeStars();
    drawSats();
  }
  drawTransBack();
  drawPowers();
  for (const k of rocks) drawRock(k);
  for (const e of ships) drawShip(e);
  drawParticles();
  drawProjectiles();
  drawBeams();
  drawPlayerBeam();
  drawUlt();
  drawPlayer();
  drawLances();
  if (S.mode === 'menu' || S.mode === 'launch') drawHero();
  drawLock();
  if (S.side && GW) drawSideFront(); else if (IW) drawBaseFront();
  drawGodFront();
  drawTransFx();
  drawTexts();
  if (!P.cap && S.mode !== 'menu' && S.mode !== 'launch') for (const h of holes) drawHoleTag(h);
  ctx.restore();
  // post
  ctx.drawImage(vignette, 0, 0, W, H);
  let holeK = 0;
  if (S.mode === 'play' && P.alive) holeK = P.cap ? .6 + .4 * clamp(P.cap.t / P.cap.dur, 0, 1) : S.holeNear * .55;
  if (S.dmgFlash > 0 || holeK > 0) {
    const a = Math.max(S.dmgFlash * .55, holeK * .5);
    const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .3, W / 2, H / 2, Math.hypot(W, H) * .6);
    g.addColorStop(0, 'rgba(255,40,30,0)'); g.addColorStop(1, `rgba(${holeK > S.dmgFlash ? '255,120,40' : '255,40,30'},${a})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  if (S.wflash > 0) { ctx.fillStyle = `rgba(225,250,255,${S.wflash * .7})`; ctx.fillRect(0, 0, W, H); }
  drawHUD();
  drawLetterbox();
}
// cover whatever the field drew past its edges (screen shake, off-field spawns) on screens of another shape
function drawLetterbox() {
  const x0 = VIEW.vx, y0 = VIEW.vy; if (x0 <= 0 && y0 <= 0) return;
  const fw = Math.round(W * DPR), fh = Math.round(H * DPR), cw = cv.width, ch = cv.height;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#010207';
  if (y0 > 0) { ctx.fillRect(0, 0, cw, y0); ctx.fillRect(0, y0 + fh, cw, ch - y0 - fh); }
  if (x0 > 0) { ctx.fillRect(0, 0, x0, ch); ctx.fillRect(x0 + fw, 0, cw - x0 - fw, ch); }
  // a thin frame with corner brackets in the HUD style (from the cloud branch's step 3b)
  const d = VIEW.dpr, a = x0 - .5 * d, b = y0 - .5 * d, e = x0 + fw + .5 * d, f = y0 + fh + .5 * d, c = 18 * d;
  ctx.strokeStyle = 'rgba(94,242,255,.16)'; ctx.lineWidth = d; ctx.strokeRect(a, b, e - a, f - b);
  ctx.strokeStyle = 'rgba(94,242,255,.5)'; ctx.lineWidth = 1.5 * d; ctx.beginPath();
  for (const [x, y, dx, dy] of [[a, b, 1, 1], [e, b, -1, 1], [a, f, 1, -1], [e, f, -1, -1]]) { ctx.moveTo(x + dx * c, y); ctx.lineTo(x, y); ctx.lineTo(x, y + dy * c); }
  ctx.stroke();
  ctx.restore();
}

