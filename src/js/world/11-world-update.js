/* ---------- world update ---------- */
function updateSideWorld(dt) {
  if (!GW) return;
  S.scroll += (S.scrollT * (S.trans ? 1 : S.flow || 1) - S.scroll) * Math.min(1, dt * 1.5);
  S.wx += S.scroll * dt;
  ensureTerrain();
  if (GW.skyFade > 0) GW.skyFade = Math.max(0, GW.skyFade - dt / 3);
  for (const c of GW.clouds) { c.x -= (S.scroll * c.par + 5) * dt; if (c.x < -340 * c.s) { c.x = W + rand(20, 200); c.y = rand(H * .06, H * .48); } }
  for (const w of GW.wind) { w.x -= (w.v + S.scroll) * dt; if (w.x < -w.l) { w.x = W + rand(0, 200); w.y = rand(H * .08, H * .8); } }
  for (const d of GW.dots) { d.x += d.v * dt; d.ph += dt; if (d.x > W + 10) d.x = -10; }
  for (const f of GW.fauna) { f.ph += dt * 3; const ahead = f.wx + f.vx * .5; if (wetAt(ahead) || groundAt(ahead) < groundAt(f.wx) - 6) f.vx = 0; f.wx += f.vx * dt; }
  GW.flyT -= dt;
  if (GW.flyT <= 0) { GW.flyT = rand(5, 11); const y = rand(H * .18, H * .46), n = 1 + ((Math.random() * 3) | 0); for (let i = 0; i < n; i++) GW.flyers.push({ x: W + 60 + i * 50, y: y + rand(-30, 30), vx: -rand(26, 50), s: rand(.6, 1.1), ph: rand(0, TAU) }); }
  for (const f of GW.flyers) { f.x += (f.vx - S.scroll * .25) * dt; f.ph += dt * 2.2; }
  GW.flyers = GW.flyers.filter(f => f.x > -120);
  GW.serpT -= dt;
  if (GW.serpT <= 0) {
    GW.serpT = rand(4, 8);
    const sx = rand(W * .3, W * .95), wx = S.wx + sx;
    if (wetAt(wx) && wetAt(wx + 120) && wetAt(wx - 40) && groundAt(wx) > waterY() + 30) GW.serp.push({ wx, t: 0, dur: rand(1.5, 2.2), h: rand(60, 110), len: rand(120, 170), s: rand(.8, 1.15) });
  }
  for (const s of GW.serp) { const was = s.t; s.t += dt; if ((was < .05 && s.t >= .05) || (was < s.dur - .05 && s.t >= s.dur - .05)) splash(s.wx - S.wx + (s.t > 1 ? s.len : 0), 16); }
  GW.serp = GW.serp.filter(s => s.t < s.dur + .2);
  for (const w of GW.wrecks) { w.t += dt; if (Math.random() < .08 && parts.length < 1300) { const x = w.wx - S.wx; if (x > -40 && x < W + 40) parts.push({ k: 'smoke', x: x + rand(-w.w, w.w) * .5, y: w.y - 6, vx: -S.scroll * .5, vy: -rand(20, 40), life: rand(1, 1.8), max: 1.8, r: rand(6, 12), g: 14, c: '40,36,40' }); } }
  const lv = levelOf(S.sector);
  const ash = GW.theme === 2, snow = GW.theme === 3, bliz = snow && lv >= 7;
  if (ash ? lv >= 4 : snow || (lv >= 8 && lv <= 9)) {
    if (GW.rain.length < (bliz ? 260 : snow ? 110 : ash ? 120 : 90)) for (let i = 0; i < (bliz ? 7 : snow ? 2 : ash ? 2 : 4); i++) GW.rain.push({ x: rand(0, W + (bliz ? 600 : 200)), y: rand(-40, 0), v: snow ? rand(70, 150) : ash ? rand(60, 160) : rand(700, 900), e: (ash || snow) && Math.random() < .3 });
    const hk = bliz ? 3.2 : snow ? .5 : .35;
    for (const r of GW.rain) { r.x -= (r.v * hk + S.scroll) * dt; r.y += r.v * dt; }
    GW.rain = GW.rain.filter(r => r.y < H && r.x > -40);
    GW.bolt -= dt; if (GW.bolt <= 0 && !snow && (!ash || lv >= 8)) { GW.bolt = rand(5, 11); S.wflash = Math.max(S.wflash, .35); GW.boltX = rand(W * .1, W * .9); GW.boltT = .25; if (AC) sfx.boom(70, GW.boltX, 'big'); }
  } else GW.rain.length = 0;
  if (GW.boltT > 0) GW.boltT -= dt;
  if (ash && Math.random() < dt * 4 && parts.length < 1200) { const x = rand(0, W); parts.push({ k: 'ember', x, y: solidTopAt(x) - 2, vx: -S.scroll * .3 + rand(-10, 10), vy: -rand(30, 80), life: rand(1, 2), max: 2, c: pick(['255,150,60', '255,200,100']), r: rand(1, 2) }); }
}
function splash(x, n) {
  for (let i = 0; i < n; i++) parts.push({ k: 'spark', x: x + rand(-8, 8), y: waterY(), vx: rand(-60, 60), vy: -rand(80, 220), life: rand(.3, .6), max: .6, c: pick(GW && GW.theme === 2 ? ['255,200,100', '255,140,60', '255,240,180'] : ['200,240,255', '255,255,255', '140,210,240']), w: 1.4 });
}

