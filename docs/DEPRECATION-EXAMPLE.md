# Practical Example: Deprecating Hero Component

Let's walk through a real-world example using your existing Hero component.

## Scenario

You want to rename the `headline` prop to `heading` for better consistency across all components.

## Step-by-Step Implementation

### Step 1: Support Both Props (v1.1.0 - MINOR)

Update Hero.astro to support both old and new props:

```astro
---
import Section from '../site/Section.astro';
import Container from '../site/Container.astro';
import Button from '../ui/Button.astro';

export interface Props {
  /**
   * @deprecated Use `heading` instead. Will be removed in v2.0.0
   * @see heading
   */
  headline?: string;

  /** The main heading text (replaces headline) */
  heading?: string;

  text?: string;
  cta?: {
    text: string;
    href: string;
  };
  secondaryCta?: {
    text: string;
    href: string;
  };
  image?: string;
  variant?: 'default' | 'centered';
}

const {
  headline,
  heading = headline, // Fallback to old prop name
  text,
  cta,
  secondaryCta,
  image,
  variant = 'default',
} = Astro.props;

// Development warning
if (import.meta.env.DEV && headline && !heading) {
  console.warn(
    'Hero: prop "headline" is deprecated, use "heading" instead. Will be removed in v2.0.0'
  );
}
---

<Section variant="default" spacing="xl">
  <Container>
    <div class:list={['hero', `variant-${variant}`]}>
      <div class="hero-content" data-animate="fade">
        <h1 class="hero-headline">{heading}</h1>
        {text && <p class="hero-text">{text}</p>}
        <!-- rest of component -->
      </div>
    </div></Container
  ></Section
>
```

### Step 2: Create Changeset

```bash
npm run changeset
```

```
🦋  Which packages would you like to include?
◉ @colombalink/shared

🦋  What kind of change is this for @colombalink/shared?
● minor

🦋  Please enter a summary:
Deprecated Hero component's "headline" prop in favor of "heading". Both work for now, but "headline" will be removed in v2.0.0
```

### Step 3: Commit and Communicate

```bash
git add .
git commit -m "feat: deprecate Hero headline prop, use heading instead"
git push
```

**Email to clients:**

```
Subject: Action Required: Hero Component Prop Deprecation

Hi team,

We're deprecating the `headline` prop on the Hero component:

OLD (deprecated):  <Hero headline="Welcome" />
NEW (recommended): <Hero heading="Welcome" />

Timeline:
- v1.1.0 (now): Both props work
- v2.0.0 (Q2 2026): "headline" will be removed

Your sites will continue to work, but please update when convenient.
See migration guide: [link]

Questions? Reply to this email.
```

## Alternative: Keep Legacy Component

If the change is more complex, keep the old component entirely:

### Create New Component (src/shared/components/sections/HeroV2.astro)

```astro
---
// New improved Hero component
export interface Props {
  heading: string;
  description?: string;
  // ... other props
}
---
```

### Update Old Component to Forward Props

````astro
---
/**
 * @deprecated Use HeroV2 component instead. This component will be removed in v2.0.0
 *
 * Migration:
 * ```diff
 * - import Hero from '@colombalink/shared/components/sections/Hero.astro';
 * + import Hero from '@colombalink/shared/components/sections/HeroV2.astro';
 *
 * - <Hero headline="..." text="..." />
 * + <Hero heading="..." description="..." />
 * ```
 */

// Map old props to new component
import HeroV2 from './HeroV2.astro';

const { headline, text, ...rest } = Astro.props;
const newProps = {
  heading: headline,
  description: text,
  ...rest,
};

if (import.meta.env.DEV) {
  console.warn(
    'Hero component is deprecated. Use HeroV2 instead. ' +
      'See migration guide: https://github.com/your-org/client-sites/blob/main/docs/migrations/hero-to-herov2.md'
  );
}
---

<!-- src/shared/components/sections/Hero.astro -->
<HeroV2 {...newProps} />
````

## Version Timeline

### v1.0.0 (Current)

```
Hero.astro with `headline` prop
```

### v1.1.0 (Deprecation - MINOR)

```
Hero.astro supports both `headline` (deprecated) and `heading` (new)
```

**Changeset:**

```markdown
---
'@colombalink/shared': minor
---

Deprecated Hero component's "headline" prop. Use "heading" instead. Both work in this version for backward compatibility. "headline" will be removed in v2.0.0
```

### v2.0.0 (Breaking - MAJOR)

```
Hero.astro only supports `heading`
```

**Changeset:**

```markdown
---
'@colombalink/shared': major
---

BREAKING: Removed deprecated "headline" prop from Hero component. Use "heading" instead. This was deprecated in v1.1.0
```

## Client Migration

### Client Site (garage-mueller) - No Rush

```astro
<!-- sites/garage-mueller/src/pages/index.astro --><!-- v1.0.0 - Works -->
<Hero headline="Welcome to Garage Mueller" />

<!-- v1.1.0 - Both work, but shows deprecation warning in dev -->
<Hero headline="Welcome to Garage Mueller" />
<!-- Still works -->
<Hero heading="Welcome to Garage Mueller" />
<!-- New way -->

<!-- v2.0.0 - Must use new prop -->
<Hero heading="Welcome to Garage Mueller" />
<!-- Only this works -->
```

### What Happens If They Don't Migrate?

**v1.1.0 (their current version):**

- Everything works fine
- They see console warnings in dev mode
- They have time to migrate

**When they update to v2.0.0:**

- Their build breaks with TypeScript error:
  ```
  Property 'headline' does not exist on type 'Props'
  ```
- They must update their code before deploying
- Your CHANGELOG clearly documents this

## Testing the Deprecation

Create a test site to verify:

```bash
# Create test site
npm run site create test-deprecation

cd sites/test-deprecation
```

Test both prop versions:

```astro
<Hero headline="Old way" />
<!-- Should work with warning -->
<Hero heading="New way" />
<!-- Should work normally -->
```

## Best Practices Applied Here

✅ **Backward compatible** - Old code keeps working  
✅ **Clear warnings** - Developers see deprecation messages  
✅ **TypeScript support** - IDE shows deprecation hints  
✅ **Timeline given** - Clients know when it'll be removed  
✅ **Migration guide** - Shows exactly what to change  
✅ **Gradual rollout** - Multiple versions before breaking

## Summary

**For small changes (prop renames):**

- Support both props in the same component
- Wait 1 major version before removing

**For large changes (component redesign):**

- Create new component
- Old component forwards to new one
- Wait 1-2 major versions before removing

**Always:**

- Use MINOR for deprecation (nothing breaks)
- Use MAJOR for removal (breaking change)
- Give clients 3-6 months notice
- Communicate clearly in CHANGELOG and email
