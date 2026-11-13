import type { CollectionEntry } from 'astro:content';
import { MIN_TAG_ARTICLES } from './tags.mjs';

type Article = CollectionEntry<'articles'>;

// Urutan: tag yang sama terbanyak, lalu kategori sama, lalu yang terbaru.
export function relatedArticles(current: Article, all: Article[], limit = 3): Article[] {
  const tags = new Set(current.data.tags);
  return all
    .filter((a) => a.slug !== current.slug)
    .map((a) => ({
      a,
      shared: a.data.tags.filter((t) => tags.has(t)).length,
      sameCategory: a.data.category === current.data.category ? 1 : 0,
    }))
    .sort(
      (x, y) =>
        y.shared - x.shared ||
        y.sameCategory - x.sameCategory ||
        y.a.data.pubDate.valueOf() - x.a.data.pubDate.valueOf()
    )
    .slice(0, limit)
    .map(({ a }) => a);
}

// Hanya tag yang punya halaman terindeks (>= MIN_TAG_ARTICLES artikel di seluruh situs).
export function indexableTags(all: Article[], tags: string[]): string[] {
  return tags.filter((tag) => all.filter((a) => a.data.tags.includes(tag)).length >= MIN_TAG_ARTICLES);
}
