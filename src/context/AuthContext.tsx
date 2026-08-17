// Re-export from core/auth for backward compatibility.
// New code should import from @/src/core/auth instead.
export { AuthProvider, useAuth } from "@/src/core/auth/context";
export type { AuthUser } from "@/src/core/auth/context";
