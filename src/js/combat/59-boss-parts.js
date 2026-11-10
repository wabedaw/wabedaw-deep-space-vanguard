/* ---------- boss parts ---------- */
function hitBoss(e, x, y, pad = 0) {
  if (e.kind === 'omega') { const dx = x - (e.x + e.gox), dy = y - (e.y + e.goy); return e.stage === 3 && !e.shield && dx * dx + dy * dy < (e.gr * 1.2 + pad) ** 2; }
  if (e.kind === 'god') { const dx = x - e.x, dy = y - e.y; if (e.phase === 3) return dx * dx + dy * dy < (e.hw * .38 + pad) ** 2; if (e.shield && rowPart(e, y)) return false; const ex = dx / (e.hw * .62 + pad), ey = dy / (e.hh * .82 + pad); return ex * ex + ey * ey < 1; }
  if (e.gate) { const dx = x - (e.x - e.hw * .5), dy = y - e.y; return e.open < .05 && dx * dx + dy * dy < (e.rl + pad) ** 2; }
  if (e.kind === 'colossus') { const dx = x - e.x, dy = y - e.y; return !e.citadelGone && !(e.shield && rowPart(e, y)) && dx * dx + dy * dy < (e.hh * .38 + pad) ** 2; }
  if (e.kind === 'leviathan') { const dx = x - e.x, dy = y - e.y; return dx * dx + dy * dy < (e.r * .78 + pad) ** 2; }
  const dx = (x - e.x) / (e.hw + pad), dy = (y - e.y) / (e.hh + pad); return dx * dx + dy * dy < 1;
}
function hitPart(e, x, y, pad = 3) { if (!e.parts || e.dying) return null; for (const p of e.parts) if (!p.dead && !p.hidden && Math.hypot(x - e.x - p.ox, y - e.y - p.oy) < p.r + pad) return p; return null; }
function damagePart(e, p, dmg, x, y) {
  if (e.dead) return;
  const fort = e.kind === 'fortress' || e.kind === 'colossus' || !!e.gate || e.kind === 'core' || e.kind === 'omega' || e.kind === 'god';
  if (TIER.bossHp !== 1) dmg /= TIER.bossHp;   // difficulty
  p.hp -= dmg; p.hitT = .08; if (!fort) { e.hp -= dmg * .35; e.hitT = .04; }
  sparks(x, y, 3, ['255,255,255', FLARE], Math.PI / 2, 2.2); sfx.hit(x, true);
  if (p.hp <= 0 && !p.dead) {
    p.dead = true; const px = e.x + p.ox, py = e.y + p.oy;
    explode(px, py, 52, FIRE, { debris: '90,80,110' }); sfx.boom(60, px, 'big');
    addScore(900, px, py); if (!fort) e.hp -= e.maxhp * .05; clearBeamsOf(p);
    floatText(px, py - 30, fort ? I18('模块摧毁', 'MODULE DOWN') : I18('炮塔摧毁', 'TURRET DOWN'), FLARE, true);
  }
  if (e.hp <= 0) killShip(e);
}

