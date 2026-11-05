/* =========================================
   PORTFOLIO WEBSITE - JAVASCRIPT
   ========================================= */

// ===== NAVBAR SCROLL EFFECT =====
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Active nav link on scroll
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
});

// ===== HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const navLinksContainer = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  navLinksContainer.classList.toggle('open');
  const spans = hamburger.querySelectorAll('span');
  if (navLinksContainer.classList.contains('open')) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
});

// Close menu when link clicked
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinksContainer.classList.remove('open');
    hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  });
});

// ===== TYPEWRITER EFFECT =====
const roles = ['Full Stack Developer', 'UI/UX Designer', 'Problem Solver', 'Open Source Contributor', 'Tech Enthusiast'];
let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typewriterEl = document.getElementById('typewriter');

function typeWriter() {
  const currentRole = roles[roleIndex];
  if (isDeleting) {
    typewriterEl.textContent = currentRole.substring(0, charIndex - 1);
    charIndex--;
  } else {
    typewriterEl.textContent = currentRole.substring(0, charIndex + 1);
    charIndex++;
  }

  let speed = isDeleting ? 60 : 100;

  if (!isDeleting && charIndex === currentRole.length) {
    speed = 2000; // Pause at end
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    speed = 400;
  }

  setTimeout(typeWriter, speed);
}

typeWriter();

// ===== PARTICLES =====
function createParticles() {
  const container = document.getElementById('particles');
  const colors = ['#6366f1', '#8b5cf6', '#22d3ee', '#f472b6', '#818cf8'];

  for (let i = 0; i < 40; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.width = `${Math.random() * 3 + 1}px`;
    particle.style.height = particle.style.width;
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    particle.style.animationDuration = `${Math.random() * 15 + 8}s`;
    particle.style.animationDelay = `${Math.random() * 10}s`;
    container.appendChild(particle);
  }
}
createParticles();

// ===== COUNTER ANIMATION =====
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const duration = 2000;
  const start = Date.now();

  function update() {
    const elapsed = Date.now() - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(update);
  }

  update();
}

// ===== SCROLL REVEAL ANIMATION =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');

      // Animate skill bars
      const bars = entry.target.querySelectorAll('.skill-progress');
      bars.forEach(bar => {
        setTimeout(() => {
          bar.style.width = bar.dataset.width + '%';
        }, 200);
      });

      // Animate counters
      const counters = entry.target.querySelectorAll('.stat-number');
      counters.forEach(counter => {
        animateCounter(counter);
      });
    }
  });
}, { threshold: 0.1 });

// Add reveal classes and observe
document.querySelectorAll('.section-header').forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

document.querySelectorAll('.project-card').forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = `${i * 0.15}s`;
  revealObserver.observe(el);
});

document.querySelectorAll('.skill-category').forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = `${i * 0.1}s`;
  revealObserver.observe(el);
});

document.querySelector('.about-image-wrapper')?.classList.add('reveal-left');
document.querySelector('.about-content')?.classList.add('reveal-right');
revealObserver.observe(document.querySelector('.about-image-wrapper'));
revealObserver.observe(document.querySelector('.about-content'));

document.querySelector('.contact-info')?.classList.add('reveal-left');
document.querySelector('.contact-form')?.classList.add('reveal-right');
revealObserver.observe(document.querySelector('.contact-info'));
revealObserver.observe(document.querySelector('.contact-form'));

// Hero stats counter (triggers when hero is in view)
const heroStats = document.querySelector('.hero-stats');
let heroAnimated = false;
const heroObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && !heroAnimated) {
    heroAnimated = true;
    document.querySelectorAll('.stat-number').forEach(counter => {
      animateCounter(counter);
    });
  }
});
if (heroStats) heroObserver.observe(heroStats);

// ===== CONTACT FORM =====
const contactForm = document.getElementById('contact-form');
contactForm?.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const subject = document.getElementById('subject').value.trim();
  const message = document.getElementById('message').value.trim();

  if (!name || !email || !message) {
    showNotification('Please fill in all required fields!', 'error');
    return;
  }

  if (!isValidEmail(email)) {
    showNotification('Please enter a valid email address!', 'error');
    return;
  }

  // mailto fallback (replace with Formspree or EmailJS for production)
  const mailtoLink = `mailto:your.email@gmail.com?subject=${encodeURIComponent(subject || 'Portfolio Contact: ' + name)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;
  window.location.href = mailtoLink;

  showNotification('Opening your email client! 📧', 'success');
  contactForm.reset();
});

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showNotification(msg, type) {
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();

  const notif = document.createElement('div');
  notif.className = 'notification';
  notif.style.cssText = `
    position: fixed;
    top: 90px;
    right: 24px;
    padding: 14px 24px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 0.9rem;
    z-index: 9999;
    animation: slideInRight 0.4s ease;
    max-width: 320px;
    display: flex;
    align-items: center;
    gap: 10px;
    ${type === 'success'
      ? 'background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.4); color: #818cf8;'
      : 'background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.4); color: #f87171;'
    }
  `;
  notif.innerHTML = `<span>${type === 'success' ? '✅' : '❌'}</span> ${msg}`;

  const style = document.createElement('style');
  style.textContent = `@keyframes slideInRight { from { opacity:0; transform: translateX(100%); } to { opacity:1; transform: translateX(0); } }`;
  document.head.appendChild(style);

  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 4000);
}

// ===== FOOTER YEAR =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== SMOOTH HOVER TILT ON PROJECT CARDS =====
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;
    card.style.transform = `translateY(-6px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    card.style.transition = 'transform 0.1s ease';
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)';
  });
});

console.log('%c✨ Portfolio built with ❤️', 'color: #6366f1; font-size: 16px; font-weight: bold;');
