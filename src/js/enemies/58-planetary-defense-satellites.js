/* ---------- planetary defense satellites ---------- */
const SAT_RANGE = 300;
function addSats(pl) {
  const n = Math.min(5, 2 + Math.floor((S.sector - 1) / 2) + (rnd() < .5 ? 1 : 0));
  const a = pl.r * rand(1.7, 2.05);
  pl.satW = rand(.22, .32) * (rnd() < .5 ? 1 : -1);
  pl.sats = [];
  for (let i = 0; i < n; i++) pl.sats.push({ r: 10, ang: i / n * TAU + rand(-.25, .25), a, b: a * .34, hp: 4 + S.sector, maxhp: 4 + S.sector, fireT: rand(1.2, 2.4), hitT: 0, x: 0, y: 0, front: true, hidden: false, locked: false, aim: Math.PI / 2, alt: 0, blink: rand(0, 1), dead: false });
}
function satPos(pl, s) {
  const cx = pl.x - (S.mode === 'play' ? (P.x - W / 2) * .03 : 0), cy = pl.y;
  const ct = Math.cos(pl.tilt), st = Math.sin(pl.tilt), ox = Math.cos(s.ang) * s.a, oy = Math.sin(s.ang) * s.b;
  s.x = cx + ox * ct - oy * st; s.y = cy + ox * st + oy * ct;
  s.front = Math.sin(s.ang) > 0;
  s.hidden = !s.front && Math.hypot(s.x - cx, s.y - cy) < pl.r * 1.02;
}
function updateSats(dt) {
  if (!planet || !planet.sats || !planet.sats.length) return;
  const spK = Math.min(1.45, Math.sqrt(diff()));
  for (const s of planet.sats) {
    if (s.dead) continue;
    s.ang += planet.satW * dt; s.hitT -= dt; s.blink += dt; satPos(planet, s); aimAt(s);
    s.locked = false;
    if (S.mode !== 'play' || !P.alive || P.cap || S.boss || s.hidden || s.y < 10 || s.y > H - 10 || s.x < 0 || s.x > W) continue;
    const d = Math.hypot(P.x - s.x, P.y - s.y);
    if (d > SAT_RANGE) { s.fireT = Math.max(s.fireT, .7); continue; }
    s.locked = true; s.aim = aimAng(s.x, s.y); s.fireT -= dt;
    if (s.fireT <= 0) {
      if (s.alt++ % 2 === 0) for (const o of [-.06, .06]) eFire('needle', s.x, s.y, s.aim + o, 380 * spK, { silent: o > 0, c: '255,110,90' });
      else for (const o of [-.22, 0, .22]) eFire('orb', s.x, s.y, s.aim + o, 220 * spK, { c: '255,110,90', silent: o !== 0 });
      s.fireT = rand(1.3, 1.9) / Math.sqrt(diff());
    }
  }
  usePlayer(PLAYERS[0]);
}
function liveSats() { return planet && planet.sats ? planet.sats.filter(s => !s.dead && !s.hidden && s.y > 0 && s.y < H) : []; }
function damageSat(s, dmg, x, y) {
  s.hp -= dmg; s.hitT = .08; sparks(x, y, 3, ['255,255,255', FLARE], Math.PI / 2, 2.2); sfx.hit(x, true);
  if (s.hp <= 0 && !s.dead) {
    s.dead = true; S.kills++;
    explode(s.x, s.y, 26, FIRE, { debris: '200,180,120' }); sfx.boom(26, s.x, 'ship');
    addScore(180, s.x, s.y);
    if (rnd() < .18) dropPower(s.x, s.y);
  }
}

