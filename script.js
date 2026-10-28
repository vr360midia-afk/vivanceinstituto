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

    // 7. Centralização do WhatsApp Personalizado por Serviço e Rastreamento (whatsapp_click)
    const VIVANCE_WA_NUMBER = '5582982120707';
    const VIVANCE_WA_BASE = 'https://wa.me/' + VIVANCE_WA_NUMBER;
    const VIVANCE_DEFAULT_MSG = 'Olá! Vim pelo site do Instituto Vivance e gostaria de agendar uma avaliação.';

    // Mapeamento explícito entre páginas e serviços oficiais confirmados
    const PAGE_SERVICE_MAP = {
        '/emagrecimento-maceio': 'Emagrecimento',
        '/clinica-emagrecimento-maceio': 'Emagrecimento',
        '/medico-para-emagrecer-maceio': 'Emagrecimento',
        '/artigo-emagrecimento-maceio': 'Emagrecimento',
        '/artigo-ozempic-maceio': 'Emagrecimento',
        '/tratamento-obesidade-maceio': 'Tratamento da Obesidade',
        '/tratamento-sobrepeso-maceio': 'Tratamento do Sobrepeso',
        '/bioimpedancia-maceio': 'Bioimpedância',
        '/artigo-bioimpedancia-maceio': 'Bioimpedância',
        '/menopausa-maceio': 'Tratamento da Menopausa',
        '/artigo-menopausa-emagrecimento': 'Tratamento da Menopausa',
        '/saude-intestinal-maceio': 'Saúde Intestinal',
        '/envelhecimento-saudavel-maceio': 'Longevidade',
        '/nutrologo-maceio': 'Nutrologia',
        '/medicina-integrativa-maceio': 'Medicina Integrativa',
        '/tratamento-fibromialgia-maceio': 'Tratamento de Fibromialgia',
        '/tratamentos-injetaveis-maceio': 'Tratamentos Injetáveis',
        '/artigo-soroterapia-implantes': 'Implantes Hormonais e Tratamentos Injetáveis',
        '/testes-de-forca-maceio': 'Testes de Força',
        '/polissonografia-portatil-maceio': 'Polissonografia Portátil',
        '/calorimetria-indireta-maceio': 'Calorimetria Indireta',
        '/exame-mineralograma-maceio': 'Mineralograma',
        '/teste-intolerancia-alimentar-maceio': 'Teste de Intolerância Alimentar',
        '/exame-microbiota-intestinal-maceio': 'Exame de Microbiota Intestinal',
        '/teste-genetico-emagrecimento': 'Teste Genético',
        '/implantes-hormonais-maceio': 'Implantes Hormonais'
    };

    function normalizePagePath(rawPath) {
        if (!rawPath) return '/';
        let p = rawPath.toLowerCase().trim();
        p = p.replace(/^\/paginas\//, '/');
        p = p.replace(/\.html$/, '');
        p = p.replace(/\/+$/, '');
        if (p === '' || p === '/index') return '/';
        return p.startsWith('/') ? p : '/' + p;
    }

    function encodeWhatsAppText(text) {
        return encodeURIComponent(text).replace(/!/g, '%21');
    }

    function getVivanceServiceForElement(el) {
        // Prioridade 1: Serviço explicitamente associado ao botão
        if (el && el.getAttribute) {
            const explicitService = el.getAttribute('data-whatsapp-service');
            if (explicitService && explicitService.trim() !== '') {
                return explicitService.trim();
            }
        }
        // Prioridade 2: Serviço associado à página atual via mapeamento explícito
        const currentPath = normalizePagePath(window.location.pathname);
        if (Object.prototype.hasOwnProperty.call(PAGE_SERVICE_MAP, currentPath)) {
            return PAGE_SERVICE_MAP[currentPath];
        }
        // Prioridade 3: Nenhum serviço específico (usa mensagem padrão)
        return null;
    }

    function buildVivanceWhatsAppUrl(el) {
        const service = getVivanceServiceForElement(el);
        const message = service
            ? 'Olá! Vim pelo site do Instituto Vivance e gostaria de saber mais sobre ' + service + '.'
            : VIVANCE_DEFAULT_MSG;
        return VIVANCE_WA_BASE + '?text=' + encodeWhatsAppText(message);
    }

    function detectSiteSection(el) {
        if (!el) return 'geral';
        const explicitSection = el.getAttribute('data-whatsapp-section');
        if (explicitSection) return explicitSection;
        if (el.classList.contains('floating-whatsapp')) return 'floating_button';
        if (el.closest('header, .header')) return 'header';
        if (el.closest('.hero, #inicio')) return 'hero';
        if (el.closest('#servicos')) return 'servicos';
        if (el.closest('#metodologia')) return 'metodologia';
        if (el.closest('#sobre')) return 'sobre';
        if (el.closest('#localizacao')) return 'localizacao';
        if (el.closest('#faq, .faq-section')) return 'faq';
        if (el.closest('.cta-box')) return 'article_cta';
        if (el.closest('article, .blog-content, main')) return 'main_content';
        if (el.closest('footer, .footer')) return 'footer';
        return 'geral';
    }

    function detectButtonId(el, index) {
        if (!el) return 'wa_btn_' + index;
        const explicitId = el.getAttribute('data-whatsapp-id') || el.id;
        if (explicitId) return explicitId;
        if (el.classList.contains('floating-whatsapp')) return 'wa_floating';
        const section = detectSiteSection(el);
        return 'wa_' + section + '_' + (index + 1);
    }

    function trackWhatsAppClick(el, index) {
        try {
            if (typeof window.loadGA === 'function') {
                window.loadGA();
            }
            const originPage = normalizePagePath(window.location.pathname);
            const siteSection = detectSiteSection(el);
            const buttonId = detectButtonId(el, index);

            // Parâmetros estritamente não sensíveis (sem enviar interesse médico, mensagem ou dados pessoais)
            const eventParams = {
                origin_page: originPage,
                button_id: buttonId,
                site_section: siteSection
            };

            window.dataLayer = window.dataLayer || [];
            if (typeof window.gtag === 'function') {
                window.gtag('event', 'whatsapp_click', eventParams);
            } else {
                window.dataLayer.push(Object.assign({ event: 'whatsapp_click' }, eventParams));
            }
        } catch (err) {
            // Silencioso para nunca interromper a navegação ao WhatsApp
        }
    }

    // Aplica URL personalizada e rastreamento em todos os botões oficiais de WhatsApp da clínica
    const allLinks = document.querySelectorAll('a[href*="wa.me/"]');
    allLinks.forEach((link, idx) => {
        const rawHref = link.getAttribute('href') || '';
        // Preserva intocados contatos legítimos de terceiros (ex: crédito do desenvolvedor no rodapé)
        if (!rawHref.includes(VIVANCE_WA_NUMBER) && !rawHref.includes('98773')) {
            return;
        }
        const personalizedUrl = buildVivanceWhatsAppUrl(link);
        link.setAttribute('href', personalizedUrl);

        if (!link.getAttribute('data-whatsapp-section')) {
            link.setAttribute('data-whatsapp-section', detectSiteSection(link));
        }
        if (!link.getAttribute('data-whatsapp-id')) {
            link.setAttribute('data-whatsapp-id', detectButtonId(link, idx));
        }

        link.addEventListener('click', function () {
            trackWhatsAppClick(link, idx);
        });
    });

    // Expõe utilitário centralizado caso necessário em novos componentes
    window.VivanceWhatsApp = {
        getUrl: buildVivanceWhatsAppUrl,
        getService: getVivanceServiceForElement
    };
});
