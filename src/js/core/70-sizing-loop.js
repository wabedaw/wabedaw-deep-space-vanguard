/* ---------- sizing + loop ---------- */
function readInsets() {
  const cs = getComputedStyle($('insetProbe'));
  inset.t = parseFloat(cs.paddingTop) || 0; inset.r = parseFloat(cs.paddingRight) || 0;
  inset.b = parseFloat(cs.paddingBottom) || 0; inset.l = parseFloat(cs.paddingLeft) || 0;
}
function resize() {
  const nw = Math.max(1, innerWidth), nh = Math.max(1, innerHeight);
  DPR = Math.min(2, devicePixelRatio || 1);
  const first = !W;
  W = nw; H = nh;
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  readInsets();
  buildNebula(); buildVignette(); buildStars();
  if (S.side && GW) regenTerrain();
  if (typeof measureHero === 'function') measureHero();
  lensA = null;
  if (first) { P.x = W / 2; P.y = H * .78; planet = makePlanet(); planet.y = H * frand(.15, .35); planet.x = W * (W > 700 ? .2 : .25);
    galaxy = { x: W * .62, y: H * .2, s: Math.max(.6, Math.min(W, H) / 700), rot: -.5, vy: 4 }; }
  if (S.mode === 'menu') { holes.length = 0; }
}
let rt = null;
addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 120); });

let last = performance.now();
function frame(now) {
  let dt = (now - last) / 1000; last = now;
  if (dt > .05) dt = .05;
  requestAnimationFrame(frame);
  try {
    if (S.mode !== 'pause') {
      // substep for stability under gravity
      const steps = dt > .025 ? 2 : 1;
      for (let i = 0; i < steps; i++) update(dt / steps);
    }
  } catch (err) { console.error(err); }
  try { render(); } catch (err) { ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; console.error(err); }
}

function boot() {
  refreshStageBtn();
  try { document.fonts && document.fonts.ready.then(() => measureHero()); } catch (e) {}
  buildGalaxySprite();
  resize();
  requestAnimationFrame(t => { last = t; frame(t); });
}
const hot = window.claude && window.claude.hot;
if (hot && hot.snapshot) { try { hot.snapshot(() => ({ best })); } catch (e) {} }
if (hot && hot.ready) hot.ready(boot); else boot();
})();
