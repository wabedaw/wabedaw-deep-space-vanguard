/* ---------- render ---------- */
function render() {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
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
}

