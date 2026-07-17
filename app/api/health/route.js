import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    stack: "nextjs-supabase",
    aiProviders: {
      gemini: Boolean(process.env.GEMINI_API_KEY),
      sarvam: Boolean(process.env.SARVAM_API_KEY || process.env.SERVAM_API_KEY),
      openrouter: Boolean(process.env.OPENROUTER_API_KEY),
    },
    supabase: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    ),
  });
}
