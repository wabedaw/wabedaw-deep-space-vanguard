/* ---------- hive enemy art (top-down, facing down) ---------- */
function drawHive(e, pulse) {
  const r = e.r;
  if (e.type === 'wasp') {
    ctx.rotate(e.state ? e.aim - Math.PI / 2 : Math.sin(e.t * 2.4 + e.ph) * .25);
    const fl = Math.sin(e.t * 60);
    ctx.globalCompositeOperation = 'lighter';
    for (const s of [-1, 1]) { ctx.fillStyle = `rgba(180,255,200,${.16 + .1 * fl})`; ctx.beginPath(); ctx.ellipse(s * 9, -4, 9, 4 + 2 * fl, s * .5, 0, TAU); ctx.fill(); }
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#1d2716'; ctx.beginPath(); ctx.ellipse(0, -9, 5, 9.5, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = `rgba(${HIVE},.75)`; ctx.lineWidth = 1.4; ctx.beginPath(); for (const y of [-14, -10, -6]) { ctx.moveTo(-4, y); ctx.lineTo(4, y); } ctx.stroke();
    const g = ctx.createRadialGradient(-2, 0, 1, 0, 2, 7); g.addColorStop(0, '#5a6e44'); g.addColorStop(1, '#1c2414');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 2, 6, 5.5, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#2b3820'; ctx.beginPath(); ctx.ellipse(0, 9, 4.5, 4, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#a7c47a'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(-2.5, 12); ctx.quadraticCurveTo(-5, 16, -2, 17); ctx.moveTo(2.5, 12); ctx.quadraticCurveTo(5, 16, 2, 17); ctx.stroke();
    ctx.globalCompositeOperation = 'lighter'; drawGlow(-2, 9, 3, HIVE, 1); drawGlow(2, 9, 3, HIVE, 1);
    if (e.state === 1) drawGlow(0, 2, 18, HIVE, .8);
  } else if (e.type === 'mantis') {
    ctx.rotate(Math.sin(e.t * 1.5) * .08);
    ctx.globalCompositeOperation = 'lighter';
    for (const s of [-1, 1]) { ctx.fillStyle = 'rgba(160,240,200,.14)'; ctx.beginPath(); ctx.ellipse(s * 15, -10, 15, 6, s * .6, 0, TAU); ctx.fill(); }
    ctx.globalCompositeOperation = 'source-over';
    const g = ctx.createLinearGradient(-9, 0, 9, 0); g.addColorStop(0, '#1f3a32'); g.addColorStop(.5, '#4f8a6c'); g.addColorStop(1, '#1a2f28');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, -8, 8, 17, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 1; ctx.beginPath(); for (const y of [-16, -8, 0]) { ctx.moveTo(-7, y); ctx.quadraticCurveTo(0, y + 3, 7, y); } ctx.stroke();
    ctx.fillStyle = '#3e6e58'; ctx.beginPath(); ctx.moveTo(-7, 8); ctx.lineTo(7, 8); ctx.lineTo(0, 20); ctx.closePath(); ctx.fill();
    const sw = Math.sin(e.t * 3) * .15;
    ctx.lineCap = 'round';
    for (const s of [-1, 1]) {
      ctx.save(); ctx.translate(s * 7, 6); ctx.rotate(s * (.2 + sw));
      ctx.strokeStyle = '#90a87a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(s * 12, 8); ctx.stroke();
      ctx.strokeStyle = '#d5e8b8'; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(s * 12, 8); ctx.quadraticCurveTo(s * 22, 12, s * 18, 26); ctx.stroke();
      ctx.restore();
    }
    ctx.lineCap = 'butt';
    ctx.globalCompositeOperation = 'lighter'; drawGlow(-3, 13, 3.5, HIVE, pulse); drawGlow(3, 13, 3.5, HIVE, pulse); drawGlow(0, -6, 10, HIVE, .25);
  } else if (e.type === 'brood') {
    for (let k = 0; k < 4; k++) { const x = (k - 1.5) * r * .4; ctx.strokeStyle = '#3a2347'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, r * .5); ctx.quadraticCurveTo(x + Math.sin(e.t * 2 + k) * 8, r * .9, x + Math.sin(e.t * 2.4 + k) * 12, r * 1.2); ctx.stroke(); }
    const g = ctx.createRadialGradient(-r * .3, -r * .35, r * .1, 0, 0, r); g.addColorStop(0, '#6a3f80'); g.addColorStop(.55, '#33204a'); g.addColorStop(1, '#100a18');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, r, r * .86, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = 2; for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.ellipse(0, 0, r * (.3 + Math.abs(k) * .17), r * .84, 0, -Math.PI * .9, -Math.PI * .1); ctx.stroke(); }
    ctx.strokeStyle = `rgba(${HIVE},.35)`; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(0, 0, r, r * .86, 0, 0, TAU); ctx.stroke();
    ctx.fillStyle = '#0a0610'; ctx.beginPath(); ctx.ellipse(0, r * .62, r * (.22 + e.open * .14), r * (.1 + e.open * .1), 0, 0, TAU); ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + .3; drawGlow(Math.cos(a) * r * .55, Math.sin(a) * r * .45 - r * .05, 5, HIVE, .45 + .45 * Math.sin(e.t * 3 + k)); }
    drawGlow(0, r * .62, r * .4, HIVE, .2 + e.open * .7);
  } else if (e.type === 'prism') {
    const ch = beams.some(b => b.owner === e && !b.firing);
    ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, r * 2.2, '160,255,210', ch ? .6 : .2); ctx.globalCompositeOperation = 'source-over';
    ctx.rotate(e.spin);
    const pts = [[0, -r * 1.25], [r * .85, -r * .2], [r * .5, r * .9], [-r * .5, r * .9], [-r * .85, -r * .2]];
    for (let i = 0; i < pts.length; i++) {
      const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
      ctx.fillStyle = i % 2 ? 'rgba(120,220,190,.92)' : 'rgba(200,255,235,.9)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.closePath(); ctx.fill();
    }
    ctx.strokeStyle = 'rgba(240,255,250,.8)'; ctx.lineWidth = 1; ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.stroke();
    ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, r * (ch ? .9 : .5), WHITE, ch ? 1 : .6);
  } else {
    const near = clamp(1 - Math.hypot(P.x - e.x, P.y - e.y) / 260, 0, 1);
    ctx.rotate(e.spin);
    ctx.strokeStyle = '#6b4a7a'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
    ctx.beginPath(); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, L = i % 2 ? r * 1.05 : r * 1.35; ctx.moveTo(Math.cos(a) * r * .5, Math.sin(a) * r * .5); ctx.lineTo(Math.cos(a) * L, Math.sin(a) * L); } ctx.stroke();
    ctx.lineCap = 'butt';
    const g = ctx.createRadialGradient(-r * .2, -r * .2, 1, 0, 0, r * .7); g.addColorStop(0, '#9a5ab0'); g.addColorStop(1, '#2a1234');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r * .68, 0, TAU); ctx.fill();
    ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, r * (.6 + near), '255,90,220', .4 + near * .6 * (((S.t * (4 + near * 14)) | 0) % 2 ? 1 : .4));
  }
  ctx.globalCompositeOperation = 'source-over';
}

