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
- [x] **Fix GitHub Pages so the real site is served at the domain root, not the redirect stub:**
      Source switched to "GitHub Actions", deploy ran successfully, verified live —
      root serves real homepage, `/about/` resolves directly, no `/Website/Actual/` prefix.
- [x] Add canonical tags to remaining key pages (services subpages, about,
      contact, projects, gallery, blog, plants, privacy)

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
      → **No GA4 found on site.** David to create a free GA4 property
        (analytics.google.com → Admin → Create Property → Web stream →
        copy Measurement ID) and send the `G-XXXXXXXXXX` ID; will wire in
        the tracking snippet site-wide once received.

## 🟡 Medium priority — content/trust signals

- [x] Remove "Licensed" language if present anywhere (business is insured, not licensed)
- [x] Confirm "47 years" copy is applied site-wide (not old "35+")
- [ ] Add alt text to all images per `SEO.txt` folder-by-folder guide
- [ ] Add unique meta title/description per page per `SEO.txt` drafts
- [ ] Verify contact form actually delivers leads:
      - [x] Firebase "Trigger Email from Firestore" extension confirmed
            installed and ACTIVE (`firestore-send-email`, last configured
            2026-03-29) via `firebase ext:list`
      - [ ] Send a test submission through the live `/contact/` form, then
            check the `mail` collection doc's `delivery.state` in Firestore
            (SUCCESS/ERROR) and confirm David/Kathy actually receive it
            (check spam folder too)
- [ ] Confirm DNS (GoDaddy) still points to GitHub Pages correctly and MX
      records were not touched (Gmail must stay independent of hosting)

## 🟢 Verify after fixes are live

- [x] `curl -I https://ideallandscapeservices.com/` → 200, real homepage content
- [x] `https://ideallandscapeservices.com/robots.txt` → 200
- [x] `https://ideallandscapeservices.com/sitemap.xml` → 200
- [ ] Google Search Console: no crawl errors, sitemap processed
- [ ] Submit a real test lead through the contact form and confirm email delivery
- [ ] Monitor lead volume for 1–2 weeks post-fix
