import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// Hosting target: Jagoan Hosting (cPanel + LiteSpeed), yang membaca .htaccess.
// Ditulis saat build. CSP hanya memuat hash script inline yang tercantum di
// inline-script-allowlist.json dan benar-benar terbit.

function listHtml(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return listHtml(path);
    return entry.name.endsWith('.html') ? [path] : [];
  });
}

const ALLOWLIST_PATH = fileURLToPath(new URL('./inline-script-allowlist.json', import.meta.url));

// Hash script inline yang muncul di HTML hasil build, dikelompokkan per hash beserta halaman pertamanya.
// Blok JSON-LD dan script eksternal (src=) tidak dieksekusi sebagai inline, jadi tidak dihitung.
function inlineScriptHashes(distDir) {
  const found = new Map();
  for (const file of listHtml(distDir)) {
    const html = readFileSync(file, 'utf-8');
    for (const [, attrs, body] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)) {
      if (/\bsrc\s*=/i.test(attrs) || /application\/ld\+json/i.test(attrs)) continue;
      const hash = `sha256-${createHash('sha256').update(body).digest('base64')}`;
      if (!found.has(hash)) found.set(hash, relative(distDir, file));
    }
  }
  return found;
}

// Hanya hash yang sudah direview di inline-script-allowlist.json yang boleh masuk CSP.
// Script inline lain (misalnya disisipkan lewat artikel) menggagalkan build.
function allowedScriptHashes(distDir, logger) {
  const allowlist = JSON.parse(readFileSync(ALLOWLIST_PATH, 'utf-8')).scripts.map((entry) => entry.hash);
  const found = inlineScriptHashes(distDir);
  const unknown = [...found].filter(([hash]) => !allowlist.includes(hash));
  if (unknown.length > 0) {
    throw new Error(
      'Script inline yang belum direview ditemukan di HTML hasil build:\n' +
        unknown.map(([hash, page]) => `  ${hash} (pertama kali di ${page})`).join('\n') +
        '\nJika script ini memang disengaja, tambahkan hash-nya ke src/lib/inline-script-allowlist.json di PR yang sama.',
    );
  }
  for (const hash of allowlist) {
    if (!found.has(hash)) logger.warn(`Hash di allowlist tidak dipakai di HTML mana pun: ${hash}`);
  }
  return allowlist.filter((hash) => found.has(hash)).map((hash) => `'${hash}'`).sort();
}

function buildHtaccess(scriptHashes) {
  const csp = [
    "default-src 'self'",
    `script-src 'self' ${scriptHashes.join(' ')}`.trim(),
    // Atribut style="" inline berasal dari perataan kolom tabel Markdown
    // (style="text-align:left" dan sejenisnya) serta blok kode Shiki.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ');

  return `# Dibuat otomatis oleh src/lib/htaccess.mjs saat \`npm run build\`. Jangan edit di server.

Options -Indexes
DirectoryIndex index.html
ErrorDocument 404 /404.html

<IfModule mod_rewrite.c>
  RewriteEngine On

  # Paksa HTTPS dan domain tanpa www.
  RewriteCond %{HTTPS} !=on [OR]
  RewriteCond %{HTTP_HOST} ^www\\. [NC]
  RewriteRule ^ https://bedahgadget.id%{REQUEST_URI} [R=301,L]

  # Tolak akses ke file tersembunyi (.git, .env, dll.) kecuali .well-known.
  RewriteRule (^|/)\\.(?!well-known/) - [F]
</IfModule>

<IfModule mod_headers.c>
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-Frame-Options "DENY"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()"
  Header always set Cross-Origin-Opener-Policy "same-origin"
  Header always set Content-Security-Policy "${csp}"
  Header always unset X-Powered-By

  # Aset ber-hash dari Astro aman di-cache lama.
  <FilesMatch "^.*\\.[A-Za-z0-9_-]{8,}\\.(css|js|webp|png|jpg|avif|svg)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  <FilesMatch "\\.(html|xml|txt)$">
    Header set Cache-Control "public, max-age=0, must-revalidate"
  </FilesMatch>
</IfModule>
`;
}

export default function htaccess() {
  return {
    name: 'bedahgadget-htaccess',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const distDir = fileURLToPath(dir);
        const hashes = allowedScriptHashes(distDir, logger);
        writeFileSync(join(distDir, '.htaccess'), buildHtaccess(hashes));
        logger.info(`.htaccess ditulis dengan ${hashes.length} hash script inline`);
      },
    },
  };
}
