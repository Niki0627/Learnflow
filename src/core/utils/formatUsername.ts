export function formatUsername(usernameOrEmail?: string | null): string {
  if (!usernameOrEmail) return "User";
  let name = usernameOrEmail.split("@")[0];
  name = name.replace(/[0-9]+$/, "");
  if (name.length > 0) {
    name = name.charAt(0).toUpperCase() + name.slice(1);
  }
  return name || "User";
}
