/* ---------- players (M1 step 4) ---------- */
// The game holds its pilots in PLAYERS (one or two for now; PLAYERS[0] is player 1, on keyboard, mouse and touch).
// The game code was written for one pilot and refers to it as P (and to its controls as K) in about 900 places.
// Instead of rewriting those, P is "the pilot this code is about":
//   - per-pilot code (movement, weapons, pickups, collisions, drawing) runs once per pilot with P bound to it
//     (eachPlayer / withPlayer);
//   - enemy code runs with P bound to the pilot nearest that enemy (aimAt), so "aim at P" aims at the nearest pilot;
//   - scheduled events and stage transitions see the lead pilot (the first one still flying); the others fly in
//     formation beside it during transitions (formFollowers);
//   - everything else (menus, input handlers, the HUD) sees player 1.
// With one pilot P is always player 1, so single-player runs play out exactly as before.
// Not here yet (M3, co-op): joining from the menu, the escape pod and rescue, co-op balance.
const PLAYER_TINT = ['94,242,255', '255,179,71'];          // player 2 is marked in amber
const PLAYERS_URL = (() => { const m = location.search.match(/[?&]players=(\d)/); return m ? clamp(+m[1], 1, 2) : 0; })();
function usePlayer(p) { P = p; K = p.K; }
function withPlayer(p, fn) { const keep = P; usePlayer(p); try { return fn(); } finally { usePlayer(keep); } }
function eachPlayer(fn) { try { for (const p of PLAYERS) { usePlayer(p); fn(p); } } finally { usePlayer(PLAYERS[0]); } }
const leadPlayer = () => PLAYERS.find(p => p.alive) || PLAYERS[0];
const anyAlive = () => PLAYERS.some(p => p.alive);
function nearestPlayer(x, y) {
  if (PLAYERS.length === 1) return PLAYERS[0];
  let best = null, bd = Infinity;
  for (const p of PLAYERS) { if (!p.alive || p.cap) continue; const d = (p.x - x) ** 2 + (p.y - y) ** 2; if (d < bd) { bd = d; best = p; } }
  return best || leadPlayer();
}
function aimAt(o) { if (PLAYERS.length > 1) usePlayer(nearestPlayer(o.x, o.y)); }
// a new run decides how many pilots fly; player 1 keeps its object (its controls are the keyboard state KB)
function setPlayerCount(n) {
  PLAYERS.length = 1;
  for (let i = 1; i < n; i++) PLAYERS.push(makePlayer(i));
  usePlayer(PLAYERS[0]);
}
const FORMATION = [[0, 0], [86, 26]];   // offset from the lead pilot on vertical stages (side stages swap the axes)
function formFollowers() {
  const L = leadPlayer();
  for (const p of PLAYERS) {
    if (p === L || !p.alive) continue;
    const o = FORMATION[p.id] || [60 * p.id, 20 * p.id], ox = S.side ? -o[1] : o[0] * (L.x > W * .6 ? -1 : 1), oy = S.side ? o[0] * (L.y > H * .6 ? -1 : 1) : o[1];
    Object.assign(p, { x: L.x + ox, y: L.y + oy, vx: L.vx, vy: L.vy, gx: L.gx, gy: L.gy, dx: 0, dy: 0, bank: L.bank, evx: L.evx, evy: L.evy, inv: Math.max(p.inv, L.inv) });
  }
}
