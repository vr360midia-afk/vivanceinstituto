document.addEventListener('DOMContentLoaded', () => {
    // 1. Header Scroll Effect
    const header = document.getElementById('header');
    
    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // WhatsApp button visibility
        const floatingWa = document.querySelector('.floating-whatsapp');
        if (floatingWa) {
            if (window.scrollY > 400) {
                floatingWa.classList.add('show');
            } else {
                floatingWa.classList.remove('show');
            }
        }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Trigger on load in case page is already scrolled
    handleScroll();

    // 2. Mobile Menu Toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    
    mobileToggle.addEventListener('click', () => {
        header.classList.toggle('menu-open');
        document.body.style.overflow = header.classList.contains('menu-open') ? 'hidden' : '';
    });

    // Close menu when clicking a link
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (header.classList.contains('menu-open')) {
                header.classList.remove('menu-open');
                document.body.style.overflow = '';
            }
        });
    });

    // 3. Staggered Fade-Up Animations on Scroll
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        // Group entries that are intersecting
        const intersectingEntries = entries.filter(entry => entry.isIntersecting);
        
        intersectingEntries.forEach((entry, index) => {
            // Apply staggered delay based on index in the current batch
            const delay = index * 0.15; // 150ms stagger
            entry.target.style.transitionDelay = `${delay}s`;
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        });
    }, observerOptions);

    const animateElements = document.querySelectorAll('.service-card, .section-header, .sobre-content, .sobre-image, .loc-content, .metodologia-content, .metodologia-image, .clinica-wrap, .social-card');
    
    animateElements.forEach(el => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!prefersReducedMotion) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(40px)';
            el.style.transition = 'opacity 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
            observer.observe(el);
        }
    });


    // Optional: Re-trigger SVG animation when 'sobre' section comes into view
    const svgObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const path = entry.target.querySelector('path');
                if (path) {
                    // Reset animation by removing and re-adding
                    path.style.animation = 'none';
                    path.offsetHeight; /* trigger reflow */
                    path.style.animation = 'drawPath 2s ease-out forwards';
                }
            }
        });
    }, { threshold: 0.5 });

    const sobreSvg = document.querySelector('.signature-line-small');
    if (sobreSvg) {
        svgObserver.observe(sobreSvg);
    }

    // 4. Lightbox functionality for Galleries
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    
    let currentLightboxImages = [];
    let currentLightboxIndex = 0;

    const updateLightboxImage = () => {
        if (currentLightboxImages.length > 0) {
            lightboxImg.src = currentLightboxImages[currentLightboxIndex].src;
        }
    };

    if (lightbox) {
        // Find all galleries and attach click handlers
        const galleries = document.querySelectorAll('.clinica-gallery');
        galleries.forEach(gallery => {
            const images = Array.from(gallery.querySelectorAll('.clinica-image img, .resultado-card img'));
            images.forEach((img, index) => {
                img.parentElement.addEventListener('click', () => {
                    currentLightboxImages = images;
                    currentLightboxIndex = index;
                    updateLightboxImage();
                    lightbox.classList.add('active');
                });
            });
        });

        // Close when clicking the close button
        if (lightboxClose) {
            lightboxClose.addEventListener('click', () => {
                lightbox.classList.remove('active');
            });
        }

        // Close when clicking outside the image or buttons
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove('active');
            }
        });

        // Navigation
        const nextImage = () => {
            if (currentLightboxImages.length > 0) {
                currentLightboxIndex = (currentLightboxIndex + 1) % currentLightboxImages.length;
                updateLightboxImage();
            }
        };

        const prevImage = () => {
            if (currentLightboxImages.length > 0) {
                currentLightboxIndex = (currentLightboxIndex - 1 + currentLightboxImages.length) % currentLightboxImages.length;
                updateLightboxImage();
            }
        };

        if (lightboxNext) lightboxNext.addEventListener('click', nextImage);
        if (lightboxPrev) lightboxPrev.addEventListener('click', prevImage);

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (lightbox.classList.contains('active')) {
                if (e.key === 'Escape') lightbox.classList.remove('active');
                if (e.key === 'ArrowRight') nextImage();
                if (e.key === 'ArrowLeft') prevImage();
            }
        });

        // 5. Auto-scroll and Dots for Galleries
        const scrollGalleries = document.querySelectorAll('.clinica-gallery');
        
        scrollGalleries.forEach(gallery => {
            const dotsContainer = gallery.parentElement.querySelector('.gallery-dots');
            const currentGalleryImages = gallery.querySelectorAll('.clinica-image img');
            
            if (gallery && currentGalleryImages.length > 0) {
                let scrollInterval;
                let isPaused = false;
                let dots = [];

                // Create dots
                if (dotsContainer) {
                    currentGalleryImages.forEach((_, index) => {
                        const dot = document.createElement('div');
                        dot.classList.add('gallery-dot');
                        if (index === 0) dot.classList.add('active');
                        
                        dot.addEventListener('click', () => {
                            const itemWidth = currentGalleryImages[0].parentElement.offsetWidth + 24;
                            gallery.scrollTo({ left: itemWidth * index, behavior: 'smooth' });
                            updateDots(index);
                            
                            clearInterval(scrollInterval);
                            startAutoScroll();
                        });
                        
                        dotsContainer.appendChild(dot);
                        dots.push(dot);
                    });
                }

                const updateDots = (activeIndex) => {
                    dots.forEach((dot, index) => {
                        dot.classList.toggle('active', index === activeIndex);
                    });
                };

                gallery.addEventListener('scroll', () => {
                    const itemWidth = currentGalleryImages[0].parentElement.offsetWidth + 24;
                    const activeIndex = Math.round(gallery.scrollLeft / itemWidth);
                    if(dots.length > 0) updateDots(activeIndex);
                }, { passive: true });

                const startAutoScroll = () => {
                    scrollInterval = setInterval(() => {
                        if (isPaused || lightbox.classList.contains('active')) return;
                        
                        const maxScroll = gallery.scrollWidth - gallery.clientWidth;
                        const itemWidth = currentGalleryImages[0].parentElement.offsetWidth + 24; 
                        
                        if (gallery.scrollLeft >= maxScroll - 10) {
                            gallery.scrollTo({ left: 0, behavior: 'smooth' });
                        } else {
                            gallery.scrollBy({ left: itemWidth, behavior: 'smooth' });
                        }
                    }, 3000);
                };

                startAutoScroll();

                gallery.addEventListener('mouseenter', () => isPaused = true);
                gallery.addEventListener('mouseleave', () => isPaused = false);
                gallery.addEventListener('touchstart', () => isPaused = true);
                gallery.addEventListener('touchend', () => {
                    setTimeout(() => isPaused = false, 2000);
                });
            }
        });
    }

    // 6. FAQ Accordion
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const isActive = question.classList.contains('active');
            
            // Close all others
            faqQuestions.forEach(q => {
                q.classList.remove('active');
                q.nextElementSibling.style.maxHeight = null;
            });

            // If it wasn't active, open it
            if (!isActive) {
                question.classList.add('active');
                const answer = question.nextElementSibling;
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });
});
