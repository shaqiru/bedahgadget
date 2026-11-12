#!/usr/bin/env node
// Kebijakan workflow GitHub Actions:
//   1. Setiap Action pihak ketiga dirujuk dengan SHA commit penuh (40 karakter), bukan tag/branch.
//   2. Tidak ada trigger pull_request_target (menjalankan kode PR dengan akses secret).
//   3. Job yang memakai environment production tidak boleh checkout atau menjalankan kode repo.
//
// Pemakaian: node scripts/check-workflows.mjs [folder]

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2] ?? '.github/workflows';
const errors = [];

if (existsSync(dir)) {
  for (const name of readdirSync(dir).filter((f) => /\.ya?ml$/.test(f))) {
    const path = join(dir, name);
    const lines = readFileSync(path, 'utf8').split('\n');

    lines.forEach((line, index) => {
      const code = line.replace(/#.*$/, '');
      const uses = code.match(/^\s*-?\s*uses:\s*["']?([^"'\s]+)/);
      if (uses && !uses[1].startsWith('./') && !/@[0-9a-f]{40}$/.test(uses[1])) {
        errors.push(`${path}:${index + 1}  Action harus di-pin ke SHA commit penuh: ${uses[1]}`);
      }
      if (/\bpull_request_target\b/.test(code)) {
        errors.push(`${path}:${index + 1}  Trigger pull_request_target dilarang`);
      }
    });

    // Cari job yang memakai environment production, lalu periksa langkah di dalamnya.
    let jobIndent = null;
    let jobName = null;
    let jobLines = [];
    const flush = () => {
      if (!jobName) return;
      const body = jobLines.map((l) => l.replace(/#.*$/, '')).join('\n');
      if (/^\s*environment:\s*(name:\s*)?["']?production\b/m.test(body) || /^\s*name:\s*["']?production\b/m.test(body.split('steps:')[0])) {
        if (/actions\/checkout@/.test(body)) {
          errors.push(`${path}  Job "${jobName}" memakai environment production dan tidak boleh checkout repo`);
        }
        if (/\b(npm|npx|node|pnpm|yarn)\s/.test(body)) {
          errors.push(`${path}  Job "${jobName}" memakai environment production dan tidak boleh menjalankan kode repo (npm/node)`);
        }
      }
    };
    let inJobs = false;
    for (const line of lines) {
      if (/^jobs:\s*$/.test(line)) {
        inJobs = true;
        continue;
      }
      if (!inJobs) continue;
      if (/^\S/.test(line)) {
        flush();
        inJobs = false;
        jobName = null;
        continue;
      }
      const job = line.match(/^(\s{2})([A-Za-z0-9_-]+):\s*$/);
      if (job && (jobIndent === null || job[1].length === jobIndent)) {
        flush();
        jobIndent = job[1].length;
        jobName = job[2];
        jobLines = [];
        continue;
      }
      jobLines.push(line);
    }
    flush();
  }
}

if (errors.length > 0) {
  console.error(`check-workflows GAGAL (${errors.length} masalah):\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
console.log('check-workflows lulus.');
