import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const ADMIN_EMAILS = [
  "kimberlycook1980@gmail.com",
  "5bebegurlz@gmail.com",
  "evansrus@comcast.net",
];
const ALERT_EMAILS = ["kimberlycook1980@gmail.com", "5bebegurlz@gmail.com"];
const APP_URL = "https://www.v-hub.us";
const LOGO = "https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png";
const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY") || "";

function randomToken(len = 48) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let t = "";
  for (let i = 0; i < len; i++) t += chars[Math.floor(Math.random() * chars.length)];
  return t;
}

async function sendEmail(to: string, subject: string, html: string) {
  const payload = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: "admin@v-hub.us", name: "V-HUB" },
    subject,
    content: [{ type: "text/html", value: html }],
  };
  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok && res.status !== 202) {
    const err = await res.text();
    throw new Error("SendGrid send failed: " + err);
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const action = body.action || "request";

    // ── REQUEST MAGIC LINK ──────────────────────────────────────────────────
    if (action === "request") {
      const email = (body.email || "").trim().toLowerCase();
      if (!email) return Response.json({ error: "Email required" }, { status: 400 });

      const isAdmin = ADMIN_EMAILS.includes(email);

      if (!isAdmin) {
        // Alert admins
        const alertHtml = `
          <div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;background:#fff8f0;border:2px solid #E8431A;border-radius:10px;padding:28px 24px;">
            <img src="${LOGO}" style="width:56px;border-radius:8px;margin-bottom:14px;display:block;margin-left:auto;margin-right:auto;" />
            <h2 style="color:#8B1A1A;text-align:center;margin:0 0 16px;">⚠️ Unauthorized Admin Access Attempt</h2>
            <p style="color:#333;font-size:14px;">Someone tried to access the V-Hub Admin Dashboard using an unauthorized email.</p>
            <div style="background:#fff;border:1px solid #E8431A;border-radius:6px;padding:14px 16px;margin:16px 0;">
              <strong style="color:#E8431A;">Email used:</strong><br/>
              <span style="font-size:16px;font-weight:bold;color:#333;">${email}</span>
            </div>
            <p style="color:#666;font-size:13px;">No access was granted.</p>
            <p style="color:#999;font-size:11px;margin:0;">Time: ${new Date().toLocaleString("en-US", { timeZone: "America/Detroit" })} ET</p>
          </div>`;
        for (const a of ALERT_EMAILS) {
          try { await sendEmail(a, "V-Hub Admin - Unauthorized Access Attempt", alertHtml); } catch (_) {}
        }
        return Response.json({ status: "not_admin" });
      }

      // Create token
      const token = randomToken(48);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      await base44.asServiceRole.entities.AdminMagicLink.create({ email, token, expires_at: expiresAt, used: false });

      const magicUrl = `${APP_URL}/Wekcadmin?token=${token}`;
      const firstName = email.includes("kim") || email.includes("bebegurlz") ? "Kimberly" : "Admin";

      const linkHtml = `
        <div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;">
          <div style="background:linear-gradient(135deg,#3B1F0A,#5C3317);padding:24px;border-radius:10px 10px 0 0;text-align:center;">
            <img src="${LOGO}" style="width:60px;border-radius:8px;margin-bottom:10px;" />
            <h1 style="color:#fff;margin:0;font-size:22px;font-family:Georgia,serif;">V-HUB Admin Access</h1>
          </div>
          <div style="background:#FFFDF4;border:1px solid #C4A882;border-top:none;border-radius:0 0 10px 10px;padding:32px 24px;text-align:center;">
            <p style="color:#5C3317;font-size:15px;margin:0 0 8px;">Hi ${firstName},</p>
            <p style="color:#5C3317;font-size:14px;margin:0 0 28px;line-height:1.7;">Here's your secure one-click link to the V-Hub Admin Dashboard.<br/>It expires in <strong>15 minutes</strong> and can only be used once.</p>
            <a href="${magicUrl}" style="display:inline-block;background:linear-gradient(135deg,#3B1F0A,#5C3317);color:#fff;text-decoration:none;padding:16px 40px;border-radius:8px;font-size:16px;font-weight:bold;border:2px solid #C9973A;">
              🔓 Enter Admin Dashboard
            </a>
            <p style="color:#aaa;font-size:12px;margin:24px 0 4px;">If you didn't request this, ignore this email — no one else can use this link.</p>
            <p style="color:#C4A882;font-size:11px;margin:0;">Expires at: ${new Date(expiresAt).toLocaleString("en-US", { timeZone: "America/Detroit", hour: "numeric", minute: "2-digit", hour12: true })} ET</p>
          </div>
        </div>`;

      await sendEmail(email, "Your V-Hub Admin Login Link", linkHtml);
      return Response.json({ status: "sent", email });
    }

    // ── VERIFY TOKEN ────────────────────────────────────────────────────────
    if (action === "verify") {
      const token = (body.token || "").trim();
      if (!token) return Response.json({ valid: false, reason: "no_token" });

      const records = await base44.asServiceRole.entities.AdminMagicLink.filter({ token });
      const record = records?.[0];
      if (!record) return Response.json({ valid: false, reason: "not_found" });
      if (record.used) return Response.json({ valid: false, reason: "already_used" });
      if (new Date(record.expires_at) < new Date()) return Response.json({ valid: false, reason: "expired" });

      await base44.asServiceRole.entities.AdminMagicLink.update(record.id, { used: true });
      return Response.json({ valid: true, email: record.email });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});
