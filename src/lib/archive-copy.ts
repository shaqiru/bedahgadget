import type { CategoryKey } from './categories';

export interface ArchiveCopy {
  metaTitle: string;
  metaDescription: string;
  heading: string;
  intro: string;
}

/** Copy halaman daftar per rubrik. Komposisi portal tidak lagi dipakai di v2.0. */
export const archiveCopy: Record<CategoryKey, ArchiveCopy> = {
  bedah: {
    metaTitle: 'Bedah Anatomi Hardware & Elektronika Laptop',
    metaDescription:
      'Dokumentasi teknis bedah anatomi motherboard, jalur daya VRM, termodinamika pendingin, mekanika engsel, dan elektrokimia korosi bersama workshop FixNow.id Bandung.',
    heading: 'Bedah Anatomi Hardware & Elektronika Motherboard',
    intro:
      'Analisis cara kerja komponen di level sirkuit dan mekanik: mulai dari regulator tegangan VRM, perpindahan panas antarmuka termal, mekanika torsi engsel, hingga migrasi elektrokimia akibat tumpahan cairan.',
  },
  ai: {
    metaTitle: 'Arsitektur AI & Silikon Komputasi Modern',
    metaDescription:
      'Analisis teknis arsitektur NPU, GPU, CPU, bandwidth memori LPDDR5X/HBM, serta efisiensi daya silikon AI lokal tanpa jargon pemasaran.',
    heading: 'Arsitektur AI & Silikon Komputasi',
    intro:
      'Membedah bagaimana beban kerja kecerdasan buatan dieksekusi di level fisik silikon: perbandingan systolic array NPU terhadap shader core GPU, kuantisasi INT4/FP8, serta batas kecepatan jalur memori pada laptop AI PC.',
  },
  review: {
    metaTitle: 'Review & Checklist Jeroan Laptop Gaming',
    metaDescription:
      'Evaluasi rancangan internal laptop berdasarkan kualitas desain termal, struktur sasis, modularitas komponen, dan kemudahan servis jangka panjang.',
    heading: 'Review & Checklist Jeroan Laptop',
    intro:
      'Evaluasi perangkat dari sudut pandang meja teknisi: ketahanan pipa kalor di bawah beban kontinu, ketersediaan slot ekspansi SO-DIMM/M.2, kualitas dudukan engsel, serta parameter kemudahan perbaikan sasis dan motherboard.',
  },
};
