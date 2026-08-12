const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/";

export class ApiClientError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status = 500, code?: string) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
  }
}

export interface RequestConfig {
  signal?: AbortSignal;
  formData?: FormData;
  headers?: Record<string, string>;
}

async function request<T>(
  path: string,
  method: string,
  body?: unknown,
  config?: RequestConfig,
): Promise<T> {
  const headers: Record<string, string> = {
    ...(config?.headers || {}),
  };
  if (body !== undefined && !config?.formData) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    signal: config?.signal,
    headers,
    body: config?.formData
      ? config.formData
      : body !== undefined
        ? JSON.stringify(body)
        : undefined,
  });

  if (!res.ok) {
    if (res.status === 401) {
      // Notify auth context so it can clear the session.
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("lf:unauthorized"));
      }
    }
    let data: { error?: string; code?: string } | null = null;
    try {
      data = await res.json();
    } catch {
      // ignore parse errors
    }
    throw new ApiClientError(
      data?.error || `Request failed (${res.status}).`,
      res.status,
      data?.code,
    );
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string, config?: RequestConfig): Promise<T> =>
    request<T>(path, "GET", undefined, config),
  post: <T>(
    path: string,
    body?: unknown,
    config?: RequestConfig,
  ): Promise<T> => request<T>(path, "POST", body, config),
  put: <T>(
    path: string,
    body?: unknown,
    config?: RequestConfig,
  ): Promise<T> => request<T>(path, "PUT", body, config),
  delete: <T>(path: string, config?: RequestConfig): Promise<T> =>
    request<T>(path, "DELETE", undefined, config),
};
