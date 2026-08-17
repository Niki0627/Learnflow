export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  hints: string[];
  is_error: boolean;
  time: string;
}

export interface ChatSession {
  id: number;
  preview: string;
  time: string;
  messageCount: number;
}

export interface AIChatResponse {
  response?: string;
  message?: string;
  hints?: string[];
  is_error?: boolean;
}
