# Client Sites — Coordinator Repository

Multi-client website system with isolated git branches and shared component library management.

## Architecture Overview

This repository uses a **coordinator pattern** with **orphan branches per client** and **nested git worktrees**:

- **Coordinator branch (`main`):** CLI tooling, documentation, client registry
- **Client branches (`client/*`):** Independent orphan branches (no shared history)
- **Shared library:** Separate repository ([colombalink/shared-components](https://github.com/colombalink/shared-components)) with semantic versioning

**Benefits:**
- Complete client isolation (separate git history)
- Multiple clients checked out simultaneously
- Flexible shared library versioning per client
- Simplified deployment (one branch = one client)

See [GIT-WORKFLOW.md](GIT-WORKFLOW.md) for detailed architecture documentation.

---

## Multi-Agent Architecture

This workspace uses **specialized agents** for parallel work:

- **@site-developer** — Works on individual client sites (parallelizable)
- **@component-library** — Maintains shared components in separate repo (single-threaded)
- **@cli-developer** — Builds CLI tooling (single-threaded)

See [Multi-Agent Quick Reference](.github/MULTI-AGENT-QUICK-REF.md) for usage guide.

---

## Structure

```
/workspaces/next-pages/           # Coordinator repository
├── clients.json                  # Registry of all clients
├── tools/cli/                    # Client management CLI
├── GIT-WORKFLOW.md              # Git workflow documentation
├── MIGRATION-GUIDE.md           # Migration guide
└── sites/                        # Worktree checkout location (gitignored)
    ├── garage-mueller/           # Client worktree (when checked out)
    │   ├── src/                  # Client source code
    │   │   └── shared/           # Nested shared library worktree
    │   └── ...
    └── garage-other/             # Another client (parallel checkout)
        └── src/
            └── shared/           # Shared lib (possibly different version)
```

**Separate Repository:**
- [colombalink/shared-components](https://github.com/colombalink/shared-components) — Versioned component library (tags: v1.0.0, v1.1.0, ...)

---

## Requirements

- **Node.js ≥ 25.0.0**
- **Git ≥ 2.35** (for worktree support)
- npm 10+

---

## Quick Start

### 1. Install Dependencies

From the coordinator branch:

```bash
npm install
```

### 2. List Available Clients

```bash
cli list
```

Shows:
- ✓ **Checked Out Clients** — Currently available as worktrees
- ○ **Available Clients** — Registered but not checked out

### 3. Checkout a Client

```bash
cli checkout garage-mueller
```

This creates:
- Client worktree at `sites/garage-mueller/` (from `client/garage-mueller` branch)
- Nested shared library worktree at `sites/garage-mueller/src/shared/` (pinned version)

### 4. Work on the Client

```bash
cd sites/garage-mueller
npm install
npm run dev
```

The shared library is available at `src/shared/` within the client worktree.

### 5. Close the Client (When Done)

```bash
cli close garage-mueller
```

Removes both worktrees (client + nested shared library).

---

## Creating a New Client

```bash
cli create garage-neue-name
```

**Interactive prompts:**
- Business name
- Domain (e.g., `garage-neue-name.ch`)
- Primary language (`de`, `fr`, `it`, `en`)
- Shared library version (e.g., `v1.0.0`)

**What happens:**
1. Creates orphan branch `client/garage-neue-name`
2. Scaffolds site structure on that branch
3. Registers client in `clients.json`
4. Automatically checks out the client (use `--no-checkout` to skip)

**Non-interactive:**
```bash
cli create garage-example \
  --name "Garage Example" \
  --domain "garage-example.ch" \
  --language "de" \
  --shared-version "v1.0.0"
```

---

## Working with Multiple Clients

**Checkout multiple clients simultaneously:**

```bash
cli checkout garage-mueller
cli checkout garage-other
cli checkout garage-third
```

All three are now available in `sites/`:

```bash
cd sites/garage-mueller
npm run dev  # Port 4321

# In another terminal
cd sites/garage-other
npm run dev  # Port 4322
```

No need to close one client to work on another!

---

## Shared Library Management

### Check Current Version

```bash
cd sites/garage-mueller
cat ../clients.json | grep -A5 garage-mueller
# Or
cd src/shared
git describe --tags
```

### Upgrade Shared Library

```bash
cli upgrade-shared garage-mueller v1.1.0
```

**What happens:**
1. Shows diff between current and target version
2. Checks out new version in nested worktree
3. Updates `clients.json` with new pinned version

**Test, then commit:**
```bash
cd sites/garage-mueller
npm run build      # Test build with new version
git add .
git commit -m "Upgrade shared library to v1.1.0"
git push origin client/garage-mueller
```

### Rollback if Needed

```bash
cli upgrade-shared garage-mueller v1.0.0
```

### Different Versions per Client

Each client can use a different shared library version:

```json
{
  "clients": [
    { "name": "garage-mueller", "sharedLibVersion": "v1.0.0" },
    { "name": "garage-other", "sharedLibVersion": "v1.2.0" },
    { "name": "garage-legacy", "sharedLibVersion": "v0.9.0" }
  ]
}
```

This is safe because clients are completely isolated.

---
## CLI Commands Reference

All commands run from the coordinator branch root:

```bash
# Create new client (orphan branch + checkout)
cli create <name>

# Checkout existing client
cli checkout <name>

# Close (remove) client worktrees
cli close <name>
cli close --all

# Upgrade shared library version
cli upgrade-shared <client> <version-tag>

# List all clients (checked out + available)
cli list
cli list --checked-out-only
cli list --available-only

# Validate client structure
cli validate [client-name]
```

---

##  Workflow Best Practices

1. **Create once, checkout many times:**
   - `cli create` sets up the orphan branch
   - `cli checkout` creates temporary worktrees

2. **Work on multiple clients in parallel:**
   - No need to switch branches or close clients
   - Each client gets its own `sites/<name>/` directory

3. **Commit client changes directly in worktrees:**
   ```bash
   cd sites/garage-mueller
   git add .
   git commit -m "Update homepage"
   git push origin client/garage-mueller
   ```

4. **Upgrade shared library strategically:**
   - Test in one client first
   - Roll out to other clients gradually
   - Keep legacy clients on older versions if needed

5. **Don't modify `src/shared/`:**
   - It's a read-only nested worktree
   - Changes go to the upstream shared-components repo

---

## Development

### Client Development

Each client is checked out with the shared library nested inside:

```bash
cd sites/garage-mueller

# Shared library is available at:
ls src/shared/components/
ls src/shared/layouts/
ls src/shared/styles/
```

Import shared components in client pages:

```astro
---
import BaseLayout from '@shared/layouts/BaseLayout.astro';
import Hero from '@shared/components/sections/Hero/v1/Hero.astro';
import Button from '@shared/components/ui/Button/v1/Button.astro';
---

<BaseLayout title="Home">
  <Hero {...heroData} />
</BaseLayout>
```

### Running Dev Server

```bash
cd sites/garage-mueller
npm run dev  # http://localhost:4321
```

### Building for Production

```bash
cd sites/garage-mueller
npm run build  # Output: dist/
```

---

## Project Structure (Checked Out Client)

When a client is checked out, the structure looks like:

```
sites/garage-mueller/          # Client worktree (client/garage-mueller branch)
├── src/
│   ├── pages/                 # File-based routing
│   │   ├── index.astro        # Redirects to default language
│   │   ├── de/                # German pages
│   │   │   ├── index.astro
│   │   │   └── index.json     # German content (colocated)
│   │   ├── fr/                # French pages
│   │   └── it/                # Italian pages
│   └── i18n/
│       └── utils.ts           # i18n utilities (per-client config)
├── public/
│   └── images/                # Client-specific images
├── src/
│   └── shared/                # Shared library (pinned version)
│       ├── components/        # Versioned components (v1/, v2/)
│       │   ├── sections/      # Hero, ContactBlock, etc.
│       │   ├── ui/            # Button, Card, Input, etc.
│       │   └── site/          # Header, Footer, Container
│       ├── layouts/           # BaseLayout.astro
│       ├── styles/            # Global CSS, tokens
│       └── utils/             # i18n, animations
├── astro.config.ts            # Astro configuration
├── site.config.ts             # Client-specific config
├── package.json               # Client dependencies
├── tsconfig.json              # TypeScript config
└── README.md                  #  Client docs
```

**Key points:**
- `src/` contains client-specific code
- `src/shared/` is a **read-only** nested worktree from the shared-components repo
- Client has its own `node_modules/` and dependencies

---

## Content Management

Each client manages content in JSON files colocated with pages:

```
sites/garage-mueller/src/pages/
  de/
    index.json        # German content
    index.astro       # Imports ./index.json
  fr/
    index.json        # French content
    index.astro       

    index.astro       # Imports ./index.json
  it/
    index.json        # Italian content
    index.astro
```

**Example content file (`src/pages/de/index.json`):**

```json
{
  "hero": {
    "title": "Willkommen bei Garage Mueller",
    "subtitle": "Ihre Autowerkstatt des Vertrauens",
    "cta": { "text": "Termin buchen", "href": "/de/contact" }
  },
  "services": [...],
  "testimonials": [...]
}
```

Each client has **unique content** — no shared content across clients.

---

## Component Library

The shared component library (checked out from `colombalink/shared-components`) provides:

**Section Components:**
- `Hero` - Hero section with headline, CTA, image
- `FeatureGrid` - Grid of features (2/3/4 columns)
- `FeatureSplit` - Side-by-side feature + image
- `LogoCloud` - Partner/client logos
- `StatsRow` - Statistics counters
- `Testimonials` - Customer testimonials
- `FAQ` - Accordion FAQ
- `CTASection` - Call-to-action banner
- `ContactBlock` - Contact form/info

**Site Components:**
- `Header`, `Footer`, `Container`, `Section`

**UI Components:**
- `Button`, `Card`, `Badge`, `Input`, `Textarea`, `Accordion`

**Layouts:**
- `BaseLayout` - Base page layout with metadata, i18n support

**Versioning:**
- Components use explicit version folders (`v1/`, `v2/`)
- Old versions never removed (prevents breaks)
- See [COMPONENT-VERSIONING.md](COMPONENT-VERSIONING.md)

---

## Tech Stack

- **Framework:** Astro 6 (static site generation)
- **Content:** JSON files per language (i18n)
- **Styling:** Scoped CSS with design tokens
- **TypeScript:** Type-safe throughout
- **Git:** Orphan branches + nested worktrees
- **Shared Library:** Semantic versioning with git tags

---

## Documentation

### Essential Reading
- **[GIT-WORKFLOW.md](GIT-WORKFLOW.md)** — Git workflow with orphan branches and worktrees
- **[MIGRATION-GUIDE.md](MIGRATION-GUIDE.md)** — Migrating from old monorepo structure
- **[clients.json](clients.json)** — Client registry

### Component Library & Versioning
- [COMPONENT-VERSIONING.md](COMPONENT-VERSIONING.md) — Component versioning strategy
- [VERSIONING.md](VERSIONING.md) — Semantic versioning (shared library repo)
- [VERSIONING-QUICK-REF.md](VERSIONING-QUICK-REF.md) — Quick decision guide
- [DEPRECATION-GUIDE.md](DEPRECATION-GUIDE.md) — Deprecation strategy

### Multi-Agent Workflow
- [.github/AGENTS.md](.github/AGENTS.md) — Agent roles and guidelines
- [.github/MULTI-AGENT-QUICK-REF.md](.github/MULTI-AGENT-QUICK-REF.md) — Quick reference

---

## Troubleshooting

### Client won't checkout
```bash
# Check clients.json for typos
cat clients.json

# Verify branch exists
git branch --all | grep client/

# Force re-checkout
cli checkout garage-mueller --force
```

### Shared library version not found
```bash
cd sites/garage-mueller/src/shared
git fetch --tags
git tag -l | grep ^v
# Use an existing tag
```

### Uncommitted changes blocking operations
```bash
cd sites/garage-mueller
git status

# Commit or discard changes
git add .
git commit -m "WIP"
# OR
git reset --hard HEAD
```

See [GIT-WORKFLOW.md](GIT-WORKFLOW.md) for more troubleshooting.

---

## License

MIT
