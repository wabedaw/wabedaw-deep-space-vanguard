/* ---------- vertical lethal lances (columns fired down the screen in space stages) ---------- */
function vlanceVolley(mode, o = {}) {
  const lo = 24 + inset.l, hi = W - 24 - inset.r, w = o.w ?? 24 * unitScale(), ch = o.charge ?? 1.3, base = { owner: o.owner || null, charge: ch, fire: o.fire ?? .85, w, v: true };
  const px = clamp(P.x, lo, hi), gap = w * 2.4 + 46;
  if (mode === 'double') {
    let x2 = px, n = 0; while (Math.abs(x2 - px) < gap && n++ < 14) x2 = rand(lo, hi);
    if (Math.abs(x2 - px) >= gap) addLance(x2, { ...base, quiet: true });
  } else if (mode === 'cascade') {
    const d = hi - px > px - lo ? 1 : -1;
    for (let i = 1; i < 3; i++) { const x = px + d * i * gap; if (x < lo - 4 || x > hi + 4) break; addLance(x, { ...base, charge: ch + i * .4, quiet: true }); }
  } else if (mode === 'wall') {
    const n = Math.max(3, Math.floor((hi - lo) / (w * 1.5 + 34))), sp = (hi - lo) / n, cur = clamp(Math.floor((px - lo) / sp), 0, n - 1);
    let safe = clamp(cur + (Math.random() < .5 ? -1 : 1) * (1 + ((Math.random() * 2) | 0)), 0, n - 1); if (safe === cur) safe = cur > 0 ? cur - 1 : cur + 1;
    let last = null;
    for (let i = 0; i < n; i++) if (i !== safe) last = addLance(lo + (i + .5) * sp, { ...base, w: sp * .62, charge: ch + .5, quiet: !!last });
    return last;
  }
  return addLance(px, base);
}

