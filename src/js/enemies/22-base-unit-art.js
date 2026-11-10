/* ---------- base unit art (mounted on ceiling / floor) ---------- */
function drawBaseUnit(e, w, h, pulse) {
  const s = e.att === 'c' ? -1 : 1;
  ctx.fillStyle = '#1b2029'; ctx.fillRect(-w * 1.1, s > 0 ? h * .55 : -h * 1.05, w * 2.2, h * .5);
  if (e.type === 'tur') {
    ctx.beginPath(); for (const [i, [x, y]] of [[-w, h * .6], [-w * .7, -h * .1], [w * .7, -h * .1], [w, h * .6]].entries()) i ? ctx.lineTo(x, y * s) : ctx.moveTo(x, y * s); ctx.closePath();
    ctx.fillStyle = metalGrad(-h, h, '#7e8696', '#3e4554', '#1a1d25'); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.save(); ctx.translate(0, -s * h * .25); ctx.rotate(e.aim); ctx.fillStyle = '#1e2129'; ctx.fillRect(0, -4, w * 1.15, 3); ctx.fillRect(0, 1, w * 1.15, 3); ctx.restore();
    ctx.fillStyle = metalGrad(-h, h, '#9aa2b2', '#4a5262', '#262a33'); ctx.beginPath(); ctx.arc(0, -s * h * .25, w * .46, 0, TAU); ctx.fill();
    ctx.globalCompositeOperation = 'lighter'; drawGlow(Math.cos(e.aim) * w * .2, -s * h * .25 + Math.sin(e.aim) * w * .2, 7, '255,90,80', pulse);
  } else if (e.type === 'pod') {
    const ready = e.fireT < .7;
    ctx.fillStyle = metalGrad(-h, h, '#8a94a6', '#465061', '#1d222b'); ctx.fillRect(-w, -h * .7, w * 2, h * 1.4); ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = 1; ctx.strokeRect(-w, -h * .7, w * 2, h * 1.4);
    ctx.fillStyle = '#c08a40'; ctx.fillRect(-w, s > 0 ? h * .45 : -h * .6, w * 2, h * .15);
    for (let i = 0; i < 3; i++) { ctx.fillStyle = '#0f1216'; ctx.beginPath(); ctx.arc(-w * .6 + i * w * .6, -s * h * .12, h * .3, 0, TAU); ctx.fill(); }
    ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) drawGlow(-w * .6 + i * w * .6, -s * h * .12, ready ? 8 : 4, '170,255,120', ready ? .9 : .45);
  } else if (e.type === 'emit') {
    const ch = beams.some(b => b.owner === e);
    ctx.fillStyle = '#2c323e'; ctx.fillRect(-3, s > 0 ? 0 : -h * .6, 6, h * .6);
    ctx.save(); ctx.rotate(e.aim); ctx.beginPath(); ctx.moveTo(w * .95, 0); ctx.lineTo(0, -h * .55); ctx.lineTo(-w * .5, 0); ctx.lineTo(0, h * .55); ctx.closePath();
    ctx.fillStyle = metalGrad(-h, h, '#9aa4b8', '#4a5466', '#1c2029'); ctx.fill(); ctx.strokeStyle = 'rgba(120,235,255,.55)'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
    ctx.globalCompositeOperation = 'lighter'; drawGlow(Math.cos(e.aim) * w * .6, Math.sin(e.aim) * w * .6, ch ? 16 : 7, '120,235,255', ch ? 1 : .6 * pulse);
  } else {
    const o = clamp(e.open || 0, 0, 1);
    ctx.fillStyle = metalGrad(-h, h, '#7a8192', '#414755', '#1a1c23'); ctx.fillRect(-w, -h * .6, w * 2, h * 1.2);
    ctx.fillStyle = '#0b0c10'; ctx.fillRect(-w * .75, -h * .35, w * 1.5, h * .7);
    ctx.globalCompositeOperation = 'lighter'; drawGlow(0, 0, w * .7, '255,80,60', .25 + o * .7); ctx.globalCompositeOperation = 'source-over';
    const dw = w * .75 * (1 - Math.min(1, o * 1.4) * .85); ctx.fillStyle = '#3a404c'; ctx.fillRect(-w * .75, -h * .35, dw, h * .7); ctx.fillRect(w * .75 - dw, -h * .35, dw, h * .7);
    hazStripes(-w, w, s > 0 ? -h * .6 : h * .35, h * .25);
  }
}

/* ===================== THEME B (stages 4-6, 10-12 …): hive faction · ember world · bio-lab ===================== */
const themeB = () => themeOf(stageOf(S.sector)) === 2;
const HIVE = '170,255,120', HIVE2 = '200,120,255';
const HIVE_TYPES = new Set(['wasp', 'mantis', 'brood', 'prism', 'urchin']);
Object.assign(SHIPDEF, { wasp: { r: 14, hp: 3, score: 120 }, mantis: { r: 26, hp: 14, score: 320 }, brood: { r: 44, hp: 55, score: 900 }, prism: { r: 20, hp: 16, score: 420 }, urchin: { r: 16, hp: 6, score: 160 } });
const BOSS_ORDER_B = ['scarab', 'medusa', 'prismarch'];

function initHiveShip(e, d) {
  const t = e.type;
  if (t === 'wasp') { e.vy = rand(150, 200) * Math.min(1.4, Math.sqrt(d)); e.state = 0; e.diveT = rand(.8, 2.2); }
  else if (t === 'mantis') { e.ty = inset.t + rand(80, Math.max(100, H * .32)); e.state = 0; e.vx = rand(110, 150) * (rnd() < .5 ? -1 : 1); }
  else if (t === 'brood') { e.ty = inset.t + rand(90, Math.max(110, H * .22)); e.state = 0; e.spawnT = 1.6; e.open = 0; }
  else if (t === 'prism') { e.ty = inset.t + rand(100, Math.max(120, H * .35)); e.state = 0; e.tx = e.x; e.shots = 0; e.spin = 0; }
  else if (t === 'urchin') { e.vy = rand(45, 75); e.vx = rand(-20, 20); e.spin = rand(0, TAU); }
}
function urchinBurst(e) {
  const sp = Math.min(1.45, Math.sqrt(diff()));
  for (let i = 0; i < 12; i++) eFire('needle', e.x, e.y, i / 12 * TAU + (e.spin || 0), 170 * sp, { silent: i > 0 });
  explode(e.x, e.y, 26, ['255,120,230', HIVE2, WHITE]);
}
function updateHive(e, dt, canFire, spK, d) {
  switch (e.type) {
    case 'wasp': {
      if (e.state === 0) {
        e.y += e.vy * dt; e.x = clamp(e.bx + Math.sin(e.t * 2.4 + e.ph) * 40, 16, W - 16); e.diveT -= dt;
        if (e.diveT <= 0 && e.y > 40 && canFire) { e.state = 1; e.chargeT = .45; }
        if (e.y > H + 40) e.dead = true;
      } else if (e.state === 1) {
        e.chargeT -= dt; e.aim = aimAng(e.x, e.y);
        if (e.chargeT <= 0) { e.vx = Math.cos(e.aim) * 430 * spK; e.vy = Math.sin(e.aim) * 430 * spK; e.state = 2; if (canFire) eFire('needle', e.x, e.y, e.aim, 380 * spK, { silent: true }); }
      } else {
        e.x += e.vx * dt; e.y += e.vy * dt; e.aim = Math.atan2(e.vy, e.vx);
        if (parts.length < 1500) parts.push({ k: 'ember', x: e.x, y: e.y, vx: -e.vx * .1, vy: -e.vy * .1, life: .25, max: .25, c: HIVE, r: 1.8 });
        if (e.y > H + 40 || e.y < -60 || e.x < -60 || e.x > W + 60) e.dead = true;
      }
      break;
    }
    case 'mantis': {
      if (e.state === 0) { e.y += (e.ty - e.y) * Math.min(1, dt * 2); if (Math.abs(e.ty - e.y) < 6) e.state = 1; }
      else if (e.state === 1) {
        e.x += e.vx * dt; if (e.x < 40 || e.x > W - 40) { e.vx *= -1; e.x = clamp(e.x, 40, W - 40); }
        e.fireT -= dt;
        if (canFire && e.fireT <= 0) {
          const a = aimAng(e.x, e.y);
          if (e.alt % 2 === 0) for (let i = -2; i <= 2; i++) eFire('wave', e.x, e.y + 14, a + i * .2, 180 * spK, { amp: 14, f: 9, silent: i !== 0 });
          else for (const s of [-1, 1]) eFire('needle', e.x + s * 16, e.y + 10, a + s * .05, 400 * spK, { silent: s > 0 });
          e.alt++; e.fireT = 1.5 / Math.sqrt(d);
        }
        if (e.t > 13) e.state = 2;
      } else { e.y += 240 * dt; if (e.y > H + 50) e.dead = true; }
      break;
    }
    case 'brood': {
      e.open = Math.max(0, e.open - dt);
      if (e.state === 0) { e.y += (e.ty - e.y) * Math.min(1, dt * 1.1); if (Math.abs(e.ty - e.y) < 5) e.state = 1; }
      else if (e.state === 1) {
        e.x = clamp(e.x + Math.sin(e.t * .6) * 35 * dt, 60, W - 60);
        e.spawnT -= dt; e.fireT -= dt;
        if (canFire && e.spawnT <= 0) {
          e.open = 1.2;
          for (let k = 0; k < 3; k++) S.events.push({ t: .2 + k * .25, fn: () => { if (!e.dead && ships.length < 40) { const w = spawnShip('wasp', e.x + (k - 1) * 22, e.y + e.r * .6); w.vy = 120; w.diveT = rand(.5, 1.4); } } });
          e.spawnT = 4.2 / Math.sqrt(d);
        }
        if (canFire && e.fireT <= 0) { const o = e.t * 1.3; for (let i = 0; i < 10; i++) eShot(e.x, e.y + 10, o + i / 10 * TAU, 140 * spK, HIVE, 6); e.fireT = 2.6 / Math.sqrt(d); }
        if (e.t > 24) e.state = 2;
      } else { e.y += 80 * dt; if (e.y > H + 80) e.dead = true; }
      break;
    }
    case 'prism': {
      const mine = beams.some(b => b.owner === e);
      if (e.state === 0) { e.y += (e.ty - e.y) * Math.min(1, dt * 1.6); if (Math.abs(e.ty - e.y) < 5) { e.state = 1; e.fireT = .8; } }
      else if (e.state === 1) {
        if (!mine) { e.x += (e.tx - e.x) * Math.min(1, dt * 1.2); e.fireT -= dt; }
        if (canFire && !mine && e.fireT <= 0) {
          if (e.shots >= 3) e.state = 2;
          else {
            const a = aimAng(e.x, e.y);
            addBeam({ owner: e, ox: 0, oy: 10, w: 9, charge: 1.1, fire: .8, mode: 'track', sweep: .18 * spK, c: '180,255,200', dmg: 12 });
            for (const o of [-.42, .42]) addBeam({ owner: e, ox: 0, oy: 10, w: 6, charge: 1.1, fire: .8, mode: 'osc', base: a + o, amp: 0, f: 1, c: '180,255,200', dmg: 9, quiet: true });
            e.shots++; e.fireT = 1.4; e.tx = clamp(P.x + rand(-180, 180), 40, W - 40);
          }
        }
      } else { e.y -= 150 * dt; if (e.y < -70) e.dead = true; }
      e.spin += dt * (mine ? 4 : 1.2);
      break;
    }
    case 'urchin': {
      e.y += e.vy * dt; e.x += (e.vx + Math.sign(P.x - e.x) * 18) * dt; e.spin += dt * 1.5;
      if (canFire && Math.hypot(P.x - e.x, P.y - e.y) < 80) { e.dead = true; e.fcount = 1; S.kills++; urchinBurst(e); }
      if (e.y > H + 40) e.dead = true;
      break;
    }
  }
}
function spawnWaveB() {
  const r = rnd(), lv = levelOf(S.sector);
  if (lv >= 2 && r < .16) spawnShip('brood', rand(W * .2, W * .8));
  else if (r < .32) spawnShip('prism', rand(W * .15, W * .85));
  else if (r < .5) { const n = lv >= 4 ? 2 : 1; for (let i = 0; i < n; i++) spawnShip('mantis', rand(W * .15, W * .85), -40 - i * 60); }
  else if (r < .62) { const n = 3 + Math.min(3, lv >> 1); for (let i = 0; i < n; i++) spawnShip('urchin', rand(40, W - 40), -30 - i * 70); }
  else {
    const n = 5 + Math.min(4, lv >> 1), cx = rand(W * .25, W * .75), arc = rnd() < .5;
    for (let i = 0; i < n; i++) { const m = i - (n - 1) / 2; spawnShip('wasp', clamp(cx + m * 34, 20, W - 20), -30 - (arc ? m * m * 6 : Math.abs(m) * 30)); }
  }
}

