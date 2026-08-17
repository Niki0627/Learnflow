import { withAuth } from "@lib/api/auth";

export const runtime = "nodejs";

export const GET = withAuth(async ({ user, supabase }) => {
  const [lectures, flashcards, quizAttempts, notifications] = await Promise.all([
    supabase
      .from("lecture_notes")
      .select("id,title,subject,created_at")
      .eq("user_id", user.id),
    supabase
      .from("flashcards")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("quiz_attempts")
      .select("score,total_questions,completed_at,lecture_notes(subject,title)")
      .eq("user_id", user.id),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false),
  ]);

  for (const result of [lectures, flashcards, quizAttempts, notifications]) {
    if (result.error) throw result.error;
  }

   
  const lectureRows: any[] = lectures.data || [];
   
  const attempts: any[] = quizAttempts.data || [];
  const totalScore = attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0);
  const totalQuestions = attempts.reduce(
    (sum, attempt) => sum + (attempt.total_questions || 0),
    0,
  );
  const averageScore = totalQuestions
    ? Math.round((totalScore / totalQuestions) * 100)
    : 0;

  const subjectBuckets = new Map<string, { subject: string; lectures: number; score: number; total: number }>();
  for (const lecture of lectureRows) {
    const subject = lecture.subject || "General";
    if (!subjectBuckets.has(subject))
      subjectBuckets.set(subject, { subject, lectures: 0, score: 0, total: 0 });
    subjectBuckets.get(subject)!.lectures += 1;
  }
  for (const attempt of attempts) {
    const subject = attempt.lecture_notes?.subject || "General";
    if (!subjectBuckets.has(subject))
      subjectBuckets.set(subject, { subject, lectures: 0, score: 0, total: 0 });
    const bucket = subjectBuckets.get(subject)!;
    bucket.score += Number(attempt.score || 0);
    bucket.total += Number(attempt.total_questions || 0);
  }

  const masteryData = Array.from(subjectBuckets.values()).map((bucket) => ({
    subject: bucket.subject,
    percentage: bucket.total ? Math.round((bucket.score / bucket.total) * 100) : 0,
  }));

  const weakTopics = masteryData
    .filter((item) => item.percentage < 70)
    .map((item) => ({
      topic: item.subject,
      subject: item.subject,
      score: item.percentage ? 1 - item.percentage / 100 : 0.5,
    }));

  const scoreDistribution = [
    {
      name: "Excellent (>90%)",
      value: attempts.filter(
        (a) => (a.score || 0) / Math.max(a.total_questions || 1, 1) >= 0.9,
      ).length,
    },
    {
      name: "Good (70-90%)",
      value: attempts.filter((a) => {
        const pct = (a.score || 0) / Math.max(a.total_questions || 1, 1);
        return pct >= 0.7 && pct < 0.9;
      }).length,
    },
    {
      name: "Average (50-70%)",
      value: attempts.filter((a) => {
        const pct = (a.score || 0) / Math.max(a.total_questions || 1, 1);
        return pct >= 0.5 && pct < 0.7;
      }).length,
    },
    {
      name: "Weak (<50%)",
      value: attempts.filter(
        (a) => (a.score || 0) / Math.max(a.total_questions || 1, 1) < 0.5,
      ).length,
    },
  ];

  const recentUploads = lectureRows.slice(0, 3).map((lecture) => ({
    type: "upload",
    title: lecture.title,
    description: lecture.subject || "Lecture note",
    date: lecture.created_at,
  }));
  const recentQuizzes = attempts.slice(-3).reverse().map((attempt) => ({
    type: "quiz",
    title: attempt.lecture_notes?.title || "Quiz completed",
    description: `${attempt.score || 0}/${attempt.total_questions || 0}`,
    date: attempt.completed_at,
  }));

  return Response.json({
    total_lectures: lectureRows.length,
    total_flashcards: flashcards.count || 0,
    quiz_attempts: attempts.length,
    unread_notifications: notifications.count || 0,
    average_score: averageScore,
    avg_score: averageScore,
    study_time: `${Math.floor((lectureRows.length * 20 + attempts.length * 10) / 60)}h ${(lectureRows.length * 20 + attempts.length * 10) % 60}m`,
    questions_answered: totalQuestions,
    topics_mastered: masteryData.filter((item) => item.percentage >= 80).length,
    streak: attempts.length ? 1 : 0,
    mastery_data: masteryData,
    weak_topics: weakTopics,
    recent_activity: [...recentQuizzes, ...recentUploads]
      .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
      .slice(0, 5),
    weekly_activity: [],
    quiz_scores: attempts.slice(-10).map((attempt, index) => ({
      name: `Quiz ${index + 1}`,
      score: Math.round(
        ((attempt.score || 0) / Math.max(attempt.total_questions || 1, 1)) * 100,
      ),
    })),
    score_distribution: scoreDistribution,
    skill_radar: [
      { skill: "Recall", score: averageScore },
      { skill: "Comprehension", score: averageScore },
      { skill: "Application", score: Math.max(0, averageScore - 5) },
      { skill: "Analysis", score: Math.max(0, averageScore - 10) },
      { skill: "Synthesis", score: Math.max(0, averageScore - 8) },
      { skill: "Evaluation", score: Math.max(0, averageScore - 6) },
    ],
  });
});
