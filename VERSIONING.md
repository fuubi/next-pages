# Semantic Versioning Guide

This monorepo uses [Changesets](https://github.com/changesets/changesets) for semantic versioning and changelog management.

> **Quick Start:** See [VERSIONING-QUICK-REF.md](VERSIONING-QUICK-REF.md) for a decision tree and examples.

## Overview

- **@colombalink/shared** - Core UI components and utilities
- **@colombalink/templates** - Template components
- **Sites** (garage-mueller, etc.) - Consumer applications (not versioned/published)

## Versioning Strategy

We use **component-level versioning** to support long-running client sites that should never break.

### Component-Level Versioning (Primary Strategy)

Instead of removing or breaking components, we keep all versions available through versioned import paths:

```astro
// Latest version (actively maintained sites) import Hero from
'@colombalink/shared/components/sections/Hero.astro'; // Locked version (legacy sites that
shouldn't be touched) import Hero from '@colombalink/shared/components/sections/v1/Hero.astro';
```

**This means:**

- Old sites **never break** - they import from `v1/`, `v2/`, etc.
- Most version bumps are **MINOR** (new component versions added)
- **MAJOR** bumps are rare (only for fundamental package changes)

**See [COMPONENT-VERSIONING.md](COMPONENT-VERSIONING.md) for complete details.**

## Semantic Versioning Rules

With component-level versioning, the rules change:

- **MAJOR** (1.0.0 → 2.0.0): Rare - only for removing very old versions (5+ years), changing build system, or peer dependencies
- **MINOR** (1.0.0 → 1.1.0): New features, new component versions (even with breaking API changes at component level)
- **PATCH** (1.0.0 → 1.0.1): Bug fixes to existing components

### What Triggers Version Bumps

#### MINOR (Most Common)

- Adding new components
- Creating new version of existing component (even with breaking changes)
- Adding optional props to existing components
- New utilities or styles

#### PATCH

- Bug fixes in existing components
- TypeScript type corrections
- Performance improvements
- Accessibility fixes

#### MAJOR (Rare)

- Removing versioned component folders after 5+ years
- Changing peer dependencies (Astro version, etc.)
- Fundamental build system changes
- Removing entire feature sets

## Workflow

### 1. Making Changes

When you make changes to `@colombalink/shared` or `@colombalink/templates`:

```bash
# Make your code changes first
# Then create a changeset
npm run changeset
```

This will prompt you to:

1. Select which packages changed
2. Choose the version bump type (major/minor/patch)
3. Write a summary of the changes

### 2. Changeset Format

A changeset file is created in `.changeset/` with your changes:

```md
---
'@colombalink/shared': minor
---

Added new ContactForm component with validation
```

**Best Practices:**

- One changeset per logical change or PR
- Write clear, user-focused summaries (not implementation details)
- Multiple packages can be included in one changeset if they're related

### 3. Versioning Packages

When ready to release (typically in CI/CD or before publishing):

```bash
# This updates package.json versions and generates CHANGELOGs
npm run version
```

This will:

- Bump versions in package.json files
- Update or create CHANGELOG.md files
- Delete consumed changeset files
- Commit the version changes

### 4. Publishing

```bash
# Build packages and publish to npm
npm run release
```

**Note:** Update the `build` script in root package.json with your actual build command.

## Examples

### Example 1: Adding a New Component

```bash
# 1. Create the new Button component in packages/shared/components/ui/
# 2. Create a changeset
npm run changeset

# Select: @colombalink/shared
# Type: minor
# Summary: "Added new Button component with primary and secondary variants"
```

### Example 2: Breaking Change

```bash
# 1. Rename Hero component prop from 'title' to 'heading'
# 2. Create a changeset
npm run changeset

# Select: @colombalink/shared
# Type: major
# Summary: "BREAKING: Renamed Hero component 'title' prop to 'heading'"
```

### Example 3: Bug Fix

```bash
# 1. Fix accessibility issue in Footer component
# 2. Create a changeset
npm run changeset

# Select: @colombalink/shared
# Type: patch
# Summary: "Fixed keyboard navigation in Footer component"
```

## CI/CD Integration

### Automated Version PRs

Add this to your GitHub Actions workflow:

```yaml
name: Version
on:
  push:
    branches:
      - main

jobs:
  version:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - name: Create Release Pull Request
        uses: changesets/action@v1
        with:
          version: npm run version
          publish: npm run release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Client Sites Usage

Client sites use the workspace protocol during development:

```json
{
  "dependencies": {
    "@colombalink/shared": "workspace:*"
  }
}
```

When published, this automatically resolves to the correct version:

```json
{
  "dependencies": {
    "@colombalink/shared": "^1.2.0"
  }
}
```

## Pre-releases

For beta testing:

```bash
# Enter pre-release mode
npx changeset pre enter beta

# Create changelogs
npm run changeset

# Version as beta
npm run version
# This creates versions like 1.1.0-beta.0

# Publish beta
npm run release

# Exit pre-release mode
npx changeset pre exit
```

## Commands Reference

| Command                             | Purpose                                       |
| ----------------------------------- | --------------------------------------------- |
| `npm run changeset`                 | Create a new changeset                        |
| `npm run version`                   | Bump versions and update CHANGELOGs           |
| `npm run release`                   | Build and publish packages                    |
| `npx changeset status`              | Check which packages have unpublished changes |
| `npx changeset status --since=main` | Check changes since main branch               |

## Deprecating Components

**IMPORTANT:** With multiple clients using your components, you cannot simply remove or rename components without breaking their sites.

### Safe Deprecation Process

1. **Mark as deprecated (MINOR)** - Add `@deprecated` JSDoc, keep it working
2. **Wait 1-2 major versions** - Give clients 3-6 months to migrate
3. **Remove in MAJOR version** - Only after sufficient warning

### Example: Renaming Hero → HeroSection

```astro
---
/**
 * @deprecated Use HeroSection instead. Will be removed in v3.0.0
 * Migration: Replace title prop with heading
 */
import HeroSection from './HeroSection.astro';
---

<!-- v1.9.0: Deprecate (MINOR) --><!-- Hero.astro -->
<HeroSection {...Astro.props} />
```

```bash
# v1.9.0
npm run changeset
# Type: minor
# Summary: "Deprecated Hero component. Use HeroSection instead. Will be removed in v3.0.0"

# v2.0.0 - Keep both components (no removal yet)
# v3.0.0 - Remove Hero (MAJOR breaking change)
npm run changeset
# Type: major
# Summary: "BREAKING: Removed deprecated Hero component"
```

**See [DEPRECATION-GUIDE.md](DEPRECATION-GUIDE.md) for complete strategies and patterns.**

## Best Practices

1. **Always create changesets** - Don't manually edit package.json versions
2. **One changeset per PR** - Makes it easier to track what changed
3. **Clear descriptions** - Write for developers consuming your packages
4. **Test before publishing** - Use pre-releases for major changes
5. **Review CHANGELOGs** - Check generated changelogs before publishing
6. **Coordinate breaking changes** - Communicate major version bumps with clients
7. **Never remove components immediately** - Always deprecate first (see [DEPRECATION-GUIDE.md](DEPRECATION-GUIDE.md))
8. **Give migration time** - Wait 3-6 months before removing deprecated features

## Migration for Existing Clients

When clients migrate from workspace protocol to actual versions:

```bash
# In client site
npm install @colombalink/shared@latest
npm install @colombalink/templates@latest
```

## Tips

- **Forgot to create a changeset?** - You can create it after the PR is merged
- **Need to modify a changeset?** - Edit the `.md` files in `.changeset/` directly
- **Want to skip versioning a package?** - Don't select it when creating changeset
- **Made a mistake?** - Delete the changeset file and create a new one

## Support

For questions about versioning strategy or issues with changesets, check:

- [Changesets documentation](https://github.com/changesets/changesets/tree/main/docs)
- [Semantic Versioning specification](https://semver.org/)
