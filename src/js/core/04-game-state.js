/* ---------- game state ---------- */
const S = { mode: 'menu', t: 0, score: 0, sector: 1, sectorT: 0, dist: 0, shake: 0, dmgFlash: 0, auto: true,
  combo: 0, comboT: 0, kills: 0, rocks: 0, banner: null, warn: 0, toast: null, boss: null, bossPending: false,
  tRock: 1, tGiant: 18, tShip: 2, tHole: 30, misReq: false, misSide: 1, speedK: 1, events: [], lock: null, overT: 0 };
const P = { x: 0, y: 0, vx: 0, vy: 0, gx: 0, gy: 0, dx: 0, dy: 0, hull: 100, shield: 100, shieldDelay: 0, shieldHit: 0,
  inv: 0, hitT: 0, lvl: 1, mis: 6, misMax: 10, misRegen: 0, fireCd: 0, misCd: 0, bank: 0, muzzle: 0, alive: false,
  weapon: 'spread', beamOn: false, beamTick: 0, beamSnd: null, bm: null, arcs: [], focus: 0, focusFull: false };

const lasers = [], missiles = [], ebul = [], rocks = [], ships = [], holes = [], powers = [], parts = [], waves = [], texts = [], beams = [];

const diff = () => { const st = Math.ceil(S.sector / 10); return 1 + (S.sector - (st - 1) * 10 - 1) * .16 + (cycOf(st) - 1) * .8; };
const mult = () => Math.min(8, 1 + Math.floor(S.combo / 6));

function resetGame() {
  clearBeams(); progressReset();
  for (const a of [lasers, missiles, ebul, rocks, ships, holes, powers, parts, waves, texts]) a.length = 0;
  Object.assign(S, { t: 0, score: 0, sector: 1, sectorT: 0, dist: 0, shake: 0, dmgFlash: 0, combo: 0, comboT: 0, kills: 0, rocks: 0,
    banner: { big: I18('扇区 01', 'SECTOR 01'), sub: SECTOR_NAMES[0], t: 0, dur: 3.2 }, warn: 0, toast: null, boss: null, bossPending: false,
    tRock: .6, tGiant: 18, tShip: 2.5, tHole: 32, misReq: false, events: [], lock: null, holeNear: 0, deathBy: '', warnName: '', tLance: 9, lanceTip: false, ironTip: false, flow: 1, mom: 0, flowTier: 0, ultCd: 0, ultNova: null });
  ultDarts.length = 0;
  if (S.side) leaveSurface();
  Object.assign(S, { side: false, trans: null, heat: 0, dark: 0, scroll: 0, scrollT: 0, tBomber: 12 });
  P.bm = null; P.arcs = []; P.beamTick = 0; P.beamOn = false; P.focus = 0; P.focusFull = false;
  Object.assign(P, { x: W / 2, y: H * .78, vx: 0, vy: 0, gx: 0, gy: 0, dx: 0, dy: 0, hull: 100, shield: 100, shieldDelay: 0, shieldHit: 0,
    inv: 1.2, hitT: 0, lvl: 1, mis: 6, misRegen: 0, fireCd: 0, misCd: 0, bank: 0, muzzle: 0, alive: true, cap: null, wCount: 0, mCount: 0, novaCh: 0, superT: 0 });
  // the run's first planet and its defense satellites come from the run's seed, not from whatever the menu showed
  // (the launch flash covers the swap)
  planet = makePlanet(); planet.y = H * rand(.15, .35); planet.x = W * (W > 700 ? .2 : .25); planetTimer = 4;
  addSats(planet);
}

