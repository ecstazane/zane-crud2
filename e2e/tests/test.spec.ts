import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  //add
  await page.getByRole('link', { name: 'Car' }).click();
  await page.getByRole('link', { name: '+ Add Car' }).click();
  await page.getByRole('textbox', { name: 'Enter brand...' }).click();
  await page.getByRole('textbox', { name: 'Enter brand...' }).fill('Honda');
  await page.getByRole('textbox', { name: 'Enter model...' }).click();
  await page.getByRole('textbox', { name: 'Enter model...' }).fill('Civic');
  await page.getByPlaceholder('Enter year...').click();
  await page.getByPlaceholder('Enter year...').fill('2020');
  await page.getByPlaceholder('Enter price...').click();
  await page.getByPlaceholder('Enter price...').fill('1010');
  await page.getByRole('button', { name: 'Create Record' }).click();
  //edit
  await page.getByRole('link', { name: 'Edit' }).click();
  await page.getByPlaceholder('Enter year...').click();
  await page.getByPlaceholder('Enter year...').click();
  await page.getByPlaceholder('Enter year...').fill('2026');
  //soft delete
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await page.getByRole('button', { name: 'Archive' }).click();
  await page.getByText('Archive ItemAre you sure you').click();
  await page.getByRole('button', { name: 'Archive' }).nth(1).click();
  //permanent delete
  await page.getByRole('link', { name: 'Archive' }).click();
  await page.getByRole('combobox').selectOption('Car');
  await page.getByRole('button', { name: 'Delete' }).first().click();
  await page.getByText('Permanently DeleteAre you').click();
  await page.getByRole('button', { name: 'Delete Permanently' }).click();
  //log
  await page.getByRole('link', { name: 'Audit Logs' }).click();
  await page.getByRole('cell', { name: '373eb3a5' }).first().click();
});