import type { FixnowTopic } from '../content/config';

export interface FixnowTopicEntry {
  url: string;
  title: string;
  issue: string;
  anchors: string[];
  /** Topik tanpa halaman layanan khusus, diarahkan ke halaman terdekat. */
  nearest?: boolean;
}

const motherboard = 'https://fixnow.id/service-motherboard-laptop-bandung/';
const pendingin = 'https://fixnow.id/cleaning-repaste-laptop-bandung/';
const engsel = 'https://fixnow.id/service-engsel-laptop-bandung/';
const air = 'https://fixnow.id/service-laptop-kena-air-bandung/';
const upgrade = 'https://fixnow.id/upgrade-laptop-bandung/';

export const fixnowTopicMap: Record<FixnowTopic, FixnowTopicEntry> = {
  vrm: {
    url: motherboard,
    title: 'Jalur Daya VRM Panas dan Laptop Mati Mendadak?',
    issue:
      'VRM yang bekerja di luar batas suhu normal dapat memutus jalur daya ke prosesor. Pemeriksaan awal memetakan titik hubung singkat sebelum unit dinyalakan kembali.',
    anchors: [
      'Rujukan Servis Jalur Daya Motherboard di FixNow.id',
      'Periksa Jalur VRM Laptop di FixNow.id',
      'Konsultasi Kerusakan Jalur Daya di FixNow.id',
    ],
  },
  motherboard: {
    url: motherboard,
    title: 'Motherboard Laptop Tidak Lagi Menaikkan Daya?',
    issue:
      'Kerusakan jalur daya motherboard perlu dilacak dengan skema boardview agar penggantian komponen tidak menambah titik gangguan baru.',
    anchors: [
      'Rujukan Servis Motherboard Laptop di FixNow.id',
      'Lacak Kerusakan Motherboard di FixNow.id',
      'Konsultasi Perbaikan Motherboard di FixNow.id',
    ],
  },
  'mati-total': {
    url: motherboard,
    title: 'Laptop Mati Total Setelah Gejala Panas?',
    issue:
      'Mati total sering berawal dari jalur daya yang putus atau hubung singkat. Pengukuran awal menentukan apakah kerusakan berada di jalur daya atau di luar area tersebut.',
    anchors: [
      'Rujukan Pemeriksaan Laptop Mati Total di FixNow.id',
      'Konsultasi Laptop Mati Total di FixNow.id',
      'Periksa Jalur Daya Laptop Mati Total di FixNow.id',
    ],
    nearest: true,
  },
  thermal: {
    url: pendingin,
    title: 'Suhu Laptop Terlalu Tinggi Saat Beban Berat?',
    issue:
      'Pasta termal yang mengering dan debu pada sirip heatsink menurunkan pelepasan panas. Perawatan berkala menjaga suhu tetap stabil sebelum panas merambat ke jalur daya.',
    anchors: [
      'Rujukan Perawatan Termal Laptop di FixNow.id',
      'Jadwalkan Pembersihan Heatsink di FixNow.id',
      'Konsultasi Suhu Laptop Tinggi di FixNow.id',
    ],
  },
  pendingin: {
    url: pendingin,
    title: 'Sistem Pendingin Laptop Butuh Perawatan?',
    issue:
      'Debu yang menyumbat sirip heatsink dan thermal pad yang menipis membuat panas menumpuk di area VRM. Pembersihan dan penggantian material termal memulihkan aliran panas.',
    anchors: [
      'Rujukan Cleaning dan Repaste Laptop di FixNow.id',
      'Jadwalkan Deep Cleaning Laptop di FixNow.id',
      'Konsultasi Perawatan Pendingin Laptop di FixNow.id',
    ],
  },
  engsel: {
    url: engsel,
    title: 'Engsel Laptop Keras, Longgar, atau Patah?',
    issue:
      'Engsel yang kaku memindahkan beban ke dudukan sekrup pada casing dan panel. Penanganan sebelum retak menyebar mencegah kerusakan pada rangka LCD.',
    anchors: [
      'Rujukan Servis Engsel Laptop di FixNow.id',
      'Perbaikan Dudukan Engsel Laptop di FixNow.id',
      'Konsultasi Engsel Laptop Patah di FixNow.id',
    ],
  },
  air: {
    url: air,
    title: 'Laptop Terkena Air dan Mulai Korosi?',
    issue:
      'Residu cairan memicu dendrit logam yang menghubungkan jalur berdekatan. Pembersihan area terdampak dan pemeriksaan jalur daya perlu dilakukan sebelum unit dinyalakan lagi.',
    anchors: [
      'Rujukan Penanganan Laptop Kena Air di FixNow.id',
      'Periksa Korosi Akibat Cairan di FixNow.id',
      'Konsultasi Laptop Kena Air di FixNow.id',
    ],
  },
  korosi: {
    url: air,
    title: 'Muncul Korosi pada Jalur Motherboard?',
    issue:
      'Korosi mengubah sifat konduktif permukaan board dan dapat memicu hubung singkat antar jalur. Pembersihan jalur terdampak perlu dipetakan agar sisa residu tidak tertinggal.',
    anchors: [
      'Rujukan Pembersihan Korosi Motherboard di FixNow.id',
      'Konsultasi Korosi Jalur Motherboard di FixNow.id',
      'Periksa Jalur Terdampak Cairan di FixNow.id',
    ],
    nearest: true,
  },
  ram: {
    url: upgrade,
    title: 'Butuh Kapasitas Memori Lebih Besar?',
    issue:
      'Kapasitas dan konfigurasi memori memengaruhi performa beban kerja berat. Pemeriksaan slot dan dukungan modul mencegah pembelian komponen yang tidak kompatibel.',
    anchors: [
      'Konsultasi Upgrade RAM Laptop di FixNow.id',
      'Rujukan Pemasangan Modul Memori di FixNow.id',
      'Cek Kompatibilitas RAM Laptop di FixNow.id',
    ],
    nearest: true,
  },
  ssd: {
    url: upgrade,
    title: 'Ruang Penyimpanan Cepat Penuh?',
    issue:
      'Penggantian media penyimpanan perlu menyesuaikan antarmuka dan ruang fisik slot. Pemeriksaan tipe slot memastikan modul yang dipasang terbaca penuh.',
    anchors: [
      'Konsultasi Upgrade SSD Laptop di FixNow.id',
      'Rujukan Pemasangan SSD di FixNow.id',
      'Cek Slot Penyimpanan Laptop di FixNow.id',
    ],
    nearest: true,
  },
  keyboard: {
    url: motherboard,
    title: 'Sebagian Tombol Keyboard Tidak Merespons?',
    issue:
      'Tombol yang mati dapat berasal dari lapisan membran atau jalur konektor keyboard di motherboard. Pemeriksaan jalur memisahkan kerusakan modul dari kerusakan board.',
    anchors: [
      'Konsultasi Keyboard Laptop Tidak Berfungsi di FixNow.id',
      'Periksa Jalur Keyboard Laptop di FixNow.id',
      'Rujukan Penanganan Keyboard Laptop di FixNow.id',
    ],
    nearest: true,
  },
  lcd: {
    url: motherboard,
    title: 'Layar Laptop Gelap atau Bergaris?',
    issue:
      'Gangguan tampilan bisa berasal dari panel, kabel fleksibel, atau jalur sinyal pada motherboard. Pemeriksaan bertahap memastikan komponen mana yang perlu ditangani.',
    anchors: [
      'Konsultasi Layar Laptop Gelap di FixNow.id',
      'Periksa Jalur Sinyal Layar Laptop di FixNow.id',
      'Rujukan Penanganan Panel LCD di FixNow.id',
    ],
    nearest: true,
  },
};
