import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { include: ['src/db/__tests__/userLanguage.postgres.integration.test.ts'] },
});
