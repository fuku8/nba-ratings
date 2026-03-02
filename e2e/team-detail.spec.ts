import { test, expect } from "@playwright/test";

test.describe("Team Detail Page (/team/[teamId])", () => {
  test("navigating from home to team detail page", async ({ page }) => {
    await page.goto("/");
    // Click on the first team link
    const firstTeamLink = page.locator("table tbody tr").first().getByRole("link");
    const teamName = await firstTeamLink.textContent();
    await firstTeamLink.click();

    // Should navigate to /team/[id]
    await expect(page).toHaveURL(/\/team\/\d+/);

    // Should display team name in heading
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("displays team stat cards (ORtg, DRtg, NRtg)", async ({ page }) => {
    await page.goto("/");
    await page.locator("table tbody tr").first().getByRole("link").click();
    await expect(page).toHaveURL(/\/team\/\d+/);

    await expect(page.getByText("Offensive Rating")).toBeVisible();
    await expect(page.getByText("Defensive Rating")).toBeVisible();
    await expect(page.getByText("Net Rating")).toBeVisible();
  });

  test("displays roster table", async ({ page }) => {
    await page.goto("/");
    await page.locator("table tbody tr").first().getByRole("link").click();

    await expect(page.getByRole("heading", { name: "Roster" })).toBeVisible();
    const rows = page.locator("table tbody tr");
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test("back link returns to teams page", async ({ page }) => {
    await page.goto("/");
    await page.locator("table tbody tr").first().getByRole("link").click();
    await expect(page).toHaveURL(/\/team\/\d+/);

    await page.getByText("All Teams").click();
    await expect(page).toHaveURL("/");
  });

  test("non-existent team shows not found message", async ({ page }) => {
    await page.goto("/team/9999999");
    await expect(page.getByText("Team not found")).toBeVisible();
  });
});
