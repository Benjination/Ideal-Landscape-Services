/* ═══════════════════════════════════════════════════════════════
   plants-nav.js — Show the Plants nav link only when the feature
   is marked live in Firestore (siteConfig/plants.live === true).
   Loaded as a module on every public page except plants/index.html.
   ═══════════════════════════════════════════════════════════════ */

import { db } from './firebase-init.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js';

getDoc(doc(db, 'siteConfig', 'plants')).then(snap => {
  if (snap.exists() && snap.data().live === true) {
    document.querySelectorAll('.plants-nav-link').forEach(el => {
      el.classList.remove('plants-nav-link');
    });
  }
}).catch(() => {});
