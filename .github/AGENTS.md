# Garage Sites Agent

This workspace contains a **multi-client website system** for Swiss garages using Astro and component-level versioning.

## Core Principles

1. **Component library approach**: Shared components in `packages/shared`, each site has its own content
2. **Multi-language support**: All garage sites support DE/FR/IT with i18n
3. **Component-level versioning**: Breaking changes create new versions (v1/, v2/) instead of breaking old sites
4. **Static-first**: All pages prerendered at build time as static HTML
5. **Long-running sites**: Old garage sites should never break, even years later

## Architecture Overview

### Monorepo Structure

```
packages/
  shared/              # Shared component library (versioned)
    components/
      sections/        # Hero, ContactBlock, etc.
        Hero.astro     # Latest version
        v1/            # Locked versions for legacy sites
          Hero.astro
      ui/              # Button, Card, etc.
      site/            # Header, Footer, Container
    layouts/           # BaseLayout
    styles/            # Design tokens, global styles
    utils/             # Utility functions, i18n helpers

sites/
  garage-mueller/      # Individual garage site
    src/
      pages/           # File-based routing
        index.astro    # Redirects to /de/
        de/            # German pages
          index.astro
          index.json   # German content
        fr/            # French pages
        it/            # Italian pages
      i18n/            # i18n utilities
    astro.config.ts
    site.config.ts
```

## Content Management

### Each Garage Site Manages Its Own Content

Content is stored in JSON files alongside pages, **NOT** in a central content collection:

```
sites/garage-mueller/src/pages/
  de/
    index.astro       # Loads index.json
    index.json        # German content: services, testimonials, contact info
  fr/
    index.astro
    index.json        # French content
  it/
    index.astro
    index.json        # Italian content
```

### Why This Approach?

- **No shared content**: Each garage has different services, testimonials, team
- **Language-specific**: Content lives with the language route
- **Simple**: No content collection complexity, just import JSON

## Component Versioning

### Latest vs Locked Versions

```astro
// New sites - use latest
import Hero from '@garage-sites/shared/components/sections/Hero.astro';

// Legacy sites - locked to v1
import Hero from '@garage-sites/shared/components/sections/v1/Hero.astro';
```

See [COMPONENT-VERSIONING.md](../COMPONENT-VERSIONING.md) for details.

## Component Library

### Available in packages/shared/components/

**Section Components:**
- `Hero` - Hero section with headline, CTA, image
- `ContactBlock` - Contact form and info
- `CTASection` - Call-to-action banner
- `FAQ` - Accordion FAQ list
- `FeatureGrid` - Grid of features (2/3/4 columns)
- `FeatureSplit` - Side-by-side feature + image
- `LogoCloud` - Partner/client logos
- `StatsRow` - Statistics counters
- `Testimonials` - Customer testimonials

**UI Components:**
- `Button` - Primary/secondary buttons
- `Card` - Content card
- `Badge` - Status badge
- `Accordion` - Expandable content
- `Input` - Form input
- `Textarea` - Form textarea

**Site Components:**
- `Header` - Site header with navigation
- `Footer` - Site footer
- `Container` - Max-width container
- `Section` - Section wrapper
- `SectionHeader` - Headline + description
- `LanguageSwitcher` - DE/FR/IT switcher

## Working on Garage Sites

### To Create a New Garage Site

```bash
npm run garage create garage-[name]
```

This creates:
- Site structure in `sites/garage-[name]/`
- DE/FR/IT language routes
- Example JSON content files
- Configured to use shared components

### To Edit Content for a Garage

1. Find the site: `sites/garage-mueller/`
2. Edit content: `src/pages/de/index.json` (or fr/it)
3. Update text, testimonials, services, contact info
4. No need to touch components

### To Add/Modify Components

1. Edit in `packages/shared/components/`
2. For breaking changes:
   - Keep old version in `v1/` folder
   - Update latest version
   - Create MINOR changeset (not MAJOR)
3. Old sites using `v1/` imports never break

## Common Tasks

### Update Hero Text for Garage Mueller

```bash
# Edit German content
vim sites/garage-mueller/src/pages/de/index.json

# Change the hero section content
{
  "hero": {
    "headline": "Willkommen bei Garage Müller",
    "text": "..."
  }
}
```

### Add New Section Component

```bash
# Create component
vim packages/shared/components/sections/NewSection.astro

# Update shared package exports if needed
vim packages/shared/package.json

# Use in any garage site
import NewSection from '@garage-sites/shared/components/sections/NewSection.astro';
```

### Make Breaking Change to Component

```bash
# Copy current to v1
cp packages/shared/components/sections/Hero.astro packages/shared/components/sections/v1/

# Update latest with breaking changes
vim packages/shared/components/sections/Hero.astro

# Create changeset (MINOR, not MAJOR!)
npm run changeset
# Select: minor
# Summary: "Hero v2: [describe changes]. Legacy v1 at v1/Hero.astro"
```

## Versioning Strategy

We use **component-level versioning** instead of package-level breaking changes:

- **MINOR bumps**: New component versions, new features
- **MAJOR bumps**: Rarely (only for removing 5+ year old versions)
- **Old sites**: Never break by importing from `v1/`, `v2/` paths

See:
- [COMPONENT-VERSIONING.md](../COMPONENT-VERSIONING.md) - Full strategy
- [VERSIONING-QUICK-REF.md](../VERSIONING-QUICK-REF.md) - Quick decision guide
- [VERSIONING.md](../VERSIONING.md) - Changesets workflow

## Build and Development

```bash
# Install dependencies
npm install

# Create new garage site
npm run garage create garage-name

# Develop a garage site
cd sites/garage-mueller
npm run dev

# Build for production
npm run build

# Create changeset (when editing shared components)
npm run changeset
```

## Key Files

- `packages/shared/package.json` - Shared component package
- `sites/*/astro.config.ts` - Per-site Astro config
- `sites/*/site.config.ts` - Per-site customization
- `packages/shared/utils/i18n.ts` - i18n utilities
- `.changeset/config.json` - Changesets configuration

## Summary

This is a **monorepo for multiple garage sites** that share components but have separate content. The component library uses versioning to ensure old sites never break, even years later. Each garage manages its own content in JSON files alongside their pages.

When working here:
- **Edit content**: Go to the specific garage site's JSON files
- **Edit components**: Work in `packages/shared/components/`
- **Breaking changes**: Create new version, keep old in `v1/`
- **Always test**: Check that changes don't break existing garage sites
