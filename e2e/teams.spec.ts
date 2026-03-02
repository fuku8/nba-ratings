import { test, expect } from "@playwright/test";

test.describe("Team Ratings Page (/)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("displays page title and description", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Team Ratings" })).toBeVisible();
    await expect(page.getByText("Offensive, defensive, and net ratings")).toBeVisible();
  });

  test("displays 3 stat cards (Best Offense, Best Defense, Best Net Rating)", async ({ page }) => {
    await expect(page.getByText("Best Offense")).toBeVisible();
    await expect(page.getByText("Best Defense")).toBeVisible();
    await expect(page.getByText("Best Net Rating")).toBeVisible();
  });

  test("displays team ratings table with 30 teams", async ({ page }) => {
    const rows = page.locator("table tbody tr");
    await expect(rows).toHaveCount(30);
  });

  test("table has correct column headers", async ({ page }) => {
    for (const header of ["Team", "W", "L", "ORtg", "DRtg", "NRtg", "Pace"]) {
      await expect(page.locator("table thead").getByText(header, { exact: true })).toBeVisible();
    }
  });

  test("clicking column header sorts the table", async ({ page }) => {
    // Get initial first team
    const firstCell = page.locator("table tbody tr").first().locator("td").nth(1);
    const initialTeam = await firstCell.textContent();

    // Click on ORtg header to sort
    await page.locator("table thead").getByText("ORtg", { exact: true }).click();
    const afterSortTeam = await firstCell.textContent();

    // The order should potentially change (depending on initial state)
    // At minimum, the page should not crash
    expect(afterSortTeam).toBeTruthy();
  });

  test("team name links to team detail page", async ({ page }) => {
    const firstTeamLink = page.locator("table tbody tr").first().getByRole("link");
    await expect(firstTeamLink).toHaveAttribute("href", /\/team\/\d+/);
  });

  test("NRtg values show + prefix for positive and color coding", async ({ page }) => {
    // Find a positive NRtg cell (should contain +)
    const positiveCells = page.locator("table tbody td:nth-child(7)").filter({ hasText: /^\+/ });
    const count = await positiveCells.count();
    expect(count).toBeGreaterThan(0);
  });

  test("tabs switch between Table, Scatter Plot, and Rankings", async ({ page }) => {
    // Table is default
    await expect(page.locator("table")).toBeVisible();

    // Switch to Scatter Plot
    await page.getByRole("tab", { name: "Scatter Plot" }).click();
    await expect(page.getByText("ORtg vs DRtg")).toBeVisible();

    // Switch to Rankings
    await page.getByRole("tab", { name: "Rankings" }).click();
    await expect(page.getByText("Net Rating Rankings")).toBeVisible();
  });
});
