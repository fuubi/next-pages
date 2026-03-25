# Component Versioning Strategy

This project uses **git-tag-only versioning** for the shared component library.

## Philosophy

Components are versioned at the **repository level** using git tags, not at the individual component level. This provides a simpler mental model while leveraging the orphan branch architecture.

## How It Works

### Version Pinning via Git Tags

Each client site pins to a specific git tag of the `shared/components` branch:

```json
// clients.json
{
  "clients": [
    { "name": "garage-mueller", "sharedLibVersion": "v1.0.0" },
    { "name": "garage-other", "sharedLibVersion": "v1.1.0" }
  ]
}
```

When you checkout a client, the CLI extracts that specific version:
```bash
cli checkout garage-mueller
# Extracts shared components @ v1.0.0 into sites/garage-mueller/src/shared/
```

### Component Structure

Components live at direct paths without version folders:

```
packages/shared/components/
  sections/
    Hero/
      Hero.astro           # No v1/ or v2/ folders
    ContactBlock/
      ContactBlock.astro
  ui/
    Button/
      Button.astro
```

### Import Patterns

```astro
---
import Hero from '@shared/components/sections/Hero/Hero.astro';
import Button from '@shared/components/ui/Button/Button.astro';
---
```

## Semantic Versioning

Git tags follow semantic versioning:

- **PATCH (1.0.0 → 1.0.1)**: Bug fixes, no API changes
- **MINOR (1.0.0 → 1.1.0)**: New components, new optional props
- **MAJOR (1.0.0 → 2.0.0)**: Breaking changes to existing components

## Making Changes

### Non-Breaking Changes (MINOR/PATCH)

Add new features or fix bugs:

```bash
cd packages/shared
# Make changes to components
git add .
git commit -m "feat: add new Footer variant"
git tag v1.1.0
git push origin shared/components --tags
```

Clients can upgrade gradually:
```bash
cli upgrade-shared garage-mueller v1.1.0
```

### Breaking Changes (MAJOR)

When you need to make breaking changes:

```bash
cd packages/shared
# Make breaking changes to Hero component
git add .
git commit -m "feat!: Hero now uses 'heading' prop instead of 'headline'

BREAKING CHANGE: Renamed prop from headline to heading"
git tag v2.0.0
git push origin shared/components --tags
```

Clients stay on v1.x.x until they're ready to migrate:
```bash
# Client stays on v1.0.0 - no changes needed
# When ready to upgrade:
cli upgrade-shared garage-mueller v2.0.0
# Test, fix breaking changes, commit
```

## Migration Path for Clients

When upgrading across major versions, clients can:


```astro
---
// During migration from v1 to v2
// Temporarily copy old component
import OldHero from './components/OldHero.astro';  // Copied from v1.0.0
import NewButton from '@shared/components/ui/Button/Button.astro';  // From v2.0.0
---
```

## Benefits of Git-Tag-Only Versioning

✅ **Simple**: One versioning system (git tags), not two (git + folders)  
✅ **Clear**: Version is explicit in clients.json and checkout command  
✅ **Flexible**: Each client can use any version, upgrade at their pace  
✅ **Testable**: Easy to rollback if issues are found  
✅ **Clean**: No nested version folders cluttering the codebase

## When to Create New Versions

### PATCH (1.0.x)
- Bug fixes in existing components
- Performance improvements
- Accessibility fixes
- Documentation updates

### MINOR (1.x.0)
- New components added
- New optional props on existing components
- New utility functions
- Backward-compatible enhancements

### MAJOR (x.0.0)
- Removing props from components
- Renaming existing props
- Changing required props
- Removing components (rare)
- Changing behavior in breaking ways

## Example Workflow

### Scenario: Add New Component

```bash
cd packages/shared

# Add new Carousel component
mkdir -p components/ui/Carousel
# Create Carousel.astro

git add .
git commit -m "feat: add Carousel component"
git tag v1.1.0
git push origin shared/components --tags
```

Clients can now upgrade:
```bash
cli upgrade-shared garage-mueller v1.1.0
```

### Scenario: Breaking Change to Hero

```bash
cd packages/shared

# Edit Hero Component with breaking changes
vim components/sections/Hero/Hero.astro

git add .
git commit -m "feat!: update Hero props

BREAKING CHANGE: Renamed 'headline' to 'heading' for consistency"
git tag v2.0.0
git push origin shared/components --tags
```

Clients decide when to upgrade:
```bash
# garage-mueller stays on v1.0.0 (still works)
# garage-other upgrades when ready
cli upgrade-shared garage-other v2.0.0
cd sites/garage-other
# Fix imports, test, commit
```

## Best Practices

1. **Document breaking changes** in commit messages using conventional commits
2. **Test thoroughly** before tagging new versions
3. **Use semantic versioning** strictly
4. **Communicate upgrades** to client developers
5. **Don't force upgrades** - let clients migrate at their pace
6. **Tag thoughtfully** - tags are permanent milestones
