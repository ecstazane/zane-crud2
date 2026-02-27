import { test, expect } from '@playwright/test';

test('read', async ({ page }) => {
    await page.goto('http://localhost:5174/');
    await page.getByRole('link', { name: 'Car' }).click();
    await page.getByRole('cell', { name: 'sampleModel' }).click();
    await expect(page.getByText('sampleCar').nth(2)).toBeVisible();
    await page.getByRole('button').filter({ hasText: /^$/ }).click();
});