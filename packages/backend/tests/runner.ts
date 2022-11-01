import { suite, exec } from 'uvu';

import verifyTestSuite from '../src/tokens/verify-uvu.test';

// All all other suites here
const suites = [verifyTestSuite];

export default async function runTests() {
  suite('hack').run();
  for (const s of suites) {
    s.run();
  }
  return exec(true);
}
