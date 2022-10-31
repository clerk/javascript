import { beforeAll, afterAll } from '@jest/globals';

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
