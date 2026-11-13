import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// Penjaga regresi tema: memastikan modifier opasitas token semantik benar-benar
// terkompilasi, dan pasangan hex/kanal RGB di global.css tetap sinkron.
// Dijalankan setelah `astro build` (lihat package.json scripts.build).

const root = process.cwd();
const SEMANTIC = /^--(bg|text|accent|border|g)-/;
// Varian seperti `hover:`, `md:`, `dark:` ikut ditangkap supaya selektor yang
// diperiksa sama persis dengan kelas yang dihasilkan Tailwind.
const OPACITY_CLASS =
  /(?<![\w:-])((?:[a-z0-9-]+:)*(?:bg|text|border|ring|divide)-(?:page|surface|elevated|ink|line)[a-z-]*\/\d+)/g;
// Merah isian dan kuning panas hanya untuk isian; teks merah memakai text-accent-danger.
const RAW_ACCENT_TEXT = /\btext-accent-(?:hot|heat)\b/g;

function walk(dir, allowed) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return walk(path, allowed);
    return allowed.some((ext) => entry.name.endsWith(ext)) ? [path] : [];
  });
}

function collectOpacityClasses() {
  const classes = new Set();
  const files = walk(join(root, 'src'), ['.astro', '.mdx', '.md', '.html', '.js', '.ts']);
  for (const file of files) {
    const text = readFileSync(file, 'utf-8');
    for (const [match] of text.matchAll(OPACITY_CLASS)) classes.add(match);
  }
  return [...classes].sort();
}

function readBuiltCss() {
  const dir = join(root, 'dist', '_astro');
  let files;
  try {
    files = readdirSync(dir).filter((name) => name.endsWith('.css'));
  } catch {
    throw new Error('dist/_astro tidak ditemukan. Jalankan `astro build` lebih dulu.');
  }
  return files.map((name) => readFileSync(join(dir, name), 'utf-8')).join('\n');
}

function checkOpacityClasses() {
  const css = readBuiltCss();
  const missing = [];
  for (const cls of collectOpacityClasses()) {
    const selector = `.${cls.replace(/([:/.])/g, (char) => `\\${char}`)}`;
    if (!css.includes(selector)) missing.push(cls);
  }
  if (missing.length) {
    throw new Error(
      `Kelas opasitas token semantik tidak terkompilasi:\n  ${missing.join('\n  ')}\n` +
        'Pastikan warnanya memakai rgb(var(--*-rgb) / <alpha-value>).',
    );
  }
  return missing.length === 0;
}

function checkRawAccentText() {
  const files = walk(join(root, 'src'), ['.astro', '.mdx', '.md', '.html', '.js', '.ts']);
  const violations = [];
  for (const file of files) {
    const lines = readFileSync(file, 'utf-8').split(/\r?\n/);
    lines.forEach((line, index) => {
      for (const [match] of line.matchAll(RAW_ACCENT_TEXT)) {
        violations.push(`${file.slice(root.length + 1)}:${index + 1} memakai ${match}`);
      }
    });
  }
  if (violations.length) {
    throw new Error(
      `Warna isian dipakai sebagai warna teks (pakai text-accent-danger atau text-ink):\n  ${violations.join('\n  ')}`,
    );
  }
}

function parseBlock(css, pattern) {
  const match = css.match(pattern);
  if (!match) return null;
  const vars = new Map();
  for (const [, name, value] of match[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    vars.set(name, value.trim());
  }
  return vars;
}

function hexToChannels(hex) {
  const raw = hex.replace('#', '');
  if (raw.length !== 6) return null;
  return [0, 2, 4].map((offset) => parseInt(raw.slice(offset, offset + 2), 16)).join(' ');
}

function checkTokenPairs(css) {
  const blocks = [
    [':root', parseBlock(css, /:root\s*\{([\s\S]*?)\}/)],
    ["html[data-theme='dark']", parseBlock(css, /html\[data-theme=['"]dark['"]\]\s*\{([\s\S]*?)\}/)],
  ];
  const problems = [];

  for (const [label, vars] of blocks) {
    if (!vars) {
      problems.push(`Blok ${label} tidak ditemukan di global.css`);
      continue;
    }
    for (const [name, value] of vars) {
      if (!SEMANTIC.test(name)) continue;
      if (name.endsWith('-rgb')) {
        if (!vars.has(name.slice(0, -4))) problems.push(`${label}: ${name} tidak punya pasangan hex`);
        continue;
      }
      const channels = hexToChannels(value);
      if (!channels) continue;
      const rgb = vars.get(`${name}-rgb`);
      if (!rgb) {
        problems.push(`${label}: ${name} tidak punya ${name}-rgb`);
      } else if (rgb !== channels) {
        problems.push(`${label}: ${name}-rgb ${rgb} tidak sama dengan ${name} ${value} (${channels})`);
      }
    }
  }

  if (problems.length) {
    throw new Error(`Pasangan token hex/RGB tidak sinkron:\n  ${problems.join('\n  ')}`);
  }
}

// Kombinasi grafis: token grafis di atas tema terang dan gelap.
function graphicCombos(css) {
  const light = parseBlock(css, /:root\s*\{([\s\S]*?)\}/);
  const dark = new Map([...light, ...parseBlock(css, /html\[data-theme=['"]dark['"]\]\s*\{([\s\S]*?)\}/)]);
  return [
    ['terang', light],
    ['gelap', dark],
  ];
}

// Bentuk grafis harus terbaca: --g-1 dan --g-2 minimal 3:1 terhadap latar halaman dan pelat tile.
function checkGraphicContrast(css) {
  const problems = [];
  for (const [label, vars] of graphicCombos(css)) {
    for (const shape of ['--g-1', '--g-2']) {
      for (const background of ['--bg-page', '--bg-surface', '--g-4']) {
        const ratio = contrastRatio(vars.get(shape), vars.get(background));
        if (ratio < 3) problems.push(`${label}: ${shape} pada ${background} hanya ${ratio.toFixed(2)}:1`);
      }
    }
  }
  if (problems.length) {
    throw new Error(`Kontras bentuk grafis di bawah 3:1:\n  ${problems.join('\n  ')}`);
  }
}

function relativeLuminance(hex) {
  const channels = [0, 2, 4].map((offset) => {
    const value = parseInt(hex.replace('#', '').slice(offset, offset + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(foreground, background) {
  const [lighter, darker] = [relativeLuminance(foreground), relativeLuminance(background)].sort(
    (a, b) => b - a,
  );
  return (lighter + 0.05) / (darker + 0.05);
}

function checkAccentContrast(css) {
  const blocks = [
    ['terang', parseBlock(css, /:root\s*\{([\s\S]*?)\}/)],
    ['gelap', parseBlock(css, /html\[data-theme=['"]dark['"]\]\s*\{([\s\S]*?)\}/)],
  ];
  const accents = [
    '--text-primary',
    '--text-secondary',
    '--text-muted',
    '--accent-link',
    '--accent-positive',
    '--accent-danger',
  ];
  const backgrounds = ['--bg-page', '--bg-surface', '--bg-elevated'];
  const problems = [];

  for (const [label, vars] of blocks) {
    if (!vars) continue;
    for (const accent of accents) {
      const foreground = vars.get(accent);
      if (!foreground) {
        problems.push(`${label}: ${accent} tidak ditemukan`);
        continue;
      }
      for (const background of backgrounds) {
        const surface = vars.get(background);
        if (!surface) {
          problems.push(`${label}: ${background} tidak ditemukan`);
          continue;
        }
        const ratio = contrastRatio(foreground, surface);
        if (ratio < 4.5) {
          problems.push(`${label}: ${accent} pada ${background} hanya ${ratio.toFixed(2)}:1`);
        }
      }
    }
  }

  if (problems.length) {
    throw new Error(`Kontras teks di bawah 4.5:1:\n  ${problems.join('\n  ')}`);
  }
}

function checkActionContrast(css) {
  const blocks = [
    ['terang', parseBlock(css, /:root\s*\{([\s\S]*?)\}/)],
    ['gelap', parseBlock(css, /html\[data-theme=['"]dark['"]\]\s*\{([\s\S]*?)\}/)],
  ];
  const pairs = [
    ['--text-on-action', '--bg-action'],
    ['--text-on-action-hover', '--bg-action-hover'],
    ['--text-on-heat', '--accent-heat'],
  ];
  const problems = [];

  for (const [label, vars] of blocks) {
    if (!vars) continue;
    for (const [foregroundName, backgroundName] of pairs) {
      const foreground = vars.get(foregroundName);
      const background = vars.get(backgroundName);
      if (!foreground || !background) {
        problems.push(`${label}: ${foregroundName}/${backgroundName} tidak ditemukan`);
        continue;
      }
      const ratio = contrastRatio(foreground, background);
      if (ratio < 4.5) {
        problems.push(`${label}: ${foregroundName} pada ${backgroundName} hanya ${ratio.toFixed(2)}:1`);
      }
    }
  }

  if (problems.length) {
    throw new Error(`Kontras tombol aksi di bawah 4.5:1:\n  ${problems.join('\n  ')}`);
  }
}

// Kasus terburuk teks di atas glass: fill glass dicampur dengan isian paling mencolok di bawahnya.
function checkGlassContrast(css) {
  const blocks = graphicCombos(css);
  const problems = [];
  for (const [label, vars] of blocks) {
    const fill = vars?.get('--glass-fill')?.match(/rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\)/);
    if (!fill) {
      problems.push(`${label}: --glass-fill tidak ditemukan atau formatnya bukan rgb(r g b / a)`);
      continue;
    }
    const [, r, g, b, alpha] = fill.map(Number);
    const ink = vars.get('--text-primary');
    for (const under of ['--accent-hot', '--accent-heat', '--text-primary', '--bg-page', '--g-1', '--g-2']) {
      const below = vars.get(under).replace('#', '');
      const mixed =
        '#' +
        [r, g, b]
          .map((channel, i) => {
            const base = parseInt(below.slice(i * 2, i * 2 + 2), 16);
            return Math.round(channel * alpha + base * (1 - alpha)).toString(16).padStart(2, '0');
          })
          .join('');
      const ratio = contrastRatio(ink, mixed);
      if (ratio < 4.5) problems.push(`${label}: teks di glass di atas ${under} hanya ${ratio.toFixed(2)}:1`);
    }
  }
  if (problems.length) {
    throw new Error(`Kontras teks di atas glass di bawah 4.5:1:\n  ${problems.join('\n  ')}`);
  }
}

try {
  const total = collectOpacityClasses().length;
  checkOpacityClasses();
  const source = readFileSync(join(root, 'src', 'styles', 'global.css'), 'utf-8');
  checkTokenPairs(source);
  checkAccentContrast(source);
  checkActionContrast(source);
  checkGlassContrast(source);
  checkGraphicContrast(source);
  checkRawAccentText();
  console.log(`check:css lulus (${total} kelas opasitas, pasangan token sinkron, kontras teks, tombol aksi, dan glass >= 4.5:1, bentuk grafis >= 3:1, tanpa warna isian untuk teks).`);
} catch (error) {
  console.error(`check:css gagal: ${error.message}`);
  process.exit(1);
}
