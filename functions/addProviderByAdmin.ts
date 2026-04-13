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
  // Pool of random-looking numbers to avoid sequential guessing
  // Use a hash-like approach: random 4-digit that's not already used
  const existingSet = new Set(existing);
  let attempts = 0;
  while (attempts < 1000) {
    // Generate pseudo-random 4-digit number using crypto
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    const num = (arr[0] % 9000) + 1000; // 1000–9999
    const candidate = `VH-${num}`;
    if (!existingSet.has(candidate)) return candidate;
    attempts++;
  }
  throw new Error('Could not generate unique VH number');
}

// Generate SHA-256 hash using Web Crypto
async function sha256(plain: string): Promise<string> {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(plain));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Generate a random readable temp password
function genTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map((b) => chars[b % chars.length])
    .join("");
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const {
      business_name, owner_name, email, phone,
      website, address, description, years_in_business,
      license_number, services, service_areas, category_id, notes,
      google_review_url,
      subscription_status: inputStatus,
      subscription_tier: inputTier,
      is_active: inputActive,
      is_visible: inputVisible,
    } = body;

    if (!business_name || !owner_name || !email) {
      return Response.json({ error: 'business_name, owner_name, and email are required' }, { status: 400 });
    }

    // Get existing VH numbers to avoid duplicates
    const existing = await base44.asServiceRole.entities.Provider.list();
    const existingVhNumbers = existing.map((p: any) => p.vh_number).filter(Boolean);

    const vh_number = generateVhNumber(existingVhNumbers);

    // Trial dates: 45 days from now
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + 45);

    const tempPassword = genTempPassword();
    const hashedPassword = await sha256(tempPassword);

    const record = await base44.asServiceRole.entities.Provider.create({
      business_name,
      owner_name,
      email,
      login_email: email,
      login_password: hashedPassword,
      phone: phone || '',
      website: website || '',
      address: address || '',
      description: description || '',
      years_in_business: years_in_business ? Number(years_in_business) : 0,
      license_number: license_number || '',
      google_review_url: google_review_url || '',
      services: services || [],
      service_areas: service_areas || [],
      category_id: category_id || '',
      notes: notes || '',
      vh_number,
      onboarding_type: 'admin',
      subscription_status: inputStatus || 'trial',
      subscription_tier: inputTier || 'basic',
      is_visible: inputVisible !== false,
      is_active: inputActive !== false,
      trial_start_date: now.toISOString(),
      trial_end_date: trialEnd.toISOString(),
      reminder_sent: false,
      profile_views: 0,
      search_appearances: 0,
    });

    // Send welcome email to provider
    const trialEndFormatted = trialEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const welcomeHtml = `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #F5E8CC; border: 2px solid #8B4513; border-radius: 12px; overflow: hidden;">
        <div style="background: #1A0A00; padding: 20px 24px; text-align: center;">
          <img src="https://media.base44.com/images/public/69d062aca815ce8e697894b1/a9af95bc3_V-Hublogo.png" style="height: 60px; border-radius: 8px;" />
          <div style="color: #F5E8CC; font-size: 22px; font-weight: 900; letter-spacing: 2px; margin-top: 10px;">Welcome to V-Hub!</div>
        </div>
        <div style="padding: 28px 24px;">
          <p style="font-size: 16px; color: #3a1f00; margin: 0 0 16px;">Hi ${owner_name},</p>
          <p style="font-size: 15px; color: #5A3010; margin: 0 0 16px;">
            We're excited to have <strong>${business_name}</strong> listed on V-Hub — The Villages' go-to local services directory!
          </p>
          <div style="background: #fff; border-radius: 10px; padding: 18px; margin: 20px 0; border-left: 4px solid #E8431A;">
            <div style="font-size: 14px; font-weight: 700; color: #5A3010; margin-bottom: 8px;">YOUR FREE TRIAL DETAILS</div>
            <div style="font-size: 14px; color: #333;">📋 Your V-Hub ID: <strong>${vh_number}</strong></div>
            <div style="font-size: 14px; color: #333; margin-top: 6px;">📅 Trial ends: <strong>${trialEndFormatted}</strong></div>
            <div style="font-size: 14px; color: #333; margin-top: 6px;">💰 After trial: <strong>$12/month</strong> to stay listed</div>
          </div>
          <div style="background: #E8F5E9; border: 2px solid #4CAF50; border-radius: 10px; padding: 18px; margin: 20px 0;">
            <div style="font-size: 14px; font-weight: 700; color: #2E7D32; margin-bottom: 10px;">🔐 YOUR PROVIDER HUB LOGIN</div>
            <div style="font-size: 14px; color: #333; margin-bottom: 6px;">Visit: <a href="https://v-hub-app-edf7f8e8.base44.app/ProviderDashboard" style="color: #2E7D32;">v-hub.us → Provider Hub</a></div>
            <div style="font-size: 14px; color: #333; margin-bottom: 6px;"><strong>Email:</strong> ${email}</div>
            <div style="font-size: 14px; color: #333; margin-bottom: 10px;"><strong>Temporary Password:</strong> <span style="font-family: 'Courier New', monospace; font-weight: 900; font-size: 16px; background: #f0f0f0; padding: 2px 8px; border-radius: 4px;">${tempPassword}</span></div>
            <div style="font-size: 12px; color: #666; font-style: italic;">Please change your password after your first login via Account Settings in the dashboard.</div>
          </div>
          <p style="font-size: 14px; color: #5A3010; margin: 0 0 12px;">
            Your listing is now live and visible to residents across The Villages. When your trial nears its end, we'll send you a reminder and a simple link to set up your billing.
          </p>
          <p style="font-size: 14px; color: #5A3010; margin: 0;">
            Questions? Reach us at <a href="mailto:admin@v-hub.us" style="color: #E8431A;">admin@v-hub.us</a>
          </p>
        </div>
        <div style="background: #1A0A00; padding: 12px; text-align: center; color: rgba(245,232,204,0.5); font-size: 11px;">
          V-Hub · The Villages, Florida · admin@v-hub.us
        </div>
      </div>
    `;

    await sendEmail(email, `Welcome to V-Hub — Your 45-Day Free Trial Has Started!`, welcomeHtml);

    return Response.json({ ok: true, id: record.id, vh_number });
  } catch (error) {
    console.error('addProviderByAdmin error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
