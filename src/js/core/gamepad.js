/* ---------- gamepad ---------- */
// Standard-mapping controllers: Xbox, PlayStation, Switch Pro, and Steam Deck through Steam Input. Polled once per
// frame before the simulation steps. Each controller drives one pilot's controls (p.K, the same flags the keyboard
// writes for player 1, plus an analog stick vector K.ax / K.ay that updatePlayer reads):
//   one pilot:  the first controller is player 1, alongside the keyboard
//   two pilots: two controllers -> player 1 and player 2; one controller -> player 2 (player 1 has the keyboard)
// In play:  move: left stick / d-pad   A: homing missiles   X or LB: switch weapon   Y or RB: nova pulse
//           RT: fire (when auto fire is off)   View/Back: auto fire on/off   Menu/Start: pause
// Menus (any controller): d-pad / left stick moves between the screen's buttons and options, A presses (or ticks,
// or steps a list), left / right also change a slider, B goes back, Start launches / resumes / flies again
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
    if (gp.buttons.some(b => b.pressed) || Math.hypot(gp.axes[0] || 0, gp.axes[1] || 0) > .5) { PAD.used = true; setInputDevice('pad'); }
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
    } else if (S.mode === 'menu' || S.mode === 'pause' || S.mode === 'over') {
      padMenu(gp, st, on, hit);
    }
    st.prev = gp.buttons.map(b => b.pressed);
  });
}

// ---------- menus with a controller ----------
const NAV = { dir: '', next: 0 };
function navScreen() { return [...document.querySelectorAll('.overlay')].find(o => !o.hidden) || null; }
function navItems(ov) {
  return [...ov.querySelectorAll('button, input, select')].filter(el => !el.disabled && el.offsetParent !== null && el.getClientRects().length);
}
function navFocus(el) { if (!el) return; el.focus({ preventScroll: true }); try { el.scrollIntoView({ block: 'nearest' }); } catch (e) {} }
// the default control of a screen: the launch / fly-again / resume / close button, else the first one
function navDefault(ov, items) {
  return items.find(el => ['startBtn', 'cpBtn', 'againBtn', 'resumeBtn', 'setClose', 'lbClose', 'devClose'].includes(el.id)) || items[0];
}
// spatial move: the nearest control whose centre lies in that direction (straight ahead counts more than sideways)
function navMove(ov, dx, dy) {
  const items = navItems(ov), cur = document.activeElement;
  if (!items.includes(cur)) { navFocus(navDefault(ov, items)); return; }
  const c = cur.getBoundingClientRect(), cx = c.left + c.width / 2, cy = c.top + c.height / 2;
  let best = null, bs = Infinity;
  for (const el of items) {
    if (el === cur) continue;
    const r = el.getBoundingClientRect(), x = r.left + r.width / 2 - cx, y = r.top + r.height / 2 - cy;
    const along = x * dx + y * dy, side = Math.abs(x * dy - y * dx);
    if (along <= 2) continue;
    const score = along + side * 2.5;
    if (score < bs) { bs = score; best = el; }
  }
  if (best) navFocus(best);
}
function navAdjust(el, dir) {
  if (el.type !== 'range') return false;
  el.value = clamp(+el.value + dir * (+el.step || 1), +el.min, +el.max); el.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
}
function navPress(el) {
  if (el.tagName === 'SELECT') { el.selectedIndex = (el.selectedIndex + 1) % el.options.length; el.dispatchEvent(new Event('change', { bubbles: true })); }
  else if (el.type === 'range') navAdjust(el, 1);
  else el.click();
}
function navBack(ov) {
  const id = ov.id;
  if (id === 'setOv') closeSettings();
  else if (id === 'lbOv') closeLb();
  else if (id === 'devOv') $('devClose').click();
  else if (id === 'pauseOv') togglePause();
  else if (id === 'over') quitToMenu();
  else if (id === 'menu' && !helpSheet.hidden) helpBtn.click();
}
function padMenu(gp, st, on, hit) {
  const ov = navScreen(); if (!ov) return;
  if (hit(9)) {   // Start: straight into the action
    if (S.mode === 'menu' && ov.id === 'menu') { audioInit(); launchFromMenu(); return; }
    if (S.mode === 'pause' && ov.id === 'pauseOv') { togglePause(); return; }
    if (S.mode === 'over' && ov.id === 'over') { S.startStage = S.diedStage || 1; startGame(); return; }
  }
  const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
  const dir = on(12) || ay < -.6 ? 'u' : on(13) || ay > .6 ? 'd' : on(14) || ax < -.6 ? 'l' : on(15) || ax > .6 ? 'r' : '';
  const now = performance.now();
  if (dir && (dir !== NAV.dir || now >= NAV.next)) {
    NAV.next = now + (dir !== NAV.dir ? 380 : 120);
    const cur = document.activeElement, v = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] }[dir];
    if (!(navItems(ov).includes(cur) && (dir === 'l' || dir === 'r') && navAdjust(cur, v[0]))) navMove(ov, v[0], v[1]);
  }
  NAV.dir = dir;
  if (hit(0)) { audioInit(); const items = navItems(ov), cur = document.activeElement; if (items.includes(cur)) navPress(cur); else { const d = navDefault(ov, items); navFocus(d); if (d) navPress(d); } }
  else if (hit(1)) navBack(ov);
}
