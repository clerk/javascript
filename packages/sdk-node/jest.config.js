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
  // Jest currently does not support package.json subpath imports
  // so we manually map them to the actual files. See @clerk/backend/package.json
  moduleNameMapper: {
    '#crypto': '@clerk/backend/dist/runtime/node/crypto.js',
  },
};
