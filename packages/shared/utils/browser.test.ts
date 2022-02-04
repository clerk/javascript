import { inBrowser } from './browser';

describe('inBrowser()', () => {
  it('returns true if window is defined', () => {
    expect(inBrowser()).toBe(true);
  });
});
