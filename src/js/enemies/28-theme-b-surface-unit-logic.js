/* ---------- theme B surface unit logic ---------- */
function updateRail(e, dt, on, K, sp) {
  const mx = e.x - e.hw * .1, my = e.y - e.hh * .55;
  turnTo(e, upAim(mx, my), dt, 1.6);
  e.sight = on && e.fireT < 1.1;
  if (on && e.fireT <= 0) {
    eFire('needle', mx + Math.cos(e.aim) * e.hw, my + Math.sin(e.aim) * e.hw, e.aim, 980 * sp, { r: 4 });
    sparks(mx + Math.cos(e.aim) * e.hw, my + Math.sin(e.aim) * e.hw, 6, ['255,200,120', WHITE], e.aim, .6); shake(2);
    e.fireT = 3.4 / K;
  }
}
function updateWalker(e, dt, on, K, sp, lv) {
  if (e.vx === 0 && !e.stop) e.vx = -26;
  const ahead = e.wx + Math.sign(e.vx || -1) * e.hw;
  if (wetAt(ahead) || Math.abs(groundAt(ahead) - groundAt(e.wx)) > 22) { e.vx = 0; e.stop = true; }
  e.base = groundAt(e.wx) + 3;
  const px = e.x - e.hw * .2, py = e.y - e.hh * .45; turnTo(e, upAim(px, py), dt, 2.5);
  if (on && e.fireT <= 0) {
    const m = e.alt++ % (lv >= 6 ? 3 : 2), tx = px + Math.cos(e.aim) * 26, ty = py + Math.sin(e.aim) * 26;
    if (m === 0) for (let i = 0; i < 3; i++) S.events.push({ t: i * .12, fn: () => { if (!e.dead && P.alive) eFire('orb', tx, ty, e.aim, 260 * sp, { r: 6, c: '255,150,70', silent: i > 0 }); } });
    else if (m === 1) lobShell(tx, ty, P.x, P.y, 260 * sp, 10);
    else for (const s of [-1, 1]) eFire('rocket', tx, ty, e.aim + s * .12, 150 * sp, { acc: 420, max: 540 * sp, silent: s > 0 });
    e.fireT = 2.3 / K;
  }
}
function updateMortar(e, dt, on, K, sp) {
  e.wx -= 8 * dt; turnTo(e, clamp(upAim(e.x, e.y), -Math.PI * .92, -Math.PI * .55), dt, 2.5);
  if (on && e.fireT <= 0) {
    for (let i = 0; i < 2; i++) S.events.push({ t: i * .3, fn: () => { if (!e.dead && P.alive) lobShell(e.x + Math.cos(e.aim) * 14, e.y - e.hh * .5 + Math.sin(e.aim) * 14, P.x + rand(-60, 60), P.y + rand(-40, 40), 300 * sp, 9); } });
    sparks(e.x, e.y - e.hh, 6, FIRE, -Math.PI / 2, .8);
    e.fireT = 3.8 / K;
  }
}

