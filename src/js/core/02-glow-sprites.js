/* ---------- glow sprites ---------- */
const glowCache = {};
function glow(c) {
  let s = glowCache[c];
  if (s) return s;
  s = document.createElement('canvas'); s.width = s.height = 64;
  const g = s.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, `rgba(${c},1)`); gr.addColorStop(.22, `rgba(${c},.6)`);
  gr.addColorStop(.55, `rgba(${c},.14)`); gr.addColorStop(1, `rgba(${c},0)`);
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return (glowCache[c] = s);
}
function drawGlow(x, y, r, c, a) {
  if (a <= 0) return;
  ctx.globalAlpha = a > 1 ? 1 : a;
  ctx.drawImage(glow(c), x - r, y - r, r * 2, r * 2);
  ctx.globalAlpha = 1;
}

