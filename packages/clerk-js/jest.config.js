/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
  displayName: 'clerk-js',
  injectGlobals: true,

  testEnvironment: '<rootDir>/jsdom-with-timezone.ts',
  roots: ['<rootDir>/src'],
  setupFiles: ['./setupJest.ts'],
  setupFilesAfterEnv: ['./setupJestAfterEnv.ts'],
  testRegex: ['/ui/.*/__tests__/.*.test.[jt]sx?$', '/(core|utils)/.*.test.[jt]sx?$'],
  testPathIgnorePatterns: ['/node_modules/'],

  collectCoverage: false,
  coverageProvider: 'v8',
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/'],
  // collectCoverageFrom: [
  //   '**/*.{js,jsx,ts,tsx}',
  //   '!**/*.d.ts',
  //   '!**/index.ts',
  //   '!**/index.browser.ts',
  //   '!**/index.headless.ts',
  //   '!**/index.headless.browser.ts',
  //   '!**/coverage/**',
  //   '!**/dist/**',
  //   '!**/node_modules/**',
  // ],

  moduleDirectories: ['node_modules', '<rootDir>/src'],
  transform: {
    '^.+\\.m?tsx?$': ['ts-jest', { tsconfig: 'tsconfig.test.json', diagnostics: false }],
    // '^.+\\.m?tsx?$': ['@swc/jest'],
    '^.+\\.svg$': '<rootDir>/svgTransform.js',
  },
};

module.exports = config;
