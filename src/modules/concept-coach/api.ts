import { api } from "@/src/core/api/client";
import type { AIChatResponse } from "./types";

export interface ChatHistoryEntry {
  role: "user" | "assistant";
  content: string;
}

export async function sendChatMessage(
  message: string,
  chatHistory: ChatHistoryEntry[],
  signal?: AbortSignal,
): Promise<AIChatResponse> {
  const data = await api.post<AIChatResponse | string>(
    "/ai-tutor/chat/",
    { message, chat_history: chatHistory },
    { signal },
  );
  if (typeof data === "string") {
    return { response: data, hints: [], is_error: false };
  }
  return data as AIChatResponse;
}
