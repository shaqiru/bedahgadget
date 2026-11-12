// Figur isometrik home: laptop dibalik di atas matras ESD dengan panel bawah dilepas.
// Satuan dunia = milimeter. Menulis src/generated/laptop-figure.svg (deterministik).
// Jalankan: npm run figure
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as k from './kit/iso-kit.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, '..', '..', 'src', 'generated', 'laptop-figure.svg');

const WIDTH = 760;
const HEIGHT = 490;

// ---------- Rencana dunia ----------
const MAT = { x: -205, y: -150, w: 410, d: 300, r: 6 };
const MAT_H = 2;
const LAPTOP = { x: -170, y: -115, w: 340, d: 230, r: 9 };
const LID_H = 6; // tutup layar (tertutup, di bawah)
const DECK = 8; // lantai bagian dalam (sisi bawah dek keyboard)
const WALL_TOP = 20;
const WALL = 3;

const BOARD = { x: -66, y: -98, w: 132, d: 126, r: 3 };
const BOARD_TOP = DECK + 1.6;

// Substrat BGA lebih lebar dari pelat tembaga, jadi tepinya tetap terlihat.
const SOC = { x: -20, y: -70, w: 40, d: 40, r: 1.2 };
const PLATE = { x: -12, y: -62, w: 24, d: 24, r: 2 };
const PLATE_Z = BOARD_TOP + 2;
const PLATE_TOP = PLATE_Z + 2;

const FANS = [-95, 95].map((x) => ({ x, y: -55, r: 24 }));
const FAN_TOP = DECK + 10;
const FINS = [-1, 1].map((s) => ({ x: s < 0 ? -118 : 72, y: -112, w: 46, d: 14, r: 1 }));

const PIPE_RUNS = [
  { x: -72, y: -98, w: 67, d: 6, r: 2.9 },
  { x: 5, y: -98, w: 67, d: 6, r: 2.9 },
];
const PIPE_RISERS = [
  { x: -11, y: -98, w: 6, d: 37, r: 2.9 },
  { x: 5, y: -98, w: 6, d: 37, r: 2.9 },
];

const VRM_Y = -22;
const CHOKES = [-30, -15, 0, 15, 30];
const RAM = { x: -62, y: -2, w: 66, d: 28, r: 1.2 };
const SSD = { x: 12, y: 0, w: 42, d: 18, r: 1 };
const J2 = { x: 28, y: 22, w: 18, d: 5, r: 0.6 };
const BATTERY = { x: -120, y: 40, w: 240, d: 66, r: 4 };
const BATTERY_TOP = DECK + 8;
const BAT_PLUG = { x: 30, y: 34, w: 14, d: 6, r: 0.8 };

const HINGES = [-1, 1].map((s) => ({ s, bracket: { x: s < 0 ? -164 : 128, y: -111, w: 36, d: 24, r: 2 } }));
const SPEAKERS = [-1, 1].map((s) => ({ x: s < 0 ? -160 : 130, y: 52, w: 30, d: 48, r: 5 }));
const DISH = [178, 128];

const P = k.fitProjection(
  [...k.boxCorners(MAT, -MAT_H, 0), ...k.boxCorners(LAPTOP, 0, WALL_TOP), [0, -125, 16]],
  WIDTH,
  HEIGHT,
  { pad: 26, azimuth: 36, elevation: 34 },
);

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (pts, style) => k.dotsSvg(pts, style);
const depth = (plan, z = 0) => k.depthOf([plan.x + plan.w / 2, plan.y + plan.d / 2, z], P);
const round = (s) => s.replace(/-?\d+\.\d{3,}/g, (n) => String(Math.round(Number(n) * 100) / 100));

// Screw boss: tiang plastik dengan lubang dan kepala sekrup.
const boss = (x, y, z, h = 3) =>
  S(k.cylinder(x, y, 2.6, z, h, P, 18), { tone: 'mid' }) +
  L(k.ring(x, y, 1.3, z + h, P, 12), { tone: 'lo' }) +
  D([at([x, y, z + h])], { size: 0.45, tone: 'hi' });

// ---------- Matras dan tutup ----------
function mat() {
  const out = [`<path class="iso-halo" d="${k.haloOf(MAT, -MAT_H, MAT_H, P)}"/>`];
  out.push(S(k.slabOf(MAT, -MAT_H, MAT_H, P, 6, 0.6), { tone: 'lo', crease: 'faint' }));
  // Garis grid matras: tepi ke tepi pada kedua sumbu.
  const grid = [];
  for (let x = MAT.x + 25; x < MAT.x + MAT.w - 10; x += 25) grid.push(k.lineOnTop([x, MAT.y], [x, MAT.y + MAT.d], 0, P));
  for (let y = MAT.y + 25; y < MAT.y + MAT.d - 10; y += 25) grid.push(k.lineOnTop([MAT.x, y], [MAT.x + MAT.w, y], 0, P));
  out.push(L(grid.join(''), { tone: 'faint' }));
  // Penggaris di tepi depan.
  const strip = { x: MAT.x + 12, y: MAT.y + MAT.d - 12, w: 180, d: 7, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.5, P, 3), { tone: 'mid', crease: 'none' }));
  const ticks = k.topTicks(strip.x + 3, strip.x + strip.w - 3, 5, 5, strip.y + 0.6, 0.5, [2, 4], P);
  out.push(L(ticks.minor, { tone: 'lo' }), L(ticks.major, { tone: 'mid' }));
  out.push(D([at([strip.x + 1.5, strip.y + 3.5, 0.5]), at([strip.x + strip.w - 1.5, strip.y + 3.5, 0.5])], { size: 0.4 }));
  // Titik ground ESD di pojok kiri depan.
  const snap = [MAT.x + 14, MAT.y + MAT.d - 26];
  out.push(S(k.cylinder(snap[0], snap[1], 4, 0, 2, P, 20), { tone: 'mid' }));
  out.push(L(k.ring(snap[0], snap[1], 1.6, 2, P, 12), { tone: 'lo' }));
  return out.join('');
}

function lid() {
  const out = [`<path class="iso-halo" d="${k.haloOf(LAPTOP, 0, LID_H, P)}" style="filter:blur(6px)"/>`];
  out.push(S(k.slabOf(LAPTOP, 0, LID_H, P, 8, 0.8), { tone: 'mid' }));
  out.push(L(k.sideSeam(LAPTOP, LID_H - 1.6, P, 8), { tone: 'faint' }));
  return out.join('');
}

// Engsel: barrel di luar dinding belakang (digambar sebelum dinding).
function hingeBarrels() {
  return HINGES.map(({ bracket }) => {
    const barrel = { x: bracket.x + 4, y: LAPTOP.y - 9, w: bracket.w - 8, d: 10, r: 4.9 };
    return `<g data-part="hinge">${S(k.slabOf(barrel, 2, 14, P, 6, 0.5), { tone: 'hi', crease: 'lo' })}${L(
      [6, 10].map((z) => k.sideSeam(barrel, z, P, 6)).join(''),
      { tone: 'lo' },
    )}</g>`;
  }).join('');
}

function deck() {
  return S(k.slabOf(k.insetPlan(LAPTOP, 0.5), LID_H, DECK - LID_H, P, 8), { tone: 'mid', crease: 'lo' });
}

const wallPlans = {
  back: { x: LAPTOP.x, y: LAPTOP.y, w: LAPTOP.w, d: WALL, r: 1 },
  left: { x: LAPTOP.x, y: LAPTOP.y, w: WALL, d: LAPTOP.d, r: 1 },
  front: { x: LAPTOP.x, y: LAPTOP.y + LAPTOP.d - WALL, w: LAPTOP.w, d: WALL, r: 1 },
  right: { x: LAPTOP.x + LAPTOP.w - WALL, y: LAPTOP.y, w: WALL, d: LAPTOP.d, r: 1 },
};
const wall = (plan) => S(k.slabOf(plan, DECK, WALL_TOP - DECK, P, 3, 0.4), { tone: 'mid' });

// ---------- Isi ----------
function board() {
  const out = [S(k.slabOf(BOARD, DECK, 1.6, P, 4), { tone: 'hi', crease: 'lo' })];
  out.push(L(k.planOutline(k.insetPlan(BOARD, 2.5), BOARD_TOP, P, 4), { tone: 'faint' }));
  // Lubang mounting di pojok board dengan ring tembaga.
  const holes = k.corners(BOARD, 5);
  out.push(L(holes.map(([x, y]) => k.ring(x, y, 2, BOARD_TOP, P, 14)).join(''), { tone: 'lo' }));
  out.push(D(holes.map(([x, y]) => at([x, y, BOARD_TOP])), { size: 0.5, tone: 'hi' }));
  // Barisan via dan kapasitor kecil di sisi kiri board.
  out.push(D(k.dotGrid(BOARD.x + 6, BOARD.y + 40, 3, 8, 4, BOARD_TOP, P), { size: 0.35, tone: 'lo' }));
  // Chip kecil: EC dan BIOS di kanan belakang board.
  for (const c of [
    { x: 30, y: -90, w: 12, d: 12, r: 0.6 },
    { x: -48, y: -86, w: 8, d: 6, r: 0.4 },
  ]) {
    out.push(S(k.slabOf(c, BOARD_TOP, 1.2, P, 2), { tone: 'mid' }));
    out.push(D([at([c.x + 1.4, c.y + 1.4, BOARD_TOP + 1.2])], { size: 0.35, tone: 'lo' }));
  }
  return `<g data-part="board">${out.join('')}</g>`;
}

// Board IO kiri dan kanan dengan port di dinding samping, plus kabel flex ke board utama.
const IO_BOARDS = [
  { plan: { x: -160, y: -28, w: 46, d: 56, r: 2 }, flex: { x: -114, y: -6, w: 48, d: 10, r: 0.5 }, ports: [
    { kind: 'usb-a', plan: { x: -167, y: -20, w: 16, d: 14, r: 1 }, h: 6 },
    { kind: 'usb-c', plan: { x: -167, y: 1, w: 10, d: 9, r: 3 }, h: 3.5 },
    { kind: 'jack', at: [-152, 19], r: 3.4, h: 6 },
  ] },
  { plan: { x: 114, y: -26, w: 46, d: 52, r: 2 }, flex: { x: 66, y: -4, w: 48, d: 10, r: 0.5 }, ports: [
    { kind: 'hdmi', plan: { x: 151, y: -20, w: 16, d: 17, r: 1 }, h: 6 },
    { kind: 'usb-c', plan: { x: 157, y: 4, w: 10, d: 9, r: 3 }, h: 3.5 },
    { kind: 'jack', at: [150, 18], r: 3.6, h: 7 },
  ] },
];

function ioBoard({ plan, flex, ports }) {
  const out = [S(k.slabOf(plan, DECK, 1.6, P, 3), { tone: 'mid', crease: 'lo' })];
  out.push(L(k.planOutline(k.insetPlan(plan, 2), DECK + 1.6, P, 3), { tone: 'faint' }));
  const holes = k.corners(plan, 4);
  out.push(D(holes.map(([x, y]) => at([x, y, DECK + 1.6])), { size: 0.45, tone: 'hi' }));
  for (const port of ports) {
    if (port.kind === 'jack') {
      out.push(S(k.cylinder(port.at[0], port.at[1], port.r, DECK + 1.6, port.h, P, 20), { tone: 'mid' }));
      out.push(L(k.ring(port.at[0], port.at[1], port.r * 0.45, DECK + 1.6 + port.h, P, 14), { tone: 'lo' }));
    } else {
      out.push(S(k.slabOf(port.plan, DECK + 1.6, port.h, P, 2, 0.4), { tone: 'mid' }));
      out.push(L(k.planOutline(k.insetPlan(port.plan, 1.6), DECK + 1.6 + port.h, P, 2), { tone: 'lo' }));
    }
  }
  out.push(S(k.slabOf(flex, BOARD_TOP, 0.4, P, 2), { tone: 'mid', crease: 'none' }));
  out.push(L(k.planOutline(k.insetPlan(flex, 1.5), BOARD_TOP + 0.4, P, 2), { tone: 'faint' }));
  return out.join('');
}

// Kartu WiFi M.2 2230; kabel antena sudah dicabut dari konektornya (pose bongkar).
const WIFI = { x: 40, y: -60, w: 22, d: 30, r: 1 };
function wifi() {
  const out = [S(k.slabOf(WIFI, BOARD_TOP + 1, 0.8, P, 2), { tone: 'mid' })];
  out.push(S(k.slabOf(k.insetPlan({ ...WIFI, y: WIFI.y + 8, d: 20 }, 2), BOARD_TOP + 1.8, 1.2, P, 2, 0.3), { tone: 'mid' }));
  out.push(boss(WIFI.x + WIFI.w / 2, WIFI.y + WIFI.d + 3, BOARD_TOP, 2));
  const plugs = [WIFI.x + 6, WIFI.x + 15];
  out.push(plugs.map((x) => S(k.cylinder(x, WIFI.y + 3.5, 1.8, BOARD_TOP + 1.8, 1.2, P, 14), { tone: 'hi' })).join(''));
  return out.join('');
}

function soc() {
  const out = [];
  out.push(S(k.slabOf(SOC, BOARD_TOP, 1.2, P, 3), { tone: 'hi', crease: 'lo' }));
  // Kapasitor decoupling di tepi substrat dan die di bawah pelat.
  const top = BOARD_TOP + 1.2;
  const caps = [];
  for (let x = SOC.x + 3; x <= SOC.x + SOC.w - 3; x += 3.4) caps.push([x, SOC.y + SOC.d - 3], [x, SOC.y + 3]);
  out.push(D(caps.map(([x, y]) => at([x, y, top])), { size: 0.35, tone: 'mid' }));
  out.push(S(k.slabOf(k.insetPlan(PLATE, 1), top, 0.8, P, 2), { tone: 'mid', crease: 'none' }));
  return `<g data-part="soc">${out.join('')}</g>`;
}

function heatsink() {
  const out = [];
  // Sirip pendingin di belakang (digambar lebih dulu karena paling jauh).
  for (const fin of FINS) {
    out.push(S(k.slabOf(fin, DECK, 11, P, 2, 0.4), { tone: 'mid' }));
    const ribs = [];
    for (let x = fin.x + 2; x < fin.x + fin.w - 1; x += 2) ribs.push(k.lineOnTop([x, fin.y], [x, fin.y + fin.d], DECK + 11, P));
    out.push(L(ribs.join(''), { tone: 'lo' }));
  }
  // Heatpipe pipih: dari pelat ke belakang, lalu ke kiri dan kanan sampai muka depan sirip.
  for (const run of PIPE_RUNS) out.push(S(k.slabOf(run, PLATE_Z, 2, P, 4), { tone: 'hi', crease: 'lo' }));
  for (const riser of PIPE_RISERS) out.push(S(k.slabOf(riser, PLATE_Z, 2, P, 4), { tone: 'hi', crease: 'lo' }));
  // Pelat tembaga di atas die, dikunci 4 sekrup bernomor urutan pengencangan.
  out.push(S(k.slabOf(PLATE, PLATE_Z, 2, P, 4, 0.5), { tone: 'hi', crease: 'lo' }));
  const screws = k.corners(PLATE, 3.5);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 1.8, PLATE_TOP, P, 14)).join(''), { tone: 'lo' }));
  out.push(D(screws.map(([x, y]) => at([x, y, PLATE_TOP])), { size: 0.5, tone: 'hi' }));
  // Kipas blower: rumah, bukaan, hub, dan bilah.
  for (const fan of FANS) {
    out.push(S(k.cylinder(fan.x, fan.y, fan.r, DECK, FAN_TOP - DECK, P, 56, 0.6), { tone: 'mid' }));
    out.push(L(k.ring(fan.x, fan.y, fan.r - 4, FAN_TOP, P, 48), { tone: 'lo' }));
    // Bilah dari ring bukaan sampai tepi hub (radius 8).
    const blades = k.radialTicks(fan.x, fan.y, fan.r - 4, 31, 1000, FAN_TOP, [fan.r - 12, fan.r - 12], P);
    out.push(L(blades.minor, { tone: 'faint' }));
    out.push(S(k.cylinder(fan.x, fan.y, 8, FAN_TOP, 0.8, P, 28), { tone: 'hi' }));
    out.push(L(k.ring(fan.x, fan.y, 3, FAN_TOP + 0.8, P, 16), { tone: 'lo' }));
    out.push(D([at([fan.x, fan.y, FAN_TOP + 0.8])], { size: 0.5, tone: 'hi' }));
  }
  return `<g data-part="heatsink">${out.join('')}</g>`;
}

function vrm() {
  const out = [];
  // MOSFET low-side dan high-side di depan choke.
  for (const x of CHOKES) {
    out.push(S(k.slabOf({ x: x - 3, y: VRM_Y + 8, w: 6, d: 5, r: 0.4 }, BOARD_TOP, 1.1, P, 2), { tone: 'mid' }));
    out.push(D([at([x - 1.6, VRM_Y + 9.2, BOARD_TOP + 1.1])], { size: 0.3, tone: 'lo' }));
  }
  // Choke ferit.
  for (const x of CHOKES) {
    const c = { x: x - 5, y: VRM_Y - 5, w: 10, d: 10, r: 1 };
    out.push(S(k.slabOf(c, BOARD_TOP, 5.5, P, 3, 0.4), { tone: 'hi', crease: 'lo' }));
    out.push(k.faceTextSvg(k.topMatrix([x - 3, VRM_Y + 1], BOARD_TOP + 5.5, P, 'x'), 'R22', { size: 2.2, tone: 'lo' }));
  }
  // IC PWM di ujung kiri barisan.
  const pwm = { x: -50, y: VRM_Y - 3, w: 8, d: 8, r: 0.4 };
  out.push(S(k.slabOf(pwm, BOARD_TOP, 1, P, 2), { tone: 'mid' }));
  out.push(D([at([pwm.x + 1.2, pwm.y + 1.2, BOARD_TOP + 1])], { size: 0.3, tone: 'lo' }));
  return `<g data-part="vrm">${out.join('')}</g>`;
}

function ram() {
  const out = [];
  const slot = { x: RAM.x - 1, y: RAM.y - 1, w: RAM.w + 2, d: 4, r: 0.6 };
  out.push(S(k.slabOf(slot, BOARD_TOP, 2.6, P, 2), { tone: 'mid' }));
  out.push(S(k.slabOf(RAM, BOARD_TOP + 1.4, 1, P, 3), { tone: 'hi', crease: 'lo' }));
  const top = BOARD_TOP + 2.4;
  for (let i = 0; i < 4; i++) {
    const chip = { x: RAM.x + 5 + i * 15, y: RAM.y + 7, w: 11, d: 11, r: 0.4 };
    out.push(S(k.slabOf(chip, top, 1, P, 2), { tone: 'mid' }));
  }
  const pins = k.topTicks(RAM.x + 3, RAM.x + RAM.w - 3, 1.5, 1000, RAM.y + RAM.d - 3.2, top, [3, 3], P);
  out.push(L(pins.minor, { tone: 'lo' }));
  // Klip pengunci SO-DIMM di kedua sisi.
  for (const x of [RAM.x - 4, RAM.x + RAM.w + 1]) out.push(S(k.slabOf({ x, y: RAM.y + 8, w: 3, d: 12, r: 0.5 }, BOARD_TOP, 3.4, P, 2), { tone: 'mid' }));
  return `<g data-part="ram">${out.join('')}</g>`;
}

function ssd() {
  const out = [S(k.slabOf(SSD, BOARD_TOP + 1, 1, P, 2), { tone: 'mid' })];
  out.push(S(k.slabOf({ x: SSD.x + 5, y: SSD.y + 4, w: 14, d: 10, r: 0.4 }, BOARD_TOP + 2, 1, P, 2), { tone: 'mid' }));
  out.push(S(k.slabOf({ x: SSD.x + 22, y: SSD.y + 5, w: 10, d: 8, r: 0.4 }, BOARD_TOP + 2, 1, P, 2), { tone: 'mid' }));
  out.push(boss(SSD.x + SSD.w + 3, SSD.y + SSD.d / 2, BOARD_TOP, 2));
  return out.join('');
}

function batteryLink() {
  const out = [];
  // Header J2 di board, colokan di baterai, dan kabel pita di antaranya.
  out.push(S(k.slabOf(J2, BOARD_TOP, 3, P, 2, 0.3), { tone: 'hi', crease: 'lo' }));
  out.push(S(k.slabOf({ x: BAT_PLUG.x + 2, y: J2.y + J2.d, w: BAT_PLUG.w - 4, d: BAT_PLUG.y - J2.y - J2.d, r: 0.3 }, BOARD_TOP + 1, 0.6, P, 2), { tone: 'mid', crease: 'none' }));
  // Jalur +3VALW di permukaan board menuju area VRM.
  out.push(L(k.onTop([[J2.x + J2.w, J2.y + 2.5], [60, J2.y + 2.5], [60, VRM_Y + 6], [36, VRM_Y + 6]], BOARD_TOP, P), { tone: 'mid' }));
  out.push(D([at([J2.x + J2.w, J2.y + 2.5, BOARD_TOP]), at([36, VRM_Y + 6, BOARD_TOP])], { size: 0.55, tone: 'hi' }));
  return `<g data-part="battery">${out.join('')}</g>`;
}

function batteryPlug() {
  return `<g data-part="battery">${S(k.slabOf(BAT_PLUG, BATTERY_TOP - 3, 3, P, 2, 0.3), { tone: 'hi', crease: 'lo' })}</g>`;
}

function battery() {
  const out = [S(k.slabOf(BATTERY, DECK, BATTERY_TOP - DECK, P, 6, 0.6), { tone: 'mid' })];
  // Tiga sel, label, dan tab sekrup.
  out.push(L([1, 2].map((i) => k.lineOnTop([BATTERY.x + (BATTERY.w / 3) * i, BATTERY.y], [BATTERY.x + (BATTERY.w / 3) * i, BATTERY.y + BATTERY.d], BATTERY_TOP, P)).join(''), { tone: 'faint' }));
  const label = { x: BATTERY.x + 96, y: BATTERY.y + 18, w: 48, d: 30, r: 1 };
  out.push(L(k.planOutline(label, BATTERY_TOP, P, 2), { tone: 'lo' }));
  out.push(L([0, 1, 2].map((i) => k.lineOnTop([label.x + 5, label.y + 8 + i * 6], [label.x + 34 - i * 6, label.y + 8 + i * 6], BATTERY_TOP, P)).join(''), { tone: 'lo', free: true }));
  for (const x of [BATTERY.x - 6, BATTERY.x + BATTERY.w]) {
    const tab = { x, y: BATTERY.y + 26, w: 6, d: 14, r: 1 };
    out.push(S(k.slabOf(tab, DECK, 1, P, 2), { tone: 'mid' }));
    out.push(D([at([x + 3, tab.y + 7, DECK + 1])], { size: 0.45, tone: 'hi' }));
  }
  return out.join('');
}

function hingeBracket({ bracket }) {
  const out = [S(k.slabOf(bracket, DECK, 3, P, 3, 0.4), { tone: 'hi', crease: 'lo' })];
  const holes = k.corners(bracket, 5);
  out.push(L(holes.map(([x, y]) => k.ring(x, y, 2, DECK + 3, P, 12)).join(''), { tone: 'lo' }));
  out.push(D(holes.map(([x, y]) => at([x, y, DECK + 3])), { size: 0.5, tone: 'hi' }));
  return `<g data-part="hinge">${out.join('')}</g>`;
}

function speaker(plan) {
  const out = [S(k.slabOf(plan, DECK, 5, P, 6, 0.5), { tone: 'mid' })];
  out.push(D(k.dotGrid(plan.x + 6, plan.y + 7, 4, 8, 5, DECK + 5, P), { size: 0.4, tone: 'lo' }));
  return out.join('');
}

function dish() {
  const [x, y] = DISH;
  const out = [`<path class="iso-halo" d="${k.haloOf({ x: x - 14, y: y - 14, w: 28, d: 28, r: 14 }, 0, 2, P)}" style="filter:blur(4px)"/>`];
  out.push(S(k.cylinder(x, y, 14, 0, 4, P, 48, 0.6), { tone: 'mid' }));
  out.push(L(k.ring(x, y, 11, 4, P, 40), { tone: 'lo' }));
  out.push(D([[x - 4, y - 2], [x + 3, y - 4], [x + 1, y + 3], [x - 2, y + 5]].map(([a, b]) => at([a, b, 4])), { size: 0.8, tone: 'hi' }));
  return out.join('');
}

// ---------- Susunan dengan painter's order ----------
const content = [
  { depth: depth(BOARD), svg: board() },
  ...HINGES.map((h) => ({ depth: depth(h.bracket), svg: hingeBracket(h) })),
  { depth: depth(BATTERY), svg: battery() },
  ...SPEAKERS.map((s) => ({ depth: depth(s), svg: speaker(s) })),
];
content.sort((a, b) => a.depth - b.depth);

// Boss sekrup di tepi dalam tray.
const bosses = [
  [-160, -60], [-160, 20], [160, -60], [160, 20], [-80, 108], [0, 108], [80, 108], [-40, -106], [40, -106],
].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));

const body = [
  mat(),
  lid(),
  hingeBarrels(),
  deck(),
  wall(wallPlans.back),
  wall(wallPlans.left),
  ...content.filter((c) => c.depth <= depth(BOARD)).map((c) => c.svg),
  ...IO_BOARDS.map(ioBoard),
  wifi(),
  soc(),
  heatsink(),
  vrm(),
  ram(),
  ssd(),
  batteryLink(),
  ...content.filter((c) => c.depth > depth(BOARD)).map((c) => c.svg),
  batteryPlug(),
  bosses.map(([x, y]) => boss(x, y, DECK, 4)).join(''),
  wall(wallPlans.front),
  wall(wallPlans.right),
  dish(),
];

// ---------- Lapisan hit (tautan, diisi href dan label oleh AnatomyHero.astro) ----------
function hull(points) {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (const p of pts.reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}
const boxHull = (boxes) => hull(boxes.flatMap(([plan, z0, z1]) => k.boxCorners(plan, z0, z1).map(at)));
const hitPath = (pts) => 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L') + 'Z';
const centre = (pts) => pts.reduce((s, p) => [s[0] + p[0] / pts.length, s[1] + p[1] / pts.length], [0, 0]);

const hits = {
  hinge: HINGES.map(({ bracket }) => boxHull([[bracket, DECK, DECK + 3], [{ ...bracket, y: LAPTOP.y - 9, d: 10 }, 2, 16]])),
  vrm: [boxHull([[{ x: -52, y: VRM_Y - 5, w: 87, d: 18, r: 0 }, BOARD_TOP, BOARD_TOP + 5.5]])],
  heatsink: [
    boxHull([[PLATE, PLATE_Z, PLATE_TOP]]),
    boxHull([[{ x: -72, y: -98, w: 144, d: 6, r: 0 }, PLATE_Z, PLATE_Z + 2]]),
    ...FINS.map((fin) => boxHull([[fin, DECK, DECK + 11]])),
    ...FANS.map((fan) => boxHull([[{ x: fan.x - fan.r, y: fan.y - fan.r, w: fan.r * 2, d: fan.r * 2, r: 0 }, DECK, FAN_TOP + 0.8]])),
  ],
  ram: [boxHull([[{ x: RAM.x - 4, y: RAM.y - 1, w: RAM.w + 8, d: RAM.d + 1, r: 0 }, BOARD_TOP, BOARD_TOP + 3.4]])],
  soc: [boxHull([[{ x: SOC.x, y: PLATE.y + PLATE.d, w: SOC.w, d: SOC.y + SOC.d - PLATE.y - PLATE.d, r: 0 }, BOARD_TOP, BOARD_TOP + 1.2]])],
  battery: [boxHull([[J2, BOARD_TOP, BOARD_TOP + 3], [BAT_PLUG, BATTERY_TOP - 3, BATTERY_TOP]])],
};
const order = ['hinge', 'vrm', 'heatsink', 'ram', 'soc', 'battery'];
const hitLayer = [
  ...order.map((id) => {
    const shapes = hits[id];
    const c = centre(shapes.flat());
    return `<a data-hit="${id}" data-x="${c[0].toFixed(1)}" data-y="${c[1].toFixed(1)}">${shapes
      .map((s) => `<path class="hit-shape" d="${hitPath(s)}"/>`)
      .join('')}</a>`;
  }),
  (() => {
    // Board: hanya tepi PCB yang menjadi area hit, supaya tidak menutupi bagian lain.
    const ring = k.roundedPlan(BOARD, 4).map(([x, y]) => at([x, y, BOARD_TOP]));
    const c = at([BOARD.x + BOARD.w, BOARD.y + BOARD.d / 2, BOARD_TOP]);
    return `<a data-hit="board" data-x="${c[0].toFixed(1)}" data-y="${c[1].toFixed(1)}"><path class="hit-shape hit-edge" d="${hitPath(ring)}"/></a>`;
  })(),
].join('');

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    'Laptop dibalik di atas matras servis dengan panel bawah dilepas. Terlihat engsel di belakang, dua kipas dan sirip pendingin, heatpipe pipih di atas SoC, barisan choke dan MOSFET VRM, slot RAM SO-DIMM, SSD M.2, konektor baterai J2 dengan jalur +3VALW, dan baterai tiga sel di depan.',
  body: [...body, `<g class="anatomy-hits">${hitLayer}</g>`],
});

// role="img" menyembunyikan tautan di dalamnya dari pembaca layar, jadi figur memakai role="group".
writeFileSync(OUT, round(svg).replace('role="img"', 'role="group"') + '\n');
console.log('wrote', OUT, `${(svg.length / 1024).toFixed(1)} KB`);
