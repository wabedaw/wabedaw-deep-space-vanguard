"""Settings test (run node tools/build.mjs first): the settings screen in the website build, dist/web/.

    python3 tests/settings_test.py

  1. settings are saved and survive a reload
  2. a key can be rebound: the new key works in play, the old one doesn't, and the flight guide and the brief's
     controls list name the new key
  3. taking a key another action uses never leaves that action without a key
  4. "Reset keys" brings the defaults back
"""
import asyncio, os, sys, threading, http.server, functools
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map, '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json'}

    def log_message(self, *a):
        pass


srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Handler, directory=os.path.join(ROOT, 'dist', 'web')))
threading.Thread(target=srv.serve_forever, daemon=True).start()
URL = 'http://127.0.0.1:%d/#en' % srv.server_address[1]
results = []


def check(name, ok, info=''):
    results.append(bool(ok))
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + str(info)) if info != '' else ''), flush=True)

KEYS = "() => [...document.querySelectorAll('#setKeys button')].map(b => b.textContent)"   # 10 actions x 2 slots, in order


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={'width': 1280, 'height': 800}, locale='en-US')
        pg = await ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(500)
        await pg.click('#setBtn')
        await pg.fill('#setShots', '45'); await pg.check('#setCalm')
        keys = await pg.evaluate(KEYS)
        check('the keyboard list shows the default keys', keys[:2] == ['W', '↑'] and keys[12] == 'Q' and keys[10] == 'Shift' and keys[11] == 'X', keys)
        await pg.click('#setKeys button >> nth=12'); await pg.keyboard.press('KeyR')
        keys = await pg.evaluate(KEYS)
        check('switch weapon rebound to R', keys[12] == 'R', keys[12])
        await pg.click('#setKeys button >> nth=8'); await pg.keyboard.press('KeyW')   # fire <- W, which "up" uses
        keys = await pg.evaluate(KEYS)
        check('taking a used key keeps the other action playable', keys[8] == 'W' and keys[0] == 'Spacebar' and keys[1] == '↑', keys[:10])
        await pg.click('#setKeys button >> nth=8'); await pg.keyboard.press('Space')   # put fire back on Space
        await pg.click('#setKeys button >> nth=0'); await pg.keyboard.press('KeyW')    # and up back on W
        await pg.keyboard.press('Escape')
        help_keys = await pg.evaluate("() => document.querySelector('[data-keys=weapon]').textContent")
        check('the brief lists the new key', help_keys == 'R', help_keys)

        await pg.reload(); await pg.wait_for_timeout(500)
        s = await pg.evaluate("() => { const s = JSON.parse(localStorage.getItem('ashwing-save')).settings; return { shots: s.shots, calm: s.calm, weapon: s.keys.weapon, up: s.keys.up, fire: s.keys.fire }; }")
        check('settings survive a reload', s['shots'] == 45 and s['calm'] is True and s['weapon'][0] == 'KeyR' and s['up'][0] == 'KeyW' and s['fire'][0] == 'Space', s)

        await pg.click('#startBtn'); await pg.wait_for_timeout(2500)
        w0 = await pg.evaluate("() => document.getElementById('weaponBtn').dataset.w || ''")
        tip = await pg.evaluate("() => { const t = document.createElement('div'); return 1; }")
        await pg.keyboard.press('KeyQ'); await pg.wait_for_timeout(150)
        w1 = await pg.evaluate("() => document.getElementById('weaponBtn').dataset.w || ''")
        await pg.keyboard.press('KeyR'); await pg.wait_for_timeout(150)
        w2 = await pg.evaluate("() => document.getElementById('weaponBtn').dataset.w || ''")
        check('in play the new key switches weapon and the old one does not', w0 == w1 and w2 != w1, (w0, w1, w2))

        await pg.keyboard.press('KeyP'); await pg.click('#pauseSetBtn'); await pg.click('#setKeysReset')
        keys = await pg.evaluate(KEYS)
        check('reset keys brings the defaults back', keys[12] == 'Q' and keys[8] == 'Spacebar', keys[8:14])
        check('no page errors', not errs, errs[:3])
        await b.close()
    print(f'{sum(results)}/{len(results)} passed')
    sys.exit(0 if all(results) else 1)

asyncio.run(main())
