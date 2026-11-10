/* ---------- stage boss: Colossus ground fortress ---------- */
function spawnColossus(n) {
  const lvl = 1.5 + (n - 1) * .4, hw = clamp(W * .2, 96, 250), hh = clamp(Math.min(H * .24, W * .36), 88, 190);
  const b = { type: 'boss', kind: 'colossus', n, tier: n - 1, lvl, t: 0, swayT: 0, hitT: 0, phase: 1, pi: 0, cur: null, hold: 0, entered: false,
    spin: 0, side: 1, alt: false, ring: 0, ph: 0, shield: true, shieldHit: 0, dir: Math.PI, hw, hh, r: hh * .38, parts: [] };
  b.tx = W * .5 + hw * .12; b.wx = S.wx + W + hw * .6 + 60; b.x = b.wx - S.wx;
  b.groundY = H * .82; b.base = b.groundY; b.y = b.groundY - hh;
  const R = clamp(hh * .17, 18, 30);
  b.parts = [
    ['laser', 'laser', -.3, .5], ['hangar', 'hangar', -.02, .84], ['rocket', 'rocket', .05, -.6], ['aa', 'turret', .25, -1.06], ['silo', 'missile', .6, -.98], ['aa', 'turret', .95, -1.34],
    ['aa', 'turret', .62, -.4], ['laser', 'laser', 1.0, -.32], ['rocket', 'rocket', 1.02, .62], ['aa', 'turret', 1.32, -1.24],
  ].map(([role, type, ox, oy], i) => ({ role, type, i, ox: ox * hw, oy: oy * hh, r0: R, r: R, depth: 1, hp: 110 * lvl, maxhp: 110 * lvl, hitT: 0, aim: Math.PI * 1.2, dead: false, hidden: true, x: 0, y: 0, fireT: rand(.8, 2.4), alt: 0 }));
  if (GW && GW.theme === 2) Object.assign(b, { theme: 2, label: 'forge', pat: 'forge' });
  else if (GW && GW.theme === 3) Object.assign(b, { theme: 3, label: 'frostcit', pat: 'frostcit' });
  b.hp = b.maxhp = BOSSES[b.label || 'colossus'].hp * (1 + (n - 1) * .5);
  b.score = Math.round(BOSSES[b.label || 'colossus'].score * (1 + (n - 1) * .5));
  if (GW && !GW.force) forcePlateauFrom(S.wx + W + 40);
  ships.push(b); S.boss = b;
}
function updateColossus(e, dt, canFire, spK) {
  e.x = e.wx - S.wx;
  if (!e.entered) {
    if (e.x < e.tx + 110) S.scrollT = 0;
    if (S.scrollT === 0 && S.scroll < 4) { e.entered = true; S.scroll = 0; S.toast = { txt: I18('先摧毁炮塔与发射架，瓦解核心护盾', 'Destroy turrets and launchers to drop the core shield'), t: 4.2 }; }
  }
  const live = canFire && e.entered, L = e.lvl, s = Math.min(1.45, .95 + .08 * L);
  for (const p of e.parts) {
    p.x = e.x + p.ox; p.y = e.y + p.oy; p.hidden = p.x > W - 8 || p.x < -p.r;
    if (p.dead || p.hidden) continue;
    let da = aimAng(p.x, p.y) - p.aim; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; p.aim += da * Math.min(1, dt * 4);
    if (!live) continue;
    p.fireT -= dt; if (p.fireT > 0) continue;
    if (p.role === 'aa') {
      if (p.alt++ % 3 === 2) eFire('shell', p.x, p.y, p.aim, 300 * s, { fuse: clamp(Math.hypot(P.x - p.x, P.y - p.y) / 300, .35, 2.4), n: 10 });
      else tracer(p.x + Math.cos(p.aim) * p.r, p.y + Math.sin(p.aim) * p.r, p.aim, 430 * s, 5);
      p.fireT = 1.35 / L;
    } else if (p.role === 'silo') {
      for (let k = 0; k < 3; k++) eFire('homing', p.x + (k - 1) * 9, p.y - p.r, -Math.PI / 2 - .35 - k * .25, 170 * s, { mis: true, seek: 3, turn: 1.8 + L * .2, silent: k > 0 });
      p.fireT = 3.6 / L;
    } else if (p.role === 'rocket') {
      for (let k = 0; k < 6; k++) S.events.push({ t: k * .1, fn: () => { if (!p.dead && P.alive) eFire('rocket', p.x - p.r, p.y, aimAng(p.x, p.y) + rand(-.1, .1), 160 * s, { acc: 430, max: 560 * s, silent: k > 0 }); } });
      p.fireT = 3.2 / L;
    } else if (p.role === 'laser') {
      addBeam({ owner: p, ox: 0, oy: 0, w: 13, charge: 1.2, fire: 1.3, mode: 'track', sweep: .26 * spK, c: '255,120,90', dmg: 15 });
      p.fireT = 5.2 / L;
    } else if (p.role === 'hangar') {
      if (ships.length < 22) for (let k = 0; k < 3; k++) S.events.push({ t: k * .45, fn: () => { if (!p.dead && P.alive) spawnAir('fighter', p.x - p.r, p.y, { climb: true }); } });
      p.fireT = 4.4 / L;
    }
  }
  if (live) {
    e.escN = e.escN || 0; e.escT = (e.escT ?? 6) - dt;
    const want = Math.min(3, e.phase + (e.t > 45 ? 1 : 0));
    if (e.escN < want && e.escT <= 0) { spawnEscort(([0, SIDE_MINIS, SIDE_MINIS_B, SIDE_MINIS_C][e.theme || 1])[e.escN]); e.escN++; e.escT = 9; }
  }
}
const rowPart = (e, y) => e.parts.some(p => !p.dead && !p.hidden && Math.abs(p.y - y) < p.r + 3);
function colossusArmor(e, x, y) {
  if (e.dying && e.citadelGone) return false;
  const w = e.hw, h = e.hh;
  if (x > e.x - w * .1 && y > e.y - h * 1.15 && y < e.groundY) return true;
  return x > e.x - w * .44 && x < e.x - w * .15 && y > e.y + h * .38 && y < e.groundY;
}
function colossusDown(e) {
  e.dying = true; e.dyingT = 0; e.shield = false; S.boss = null; S.kills++;
  clearBeamsOf(e); for (const p of e.parts) { clearBeamsOf(p); p.dead = true; }
  for (const s2 of ships) if (s2.escort && !s2.dead) killShip(s2);
  const w = e.hw, h = e.hh;
  for (let i = 0; i < 20; i++) S.events.push({ t: i * .11, fn: () => { const bx = e.x + rand(-.3, 1.3) * w, by = e.y + rand(-1.2, .9) * h; explode(bx, by, rand(30, 64), i % 3 ? FIRE : PLAS, { debris: '80,76,80' }); sfx.boom(50, bx, i % 3 ? 'ship' : 'big'); } });
  S.events.push({ t: 2.3, fn: () => {
    explode(e.x, e.y, 180, FIRE, { debris: '110,100,110' }); explode(e.x, e.y, 120, ['255,255,255', '255,220,160', '255,180,100', WHITE]);
    sfx.boom(200, e.x, 'huge'); shake(30); S.wflash = .85; ebul.length = 0; clearBeams(); e.citadelGone = true;
    dropPower(e.x - 60, e.y - 40, 'W'); dropPower(e.x - 60, e.y, 'H'); dropPower(e.x - 60, e.y + 40, 'M'); dropPower(e.x - 100, e.y, 'S');
    addScore(e.score, e.x, e.y);
  } });
  const st = stageOf(S.sector), bonus = 10000 * st;
  S.events.push({ t: 3.6, fn: () => { S.score += bonus; S.banner = { big: STAGE_CLEAR(st), sub: I18('STAGE CLEAR · +', 'BONUS +') + bonus, t: 0, dur: 4 }; sfx.sector(); } });
  S.events.push({ t: 7.8, fn: () => beginTransition('breach') });
}
function updateColossusDying(e, dt) {
  e.dyingT += dt; e.x = e.wx - S.wx;
  if (Math.random() < .35 && parts.length < 1300) parts.push({ k: 'smoke', x: e.x + rand(-.2, 1.4) * e.hw, y: e.y + rand(-1.1, .6) * e.hh, vx: -S.scroll * .4, vy: -rand(20, 50), life: rand(1.2, 2.2), max: 2.2, r: rand(10, 22), g: 18, c: '36,32,36' });
  if (e.x < -e.hw * 3) e.dead = true;
}
function drawColossus(e, pulse) {
  const w = e.hw, h = e.hh, gy = e.groundY - e.y, X2 = w * 3, C = e.phase === 3 ? WARN : '255,170,90', ruin = e.citadelGone;
  if (e.theme === 2) drawForgeBack(e); else if (e.theme === 3) drawGlacierBack(e);
  // searchlights
  if (!e.dying) {
    ctx.globalCompositeOperation = 'lighter';
    for (const [x, ph] of [[.25, 0], [.95, 2]]) {
      const a = -Math.PI / 2 + Math.sin(S.t * .5 + ph) * .55, L = H * 1.2, sp = .07;
      const g = ctx.createLinearGradient(x * w, -h, x * w + Math.cos(a) * L, -h + Math.sin(a) * L); g.addColorStop(0, 'rgba(255,240,200,.18)'); g.addColorStop(1, 'rgba(255,240,200,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x * w, -h * 1.2); ctx.lineTo(x * w + Math.cos(a - sp) * L, -h * 1.2 + Math.sin(a - sp) * L); ctx.lineTo(x * w + Math.cos(a + sp) * L, -h * 1.2 + Math.sin(a + sp) * L); ctx.closePath(); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }
  const fp = c => e.theme === 2 ? FORGE_PAL[c] || c : e.theme === 3 ? GLACIER_PAL[c] || c : c;
  const fill = (pts, a, b, c) => { a = fp(a); b = fp(b); c = fp(c); ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); const g = ctx.createLinearGradient(0, pts[0][1], 0, pts[2][1]); g.addColorStop(0, a); g.addColorStop(.5, b); g.addColorStop(1, c); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = ruin ? 'rgba(40,30,30,.6)' : `rgba(${C},.45)`; ctx.lineWidth = 1.4; ctx.stroke(); };
  const dk = ruin ? .45 : 1, m = (hex) => hex;
  // rear spires
  fill([[w * .5, -h * 1.6], [X2, -h * 1.6], [X2, -h * 1.15], [w * .4, -h * 1.15]], '#4a4f5c', '#2c303a', '#1b1d24');
  // top tier
  fill([[w * .12, -h * 1.15], [X2, -h * 1.15], [X2, -h * .75], [w * .02, -h * .75]], '#7d8597', '#454b5a', '#23262f');
  // mid tier (front face holds the reactor)
  fill([[-w * .12, -h * .75], [X2, -h * .75], [X2, h * .3], [-w * .12, h * .3]], '#8a92a4', '#4a5160', '#22252e');
  // base glacis
  fill([[-w * .1, h * .3], [X2, h * .3], [X2, gy + 2], [-w * .34, gy + 2]], '#6d7383', '#3a3f4c', '#17191f');
  // forward bastion for the laser turret
  fill([[-w * .44, h * .38], [-w * .15, h * .38], [-w * .15, gy + 2], [-w * .46, gy + 2]], '#7a8192', '#414755', '#1a1c23');
  for (let x = -w * .44; x < -w * .16; x += 14) { ctx.fillStyle = '#2a2e38'; ctx.fillRect(x, h * .32, 8, 7); }
  ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1;
  for (let x = 0; x < X2; x += w * .22) { ctx.beginPath(); ctx.moveTo(x, -h * .75); ctx.lineTo(x, gy); ctx.stroke(); }
  for (const y of [-h * .4, -h * .05, h * .6]) { ctx.beginPath(); ctx.moveTo(-w * .12, y); ctx.lineTo(X2, y); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,200,80,.6)'; for (let x = -w * .3; x < X2; x += 26) ctx.fillRect(x, gy - 8, 13, 3);
  ctx.globalCompositeOperation = 'lighter';
  if (!ruin) for (let r = 0; r < 3; r++) for (let x = w * .3; x < Math.min(X2, W - e.x + 20); x += w * .14) drawGlow(x, -h * (.95 - r * .45) + h * .1, 2.2, (((x / 20) | 0) + r) % 4 ? '255,210,140' : C, .8 * dk);
  ctx.globalCompositeOperation = 'source-over';
  // towers carrying the AA turrets
  for (const [x, top] of [[.25, -1.06], [.95, -1.34], [1.32, -1.24]]) { ctx.fillStyle = metalGrad(-h * 1.4, -h * .75, fp('#8a92a4'), fp('#4a5160'), fp('#22252e')); ctx.fillRect(x * w - w * .06, top * h, w * .12, -h * 1.15 - top * h + h * .02); }
  // antenna
  ctx.strokeStyle = '#3b404c'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w * 1.3, -h * 1.6); ctx.lineTo(w * 1.3, -h * 2.2); ctx.moveTo(w * .7, -h * 1.6); ctx.lineTo(w * .7, -h * 1.95); ctx.stroke();
  ctx.globalCompositeOperation = 'lighter'; drawGlow(w * 1.3, -h * 2.2, 4, '255,60,60', ((S.t * 2) | 0) % 2 ? 1 : .2); drawGlow(w * .7, -h * 1.95, 3, '255,60,60', ((S.t * 2 + 1) | 0) % 2 ? 1 : .2); ctx.globalCompositeOperation = 'source-over';
  if (e.theme === 2 && !ruin) drawForgeLava(e); else if (e.theme === 3 && !ruin) drawGlacierFront(e);
  if (!ruin) {
    // main cannon
    ctx.fillStyle = metalGrad(-h * .12, h * .12, '#9ba3b5', '#4d5464', '#20232b'); ctx.fillRect(-w * .56, -h * .09, w * .5, h * .18);
    ctx.fillStyle = '#2a2e38'; for (const x of [-.5, -.38, -.26]) ctx.fillRect(x * w, -h * .12, w * .035, h * .24);
    ctx.globalCompositeOperation = 'lighter'; drawGlow(-w * .56, 0, h * .14, '255,70,110', pulse); ctx.globalCompositeOperation = 'source-over';
    // reactor core
    const R = h * .38;
    ctx.fillStyle = '#1a1c23'; ctx.beginPath(); ctx.arc(0, 0, R * 1.18, 0, TAU); ctx.fill();
    ctx.strokeStyle = metalGrad(-R, R, '#a8b0c2', '#555c6c', '#2a2d35'); ctx.lineWidth = R * .22; ctx.beginPath(); ctx.arc(0, 0, R * 1.02, 0, TAU); ctx.stroke();
    const cg = ctx.createRadialGradient(-R * .2, -R * .2, 2, 0, 0, R * .85); cg.addColorStop(0, '#fff6e8'); cg.addColorStop(.35, `rgb(${C})`); cg.addColorStop(1, '#2a1208');
    ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(0, 0, R * .82, 0, TAU); ctx.fill();
    ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, R * 1.3, C, .45 * pulse + (e.phase > 1 ? .3 : 0)); drawGlow(0, 0, R * .3, WHITE, 1); ctx.globalCompositeOperation = 'source-over';
    if (e.shield) {
      const fl = .5 + .5 * Math.sin(S.t * 3), hit = Math.max(0, e.shieldHit || 0) * 3, rr = R * 1.55;
      ctx.save(); ctx.beginPath(); ctx.arc(0, 0, rr, 0, TAU); ctx.globalCompositeOperation = 'lighter';
      const sg = ctx.createRadialGradient(0, 0, rr * .5, 0, 0, rr); sg.addColorStop(0, 'rgba(120,220,255,0)'); sg.addColorStop(1, `rgba(140,230,255,${.2 + .1 * fl + hit * .3})`);
      ctx.fillStyle = sg; ctx.fill(); ctx.strokeStyle = `rgba(160,240,255,${.5 + .3 * fl + hit})`; ctx.lineWidth = 1.6; ctx.stroke();
      ctx.clip(); ctx.strokeStyle = `rgba(150,235,255,${.1 + .05 * fl + hit * .3})`; ctx.lineWidth = 1;
      const hs = 11, hx = hs * 1.5, hy = hs * Math.sqrt(3);
      for (let ix = -Math.ceil(rr / hx) - 1; ix <= Math.ceil(rr / hx) + 1; ix++) for (let iy = -Math.ceil(rr / hy) - 1; iy <= Math.ceil(rr / hy) + 1; iy++) {
        const cx = ix * hx, cy = iy * hy + (ix % 2 ? hy / 2 : 0); ctx.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; ctx.lineTo(cx + Math.cos(a) * hs * .92, cy + Math.sin(a) * hs * .92); } ctx.closePath(); ctx.stroke();
      }
      ctx.restore();
    }
  } else {
    ctx.fillStyle = '#0b0a0d'; ctx.beginPath(); ctx.arc(0, 0, h * .42, 0, TAU); ctx.fill();
    ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, h * .5, '255,120,40', .35 + .2 * Math.random()); ctx.globalCompositeOperation = 'source-over';
  }
  for (const p of e.parts) if (!p.hidden || p.dead) drawModule(e, p, pulse);
}

