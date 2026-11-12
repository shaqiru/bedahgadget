import { defineCollection, z } from 'astro:content';

export const fixnowTopics = [
  'vrm',
  'motherboard',
  'mati-total',
  'thermal',
  'pendingin',
  'engsel',
  'air',
  'korosi',
  'ram',
  'ssd',
  'keyboard',
  'lcd',
] as const;

export const fixnowTopicSchema = z.enum(fixnowTopics);
export type FixnowTopic = z.infer<typeof fixnowTopicSchema>;

const articles = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.enum(['bedah', 'ai', 'review']),
    tags: z.array(z.string()).default([]),
    author: z.string().default('Tim BedahGadget.id'),
    image: image(),
    featured: z.boolean().default(false),
    repairabilityScore: z.number().min(1).max(10).optional(),
    failurePoints: z.array(z.string()).optional(),
    fixnowTopic: fixnowTopicSchema.optional(),
    specDetails: z
      .array(
        z.object({
          label: z.string(),
          value: z.string(),
        })
      )
      .optional(),
    faqs: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
        })
      )
      .optional(),
  }),
});

export const collections = {
  articles,
};
