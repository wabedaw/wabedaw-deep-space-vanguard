/* ---------- developer mode: password-gated panel to jump to any stage, sector or boss for testing ---------- */
const DEV_HASH = 4017947777;
const devHash = s => { let h = 0x811c9dc5; for (const c of 'dsv-dev:' + s) { h ^= c.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return h; };
let devUnlocked = SAVE.get('dev') === true;
const DEV = { run: null, st: 1, from: 'menu' };
const devOv = $('devOv'), devPw = $('devPw'), devGod = $('devGod'), devMax = $('devMax'), devUlt = $('devUlt'), devDuo = $('devDuo'), pauseDevBtn = $('pauseDevBtn');
{ const o = SAVE.get('devOpts'); if (o && typeof o === 'object') { devGod.checked = !!o.god; devMax.checked = !!o.max; devUlt.checked = o.ult !== false; devDuo.checked = !!o.duo; } }
devPw.placeholder = I18('密码', 'Password');
const DEV_KIND = { space: I18('太空', 'Space'), surface: I18('地表', 'Surface'), base: I18('基地', 'Base'), final: I18('终局', 'Finale') };
const pad2 = n => String(n).padStart(2, '0');
function devBossList(st) {
  const k = stageKind(st), th = themeOf(st), cyc = cycOf(st);
  if (k === 'final') return [
    { lv: 1, name: BOSSES.omega.name, tag: I18('终焉之星 · 星环 → 护盾 → 极地大门', 'Omega Star · rings → shield → polar gate') },
    { lv: 2, name: BOSSES.god.name, tag: I18('最终BOSS · 星核之中', 'Final boss · in the core') }];
  return [3, 6, 9, 10].map(lv => {
    let kind, n = cyc;
    if (k === 'space') {
      if (lv === 10) kind = ['fortress', 'fortress', 'aegis', 'cryo'][th];
      else { n = Math.max(1, (cyc - 1) * 3 + Math.round(lv / 3)); kind = (th === 3 ? BOSS_ORDER_C : th === 2 ? BOSS_ORDER_B : BOSS_ORDER)[(n - 1) % 3]; }
    } else if (k === 'surface') kind = lv === 10 ? ['colossus', 'colossus', 'forge', 'frostcit'][th] : [SIDE_MINIS, SIDE_MINIS, SIDE_MINIS_B, SIDE_MINIS_C][th][lv / 3 - 1];
    else kind = lv === 10 ? ['core', 'core', 'hivemind', 'zero'][th] : ['gate', 'gate', 'hgate', 'cgate'][th] + lv / 3;
    let name = kind; try { name = bossLabel(kind, n); } catch (e) {}
    return { lv, name, tag: (lv === 10 ? I18('关底BOSS', 'Stage boss') : I18('中途BOSS', 'Mid-boss')) + ' · ' + I18('扇区 ', 'sector ') + pad2(lv) };
  });
}
function devRender() {
  $('devLock').hidden = devUnlocked; $('devBody').hidden = !devUnlocked; $('devLockBtn').hidden = !devUnlocked;
  pauseDevBtn.hidden = !devUnlocked;
  if (!devUnlocked) return;
  const st = DEV.st, k = stageKind(st), fin = k === 'final';
  const sb = $('devStages'); sb.textContent = '';
  for (let s = 1; s <= 10; s++) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'dev-st k-' + stageKind(s);
    b.setAttribute('aria-pressed', String(s === st)); b.innerHTML = `<span>${s}</span><small>${DEV_KIND[stageKind(s)]}</small>`;
    b.addEventListener('click', () => { DEV.st = s; devRender(); }); sb.appendChild(b);
  }
  $('devTitle').textContent = stageTag(st) + ' · ' + DEV_KIND[k];
  const sc = $('devSecs'); sc.textContent = ''; sc.classList.toggle('fin', fin);
  const bossLv = fin ? [] : [3, 6, 9, 10];
  for (let lv = 1; lv <= (fin ? 2 : 10); lv++) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'dev-sec' + (bossLv.includes(lv) ? ' b' : '');
    b.innerHTML = fin ? `<b>${pad2(lv)}</b><small>${FINAL_NAMES[lv - 1]}</small>` : `<b>${pad2(lv)}</b>`;
    b.title = sectorName((st - 1) * 10 + lv); b.setAttribute('aria-label', I18('从扇区 ', 'Start at sector ') + pad2(lv) + ' · ' + b.title);
    b.addEventListener('click', () => devStart(st, lv, false)); sc.appendChild(b);
  }
  const bb = $('devBosses'); bb.textContent = '';
  for (const o of devBossList(st)) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'dev-boss' + (o.lv === 10 || fin ? ' big' : '');
    b.innerHTML = `<b>${o.name}</b><small>${o.tag}</small>`;
    b.addEventListener('click', () => devStart(st, o.lv, true)); bb.appendChild(b);
  }
}
function openDev(from) {
  DEV.from = from; if (S.mode === 'play') return;
  if (S.mode === 'menu') { menuEl.hidden = true; DEV.st = Math.min(10, Math.max(DEV.st, 1)); }
  if (S.mode === 'pause') { pauseEl.hidden = true; DEV.st = Math.min(10, stageOf(S.sector) > 10 ? 1 : stageOf(S.sector)); }
  $('devErr').hidden = true; devPw.value = ''; devOv.hidden = false; devRender();
  (devUnlocked ? $('devClose') : devPw).focus({ preventScroll: true });
}
function closeDev(launching) {
  devOv.hidden = true; if (launching) return;
  if (S.mode === 'pause') { pauseEl.hidden = false; $('resumeBtn').focus({ preventScroll: true }); }
  else if (S.mode === 'menu') { menuEl.hidden = false; $('devBtn').focus({ preventScroll: true }); }
}
// put a run that has just started at stage st at sector lv of that stage, or (boss) right before that sector's boss;
// used by the developer panel and by checkpoints
function placeRunAt(st, lv, boss) {
  const k = stageKind(st), b0 = (st - 1) * 10;
  if (k === 'final') {
    if (lv >= 2) { S.sector = b0 + 2; S.sectorT = 0; S.aceTip = false; S.tAce = 6; enterBase(); P.x = -30; P.y = H * .5; P.gx = 320; P.gy = 0; formFollowers(); }
    if (boss) { if (lv >= 2) baseFlatFrom(S.wx - 40, true); S.sectorT = lv >= 2 ? 41.95 : 25.95; }
  } else {
    if (lv > 1) { S.sector = b0 + lv - 1; nextSector(); }
    if (boss) {
      if (k === 'surface' && lv === 10) forcePlateauFrom(S.wx - 40);
      else if (k === 'base') baseFlatFrom(S.wx - 40, lv === 10);
      S.sectorT = secLen() - .05;
    }
  }
}
function devStart(st, lv, boss) {
  DEV.run = { god: devGod.checked, max: devMax.checked, ult: devUlt.checked, duo: devDuo.checked };
  SAVE.set('devOpts', Object.assign({}, DEV.run));
  closeDev(true);
  if (S.mode !== 'menu') quitToMenu();
  menuEl.classList.remove('leaving');
  S.startStage = st; startGame();
  placeRunAt(st, lv, boss);
  const k = stageKind(st);
  if (S.dev && S.dev.max) { P.lvl = 10; P.mis = P.misMax; }
  if (S.dev && S.dev.ult) { P.weapon = 'ult'; P.bm = null; P.arcs = []; } else if (P.weapon === 'ult') P.weapon = 'spread';
  updateWeaponBtn(); updateNovaBtn();
  S.banner = { big: k === 'space' ? sectorTag() : stageTag(st), sub: (k === 'space' ? '' : sectorTag() + ' · ') + sectorName(), t: 0, dur: 2.6 };
  S.toast = { txt: I18('开发者模式 · ', 'DEV MODE · ') + (boss ? I18('直达BOSS', 'straight to the boss') : I18('从扇区 ', 'from sector ') + pad2(lv)), t: 2.6 };
}
function devTick() {
  if (S.dev.max) { if (P.lvl < 10) P.lvl = 10; P.mis = P.misMax; }
}
function drawDevHud(L, y) {
  const d = S.dev; ctx.font = `700 10.5px ${FD}`; setLS('1.5px'); ctx.fillStyle = 'rgba(255,120,220,.95)';
  ctx.fillText(I18('开发者模式', 'DEV MODE') + (d.god ? I18(' · 无敌', ' · INVINCIBLE') : '') + (d.max ? I18(' · 满火力', ' · MAX POWER') : '') + (d.ult ? I18(' · 终极武器', ' · ULTIMATE') : ''), L, y); setLS('0px');
}
$('devBtn').addEventListener('click', e => { e.stopPropagation(); openDev('menu'); });
pauseDevBtn.addEventListener('click', () => openDev('pause'));
$('devClose').addEventListener('click', () => closeDev(false));
$('devLockBtn').addEventListener('click', () => { devUnlocked = false; SAVE.set('dev', false); devRender(); devPw.focus({ preventScroll: true }); });
$('devLock').addEventListener('submit', e => {
  e.preventDefault();
  if (devHash(devPw.value.trim().toLowerCase()) === DEV_HASH) {
    devUnlocked = true; SAVE.set('dev', true); devPw.value = ''; $('devErr').hidden = true; devRender(); $('devClose').focus({ preventScroll: true });
  } else {
    devPw.value = ''; const er = $('devErr'); er.hidden = false; er.classList.remove('shake'); void er.offsetWidth; er.classList.add('shake'); devPw.focus({ preventScroll: true });
  }
});
addEventListener('keydown', e => { if (devOv.hidden) return; if (e.code === 'Escape') { e.preventDefault(); closeDev(false); } e.stopImmediatePropagation(); }, true);
devRender();


