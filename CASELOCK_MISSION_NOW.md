# 🔐 CaseLock Agent — Mission Brief (May 6, 2026)
*Paste this entire message into the CaseLock Superagent chat*

---

Hey CaseLock — I'm V, V-HUB's agent. Your founder asked me to help get you connected to your app the right way. Here's exactly what you need to do, step by step.

---

## Your Two App IDs (CRITICAL — know the difference)

| What | ID | URL |
|------|----|-----|
| **Builder/Editor** (NOT for deploying) | `69fa19c9c021dd284f3b27ec` | app.base44.com/... |
| **Your LIVE deployed app** ✅ | `69fadf7165aa737b1697a094` | case-lock-copy-1697a094.base44.app |

The copy app (`69fadf7165aa737b1697a094`) is your real home. Everything deploys there.

---

## Step 1 — Check your mini_apps.json

Run this in your sandbox:
```
read_file(".agents/mini_apps.json")
```

It should contain:
```json
{
  "app_id": "69fadf7165aa737b1697a094",
  "slug": "case-lock-copy-1697a094"
}
```

If it doesn't match exactly — update it with `write_file` right now. This is how you publish.

---

## Step 2 — Deploy your backend functions

Your functions (`analyzeDocument`, `caseAgent`, etc.) need to be deployed using `deploy_backend_function`. They deploy to YOUR app context automatically — you don't need to specify an app ID.

For each function:
1. Write the code to `functions/<name>.ts` using `write_file`
2. Call `deploy_backend_function` with the function name and code
3. Call `test_backend_function` to verify it responds

**SDK rule (CRITICAL):** Always use `npm:@base44/sdk@0.8.23` — NOT 0.8.24 or 0.8.25, those break entity reads.

**Auth pattern to use in every function:**
```typescript
import { createClientFromRequest } from "npm:@base44/sdk@0.8.23";
const client = createClientFromRequest(req);
const sr = client.asServiceRole; // use this for entity access
```

---

## Step 3 — Point your frontend to the right app

Your frontend API calls should hit:
```
https://api.base44.app/api/apps/69fadf7165aa737b1697a094/functions/<functionName>
```

Check your `src/api/base44Client.js` or similar — make sure the app ID in there is `69fadf7165aa737b1697a094`, not the builder ID.

---

## Step 4 — Publish after any frontend change

Use the `manage_app` skill to publish:
```
run_skill("manage_app", "publish")
```

**⚠️ NEVER press the Publish button in the Base44 visual builder.** It wipes all custom code. Only publish from your agent sandbox.

---

## Step 5 — Save your state to memory

Update your `memory.md` (use `update_identity` tool, NOT `write_file`) with:
- Both app IDs and what they do
- The live URL: `https://case-lock-copy-1697a094.base44.app`
- The publishing rule
- Each function name once deployed

---

## Your Entities (already exist in app `69fadf7165aa737b1697a094`)

- `LoanContract` — the uploaded contract data + AI analysis
- `Payment` — individual payment records

Use `read_entities("LoanContract")` to verify data access is working.

---

## About the URL situation

The original `case-lock.base44.app` is a visual builder app — it can't receive your code deploys. For now, **use `case-lock-copy-1697a094.base44.app` as your live URL.** It works, it's real, and it's yours. The URL is just cosmetic — ship the app first, pretty URL later.

If you want the original URL reassigned, email support@base44.com: *"Can the slug `case-lock` be reassigned from builder app `69fa19c9c021dd284f3b27ec` to platform app `69fadf7165aa737b1697a094`?"*

---

## Quick sanity check — run these right now:

1. `read_file(".agents/mini_apps.json")` — verify app ID
2. `read_entities("LoanContract")` — verify data access
3. `bash("curl -s -o /dev/null -w '%{http_code}' https://case-lock-copy-1697a094.base44.app")` — verify live URL returns 200

If all three pass, you're connected. Then start deploying functions one at a time.

---

You've got everything you need. The platform works the same as it does for me. Lock in, stay systematic, test after every deploy. 🔐

— V (V-HUB's Agent)
