# 🔧 V-HUB Builder Instructions — May 25, 2026
## READ THIS FIRST BEFORE TOUCHING ANYTHING

This file was written by the V-HUB Superagent. It tells you exactly what pages to pull from the **v-hub-bot/V-HUB** GitHub repository, what changes were made, and how to publish correctly so the CDN picks up the new code.

---

## THE APP YOU ARE WORKING ON

- **Base44 Mini App ID:** `69d06ada8019d7e9edf7f8e8`
- **Slug:** `v-hub-app-edf7f8e8`
- **Live URL:** https://v-hub-app-edf7f8e8.base44.app
- **Custom domain:** https://www.v-hub.us
- **GitHub Repo:** https://github.com/v-hub-bot/V-HUB
- **Default branch:** `main`

> ⚠️ CRITICAL: Do NOT work on app ID `69d062aca815ce8e697894b1` — that is the Superagent builder/editor, NOT the mini app.

---

## WHAT CHANGED (May 25, 2026)

Three new things were added today. All code is already saved to the database via `manage_app publish`. The CDN bundle just needs to be rebuilt via a Publish action in the builder UI.

### 1. `pages/Home.jsx` — Hometown Market Vendors section
- Added `MarketVendor` to the entity imports (line 5)
- Added `VENDOR_CAT_EMOJI` constant and `VENDOR_CATEGORIES` array
- Added `VendorMarketSection` React component (renders vendor grid with category filters, search, and tap-to-detail modal)
- Inserted `<VendorMarketSection />` block **between** the green Classifieds search box and the Ronnie Clark photo
- This section shows 136 market vendors organized into 5 categories, with a "🛒 Are you a vendor? List your booth →" CTA button linking to `/VendorSignup`

### 2. `pages/VendorSignup.jsx` — NEW PAGE (brand new file)
- A public-facing vendor application form at `/VendorSignup`
- Fields: Business name, category (dropdown), description, email, phone, website, Facebook URL
- On submit: creates a `MarketVendor` record with `is_active: false` (pending review)
- Shows a success screen with the applicant's email address
- Back to homepage link

### 3. `pages/Wekcadmin.jsx` — Vendors tab in admin dashboard
- Added `MarketVendor` to entity imports
- Added `"Vendors"` to the `TABS` array (between Analytics and Add Provider)
- Added `VENDOR_CAT_EMOJI_ADMIN` constant
- Added `VendorsTab` React component with:
  - Stats strip: Total, Active, Pending counts
  - Search + Category + Status filters
  - Vendor rows with Approve/Hide toggle, Edit modal, Delete button
  - Edit modal with all vendor fields (name, category, description, email, phone, website, facebook_url, logo_url, notes)
- Tab renders as: `{tab === "Vendors" && <VendorsTab />}`

### 4. `src/App.jsx` — New route added
```jsx
import VendorSignup from './pages/VendorSignup';
// ...
<Route path="/VendorSignup" element={<VendorSignup />} />
```

---

## FILES TO PULL FROM GITHUB

Pull these exact files from the `main` branch of `https://github.com/v-hub-bot/V-HUB`:

| File | Path in repo | Notes |
|------|-------------|-------|
| Home.jsx | `pages/Home.jsx` | Has VendorMarketSection added |
| Wekcadmin.jsx | `pages/Wekcadmin.jsx` | Has VendorsTab added |
| VendorSignup.jsx | `pages/VendorSignup.jsx` | NEW — vendor application form |
| App.jsx | `src/App.jsx` | Has VendorSignup route added |

The following pages are **unchanged** — do not touch them:
- ProviderDashboard.jsx
- ListService.jsx
- Classifieds.jsx
- Terms.jsx
- Privacy.jsx

---

## HOW TO PUBLISH CORRECTLY

1. Pull the 4 files listed above from GitHub into the app pages
2. Make sure `VendorSignup` is registered as a page in the app
3. Click **Publish** in the builder UI
4. This will rebuild the CDN bundle and make everything live
5. The live URL is https://www.v-hub.us

> ⚠️ After you publish, the Superagent will verify the live site and may immediately restore from checkpoint if anything looks wrong. That's normal — do not re-publish after the agent republishes.

---

## ENTITY SCHEMA (already exists, no action needed)

The `MarketVendor` entity is **already created** in the database with 136 records. Schema:

```json
{
  "name": "string",
  "category": "string",
  "description": "string",
  "email": "string",
  "phone": "string",
  "website": "string",
  "facebook_url": "string",
  "logo_url": "string",
  "location": "string",
  "schedule": "string",
  "is_active": "boolean",
  "is_verified": "boolean",
  "vendor_id": "string",
  "login_email": "string",
  "login_password": "string",
  "notes": "string"
}
```

---

## CHECKPOINT REFERENCE

The latest golden checkpoint is `checkpoint_may25_vendors`. If you need to restore manually:
```bash
cp pages/Home.jsx.checkpoint_may25_vendors pages/Home.jsx
cp pages/ProviderDashboard.jsx.checkpoint_may25_vendors pages/ProviderDashboard.jsx
cp pages/Wekcadmin.jsx.checkpoint_may25_vendors pages/Wekcadmin.jsx
cp pages/ListService.jsx.checkpoint_may25_vendors pages/ListService.jsx
cp pages/Classifieds.jsx.checkpoint_may25_vendors pages/Classifieds.jsx
cp pages/VendorSignup.jsx.checkpoint_may25_vendors pages/VendorSignup.jsx
```

---

## CONTACT / OWNERSHIP

- **Owner:** Kimberly Cook (kimberlycook1980@gmail.com)
- **Co-admin:** William Evans (evansrus@comcast.net)
- **All system emails from:** admin@v-hub.us (SendGrid)
- **Brand colors:** #E8431A (orange-red), #00BFA5 (teal), ocean blue

---

*Written by V-HUB Superagent · 2026-05-25*
