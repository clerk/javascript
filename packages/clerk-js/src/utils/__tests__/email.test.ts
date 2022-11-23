import { buildEmailAddress } from '../email';

test.each([
  ['', 'support@clerk.dev'],
  ['foo.com', 'support@foo.com'],
  ['clerk.clerk.dev', 'support@clerk.dev'],
  ['clerk.foo.com', 'support@foo.com'],
  ['clerk.foo.bar.com', 'support@foo.bar.com'],
])('.buildSupportEmail(%s, %s)', (frontendApi, email) => {
  expect(buildEmailAddress({ localPart: 'support', frontendApi })).toBe(email);
});
