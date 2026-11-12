import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { countTags, isThinTagUrl } from './src/lib/tags.mjs';
import htaccess from './src/lib/htaccess.mjs';

const tagCounts = countTags();

function rehypeTableScroll() {
  return (tree) => {
    const wrapTables = (node) => {
      if (!Array.isArray(node.children)) return;
      node.children = node.children.map((child) => {
        if (child.type === 'element' && child.tagName === 'table') {
          return {
            type: 'element',
            tagName: 'div',
            properties: {
              className: ['table-scroll'],
              role: 'region',
              'aria-label': 'Tabel',
              tabIndex: 0,
            },
            children: [child],
          };
        }
        wrapTables(child);
        return child;
      });
    };
    wrapTables(tree);
  };
}

export default defineConfig({
  site: 'https://bedahgadget.id',
  markdown: {
    rehypePlugins: [rehypeTableScroll],
  },
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    mdx(),
    sitemap({
      filter: (page) => !isThinTagUrl(page, tagCounts),
    }),
    htaccess(),
  ],
});
