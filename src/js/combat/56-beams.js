/* ---------- beams ---------- */
function addBeam(o) {
  const b = Object.assign({ owner: null, ox: 0, oy: 0, ang: Math.PI / 2, w: 14, charge: 1.1, fire: 1.2, t: 0, mode: 'track', sweep: .35, c: '255,70,110',
    amp: 0, f: 1, base: 0, spin: 0, dmg: 14, snd: null, firing: false, quiet: false }, o);
  b.x = (b.owner ? b.owner.x : 0) + b.ox; b.y = (b.owner ? b.owner.y : 0) + b.oy;
  if (b.mode === 'track' && P.alive) b.ang = aimAng(b.x, b.y);
  if (b.mode === 'osc') b.ang = b.base;
  if (!b.quiet) b.snd = sfx.beamCharge(b.charge, b.x, b.w > 18);
  beams.push(b); return b;
}
function stopBeam(b) { b.dead = true; if (b.snd) { b.snd.stop(); b.snd = null; } }
function clearBeams() { for (const b of beams) stopBeam(b); beams.length = 0; clearLances(); }
function clearBeamsOf(o) { for (const b of beams) if (b.owner === o) stopBeam(b); for (const l of lances) if (l.owner === o) stopLance(l); }
function updateBeams(dt) {
  for (const b of beams) {
    if (b.dead) continue;
    if (b.owner && (b.owner.dead || b.owner.cap || b.owner.hidden || b.owner.dying)) { stopBeam(b); continue; }
    b.t += dt;
    if (b.owner) { b.x = b.owner.x + b.ox; b.y = b.owner.y + b.oy; }
    const ft = b.t - b.charge;
    if (b.mode === 'track' && P.alive && !P.cap) {
      let da = aimAng(b.x, b.y) - b.ang; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
      const rate = ft < 0 ? (b.t < b.charge * .7 ? 6 : 0) : b.sweep;
      b.ang += clamp(da, -rate * dt, rate * dt);
    } else if (b.mode === 'osc') b.ang = b.base + Math.sin(Math.max(0, ft) * b.f) * b.amp;
    else if (b.mode === 'spin' && ft > 0) b.ang += b.spin * dt;
    if (ft >= 0 && !b.firing) { b.firing = true; if (b.snd) b.snd.stop(); b.snd = b.quiet ? null : sfx.beamFire(b.fire, b.x, b.w > 18); shake(b.w > 18 ? 6 : 3); }
    if (ft > b.fire) { stopBeam(b); continue; }
    if (b.firing) {
      const cx = Math.cos(b.ang), cy = Math.sin(b.ang);
      if (P.alive && !P.cap) {
        const dx = P.x - b.x, dy = P.y - b.y, along = dx * cx + dy * cy;
        if (along > 0 && Math.abs(-dx * cy + dy * cx) < b.w * .5 + 9) { if (P.inv <= 0) sparks(P.x, P.y, 6, ['255,255,255', b.c]); hurt(b.dmg); }
      }
      for (const k of rocks) {
        if (k.dead || k.giant || k.iron) continue;
        const dx = k.x - b.x, dy = k.y - b.y;
        if (dx * cx + dy * cy > 0 && Math.abs(-dx * cy + dy * cx) < b.w * .5 + k.r * .7) { k.dead = true; explode(k.x, k.y, k.r * .7, DUST); }
      }
    } else if (parts.length < 1500 && Math.random() < .6) {
      const a = rand(0, TAU), rr = b.w * 2.6;
      parts.push({ k: 'spark', x: b.x + Math.cos(a) * rr, y: b.y + Math.sin(a) * rr, vx: -Math.cos(a) * rr * 5, vy: -Math.sin(a) * rr * 5, life: .18, max: .18, c: pick([b.c, '255,255,255']), w: 1.2 });
    }
  }
  sweep(beams);
}

