module.exports = {
  displayName: 'clerk-js',
  injectGlobals: true,

  roots: ['<rootDir>/src'],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>../../setupJest.afterEnv.ts'],

  moduleDirectories: ['node_modules', '<rootDir>/src'],
  transform: {
    '^.+\\.m?tsx?$': ['ts-jest', { tsconfig: 'tsconfig.test.json', diagnostics: false }],
  },

  testRegex: ['/ui/.*/__tests__/.*.test.[jt]sx?$', '/(core|utils)/.*.test.[jt]sx?$'],
  testPathIgnorePatterns: ['/node_modules/'],
};
