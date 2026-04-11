import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY') || '';
const APP_URL = "https://v-hub-app-edf7f8e8.base44.app";
const LOGO_URL = "https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png";

async function sendEmail(to: string, subject: string, htmlBody: string) {
  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: 'admin@v-hub.us', name: 'V-Hub' },
      subject,
      content: [{ type: 'text/html', value: htmlBody }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('SendGrid error:', err);
    throw new Error('Email failed: ' + err);
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const {
      provider_record_id,
      business_name,
      owner_name,
      email,
      phone,
      services,
      service_areas,
      vh_number,
    } = body;

    if (!provider_record_id) {
      return Response.json({ error: 'Missing provider_record_id' }, { status: 400 });
    }

    // Set up 45-day trial
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + 45);

    const trialStartStr = now.toISOString().split('T')[0];
    const trialEndStr = trialEnd.toISOString().split('T')[0];
    const trialEndFormatted = trialEnd.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });

    // Update the provider record — active, visible, on trial
    await base44.asServiceRole.entities.Provider.update(provider_record_id, {
      is_active: true,
      is_visible: true,
      subscription_status: "trial",
      trial_start_date: trialStartStr,
      trial_end_date: trialEndStr,
      reminder_sent: false,
    });

    // ── Send confirmation email to provider ─────────────────────────────
    if (email) {
      const servicesList = (services || []).join(', ') || 'your selected services';
      const areasList = (service_areas || []).join(', ') || 'your selected villages';
      const vhDisplay = vh_number
        ? `<div style="font-size:13px;color:#333;margin-bottom:6px;"><strong>VH Number:</strong> <span style="font-family:'Courier New',monospace;font-weight:900;font-size:15px;">${vh_number}</span></div>`
        : '';

      const providerHtml = `
        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#F5E8CC;border:2px solid #8B4513;border-radius:12px;overflow:hidden;">

          <!-- Header -->
          <div style="background:#1A0A00;padding:24px;text-align:center;">
            <img src="${LOGO_URL}" style="height:65px;border-radius:10px;margin-bottom:10px;" />
            <div style="color:#F5E8CC;font-size:22px;font-weight:900;letter-spacing:2px;">🎉 YOU'RE LIVE ON V-HUB!</div>
            <div style="color:#C9973A;font-size:13px;margin-top:6px;font-style:italic;">The Villages' #1 Local Services Directory</div>
          </div>

          <!-- Body -->
          <div style="padding:28px 24px;">
            <p style="color:#1A0A00;font-size:17px;font-weight:700;margin:0 0 6px;">Hi ${owner_name},</p>
            <p style="color:#5A3010;font-size:15px;line-height:1.7;margin:0 0 20px;">
              Congratulations — <strong>${business_name}</strong> has been reviewed and <strong>approved!</strong>
              Your listing is now live and searchable by residents throughout The Villages.
            </p>

            <!-- Listing Summary -->
            <div style="background:#fff;border:1px solid #C4A270;border-radius:10px;padding:18px 20px;margin-bottom:20px;">
              <div style="font-weight:800;color:#5A3010;margin-bottom:12px;font-size:14px;text-transform:uppercase;letter-spacing:1px;">📋 Your Listing</div>
              <div style="font-size:13px;color:#333;margin-bottom:6px;"><strong>Business:</strong> ${business_name}</div>
              ${vhDisplay}
              <div style="font-size:13px;color:#333;margin-bottom:6px;"><strong>Services:</strong> ${servicesList}</div>
              <div style="font-size:13px;color:#333;"><strong>Villages Served:</strong> ${areasList}</div>
            </div>

            <!-- 45-Day Trial Box -->
            <div style="background:#E8F5E9;border:2px solid #4CAF50;border-radius:10px;padding:20px;margin-bottom:20px;text-align:center;">
              <div style="font-size:28px;margin-bottom:6px;">🌴</div>
              <div style="font-weight:900;color:#2E7D32;font-size:18px;margin-bottom:8px;">45-DAY FREE TRIAL — STARTS TODAY</div>
              <div style="font-size:14px;color:#388E3C;line-height:1.7;margin-bottom:10px;">
                Your listing is <strong>completely free</strong> for the next 45 days.<br/>
                <strong>No credit card needed now. No charges until your trial ends.</strong>
              </div>
              <div style="background:#fff;border-radius:8px;padding:12px 18px;display:inline-block;border:1px solid #A5D6A7;">
                <div style="font-size:12px;color:#777;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Trial Expires On</div>
                <div style="font-size:20px;font-weight:900;color:#2E7D32;">${trialEndFormatted}</div>
                <div style="font-size:12px;color:#888;margin-top:4px;">(45 days from today)</div>
              </div>
            </div>

            <!-- How It Works -->
            <div style="background:#FFF8E1;border:1px solid #FFD54F;border-radius:10px;padding:18px 20px;margin-bottom:20px;">
              <div style="font-weight:800;color:#E65100;font-size:14px;margin-bottom:12px;text-transform:uppercase;letter-spacing:1px;">💳 How Billing Works</div>
              <div style="font-size:13px;color:#5A3010;line-height:1.8;">
                ✅ <strong>Free for 45 days</strong> — no payment needed now<br/>
                ✅ <strong>$12/month</strong> after your trial period ends<br/>
                ✅ <strong>Pay anytime</strong> through your Provider Dashboard — before or after trial<br/>
                ✅ <strong>Cancel anytime</strong> — no contracts, no cancellation fees<br/>
                ✅ Each time you pay, you'll see exactly when your next payment is due<br/>
                ✅ <strong>Admin will notify you</strong> as your trial end date approaches
              </div>
            </div>

            <!-- Provider Dashboard -->
            <div style="background:#E3F2FD;border:1px solid #90CAF9;border-radius:10px;padding:18px 20px;margin-bottom:24px;">
              <div style="font-weight:800;color:#1565C0;font-size:14px;margin-bottom:10px;text-transform:uppercase;letter-spacing:1px;">📊 Your Provider Dashboard</div>
              <div style="font-size:13px;color:#1A237E;line-height:1.8;margin-bottom:14px;">
                Log into your Provider Dashboard to:<br/>
                • See how many people viewed or found your listing<br/>
                • Check your trial countdown &amp; days remaining<br/>
                • Manage your subscription and make payments<br/>
                • Update your business info at any time
              </div>
              <div style="text-align:center;">
                <a href="${APP_URL}/ProviderDashboard" style="display:inline-block;background:#1565C0;color:#fff;text-decoration:none;padding:12px 26px;border-radius:8px;font-weight:700;font-size:14px;letter-spacing:1px;">
                  📊 Go to My Provider Dashboard →
                </a>
              </div>
              <div style="font-size:12px;color:#555;margin-top:10px;text-align:center;">
                Log in at <strong>${APP_URL}</strong> → click <strong>Provider Login</strong> → use your registration email
              </div>
            </div>

            <!-- How searchers find you -->
            <p style="color:#5A3010;font-size:14px;line-height:1.7;margin:0 0 20px;">
              When residents search for your services, your listing appears with your contact info so they can reach you directly — 
              <strong>no middleman, no commissions.</strong>
            </p>

            <!-- Homepage Button -->
            <div style="text-align:center;margin-bottom:10px;">
              <a href="${APP_URL}" style="display:inline-block;background:#E8431A;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:700;font-size:15px;letter-spacing:1px;">
                🌴 View V-Hub Directory
              </a>
            </div>

            <p style="font-size:12px;color:#8B5E3C;text-align:center;margin-top:14px;">
              Questions? Reply to this email or reach us at <a href="mailto:admin@v-hub.us" style="color:#E8431A;">admin@v-hub.us</a>
            </p>
          </div>

          <!-- Footer -->
          <div style="background:#1A0A00;padding:14px;text-align:center;color:rgba(245,232,204,0.5);font-size:11px;">
            V-Hub · The Villages, Florida · A community-first local directory<br/>
            <a href="${APP_URL}" style="color:rgba(245,232,204,0.4);text-decoration:none;">v-hub.us</a> · 
            <a href="mailto:admin@v-hub.us" style="color:rgba(245,232,204,0.4);text-decoration:none;">admin@v-hub.us</a>
          </div>
        </div>
      `;

      await sendEmail(
        email,
        `🎉 You're live on V-Hub — ${business_name} | 45-Day Free Trial Started`,
        providerHtml
      );
    }

    // ── Notify admin that approval was completed ─────────────────────────
    try {
      const adminHtml = `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#f9f9f9;border:1px solid #ddd;border-radius:10px;overflow:hidden;">
          <div style="background:#2e7d32;padding:16px 20px;text-align:center;">
            <div style="color:#fff;font-size:18px;font-weight:900;">✅ Provider Approved</div>
          </div>
          <div style="padding:20px;">
            <p style="font-size:14px;color:#333;margin:0 0 12px;"><strong>${business_name}</strong> has been approved and is now live on V-Hub.</p>
            <p style="font-size:13px;color:#555;margin:0 0 8px;">• VH Number: <strong>${vh_number || 'N/A'}</strong></p>
            <p style="font-size:13px;color:#555;margin:0 0 8px;">• Contact: ${owner_name} — ${email}</p>
            <p style="font-size:13px;color:#555;margin:0 0 8px;">• Trial ends: <strong>${trialEndFormatted}</strong></p>
            <p style="font-size:13px;color:#555;margin:0;">• Confirmation email sent to provider ✅</p>
            <div style="text-align:center;margin-top:20px;">
              <a href="${APP_URL}/Wekcadmin" style="background:#5C3317;color:#fff;text-decoration:none;padding:10px 22px;border-radius:6px;font-size:13px;font-weight:700;">View Admin Dashboard →</a>
            </div>
          </div>
        </div>
      `;
      await sendEmail('admin@v-hub.us', `✅ Approved: ${business_name} is now live`, adminHtml);
    } catch (adminErr) {
      console.error("Admin confirmation email failed:", adminErr);
    }

    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    };

    return new Response(JSON.stringify({
      ok: true,
      trial_start: trialStartStr,
      trial_end: trialEndStr,
    }), { headers });

  } catch (error) {
    console.error("approveProvider error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
