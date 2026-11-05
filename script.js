/* =========================================
   PORTFOLIO MAIN SCRIPT
   Reads from portfolio.json — dynamic gallery
   ========================================= */

const REPO_OWNER = 'burnhallnaveed-hash';
const REPO_NAME  = 'my-portfolio';
const BRANCH     = 'master';
const DATA_URL   = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/portfolio.json?nocache=${Date.now()}`;

let portfolioData = null;
let filteredProjects = [];
let currentLBIndex = 0;
let visibleCount = 12;
const PAGE_SIZE = 12;

// ---- INIT ----
document.addEventListener('DOMContentLoaded', async () => {
  initNavbar();
  initHamburger();
  initScrollReveal();
  document.getElementById('footer-year').textContent = new Date().getFullYear();
  await loadPortfolio();
  initLightbox();
  initContactForm();
  initCounters();
});

// ---- LOAD PORTFOLIO DATA ----
async function loadPortfolio() {
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error('Failed to fetch portfolio.json');
    portfolioData = await res.json();
    applySettings(portfolioData.settings);
    buildFilterBar(portfolioData.categories);
    filteredProjects = portfolioData.projects || [];
    renderGallery();
  } catch (err) {
    console.warn('Could not load portfolio.json from GitHub, using local fallback:', err);
    // Fallback: try local
    try {
      const res = await fetch('portfolio.json?nocache=' + Date.now());
      portfolioData = await res.json();
      applySettings(portfolioData.settings);
      buildFilterBar(portfolioData.categories);
      filteredProjects = portfolioData.projects || [];
      renderGallery();
    } catch (e) {
      showGalleryEmpty();
    }
  }
}

// ---- APPLY SETTINGS ----
function applySettings(s) {
  if (!s) return;
  const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.textContent = val; };
  const setHref = (id, val) => { const el = document.getElementById(id); if (el && val) el.href = val; };

  set('hero-eyebrow', s.title || '');
  set('hero-tagline', s.tagline ? s.tagline.split(' ')[0] : 'Visions');

  // Update hero title
  const heroTitle = document.getElementById('hero-title');
  if (heroTitle && s.tagline) {
    const words = s.tagline.split(' ');
    heroTitle.innerHTML = `
      <span class="hero-line">${words[0] || 'Transforming'}</span>
      <span class="hero-line hero-italic">${words[1] || 'Visions'}</span>
      <span class="hero-line">${words.slice(2).join(' ') || 'Into Reality'}</span>
    `;
  }

  set('about-title', (s.name || 'The Studio'));
  set('about-text', s.about || '');
  set('av-title', s.title || '');
  set('av-initials', getInitials(s.name || 'YN'));
  set('footer-name', s.name || 'Your Name');
  set('footer-name-2', s.name || 'Your Name');
  set('footer-title', s.title || '');
  set('cd-email', s.email || '');
  set('cd-phone', s.phone || '');
  if (s.email) setHref('cd-email-link', 'mailto:' + s.email);
  if (s.phone) setHref('cd-phone-link', 'tel:' + s.phone.replace(/\s/g,''));
}

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
}

// ---- FILTER BAR ----
function buildFilterBar(categories) {
  if (!categories || !categories.length) return;
  const bar = document.getElementById('filter-bar');
  bar.innerHTML = '';
  categories.forEach((cat, i) => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn' + (i === 0 ? ' active' : '');
    btn.dataset.cat = cat.id;
    btn.id = 'filter-' + cat.id;
    btn.textContent = cat.label;
    btn.addEventListener('click', () => filterGallery(cat.id, btn));
    bar.appendChild(btn);
  });
}

function filterGallery(catId, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  if (catId === 'all') {
    filteredProjects = portfolioData.projects || [];
  } else {
    filteredProjects = (portfolioData.projects || []).filter(p => p.category === catId);
  }
  visibleCount = PAGE_SIZE;
  renderGallery();
}

// ---- RENDER GALLERY ----
function renderGallery() {
  const grid = document.getElementById('gallery-grid');
  const loading = document.getElementById('gallery-loading');
  const empty = document.getElementById('gallery-empty');
  const loadMoreWrap = document.getElementById('load-more-wrap');

  if (loading) loading.style.display = 'none';

  if (!filteredProjects || filteredProjects.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
    if (loadMoreWrap) loadMoreWrap.style.display = 'none';
    return;
  }

  if (empty) empty.style.display = 'none';
  grid.innerHTML = '';

  const toShow = filteredProjects.slice(0, visibleCount);

  toShow.forEach((project, idx) => {
    const item = createGalleryItem(project, idx);
    grid.appendChild(item);
  });

  // Animate items in
  setTimeout(() => {
    document.querySelectorAll('.gallery-item').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 60);
    });
  }, 50);

  // Load more button
  if (filteredProjects.length > visibleCount) {
    if (loadMoreWrap) loadMoreWrap.style.display = 'block';
  } else {
    if (loadMoreWrap) loadMoreWrap.style.display = 'none';
  }

  const loadMoreBtn = document.getElementById('load-more-btn');
  if (loadMoreBtn) {
    loadMoreBtn.onclick = () => {
      visibleCount += PAGE_SIZE;
      renderGallery();
    };
  }
}

function createGalleryItem(project, idx) {
  const item = document.createElement('div');
  item.className = 'gallery-item';
  item.dataset.idx = idx;

  const catLabel = getCategoryLabel(project.category);
  const isVideo = project.type === 'youtube' || project.type === 'vimeo' || project.type === 'video';
  const typeIcon = isVideo ? '▶' : '⊕';

  if (isVideo) {
    item.innerHTML = `
      <div class="video-thumb">
        ${project.thumbnail ? `<img src="${project.thumbnail}" alt="${project.title}" loading="lazy"/>` : ''}
        <div class="play-btn">▶</div>
      </div>
      <div class="gallery-item-overlay">
        <div class="gi-category">${catLabel}</div>
        <div class="gi-title">${project.title}</div>
      </div>
      <div class="gi-type-badge">${typeIcon}</div>
    `;
  } else {
    item.innerHTML = `
      <img src="${project.thumbnail || project.src}" alt="${project.title}" loading="lazy"/>
      <div class="gallery-item-overlay">
        <div class="gi-category">${catLabel}</div>
        <div class="gi-title">${project.title}</div>
      </div>
      <div class="gi-type-badge">${typeIcon}</div>
    `;
  }

  item.addEventListener('click', () => openLightbox(idx));
  return item;
}

function getCategoryLabel(catId) {
  if (!portfolioData || !portfolioData.categories) return catId;
  const cat = portfolioData.categories.find(c => c.id === catId);
  return cat ? cat.label : catId;
}

function showGalleryEmpty() {
  const loading = document.getElementById('gallery-loading');
  const empty = document.getElementById('gallery-empty');
  if (loading) loading.style.display = 'none';
  if (empty) empty.style.display = 'block';
}

// ---- LIGHTBOX ----
function initLightbox() {
  const lb = document.getElementById('lightbox');
  document.getElementById('lb-close').addEventListener('click', closeLightbox);
  document.getElementById('lb-prev').addEventListener('click', () => navigateLB(-1));
  document.getElementById('lb-next').addEventListener('click', () => navigateLB(1));
  lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLB(-1);
    if (e.key === 'ArrowRight') navigateLB(1);
  });
}

function openLightbox(idx) {
  currentLBIndex = idx;
  renderLBContent();
  const lb = document.getElementById('lightbox');
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => lb.classList.add('visible'), 10);
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  lb.classList.remove('visible');
  setTimeout(() => {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    document.getElementById('lb-content').innerHTML = '';
  }, 300);
}

function navigateLB(dir) {
  currentLBIndex = (currentLBIndex + dir + filteredProjects.length) % filteredProjects.length;
  renderLBContent();
}

function renderLBContent() {
  const project = filteredProjects[currentLBIndex];
  if (!project) return;

  const content = document.getElementById('lb-content');
  document.getElementById('lb-title').textContent = project.title;
  document.getElementById('lb-desc').textContent = project.description || '';
  document.getElementById('lb-counter').textContent = `${currentLBIndex + 1} / ${filteredProjects.length}`;

  content.innerHTML = '';

  if (project.type === 'youtube' || project.type === 'vimeo') {
    const iframe = document.createElement('iframe');
    iframe.src = project.src + (project.src.includes('?') ? '&' : '?') + 'autoplay=1';
    iframe.allow = 'autoplay; fullscreen; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.style.border = 'none';
    content.appendChild(iframe);
  } else if (project.type === 'video') {
    const video = document.createElement('video');
    video.src = project.src;
    video.controls = true;
    video.autoplay = true;
    video.style.maxWidth = '90vw';
    video.style.maxHeight = '80vh';
    content.appendChild(video);
  } else {
    const img = document.createElement('img');
    img.src = project.src;
    img.alt = project.title;
    content.appendChild(img);
  }

  // Update nav visibility
  document.getElementById('lb-prev').style.display = filteredProjects.length > 1 ? 'flex' : 'none';
  document.getElementById('lb-next').style.display = filteredProjects.length > 1 ? 'flex' : 'none';
}

// ---- NAVBAR ----
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const links = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);

    // Active section highlight
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 100) current = s.id;
    });
    links.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + current);
    });
  });
}

function initHamburger() {
  const btn = document.getElementById('hamburger');
  const links = document.getElementById('nav-links');
  if (!btn || !links) return;
  btn.addEventListener('click', () => {
    links.classList.toggle('open');
    const spans = btn.querySelectorAll('span');
    if (links.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translate(4.5px, 4.5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(4.5px, -4.5px)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });
  document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => {
    links.classList.remove('open');
    btn.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }));
}

// ---- COUNTERS ----
function initCounters() {
  const heroSection = document.getElementById('home');
  let done = false;
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !done) {
      done = true;
      animateNum('stat-projects', portfolioData ? (portfolioData.projects || []).length : 20);
      animateNum('stat-clients', 15);
      animateNum('stat-years', 3);
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
    el.textContent = Math.floor((1 - Math.pow(1-p, 3)) * target) + (p === 1 ? '+' : '');
    if (p < 1) requestAnimationFrame(step);
  }
  step();
}

// ---- SCROLL REVEAL ----
function initScrollReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });

  document.querySelectorAll('.section-head, .about-grid, .contact-inner, .footer').forEach(el => {
    el.classList.add('reveal');
    obs.observe(el);
  });
}

// ---- CONTACT FORM ----
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('cf-name').value.trim();
    const email = document.getElementById('cf-email').value.trim();
    const service = document.getElementById('cf-service').value;
    const msg = document.getElementById('cf-message').value.trim();
    if (!name || !email || !msg) return showToast('Please fill in all required fields', 'error');
    const subject = `Portfolio Inquiry${service ? ' — ' + service : ''} from ${name}`;
    const body = `Name: ${name}\nEmail: ${email}\nService: ${service || 'Not specified'}\n\nMessage:\n${msg}`;
    window.location.href = `mailto:${document.getElementById('cd-email')?.textContent || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    showToast('Opening email client...', 'success');
    form.reset();
  });
}

// ---- TOAST ----
function showToast(msg, type = 'success') {
  const t = document.createElement('div');
  t.style.cssText = `
    position:fixed;top:90px;right:24px;padding:14px 24px;
    background:${type==='success' ? 'rgba(201,169,110,0.15)' : 'rgba(239,68,68,0.15)'};
    border:1px solid ${type==='success' ? 'rgba(201,169,110,0.5)' : 'rgba(239,68,68,0.5)'};
    color:${type==='success' ? '#c9a96e' : '#f87171'};
    font-size:0.875rem;font-weight:600;z-index:99999;
    animation:slideIn 0.3s ease;border-radius:0;font-family:Inter,sans-serif;
  `;
  t.textContent = msg;
  document.body.appendChild(t);
  const style = document.createElement('style');
  style.textContent = '@keyframes slideIn{from{opacity:0;transform:translateX(100%)}to{opacity:1;transform:translateX(0)}}';
  document.head.appendChild(style);
  setTimeout(() => t.remove(), 4000);
}
