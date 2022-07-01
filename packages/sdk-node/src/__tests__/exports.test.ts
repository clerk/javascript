import * as moduleExports from '..';

describe('module exports', () => {
  it.skip('should not change unless explicitly set', () => {
    expect(moduleExports).toMatchSnapshot();
  });
});
