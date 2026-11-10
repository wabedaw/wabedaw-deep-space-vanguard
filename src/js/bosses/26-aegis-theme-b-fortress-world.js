/* ---------- Aegis: theme-B fortress world (hive planet with a second spiked ring) ---------- */
function drawAegisRing(e, front) {
  const F = e.fx, pcy = F.cy, ra = F.ra * 1.08, rb = F.rb * .99, tilt = .36, RW = clamp(W * .012, 7, 14), live = !e.dying;
  ctx.save(); ctx.translate(0, pcy); ctx.rotate(tilt);
  const a0 = front ? 0 : Math.PI, a1 = front ? Math.PI : TAU;
  ctx.beginPath(); for (let i = 0; i <= 60; i++) { const th = a0 + (a1 - a0) * i / 60; i ? ctx.lineTo(Math.cos(th) * ra, Math.sin(th) * rb) : ctx.moveTo(Math.cos(th) * ra, Math.sin(th) * rb); }
  ctx.strokeStyle = front ? '#2a1f33' : '#1a1422'; ctx.lineWidth = RW + 3; ctx.stroke();
  ctx.strokeStyle = front ? '#5a4668' : '#3a2e46'; ctx.lineWidth = RW; ctx.stroke();
  ctx.setLineDash([3, 14]); ctx.lineDashOffset = -S.t * 40; ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = live ? `rgba(${HIVE},${front ? .8 : .35})` : 'rgba(255,150,70,.5)'; ctx.lineWidth = RW * .3; ctx.stroke();
  ctx.setLineDash([]); ctx.lineDashOffset = 0; ctx.globalCompositeOperation = 'source-over';
  for (let i = 0; i < 18; i++) {
    const th = a0 + (a1 - a0) * (i + .5) / 18 + (S.t * .05) % ((a1 - a0) / 18), x = Math.cos(th) * ra, y = Math.sin(th) * rb, nx = Math.cos(th) / ra, ny = Math.sin(th) / rb, nl = Math.hypot(nx, ny), L = RW * 1.6;
    ctx.fillStyle = front ? '#4a3a58' : '#2c2238'; ctx.beginPath(); ctx.moveTo(x - ny / nl * RW * .5, y + nx / nl * RW * .5); ctx.lineTo(x + nx / nl * L, y + ny / nl * L); ctx.lineTo(x + ny / nl * RW * .5, y - nx / nl * RW * .5); ctx.closePath(); ctx.fill();
    if (front && live) { ctx.globalCompositeOperation = 'lighter'; drawGlow(x + nx / nl * L, y + ny / nl * L, 4, HIVE, .5 + .4 * Math.sin(S.t * 3 + i)); ctx.globalCompositeOperation = 'source-over'; }
  }
  ctx.restore();
}

