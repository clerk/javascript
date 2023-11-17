// Import all suites
// TODO: Automate this step using dynamic imports
import apiTest from './dist/api/factory.test.js';
import factoryTest from './dist/api/factory.test.js';
import exportsTest from './dist/exports.test.js';
import redirectTest from './dist/redirections.test.js';
import authObjectsTest from './dist/tokens/authObjects.test.js';
import jwtAssertionsTest from './dist/tokens/jwt/assertions.test.js';
import cryptoKeysTest from './dist/tokens/jwt/cryptoKeys.test.js';
import signJwtTest from './dist/tokens/jwt/signJwt.test.js';
import verifyJwtTest from './dist/tokens/jwt/verifyJwt.test.js';
import keysTest from './dist/tokens/keys.test.js';
import requestTest from './dist/tokens/request.test.js';
import verifyTest from './dist/tokens/verify.test.js';
import pathTest from './dist/util/path.test.js';
import utilRequestTest from './dist/util/request.test.js';
import utilsTest from './dist/utils.test.js';

// Add them to the suite array
const suites = [
  apiTest,
  authObjectsTest,
  exportsTest,
  jwtAssertionsTest,
  requestTest,
  utilRequestTest,
  keysTest,
  verifyTest,
  pathTest,
  verifyJwtTest,
  signJwtTest,
  cryptoKeysTest,
  factoryTest,
  redirectTest,
  utilsTest,
];

export default suites;
