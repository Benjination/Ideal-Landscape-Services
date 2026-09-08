# Lead Drop — Recovery Plan

Root cause: `https://ideallandscapeservices.com/` serves a thin "Redirecting…"
stub page (meta-refresh to `/Website/Actual/index.html`) instead of the real
homepage. Google (and anyone sharing/bookmarking the root URL) sees an empty
page with no content. Combined with no `robots.txt`/`sitemap.xml` and no
local-business schema, this explains the collapse in organic/local leads.

## 🔴 Critical — do first (breaks the whole site's SEO)

- [x] Add `robots.txt` (`Website/Actual/robots.txt`)
- [x] Add `sitemap.xml` (`Website/Actual/sitemap.xml`)
- [x] Add `LocalBusiness`/`LandscapingBusiness` JSON-LD schema to homepage
- [x] Add canonical tag to homepage
- [ ] **Fix GitHub Pages so the real site is served at the domain root, not the redirect stub:**
  - Go to `github.com/Benjination/Ideal-Landscape-Services` → **Settings → Pages**
  - Under "Build and deployment", change **Source** from "Deploy from a branch"
    to **"GitHub Actions"** (the `deploy.yml` workflow already publishes
    `Website/Actual` correctly — it's just not the active source yet)
  - Push any commit (or manually run the "Deploy to GitHub Pages" workflow via
    **Actions → Deploy to GitHub Pages → Run workflow**) to trigger a fresh deploy
  - Verify: `curl -I https://ideallandscapeservices.com/` should return the real
    homepage HTML, not "Redirecting…", and `/about/`, `/services/`, `/contact/`
    etc. should resolve directly (no `/Website/Actual/` prefix)
  - ⚠️ Do NOT move `Website/Actual` contents to the repo root as a workaround —
    the repo root also contains private files (client notes, `functions/`
    source, proposal docs) that would become publicly served if Pages
    switches to legacy branch/root mode.
- [ ] Add canonical tags + `robots.txt`/schema coverage to remaining key pages
      (services subpages, about, contact) once homepage fix is verified

## 🟠 High priority — local SEO / lead pipeline

- [ ] Finish Google Business Profile ownership transfer from DRKM to David
      (see `followupQs.txt` → GOOGLE BUSINESS PROFILE — DRKM HANDOVER)
- [ ] Confirm NAP (Name, Address, Phone) consistency between GBP and site
      once David provides the PO Box / public address
- [ ] Submit `sitemap.xml` in Google Search Console; request re-indexing of
      the homepage and top service pages
- [ ] Verify Google Search Console property is still verified/owned after
      the domain/hosting change (ownership verification can break on host swaps)
- [ ] Confirm Google Analytics / GA4 tracking is installed and firing on the
      new site (compare traffic before/after launch date)

## 🟡 Medium priority — content/trust signals

- [ ] Remove "Licensed" language if present anywhere (business is insured, not licensed)
- [ ] Confirm "47 years" copy is applied site-wide (not old "35+")
- [ ] Add alt text to all images per `SEO.txt` folder-by-folder guide
- [ ] Add unique meta title/description per page per `SEO.txt` drafts
- [ ] Verify contact form actually delivers leads:
      - [ ] Firebase "Trigger Email from Firestore" extension configured with
            David & Kathy's Gmail App Password (see `needs-from-client.txt`)
      - [ ] Send a test submission end-to-end and confirm email arrives
- [ ] Confirm DNS (GoDaddy) still points to GitHub Pages correctly and MX
      records were not touched (Gmail must stay independent of hosting)

## 🟢 Verify after fixes are live

- [ ] `curl -I https://ideallandscapeservices.com/` → 200, real homepage content
- [ ] `https://ideallandscapeservices.com/robots.txt` → 200
- [ ] `https://ideallandscapeservices.com/sitemap.xml` → 200
- [ ] Google Search Console: no crawl errors, sitemap processed
- [ ] Submit a real test lead through the contact form and confirm email delivery
- [ ] Monitor lead volume for 1–2 weeks post-fix
