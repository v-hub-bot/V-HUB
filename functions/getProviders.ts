import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Fields that must never be returned in the public provider listing
const SENSITIVE_FIELDS = ['login_email', 'login_password', 'stripe_customer_id', 'stripe_subscription_id', 'notes'];

function sanitize(provider: any) {
  const p = { ...provider };
  for (const field of SENSITIVE_FIELDS) {
    delete p[field];
  }
  return p;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
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
    const sanitized = (providers || []).map(sanitize);
    return Response.json({ providers: sanitized, count: sanitized.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
