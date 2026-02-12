import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './e2e/tests',
    timeout: 30 * 1000,
    expect: {
        timeout: 5000,
    },
    use: {
        baseURL: 'http://localhost:3000',
        headless: false,
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        launchOptions: {
            slowMo: 1000,
        },


    },
});
