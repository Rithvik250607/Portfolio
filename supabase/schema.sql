-- Portfolio contact inbox. Run in Supabase SQL Editor.
-- Admin authorization is restricted to the verified Supabase Auth email below.
-- Set the admin password in Supabase Dashboard > Authentication > Users; never store it here.

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  message text not null check (char_length(message) between 1 and 5000),
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

revoke all on table public.contact_messages from anon, authenticated;
grant insert on table public.contact_messages to service_role;
grant select on table public.contact_messages to authenticated;

drop policy if exists "Only portfolio admin can read contact messages" on public.contact_messages;
create policy "Only portfolio admin can read contact messages"
  on public.contact_messages
  for select
  to authenticated
  using (
    lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'rithvikpr25@gmail.com'
  );

create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);
