import { test, expect } from '@playwright/test';

test('form validation errors', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Submit empty form
    await page.click('button[type="submit"]');

    await expect(page).toHaveTitle('Error: Create an account');

    // Check error summary appears
    await expect(page.locator('[role="region"]')).toBeVisible();
    await expect(page.locator('h2')).toContainText('There are 2 problems');

    // Check inline errors
    await expect(page.locator('#email-error')).toBeVisible();
    await expect(page.locator('#password-error')).toBeVisible();

    // Check error link focuses field
    await page.click('a[href="#email"]');
    await expect(page.locator('#email')).toBeFocused();
});

test('email validation errors', async ({ page }) => {
    await page.goto('http://localhost:5173');

    await page.fill('#password', 'ValidPass123!');

    // Submit empty form
    await page.click('button[type="submit"]');

    await expect(page).toHaveTitle('Error: Create an account');

    // Check error summary appears
    await expect(page.locator('[role="region"]')).toBeVisible();
    await expect(page.locator('h2')).toContainText('There is a problem');

    // Check inline errors
    await expect(page.locator('#email-error')).toBeVisible();

    // Check error link focuses field
    await page.click('a[href="#email"]');
    await expect(page.locator('#email')).toBeFocused();
});

test('password validation errors', async ({ page }) => {
    await page.goto('http://localhost:5173');

    await page.fill('#email', 'valid@emailaddress.com');

    // Submit empty form
    await page.click('button[type="submit"]');

    await expect(page).toHaveTitle('Error: Create an account');

    // Check error summary appears
    await expect(page.locator('[role="region"]')).toBeVisible();
    await expect(page.locator('h2')).toContainText('There is a problem');

    // Check inline errors
    await expect(page.locator('#password-error')).toBeVisible();

    // Check error link focuses field
    await page.click('a[href="#password"]');
    await expect(page.locator('#password')).toBeFocused();
});