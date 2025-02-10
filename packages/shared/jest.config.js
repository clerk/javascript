const { name } = require('./package.json');
const { version: clerkJsVersion } = require('../clerk-js/package.json');

/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
  displayName: name.replace('@clerk', ''),
  injectGlobals: true,

  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFiles: ['./jest.setup.ts'],

  collectCoverage: false,
  coverageProvider: 'v8',
  coverageDirectory: 'coverage',

  moduleDirectories: ['node_modules', '<rootDir>/src'],
  transform: {
    '^.+\\.m?tsx?$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },

  globals: {
    JS_PACKAGE_VERSION: clerkJsVersion,
  },
};

module.exports = config;
