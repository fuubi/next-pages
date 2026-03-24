# Component-Level Versioning Strategy

For long-running client sites that you don't want to touch, we use **component-level versioning** instead of package-level breaking changes.

## Philosophy

**Never remove or break components.** Old sites stay working forever by importing from versioned paths.

## Structure

```
packages/shared/components/
  sections/
    Hero.astro                    # Latest (default)
    ContactBlock.astro            # Latest
    v1/
      Hero.astro                  # Original Hero - never changes
      ContactBlock.astro          # Original ContactBlock
    v2/
      Hero.astro                  # Second iteration
      ContactBlock.astro
```

## Import Patterns

### New Sites (Use Latest)

```astro
import Hero from '@colombalink/shared/components/sections/Hero.astro';
```

### Lock to Specific Version

```astro
import Hero from '@colombalink/shared/components/sections/v1/Hero.astro';
```

### Old Sites Keep Working

```astro
// Site created in 2024 - still imports v1 import Hero from
'@colombalink/shared/components/sections/v1/Hero.astro'; // Never breaks, even as we add v2, v3,
etc.
```

## Workflow

### When Creating a Breaking Change

Instead of updating Hero.astro, create a new version:

```bash
# Step 1: Move current version to versioned folder (if not already done)
mkdir -p packages/shared/components/sections/v1
cp packages/shared/components/sections/Hero.astro packages/shared/components/sections/v1/

# Step 2: Update the main Hero.astro with breaking changes
# Edit packages/shared/components/sections/Hero.astro

# Step 3: Add note in main component
```

```astro
---
/**
 * Hero Component (Latest)
 *
 * Version History:
 * - v2 (current): Changed props from headline/text to heading/description
 * - v1: Original version at v1/Hero.astro
 *
 * For legacy sites, import from:
 * '@colombalink/shared/components/sections/v1/Hero.astro'
 */

export interface Props {
  heading: string; // New prop name
  description?: string; // New prop name
}
---

<!-- packages/shared/components/sections/Hero.astro -->
```

### Changesets for This Approach

**All component changes are MINOR:**

```bash
npm run changeset
# Type: minor (not major!)
# Summary: "Added Hero v2 with improved prop names (heading/description). Legacy v1 available at v1/Hero.astro"
```

**MAJOR bumps only for:**

- Removing very old versioned folders (after 5+ years)
- Changing build system or peer dependencies
- Fundamental breaking changes to the package structure

## Version Lifecycle

### Phase 1: Initial Release

```
v1.0.0
components/sections/
  Hero.astro
  ContactBlock.astro
```

### Phase 2: Breaking Change Needed (MINOR!)

```
v1.5.0  (MINOR, not MAJOR!)
components/sections/
  Hero.astro                 # Updated with breaking changes
  ContactBlock.astro
  v1/
    Hero.astro               # Original preserved
    ContactBlock.astro
```

**Changeset:**

```markdown
---
'@colombalink/shared': minor
---

Added Hero v2 with improved prop names. Original Hero preserved at v1/Hero.astro for legacy sites.

Breaking changes in latest Hero:

- `headline` → `heading`
- `text` → `description`

Migration:

- New sites: Use default import (gets latest)
- Existing sites: No action needed (already using v1 path or lock to v1)
```

### Phase 3: Another Breaking Change (Still MINOR!)

```
v1.8.0  (MINOR)
components/sections/
  Hero.astro                 # Newest version
  v1/
    Hero.astro               # Original
  v2/
    Hero.astro               # Previous version moved here
```

### Phase 4: Optional Cleanup After Years (MAJOR)

```
v2.0.0  (MAJOR - but rare!)
components/sections/
  Hero.astro                 # Latest (was v3)
  v2/
    Hero.astro               # Keep recent versions
  v3/
    Hero.astro
  # Removed v1 after 5+ years and confirmation no sites use it
```

## Package.json Structure

```json
{
  "name": "@colombalink/shared",
  "version": "1.8.5",
  "exports": {
    "./components/sections/*": "./components/sections/*",
    "./components/sections/v1/*": "./components/sections/v1/*",
    "./components/sections/v2/*": "./components/sections/v2/*",
    "./components/ui/*": "./components/ui/*",
    "./layouts/*": "./layouts/*",
    "./styles/*": "./styles/*",
    "./utils/*": "./utils/*"
  }
}
```

## Client Site Lock Patterns

### Option 1: Explicit Version Locking (Recommended for Long-Running Sites)

```astro
<!-- sites/example-client/src/pages/index.astro -->import Hero from
'@colombalink/shared/components/sections/v1/Hero.astro'; import ContactBlock from
'@colombalink/shared/components/sections/v1/ContactBlock.astro';

<!-- This site will NEVER break, even 10 years later -->
<Hero headline="Welcome" text="..." />
```

### Option 2: Latest Version (For Actively Maintained Sites)

```astro
<!-- sites/another-client/src/pages/index.astro -->import Hero from
'@colombalink/shared/components/sections/Hero.astro';

<!-- Gets latest - they actively update their code -->
<Hero heading="Welcome" description="..." />
```

### Option 3: Mixed Approach

```astro
<!-- Use latest for some, locked versions for others -->import Hero from
'@colombalink/shared/components/sections/Hero.astro'; // Latest import ContactBlock from
'@colombalink/shared/components/sections/v1/ContactBlock.astro'; // Locked
```

## Documentation in Components

Each latest component should document its version history:

````astro
---
/**
 * Hero Component
 *
 * @version 3 (current)
 *
 * Version History:
 * - v3 (current): Added variant prop, improved animations
 * - v2: Changed prop names (headline→heading, text→description) [at v2/Hero.astro]
 * - v1: Original version [at v1/Hero.astro]
 *
 * Breaking Changes from v2:
 * - Added required `variant` prop (default: 'default')
 *
 * Migration from v2:
 * ```diff
 * - <Hero heading="..." />
 * + <Hero heading="..." variant="default" />
 * ```
 *
 * For legacy sites: Import from v1/ or v2/ subdirectories
 */
---
````

## CLI Integration

Update your garage CLI to support version locking:

```bash
# Create new site with latest components
npm run cli create my-site

# Create site locked to v1 components
npm run cli create my-site --component-version=v1
```

This could generate imports like:

```astro
import Hero from '@colombalink/shared/components/sections/v1/Hero.astro';
```

## Real-World Example

### Scenario: Example Client (Created 2024)

**Initial setup (2024):**

```astro
import Hero from '@colombalink/shared/components/sections/Hero.astro';
<Hero headline="Welcome" />
```

**You add v2 (2025) - Their site keeps working:**

- Package bumps v1.0.0 → v1.5.0 (MINOR)
- Their imports still work because v1/Hero.astro is preserved
- Or they were already using the default path, and it still works because Hero.astro is backward compatible initially

**You add v3 (2026) - Site still works:**

- Package bumps v1.5.0 → v1.8.0 (MINOR)
- Hero.astro gets breaking changes
- v2/Hero.astro has the old version
- v1/Hero.astro stays untouched
- Example Client never breaks

### Scenario: New Another Client (Created 2026)

```astro
import Hero from '@colombalink/shared/components/sections/Hero.astro';
<Hero heading="Welcome" variant="default" />
```

Gets latest by default, but you can lock them:

```astro
import Hero from '@colombalink/shared/components/sections/v3/Hero.astro';
```

## Benefits

✅ **Old sites never break** - They import from v1/, v2/, etc.  
✅ **No forced migrations** - Clients update when ready  
✅ **Mostly MINOR bumps** - Rarely need MAJOR versions  
✅ **Easy rollback** - Just change import path  
✅ **Clear history** - Version folders document evolution  
✅ **Gradual adoption** - Mix old and new components

## Drawbacks & Solutions

❌ **More files to maintain**
✅ Solution: Old versions are frozen - no maintenance needed

❌ **Larger package size**
✅ Solution: Most clients only use 1-2 versions max. Tree-shaking helps

❌ **Could get messy**
✅ Solution: Clear folder structure and documentation

❌ **When to remove old versions?**
✅ Solution: Only after 5+ years AND confirming no client uses it

## Comparison: Traditional vs Component-Level Versioning

### Traditional Approach

```
v1.0.0: Hero with headline prop
v2.0.0: BREAKING - Hero with heading prop (breaks old sites)
```

Client must update code when upgrading package.

### Component-Level Versioning

```
v1.0.0: Hero with headline prop
v1.5.0: Hero with heading prop + v1/Hero preserved
v1.8.0: Hero with new features + v1/Hero and v2/Hero preserved
```

Client can upgrade package anytime, code never breaks.

## Implementation Checklist

- [ ] Update package.json exports to include versioned paths
- [ ] Create initial v1/ folders for current components
- [ ] Add version history docs to each component
- [ ] Update CLI to support --component-version flag
- [ ] Create migration guide showing import path patterns
- [ ] Update CHANGELOG to explain versioning strategy
- [ ] Document which version each client site uses (internal tracking)

## File Structure After Implementation

```
packages/shared/
  components/
    sections/
      Hero.astro                    # Latest (v3)
      ContactBlock.astro            # Latest (v2)
      FeatureGrid.astro             # Latest (v1)
      v1/
        Hero.astro                  # Frozen - original
        ContactBlock.astro          # Frozen - original
        FeatureGrid.astro           # Frozen - original
      v2/
        Hero.astro                  # Frozen - second iteration
        ContactBlock.astro          # Frozen - second iteration
    ui/
      Button.astro                  # Latest
      Card.astro                    # Latest
      v1/
        Button.astro                # Frozen
```

## Summary

**Old approach:** Delete/breaking changes → MAJOR bump → clients must update  
**New approach:** Keep all versions → MINOR bump → clients never forced to update

This is perfect for long-running sites that shouldn't be touched!
