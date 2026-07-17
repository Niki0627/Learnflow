export class ApiError extends Error {
  constructor(message, status = 500, code) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function badRequest(message) {
  return new ApiError(message, 400, "BAD_REQUEST");
}

export function notFound(message = "Resource not found.") {
  return new ApiError(message, 404, "NOT_FOUND");
}

export function forbidden(message = "You do not have access to this resource.") {
  return new ApiError(message, 403, "FORBIDDEN");
}

export function requireNumericId(value, label = "id") {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw badRequest(`A valid ${label} is required.`);
  }
  return id;
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    throw badRequest("Request body must be valid JSON.");
  }
}
