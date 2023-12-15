// Import all suites
// TODO: Automate this step using dynamic imports

import exportsTest from './dist/__tests__/exports.test.js';
import redirectTest from './dist/__tests__/redirections.test.js';
import utilsTest from './dist/__tests__/utils.test.js';
import factoryTest from './dist/api/__tests__/factory.test.js';
import jwtAssertionsTest from './dist/jwt/__tests__/assertions.test.js';
import cryptoKeysTest from './dist/jwt/__tests__/cryptoKeys.test.js';
import signJwtTest from './dist/jwt/__tests__/signJwt.test.js';
import verifyJwtTest from './dist/jwt/__tests__/verifyJwt.test.js';
import authObjectsTest from './dist/tokens/__tests__/authObjects.test.js';
import tokenFactoryTest from './dist/tokens/__tests__/factory.test.js';
import keysTest from './dist/tokens/__tests__/keys.test.js';
import requestTest from './dist/tokens/__tests__/request.test.js';
import verifyTest from './dist/tokens/__tests__/verify.test.js';
import pathTest from './dist/util/__tests__/path.test.js';
import utilRequestTest from './dist/util/__tests__/request.test.js';

// Add them to the suite array
const suites = [
  authObjectsTest,
  cryptoKeysTest,
  exportsTest,
  factoryTest,
  jwtAssertionsTest,
  keysTest,
  pathTest,
  redirectTest,
  requestTest,
  signJwtTest,
  tokenFactoryTest,
  utilRequestTest,
  utilsTest,
  verifyJwtTest,
  verifyTest,
];

export default suites;
