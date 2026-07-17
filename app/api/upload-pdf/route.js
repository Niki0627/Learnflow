import { apiError, getSupabaseRequestContext } from "../../../lib/api/auth";
import { isSupabaseSchemaCacheError } from "../../../lib/api/supabase";
import { insertLectureDirect, toLecture } from "../../../lib/api/lectures";
import { extractUploadedFileText, getRequiredFile, readMultipartFormData } from "../../../lib/api/uploads";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const { user, supabase } = await getSupabaseRequestContext(request);
    const formData = await readMultipartFormData(request);
    const file = getRequiredFile(formData);
    const title = formData.get("title") || file?.name || "Uploaded Lecture";
    const content = await extractUploadedFileText(file);
    const payload = {
      user_id: user.id,
      title,
      content,
      file_path: file?.name || null,
    };

    const { data, error } = await supabase
      .from("lecture_notes")
      .insert(payload)
      .select("*")
      .single();
    if (error) {
      if (isSupabaseSchemaCacheError(error)) {
        const row = await insertLectureDirect(user.id, payload);
        return Response.json(toLecture(row), { status: 201 });
      }
      throw error;
    }
    return Response.json(data, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
