import { test, expect } from '@playwright/test';

test('account creation ', async ({ page }) => {
    await page.goto('http://localhost:5173');
    // Check page loaded
    await expect(page).toHaveTitle('Create an Account');

    // Fill form with valid data
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'ValidPass123!');

    // Submit
    await page.click('button[type="submit"]');

    await expect(page).toHaveTitle('Error: Create an account');
    // Check error summary appears
    await expect(page.locator('[role="region"]')).toBeVisible();
    await expect(page.locator('h2')).toContainText('There is a problem');

    await page.click('a[href="#email"]');
    await expect(page.locator('#email')).toBeFocused();
});
