# Client Sites Monorepo

Multi-client website system with shared component library and component-level versioning.

## Structure

```
├── packages/
│   ├── shared/       # Core components, layouts, styles (versioned)
│   └── templates/    # Reusable template variations (versioned)
├── sites/            # Individual client websites
├── tools/
│   └── cli/          # Site scaffolding & validation CLI
```

## Requirements

- **Node.js ≥ 25.0.0**
- npm 10+

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Create a new garage site

```bash
npm run cli create garage-mueller
```

This creates:

- Site structure in `sites/garage-mueller/`
- TypeScript-only configuration
- Optimized for Swiss market (DE/FR/IT languages)

### 3. Develop with worktrees (recommended)

```bash
npm run cli create garage-mueller -- --worktree
cd ../garage-mueller-work
npm install
npm run dev
```

## Versioning

This project uses **component-level versioning** to support long-running client sites that should never break.

Components are available at both latest paths and versioned paths:

```astro
// Latest (actively maintained sites) import Hero from
'@colombalink/shared/components/sections/Hero.astro'; // Locked to v1 (legacy sites) import Hero
from '@colombalink/shared/components/sections/v1/Hero.astro';
```

**Key documents:**

- [VERSIONING-QUICK-REF.md](VERSIONING-QUICK-REF.md) - **Start here!** Quick decision guide
- [COMPONENT-VERSIONING.md](COMPONENT-VERSIONING.md) - Component versioning strategy
- [COMPONENT-VERSIONING-SETUP.md](COMPONENT-VERSIONING-SETUP.md) - Implementation guide
- [VERSIONING.md](VERSIONING.md) - Changesets workflow

**Quick workflow:**

```bash
# After making changes to packages
npm run changeset   # Create a changeset (most changes are MINOR)
npm run version     # Bump versions (before release)
npm run release     # Publish packages
```

## CLI Commands

```bash
# Create new site
npm run cli create <name>

# List all sites
npm run cli list

# Validate site structure
npm run cli validate [site-name]
```

## Monorepo Rules

1. **TypeScript only** - No `.js` files allowed
2. **Node v25+** - Uses native TS support
3. **Naming convention** - Sites must be `garage-{name}`
4. **Content-driven** - Sites customize via `site.config.ts` and JSON content

## Development

Sites use shared packages via TypeScript path aliases:

```typescript
import Hero from '@shared/layouts/Hero.astro';
import ClassicHero from '@templates/hero/Classic.astro';
```

## Deployment

Each site builds independently:

```bash
cd sites/garage-mueller
npm run build
```

Output: `dist/` (static files ready for hosting)

## Project Structure

```
packages/
  shared/              # Shared component library (versioned)
    components/        # Reusable Astro components
      sections/        # Hero, ContactBlock, etc. + v1/ versions
      ui/              # Button, Card, etc.
      site/            # Header, Footer, Container
    layouts/           # BaseLayout
    styles/            # Design tokens, global CSS
    utils/             # i18n, animations, helpers
  templates/           # Template variations
    hero/              # Hero template variants

sites/
  garage-mueller/      # Individual garage site
    src/
      pages/           # File-based routing (de/fr/it)
        de/index.json  # German content
      i18n/            # i18n utilities
    astro.config.ts
    site.config.ts

tools/
  cli/                 # Site scaffolding CLI
```

## Content Management

Each garage site manages its own content in JSON files alongside pages:

```
sites/garage-mueller/src/pages/
  de/
    index.json        # German content: hero, services, testimonials, etc.
  fr/
    index.json        # French content
  it/
    index.json        # Italian content
```

No shared content - each garage has unique services, testimonials, and contact info.

See [`.github/AGENTS.md`](.github/AGENTS.md) for detailed guidelines.

## Component Library

Available section components:

- `hero` - Hero section with headline, CTA, image
- `feature-grid` - Grid of features (2/3/4 columns)
- `feature-split` - Side-by-side feature + image
- `logo-cloud` - Partner/client logos
- `stats-row` - Statistics counters
- `testimonials` - Customer testimonials
- `faq` - Accordion FAQ
- `cta-section` - Call-to-action banner
- `contact-block` - Contact form/info

## Tech Stack

- **Framework**: Astro 6 (static mode)
- **Content**: JSON files per language (i18n)
- **Styling**: Scoped CSS with design tokens
- **TypeScript**: Type-safe throughout
- **Versioning**: Component-level versioning (v1/, v2/) for long-running sites

## License

MIT

```

```
