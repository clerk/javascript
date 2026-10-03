import { test, expect } from '../../fixtures.ts';

test('the token cache keeps the session across a relaunch, and a new scope starts signed out', async ({ host, screen }) => {
  const user = await host.seedUser({ instance: 'with-email-codes' });
  const seeded = await host.launch({ signedInAs: user, screen: 'tokenCache' });
  expect(seeded.userId).toBe(user.id);

  await host.launch({ instance: 'with-email-codes', screen: 'tokenCache', keepStorage: true });
  const restored = await host.waitForState((s) => s.signedIn, 20_000);
  expect(restored.userId).toBe(user.id);
  expect(restored.ticket).toBe('none');
  await expect(screen.getByTestId('verify.tokenCache.clientToken')).toHaveText('stored client token: present', { timeout: 15_000 });
  await host.screenshot('token-cache');

  await host.launch({ instance: 'with-email-codes', screen: 'tokenCache' });
  await expect(screen.getByTestId('verify.tokenCache.clientToken')).toHaveText('stored client token: absent', { timeout: 15_000 });
  const fresh = await host.state();
  expect(fresh.signedIn).toBe(false);
});
