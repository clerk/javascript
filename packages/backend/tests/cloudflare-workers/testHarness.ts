import { exec, suite } from 'uvu';
import * as assert from 'uvu/assert';

import scenario1 from '../../src/tokens/verify3.test';

// Error: Some functionality, such as asynchronous I/O (fetch, Cache API, KV), timeouts (setTimeout, setInterval), and generating random values (crypto.getRandomValues, crypto.subtle.generateKey), can only be performed while handling a request.

// globalAsyncIO: true, // Allow async I/O outside handlers
// globalTimers: true, // Allow setting timers outside handlers
// globalRandom: true, // Allow secure random generation outside handlers

const scenarios = [scenario1];

const run = async () => {
  for (const scenario of scenarios) {
    const test = suite('whatever');
    scenario(test, assert);
    test.run();
  }
  return exec();
};

export default {
  async fetch() {
    const results = await new Promise(resolve => {
      run()
        .then(() => {
          console.log('done');
          resolve('DONE EXECUTION');
        })
        .catch(error => {
          console.error('error', error);
          resolve('FAILED EXECUTION');
        });
    });

    // @ts-ignore
    return Response.json({ ...results });
  },
};
