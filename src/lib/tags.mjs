import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// Halaman tag dengan artikel lebih sedikit dari ini diberi noindex dan tidak masuk sitemap.
export const MIN_TAG_ARTICLES = 2;

// Dipakai astro.config.mjs (di luar runtime astro:content), jadi frontmatter dibaca langsung dari file.
export function countTags(articlesDir = 'src/content/articles') {
  const counts = new Map();
  for (const file of readdirSync(articlesDir)) {
    if (!/\.mdx?$/.test(file)) continue;
    const source = readFileSync(join(articlesDir, file), 'utf-8');
    const match = source.match(/^tags:\s*\[(.*)\]\s*$/m);
    if (!match) continue;
    for (const tag of match[1].matchAll(/"([^"]+)"/g)) {
      counts.set(tag[1], (counts.get(tag[1]) ?? 0) + 1);
    }
  }
  return counts;
}

export function isThinTagUrl(url, counts) {
  const tag = url.match(/\/tag\/([^/]+)\/?$/)?.[1];
  return tag !== undefined && (counts.get(decodeURIComponent(tag)) ?? 0) < MIN_TAG_ARTICLES;
}
