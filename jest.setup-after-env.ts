import { afterAll, beforeAll } from '@jest/globals';

// eslint-disable-next-line @typescript-eslint/unbound-method
const ogToLocaleDateString = Date.prototype.toLocaleDateString;

beforeAll(() => {
  // Make sure our tests always use the same locale
  Date.prototype.toLocaleDateString = function () {
    return ogToLocaleDateString.call(this, 'en-US');
  };
});

afterAll(() => {
  Date.prototype.toLocaleDateString = ogToLocaleDateString;
});
