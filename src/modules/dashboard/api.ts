import { api } from "@/src/core/api/client";
import type { DashboardStats, WeakTopicExplanation } from "./types";

export async function fetchDashboardStats(): Promise<DashboardStats> {
  return api.get<DashboardStats>("dashboard/stats/");
}

export async function explainWeakTopicApi(
  topic: string,
  subject: string,
  signal?: AbortSignal,
): Promise<{ data: WeakTopicExplanation }> {
  return api.post<{ data: WeakTopicExplanation }>(
    "weak-topic/explain/",
    { topic, subject },
    { signal },
  );
}
