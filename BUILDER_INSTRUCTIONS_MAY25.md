# V-HUB Builder Instructions — May 25, 2026

## What Changed
Vendor analytics panel added to the Admin Dashboard Vendors tab.

---

## Where to Look

**GitHub Repo:** https://github.com/v-hub-bot/V-HUB  
**Branch:** `main`  
**Commit:** `57c3533` — "Add vendor analytics panel to admin dashboard — May 25 2026"

---

## The ONE File That Changed

### `pages/Wekcadmin.jsx`

This is the admin dashboard. The change is entirely inside the `VendorsTab()` function (starts around line 2161).

**What was added:**
1. New state variables at the top of `VendorsTab()`:
   - `verifiedCount`, `CAT_COLORS`, `catCounts`, `maxCatCount`
   - `withEmail`, `withPhone`, `withWebsite`, `withFacebook`, `selfSignup`
   - `const [showAnalytics, setShowAnalytics] = useState(false);`

2. A **"📊 Show Analytics" toggle button** — renders between the stats strip and the search filters

3. An **analytics panel** that shows when toggled open:
   - **Quick Stats row** — Total / Live / Pending / Self-Signups / Verified
   - **Category Breakdown** — horizontal bar chart, 5 categories, color coded
   - **Contact Info Coverage** — Email / Phone / Website / Facebook as % with progress bars

---

## How to Deploy

1. Pull the latest `pages/Wekcadmin.jsx` from GitHub (`main` branch)
2. Replace the existing `Wekcadmin.jsx` in the app with this file
3. Publish the app

---

## ALL Current Page Line Counts (for verification)

| File | Lines |
|------|-------|
| Home.jsx | 2060 |
| ProviderDashboard.jsx | 3048 |
| Wekcadmin.jsx | **2446** |
| ListService.jsx | 1245 |
| Classifieds.jsx | 203 |
| VendorSignup.jsx | 140 |

---

## DO NOT touch these — they are correct and working:
- `Home.jsx` — Vendors collapsible button is live and correct
- `VendorSignup.jsx` — uses `submitVendor` backend function (NOT SDK)
- `ProviderDashboard.jsx`, `ListService.jsx`, `Classifieds.jsx` — no changes

---

## Backend Functions (already deployed — no changes needed)
- `submitVendor` — handles public vendor applications
- `submitLead` — handles contact form leads
- `trackEvent` — analytics tracking
- `getProviders` — public provider search
