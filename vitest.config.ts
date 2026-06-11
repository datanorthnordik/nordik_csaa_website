import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '.claude/**',
      'nordik_csaa_website/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'coverage/',
        'cypress/',
        'src/main.tsx',
        '**/*.config.*',
        '**/*.d.ts',
      ],
    },
  },
});
