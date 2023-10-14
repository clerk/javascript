module.exports = {
  displayName: 'clerk-js',
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
};
