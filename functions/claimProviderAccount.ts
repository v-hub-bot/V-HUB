// claimProviderAccount.ts
// Called when a provider registers/logs in — links their User account to their Provider record by email match
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY') || '';

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
  }
}

function generateVhNumber(existing: string[]): string {
  const existingSet = new Set(existing);
  let attempts = 0;
  while (attempts < 1000) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    const num = (arr[0] % 9000) + 1000;
    const candidate = `VH-${num}`;
    if (!existingSet.has(candidate)) return candidate;
    attempts++;
  }
  throw new Error('Could not generate unique VH number');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get the currently logged-in user
    const me = await base44.auth.me();
    if (!me || !me.email) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { business_name, owner_name, phone, website, address, description,
            years_in_business, license_number, services, service_areas, category_id } = body;

    // Look up provider by email
    const allProviders = await base44.asServiceRole.entities.Provider.list();
    const existingProvider = allProviders.find((p: any) =>
      p.email && p.email.toLowerCase() === me.email.toLowerCase()
    );

    if (existingProvider) {
      // Provider already exists — just return their data (claim/login flow)
      return Response.json({ ok: true, action: 'claimed', provider: existingProvider });
    }

    // No existing provider — this is a brand new self-signup
    // Generate VH number
    const existingVhNumbers = allProviders.map((p: any) => p.vh_number).filter(Boolean);
    const vh_number = generateVhNumber(existingVhNumbers);

    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + 45);

    const record = await base44.asServiceRole.entities.Provider.create({
      business_name: business_name || '',
      owner_name: owner_name || me.full_name || '',
      email: me.email,
      phone: phone || '',
      website: website || '',
      address: address || '',
      description: description || '',
      years_in_business: years_in_business ? Number(years_in_business) : 0,
      license_number: license_number || '',
      services: services || [],
      service_areas: service_areas || [],
      category_id: category_id || '',
      vh_number,
      onboarding_type: 'self',
      subscription_status: 'trial',
      subscription_tier: 'basic',
      is_visible: false, // pending admin approval
      is_active: true,
      trial_start_date: now.toISOString(),
      trial_end_date: trialEnd.toISOString(),
      reminder_sent: false,
    });

    // Welcome email
    const trialEndFormatted = trialEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const welcomeHtml = `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #F5E8CC; border: 2px solid #8B4513; border-radius: 12px; overflow: hidden;">
        <div style="background: #1A0A00; padding: 20px 24px; text-align: center;">
          <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" style="height: 60px; border-radius: 8px;" />
          <div style="color: #F5E8CC; font-size: 22px; font-weight: 900; letter-spacing: 2px; margin-top: 10px;">Welcome to V-Hub!</div>
        </div>
        <div style="padding: 28px 24px;">
          <p style="font-size: 16px; color: #3a1f00; margin: 0 0 16px;">Hi ${owner_name || me.full_name || 'there'},</p>
          <p style="font-size: 15px; color: #5A3010; margin: 0 0 16px;">
            Thanks for signing up! Your listing for <strong>${business_name}</strong> has been submitted and is pending approval from our team. We'll notify you once it's live.
          </p>
          <div style="background: #fff; border-radius: 10px; padding: 18px; margin: 20px 0; border-left: 4px solid #E8431A;">
            <div style="font-size: 14px; font-weight: 700; color: #5A3010; margin-bottom: 8px;">YOUR FREE TRIAL DETAILS</div>
            <div style="font-size: 14px; color: #333;">📋 Your V-Hub ID: <strong>${vh_number}</strong></div>
            <div style="font-size: 14px; color: #333; margin-top: 6px;">📅 Trial ends: <strong>${trialEndFormatted}</strong></div>
            <div style="font-size: 14px; color: #333; margin-top: 6px;">💰 After trial: <strong>$12/month</strong> to stay listed</div>
          </div>
          <div style="text-align: center; margin: 24px 0;">
            <a href="https://v-hub-app-edf7f8e8.base44.app/ProviderDashboard" style="display: inline-block; background: #E8431A; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 15px; letter-spacing: 1px;">
              Go to Your Provider Dashboard →
            </a>
          </div>
          <p style="font-size: 13px; color: #888; text-align: center;">Questions? <a href="mailto:admin@v-hub.us" style="color: #E8431A;">admin@v-hub.us</a></p>
        </div>
        <div style="background: #1A0A00; padding: 12px; text-align: center; color: rgba(245,232,204,0.5); font-size: 11px;">
          V-Hub · The Villages, Florida
        </div>
      </div>
    `;

    await sendEmail(me.email, `Welcome to V-Hub — Your listing has been submitted!`, welcomeHtml);

    // Notify admin
    const adminHtml = `<div style="font-family:sans-serif;padding:20px;background:#f5f5f5;border-radius:8px;max-width:500px;">
      <strong>New Self-Signup Listing</strong><br/><br/>
      <b>Business:</b> ${business_name}<br/>
      <b>Owner:</b> ${owner_name}<br/>
      <b>Email:</b> ${me.email}<br/>
      <b>VH #:</b> ${vh_number}<br/>
      <br/>
      <a href="https://v-hub-app-edf7f8e8.base44.app/Admin" style="background:#E8431A;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:700;">Review in Admin Dashboard</a>
    </div>`;
    await sendEmail('admin@v-hub.us', `📋 New Self-Signup: ${business_name}`, adminHtml);

    return Response.json({ ok: true, action: 'created', provider: record });
  } catch (error) {
    console.error('claimProviderAccount error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
