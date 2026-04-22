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

If publishing seems to "work" but the live bundle never updates, check mini_apps.json first.

## CDN cache busting (the catch-22):
- The only way to bust the CDN cache on www.v-hub.us is to publish via the Base44 builder
- But doing so wipes the custom code
- **Procedure when CDN bust is needed:**
  1. Kimberly publishes from builder (busts CDN)
  2. Immediately tells me "it's messed up"
  3. I restore from latest checkpoint and republish — takes under 60 seconds
  4. Done

## Checkpoint files (CURRENT GOLDEN STATE — Apr 22 2026 ~adfix):
```
pages/Home.jsx.checkpoint_apr22_0400
pages/ProviderDashboard.jsx.checkpoint_apr22_adfix   ← LATEST (editable village/address in ad builder)
pages/Wekcadmin.jsx.checkpoint_apr22_0400
pages/ListService.jsx.checkpoint_apr22_0400
pages/Classifieds.jsx.checkpoint_apr22_0400
```

To restore ProviderDashboard to latest:
```bash
cp pages/ProviderDashboard.jsx.checkpoint_apr22_adfix pages/ProviderDashboard.jsx
```

To restore everything else:
```bash
cp pages/Home.jsx.checkpoint_apr22_0400 pages/Home.jsx
cp pages/Wekcadmin.jsx.checkpoint_apr22_0400 pages/Wekcadmin.jsx
cp pages/ListService.jsx.checkpoint_apr22_0400 pages/ListService.jsx
cp pages/Classifieds.jsx.checkpoint_apr22_0400 pages/Classifieds.jsx
```
Then run `manage_app(publish)`.

## Older checkpoints (kept for reference):
- `*.checkpoint_apr22_0400` — golden state Apr 22 morning
- `*.checkpoint_apr20_2326` — pre-GA4, pre-dropdown-fix
- `*.golden_apr21` — golden state from April 21
