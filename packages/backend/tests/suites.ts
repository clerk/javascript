// Import all suites
// TODO: Automate this step using dynamic imports

import redirectTest from './dist/__tests__/createRedirect.test.js';
import exportsTest from './dist/__tests__/exports.test.js';
import factoryTest from './dist/api/__tests__/factory.test.js';
import jwtAssertionsTest from './dist/jwt/__tests__/assertions.test.js';
import cryptoKeysTest from './dist/jwt/__tests__/cryptoKeys.test.js';
import signJwtTest from './dist/jwt/__tests__/signJwt.test.js';
import verifyJwtTest from './dist/jwt/__tests__/verifyJwt.test.js';
import authenticateContextTest from './dist/tokens/__tests__/authenticateContext.test.js';
import authObjectsTest from './dist/tokens/__tests__/authObjects.test.js';
import authStatusTest from './dist/tokens/__tests__/authStatus.test.js';
import clerkRequestTest from './dist/tokens/__tests__/clerkRequest.test.js';
import tokenFactoryTest from './dist/tokens/__tests__/factory.test.js';
import keysTest from './dist/tokens/__tests__/keys.test.js';
import requestTest from './dist/tokens/__tests__/request.test.js';
import verifyTest from './dist/tokens/__tests__/verify.test.js';
import pathTest from './dist/util/__tests__/path.test.js';

// Add them to the suite array
const suites = [
  authenticateContextTest,
  authObjectsTest,
  authStatusTest,
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
  verifyJwtTest,
  verifyTest,
  clerkRequestTest,
];

export default suites;
