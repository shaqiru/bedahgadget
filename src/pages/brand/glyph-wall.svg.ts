// Dinding glyph untuk bagian bawah footer: 12x3 tile, dibuat saat build menjadi /brand/glyph-wall.svg.
// Footer mengambil file ini saat footer mendekati viewport lalu menyisipkannya inline, supaya warna
// mengikuti token tema dan varian A/B tanpa menambah ukuran HTML setiap halaman.
import type { APIRoute } from 'astro';
import { glyphNames, tileMarkup } from '../../lib/glyphs';
import type { TileKind } from '../../lib/glyphs';

const COLUMNS = 12;
const ROWS = 3;
const SIZE = 64;
const KINDS: TileKind[] = ['plate', 'ink', 'plate', 'accent', 'plate', 'heat', 'ink', 'plate', 'accent', 'plate', 'heat', 'plate'];

export const GET: APIRoute = async () => {
  const tiles: string[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLUMNS; col++) {
      // Urutan digeser per baris supaya glyph dan warna yang sama tidak bertumpuk vertikal.
      const name = glyphNames[(col + row * 5) % glyphNames.length];
      const kind = KINDS[(col + row * 6) % KINDS.length];
      // Delay bergiliran diagonal: gelombang bongkar-pasang dari kiri atas ke kanan bawah.
      const wave = (col + row * 2) % 12;
      tiles.push(await tileMarkup(name, kind, col * SIZE, row * SIZE, SIZE, { layers: true, className: `gw-d${wave}` }));
    }
  }
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" class="glyph-wall-svg block h-auto w-full" viewBox="0 0 ${COLUMNS * SIZE} ${ROWS * SIZE}" aria-hidden="true" focusable="false">` +
    `${tiles.join('')}</svg>`;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' } });
};
