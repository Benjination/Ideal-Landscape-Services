/* ═══════════════════════════════════════════════════════════════
   Ideal Landscape Services — Shared JavaScript
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Navbar: scroll glass + promo-bar slide ──────────────────── */
  const navbar  = document.getElementById('navbar');
  const PROMO_H = 40;

  function updateNav() {
    const y = window.scrollY;
    if (navbar) {
      navbar.style.top = Math.max(0, PROMO_H - y) + 'px';
      navbar.classList.toggle('scrolled', y > 20);
    }
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* ── Hamburger / mobile drawer ───────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const drawer    = document.getElementById('mobile-drawer');

  if (hamburger && drawer) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      drawer.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    drawer.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        drawer.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── Scroll-triggered entry animations ──────────────────────── */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) {
        target.classList.add('visible');
        observer.unobserve(target);
      }
    });
  }, { threshold: 0.10 });

  document.querySelectorAll('.animate-in').forEach(el => observer.observe(el));

  /* ── Payment page: method selector ──────────────────────────── */
  document.querySelectorAll('.pay-method').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pay-method').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      const radio = btn.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  /* ── Payment page: live total display ───────────────────────── */
  const amountInput  = document.getElementById('pay-amount');
  const totalDisplay = document.getElementById('pay-total-display');
  if (amountInput && totalDisplay) {
    amountInput.addEventListener('input', () => {
      const val = parseFloat(amountInput.value);
      totalDisplay.textContent = isNaN(val) ? '$0.00' : '$' + val.toFixed(2);
    });
  }

  /* ── Gallery / Projects: filter + keyword search ─────────────── */
  const galleryItems = document.querySelectorAll('.gallery-item[data-keywords]');
  const filterBtns   = document.querySelectorAll('.filter-btn[data-filter]');
  const searchInput  = document.getElementById('gallery-search');
  const noResults    = document.getElementById('no-results');

  function filterGallery() {
    if (!galleryItems.length) return;

    const activeFilter = document.querySelector('.filter-btn.active');
    const category = activeFilter ? activeFilter.dataset.filter : 'all';
    const rawQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';

    let visible = 0;
    galleryItems.forEach(item => {
      const keywords = (item.dataset.keywords || '').toLowerCase();
      const cat      = (item.dataset.category || '').toLowerCase();

      const matchCat = category === 'all' || cat === category;
      const matchQ   = !rawQuery || keywords.includes(rawQuery);

      const show = matchCat && matchQ;
      item.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    if (noResults) noResults.style.display = visible === 0 ? '' : 'none';
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterGallery();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', filterGallery);
    searchInput.closest('form') && searchInput.closest('form').addEventListener('submit', e => {
      e.preventDefault();
      filterGallery();
    });
  }

  /* ── Before / After slider ───────────────────────────────────── */
  const baContainers = document.querySelectorAll('.ba-container');
  baContainers.forEach(container => {
    const after   = container.querySelector('.ba-after');
    const divider = container.querySelector('.ba-divider');
    const handle  = container.querySelector('.ba-handle');
    if (!after) return;

    let dragging = false;

    function setPos(x) {
      const rect    = container.getBoundingClientRect();
      const pct     = Math.min(100, Math.max(0, ((x - rect.left) / rect.width) * 100));
      after.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
      if (divider) divider.style.left = pct + '%';
      if (handle)  handle.style.left  = pct + '%';
    }

    container.addEventListener('mousedown',  e => { dragging = true; setPos(e.clientX); e.preventDefault(); });
    window.addEventListener('mouseup',       ()  => { dragging = false; });
    window.addEventListener('mousemove',     e  => { if (dragging) setPos(e.clientX); });
    container.addEventListener('touchstart', e  => { dragging = true; setPos(e.touches[0].clientX); }, { passive: true });
    window.addEventListener('touchend',      ()  => { dragging = false; });
    window.addEventListener('touchmove',     e  => { if (dragging) setPos(e.touches[0].clientX); }, { passive: true });
  });

})();
