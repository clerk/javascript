const { name } = require('./package.json');

const uiRetheme = process.env.CLERK_UI_RETHEME === '1' || process.env.CLERK_UI_RETHEME === 'true';

/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
  displayName: name.replace('@clerk', ''),
  injectGlobals: true,

  testEnvironment: '<rootDir>/jest.jsdom-with-timezone.ts',
  roots: ['<rootDir>/src'],
  setupFiles: ['./jest.setup.ts'],
  setupFilesAfterEnv: ['./jest.setup-after-env.ts'],
  testRegex: [
    '/__tests__/(.+/)*.*.test.[jt]sx?$',
    '/ui/.*/__tests__/.*.test.[jt]sx?$',
    '/(core|utils)/.*.test.[jt]sx?$',
  ],
  testPathIgnorePatterns: ['/node_modules/', uiRetheme ? '<rootDir>/src/ui/' : '<rootDir>/src/ui-retheme/'],
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
