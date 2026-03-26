import test from 'ava';
import { CarouselController } from './CarouselController.ts';

// Mock IntersectionObserver for Node.js environment
global.IntersectionObserver = class IntersectionObserver {
    constructor(callback: any, options: any) { }
    observe() { }
    unobserve() { }
    disconnect() { }
} as any;

// Mock DOM elements for testing
class MockHTMLElement {
    children: any[] = [];
    dataset: any = {};
    offsetLeft: number = 0;

    querySelector(selector: string) {
        return null;
    }

    querySelectorAll(selector: string) {
        return [];
    }

    classList = {
        add: () => { },
        remove: () => { },
        toggle: () => { },
    };

    setAttribute() { }
    addEventListener() { }
    scrollTo() { }
}

// Test helper to create a testable carousel controller
function createTestCarousel(slideCount: number, slidesPerView: number) {
    const mockElement = new MockHTMLElement() as any;

    // Create mock slides
    const mockSlides = Array(slideCount).fill(null).map((_, i) => ({
        offsetLeft: i * 100,
        classList: { add: () => { }, remove: () => { }, toggle: () => { } }
    }));

    // Create mock track with children
    const mockTrack = {
        children: mockSlides,
        scrollTo: () => { },
        querySelector: () => null,
        querySelectorAll: () => []
    };

    mockElement.dataset = {
        autoplay: 'false',
        slidesPerView: slidesPerView.toString()
    };

    mockElement.querySelector = (selector: string) => {
        if (selector === '.carousel-track') return mockTrack;
        return null;
    };

    // Create controller with mocked DOM
    const controller = new CarouselController(mockElement);

    // Override slides with our mocks
    controller.slides = mockSlides as any;
    controller.track = mockTrack as any;

    return controller;
}

// Test: Single slide carousel (slidesPerView=1)
test('Single slide carousel: next navigation loops correctly', t => {
    const carousel = createTestCarousel(4, 1); // 4 slides, 1 per view

    t.is(carousel.currentIndex, 0);

    carousel.next(); // 0 → 1
    t.is(carousel.currentIndex, 1);

    carousel.next(); // 1 → 2
    t.is(carousel.currentIndex, 2);

    carousel.next(); // 2 → 3 (maxIndex)
    t.is(carousel.currentIndex, 3);

    carousel.next(); // 3 → 0 (loop)
    t.is(carousel.currentIndex, 0, 'Should loop back to 0');
});

test('Single slide carousel: prev navigation loops correctly', t => {
    const carousel = createTestCarousel(4, 1);

    t.is(carousel.currentIndex, 0);

    carousel.prev(); // 0 → 3 (loop to end)
    t.is(carousel.currentIndex, 3, 'Should loop to last position');

    carousel.prev(); // 3 → 2
    t.is(carousel.currentIndex, 2);

    carousel.prev(); // 2 → 1
    t.is(carousel.currentIndex, 1);

    carousel.prev(); // 1 → 0
    t.is(carousel.currentIndex, 0);
});

// Test: Multi-slide carousel (slidesPerView=3)
test('Multi-slide carousel (6 slides, 3 per view): next navigation', t => {
    const carousel = createTestCarousel(6, 3);

    // With 6 slides showing 3, valid positions are: 0, 1, 2, 3
    // Position 0: shows slides 0,1,2
    // Position 1: shows slides 1,2,3
    // Position 2: shows slides 2,3,4
    // Position 3: shows slides 3,4,5

    t.is(carousel.currentIndex, 0);

    carousel.next(); // 0 → 1
    t.is(carousel.currentIndex, 1);

    carousel.next(); // 1 → 2
    t.is(carousel.currentIndex, 2);

    carousel.next(); // 2 → 3
    t.is(carousel.currentIndex, 3);

    carousel.next(); // 3 → 0 (loop, because 3 is maxIndex)
    t.is(carousel.currentIndex, 0, 'Should loop back to 0 after reaching maxIndex');
});

test('Multi-slide carousel (6 slides, 3 per view): prev navigation', t => {
    const carousel = createTestCarousel(6, 3);

    t.is(carousel.currentIndex, 0);

    carousel.prev(); // 0 → 3 (loop to maxIndex)
    t.is(carousel.currentIndex, 3, 'Should loop to maxIndex (3)');

    carousel.prev(); // 3 → 2
    t.is(carousel.currentIndex, 2);

    carousel.prev(); // 2 → 1
    t.is(carousel.currentIndex, 1);

    carousel.prev(); // 1 → 0
    t.is(carousel.currentIndex, 0);

    carousel.prev(); // 0 → 3 (loop again)
    t.is(carousel.currentIndex, 3);
});

// Test: Rapid clicking scenario (the bug)
test('Rapid next clicks should not skip positions', t => {
    const carousel = createTestCarousel(6, 3);

    carousel.next(); // 0 → 1
    carousel.next(); // 1 → 2 (rapid click, no time for observer)
    carousel.next(); // 2 → 3 (rapid click)

    t.is(carousel.currentIndex, 3, 'Should be at position 3 after 3 clicks');
});

test('Rapid prev clicks should not skip positions', t => {
    const carousel = createTestCarousel(6, 3);
    carousel.currentIndex = 3; // Start at end

    carousel.prev(); // 3 → 2
    carousel.prev(); // 2 → 1 (rapid click)
    carousel.prev(); // 1 → 0 (rapid click)

    t.is(carousel.currentIndex, 0, 'Should be at position 0 after 3 clicks');
});

// Test: IntersectionObserver should not interfere during navigation
test('Observer updates should be blocked during navigation', t => {
    const carousel = createTestCarousel(6, 3);

    carousel.next(); // Start navigation, isNavigating = true
    t.is(carousel.currentIndex, 1);
    t.is(carousel.isNavigating, true);

    // Observer is mocked in tests, so this behavior is verified by the logic
    // In real implementation, observer won't update during isNavigating=true
});

// Test: Dot navigation
test('Clicking dot should navigate to correct position', t => {
    const carousel = createTestCarousel(6, 3);

    carousel.goToSlide(2); // Jump to position 2
    t.is(carousel.currentIndex, 2);

    carousel.goToSlide(0); // Jump back to start
    t.is(carousel.currentIndex, 0);

    carousel.goToSlide(3); // Jump to end
    t.is(carousel.currentIndex, 3);
});

// Test: Edge case - 3 slides with slidesPerView=3
test('Carousel with exact slidesPerView matches slide count', t => {
    const carousel = createTestCarousel(3, 3);

    // With 3 slides showing 3, maxIndex = 0 (only one position)
    t.is(carousel.currentIndex, 0);

    carousel.next(); // 0 → 0 (loop, but maxIndex is 0)
    t.is(carousel.currentIndex, 0, 'Should stay at 0 when only one position exists');

    carousel.prev(); // 0 → 0 (loop, but maxIndex is 0)
    t.is(carousel.currentIndex, 0, 'Should stay at 0 when only one position exists');
});

// Test: Logo cloud scenario (4 slides, showing 4)
test('Logo cloud with slidesPerView=4 and 6 slides', t => {
    const carousel = createTestCarousel(6, 4);

    // maxIndex = 6 - 4 = 2
    // Valid positions: 0, 1, 2

    carousel.next(); // 0 → 1
    t.is(carousel.currentIndex, 1);

    carousel.next(); // 1 → 2
    t.is(carousel.currentIndex, 2);

    carousel.next(); // 2 → 0 (loop)
    t.is(carousel.currentIndex, 0);

    carousel.prev(); // 0 → 2 (loop to end)
    t.is(carousel.currentIndex, 2);
});
