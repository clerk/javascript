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
    '!**/index.nocomponents.ts',
    '!**/index.nocomponents.browser.ts',
    '!**/coverage/**',
    '!**/dist/**',
    '!**/node_modules/**',
  ],

  // Jest transformations -- this adds support for TypeScript
  // using ts-jest
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.svg$': '<rootDir>../shared/utils/svgTransform.js',
  },

  // For mocking fetch
  automock: false,
  setupFiles: ['./setupJest.js'],
  setupFilesAfterEnv: ['<rootDir>../../setupJest.afterEnv.js'],

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
    '^react$': '<rootDir>../../node_modules/react',
  },

  testPathIgnorePatterns: ['/node_modules/'],
};
