import { withAuth } from "@lib/api/auth";
import { readJson } from "@lib/api/errors";

export const runtime = "nodejs";

export const GET = withAuth(async ({ user, supabase }) => {
  const [{ data: profileData, error }, attempts] = await Promise.all([
     
    (supabase.from("profiles") as any).select("*").eq("id", user.id).single(),
    supabase
      .from("quiz_attempts")
      .select("score,total_questions,completed_at")
      .eq("user_id", user.id),
  ]);
  if (error && error.code !== "PGRST116") throw error;
  if (attempts.error) throw attempts.error;

   
  const attemptRows: any[] = attempts.data || [];
  const totalScore = attemptRows.reduce((sum, row) => sum + Number(row.score || 0), 0);
  const totalQuestions = attemptRows.reduce(
    (sum, row) => sum + Number(row.total_questions || 0),
    0,
  );

   
  const data: any = profileData;
  return Response.json({
    id: user.id,
    email: user.email,
    username: data?.username || user.email,
    first_name: data?.first_name || "",
    last_name: data?.last_name || "",
    bio: data?.bio || "",
    school: data?.school || "",
    grade: data?.grade || "",
    subjects: data?.subjects || [],
    preferences: data?.preferences || {},
    profile: data || null,
    total_quizzes: attemptRows.length,
    average_score: totalQuestions ? Math.round((totalScore / totalQuestions) * 100) : 0,
    streak_days: 0,
  });
});

export const PUT = withAuth(async ({ user, supabase }, request) => {
  const body = await readJson(request);
  const payload = {
    id: user.id,
    username: body.username || body.email || user.email,
    first_name: body.first_name || "",
    last_name: body.last_name || "",
    bio: body.bio || "",
    school: body.school || "",
    grade: body.grade || "",
    subjects: body.subjects || [],
    preferences: body.preferences || {},
    updated_at: new Date().toISOString(),
  };

   
  const { data, error } = await (supabase.from("profiles") as any).upsert(payload).select("*").single();
  if (error) throw error;

  return Response.json(data);
});
