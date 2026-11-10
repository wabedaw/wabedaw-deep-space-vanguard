/* ---------- black hole capture ---------- */
const HOLE_PULL = BAL.world.holePull;
function spiralStep(o, c, dt) {
  c.t += dt;
  const p = clamp(c.t / c.dur, 0, 1), h = c.h;
  const rad = h.r * .12 + (c.rad0 - h.r * .12) * (1 - Math.pow(p, 1.5));
  c.ang += dt * h.spin * (1.6 + 13 * p * p);
  o.x = h.x + Math.cos(c.ang) * rad; o.y = h.y + Math.sin(c.ang) * rad * .82;
  if (parts.length < 1500 && rnd() < .8) parts.push({ k: 'ember', x: o.x + rand(-4, 4), y: o.y + rand(-4, 4), vx: -Math.sin(c.ang) * h.spin * 120, vy: Math.cos(c.ang) * h.spin * 100, life: .5, max: .5, c: pick(['255,190,120', '255,140,70', '160,210,255']), r: rand(1.2, 2.4) });
  return p;
}
function startCapture(h) {
  if (S.dev && S.dev.god) { const i = holes.indexOf(h); if (i >= 0) holes.splice(i, 1); floatText(P.x, P.y - 44, I18('无敌 · 黑洞已清除', 'INVINCIBLE · hole cleared'), '255,140,230', true); return; }
  P.cap = { h, t: 0, dur: 2.8, ang: Math.atan2(P.y - h.y, P.x - h.x), rad0: Math.hypot(P.x - h.x, P.y - h.y) };
  P.inv = 99; S.toast = null; K.fire = false; drag = null;
  sfx.captured(P.cap.dur);
}
function updateCapture(dt) {
  const c = P.cap, ox = P.x;
  const p = spiralStep(P, c, dt);
  P.bank = clamp((P.x - ox) / Math.max(dt, .001) / 420, -1, 1);
  P.evy = 0; shake(2 + p * 8); S.dmgFlash = Math.max(S.dmgFlash, p * .45);
  if (p >= 1) consumed(c.h);
}
function consumed(h) {
  P.cap = null; P.alive = false; P.hull = 0; S.deathBy = 'hole';
  parts.push({ k: 'flash', x: h.x, y: h.y, vx: 0, vy: 0, life: .6, max: .6, r: h.r * 9, c: '255,245,230' });
  waves.push({ x: h.x, y: h.y, r: h.r, max: h.r * 14, life: .9, maxl: .9, c: '255,200,140' });
  waves.push({ x: h.x, y: h.y, r: h.r * 2, max: h.r * 9, life: .7, maxl: .7, c: '140,210,255' });
  sfx.consumed(); shake(18);
  if (anyAlive()) { S.toast = { txt: I18('队友被击落 · 继续战斗', 'Wingmate down · fight on'), t: 2.4 }; return; }
  finishRun(2.2);
}

