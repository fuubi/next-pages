# Component-Level Versioning Strategy

For long-running client sites that you don't want to touch, we use **component-level versioning** with explicit version folders only.

## Philosophy

**Never remove or break components. No "latest" version.** All components exist ONLY in explicit version folders (v1/, v2/, etc.). Sites explicitly choose which version to use, preventing accidental breaking changes.

## Structure

```
src/shared/components/
  sections/
    Hero/
      v1/
        Hero.astro                  # Version 1 - never changes
      v2/
        Hero.astro                  # Version 2 - breaking changes from v1
    ContactBlock/
      v1/
        ContactBlock.astro          # Only version, explicitly versioned
```

**Critical rule**: No component files at the root of component folders. Only versioned subdirectories exist.

## Import Patterns

### New Sites (Choose Explicit Version)

```astro
import Hero from '@colombalink/shared/components/sections/Hero/v1/Hero.astro';
```

### Upgrade to Newer Version

```astro
import Hero from '@colombalink/shared/components/sections/Hero/v2/Hero.astro';
```

### Old Sites Keep Working Forever

```astro
// Site created in 2024 - uses v1 import Hero from
'@colombalink/shared/components/sections/Hero/v1/Hero.astro'; // Never breaks, even as we add v2,
v3, etc.
```

## Workflow

### When Creating a Breaking Change

Instead of updating Hero/v1/Hero.astro, create a new version:

```bash
# Step 1: Create new version folder
mkdir -p src/shared/components/sections/Hero/v2

# Step 2: Copy existing version as starting point
cp src/shared/components/sections/Hero/v1/Hero.astro src/shared/components/sections/Hero/v2/

# Step 3: Make breaking changes to v2
# Edit src/shared/components/sections/Hero/v2/Hero.astro

# Step 4: Add version documentation
```

```astro
---
/**
 * Hero Component v2
 *
 * Breaking changes from v1:
 * - Changed props from headline/text to heading/description
 * - Added new responsive prop
 *
 * For v1, import from:
 * '@colombalink/shared/components/sections/Hero/v1/Hero.astro'
 */

export interface Props {
  heading: string; // Was 'headline' in v1
  description?: string; // Was 'text' in v1
  responsive?: boolean; // New prop
}
---

<!-- src/shared/components/sections/Hero/v2/Hero.astro -->
```

### Changesets for This Approach

**All component changes are MINOR:**

```bash
npm run changeset
# Type: minor (not major!)
# Summary: "Added Hero v2 with improved prop names (heading/description). v1 remains available."
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
  Hero/
    v1/
      Hero.astro
  ContactBlock/
    v1/
      ContactBlock.astro
```

### Phase 2: Breaking Change Needed (MINOR!)

```
v1.5.0  (MINOR, not MAJOR!)
components/sections/
  Hero/
    v1/
      Hero.astro               # Original preserved
    v2/
      Hero.astro               # New version with breaking changes
  ContactBlock/
    v1/
      ContactBlock.astro
```

**Changeset:**

```markdown
---
'@colombalink/shared': minor
---

Added Hero v2 with improved prop names. v1 remains available for legacy sites.

Breaking changes in v2:

- `headline` → `heading`
- `text` → `description`

Migration:

- New sites: Import from v2 path
- Existing sites: No action needed (continue using v1 path)
```

### Phase 3: Another Breaking Change (Still MINOR!)

```
v1.8.0  (MINOR)
components/sections/
  Hero/
    v1/
      Hero.astro               # Original
    v2/
      Hero.astro               # Second iteration
    v3/
      Hero.astro               # Latest iteration
  ContactBlock/
    v1/
      ContactBlock.astro
```

**Changeset:**

```markdown
---
'@colombalink/shared': minor
---

Added Hero v3 with variant support. v1 and v2 remain available.

New features in v3:

- Added `variant` prop (default, centered, split)
- Improved animations

Migration:

- New sites: Import from v3 path if needed
- v1/v2 sites: No action needed
```

### Phase 4: Optional Cleanup After Years (MAJOR)

```
v2.0.0  (MAJOR - but rare!)
components/sections/
  Hero/
    v2/
      Hero.astro               # Keep recent versions
    v3/
      Hero.astro
  # Removed v1/ after 5+ years and confirmation no sites use it
```

## Package.json Structure

```json
{
  "name": "@colombalink/shared",
  "version": "1.8.5",
  "exports": {
    "./components/sections/*/v1/*": "./components/sections/*/v1/*",
    "./components/sections/*/v2/*": "./components/sections/*/v2/*",
    "./components/sections/*/v3/*": "./components/sections/*/v3/*",
    "./components/ui/*/v1/*": "./components/ui/*/v1/*",
    "./components/site/*/v1/*": "./components/site/*/v1/*",
    "./layouts/*": "./layouts/*",
    "./styles/*": "./styles/*",
    "./utils/*": "./utils/*"
  }
}
```

## Client Site Lock Patterns

### Explicit Version Imports (Required for All Sites)

```astro
<!-- sites/example-client/src/pages/index.astro -->import Hero from
'@colombalink/shared/components/sections/Hero/v1/Hero.astro'; import ContactBlock from
'@colombalink/shared/components/sections/ContactBlock/v1/ContactBlock.astro';

<!-- This site will NEVER break, even 10 years later -->
<Hero headline="Welcome" text="..." />
```

### Upgrade to Newer Version When Ready

```astro
<!-- sites/another-client/src/pages/index.astro -->import Hero from
'@colombalink/shared/components/sections/Hero/v2/Hero.astro';

<!-- Explicitly upgraded to v2 when ready -->
<Hero heading="Welcome" description="..." />
```

### Mixed Versions (Different Components)

```astro
<!-- Use different versions for different components -->import Hero from
'@colombalink/shared/components/sections/Hero/v2/Hero.astro'; import ContactBlock from
'@colombalink/shared/components/sections/ContactBlock/v1/ContactBlock.astro';
```

## Documentation in Components

Each component version should document its breaking changes:

````astro
---
/**
 * Hero Component v3
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
 * For previous versions:
 * - v2: Import from ../v2/Hero.astro
 * - v1: Import from ../v1/Hero.astro
 */
---
````

## CLI Integration

Update your garage CLI to support version selection:

```bash
# Create new site with v1 components
npm run site create my-site

# Generate imports with explicit versions
npm run site create my-site --component-version=v1
```

This generates imports like:

```astro
import Hero from '@colombalink/shared/components/sections/Hero/v1/Hero.astro';
```

## Real-World Example

### Scenario: Example Client (Created 2024)

**Initial setup (2024):**

```astro
import Hero from '@colombalink/shared/components/sections/Hero/v1/Hero.astro';
<Hero headline="Welcome" />
```

**You add v2 (2025) - Their site keeps working:**

- Package bumps v1.0.0 → v1.5.0 (MINOR)
- Their imports still work because they explicitly use v1/Hero.astro
- v1/Hero.astro is NEVER modified

**You add v3 (2026) - Site still works:**

- Package bumps v1.5.0 → v1.8.0 (MINOR)
- v3/Hero.astro created with breaking changes
- v2/Hero.astro preserved
- v1/Hero.astro stays untouched
- Example Client never breaks

### Scenario: New Another Client (Created 2026)

```astro
import Hero from '@colombalink/shared/components/sections/Hero/v3/Hero.astro';
<Hero heading="Welcome" variant="default" />
```

Explicitly uses v3, can upgrade to v4 when available by changing import path.

## Benefits

✅ **Old sites never break** - They import from v1/, v2/, etc. with explicit paths  
✅ **No forced migrations** - Clients update when ready by changing import path  
✅ **No accidental upgrades** - All versions are explicit, no "latest" to surprise you  
✅ **Mostly MINOR bumps** - Rarely need MAJOR versions  
✅ **Easy rollback** - Just change import path  
✅ **Clear history** - Version folders document evolution  
✅ **Gradual adoption** - Mix old and new component versions

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
v1.0.0: Hero/v1/Hero.astro with headline prop
v1.5.0: Hero/v2/Hero.astro with heading prop + Hero/v1/ preserved
v1.8.0: Hero/v3/Hero.astro with new features + Hero/v1/ and Hero/v2/ preserved
```

Client can upgrade package anytime, imports never break because they use explicit version paths.

## Implementation Checklist

- [x] Update package.json exports to include versioned paths
- [x] Create v1/ folders for all components (only versioned files exist)
- [x] Remove all "latest" component files from root of component folders
- [x] Add version history docs to each component
- [ ] Update CLI to support --component-version flag
- [x] Create migration guide showing import path patterns
- [x] Update CHANGELOG to explain versioning strategy
- [ ] Document which version each client site uses (internal tracking)

## File Structure After Implementation

```
src/shared/
  components/
    sections/
      Hero/
        v1/
          Hero.astro
        v2/
          Hero.astro
        v3/
          Hero.astro
      ContactBlock/
        v1/
          ContactBlock.astro
        v2/
          ContactBlock.astro
      FeatureGrid/
        v1/
          FeatureGrid.astro
    ui/
      Button/
        v1/
          Button.astro
      Card/
        v1/
          Card.astro
    site/
      Header/
        v1/
          Header.astro
      Footer/
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
