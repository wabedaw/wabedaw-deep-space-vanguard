/* ---------- leaderboard: every pilot's best run in the artifact's shared db (scores/<their id>); this device's records when offline ---------- */
const LB = { db: null, user: null, uid: null, rows: [], mine: null, state: 'idle', canWrite: null, timer: 0, pending: null, writing: false, last: null, local: [] };
try { const v = JSON.parse(localStorage.getItem('dsv-runs') || '[]'); if (Array.isArray(v)) LB.local = v.filter(r => r && Number.isFinite(r.s)).slice(0, 10); } catch (e) {}
let lbCall = ''; try { lbCall = (localStorage.getItem('dsv-call') || '').slice(0, 16); } catch (e) {}
const lbOv = $('lbOv');
const lbNum = v => { const n = Math.floor(+v); return Number.isFinite(n) && n > 0 ? n : 0; };
function lbClean(id, d) {
  if (!d || typeof d !== 'object') return null;
  return { id, best: Math.min(lbNum(d.best), 99999999), stage: clamp(lbNum(d.stage) || 1, 1, 99), cleared: d.cleared === true, kills: lbNum(d.kills), call: typeof d.call === 'string' ? d.call.trim().slice(0, 16) : '', at: typeof d.at === 'string' ? d.at : '' };
}
function lbInit() {
  if (!window.claude || typeof window.claude.use !== 'function') { LB.state = 'off'; return; }
  LB.state = 'loading';
  Promise.all([window.claude.use('db'), window.claude.use('user')]).then(async ([db, user]) => {
    if (!db) { LB.state = 'off'; lbRender(); return; }
    LB.db = db; LB.user = user;
    if (user) { try { LB.uid = await user.id(); } catch (e) {} try { LB.canWrite = await user.can('data.write'); } catch (e) {} }
    if (LB.uid) db.doc('scores/' + LB.uid).get().then(s => { if (s.exists) { LB.mine = lbClean(s.id, s.data()); if (LB.mine && LB.mine.call && !lbCall) lbCall = LB.mine.call; lbRender(); } }).catch(() => {});
    LB.timer = setTimeout(() => { if (LB.state === 'loading') { LB.state = 'slow'; lbRender(); } }, 10000);
    db.collection('scores').orderBy('best', 'desc').limit(100).onSnapshot(snap => {
      if (!snap.metadata.fromCache) { clearTimeout(LB.timer); LB.state = 'live'; } else if (LB.state !== 'live') LB.state = 'cache';
      LB.rows = snap.docs.filter(d => d.exists).map(d => lbClean(d.id, d.data())).filter(r => r && r.best > 0).sort((a, b) => b.best - a.best);
      const me = LB.uid && LB.rows.find(r => r.id === LB.uid); if (me) LB.mine = me;
      lbRender(); lbOverNote();
    }, () => { clearTimeout(LB.timer); LB.state = 'error'; lbRender(); });
    lbRender();
  }).catch(() => { LB.state = 'off'; lbRender(); });
}
function lbRank() {
  if (!LB.mine || !LB.mine.best) return 0;
  const i = LB.rows.findIndex(r => r.id === LB.uid); if (i >= 0) return i + 1;
  return LB.rows.length < 100 ? 0 : -1;
}
function lbRecordRun() {
  if (S.dev || S.score <= 0) return;
  const run = { s: S.score, st: stageOf(S.sector), at: Date.now() };
  LB.local.push(run); LB.local.sort((a, b) => b.s - a.s); LB.local = LB.local.slice(0, 10);
  try { localStorage.setItem('dsv-runs', JSON.stringify(LB.local)); } catch (e) {}
  LB.last = { score: S.score, status: 'local' };
  if (!LB.db || !LB.uid) { LB.last.status = LB.state === 'off' ? 'off' : 'local'; lbOverNote(); return; }
  if (LB.canWrite === false) { LB.last.status = 'view'; lbOverNote(); return; }
  const prev = LB.mine ? LB.mine.best : 0;
  if (S.score <= prev) { LB.last.status = 'kept'; lbOverNote(); return; }
  LB.last.status = 'sending';
  LB.pending = { best: S.score, stage: stageOf(S.sector), sector: S.sector, kills: S.kills, cleared: !!(LB.mine && LB.mine.cleared) || S.sector > 100, call: lbCall, lang: LANG, at: new Date().toISOString() };
  lbOverNote(); lbFlush();
}
async function lbFlush() {
  if (LB.writing || !LB.pending || !LB.db || !LB.uid) return;
  LB.writing = true; const d = LB.pending; LB.pending = null;
  try {
    await LB.db.doc('scores/' + LB.uid).set(d);
    LB.mine = lbClean(LB.uid, d); if (LB.last && LB.last.score === d.best) LB.last.status = 'sent';
  } catch (e) {
    const code = e && e.code;
    if (code === 'invalid_argument' || code === 'not_granted') { LB.canWrite = false; if (LB.last) LB.last.status = 'view'; }
    else if (LB.last) LB.last.status = 'fail';
  }
  LB.writing = false; lbRender(); lbOverNote();
  if (LB.pending) lbFlush();
}
function lbSaveCall() {
  const v = $('lbCall').value.trim().slice(0, 16); lbCall = v;
  try { localStorage.setItem('dsv-call', v); } catch (e) {}
  const msg = $('lbCallMsg');
  if (LB.mine && LB.mine.best && LB.db && LB.uid && LB.canWrite !== false) {
    LB.pending = { best: LB.mine.best, stage: LB.mine.stage, sector: (LB.mine.stage - 1) * 10 + 1, kills: LB.mine.kills, cleared: LB.mine.cleared, call: v, lang: LANG, at: LB.mine.at || new Date().toISOString() };
    msg.textContent = I18('已保存', 'Saved'); lbFlush();
  } else msg.textContent = I18('已保存 · 下次上榜时显示', 'Saved · shows with your next posted score');
}
function lbStageText(r) { return r.cleared ? I18('已通关', 'Cleared') + (r.stage > 10 ? I18(' · 二周目', ' · NG+') : '') : stageTag(r.stage); }
function lbStatusText() {
  if (LB.state === 'off') return I18('排行榜需要在 Claude 中打开并登录才能使用 · 下面是这台设备上的成绩', 'The leaderboard needs this page opened in Claude while signed in · showing this device’s runs');
  if (LB.state === 'loading' || LB.state === 'idle') return I18('正在连接排行榜…', 'Connecting to the leaderboard…');
  if (LB.state === 'slow') return I18('排行榜暂时连不上，稍后会自动刷新', 'Can’t reach the leaderboard yet · it will refresh by itself');
  if (LB.state === 'error') return I18('排行榜暂时不可用 · 下面是这台设备上的成绩', 'Leaderboard unavailable right now · showing this device’s runs');
  if (LB.canWrite === false) return I18('实时排行 · 你当前只有查看权限，成绩不会上传', 'Live ranking · your access is view-only, so your runs are not posted');
  return I18('实时排行 · 每位飞行员保留最高分 · 开发者模式成绩不计入', 'Live ranking · each pilot’s best run · developer-mode runs don’t count');
}
function lbRender() {
  if (!lbOv || lbOv.hidden) return;
  $('lbStatus').textContent = lbStatusText();
  const list = $('lbList'); list.textContent = '';
  const useLocal = LB.state === 'off' || LB.state === 'error' || (!LB.rows.length && LB.state !== 'live' && LB.local.length);
  const ids = [];
  const row = (rank, name, score, sub, me, id) => {
    const li = document.createElement('li'); li.className = 'lb-row' + (me ? ' me' : '') + (rank === 1 ? ' r1' : rank === 2 ? ' r2' : rank === 3 ? ' r3' : '');
    const rk = document.createElement('span'); rk.className = 'lb-rank'; rk.textContent = rank > 0 ? String(rank) : '—';
    const nm = document.createElement('span'); nm.className = 'lb-name'; nm.textContent = name; if (id) { nm.dataset.id = id; ids.push(id); }
    if (me) { const t = document.createElement('em'); t.textContent = I18('你', 'YOU'); nm.appendChild(t); }
    const sb = document.createElement('span'); sb.className = 'lb-sub'; sb.textContent = sub;
    const sc = document.createElement('span'); sc.className = 'lb-score'; sc.textContent = score.toLocaleString('en-US');
    li.append(rk, nm, sb, sc); list.appendChild(li); return li;
  };
  if (useLocal) {
    if (!LB.local.length) { const p = document.createElement('li'); p.className = 'lb-empty'; p.textContent = I18('还没有成绩 · 去打一局吧', 'No runs yet · go fly one'); list.appendChild(p); }
    LB.local.forEach((r, i) => row(i + 1, I18('本机记录', 'This device'), r.s, stageTag(clamp(r.st || 1, 1, 99)) + ' · ' + new Date(r.at).toLocaleDateString(ZH ? 'zh-CN' : 'en-US'), false));
  } else {
    if (!LB.rows.length) { const p = document.createElement('li'); p.className = 'lb-empty'; p.textContent = LB.state === 'live' ? I18('排行榜还是空的 · 打完一局就能上榜', 'No pilots on the board yet · finish a run to post the first score') : I18('正在读取…', 'Loading…'); list.appendChild(p); }
    LB.rows.slice(0, 50).forEach((r, i) => row(i + 1, r.call || '', r.best, lbStageText(r) + (r.at ? ' · ' + new Date(r.at).toLocaleDateString(ZH ? 'zh-CN' : 'en-US') : ''), r.id === LB.uid, r.call ? null : r.id));
    const rk = lbRank();
    if (LB.mine && LB.mine.best && (rk === -1 || rk > 50)) { const sep = document.createElement('li'); sep.className = 'lb-gap'; sep.textContent = '···'; list.appendChild(sep); row(rk > 0 ? rk : -1, LB.mine.call || '', LB.mine.best, lbStageText(LB.mine), true, LB.mine.call ? null : LB.uid); }
  }
  const fill = ps => { for (const el of list.querySelectorAll('.lb-name[data-id]')) { const p = ps && ps[el.dataset.id], em = el.querySelector('em'); el.textContent = (p && p.name) || I18('无名飞行员', 'Unnamed pilot'); if (em) el.appendChild(em); } };
  if (ids.length) { fill(null); if (LB.user) LB.user.profiles(ids).then(fill).catch(() => {}); }
  const canName = !useLocal && LB.uid && LB.canWrite !== false;
  $('lbCallRow').hidden = !canName;
  if (canName && document.activeElement !== $('lbCall')) $('lbCall').value = lbCall;
}
function lbOverNote() {
  const el = $('lbNote'); if (!el) return;
  const L = LB.last; if (!L || S.dev) { el.hidden = true; return; }
  const rk = lbRank(), rt = rk > 0 ? I18(' · 当前第 ' + rk + ' 名', ' · now #' + rk) : rk === -1 ? I18(' · 排名 100 名以后', ' · ranked below #100') : '';
  el.hidden = false;
  el.textContent = L.status === 'sending' ? I18('排行榜 · 正在上传成绩…', 'Leaderboard · posting your score…')
    : L.status === 'sent' ? I18('排行榜 · 新的个人最高分已上传', 'Leaderboard · new personal best posted') + rt
    : L.status === 'kept' ? I18('排行榜 · 未超过你的最高分 ', 'Leaderboard · your best stays ') + (LB.mine ? LB.mine.best.toLocaleString('en-US') : '') + rt
    : L.status === 'view' ? I18('排行榜 · 只有查看权限，成绩未上传', 'Leaderboard · view-only access, score not posted')
    : L.status === 'fail' ? I18('排行榜 · 上传失败，下次会再试', 'Leaderboard · couldn’t post, will try next run')
    : I18('排行榜 · 已记入本机成绩', 'Leaderboard · saved to this device’s records');
}
function openLb(from) {
  LB.from = from;
  if (from === 'menu') menuEl.hidden = true; else overEl.hidden = true;
  lbOv.hidden = false; lbRender(); $('lbClose').focus({ preventScroll: true });
}
function closeLb() {
  lbOv.hidden = true;
  if (LB.from === 'over' && S.mode === 'over') { overEl.hidden = false; $('againBtn').focus({ preventScroll: true }); }
  else if (S.mode === 'menu') { menuEl.hidden = false; $('lbBtn').focus({ preventScroll: true }); }
}
$('lbBtn').addEventListener('click', e => { e.stopPropagation(); openLb('menu'); });
$('overLbBtn').addEventListener('click', () => openLb('over'));
$('lbClose').addEventListener('click', closeLb);
$('lbCallForm').addEventListener('submit', e => { e.preventDefault(); lbSaveCall(); });
addEventListener('keydown', e => { if (lbOv.hidden) return; if (e.code === 'Escape') { e.preventDefault(); closeLb(); } e.stopImmediatePropagation(); }, true);
lbInit();

$('tutResetBtn').addEventListener('click', e => { e.stopPropagation(); TUT.done = {}; tutSave(); e.currentTarget.textContent = I18('已重置 · 下次起飞时显示', 'Reset · shows on your next flight'); });
$('lbCall').placeholder = I18('留空则显示账号名', 'Blank = your account name');
const soundBtn = $('soundBtn');
function updateSoundBtn() { soundBtn.dataset.mode = soundMode; soundBtn.setAttribute('aria-label', [I18('声音：全开（点击切换）', 'Sound: all on (click to change)'), I18('声音：仅音效（点击切换）', 'Sound: effects only (click to change)'), I18('声音：静音（点击切换）', 'Sound: muted (click to change)')][soundMode]); soundBtn.title = soundBtn.getAttribute('aria-label'); }
soundBtn.addEventListener('click', e => { e.stopPropagation(); setSoundMode((soundMode + 1) % 3); });
updateSoundBtn();
addEventListener('pointerdown', audioInit, true);
addEventListener('keydown', audioInit, true);
document.addEventListener('visibilitychange', () => { if (document.hidden && S.mode === 'play' && P.alive) togglePause(); });

