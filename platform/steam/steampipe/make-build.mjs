// Writes the SteamPipe app build script for the packaged game and prints the steamcmd command that uploads it.
//
//   npm run steam:dist:win            (repo root) -> dist/steam/win-unpacked/
//   node platform/steam/steampipe/make-build.mjs [--demo] [--desc "release notes"]
//   steamcmd +login <build account> +run_app_build <printed path> +quit     (you run this; Steam Guard asks you)
//
// Builds are uploaded but never set live automatically: choose the branch in Steamworks > SteamPipe > Builds.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(HERE, '../../../dist/steam');
const cfg = JSON.parse(readFileSync(join(HERE, 'steam.config.json'), 'utf8'));
const demo = process.argv.includes('--demo');
const di = process.argv.indexOf('--desc');
const desc = di > 0 ? process.argv[di + 1] : 'ASHWING ' + JSON.parse(readFileSync(join(HERE, '../package.json'), 'utf8')).version;
const app = demo ? cfg.demo : cfg;
if (!app.appId) { console.error('steam.config.json: appId is 0. Fill in the App ID from Steamworks first.'); process.exit(1); }

// platform -> folder electron-builder writes
const OUT = { windows: 'win-unpacked', linux: 'linux-unpacked', macos: 'mac-universal' };
const depots = Object.entries(app.depots).filter(([p, id]) => id && existsSync(join(DIST, OUT[p])));
if (!depots.length) { console.error('No packaged build with a depot ID found in dist/steam/ (run npm run steam:dist:win first).'); process.exit(1); }

const q = s => '"' + String(s).replace(/"/g, '\\"') + '"';
const vdf = `"AppBuild"
{
\t"AppID" ${q(app.appId)}
\t"Desc" ${q(desc)}
\t"ContentRoot" ${q(DIST)}
\t"BuildOutput" ${q(join(DIST, 'steampipe-output'))}
\t"Depots"
\t{
${depots.map(([p, id]) => `\t\t${q(id)}
\t\t{
\t\t\t"FileMapping"
\t\t\t{
\t\t\t\t"LocalPath" ${q(OUT[p] + '/*')}
\t\t\t\t"DepotPath" "."
\t\t\t\t"recursive" "1"
\t\t\t}
\t\t\t"FileExclusion" "*.pdb"
\t\t\t"FileExclusion" "steam_appid.txt"
\t\t}`).join('\n')}
\t}
}
`;
mkdirSync(join(DIST, 'steampipe-output'), { recursive: true });
const file = join(DIST, `app_build_${app.appId}.vdf`);
writeFileSync(file, vdf);
console.log(`wrote ${file}\ndepots: ${depots.map(([p, id]) => p + ' ' + id).join(', ')}\n\nupload with:\n  steamcmd +login <your build account> +run_app_build ${q(file)} +quit`);
