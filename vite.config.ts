import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Relative base so the build works on GitHub Pages (served from /<repo-name>/).
  base: './',
  build: {
    rollupOptions: {
      // The game, plus a static guide page for search engines.
      input: {
        main: resolve(__dirname, 'index.html'),
        guide: resolve(__dirname, 'guide/index.html'),
      },
    },
  },
  test: {
    include: ['tests/**/*.test.ts'],
  },
});
