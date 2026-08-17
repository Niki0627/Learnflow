import { NextResponse } from "next/server";
import { withAuth } from "@lib/api/auth";
import { checkRateLimit } from "@lib/api/ratelimit";
import {
  generateQuestionsForLecture,
  getOwnedLecture,
  normalizeQuestion,
} from "@lib/api/learnflow";
import { readJson } from "@lib/api/errors";

export const runtime = "nodejs";

export const POST = withAuth(async ({ user, supabase }, request) => {
  const rateLimit = await checkRateLimit(request, user.id);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const body = await readJson(request);
  const count = Math.max(1, Math.min(50, Number(body.count || 10)));
  const lecture = await getOwnedLecture(supabase, user.id, body.note_id);
  const generated = await generateQuestionsForLecture(lecture, count);
  const rows = generated.map((question) => normalizeQuestion(question, lecture.id));

   
  const { data, error } = await (supabase.from("questions") as any).insert(rows).select("*");
  if (error) throw error;

  return Response.json({ questions: data || [], mcqs: data || [] });
});
