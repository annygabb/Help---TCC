import { defineConfig } from 'vitest/config';

export default defineConfig({

  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },

  test: {
   
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.js'],
    include: ['tests/**/*.{test,spec}.{js,jsx}', 'pages/__tests__/**/*.{test,spec}.{js,jsx}'],
    css: false,

    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/**',
        'tests/**',
        '**/*.config.js',
        'vitest.setup.js',
        'dist/**',
        '.vite/**',
        'coverage/**',
      ],
    },
  },
});
