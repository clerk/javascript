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
    ['clerk.prod.lclclerk.com', true],
    ['clerk.dev.lclclerk.com', true],
    ['clerk.api.example1-do_main.com', true],
    ['clerk.example1-do_main.com', true],
    ['clerk.com', false],
    ['whatever.com', false],
  ])('validates the frontendApi format', (str, expected) => {
    expect(validateFrontendApi(str)).toBe(expected);
  });
});
