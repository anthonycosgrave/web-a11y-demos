import { test, expect } from '@playwright/test';

test('successful account creation', async ({ page }) => {
    await page.goto('http://localhost:5173');
    // Check page loaded
    await expect(page).toHaveTitle('Create an Account');

    // Fill form with valid data
    await page.fill('#email', 'valid@emailaddress.com');
    await page.fill('#password', 'ValidPass123!');

    // Submit
    await page.click('button[type="submit"]');

    // Verify confirmation page
    await expect(page).toHaveTitle('Account created');
    await expect(page.locator('h1')).toContainText('Account Created');
    await expect(page.locator('p strong')).toContainText('valid@emailaddress.com');
});
