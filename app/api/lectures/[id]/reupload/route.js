import { apiError, getSupabaseRequestContext } from "../../../../../lib/api/auth";
import { getRequiredFile, readMultipartFormData } from "../../../../../lib/api/uploads";
import { createSupabaseServiceClient } from "../../../../../lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const { user, supabase } = await getSupabaseRequestContext(request);

    // Verify the lecture belongs to the user
    const { data: lecture, error: fetchError } = await supabase
      .from("lecture_notes")
      .select("id, user_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !lecture) {
      return Response.json({ error: "Lecture not found." }, { status: 404 });
    }

    const formData = await readMultipartFormData(request);
    const file = getRequiredFile(formData);

    // Use service role client for storage upload
    let serviceClient;
    try {
      serviceClient = createSupabaseServiceClient();
    } catch {
      return Response.json({ error: "Storage is not configured (SUPABASE_SERVICE_ROLE_KEY missing)." }, { status: 503 });
    }

    // Auto-create bucket if it doesn't exist
    try {
      await serviceClient.storage.createBucket("lectures", { public: true });
    } catch {
      // Already exists — fine
    }

    const fileBuffer = await file.arrayBuffer();
    const safeName = `${user.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

    const { data: uploadData, error: uploadError } = await serviceClient.storage
      .from("lectures")
      .upload(safeName, fileBuffer, {
        contentType: file.type || "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      return Response.json({ error: `Storage upload failed: ${uploadError.message}` }, { status: 500 });
    }

    const { data: urlData } = serviceClient.storage
      .from("lectures")
      .getPublicUrl(uploadData.path);

    const filePublicUrl = urlData?.publicUrl;
    if (!filePublicUrl) {
      return Response.json({ error: "Failed to get public URL after upload." }, { status: 500 });
    }

    // Update the lecture record with the new storage URL
    const { error: updateError } = await supabase
      .from("lecture_notes")
      .update({ file_path: filePublicUrl })
      .eq("id", id)
      .eq("user_id", user.id);

    if (updateError) throw updateError;

    return Response.json({ ok: true, file_path: filePublicUrl });
  } catch (error) {
    return apiError(error);
  }
}
