import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import { createClient } from "../../utils/supabase/server";
import { createServiceClient } from "../supabase/service";
import type { Database } from "../types/database";
import { ApiError } from "./errors";

export interface AuthContext {
  user: User;
  /** User-scoped client — RLS applies. */
  supabase: SupabaseClient<Database>;
  /** Service-role client — bypasses RLS. Use only for storage ops. */
  get service(): SupabaseClient<Database>;
}

export function isNoRowsError(error: { code?: string } | null): boolean {
  return error?.code === "PGRST116";
}

/**
 * Authenticates a request using the cookie-based Supabase session.
 * Call this at the top of every protected API route.
 */
export async function getRequestContext(): Promise<AuthContext> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new ApiError("Unauthorized. Please sign in again.", 401, "UNAUTHORIZED");
  }

  let service: SupabaseClient<Database> | null = null;

  return {
    user,
    supabase,
    get service() {
      if (!service) service = createServiceClient();
      return service;
    },
  };
}

export function apiError(error: unknown): Response {
  if (error instanceof ApiError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.status },
    );
  }

  console.error("[api]", error);
  return Response.json(
    { error: "Unexpected API error.", code: "INTERNAL" },
    { status: 500 },
  );
}
