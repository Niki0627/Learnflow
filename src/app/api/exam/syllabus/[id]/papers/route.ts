import { withAuth } from "@lib/api/auth";
import { extractUploadedFileText, getFiles, readMultipartFormData } from "@lib/api/uploads";
import { badRequest } from "@lib/api/errors";

export const runtime = "nodejs";

export const POST = withAuth<{ id: string }>(async ({ user, supabase }, request, { params }) => {
  const { id } = await params;
  const { data: syllabusRow, error: syllabusError } = await supabase
    .from("exam_syllabi")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (syllabusError) throw syllabusError;
   
  const syllabus: any = syllabusRow;

  const formData = await readMultipartFormData(request);
  const files = getFiles(formData, "files");
  if (!files.length) {
    const singleFile = formData.get("file");
    if (singleFile && typeof singleFile === "object" && "arrayBuffer" in singleFile) {
      files.push(singleFile as File);
    }
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

   
  const { data, error } = await (supabase
    .from("previous_question_papers") as any)
    .insert(rows)
    .select("*");
  if (error) throw error;
  return Response.json(
    { uploaded_count: data?.length || rows.length, papers: data || [] },
    { status: 201 },
  );
});
