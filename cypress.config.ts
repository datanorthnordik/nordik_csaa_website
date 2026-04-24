import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support/e2e.ts',
    allowCypressEnv: false,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
