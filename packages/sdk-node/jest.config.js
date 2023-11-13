const { name } = require('./package.json');

module.exports = {
  displayName: name.replace('@clerk', ''),
  roots: ['<rootDir>/src'],
  testMatch: ['**/?(*.)+(spec|test).+(ts|tsx|js)'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  setupFiles: ['<rootDir>/jest.setup.js'],
  collectCoverage: true,
  testPathIgnorePatterns: ['/node_modules/', '/coverage', '/.turbo', '/dist/', '/examples'],
};
