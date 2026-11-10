/* ---------- storage ---------- */
let best = 0;
try { best = Math.max(parseInt(localStorage.getItem('dsv-best') || '0', 10) || 0, parseInt(localStorage.getItem('dsv-best-en') || '0', 10) || 0); } catch (e) {}
function saveBest() { try { localStorage.setItem('dsv-best', String(best)); } catch (e) {} }

