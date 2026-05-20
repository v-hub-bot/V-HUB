// submitLead — saves a lead inquiry and emails the provider
import { createClientFromRequest } from "npm:@base44/sdk@0.8.23";

Deno.serve(async (req: Request): Promise<Response> => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const body = await req.json();
    const { provider_id, customer_name, customer_email, customer_phone, message } = body;

    if (!provider_id || !customer_name) {
      return new Response(JSON.stringify({ ok: false, error: "Missing required fields" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole;

    // Save to LeadInquiry entity
    const lead = await db.entities.LeadInquiry.create({
      provider_id,
      customer_name,
      customer_email: customer_email || "",
      customer_phone: customer_phone || "",
      message: message || "",
      status: "new",
    });

    // Fetch provider to send email notification
    let providerEmail = "";
    let businessName = "";
    try {
      const provider = await db.entities.Provider.get(provider_id);
      providerEmail = provider?.email || "";
      businessName = provider?.business_name || "Your Business";
    } catch(_e) {}

    if (providerEmail) {
      const replyTo = customer_email ? { email: customer_email, name: customer_name } : { email: "admin@v-hub.us" };
      const emailBody = {
        personalizations: [{ to: [{ email: providerEmail }], cc: [{ email: "admin@v-hub.us" }] }],
        from: { email: "admin@v-hub.us", name: "V-HUB Directory" },
        reply_to: replyTo,
        subject: `New Lead from V-HUB — ${customer_name} wants to connect!`,
        content: [{
          type: "text/html",
          value: `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f4f0e8;padding:20px;">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #ddd;border-radius:4px;margin:0 auto;">
<tr><td style="background:#1B3D6F;padding:20px;text-align:center;">
<img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" width="80" style="display:block;margin:0 auto 8px;" alt="V-HUB"/>
<div style="color:#fff;font-size:18px;font-weight:700;font-family:Arial,sans-serif;">New Lead from V-HUB!</div>
</td></tr>
<tr><td style="padding:28px;">
<p style="font-size:15px;color:#1B3D6F;font-weight:700;font-family:Arial,sans-serif;">Hi ${businessName},</p>
<p style="font-size:14px;color:#333;line-height:1.7;font-family:Arial,sans-serif;">Someone found you on V-HUB and wants to get in touch:</p>
<div style="background:#f4f0e8;border-left:4px solid #E8431A;padding:16px 20px;border-radius:0 6px 6px 0;margin:16px 0;">
<p style="margin:4px 0;font-size:13px;font-family:Arial,sans-serif;"><strong>Name:</strong> ${customer_name}</p>
${customer_email ? `<p style="margin:4px 0;font-size:13px;font-family:Arial,sans-serif;"><strong>Email:</strong> <a href="mailto:${customer_email}">${customer_email}</a></p>` : ""}
${customer_phone ? `<p style="margin:4px 0;font-size:13px;font-family:Arial,sans-serif;"><strong>Phone:</strong> <a href="tel:${customer_phone}" style="color:#E8431A;font-weight:700;">${customer_phone}</a></p>` : ""}
${message ? `<p style="margin:8px 0 4px;font-size:13px;font-family:Arial,sans-serif;"><strong>Message:</strong> <em>"${message}"</em></p>` : ""}
</div>
<p style="font-size:14px;color:#333;line-height:1.7;font-family:Arial,sans-serif;">Please follow up as soon as possible — fast responses win the job!</p>
<p style="font-size:13px;color:#888;font-style:italic;font-family:Arial,sans-serif;">This lead came through your V-HUB listing at www.v-hub.us</p>
<p style="font-size:14px;color:#1B3D6F;font-weight:700;font-family:Arial,sans-serif;">— The V-HUB Team</p>
</td></tr>
<tr><td style="background:#1B3D6F;padding:12px;text-align:center;">
<p style="color:#aab8cc;font-size:11px;margin:0;font-family:Arial,sans-serif;">V-HUB · The Villages Local Services Directory · www.v-hub.us</p>
</td></tr>
</table></body></html>`
        }]
      };

      const sgKey = Deno.env.get("SENDGRID_API_KEY") || "";
      if (sgKey) {
        await fetch("https://api.sendgrid.com/v3/mail/send", {
          method: "POST",
          headers: { "Authorization": `Bearer ${sgKey}`, "Content-Type": "application/json" },
          body: JSON.stringify(emailBody),
        }).catch(e => console.error("SendGrid error:", e));
      }
    }

    return new Response(JSON.stringify({ ok: true, lead_id: lead.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch(e) {
    console.error("submitLead error:", e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
