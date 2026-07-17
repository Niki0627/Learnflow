import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/";

const API = axios.create({
  baseURL: BASE_URL,
});

// Request interceptor - attach token to all requests
API.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined") {
      try {
        const { supabase } = await import("../../lib/supabase/client");
        if (supabase) {
          const { data } = await supabase.auth.getSession();
          const supabaseToken = data.session?.access_token;
          if (supabaseToken) {
            config.headers.Authorization = `Bearer ${supabaseToken}`;
            return config;
          }
        }
      } catch {
        // Continue without an auth header; the API route will return 401 if needed.
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      try {
        const { supabase } = await import("../../lib/supabase/client");
        await supabase?.auth.signOut();
      } catch {
        // Ignore sign-out failures; the request error is still returned below.
      }
    }

    return Promise.reject(error);
  }
);

export default API;
