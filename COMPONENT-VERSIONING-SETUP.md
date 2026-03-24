# Setting Up Component-Level Versioning

This guide shows how to implement component-level versioning in your project.

## Initial Setup

### Step 1: Create v1 Folder Structure

For the first implementation, copy current components to v1/ to establish the baseline:

```bash
cd /workspaces/next-pages/packages/shared/components

# Create v1 directories
mkdir -p sections/v1
mkdir -p ui/v1

# Copy current components to v1 (these become frozen/locked versions)
cp sections/*.astro sections/v1/
cp ui/*.astro ui/v1/
```

### Step 2: Add Version Documentation to Latest Components

Update each main component to document its version:

```astro
---
/**
 * Hero Component
 *
 * @version 1 (current)
 *
 * Version History:
 * - v1 (current): Initial version [also at v1/Hero.astro]
 *
 * For legacy sites that should never change:
 * Import from: '@colombalink/shared/components/sections/v1/Hero.astro'
 */

export interface Props {
  headline: string;
  text?: string;
  cta?: { text: string; href: string };
  secondaryCta?: { text: string; href: string };
  image?: string;
  variant?: 'default' | 'centered';
}

const { headline, text, cta, secondaryCta, image, variant = 'default' } = Astro.props;
---

<!-- packages/shared/components/sections/Hero.astro --><!-- Component implementation -->
```

### Step 3: Create Changeset

```bash
npm run changeset
```

```
🦋  Which packages would you like to include?
◉ @colombalink/shared

🦋  What kind of change is this?
● minor

🦋  Please enter a summary:
Added v1/ versioned component folders to support long-running sites. All components now available at both latest path and v1/ path for version locking.
```

### Step 4: Commit

```bash
git add .
git commit -m "feat: add component version locking support with v1 baseline"
npm run version
git commit -m "version packages"
```

## Making a Breaking Change

Let's say you want to rename Hero's `headline` prop to `heading`:

### Step 1: Keep v1 Untouched

The v1/Hero.astro is **frozen** - never edit it:

```astro
---
// This file is FROZEN - do not modify
// Version: 1.0.0 (Original)

export interface Props {
  headline: string; // Original prop name
  text?: string;
  // ...
}
---

<!-- packages/shared/components/sections/v1/Hero.astro -->
```

### Step 2: Update Main Component with Breaking Changes

```astro
---
/**
 * Hero Component
 *
 * @version 2 (current)
 *
 * Version History:
 * - v2 (current): Changed props from headline/text to heading/description
 * - v1: Original version [at v1/Hero.astro]
 *
 * Breaking Changes from v1:
 * - `headline` → `heading`
 * - `text` → `description`
 *
 * For sites using v1 API:
 * Import from: '@colombalink/shared/components/sections/v1/Hero.astro'
 */

export interface Props {
  heading: string; // NEW name
  description?: string; // NEW name
  cta?: { text: string; href: string };
  secondaryCta?: { text: string; href: string };
  image?: string;
  variant?: 'default' | 'centered';
}

const { heading, description, cta, secondaryCta, image, variant = 'default' } = Astro.props;
---

<!-- packages/shared/components/sections/Hero.astro -->
<Section variant="default" spacing="xl">
  <Container>
    <div class:list={['hero', `variant-${variant}`]}>
      <div class="hero-content" data-animate="fade">
        <h1 class="hero-headline">{heading}</h1>
        {description && <p class="hero-text">{description}</p>}
        <!-- rest of component -->
      </div>
    </div></Container
  ></Section
>
```

### Step 3: Create Changeset (MINOR, not MAJOR!)

```bash
npm run changeset
```

```
🦋  Which packages would you like to include?
◉ @colombalink/shared

🦋  What kind of change is this?
● minor  ← MINOR, because old version still works via v1/

🦋  Please enter a summary:
Hero component v2: Renamed props from headline/text to heading/description. Original v1 API preserved at v1/Hero.astro for legacy sites.
```

### Step 4: Document in CHANGELOG

The generated CHANGELOG will show:

````markdown
## [1.5.0] - 2026-03-24

### Added

- Hero component v2 with improved prop naming
  - `headline` → `heading`
  - `text` → `description`
  - Legacy v1 API preserved at `v1/Hero.astro`

### Migration Guide

**New sites:** Use latest import with new prop names:

```astro
import Hero from '@colombalink/shared/components/sections/Hero.astro';
<Hero heading="Welcome" description="Get started" />
```
````

**Existing sites:** Lock to v1 to avoid changes:

```astro
import Hero from '@colombalink/shared/components/sections/v1/Hero.astro';
<Hero headline="Welcome" text="Get started" />
```

## Client Site Patterns

### For New Sites (Active Development)

Use latest imports - you'll actively maintain these:

```astro
<!-- sites/garage-new/src/pages/index.astro -->import Hero from
'@colombalink/shared/components/sections/Hero.astro'; import ContactBlock from
'@colombalink/shared/components/sections/ContactBlock.astro';

<Hero heading="Welcome to Our Garage" description="..." />
<ContactBlock />
```

### For Legacy Sites (Long-Running, Don't Touch)

Lock all imports to v1 - these will never break:

```astro
<!-- sites/garage-mueller/src/pages/index.astro -->import Hero from
'@colombalink/shared/components/sections/v1/Hero.astro'; import ContactBlock from
'@colombalink/shared/components/sections/v1/ContactBlock.astro'; import Button from
'@colombalink/shared/components/ui/v1/Button.astro';

<!-- Uses original API forever -->
<Hero headline="Welcome" text="..." />
<ContactBlock />
```

### Migration Script for Existing Sites

To lock an existing site to v1:

```bash
# Run this in the site directory
find src -name "*.astro" -type f -exec sed -i 's|components/sections/|components/sections/v1/|g' {} \;
find src -name "*.astro" -type f -exec sed -i 's|components/ui/|components/ui/v1/|g' {} \;
```

Or use this Node.js script:

```javascript
// scripts/lock-to-v1.js
import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

async function lockToV1(dir) {
  const files = await readdir(dir, { withFileTypes: true });

  for (const file of files) {
    const path = join(dir, file.name);

    if (file.isDirectory()) {
      await lockToV1(path);
    } else if (file.name.endsWith('.astro')) {
      let content = await readFile(path, 'utf-8');

      // Replace imports to use v1
      content = content.replace(
        /from ['"]@colombalink\/shared\/components\/(sections|ui)\//g,
        "from '@colombalink/shared/components/$1/v1/"
      );

      await writeFile(path, content);
      console.log(`Locked: ${path}`);
    }
  }
}

lockToV1('./src');
```

Run it:

```bash
node scripts/lock-to-v1.js
```

## CLI Integration

Update your garage CLI to support component version locking:

```typescript
// tools/cli/src/commands/create.ts

interface CreateOptions {
  componentVersion?: 'latest' | 'v1' | 'v2';
  // ...
}

async function create(siteName: string, options: CreateOptions) {
  // ... existing code ...

  // Generate imports based on version
  const importPath =
    options.componentVersion === 'latest'
      ? '@colombalink/shared/components/sections'
      : `@colombalink/shared/components/sections/${options.componentVersion}`;

  // Use in templates...
}
```

Usage:

```bash
# Create with latest (default)
npm run cli create my-site

# Create locked to v1
npm run cli create my-site --component-version=v1
```

## When to Create a New Version

### Create v2 when:

- Renaming props
- Changing prop types (string → object)
- Changing component structure significantly
- Removing props

### Keep editing latest when:

- Adding optional props
- Fixing bugs
- Improving performance
- Adding CSS classes (non-breaking)

### Example Decision Tree

```
Q: Does this change break existing usage?
├─ No → Edit latest component, PATCH/MINOR bump
└─ Yes → Is this worth creating a new version?
    ├─ No → Find a backward-compatible way
    └─ Yes → Keep old version, create new in latest, MINOR bump
```

## Folder Structure After Setup

```
packages/shared/
  components/
    sections/
      Hero.astro                    # Latest (v2 or v3...)
      ContactBlock.astro            # Latest
      CTASection.astro              # Latest
      FAQ.astro                     # Latest
      FeatureGrid.astro             # Latest
      FeatureSplit.astro            # Latest
      LogoCloud.astro               # Latest
      StatsRow.astro                # Latest
      Testimonials.astro            # Latest
      v1/
        Hero.astro                  # Frozen at v1
        ContactBlock.astro          # Frozen at v1
        CTASection.astro            # Frozen at v1
        FAQ.astro                   # Frozen at v1
        FeatureGrid.astro           # Frozen at v1
        FeatureSplit.astro          # Frozen at v1
        LogoCloud.astro             # Frozen at v1
        StatsRow.astro              # Frozen at v1
        Testimonials.astro          # Frozen at v1
      v2/                           # Created as needed
        Hero.astro                  # Frozen at v2
        ContactBlock.astro          # Frozen at v2
    ui/
      Button.astro                  # Latest
      Card.astro                    # Latest
      Input.astro                   # Latest
      Textarea.astro                # Latest
      v1/
        Button.astro                # Frozen at v1
        Card.astro                  # Frozen at v1
        Input.astro                 # Frozen at v1
        Textarea.astro              # Frozen at v1
```

## Quick Commands

```bash
# Create initial v1 structure
mkdir -p packages/shared/components/sections/v1
mkdir -p packages/shared/components/ui/v1
cp packages/shared/components/sections/*.astro packages/shared/components/sections/v1/
cp packages/shared/components/ui/*.astro packages/shared/components/ui/v1/

# Lock existing site to v1
cd sites/your-site
find src -name "*.astro" -exec sed -i 's|/sections/|/sections/v1/|g' {} \;
find src -name "*.astro" -exec sed -i 's|/ui/|/ui/v1/|g' {} \;

# Create changeset for breaking change (MINOR!)
npm run changeset
# Select: minor
# Summary: "Component v2: [describe changes]. Legacy API at v1/"
```

## Summary

1. **Initial setup**: Copy components to v1/ to create baseline
2. **Breaking changes**: Update latest, keep v1/ frozen, bump MINOR
3. **New sites**: Import from latest paths
4. **Legacy sites**: Lock imports to v1/ paths
5. **Never**: Edit versioned (v1/, v2/) components after creation

This approach lets old sites run forever without breaking while new sites get the latest improvements!
