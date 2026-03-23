# Marketing Site Agent

This workspace contains an **AI-friendly static website system** built with Astro for marketing pages.

## Core Principles

When working on this project, always follow these principles:

1. **Static-first**: All pages should be prerendered at build time as static HTML
2. **Content-driven**: Edit content files, not templates - content collections are the single source of truth
3. **HTML-first architecture**: Use semantic HTML, CSS for responsiveness, JS only where necessary
4. **Minimal dependencies**: Keep the dependency tree small and understandable
5. **One content source**: Never duplicate content for mobile/desktop - use responsive CSS
6. **Component library constraints**: Use only the existing small set of components

## Architecture Overview

### Rendering Model

This site uses **Astro in static mode**. All routes are prerendered at build time to plain HTML files.

### Routing Model

**File-based routing** via `src/pages/`. Pages are generated from:
- Direct files in `src/pages/` (e.g., `index.astro`)
- Dynamic routes using `getStaticPaths()` from content collections (e.g., `[...slug].astro`)

### Content Model

**Astro content collections** are the single source of truth for all page content:
- `src/content/pages/` - Page content entries
- `src/content/site/` - Global site settings
- `src/content/shared/` - Reusable content blocks (testimonials, FAQs, etc.)

## File Structure

```
src/
  pages/
    index.astro              # Homepage (can use content collection)
    [...slug].astro          # Dynamic pages from content collections
  layouts/
    BaseLayout.astro         # Base HTML shell
  components/
    site/                    # Site shell components
      Header.astro
      Footer.astro
      Container.astro
      Section.astro
    sections/                # Marketing section components
      Hero.astro
      FeatureGrid.astro
      FeatureSplit.astro
      LogoCloud.astro
      StatsRow.astro
      Testimonials.astro
      FAQ.astro
      CTASection.astro
      ContactBlock.astro
    ui/                      # UI primitives
      Button.astro
      Card.astro
      Badge.astro
      Accordion.astro
      Input.astro
      Textarea.astro
  content/
    config.ts                # Content collection schemas
    pages/                   # Page content entries
    site/                    # Global settings
    shared/                  # Shared content blocks
  styles/
    tokens.css               # Design tokens
    global.css               # Global styles
```

## What You Should Edit

### Primary: Content Files

When asked to make content changes, edit files in `src/content/`:

- **Page copy, CTAs, headings** → `src/content/pages/*.json`
- **Navigation, footer links, contact info** → `src/content/site/settings.json`
- **Testimonials, FAQs, logos** → `src/content/shared/*.json`
- **SEO metadata** → page frontmatter in content entries
- **Section order** → `sections[]` array in page content

### Secondary: Components (When Necessary)

Edit components only when:
- Adding a new section type that doesn't exist
- Fixing bugs or improving existing components
- Adding new UI primitives that will be reused

### Rarely: Templates and Layouts

Edit these only when:
- Changing site-wide structure
- Adding new layout variants
- Modifying the section rendering system

## Component Library

### Site Shell Components

- `BaseLayout` - HTML document wrapper with SEO meta tags
- `Header` - Site header with navigation
- `Footer` - Site footer with links
- `Container` - Max-width container with padding
- `Section` - Semantic section wrapper with optional background variants
- `SectionHeader` - Reusable headline + description pattern

### Marketing Sections

Available section types for page composition:

- `Hero` - Hero section with headline, description, CTA, optional image
- `FeatureGrid` - Grid of features (2, 3, or 4 columns)
- `FeatureSplit` - Side-by-side feature with image
- `LogoCloud` - Client/partner logo grid
- `StatsRow` - Stat counters in a row
- `Testimonials` - Customer testimonials (grid or carousel)
- `FAQ` - Accordion FAQ list
- `CTASection` - Call-to-action banner
- `ContactBlock` - Contact form or contact information

### UI Primitives

- `Button` - Primary, secondary, outline variants
- `Card` - Content card with optional hover effects
- `Badge` - Small label/tag
- `Input` - Form input field
- `Textarea` - Multi-line text input
- `Accordion` - Collapsible content block

**Do not create new components unless absolutely necessary.** Reuse and compose from this set.

## Page Content Schema

Each page entry should have this structure:

```typescript
{
  slug: string              // URL path (e.g., "about", "industries/saas")
  seo: {
    title: string
    description: string
    ogImage?: string
  }
  sections: Array<{
    type: string           // Maps to component (e.g., "hero", "feature-grid")
    id: string             // Unique ID for the section
    variant?: string       // Optional variant (e.g., "three-column")
    content: object        // Section-specific content
  }>
}
```

## Responsive Design Rule

**Critical**: There must be **one content source** for both mobile and desktop.

✅ **Correct approach**:
- One content entry per page
- CSS handles layout changes via media queries
- Optional decorative differences in CSS

❌ **Never do this**:
- Separate mobile and desktop content files
- Duplicate page data
- Conditional rendering based on device type
- Copy-pasting content into two versions

## Styling Strategy

This project uses **Astro scoped CSS** with design tokens:

- `src/styles/tokens.css` - CSS custom properties for colors, spacing, typography
- `src/styles/global.css` - Global resets and base styles
- Component `.astro` files - Scoped styles in `<style>` blocks

**Styling rules**:
- Use CSS custom properties from tokens.css
- Keep scoped styles minimal and component-specific
- Use responsive design patterns (flex, grid, clamp)
- Avoid inline styles unless truly dynamic

## Animation Strategy

Animations should be **subtle and selective**:

✅ **Acceptable animations**:
- Fade in on scroll
- Hover lift on cards
- Accordion open/close
- Simple number counters
- Sticky header behavior

❌ **Avoid**:
- Constant motion everywhere
- Heavy animation libraries
- Complex timeline animations
- Parallax unless specifically requested

If animation is needed, implement with CSS transitions/animations or lightweight vanilla JS.

## AI Workflow Guidelines

### What You Should Do

When asked to work on this project:

1. **Create new pages**: Add entries to `src/content/pages/`
2. **Edit copy**: Update text in content collection files
3. **Reorder sections**: Change the `sections[]` array order
4. **Swap variants**: Change section `variant` property
5. **Update CTAs**: Edit CTA text and links in content
6. **Add testimonials/FAQs**: Add items to `src/content/shared/`
7. **Compose pages**: Build new pages from existing section types

### What You Should NOT Do

❌ **Don't**:
- Introduce new frameworks or heavy dependencies
- Create separate mobile/desktop content versions
- Build one-off custom components for every page
- Add client-side routing or turn this into an SPA
- Create new styling systems or methodologies
- Add random npm packages without justification

### Before Adding Dependencies

Ask yourself:
1. Can this be done with vanilla JS/CSS?
2. Is there an existing component that can be adapted?
3. Will this package be used in multiple places?
4. Is the bundle size justified?

**Default answer should be: use what's already there.**

## SEO Requirements

All generated pages must be SEO-friendly:

- ✅ Semantic HTML5 elements (`header`, `main`, `section`, `article`, `footer`)
- ✅ One `<h1>` per page
- ✅ Proper heading hierarchy
- ✅ Static prerendered HTML (not client-rendered)
- ✅ Title and meta description from content
- ✅ Canonical URL support
- ✅ Alt text on images
- ✅ Clean internal linking with `<a>` tags

## Build and Development

**Commands**:
- `npm run dev` - Start dev server at localhost:4321
- `npm run build` - Build static site to `dist/`
- `npm run preview` - Preview built site locally

**Build rules**:
- All pages MUST build to static HTML
- No client-side rendering of routes
- No framework JS unless component explicitly needs it
- Optimize images through Astro's image component

## Content Editing Workflow

### To create a new page:

1. Create a content entry in `src/content/pages/[name].json`
2. Define the slug, SEO metadata, and sections array
3. Use existing section types from the component library
4. Build - the dynamic route will pick it up automatically

### To edit an existing page:

1. Find the page content file in `src/content/pages/`
2. Edit the relevant section content
3. To reorder sections, reorder the `sections[]` array
4. To change variants, update the `variant` property

### To add shared content:

1. Add to appropriate file in `src/content/shared/`
2. Reference it from page sections using the content collection query system

## Common Tasks

### Add a new page

```bash
# Create content entry
src/content/pages/new-page.json

# Content structure
{
  "slug": "new-page",
  "seo": {
    "title": "Page Title",
    "description": "Page description for SEO"
  },
  "sections": [
    {
      "type": "hero",
      "id": "hero-1",
      "content": {
        "headline": "Welcome",
        "text": "Description",
        "cta": { "text": "Get Started", "href": "/contact" }
      }
    }
  ]
}
```

### Change homepage hero

Edit `src/content/pages/home.json` and update the hero section in the `sections[]` array.

### Update navigation

Edit `src/content/site/settings.json` and modify the `navigation` array.

### Add a testimonial

Add an entry to `src/content/shared/testimonials.json`.

## Summary

This is a **constrained, content-driven static site system**. The AI should primarily edit content files and compose pages from the existing component set. The architecture is deliberately simple to remain maintainable and AI-friendly. When in doubt, use what exists rather than creating something new.
