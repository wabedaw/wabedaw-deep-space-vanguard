/* ---------- difficulty and checkpoints (M2) ---------- */
// Four difficulties (1.0 plan): normal and hard are open; insane and nightmare are locked until the medals of M3 unlock
// them. Their numbers live in src/data/balance.json (difficulty.tiers) and act in three places only: damage() and
// damagePart() (enemies and bosses take enemyHp / bossHp times as much punishment), eFire() (bulletSpeed) and addScore()
// (reward). On normal every factor is 1, so a normal run plays exactly as before.
const DIFFS = ['normal', 'hard', 'insane', 'nightmare'];
const DIFF_NAME = { normal: I18('普通', 'Normal'), hard: I18('困难', 'Hard'), insane: I18('疯狂', 'Insane'), nightmare: I18('噩梦', 'Nightmare') };
let TIER = BAL.difficulty.tiers.normal;
const diffOpen = d => DIFFS.includes(d) && !BAL.difficulty.tiers[d].locked;
// the difficulty a new run uses: the one asked for, else the player's choice, else normal
function setRunDifficulty(want) {
  S.diff = diffOpen(want) ? want : diffOpen(SAVE.get('diff')) ? SAVE.get('diff') : 'normal';
  TIER = BAL.difficulty.tiers[S.diff];
}

// Checkpoints: the moment a boss warning starts, the run's state is noted (where, the score, each pilot's weapon level,
// missiles and charges). After a crash the mission report offers to fly again from there. Reading only: noting a
// checkpoint never changes the run.
const CPW = { pending: false };
function trackCheckpoint() {
  const warn = !!S.bossPending;
  if (warn && !CPW.pending && S.mode === 'play' && !S.dev && TIER.checkpoints && anyAlive())
    S.cp = { sector: S.sector, diff: S.diff, score: S.score, kills: S.kills, rocks: S.rocks, dist: S.dist,
      pilots: PLAYERS.map(p => ({ lvl: p.lvl, mis: p.mis, novaCh: p.novaCh || 0, wCount: p.wCount || 0, mCount: p.mCount || 0,
        weapon: p.weapon === 'ult' ? (p.superPrev || 'spread') : p.weapon })) };
  CPW.pending = warn;
}
function startFromCheckpoint() {
  const cp = S.cp; if (!cp) return;
  const st = stageOf(cp.sector), lv = levelOf(cp.sector);
  S.startStage = st; S.playersNext = cp.pilots.length; S.diffNext = cp.diff; DEV.run = null;
  startGame();
  placeRunAt(st, lv, true);
  Object.assign(S, { score: cp.score, kills: cp.kills, rocks: cp.rocks, dist: cp.dist, cp });
  cp.pilots.forEach((s, i) => { if (PLAYERS[i]) Object.assign(PLAYERS[i], s); });
  CPW.pending = true;   // the boss warning about to start is the one this checkpoint was taken at
  updateWeaponBtn(); updateNovaBtn();
  S.banner = { big: I18('检查点', 'CHECKPOINT'), sub: sectorTag() + ' · ' + sectorName(), t: 0, dur: 2.6 };
}
