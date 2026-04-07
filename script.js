// Theme Toggle & Navbar Scroll Logic
const themeToggle = document.getElementById('theme-toggle');
const sunIcon = document.getElementById('sun-icon');
const moonIcon = document.getElementById('moon-icon');
const navbar = document.querySelector('.navbar');

// Loader logic
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    const percentText = document.querySelector('.loader-percentage');
    const bar = document.querySelector('.loader-bar');
    const statusText = document.querySelector('.loader-status');
    const statusMessages = ["Connecting to Grid...", "Syncing Assets...", "Optimizing UI...", "Welcome."];
    
    let count = 0;
    const interval = setInterval(() => {
        count++;
        if (percentText) percentText.innerText = count + '%';
        if (bar) bar.style.width = count + '%';
        
        // Update status messages at certain intervals
        if (statusText) {
            if (count === 25) statusText.innerText = statusMessages[0];
            if (count === 50) statusText.innerText = statusMessages[1];
            if (count === 75) statusText.innerText = statusMessages[2];
            if (count === 95) statusText.innerText = statusMessages[3];
        }

        if (count >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                if (loader) loader.classList.add('hidden');
                setTimeout(() => {
                    if (navbar) navbar.classList.add('visible');
                }, 500);
            }, 500);
        }
    }, 20); // Total ~2 seconds
});

let scrollTimeout;

window.addEventListener('scroll', () => {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Leaving the top: more translucent
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollTop > 50) {
        navbar.classList.add('scrolled');
        if (scrollIndicator) scrollIndicator.style.opacity = '0';
    } else {
        navbar.classList.remove('scrolled');
        if (scrollIndicator) scrollIndicator.style.opacity = '0.6';
    }

    // Dim navbar while scrolling (Up or Down)
    navbar.classList.remove('normal');
    navbar.classList.add('dimmed');

    // Clear existing timeout
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }

    // Return to normal 150ms after scroll stops
    scrollTimeout = setTimeout(() => {
        navbar.classList.remove('dimmed');
        navbar.classList.add('normal');
    }, 150);

    // Hero Parallax & Dynamic Fading
    const heroContent = document.querySelector('.hero-content');
    const heroDecos = document.querySelectorAll('.hero-deco');
    
    if (heroContent) {
        const speed = 0.4;
        // Parallax effect
        heroContent.style.transform = `translateY(${scrollTop * speed}px)`;
        // Fade out as we scroll down
        heroContent.style.opacity = Math.max(0, 1 - scrollTop / 700);
    }

    heroDecos.forEach((deco, index) => {
        const factor = (index + 1) * 0.25;
        // Float and rotate decos differently
        deco.style.transform = `translateY(${scrollTop * factor}px) rotate(${scrollTop * 0.1 * (index ? 1 : -1)}deg)`;
    });
});

// Initialize theme safely (handle file:/// protocol localStorage issues)
let currentTheme = 'dark';
try {
    currentTheme = window.localStorage.getItem('theme') || 'dark';
} catch (e) {
    console.warn('localStorage is not available. Defaulting to dark theme.');
}

if (currentTheme === 'light') {
    document.body.classList.remove('dark-theme');
    if (sunIcon) sunIcon.style.display = 'none';
    if (moonIcon) moonIcon.style.display = 'block';
} else {
    document.body.classList.add('dark-theme');
    if (sunIcon) sunIcon.style.display = 'block';
    if (moonIcon) moonIcon.style.display = 'none';
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');

        if (isDark) {
            if (sunIcon) sunIcon.style.display = 'block';
            if (moonIcon) moonIcon.style.display = 'none';
            try { window.localStorage.setItem('theme', 'dark'); } catch (e) { }
        } else {
            if (sunIcon) sunIcon.style.display = 'none';
            if (moonIcon) moonIcon.style.display = 'block';
            try { window.localStorage.setItem('theme', 'light'); } catch (e) { }
        }
    });
}

// Canvas Animation - Floating balls with dynamic threads connecting to cursor
const canvas = document.getElementById('bg-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');

    let width, height;

    function resizeCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const mouse = {
        x: width / 2,
        y: height / 2,
        radius: 250 // Max distance for threads to connect
    };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // Touch support for mobile devices
    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            mouse.x = e.touches[0].clientX;
            mouse.y = e.touches[0].clientY;
        }
    });

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 1.5;
            this.vy = (Math.random() - 0.5) * 1.5;
            this.radius = Math.random() * 1.5 + 0.5;
            this.pulse = Math.random() < 0.2; // 20% are pulsing "premium" particles
            this.pulseDir = 1;
            this.pulseScale = 1;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;

            if (this.pulse) {
                this.pulseScale += 0.02 * this.pulseDir;
                if (this.pulseScale > 2 || this.pulseScale < 1) this.pulseDir *= -1;
            }
        }

        draw() {
            const isDark = document.body.classList.contains('dark-theme');
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * (this.pulse ? this.pulseScale : 1), 0, Math.PI * 2);
            ctx.fillStyle = isDark ? `rgba(255, 255, 255, ${this.pulse ? 0.4 : 0.2})` : `rgba(0, 0, 0, ${this.pulse ? 0.3 : 0.1})`;
            ctx.fill();

            if (this.pulse) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius * 5 * this.pulseScale, 0, Math.PI * 2);
                ctx.strokeStyle = isDark ? `rgba(199, 125, 255, ${0.1 * (2 - this.pulseScale)})` : `rgba(157, 78, 221, ${0.1 * (2 - this.pulseScale)})`;
                ctx.stroke();
            }
        }
    }

    const particles = Array.from({ length: 120 }, () => new Particle());

    function drawGrid(isDark) {
    const gridSize = 100;
    // Darker in light mode (0.08), Brighter in dark mode (0.1)
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 0.5;

        for (let x = 0; x < width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        const isDark = document.body.classList.contains('dark-theme');
        drawGrid(isDark);

        const threadColorRaw = isDark ? '255, 255, 255' : '8, 2, 18';

        particles.forEach(particle => {
            particle.update();
            particle.draw();

            const dx = particle.x - mouse.x;
            const dy = particle.y - mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius) {
                const opacity = Math.min(1, (1 - (distance / mouse.radius)) * 1.5);
                ctx.beginPath();
                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.strokeStyle = `rgba(${threadColorRaw}, ${opacity * 0.4})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        });

        requestAnimationFrame(animate);
    }

    // Start animation loop
    animate();
}

// Scroll Reveal Observer
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        } else {
            // Optional: remove if you want items to fade out when scrolling up
            // entry.target.classList.remove('active');
        }
    });
}, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// Smooth scroll for nav links
document.querySelectorAll('.nav-links a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});
