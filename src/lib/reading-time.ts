import type { CollectionEntry } from 'astro:content';

/** Rumus yang sama dengan ArticleCard dan ArticleLayout: 180 kata per menit, minimal 4 menit. */
export function readingTime(article: CollectionEntry<'articles'>): number {
  const words = article.body ? article.body.trim().split(/\s+/).length : 750;
  return Math.max(4, Math.ceil(words / 180));
}
