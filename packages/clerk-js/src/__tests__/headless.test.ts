/**
 * @jest-environment node
 */

describe('clerk/headless', () => {
  it('JS-689: should not error when loading headless', () => {
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('../../headless/index.js');
    }).not.toThrow();
  });
});
