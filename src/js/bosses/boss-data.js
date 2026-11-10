/* ---------- boss data ---------- */
// Hit points and score of every boss kind come from src/data/bosses.json (DATA.bosses); the roster files above only
// define names, looks and patterns. tools/build.mjs checks that both list the same kinds.
for (const k in BOSSES) Object.assign(BOSSES[k], DATA.bosses[k]);
