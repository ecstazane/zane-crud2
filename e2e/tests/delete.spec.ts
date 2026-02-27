import { test, expect } from '@playwright/test';

test('delete', async ({ page }) => {
    await page.goto('http://localhost:5174/');
    await page.getByRole('link', { name: 'Car' }).click();
    await page.getByRole('button', { name: 'Archive' }).click();
    await page.getByRole('button', { name: 'Archive' }).nth(1).click();
    await page.getByRole('link', { name: 'Archive' }).click();
    await page.getByRole('combobox').selectOption('Car');
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'Delete Permanently' }).click();
});