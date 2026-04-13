import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
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
    return Response.json({ error: "Unauthorized" }, { status: 401, headers: CORS_HEADERS });
  }
    const sr = base44.asServiceRole;
    // body already parsed above
    const { id, fields, delete: doDelete } = body;

    if (!id) {
      return Response.json({ error: 'Missing id' }, { status: 400, headers: CORS_HEADERS });
    }

    if (doDelete) {
      await sr.entities.ProviderReview.delete(id);
      return Response.json({ success: true }, { headers: CORS_HEADERS });
    }

    if (fields) {
      const record = await sr.entities.ProviderReview.update(id, fields);
      return Response.json({ success: true, record }, { headers: CORS_HEADERS });
    }

    return Response.json({ error: 'No action specified' }, { status: 400, headers: CORS_HEADERS });
  } catch (error) {
    console.error('adminUpdateReview error:', error);
    return Response.json({ error: error.message }, { status: 500, headers: CORS_HEADERS });
  }
});
