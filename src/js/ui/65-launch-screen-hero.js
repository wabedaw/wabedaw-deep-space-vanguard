/* ---------- launch screen hero ---------- */
const LAUNCH_DUR = .95;
let heroBand = null;
function measureHero() {
  const hd = document.querySelector('.hero-head'), ft = document.querySelector('.hero-foot');
  if (!hd || !ft || menuEl.hidden) return;
  const top = hd.offsetTop + hd.offsetHeight, bot = ft.offsetTop;
  heroBand = bot - top > 60 ? { top, bot } : null;
}
function heroPose() {
  let k0 = clamp(Math.min(W, H * .85) / 190, 2.2, 4.2), yc = H * .49;
  if (heroBand) { const band = heroBand.bot - heroBand.top - 12; k0 = clamp(band / 86, 1.3, k0); yc = heroBand.top + 6 + 35 * k0 + Math.max(0, band - 86 * k0) / 2; }
  const x0 = W / 2 + Math.sin(S.t * .5) * W * .025, y0 = yc + Math.sin(S.t * 1.3) * 6;
  if (S.mode !== 'launch') return { x: x0, y: y0, k: k0, q: 0 };
  const q = clamp(S.launchT / LAUNCH_DUR, 0, 1), e = q * q * q;
  return { x: x0 + (W / 2 - x0) * q, y: y0 + 14 * Math.sin(q * Math.PI * 1.6) * (1 - q) - e * (y0 + 70 * k0), k: k0 * (1 - .55 * e), q };
}
function heroExhaust() {
  if (parts.length > 1400) return;
  const h = heroPose(), boost = S.mode === 'launch' ? 1.8 : 1, bank = Math.sin(S.t * .8) * .3, sx = 1 - Math.abs(bank) * .28;
  for (const sd of [-5, 5]) for (let i = 0; i < (S.mode === 'launch' ? 3 : 2); i++) {
    parts.push({ k: 'ember', x: h.x + sd * sx * h.k + rand(-1, 1) * h.k, y: h.y + 28 * h.k, vx: rand(-20, 20) * h.k * .3, vy: rand(260, 440) * boost * h.k / 3, life: rand(.18, .34), max: .34, c: pick(['120,200,255', '200,240,255', '90,160,255']), r: rand(1.4, 2.6) * h.k / 2.4 });
  }
}
function drawHero() {
  const h = heroPose(); if (h.q >= 1) return;
  const keep = { x: P.x, y: P.y, bank: P.bank, evy: P.evy, inv: P.inv, hitT: P.hitT, shield: P.shield, alive: P.alive, cap: P.cap, muzzle: P.muzzle, lw: P.lw };
  Object.assign(P, { x: 0, y: 0, bank: Math.sin(S.t * .8) * .3, evy: S.mode === 'launch' ? -900 : -260, inv: 0, hitT: 0, shield: 0, alive: true, cap: null, muzzle: 0, lw: 1.3 / h.k });
  ctx.save(); ctx.translate(h.x, h.y); ctx.scale(h.k, h.k);
  ctx.globalCompositeOperation = 'lighter';
  drawGlow(0, 2, 46, '94,242,255', .12);
  drawGlow(0, 40, 24 + h.q * 20, '80,170,255', .45 + h.q * .5);
  ctx.globalCompositeOperation = 'source-over';
  drawPlayer();
  ctx.restore();
  Object.assign(P, keep);
}

