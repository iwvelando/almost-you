import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "tests",
  fullyParallel: true,
  use: { baseURL: "http://127.0.0.1:4187", trace: "retain-on-failure" },
  webServer: {
    command: "npx vite preview --host 127.0.0.1 --port 4187 --strictPort",
    port: 4187,
    reuseExistingServer: false,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    {
      name: "phone",
      use: { ...devices["iPhone 15"], defaultBrowserType: "chromium" },
    },
    { name: "webkit", use: { ...devices["iPhone 15"] } },
  ],
});
