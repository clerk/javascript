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
    '^.+\\.ts$': 'ts-jest',
  },
  setupFiles: ['<rootDir>/jest.setup.js'],
  collectCoverage: true,
  testPathIgnorePatterns: ['/node_modules/', '/coverage', '/dist/'],
};
