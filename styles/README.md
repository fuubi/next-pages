# CSS Theme System

This directory contains the global CSS design tokens and styles for the shared component library.

## Files

- **`tokens.css`** - CSS custom properties (design tokens) for colors, typography, spacing, shadows, etc.
- **`global.css`** - CSS reset and base styles
- **`animations.css`** - Animation utilities and keyframes

## How It Works

The theme system is built on CSS custom properties (CSS variables), allowing sites to override the base theme with their own colors and styling while keeping all components consistent.

### Architecture

```
┌─────────────────────────────────────┐
│  packages/shared/styles/tokens.css  │  ← Base theme (green)
│  (Default: Coonnect green theme)    │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│ sites/garage-mueller/styles/        │  ← Site overrides (red)
│         tokens.css                   │
│  (Override: Automotive red theme)   │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│      All Components Adapt            │
│  (Buttons, Cards, Headers, etc.)    │
└─────────────────────────────────────┘
```

### Token Categories

#### Colors

**Brand Colors** - Primary, secondary, accent colors

```css
--color-primary: #6ba543;
--color-primary-hover: #3f7f2a;
--color-primary-contrast: #ffffff;
```

**Text Colors** - Semantic text hierarchy

```css
--color-text: #1f2d2b;
--color-text-secondary: #4f5e5b;
--color-text-tertiary: #8a9793;
```

**UI Component Colors** - Specific component styling

```css
--color-footer-bg: #1a1a1a;
--color-glass-bg: rgba(255, 255, 255, 0.1);
--color-overlay-bg: rgba(0, 0, 0, 0.5);
--color-rating-star: #f0c36d;
```

**Interactive States**

```css
--color-hover-bg: rgba(0, 0, 0, 0.05);
--color-active-bg: rgba(0, 0, 0, 0.15);
```

#### Typography

```css
--font-sans: 'Siemens Sans', sans-serif;
--font-size-xs: 0.625rem; /* 10px */
--font-size-sm: 0.75rem; /* 12px */
--font-size-base: 0.875rem; /* 14px */
--font-weight-medium: 500;
--line-height-normal: 1.5;
```

#### Spacing

```css
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-4: 1rem; /* 16px */
--space-8: 2rem; /* 32px */
```

#### Layout

```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
```

#### Effects

```css
--shadow-sm: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
--blur-sm: blur(4px);
--blur-md: blur(12px);
--transition-fast: 150ms ease;
```

#### Component Sizing

```css
--avatar-xs: 1.5rem; /* 24px */
--avatar-md: 3rem; /* 48px */
--avatar-lg: 4rem; /* 64px */
--header-height-desktop: 4rem;
--touch-target-min: 2.75rem; /* 44px - accessibility */
```

## Usage in Components

### ✅ Correct - Always Use CSS Variables

```astro
<style>
  .button {
    background-color: var(--color-primary);
    color: var(--color-primary-contrast);
    padding: var(--space-3) var(--space-6);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-md);
  }

  .button:hover {
    background-color: var(--color-primary-hover);
    box-shadow: var(--shadow-lg);
  }
</style>
```

### ❌ Wrong - Never Hardcode Values

```astro
<style>
  .button {
    background-color: #6ba543; /* ❌ Hardcoded color */
    color: white; /* ❌ Hardcoded - use var(--color-primary-contrast) */
    padding: 0.75rem 1.5rem; /* ❌ Hardcoded spacing */
    border-radius: 4px; /* ❌ Use var(--border-radius-sm) */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* ❌ Use var(--shadow-sm) */
  }
</style>
```

## Creating a New Site Theme

To create a custom theme for a site (like garage-mueller's automotive red theme):

1. **Create your site's tokens file**: `sites/your-site/src/styles/tokens.css`

2. **Import the base tokens first**, then override:

```css
/* Import base theme */
@import '../../../../packages/shared/styles/tokens.css';

/* Override with your brand colors */
:root {
  /* Primary Brand Color - Automotive Red */
  --color-primary: #d32f2f;
  --color-primary-hover: #b71c1c;
  --color-primary-dark: #9a0007;
  --color-primary-light: #ff5252;

  /* Accent Color */
  --color-accent: #ffc107;

  /* Rating Star Color (if different from accent) */
  --color-rating-star: #ffc107;
}
```

3. **Import in your layout**:

```astro
---
// src/layouts/BaseLayout.astro
import '@shared/styles/tokens.css';
import '@shared/styles/global.css';
import '../styles/tokens.css'; // Your overrides
---
```

That's it! All components will automatically use your theme.

## Dark Mode

The theme system includes dark mode support via `prefers-color-scheme`:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-text: #ffffff;
    --color-background: #184c45;
    --color-surface: #1f5950;
    /* ... more dark mode overrides */
  }
}
```

Components automatically adapt to dark mode. You can also override dark mode colors in your site's tokens file.

## Naming Conventions

### Semantic vs Literal Naming

**✅ Use Semantic Names** (Better for theming)

```css
--color-primary         /* Not --color-green */
--color-text            /* Not --color-black */
--color-surface         /* Not --color-light-gray */
```

**Why?** Semantic names allow sites to change colors without renaming variables. garage-mueller's "primary" is red, while the base theme's "primary" is green.

### Token Naming Pattern

```
--{category}-{property}-{variant?}

Examples:
--color-text-secondary
--shadow-lg
--space-4
--font-size-xl
--avatar-md
```

## Testing Your Theme

1. **Visual Test**: Open the component showcase

   ```bash
   cd sites/your-site
   npm run dev
   # Visit http://localhost:4321/templates/components/
   ```

2. **Check All Components**: The showcase page displays:
   - All card variants
   - Carousels with arrow buttons
   - Buttons, badges, inputs
   - Headers and footers

   All should use your theme colors consistently.

3. **Dark Mode Test**: Toggle your OS dark mode - all components should adapt.

4. **Theme Override Test**: Change `--color-primary` to a completely different color (e.g., blue). All primary-colored elements should update.

## Common Patterns

### Glass/Frosted Effects

```css
background: var(--color-glass-bg);
border: var(--border-width) solid var(--color-glass-border);
backdrop-filter: var(--blur-md);
```

### Overlay Effects

```css
background: var(--color-overlay-bg); /* Dark semi-transparent */
```

### Hover States

```css
.element:hover {
  background: var(--color-hover-bg);
}
```

### Card Styling

```css
background: var(--color-surface);
border-radius: var(--border-radius-lg);
box-shadow: var(--shadow-md);
padding: var(--space-6);
```

## Troubleshooting

### Colors Don't Match Theme

**Problem**: A component shows the wrong color (e.g., green instead of red)

**Solution**: The component likely has a hardcoded color. Search for:

- Hex codes: `#6ba543`, `#ffffff`
- RGB values: `rgba(107, 165, 67, ...)`, `rgb(255, 255, 255)`
- Named colors: `white`, `black`

Replace with CSS variables from `tokens.css`.

### Component Looks Broken in Dark Mode

**Problem**: Text is invisible or elements have wrong colors in dark mode

**Solution**: Make sure the component uses semantic color tokens:

- Use `--color-text`, not `--color-text-dark` (which is for light mode)
- Use `--color-surface` (adapts automatically), not hardcoded colors
- Check `tokens.css` for dark mode overrides

### Spacing Looks Wrong

**Problem**: Spacing doesn't match the design system

**Solution**: Replace hardcoded spacing with tokens:

```css
/* Wrong */
padding: 12px 24px;
margin: 1.5rem;

/* Right */
padding: var(--space-3) var(--space-6);
margin: var(--space-6);
```

## Resources

- **Token Reference**: See `tokens.css` for all available variables
- **Component Examples**: Browse `packages/shared/components/` for usage examples
- **Site Theme Example**: See `sites/garage-mueller/src/styles/tokens.css` for a complete theme override

## Contributing

When adding new components or styles:

1. **Always use CSS variables** - Never hardcode colors, sizes, or spacing
2. **Test in multiple themes** - Check garage-mueller (red) and base theme (green)
3. **Test dark mode** - Ensure components work with `prefers-color-scheme: dark`
4. **Document new tokens** - Add comments explaining purpose and usage
5. **Run the build** - Verify `npm run build` succeeds in all sites

For questions or issues, see the main component library documentation in `/docs/`.
