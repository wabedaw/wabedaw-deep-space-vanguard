/* ---------- procedural soundtrack ---------- */
const PROG = { chords: [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]], bass: [33, 29, 36, 31] };      // Am F C G
const BOSSP = { chords: [[50, 53, 57], [46, 50, 53], [43, 46, 50], [45, 49, 52]], bass: [38, 34, 31, 33] };     // Dm Bb Gm A
const ARP = [0, 1, 2, 3, 4, 5, 4, 3, 1, 2, 3, 4, 5, 4, 2, 1];
const MUS = {
  mode: 'off', step: 0, next: 0, timer: null, bpm: 92,
  start() { if (this.timer) return; this.next = AC.currentTime + .1; this.timer = setInterval(() => this.tick(), 25); },
  setMode(m) {
    if (m === this.mode) return;
    const prev = this.mode; this.mode = m;
    this.bpm = m === 'boss' ? 128 : m === 'play' ? 116 : 88;
    if ((m === 'play' || m === 'boss') && prev !== m) this.step = Math.ceil(this.step / 16) * 16;
    if (AC) musFilter.frequency.setTargetAtTime(m === 'over' ? 650 : 18000, AC.currentTime, .6);
  },
  tick() {
    if (!AC || AC.state !== 'running') return;
    const spb = 60 / this.bpm / 4;
    if (this.next < AC.currentTime - .3) this.next = AC.currentTime + .05;
    while (this.next < AC.currentTime + .14) {
      if (soundMode === 0 && this.mode !== 'off') this.play(this.step, this.next, spb);
      this.step++; this.next += spb;
    }
  },
  play(step, t, spb) { try { this.playInner(step, t, spb); } catch (e) {} },
  playInner(step, t, spb) {
    const m = this.mode, s = step % 16, bar = Math.floor(step / 16) % 4;
    const P2 = m === 'boss' ? BOSSP : PROG, ch = P2.chords[bar], root = P2.bass[bar];
    if (s === 0) mPad(ch, t, spb * 16, m);
    if (m === 'menu' || m === 'over') {
      if (s === 0) mBass(root, t, spb * 15, .55, true);
      if (m === 'menu' && s % 4 === 2 && Math.random() < .55) mPluck(pick(ch) + 24, t, .045);
      if (m === 'menu' && s === 8 && bar % 2 === 1) mBell(ch[2] + 24, t);
      if (m === 'over' && s === 0 && bar === 0) mBell(ch[0] + 12, t);
      return;
    }
    const boss = m === 'boss';
    const bassHits = boss ? [0, 2, 4, 6, 8, 10, 12, 14] : [0, 3, 6, 8, 10, 11, 14];
    if (bassHits.includes(s)) mBass(root + (s === 6 || s === 14 ? 12 : 0), t, spb * 1.7, boss ? .5 : .42);
    const arpN = [ch[0], ch[1], ch[2], ch[0] + 12, ch[1] + 12, ch[2] + 12];
    if (boss || s % 2 === 0 || step % 64 >= 32) mPluck(arpN[ARP[s]] + 12, t, boss ? .034 : .026);
    if (boss ? s % 4 === 0 : (s === 0 || s === 8 || s === 10)) mKick(t, 1);
    if (s === 4 || s === 12) mSnare(t);
    if (boss) mHat(t, s % 4 === 2 ? .07 : .035, s === 14);
    else if (s % 2 === 0) mHat(t, s % 4 === 2 ? .06 : .03, s === 14);
    if (boss && (s === 0 || s === 10) && bar !== 3) mStab(ch, t);
    if (!boss && s === 0 && bar === 0 && Math.floor(step / 64) % 2 === 1) mBell(ch[2] + 24, t);
  },
};
function mVoice(dest, v, t, a, dur, rel) {
  const g = AC.createGain();
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + a);
  g.gain.setValueAtTime(v, t + Math.max(a, dur)); g.gain.linearRampToValueAtTime(0, t + Math.max(a, dur) + rel);
  g.connect(dest); return g;
}
function mPad(notes, t, dur, m) {
  const calm = m === 'menu' || m === 'over';
  for (const n of notes) for (const det of [-8, 8]) {
    const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(n); o.detune.value = det;
    const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 2;
    f.frequency.setValueAtTime(420, t); f.frequency.linearRampToValueAtTime(m === 'boss' ? 1700 : calm ? 900 : 1200, t + dur * .5); f.frequency.linearRampToValueAtTime(500, t + dur);
    const g = mVoice(musBus, calm ? .03 : .02, t, Math.min(1.4, dur * .3), dur * .85, 1.2);
    const sg = AC.createGain(); sg.gain.value = .9; g.connect(sg); sg.connect(musRev._in);
    o.connect(f); f.connect(g); o.start(t); o.stop(t + dur + 1.4);
  }
}
function mBass(n, t, dur, v, soft) {
  const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = soft ? 1 : 6;
  f.frequency.setValueAtTime(soft ? 260 : 1100, t); f.frequency.exponentialRampToValueAtTime(soft ? 200 : 180, t + Math.min(dur, .25));
  const g = mVoice(musBus, v * .2, t, soft ? .6 : .006, dur * .7, soft ? 1 : .08);
  f.connect(g);
  const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(n); o.connect(f);
  const sub = AC.createOscillator(); sub.type = 'sine'; sub.frequency.value = mtof(n - 12); const sg = AC.createGain(); sg.gain.value = .9; sub.connect(sg); sg.connect(g);
  o.start(t); sub.start(t); o.stop(t + dur + 1.2); sub.stop(t + dur + 1.2);
}
function mPluck(n, t, v) {
  const o = AC.createOscillator(); o.type = 'square'; o.frequency.value = mtof(n);
  const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(3800, t); f.frequency.exponentialRampToValueAtTime(500, t + .18);
  const g = AC.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + .22);
  o.connect(f); f.connect(g); g.connect(musBus); const s = AC.createGain(); s.gain.value = .6; g.connect(s); s.connect(arpIn);
  o.start(t); o.stop(t + .25);
}
function mBell(n, t) {
  for (const [r, v, d] of [[1, .05, 2.6], [2.76, .02, 1.4], [5.4, .008, .7]]) {
    const o = AC.createOscillator(); o.type = 'sine'; o.frequency.value = mtof(n) * r;
    const g = AC.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g); g.connect(musBus); const s = AC.createGain(); s.gain.value = 1; g.connect(s); s.connect(musRev._in);
    o.start(t); o.stop(t + d + .05);
  }
}
function mKick(t, v) {
  const o = AC.createOscillator(); o.type = 'sine';
  o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + .12);
  const g = AC.createGain(); g.gain.setValueAtTime(.55 * v, t); g.gain.exponentialRampToValueAtTime(.0001, t + .32);
  o.connect(g); g.connect(musBus); o.start(t); o.stop(t + .35);
  const s = AC.createBufferSource(); s.buffer = noiseBuf; const f = AC.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 3000;
  const cg = AC.createGain(); cg.gain.setValueAtTime(.08, t); cg.gain.exponentialRampToValueAtTime(.0001, t + .015);
  s.connect(f); f.connect(cg); cg.connect(musBus); s.start(t, Math.random()); s.stop(t + .03);
}
function mSnare(t) {
  const s = AC.createBufferSource(); s.buffer = noiseBuf;
  const f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1900; f.Q.value = .8;
  const g = AC.createGain(); g.gain.setValueAtTime(.2, t); g.gain.exponentialRampToValueAtTime(.0001, t + .18);
  s.connect(f); f.connect(g); g.connect(musBus); const r = AC.createGain(); r.gain.value = .5; g.connect(r); r.connect(musRev._in);
  s.start(t, Math.random()); s.stop(t + .2);
  const o = AC.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(200, t); o.frequency.exponentialRampToValueAtTime(150, t + .08);
  const og = AC.createGain(); og.gain.setValueAtTime(.12, t); og.gain.exponentialRampToValueAtTime(.0001, t + .1);
  o.connect(og); og.connect(musBus); o.start(t); o.stop(t + .12);
}
function mHat(t, v, open) {
  const s = AC.createBufferSource(); s.buffer = noiseBuf;
  const f = AC.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7600;
  const d = open ? .22 : .045;
  const g = AC.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
  s.connect(f); f.connect(g); g.connect(musBus); s.start(t, Math.random()); s.stop(t + d + .02);
}
function mStab(ch, t) {
  for (const n of ch) {
    const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(n + 12);
    const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(2600, t); f.frequency.exponentialRampToValueAtTime(400, t + .3);
    const g = AC.createGain(); g.gain.setValueAtTime(.03, t); g.gain.exponentialRampToValueAtTime(.0001, t + .32);
    o.connect(f); f.connect(g); g.connect(musBus); const r = AC.createGain(); r.gain.value = .6; g.connect(r); r.connect(musRev._in);
    o.start(t); o.stop(t + .35);
  }
}

