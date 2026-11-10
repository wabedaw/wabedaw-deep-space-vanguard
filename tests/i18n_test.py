"""Language test (run node tools/build.mjs first): all four languages in the website build, dist/web/.

    python3 tests/i18n_test.py

For English, Simplified Chinese, Traditional Chinese and Japanese: the page opens in that language, loads that
language's own CJK font, starts a run without errors, and every translated piece of markup (as the browser actually
serializes it, which is what the game looks up) has an entry in the language table. Saves a menu and an in-game
screenshot of each language to tests/out/lang-<code>-*.png for a visual check.
"""
import asyncio, os, sys, threading, http.server, functools
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'tests', 'out'); os.makedirs(OUT, exist_ok=True)


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map, '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json'}

    def log_message(self, *a):
        pass


srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Handler, directory=os.path.join(ROOT, 'dist', 'web')))
threading.Thread(target=srv.serve_forever, daemon=True).start()
URL = 'http://127.0.0.1:%d/' % srv.server_address[1]
results = []
FONT = {'en': None, 'zh-Hans': 'Noto Sans SC', 'zh-Hant': 'Noto Sans TC', 'ja': 'Noto Sans JP'}
SAMPLE = {'zh-Hans': '启航', 'zh-Hant': '啟航', 'ja': '出撃'}


def check(name, ok, info=''):
    results.append(bool(ok))
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + str(info)) if info != '' else ''), flush=True)


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        # the markup's English, as the browser serializes it (the lookup keys)
        ctx = await b.new_context(viewport={'width': 1280, 'height': 800}, locale='en-US'); pg = await ctx.new_page()
        await pg.goto(URL + '#en'); await pg.wait_for_timeout(300)
        keys = await pg.evaluate("""() => [...document.querySelectorAll('[data-zh]')].map(e => e.innerHTML.trim())
                                          .concat([...document.querySelectorAll('[data-zh-aria]')].map(e => e.getAttribute('aria-label')))""")
        await ctx.close()
        for lang, font in FONT.items():
            ctx = await b.new_context(viewport={'width': 1920, 'height': 1080}, locale='en-US')
            pg = await ctx.new_page(); errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.goto(URL + '#' + lang); await pg.wait_for_timeout(1500)
            info = await pg.evaluate("""(keys) => ({ lang: document.documentElement.lang, title: document.title,
                missing: LANG === 'en' || LANG === 'zh-Hans' ? [] : keys.filter(k => !(k in LANG_TABLES[LANG])),
                sel: document.getElementById('langSel').value })""", keys)
            check(f'{lang}: page opens in {lang}', info['lang'] == lang and info['sel'] == lang, (info['lang'], info['title']))
            check(f'{lang}: every markup string has a translation', not info['missing'], info['missing'][:4])
            if font:
                await pg.evaluate("(t) => { const s = document.createElement('span'); s.textContent = t; s.style.cssText = 'position:fixed;opacity:0;font:700 20px var(--f-body)'; document.body.appendChild(s); }", SAMPLE[lang])
                await pg.wait_for_timeout(800)
                loaded = await pg.evaluate("(f) => [...document.fonts].filter(x => x.family.replace(/\"/g, '') === f && x.status === 'loaded').length", font)
                check(f'{lang}: its own font ({font}) loads', loaded > 0, loaded)
            await pg.screenshot(path=os.path.join(OUT, f'lang-{lang}-menu.png'))
            await pg.click('#startBtn'); await pg.wait_for_timeout(4500)
            await pg.screenshot(path=os.path.join(OUT, f'lang-{lang}-play.png'))
            mode = await pg.evaluate("() => document.getElementById('menu').hidden")
            check(f'{lang}: a run starts with no page errors', mode and not errs, errs[:2])
            await ctx.close()
        await b.close()
    print(f'{sum(results)}/{len(results)} passed')
    sys.exit(0 if all(results) else 1)

asyncio.run(main())
