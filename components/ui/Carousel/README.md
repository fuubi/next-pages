# Carousel Components - Clear Layout Zones

## Architecture Philosophy

> **Clear layout zones at the site level - no complex positioning props**

Use `CarouselContainer` to create explicit left/center/right/bottom zones for navigation and indicators. No more overlapping, no complex absolute positioning!

## Components

### CarouselContainer
Layout wrapper with clear positioning zones

**Structure:**
```
┌─────────────────────────────────┐
│  Left  │  Center (Track)  │ Right│  
├─────────────────────────────────┤
│          Bottom (Dots)         │
└─────────────────────────────────┘
```

**Slots:**
- `left` - Left navigation (optional)
- Default slot - Carousel track (center)
- `right` - Right navigation (optional)
- `bottom` - Indicators/dots (optional)

### CarouselBase
Core scrolling container

**Props:**
- `slidesPerView?: 1 | 2 | 3 | 4 | 5`
- `gap?: 'none' | 'sm' | 'md' | 'lg'`
- `autoplay?: boolean`

### CarouselArrowButton
Single reusable arrow button

**Props:**
- `direction: 'prev' | 'next'` - Arrow direction
- `size?: 'sm' | 'md' | 'lg'`
- `variant?: 'default' | 'ghost' | 'primary'`

### CarouselDots  
Dot indicators (positioning handled by container)

## Usage Pattern

```astro
<CarouselContainer>
  <Fragment slot="left">
    <CarouselArrowButton direction="prev" size="md" />
  </Fragment>

  <CarouselBase slidesPerView={3} gap="lg">
    <Card>Slide 1</Card>
    <Card>Slide 2</Card>
  </CarouselBase>
  
  <Fragment slot="right">
    <CarouselArrowButton direction="next" size="md" />
  </Fragment>
  
  <Fragment slot="bottom">
    <CarouselDots />
  </Fragment>
</CarouselContainer>
```

## Examples

### Full Navigation
```astro
<CarouselContainer>
  <Fragment slot="left">
    <CarouselArrowButton direction="prev" />
  </Fragment>
  <CarouselBase slidesPerView={1}>
    <Card>Slide</Card>
  </CarouselBase>
  <Fragment slot="right">
    <CarouselArrowButton direction="next" />
  </Fragment>
  <Fragment slot="bottom">
    <CarouselDots />
  </Fragment>
</CarouselContainer>
```

### Dots Only (No Arrows)
```astro
<CarouselContainer>
  <CarouselBase slidesPerView={4} gap="lg">
    <Card>Brand 1</Card>
  </CarouselBase>
  <Fragment slot="bottom">
    <CarouselDots />
  </Fragment>
</CarouselContainer>
```

## Benefits

✅ Clear layout - Explicit zones prevent overlapping  
✅ Simple composition - Add only what you need  
✅ No complex props - Layout handles positioning  
✅ Flexible - Omit any zone you don't need
