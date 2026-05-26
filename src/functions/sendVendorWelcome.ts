// sendVendorWelcome — sends a welcome email to a market vendor
import { createClientFromRequest } from "npm:@base44/sdk@0.8.23";

const SENDGRID_KEY = Deno.env.get("SENDGRID_API_KEY") || "";
const FROM_EMAIL = "admin@v-hub.us";
const FROM_NAME = "V-HUB Hometown Market";
const ADMIN_EMAIL = "kimberlycook1980@gmail.com";

Deno.serve(async (req: Request): Promise<Response> => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

  try {
    const body = await req.json();
    const vendor_id = body.vendor_id;
    if (!vendor_id) {
      return new Response(JSON.stringify({ error: "vendor_id required" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const client = createClientFromRequest(req);
    const vendors = await client.asServiceRole.entities.MarketVendor.list();
    const vendor = vendors.find((v: any) => v.id === vendor_id);

    if (!vendor) {
      return new Response(JSON.stringify({ error: "Vendor not found" }), { status: 404, headers: { ...cors, "Content-Type": "application/json" } });
    }
    if (!vendor.email) {
      return new Response(JSON.stringify({ error: "No email on file" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const loginEmail = vendor.login_email || vendor.email || "";
    const tempPassword = vendor.login_password || "";
    const hasLogin = !!tempPassword;

    const styles = "body{font-family:Georgia,serif;background:#FDF6E3;margin:0;padding:0}.wrap{max-width:560px;margin:0 auto;padding:32px 24px}.logo{text-align:center;margin-bottom:20px}h1{font-size:22px;color:#3E2010;text-align:center}.sub{text-align:center;color:#7A5C3A;font-size:14px;margin-bottom:24px}.box{background:#fff8ec;border:1px solid #D4A96A;border-radius:10px;padding:20px 22px;margin-bottom:20px}.cred{background:#f0f9f4;border:1px solid #A5D6A7;border-radius:6px;padding:10px 14px;margin-bottom:8px;font-family:monospace;font-size:14px;color:#1A4731}.lbl{font-size:11px;font-weight:bold;color:#7A5C3A;text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px;font-family:Arial,sans-serif}.btn{display:block;text-align:center;background:#E8431A;color:#fff;text-decoration:none;padding:13px 24px;border-radius:8px;font-size:15px;font-weight:bold;margin:18px 0}p{color:#5C3D1E;font-size:14px;line-height:1.6}.footer{text-align:center;font-size:11px;color:#AAA;margin-top:24px;font-family:Arial,sans-serif}.note{background:#FFF3E0;border-left:3px solid #FF9800;padding:10px 14px;border-radius:4px;font-size:13px;color:#5C3D1E;margin:12px 0}";

    let details = "<p><strong>Business:</strong> " + vendor.name + "</p>";
    if (vendor.vendor_id) details += "<p><strong>Vendor ID:</strong> " + vendor.vendor_id + "</p>";
    if (vendor.category) details += "<p><strong>Category:</strong> " + vendor.category + "</p>";
    if (vendor.schedule) details += "<p><strong>Schedule:</strong> " + vendor.schedule + "</p>";

    let acctBox = "";
    if (hasLogin) {
      acctBox = "<div class=\"box\"><h2>Your Vendor Account</h2>"
        + "<p>Log in to manage your listing and update your info.</p>"
        + "<div class=\"lbl\">Login Email</div><div class=\"cred\">" + loginEmail + "</div>"
        + "<div class=\"lbl\">Temporary Password</div><div class=\"cred\">" + tempPassword + "</div>"
        + "<div class=\"note\">Please change your password on first login.</div>"
        + "<a class=\"btn\" href=\"https://www.v-hub.us\">Log In to V-HUB</a></div>";
    } else {
      acctBox = "<div class=\"box\"><h2>Manage Your Listing</h2>"
        + "<p>Email <strong>admin@v-hub.us</strong> to claim your vendor account and manage your listing yourself.</p></div>";
    }

    const html = "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><style>" + styles + "</style></head><body><div class=\"wrap\">"
      + "<div class=\"logo\"><img src=\"https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png\" height=\"60\" alt=\"V-HUB\"></div>"
      + "<h1>Welcome to V-HUB Hometown Market!</h1>"
      + "<div class=\"sub\">Your vendor listing is now live</div>"
      + "<p>Hi " + vendor.name + ",</p>"
      + "<p>Your business is now listed in the <strong>V-HUB Hometown Market</strong> directory serving Brownwood Paddock Square in The Villages, FL.</p>"
      + "<div class=\"box\"><h2>Your Listing</h2>" + details + "</div>"
      + acctBox
      + "<p>Thousands of Villages residents use V-HUB to find local vendors and services. We are glad you are part of it!</p>"
      + "<p>Questions? Reach us at <a href=\"mailto:admin@v-hub.us\" style=\"color:#E8431A\">admin@v-hub.us</a>.</p>"
      + "<p>See you at the market!</p><p><strong>The V-HUB Team</strong></p>"
      + "<div class=\"footer\">V-HUB - The Villages, FL - <a href=\"https://www.v-hub.us\" style=\"color:#AAA\">www.v-hub.us</a></div>"
      + "</div></body></html>";

    const sgRes = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: { "Authorization": "Bearer " + SENDGRID_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: vendor.email, name: vendor.name }] }],
        from: { email: FROM_EMAIL, name: FROM_NAME },
        reply_to: { email: ADMIN_EMAIL },
        subject: "Welcome to V-HUB Hometown Market - " + vendor.name,
        content: [{ type: "text/html", value: html }],
      }),
    });

    if (!sgRes.ok) {
      const errText = await sgRes.text();
      return new Response(JSON.stringify({ error: "SendGrid error", detail: errText }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
    }

    await client.asServiceRole.entities.MarketVendor.update(vendor_id, { welcome_sent: true });

    await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: { "Authorization": "Bearer " + SENDGRID_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: ADMIN_EMAIL }] }],
        from: { email: FROM_EMAIL, name: FROM_NAME },
        subject: "Vendor Welcome Sent - " + vendor.name,
        content: [{ type: "text/plain", value: "Welcome email sent to " + vendor.name + " at " + vendor.email }],
      }),
    });

    return new Response(JSON.stringify({ success: true, sent_to: vendor.email }), { status: 200, headers: { ...cors, "Content-Type": "application/json" } });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Server error" }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
