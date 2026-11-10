/* ---------- UI ---------- */
const $ = id => document.getElementById(id);
const menuEl = $('menu'), overEl = $('over'), pauseEl = $('pauseOv'), pauseBtn = $('pauseBtn'), misBtn = $('missileBtn'), weaponBtn = $('weaponBtn');
$('bestMenu').textContent = String(best).padStart(7, '0');
function startGame() {
  audioInit();
  menuEl.hidden = true; overEl.hidden = true; pauseEl.hidden = true;
  const seed = S.nextSeed != null ? S.nextSeed >>> 0 : SEED_URL != null ? SEED_URL : (Math.random() * 4294967296) >>> 0;
  RNG.seed(seed);
  resetGame();
  S.seed = seed; S.nextSeed = null;
  S.dev = DEV.run; LB.last = null; tutReset();
  if (P.weapon === 'ult' && !ultAvail()) P.weapon = P.superPrev || 'spread';
  P.superPrev = null;
  S.mode = 'play';
  pauseBtn.hidden = false; misBtn.hidden = !COARSE; weaponBtn.hidden = !COARSE; updateWeaponBtn(); updateNovaBtn(); document.body.classList.add('in-play');
  P.y = H + 40; P.gy = -210;
  { const st = S.startStage || (+((location.hash.match(/^#stage(\d+)$/) || [])[1]) || 1); S.startStage = 0; if (st > 1) startAtStage(st); }
  if (location.hash === '#fortress') { S.sector = 10; S.sectorT = SECTOR_LEN - 2.5; P.lvl = 6; P.mis = P.misMax; S.banner = { big: I18('扇区 ', 'SECTOR ') + String(S.sector).padStart(2, '0'), sub: SECTOR_NAMES[9], t: 0, dur: 2.4 }; }
  sfx.sector();
}
function showOver(isBest) {
  if (S.mode !== 'play') return;
  S.mode = 'over';
  pauseBtn.hidden = true; misBtn.hidden = true; weaponBtn.hidden = true; $('novaBtn').hidden = true; document.body.classList.remove('in-play');
  $('oScore').textContent = S.score.toLocaleString('en-US');
  $('oBest').textContent = best.toLocaleString('en-US');
  $('oSector').textContent = String(S.sector).padStart(2, '0');
  $('oKills').textContent = S.kills;
  $('oRocks').textContent = S.rocks;
  $('oDist').textContent = S.dist.toFixed(2) + ' AU';
  $('newBest').hidden = !isBest;
  lbOverNote();
  const byHole = S.deathBy === 'hole', byLance = S.deathBy === 'lance';
  $('overEyebrow').textContent = byHole ? I18('任务报告 · 信号消失于事件视界', 'Mission report · signal lost past the horizon') : byLance ? I18('任务报告 · 舰体被光矛贯穿', 'Mission report · hull pierced by a lance') : I18('任务报告 · 信号中断', 'Mission report · signal lost');
  $('overTitle').innerHTML = byHole ? I18('坠入黑洞<small>CONSUMED BY SINGULARITY</small>', 'Lost to the singularity<small>PAST THE POINT OF NO RETURN</small>') : byLance ? I18('光矛贯穿<small>LANCE IMPACT</small>', 'Lanced<small>LETHAL BEAM IMPACT</small>') : I18('舰体损毁<small>VESSEL LOST</small>', 'Vessel lost<small>HULL INTEGRITY 0%</small>');
  $('bestMenu').textContent = String(best).padStart(7, '0');
  overEl.hidden = false;
  $('againBtn').focus({ preventScroll: true });
}
function togglePause() {
  if (S.mode === 'play' && P.alive) { S.mode = 'pause'; pauseEl.hidden = false; $('resumeBtn').focus({ preventScroll: true }); if (AC) AC.suspend(); }
  else if (S.mode === 'pause') { S.mode = 'play'; pauseEl.hidden = true; if (AC) AC.resume(); last = performance.now(); }
}
function quitToMenu() {
  if ((S.mode === 'pause' || S.mode === 'play') && P.alive) lbRecordRun();
  menuEl.classList.remove('leaving');
  if (S.side) leaveSurface(); S.trans = null; S.heat = S.dark = 0; refreshStageBtn();
  S.mode = 'menu'; pauseEl.hidden = true; overEl.hidden = true; menuEl.hidden = false;
  pauseBtn.hidden = true; misBtn.hidden = true; weaponBtn.hidden = true; $('novaBtn').hidden = true; document.body.classList.remove('in-play');
  clearBeams();
  for (const a of [lasers, missiles, ebul, ships, holes, powers]) a.length = 0;
  S.boss = null; S.events.length = 0; P.alive = false; P.cap = null;
  if (planet) planet.sats = [];
  if (AC) AC.resume();
  measureHero();
  $('startBtn').focus({ preventScroll: true });
}
$('startBtn').addEventListener('click', () => launchFromMenu(1));
const stageBtn = $('stageBtn');
function lastStage() { return Math.max(0, SAVE.get('last') | 0); }
function refreshStageBtn() {
  const h = +((location.hash.match(/^#stage(\d+)$/) || [])[1]) || 0, b = bestStage(), n = h || lastStage() || (b > 1 ? b : 0);
  stageBtn.hidden = n < 2; stageBtn.dataset.st = n; stageBtn.parentElement.classList.toggle('has-cont', n >= 2);
  if (n < 2) return;
  const kind = { space: I18('太空', 'Space'), surface: I18('外星地表', 'Alien surface'), base: I18('敌方基地', 'Enemy base'), final: I18('终焉之星', 'Omega Star') }[stageKind(n)] || '';
  $('contLabel').textContent = I18('继续', 'Continue');
  $('contStage').textContent = stageTag(n) + ' · ' + kind + (n > 10 ? I18(' · 二周目', ' · NG+') : '');
  stageBtn.setAttribute('aria-label', I18('继续：', 'Continue: ') + $('contStage').textContent);
}
stageBtn.addEventListener('click', e => { e.stopPropagation(); launchFromMenu(+stageBtn.dataset.st || 2); });
function launchFromMenu(st) {
  if (S.mode !== 'menu') return;
  S.startStage = typeof st === 'number' ? st : 0; DEV.run = null;
  audioInit(); helpSheet.hidden = true; helpBtn.setAttribute('aria-expanded', 'false');
  if (RM) { startGame(); return; }
  S.mode = 'launch'; S.launchT = 0; menuEl.classList.add('leaving'); sfx.launch();
}
const helpBtn = $('helpBtn'), helpSheet = $('helpSheet');
// desktop (Steam) build only: a way out of the full-screen game without Alt+F4
if (PLATFORM.canQuit) { $('quitBtn').hidden = false; $('quitBtn').addEventListener('click', e => { e.stopPropagation(); SAVE.flush(); PLATFORM.quit(); }); }
{ const sel = $('langSel');
  for (const l of LANGS) { const o = document.createElement('option'); o.value = l; o.lang = l; o.textContent = LANG_NAMES[l]; sel.appendChild(o); }
  sel.value = LANG;
  sel.addEventListener('click', e => e.stopPropagation());
  sel.addEventListener('change', () => { SAVE.set('lang', sel.value); SAVE.flush(); location.hash = '#' + sel.value; location.reload(); }); }
helpBtn.addEventListener('click', e => { e.stopPropagation(); const open = helpSheet.hidden; helpSheet.hidden = !open; helpBtn.setAttribute('aria-expanded', String(open)); });
menuEl.addEventListener('click', e => { if (!helpSheet.hidden && !helpSheet.contains(e.target)) { helpSheet.hidden = true; helpBtn.setAttribute('aria-expanded', 'false'); } });
$('againBtn').addEventListener('click', () => { S.startStage = S.diedStage || 1; startGame(); });
$('resumeBtn').addEventListener('click', togglePause);
$('quitBtn').addEventListener('click', quitToMenu);
pauseBtn.addEventListener('click', togglePause);
misBtn.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); audioInit(); S.misReq = true; });
weaponBtn.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); audioInit(); switchWeapon(); });
$('novaBtn').addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); audioInit(); useNova(); });

