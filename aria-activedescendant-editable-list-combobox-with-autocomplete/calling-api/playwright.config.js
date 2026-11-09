const { defineConfig, devices } = require('@playwright/test');

const PORT = 4173;

module.exports = defineConfig({
    testDir: './tests',
    use: { baseURL: `http://localhost:${PORT}` },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    ],
    webServer: {
        command: `npx http-server -p ${PORT} -c-1 -s`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: true,
    },
});