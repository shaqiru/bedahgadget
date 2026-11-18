#!/usr/bin/env node
// Pemeriksa keamanan isi artikel. Artikel MDX diperlakukan sebagai kode: import, ekspresi,
// dan elemen JSX dievaluasi saat build, dan HTML-nya terbit ke browser pembaca. Pemeriksa ini
// mem-parse setiap artikel dengan parser MDX (bukan regex) dan hanya mengizinkan konstruksi
// yang tercantum di scripts/content-allowlist.json.
//
// Pemakaian: node scripts/check-content-security.mjs [file.mdx ...]
// Tanpa argumen, semua file di src/content/articles diperiksa.

import { createProcessor } from '@mdx-js/mdx';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const ARTICLES_DIR = join(ROOT, 'src/content/articles');
const allow = JSON.parse(readFileSync(join(ROOT, 'scripts/content-allowlist.json'), 'utf8'));
const defaultFrom = new RegExp(allow.imports.defaultFrom);
const frontmatterImage = new RegExp(allow.frontmatterImage);
const UNSAFE_URL = /^\s*(javascript|vbscript|data):/i;

const files =
  process.argv.length > 2
    ? process.argv.slice(2)
    : readdirSync(ARTICLES_DIR)
        .filter((name) => /\.mdx?$/.test(name))
        .map((name) => join(ARTICLES_DIR, name));

const processor = createProcessor();
const errors = [];

function report(file, node, message) {
  const line = node?.position?.start?.line ?? node?.loc?.start?.line ?? 1;
  errors.push({ file: relative(ROOT, file), line, message });
}

// Frontmatter diganti baris kosong supaya nomor baris di isi tetap sama dengan file asli.
function splitFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) return { frontmatter: '', body: source };
  const lines = match[0].split('\n').length - 1;
  return { frontmatter: match[1], body: '\n'.repeat(lines) + source.slice(match[0].length) };
}

function checkFrontmatter(file, frontmatter) {
  const image = frontmatter.match(/^image:\s*["']?([^"'\n]+)["']?\s*$/m);
  if (image && !frontmatterImage.test(image[1].trim())) {
    report(file, null, `Gambar frontmatter harus raster (png/jpg/webp) di src/assets/: ${image[1].trim()}`);
  }
  if (/<\s*script|javascript:/i.test(frontmatter)) {
    report(file, null, 'Frontmatter memuat <script> atau javascript:');
  }
}

function checkEsm(file, node, imported) {
  for (const statement of node.data?.estree?.body ?? []) {
    if (statement.type !== 'ImportDeclaration') {
      report(file, node, `Hanya import yang diizinkan di artikel, ditemukan ${statement.type}`);
      continue;
    }
    const source = statement.source.value;
    const named = allow.imports.named[source];
    if (named) {
      for (const spec of statement.specifiers) {
        if (spec.type !== 'ImportSpecifier' || !named.includes(spec.imported.name)) {
          report(file, node, `Import dari "${source}" hanya boleh: ${named.join(', ')}`);
        }
      }
    } else if (defaultFrom.test(source)) {
      if (statement.specifiers.length !== 1 || statement.specifiers[0].type !== 'ImportDefaultSpecifier') {
        report(file, node, `Gambar "${source}" harus di-import sebagai default import tunggal`);
      } else {
        imported.add(statement.specifiers[0].local.name);
      }
    } else {
      report(file, node, `Import tidak diizinkan: "${source}"`);
    }
  }
}

function checkExpressionValue(file, node, name, expression, imported) {
  const rule = allow.expressionAttributes[name];
  if (rule === 'importedIdentifier' && expression?.type === 'Identifier' && imported.has(expression.name)) return;
  if (
    rule === 'numberArray' &&
    expression?.type === 'ArrayExpression' &&
    expression.elements.every((el) => el?.type === 'Literal' && typeof el.value === 'number')
  ) {
    return;
  }
  report(file, node, `Ekspresi tidak diizinkan pada atribut "${name}"`);
}

function checkJsx(file, node, imported) {
  const name = node.name;
  const allowedAttrs = allow.components[name] ?? allow.elements[name];
  if (!name || !allowedAttrs) {
    report(file, node, `Elemen atau komponen tidak diizinkan: <${name ?? 'fragment'}>`);
    return;
  }
  for (const attr of node.attributes) {
    if (attr.type !== 'mdxJsxAttribute') {
      report(file, node, `Spread atribut tidak diizinkan pada <${name}>`);
      continue;
    }
    if (/^on/i.test(attr.name) || !allowedAttrs.includes(attr.name)) {
      report(file, node, `Atribut tidak diizinkan pada <${name}>: ${attr.name}`);
      continue;
    }
    if (attr.value && typeof attr.value === 'object') {
      const expression = attr.value.data?.estree?.body?.[0]?.expression;
      checkExpressionValue(file, node, attr.name, expression, imported);
    } else if (typeof attr.value === 'string' && UNSAFE_URL.test(attr.value)) {
      report(file, node, `Nilai atribut berbahaya pada <${name}>: ${attr.name}`);
    }
  }
}

function walk(file, node, imported) {
  switch (node.type) {
    case 'mdxjsEsm':
      checkEsm(file, node, imported);
      break;
    case 'mdxJsxFlowElement':
    case 'mdxJsxTextElement':
      checkJsx(file, node, imported);
      break;
    case 'mdxFlowExpression':
    case 'mdxTextExpression':
      report(file, node, 'Ekspresi JavaScript {…} tidak diizinkan di isi artikel');
      break;
    case 'html':
      report(file, node, 'HTML mentah tidak diizinkan di isi artikel');
      break;
    case 'link':
    case 'image':
    case 'definition':
      if (UNSAFE_URL.test(node.url ?? '')) report(file, node, `URL berbahaya: ${node.url}`);
      break;
    default:
      break;
  }
  for (const child of node.children ?? []) walk(file, child, imported);
}

for (const file of files) {
  const source = readFileSync(file, 'utf8');
  const { frontmatter, body } = splitFrontmatter(source);
  checkFrontmatter(file, frontmatter);
  let tree;
  try {
    tree = processor.parse(body);
  } catch (error) {
    report(file, { position: error.place ? { start: error.place } : undefined }, `MDX tidak bisa di-parse: ${error.reason ?? error.message}`);
    continue;
  }
  // Import harus dikenali sebelum elemen yang memakainya diperiksa.
  const imported = new Set();
  for (const node of tree.children) if (node.type === 'mdxjsEsm') checkEsm(file, node, imported);
  for (const node of tree.children) if (node.type !== 'mdxjsEsm') walk(file, node, imported);
}

if (errors.length > 0) {
  for (const { file, line, message } of errors) {
    if (process.env.GITHUB_ACTIONS) console.log(`::error file=${file},line=${line}::${message}`);
    console.error(`${file}:${line}  ${message}`);
  }
  console.error(`\ncheck-content-security GAGAL (${errors.length} masalah).`);
  process.exit(1);
}
console.log(`check-content-security lulus (${files.length} artikel).`);
