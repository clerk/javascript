/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
  displayName: 'shared',
  injectGlobals: true,

  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFiles: ['./setupJest.ts'],
  testRegex: ['/ui/.*/__tests__/.*.test.[jt]sx?$', '/(core|utils)/.*.test.[jt]sx?$'],
  testPathIgnorePatterns: ['/node_modules/'],

  collectCoverage: false,
  coverageProvider: 'v8',
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/'],

  moduleDirectories: ['node_modules', '<rootDir>/src'],
  transform: {
    '^.+\\.m?tsx?$': ['ts-jest', { tsconfig: 'tsconfig.test.json', diagnostics: false }],
  },
};

module.exports = config;
