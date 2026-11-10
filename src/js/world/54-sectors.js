/* ---------- sectors ---------- */
function nextSector() {
  S.sector++; S.sectorT = 0; S.bossPending = false;
  S.banner = { big: sectorTag(), sub: sectorName(), t: 0, dur: 3.2 };
  if (S.side && GW) { S.scrollT = scrollFor(); setSky(skyForLv(levelOf(S.sector))); }
  else if (IW) S.scrollT = baseScroll();
  sfx.sector();
}

