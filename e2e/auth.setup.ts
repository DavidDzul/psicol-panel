/**
 * auth.setup.ts
 * Runs once before all tests to log in and save the auth state.
 * This avoids repeated login calls that can hit timing issues.
 */
import { test as setup } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const AUTH_FILE = path.resolve(__dirname, ".auth.json");

setup("authenticate as admin", async ({ page }) => {
  await page.goto("/auth/login", { waitUntil: "domcontentloaded" });
  await page
    .locator('button:has-text("INICIAR SESIÓN")')
    .waitFor({ state: "visible", timeout: 10_000 });

  await page.locator('input[type="text"]').first().fill("admin@iu.org.mx");
  await page.locator('input[type="password"]').first().fill("abc123");

  const loginResponse = page.waitForResponse(
    (r) =>
      r.url().includes("/api/admin/login") &&
      r.request().method() === "POST",
    { timeout: 10_000 },
  );
  await page.locator('button:has-text("INICIAR SESIÓN")').click();
  await loginResponse;

  await page.waitForURL((url) => !url.pathname.includes("/auth/login"), {
    timeout: 20_000,
  });

  // Save the browser storage state (cookies + localStorage) for reuse
  await page.context().storageState({ path: AUTH_FILE });
  console.log(`Auth state saved to ${AUTH_FILE}`);
});
