/* ---------- input ---------- */
// KB: keyboard, mouse and touch state = player 1's controls. K is the controls of the pilot P (players.js).
const KB = { ax: 0, ay: 0 };
let K = KB;
// the device the player used last decides which buttons hints name: 'kb' keyboard/mouse, 'touch', 'pad' controller
const INPUT = { last: COARSE ? 'touch' : 'kb' };
function setInputDevice(d) { if (INPUT.last === d) return; INPUT.last = d; document.body.classList.toggle('pad', d === 'pad'); }
const byDevice = o => o[INPUT.last] || o.kb;
addEventListener('keydown', () => setInputDevice('kb'), true);
addEventListener('pointerdown', e => setInputDevice(e.pointerType === 'touch' ? 'touch' : 'kb'), true);
PLAYERS[0].K = KB;
// Keyboard controls are rebindable (settings): every action has up to two keys, kept in SET.keys. The digits 1-3, M, N,
// Esc and Enter stay fixed. The right-hand Shift / Ctrl / Alt count as the left ones.
const KEY_ACTIONS = ['up', 'down', 'left', 'right', 'fire', 'missile', 'weapon', 'nova', 'pause', 'auto'];
const keyCode = c => ({ ShiftRight: 'ShiftLeft', ControlRight: 'ControlLeft', AltRight: 'AltLeft', MetaRight: 'MetaLeft' }[c] || c);
const keyName = c => !c ? '' : ({ Space: I18('空格', 'Spacebar'), ShiftLeft: 'Shift', ControlLeft: 'Ctrl', AltLeft: 'Alt', MetaLeft: 'Meta', ArrowUp: '↑', ArrowDown: '↓',
  ArrowLeft: '←', ArrowRight: '→', Enter: 'Enter', Tab: 'Tab', Backspace: 'Backspace', CapsLock: 'Caps' }[c] || c.replace(/^Key|^Digit/, '').replace(/^Numpad/, 'Num '));
const keyLabel = a => (SET.keys[a] || []).filter(Boolean).map(keyName).join(' / ');
let KEYMAP = {};
function rebuildKeys() {
  KEYMAP = {};
  for (const a of KEY_ACTIONS) for (const c of SET.keys[a] || []) if (c) KEYMAP[c] = a;
  // the brief's controls list names the current keys
  for (const el of document.querySelectorAll('[data-keys]')) {
    const slot = +el.dataset.slot || 0, txt = el.dataset.keys.split(' ').map(a => keyName((SET.keys[a] || [])[slot])).filter(Boolean).join(' ');
    el.textContent = txt; el.hidden = !txt;
  }
}
const MOVE_KEYS = new Set(['up', 'down', 'left', 'right', 'fire']);
addEventListener('keydown', e => {
  const a = KEYMAP[keyCode(e.code)];
  if (MOVE_KEYS.has(a)) { KB[a] = true; if (S.mode === 'play') e.preventDefault(); }
  if (a === 'missile') { if (!e.repeat) KB.misReq = true; KB.missile = true; if (S.mode === 'play') e.preventDefault(); }
  if (e.repeat) return;
  if (a === 'pause' || (e.code === 'Escape' && S.mode === 'play')) { togglePause(); e.preventDefault(); }
  else if (e.code === 'Escape' && S.mode === 'pause') quitToMenu();
  if (a === 'weapon') switchWeapon();
  if (e.code === 'Digit1') switchWeapon('spread');
  if (e.code === 'Digit2') switchWeapon('beam');
  if (e.code === 'Digit3') switchWeapon('ult');
  if (a === 'nova' && S.mode === 'play') useNova();
  if (a === 'auto' && S.mode === 'play') { S.auto = !S.auto; S.toast = { txt: S.auto ? I18('自动射击 · 开', 'Auto fire · ON') : I18f('自动射击 · 关（按住 {0} 射击）', 'Auto fire · OFF (hold {0} to fire)', keyLabel('fire')), t: 1.6 }; }
  if (e.code === 'KeyM') setSoundMode(soundMode === 2 ? 0 : 2);
  if (e.code === 'KeyN') setSoundMode(soundMode === 0 ? 1 : 0);
  if (e.code === 'Enter' && S.mode === 'menu') { e.preventDefault(); launchFromMenu(); }
  else if (e.code === 'Enter' && S.mode === 'over') { e.preventDefault(); S.startStage = S.diedStage || 1; startGame(); }
});
addEventListener('keyup', e => {
  const a = KEYMAP[keyCode(e.code)];
  if (MOVE_KEYS.has(a)) KB[a] = false;
  if (a === 'missile') KB.missile = false;
});
addEventListener('blur', () => { for (const k in KB) KB[k] = false; KB.ax = KB.ay = 0; });

let drag = null;
cv.addEventListener('contextmenu', e => e.preventDefault());
cv.addEventListener('pointerdown', e => {
  audioInit();
  if (S.mode !== 'play' || !P.alive) return;
  if (e.button === 2) { KB.misReq = true; return; }
  drag = { id: e.pointerId, x: e.clientX, y: e.clientY };
  try { cv.setPointerCapture(e.pointerId); } catch (_) {}
});
cv.addEventListener('pointermove', e => {
  if (!drag || drag.id !== e.pointerId) return;
  const k = (e.pointerType === 'mouse' ? 1 : 1.35) / VIEW.s;   // the ship follows the finger on screen, whatever the field scale
  P.dx += (e.clientX - drag.x) * k; P.dy += (e.clientY - drag.y) * k;
  drag.x = e.clientX; drag.y = e.clientY;
});
const endDrag = e => { if (drag && drag.id === e.pointerId) drag = null; };
cv.addEventListener('pointerup', endDrag); cv.addEventListener('pointercancel', endDrag);

