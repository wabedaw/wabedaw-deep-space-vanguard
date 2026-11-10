/* ---------- theme C unit art: skin 4 (arctic surface) / skin 5 (cryo lab) ---------- */
function drawUnitC(e, w, h, pulse) {
  const glow = '120,220,255', snow = (y0, x0, x1) => { ctx.fillStyle = 'rgba(245,250,255,.9)'; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo((x0 + x1) / 2, y0 - 6, x1, y0); ctx.lineTo(x1, y0 + 2); ctx.lineTo(x0, y0 + 2); ctx.closePath(); ctx.fill(); };
  if (e.type === 'fighter' || e.type === 'ace') {
    ctx.rotate(clamp(-(e.vy || 0) / 600, -.4, .4));
    const ace = e.type === 'ace';
    ctx.globalCompositeOperation = 'lighter'; drawGlow(w * .95, 0, h * 1.3, glow, .8); ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = metalGrad(-h, h, '#f0f6fa', '#9aaabb', '#3a4656'); ctx.beginPath(); ctx.moveTo(-w * 1.05, 0); ctx.lineTo(-w * .2, -h * .55); ctx.lineTo(w * .8, -h * .45); ctx.lineTo(w, 0); ctx.lineTo(w * .8, h * .45); ctx.lineTo(-w * .2, h * .55); ctx.closePath(); ctx.fill();
    ctx.fillStyle = ace ? '#3a5a8a' : '#5a7a9a'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(w * .55, -h * (ace ? 1.7 : 1.35)); ctx.lineTo(w * .8, -h * (ace ? 1.6 : 1.25)); ctx.lineTo(w * .55, 0); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(w * .55, h * (ace ? 1.7 : 1.35)); ctx.lineTo(w * .8, h * (ace ? 1.6 : 1.25)); ctx.lineTo(w * .55, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(120,220,255,.9)'; ctx.beginPath(); ctx.ellipse(-w * .45, -h * .18, w * .25, h * .2, 0, 0, TAU); ctx.fill();
    ctx.globalCompositeOperation = 'lighter'; drawGlow(-w * .9, 0, 3, ace ? '255,90,120' : glow, 1); return;
  }
  if (e.skin === 5) {
    const s = e.att === 'c' ? -1 : 1;
    ctx.fillStyle = '#26323e'; ctx.fillRect(-w * 1.1, s > 0 ? h * .55 : -h * 1.05, w * 2.2, h * .5);
    ctx.fillStyle = 'rgba(230,245,255,.75)'; ctx.fillRect(-w * 1.1, s > 0 ? h * .55 : h * .5, w * 2.2, 3);
    if (e.type === 'tur') {
      ctx.fillStyle = metalGrad(-h, h, '#e6f2fa', '#8aa0b4', '#2a3644'); ctx.beginPath(); ctx.arc(0, -s * h * .1, w * .62, 0, TAU); ctx.fill();
      ctx.save(); ctx.translate(0, -s * h * .1); ctx.rotate(e.aim); iceFacet([[0, -4], [w * 1.25, -2], [w * 1.25, 2], [0, 4]], '#ffffff', '#9ad8f6', '#3a6a90'); ctx.restore();
      ctx.globalCompositeOperation = 'lighter'; drawGlow(0, -s * h * .1, 8, glow, pulse);
    } else if (e.type === 'pod') {
      const ready = e.fireT < .7;
      ctx.fillStyle = metalGrad(-h, h, '#dfeaf2', '#7a8ea0', '#26323e'); ctx.fillRect(-w, -h * .7, w * 2, h * 1.4);
      for (let i = 0; i < 3; i++) { ctx.fillStyle = '#0c141c'; ctx.beginPath(); ctx.arc(-w * .6 + i * w * .6, -s * h * .1, h * .3, 0, TAU); ctx.fill(); }
      ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) drawGlow(-w * .6 + i * w * .6, -s * h * .1, ready ? 8 : 4, glow, ready ? .9 : .4);
    } else if (e.type === 'emit') {
      const ch = beams.some(b => b.owner === e);
      ctx.save(); ctx.rotate(e.aim); iceFacet([[w * 1.05, 0], [0, -h * .6], [-w * .5, 0], [0, h * .6]], '#ffffff', ch ? '#c8a8ff' : '#9ad8f6', '#2a4a70'); ctx.restore();
      ctx.globalCompositeOperation = 'lighter'; drawGlow(Math.cos(e.aim) * w * .6, Math.sin(e.aim) * w * .6, ch ? 16 : 7, ch ? ICE2 : glow, ch ? 1 : .6 * pulse);
    } else {
      const o = clamp(e.open || 0, 0, 1);
      ctx.fillStyle = metalGrad(-h, h, '#c8d6e2', '#6a7e90', '#22303c'); ctx.fillRect(-w, -h * .6, w * 2, h * 1.2);
      ctx.fillStyle = '#081018'; ctx.fillRect(-w * .75, -h * .35, w * 1.5, h * .7);
      ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, w * .7, glow, .25 + o * .7); ctx.globalCompositeOperation = 'source-over';
      const dw = w * .75 * (1 - Math.min(1, o * 1.4) * .85); ctx.fillStyle = '#8aa0b4'; ctx.fillRect(-w * .75, -h * .35, dw, h * .7); ctx.fillRect(w * .75 - dw, -h * .35, dw, h * .7);
    }
    return;
  }
  switch (e.type) {
    case 'aa': {
      ctx.fillStyle = metalGrad(-h, h, '#e2ecf4', '#8a9cb0', '#2a3644'); ctx.beginPath(); ctx.moveTo(-w, h * .85); ctx.lineTo(-w * .7, -h * .1); ctx.lineTo(w * .7, -h * .1); ctx.lineTo(w, h * .85); ctx.closePath(); ctx.fill();
      ctx.save(); ctx.translate(0, -h * .4); ctx.rotate(e.aim); ctx.fillStyle = '#26323e'; ctx.fillRect(0, -4.5, w * 1.2, 3); ctx.fillRect(0, 1.5, w * 1.2, 3); ctx.restore();
      ctx.fillStyle = metalGrad(-h, 0, '#ffffff', '#a8bccc', '#4a5a6a'); ctx.beginPath(); ctx.arc(0, -h * .35, w * .45, Math.PI, TAU); ctx.fill(); snow(-h * .1, -w * .7, w * .7);
      ctx.globalCompositeOperation = 'lighter'; drawGlow(0, -h * .45, 5, glow, pulse); break;
    }
    case 'sam': {
      ctx.fillStyle = metalGrad(-h * .2, h * .7, '#d6e2ec', '#7a8ea0', '#26323e'); ctx.fillRect(-w, -h * .1, w * 2, h * .8);
      ctx.fillStyle = '#121a22'; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.arc(i * w * .4, h * .75, h * .22, 0, TAU); ctx.fill(); }
      ctx.save(); ctx.translate(w * .3, -h * .1); ctx.rotate(e.aim + Math.PI); ctx.fillStyle = '#3a4a5a'; ctx.fillRect(-w * 1.2, -3, w * 1.25, 6);
      for (let i = 0; i < (e.loaded || 0); i++) { ctx.fillStyle = '#f2f8ff'; ctx.fillRect(-w * 1.15, -9 - i * 7, w * 1.05, 4.5); ctx.fillStyle = '#4ac8ff'; ctx.fillRect(-w * 1.15, -9 - i * 7, 5, 4.5); }
      ctx.restore(); snow(-h * .1, -w, w); ctx.globalCompositeOperation = 'lighter'; drawGlow(-w * .7, -h * .05, 3, glow, pulse); break;
    }
    case 'mlrs': {
      ctx.fillStyle = '#1e2832'; ctx.fillRect(-w, h * .35, w * 2, h * .6);
      ctx.fillStyle = metalGrad(-h * .3, h * .4, '#e6eef4', '#8a9aaa', '#2e3a46'); ctx.fillRect(-w * .9, -h * .25, w * 1.8, h * .65);
      ctx.save(); ctx.translate(w * .2, -h * .3); ctx.rotate(e.aim + Math.PI); ctx.fillStyle = metalGrad(-14, 4, '#c8d6e2', '#6a7e90', '#22303c'); ctx.fillRect(-w * .95, -14, w * .95, 16); ctx.restore();
      snow(-h * .25, -w * .9, w * .9); break;
    }
    case 'bunker': {
      const wk = e.vx ? e.t * 5 : 0;
      ctx.strokeStyle = '#4a5a6a'; ctx.lineWidth = 6; ctx.lineCap = 'round';
      for (const k of [-1, 1]) { const ph = wk + (k > 0 ? Math.PI : 0), up = Math.max(0, Math.sin(ph)) * h * .3; ctx.beginPath(); ctx.moveTo(k * w * .3, -h * .1); ctx.lineTo(k * w * .38 + Math.cos(ph) * w * .12, h * .45 - up); ctx.lineTo(k * w * .3 + Math.cos(ph) * w * .18, h * .95 - up * .4); ctx.stroke(); }
      ctx.lineCap = 'butt';
      ctx.fillStyle = metalGrad(-h, h * .2, '#f2f8fc', '#9aaabb', '#3a4656'); ctx.beginPath(); ctx.moveTo(-w * .7, 0); ctx.lineTo(-w * .5, -h * .9); ctx.lineTo(w * .55, -h * .9); ctx.lineTo(w * .75, 0); ctx.lineTo(w * .4, h * .2); ctx.lineTo(-w * .4, h * .2); ctx.closePath(); ctx.fill();
      ctx.save(); ctx.translate(-w * .2, -h * .5); ctx.rotate(e.aim); ctx.fillStyle = '#2a3846'; ctx.fillRect(0, -4, w * .75, 8); ctx.restore();
      ctx.fillStyle = 'rgba(120,220,255,.85)'; ctx.fillRect(w * .1, -h * .7, w * .35, h * .2);
      ctx.globalCompositeOperation = 'lighter'; drawGlow(-w * .2, -h * .5, 6, glow, pulse); break;
    }
    case 'base': {
      ctx.fillStyle = metalGrad(-h, h, '#e8f0f6', '#8a9cae', '#26323e'); ctx.beginPath(); ctx.moveTo(-w, h * .6); ctx.lineTo(-w, -h * .2); ctx.quadraticCurveTo(-w * .2, -h * 1.4, w * .6, -h * .2); ctx.lineTo(w, -h * .2); ctx.lineTo(w, h * .6); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(40,60,80,.4)'; ctx.lineWidth = 1; for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.ellipse(-w * .2, h * .6, w * .15 * i, h * .3 * i, 0, Math.PI, TAU); ctx.stroke(); }
      ctx.fillStyle = '#0a1219'; ctx.fillRect(-w * .5, h * .05, w * .4, h * .55);
      ctx.save(); ctx.translate(w * .75, -h * .55); ctx.fillStyle = '#3a4a5a'; ctx.fillRect(-3, 0, 6, h * .9); ctx.scale(Math.cos(e.spin || 0), 1); ctx.fillStyle = '#e8f2fa'; ctx.beginPath(); ctx.ellipse(0, -4, h * .5, h * .2, 0, 0, Math.PI); ctx.fill(); ctx.restore();
      ctx.globalCompositeOperation = 'lighter'; drawGlow(-w * .3, h * .3, w * .2, glow, .4 + .2 * pulse); for (let i = 0; i < 5; i++) drawGlow(-w * .8 + i * w * .3, h * .5, 3, glow, .8); break;
    }
    case 'carrier': case 'seabase': {
      const big = e.type === 'carrier';
      ctx.fillStyle = metalGrad(-h, h, '#dfe8f0', '#7a8c9e', '#22303c'); ctx.beginPath(); ctx.moveTo(-w * 1.05, -h * .4); ctx.lineTo(w * .95, -h * .4); ctx.lineTo(w, h * .15); ctx.lineTo(w * .85, h * .9); ctx.lineTo(-w * .7, h * .9); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#9aaabb'; ctx.fillRect(big ? w * .45 : -w * .3, -h * (big ? 1.7 : 1.3), w * (big ? .35 : .55), h * (big ? 1.3 : .9));
      ctx.fillStyle = 'rgba(120,220,255,.85)'; ctx.fillRect(big ? w * .48 : -w * .25, -h * (big ? 1.55 : 1.15), w * (big ? .29 : .45), h * .2);
      snow(-h * .4, -w, w * .9);
      ctx.fillStyle = 'rgba(200,230,250,.5)'; ctx.fillRect(-w * 1.1, waterY() - e.y + 1, w * 2.2, h * 1.4);
      ctx.globalCompositeOperation = 'lighter'; for (let x = -w * .9; x < w * .4; x += big ? 30 : 22) drawGlow(x, -h * .45, 2, glow, .8); break;
    }
    case 'bomber': {
      ctx.globalCompositeOperation = 'lighter'; for (const y of [-h * .3, h * .3]) drawGlow(w * .98, y, h * .6, glow, .8); ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = metalGrad(-h, h, '#eef4f8', '#8a9cae', '#26323e'); ctx.beginPath(); ctx.moveTo(-w, 0); ctx.quadraticCurveTo(-w * .8, -h, -w * .3, -h * .9); ctx.lineTo(w * .9, -h * .6); ctx.lineTo(w, 0); ctx.lineTo(w * .9, h * .6); ctx.lineTo(-w * .3, h * .9); ctx.quadraticCurveTo(-w * .8, h, -w, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#4a6a8a'; ctx.beginPath(); ctx.moveTo(-w * .2, 0); ctx.lineTo(w * .45, -h * 1.5); ctx.lineTo(w * .7, -h * 1.4); ctx.lineTo(w * .45, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(120,220,255,.85)'; ctx.beginPath(); ctx.ellipse(-w * .72, -h * .3, w * .12, h * .2, 0, 0, TAU); ctx.fill();
      ctx.globalCompositeOperation = 'lighter'; for (let i = -3; i <= 3; i++) drawGlow(i * w * .12, h * .45, 2.2, glow, .9); break;
    }
  }
}

