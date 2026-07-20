# LearnFlow

An AI-powered study workspace built with **Next.js** and **Supabase**. Upload lecture notes, generate quizzes and flashcards, create study plans, prepare for exams, and chat with an AI tutor — all in one place.

## Tech Stack

| Category       | Technologies                                                                              |
| -------------- | ----------------------------------------------------------------------------------------- |
| Framework      | Next.js 16 (App Router, React 19)                                                         |
| UI             | Material UI, Tailwind CSS 3, shadcn/ui, Framer Motion, Recharts, Lucide + MUI Icons       |
| Auth           | Supabase Auth (email/password + Google OAuth)                                             |
| Database       | Supabase Postgres with Row-Level Security + direct `pg` pool                              |
| AI Providers   | Google Gemini, Sarvam AI, OpenRouter (cascading fallback)                                 |
| i18n           | i18next + react-i18next (English, Tamil, Hindi, French)                                   |
| PDF            | react-pdf, pdfjs-dist, react-dropzone                                                     |
| Package Mgr    | pnpm 11                                                                                   |
| Linting        | ESLint 9 (eslint-config-next)                                                             |

## Features

- **Dashboard** — Analytics with charts (area, bar, radar, pie), stat cards, weak topics, recent activity, skill radar, score distribution
- **Lectures** — Upload PDF/text notes, PDF viewer, markdown rendering, sticky notes sidebar, text selection, topic tagging
- **Quiz System** — AI-generated MCQs from lectures, full-screen quiz mode with timer, flagging, navigation, attempt tracking and score distribution
- **Question Bank** — Search, filter, and browse all generated questions across lectures
- **Flashcards** — SM-2 spaced repetition with Again/Hard/Good/Easy ratings, flip animation, session stats
- **AI Summaries** — Lecture summarization with Mermaid flowcharts, key points, formula extraction
- **Weak Topics** — AI-identified weak areas with explanations and targeted practice
- **Study Plans** — AI-generated study plans with exam date, hours/week, priority topics
- **Exam Preparation** — Syllabus upload, previous papers, likely question prediction, strategy generation
- **Concept Coach** — AI tutor chat with Socratic step-by-step guidance
- **Notifications** — In-app notifications for quiz results, study reminders
- **Profile** — User profile with school, grade, subjects, preferences
- **Internationalization** — Full UI in English, Tamil, Hindi, French
- **Authentication** — Email/password, Google OAuth, protected routes, JWT session management

## Project Architecture

```
app/[[...slug]]/page.js         ← catch-all Next.js route
  └── ClientApp.js              ← dynamic client-side entry (ssr: false)
        └── src/App.js          ← React SPA with react-router-dom
              ├── Public: /, /login, /register
              └── Protected: /dashboard, /lectures, /quiz, /flashcards,
                             /study-plan, /exam-preparation, /concept-coach,
                             /summarize, /weak-topics, /question-bank, /profile
                            └── src/views/* (21 page components)
                                  └── src/components/ui/* (20 reusable components)
                                        └── src/api/api.js (Axios)
                                              └── app/api/*/route.js
                                                    └── lib/api/*, lib/ai/*
                                                          └── Supabase / PG / AI
```

## Setup

### Prerequisites

- Node.js 20+
- pnpm 11+ (`npm install -g pnpm`)
- Supabase project
- API keys for at least one AI provider (Gemini, Sarvam, or OpenRouter)

### Install dependencies

```bash
pnpm install
```

### Environment variables

Copy `.env.example` to `.env.local`:

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

### Database

Apply the Supabase schema:

```bash
supabase/schema.sql
```

This creates 11 tables with Row-Level Security policies and a trigger for new user profile creation.

### Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Scripts

| Script  | Command        |
| ------- | -------------- |
| dev     | `next dev`     |
| build   | `next build`   |
| start   | `next start`   |
| lint    | `eslint .`     |

## Supabase OAuth

In your Supabase dashboard under Auth → Providers → Google, add:

- `http://localhost:3000/auth/callback` (development)
- Your production callback URL

## Directory Structure

| Path                  | Description                              |
| --------------------- | ---------------------------------------- |
| `app/api/`            | Next.js API route handlers (20+ routes)  |
| `app/auth/`           | Auth callback handler                    |
| `lib/`                | Server-side logic (AI, DB, API helpers)  |
| `src/views/`          | Page components (21 views)               |
| `src/components/ui/`  | Reusable UI components (20)              |
| `src/context/`        | React context providers (Auth, Theme)    |
| `src/i18n/locales/`   | Translation files (en, ta, hi, fr)      |
| `src/api/`            | Axios client with auth interceptor       |
| `supabase/`           | Database schema and migrations           |
| `utils/supabase/`     | SSR Supabase client factories            |
