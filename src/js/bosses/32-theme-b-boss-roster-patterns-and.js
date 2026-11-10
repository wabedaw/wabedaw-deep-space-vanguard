/* ---------- theme B: boss roster, patterns and shared glue ---------- */
const HIVEP = [HIVE, '220,255,200', '120,200,90', WHITE];
const FORT_MODS_B = ['turret', 'missile', 'laser', 'hangar', 'turret', 'laser', 'missile', 'turret', 'laser', 'hangar'];
Object.assign(BOSSES, {
  scarab: { name: I18('圣甲虫级巢舰 · SCARAB', 'SCARAB-CLASS HIVE CRUISER'), hp: 900, score: 8000 },
  medusa: { name: I18('水母级孢子母舰 · MEDUSA', 'MEDUSA-CLASS SPORE CARRIER'), hp: 1200, score: 11000 },
  prismarch: { name: I18('棱晶主宰 · PRISMARCH', 'PRISMARCH CRYSTAL OVERMIND'), hp: 1500, score: 14000 },
  aegis: { name: I18('双环巢星 · AEGIS', 'AEGIS HIVE WORLD'), hp: 1500, score: 22000 },
  phoenix: { name: I18('火凤级攻击舰 · PHOENIX', 'PHOENIX-CLASS STRIKER'), hp: 2400, score: 7500 },
  anvil: { name: I18('铁砧级重炮舰 · ANVIL', 'ANVIL-CLASS SIEGE SHIP'), hp: 3600, score: 10500 },
  wyrm: { name: I18('熔岩巨蛇 · WYRM', 'MAGMA WYRM'), hp: 4000, score: 13500 },
  forge: { name: I18('熔炉要塞 · FORGE', 'FORGE VOLCANIC CITADEL'), hp: 5600, score: 32000 },
  hgate1: { name: I18('孢膜之门 · SPORE MEMBRANE', 'SPORE MEMBRANE'), hp: 1600, score: 9500 },
  hgate2: { name: I18('血肉闸门 · FLESH GATE', 'FLESH GATE'), hp: 2600, score: 12500 },
  hgate3: { name: I18('神经闸门 · NEURAL GATE', 'NEURAL GATE'), hp: 3400, score: 15500 },
  hivemind: { name: I18('母巢意识 · HIVE MIND', 'THE HIVE MIND'), hp: 6600, score: 42000 },
});
Object.assign(BOSS_PAT, {
  scarab: [['fan', 'turrets', 'spiral', 'shells'], ['shells', 'fan', 'homing', 'turrets', 'swarm', 'counter'], ['flower', 'swarm', 'homing', 'counter', 'turrets', 'laser', 'lance']],
  medusa: [['waves', 'swarm', 'flower', 'aimed'], ['wheel', 'swarm', 'counter', 'waves', 'turrets', 'lance'], ['wheel', 'flower', 'swarm', 'twin', 'counter', 'lances']],
  prismarch: [['lance', 'twin', 'spiral', 'aimed'], ['lances', 'laser', 'counter', 'lance', 'twin', 'turrets'], ['cascade', 'wheel', 'lances', 'twin', 'flower', 'counter', 'wall']],
  aegis: [['aimed', 'fan', 'swarm', 'shells'], ['laser', 'lance', 'counter', 'homing', 'swarm', 'artillery', 'fan'], ['twin', 'lances', 'cascade', 'swarm', 'artillery', 'wheel', 'counter', 'homing']],
  forge: [['aimed', 'lance', 'fan', 'eruption'], ['laser', 'lance', 'counter', 'eruption', 'homing', 'lances', 'fan', 'rain', 'fighters'], ['twin', 'lances', 'laser', 'eruption', 'cascade', 'rain', 'counter', 'homing', 'wheel', 'fighters', 'lance']],
  phoenix: [['fan', 'aimed', 'waves', 'shells'], ['fan', 'lance', 'homing', 'waves', 'spiral'], ['flower', 'lance', 'twin', 'homing', 'fan', 'waves']],
  anvil: [['eruption', 'turrets', 'broadside', 'fighters'], ['eruption', 'laser', 'turrets', 'lance', 'broadside', 'homing'], ['eruption', 'lances', 'twin', 'turrets', 'rain', 'counter']],
  wyrm: [['spiral', 'turrets', 'aimed', 'waves'], ['lance', 'wheel', 'turrets', 'counter', 'waves'], ['cascade', 'wheel', 'lances', 'turrets', 'flower', 'counter']],
  hgate1: [['aimed', 'fan', 'swarm'], ['aimed', 'fan', 'homing', 'swarm', 'shells'], ['aimed', 'homing', 'fan', 'swarm', 'counter', 'shells']],
  hgate2: [['aimed', 'lance', 'fan', 'swarm'], ['lance', 'homing', 'spiral', 'swarm', 'laser', 'fan'], ['lances', 'twin', 'homing', 'swarm', 'counter', 'laser', 'lance']],
  hgate3: [['aimed', 'lances', 'fan', 'swarm', 'homing'], ['lances', 'laser', 'cascade', 'swarm', 'counter', 'homing', 'twin'], ['cascade', 'wheel', 'lances', 'swarm', 'twin', 'counter', 'homing', 'flower']],
  hivemind: [['spiral', 'lance', 'turrets', 'flower', 'swarm', 'homing', 'lances'], ['wheel', 'lance', 'counter', 'swarm', 'lances', 'flower', 'laser', 'cascade'], ['wall', 'wheel', 'swarm', 'cascade', 'twin', 'lances', 'counter', 'wall', 'flower']],
});
Object.assign(PAT_DUR, { swarm: 2.2, eruption: 2.6 });
Object.assign(BOSS_FN, {
  swarm(e, c, G, s) {
    if (c.ft > 0) return; c.ft = 99;
    const n = 3 + Math.min(3, e.phase), src = G.side && G.side.length ? G.side : [G.main];
    for (let k = 0; k < n; k++) S.events.push({ t: k * .22, fn: () => {
      if (e.dead || e.dying || !P.alive) return;
      const g = src[k % src.length], x = e.x + g[0], y = e.y + g[1];
      if (S.side) { if (ships.length < 30) spawnAir('fighter', x, y, { climb: !IW }); }
      else if (ships.length < 40) { const w = spawnShip('wasp', x, y); w.vy = 140; w.diveT = rand(.4, 1.2); w.bx = x; }
      parts.push({ k: 'flash', x, y, vx: 0, vy: 0, life: .15, max: .15, r: 18, c: HIVE });
    } });
  },
  eruption(e, c, G, s, L) {
    if (c.ft > 0) return; c.ft = .32 / L;
    const g = G.top[(c.n++) % G.top.length], x = e.x + g[0], y = e.y + g[1];
    parts.push({ k: 'flash', x, y, vx: 0, vy: 0, life: .18, max: .18, r: 22, c: '255,170,80' });
    lobShell(x, y, clamp(P.x + rand(-160, 160), 20, W - 20), clamp(P.y + rand(-120, 60), inset.t + 20, H - 20), 260 * s, 8);
  },
});
const CYC_KINDS = new Set(['fortress', 'colossus', 'core', 'aegis', 'forge', 'hivemind', 'thunder', 'whale', 'tempest', 'phoenix', 'anvil', 'wyrm']);
const vSrc = e => e.kind === 'omega' ? e.y + e.goy : e.y + (e.kind === 'fortress' ? e.hh * .9 : (e.hh || e.r) * .55);
function drawSpaceTintB() {
  const g = ctx.createRadialGradient(W * .72, H * .18, 0, W * .72, H * .18, Math.max(W, H) * .85);
  g.addColorStop(0, 'rgba(80,190,90,.13)'); g.addColorStop(.45, 'rgba(120,60,170,.09)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over';
}
function drawSerpentLava(sp) {
  const q = clamp(sp.t / sp.dur, 0, 1), x0 = sp.wx - S.wx, wy = waterY(), pts = [];
  for (let k = 0; k <= 14; k++) { const u = q * 1.35 - k / 14 * .35; if (u < 0 || u > 1) continue; pts.push([x0 + u * sp.len, wy - Math.sin(u * Math.PI) * sp.h * 1.2, k]); }
  ctx.lineCap = 'round';
  for (let k = 1; k < pts.length; k++) { ctx.strokeStyle = '#2a0e06'; ctx.lineWidth = (14 - pts[k][2] * .6) * sp.s; ctx.beginPath(); ctx.moveTo(pts[k - 1][0], pts[k - 1][1]); ctx.lineTo(pts[k][0], pts[k][1]); ctx.stroke(); }
  ctx.globalCompositeOperation = 'lighter';
  for (let k = 1; k < pts.length; k += 2) drawGlow(pts[k][0], pts[k][1] + 3, 6 * sp.s, '255,120,40', .55);
  if (pts.length) { const [hx, hy] = pts[0]; drawGlow(hx + 3, hy - 2, 5, '255,230,140', 1); }
  ctx.globalCompositeOperation = 'source-over'; ctx.lineCap = 'butt';
}

