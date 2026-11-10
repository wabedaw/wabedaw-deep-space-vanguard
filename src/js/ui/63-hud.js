/* ---------- HUD ---------- */
const FD = '"Chakra Petch","Noto Sans SC",sans-serif';
function setLS(v) { if ('letterSpacing' in ctx) ctx.letterSpacing = v; }
function segBar(x, y, w, f, col, label, val) {
  const n = 20, gap = 2, sw = (w - gap * (n - 1)) / n;
  ctx.font = `600 10.5px ${FD}`; setLS('1.5px'); ctx.fillStyle = 'rgba(132,148,173,.95)'; ctx.textBaseline = 'alphabetic';
  ctx.fillText(label, x, y - 6);
  ctx.textAlign = 'right'; ctx.fillStyle = `rgb(${col})`; ctx.fillText(val, x + w, y - 6); ctx.textAlign = 'left'; setLS('0px');
  for (let i = 0; i < n; i++) {
    const seg = clamp(f * n - i, 0, 1);
    ctx.fillStyle = 'rgba(132,148,173,.16)'; ctx.fillRect(x + i * (sw + gap), y, sw, 6);
    if (seg > 0) { ctx.fillStyle = `rgba(${col},${.35 + seg * .65})`; ctx.fillRect(x + i * (sw + gap), y, sw * seg, 6); }
  }
}
function drawHUD() {
  const L = inset.l + 16, T = inset.t + 16, R = W - inset.r - 16, B = H - inset.b - 16;
  ctx.textBaseline = 'alphabetic';
  if (S.mode === 'play' || S.mode === 'over') {
    // score
    ctx.font = `600 10.5px ${FD}`; setLS('2px'); ctx.fillStyle = 'rgba(132,148,173,.95)';
    ctx.fillText(I18('得分 SCORE', 'SCORE'), L, T + 10);
    setLS('1px'); ctx.font = `700 ${W < 420 ? 24 : 30}px ${FD}`; ctx.fillStyle = '#eef6fb';
    const sc = String(S.score).padStart(7, '0');
    ctx.fillText(sc, L, T + (W < 420 ? 36 : 42));
    const sw = ctx.measureText(sc).width;
    setLS('0px');
    if (mult() > 1) {
      ctx.font = `700 14px ${FD}`; ctx.fillStyle = `rgb(${FLARE})`;
      ctx.fillText(I18('连击 ×', 'COMBO ×') + mult(), L + sw + 12, T + (W < 420 ? 34 : 40));
      ctx.fillStyle = `rgba(${FLARE},.8)`; ctx.fillRect(L + sw + 12, T + (W < 420 ? 39 : 45), 48 * clamp(S.comboT / 2.4, 0, 1), 2);
    }
    ctx.font = `500 12px ${FD}`; ctx.fillStyle = 'rgba(190,204,222,.9)';
    ctx.fillText(sectorTag() + ' · ' + sectorName(), L, T + (W < 420 ? 56 : 64));
    if (S.mode === 'play') drawFlowHud(L, T + (W < 420 ? 73 : 83));
    if (S.dev && S.mode !== 'menu') drawDevHud(L, T + (W < 420 ? 89 : 100));

    // top right
    const narrow = W < 520, RX = narrow ? R : R - 100, RY = narrow ? T + 62 : T;
    ctx.textAlign = 'right';
    ctx.font = `600 10.5px ${FD}`; setLS('2px'); ctx.fillStyle = 'rgba(132,148,173,.95)';
    ctx.fillText(I18('最高 ', 'BEST ') + String(Math.max(best, S.score)).padStart(7, '0'), RX, RY + 10);
    ctx.fillText(I18('航程 ', 'RANGE ') + S.dist.toFixed(2) + ' AU', RX, RY + 26);
    ctx.fillStyle = S.auto ? `rgba(${ION},.9)` : 'rgba(132,148,173,.8)';
    if (!narrow) ctx.fillText(S.auto ? I18('自动射击', 'AUTO FIRE') : I18('手动射击', 'MANUAL FIRE'), RX, RY + 42);
    setLS('0px'); ctx.textAlign = 'left';

    // bottom-left gauges
    const bw = Math.min(230, W * .46);
    const hullCol = P.hull > 55 ? '219,229,240' : P.hull > 25 ? FLARE : WARN;
    segBar(L, B - 62, bw, P.shield / 100, ION, I18('护盾', 'SHIELD'), Math.round(P.shield) + '%');
    segBar(L, B - 30, bw, Math.max(0, P.hull) / 100, hullCol, I18('舰体', 'HULL'), Math.max(0, Math.round(P.hull)) + '%');
    // missiles
    ctx.font = `600 10.5px ${FD}`; setLS('1.5px'); ctx.fillStyle = 'rgba(132,148,173,.95)';
    ctx.fillText(I18('飞弹', 'MSL'), L, B + 2); setLS('0px');
    for (let i = 0; i < P.misMax; i++) {
      const x = L + 34 + i * 10, y = B - 2;
      ctx.fillStyle = i < P.mis ? `rgb(${FLARE})` : 'rgba(132,148,173,.22)';
      ctx.beginPath(); ctx.moveTo(x, y - 5); ctx.lineTo(x + 3.5, y); ctx.lineTo(x, y + 5); ctx.lineTo(x - 3.5, y); ctx.closePath(); ctx.fill();
    }
    const wcol = P.weapon === 'ult' ? ULTC : P.weapon === 'beam' ? BEAMC : ION, wl = weaponName() + (P.weapon === 'ult' ? '' : ' MK.' + ROMAN[P.lvl - 1]) + weaponPerk();
    ctx.font = `600 10.5px ${FD}`; ctx.fillStyle = `rgba(${wcol},.95)`; ctx.textAlign = 'left'; setLS('1.5px');
    ctx.fillText(wl, L, B - 92); const tw = ctx.measureText(wl).width; setLS('0px');
    for (let i = 0; i < 10; i++) { ctx.fillStyle = i < P.lvl ? `rgba(${wcol},${i >= 7 ? 1 : .75})` : 'rgba(132,148,173,.22)'; ctx.fillRect(L + tw + 10 + i * 7, B - 100, 5, i >= 7 ? 9 : 7); }
    drawChargeHud(L, B - 120);
    if (P.weapon === 'ult' && P.superT > 0) { const f = clamp(P.superT / SUPER_T, 0, 1); ctx.fillStyle = 'rgba(132,148,173,.22)'; ctx.fillRect(L + tw + 10, B - 88, 68, 2); ctx.fillStyle = `rgba(${ULTC},.95)`; ctx.fillRect(L + tw + 10, B - 88, 68 * f, 2); }
    else if (P.weapon === 'ult') { const f = 1 - clamp((S.ultCd || 0) / ULT_NOVA_CD, 0, 1); ctx.fillStyle = 'rgba(132,148,173,.22)'; ctx.fillRect(L + tw + 10, B - 88, 68, 2); ctx.fillStyle = f >= 1 ? 'rgba(255,255,255,.95)' : `rgba(${ULTC},.9)`; ctx.fillRect(L + tw + 10, B - 88, 68 * f, 2); ctx.font = `600 9.5px ${FD}`; ctx.fillStyle = f >= 1 ? `rgba(${ULTC},.95)` : 'rgba(132,148,173,.8)'; ctx.fillText(f >= 1 ? I18('脉冲就绪', 'NOVA READY') : I18('脉冲充能', 'NOVA CHARGING'), L + tw + 84, B - 85); }
    if (P.weapon === 'beam') { const f = P.focus || 0; ctx.fillStyle = 'rgba(132,148,173,.22)'; ctx.fillRect(L + tw + 10, B - 88, 68, 2); ctx.fillStyle = f >= 1 ? 'rgba(255,255,255,.95)' : `rgba(${BEAMC},.9)`; ctx.fillRect(L + tw + 10, B - 88, 68 * f, 2); if (f >= 1) drawGlow(L + tw + 78, B - 87, 7, BEAMC, .8); }

    // boss bar
    if (S.boss && S.boss.entered !== undefined) {
      const B = S.boss, bwid = Math.min(460, W - 32 - inset.l - inset.r), bx = (W - bwid) / 2, by = T + (W < 520 ? 110 : 84), C = B.kind === 'omega' ? OMEGA_C : B.kind === 'god' ? GODC : B.theme === 3 ? (B.kind === 'core' && B.shp <= 0 ? ICE2 : ICE) : B.cryoB ? ICE : B.theme === 2 ? (B.kind === 'colossus' ? '255,130,60' : B.kind === 'core' && B.shp <= 0 ? '255,120,170' : HIVE) : B.hiveB ? (B.kind === 'medusa' ? HIVE2 : HIVE) : B.sideBoss ? MINI_COL[B.kind] : B.gate ? GATE_COL[B.gate] : B.kind === 'core' ? (B.shp > 0 ? '120,220,255' : '255,140,90') : B.kind === 'fortress' ? '120,200,255' : B.kind === 'colossus' ? '255,170,90' : B.kind === 'hydra' ? FLARE : B.kind === 'leviathan' ? '150,255,200' : PLASMA;
      const ringF = ((B.kind === 'fortress' || B.kind === 'colossus' || !!B.gate) && B.phase === 1) || ((B.kind === 'omega' || B.kind === 'god') && B.parts.some(p => !p.dead)), alive = B.parts.filter(p => !p.dead).length, coreSh = B.kind === 'core' && B.shp > 0;
      const frac = ringF ? B.parts.reduce((a, p) => a + (p.dead ? 0 : Math.max(0, p.hp)), 0) / B.parts.reduce((a, p) => a + p.maxhp, 0) : coreSh ? B.shp / B.smax : B.hp / B.maxhp;
      ctx.font = `700 11px ${FD}`; setLS(W < 520 ? '1.5px' : '3px'); ctx.fillStyle = `rgb(${C})`; ctx.textAlign = 'left';
      ctx.fillText(bossLabel(B.label || B.kind, B.n), bx, by - 6);
      ctx.textAlign = 'right'; ctx.fillStyle = B.phase === 3 ? `rgb(${WARN})` : 'rgba(219,229,240,.85)';
      ctx.fillText(ringF ? (B.kind === 'omega' ? [I18('星环炮台 ', 'RING GUNS '), I18('护盾塔 ', 'PYLONS '), I18('门锁 ', 'LOCKS ')][B.stage - 1] : B.kind === 'god' ? I18('光翼 ', 'WINGS ') : I18('模块 ', 'MODULES ')) + alive + '/' + B.parts.length : coreSh ? I18('能量护盾 ', 'SHIELD ') + Math.ceil(B.shp / B.smax * 100) + '%' : I18('阶段 ', 'PHASE ') + ROMAN[B.phase - 1], bx + bwid, by - 6); setLS('0px'); ctx.textAlign = 'left';
      ctx.fillStyle = `rgba(${C},.15)`; ctx.fillRect(bx, by, bwid, 5);
      ctx.fillStyle = `rgb(${B.phase === 3 ? WARN : C})`; ctx.fillRect(bx, by, bwid * clamp(frac, 0, 1), 5);
      for (let i = 1; i < 10; i++) { ctx.fillStyle = 'rgba(3,5,11,.8)'; ctx.fillRect(bx + bwid * i / 10 - .5, by, 1, 5); }
      if (B.kind === 'core') { if (!coreSh) { ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillRect(bx + bwid * .45 - 1, by - 3, 2, 11); } }
      else if (B.kind !== 'fortress' && B.kind !== 'colossus' && !B.gate) for (const f of [1 / 3, 2 / 3]) { ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillRect(bx + bwid * f - 1, by - 3, 2, 11); }
    }
    // gravity meter
    if (P.alive && !P.cap && S.holeNear > .02 && !S.boss) {
      const n = S.holeNear, mw = Math.min(300, W - 32 - inset.l - inset.r), mx = (W - mw) / 2, my = T + (W < 520 ? 110 : 84);
      const col = n > .7 ? WARN : FLARE, fl = n > .7 ? .55 + .45 * Math.sin(S.t * 18) : 1;
      ctx.font = `700 11px ${FD}`; setLS('2px'); ctx.textAlign = 'left'; ctx.fillStyle = `rgba(${col},${fl})`;
      ctx.fillText(n > .7 ? I18('接近不可逃逸线', 'NEAR THE NO-RETURN LINE') : I18('引力牵引', 'GRAVITY PULL'), mx, my - 6);
      ctx.textAlign = 'right'; ctx.fillText(Math.round(n * 100) + '%', mx + mw, my - 6); setLS('0px'); ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(255,179,71,.15)'; ctx.fillRect(mx, my, mw, 5);
      ctx.fillStyle = `rgba(${col},${fl})`; ctx.fillRect(mx, my, mw * n, 5);
      ctx.fillStyle = `rgb(${WARN})`; ctx.fillRect(mx + mw - 2, my - 3, 2, 11);
    }
  }
  // banner
  if (S.banner) {
    const bn = S.banner, t = bn.t, a = Math.min(1, t * 3, (bn.dur - t) * 2.5);
    const y = H * .34, lw = Math.min(W * .4, 220) * Math.min(1, t * 2);
    ctx.globalAlpha = a; ctx.textAlign = 'center';
    ctx.strokeStyle = `rgba(${ION},.6)`; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W / 2 - lw, y - 34); ctx.lineTo(W / 2 + lw, y - 34); ctx.moveTo(W / 2 - lw, y + 34); ctx.lineTo(W / 2 + lw, y + 34); ctx.stroke();
    ctx.font = `700 ${W < 420 ? 34 : 44}px ${FD}`; setLS('6px'); ctx.fillStyle = '#eef6fb'; ctx.fillText(bn.big, W / 2, y + 6);
    ctx.font = `500 14px ${FD}`; setLS('4px'); ctx.fillStyle = `rgb(${ION})`; ctx.fillText(bn.sub, W / 2, y + 28);
    setLS('0px'); ctx.textAlign = 'left'; ctx.globalAlpha = 1;
  }
  // boss warning
  if (S.warn > 0 && ((S.t * 4) | 0) % 2 === 0) {
    const y = H * .46;
    ctx.fillStyle = 'rgba(255,90,79,.14)'; ctx.fillRect(0, y - 30, W, 60);
    ctx.fillStyle = 'rgba(255,90,79,.8)'; ctx.fillRect(0, y - 30, W, 1.5); ctx.fillRect(0, y + 28.5, W, 1.5);
    ctx.font = `700 ${W < 420 ? 17 : 22}px ${FD}`; setLS('5px'); ctx.textAlign = 'center'; ctx.fillStyle = '#ffd9d6';
    ctx.fillText((ZH ? '警告 · 大型敌舰接近' : W < 520 ? 'MOTHERSHIP INBOUND' : 'WARNING · MOTHERSHIP INBOUND'), W / 2, y + 2); setLS('2px');
    ctx.font = `600 12px ${FD}`; ctx.fillStyle = `rgb(${WARN})`; ctx.fillText(S.warnName || '', W / 2, y + 21); setLS('0px'); ctx.textAlign = 'left';
  }
  if (P.cap && S.mode === 'play') {
    const fl = ((S.t * 5) | 0) % 2 === 0, y = H * .7;
    ctx.textAlign = 'center';
    ctx.font = `700 ${W < 420 ? 20 : 26}px ${FD}`; setLS('4px'); ctx.fillStyle = fl ? '#ffd9d6' : `rgb(${WARN})`;
    ctx.fillText(I18('已越过不可逃逸线', 'PAST THE POINT OF NO RETURN'), W / 2, y);
    ctx.font = `600 13px ${FD}`; setLS('3px'); ctx.fillStyle = `rgba(${FLARE},.9)`;
    ctx.fillText(I18('引擎失效 · 无法逃脱', 'ENGINES OVERWHELMED · NO ESCAPE'), W / 2, y + 26); setLS('0px'); ctx.textAlign = 'left';
  }
  if (S.toast && S.mode === 'play') {
    const a = Math.min(1, S.toast.t * 3);
    ctx.globalAlpha = a; ctx.font = `600 13px ${FD}`; setLS('2px'); ctx.textAlign = 'center';
    for (let fs = 12; ctx.measureText(S.toast.txt).width > W - 40 && fs >= 9; fs--) { ctx.font = `600 ${fs}px ${FD}`; setLS('0.5px'); }
    ctx.fillStyle = `rgb(${FLARE})`; ctx.fillText(S.toast.txt, W / 2, S.side ? H * .2 + 40 : H * .6);
    setLS('0px'); ctx.textAlign = 'left'; ctx.globalAlpha = 1;
  }
  drawTut(L, B);
}

