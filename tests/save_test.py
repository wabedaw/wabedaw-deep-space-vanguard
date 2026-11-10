"""Save data test (run node tools/build.mjs first): the versioned save in dist/web/.

    python3 tests/save_test.py

  1. a v0.1 player's loose 'dsv-*' keys are migrated into one 'ashwing-save' and the game uses them
  2. progress made in the game is written back to 'ashwing-save'
  3. a save that can't be parsed is kept as 'ashwing-save.bad' and the game starts fresh
  4. a save from a newer version is used but never overwritten
"""
import asyncio, os, sys, json, threading, http.server, functools
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map, '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json'}

    def log_message(self, *a):
        pass


srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Handler, directory=os.path.join(ROOT, 'dist', 'web')))
threading.Thread(target=srv.serve_forever, daemon=True).start()
URL = 'http://127.0.0.1:%d/' % srv.server_address[1]
results = []


def check(name, ok, info=''):
    results.append(bool(ok))
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + str(info)) if info != '' else ''), flush=True)


async def page_with(b, storage):
    ctx = await b.new_context(viewport={'width': 1280, 'height': 800}, locale='en-US')
    pg = await ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.goto(URL + 'manifest.webmanifest')          # same origin, without running the game
    await pg.evaluate("(s) => { localStorage.clear(); for (const k in s) localStorage.setItem(k, s[k]); }", storage)
    await pg.goto(URL)
    await pg.wait_for_timeout(600)
    return ctx, pg, errs


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()

        legacy = {'dsv-best': '123450', 'dsv-best-en': '99', 'dsv-stage': '4', 'dsv-last': '3', 'dsv-lang': 'zh', 'dsv-sound': '1',
                  'dsv-tut': '{"weapon":1,"missile":1}', 'dsv-runs': '[{"s":123450,"st":4,"n":"ACE"}]', 'dsv-call': 'ACE'}
        ctx, pg, errs = await page_with(b, legacy)
        s = await pg.evaluate("() => JSON.parse(localStorage.getItem('ashwing-save'))")
        check('v0.1 keys are migrated into one versioned save', s and s['v'] == 1 and s['best'] == 123450 and s['stage'] == 4 and s['last'] == 3
              and s['lang'] == 'zh-Hans' and s['sound'] == 1 and s['tut'] == {'weapon': 1, 'missile': 1} and s['call'] == 'ACE' and len(s['runs']) == 1, s)
        ui = await pg.evaluate("() => ({ lang: document.documentElement.lang, best: document.body.innerText.includes('0123450') })")
        check('the game uses the migrated language and best score', ui['lang'] == 'zh-Hans' and ui['best'], ui)
        await pg.evaluate("() => { SAVE.set('best', 200000); SAVE.unlock('ACH_FIRST_BOSS'); SAVE.flush(); }")
        s = await pg.evaluate("() => JSON.parse(localStorage.getItem('ashwing-save'))")
        check('changes are written back', s['best'] == 200000 and 'ACH_FIRST_BOSS' in s['ach'], (s['best'], s['ach']))
        check('no page errors (migration)', not errs, errs[:2])
        await ctx.close()

        ctx, pg, errs = await page_with(b, {'ashwing-save': '{"v":1,"best":5'})
        r = await pg.evaluate("() => ({ bad: localStorage.getItem('ashwing-save.bad'), best: SAVE.get('best') })")
        check('a broken save is kept aside and the game starts fresh', r['bad'] == '{"v":1,"best":5' and r['best'] == 0, r)
        check('no page errors (broken save)', not errs, errs[:2])
        await ctx.close()

        newer = json.dumps({'v': 99, 'best': 777, 'lang': 'en', 'future': {'x': 1}})
        ctx, pg, errs = await page_with(b, {'ashwing-save': newer})
        await pg.evaluate("() => { SAVE.set('best', 1); SAVE.flush(); }")
        r = await pg.evaluate("() => ({ raw: localStorage.getItem('ashwing-save'), ro: SAVE.readOnly })")
        check('a save from a newer version is never overwritten', r['raw'] == newer and r['ro'], r)
        check('no page errors (newer save)', not errs, errs[:2])
        await ctx.close()
        await b.close()
    print(f'{sum(results)}/{len(results)} passed')
    sys.exit(0 if all(results) else 1)

asyncio.run(main())
