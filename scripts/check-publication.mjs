#!/usr/bin/env node
// Pemeriksa publikasi repo publik BedahGadget.id.
// Gagal (exit 1) jika:
//   1. ada file di luar publication-allowlist.txt,
//   2. ada teks internal yang tidak boleh dipublikasikan,
//   3. ada metadata tertanam di gambar (EXIF, chunk teks PNG, EXIF/XMP WebP).
// Tanpa dependensi. Daftar file diambil dari `git ls-files` bila tersedia,
// atau dari isi folder (untuk snapshot yang belum di-git init).
//
// Pemakaian: node scripts/check-publication.mjs [folder]

import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const root = process.argv[2] ?? process.cwd();

// Teks terlarang disimpan dalam base64 supaya file ini sendiri tidak memuatnya.
const FORBIDDEN = [
  'bGluayBlcXVpdHk=', // strategi tautan
  'c2F0ZWxpdA==', // istilah strategi
  'S3JlaWRlcHJpbno=', // nama akun lokal
  'QzpcVXNlcnM=', // path lokal Windows
  'd29yZHByZXNz', // stack situs lain
  'bWVtYmVyIGFyZWE=', // akun hosting
  'cHVibGljX2h0bWw=', // folder server
].map((b64) => Buffer.from(b64, 'base64').toString('utf8').toLowerCase());

const TEXT_EXT = /\.(astro|mdx?|tsx?|jsx?|mjs|cjs|json|ya?ml|txt|css|html|svg|xml)$|(^|\/)(\.gitignore|AGENTS\.md|CLAUDE\.md|README\.md)$/i;
const SELF = ['scripts/check-publication.mjs'];

function listFiles() {
  try {
    const out = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const files = out.split('\0').filter(Boolean);
    if (files.length > 0) return files;
  } catch {
    // bukan repo git: jatuh ke pemindaian folder
  }
  const files = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.astro') continue;
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else files.push(relative(root, path).split(sep).join('/'));
    }
  };
  walk(root);
  return files;
}

function globToRegExp(pattern) {
  let re = '';
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern[i];
    if (c === '*' && pattern[i + 1] === '*') {
      re += '.*';
      i++;
    } else if (c === '*') {
      re += '[^/]*';
    } else {
      re += c.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
    }
  }
  return new RegExp(`^${re}$`);
}

function loadAllowlist() {
  return readFileSync(join(root, 'publication-allowlist.txt'), 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map(globToRegExp);
}

function pngMetadata(buf) {
  const found = [];
  let i = 8;
  while (i + 8 <= buf.length) {
    const len = buf.readUInt32BE(i);
    const type = buf.toString('latin1', i + 4, i + 8);
    if (['tEXt', 'iTXt', 'zTXt', 'eXIf'].includes(type)) found.push(type);
    if (type === 'IEND') break;
    i += 12 + len;
  }
  return found;
}

function jpegMetadata(buf) {
  const found = [];
  let i = 2;
  while (i + 4 <= buf.length && buf[i] === 0xff) {
    const marker = buf[i + 1];
    if (marker === 0xda) break; // awal data gambar
    const len = buf.readUInt16BE(i + 2);
    if (marker === 0xe1) found.push('APP1 (EXIF/XMP)');
    if (marker === 0xfe) found.push('COM');
    i += 2 + len;
  }
  return found;
}

function webpMetadata(buf) {
  const found = [];
  let i = 12;
  while (i + 8 <= buf.length) {
    const type = buf.toString('latin1', i, i + 4);
    const len = buf.readUInt32LE(i + 4);
    if (type === 'EXIF' || type === 'XMP ') found.push(type.trim());
    i += 8 + len + (len % 2);
  }
  return found;
}

const errors = [];
const allow = loadAllowlist();
const files = listFiles();

for (const file of files) {
  if (!allow.some((re) => re.test(file))) {
    errors.push(`Di luar allowlist: ${file}`);
    continue;
  }
  const path = join(root, file);
  if (!statSync(path).isFile()) continue;
  const buf = readFileSync(path);

  if (TEXT_EXT.test(file) && !SELF.includes(file)) {
    const text = buf.toString('utf8').toLowerCase();
    for (const term of FORBIDDEN) {
      if (text.includes(term)) errors.push(`Teks internal di ${file}`);
    }
  }

  let meta = [];
  if (/\.png$/i.test(file)) meta = pngMetadata(buf);
  else if (/\.jpe?g$/i.test(file)) meta = jpegMetadata(buf);
  else if (/\.webp$/i.test(file)) meta = webpMetadata(buf);
  if (meta.length > 0) errors.push(`Metadata gambar di ${file}: ${meta.join(', ')}`);
}

if (errors.length > 0) {
  console.error(`check-publication GAGAL (${errors.length} masalah):\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
console.log(`check-publication lulus (${files.length} file, ${allow.length} pola allowlist).`);
