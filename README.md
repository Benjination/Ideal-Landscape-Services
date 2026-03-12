# Ideal Landscape Services — Website Rebuild Project

> **Status:** Pre-build · Mockup live on GitHub Pages · Awaiting client approval to begin `Actual/`

[![Deploy to GitHub Pages](https://github.com/Benjination/Ideal-Landscape-Services/actions/workflows/deploy.yml/badge.svg)](https://github.com/Benjination/Ideal-Landscape-Services/actions/workflows/deploy.yml)

---

## Overview

Full website rebuild for **Ideal Landscape Services** — a family-owned DFW landscaping company operating since 1990. The new site targets a **photography-first, editorial-style aesthetic** (inspired by Miracle Farms Landscaping and Worx Landscape) with strong local SEO, minimal copy, and high visual impact.

The existing site (built on WPEngine + WordPress) is being replaced entirely with a **custom Next.js + Firebase** build. This repository contains all research, planning documents, scraped assets, and the working mockup.

---

## Live Preview

> **[View the Mockup →](https://benjination.github.io/Ideal-Landscape-Services/)**

The preview is the homepage mockup — a static HTML/CSS/JS file built to demonstrate the visual direction to the client before any real development begins.

---

## Repository Structure

```
Ideal-Landscape-Services/
│
├── index.html                   ← Root redirect — points to active version
│                                  (change "Mockup" → "Actual" to flip live)
│
├── Website/
│   ├── Mockup/
│   │   └── index.html           ← Static homepage mockup (current live preview)
│   └── Actual/                  ← Empty — real build goes here
│
├── images/                      ← 159 curated images scraped from original site
│   ├── water-features/          23 images — ponds, waterfalls, pottery features
│   ├── outdoor-living/          12 images — pergolas, gazebos, patios, fire pits
│   ├── landscaping/             20 images — plants, lawns, seasonal color
│   ├── hardscapes/               8 images — flagstone, retaining walls, concrete
│   ├── lighting/                 5 images — landscape and decorative lighting
│   ├── maintenance/             13 images — drainage, irrigation, trimming
│   ├── projects/                30 images — named project sets (see below)
│   ├── team-branding/           23 images — logo variants, staff, awards, banners
│   └── misc/                    25 images — Facebook exports, phone shots (unclassified)
│
├── blogs/                       ← 8 scraped blog posts from original site
│   ├── 2015-03-20_mulch-too-mulch.txt
│   ├── 2015-04-13_what-is-scalping-anyway.txt
│   ├── 2017-03-28_xeriscape-design-tips-texas.txt
│   ├── 2017-04-26_texas-landscaping-ideas.txt
│   ├── 2017-06-22_summertime-lawn-maintenance-tips.txt
│   ├── 2017-09-01_water-fountain-functionality.txt
│   ├── 2018-07-17_how-to-maintain-your-lawn-during-a-drought.txt
│   └── 2018-10-15_3-tips-for-irrigating-your-homes-foundation.txt
│
├── site-content/                ← Scraped page copy from original site
│   ├── homepage.txt
│   ├── about.txt
│   ├── contact-info.txt
│   ├── faq.txt
│   ├── testimonials.txt
│   └── services/                ← Individual service page copy
│
├── LaTex/                       ← Client-facing proposal documents (compile with pdflatex)
│   ├── proposal.tex             ← Original proposal — both options presented, custom build selected
│   └── followupCustom.tex       ← Discovery Q&A form for the custom Next.js + Firebase build
│
├── thePlan.txt                  ← Master build plan — page structure, section specs
├── aesthetic.txt                ← Full design specification — tokens, components, rules
├── SEO.txt                      ← Complete SEO strategy — all 11 sections
├── followupQs.txt               ← Running list of open questions for the client
├── websites.txt                 ← Reference site analyses (Miracle Farms, Worx, etc.)
├── structure.txt                ← Technical architecture notes (Next.js + Firebase)
│
└── .github/
    └── workflows/
        └── deploy.yml           ← GitHub Actions — deploys to GitHub Pages on push to main
```

---

## The 11-Page Site Plan

| # | Page | Description |
|---|------|-------------|
| 1 | **Homepage** | Primary conversion page — hero, services grid, portfolio preview, process steps, reviews, service area, contact form |
| 2 | **Landscape Design & Plants** | Service subpage — full-width hero, 2–3 sentence description, bulleted services, photo gallery, CTA |
| 3 | **Water Features** | Service subpage — ponds, waterfalls, pottery features, pondless systems |
| 4 | **Hardscapes & Patios** | Service subpage — flagstone, stamped concrete, retaining walls, planter boxes |
| 5 | **Outdoor Living & Pergolas** | Service subpage — pergolas, gazebos, fire pits, outdoor kitchens |
| 6 | **Landscape Lighting** | Service subpage — decorative and security lighting, seasonal installs |
| 7 | **Maintenance & Irrigation** | Service subpage — lawn care, drainage, French drains, irrigation systems |
| 8 | **Projects / Portfolio** | Named project card grid → individual photo gallery pages |
| 9 | **About** | Team story, staff cards (David, Kathy, Ericka), credentials, awards |
| 10 | **Blog** | Card grid of posts — managed via CMS; primary long-tail SEO asset |
| 11 | **Contact** | Full contact form, phone/email/hours, Google Maps embed |

---

## Mockup — Homepage Sections

The `Website/Mockup/index.html` is a single-file, zero-dependency homepage mockup demonstrating the full visual hierarchy:

| Section | Description |
|---------|-------------|
| **Promo Bar** | Fixed accent-green strip — phone number as live `tel:` link |
| **Navbar** | Transparent → frosted glass on scroll, mobile hamburger drawer |
| **Hero** | 100vh full-bleed photo, bottom-weighted gradient, animated text entry |
| **Trust Strip** | 4 stats — 35+ Years · 500+ Projects · 4.9★ · Licensed & Insured |
| **Services Grid** | 6 photo tiles with real images — hover scale + overlay |
| **Portfolio** | 3 named project cards on dark background, frosted glass labels |
| **Process Steps** | 6-step row with connecting line — responsive to 3×2 on tablet |
| **Why Us** | 3-column dark section — Licensed, Family-Owned, Award-Winning |
| **Credentials** | TNLA + Home & Garden Show Awards — grayscale → color on hover |
| **Reviews** | 4.9★ summary + 3 Google review cards |
| **Service Area** | Grayscale Google Maps embed + 12 DFW city links |
| **Contact Form** | Name · Email/Phone · Service dropdown · Message — sharp 0px radius |
| **CTA Banner** | Full-bleed photo strip — "Get a Free Estimate" |
| **Footer** | 4-column — brand, navigation, services, contact + social icons |

**Tech:** Pure HTML + CSS + vanilla JavaScript. No npm, no build step, no dependencies. Opens by double-click in any browser. CSS custom properties map directly to the design tokens in `aesthetic.txt` for a clean handoff to the real build.

---

## Design Specification

Full aesthetic spec lives in `aesthetic.txt`. Key tokens:

| Token | Value | Usage |
|-------|-------|-------|
| `--black` | `#0D0D0D` | Background for dark sections, navbar |
| `--white` | `#FFFFFF` | Primary background, card surfaces |
| `--off-white` | `#F7F7F5` | Alternate section backgrounds |
| `--accent` | `#3C6E47` | CTAs, highlights, promo bar |
| `--gray-500` | `#767676` | Body copy, subheadings |
| Font | Plus Jakarta Sans | 400/500/600/700/800 |
| Border radius | `0px` (inputs, tiles) · `2px` (buttons) | Sharp, architectural |
| Animations | `700ms ease-out` · `IntersectionObserver` at 12% | Scroll-triggered reveals |

**Design direction:** Photography-first editorial. Every section is led by an image. The copy supports the photo — never the other way around. No carousels, no sidebar widgets, no decorative gradients. Black, white, and one accent green. That's it.

---

## Image Library

159 curated images organized into 9 thematic folders. All images were scraped from the original site and renamed descriptively.

### Named Project Sets (`images/projects/`)

| Set | Files | Status |
|-----|-------|--------|
| `ashley/` | 4 shots | ⏳ Needs name & location from David |
| `clifford/` | 2 shots | ⏳ Needs name & location from David |
| `Hardy/` | 2 shots | ⏳ Needs name & location from David |
| `JOE-TS/` | 2 shots | ⏳ Needs name & location from David |
| `P-series/` | 12 shots | ⏳ Likely one or more projects — unidentified |
| `AR-series/` | 2 shots | ⏳ Unknown project |
| `8609.jpg` | 1 shot | ⏳ Unknown origin |

### Misc Folder (`images/misc/`)

Contains ~25 images with two distinct origin patterns:
- **Facebook-export photos** — filenames like `10497451_874980929191822_...` (numeric Facebook post IDs). These are almost certainly job-site shots shared on the company's Facebook page circa 2014–2015.
- **Phone-dated shots** — filenames like `20170320_105522...` (Android camera timestamps, 2017). Likely job-site documentation.
- **Two Pexels stock photos** — `pexels-photo-126271.jpeg` and `pexels-photo-1224277-1.jpeg`. These were auto-inserted by Elementor's built-in Pexels integration and were not intentionally placed by the client or designer.

> **Pending:** David needs to confirm whether the Facebook/phone-dated shots are before/after or progress photos. If yes, these become a high-impact "Transformations" section on the homepage.

---

## Documents

### `thePlan.txt`
Master build plan. Covers homepage section-by-section spec, all 6 service subpage templates, portfolio page layout, about page, blog setup, and contact page. Includes image-to-page mapping for every service category.

### `aesthetic.txt`
Full design specification — 19 component specs, all CSS custom properties, photography direction, animation behavior, typography scale, spacing system, and a "what this site is not" section. Written as a handoff document for any developer or designer who works on the real build.

### `SEO.txt`
Complete SEO strategy across 11 sections — keyword targets, on-page structure, local SEO (service area pages), Google Business Profile, schema markup (FAQPage, LocalBusiness, Service), Core Web Vitals, and image SEO. No keyword stuffing strategy — all SEO is achieved through structure and clean photography-forward content.

### `followupQs.txt`
Running list of open client questions across 7 categories: Domain & Email, Hosting, Design & Content, Features & Functionality, Scope & Timeline, Image Library, and Video Content. Questions are marked `[ ]` (open) or `[ANSWERED]`.

### `websites.txt`
Full analysis of reference websites reviewed during planning — includes Miracle Farms Landscaping (design inspiration), Worx Landscape (structure and conversion optimization reference), and the original ideallandscapeservices.com (full breakdown of current structure, complexity assessment, and rebuild notes).

### `LaTex/` — Client Documents

Two LaTeX documents compiled to PDF for client delivery:

| File | Purpose |
|------|---------|
| `proposal.tex` | Original proposal — both options were presented; client selected the custom build |
| `followupCustom.tex` | Discovery Q&A form for the custom Next.js + Firebase build |

To compile: `pdflatex proposal.tex` (requires a LaTeX distribution — MacTeX on macOS).

---

## Build

**Stack:** Next.js · React · Firebase (Hosting + Firestore + Storage + Auth) · GitHub Actions CI/CD  
**Scope:** Full 11-page site + client admin panel (blog editor, testimonials, gallery upload)  
**Estimate:** $1,800 – $2,500

---

## Deployment

The repo deploys automatically to GitHub Pages on every push to `main`.

**Workflow:** `.github/workflows/deploy.yml`  
Uses `actions/checkout@v4` · `actions/configure-pages@v5` · `actions/upload-pages-artifact@v3` · `actions/deploy-pages@v4`

**To switch from Mockup to Actual when ready:**  
Edit one line in `index.html` at the root:
```html
<!-- Change this: -->
<meta http-equiv="refresh" content="0; url=Website/Mockup/">

<!-- To this: -->
<meta http-equiv="refresh" content="0; url=Website/Actual/">
```
Commit and push. The live URL switches instantly.

---

## Contact

**Client:** Ideal Landscape Services  
**Phone:** [817-457-7507](tel:+18174577507)  
**Facebook:** [facebook.com/IdealLandscapeServices](https://www.facebook.com/IdealLandscapeServices)  
**Instagram:** [instagram.com/ideallandscapeservices](https://www.instagram.com/ideallandscapeservices/)
