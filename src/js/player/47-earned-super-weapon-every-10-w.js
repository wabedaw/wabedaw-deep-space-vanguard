/* ---------- earned super weapon (normal mode): every 10 W = Starbreaker for 10 s; every 10 M = one nova pulse charge ---------- */
const SUPER_T = 10, NOVA_MAX = 3;
function startSuper() {
  if (ultAvail()) return;
  if (P.superT > 0) { P.superT = SUPER_T; return; }
  P.superPrev = P.weapon === 'ult' ? (P.superPrev || 'spread') : P.weapon;
  if (P.beamSnd) { P.beamSnd.stop(); P.beamSnd = null; }
  P.weapon = 'ult'; P.superT = SUPER_T; P.bm = null; P.arcs = []; P.focus = 0; P.focusFull = false; P.beamOn = false;
  S.wflash = Math.max(S.wflash || 0, .3); shake(8); sfx.shieldBreak(); sfx.weaponSwitch();
  waves.push({ x: P.x, y: P.y, r: 20, max: 160, life: .45, maxl: .45, c: ULTC });
  floatText(P.x, P.y - 64, I18('歼星炮启动 · 10 秒', 'STARBREAKER ONLINE · 10 s'), ULTC, true);
  if (TUT.done.superW) S.toast = { txt: I18('集齐 10 个 W · 歼星光柱与追踪光弹全开 10 秒', '10 W collected · star column and homing darts for 10 s'), t: 2.4 };
  tutPush('superW', true);
  updateWeaponBtn();
}
function endSuper() {
  P.superT = 0; P.ultOn = false; P.weapon = P.superPrev || 'spread'; P.superPrev = null; P.lvl = 10;
  sfx.weaponSwitch(); updateWeaponBtn();
  floatText(P.x, P.y - 52, I18('歼星炮冷却 · 武器 MK.X', 'STARBREAKER OFFLINE · WEAPON MK.X'), wcolOf(P.weapon), true);
}
const wcolOf = w => w === 'ult' ? ULTC : w === 'beam' ? BEAMC : ION;
function gainNova() {
  if ((P.novaCh || 0) >= NOVA_MAX) { S.score += 1000; floatText(P.x, P.y - 60, I18('脉冲储备已满 +1000', 'Nova reserve full +1000'), ULTC, true); return; }
  P.novaCh = (P.novaCh || 0) + 1; updateNovaBtn();
  floatText(P.x, P.y - 60, I18('湮星脉冲充能 ×', 'NOVA CHARGED ×') + P.novaCh, ULTC, true);
  if (!TUT.done.superM) tutPush('superM', true); else S.toast = { txt: COARSE ? I18('集齐 10 个 M · 点「脉冲」按钮释放全屏爆炸', '10 M collected · tap NOVA for a screen-wide blast') : I18('集齐 10 个 M · 按 E 释放全屏爆炸', '10 M collected · press E for a screen-wide blast'), t: 2.6 };
}
function useNova() {
  if (S.mode !== 'play' || !P.alive || S.trans) return;
  if (ultAvail()) { ultNova(); return; }
  if ((P.novaCh || 0) <= 0) { sfx.empty(); S.toast = { txt: I18('湮星脉冲未充能 · 每收集 10 个 M 充能一次', 'Nova not charged · every 10 M pickups charge one'), t: 1.8 }; return; }
  if (ultNova()) { P.novaCh--; updateNovaBtn(); }
}
function updateNovaBtn() {
  const b = document.getElementById('novaBtn'); if (!b) return;
  const dev = ultAvail(), show = COARSE && S.mode === 'play' && (dev || (P.novaCh || 0) > 0);
  b.hidden = !show; if (show) b.textContent = I18('脉冲', 'NOVA') + (dev ? '' : '×' + P.novaCh);
}
function drawChargeHud(L, y) {
  if (ultAvail()) return;
  const sup = P.superT > 0; let x = L;
  ctx.font = `700 10px ${FD}`; setLS('1px');
  const pips = (n, col) => { for (let i = 0; i < 10; i++) { ctx.fillStyle = i < n ? `rgba(${col},.95)` : 'rgba(132,148,173,.22)'; ctx.fillRect(x + i * 6, y - 7, 4, 7); } x += 62; };
  ctx.fillStyle = `rgba(${ION},.95)`; ctx.fillText('W', x, y); x += 13;
  if (sup) { ctx.fillStyle = 'rgba(132,148,173,.22)'; ctx.fillRect(x, y - 6, 56, 5); ctx.fillStyle = `rgba(${ULTC},.95)`; ctx.fillRect(x, y - 6, 56 * clamp(P.superT / SUPER_T, 0, 1), 5); x += 62; }
  else pips(P.wCount || 0, ULTC);
  x += 8; ctx.fillStyle = `rgba(${FLARE},.95)`; ctx.fillText('M', x, y); x += 13; pips(P.mCount || 0, FLARE);
  if ((P.novaCh || 0) > 0) { x += 8; ctx.fillStyle = `rgba(${ULTC},${.75 + .25 * Math.sin(S.t * 6)})`; ctx.fillText(I18('脉冲 ×', 'NOVA ×') + P.novaCh + (COARSE ? '' : ' [E]'), x, y); }
  setLS('0px');
}


