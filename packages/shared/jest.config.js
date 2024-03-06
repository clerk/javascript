import packageJson from './package.json' assert { type: 'json' };

/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
  preset: 'ts-jest/presets/default-esm',
  moduleNameMapper: {
    '(.+)\\.js': '$1',
  },
  displayName: packageJson.name.replace('@clerk', ''),
  injectGlobals: true,

  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFiles: ['./jest.setup.ts'],

  collectCoverage: false,
  coverageProvider: 'v8',
  coverageDirectory: 'coverage',

  moduleDirectories: ['node_modules', '<rootDir>/src'],
};

export default config;
