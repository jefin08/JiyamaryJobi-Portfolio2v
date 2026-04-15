/* ============================================================
   PART 1: Global & Background Elements — JavaScript
   Covers:
     - Canvas animation (bg-canvas): Quantum Flow Grid
       with particles, connections, grid, and mouse repulsion
     - Custom scrollbar thumb position tracking (scroll-bar / scroll-thumb)
   ============================================================ */

/* ── DOM Cache ── */
const canvas = document.getElementById('bg-canvas');
const scrollBar = document.querySelector('.scroll-bar');
const scrollThumb = document.querySelector('.scroll-thumb');
const heroContent = document.querySelector('.hero-content');
const heroDecos = document.querySelectorAll('.hero-deco');
const scrollIndicator = document.querySelector('.scroll-indicator');
const greeting = document.querySelector('.greeting');

if (canvas) {
    const ctx = canvas.getContext('2d', { alpha: false }); // Optimize for opaque background
    let width, height, dpr;
    let particles = [];
    const particleCount = 80; // Optimized count
    const connectionDist = 150;
    const connectionDistSq = connectionDist * connectionDist;

    // Mouse position tracker
    const mouse = {
        x: -1000,
        y: -1000,
        radius: 200
    };

    /* Resize canvas with High DPI support */
    function resizeCanvas() {
        dpr = window.devicePixelRatio || 1;
        width = window.innerWidth;
        height = window.innerHeight;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        ctx.scale(dpr, dpr);
        initParticles();
    }

    /* Throttled resize */
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(resizeCanvas, 150);
    });

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    /* ── Particle class ── */
    class Particle {
        constructor() {
            this.init();
        }

        init() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.8;
            this.vy = (Math.random() - 0.5) * 0.8;
            this.size = Math.random() * 2 + 1;
            this.baseSize = this.size;
        }

        update() {
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < mouse.radius * mouse.radius) {
                const dist = Math.sqrt(distSq);
                const force = (mouse.radius - dist) / mouse.radius;
                const angle = Math.atan2(dy, dx);
                this.x += Math.cos(angle) * force * 4;
                this.y += Math.sin(angle) * force * 4;
                this.size = this.baseSize * (1 + force * 2);
            } else {
                this.size = this.baseSize;
                this.x += this.vx;
                this.y += this.vy;
            }

            // Wrap edges
            if (this.x < 0) this.x = width;
            else if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            else if (this.y > height) this.y = 0;
        }

        draw(isDark) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = isDark
                ? 'rgba(157, 78, 221, 0.7)'  /* Darker purple, higher opacity for dark mode visibility */
                : 'rgba(90, 24, 154, 0.6)';   /* Deep purple, higher opacity for light mode contrast */
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function drawGrid(isDark, scrollTop) {
        const gridSize = 80;
        const offsetX = (mouse.x - width / 2) * 0.02;
        const offsetY = (mouse.y - height / 2) * 0.02 - scrollTop * 0.1;

        ctx.strokeStyle = isDark
            ? 'rgba(157, 78, 221, 0.08)' /* Increased from 0.05 */
            : 'rgba(90, 24, 154, 0.08)';   /* Increased from 0.05 */
        ctx.lineWidth = 1;

        ctx.beginPath();
        for (let x = offsetX % gridSize; x < width; x += gridSize) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
        }
        for (let y = offsetY % gridSize; y < height; y += gridSize) {
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
        }
        ctx.stroke();
    }

    function drawConnections(isDark) {
        ctx.lineWidth = 0.5;
        const colorPrefix = isDark ? '157, 78, 221' : '90, 24, 154';
        const opacityBase = isDark ? 0.3 : 0.25;

        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < connectionDistSq) {
                    const dist = Math.sqrt(distSq);
                    const opacity = (1 - dist / connectionDist) * opacityBase;
                    ctx.strokeStyle = `rgba(${colorPrefix}, ${opacity})`;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }
    }

    /* Scroll thumb logic moved inside AF to prevent layout thrashing */
    function updateScrollThumb(scrollTop) {
        if (!scrollBar || !scrollThumb) return;

        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = window.innerHeight;
        const totalHeight = scrollHeight - clientHeight;

        if (totalHeight <= 0) {
            scrollBar.style.opacity = '0';
            scrollBar.style.pointerEvents = 'none';
            return;
        } else {
            scrollBar.style.opacity = '1';
            scrollBar.style.pointerEvents = 'auto';
        }

        const progress = Math.min(1, Math.max(0, scrollTop / totalHeight));
        const trackHeight = scrollBar.offsetHeight - scrollThumb.offsetHeight;
        scrollThumb.style.transform = `translateY(${progress * trackHeight}px)`;
    }

    /* ── Hero section parallax ── */
    function updateHeroParallax(scrollTop) {
        if (greeting) {
            const speed = 0.25; // Slower parallax for the greeting
            greeting.style.transform = `translateX(-50%) translateY(${scrollTop * speed}px)`;
            greeting.style.opacity = Math.max(0, 1 - scrollTop / (window.innerHeight * 0.6));
        }

        if (heroContent) {
            const speed = 0.45; // Faster parallax for the main name/content
            // Translate downward as user scrolls
            heroContent.style.transform = `translateY(${scrollTop * speed}px)`;

            // Fade out proportionally — fully gone at 80% of viewport height
            const opacity = Math.max(0, 1 - scrollTop / (window.innerHeight * 0.8));
            heroContent.style.opacity = opacity;

            // Manage visibility to prevent blocking interaction with content below
            if (opacity <= 0) {
                heroContent.style.visibility = 'hidden';
                heroContent.style.pointerEvents = 'none';
            } else {
                heroContent.style.visibility = 'visible';
                heroContent.style.pointerEvents = 'auto';
            }
        }

        if (heroDecos.length > 0) {
            heroDecos.forEach((deco, index) => {
                const factor = (index + 1) * 0.25;
                const rotationDir = index ? 1 : -1;
                deco.style.transform = `translateY(${scrollTop * factor}px) rotate(${scrollTop * 0.1 * rotationDir}deg)`;
            });
        }

        if (scrollIndicator) {
            scrollIndicator.style.opacity = scrollTop > 50 ? '0' : '0.6';
            scrollIndicator.style.pointerEvents = scrollTop > 50 ? 'none' : 'auto';
        }
    }

    function animate() {
        // Use background color variable from CSS for clearing
        const bgColor = getComputedStyle(document.body).getPropertyValue('--bg-color').trim();
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);

        const isDark = document.body.classList.contains('dark-theme');
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        drawGrid(isDark, scrollTop);

        particles.forEach(p => {
            p.update();
            p.draw(isDark);
        });

        drawConnections(isDark);
        updateScrollThumb(scrollTop);
        updateHeroParallax(scrollTop);

        requestAnimationFrame(animate);
    }

    resizeCanvas();
    animate();
}


/* ─────────────────────────────────────────
   2. PRELOADER & SYSTEM BOOT (Glass Portal)
   ───────────────────────────────────────── */
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    const percentText = document.querySelector('.loader-percentage');
    const statusText = document.querySelector('.loader-status');
    const progressPath = document.querySelector('.progress-path');

    if (!loader) return;

    const statusMessages = [
        "Initializing System",
        "Calibrating Matrix",
        "Loading Interface",
        "Establishing Link",
        "System Ready"
    ];

    let count = 0;
    const circumference = 2 * Math.PI * 48; // Radius is 48

    const bootSystem = setInterval(() => {
        count += 1.5; // Faster for new aesthetic
        if (count > 100) count = 100;

        const roundedCount = Math.floor(count);

        // Update Percent Text
        if (percentText) percentText.innerText = roundedCount + '%';

        // Update SVG Progress Ring
        if (progressPath) {
            const offset = circumference - (count / 100) * circumference;
            progressPath.style.strokeDashoffset = offset;
        }

        // Update Messages
        if (statusText) {
            statusText.innerText = statusMessages[Math.floor((count / 101) * statusMessages.length)];
        }

        if (count >= 100) {
            clearInterval(bootSystem);

            setTimeout(() => {
                loader.classList.add('hidden');
                document.body.classList.remove('loading-state');

                setTimeout(() => {
                    document.body.classList.add('content-visible');
                    // Reveal navbar after content is ready
                    if (navbar) navbar.classList.add('visible');
                }, 400);
            }, 800);
        }
    }, 30);
});

/* ============================================================
   PART 3: Navigation Bar — JavaScript
   ============================================================ */

/**
 * 1. THEME TOGGLE
 * Manages Dark/Light mode switching and persistence
 */
const themeToggle = document.getElementById('theme-toggle');

// Initialize theme from localStorage or system preference
const getPreferredTheme = () => {
    try {
        const stored = localStorage.getItem('theme');
        if (stored) return stored;
    } catch (e) { }
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

const applyTheme = (theme) => {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
};

// Apply initial theme
applyTheme(getPreferredTheme());

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const sweep = document.getElementById('theme-sweep');
        
        if (sweep) {
            // Reset and trigger animation
            sweep.classList.remove('active');
            void sweep.offsetWidth; // Trigger reflow to restart animation
            sweep.classList.add('active');

            // Wait for sweep to cover the screen (approx 600ms into 1.2s)
            setTimeout(() => {
                const isDark = document.body.classList.toggle('dark-theme');
                try {
                    localStorage.setItem('theme', isDark ? 'dark' : 'light');
                } catch (e) { }
            }, 600);

            // Cleanup after animation completes
            setTimeout(() => {
                sweep.classList.remove('active');
            }, 1200);
        } else {
            // Fallback
            const isDark = document.body.classList.toggle('dark-theme');
            try {
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
            } catch (e) { }
        }
    });
}

/**
 * 2. LIVE CLOCK
 * Updates the HH:MM:SS clock in the navbar
 */
const updateNavTime = () => {
    const timeEl = document.getElementById('nav-time');
    if (!timeEl) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    timeEl.textContent = timeString;
};

// Tick every second
setInterval(updateNavTime, 1000);
updateNavTime(); // Initial call

/**
 * 3. NAVBAR SCROLL BEHAVIOUR
 * Handles transparency, dimming, and scroll state
 */
const navbar = document.querySelector('.navbar');
let scrollStopTimer;

if (navbar) {
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;

        // Past 50px → mark as scrolled
        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Dim navbar while actively scrolling for focus
        navbar.classList.remove('normal');
        navbar.classList.add('dimmed');

        // Clear existing timer and set new one to restore opacity after scroll stops
        clearTimeout(scrollStopTimer);
        scrollStopTimer = setTimeout(() => {
            navbar.classList.remove('dimmed');
            navbar.classList.add('normal');
        }, 150);
    }, { passive: true });
}

/* ============================================================
   PART 5: Content Section — About (#about) — JavaScript
   ============================================================ */

/**
 * SCROLL REVEAL SYSTEM
 * Uses IntersectionObserver to trigger animations when elements 
 * enter the viewport.
 */
const initScrollReveal = () => {
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -100px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
};

// Start observer
initScrollReveal();

/* ============================================================
   PART 11: Floating Menu System — JavaScript
   ============================================================ */

// Optimized Scroll Logic to prevent URL redirect
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        // Stop the native navigation/redirect behavior
        e.preventDefault(); 
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            // Execute explicit smooth scroll down to the targeted element
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

/* ============================================================
   PART 12: Ascend Button Logic
   ============================================================ */
const ascendBtn = document.getElementById('ascend-btn');

if (ascendBtn) {
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        
        // Appear only after scrolling past the hero section (approx 1 viewport height)
        if (scrollTop > window.innerHeight * 0.8) {
            ascendBtn.classList.add('visible');
        } else {
            ascendBtn.classList.remove('visible');
        }
    }, { passive: true });
}

/* ============================================================
   PART 13: Menu Circle Logic
   ============================================================ */
const menuContainer = document.querySelector('.menu-container');
const menuTrigger = document.getElementById('menu-trigger');
const menuBubbles = document.querySelectorAll('.menu-bubble');

if (menuTrigger && menuContainer) {
    // Toggle menu state
    menuTrigger.addEventListener('click', () => {
        menuContainer.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!menuContainer.contains(e.target)) {
            menuContainer.classList.remove('active');
        }
    });

    // Close menu when clicking a link
    menuBubbles.forEach(bubble => {
        bubble.addEventListener('click', () => {
            menuContainer.classList.remove('active');
        });
    });
    // Close menu when scrolling
    window.addEventListener('scroll', () => {
        if (menuContainer.classList.contains('active')) {
            menuContainer.classList.remove('active');
        }
    }, { passive: true });
}
