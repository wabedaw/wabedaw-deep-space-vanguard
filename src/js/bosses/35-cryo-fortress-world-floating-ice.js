/* ---------- cryo fortress world: floating ice shards on an inclined orbit ---------- */
function drawCryoShards(e, front) {
  const F = e.fx, pcy = F.cy, ra = F.ra * 1.12, rb = F.rb * 1.02, tilt = -.32, live = !e.dying;
  ctx.save(); ctx.translate(0, pcy); ctx.rotate(tilt);
  for (let i = 0; i < 26; i++) {
    const th = (i / 26) * TAU + S.t * .05, s = Math.sin(th); if ((s > 0) !== !!front) continue;
    const x = Math.cos(th) * ra, y = s * rb, sz = 10 + (i * 37 % 13) * (front ? 1.4 : .9);
    ctx.save(); ctx.translate(x, y); ctx.rotate(i * 1.7 + S.t * (.2 + (i % 3) * .1));
    iceFacet([[0, -sz], [sz * .7, -sz * .2], [sz * .4, sz * .8], [-sz * .5, sz * .6], [-sz * .7, -sz * .3]], front ? '#f2fbff' : '#9cc4dc', front ? '#9ad0ec' : '#5a7c98', front ? '#3a6a8c' : '#1e3448');
    if (front && live) { ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, sz * .9, ICE, .25 + .15 * Math.sin(S.t * 3 + i)); ctx.globalCompositeOperation = 'source-over'; }
    ctx.restore();
  }
  ctx.restore();
}
function drawSpaceTintC() {
  const g = ctx.createRadialGradient(W * .3, H * .15, 0, W * .3, H * .15, Math.max(W, H) * .9);
  g.addColorStop(0, 'rgba(120,200,255,.13)'); g.addColorStop(.5, 'rgba(90,255,190,.06)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over';
}

