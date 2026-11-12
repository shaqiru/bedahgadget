# AGENTS.md: Panduan untuk Agent dan Kontributor

Dokumen ini untuk agent AI (Claude Code, Codex, Gemini, Cursor, dll.) dan manusia yang baru masuk ke proyek. Baca seluruhnya sebelum mengubah kode atau menulis artikel.

## Apa proyek ini

**BedahGadget.id** adalah situs media edukasi hardware berbahasa Indonesia: "bedah anatomi" kerusakan laptop, arsitektur silikon AI, dan panduan/review laptop. Situs ini sister-brand dari **FixNow.id** (servis laptop di Bandung). Artikel yang membahas kerusakan boleh menautkan ke halaman layanan FixNow.id yang relevan. Hubungan afiliasi ini **wajib selalu transparan** di situs.

## Stack dan perintah

- Astro 5 (output statis), MDX, Tailwind CSS 3 + `@tailwindcss/typography`, `@astrojs/sitemap`, `@astrojs/rss`.
- Node + npm.

```bash
npm install
npm run dev       # http://localhost:4321
npm run check     # astro check (tipe props komponen & pemakaian konten)
npm run build     # astro check + build ke dist/
npm run verify    # semua pemeriksaan CI: publikasi, keamanan konten, build, validasi dist/, lint gaya
npm run preview   # sajikan dist/
```

Selalu jalankan `npm run build` setelah perubahan. Build gagal jika `astro check` menemukan error tipe, frontmatter artikel tidak cocok dengan schema, atau path gambar salah.

## Struktur

```
src/
  content/config.ts          Schema Zod koleksi "articles" (sumber kebenaran frontmatter)
  content/articles/*.mdx     Artikel; nama file = slug URL
  assets/stills/*.png        Gambar artikel (dioptimasi astro:assets jadi WebP + srcset)
  assets/brand/              Aset brand yang dipakai sebagai gambar artikel
  layouts/BaseLayout.astro   <head>, meta, OG/Twitter, canonical, Navbar/Footer
  layouts/ArticleLayout.astro Template bersama semua halaman artikel (hero, JSON-LD, FAQ, CTA, artikel terkait)
  lib/categories.ts          Label, path arsip, rubrik, dan parameter per kategori (bedah/ai/review)
  lib/fixnow-topics.ts       Peta fixnowTopic -> URL layanan, judul, isu, variasi anchor
  lib/llms.ts                Isi /llms.txt dan /llms-full.txt (dibangun dari koleksi artikel)
  lib/json-ld.ts             serializeJsonLd(): sisipkan JSON-LD dengan aman
  lib/articles.ts            compareArticles(): urutan baku daftar artikel
  components/
    FixNowCallout.astro      CTA kontekstual ke halaman layanan FixNow.id (membaca peta topik)
    TeardownSpec.astro       Kartu spesifikasi teknis + titik rawan
    JsonLd.astro             Schema.org: TechArticle, BreadcrumbList, FAQPage
    ArticleCard.astro        Kartu daftar artikel
  pages/
    index.astro, tentang.astro
    bedah/ ai/ review/       index.astro (arsip) + [slug].astro (getStaticPaths + ArticleLayout)
    tag/[tag].astro          Agregasi per tag
    rss.xml.ts
public/
  brand/                     Logo SVG/PNG, font Archivo Black (aset resmi, jangan diubah)
  robots.txt
scripts/                     Pemeriksa build (tema/kontras, publikasi repo)
.agents/                     Skill/workflow OpenSpec generik untuk agent
publication-allowlist.txt    Daftar path yang boleh ada di repo ini
```

Kategori menentukan URL: `category: "bedah"` -> `/bedah/<slug>/`, `"ai"` -> `/ai/<slug>/`, `"review"` -> `/review/<slug>/`.

## Menambah artikel

1. Buat `src/content/articles/<slug>.mdx`. Field mengikuti `src/content/config.ts`: `title`, `description`, `pubDate`, `category`, `tags`, `image`, dan opsional `featured`, `repairabilityScore`, `failurePoints`, `fixnowTopic`, `specDetails`, `faqs`, `updatedDate`.
2. Gambar: taruh file di `src/assets/stills/`, lalu set `image: "../../assets/stills/<nama>.png"`. **Jangan** pakai path `/images/...` dari `public/`, karena build akan gagal.
3. Gambar di dalam isi MDX: import lalu pakai komponen `Image`:
   ```mdx
   import { Image } from 'astro:assets';
   import still_foo from '../../assets/stills/foo.png';

   <Image src={still_foo} alt="..." widths={[640, 1080]} sizes="(min-width: 896px) 896px, 100vw" class="rounded-xl border border-navy-700 w-full" />
   ```
4. `fixnowTopic` memilih CTA, URL layanan, dan variasi anchor lewat `src/lib/fixnow-topics.ts`. Peta itu bertipe `Record<FixnowTopic, ...>` dari enum di `src/content/config.ts`, jadi topik baru di enum tanpa entri peta menggagalkan type check. Tanpa `fixnowTopic`, artikel tidak merender callout sama sekali. Isi hanya jika artikel memang membahas kerusakan yang relevan dengan layanan itu.
5. `/llms.txt` dan `/llms-full.txt` dibuat otomatis saat build. Agar ringkasannya bagus, isi field opsional `llms` di frontmatter (`heading`, `summary` untuk llms.txt, `topics`, `digest` untuk Intisari, `service` untuk Solusi Servis). Tanpa field itu, judul, `description`, dan `tags` yang dipakai.
6. Jalankan `npm run verify`. Pemeriksaan yang sama berjalan otomatis di setiap pull request.

## Aturan konten (wajib)

**Akurasi dan sumber**
- Setiap angka spesifik (waktu, tegangan, suhu, persentase) harus punya sumber. URL sumber wajib dibuka dulu dan judul halamannya harus cocok dengan judul yang dikutip; jangan menebak URL. Kalau tidak ada URL yang valid, tulis judulnya saja tanpa link. Cantumkan sumbernya di bagian `## Sumber` di akhir artikel. Riset asli ada di catatan riset internal (`RISET.md` per topik video). Angka di sana sudah diberi tag sumber [S1], [S2], dst. Penulis tanpa akses catatan itu wajib mencantumkan sumbernya sendiri dengan aturan yang sama.
- **Jangan pernah menebak atau mengarang URL sumber.** Cantumkan tautan hanya jika URL tersebut tercatat di `RISET.md` dan terbukti aktif (status 200). Untuk dokumen standar industri, datasheet semikonduktor, atau buku teks teknik (seperti Baliga, JEDEC, TI Application Notes) yang tidak memiliki landing page stabil atau memicu download PDF langsung, biarkan berupa judul dan identitas publikasi resmi tanpa link.
- **Jangan menulis klaim pengujian yang tidak pernah dilakukan.** Jangan ada kata "lab kami", "terverifikasi lab", "uji BedahGadget", nama alat ukur tertentu, atau skor benchmark kecuali pengujiannya memang ada dan datanya tersedia. Hasil uji dari studi luar harus diatribusikan ke studi tersebut beserta kondisinya (contoh: "52 detik pada studi HIT, tembaga terbuka, bias 10 V").
- **Jangan menulis review unit tanpa merek dan model.** Review harus menyebut unit sungguhan dengan foto bongkaran asli. Kalau tidak ada unitnya, tulis sebagai panduan atau checklist.
- Gambar still dari video adalah ilustrasi atau rekonstruksi. Beri keterangan "Ilustrasi BedahGadget.id", bukan "foto mikroskop" atau "uji lab".

**FixNow.id (anti-overclaim)**
- Jangan klaim reballing GPU/chipset, penggantian chip GPU, atau BGA rework station. Kerusakan GPU diarahkan ke perbaikan jalur daya mikrosolder, penggantian VRAM, atau konversi Discrete-to-UMA.
- Jangan cantumkan harga (Rp). Pesan standar: "Pengecekan awal gratis".
- Jangan klaim "bergaransi" atau "SOP bergaransi" sebelum pemilik bisnis mengonfirmasi ketentuan garansinya.
- Kontak resmi: WhatsApp 0851-3950-6080, Jl. Manteron No. 12, Sukaluyu, Bandung.
- Tautan ke fixnow.id: `rel="noopener"` (dofollow), dengan parameter UTM `utm_source=bedahgadget`. Variasikan anchor text dan jangan pasang CTA di artikel yang tidak membahas kerusakan.

**Gaya bahasa**
- Paragraf pertama langsung menjawab pertanyaan (answer first).
- Tanpa em dash (—). Pakai koma, titik, atau tanda kurung.
- Tanpa pola "bukan X melainkan Y" atau "bukan sekadar", tanpa pembuka atau penutup klise ("mari kita selami", "kesimpulannya").
- Bahasa Indonesia baku tapi santai, istilah teknis dipertahankan dalam bahasa aslinya bila umum (heatpipe, VRM, DrMOS).

## Brand dan UI (Dual Theme & Desain Editorial)

Situs menggunakan sistem **Dual Theme** (terang & gelap) yang dikendalikan oleh atribut `data-theme="dark"` atau `data-theme="light"` pada elemen `<html>`. Skrip inisialisasi di `BaseLayout.astro` membaca preferensi tersimpan di `localStorage` (`bg-theme`) dan otomatis mengikuti `prefers-color-scheme` sistem pengguna jika belum ada preferensi manual.

### Aturan Token Semantik (WAJIB bagi Agent)

**Jangan pernah** menggunakan token warna statis gelap seperti `bg-navy`, `bg-navy-700`, `text-chalk`, `text-chalk-100` pada markup halaman baru atau kartu komponen. Penggunaan warna statis tersebut akan membuat teks tidak terbaca (kontras hancur) ketika pengguna beralih ke mode terang.

Selalu gunakan **token semantik dinamis** yang terdaftar di `tailwind.config.mjs` dan `src/styles/global.css`:

| Kategori | Token Tailwind | CSS Variable | Karakteristik (Light / Dark) |
|---|---|---|---|
| **Latar Belakang** | `bg-page` | `--bg-page` | Kanvas utama halaman (`#F4F4F4` / `#0B132B`) |
| | `bg-surface` | `--bg-surface` | Kontainer kartu, plate, isi box (`#FFFFFF` / `#101A38`) |
| | `bg-elevated` | `--bg-elevated` | Header kartu, tab, badge kode (`#E9ECF2` / `#16234A`) |
| **Tipografi** | `text-ink` | `--text-primary` | Judul dan teks utama (`#0B132B` / `#F4F4F4`) |
| | `text-ink-secondary` | `--text-secondary` | Paragraf body dan deskripsi (`#24304D` / `#D5DCE8`) |
| | `text-ink-muted` | `--text-muted` | Label kecil, metadata, timestamp (`#4A5673` / `#96A2BA`) |
| **Garis Pembatas** | `border-line` | `--border-hairline` | Garis pemisah hairline kartu (`#CBD2E0` / `#1E2D5A`) |
| | `border-line-strong` | `--border-strong` | Garis aksen bingkai tebal (`#0B132B` / `#41568F`) |
| **Aksen Teks** | `text-accent-link` | `--accent-link` | Tautan, label interaktif (`#0152B7` / `#5EA2F5`) |
| | `text-accent-positive` | `--accent-positive` | Status positif, skor tinggi (`#137337` / `#25D366`) |
| | `text-accent-danger` | `--accent-danger` | Peringatan, jalur putus (`#B4232A` / `#FF7A7E`) |
| **Aksen Brand (non-teks)** | `bg-ocean` / `border-ocean` | `#0169E9` | Latar tombol, garis aksen, sorotan dekoratif |
| | `bg-clover` / `border-clover` | `#25D366` | Latar indikator positif, garis status |
| | `bg-brandred` / `border-brandred` | `#E5484D` | Latar peringatan, garis bahaya |
| **Aksi (tombol CTA)** | `bg-action` | `--bg-action` | Latar tombol utama (`#0B132B` / `#25D366`) |
| | `text-on-action` | `--text-on-action` | Teks di atas `bg-action` (`#F4F4F4` / `#0B132B`) |
| | `bg-action-hover` / `text-on-action-hover` | `--bg-action-hover` / `--text-on-action-hover` | Status hover (`#0152B7` + putih / `#3388EE` + navy) |

**Warna brand mentah dilarang untuk teks.** Jangan memakai `text-ocean`, `text-clover`, atau `text-brandred`; ketiganya gagal WCAG AA di salah satu tema. Gunakan `text-accent-link`, `text-accent-positive`, atau `text-accent-danger`. Untuk tombol CTA, gunakan pasangan `bg-action text-on-action` (dan `hover:bg-action-hover hover:text-on-action-hover`), bukan `bg-navy text-chalk` atau `dark:bg-clover dark:text-navy`. `scripts/check-theme-css.mjs` menggagalkan build bila pola itu muncul di `src/`, memeriksa kontras pasangan tombol aksi, serta memeriksa kelas opasitas token (termasuk varian seperti `hover:` dan prefiks `ring-`/`divide-`) terhadap CSS hasil build.

- **Kelas Komponen & Visual**:
  - `.iso-plate`: Bingkai panel blueprint modular dengan border tipis dan latar `bg-surface`.
  - `.iso-diagram-well`: Area cekung (inset) berlatar terang untuk menampung diagram/stills teknis transparan.
  - `.split-rule`: Garis aksen hairline ganda penanda editorial di bagian atas kartu.
  - `.theme-dark-only` dan `.theme-light-only`: Helper untuk menampilkan logo/ikon yang berbeda antara mode gelap dan terang.
- **Tipografi**:
  - Judul: Archivo Black (self-hosted WOFF2 via kelas `font-brand` atau `font-heading`).
  - Body: Font stack sistem modern cepat (`Inter`, `system-ui`, `-apple-system`, `sans-serif`).
  - Data / Metrik / Waktu: `font-mono` (`JetBrains Mono`, `Menlo`, `monospace`) dengan `tabular-nums`.
- Aset logo di `public/brand/` adalah file master resmi; jangan dimodifikasi.

## SEO & Schema.org

- `site` di `astro.config.mjs` = `https://bedahgadget.id`.
- **Skema Terstruktur (`JsonLd.astro`)**:
  - Beranda (`index.astro`): `@type: 'WebSite'` dengan penerbit `Organization` BedahGadget.id.
  - Rubrik Arsip & Tag Tebal: `@type: 'CollectionPage'` yang menyatakan `isPartOf` ke `WebSite` utama.
  - Halaman Artikel (`[slug].astro`): Tiga blok JSON-LD terpisah: `@type: 'TechArticle'`, `@type: 'BreadcrumbList'`, dan `@type: 'FAQPage'`.
  - Halaman Tag Tipis (< 2 artikel) & `404.astro`: Memasang `noindex={true}` dan **dilarang memasang tag canonical** `<link rel="canonical">`. Tag tipis otomatis dikecualikan dari sitemap.
- **Optimasi LCP**: Gambar hero utama pada beranda dan setiap artikel **wajib** dipasang `loading="eager"` dan `fetchpriority="high"`.
- Sitemap otomatis (`/sitemap-index.xml`), RSS di `/rss.xml`, `robots.txt` mengizinkan crawler AI.
- `/llms.txt` dan `/llms-full.txt` dibangun dari koleksi artikel oleh `src/lib/llms.ts`, jadi selalu sinkron. Jangan membuat file `public/llms*.txt` lagi.

## Keamanan dan deploy

Situs ini 100% statis: tidak ada backend, database, login, atau form. Yang diterbitkan hanya isi folder `dist/` hasil build.

**Security headers dibuat otomatis.** `src/lib/htaccess.mjs` (integrasi di `astro.config.mjs`) menulis `dist/.htaccess` setiap `npm run build`: redirect HTTPS + non-www, blokir dotfile, `ErrorDocument 404`, HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, dan Content-Security-Policy.
- CSP mengizinkan script inline **hanya lewat hash SHA-256** yang tercantum di allowlist (lihat di bawah) dan benar-benar muncul di HTML hasil build. Jangan menambah script pihak ketiga (analytics, chat widget, font CDN) tanpa menambahkan domainnya ke CSP di `htaccess.mjs`, karena browser akan memblokirnya.
- Jangan pakai `onclick=""` atau atribut event inline lain; pakai `<script>` di komponen.
- Artikel diperlakukan sebagai kode dan direview sebelum terbit. `scripts/check-content-security.mjs` mem-parse setiap artikel dan **menggagalkan build** jika ada `import`, komponen, elemen, atau atribut di luar `scripts/content-allowlist.json`, ekspresi `{...}` selain gambar yang di-import dan array `widths`, atribut `on*`, URL `javascript:`/`data:`, `export`, atau gambar hero yang bukan raster di `src/assets/`. Perluas allowlist lewat PR jika memang perlu.
- Data terstruktur (JSON-LD) wajib disisipkan lewat `serializeJsonLd()` di `src/lib/json-ld.ts`, jangan `JSON.stringify` langsung di `set:html`.
- Script inline hanya boleh yang hash-nya tercantum di `src/lib/inline-script-allowlist.json`. Build gagal jika ada script inline lain. Jika script tema, menu, atau tab beranda sengaja diubah (atau minifier versi baru mengubah hasilnya), perbarui hash di PR yang sama; pesan error build menyebut hash barunya.
- `scripts/validate-dist.mjs` menolak `dist/` yang memuat file yang bisa dieksekusi server (`.php`, `.user.ini`, dan sejenisnya) atau `.htaccess` di subfolder.
- `scripts/lint-style.mjs` memberi peringatan (tidak menggagalkan build) untuk em dash, frasa klise, klaim lab/garansi/harga/reballing, dan artikel tanpa `## Sumber`.
- Jangan pernah meng-commit kredensial (token, password, kunci API). Secret scanning aktif di repo ini.

## Publikasi repo

Repo ini publik. Hanya path yang tercantum di `publication-allowlist.txt` yang boleh ada. Jalankan pemeriksa sebelum push:

```bash
node scripts/check-publication.mjs
```

Pemeriksa gagal jika ada file di luar allowlist, teks internal yang tidak boleh dipublikasikan, atau metadata gambar (EXIF, chunk teks PNG). Perencanaan proyek (OpenSpec, strategi, catatan infrastruktur) disimpan di repo private terpisah dan tidak boleh disalin ke sini, termasuk lewat contoh, komentar kode, atau pesan commit.

## OpenSpec

Perubahan besar mengikuti alur spec-driven OpenSpec: propose -> apply -> archive. Skill dan workflow generik ada di `.agents/`, tetapi change dan spec disimpan di repo private yang didaftarkan sebagai OpenSpec store di mesin pemilik. Jalankan perintah OpenSpec dengan `--store bedahgadget`. Kontributor tanpa akses repo private tidak memerlukan OpenSpec.
