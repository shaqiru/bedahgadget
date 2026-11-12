import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Penjaga glyph brand (src/assets/glyphs): ukuran, warna hanya lewat kelas token,
// tanpa raster atau script, dan tidak ada glyph di section hero beranda.
// Dijalankan setelah `astro build` (lihat package.json scripts.build).

const root = process.cwd();
const dir = join(root, 'src', 'assets', 'glyphs');
const MAX_FILE = 1024;
const MAX_TOTAL = 12288;

const FORBIDDEN = [
  [/<image\b/i, 'elemen <image>'],
  [/<foreignObject\b/i, 'elemen <foreignObject>'],
  [/<script\b/i, 'elemen <script>'],
  [/\sstyle=/i, 'atribut style'],
  [/\s(?:xlink:)?href=/i, 'atribut href'],
  [/#[0-9a-f]{3,8}\b/i, 'warna hex'],
  [/\b(?:rgba?|hsla?)\(/i, 'fungsi warna'],
  [/\s(?:fill|stroke)="(?!none")[^"]*"/i, 'atribut fill/stroke selain "none" (pakai kelas g1-g4/gl)'],
];

function checkFiles() {
  const files = readdirSync(dir).filter((name) => name.endsWith('.svg'));
  if (!files.length) throw new Error('Tidak ada glyph di src/assets/glyphs.');
  const problems = [];
  let total = 0;
  for (const name of files) {
    const path = join(dir, name);
    const size = statSync(path).size;
    total += size;
    const text = readFileSync(path, 'utf-8');
    if (size > MAX_FILE) problems.push(`${name}: ${size} B, batas ${MAX_FILE} B`);
    if (!text.includes('viewBox="0 0 64 64"')) problems.push(`${name}: viewBox harus "0 0 64 64"`);
    if (!/<!-- glyph: [^>]+-->/.test(text)) problems.push(`${name}: tidak ada komentar "glyph: <komponen>"`);
    for (const [pattern, label] of FORBIDDEN) {
      if (pattern.test(text)) problems.push(`${name}: memuat ${label}`);
    }
  }
  if (total > MAX_TOTAL) problems.push(`total ${total} B, batas ${MAX_TOTAL} B`);
  if (problems.length) throw new Error(`Glyph tidak memenuhi aturan:\n  ${problems.join('\n  ')}`);
  return { count: files.length, total };
}

function checkHero() {
  let html;
  try {
    html = readFileSync(join(root, 'dist', 'index.html'), 'utf-8');
  } catch {
    throw new Error('dist/index.html tidak ditemukan. Jalankan `astro build` lebih dulu.');
  }
  const hero = html.match(/<section[^>]*\bid="hero"[^>]*>([\s\S]*?)<\/section>/);
  if (!hero) throw new Error('Section hero (id="hero") tidak ditemukan di dist/index.html.');
  if (/class="[^"]*\bglyph\b/.test(hero[1])) {
    throw new Error('Glyph brand ditemukan di section hero; viewport pertama hanya untuk figur hero.');
  }
}

try {
  const { count, total } = checkFiles();
  checkHero();
  console.log(`check:glyphs lulus (${count} glyph, ${total} B dari batas ${MAX_TOTAL} B, hero bebas glyph).`);
} catch (error) {
  console.error(`check:glyphs gagal: ${error.message}`);
  process.exit(1);
}
