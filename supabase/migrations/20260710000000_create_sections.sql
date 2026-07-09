-- Create sections table for the raw-HTML CMS
create extension if not exists pgcrypto;

create table if not exists public.sections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  html_content text not null default '',
  sort_order int not null default 0,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Keep updated_at current on every row update
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_sections_updated_at on public.sections;
create trigger set_sections_updated_at
  before update on public.sections
  for each row
  execute function public.set_updated_at();

-- Row Level Security
alter table public.sections enable row level security;

-- Public (anon) can read only active sections
drop policy if exists "Public can read active sections" on public.sections;
create policy "Public can read active sections"
  on public.sections
  for select
  to anon
  using (is_active = true);

-- Authenticated users (the admin) have full CRUD access
drop policy if exists "Authenticated full access" on public.sections;
create policy "Authenticated full access"
  on public.sections
  for all
  to authenticated
  using (true)
  with check (true);

-- Seed initial sections
insert into public.sections (slug, name, html_content, sort_order, is_active)
values
  ('header', 'Header', '<header class="p-6 flex items-center justify-between"><div class="font-bold text-xl">My Site</div><nav class="space-x-4"><a href="#">Home</a><a href="#">About</a><a href="#">Contact</a></nav></header>', 0, true),
  ('section-1', 'Section 1', '<section class="p-12 text-center"><h1 class="text-4xl font-bold mb-4">Welcome</h1><p class="text-lg">Edit this section from the admin panel.</p></section>', 1, true),
  ('section-2', 'Section 2', '<section class="p-12 text-center bg-gray-50"><h2 class="text-3xl font-bold mb-4">Section 2</h2><p>More content goes here.</p></section>', 2, true),
  ('footer', 'Footer', '<footer class="p-6 text-center text-sm text-gray-500">&copy; 2026 My Site. All rights reserved.</footer>', 3, true)
on conflict (slug) do nothing;
