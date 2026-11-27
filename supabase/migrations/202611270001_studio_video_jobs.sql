create extension if not exists pgcrypto;

create table if not exists public.studio_video_jobs (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  language text not null default 'hi-IN'
    check (language in ('hi-IN', 'en-IN', 'en-US')),
  channel_context text,
  target_duration_minutes integer not null default 8
    check (target_duration_minutes between 1 and 60),
  status text not null default 'queued',
  progress integer not null default 0 check (progress between 0 and 100),
  script text,
  voiceover_object_key text,
  voiceover_duration_ms bigint,
  scene_plan jsonb,
  render_versions jsonb not null default '[]'::jsonb,
  qa_findings jsonb not null default '[]'::jsonb,
  repair_attempts integer not null default 0,
  max_repair_attempts integer not null default 3,
  thumbnail_object_key text,
  youtube_video_id text,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists studio_video_jobs_status_created_idx
  on public.studio_video_jobs (status, created_at desc);

alter table public.studio_video_jobs enable row level security;

-- No anon/authenticated policies are intentionally created. Server-side access
-- uses the Supabase service-role key, which must never be exposed to the browser.
