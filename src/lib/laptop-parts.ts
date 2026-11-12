import type { FixnowTopic } from '../content/config';

/**
 * Peta bagian laptop di figur home ke artikel yang membahasnya.
 * `id` dipakai juga oleh skrip figur (scripts/anatomy/laptop.mjs) untuk menamai hotspot.
 * Designator mengikuti konvensi PCB: Q = MOSFET, J = konektor, U = IC, HS = heatsink, H = engsel.
 */
export interface LaptopPart {
  id: string;
  designator: string;
  name: string;
  slug: string;
}

export const laptopParts: LaptopPart[] = [
  { id: 'hinge', designator: 'H1', name: 'Engsel dan dudukan baut', slug: 'kenapa-engsel-laptop-sering-patah' },
  { id: 'vrm', designator: 'Q1', name: 'MOSFET VRM dan choke', slug: 'kenapa-panas-bikin-laptop-mati-total-vrm' },
  { id: 'heatsink', designator: 'HS1', name: 'Heatsink dan pasta termal', slug: 'thermal-paste-vs-thermal-pad-laptop' },
  { id: 'ram', designator: 'J1', name: 'Slot RAM SO-DIMM', slug: 'ram-single-vs-dual-channel-performa-laptop' },
  { id: 'soc', designator: 'U1', name: 'SoC: CPU, GPU, dan NPU', slug: 'npu-vs-gpu-arsitektur-silikon-ai-pc' },
  { id: 'battery', designator: 'J2', name: 'Konektor baterai dan jalur +3VALW', slug: 'laptop-kena-air-dendrit-korosi-52-detik' },
  { id: 'board', designator: 'PCB', name: 'Motherboard secara utuh', slug: 'cara-menilai-jeroan-laptop-gaming' },
];

/** Gejala dengan niat servis tinggi; tiap gejala menunjuk satu artikel dan satu topik FixNow. */
export interface Symptom {
  label: string;
  slug: string;
  topic: FixnowTopic;
}

export const symptoms: Symptom[] = [
  { label: 'Mati total', slug: 'kenapa-panas-bikin-laptop-mati-total-vrm', topic: 'mati-total' },
  { label: 'Kena air', slug: 'laptop-kena-air-dendrit-korosi-52-detik', topic: 'air' },
  { label: 'Panas berlebih', slug: 'thermal-paste-vs-thermal-pad-laptop', topic: 'thermal' },
  { label: 'Engsel patah', slug: 'kenapa-engsel-laptop-sering-patah', topic: 'engsel' },
];

/** Bagian yang sudah dihubungkan ke artikelnya (dipakai figur dan daftar bagian). */
export interface ResolvedPart extends LaptopPart {
  href: string;
  title: string;
  minutes: number;
}
