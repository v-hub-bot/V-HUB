# V-HUB Publishing Protocol

## RULE: Never use the Base44 visual builder to publish

When Kimberly publishes from the Base44 visual builder, it **wipes all custom page code** and replaces it with a simplified template version. This breaks the entire app.

## The correct workflow:
1. All code changes are made by the agent (me) only
2. All publishing is done by the agent via `manage_app(publish)`
3. **Never** touch the builder publish button

## CDN cache busting (the catch-22):
- The only way to bust the CDN cache on www.v-hub.us is to publish via the Base44 builder
- But doing so wipes the custom code
- **Procedure when CDN bust is needed:**
  1. Kimberly publishes from builder (busts CDN)
  2. Immediately tells me "it's messed up"
  3. I restore from checkpoint and republish — takes under 60 seconds
  4. Done

## Checkpoint files:
All pages are saved with `.checkpoint_apr20_2326` suffix. To restore:
```
cp pages/Home.jsx.checkpoint_apr20_2326 pages/Home.jsx
cp pages/ProviderDashboard.jsx.checkpoint_apr20_2326 pages/ProviderDashboard.jsx
cp pages/Wekcadmin.jsx.checkpoint_apr20_2326 pages/Wekcadmin.jsx
cp pages/ListService.jsx.checkpoint_apr20_2326 pages/ListService.jsx
cp pages/Classifieds.jsx.checkpoint_apr20_2326 pages/Classifieds.jsx
```
Then run `manage_app(publish)`.
