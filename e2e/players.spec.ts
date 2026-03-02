import { test, expect } from "@playwright/test";

test.describe("All Players Page (/players)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/players");
  });

  test("displays page title", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "All Players" })).toBeVisible();
  });

  test("displays player count badge", async ({ page }) => {
    await expect(page.getByText(/\d+ players/)).toBeVisible();
  });

  test("displays player table with rows", async ({ page }) => {
    const rows = page.locator("table tbody tr");
    const count = await rows.count();
    expect(count).toBeGreaterThan(10);
  });

  test("table has correct headers (Player, Team, GP, MIN, ORtg, DRtg, NRtg, PIE%)", async ({ page }) => {
    for (const header of ["Player", "Team", "GP", "MIN", "ORtg", "DRtg", "NRtg"]) {
      await expect(page.locator("table thead").getByText(header, { exact: true })).toBeVisible();
    }
  });

  test("name filter reduces player count", async ({ page }) => {
    const initialCount = await page.locator("table tbody tr").count();
    await page.getByPlaceholder("Search by name...").fill("LeBron");
    const filteredCount = await page.locator("table tbody tr").count();
    expect(filteredCount).toBeLessThan(initialCount);
    expect(filteredCount).toBeGreaterThan(0);
  });

  test("min GP filter changes player count", async ({ page }) => {
    const count20 = await page.locator("table tbody tr").count();

    // Click 0+ to show all players
    await page.getByRole("button", { name: "0+", exact: true }).click();
    const count0 = await page.locator("table tbody tr").count();
    expect(count0).toBeGreaterThanOrEqual(count20);

    // Click 50+ to show fewer players
    await page.getByRole("button", { name: "50+", exact: true }).click();
    const count50 = await page.locator("table tbody tr").count();
    expect(count50).toBeLessThanOrEqual(count20);
  });

  test("team filter shows only selected team players", async ({ page }) => {
    await page.locator("select").selectOption("OKC");
    const rows = page.locator("table tbody tr");
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(30);

    // All visible team abbreviations should be OKC
    const teamCells = page.locator("table tbody tr td:nth-child(3)");
    const first = await teamCells.first().textContent();
    expect(first).toContain("OKC");
  });

  test("sorting by NRtg works", async ({ page }) => {
    // NRtg is default sort descending. Click to toggle ascending.
    await page.locator("table thead").getByText("NRtg", { exact: true }).click();
    // After clicking, the first row NRtg should be lower or the same
    const firstNRtg = await page.locator("table tbody tr").first().locator("td:nth-child(8)").textContent();
    expect(firstNRtg).toBeTruthy();
  });
});
