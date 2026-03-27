# Component Showcase

Live component gallery for developing and testing shared components in isolation.

## Purpose

- **Isolated Development**: View components without full site context
- **Visual Testing**: See all component variations side-by-side
- **Live Reloading**: Changes in `packages/shared` reflect instantly
- **Component Documentation**: Interactive examples for each component

## Quick Start

```bash
# From monorepo root
cd sites/demo-showcase
npm run dev
```

Visit http://localhost:4321 to browse components.

## Development Workflow

1. Edit components in `packages/shared/`
2. View changes instantly in this showcase
3. Test full site context in `sites/garage-mueller`
4. Commit when ready

## Structure

```
/components/sections  - Section components (Hero, Features, etc.)
/components/site      - Site structure (Header, Footer, etc.)
/components/ui        - UI primitives (Button, Card, etc.)
/templates/hero       - Hero template variations
/templates/footer     - Footer template variations
```

## Note

This site uses **workspace dependencies** - it consumes `@colombalink/shared` and `@colombalink/templates` directly from the monorepo packages.
