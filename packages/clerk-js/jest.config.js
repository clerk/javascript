module.exports = {
  // The root of your source code, typically /src
  // `<rootDir>` is a token Jest substitutes
  roots: ['<rootDir>/src'],
  testEnvironment: 'jsdom',

  // Global settings
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    },
  },

  // Coverage
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/index.ts',
    '!**/index.browser.ts',
    '!**/index.headless.ts',
    '!**/index.headless.browser.ts',
    '!**/coverage/**',
    '!**/dist/**',
    '!**/node_modules/**',
  ],

  // Jest transformations -- this adds support for TypeScript
  // using ts-jest
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },

  // For mocking fetch
  automock: false,
  setupFiles: ['./setupJest.ts'],
  setupFilesAfterEnv: ['<rootDir>../../setupJest.afterEnv.ts'],
  injectGlobals: true,

  // Test spec file resolution pattern
  // Matches parent folder `__tests__` and filename
  // should contain `test` or `spec`.
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',

  // Module file extensions for importings
  transformIgnorePatterns: ['^.+\\.module\\.(css|sass|scss)$'],

  moduleNameMapper: {
    '^ui/(.*)': '<rootDir>/src/ui/$1',
    '^core/(.*)': '<rootDir>/src/core/$1',
    '^utils/(.*)$': '<rootDir>/src/utils/$1',
    '^utils': '<rootDir>/src/utils',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },

  testPathIgnorePatterns: ['/node_modules/'],
};
