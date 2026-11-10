"""Steam leaderboard screen test (run node tools/build.mjs first), with a simulated Steam bridge.

    python3 tests/steam_board_test.py

The real bridge needs the desktop app and a running Steam client (platform/steam/native/PATCHES.md). Here the
page gets a fake window.ashwingNative with leaderboards, so the game's own code paths run:
  1. the leaderboard screen shows the Steam board (Steam names and ranks, the player's own row marked)
  2. a finished run posts score + details [format, stage, sector, kills, cleared, seed] to CAMPAIGN_NORMAL_SOLO
  3. the run report shows the new rank; a lower score keeps the old best
  4. without leaderboards in the bridge (upstream binary) the screen falls back to this device's runs
  5. a Steam error falls back to this device's runs too
"""
import asyncio, os, sys
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
html = open(os.path.join(ROOT, 'dist', 'claude', 'ashwing.html'), encoding='utf-8').read().replace(
    "const hot = window.claude && window.claude.hot;",
    "window.__dbg={S,P,LB,lbRecordRun,openLb,closeLb,PLATFORM};\nconst hot = window.claude && window.claude.hot;", 1)
assert '__dbg' in html

FAKE = r"""
window.__files = {}; window.__uploads = []; window.__fail = %(fail)s;
window.__board = [{ rank: 1, score: 900000, name: 'Rival One', steamId: '1', details: [1, 9, 85, 700, 0, 5], me: false },
                  { rank: 2, score: 500000, name: 'Rival Two', steamId: '3', details: [1, 6, 55, 400, 0, 9], me: false }];
window.ashwingNative = {
  read: n => window.__files[n] || null, write: (n, t) => { window.__files[n] = t; return true; },
  language: () => 'english', isSteamDeck: () => false, achieve() {}, setStat() {}, storeStats() {},
  quit() {}, setFullscreen() {}, isFullscreen: () => true,
  hasLeaderboards: () => %(boards)s,
  async getScores(name, o) {
    if (window.__fail) throw new Error('no connection');
    if (o.request === 'around') return window.__board.filter(e => e.me);
    return window.__board.slice(o.start - 1, o.end);
  },
  async uploadScore(name, score, o) {
    window.__uploads.push({ name, score, o });
    const mine = window.__board.find(e => e.me), changed = !mine || score > mine.score;
    if (changed) { if (mine) Object.assign(mine, { score, details: o.details }); else window.__board.push({ score, name: 'Me', steamId: '2', details: o.details, me: true }); }
    window.__board.sort((a, b) => b.score - a.score).forEach((e, i) => e.rank = i + 1);
    return { score, changed, rank: window.__board.find(e => e.me).rank, previousRank: 0 };
  },
};
"""
results = []


def check(name, ok, info=''):
    results.append(bool(ok))
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + str(info)) if info != '' else ''), flush=True)


async def page(b, boards=True, fail=False):
    ctx = await b.new_context(viewport={'width': 1280, 'height': 800})
    await ctx.add_init_script(FAKE % {'boards': 'true' if boards else 'false', 'fail': 'true' if fail else 'false'})
    pg = await ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.set_content('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>')
    await pg.wait_for_timeout(500)
    return ctx, pg, errs


async def board_text(pg):
    await pg.evaluate("() => { __dbg.openLb('menu'); }"); await pg.wait_for_timeout(300)
    t = await pg.evaluate("() => ({ status: document.getElementById('lbStatus').textContent, rows: [...document.querySelectorAll('#lbList li')].map(li => li.innerText.replace(/\\s+/g, ' ').trim()), callForm: !document.getElementById('lbCallRow').hidden })")
    await pg.evaluate("() => __dbg.closeLb()")
    return t


async def run_end(pg, score, sector, kills):
    await pg.evaluate(f"() => {{ const D = __dbg; D.S.score = {score}; D.S.sector = {sector}; D.S.kills = {kills}; D.S.seed = 4242; D.lbRecordRun(); }}")
    await pg.wait_for_timeout(300)
    return await pg.evaluate("() => ({ status: __dbg.LB.last.status, rank: __dbg.LB.mine && __dbg.LB.mine.rank, note: document.getElementById('lbNote').textContent })")


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()

        ctx, pg, errs = await page(b)
        check('the game sees the Steam bridge with leaderboards', await pg.evaluate("() => __dbg.PLATFORM.kind === 'steam' && !!__dbg.PLATFORM.boards"))
        t = await board_text(pg)
        check('the screen shows the Steam board with Steam names', 'Steam' in t['status'] and any('Rival One' in r and '900,000' in r for r in t['rows']) and t['rows'][0].startswith('1'), t)
        check('no call-sign form on Steam (names come from Steam)', not t['callForm'])
        r = await run_end(pg, 600000, 25, 321)
        up = await pg.evaluate("() => window.__uploads[0]")
        check('a finished run posts score and details', up and up['name'] == 'CAMPAIGN_NORMAL_SOLO' and up['score'] == 600000 and up['o']['details'] == [1, 3, 25, 321, 0, 4242] and up['o']['keepBest'] is True and up['o']['sort'] == 'desc', up)
        check('the run report shows the new rank', r['status'] == 'sent' and r['rank'] == 2 and '#2' in r['note'], r)
        t = await board_text(pg)
        check('the player\'s row is marked on the board', any('Me' in row and ('YOU' in row) and '600,000' in row for row in t['rows']), t['rows'])
        r = await run_end(pg, 100000, 12, 50)
        check('a lower score keeps the best', r['status'] == 'kept' and r['rank'] == 2, r)
        check('no page errors (Steam board)', not errs, errs[:2])
        await ctx.close()

        ctx, pg, errs = await page(b, boards=False)
        await run_end(pg, 123450, 18, 99)
        t = await board_text(pg)
        check('without leaderboards in the bridge: this device\'s runs', await pg.evaluate("() => !__dbg.PLATFORM.boards") and any('123,450' in r for r in t['rows']), t)
        check('no page errors (no leaderboards)', not errs, errs[:2])
        await ctx.close()

        ctx, pg, errs = await page(b, fail=True)
        await pg.wait_for_timeout(300)
        await run_end(pg, 777000, 31, 10)
        t = await board_text(pg)
        check('when Steam fails: this device\'s runs and an explanation', 'Steam' in t['status'] and any('777,000' in r for r in t['rows']), t)
        check('no page errors (Steam failing)', not errs, errs[:2])
        await ctx.close()
        await b.close()
    print(f'{sum(results)}/{len(results)} passed')
    sys.exit(0 if all(results) else 1)

asyncio.run(main())
