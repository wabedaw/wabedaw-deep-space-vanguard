/* ---------- settings ---------- */
// The settings screen (menu and pause screen). Values live in SET (= SAVE.data.settings, see save.js) and only change
// how the game looks and sounds: shake, flashes, shot brightness, outlines, the hitbox and the HUD size are applied
// while drawing, volumes in the audio graph. The simulation never reads SET, so settings can't change a run.
const setOv = $('setOv');
const SET_RANGES = [['setMaster', 'master'], ['setMusic', 'music'], ['setSfx', 'sfx'], ['setShots', 'shots']];
const SET_CHECKS = [['setHitbox', 'hitbox'], ['setOutline', 'outline'], ['setShake', 'shake'], ['setCalm', 'calm']];
let setFrom = 'menu';
function setSave() { SAVE.set('settings', SET); }
function setFill() {
  for (const [id, k] of SET_RANGES) { $(id).value = SET[k]; $(id + 'V').textContent = SET[k] + '%'; }
  for (const [id, k] of SET_CHECKS) $(id).checked = !!SET[k];
  $('setHud').value = String(SET.hud);
  $('setFs').checked = PLATFORM.isFullscreen();
}
function openSettings(from) {
  setFrom = from;
  if (from === 'menu') menuEl.hidden = true; else pauseEl.hidden = true;
  SETK.wait = null; setFill(); renderKeys(); setOv.hidden = false;
  $('setMaster').focus({ preventScroll: true });
}
function closeSettings() {
  setOv.hidden = true;
  if (setFrom === 'pause' && S.mode === 'pause') { pauseEl.hidden = false; $('pauseSetBtn').focus({ preventScroll: true }); }
  else if (S.mode === 'menu') { menuEl.hidden = false; $('setBtn').focus({ preventScroll: true }); }
}
for (const [id, k] of SET_RANGES) $(id).addEventListener('input', () => {
  SET[k] = clamp(+$(id).value || 0, 0, 100); $(id + 'V').textContent = SET[k] + '%'; setSave();
  if (k !== 'shots') { audioInit(); applySound(); }
});
for (const [id, k] of SET_CHECKS) $(id).addEventListener('change', () => { SET[k] = $(id).checked; setSave(); });
$('setHud').addEventListener('change', () => { SET.hud = clamp(+$('setHud').value || 1, 1, 1.5); setSave(); });
$('setFs').addEventListener('change', () => { PLATFORM.setFullscreen($('setFs').checked); setTimeout(() => { $('setFs').checked = PLATFORM.isFullscreen(); }, 400); });
$('setBtn').addEventListener('click', e => { e.stopPropagation(); openSettings('menu'); });
$('pauseSetBtn').addEventListener('click', () => openSettings('pause'));
$('setClose').addEventListener('click', closeSettings);
// keyboard controls: click a key button, then press the new key. A key used elsewhere moves here; Backspace clears a
// second key (every action keeps its first one); Esc cancels.
const KEY_NAMES = { up: I18('上移', 'Up'), down: I18('下移', 'Down'), left: I18('左移', 'Left'), right: I18('右移', 'Right'), fire: I18('射击', 'Fire'),
  missile: I18('追踪飞弹', 'Missiles'), weapon: I18('切换武器', 'Switch weapon'), nova: I18('湮星脉冲', 'Nova pulse'), pause: I18('暂停', 'Pause'), auto: I18('自动射击开关', 'Auto fire on/off') };
const SETK = { wait: null };
function renderKeys() {
  const box = $('setKeys'); box.textContent = '';
  for (const a of KEY_ACTIONS) {
    const lab = document.createElement('span'); lab.textContent = KEY_NAMES[a]; box.appendChild(lab);
    for (const slot of [0, 1]) {
      const b = document.createElement('button'), waiting = SETK.wait && SETK.wait.a === a && SETK.wait.slot === slot;
      b.type = 'button'; b.className = waiting ? 'wait' : '';
      b.textContent = waiting ? I18('按新键…', 'Press a key…') : keyName(SET.keys[a][slot]) || '—';
      b.addEventListener('click', () => { SETK.wait = { a, slot }; renderKeys(); box.querySelector('.wait').focus({ preventScroll: true }); });
      box.appendChild(b);
    }
  }
}
function bindKey(code) {
  const { a, slot } = SETK.wait; SETK.wait = null;
  if (code === 'Escape') { renderKeys(); return; }
  if (code === 'Backspace' || code === 'Delete') { if (slot === 1) SET.keys[a][1] = ''; }
  else {
    for (const b of KEY_ACTIONS) for (const s of [0, 1]) if (SET.keys[b][s] === code && !(b === a && s === slot)) {
      // the key leaves its old place; an action can't lose its only key, so that one takes this slot's old key instead
      if (s === 0) { SET.keys[b][0] = SET.keys[a][slot] || SET.keys[b][1] || ''; if (SET.keys[b][0] === SET.keys[b][1]) SET.keys[b][1] = ''; }
      else SET.keys[b][1] = '';
    }
    SET.keys[a][slot] = code;
  }
  setSave(); rebuildKeys(); renderKeys();
}
$('setKeysReset').addEventListener('click', () => { SET.keys = SAVE.defaultKeys(); SAVE.data.settings.keys = SET.keys; setSave(); rebuildKeys(); renderKeys(); });
addEventListener('keydown', e => {
  if (setOv.hidden) return;
  if (SETK.wait) { e.preventDefault(); bindKey(keyCode(e.code)); e.stopImmediatePropagation(); return; }
  if (e.code === 'Escape') { e.preventDefault(); closeSettings(); }
  e.stopImmediatePropagation();
}, true);
rebuildKeys();
