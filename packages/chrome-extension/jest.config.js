module.exports = {
  displayName: 'clerk-js',
  injectGlobals: true,

  roots: ['<rootDir>/src'],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>../../setupJest.afterEnv.ts'],

  moduleDirectories: ['node_modules', '<rootDir>/src'],
  transform: {
    '^.+\\.m?tsx?$': ['ts-jest', { diagnostics: false }],
  },

  testRegex: ['/src/.*.test.[jt]sx?$'],
  testPathIgnorePatterns: ['/node_modules/'],
};
