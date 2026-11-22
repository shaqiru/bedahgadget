import type { CollectionEntry } from 'astro:content';
import { compareArticles } from './articles';
import { categories, type CategoryKey } from './categories';

export type Article = CollectionEntry<'articles'>;

/** Jumlah artikel per halaman arsip rubrik. */
export const ARCHIVE_PAGE_SIZE = 12;

export function sortByNewest(articles: Article[]): Article[] {
  return articles.toSorted(compareArticles);
}

export interface Page<T> {
  items: T[];
  current: number;
  totalPages: number;
}

export function paginate<T>(
  items: T[],
  pageNumber: number,
  pageSize = ARCHIVE_PAGE_SIZE
): Page<T> {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(1, pageNumber), totalPages);
  const start = (current - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), current, totalPages };
}

/** Halaman 1 tetap di /bedah/, halaman berikutnya di /bedah/page/2/ agar tidak bentrok dengan slug artikel. */
export function pageHref(categoryKey: CategoryKey, pageNumber: number): string {
  const base = categories[categoryKey].archivePath;
  return pageNumber <= 1 ? base : `${base}page/${pageNumber}/`;
}

export function totalPagesFor(articleCount: number, pageSize = ARCHIVE_PAGE_SIZE): number {
  return Math.max(1, Math.ceil(articleCount / pageSize));
}
