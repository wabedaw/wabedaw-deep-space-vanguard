/* ---------- sizing + loop ---------- */
function readInsets() {
  // safe-area insets (phone notches) arrive in CSS pixels; the part that falls outside the letterboxed field
  // doesn't matter, the rest is converted to field units
  const cs = getComputedStyle($('insetProbe')), V = VIEW;
  const fr = V.cw - V.ox - W * V.s, fb = V.ch - V.oy - H * V.s;
  inset.t = Math.max(0, (parseFloat(cs.paddingTop) || 0) - V.oy) / V.s; inset.r = Math.max(0, (parseFloat(cs.paddingRight) || 0) - fr) / V.s;
  inset.b = Math.max(0, (parseFloat(cs.paddingBottom) || 0) - fb) / V.s; inset.l = Math.max(0, (parseFloat(cs.paddingLeft) || 0) - V.ox) / V.s;
}
/* The play field has a fixed logical size, so the same seed and the same inputs play out identically on every
   screen (weekly challenge fairness, replays). Landscape screens get exactly FIELD_W x FIELD_H, scaled to fit and
   letterboxed. Portrait phones (website only, no global leaderboards) get a FIELD_PW-wide field whose height
   follows the screen within FIELD_PH_MIN..FIELD_PH_MAX. W and H are the field in logical units; DPR is device
   pixels per logical unit; VIEW holds the mapping to the window. */
const FIELD_W = 1280, FIELD_H = 720, FIELD_PW = 450, FIELD_PH_MIN = 800, FIELD_PH_MAX = 1000;
function resize() {
  const cw = Math.max(1, innerWidth), ch = Math.max(1, innerHeight), dpr = Math.min(2, devicePixelRatio || 1);
  const first = !W, ow = W, oh = H;
  if (cw >= ch) { W = FIELD_W; H = FIELD_H; }
  else { W = FIELD_PW; H = Math.round(clamp(FIELD_PW * ch / cw, FIELD_PH_MIN, FIELD_PH_MAX)); }
  const s = Math.min(cw / W, ch / H);
  Object.assign(VIEW, { s, cw, ch, dpr, ox: (cw - W * s) / 2, oy: (ch - H * s) / 2 });
  DPR = dpr * s;
  cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
  VIEW.vx = Math.round(VIEW.ox * dpr); VIEW.vy = Math.round(VIEW.oy * dpr);
  // DOM menus, the pause/sound buttons and the touch buttons sit inside the field too (style.css reads these)
  const rs = document.documentElement.style;
  rs.setProperty('--vt', VIEW.oy + 'px'); rs.setProperty('--vl', VIEW.ox + 'px');
  rs.setProperty('--vb', Math.max(0, ch - VIEW.oy - H * s) + 'px'); rs.setProperty('--vr', Math.max(0, cw - VIEW.ox - W * s) + 'px');
  readInsets();
  buildNebula(); buildVignette(); buildStars();
  // terrain only depends on the field size: regenerating it on a plain window resize would draw from the
  // simulation's random stream and change the run
  if (S.side && GW && (W !== ow || H !== oh)) regenTerrain();
  if (typeof measureHero === 'function') measureHero();
  lensA = null;
  if (first) { P.x = W / 2; P.y = H * .78; planet = makePlanet(); planet.y = H * frand(.15, .35); planet.x = W * (W > 700 ? .2 : .25);
    galaxy = { x: W * .62, y: H * .2, s: Math.max(.6, Math.min(W, H) / 700), rot: -.5, vy: 4 }; }
  if (S.mode === 'menu') { holes.length = 0; }
}
// window (CSS pixel) coordinates -> field coordinates
const toField = (x, y) => ({ x: (x - VIEW.ox) / VIEW.s, y: (y - VIEW.oy) / VIEW.s });
let rt = null;
addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 120); });

/* The loop: the simulation advances in fixed STEP-long steps (70a-fixed-step.js), so a run plays out the same at 60,
   120 or 144 Hz and on slow machines, which fall behind (the game slows down) rather than take bigger steps. Frame
   times close to a common refresh interval are snapped to it, so a 60 Hz display gets exactly one step per frame.
   Every frame is drawn, with positions interpolated between the last two steps, so 120/144/165 Hz screens stay
   smooth. The gamepad is read once per frame, before the steps (it also has to work while paused). */
const MAX_STEPS = 4;
let last = performance.now(), acc = 0;
function frame(now) {
  let dt = (now - last) / 1000; last = now;
  if (!(dt > 0)) dt = 0; else if (dt > .25) dt = .25;
  // (tight tolerance: 144 Hz frames are 6.9 ms and must not be mistaken for 120 Hz ones at 8.3 ms)
  for (const r of [STEP, STEP / 2, STEP * 2]) if (Math.abs(dt - r) < .0004) { dt = r; break; }
  requestAnimationFrame(frame);
  try { pollGamepad(); } catch (err) { console.error(err); }
  try {
    if (S.mode !== 'pause') {
      acc += dt;
      let n = 0;
      while (acc >= STEP - 1e-6 && n < MAX_STEPS) { simStep(); acc -= STEP; n++; }
      if (acc >= STEP) acc = 0;   // still behind after MAX_STEPS: slow the game down instead of spiralling
    } else acc = 0;
  } catch (err) { acc = 0; console.error(err); }
  try { lerpApply(S.mode === 'pause' ? 1 : acc / STEP); render(); }
  catch (err) { ctx.setTransform(DPR, 0, 0, DPR, VIEW.vx, VIEW.vy); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; console.error(err); }
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
