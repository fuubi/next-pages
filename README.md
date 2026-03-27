# Client Sites — Coordinator Repository

Multi-client website system with isolated git branches and shared component library.

## Architecture

This repository uses a **coordinator pattern** with **orphan branches**:

- **`main` branch**: CLI tooling, documentation, client registry
- **`client/*` branches**: Isolated client sites (no shared git history)
- **`packages/shared-main` branch**: Active component development (git worktree)

**Benefits:**

- Complete client isolation
- Multiple clients checked out simultaneously
- Flexible versioning per client
- One branch = one deployment

📖 Read [GIT-WORKFLOW.md](GIT-WORKFLOW.md) for detailed architecture.

---

## Development vs Production Sites

This monorepo supports two types of sites:

### Development Sites (Workspace Dependencies)

**Purpose**: Active component development with live hot-reloading

- **`sites/garage-mueller`**: Full production-like site for testing components in context
- **`sites/demo-showcase`**: Isolated component gallery for rapid iteration

Both use **workspace dependencies** (`@colombalink/shared`) for instant live reloading when editing components in `packages/shared-main/`.

```bash
# Develop components
cd packages/shared-main
# Edit any component

# See changes instantly in:
cd sites/garage-mueller && npm run dev        # Full site context
cd sites/demo-showcase && npm run dev         # Isolated components
```

### Production Client Sites (Extraction Pattern)

**Purpose**: Real client deployments with version isolation

Client sites listed in `clients.json` use the **extraction pattern**:

- Components extracted as static copies at specific versions
- Each client pinned to a version (e.g., v1.4.0)
- Independent upgrades via `cli upgrade-shared`
- Orphan branches for complete isolation

```bash
cli checkout <client-name>    # Extracts components at pinned version
```

**Key difference**: Dev sites get live updates, production sites get versioned stability.

---

## Structure

```
/workspaces/next-pages/           # Coordinator repository
├── clients.json                  # Registry of production clients
├── tools/cli/                    # Client management CLI
├── packages/
│   ├── shared/                   # Source of truth for components
│   │   ├── components/           # All shared components
│   │   ├── layouts/              # Page layouts
│   │   ├── styles/               # Global styles & tokens
│   │   └── utils/                # Shared utilities
│   └── templates/                # Pre-built component variations
└── sites/
    ├── garage-mueller/           # DEV SITE: Full context testing
    │   ├── public/               # Site-specific assets
    │   └── src/pages/            # Test pages in multiple languages
    ├── demo-showcase/            # DEV SITE: Isolated component gallery
    │   └── src/pages/            # Component showcase pages
    └── <client-name>/            # PRODUCTION: Client worktree (via cli checkout)
        ├── public/               # Client assets (tracked in git)
        └── src/shared/           # Extracted components (pinned version)
```

**Development workflow:**

1. Edit components in `packages/shared/`
2. Preview in `sites/demo-showcase` (isolated) or `sites/garage-mueller` (full context)
3. Both dev sites use workspace dependencies for instant hot reload
4. Production clients use `cli checkout` for versioned extraction

---

## Component Development

Develop shared components in `packages/shared/` with live feedback from two dev environments:

### Quick Workflow

```bash
# View isolated components
cd sites/demo-showcase
npm run dev
# Visit http://localhost:4321 - browse components by category

# View in full site context
cd sites/garage-mueller
npm run dev
# Visit http://localhost:4321/de/ - see components in real pages

# Edit components - changes reflect instantly in both
cd packages/shared/components/sections/Hero
# Edit Hero.astro - save and see live updates
```

### Demo Showcase

`sites/demo-showcase` provides a component gallery organized by category:

- `/components/sections` - Section components (Hero, Features, etc.)
- `/components/site` - Site structure (Container, Section, etc.)
- `/components/ui` - UI primitives (Button, Card, Input, etc.)
- `/templates/hero` - Hero variations
- `/templates/footer` - Footer variations

Perfect for:

- Seeing all component variants side-by-side
- Testing components in isolation
- Rapid iteration without site context
- Component documentation

### garage-mueller Dev Site

`sites/garage-mueller` is a complete multi-language site showing components in production context:

- Real i18n routing (`/de/`, `/fr/`, `/it/`)
- Actual page layouts
- Full component integration
- Testing responsive design
- Verifying accessibility

Perfect for:

- Integration testing
- Final visual QA
- Real-world component usage
- Full site builds

---

## Quick Start (Production Clients)

```bash
# 1. Install CLI
npm install

# 2. List clients
cli list

# 3. Checkout a client
cli checkout garage-mueller
# This automatically:
# - Creates a worktree for the client branch
# - Extracts shared components at the specified version
# - Copies shared public assets (first checkout only - preserves existing assets)

# 4. Work on it
cd sites/garage-mueller
npm install
npm run dev

# 5. Close when done
cli close garage-mueller
```

---

## CLI Commands

```bash
# Create new client
cli create <name> [options]

# Checkout client for work
cli checkout <name>

# Close (remove) client
cli close <name>
cli close --all

# Upgrade shared components version
cli upgrade-shared <client> <version>

# List all clients
cli list

# Validate structure
cli validate [client]
```

Use `cli <command> --help` for details.

---

## Shared Components (Production Clients)

Production client sites use versioned copies of shared components from the `shared/components` branch:

```bash
# Check current version
cd sites/garage-mueller
cat ../../clients.json | grep -A3 garage-mueller

# Upgrade to new version
cli upgrade-shared garage-mueller v1.1.0

# Test and commit
npm run build
git add .
git commit -m "Upgrade to v1.1.0"
git push
```

**Key points:**

- Each client can use a different version
- Components are extracted at checkout (not a git worktree)
- Shared sample assets copied on first checkout only (preserves existing assets)
- Upgrade with `cli upgrade-shared`
- Test thoroughly before committing upgrades

---

## Working with Clients

### Development

```bash
cd sites/garage-mueller
npm run dev     # Dev server
npm run build   # Production build
```

Import shared components in pages:

```astro
---
import BaseLayout from '@shared/layouts/BaseLayout.astro';
import Hero from '@shared/components/sections/Hero/Hero.astro';
---

<BaseLayout title="Home">
  <Hero {...heroData} />
</BaseLayout>
```

### Public Assets

Each site has its own `public/` directory for static assets (tracked in git):

```bash
sites/garage-mueller/public/
├── images/          # Images (shared samples + your custom images)
├── favicon.svg      # Site favicon
└── robots.txt       # SEO configuration
```

**On first checkout:** Shared sample assets are copied from the component library

**Subsequent checkouts:** Existing `public/` assets are preserved (never overwritten)

**Your workflow:** Add site-specific images, fonts, PDFs, or any static files and commit them

**In components:** Reference from root: `/images/my-image.jpg`

### Content Structure

Content lives in JSON files next to pages:

```
src/pages/
  de/
    index.astro       # German page
    index.json        # German content
  fr/
    index.astro       # French page
    index.json        # French content
```

Each client has completely independent content.

### Committing Changes

```bash
cd sites/garage-mueller
git add .
git commit -m "Add new feature"
git push origin client/garage-mueller
```

---

## Available Components

The shared component library (`shared/components` branch) provides:

**Sections:** Hero, FeatureGrid, FeatureSplit, LogoCloud, StatsRow, Testimonials, FAQ, CTASection, ContactBlock

**Site:** Header, Footer, Container, Section, SectionHeader, LanguageSwitcher

**UI:** Button, Card, Badge, Input, Textarea, Accordion

**Layouts:** BaseLayout

**Utilities:** i18n, animations, design tokens

Components use version folders (`v1/`, `v2/`) so old versions remain available.

---

## Theme Customization

Each client can customize their brand colors, typography, and styling while using the same component library.

### Setup

1. **Create site-specific styles:**

   ```bash
   mkdir -p sites/{client}/src/styles
   ```

2. **Create `tokens.css`** with brand colors:

   ```css
   :root {
     --color-primary: #your-brand-color;
     --color-secondary: #your-secondary;
     --font-sans: 'Your Font', sans-serif;
   }
   ```

3. **Import in pages:**
   ```astro
   ---
   import '../../styles/tokens.css';
   ---
   ```

### How It Works

- **Shared library** provides base design tokens
- **Site-specific tokens** override selected values
- **Import order** ensures site tokens take precedence
- Changes committed to **client branch**, not shared library

See [sites/garage-mueller/THEME-CUSTOMIZATION.md](sites/garage-mueller/THEME-CUSTOMIZATION.md) for complete guide.

### Example Themes

- **Garage Mueller**: Industrial-clean with automotive red, charcoal blacks
- **Professional Services**: Navy blue, clean whites, subtle shadows
- **Creative Agency**: Purple gradients, bold imagery, rounded corners

---

## Documentation

**Essential:**

- [GIT-WORKFLOW.md](GIT-WORKFLOW.md) — Git workflow & architecture
- [COMPONENT-VERSIONING.md](COMPONENT-VERSIONING.md) — Component versioning
- [clients.json](clients.json) — Client registry

**Reference:**

- [docs/](docs/) — Migration guides, versioning details, examples

---

## Troubleshooting

**Client won't checkout:**

```bash
cat clients.json          # Check registry
git branch --all          # Verify branch exists
```

**Version not found:**

```bash
git tag -l | grep ^v      # List available versions
```

**Uncommitted changes:**

```bash
cd sites/garage-mueller
git status
git add . && git commit -m "WIP"
```

See [GIT-WORKFLOW.md](GIT-WORKFLOW.md) for more troubleshooting.

---

## License

MIT
