import { isStaging } from '../instance';

describe('isStaging', () => {
  it.each([
    ['clerk', false],
    ['clerk.com', false],
    ['whatever.com', false],
    ['clerk.abcef', false],
    ['clerk.abcef.12345', false],
    ['clerk.abcef.12345.lcl', false],
    ['clerk.abcef.12345.lcl.dev', false],
    ['clerk.abcef.12345.stg.dev', false],
    ['clerk.abcef.12345.lclstage.dev', true],
    ['clerk.abcef.12345.stgstage.dev', true],
    ['clerk.abcef.12345.clerkstage.dev', true],
    ['clerk.abcef.12345.accountsstage.dev', true],
  ])('validates the frontendApi format', (str, expected) => {
    expect(isStaging(str)).toBe(expected);
  });
});
