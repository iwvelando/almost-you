import { test, expect, type Page } from "@playwright/test";

const KEY = "almost-you-weights";
const DEFAULTS = {
  v: 1,
  sound: { sound: 85, edge: 15, frequency: 0, last: 50 },
  frequency: { sound: 75, edge: 15, frequency: 10, last: 50 },
};
const slider = (page: Page, name: string) =>
  page.getByRole("slider", { name, exact: true });
const resultNames = (page: Page) =>
  page.getByTestId("result").locator("strong").allTextContents();
async function openTuning(page: Page) {
  await page.getByText("Tune the formula", { exact: true }).click();
  await expect(slider(page, "Whole-name sound importance")).toBeVisible();
}

test("formula tuning is collapsed by default and reranks when weights settle", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByTestId("result")).toHaveCount(5);
  await expect(
    page.getByRole("heading", { name: "Tune the formula" }),
  ).toBeVisible();
  await expect(slider(page, "Whole-name sound importance")).toBeHidden();
  const initial = await resultNames(page);
  const requests: string[] = [];
  page.on("request", (r) => requests.push(r.url()));

  await openTuning(page);
  await expect(slider(page, "Whole-name sound importance")).toHaveValue("85");
  await expect(slider(page, "First and last sounds importance")).toHaveValue(
    "15",
  );
  await expect(slider(page, "Name frequency importance")).toHaveCount(0);
  await expect(slider(page, "Last sound share")).toHaveValue("50");
  await expect(page.getByTestId("tuning-formula")).toHaveText(
    "S = 0.85P + 0.15E",
  );
  await expect(page.getByTestId("tuning-edge-formula")).toHaveText(
    "E = 0.50·[same first] + 0.50·[same last]",
  );
  await expect(page.getByTestId("tuning-status")).toHaveText("Default weights");

  await slider(page, "Whole-name sound importance").fill("0");
  await expect(page.getByTestId("tuning-formula")).toHaveText(
    "S = 0.00P + 1.00E",
  );
  await expect(page.getByTestId("tuning-status")).toHaveText("Custom weights");
  await expect(
    page.getByTestId("result").first().locator(".similarity > span"),
  ).toHaveText("1.00");
  await expect.poll(() => resultNames(page)).not.toEqual(initial);
  await expect(page.getByTestId("comparison")).toContainText(
    "your custom weights",
  );

  const balance = slider(page, "Last sound share");
  await balance.focus();
  await balance.press("ArrowRight");
  await expect(balance).toHaveValue("55");
  await expect(page.getByTestId("tuning-edge-formula")).toHaveText(
    "E = 0.45·[same first] + 0.55·[same last]",
  );

  await page.getByRole("button", { name: "Restore defaults" }).click();
  await expect(slider(page, "Whole-name sound importance")).toHaveValue("85");
  await expect(balance).toHaveValue("50");
  await expect(page.getByTestId("tuning-status")).toHaveText("Default weights");
  await expect.poll(() => resultNames(page)).toEqual(initial);

  await slider(page, "Whole-name sound importance").fill("0");
  await slider(page, "First and last sounds importance").fill("0");
  await expect(page.getByTestId("tuning-error")).toContainText(
    "Give at least one ingredient some weight.",
  );
  await page.getByRole("button", { name: "Restore defaults" }).click();
  await expect(page.getByTestId("tuning-error")).toHaveCount(0);

  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(requests).toEqual([]);
  expect(errors).toEqual([]);
});

test("each ranking model keeps its own weights and only the frequency model has a frequency weight", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByTestId("result")).toHaveCount(5);
  await openTuning(page);
  await slider(page, "Whole-name sound importance").fill("60");
  await page.getByLabel("Ranking model").selectOption("frequency");
  await expect(slider(page, "Whole-name sound importance")).toHaveValue("75");
  await expect(slider(page, "Name frequency importance")).toHaveValue("10");
  await expect(page.getByTestId("tuning-formula")).toHaveText(
    "S = 0.75P + 0.15E + 0.10F",
  );
  await slider(page, "Name frequency importance").fill("0");
  await expect(page.getByTestId("tuning-formula")).toHaveText(
    "S = 0.83P + 0.17E + 0.00F",
  );
  await page.getByLabel("Ranking model").selectOption("sound");
  await expect(slider(page, "Name frequency importance")).toHaveCount(0);
  await expect(slider(page, "Whole-name sound importance")).toHaveValue("60");
});

test("weights persist locally and restoring defaults saves the defaults", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByTestId("result")).toHaveCount(5);
  await page.getByLabel("Your name", { exact: true }).fill("Steven");
  await page.getByRole("button", { name: "Find my almost-names" }).click();
  await expect(
    page.getByRole("heading", { name: "Steven’s almost-names" }),
  ).toBeVisible();
  await openTuning(page);
  await slider(page, "Whole-name sound importance").fill("40");
  await expect(page.getByTestId("tuning-status")).toHaveText("Custom weights");
  await expect
    .poll(() =>
      page.evaluate((k) => JSON.parse(localStorage.getItem(k) || "{}"), KEY),
    )
    .toEqual({ ...DEFAULTS, sound: { ...DEFAULTS.sound, sound: 40 } });
  const stored = await page.evaluate(() =>
    Object.keys(localStorage).map((k) => k + "=" + localStorage.getItem(k)),
  );
  expect(stored.join("\n")).not.toContain("Steven");
  expect(stored.join("\n")).not.toContain("Julian");

  await page.reload();
  await expect(page.getByTestId("result")).toHaveCount(5);
  await expect(slider(page, "Whole-name sound importance")).toBeHidden();
  await expect(page.getByTestId("tuning-status")).toHaveText("Custom weights");
  await openTuning(page);
  await expect(slider(page, "Whole-name sound importance")).toHaveValue("40");

  await page.getByRole("button", { name: "Restore defaults" }).click();
  await expect(page.getByTestId("tuning-status")).toHaveText("Default weights");
  await expect
    .poll(() =>
      page.evaluate((k) => JSON.parse(localStorage.getItem(k) || "{}"), KEY),
    )
    .toEqual(DEFAULTS);
  await page.reload();
  await expect(page.getByTestId("result")).toHaveCount(5);
  await expect(page.getByTestId("tuning-status")).toHaveText("Default weights");
});

for (const [label, value] of [
  ["malformed JSON", "{bad"],
  [
    "all-zero weights",
    JSON.stringify({
      ...DEFAULTS,
      sound: { sound: 0, edge: 0, frequency: 0, last: 50 },
    }),
  ],
  [
    "a frequency weight in the sound model",
    JSON.stringify({
      ...DEFAULTS,
      sound: { sound: 85, edge: 15, frequency: 10, last: 50 },
    }),
  ],
  [
    "an out-of-range weight",
    JSON.stringify({
      ...DEFAULTS,
      sound: { sound: 500, edge: 15, frequency: 0, last: 50 },
    }),
  ],
]) {
  test(`stored weights with ${label} fall back to defaults`, async ({
    page,
  }) => {
    await page.addInitScript(
      ([k, v]) => localStorage.setItem(k, v),
      [KEY, value],
    );
    await page.goto("/");
    await expect(page.getByTestId("result")).toHaveCount(5);
    await expect(page.getByTestId("tuning-status")).toHaveText(
      "Default weights",
    );
    await openTuning(page);
    await expect(slider(page, "Whole-name sound importance")).toHaveValue("85");
  });
}
