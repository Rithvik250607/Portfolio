export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return response.status(503).json({ error: 'Message service is not configured yet.' });
  }

  const { name, email, message, website } = request.body || {};
  // Silently accept honeypot submissions without storing them.
  if (typeof website === 'string' && website.trim()) {
    return response.status(200).json({ ok: true });
  }

  if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
    return response.status(400).json({ error: 'Please provide your name, email, and message.' });
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim();
  const cleanMessage = message.trim();
  if (!cleanName || cleanName.length > 120 || !cleanEmail || cleanEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) || !cleanMessage || cleanMessage.length > 5000) {
    return response.status(400).json({ error: 'Please check the form fields and try again.' });
  }

  try {
    const result = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/contact_messages`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({ name: cleanName, email: cleanEmail, message: cleanMessage })
    });

    if (!result.ok) {
      console.error('Supabase contact insert failed:', result.status);
      return response.status(502).json({ error: 'Message could not be sent. Please try again later.' });
    }
    return response.status(201).json({ ok: true });
  } catch (error) {
    console.error('Contact submission failed:', error.message);
    return response.status(502).json({ error: 'Message could not be sent. Please try again later.' });
  }
}
