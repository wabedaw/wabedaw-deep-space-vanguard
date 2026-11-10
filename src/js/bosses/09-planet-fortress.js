/* ---------- planet fortress (stage boss every 10 sectors) ---------- */
const STAGE_CLEAR = st => ZH ? stageTag(st) + ' 完成' : 'STAGE ' + st + ' CLEAR';
const FORT_MODS = ['turret', 'missile', 'laser', 'hangar', 'turret', 'laser', 'missile', 'turret'];
function fortressGeo() {
  const nw = W < 520, PR = nw ? W * .95 : Math.max(W * .6, H * .62);
  const hw = clamp(W * .15, 56, 130), hh = hw * .6, RO = hh * 1.35;
  const ringBottom = inset.t + (nw ? Math.max(250, H * .4) + 20 : Math.max(270, H * .46)), rb = PR + RO + hh + 40;
  return { PR, ra: PR * (nw ? 1.18 : 1.25), rb, cy: RO - rb, ty: ringBottom - RO, ringBottom, hw, hh };
}
function spawnFortress(n) {
  const G = fortressGeo(), lvl = 1.35 + (n - 1) * .35;
  const b = { type: 'boss', kind: 'fortress', n, tier: n - 1, lvl, x: W / 2, t: 0, swayT: 0, hitT: 0, phase: 1, pi: 0, cur: null, hold: 0, entered: false,
    spin: 0, side: 1, alt: false, ring: 0, ph: 0, shield: true, shieldHit: 0 };
  b.hw = G.hw; b.hh = G.hh; b.r = b.hw;
  b.fx = Object.assign(G, { rot: Math.PI / 2 - .55, w: 240 / G.ra });
  const th = themeOf(stageOf(S.sector)); if (th === 2) Object.assign(b, { theme: 2, label: 'aegis', pat: 'aegis' }); else if (th === 3) Object.assign(b, { theme: 3, label: 'cryo', pat: 'cryo' });
  b.sprite = makeFortressPlanet(G.PR, th);
  b.parts = ([0, FORT_MODS, FORT_MODS_B, FORT_MODS_C][th] || FORT_MODS).map((type, i) => ({ type, i, r0: clamp(W * .028, 18, 26), r: 20, hp: 80 * lvl, maxhp: 80 * lvl, hitT: 0, aim: Math.PI / 2, dead: false, hidden: true, ox: 0, oy: 0, x: 0, y: -999, fireT: rand(.8, 2.6), alt: 0 }));
  b.hp = b.maxhp = BOSSES[b.label || 'fortress'].hp * (1 + (n - 1) * .5) * (1 + (S.sector - 1) * .06);
  b.score = Math.round(BOSSES[b.label || 'fortress'].score * (1 + (n - 1) * .5));
  b.y = -G.PR - 120;
  ships.push(b); S.boss = b;
}
function updateRing(e, dt, live, spK) {
  const F = e.fx; Object.assign(F, fortressGeo());
  const visAlive = e.parts.some(p => !p.dead && !p.hidden && p.x > 40 && p.x < W - 40);
  F.w += ((visAlive ? 55 : 240) / F.ra - F.w) * Math.min(1, dt * 1.5); F.rot += F.w * dt;
  const L = e.lvl, N = e.parts.length;
  for (const p of e.parts) {
    const th = F.rot + p.i * TAU / N, sn = Math.sin(th);
    p.ox = Math.cos(th) * F.ra; p.oy = F.cy + sn * F.rb; p.x = e.x + p.ox; p.y = e.y + p.oy;
    p.depth = sn; p.r = p.r0 * (.72 + .28 * Math.max(0, sn));
    p.hidden = sn < .2 || p.x < -p.r || p.x > W + p.r || p.y < -p.r;
    if (p.hidden && !p.dead) clearBeamsOf(p);
    if (p.dead || p.hidden) continue;
    let da = aimAng(p.x, p.y) - p.aim; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; p.aim += da * Math.min(1, dt * 4);
    if (!live) continue;
    p.fireT -= dt; if (p.fireT > 0) continue;
    if (p.x < 12 || p.x > W - 12 || p.y < 12) { p.fireT = .3; continue; }
    const s = spK * Math.min(1.4, .9 + .1 * L);
    if (p.type === 'turret') {
      if (p.alt++ % 2 === 0) for (let k = 0; k < 3; k++) S.events.push({ t: k * .08, fn: () => { if (!p.dead && !p.hidden && P.alive) eFire('needle', p.x, p.y, aimAng(p.x, p.y), 390 * s, { silent: k > 0 }); } });
      else for (let k = -2; k <= 2; k++) eFire('orb', p.x, p.y, aimAng(p.x, p.y) + k * .17, 210 * s, { c: FLARE, silent: k !== 0 });
      p.fireT = 1.6 / L;
    } else if (p.type === 'missile') {
      for (const o of [-1, 1]) eFire('homing', p.x + o * 8, p.y, Math.PI / 2 + o * .9, 150 * s, { seek: 2.6, turn: 2.2 + L * .3, silent: o > 0 });
      p.fireT = 3.4 / L;
    } else if (p.type === 'laser') {
      addBeam({ owner: p, ox: 0, oy: 0, w: 11, charge: 1.15, fire: 1.1, mode: 'track', sweep: .25 * spK, c: '120,235,255', dmg: 14 });
      p.fireT = 4.8 / L;
    } else if (p.type === 'hangar') {
      if (ships.length < 12) for (let k = 0; k < 2; k++) {
        const d = spawnShip(e.theme === 3 ? 'glint' : e.theme === 2 ? (k === 0 && rnd() < .5 ? 'mantis' : 'wasp') : k === 0 && S.sector > 10 && rnd() < .5 ? 'raider' : 'drone', p.x + (k ? 16 : -16), p.y + 10);
        if (d.type === 'drone') { d.vy = 120; d.amp = 40; d.bx = d.x; } else if (d.type === 'wasp') { d.vy = 130; d.bx = d.x; } else if (d.type === 'glint') d.bx = d.x;
      }
      p.fireT = 5.5 / L;
    }
  }
}
function shieldDown(e) {
  e.shield = false;
  waves.push({ x: e.x, y: e.y, r: e.hw, max: e.hw * 5, life: .9, maxl: .9, c: '150,240,255' });
  waves.push({ x: e.x, y: e.y, r: e.hw * .5, max: e.hw * 3.5, life: .7, maxl: .7, c: '255,255,255' });
  for (let i = 0; i < 40; i++) { const a = rand(0, TAU), sp = rand(120, 360); parts.push({ k: 'spark', x: e.x + Math.cos(a) * e.hw * 1.2, y: e.y + Math.sin(a) * e.hh * 1.8, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: rand(.4, .9), max: .9, c: pick(['150,240,255', '255,255,255', ION]), w: 1.6 }); }
  sfx.shieldBreak(); shake(14);
}
function fortressDown(e) {
  e.dying = true; e.dyingT = 0; e.shield = false; S.boss = null; S.kills++;
  clearBeamsOf(e); for (const p of e.parts) { clearBeamsOf(p); p.dead = true; }
  for (let i = 0; i < 16; i++) S.events.push({ t: i * .12, fn: () => { const bx = e.x + rand(-e.hw, e.hw); explode(bx, e.y + rand(-e.hh, e.hh), rand(30, 60), i % 2 ? PLAS : FIRE); sfx.boom(50, bx, i % 3 ? 'ship' : 'big'); } });
  for (let i = 0; i < 14; i++) S.events.push({ t: .4 + i * .13, fn: () => {
    const F = e.fx, th = Math.PI / 2 + (i % 2 ? 1 : -1) * (i / 14) * 1.4, x = e.x + Math.cos(th) * F.ra, y = e.y + F.cy + Math.sin(th) * F.rb;
    if (x > -40 && x < W + 40 && y > -40) { explode(x, y, rand(30, 55), FIRE, { debris: '90,95,110' }); sfx.boom(40, x, 'ship'); }
  } });
  S.events.push({ t: 2.1, fn: () => {
    explode(e.x, e.y, 170, FIRE, { debris: '120,120,140' }); explode(e.x, e.y, 110, ['255,255,255', ION, '180,250,255', WHITE]);
    sfx.boom(190, e.x, 'huge'); shake(28); S.wflash = .8; ebul.length = 0; clearBeams(); e.citadelGone = true;
    dropPower(e.x - 50, e.y, 'W'); dropPower(e.x, e.y, 'H'); dropPower(e.x + 50, e.y, 'M'); dropPower(e.x, e.y + 34, 'S');
    addScore(e.score, e.x, e.y);
  } });
  const st = Math.max(1, Math.round(S.sector / 10)), bonus = 10000 * st;
  S.events.push({ t: 3.4, fn: () => { S.score += bonus; S.banner = { big: STAGE_CLEAR(st), sub: I18('STAGE CLEAR · +', 'BONUS +') + bonus, t: 0, dur: 4 }; sfx.sector(); } });
  S.events.push({ t: 7.6, fn: () => beginTransition('entry') });
}
function updateFortressDying(e, dt) {
  e.dyingT += dt; e.fx.rot += e.fx.w * dt * .4; e.shieldHit = 0;
  if (e.dyingT > 3.4) e.y -= (e.dyingT - 3.4) * 130 * dt;
  if (rnd() < .3 && parts.length < 1400) { const th = rand(.3, Math.PI - .3), F = e.fx; sparks(e.x + Math.cos(th) * F.ra, e.y + F.cy + Math.sin(th) * F.rb, 2, FIRE); }
  if (e.dyingT > 9 || e.y < -e.fx.PR * .2 - 200) e.dead = true;
}
function makeFortressPlanet(R, theme = 1) {
  const T2 = theme === 2, T3 = theme === 3;
  const S0 = Math.max(256, Math.min(1100, Math.ceil(R * 2 * Math.min(DPR, 1.4))));
  const c = document.createElement('canvas'); c.width = c.height = S0;
  const g = c.getContext('2d'), r = S0 / 2 - 2, u = r / 400;
  g.translate(S0 / 2, S0 / 2);
  g.save(); g.beginPath(); g.arc(0, 0, r, 0, TAU); g.clip();
  const base = g.createRadialGradient(-r * .3, r * .4, r * .1, 0, 0, r);
  base.addColorStop(0, T3 ? '#dff2ff' : T2 ? '#4f7a62' : '#5f6d86'); base.addColorStop(.55, T3 ? '#7aa8c8' : T2 ? '#1f3a30' : '#2a3242'); base.addColorStop(1, T3 ? '#1a2c40' : T2 ? '#08140f' : '#10141c');
  g.fillStyle = base; g.fillRect(-r, -r, r * 2, r * 2);
  for (let i = 0; i < 90; i++) {
    g.fillStyle = `rgba(${pick(T3 ? ['200,225,240', '150,190,215', '230,240,250', '120,160,190', '170,200,230'] : T2 ? ['52,90,66', '22,40,32', '74,110,80', '40,70,52', '80,56,96'] : ['72,80,96', '32,38,50', '90,96,110', '44,58,66', '60,52,48'])},${rand(.25, .55)})`;
    g.beginPath(); g.ellipse(rand(-r, r), rand(-r, r), rand(20, 120) * u, rand(10, 60) * u, rand(0, TAU), 0, TAU); g.fill();
  }
  for (let i = 0; i < 260; i++) { const k = rand(-25, 25); g.fillStyle = `rgba(${(T3 ? 180 : T2 ? 30 : 40) + k},${(T3 ? 205 : T2 ? 58 : 46) + k},${(T3 ? 225 : T2 ? 44 : 58) + k},${T3 ? .35 : .5})`; g.beginPath(); g.arc(rand(-r, r), rand(-r, r), rand(2, 9) * u, 0, TAU); g.fill(); }
  g.strokeStyle = T3 ? 'rgba(160,230,255,.14)' : T2 ? 'rgba(170,255,120,.1)' : 'rgba(120,200,255,.09)'; g.lineWidth = Math.max(1, u * 1.2);
  for (let i = -5; i <= 5; i++) { const yy = i * r / 6, hw = r * Math.sqrt(1 - (i / 6) ** 2); g.beginPath(); g.ellipse(0, yy, hw, r * .035, 0, 0, TAU); g.stroke(); }
  for (let i = 1; i < 6; i++) { g.beginPath(); g.ellipse(0, 0, r * Math.cos(i / 6 * Math.PI / 2), r, 0, 0, TAU); g.stroke(); }
  const sh = g.createRadialGradient(-r * .5, r * .62, 0, -r * .5, r * .62, r * 2.3);
  sh.addColorStop(0, 'rgba(255,245,230,.2)'); sh.addColorStop(.32, 'rgba(0,0,0,0)'); sh.addColorStop(.6, 'rgba(0,0,0,.55)'); sh.addColorStop(.82, 'rgba(0,0,0,.9)'); sh.addColorStop(1, 'rgba(0,0,0,.96)');
  g.fillStyle = sh; g.fillRect(-r, -r, r * 2, r * 2);
  g.globalCompositeOperation = 'lighter';
  const hubs = [];
  for (let k = 0; k < 46; k++) {
    const cx = rand(-r, r) * .92, cy = rand(-r, r) * .92; if (cx * cx + cy * cy > r * r * .85) continue;
    const dark = clamp((cx - cy) / (r * 1.3) + .35, 0, 1); hubs.push([cx, cy, dark]);
    for (let i = 0, n = rand(25, 70); i < n; i++) {
      const x = cx + (rnd() + rnd() - 1) * r * .09, y = cy + (rnd() + rnd() - 1) * r * .06, s = rand(1, 2.6) * u;
      g.fillStyle = T3 ? `rgba(${pick([150, 190, 120])},${pick([230, 250])},255,${rand(.35, .9) * (.18 + .82 * dark)})` : T2 ? `rgba(${pick([170, 200, 140])},255,${pick([120, 160, 90])},${rand(.35, .9) * (.18 + .82 * dark)})` : `rgba(255,${pick([190, 210, 160])},${pick([100, 130, 70])},${rand(.35, .9) * (.18 + .82 * dark)})`; g.fillRect(x, y, s, s);
    }
  }
  g.lineWidth = Math.max(1, u);
  for (let i = 0; i < hubs.length - 1; i++) { const a = hubs[i], b = hubs[(i * 7 + 3) % hubs.length]; g.strokeStyle = `rgba(${T3 ? '150,230,255' : T2 ? '170,255,120' : '255,170,90'},${.12 * (.2 + a[2])})`; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
  g.restore();
  const at = g.createRadialGradient(0, 0, r * .93, 0, 0, r);
  at.addColorStop(0, T3 ? 'rgba(170,235,255,0)' : T2 ? 'rgba(150,255,120,0)' : 'rgba(110,180,255,0)'); at.addColorStop(1, T3 ? 'rgba(200,245,255,.6)' : T2 ? 'rgba(170,255,140,.5)' : 'rgba(120,190,255,.55)');
  g.fillStyle = at; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill();
  return c;
}
function drawFortress(e, pulse) {
  const F = e.fx, PR = F.PR, pcy = F.cy, live = !e.dying;
  ctx.globalCompositeOperation = 'lighter'; drawGlow(0, pcy, PR * 1.3, FTC[e.theme || 1].glow, .22); ctx.globalCompositeOperation = 'source-over';
  if (e.theme === 2) drawAegisRing(e, 0); else if (e.theme === 3) drawCryoShards(e, 0);
  ctx.drawImage(e.sprite, -PR, pcy - PR, PR * 2, PR * 2);
  if (e.theme === 2) drawAegisRing(e, 1); else if (e.theme === 3) drawCryoShards(e, 1);
  // planetary shield along the visible limb
  if (live) {
    const fl = .6 + .4 * Math.sin(S.t * 2.2);
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `rgba(${FTC[e.theme || 1].sh1},${.16 * fl})`; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(0, pcy, PR * 1.035, .15, Math.PI - .15); ctx.stroke();
    ctx.setLineDash([6, 10]); ctx.lineDashOffset = -S.t * 20; ctx.strokeStyle = `rgba(${FTC[e.theme || 1].sh2},${.35 * fl})`; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, pcy, PR * 1.05, .15, Math.PI - .15); ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0;
    ctx.globalCompositeOperation = 'source-over';
  }
  // space elevator tether to the citadel
  if (!e.citadelGone) {
    ctx.strokeStyle = 'rgba(150,170,200,.55)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -e.hh); ctx.lineTo(0, pcy + PR * .995); ctx.stroke();
    ctx.globalCompositeOperation = 'lighter';
    const len = (pcy + PR) - (-e.hh);
    for (let i = 0; i < 3; i++) { const q = ((S.t * .6 + i / 3) % 1); drawGlow(0, -e.hh + len * q, 6, FTC[e.theme || 1].teth, .9); }
    ctx.globalCompositeOperation = 'source-over';
  }
  if (!e.citadelGone) drawCitadel(e, pulse);
  // orbital ring, front arc only (passes in front of the citadel)
  const RW = clamp(W * .018, 10, 20), pts = [];
  for (let i = 0; i <= 120; i++) { const th = i / 120 * Math.PI, x = Math.cos(th) * F.ra, y = pcy + Math.sin(th) * F.rb; if (y + e.y > -60) pts.push([x, y]); }
  if (pts.length > 1) {
    const path = () => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); };
    ctx.lineCap = 'butt';
    path(); ctx.strokeStyle = '#141820'; ctx.lineWidth = RW + 4; ctx.stroke();
    path(); ctx.strokeStyle = '#46505f'; ctx.lineWidth = RW; ctx.stroke();
    path(); ctx.setLineDash([2, 12]); ctx.lineDashOffset = -F.rot * F.ra; ctx.strokeStyle = '#1d222c'; ctx.lineWidth = RW; ctx.stroke();
    ctx.setLineDash([4, 18]); ctx.lineDashOffset = -F.rot * F.ra * 1.0;
    path(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = live ? FTC[e.theme || 1].ring : 'rgba(255,150,70,.6)'; ctx.lineWidth = RW * .22; ctx.stroke();
    ctx.globalCompositeOperation = 'source-over'; ctx.setLineDash([]); ctx.lineDashOffset = 0;
    path(); ctx.strokeStyle = 'rgba(190,210,240,.25)'; ctx.lineWidth = 1; ctx.stroke();
  }
  for (const p of e.parts) if (!p.hidden || p.dead) drawModule(e, p, pulse);
}
function drawModule(e, p, pulse) {
  if (p.depth < .2) return;
  ctx.save(); ctx.translate(p.ox, p.oy); const s = p.r / 22; ctx.scale(s, s);
  if (p.dead) {
    ctx.fillStyle = '#0c0d10'; ctx.beginPath(); ctx.ellipse(0, 0, 18, 11, 0, 0, TAU); ctx.fill();
    ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 20, '255,120,40', .3 + .2 * rnd()); ctx.globalCompositeOperation = 'source-over';
    if (rnd() < .15 && !e.dying) sparks(p.x, p.y, 1, FIRE);
    ctx.restore(); return;
  }
  const metal = ctx.createLinearGradient(0, -20, 0, 20); metal.addColorStop(0, '#8a94a6'); metal.addColorStop(.5, '#465061'); metal.addColorStop(1, '#1d222b');
  ctx.fillStyle = metal; ctx.strokeStyle = 'rgba(10,12,18,.8)'; ctx.lineWidth = 1.2;
  if (p.type === 'turret') {
    ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + TAU / 16; ctx.lineTo(Math.cos(a) * 20, Math.sin(a) * 16); } ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.rotate(p.aim - Math.PI / 2); ctx.fillStyle = '#20252e'; ctx.fillRect(-7, 2, 4.5, 24); ctx.fillRect(2.5, 2, 4.5, 24); ctx.restore();
    ctx.fillStyle = '#2b313c'; ctx.beginPath(); ctx.arc(0, 0, 9, 0, TAU); ctx.fill();
    ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 10, FLARE, pulse * .9);
  } else if (p.type === 'missile') {
    ctx.fillRect(-20, -14, 40, 28); ctx.strokeRect(-20, -14, 40, 28);
    const ready = p.fireT < .6;
    for (const [x, y] of [[-9, -6], [9, -6], [-9, 6], [9, 6]]) { ctx.fillStyle = '#111419'; ctx.beginPath(); ctx.arc(x, y, 4.6, 0, TAU); ctx.fill(); }
    ctx.globalCompositeOperation = 'lighter';
    for (const [x, y] of [[-9, -6], [9, -6], [-9, 6], [9, 6]]) drawGlow(x, y, ready ? 9 : 5, '170,255,120', ready ? .9 : .5);
  } else if (p.type === 'laser') {
    ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(16, 0); ctx.lineTo(0, 20); ctx.lineTo(-16, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    const charging = beams.some(b => b.owner === p);
    ctx.fillStyle = '#9ff4ff'; ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(6, 0); ctx.lineTo(0, 9); ctx.lineTo(-6, 0); ctx.closePath(); ctx.fill();
    ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, charging ? 26 : 12, '120,235,255', charging ? 1 : .6 * pulse);
  } else if (p.type === 'rocket') {
    ctx.save(); ctx.rotate(p.aim + Math.PI);
    ctx.fillRect(-26, -15, 34, 30); ctx.strokeRect(-26, -15, 34, 30);
    ctx.fillStyle = '#0d0f12'; for (let r = 0; r < 3; r++) for (let c2 = 0; c2 < 2; c2++) { ctx.beginPath(); ctx.arc(-22, -9 + r * 9, 3.2, 0, TAU); ctx.fill(); }
    ctx.restore(); ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, 9, '255,200,120', p.fireT < .6 ? .9 : .4);
  } else {
    ctx.beginPath(); ctx.moveTo(-26, -12); ctx.lineTo(26, -12); ctx.lineTo(20, 14); ctx.lineTo(-20, 14); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#0d0f14'; ctx.fillRect(-15, 2, 30, 9);
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(0, 7, 14, PLASMA, .5 + .4 * Math.sin(S.t * 4 + p.i));
    for (let i = -2; i <= 2; i++) drawGlow(i * 10, -6, 3.5, (((S.t * 3) | 0) + i) % 3 ? PLASMA : WHITE, .9);
  }
  if (p.hitT > 0) drawGlow(0, 0, 30, WHITE, p.hitT * 5);
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(-20, -28, 40, 3.5); ctx.fillStyle = p.type === 'turret' ? `rgb(${FLARE})` : p.type === 'missile' ? 'rgb(170,255,120)' : p.type === 'laser' ? 'rgb(120,235,255)' : `rgb(${PLASMA})`;
  ctx.fillRect(-20, -28, 40 * clamp(p.hp / p.maxhp, 0, 1), 3.5);
  ctx.restore();
}
function drawCitadel(e, pulse) {
  const w = e.hw, h = e.hh, C = e.phase === 3 ? WARN : '120,200,255', dy = e.dying ? 1 : 0;
  ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, w * 1.5, C, .22); ctx.globalCompositeOperation = 'source-over';
  for (const sd of [-1, 1]) {
    ctx.fillStyle = '#262c37'; ctx.fillRect(sd * w * .62 - w * .09, -h * 1.15, w * .18, h * 1.2);
    ctx.globalCompositeOperation = 'lighter'; drawGlow(sd * w * .62, -h * 1.15, 7, C, pulse); ctx.globalCompositeOperation = 'source-over';
  }
  ctx.beginPath(); [[-1, 0], [-.72, -1], [.72, -1], [1, 0], [.74, .8], [.26, 1], [-.26, 1], [-.74, .8]].forEach(([a, b], i) => i ? ctx.lineTo(a * w, b * h) : ctx.moveTo(a * w, b * h)); ctx.closePath();
  const g = ctx.createLinearGradient(0, -h, 0, h); g.addColorStop(0, '#6e7a8e'); g.addColorStop(.5, '#323a49'); g.addColorStop(1, '#141820');
  ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = `rgba(${C},.6)`; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 1;
  for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * w / 4, -h * .95); ctx.lineTo(i * w / 4 * .9, h * .9); ctx.stroke(); }
  for (const sd of [-1, 1]) { ctx.fillStyle = '#1a1e26'; ctx.beginPath(); ctx.arc(sd * w * .78, h * .2, h * .22, 0, TAU); ctx.fill(); ctx.globalCompositeOperation = 'lighter'; drawGlow(sd * w * .78, h * .2, h * .2, C, pulse * .8); ctx.globalCompositeOperation = 'source-over'; }
  const dg = ctx.createRadialGradient(-h * .15, -h * .2, 2, 0, 0, h * .62); dg.addColorStop(0, '#9aa6ba'); dg.addColorStop(1, '#1b2029');
  ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(0, 0, h * .62, 0, TAU); ctx.fill(); ctx.strokeStyle = `rgba(${C},.5)`; ctx.stroke();
  ctx.fillStyle = '#0d1016'; ctx.fillRect(-h * .14, h * .3, h * .28, h * .62);
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(0, 0, h * .55, C, pulse * (e.phase > 1 ? 1 : .6)); drawGlow(0, 0, h * .16, WHITE, 1); drawGlow(0, h * .9, h * .25, '255,70,110', pulse);
  for (let i = -4; i <= 4; i++) drawGlow(i * w * .16, -h * .7, 2.6, i % 2 ? C : '255,230,180', .8);
  ctx.globalCompositeOperation = 'source-over';
  if (e.shield && !dy) {
    const fl = .5 + .5 * Math.sin(S.t * 3), hit = Math.max(0, e.shieldHit || 0) * 3, rx = w * 1.35, ry = h * 2;
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, -h * .3, rx, ry, 0, 0, TAU);
    ctx.globalCompositeOperation = 'lighter';
    const sg = ctx.createRadialGradient(0, -h * .3, ry * .4, 0, -h * .3, ry);
    sg.addColorStop(0, 'rgba(120,220,255,0)'); sg.addColorStop(1, `rgba(140,230,255,${.16 + .1 * fl + hit * .3})`);
    ctx.fillStyle = sg; ctx.fill(); ctx.strokeStyle = `rgba(160,240,255,${.45 + .3 * fl + hit})`; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.clip(); ctx.strokeStyle = `rgba(150,235,255,${.08 + .05 * fl + hit * .3})`; ctx.lineWidth = 1;
    const hs = 13, hx = hs * 1.5, hy = hs * Math.sqrt(3);
    for (let ix = -Math.ceil(rx / hx) - 1; ix <= Math.ceil(rx / hx) + 1; ix++) for (let iy = -Math.ceil(ry / hy) - 1; iy <= Math.ceil(ry / hy) + 1; iy++) {
      const cx = ix * hx, cy = -h * .3 + iy * hy + (ix % 2 ? hy / 2 : 0);
      ctx.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; ctx.lineTo(cx + Math.cos(a) * hs * .92, cy + Math.sin(a) * hs * .92); } ctx.closePath(); ctx.stroke();
    }
    ctx.restore();
  }
}

/* ===================== SURFACE STAGES (side-scrolling) ===================== */
const CN_NUM = I18('一二三四五六七八九十', '');
const stageTag = st => ZH ? '第' + CN_NUM[(st - 1) % 10] + '关' : 'STAGE ' + st;
const stageOf = sec => Math.ceil(sec / 10);
const levelOf = sec => sec - (stageOf(sec) - 1) * 10;
const stageKind = st => st === 10 ? 'final' : ['space', 'surface', 'base'][(st > 10 ? st - 11 : st - 1) % 3];
const cycOf = st => st <= 9 ? Math.floor((st - 1) / 3) + 1 : st === 10 ? 4 : Math.floor((st - 11) / 3) + 4;
const isSurfaceStage = st => stageKind(st) === 'surface';
const isBaseStage = st => stageKind(st) === 'base';
const SURFACE_NAMES = [I18('着陆区 · 赤潮平原', 'Landing Zone · Crimson Plains'), I18('翡翠河谷', 'Jade River Valley'), I18('晶簇山脉', 'Crystal Range'), I18('潮汐海岸', 'Tidal Coast'), I18('深蓝海域', 'Deep Blue Sea'), I18('浮岛海湾', 'Isle Gulf'), I18('外星前哨基地', 'Alien Outpost'), I18('风暴峡谷', 'Storm Canyon'), I18('舰队港湾', 'Fleet Harbor'), I18('巨像要塞', 'Colossus Citadel')];
function sectorName(sec = S.sector) { if (stageKind(stageOf(sec)) === 'final') return FINAL_NAMES[levelOf(sec) - 1] || FINAL_NAMES[0]; const th = themeOf(stageOf(sec)); return isSurfaceStage(stageOf(sec)) ? [SURFACE_NAMES, SURFACE_NAMES_B, SURFACE_NAMES_C][th - 1][levelOf(sec) - 1] : isBaseStage(stageOf(sec)) ? [BASE_NAMES, BASE_NAMES_B, BASE_NAMES_C][th - 1][levelOf(sec) - 1] : [SECTOR_NAMES, SECTOR_NAMES_B, SECTOR_NAMES_C][th - 1][levelOf(sec) - 1]; }
function sectorTag(sec = S.sector) { return stageKind(stageOf(sec)) !== 'space' ? stageTag(stageOf(sec)) + ' · ' + String(levelOf(sec)).padStart(2, '0') : I18('扇区 ', 'SECTOR ') + String(sec).padStart(2, '0'); }
const LV_BIOMES = [
  ['plains', 'forest', 'river', 'plains'], ['river', 'forest', 'plains', 'mountains'], ['mountains', 'river', 'mountains', 'forest'],
  ['plains', 'coast', 'sea', 'coast'], ['sea', 'coast', 'plains', 'sea'], ['coast', 'plains', 'base', 'forest'],
  ['mountains', 'base', 'plains', 'river'], ['sea', 'coast', 'base', 'mountains'], ['mountains', 'sea', 'base', 'forest'],
  ['plains', 'base', 'forest', 'base'],
];
const SKY = {
  dawn: { g: ['#0b1230', '#29305f', '#7b4f86', '#e8937b', '#ffd3a3'], far: '#6d5d8c', mid: '#3a3358', fog: '255,190,170', cloud: '255,214,200', stars: .35, sun: [.17, .64, '255,200,150'], ring: '245,225,205', ringA: 1, shade: .08 },
  day: { g: ['#0c2350', '#1e5b93', '#3f92bd', '#a6dbe0', '#eaf6ec'], far: '#6a8fae', mid: '#355f78', fog: '205,235,240', cloud: '255,255,255', stars: .05, sun: [.74, .14, '255,250,235'], ring: '250,250,255', ringA: .8, shade: 0 },
  dusk: { g: ['#0b0c22', '#2b1f4c', '#6d3057', '#d8643f', '#f7aa5d'], far: '#7c4b60', mid: '#3e2541', fog: '255,170,120', cloud: '255,190,160', stars: .5, sun: [.84, .6, '255,150,90'], ring: '255,215,180', ringA: 1, shade: .12 },
  night: { g: ['#02030a', '#070b20', '#121838', '#262450', '#3e3460'], far: '#2b2e52', mid: '#171932', fog: '120,120,190', cloud: '140,140,190', stars: 1, sun: null, ring: '200,210,255', ringA: 1.2, shade: .32 },
};
const skyForLv = lv => GW && GW.theme === 3 ? (lv <= 3 ? 'polar' : lv <= 6 ? 'aurora' : lv <= 9 ? 'blizzard' : 'frostdusk') : GW && GW.theme === 2 ? (lv <= 3 ? 'ember' : lv <= 6 ? 'ash' : lv <= 9 ? 'eclipse' : 'inferno') : lv <= 2 ? 'dawn' : lv <= 5 ? 'day' : lv <= 8 ? 'dusk' : 'night';
const BIOME_PAL = {
  plains: { top: '#4f9a7c', rim: '#9fe0b8', deep: '#1a1726' }, forest: { top: '#3c7d6c', rim: '#7fd1a8', deep: '#161522' },
  river: { top: '#4f9a7c', rim: '#9fe0b8', deep: '#1a1726' }, mountains: { top: '#7b7590', rim: '#d9d2f0', deep: '#1c1828' },
  coast: { top: '#c9ac78', rim: '#f2dcab', deep: '#2a2230' }, sea: { top: '#355f66', rim: '#5d8f94', deep: '#121a24' },
  base: { top: '#5f6672', rim: '#a9b3c2', deep: '#16181f' }, plateau: { top: '#5a5f6b', rim: '#a3adbb', deep: '#14161c' },
};
const STEPW = 6;
let GW = null;
const waterY = () => H * .865;
const unitScale = () => clamp(Math.min(W, H) / 800, .62, 1);
const sideK = () => 1 + (levelOf(S.sector) - 1) * .11 + (cycOf(stageOf(S.sector)) - 1) * .45 + (IW ? .3 : 0);
const sideSp = () => Math.min(1.45, .9 + .05 * levelOf(S.sector) + (cycOf(stageOf(S.sector)) - 1) * .1 + (IW ? .06 : 0));
const scrollFor = () => (135 + levelOf(S.sector) * 6) * (GW && GW.theme === 3 ? 1.4 : 1);
function swHash(i) { const s = Math.sin(i * 127.1 + GW.seed * 311.7) * 43758.5453; return s - Math.floor(s); }
function swNoise(x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return swHash(i) * (1 - u) + swHash(i + 1) * u; }
function swFbm(x, o = 3) { let a = 0, amp = .5, fr = 1, n = 0; for (let k = 0; k < o; k++) { a += swNoise(x * fr + k * 17.3) * amp; n += amp; amp *= .5; fr *= 2.03; } return a / n; }

function initTerrain() {
  GW = { cols: [], head: 0, seg: null, segIdx: 0, force: null, decor: [], fauna: [], wrecks: [], flyers: [], serp: [], nextUnit: 1100, lastCarrier: -9999, lastBase: -9999,
    seed: rand(0, 1000), flyT: 3, serpT: 6, clouds: [], wind: [], rain: [], dots: [], sky: null, skyOld: null, skyFade: 0, skyKey: '', cloudSpr: [], bolt: 0, theme: themeOf(stageOf(S.sector)) };
  S.wx = 0; S.scroll = scrollFor(); S.scrollT = scrollFor();
  newSegment();
  while (GW.head < W + 1500) genCol();
  setSky(skyForLv(levelOf(S.sector)), true);
  for (let i = 0; i < 9; i++) GW.clouds.push({ x: rand(0, W * 1.3), y: rand(H * .06, H * .48), par: rand(.06, .3), s: rand(.6, 1.5), i: i % 4 });
  for (let i = 0; i < 18; i++) GW.wind.push({ x: rand(0, W), y: rand(H * .08, H * .8), l: rand(30, 90), v: rand(500, 900), a: rand(.04, .12) });
  for (let i = 0; i < 3; i++) GW.dots.push({ x: rand(0, W), y: rand(H * .05, H * .3), v: rand(6, 14), ph: rand(0, 3) });
}
function newSegment() {
  const lv = levelOf(S.sector), list = ([0, LV_BIOMES, LV_BIOMES_B, LV_BIOMES_C][GW.theme] || LV_BIOMES)[lv - 1];
  const b = GW.force || list[GW.segIdx++ % list.length];
  const last = GW.cols[GW.cols.length - 1];
  const len = b === 'sea' ? rand(1900, 2800) : b === 'plateau' ? 1e9 : rand(1300, 2300);
  GW.seg = { b, start: GW.head, end: GW.head + len, fromY: last ? last.g : bioY(b, GW.head), rc: GW.head + len * rand(.35, .65), rw: rand(110, 190) };
}
function bioY(b, x) {
  switch (b) {
    case 'plains': return H * (.8 - .05 * swFbm(x * .0021) - .015 * swFbm(x * .013 + 5));
    case 'forest': return H * (.79 - .06 * swFbm(x * .0019 + 9) - .015 * swFbm(x * .012));
    case 'river': return H * (.8 - .04 * swFbm(x * .002 + 7));
    case 'mountains': return H * (.82 - .44 * Math.pow(1 - Math.abs(swFbm(x * .0017 + 3, 4) * 2 - 1), 2.2) - .03 * swFbm(x * .011));
    case 'coast': return H * (.845 - .02 * swFbm(x * .004 + 2));
    case 'sea': return H * (.96 - .02 * swFbm(x * .003));
    default: return H * .82;
  }
}
function genCol() {
  if (GW.head >= GW.seg.end) newSegment();
  const sg = GW.seg, x = GW.head, wy = waterY();
  let y = bioY(sg.b, x);
  const bt = (x - sg.start) / 420; if (bt < 1) { const u = bt * bt * (3 - 2 * bt); y = sg.fromY + (y - sg.fromY) * u; }
  if (sg.b === 'river') { const d = Math.abs(x - sg.rc) / sg.rw; if (d < 1) y += (wy + 34 - y) * Math.min(1, (1 - d * d) * 1.7); }
  const c = { wx: x, g: y, w: y > wy ? wy : 0, b: sg.b };
  GW.cols.push(c); GW.head += STEPW;
  decorate(c); maybeUnit(c);
}
function colIndex(wx) { return clamp(Math.floor((wx - GW.cols[0].wx) / STEPW), 0, GW.cols.length - 1); }
function groundAt(wx) { const i = colIndex(wx), a = GW.cols[i], b = GW.cols[Math.min(i + 1, GW.cols.length - 1)], f = clamp((wx - a.wx) / STEPW, 0, 1); return a.g + (b.g - a.g) * f; }
function wetAt(wx) { return !!GW.cols[colIndex(wx)].w; }
function solidTopAt(sx) { if (IW) return floorAt(sx); if (!GW) return H; const wx = S.wx + sx, g = groundAt(wx); return wetAt(wx) ? Math.min(g, waterY()) : g; }
function minTopAhead() { let m = H; if (!GW) return m; for (let i = colIndex(S.wx + W * .3), e = colIndex(S.wx + W + 500); i <= e; i += 4) { const c = GW.cols[i]; m = Math.min(m, c.w ? Math.min(c.g, c.w) : c.g); } return m; }
function ensureTerrain() {
  while (GW.head < S.wx + W + 1500) genCol();
  let k = 0; while (k < GW.cols.length - 2 && GW.cols[k].wx < S.wx - 90) k++;
  if (k) GW.cols.splice(0, k);
  const cut = S.wx - 160;
  if (GW.decor.length && GW.decor[0].wx < cut) GW.decor = GW.decor.filter(d => d.wx >= cut);
  if (GW.fauna.length && GW.fauna.some(f => f.wx < cut)) GW.fauna = GW.fauna.filter(f => f.wx >= cut);
  if (GW.wrecks.length && GW.wrecks[0].wx < cut - 200) GW.wrecks = GW.wrecks.filter(w => w.wx >= cut - 200);
}
function forcePlateauFrom(wx) {
  GW.force = 'plateau';
  let k = GW.cols.length; while (k > 1 && GW.cols[k - 1].wx > wx) k--;
  GW.cols.length = k;
  GW.head = GW.cols[k - 1].wx + STEPW;
  GW.decor = GW.decor.filter(d => d.wx <= wx); GW.fauna = GW.fauna.filter(f => f.wx <= wx - 200);
  for (const e of ships) if (e.ground && e.wx > wx - 60 && e.x > W) e.dead = true;
  newSegment();
}
function decorate(c) {
  if (c.w) return;
  if (GW.theme === 3) {
    const b = c.b, P0 = { plains: .04, forest: .1, river: .04, mountains: .035, coast: .03 }[b] || 0;
    if (rnd() < P0) {
      const q = rnd(), k = b === 'forest' ? (q < .7 ? 'pine' : q < .85 ? 'frostbloom' : 'snowrock') : b === 'mountains' ? (q < .6 ? 'icecrystal' : q < .8 ? 'pine' : 'snowrock') : b === 'coast' ? (q < .5 ? 'icecrystal' : 'snowrock') : (q < .3 ? 'pine' : q < .55 ? 'frostbloom' : q < .8 ? 'icecrystal' : 'snowrock');
      GW.decor.push({ wx: c.wx, y: c.g, k, s: rand(.7, 1.3), hue: ICE, ph: rand(0, TAU) });
    }
    if ((b === 'plains' || b === 'forest') && rnd() < .0013) { const n = 2 + ((rnd() * 3) | 0), vx = -rand(12, 22); for (let i = 0; i < n; i++) GW.fauna.push({ k: 'mammoth', wx: c.wx + i * rand(46, 64), vx, s: rand(.85, 1.15) * (i === 0 ? 1.15 : 1), ph: rand(0, TAU) }); }
    return;
  }
  if (GW.theme === 2) {
    const b = c.b, P0 = { plains: .04, forest: .08, river: .04, mountains: .035, coast: .03 }[b] || 0;
    if (rnd() < P0) {
      const q = rnd(), k = b === 'mountains' ? (q < .7 ? 'spire' : 'fumarole') : b === 'forest' ? (q < .5 ? 'embertree' : q < .85 ? 'fungus' : 'spire') : b === 'coast' ? (q < .6 ? 'fumarole' : 'spire') : (q < .35 ? 'embertree' : q < .6 ? 'fumarole' : q < .85 ? 'fungus' : 'spire');
      GW.decor.push({ wx: c.wx, y: c.g, k, s: rand(.7, 1.3), hue: pick(['255,140,60', '255,90,50', '255,200,90']), ph: rand(0, TAU) });
    }
    if ((b === 'plains' || b === 'river') && rnd() < .0014) { const n = 2 + ((rnd() * 3) | 0), vx = -rand(14, 26); for (let i = 0; i < n; i++) GW.fauna.push({ k: 'crawler', wx: c.wx + i * rand(30, 46), vx, s: rand(.8, 1.15), ph: rand(0, TAU) }); }
    return;
  }
  const b = c.b, r = rnd();
  const P0 = { plains: .05, forest: .1, river: .045, mountains: .03, coast: .03 }[b] || 0;
  if (r < P0) {
    let k;
    const q = rnd();
    if (b === 'forest') k = q < .5 ? 'tree' : q < .8 ? 'bulb' : 'frond';
    else if (b === 'mountains') k = c.g < H * .62 ? (q < .85 ? 'crystal' : 'frond') : (q < .5 ? 'crystal' : 'tree');
    else if (b === 'coast') k = q < .5 ? 'tube' : 'frond';
    else k = q < .35 ? 'frond' : q < .6 ? 'bulb' : q < .8 ? 'tree' : 'tube';
    GW.decor.push({ wx: c.wx, y: c.g, k, s: rand(.7, 1.3), hue: pick(['190,255,230', '255,140,230', '150,200,255', '255,210,120']), ph: rand(0, TAU) });
  }
  if ((b === 'plains' || b === 'forest') && rnd() < .0016) {
    const n = 3 + ((rnd() * 3) | 0), vx = -rand(12, 24);
    for (let i = 0; i < n; i++) GW.fauna.push({ k: 'grazer', wx: c.wx + i * rand(26, 42), vx, s: rand(.8, 1.15) * (i === 0 ? 1.15 : 1), ph: rand(0, TAU) });
  }
}

