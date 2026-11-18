#!/usr/bin/env node
// Menulis dist/release.json: SHA commit, waktu build, dan daftar semua file rilis (termasuk
// .htaccess dan release.json sendiri). Job deploy memakai daftar ini untuk memangkas file lama
// dengan aman: file baru dihapus dari server hanya jika tidak ada di rilis ini maupun rilis
// sebelumnya. Semua file di daftar ini memang publik.
//
// Pemakaian: node scripts/write-release-manifest.mjs <folder-dist> <sha>

import { readdirSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const [root = 'dist', sha] = process.argv.slice(2);
if (!sha || !/^[0-9a-f]{40}$/.test(sha)) {
  console.error('Pemakaian: node scripts/write-release-manifest.mjs <folder-dist> <sha 40 karakter>');
  process.exit(1);
}

const files = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path);
    else files.push(relative(root, path).split(sep).join('/'));
  }
};
walk(root);
files.push('release.json');
files.sort();

writeFileSync(
  join(root, 'release.json'),
  JSON.stringify({ sha, builtAt: new Date().toISOString(), files }, null, 2) + '\n',
);
console.log(`release.json ditulis: ${files.length} file, ${sha}`);
