/* ---------- save data ---------- */
// Everything the game keeps between sessions lives in one versioned object, stored as JSON through
// PLATFORM.write ('ashwing-save': localStorage on the web, a file synced by Steam Cloud on Steam).
//
// Changing the format: bump VERSION and add MIGRATE[old] that upgrades a version-`old` object in place.
// A save written by a newer build is loaded but never overwritten, so switching to an older build (a Steam beta
// branch, an old web page) can't destroy progress. A save that can't be parsed is kept as 'ashwing-save.bad'.
const SAVE = (() => {
  const NAME = 'ashwing-save', VERSION = 1;
  const fresh = () => ({
    v: VERSION,
    // settings
    lang: '', sound: 0,
    // progress
    best: 0, stage: 1, last: 0, cleared: false, tut: {},
    // local leaderboard (the website's ranking; Steam and Claude have shared boards) and the pilot's call sign
    runs: [], call: '',
    // achievements unlocked on this device (mirrors Steam; lets the web build show them) and lifetime stats
    ach: {}, stats: {},
    // developer mode (password-gated test panel)
    dev: false, devOpts: null,
  });
  const MIGRATE = {
    // 1: (d) => { ...upgrade d from version 1 to 2... },
  };
  const LEGACY = ['dsv-best', 'dsv-best-en', 'dsv-stage', 'dsv-last', 'dsv-cleared', 'dsv-lang', 'dsv-sound', 'dsv-tut', 'dsv-runs', 'dsv-call', 'dsv-dev', 'dsv-dev-opts'];
  function fromLegacy() {
    const g = PLATFORM.legacy;
    if (!LEGACY.some(k => g(k) !== null)) return null;
    const num = (k, d) => { const n = parseInt(g(k) || '', 10); return Number.isFinite(n) ? n : d; };
    const json = (k, d) => { try { const v = JSON.parse(g(k) || ''); return v == null ? d : v; } catch (e) { return d; } };
    const lang = g('dsv-lang');
    return Object.assign(fresh(), {
      best: Math.max(num('dsv-best', 0), num('dsv-best-en', 0)), stage: Math.max(1, num('dsv-stage', 1)), last: Math.max(0, num('dsv-last', 0)),
      cleared: g('dsv-cleared') === '1', lang: lang === 'zh' ? 'zh-Hans' : lang === 'en' ? 'en' : '', sound: Math.min(2, Math.max(0, num('dsv-sound', 0))),
      tut: json('dsv-tut', {}), runs: json('dsv-runs', []), call: (g('dsv-call') || '').slice(0, 16),
      dev: g('dsv-dev') === '1', devOpts: json('dsv-dev-opts', null),
    });
  }
  let d = null, readOnly = false, migrated = false;
  const raw = PLATFORM.read(NAME);
  if (raw) {
    try { d = JSON.parse(raw); } catch (e) { d = null; }
    if (!d || typeof d !== 'object' || !Number.isFinite(d.v)) { PLATFORM.write(NAME + '.bad', raw); d = null; }
  }
  if (!d) { d = fromLegacy(); migrated = !!d; }
  if (!d) d = fresh();
  if (d.v > VERSION) readOnly = true;
  while (d.v < VERSION) { const m = MIGRATE[d.v]; if (!m) break; m(d); }
  // fields added since the save was written get their defaults; wrong types are reset
  const def = fresh();
  for (const k in def) if (d[k] === undefined || (def[k] !== null && typeof d[k] !== typeof def[k]) || (Array.isArray(def[k]) && !Array.isArray(d[k]))) d[k] = def[k];
  if (!readOnly) d.v = VERSION;

  let timer = null;
  const flush = () => { clearTimeout(timer); timer = null; if (!readOnly) PLATFORM.write(NAME, JSON.stringify(d)); };
  const touch = () => { if (!timer) timer = setTimeout(flush, 300); };
  if (migrated) flush();
  // Steam may have missed an unlock made while it was offline or on another PC: re-send (it ignores repeats)
  if (PLATFORM.desktop) { for (const id in d.ach) PLATFORM.achieve(id); for (const k in d.stats) PLATFORM.setStat(k, d.stats[k]); PLATFORM.storeStats(); }
  addEventListener('pagehide', flush);
  addEventListener('beforeunload', flush);
  return {
    data: d,
    get: k => d[k],
    set(k, v) { if (d[k] !== v || typeof v === 'object') { d[k] = v; touch(); } },
    // count a lifetime stat up and mirror it to Steam
    bump(k, n = 1) { d.stats[k] = (d.stats[k] | 0) + n; PLATFORM.setStat(k, d.stats[k]); touch(); return d.stats[k]; },
    unlock(id) { if (d.ach[id]) return false; d.ach[id] = Date.now(); PLATFORM.achieve(id); touch(); return true; },
    flush,
    get readOnly() { return readOnly; },
  };
})();
