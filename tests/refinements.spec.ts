import { test, expect } from "@playwright/test";
import { existsSync, readFileSync, readdirSync } from "node:fs";
// Optional terms that must never appear in public copy, one word per line, in a
// gitignored file so the list itself is never published. Without the file the
// check is skipped. Failures name the file, never the matched term.
const DENYLIST = ".private/denylist.txt";
const terms = existsSync(DENYLIST)
  ? readFileSync(DENYLIST, "utf8")
      .split("\n")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
  : [];
const hits = (text: string) => {
  const words = new Set(text.toLowerCase().match(/[a-z]+/g) ?? []);
  return terms.filter((t) => words.has(t)).length;
};
test("suggestions update immediately and keep input focus in portrait and landscape", async ({
  page,
  isMobile,
}) => {
  await page.goto("/");
  await expect(page.getByTestId("result")).toHaveCount(5);
  const input = page.getByRole("combobox", { name: "Your name", exact: true });
  for (const size of [
    { width: 390, height: 844 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(size);
    await input.fill("Mik");
    await expect(
      page.getByRole("listbox", { name: "Name suggestions" }),
    ).toBeVisible();
    const option = page.getByRole("option", { name: "Mikael", exact: true });
    if (isMobile) await option.tap();
    else await option.click();
    await expect(input).toHaveValue("Mikael");
    await expect(input).toBeFocused();
    await expect(page.getByRole("listbox")).toHaveCount(0);
    await page.getByRole("button", { name: "Find my almost-names" }).click();
    await expect(
      page.getByRole("heading", { name: "Mikael’s almost-names" }),
    ).toBeVisible();
  }
  await input.fill("Mik");
  await input.press("ArrowDown");
  await input.press("Enter");
  await expect(input).toHaveValue("Mika");
  await expect(input).toBeFocused();
  await input.fill("Mik");
  await input.press("Escape");
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await expect(page.locator("datalist")).toHaveCount(0);
});

test("theme follows the system until toggled and can return to live system changes", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  const system = page.getByRole("button", {
    name: "Follow system",
    exact: true,
  });
  await expect(system).toHaveAttribute("aria-pressed", "true");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Use light background" }).click();
  await expect(system).toHaveAttribute("aria-pressed", "false");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await system.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(system).toHaveAttribute("aria-pressed", "true");
});

test("mobile sentence keeps its word boundary and select chevrons have room", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const heading = page.locator(".results-aside h3");
  await expect(heading).toHaveText("Almost is doing a lot of work here.");
  expect(await heading.evaluate((el) => el.textContent)).toContain("doing a");
  await expect(page.locator(".asterisk svg")).toHaveCount(1);
  for (const label of [
    "Ranking model",
    "Number of results",
    "Your pronunciation",
  ]) {
    const select = page.getByLabel(label);
    await expect(select).toBeVisible();
    const style = await select.evaluate((el) => ({
      appearance: getComputedStyle(el).appearance,
      padding: parseFloat(getComputedStyle(el).paddingRight),
      image: getComputedStyle(el).backgroundImage,
      position: getComputedStyle(el).backgroundPosition,
    }));
    expect(style.appearance).toBe("none");
    expect(style.padding).toBeGreaterThanOrEqual(36);
    expect(style.image).not.toBe("none");
    expect(style.position).toContain("12px");
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("public copy and documentation avoid locally listed private terms", async ({
  page,
}) => {
  test.skip(terms.length === 0, `No ${DENYLIST}`);
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Julian’s almost-names" }),
  ).toBeVisible();
  await page.goto("/#science");
  await expect(
    page.getByRole("heading", {
      name: "A little science. A little uncertainty.",
    }),
  ).toBeVisible();
  expect(hits(await page.locator("main").innerText()), "science page").toBe(0);
  const files = [
    "README.md",
    "AGENTS.md",
    ...readdirSync("docs")
      .filter((f) => f.endsWith(".md"))
      .map((f) => "docs/" + f),
    "scripts/share-card.mjs",
  ];
  for (const file of files)
    expect(hits(readFileSync(file, "utf8")), file).toBe(0);
});
