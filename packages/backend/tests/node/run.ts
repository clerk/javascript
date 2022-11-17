import QUnit from 'qunit';
import { exit } from 'node:process';
import runTests from '../runner';

(async () => {
  const stats = await runTests(QUnit);

  if (stats.failed > 0) {
    exit(1);
  }
})();
