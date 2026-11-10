/* ---------- gamepad ---------- */
// Standard-mapping controllers: Xbox, PlayStation, Switch Pro, and Steam Deck through Steam Input. Polled once per
// frame before the simulation steps. Each controller drives one pilot's controls (p.K, the same flags the keyboard
// writes for player 1, plus an analog stick vector K.ax / K.ay that updatePlayer reads):
//   one pilot:  the first controller is player 1, alongside the keyboard
//   two pilots: two controllers -> player 1 and player 2; one controller -> player 2 (player 1 has the keyboard)
// In play:  move: left stick / d-pad   A: homing missiles   X or LB: switch weapon   Y or RB: nova pulse
//           RT: fire (when auto fire is off)   View/Back: auto fire on/off   Menu/Start: pause
// Menus (any controller): A or Start launches / retries / resumes, B leaves the pause screen or the mission report
const PADS = new Map();   // gamepad index -> { prev: buttons pressed last frame, owner: pilot, held: flags it set }
const PAD_DEAD = .22;
const PAD = { used: false };
function padOwner(order, count) {
  if (PLAYERS.length < 2) return order === 0 ? PLAYERS[0] : null;
  if (count >= 2) return PLAYERS[order] || null;
  return PLAYERS[1];
}
function padRelease(st) {
  if (!st.owner) return;
  const K2 = st.owner.K;
  K2.ax = K2.ay = 0;
  if (st.held.fire) K2.fire = false;
  if (st.held.missile) K2.missile = false;
  st.held.fire = st.held.missile = false;
}
function pollGamepad() {
  const list = navigator.getGamepads ? [...navigator.getGamepads()].filter(p => p && p.connected && p.mapping === 'standard') : [];
  for (const [idx, st] of PADS) if (!list.some(p => p.index === idx)) { padRelease(st); PADS.delete(idx); }
  list.forEach((gp, order) => {
    let st = PADS.get(gp.index);
    if (!st) { st = { prev: [], owner: null, held: { fire: false, missile: false } }; PADS.set(gp.index, st); }
    const owner = padOwner(order, list.length);
    if (owner !== st.owner) { padRelease(st); st.owner = owner; }
    const on = i => !!(gp.buttons[i] && gp.buttons[i].pressed), hit = i => on(i) && !st.prev[i];
    if (gp.buttons.some(b => b.pressed)) PAD.used = true;
    if (owner) {
      const K2 = owner.K;
      let ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
      const m = Math.hypot(ax, ay);
      if (m < PAD_DEAD) ax = ay = 0; else { const k = Math.min(1, (m - PAD_DEAD) / (1 - PAD_DEAD)) / m; ax *= k; ay *= k; }
      K2.ax = clamp(ax + (on(15) ? 1 : 0) - (on(14) ? 1 : 0), -1, 1); K2.ay = clamp(ay + (on(13) ? 1 : 0) - (on(12) ? 1 : 0), -1, 1);
      if (K2.ax || K2.ay) PAD.used = true;
      if (S.mode === 'play') {
        if (hit(0)) K2.misReq = true;
        if (on(0) !== st.held.missile) { K2.missile = st.held.missile = on(0); }
        if (on(7) !== st.held.fire) { K2.fire = st.held.fire = on(7); }
        if (hit(2) || hit(4)) withPlayer(owner, () => switchWeapon());
        if (hit(3) || hit(5)) withPlayer(owner, () => useNova());
      }
    }
    if (S.mode === 'play') {
      if (hit(8)) { S.auto = !S.auto; S.toast = { txt: S.auto ? I18('自动射击 · 开', 'Auto fire · ON') : I18('自动射击 · 关（按住 RT 射击）', 'Auto fire · OFF (hold RT to fire)'), t: 1.6 }; }
      if (hit(9)) togglePause();
    } else if (S.mode === 'pause') {
      if (hit(9) || hit(0)) togglePause(); else if (hit(1)) quitToMenu();
    } else if (S.mode === 'menu') {
      if (hit(0) || hit(9)) { audioInit(); launchFromMenu(); }
    } else if (S.mode === 'over') {
      if (hit(0) || hit(9)) { S.startStage = S.diedStage || 1; startGame(); } else if (hit(1)) quitToMenu();
    }
    st.prev = gp.buttons.map(b => b.pressed);
  });
}
