import { test, expect } from '@playwright/test';

test('update', async ({ page }) => {
    await page.goto('http://localhost:5174/');
    await page.getByRole('link', { name: 'Car' }).click();
    await page.getByRole('link', { name: 'Edit' }).click();
    await page.getByRole('textbox', { name: 'Enter brand...' }).click();
    await page.getByRole('textbox', { name: 'Enter brand...' }).fill('sampleCaredited');
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await expect(page.locator('tbody')).toContainText('sampleCaredited');
});