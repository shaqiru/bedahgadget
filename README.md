# BedahGadget.id

Situs media edukasi hardware berbahasa Indonesia: bedah anatomi kerusakan laptop, arsitektur silikon AI, dan panduan memilih laptop. Sister-brand dari [FixNow.id](https://fixnow.id) (servis laptop Bandung).

Dibangun dengan Astro (static), MDX, dan Tailwind CSS.

## Menjalankan

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # output statis di dist/
npm run preview
```

## Struktur singkat

- `src/content/articles/` : artikel MDX (nama file = slug)
- `src/assets/stills/` : gambar artikel (dioptimasi otomatis ke WebP)
- `src/components/` : layout, callout FixNow, schema JSON-LD
- `public/` : aset brand, `robots.txt`
- `/llms.txt` dan `/llms-full.txt` dibuat otomatis dari artikel (`src/lib/llms.ts`)

## Untuk agent AI dan kontributor

Baca **[AGENTS.md](AGENTS.md)** sebelum mengubah apa pun. Isinya aturan konten (sumber wajib, tanpa klaim uji palsu, anti-overclaim FixNow) dan cara menambah artikel.

## Keamanan dan deploy

Situs ini statis. Header keamanan (HSTS, CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) dibuat otomatis saat build ke `dist/.htaccess` oleh `src/lib/htaccess.mjs`. Host yang tidak membaca `.htaccess` (misalnya Cloudflare Pages, Vercel, Netlify) memerlukan porting header manual.

Sebelum push, jalankan `node scripts/check-publication.mjs` untuk memastikan hanya file yang diizinkan `publication-allowlist.txt` yang masuk repo.
