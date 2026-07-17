import { apiError, getSupabaseRequestContext } from "../../../../../lib/api/auth";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const { user, supabase } = await getSupabaseRequestContext(request);
    const formData = await request.formData();
    const file = formData.get("file");
    const title = formData.get("title") || file?.name || "Exam Syllabus";
    let content = formData.get("content") || "";
    if (!content && file && typeof file.text === "function" && file.type?.startsWith("text/")) {
      content = await file.text();
    }
    const { data, error } = await supabase
      .from("exam_syllabi")
      .insert({
        user_id: user.id,
        title,
        content: content || `Uploaded syllabus: ${file?.name || title}. PDF extraction is pending in the Next migration.`,
        file_path: file?.name || null,
      })
      .select("*")
      .single();
    if (error) throw error;
    return Response.json(data, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
