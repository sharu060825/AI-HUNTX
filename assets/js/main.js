/* ==================================================
   CONFIGURATION — EDIT THESE VALUES
================================================== */
const CONFIG = {
  // Target date for countdown (ISO format: YYYY-MM-DDTHH:MM:SS)
  eventDate: '2026-10-06 09:00:00',

  // Organiser email — receives notification on every registration
  techEmail: 'kishore2507ms@gmail.com',

  // ─── EmailJS settings ───────────────────────────────────────────────────
  // Sign up free at https://www.emailjs.com (200 emails/month free tier)
  // HOW TO SET UP:
  //  1. Create account → Dashboard → Email Services → Add Service (Gmail)
  //  2. Note your Service ID  (e.g. "service_abc1234")
  //  3. Create TWO Email Templates (see template guides in the code below)
  //  4. Note both Template IDs
  //  5. Account → API Keys → copy your Public Key
  //  6. Paste all three values below — done, no backend needed!
  emailjs: {
    publicKey:              '2P8-MACtgrnFXx0sK',
    serviceId:              'service_xjqnn1o',
    confirmationTemplateId: 'template_eqza3n7',
    notificationTemplateId: 'template_kf67eed',
  },

  // ─── Backend API (Express + MongoDB) ────────────────────────────────────
  // The Node server serves this whole site AND the /api endpoints, so a
  // relative base URL keeps things working in dev and in production alike.
  api: {
    baseUrl: '/api',
  },
};

/* ==================================================
   PRELOADER — lock scroll, animate progress, reveal site
================================================== */
document.documentElement.classList.add('loading-lock');
(function() {
  const LOAD_DURATION = 5000;
  const loader = document.getElementById('loader');
  const fill = document.getElementById('loader-fill');
  const start = performance.now();

  function tick(now) {
    const p = Math.min((now - start) / LOAD_DURATION, 1);
    fill.style.width = (p * 100).toFixed(1) + '%';
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  setTimeout(() => {
    loader.classList.add('loader-hide');
    document.documentElement.classList.remove('loading-lock');
    setTimeout(() => loader.remove(), 950);
  }, LOAD_DURATION);
})();

/* ==================================================
   CANVAS BACKGROUND — CYBER TELEMETRY & DATA GRID
================================================== */
(function() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  const isMobile = () => window.innerWidth < 768;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); buildScene(); });

  /* ---- Cyber Telemetry Particles ---- */
  class Particle {
    constructor() { this.reset(true); }
    reset(init) {
      this.x = Math.random() * W;
      this.y = init ? Math.random() * H : H + 10;
      this.r = 0.5 + Math.random() * 1.8;
      this.vx = (Math.random() - 0.5) * 0.15;
      this.vy = -(0.04 + Math.random() * 0.12);
      this.a = Math.random() * 0.45 + 0.08;
      this.pulse = Math.random() * Math.PI * 2;
      this.pulseSpeed = 0.02 + Math.random() * 0.02;
      const palette = ['0,245,212', '247,37,133', '254,228,64'];
      this.col = palette[Math.floor(Math.random() * palette.length)];
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.pulse += this.pulseSpeed;
      if (this.y < -10) this.reset(false);
      if (this.x < 0) this.x = W;
      if (this.x > W) this.x = 0;
    }
    draw(ctx) {
      const a = this.a * (0.6 + 0.4 * Math.sin(this.pulse));
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.col},${a.toFixed(3)})`;
      ctx.fill();
    }
  }

  /* ---- Cyber Glider / Data Packet Nodes ---- */
  class CyberGlider {
    constructor() {
      this.reset(true);
    }
    reset(init) {
      this.dir = Math.random() > 0.5 ? 1 : -1;
      this.x = init ? Math.random() * W : (this.dir > 0 ? -60 : W + 60);
      this.y = Math.random() * H;
      this.speed = (0.35 + Math.random() * 0.45) * this.dir;
      this.size = 2 + Math.random() * 2.5;
      this.alpha = 0.12 + Math.random() * 0.18;
      this.col = Math.random() > 0.4 ? '#00f5d4' : '#f72585';
      this.pulse = Math.random() * Math.PI * 2;
    }
    update() {
      this.x += this.speed;
      this.pulse += 0.04;
      if (this.dir > 0 && this.x > W + 70) this.reset(false);
      if (this.dir < 0 && this.x < -70) this.reset(false);
    }
    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.alpha * (0.7 + 0.3 * Math.sin(this.pulse));
      ctx.fillStyle = this.col;
      ctx.fillRect(this.x, this.y, this.size, this.size);
      ctx.strokeStyle = this.col;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(this.x - this.dir * 12, this.y + this.size / 2);
      ctx.lineTo(this.x, this.y + this.size / 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  let particles = [], gliders = [];
  function buildScene() {
    const mobile = isMobile();
    particles = [];
    gliders = [];
    const pCount = mobile ? 40 : 85;
    for (let i = 0; i < pCount; i++) particles.push(new Particle());
    const gCount = mobile ? 5 : 12;
    for (let i = 0; i < gCount; i++) gliders.push(new CyberGlider());
  }
  buildScene();

  /* ---- Wave lines / Cyber telemetry scanlines ---- */
  let wt = 0;
  function drawWaves() {
    const waves = [
      { y: H * 0.65, a: 0.022, col: 'rgba(0,245,212,0.045)', freq: 0.004, speed: 0.3 },
      { y: H * 0.72, a: 0.016, col: 'rgba(247,37,133,0.035)', freq: 0.005, speed: 0.2 },
      { y: H * 0.80, a: 0.020, col: 'rgba(0,245,212,0.035)', freq: 0.003, speed: 0.5 },
    ];
    waves.forEach(w => {
      ctx.beginPath();
      ctx.strokeStyle = w.col;
      ctx.lineWidth = 1;
      for (let x = 0; x <= W; x += 4) {
        const y = w.y + Math.sin(x * w.freq + wt * w.speed) * (w.a * H);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    });
  }

  /* ---- Glowing vertical data lines ---- */
  function drawDataLines() {
    const positions = [0.08, 0.42, 0.61, 0.87];
    positions.forEach((xp, i) => {
      const x1 = W * xp;
      const x2 = x1 + W * 0.03;
      const grad = ctx.createLinearGradient(x1, 0, x2, H);
      grad.addColorStop(0, 'transparent');
      const mid = 0.25 + Math.sin(wt * 0.18 + i) * 0.12;
      grad.addColorStop(mid, i % 2 === 0 ? 'rgba(0,245,212,0.035)' : 'rgba(247,37,133,0.025)');
      grad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1;
      ctx.moveTo(x1, 0); ctx.lineTo(x2, H);
      ctx.stroke();
    });
  }

  /* ---- Mouse cursor light cone ---- */
  const mouse = { x: -500, y: -500, active: false };
  document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; });
  document.addEventListener('mouseleave', () => { mouse.active = false; });

  /* ---- Main render loop ---- */
  function animate() {
    ctx.clearRect(0, 0, W, H);
    wt += 0.008;

    // Subtle ambient cursor glow
    if (mouse.active) {
      const lightGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 320);
      lightGrad.addColorStop(0,   'rgba(0,245,212,0.035)');
      lightGrad.addColorStop(0.5, 'rgba(247,37,133,0.012)');
      lightGrad.addColorStop(1,   'transparent');
      ctx.fillStyle = lightGrad;
      ctx.fillRect(0, 0, W, H);
    }

    drawDataLines();
    drawWaves();

    // Gliders & Particles
    gliders.forEach(g => { g.update(); g.draw(ctx); });
    particles.forEach(p => { p.update(); p.draw(ctx); });

    // Mouse radar ring pulse
    if (mouse.active) {
      const t = (performance.now() % 2000) / 2000;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, t * 75, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0,245,212,${(0.18 * (1 - t)).toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    requestAnimationFrame(animate);
  }
  animate();
})();

/* ==================================================
   NAVBAR SCROLL
================================================== */
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 60);
});

/* ==================================================
   COUNTDOWN TIMER
================================================== */
(function() {
  const target = new Date(CONFIG.eventDate).getTime();
  function tick() {
    const now = Date.now();
    const diff = target - now;
    if (diff <= 0) {
      document.getElementById('countdown').innerHTML = '<div style="font-family:Orbitron,monospace;color:var(--teal);letter-spacing:.1em">Event is Live!</div>';
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    document.getElementById('cd-d').textContent = String(d).padStart(2, '0');
    document.getElementById('cd-h').textContent = String(h).padStart(2, '0');
    document.getElementById('cd-m').textContent = String(m).padStart(2, '0');
    document.getElementById('cd-s').textContent = String(s).padStart(2, '0');
  }
  tick();
  setInterval(tick, 1000);
})();

/* ==================================================
   SCROLL REVEAL
================================================== */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal, .reveal-stagger, .timeline-item').forEach(el => observer.observe(el));

/* ==================================================
   PARTICLE CANVAS — subtle drifting dots
================================================== */
(function() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function rand(min, max) { return Math.random() * (max - min) + min; }

  const COLORS = ['rgba(0,212,200,', 'rgba(0,122,255,', 'rgba(0,245,255,'];
  const COUNT  = Math.min(60, Math.floor(window.innerWidth / 22));

  for (let i = 0; i < COUNT; i++) {
    const c = COLORS[Math.floor(Math.random() * COLORS.length)];
    particles.push({
      x: rand(0, window.innerWidth),
      y: rand(0, window.innerHeight),
      r: rand(0.6, 1.8),
      dx: rand(-0.18, 0.18),
      dy: rand(-0.12, 0.12),
      alpha: rand(0.06, 0.22),
      color: c,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.fill();
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < -5) p.x = W + 5;
      if (p.x > W + 5) p.x = -5;
      if (p.y < -5) p.y = H + 5;
      if (p.y > H + 5) p.y = -5;
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ==================================================
   STAT COUNT-UP
================================================== */
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    if (el.dataset.counted) return;
    el.dataset.counted = '1';
    const target = parseFloat(el.dataset.count);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const dur = 1400;
    const t0 = performance.now();
    el.classList.add('counting');
    function step(now) {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(target * eased);
      el.textContent = prefix + val + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.classList.remove('counting');
    }
    requestAnimationFrame(step);
    statObserver.unobserve(el);
  });
}, { threshold: 0.4 });
document.querySelectorAll('.stat-num[data-count]').forEach(el => statObserver.observe(el));

/* ==================================================
   MAGNETIC BUTTONS
================================================== */
document.querySelectorAll('.btn-primary, .btn-secondary, .nav-cta').forEach(btn => {
  const strength = 10;
  btn.addEventListener('mousemove', (e) => {
    const r = btn.getBoundingClientRect();
    const mx = ((e.clientX - r.left) / r.width - 0.5) * strength;
    const my = ((e.clientY - r.top) / r.height - 0.5) * strength;
    btn.style.setProperty('--mx', mx.toFixed(1) + 'px');
    btn.style.setProperty('--my', my.toFixed(1) + 'px');
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.setProperty('--mx', '0px');
    btn.style.setProperty('--my', '0px');
  });
});

/* ==================================================
   CARD 3D TILT
================================================== */
document.querySelectorAll('.detail-card, .coordinator-card').forEach(card => {
  const max = 6;
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(600px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

/* ==================================================
   HERO PARALLAX
================================================== */
(function() {
  const hero = document.getElementById('hero');
  const title = hero.querySelector('.hero-title');
  const badge = hero.querySelector('.hero-badge');
  hero.addEventListener('mousemove', (e) => {
    const r = hero.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    title.style.transform = `translate(${(px * 10).toFixed(1)}px, ${(py * 8).toFixed(1)}px)`;
    badge.style.transform = `translate(${(px * 6).toFixed(1)}px, ${(py * 4).toFixed(1)}px)`;
  });
  hero.addEventListener('mouseleave', () => {
    title.style.transform = '';
    badge.style.transform = '';
  });
})();

/* ==================================================
   CUSTOM CURSOR — dot + ring (no trace left behind)
================================================== */
(function() {
  if (window.matchMedia('(pointer: coarse)').matches) return; // skip touch

  const dot   = document.getElementById('cursor-dot');
  const ring  = document.getElementById('cursor-ring');

  let mx = -200, my = -200;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  // Hover state on interactive elements
  const interactors = 'a, button, [role="button"], .faq-q, .detail-card, .coordinator-card, .nav-cta, input, select, textarea';
  document.querySelectorAll(interactors).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
  document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
  document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'));

  function animCursor() {
    // Dot and ring both snap directly to the pointer — no lag, no trace left behind
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
    ring.style.left = mx + 'px';
    ring.style.top  = my + 'px';

    requestAnimationFrame(animCursor);
  }
  animCursor();
})();

/* ==================================================
  / MOBILE NAV
================================================== */
(function() {
  const ham = document.getElementById('ham');
  if (!ham) return;
  const navLinks = document.querySelector('.nav-links');
  const navCta   = document.querySelector('.nav-cta');
  let open = false;

  // Build a mobile drawer if not exists
  let drawer = document.getElementById('mobile-drawer');
  if (!drawer) {
    drawer = document.createElement('div');
    drawer.id = 'mobile-drawer';
    drawer.style.cssText = `
      position:fixed;top:0;right:0;width:260px;height:100vh;
      background:rgba(3,12,28,0.97);backdrop-filter:blur(20px);
      border-left:1px solid rgba(0,212,200,0.18);
      z-index:200;transform:translateX(100%);
      transition:transform 0.38s cubic-bezier(.4,0,.2,1);
      display:flex;flex-direction:column;padding:6rem 2rem 2rem;gap:1.5rem;
    `;
    drawer.innerHTML = `
      <a href="#details"      style="font-family:Orbitron,monospace;font-size:0.8rem;letter-spacing:.12em;color:#a8b8cc;text-transform:uppercase">Details</a>
      <a href="#timeline"     style="font-family:Orbitron,monospace;font-size:0.8rem;letter-spacing:.12em;color:#a8b8cc;text-transform:uppercase">Timeline</a>
      <a href="#coordinators" style="font-family:Orbitron,monospace;font-size:0.8rem;letter-spacing:.12em;color:#a8b8cc;text-transform:uppercase">Team</a>
      <a href="#faq"          style="font-family:Orbitron,monospace;font-size:0.8rem;letter-spacing:.12em;color:#a8b8cc;text-transform:uppercase">FAQ</a>
      <button onclick="document.getElementById('register').scrollIntoView({behavior:'smooth'})"
        style="margin-top:1rem;font-family:Orbitron,monospace;font-size:0.75rem;font-weight:700;color:#020b18;
               background:linear-gradient(135deg,#00d4c8,#007aff);border:none;padding:.7rem 1.4rem;border-radius:4px;cursor:pointer;letter-spacing:.08em">
        Register Now
      </button>
    `;
    document.body.appendChild(drawer);
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggle(false)));
    drawer.querySelector('button').addEventListener('click', () => toggle(false));
  }

  function toggle(force) {
    open = force !== undefined ? force : !open;
    drawer.style.transform = open ? 'translateX(0)' : 'translateX(100%)';
    ham.classList.toggle('ham-open', open);
  }
  ham.addEventListener('click', () => toggle());

  // Close on outside click
  document.addEventListener('click', e => {
    if (open && !drawer.contains(e.target) && !ham.contains(e.target)) toggle(false);
  });
})();

document.querySelectorAll('.faq-q').forEach(q => {
  q.addEventListener('click', () => {
    const item = q.parentElement;
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  });
});

/* ==================================================
   TOAST HELPER
================================================== */
function showToast(msg, duration = 4000) {
  const t = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

function isEmailDeliveryNonFatal(err) {
  const raw = String(err?.text || err?.message || err || '').toLowerCase();
  return (
    err?.status === 422 ||
    /recipients address is empty|recipient.*empty|missing.*recipient|missing.*email|template.*not found|invalid.*template|bad request/.test(raw)
  );
}

/* ==================================================
   DYNAMIC MEMBER FIELDS (based on Number of Participants)
================================================== */
(function() {
  const countSelect = document.getElementById('participantcount');
  const wrap = document.getElementById('member-fields-wrap');
  const container = document.getElementById('member-fields');
  if (!countSelect || !container) return;

  function renderMemberFields(n) {
    // Preserve any already-entered values when re-rendering
    const existing = {};
    container.querySelectorAll('input').forEach(inp => { existing[inp.name] = inp.value; });

    container.innerHTML = '';
    for (let i = 1; i <= n; i++) {
      const nameKey = `member${i}_name`;
      const regKey  = `member${i}_regno`;
      const deptKey = `member${i}_dept`;
      const block = document.createElement('div');
      block.className = 'member-entry';
      block.innerHTML = `
        <div class="member-entry-title">Member ${i}</div>
        <div class="form-group">
          <label class="form-label" for="${nameKey}">Full Name <span class="req">*</span></label>
          <input class="form-input" id="${nameKey}" name="${nameKey}" type="text" placeholder="Member ${i} full name" required value="${existing[nameKey] || ''}">
        </div>
        <div class="form-group">
          <label class="form-label" for="${regKey}">Register Number <span class="req">*</span></label>
          <input class="form-input" id="${regKey}" name="${regKey}" type="text" placeholder="Member ${i} register number" required value="${existing[regKey] || ''}">
        </div>
        <div class="form-group">
          <label class="form-label" for="${deptKey}">Department <span class="req">*</span></label>
          <input class="form-input" id="${deptKey}" name="${deptKey}" type="text" placeholder="Member ${i} department" required value="${existing[deptKey] || ''}">
        </div>
      `;
      container.appendChild(block);
    }
  }

  countSelect.addEventListener('change', function() {
    const n = parseInt(this.value, 10);
    if (!n) { wrap.style.display = 'none'; container.innerHTML = ''; return; }
    wrap.style.display = 'block';
    renderMemberFields(n);
  });
})();

/* ==================================================
   REGISTRATION CAP — lock the form once 50 seats are taken
================================================== */
async function lockFormIfFull() {
  let status;
  try {
    const res = await fetch(`${CONFIG.api.baseUrl}/register/status`);
    status = await res.json();
  } catch (err) {
    console.error('[Shark Event] Seat count check failed:', err);
    return;
  }

  if (status.full) {
    const form = document.getElementById('reg-form');
    const btn = form.querySelector('.btn-submit');
    btn.disabled = true;
    btn.querySelector('span:first-child').textContent = 'Registrations Closed';
    showToast(`Registration limit of ${status.max} reached. Registrations are closed.`);
  }
}
lockFormIfFull();

/* ==================================================
   REGISTRATION FORM
================================================== */
document.getElementById('reg-form').addEventListener('submit', async function(e) {
  e.preventDefault();

  const form = this;
  const btn = form.querySelector('.btn-submit');
  const data = new FormData(form);

  // Basic validation
  const required = ['fullname', 'regno', 'mobile', 'email', 'dept', 'section', 'teamname', 'participantcount'];
  let valid = true;
  required.forEach(field => {
    const el = form.querySelector(`[name="${field}"]`);
    if (!el.value.trim()) {
      el.style.borderColor = '#ff4d6d';
      el.addEventListener('input', () => el.style.borderColor = '', { once: true });
      valid = false;
    }
  });

  // Validate dynamically-generated member fields too
  form.querySelectorAll('#member-fields input').forEach(el => {
    if (!el.value.trim()) {
      el.style.borderColor = '#ff4d6d';
      el.addEventListener('input', () => el.style.borderColor = '', { once: true });
      valid = false;
    }
  });

  if (!valid) { showToast('Please fill in all required fields.'); return; }

  // Email validation
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(data.get('email'))) {
    form.querySelector('#email').style.borderColor = '#ff4d6d';
    showToast('Please enter a valid email address.');
    return;
  }

  btn.disabled = true;
  btn.querySelector('span:first-child').textContent = 'Submitting...';

  // Build a readable summary of each member's details
  const selectedMembers = parseInt(data.get('participantcount') || '0', 10);
  if (isNaN(selectedMembers) || selectedMembers < 2 || selectedMembers > 4) {
    showToast('Team size must be 3–5 members per team (1 leader + 2 to 4 members).');
    return;
  }
  let memberSummary = '';
  for (let i = 1; i <= selectedMembers; i++) {
    const mName = data.get(`member${i}_name`) || '';
    const mReg  = data.get(`member${i}_regno`) || '';
    const mDept = data.get(`member${i}_dept`) || '';
    memberSummary += `Member ${i}: ${mName} (${mReg}) — ${mDept}\n`;
  }

  // Build template variables — used in both EmailJS templates
  const templateVars = {
    to_name:          data.get('fullname'),
    to_email:         data.get('email'),
    regno:            data.get('regno'),
    mobile:           data.get('mobile'),
    department:       data.get('dept'),
    section:          data.get('section'),
    team_name:        data.get('teamname')     || 'N/A',
    participant_count: (selectedMembers + 1),
    team_members:     memberSummary.trim(),
    from_email:       data.get('email'),       // for notification reply-to
    submitted_at:     new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    whatsapp_link:    'https://chat.whatsapp.com/FAcdjbTpnwl4QIT7d6AOAt', // event WhatsApp group — add {{whatsapp_link}} to the EmailJS confirmation template
  };

  // Persist to MongoDB (via the Express API) first — the server enforces
  // the registration cap, so this is the source of truth even if the
  // earlier client-side check was stale.
  const memberDetails = [];
  for (let i = 1; i <= selectedMembers; i++) {
    memberDetails.push({
      name:  data.get(`member${i}_name`)  || '',
      regno: data.get(`member${i}_regno`) || '',
      dept:  data.get(`member${i}_dept`)  || '',
    });
  }

  let dbError = null;
  try {
    const res = await fetch(`${CONFIG.api.baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullname:          data.get('fullname'),
        regno:             data.get('regno'),
        mobile:            data.get('mobile'),
        email:             data.get('email'),
        dept:              data.get('dept'),
        section:           data.get('section'),
        teamname:          data.get('teamname'),
        participantCount:  (selectedMembers + 1),
        memberDetails,
      }),
    });
    const body = await res.json();
    if (!res.ok) dbError = { status: res.status, message: body.message };
  } catch (err) {
    dbError = { status: 0, message: err.message };
  }

  if (dbError) {
    console.error('[Shark Event] Registration save error:', dbError);
    btn.disabled = false;
    btn.querySelector('span:first-child').textContent = 'Submit Registration';
    if (dbError.status === 403) {
      btn.disabled = true;
      btn.querySelector('span:first-child').textContent = 'Registrations Closed';
      showToast(dbError.message || 'Registration limit reached. Registrations are closed.');
    } else {
      showToast('Failed: ' + (dbError.message || 'Could not save registration.'));
    }
    return;
  }

  const ejs = CONFIG.emailjs;
  const isConfigured = ejs.publicKey && ejs.publicKey !== 'YOUR_PUBLIC_KEY';

  let submitted = false;
  let errorMsg = '';

  if (isConfigured) {
    try {
      emailjs.init({ publicKey: ejs.publicKey });

      // 1️⃣  Confirmation email → registrant
      const r1 = await emailjs.send(ejs.serviceId, ejs.confirmationTemplateId, templateVars);
      console.log('[Shark Event] Confirmation email result:', r1);

      // 2️⃣  Notification email → organiser
      const r2 = await emailjs.send(ejs.serviceId, ejs.notificationTemplateId, templateVars);
      console.log('[Shark Event] Notification email result:', r2);

      submitted = true;
    } catch (err) {
      const nonFatal = isEmailDeliveryNonFatal(err);
      console.error('[Shark Event] EmailJS error:', err);
      errorMsg = err?.text || err?.message || JSON.stringify(err);
      submitted = nonFatal;

      if (nonFatal) {
        console.warn('[Shark Event] Registration saved successfully, but EmailJS delivery was skipped because the recipient/template is not configured correctly.');
      }
    }
  } else {
    console.log('[Shark Event] Demo mode — credentials not set.');
    submitted = true;
  }

  if (submitted) {
    document.getElementById('form-body').style.display = 'none';
    const s = document.getElementById('form-success');
    s.style.display = 'flex';
    showToast(errorMsg ? 'You\'re registered! Email delivery is temporarily unavailable.' : 'You\'re registered! Check your inbox.');
  } else {
    btn.disabled = false;
    btn.querySelector('span:first-child').textContent = 'Submit Registration';
    showToast('Failed: ' + (errorMsg || 'Check browser console for details.'));
  }
});
