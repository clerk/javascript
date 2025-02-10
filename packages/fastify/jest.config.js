const { name } = require('./package.json');

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  displayName: name.replace('@clerk', ''),
  globals: {
    PACKAGE_NAME: '@clerk/fastify',
    PACKAGE_VERSION: '0.0.0-test',
  },
  injectGlobals: true,
  roots: ['<rootDir>/src'],
  testMatch: ['**/?(*.)+(spec|test).+(ts|tsx|js)'],
  transform: { '^.+\\.m?tsx?$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }] },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/jest/', '/.turbo', '/dist'],
  collectCoverage: true,
  coverageProvider: 'v8',
  coverageDirectory: 'coverage',
};
