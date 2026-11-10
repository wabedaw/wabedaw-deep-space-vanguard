/* ---------- first-flight coaching: weapon switch, missiles, black holes, the W/M meters and both super weapons (shown once per device) ---------- */
const TUT = { done: {}, cur: null, queue: [], clock: 0, gap: 0, next: 0, w0: '', fired: false };
TUT.done = SAVE.get('tut');
const tutSave = () => SAVE.set('tut', TUT.done);
const TIPS = {
  weapon: { col: ION, title: I18('切换武器', 'SWITCH WEAPONS'), dur: 9, target: 'weapon', done: () => P.weapon !== TUT.w0,
    text: () => byDevice({ touch: I18('点右下角的武器按钮，在「散射」和「光束」之间切换', 'Tap the weapon button to swap between SPREAD and BEAM'), kb: I18f('按 {0}（或数字键 1 / 2）在散射和光束之间切换', 'Press {0} (or 1 / 2) to swap between SPREAD and BEAM', keyLabel('weapon')), pad: I18('按 X（或 LB）在散射和光束之间切换', 'Press X (or LB) to swap between SPREAD and BEAM') }),
    sub: I18('散射覆盖面广 · 光束集中火力打硬目标', 'Spread covers the screen · Beam focuses on tough targets') },
  missile: { col: FLARE, title: I18('发射追踪飞弹', 'FIRE HOMING MISSILES'), dur: 9, target: 'missile', done: () => TUT.fired,
    text: () => byDevice({ touch: I18('点「飞弹」按钮，飞弹会自动追踪敌人', 'Tap MISSILE — missiles hunt down enemies by themselves'), kb: I18f('按 {0} 或鼠标右键发射追踪飞弹', 'Press {0} or right-click to fire homing missiles', keyLabel('missile')), pad: I18('按 A 发射追踪飞弹', 'Press A to fire homing missiles') }),
    sub: I18('飞弹会随时间自动补充 · 每个 M 补充 4 枚', 'Missiles refill over time · each M adds 4') },
  hole: { col: WARN, title: I18('警告 · 黑洞', 'WARNING · BLACK HOLE'), dur: 7, target: 'hole', done: () => !holes.some(h => h.y > -h.r && h.y < H + h.r),
    text: I18('远离黑洞外围的橙色虚线圈，被吸进事件视界就会坠毁', 'Stay outside the orange dashed ring — cross the horizon and you’re lost'),
    sub: I18('靠近时引力会把你往里拖，提前朝反方向飞', 'Its gravity drags you in · steer away early') },
  meter: { col: ULTC, title: I18('超级武器能量', 'SUPER WEAPON METERS'), dur: 7, target: 'meter',
    text: I18('左下角 W 和 M 各集满 10 格，就能发动超级武器', 'Fill 10 W or 10 M (bottom-left) to unleash a super weapon'),
    sub: I18('W 满：织女光矛 10 秒 · M 满：一次全屏爆炸', 'W full: VEGA LANCE for 10 s · M full: one screen-wide blast') },
  superW: { col: ULTC, title: I18('织女光矛已启动！', 'VEGA LANCE ONLINE!'), dur: 6, target: 'meter',
    text: I18('集满 10 个 W：光柱和追踪光弹自动开火 10 秒', '10 W collected: star column and homing darts fire for 10 s'),
    sub: I18('结束后武器恢复为 MK.X 满级', 'Your weapon comes back at MK.X afterwards') },
  superM: { col: ULTC, title: I18('全屏爆炸可以发动了！', 'NOVA PULSE READY!'), dur: 10, target: 'nova', done: () => (P.novaCh || 0) === 0,
    text: () => byDevice({ touch: I18('点「脉冲」按钮，立即释放全屏爆炸', 'Tap NOVA to unleash a screen-wide blast'), kb: I18f('按 {0} 立即释放全屏爆炸', 'Press {0} to unleash a screen-wide blast', keyLabel('nova')), pad: I18('按 Y（或 RB）立即释放全屏爆炸', 'Press Y (or RB) to unleash a screen-wide blast') }),
    sub: I18('清空敌方子弹并重创所有敌人 · 最多储存 3 次', 'Clears enemy fire and hits every enemy · stores up to 3') },
};
const tutOn = () => S.mode === 'play' && !S.dev && P.alive;
function tutPush(id, urgent) {
  if (TUT.done[id] || S.dev || (TUT.cur && TUT.cur.id === id)) return;
  TUT.queue = TUT.queue.filter(q => q !== id);
  if (urgent) { if (TUT.cur) TUT.queue.unshift(TUT.cur.id); TUT.cur = null; TUT.gap = 0; TUT.queue.unshift(id); }
  else TUT.queue.push(id);
}
function tutReset() { TUT.cur = null; TUT.queue = []; TUT.clock = 0; TUT.gap = 0; TUT.next = 0; }
function updateTut(dt) {
  if (!tutOn() || S.trans) return;
  TUT.clock += dt; TUT.gap -= dt;
  if (!TUT.done.weapon && TUT.clock > 5 && !S.boss && !S.bossPending) tutPush('weapon');
  if (!TUT.done.missile && TUT.done.weapon && TUT.clock > TUT.next) tutPush('missile');
  if (!TUT.done.hole && !P.cap && holes.some(h => h.y > h.r && h.y < H * .75 && h.x > 0 && h.x < W)) tutPush('hole', true);
  if (!TUT.cur && TUT.queue.length && TUT.gap <= 0) {
    const id = TUT.queue.shift(); TUT.cur = { id, t: 0, ok: 0 };
    if (id === 'weapon') TUT.w0 = P.weapon; if (id === 'missile') TUT.fired = false;
    sfx.lanceWarn && id === 'hole' ? sfx.lanceWarn() : sfx.power();
  }
  const c = TUT.cur; if (!c) return;
  const d = TIPS[c.id]; c.t += dt;
  if (d.done && c.t > .6 && (c.ok > 0 || d.done())) c.ok += dt;
  if (c.ok > 1.1 || c.t > d.dur) { TUT.done[c.id] = 1; tutSave(); TUT.cur = null; TUT.gap = 1.4; if (c.id === 'weapon') TUT.next = TUT.clock + 2.5; }
}
function tutWrap(txt, maxW) {
  const toks = CJK ? Array.from(txt) : txt.split(/(\s+)/), lines = []; let cur = '';
  for (const t of toks) { const nx = cur + t; if (cur && ctx.measureText(nx).width > maxW) { lines.push(cur.trim()); cur = t.trimStart(); } else cur = nx; }
  if (cur.trim()) lines.push(cur.trim()); return lines;
}
function tutTarget(kind, L, B) {
  const btn = id => { const el = document.getElementById(id); if (!el || el.hidden) return null; const r = el.getBoundingClientRect(); if (!r.width) return null; const f = toField(r.left + r.width / 2, r.top + r.height / 2); return { x: f.x, y: f.y, r: (r.width / 2 + 8) / VIEW.s }; };
  if (kind === 'weapon') return (COARSE && btn('weaponBtn')) || { x: L + 70, y: B - 96, r: 30 };
  if (kind === 'missile') return (COARSE && btn('missileBtn')) || { x: L + 74, y: B - 2, r: 30 };
  if (kind === 'nova') return (COARSE && btn('novaBtn')) || { x: L + 190, y: B - 124, r: 30 };
  if (kind === 'meter') return { x: L + 75, y: B - 124, r: 34 };
  if (kind === 'hole') { const h = holes.find(h => h.y > -h.r && h.y < H + h.r); return h ? { x: h.x, y: h.y, r: h.cap * 1.05, hole: true } : null; }
  return null;
}
function drawTut(L, B) {
  const c = TUT.cur; if (!c || S.mode !== 'play' || S.trans || !P.alive) return;
  const d = TIPS[c.id], a = clamp(c.t / .3, 0, 1) * clamp((d.dur - c.t) / .4, 0, 1) * (c.ok > 0 ? clamp((1.1 - c.ok) / .35, 0, 1) : 1);
  if (a <= 0) return;
  const cw = Math.min(480, W - 32), x0 = (W - cw) / 2, pad = 16, narrow = W < 420;
  ctx.save(); ctx.globalAlpha = a; ctx.textBaseline = 'alphabetic';
  ctx.font = `600 ${narrow ? 14 : 15.5}px ${FD}`; const lines = tutWrap(typeof d.text === 'function' ? d.text() : d.text, cw - pad * 2 - 4);
  ctx.font = `500 ${narrow ? 11.5 : 12.5}px ${FD}`; const subs = tutWrap(d.sub, cw - pad * 2 - 4);
  const lh = narrow ? 20 : 22, ch = pad + 16 + 10 + lines.length * lh + 6 + subs.length * 17 + pad + 4;
  const tg = tutTarget(d.target, L, B);
  const y0 = S.side ? Math.min(H * .56, H - ch - 150) : tg && tg.y < H * .45 ? Math.min(H * .5, H - ch - 170) : H * .2;
  // target highlight + leader line
  if (tg) {
    const pr = tg.r + 5 * Math.sin(S.t * 6);
    ctx.strokeStyle = `rgba(${d.col},.9)`; ctx.lineWidth = 2; ctx.setLineDash(tg.hole ? [8, 7] : []);
    ctx.beginPath(); ctx.arc(tg.x, tg.y, Math.max(8, pr), 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    ctx.globalCompositeOperation = 'lighter'; drawGlow(tg.x, tg.y, tg.r * 1.4, d.col, .25 + .15 * Math.sin(S.t * 6)); ctx.globalCompositeOperation = 'source-over';
    const sx = clamp(tg.x, x0 + 20, x0 + cw - 20), sy = tg.y > y0 + ch / 2 ? y0 + ch : y0, dx = tg.x - sx, dy = tg.y - sy, dl = Math.hypot(dx, dy) || 1, ex = tg.x - dx / dl * (tg.r + 8), ey = tg.y - dy / dl * (tg.r + 8);
    if (dl > tg.r + 30) { ctx.strokeStyle = `rgba(${d.col},.55)`; ctx.lineWidth = 1.5; ctx.setLineDash([5, 6]); ctx.lineDashOffset = -S.t * 30; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0;
      const an = Math.atan2(dy, dx); ctx.fillStyle = `rgba(${d.col},.9)`; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - Math.cos(an - .45) * 11, ey - Math.sin(an - .45) * 11); ctx.lineTo(ex - Math.cos(an + .45) * 11, ey - Math.sin(an + .45) * 11); ctx.closePath(); ctx.fill(); }
  }
  // card
  ctx.fillStyle = 'rgba(5,9,18,.86)'; ctx.fillRect(x0, y0, cw, ch);
  ctx.strokeStyle = `rgba(${d.col},.35)`; ctx.lineWidth = 1; ctx.strokeRect(x0 + .5, y0 + .5, cw - 1, ch - 1);
  ctx.fillStyle = `rgb(${d.col})`; ctx.fillRect(x0, y0, 3, ch);
  let y = y0 + pad + 11;
  ctx.font = `600 10.5px ${FD}`; setLS('2px'); ctx.fillStyle = `rgba(${d.col},.95)`;
  const tag = I18('飞行指引', 'FLIGHT GUIDE'); ctx.fillText(tag, x0 + pad + 4, y); const tw = ctx.measureText(tag).width; setLS('0px');
  ctx.font = `700 ${narrow ? 14 : 15}px ${FD}`; ctx.fillStyle = '#ffffff'; ctx.fillText(d.title, x0 + pad + 4 + tw + 12, y + 1);
  if (c.ok > 0) { ctx.textAlign = 'right'; ctx.font = `700 12px ${FD}`; ctx.fillStyle = 'rgb(140,255,170)'; ctx.fillText(I18('✓ 完成', '✓ DONE'), x0 + cw - pad, y); ctx.textAlign = 'left'; }
  y += 10 + lh - 4;
  ctx.font = `600 ${narrow ? 14 : 15.5}px ${FD}`; ctx.fillStyle = '#eef6fb';
  for (const ln of lines) { ctx.fillText(ln, x0 + pad + 4, y); y += lh; }
  y += 2; ctx.font = `500 ${narrow ? 11.5 : 12.5}px ${FD}`; ctx.fillStyle = 'rgba(185,198,216,.95)';
  for (const ln of subs) { ctx.fillText(ln, x0 + pad + 4, y); y += 17; }
  const f = clamp(1 - c.t / d.dur, 0, 1); ctx.fillStyle = 'rgba(132,148,173,.2)'; ctx.fillRect(x0 + 3, y0 + ch - 2, cw - 3, 2); ctx.fillStyle = `rgba(${d.col},.8)`; ctx.fillRect(x0 + 3, y0 + ch - 2, (cw - 3) * f, 2);
  ctx.restore();
}

