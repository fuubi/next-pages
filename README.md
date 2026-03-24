# Garage Sites Monorepo

Automated website builder for Swiss garages and auto workshops.

## Structure

```
├── packages/
│   ├── shared/       # Core components, layouts, styles (versioned)
│   └── templates/    # Reusable template variations (versioned)
├── sites/            # Individual garage websites
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
npm run garage create garage-mueller
```

This creates:

- Site structure in `sites/garage-mueller/`
- TypeScript-only configuration
- Optimized for Swiss market (DE/FR/IT languages)

### 3. Develop with worktrees (recommended)

```bash
npm run garage create garage-mueller -- --worktree
cd ../garage-mueller-work
npm install
npm run dev
```

## Versioning

This project uses **component-level versioning** to support long-running client sites that should never break.

Components are available at both latest paths and versioned paths:

```astro
// Latest (actively maintained sites) import Hero from
'@garage-sites/shared/components/sections/Hero.astro'; // Locked to v1 (legacy sites) import Hero
from '@garage-sites/shared/components/sections/v1/Hero.astro';
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
npm run garage create <name>

# List all sites
npm run garage list

# Validate site structure
npm run garage validate [site-name]
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
src/
pages/ # File-based routing
layouts/ # Page layouts
components/ # Reusable components
site/ # Site shell (Header, Footer, etc.)
sections/ # Marketing sections
ui/ # UI primitives
content/ # Content collections (single source of truth)
pages/ # Page content
site/ # Global settings
shared/ # Shared content blocks
styles/ # Global styles and tokens

```

## Content Editing

See [`.github/AGENTS.md`](.github/AGENTS.md) for detailed guidelines on editing content and working with this system.

### Quick Start

1. **Create a new page**: Add a JSON file to `src/content/pages/`
2. **Edit existing page**: Modify the relevant content file
3. **Add testimonials/FAQs**: Edit files in `src/content/shared/`
4. **Update navigation**: Edit `src/content/site/settings.json`

## Available Section Types

- `hero` - Hero section with headline, CTA
- `feature-grid` - Grid of features
- `feature-split` - Side-by-side feature + image
- `logo-cloud` - Partner/client logos
- `stats-row` - Statistics counters
- `testimonials` - Customer testimonials
- `faq` - Accordion FAQ
- `cta-section` - Call-to-action banner
- `contact-block` - Contact form/info

## Tech Stack

- **Framework**: Astro 6 (static mode)
- **Content**: JSON-based content collections
- **Styling**: Scoped CSS with design tokens
- **TypeScript**: Type-safe content schemas

## License

MIT
```
