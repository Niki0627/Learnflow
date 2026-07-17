# LearnFlow Next.js + Supabase Migration Plan

## Target Architecture

- **Frontend/App:** Next.js App Router at the repository root.
- **Auth:** Supabase Auth with email/password first; OAuth can move from Django Allauth to Supabase OAuth providers.
- **Database:** Supabase Postgres with row-level security for all user-owned study data.
- **Storage:** Supabase Storage buckets for lecture notes, syllabi, previous papers, avatars, and generated media.
- **API:** Next.js route handlers under `/api/*`; existing React screens continue to call `/api/...` while endpoints are replaced incrementally.
- **AI Providers:** Server-side provider registry with ordered fallback: Gemini, Sarvam, OpenRouter. API keys never reach the browser.

## Current Stack Inventory

- Django REST Framework backend in `backend/` and `core/`.
- SQLite database with Django models for lecture notes, questions, flashcards, sticky notes, progress, notifications, exam prep, and AI cache.
- Create React App frontend in `frontend/src`.
- JWT auth and Google auth currently depend on Django.
- Existing AI utility supports Gemini, Groq, and OpenRouter; new target is Gemini, Sarvam, and OpenRouter.

## Migration Phases

1. **Foundation**
   - Make root `package.json` the Next.js app entrypoint.
   - Add App Router shell that renders existing React pages as client components.
   - Move global CSS imports into `app/layout.js`.
   - Add Supabase browser/server clients and environment template.
   - Add `/api/health`, `/api/ai/generate`, and `/api/ai-tutor/chat`.

2. **Supabase Data Model**
   - Create Postgres tables matching the Django models.
   - Enable RLS on all user-owned tables.
   - Add Supabase Storage buckets:
     - `lecture-notes`
     - `exam-syllabi`
     - `previous-papers`
     - `avatars`
     - `generated-media`
   - Run the schema in `supabase/schema.sql`.

3. **Auth Migration**
   - Replace Django JWT localStorage tokens with Supabase sessions.
   - Convert login/register/profile flows to Supabase Auth and `profiles`.
   - Configure Google OAuth inside Supabase and replace `GoogleLogin.js`.

4. **Endpoint Replacement Order**
   - Low-risk CRUD first: `profile/`, `notifications/`, `lectures/`, `sticky-notes/`.
   - Learning workflows next: `generate-mcqs/`, `quiz/`, `submit-mcq/`, `quiz-completed/`, `weak-topics/`, `dashboard/stats/`.
   - AI workflows after provider validation: summarization, flashcards, study plans, concept coach, assignment evaluator.
   - File-heavy workflows last: PDF upload/extraction, exam syllabi, previous papers, generated video/media.

5. **Data Migration**
   - Export Django SQLite records to JSON or CSV.
   - Create an ID mapping for Django integer user IDs to Supabase auth UUIDs.
   - Upload files from `notes/`, `syllabi/`, and `previous_papers/` into Supabase Storage.
   - Import rows into Supabase, preserving old IDs where practical in auxiliary mapping columns if needed.

6. **Decommission Django**
   - Remove Django-only auth refresh logic after all `/api/*` routes are implemented in Next.
   - Keep `legacy:*` scripts until production parity is verified.
   - Archive `backend/`, `core/`, `requirements.txt`, and `manage.py` after the migration test suite passes.

## Verification Checklist

- `npm run build` passes.
- `/api/health` reports Supabase and AI provider configuration.
- Login/register uses Supabase sessions.
- A signed-in user can create a lecture, generate questions, take a quiz, review flashcards, and view dashboard stats.
- RLS prevents cross-user reads and writes.
- No browser bundle includes private AI or Supabase service keys.
