// vendorLogin — authenticates a market vendor by email or VM number + password
import { createClientFromRequest } from "npm:@base44/sdk@0.8.23";

Deno.serve(async (req: Request): Promise<Response> => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

  try {
    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return new Response(JSON.stringify({ error: "Email/VM number and password are required" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" }
      });
    }

    const client = createClientFromRequest(req);
    const vendors = await client.asServiceRole.entities.MarketVendor.list();

    const idLower = identifier.toLowerCase().trim();

    const vendor = vendors.find((v: any) => {
      const emailMatch = (v.login_email || v.email || "").toLowerCase() === idLower;
      const vmMatch = (v.vendor_id || "").toLowerCase() === idLower;
      return emailMatch || vmMatch;
    });

    if (!vendor) {
      return new Response(JSON.stringify({ error: "No vendor account found with that email or VM number" }), {
        status: 404, headers: { ...cors, "Content-Type": "application/json" }
      });
    }

    if (!vendor.login_password) {
      return new Response(JSON.stringify({ error: "No password set for this account. Contact admin@v-hub.us to get access." }), {
        status: 401, headers: { ...cors, "Content-Type": "application/json" }
      });
    }

    if (vendor.login_password !== password) {
      return new Response(JSON.stringify({ error: "Incorrect password" }), {
        status: 401, headers: { ...cors, "Content-Type": "application/json" }
      });
    }

    // Return vendor data (exclude password)
    const { login_password, ...safeVendor } = vendor;

    return new Response(JSON.stringify({ success: true, vendor: safeVendor }), {
      status: 200, headers: { ...cors, "Content-Type": "application/json" }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Server error" }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" }
    });
  }
});
