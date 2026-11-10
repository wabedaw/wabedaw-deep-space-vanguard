/* ---------- audio ---------- */
let AC = null, master = null, sfxBus = null, musBus = null, musDuck = null, musFilter = null, musRev = null, revIn = null, arpIn = null;
let noiseBuf = null, brownBuf = null, holeGain = null, lastLaserSfx = 0, lastHitSfx = 0, musFilterT = 0;
const boomLog = [];
let soundMode = 0; // 0 all on, 1 effects only, 2 muted
soundMode = clamp(SAVE.get('sound') | 0, 0, 2);
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const panX = x => !Number.isFinite(x) || !W ? 0 : clamp((x / W) * 2 - 1, -1, 1) * .75;

function makeIR(sec, decay) {
  const len = (AC.sampleRate * sec) | 0, b = AC.createBuffer(2, len, AC.sampleRate);
  for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay); }
  return b;
}
function audioInit() {
  if (AC) { if (AC.state === 'suspended' && S.mode !== 'pause') AC.resume(); return; }
  try {
    AC = new (window.AudioContext || window.webkitAudioContext)();
    const comp = AC.createDynamicsCompressor();
    comp.threshold.value = -12; comp.knee.value = 8; comp.ratio.value = 5; comp.attack.value = .003; comp.release.value = .25;
    master = AC.createGain(); master.gain.value = 0; master.connect(comp); comp.connect(AC.destination);
    sfxBus = AC.createGain(); sfxBus.connect(master);
    // music chain: bus -> filter (black hole / game over) -> duck (explosions) -> master
    musBus = AC.createGain(); musBus.gain.value = 0;
    musFilter = AC.createBiquadFilter(); musFilter.type = 'lowpass'; musFilter.frequency.value = 18000; musFilter.Q.value = .8;
    musDuck = AC.createGain();
    musBus.connect(musFilter); musFilter.connect(musDuck); musDuck.connect(master);
    // shared hall reverb
    const conv = AC.createConvolver(); conv.buffer = makeIR(3.4, 2.4);
    revIn = AC.createGain(); const revOut = AC.createGain(); revOut.gain.value = .5;
    revIn.connect(conv); conv.connect(revOut); revOut.connect(master);
    musRev = AC.createGain(); musRev.gain.value = .55; musRev.connect(musFilter);
    const mconv = AC.createConvolver(); mconv.buffer = makeIR(4.2, 2); const mIn = AC.createGain(); mIn.connect(mconv); mconv.connect(musRev); musRev._in = mIn;
    // ping-pong-ish delay for the arpeggio
    const dl = AC.createDelay(1); dl.delayTime.value = .39;
    const fb = AC.createGain(); fb.gain.value = .36;
    const dlf = AC.createBiquadFilter(); dlf.type = 'lowpass'; dlf.frequency.value = 2400;
    arpIn = AC.createGain(); arpIn.connect(dl); dl.connect(dlf); dlf.connect(fb); fb.connect(dl); dlf.connect(musBus);
    // noise buffers
    noiseBuf = AC.createBuffer(1, AC.sampleRate * 2, AC.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    brownBuf = AC.createBuffer(1, AC.sampleRate * 4, AC.sampleRate);
    const bd = brownBuf.getChannelData(0); let lastB = 0;
    for (let i = 0; i < bd.length; i++) { lastB = (lastB + .02 * (Math.random() * 2 - 1)) / 1.02; bd[i] = lastB * 3.5; }
    // ambient engine drone
    const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 170;
    const amb = AC.createGain(); amb.gain.value = .03; lp.connect(amb); amb.connect(sfxBus);
    for (const f of [55, 55.7, 82.4]) { const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.connect(lp); o.start(); }
    // black hole rumble
    holeGain = AC.createGain(); holeGain.gain.value = 0;
    const hlp = AC.createBiquadFilter(); hlp.type = 'lowpass'; hlp.frequency.value = 110;
    const hs = AC.createBufferSource(); hs.buffer = brownBuf; hs.loop = true;
    const ho = AC.createOscillator(); ho.type = 'sine'; ho.frequency.value = 31;
    const lfo = AC.createOscillator(); lfo.frequency.value = .35; const lfoG = AC.createGain(); lfoG.gain.value = 6; lfo.connect(lfoG); lfoG.connect(ho.frequency);
    hs.connect(hlp); ho.connect(hlp); hlp.connect(holeGain); holeGain.connect(sfxBus); hs.start(); ho.start(); lfo.start();
    applySound();
    MUS.start();
  } catch (e) { AC = null; }
}
function applySound() {
  updateSoundBtn();
  if (!AC) return;
  const t = AC.currentTime;
  // the quick toggle (soundMode) and the settings screen's levels (SET) multiply
  master.gain.setTargetAtTime(soundMode === 2 ? 0 : .85 * SET.master / 100, t, .08);
  musBus.gain.setTargetAtTime(soundMode === 0 ? .5 * SET.music / 100 : 0, t, .3);
  sfxBus.gain.setTargetAtTime(SET.sfx / 100, t, .08);
}
function setSoundMode(m) {
  soundMode = m;
  SAVE.set('sound', m);
  audioInit(); applySound();
  if (S.mode === 'play') S.toast = { txt: [I18('声音 · 音乐与音效全开', 'Sound · music and effects on'), I18('仅音效 · 音乐关闭', 'Effects only · music off'), I18('已静音', 'Muted')][m], t: 1.5 };
}
function out(pan = 0, rev = 0) {
  const g = AC.createGain();
  if (AC.createStereoPanner) { const p = AC.createStereoPanner(); p.pan.value = clamp(pan, -1, 1); g.connect(p); p.connect(sfxBus); }
  else g.connect(sfxBus);
  if (rev > 0) { const s = AC.createGain(); s.gain.value = rev; g.connect(s); s.connect(revIn); }
  return g;
}
const live = () => AC && soundMode !== 2 && AC.state === 'running';
const eshotT = {};
function holdHandle(nodes, g) {
  return { stop() { try { const n = AC.currentTime; g.gain.cancelScheduledValues(n); g.gain.setValueAtTime(Math.max(.0001, g.gain.value), n); g.gain.exponentialRampToValueAtTime(.0001, n + .06); for (const o of nodes) o.stop(n + .08); } catch (e) {} } };
}
function tone(type, f0, f1, dur, vol, delay = 0, dest = sfxBus, attack = .002) {
  if (!live()) return;
  const t = AC.currentTime + delay;
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t);
  if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(.0002, vol), t + attack);
  g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + .05);
}
function noise(dur, vol, f0, f1, ftype = 'lowpass', q = 1, delay = 0, dest = sfxBus, buf = noiseBuf, attack = .002) {
  if (!live()) return;
  const t = AC.currentTime + delay;
  const s = AC.createBufferSource(); s.buffer = buf;
  if (dur > buf.duration - .1) s.loop = true;
  const f = AC.createBiquadFilter(); f.type = ftype; f.Q.value = q;
  f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  const g = AC.createGain(); g.gain.setValueAtTime(.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(.0002, vol), t + attack); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(dest);
  s.start(t, s.loop ? 0 : Math.random() * Math.max(0, buf.duration - dur - .05)); s.stop(t + dur + .05);
}
function duck(amount, hold = .12) {
  if (!AC || amount <= 0) return;
  const t = AC.currentTime, g = musDuck.gain;
  g.cancelScheduledValues(t); g.setValueAtTime(g.value, t);
  g.setTargetAtTime(1 - amount, t, .012); g.setTargetAtTime(1, t + hold, .45);
}
const sfxRaw = {
  laser(x) {
    if (!live()) return; const n = AC.currentTime; if (n - lastLaserSfx < .075) return; lastLaserSfx = n;
    const d = out(panX(x) * .6, .06);
    tone('square', 1750, 420, .075, .028, 0, d); tone('sawtooth', 950, 190, .09, .016, 0, d);
    noise(.035, .03, 7000, 3500, 'highpass', .7, 0, d);
  },
  missile(x) {
    if (!live()) return; const d = out(panX(x), .22);
    noise(.12, .12, 1200, 300, 'lowpass', 1, 0, d);                    // clamp release
    noise(.7, .16, 600, 3400, 'bandpass', 1.4, .06, d, noiseBuf, .05); // ignition whoosh
    tone('sawtooth', 120, 560, .4, .045, .06, d, .03);
  },
  hit(x, ship) {
    if (!live()) return; const n = AC.currentTime; if (n - lastHitSfx < .035) return; lastHitSfx = n;
    const d = out(panX(x), .05);
    if (ship) { tone('square', 560 + frand(-60, 60), 260, .05, .026, 0, d); tone('sine', 2300, 1900, .05, .018, 0, d); }
    else { noise(.06, .07, 2600, 700, 'bandpass', 2.2, 0, d); tone('triangle', 240, 140, .05, .03, 0, d); }
  },
  boom(size, x, kind = 'ship') {
    if (!live()) return;
    const now = AC.currentTime;
    while (boomLog.length && now - boomLog[0] > .12) boomLog.shift();
    const heavy = kind === 'big' || kind === 'huge';
    if (boomLog.length >= 4 && !heavy) return;
    boomLog.push(now);
    const k = clamp(size / 60, .25, 3);
    const v = Math.min(1.25, .45 + k * .4);
    const d = out(panX(x) * (heavy ? .45 : 1), .22 + Math.min(.55, k * .18));
    noise(.06, .3 * v, 7500, 2400, 'highpass', .8, 0, d);                                   // crack
    noise(.32 + k * .5, .55 * v, 2400 + k * 700, 85, 'lowpass', .9, .004, d, noiseBuf, .006); // fireball body
    tone('sine', 115 + frand(-12, 12), 27, .3 + k * .5, .62 * Math.min(1, v), 0, d, .004);     // sub thump
    tone('triangle', 68, 30, .4 + k * .4, .22 * v, .012, d, .01);
    if (kind === 'rock') noise(.22 + k * .25, .28 * v, 1000, 260, 'bandpass', 1.3, .01, d);     // stone crunch
    if (kind === 'missile') noise(.14, .22, 4200, 900, 'bandpass', 1, 0, d);                    // sharp warhead pop
    if (kind === 'ship' || heavy) for (const f of [1170, 1740, 2480]) tone('sine', f * frand(.94, 1.06), f * .78, .24 + k * .16, .02 * v, .01, d, .003); // hull shrapnel ring
    if (k > .6) noise(.9 + k * 1.2, .3 * Math.min(1.1, k * .6), 280, 45, 'lowpass', .7, .04, d, brownBuf, .08); // rumble tail
    const n = (3 + k * 7) | 0;                                                                   // debris crackle
    for (let i = 0; i < n; i++) noise(frand(.012, .03), frand(.035, .09) * v, frand(1500, 5500), frand(700, 2000), 'bandpass', 3, frand(.05, .25 + k * .35), d);
    if (kind === 'huge') {
      for (let i = 0; i < 3; i++) { const t = .22 + i * .34; noise(.7, .42, 1900, 70, 'lowpass', .8, t, d); tone('sine', 95, 24, .7, .5, t, d); }
      noise(3.4, .38, 200, 35, 'lowpass', .6, .1, d, brownBuf, .25);
      tone('sawtooth', 220, 40, 2.4, .05, .05, d, .05);
    }
    duck(k > .55 ? Math.min(.75, .2 + k * .22) : 0, heavy ? .35 : .1);
  },
  hurt() {
    if (!live()) return; const d = out(0, .12);
    noise(.32, .3, 3600, 200, 'lowpass', 1, 0, d); tone('sawtooth', 340, 70, .3, .11, 0, d); tone('square', 96, 58, .2, .08, 0, d);
    duck(.3);
  },
  shield() {
    if (!live()) return; const d = out(0, .25);
    tone('sine', 1900, 620, .28, .06, 0, d); tone('sine', 2850, 900, .22, .03, 0, d); noise(.12, .07, 9000, 4000, 'highpass', .8, 0, d);
  },
  power() {
    if (!live()) return; const d = out(0, .45);
    [76, 79, 83, 88].forEach((m, i) => { tone('triangle', mtof(m), mtof(m), .22, .08, i * .065, d, .004); tone('sine', mtof(m + 12), mtof(m + 12), .3, .03, i * .065, d, .004); });
  },
  warn() {
    if (!live()) return;
    const d = out(0, .3), t = AC.currentTime;
    const o = AC.createOscillator(), f = AC.createBiquadFilter(), g = AC.createGain();
    o.type = 'sawtooth'; f.type = 'lowpass'; f.frequency.value = 1400;
    o.frequency.setValueAtTime(420, t);
    for (let i = 0; i < 4; i++) { o.frequency.linearRampToValueAtTime(840, t + i * .8 + .4); o.frequency.linearRampToValueAtTime(420, t + i * .8 + .8); }
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.07, t + .1); g.gain.setValueAtTime(.07, t + 3); g.gain.linearRampToValueAtTime(0, t + 3.3);
    o.connect(f); f.connect(g); g.connect(d); o.start(t); o.stop(t + 3.4);
    for (let i = 0; i < 4; i++) tone('sine', 55, 40, .5, .35, i * .8, d, .01);
    duck(.5, 3);
  },
  sector() {
    if (!live()) return; const d = out(0, .55);
    [57, 64, 69, 76].forEach((m, i) => tone('sine', mtof(m), mtof(m), 1.4, .06, i * .09, d, .01));
    noise(1.2, .05, 800, 6000, 'bandpass', 1.2, 0, d, noiseBuf, .5);
  },
  eshot(k, x) {
    if (!live()) return; const n = AC.currentTime;
    if (n - (eshotT[k] || 0) < (k === 'orb' || k === 'wave' ? .09 : .07)) return; eshotT[k] = n;
    const d = out(panX(x) * .8, .08);
    if (k === 'orb') { tone('sine', 560, 190, .12, .02, 0, d); tone('triangle', 1100, 320, .07, .009, 0, d); }
    else if (k === 'needle') { tone('sawtooth', 2700, 950, .06, .013, 0, d); noise(.035, .018, 8000, 4500, 'highpass', .7, 0, d); }
    else if (k === 'shell') { tone('sine', 150, 48, .28, .16, 0, d); noise(.2, .12, 1100, 180, 'lowpass', 1, 0, d); }
    else if (k === 'homing') { tone('square', 320, 760, .2, .016, 0, d); tone('sine', 640, 1500, .2, .02, 0, d); }
    else if (k === 'wave') { tone('sine', 760, 380, .16, .02, 0, d); tone('sine', 380, 190, .16, .014, 0, d); }
    else if (k === 'rocket') { noise(.3, .09, 800, 3200, 'bandpass', 1.4, 0, d); tone('sawtooth', 160, 320, .2, .02, 0, d); }
    else if (k === 'bomb') tone('sine', 1300, 520, .7, .018, 0, d, .05);
  },
  beamCharge(dur, x, big) {
    if (!live()) return null;
    const t = AC.currentTime, d = out(panX(x) * .5, .3);
    const o = AC.createOscillator(), o2 = AC.createOscillator(), g = AC.createGain(), g2 = AC.createGain();
    o.type = 'sine'; o2.type = 'triangle';
    o.frequency.setValueAtTime(big ? 140 : 260, t); o.frequency.exponentialRampToValueAtTime(big ? 1100 : 1700, t + dur);
    o2.frequency.setValueAtTime(big ? 283 : 523, t); o2.frequency.exponentialRampToValueAtTime(big ? 2230 : 3420, t + dur);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(big ? .07 : .035, t + dur);
    g2.gain.value = .35; o2.connect(g2); g2.connect(g); o.connect(g); g.connect(d);
    o.start(t); o2.start(t); o.stop(t + dur + .1); o2.stop(t + dur + .1);
    return holdHandle([o, o2], g);
  },
  beamFire(dur, x, big) {
    if (!live()) return null;
    const t = AC.currentTime, d = out(panX(x) * .5, .25), v = big ? .16 : .08;
    const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = big ? 1300 : 2200; f.Q.value = 3;
    const g = AC.createGain();
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .03); g.gain.setValueAtTime(v, t + Math.max(.05, dur - .15)); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    const nodes = [];
    for (const [fr, ty] of [[big ? 55 : 110, 'sawtooth'], [big ? 55.8 : 111.3, 'sawtooth'], [big ? 110 : 220, 'square']]) { const o = AC.createOscillator(); o.type = ty; o.frequency.value = fr; o.connect(f); o.start(t); o.stop(t + dur + .05); nodes.push(o); }
    const amp = AC.createGain(); amp.gain.value = .75;
    const trem = AC.createOscillator(), tg = AC.createGain(); trem.frequency.value = 28; tg.gain.value = .3; trem.connect(tg); tg.connect(amp.gain);
    f.connect(amp); amp.connect(g); trem.start(t); trem.stop(t + dur + .05); nodes.push(trem);
    const s = AC.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    const nf = AC.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = big ? 900 : 2400; nf.Q.value = 1.2;
    const ng = AC.createGain(); ng.gain.value = .5; s.connect(nf); nf.connect(ng); ng.connect(g); s.start(t); s.stop(t + dur + .05); nodes.push(s);
    g.connect(d);
    if (big) duck(.4, dur);
    return holdHandle(nodes, g);
  },
  captured(dur) {
    if (!live()) return; const d = out(0, .5);
    tone('sine', 45, 900, dur, .12, 0, d, dur * .7);
    tone('sawtooth', 30, 260, dur, .05, 0, d, dur * .6);
    noise(dur, .3, 120, 2400, 'bandpass', 1.5, 0, d, brownBuf, dur * .8);
    duck(.6, dur);
  },
  consumed() {
    if (!live()) return; const d = out(0, .7);
    tone('sine', 140, 18, 1.8, .7, 0, d, .005);
    noise(1.6, .45, 3000, 60, 'lowpass', .8, 0, d, noiseBuf, .005);
    for (const f of [1320, 1980, 2640]) tone('sine', f, f * .5, 2.2, .025, .05, d, .01);
    duck(.85, 1.2);
  },
  shieldBreak() {
    if (!live()) return; const d = out(0, .6);
    for (const f of [1760, 2350, 3140]) tone('sine', f, f * .35, 1.1, .05, 0, d, .004);
    noise(.9, .3, 6000, 300, 'bandpass', 1.4, 0, d); tone('sine', 220, 40, .9, .35, .02, d, .005);
    duck(.6, .8);
  },
  entry(dur) {
    if (!live()) return; const d = out(0, .5);
    noise(dur, .4, 120, 1800, 'lowpass', .8, 0, d, brownBuf, dur * .8);
    noise(dur * .9, .18, 600, 4200, 'bandpass', 1.2, 0, d, noiseBuf, dur * .7);
    tone('sawtooth', 40, 140, dur, .06, 0, d, dur * .8);
    duck(.5, dur);
  },
  beamHum(lvl) {
    if (!live()) return null;
    const t = AC.currentTime, d = out(0, .2), g = AC.createGain();
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.045 + lvl * .004, t + .08);
    const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1300 + lvl * 160; f.Q.value = 4;
    const am = AC.createGain(); am.gain.value = .8; const nodes = [];
    for (const [fr, ty] of [[110 + lvl * 6, 'sawtooth'], [221 + lvl * 12, 'sawtooth'], [440 + lvl * 24, 'triangle']]) { const o = AC.createOscillator(); o.type = ty; o.frequency.value = fr; o.connect(f); o.start(t); nodes.push(o); }
    const lfo = AC.createOscillator(), lg = AC.createGain(); lfo.frequency.value = 32; lg.gain.value = .25; lfo.connect(lg); lg.connect(am.gain); lfo.start(t); nodes.push(lfo);
    f.connect(am); am.connect(g); g.connect(d);
    tone('sine', 900, 1700, .12, .05, 0, d);
    return holdHandle(nodes, g);
  },
  clang(x) { if (!live()) return; const t = AC.currentTime; if (t - (eshotT.cl || 0) < .07) return; eshotT.cl = t; const d = out(panX(x) * .6, .1); tone('triangle', 2100, 1700, .09, .022, 0, d); tone('sine', 3300, 3000, .06, .012, 0, d); },
  boomPop(x) {
    if (!live()) return; const n = AC.currentTime; if (n - (eshotT.pop || 0) < .06) return; eshotT.pop = n;
    const d = out(panX(x), .1); noise(.12, .1, 2600, 400, 'lowpass', 1, 0, d); tone('sine', 190, 60, .12, .07, 0, d);
  },
  weaponSwitch() { if (!live()) return; const d = out(0, .2); tone('square', 660, 990, .08, .035, 0, d); tone('triangle', 1320, 1320, .1, .03, .07, d); },
  launch() {
    if (!live()) return; const d = out(0, .45);
    noise(1.1, .35, 300, 5200, 'bandpass', 1.2, 0, d, noiseBuf, .55);
    tone('sawtooth', 70, 420, 1, .07, 0, d, .6); tone('sine', 110, 880, .95, .1, 0, d, .7);
    tone('sine', 60, 28, .7, .45, .9, d, .005); noise(.5, .3, 2400, 120, 'lowpass', .8, .9, d);
    duck(.45, 1.1);
  },
  empty() { if (!live()) return; tone('square', 150, 120, .07, .04, 0, out(0, 0)); tone('square', 150, 120, .07, .04, .1, out(0, 0)); },
  zap(x) { if (!live()) return; const t = AC.currentTime; if (t - (eshotT.zap || 0) < .3) return; eshotT.zap = t; const d = out(panX(x) * .6, .12); noise(.3, .05, 2600, 5200, 'bandpass', 2, 0, d); tone('square', 92, 70, .3, .018, 0, d); },
  whoosh(x) { if (!live()) return; const t = AC.currentTime; if (t - (eshotT.wh || 0) < .3) return; eshotT.wh = t; const d = out(panX(x) * .6, .12); noise(.7, .06, 300, 1400, 'lowpass', 1, 0, d, brownBuf || noiseBuf, .05); },
  lanceWarn() { if (!live()) return; const t = AC.currentTime; if (t - (eshotT.lw || 0) < .25) return; eshotT.lw = t; const d = out(.55, .15); tone('square', 1320, 1320, .06, .028, 0, d); tone('square', 1320, 1320, .06, .028, .1, d); tone('square', 1760, 1760, .1, .03, .2, d); },
  alarm() { if (!live()) return; const d = out(0, .2); tone('square', 990, 990, .09, .035, 0, d); tone('square', 740, 740, .12, .035, .13, d); },
};

const sfx = {};
for (const k in sfxRaw) sfx[k] = (...a) => { try { return sfxRaw[k](...a); } catch (e) { return null; } };

