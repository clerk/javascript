import * as publicExports from '../index';

describe('/edge-middleware public exports', () => {
  it('should not include a breaking change', () => {
    expect(Object.keys(publicExports).sort()).toMatchSnapshot();
  });
});
