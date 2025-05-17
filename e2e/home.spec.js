import { test, expect } from '@playwright/test';

test('homepage has title and links', async ({ page }) => {
  await page.goto('/');
  
  // Check title
  await expect(page).toHaveTitle(/Skill Sprint/);
  
  // Check navigation links
  await expect(page.getByRole('link', { name: /home/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /how it works/i })).toBeVisible();
}); 