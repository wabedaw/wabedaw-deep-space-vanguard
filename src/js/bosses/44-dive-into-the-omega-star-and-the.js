/* ---------- dive into the Omega Star, and the ending ---------- */
function updateDive(tr, dt) {
  tr.t += dt; P.inv = Math.max(P.inv, 1); P.alive = true; P.fireCd -= dt; P.muzzle -= dt;
  if (!tr.switched) {
    const om = ships.find(e => e.kind === 'omega');
    tr.hx = om ? om.x + om.gox : W / 2; tr.hy = om ? om.y + om.goy : H * .3; tr.hr = om ? om.gr * 1.2 : 50;
    P.x += (tr.hx - P.x) * Math.min(1, dt * 1.2); P.y += (tr.hy - P.y) * Math.min(1, dt * 1.1); P.bank *= .9; P.evy = -900;
    transExhaust(0, -1, ['255,190,140', '255,255,255'], 2);
    if (tr.t > 1.2) shake(2 + (tr.t - 1.2) * 5);
    if (tr.t >= 2.2) { tr.switched = true; S.sector++; S.sectorT = 0; S.bossPending = false; S.aceTip = false; S.tAce = 6; enterBase(); P.x = W * .1; P.y = H * .5; P.gx = P.gy = 0; S.dark = 0; S.scroll = S.scrollT * 4; }
  } else {
    tr.t2 += dt; P.x += (W * .22 - P.x) * Math.min(1, dt * 2); P.y += (H * .5 - P.y) * Math.min(1, dt * 2); P.evx = 400; transExhaust(1, 0, ['255,190,140', '255,255,255'], 2);
    if (!tr.burst && tr.t2 >= 1.25) { tr.burst = true; S.wflash = Math.max(S.wflash, .6); shake(14); sfx.boom(90, W * .6, 'big'); }
    if (tr.t2 >= 2.1) { S.trans = null; S.banner = { big: stageTag(stageOf(S.sector)), sub: I18('终焉之星 · ', 'OMEGA STAR · ') + sectorName(), t: 0, dur: 3.6 }; S.toast = { txt: I18('高速战壕突围 · 小心激光栅栏与活塞', 'High-speed trench run · watch the pistons and laser fences'), t: 3.6 }; sfx.sector(); }
  }
}
const ENDING_LINES = [
  [2.2, I18('始源之光，已然熄灭', 'The First Light fades')],
  [4.6, I18('新的星辰，在你身后诞生', 'New stars are born in your wake')],
  [7.0, I18('烬翼 · 任务完成', 'ASHWING · MISSION COMPLETE')],
];
function updateEnding(tr, dt) {
  tr.t += dt; P.inv = Math.max(P.inv, 2); P.alive = true; P.fireCd = 1; S.scrollT = 0;
  P.x += (W * .3 - P.x) * Math.min(1, dt); P.y += (H * .5 - P.y) * Math.min(1, dt);
  if (!tr.saved) { tr.saved = true; tr.score = S.score; if (!S.dev) { SAVE.set('cleared', true); award('ACH_FINAL_CLEAR'); } saveStage(stageOf(S.sector) + 1); }
  if (tr.t >= 15) {
    S.trans = null; leaveSurface(); S.sector = stageOf(S.sector) * 10 + 1; S.sectorT = 0; S.bossPending = false; planet = null; planetTimer = 10;
    P.x = W / 2; P.y = H * .78; P.gx = P.gy = 0; P.hull = 100; P.shield = 100; P.mis = P.misMax;
    S.banner = { big: I18('二周目 · NEW GAME+', 'NEW GAME+'), sub: stageTag(stageOf(S.sector)) + ' · ' + sectorName(), t: 0, dur: 4 }; S.wflash = 1; sfx.sector();
  }
}
function drawEnding(tr) {
  const t = tr.t, a = t < 1.2 ? 1 : Math.max(.82, 1 - (t - 1.2) * .2);
  ctx.fillStyle = t < 1.2 ? `rgba(255,252,245,${1 - t * .2})` : `rgba(4,3,10,${a})`; ctx.fillRect(0, 0, W, H);
  if (t > 1) {
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 160; i++) { const x = bhash(i, 11) * W, y = bhash(i, 12) * H, tw = .5 + .5 * Math.sin(t * 2 + i); drawGlow(x, y, 1 + bhash(i, 13) * 1.6, i % 7 ? '255,250,240' : GODC, tw * Math.min(1, (t - 1) / 2)); }
    const k = Math.min(1, (t - 1) / 3); drawGlow(W * .5, H * .42, Math.min(W, H) * .5 * k, GODC, .25 * k); drawGlow(W * .5, H * .42, Math.min(W, H) * .12 * k, '255,255,250', .6 * k);
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.textAlign = 'center';
  ENDING_LINES.forEach(([t0, txt], i) => { const q = clamp((t - t0) / 1.2, 0, 1); if (q <= 0) return; ctx.globalAlpha = q; ctx.fillStyle = i === 2 ? '#ffe2a8' : '#f2ecff'; ctx.font = `${i === 2 ? 800 : 500} ${i === 2 ? (W < 520 ? 17 : 26) : (W < 520 ? 15 : 20)}px ${FD}`; ctx.fillText(txt, W / 2, H * (.36 + i * .1)); });
  if (t > 9) { ctx.globalAlpha = clamp((t - 9) / 1.2, 0, 1); ctx.fillStyle = '#ffb347'; ctx.font = `700 ${W < 520 ? 14 : 18}px ${FD}`; ctx.fillText(I18('最终得分 ', 'FINAL SCORE ') + (tr.score || S.score).toLocaleString(), W / 2, H * .7); }
  if (t > 11.5) { ctx.globalAlpha = clamp((t - 11.5) / 1, 0, 1) * (.6 + .4 * Math.sin(t * 4)); ctx.fillStyle = '#9fe8ff'; ctx.font = `600 ${W < 520 ? 12 : 14}px ${FD}`; ctx.fillText(I18('更强大的舰队正在集结 · 二周目即将开始', 'A stronger armada gathers · NEW GAME+ begins'), W / 2, H * .78); }
  ctx.globalAlpha = 1; ctx.textAlign = 'left';
}

