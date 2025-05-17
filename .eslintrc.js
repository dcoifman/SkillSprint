module.exports = {
  extends: [
    'react-app',
    'react-app/jest',
    'plugin:testing-library/react'
  ],
  plugins: [
    'testing-library',
    'react',
    'react-hooks',
    'jsx-a11y',
    'import'
  ],
  rules: {
    'no-unused-vars': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'testing-library/prefer-screen-queries': 'error',
    'testing-library/no-render-in-setup': 'error',
    'testing-library/no-wait-for-empty-callback': 'error',
    'testing-library/prefer-presence-queries': 'error',
    'testing-library/prefer-explicit-assert': 'error',
    'testing-library/prefer-find-by': 'error',
    'import/no-anonymous-default-export': 'warn',
    'no-useless-escape': 'warn',
    'no-mixed-operators': 'warn'
  },
  overrides: [
    {
      files: ['e2e/**/*.js', 'e2e/**/*.ts'],
      rules: {
        'testing-library/prefer-screen-queries': 'off',
        'testing-library/no-render-in-setup': 'off',
        'testing-library/no-wait-for-empty-callback': 'off',
        'testing-library/prefer-presence-queries': 'off',
        'testing-library/prefer-explicit-assert': 'off',
        'testing-library/prefer-find-by': 'off'
      }
    },
    {
      files: ['**/*.stories.*'],
      rules: {
        'import/no-anonymous-default-export': 'off'
      }
    },
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': ['warn', { 
          'argsIgnorePattern': '^_',
          'varsIgnorePattern': '^_'
        }],
        'no-mixed-operators': ['error', {
          'groups': [
            ['&', '|', '^', '~', '<<', '>>', '>>>'],
            ['==', '!=', '===', '!==', '>', '>=', '<', '<='],
            ['&&', '||'],
            ['in', 'instanceof']
          ],
          'allowSamePrecedence': true
        }]
      }
    },
    {
      files: ['supabase/functions/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-mixed-operators': 'off',
        '@typescript-eslint/no-unused-vars': 'warn'
      }
    }
  ],
  settings: {
    react: {
      version: 'detect'
    }
  }
}; 