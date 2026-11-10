"""Difficulty and checkpoint test (M2; run node tools/build.mjs first).

    python3 tests/difficulty_test.py

  1. the brief lists the four difficulties; insane and nightmare are locked; picking hard is remembered
  2. on hard, enemies and bosses take 1.5x the punishment, enemy shots fly 1.2x faster, score pays 1.5x
  3. on normal every factor is 1 (normal runs play exactly as before; tests/determinism_test.py checks the runs)
  4. a boss warning notes a checkpoint; after a crash the mission report offers it, and flying from it puts the run
     right before that boss with the score, weapon level and missiles of that moment
  5. a hard run posts to the hard leaderboard (CAMPAIGN_HARD_SOLO)
"""
import asyncio, os, sys
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
html = open(os.path.join(ROOT, 'dist', 'claude', 'ashwing.html'), encoding='utf-8').read().replace(
    "const hot = window.claude && window.claude.hot;",
    "window.__dbg={S,PLAYERS,SAVE,BAL,update,startGame,ships,ebul,damage,eFire,addScore,gameOver,withPlayer,lbBoard,spawnShip:typeof spawnShip==='function'?spawnShip:null,get P(){return P},get TIER(){return TIER}};\nconst hot = window.claude && window.claude.hot;", 1)
results = []


def check(name, ok, info=''):
    results.append(bool(ok))
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + str(info)) if info != '' else ''), flush=True)

FACTORS = """() => { const D = __dbg; D.update(1 / 60);
  const e = { type: 'raider', x: 300, y: 200, hp: 100, maxhp: 100, r: 14 }; D.ships.push(e); D.damage(e, 30, 300, 200, true); const ehp = e.hp; e.dead = true;
  const b = { type: 'boss', x: 300, y: 200, hp: 1000, maxhp: 1000, r: 40, parts: [] }; D.damage(b, 30, 300, 200, true); const bhp = b.hp;
  D.ebul.length = 0; D.eFire('orb', 100, 100, 0, 100); const vx = D.ebul[0].vx;
  const s0 = D.S.score; D.S.combo = 0; D.addScore(100, 10, 10); const gained = D.S.score - s0;
  return { diff: D.S.diff, ehp, bhp, vx, gained }; }"""


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={'width': 1280, 'height': 800})
        await ctx.add_init_script("window.requestAnimationFrame = () => 0;")
        pg = await ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.set_content('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>')
        await pg.wait_for_timeout(400)
        picks = await pg.evaluate("() => [...document.querySelectorAll('#diffPick button')].map(b => [b.dataset.diff, b.disabled, b.classList.contains('on')])")
        check('the brief lists four difficulties, insane and nightmare locked', picks == [['normal', False, True], ['hard', False, False], ['insane', True, False], ['nightmare', True, False]], picks)
        await pg.evaluate("() => document.querySelector('#diffPick [data-diff=hard]').click()")
        check('picking hard is remembered', await pg.evaluate("() => __dbg.SAVE.get('diff')") == 'hard')

        await pg.evaluate("() => { const D = __dbg; D.S.startStage = 1; D.S.nextSeed = 5; D.startGame(); }")
        f = await pg.evaluate(FACTORS)
        check('hard: enemies take 1.5x the punishment', f['diff'] == 'hard' and abs(f['ehp'] - 80) < 1e-9, f)
        check('hard: bosses take 1.5x the punishment', abs(f['bhp'] - 980) < 1e-9, f)
        check('hard: enemy shots fly 1.2x faster', abs(f['vx'] - 120) < 1e-9, f)
        check('hard: score pays 1.5x', f['gained'] == 150, f)
        check('a hard run posts to the hard leaderboard', await pg.evaluate("() => __dbg.lbBoard()") == 'CAMPAIGN_HARD_SOLO')

        await pg.evaluate("() => { __dbg.SAVE.set('diff', 'normal'); const D = __dbg; D.S.startStage = 1; D.S.nextSeed = 5; D.startGame(); }")
        f = await pg.evaluate(FACTORS)
        check('normal: every factor is 1', f['diff'] == 'normal' and f['ehp'] == 70 and f['bhp'] == 970 and f['vx'] == 100 and f['gained'] == 100, f)

        r = await pg.evaluate("""() => { const D = __dbg, S = D.S;
          for (let i = 0; i < 200; i++) D.update(1 / 60);
          S.sector = 3; S.sectorT = 1e3; S.score = 4321; D.PLAYERS[0].lvl = 6; D.PLAYERS[0].mis = 3;
          for (let i = 0; i < 3; i++) D.update(1 / 60);
          const cp = S.cp && { sector: S.cp.sector, score: S.cp.score, lvl: S.cp.pilots[0].lvl, mis: S.cp.pilots[0].mis };
          S.score = 9999; D.withPlayer(D.PLAYERS[0], () => D.gameOver());
          for (let i = 0; i < 200; i++) D.update(1 / 60);
          const btn = document.getElementById('cpBtn');
          return { cp, warn: S.bossPending, mode: S.mode, shown: !btn.hidden, label: btn.textContent, focus: document.activeElement && document.activeElement.id }; }""")
        check('a boss warning notes a checkpoint', r['cp'] == {'sector': 3, 'score': 4321, 'lvl': 6, 'mis': 3}, r)
        check('the mission report offers the checkpoint first', r['mode'] == 'over' and r['shown'] and 'checkpoint' in r['label'].lower() and r['focus'] == 'cpBtn', r)
        await pg.click('#cpBtn')
        r = await pg.evaluate("""() => { const D = __dbg, S = D.S, before = { sector: S.sector, score: S.score, lvl: D.PLAYERS[0].lvl, mis: D.PLAYERS[0].mis, mode: S.mode };
          for (let i = 0; i < 30; i++) D.update(1 / 60);
          return { before, warn: S.bossPending || !!S.boss, alive: D.PLAYERS[0].alive }; }""")
        check('flying from the checkpoint restores sector, score, weapon level and missiles', r['before'] == {'sector': 3, 'score': 4321, 'lvl': 6, 'mis': 3, 'mode': 'play'}, r)
        check('the boss comes straight away', r['warn'] and r['alive'], r)
        check('no page errors', not errs, errs[:3])
        await b.close()
    print(f'{sum(results)}/{len(results)} passed')
    sys.exit(0 if all(results) else 1)

asyncio.run(main())
