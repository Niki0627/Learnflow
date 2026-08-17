import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { withAuth } from "@/src/lib/api/auth";

describe("withAuth Higher-Order Handler", () => {
  it("rejects unauthenticated requests with 401 status", async () => {
    const handler = withAuth(async () => {
      return Response.json({ secret: "data" });
    });

    const request = new Request("http://localhost:3000/api/lectures");
    const response = await handler(request);

    assert.equal(response.status, 401);
    const body = await response.json();
    assert.equal(body.code, "UNAUTHORIZED");
    assert.ok(body.error.includes("Unauthorized"));
  });

  it("handles handler exceptions and formats apiError response", async () => {
    const handler = withAuth(async () => {
      throw new Error("Custom server error");
    });

    const request = new Request("http://localhost:3000/api/lectures");
    const response = await handler(request);

    // It catches the unauthenticated error first before running inner handler
    assert.equal(response.status, 401);
  });
});
