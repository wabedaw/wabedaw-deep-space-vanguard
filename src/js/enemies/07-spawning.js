/* ---------- spawning ---------- */
function makeRockSprite(r, giant) {
  const pad = 3, s = Math.ceil(r * 2 + pad * 2), sc = Math.min(DPR, 1.5);
  const c = document.createElement('canvas'); c.width = c.height = Math.ceil(s * sc);
  const g = c.getContext('2d'); g.scale(sc, sc); g.translate(s / 2, s / 2);
  const n = giant ? 26 : 10 + ((r / 6) | 0), pts = [];
  for (let i = 0; i < n; i++) { const a = i / n * TAU; const rr = r * (giant ? rand(.86, 1) : rand(.74, 1)); pts.push([Math.cos(a) * rr, Math.sin(a) * rr]); }
  const path = () => {
    g.beginPath();
    for (let i = 0; i < n; i++) {
      const p = pts[i], q = pts[(i + 1) % n], mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
      if (i === 0) { const z = pts[n - 1]; g.moveTo((z[0] + p[0]) / 2, (z[1] + p[1]) / 2); }
      g.quadraticCurveTo(p[0], p[1], mx, my);
    }
    g.closePath();
  };
  const base = pick([[104, 92, 82], [118, 100, 84], [88, 88, 94], [126, 106, 88], [96, 84, 78]]);
  path(); g.save(); g.clip();
  g.fillStyle = `rgb(${base})`; g.fillRect(-s, -s, s * 2, s * 2);
  for (let i = 0; i < (giant ? 260 : 40); i++) {
    const k = rand(-26, 26);
    g.fillStyle = `rgba(${base[0] + k},${base[1] + k},${base[2] + k},${rand(.2, .5)})`;
    g.beginPath(); g.arc(rand(-r, r), rand(-r, r), rand(r * .03, r * .2), 0, TAU); g.fill();
  }
  const nc = giant ? 22 : 2 + ((r / 10) | 0);
  for (let i = 0; i < nc; i++) {
    const a = rand(0, TAU), d = Math.sqrt(Math.random()) * r * .72, x = Math.cos(a) * d, y = Math.sin(a) * d, cr = rand(r * .05, r * (giant ? .16 : .24));
    const cg = g.createRadialGradient(x + cr * .35, y + cr * .35, 0, x, y, cr);
    cg.addColorStop(0, 'rgba(255,235,210,.16)'); cg.addColorStop(.55, 'rgba(0,0,0,.22)'); cg.addColorStop(1, 'rgba(0,0,0,.5)');
    g.fillStyle = cg; g.beginPath(); g.arc(x, y, cr, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(255,230,200,.12)'; g.lineWidth = 1;
    g.beginPath(); g.arc(x, y, cr, .2, 1.9); g.stroke();
  }
  const sh = g.createRadialGradient(-r * .5, -r * .55, 0, -r * .5, -r * .55, r * 2.1);
  sh.addColorStop(0, 'rgba(255,238,215,.28)'); sh.addColorStop(.38, 'rgba(0,0,0,0)'); sh.addColorStop(.75, 'rgba(0,0,0,.7)'); sh.addColorStop(1, 'rgba(0,0,0,.92)');
  g.fillStyle = sh; g.fillRect(-s, -s, s * 2, s * 2);
  g.restore();
  path(); g.strokeStyle = 'rgba(255,225,190,.14)'; g.lineWidth = 1.2; g.stroke();
  return { c, s };
}


/* indestructible meteors: iron (cyan veins) and obsidian core (violet crystals) */
const IRON_VEIN = { iron: '120,235,255', obsid: '200,120,255' };
function makeIronSprite(r, kind) {
  const pad = 4, s = Math.ceil(r * 2 + pad * 2), sc = Math.min(DPR, 1.5), ob = kind === 'obsid';
  const c = document.createElement('canvas'); c.width = c.height = Math.ceil(s * sc);
  const g = c.getContext('2d'); g.scale(sc, sc); g.translate(s / 2, s / 2);
  const n = ob ? 9 : 14, pts = [];
  for (let i = 0; i < n; i++) { const a = i / n * TAU + rand(-.12, .12), rr = r * (ob ? rand(.8, 1) : rand(.86, 1)); pts.push([Math.cos(a) * rr, Math.sin(a) * rr]); }
  const path = () => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); };
  path(); g.save(); g.clip();
  const bg = g.createRadialGradient(-r * .35, -r * .4, r * .1, 0, 0, r * 1.1);
  if (ob) { bg.addColorStop(0, '#5f4d80'); bg.addColorStop(.45, '#251c36'); bg.addColorStop(1, '#07060c'); }
  else { bg.addColorStop(0, '#aab5c7'); bg.addColorStop(.42, '#4b5466'); bg.addColorStop(1, '#0d1016'); }
  g.fillStyle = bg; g.fillRect(-s, -s, s * 2, s * 2);
  const cx = rand(-r * .2, r * .2), cy = rand(-r * .2, r * .2);
  for (let i = 0; i < n; i++) {
    const [x, y] = pts[i], [x2, y2] = pts[(i + 1) % n], lit = Math.cos(Math.atan2((y + y2) / 2, (x + x2) / 2) + 2.3);
    g.fillStyle = lit > 0 ? `rgba(255,255,255,${.05 + lit * .1})` : `rgba(0,0,0,${-lit * .3})`;
    g.beginPath(); g.moveTo(cx, cy); g.lineTo(x, y); g.lineTo(x2, y2); g.closePath(); g.fill();
  }
  g.strokeStyle = ob ? 'rgba(210,175,255,.2)' : 'rgba(210,225,245,.22)'; g.lineWidth = 1;
  g.beginPath(); for (const [x, y] of pts) { g.moveTo(cx, cy); g.lineTo(x, y); } g.stroke();
  if (!ob) for (let i = 0; i < 18; i++) { g.fillStyle = `rgba(0,0,0,${rand(.15, .35)})`; g.beginPath(); g.arc(rand(-r, r) * .8, rand(-r, r) * .8, rand(1, Math.max(1.2, r * .08)), 0, TAU); g.fill(); }
  const vc = IRON_VEIN[kind];
  g.globalCompositeOperation = 'lighter'; g.lineCap = 'round'; g.lineJoin = 'round';
  for (let v = 0; v < (ob ? 4 : 3); v++) {
    let x = rand(-r * .5, r * .5), y = rand(-r * .5, r * .5), a = rand(0, TAU);
    g.beginPath(); g.moveTo(x, y);
    for (let i = 0; i < 5; i++) { a += rand(-.9, .9); x += Math.cos(a) * r * .22; y += Math.sin(a) * r * .22; g.lineTo(x, y); }
    g.strokeStyle = `rgba(${vc},.25)`; g.lineWidth = 4; g.stroke(); g.strokeStyle = `rgba(${vc},.9)`; g.lineWidth = 1.3; g.stroke();
  }
  if (ob) for (let i = 0; i < 4; i++) { const a = rand(0, TAU), d = rand(.2, .6) * r, x = Math.cos(a) * d, y = Math.sin(a) * d, k = rand(3, r * .16); g.fillStyle = `rgba(${vc},.55)`; g.beginPath(); g.moveTo(x, y - k * 1.6); g.lineTo(x + k * .7, y); g.lineTo(x, y + k * 1.6); g.lineTo(x - k * .7, y); g.closePath(); g.fill(); }
  g.globalCompositeOperation = 'source-over';
  const sh = g.createRadialGradient(-r * .45, -r * .5, 0, -r * .45, -r * .5, r * 2.1);
  sh.addColorStop(0, 'rgba(255,255,255,.24)'); sh.addColorStop(.35, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.75)');
  g.fillStyle = sh; g.fillRect(-s, -s, s * 2, s * 2);
  g.restore();
  path(); g.strokeStyle = ob ? 'rgba(215,175,255,.55)' : 'rgba(205,222,245,.6)'; g.lineWidth = 1.4; g.stroke();
  return { c, s };
}
function spawnRock(o = {}) {
  let iron = o.iron || null;
  if (!iron && o.r === undefined && S.mode === 'play' && rocks.reduce((n, k) => n + (k.iron && !k.dead ? 1 : 0), 0) < 3 && Math.random() < Math.min(.2, .07 + S.sector * .012)) iron = Math.random() < .6 ? 'iron' : 'obsid';
  const r = o.r ?? (iron === 'obsid' ? rand(36, 54) : iron ? rand(20, 38) : rand(13, 44));
  const giant = !iron && r > 70;
  const d = diff(), sk = 1 + (S.sector - 1) * .05;
  rocks.push({
    x: o.x ?? rand(r, W - r), y: o.y ?? -r - 10,
    vx: o.vx ?? rand(-28, 28) * (iron ? .6 : 1), vy: o.vy ?? rand(60, 135) * Math.min(1.5, Math.sqrt(d)) * (iron ? .72 : 1),
    r, giant, iron, rot: rand(0, TAU), vr: rand(-.7, .7) * (giant ? .25 : iron ? .35 : 1),
    hp: iron ? Infinity : giant ? Math.round(100 + S.sector * 18) : Math.max(2, Math.ceil(r / 4 * sk)), maxhp: 0, hitT: 0,
    sprite: iron ? makeIronSprite(r, iron) : makeRockSprite(r, giant),
  });
  const k = rocks[rocks.length - 1]; k.maxhp = k.hp;
  return k;
}

const SHIPDEF = { drone: { r: 16, hp: 3, score: 100 }, raider: { r: 25, hp: 10, score: 240 }, gunship: { r: 40, hp: 38, score: 650 }, lancer: { r: 22, hp: 14, score: 420 } };
function spawnShip(type, x, y = -40) {
  const d = diff(), def = SHIPDEF[type];
  const e = { type, x, y, bx: x, r: def.r, hp: def.hp * (1 + (S.sector - 1) * .15), score: def.score, t: 0, hitT: 0,
    fireT: rand(.8, 1.8), vx: 0, vy: 0, ph: rand(0, TAU), alt: 0, aim: Math.PI / 2 };
  e.maxhp = e.hp;
  if (type === 'drone') { e.vy = rand(110, 160) * Math.min(1.4, Math.sqrt(d)); e.amp = rand(30, 80); e.wf = rand(1.5, 2.6); e.needle = Math.random() < (S.sector > 1 ? .45 : .25); }
  if (type === 'raider') { e.ty = inset.t + rand(90, Math.max(110, H * .3)); e.vx = rand(90, 140) * (Math.random() < .5 ? -1 : 1); e.state = 0; }
  if (type === 'gunship') { e.ty = inset.t + rand(110, Math.max(130, H * .26)); e.state = 0; }
  if (type === 'lancer') { e.ty = inset.t + rand(110, Math.max(130, H * .32)); e.state = 0; e.shots = 0; e.tx = x; e.fireT = 1; }
  if (HIVE_TYPES.has(type)) initHiveShip(e, d);
  else if (CRYO_TYPES.has(type)) initCryoShip(e, d);
  if (themeC() && !S.side) { e.vx *= 1.2; e.vy *= 1.2; }
  ships.push(e);
  return e;
}
function spawnWave() {
  const r = Math.random();
  if ((S.sector >= 2 || S.t > 70) && r < .18) spawnShip('gunship', rand(W * .2, W * .8));
  else if (S.t > 22 && r < .36) spawnShip('lancer', rand(W * .15, W * .85));
  else if (S.t > 12 && r < .6) {
    const n = S.sector >= 3 && Math.random() < .5 ? 2 : 1;
    for (let i = 0; i < n; i++) spawnShip('raider', rand(W * .15, W * .85), -40 - i * 60);
  } else {
    const n = 3 + Math.min(3, S.sector - 1 + ((Math.random() * 2) | 0));
    const gap = Math.min(40, (W - 80) / n);
    const cx = rand(40 + gap * n / 2, W - 40 - gap * n / 2);
    const v = Math.random() < .5;
    for (let i = 0; i < n; i++) {
      const m = i - (n - 1) / 2;
      spawnShip('drone', cx + m * gap, -30 - (v ? Math.abs(m) * 34 : i * 42));
    }
  }
}

