import * as publicExports from '../index';

describe('/client public exports', () => {
  it('should not include a breaking change', () => {
    expect(publicExports).toMatchSnapshot();
  });
});
