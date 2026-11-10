/* ---------- sky ---------- */
function setSky(key, now) {
  if (GW.skyKey === key && GW.sky && !now) return;
  GW.skyOld = now ? null : GW.sky; GW.skyFade = now ? 0 : 1;
  GW.skyKey = key; GW.sky = buildSky(key); GW.cloudSpr = makeCloudSprites(SKY[key].cloud);
}
function drawMoon(g, x, y, r, col, sun) {
  const lx = sun ? (sun[0] * W - x) : -r, ly = sun ? (sun[1] * H - y) : r * .4, ll = Math.hypot(lx, ly) || 1, ux = lx / ll, uy = ly / ll;
  const gl = g.createRadialGradient(x, y, r, x, y, r * 2.4); gl.addColorStop(0, `rgba(${col},.18)`); gl.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = gl; g.beginPath(); g.arc(x, y, r * 2.4, 0, TAU); g.fill();
  g.save(); g.beginPath(); g.arc(x, y, r, 0, TAU); g.clip();
  g.fillStyle = `rgb(${col})`; g.fillRect(x - r, y - r, r * 2, r * 2);
  for (let i = 0; i < 18; i++) { g.fillStyle = `rgba(0,0,0,${rand(.06, .18)})`; g.beginPath(); g.arc(x + rand(-r, r), y + rand(-r, r), rand(.05, .22) * r, 0, TAU); g.fill(); }
  const sh = g.createRadialGradient(x + ux * r * .6, y + uy * r * .6, r * .2, x + ux * r * .6, y + uy * r * .6, r * 2.1);
  sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(.5, 'rgba(0,0,10,.35)'); sh.addColorStop(.75, 'rgba(0,0,10,.85)'); sh.addColorStop(1, 'rgba(0,0,10,.92)');
  g.fillStyle = sh; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore();
}
function buildSky(key) {
  const P0 = SKY[key], sc = Math.min(DPR, 1.25), c = document.createElement('canvas');
  c.width = Math.max(2, Math.ceil(W * sc)); c.height = Math.max(2, Math.ceil(H * sc));
  const g = c.getContext('2d'); g.scale(sc, sc);
  const gr = g.createLinearGradient(0, 0, 0, H * .9);
  P0.g.forEach((col, i) => gr.addColorStop([0, .32, .58, .82, 1][i], col));
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  for (let i = 0; i < W * H / 1600; i++) { const y = Math.pow(Math.random(), 1.6) * H * .7, a = rand(.2, 1) * P0.stars * (1 - y / (H * .7)); if (a < .02) continue; g.fillStyle = `rgba(255,255,255,${a})`; g.fillRect(rand(0, W), y, 1.2, 1.2); }
  if (P0.sun) {
    const [sx, sy, col] = P0.sun, x = W * sx, y = H * sy, r = Math.min(W, H) * .045;
    const sg = g.createRadialGradient(x, y, 0, x, y, r * 10); sg.addColorStop(0, `rgba(${col},.9)`); sg.addColorStop(.07, `rgba(${col},.55)`); sg.addColorStop(.3, `rgba(${col},.14)`); sg.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = sg; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(255,252,240,.97)'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  }
  if (P0.theme === 2) skyExtrasB(g, P0); else if (P0.theme === 3) skyExtrasC(g, P0); else {
  // planetary ring arcing across the sky, with the planet's shadow cutting through it
  g.save(); g.translate(W * .45, H * 1.32); g.rotate(-.13);
  const rx = W * 1.05, ry = H * 1.02, A = [.18, .32, .12, .4, .28, .06, .35, .22, .3, .1, .26, .18, .08, .14], s0 = Math.PI * 1.44, s1 = Math.PI * 1.56;
  for (let k = 0; k < A.length; k++) {
    const s = 1 + k * .011; g.lineWidth = H * .007 * (1 + (k % 3) * .4);
    g.strokeStyle = `rgba(${P0.ring},${A[k] * P0.ringA})`;
    g.beginPath(); g.ellipse(0, 0, rx * s, ry * s, 0, Math.PI, s0); g.stroke();
    g.beginPath(); g.ellipse(0, 0, rx * s, ry * s, 0, s1, TAU); g.stroke();
    g.strokeStyle = `rgba(${P0.ring},${A[k] * P0.ringA * .22})`;
    g.beginPath(); g.ellipse(0, 0, rx * s, ry * s, 0, s0, s1); g.stroke();
  }
  g.restore();
  drawMoon(g, W * .8, H * .17, Math.min(W, H) * .085, '205,210,225', P0.sun);
  drawMoon(g, W * .31, H * .1, Math.min(W, H) * .032, '225,165,140', P0.sun);
  }
  const hz = g.createLinearGradient(0, H * .5, 0, H * .92); hz.addColorStop(0, `rgba(${P0.fog},0)`); hz.addColorStop(1, `rgba(${P0.fog},.35)`);
  g.fillStyle = hz; g.fillRect(0, H * .5, W, H * .5);
  return c;
}
function makeCloudSprites(col) {
  const out = [];
  for (let i = 0; i < 4; i++) {
    const c = document.createElement('canvas'); c.width = 320; c.height = 120; const g = c.getContext('2d');
    for (let k = 0; k < 16; k++) {
      const x = rand(50, 270), y = rand(50, 80) - Math.sin((x - 50) / 220 * Math.PI) * 20, r = rand(18, 42);
      const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},.42)`); gr.addColorStop(1, `rgba(${col},0)`);
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
    }
    out.push(c);
  }
  return out;
}

