module.exports = {
  // The root of your source code, typically /src
  // `<rootDir>` is a token Jest substitutes
  roots: ['<rootDir>'],
  testEnvironment: 'jsdom',

  // Global settings
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    },
  },

  // Coverage
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/index.ts',
    '!**/*.config.{js,ts}',
    '!**/coverage/**',
    '!**/node_modules/**',
  ],

  setupFilesAfterEnv: ['./../../setupJest.afterEnv.js'],

  // Jest transformations -- this adds support for TypeScript
  // using ts-jest
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '\\.svg?$': '<rootDir>/utils/svgTransform.js',
  },

  // Test spec file resolution pattern
  // Matches parent folder `__tests__` and filename
  // should contain `test` or `spec`.
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',

  // Module file extensions for importings
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|ts|tsx)$',
    '^.+\\.module\\.(css|sass|scss)$',
  ],

  // Use an ES6 Proxy to mock CSS Modules and resource our testUtils
  // https://jestjs.io/docs/en/webpack#mocking-css-modules
  moduleNameMapper: {
    testUtils: '<rootDir>/utils/testUtils',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
};
