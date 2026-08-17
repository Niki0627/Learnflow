import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { cn, formatUsername, subjectToColor } from "@/src/lib/utils";
import { ApiError } from "@/src/lib/api/errors";

describe("Utility functions", () => {
  it("cn merges class names properly", () => {
    assert.equal(cn("px-2 py-1", "bg-red-500"), "px-2 py-1 bg-red-500");
    assert.equal(cn("px-2", { "text-white": true, "text-black": false }), "px-2 text-white");
    assert.equal(cn("p-4", "p-2"), "p-2");
  });

  it("formatUsername formats email and username correctly", () => {
    assert.equal(formatUsername("john.doe@example.com"), "John.doe");
    assert.equal(formatUsername("alice123@gmail.com"), "Alice");
    assert.equal(formatUsername(""), "User");
    assert.equal(formatUsername(null), "User");
  });

  it("subjectToColor returns deterministic colors", () => {
    const color1 = subjectToColor("Mathematics");
    const color2 = subjectToColor("Mathematics");
    const color3 = subjectToColor("Physics");
    assert.equal(color1, color2);
    assert.ok(typeof color1 === "string" && color1.startsWith("#"));
    assert.ok(typeof color3 === "string" && color3.startsWith("#"));
    assert.equal(subjectToColor(null), "#5B4FE9");
  });

  it("ApiError constructs properly with status and code", () => {
    const error = new ApiError("Not found", 404, "NOT_FOUND");
    assert.equal(error.message, "Not found");
    assert.equal(error.status, 404);
    assert.equal(error.code, "NOT_FOUND");
  });
});
