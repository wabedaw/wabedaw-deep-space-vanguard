/* ---------- adaptive flight speed: kill fast and the flight speeds up; kill slowly and it eases back to the base pace ---------- */
const FLOW_MAX = BAL.world.flowMax, FLOW_H = BAL.world.flowHalfLife;
const flowLive = () => S.mode === 'play' && !S.boss && !S.bossPending && !S.trans && P.alive;
function flowKill(e) {
  if (e.type === 'boss' || e.escort || !flowLive()) return;
  const age = e.seen !== undefined ? S.t - e.seen : 0, big = (e.r || 0) >= 35 || (e.hw || 0) > 40;
  S.mom = Math.min(FLOW_H * 1.25, (S.mom || 0) + (age < 1.5 ? 1 : age < 3 ? .75 : age < 6 ? .45 : .25) * (big ? 1.6 : 1));
}
function flowEscape(e) {
  if (e.type === 'boss' || e.escort || !flowLive()) return;
  S.mom = Math.max(0, (S.mom || 0) - (e.ground || e.att ? .35 : .8));
}
function updateFlow(dt) {
  if (S.mode !== 'play') return;
  if (!S.dev) { const st = stageOf(S.sector); if (st !== updateFlow.st) { updateFlow.st = st; SAVE.set('last', st); } }
  if (S.dev) devTick();
  for (const e of ships) if (e.seen === undefined && (S.side ? e.x < W - 10 : e.y > 10)) e.seen = S.t;
  if (flowLive()) S.mom = Math.max(0, (S.mom || 0) - dt * .25);
  const q = clamp((S.mom || 0) / FLOW_H, 0, 1), tgt = 1 + (FLOW_MAX - 1) * q * q * (3 - 2 * q);
  if (!S.boss && !S.bossPending) S.flow = Math.max(1, (S.flow || 1) + (tgt - (S.flow || 1)) * Math.min(1, dt * .5));
  const f = S.flow, tier = f > 1.55 ? 3 : f > 1.3 ? 2 : f > 1.1 ? 1 : 0;
  if (tier > (S.flowTier || 0) && flowLive()) { floatText(P.x, P.y - 48, ['', I18('加速 ▲', 'SPEED UP ▲'), I18('高速 ▲▲', 'HIGH SPEED ▲▲'), I18('极速 ▲▲▲', 'MAX SPEED ▲▲▲')][tier], '120,235,255', true); sfx.whoosh(P.x); }
  if (tier < (S.flowTier || 0) - 0 && f < [1, 1.06, 1.24, 1.48][S.flowTier || 0]) S.flowTier = tier; else if (tier > (S.flowTier || 0)) S.flowTier = tier;
}
function drawFlowHud(L, y) {
  const f = S.flow || 1, q = clamp((f - 1) / (FLOW_MAX - 1), 0, 1), col = q > .8 ? '255,200,90' : q > .05 ? '120,235,255' : '132,148,173';
  ctx.font = `600 10.5px ${FD}`; setLS('1.5px'); ctx.fillStyle = `rgba(${col},.95)`;
  const label = I18('航速 ×', 'SPEED ×') + f.toFixed(2); ctx.fillText(label, L, y);
  const lw = ctx.measureText(label).width; setLS('0px');
  ctx.fillStyle = 'rgba(132,148,173,.25)'; ctx.fillRect(L + lw + 8, y - 5, 60, 3);
  ctx.fillStyle = `rgba(${col},.95)`; ctx.fillRect(L + lw + 8, y - 5, 60 * q, 3);
  const m = clamp((S.mom || 0) / FLOW_H, 0, 1); ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(L + lw + 8 + 60 * m - 1, y - 7, 2, 7);
}


