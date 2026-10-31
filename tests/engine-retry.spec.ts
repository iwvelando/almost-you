import { test, expect, type Page } from "@playwright/test";

// The Go engine occasionally fails to start in WebKit (a rare runtime crash seen
// on CI). One silent restart should hide that; a persistent failure still asks
// the visitor to reload.
const failingWorker = "postMessage({ type: 'error', error: 'simulated' });";
async function failWorkerStarts(page: Page, times: number) {
  let starts = 0;
  await page.route("**/worker.js", (route) => {
    starts++;
    if (starts <= times)
      return route.fulfill({
        contentType: "text/javascript",
        body: failingWorker,
      });
    return route.continue();
  });
  return () => starts;
}

test("a single failed engine start is retried without bothering the visitor", async ({
  page,
}) => {
  const starts = await failWorkerStarts(page, 1);
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-engine", "ready");
  await expect(page.getByTestId("result")).toHaveCount(5);
  await expect(page.getByText("could not start")).toHaveCount(0);
  expect(starts()).toBe(2);
});

test("an engine that keeps failing asks for a reload, which still works", async ({
  page,
}) => {
  const starts = await failWorkerStarts(page, 2);
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText(
    "The name engine could not start.",
  );
  await expect(page.locator("html")).toHaveAttribute("data-engine", "error");
  expect(starts()).toBe(2);
  await page.getByRole("button", { name: "Reload engine" }).click();
  await expect(page.getByTestId("result")).toHaveCount(5);
  expect(starts()).toBe(3);
});
