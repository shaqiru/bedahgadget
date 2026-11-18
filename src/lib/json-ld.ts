// Menyisipkan data terstruktur ke <script type="application/ld+json"> dengan aman.
// JSON.stringify tidak meng-escape "</script>", jadi nilai frontmatter (judul, deskripsi, FAQ)
// bisa menutup elemen script dan menyisipkan script baru. Karakter <, >, &, serta pemisah
// baris U+2028 dan U+2029 diubah menjadi escape Unicode; hasilnya tetap JSON valid dengan
// nilai yang sama setelah di-parse.
const UNSAFE_CHARS = new RegExp(`[<>&${String.fromCharCode(0x2028, 0x2029)}]`, 'g');

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(
    UNSAFE_CHARS,
    (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`,
  );
}
