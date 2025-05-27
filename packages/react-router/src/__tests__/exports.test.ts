import * as publicExports from '../index';
import * as ssrExports from '../ssr/index';

// Foobar

describe('root public exports', () => {
  it('should not change unexpectedly', () => {
    expect(Object.keys(publicExports).sort()).toMatchSnapshot();
  });
});

describe('ssr public exports', () => {
  it('should not change unexpectedly', () => {
    expect(Object.keys(ssrExports).sort()).toMatchSnapshot();
  });
});
