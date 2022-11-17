import QUnit from 'qunit';
import runTests from '../runner';

export default {
  async fetch() {
    const stats = await runTests(QUnit);

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: {
        'Content-type': 'application/json',
      },
    });
  },
};
