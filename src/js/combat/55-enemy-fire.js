/* ---------- enemy fire ---------- */
const EDMG = { orb: 12, needle: 10, shell: 24, homing: 16, shrap: 8, wave: 12, rocket: 14, bomb: 22 };
const ECOL = { orb: PLASMA, needle: '255,120,235', shell: FLARE, homing: '170,255,120', shrap: FLARE, wave: '190,130,255', rocket: '255,200,120', bomb: '255,90,80' };
const ERAD = { orb: 5, needle: 3, shell: 7, homing: 6, shrap: 3.5, wave: 5, rocket: 4, bomb: 6 };
function eFire(k, x, y, ang, sp, o = {}) {
  const b = { k, x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, c: o.c || ECOL[k], r: o.r || ERAD[k], life: o.life || 9, t: 0 };
  b.dmg = o.dmg || (k === 'orb' && b.r > 8 ? 22 : EDMG[k]);
  if (k === 'shell') { b.fuse = o.fuse ?? 1.6; b.n = o.n || 10; }
  if (k === 'homing') { b.seek = o.seek ?? 2.6; b.sp = sp; b.turn = o.turn || 2.4; b.mis = !!o.mis; if (b.mis) b.c = o.c || '255,235,210'; }
  if (k === 'rocket') { b.acc = o.acc || 300; b.max = o.max || 520; }
  if (k === 'wave') { b.bx = x; b.by = y; b.amp = o.amp || 26; b.f = o.f || 7; b.ph = o.ph || 0; }
  ebul.push(b);
  if (!o.silent) sfx.eshot(k, x);
  return b;
}
function eShot(x, y, ang, sp, c = PLASMA, r = 5) { return eFire('orb', x, y, ang, sp, { c, r, silent: false }); }
const aimAng = (x, y) => Math.atan2(P.y - y, P.x - x);
function shellBurst(b) {
  explode(b.x, b.y, 22, FIRE); sfx.boom(24, b.x, 'missile');
  const o = rand(0, TAU), sp = 150 * Math.min(1.5, Math.sqrt(diff()));
  for (let i = 0; i < b.n; i++) eFire('shrap', b.x, b.y, o + i / b.n * TAU, sp, { silent: true });
}
function updateEnemyBullets(dt) {
  const irons = S.side ? null : rocks.filter(k => k.iron && !k.dead && k.y > -k.r);
  for (const b of ebul) {
    if (irons && irons.length && !b.dead) { let hit = false; for (const k of irons) { const dx = b.x - k.x, dy = b.y - k.y; if (dx * dx + dy * dy < (k.r * .88) ** 2) { hit = true; break; } } if (hit) { b.dead = true; sparks(b.x, b.y, 3, ['255,255,255', b.c || '255,200,160'], -Math.PI / 2, 2.4); if (b.k === 'shell' || b.k === 'rocket' || b.k === 'bomb' || b.mis) explode(b.x, b.y, 12, FIRE); continue; } }
    b.t += dt;
    if (b.k === 'homing' && b.t < b.seek && P.alive && !P.cap) {
      let a = Math.atan2(b.vy, b.vx), da = aimAng(b.x, b.y) - a;
      while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
      a += clamp(da, -b.turn * dt, b.turn * dt);
      const sp = Math.min(b.sp * 1.6, Math.hypot(b.vx, b.vy) + 70 * dt);
      b.vx = Math.cos(a) * sp; b.vy = Math.sin(a) * sp;
      if (parts.length < 1500 && Math.random() < .6) parts.push({ k: 'ember', x: b.x, y: b.y, vx: -b.vx * .1, vy: -b.vy * .1, life: .3, max: .3, c: b.c, r: 1.6 });
    }
    if (b.k === 'rocket') { const a = Math.atan2(b.vy, b.vx), v = Math.min(b.max, Math.hypot(b.vx, b.vy) + b.acc * dt); b.vx = Math.cos(a) * v; b.vy = Math.sin(a) * v; }
    if (b.k === 'bomb') b.vy += 320 * dt;
    if ((b.k === 'rocket' || b.mis) && parts.length < 1500) parts.push({ k: 'trail', x: b.x - b.vx * .02, y: b.y - b.vy * .02, vx: rand(-8, 8), vy: rand(-8, 8), life: .5, max: .5, r: 2.2 });
    gravityOn(b, dt, b.k === 'shell' ? .5 : .9);
    if (b.k === 'wave') {
      b.bx += b.vx * dt; b.by += b.vy * dt;
      const s = Math.hypot(b.vx, b.vy) || 1, off = Math.sin(b.t * b.f + b.ph) * b.amp;
      b.x = b.bx - b.vy / s * off; b.y = b.by + b.vx / s * off;
    } else { b.x += b.vx * dt; b.y += b.vy * dt; }
    b.life -= dt;
    if (b.k === 'shell') {
      b.fuse -= dt;
      if (parts.length < 1500) parts.push({ k: 'trail', x: b.x, y: b.y, vx: rand(-8, 8), vy: rand(-8, 8), life: .45, max: .45, r: 2.5 });
      if (b.fuse <= 0) { b.dead = true; shellBurst(b); continue; }
    }
    if (S.side && (GW || IW) && b.x > -10 && b.x < W + 10 && (b.y > solidTopAt(b.x) || (IW && b.y < ceilAt(b.x)))) {
      b.dead = true;
      if (GW && wetAt(S.wx + b.x) && b.y < waterY() + 30) splash(b.x, 5);
      if (b.k === 'shell') shellBurst(b); else if (b.k === 'bomb' || b.k === 'rocket' || b.mis) { explode(b.x, b.y, 18, FIRE, { smoke: '60,52,48' }); sfx.boom(18, b.x, 'missile'); }
      else if (Math.random() < .3) sparks(b.x, b.y, 2, DUST, -Math.PI / 2, 1.6);
      continue;
    }
    if (b.life <= 0 || b.y > H + 30 || b.y < -90 || b.x < -40 || b.x > W + 40 || insideHole(b, .9)) b.dead = true;
  }
}

