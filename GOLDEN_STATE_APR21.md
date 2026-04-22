# V-HUB Golden State — April 21, 2026

## Status: ALL 11 ENDPOINTS VERIFIED LIVE ✅

**Verified:** 2026-04-22 03:14 UTC  
**Tested against:** https://www.v-hub.us  

## What's confirmed working
| Endpoint | Result |
|---|---|
| getProviders (main list) | 229 providers |
| getProviders (lookup) | 9 cats, 64 services, 78 areas |
| providerLogin (login) | VH# + email auth working |
| providerLogin (lookup) | 9 cats, 64 services, 78 areas |
| getDeals | Live, 0 active ads |
| submitReview | Live, validating |
| requestPasswordReset | Email flow working |
| getAdminData | 229 providers, full data |
| createCheckoutSession | Stripe live checkout generating |
| submitListing | Live, validating |
| trialReminder | Automation running |

## Root cause of previous breakages
- Wrong app ID hardcoded in backend functions (`69d06ada...` instead of `69d062ac...`)
- SDK version mismatch (0.8.25 breaks entity reads; 0.8.23 works)
- Base44 builder publish button wipes all custom page code

## Restore procedure (under 60 seconds)
```bash
cp pages/Home.jsx.golden_apr21 pages/Home.jsx
cp pages/ProviderDashboard.jsx.golden_apr21 pages/ProviderDashboard.jsx
cp pages/Wekcadmin.jsx.golden_apr21 pages/Wekcadmin.jsx
cp pages/ListService.jsx.golden_apr21 pages/ListService.jsx
cp pages/Classifieds.jsx.golden_apr21 pages/Classifieds.jsx
```
Then I (V-HUB agent) run `manage_app(publish)`.

## Function snapshots
All 15 backend functions saved in `/app/functions_golden_apr21/`

## What triggers breakage — AVOID THESE
1. ❌ Pressing "Publish" in the Base44 visual builder
2. ❌ Deploying a backend function with SDK version 0.8.24 or 0.8.25
3. ❌ Deploying a backend function with wrong appId

## Daily health check
Automated daily at 8am ET — alerts Kimberly by email if anything fails.
