import { buildEmailAddress } from '../email';

test.each([
  ['', 'support@clerk.com'],
  ['foo.com', 'support@foo.com'],
  ['clerk.clerk.com', 'support@clerk.com'],
  ['clerk.foo.com', 'support@foo.com'],
  ['clerk.foo.bar.com', 'support@foo.bar.com'],
])('.buildSupportEmail(%s, %s)', (frontendApi, email) => {
  expect(buildEmailAddress({ localPart: 'support', frontendApi })).toBe(email);
});
