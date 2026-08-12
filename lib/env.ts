import { z } from "zod";

const serverEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_API_BASE_URL: z.string().default("/api/"),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  GEMINI_API_KEY: z.string().optional(),
  SARVAM_API_KEY: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

function parseEnv() {
  const result = serverEnvSchema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.issues
      .map((issue) => issue.path.join("."))
      .join(", ");
    // Only warn — app still boots so development without AI keys stays possible.
    console.warn(`[env] Invalid or missing environment variables: ${missing}`);
    return process.env as Record<string, string | undefined>;
  }
  return result.data;
}

export const env = parseEnv();

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
