-- Run this once in Supabase SQL Editor for project xtxjpnkrrhlognzxnfsg.
-- It creates/repairs the LearnFlow tables and refreshes PostgREST's schema cache.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  first_name text,
  last_name text,
  bio text,
  avatar_url text,
  school text,
  grade text,
  subjects jsonb not null default '[]'::jsonb,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lecture_notes (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  subject text,
  file_path text,
  content text not null default '',
  study_notes text,
  formulas jsonb not null default '[]'::jsonb,
  key_points jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.questions (
  id bigint generated always as identity primary key,
  lecture_note_id bigint not null references public.lecture_notes(id) on delete cascade,
  topic text,
  question_text text not null,
  option_a text,
  option_b text,
  option_c text,
  option_d text,
  correct_option text,
  explanation text,
  difficulty double precision not null default 0.5,
  blooms_level text not null default 'understand',
  question_type text not null default 'mcq',
  is_high_yield boolean not null default false,
  relevance_score double precision not null default 5.0,
  is_starred boolean not null default false,
  attempt_count integer not null default 0,
  correct_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.flashcards (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  lecture_note_id bigint references public.lecture_notes(id) on delete cascade,
  front text not null,
  back text not null,
  ease_factor double precision not null default 2.5,
  interval integer not null default 0,
  repetitions integer not null default 0,
  next_review_date timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.sticky_notes (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  lecture_note_id bigint references public.lecture_notes(id) on delete cascade,
  title text not null default 'Class Note',
  content text not null default '',
  color text not null default '#FFF9C4',
  note_type text not null default 'lecture',
  is_pinned boolean not null default false,
  page_number integer,
  source_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  lecture_note_id bigint not null references public.lecture_notes(id) on delete cascade,
  score integer not null,
  total_questions integer not null,
  completed_at timestamptz not null default now()
);

create table if not exists public.exam_syllabi (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text not null,
  file_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.previous_question_papers (
  id bigint generated always as identity primary key,
  exam_syllabus_id bigint not null references public.exam_syllabi(id) on delete cascade,
  file_path text not null,
  content text not null,
  uploaded_at timestamptz not null default now()
);

create table if not exists public.exam_questions (
  id bigint generated always as identity primary key,
  exam_syllabus_id bigint not null references public.exam_syllabi(id) on delete cascade,
  question_text text not null,
  answer text not null,
  marks integer not null,
  priority integer not null,
  topic text not null default '',
  is_from_pattern boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_response_cache (
  id bigint generated always as identity primary key,
  lecture_note_id bigint references public.lecture_notes(id) on delete cascade,
  exam_syllabus_id bigint references public.exam_syllabi(id) on delete cascade,
  action_type text not null,
  response_data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.lecture_notes enable row level security;
alter table public.questions enable row level security;
alter table public.flashcards enable row level security;
alter table public.sticky_notes enable row level security;
alter table public.notifications enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.exam_syllabi enable row level security;
alter table public.previous_question_papers enable row level security;
alter table public.exam_questions enable row level security;
alter table public.ai_response_cache enable row level security;

drop policy if exists "Users manage own profiles" on public.profiles;
drop policy if exists "Users manage own lecture notes" on public.lecture_notes;
drop policy if exists "Users read own questions" on public.questions;
drop policy if exists "Users manage own flashcards" on public.flashcards;
drop policy if exists "Users manage own sticky notes" on public.sticky_notes;
drop policy if exists "Users manage own notifications" on public.notifications;
drop policy if exists "Users manage own quiz attempts" on public.quiz_attempts;
drop policy if exists "Users manage own exam syllabi" on public.exam_syllabi;
drop policy if exists "Users manage own previous papers" on public.previous_question_papers;
drop policy if exists "Users manage own exam questions" on public.exam_questions;
drop policy if exists "Users manage own AI cache" on public.ai_response_cache;

create policy "Users manage own profiles" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users manage own lecture notes" on public.lecture_notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users read own questions" on public.questions
  for all using (
    exists (
      select 1 from public.lecture_notes
      where lecture_notes.id = questions.lecture_note_id
      and lecture_notes.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.lecture_notes
      where lecture_notes.id = questions.lecture_note_id
      and lecture_notes.user_id = auth.uid()
    )
  );

create policy "Users manage own flashcards" on public.flashcards
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own sticky notes" on public.sticky_notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own notifications" on public.notifications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own quiz attempts" on public.quiz_attempts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own exam syllabi" on public.exam_syllabi
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own previous papers" on public.previous_question_papers
  for all using (
    exists (
      select 1 from public.exam_syllabi
      where exam_syllabi.id = previous_question_papers.exam_syllabus_id
      and exam_syllabi.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.exam_syllabi
      where exam_syllabi.id = previous_question_papers.exam_syllabus_id
      and exam_syllabi.user_id = auth.uid()
    )
  );

create policy "Users manage own exam questions" on public.exam_questions
  for all using (
    exists (
      select 1 from public.exam_syllabi
      where exam_syllabi.id = exam_questions.exam_syllabus_id
      and exam_syllabi.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.exam_syllabi
      where exam_syllabi.id = exam_questions.exam_syllabus_id
      and exam_syllabi.user_id = auth.uid()
    )
  );

create policy "Users manage own AI cache" on public.ai_response_cache
  for all using (
    exists (
      select 1 from public.lecture_notes
      where lecture_notes.id = ai_response_cache.lecture_note_id
      and lecture_notes.user_id = auth.uid()
    )
    or exists (
      select 1 from public.exam_syllabi
      where exam_syllabi.id = ai_response_cache.exam_syllabus_id
      and exam_syllabi.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.lecture_notes
      where lecture_notes.id = ai_response_cache.lecture_note_id
      and lecture_notes.user_id = auth.uid()
    )
    or exists (
      select 1 from public.exam_syllabi
      where exam_syllabi.id = ai_response_cache.exam_syllabus_id
      and exam_syllabi.user_id = auth.uid()
    )
  );

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant select on public.profiles to anon;

alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;

alter default privileges in schema public
  grant usage, select on sequences to authenticated;

notify pgrst, 'reload schema';
