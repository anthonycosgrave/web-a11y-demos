import {
  test,
  expect
} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('homepage should not have accessibility violations', async ({
  page
}) => {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');

  const accessibilityScanResults = await new AxeBuilder({
    page
  }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
});

test('form with validation errors should not have accessibility violations', async ({
  page
}) => {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');

  await page.click('button[type="submit"]');
  await page.waitForSelector('[role="region"]', {
    state: 'visible'
  });

  const accessibilityScanResults = await new AxeBuilder({
    page
  }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
});

test('confirmation page should not have accessibility violations', async ({
  page
}) => {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');

  await page.fill('#email', 'valid@example.com');
  await page.fill('#password', 'ValidPass123!');
  await page.click('button[type="submit"]');

  await page.waitForURL('**/confirmation');
  await page.waitForSelector('h1', {
    state: 'visible'
  });

  const accessibilityScanResults = await new AxeBuilder({
    page
  }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
});

test('empty form tab order is logical', async ({
  page
}) => {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');

  await page.waitForSelector('input[name="email"]', {
    state: 'visible'
  });
  await page.waitForSelector('button[type="submit"]', {
    state: 'visible'
  });

  const focusableElements = [
    'input[name="email"]',
    'input[name="password"]',
    'button[type="button"]',
    'button[type="submit"]',
  ];

  await page.keyboard.press('Tab');

  for (const selector of focusableElements) {
    await expect(page.locator(selector)).toBeFocused();
    await page.keyboard.press('Tab');
  }
});

test('error summary receives focus', async ({
  page
}) => {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');

  await page.click('button[type="submit"]');

  const errorSummary = page.getByRole('region', {
    name: /there (is|are) .* problem/i
  });

  await expect(errorSummary).toBeFocused();
});

//
// NOTE FOR SAFARI/WEBKIT:
// When focus is moved programmatically to a non-tabbable element
// (e.g. an error summary with ref and tabIndex="-1"),
// sequential tab order is not consistent across browser engines.
// These tests assert focus placement and keyboard reachability
// rather than exact tab sequence.
//

test('can navigate from email error to email input', async ({
  page
}) => {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');

  // Trigger submit
  await page.fill('input[name="password"]', 'ValidPass123!');
  await page.click('button[type="submit"]');

  const errorToFieldLink = page.locator('a[href="#email"]');
  // Activate the link to reach the email input field
  await errorToFieldLink.press('Enter');
  await expect(page.locator('input[name="email"]')).toBeFocused();
});

test('can navigate from password error to password input', async ({
  page
}) => {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');

  // Trigger submit
  await page.fill('input[name="email"]', 'valid@emailaddress.com');
  await page.click('button[type="submit"]');

  const errorToFieldLink = page.locator('a[href="#password"]');
  // Activate the link to reach the password input field
  await errorToFieldLink.press('Enter');
  await expect(page.locator('input[name="password"]')).toBeFocused();
});