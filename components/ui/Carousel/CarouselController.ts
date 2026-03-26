export class CarouselController {
    container: HTMLElement;
    track: HTMLElement;
    slides: HTMLElement[];
    prevButton: HTMLButtonElement | null;
    nextButton: HTMLButtonElement | null;
    indicators: HTMLElement | null;
    currentIndex: number = 0;
    autoplayInterval: number | null = null;
    observer: IntersectionObserver | null = null;
    isNavigating: boolean = false; // Prevent observer interference during navigation
    config: {
        autoplay: boolean;
        slidesPerView: number;
    };

    constructor(element: HTMLElement) {
        this.container = element;
        this.track = element.querySelector('.carousel-track')!;
        this.slides = Array.from(this.track.children) as HTMLElement[];
        this.prevButton = element.querySelector('.carousel-prev');
        this.nextButton = element.querySelector('.carousel-next');
        this.indicators = element.querySelector('.carousel-indicators');

        this.config = {
            autoplay: element.dataset.autoplay === 'true',
            slidesPerView: parseInt(element.dataset.slidesPerView || '1')
        };

        this.init();
    }

    init() {
        // Create indicators
        if (this.indicators) {
            const numDots = this.slides.length - this.config.slidesPerView + 1; // One dot per scroll position
            for (let i = 0; i < numDots; i++) {
                const dot = document.createElement('button');
                dot.classList.add('carousel-dot');
                dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
                if (i === 0) dot.classList.add('active');
                dot.addEventListener('click', () => this.goToSlide(i));
                this.indicators.appendChild(dot);
            }
        }

        // Setup IntersectionObserver for active slide detection
        this.setupObserver();

        // Event listeners
        this.prevButton?.addEventListener('click', () => this.prev());
        this.nextButton?.addEventListener('click', () => this.next());

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
        if (!this.indicators) return;
        const dots = this.indicators.querySelectorAll('.carousel-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === activeIndex);
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
        const maxIndex = this.slides.length - this.config.slidesPerView;
        let nextIndex = this.currentIndex + 1; // Move one slide at a time

        if (nextIndex > maxIndex) {
            nextIndex = 0; // Always loop back to start
        }

        this.scrollToSlide(nextIndex);
    }

    prev() {
        const maxIndex = this.slides.length - this.config.slidesPerView;
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
