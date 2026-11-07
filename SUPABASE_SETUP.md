# Supabase contact inbox setup

## 1. Create the table and access rules

In the Supabase project, open **SQL Editor**, paste the contents of `supabase/schema.sql`, and run it.

The schema allows the Vercel contact function to insert messages and lets only an authenticated user whose email is `rithvikpr25@gmail.com` read them. Anonymous visitors cannot read the inbox.

## 2. Create the admin login

In Supabase Dashboard, open **Authentication → Users → Add user**. Create a confirmed user with email `rithvikpr25@gmail.com` and the password you chose for the admin. Passwords are managed by Supabase Auth and are deliberately not stored in the SQL file.

## 3. Add Vercel environment variables

In **Vercel → Project → Settings → Environment Variables**, add these for Production (and Preview if needed):

- `SUPABASE_URL` — the project URL
- `SUPABASE_ANON_KEY` — the publishable/anon key (public by design)
- `SUPABASE_SERVICE_ROLE_KEY` — the secret/service-role key (server-side only)

The service-role key is used only by `/api/contact` on the server to insert validated form submissions. Never put it in HTML, JavaScript, or a `NEXT_PUBLIC_` variable. The admin inbox uses the public key with Supabase Auth and the SQL row-level security policy.

After adding or changing environment variables, redeploy the Vercel project. The contact form will save submissions, and the inbox will be available at `/admin`.
