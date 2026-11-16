import type { CategoryKey } from './categories';

export interface ArchiveCopy {
  metaTitle: string;
  metaDescription: string;
  heading: string;
  intro: string;
  countLabel: string;
  /** Artikel yang dipilih redaksi sebagai pintu masuk rubrik; tampil sebagai lead di halaman 1. */
  leadSlug?: string;
  leadBadge?: string;
}

/**
 * Copy halaman arsip per rubrik. Hanya rubrik yang halamannya sudah memakai ArchivePage
 * yang perlu punya entri di sini.
 */
export const archiveCopy = {
  bedah: {
    metaTitle: 'Bedah Anatomi Hardware & Elektronika Laptop',
    metaDescription:
      'Dokumentasi teknis bedah anatomi motherboard, jalur daya VRM, termodinamika pendingin, mekanika engsel, dan elektrokimia korosi bersama workshop FixNow.id Bandung.',
    heading: 'Bedah Anatomi Hardware & Elektronika Motherboard',
    intro:
      'Analisis cara kerja komponen di level sirkuit dan mekanik: mulai dari regulator tegangan VRM, perpindahan panas antarmuka termal, mekanika torsi engsel, hingga migrasi elektrokimia akibat tumpahan cairan.',
    countLabel: 'LAPORAN TEKNIS',
    leadSlug: 'kenapa-panas-bikin-laptop-mati-total-vrm',
    leadBadge: 'PILIHAN EDITOR',
  },
} satisfies Partial<Record<CategoryKey, ArchiveCopy>>;

export type ArchiveCopyKey = keyof typeof archiveCopy;
