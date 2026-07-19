document.addEventListener('DOMContentLoaded', () => {
    // Registrar plugins si existen
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    const navButtons = document.querySelectorAll('.nav-btn');
    
    function splitTextIntoChars(selector) {
        const element = document.querySelector(selector);
        if (!element) return;
        const text = element.textContent.trim();
        element.innerHTML = text.split('').map(char => {
            if (char === ' ') return '&nbsp;';
            return `<span class="char">${char}</span>`;
        }).join('');
    }

    // Dividir la palabra "PROFESIONAL" en caracteres individuales para poder animarla con GPU sin lag
    splitTextIntoChars('.hero-title .outline-text');

    // Animación de entrada inicial del Hero
    runInitialAnimations();
    // Configurar los efectos y ScrollTrigger en el resto del sitio
    setupScrollTriggerAnimations();

    // Navegación con scroll suave
    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = btn.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                e.preventDefault();
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Actualizar menú activo según la sección actual mediante umbrales de scroll robustos
    window.addEventListener('scroll', () => {
        let currentSection = 'home';
        const scrollY = window.scrollY;

        const servicesSection = document.getElementById('services');
        const contactSection = document.getElementById('contact');

        // Definimos los puntos de activación (offset de 250px para mejor respuesta visual)
        const servicesThreshold = servicesSection ? servicesSection.offsetTop - 250 : 0;
        const contactThreshold = contactSection ? contactSection.offsetTop - 250 : 0;

        if (scrollY >= contactThreshold) {
            currentSection = 'contact';
        } else if (scrollY >= servicesThreshold) {
            currentSection = 'services';
        } else {
            currentSection = 'home';
        }

        navButtons.forEach(btn => {
            if (btn.getAttribute('data-target') === currentSection) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    });

    function runInitialAnimations() {
        if (typeof gsap === 'undefined') return;

        // Animación suave de entrada de la cabecera
        gsap.from('.main-header', {
            y: -50,
            opacity: 0,
            duration: 1,
            ease: 'power3.out'
        });

        // Animación de entrada de los elementos del Hero
        gsap.from('.glass-panel', {
            scale: 0.95,
            y: 40,
            opacity: 0,
            duration: 1.4,
            ease: 'power4.out',
            delay: 0.3
        });

        // Entrada en cascada de las líneas del título
        gsap.from('.hero-line', {
            y: 30,
            opacity: 0,
            duration: 1.2,
            stagger: 0.15,
            ease: 'power3.out',
            delay: 0.5
        });

        // Animación ultra-fluida de espaciado de letras para "PROFESIONAL" usando GPU-transforms
        const chars = document.querySelectorAll('.hero-title .outline-text .char');
        if (chars.length > 0) {
            const centerIndex = (chars.length - 1) / 2;
            chars.forEach((char, index) => {
                const offset = (index - centerIndex) * 20;
                gsap.fromTo(char, 
                    { x: offset, opacity: 0 },
                    { x: 0, opacity: 1, duration: 2.2, ease: 'expo.out', delay: 0.65 }
                );
            });
        }

        // Parallax interactivo del fondo con el mouse
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.addEventListener('mousemove', (e) => {
                const { clientX, clientY } = e;
                const xPos = (clientX / window.innerWidth - 0.5) * 30;
                const yPos = (clientY / window.innerHeight - 0.5) * 30;
                
                gsap.to('.hero', {
                    backgroundPosition: `calc(50% + ${xPos}px) calc(50% + ${yPos}px)`,
                    duration: 1,
                    ease: 'power2.out'
                });
            });
        }
    }

    function setupScrollTriggerAnimations() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        // 1. Entrada de la cuadrícula de servicios
        gsap.from('#services .services-header', {
            scrollTrigger: {
                trigger: '#services',
                start: 'top 80%',
            },
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out'
        });

        gsap.from('.service-card', {
            scrollTrigger: {
                trigger: '.services-grid',
                start: 'top 85%',
            },
            y: 40,
            opacity: 0,
            duration: 1,
            stagger: 0.15,
            ease: 'power4.out'
        });

        // 2. Destello del Banner de Emergencia al entrar en vista
        gsap.from('.emergency-banner-content', {
            scrollTrigger: {
                trigger: '.emergency-banner-section',
                start: 'top 85%'
            },
            scale: 0.95,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out'
        });

        // 3. Animación de sección Sobre Nosotros
        gsap.from('.team-photo-wrapper', {
            scrollTrigger: {
                trigger: '#about',
                start: 'top 80%'
            },
            x: -50,
            opacity: 0,
            duration: 1,
            ease: 'power3.out'
        });

        gsap.from('.about-content-side', {
            scrollTrigger: {
                trigger: '#about',
                start: 'top 80%'
            },
            x: 50,
            opacity: 0,
            duration: 1,
            ease: 'power3.out'
        });

        gsap.from('.trust-item', {
            scrollTrigger: {
                trigger: '.trust-list',
                start: 'top 85%'
            },
            y: 20,
            opacity: 0,
            duration: 0.6,
            stagger: 0.15,
            ease: 'power2.out'
        });

        // 4. Testimonios
        gsap.from('.testimonial-card', {
            scrollTrigger: {
                trigger: '.testimonials-module',
                start: 'top 85%'
            },
            y: 30,
            opacity: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: 'power3.out'
        });

        // 5. Formulario & Mapa
        gsap.from('.contact-form-wrapper', {
            scrollTrigger: {
                trigger: '#contact',
                start: 'top 80%'
            },
            x: -40,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out'
        });

        gsap.from('.map-wrapper', {
            scrollTrigger: {
                trigger: '#contact',
                start: 'top 80%'
            },
            x: 40,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out'
        });
    }
});
