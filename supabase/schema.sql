create table if not exists public.orbit_runs (
  id text primary key,
  source text not null default 'manual',
  prompt text not null default '',
  status text not null default 'completed',
  summary text not null default '',
  tool_ids jsonb not null default '[]'::jsonb,
  results jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orbit_runs enable row level security;

-- Server-side persistence uses the service-role key. No public client policy is created.
-- If browser reads are later needed, add an authenticated policy instead of exposing service_role.
