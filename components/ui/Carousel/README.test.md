# Carousel Component Tests

## Architecture

The Carousel component uses a **separation of concerns** pattern:

- **`CarouselController.ts`** - Pure TypeScript class with all carousel logic
- **`Carousel.astro`** - Astro component that imports and initializes the controller
- **`Carousel.test.ts`** - AVA tests that import and test the real CarouselController

This architecture allows:

- ✅ Tests use the **real implementation** (no code duplication)
- ✅ Logic can be tested independently from DOM
- ✅ Better separation of concerns
- ✅ Both Astro and AVA can use the same TypeScript file

## Bug Fixed: Multiple Clicks Required Issue

### Problem

Sometimes users had to click the carousel navigation buttons 3 times before anything happened. This was caused by a **race condition** between:

1. Button click updating `currentIndex` immediately
2. Smooth scroll animation taking 300-400ms to complete
3. IntersectionObserver detecting visible slides and overwriting `currentIndex` during the animation

### Solution

Added `isNavigating` flag that:

- Sets to `true` when programmatic navigation starts
- Blocks IntersectionObserver updates during the flag period
- Resets to `false` after scroll animation completes (500ms)

This ensures button clicks always use the correct `currentIndex` value.

### Running Tests

```bash
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
```

### Test Coverage

- ✅ Single slide carousel navigation (next/prev/loop)
- ✅ Multi-slide carousel navigation (slidesPerView > 1)
- ✅ Rapid clicking scenarios (the bug that was fixed)
- ✅ IntersectionObserver blocking during navigation
- ✅ Dot/indicator navigation
- ✅ Edge cases (exact match, logo clouds)

All 10 tests pass with the fixed implementation.

## Key Logic

```typescript
scrollToSlide(index: number) {
  this.isNavigating = true; // Block observer
  this.currentIndex = index;
  this.updateDots(index);

  this.track.scrollTo({ left: slideOffsetLeft, behavior: 'smooth' });

  setTimeout(() => {
    this.isNavigating = false; // Re-enable observer
  }, 500);
}

setupObserver() {
  // Only update currentIndex if NOT actively navigating
  if (entry.isIntersecting && !this.isNavigating) {
    this.currentIndex = slideIndex;
  }
}
```
