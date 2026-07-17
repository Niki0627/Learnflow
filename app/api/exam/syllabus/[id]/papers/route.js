import { apiError, getSupabaseRequestContext } from "../../../../../../lib/api/auth";
import { extractUploadedFileText, getFiles, readMultipartFormData } from "../../../../../../lib/api/uploads";
import { badRequest } from "../../../../../../lib/api/errors";

export const runtime = "nodejs";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const { user, supabase } = await getSupabaseRequestContext(request);
    const { data: syllabus, error: syllabusError } = await supabase
      .from("exam_syllabi")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    if (syllabusError) throw syllabusError;

    const formData = await readMultipartFormData(request);
    const files = getFiles(formData, "files");
    if (!files.length) {
      const singleFile = formData.get("file");
      if (singleFile && typeof singleFile.arrayBuffer === "function") files.push(singleFile);
    }

    if (!files.length) throw badRequest("Please choose at least one previous paper.");

    const rows = [];
    for (const file of files) {
      rows.push({
        exam_syllabus_id: syllabus.id,
        file_path: file?.name || "previous-paper",
        content: await extractUploadedFileText(file),
      });
    }

    const { data, error } = await supabase
      .from("previous_question_papers")
      .insert(rows)
      .select("*");
    if (error) throw error;
    return Response.json({ uploaded_count: data?.length || rows.length, papers: data || [] }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
