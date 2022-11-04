// Import all suites
// TODO: Automate this step using dynamic imports
import authStateTest from './dist/tokens/authState.test.js';
import pathTest from './dist/util/path.test.js';
import verifyTest from './dist/tokens/verify.test.js';

// Add them to the suite array
const suites = [authStateTest, pathTest, verifyTest];

export default suites;
