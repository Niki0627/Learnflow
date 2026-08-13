const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite"];
const OPENROUTER_MODELS = [
  "google/gemini-2.5-flash",
  "openai/gpt-4.1-mini",
  "meta-llama/llama-3.3-70b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
];
const SARVAM_MODELS = ["sarvam-m"];

export interface AIContentResult {
  text: string;
  provider: string;
  model: string;
}

export interface AIGenerationOptions {
  temperature?: number;
  maxTokens?: number;
  models?: string[];
  providerOrder?: ("gemini" | "sarvam" | "openrouter")[];
}

type ProviderFn = (prompt: string, options: AIGenerationOptions) => Promise<AIContentResult>;

async function postJson(
  url: string,
  payload: Record<string, unknown>,
  headers: Record<string, string> = {},
  timeoutMs = 90000,
): Promise<any> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const text = await response.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      const message =
        data?.error?.message || data?.message || text || response.statusText;
      const error = new Error(message) as Error & { status: number };
      error.status = response.status;
      throw error;
    }

    return data;
  } finally {
    clearTimeout(timeout);
  }
}

function isRetryableStatus(status: number | undefined): boolean {
  return [400, 404, 429, 503].includes(status ?? 0);
}

async function callGemini(prompt: string, options: AIGenerationOptions = {}): Promise<AIContentResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

  const models = options.models || GEMINI_MODELS;
  let lastError: unknown;

  for (const model of models) {
    try {
      const data = await postJson(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: options.temperature ?? 0.7,
            maxOutputTokens: options.maxTokens ?? 1600,
          },
        },
      );
      const text = data?.candidates?.[0]?.content?.parts
        ?.map((part: any) => part.text || "")
        .join("")
        .trim();
      if (text) return { text, provider: "gemini", model };
    } catch (error: any) {
      lastError = error;
      if (!isRetryableStatus(error?.status)) break;
    }
  }

  throw lastError || new Error("Gemini returned no content.");
}

async function callOpenRouter(prompt: string, options: AIGenerationOptions = {}): Promise<AIContentResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured.");

  const models = options.models || OPENROUTER_MODELS;
  let lastError: unknown;

  for (const model of models) {
    try {
      const data = await postJson(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model,
          messages: [{ role: "user", content: prompt }],
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 1600,
        },
        {
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "LearnFlow AI",
        },
      );
      const text = data?.choices?.[0]?.message?.content?.trim();
      if (text) return { text, provider: "openrouter", model };
    } catch (error: any) {
      lastError = error;
      if (!isRetryableStatus(error?.status)) break;
    }
  }

  throw lastError || new Error("OpenRouter returned no content.");
}

async function callSarvam(prompt: string, options: AIGenerationOptions = {}): Promise<AIContentResult> {
  const apiKey = process.env.SARVAM_API_KEY || process.env.SERVAM_API_KEY;
  if (!apiKey) throw new Error("SARVAM_API_KEY is not configured.");

  const models = options.models || SARVAM_MODELS;
  let lastError: unknown;

  for (const model of models) {
    try {
      const data = await postJson(
        "https://api.sarvam.ai/v1/chat/completions",
        {
          model,
          messages: [{ role: "user", content: prompt }],
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 1600,
        },
        { Authorization: `Bearer ${apiKey}` },
      );
      const text = data?.choices?.[0]?.message?.content?.trim();
      if (text) return { text, provider: "sarvam", model };
    } catch (error: any) {
      lastError = error;
      if (!isRetryableStatus(error?.status)) break;
    }
  }

  throw lastError || new Error("Sarvam returned no content.");
}

const providers: Record<string, ProviderFn> = {
  gemini: callGemini,
  sarvam: callSarvam,
  openrouter: callOpenRouter,
};

export async function generateAIContent(
  prompt: string,
  options: AIGenerationOptions = {},
): Promise<AIContentResult> {
  const providerOrder =
    options.providerOrder || ["gemini", "sarvam", "openrouter"];
  const errors: string[] = [];

  for (const providerName of providerOrder) {
    const provider = providers[providerName];
    if (!provider) continue;

    try {
      return await provider(prompt, options);
    } catch (error: any) {
      errors.push(`${providerName}: ${error?.message || "unknown error"}`);
    }
  }

  throw new Error(`All AI providers failed. ${errors.join(" | ")}`);
}
