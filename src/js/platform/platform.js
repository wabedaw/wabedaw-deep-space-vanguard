/* ---------- platform ---------- */
// Everything the game needs from the place it runs. One build of the game code runs in three hosts:
//   steam  - the desktop app (Electron, platform/steam/). Its preload script provides window.ashwingNative.
//   claude - the Claude artifact (window.claude: shared leaderboard database).
//   web    - a plain website; after the Steam release this is the free demo.
// Game code calls PLATFORM.* and never checks which host it is in, except for what a host can't do at all.
const PLATFORM = (() => {
  const N = window.ashwingNative || null;
  const kind = N ? 'steam' : (window.claude && typeof window.claude.use === 'function') ? 'claude' : 'web';
  const ls = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} },
  };
  const call = (fn, ...a) => { try { return N && typeof N[fn] === 'function' ? N[fn](...a) : undefined; } catch (e) { console.warn('platform.' + fn, e); return undefined; } };
  // Steam reports its client language by name; the game uses BCP 47 codes
  const STEAM_LANG = { schinese: 'zh-Hans', tchinese: 'zh-Hant', english: 'en', japanese: 'ja' };
  return {
    kind,
    desktop: !!N,
    // persistent text by name: localStorage on the web, a file in the user's save folder on Steam (Steam Cloud syncs it)
    read: name => N ? call('read', name) ?? null : ls.get(name),
    write: (name, text) => N ? call('write', name, text) !== false : ls.set(name, text),
    // v0.1 kept loose localStorage keys; the save module migrates them once
    legacy: k => ls.get(k),
    // the language the store client is in (Steam), or null to decide from the browser
    hostLang: () => { const l = call('language'); return (l && STEAM_LANG[l]) || null; },
    onDeck: () => !!call('isSteamDeck'),
    // achievements and stats: names match the Steamworks configuration (07_release/成就设计.csv)
    achieve: id => { call('achieve', id); },
    setStat: (id, v) => { call('setStat', id, v | 0); },
    storeStats: () => { call('storeStats'); },
    // global leaderboards: Steam with the patched steamworks.js only (platform/steam/native/PATCHES.md), else null.
    //   boards.upload(name, score, { sort: 'desc'|'asc', display: 'numeric'|'seconds'|'ms', keepBest, details: int[] })
    //     -> Promise<{ score, changed, rank, previousRank } | null>
    //   boards.entries(name, { request: 'global'|'around'|'friends', start, end })
    //     -> Promise<[{ rank, score, name, steamId, details, me }]>
    boards: N && call('hasLeaderboards') ? {
      upload: (name, score, opts) => N.uploadScore(name, score, opts),
      entries: (name, opts) => N.getScores(name, opts),
    } : null,
    // desktop only: real quit and fullscreen; the web host has neither
    canQuit: !!N,
    quit: () => { call('quit'); },
    setFullscreen: on => { if (N) call('setFullscreen', !!on); else try { on ? document.documentElement.requestFullscreen() : document.exitFullscreen(); } catch (e) {} },
    isFullscreen: () => N ? !!call('isFullscreen') : !!document.fullscreenElement,
  };
})();
