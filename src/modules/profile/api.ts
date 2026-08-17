import { api } from "@lib/api-client";
import type { ProfileForm, ProfileResponse } from "./types";

export async function fetchProfile(): Promise<ProfileResponse> {
  return api.get<ProfileResponse>("profile/");
}

export async function saveProfile(data: Omit<ProfileForm, "subjects"> & { subjects: string[] }): Promise<void> {
  await api.put("profile/", data);
}
