import { expect, test } from 'vitest';

import { buildAccountsBaseUrl } from '../buildAccountsBaseUrl';

test.each([
  ['', ''],
  [undefined, ''],
  ['one-two-three.clerk.accountsstage.dev', 'https://one-two-three.accountsstage.dev'],
  ['one-two-three.clerk.accounts.dev', 'https://one-two-three.accounts.dev'],
  ['clerk.accounts.example.com', 'https://accounts.example.com'],
  ['clerk.example.com', 'https://accounts.example.com'],
])('buildAccountsBaseUrl(%s)', (frontendApi, accountsBaseUrl) => {
  expect(buildAccountsBaseUrl(frontendApi)).toBe(accountsBaseUrl);
});
