import type { CollectionEntry } from 'astro:content';

export type CategoryKey = CollectionEntry<'articles'>['data']['category'];

export interface CategoryConfig {
  key: CategoryKey;
  label: string;
  breadcrumbLabel: string;
  archivePath: string;
  archiveRubric: string;
  articleSection: string;
  ledgerRubric: string;
  heroTitle: string;
  heroMeta: string;
  tagsLabel: string;
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
    ledgerRubric: 'BEDAH ANATOMI',
    heroTitle: 'FIG. 01 // DIAGRAM ANATOMI TEKNIS',
    heroMeta: 'FORMAT PRESISE &bull; 1080&times;810 PX',
    tagsLabel: 'INDEKS KOMPONEN:',
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
    ledgerRubric: 'AI & SILIKON',
    heroTitle: 'FIG. 01 // ARSITEKTUR SILIKON &amp; JALUR MEMORI',
    heroMeta: 'DIAGRAM ANATOMI TEKNIS &bull; 1080&times;810 PX',
    tagsLabel: 'INDEKS SILIKON:',
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
    ledgerRubric: 'REVIEW & CHECKLIST',
    heroTitle: 'FIG. 01 // DIAGRAM ANATOMI TEKNIS',
    heroMeta: 'FORMAT PRESISE &bull; 1080&times;810 PX',
    tagsLabel: 'INDEKS TOPIK:',
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
