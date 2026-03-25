# Client Sites — Coordinator Repository

Multi-client website system with isolated git branches and shared component library.

## Architecture

This repository uses a **coordinator pattern** with **orphan branches**:

- **`main` branch**: CLI tooling, documentation, client registry
- **`client/*` branches**: Isolated client sites (no shared git history)
- **`shared/components` branch**: Versioned component library (tags: v1.0.0, v1.1.0...)

**Benefits:**

- Complete client isolation
- Multiple clients checked out simultaneously
- Flexible versioning per client
- One branch = one deployment

📖 Read [GIT-WORKFLOW.md](GIT-WORKFLOW.md) for detailed architecture.

---

## Structure

```
/workspaces/next-pages/           # Coordinator repository
├── clients.json                  # Registry of all clients
├── tools/cli/                    # Client management CLI
└── sites/                        # Client checkouts (when working)
    ├── garage-mueller/           # Client worktree
    │   ├── src/
    │   │   ├── pages/            # Client pages & content
    │   │   └── shared/           # Shared components (v1.0.0)
    │   └── package.json
    └── garage-other/             # Another client (different version possible)
        └── src/shared/           # Shared components (v1.1.0)
```

---

## Quick Start

```bash
# 1. Install CLI
npm install

# 2. List clients
cli list

# 3. Checkout a client
cli checkout garage-mueller

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

## Shared Components

Each client uses a specific version of shared components from the `shared/components` branch:

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
