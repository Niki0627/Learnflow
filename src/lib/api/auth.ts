import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@lib/supabase/server";
import { createServiceClient } from "../supabase/service";
import type { Database } from "../types/database";
import { ApiError } from "./errors";

export interface AuthContext {
  user: User;
  /** User-scoped client — RLS applies. */
  supabase: SupabaseClient<Database>;
  /** Service-role client — bypasses RLS. Use ONLY for storage bucket ops. */
  get service(): SupabaseClient<Database>;
}

export function isNoRowsError(error: { code?: string } | null): boolean {
  return error?.code === "PGRST116";
}

/**
 * Authenticates a request using the cookie-based Supabase session.
 * Throws 401 ApiError if unauthenticated or session cannot be read.
 */
export async function getRequestContext(): Promise<AuthContext> {
  let supabase: SupabaseClient<Database>;
  try {
    supabase = await createClient();
  } catch {
    throw new ApiError("Unauthorized. Please sign in again.", 401, "UNAUTHORIZED");
  }

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
  const message = error instanceof Error ? error.message : "Unexpected API error.";
  return Response.json(
    { error: message, code: "INTERNAL" },
    { status: 500 },
  );
}

export type RouteHandler<TContext = unknown> = (
  ctx: AuthContext,
  req: Request,
  routeProps: { params: Promise<TContext> }
) => Promise<Response>;

/**
 * Higher-order function to wrap route handlers with authentication & error handling.
 * Automatically validates Supabase auth session and formats errors.
 */
export function withAuth<TContext = unknown>(handler: RouteHandler<TContext>) {
  return async (req: Request, routeProps?: { params: Promise<TContext> }): Promise<Response> => {
    try {
      const ctx = await getRequestContext();
      const props = routeProps ?? { params: Promise.resolve({} as TContext) };
      return await handler(ctx, req, props);
    } catch (error) {
      return apiError(error);
    }
  };
}
