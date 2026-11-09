const { test, expect } = require('@playwright/test');

// Stub the API: api.js filters with startsWith(query).
test.beforeEach(async ({ page }) => {
    await page.route('**/dummyjson.com/products**', (route) =>
        route.fulfill({
            json: {
                products: [
                    { id: 1, title: 'Amazon Echo Plus' },
                    { id: 2, title: 'Apple' },
                    { id: 3, title: 'Avocado' },
                ],
            },
        })
    );
    await page.goto('/index.html');
});

const comboboxIn = (page) => page.getByRole('combobox', { name: 'Search products' });
const listboxIn = (page) => page.locator('#autocomplete-listbox');

// Type "a" and wait for the stubbed options (this also covers the 300 ms debounce).
async function openList(page) {
    const input = comboboxIn(page);
    await input.fill('a');
    const options = listboxIn(page).getByRole('option');
    await expect(options).toHaveCount(3);
    return { input, options };
}

// The core assertion of the pattern: the option with this label is the ONE
// selected option, the input's aria-activedescendant points at its id, and
// DOM focus is still on the input.
async function expectActive(page, input, label) {
    const active = page.getByRole('option', { selected: true });
    await expect(active).toHaveText(label);
    await expect(active).toHaveCount(1);
    const id = await active.getAttribute('id');
    expect(id).toBeTruthy();
    await expect(input).toHaveAttribute('aria-activedescendant', id);
    await expect(input).toBeFocused();
}

async function expectNothingActive(page, input) {
    await expect(input).not.toHaveAttribute('aria-activedescendant');
    await expect(page.getByRole('option', { selected: true })).toHaveCount(0);
}

test('typing opens the list; nothing is active until the user navigates', async ({ page }) => {
    const input = comboboxIn(page);
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(listboxIn(page)).toBeHidden();

    await openList(page);

    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await expect(input).toHaveAttribute('aria-controls', 'autocomplete-listbox');
    await expect(listboxIn(page)).toBeVisible();
    await expectNothingActive(page, input);
    await expect(input).toBeFocused();
});

test('ArrowDown makes the first option active while focus stays on the input', async ({ page }) => {
    const { input } = await openList(page);

    await input.press('ArrowDown');

    await expectActive(page, input, 'Amazon Echo Plus');
});

test('ArrowDown and ArrowUp move the active option', async ({ page }) => {
    const { input } = await openList(page);

    await input.press('ArrowDown');
    await input.press('ArrowDown');
    await expectActive(page, input, 'Apple');

    await input.press('ArrowUp');
    await expectActive(page, input, 'Amazon Echo Plus');
});

test('ArrowDown on the last option wraps to the first', async ({ page }) => {
    const { input } = await openList(page);

    await input.press('ArrowDown');
    await input.press('ArrowDown');
    await input.press('ArrowDown');
    await expectActive(page, input, 'Avocado');

    await input.press('ArrowDown');
    await expectActive(page, input, 'Amazon Echo Plus');
});

test('ArrowUp on the first option wraps to the last', async ({ page }) => {
    const { input } = await openList(page);

    await input.press('ArrowDown');
    await expectActive(page, input, 'Amazon Echo Plus');

    await input.press('ArrowUp');
    await expectActive(page, input, 'Avocado');
});

test('Enter chooses the active option and closes the list', async ({ page }) => {
    const { input } = await openList(page);

    await input.press('ArrowDown');
    await input.press('ArrowDown');
    await input.press('Enter');

    await expect(input).toHaveValue('Apple');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(listboxIn(page)).toBeHidden();
    await expectNothingActive(page, input);
    await expect(input).toBeFocused();
});

test('Escape closes the list, keeps the typed text and clears the active option', async ({ page }) => {
    const { input } = await openList(page);
    await input.press('ArrowDown');
    await expectActive(page, input, 'Amazon Echo Plus');

    await input.press('Escape');

    await expect(input).toHaveValue('a');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(listboxIn(page)).toBeHidden();
    await expectNothingActive(page, input);
});

test('ArrowLeft returns to the textbox: no active option, list stays open', async ({ page }) => {
    const { input } = await openList(page);
    await input.press('ArrowDown');
    await expectActive(page, input, 'Amazon Echo Plus');

    await input.press('ArrowLeft');

    await expectNothingActive(page, input);
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await expect(listboxIn(page)).toBeVisible();
});

test('hovering activates an option and clicking chooses it without losing focus', async ({ page }) => {
    const { input, options } = await openList(page);

    await options.nth(1).hover();
    await expectActive(page, input, 'Apple');

    await options.nth(1).click();

    await expect(input).toHaveValue('Apple');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(input).toBeFocused();
});