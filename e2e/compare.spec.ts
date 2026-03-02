import { test, expect } from "@playwright/test";

test.describe("Compare Players Page (/compare)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/compare");
  });

  test("displays page title and empty state", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Compare Players" })).toBeVisible();
    await expect(page.getByText("Search and add players to compare")).toBeVisible();
  });

  test("search input is visible", async ({ page }) => {
    await expect(page.getByPlaceholder("Add player...")).toBeVisible();
  });

  test("searching and adding a player", async ({ page }) => {
    await page.getByPlaceholder("Add player...").fill("LeBron");
    // Wait for suggestions dropdown
    const suggestion = page.locator("button").filter({ hasText: "LeBron James" }).first();
    await expect(suggestion).toBeVisible();
    await suggestion.click();

    // Player badge should appear (uses data-slot="badge")
    const badge = page.locator('[data-slot="badge"]').filter({ hasText: "LeBron James" });
    await expect(badge).toBeVisible();

    // Stat card should appear
    await expect(page.getByText("ORtg").first()).toBeVisible();
  });

  test("adding two players shows radar chart", async ({ page }) => {
    // Add first player
    await page.getByPlaceholder("Add player...").fill("LeBron");
    await page.locator("button").filter({ hasText: "LeBron James" }).first().click();

    // Add second player
    await page.getByPlaceholder("Add player...").fill("Curry");
    await page.locator("button").filter({ hasText: /Curry/ }).first().click();

    // Radar chart section should appear
    await expect(page.getByText("Radar Comparison")).toBeVisible();
  });

  test("removing a player works", async ({ page }) => {
    // Add a player
    await page.getByPlaceholder("Add player...").fill("LeBron");
    await page.locator("button").filter({ hasText: "LeBron James" }).first().click();

    // Verify badge is visible
    const badge = page.locator('[data-slot="badge"]').filter({ hasText: "LeBron James" });
    await expect(badge).toBeVisible();

    // Click X button to remove
    await badge.locator("button").click();

    // Should return to empty state
    await expect(page.getByText("Search and add players to compare")).toBeVisible();
  });
});
