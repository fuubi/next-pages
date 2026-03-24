# Component Versioning Quick Reference

## When Making Changes to Components

### Should I create a new version?

```
┌─────────────────────────────────────────────────────────┐
│  Does this change break existing code?                  │
│  (Would old code stop working?)                         │
└────────────┬────────────────────────────────────────────┘
             │
        ┌────┴────┐
        │   NO    │  → Edit latest component directly
        │         │    Changeset: PATCH or MINOR
        │         │    Example: Add optional prop, fix bug
        └─────────┘
             
        ┌────┴────┐
        │   YES   │  → Is it a component?
        │         │
        └────┬────┘
             │
        ┌────┴────────────────────────────────────────┐
        │                                             │
   ┌────▼─────┐                               ┌──────▼──────┐
   │Component │                               │Not Component│
   │(.astro)  │                               │(util, API)  │
   └────┬─────┘                               └──────┬──────┘
        │                                            │
        │ CREATE NEW VERSION                         │ TRADITIONAL DEPRECATION
        │ 1. Keep old in v1/                         │ 1. Mark as @deprecated
        │ 2. Update latest                           │ 2. Wait 1-2 versions
        │ 3. Changeset: MINOR                        │ 3. Remove in MAJOR
        │                                            │ 4. Changeset: varies
        │                                            │
        └────────────────────────────────────────────┘
```

## Decision Matrix

| Change Type | Component | Utility/API | Version Bump |
|-------------|-----------|-------------|--------------|
| Add optional prop | Edit latest | Edit in place | MINOR |
| Fix bug | Edit latest | Edit in place | PATCH |
| Add new feature | Edit latest | Edit in place | MINOR |
| Rename prop | Create v2, keep v1 | Deprecate | MINOR (component) / MAJOR (util) |
| Remove prop | Create v2, keep v1 | Deprecate | MINOR (component) / MAJOR (util) |
| Change prop type | Create v2, keep v1 | Deprecate | MINOR (component) / MAJOR (util) |
| Restructure | Create v2, keep v1 | Deprecate | MINOR (component) / MAJOR (util) |

## Import Patterns

### For Components

```astro
// ✅ Good: Latest (new/maintained sites)
import Hero from '@garage-sites/shared/components/sections/Hero.astro';

// ✅ Good: Locked version (legacy sites)
import Hero from '@garage-sites/shared/components/sections/v1/Hero.astro';

// ❌ Bad: Don't import from v2, v3 unless specifically needed
// (Usually just use latest or lock to v1)
```

### For Utilities

```typescript
// Latest only - no versioning
import { formatDate } from '@garage-sites/shared/utils/index.ts';
```

## Changeset Examples

### 1. Adding Optional Prop (Non-Breaking)

```bash
npm run changeset
# Type: minor
# Package: @garage-sites/shared
# Summary: Added optional 'variant' prop to Hero component
```

No version folder needed - just edit latest.

### 2. Renaming Prop (Breaking for Components)

```bash
# Keep v1/Hero.astro frozen
# Update Hero.astro with new prop names
# Add version history comment

npm run changeset
# Type: minor (yes, minor!)
# Package: @garage-sites/shared
# Summary: Hero v2: Renamed props from headline/text to heading/description. Legacy API at v1/Hero.astro
```

### 3. Renaming Utility Function (Breaking for Utils)

```bash
# Mark old function as @deprecated
# Create new function alongside it

npm run changeset
# Type: minor
# Package: @garage-sites/shared
# Summary: Deprecated formatDate(), use formatDateTime() instead. Will remove in v3.0.0
```

Later:
```bash
# Remove deprecated function

npm run changeset
# Type: major
# Package: @garage-sites/shared
# Summary: BREAKING: Removed deprecated formatDate() function
```

## File Structure

```
packages/shared/
  components/
    sections/
      Hero.astro              # Latest version (actively edited)
      ContactBlock.astro      # Latest version
      v1/
        Hero.astro            # Frozen - NEVER edit
        ContactBlock.astro    # Frozen - NEVER edit
      v2/                     # Created as needed
        Hero.astro            # Frozen after creation
        ContactBlock.astro    # Frozen after creation
  utils/
    index.ts                  # No versioning - use deprecation
    animations.ts             # No versioning - use deprecation
    i18n.ts                   # No versioning - use deprecation
```

## Real-World Scenarios

### Scenario 1: Bug Fix

**Task:** Hero component has wrong padding

```bash
# Just edit Hero.astro directly
vim packages/shared/components/sections/Hero.astro

npm run changeset
# Type: patch
# Summary: Fixed Hero component padding on mobile devices
```

**Result:** All sites get the fix on next update

### Scenario 2: New Optional Feature

**Task:** Add optional 'theme' prop to Button

```astro
<!-- Just edit Button.astro -->
export interface Props {
  theme?: 'light' | 'dark';  // New optional prop
  // ... existing props
}
```

```bash
npm run changeset
# Type: minor
# Summary: Added optional theme prop to Button component
```

**Result:** Backward compatible - old code still works

### Scenario 3: Breaking Component Change

**Task:** Hero needs complete redesign with new props

```bash
# Step 1: Ensure v1 exists (if not already)
mkdir -p packages/shared/components/sections/v1
cp packages/shared/components/sections/Hero.astro packages/shared/components/sections/v1/

# Step 2: Update latest Hero.astro with new design
vim packages/shared/components/sections/Hero.astro
# Add version history comment

# Step 3: Changeset
npm run changeset
# Type: minor
# Summary: Hero v2: Complete redesign with new prop structure. Legacy v1 at v1/Hero.astro
```

**Result:** 
- Old sites using v1 imports: Still work
- New sites using latest: Get new design
- Package version: 1.x.x → 1.y.0 (MINOR)

### Scenario 4: Breaking Utility Change

**Task:** Change formatDate() signature

```typescript
// utils/index.ts

/**
 * @deprecated Use formatDateTime() instead. Will be removed in v3.0.0
 * Migration: formatDate(date) → formatDateTime(date, 'short')
 */
export function formatDate(date: Date): string {
  return formatDateTime(date, 'short');
}

// New function
export function formatDateTime(date: Date, format: 'short' | 'long'): string {
  // Implementation
}
```

```bash
npm run changeset
# Type: minor
# Summary: Deprecated formatDate(). Use formatDateTime() instead. Will remove in v3.0.0
```

**Later (v3.0.0):**
```bash
# Remove formatDate completely

npm run changeset
# Type: major
# Summary: BREAKING: Removed deprecated formatDate() function
```

## Common Questions

**Q: Can I edit v1/Hero.astro to fix a bug?**  
A: No! v1 is frozen. If legacy sites need the fix, they should update their imports to use the latest or v2.

**Q: When should I create v2/?**  
A: When you make a breaking change to a component. The old version goes to v2/, and latest gets the new version.

**Q: How many versions should I keep?**  
A: Keep v1 always. Keep v2, v3 as long as any client uses them. Consider removing after 5+ years.

**Q: What if I want to delete v1 after 5 years?**  
A: That's a MAJOR version bump. Notify clients, give them time, then remove in next MAJOR.

**Q: Can utilities use version folders too?**  
A: No, they're harder to version at file level. Use traditional @deprecated approach.

**Q: What if a site uses both v1 and latest?**  
A: That's fine! Mix and match as needed:
```astro
import Hero from '@garage-sites/shared/components/sections/v1/Hero.astro';
import Button from '@garage-sites/shared/components/ui/Button.astro';  // latest
```

## Cheat Sheet

```bash
# Create initial versioned baseline
mkdir -p packages/shared/components/{sections,ui}/v1
cp packages/shared/components/sections/*.astro packages/shared/components/sections/v1/
cp packages/shared/components/ui/*.astro packages/shared/components/ui/v1/

# Make a breaking component change
cp packages/shared/components/sections/Hero.astro packages/shared/components/sections/v1/
vim packages/shared/components/sections/Hero.astro  # Make breaking changes
npm run changeset  # Select: minor

# Lock existing site to v1
cd sites/existing-site
find src -name "*.astro" -exec sed -i 's|/sections/|/sections/v1/|g' {} \;

# Create new site (uses latest by default)
npm run garage create new-site
```

## Summary

- **Components**: Use version folders (v1/, v2/) for breaking changes → MINOR bumps
- **Utilities**: Use @deprecated comments for breaking changes → MAJOR bumps
- **Bug fixes**: Always PATCH, edit in place
- **New features**: Usually MINOR, edit in place if non-breaking
- **Old sites**: Never break by locking imports to v1/
- **New sites**: Always use latest unless specific version needed
