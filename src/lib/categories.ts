import type { CollectionEntry } from 'astro:content';

export type CategoryKey = CollectionEntry<'articles'>['data']['category'];

export interface CategoryConfig {
  key: CategoryKey;
  label: string;
  breadcrumbLabel: string;
  archivePath: string;
  archiveRubric: string;
  articleSection: string;
  schemaType: 'article' | 'review';
  ledgerShowsServiceScore: boolean;
}

export const categories: Record<CategoryKey, CategoryConfig> = {
  bedah: {
    key: 'bedah',
    label: 'Bedah Anatomi',
    breadcrumbLabel: 'BEDAH ANATOMI',
    archivePath: '/bedah/',
    archiveRubric: 'BEDAH ANATOMI HARDWARE',
    articleSection: 'Bedah Anatomi Hardware',
    schemaType: 'article',
    ledgerShowsServiceScore: false,
  },
  ai: {
    key: 'ai',
    label: 'AI & Silikon',
    breadcrumbLabel: 'AI & SILIKON',
    archivePath: '/ai/',
    archiveRubric: 'ARSITEKTUR AI & SILIKON',
    articleSection: 'Arsitektur AI & Silikon',
    schemaType: 'article',
    ledgerShowsServiceScore: false,
  },
  review: {
    key: 'review',
    label: 'Review Laptop',
    breadcrumbLabel: 'REVIEW LAPTOP',
    archivePath: '/review/',
    archiveRubric: 'REVIEW & CHECKLIST LAPTOP',
    articleSection: 'Review & Checklist Laptop',
    schemaType: 'review',
    ledgerShowsServiceScore: true,
  },
};

export function getCategory(key: CategoryKey): CategoryConfig {
  return categories[key];
}

export function articlePath(key: CategoryKey, slug: string): string {
  return `${categories[key].archivePath}${slug}/`;
}
