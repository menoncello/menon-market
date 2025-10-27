import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/*.js',
      '**/*.d.ts',
      '**/reports/**',
      '**/.stryker-tmp/**',
      '**/bmad/**',
      '**/docs/**',
      '**/.claude/**',
    ],
  },
  // Main TypeScript configuration (excluding test files)
  {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx', '**/tests/**'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // TypeScript ESLint - Strictest Rules (without type-checking)
      ...tseslint.configs['recommended'].rules,
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-useless-constructor': 'warn',
      '@typescript-eslint/prefer-for-of': 'warn',
      '@typescript-eslint/prefer-as-const': 'warn',
      '@typescript-eslint/no-array-constructor': 'warn',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/no-inferrable-types': 'warn',
      '@typescript-eslint/array-type': ['warn', { default: 'array-simple' }],
      '@typescript-eslint/consistent-type-definitions': ['warn', 'interface'],
      '@typescript-eslint/method-signature-style': ['warn', 'property'],

      // Core ESLint - Code Quality
      complexity: ['error', 15],
      'max-depth': ['error', 4],
      'max-lines': ['error', { max: 500, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
      'max-nested-callbacks': ['error', 4],
      'max-params': ['error', 6],
      'max-statements': ['error', 25],
      'no-console': 'off', // CLI needs console
      'no-duplicate-imports': 'warn',
      'no-else-return': 'warn',
      'no-lonely-if': 'warn',
      'no-negated-condition': 'warn',
      'no-nested-ternary': 'warn',
      'no-return-await': 'warn',
      'no-unneeded-ternary': 'warn',
      'no-useless-return': 'warn',
      'prefer-const': 'error',
      'prefer-template': 'warn',
      yoda: 'warn',
    },
  },
  // Test files - Restricted rules (still maintain code quality)
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx', '**/tests/**/*.ts', '**/tests/**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
        vi: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // Allow some testing-specific flexibilities
      '@typescript-eslint/no-explicit-any': 'off', // Mocks and test data often use any
      '@typescript-eslint/no-non-null-assertion': 'off', // Test assertions
      '@typescript-eslint/no-unused-vars': 'off', // Test utilities and setup
      '@typescript-eslint/explicit-function-return-type': 'off', // Test functions
      '@typescript-eslint/no-empty-function': 'off', // Empty test functions

      // Keep complexity and size limits for maintainability
      'max-lines': ['error', { max: 500, skipBlankLines: true, skipComments: true }], // Slightly more lenient
      'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }], // Slightly more lenient
      'max-nested-callbacks': ['error', 4], // Slightly more lenient
      'max-statements': ['error', 25], // Slightly more lenient
      'max-params': ['error', 6], // Slightly more lenient

      // Keep most other rules for code quality
      'no-duplicate-imports': 'warn',
      'no-else-return': 'warn',
      'no-lonely-if': 'warn',
      'no-negated-condition': 'warn',
      'no-nested-ternary': 'warn',
      'no-return-await': 'warn',
      'no-unneeded-ternary': 'warn',
      'no-useless-return': 'warn',
      'prefer-const': 'error',
      'prefer-template': 'warn',
      yoda: 'warn',
    },
  },
];
