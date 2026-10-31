import { test, expect } from "@playwright/test";

test("a landscape suggestion survives input blur between touch press and release", async ({
  page,
}) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto("/");
  await expect(page.getByTestId("result")).toHaveCount(5);
  const input = page.getByRole("combobox", { name: "Your name", exact: true });
  await input.fill("Is");
  const option = page.getByRole("option", { name: "Isabella", exact: true });
  await expect(option).toBeVisible();
  // Reproduce the event-order hazard suggested by the on-device report: losing
  // input focus during a suggestion gesture must not remove its release target.
  await option.dispatchEvent("pointerdown", {
    pointerId: 7,
    pointerType: "touch",
    clientX: 100,
    clientY: 100,
  });
  await input.evaluate((el) => (el as HTMLInputElement).blur());
  await expect(option).toBeVisible();
  await expect(page.locator(".name-badge")).toHaveCSS("transform", "none");
  await option.dispatchEvent("pointerup", {
    pointerId: 7,
    pointerType: "touch",
    clientX: 100,
    clientY: 100,
  });
  await expect(input).toHaveValue("Isabella");
  await page.getByRole("button", { name: "Find my almost-names" }).click();
  await expect(
    page.getByRole("heading", { name: "Isabella’s almost-names" }),
  ).toBeVisible();
});

test("canceled suggestion gestures do not select a name", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("result")).toHaveCount(5);
  const input = page.getByRole("combobox", { name: "Your name", exact: true });
  await input.fill("Is");
  const option = page.getByRole("option", { name: "Isabella", exact: true });
  await option.dispatchEvent("pointerdown", {
    pointerId: 8,
    pointerType: "touch",
    clientX: 100,
    clientY: 100,
  });
  await option.dispatchEvent("pointercancel", {
    pointerId: 8,
    pointerType: "touch",
  });
  await expect(input).toHaveValue("Is");
  await input.press("Escape");
  await expect(page.getByRole("listbox")).toHaveCount(0);
});

test("search is a distinct large action and privacy describes the hosted site plainly", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByTestId("result")).toHaveCount(5);
  const button = page.getByRole("button", { name: "Find my almost-names" });
  const styles = await button.evaluate((el) => ({
    background: getComputedStyle(el).backgroundColor,
    height: el.getBoundingClientRect().height,
    size: parseFloat(getComputedStyle(el).fontSize),
  }));
  expect(styles.background).not.toBe("rgba(0, 0, 0, 0)");
  expect(styles.height).toBeGreaterThanOrEqual(48);
  expect(styles.size).toBeGreaterThanOrEqual(16);
  await page.goto("/#privacy");
  await expect(page.locator("#privacy")).toContainText("static website");
  await expect(page.locator("#privacy")).toContainText(
    "collects no user-input data",
  );
  await expect(page.locator("#privacy")).not.toContainText(
    /future|CloudFront|S3|server|downloads/,
  );
});
