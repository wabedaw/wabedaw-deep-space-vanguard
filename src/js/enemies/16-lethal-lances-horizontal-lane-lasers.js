/* ---------- lethal lances: horizontal lane lasers fired across the surface ---------- */
const lances = [];
const LANCEC = '255,60,70';
function laneBand() {
  const top = IW ? ceilAt(clamp(P.x, 0, W)) + 16 : inset.t + 60, gy = (GW || IW) ? solidTopAt(clamp(P.x, 0, W)) : H;
  return [top, Math.max(top + 40, gy - 14)];
}
function addLance(y, o = {}) {
  const l = Object.assign({ y, w: 26 * unitScale(), charge: 1.3, fire: .85, t: 0, x0: W + 12, owner: null, firing: false, dead: false, snd: null, quiet: false }, o);
  if (l.owner) l.x0 = l.v ? vSrc(l.owner) : lanceSrc(l.owner); else if (l.v) l.x0 = inset.t + 8;
  if (!l.quiet) { l.snd = sfx.beamCharge(l.charge, W, true); sfx.lanceWarn(); }
  lances.push(l); return l;
}
function lanceSrc(e) { if (e.kind === 'core') return e.x - coreRad(e) * 1.05; if (e.gate) return e.x - e.hw * .5 - 8; return e.x - e.hw * (e.kind === 'colossus' ? .62 : .98); }
function stopLance(l) { l.dead = true; if (l.snd) { l.snd.stop(); l.snd = null; } }
function clearLances() { for (const l of lances) stopLance(l); lances.length = 0; }
function lanceVolley(mode, o = {}) {
  const [top, bot] = laneBand(), sc = unitScale(), w = o.w ?? 26 * sc, ch = o.charge ?? 1.3, base = { owner: o.owner || null, charge: ch, fire: o.fire ?? .85, w };
  const py = clamp(P.y, top, bot), gap = w * 2.4 + 46;
  if (mode === 'double') {
    let y2 = py, n = 0; while (Math.abs(y2 - py) < gap && n++ < 14) y2 = rand(top, bot);
    if (Math.abs(y2 - py) >= gap) addLance(y2, { ...base, quiet: true });
  } else if (mode === 'wall') {
    const n = Math.max(3, Math.floor((bot - top) / (w * 1.5 + 34))), sp = (bot - top) / n, cur = clamp(Math.floor((py - top) / sp), 0, n - 1);
    let safe = clamp(cur + (rnd() < .5 ? -1 : 1) * (1 + ((rnd() * 2) | 0)), 0, n - 1); if (safe === cur) safe = cur > 0 ? cur - 1 : cur + 1;
    let last = null;
    for (let i = 0; i < n; i++) if (i !== safe) last = addLance(top + (i + .5) * sp, { ...base, w: sp * .62, charge: ch + .5, quiet: !!last });
    return last;
  } else if (mode === 'cascade') {
    const d = bot - py > py - top ? 1 : -1;
    for (let i = 1; i < 3; i++) { const y = py + d * i * gap; if (y < top - 4 || y > bot + 4) break; addLance(y, { ...base, charge: ch + i * .4, quiet: true }); }
  }
  return addLance(py, base);
}
function lanceKill(l) {
  if (P.inv > 0 || !P.alive) return;
  sparks(P.x, P.y, 18, ['255,255,255', LANCEC, '255,200,190'], Math.PI, 2.4);
  S.dmgFlash = 1; P.shield = 0; hurt(9999, 'lance');
  if (!P.alive) S.deathBy = 'lance';
}
function updateLances(dt) {
  for (const l of lances) {
    if (l.dead) continue;
    if (l.owner && (l.owner.dead || l.owner.dying)) { stopLance(l); continue; }
    l.t += dt;
    if (l.owner) l.x0 = l.v ? vSrc(l.owner) : lanceSrc(l.owner);
    const ft = l.t - l.charge;
    if (ft >= 0 && !l.firing) { l.firing = true; if (l.snd) l.snd.stop(); l.snd = l.quiet ? null : sfx.beamFire(l.fire, l.v ? l.y : l.x0, true); shake(7); }
    if (ft > l.fire) { stopLance(l); continue; }
    if (!l.firing || ft < .05) continue;
    const half = l.w * .5;
    if (l.v) {
      for (const pl of PLAYERS) if (S.mode === 'play' && pl.alive && !pl.cap && !S.trans && pl.y > l.x0 - 6 && Math.abs(pl.x - l.y) < half + 8) withPlayer(pl, () => lanceKill(l));
      if (parts.length < 1400 && rnd() < .5) parts.push({ k: 'spark', x: l.y + rand(-half, half), y: rand(l.x0, H), vx: rand(-90, 90), vy: rand(200, 500), life: .25, max: .25, c: pick([LANCEC, '255,220,210']), w: 1.3 });
      continue;
    }
    for (const pl of PLAYERS) if (S.mode === 'play' && pl.alive && !pl.cap && !S.trans && pl.x < l.x0 + 6 && Math.abs(pl.y - l.y) < half + 8) withPlayer(pl, () => lanceKill(l));
    for (const e of ships) if (e.surf && e.air && !e.dead && e.x < l.x0 && e.x > -40 && Math.abs(e.y - l.y) < half + e.hh) damage(e, 999, e.x, e.y, true);
    if (parts.length < 1400 && rnd() < .5) { const x = rand(0, l.x0); parts.push({ k: 'spark', x, y: l.y + rand(-half, half), vx: -rand(200, 500), vy: rand(-90, 90), life: .25, max: .25, c: pick([LANCEC, '255,220,210']), w: 1.3 }); }
  }
  sweep(lances);
}
function drawLancePod(x, y, p, l) {
  ctx.save(); ctx.translate(x, y); const s = clamp(l.w / 26, .7, 1.35); ctx.scale(s, s);
  ctx.fillStyle = '#2a2f3a'; ctx.strokeStyle = 'rgba(255,120,110,.55)'; ctx.lineWidth = 1;
  for (const k of [-1, 1]) { ctx.beginPath(); ctx.moveTo(-6, k * 17); ctx.lineTo(14, k * 22); ctx.lineTo(21, k * 8); ctx.lineTo(4, k * 7); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  const g = ctx.createLinearGradient(0, -12, 0, 12); g.addColorStop(0, '#8a92a4'); g.addColorStop(.5, '#3e4452'); g.addColorStop(1, '#16181e');
  ctx.fillStyle = g; ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; ctx.lineTo(7 + Math.cos(a) * 13, Math.sin(a) * 12); } ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.globalCompositeOperation = 'lighter'; drawGlow(-3, 0, 8 + 16 * p, LANCEC, .5 + .5 * p); drawGlow(-3, 0, 3 + 5 * p, WHITE, .6 + .4 * p);
  ctx.restore(); ctx.globalCompositeOperation = 'source-over';
}
function drawLances() {
  if (!lances.length) return;
  for (const l of lances) {
    if (l.v) {
      const px = H + 40 - l.x0;
      ctx.save(); ctx.transform(0, -1, 1, 0, l.y, l.x0 + px); drawLance(l, px, 0, true); ctx.restore(); ctx.globalCompositeOperation = 'source-over';
      if (l.t < l.charge) { const p = clamp(l.t / l.charge, 0, 1), fl = .5 + .5 * Math.sin(l.t * (9 + p * 26)); lanceIcon(l.y, l.x0 + 40, p, fl); }
    } else drawLance(l, l.owner ? l.x0 : W - 8 - inset.r, l.y, false);
  }
}
function lanceIcon(ix, y, p, fl) {
  const s = 10 + 2 * fl;
  ctx.fillStyle = `rgba(255,62,62,${.6 + .4 * fl})`; ctx.beginPath(); ctx.moveTo(ix, y - s); ctx.lineTo(ix + s * .98, y + s * .72); ctx.lineTo(ix - s * .98, y + s * .72); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#1a0405'; ctx.font = `800 ${Math.round(s * 1.05)}px ${FD}`; ctx.textAlign = 'center'; ctx.fillText('!', ix, y + s * .58); ctx.textAlign = 'left';
  ctx.strokeStyle = 'rgba(255,205,195,.85)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(ix, y + 1, s + 7, -Math.PI / 2, -Math.PI / 2 + TAU * (1 - p)); ctx.stroke();
}
function drawLance(l, px, y, vert) {
  {
    const ft = l.t - l.charge, half = l.w / 2;
    if (ft < 0) {
      const p = clamp(l.t / l.charge, 0, 1), fl = .5 + .5 * Math.sin(l.t * (9 + p * 26));
      ctx.fillStyle = `rgba(${LANCEC},${.05 + .14 * p * fl})`; ctx.fillRect(0, y - half, px, l.w);
      ctx.strokeStyle = `rgba(255,110,110,${.25 + .55 * p})`; ctx.lineWidth = 1.2; ctx.setLineDash([16, 10]); ctx.lineDashOffset = l.t * 140;
      ctx.beginPath(); ctx.moveTo(0, y - half); ctx.lineTo(px, y - half); ctx.moveTo(0, y + half); ctx.lineTo(px, y + half); ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0;
      const cs = Math.max(4, Math.min(half * .7, 11)), off = (l.t * 220) % 70;
      ctx.strokeStyle = `rgba(255,150,140,${.18 + .45 * p * fl})`; ctx.lineWidth = 2;
      ctx.beginPath(); for (let x = px - 70 - off; x > 8; x -= 70) { ctx.moveTo(x + cs, y - cs); ctx.lineTo(x, y); ctx.lineTo(x + cs, y + cs); } ctx.stroke();
      if (l.owner && l.owner.kind === 'colossus') {
        const cx = l.owner.x - l.owner.hw * .56, cy = l.owner.y;
        if (Math.abs(cy - y) > 12) { ctx.strokeStyle = `rgba(${LANCEC},${.25 + .45 * p})`; ctx.lineWidth = 1.6; ctx.setLineDash([5, 7]); ctx.lineDashOffset = -l.t * 90; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px + 8, y); ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0; }
      }
      drawLancePod(px, y, p, l);
      if (!vert) lanceIcon(px - 38, y, p, fl);
    } else {
      const k = clamp(Math.min(ft / .06, (l.fire - ft) / .16), 0, 1), ext = clamp(ft / .09, 0, 1), xe = px - (px + 40) * ext, fl = .85 + .15 * Math.sin(S.t * 80 + y), w = l.w * k * fl;
      ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'butt';
      const seg = (lw, col) => { ctx.strokeStyle = col; ctx.lineWidth = Math.max(.5, lw); ctx.beginPath(); ctx.moveTo(px, y); ctx.lineTo(xe, y); ctx.stroke(); };
      seg(w * 3, `rgba(${LANCEC},.14)`); seg(w * 1.6, `rgba(${LANCEC},.38)`); seg(w, 'rgba(255,90,80,.85)'); seg(w * .42, 'rgba(255,242,236,.97)');
      drawGlow(px, y, l.w * 2.4, LANCEC, k); drawGlow(px, y, l.w, WHITE, k);
      if (ext < 1) drawGlow(xe, y, l.w * 1.8, '255,190,170', 1);
      ctx.globalCompositeOperation = 'source-over';
      drawLancePod(px, y, 1, l);
    }
  }
}
function bossLance(e, mode, L) {
  const o = { owner: e, w: (26 + e.tier * 3 + (e.kind === 'colossus' ? 6 : 0)) * unitScale(), charge: Math.max(1.05, 1.45 - (L - 1) * .22), fire: .85 };
  const l = (S.side ? lanceVolley : vlanceVolley)(mode, o);
  if (e.sideBoss && l) { e.lanceY = l.y; e.lanceT = o.charge + .5; }
  e.hold = Math.max(e.hold, 1.2);
}
function flightLance(lv) {
  const r = rnd(), mode = lv >= 7 && r < .35 ? 'cascade' : lv >= 4 && r < (lv >= 7 ? .7 : .45) ? 'double' : 'single';
  lanceVolley(mode, { w: (24 + lv * 1.2) * unitScale(), charge: Math.max(1.1, 1.55 - lv * .05) });
  if (!S.lanceTip) { S.lanceTip = true; S.toast = { txt: GW && GW.theme === 3 ? I18('冰川要塞光矛锁定 · 避开红色预警线', 'Glacier lance lock · dodge the red warning lanes') : surfTheme() ? I18('熔炉要塞光矛锁定 · 避开红色预警线', 'Forge lance lock · dodge the red warning lanes') : I18('巨像要塞光矛锁定 · 避开红色预警线', 'Colossus lance lock · dodge the red warning lanes'), t: 3.4 }; }
}

