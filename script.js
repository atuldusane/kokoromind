document.documentElement.classList.add('js');
// ===== NAVBAR SCROLL EFFECT =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ===== MOBILE MENU TOGGLE =====
const mobileToggle = document.getElementById('mobileToggle');
const navLinks = document.getElementById('navLinks');

mobileToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileToggle.classList.toggle('active');
    mobileToggle.setAttribute('aria-expanded', navLinks.classList.contains('active'));
});

// Close mobile menu on link click
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileToggle.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
    });
});

// ===== TESTIMONIAL CAROUSEL =====
const testimonialTrack = document.getElementById('testimonialTrack');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dotsContainer = document.getElementById('carouselDots');
const testimonialCards = testimonialTrack.querySelectorAll('.testimonial-card');
let currentSlide = 0;
const totalSlides = testimonialCards.length;

// Create dots
for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Show testimonial ${i + 1}`);
    dot.classList.add('dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
}

function updateCarousel() {
    testimonialTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    document.querySelectorAll('.carousel-dots .dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function goToSlide(index) {
    currentSlide = index;
    updateCarousel();
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateCarousel();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateCarousel();
}

nextBtn.addEventListener('click', nextSlide);
prevBtn.addEventListener('click', prevSlide);

// Auto-play carousel
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let autoPlay;
const startAutoPlay = () => { clearInterval(autoPlay); if (!reducedMotion) autoPlay = setInterval(nextSlide, 5000); };
startAutoPlay();

// Pause on hover
const carousel = document.querySelector('.testimonial-carousel');
carousel.addEventListener('mouseenter', () => clearInterval(autoPlay));
carousel.addEventListener('mouseleave', startAutoPlay);
carousel.addEventListener('focusin', () => clearInterval(autoPlay));
carousel.addEventListener('focusout', startAutoPlay);

// ===== FAQ ACCORDION =====
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        // Close all
        faqItems.forEach(i => { i.classList.remove('active'); i.querySelector('.faq-question').setAttribute('aria-expanded', 'false'); });
        // Open clicked if it wasn't active
        if (!isActive) {
            item.classList.add('active');
            question.setAttribute('aria-expanded', 'true');
        }
    });
});

// ===== SCROLL REVEAL ANIMATION =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Add scroll-reveal class to elements
document.querySelectorAll('.section-header, .about-feature, .program-card, .timeline-item, .gallery-item, .faq-item, .contact-card').forEach(el => {
    el.classList.add('scroll-reveal');
    observer.observe(el);
});

// ===== CONTACT FORM =====
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const parentName = document.getElementById('parentName').value;
    const childName = document.getElementById('childName').value;
    const childAge = document.getElementById('childAge').value;
    const phone = document.getElementById('phone').value;
    const message = document.getElementById('message').value;
    
    // Compose an email with the booking details
    const body = `Hi KokoroMind! I'd like to book a free trial class.\n\nParent: ${parentName}\nChild: ${childName}\nAge Group: ${childAge}\nPhone: ${phone}${message ? '\nMessage: ' + message : ''}`;
    window.location.href = `mailto:kokoromind.info@gmail.com?subject=${encodeURIComponent('Free trial class')}&body=${encodeURIComponent(body)}`;
    
    // Sending happens in the parent's mail app, so never claim it was sent
    const help = document.getElementById('formHelp');
    help.hidden = false;
    help.textContent = 'Press send in your email app to finish. Nothing opened? Write to kokoromind.info@gmail.com.';
    const btn = contactForm.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-envelope"></i> Opening your email...';
    
    setTimeout(() => {
        btn.innerHTML = originalText;
    }, 3000);
});

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
        }
    });
});

// ===== COUNTER ANIMATION =====
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
        const text = counter.textContent;
        if (text.includes('+')) {
            const target = parseInt(text);
            let current = 0;
            const increment = target / 50;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    counter.textContent = text;
                    clearInterval(timer);
                } else {
                    counter.textContent = Math.floor(current) + '+';
                }
            }, 30);
        }
    });
}

// Trigger counter animation when hero is visible
const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            heroObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

heroObserver.observe(document.querySelector('.hero-stats'));
