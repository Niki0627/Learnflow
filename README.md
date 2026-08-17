# LearnFlow

An AI-powered study workspace built with **Next.js 16** (App Router) and **Supabase**. Upload lecture notes, generate quizzes and flashcards, create study plans, prepare for exams, and chat with an AI tutor — all in one place.

## Tech Stack

| Category       | Technologies                                                                              |
| -------------- | ----------------------------------------------------------------------------------------- |
| Framework      | Next.js 16 (App Router, React 19)                                                         |
| UI             | Tailwind CSS 3, Radix UI, Framer Motion, Recharts, Lucide Icons                           |
| Auth           | Supabase Auth (email/password + Google OAuth)                                             |
| Database       | Supabase Postgres with Row-Level Security (RLS)                                           |
| AI Providers   | Google Gemini, Sarvam AI, OpenRouter (cascading fallback)                                 |
| Rate Limiting  | Upstash Redis & Ratelimit (with graceful local fallback)                                  |
| i18n           | i18next + react-i18next (English, Tamil, Hindi, French)                                   |
| PDF Processing | react-pdf, pdfjs-dist, react-dropzone                                                     |
| Testing        | Node.js Test Runner (Unit) + Playwright (E2E)                                             |
| Package Mgr    | pnpm 11                                                                                   |
| CI/CD          | GitHub Actions                                                                            |

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
- **Concept Coach** — AI tutor chat with Socratic step-by-step guidance and voice input
- **Notifications** — In-app notifications for quiz results, study reminders
- **Profile** — User profile with school, grade, subjects, preferences
- **Internationalization** — Full UI in English, Tamil, Hindi, French
- **Authentication** — Email/password, Google OAuth, protected routes, JWT session management

## Path Aliases

Standardized in `tsconfig.json`:

| Alias | Target Path | Purpose |
| --- | --- | --- |
| `@/*` | `./*` | Root relative imports |
| `@modules/*` | `./src/modules/*` | Feature modules (components, types, api) |
| `@lib/*` | `./src/lib/*` | Core server/client utilities, API client, Supabase, AI providers |
| `@components/*` | `./src/components/*` | Shared UI components |
| `@context/*` | `./src/context/*` | Global React context providers (AuthContext) |
| `@i18n/*` | `./src/i18n/*` | Localization configuration and locale bundles |

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
cp .env.example .env.local
```

Fill in your Supabase and AI provider credentials:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=/api/

# Required: Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Required: Primary AI
GEMINI_API_KEY=your-gemini-key

# Optional: Fallback AI providers
SARVAM_API_KEY=your-sarvam-key
OPENROUTER_API_KEY=your-openrouter-key
```

### Database

Apply the Supabase schema:

```bash
supabase/schema.sql
```

This creates 11 tables with Row-Level Security policies and a trigger for new user profile creation.

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Testing

```bash
# Run unit & integration tests
pnpm test

# Run unit tests only
pnpm test:unit

# Run Playwright E2E tests
pnpm test:e2e
```

## Build & Lint

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

## Directory Structure

```
src/
├── app/                  # Next.js App Router (pages and API routes)
│   ├── (app)/            # Protected authenticated app views (thin wrappers)
│   ├── (auth)/           # Authentication pages (login, register, google-login)
│   └── api/              # API route handlers with withAuth and rate limiting
├── modules/              # Self-contained feature modules (13 modules)
│   ├── concept-coach/
│   ├── dashboard/
│   ├── exam-preparation/
│   ├── flashcards/
│   ├── generate-questions/
│   ├── lectures/
│   ├── notes/
│   ├── profile/
│   ├── question-bank/
│   ├── quiz/
│   ├── study-plan/
│   ├── summarize/
│   └── weak-topics/
├── components/           # Shared global components (Navbar, Header, ProtectedRoute)
├── context/              # Context providers (AuthContext)
├── i18n/                 # Localization dictionaries
└── lib/                  # Central utilities, API client, Supabase, AI fallback
```
