import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Hosting target: Jagoan Hosting (cPanel + LiteSpeed), yang membaca .htaccess.
// Ditulis saat build supaya hash CSP selalu cocok dengan script inline yang benar-benar terbit.

function listHtml(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return listHtml(path);
    return entry.name.endsWith('.html') ? [path] : [];
  });
}

function inlineScriptHashes(distDir) {
  const hashes = new Set();
  for (const file of listHtml(distDir)) {
    const html = readFileSync(file, 'utf-8');
    for (const [, attrs, body] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
      if (/\bsrc=/.test(attrs) || /application\/ld\+json/.test(attrs)) continue;
      hashes.add(`'sha256-${createHash('sha256').update(body).digest('base64')}'`);
    }
  }
  return [...hashes].sort();
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
        const hashes = inlineScriptHashes(distDir);
        writeFileSync(join(distDir, '.htaccess'), buildHtaccess(hashes));
        logger.info(`.htaccess ditulis dengan ${hashes.length} hash script inline`);
      },
    },
  };
}
