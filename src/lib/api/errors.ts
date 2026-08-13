export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status = 500, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function badRequest(message: string): ApiError {
  return new ApiError(message, 400, "BAD_REQUEST");
}

export function notFound(message = "Resource not found."): ApiError {
  return new ApiError(message, 404, "NOT_FOUND");
}

export function forbidden(
  message = "You do not have access to this resource.",
): ApiError {
  return new ApiError(message, 403, "FORBIDDEN");
}

export function requireNumericId(value: unknown, label = "id"): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw badRequest(`A valid ${label} is required.`);
  }
  return id;
}

export async function readJson(request: Request): Promise<Record<string, any>> {
  try {
    return await request.json();
  } catch {
    throw badRequest("Request body must be valid JSON.");
  }
}
