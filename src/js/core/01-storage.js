/* ---------- storage ---------- */
let best = 0;
best = Math.max(0, SAVE.get('best') | 0);
function saveBest() { SAVE.set('best', best); }

