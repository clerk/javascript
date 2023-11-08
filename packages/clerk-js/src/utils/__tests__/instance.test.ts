import { validateFrontendApi } from '../instance';

describe('validateFrontendApi(str)', () => {
  it.each([
    [null, false],
    [undefined, false],
    ['', false],
    ['clerk', false],
    ['clerk.abcef', false],
    ['clerk.abcef.12345', true],
    ['clerk.abcef.12345.lcl', true],
    ['clerk.abcef.12345.lcl.dev', true],
    ['clerk.abcef.12345.stg.dev', true],
    ['clerk.abcef.12345.lclstage.dev', true],
    ['clerk.abcef.12345.stgstage.dev', true],
    ['clerk.abcef.12345.dev.lclclerk.com', true],
    ['clerk.abcef.12345.stg.lclclerk.com', true],
    ['clerk.abcef.12345.prod.lclclerk.com', true],
    ['clerk.prod.lclclerk.com', true],
    ['clerk.com.lclclerk.com', true],
    ['clerk.happy.hippo-1.lcl.dev', true],
    ['clerk.sad.panda-99.stg.dev', true],
    ['clerk.foo.bar-12.dev.lclclerk.com', true],
    ['clerk.foo.bar-12.stg.lclclerk.com', true],
    ['clerk.com', false],
    ['whatever.com', false],
  ])('validates the frontendApi format', (str, expected) => {
    expect(validateFrontendApi(str)).toBe(expected);
  });
});
