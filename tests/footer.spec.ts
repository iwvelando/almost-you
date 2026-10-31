import { test, expect } from "@playwright/test";

for (const view of ["/", "/#science"]) {
  test(`footer links to the public source as "About this site" on ${view}`, async ({
    page,
  }) => {
    await page.goto(view);
    await expect(page.locator("html")).toHaveAttribute("data-engine", "ready");
    const footer = page.locator("footer");
    const about = footer.getByRole("link", {
      name: "About this site",
      exact: true,
    });
    await expect(about).toHaveAttribute(
      "href",
      "https://github.com/iwvelando/almost-you",
    );
    await about.scrollIntoViewIfNeeded();
    await expect(about).toBeInViewport({ ratio: 1 });

    // Both footer links stay readable side by side without crowding each other.
    const privacy = footer.getByRole("link", {
      name: "Private by design",
      exact: true,
    });
    const a = (await privacy.boundingBox())!;
    const b = (await about.boundingBox())!;
    const overlaps =
      a.x < b.x + b.width &&
      b.x < a.x + a.width &&
      a.y < b.y + b.height &&
      b.y < a.y + a.height;
    expect(overlaps).toBe(false);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}
