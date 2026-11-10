/* ---------- update ---------- */
function gravityOn(o, dt, k) {
  for (const h of holes) {
    const dx = h.x - o.x, dy = h.y - o.y, d2 = dx * dx + dy * dy;
    if (d2 > h.R * h.R) continue;
    const d = Math.sqrt(d2) || 1;
    const a = k * h.G / Math.max(d2, h.r * h.r * .8);
    o.vx += dx / d * a * dt; o.vy += dy / d * a * dt;
  }
}
function insideHole(o, f = 1) {
  for (const h of holes) { const dx = h.x - o.x, dy = h.y - o.y; if (dx * dx + dy * dy < (h.r * f) ** 2) return h; }
  return null;
}

function update(dt) {
  S.t += dt;
  const playing = S.mode === 'play';
  MUS.setMode(S.mode === 'menu' || S.mode === 'launch' ? 'menu' : (S.mode === 'over' || !P.alive) ? 'over' : (S.boss || S.bossPending) ? 'boss' : 'play');
  const spT = playing && P.alive ? 1 + clamp(-P.vy / 420, 0, 1) * .6 : S.mode === 'launch' ? 1.6 + 4.5 * clamp(S.launchT / LAUNCH_DUR, 0, 1) : S.mode === 'menu' ? 1.5 : 1;
  S.speedK += (spT - S.speedK) * Math.min(1, dt * 3);
  if (IW) updateBaseWorld(dt); else if (S.side) updateSideWorld(dt); else updateBackground(dt, S.speedK * (S.mode === 'play' && !S.trans ? (themeC() ? 1.6 : 1) * (S.flow || 1) : 1));

  // scheduled events
  for (let i = S.events.length - 1; i >= 0; i--) { const ev = S.events[i]; ev.t -= dt; if (ev.t <= 0) { S.events.splice(i, 1); ev.fn(); } }

  P.beamOn = false; P.ultOn = false;
  if (playing) {
    if (S.trans) updateTransition(dt);
    else { if (P.alive) updatePlayer(dt); updateFlow(dt); updateUlt(dt); updateTut(dt); if (stageKind(stageOf(S.sector)) === 'final') finalLogic(dt); else if (IW) baseSpawnLogic(dt); else if (S.side) sideSpawnLogic(dt); else spawnLogic(dt); }
    S.dist += dt * .021 * S.speedK;
  } else if (S.mode === 'menu' || S.mode === 'launch') {
    S.tRock -= dt;
    if (S.tRock <= 0) { spawnRock({ vy: rand(40, 90) }); S.tRock = rand(.9, 1.8); }
    if (!holes.length) spawnHole(W * (W > 700 ? .8 : .86), H * (W > 700 ? .32 : .33), 0);
    heroExhaust();
    if (S.mode === 'launch') { S.launchT += dt; if (S.launchT >= LAUNCH_DUR) { menuEl.classList.remove('leaving'); startGame(); S.wflash = 1; } }
  }

  // black holes
  for (let i = holes.length - 1; i >= 0; i--) {
    const h = holes[i]; h.t += dt; h.y += h.vy * dt;
    h.x += Math.sin(h.t * .4) * 8 * dt;
    for (const p of h.disk) p.a += p.w * dt;
    for (const p of h.flow) { const w = .25 + 3000 / (p.rad * p.rad); p.a += h.spin * w * dt; p.rad -= (18 + 5200 / p.rad) * dt; if (p.rad < h.r * 1.35) { p.rad = rand(h.cap * .85, h.R); p.a = rand(0, TAU); } }
    if (h.y - h.R * .4 > H && !(P.cap && P.cap.h === h)) holes.splice(i, 1);
  }

  // rocks
  for (const k of rocks) {
    gravityOn(k, dt, k.giant ? .05 : .55);
    const kf = S.side || S.mode !== 'play' ? 1 : S.flow || 1; k.x += k.vx * dt; k.y += k.vy * dt * kf; k.rot += k.vr * dt; k.hitT -= dt;
    if (!k.giant) { const h = insideHole(k, 1.15); if (h) killRock(k, h); }
    if (k.iron && !S.ironTip && k.y > 30 && S.mode === 'play') { S.ironTip = true; S.toast = { txt: I18('玄铁陨石无法击碎 · 可以当作掩体', 'Iron meteors are indestructible · use them as cover'), t: 3.8 }; }
    if (k.y - k.r > H + 40 || k.x < -k.r - 120 || k.x > W + k.r + 120 || k.y < -k.r - 400) k.dead = true;
  }

  // ships
  for (const e of ships) { updateShip(e, dt); }

  // lasers
  for (const l of lasers) {
    gravityOn(l, dt, 1);
    l.x += l.vx * dt; l.y += l.vy * dt; l.life -= dt;
    if (l.life <= 0 || l.y < -40 || l.y > H + 40 || l.x < -40 || l.x > W + 40 || insideHole(l, .9)) l.dead = true;
    else if (S.side && (GW || IW) && (l.y > solidTopAt(l.x) || (IW && l.y < ceilAt(l.x)))) { l.dead = true; if (rnd() < .4) sparks(l.x, l.y, 2, DUST, -Math.PI / 2, 1.6); }
  }
  // missiles
  for (const m of missiles) updateMissile(m, dt);
  // enemy bullets, beams, satellites
  updateEnemyBullets(dt);
  updateBeams(dt);
  updateLances(dt);
  updateSats(dt);
  // powerups
  for (const u of powers) {
    u.t += dt; if (S.side) { u.x -= (S.scroll * .5 + 30) * dt; u.y += Math.sin(u.t * 2) * 20 * dt; if (u.x < -30) u.dead = true; } else u.y += u.vy * dt;
    if (P.alive && playing && !P.cap) {
      const dx = P.x - u.x, dy = P.y - u.y, d = Math.hypot(dx, dy);
      if (d < 130) { u.x += dx / d * 260 * dt; u.y += dy / d * 260 * dt; }
      if (d < 26) { applyPower(u); u.dead = true; }
    }
    if (u.y > H + 30) u.dead = true;
  }
  // particles
  for (const p of parts) {
    if (p.k === 'spark' || p.k === 'ember') { gravityOn(p, dt, .8); if (insideHole(p, .9)) p.life = 0; }
    p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
    if (p.k === 'smoke') { p.r += p.g * dt; p.vx *= .98; p.vy *= .98; }
    else if (p.k === 'spark' || p.k === 'debris') { p.vx *= .985; p.vy *= .985; if (p.k === 'debris') p.rot += p.vr * dt; }
    else if (p.k === 'trail') { p.r += 14 * dt; }
  }
  for (const w of waves) { w.life -= dt; w.r += (w.max - w.r) * Math.min(1, dt * 7); }
  for (const t of texts) { t.life -= dt; t.y -= (t.big ? 18 : 40) * dt; }

  if (playing && P.alive && !P.cap && !S.trans) collisions();
  { const want = playing && P.alive && P.beamOn; if (!want) P.focus = Math.max(0, (P.focus || 0) - dt / .4); if (want && !P.beamSnd) P.beamSnd = sfx.beamHum(P.lvl); else if (!want && P.beamSnd) { P.beamSnd.stop(); P.beamSnd = null; } }

  // combo
  S.comboT -= dt; if (S.comboT <= 0) S.combo = 0;
  S.shake = Math.max(0, S.shake - dt * 30);
  S.dmgFlash = Math.max(0, S.dmgFlash - dt * 1.6);
  S.wflash = Math.max(0, (S.wflash || 0) - dt * 2.2);
  if (S.banner) { S.banner.t += dt; if (S.banner.t > S.banner.dur) S.banner = null; }
  if (S.warn > 0) S.warn -= dt;
  if (S.toast) { S.toast.t -= dt; if (S.toast.t <= 0) S.toast = null; }

  // hole rumble
  if (holeGain && AC) {
    let k = 0;
    if (S.mode === 'play' && P.alive) for (const h of holes) k = Math.max(k, 1 - Math.hypot(h.x - P.x, h.y - P.y) / h.R);
    holeGain.gain.setTargetAtTime(clamp(k, 0, 1) * .45, AC.currentTime, .15);
    musFilterT -= dt;
    if (musFilterT <= 0 && MUS.mode !== 'over') { musFilterT = .12; musFilter.frequency.setTargetAtTime(18000 - clamp(k, 0, 1) ** .7 * 16800, AC.currentTime, .25); }
  }

  for (const e of ships) if (e.dead && !e.fcount) { e.fcount = 1; if (!e.killed) flowEscape(e); }
  sweep(lasers); sweep(missiles); sweep(ebul); sweep(rocks); sweep(ships); sweep(powers);
  sweepLife(parts); sweepLife(waves); sweepLife(texts);
}
function sweep(a) { let j = 0; for (let i = 0; i < a.length; i++) if (!a[i].dead) a[j++] = a[i]; a.length = j; }
function sweepLife(a) { let j = 0; for (let i = 0; i < a.length; i++) if (a[i].life > 0) a[j++] = a[i]; a.length = j; }

function updatePlayer(dt) {
  if (P.cap) { updateCapture(dt); return; }
  const ix = (K.right ? 1 : 0) - (K.left ? 1 : 0), iy = (K.down ? 1 : 0) - (K.up ? 1 : 0);
  const n = ix && iy ? .7071 : 1, sp = 430;
  P.vx += (ix * n * sp - P.vx) * Math.min(1, dt * 9);
  P.vy += (iy * n * sp - P.vy) * Math.min(1, dt * 9);
  P.gx *= Math.max(0, 1 - dt * 1.4); P.gy *= Math.max(0, 1 - dt * 1.4);
  let hx = 0, hy = 0; S.holeNear = 0;
  for (const h of holes) {
    const dx = h.x - P.x, dy = h.y - P.y, d = Math.hypot(dx, dy) || 1;
    if (d < h.R) {
      const k = Math.pow(clamp((h.R - d) / (h.R - h.cap), 0, 1), 2.2), pull = HOLE_PULL * k;
      hx += dx / d * pull - dy / d * pull * .32 * h.spin; hy += dy / d * pull + dx / d * pull * .32 * h.spin;
      S.holeNear = Math.max(S.holeNear, clamp(1 - (d - h.cap) / (h.R - h.cap), 0, 1));
    }
  }
  const dcap = (900 - 520 * S.holeNear) * dt, dl = Math.hypot(P.dx, P.dy);
  if (dl > dcap) { P.dx *= dcap / dl; P.dy *= dcap / dl; }
  const ox = P.x, oy = P.y;
  P.x += (P.vx + P.gx + hx) * dt + P.dx; P.y += (P.vy + P.gy + hy) * dt + P.dy;
  P.dx = P.dy = 0;
  if (!Number.isFinite(P.x) || !Number.isFinite(P.y)) { P.x = ox; P.y = oy; P.gx = P.gy = 0; }
  if (S.side) {
    P.x = clamp(P.x, inset.l + 30, W * .86 - inset.r);
    if (S.boss && S.boss.kind === 'colossus' && S.boss.entered) P.x = Math.min(P.x, S.boss.x - S.boss.hw * .5 - 34);
    else if (S.boss && S.boss.gate && S.boss.entered) P.x = Math.min(P.x, S.boss.x - S.boss.hw * .5 - S.boss.rl - 30);
    else if (S.boss && S.boss.kind === 'core' && S.boss.entered) P.x = Math.min(P.x, S.boss.x - S.boss.sr - 30);
    const top = solidTopAt(P.x) - 20;
    if (P.y > top) { if (P.y - top > 5) { hurt(6); sparks(P.x, P.y + 14, 4, DUST, -Math.PI / 2, 1.4); } P.y = top; P.vy = Math.min(P.vy, 0); P.gy = Math.min(P.gy, 0); }
    if (IW) { const ct = ceilAt(P.x) + 20; if (P.y < ct) { if (ct - P.y > 5) { hurt(6); sparks(P.x, P.y - 14, 4, DUST, Math.PI / 2, 1.4); } P.y = ct; P.vy = Math.max(P.vy, 0); P.gy = Math.max(P.gy, 0); } }
    P.y = Math.max(P.y, inset.t + 56);
  } else {
    P.x = clamp(P.x, inset.l + 26, W - inset.r - 26);
    P.y = clamp(P.y, inset.t + 60, H - inset.b - 34);
  }
  if (S.boss && S.boss.kind === 'fortress' && S.boss.entered) P.y = Math.max(P.y, S.boss.y + S.boss.fx.cy + S.boss.fx.rb + 50);
  for (const h of holes) if (Math.hypot(h.x - P.x, h.y - P.y) < h.cap) { startCapture(h); return; }
  const evx = (P.x - ox) / Math.max(dt, .001), evy = (P.y - oy) / Math.max(dt, .001);
  P.bank += (clamp((S.side ? -evy : evx) / 420, -1, 1) - P.bank) * Math.min(1, dt * 8);
  P.evy = evy; P.evx = evx;

  P.fireCd -= dt;
  const trig = S.auto || K.fire;
  if (P.weapon === 'ult') ultFire(dt, trig);
  else if (P.weapon === 'beam') { P.beamOn = trig; if (trig) updatePlayerBeam(dt); }
  else if (trig && P.fireCd <= 0) { fireLaser(); P.fireCd = .11; }
  P.misCd -= dt;
  if (P.weapon === 'ult' && ultAvail()) { if (S.misReq || K.missile) ultNova(); }
  else if ((S.misReq || K.missile) && P.misCd <= 0) {
    if (P.mis > 0) { launchMissile(); P.misCd = .26; }
    else if (S.misReq) { sfx.empty(); S.toast = { txt: I18('飞弹耗尽 · 自动补给中', 'Missiles empty · resupplying'), t: 1.4 }; P.misCd = .4; }
  }
  S.misReq = false;
  P.misRegen += dt; if (P.misRegen > 7) { P.misRegen = 0; if (P.mis < P.misMax) P.mis++; }
  if (P.hull < 30) { S.alarmT = (S.alarmT || 0) - dt; if (S.alarmT <= 0) { sfx.alarm(); S.alarmT = 1.25; } }
  P.shieldDelay -= dt; if (P.shieldDelay <= 0) P.shield = Math.min(100, P.shield + 13 * dt);
  P.inv -= dt; P.hitT -= dt; P.shieldHit -= dt; P.muzzle -= dt; P.bayT = Math.max(0, (P.bayT || 0) - dt);

  // exhaust
  if (parts.length < 1500) for (const s of [-5, 5]) {
    if (S.side) { parts.push({ k: 'ember', x: P.x - 31, y: P.y + (s < 0 ? -2.5 : 3) + rand(-1, 1), vx: -rand(160, 260), vy: rand(-15, 15), life: rand(.12, .25), max: .25, c: pick(['120,200,255', '200,240,255']), r: rand(1.2, 2.2) }); continue; }
    parts.push({ k: 'ember', x: P.x + s * (1 - Math.abs(P.bank) * .28) + rand(-1, 1), y: P.y + 30, vx: rand(-15, 15), vy: rand(160, 260), life: rand(.12, .25), max: .25, c: pick(['120,200,255', '200,240,255']), r: rand(1.2, 2.2) });
  }
  S.lock = findTarget(P.x, P.y);
}

function spawnLogic(dt) {
  const d = diff();
  S.sectorT += dt * (S.flow || 1);
  if (!S.boss && !S.bossPending && S.sectorT >= secLen()) {
    if (S.sector % 10 === 0 || levelOf(S.sector) % 3 === 0) {
      S.bossPending = true; S.warn = 3.4; sfx.warn();
      if (S.sector % 10 === 0) S.warnName = bossLabel(['fortress', 'fortress', 'aegis', 'cryo'][themeOf(stageOf(S.sector))], cycOf(stageOf(S.sector))); else { const n = Math.max(1, (cycOf(stageOf(S.sector)) - 1) * 3 + Math.round(levelOf(S.sector) / 3)); S.warnName = bossLabel(bossKindFor(n), n); }
      S.events.push({ t: 3, fn: spawnBoss });
    } else nextSector();
  }
  S.tRock -= dt * (S.flow || 1);
  if (S.tRock <= 0) { spawnRock(); S.tRock = rand(.55, 1.25) / Math.sqrt(d) * (S.boss ? 2.4 : 1) * (themeC() ? .8 : 1); }
  S.tGiant -= dt;
  if (S.tGiant <= 0) { if (!S.boss) spawnRock({ r: rand(82, Math.min(135, W * .24 + 40)), vy: rand(30, 48), vx: rand(-12, 12) }); S.tGiant = rand(17, 26) / Math.sqrt(d); }
  if (!S.boss && !S.bossPending) {
    S.tShip -= dt * (S.flow || 1);
    if (S.tShip <= 0) { if (ships.length < 26) { if (themeC()) spawnWaveC(); else if (themeB()) spawnWaveB(); else spawnWave(); } S.tShip = rand(2.2, 3.6) / d * (themeC() ? .92 : 1); }
  }
  S.tHole -= dt;
  if (S.tHole <= 0) {
    if (!holes.length && !S.boss && !S.bossPending) { spawnHole(); S.tHole = rand(30, 42); S.toast = { txt: I18('侦测到引力异常', 'Gravitational anomaly detected'), t: 2.2 }; }
    else S.tHole = 6;
  }
}

function updateMissile(m, dt) {
  m.t += dt; m.life -= dt;
  if (m.t < .2) { if (S.side) { m.vy *= .9; m.vx += 300 * dt; } else { m.vx *= .9; m.vy += -300 * dt; } }
  else {
    if (!m.tgt || m.tgt.dead || m.tgt.hidden || m.tgt.dying) m.tgt = findTarget(m.x, m.y);
    let ang = Math.atan2(m.vy, m.vx), sp = Math.hypot(m.vx, m.vy);
    if (m.tgt) {
      const want = Math.atan2(m.tgt.y - m.y, m.tgt.x - m.x);
      let da = want - ang; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
      ang += clamp(da, -7 * dt, 7 * dt);
    } else { let da = (S.side ? 0 : -Math.PI / 2) - ang; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; ang += clamp(da, -2 * dt, 2 * dt); }
    sp = Math.min(720, sp + 1100 * dt);
    m.vx = Math.cos(ang) * sp; m.vy = Math.sin(ang) * sp;
    if (parts.length < 1600) {
      parts.push({ k: 'trail', x: m.x - m.vx * .012, y: m.y - m.vy * .012, vx: rand(-10, 10), vy: rand(-10, 10), life: .55, max: .55, r: 3 });
      parts.push({ k: 'ember', x: m.x - m.vx * .015, y: m.y - m.vy * .015, vx: -m.vx * .15, vy: -m.vy * .15, life: .12, max: .12, c: pick(FIRE), r: 2.6 });
    }
  }
  gravityOn(m, dt, .6);
  m.x += m.vx * dt; m.y += m.vy * dt;
  if (m.life <= 0) { m.dead = true; missileBlast(m); return; }
  if (insideHole(m, .9) || m.y < -80 || m.y > H + 80 || m.x < -80 || m.x > W + 80) { m.dead = true; return; }
  if (S.side && (GW || IW) && (m.y > solidTopAt(m.x) || (IW && m.y < ceilAt(m.x)))) { m.dead = true; missileBlast(m); return; }
  for (const e of ships) {
    if (e.dead || e.cap || e.dying) continue;
    if (e.type === 'boss') { const pt = hitPart(e, m.x, m.y, 6); if (pt || hitBoss(e, m.x, m.y, 6)) { m.dead = true; pt ? damagePart(e, pt, 10, m.x, m.y) : damage(e, 10, m.x, m.y, true); missileBlast(m); return; } if ((e.kind === 'colossus' && colossusArmor(e, m.x, m.y) && !(m.tgt && e.parts.includes(m.tgt) && !m.tgt.dead)) || (e.gate && gateArmor(e, m.x, m.y))) { m.dead = true; missileBlast(m); return; } continue; }
    if (e.surf ? hitShip(e, m.x, m.y, 6) : Math.hypot(e.x - m.x, e.y - m.y) < e.r * .9 + 6) { m.dead = true; damage(e, 10, m.x, m.y, true); missileBlast(m); return; }
  }
  for (const st of liveSats()) if (Math.hypot(st.x - m.x, st.y - m.y) < 16) { m.dead = true; damageSat(st, 10, m.x, m.y); missileBlast(m); return; }
  for (const k of rocks) if (!k.dead && Math.hypot(k.x - m.x, k.y - m.y) < k.r * .9 + 6) { m.dead = true; damage(k, 10, m.x, m.y, false); missileBlast(m); return; }
}

function hitShip(e, x, y, pad = 0) {
  if (e.type === 'boss') return hitBoss(e, x, y, pad);
  if (e.surf) { const dx = (x - e.x) / (e.hw + pad), dy = (y - e.y) / (e.hh + pad); return dx * dx + dy * dy < 1; }
  const dx = x - e.x, dy = y - e.y; return dx * dx + dy * dy < e.r * e.r;
}
function collisions() {
  const sats = liveSats();
  for (const l of lasers) {
    if (l.dead) continue;
    for (const b of ebul) {
      if (b.dead || !(b.k === 'homing' || b.k === 'shell' || b.k === 'rocket' || b.k === 'bomb')) continue;
      const dx = l.x - b.x, dy = l.y - b.y;
      if (dx * dx + dy * dy < (b.r + 7) ** 2) { l.dead = l.hit = true; b.dead = true; explode(b.x, b.y, 12, b.k !== 'homing' || b.mis ? FIRE : ['170,255,120', '255,255,255', '200,255,160', '255,255,255']); addScore(30, b.x, b.y); break; }
    }
    if (l.dead) continue;
    for (const st of sats) if (!st.dead && Math.hypot(l.x - st.x, l.y - st.y) < 13) { l.dead = l.hit = true; damageSat(st, l.dmg, l.x, l.y); break; }
    if (l.dead) continue;
    if (IW && propHitsLaser(l)) { l.dead = l.hit = true; continue; }
    for (const e of ships) {
      if (e.dead || e.cap || e.dying || e.y < -20) continue;
      if (e.type === 'boss') { const pt = hitPart(e, l.x, l.y); if (pt) { l.dead = l.hit = true; damagePart(e, pt, l.dmg, l.x, l.y); break; } }
      if (hitShip(e, l.x, l.y)) { l.dead = l.hit = true; damage(e, l.dmg, l.x, l.y, true); break; }
      if ((e.kind === 'colossus' && colossusArmor(e, l.x, l.y) && !rowPart(e, l.y)) || (e.gate && gateArmor(e, l.x, l.y))) { l.dead = l.hit = true; sparks(l.x, l.y, 2, ['255,220,180', '255,255,255'], Math.PI, 1.6); break; }
    }
    if (l.dead) continue;
    for (const k of rocks) { if (k.dead) continue; const dx = l.x - k.x, dy = l.y - k.y; if (dx * dx + dy * dy < (k.r * .9) ** 2) { l.dead = l.hit = true; damage(k, l.dmg, l.x, l.y, false); break; } }
  }
  for (const l of lasers) if (l.hit && l.boom && !l.boomed) { l.boomed = true; laserBoom(l.x, l.y); }
  for (const b of ebul) {
    if (b.dead) continue;
    const dx = b.x - P.x, dy = b.y - P.y;
    if (dx * dx + dy * dy < (b.r + 10) ** 2) { b.dead = true; hurt(b.dmg || 12); if (b.k === 'shell') shellBurst(b); else if (b.k === 'bomb' || b.k === 'rocket' || b.mis) explode(b.x, b.y, 16, FIRE); }
  }
  for (const k of rocks) {
    if (k.dead) continue;
    const dx = k.x - P.x, dy = k.y - P.y, d = Math.hypot(dx, dy);
    if (d < k.r * .85 + 14) {
      if (k.giant) {
        hurt(32);
        P.gx -= dx / d * 520; P.gy -= dy / d * 520;
      } else if (k.iron) {
        const dd = d || 1, nx = dx / dd, ny = dy / dd, R = k.r * .85 + 14;
        P.x = k.x - nx * R; P.y = k.y - ny * R; P.gx -= nx * 380; P.gy -= ny * 380; hurt(10 + k.r * .25); sfx.clang(P.x);
      } else { hurt(8 + k.r * .45); killRock(k); }
    }
  }
  for (const e of ships) {
    if (e.dead || e.cap || e.type === 'boss') continue;
    if (e.surf ? hitShip(e, P.x, P.y, 10) : Math.hypot(e.x - P.x, e.y - P.y) < e.r * .8 + 14) { hurt(25); damage(e, 12, e.x, e.y, true); }
  }
  if (IW) propHitsPlayer();
  const b = S.boss;
  if (b && hitShip(b, P.x, P.y)) { hurt(35); if (b.kind === 'colossus' || b.sideBoss || b.gate || b.kind === 'core' || b.kind === 'god') P.gx -= 500; else P.gy += 500; }
  for (const e of ships) if (e.escort && !e.dead && !e.dying && hitShip(e, P.x, P.y)) { hurt(30); P.gx -= 420; }
}

function applyPower(u) {
  const d = PU[u.type];
  sfx.power();
  if ((u.type === 'W' || u.type === 'M') && !ultAvail() && !TUT.done.meter) tutPush('meter');
  if (u.type === 'W' && !ultAvail()) { P.wCount = (P.wCount || 0) + 1; if (P.wCount >= 10) { P.wCount = 0; S.events.push({ t: .35, fn: () => { if (S.mode === 'play' && P.alive) startSuper(); } }); } }
  if (u.type === 'W') { if (P.lvl < 10) { P.lvl++; floatText(P.x, P.y - 40, I18('武器 MK.', 'WEAPON MK.') + ROMAN[P.lvl - 1] + (P.lvl === 8 ? (P.weapon === 'beam' ? I18(' · 辐射解锁', ' · ARC UNLOCKED') : I18(' · 爆裂解锁', ' · BURST UNLOCKED')) : ''), P.weapon === 'beam' ? BEAMC : ION, true); if (P.beamSnd) { P.beamSnd.stop(); P.beamSnd = null; } } else { S.score += 500; floatText(P.x, P.y - 40, I18('火力已满 +500', 'Max firepower +500'), ION, true); } return; }
  if (u.type === 'S') P.shield = 100;
  if (u.type === 'M') { P.mis = Math.min(P.misMax, P.mis + 4); if (!ultAvail()) { P.mCount = (P.mCount || 0) + 1; if (P.mCount >= 10) { P.mCount = 0; S.events.push({ t: .35, fn: () => { if (S.mode === 'play' && P.alive) gainNova(); } }); } } }
  if (u.type === 'H') P.hull = Math.min(100, P.hull + 30);
  floatText(P.x, P.y - 40, d.label, d.c, true);
}

function gameOver() {
  P.alive = false; P.hull = 0;
  explode(P.x, P.y, 90, ['255,255,255', ION, '180,250,255', '255,255,255'], { debris: '150,165,185' });
  explode(P.x, P.y, 60, FIRE);
  sfx.boom(165, P.x, 'huge'); shake(24);
  S.deathBy = 'hull';
  finishRun(1.8);
}
function finishRun(delay) {
  S.overT = 0; S.diedStage = stageOf(S.sector);
  lbRecordRun();
  const isBest = S.score > best && !S.dev;
  if (isBest) { best = S.score; saveBest(); }
  S.events.push({ t: delay, fn: () => showOver(isBest) });
}

