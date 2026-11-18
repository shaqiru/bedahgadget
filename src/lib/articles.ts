import type { CollectionEntry } from 'astro:content';

// Urutan baku semua daftar artikel: terbaru dulu, lalu slug menaik untuk artikel bertanggal sama.
// Tanpa penentu kedua, urutan artikel bertanggal sama mengikuti urutan baca file dan bisa
// berbeda antar mesin build.
export function compareArticles(a: CollectionEntry<'articles'>, b: CollectionEntry<'articles'>): number {
  return b.data.pubDate.valueOf() - a.data.pubDate.valueOf() || a.slug.localeCompare(b.slug, 'en');
}
