import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      include: [
        'src/context/LanguageContext.tsx',
        'src/context/ProgressContext.tsx',
        'src/context/LearningContext.tsx',
        'src/data/missions.ts',
        'src/content/schemas.ts',
        'src/repositories/**/*.ts',
        'src/domain/**/*.ts',
        'src/lib/**/*.ts',
      ],
      thresholds: {
        statements: 90,
        branches: 70,
        functions: 90,
        lines: 95,
      },
    },
  },
});
