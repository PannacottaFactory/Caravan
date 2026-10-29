import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Relative base so the build works on GitHub Pages (served from /<repo-name>/).
  base: './',
  test: {
    include: ['tests/**/*.test.ts'],
  },
});
