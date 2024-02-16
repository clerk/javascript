const { name } = require('./package.json');
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig');

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  globals: {
    PACKAGE_NAME: '@clerk/elements',
    PACKAGE_VERSION: '0.0.0-test',
  },
  displayName: name.replace('@clerk', ''),
  injectGlobals: true,
  roots: ['<rootDir>'],
  testMatch: ['**/?(*.)+(spec|test).+(ts|tsx|js)'],
  testEnvironment: 'jsdom',
  transform: { '^.+\\.m?tsx?$': 'ts-jest' },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/jest/', '/.turbo', '/dist/', '/examples'],
  modulePaths: [compilerOptions.baseUrl],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
};
