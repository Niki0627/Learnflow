export function isSupabaseSchemaCacheError(error) {
  const message = error?.message || "";
  return (
    error?.code === "PGRST205" ||
    message.includes("schema cache") ||
    message.includes("Could not find the table")
  );
}

export function isNoRowsError(error) {
  return error?.code === "PGRST116";
}

export function emptyOnSchemaCache(error, value) {
  if (isSupabaseSchemaCacheError(error)) {
    return Response.json(value);
  }
  return null;
}
