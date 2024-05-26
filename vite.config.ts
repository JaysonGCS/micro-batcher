import { defaultExclude, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      exclude: ['test-tool/', 'web/']
    }
  }
});
