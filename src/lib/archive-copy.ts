import type { CategoryKey } from './categories';

/** Susunan area artikel di halaman pertama arsip rubrik. */
export type ArchiveComposition = 'lead-digest' | 'lead-band' | 'lead-ledger';

export interface ArchiveCopy {
  metaTitle: string;
  metaDescription: string;
  heading: string;
  intro: string;
  countLabel: string;
  /** Komposisi halaman 1: bedah memakai daftar di rail, AI memakai pita parameter, review memakai ledger. */
  susunan: ArchiveComposition;
  /** Label aksi di bawah ringkasan lead. */
  leadAction: string;
  /** Judul daftar sisa artikel saat halaman 1 punya lead. */
  listHeadingRest: string;
  /** Judul daftar saat halaman tidak punya lead (halaman 2 dan seterusnya). */
  listHeadingAll: string;
  /** Satuan baris daftar, mis. "ENTRI". */
  listUnit: string;
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
    susunan: 'lead-digest',
    leadAction: 'Baca bedahnya',
    listHeadingRest: 'LAPORAN LAIN',
    listHeadingAll: 'SEMUA LAPORAN',
    listUnit: 'ENTRI',
    leadSlug: 'kenapa-panas-bikin-laptop-mati-total-vrm',
    leadBadge: 'PILIHAN EDITOR',
  },
  ai: {
    metaTitle: 'Arsitektur AI & Silikon Komputasi Modern',
    metaDescription:
      'Analisis teknis arsitektur NPU, GPU, CPU, bandwidth memori LPDDR5X/HBM, serta efisiensi daya silikon AI lokal tanpa jargon pemasaran.',
    heading: 'Arsitektur AI & Silikon Komputasi',
    intro:
      'Membedah bagaimana beban kerja kecerdasan buatan dieksekusi di level fisik silikon: perbandingan systolic array NPU terhadap shader core GPU, kuantisasi INT4/FP8, serta batas kecepatan jalur memori pada laptop AI PC.',
    countLabel: 'LAPORAN TEKNIS',
    susunan: 'lead-band',
    leadAction: 'Baca analisisnya',
    listHeadingRest: 'ANALISIS LAIN',
    listHeadingAll: 'SEMUA ANALISIS',
    listUnit: 'ANALISIS',
    leadSlug: 'npu-vs-gpu-arsitektur-silikon-ai-pc',
    leadBadge: 'PILIHAN EDITOR',
  },
  review: {
    metaTitle: 'Review & Checklist Jeroan Laptop Gaming',
    metaDescription:
      'Evaluasi rancangan internal laptop berdasarkan kualitas desain termal, struktur sasis, modularitas komponen, dan kemudahan servis jangka panjang.',
    heading: 'Review & Checklist Jeroan Laptop',
    intro:
      'Evaluasi perangkat dari sudut pandang meja teknisi: ketahanan pipa kalor di bawah beban kontinu, ketersediaan slot ekspansi SO-DIMM/M.2, kualitas dudukan engsel, serta parameter kemudahan perbaikan sasis dan motherboard.',
    countLabel: 'PANDUAN TEKNIS',
    susunan: 'lead-ledger',
    leadAction: 'Baca checklist-nya',
    listHeadingRest: 'PANDUAN LAIN',
    listHeadingAll: 'SEMUA PANDUAN',
    listUnit: 'PANDUAN',
    leadSlug: 'cara-menilai-jeroan-laptop-gaming',
    leadBadge: 'PILIHAN EDITOR',
  },
} satisfies Partial<Record<CategoryKey, ArchiveCopy>>;

export type ArchiveCopyKey = keyof typeof archiveCopy;
