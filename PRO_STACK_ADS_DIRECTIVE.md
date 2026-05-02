# PRO-STACK — Classified Ads / "Deal of the Week" System Directive
## Full Blueprint (based on the live V-HUB implementation)

---

## OVERVIEW — What This System Does

Providers can build promotional ad cards ("Deals of the Week") inside their dashboard, preview them exactly as users will see them, then pay a flat fee ($20 suggested — you can change the price) via Stripe to run the ad for 7 days on the public Deals page. No auto-renew. No subscription. One-time payment per run. The ad dies exactly 7 days from payment. Provider can pull it early anytime (no refund). They can also pre-build up to 3 ads in a queue and mark one "Next Up" to launch after the current one expires.

---

## PART 1 — DATABASE ENTITY: `ClassifiedAd`

Create this entity in your app. Every ad (live or queued) is a separate record.

**Fields:**
```
provider_id        string    — links to the Provider entity record (entity ID, not VH#)
provider_name      string    — business name (denormalized for fast display)
village            string    — neighborhood/area name for the ad
address            string    — business address shown on ad
headline           string    — the deal title (e.g. "Save 20% This Week Only!")
body               string    — description / deal details (2-4 sentences)
image_url          string    — CDN URL of the ad image
deal_expires_at    datetime  — exact UTC timestamp when the ad expires (set by webhook)
is_active          boolean   — true = LIVE on site right now; false = queued/draft
is_queued_next     boolean   — true = provider marked this as next to launch
slot_number        integer   — display order (lower = featured; default 99)
ai_prompt          string    — the last prompt used to generate the AI image
saved_images       array     — up to 3 previously generated image URLs (image history)
```

**State logic:**
- `is_active: true` → the ad is live. Only 1 live ad per provider at a time.
- `is_active: false` → queued or draft. Providers can store up to 3.
- `is_queued_next: true` → marked as next to launch (still needs payment).
- `deal_expires_at` is set by the Stripe webhook at the moment payment is confirmed. Never set it manually on the frontend.

---

## PART 2 — PROVIDER ENTITY FIELD ADDITIONS

Add these fields to your `Provider` entity:

```
classifieds_addon                   boolean  — true = provider has an active/live classified ad
classifieds_stripe_subscription_id  string   — stores the Stripe payment_intent or session ID for reference
```

The `classifieds_addon` flag is:
- Set to `true` by the Stripe webhook when payment is confirmed
- Reset to `false` by the nightly rollover function when the ad expires

This flag is what the provider dashboard reads to show "you have an active ad."

---

## PART 3 — STRIPE PRODUCTS TO CREATE

In your Stripe dashboard, create **one product** for classified ads:

```
Product name: "[APP NAME] Deal of the Week Ad"
Price type:   One-time (not recurring)
Amount:       $20.00 (or your chosen price)
Currency:     USD
```

Save the **Price ID** — it will look like `price_1XxxxxXxxx`. You'll need it in the backend function.

Also create the **Stripe Webhook** endpoint pointing to your `stripeWebhook` backend function URL. Subscribe to these events:
- `checkout.session.completed`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.subscription.deleted`
- `customer.subscription.trial_will_end`

---

## PART 4 — BACKEND FUNCTIONS (Server-Side Logic)

You need these backend functions. All run on Deno with the Base44 SDK.

---

### 4A. `createClassifiedsCheckout`

**Purpose:** Creates a Stripe one-time payment checkout session for a $20 ad run. Called when provider clicks "Pay & Go Live."

**Inputs (POST body):**
```json
{
  "provider_record_id": "the entity ID of the provider",
  "provider_email":     "email to send receipt to",
  "provider_name":      "business name",
  "ad_id_to_activate":  "the ClassifiedAd entity ID to activate when paid"
}
```

**What it does:**
1. Creates a Stripe Checkout Session in `payment` mode (not subscription)
2. Passes `ad_id_to_activate` and `provider_record_id` in the session metadata
3. Returns `{ url: "https://checkout.stripe.com/..." }` — frontend redirects there

**Key Stripe session settings:**
```typescript
mode: "payment",
payment_method_types: ["card"],
customer_email: provider_email,
line_items: [{ price: "price_YOUR_CLASSIFIEDS_PRICE_ID", quantity: 1 }],
metadata: {
  type: "classifieds",           // CRITICAL — webhook uses this to route logic
  provider_record_id: "...",
  ad_id_to_activate: "...",
  provider_name: "...",
},
success_url: "https://YOUR_APP_URL/ProviderDashboard?payment=success&acct={provider_id}",
cancel_url:  "https://YOUR_APP_URL/ProviderDashboard?payment=cancelled",
```

**Environment variables needed:**
- `STRIPE_SECRET_KEY` — your Stripe secret key (live or test)

---

### 4B. `stripeWebhook`

**Purpose:** Handles all Stripe lifecycle events. This is the most important function. Must be registered as a Stripe webhook endpoint.

**What it handles:**

#### `checkout.session.completed` where `metadata.type === "classifieds"`

This is the classified ad payment flow:
1. Read `ad_id_to_activate` and `provider_record_id` from session metadata
2. Calculate `deal_expires_at` = exactly 7 days from now (UTC)
3. Update the `ClassifiedAd` record: `{ is_active: true, deal_expires_at: "...", is_queued_next: false }`
4. Update the `Provider` record: `{ classifieds_addon: true, classifieds_stripe_subscription_id: session.id }`
5. Send a confirmation email to the provider via SendGrid (see email template below)

**Critical: Use exact timestamp for expiry:**
```typescript
const expiresAt = new Date();
expiresAt.setDate(expiresAt.getDate() + 7);
const deal_expires_at = expiresAt.toISOString(); // full ISO timestamp, NOT date-only
```

#### `checkout.session.completed` where `metadata.type === "subscription"` (your regular subscription flow)
Handle separately — this is for the base listing subscription, not ads.

**Stripe webhook verification:**
```typescript
const sig = req.headers.get("stripe-signature");
const body = await req.text();
const event = stripe.webhooks.constructEvent(body, sig, Deno.env.get("STRIPE_WEBHOOK_SECRET"));
```

**Environment variables needed:**
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET` — from your Stripe dashboard webhook settings
- `SENDGRID_API_KEY`

---

### 4C. `rolloverClassifiedAds`

**Purpose:** Nightly cleanup. Checks all active ads and deactivates any that have expired.

**What it does:**
1. Fetch all `ClassifiedAd` records where `is_active: true`
2. For each one: if `deal_expires_at` is in the past, set `is_active: false, is_queued_next: false`
3. Also reset `classifieds_addon: false` on the linked Provider record
4. Returns `{ ok: true, deactivated: N, checked: N }`

**Important:** Use exact timestamp comparison (`new Date(ad.deal_expires_at) < new Date()`), not date-only comparison. This ensures the ad runs right up to the millisecond.

**Schedule:** Run this as a CRON automation every night at midnight (or 2 AM).

---

### 4D. `generateAdImage`

**Purpose:** Generates an AI ad image from a text prompt. Called when provider clicks "Generate with AI."

**Inputs (POST body):**
```json
{
  "prompt": "Professional lawn care flyer, green grass, Florida sunshine...",
  "provider_id": "optional — used for logging"
}
```

**What it does:**
1. Calls OpenAI's image generation API (`gpt-image-1` as primary model)
2. Returns the image as a base64 data URI: `{ url: "data:image/png;base64,..." }`
3. The **frontend** is responsible for uploading the base64 to your CDN storage

**Model priority:**
- Try `gpt-image-1` first
- Fallback to `dall-e-3` if that fails
- Return error only if both fail

**Environment variables needed:**
- `OPENAI_API_KEY`

**Important note:** The function returns base64, not a final URL. The frontend converts it and uploads to Base44 storage immediately. This avoids the function needing write access to storage.

---

### 4E. `getDeals`

**Purpose:** Public-facing endpoint that returns all currently live ads for the Deals page. No auth required.

**What it does:**
1. Fetches all `ClassifiedAd` records where `is_active: true`
2. Filters client-side to ensure `deal_expires_at` hasn't passed (exact timestamp check)
3. Sorts by `slot_number` ascending, then alphabetically by provider name
4. Returns enriched records with `_provider_entity_id: ad.provider_id` for deep-linking

**Returns:**
```json
{
  "ads": [
    {
      "id": "...",
      "provider_name": "...",
      "headline": "...",
      "body": "...",
      "image_url": "...",
      "deal_expires_at": "...",
      "village": "...",
      "_provider_entity_id": "..."
    }
  ]
}
```

**Must have CORS headers** — this is called from the public Classifieds page without auth.

---

## PART 5 — PROVIDER DASHBOARD (UI LOGIC)

This is the ad builder that lives inside the Provider Dashboard tab called "Deals of the Week" or similar. Here's everything it needs to do, in order:

### 5A — Initial State (no ad ever)

Show an empty state panel with 3 steps:
- **Step 1** — Build your ad (headline, image, description)
- **Step 2** — Preview it exactly as visitors will see it
- **Step 3** — Pay $20 via Stripe · runs 7 days · no auto-charge

One CTA button: **"Create My First Ad"**

### 5B — Deal Type Picker (Step 1)

When they click "Create My First Ad," show a picker grid with deal type options. Each option pre-fills the headline and AI prompt. Suggested options:

| Option | Emoji | Auto-Headline | Auto-Prompt |
|---|---|---|---|
| Discount / % Off | 💰 | "Save {X}% — This Week Only!" | "Professional promotional flyer, bold percentage discount..." |
| Buy One Get One | 🎁 | "BOGO — Buy One Get One Free!" | "Vibrant BOGO promotional image..." |
| New Customer Special | 👋 | "New Customers: {X}% Off Your First Visit" | "Welcoming new customer discount flyer..." |
| Seasonal Special | 🌴 | "Summer Special — Limited Time!" | "Seasonal Florida summer special..." |
| Bundle / Package Deal | 📦 | "Bundle & Save — Get More for Less!" | "Bundle package deal promotion..." |
| Flash Sale | ⚡ | "FLASH SALE — This Week Only!" | "Urgent flash sale, lightning bolt graphic..." |
| Refer a Friend | 🤝 | "Refer a Friend & You Both Save!" | "Referral program promotion..." |
| Write My Own | ✏️ | (blank) | (blank) |

Picking a type opens the ad editor with those values pre-filled.

### 5C — Ad Editor Form

Fields:
- **Headline** (required) — text input
- **Body / Description** (required) — textarea, 2-4 sentences
- **Village / Location** — text input (for mobile businesses, pull from their service areas)
- **Address** — text input (pre-fill from provider profile)
- **Image** — either:
  - AI Generate: text prompt field → "Generate Image" button → shows result
  - Upload: file picker → immediately uploads to CDN on selection

**Image history:** Store up to 3 previously generated images in `saved_images[]`. Show them as clickable thumbnails so providers can re-use a past image without regenerating.

**AI image flow (exact):**
1. Provider types or edits the prompt
2. Clicks "Generate"
3. Frontend POSTs to `generateAdImage` → gets back `data:image/png;base64,...`
4. Frontend converts base64 → Blob → FormData → POSTs to your CDN upload endpoint
5. Gets back a CDN URL → sets that as the image
6. Updates the `ClassifiedAd` draft record with the new image URL and updates `saved_images`

**CDN upload endpoint:**
```
POST https://api.base44.app/api/apps/YOUR_APP_ID/storage/upload
Body: FormData with file
Returns: { url: "..." }
```

Convert the returned URL to the public CDN format:
```javascript
function toCDNUrl(apiUrl) {
  const match = apiUrl.match(/\/files\/mp\/public\/([^\/]+)\/(.+)$/);
  if (match) return `https://media.base44.com/images/public/${match[1]}/${match[2]}`;
  return apiUrl;
}
```

**Save Draft button:** Saves the record to `ClassifiedAd` with `is_active: false`. No charge. Shows confirmation.

### 5D — Queue Management

After saving, provider sees their queue (max 3 queued ads). Each queued ad shows:
- Thumbnail (56×56 preview)
- Headline
- Body excerpt
- "NEXT UP" badge if marked
- Action buttons: **Preview**, **Edit**, **Mark Next Up / Unmark**, **Delete**

**Mark Next Up** sets `is_queued_next: true` on that record (and removes it from any other). This is purely a label — no payment yet.

### 5E — Live Ad Status Banner

When `is_active: true` ad exists, show a green banner at the top of the section:
```
🟢 Live Now: [Headline]  |  [Preview] [Edit] [Pull Ad]
Runs through [Day, Month Date]
⏭ Queued next: [headline] (if any)
```

**Pull Ad button:** Shows confirmation dialog:  
`"Pull this ad? It will stop showing immediately. No refund is issued — you already paid for the 7-day run."`  
On confirm: sets `is_active: false` on the ClassifiedAd record.

**Edit button on live ad:** Opens the editor pre-filled with the live ad data. Saving does NOT re-publish or charge. It just updates the record (headline/body updates appear live immediately since `getDeals` reads from the DB). For image changes: same CDN upload flow.

### 5F — Payment / Launch

After building the ad, provider clicks **"Pay $20 & Go Live"** button.

Frontend calls `createClassifiedsCheckout` with:
```json
{
  "provider_record_id": "[provider entity ID]",
  "provider_email": "[provider login email]",
  "provider_name": "[business name]",
  "ad_id_to_activate": "[ClassifiedAd entity ID]"
}
```

Gets back `{ url: "..." }` → redirects to Stripe Checkout.

On return from Stripe:
- `?payment=success` → show green success banner: "Your ad is now live! It will run for 7 days."
- `?payment=cancelled` → quietly dismiss (no error needed)

---

## PART 6 — PUBLIC CLASSIFIEDS PAGE (Deals of the Week)

This is the public-facing page that shows all live ads. **No auth required.**

### Display Logic

1. On load: fetch from `getDeals` backend function
2. If no ads: show "No active deals right now. Check back soon!" message
3. If ads exist: render a carousel (one card at a time on mobile, or a grid on desktop)

### Ad Card Structure

Each card has three sections stacked vertically:

**Top — Image (no fixed height crop!):**
- `<img>` with `width: 100%, height: auto, display: block` — NO fixed height, NO objectFit: cover
- This ensures the full image always shows, never cropped
- Rainbow gradient bar at the very top (5px, brand colors)
- "Share ↗" button overlaid top-right (triggers native share sheet or copies link)
- "Expired" badge overlaid if past expiry (admins may see these)

**Middle — Yellow divider:** 3px solid yellow line between image and banner.

**Bottom — Contact banner:**
- Business name (bold navy)
- Headline (italic)
- Expiry date (red, "Expires Month Day")
- "Contact →" button (orange gradient) — opens a bottom-sheet modal

**Bottom sheet modal (Contact):**
- Business name + category
- Deal headline in a yellow callout box
- Body text
- Phone button (green) → `tel:` link
- Website button (navy) → opens in new tab
- "View Full Profile & Reviews" button (parchment) → deep-links to provider profile
- Expiry reminder
- "Close" button at bottom

### Click Tracking

When the "Contact →" button is clicked, fire a tracking event:
```javascript
fetch("/functions/trackEvent", {
  method: "POST",
  body: JSON.stringify({
    provider_id: ad.provider_id,
    event_type: "classified_ad_click",
    source: "classifieds",
  }),
});
```

This feeds into the provider's analytics dashboard.

### Carousel (if multiple ads)

- Show one active card at a time
- Prev/Next arrows on sides
- Dot indicators at bottom
- Auto-advance every 5 seconds (pause on tap)
- Active card = full opacity, yellow border; inactive cards = reduced (if peeking)

---

## PART 7 — EMAIL NOTIFICATIONS (via SendGrid)

Send from your verified sender domain (e.g., `admin@yourapp.com`). Never personal Gmail.

### Email 1: Ad Confirmed (sent by Stripe webhook on payment success)

**Subject:** `[APP NAME] — Your Ad is Live! Expires [Date]`

**Body:**
- Hi [Owner Name],
- Your "[Headline]" ad for [Business Name] is now live on [APP NAME].
- It will run for 7 days, through [Expiry Date].
- View it at: [link to Deals page]
- Log in to your dashboard to manage, edit, or pull your ad.
- Amount paid: $20.00

### Email 2: Ad Expired (optional — send from nightly rollover)

**Subject:** `Your [APP NAME] ad has ended — Ready to run another?`

**Body:**
- Your "[Headline]" ad has finished its 7-day run.
- Log in to your dashboard to launch your next ad.
- CTA: "Launch My Next Ad →"

---

## PART 8 — ANALYTICS INTEGRATION

Track these events in your `ProviderAnalytic` entity (or equivalent analytics table):

| Event | When | Source |
|---|---|---|
| `classified_ad_click` | Contact button clicked on Deals page | "classifieds" |
| `profile_view` | Provider profile opened from ad | "classifieds" |

On the provider's analytics dashboard, show:
- "Ad Clicks" count (filter by `event_type: "classified_ad_click"`)
- Weekly chart showing ad click trend

---

## PART 9 — ADMIN PANEL

Your admin dashboard should have a "Classified Ads" tab that shows:

- All active ads (live right now)
- All queued ads across all providers
- Ability to manually: activate, deactivate, edit, or delete any ad
- Ability to set `slot_number` to feature certain ads (lower number = shown first)
- Ability to reset `classifieds_addon` on a provider

**Manual activation (admin bypass for testing or comps):**
1. Find the ClassifiedAd record
2. Set `is_active: true` + `deal_expires_at` = 7 days from now
3. Set `is_queued_next: false`
4. Update Provider: `classifieds_addon: true`

---

## PART 10 — AUTOMATION (CRON)

Set up one nightly automation:

**Name:** `Daily Classified Ad Rollover`  
**Schedule:** Every day at 2:00 AM (your timezone)  
**What it does:** Calls the `rolloverClassifiedAds` backend function  
**Why:** Deactivates expired ads and resets the `classifieds_addon` flag so the provider UI correctly shows them as "no active ad"

---

## PART 11 — ENVIRONMENT VARIABLES NEEDED

Set these secrets in your app:

```
STRIPE_SECRET_KEY         — from Stripe Dashboard → Developers → API Keys
STRIPE_WEBHOOK_SECRET     — from Stripe Dashboard → Webhooks → your endpoint → Signing Secret
OPENAI_API_KEY            — from platform.openai.com → API Keys
SENDGRID_API_KEY          — from SendGrid → Settings → API Keys
```

---

## PART 12 — EDGE CASES & GOTCHAS

1. **Only 1 live ad per provider at a time.** The webhook should check if they already have an active ad before activating a new one. If so, deactivate the old one first (or reject the payment — your call).

2. **`deal_expires_at` must be a full ISO timestamp, not a date string.** "2026-05-09" will fail — use "2026-05-09T14:30:00.000Z" so exact-timestamp comparison works correctly.

3. **The `getDeals` function must have CORS headers.** It's called from a public page with no auth token.

4. **Image upload uses the mini-app app ID, not the builder app ID.** In Base44, there are two app IDs — one for the builder/editor, one for the deployed mini-app. CDN uploads must go to the deployed app ID's storage endpoint.

5. **`saved_images` max 3.** When adding a new image: `[newUrl, ...existing.filter(u => u !== newUrl)].slice(0, 3)`. This deduplicates and keeps the newest first.

6. **Provider can edit a live ad's text.** Since `getDeals` reads from the DB on every page load, text changes are live immediately. Image changes follow the same CDN upload flow.

7. **"Pull Ad" is non-refundable.** Make this very clear in the UI confirmation dialog. No Stripe refund logic needed.

8. **Trial providers can buy ads.** The classifieds addon is completely independent of the subscription status. A trial provider can pay $20 for an ad while on their free trial.

9. **The `slot_number` field controls featured placement.** If you want to offer "featured" slots (shown first), set `slot_number: 1` for a premium ad. Default/non-featured = 99.

10. **SDK version matters.** In Base44 Deno functions, use `npm:@base44/sdk@0.8.23`. Versions 0.8.24+ have a bug where `.list()` with `{ limit, skip }` via `asServiceRole` returns empty arrays.

---

## SUMMARY — Checklist for Pro-Stack Agent

- [ ] Create `ClassifiedAd` entity with all fields above
- [ ] Add `classifieds_addon` + `classifieds_stripe_subscription_id` to Provider entity
- [ ] Create Stripe one-time product ($20) and save the Price ID
- [ ] Deploy `createClassifiedsCheckout` backend function
- [ ] Deploy `stripeWebhook` backend function (with classifieds routing in `checkout.session.completed`)
- [ ] Deploy `rolloverClassifiedAds` backend function
- [ ] Deploy `generateAdImage` backend function (OpenAI gpt-image-1)
- [ ] Deploy `getDeals` backend function (public, CORS enabled)
- [ ] Register Stripe webhook endpoint pointing to `stripeWebhook` function URL
- [ ] Set all 4 environment variables (Stripe, OpenAI, SendGrid)
- [ ] Build `ClassifiedAdSection` component in Provider Dashboard
- [ ] Build public `Classifieds` / Deals page using `getDeals`
- [ ] Set up nightly CRON automation for `rolloverClassifiedAds`
- [ ] Add analytics tracking on ad card contact clicks
- [ ] Add admin tools to manage/feature ads manually

---
*This document was generated from the live V-HUB classified ads system. All logic described here is battle-tested in production.*
