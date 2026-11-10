/* ---------- effects ---------- */
function shake(v) { if (!RM) S.shake = Math.max(S.shake, v); }
function explode(x, y, size, pal = FIRE, opts = {}) {
  const n = Math.min(70, 10 + size * 1.1) | 0;
  const room = parts.length < 1500;
  parts.push({ k: 'flash', x, y, vx: 0, vy: 0, life: .2 + size * .004, max: .2 + size * .004, r: size * 2.8, c: pal[3] || pal[0] });
  for (let i = 0; i < n; i++) {
    const a = rand(0, TAU), sp = rand(60, 220 + size * 5);
    parts.push({ k: 'spark', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: rand(.25, .7), max: .7, c: pick(pal), w: rand(1, 2.2) });
  }
  if (room) for (let i = 0; i < n / 2; i++) {
    const a = rand(0, TAU), sp = rand(20, 120 + size * 2);
    parts.push({ k: 'ember', x: x + rand(-size, size) * .3, y: y + rand(-size, size) * .3, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: rand(.5, 1.3), max: 1.3, c: pick(pal), r: rand(2, 4 + size * .05) });
  }
  if (room) for (let i = 0; i < n / 3; i++) {
    const a = rand(0, TAU), sp = rand(10, 50);
    parts.push({ k: 'smoke', x: x + rand(-size, size) * .4, y: y + rand(-size, size) * .4, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp + 30, life: rand(.8, 1.7), max: 1.7, r: rand(size * .25, size * .6), g: rand(15, 45), c: opts.smoke || '38,40,50' });
  }
  if (opts.debris) for (let i = 0; i < Math.min(18, size / 2); i++) {
    const a = rand(0, TAU), sp = rand(40, 200);
    parts.push({ k: 'debris', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: rand(.7, 1.6), max: 1.6, s: rand(2, 2 + size * .08), rot: rand(0, TAU), vr: rand(-8, 8), c: opts.debris });
  }
  waves.push({ x, y, r: size * .3, max: size * 3.2, life: .5, maxl: .5, c: pal[0] });
  shake(Math.min(18, size * .16));
}
function sparks(x, y, n, pal, dir = -Math.PI / 2, spread = Math.PI) {
  for (let i = 0; i < n; i++) {
    const a = dir + rand(-spread, spread) / 2, sp = rand(80, 260);
    parts.push({ k: 'spark', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: rand(.12, .32), max: .32, c: pick(pal), w: 1.2 });
  }
}
function floatText(x, y, txt, c = WHITE, big = false) { texts.push({ x, y, txt, c, life: big ? 1.4 : .9, max: big ? 1.4 : .9, big }); }
function addScore(base, x, y) {
  S.combo++; S.comboT = BAL.combo.window;
  const v = base * mult();
  S.score += v;
  floatText(x, y, '+' + v, mult() > 1 ? FLARE : '220,235,255');
}

