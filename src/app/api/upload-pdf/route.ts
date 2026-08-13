import { apiError, getRequestContext } from "@lib/api/auth";
import {
  extractUploadedFileText,
  getRequiredFile,
  readMultipartFormData,
} from "@lib/api/uploads";
import { toLecture } from "@lib/api/learnflow";
import { getServiceClientOrNull } from "@lib/supabase/service";

export const runtime = "nodejs";

const ALLOWED_MIME_TYPES = ["application/pdf", "text/plain"];

async function uploadToStorage(
  fileBuffer: ArrayBuffer,
  safeName: string,
  contentType: string,
): Promise<string | null> {
  const serviceClient = getServiceClientOrNull();
  if (!serviceClient) return null;

  try {
    await serviceClient.storage.createBucket("lectures", { public: false });
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

  return uploadData?.path || null;
}

export async function POST(request: Request) {
  try {
    const { user, supabase } = await getRequestContext();
    const formData = await readMultipartFormData(request);
    const file = getRequiredFile(formData);

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return Response.json(
        { error: "Unsupported file type. Only PDF and text files are allowed." },
        { status: 400 },
      );
    }

    const title = (formData.get("title") as string) || file?.name || "Uploaded Lecture";

    const content = await extractUploadedFileText(file);

    const fileBuffer = await file.arrayBuffer();
    const safeName = `${user.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const filePath = await uploadToStorage(fileBuffer, safeName, file.type);

    const payload = {
      user_id: user.id,
      title,
      content,
      file_path: filePath || null,
    };

    const { data, error } = await (supabase
      .from("lecture_notes") as any)
      .insert(payload)
      .select("*")
      .single();

    if (error) throw error;

    let signedUrl = filePath;
    if (filePath) {
      const { data: urlData } = await getServiceClientOrNull()!
        .storage.from("lectures")
        .createSignedUrl(filePath, 60 * 60);
      signedUrl = urlData?.signedUrl || filePath;
    }

    return Response.json(
      { ...toLecture(data), file_path: signedUrl, storageEnabled: Boolean(filePath) },
      { status: 201 },
    );
  } catch (error) {
    return apiError(error);
  }
}
