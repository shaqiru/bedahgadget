#!/usr/bin/env node
// Validasi artefak build sebelum diunggah ke hosting. Situs ini statis, jadi dist/ hanya boleh
// berisi file statis. File yang bisa dieksekusi server (PHP, .user.ini) atau .htaccess tambahan
// di subfolder bisa mengubah perilaku server dan ditolak.
//
// Pemakaian: node scripts/validate-dist.mjs [folder-dist]

import { lstatSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const root = process.argv[2] ?? 'dist';
const ALLOWED_EXT = new Set([
  'html', 'css', 'js', 'mjs', 'json', 'xml', 'txt',
  'webp', 'png', 'jpg', 'jpeg', 'avif', 'svg', 'ico',
  'woff2', 'woff', 'ttf', 'webmanifest',
]);
const FORBIDDEN = /\.(php\d?|phtml|phar|pl|py|cgi|sh|asp|aspx|jsp)$|(^|\/)\.user\.ini$/i;

const errors = [];
let count = 0;

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    const rel = relative(root, path).split(sep).join('/');
    const stat = lstatSync(path);
    if (stat.isSymbolicLink()) {
      errors.push(`Symlink tidak diizinkan: ${rel}`);
      continue;
    }
    if (stat.isDirectory()) {
      walk(path);
      continue;
    }
    count++;
    if (FORBIDDEN.test(rel)) {
      errors.push(`File yang bisa dieksekusi server: ${rel}`);
    } else if (entry.name === '.htaccess') {
      if (rel !== '.htaccess') errors.push(`.htaccess hanya boleh di root: ${rel}`);
    } else {
      const ext = entry.name.includes('.') ? entry.name.split('.').pop().toLowerCase() : '';
      if (!ALLOWED_EXT.has(ext)) errors.push(`Tipe file tidak diizinkan: ${rel}`);
    }
  }
}

walk(root);

if (errors.length > 0) {
  console.error(`validate-dist GAGAL (${errors.length} masalah):\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
console.log(`validate-dist lulus (${count} file).`);
