# Client Sites Workspace

This workspace contains a **multi-client website system** using Astro and component-level versioning.

## Multi-Agent Architecture

This workspace uses **specialized agents** for parallel and focused work:

### Available Agents

1. **Site Developer** (`@site-developer`) — Works on individual client sites
   - Scope: `sites/[site-name]/`
   - Tasks: Pages, content, i18n, site configuration
   - **Parallelizable**: Multiple Site Developer agents can work on different sites simultaneously

2. **Component Library** (`@component-library`) — Maintains shared components
   - Scope: `packages/shared/`, `packages/templates/`
   - Tasks: Components, layouts, styles, versioning, Changesets
   - **Single-threaded**: Only one agent should modify shared components at a time

3. **CLI Developer** (`@cli-developer`) — Builds tooling
   - Scope: `tools/cli/`
   - Tasks: Commands, validation, scaffolding, utilities
   - **Single-threaded**: CLI changes affect all sites

### Delegation Strategy

**When to use which agent:**

- Working on **specific site** (garage-mueller, client-xyz content/pages) → `@site-developer`
- Adding/modifying **shared components** → `@component-library`
- Building **CLI commands** or validation logic → `@cli-developer`

**Parallel work pattern:**

```
Agent 1: @site-developer → sites/garage-mueller/
Agent 2: @site-developer → sites/client-abc/
Agent 3: @component-library → packages/shared/
```

Sites are independent, so multiple Site Developer agents can work simultaneously without conflicts.

### Agent Boundaries

Each agent has strict scope constraints to avoid conflicts:

| Agent             | Can Modify                                | Cannot Modify                      |
| ----------------- | ----------------------------------------- | ---------------------------------- |
| Site Developer    | `sites/[specific-site]/`                  | `packages/`, `tools/`, other sites |
| Component Library | `packages/shared/`, `packages/templates/` | `sites/`, `tools/`                 |
| CLI Developer     | `tools/cli/`                              | `sites/`, `packages/`              |

This ensures clean separation and enables safe parallel work.

## Core Principles

1. **Component library approach**: Shared components in `packages/shared`, each site has its own content
2. **Multi-language support**: Sites can support multiple languages with i18n
3. **Component-level versioning**: Breaking changes create new versions (v1/, v2/) instead of breaking old sites
4. **Static-first**: All pages prerendered at build time as static HTML
5. **Long-running sites**: Old client sites should never break, even years later

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
  example-client/      # Individual garage site
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
sites/example-client/src/pages/
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
// New sites - use latest import Hero from '@colombalink/shared/components/sections/Hero.astro'; //
Legacy sites - locked to v1 import Hero from
'@colombalink/shared/components/sections/v1/Hero.astro';
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
cli create garage-[name]  # In dev container (globally available)
# or
./cli create garage-[name]  # Outside container
```

This creates:

- Site structure in `sites/garage-[name]/`
- DE/FR/IT language routes
- Example JSON content files
- Configured to use shared components

### To Edit Content for a Garage

1. Find the site: `sites/example-client/`
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

### Update Hero Text for Example Client

```bash
# Edit German content
vim sites/example-client/src/pages/de/index.json

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
import NewSection from '@colombalink/shared/components/sections/NewSection.astro';
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
cli create garage-name  # In dev container (globally available)

# Develop a garage site
cd sites/example-client
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

This is a **multi-agent monorepo** for client websites that share components but have separate content.

### Architecture

- **Shared components** (`packages/shared/`) with component-level versioning
- **Independent sites** (`sites/`) with their own content and configuration
- **CLI tooling** (`tools/cli/`) for site management

### Agent Workflow

- **@site-developer**: Works on individual sites (parallelizable)
- **@component-library**: Maintains shared components (single-threaded)
- **@cli-developer**: Builds CLI tools (single-threaded)

### Key Rules

- Sites are independent → safe for parallel work
- Component changes need versioning → use Changesets
- Breaking changes → new version folder (v1/, v2/), MINOR bump
- Old sites never break → locked imports from version folders

When working here:

- **Edit content**: Use `@site-developer` for specific site
- **Edit components**: Use `@component-library` for shared packages
- **Edit CLI**: Use `@cli-developer` for tooling
- **Parallel work**: Multiple `@site-developer` agents on different sites
