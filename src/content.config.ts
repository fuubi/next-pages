import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Page content collection
const pages = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/pages' }),
  schema: z.object({
    slug: z.string(),
    seo: z.object({
      title: z.string(),
      description: z.string(),
      ogImage: z.string().optional(),
    }),
    headerVariant: z.enum(['default', 'transparent', 'minimal']).optional(),
    sections: z.array(
      z.object({
        type: z.string(),
        id: z.string(),
        variant: z.string().optional(),
        content: z.record(z.string(), z.unknown()),
      })
    ),
  }),
});

// Site settings collection
const site = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/site' }),
  schema: z.object({
    siteName: z.string(),
    defaultSeo: z.object({
      title: z.string(),
      description: z.string(),
      ogImage: z.string().optional(),
    }),
    navigation: z.array(
      z.object({
        label: z.string(),
        href: z.string(),
        children: z
          .array(
            z.object({
              label: z.string(),
              href: z.string(),
            })
          )
          .optional(),
      })
    ),
    footer: z.object({
      sections: z.array(
        z.object({
          title: z.string(),
          links: z.array(
            z.object({
              label: z.string(),
              href: z.string(),
            })
          ),
        })
      ),
      socialLinks: z.array(
        z.object({
          platform: z.string(),
          url: z.string(),
          icon: z.string(),
        })
      ),
      copyright: z.string(),
    }),
    contact: z.object({
      email: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
    }),
  }),
});

// Shared testimonials collection
const testimonials = defineCollection({
  loader: glob({ pattern: 'testimonials.json', base: './src/content/shared' }),
  schema: z.object({
    items: z.array(
      z.object({
        id: z.string(),
        quote: z.string(),
        author: z.string(),
        role: z.string(),
        company: z.string(),
        avatar: z.string().optional(),
      })
    ),
  }),
});

// Shared FAQs collection
const faqs = defineCollection({
  loader: glob({ pattern: 'faq.json', base: './src/content/shared' }),
  schema: z.object({
    items: z.array(
      z.object({
        id: z.string(),
        question: z.string(),
        answer: z.string(),
      })
    ),
  }),
});

// Shared logos collection
const logos = defineCollection({
  loader: glob({ pattern: 'logos.json', base: './src/content/shared' }),
  schema: z.object({
    items: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        logo: z.string(),
        url: z.string().optional(),
      })
    ),
  }),
});

export const collections = {
  pages,
  site,
  testimonials,
  faqs,
  logos,
};
