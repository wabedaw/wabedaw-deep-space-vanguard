/* ---------- surface enemy art (facing left) ---------- */
function metalGrad(y0, y1, a = '#8a93a6', b = '#3a4252', c = '#171b23') { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(.5, b); g.addColorStop(1, c); return g; }
function drawSideUnit(e) {
  ctx.save(); ctx.translate(e.x, e.y);
  const w = e.hw, h = e.hh, pulse = .75 + .25 * Math.sin(e.t * 6 + e.ph);
  if (e.skin >= 4) drawUnitC(e, w, h, pulse);
  else if (e.skin) drawUnitB(e, w, h, pulse);
  else switch (e.type) {
    case 'tur': case 'pod': case 'emit': case 'hatch': drawBaseUnit(e, w, h, pulse); break;
    case 'fighter': case 'ace': {
      ctx.rotate(clamp(-(e.vy || 0) / 600, -.4, .4));
      const ace = e.type === 'ace', acc = ace ? '255,90,80' : PLASMA, k = w / 22;
      ctx.scale(k, k);
      ctx.globalCompositeOperation = 'lighter'; drawGlow(22, 0, 14, ace ? '255,130,90' : '255,120,220', .8); drawGlow(28, 0, 6, WHITE, .7); ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = ace ? '#3a2630' : '#2c2640'; ctx.beginPath(); ctx.moveTo(-2, 2); ctx.lineTo(12, 12); ctx.lineTo(17, 12); ctx.lineTo(10, 2); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-24, 0); ctx.lineTo(-8, -5); ctx.lineTo(12, -6); ctx.lineTo(22, -3); ctx.lineTo(22, 4); ctx.lineTo(10, 6); ctx.lineTo(-8, 4); ctx.closePath();
      ctx.fillStyle = metalGrad(-6, 6, ace ? '#b58f98' : '#9a8fb8', ace ? '#5a3a46' : '#433a5e', '#16121e'); ctx.fill(); ctx.strokeStyle = `rgba(${acc},.5)`; ctx.lineWidth = .8; ctx.stroke();
      ctx.fillStyle = ace ? '#4a2f38' : '#3a3156'; ctx.beginPath(); ctx.moveTo(8, -5); ctx.lineTo(16, -15); ctx.lineTo(20, -15); ctx.lineTo(18, -4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(140,230,255,.85)'; ctx.beginPath(); ctx.ellipse(-8, -3.5, 7, 2.6, -.1, 0, TAU); ctx.fill();
      if (ace) { ctx.fillStyle = `rgb(${acc})`; ctx.fillRect(2, -1, 10, 1.6); }
      ctx.globalCompositeOperation = 'lighter'; if (((e.t * 2.5) | 0) % 2) drawGlow(16, 12, 3, acc, 1);
      break;
    }
    case 'bomber': {
      ctx.globalCompositeOperation = 'lighter';
      for (const [x, y] of [[.55, -.5], [.55, .55], [.95, 0]]) drawGlow(w * x + 10, h * y, h * .7, '255,150,90', .7 * pulse);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#2b2733'; ctx.beginPath(); ctx.moveTo(-w * .1, -h * .2); ctx.lineTo(w * .45, -h * 1.5); ctx.lineTo(w * .62, -h * 1.5); ctx.lineTo(w * .5, -h * .2); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-w, 0); ctx.quadraticCurveTo(-w * .9, -h * .9, -w * .5, -h); ctx.lineTo(w * .85, -h * .8); ctx.lineTo(w, -h * .2); ctx.lineTo(w, h * .4); ctx.lineTo(w * .7, h * .9); ctx.lineTo(-w * .55, h * .85); ctx.quadraticCurveTo(-w * .95, h * .6, -w, 0); ctx.closePath();
      ctx.fillStyle = metalGrad(-h, h, '#9aa0b2', '#474d5e', '#14161d'); ctx.fill(); ctx.strokeStyle = 'rgba(255,170,90,.45)'; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1; for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * w * .22, -h * .9); ctx.lineTo(i * w * .22, h * .85); ctx.stroke(); }
      ctx.fillStyle = '#1f222b'; ctx.beginPath(); ctx.moveTo(-w * .05, h * .2); ctx.lineTo(w * .55, h * .3); ctx.lineTo(w * .8, h * 1.6); ctx.lineTo(w * .6, h * 1.6); ctx.closePath(); ctx.fill();
      for (const x of [.3, .62]) { ctx.fillStyle = '#2d313d'; ctx.beginPath(); ctx.ellipse(w * x, h * 1.15, w * .1, h * .28, 0, 0, TAU); ctx.fill(); }
      ctx.fillStyle = 'rgba(140,230,255,.8)'; ctx.beginPath(); ctx.ellipse(-w * .72, -h * .35, w * .13, h * .22, -.15, 0, TAU); ctx.fill();
      ctx.fillStyle = '#0e1015'; ctx.fillRect(-w * .2, h * .55, w * .45, h * .3);
      for (const [x, y] of [[-.2, -.95], [.1, .95]]) { ctx.save(); ctx.translate(w * x, h * y); ctx.fillStyle = '#353a47'; ctx.beginPath(); ctx.arc(0, 0, h * .35, 0, TAU); ctx.fill(); ctx.rotate(e.aim); ctx.fillStyle = '#1b1e26'; ctx.fillRect(0, -2, h * .9, 4); ctx.restore(); }
      ctx.globalCompositeOperation = 'lighter';
      for (let i = -3; i <= 3; i++) drawGlow(i * w * .12, -h * .45, 2.2, i % 2 ? '255,200,120' : '255,90,80', .9);
      drawGlow(-w * .95, 0, 4, '255,60,60', ((e.t * 2) | 0) % 2 ? 1 : .2);
      break;
    }
    case 'aa': {
      ctx.fillStyle = '#2a2d36'; ctx.fillRect(-w, h * .2, w * 2, h * 1.6);
      ctx.beginPath(); ctx.moveTo(-w, h * .85); ctx.lineTo(-w * .7, -h * .1); ctx.lineTo(w * .7, -h * .1); ctx.lineTo(w, h * .85); ctx.closePath(); ctx.fillStyle = metalGrad(-h * .1, h * .85, '#7e8696', '#3e4554', '#1a1d25'); ctx.fill();
      ctx.save(); ctx.translate(0, -h * .4); ctx.rotate(e.aim); ctx.fillStyle = '#20232b'; ctx.fillRect(0, -4.5, w * 1.1, 3); ctx.fillRect(0, 1.5, w * 1.1, 3); ctx.restore();
      ctx.fillStyle = metalGrad(-h * .9, -h * .1, '#9aa2b2', '#4a5262', '#262a33'); ctx.beginPath(); ctx.arc(0, -h * .35, w * .45, Math.PI, TAU); ctx.fill();
      ctx.globalCompositeOperation = 'lighter'; drawGlow(0, -h * .45, 5, FLARE, pulse);
      break;
    }
    case 'sam': {
      ctx.fillStyle = '#23262e'; ctx.fillRect(-w, h * .4, w * 2, h * 1.4);
      ctx.fillStyle = metalGrad(-h * .2, h * .7, '#7d8a7e', '#3f4a42', '#1b201c'); ctx.fillRect(-w, -h * .1, w * 2, h * .8);
      ctx.fillStyle = '#121418'; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.arc(i * w * .4, h * .75, h * .22, 0, TAU); ctx.fill(); }
      ctx.save(); ctx.translate(w * .3, -h * .1); ctx.rotate(e.aim + Math.PI);
      ctx.fillStyle = '#2e3530'; ctx.fillRect(-w * 1.2, -3, w * 1.25, 6);
      for (let i = 0; i < (e.loaded || 0); i++) { ctx.fillStyle = '#d8dde2'; ctx.fillRect(-w * 1.15, -9 - i * 7, w * 1.05, 4.5); ctx.fillStyle = '#ff5a4f'; ctx.fillRect(-w * 1.15, -9 - i * 7, 5, 4.5); }
      ctx.restore();
      ctx.globalCompositeOperation = 'lighter'; drawGlow(-w * .7, -h * .05, 3, '170,255,120', pulse);
      break;
    }
    case 'mlrs': {
      ctx.fillStyle = '#1a1c22'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-w, h * .35, w * 2, h * .6, h * .3) : ctx.rect(-w, h * .35, w * 2, h * .6); ctx.fill();
      ctx.fillStyle = '#2c2f37'; for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.arc(i * w * .28, h * .65, h * .2, 0, TAU); ctx.fill(); }
      ctx.fillStyle = metalGrad(-h * .3, h * .4, '#8f8770', '#4c4636', '#1d1b16'); ctx.fillRect(-w * .9, -h * .25, w * 1.8, h * .65);
      ctx.fillStyle = 'rgba(140,230,255,.7)'; ctx.fillRect(-w * .85, -h * .15, w * .3, h * .25);
      ctx.save(); ctx.translate(w * .2, -h * .3); ctx.rotate(e.aim + Math.PI);
      ctx.fillStyle = metalGrad(-14, 4, '#7c7a6e', '#46443b', '#22211c'); ctx.fillRect(-w * .95, -14, w * .95, 16);
      ctx.fillStyle = '#0d0e10'; for (let r = 0; r < 2; r++) { ctx.beginPath(); ctx.arc(-w * .93, -10 + r * 7, 2.6, 0, TAU); ctx.fill(); }
      ctx.restore();
      break;
    }
    case 'bunker': {
      ctx.fillStyle = '#1e2027'; ctx.fillRect(-w, h * .2, w * 2, h * 1.4);
      ctx.beginPath(); ctx.moveTo(-w, h * .85); ctx.lineTo(-w * .8, -h * .2); ctx.quadraticCurveTo(0, -h * 1.05, w * .8, -h * .2); ctx.lineTo(w, h * .85); ctx.closePath();
      ctx.fillStyle = metalGrad(-h, h * .85, '#8c8f9c', '#454956', '#1a1c23'); ctx.fill(); ctx.strokeStyle = 'rgba(255,140,90,.4)'; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.strokeStyle = 'rgba(0,0,0,.35)'; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * w * .35, -h * .55 + Math.abs(i) * h * .15); ctx.lineTo(i * w * .42, h * .85); ctx.stroke(); }
      ctx.fillStyle = '#ffb347'; for (const x of [-.5, -.2, .2, .5]) ctx.fillRect(x * w - 4, h * .25, 8, 2.5);
      ctx.save(); ctx.translate(-w * .2, -h * .3); ctx.rotate(e.aim); ctx.fillStyle = '#23262e'; ctx.fillRect(0, -5, w * .95, 10); ctx.fillStyle = '#3a3e48'; ctx.fillRect(w * .78, -6.5, w * .2, 13); ctx.restore();
      ctx.fillStyle = metalGrad(-h * .7, -h * .05, '#a5a9b5', '#555a67', '#2a2d35'); ctx.beginPath(); ctx.arc(-w * .2, -h * .3, h * .38, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#3a3e48'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(w * .5, -h * .35); ctx.lineTo(w * .55, -h * 1.3); ctx.stroke();
      ctx.globalCompositeOperation = 'lighter'; drawGlow(-w * .2, -h * .3, h * .3, '255,140,90', pulse * .9); drawGlow(w * .55, -h * 1.3, 3, '255,60,60', ((e.t * 2) | 0) % 2 ? 1 : .2);
      break;
    }
    case 'base': {
      ctx.fillStyle = '#1b1d24'; ctx.fillRect(-w, h * .5, w * 2, h * 1.2);
      ctx.fillStyle = '#4a505c'; ctx.fillRect(-w, h * .55, w * 2, h * .3);
      ctx.fillStyle = 'rgba(255,200,80,.7)'; for (let x = -w; x < w; x += 22) ctx.fillRect(x, h * .62, 11, 3);
      ctx.beginPath(); ctx.moveTo(-w * .85, h * .55); ctx.lineTo(-w * .85, -h * .1); ctx.quadraticCurveTo(-w * .4, -h * 1.05, w * .05, -h * .1); ctx.lineTo(w * .05, h * .55); ctx.closePath();
      ctx.fillStyle = metalGrad(-h, h * .55, '#8a92a3', '#454c5c', '#1c1f27'); ctx.fill(); ctx.strokeStyle = 'rgba(120,200,255,.4)'; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1; for (let i = 1; i < 6; i++) { const x = -w * .85 + i * w * .15; ctx.beginPath(); ctx.moveTo(x, h * .55); ctx.lineTo(x, -h * .75 + Math.abs(x + w * .4) * .8); ctx.stroke(); }
      ctx.fillStyle = '#0c0d11'; ctx.fillRect(-w * .62, h * .05, w * .45, h * .5);
      ctx.globalCompositeOperation = 'lighter'; drawGlow(-w * .4, h * .3, w * .22, PLASMA, .35 + .25 * pulse); ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = metalGrad(-h * 1.6, h * .55, '#9aa3b4', '#4e5666', '#20232b'); ctx.fillRect(w * .2, -h * 1.2, w * .22, h * 1.75);
      ctx.fillStyle = 'rgba(140,230,255,.85)'; ctx.fillRect(w * .16, -h * 1.45, w * .3, h * .28);
      ctx.save(); ctx.translate(w * .75, -h * .55); ctx.fillStyle = '#2b2f38'; ctx.fillRect(-3, 0, 6, h * 1.1); ctx.scale(Math.cos(e.spin), 1);
      ctx.fillStyle = '#aab3c4'; ctx.beginPath(); ctx.ellipse(0, -4, h * .55, h * .22, 0, 0, Math.PI); ctx.fill(); ctx.restore();
      ctx.fillStyle = metalGrad(-h * 1.1, -h * .6, '#9aa2b2', '#4a5262', '#262a33'); ctx.beginPath(); ctx.arc(w * .55, -h * .85, 9, Math.PI, TAU); ctx.fill();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 5; i++) drawGlow(-w * .75 + i * w * .18, h * .7, 3, ((S.t * 4 | 0) + i) % 5 ? '255,200,120' : '255,255,255', .9);
      drawGlow(w * .31, -h * 1.5, 3, '255,60,60', ((e.t * 2) | 0) % 2 ? 1 : .2);
      break;
    }
    case 'carrier': {
      ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) drawGlow(w * (1 + i * .1), h * .45, 14, '220,245,255', .35); ctx.globalCompositeOperation = 'source-over';
      ctx.beginPath(); ctx.moveTo(-w * 1.05, -h * .45); ctx.lineTo(w * .95, -h * .45); ctx.lineTo(w, h * .15); ctx.lineTo(w * .85, h * .9); ctx.lineTo(-w * .7, h * .9); ctx.closePath();
      ctx.fillStyle = metalGrad(-h * .45, h * .9, '#7f8798', '#3c4252', '#14171e'); ctx.fill(); ctx.strokeStyle = 'rgba(120,200,255,.4)'; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.fillStyle = '#2b2f38'; ctx.fillRect(-w * 1.05, -h * .62, w * 2, h * .2);
      ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.setLineDash([10, 9]); ctx.beginPath(); ctx.moveTo(-w * 1.0, -h * .52); ctx.lineTo(w * .4, -h * .52); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255,200,80,.7)'; for (let x = -w * .9; x < w * .9; x += 26) ctx.fillRect(x, h * .05, 12, 2.5);
      ctx.fillStyle = metalGrad(-h * 2, -h * .6, '#9aa3b4', '#4e5666', '#20232b');
      ctx.beginPath(); ctx.moveTo(w * .45, -h * .62); ctx.lineTo(w * .52, -h * 1.75); ctx.lineTo(w * .78, -h * 1.75); ctx.lineTo(w * .85, -h * .62); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(140,230,255,.8)'; ctx.fillRect(w * .53, -h * 1.6, w * .24, h * .22);
      ctx.strokeStyle = '#3a3f4b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w * .65, -h * 1.75); ctx.lineTo(w * .65, -h * 2.5); ctx.stroke();
      for (const x of [-.35, .15]) { ctx.save(); ctx.translate(w * x, -h * .75); ctx.fillStyle = '#353a47'; ctx.beginPath(); ctx.arc(0, 0, 8, Math.PI, TAU); ctx.fill(); ctx.rotate(upAim(e.x + w * x, e.y - h * .75)); ctx.fillStyle = '#1b1e26'; ctx.fillRect(0, -2.5, 16, 2); ctx.fillRect(0, .8, 16, 2); ctx.restore(); }
      ctx.fillStyle = '#2d3b33'; ctx.fillRect(w * .7, -h * 1, w * .18, h * .35);
      for (let i = 0; i < 3; i++) { ctx.fillStyle = '#d8dde2'; ctx.fillRect(w * .72 + i * 7, -h * 1.15, 4, h * .2); }
      ctx.globalCompositeOperation = 'lighter';
      for (let x = -w * .95; x < w * .4; x += 24) drawGlow(x, -h * .62, 2, ((S.t * 6 | 0) + (x | 0)) % 3 ? '120,220,255' : '255,255,255', .9);
      drawGlow(w * .65, -h * 2.5, 3, '255,60,60', ((e.t * 2) | 0) % 2 ? 1 : .2);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(40,120,150,.55)'; ctx.fillRect(-w * 1.1, waterY() - e.y + 1, w * 2.2, h * 1.4);
      break;
    }
    case 'seabase': {
      ctx.fillStyle = '#20232b'; for (const x of [-.75, -.25, .25, .75]) ctx.fillRect(w * x - 4, h * .1, 8, h * 1.4);
      ctx.strokeStyle = '#2e323c'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-w * .75, h * .2); ctx.lineTo(-w * .25, h * .9); ctx.moveTo(w * .75, h * .2); ctx.lineTo(w * .25, h * .9); ctx.stroke();
      ctx.fillStyle = metalGrad(-h * .2, h * .2, '#8f97a8', '#464d5c', '#1c1f27'); ctx.fillRect(-w, -h * .2, w * 2, h * .38);
      ctx.fillStyle = 'rgba(255,200,80,.7)'; for (let x = -w; x < w; x += 18) ctx.fillRect(x, h * .02, 9, 2.5);
      ctx.fillStyle = metalGrad(-h, -h * .2, '#a2aabb', '#545c6c', '#262a33'); ctx.beginPath(); ctx.arc(-w * .3, -h * .2, h * .55, Math.PI, TAU); ctx.fill();
      ctx.fillStyle = '#2d3b33'; ctx.fillRect(w * .15, -h * .6, w * .35, h * .4); for (let i = 0; i < 3; i++) { ctx.fillStyle = '#d8dde2'; ctx.fillRect(w * .18 + i * 8, -h * .8, 4, h * .22); }
      ctx.strokeStyle = '#3a3f4b'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(w * .8, -h * .2); ctx.lineTo(w * .8, -h * 1.2); ctx.stroke();
      ctx.globalCompositeOperation = 'lighter'; drawGlow(w * .8, -h * 1.25, 9 + 3 * Math.sin(e.t * 9), '255,150,70', .9); drawGlow(-w * .3, -h * .45, 10, '120,220,255', .5 * pulse);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(40,120,150,.55)'; ctx.fillRect(-w * 1.05, waterY() - e.y + 1, w * 2.1, h * 1.6);
      break;
    }
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
  if (e.hitT > 0) { ctx.globalCompositeOperation = 'lighter'; drawGlow(e.x, e.y, Math.max(e.hw, e.hh) * 1.2, WHITE, e.hitT * 3); ctx.globalCompositeOperation = 'source-over'; }
  if (e.hw > 40 && e.hp < e.maxhp) drawMiniBar(e.x, e.y - e.hh - 14 - (e.type === 'carrier' ? e.hh * 1.7 : 0), Math.min(90, e.hw), e.hp / e.maxhp, '255,170,90');
}

