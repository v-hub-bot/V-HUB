// submitVendor — public vendor application form handler
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
    const { name, category, email, phone, description, website, facebook_url } = body;

    if (!name?.trim() || !category || !email?.trim()) {
      return new Response(JSON.stringify({ error: "Missing required fields: name, category, email" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const db = createClientFromRequest(req).asServiceRole;

    // Count existing vendors to generate VM number
    const existing = await db.entities.MarketVendor.list();
    const nextNum = 1000 + (existing?.length || 0) + 1;
    const vendor_id = `VM-${nextNum}`;

    // Create the vendor record (pending review)
    await db.entities.MarketVendor.create({
      name: name.trim(),
      category,
      email: email.trim(),
      phone: phone || "",
      description: description || "",
      website: website || "",
      facebook_url: facebook_url || "",
      vendor_id,
      is_active: false,
      is_verified: false,
      location: "The Villages, FL",
      schedule: "Every Saturday 9:00 AM – 1:00 PM at Brownwood Paddock Square",
      notes: "Pending admin review — self-signup",
    });

    // Send alert email to Kimberly
    const SENDGRID_KEY = Deno.env.get("SENDGRID_API_KEY") || "";
    if (SENDGRID_KEY) {
      const html = `
        <div style="font-family:Arial,sans-serif;max-width:580px;margin:auto;padding:20px;">
          <h2 style="color:#E8431A;">🛒 New Vendor Application — ${name.trim()}</h2>
          <p>A new vendor has applied to be listed on V-HUB.</p>
          <table style="border-collapse:collapse;width:100%;font-size:14px;">
            <tr style="background:#f9f5ee;"><td style="padding:8px 12px;border:1px solid #ddd;font-weight:bold;">VM Number</td><td style="padding:8px 12px;border:1px solid #ddd;">${vendor_id}</td></tr>
            <tr><td style="padding:8px 12px;border:1px solid #ddd;font-weight:bold;">Business Name</td><td style="padding:8px 12px;border:1px solid #ddd;">${name.trim()}</td></tr>
            <tr style="background:#f9f5ee;"><td style="padding:8px 12px;border:1px solid #ddd;font-weight:bold;">Category</td><td style="padding:8px 12px;border:1px solid #ddd;">${category}</td></tr>
            <tr><td style="padding:8px 12px;border:1px solid #ddd;font-weight:bold;">Email</td><td style="padding:8px 12px;border:1px solid #ddd;">${email.trim()}</td></tr>
            <tr style="background:#f9f5ee;"><td style="padding:8px 12px;border:1px solid #ddd;font-weight:bold;">Phone</td><td style="padding:8px 12px;border:1px solid #ddd;">${phone || "—"}</td></tr>
            <tr><td style="padding:8px 12px;border:1px solid #ddd;font-weight:bold;">Website</td><td style="padding:8px 12px;border:1px solid #ddd;">${website || "—"}</td></tr>
            <tr style="background:#f9f5ee;"><td style="padding:8px 12px;border:1px solid #ddd;font-weight:bold;">Facebook</td><td style="padding:8px 12px;border:1px solid #ddd;">${facebook_url || "—"}</td></tr>
            <tr><td style="padding:8px 12px;border:1px solid #ddd;font-weight:bold;">Description</td><td style="padding:8px 12px;border:1px solid #ddd;">${description || "—"}</td></tr>
          </table>
          <p style="margin-top:16px;font-size:13px;color:#666;">Log in to the <a href="https://www.v-hub.us/Wekcadmin" style="color:#E8431A;">V-HUB Admin Dashboard</a> → Vendors tab to approve or reject.</p>
        </div>`;

      await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: { "Authorization": `Bearer ${SENDGRID_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: "kimberlycook1980@gmail.com", name: "Kimberly Cook" }] }],
          from: { email: "admin@v-hub.us", name: "V-HUB Vendors" },
          reply_to: { email: email.trim(), name: name.trim() },
          subject: `🛒 New Vendor Application — ${name.trim()}`,
          content: [{ type: "text/html", value: html }],
        }),
      });
    }

    return new Response(JSON.stringify({ ok: true, vendor_id }), {
      status: 200, headers: { ...cors, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("submitVendor error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
