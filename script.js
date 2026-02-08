// ========================================
// LSAK - Lubuk Salak Action Park
// Interactive Scripts
// ========================================

document.addEventListener('DOMContentLoaded', () => {

    // --- NAVIGATION SCROLL EFFECT ---
    const nav = document.getElementById('nav');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        if (currentScroll > 60) {
            nav.classList.add('nav--scrolled');
        } else {
            nav.classList.remove('nav--scrolled');
        }
        lastScroll = currentScroll;
    });

    // --- MOBILE MENU ---
    const burger = document.getElementById('navBurger');
    const mobileMenu = document.getElementById('mobileMenu');

    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // --- SCROLL ANIMATIONS (Intersection Observer) ---
    const animatedElements = document.querySelectorAll('[data-animate]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    });

    animatedElements.forEach(el => observer.observe(el));

    // --- COUNTER ANIMATION ---
    const counters = document.querySelectorAll('[data-count]');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-count'));
                animateCounter(entry.target, target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));

    function animateCounter(element, target) {
        let current = 0;
        const duration = 2000;
        const suffix = element.getAttribute('data-suffix') || '';
        const start = performance.now();

        function update(timestamp) {
            const elapsed = timestamp - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out quint
            const eased = 1 - Math.pow(1 - progress, 5);
            current = Math.round(eased * target);
            element.textContent = current + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    // --- CAROUSEL ---
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');

    if (track && prevBtn && nextBtn) {
        const cardWidth = () => {
            const card = track.querySelector('.activity-card');
            return card ? card.offsetWidth + 20 : 280;
        };

        let position = 0;

        const getMaxScroll = () => {
            const max = track.scrollWidth - track.parentElement.offsetWidth;
            return Math.max(0, max);
        };

        const updatePosition = (newPos) => {
            const max = getMaxScroll();
            position = Math.max(0, Math.min(newPos, max));
            track.style.transform = `translateX(-${position}px)`;
        };

        nextBtn.addEventListener('click', () => {
            updatePosition(position + cardWidth());
        });

        prevBtn.addEventListener('click', () => {
            updatePosition(position - cardWidth());
        });

        // Drag/swipe support
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let dragStartPos = 0;
        let directionLocked = false;
        let isHorizontal = false;

        const onStart = (pageX, pageY) => {
            isDragging = true;
            directionLocked = false;
            isHorizontal = false;
            startX = pageX;
            startY = pageY;
            dragStartPos = position;
            track.classList.add('is-dragging');
        };

        track.addEventListener('mousedown', (e) => {
            e.preventDefault();
            onStart(e.pageX, e.pageY);
        });

        track.addEventListener('touchstart', (e) => {
            onStart(e.touches[0].pageX, e.touches[0].pageY);
        }, { passive: true });

        const onMove = (pageX, pageY, e) => {
            if (!isDragging) return;

            const diffX = startX - pageX;
            const diffY = startY - pageY;

            // Lock direction after first significant movement
            if (!directionLocked && (Math.abs(diffX) > 5 || Math.abs(diffY) > 5)) {
                directionLocked = true;
                isHorizontal = Math.abs(diffX) > Math.abs(diffY);
            }

            if (!directionLocked) return;

            // If vertical scroll, release and let browser handle it
            if (!isHorizontal) {
                isDragging = false;
                track.classList.remove('is-dragging');
                return;
            }

            // Horizontal swipe — prevent page scroll and move carousel
            if (e && e.cancelable) e.preventDefault();
            updatePosition(dragStartPos + diffX);
        };

        window.addEventListener('mousemove', (e) => onMove(e.pageX, e.pageY, e));
        window.addEventListener('touchmove', (e) => onMove(e.touches[0].pageX, e.touches[0].pageY, e), { passive: false });

        const onEnd = () => {
            isDragging = false;
            directionLocked = false;
            track.classList.remove('is-dragging');
        };

        window.addEventListener('mouseup', onEnd);
        window.addEventListener('touchend', onEnd);
        window.addEventListener('touchcancel', onEnd);

        // Prevent click after drag
        track.addEventListener('click', (e) => {
            if (Math.abs(position - dragStartPos) > 5) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);
    }

    // --- SMOOTH SCROLL FOR ANCHOR LINKS ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const navHeight = nav.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- PARALLAX-LIKE SUBTLE MOVEMENT FOR HERO ---
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            if (scrolled < window.innerHeight) {
                const content = hero.querySelector('.hero__content');
                if (content) {
                    content.style.transform = `translateY(${scrolled * 0.15}px)`;
                    content.style.opacity = 1 - (scrolled / (window.innerHeight * 0.8));
                }
            }
        });
    }

    // --- ACTIVE NAV LINK HIGHLIGHTING ---
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                document.querySelectorAll('.nav__links a').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.style.color = '';
                    }
                });
            }
        });
    });

    // --- LANGUAGE TOGGLE ---
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        const langBtns = langToggle.querySelectorAll('.lang-btn');
        let currentLang = 'ms';

        langBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.getAttribute('data-lang');
                if (lang === currentLang) return;

                currentLang = lang;
                langBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update all elements with data-ms and data-en attributes
                document.querySelectorAll('[data-ms][data-en]').forEach(el => {
                    const text = el.getAttribute(`data-${lang}`);
                    if (text) {
                        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                            el.placeholder = text;
                        } else {
                            el.innerHTML = text;
                        }
                    }
                });
            });
        });
    }

    // --- CONTACT FORM SUBMISSION ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const phone = formData.get('phone');
            const inquiry = formData.get('inquiry');
            const message = formData.get('message');

            // Create WhatsApp message
            const waMessage = `Salam, saya ${name}.\n\nJenis Pertanyaan: ${inquiry}\n\nMesej: ${message}\n\nNo. Telefon: ${phone}`;
            const waUrl = `https://wa.me/601121574559?text=${encodeURIComponent(waMessage)}`;

            window.open(waUrl, '_blank');
        });
    }

    // --- FACILITIES CAROUSEL ---
    const facTrack = document.getElementById('facCarouselTrack');
    const facPrev = document.getElementById('facPrev');
    const facNext = document.getElementById('facNext');

    if (facTrack && facPrev && facNext) {
        const slides = facTrack.querySelectorAll('.fac-slide');
        const items = document.querySelectorAll('.public-item');
        let currentIndex = 0;

        function showSlide(index) {
            // Validate index
            if (index < 0) index = slides.length - 1;
            if (index >= slides.length) index = 0;

            currentIndex = index;

            // Update slides
            slides.forEach((slide, i) => {
                if (i === index) {
                    slide.classList.add('active');
                } else {
                    slide.classList.remove('active');
                }
            });

            // Update items highlight
            items.forEach((item, i) => {
                if (i === index) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        }

        facPrev.addEventListener('click', () => showSlide(currentIndex - 1));
        facNext.addEventListener('click', () => showSlide(currentIndex + 1));

        // Allow clicking on items to jump to slide
        items.forEach((item, i) => {
            item.addEventListener('click', () => showSlide(i));
            item.style.cursor = 'pointer';
        });
    }

    // --- LIGHTBOX ---
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <span class="lightbox-close">&times;</span>
        <img src="" alt="Lightbox Image">
    `;
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector('img');
    const galleryImages = document.querySelectorAll('.gallery-img');

    galleryImages.forEach(img => {
        img.addEventListener('click', () => {
            lightboxImg.src = img.src;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        });
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target !== lightboxImg) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

});

