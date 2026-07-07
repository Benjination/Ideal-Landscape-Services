# Launch Plan (Old Website -> New Website)

This is the simple go-live checklist to use with the customer.

## 1) Pre-Launch (Do this first)

1. Confirm launch date/time with customer (prefer low-traffic time).
2. Ask customer who controls DNS (GoDaddy, Cloudflare, Squarespace, etc.).
3. Ask customer for current hosting login (in case rollback is needed).
4. Lower DNS TTL for current domain records to `300` (5 minutes) at least a few hours before launch.

## 2) Point Domain to New Site (GitHub Pages)

Use this only if the domain should point to this GitHub Pages deployment.

1. In GitHub repo settings, go to **Settings -> Pages**.
2. Set source to **GitHub Actions**.
3. In **Custom domain**, enter the customer domain (example: `ideallandscapeservices.com`).
4. Save and enable **Enforce HTTPS** (after certificate is ready).

DNS records to set at the DNS provider:

1. Root/apex domain (`@`) A records:
   - `185.199.108.153`
   - `185.199.109.153`
   - `185.199.110.153`
   - `185.199.111.153`
2. `www` CNAME:
   - `benjination.github.io`

If using Cloudflare:

1. Set records to **DNS only** (grey cloud) until SSL is active.
2. After SSL works, you can re-enable proxy if desired.

## 3) Firebase Access + Admin Setup

1. In Firebase Console, add customer as a project member (minimum: Editor; preferred: custom role later).
2. Confirm customer can log in to Firebase Console.
3. In Firebase Authentication, verify only approved admin users exist.
4. Confirm self-signup is disabled if not needed.
5. Confirm Firestore and Storage rules are published and unchanged from tested version.

## 4) Launch Validation (10-minute check)

1. Open domain in normal and private/incognito window.
2. Check home page, About, Services, Projects, Blog, Contact.
3. Submit a contact form test and confirm email notification arrives.
4. Confirm admin page login works.
5. Check mobile quickly (iPhone + Android view sizes).
6. Check HTTPS lock icon and no mixed-content warnings.

## 5) Rollback Plan (If anything breaks)

1. Revert DNS records back to old host.
2. Wait for propagation (TTL controls speed).
3. Keep old host active for at least 72 hours after launch.

## 6) Customer Handoff Items

1. Send customer:
   - Site URL
   - Firebase project URL
   - Admin login URL
   - List of who has access
2. Confirm customer has 2FA enabled on GitHub and Firebase accounts.
3. Schedule 1-week post-launch review.

---

## Quick Customer Script

"We are switching your domain to the new site by updating DNS. There may be short propagation time, but downtime should be minimal. We will verify forms, admin access, and mobile pages right after cutover. If anything unexpected happens, we can immediately revert DNS to the old host."
