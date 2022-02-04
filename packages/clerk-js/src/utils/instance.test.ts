import { validateFrontendApi } from './instance';

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
    ['clerk.abc.123.prod.lclclerk.com', true],
  ])('validates the frontendApi format', (str, expected) => {
    expect(validateFrontendApi(str)).toBe(expected);
  });
});
