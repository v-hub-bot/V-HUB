import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

async function sha256(plain: string): Promise<string> {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(plain));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type' } });
  }

  try {
    const base44 = createClientFromRequest(req);
    const { provider_id, token, new_password } = await req.json().catch(() => ({}));

    if (!provider_id || !token || !new_password) {
      return Response.json({ error: 'provider_id, token, and new_password are required' }, { status: 400 });
    }
    if (new_password.length < 6) {
      return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const tokenHash = await sha256(token);

    // Find matching, unused, non-expired token
    const tokens = await base44.asServiceRole.entities.PasswordResetToken.filter({
      provider_id,
      token_hash: tokenHash,
      used: false,
    });

    if (!tokens.length) {
      return Response.json({ error: 'Invalid or already-used reset link.' }, { status: 400 });
    }

    const tokenRecord = tokens[0];

    // Check expiry
    if (new Date(tokenRecord.expires_at) < new Date()) {
      return Response.json({ error: 'This reset link has expired. Please request a new one.' }, { status: 400 });
    }

    // Hash new password and update provider
    const hashedPassword = await sha256(new_password);
    await base44.asServiceRole.entities.Provider.update(provider_id, {
      login_password: hashedPassword,
    });

    // Mark token as used
    await base44.asServiceRole.entities.PasswordResetToken.update(tokenRecord.id, { used: true });

    return Response.json({ ok: true });
  } catch (err: any) {
    console.error('resetPassword error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});
