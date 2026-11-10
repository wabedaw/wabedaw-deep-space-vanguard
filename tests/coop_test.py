"""Two-pilot test (M1 step 4; run node tools/build.mjs first). Drives the single-file build step by step.

    python3 tests/coop_test.py

  1. a two-pilot run starts with both pilots flying, player 2 beside player 1
  2. one controller goes to player 2 (player 1 keeps the keyboard); its stick moves player 2 only
  3. a pickup goes to the pilot nearest to it
  4. enemies aim at the nearest pilot (aimAt / nearestPlayer)
  5. losing one pilot doesn't end the run; losing both does
  6. the same seed replays the same two-pilot run, and it differs from the one-pilot run
  7. drawing two pilots (ships, the 2P mark, the 2P panel) raises no errors
"""
import asyncio, os, sys
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
html = open(os.path.join(ROOT, 'dist', 'claude', 'ashwing.html'), encoding='utf-8').read().replace(
    "const hot = window.claude && window.claude.hot;",
    "window.__dbg={S,PLAYERS,KB,RNG,update,render,startGame,powers,ships,ebul,nearestPlayer,aimAt,gameOver,withPlayer,pollGamepad,get P(){return P},get W(){return W},get H(){return H}};\nconst hot = window.claude && window.claude.hot;", 1)
assert '__dbg' in html
PAD = """
window.__pad = { axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })), connected: true, mapping: 'standard', id: 'test pad', index: 0 };
navigator.getGamepads = () => [window.__pad];
window.requestAnimationFrame = () => 0;
"""
results = []


def check(name, ok, info=''):
    results.append(bool(ok))
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + str(info)) if info != '' else ''), flush=True)


async def page(b):
    ctx = await b.new_context(viewport={'width': 1280, 'height': 800})
    await ctx.add_init_script(PAD)
    pg = await ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.set_content('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>')
    await pg.wait_for_timeout(300)
    return ctx, pg, errs

START = "([n, seed]) => { const D = __dbg; D.S.playersNext = n; D.S.startStage = 1; D.S.nextSeed = seed; D.startGame(); }"
STEP = "(n) => { const D = __dbg; for (let i = 0; i < n; i++) { D.pollGamepad(); D.update(1 / 60); } }"


async def run_log(b, n, seed, secs):
    ctx, pg, errs = await page(b)
    await pg.evaluate(START, [n, seed])
    log = await pg.evaluate("""(secs) => {
      const D = __dbg, out = [];
      for (let i = 1; i <= secs * 60; i++) { D.PLAYERS[0].inv = 9; D.update(1 / 60); if (i % 300 === 0) out.push([D.S.sector, D.S.score, D.ships.length, D.RNG.state, ...D.PLAYERS.map(p => [Math.round(p.x), Math.round(p.y), p.alive, Math.round(p.hull)])]); }
      return out; }""", secs)
    await ctx.close()
    return log, errs


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx, pg, errs = await page(b)
        await pg.evaluate(START, [2, 4242])
        await pg.evaluate(STEP, 90)
        s = await pg.evaluate("() => __dbg.PLAYERS.map(p => ({ id: p.id, alive: p.alive, x: Math.round(p.x), y: Math.round(p.y), kb: p.K === __dbg.KB }))")
        check('a two-pilot run starts with both pilots flying', len(s) == 2 and s[0]['alive'] and s[1]['alive'], s)
        check('player 2 flies beside player 1', abs(s[1]['x'] - s[0]['x']) > 40, s)
        check('player 1 keeps the keyboard, player 2 has its own controls', s[0]['kb'] and not s[1]['kb'], s)

        before = await pg.evaluate("() => __dbg.PLAYERS.map(p => p.x)")
        await pg.evaluate("() => { __pad.axes = [-1, 0, 0, 0]; }"); await pg.evaluate(STEP, 40); await pg.evaluate("() => { __pad.axes = [0, 0, 0, 0]; }"); await pg.evaluate(STEP, 1)   # release the stick
        after = await pg.evaluate("() => __dbg.PLAYERS.map(p => p.x)")
        check('the controller moves player 2 only', after[1] < before[1] - 80 and abs(after[0] - before[0]) < 30, (before, after))

        r = await pg.evaluate("""() => { const D = __dbg, [a, c] = D.PLAYERS; a.x = 200; a.y = 600; c.x = 1000; c.y = 600; a.lvl = 1; c.lvl = 1;
          D.powers.push({ x: 1000, y: 560, type: 'W', t: 0, vy: 0 });
          for (let i = 0; i < 30; i++) D.update(1 / 60);
          return [a.lvl, c.lvl]; }""")
        check('a pickup goes to the nearest pilot', r == [1, 2], r)

        r = await pg.evaluate("""() => { const D = __dbg, [a, c] = D.PLAYERS; a.x = 200; c.x = 1000;
          const near = D.nearestPlayer(950, 100).id, far = D.nearestPlayer(150, 100).id;
          D.aimAt({ x: 980, y: 50 }); const aimed = D.P.id; D.withPlayer(a, () => {});
          c.alive = false; const fallback = D.nearestPlayer(950, 100).id; c.alive = true;
          return [near, far, aimed, fallback]; }""")
        check('enemies aim at the nearest pilot still flying', r == [1, 0, 1, 0], r)

        r = await pg.evaluate("""() => { const D = __dbg, [a, c] = D.PLAYERS;
          D.withPlayer(c, () => D.gameOver());
          for (let i = 0; i < 200; i++) D.update(1 / 60);
          const mid = [D.S.mode, a.alive, c.alive];
          D.withPlayer(a, () => D.gameOver());
          for (let i = 0; i < 200; i++) D.update(1 / 60);
          return [mid, D.S.mode]; }""")
        check('losing one pilot does not end the run', r[0] == ['play', True, False], r)
        check('losing both pilots ends the run', r[1] == 'over', r)
        await pg.evaluate("() => __dbg.render()")
        check('no page errors (two pilots)', not errs, errs[:3])
        await ctx.close()

        ctx, pg, errs = await page(b)
        await pg.evaluate(START, [2, 99])
        await pg.evaluate(STEP, 120)
        await pg.evaluate("() => { const D = __dbg; for (let i = 0; i < 20; i++) { D.update(1 / 60); D.render(); } }")
        await pg.screenshot(path=os.path.join(ROOT, 'tests', 'out', 'coop-2p.png'))
        check('drawing two pilots raises no errors', not errs, errs[:3])
        await ctx.close()

        A, ea = await run_log(b, 2, 12345, 60)
        B, eb = await run_log(b, 2, 12345, 60)
        C, ec = await run_log(b, 1, 12345, 60)
        check('the same seed replays the same two-pilot run', A == B and len(A) == 12, len(A))
        check('a two-pilot run differs from the one-pilot run', [r[:4] for r in A] != [r[:4] for r in C])
        check('no page errors (replays)', not (ea or eb or ec), (ea + eb + ec)[:2])
        await b.close()
    print(f'{sum(results)}/{len(results)} passed')
    sys.exit(0 if all(results) else 1)

asyncio.run(main())
