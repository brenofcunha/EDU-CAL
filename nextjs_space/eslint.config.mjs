// Flat ESLint config for `yarn lint` (`eslint .`). Next.js 16 removed `next lint`,
// so this file is the lint entry point; eslint-config-next 16 ships flat configs.
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  globalIgnores(['.next/**', '.build/**', 'node_modules/**', 'out/**', 'build/**', 'next-env.d.ts']),
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      'react/no-unescaped-entities': 'off',
      // Existing client data-loading effects intentionally update local state.
      'react-hooks/set-state-in-effect': 'off',
      // next.config.js and tailwind.config.ts are intentionally CommonJS configs.
      '@typescript-eslint/no-require-imports': 'off',
      // The UI command component uses an empty extension interface for its public API.
      '@typescript-eslint/no-empty-object-type': 'off',
      // The external chat integration is intentionally loaded by script.
      '@next/next/no-sync-scripts': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
]);
