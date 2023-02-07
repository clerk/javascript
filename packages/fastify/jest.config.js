/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  displayName: 'fastify',
  injectGlobals: true,
  roots: ['<rootDir>/src'],
  testMatch: ['**/?(*.)+(spec|test).+(ts|tsx|js)'],
  transform: { '^.+\\.m?tsx?$': 'ts-jest' },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/jest/'],
  // Jest currently does not support package.json subpath imports
  // so we manually map them to the actual files. See @clerk/backend/package.json
  moduleNameMapper: {
    '#crypto': '@clerk/backend/dist/runtime/node/crypto.js',
    '#fetch': '@clerk/backend/dist/runtime/node/fetch.js',
  },
  collectCoverage: true,
  coverageProvider: 'v8',
  coverageDirectory: 'coverage',
};
