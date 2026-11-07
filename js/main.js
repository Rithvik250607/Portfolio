/**
 * ==========================================================================
 * RITHVIK P R // PORTFOLIO INTERACTIVE ENGINE
 * Clean, Classy, Interactive JavaScript
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initParticleNetwork();
  initAudioEngine();
  initTypewriter();
  initScrollAnimations();
  initNavbar();
  initBackToTop();
  initContactForm();
});

/* ==========================================================================
   1. Theme Management (Dark <-> Light Mode)
   ========================================================================== */
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-icon');
  
  // Check persisted theme or system preference
  const savedTheme = localStorage.getItem('stark-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'dark');

  document.documentElement.setAttribute('data-theme', initialTheme);
  updateThemeIcon(initialTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('stark-theme', newTheme);
      updateThemeIcon(newTheme);

      playSubtleSound('theme');
    });
  }

  function updateThemeIcon(theme) {
    if (!themeIcon) return;
    if (theme === 'light') {
      // Moon icon for switching to dark
      themeIcon.innerHTML = `
        <svg viewBox="0 0 24 24">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      `;
      themeToggleBtn.setAttribute('title', 'Switch to Dark Mode');
    } else {
      // Sun icon for switching to light
      themeIcon.innerHTML = `
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      `;
      themeToggleBtn.setAttribute('title', 'Switch to Light Mode');
    }
  }
}

/* ==========================================================================
   2. Subtle Audio Feedback (Web Audio API)
   ========================================================================== */
let audioCtx = null;
let soundEnabled = true;

function initAudioEngine() {
  // Bind subtle feedback on classy buttons
  document.querySelectorAll('.btn-classy-primary, .btn-classy-outline, .social-app-btn').forEach(btn => {
    btn.addEventListener('mouseenter', () => playSubtleSound('hover'));
    btn.addEventListener('click', () => playSubtleSound('click'));
  });
}

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playSubtleSound(type) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'hover') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.03);
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.start(now);
      osc.stop(now + 0.03);
    } else if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'theme') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.15);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    }
  } catch (err) {
    // Graceful silent fallback
  }
}

/* ==========================================================================
   3. Interactive Particle Canvas
   ========================================================================== */
function initParticleNetwork() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initParticles();
  });

  const mouse = { x: null, y: null, radius: 130 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  let particles = [];
  const particleCount = Math.min(Math.floor((width * height) / 18000), 55);

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.7;
      this.vy = (Math.random() - 0.5) * 0.7;
      this.radius = Math.random() * 2 + 1;
      this.baseAlpha = Math.random() * 0.4 + 0.15;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Mouse repulsion
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 2.5;
          this.y -= (dy / dist) * force * 2.5;
        }
      }
    }

    draw() {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = isLight 
        ? `rgba(2, 132, 199, ${this.baseAlpha * 0.7})` 
        : `rgba(0, 229, 255, ${this.baseAlpha})`;
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }

  initParticles();

  function animate() {
    ctx.clearRect(0, 0, width, height);

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const lineColor = isLight ? 'rgba(2, 132, 199,' : 'rgba(0, 229, 255,';

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          const alpha = (1 - dist / 120) * (isLight ? 0.12 : 0.2);
          ctx.beginPath();
          ctx.strokeStyle = `${lineColor}${alpha})`;
          ctx.lineWidth = 0.7;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   4. Animated Typewriter for Headline (Dynamic typing after Technology)
   ========================================================================== */
function initTypewriter() {
  const dynamicTarget = document.getElementById('hero-typewriter-dynamic');
  if (!dynamicTarget) return;

  const phrases = [
    " & Innovation",
    " & Autonomous Agents",
    " & Problem Solving",
    " & Modern Software",
    " & Creative Code"
  ];

  let phraseIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  const typeSpeed = 65;
  const deleteSpeed = 35;
  const pauseTime = 2000;

  function loop() {
    const currentPhrase = phrases[phraseIdx];

    if (!isDeleting) {
      dynamicTarget.textContent = currentPhrase.substring(0, charIdx + 1);
      charIdx++;

      if (charIdx === currentPhrase.length) {
        isDeleting = true;
        setTimeout(loop, pauseTime);
        return;
      }
      setTimeout(loop, typeSpeed);
    } else {
      dynamicTarget.textContent = currentPhrase.substring(0, charIdx - 1);
      charIdx--;

      if (charIdx === 0) {
        dynamicTarget.textContent = "";
        isDeleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(loop, 400);
        return;
      }
      setTimeout(loop, deleteSpeed);
    }
  }

  // Start smooth typing after technology
  setTimeout(loop, 800);
}

/* ==========================================================================
   5. Scroll Reveal Animations & Skill Meters
   ========================================================================== */
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  const skillFills = document.querySelectorAll('.skill-meter-fill');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.1 });

  revealElements.forEach(el => revealObserver.observe(el));

  // Animate skill bars when visible
  const skillsSection = document.getElementById('skills');
  if (skillsSection) {
    const skillsObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          skillFills.forEach(fill => {
            const level = fill.getAttribute('data-level');
            if (level) {
              fill.style.width = level + '%';
            }
          });
          skillsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    skillsObserver.observe(skillsSection);
  }
}

/* ==========================================================================
   6. Navigation Scroll State & Mobile Hamburger
   ========================================================================== */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navLinks = document.getElementById('nav-links');
  const navLinkItems = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active link highlighting
    let currentSection = '';
    const scrollPos = window.scrollY + 180;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentSection = sec.getAttribute('id');
      }
    });

    navLinkItems.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  });

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
    });

    navLinkItems.forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
      });
    });
  }
}

/* ==========================================================================
   7. Back to Top Button
   ========================================================================== */
function initBackToTop() {
  const backToTopBtn = document.getElementById('back-to-top-btn');
  if (!backToTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });

  backToTopBtn.addEventListener('click', () => {
    playSubtleSound('click');
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/* ==========================================================================
   8. Direct Contact Form
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('transmission-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('form-name').value.trim();
    const email = document.getElementById('form-email').value.trim();
    const message = document.getElementById('form-message').value.trim();

    if (!name || !message) {
      alert('Please fill out your name and message.');
      return;
    }

    playSubtleSound('click');

    const subject = encodeURIComponent(`Message from ${name} via Portfolio`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n\n-- Sent from Rithvik P R Portfolio`);
    
    window.location.href = `mailto:rithvikpr25@gmail.com?subject=${subject}&body=${body}`;
  });
}
