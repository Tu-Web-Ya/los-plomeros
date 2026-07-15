document.addEventListener('DOMContentLoaded', () => {
    // Registrar plugins si existen
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    const navButtons = document.querySelectorAll('[data-target]');
    const views = document.querySelectorAll('.view');
    const splashOverlay = document.getElementById('water-splash');
    
    // Configuración de la transición
    const TRANSITION_DURATION = 600; // ms, coincide con styles.css
    let isAnimating = false;

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

    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = btn.getAttribute('data-target');
            if (!targetId || isAnimating) return;
            
            // Si ya estamos en la vista, no hacemos nada
            const currentActiveView = document.querySelector('.active-view');
            if (currentActiveView && currentActiveView.id === targetId) return;

            e.preventDefault();
            navigateTo(targetId);
        });
    });

    function navigateTo(targetId) {
        if (typeof gsap === 'undefined') return;
        isAnimating = true;

        const currentActiveView = document.querySelector('.active-view');
        const targetView = document.getElementById(targetId);

        if (!targetView || !currentActiveView) {
            isAnimating = false;
            return;
        }

        const tl = gsap.timeline({
            onComplete: () => {
                isAnimating = false;
            }
        });

        // 1. Desvanecer y deslizar hacia arriba la página actual
        tl.to(currentActiveView, {
            opacity: 0,
            y: -20,
            duration: 0.35,
            ease: 'power2.inOut',
            onComplete: () => {
                // Ocultar la vista anterior
                views.forEach(view => view.classList.remove('active-view'));
                
                // Configurar la nueva vista para entrar desde abajo
                gsap.set(targetView, {
                    opacity: 0,
                    y: 20
                });
                
                // Activar la nueva vista
                targetView.classList.add('active-view');
                window.scrollTo(0, 0); // Reset scroll

                // Actualizar botones de navegación
                document.querySelectorAll('.nav-btn').forEach(btn => {
                    if (btn.getAttribute('data-target') === targetId) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
            }
        })
        // 2. Entrar la nueva página suavemente deslizando a su posición original
        .to(targetView, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power3.out',
            onStart: () => {
                // Disparar las animaciones de los elementos internos de la nueva página
                runPageAnimations(targetId);
            }
        });
    }

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

        // Animación ultra-fluida de espaciado de letras para "PROFESIONAL" usando GPU-transforms (cero reflow/lag)
        const chars = document.querySelectorAll('.hero-title .outline-text .char');
        if (chars.length > 0) {
            const centerIndex = (chars.length - 1) / 2;
            chars.forEach((char, index) => {
                const offset = (index - centerIndex) * 20; // desplazamiento de dispersión horizontal
                gsap.fromTo(char, 
                    { x: offset, opacity: 0 },
                    { x: 0, opacity: 1, duration: 2.2, ease: 'expo.out', delay: 0.65 }
                );
            });
        }

        // Parallax interactivo del fondo con el mouse en pantallas de escritorio
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.addEventListener('mousemove', (e) => {
                const { clientX, clientY } = e;
                const xPos = (clientX / window.innerWidth - 0.5) * 30; // max 30px
                const yPos = (clientY / window.innerHeight - 0.5) * 30;
                
                gsap.to('.hero', {
                    backgroundPosition: `calc(50% + ${xPos}px) calc(50% + ${yPos}px)`,
                    duration: 1,
                    ease: 'power2.out'
                });
            });
        }
    }

    function runPageAnimations(targetId) {
        if (typeof gsap === 'undefined') return;

        // Resetear y animar elementos según la sección
        if (targetId === 'home') {
            gsap.fromTo('.glass-panel', 
                { scale: 0.95, y: 30, opacity: 0 }, 
                { scale: 1, y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
            );

            // Re-animar cascada de líneas del título al volver a Inicio
            gsap.fromTo('.hero-line',
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.2 }
            );

            // Re-animar espaciado de letras de "PROFESIONAL" usando GPU-transforms (cero reflow/lag)
            const chars = document.querySelectorAll('.hero-title .outline-text .char');
            if (chars.length > 0) {
                const centerIndex = (chars.length - 1) / 2;
                chars.forEach((char, index) => {
                    const offset = (index - centerIndex) * 20; // desplazamiento de dispersión horizontal
                    gsap.fromTo(char, 
                        { x: offset, opacity: 0 },
                        { x: 0, opacity: 1, duration: 1.8, ease: 'expo.out', delay: 0.3 }
                    );
                });
            }
        }
        else if (targetId === 'services') {
            // Cabecera de servicios
            gsap.fromTo('#services .section-tag, #services .section-title, #services .section-desc',
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out' }
            );
            // Lista interactiva de servicios (entrada en cascada lateral)
            gsap.fromTo('.service-list-item',
                { x: -60, opacity: 0 },
                { x: 0, opacity: 1, duration: 1, stagger: 0.12, ease: 'power4.out', delay: 0.3 }
            );
        }
        else if (targetId === 'contact') {
            // Cabecera de contacto
            gsap.fromTo('#contact .section-tag, #contact .section-title',
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out' }
            );
            // Tarjeta de información (izq) y formulario (der)
            gsap.fromTo('.contact-info',
                { x: -50, opacity: 0 },
                { x: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.2 }
            );
            gsap.fromTo('.contact-form-wrapper',
                { x: 50, opacity: 0 },
                { x: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.3 }
            );
        }
    }
});
