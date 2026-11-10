/* ---------- theme C: boss roster, patterns and shared glue ---------- */
const FORT_MODS_C = ['turret', 'laser', 'missile', 'hangar', 'turret', 'laser', 'turret', 'missile', 'laser', 'hangar', 'turret', 'laser'];
Object.assign(BOSSES, {
  glacier: { name: I18('冰川级无畏舰 · GLACIER', 'GLACIER-CLASS DREADNOUGHT') },
  aurora: { name: I18('极光级航母 · AURORA', 'AURORA-CLASS CARRIER') },
  zenith: { name: I18('天顶环站 · ZENITH', 'ZENITH RING STATION') },
  cryo: { name: I18('冰晶堡垒星 · GLACIUS', 'GLACIUS CRYO WORLD') },
  frostwing: { name: I18('霜翼级截击舰 · FROSTWING', 'FROSTWING-CLASS INTERCEPTOR') },
  icebreaker: { name: I18('破冰级重舰 · ICEBREAKER', 'ICEBREAKER-CLASS RAM SHIP') },
  cyclone: { name: I18('气旋级风暴舰 · CYCLONE', 'CYCLONE-CLASS STORM SHIP') },
  frostcit: { name: I18('冰川要塞 · GLACIER CITADEL', 'GLACIER CITADEL') },
  cgate1: { name: I18('晶格之门 · LATTICE GATE', 'LATTICE GATE') },
  cgate2: { name: I18('棱镜闸门 · PRISM GATE', 'PRISM GATE') },
  cgate3: { name: I18('奇点闸门 · SINGULARITY GATE', 'SINGULARITY GATE') },
  zero: { name: I18('绝对零度 · ABSOLUTE ZERO', 'ABSOLUTE ZERO') },
});
Object.assign(BOSS_PAT, {
  glacier: [['fan', 'turrets', 'shells', 'aimed'], ['turrets', 'laser', 'lance', 'fan', 'homing', 'shells'], ['twin', 'lances', 'turrets', 'cascade', 'counter', 'rain', 'avalanche']],
  aurora: [['waves', 'laser', 'fan', 'drones'], ['wheel', 'twin', 'lance', 'waves', 'homing', 'avalanche'], ['wall', 'wheel', 'twin', 'lances', 'waves', 'flower']],
  zenith: [['spiral', 'counter', 'aimed', 'lance'], ['wheel', 'spiral', 'lances', 'counter', 'turrets', 'homing'], ['wall', 'cascade', 'wheel', 'flower', 'counter', 'lances', 'twin', 'avalanche']],
  cryo: [['aimed', 'fan', 'avalanche', 'shells'], ['laser', 'lance', 'counter', 'homing', 'avalanche', 'artillery', 'fan'], ['twin', 'lances', 'cascade', 'avalanche', 'artillery', 'wheel', 'counter', 'homing', 'wall']],
  frostwing: [['aimed', 'fan', 'waves', 'turrets'], ['aimed', 'lance', 'fan', 'homing', 'turrets'], ['twin', 'lance', 'aimed', 'cascade', 'fan', 'homing']],
  icebreaker: [['broadside', 'turrets', 'fan', 'shells'], ['laser', 'turrets', 'lance', 'broadside', 'homing', 'rain'], ['lances', 'twin', 'turrets', 'rain', 'counter', 'broadside']],
  cyclone: [['spiral', 'waves', 'turrets', 'aimed'], ['wheel', 'lance', 'spiral', 'counter', 'waves'], ['wall', 'wheel', 'cascade', 'flower', 'counter', 'lances']],
  frostcit: [['aimed', 'lance', 'fan', 'avalanche'], ['laser', 'lance', 'counter', 'avalanche', 'homing', 'lances', 'fan', 'rain', 'fighters'], ['twin', 'lances', 'laser', 'avalanche', 'cascade', 'rain', 'counter', 'homing', 'wheel', 'fighters', 'lance']],
  cgate1: [['aimed', 'fan', 'avalanche'], ['aimed', 'fan', 'homing', 'avalanche', 'shells'], ['aimed', 'homing', 'fan', 'avalanche', 'counter', 'shells']],
  cgate2: [['aimed', 'lance', 'fan', 'avalanche'], ['lance', 'homing', 'spiral', 'avalanche', 'laser', 'fan'], ['lances', 'twin', 'homing', 'avalanche', 'counter', 'laser', 'lance']],
  cgate3: [['aimed', 'lances', 'fan', 'avalanche', 'homing'], ['lances', 'laser', 'cascade', 'avalanche', 'counter', 'homing', 'twin'], ['cascade', 'wheel', 'lances', 'avalanche', 'twin', 'counter', 'homing', 'flower']],
  zero: [['spiral', 'lance', 'turrets', 'flower', 'avalanche', 'homing', 'lances'], ['wheel', 'lance', 'counter', 'avalanche', 'lances', 'flower', 'laser', 'cascade', 'fighters'], ['wall', 'wheel', 'avalanche', 'cascade', 'twin', 'lances', 'counter', 'wall', 'flower']],
});
Object.assign(PAT_DUR, { avalanche: 2.6 });
Object.assign(BOSS_FN, {
  avalanche(e, c, G, s, L) {
    if (c.ft > 0) return; c.ft = .12 / L;
    const x = rand(W * .04, W * .96), y = S.side ? (IW ? ceilAt(x) + 6 : inset.t + 4) : -10;
    eFire('needle', x, y, S.side ? Math.PI * .62 + rand(-.1, .1) : Math.PI / 2 + rand(-.12, .12), (S.side ? 300 : 340) * s, { c: ICE, r: 4, silent: c.n++ % 3 !== 0 });
  },
});
['cryo', 'frostcit', 'zero', 'frostwing', 'icebreaker', 'cyclone'].forEach(k => CYC_KINDS.add(k));
CINE_PAL[3] = { cloud: '238,246,255', cover: '240,248,255', sky: ['#0b2a4a', '#2a6a9a', '#cfe8f2'], planet: ['#d6eaf6', '#5a7c98', '#0e1a28'], atm: '170,230,255', lights: '160,230,255',
  blast: ['255,255,255', '200,240,255', '140,210,255', '130,140,255'], rib: '#22344a', ribL: '170,230,255', tun: '#050a12', fire: '170,225,255' };
const FTC = {
  1: { glow: '90,150,255', sh1: '120,220,255', sh2: '160,235,255', teth: '120,220,255', ring: 'rgba(120,220,255,.85)' },
  2: { glow: '120,230,110', sh1: '170,255,130', sh2: '200,255,170', teth: HIVE, ring: 'rgba(170,255,120,.85)' },
  3: { glow: '170,220,255', sh1: '200,240,255', sh2: '230,250,255', teth: '220,245,255', ring: 'rgba(220,245,255,.9)' },
};

/* ===================== FINAL STAGE (stage 10): the Omega Star and OMEGA, the First Light ===================== */
const OMEGA_C = '255,110,90', GODC = '255,222,150';
const FINAL_NAMES = [I18('终焉宙域', 'Omega Approach'), I18('内部战壕', 'The Trench'), I18('星核 · 始源之光', 'The Core · First Light'), '', '', '', '', '', '', ''];
Object.assign(BOSSES, {
  omega: { name: I18('终焉之星 · OMEGA STAR', 'THE OMEGA STAR') },
  god: { name: I18('始源之光 · 奥米伽', 'OMEGA · THE FIRST LIGHT') },
});
Object.assign(BOSS_PAT, {
  omega: [['aimed', 'superlaser', 'fan', 'swarm', 'homing', 'spiral'], ['swarm', 'superlaser', 'rain', 'counter', 'lances', 'homing'], ['superlaser', 'cascade', 'wheel', 'swarm', 'wall', 'twin', 'flower']],
  god: [['aimed', 'fan', 'waves'], ['lances', 'swarm', 'wall', 'avalanche', 'wheel', 'counter', 'flower', 'eruption'], ['lances', 'cascade', 'wall', 'spiral', 'counter', 'avalanche', 'flower']],
});
Object.assign(PAT_DUR, { superlaser: 5.2 });
Object.assign(BOSS_FN, {
  superlaser(e, c, G, s, L) {
    if (c.n) return; c.n = 1; e.hold = 5;
    const [dx, dy] = G.main;
    addBeam({ owner: e, ox: dx, oy: dy, w: 62, charge: 2.2, fire: 2.4, mode: 'track', sweep: .15, c: '140,255,150', dmg: 34 });
    S.toast = { txt: I18('超级激光充能 · 远离绿色光束', 'Superlaser charging · stay out of the green beam'), t: 2 }; sfx.alarm();
  },
});
CINE_PAL[4] = { cloud: '200,190,190', cover: '230,220,220', sky: ['#120608', '#3a1010', '#ff7a4a'], planet: ['#8a8c94', '#3a3c44', '#121318'], atm: '255,120,90', lights: '255,90,70',
  blast: ['255,255,255', '255,240,200', '255,200,120', '255,120,80'], rib: '#2a2c34', ribL: '255,110,90', tun: '#070608', fire: '255,140,90' };

