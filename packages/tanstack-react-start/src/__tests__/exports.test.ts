import * as errorsExports from '../errors';
import * as publicExports from '../index';
import * as legacyExports from '../legacy';
import * as serverExports from '../server/index';
import * as webhooksExports from '../webhooks';

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

describe('errors public exports', () => {
  it('should not change unexpectedly', () => {
    expect(Object.keys(errorsExports).sort()).toMatchSnapshot();
  });
});

describe('webhooks public exports', () => {
  it('should not change unexpectedly', () => {
    expect(Object.keys(webhooksExports).sort()).toMatchSnapshot();
  });
});

describe('legacy public exports', () => {
  it('should not change unexpectedly', () => {
    expect(Object.keys(legacyExports).sort()).toMatchSnapshot();
  });
});
