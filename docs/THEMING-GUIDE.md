# Component Theming Guide

A comprehensive guide for writing theme-aware components that work across all sites in the monorepo.

## Table of Contents

- [Core Principles](#core-principles) - [The CSS Variable Rule](#the-css-variable-rule)
- [Before & After Examples](#before--after-examples)
- [Common Patterns](#common-patterns)
- [Testing Requirements](#testing-requirements)
- [Troubleshooting](#troubleshooting)

## Core Principles

### 1. Always Use CSS Variables

Every color, size, spacing value, shadow, and transition **MUST** use a CSS variable from `tokens.css`.

**Why?** Sites like garage-mueller override the base theme (green → red). Hardcoded values break theming.

### 2. Semantic Over Literal

Use semantic naming: `--color-primary`, not `--color-green`.

**Why?** The base theme's "primary" is green, but garage-mueller's is red. Semantic names work for both.

### 3. Test in Multiple Themes

Test your component in:
- Base theme (green) - default
- garage-mueller theme (red) - automotive site
- Dark mode - `prefers-color-scheme: dark`

## The CSS Variable Rule

### ✅ ALWAYS Use Variables For:

- **Colors**: Any `color`, `background-color`, `border-color`, `fill`, `stroke`
- **Sizes**: `width`, `height`, `font-size`, `line-height`
- **Spacing**: `padding`, `margin`, `gap`
- **Effects**: `box-shadow`, `backdrop-filter`, `border-radius`
- **Timing**: `transition`, `animation-duration`

### ❌ NEVER Hardcode:

- Hex colors: `#6ba543`, `#ffffff`, `#000000`
- RGB: `rgba(107, 165, 67, 0.5)`, `rgb(255, 255, 255)`
- Named colors: `white`, `black`, `red`, `blue` (except in rare cases like `currentColor`)
- Pixel values: `padding: 16px`, `font-size: 14px`, `height: 48px`
- Rem values: `margin: 1.5rem`, `gap: 0.75rem`

## Before & After Examples

### Example 1: Carousel Arrow Button (Real Fix)

**❌ Before** - Hardcoded teal color, hardcoded shadows

```astro
<style>
  .carousel-arrow-btn {
    background: rgba(31, 89, 80, 0.8);           /* ❌ Hardcoded teal */
    border: 2px solid rgba(255, 255, 255, 0.3); /* ❌ Hardcoded */
    color: #ffffff;                              /* ❌ Hardcoded */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);   /* ❌ Hardcoded */
  }
  
  .carousel-arrow-btn:hover {
    background: rgba(31, 89, 80, 1);             /* ❌ Hardcoded */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); /* ❌ Hardcoded */
  }
</style>
```

**Problem**: In garage-mueller (red theme), buttons showed teal instead of automotive red.

**✅ After** - Uses theme variables

```astro
<style>
  .carousel-arrow-btn {
    background: var(--color-surface);           /* ✅ Theme-aware */
    border: 2px solid var(--color-border);      /* ✅ Adapts to theme */
    color: var(--color-text);                   /* ✅ Adapts to dark mode */
    box-shadow: var(--shadow-md);               /* ✅ Consistent shadows */
  }
  
  .carousel-arrow-btn:hover {
    background: var(--color-primary);           /* ✅ Red in garage-mueller! */
    box-shadow: var(--shadow-lg);               /* ✅ Theme-aware */
  }
</style>
```

**Result**: Buttons use red in garage-mueller, green in base theme, and adapt to dark mode automatically.

---

### Example 2: Footer Component (Real Fix)

**❌ Before** - All hardcoded values

```astro
<style>
  .footer {
    background-color: #1a1a1a;                  /* ❌ Hardcoded dark gray */
    color: #e0e0e0;                             /* ❌ Hardcoded light gray */
    padding: 4rem 0 2rem;                       /* ❌ Hardcoded spacing */
    border-top: 1px solid rgba(255,255,255,0.1); /* ❌ Hardcoded */
  }
  
  .footer-link {
    color: #b0b0b0;                             /* ❌ Hardcoded */
    font-size: 0.95rem;                         /* ❌ Hardcoded */
  }
  
  .footer-link:hover {
    color: #ffffff;                             /* ❌ Hardcoded */
  }
</style>
```

**✅ After** - Uses theme variables

```astro
<style>
  .footer {
    background-color: var(--color-footer-bg);   /* ✅ Theme-aware */
    color: var(--color-footer-text);            /* ✅ Theme-aware */
    padding: var(--space-16) 0 var(--space-8);  /* ✅ Design system */
    border-top: var(--border-width) solid var(--color-footer-border);
  }
  
  .footer-link {
    color: var(--color-footer-text-secondary);  /* ✅ Semantic */
    font-size: var(--font-size-base);           /* ✅ Consistent */
  }
  
  .footer-link:hover {
    color: var(--color-footer-link-hover);      /* ✅ Theme-aware */
  }
</style>
```

---

### Example 3: Review Card Star Rating

**❌ Before** - Hardcoded gold color

```astro
<style>
  .star.filled {
    color: #f0c36d;  /* ❌ Hardcoded gold */
  }
  
  .avatar {
    width: 48px;     /* ❌ Hardcoded */
    height: 48px;    /* ❌ Hardcoded */
  }
</style>
```

**✅ After** - Uses theme variables

```astro
<style>
  .star.filled {
    color: var(--color-rating-star);  /* ✅ Can be customized per site */
  }
  
  .avatar {
    width: var(--avatar-md);          /* ✅ Consistent sizing */
    height: var(--avatar-md);         /* ✅ Matches design system */
  }
</style>
```

## Common Patterns

### Pattern 1: Buttons

```astro
<style>
  .button {
    /* Colors - Always use semantic names */
    background-color: var(--color-primary);
    color: var(--color-primary-contrast);
    border: var(--border-width) solid var(--color-primary);
    
    /* Spacing - Use spacing scale */
    padding: var(--space-3) var(--space-6);
    
    /* Typography - Use type scale */
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    
    /* Effects */
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-fast);
  }
  
  .button:hover {
    background-color: var(--color-primary-hover);
    box-shadow: var(--shadow-lg);
  }
</style>
```

### Pattern 2: Cards

```astro
<style>
  .card {
    /* Surface colors adapt to light/dark mode */
    background: var(--color-surface);
    color: var(--color-text);
    
    /* Borders */
    border: var(--border-width) solid var(--color-border);
    border-radius: var(--border-radius-lg);
    
    /* Effects */
    box-shadow: var(--shadow-md);
    
    /* Spacing */
    padding: var(--space-6);
    gap: var(--space-4);
  }
  
  .card:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
  }
</style>
```

### Pattern 3: Glass/Frosted Effects

```astro
<style>
  .glass-panel {
    background: var(--color-glass-bg);
    border: var(--border-width) solid var(--color-glass-border);
    backdrop-filter: var(--blur-md);
    border-radius: var(--border-radius);
  }
  
  /* For more opaque glass */
  .glass-panel-strong {
    background: var(--color-glass-bg-strong);
    backdrop-filter: var(--blur-sm);
  }
</style>
```

### Pattern 4: Overlays

```astro
<style>
  .overlay {
    background: var(--color-overlay-bg);  /* Semi-transparent dark */
  }
  
  .overlay-light {
    background: var(--color-overlay-bg-light);  /* More transparent */
  }
  
  .overlay-strong {
    background: var(--color-overlay-bg-strong);  /* Less transparent */
  }
</style>
```

### Pattern 5: Interactive States

```astro
<style>
  .interactive-element {
    transition: all var(--transition-fast);
  }
  
  .interactive-element:hover {
    background: var(--color-hover-bg);
  }
  
  .interactive-element:active {
    background: var(--color-active-bg);
  }
  
  .interactive-element.selected {
    background: var(--color-hover-bg-strong);
    border-color: var(--color-primary);
  }
</style>
```

## Token Reference Quick Guide

### Most Used Tokens

```css
/* Colors */
--color-primary             /* Primary brand color */
--color-primary-hover       /* Hover state */
--color-primary-contrast    /* Text on primary background */
--color-text                /* Body text */
--color-text-secondary      /* Supporting text */
--color-surface             /* Card/panel backgrounds */
--color-border              /* Standard borders */

/* Spacing (4px base unit) */
--space-1: 0.25rem;  /*  4px */
--space-2: 0.5rem;   /*  8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */

/* Typography */
--font-size-xs: 0.625rem;   /* 10px */
--font-size-sm: 0.75rem;    /* 12px */
--font-size-base: 0.875rem; /* 14px */
--font-size-lg: 1rem;       /* 16px */
--font-size-xl: 1.25rem;    /* 20px */

/* Effects */
--shadow-sm                 /* Subtle shadow */
--shadow-md                 /* Medium shadow */
--shadow-lg                 /* Prominent shadow */
--blur-sm                   /* blur(4px) */
--blur-md                   /* blur(12px) */
--border-radius             /* 4px */
--border-radius-lg          /* 12px */
--transition-fast           /* 150ms */
```

For complete token list, see [`packages/shared/styles/tokens.css`](../packages/shared/styles/tokens.css)

## Testing Requirements

### Checklist for Every Component

- [ ] **Visual Test**: Component looks correct in component showcase
- [ ] **Base Theme Test**: Check with default green theme
- [ ] **garage-mueller Test**: Check with automotive red theme
- [ ] **Dark Mode Test**: Toggle OS dark mode - text must be readable
- [ ] **Build Test**: `npm run build` succeeds with 0 errors
- [ ] **No Hardcoded Values**: Search component file for hex codes (#), rgba(), hardcoded px/rem

### How to Test

1. **Start dev server**:
   ```bash
   cd sites/garage-mueller
   npm run dev
   ```

2. **Open component showcase**:
   ```
   http://localhost:4321/templates/components/
   ```

3. **Verify your component**:
   - Uses automotive red (not green)
   - Spacing matches design system
   - Shadows are consistent
   - Text is readable

4. **Toggle dark mode**: 
   - macOS: System Preferences → Appearance → Dark
   - Windows: Settings → Personalization → Colors → Dark
   - Linux: Depends on desktop environment

5. **Check other components**: Make sure you didn't break anything

6. **Build test**:
   ```bash
   npm run build
   ```
   Should complete with 0 errors.

## Adding New Tokens

When you need a new token (e.g., a specific component color):

1. **Check if it exists**: Browse `packages/shared/styles/tokens.css`

2. **Add to tokens.css** if needed:
   ```css
   /* In the appropriate section */
   --color-your-new-token: #value;
   ```

3. **Add dark mode variant** if applicable:
   ```css
   @media (prefers-color-scheme: dark) {
     :root {
       --color-your-new-token: #dark-value;
     }
   }
   ```

4. **Document it**: Add a comment explaining usage

5. **Update this guide**: Add to the patterns section if it's a common pattern

## Troubleshooting

### "My component doesn't match the theme!"

**Diagnosis**: Check for hardcoded values
```bash
# Search your component for hardcoded colors
grep -E "#[0-9a-fA-F]{3,6}|rgba?\(" YourComponent.astro

# Search for hardcoded sizes
grep -E "[0-9]+px|[0-9]+rem" YourComponent.astro
```

**Solution**: Replace each hardcoded value with the appropriate CSS variable.

### "Text is invisible in dark mode!"

**Problem**: Using wrong color tokens

**Wrong**:
```css
color: #000000;  /* Black text - invisible in dark mode! */
background: #ffffff;  /* White bg - wrong in dark mode */
```

**Right**:
```css
color: var(--color-text);     /* Adapts: dark in light mode, light in dark mode */
background: var(--color-surface);  /* Adapts automatically */
```

### "Buttons show green instead of red in garage-mueller!"

**Problem**: Hardcoded primary color

**Wrong**:
```css
background: #6ba543;  /* Hardcoded green */
```

**Right**:
```css
background: var(--color-primary);  /* Red in garage-mueller! */
```

### "Shadows look wrong/have wrong color!"

**Problem**: Hardcoded shadow with specific color

**Wrong**:
```css
box-shadow: 0 2px 8px rgba(107, 165, 67, 0.3);  /* Green shadow! */
```

**Right**:
```css
box-shadow: var(--shadow-md);  /* Theme-aware shadow */
```

## Real-World Fix Example

**Issue**: Carousel arrow buttons showed teal/green in garage-mueller (red theme)

**Root Cause**: Hardcoded `background: rgba(31, 89, 80, 0.8)` in CarouselArrowButton.astro

**Investigation**:
```bash
# Found the issue
grep -n "rgba(31, 89, 80" packages/shared/components/ui/Carousel/CarouselArrowButton.astro 
# Line 48: background: rgba(31, 89, 80, 0.8);
```

**Fix**:
```diff
- background: rgba(31, 89, 80, 0.8);
+ background: var(--color-surface);

- border: 2px solid rgba(255, 255, 255, 0.3);
+ border: 2px solid var(--color-border);

- box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
+ box-shadow: var(--shadow-md);
```

**Result**: Buttons now use red in garage-mueller, green in base theme, adapt to dark mode.

**Lesson**: Always use CSS variables. Even seemingly "neutral" colors like shadows can have theme-specific values.

## Resources

- **Token Documentation**: [`packages/shared/styles/README.md`](../packages/shared/styles/README.md)
- **Full Token List**: [`packages/shared/styles/tokens.css`](../packages/shared/styles/tokens.css)
- **Example Site Theme**: [`sites/garage-mueller/src/styles/tokens.css`](../sites/garage-mueller/src/styles/tokens.css)
- **Component Showcase**: Run garage-mueller dev server → `/templates/components/`

## Questions?

If you're unsure which token to use:

1. Check existing components for similar patterns
2. Look in `tokens.css` for available options
3. Check the component showcase to see what works
4. When in doubt, use semantic names (`--color-primary`, not specific colors)

**Remember**: If it has a color, size, or spacing value - use a CSS variable!
