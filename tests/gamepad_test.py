"""Controller test (run node tools/build.mjs first): menus, settings and hints with a simulated standard gamepad.

    python3 tests/gamepad_test.py

  1. on the brief, A launches straight away (the default button)
  2. in play the stick moves the ship; Start pauses; B resumes
  3. on the pause screen the d-pad moves between buttons and A opens settings
  4. in settings, left / right change a slider and A ticks a box; B goes back to the pause screen
  5. with a controller in use, key hints on buttons are hidden and the flight guide names controller buttons
"""
import asyncio, os, sys
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
html = open(os.path.join(ROOT, 'dist', 'claude', 'ashwing.html'), encoding='utf-8').read().replace(
    "const hot = window.claude && window.claude.hot;",
    "window.__dbg={S,P,SET,TIPS,INPUT};\nconst hot = window.claude && window.claude.hot;", 1)
PAD = """
window.__pad = { axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })), connected: true, mapping: 'standard', id: 'test pad', index: 0 };
navigator.getGamepads = () => [window.__pad];
window.press = async (i) => { window.__pad.buttons[i] = { pressed: true, value: 1 }; await new Promise(r => setTimeout(r, 90)); window.__pad.buttons[i] = { pressed: false, value: 0 }; await new Promise(r => setTimeout(r, 90)); };
"""
A, B, START, UP, DOWN, LEFT, RIGHT = 0, 1, 9, 12, 13, 14, 15
results = []


def check(name, ok, info=''):
    results.append(bool(ok))
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + str(info)) if info != '' else ''), flush=True)


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={'width': 1280, 'height': 720})
        await ctx.add_init_script(PAD)
        pg = await ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.set_content('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>')
        await pg.wait_for_timeout(500)
        press = lambda i: pg.evaluate(f"() => press({i})")
        state = lambda: pg.evaluate("() => ({ mode: __dbg.S.mode, focus: document.activeElement && document.activeElement.id, set: !document.getElementById('setOv').hidden, pause: !document.getElementById('pauseOv').hidden })")

        await press(A); await pg.wait_for_timeout(2000)
        check('A on the brief launches the run', (await state())['mode'] == 'play')
        x0 = await pg.evaluate("() => __dbg.P.x")
        await pg.evaluate("() => { __pad.axes = [1, 0, 0, 0]; }"); await pg.wait_for_timeout(500); await pg.evaluate("() => { __pad.axes = [0, 0, 0, 0]; }")
        check('the stick moves the ship', await pg.evaluate("() => __dbg.P.x") > x0 + 50)
        await press(START)
        s = await state()
        check('Start pauses', s['mode'] == 'pause' and s['pause'], s)
        await press(B)
        check('B on the pause screen resumes', (await state())['mode'] == 'play')

        await press(START); await press(DOWN); await press(DOWN)
        s = await state()
        check('the d-pad moves to the settings button', s['focus'] == 'pauseSetBtn', s)
        await press(A)
        s = await state()
        check('A opens settings from the pause screen', s['set'] and s['focus'] == 'setMaster', s)
        await press(LEFT); await press(LEFT)
        check('left lowers the focused slider', await pg.evaluate("() => __dbg.SET.master") == 90)
        for _ in range(5): await press(DOWN)
        f = (await state())['focus']
        before = await pg.evaluate("() => __dbg.SET.hitbox")
        await press(A)
        after = await pg.evaluate("() => __dbg.SET.hitbox")
        check('A ticks the focused box', f == 'setHitbox' and after != before, (f, before, after))
        await press(B)
        s = await state()
        check('B goes back to the pause screen', not s['set'] and s['pause'] and s['mode'] == 'pause', s)

        r = await pg.evaluate("() => ({ pad: document.body.classList.contains('pad'), hint: getComputedStyle(document.querySelector('#resumeBtn span')).display, tip: __dbg.TIPS.weapon.text(), dev: __dbg.INPUT.last })")
        check('with a controller, key hints are hidden', r['pad'] and r['hint'] == 'none', r)
        check('the flight guide names controller buttons', 'X' in r['tip'] and 'Q' not in r['tip'], r['tip'])
        await pg.keyboard.press('KeyA')
        check('typing switches the hints back to the keyboard', await pg.evaluate("() => __dbg.INPUT.last") == 'kb' and 'Q' in await pg.evaluate("() => __dbg.TIPS.weapon.text()"))
        check('no page errors', not errs, errs[:3])
        await b.close()
    print(f'{sum(results)}/{len(results)} passed')
    sys.exit(0 if all(results) else 1)

asyncio.run(main())
