import { compareArticles } from '../lib/articles';
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const articles = await getCollection('articles');
  const sortedArticles = articles.sort(compareArticles);

  return rss({
    title: 'BedahGadget.id: Sains Hardware & Bedah Anatomi Laptop',
    description:
      'Portal edukasi sains hardware, bedah sirkuit mikroskopik, perkembangan silikon AI, dan review jeroan laptop independen.',
    site: context.site ?? 'https://bedahgadget.id',
    items: sortedArticles.map((article) => ({
      title: article.data.title,
      pubDate: article.data.pubDate,
      description: article.data.description,
      link: `/${article.data.category}/${article.slug}/`,
      categories: [article.data.category, ...article.data.tags],
      author: article.data.author,
    })),
    customData: `<language>id-ID</language>`,
  });
}
