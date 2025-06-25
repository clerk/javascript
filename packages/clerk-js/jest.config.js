const { name } = require('./package.json');

/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
  displayName: name.replace('@clerk', ''),
  injectGlobals: true,
  globals: {
    __PKG_NAME__: '@clerk/clerk-js',
    __PKG_VERSION__: 'test',
    __BUILD_VARIANT_CHIPS__: false,
  },

  testEnvironment: '<rootDir>/jest.jsdom-with-timezone.ts',
  roots: ['<rootDir>/src'],
  setupFiles: ['./jest.setup.ts'],
  setupFilesAfterEnv: ['./jest.setup-after-env.ts'],
  testRegex: [
    '/__tests__/(.+/)*.*.test.[jt]sx?$',
    '/ui/.*/__tests__/.*.test.[jt]sx?$',
    '/(core|utils)/.*.test.[jt]sx?$',
  ],
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
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\](?!(@formkit/auto-animate/react)).+\\.(js|jsx|mjs|cjs|ts|tsx)$'],
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.m?tsx?$': [
      '@swc/jest',
      {
        jsc: {
          transform: {
            react: {
              runtime: 'automatic',
              importSource: '@emotion/react',
            },
          },
        },
      },
    ],
    '^.+\\.svg$': '<rootDir>/svgTransform.js',
  },
};

module.exports = config;
