import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("all nav links are visible and functional", async ({ page }) => {
    await page.goto("/");

    // Nav items visible
    for (const label of ["Teams", "Players", "Search", "Compare"]) {
      await expect(page.getByRole("link", { name: label })).toBeVisible();
    }

    // Navigate to Players
    await page.getByRole("link", { name: "Players" }).click();
    await expect(page).toHaveURL("/players");
    await expect(page.getByRole("heading", { name: "All Players" })).toBeVisible();

    // Navigate to Search
    await page.getByRole("link", { name: "Search" }).click();
    await expect(page).toHaveURL("/search");
    await expect(page.getByRole("heading", { name: "Player Search" })).toBeVisible();

    // Navigate to Compare
    await page.getByRole("link", { name: "Compare" }).click();
    await expect(page).toHaveURL("/compare");
    await expect(page.getByRole("heading", { name: "Compare Players" })).toBeVisible();

    // Navigate back to Teams via logo
    await page.getByRole("link", { name: /NBA Ratings/ }).click();
    await expect(page).toHaveURL("/");
  });

  test("active nav item is highlighted", async ({ page }) => {
    await page.goto("/players");
    const playersLink = page.getByRole("link", { name: "Players" });
    // Active link should have primary background
    await expect(playersLink).toHaveClass(/bg-primary/);
  });

  test("404 page for unknown routes", async ({ page }) => {
    await page.goto("/nonexistent-page");
    await expect(page.getByText("404")).toBeVisible();
  });
});
