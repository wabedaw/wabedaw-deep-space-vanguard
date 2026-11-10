'use strict';
// Steam leaderboards for the game page, through the patched steamworks.js (native/PATCHES.md). Everything the page
// sends is checked here: it is the only way page code reaches Steam's leaderboards.
//
//   upload(name, score, { sort, display, keepBest, details })  -> { score, changed, rank, previousRank } | null
//   entries(name, { request, start, end })                      -> [{ rank, score, name, steamId, details, me }]
//
// Boards are created on first use (FindOrCreateLeaderboard) with the given sort and display; boards that must
// exist from the start (and stay hidden until release) can be made in Steamworks instead.

const NAME = /^[A-Z0-9_]{1,120}$/;
const SORT = { asc: 0, desc: 1 };                       // leaderboard.SortMethod
const DISPLAY = { numeric: 0, seconds: 1, ms: 2 };      // leaderboard.DisplayType
const REQUEST = { global: 0, around: 1, friends: 2 };   // leaderboard.DataRequest
const int32 = v => Number.isInteger(v) && v >= -2147483648 && v <= 2147483647;

function available(steam) {
  return !!(steam && steam.leaderboard && typeof steam.leaderboard.uploadScore === 'function' && typeof steam.leaderboard.downloadScores === 'function');
}

async function upload(steam, name, score, opts = {}) {
  if (!available(steam)) throw new Error('leaderboards unavailable');
  if (!NAME.test(name)) throw new Error('bad leaderboard name');
  if (!int32(score)) throw new Error('bad score');
  const details = Array.isArray(opts.details) ? opts.details : [];
  if (details.length > 64 || !details.every(int32)) throw new Error('bad details');
  const sort = SORT[opts.sort || 'desc'], display = DISPLAY[opts.display || 'numeric'];
  if (sort === undefined || display === undefined) throw new Error('bad sort or display');
  const lb = steam.leaderboard;
  if (!(await lb.findOrCreate(name, sort, display))) return null;
  const r = await lb.uploadScore(name, score, opts.keepBest === false ? 1 : 0, details);
  return r ? { score: r.score, changed: r.scoreChanged, rank: r.globalRankNew, previousRank: r.globalRankPrevious } : null;
}

async function entries(steam, name, opts = {}) {
  if (!available(steam)) throw new Error('leaderboards unavailable');
  if (!NAME.test(name)) throw new Error('bad leaderboard name');
  const request = REQUEST[opts.request || 'global'];
  if (request === undefined) throw new Error('bad request');
  const start = opts.start ?? (request === REQUEST.around ? -4 : 1), end = opts.end ?? (request === REQUEST.around ? 5 : 50);
  if (!int32(start) || !int32(end) || end < start || end - start > 500) throw new Error('bad range');
  const lb = steam.leaderboard;
  if (!(await lb.find(name))) return [];
  let me = null;
  try { me = String(steam.localplayer.getSteamId().steamId64); } catch (e) {}
  const rows = await lb.downloadScores(name, request, start, end);
  return rows.map(e => {
    const id = String(e.steamId.steamId64);
    return { rank: e.globalRank, score: e.score, name: e.name || '', steamId: id, details: e.details.slice(0, 64), me: id === me };
  });
}

// wire the handlers; getSteam() returns the steamworks client or null
function register(ipcMain, getSteam) {
  ipcMain.on('steam:lb:available', e => { e.returnValue = available(getSteam()); });
  ipcMain.handle('steam:lb:upload', (e, name, score, opts) => upload(getSteam(), name, score, opts));
  ipcMain.handle('steam:lb:entries', (e, name, opts) => entries(getSteam(), name, opts));
}

module.exports = { register, upload, entries, available };
