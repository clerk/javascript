import * as moduleExports from '..';

describe('module exports', () => {
  it('should not change unless explicitly set', () => {
    expect(moduleExports).toMatchSnapshot();
  });
});
