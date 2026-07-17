# LearnFlow

LearnFlow is a Next.js + Supabase learning workspace for lecture notes, quizzes, flashcards, study planning, exam preparation, and AI tutoring.

## Tech Stack

- **App:** Next.js App Router
- **UI:** React, Material UI, Tailwind CSS
- **Auth:** Supabase Auth with email/password and Google OAuth
- **Database:** Supabase Postgres with row-level security
- **AI Providers:** Gemini, Sarvam, OpenRouter
- **API:** Next.js route handlers under `app/api`

## Features

- Supabase email/password login
- Supabase Google OAuth login
- Dashboard stats and notifications
- Lecture note creation and upload compatibility
- Sticky notes for lectures
- AI MCQ generation
- Quiz mode and quiz result tracking
- Question bank with search/filter
- Flashcard generation and review
- AI lecture summaries with Mermaid flowcharts
- Weak-topic tracking and explanation
- AI study plans
- Exam syllabus upload, previous-paper upload, likely questions, and strategy generation
- Concept Coach AI tutor
- Profile and study preferences
- English, Tamil, Hindi, and French locale files

## Setup

Install dependencies:

```bash
npm install
```

Create `.env.local`:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=/api/
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=

GEMINI_API_KEY=
SARVAM_API_KEY=
OPENROUTER_API_KEY=
```

Apply the Supabase schema from:

```bash
supabase/schema.sql
```

Run the app:

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Supabase OAuth

In Supabase Auth provider settings, enable Google and add:

```bash
http://localhost:3000/auth/callback
```

For production, also add the production callback URL.
