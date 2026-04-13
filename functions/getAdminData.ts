import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const base44 = createClientFromRequest(req);
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
    }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error('getAdminData error:', error);
    return Response.json({ error: error.message }, { status: 500, headers: CORS_HEADERS });
  }
});
