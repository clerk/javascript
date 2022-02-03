module.exports = {
  // The root of your source code, typically /src
  // `<rootDir>` is a token Jest substitutes
  roots: ['<rootDir>/src'],
  testEnvironment: 'jsdom',

  // Global settings
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    },
  },

  setupFilesAfterEnv: ['<rootDir>../../setupJest.afterEnv.js'],

  // Coverage
  collectCoverageFrom: ['**/*.{js,jsx,ts,tsx}'],

  // Jest transformations -- this adds support for TypeScript
  // using ts-jest
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },

  // Test spec file resolution pattern
  // Matches parent folder `__tests__` and filename
  // should contain `test` or `spec`.
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',

  // Module file extensions for importings
  transformIgnorePatterns: ['^.+\\.module\\.(css|sass|scss)$'],

  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^testUtils': '<rootDir>/../../shared/utils/testUtils',
  },

  testPathIgnorePatterns: ['/node_modules/'],
};
