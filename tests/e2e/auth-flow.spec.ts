import { test, expect } from "@playwright/test";

test.describe("Authentication and Route Protection", () => {
  test("unauthenticated user accessing protected /dashboard is redirected to /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated user accessing /concept-coach is redirected to /login", async ({ page }) => {
    await page.goto("/concept-coach");
    await expect(page).toHaveURL(/\/login/);
  });

  test("login page renders successfully with form inputs", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[type="email"], input[name="email"], input#email')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("register page renders successfully", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("health check API returns ok: true", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.ok).toBe(true);
  });

  test("protected API endpoint /api/lectures returns 401 without auth", async ({ request }) => {
    const response = await request.get("/api/lectures");
    expect(response.status()).toBe(401);
  });
});
