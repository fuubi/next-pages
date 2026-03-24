# Semantic Versioning Guide

This monorepo uses [Changesets](https://github.com/changesets/changesets) for semantic versioning and changelog management.

## Overview

- **@garage-sites/shared** - Core UI components and utilities
- **@garage-sites/templates** - Template components
- **Sites** (garage-mueller, etc.) - Consumer applications (not versioned/published)

## Semantic Versioning Rules

Follow [semver](https://semver.org/) principles:

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes that require consumers to update their code
- **MINOR** (1.0.0 → 1.1.0): New features that are backward compatible
- **PATCH** (1.0.0 → 1.0.1): Bug fixes and minor improvements

### Breaking Changes Examples

- Removing or renaming a component
- Changing component prop names or types
- Removing exported utilities
- Changing CSS class names that consumers rely on
- Modifying public API signatures

### New Features Examples

- Adding new components
- Adding new optional props to existing components
- Adding new utility functions
- New CSS variables or classes (non-breaking)

### Bug Fixes Examples

- Fixing component rendering issues
- Correcting TypeScript types
- Fixing accessibility issues
- Performance improvements (non-breaking)

## Workflow

### 1. Making Changes

When you make changes to `@garage-sites/shared` or `@garage-sites/templates`:

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
'@garage-sites/shared': minor
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

# Select: @garage-sites/shared
# Type: minor
# Summary: "Added new Button component with primary and secondary variants"
```

### Example 2: Breaking Change

```bash
# 1. Rename Hero component prop from 'title' to 'heading'
# 2. Create a changeset
npm run changeset

# Select: @garage-sites/shared
# Type: major
# Summary: "BREAKING: Renamed Hero component 'title' prop to 'heading'"
```

### Example 3: Bug Fix

```bash
# 1. Fix accessibility issue in Footer component
# 2. Create a changeset
npm run changeset

# Select: @garage-sites/shared
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
    "@garage-sites/shared": "workspace:*"
  }
}
```

When published, this automatically resolves to the correct version:

```json
{
  "dependencies": {
    "@garage-sites/shared": "^1.2.0"
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

## Best Practices

1. **Always create changesets** - Don't manually edit package.json versions
2. **One changeset per PR** - Makes it easier to track what changed
3. **Clear descriptions** - Write for developers consuming your packages
4. **Test before publishing** - Use pre-releases for major changes
5. **Review CHANGELOGs** - Check generated changelogs before publishing
6. **Coordinate breaking changes** - Communicate major version bumps with clients

## Migration for Existing Clients

When clients migrate from workspace protocol to actual versions:

```bash
# In client site
npm install @garage-sites/shared@latest
npm install @garage-sites/templates@latest
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
