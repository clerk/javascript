const { name } = require('./package.json');

module.exports = {
  displayName: name.replace('@clerk', ''),
  globals: {
    PACKAGE_NAME: '@clerk/express',
    PACKAGE_VERSION: '0.0.0-test',
  },
  roots: ['<rootDir>/src'],
  testMatch: ['**/?(*.)+(test).+(ts)'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },
  setupFiles: ['<rootDir>/jest.setup.js'],
  collectCoverage: true,
  coveragePathIgnorePatterns: ['__tests__'],
  testPathIgnorePatterns: ['/node_modules/', '/coverage', '/dist/'],
};
