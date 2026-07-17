import { apiError, getSupabaseRequestContext } from "../../../../../../lib/api/auth";

export const runtime = "nodejs";

export async function POST(request, { params }) {
  try {
    const { user, supabase } = await getSupabaseRequestContext(request);
    const { data: syllabus, error: syllabusError } = await supabase
      .from("exam_syllabi")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();
    if (syllabusError) throw syllabusError;

    const formData = await request.formData();
    const file = formData.get("file");
    let content = "";
    if (file && typeof file.text === "function" && file.type?.startsWith("text/")) {
      content = await file.text();
    }
    const { data, error } = await supabase
      .from("previous_question_papers")
      .insert({
        exam_syllabus_id: syllabus.id,
        file_path: file?.name || "previous-paper",
        content: content || `Uploaded previous paper: ${file?.name || "file"}.`,
      })
      .select("*")
      .single();
    if (error) throw error;
    return Response.json(data, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
