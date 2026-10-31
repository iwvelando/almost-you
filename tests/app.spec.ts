import { test, expect } from "@playwright/test";
test("explore, compare and change models privately", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-engine", "ready");
  await expect(
    page.getByRole("heading", { name: "Julian’s almost-names" }),
  ).toBeVisible();
  await expect(page.getByTestId("result")).toHaveCount(5);
  await expect(page.getByTestId("comparison")).toContainText("Jillian");
  const requests: string[] = [];
  page.on("request", (r) => requests.push(r.url()));
  await page.getByLabel("Your name", { exact: true }).fill("Steven");
  await page.getByRole("button", { name: "Find my almost-names" }).click();
  await expect(
    page.getByRole("heading", { name: "Steven’s almost-names" }),
  ).toBeVisible();
  await page.getByLabel("Number of results").selectOption("10");
  await expect(page.getByTestId("result")).toHaveCount(10);
  await page.getByLabel("Ranking model").selectOption("frequency");
  await expect(page.getByTestId("model-note")).toContainText("frequency");
  await page.getByLabel("Compare with").fill("Stephen");
  await page.getByRole("button", { name: "Compare names" }).click();
  await expect(page.getByTestId("comparison")).toContainText("Same sounds");
  await page.getByLabel("Your name", { exact: true }).fill("Notarealnamezz");
  await page.getByRole("button", { name: "Find my almost-names" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "not in our pronunciation",
  );
  expect(requests).toEqual([]);
  expect(errors).toEqual([]);
});
test("science, themes, navigation and small screens", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-engine", "ready");
  await page
    .getByRole("link", { name: "The science", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("heading", {
      name: "A little science. A little uncertainty.",
    }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Deffler/ })).toHaveAttribute(
    "href",
    /doi.org/,
  );
  await expect(
    page.getByText("No names leave this page.", { exact: true }),
  ).toBeVisible();
  await page.emulateMedia({ colorScheme: "light" });
  await page.getByRole("button", { name: "Use dark background" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("link", { name: "Explore", exact: true })
    .first()
    .click();
  await expect(page.getByTestId("result")).toHaveCount(5);
});
test("works when storage is denied; static discovery assets exist", async ({
  page,
  request,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw Error("denied");
      },
    });
  });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-engine", "ready");
  await expect(page.getByTestId("result")).toHaveCount(5);
  await page.getByText("Tune the formula", { exact: true }).click();
  await page
    .getByRole("slider", { name: "Whole-name sound importance", exact: true })
    .fill("0");
  await expect(page.getByTestId("tuning-status")).toHaveText("Custom weights");
  await expect(
    page.getByTestId("result").first().locator(".similarity > span"),
  ).toHaveText("1.00");
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain(
    "Sitemap: https://almost-you.isaacvelando.com/sitemap.xml",
  );
  const sitemap = await request.get("/sitemap.xml");
  expect(await sitemap.text()).toContain(
    "<loc>https://almost-you.isaacvelando.com/</loc>",
  );
  for (const file of ["og.png", "apple-touch-icon.png"]) {
    const r = await request.get("/" + file);
    expect(r.headers()["content-type"]).toContain("image/png");
  }
});

test("skip link preserves the explorer and science anchors scroll to the section", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByTestId("result")).toHaveCount(5);
  await page.keyboard.press("Tab");
  await page.getByRole("link", { name: "Skip to content" }).press("Enter");
  await expect(
    page.getByRole("heading", { name: "Julian’s almost-names" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Peek at the math" }).click();
  await expect(page.locator("#math")).toBeInViewport();
});

test("changing pronunciation updates comparisons without calling different sounds identical", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByTestId("result")).toHaveCount(5);
  await page.getByLabel("Compare with").fill("Julian");
  await page.getByRole("button", { name: "Compare names" }).click();
  await expect(page.getByTestId("comparison")).toContainText("Same sounds");
  await page.getByLabel("Your pronunciation").selectOption("1");
  await expect(page.getByTestId("comparison")).toContainText("Your own name");
  await expect(page.getByTestId("comparison")).not.toContainText("Same sounds");
});
