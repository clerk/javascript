import * as publicExports from '../index';
import * as serverExports from '../server/index';
import * as ssrExports from '../ssr/index';

describe('root public exports', () => {
  it('should not change unexpectedly', () => {
    expect(Object.keys(publicExports).sort()).toMatchSnapshot();
  });
});

describe('server public exports', () => {
  it('should not change unexpectedly', () => {
    expect(Object.keys(serverExports).sort()).toMatchSnapshot();
  });
});

describe('deprecated ssr public exports', () => {
  it('should not change unexpectedly', () => {
    expect(Object.keys(ssrExports).sort()).toMatchSnapshot();
  });
});
