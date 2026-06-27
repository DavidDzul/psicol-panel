import { defineConfig, devices } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AUTH_FILE = path.resolve(__dirname, "e2e", ".auth.json");

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  retries: 0,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  use: {
    baseURL: "http://localhost:3000",
    screenshot: "on",
    video: "off",
    trace: "on-first-retry",
  },
  projects: [
    // Setup project: runs login once and saves auth state
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    // Main test project: runs all E2E tests with saved auth state
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Each test starts with the saved auth state (token in localStorage)
        storageState: AUTH_FILE,
      },
      dependencies: ["setup"],
    },
  ],
});
