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

  /* ── Lightbox ────────────────────────────────────────────────── */
  (function () {
    /* Build overlay */
    const overlay = document.createElement('div');
    overlay.id = 'lb-overlay';
    overlay.innerHTML =
      '<button class="lb-close" aria-label="Close">\u00d7</button>' +
      '<button class="lb-prev"  aria-label="Previous">&#8592;</button>' +
      '<div class="lb-stage"><img class="lb-img" src="" alt=""></div>' +
      '<button class="lb-next"  aria-label="Next">&#8594;</button>' +
      '<div class="lb-footer"><span class="lb-caption"></span><span class="lb-counter"></span></div>';
    document.body.appendChild(overlay);

    const imgEl   = overlay.querySelector('.lb-img');
    const caption = overlay.querySelector('.lb-caption');
    const counter = overlay.querySelector('.lb-counter');
    const prevBtn = overlay.querySelector('.lb-prev');
    const nextBtn = overlay.querySelector('.lb-next');
    const stageEl = overlay.querySelector('.lb-stage');
    let group = [];
    let idx   = 0;

    function openAt(images, i) {
      group = images;
      idx   = i;
      renderImg();
      overlay.classList.add('lb-open');
      document.body.style.overflow = 'hidden';
    }

    function close() {
      overlay.classList.remove('lb-open');
      document.body.style.overflow = '';
      setTimeout(function () { if (!overlay.classList.contains('lb-open')) imgEl.src = ''; }, 300);
    }

    function renderImg() {
      var item = group[idx];
      imgEl.classList.add('lb-loading');
      var tmp = new Image();
      tmp.onload = function () {
        imgEl.src = tmp.src;
        imgEl.alt = item.alt || '';
        imgEl.classList.remove('lb-loading');
      };
      tmp.onerror = function () { imgEl.src = item.src; imgEl.classList.remove('lb-loading'); };
      tmp.src = item.src;
      caption.textContent = item.alt || '';
      counter.textContent = group.length > 1 ? (idx + 1) + ' / ' + group.length : '';
      prevBtn.classList.toggle('lb-nav-hidden', idx === 0);
      nextBtn.classList.toggle('lb-nav-hidden', idx === group.length - 1);
    }

    function prev() { if (idx > 0) { idx--; renderImg(); } }
    function next() { if (idx < group.length - 1) { idx++; renderImg(); } }

    prevBtn.addEventListener('click', function (e) { e.stopPropagation(); prev(); });
    nextBtn.addEventListener('click', function (e) { e.stopPropagation(); next(); });
    overlay.querySelector('.lb-close').addEventListener('click', close);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay || e.target === stageEl) close();
    });
    document.addEventListener('keydown', function (e) {
      if (!overlay.classList.contains('lb-open')) return;
      if (e.key === 'Escape')     close();
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
    });

    /* Touch swipe */
    var touchStartX = null;
    overlay.addEventListener('touchstart', function (e) { touchStartX = e.touches[0].clientX; }, { passive: true });
    overlay.addEventListener('touchend',   function (e) {
      if (touchStartX === null) return;
      var dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); }
      touchStartX = null;
    });

    /* Expand hint SVG */
    var hintSVG =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>' +
      '<line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>';

    /* Wire a set of img elements as a lightbox group */
    function wireGroup(selector) {
      var items = Array.prototype.slice.call(document.querySelectorAll(selector));
      if (!items.length) return;
      var imageData = items.map(function (el) { return { src: el.src, alt: el.alt || '' }; });
      items.forEach(function (img, i) {
        /* Wrap in .lb-wrap if not already wrapped */
        if (!img.parentElement.classList.contains('lb-wrap')) {
          var wrap = document.createElement('div');
          wrap.className = 'lb-wrap';
          img.parentNode.insertBefore(wrap, img);
          wrap.appendChild(img);
          var hint = document.createElement('div');
          hint.className = 'lb-hint';
          hint.innerHTML = hintSVG;
          wrap.appendChild(hint);
        }
        img.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          openAt(imageData, i);
        });
      });
    }

    /* Wire gallery-item images (projects page) — click on item or img */
    function wireGalleryItems() {
      var items = Array.prototype.slice.call(document.querySelectorAll('.gallery-item'));
      if (!items.length) return;
      var imageData = items.map(function (el) {
        var img = el.querySelector('img');
        return img ? { src: img.src, alt: img.alt || '' } : null;
      }).filter(Boolean);
      items.forEach(function (item, i) {
        item.addEventListener('click', function (e) {
          e.preventDefault();
          openAt(imageData, i);
        });
      });
    }

    wireGroup('.service-gallery-item');
    wireGroup('.team-photo');
    wireGroup('.about-photo');
    wireGalleryItems();
  }());

})();
