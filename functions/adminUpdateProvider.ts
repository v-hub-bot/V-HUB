import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const ALLOWED_ORIGIN = "https://v-hub-app-edf7f8e8.base44.app";

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowed = origin === ALLOWED_ORIGIN || origin === "";
  return {
    "Access-Control-Allow-Origin": allowed ? origin || ALLOWED_ORIGIN : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Vary": "Origin",
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    const base44 = createClientFromRequest(req);

  // Admin PIN validation
  const VALID_PINS = ["6185", "1357"];
  const ADMIN_EMAILS = ["kimberlycook1980@gmail.com", "5bebegurlz@gmail.com", "evansrus@comcast.net"];
  const body = await req.json().catch(() => ({}));
  const pinProvided = body.pin && VALID_PINS.includes(String(body.pin));
  let userIsAdmin = false;
  try {
    const me = await base44.auth.me();
    if (me?.email && ADMIN_EMAILS.includes(me.email.toLowerCase())) userIsAdmin = true;
  } catch (_) {}
  if (!pinProvided && !userIsAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 401, headers: getCorsHeaders(req) });
  }
    const sr = base44.asServiceRole;
    // body already parsed above
    const { id, fields, delete: doDelete, create: doCreate } = body;

    if (doCreate) {
      const record = await sr.entities.Provider.create(fields);
      return Response.json({ success: true, record }, { headers: getCorsHeaders(req) });
    }

    if (!id) {
      return Response.json({ error: 'Missing id' }, { status: 400, headers: getCorsHeaders(req) });
    }

    if (doDelete) {
      await sr.entities.Provider.delete(id);
      return Response.json({ success: true }, { headers: getCorsHeaders(req) });
    }

    if (fields) {
      const record = await sr.entities.Provider.update(id, fields);
      return Response.json({ success: true, record }, { headers: getCorsHeaders(req) });
    }

    return Response.json({ error: 'No action specified' }, { status: 400, headers: getCorsHeaders(req) });
  } catch (error) {
    console.error('adminUpdateProvider error:', error);
    return Response.json({ error: error.message }, { status: 500, headers: getCorsHeaders(req) });
  }
});
