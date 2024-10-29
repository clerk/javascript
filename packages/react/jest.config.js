const { name, version } = require('./package.json');

module.exports = {
  displayName: name.replace('@clerk', ''),
  injectGlobals: true,

  roots: ['<rootDir>/src'],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>../../jest.setup-after-env.ts'],

  moduleDirectories: ['node_modules', '<rootDir>/src'],
  transform: {
    '^.+\\.m?tsx?$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },

  testRegex: ['/ui/.*/__tests__/.*.test.[jt]sx?$', '/.*.test.[jt]sx?$'],
  testPathIgnorePatterns: ['/node_modules/'],

  globals: {
    __DEV__: true,
    __OMIT_REMOTE_HOSTED_CODE__: false,
    PACKAGE_NAME: name,
    PACKAGE_VERSION: version,
  },
};
