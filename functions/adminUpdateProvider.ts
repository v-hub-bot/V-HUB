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
    const sr = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const { id, fields, delete: doDelete, create: doCreate } = body;

    if (doCreate) {
      const record = await sr.entities.Provider.create(fields);
      return Response.json({ success: true, record }, { headers: CORS_HEADERS });
    }

    if (!id) {
      return Response.json({ error: 'Missing id' }, { status: 400, headers: CORS_HEADERS });
    }

    if (doDelete) {
      await sr.entities.Provider.delete(id);
      return Response.json({ success: true }, { headers: CORS_HEADERS });
    }

    if (fields) {
      const record = await sr.entities.Provider.update(id, fields);
      return Response.json({ success: true, record }, { headers: CORS_HEADERS });
    }

    return Response.json({ error: 'No action specified' }, { status: 400, headers: CORS_HEADERS });
  } catch (error) {
    console.error('adminUpdateProvider error:', error);
    return Response.json({ error: error.message }, { status: 500, headers: CORS_HEADERS });
  }
});
