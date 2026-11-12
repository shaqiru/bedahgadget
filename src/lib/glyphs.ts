// Nama glyph brand; satu file SVG per nama di src/assets/glyphs.
export const glyphNames = [
  'screw-phillips',
  'screw-torx',
  'fan',
  'chip',
  'bga',
  'resistor',
  'capacitor',
  'choke',
  'trace',
  'hotspot',
  'heatsink',
  'battery',
] as const;

export type GlyphName = (typeof glyphNames)[number];

export type TileKind = 'plate' | 'ink' | 'accent' | 'heat';

// Dipakai saat build saja (komponen Astro), membaca isi glyph tanpa pembungkus <svg>.
export async function glyphBody(name: GlyphName): Promise<string> {
  const { readFileSync } = await import('node:fs');
  const { join } = await import('node:path');
  const raw = readFileSync(join(process.cwd(), 'src', 'assets', 'glyphs', `${name}.svg`), 'utf8');
  return raw.replace(/^[\s\S]*?<!--[\s\S]*?-->/, '').replace(/<\/svg>\s*$/, '');
}

// Satu tile persegi: latar sesuai jenis tile dan glyph di tengah dengan jarak tepi 1/6 ukuran tile.
// `layers`: tiap elemen glyph diberi kelas lapis `gx-<n>` (urutan gambar; elemen pertama lapis 0) untuk
// animasi bongkar-pasang. Kontur `gl` ikut lapis badan yang dikonturinya (elemen kedua).
export async function tileMarkup(
  name: GlyphName,
  kind: TileKind,
  x: number,
  y: number,
  size: number,
  { layers = false, className = '' }: { layers?: boolean; className?: string } = {},
): Promise<string> {
  const inset = Math.round(size / 6);
  let body = await glyphBody(name);
  if (layers) {
    let index = 0;
    body = body.replace(/class="(g[1-4l])"/g, (_, slot: string) => `class="${slot} gx-${slot === 'gl' ? 1 : Math.min(index++, 3)}"`);
  }
  return (
    `<g class="g-tile-${kind}${className ? ` ${className}` : ''}"><rect class="g-tile-bg" x="${x}" y="${y}" width="${size}" height="${size}"/>` +
    `<svg class="glyph" x="${x + inset}" y="${y + inset}" width="${size - inset * 2}" height="${size - inset * 2}" viewBox="0 0 64 64"${layers ? ' overflow="visible"' : ''}>` +
    `${body}</svg></g>`
  );
}
