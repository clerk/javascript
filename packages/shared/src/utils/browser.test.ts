import { inBrowser } from './browser';

describe.concurrent('inBrowser()', () => {
  it('returns true if window is defined', () => {
    expect(inBrowser()).toBe(true);
  });
});
