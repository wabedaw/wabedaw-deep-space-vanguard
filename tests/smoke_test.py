"""Smoke-test the website build in web/: serves it from a sub-path, checks Chinese/English, fonts,
no external requests, a run can start, and no page errors.

    python3 tests/smoke_test.py
"""
import asyncio, os, sys, threading, http.server, functools, tempfile, shutil
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
site = tempfile.mkdtemp()
shutil.copytree(os.path.join(ROOT, 'web'), os.path.join(site, 'games', 'deep-space-vanguard'))


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map,
                      '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2'}

    def log_message(self, *a):
        pass


srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Handler, directory=site))
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = 'http://127.0.0.1:%d' % srv.server_address[1]
results = []


def check(name, ok, info=''):
    results.append(ok)
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + str(info)) if info != '' else ''), flush=True)


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for loc, want in [('zh-CN', 'zh'), ('en-US', 'en')]:
            ctx = await b.new_context(viewport={'width': 1280, 'height': 800}, locale=loc)
            ext, errs = [], []

            async def guard(route):
                u = route.request.url
                if u.startswith(BASE) or u.startswith(('data:', 'blob:')):
                    await route.continue_()
                else:
                    ext.append(u); await route.abort()
            await ctx.route('**/*', guard)
            pg = await ctx.new_page()
            pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.goto(BASE + '/games/deep-space-vanguard/')
            await pg.wait_for_timeout(1000)
            lang = await pg.evaluate('() => document.documentElement.lang')
            check(f'{want}: language follows the browser', lang.startswith(want), lang)
            fonts = await pg.evaluate("async () => { await document.fonts.ready; return [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family.replace(/\"/g, '')); }")
            check(f'{want}: self-hosted fonts load', 'Chakra Petch' in fonts and (want == 'en' or 'Noto Sans SC' in fonts), sorted(set(fonts)))
            await pg.click('#startBtn')
            await pg.wait_for_function("() => document.body.classList.contains('in-play')", timeout=20000)
            await pg.wait_for_timeout(4000)
            check(f'{want}: a run starts and plays', True)
            check(f'{want}: no external requests', not ext, ext[:3])
            check(f'{want}: no page errors', not errs, errs[:3])
            await ctx.close()
        await b.close()
    srv.shutdown(); shutil.rmtree(site, ignore_errors=True)
    print('%d/%d passed' % (sum(results), len(results)))
    sys.exit(0 if all(results) else 1)

asyncio.run(main())
