'use strict';
// ASHWING desktop app for Steam.
//
// One window runs the game (app/index.html, written by `npm run build` in the repo root). Steamworks lives here in
// the main process; the game reaches it, and its save files, only through the small bridge in preload.js
// (window.ashwingNative). The page itself gets no Node access.
const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

// Steam App ID: "steamAppId" in package.json once Valve issues it (0 until then). Steam also passes it when it starts
// the game; during development steam_appid.txt next to this file supplies it (480 = Valve's public "Spacewar" test
// app). steam_appid.txt is not shipped (see "files" in package.json), as Valve asks.
const DEV_APP_ID = 480;
const PKG_APP_ID = Number(require('./package.json').steamAppId) || 0;
const APP_ID = Number(process.env.SteamAppId) || PKG_APP_ID || Number(readText(path.join(__dirname, 'steam_appid.txt'))) || DEV_APP_ID;
const WINDOWED = process.argv.includes('--windowed');
const SELFTEST = process.argv.includes('--selftest');   // npm run selftest: load the game, check the bridge, quit
// --selftest --leaderboard "Feet Traveled": also read the top entries of that board (needs Steam running; with
// app 480 / Spacewar use one of its boards). Read-only: it never uploads.
const SELFTEST_BOARD = process.argv.includes('--leaderboard') ? process.argv[process.argv.indexOf('--leaderboard') + 1] : null;

function readText(file) { try { return fs.readFileSync(file, 'utf8').trim(); } catch (e) { return ''; } }

// ---------- Steamworks ----------
let steam = null;
try {
  const sw = require('steamworks.js');
  // a release build started outside Steam asks Steam to start it properly (ownership, overlay, cloud) and exits
  if (app.isPackaged && PKG_APP_ID && sw.restartAppIfNecessary(PKG_APP_ID)) { app.exit(0); }
  steam = sw.init(APP_ID);
  sw.electronEnableSteamOverlay();   // must run before the app is ready (adds GPU switches)
} catch (e) {
  // no Steam client running, or a platform without the native module: the game still runs, without Steam features
  console.warn('[steam] unavailable:', e && e.message);
  steam = null;
}
const steamCall = (fn, fallback) => { try { return steam ? fn(steam) : fallback; } catch (e) { console.warn('[steam]', e && e.message); return fallback; } };
let storeTimer = null;
const storeStatsSoon = () => { clearTimeout(storeTimer); storeTimer = setTimeout(() => steamCall(s => s.stats.store()), 1500); };

// ---------- save files ----------
// <userData>/save/<name>.json. On Windows userData is %APPDATA%\ASHWING; Steam Auto-Cloud syncs this folder
// (see 07_release/Steamworks 配置.md). Writes go to a temp file and are renamed, so a crash can't leave half a save.
const SAVE_DIR = path.join(app.getPath('userData'), 'save');
const saveFile = name => {
  const safe = String(name).toLowerCase().replace(/[^a-z0-9.-]/g, '');
  if (!safe || safe.startsWith('.')) throw new Error('bad save name: ' + name);
  return path.join(SAVE_DIR, safe + '.json');
};
ipcMain.on('save:read', (e, name) => { try { e.returnValue = fs.readFileSync(saveFile(name), 'utf8'); } catch (err) { e.returnValue = null; } });
ipcMain.on('save:write', (e, name, text) => {
  try {
    fs.mkdirSync(SAVE_DIR, { recursive: true });
    const file = saveFile(name), tmp = file + '.tmp';
    fs.writeFileSync(tmp, String(text), 'utf8');
    fs.renameSync(tmp, file);
    e.returnValue = true;
  } catch (err) { console.error('[save]', err); e.returnValue = false; }
});

// ---------- Steam services for the game ----------
ipcMain.on('steam:language', e => { e.returnValue = steamCall(s => s.apps.currentGameLanguage(), null); });
ipcMain.on('steam:deck', e => { e.returnValue = process.env.SteamDeck === '1' || steamCall(s => s.utils.isSteamRunningOnSteamDeck(), false); });
ipcMain.on('steam:achieve', (e, id) => { steamCall(s => s.achievement.activate(String(id))); storeStatsSoon(); });
ipcMain.on('steam:stat', (e, id, v) => { steamCall(s => s.stats.setInt(String(id), v | 0)); storeStatsSoon(); });
ipcMain.on('steam:store', () => storeStatsSoon());
// leaderboards: only in the patched steamworks.js (native/PATCHES.md); the page checks steam:lb:available first
require('./leaderboards.js').register(ipcMain, () => steam);

// ---------- window ----------
let win = null;
ipcMain.on('app:quit', () => app.quit());
ipcMain.on('app:fullscreen', (e, on) => { if (win) win.setFullScreen(!!on); });
ipcMain.on('app:isFullscreen', e => { e.returnValue = !!(win && win.isFullScreen()); });

function createWindow() {
  win = new BrowserWindow({
    width: 1280, height: 720, minWidth: 960, minHeight: 540,
    fullscreen: !WINDOWED, backgroundColor: '#03050b', title: 'ASHWING', show: false,
    icon: path.join(__dirname, 'app', 'icons', 'icon-512.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, sandbox: true, nodeIntegration: false,
      spellcheck: false, devTools: !app.isPackaged,
    },
  });
  win.once('ready-to-show', () => win.show());
  win.webContents.setVisualZoomLevelLimits(1, 1).catch(() => {});
  // the game is a single local page: no navigation, no new windows; https links open in the player's browser
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('file:')) e.preventDefault(); });
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https:\/\//.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  // F11 and Alt+Enter toggle full screen, as players expect on PC
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11' || (input.alt && input.key === 'Enter')) { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
  });
  win.webContents.on('render-process-gone', (e, details) => {
    console.error('[renderer gone]', details.reason);
    if (details.reason !== 'clean-exit' && !win.isDestroyed()) win.reload();
  });
  win.loadFile(path.join(__dirname, 'app', 'index.html'));
  if (SELFTEST) {
    win.webContents.on('console-message', (e, level, message) => { const m = (e && e.message) || message; if (((e && e.level) || level) !== 'info' && m) console.log('[page]', m); });
    win.webContents.once('did-finish-load', () => setTimeout(selfTest, 1500));
  }
}

// Checks the parts that only exist in the desktop app: the bridge, a save written to disk, Steam status.
async function selfTest() {
  // writes a marker into the player's real save, checks it on disk, then puts the old value back
  const r = await win.webContents.executeJavaScript(`(() => {
    window.__selftestCall = SAVE.get('call'); SAVE.set('call', 'SELFTEST'); SAVE.flush();
    return { platform: PLATFORM.kind, lang: document.documentElement.lang, saved: window.ashwingNative.read('ashwing-save') };
  })()`).catch(e => ({ error: String(e) }));
  const file = saveFile('ashwing-save'), onDisk = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
  await win.webContents.executeJavaScript(`SAVE.set('call', window.__selftestCall || ''); SAVE.flush();`).catch(() => {});
  const checks = {
    'game runs on the steam platform': r.platform === 'steam',
    'save written to disk through the bridge': !!onDisk && onDisk.call === 'SELFTEST' && onDisk.v >= 1,
    'save read back through the bridge': typeof r.saved === 'string' && r.saved.includes('SELFTEST'),
  };
  if (Object.values(checks).some(v => !v)) console.log('renderer:', JSON.stringify(r).slice(0, 600));
  for (const [k, ok] of Object.entries(checks)) console.log((ok ? 'PASS ' : 'FAIL ') + k);
  console.log('steam client: ' + (steam ? 'connected (app ' + APP_ID + ')' : 'not running (game continues without Steam features)'));
  const boards = require('./leaderboards.js').available(steam);
  console.log('leaderboards: ' + (boards ? 'available (patched steamworks.js)' : steam ? 'NOT in this steamworks.js binary (see native/PATCHES.md)' : 'need Steam'));
  if (SELFTEST_BOARD && boards) {
    try {
      const found = await steam.leaderboard.find(SELFTEST_BOARD);
      const rows = found ? await steam.leaderboard.downloadScores(SELFTEST_BOARD, 0, 1, 5) : [];
      checks['leaderboard "' + SELFTEST_BOARD + '" read from Steam'] = found;
      console.log((found ? 'PASS' : 'FAIL') + ' leaderboard "' + SELFTEST_BOARD + '": ' + (found ? rows.map(e => `#${e.globalRank} ${e.name || '?'} ${e.score}`).join(', ') || 'no entries' : 'not found'));
    } catch (e) { checks.leaderboard = false; console.log('FAIL leaderboard: ' + e.message); }
  }
  console.log('save file: ' + file);
  app.exit(Object.values(checks).every(Boolean) ? 0 : 1);
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
  Menu.setApplicationMenu(null);
  app.whenReady().then(createWindow);
  app.on('window-all-closed', () => app.quit());   // a game quits with its window, on macOS too
  app.on('before-quit', () => { clearTimeout(storeTimer); steamCall(s => s.stats.store()); });
}
