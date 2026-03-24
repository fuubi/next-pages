---
'@colombalink/shared': minor
---

Restructured component library to enforce explicit version-only imports with no "latest" version.

**Critical architectural change:**

- **NO "latest" version exists** - all components must be imported from explicit version folders
- All components now live in their own folders with ONLY versioned subdirectories
- Example: `@shared/components/sections/Hero/v1/Hero.astro` (ONLY path available)

**Structure:**

All components in `sections/`, `site/`, and `ui/` follow this pattern:

```
ComponentName/
  v1/
    ComponentName.astro  (only version, explicitly versioned)
```

**Correct import pattern:**

```astro
// ✓ CORRECT - explicit version import Hero from '@shared/components/sections/Hero/v1/Hero.astro';
// ✗ WRONG - no "latest" exists import Hero from '@shared/components/sections/Hero/Hero.astro';
```

**Components restructured (22 total):**

- **sections** (9): Hero, ContactBlock, CTASection, FAQ, FeatureGrid, FeatureSplit, LogoCloud, StatsRow, Testimonials
- **site** (6): Container, Footer, Header, LanguageSwitcher, Section, SectionHeader
- **ui** (7): Accordion, AnimationInit, Badge, Button, Card, Input, Textarea

This enforces long-term stability - sites explicitly choose which version to use, preventing accidental breaking changes.
