// Game data tables (src/data/*.json) -> the DATA constant in front of the game code.
//
//   balance.json  balance values the code reads as BAL.* (= DATA.balance): every value must be a finite number
//   bosses.json   hit points and score per boss kind: the kinds must match the boss rosters in src/js/bosses
//
// tools/build.mjs calls loadData() and stops the build on any problem, so a typo in a table can't ship.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROSTERS = ['js/bosses/08-bosses.js', 'js/bosses/32-theme-b-boss-roster-patterns-and.js', 'js/bosses/40-theme-c-boss-roster-patterns-and.js'];

export function loadData(root) {
  const read = f => JSON.parse(readFileSync(join(root, 'src/data', f), 'utf8'));
  const errors = [], strip = o => { const { note, ...rest } = o; return rest; };
  const balance = strip(read('balance.json'));
  (function walk(o, path) {
    for (const [k, v] of Object.entries(o)) {
      if (k === 'note') continue;
      if (v && typeof v === 'object') walk(v, path + k + '.');
      else if (typeof v !== 'number' || !Number.isFinite(v)) errors.push(`balance.json: ${path + k} must be a number (is ${JSON.stringify(v)})`);
    }
  })(balance, '');
  const bosses = read('bosses.json').bosses || {};
  const kinds = new Set();
  for (const f of ROSTERS) for (const m of readFileSync(join(root, 'src', f), 'utf8').matchAll(/^\s*([a-z0-9]+): \{ name: I18\(/gm)) kinds.add(m[1]);
  for (const k of kinds) if (!bosses[k]) errors.push(`bosses.json: no entry for boss "${k}"`);
  for (const [k, v] of Object.entries(bosses)) {
    if (!kinds.has(k)) errors.push(`bosses.json: "${k}" is not a boss in the rosters`);
    for (const f of ['hp', 'score']) if (!(v[f] > 0)) errors.push(`bosses.json: ${k}.${f} must be a positive number`);
  }
  return { data: { balance, bosses }, errors };
}
