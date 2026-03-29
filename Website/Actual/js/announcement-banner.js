/* ═══════════════════════════════════════════════════════════════
   Announcement Banner — homepage only
   Reads siteConfig/banner from Firestore.
   If active: true, renders a bottom-pinned ticker strip.
   Dismissed state is stored in sessionStorage so it stays gone
   for the rest of the visitor's tab session.
   ═══════════════════════════════════════════════════════════════ */

import { db }                    from './firebase-init.js';
import { doc, getDoc }           from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js';

const DISMISS_KEY = 'ils_banner_dismissed';

async function initBanner() {
  // Don't show if visitor already dismissed this session
  if (sessionStorage.getItem(DISMISS_KEY)) return;

  try {
    const snap = await getDoc(doc(db, 'siteConfig', 'banner'));
    if (!snap.exists()) return;

    const { active, message } = snap.data();
    if (!active || !message) return;

    const banner  = document.getElementById('announcement-banner');
    const track   = document.getElementById('banner-text');
    const dismiss = document.getElementById('banner-dismiss');
    if (!banner || !track || !dismiss) return;

    // Duplicate message so CSS scroll loop is seamless (two identical halves)
    const msg = message.trim();
    track.innerHTML =
      `<span>${msg}</span>`.repeat(8);

    // Slide in after a short delay
    requestAnimationFrame(() => {
      setTimeout(() => {
        banner.classList.add('visible');
        document.body.classList.add('banner-open');
      }, 800);
    });

    dismiss.addEventListener('click', () => {
      banner.classList.remove('visible');
      document.body.classList.remove('banner-open');
      sessionStorage.setItem(DISMISS_KEY, '1');
    });

  } catch (err) {
    // Silently fail — a missing banner should never break the page
    console.warn('Announcement banner could not load:', err.message);
  }
}

initBanner();
