import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    // Use service role to allow unauthenticated provider submissions
    const base44 = createClientFromRequest(req);

    const body = await req.json().catch(() => ({}));

    const {
      business_name,
      owner_name,
      phone,
      email,
      website,
      address,
      description,
      years_in_business,
      license_number,
      services,
      service_areas,
      provider_id,
    } = body;

    // Validate required fields
    if (!business_name || !owner_name || !phone || !email) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Use asServiceRole to bypass RLS for unauthenticated submissions
    const record = await base44.asServiceRole.entities.Provider.create({
      business_name,
      owner_name,
      phone,
      email,
      website:           website || "",
      address:           address || "",
      description:       description || "",
      years_in_business: years_in_business ? Number(years_in_business) : 0,
      license_number:    license_number || "",
      services:          services || [],
      service_areas:     service_areas || [],
      provider_id,
      subscription_status: "pending",
      is_visible: false,
    });

    return Response.json({ ok: true, id: record.id, provider_id });
  } catch (error) {
    console.error("submitListing error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
