import QUnit from 'qunit';
import runTests from '../runner';

(async () => {
  globalThis.stats = await runTests(QUnit);
})();
