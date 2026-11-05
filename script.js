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

let editMode = false;
let currentSocialPlatform = '';
let currentSoftwareTags = ['Blender', 'Revit', 'D5 Render', 'Animation'];
let authSuccessCallback = null;

/* ============================================================
   LOADER
   ============================================================ */
function initLoader() {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.classList.add('hidden');
    loader.style.display = 'none';
  }
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

  for (let i = 0; i < 40; i++) { const p = new Particle(); particles.push(p); }

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
  }, { threshold: 0.05 });
  document.querySelectorAll('[data-aos]').forEach(el => obs.observe(el));
  setTimeout(() => {
    document.querySelectorAll('[data-aos]').forEach(el => el.classList.add('animated'));
  }, 500);
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
  const totalProjects = portfolioData?.projects?.length || 7;
  animateNum('stat-projects', Math.max(totalProjects, 7));
  animateNum('stat-clients',  15);
  animateNum('stat-years',    3);
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
    const res = await fetch('portfolio.json?nc=' + Date.now());
    if (!res.ok) throw new Error('Local fetch failed');
    portfolioData = await res.json();
  } catch {
    try {
      const res = await fetch(DATA_URL);
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
  if (s.softwareTags && Array.isArray(s.softwareTags) && s.softwareTags.length) {
    currentSoftwareTags = s.softwareTags;
    renderOrbitTags();
  }
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
   EDIT MODE SYSTEM
   ============================================================ */



// EXPOSE ALL FUNCTIONS TO WINDOW SO ONCLICK ALWAYS WORKS
window.tryToggleEditMode = tryToggleEditMode;
window.triggerAddSoftware = function() {
  openSoftwareModal();
};
window.lockEditMode = function() {
  sessionStorage.removeItem('cms_session_auth');
  if (editMode) toggleEditMode();
  showToast('🔒 Edit Mode lock ho gaya!', 'error');
};
window.openSoftwareModal = openSoftwareModal;
window.closeSoftwareModal = closeSoftwareModal;
window.addNewSoftwareTag = addNewSoftwareTag;
window.saveAll = saveAll;
window.handleEditAuth = handleEditAuth;
window.closeEditAuthModal = closeEditAuthModal;

function initEditMode() {
  const btn = document.getElementById('editToggleBtn');
  const navBtn = document.getElementById('navEditBtn');
  if (btn) btn.addEventListener('click', tryToggleEditMode);
  if (navBtn) navBtn.addEventListener('click', tryToggleEditMode);
  document.getElementById('btnSave')?.addEventListener('click', saveAll);
  document.getElementById('btnReset')?.addEventListener('click', () => {
    if (confirm('⚠️ Sab local edits reset ho jayengi! Sure hain?')) {
      localStorage.removeItem('portfolio_edit_data');
      showToast('🔄 Reset! Reload ho raha hai...', 'error');
      setTimeout(() => location.reload(), 1200);
    }
  });

  // Manage software tags
  document.getElementById('btnManageSoftwares')?.addEventListener('click', openSoftwareModal);
  document.getElementById('orbitAddBtn')?.addEventListener('click', () => {
    const isAuth = sessionStorage.getItem('cms_session_auth') === 'true';
    if (isAuth) {
      openSoftwareModal();
    } else {
      openEditAuthModal(() => openSoftwareModal());
    }
  });
  document.getElementById('orbitPillTag')?.addEventListener('click', () => {
    const isAuth = sessionStorage.getItem('cms_session_auth') === 'true';
    if (isAuth) {
      openSoftwareModal();
    } else {
      openEditAuthModal(() => openSoftwareModal());
    }
  });
  document.getElementById('softwareModalClose')?.addEventListener('click', closeSoftwareModal);
  document.getElementById('softwareModalDone')?.addEventListener('click', () => {
    closeSoftwareModal();
    saveAll();
  });
  document.getElementById('btnAddNewSoftware')?.addEventListener('click', addNewSoftwareTag);
  document.getElementById('newSoftwareName')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); addNewSoftwareTag(); }
  });
  document.getElementById('softwareModal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('softwareModal')) closeSoftwareModal();
  });

  // Lock button
  document.getElementById('btnLock')?.addEventListener('click', () => {
    sessionStorage.removeItem('cms_session_auth');
    if (editMode) toggleEditMode();
    showToast('🔒 Edit Mode lock ho gaya!', 'error');
  });

  // Password verification modal
  document.getElementById('editAuthClose')?.addEventListener('click', closeEditAuthModal);
  document.getElementById('editAuthCancel')?.addEventListener('click', closeEditAuthModal);
  document.getElementById('editAuthSubmit')?.addEventListener('click', handleEditAuth);
  document.getElementById('editAuthPass')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleEditAuth();
  });
  document.getElementById('editAuthModal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('editAuthModal')) closeEditAuthModal();
  });

  // Profile photo upload
  document.getElementById('fileInputPhoto')?.addEventListener('change', function() {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const img = document.getElementById('profilePhoto');
      const ph  = document.getElementById('avatarPlaceholder');
      if (img) { img.src = e.target.result; img.style.display = 'block'; }
      if (ph)  ph.style.display = 'none';
      const data = getSavedData();
      data.profilePhoto = e.target.result;
      saveData(data);
      showToast('📸 Profile photo update ho gayi!');
    };
    reader.readAsDataURL(file);
    this.value = '';
  });

  // Social modal buttons
  document.getElementById('socialModalClose')?.addEventListener('click',  () => document.getElementById('socialModal').classList.remove('open'));
  document.getElementById('socialModalCancel')?.addEventListener('click', () => document.getElementById('socialModal').classList.remove('open'));
  document.getElementById('socialModal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('socialModal')) document.getElementById('socialModal').classList.remove('open');
  });
  document.getElementById('socialModalSave')?.addEventListener('click', () => {
    const url = document.getElementById('socialUrlInput')?.value.trim();
    if (!url) return;
    document.querySelectorAll(`[data-platform="${currentSocialPlatform}"]`).forEach(el => el.href = url);
    const data = getSavedData();
    data.socialLinks = data.socialLinks || {};
    data.socialLinks[currentSocialPlatform] = url;
    saveData(data);
    document.getElementById('socialModal').classList.remove('open');
    showToast(`🔗 ${currentSocialPlatform} link save ho gaya!`);
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key.toLowerCase() === 'e') { e.preventDefault(); tryToggleEditMode(); }
    if (e.ctrlKey && e.key.toLowerCase() === 's' && editMode) { e.preventDefault(); saveAll(); }
  });

  loadSavedEdits();
}

let lastToggleTime = 0;
function tryToggleEditMode() {
  const now = Date.now();
  if (now - lastToggleTime < 300) return;
  lastToggleTime = now;

  if (editMode) {
    toggleEditMode();
    return;
  }
  const isAuth = sessionStorage.getItem('cms_session_auth') === 'true';
  if (isAuth) {
    toggleEditMode();
  } else {
    openEditAuthModal();
  }
}

function openEditAuthModal(callback = null) {
  authSuccessCallback = callback;
  const modal = document.getElementById('editAuthModal');
  if (modal) {
    modal.style.display = 'flex';
    modal.style.opacity = '1';
    modal.style.visibility = 'visible';
    modal.style.zIndex = '999999';
    modal.classList.add('open');
    const passInput = document.getElementById('editAuthPass');
    const err = document.getElementById('editAuthError');
    if (err) err.style.display = 'none';
    if (passInput) {
      passInput.value = '';
      setTimeout(() => passInput.focus(), 100);
    }
  } else {
    const entered = prompt('Enter Admin Password:');
    if (entered === (localStorage.getItem('cms_admin_password') || 'admin123')) {
      sessionStorage.setItem('cms_session_auth', 'true');
      if (typeof authSuccessCallback === 'function') authSuccessCallback();
      else toggleEditMode();
    } else if (entered) {
      alert('Incorrect password!');
    }
  }
}

function closeEditAuthModal() {
  const modal = document.getElementById('editAuthModal');
  if (modal) {
    modal.style.display = 'none';
    modal.style.opacity = '0';
    modal.style.visibility = 'hidden';
    modal.classList.remove('open');
  }
  authSuccessCallback = null;
}

let lastAuthTime = 0;
function handleEditAuth() {
  const now = Date.now();
  if (now - lastAuthTime < 300) return;
  lastAuthTime = now;
  const passInput = document.getElementById('editAuthPass');
  const entered = passInput?.value || '';
  const savedPass = localStorage.getItem('cms_admin_password') || 'admin123';
  const err = document.getElementById('editAuthError');

  if (entered === savedPass) {
    sessionStorage.setItem('cms_session_auth', 'true');
    closeEditAuthModal();
    if (typeof authSuccessCallback === 'function') {
      const cb = authSuccessCallback;
      authSuccessCallback = null;
      cb();
    } else {
      toggleEditMode();
    }
  } else {
    if (err) {
      err.style.display = 'block';
      err.textContent = '❌ Incorrect password! Access denied.';
    }
    passInput?.focus();
  }
}

function toggleEditMode() {
  editMode = !editMode;
  const btn   = document.getElementById('editToggleBtn');
  const icon  = document.getElementById('editIcon');
  const label = document.getElementById('editLabel');

  document.body.classList.toggle('edit-mode', editMode);
  document.getElementById('editToolbar')?.classList.toggle('active', editMode);
  btn?.classList.toggle('editing', editMode);
  document.getElementById('navbar')?.classList.toggle('edit-pushed', editMode);
  if (icon)  icon.className   = editMode ? 'fas fa-xmark' : 'fas fa-pen-to-square';
  if (label) label.textContent = editMode ? 'Exit Edit' : 'Edit Mode';

  if (editMode) {
    document.querySelectorAll('.editable').forEach(el => {
      el.setAttribute('contenteditable', 'true');
      el.setAttribute('spellcheck', 'false');
    });
    // Profile photo click
    const avatar = document.getElementById('about-avatar');
    if (avatar) avatar.onclick = () => { if (editMode) document.getElementById('fileInputPhoto')?.click(); };
    // Social links — click to set URL
    document.querySelectorAll('.social-link').forEach(link => {
      link.onclick = e => {
        if (!editMode) return;
        e.preventDefault(); e.stopPropagation();
        openSocialModal(link.dataset.platform, link);
      };
    });
    showToast('✏️ Edit Mode ON — text par click kar ke edit karein!');
  } else {
    document.querySelectorAll('.editable').forEach(el => el.removeAttribute('contenteditable'));
    showToast('✅ View Mode — changes browser mein save hain!');
  }
  renderOrbitTags();
}

function renderOrbitTags() {
  const container = document.getElementById('floatingTags');
  if (!container) return;
  container.innerHTML = '';
  currentSoftwareTags.forEach((name, i) => {
    const span = document.createElement('span');
    span.className = `tag t${(i % 12) + 1}${editMode ? ' editable' : ''}`;
    span.textContent = name;
    if (editMode) {
      span.setAttribute('contenteditable', 'true');
      span.setAttribute('spellcheck', 'false');
      span.title = 'Click to edit text directly';
      span.addEventListener('input', () => {
        currentSoftwareTags[i] = span.textContent.trim();
        const d = getSavedData();
        d.softwareTags = currentSoftwareTags;
        saveData(d);
      });
    } else {
      span.title = 'Click to manage softwares';
      span.style.cursor = 'pointer';
      span.addEventListener('click', () => {
        const isAuth = sessionStorage.getItem('cms_session_auth') === 'true';
        if (isAuth) {
          openSoftwareModal();
        } else {
          openEditAuthModal(() => openSoftwareModal());
        }
      });
    }
    container.appendChild(span);
  });

  // Always show '+ Add Software' pill in the circle
  const addPill = document.createElement('span');
  addPill.className = 'tag tag-add-pill';
  addPill.style.top = '-8%';
  addPill.style.left = '32%';
  addPill.innerHTML = '<i class="fas fa-plus"></i> Add Software';
  addPill.title = 'Click to add more softwares to this circle';
  addPill.addEventListener('click', () => {
    const isAuth = sessionStorage.getItem('cms_session_auth') === 'true';
    if (isAuth) {
      openSoftwareModal();
    } else {
      openEditAuthModal(() => openSoftwareModal());
    }
  });
  container.appendChild(addPill);
}

function openSoftwareModal() {
  renderSoftwareModalList();
  const modal = document.getElementById('softwareModal');
  if (modal) {
    modal.style.display = 'flex';
    modal.style.opacity = '1';
    modal.style.visibility = 'visible';
    modal.style.zIndex = '999999';
    modal.classList.add('open');
    setTimeout(() => document.getElementById('newSoftwareName')?.focus(), 100);
  } else {
    const name = prompt('Enter Software Name (e.g. AutoCAD, 3ds Max):');
    if (name) {
      currentSoftwareTags.push(name.trim());
      renderOrbitTags();
      const d = getSavedData();
      d.softwareTags = currentSoftwareTags;
      saveData(d);
    }
  }
}

function closeSoftwareModal() {
  const modal = document.getElementById('softwareModal');
  if (modal) {
    modal.style.display = 'none';
    modal.style.opacity = '0';
    modal.style.visibility = 'hidden';
    modal.classList.remove('open');
  }
}

function renderSoftwareModalList() {
  const list = document.getElementById('softwareTagsList');
  if (!list) return;
  list.innerHTML = '';
  if (!currentSoftwareTags.length) {
    list.innerHTML = '<span style="color:var(--text-muted);font-size:0.8rem;padding:0.4rem;">Koi software tag nahi hai. Neeche se add karein.</span>';
    return;
  }
  currentSoftwareTags.forEach((tag, idx) => {
    const chip = document.createElement('div');
    chip.className = 'modal-tag-chip';
    chip.innerHTML = `
      <span>${tag}</span>
      <button type="button" class="chip-del-btn" title="Delete"><i class="fas fa-xmark"></i></button>
    `;
    chip.querySelector('.chip-del-btn').addEventListener('click', () => {
      currentSoftwareTags.splice(idx, 1);
      renderSoftwareModalList();
      renderOrbitTags();
      const d = getSavedData();
      d.softwareTags = currentSoftwareTags;
      saveData(d);
      showToast('🗑️ Tag remove ho gaya!');
    });
    list.appendChild(chip);
  });
}

function addNewSoftwareTag() {
  const input = document.getElementById('newSoftwareName');
  const val = input?.value.trim();
  if (!val) return;
  if (currentSoftwareTags.length >= 12) {
    showToast('⚠️ Maximum 12 software tags rakh sakte hain', 'error');
    return;
  }
  currentSoftwareTags.push(val);
  input.value = '';
  renderSoftwareModalList();
  renderOrbitTags();
  const d = getSavedData();
  d.softwareTags = currentSoftwareTags;
  saveData(d);
  showToast(`✨ "${val}" circle mein add ho gaya!`);
}

function openSocialModal(platform, el) {
  currentSocialPlatform = platform;
  const data = getSavedData();
  const label = document.getElementById('socialModalLabel');
  const input = document.getElementById('socialUrlInput');
  if (label) label.textContent = (platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : 'Social') + ' link enter karein';
  if (input) input.value = (data.socialLinks && data.socialLinks[platform]) || el?.getAttribute('href') || '';
  document.getElementById('socialModal')?.classList.add('open');
}

async function saveAll() {
  const saveBtn = document.getElementById('btnSave');
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
  }
  const data = getSavedData();
  data.text = data.text || {};
  document.querySelectorAll('.editable[data-key]').forEach(el => {
    data.text[el.dataset.key] = el.innerHTML;
  });
  const img = document.getElementById('profilePhoto');
  if (img && img.style.display !== 'none' && img.src && img.src.startsWith('data:')) {
    data.profilePhoto = img.src;
  }
  data.softwareTags = currentSoftwareTags;
  saveData(data);

  // Sync to GitHub if token exists in browser
  const token = localStorage.getItem('cms_gh_token');
  if (token && portfolioData) {
    try {
      showToast('☁️ GitHub par publish ho raha hai...', 'success');
      portfolioData.settings = portfolioData.settings || {};
      portfolioData.settings.softwareTags = currentSoftwareTags;
      const heroLine2 = document.querySelector('[data-key="heroLine2"]')?.textContent?.trim();
      const heroDesc  = document.querySelector('[data-key="heroDesc"]')?.textContent?.trim();
      const aboutText = document.querySelector('[data-key="aboutText"]')?.textContent?.trim();
      const aboutTitle= document.querySelector('[data-key="aboutTitle"]')?.textContent?.trim();
      const contactEm = document.querySelector('[data-key="contactEmail"]')?.textContent?.trim();
      const contactPh = document.querySelector('[data-key="contactPhone"]')?.textContent?.trim();

      if (aboutTitle) portfolioData.settings.name = aboutTitle;
      if (heroLine2)  portfolioData.settings.tagline = heroLine2;
      if (aboutText)  portfolioData.settings.about = aboutText;
      if (contactEm)  portfolioData.settings.email = contactEm;
      if (contactPh)  portfolioData.settings.phone = contactPh;

      const fileRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/portfolio.json`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      let sha = null;
      if (fileRes.ok) {
        const fileJson = await fileRes.json();
        sha = fileJson.sha;
      }

      const jsonString = JSON.stringify(portfolioData, null, 2);
      const base64Json = btoa(unescape(encodeURIComponent(jsonString)));

      const putRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/portfolio.json`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Update portfolio directly from website edit mode',
          content: base64Json,
          sha: sha,
          branch: BRANCH
        })
      });

      if (putRes.ok) {
        showToast('🚀 Live website update ho gayi aur GitHub par save ho gayi!');
      } else {
        showToast('💾 Changes browser mein save ho gaye!');
      }
    } catch (e) {
      console.warn(e);
      showToast('💾 Changes browser mein save ho gaye!');
    }
  } else {
    showToast('💾 Tamam changes browser mein save ho gaye!');
  }

  if (saveBtn) {
    saveBtn.disabled = false;
    saveBtn.innerHTML = '<i class="fas fa-floppy-disk"></i> Save';
  }
}

function getSavedData() {
  try { return JSON.parse(localStorage.getItem('portfolio_edit_data') || '{}'); } catch { return {}; }
}
function saveData(data) {
  try {
    localStorage.setItem('portfolio_edit_data', JSON.stringify(data));
  } catch {
    const slim = { text: data.text, socialLinks: data.socialLinks };
    try { localStorage.setItem('portfolio_edit_data', JSON.stringify(slim)); } catch {}
    showToast('⚠️ Image size zyada hai — text save ho gaya', 'error');
  }
}

function loadSavedEdits() {
  const data = getSavedData();
  if (data.text) {
    Object.entries(data.text).forEach(([key, val]) => {
      const el = document.querySelector(`[data-key="${key}"]`);
      if (el) el.innerHTML = val;
    });
  }
  if (data.profilePhoto) {
    const img = document.getElementById('profilePhoto');
    const ph  = document.getElementById('avatarPlaceholder');
    if (img) { img.src = data.profilePhoto; img.style.display = 'block'; }
    if (ph)  ph.style.display = 'none';
  }
  if (data.socialLinks) {
    Object.entries(data.socialLinks).forEach(([platform, url]) => {
      document.querySelectorAll(`[data-platform="${platform}"]`).forEach(el => el.href = url);
    });
  }
  if (data.softwareTags && Array.isArray(data.softwareTags) && data.softwareTags.length) {
    currentSoftwareTags = data.softwareTags;
  }
  renderOrbitTags();
}

function showToast(msg, type = 'success') {
  const toast    = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  if (!toast || !toastMsg) return;
  toastMsg.textContent = msg;
  toast.style.borderColor = type === 'error' ? 'rgba(239,68,68,.4)' : 'rgba(16,185,129,.4)';
  toast.style.color       = type === 'error' ? '#ef4444' : 'var(--green)';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

console.log('%c✏️ Edit Mode Loaded', 'color:#a855f7;font-size:1.1rem;font-weight:bold;');
console.log('%cCtrl+E = Toggle Edit | Ctrl+S = Save', 'color:#06b6d4;');


/* ============================================================
   BOOT PORTFOLIO (EXECUTES AFTER ALL DEFINITIONS)
   ============================================================ */
function bootPortfolio() {
  try { initLoader(); } catch(e) { console.warn(e); }
  try { initCursor(); } catch(e) { console.warn(e); }
  try { initParticles(); } catch(e) { console.warn(e); }
  try { initNavbar(); } catch(e) { console.warn(e); }
  try { initAOS(); } catch(e) { console.warn(e); }
  try { initSkillBars(); } catch(e) { console.warn(e); }
  try { initLightbox(); } catch(e) { console.warn(e); }
  try { initContactForm(); } catch(e) { console.warn(e); }
  try { setFooterYear(); } catch(e) { console.warn(e); }
  try { initEditMode(); } catch(e) { console.warn(e); }
  loadPortfolio().catch(err => {
    console.error('loadPortfolio error:', err);
    showGalleryEmpty();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootPortfolio);
} else {
  bootPortfolio();
}
