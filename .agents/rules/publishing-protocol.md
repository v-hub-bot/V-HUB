# V-HUB Publishing Protocol

## RULE: Never use the Base44 visual builder to publish

When Kimberly publishes from the Base44 visual builder, it **wipes all custom page code** and replaces it with a simplified template version. This breaks the entire app.

## The correct workflow:
1. All code changes are made by the agent (me) only
2. All publishing is done by the agent via `manage_app(publish)`
3. **Never** touch the builder publish button

## CRITICAL: mini_apps.json must point to the correct app ID

The file `.agents/mini_apps.json` MUST have:
```json
{
  "app_id": "69d06ada8019d7e9edf7f8e8",
  "slug": "v-hub-app-edf7f8e8"
}
```

**NOT** `69d062aca815ce8e697894b1` — that is the Base44 builder/editor, not the mini app.

## CDN cache busting (the catch-22):
- The only way to bust the CDN cache on www.v-hub.us is to publish via the Base44 builder
- But doing so wipes the custom code
- **Procedure when CDN bust is needed:**
  1. Kimberly publishes from builder (busts CDN)
  2. Immediately tells me "it's messed up"
  3. I restore from `checkpoint_may25_vendors2` (latest) and republish — takes under 60 seconds
  4. Done

---

## ✅ CURRENT GOLDEN CHECKPOINT — May 25 2026 ~5:10pm ET
### Name: `checkpoint_may25_vendors2`

### To restore ALL pages from this checkpoint:
```bash
cp pages/Home.jsx.checkpoint_may25_vendors2 pages/Home.jsx
cp pages/ProviderDashboard.jsx.checkpoint_may25_vendors2 pages/ProviderDashboard.jsx
cp pages/Wekcadmin.jsx.checkpoint_may25_vendors2 pages/Wekcadmin.jsx
cp pages/ListService.jsx.checkpoint_may25_vendors2 pages/ListService.jsx
cp pages/Classifieds.jsx.checkpoint_may25_vendors2 pages/Classifieds.jsx
cp pages/VendorSignup.jsx.checkpoint_may25_vendors2 pages/VendorSignup.jsx
```
Then run `manage_app(publish)`.

### What's in this checkpoint:
- ✅ **Vendors button** — collapsible on homepage (between Find Services and Ronnie Clark photo), matches Find Services style, no "Hometown" branding
- ✅ **VendorSignup page** — `/VendorSignup` public application form, calls `submitVendor` backend function (NOT SDK), saves as pending (is_active: false), emails Kimberly on submit
- ✅ **submitVendor backend function** — deployed and live, handles auth-free public submissions
- ✅ **Vendors tab in admin** — full CRUD: approve, hide, edit, delete vendors
- ✅ **136 vendors** pre-loaded in MarketVendor entity from The Villages Entertainment
- ✅ **Contact Provider Lead Form** — on every provider detail page
- ✅ **submitLead backend function** — deployed and live
- ✅ **All analytics tracking** — village_search, search_performed, featured_banner_click
- ✅ 509 real providers, VH-TEST1 hidden from public
- ✅ 6 active classified ads (Trev's expires June 15, others June 10)
- ✅ CK's Signature Detailing (VH-10089) — trial ends July 4, 2026
- ✅ GitHub repo v-hub-bot/V-HUB synced and current

### Page line counts at this checkpoint:
- Home.jsx: 2060 lines
- ProviderDashboard.jsx: 3048 lines
- Wekcadmin.jsx: 2347 lines
- ListService.jsx: 1245 lines
- Classifieds.jsx: 203 lines
- VendorSignup.jsx: 140 lines

### Live flow test results (May 25 2026 ~5pm ET):
- ✅ submitVendor function → HTTP 200, record saved to DB
- ✅ Missing field validation → Returns proper error
- ✅ Homepage HTTP 200
- ✅ VendorSignup page HTTP 200
- ✅ Admin page HTTP 200
- ✅ submitVendor CORS preflight → 204

---

## ✅ PREVIOUS GOLDEN CHECKPOINT — May 25 2026 ~2:30pm ET
### Name: `checkpoint_may25_vendors`

### To restore ALL pages from this checkpoint:
```bash
cp pages/Home.jsx.checkpoint_may25_vendors pages/Home.jsx
cp pages/ProviderDashboard.jsx.checkpoint_may25_vendors pages/ProviderDashboard.jsx
cp pages/Wekcadmin.jsx.checkpoint_may25_vendors pages/Wekcadmin.jsx
cp pages/ListService.jsx.checkpoint_may25_vendors pages/ListService.jsx
cp pages/Classifieds.jsx.checkpoint_may25_vendors pages/Classifieds.jsx
cp pages/VendorSignup.jsx.checkpoint_may25_vendors pages/VendorSignup.jsx
```
Then run `manage_app(publish)`.

### What's in this checkpoint:
- ✅ Vendors button, VendorSignup page, Vendors admin tab, 136 vendors
- ✅ submitLead, all analytics, 509 providers, 6 classified ads
- ⚠️ VendorSignup used SDK directly (broken for public users — fixed in vendors2)

---

## ✅ OLDER CHECKPOINT — May 20 2026 ~12:30pm ET
### Name: `checkpoint_may20_leads`

### To restore ALL pages from this checkpoint:
```bash
cp pages/Home.jsx.checkpoint_may20_leads pages/Home.jsx
cp pages/ProviderDashboard.jsx.checkpoint_may20_leads pages/ProviderDashboard.jsx
cp pages/Wekcadmin.jsx.checkpoint_may20_leads pages/Wekcadmin.jsx
cp pages/ListService.jsx.checkpoint_may20_leads pages/ListService.jsx
cp pages/Classifieds.jsx.checkpoint_may20_leads pages/Classifieds.jsx
```
Then run `manage_app(publish)`.

---

## ✅ OLDER CHECKPOINT — Apr 22 2026 ~5pm ET
### Name: `checkpoint_apr22_analytics`

### To restore ALL pages from this checkpoint:
```bash
cp pages/Home.jsx.checkpoint_apr22_analytics pages/Home.jsx
cp pages/ProviderDashboard.jsx.checkpoint_apr22_analytics pages/ProviderDashboard.jsx
cp pages/Wekcadmin.jsx.checkpoint_apr22_analytics pages/Wekcadmin.jsx
cp pages/ListService.jsx.checkpoint_apr22_analytics pages/ListService.jsx
cp pages/Classifieds.jsx.checkpoint_apr22_analytics pages/Classifieds.jsx
```
Then run `manage_app(publish)`.

---

## Test account credentials (keep private):
- **VH number:** VH-TEST1
- **Email:** test@v-hub.us
- **Password:** VHub2026!
- **Note:** is_visible = false — does NOT appear in public directory

## Older checkpoints (kept for reference):
- `*.checkpoint_may25_vendors` — May 25 ~2:30pm (pre-submitVendor fix)
- `*.checkpoint_may20_leads` — golden state May 20 (pre-vendors)
- `*.checkpoint_apr22_analytics` — golden state Apr 22 (pre-leads)
- `*.checkpoint_apr22_0400` — golden state Apr 22 morning
- `*.checkpoint_apr22_adfix` — ProviderDashboard with editable village/address in ad builder
- `*.checkpoint_apr20_2326` — pre-GA4, pre-dropdown-fix
- `*.golden_apr21` — golden state from April 21
