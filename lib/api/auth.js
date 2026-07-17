import { createClient } from "@supabase/supabase-js";
import { createSupabaseServiceClient, getSupabasePublicKey } from "../supabase/server";

export async function getSupabaseRequestContext(request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    const error = new Error("Missing bearer token.");
    error.status = 401;
    throw error;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = getSupabasePublicKey();

  if (!supabaseUrl || !supabasePublishableKey) {
    const error = new Error("Supabase public credentials are not configured.");
    error.status = 500;
    throw error;
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
    const authError = new Error(error?.message || "Invalid bearer token.");
    authError.status = 401;
    throw authError;
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
  return Response.json(
    { error: error.message || "Unexpected API error." },
    { status: error.status || 500 },
  );
}
