'use strict';
// The only bridge between the game page and the desktop app. The game sees it as window.ashwingNative and uses it
// through PLATFORM (src/js/platform/platform.js). Keep it small: every function here is reachable from the page.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ashwingNative', {
  // save files (synchronous: the game reads its save while loading, and must not lose a write when it quits)
  read: name => ipcRenderer.sendSync('save:read', String(name)),
  write: (name, text) => ipcRenderer.sendSync('save:write', String(name), String(text)),
  // Steam
  language: () => ipcRenderer.sendSync('steam:language'),
  isSteamDeck: () => ipcRenderer.sendSync('steam:deck'),
  achieve: id => ipcRenderer.send('steam:achieve', String(id)),
  setStat: (id, v) => ipcRenderer.send('steam:stat', String(id), Number(v) | 0),
  storeStats: () => ipcRenderer.send('steam:store'),
  // leaderboards (patched steamworks.js only): promises; names are UPPER_SNAKE (see leaderboards.js)
  hasLeaderboards: () => ipcRenderer.sendSync('steam:lb:available'),
  uploadScore: (name, score, opts) => ipcRenderer.invoke('steam:lb:upload', String(name), Number(score), opts || {}),
  getScores: (name, opts) => ipcRenderer.invoke('steam:lb:entries', String(name), opts || {}),
  // window
  quit: () => ipcRenderer.send('app:quit'),
  setFullscreen: on => ipcRenderer.send('app:fullscreen', !!on),
  isFullscreen: () => ipcRenderer.sendSync('app:isFullscreen'),
});
