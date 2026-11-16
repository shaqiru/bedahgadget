import type { CollectionEntry } from 'astro:content';
import { categories, type CategoryKey } from './categories';
import { laptopParts, type LaptopPart } from './laptop-parts';

export type Article = CollectionEntry<'articles'>;

/** Jumlah artikel per halaman arsip rubrik. */
export const ARCHIVE_PAGE_SIZE = 12;

/** Designator PCB artikel, diambil dari peta bagian laptop supaya tidak ada dua daftar. */
export function partFor(slug: string): LaptopPart | undefined {
  return laptopParts.find((part) => part.slug === slug);
}

export function designatorFor(slug: string): string | undefined {
  return partFor(slug)?.designator;
}

export interface DesignatorEntry {
  designator: string;
  name: string;
}

/** Designator unik milik artikel satu rubrik, urut kemunculan, dipakai panduan plate. */
export function designatorsFor(articles: Article[], limit = 5): DesignatorEntry[] {
  const seen = new Set<string>();
  const entries: DesignatorEntry[] = [];

  for (const article of articles) {
    const part = partFor(article.slug);
    if (!part || seen.has(part.designator)) continue;

    seen.add(part.designator);
    entries.push({ designator: part.designator, name: part.name });

    if (entries.length >= limit) break;
  }

  return entries;
}

export function sortByNewest(articles: Article[]): Article[] {
  return [...articles].sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
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
