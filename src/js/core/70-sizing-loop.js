/* ---------- sizing + loop ---------- */
function readInsets() {
  // in the fixed field the dark frame already clears notches and home indicators
  if (VIEW.fixed) { inset.t = inset.r = inset.b = inset.l = 0; return; }
  const cs = getComputedStyle($('insetProbe'));
  inset.t = parseFloat(cs.paddingTop) || 0; inset.r = parseFloat(cs.paddingRight) || 0;
  inset.b = parseFloat(cs.paddingBottom) || 0; inset.l = parseFloat(cs.paddingLeft) || 0;
}
function resize() {
  const sw = Math.max(1, innerWidth), sh = Math.max(1, innerHeight);
  DPR = Math.min(2, devicePixelRatio || 1);
  const first = !W, fixed = useFixedView(sw, sh);
  const nw = fixed ? LOGICAL_W : sw, nh = fixed ? LOGICAL_H : sh, sized = nw !== W || nh !== H;
  W = nw; H = nh;
  Object.assign(VIEW, { fixed, sw, sh, scale: fixed ? Math.min(sw / W, sh / H) : 1 });
  VIEW.ox = fixed ? (sw - W * VIEW.scale) / 2 : 0; VIEW.oy = fixed ? (sh - H * VIEW.scale) / 2 : 0;
  cv.width = Math.round(sw * DPR); cv.height = Math.round(sh * DPR);
  const rs = document.documentElement.style, fw = W * VIEW.scale, fh = H * VIEW.scale;  // DOM menus and buttons sit inside the field too
  rs.setProperty('--vt', VIEW.oy + 'px'); rs.setProperty('--vl', VIEW.ox + 'px'); rs.setProperty('--vb', Math.max(0, sh - VIEW.oy - fh) + 'px'); rs.setProperty('--vr', Math.max(0, sw - VIEW.ox - fw) + 'px');
  readInsets();
  buildNebula(); buildVignette(); buildStars();
  if (sized && S.side && GW) regenTerrain();
  if (typeof measureHero === 'function') measureHero();
  lensA = null;
  if (first) { P.x = W / 2; P.y = H * .78; planet = makePlanet(); planet.y = H * frand(.15, .35); planet.x = W * (W > 700 ? .2 : .25);
    galaxy = { x: W * .62, y: H * .2, s: Math.max(.6, Math.min(W, H) / 700), rot: -.5, vy: 4 }; }
  if (S.mode === 'menu') { holes.length = 0; }
}
let rt = null;
addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 120); });

let last = performance.now(), acc = 0;
function frame(now) {
  let dt = (now - last) / 1000; last = now;
  if (dt > .05) dt = .05;   // after a stall, slow down rather than jump ahead
  requestAnimationFrame(frame);
  try {
    if (S.mode !== 'pause') {
      acc += dt;
      let n = 0;
      while (acc >= STEP && n < 4) { simStep(); acc -= STEP; n++; }
      if (acc >= STEP) acc = 0;
    } else acc = 0;
  } catch (err) { acc = 0; console.error(err); }
  try { lerpApply(S.mode === 'pause' ? 1 : acc / STEP); render(); }
  catch (err) { ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; console.error(err); }
  finally { lerpRestore(); }
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
