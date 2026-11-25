import { test, expect } from '../../fixtures.ts';
import { homeLinks } from '../../native.ts';

test('a signed-in user opens the Account Portal in a web view and is signed in there as the same user', async ({
  host,
  screen,
}) => {
  await host.useSettings({ config: { 'session_transfers.enabled': true } });
  const user = await host.seedUser();
  await host.launch({ signedInAs: user });
  const userId = (await host.app.userId.textContent()) ?? '';
  expect(userId).not.toBe('');
  await host.tap(homeLinks(screen).nativeToWeb);

  await host.evidence('the web view signs the native user in on the Account Portal', async () => {
    await expect(screen.getByTestId('verify.nativeToWeb.webUserId')).toHaveText(userId, { timeout: 30_000 });
    await expect(screen.getByTestId('verify.nativeToWeb.error')).toHaveCount(0);
    await host.screenshot('web-view-signed-in');
  });

  await host.tap(screen.getByTestId('verify.nativeToWeb.done'));
  await host.expectSignedInAs(user);
  await expect(host.app.userId).toHaveText(userId);
});

test('with Native to Web SSO turned off, the web view reports feature_not_enabled', async ({ host, screen }) => {
  const user = await host.seedUser();
  await host.launch({ signedInAs: user });
  await host.tap(homeLinks(screen).nativeToWeb);

  await host.evidence('a transfer on an instance with Native to Web SSO off is refused', async () => {
    await expect(screen.getByTestId('verify.nativeToWeb.error')).toHaveText('feature_not_enabled', { timeout: 30_000 });
    await host.screenshot('web-view-feature-off');
  });
});
