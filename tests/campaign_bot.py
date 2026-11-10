import asyncio, sys, json, time, os
from playwright.async_api import async_playwright
SRC, TAG, VW, VH = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out') + '/'; os.makedirs(OUT, exist_ok=True)
html = open(SRC, encoding='utf-8').read().replace("const hot = window.claude && window.claude.hot;",
  "window.__dbg={S,P,K,update,render,startGame,ships,holes,ebul,lances,beams,powers,killShip,ceilAt,floorAt,solidTopAt,get IW() { return IW; }, get GW() { return GW; }, get W() { return W; }, get H() { return H; }};\nconst hot = window.claude && window.claude.hot;")
JS = r"""
window.er = []; window.fc = 0; window.ev = []; window.prev = {};
window.bot = () => {
  const D = window.__dbg, S = D.S, P = D.P, W = D.W, H = D.H;
  P.hull = 100; P.shield = 100; P.inv = 9; P.mis = P.misMax;
  if (D.holes.length) { window.holeN = (window.holeN || 0) + (D.holes[0].__seen ? 0 : 1); D.holes[0].__seen = 1; if (P.cap || D.holes.some(h => Math.hypot(h.x - P.x, h.y - P.y) < h.R * 1.15)) { D.holes.length = 0; P.cap = null; } }
  const st = Math.ceil(S.sector / 10), floor = [0, 3, 5, 7, 8, 9, 9, 10, 10, 10, 10][Math.min(st, 10)] || 10; if (P.lvl < floor) P.lvl = floor;
  const B = S.boss; P.weapon = B ? 'beam' : 'spread';
  if (S.trans || S.mode !== 'play') return;
  D.K.missile = (window.fc % 45) < 2;
  let tgt = null;
  if (B) {
    const ps = B.parts.filter(p => !p.dead && !p.hidden);
    if (ps.length) tgt = S.side ? ps.sort((a, c) => a.x - c.x)[0] : ps.sort((a, c) => c.y - a.y)[0];
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
  const D = window.__dbg, S = D.S, n = Math.round(secs * 60);
  for (let i = 0; i < n; i++) {
    try { bot(); D.update(1 / 60); if (++window.fc % 20 === 0) D.render(); } catch (e) { if (er.length < 12) er.push(e.message + ' @ ' + (e.stack || '').split('\n')[1] + ' sec ' + S.sector); }
    const B = S.boss, cur = { sector: S.sector, trans: S.trans ? S.trans.kind : '', boss: B ? (B.label || B.kind) : '', mode: S.mode, alive: D.P.alive, side: S.side };
    for (const k in cur) if (cur[k] !== window.prev[k]) { ev.push({ t: +(S.t).toFixed(1), k, v: cur[k], extra: k === 'boss' && B ? { hp: Math.round(B.maxhp), parts: B.parts.length } : k === 'sector' ? { name: (D.S.banner && D.S.banner.sub) || '', iw: D.IW ? D.IW.theme : 0, gw: D.GW ? D.GW.theme : 0 } : undefined }); }
    window.prev = cur;
  }
  const out = ev.splice(0); return { ev: out, sector: S.sector, t: +S.t.toFixed(1), er: er.splice(0), ships: D.ships.length, ebul: D.ebul.length };
};
window.forceKill = () => { const D = window.__dbg, B = D.S.boss; if (!B) return 'none'; for (const p of B.parts) p.dead = true; B.shield = false; if (B.shp) B.shp = 0; if (B.kind === 'omega') B.stage = 3; B.hp = 0; D.killShip(B); return B.kind; };
"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width': VW, 'height': VH})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.set_default_timeout(600000)
        await pg.set_content('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + html + '</body></html>')
        await pg.wait_for_timeout(300); await pg.evaluate("() => {" + JS + "}")
        await pg.evaluate("() => { const D = window.__dbg; D.S.startStage = 1; D.startGame(); }")
        log = open(OUT + TAG + '-events.jsonl', 'w')
        t0 = time.time(); sec_since = {}; last_sector = None; sector_start = 0; boss_start = None; shot_stage = set(); shot_boss = set(); trans_shot = set(); stuck = []
        game_t = 0; done = False; ng_seen = False
        while not done and time.time() - t0 < 2400:
            r = await pg.evaluate("(s) => run(s)", 2)
            game_t = r['t']
            for e in r['ev']:
                log.write(json.dumps(e, ensure_ascii=False) + '\n'); log.flush()
                if e['k'] == 'sector': sector_start = e['t']
                if e['k'] == 'boss' and e['v']: boss_start = e['t']
                if e['k'] == 'boss' and not e['v']: boss_start = None
                if e['k'] == 'mode' and e['v'] != 'play': print(TAG, 'MODE', e, flush=True)
                if e['k'] == 'alive' and not e['v']: print(TAG, 'DIED', e, flush=True)
            for x in r['er']: print(TAG, 'ERR', x, flush=True)
            sec = r['sector']; st = (sec - 1) // 10 + 1
            if st not in shot_stage and sec % 10 == 1 and game_t - sector_start > 8:
                shot_stage.add(st); await pg.screenshot(path=OUT + f'{TAG}-st{st:02d}-fly.png')
            bt = await pg.evaluate("() => { const B = window.__dbg.S.boss; return B ? (B.label || B.kind) + '@' + window.__dbg.S.sector : ''; }")
            if bt and bt not in shot_boss and boss_start is not None and game_t - boss_start > 12:
                shot_boss.add(bt); await pg.screenshot(path=OUT + f'{TAG}-boss-{bt.replace("@", "-")}.png')
            tr = await pg.evaluate("() => { const t = window.__dbg.S.trans; return t ? t.kind + (t.switched ? '-b' : '-a') + '@' + window.__dbg.S.sector : ''; }")
            if tr and tr not in trans_shot: trans_shot.add(tr); await pg.screenshot(path=OUT + f'{TAG}-tr-{tr.replace("@", "-")}.png')
            if boss_start is not None and game_t - boss_start > 300:
                k = await pg.evaluate("() => forceKill()"); stuck.append((sec, k)); print(TAG, 'STUCK -> force kill', sec, k, flush=True); boss_start = None
            if boss_start is None and game_t - sector_start > 240 and not tr:
                stuck.append((sec, 'sector-timeout')); print(TAG, 'SECTOR STALL', sec, flush=True); sector_start = game_t
            if sec >= 101 and game_t - sector_start > 20: done = True
        ach = await pg.evaluate("() => typeof SAVE === 'object' ? { ach: Object.keys(SAVE.data.ach).sort(), stats: SAVE.data.stats } : null")
        print(TAG, 'ACHIEVEMENTS', json.dumps(ach), flush=True)
        print(TAG, 'DONE', json.dumps({'wall': round(time.time() - t0), 'game_t': game_t, 'sector': sec, 'stuck': stuck, 'pageerrors': errs[:4]}), flush=True)
        log.close(); await b.close()
asyncio.run(main())
