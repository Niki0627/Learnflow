import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatUsername(usernameOrEmail) {
  if (!usernameOrEmail) return "User";
  let name = usernameOrEmail.split('@')[0];
  name = name.replace(/[0-9]+$/, '');
  if (name.length > 0) {
    name = name.charAt(0).toUpperCase() + name.slice(1);
  }
  return name || "User";
}
