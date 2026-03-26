# AnimatedCardStack Component

## Overview

**Sticky card stack with scroll reveal** - Classic CSS Tricks technique where cards stick at the top as you scroll, with each subsequent card sliding up to cover the previous one. Creates a deck-stacking effect.

Perfect for:

- Project showcases / portfolios
- Feature highlights
- Product listings
- Timeline stories
- Service offerings
- Team profiles

## Key Features

✅ **Position Sticky** - Cards stick in place as you scroll  
✅ **Deck Stacking** - Each card covers the previous one  
✅ **Incremental Offset** - Cards stack with visible offset  
✅ **Pure CSS** - No JavaScript required  
✅ **SEO-Friendly** - All cards visible in HTML  
✅ **Reduced Motion Support** - Falls back to normal stacking  
✅ **Mobile Optimized** - Responsive behavior  
✅ **Transform-Safe** - Uses wrapper pattern to avoid CSS transform conflicts

## Animation Pattern

```
Card 1: position: sticky, top: 20px
Card 2: position: sticky, top: 40px
Card 3: position: sticky, top: 60px
Card 4: position: sticky, top: 80px
```

As you scroll:

1. Cards stick at their respective `top` positions
2. Next card slides up from below
3. Later cards naturally cover earlier cards (DOM order)
4. Creates stacking deck effect

## Components

### AnimatedCardStack

Container component that provides scroll space and CSS variables.

**Props:**

| Prop            | Type     | Default   | Description                               |
| --------------- | -------- | --------- | ----------------------------------------- |
| `stackOffset`   | `number` | `20`      | Offset in pixels between stacked cards    |
| `maxWidth`      | `string` | `'900px'` | Maximum width of the stack container      |
| `topPadding`    | `string` | `'8rem'`  | Top padding (space before stack)          |
| `bottomPadding` | `string` | `'60rem'` | Bottom padding (scroll space - critical!) |
| `class`         | `string` | -         | Additional CSS classes                    |

### StackItem

Wrapper component that applies sticky positioning. **Required** for each card.

**Props:**

| Prop    | Type     | Description                                     |
| ------- | -------- | ----------------------------------------------- |
| `index` | `number` | Stack index (1-based) - determines top position |
| `class` | `string` | Additional CSS classes                          |

## Usage

### Basic Example

```astro
import AnimatedCardStack from '@shared/components/ui/AnimatedCardStack/AnimatedCardStack.astro';
import StackItem from '@shared/components/ui/StackItem/StackItem.astro'; import Card from
'@shared/components/ui/Card/Card.astro';

<AnimatedCardStack stackOffset={20}>
  <StackItem index={1}>
    <Card><h3>Card 1</h3></Card>
  </StackItem>
  <StackItem index={2}>
    <Card><h3>Card 2</h3></Card>
  </StackItem>
  <StackItem index={3}>
    <Card><h3>Card 3</h3></Card>
  </StackItem>
</AnimatedCardStack>
```

### Custom Stack Offset

```astro
<!-- Tighter stacking (20px spacing) -->
<AnimatedCardStack stackOffset={20}>
  <StackItem index={1}>
    <PostCard title="Project 1" ... />
  </StackItem>
  <StackItem index={2}>
    <PostCard title="Project 2" ... />
  </StackItem>
</AnimatedCardStack>

<!-- Wider spacing (60px spacing) -->
<AnimatedCardStack stackOffset={60}>
  <StackItem index={1}>
    <PostCard title="Project 1" ... />
  </StackItem>
  <StackItem index={2}>
    <PostCard title="Project 2" ... />
  </StackItem>
</AnimatedCardStack>
```

### Project Showcase

```astro
<AnimatedCardStack stackOffset={30}>
  <StackItem index={1}>
    <PostCard
      title="Complete Engine Overhaul"
      description="Full engine rebuild on a 1985 BMW E30..."
      image="/images/workshop.svg"
      category="PROJECT"
      categoryColor="primary"
      variant="elevated"
    />
  </StackItem>
  <StackItem index={2}>
    <PostCard
      title="Electric Vehicle Conversion"
      description="Converting a 1972 VW Bus to full electric..."
      image="/images/service-battery.svg"
      category="PROJECT"
      categoryColor="success"
      variant="elevated"
    />
  </StackItem>
  <StackItem index={3}>
    <PostCard
      title="Fleet Management System"
      description="Comprehensive digital solution..."
      image="/images/tools.svg"
      category="PROJECT"
      categoryColor="info"
      variant="elevated"
    />
  </StackItem>
</AnimatedCardStack>
```

## How It Works

### 1. Container (AnimatedCardStack)

- Provides large `padding-bottom` for scroll space (critical for sticky to work)
- Sets CSS variables: `--stack-offset`, `--stack-max-width`, etc.
- Centers content with max-width

### 2. Wrapper (StackItem)

- Applies `position: sticky` with calculated `top` value
- Formula: `top = stackOffset × index`
- Forces `transform: none !important` to ensure sticky works
- Adds opaque background to prevent text bleed-through

### 3. Content (Card, PostCard, etc.)

- Can have any transforms (for hover effects, GPU acceleration)
- No conflicts because sticky is on the wrapper, not the card itself

### 4. Sticky Behavior

As you scroll:

- Each StackItem sticks when it reaches its `top` position
- Later cards slide up and naturally cover earlier cards (DOM order)
- No z-index manipulation needed - natural stacking context

## Why StackItem Wrapper?

**Problem:** Card component uses `transform: translateZ(0)` for GPU acceleration. CSS transforms create a new stacking context, which breaks `position: sticky`.

**Solution:** Apply sticky to a wrapper (StackItem) instead of directly to the card. The wrapper has `transform: none`, allowing sticky to work. The card inside can keep its transforms for performance and hover effects.

## Best Practices

### Stack Offset

- **20-30px**: Tight stacking, subtle peek
- **30-40px**: Balanced visibility (recommended)
- **50-60px**: Wide spacing, clear card separation

### Card Count

- **3-5 cards**: Optimal for most use cases
- **6+ cards**: Consider using smaller `stackOffset` or splitting into sections

### Card Types

Works with any content:

- `PostCard` - Rich content cards
- `Card` - Simple text cards
- `HorizontalCard` - Image + text layouts
- `ReviewCard` - Testimonials
- Custom content

### Content Height

Ensure cards have sufficient height for good visibility when stacked. Very tall cards may create excessive scroll distance.

### Index Numbering

Always use 1-based indexing (start with `index={1}`). This makes the math intuitive:

- Card 1: `index={1}` → `top: 20px`
- Card 2: `index={2}` → `top: 40px`
- etc.

## Technical Details

### Position Sticky

```css
.stack-item {
  position: sticky;
  top: calc(var(--stack-offset, 20px) * var(--stack-index));
  transform: none !important; /* Critical for sticky to work */
}
```

### Why Transform: None?

CSS transforms create a new containing block, which changes how `position: sticky` calculates its position relative to ancestors. By forcing `transform: none` on the StackItem wrapper, sticky positioning works correctly.

### Opaque Background

```css
.stack-item {
  background: var(--color-background, #f5f5f5);
}
```

Prevents text from cards underneath from showing through when stacked.

### Browser Support

Position sticky is supported in all modern browsers:

- Chrome/Edge 56+
- Firefox 59+
- Safari 13+

### Accessibility

Reduced motion fallback removes sticky behavior for users who prefer reduced motion.

## Troubleshooting

### Cards Don't Stick

Check these common issues:

1. **Missing StackItem wrapper**

   ```astro
   <!-- ❌ Wrong - applying sticky directly to Card -->
   <AnimatedCardStack>
     <Card>...</Card>
   </AnimatedCardStack>

   <!-- ✅ Correct - using StackItem wrapper -->
   <AnimatedCardStack>
     <StackItem index={1}>
       <Card>...</Card>
     </StackItem>
   </AnimatedCardStack>
   ```

2. **Parent has overflow**
   - Check if any parent element has `overflow: hidden`, `overflow: auto`, or `overflow: clip`
   - Sticky positioning doesn't work inside overflow containers

3. **Insufficient scroll space**
   - Increase `bottomPadding` prop on AnimatedCardStack
   - Default `60rem` should be sufficient for most cases

4. **Transform on ancestor**
   - Check if any parent has CSS transform applied
   - StackItem wrapper should prevent this, but verify with DevTools

### Text Showing Through

If text from underlying cards shows through:

- StackItem has default background - verify it matches your page background
- Adjust via CSS: `.stack-item { background: your-color; }`
- Or ensure Card component has opaque background

## References

Based on the classic CSS Tricks article: "Stacked Cards with Sticky Positioning"
Wrapper pattern solves transform conflicts while maintaining Card component reusability.
