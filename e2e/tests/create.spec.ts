import { test, expect } from '@playwright/test';

test('create', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Car' }).click();
  await page.getByRole('link', { name: '+ Add Car' }).click();
  await page.getByRole('textbox', { name: 'Enter brand...' }).click();
  await page.getByRole('textbox', { name: 'Enter brand...' }).fill('sampleCar');
  await page.getByRole('textbox', { name: 'Enter brand...' }).press('Tab');
  await page.getByRole('textbox', { name: 'Enter model...' }).fill('sampleModel');
  await page.getByRole('textbox', { name: 'Enter model...' }).press('Tab');
  await page.getByPlaceholder('Enter year...').fill('2020');
  await page.getByPlaceholder('Enter year...').press('Tab');
  await page.getByPlaceholder('Enter price...').fill('202020');
  await page.getByRole('button', { name: 'Create Record' }).click();
});