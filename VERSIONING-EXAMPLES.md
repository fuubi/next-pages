# Example Changeset Workflow

This document shows practical examples of creating changesets for different scenarios.

## Example 1: Adding a New Component

Let's say you've just added a new `Card` component to `@colombalink/shared`:

```bash
npm run changeset
```

**Interactive prompts:**

```
🦋  Which packages would you like to include?
◉ @colombalink/shared
◯ @colombalink/templates

🦋  What kind of change is this for @colombalink/shared?
○ major (breaking)
● minor (feature)
○ patch (fix)

🦋  Please enter a summary for this change:
Added Card component with light and dark variants
```

**Generated changeset** (`.changeset/happy-cards-smile.md`):

```markdown
---
'@colombalink/shared': minor
---

Added Card component with light and dark variants
```

## Example 2: Bug Fix

Fixed a styling issue in the `Button` component:

```bash
npm run changeset
```

**Generated changeset:**

```markdown
---
'@colombalink/shared': patch
---

Fixed button hover state in dark mode
```

## Example 3: Breaking Change (Component Versioning)

Adding a new version of the `Hero` component with renamed props:

```bash
# First, create the new version
mkdir -p packages/shared/components/sections/Hero/v2
cp packages/shared/components/sections/Hero/v1/Hero.astro packages/shared/components/sections/Hero/v2/Hero.astro

# Edit v2/Hero.astro with breaking changes

# Then create changeset
npm run changeset
```

**Interactive prompts:**

```
🦋  What kind of change is this?
○ major (breaking)
● minor (feature)  ← YES, minor! We use component-level versioning
○ patch (fix)

🦋  Please enter a summary:
Added Hero v2 with renamed props (title→heading). v1 remains at Hero/v1/
```

**Generated changeset:**

```markdown
---
'@colombalink/shared': minor
---

Added Hero v2 with renamed props. Breaking changes: 'title' prop renamed to 'heading'.

v1 remains available at Hero/v1/ for legacy sites.
Migration: Update imports from Hero/v1/ to Hero/v2/ and change props.
```

**Key point**: With component-level versioning, breaking changes to components are MINOR bumps because old versions remain available.

## Example 4: Multiple Packages

Added a new hero template that uses shared components:

```bash
npm run changeset
```

**Interactive prompts:**

```
🦋  Which packages would you like to include?
◉ @colombalink/shared
◉ @colombalink/templates

🦋  What kind of change is this for @colombalink/shared?
● patch

🦋  What kind of change is this for @colombalink/templates?
● minor
```

**Generated changeset:**

```markdown
---
'@colombalink/shared': patch
'@colombalink/templates': minor
---

Added SplitHero template with improved mobile layout
```

## Versioning & Publishing

### When You're Ready to Release

```bash
# Step 1: Apply all changesets
npm run version
```

This will:

- Read all `.changeset/*.md` files
- Update `package.json` versions
- Generate/update `CHANGELOG.md` files
- Delete the consumed changeset files

### Review Changes

Check the git diff:

```bash
git diff
```

You should see:

- Updated versions in `package.json` files
- New entries in `CHANGELOG.md` files
- Deleted changeset files

### Commit and Publish

```bash
# Commit the version changes
git add .
git commit -m "Version packages"

# Publish to npm
npm run release
```

## Tips

### Skip Versioning Temporarily

If you want to accumulate multiple changesets before versioning:

```bash
npm run changeset  # Create changeset 1
# ... more changes ...
npm run changeset  # Create changeset 2
# ... more changes ...
npm run changeset  # Create changeset 3

# Later, version all at once
npm run version
```

### Check What Will Be Released

```bash
npx changeset status --verbose
```

### Pre-release (Beta/Alpha)

```bash
# Enter pre-release mode
npx changeset pre enter beta

# Create changesets as normal
npm run changeset

# Version creates beta versions (1.1.0-beta.0)
npm run version

# Publish beta
npm run release

# Exit pre-release mode when done
npx changeset pre exit
```

## Real-World Scenario

Let's walk through a complete feature addition:

### 1. Make Changes

```bash
# Create new ContactForm component
# Edit packages/shared/components/ui/ContactForm.astro
```

### 2. Create Changeset

```bash
npm run changeset

# Select: @colombalink/shared
# Type: minor
# Summary: "Added ContactForm component with email validation and reCAPTCHA support"
```

### 3. Commit

```bash
git add .
git commit -m "feat: add ContactForm component"
git push
```

### 4. Version (when ready to release)

```bash
npm run version

# Review changes
git diff

# Commit version
git commit -m "Version packages"
git push
```

### 5. Publish

```bash
npm run release
```

### 6. Client Update

Clients can now update:

```bash
npm install @colombalink/shared@latest
```

## Common Mistakes to Avoid

❌ **Don't:** Manually edit package.json versions
✅ **Do:** Always use changesets

❌ **Don't:** Forget to create changesets before versioning
✅ **Do:** Create changesets for every meaningful change

❌ **Don't:** Create massive changesets with many unrelated changes
✅ **Do:** One changeset per logical feature/fix

❌ **Don't:** Write vague summaries like "updated component"
✅ **Do:** Write clear, specific summaries like "Fixed button hover state in dark mode"
