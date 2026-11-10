"""Determinism test: the same seed must replay the same run.

    node tools/build.mjs && python3 tests/determinism_test.py [game seconds per run, default 420]

Drives the game frame by frame (fixed 1/60 s steps, the page's own loop stopped) with the invincible
campaign bot, and logs every sector change, every boss start/end, and a checksum of the simulation state
(score, enemies, enemy bullets, RNG state, player position) every 10 game seconds. Then compares:
  A  seed 12345
  B  seed 12345 again                                   -> must equal A
  C  seed 12345, Chinese, muted, reduced motion, phone   -> must equal A (settings never change the game)
  D  seed 777                                           -> must differ from A
  E  seed 12345 in a 1920x1080 window                   -> must equal A (fixed logical play field)
  F  seed 12345 in a 1366x768 window at 2x pixel density -> must equal A
  G  seed 12345 in a 2560x1080 ultrawide window          -> must equal A
Then checks the real frame loop: feeding it 144 Hz (and uneven) frame times must give exactly the same state as
stepping the simulation 1/60 s at a time (fixed-step simulation), with interpolated drawing every frame.
"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GAME = os.path.join(ROOT, 'dist', 'claude', 'ashwing.html')
SECS = float(sys.argv[1]) if len(sys.argv) > 1 else 420
html = open(GAME, encoding='utf-8').read().replace(
    "const hot = window.claude && window.claude.hot;",
    "window.__dbg={S,P,K,RNG,update,render,startGame,frame,ships,holes,ebul,ceilAt,floorAt,solidTopAt,get IW() { return IW; }, get W() { return W; }, get H() { return H; }};\nconst hot = window.claude && window.claude.hot;", 1)
assert '__dbg' in html

STOP_LOOP = "window.requestAnimationFrame = () => 0;"   # the test drives every frame itself
BOT = r"""
window.fc = 0; window.log = []; window.prev = {};
window.bot = () => {
  const D = window.__dbg, S = D.S, P = D.P, W = D.W, H = D.H;
  P.hull = 100; P.shield = 100; P.inv = 9; P.mis = P.misMax;
  if (D.holes.length && (P.cap || D.holes.some(h => Math.hypot(h.x - P.x, h.y - P.y) < h.R * 1.15))) { D.holes.length = 0; P.cap = null; }
  const st = Math.ceil(S.sector / 10), floor = [0, 3, 5, 7, 8, 9, 9, 10, 10, 10, 10][Math.min(st, 10)] || 10; if (P.lvl < floor) P.lvl = floor;
  const B = S.boss; P.weapon = B ? 'beam' : 'spread';
  if (S.trans || S.mode !== 'play') return;
  D.K.missile = (window.fc % 45) < 2;
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
};
window.run = (secs) => {
  const D = window.__dbg, S = D.S, n = Math.round(secs * 60), errs = [];
  for (let i = 0; i < n; i++) {
    try { bot(); D.update(1 / 60); if (++window.fc % 20 === 0) D.render(); } catch (e) { if (errs.length < 5) errs.push(e.message); }
    const B = S.boss, cur = { sector: S.sector, boss: B ? (B.label || B.kind) : '' };
    for (const k in cur) if (cur[k] !== window.prev[k]) log.push([k, cur[k], window.fc]);
    window.prev = cur;
    if (window.fc % 600 === 0) log.push(['sum', window.fc, S.score, D.ships.length, D.ebul.length, D.RNG.state, Math.round(D.P.x), Math.round(D.P.y)]);
  }
  return { fc: window.fc, sector: S.sector, errs };
};
"""

async def one(b, seed, variant=False, view=(1280, 800), scale=1):
    ctx = await b.new_context(viewport={'width': view[0], 'height': view[1]}, device_scale_factor=scale, locale='zh-CN' if variant else 'en-US',
                              reduced_motion='reduce' if variant else 'no-preference', has_touch=variant)
    await ctx.add_init_script(STOP_LOOP)
    if variant:
        await ctx.add_init_script("try { localStorage.setItem('dsv-sound', '2'); localStorage.setItem('dsv-lang', 'zh'); } catch (e) {}")
    pg = await ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.set_content('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + html + '</body></html>')
    await pg.wait_for_timeout(300)
    await pg.evaluate("() => {" + BOT + "}")
    await pg.evaluate(f"() => {{ const D = window.__dbg; D.S.startStage = 1; D.S.nextSeed = {seed}; D.startGame(); }}")
    left, res = SECS, None
    while left > 0:
        step = min(20, left); res = await pg.evaluate("(s) => run(s)", step); left -= step
        errs += res['errs']
    log = await pg.evaluate("() => window.log")
    used = await pg.evaluate("() => window.__dbg.S.seed")
    field = await pg.evaluate("() => [window.__dbg.W, window.__dbg.H]")
    await ctx.close()
    return {'seed': used, 'sector': res['sector'], 'log': log, 'errors': errs, 'field': field}

LOOP = r"""
window.sum = () => { const D = window.__dbg, S = D.S; return [+S.t.toFixed(6), S.score, S.sector, D.ships.length, D.ebul.length, D.RNG.state, +D.P.x.toFixed(4), +D.P.y.toFixed(4)]; };
window.direct = (n) => { for (let i = 0; i < n; i++) window.__dbg.update(1 / 60); return sum(); };
window.looped = (secs, hz, jitter) => {   // hz 144: never lines up with 1/60 s; jitter: alternating 31.7 / 9.2 ms frames
  // drive the page's own frame() with synthetic timestamps; uneven mode alternates short and long frames
  // the first call only syncs the loop's clock (a paused frame takes no steps)
  const S = window.__dbg.S, m = S.mode; let now = performance.now(), i = 0; S.mode = 'pause'; window.__dbg.frame(now); S.mode = m;
  const t0 = S.t, t1 = now;
  while (S.t - t0 < secs - 1e-9 && i < 100000) { now += 1000 / hz * (jitter ? (i % 3 === 0 ? 1.9 : .55) : 1); i++; window.__dbg.frame(now); }
  window.wall = (now - t1) / 1000; return sum();
};
"""

async def loop_check(b):
    out = []
    for mode in ['direct', 'loop144', 'loop60uneven']:
        ctx = await b.new_context(viewport={'width': 1280, 'height': 800})
        await ctx.add_init_script(STOP_LOOP)
        pg = await ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.set_content('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>')
        await pg.wait_for_timeout(300)
        await pg.evaluate("() => {" + LOOP + "}")
        await pg.evaluate("() => { const D = window.__dbg; D.S.startStage = 1; D.S.nextSeed = 4242; D.startGame(); D.P.inv = 1e9; }")
        r = await pg.evaluate("() => direct(600)") if mode == 'direct' else \
            await pg.evaluate("() => looped(10, 144, false)") if mode == 'loop144' else await pg.evaluate("() => looped(10, 60, true)")
        wall = await pg.evaluate("() => window.wall || 0")
        out.append((mode, r, errs, wall)); await ctx.close()
    return out

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        A, B, C, D, E, F, G = await asyncio.gather(one(b, 12345), one(b, 12345), one(b, 12345, True), one(b, 777),
                                                   one(b, 12345, view=(1920, 1080)), one(b, 12345, view=(1366, 768), scale=2),
                                                   one(b, 12345, view=(2560, 1080)))
        L = await loop_check(b)
        await b.close()
    ok = True
    def check(name, cond, info=''):
        nonlocal ok; ok &= bool(cond); print(('PASS ' if cond else 'FAIL ') + name + (('  ' + str(info)) if info else ''), flush=True)
    check('run A reached a later sector with no errors', A['sector'] > 1 and not A['errors'], (A['sector'], A['errors'][:2]))
    check('seed is applied', A['seed'] == 12345 and D['seed'] == 777, (A['seed'], D['seed']))
    check('same seed replays the same run (A == B)', A['log'] == B['log'], first_diff(A['log'], B['log']))
    check('language, sound, reduced motion and touch do not change the run (A == C)', A['log'] == C['log'], first_diff(A['log'], C['log']))
    check('a different seed gives a different run (A != D)', A['log'] != D['log'])
    check('the play field has the same logical size in every window', A['field'] == E['field'] == F['field'] == G['field'] == [1280, 720], (A['field'], E['field'], F['field'], G['field']))
    check('window size and pixel density do not change the run (A == E == F == G)', A['log'] == E['log'] == F['log'] == G['log'], first_diff(A['log'], E['log']) or first_diff(A['log'], F['log']) or first_diff(A['log'], G['log']))
    (_, dr, de, _w), (_, lr, le, lw), (_, ur, ue, uw) = L
    check('the frame loop at 144 Hz gives the same state as fixed 1/60 s steps', dr == lr and not de and not le, (dr, lr))
    check('uneven frame times give the same state as fixed 1/60 s steps', dr == ur and not ue, (dr, ur))
    check('10 game seconds take 10 seconds of real time at 144 Hz and with uneven frames', abs(lw - 10) < .05 and abs(uw - 10) < .05, (round(lw, 3), round(uw, 3)))
    print(f"A: sector {A['sector']}, {len(A['log'])} log entries over {SECS:.0f} game seconds")
    sys.exit(0 if ok else 1)

def first_diff(a, b):
    for i, (x, y) in enumerate(zip(a, b)):
        if x != y: return f'first difference at entry {i}: {x} vs {y}'
    return '' if len(a) == len(b) else f'lengths {len(a)} vs {len(b)}'

asyncio.run(main())
