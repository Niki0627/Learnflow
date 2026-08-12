import { apiError, getRequestContext } from "@lib/api/auth";
import {
  extractUploadedFileText,
  getRequiredFile,
  readMultipartFormData,
} from "@lib/api/uploads";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { user, supabase } = await getRequestContext();
    const formData = await readMultipartFormData(request);
    const file = getRequiredFile(formData);
    const title = (formData.get("title") as string) || file?.name || "Exam Syllabus";
    const content =
      (formData.get("content") as string) || (await extractUploadedFileText(file));

    const { data, error } = await (supabase
      .from("exam_syllabi") as any)
      .insert({
        user_id: user.id,
        title,
        content,
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
