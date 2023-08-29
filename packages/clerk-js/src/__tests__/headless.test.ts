/**
 * @jest-environment node
 */

describe('clerk/headless', () => {
  it('JS-689: should not error when loading headless', () => {
    expect(() => {
      require('../../headless/index.js');
    }).not.toThrow();
  });
});
