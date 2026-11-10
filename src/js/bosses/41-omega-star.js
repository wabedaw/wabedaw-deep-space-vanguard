/* ---------- Omega Star (space phase) ---------- */
function omegaGeo() { const PR = Math.min(W * .36, H * .42, 360); return { PR, cy: inset.t + PR * .18 + (W < 520 ? 46 : 0), ra: PR * 1.5, rb: PR * .36 }; }
function makeOmegaPlanet(R) {
  const S0 = Math.max(256, Math.min(1000, Math.ceil(R * 2 * Math.min(DPR, 1.5)))), c = document.createElement('canvas'); c.width = c.height = S0;
  const g = c.getContext('2d'), r = S0 / 2 - 2, u = r / 400; g.translate(S0 / 2, S0 / 2);
  g.save(); g.beginPath(); g.arc(0, 0, r, 0, TAU); g.clip();
  const base = g.createRadialGradient(-r * .35, r * .3, r * .1, 0, 0, r); base.addColorStop(0, '#b4b8c2'); base.addColorStop(.55, '#5c606c'); base.addColorStop(1, '#1a1c22');
  g.fillStyle = base; g.fillRect(-r, -r, r * 2, r * 2);
  for (let i = 0; i < 520; i++) { const x = rand(-r, r), y = rand(-r, r), w = rand(8, 40) * u, h = rand(4, 16) * u, k = rand(-18, 18); g.fillStyle = `rgba(${120 + k},${124 + k},${134 + k},${rand(.15, .4)})`; g.fillRect(x, y, w, h); }
  g.strokeStyle = 'rgba(20,22,28,.45)'; g.lineWidth = Math.max(1, u * 1.4);
  for (let i = -7; i <= 7; i++) { const yy = i * r / 8, hw = r * Math.sqrt(Math.max(0, 1 - (i / 8) ** 2)); g.beginPath(); g.ellipse(0, yy, hw, r * .03, 0, 0, TAU); g.stroke(); }
  for (let i = 1; i < 8; i++) { g.beginPath(); g.ellipse(0, 0, r * Math.cos(i / 8 * Math.PI / 2), r, 0, 0, TAU); g.stroke(); }
  g.fillStyle = '#121318'; g.fillRect(-r, -r * .08, r * 2, r * .1);
  g.fillStyle = 'rgba(160,165,175,.5)'; g.fillRect(-r, -r * .08, r * 2, r * .012); g.fillRect(-r, r * .008, r * 2, r * .012);
  const dx = -r * .42, dy = r * .38, dr = r * .26;
  const dg = g.createRadialGradient(dx + dr * .3, dy + dr * .3, dr * .1, dx, dy, dr); dg.addColorStop(0, '#2a2c32'); dg.addColorStop(.7, '#4a4e58'); dg.addColorStop(1, '#8a8e98');
  g.fillStyle = dg; g.beginPath(); g.arc(dx, dy, dr, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(30,32,38,.6)'; g.lineWidth = Math.max(1, u); for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; g.beginPath(); g.moveTo(dx + Math.cos(a) * dr * .2, dy + Math.sin(a) * dr * .2); g.lineTo(dx + Math.cos(a) * dr, dy + Math.sin(a) * dr); g.stroke(); }
  g.beginPath(); g.arc(dx, dy, dr * .55, 0, TAU); g.stroke();
  const sh = g.createRadialGradient(-r * .5, r * .62, 0, -r * .5, r * .62, r * 2.3);
  sh.addColorStop(0, 'rgba(255,245,230,.16)'); sh.addColorStop(.34, 'rgba(0,0,0,0)'); sh.addColorStop(.62, 'rgba(0,0,0,.5)'); sh.addColorStop(.85, 'rgba(0,0,0,.88)'); sh.addColorStop(1, 'rgba(0,0,0,.95)');
  g.fillStyle = sh; g.fillRect(-r, -r, r * 2, r * 2);
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 900; i++) { const x = rand(-r, r), y = rand(-r, r); if (x * x + y * y > r * r * .96) continue; const dark = clamp((x - y) / (r * 1.4) + .4, 0, 1); g.fillStyle = `rgba(255,${pick([200, 120, 90])},${pick([150, 90, 70])},${rand(.3, .85) * (.15 + .85 * dark)})`; g.fillRect(x, y, u * 1.6, u * 1.6); }
  for (let x = -r; x < r; x += u * 10) { g.fillStyle = `rgba(255,${100 + ((x * 7) % 80 | 0)},80,.55)`; g.fillRect(x, -r * .035, u * 2.4, u * 2.4); }
  g.restore();
  const at = g.createRadialGradient(0, 0, r * .94, 0, 0, r); at.addColorStop(0, 'rgba(255,120,90,0)'); at.addColorStop(1, 'rgba(255,140,110,.35)');
  g.fillStyle = at; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill();
  return c;
}
function omegaPart(type, extra) { return Object.assign({ type, r0: 22, r: 22, depth: 1, hp: 120, maxhp: 120, hitT: 0, aim: Math.PI / 2, dead: false, hidden: false, ox: 0, oy: 0, x: 0, y: 0, fireT: rand(1, 3), alt: 0 }, extra); }
function spawnOmega() {
  const G = omegaGeo(), lvl = 2.6;
  const b = { type: 'boss', kind: 'omega', n: 1, tier: 3, lvl, x: W / 2, t: 0, swayT: 0, hitT: 0, phase: 1, stage: 1, pi: 0, cur: null, hold: 0, entered: false,
    spin: 0, side: 1, alt: false, ring: 0, ph: 0, shield: true, shieldHit: 0, rot: 0, gateOpen: 0 };
  Object.assign(b, G); b.gr = clamp(G.PR * .15, 28, 54); b.hw = b.hh = b.r = b.gr; b.gox = 0; b.goy = G.PR * .8; b.dish = [-G.PR * .42, G.PR * .38];
  b.sprite = makeOmegaPlanet(G.PR);
  const R = clamp(W * .026, 17, 24), php = 95 * lvl;
  b.parts = []; for (let i = 0; i < 12; i++) b.parts.push(omegaPart(i % 3 === 0 ? 'laser' : i % 3 === 1 ? 'missile' : 'turret', { i, ring: i % 2, k: i >> 1, r0: R, r: R, hp: php, maxhp: php }));
  b.hp = b.maxhp = BOSSES.omega.hp; b.score = BOSSES.omega.score;
  b.y = -G.PR * 1.4;
  ships.push(b); S.boss = b;
}
function omegaGuns(e) {
  const P0 = e.PR, t = e.parts.filter(p => !p.dead && !p.hidden);
  return { main: e.dish, side: [[-P0 * .82, P0 * .5], [P0 * .82, P0 * .5]], top: [[-P0 * .6, P0 * .72], [P0 * .6, P0 * .72], [0, P0 * .95]], core: [e.gox, e.goy], turrets: t };
}
function omegaStage(e, st) {
  e.stage = st; clearBeamsOf(e); for (const p of e.parts) clearBeamsOf(p);
  const R = clamp(W * .03, 18, 28), lvl = e.lvl;
  if (st === 2) {
    e.parts = [.64, .82, .18, .36].map((a, i) => omegaPart('pylon', { i, ang: a * Math.PI, r0: R, r: R, hp: 300 * lvl, maxhp: 300 * lvl, fireT: 1.5 + i * .5 }));
    e.hangT = 2;
  } else if (st === 3) {
    waves.push({ x: e.x, y: e.y, r: e.PR, max: e.PR * 1.9, life: 1, maxl: 1, c: '255,170,140' }); waves.push({ x: e.x, y: e.y, r: e.PR * .8, max: e.PR * 1.5, life: .8, maxl: .8, c: '255,255,255' }); sfx.shieldBreak(); shake(18); e.shield = true;
    e.parts = [.25, .75, 1.25, 1.75].map((a, i) => omegaPart('turret', { i, ang: a * Math.PI, r0: R * .9, r: R * .9, hp: 170 * lvl, maxhp: 170 * lvl, fireT: 1 + i * .4 }));
  }
}
function updateOmega(e, dt, canFire, spK) {
  const G = omegaGeo(); Object.assign(e, G); e.goy = G.PR * .8; e.dish = [-G.PR * .42, G.PR * .38];
  if (!e.entered) { e.y += (G.cy - e.y) * Math.min(1, dt * .8); if (Math.abs(G.cy - e.y) < 4) { e.entered = true; S.toast = { txt: I18('摧毁双星环上的全部炮台', 'Destroy every emplacement on the twin rings'), t: 4 }; } }
  e.x = W / 2;
  const live = canFire && e.entered, L = e.lvl, s = spK * Math.min(1.45, .9 + .1 * L);
  e.rot += dt * .2;
  for (const p of e.parts) {
    if (p.type === 'pylon') { p.ox = Math.cos(p.ang) * e.PR * .9; p.oy = Math.sin(p.ang) * e.PR * .9; p.depth = 1; }
    else if (e.stage === 3) { p.ox = e.gox + Math.cos(p.ang) * e.gr * 2.2; p.oy = e.goy + Math.sin(p.ang) * e.gr * 2.2; p.depth = 1; }
    else {
      const dir = p.ring ? -1 : 1, tilt = p.ring ? -.17 : .17, th = e.rot * dir + p.k * TAU / 6 + (p.ring ? .5 : 0), lx = Math.cos(th) * e.ra, ly = Math.sin(th) * e.rb;
      p.ox = lx * Math.cos(tilt) - ly * Math.sin(tilt); p.oy = lx * Math.sin(tilt) + ly * Math.cos(tilt); const sn = Math.sin(th);
      p.depth = sn > 0 ? .25 + .75 * sn : .25; p.r = p.r0 * (.75 + .25 * Math.max(0, sn));
      p.hidden = sn < 0 && p.ox * p.ox + p.oy * p.oy < e.PR * e.PR * 1.02;
    }
    p.x = e.x + p.ox; p.y = e.y + p.oy;
    if (p.x < -p.r || p.x > W + p.r || p.y < -p.r) p.hidden = true; else if (p.type === 'pylon' || e.stage === 3) p.hidden = false;
    if (p.hidden && !p.dead) clearBeamsOf(p);
    if (p.dead || p.hidden) continue;
    let da = aimAng(p.x, p.y) - p.aim; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; p.aim += da * Math.min(1, dt * 4);
    if (!live) continue;
    p.fireT -= dt; if (p.fireT > 0) continue;
    if (p.y < 10) { p.fireT = .3; continue; }
    if (p.type === 'turret') { for (let k = 0; k < 3; k++) S.events.push({ t: k * .08, fn: () => { if (!p.dead && !p.hidden && P.alive) eFire('needle', p.x, p.y, aimAng(p.x, p.y), 400 * s, { silent: k > 0 }); } }); p.fireT = 1.7 / L; }
    else if (p.type === 'missile') { for (const o of [-1, 1]) eFire('homing', p.x + o * 8, p.y, Math.PI / 2 + o * .9, 150 * s, { seek: 2.6, turn: 2.2 + L * .3, silent: o > 0 }); p.fireT = 3.6 / L; }
    else if (p.type === 'laser') { addBeam({ owner: p, ox: 0, oy: 0, w: 11, charge: 1.15, fire: 1.1, mode: 'track', sweep: .25 * spK, c: '255,120,100', dmg: 14 }); p.fireT = 5 / L; }
    else if (p.type === 'pylon') { if (p.alt++ % 2) addBeam({ owner: p, ox: 0, oy: 0, w: 12, charge: 1.2, fire: 1.2, mode: 'track', sweep: .22 * spK, c: '255,200,120', dmg: 15 }); else for (let k = -2; k <= 2; k++) eFire('orb', p.x, p.y, aimAng(p.x, p.y) + k * .16, 210 * s, { c: '255,170,110', silent: k !== 0 }); p.fireT = 2.6 / L; }
  }
  if (live && e.stage === 2) {
    e.hangT -= dt;
    if (e.hangT <= 0 && ships.length < 26) { for (let k = 0; k < 3; k++) { const a = rand(.15, .85) * Math.PI, x = e.x + Math.cos(a) * e.PR * .95, y = e.y + Math.sin(a) * e.PR * .95; if (y < 0) continue; const w = spawnShip(pick(['wasp', 'glint', 'raider']), x, y); w.bx = w.x; if (w.type === 'raider') w.ty = y + 140; } e.hangT = 3 / Math.min(1.6, L * .6); }
  }
  if (e.entered && !e.dying) {
    if (e.stage === 1 && !e.parts.some(p => !p.dead)) omegaStage(e, 2);
    else if (e.stage === 2 && !e.parts.some(p => !p.dead)) omegaStage(e, 3);
    else if (e.stage === 3 && e.shield && !e.parts.some(p => !p.dead)) { e.shield = false; S.toast = { txt: I18('门锁全毁 · 攻击极地大门核心！', 'Locks destroyed · hit the polar gate core!'), t: 3 }; sfx.shieldBreak(); shake(10); }
  }
  e.gateOpen += ((e.stage === 3 ? e.parts.filter(p => p.dead).length / 4 * .55 : 0) + (e.dying ? 1 : 0) - e.gateOpen) * Math.min(1, dt * 2);
}
function omegaDown(e) {
  e.dying = true; e.dyingT = 0; S.boss = null; S.kills++; e.shield = false;
  clearBeamsOf(e); for (const p of e.parts) { clearBeamsOf(p); p.dead = true; }
  const gx = e.x + e.gox, gy = e.y + e.goy;
  for (let i = 0; i < 14; i++) S.events.push({ t: i * .12, fn: () => { const a = rand(0, TAU), d = rand(.5, 2) * e.gr; explode(gx + Math.cos(a) * d, gy + Math.sin(a) * d, rand(30, 60), i % 2 ? FIRE : PLAS); sfx.boom(50, gx, 'ship'); } });
  S.events.push({ t: 1.7, fn: () => { explode(gx, gy, 140, FIRE, { debris: '120,120,130' }); sfx.boom(180, gx, 'huge'); shake(26); S.wflash = .7; ebul.length = 0; clearBeams(); addScore(e.score, gx, gy); for (const s2 of ships) if (s2 !== e && !s2.dead) killShip(s2, true); floatText(gx, gy - 70, I18('极地大门洞开', 'POLAR GATE OPEN'), FLARE, true); } });
  S.events.push({ t: 3.6, fn: () => beginTransition('dive') });
}
function updateOmegaDying(e, dt) { e.dyingT += dt; updateOmega(e, dt, false, 1); if (Math.random() < .3 && parts.length < 1300) sparks(e.x + e.gox + rand(-e.gr, e.gr), e.y + e.goy + rand(-e.gr, e.gr), 2, FIRE); }
function drawOmega(e, pulse) {
  const PR = e.PR, live = !e.dying, C = e.stage === 3 ? '255,90,70' : OMEGA_C;
  ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, PR * 1.35, '255,120,90', .18); ctx.globalCompositeOperation = 'source-over';
  const ringPath = (k, front) => { const tilt = k ? -.17 : .17; ctx.save(); ctx.rotate(tilt); ctx.beginPath(); ctx.ellipse(0, 0, e.ra, e.rb, 0, front ? 0 : Math.PI, front ? Math.PI : TAU); ctx.restore(); };
  const RW = clamp(W * .014, 8, 15);
  const drawRings = front => {
    if (e.stage > 1 && !front) return;
    for (const k of [0, 1]) {
      ringPath(k, front); ctx.strokeStyle = front ? '#2a2c34' : '#18191e'; ctx.lineWidth = RW + 4; ctx.stroke();
      ringPath(k, front); ctx.strokeStyle = front ? '#5a5e6a' : '#34363e'; ctx.lineWidth = RW; ctx.stroke();
      ringPath(k, front); ctx.setLineDash([4, 16]); ctx.lineDashOffset = (k ? 1 : -1) * e.rot * e.ra; ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = e.stage === 1 && live ? `rgba(${OMEGA_C},${front ? .85 : .35})` : 'rgba(120,120,130,.3)'; ctx.lineWidth = RW * .25; ctx.stroke();
      ctx.setLineDash([]); ctx.lineDashOffset = 0; ctx.globalCompositeOperation = 'source-over';
    }
    for (const p of e.parts) if (e.stage === 1 && (p.depth > .25) === front && (!p.hidden || p.dead)) drawModule(e, p, pulse);
  };
  drawRings(false);
  ctx.drawImage(e.sprite, -PR, -PR, PR * 2, PR * 2);
  const [dx, dy] = e.dish, ch = beams.some(b => b.owner === e && !b.firing), fr = beams.some(b => b.owner === e && b.firing);
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(dx, dy, PR * .3, '140,255,150', ch ? .5 + .4 * Math.sin(S.t * 20) : fr ? .9 : .12);
  if (ch || fr) for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + S.t * 2; ctx.strokeStyle = 'rgba(160,255,170,.55)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(dx + Math.cos(a) * PR * .26, dy + Math.sin(a) * PR * .26); ctx.lineTo(dx, dy); ctx.stroke(); }
  ctx.globalCompositeOperation = 'source-over';
  const gx = e.gox, gy = e.goy, gr = e.gr, op = clamp(e.gateOpen, 0, 1);
  ctx.fillStyle = '#16171c'; ctx.beginPath(); ctx.arc(gx, gy, gr * 1.55, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#6a6e7a'; ctx.lineWidth = gr * .22; ctx.beginPath(); ctx.arc(gx, gy, gr * 1.38, 0, TAU); ctx.stroke();
  const cg = ctx.createRadialGradient(gx, gy, 2, gx, gy, gr * 1.2); cg.addColorStop(0, '#fff2d8'); cg.addColorStop(.35, `rgb(${C})`); cg.addColorStop(1, '#200606');
  ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(gx, gy, gr * 1.2, 0, TAU); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(gx, gy, gr * 1.25, 0, TAU); ctx.clip();
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + op * 1.2; ctx.save(); ctx.translate(gx, gy); ctx.rotate(a); ctx.fillStyle = i % 2 ? '#5a5e6a' : '#4a4e58'; ctx.beginPath(); ctx.moveTo(gr * op * 1.1, 0); ctx.lineTo(gr * 1.4, -gr * .2); ctx.lineTo(gr * 1.4, gr * 1.25); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(20,20,26,.6)'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore(); }
  ctx.restore();
  ctx.globalCompositeOperation = 'lighter'; drawGlow(gx, gy, gr * (1.4 + op), C, .35 + .3 * op + .15 * pulse); ctx.globalCompositeOperation = 'source-over';
  if (e.stage === 3 && e.shield && live) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(255,200,150,${.4 + .3 * Math.sin(S.t * 4) + Math.max(0, e.shieldHit) * 3})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(gx, gy, gr * 1.5, 0, TAU); ctx.stroke(); ctx.restore(); }
  if (e.stage <= 2 && live) {
    const fl = .5 + .5 * Math.sin(S.t * 2.4), hit = Math.max(0, e.shieldHit || 0) * 2;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.beginPath(); ctx.arc(0, 0, PR * 1.07, 0, TAU);
    const sg = ctx.createRadialGradient(0, 0, PR * .9, 0, 0, PR * 1.07); sg.addColorStop(0, 'rgba(255,140,110,0)'); sg.addColorStop(1, `rgba(255,150,120,${.16 + .08 * fl + hit * .2})`);
    ctx.fillStyle = sg; ctx.fill(); ctx.strokeStyle = `rgba(255,190,160,${.35 + .2 * fl})`; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
  }
  for (const p of e.parts) if (p.type === 'pylon') {
    const px = p.ox, py = p.oy, a = p.ang, nx = Math.cos(a), ny = Math.sin(a);
    if (p.dead) { ctx.globalCompositeOperation = 'lighter'; drawGlow(px, py, 16, '255,120,40', .35 + .2 * Math.random()); ctx.globalCompositeOperation = 'source-over'; continue; }
    ctx.strokeStyle = '#7a7e8a'; ctx.lineWidth = p.r * .6; ctx.beginPath(); ctx.moveTo(px - nx * p.r, py - ny * p.r); ctx.lineTo(px + nx * p.r * 1.6, py + ny * p.r * 1.6); ctx.stroke();
    ctx.fillStyle = '#c8ccd6'; ctx.beginPath(); ctx.arc(px + nx * p.r * 1.6, py + ny * p.r * 1.6, p.r * .55, 0, TAU); ctx.fill();
    ctx.globalCompositeOperation = 'lighter'; drawGlow(px + nx * p.r * 1.6, py + ny * p.r * 1.6, p.r * 1.3, '255,200,140', .6 + .3 * pulse);
    if (e.stage === 2) { ctx.strokeStyle = 'rgba(255,190,150,.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px + nx * p.r * 1.6, py + ny * p.r * 1.6); ctx.lineTo(nx * PR * 1.07, ny * PR * 1.07); ctx.stroke(); }
    if (p.hitT > 0) drawGlow(px, py, p.r * 1.5, WHITE, p.hitT * 6);
    ctx.globalCompositeOperation = 'source-over';
    if (p.hp < p.maxhp) drawMiniBar(e.x + px, e.y + py - p.r * 2.4, 40, p.hp / p.maxhp, '255,200,140');
  }
  if (e.stage === 3) for (const p of e.parts) drawModule(e, p, pulse);
  drawRings(true);
}

