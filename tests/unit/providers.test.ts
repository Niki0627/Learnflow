import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { generateAIContent } from "@/src/lib/ai/providers";

describe("AI Providers Fallback Logic", () => {
  const originalEnv = { ...process.env };
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    global.fetch = originalFetch;
  });

  it("throws descriptive error when all AI providers fail", async () => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.SARVAM_API_KEY;
    delete process.env.OPENROUTER_API_KEY;

    await assert.rejects(
      async () => {
        await generateAIContent("Test prompt", {
          providerOrder: ["gemini", "sarvam", "openrouter"],
        });
      },
      (err: Error) => {
        assert.ok(err.message.includes("All AI providers failed"));
        assert.ok(err.message.includes("GEMINI_API_KEY is not configured"));
        assert.ok(err.message.includes("SARVAM_API_KEY is not configured"));
        assert.ok(err.message.includes("OPENROUTER_API_KEY is not configured"));
        return true;
      },
    );
  });

  it("successfully returns result from Gemini when configured", async () => {
    process.env.GEMINI_API_KEY = "mock-gemini-key";

    global.fetch = async (url: any) => {
      if (String(url).includes("generativelanguage.googleapis.com")) {
        return new Response(
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [{ text: "Gemini generated response" }],
                },
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      return new Response("Not found", { status: 404 });
    };

    const result = await generateAIContent("Explain quantum physics", {
      providerOrder: ["gemini"],
    });

    assert.equal(result.text, "Gemini generated response");
    assert.equal(result.provider, "gemini");
    assert.ok(result.model.includes("gemini"));
  });

  it("falls back to OpenRouter when Gemini encounters a 429 rate limit", async () => {
    process.env.GEMINI_API_KEY = "mock-gemini-key";
    process.env.OPENROUTER_API_KEY = "mock-openrouter-key";

    global.fetch = async (url: any) => {
      const urlStr = String(url);
      if (urlStr.includes("generativelanguage.googleapis.com")) {
        return new Response(
          JSON.stringify({ error: { message: "Resource has been exhausted" } }),
          { status: 429, headers: { "Content-Type": "application/json" } },
        );
      }
      if (urlStr.includes("openrouter.ai")) {
        return new Response(
          JSON.stringify({
            choices: [
              {
                message: { content: "OpenRouter fallback response" },
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      return new Response("Not found", { status: 404 });
    };

    const result = await generateAIContent("Explain photosyntheis", {
      providerOrder: ["gemini", "openrouter"],
    });

    assert.equal(result.text, "OpenRouter fallback response");
    assert.equal(result.provider, "openrouter");
  });
});
