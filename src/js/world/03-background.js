/* ---------- background ---------- */
let nebula = null, vignette = null, galaxySprite = null;
const stars = [];
const dust = [];
let galaxy = null, planet = null, planetTimer = 4;

function buildNebula() {
  const sc = .5;
  const c = document.createElement('canvas');
  c.width = Math.max(2, Math.ceil(W * sc)); c.height = Math.max(2, Math.ceil(H * sc));
  const g = c.getContext('2d'); const w = c.width, h = c.height;
  const bg = g.createLinearGradient(0, 0, w * .3, h);
  bg.addColorStop(0, '#070b1d'); bg.addColorStop(.5, '#04060f'); bg.addColorStop(1, '#020309');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  const cols = ['40,70,160', '110,40,160', '25,110,140', '150,45,100', '60,40,140', '30,90,170'];
  // a diagonal band like a galactic plane
  const ang = rand(-.6, .6), cx = w * rand(.3, .7), cy = h * rand(.3, .6);
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 26; i++) {
    const t = rand(-1, 1), off = rand(-.18, .18) * Math.max(w, h);
    const x = cx + Math.cos(ang) * t * w * .8 - Math.sin(ang) * off;
    const y = cy + Math.sin(ang) * t * w * .8 + Math.cos(ang) * off;
    const r = rand(.12, .38) * Math.max(w, h);
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    const col = pick(cols);
    gr.addColorStop(0, `rgba(${col},${rand(.09, .2)})`); gr.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  }
  // dark dust lanes
  g.globalCompositeOperation = 'source-over';
  for (let i = 0; i < 14; i++) {
    const t = rand(-1, 1), off = rand(-.06, .06) * Math.max(w, h);
    const x = cx + Math.cos(ang) * t * w * .7 - Math.sin(ang) * off;
    const y = cy + Math.sin(ang) * t * w * .7 + Math.cos(ang) * off;
    const r = rand(.04, .12) * Math.max(w, h);
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, 'rgba(2,3,8,.55)'); gr.addColorStop(1, 'rgba(2,3,8,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  }
  // faint baked star dust, denser along the band
  for (let i = 0; i < (w * h) / 55; i++) {
    let x, y;
    if (Math.random() < .6) {
      const t = rand(-1, 1), off = (Math.random() + Math.random() - 1) * .25 * Math.max(w, h);
      x = cx + Math.cos(ang) * t * w - Math.sin(ang) * off;
      y = cy + Math.sin(ang) * t * w + Math.cos(ang) * off;
    } else { x = rand(0, w); y = rand(0, h); }
    g.fillStyle = `rgba(${pick(['220,230,255', '255,240,220', '200,215,255'])},${rand(.08, .45)})`;
    g.fillRect(x, y, .6, .6);
  }
  nebula = c;
}

function buildVignette() {
  const c = document.createElement('canvas');
  c.width = Math.max(2, Math.ceil(W / 2)); c.height = Math.max(2, Math.ceil(H / 2));
  const g = c.getContext('2d'); const w = c.width, h = c.height;
  const gr = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .35, w / 2, h / 2, Math.hypot(w, h) * .6);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.6)');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  vignette = c;
}

function buildGalaxySprite() {
  const S = 360, c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d'); g.translate(S / 2, S / 2);
  g.globalCompositeOperation = 'lighter';
  const core = g.createRadialGradient(0, 0, 0, 0, 0, 60);
  core.addColorStop(0, 'rgba(255,240,210,.9)'); core.addColorStop(.3, 'rgba(255,210,160,.35)'); core.addColorStop(1, 'rgba(255,200,150,0)');
  g.save(); g.scale(1, .45); g.fillStyle = core; g.beginPath(); g.arc(0, 0, 60, 0, TAU); g.fill(); g.restore();
  for (let i = 0; i < 7000; i++) {
    const arm = i % 2, t = Math.pow(Math.random(), .7);
    const r = t * 165 + 6;
    const gauss = (Math.random() + Math.random() + Math.random() - 1.5) * .55;
    const a = arm * Math.PI + r * .032 + gauss * (1.1 - t * .6);
    const x = Math.cos(a) * r, y = Math.sin(a) * r * .42;
    const hot = 1 - t;
    g.fillStyle = hot > .7 ? `rgba(255,235,205,${.5 * Math.random()})` : (Math.random() < .12 ? `rgba(255,150,190,${.5 * Math.random()})` : `rgba(170,200,255,${.42 * Math.random()})`);
    const s = Math.random() < .05 ? 1.6 : .9;
    g.fillRect(x, y, s, s);
  }
  galaxySprite = c;
}

function buildStars() {
  stars.length = 0;
  const n = Math.min(520, Math.floor((W * H) / 2600));
  for (let i = 0; i < n; i++) {
    const z = Math.random() < .62 ? 0 : Math.random() < .7 ? 1 : 2;
    stars.push({ x: rand(0, W), y: rand(0, H), z, b: rand(.35, 1), tw: rand(0, TAU),
      c: pick(['235,240,255', '255,244,228', '205,220,255', '255,225,200', '235,240,255']) });
  }
  dust.length = 0;
  for (let i = 0; i < 26; i++) dust.push({ x: rand(0, W), y: rand(0, H), v: rand(380, 760), l: rand(18, 46), a: rand(.05, .16) });
}

function makePlanet() {
  const m = Math.min(W, H);
  const r = rand(m * .1, m * .24);
  const types = [
    { kind: 'gas', bands: [[196, 160, 120], [160, 112, 82], [226, 206, 176], [138, 92, 70], [210, 180, 140]], atm: '255,210,160' },
    { kind: 'gas', bands: [[110, 160, 205], [72, 118, 178], [168, 208, 232], [90, 140, 196]], atm: '120,190,255' },
    { kind: 'gas', bands: [[196, 150, 188], [140, 96, 156], [226, 196, 220], [168, 120, 176]], atm: '230,170,255' },
    { kind: 'rock', base: [150, 88, 66], spot: [110, 64, 52], atm: '255,150,110' },
    { kind: 'rock', base: [128, 126, 130], spot: [92, 90, 96], atm: null },
    { kind: 'ice', base: [196, 222, 238], spot: [150, 188, 216], atm: '170,220,255' },
  ];
  const T = pick(types);
  const ring = T.kind === 'gas' && Math.random() < .65;
  const size = r * (ring ? 4.8 : 2.8);
  const sc = Math.min(DPR, 1.5);
  const c = document.createElement('canvas');
  c.width = c.height = Math.ceil(size * sc);
  const g = c.getContext('2d'); g.scale(sc, sc); g.translate(size / 2, size / 2);
  const tilt = rand(-.45, .45);
  const ringCol = T.kind === 'gas' ? T.bands[2] : [200, 200, 200];
  const drawRing = (front) => {
    g.save(); g.rotate(tilt); g.scale(1, .26);
    for (let k = 0; k < 9; k++) {
      const rr = r * (1.45 + k * .085);
      g.beginPath(); g.arc(0, 0, rr, front ? 0 : Math.PI, front ? Math.PI : TAU);
      const a = (k === 4 ? .06 : rand(.18, .42)) * (front ? 1 : .8);
      g.strokeStyle = `rgba(${ringCol[0]},${ringCol[1]},${ringCol[2]},${a})`;
      g.lineWidth = r * rand(.05, .08); g.stroke();
    }
    g.restore();
  };
  if (ring) drawRing(false);
  // body
  g.save(); g.beginPath(); g.arc(0, 0, r, 0, TAU); g.clip();
  g.save(); g.rotate(tilt);
  if (T.kind === 'gas') {
    let y = -r * 1.2;
    while (y < r * 1.2) {
      const h = rand(r * .03, r * .14), b = pick(T.bands), j = rand(-14, 14);
      g.fillStyle = `rgb(${b[0] + j},${b[1] + j},${b[2] + j})`;
      g.fillRect(-r * 1.3, y, r * 2.6, h + 1); y += h;
    }
    for (let i = 0; i < 40; i++) {
      const b = pick(T.bands);
      g.fillStyle = `rgba(${b[0]},${b[1]},${b[2]},.35)`;
      g.beginPath(); g.ellipse(rand(-r, r), rand(-r, r), rand(r * .1, r * .4), rand(r * .01, r * .035), 0, 0, TAU); g.fill();
    }
    const sb = T.bands[1];
    g.fillStyle = `rgba(${sb[0] + 40},${sb[1] + 10},${sb[2] - 10},.75)`;
    g.beginPath(); g.ellipse(r * rand(-.4, .4), r * rand(.1, .4), r * .16, r * .07, 0, 0, TAU); g.fill();
  } else {
    const b = T.base;
    g.fillStyle = `rgb(${b[0]},${b[1]},${b[2]})`; g.fillRect(-r * 1.3, -r * 1.3, r * 2.6, r * 2.6);
    for (let i = 0; i < 90; i++) {
      const s = T.spot, k = rand(-20, 20);
      g.fillStyle = `rgba(${s[0] + k},${s[1] + k},${s[2] + k},${rand(.15, .5)})`;
      g.beginPath(); g.arc(rand(-r, r), rand(-r, r), rand(r * .02, r * .16), 0, TAU); g.fill();
    }
    if (T.kind === 'ice') {
      g.fillStyle = 'rgba(255,255,255,.55)';
      g.beginPath(); g.ellipse(0, -r * .92, r * .7, r * .2, 0, 0, TAU); g.fill();
    }
  }
  g.restore();
  // terminator: light from upper-left
  const sh = g.createRadialGradient(-r * .55, -r * .55, 0, -r * .55, -r * .55, r * 2.3);
  sh.addColorStop(0, 'rgba(255,250,240,.12)'); sh.addColorStop(.32, 'rgba(0,0,0,0)');
  sh.addColorStop(.58, 'rgba(0,0,0,.55)'); sh.addColorStop(.78, 'rgba(0,0,0,.94)'); sh.addColorStop(1, 'rgba(0,0,0,.98)');
  g.fillStyle = sh; g.fillRect(-r, -r, r * 2, r * 2);
  g.restore();
  if (T.atm) {
    const at = g.createRadialGradient(-r * .1, -r * .1, r * .92, 0, 0, r * 1.16);
    at.addColorStop(0, `rgba(${T.atm},0)`); at.addColorStop(.35, `rgba(${T.atm},.38)`); at.addColorStop(1, `rgba(${T.atm},0)`);
    g.save(); g.globalCompositeOperation = 'lighter';
    g.beginPath(); g.arc(0, 0, r * 1.16, 0, TAU); g.arc(0, 0, r * .9, 0, TAU, true);
    g.clip();
    // only the lit limb glows
    const mask = g.createLinearGradient(-r, -r, r * .6, r * .6);
    mask.addColorStop(0, 'rgba(0,0,0,1)'); mask.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = at; g.fillRect(-r * 1.3, -r * 1.3, r * 2.6, r * 2.6);
    g.globalCompositeOperation = 'destination-out';
    const fade = g.createLinearGradient(-r * .4, -r * .4, r, r);
    fade.addColorStop(0, 'rgba(0,0,0,0)'); fade.addColorStop(1, 'rgba(0,0,0,.9)');
    g.fillStyle = fade; g.fillRect(-r * 1.3, -r * 1.3, r * 2.6, r * 2.6);
    g.restore();
  }
  if (ring) drawRing(true);
  return { c, size, r, tilt, x: rand(size * .1, W - size * .1), y: -size / 2, vy: rand(7, 14), sats: [], satW: 0 };
}

function updateBackground(dt, speedK) {
  for (const s of stars) {
    const v = [14, 46, 130][s.z] * speedK;
    s.y += v * dt; s.tw += dt * 2;
    if (s.y > H + 4) { s.y = -4; s.x = rand(0, W); }
  }
  for (const d of dust) {
    d.y += d.v * speedK * dt;
    if (d.y > H + 50) { d.y = rand(-200, -50); d.x = rand(0, W); }
  }
  if (galaxy) { galaxy.y += galaxy.vy * dt; if (galaxy.y - galaxy.s * 100 > H) galaxy = null; }
  else galaxy = { x: rand(W * .1, W * .9), y: -rand(80, 200), s: rand(.6, 1.1) * Math.max(.6, Math.min(W, H) / 700), rot: rand(-.8, .8), vy: rand(3, 6) };
  if (planet) { planet.y += planet.vy * dt; if (planet.y - planet.size / 2 > H) { planet = null; planetTimer = rand(20, 40); } }
  else { planetTimer -= dt; if (planetTimer <= 0) { planet = makePlanet(); if (S.mode === 'play') { addSats(planet); S.toast = { txt: I18('侦测到行星防御卫星', 'Planetary defense satellites detected'), t: 2.2 }; } } }
}

function drawBackground() {
  const px = S.mode === 'play' ? (P.x - W / 2) : 0;
  const ox = -px * .015;
  ctx.drawImage(nebula, ox - 10, -10, W + 20, H + 20);
  if (S.mode === 'play' && !S.side && themeB()) drawSpaceTintB();
  else if (S.mode === 'play' && !S.side && themeC()) drawSpaceTintC();
  if (galaxy) {
    ctx.save(); ctx.translate(galaxy.x - px * .02, galaxy.y); ctx.rotate(galaxy.rot); ctx.scale(galaxy.s, galaxy.s);
    ctx.globalAlpha = .55; ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(galaxySprite, -180, -180);
    ctx.restore(); ctx.globalAlpha = 1;
  }
  if (planet) ctx.drawImage(planet.c, planet.x - planet.size / 2 - px * .03, planet.y - planet.size / 2, planet.size, planet.size);
  // far + mid stars
  for (const s of stars) {
    if (s.z === 2) continue;
    const a = s.b * (.7 + .3 * Math.sin(s.tw * (s.z ? 1 : 1.7)));
    ctx.fillStyle = `rgba(${s.c},${a})`;
    const sz = s.z ? 1.5 : 1;
    ctx.fillRect(s.x - px * (.02 + s.z * .02), s.y, sz, sz);
  }
}
function drawForeStars() {
  const px = S.mode === 'play' ? (P.x - W / 2) : 0;
  const fk = S.mode === 'play' && !S.trans ? 1 + ((S.flow || 1) - 1) * 2.2 : 1;
  ctx.globalCompositeOperation = 'lighter';
  for (const s of stars) {
    if (s.z !== 2) continue;
    const x = s.x - px * .07;
    ctx.strokeStyle = `rgba(${s.c},${s.b * .8})`; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(x, s.y); ctx.lineTo(x, s.y - 7 * S.speedK * fk); ctx.stroke();
    drawGlow(x, s.y, 4, s.c, s.b * .45);
  }
  ctx.lineWidth = 1;
  for (const d of dust) {
    const g = ctx.createLinearGradient(d.x, d.y, d.x, d.y - d.l);
    g.addColorStop(0, `rgba(180,220,255,${d.a})`); g.addColorStop(1, 'rgba(180,220,255,0)');
    ctx.strokeStyle = g; ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x, d.y - d.l * S.speedK * fk); ctx.stroke();
  }
  ctx.globalCompositeOperation = 'source-over';
}

