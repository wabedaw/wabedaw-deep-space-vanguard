// Which prebuilt binaries in dist/ contain the ASHWING leaderboard patch? (A binary for another OS can't be
// loaded here, but its exported names are plain strings inside it.)
//   node platform/steam/native/steamworks.js/check-binaries.mjs [--require win64]
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(dirname(fileURLToPath(import.meta.url)), 'dist');
const need = process.argv.includes('--require') ? process.argv[process.argv.indexOf('--require') + 1].split(',') : [];
let bad = false;
for (const folder of readdirSync(DIST)) {
  for (const f of readdirSync(join(DIST, folder)).filter(f => f.endsWith('.node'))) {
    const patched = readFileSync(join(DIST, folder, f)).includes('downloadScores');
    console.log(`${patched ? 'patched  ' : 'UPSTREAM '} ${folder}/${f}`);
    if (!patched && need.includes(folder)) bad = true;
  }
}
if (bad) { console.error('A required platform still has the upstream binary without leaderboards: run the "steamworks native" workflow and copy its output into dist/ (see PATCHES.md).'); process.exit(1); }
