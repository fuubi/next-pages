# Component Deprecation Guide

> **Note:** This project now uses **component-level versioning** as the primary strategy (see [COMPONENT-VERSIONING.md](COMPONENT-VERSIONING.md)). This means most breaking changes become new versions (v1/, v2/) instead of deprecations. This guide is kept for reference and for scenarios where traditional deprecation is still useful (utilities, non-component APIs, etc.).

## When to Use This Guide

Use traditional deprecation for:

- Utility functions and helper methods
- Build tools and CLI features
- Internal APIs that don't fit versioned folders
- One-off migrations that don't warrant a new version

For components, prefer **component-level versioning** instead (see [COMPONENT-VERSIONING.md](COMPONENT-VERSIONING.md)).

## The Safe Deprecation Process

### Phase 1: Mark as Deprecated (MINOR version)

When you want to replace a component, **don't remove it** - mark it as deprecated first:

```astro
---
/**
 * @deprecated Use NewHero instead. This component will be removed in v3.0.0
 *
 * Migration guide:
 * - Replace `<Hero title="..." />` with `<NewHero heading="..." />`
 * - The `subtitle` prop is now `description`
 *
 * @see {@link ./NewHero.astro}
 */

// Old implementation still works
const { title, subtitle } = Astro.props;
---
```

**Create a changeset:**

```bash
npm run changeset
# Type: minor
# Summary: "Deprecated Hero component in favor of NewHero. Migration guide included in docs."
```

This is a **MINOR** version bump because:

- Nothing breaks for existing users
- You're adding a new component (NewHero)
- The old component still works

### Phase 2: Keep Both Versions (1-2 major versions)

Keep the old component working for at least one major version cycle:

```
v1.5.0: NewHero added, Hero deprecated
v2.0.0: Both Hero and NewHero exist
v2.1.0: Both still exist
v3.0.0: Hero removed (BREAKING)
```

This gives clients time to migrate.

### Phase 3: Remove Old Component (MAJOR version)

Only after sufficient time (recommend 3-6 months), remove the old component:

**Create a changeset:**

```bash
npm run changeset
# Type: major
# Summary: "BREAKING: Removed deprecated Hero component. Use NewHero instead. See migration guide in v1.5.0 release notes."
```

## Deprecation Patterns

### Pattern 1: Renaming a Component

**Bad approach:**

```bash
# ❌ Don't do this!
git mv Hero.astro NewHero.astro
# Breaks all clients immediately
```

**Good approach:**

```astro
---
/**
 * @deprecated Use NewHero instead. Will be removed in v3.0.0
 */
import NewHero from './NewHero.astro';

// Forward all props to new component
const props = Astro.props;
---

<!-- packages/shared/components/sections/Hero.astro -->
<NewHero {...props} />
```

Now the old import path still works!

### Pattern 2: Changing Component Props

When you need to change prop names:

```astro
---
export interface Props {
  /** @deprecated Use `heading` instead. Will be removed in v3.0.0 */
  title?: string;
  heading?: string;

  /** @deprecated Use `description` instead. Will be removed in v3.0.0 */
  subtitle?: string;
  description?: string;
}

const {
  title,
  heading = title, // Fallback to old prop
  subtitle,
  description = subtitle,
} = Astro.props;

// Warn in development
if (import.meta.env.DEV) {
  if (title) console.warn('Hero: prop "title" is deprecated, use "heading" instead');
  if (subtitle) console.warn('Hero: prop "subtitle" is deprecated, use "description" instead');
}
---

<!-- packages/shared/components/sections/Hero.astro -->
<section>
  <h1>{heading}</h1>
  <p>{description}</p>
</section>
```

**Changeset:**

```bash
npm run changeset
# Type: minor
# Summary: "Added new `heading` and `description` props to Hero. Old `title` and `subtitle` props are deprecated."
```

### Pattern 3: Splitting a Component

When you want to split one component into multiple specialized ones:

```astro
---
/**
 * @deprecated Use FeatureGrid or FeatureSplit instead. Will be removed in v3.0.0
 *
 * Migration:
 * - For grid layouts: Use FeatureGrid
 * - For split/side-by-side layouts: Use FeatureSplit
 */

const { layout = 'grid' } = Astro.props;

// Route to new components based on old layout prop
if (layout === 'split') {
  const FeatureSplit = await import('./FeatureSplit.astro');
  // Render new component
}
---

<!-- Old: packages/shared/components/sections/Feature.astro -->
```

### Pattern 4: Removing Unused/Dangerous Components

For components that are broken or insecure:

```astro
---
/**
 * @deprecated This component has security issues and will be removed in v2.0.0
 * Use ContactBlock instead, which includes proper CSRF protection.
 */

// Add visual warning in dev mode
const showWarning = import.meta.env.DEV;
---

{
  showWarning && (
    <div style="border: 3px solid red; padding: 1rem; background: #fee;">
      ⚠️ WARNING: ContactForm is deprecated due to security issues. Use ContactBlock instead.
    </div>
  )
}

<!-- Original component still works but shows warning -->
```

## Version Planning Example

Let's say you want to rename `Hero` to `HeroSection`:

### v1.8.0 (Current)

```
components/sections/
  Hero.astro              # Original
```

### v1.9.0 (Deprecation - MINOR)

```
components/sections/
  Hero.astro              # Deprecated, forwards to HeroSection
  HeroSection.astro       # New component
```

Changeset:

```markdown
---
'@garage-sites/shared': minor
---

Added new HeroSection component with improved API. Hero component is deprecated and will be removed in v3.0.0. See migration guide in docs.
```

### v2.0.0 (First major - keep both)

```
components/sections/
  Hero.astro              # Still works
  HeroSection.astro       # Recommended
```

Changeset:

```markdown
---
'@garage-sites/shared': major
---

BREAKING: Removed deprecated ContactForm component. Other deprecated components (Hero) remain for one more major version.
```

### v3.0.0 (Remove deprecated - MAJOR)

```
components/sections/
  HeroSection.astro       # Only this remains
```

Changeset:

```markdown
---
'@garage-sites/shared': major
---

BREAKING: Removed deprecated Hero component. Use HeroSection instead. Clients should have migrated in v1.9.0.
```

## Communication Strategy

### 1. Document in CHANGELOG

When you deprecate, the CHANGELOG should clearly state:

```markdown
## [1.9.0] - 2026-03-24

### Added

- New `HeroSection` component with improved accessibility

### Deprecated

- `Hero` component - Use `HeroSection` instead
  - Migration: Replace `<Hero title="..." />` with `<HeroSection heading="..." />`
  - Will be removed in: v3.0.0 (estimated Q2 2026)
  - Reason: Improved prop naming and accessibility
```

### 2. Create Migration Guides

Add a migration guide file:

````markdown
<!-- packages/shared/docs/migrations/hero-to-herosection.md -->

# Migrating from Hero to HeroSection

## Why?

HeroSection has better accessibility and cleaner prop names.

## Before:

```astro
<Hero title="Welcome" subtitle="Get started" />
```
````

## After:

```astro
<HeroSection heading="Welcome" description="Get started" />
```

## Breaking Changes:

- `title` → `heading`
- `subtitle` → `description`

````

### 3. Email/Notify Clients

When you deprecate something:
1. Email all clients with the migration guide
2. Give them a timeline (e.g., "remove in 6 months")
3. Offer support for migration if needed

## Using TypeScript for Deprecation

Add proper TypeScript deprecation warnings:

```typescript
// packages/shared/components/sections/Hero.astro
---
export interface Props {
  /**
   * @deprecated Use heading instead. Will be removed in v3.0.0
   * @see heading
   */
  title?: string;

  /** The main heading text */
  heading?: string;
}
---
````

Now in client code, their IDE will show deprecation warnings!

## Gradual Feature Removal

For large breaking changes, use feature flags:

```astro
---
const {
  useNewLayout = false, // Feature flag
} = Astro.props;

if (useNewLayout) {
  // New implementation
} else {
  // Old implementation (deprecated)
  if (import.meta.env.DEV) {
    console.warn('Old layout is deprecated. Set useNewLayout={true}');
  }
}
---
```

Then in phases:

1. v1: `useNewLayout={false}` by default
2. v2: `useNewLayout={true}` by default (MAJOR)
3. v3: Remove flag entirely, only new layout exists (MAJOR)

## Handling Client-Specific Components

If a client needs a specific component that others don't use:

### Option 1: Keep in Templates (Recommended)

```
packages/templates/
  hero/
    Classic.astro      # Used by multiple clients
    Minimal.astro      # Used by multiple clients
    Custom.astro       # Only garage-mueller uses
```

Don't remove `Custom.astro` even if only one client uses it - it's part of the public API.

### Option 2: Move to Client Site

If truly one-off, move it to the client's site:

```
sites/garage-mueller/
  src/
    components/
      CustomHero.astro  # Client-specific, not in shared
```

## TL;DR - Simple Rules

1. **Never remove components immediately** - Always deprecate first
2. **Wait 1-2 major versions** before removing (3-6 months)
3. **Use JSDoc @deprecated tags** - Helps IDEs show warnings
4. **Create migration guides** - Tell clients exactly what to do
5. **Keep changelogs clear** - Document what's deprecated and when it'll be removed
6. **Communicate with clients** - Email them about upcoming removals

## Deprecation Checklist

When deprecating a component:

- [ ] Add `@deprecated` JSDoc comment with removal version
- [ ] Add migration instructions in the comment
- [ ] Keep the old component working (don't break it)
- [ ] Create the new/replacement component
- [ ] Create changeset (MINOR version)
- [ ] Add migration guide to docs
- [ ] Email clients about the deprecation
- [ ] Plan removal for future MAJOR version (6+ months out)
- [ ] Update README or main docs with deprecation notice
