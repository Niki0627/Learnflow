import { createClient } from "@supabase/supabase-js";
import { ApiError } from "./errors.js";
import { isSupabaseSchemaCacheError } from "./supabase.js";
import { createSupabaseServiceClient, getSupabasePublicKey } from "../supabase/server";
export { isSupabaseSchemaCacheError } from "./supabase.js";

export async function getSupabaseRequestContext(request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    throw new ApiError("Missing bearer token.", 401, "UNAUTHORIZED");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = getSupabasePublicKey();

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new ApiError("Supabase public credentials are not configured.", 500, "SUPABASE_CONFIG");
  }

  const userClient = createClient(supabaseUrl, supabasePublishableKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error } = await userClient.auth.getUser(token);
  if (error || !data.user) {
    throw new ApiError(error?.message || "Invalid bearer token.", 401, "UNAUTHORIZED");
  }

  return {
    token,
    user: data.user,
    supabase: userClient,
    get serviceSupabase() {
      return createSupabaseServiceClient();
    },
  };
}

export function apiError(error) {
  const schemaCacheError = isSupabaseSchemaCacheError(error);
  const status = schemaCacheError ? 503 : error.status || 500;
  const message = schemaCacheError
    ? "Supabase database schema is not applied or API grants are missing. Run supabase/schema-cache-fix.sql in the Supabase SQL editor, then retry."
    : error.message || "Unexpected API error.";

  return Response.json(
    { error: message, code: schemaCacheError ? "SUPABASE_SCHEMA_CACHE" : error.code },
    { status },
  );
}
