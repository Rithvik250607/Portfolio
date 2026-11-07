export default function handler(_request, response) {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');

  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return response.status(503).json({ error: 'Supabase is not configured yet.' });
  }

  // The anon key is designed to be public. Row-level security protects the data.
  return response.status(200).json({ url, anonKey });
}
