import { preview } from "vite";
import { chromium, webkit, devices } from "@playwright/test";
import { mkdirSync } from "node:fs";
mkdirSync("work/screens", { recursive: true });
const server = await preview({
  preview: { host: "127.0.0.1", port: 4192, strictPort: true },
});
try {
  for (const [label, type, options] of [
    ["desktop", chromium, { viewport: { width: 1440, height: 1080 } }],
    ["phone", webkit, devices["iPhone 15"]],
  ]) {
    const browser = await type.launch();
    try {
      const page = await browser.newPage(options);
      for (const theme of ["light", "dark"]) {
        await page.goto("http://127.0.0.1:4192/");
        await page.locator('html[data-engine="ready"]').waitFor();
        await page.getByTestId("result").first().waitFor();
        await page.emulateMedia({ colorScheme: theme });
        await page
          .getByRole("button", { name: "Follow system", exact: true })
          .click();
        await page.evaluate(() => document.fonts.ready);
        for (const route of ["explore", "science"]) {
          await page.goto(`http://127.0.0.1:4192/#${route}`);
          await page.evaluate(() =>
            Promise.all(document.getAnimations().map((a) => a.finished)),
          );
          await page.screenshot({
            path: `work/screens/${label}-${theme}-${route}.png`,
            fullPage: true,
          });
          if (route === "explore") {
            await page.getByText("Tune the formula", { exact: true }).click();
            await page.evaluate(() =>
              Promise.all(document.getAnimations().map((a) => a.finished)),
            );
            await page.locator(".results-section").screenshot({
              path: `work/screens/${label}-${theme}-tuning.png`,
            });
          }
        }
      }
    } finally {
      await browser.close();
    }
  }
} finally {
  await new Promise((resolve) => server.httpServer.close(resolve));
}
