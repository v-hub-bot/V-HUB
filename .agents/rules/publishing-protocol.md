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
  3. I restore from `checkpoint_may20_leads` (latest) and republish — takes under 60 seconds
  4. Done

---

## ✅ CURRENT GOLDEN CHECKPOINT — May 20 2026 ~12:30pm ET
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

### What's in this checkpoint:
- ✅ **Contact Provider Lead Form** — on every provider detail page. Collects name, email, phone, message. Saves to LeadInquiry entity + emails provider instantly via SendGrid
- ✅ **submitLead backend function** — deployed and live, tested working
- ✅ **service_name bug fixed** — search_appearance events now correctly record which service was searched
- ✅ **village_search tracking** — fires on every village dropdown selection
- ✅ **search_performed tracking** — fires one site-level event per search with village + service
- ✅ **featured_banner_click tracking** — fires when Weekly Featured banner is clicked
- ✅ 509 real providers, VH-TEST1 hidden from public
- ✅ 5 active classified ads (expire June 10, 2026)
- ✅ CK's Signature Detailing (VH-10089) added — Cody Fogle

### Page line counts at this checkpoint:
- Home.jsx: 1887 lines
- ProviderDashboard.jsx: 3027 lines
- Wekcadmin.jsx: 2154 lines
- ListService.jsx: 1245 lines
- Classifieds.jsx: 203 lines

---

## ✅ PREVIOUS GOLDEN CHECKPOINT — Apr 22 2026 ~5pm ET
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

### What's in this checkpoint:
- Enhanced Analytics tab (engagement totals, 7-day leads chart, top providers, rating distribution)
- VH-TEST1 cleaned up as single internal test account (hidden from public, is_visible: false)
- Bill's Barber (VH-3486 / evansrus@comcast.net) DELETED — was William Evans' test account
- All test reviews, analytics events, and stray data removed
- All live backend flows verified ✅

---

## Test account credentials (keep private):
- **VH number:** VH-TEST1
- **Email:** test@v-hub.us
- **Password:** VHub2026!
- **Note:** is_visible = false — does NOT appear in public directory

## Live flow test results (Apr 22 2026):
- ✅ Login with VH number → SUCCESS
- ✅ Login with email → SUCCESS
- ✅ Wrong password → Correct error returned
- ✅ Public search → real providers, test account hidden
- ✅ Password reset request → Returns ok:true
- ✅ Submit review → SUCCESS
- ✅ Submit lead → SUCCESS (tested May 20 2026)

## Older checkpoints (kept for reference):
- `*.checkpoint_apr22_0400` — golden state Apr 22 morning (pre-analytics)
- `*.checkpoint_apr22_adfix` — ProviderDashboard with editable village/address in ad builder
- `*.checkpoint_apr20_2326` — pre-GA4, pre-dropdown-fix
- `*.golden_apr21` — golden state from April 21
