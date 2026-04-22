// providerLogin v10 - fixed app ID [1776826785]
import { createClientFromRequest, createClient } from "npm:@base44/sdk@0.8.25";
const srStatic = createClient({ appId: '69d062aca815ce8e697894b1' }).asServiceRole;

async function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

async function withRetry<T>(fn: () => Promise<T>, label = "op", maxAttempts = 4): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (e: unknown) {
      lastErr = e;
      const msg = String((e instanceof Error) ? e.message : e);
      const isRetryable = msg.includes("403") || msg.includes("429") || msg.includes("auth_required") || msg.includes("private");
      if (isRetryable && attempt < maxAttempts) {
        const delay = attempt * 500;
        console.log(`[providerLogin] ${label} attempt ${attempt} failed (${msg.slice(0,60)}), retrying in ${delay}ms`);
        await sleep(delay);
      } else { throw e; }
    }
  }
  throw lastErr;
}


const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

async function sha256(s: string): Promise<string> {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(b)).map((x: number) => x.toString(16).padStart(2, "0")).join("");
}

function sanitize(p: Record<string, unknown>): Record<string, unknown> {
  const safe = { ...p };
  delete safe.login_password;
  delete safe.notes;
  delete safe.stripe_customer_id;
  delete safe.stripe_subscription_id;
  return safe;
}

function isValidDbId(id: string): boolean {
  return typeof id === 'string' && /^[0-9a-f]{24}$/.test(id);
}
function filterValidIds(ids: unknown): string[] {
  if (!Array.isArray(ids)) return [];
  return ids.filter((id: unknown) => isValidDbId(String(id))) as string[];
}
function getInvalidIds(ids: unknown): string[] {
  if (!Array.isArray(ids)) return [];
  return ids.filter((id: unknown) => !isValidDbId(String(id))).map(String);
}

function sanitizeProviderFields(fields: Record<string, unknown>): { safe: Record<string, unknown> | null; errMsg: string | null } {
  const safe = { ...fields };
  if ('services' in safe) {
    const inv = getInvalidIds(safe.services);
    if (inv.length > 0) return { safe: null, errMsg: `Invalid service IDs: ${inv.join(', ')}` };
    safe.services = filterValidIds(safe.services);
  }
  if ('service_areas' in safe) {
    const inv = getInvalidIds(safe.service_areas);
    if (inv.length > 0) return { safe: null, errMsg: `Invalid village IDs: ${inv.join(', ')}` };
    safe.service_areas = filterValidIds(safe.service_areas);
  }
  return { safe, errMsg: null };
}

const VALID_PINS = ["1357"];
const ADMIN_EMAILS = ["kimberlycook1980@gmail.com", "5bebegurlz@gmail.com"];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: CORS });

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: CORS });
  }

  try {
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    const action = (body.action as string || "").trim();

    // ── LOOKUP DATA (categories, services, areas) ─────────────────────────
    if (body.get_lookup_data === true) {
      try {
        const [cats, svcs, areas] = await Promise.all([
          withRetry(() => srStatic.entities.Category.list({ limit: 200 }), "cats"),
          withRetry(() => srStatic.entities.Service.list({ limit: 500 }), "svcs"),
          withRetry(() => srStatic.entities.ServiceArea.list({ limit: 500 }), "areas"),
        ]);
        console.log(`[providerLogin] lookup: cats=${(cats||[]).length} svcs=${(svcs||[]).length} areas=${(areas||[]).length}`);
        return new Response(JSON.stringify({ ok: true, categories: cats||[], services: svcs||[], areas: areas||[] }), { headers: CORS });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return new Response(JSON.stringify({ ok: false, error: msg, categories: [], services: [], areas: [] }), { headers: CORS });
      }
    }

    // ── SESSION RESTORE ──────────────────────────────────────────────────
    if (action === "restore" || body.restore_id) {
      const id = (body.restore_id as string || "").trim();
      let p: Record<string, unknown> | null = null;
      try { p = await withRetry(() => sr.entities.Provider.get(id), "restore"); } catch { p = null; }
      if (p && p.id) return new Response(JSON.stringify({ success: true, provider: sanitize(p) }), { headers: CORS });
      return new Response(JSON.stringify({ error: "Session expired" }), { status: 401, headers: CORS });
    }

    // ── SAVE PASSWORD (force change on first login) ───────────────────────
    if (action === "save_password") {
      const provider_id = (body.provider_id as string || "").trim();
      const vh_number   = (body.vh_number   as string || "").trim();
      const new_password = (body.new_password as string || "").trim();
      if (!provider_id || !vh_number || !new_password) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: CORS });
      }
      if (new_password.length < 6) {
        return new Response(JSON.stringify({ error: "Password must be at least 6 characters" }), { status: 400, headers: CORS });
      }
      const existing = await withRetry(() => sr.entities.Provider.get(provider_id), "save-pw-get");
      if (!existing) return new Response(JSON.stringify({ error: "Provider not found" }), { status: 404, headers: CORS });
      if (existing.vh_number !== vh_number) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: CORS });
      }
      const hashed = await sha256(new_password);
      const updated = await withRetry(() => sr.entities.Provider.update(provider_id, { login_password: hashed, password_changed: true, managed_by: "Self-Managed" }), "save-pw-update");
      return new Response(JSON.stringify({ success: true, provider: sanitize(updated) }), { headers: CORS });
    }

    // ── SAVE LOGIN EMAIL / PASSWORD (account settings page) ──────────────
    if (action === "save_account") {
      const provider_id     = (body.provider_id     as string || "").trim();
      const vh_number       = (body.vh_number       as string || "").trim();
      const new_login_email = (body.new_login_email as string || "").trim().toLowerCase();
      const new_password    = (body.new_password    as string || "").trim();
      if (!provider_id || !vh_number || !new_login_email) {
        return new Response(JSON.stringify({ error: "Missing provider_id, vh_number, or new_login_email" }), { status: 400, headers: CORS });
      }
      const existing = await sr.entities.Provider.get(provider_id);
      if (!existing) return new Response(JSON.stringify({ error: "Provider not found" }), { status: 404, headers: CORS });
      if (existing.vh_number !== vh_number) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: CORS });
      }
      const updates: Record<string, unknown> = { login_email: new_login_email };
      if (new_password && new_password.length >= 6) {
        updates.login_password = await sha256(new_password);
        updates.password_changed = true;
      }
      const updated = await sr.entities.Provider.update(provider_id, updates);
      return new Response(JSON.stringify({ success: true, provider: sanitize(updated) }), { headers: CORS });
    }

    // ── SAVE PROFILE ──────────────────────────────────────────────────────
    if (action === "save_profile") {
      const provider_id = (body.provider_id as string || "").trim();
      const vh_number   = (body.vh_number   as string || "").trim();
      const fields      = body.fields as Record<string, unknown> | undefined;
      if (!provider_id || !vh_number || !fields) return new Response(JSON.stringify({ error: "Missing provider_id, vh_number, or fields" }), { status: 400, headers: CORS });

      const existing = await sr.entities.Provider.get(provider_id);
      if (!existing) return new Response(JSON.stringify({ error: "Provider not found" }), { status: 404, headers: CORS });
      if (existing.vh_number !== vh_number) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: CORS });

      const ALLOWED = ["business_name","owner_name","phone","email","website","description","address","years_in_business","license_number","google_review_url","services","service_areas","is_mobile","hours_of_operation","google_rating"];
      const NUMERIC_FIELDS = ["years_in_business","google_rating"];
      const safe: Record<string, unknown> = {};
      for (const k of ALLOWED) {
        if (k in fields) {
          if (NUMERIC_FIELDS.includes(k)) {
            const v = fields[k];
            // Convert empty string to null; parse strings as numbers
            if (v === "" || v === null || v === undefined) { /* skip empty numeric fields */ }
            else { safe[k] = Number(v); }
          } else {
            safe[k] = fields[k];
          }
        }
      }

      if ('services' in safe) {
        const inv = getInvalidIds(safe.services);
        if (inv.length) return new Response(JSON.stringify({ error: `Invalid service IDs: ${inv.join(', ')}` }), { status: 400, headers: CORS });
        safe.services = filterValidIds(safe.services);
      }
      if ('service_areas' in safe) {
        const inv = getInvalidIds(safe.service_areas);
        if (inv.length) return new Response(JSON.stringify({ error: `Invalid village IDs: ${inv.join(', ')}` }), { status: 400, headers: CORS });
        safe.service_areas = filterValidIds(safe.service_areas);
      }
      if (!Object.keys(safe).length) return new Response(JSON.stringify({ error: "No updatable fields" }), { status: 400, headers: CORS });

      const updated = await sr.entities.Provider.update(provider_id, safe);
      return new Response(JSON.stringify({ success: true, provider: sanitize(updated) }), { headers: CORS });
    }

    // ── ADMIN UPDATE (replaces adminUpdateProvider) ───────────────────────
    if (action === "admin_update") {
      const pinOk = body.pin && VALID_PINS.includes(String(body.pin));
      let isAdmin = false;
      if (!pinOk) {
        try {
          const me = await base44.auth.me();
          if (me?.email && ADMIN_EMAILS.includes((me.email as string).toLowerCase())) isAdmin = true;
        } catch { /* */ }
      }
      if (!pinOk && !isAdmin) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: CORS });

      const id      = body.id     as string | undefined;
      const fields  = body.fields as Record<string, unknown> | undefined;
      const doDelete = body.delete as boolean | undefined;
      const doCreate = body.create as boolean | undefined;

      if (doCreate) {
        const { safe, errMsg } = sanitizeProviderFields((fields || {}) as Record<string, unknown>);
        if (errMsg) return new Response(JSON.stringify({ error: errMsg }), { status: 400, headers: CORS });
        const r = await sr.entities.Provider.create(safe!);
        return new Response(JSON.stringify({ success: true, record: r }), { headers: CORS });
      }
      if (!id) return new Response(JSON.stringify({ error: "Missing id" }), { status: 400, headers: CORS });
      if (doDelete) {
        await sr.entities.Provider.delete(id);
        return new Response(JSON.stringify({ success: true }), { headers: CORS });
      }
      if (fields) {
        const { safe, errMsg } = sanitizeProviderFields(fields);
        if (errMsg) return new Response(JSON.stringify({ error: errMsg }), { status: 400, headers: CORS });
        const r = await sr.entities.Provider.update(id, safe!);
        return new Response(JSON.stringify({ success: true, record: r }), { headers: CORS });
      }
      return new Response(JSON.stringify({ error: "No action specified" }), { status: 400, headers: CORS });
    }

    // ── NORMAL LOGIN ──────────────────────────────────────────────────────
    const identifier = ((body.identifier as string) || "").trim();
    const password   = (body.password   as string) || "";
    if (!identifier || !password) {
      return new Response(JSON.stringify({ error: "Missing identifier or password" }), { status: 400, headers: CORS });
    }

    const isVH = /^VH-/i.test(identifier);
    let rows: Record<string, unknown>[] = [];
    if (isVH) {
      const vhNorm = identifier.toUpperCase().replace(/^VH(\d)/, "VH-$1");
      rows = (await withRetry(() => sr.entities.Provider.filter({ vh_number: vhNorm }), "login-vh")) || [];
    } else {
      const em = identifier.toLowerCase();
      const a = (await withRetry(() => sr.entities.Provider.filter({ login_email: em }), "login-email-a")) || [];
      const b = (await withRetry(() => sr.entities.Provider.filter({ email: em }), "login-email-b"))       || [];
      const seen = new Set<string>();
      for (const p of [...a, ...b]) {
        const pid = p.id as string;
        if (!seen.has(pid)) { seen.add(pid); rows.push(p); }
      }
    }

    if (!rows.length) return new Response(JSON.stringify({ error: "No account found. Try your email or VH number, or contact admin@v-hub.us" }), { status: 401, headers: CORS });

    const hashed = await sha256(password);
    const match = rows.find(p => {
      const s = ((p.login_password as string) || "").trim();
      return s && (s === password || s === hashed);
    });

    if (!match) {
      if (rows.some(p => !p.login_password) && rows.length === 1) {
        return new Response(JSON.stringify({ error: "No password set. Use 'Forgot your password?' to set one up." }), { status: 401, headers: CORS });
      }
      return new Response(JSON.stringify({ error: "Incorrect password. Please try again." }), { status: 401, headers: CORS });
    }

    return new Response(JSON.stringify({ success: true, provider: sanitize(match) }), { headers: CORS });

  } catch (e: unknown) {
    console.error("providerLogin error:", e instanceof Error ? e.message : e);
    return new Response(JSON.stringify({ error: "Server error. Please try again." }), { status: 500, headers: CORS });
  }
});
