/**
 * Animation utilities using Motion One
 * Best practices for performant, accessible animations
 */

import { animate, inView, scroll, stagger } from 'motion';

function prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function animateOnScroll(
    selector: string,
    animation: Record<string, any> = {},
    options: { once?: boolean; amount?: number; margin?: string } = {}
) {
    if (prefersReducedMotion()) return;

    const elements = document.querySelectorAll(selector);

    elements.forEach((element) => {
        (element as HTMLElement).style.willChange = 'transform, opacity';

        inView(
            element as HTMLElement,
            () => {
                animate(
                    element as HTMLElement,
                    {
                        opacity: [0, 1],
                        transform: ['translateY(20px)', 'translateY(0)'],
                        ...animation,
                    },
                    {
                        duration: 0.6,
                        easing: [0.0, 0, 0.2, 1],
                    }
                );

                setTimeout(() => {
                    (element as HTMLElement).style.willChange = 'auto';
                }, 600);
            },
            {
                amount: options.amount ?? 0.3,
                margin: options.margin ?? '0px 0px -10% 0px',
            }
        );
    });
}

export function staggerOnScroll(
    selector: string,
    animation: Record<string, any> = {},
    options: { delay?: number; amount?: number } = {}
) {
    if (prefersReducedMotion()) return;

    const container = document.querySelector(selector);
    if (!container) return;

    const children = Array.from(container.children) as HTMLElement[];

    children.forEach(child => {
        child.style.willChange = 'transform, opacity';
        child.style.transform = 'translateZ(0)';
    });

    inView(
        container as HTMLElement,
        () => {
            animate(
                children,
                {
                    opacity: [0, 1],
                    transform: ['translateY(30px)', 'translateY(0)'],
                    ...animation,
                },
                {
                    duration: 0.5,
                    delay: stagger(options.delay ?? 0.08),
                    easing: [0.0, 0, 0.2, 1],
                }
            );

            setTimeout(() => {
                children.forEach(child => {
                    child.style.willChange = 'auto';
                });
            }, 1000);
        },
        {
            amount: options.amount ?? 0.15,
        }
    );
}

export function fadeIn(
    selector: string,
    options: { duration?: number; delay?: number } = {}
) {
    if (prefersReducedMotion()) return;

    const elements = document.querySelectorAll(selector);

    animate(
        Array.from(elements) as HTMLElement[],
        { opacity: [0, 1] },
        {
            duration: options.duration ?? 0.8,
            delay: options.delay ?? 0,
            easing: [0.0, 0, 0.2, 1],
        }
    );
}

export function animateCounter(
    element: HTMLElement,
    target: number,
    options: { duration?: number; decimals?: number } = {}
) {
    if (prefersReducedMotion()) {
        element.textContent = target.toFixed(options.decimals ?? 0);
        return;
    }

    const duration = options.duration ?? 2;
    const decimals = options.decimals ?? 0;

    inView(element, () => {
        animate(
            (progress: number) => {
                const value = progress * target;
                element.textContent = value.toFixed(decimals);
            },
            {
                duration,
                easing: [0.0, 0, 0.2, 1]
            }
        );
    }, {
        amount: 0.5
    });
}

export function parallaxScroll(
    selector: string,
    options: { speed?: number } = {}
) {
    if (prefersReducedMotion()) return;

    const elements = document.querySelectorAll(selector);
    const speed = options.speed ?? 0.5;

    elements.forEach((element) => {
        (element as HTMLElement).style.transform = 'translateZ(0)';
        (element as HTMLElement).style.willChange = 'transform';

        scroll(
            animate(element as HTMLElement, {
                transform: [`translate3d(0, 0, 0)`, `translate3d(0, ${speed * 100}px, 0)`],
            }),
            {
                target: element as HTMLElement,
                offset: ['start end', 'end start'],
            }
        );
    });
}

export function hoverScale(
    selector: string,
    scale: number = 1.05
) {
    if (prefersReducedMotion()) return;

    const elements = document.querySelectorAll(selector);

    elements.forEach((element) => {
        const el = element as HTMLElement;

        el.style.transform = 'translateZ(0)';
        el.style.transition = 'transform 0.3s cubic-bezier(0.0, 0, 0.2, 1)';

        el.addEventListener('mouseenter', () => {
            el.style.transform = `scale(${scale}) translateZ(0)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = 'scale(1) translateZ(0)';
        });

        el.addEventListener('touchstart', () => {
            el.style.transform = `scale(${scale}) translateZ(0)`;
        }, { passive: true });

        el.addEventListener('touchend', () => {
            el.style.transform = 'scale(1) translateZ(0)';
        }, { passive: true });
    });
}

export function initAnimations() {
    if (prefersReducedMotion()) {
        document.querySelectorAll('[data-animate]').forEach(el => {
            (el as HTMLElement).style.opacity = '1';
        });
        return;
    }

    animateOnScroll('[data-animate="fade"]');

    animateOnScroll('[data-animate="slide-up"]', {
        transform: ['translateY(40px)', 'translateY(0)'],
    });

    animateOnScroll('[data-animate="slide-left"]', {
        transform: ['translateX(-40px)', 'translateX(0)'],
    });

    animateOnScroll('[data-animate="slide-right"]', {
        transform: ['translateX(40px)', 'translateX(0)'],
    });

    animateOnScroll('[data-animate="scale"]', {
        transform: ['scale(0.9)', 'scale(1)'],
    });

    const staggerContainers = document.querySelectorAll('[data-animate="stagger"]');
    staggerContainers.forEach((container) => {
        const id = container.id;
        if (id) {
            staggerOnScroll(`#${id}`, {}, { delay: 0.08 });
        }
    });

    const counters = document.querySelectorAll('[data-counter]');
    counters.forEach((counter) => {
        const target = parseInt((counter as HTMLElement).dataset.counter || '0', 10);
        const decimals = parseInt((counter as HTMLElement).dataset.decimals || '0', 10);
        animateCounter(counter as HTMLElement, target, { decimals });
    });

    hoverScale('[data-hover="scale"]', 1.03);

    if (window.innerWidth > 1024) {
        parallaxScroll('[data-parallax]', { speed: 0.3 });
    }

    initSmoothScroll();
}

function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = (link as HTMLAnchorElement).getAttribute('href');
            if (!href || href === '#') return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();

            if (prefersReducedMotion()) {
                target.scrollIntoView();
            } else {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }

            history.pushState(null, '', href);
        });
    });
}


/**
 * Check if user prefers reduced motion
 */
function prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Animate elements when they enter the viewport
 * Optimized with Intersection Observer
 */
export function animateOnScroll(
    selector: string,
    animation: Record<string, any> = {},
    options: { once?: boolean; amount?: number; margin?: string } = {}
) {
    if (prefersReducedMotion()) return;

    const elements = document.querySelectorAll(selector);

    elements.forEach((element) => {
        // Add will-change for performance hint
        (element as HTMLElement).style.willChange = 'transform, opacity';

        inView(
            element as HTMLElement,
            () => {
                animate(
                    element as HTMLElement,
                    {
                        opacity: [0, 1],
                        transform: ['translateY(20px)', 'translateY(0)'],
                        ...animation,
                    },
                    {
                        duration: 0.6,
                        easing: [0.0, 0, 0.2, 1],
                    }
                );

                // Remove will-change after animation
                setTimeout(() => {
                    (element as HTMLElement).style.willChange = 'auto';
                }, 600);
            },
            {
                amount: options.amount ?? 0.3,
                margin: options.margin ?? '0px 0px -10% 0px',
            }
        );
    });
}

/**
 * Stagger animation for multiple elements (cards, features, etc.)
 * Optimized for performance with GPU acceleration
 */
export function staggerOnScroll(
    selector: string,
    animation: Record<string, any> = {},
    options: { delay?: number; amount?: number } = {}
) {
    if (prefersReducedMotion()) return;

    const container = document.querySelector(selector);
    if (!container) return;

    const children = Array.from(container.children) as HTMLElement[];

    // Add hardware acceleration hint
    children.forEach(child => {
        child.style.willChange = 'transform, opacity';
        child.style.transform = 'translateZ(0)';
    });

    inView(
        container as HTMLElement,
        () => {
            animate(
                children,
                {
                    opacity: [0, 1],
                    transform: ['translateY(30px)', 'translateY(0)'],
                    ...animation,
                },
                {
                    duration: 0.5,
                    delay: stagger(options.delay ?? 0.08),
                    easing: [0.0, 0, 0.2, 1],
                }
            );

            // Clean up will-change
            setTimeout(() => {
                children.forEach(child => {
                    child.style.willChange = 'auto';
                });
            }, 1000);
        },
        {
            amount: options.amount ?? 0.15,
        }
    );
}

/**
 * Fade in animation
 * Simple, accessible fade
 */
export function fadeIn(
    selector: string,
    options: { duration?: number; delay?: number } = {}
) {
    if (prefersReducedMotion()) return;

    const elements = document.querySelectorAll(selector);

    animate(
        Array.from(elements) as HTMLElement[],
        { opacity: [0, 1] },
        {
            duration: options.duration ?? 0.8,
            delay: options.delay ?? 0,
            easing: [0.0, 0, 0.2, 1],
        }
    );
}

/**
 * Animate numbers counting up
 * Accessible and performant
 */
export function animateCounter(
    element: HTMLElement,
    target: number,
    options: { duration?: number; decimals?: number } = {}
) {
    if (prefersReducedMotion()) {
        element.textContent = target.toFixed(options.decimals ?? 0);
        return;
    }

    const duration = options.duration ?? 2;
    const decimals = options.decimals ?? 0;

    inView(element, () => {
        animate(
            (progress: number) => {
                const value = progress * target;
                element.textContent = value.toFixed(decimals);
            },
            {
                duration,
                easing: [0.0, 0, 0.2, 1]
            }
        );
    }, {
        amount: 0.5
    });
}

/**
 * Parallax scroll effect
 * Performance-optimized with transform3d
 */
export function parallaxScroll(
    selector: string,
    options: { speed?: number } = {}
) {
    if (prefersReducedMotion()) return;

    const elements = document.querySelectorAll(selector);
    const speed = options.speed ?? 0.5;

    elements.forEach((element) => {
        (element as HTMLElement).style.transform = 'translateZ(0)';
        (element as HTMLElement).style.willChange = 'transform';

        scroll(
            animate(element as HTMLElement, {
                transform: [`translate3d(0, 0, 0)`, `translate3d(0, ${speed * 100}px, 0)`],
            }),
            {
                target: element as HTMLElement,
                offset: ['start end', 'end start'],
            }
        );
    });
}

/**
 * Scale on hover
 * Smooth, hardware-accelerated hover effect
 */
export function hoverScale(
    selector: string,
    scale: number = 1.05
) {
    if (prefersReducedMotion()) return;

    const elements = document.querySelectorAll(selector);

    elements.forEach((element) => {
        const el = element as HTMLElement;

        el.style.transform = 'translateZ(0)';
        el.style.transition = 'transform 0.3s cubic-bezier(0.0, 0, 0.2, 1)';

        el.addEventListener('mouseenter', () => {
            el.style.transform = `scale(${scale}) translateZ(0)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = 'scale(1) translateZ(0)';
        });

        el.addEventListener('touchstart', () => {
            el.style.transform = `scale(${scale}) translateZ(0)`;
        }, { passive: true });

        el.addEventListener('touchend', () => {
            el.style.transform = 'scale(1) translateZ(0)';
        }, { passive: true });
    });
}

/**
 * Initialize common animations
 * Auto-discovers elements with data attributes and applies animations
 */
export function initAnimations() {
    if (prefersReducedMotion()) {
        document.querySelectorAll('[data-animate]').forEach(el => {
            (el as HTMLElement).style.opacity = '1';
        });
        return;
    }

    // Fade in elements
    animateOnScroll('[data-animate="fade"]');

    // Slide animations
    animateOnScroll('[data-animate="slide-up"]', {
        transform: ['translateY(40px)', 'translateY(0)'],
    });

    animateOnScroll('[data-animate="slide-left"]', {
        transform: ['translateX(-40px)', 'translateX(0)'],
    });

    animateOnScroll('[data-animate="slide-right"]', {
        transform: ['translateX(40px)', 'translateX(0)'],
    });

    // Scale animations
    animateOnScroll('[data-animate="scale"]', {
        transform: ['scale(0.9)', 'scale(1)'],
    });

    // Stagger animation
    const staggerContainers = document.querySelectorAll('[data-animate="stagger"]');
    staggerContainers.forEach((container) => {
        const id = container.id;
        if (id) {
            staggerOnScroll(`#${id}`, {}, { delay: 0.08 });
        }
    });

    // Animate counters
    const counters = document.querySelectorAll('[data-counter]');
    counters.forEach((counter) => {
        const target = parseInt((counter as HTMLElement).dataset.counter || '0', 10);
        const decimals = parseInt((counter as HTMLElement).dataset.decimals || '0', 10);
        animateCounter(counter as HTMLElement, target, { decimals });
    });

    // Hover effects
    hoverScale('[data-hover="scale"]', 1.03);

    // Parallax (desktop only)
    if (window.innerWidth > 1024) {
        parallaxScroll('[data-parallax]', { speed: 0.3 });
    }

    // Smooth scroll
    initSmoothScroll();
}

/**
 * Smooth scroll for anchor links
 */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = (link as HTMLAnchorElement).getAttribute('href');
            if (!href || href === '#') return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();

            if (prefersReducedMotion()) {
                target.scrollIntoView();
            } else {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }

            history.pushState(null, '', href);
        });
    });
}

scale: number = 1.05
) {
    if (prefersReducedMotion()) return;

    const elements = document.querySelectorAll(selector);

    elements.forEach((element) => {
        const el = element as HTMLElement;

        // Set up 3D context for better performance
        el.style.transform = 'translateZ(0)';
        el.style.transition = 'transform 0.3s cubic-bezier(0.0, 0, 0.2, 1)';

        el.addEventListener('mouseenter', () => {
            el.style.transform = `scale(${scale}) translateZ(0)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = 'scale(1) translateZ(0)';
        });

        // Touch devices: add active state
        el.addEventListener('touchstart', () => {
            el.style.transform = `scale(${scale}) translateZ(0)`;
        }, { passive: true });

        el.addEventListener('touchend', () => {
            el.style.transform = 'scale(1) translateZ(0)';
        }, { passive: true });

        /**
         * Initialize common animations
         * Auto-discovers elements with data attributes and applies animations
         */
        export function initAnimations() {
            // Skip if user prefers reduced motion
            if (prefersReducedMotion()) {
                // Ensure all elements are visible
                document.querySelectorAll('[data-animate]').forEach(el => {
                    (el as HTMLElement).style.opacity = '1';
                });
                return;
            }

            // Fade in elements with data-animate attribute
            animateOnScroll('[data-animate="fade"]');

            // Slide animations
            animateOnScroll('[data-animate="slide-up"]', {
                transform: ['translateY(40px)', 'translateY(0)'],
            });

            animateOnScroll('[data-animate="slide-left"]', {
                transform: ['translateX(-40px)', 'translateX(0)'],
            });

            animateOnScroll('[data-animate="slide-right"]', {
                transform: ['translateX(40px)', 'translateX(0)'],
            });

            // Scale animations
            animateOnScroll('[data-animate="scale"]', {
                transform: ['scale(0.9)', 'scale(1)'],
            });

            // Stagger animation for grids and lists
            const staggerContainers = document.querySelectorAll('[data-animate="stagger"]');
            staggerContainers.forEach((container) => {
                const id = container.id;
                if (id) {
                    staggerOnScroll(`#${id}`, {}, { delay: 0.08 });
                }
            });

            // Animate counters
            const counters = document.querySelectorAll('[data-counter]');
            counters.forEach((counter) => {
                const target = parseInt((counter as HTMLElement).dataset.counter || '0', 10);
                const decimals = parseInt((counter as HTMLElement).dataset.decimals || '0', 10);
                animateCounter(counter as HTMLElement, target, { decimals });
            });

            // Hover effects on cards
            hoverScale('[data-hover="scale"]', 1.03);

            // Parallax effects (subtle, only on large screens)
            if (window.innerWidth > 1024) {
                parallaxScroll('[data-parallax]', { speed: 0.3 });
            }

            // Add smooth scroll behavior to anchor links
            initSmoothScroll();
        }

        /**
         * Smooth scroll for anchor links
         * Respects reduced motion preferences
         */
        function initSmoothScroll() {
            const links = document.querySelectorAll('a[href^="#"]');

            links.forEach(link => {
                link.addEventListener('click', (e) => {
                    const href = (link as HTMLAnchorElement).getAttribute('href');
                    if (!href || href === '#') return;

                    const target = document.querySelector(href);
                    if (!target) return;

                    e.preventDefault();

                    if (prefersReducedMotion()) {
                        target.scrollIntoView();
                    } else {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start',
                        });
                    }

                    // Update URL without jumping
                    history.pushState(null, '', href);
                });
            });
