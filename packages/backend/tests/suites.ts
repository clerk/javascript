// Import all suites
// TODO: Automate this step using dynamic imports
import apiTest from './dist/api/factory.test.js';
import authStateTest from './dist/tokens/authState.test.js';
import pathTest from './dist/util/path.test.js';
import verifyTest from './dist/tokens/verify.test.js';

// Add them to the suite array
const suites = [apiTest, authStateTest, verifyTest, pathTest];

export default suites;
