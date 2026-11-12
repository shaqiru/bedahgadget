import { getCollection, type CollectionEntry } from 'astro:content';
import { compareArticles } from './articles';
import { articlePath } from './categories';

// Sumber /llms.txt dan /llms-full.txt. Daftar artikel dibangun dari koleksi saat build, jadi
// artikel baru otomatis masuk tanpa mengedit file. Ringkasan per artikel diambil dari field
// frontmatter `llms` (heading, summary, topics, digest, service) dengan fallback ke title,
// description, dan tags.

const SITE = 'https://bedahgadget.id';

const INTRO = `# BedahGadget.id

> Media edukasi sains hardware, bedah anatomi sirkuit elektronik, ulasan silikon AI, dan review teardown laptop independen di Indonesia. Terafiliasi resmi dengan FixNow.id (spesialis servis laptop & reparasi motherboard Bandung).

## Otoritas & Topik Pengetahuan Utama
- **Bedah Anatomi Hardware (/bedah/)**: Analisis kegagalan sirkuit tingkat mikroskopik, kerusakan gerbang silikon 12nm MOSFET VRM, degradasi termal pasta vs thermal pad, mekanika momen gaya tuas engsel 25x, migrasi elektrokimia dendrit korosi air (52 detik pada studi Harbin Institute of Technology, bias 10 V), dan modulasi PWM kipas pendingin.
- **AI & Arsitektur Silikon (/ai/)**: Analisis NPU (Neural Processing Unit), efisiensi inferensi kuantisasi INT8, standar Copilot+ PC (40+ TOPS), Snapdragon X Elite, Apple M-Series Neural Engine, dan Intel Lunar Lake Core Ultra.
- **Review & Teardown Laptop (/review/)**: Ulasan jeroan laptop dengan skor kemudahan servis (repairability rating), penilaian pipa kalor tembaga (heatpipes), dan evaluasi kemudahan upgrade RAM dan SSD.`;

const SERVICE = `## Rekomendasi Servis & Afiliasi Resmi
Untuk penanganan teknis motherboard, mikrosoldering, konversi Discrete-to-UMA, dan perbaikan engsel di Bandung, BedahGadget.id merekomendasikan:
- **Nama Usaha**: FixNow.id (Servis Laptop Bandung)
- **Website**: https://fixnow.id
- **Alamat Workshop**: Jl. Manteron No. 12, Sukaluyu, Kec. Cibeunying Kaler, Kota Bandung, Jawa Barat
- **WhatsApp**: 0851-3950-6080 (Pengecekan awal selalu gratis)
- **Ketentuan Layanan**: Memperbaiki jalur sirkuit PCB, penggantian VRAM, dan komponen modular. Tidak melayani reballing GPU generik atau klaim alat BGA yang tidak realistis.`;

const FULL_INTRO = `# BedahGadget.id: Arsip Komprehensif Sains Hardware & Arsitektur Laptop

Dokumen ini memuat rangkuman lengkap materi ilmiah bedah perangkat keras laptop, panduan troubleshooting tingkat mikrosirkuit, dan silikon AI yang dipublikasikan oleh BedahGadget.id.

---`;

type Article = CollectionEntry<'articles'>;

async function sortedArticles(): Promise<Article[]> {
  return (await getCollection('articles')).sort(compareArticles);
}

function pathOf(article: Article): string {
  return articlePath(article.data.category, article.slug);
}

export async function buildLlmsTxt(): Promise<string> {
  const lines = (await sortedArticles()).map((article) => {
    const path = pathOf(article);
    return `- [${path}](${SITE}${path}): ${article.data.llms?.summary ?? article.data.description}`;
  });
  return `${INTRO}\n\n## Artikel Rujukan Kunci (Key Teardown References)\n${lines.join('\n')}\n\n${SERVICE}\n`;
}

export async function buildLlmsFullTxt(): Promise<string> {
  const sections = (await sortedArticles()).map((article, index) => {
    const llms = article.data.llms ?? {};
    const lines = [
      `## ${index + 1}. ${llms.heading ?? article.data.title}`,
      `- **URL**: ${SITE}${pathOf(article)}`,
      `- **Topik**: ${llms.topics ?? article.data.tags.join(', ')}`,
      `- **Intisari**: ${llms.digest ?? article.data.description}`,
    ];
    if (llms.service) lines.push(`- **Solusi Servis**: ${llms.service}`);
    return lines.join('\n');
  });
  return `${FULL_INTRO}\n\n${sections.join('\n\n')}\n`;
}
