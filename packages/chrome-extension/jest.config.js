const { name, version } = require('./package.json');

module.exports = {
  displayName: name.replace('@clerk', ''),
  injectGlobals: true,

  roots: ['<rootDir>/src'],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>../../jest.setup-after-env.ts'],

  moduleDirectories: ['node_modules', '<rootDir>/src'],
  transform: {
    '^.+\\.m?tsx?$': ['ts-jest', { diagnostics: false }],
  },

  testRegex: ['/src/.*.test.[jt]sx?$'],
  testPathIgnorePatterns: ['/node_modules/'],

  globals: {
    __DEV__: true,
    PACKAGE_NAME: name,
    PACKAGE_VERSION: version,
  },
};
