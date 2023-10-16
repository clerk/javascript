/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
  displayName: 'shared',
  injectGlobals: true,

  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFiles: ['./setupJest.ts'],

  collectCoverage: false,
  coverageProvider: 'v8',
  coverageDirectory: 'coverage',

  moduleDirectories: ['node_modules', '<rootDir>/src'],
  transform: {
    '^.+\\.m?tsx?$': ['ts-jest', { tsconfig: 'tsconfig.test.json', diagnostics: false }],
    // '^.+\\.svg$': '<rootDir>/svgTransform.js',
  },
};

module.exports = config;
