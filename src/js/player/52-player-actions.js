/* ---------- player actions ---------- */
function fireLaser() {
  const L = P.lvl, boom = L >= 8;
  const add = (o, ang, dmg, w = 1) => lasers.push(S.side ? { x: P.x + 32, y: P.y + 1 + o, vx: Math.cos(ang) * 980, vy: Math.sin(ang) * 980, dmg, w, life: 1.3, boom }
    : { x: P.x + o, y: P.y - 26, vx: Math.sin(ang) * 980, vy: -Math.cos(ang) * 980, dmg, w, life: 1.3, boom });
  for (const [o, a, d, w, lv] of SPREAD) if (L >= lv) add(o, a, d + (o === 0 && L >= 6 ? .6 : 0), w);
  P.muzzle = .06;
  sfx.laser(P.x);
}
function launchMissile() {
  TUT.fired = true;
  S.misSide = -S.misSide;
  const s = S.misSide;
  if (S.side) P.bayT = .4;
  missiles.push(S.side ? { x: P.x + s * 4 - 1, y: P.y + 10, vx: 20 + P.vx * .3, vy: rand(150, 180), t: 0, tgt: null, life: 4.2 } : { x: P.x + s * 18, y: P.y + 4, vx: s * 190 + P.vx * .3, vy: -30, t: 0, tgt: null, life: 4.2 });
  P.mis--; sfx.missile(P.x + s * 18);
}
function findTarget(x, y) {
  let best = null, bs = Infinity;
  for (const e of ships) {
    if (e.dead || e.cap || e.dying || e.y < -20 || e.y > H || (S.side && (e.x > W - 6 || e.x < -10))) continue;
    if (e.type === 'boss' && e.parts.length) for (const p of e.parts) { if (p.dead || p.hidden) continue; const d = Math.hypot(p.x - x, p.y - y) * ((S.side ? p.x < x : p.y > y) ? 1.8 : 1) - 160; if (d < bs) { bs = d; best = p; } }
    if (e.shield) continue;
    const d = Math.hypot(e.x - x, e.y - y) * ((S.side ? e.x < x : e.y > y) ? 1.8 : 1) - (e.type === 'boss' ? 200 : e.type === 'gunship' || e.type === 'lancer' ? 120 : 0);
    if (d < bs) { bs = d; best = e; }
  }
  for (const st of liveSats()) { const d = Math.hypot(st.x - x, st.y - y) * (st.y > y ? 1.8 : 1) + 40; if (d < bs) { bs = d; best = st; } }
  for (const r of rocks) {
    if (r.dead || r.r < 26 || r.iron || r.y < -10 || r.y > H) continue;
    const d = Math.hypot(r.x - x, r.y - y) * (r.y > y ? 1.8 : 1) + 160;
    if (d < bs) { bs = d; best = r; }
  }
  return best;
}
function hurt(d, src) {
  if (!P.alive) return;
  if (S.dev && S.dev.god) { if (src !== 'hole' && P.inv <= 0) { P.inv = .25; P.shieldHit = .35; sparks(P.x, P.y, 6, ['255,255,255', '255,140,230']); sfx.shield(); } return; }
  if (src !== 'hole' && P.inv > 0) return;
  if (P.shield > 0) { const a = Math.min(P.shield, d); P.shield -= a; d -= a; P.shieldHit = .35; }
  const hullHit = d > 0;
  if (d > 0) { P.hull -= d; P.hitT = .3; S.dmgFlash = Math.min(1, S.dmgFlash + (src === 'hole' ? .05 : .55)); }
  P.shieldDelay = BAL.player.shieldDelay;
  if (src !== 'hole') { P.inv = .35; shake(8); hullHit ? sfx.hurt() : sfx.shield(); sparks(P.x, P.y, 14, ['255,255,255', ION]); }
  if (P.hull <= 0) gameOver();
}

