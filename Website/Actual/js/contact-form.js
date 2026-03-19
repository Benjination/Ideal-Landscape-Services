/* ═══════════════════════════════════════════════════════════════
   Contact Form → Firebase Firestore
   Loaded as <script type="module"> on contact/index.html only.
   Path is relative to THIS file (js/), not the HTML page.
   ═══════════════════════════════════════════════════════════════ */

import { db } from "./firebase-init.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

const form     = document.getElementById("contact-form");
const statusEl = document.getElementById("form-status");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Re-check native HTML5 validation
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled    = true;
    submitBtn.textContent = "Sending…";

    // Collect checked project types
    const projectTypes = Array.from(
      form.querySelectorAll('input[name="project_type"]:checked')
    ).map(cb => cb.value);

    const payload = {
      name:         sanitize(form.elements["name"].value),
      phone:        sanitize(form.elements["phone"].value),
      email:        sanitize(form.elements["email"].value),
      address:      sanitize(form.elements["address"].value),
      city:         sanitize(form.elements["city"].value),
      zip:          sanitize(form.elements["zip"].value),
      comment:      sanitize(form.elements["comment"].value),
      projectTypes,
      neighborhood: sanitize(form.elements["neighborhood"]?.value ?? ""),
      heardAbout:   form.elements["heard_about"]?.value  ?? "",
      timeline:     form.elements["timeline"]?.value     ?? "",
      submittedAt:  serverTimestamp(),
      source:       "website-contact-form"
    };

    try {
      await addDoc(collection(db, "contact-submissions"), payload);
      form.reset();
      showStatus("Thanks! We'll reach out within one business day.", "success");
      submitBtn.textContent = "Message Sent ✓";
    } catch (err) {
      console.error("Contact form error:", err);
      showStatus(
        "Something went wrong. Please call us at 817-457-7507.",
        "error"
      );
      submitBtn.disabled    = false;
      submitBtn.textContent = "Send Message";
    }
  });
}

function sanitize(val) {
  return String(val ?? "").trim().slice(0, 2000);
}

function showStatus(msg, type) {
  if (!statusEl) return;
  statusEl.textContent  = msg;
  statusEl.className    = "form-status " + type;
  statusEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
