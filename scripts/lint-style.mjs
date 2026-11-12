#!/usr/bin/env node
// Lint gaya bahasa artikel sesuai aturan konten di AGENTS.md. Hanya memberi peringatan
// (anotasi di PR) dan selalu keluar dengan kode 0: editor yang memutuskan apakah perlu diubah.
//
// Pemakaian: node scripts/lint-style.mjs [file.mdx ...]

import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const ARTICLES_DIR = join(ROOT, 'src/content/articles');
const files =
  process.argv.length > 2
    ? process.argv.slice(2)
    : readdirSync(ARTICLES_DIR)
        .filter((name) => /\.mdx?$/.test(name))
        .map((name) => join(ARTICLES_DIR, name));

// Kalimat yang memuat kata larangan ini dianggap sedang menjelaskan larangan, bukan mengklaim.
const NEGATION = /\b(jangan|tidak|tanpa|bukan|belum|dilarang)\b/i;

const RULES = [
  { pattern: /—/, message: 'Em dash (—). Ganti dengan koma, titik, atau tanda kurung.' },
  { pattern: /\bbukan sekadar\b/i, message: 'Pola klise "bukan sekadar".' },
  { pattern: /\bbukan\b[^.\n]{1,60}\bmelainkan\b/i, message: 'Pola "bukan X melainkan Y".' },
  { pattern: /\bmari kita (selami|bahas|kupas)\b/i, message: 'Pembuka klise.' },
  { pattern: /^\s*kesimpulannya\b/i, message: 'Penutup klise "Kesimpulannya".' },
  { pattern: /\b(lab kami|terverifikasi lab|uji bedahgadget)\b/i, message: 'Klaim pengujian yang tidak pernah dilakukan.' },
  { pattern: /\bbergaransi\b|\bSOP\s+(ber)?garansi\b/i, message: 'Klaim garansi belum dikonfirmasi pemilik bisnis.', unlessNegated: true },
  { pattern: /\bRp\.?\s?\d/, message: 'Nominal harga (Rp) dilarang.', unlessNegated: true },
  { pattern: /\breball(ing)?\b|\bBGA rework\b/i, message: 'Klaim reballing atau BGA rework untuk FixNow.id.', unlessNegated: true },
];

let warnings = 0;

function warn(file, line, message) {
  warnings++;
  const rel = relative(ROOT, file);
  if (process.env.GITHUB_ACTIONS) console.log(`::warning file=${rel},line=${line}::${message}`);
  else console.log(`${rel}:${line}  peringatan: ${message}`);
}

for (const file of files) {
  const source = readFileSync(file, 'utf8');
  const lines = source.split('\n');
  let inCode = false;
  lines.forEach((text, index) => {
    if (/^\s*```/.test(text)) inCode = !inCode;
    if (inCode || /^\s*import\s/.test(text)) return;
    for (const rule of RULES) {
      if (!rule.pattern.test(text)) continue;
      if (rule.unlessNegated && NEGATION.test(text)) continue;
      warn(file, index + 1, rule.message);
    }
  });
  if (!/^##\s+Sumber\b/m.test(source)) warn(file, 1, 'Artikel tidak punya bagian "## Sumber".');
}

console.log(`lint-style selesai: ${warnings} peringatan di ${files.length} artikel (tidak menggagalkan build).`);
