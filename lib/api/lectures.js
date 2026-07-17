import { query } from "../db/postgres.js";

export function toLecture(row) {
  return {
    id: row.id,
    title: row.title,
    subject: row.subject,
    file: row.file_path,
    content: row.content,
    created_at: row.created_at,
    study_notes: row.study_notes,
    formulas: row.formulas || [],
    key_points: row.key_points || [],
  };
}

export async function insertLectureDirect(userId, payload) {
  const result = await query(
    `insert into public.lecture_notes
      (user_id, title, subject, content, study_notes, formulas, key_points, file_path)
     values ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8)
     returning *`,
    [
      userId,
      payload.title || "Untitled Lecture",
      payload.subject || null,
      payload.content || "",
      payload.study_notes || null,
      JSON.stringify(payload.formulas || []),
      JSON.stringify(payload.key_points || []),
      payload.file_path || null,
    ],
  );

  return result.rows[0];
}

export async function listLecturesDirect(userId) {
  const result = await query(
    `select * from public.lecture_notes
     where user_id = $1
     order by created_at desc`,
    [userId],
  );
  return result.rows;
}
