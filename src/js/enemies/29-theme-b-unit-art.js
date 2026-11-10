/* ---------- theme B unit art (skin 2 = ember world, skin 3 = bio-lab) ---------- */
function drawUnitB(e, w, h, pulse) {
  if (e.skin === 3) { drawUnitHive(e, w, h, pulse); return; }
  const lava = '255,130,50';
  switch (e.type) {
    case 'aa': {
      ctx.fillStyle = metalGrad(-h, h, '#5a4a44', '#33282a', '#160f10'); ctx.beginPath(); ctx.moveTo(-w, h * .85); ctx.lineTo(-w * .6, -h * .1); ctx.lineTo(w * .6, -h * .1); ctx.lineTo(w, h * .85); ctx.closePath(); ctx.fill();
      ctx.save(); ctx.translate(0, -h * .2); ctx.rotate(e.aim); ctx.fillStyle = '#211818'; ctx.fillRect(0, -5, w * 1.3, 3.5); ctx.fillRect(0, 1.5, w * 1.3, 3.5); ctx.fillStyle = '#7a3a22'; ctx.fillRect(w * 1.1, -5.5, w * .22, 11); ctx.restore();
      ctx.fillStyle = metalGrad(-h, h, '#8a6a58', '#4a3430', '#221816'); ctx.beginPath(); ctx.arc(0, -h * .2, w * .5, Math.PI, TAU); ctx.fill();
      ctx.globalCompositeOperation = 'lighter'; drawGlow(0, -h * .3, 6, lava, pulse); break;
    }
    case 'sam': {
      ctx.fillStyle = metalGrad(-h, h, '#4a4448', '#2a2428', '#121012'); ctx.fillRect(-w, -h * .2, w * 2, h * 1.1);
      ctx.save(); ctx.translate(-w * .1, -h * .55); ctx.rotate(e.aim);
      ctx.fillStyle = '#2a2226'; ctx.fillRect(-6, -6, w * 1.9, 12); ctx.fillStyle = '#6a5a60'; ctx.fillRect(0, -3.5, w * 1.95, 2); ctx.fillRect(0, 1.5, w * 1.95, 2);
      ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 4; i++) drawGlow(w * (.3 + i * .38), 0, 3, '120,200,255', e.sight ? 1 : .35); ctx.restore();
      if (e.sight) { ctx.save(); ctx.translate(-w * .1, -h * .55); ctx.rotate(e.aim); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(255,60,60,${.35 + .4 * (((S.t * 12) | 0) % 2)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(w * 2, 0); ctx.lineTo(1400, 0); ctx.stroke(); ctx.restore(); }
      break;
    }
    case 'mlrs': {
      ctx.fillStyle = metalGrad(-h, h, '#5a4038', '#33221e', '#160e0c'); ctx.fillRect(-w, -h * .1, w * 2, h);
      ctx.save(); ctx.translate(0, -h * .45); ctx.rotate(e.aim); ctx.fillStyle = '#2a1c18'; ctx.fillRect(-4, -9, w * 1.1, 18); ctx.fillStyle = '#120a08'; ctx.beginPath(); ctx.arc(w * 1.05, 0, 8, 0, TAU); ctx.fill();
      ctx.globalCompositeOperation = 'lighter'; drawGlow(w * 1.05, 0, 9, lava, .5 + .4 * pulse); ctx.restore();
      for (const x of [-.7, -.2, .3, .8]) { ctx.fillStyle = '#1a1210'; ctx.beginPath(); ctx.arc(x * w, h * .9, h * .22, 0, TAU); ctx.fill(); }
      break;
    }
    case 'bunker': {
      const wk = e.vx ? e.t * 6 : 0;
      ctx.strokeStyle = '#2a2024'; ctx.lineWidth = 5; ctx.lineCap = 'round';
      for (let k = 0; k < 4; k++) { const lx = (k - 1.5) * w * .45, ph = wk + k * Math.PI / 2, up = Math.max(0, Math.sin(ph)) * h * .25; ctx.beginPath(); ctx.moveTo(lx, -h * .1); ctx.lineTo(lx - w * .12 + Math.cos(ph) * w * .1, h * .4 - up); ctx.lineTo(lx + Math.cos(ph) * w * .15, h * .95 - up * .5); ctx.stroke(); }
      ctx.lineCap = 'butt';
      ctx.fillStyle = metalGrad(-h, h, '#7a6a64', '#43383a', '#1c1618'); ctx.beginPath(); ctx.moveTo(-w * .8, 0); ctx.lineTo(-w * .55, -h * .8); ctx.lineTo(w * .6, -h * .8); ctx.lineTo(w * .85, 0); ctx.lineTo(w * .5, h * .2); ctx.lineTo(-w * .5, h * .2); ctx.closePath(); ctx.fill();
      ctx.save(); ctx.translate(-w * .2, -h * .45); ctx.rotate(e.aim); ctx.fillStyle = '#1e1618'; ctx.fillRect(0, -3.5, w * .7, 7); ctx.restore();
      ctx.globalCompositeOperation = 'lighter'; drawGlow(-w * .35, -h * .55, 6, lava, pulse); drawGlow(w * .4, -h * .5, 4, '255,60,60', ((S.t * 2) | 0) % 2 ? 1 : .3); break;
    }
    case 'base': {
      ctx.fillStyle = metalGrad(-h, h, '#5c4c46', '#33282a', '#141012'); ctx.fillRect(-w, -h * .6, w * 2, h * 1.5);
      for (const x of [-.6, .1, .7]) { ctx.fillStyle = '#2a201e'; ctx.fillRect(x * w - w * .08, -h * 1.5, w * .16, h); ctx.globalCompositeOperation = 'lighter'; drawGlow(x * w, -h * 1.5, 10, lava, .5 + .3 * Math.sin(S.t * 3 + x * 5)); ctx.globalCompositeOperation = 'source-over'; for (let i = 0; i < 3; i++) { const q = (S.t * .4 + i / 3 + x) % 1; ctx.fillStyle = `rgba(70,50,46,${.5 * (1 - q)})`; ctx.beginPath(); ctx.arc(x * w + q * 14, -h * 1.5 - q * 50, 6 + q * 14, 0, TAU); ctx.fill(); } }
      ctx.fillStyle = '#ff8a3a'; for (let x = -w * .9; x < w * .9; x += 22) ctx.fillRect(x, -h * .2, 12, 4);
      ctx.globalCompositeOperation = 'lighter'; drawGlow(0, -h * .05, w * .5, lava, .2); break;
    }
    case 'carrier': case 'seabase': {
      const big = e.type === 'carrier';
      ctx.fillStyle = metalGrad(-h, h, '#4a3a36', '#2a1e1c', '#120a0a'); ctx.beginPath(); ctx.moveTo(-w, -h * .2); ctx.lineTo(w * .9, -h * .2); ctx.lineTo(w, h * .2); ctx.lineTo(w * .8, h * .55); ctx.lineTo(-w * .85, h * .55); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#5a4844'; ctx.fillRect(big ? w * .1 : -w * .3, -h * (big ? 1.2 : 1.4), w * (big ? .35 : .6), h * (big ? 1 : 1.2));
      ctx.strokeStyle = 'rgba(255,140,60,.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-w * .9, -h * .2); ctx.lineTo(w * .85, -h * .2); ctx.stroke();
      ctx.globalCompositeOperation = 'lighter';
      for (let x = -w * .8; x < w * .8; x += big ? 34 : 24) drawGlow(x, h * .3, 4, lava, .6);
      drawGlow(-w * .95, h * .5, w * .25, '255,160,60', .4); break;
    }
    case 'fighter': case 'ace': {
      ctx.rotate(clamp(-(e.vy || 0) / 600, -.4, .4));
      const ace = e.type === 'ace';
      ctx.fillStyle = ace ? '#3a2830' : '#2e2224';
      ctx.beginPath(); ctx.moveTo(-w, 0); ctx.lineTo(-w * .2, -h * .6); ctx.lineTo(w * .7, -h * .5); ctx.lineTo(w, 0); ctx.lineTo(w * .7, h * .5); ctx.lineTo(-w * .2, h * .6); ctx.closePath(); ctx.fill();
      ctx.fillStyle = ace ? '#6a3a40' : '#4a3234'; ctx.beginPath(); ctx.moveTo(-w * .1, 0); ctx.lineTo(w * .6, -h * (ace ? 1.6 : 1.3)); ctx.lineTo(w * .85, -h * (ace ? 1.5 : 1.2)); ctx.lineTo(w * .5, 0); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-w * .1, 0); ctx.lineTo(w * .6, h * (ace ? 1.6 : 1.3)); ctx.lineTo(w * .85, h * (ace ? 1.5 : 1.2)); ctx.lineTo(w * .5, 0); ctx.closePath(); ctx.fill();
      ctx.globalCompositeOperation = 'lighter'; drawGlow(w * .95, 0, h * 1.2, lava, .8); drawGlow(-w * .5, 0, 3, ace ? '255,80,80' : '255,200,120', 1); break;
    }
    case 'bomber': {
      ctx.fillStyle = metalGrad(-h, h, '#5a4642', '#30221f', '#140e0c'); ctx.beginPath(); ctx.ellipse(0, 0, w, h * .55, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#3a2a28'; ctx.beginPath(); ctx.moveTo(-w * .3, 0); ctx.lineTo(w * .4, -h * 1.3); ctx.lineTo(w * .7, -h * 1.2); ctx.lineTo(w * .4, 0); ctx.closePath(); ctx.fill();
      ctx.globalCompositeOperation = 'lighter'; for (const y of [-h * .2, h * .2]) drawGlow(w * .98, y, h * .6, lava, .8); for (let x = -w * .6; x < w * .5; x += w * .2) drawGlow(x, h * .4, 3, lava, .6); break;
    }
    default: break;
  }
}

