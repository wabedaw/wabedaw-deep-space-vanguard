/* ---------- fixed-step simulation + render interpolation ---------- */
// The simulation always advances in exact 1/60 s steps, whatever the display's refresh rate. The game was tuned at
// 60 updates a second, and a fixed step makes a seeded run replay identically on 60, 120, 144 or 165 Hz screens.
// On displays faster than 60 Hz, render() draws positions interpolated between the last two steps, so motion stays smooth.
const STEP = 1 / 60;
const SIM = { step: 0, hooks: [] };   // hooks run before every step: input sampling for replays, tests
const LERP_JUMP = 160;                 // a longer move in one step is a teleport or a wrap-around: draw it where it is
const lerpLists = () => [lasers, missiles, ebul, rocks, ships, holes, powers, parts, waves, texts, beams, lances, ultDarts, stars, dust];
function forLerp(fn) {
  for (const L of lerpLists()) for (const o of L) { fn(o); if (o.parts) for (const p of o.parts) fn(p); }
  fn(P);
  if (planet) { fn(planet); if (planet.sats) for (const s of planet.sats) fn(s); }
  if (galaxy) fn(galaxy);
}
function simStep() {
  forLerp(o => { o.__px = o.x; o.__py = o.y; });
  S.__pwx = S.wx;
  for (const f of SIM.hooks) f();
  update(STEP);
  SIM.step++;
}
let lerpOn = false;
function lerpApply(al) {
  if (!(al > 0.001 && al < 0.999)) return;
  lerpOn = true;
  forLerp(o => {
    const px = o.__px, py = o.__py, x = o.x, y = o.y;
    if (typeof px !== 'number' || typeof py !== 'number' || typeof x !== 'number' || typeof y !== 'number') return;
    const dx = x - px, dy = y - py;
    if (dx > LERP_JUMP || dx < -LERP_JUMP || dy > LERP_JUMP || dy < -LERP_JUMP) return;
    o.__rx = x; o.__ry = y; o.x = px + dx * al; o.y = py + dy * al;
  });
  if (typeof S.wx === 'number' && typeof S.__pwx === 'number' && Math.abs(S.wx - S.__pwx) < LERP_JUMP) { S.__rwx = S.wx; S.wx = S.__pwx + (S.wx - S.__pwx) * al; }
}
function lerpRestore() {
  if (!lerpOn) return;
  lerpOn = false;
  forLerp(o => { if (o.__rx !== undefined) { o.x = o.__rx; o.y = o.__ry; o.__rx = undefined; } });
  if (S.__rwx !== undefined) { S.wx = S.__rwx; S.__rwx = undefined; }
}
