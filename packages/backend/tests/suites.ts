// Import all suites
// TODO: Automate this step using dynamic imports
import apiTest from './dist/api/factory.test.js';
import requestTest from './dist/tokens/request.test.js';
import keysTest from './dist/tokens/keys.test.js';
import pathTest from './dist/util/path.test.js';
import verifyTest from './dist/tokens/verify.test.js';
import jwtTest from './dist/tokens/jwt.test.js';

import utilRequestTest from './dist/util/request.test.js';

// Add them to the suite array
const suites = [apiTest, requestTest, utilRequestTest, keysTest, verifyTest, pathTest, jwtTest];

export default suites;
