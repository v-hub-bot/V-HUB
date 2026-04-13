import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const ALLOWED_ORIGIN = "https://v-hub-app-edf7f8e8.base44.app";

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowed = origin === ALLOWED_ORIGIN || origin === "";
  return {
    "Access-Control-Allow-Origin": allowed ? origin || ALLOWED_ORIGIN : "null",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Vary": "Origin",
  };
}

const ADMIN_EMAILS = ["kimberlycook1980@gmail.com", "5bebegurlz@gmail.com", "evansrus@comcast.net"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    const base44 = createClientFromRequest(req);

    // Check for admin PIN in body (for PIN-gate access)
    const body = await req.json().catch(() => ({}));
    const VALID_PINS = ["6185", "1357"];
    const pinProvided = body.pin && VALID_PINS.includes(String(body.pin));

    // Also allow if logged-in user is an admin
    let userIsAdmin = false;
    try {
      const me = await base44.auth.me();
      if (me?.email && ADMIN_EMAILS.includes(me.email.toLowerCase())) {
        userIsAdmin = true;
      }
    } catch (_) {}

    if (!pinProvided && !userIsAdmin) {
      return Response.json({ error: "Unauthorized" }, { status: 401, headers: getCorsHeaders(req) });
    }

    const sr = base44.asServiceRole;

    const [providers, reviews, leads, stats, categories, services, serviceAreas] = await Promise.all([
      sr.entities.Provider.list(),
      sr.entities.ProviderReview.list(),
      sr.entities.LeadInquiry.list(),
      sr.entities.ServiceSearchStat.list(),
      sr.entities.Category.list(),
      sr.entities.Service.list(),
      sr.entities.ServiceArea.list(),
    ]);

    return Response.json({
      providers: providers || [],
      reviews: reviews || [],
      leads: leads || [],
      stats: stats || [],
      categories: categories || [],
      services: services || [],
      serviceAreas: serviceAreas || [],
    }, { headers: getCorsHeaders(req) });
  } catch (error) {
    console.error('getAdminData error:', error);
    return Response.json({ error: error.message }, { status: 500, headers: getCorsHeaders(req) });
  }
});
