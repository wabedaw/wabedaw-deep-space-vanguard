/* ---------- input ---------- */
const K = {};
const KEYMAP = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', Space: 'fire' };
addEventListener('keydown', e => {
  const k = KEYMAP[e.code];
  if (k) { K[k] = true; if (S.mode === 'play') e.preventDefault(); }
  if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyX' || e.code === 'KeyK') { if (!e.repeat) S.misReq = true; K.missile = true; }
  if (e.repeat) return;
  if (e.code === 'KeyP' || (e.code === 'Escape' && S.mode === 'play')) { togglePause(); e.preventDefault(); }
  else if (e.code === 'Escape' && S.mode === 'pause') quitToMenu();
  if (e.code === 'KeyQ') switchWeapon();
  if (e.code === 'Digit1') switchWeapon('spread');
  if (e.code === 'Digit2') switchWeapon('beam');
  if (e.code === 'Digit3') switchWeapon('ult');
  if (e.code === 'KeyE' && S.mode === 'play') useNova();
  if (e.code === 'KeyF' && S.mode === 'play') { S.auto = !S.auto; S.toast = { txt: S.auto ? I18('自动射击 · 开', 'Auto fire · ON') : I18('自动射击 · 关（按住空格射击）', 'Auto fire · OFF (hold Space to fire)'), t: 1.6 }; }
  if (e.code === 'KeyM') setSoundMode(soundMode === 2 ? 0 : 2);
  if (e.code === 'KeyN') setSoundMode(soundMode === 0 ? 1 : 0);
  if (e.code === 'Enter' && S.mode === 'menu') { e.preventDefault(); launchFromMenu(); }
  else if (e.code === 'Enter' && S.mode === 'over') { e.preventDefault(); S.startStage = S.diedStage || 1; startGame(); }
});
addEventListener('keyup', e => {
  const k = KEYMAP[e.code]; if (k) K[k] = false;
  if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyX' || e.code === 'KeyK') K.missile = false;
});
addEventListener('blur', () => { for (const k in K) K[k] = false; });

let drag = null;
cv.addEventListener('contextmenu', e => e.preventDefault());
cv.addEventListener('pointerdown', e => {
  audioInit();
  if (S.mode !== 'play' || !P.alive) return;
  if (e.button === 2) { S.misReq = true; return; }
  drag = { id: e.pointerId, x: e.clientX, y: e.clientY };
  try { cv.setPointerCapture(e.pointerId); } catch (_) {}
});
cv.addEventListener('pointermove', e => {
  if (!drag || drag.id !== e.pointerId) return;
  const k = e.pointerType === 'mouse' ? 1 : 1.35;
  P.dx += (e.clientX - drag.x) * k / VIEW.scale; P.dy += (e.clientY - drag.y) * k / VIEW.scale;
  drag.x = e.clientX; drag.y = e.clientY;
});
const endDrag = e => { if (drag && drag.id === e.pointerId) drag = null; };
cv.addEventListener('pointerup', endDrag); cv.addEventListener('pointercancel', endDrag);

