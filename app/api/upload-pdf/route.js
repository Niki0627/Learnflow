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

    // Extract text content for AI study aids
    const content = await extractUploadedFileText(file);

    // Upload the actual file to Supabase Storage so the PDF can be previewed
    let filePublicUrl = null;
    try {
      const fileBuffer = await file.arrayBuffer();
      const safeName = `${user.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("lectures")
        .upload(safeName, fileBuffer, {
          contentType: file.type || "application/pdf",
          upsert: false,
        });

      if (!uploadError && uploadData?.path) {
        const { data: urlData } = supabase.storage
          .from("lectures")
          .getPublicUrl(uploadData.path);
        filePublicUrl = urlData?.publicUrl || null;
      }
    } catch {
      // If storage upload fails, still save text content — no PDF preview, but AI aids work
    }

    const payload = {
      user_id: user.id,
      title,
      content,
      file_path: filePublicUrl || file?.name || null,
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
