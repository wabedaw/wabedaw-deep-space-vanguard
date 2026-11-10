"""Frame-rate independence: the same seed must play out identically on 60, 144 and 37 fps displays.

    node tools/build.mjs && python3 tests/framerate_test.py [game seconds, default 60]

Drives the game's real main loop (frame()) with synthetic display timestamps at each rate. The campaign bot
reads the game and steers once per simulation step (SIM.hooks), the way recorded inputs will be replayed.
Logs sector changes, boss starts/ends and a state checksum every 300 steps, then compares the three runs.
Also checks that interpolated rendering at 144 fps never leaves an object at a non-finite position.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GAME = os.path.join(ROOT, 'dist', 'claude', 'ashwing.html')
SECS = float(sys.argv[1]) if len(sys.argv) > 1 else 60
html = open(GAME, encoding='utf-8').read().replace(
    "const hot = window.claude && window.claude.hot;",
    "window.__dbg={S,P,K,RNG,SIM,frame,startGame,ships,holes,ebul,parts,ceilAt,floorAt,solidTopAt,get IW() { return IW; }, get W() { return W; }, get H() { return H; }};\nconst hot = window.claude && window.claude.hot;", 1)
assert '__dbg' in html

BOT = r"""
window.log = []; window.prev = {}; window.bad = 0;
const D = window.__dbg;
D.SIM.hooks.push(() => {
  const S = D.S, P = D.P, W = D.W, H = D.H, k = D.SIM.step;
  const B0 = S.boss, cur = { sector: S.sector, boss: B0 ? (B0.label || B0.kind) : '' };
  for (const key in cur) if (cur[key] !== window.prev[key]) log.push([key, cur[key], k]);
  window.prev = cur;
  if (k % 300 === 0) log.push(['sum', k, S.score, D.ships.length, D.ebul.length, D.RNG.state, Math.round(P.x * 100), Math.round(P.y * 100)]);
  P.hull = 100; P.shield = 100; P.inv = 9; P.mis = P.misMax;
  if (D.holes.length && (P.cap || D.holes.some(h => Math.hypot(h.x - P.x, h.y - P.y) < h.R * 1.15))) { D.holes.length = 0; P.cap = null; }
  const st = Math.ceil(S.sector / 10), floor = [0, 3, 5, 7, 8, 9, 9, 10, 10, 10, 10][Math.min(st, 10)] || 10; if (P.lvl < floor) P.lvl = floor;
  const B = S.boss; P.weapon = B ? 'beam' : 'spread';
  if (S.trans || S.mode !== 'play') return;
  D.K.missile = (k % 45) < 2;
  let tgt = null;
  if (B) {
    const ps = B.parts.filter(p => !p.dead && !p.hidden);
    if (ps.length) tgt = S.side ? ps.slice().sort((a, c) => a.x - c.x)[0] : ps.slice().sort((a, c) => c.y - a.y)[0];
    else tgt = B.kind === 'omega' ? { x: B.x + B.gox, y: B.y + B.goy } : B.bb ? { x: B.x, y: B.y - B.hh * .1 } : B;
  } else {
    let bd = 1e9;
    for (const e of D.ships) { if (e.dead || e.dying) continue; if (S.side ? (e.x < P.x + 30 || e.x > W) : (e.y > P.y - 30 || e.y < 0)) continue; const d = Math.abs(S.side ? e.y - P.y : e.x - P.x); if (d < bd) { bd = d; tgt = e; } }
  }
  if (S.side) {
    let ty = tgt ? tgt.y : H * .5;
    if (D.IW) ty = Math.min(Math.max(ty, D.ceilAt(P.x) + 34), D.floorAt(P.x) - 34); else ty = Math.min(ty, D.solidTopAt(P.x) - 34);
    P.y += (ty - P.y) * .06; P.x += (W * .2 - P.x) * .05;
  } else { const tx = tgt ? tgt.x : W / 2; P.x += (tx - P.x) * .06; P.y += (H * .78 - P.y) * .05; }
});
window.t0 = performance.now(); window.nf = 0;
window.pump = (fps, secs) => {
  const n = Math.round(secs * fps), errs = [];
  for (let i = 0; i < n; i++) {
    window.nf++;
    try { D.frame(window.t0 + window.nf * 1000 / fps); } catch (e) { if (errs.length < 5) errs.push(e.message); }
    if (window.nf % 7 === 0) { const chk = o => { if (!Number.isFinite(o.x) || !Number.isFinite(o.y)) window.bad++; }; chk(D.P); D.ships.forEach(chk); }
  }
  return { step: D.SIM.step, sector: D.S.sector, errs };
};
"""

async def one(b, fps):
    ctx = await b.new_context(viewport={'width': 1280, 'height': 800})
    await ctx.add_init_script("window.requestAnimationFrame = () => 0;")
    pg = await ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'Failed to load resource' not in m.text else None)  # the sandbox cannot reach Google Fonts
    await pg.set_content('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>')
    await pg.wait_for_timeout(300)
    await pg.evaluate("() => {" + BOT + "}")
    await pg.evaluate("() => { const D = window.__dbg; D.S.startStage = 1; D.S.nextSeed = 4242; D.startGame(); window.t0 = performance.now(); D.frame(window.t0); }")
    left, res = SECS, None
    while left > 0:
        s = min(10, left); res = await pg.evaluate("([f, s]) => pump(f, s)", [fps, s]); left -= s; errs += res['errs']
    log = await pg.evaluate("() => window.log"); bad = await pg.evaluate("() => window.bad")
    await ctx.close()
    return {'fps': fps, 'log': log, 'steps': res['step'], 'sector': res['sector'], 'errors': errs, 'bad': bad}

def cut(log, steps):  # compare only what every run reached
    return [e for e in log if (e[2] if e[0] != 'sum' else e[1]) < steps]

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        runs = await asyncio.gather(one(b, 60), one(b, 144), one(b, 37))
        await b.close()
    ok = True
    def check(name, cond, info=''):
        nonlocal ok; ok &= bool(cond); print(('PASS ' if cond else 'FAIL ') + name + (('  ' + str(info)) if info else ''), flush=True)
    n = min(r['steps'] for r in runs) - 1
    base = cut(runs[0]['log'], n)
    for r in runs:
        check(f"{r['fps']} fps: no errors, every position finite", not r['errors'] and r['bad'] == 0, (r['errors'][:2], r['bad']))
    for r in runs[1:]:
        other = cut(r['log'], n)
        check(f"{r['fps']} fps plays out exactly like 60 fps", other == base, next((f'first difference: {x} vs {y}' for x, y in zip(base, other) if x != y), f'lengths {len(base)} vs {len(other)}'))
    print(f"compared {n} simulation steps ({n / 60:.0f} s), reached sector {runs[0]['sector']}, {len(base)} log entries")
    sys.exit(0 if ok else 1)

asyncio.run(main())
