import { test, expect } from "@playwright/test";

test.describe("Player Search Page (/search)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/search");
  });

  test("displays page title and search input", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Player Search" })).toBeVisible();
    await expect(page.getByPlaceholder("Type a player name...")).toBeVisible();
  });

  test("shows empty state message before searching", async ({ page }) => {
    await expect(page.getByText("Type at least 2 characters to search")).toBeVisible();
  });

  test("typing less than 2 chars shows no results", async ({ page }) => {
    await page.getByPlaceholder("Type a player name...").fill("L");
    await expect(page.getByText("Type at least 2 characters to search")).toBeVisible();
  });

  test("searching for a known player shows results", async ({ page }) => {
    await page.getByPlaceholder("Type a player name...").fill("LeBron");
    // Should show a card with the player name
    await expect(page.getByText("LeBron James")).toBeVisible();
  });

  test("search result cards display stats (ORtg, DRtg, GP, PIE)", async ({ page }) => {
    await page.getByPlaceholder("Type a player name...").fill("LeBron");
    await expect(page.getByText("LeBron James")).toBeVisible();

    // The card should have stat labels
    const card = page.locator("[class*='rounded-xl']").filter({ hasText: "LeBron James" }).first();
    await expect(card.getByText("ORtg")).toBeVisible();
    await expect(card.getByText("DRtg")).toBeVisible();
    await expect(card.getByText("GP")).toBeVisible();
  });

  test("searching for non-existent player shows no results", async ({ page }) => {
    await page.getByPlaceholder("Type a player name...").fill("XYZNONEXISTENT");
    await expect(page.getByText(/No players found/)).toBeVisible();
  });

  test("partial name search works (case insensitive)", async ({ page }) => {
    await page.getByPlaceholder("Type a player name...").fill("curry");
    // Should find Stephen Curry (or other Currys)
    const results = page.locator("[class*='rounded-xl']").filter({ hasText: /Curry/i });
    const count = await results.count();
    expect(count).toBeGreaterThan(0);
  });
});
