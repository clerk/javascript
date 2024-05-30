const { name } = require('./package.json');
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig');

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  globals: {
    PACKAGE_NAME: '@clerk/tailwindcss-transformer',
    PACKAGE_VERSION: '0.0.0-test',
  },
  displayName: name.replace('@clerk', ''),
  injectGlobals: true,
  roots: ['<rootDir>'],
  testMatch: ['**/?(*.)+(spec|test).+(ts|tsx|js)'],
  testEnvironment: 'node',
  transform: { '^.+\\.m?tsx?$': 'ts-jest' },
  testPathIgnorePatterns: ['/node_modules/', '/jest/', '/.turbo', '/dist/'],
  modulePaths: [compilerOptions.baseUrl],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
};
