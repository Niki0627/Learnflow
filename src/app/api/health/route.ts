import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    stack: "nextjs-supabase",
  });
}
