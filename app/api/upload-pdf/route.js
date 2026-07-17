import { apiError, getSupabaseRequestContext } from "../../../lib/api/auth";
import { isSupabaseSchemaCacheError } from "../../../lib/api/supabase";
import { insertLectureDirect, toLecture } from "../../../lib/api/lectures";
import { extractUploadedFileText, getRequiredFile, readMultipartFormData } from "../../../lib/api/uploads";
import { createSupabaseServiceClient } from "../../../lib/supabase/server";

export const runtime = "nodejs";

/**
 * Upload a PDF to Supabase Storage using the service role client (bypasses RLS/bucket policies).
 * Returns the public URL or null if storage is not configured.
 */
async function uploadToStorage(fileBuffer, safeName, contentType) {
  let serviceClient;
  try {
    serviceClient = createSupabaseServiceClient();
  } catch {
    // SUPABASE_SERVICE_ROLE_KEY not set — storage is not available
    return null;
  }

  // Auto-create the public bucket if it doesn't exist yet
  try {
    await serviceClient.storage.createBucket("lectures", { public: true });
  } catch {
    // Bucket already exists — that's fine, ignore
  }

  const { data: uploadData, error: uploadError } = await serviceClient.storage
    .from("lectures")
    .upload(safeName, fileBuffer, {
      contentType: contentType || "application/pdf",
      upsert: false,
    });

  if (uploadError) {
    console.error("[upload-pdf] Storage upload error:", uploadError.message);
    return null;
  }

  if (!uploadData?.path) return null;

  const { data: urlData } = serviceClient.storage
    .from("lectures")
    .getPublicUrl(uploadData.path);

  return urlData?.publicUrl || null;
}

export async function POST(request) {
  try {
    const { user, supabase } = await getSupabaseRequestContext(request);
    const formData = await readMultipartFormData(request);
    const file = getRequiredFile(formData);
    const title = formData.get("title") || file?.name || "Uploaded Lecture";

    // Extract text content for AI study aids
    const content = await extractUploadedFileText(file);

    // Upload the actual file to Supabase Storage using the service role client
    const fileBuffer = await file.arrayBuffer();
    const safeName = `${user.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const filePublicUrl = await uploadToStorage(fileBuffer, safeName, file.type);

    const payload = {
      user_id: user.id,
      title,
      content,
      // Only store the URL (not the raw filename) — null means no preview available
      file_path: filePublicUrl || null,
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

    return Response.json({ ...data, storageEnabled: Boolean(filePublicUrl) }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
