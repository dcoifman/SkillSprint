module.exports = {
  extends: [
    'react-app',
    'react-app/jest',
    'plugin:testing-library/react'
  ],
  plugins: ['testing-library'],
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
    'no-useless-escape': 'warn'
  },
  overrides: [
    {
      files: ['**/*.stories.*'],
      rules: {
        'import/no-anonymous-default-export': 'off'
      }
    }
  ]
}; 