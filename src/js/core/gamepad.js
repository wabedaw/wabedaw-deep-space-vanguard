/* ---------- gamepad ---------- */
// Standard-mapping controllers: Xbox, PlayStation, Switch Pro, and Steam Deck through Steam Input. Polled once per
// frame before the simulation steps; it writes the same K flags the keyboard writes, plus an analog stick vector
// (K.ax, K.ay) that updatePlayer reads.
//   move: left stick / d-pad      A: homing missiles      X or LB: switch weapon      Y or RB: nova pulse
//   RT: fire (when auto fire is off)   View/Back: auto fire on/off   Menu/Start: pause
//   menus: A or Start launches / retries / resumes, B leaves the pause screen or the mission report
const PAD = { prev: [], used: false, held: { fire: false, missile: false } };
const PAD_DEAD = .22;
function pollGamepad() {
  const list = navigator.getGamepads ? navigator.getGamepads() : [];
  let gp = null;
  for (const p of list) if (p && p.connected && p.mapping === 'standard') { gp = p; break; }
  if (!gp) { if (PAD.used) { K.ax = K.ay = 0; if (PAD.held.fire) K.fire = false; if (PAD.held.missile) K.missile = false; PAD.held.fire = PAD.held.missile = false; PAD.prev = []; } return; }
  const on = i => !!(gp.buttons[i] && gp.buttons[i].pressed), hit = i => on(i) && !PAD.prev[i];
  let ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
  const m = Math.hypot(ax, ay);
  if (m < PAD_DEAD) ax = ay = 0; else { const k = Math.min(1, (m - PAD_DEAD) / (1 - PAD_DEAD)) / m; ax *= k; ay *= k; }
  ax = clamp(ax + (on(15) ? 1 : 0) - (on(14) ? 1 : 0), -1, 1); ay = clamp(ay + (on(13) ? 1 : 0) - (on(12) ? 1 : 0), -1, 1);
  if (ax || ay || gp.buttons.some(b => b.pressed)) PAD.used = true;
  K.ax = ax; K.ay = ay;
  if (S.mode === 'play') {
    if (hit(0)) S.misReq = true;
    if (on(0) !== PAD.held.missile) { K.missile = PAD.held.missile = on(0); }
    if (on(7) !== PAD.held.fire) { K.fire = PAD.held.fire = on(7); }
    if (hit(2) || hit(4)) switchWeapon();
    if (hit(3) || hit(5)) useNova();
    if (hit(8)) { S.auto = !S.auto; S.toast = { txt: S.auto ? I18('自动射击 · 开', 'Auto fire · ON') : I18('自动射击 · 关（按住 RT 射击）', 'Auto fire · OFF (hold RT to fire)'), t: 1.6 }; }
    if (hit(9)) togglePause();
  } else if (S.mode === 'pause') {
    if (hit(9) || hit(0)) togglePause(); else if (hit(1)) quitToMenu();
  } else if (S.mode === 'menu') {
    if (hit(0) || hit(9)) { audioInit(); launchFromMenu(); }
  } else if (S.mode === 'over') {
    if (hit(0) || hit(9)) { S.startStage = S.diedStage || 1; startGame(); } else if (hit(1)) quitToMenu();
  }
  PAD.prev = gp.buttons.map(b => b.pressed);
}
