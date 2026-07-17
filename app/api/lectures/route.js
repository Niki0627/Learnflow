import { apiError, getSupabaseRequestContext, isSupabaseSchemaCacheError } from "../../../lib/api/auth";
import { readJson } from "../../../lib/api/errors";
import { insertLectureDirect, listLecturesDirect, toLecture } from "../../../lib/api/lectures";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const { user, supabase } = await getSupabaseRequestContext(request);
    const { data, error } = await supabase
      .from("lecture_notes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      if (isSupabaseSchemaCacheError(error)) {
        const rows = await listLecturesDirect(user.id);
        return Response.json(rows.map(toLecture));
      }
      throw error;
    }

    return Response.json((data || []).map(toLecture));
  } catch (error) {
    if (isSupabaseSchemaCacheError(error)) {
      return Response.json([]);
    }

    return apiError(error);
  }
}

export async function POST(request) {
  try {
    const { user, supabase } = await getSupabaseRequestContext(request);
    const body = await readJson(request);

    const payload = {
      user_id: user.id,
      title: body.title || "Untitled Lecture",
      subject: body.subject || null,
      content: body.content || "",
      study_notes: body.study_notes || null,
      formulas: body.formulas || [],
      key_points: body.key_points || [],
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

    return Response.json(toLecture(data), { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
