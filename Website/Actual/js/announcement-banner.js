/* ═══════════════════════════════════════════════════════════════
   Announcement Banner — homepage only
   Listens to siteConfig/banner in Firestore in real time.
   If active: true, renders a bottom-pinned ticker strip.
   Dismissed state is stored in sessionStorage so it stays gone
   for the rest of the visitor's tab session.
   ═══════════════════════════════════════════════════════════════ */

import { db }                    from './firebase-init.js';
import { doc, onSnapshot }       from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js';

const DISMISS_KEY = 'ils_banner_dismissed';

function initBanner() {
  const banner  = document.getElementById('announcement-banner');
  const track   = document.getElementById('banner-text');
  const dismiss = document.getElementById('banner-dismiss');
  if (!banner || !track || !dismiss) return;

  // Wire up the dismiss button once
  dismiss.addEventListener('click', () => {
    banner.classList.remove('visible');
    document.body.classList.remove('banner-open');
    sessionStorage.setItem(DISMISS_KEY, '1');
  });

  // Real-time listener — reacts the moment the admin saves
  onSnapshot(doc(db, 'siteConfig', 'banner'), (snap) => {
    // If visitor already dismissed this session, leave it hidden
    if (sessionStorage.getItem(DISMISS_KEY)) return;

    if (!snap.exists()) {
      hideBanner(banner);
      return;
    }

    const { active, message } = snap.data();

    if (!active || !message || !message.trim()) {
      hideBanner(banner);
      return;
    }

    // Build the duplicated ticker text for a seamless CSS loop
    const msg = message.trim();
    track.innerHTML = `<span>${msg}</span>`.repeat(8);

    // Slide in (small delay on first load so page paint settles)
    if (!banner.classList.contains('visible')) {
      setTimeout(() => {
        banner.classList.add('visible');
        document.body.classList.add('banner-open');
      }, 800);
    }
  }, (err) => {
    console.warn('Announcement banner error:', err.message);
  });
}

function hideBanner(banner) {
  banner.classList.remove('visible');
  document.body.classList.remove('banner-open');
}

initBanner();

