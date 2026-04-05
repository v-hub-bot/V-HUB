import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Try fetching all providers as service role (bypasses auth/RLS)
    let providers = [];
    try {
      providers = await base44.asServiceRole.entities.Provider.list();
    } catch(e1) {
      try {
        providers = await base44.entities.Provider.list();
      } catch(e2) {
        return Response.json({ error: `Both failed: ${e1.message} | ${e2.message}` }, { status: 500 });
      }
    }
    return Response.json({ providers: providers || [], count: (providers || []).length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
