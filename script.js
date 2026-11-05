/* ============================================================
   PORTFOLIO SCRIPT — Dynamic JSON + All Visual Effects
   Loader · Particles · Cursor · AOS · Lightbox · Gallery
   ============================================================ */

const REPO_OWNER = 'burnhallnaveed-hash';
const REPO_NAME  = 'my-portfolio';
const BRANCH     = 'master';
const DATA_URL   = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/portfolio.json?nocache=${Date.now()}`;

let portfolioData   = null;
let filteredProjects= [];
let currentLBIndex  = 0;
let visibleCount    = 12;
const PAGE_SIZE     = 12;

/* ============================================================
   LOADER
   ============================================================ */
function initLoader() {
  const loader   = document.getElementById('loader');
  const progress = document.getElementById('loaderProgress');
  const percent  = document.getElementById('loaderPercent');
  if (!loader) return;

  let val = 0;
  const timer = setInterval(() => {
    val += Math.random() * 15 + 3;
    if (val >= 100) { val = 100; clearInterval(timer); }
    if (progress) progress.style.width = val + '%';
    if (percent)  percent.textContent  = Math.floor(val) + '%';
    if (val === 100) {
      setTimeout(() => { loader.classList.add('hidden'); }, 400);
    }
  }, 60);
}

/* ============================================================
   CUSTOM CURSOR
   ============================================================ */
function initCursor() {
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  if (!cursor || !follower) return;

  let mx = 0, my = 0, fx = 0, fy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left   = mx + 'px';
    cursor.style.top    = my + 'px';
  });

  (function animFollower() {
    fx += (mx - fx) * 0.12;
    fy += (my - fy) * 0.12;
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';
    requestAnimationFrame(animFollower);
  })();

  document.querySelectorAll('a, button, .filter-btn, .gallery-masonry-item, .gmi-item')
    .forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.width   = '20px';
        cursor.style.height  = '20px';
        cursor.style.background = 'var(--gold)';
        follower.style.width  = '56px';
        follower.style.height = '56px';
        follower.style.borderColor = 'rgba(245,158,11,.4)';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.width   = '10px';
        cursor.style.height  = '10px';
        cursor.style.background = 'var(--accent2)';
        follower.style.width  = '36px';
        follower.style.height = '36px';
        follower.style.borderColor = 'rgba(168,85,247,.5)';
      });
    });
}

/* ============================================================
   PARTICLE CANVAS
   ============================================================ */
function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function Particle() {
    this.reset = function() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.r  = Math.random() * 1.5 + 0.3;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.alpha = Math.random() * 0.5 + 0.1;
      const colors = ['168,85,247', '124,58,237', '6,182,212', '245,158,11', '16,185,129'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    };
    this.reset();
  }

  for (let i = 0; i < 120; i++) { const p = new Particle(); particles.push(p); }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W || p.y < 0 || p.y > H) p.reset();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
      ctx.fill();
    });

    // Draw connecting lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(124,58,237,${0.08 * (1 - dist/100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
}

/* ============================================================
   NAVBAR
   ============================================================ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const links  = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    document.getElementById('backToTop')?.classList.toggle('visible', window.scrollY > 500);

    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) current = s.id; });
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + current));
  });

  // Hamburger
  const ham  = document.getElementById('hamburger');
  const navL = document.getElementById('navLinks');
  if (ham && navL) {
    ham.addEventListener('click', () => navL.classList.toggle('open'));
    document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => navL.classList.remove('open')));
  }

  // Back to top
  document.getElementById('backToTop')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ============================================================
   AOS — Scroll Reveal
   ============================================================ */
function initAOS() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('animated'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('[data-aos]').forEach(el => obs.observe(el));
}

/* ============================================================
   SKILL BARS
   ============================================================ */
function initSkillBars() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.skill-fill').forEach(bar => {
          const w = bar.dataset.width || '0';
          setTimeout(() => { bar.style.width = w + '%'; }, 200);
        });
      }
    });
  }, { threshold: 0.3 });
  const skillsSection = document.getElementById('skills');
  if (skillsSection) obs.observe(skillsSection);
}

/* ============================================================
   COUNTERS
   ============================================================ */
function initCounters() {
  const heroSection = document.getElementById('home');
  let done = false;
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !done) {
      done = true;
      const totalProjects = portfolioData ? (portfolioData.projects || []).length : 20;
      animateNum('stat-projects', totalProjects);
      animateNum('stat-clients',  15);
      animateNum('stat-years',    3);
    }
  }, { threshold: 0.3 });
  if (heroSection) obs.observe(heroSection);
}

function animateNum(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  const dur = 2000;
  const start = Date.now();
  function step() {
    const p = Math.min((Date.now() - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(ease * target);
    if (p < 1) requestAnimationFrame(step);
  }
  step();
}

/* ============================================================
   LOAD PORTFOLIO FROM portfolio.json
   ============================================================ */
async function loadPortfolio() {
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error('GitHub fetch failed');
    portfolioData = await res.json();
  } catch {
    try {
      const res = await fetch('portfolio.json?nc=' + Date.now());
      portfolioData = await res.json();
    } catch { showGalleryEmpty(); return; }
  }

  applySettings(portfolioData.settings);
  buildFilterBar(portfolioData.categories);
  filteredProjects = portfolioData.projects || [];
  renderGallery();
  renderAllGallery();
  initCounters();
  setTimeout(initCursor, 100);
}

/* ============================================================
   APPLY SETTINGS
   ============================================================ */
function applySettings(s) {
  if (!s) return;
  const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.textContent = val; };
  const setHref = (id, val) => { const el = document.getElementById(id); if (el && val) el.href = val; };

  set('nav-name',    s.name || 'STUDIO');
  set('footer-name', s.name || 'YOUR NAME');
  set('footer-year', new Date().getFullYear());
  set('hero-tagline', s.tagline ? s.tagline.split(' ').slice(0,2).join(' ') : '3D Visualization');
  set('hero-desc',    s.about ? s.about.split('.')[0] + '.' : '');
  set('about-title',  s.name || 'The Studio');
  set('about-text',   s.about || '');
  set('av-initials',  getInitials(s.name || 'YN'));
  set('av-title',     s.title || 'Architecture & 3D');
  set('cd-email',     s.email || '');
  set('cd-phone',     s.phone || '');
  if (s.email) setHref('cd-email-link', 'mailto:' + s.email);
  if (s.phone) setHref('cd-phone-link', 'tel:' + s.phone.replace(/\s/g, ''));
}

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

/* ============================================================
   FILTER BAR
   ============================================================ */
function buildFilterBar(categories) {
  if (!categories?.length) return;
  const bar = document.getElementById('filter-bar');
  if (!bar) return;
  bar.innerHTML = '';
  categories.forEach((cat, i) => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn' + (i === 0 ? ' active' : '');
    btn.dataset.cat = cat.id;
    btn.textContent = cat.label;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filteredProjects = cat.id === 'all' ? (portfolioData.projects || []) : (portfolioData.projects || []).filter(p => p.category === cat.id);
      visibleCount = PAGE_SIZE;
      renderGallery();
    });
    bar.appendChild(btn);
  });
}

/* ============================================================
   RENDER GALLERY (Projects Section)
   ============================================================ */
function renderGallery() {
  const grid     = document.getElementById('gallery-grid');
  const loading  = document.getElementById('gallery-loading');
  const empty    = document.getElementById('gallery-empty');
  const loadMore = document.getElementById('load-more-wrap');

  if (loading) loading.style.display = 'none';

  if (!filteredProjects.length) {
    if (grid) grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
    if (loadMore) loadMore.style.display = 'none';
    return;
  }

  if (empty) empty.style.display = 'none';
  if (grid)  grid.innerHTML = '';

  const toShow = filteredProjects.slice(0, visibleCount);
  toShow.forEach((project, idx) => {
    const item = createMasonryItem(project, idx);
    if (grid) grid.appendChild(item);
  });

  setTimeout(() => {
    document.querySelectorAll('.gallery-masonry-item').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 60);
    });
  }, 50);

  if (loadMore) loadMore.style.display = filteredProjects.length > visibleCount ? 'block' : 'none';

  document.getElementById('load-more-btn')?.addEventListener('click', () => {
    visibleCount += PAGE_SIZE;
    renderGallery();
  });
}

function createMasonryItem(project, idx) {
  const item = document.createElement('div');
  item.className = 'gallery-masonry-item';

  const isVideo = ['youtube', 'vimeo', 'video'].includes(project.type);
  const catLabel = getCategoryLabel(project.category);
  const thumb = project.thumbnail || project.src;

  item.innerHTML = `
    ${isVideo ? `
      <div style="position:relative;min-height:200px;background:#12121f;display:flex;align-items:center;justify-content:center;">
        ${thumb ? `<img src="${thumb}" alt="${project.title}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" loading="lazy"/>` : ''}
        <div class="play-icon" style="position:relative;z-index:2;"><i class="fas fa-play"></i></div>
      </div>
      <div class="video-badge"><i class="fas fa-film"></i> ${project.type}</div>
    ` : `
      <img src="${thumb}" alt="${project.title}" loading="lazy"/>
    `}
    <div class="gmi-overlay">
      <div class="gmi-cat">${catLabel}</div>
      <div class="gmi-title">${project.title}</div>
      <div class="gmi-actions">
        <button class="gmi-btn" title="View"><i class="fas fa-expand"></i></button>
      </div>
    </div>
  `;

  item.querySelector('.gmi-btn')?.addEventListener('click', () => openLightbox(idx));
  item.addEventListener('click', () => openLightbox(idx));
  return item;
}

/* ============================================================
   ALL GALLERY SECTION (compact masonry)
   ============================================================ */
function renderAllGallery() {
  const grid = document.getElementById('gallery-all-grid');
  if (!grid || !portfolioData?.projects?.length) return;

  grid.innerHTML = '';
  portfolioData.projects.forEach((project, idx) => {
    const item = document.createElement('div');
    item.className = 'gmi-item';
    const thumb = project.thumbnail || project.src;
    const isVideo = ['youtube','vimeo','video'].includes(project.type);

    item.innerHTML = `
      ${isVideo
        ? `<div style="background:#12121f;min-height:120px;display:flex;align-items:center;justify-content:center;position:relative;">
            ${thumb ? `<img src="${thumb}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" loading="lazy"/>` : ''}
            <i class="fas fa-play" style="position:relative;z-index:2;color:var(--accent2);font-size:1.5rem;"></i>
           </div>`
        : `<img src="${thumb}" alt="${project.title}" loading="lazy"/>`
      }
    `;
    item.addEventListener('click', () => openLightboxAll(idx));
    grid.appendChild(item);
  });
}

function getCategoryLabel(catId) {
  if (!portfolioData?.categories) return catId;
  return portfolioData.categories.find(c => c.id === catId)?.label || catId;
}

function showGalleryEmpty() {
  document.getElementById('gallery-loading')?.style && (document.getElementById('gallery-loading').style.display = 'none');
  document.getElementById('gallery-empty')?.style && (document.getElementById('gallery-empty').style.display = 'block');
}

/* ============================================================
   LIGHTBOX
   ============================================================ */
function initLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;

  document.getElementById('lb-close')?.addEventListener('click', closeLightbox);
  document.getElementById('lb-prev')?.addEventListener('click',  () => navigateLB(-1));
  document.getElementById('lb-next')?.addEventListener('click',  () => navigateLB(1));
  lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });

  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   navigateLB(-1);
    if (e.key === 'ArrowRight')  navigateLB(1);
  });
}

function openLightbox(idx) {
  currentLBIndex = idx;
  renderLBContent(filteredProjects);
  const lb = document.getElementById('lightbox');
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => lb.classList.add('visible'), 10);
}

function openLightboxAll(idx) {
  filteredProjects = portfolioData.projects;
  openLightbox(idx);
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  lb.classList.remove('visible');
  setTimeout(() => {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    const content = document.getElementById('lb-content');
    if (content) {
      const vid = content.querySelector('video');
      if (vid) vid.pause();
      content.innerHTML = '';
    }
  }, 300);
}

function navigateLB(dir) {
  currentLBIndex = (currentLBIndex + dir + filteredProjects.length) % filteredProjects.length;
  renderLBContent(filteredProjects);
}

function renderLBContent(list) {
  const project = list[currentLBIndex];
  if (!project) return;

  document.getElementById('lb-title').textContent   = project.title || '';
  document.getElementById('lb-desc').textContent    = project.description || '';
  document.getElementById('lb-counter').textContent = `${currentLBIndex + 1} / ${list.length}`;

  const content = document.getElementById('lb-content');
  content.innerHTML = '';

  if (project.type === 'youtube' || project.type === 'vimeo') {
    const iframe = document.createElement('iframe');
    iframe.src = project.src + (project.src.includes('?') ? '&' : '?') + 'autoplay=1';
    iframe.allow = 'autoplay; fullscreen; picture-in-picture';
    iframe.allowFullscreen = true;
    content.appendChild(iframe);
  } else if (project.type === 'video') {
    const video = document.createElement('video');
    video.src = project.src;
    video.controls = true;
    video.autoplay = true;
    content.appendChild(video);
  } else {
    const img = document.createElement('img');
    img.src = project.src;
    img.alt = project.title;
    content.appendChild(img);
  }

  const prevBtn = document.getElementById('lb-prev');
  const nextBtn = document.getElementById('lb-next');
  if (prevBtn) prevBtn.style.display = list.length > 1 ? 'flex' : 'none';
  if (nextBtn) nextBtn.style.display = list.length > 1 ? 'flex' : 'none';
}

/* ============================================================
   CONTACT FORM
   ============================================================ */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name    = document.getElementById('cf-name')?.value.trim();
    const email   = document.getElementById('cf-email')?.value.trim();
    const service = document.getElementById('cf-service')?.value;
    const msg     = document.getElementById('cf-message')?.value.trim();
    if (!name || !email || !msg) return;

    const subject = `Portfolio Inquiry — ${service || 'General'} from ${name}`;
    const body    = `Name: ${name}\nEmail: ${email}\nService: ${service || 'Not specified'}\n\nMessage:\n${msg}`;
    const em      = document.getElementById('cd-email')?.textContent || '';
    window.location.href = `mailto:${em}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    const success = document.getElementById('formSuccess');
    if (success) { success.style.display = 'flex'; setTimeout(() => success.style.display = 'none', 5000); }
    form.reset();
  });
}

/* ============================================================
   FOOTER YEAR
   ============================================================ */
function setFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ============================================================
   INIT ALL
   ============================================================ */
document.addEventListener('DOMContentLoaded', async () => {
  initLoader();
  initParticles();
  initNavbar();
  initAOS();
  initSkillBars();
  initLightbox();
  initContactForm();
  setFooterYear();
  await loadPortfolio();
});
