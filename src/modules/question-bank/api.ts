import { api } from "@/src/core/api/client";
import type { BankQuestion } from "./types";

export async function fetchAllQuestions(): Promise<BankQuestion[]> {
  try {
    const data = await api.get<BankQuestion[]>("questions/all/");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
