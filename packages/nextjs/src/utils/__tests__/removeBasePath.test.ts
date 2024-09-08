import { removeBasePath } from '../removeBasePath';

describe('removeBasePath', () => {
  afterAll(() => {
    process.env.__NEXT_ROUTER_BASEPATH = undefined;
  });

  it('should remove basePath from argument', () => {
    process.env.__NEXT_ROUTER_BASEPATH = '/basePath';
    expect(removeBasePath('/basePath/home')).toBe('/home');
  });

  it('should return argument unchanged when basePath is undefined', () => {
    process.env.__NEXT_ROUTER_BASEPATH = undefined;
    expect(removeBasePath('/basePath/home')).toBe('/basePath/home');
  });
});
