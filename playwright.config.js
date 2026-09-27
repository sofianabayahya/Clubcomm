// ClubComm tests in de browser (Besluit 88). Draaien: npm test. Start zelf de app op poort 5055.
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: 'tests',
  testMatch: '*.spec.js',
  timeout: 180000,
  fullyParallel: true,
  retries: 0,
  reporter: process.env.CI ? [['list'], ['github']] : 'list',
  use: { ...devices['Pixel 5'], baseURL: 'http://localhost:5055', locale: 'nl-NL', timezoneId: 'Europe/Amsterdam', serviceWorkers: 'block', actionTimeout: 15000 },
  webServer: { command: 'node server.js', env: { PORT: '5055' }, url: 'http://localhost:5055/?demo', reuseExistingServer: !process.env.CI },
});
