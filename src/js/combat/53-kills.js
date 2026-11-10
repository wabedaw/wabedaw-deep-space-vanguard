/* ---------- kills ---------- */
function killRock(k, byHole) {
  if (k.dead) return;
  k.dead = true;
  if (byHole) {
    const h = byHole;
    for (let i = 0; i < 26; i++) {
      const dx = k.x - h.x, dy = k.y - h.y, d = Math.hypot(dx, dy) || 1;
      const tx = -dy / d, ty = dx / d, sp = rand(140, 280);
      parts.push({ k: 'ember', x: k.x + rand(-k.r, k.r) * .5, y: k.y + rand(-k.r, k.r) * .5, vx: tx * sp, vy: ty * sp, life: rand(.8, 1.6), max: 1.6, c: pick(['255,190,120', '255,140,70', '255,230,190']), r: rand(1.5, 3) });
    }
    return;
  }
  S.rocks++;
  explode(k.x, k.y, k.r * (k.giant ? 1.2 : .9), DUST, { debris: '120,104,90', smoke: '60,55,52' });
  sfx.boom(k.r * (k.giant ? 1.4 : 1), k.x, k.giant ? 'big' : 'rock');
  addScore(k.giant ? 600 : k.r > 30 ? 90 : k.r > 20 ? 50 : 30, k.x, k.y);
  if (k.r > 26) {
    const n = k.giant ? 4 : rnd() < .5 ? 2 : 3;
    for (let i = 0; i < n; i++) {
      const a = rand(0, TAU), sp = rand(40, 110);
      spawnRock({ r: k.r * (k.giant ? rand(.32, .42) : rand(.42, .58)), x: k.x + Math.cos(a) * k.r * .3, y: k.y + Math.sin(a) * k.r * .3, vx: k.vx + Math.cos(a) * sp, vy: k.vy * .8 + Math.sin(a) * sp * .6 + 30 });
    }
  }
  if (k.giant) { dropPower(k.x, k.y); dropPower(k.x + 20, k.y - 10, 'M'); }
  else if (rnd() < .045) dropPower(k.x, k.y);
}
function killShip(e, silent) {
  if (e.dead || e.dying) return;
  if (e.kind === 'fortress' && !silent) { fortressDown(e); return; }
  if (e.kind === 'colossus' && !silent) { colossusDown(e); return; }
  if (e.gate && !silent) { gateDown(e); return; }
  if (e.kind === 'core' && !silent) { coreDown(e); return; }
  if (e.kind === 'omega' && !silent) { omegaDown(e); return; }
  if (e.kind === 'god' && !silent) { godDown(e); return; }
  e.dead = true;
  if (silent) { e.fcount = 1; return; }
  S.kills++; e.killed = true; flowKill(e);
  if (e.surf) { sideKill(e); return; }
  if (e.escort) { escortDown(e); return; }
  if (e.type === 'boss') {
    S.boss = null;
    clearBeamsOf(e);
    for (let i = 0; i < 12; i++) S.events.push({ t: i * .14, fn: () => { const bx = e.x + rand(-e.hw, e.hw) * .8; explode(bx, e.y + rand(-e.hh, e.hh) * .7, rand(30, 60), i % 2 ? PLAS : FIRE); sfx.boom(48, bx, i % 3 ? 'ship' : 'big'); } });
    S.events.push({ t: 1.5, fn: () => {
      explode(e.x, e.y, 150, FIRE, { debris: '90,70,120' }); sfx.boom(175, e.x, 'huge'); shake(26);
      ebul.length = 0; clearBeams();
      dropPower(e.x - 40, e.y, 'W'); dropPower(e.x, e.y, 'H'); dropPower(e.x + 40, e.y, 'M');
      addScore(e.score, e.x, e.y);
      S.events.push({ t: 1.6, fn: nextSector });
    } });
    return;
  }
  const hv = HIVE_TYPES.has(e.type), big = e.type === 'gunship' || e.type === 'brood';
  if (e.type === 'urchin') urchinBurst(e);
  if (e.type === 'comet') cometBurst(e);
  const sz = e.r * (big ? 1.6 : 1.1);
  explode(e.x, e.y, sz, e.type === 'gunship' ? FIRE : hv ? HIVEP : CRYO_TYPES.has(e.type) ? ICEP : PLAS, hv ? { debris: '60,84,52', smoke: '36,48,34' } : { debris: '70,52,96', smoke: '45,35,60' });
  sfx.boom(sz, e.x, big ? 'big' : 'ship');
  addScore(e.score, e.x, e.y);
  const ch = big ? .7 : e.type === 'raider' || e.type === 'mantis' || e.type === 'prism' ? .25 : .08;
  if (rnd() < ch) dropPower(e.x, e.y);
}
function damage(target, dmg, x, y, isShip) {
  if (target.dead || target.dying) return;
  if (target.kind === 'core' && target.shp > 0) { coreShieldHit(target, dmg, x, y); return; }
  if (target.iron) { target.hitT = .06; sparks(x, y, 2, ['255,255,255', IRON_VEIN[target.iron], '200,210,225'], Math.PI / 2, 2.6); sfx.clang(x); return; }
  if (target.shield) { target.shieldHit = .25; sparks(x, y, 3, ['150,240,255', '255,255,255'], Math.PI / 2, 2.4); return; }
  if (target.kind === 'god' && target.bb) { dmg *= 2; target.bb.acc += dmg; }
  if (isShip && TIER.enemyHp !== 1) dmg /= target.type === 'boss' ? TIER.bossHp : TIER.enemyHp;   // difficulty
  target.hp -= dmg; target.hitT = .08;
  sparks(x, y, 3, isShip ? ['255,255,255', PLASMA] : DUST, Math.PI / 2, 2.2);
  sfx.hit(x, isShip);
  if (target.hp <= 0) isShip ? killShip(target) : killRock(target);
}
function missileBlast(m) {
  explode(m.x, m.y, 34, FIRE);
  sfx.boom(34, m.x, 'missile');
  const R = 74;
  for (const e of ships) {
    if (e.dead || e.cap || e.dying) continue;
    if (e.type === 'boss') { const pt = hitPart(e, m.x, m.y, R * .6); if (pt) { damagePart(e, pt, 14, e.x + pt.ox, e.y + pt.oy); continue; } if (hitBoss(e, m.x, m.y, R * .5)) damage(e, 14, m.x, m.y, true); continue; }
    if (Math.hypot(e.x - m.x, e.y - m.y) < R + e.r * .6) damage(e, 14, e.x, e.y, true);
  }
  for (const st of liveSats()) if (Math.hypot(st.x - m.x, st.y - m.y) < R) damageSat(st, 14, st.x, st.y);
  for (const k of rocks) if (!k.dead && Math.hypot(k.x - m.x, k.y - m.y) < R + k.r * .6) damage(k, 14, k.x, k.y, false);
}

