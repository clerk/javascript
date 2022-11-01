import runTests from '../runner';

export default {
  async fetch() {
    try {
      const results = await runTests();

      return new Response(JSON.stringify({ passed: true }), {
        status: 200,
        headers: {
          'Content-type': 'application/json',
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ passed: false }), {
        status: 500,
        headers: {
          'Content-type': 'application/json',
        },
      });
    }
  },
};
