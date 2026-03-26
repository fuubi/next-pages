export class CarouselController {
  container: HTMLElement;
  track: HTMLElement;
  slides: HTMLElement[];
  prevButtons: HTMLButtonElement[];
  nextButtons: HTMLButtonElement[];
  indicatorContainers: HTMLElement[];
  currentIndex: number = 0;
  autoplayInterval: number | null = null;
  observer: IntersectionObserver | null = null;
  isNavigating: boolean = false; // Prevent observer interference during navigation
  carouselId: string;
  config: {
    autoplay: boolean;
    initialSlidesPerView: number;
  };

  constructor(element: HTMLElement) {
    this.container = element;
    this.track = element.querySelector('.carousel-track')!;
    this.slides = Array.from(this.track.children) as HTMLElement[];
    this.carouselId = element.dataset.carouselId || '';

    this.config = {
      autoplay: element.dataset.autoplay === 'true',
      initialSlidesPerView: parseInt(element.dataset.slidesPerView || '1')
    };

    // Find controls - now searches parent container too
    this.prevButtons = this.findControls('.carousel-prev');
    this.nextButtons = this.findControls('.carousel-next');
    this.indicatorContainers = this.findControls('.carousel-indicators');

    this.init();
  }

  /**
   * Calculate current slides per view based on window width and responsive CSS
   */
  getCurrentSlidesPerView(): number {
    const width = window.innerWidth;
    const initial = this.config.initialSlidesPerView;

    // Mobile: max-width 480px - always 1 slide (except when initial is 1)
    if (width <= 480) {
      return 1;
    }

    // Tablet: max-width 768px - 2 slides for multi-slide carousels
    if (width <= 768) {
      return initial === 1 ? 1 : 2;
    }

    // Desktop: use initial config
    return initial;
  }

  /**
   * Find control elements within carousel container OR parent container
   * Searches both the carousel itself and its parent for controls
   * This allows controls to be in CarouselContainer slots (outside .carousel-base)
   */
  findControls<T extends HTMLElement>(selector: string): T[] {
    // First check within the carousel itself (for old slot pattern)
    const internalControls = Array.from(this.container.querySelectorAll<T>(selector));

    // Search up the DOM tree to find if we're inside a CarouselContainer
    let element: HTMLElement | null = this.container.parentElement;
    while (element) {
      // Check if we found a carousel-container
      if (element.classList.contains('carousel-container')) {
        const externalControls = Array.from(element.querySelectorAll<T>(selector));
        return [...internalControls, ...externalControls];
      }
      // Check if we found carousel-zone-center (we're inside CarouselContainer)
      if (element.classList.contains('carousel-zone-center')) {
        const containerRoot = element.closest('.carousel-container');
        if (containerRoot) {
          const externalControls = Array.from(containerRoot.querySelectorAll<T>(selector));
          return [...internalControls, ...externalControls];
        }
      }
      element = element.parentElement;
    }

    return internalControls;
  }

  init() {
    // Create initial dots
    this.recreateDots();

    // Setup IntersectionObserver for active slide detection
    this.setupObserver();

    // Event listeners - attach to all buttons
    this.prevButtons.forEach(btn => btn.addEventListener('click', () => this.prev()));
    this.nextButtons.forEach(btn => btn.addEventListener('click', () => this.next()));

    // Handle window resize - recreate dots for correct responsive behavior
    let resizeTimeout: number;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        this.recreateDots();
      }, 100);
    });

    // Start autoplay if enabled
    if (this.config.autoplay) {
      this.startAutoplay();
    }

    // Pause autoplay on hover
    this.container.addEventListener('mouseenter', () => this.stopAutoplay());
    this.container.addEventListener('mouseleave', () => {
      if (this.config.autoplay) this.startAutoplay();
    });

    // Update button states
    this.updateButtons();
  }

  /**
   * Recreate dots based on current viewport
   */
  recreateDots() {
    const currentSlidesPerView = this.getCurrentSlidesPerView();
    const numDots = this.slides.length - currentSlidesPerView + 1;

    this.indicatorContainers.forEach(indicators => {
      // Clear existing dots
      indicators.innerHTML = '';

      // Create correct number of dots for current viewport
      for (let i = 0; i < numDots; i++) {
        const dot = document.createElement('button');
        dot.classList.add('carousel-dot');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        if (i === this.currentIndex) dot.classList.add('active');
        dot.addEventListener('click', () => this.goToSlide(i));
        indicators.appendChild(dot);
      }
    });
  }

  setupObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5 && !this.isNavigating) {
            const slideIndex = this.slides.indexOf(entry.target as HTMLElement);
            this.updateDots(slideIndex);
            this.currentIndex = slideIndex;
            this.updateButtons();
          }
        });
      },
      {
        root: this.track,
        threshold: 0.5
      }
    );

    this.slides.forEach((slide) => this.observer!.observe(slide));
  }

  updateDots(activeIndex: number) {
    // Update dots in all indicator containers
    this.indicatorContainers.forEach(indicators => {
      const dots = indicators.querySelectorAll('.carousel-dot');
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === activeIndex);
      });
    });
  }

  updateButtons() {
    // Buttons are always enabled since carousel always loops
  }

  scrollToSlide(index: number) {
    const slide = this.slides[index];
    if (slide) {
      this.isNavigating = true; // Block observer updates
      this.currentIndex = index;
      this.updateDots(index); // Update dots immediately

      const slideOffsetLeft = slide.offsetLeft;
      this.track.scrollTo({
        left: slideOffsetLeft,
        behavior: 'smooth'
      });

      // Re-enable observer after scroll completes
      setTimeout(() => {
        this.isNavigating = false;
      }, 500); // Smooth scroll typically takes ~300-400ms
    }
  }

  next() {
    const currentSlidesPerView = this.getCurrentSlidesPerView();
    const maxIndex = this.slides.length - currentSlidesPerView;
    let nextIndex = this.currentIndex + 1; // Move one slide at a time

    if (nextIndex > maxIndex) {
      nextIndex = 0; // Always loop back to start
    }

    this.scrollToSlide(nextIndex);
  }

  prev() {
    const currentSlidesPerView = this.getCurrentSlidesPerView();
    const maxIndex = this.slides.length - currentSlidesPerView;
    let prevIndex = this.currentIndex - 1; // Move one slide at a time

    if (prevIndex < 0) {
      prevIndex = maxIndex; // Loop to the last valid position
    }

    this.scrollToSlide(prevIndex);
  }

  goToSlide(dotIndex: number) {
    this.scrollToSlide(dotIndex); // dotIndex IS the slide index now
  }

  startAutoplay() {
    this.stopAutoplay();
    this.autoplayInterval = window.setInterval(() => {
      this.next();
    }, 3000); // 3 second default
  }

  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }
}
