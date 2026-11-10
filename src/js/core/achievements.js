/* ---------- achievements & lifetime stats ---------- */
// Watches the game after every simulation step and reports milestones to SAVE, which mirrors them to Steam.
// It only reads game state, so it can never change how a run plays out. Developer-mode runs don't count.
// Achievement and stat names must match the Steamworks configuration (07_release/成就设计.csv).
const ACHV = { boss: null, holeClose: false };
const award = id => { if (!S.dev) SAVE.unlock(id); };
const countStat = (k, n = 1) => S.dev ? 0 : SAVE.bump(k, n);
function progressReset() { ACHV.boss = null; ACHV.holeClose = false; }
function trackProgress() {
  if (S.dev || S.mode !== 'play') { ACHV.boss = S.boss; return; }
  // a boss left the field because it was destroyed (stage changes and quitting also clear S.boss)
  const prev = ACHV.boss;
  if (prev && prev !== S.boss && (prev.dying || prev.killed) && anyAlive()) { award('ACH_FIRST_BOSS'); countStat('STAT_BOSSES'); }
  ACHV.boss = S.boss;
  if (mult() >= 8) award('ACH_COMBO_MAX');
  if (stageOf(S.sector) >= 11) award('ACH_NG_PLUS');
  // deep in a black hole's pull, then clear of it
  if (P.cap || !P.alive) ACHV.holeClose = false;
  else if (S.holeNear > .6) ACHV.holeClose = true;
  else if (ACHV.holeClose && S.holeNear === 0) { ACHV.holeClose = false; award('ACH_BLACKHOLE_ESCAPE'); countStat('STAT_HOLES_ESCAPED'); }
}
// the stage a run has reached for the first time: chapters end after stages 3, 6 and 9
function stageReached(st) {
  if (S.dev) return;
  if (st > 3) award('ACH_CH1_CLEAR');
  if (st > 6) award('ACH_CH2_CLEAR');
  if (st > 9) award('ACH_CH3_CLEAR');
}
function update(dt) { updateSim(dt); trackProgress(); trackCheckpoint(); }
