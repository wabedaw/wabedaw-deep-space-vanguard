'use strict';
// node --test platform/steam/leaderboards.test.js — the leaderboard bridge against a fake steamworks client
// (the real one needs a running Steam client; see native/PATCHES.md for the live check).
const test = require('node:test');
const assert = require('node:assert');
const lb = require('./leaderboards.js');

function fakeSteam() {
  const boards = new Map(), calls = [];
  return {
    calls, boards,
    localplayer: { getSteamId: () => ({ steamId64: 76561198000000002n }) },
    leaderboard: {
      async find(name) { calls.push(['find', name]); return boards.has(name); },
      async findOrCreate(name, sort, display) { calls.push(['findOrCreate', name, sort, display]); if (!boards.has(name)) boards.set(name, { sort, rows: [] }); return true; },
      async uploadScore(name, score, method, details) {
        calls.push(['uploadScore', name, score, method, details]);
        const b = boards.get(name), mine = b.rows.find(r => r.id === 2n);
        const better = !mine || (b.sort === 1 ? score > mine.score : score < mine.score);
        if (method === 1 || better) { if (mine) Object.assign(mine, { score, details }); else b.rows.push({ id: 2n, score, details }); }
        b.rows.sort((x, y) => b.sort === 1 ? y.score - x.score : x.score - y.score);
        const rank = b.rows.findIndex(r => r.id === 2n) + 1;
        return { score, scoreChanged: method === 1 || better, globalRankNew: rank, globalRankPrevious: 0 };
      },
      async downloadScores(name, request, start, end) {
        calls.push(['downloadScores', name, request, start, end]);
        return boards.get(name).rows.slice(Math.max(0, start - 1), end).map((r, i) => ({ globalRank: i + start, score: r.score, steamId: { steamId64: 76561198000000000n + r.id }, name: r.id === 2n ? 'Me' : 'Rival', details: r.details || [] }));
      },
    },
  };
}

test('uploads create the board once and keep the best score', async () => {
  const s = fakeSteam();
  s.boards.set('CAMPAIGN_NORMAL_SOLO', { sort: 1, rows: [{ id: 1n, score: 500, details: [] }] });
  const a = await lb.upload(s, 'CAMPAIGN_NORMAL_SOLO', 300, { details: [1, 3, 25] });
  assert.deepStrictEqual(a, { score: 300, changed: true, rank: 2, previousRank: 0 });
  const b = await lb.upload(s, 'CAMPAIGN_NORMAL_SOLO', 200, {});
  assert.strictEqual(b.changed, false);
  assert.deepStrictEqual(s.calls.find(c => c[0] === 'uploadScore'), ['uploadScore', 'CAMPAIGN_NORMAL_SOLO', 300, 0, [1, 3, 25]]);
});

test('a time board sorts ascending in milliseconds', async () => {
  const s = fakeSteam();
  await lb.upload(s, 'BOSSRUSH_SOLO', 61234, { sort: 'asc', display: 'ms' });
  assert.deepStrictEqual(s.calls[0], ['findOrCreate', 'BOSSRUSH_SOLO', 0, 2]);
});

test('entries mark the current player and stringify Steam IDs', async () => {
  const s = fakeSteam();
  s.boards.set('CAMPAIGN_NORMAL_SOLO', { sort: 1, rows: [{ id: 1n, score: 900 }, { id: 2n, score: 400, details: [1, 4] }] });
  const rows = await lb.entries(s, 'CAMPAIGN_NORMAL_SOLO', { request: 'global', start: 1, end: 10 });
  assert.deepStrictEqual(rows.map(r => [r.rank, r.score, r.me, r.steamId]), [[1, 900, false, '76561198000000001'], [2, 400, true, '76561198000000002']]);
  assert.deepStrictEqual(rows[1].details, [1, 4]);
});

test('a board that does not exist yet reads as empty', async () => {
  assert.deepStrictEqual(await lb.entries(fakeSteam(), 'WEEKLY_2027W01_DEEP_SOLO', {}), []);
});

test('around-user requests default to four above and five below', async () => {
  const s = fakeSteam(); s.boards.set('X', { sort: 1, rows: [] });
  await lb.entries(s, 'X', { request: 'around' });
  assert.deepStrictEqual(s.calls.pop(), ['downloadScores', 'X', 1, -4, 5]);
});

test('bad input from the page is refused', async () => {
  const s = fakeSteam();
  await assert.rejects(lb.upload(s, 'campaign; drop', 1, {}), /bad leaderboard name/);
  await assert.rejects(lb.upload(s, 'A', 1.5, {}), /bad score/);
  await assert.rejects(lb.upload(s, 'A', 1, { details: new Array(65).fill(0) }), /bad details/);
  await assert.rejects(lb.upload(s, 'A', 1, { sort: 'sideways' }), /bad sort/);
  await assert.rejects(lb.entries(s, 'A', { request: 'everyone' }), /bad request/);
  await assert.rejects(lb.entries(s, 'A', { start: 1, end: 100000 }), /bad range/);
});

test('without the patched binary leaderboards are reported unavailable', async () => {
  assert.strictEqual(lb.available(null), false);
  assert.strictEqual(lb.available({ achievement: {} }), false);
  await assert.rejects(lb.upload({}, 'A', 1, {}), /unavailable/);
});
